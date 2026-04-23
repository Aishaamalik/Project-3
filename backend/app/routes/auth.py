from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field, field_validator

from app.auth import create_password_hash, create_session, delete_session, get_current_user, verify_password
from app.db import get_db

router = APIRouter(prefix="/auth", tags=["Auth"])


class AuthRequest(BaseModel):
    username: str = Field(min_length=3, max_length=40)
    password: str = Field(min_length=6, max_length=120)

    @field_validator("username")
    @classmethod
    def validate_username(cls, value: str) -> str:
        normalized = value.strip().lower()
        if not normalized:
            raise ValueError("Username is required.")
        return normalized

    @field_validator("password")
    @classmethod
    def validate_password(cls, value: str) -> str:
        if not value.strip():
            raise ValueError("Password is required.")
        return value


class AuthResponse(BaseModel):
    token: str | None = None
    user: dict


@router.post("/signup", response_model=AuthResponse)
def signup(payload: AuthRequest):
    with get_db() as conn:
        existing = conn.execute("SELECT id FROM users WHERE username = ?", (payload.username,)).fetchone()
        if existing:
            raise HTTPException(status_code=409, detail="Username already exists.")

        password_hash, salt = create_password_hash(payload.password)
        cursor = conn.execute(
            """
            INSERT INTO users (username, password_hash, salt, tokens, claimed_free_tokens)
            VALUES (?, ?, ?, 0, 0)
            """,
            (payload.username, password_hash, salt),
        )
        user_id = cursor.lastrowid
        conn.commit()

    return {
        "token": None,
        "user": {"id": user_id, "username": payload.username, "tokens": 0, "claimed_free_tokens": False},
    }


@router.post("/login", response_model=AuthResponse)
def login(payload: AuthRequest):
    with get_db() as conn:
        row = conn.execute(
            "SELECT id, username, password_hash, salt, tokens, claimed_free_tokens FROM users WHERE username = ?",
            (payload.username,),
        ).fetchone()

    if not row or not verify_password(payload.password, row["password_hash"], row["salt"]):
        raise HTTPException(status_code=401, detail="Invalid username or password.")

    token = create_session(row["id"])
    return {
        "token": token,
        "user": {
            "id": row["id"],
            "username": row["username"],
            "tokens": row["tokens"],
            "claimed_free_tokens": bool(row["claimed_free_tokens"]),
        },
    }


@router.get("/me")
def me(user=Depends(get_current_user)):
    return {"user": {k: user[k] for k in ("id", "username", "tokens", "claimed_free_tokens")}}


@router.post("/logout")
def logout(user=Depends(get_current_user)):
    delete_session(user["session_token"])
    return {"ok": True}


@router.post("/claim-free-tokens")
def claim_free_tokens(user=Depends(get_current_user)):
    if user["claimed_free_tokens"]:
        return {"tokens": user["tokens"], "claimed_free_tokens": True}

    with get_db() as conn:
        conn.execute(
            """
            UPDATE users
            SET tokens = tokens + 100, claimed_free_tokens = 1
            WHERE id = ? AND claimed_free_tokens = 0
            """,
            (user["id"],),
        )
        conn.commit()
        row = conn.execute("SELECT tokens, claimed_free_tokens FROM users WHERE id = ?", (user["id"],)).fetchone()

    return {"tokens": row["tokens"], "claimed_free_tokens": bool(row["claimed_free_tokens"])}
