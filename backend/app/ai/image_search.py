"""
Image resolution for product/service/hero photos.
Priority:
  1. Static keyword lookup → Unsplash CDN (instant, reliable)
  2. Unsplash Search API (if UNSPLASH_ACCESS_KEY set)
  3. Pollinations.ai AI generation (free — URL triggers lazy generation)

Static map covers all common clinic/dental/salon/gym/hotel/cafe/bakery/retail items
so most generated websites get images immediately with no network delay.
"""
import asyncio
import logging
from urllib.parse import quote

import httpx

from app.config import settings

logger = logging.getLogger(__name__)

CATEGORY_HINTS: dict[str, str] = {
    "retail":     "product store",
    "restaurant": "food dish",
    "bakery":     "baked pastry",
    "salon":      "hair beauty",
    "clinic":     "medical health",
    "cafe":       "coffee beverage",
    "gym":        "fitness workout",
    "hotel":      "hotel luxury",
    "other":      "",
}

_CATEGORY_PROMPT_SUFFIX: dict[str, str] = {
    "restaurant": "restaurant food photography, plated dish, professional lighting",
    "bakery":     "artisan bakery photography, fresh baked, warm lighting",
    "cafe":       "cafe beverage photography, aesthetic, cozy",
    "salon":      "beauty salon photography, professional, clean",
    "clinic":     "healthcare photography, clean, professional, bright",
    "gym":        "modern gym fitness photography, equipment, bright lighting",
    "hotel":      "luxury hotel room photography, elegant, warm lighting",
    "retail":     "product photography, white background, studio lighting",
    "other":      "professional service photography, high quality",
}

