/**
 * Генератор sitemap.xml — самостоятельный скрипт, не зависит от пре-рендера.
 *
 * Лежит в папке public/ (рядом с .htsecure), поэтому попадает на сервер
 * при деплое и может запускаться там (например, по cron раз в сутки).
 *
 * По умолчанию пишет sitemap.xml в ту же папку, где лежит сам скрипт.
 *
 * Запуск:
 *   node sitemap.mjs                      # пишет sitemap.xml рядом со скриптом
 *   node sitemap.mjs /path/to/sitemap.xml # путь можно задать аргументом
 *   SITEMAP_OUT=/var/www/site/sitemap.xml node sitemap.mjs
 */

import { writeFileSync, mkdirSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const SITE = "https://meatmassagers.ru";
const CATALOG_FN = "https://functions.poehali.dev/19e6f517-e766-4ac9-b359-029df68cf0fa";

// Категории-лендинги: subcategory_id -> реальный URL лендинга.
const LANDING_ROUTES = { "229": "massagers", "223": "injector", "230": "slicers", "228": "ldogenerator" };

// Статичные маршруты сайта: путь -> [priority, changefreq].
const STATIC = {
  "/": ["1.0", "daily"],
  "/massagers": ["0.9", "weekly"],
  "/injector": ["0.9", "weekly"],
  "/slicers": ["0.9", "weekly"],
  "/ldogenerator": ["0.9", "weekly"],
  "/contacts": ["0.5", "monthly"],
};

// Куда писать sitemap: аргумент CLI > переменная окружения > sitemap.xml рядом со скриптом.
const OUT = process.argv[2] || process.env.SITEMAP_OUT || resolve(__dirname, "sitemap.xml");

function esc(s) {
  return String(s ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

async function getJson(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
  return res.json();
}

async function main() {
  const urls = [];
  const seen = new Set();
  const addUrl = (loc, priority, changefreq) => {
    if (seen.has(loc)) return;
    seen.add(loc);
    urls.push({ loc, priority, changefreq });
  };

  // 1) Статичные маршруты
  for (const [route, [priority, changefreq]] of Object.entries(STATIC)) {
    addUrl(route === "/" ? `${SITE}/` : `${SITE}${route}`, priority, changefreq);
  }

  // 2) Категории и товары из фида
  const catsData = await getJson(`${CATALOG_FN}?categories=1`);
  const groups = catsData.groups || [];

  for (const g of groups) {
    const slug = LANDING_ROUTES[String(g.subcategory_id)] || g.slug;
    if (!slug) continue;
    const catUrl = `${SITE}/${slug}`;
    addUrl(catUrl, "0.8", "weekly");

    // Полные данные категории (в ?categories=1 список товаров может быть неполным).
    let items = [];
    try {
      const detail = await getJson(`${CATALOG_FN}?category=${encodeURIComponent(slug)}`);
      items = (detail && detail.items) || [];
    } catch (e) {
      console.warn(`[sitemap] нет деталей для /${slug}: ${e.message}`);
    }
    if (!items.length) items = g.items || [];

    for (const it of items) {
      if (!it.slug) continue;
      addUrl(`${catUrl}/${it.slug}`, "0.6", "weekly");
    }
  }

  const now = new Date();
  const today = now.toISOString().slice(0, 10);
  // Дата и время генерации карты (по Москве) — чтобы видеть, когда файл обновлялся.
  const generatedAt = now.toLocaleString("ru-RU", { timeZone: "Europe/Moscow", hour12: false }) + " МСК";
  const xml =
    `<?xml version="1.0" encoding="UTF-8"?>\n` +
    `<!-- lastupdate: ${generatedAt} | URL: ${urls.length} -->\n` +
    `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
    urls
      .map(
        (u) =>
          `  <url><loc>${esc(u.loc)}</loc><lastmod>${today}</lastmod><changefreq>${u.changefreq}</changefreq><priority>${u.priority}</priority></url>`,
      )
      .join("\n") +
    `\n</urlset>\n`;

  mkdirSync(dirname(OUT), { recursive: true });
  writeFileSync(OUT, xml, "utf8");
  console.log(`[sitemap] готово. URL: ${urls.length}. Файл: ${OUT}`);
}

main().catch((e) => {
  console.error("[sitemap] ошибка:", e.message);
  process.exit(1);
});