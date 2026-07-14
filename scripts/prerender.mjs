/**
 * SEO-пререндер для внешних сканеров (Topvisor, Screaming Frog, Serpstat и др.),
 * которые НЕ исполняют JavaScript.
 *
 * Что делает: после сборки Vite (папка dist/) создаёт для каждого URL сайта
 * отдельный index.html с УНИКАЛЬНЫМИ <title>, description, canonical и og:*.
 * Пользователь по-прежнему получает обычное SPA, а боты — готовый HTML.
 *
 * Данные берутся из того же бэкенд-фида, что и фронтенд, поэтому теги
 * совпадают один-в-один с тем, что рисует React.
 *
 * Запуск: node scripts/prerender.mjs   (после `vite build`)
 */

import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const DIST = resolve(__dirname, "../dist");
const SITE = "https://meatmassagers.ru";
const CATALOG_FN = "https://functions.poehali.dev/19e6f517-e766-4ac9-b359-029df68cf0fa";
const DEFAULT_IMG = "https://cdn.poehali.dev/files/a80d03fc-2480-4c9b-a141-456c301f7d59.jpg";

// Категории-лендинги: у них отдельные React-страницы, а не CategoryPage.
// subcategory_id -> реальный URL лендинга.
const LANDING_ROUTES = { "229": "massagers", "223": "injector", "230": "slicers", "228": "ldogenerator" };

// Готовые метатеги статичных маршрутов (совпадают с кодом страниц).
const STATIC = {
  "/": {
    title: "Оборудование для мясо- и рыбопереработки от производителя",
    description: "Оборудование для мясной и рыбной переработки от производителя: массажёры, инъекторы, куттеры, шприцы, термокамеры. Доставка и установка по всей России.",
    image: DEFAULT_IMG,
  },
  "/massagers": {
    title: "Массажёры мяса — купить от производителя | meatmassagers.ru",
    description: "Массажёры для мяса вакуумные и с охлаждением для посола и тендеризации. Купить от производителя с гарантией. Доставка и монтаж по всей России. Подбор под задачу.",
    ogTitle: "Вакуумные массажеры для мяса — промышленное оборудование | Техно-Сиб",
    ogDescription: "Вакуумные массажеры для равномерного посола и маринования мяса. Подбор модели под ваш продукт, поставка и сервис.",
    image: DEFAULT_IMG,
  },
  "/injector": {
    title: "Инъекторы для мяса — купить от производителя | meatmassagers.ru",
    description: "Инъекторы для шприцевания мяса рассолом: игольчатые и многоигольные. Купить от производителя с гарантией. Доставка и монтаж по России. Консультация технолога.",
    ogTitle: "Инъекторы для мяса — промышленное оборудование для маринования | Техно-Сиб",
    ogDescription: "Промышленные инъекторы для равномерного маринования мяса. Подбор модели под ваш продукт, поставка и сервис по всей России.",
    image: "https://cdn.poehali.dev/files/31cdb492-7133-4082-ab8b-95564d292c21.jpg",
  },
  "/slicers": {
    title: "Слайсеры для нарезки мяса — купить от производителя",
    description: "Слайсеры для нарезки мяса, колбас и деликатесов на порции и ломтики. Купить от производителя с гарантией. Доставка и установка по всей России. Поможем с выбором.",
    ogTitle: "Слайсеры для нарезки мяса и овощей — промышленное оборудование | Техно-Сиб",
    ogDescription: "Промышленные слайсеры для точной нарезки мяса, рыбы и овощей. Подбор модели под ваш продукт, поставка и сервис по всей России.",
    image: DEFAULT_IMG,
  },
  "/ldogenerator": {
    title: "Льдогенераторы для пищевого производства — купить",
    description: "Льдогенераторы чешуйчатого и гранулированного льда для мясо- и рыбоцехов. Купить от производителя с гарантией. Доставка и монтаж по России. Подбор мощности.",
    ogTitle: "Промышленные льдогенераторы — чешуйчатый и гранулированный лёд | Техно-Сиб",
    ogDescription: "Промышленные льдогенераторы от 90 до 10 000 кг льда в сутки для пищевого производства. Подбор модели под вашу производительность.",
    image: DEFAULT_IMG,
  },
  "/contacts": {
    title: "Контакты — Техносиб | Оборудование для мясо и рыбопереработки",
    description: "Контакты компании Техно-Сиб: телефон 8 800 505-91-24, почта, адреса офисов в Москве и Новосибирске. Оборудование для мясо и рыбопереработки с 2001 года.",
    image: DEFAULT_IMG,
  },
};

