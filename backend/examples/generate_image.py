import os
from pathlib import Path

from huggingface_hub import InferenceClient
from dotenv import load_dotenv


def main() -> None:
    load_dotenv(dotenv_path=Path(__file__).resolve().parents[2] / ".env")
    token = os.environ.get("HF_TOKEN")
    if not token:
        raise RuntimeError("HF_TOKEN is not set. Add it to your environment before running.")

    client = InferenceClient(
        provider="wavespeed",
        api_key=token,
    )

    image = client.text_to_image(
        "A futuristic city skyline at sunset",
        model="black-forest-labs/FLUX.1-dev",
    )

    output_path = "generated_city.png"
    image.save(output_path)
    print(f"Saved image to {output_path}")


if __name__ == "__main__":
    main()
