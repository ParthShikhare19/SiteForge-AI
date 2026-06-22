import json
import logging
from pathlib import Path
from mistralai import Mistral, SDKError
from fastapi import HTTPException
from app.config import settings

logger = logging.getLogger(__name__)

_client: Mistral | None = None


def _get_client() -> Mistral:
    global _client
    if _client is None:
        if not settings.MISTRAL_API_KEY:
            raise HTTPException(status_code=500, detail="MISTRAL_API_KEY is not configured.")
        _client = Mistral(api_key=settings.MISTRAL_API_KEY)
    return _client


_prompts_dir = Path(__file__).parent / "prompts"


def _load_prompt(name: str) -> str:
    return (_prompts_dir / name).read_text()


def _handle_error(e: Exception) -> None:
    if isinstance(e, SDKError):
        status = getattr(e, "status_code", None)
        if status == 401:
            raise HTTPException(status_code=401, detail="Invalid Mistral API key. Check MISTRAL_API_KEY in your .env file.")
        if status == 429:
            raise HTTPException(status_code=429, detail="Mistral rate limit reached. Please wait a moment and try again.")
        raise HTTPException(status_code=502, detail=f"Mistral API error: {e}")
    raise HTTPException(status_code=500, detail=str(e))


async def _chat(prompt: str, model: str, temperature: float = 0.4, max_tokens: int = 2000) -> dict:
    """Single chat completion returning parsed JSON. Raises HTTPException on failure."""
    client = _get_client()
    try:
        response = await client.chat.complete_async(
            model=model,
            messages=[{"role": "user", "content": prompt}],
            temperature=temperature,
            response_format={"type": "json_object"},
            max_tokens=max_tokens,
        )
        return json.loads(response.choices[0].message.content)
    except json.JSONDecodeError as e:
        logger.warning("Mistral returned invalid JSON: %s", e)
        return {}
    except SDKError as e:
        _handle_error(e)
    except Exception as e:
        logger.error("Mistral call failed: %s", e)
        return {}
    return {}


async def extract_business_data(transcript: str) -> dict:
    prompt = _load_prompt("extract_business.txt").replace("{transcript}", transcript)
    return await _chat(prompt, model=settings.MISTRAL_CHAT_MODEL, temperature=0.1, max_tokens=1500)


async def generate_website_content(
    business_name: str,
    category: str,
    description: str,
    product_names: list[str],
) -> dict:
    """
    Generate category-appropriate colors, hero copy, about content, features,
    testimonials, and section labels in one Mistral call.
    Returns a partial website_json dict; caller merges with static defaults as fallback.
    """
    items = "\n".join(f"- {n}" for n in product_names) if product_names else "(none)"
    prompt = f"""Generate website content for a {category} business. Make it unique, professional, and tailored to the specific business.

Business name: {business_name}
Category: {category}
Description / preferences: {description or "none"}
Products / Services:
{items}

Return only valid JSON (no markdown):
{{
  "theme_color": "<primary dark hex — see color guide below>",
  "accent_color": "<bright accent hex — see color guide below>",
  "hero_headline": "<5-9 word punchy tagline specific to this exact business>",
  "hero_subheadline": "<1-2 sentences, 20-30 words — what makes this business special and unique>",
  "hero_badge": "<2-4 word badge like 'Open Now', 'Book Today', 'Award-Winning'>",
  "cta_secondary": "<3-5 word button text like 'View Our Services', 'See Our Menu'>",
  "about_content": "<2-3 sentences, 40-60 words — authentic, warm story about this business>",
  "about_highlights": ["<specific point 1>", "<specific point 2>", "<specific point 3>", "<specific point 4>"],
  "features": [
    {{"id": "f1", "icon": "<pick from: shield/truck/refresh/tag/star/phone/check/heart/leaf/clock/gift/flame/award/users/utensils/cake/sparkles>", "title": "<3-4 words>", "description": "<8-12 words>"}},
    {{"id": "f2", "icon": "...", "title": "...", "description": "..."}},
    {{"id": "f3", "icon": "...", "title": "...", "description": "..."}},
    {{"id": "f4", "icon": "...", "title": "...", "description": "..."}}
  ],
  "testimonials": [
    {{"id": "t1", "name": "<Indian full name>", "text": "<specific, authentic 25-35 word review that mentions the business type>", "rating": 5, "role": "<e.g. Regular Patient, Loyal Customer, Food Lover>"}},
    {{"id": "t2", "name": "...", "text": "...", "rating": 5, "role": "..."}},
    {{"id": "t3", "name": "...", "text": "...", "rating": 5, "role": "..."}}
  ],
  "products_title": "<e.g. 'Our Dental Services', 'Our Menu', 'Our Products', 'Our Treatments'>",
  "products_subtitle": "<e.g. 'What We Offer', 'This Week', 'Explore Our Range'>"
}}

COLOR GUIDE (follow strictly unless description overrides):
clinic/dental/medical → #0f4c81 + #059669
salon/beauty/spa → #1a0a1e + #d4af37
restaurant/dhaba → #1c1917 + #d97706
cafe/coffee → #3d1f0d + #d97706
bakery/sweets → #be185d + #f59e0b
hotel/resort → #1e3a5f + #c9a227
gym/fitness → #111827 + #ef4444
retail/electronics/clothing → #312e81 + #7c3aed
other/general → #1e293b + #3b82f6

If description mentions: "luxury" → dark + gold; "minimal" → muted; "vibrant" → bright accent; "pastel" → soft tones.
Write content specifically about {business_name} — avoid generic filler phrases."""

    return await _chat(
        prompt,
        model=settings.MISTRAL_CHAT_MODEL,
        temperature=0.7,
        max_tokens=1500,
    )


async def generate_image_prompts(
    business_name: str,
    category: str,
    description: str,
    product_names: list[str],
) -> dict:
    """
    Generate photography prompts for hero banner + every product in one call.
    Returns: {"hero": "...", "products": {"Product Name": "...", ...}}
    """
    items = "\n".join(f"- {n}" for n in product_names) if product_names else "(none)"
    prompt = f"""Generate image generation prompts for a {category} business website.

Business: {business_name}
Category: {category}
Description: {description or "N/A"}
Products/Items:
{items}

Return JSON:
{{"hero": "<20-word prompt for professional hero banner photo>", "products": {{"<product name>": "<15-word product photo prompt>"}}}}

Rules:
- Prompts describe photo composition, lighting, style — not the business itself
- Food: mention plating, garnish, steam, bowl/plate style, warm lighting
- Products: studio lighting, clean background, professional
- Hero: atmosphere, interior/exterior mood, colours
- No brand names. JSON only."""

    return await _chat(
        prompt,
        model=settings.MISTRAL_FAST_MODEL,
        temperature=0.6,
        max_tokens=800,
    )


async def parse_edit_instruction(instruction: str, website_json: dict) -> dict:
    prompt = _load_prompt("edit_website.txt")
    prompt = prompt.replace("{instruction}", instruction)
    prompt = prompt.replace("{website_json}", json.dumps(website_json, indent=2))
    return await _chat(
        prompt,
        model=settings.MISTRAL_CHAT_MODEL,
        temperature=0.2,
        max_tokens=1000,
    )
