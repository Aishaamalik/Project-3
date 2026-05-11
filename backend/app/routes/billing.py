import os
from pathlib import Path

import stripe
from dotenv import load_dotenv
from fastapi import APIRouter, Depends, Header, HTTPException, Request
from pydantic import BaseModel

from app.auth import get_current_user
from app.db import get_db

# Load .env from project root (billing.py is at backend/app/routes/billing.py)
_env_path = Path(__file__).resolve().parent.parent.parent.parent / ".env"
load_dotenv(dotenv_path=_env_path, override=True)

router = APIRouter(prefix="/billing", tags=["Billing"])

stripe.api_key = os.getenv("STRIPE_SECRET_KEY", "")
STRIPE_WEBHOOK_SECRET = os.getenv("STRIPE_WEBHOOK_SECRET", "")

# Frontend origin used for Stripe redirect URLs
FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:5173")

PACKAGES = [
    {
        "id": "starter",
        "name": "Starter Pack",
        "tokens": 200,
        "price_cents": 500,
        "currency": "usd",
        # Create these Price IDs in your Stripe dashboard and set them in .env
        "stripe_price_id": os.getenv("STRIPE_PRICE_STARTER", ""),
    },
    {
        "id": "pro",
        "name": "Pro Pack",
        "tokens": 500,
        "price_cents": 1000,
        "currency": "usd",
        "stripe_price_id": os.getenv("STRIPE_PRICE_PRO", ""),
    },
    {
        "id": "ultimate",
        "name": "Ultimate Pack",
        "tokens": 1200,
        "price_cents": 2000,
        "currency": "usd",
        "stripe_price_id": os.getenv("STRIPE_PRICE_ULTIMATE", ""),
    },
]


class CheckoutRequest(BaseModel):
    package_id: str


@router.get("/packages")
def list_packages():
    # Strip internal stripe_price_id before sending to client
    public = [
        {k: v for k, v in p.items() if k != "stripe_price_id"}
        for p in PACKAGES
    ]
    return {"packages": public}


@router.post("/create-checkout-session")
def create_checkout_session(payload: CheckoutRequest, user=Depends(get_current_user)):
    """
    Creates a Stripe Checkout session and returns the redirect URL.
    The frontend redirects the user to Stripe's hosted checkout page.
    """
    if not stripe.api_key:
        raise HTTPException(
            status_code=503,
            detail="Payment processing is not configured. Please contact support.",
        )

    selected = next((p for p in PACKAGES if p["id"] == payload.package_id), None)
    if not selected:
        raise HTTPException(status_code=404, detail="Package not found.")

    if not selected["stripe_price_id"]:
        raise HTTPException(
            status_code=503,
            detail=f"Stripe price not configured for package '{selected['id']}'.",
        )

    try:
        session = stripe.checkout.Session.create(
            payment_method_types=["card"],
            line_items=[
                {
                    "price": selected["stripe_price_id"],
                    "quantity": 1,
                }
            ],
            mode="payment",
            success_url=f"{FRONTEND_URL}/payment/success?session_id={{CHECKOUT_SESSION_ID}}",
            cancel_url=f"{FRONTEND_URL}/payment/cancel",
            metadata={
                "user_id": str(user["id"]),
                "package_id": selected["id"],
                "tokens": str(selected["tokens"]),
            },
        )
    except stripe.StripeError as exc:
        raise HTTPException(status_code=502, detail=str(exc)) from exc

    # Record the pending payment
    with get_db() as conn:
        conn.execute(
            """
            INSERT OR IGNORE INTO stripe_payments
                (user_id, session_id, package_id, tokens, amount_cents, status)
            VALUES (?, ?, ?, ?, ?, 'pending')
            """,
            (user["id"], session.id, selected["id"], selected["tokens"], selected["price_cents"]),
        )
        conn.commit()

    return {"checkout_url": session.url, "session_id": session.id}


@router.post("/webhook")
async def stripe_webhook(request: Request):
    """
    Stripe sends signed events here after payment.
    Verifies the signature and credits tokens on checkout.session.completed.
    """
    payload = await request.body()
    sig_header = request.headers.get("stripe-signature", "")

    if not STRIPE_WEBHOOK_SECRET:
        raise HTTPException(status_code=503, detail="Webhook secret not configured.")

    try:
        event = stripe.Webhook.construct_event(payload, sig_header, STRIPE_WEBHOOK_SECRET)
    except stripe.errors.SignatureVerificationError as exc:
        raise HTTPException(status_code=400, detail="Invalid webhook signature.") from exc
    except Exception as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc

    if event["type"] == "checkout.session.completed":
        session = event["data"]["object"]
        _fulfill_payment(session)

    return {"received": True}


def _fulfill_payment(session: dict) -> None:
    """Credit tokens to the user after a successful Stripe payment."""
    session_id = session.get("id")
    metadata = session.get("metadata", {})
    user_id = metadata.get("user_id")
    tokens = metadata.get("tokens")

    if not session_id or not user_id or not tokens:
        return

    try:
        user_id = int(user_id)
        tokens = int(tokens)
    except (ValueError, TypeError):
        return

    with get_db() as conn:
        # Idempotency: only fulfill once
        row = conn.execute(
            "SELECT status FROM stripe_payments WHERE session_id = ?",
            (session_id,),
        ).fetchone()

        if not row or row["status"] == "completed":
            return

        conn.execute(
            "UPDATE stripe_payments SET status = 'completed' WHERE session_id = ?",
            (session_id,),
        )
        conn.execute(
            "UPDATE users SET tokens = tokens + ? WHERE id = ?",
            (tokens, user_id),
        )
        conn.commit()


@router.get("/payment-status/{session_id}")
def payment_status(session_id: str, user=Depends(get_current_user)):
    """
    Polled by the frontend success page to confirm payment and get updated token count.
    Falls back to checking Stripe directly if the webhook hasn't fired yet (e.g. local dev).
    """
    with get_db() as conn:
        row = conn.execute(
            "SELECT status, tokens FROM stripe_payments WHERE session_id = ? AND user_id = ?",
            (session_id, user["id"]),
        ).fetchone()

        if not row:
            raise HTTPException(status_code=404, detail="Payment record not found.")

        # If still pending, check Stripe directly (handles local dev where webhooks don't fire)
        if row["status"] == "pending" and stripe.api_key:
            try:
                session = stripe.checkout.Session.retrieve(session_id)
                if session.payment_status == "paid":
                    _fulfill_payment(session.to_dict())
                    # Re-fetch the updated row
                    row = conn.execute(
                        "SELECT status, tokens FROM stripe_payments WHERE session_id = ? AND user_id = ?",
                        (session_id, user["id"]),
                    ).fetchone()
            except stripe.StripeError:
                pass  # Fall through and return current DB status

        updated_tokens = conn.execute(
            "SELECT tokens FROM users WHERE id = ?", (user["id"],)
        ).fetchone()["tokens"]

    return {
        "status": row["status"],
        "tokens_awarded": row["tokens"],
        "tokens": updated_tokens,
    }
