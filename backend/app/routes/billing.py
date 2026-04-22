from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel

from app.auth import get_current_user
from app.db import get_db

router = APIRouter(prefix="/billing", tags=["Billing"])

PACKAGES = [
    {"id": "starter", "name": "Starter Pack", "tokens": 200, "price_cents": 500, "currency": "usd"},
    {"id": "pro", "name": "Pro Pack", "tokens": 500, "price_cents": 1000, "currency": "usd"},
    {"id": "ultimate", "name": "Ultimate Pack", "tokens": 1200, "price_cents": 2000, "currency": "usd"},
]


class CheckoutRequest(BaseModel):
    package_id: str


@router.get("/packages")
def list_packages():
    return {"packages": PACKAGES}


@router.post("/select-package")
def select_package(payload: CheckoutRequest, user=Depends(get_current_user)):
    selected = next((p for p in PACKAGES if p["id"] == payload.package_id), None)
    if not selected:
        raise HTTPException(status_code=404, detail="Package not found.")

    with get_db() as conn:
        conn.execute("UPDATE users SET tokens = tokens + ? WHERE id = ?", (selected["tokens"], user["id"]))
        conn.commit()
        updated_tokens = conn.execute("SELECT tokens FROM users WHERE id = ?", (user["id"],)).fetchone()["tokens"]

    return {
        "message": f"{selected['name']} selected.",
        "selected_package": selected,
        "tokens": updated_tokens,
    }
