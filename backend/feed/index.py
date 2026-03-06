"""
YML-фид товаров для meatmassagers.ru.
Парсит каталог t-sib.ru и генерирует стандартный YML (Яндекс.Маркет)
с URL товаров вида https://meatmassagers.ru/#product-{id}.
"""
import urllib.request
import xml.etree.ElementTree as ET
import time

FEED_URL = "https://t-sib.ru/upload/catalog.xml"
TARGET_CATEGORIES = {"229", "223"}
SITE_URL = "https://meatmassagers.ru"

CATEGORY_NAMES = {
    "229": "Массажёры мяса",
    "223": "Инъекторы",
}

_cache = None
_cache_ts = 0


def get_source_xml():
    global _cache, _cache_ts
    now = time.time()
    if _cache and now - _cache_ts < 3600:
        return _cache
    req = urllib.request.Request(FEED_URL, headers={"User-Agent": "Mozilla/5.0"})
    with urllib.request.urlopen(req, timeout=25) as resp:
        data = resp.read()
    _cache = data
    _cache_ts = now
    return data


def escape_xml(s: str) -> str:
    return (s
        .replace("&", "&amp;")
        .replace("<", "&lt;")
        .replace(">", "&gt;")
        .replace('"', "&quot;")
        .replace("'", "&apos;"))


def build_yml(xml_data: bytes) -> str:
    root = ET.fromstring(xml_data)
    offers_el = root.find(".//offers")

    lines = []
    lines.append('<?xml version="1.0" encoding="UTF-8"?>')
    lines.append(f'<yml_catalog date="{time.strftime("%Y-%m-%d %H:%M")}">')
    lines.append("<shop>")
    lines.append(f"  <name>Meat Massagers</name>")
    lines.append(f"  <company>meatmassagers.ru</company>")
    lines.append(f"  <url>{SITE_URL}</url>")
    lines.append("  <currencies>")
    lines.append('    <currency id="RUR" rate="1"/>')
    lines.append("  </currencies>")
    lines.append("  <categories>")
    for cat_id, cat_name in CATEGORY_NAMES.items():
        lines.append(f'    <category id="{cat_id}">{escape_xml(cat_name)}</category>')
    lines.append("  </categories>")
    lines.append("  <offers>")

    for offer in (offers_el or []):
        cat_id = (offer.findtext("categoryId") or "").strip()
        if cat_id not in TARGET_CATEGORIES:
            continue

        offer_id = offer.get("id", "")
        pictures = [p.text.strip() for p in offer.findall("picture") if p.text and p.text.strip()]
        if not pictures:
            continue

        name = offer.findtext("name") or ""
        price_str = offer.findtext("price") or ""
        description = offer.findtext("description") or ""

        # Собираем параметры
        params = []
        for p in offer.findall("param"):
            p_name = (p.get("name") or "").strip()
            p_val = (p.text or "").strip()
            if p_name and p_val:
                params.append((p_name, p_val))

        item_url = f"{SITE_URL}/#product-{offer_id}"

        lines.append(f'    <offer id="{offer_id}" available="true">')
        lines.append(f"      <url>{escape_xml(item_url)}</url>")
        if price_str:
            try:
                price_float = float(price_str)
                lines.append(f"      <price>{int(price_float)}</price>")
            except ValueError:
                pass
        lines.append(f"      <currencyId>RUR</currencyId>")
        lines.append(f"      <categoryId>{escape_xml(cat_id)}</categoryId>")
        for pic in pictures:
            lines.append(f"      <picture>{escape_xml(pic)}</picture>")
        lines.append(f"      <name>{escape_xml(name)}</name>")
        if description:
            lines.append(f"      <description><![CDATA[{description}]]></description>")
        for p_name, p_val in params:
            lines.append(f'      <param name="{escape_xml(p_name)}">{escape_xml(p_val)}</param>')
        lines.append("    </offer>")

    lines.append("  </offers>")
    lines.append("</shop>")
    lines.append("</yml_catalog>")

    return "\n".join(lines)


def handler(event: dict, context) -> dict:
    """YML-фид товаров meatmassagers.ru с якорными ссылками на товары сайта"""
    cors = {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
    }

    if event.get("httpMethod") == "OPTIONS":
        return {"statusCode": 200, "headers": cors, "body": ""}

    xml_data = get_source_xml()
    yml_body = build_yml(xml_data)

    return {
        "statusCode": 200,
        "headers": {
            **cors,
            "Content-Type": "application/xml; charset=utf-8",
        },
        "body": yml_body,
    }
