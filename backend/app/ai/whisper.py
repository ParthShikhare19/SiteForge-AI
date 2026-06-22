import io
from groq import AsyncGroq
from app.config import settings

_client: AsyncGroq | None = None


def _get_client() -> AsyncGroq:
    global _client
    if _client is None:
        _client = AsyncGroq(api_key=settings.GROQ_API_KEY)
    return _client


async def transcribe_audio(audio_bytes: bytes, filename: str = "audio.webm") -> str:
    client = _get_client()
    transcription = await client.audio.transcriptions.create(
        file=(filename, audio_bytes),
        model=settings.GROQ_WHISPER_MODEL,
        response_format="text",
    )
    return transcription.strip() if isinstance(transcription, str) else transcription.text.strip()
