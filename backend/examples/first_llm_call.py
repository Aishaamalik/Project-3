import os
from pathlib import Path

from openai import OpenAI
from dotenv import load_dotenv


def main() -> None:
    load_dotenv(dotenv_path=Path(__file__).resolve().parents[2] / ".env")
    token = os.environ.get("HF_TOKEN")
    if not token:
        raise RuntimeError("HF_TOKEN is not set. Add it to your environment before running.")

    client = OpenAI(
        base_url="https://router.huggingface.co/v1",
        api_key=token,
    )

    completion = client.chat.completions.create(
        model="moonshotai/Kimi-K2-Instruct-0905",
        messages=[
            {
                "role": "user",
                "content": "Write a dialogue between two characters meeting for the first time.",
            }
        ],
    )

    print(completion.choices[0].message.content)


if __name__ == "__main__":
    main()
