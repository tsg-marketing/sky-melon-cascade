import json
import urllib.request
import xml.etree.ElementTree as ET
from collections import defaultdict

FEED_URL = "https://t-sib.ru/upload/catalog.xml"
PARENT_IDS = {"219", "270"}
PER_SUBCATEGORY = 10

_cache = {"ts": 0, "data": None}
CACHE_TTL = 600  # 10 минут


def _fetch_feed() -> bytes:
    req = urllib.request.Request(FEED_URL, headers={"User-Agent": "Mozilla/5.0"})
    with urllib.request.urlopen(req, timeout=25) as resp:
        return resp.read()


def _build_catalog() -> dict:
    raw = _fetch_feed()
    root = ET.fromstring(raw)
    shop = root.find("shop")

    # Категории: id -> {name, parentId}
    cats = {}
    for c in shop.find("categories").findall("category"):
        cats[c.get("id")] = {"name": (c.text or "").strip(), "parent": c.get("parentId")}

    # Субкатегории, чей родитель входит в PARENT_IDS
    target_subcats = {cid: info for cid, info in cats.items() if info["parent"] in PARENT_IDS}

    by_subcat = defaultdict(list)
    for offer in shop.find("offers").findall("offer"):
        cat_id = offer.findtext("categoryId")
        if cat_id not in target_subcats:
            continue
        price_txt = offer.findtext("price")
        try:
            price = float(price_txt) if price_txt else None
        except ValueError:
            price = None
        pictures = [p.text for p in offer.findall("picture") if p.text]
        params = []
        for p in offer.findall("param"):
            pname = (p.get("name") or "").strip()
            pval = (p.text or "").strip()
            if pname and pname != "GUID" and pval:
                params.append({"name": pname, "value": pval})
        description = (offer.findtext("description") or "").strip()
        by_subcat[cat_id].append({
            "id": offer.get("id"),
            "name": (offer.findtext("name") or "").strip(),
            "price": price,
            "price_display": (f"{int(price):,}".replace(",", " ") + " \u20bd") if price else None,
            "picture": pictures[0] if pictures else None,
            "pictures": pictures,
            "params": params,
            "description": description,
            "vendor": (offer.findtext("vendor") or "").strip() or None,
            "url": offer.findtext("url"),
        })

    groups = []
    for cat_id, items in by_subcat.items():
        # Сортировка по цене по возрастанию: сначала с ценой, потом без
        items.sort(key=lambda x: (x["price"] is None, x["price"] if x["price"] is not None else 0))
        top = items[:PER_SUBCATEGORY]
        parent_id = target_subcats[cat_id]["parent"]
        groups.append({
            "subcategory_id": cat_id,
            "subcategory": target_subcats[cat_id]["name"],
            "parent_id": parent_id,
            "parent": cats.get(parent_id, {}).get("name", ""),
            "items": top,
        })

    # Порядок групп: сначала мясопереработка (219), потом рыба (270), внутри — по алфавиту
    groups.sort(key=lambda g: (g["parent_id"], g["subcategory"].lower()))
    return {"groups": groups}


def handler(event: dict, context) -> dict:
    """Отдаёт товары из фида t-sib.ru: по 10 позиций в каждой субкатегории мясо- и рыбопереработки (parentId 219/270), отсортированных по цене."""
    method = event.get("httpMethod", "GET")
    headers = {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
        "Content-Type": "application/json",
    }
    if method == "OPTIONS":
        return {"statusCode": 200, "headers": headers, "body": ""}

    import time
    now = time.time()
    if _cache["data"] is not None and now - _cache["ts"] < CACHE_TTL:
        data = _cache["data"]
    else:
        data = _build_catalog()
        _cache["data"] = data
        _cache["ts"] = now

    return {
        "statusCode": 200,
        "headers": headers,
        "body": json.dumps(data, ensure_ascii=False),
    }