# Static lookup: partial keyword → Unsplash photo ID (all verified working)
_PHOTO_MAP: dict[str, str] = {
    # ── Dental / Oral Health ───────────────────────────────────────────
    "teeth cleaning":       "1606811971618-d6eb74e4a89a",
    "teeth whitening":      "1606811971618-d6eb74e4a89a",
    "tooth whitening":      "1606811971618-d6eb74e4a89a",
    "dental cleaning":      "1606811971618-d6eb74e4a89a",
    "root canal":           "1576091160550-2173dba999ef",
    "root canal treatment": "1576091160550-2173dba999ef",
    "tooth extraction":     "1576091160550-2173dba999ef",
    "dental extraction":    "1576091160550-2173dba999ef",
    "braces":               "1606811971618-d6eb74e4a89a",
    "dental braces":        "1606811971618-d6eb74e4a89a",
    "orthodontic":          "1606811971618-d6eb74e4a89a",
    "dental implant":       "1576091160550-2173dba999ef",
    "implant":              "1576091160550-2173dba999ef",
    "cosmetic dentistry":   "1606811971618-d6eb74e4a89a",
    "veneers":              "1606811971618-d6eb74e4a89a",
    "dental veneer":        "1606811971618-d6eb74e4a89a",
    "teeth":                "1606811971618-d6eb74e4a89a",
    "dental":               "1606811971618-d6eb74e4a89a",
    "dentist":              "1606811971618-d6eb74e4a89a",
    "oral":                 "1606811971618-d6eb74e4a89a",
    "crown":                "1576091160550-2173dba999ef",
    "dental crown":         "1576091160550-2173dba999ef",
    "invisalign":           "1606811971618-d6eb74e4a89a",
    "teeth gap":            "1606811971618-d6eb74e4a89a",
    "dental x-ray":         "1576091160550-2173dba999ef",
    "x-ray":                "1576091160550-2173dba999ef",
    "filling":              "1576091160550-2173dba999ef",
    "dental filling":       "1576091160550-2173dba999ef",
    "gum treatment":        "1576091160550-2173dba999ef",
    "gum":                  "1576091160550-2173dba999ef",
    # ── General Medical / Clinic ──────────────────────────────────────
    "consultation":         "1576091160550-2173dba999ef",
    "doctor consultation":  "1576091160550-2173dba999ef",
    "checkup":              "1576091160550-2173dba999ef",
    "general checkup":      "1576091160550-2173dba999ef",
    "health checkup":       "1576091160550-2173dba999ef",
    "blood test":           "1576091160550-2173dba999ef",
    "blood":                "1576091160550-2173dba999ef",
    "injection":            "1576091160550-2173dba999ef",
    "vaccination":          "1576091160550-2173dba999ef",
    "vaccine":              "1576091160550-2173dba999ef",
    "medicine":             "1576091160550-2173dba999ef",
    "prescription":         "1576091160550-2173dba999ef",
    "diagnosis":            "1576091160550-2173dba999ef",
    "ecg":                  "1576091160550-2173dba999ef",
    "ultrasound":           "1576091160550-2173dba999ef",
    "surgery":              "1576091160550-2173dba999ef",
    "physiotherapy":        "1544161515-4ab6ce6db874",
    "physical therapy":     "1544161515-4ab6ce6db874",
    "eye test":             "1576091160550-2173dba999ef",
    "eye checkup":          "1576091160550-2173dba999ef",
    "hearing test":         "1576091160550-2173dba999ef",
    "paediatric":           "1576091160550-2173dba999ef",
    "paediatrics":          "1576091160550-2173dba999ef",
    "gynaecology":          "1576091160550-2173dba999ef",
    "cardiology":           "1576091160550-2173dba999ef",
    "orthopaedic":          "1576091160550-2173dba999ef",
    "dermatology":          "1570172619644-dfd03ed5d881",
    "skin":                 "1570172619644-dfd03ed5d881",
    "skin care":            "1570172619644-dfd03ed5d881",
    "hair loss":            "1522337360788-8b13dee7a37e",
    "hair fall":            "1522337360788-8b13dee7a37e",
    # ── Salon / Beauty ────────────────────────────────────────────────
    "haircut":              "1522337360788-8b13dee7a37e",
    "hair cut":             "1522337360788-8b13dee7a37e",
    "hair color":           "1522337360788-8b13dee7a37e",
    "hair colour":          "1522337360788-8b13dee7a37e",
    "hair colouring":       "1522337360788-8b13dee7a37e",
    "hair coloring":        "1522337360788-8b13dee7a37e",
    "hair treatment":       "1522337360788-8b13dee7a37e",
    "hair spa":             "1522337360788-8b13dee7a37e",
    "keratin":              "1522337360788-8b13dee7a37e",
    "keratin treatment":    "1522337360788-8b13dee7a37e",
    "hair smoothening":     "1522337360788-8b13dee7a37e",
    "highlights":           "1522337360788-8b13dee7a37e",
    "balayage":             "1522337360788-8b13dee7a37e",
    "blow dry":             "1522337360788-8b13dee7a37e",
    "blowout":              "1522337360788-8b13dee7a37e",
    "facial":               "1570172619644-dfd03ed5d881",
    "face facial":          "1570172619644-dfd03ed5d881",
    "face clean up":        "1570172619644-dfd03ed5d881",
    "cleanup":              "1570172619644-dfd03ed5d881",
    "clean up":             "1570172619644-dfd03ed5d881",
    "threading":            "1570172619644-dfd03ed5d881",
    "eyebrow threading":    "1570172619644-dfd03ed5d881",
    "eyebrow":              "1570172619644-dfd03ed5d881",
    "waxing":               "1570172619644-dfd03ed5d881",
    "body waxing":          "1570172619644-dfd03ed5d881",
    "manicure":             "1604654894610-df63bc536371",
    "pedicure":             "1604654894610-df63bc536371",
    "nail art":             "1604654894610-df63bc536371",
    "nail extension":       "1604654894610-df63bc536371",
    "nails":                "1604654894610-df63bc536371",
    "massage":              "1544161515-4ab6ce6db874",
    "body massage":         "1544161515-4ab6ce6db874",
    "head massage":         "1544161515-4ab6ce6db874",
    "bridal makeup":        "1522337360788-8b13dee7a37e",
    "bridal package":       "1522337360788-8b13dee7a37e",
    "makeup":               "1522337360788-8b13dee7a37e",
    "party makeup":         "1522337360788-8b13dee7a37e",
    "pre bridal":           "1522337360788-8b13dee7a37e",
    "pre-bridal":           "1522337360788-8b13dee7a37e",
    "eyelash":              "1570172619644-dfd03ed5d881",
    "lash":                 "1570172619644-dfd03ed5d881",
    "spa":                  "1544161515-4ab6ce6db874",
    "body spa":             "1544161515-4ab6ce6db874",
    "steam":                "1544161515-4ab6ce6db874",
    # ── Gym / Fitness ────────────────────────────────────────────────
    "gym":                  "1534438327276-14e5300c3a48",
    "fitness":              "1534438327276-14e5300c3a48",
    "workout":              "1534438327276-14e5300c3a48",
    "cardio":               "1534438327276-14e5300c3a48",
    "treadmill":            "1534438327276-14e5300c3a48",
    "weights":              "1534438327276-14e5300c3a48",
    "weightlifting":        "1534438327276-14e5300c3a48",
    "strength training":    "1534438327276-14e5300c3a48",
    "personal training":    "1534438327276-14e5300c3a48",
    "personal trainer":     "1534438327276-14e5300c3a48",
    "yoga":                 "1506126613408-eca07ce68773",
    "yoga class":           "1506126613408-eca07ce68773",
    "zumba":                "1534438327276-14e5300c3a48",
    "zumba class":          "1534438327276-14e5300c3a48",
    "crossfit":             "1534438327276-14e5300c3a48",
    "hiit":                 "1534438327276-14e5300c3a48",
    "spinning":             "1534438327276-14e5300c3a48",
    "pilates":              "1506126613408-eca07ce68773",
    "aerobics":             "1534438327276-14e5300c3a48",
    "gym membership":       "1534438327276-14e5300c3a48",
    "monthly plan":         "1534438327276-14e5300c3a48",
    "annual plan":          "1534438327276-14e5300c3a48",
    "quarterly plan":       "1534438327276-14e5300c3a48",
    "membership":           "1534438327276-14e5300c3a48",
    "protein":              "1534438327276-14e5300c3a48",
    "supplement":           "1534438327276-14e5300c3a48",
    # ── Hotel / Accommodation ────────────────────────────────────────
    "deluxe room":          "1631049307264-da0ec9d70304",
    "suite":                "1631049307264-da0ec9d70304",
    "premium suite":        "1631049307264-da0ec9d70304",
    "presidential suite":   "1631049307264-da0ec9d70304",
    "hotel room":           "1631049307264-da0ec9d70304",
    "standard room":        "1631049307264-da0ec9d70304",
    "room":                 "1631049307264-da0ec9d70304",
    "cottage":              "1582653291997-079a1c04e0a1",
    "villa":                "1582653291997-079a1c04e0a1",
    "swimming pool":        "1582653291997-079a1c04e0a1",
    "pool":                 "1582653291997-079a1c04e0a1",
    "banquet":              "1517248135467-4c7edcad34c4",
    "banquet hall":         "1517248135467-4c7edcad34c4",
    "conference":           "1517248135467-4c7edcad34c4",
    "conference hall":      "1517248135467-4c7edcad34c4",
    "hotel restaurant":     "1517248135467-4c7edcad34c4",
    "hotel spa":            "1544161515-4ab6ce6db874",
    "honeymoon package":    "1631049307264-da0ec9d70304",
    "family package":       "1631049307264-da0ec9d70304",
    "breakfast":            "1567620905732-2d1ec7ab7445",
    "buffet breakfast":     "1567620905732-2d1ec7ab7445",
    "bonfire":              "1582653291997-079a1c04e0a1",
    # ── Electronics ────────────────────────────────────────────────────
    "iphone":               "1592750475338-74b7b21085ab",
    "samsung":              "1511707171634-5f897ff02aa9",
    "phone":                "1512054143-3b7693b21ea1",
    "mobile":               "1512054143-3b7693b21ea1",
    "smartphone":           "1512054143-3b7693b21ea1",
    "laptop":               "1496181133206-80ce9b88a853",
    "macbook":              "1517336714731-489689fd1ca8",
    "computer":             "1496181133206-80ce9b88a853",
    "tv":                   "1593359677879-a4bb92f829d1",
    "television":           "1593359677879-a4bb92f829d1",
    "headphone":            "1505740420928-5e560c06d30e",
    "earphone":             "1505740420928-5e560c06d30e",
    "airpod":               "1505740420928-5e560c06d30e",
    "watch":                "1523275335684-37898b6baf30",
    "smartwatch":           "1523275335684-37898b6baf30",
    "camera":               "1516035069371-29a1b244cc32",
    "tablet":               "1544244015-0df4cec08615",
    "ipad":                 "1544244015-0df4cec08615",
    "keyboard":             "1541140532-f5c7c870d6a7",
    "mouse":                "1527864550417-7fd91fc51a46",
    "speaker":              "1545454782-741d8b96acb5",
    "refrigerator":         "1584568694244-14fbdf83bd30",
    "fridge":               "1584568694244-14fbdf83bd30",
    "washing machine":      "1626806787461-102c1bfaaea1",
    "air conditioner":      "1585771724684-38269d6639fd",
    "ac":                   "1585771724684-38269d6639fd",
    "microwave":            "1585771724684-38269d6639fd",
    "printer":              "1496181133206-80ce9b88a853",
    "router":               "1496181133206-80ce9b88a853",
    # ── Food – Indian ──────────────────────────────────────────────────
    "butter chicken":       "1603894584373-5ac82b2ae398",
    "chicken tikka":        "1565557623262-b51c2513a641",
    "biryani":              "1563379091339-03b21ab4a4f8",
    "dal":                  "1567620905732-2d1ec7ab7445",
    "dal makhani":          "1567620905732-2d1ec7ab7445",
    "paneer":               "1585937421612-70a008356fbe",
    "palak paneer":         "1585937421612-70a008356fbe",
    "paneer tikka":         "1565557623262-b51c2513a641",
    "naan":                 "1565557623262-b51c2513a641",
    "roti":                 "1565557623262-b51c2513a641",
    "paratha":              "1565557623262-b51c2513a641",
    "dosa":                 "1567620905732-2d1ec7ab7445",
    "idli":                 "1567620905732-2d1ec7ab7445",
    "samosa":               "1571805341302-f857308690e3",
    "pav bhaji":            "1571805341302-f857308690e3",
    "chole":                "1585937421612-70a008356fbe",
    "rajma":                "1585937421612-70a008356fbe",
    "thali":                "1585937421612-70a008356fbe",
    "curry":                "1603894584373-5ac82b2ae398",
    "tandoori":             "1565557623262-b51c2513a641",
    "tandoori chicken":     "1565557623262-b51c2513a641",
    "kebab":                "1565557623262-b51c2513a641",
    "seekh kebab":          "1565557623262-b51c2513a641",
    "korma":                "1603894584373-5ac82b2ae398",
    "mutton":               "1603894584373-5ac82b2ae398",
    "mutton curry":         "1603894584373-5ac82b2ae398",
    "fish curry":           "1603894584373-5ac82b2ae398",
    "fish fry":             "1603894584373-5ac82b2ae398",
    "prawn":                "1603894584373-5ac82b2ae398",
    "chicken curry":        "1603894584373-5ac82b2ae398",
    "aloo":                 "1585937421612-70a008356fbe",
    "saag":                 "1585937421612-70a008356fbe",
    "halwa":                "1578985545062-69928b1d9587",
    "kheer":                "1578985545062-69928b1d9587",
    "gulab jamun":          "1578985545062-69928b1d9587",
    "rasgulla":             "1578985545062-69928b1d9587",
    "jalebi":               "1578985545062-69928b1d9587",
    "ladoo":                "1578985545062-69928b1d9587",
    "barfi":                "1578985545062-69928b1d9587",
    "mithai":               "1578985545062-69928b1d9587",
    # ── Food – Chinese / Fast Food ─────────────────────────────────────
    "fried rice":           "1603133872878-684f208fb84b",
    "noodle":               "1603133872878-684f208fb84b",
    "hakka noodle":         "1603133872878-684f208fb84b",
    "momos":                "1598514983318-2f5e1a5d5bfa",
    "spring roll":          "1598514983318-2f5e1a5d5bfa",
    "manchurian":           "1603133872878-684f208fb84b",
    "chowmein":             "1603133872878-684f208fb84b",
    # ── Food – Western ─────────────────────────────────────────────────
    "pizza":                "1565299624946-b28f40a0ae38",
    "burger":               "1568901346375-23c9450c58cd",
    "sandwich":             "1528735602780-2552fd46c7ba",
    "pasta":                "1473093295043-cdd812d0e601",
    "spaghetti":            "1473093295043-cdd812d0e601",
    "sushi":                "1617196034234-3ae14e86e69c",
    "salad":                "1512621776951-a57141f2eefd",
    "steak":                "1546069901-522a29d55dda",
    "fried chicken":        "1598103442097-8b74394b95c2",
    "taco":                 "1565299624946-b28f40a0ae38",
    "wrap":                 "1528735602780-2552fd46c7ba",
    "waffle":               "1555507036-ab794f4ffe5e",
    "pancake":              "1567620905732-2d1ec7ab7445",
    "avocado toast":        "1528735602780-2552fd46c7ba",
    "eggs":                 "1567620905732-2d1ec7ab7445",
    "omelette":             "1567620905732-2d1ec7ab7445",
    # ── Bakery / Sweets ────────────────────────────────────────────────
    "cake":                 "1578985545062-69928b1d9587",
    "birthday cake":        "1578985545062-69928b1d9587",
    "wedding cake":         "1578985545062-69928b1d9587",
    "chocolate cake":       "1578985545062-69928b1d9587",
    "custom cake":          "1578985545062-69928b1d9587",
    "photo cake":           "1578985545062-69928b1d9587",
    "fondant cake":         "1578985545062-69928b1d9587",
    "bread":                "1509440159596-0249088772ff",
    "sourdough":            "1509440159596-0249088772ff",
    "croissant":            "1555507036-ab794f4ffe5e",
    "muffin":               "1558961363-fa8fdf82db35",
    "cookie":               "1558961363-fa8fdf82db35",
    "donut":                "1551024709-8f23befc6f87",
    "doughnut":             "1551024709-8f23befc6f87",
    "cupcake":              "1586985289688-ca3cf47d3e6e",
    "pastry":               "1555507036-ab794f4ffe5e",
    "brownie":              "1558961363-fa8fdf82db35",
    "cheesecake":           "1578985545062-69928b1d9587",
    "macaron":              "1558961363-fa8fdf82db35",
    "tart":                 "1555507036-ab794f4ffe5e",
    "pie":                  "1578985545062-69928b1d9587",
    "bun":                  "1509440159596-0249088772ff",
    "bagel":                "1509440159596-0249088772ff",
    "dessert box":          "1578985545062-69928b1d9587",
    "jar cake":             "1578985545062-69928b1d9587",
    # ── Drinks ─────────────────────────────────────────────────────────
    "coffee":               "1509042239860-f550ce710b93",
    "espresso":             "1509042239860-f550ce710b93",
    "cappuccino":           "1534040385115-33943eed2d68",
    "latte":                "1521302200778-33500af6ffb8",
    "flat white":           "1534040385115-33943eed2d68",
    "cold coffee":          "1534040385115-33943eed2d68",
    "cold brew":            "1534040385115-33943eed2d68",
    "matcha":               "1544787219-7f47ccb76574",
    "matcha latte":         "1544787219-7f47ccb76574",
    "hot chocolate":        "1534040385115-33943eed2d68",
    "americano":            "1509042239860-f550ce710b93",
    "tea":                  "1544787219-7f47ccb76574",
    "chai":                 "1544787219-7f47ccb76574",
    "masala chai":          "1544787219-7f47ccb76574",
    "green tea":            "1544787219-7f47ccb76574",
    "juice":                "1621506289937-a8e4df240d0b",
    "fresh juice":          "1621506289937-a8e4df240d0b",
    "smoothie":             "1505252585461-ac02e5b6a4b7",
    "milkshake":            "1579954115563-e72bf1a99598",
    "lassi":                "1579954115563-e72bf1a99598",
    "cola":                 "1533777856969-91a2e0c60326",
    "beer":                 "1535958636474-b021ee887b13",
    "wine":                 "1553361371-9b57b9173e3a",
    "cocktail":             "1553361371-9b57b9173e3a",
    "mocktail":             "1505252585461-ac02e5b6a4b7",
    # ── Clothing ───────────────────────────────────────────────────────
    "shirt":                "1581655353564-df123a1eb820",
    "t-shirt":              "1576566588028-4147f3842f27",
    "dress":                "1595777457583-95e059d581b8",
    "jeans":                "1542272604-787c3835535d",
    "jacket":               "1495105787522-5efd1dc851e3",
    "hoodie":               "1576566588028-4147f3842f27",
    "saree":                "1610854556706-e1a66f12e4ae",
    "kurta":                "1607619056574-7b8d3ee536b2",
    "kurti":                "1607619056574-7b8d3ee536b2",
    "lehenga":              "1610854556706-e1a66f12e4ae",
    "salwar":               "1607619056574-7b8d3ee536b2",
    "dupatta":              "1610854556706-e1a66f12e4ae",
    "ethnic wear":          "1610854556706-e1a66f12e4ae",
    "western wear":         "1576566588028-4147f3842f27",
    "sherwani":             "1507003211169-0a1dd7228f2d",
    "suit":                 "1507003211169-0a1dd7228f2d",
    "blazer":               "1507003211169-0a1dd7228f2d",
    "trousers":             "1542272604-787c3835535d",
    "shorts":               "1542272604-787c3835535d",
    "skirt":                "1595777457583-95e059d581b8",
    # ── Footwear ───────────────────────────────────────────────────────
    "shoes":                "1542291026-7eec264c27ff",
    "sneakers":             "1542291026-7eec264c27ff",
    "heels":                "1543163521-1bf539c55dd2",
    "sandals":              "1543163521-1bf539c55dd2",
    "boots":                "1542291026-7eec264c27ff",
    "slippers":             "1543163521-1bf539c55dd2",
    "chappal":              "1543163521-1bf539c55dd2",
    # ── Bags / Accessories ─────────────────────────────────────────────
    "bag":                  "1548036328-c9fa89d128fa",
    "handbag":              "1548036328-c9fa89d128fa",
    "purse":                "1548036328-c9fa89d128fa",
    "backpack":             "1553062407-98eeb64c6a62",
    "wallet":               "1553062407-98eeb64c6a62",
    "sunglasses":           "1572635149774-2b7e5fa5b0ab",
    "jewelry":              "1515562141209-5f372298ac5c",
    "jewellery":            "1515562141209-5f372298ac5c",
    "necklace":             "1515562141209-5f372298ac5c",
    "bracelet":             "1515562141209-5f372298ac5c",
    "ring":                 "1515562141209-5f372298ac5c",
    "earring":              "1515562141209-5f372298ac5c",
    "bangle":               "1515562141209-5f372298ac5c",
    # ── Furniture / Home ──────────────────────────────────────────────
    "sofa":                 "1555041469-a586c61ea9bc",
    "chair":                "1541123463-7b9f0a55e30f",
    "table":                "1505693314120-0d443867891c",
    "bed":                  "1505693314120-0d443867891c",
    "lamp":                 "1524484485831-a92ffc0de03f",
    "mattress":             "1505693314120-0d443867891c",
    "wardrobe":             "1505693314120-0d443867891c",
    # ── Home Services ────────────────────────────────────────────────
    "plumbing":             "1504917595217-d4dc5ebe6122",
    "electrical":           "1504917595217-d4dc5ebe6122",
    "painting":             "1504917595217-d4dc5ebe6122",
    "carpentry":            "1504917595217-d4dc5ebe6122",
    "cleaning service":     "1504917595217-d4dc5ebe6122",
    "home cleaning":        "1504917595217-d4dc5ebe6122",
    "pest control":         "1504917595217-d4dc5ebe6122",
    "ac service":           "1585771724684-38269d6639fd",
    "ac repair":            "1585771724684-38269d6639fd",
    "appliance repair":     "1504917595217-d4dc5ebe6122",
    # ── Fruits / Vegetables ───────────────────────────────────────────
    "fruit":                "1610832958506-099b4e2b1f50",
    "vegetable":            "1518977676888-f3eb0cebad58",
    "mango":                "1610832958506-099b4e2b1f50",
    "apple":                "1567306226416-28f0efdc88ce",
    "banana":               "1528825871115-3581a5387919",
    "tomato":               "1518977676888-f3eb0cebad58",
    "potato":               "1518977676888-f3eb0cebad58",
    # ── Other ──────────────────────────────────────────────────────────
    "gift":                 "1549465319-3f57a4bc52fc",
    "gift hamper":          "1549465319-3f57a4bc52fc",
    "flower":               "1490750967868-88df5691cc5e",
    "bouquet":              "1490750967868-88df5691cc5e",
    "plant":                "1485955900006-10f4d324d411",
    "book":                 "1512820790803-83ca734da794",
    "toy":                  "1515488042361-ee00e0ddd4e4",
    "sports":               "1593786082358-37d5f5fd4e1f",
    "bicycle":              "1485965120184-e220f721d03e",
    "car":                  "1494976388531-d1058494cdd8",
    "bike":                 "1558618666-fcd25c85cd64",
    "tool":                 "1504917595217-d4dc5ebe6122",
    "pet food":             "1543466835-00a7907e9de1",
    "dog food":             "1543466835-00a7907e9de1",
    "cat food":             "1543466835-00a7907e9de1",
}