const esc = (s) =>
  String(s ?? "")
    .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const stripHtml = (s) => String(s ?? "").replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();

// Description для сниппета: чистый текст, обрезанный до ~160 символов по границе слова.
function snippet(raw, max = 160) {
  const t = stripHtml(raw);
  if (t.length <= max) return t;
  const cut = t.slice(0, max);
  const lastSpace = cut.lastIndexOf(" ");
  return (lastSpace > max * 0.6 ? cut.slice(0, lastSpace) : cut).replace(/[\s.,;:—-]+$/, "") + "…";
}

// ── JSON-LD генераторы (тот же формат, что в src/lib/jsonld.ts) ──
const ORG_ID = `${SITE}/#organization`;
const WEBSITE_ID = `${SITE}/#website`;
const organization = () => ({
  "@type": "Organization", "@id": ORG_ID, name: "meatmassagers.ru", url: `${SITE}/`,
  logo: "https://cdn.poehali.dev/files/b643e2cd-1c2b-461b-b32b-4053b1b9e72b.jpg",
  telephone: "+7 800 505-91-24",
  contactPoint: { "@type": "ContactPoint", contactType: "sales", telephone: "+7 800 505-91-24", areaServed: "RU", availableLanguage: "Russian" },
});
const website = () => ({ "@type": "WebSite", "@id": WEBSITE_ID, url: `${SITE}/`, name: "meatmassagers.ru", inLanguage: "ru-RU", publisher: { "@id": ORG_ID } });
const breadcrumbList = (crumbs) => ({
  "@type": "BreadcrumbList",
  itemListElement: crumbs.map((c, i) => ({ "@type": "ListItem", position: i + 1, name: c.name, item: c.url })),
});
function categoryJsonLd(catUrl, cat, items) {
  const crumbs = [{ name: "Главная", url: `${SITE}/` }];
  if (cat.parent) crumbs.push({ name: cat.parent, url: catUrl });
  crumbs.push({ name: cat.title, url: catUrl });
  const graph = [organization(), website(), breadcrumbList(crumbs)];
  if (items.length) graph.push({
    "@type": "ItemList", "@id": `${catUrl}#itemlist`,
    itemListElement: items.map((it, i) => ({ "@type": "ListItem", position: i + 1, url: `${catUrl}/${it.slug}`, name: it.name })),
  });
  graph.push({
    "@type": "CollectionPage", "@id": `${catUrl}#webpage`, url: catUrl, name: cat.title,
    inLanguage: "ru-RU", isPartOf: { "@id": WEBSITE_ID },
    ...(items.length ? { mainEntity: { "@id": `${catUrl}#itemlist` } } : {}),
  });
  return { "@context": "https://schema.org", "@graph": graph };
}
function productJsonLd(prodUrl, item, cat, desc) {
  const crumbs = [{ name: "Главная", url: `${SITE}/` }];
  if (cat.parent) crumbs.push({ name: cat.parent, url: `${SITE}/${cat.slug}` });
  crumbs.push({ name: cat.title, url: `${SITE}/${cat.slug}` }, { name: item.name, url: prodUrl });
  const offer = { "@type": "Offer", priceCurrency: "RUB", availability: "https://schema.org/InStock", url: prodUrl, seller: { "@id": ORG_ID } };
  if (item.price != null) offer.price = item.price;
  const product = {
    "@type": "Product", "@id": `${prodUrl}#product`, name: item.name, description: desc,
    sku: String(item.id || ""), category: cat.title, offers: offer,
  };
  const imgs = (item.pictures && item.pictures.length ? item.pictures : (item.picture ? [item.picture] : []));
  if (imgs.length) product.image = imgs;
  if (item.vendor) product.brand = { "@type": "Brand", name: item.vendor };
  return { "@context": "https://schema.org", "@graph": [organization(), website(), breadcrumbList(crumbs), product] };
}

