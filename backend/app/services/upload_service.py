import io
from pathlib import Path
from loguru import logger
from PIL import Image
from fastapi import HTTPException

from app.config import settings

UPLOADS_DIR = Path("static/uploads")
MAX_FILE_SIZE = 5 * 1024 * 1024  # 5 MB
MAX_IMAGE_DIM = 1200              # px — resize larger images
JPEG_QUALITY = 82
ALLOWED_FORMATS = {"JPEG", "PNG", "GIF", "WEBP"}

# Magic-byte signatures to detect real image files
_MAGIC: list[tuple[bytes, str]] = [
    (b"\xff\xd8\xff", "jpg"),
    (b"\x89PNG\r\n\x1a\n", "png"),
    (b"GIF87a", "gif"),
    (b"GIF89a", "gif"),
    (b"RIFF", "webp"),   # RIFF????WEBP
]


def _check_magic(data: bytes) -> str:
    """Return extension if magic bytes match a supported image, else raise 415."""
    for sig, ext in _MAGIC:
        if data[:len(sig)] == sig:
            # Extra check for WebP: bytes 8-12 must be 'WEBP'
            if ext == "webp" and data[8:12] != b"WEBP":
                continue
            return ext
    raise HTTPException(status_code=415, detail="Invalid file type. Only JPEG, PNG, GIF, WebP allowed.")


def _compress(data: bytes, original_ext: str) -> tuple[bytes, str]:
    """Resize to MAX_IMAGE_DIM on longest side and re-encode. Returns (bytes, ext)."""
    try:
        img = Image.open(io.BytesIO(data))
        fmt = img.format or "JPEG"

        if fmt not in ALLOWED_FORMATS:
            raise HTTPException(status_code=415, detail="Unsupported image format after decode.")

        # Resize if too large
        w, h = img.size
        if max(w, h) > MAX_IMAGE_DIM:
            scale = MAX_IMAGE_DIM / max(w, h)
            img = img.resize((int(w * scale), int(h * scale)), Image.LANCZOS)

        # Convert RGBA/P to RGB for JPEG output (GIF/PNG keep transparency)
        out_fmt = fmt
        out_ext = original_ext
        if fmt in ("JPEG",) or (fmt not in ("PNG", "GIF", "WEBP")):
            if img.mode in ("RGBA", "P"):
                img = img.convert("RGB")
            out_fmt = "JPEG"
            out_ext = "jpg"

        buf = io.BytesIO()
        save_kwargs: dict = {"optimize": True}
        if out_fmt == "JPEG":
            save_kwargs["quality"] = JPEG_QUALITY
        img.save(buf, format=out_fmt, **save_kwargs)
        return buf.getvalue(), out_ext
    except HTTPException:
        raise
    except Exception as e:
        logger.warning(f"Image compression failed, using original: {e}")
        return data, original_ext


def _upload_to_s3(data: bytes, filename: str, content_type: str) -> str:
    import boto3
    from botocore.exceptions import BotoCoreError, ClientError

    kwargs: dict = {
        "aws_access_key_id": settings.S3_ACCESS_KEY,
        "aws_secret_access_key": settings.S3_SECRET_KEY,
        "region_name": settings.S3_REGION,
    }
    if settings.S3_ENDPOINT_URL:
        kwargs["endpoint_url"] = settings.S3_ENDPOINT_URL

    s3 = boto3.client("s3", **kwargs)
    put_kwargs: dict = {
        "Bucket": settings.S3_BUCKET,
        "Key": f"uploads/{filename}",
        "Body": data,
        "ContentType": content_type,
    }
    # ACL only works when bucket Owner-Enforced mode is OFF (disabled on R2/many buckets)
    if not settings.S3_ENDPOINT_URL:
        put_kwargs["ACL"] = "public-read"
    try:
        s3.put_object(**put_kwargs)
    except ClientError as e:
        code = e.response.get("Error", {}).get("Code", "")
        if code == "AccessControlListNotSupported":
            # Retry without ACL (bucket uses policy-based public access)
            put_kwargs.pop("ACL", None)
            try:
                s3.put_object(**put_kwargs)
            except (BotoCoreError, ClientError) as e2:
                logger.error(f"S3 upload failed (retry): {e2}")
                raise HTTPException(status_code=500, detail="File upload failed.")
        else:
            logger.error(f"S3 upload failed: {e}")
            raise HTTPException(status_code=500, detail="File upload failed.")
    except BotoCoreError as e:
        logger.error(f"S3 upload failed: {e}")
        raise HTTPException(status_code=500, detail="File upload failed.")

    if settings.S3_ENDPOINT_URL:
        return f"{settings.S3_ENDPOINT_URL.rstrip('/')}/{settings.S3_BUCKET}/uploads/{filename}"
    return f"https://{settings.S3_BUCKET}.s3.{settings.S3_REGION}.amazonaws.com/uploads/{filename}"


def _save_local(data: bytes, filename: str, base_url: str) -> str:
    UPLOADS_DIR.mkdir(parents=True, exist_ok=True)
    (UPLOADS_DIR / filename).write_bytes(data)
    return f"{base_url.rstrip('/')}/static/uploads/{filename}"


def save_upload(raw_bytes: bytes, original_filename: str, base_url: str) -> str:
    """
    Validate, compress, then save to S3 (if configured) or local disk.
    Returns the public URL of the saved file.
    """
    import uuid

    # 1. Size check
    if len(raw_bytes) > MAX_FILE_SIZE:
        raise HTTPException(status_code=413, detail="File too large. Maximum size is 5 MB.")

    # 2. Magic-byte check
    ext = _check_magic(raw_bytes)

    # 3. Compress / resize
    compressed, ext = _compress(raw_bytes, ext)

    # 4. Unique filename
    content_type_map = {"jpg": "image/jpeg", "png": "image/png", "gif": "image/gif", "webp": "image/webp"}
    filename = f"{uuid.uuid4().hex}.{ext}"
    content_type = content_type_map.get(ext, "image/jpeg")

    # 5. Store
    if settings.S3_BUCKET and settings.S3_ACCESS_KEY:
        logger.info(f"Uploading {filename} to S3 bucket {settings.S3_BUCKET}")
        return _upload_to_s3(compressed, filename, content_type)

    logger.info(f"Saving {filename} to local disk")
    return _save_local(compressed, filename, base_url)
