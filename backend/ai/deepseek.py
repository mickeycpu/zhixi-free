import json
import httpx

from config import DEEPSEEK_API_KEY, DEEPSEEK_BASE_URL
from ai.prompts import SYSTEM_PROMPT, build_report_prompt

async def generate_report(stats: dict) -> dict:
    user_prompt = build_report_prompt(stats)

    async with httpx.AsyncClient(timeout=120) as client:
        resp = await client.post(
            f"{DEEPSEEK_BASE_URL}/v1/chat/completions",
            headers={
                "Authorization": f"Bearer {DEEPSEEK_API_KEY}",
                "Content-Type": "application/json",
            },
            json={
                "model": "deepseek-chat",
                "messages": [
                    {"role": "system", "content": SYSTEM_PROMPT},
                    {"role": "user", "content": user_prompt},
                ],
                "temperature": 0.7,
                "max_tokens": 2048,
            },
        )
        resp.raise_for_status()
        data = resp.json()

    markdown = data["choices"][0]["message"]["content"]

    structured = _parse_structured(markdown)

    return {
        "markdown": markdown,
        "structured": structured,
    }

def _parse_structured(markdown: str) -> dict:
    return {
        "what": "",
        "why": "",
        "suggestions": [],
        "risks": [],
        "raw": markdown,
    }
