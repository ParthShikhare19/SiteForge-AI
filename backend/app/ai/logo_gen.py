import re
import base64

_SKIP = {"the", "a", "an", "of", "and", "or", "for", "in", "at", "by", "to", "with", "&", "dr", "mr", "mrs", "ms"}


def _initials(name: str) -> str:
    words = [w for w in re.split(r"[\s\-_&.]+", name) if w and w.lower() not in _SKIP and re.search(r"[a-zA-Z]", w)]
    if not words:
        return (name[:2]).upper() if name else "B"
    if len(words) == 1:
        return words[0][:2].upper()
    return (words[0][0] + words[1][0]).upper()


def _lighten(hex_color: str, amount: float = 0.30) -> str:
    h = hex_color.lstrip("#")
    if len(h) == 3:
        h = "".join(c * 2 for c in h)
    r, g, b = int(h[0:2], 16), int(h[2:4], 16), int(h[4:6], 16)
    r = min(255, int(r + (255 - r) * amount))
    g = min(255, int(g + (255 - g) * amount))
    b = min(255, int(b + (255 - b) * amount))
    return f"#{r:02x}{g:02x}{b:02x}"


def _darken(hex_color: str, amount: float = 0.25) -> str:
    h = hex_color.lstrip("#")
    if len(h) == 3:
        h = "".join(c * 2 for c in h)
    r, g, b = int(h[0:2], 16), int(h[2:4], 16), int(h[4:6], 16)
    r = max(0, int(r * (1 - amount)))
    g = max(0, int(g * (1 - amount)))
    b = max(0, int(b * (1 - amount)))
    return f"#{r:02x}{g:02x}{b:02x}"


def generate_logo_svg(business_name: str, accent_color: str = "#7c3aed") -> str:
    inits = _initials(business_name)
    font_size = 88 if len(inits) == 1 else 68
    light = _lighten(accent_color, 0.28)
    dark = _darken(accent_color, 0.20)

    return (
        f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="200" height="200">'
        f"<defs>"
        f'<linearGradient id="g" x1="0" y1="0" x2="1" y2="1">'
        f'<stop offset="0%" stop-color="{light}"/>'
        f'<stop offset="100%" stop-color="{dark}"/>'
        f"</linearGradient>"
        f"</defs>"
        f'<rect width="200" height="200" rx="44" fill="url(#g)"/>'
        f'<rect x="3" y="3" width="194" height="194" rx="42" fill="none" stroke="rgba(255,255,255,0.18)" stroke-width="2.5"/>'
        f'<text x="100" y="108" text-anchor="middle" dominant-baseline="middle"'
        f' font-family="-apple-system,BlinkMacSystemFont,\'Segoe UI\',Arial,sans-serif"'
        f' font-weight="800" font-size="{font_size}" fill="white" letter-spacing="-1">{inits}</text>'
        f"</svg>"
    )


def generate_logo_data_url(business_name: str, accent_color: str = "#7c3aed") -> str:
    svg = generate_logo_svg(business_name, accent_color)
    b64 = base64.b64encode(svg.encode("utf-8")).decode("ascii")
    return f"data:image/svg+xml;base64,{b64}"
