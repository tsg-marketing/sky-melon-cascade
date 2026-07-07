import json
import time
import urllib.request
import xml.etree.ElementTree as ET
from collections import defaultdict

FEED_URL = "https://t-sib.ru/upload/catalog.xml"
PARENT_IDS = {"219", "270"}
PER_SUBCATEGORY = 10
SITE_URL = "https://meatmassagers.ru"

# Категории, у которых уже есть свои лендинги (их НЕ отдаём как /category/*)
LANDING_CAT_IDS = {"229", "223", "230", "228"}  # массажеры, инъекторы, слайсеры, льдогенераторы

_cache = {"ts": 0, "data": None}
CACHE_TTL = 86400  # 24 часа

TRANSLIT = {
    "а": "a", "б": "b", "в": "v", "г": "g", "д": "d", "е": "e", "ё": "e",
    "ж": "zh", "з": "z", "и": "i", "й": "y", "к": "k", "л": "l", "м": "m",
    "н": "n", "о": "o", "п": "p", "р": "r", "с": "s", "т": "t", "у": "u",
    "ф": "f", "х": "h", "ц": "ts", "ч": "ch", "ш": "sh", "щ": "sch",
    "ъ": "", "ы": "y", "ь": "", "э": "e", "ю": "yu", "я": "ya",
}


def _slugify(name: str, ident: str = "") -> str:
    s = (name or "").lower().strip()
    out = []
    for ch in s:
        if ch in TRANSLIT:
            out.append(TRANSLIT[ch])
        elif ch.isascii() and (ch.isalnum()):
            out.append(ch)
        else:
            out.append("-")
    slug = "".join(out)
    while "--" in slug:
        slug = slug.replace("--", "-")
    slug = slug.strip("-")[:60].strip("-")
    if ident:
        short = ident.replace("-", "")[-6:] or "0"
        return f"{slug}-{short}" if slug else short
    return slug or "cat"


def _fetch_feed() -> bytes:
    req = urllib.request.Request(FEED_URL, headers={"User-Agent": "Mozilla/5.0"})
    with urllib.request.urlopen(req, timeout=25) as resp:
        return resp.read()


def _parse_offer(offer) -> dict:
    price_txt = offer.findtext("price")
    try:
        price = float(price_txt) if price_txt else None
    except ValueError:
        price = None
    pictures = [p.text for p in offer.findall("picture") if p.text]
    params = []
    video = None
    for p in offer.findall("param"):
        pname = (p.get("name") or "").strip()
        pval = (p.text or "").strip()
        if not pname or not pval:
            continue
        low = pname.lower()
        if pname == "GUID":
            continue
        if "видео" in low or "video" in low:
            if not video:
                video = pval
            continue
        params.append({"name": pname, "value": pval})
    name = (offer.findtext("name") or "").strip()
    oid = offer.get("id")
    return {
        "id": oid,
        "slug": _slugify(name, oid),
        "name": name,
        "price": price,
        "price_display": (f"{int(price):,}".replace(",", " ") + " \u20bd") if price else None,
        "picture": pictures[0] if pictures else None,
        "pictures": pictures,
        "params": params,
        "video": video,
        "description": (offer.findtext("description") or "").strip(),
        "vendor": (offer.findtext("vendor") or "").strip() or None,
        "url": offer.findtext("url"),
    }


def _build() -> dict:
    """Полная модель: категории + все товары по субкатегориям."""
    raw = _fetch_feed()
    root = ET.fromstring(raw)
    shop = root.find("shop")

    cats = {}
    for c in shop.find("categories").findall("category"):
        cats[c.get("id")] = {"name": (c.text or "").strip(), "parent": c.get("parentId")}

    target_subcats = {cid: info for cid, info in cats.items() if info["parent"] in PARENT_IDS}

    by_subcat = defaultdict(list)
    for offer in shop.find("offers").findall("offer"):
        cat_id = offer.findtext("categoryId")
        if cat_id in target_subcats:
            by_subcat[cat_id].append(_parse_offer(offer))

    categories = []
    for cat_id, info in target_subcats.items():
        items = by_subcat.get(cat_id, [])
        items.sort(key=lambda x: (x["price"] is None, x["price"] if x["price"] is not None else 0))
        # Самая дорогая позиция (для баннера)
        priced = [i for i in items if i["price"] is not None]
        most_expensive = max(priced, key=lambda x: x["price"]) if priced else (items[0] if items else None)
        categories.append({
            "id": cat_id,
            "slug": _slugify(info["name"]),
            "title": info["name"],
            "parent_id": info["parent"],
            "parent": cats.get(info["parent"], {}).get("name", ""),
            "is_landing": cat_id in LANDING_CAT_IDS,
            "count": len(items),
            "banner_image": most_expensive["picture"] if most_expensive else None,
            "items": items,
        })

    categories.sort(key=lambda c: (c["parent_id"], c["title"].lower()))
    return {"categories": categories}