def _photo_url(photo_id: str, w: int = 640) -> str:
    return f"https://images.unsplash.com/photo-{photo_id}?auto=format&fit=crop&w={w}&q=80"


async def prewarm_urls(urls: list[str]) -> None:
    """Fire-and-forget: hit each Pollinations.ai URL so images are cached before the browser loads them."""
    pollinations = [u for u in urls if "pollinations.ai" in u]
    if not pollinations:
        return

    async def _fetch(url: str) -> None:
        try:
            async with httpx.AsyncClient(timeout=45.0) as client:
                await client.get(url, follow_redirects=True)
        except Exception:
            pass

    await asyncio.gather(*[_fetch(u) for u in pollinations], return_exceptions=True)


def _lookup(name: str) -> str | None:
    nl = name.lower().strip()
    if nl in _PHOTO_MAP:
        return _photo_url(_PHOTO_MAP[nl])
    for kw, pid in _PHOTO_MAP.items():
        if kw in nl or nl in kw:
            return _photo_url(pid)
    return None


def _pollinations_url(prompt: str, seed: int) -> str:
    """Build a Pollinations.ai URL — free AI image generation, no API key required."""
    encoded = quote(prompt.strip(), safe="")
    return f"https://image.pollinations.ai/prompt/{encoded}?width=640&height=480&seed={seed}&nologo=true&model=flux"


