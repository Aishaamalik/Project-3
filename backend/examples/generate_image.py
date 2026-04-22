import os
from pathlib import Path

from dotenv import load_dotenv
import requests


def main() -> None:
    load_dotenv(dotenv_path=Path(__file__).resolve().parents[2] / ".env")
    account_id = os.environ.get("CLOUDFLARE_ACCOUNT_ID", "").strip()
    token = os.environ.get("CLOUDFLARE_API_TOKEN", "").strip()
    model = os.environ.get("CLOUDFLARE_AI_MODEL", "@cf/black-forest-labs/flux-1-schnell").strip()
    if not account_id or not token:
        raise RuntimeError("CLOUDFLARE_ACCOUNT_ID or CLOUDFLARE_API_TOKEN is not set.")

    response = requests.post(
        f"https://api.cloudflare.com/client/v4/accounts/{account_id}/ai/run/{model}",
        headers={
            "Authorization": f"Bearer {token}",
            "Content-Type": "application/json",
        },
        json={
            "prompt": "A futuristic city skyline at sunset",
            "width": 1024,
            "height": 1024,
        },
        timeout=90,
    )
    response.raise_for_status()

    output_path = "generated_city.png"
    with open(output_path, "wb") as f:
        f.write(response.content)
    print(f"Saved image to {output_path}")


if __name__ == "__main__":
    main()
