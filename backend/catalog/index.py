"""
Каталог оборудования: парсит XML-фид t-sib.ru и возвращает товары
из категорий 229 (массажеры), 223 (инъекторы), 230 и 459 (слайсеры).
Сортировка по цене по возрастанию, товары без цены — в конце.
Товары без тега picture не включаются.
"""
import urllib.request
import xml.etree.ElementTree as ET
import json
import time

FEED_URL = "https://t-sib.ru/upload/catalog.xml"
TARGET_CATEGORIES = {"229", "223", "230", "459", "228"}

_cache = None
_cache_ts = 0

_TRANSLIT = {
    "а": "a", "б": "b", "в": "v", "г": "g", "д": "d", "е": "e", "ё": "e",
    "ж": "zh", "з": "z", "и": "i", "й": "y", "к": "k", "л": "l", "м": "m",
    "н": "n", "о": "o", "п": "p", "р": "r", "с": "s", "т": "t", "у": "u",
    "ф": "f", "х": "h", "ц": "ts", "ч": "ch", "ш": "sh", "щ": "sch",
    "ъ": "", "ы": "y", "ь": "", "э": "e", "ю": "yu", "я": "ya",
}


def slugify(name: str, offer_id: str) -> str:
    """Транслитерирует название в URL-слаг и добавляет короткий id для уникальности."""
    s = (name or "").lower().strip()
    out = []
    for ch in s:
        if ch in _TRANSLIT:
            out.append(_TRANSLIT[ch])
        elif ch.isalnum() and ord(ch) < 128:
            out.append(ch)
        else:
            out.append("-")
    slug = "".join(out)
    while "--" in slug:
        slug = slug.replace("--", "-")
    slug = slug.strip("-")[:60].strip("-")
    short_id = (offer_id or "").replace("-", "")[-6:] or "0"
    return f"{slug}-{short_id}" if slug else short_id


def parse_offer(offer: ET.Element) -> dict:
    def text(tag):
        el = offer.find(tag)
        return el.text.strip() if el is not None and el.text else None

    pictures = [p.text.strip() for p in offer.findall("picture") if p.text and p.text.strip()]
    if not pictures:
        return None

    hidden_param_names = {"guid", "видео (ссылка)", "видео(ссылка)", "видео ссылка"}
    params = {}
    for p in offer.findall("param"):
        name = (p.get("name") or "").strip()
        val = (p.text or "").strip()
        if name and val and name.lower() not in hidden_param_names:
            params[name] = val

    brand = None
    for key in params:
        if key.lower() == "бренд":
            brand = params[key]
            break

    productivity = None
    for key in params:
        if "производительность" in key.lower():
            productivity = {"name": key, "value": params[key]}
            break

    extra_params = []
    skip_keys = {k for k in params if k.lower() == "бренд"} | (
        {productivity["name"]} if productivity else set()
    )
    for key, val in params.items():
        if key not in skip_keys and len(extra_params) < 3:
            extra_params.append({"name": key, "value": val})

    price_str = text("price")
    price = None
    try:
        if price_str:
            price = float(price_str)
    except (ValueError, TypeError):
        pass

    return {
        "id": offer.get("id"),
        "slug": slugify(text("name") or "", offer.get("id") or ""),
        "name": text("name"),
        "price": price,
        "price_display": f"{int(price):,}".replace(",", " ") + " ₽" if price else None,
        "url": text("url"),
        "description": text("description"),
        "pictures": pictures,
        "brand": brand,
        "productivity": productivity,
        "extra_params": extra_params,
        "all_params": [{"name": k, "value": v} for k, v in params.items()],
        "category_id": text("categoryId"),
    }


def get_catalog():
    global _cache, _cache_ts
    now = time.time()
    if _cache and now - _cache_ts < 3600:
        return _cache

    req = urllib.request.Request(FEED_URL, headers={"User-Agent": "Mozilla/5.0"})
    with urllib.request.urlopen(req, timeout=25) as resp:
        xml_data = resp.read()

    root = ET.fromstring(xml_data)
    offers_el = root.find(".//offers")

    result = {"massagers": [], "injectors": [], "slicers": [], "icemakers": []}

    for offer in (offers_el or []):
        cat_id = (offer.findtext("categoryId") or "").strip()
        if cat_id not in TARGET_CATEGORIES:
            continue
        parsed = parse_offer(offer)
        if not parsed:
            continue
        if cat_id == "229":
            result["massagers"].append(parsed)
        elif cat_id == "223":
            result["injectors"].append(parsed)
        elif cat_id in ("230", "459"):
            result["slicers"].append(parsed)
        elif cat_id == "228":
            result["icemakers"].append(parsed)

    def sort_key(item):
        return (0 if item["price"] is not None else 1, item["price"] or 0)

    result["massagers"].sort(key=sort_key)
    result["injectors"].sort(key=sort_key)
    result["slicers"].sort(key=sort_key)
    result["icemakers"].sort(key=sort_key)

    _cache = result
    _cache_ts = now
    return result


def handler(event: dict, context) -> dict:
    """Возвращает каталог оборудования из XML-фида t-sib.ru"""
    cors = {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
    }

    if event.get("httpMethod") == "OPTIONS":
        return {"statusCode": 200, "headers": cors, "body": ""}

    result = get_catalog()

    return {
        "statusCode": 200,
        "headers": {**cors, "Content-Type": "application/json"},
        "body": json.dumps(result, ensure_ascii=False),
    }