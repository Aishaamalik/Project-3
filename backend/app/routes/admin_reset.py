"""
One-shot maintenance: wipe all user-linked rows on the app's SQLite DB.
Enable only when ADMIN_RESET_SECRET is set in the environment.

After use: unset ADMIN_RESET_SECRET (or redeploy without it) to disable the endpoint.
"""

import os
import secrets as py_secrets

from fastapi import APIRouter, Header, HTTPException

from app.db import get_db

router = APIRouter(tags=["Admin"])


def _verify_secret(header_value: str | None) -> None:
    expected = (os.getenv("ADMIN_RESET_SECRET") or "").strip()
    if not expected:
        raise HTTPException(status_code=404, detail="Not found.")
    sent = header_value.strip() if header_value else ""
    if len(sent) != len(expected):
        raise HTTPException(status_code=403, detail="Forbidden.")
    if not py_secrets.compare_digest(sent.encode("utf-8"), expected.encode("utf-8")):
        raise HTTPException(status_code=403, detail="Forbidden.")


@router.post("/admin/clear-users-data")
def clear_users_data(x_admin_reset_secret: str | None = Header(default=None)) -> dict:
    _verify_secret(x_admin_reset_secret)
    with get_db() as conn:
        stripe_n = conn.execute("DELETE FROM stripe_payments").rowcount
        gen_n = conn.execute("DELETE FROM generations").rowcount
        sess_n = conn.execute("DELETE FROM sessions").rowcount
        users_n = conn.execute("DELETE FROM users").rowcount
        conn.commit()

    return {
        "ok": True,
        "deleted": {
            "stripe_payments": stripe_n,
            "generations": gen_n,
            "sessions": sess_n,
            "users": users_n,
        },
    }
