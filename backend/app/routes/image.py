import base64
import io
import os

from dotenv import load_dotenv
from fastapi import APIRouter, Depends, HTTPException
from huggingface_hub import InferenceClient
from pydantic import BaseModel, field_validator
from app.auth import get_current_user
from app.db import get_db

load_dotenv()

router = APIRouter(tags=["Image"])

HF_MODEL = "black-forest-labs/FLUX.1-dev"
HF_PROVIDER = "wavespeed"
SUPPORTED_STYLES = {"realistic", "anime", "digital art", "cinematic"}
SUPPORTED_SIZES = {"256x256", "512x512", "1024x1024"}
IMAGE_COST = 10


class ImageRequest(BaseModel):
    prompt: str
    style: str
    size: str

    @field_validator("prompt")
    @classmethod
    def validate_prompt(cls, value: str) -> str:
        cleaned = value.strip()
        if not cleaned:
            raise ValueError("Prompt is required.")
        return cleaned

    @field_validator("style")
    @classmethod
    def validate_style(cls, value: str) -> str:
        if value not in SUPPORTED_STYLES:
            raise ValueError("Invalid style value.")
        return value

    @field_validator("size")
    @classmethod
    def validate_size(cls, value: str) -> str:
        if value not in SUPPORTED_SIZES:
            raise ValueError("Invalid size value.")
        return value


class ImageResponse(BaseModel):
    image_url: str
    tokens_left: int


@router.post("/generate-image", response_model=ImageResponse)
def generate_image(payload: ImageRequest, user=Depends(get_current_user)) -> ImageResponse:
    with get_db() as conn:
        row = conn.execute("SELECT tokens FROM users WHERE id = ?", (user["id"],)).fetchone()
    if not row or row["tokens"] < IMAGE_COST:
        raise HTTPException(
            status_code=402,
            detail={
                "code": "INSUFFICIENT_TOKENS",
                "message": "Enjoying the app? Continue creating amazing images by getting more tokens.",
            },
        )

    api_key = os.getenv("HUGGINGFACE_API_KEY", "").strip() or os.getenv("HF_TOKEN", "").strip()
    if not api_key:
        raise HTTPException(status_code=500, detail="HUGGINGFACE_API_KEY or HF_TOKEN is missing in environment.")

    width, height = [int(dimension) for dimension in payload.size.split("x")]
    enhanced_prompt = f"{payload.prompt}, {payload.style} style, high quality"

    client = InferenceClient(provider=HF_PROVIDER, api_key=api_key)

    try:
        image = client.text_to_image(
            enhanced_prompt,
            model=HF_MODEL,
            width=width,
            height=height,
        )
    except TimeoutError as exc:
        raise HTTPException(status_code=504, detail="Image generation timed out.") from exc
    except Exception as exc:
        raise HTTPException(status_code=502, detail=f"Upstream image API error: {exc}") from exc

    image_bytes = io.BytesIO()
    image.save(image_bytes, format="PNG")
    image_base64 = base64.b64encode(image_bytes.getvalue()).decode("utf-8")
    with get_db() as conn:
        updated = conn.execute(
            "UPDATE users SET tokens = tokens - ? WHERE id = ? AND tokens >= ?",
            (IMAGE_COST, user["id"], IMAGE_COST),
        )
        conn.commit()
        if updated.rowcount == 0:
            raise HTTPException(
                status_code=402,
                detail={
                    "code": "INSUFFICIENT_TOKENS",
                    "message": "Enjoying the app? Continue creating amazing images by getting more tokens.",
                },
            )
        current_tokens = conn.execute("SELECT tokens FROM users WHERE id = ?", (user["id"],)).fetchone()["tokens"]

    image_url = f"data:image/png;base64,{image_base64}"
    return ImageResponse(image_url=image_url, tokens_left=current_tokens)