def _fallback_prompt(name: str, category: str) -> str:
    """Programmatic prompt used when no Groq-generated prompt is available."""
    suffix = _CATEGORY_PROMPT_SUFFIX.get(category, _CATEGORY_PROMPT_SUFFIX["other"])
    return f"{name}, {suffix}"


def _product_seed(business_id: int, name: str) -> int:
    return (business_id * 1000 + sum(ord(c) for c in name.lower())) % 9999 + 1


async def _unsplash_api(query: str) -> str:
    try:
        async with httpx.AsyncClient(timeout=5.0) as client:
            resp = await client.get(
                "https://api.unsplash.com/search/photos",
                params={"query": query, "per_page": 1, "orientation": "landscape"},
                headers={"Authorization": f"Client-ID {settings.UNSPLASH_ACCESS_KEY}"},
            )
            if resp.status_code == 200:
                results = resp.json().get("results", [])
                if results:
                    return results[0]["urls"]["regular"] + "&w=640&q=80"
    except Exception as e:
        logger.debug("Unsplash API error: %s", e)
    return ""


async def fetch_image_url(
    name: str,
    category: str = "other",
    ai_prompt: str = "",
    business_id: int = 0,
) -> str:
    """
    Return a relevant image URL for a single product.
    Used by apply_edit when a new product is added via AI instruction.
    """
    # 1. Static lookup — instant
    static = _lookup(name)
    if static:
        return static

    # 2. Unsplash API (if key available)
    if settings.UNSPLASH_ACCESS_KEY:
        hint = CATEGORY_HINTS.get(category, "")
        url = await _unsplash_api(f"{name} {hint}".strip())
        if url:
            return url

    # 3. Pollinations.ai with Groq prompt or programmatic fallback
    prompt = ai_prompt or _fallback_prompt(name, category)
    seed = _product_seed(business_id, name)
    return _pollinations_url(prompt, seed)


