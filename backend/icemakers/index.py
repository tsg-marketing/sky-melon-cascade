"""
Каталог льдогенераторов с хранением в БД.
GET — мгновенно отдаёт сохранённый каталог из базы.
POST (cron, раз в сутки в 11:00 НСК) — парсит XML-фид t-sib.ru
(категория 228) и сохраняет актуальный каталог в базу.
"""
import os
import json
import urllib.request
import xml.etree.ElementTree as ET
import psycopg2

FEED_URL = "https://t-sib.ru/upload/catalog.xml"
ICEMAKER_CATEGORY = "228"
SCHEMA = "t_p69811181_sky_melon_cascade"


def parse_offer(offer: ET.Element):
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


def fetch_icemakers_from_feed():
    req = urllib.request.Request(FEED_URL, headers={"User-Agent": "Mozilla/5.0"})
    with urllib.request.urlopen(req, timeout=25) as resp:
        xml_data = resp.read()

    root = ET.fromstring(xml_data)
    offers_el = root.find(".//offers")

    icemakers = []
    for offer in (offers_el or []):
        cat_id = (offer.findtext("categoryId") or "").strip()
        if cat_id != ICEMAKER_CATEGORY:
            continue
        parsed = parse_offer(offer)
        if parsed:
            icemakers.append(parsed)

    icemakers.sort(key=lambda i: (0 if i["price"] is not None else 1, i["price"] or 0))
    return {"icemakers": icemakers}


def db_connect():
    return psycopg2.connect(os.environ["DATABASE_URL"])


def save_to_db(data: dict):
    conn = db_connect()
    cur = conn.cursor()
    payload = json.dumps(data, ensure_ascii=False).replace("'", "''")
    cur.execute(
        f"INSERT INTO {SCHEMA}.icemakers_cache (id, data, updated_at) "
        f"VALUES (1, '{payload}'::jsonb, now()) "
        f"ON CONFLICT (id) DO UPDATE SET data = EXCLUDED.data, updated_at = now();"
    )
    conn.commit()
    cur.close()
    conn.close()


def load_from_db():
    conn = db_connect()
    cur = conn.cursor()
    cur.execute(f"SELECT data, updated_at FROM {SCHEMA}.icemakers_cache WHERE id = 1;")
    row = cur.fetchone()
    cur.close()
    conn.close()
    if not row:
        return None, None
    return row[0], row[1].isoformat() if row[1] else None


def handler(event: dict, context) -> dict:
    """Каталог льдогенераторов: GET — отдаёт из БД, POST — обновляет из фида (cron 11:00 НСК)"""
    cors = {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
    }
    method = event.get("httpMethod", "GET")

    if method == "OPTIONS":
        return {"statusCode": 200, "headers": cors, "body": ""}

    if method == "POST":
        data = fetch_icemakers_from_feed()
        save_to_db(data)
        return {
            "statusCode": 200,
            "headers": {**cors, "Content-Type": "application/json"},
            "body": json.dumps({"ok": True, "count": len(data["icemakers"])}, ensure_ascii=False),
        }

    data, updated_at = load_from_db()
    if data is None:
        data = fetch_icemakers_from_feed()
        save_to_db(data)
        updated_at = None

    return {
        "statusCode": 200,
        "headers": {**cors, "Content-Type": "application/json"},
        "body": json.dumps({**data, "updated_at": updated_at}, ensure_ascii=False),
    }
