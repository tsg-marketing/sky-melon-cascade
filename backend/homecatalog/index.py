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

# Переопределения категорий: id фида -> {slug, title}
CAT_OVERRIDES = {
    "238": {"title": "Колбасные шприцы", "slug": "kolbasnye-shpritsy"},
    "235": {"title": "Коптильные камеры", "slug": "koptilnye-kamery"},
}

# SEO-метатеги категорий по slug (title и description для <head>)
CAT_SEO = {
    "blokorezki": {"meta_title": "Блокорезки для мяса — купить от производителя", "meta_description": "Блокорезки для измельчения замороженных блоков мяса и рыбы. Купить от производителя с гарантией. Доставка и установка по всей России. Подбор производительности."},
    "volchki": {"meta_title": "Волчки (мясорубки промышленные) — купить от производителя", "meta_description": "Промышленные волчки для измельчения мяса и фарша. Купить от производителя с гарантией. Доставка и монтаж по всей России. Модели от 150 до 5000 кг/час."},
    "zatochnye-stanki": {"meta_title": "Заточные станки для ножей и решёток — купить", "meta_description": "Заточные станки для ножей и решёток волчков и куттеров. Купить от производителя с гарантией. Доставка по всей России. Продлят срок службы режущего инструмента."},
    "klipsatory": {"meta_title": "Клипсаторы для колбасных оболочек — купить от производителя", "meta_description": "Клипсаторы ручные, полуавтоматические и автоматические для закрытия оболочек. Купить от производителя с гарантией. Доставка и монтаж по всей России."},
    "kolbasnye-shpritsy": {"meta_title": "Колбасные шприцы — купить от производителя | meatmassagers.ru", "meta_description": "Вакуумные и поршневые колбасные шприцы для набивки колбас и сосисок. Купить от производителя с гарантией. Доставка и монтаж по России. Более 40 моделей."},
    "koptilnye-kamery": {"meta_title": "Коптильные камеры (термокамеры) — купить от производителя", "meta_description": "Универсальные термокамеры для копчения, варки и запекания мяса и рыбы. Купить от производителя с гарантией. Доставка и монтаж по всей России. Подбор объёма."},
    "kotletnye-avtomaty": {"meta_title": "Котлетные автоматы (формовочные) — купить от производителя", "meta_description": "Формовочные котлетные автоматы для производства котлет и полуфабрикатов. Купить от производителя с гарантией. Доставка и монтаж по России. Подбор форм."},
    "kuttery": {"meta_title": "Куттеры для мяса и фарша — купить от производителя", "meta_description": "Куттеры для тонкого измельчения мяса и приготовления фарша и эмульсий. Купить от производителя с гарантией. Доставка и монтаж по России. Объём чаши от 5 до 500 л."},
    "linii-proizvodstva-polufabrikatov": {"meta_title": "Линии производства полуфабрикатов — от производителя", "meta_description": "Комплектные линии для производства мясных и рыбных полуфабрикатов. Проектирование, поставка, монтаж от производителя с гарантией. Доставка по всей России."},
    "myasorubka": {"meta_title": "Мясорубки промышленные — купить от производителя", "meta_description": "Промышленные мясорубки для цехов и производств. Купить от производителя с гарантией. Доставка и монтаж по всей России. Подбор по производительности."},
    "oborudovanie-dlya-myasnogo-tseha": {"meta_title": "Оборудование для мясного цеха — купить от производителя", "meta_description": "Полное оснащение мясного цеха: волчки, куттеры, шприцы, массажёры. Купить от производителя с гарантией. Проектирование и монтаж под ключ по всей России."},
    "oborudovanie-dlya-proizvodstva-kolbas": {"meta_title": "Оборудование для производства колбас — от производителя", "meta_description": "Линейка оборудования для производства колбас: шприцы, клипсаторы, термокамеры. Купить от производителя с гарантией. Доставка и монтаж под ключ по России."},
    "pelmennye-avtomaty": {"meta_title": "Пельменные автоматы — купить от производителя", "meta_description": "Автоматы для производства пельменей, вареников и хинкали. Купить от производителя с гарантией. Доставка и монтаж по всей России. Подбор производительности."},
    "pily-lentochnye": {"meta_title": "Пилы ленточные для мяса и кости — купить от производителя", "meta_description": "Ленточные пилы для распила мяса, кости и замороженных блоков. Купить от производителя с гарантией. Доставка и монтаж по России. Настольные и напольные модели."},
    "press-separatory": {"meta_title": "Пресс-сепараторы для мяса и рыбы — от производителя", "meta_description": "Пресс-сепараторы для отделения мяса от кости (ММО). Купить от производителя с гарантией. Доставка и монтаж по всей России. Подбор по производительности."},
    "smesiteli-rassola": {"meta_title": "Смесители рассола — купить от производителя", "meta_description": "Смесители для приготовления рассолов и растворов для инъектирования. Купить от производителя с гарантией. Доставка и монтаж по всей России. Подбор объёма."},
    "farshemeshalki": {"meta_title": "Фаршемешалки промышленные — купить от производителя", "meta_description": "Фаршемешалки для перемешивания фарша и мясных смесей. Купить от производителя с гарантией. Доставка и монтаж по всей России. Одно- и двухвальные модели."},
    "shkurosemnye-mashiny": {"meta_title": "Шкуросъёмные машины — купить от производителя", "meta_description": "Шкуросъёмные машины для удаления шкуры и шпика с мяса. Купить от производителя с гарантией. Доставка и монтаж по всей России. Настольные и напольные модели."},
    "golovootsekayuschie-mashiny": {"meta_title": "Головоотсекающие машины для рыбы — от производителя", "meta_description": "Головоотсекающие машины для отделения головы рыбы. Купить от производителя с гарантией. Доставка и монтаж по всей России. Подбор под вид и размер рыбы."},
    "inektory-dlya-ryby": {"meta_title": "Инъекторы для рыбы — купить от производителя", "meta_description": "Инъекторы для введения рассола в рыбу и рыбное филе. Купить от производителя с гарантией. Доставка и монтаж по всей России. Многоигольные модели."},
    "mashiny-dlya-udaleniya-melkoy-kosti": {"meta_title": "Машины для удаления мелкой кости из рыбы — от производителя", "meta_description": "Оборудование для удаления мелкой кости из рыбного филе. Купить от производителя с гарантией. Доставка и монтаж по всей России. Подбор под задачу цеха."},
    "nozhi-dlya-razdelki-i-filetirovaniya-ryby": {"meta_title": "Ножи для разделки и филетирования рыбы — от производителя", "meta_description": "Профессиональные ножи для разделки и филетирования рыбы. Купить от производителя с гарантией. Доставка по всей России. Прочные лезвия для цехов."},
    "oborudovanie-dlya-posola-ryby": {"meta_title": "Оборудование для посола рыбы — купить от производителя", "meta_description": "Оборудование для посола рыбы: массажёры, инъекторы, ёмкости. Купить от производителя с гарантией. Доставка и монтаж по всей России. Подбор под технологию."},
    "oborudovanie-dlya-rybnogo-tseha": {"meta_title": "Оборудование для рыбного цеха — от производителя", "meta_description": "Полное оснащение рыбного цеха: филетировочные, чешуесъёмные, головоотсекающие машины. Купить от производителя. Проектирование и монтаж под ключ по России."},
    "proizvodstvo-rybnogo-farsha-neopress": {"meta_title": "Оборудование для рыбного фарша (неопресс) — от производителя", "meta_description": "Неопрессы для производства рыбного фарша сурими и отделения мяса рыбы. Купить от производителя с гарантией. Доставка и монтаж по всей России."},
    "filetirovochnye-mashiny": {"meta_title": "Филетировочные машины для рыбы — от производителя", "meta_description": "Филетировочные машины для получения рыбного филе. Купить от производителя с гарантией. Доставка и монтаж по всей России. Подбор под вид и размер рыбы."},
    "cheshuesemnye-mashiny": {"meta_title": "Чешуесъёмные машины для рыбы — от производителя", "meta_description": "Чешуесъёмные машины для удаления чешуи с рыбы. Купить от производителя с гарантией. Доставка и монтаж по всей России. Настольные и напольные модели."},
}
# Объединяемые категории: id -> целевой ключ группы
MERGE_MAP = {
    "237": "shkurosemnye-mashiny",
    "283": "shkurosemnye-mashiny",
}
MERGE_META = {
    "shkurosemnye-mashiny": {
        "id": "shkurosemnye-mashiny",
        "slug": "shkurosemnye-mashiny",
        "title": "Шкуросъёмные машины",
        "parent_id": "219",
    },
}

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

    def _make_category(cat_id, slug, title, parent_id, items):
        items.sort(key=lambda x: (x["price"] is None, x["price"] if x["price"] is not None else 0))
        priced = [i for i in items if i["price"] is not None]
        most_expensive = max(priced, key=lambda x: x["price"]) if priced else (items[0] if items else None)
        seo = CAT_SEO.get(slug, {})
        return {
            "id": cat_id,
            "slug": slug,
            "title": title,
            "parent_id": parent_id,
            "parent": cats.get(parent_id, {}).get("name", ""),
            "is_landing": cat_id in LANDING_CAT_IDS,
            "count": len(items),
            "banner_image": most_expensive["picture"] if most_expensive else None,
            "items": items,
            "meta_title": seo.get("meta_title"),
            "meta_description": seo.get("meta_description"),
        }

    categories = []
    merged = defaultdict(list)  # ключ группы -> объединённые товары
    for cat_id, info in target_subcats.items():
        items = by_subcat.get(cat_id, [])
        # Категория "Волчки, мясорубки" (id=221) делится на две по названию товара
        if cat_id == "221":
            myaso = [i for i in items if "мясорубк" in i["name"].lower()]
            volchki = [i for i in items if "волчок" in i["name"].lower() and "мясорубк" not in i["name"].lower()]
            categories.append(_make_category("221", "myasorubka", "Мясорубки", info["parent"], myaso))
            categories.append(_make_category("221-volchki", "volchki", "Волчки", info["parent"], volchki))
            continue
        # Объединяемые категории (напр. дубли "Шкуросъёмные машины") — копим товары
        if cat_id in MERGE_MAP:
            merged[MERGE_MAP[cat_id]].extend(items)
            continue
        ov = CAT_OVERRIDES.get(cat_id, {})
        slug = ov.get("slug") or _slugify(info["name"])
        title = ov.get("title") or info["name"]
        categories.append(_make_category(cat_id, slug, title, info["parent"], items))

    # Собираем объединённые категории
    for key, items in merged.items():
        m = MERGE_META[key]
        categories.append(_make_category(
            m["id"], m["slug"], m["title"], m["parent_id"], items,
        ))

    categories.sort(key=lambda c: (c["parent_id"], c["title"].lower()))

    # Статистика фида: сколько категорий и всего товаров (для главного баннера)
    stats = {
        "categories_count": len(categories),
        "products_count": sum(c["count"] for c in categories),
    }
    return {"categories": categories, "stats": stats}


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
    return {"groups": groups, "stats": model.get("stats", {})}


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
                    "meta_title": c.get("meta_title"),
                    "meta_description": c.get("meta_description"),
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