async def enrich_products(
    products: list[dict],
    category: str,
    ai_prompts: dict[str, str] | None = None,
    business_id: int = 0,
) -> list[dict]:
    """
    Fill image_url for every product that is missing one.
    ai_prompts: Groq-generated prompt per product name (from generate_image_prompts).
    """
    indices = [i for i, p in enumerate(products) if isinstance(p, dict) and not p.get("image_url")]
    if not indices:
        return products

    result = list(products)
    need_unsplash: list[int] = []

    for i in indices:
        p = products[i]
        if not isinstance(p, dict):
            continue
        name = p.get("name", "")

        # Groq-generated prompt → Pollinations AI image (case-insensitive match)
        if ai_prompts:
            prompt_text = ai_prompts.get(name) or next(
                (v for k, v in ai_prompts.items() if k.lower() == name.lower()), ""
            )
            if prompt_text:
                seed = _product_seed(business_id, name)
                result[i] = {**p, "image_url": _pollinations_url(prompt_text, seed)}
                continue

        # Static keyword lookup
        static = _lookup(name)
        if static:
            result[i] = {**p, "image_url": static}
            continue

        need_unsplash.append(i)

    # Batch-fetch from Unsplash for any remaining (if API key set)
    if need_unsplash and settings.UNSPLASH_ACCESS_KEY:
        hint = CATEGORY_HINTS.get(category, "")
        urls = await asyncio.gather(
            *[_unsplash_api(f"{products[i].get('name', '')} {hint}".strip()) for i in need_unsplash],
            return_exceptions=True,
        )
        for i, url in zip(need_unsplash, urls):
            if isinstance(url, str) and url:
                result[i] = {**result[i], "image_url": url}

    # Pollinations fallback for everything still missing
    for i in need_unsplash:
        if result[i].get("image_url"):
            continue
        name = products[i].get("name", "")
        seed = _product_seed(business_id, name)
        result[i] = {**result[i], "image_url": _pollinations_url(_fallback_prompt(name, category), seed)}

    return result