// title/description категории — та же логика, что в src/pages/CategoryPage.tsx
function categoryMeta(cat) {
  const name = cat.title;
  const nameLower = name.toLowerCase();
  const description = cat.meta_description ||
    `Купить ${nameLower} от производителя недорого с гарантией. Доставка и установка и по всей России. Более 1000 моделей для мясо и рыбопереработки от ведущих европейских, азиатских и российских производителей.`;
  const title = cat.meta_title ||
    `${name} - Купить ${nameLower} от производителя недорого с гарантией на meatmassagers.ru. Доставка и установка и по всей России.`;
  return { title, description, image: cat.banner_image || DEFAULT_IMG };
}

// title/description товара — та же логика, что в src/pages/CategoryPage.tsx
function productMeta(item) {
  const title = `${item.name} - купить на сайте meatmassagers.ru. Широкий ассортимент оборудования для мясо и рыбопереработки.`;
  const description = (item.description
    ? stripHtml(item.description)
    : `${item.name} — купить от производителя с гарантией. Доставка и установка по всей России.`).slice(0, 500);
  const image = (item.pictures && item.pictures[0]) || item.picture || DEFAULT_IMG;
  return { title, description, image };
}

function renderHtml(template, route, meta) {
  const url = route === "/" ? `${SITE}/` : `${SITE}${route}`;
  const title = esc(meta.title);
  const metaDesc = esc(snippet(meta.description)); // короткий для сниппета
  const ogTitle = esc(meta.ogTitle || meta.title);
  const ogDesc = esc(meta.ogDescription || meta.description);
  const img = esc(meta.image || DEFAULT_IMG);
  const type = meta.ogType || (route.split("/").filter(Boolean).length >= 2 ? "product" : "website");

  const tags = [
    `<meta name="description" content="${metaDesc}">`,
    meta.keywords ? `<meta name="keywords" content="${esc(meta.keywords)}">` : "",
    `<meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1">`,
    `<link rel="canonical" href="${esc(url)}">`,
    `<meta property="og:site_name" content="meatmassagers.ru">`,
    `<meta property="og:locale" content="ru_RU">`,
    `<meta property="og:title" content="${ogTitle}">`,
    `<meta property="og:description" content="${ogDesc}">`,
    `<meta property="og:url" content="${esc(url)}">`,
    `<meta property="og:type" content="${type}">`,
    `<meta property="og:image" content="${img}">`,
    `<meta name="twitter:card" content="summary_large_image">`,
    `<meta name="twitter:title" content="${ogTitle}">`,
    `<meta name="twitter:description" content="${ogDesc}">`,
    `<meta name="twitter:image" content="${img}">`,
    meta.jsonLd ? `<script type="application/ld+json">${JSON.stringify(meta.jsonLd)}</script>` : "",
  ].filter(Boolean).join("\n    ");

  let html = template;
  html = html.replace(/<title>[\s\S]*?<\/title>/i, `<title>${title}</title>`);
  // Удаляем дефолтные теги из шаблона, чтобы не задваивать
  html = html
    .replace(/\s*<meta\s+name="description"[^>]*>/gi, "")
    .replace(/\s*<meta\s+name="keywords"[^>]*>/gi, "")
    .replace(/\s*<meta\s+name="robots"[^>]*>/gi, "")
    .replace(/\s*<meta\s+property="og:title"[^>]*>/gi, "")
    .replace(/\s*<meta\s+property="og:description"[^>]*>/gi, "")
    .replace(/\s*<meta\s+property="og:url"[^>]*>/gi, "")
    .replace(/\s*<meta\s+property="og:type"[^>]*>/gi, "")
    .replace(/\s*<meta\s+property="og:image"(?![:])[^>]*>/gi, "")
    .replace(/\s*<meta\s+property="og:site_name"[^>]*>/gi, "")
    .replace(/\s*<meta\s+property="og:locale"[^>]*>/gi, "")
    .replace(/\s*<meta\s+name="twitter:(card|title|description|image)"[^>]*>/gi, "")
    .replace(/\s*<link\s+rel="canonical"[^>]*>/gi, "");
  html = html.replace("</head>", `    ${tags}\n  </head>`);

  // Уникальный H1 в сыром HTML — для поисковых парсеров без JS.
  // Кладём отдельным элементом сразу после <body>, ВНЕ #root, чтобы React
  // при монтировании его не затирал. Скрыт визуально, но виден роботам.
  if (meta.h1) {
    const h1 = `<h1 style="position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap">${esc(meta.h1)}</h1>`;
    html = html.replace(/<body([^>]*)>/i, `<body$1>\n    ${h1}`);
  }
  return html;
}

