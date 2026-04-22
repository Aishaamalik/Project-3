import hashlib
import secrets

from fastapi import Header, HTTPException

from app.db import get_db


def _hash_password(password: str, salt: str) -> str:
    return hashlib.pbkdf2_hmac("sha256", password.encode("utf-8"), salt.encode("utf-8"), 100_000).hex()


def create_password_hash(password: str) -> tuple[str, str]:
    salt = secrets.token_hex(16)
    return _hash_password(password, salt), salt


def verify_password(password: str, password_hash: str, salt: str) -> bool:
    return secrets.compare_digest(_hash_password(password, salt), password_hash)


def create_session(user_id: int) -> str:
    token = secrets.token_urlsafe(40)
    with get_db() as conn:
        conn.execute("INSERT INTO sessions (token, user_id) VALUES (?, ?)", (token, user_id))
        conn.commit()
    return token


def delete_session(token: str) -> None:
    with get_db() as conn:
        conn.execute("DELETE FROM sessions WHERE token = ?", (token,))
        conn.commit()


def get_current_user(authorization: str | None = Header(default=None)):
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Missing or invalid authorization header.")

    token = authorization.replace("Bearer ", "", 1).strip()
    if not token:
        raise HTTPException(status_code=401, detail="Missing bearer token.")

    with get_db() as conn:
        row = conn.execute(
            """
            SELECT u.id, u.username, u.tokens, u.claimed_free_tokens
            FROM sessions s
            JOIN users u ON u.id = s.user_id
            WHERE s.token = ?
            """,
            (token,),
        ).fetchone()

    if not row:
        raise HTTPException(status_code=401, detail="Session expired. Please log in again.")

    return {
        "id": row["id"],
        "username": row["username"],
        "tokens": row["tokens"],
        "claimed_free_tokens": bool(row["claimed_free_tokens"]),
        "session_token": token,
    }
