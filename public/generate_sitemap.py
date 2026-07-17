#!/usr/bin/env python3
"""
Генератор sitemap.xml для сайта meatmassagers.ru.

Собирает карту сайта из живого каталога:
  - статические страницы (главная, разделы оборудования, контакты);
  - все категории (/<slug>);
  - все товары внутри категорий (/<slug>/<product-slug>).

Запуск:
    python3 generate_sitemap.py

Результат перезаписывает sitemap.xml в этой же папке (public/),
рядом с .htsecure и .htaccess.
"""

import json
import os
import sys
import urllib.request
from datetime import date
from xml.sax.saxutils import escape

SITE = "https://meatmassagers.ru"
CATALOG_FN = "https://functions.poehali.dev/19e6f517-e766-4ac9-b359-029df68cf0fa"
OUT_FILE = os.path.join(os.path.dirname(os.path.abspath(__file__)), "sitemap.xml")

# Статические страницы: (путь, changefreq, priority)
STATIC_PAGES = [
    ("/", "daily", "1.0"),
    ("/massagers", "weekly", "0.9"),
    ("/injector", "weekly", "0.9"),
    ("/slicers", "weekly", "0.9"),
    ("/ldogenerator", "weekly", "0.9"),
    ("/contacts", "monthly", "0.5"),
]


def fetch_json(url: str) -> dict:
    req = urllib.request.Request(url, headers={"User-Agent": "sitemap-generator"})
    with urllib.request.urlopen(req, timeout=30) as resp:
        return json.loads(resp.read().decode("utf-8"))


def collect_urls() -> list:
    """Возвращает список кортежей (loc, changefreq, priority)."""
    urls = [(SITE + path, cf, pr) for path, cf, pr in STATIC_PAGES]
    seen = {u[0] for u in urls}

    data = fetch_json(f"{CATALOG_FN}?mode=categories")
    categories = data.get("categories", [])
    print(f"Категорий получено: {len(categories)}")

    for cat in categories:
        cat_slug = cat.get("slug")
        if not cat_slug:
            continue
        cat_loc = f"{SITE}/{cat_slug}"
        if cat_loc not in seen:
            urls.append((cat_loc, "weekly", "0.8"))
            seen.add(cat_loc)

        # Товары внутри категории
        try:
            cat_data = fetch_json(f"{CATALOG_FN}?slug={cat_slug}")
        except Exception as e:  # noqa: BLE001
            print(f"  ! Пропуск {cat_slug}: {e}")
            continue

        for group in cat_data.get("groups", []):
            g_slug = group.get("slug", cat_slug)
            for item in group.get("items", []):
                p_slug = item.get("slug")
                if not p_slug:
                    continue
                loc = f"{SITE}/{g_slug}/{p_slug}"
                if loc not in seen:
                    urls.append((loc, "weekly", "0.6"))
                    seen.add(loc)

    return urls


def build_xml(urls: list) -> str:
    today = date.today().isoformat()
    lines = [
        '<?xml version="1.0" encoding="UTF-8"?>',
        '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ]
    for loc, cf, pr in urls:
        lines.append(
            f"  <url><loc>{escape(loc)}</loc>"
            f"<lastmod>{today}</lastmod>"
            f"<changefreq>{cf}</changefreq>"
            f"<priority>{pr}</priority></url>"
        )
    lines.append("</urlset>")
    return "\n".join(lines) + "\n"


def main() -> int:
    try:
        urls = collect_urls()
    except Exception as e:  # noqa: BLE001
        print(f"Ошибка при получении данных каталога: {e}", file=sys.stderr)
        return 1

    xml = build_xml(urls)
    with open(OUT_FILE, "w", encoding="utf-8") as f:
        f.write(xml)

    print(f"Готово: {len(urls)} URL записано в {OUT_FILE}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