function writeRoute(template, route, meta) {
  const html = renderHtml(template, route, meta);
  const dir = route === "/" ? DIST : resolve(DIST, `.${route}`);
  mkdirSync(dir, { recursive: true });
  writeFileSync(resolve(dir, "index.html"), html, "utf8");
}

async function getJson(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
  return res.json();
}

async function main() {
  const templatePath = resolve(DIST, "index.html");
  if (!existsSync(templatePath)) {
    console.error("[prerender] dist/index.html не найден. Сначала запустите `vite build`.");
    process.exit(0);
  }
  const template = readFileSync(templatePath, "utf8");
  let count = 0;

  // 1) Статичные маршруты
  for (const [route, meta] of Object.entries(STATIC)) {
    writeRoute(template, route, meta);
    count++;
  }

  // 2) Категории и товары из фида
  try {
    const catsData = await getJson(`${CATALOG_FN}?categories=1`);
    const groups = catsData.groups || [];

    for (const g of groups) {
      const isLanding = LANDING_ROUTES[String(g.subcategory_id)];
      const slug = isLanding || g.slug;
      if (!slug) continue;

      // Полные данные категории (с описаниями товаров и banner_image)
      let detail = null;
      try {
        detail = await getJson(`${CATALOG_FN}?category=${encodeURIComponent(slug)}`);
      } catch (e) {
        console.warn(`[prerender] нет деталей для /${slug}: ${e.message}`);
      }
      const cat = (detail && detail.category) || { title: g.subcategory, slug };
      const items = (detail && detail.items) || g.items || [];
      const catUrl = `${SITE}/${slug}`;

      // Страницу категории пишем только для НЕ-лендингов (у лендингов свои теги в STATIC)
      if (!isLanding) {
        writeRoute(template, `/${slug}`, {
          ...categoryMeta(cat),
          h1: cat.title,
          jsonLd: categoryJsonLd(catUrl, cat, items),
        });
        count++;
      }

      // Товары
      for (const it of items) {
        if (!it.slug) continue;
        const pm = productMeta(it);
        writeRoute(template, `/${slug}/${it.slug}`, {
          ...pm,
          h1: it.name,
          jsonLd: productJsonLd(`${catUrl}/${it.slug}`, it, cat, pm.description),
        });
        count++;
      }
    }
  } catch (e) {
    console.error("[prerender] не удалось загрузить каталог:", e.message);
  }

  console.log(`[prerender] готово. Сгенерировано страниц с уникальными метатегами: ${count}`);
}

main();