def _get_model() -> dict:
    now = time.time()
    if _cache["data"] is not None and now - _cache["ts"] < CACHE_TTL:
        return _cache["data"]
    data = _build()
    _cache["data"] = data
    _cache["ts"] = now
    return data


def _light_item(it: dict) -> dict:
    """Облегчённый товар для листингов: без описания, но со всеми характеристиками и видео."""
    return {
        "id": it["id"],
        "slug": it["slug"],
        "name": it["name"],
        "price": it["price"],
        "price_display": it["price_display"],
        "picture": it["picture"],
        "pictures": it["pictures"],
        "params": it["params"],
        "video": it.get("video"),
        "vendor": it["vendor"],
    }


def _home_groups(model: dict) -> dict:
    """Совместимость: главная — по 10 товаров в каждой субкатегории (облегчённые)."""
    groups = []
    for c in model["categories"]:
        groups.append({
            "subcategory_id": c["id"],
            "subcategory": c["title"],
            "parent_id": c["parent_id"],
            "parent": c["parent"],
            "slug": c["slug"],
            "items": [_light_item(it) for it in c["items"][:PER_SUBCATEGORY]],
        })
    return {"groups": groups}


def _categories_list(model: dict) -> dict:
    """Список НЕ-лендинговых категорий (для роутинга /category/*)."""
    out = []
    for c in model["categories"]:
        if c["is_landing"]:
            continue
        out.append({
            "id": c["id"],
            "slug": c["slug"],
            "title": c["title"],
            "parent": c["parent"],
            "parent_id": c["parent_id"],
            "count": c["count"],
            "banner_image": c["banner_image"],
        })
    return {"categories": out}


def _category_detail(model: dict, slug: str) -> dict:
    for c in model["categories"]:
        if c["slug"] == slug and not c["is_landing"]:
            most = None
            priced = [i for i in c["items"] if i["price"] is not None]
            if priced:
                most = max(priced, key=lambda x: x["price"])
            elif c["items"]:
                most = c["items"][0]
            return {
                "category": {
                    "id": c["id"], "slug": c["slug"], "title": c["title"],
                    "parent": c["parent"], "parent_id": c["parent_id"],
                    "count": c["count"], "banner_image": c["banner_image"],
                    "banner_product": most,
                },
                "items": c["items"],
            }
    return {"category": None, "items": []}


def _sitemap(model: dict) -> str:
    urls = [
        (f"{SITE_URL}/", "1.0", "daily"),
        (f"{SITE_URL}/massagers", "0.9", "weekly"),
        (f"{SITE_URL}/injector", "0.9", "weekly"),
        (f"{SITE_URL}/slicers", "0.9", "weekly"),
        (f"{SITE_URL}/ldogenerator", "0.9", "weekly"),
        (f"{SITE_URL}/contacts", "0.5", "monthly"),
    ]
    for c in model["categories"]:
        if c["is_landing"]:
            # товары лендингов — под своими путями
            base = {"229": "/massagers", "223": "/injector", "230": "/slicers", "228": "/ldogenerator"}[c["id"]]
            for it in c["items"]:
                urls.append((f"{SITE_URL}{base}/{it['slug']}", "0.7", "weekly"))
            continue
        urls.append((f"{SITE_URL}/{c['slug']}", "0.8", "weekly"))
        for it in c["items"]:
            urls.append((f"{SITE_URL}/{c['slug']}/{it['slug']}", "0.6", "weekly"))

    parts = ['<?xml version="1.0" encoding="UTF-8"?>',
             '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">']
    for loc, prio, freq in urls:
        parts.append(f"  <url><loc>{loc}</loc><changefreq>{freq}</changefreq><priority>{prio}</priority></url>")
    parts.append("</urlset>")
    return "\n".join(parts)


def handler(event: dict, context) -> dict:
    """Каталог из фида t-sib.ru: главная (по 10), список категорий, товары категории и динамический sitemap. Параметры: mode=categories|sitemap, category={slug}."""
    method = event.get("httpMethod", "GET")
    cors = {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
    }
    if method == "OPTIONS":
        return {"statusCode": 200, "headers": cors, "body": ""}

    params = event.get("queryStringParameters") or {}
    mode = params.get("mode")
    category = params.get("category")

    model = _get_model()

    if mode == "sitemap":
        xml = _sitemap(model)
        return {"statusCode": 200, "headers": {**cors, "Content-Type": "application/xml; charset=utf-8"}, "body": xml}

    if mode == "categories":
        body = _categories_list(model)
    elif category:
        body = _category_detail(model, category)
    else:
        body = _home_groups(model)

    return {
        "statusCode": 200,
        "headers": {**cors, "Content-Type": "application/json"},
        "body": json.dumps(body, ensure_ascii=False),
    }