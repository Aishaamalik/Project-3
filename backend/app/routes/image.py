import base64
import os

from dotenv import load_dotenv
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, field_validator
import requests
from app.auth import get_current_user
from app.db import get_db

load_dotenv()

router = APIRouter(tags=["Image"])

CF_DEFAULT_MODEL = "@cf/black-forest-labs/flux-1-schnell"
SUPPORTED_STYLES = {"realistic", "anime", "digital art", "cinematic"}
SUPPORTED_SIZES = {"256x256", "512x512", "1024x1024"}
IMAGE_COST = 10


class ImageRequest(BaseModel):
    prompt: str
    style: str
    size: str
    negative_prompt: str = ""
    seed: int | None = None

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

    @field_validator("negative_prompt")
    @classmethod
    def validate_negative_prompt(cls, value: str) -> str:
        return value.strip()

    @field_validator("seed")
    @classmethod
    def validate_seed(cls, value: int | None) -> int | None:
        if value is None:
            return None
        if value < 0:
            raise ValueError("Seed must be a non-negative integer.")
        return value


class ImageResponse(BaseModel):
    image_url: str
    tokens_left: int


def _extract_image_data_url(response: requests.Response) -> str:
    content_type = response.headers.get("Content-Type", "").split(";")[0].strip().lower()
    if content_type.startswith("image/"):
        image_base64 = base64.b64encode(response.content).decode("utf-8")
        return f"data:{content_type};base64,{image_base64}"

    try:
        payload = response.json()
    except ValueError as exc:
        raise HTTPException(status_code=502, detail="Cloudflare AI returned an unreadable response.") from exc

    result = payload.get("result", payload)
    candidate = None

    if isinstance(result, dict):
        candidate = result.get("image") or result.get("b64_json")
        if not candidate and isinstance(result.get("data"), list) and result["data"]:
            first_item = result["data"][0]
            if isinstance(first_item, dict):
                candidate = first_item.get("b64_json") or first_item.get("image")

    if not candidate or not isinstance(candidate, str):
        raise HTTPException(status_code=502, detail="Cloudflare AI response did not contain image data.")

    if candidate.startswith("data:image/"):
        return candidate

    return f"data:image/png;base64,{candidate}"


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

    account_id = os.getenv("CLOUDFLARE_ACCOUNT_ID", "").strip()
    api_token = os.getenv("CLOUDFLARE_API_TOKEN", "").strip()
    model = os.getenv("CLOUDFLARE_AI_MODEL", CF_DEFAULT_MODEL).strip() or CF_DEFAULT_MODEL
    if not account_id or not api_token:
        raise HTTPException(status_code=500, detail="CLOUDFLARE_ACCOUNT_ID or CLOUDFLARE_API_TOKEN is missing in environment.")

    width, height = [int(dimension) for dimension in payload.size.split("x")]
    enhanced_prompt = (
        f"{payload.prompt}, {payload.style} style, high quality, "
        "focused composition matching the prompt exactly, no unrelated objects"
    )
    endpoint = f"https://api.cloudflare.com/client/v4/accounts/{account_id}/ai/run/{model}"
    request_body = {
        "prompt": enhanced_prompt,
        "width": width,
        "height": height,
    }
    if payload.negative_prompt:
        request_body["negative_prompt"] = payload.negative_prompt
    if payload.seed is not None:
        request_body["seed"] = payload.seed

    try:
        response = requests.post(
            endpoint,
            headers={
                "Authorization": f"Bearer {api_token}",
                "Content-Type": "application/json",
            },
            json=request_body,
            timeout=90,
        )
        response.raise_for_status()
    except requests.Timeout as exc:
        raise HTTPException(status_code=504, detail="Image generation timed out.") from exc
    except requests.RequestException as exc:
        raise HTTPException(status_code=502, detail=f"Upstream image API error: {exc}") from exc

    image_url = _extract_image_data_url(response)
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

    return ImageResponse(image_url=image_url, tokens_left=current_tokens)

