export interface CatalogItem {
  id: string;
  slug?: string;
  name: string;
  price: number | null;
  price_display: string | null;
  url: string | null;
  description: string | null;
  pictures: string[];
  brand: string | null;
  productivity: { name: string; value: string } | null;
  extra_params: { name: string; value: string }[];
  all_params: { name: string; value: string }[];
  category_id: string;
  video?: string | null;
}

export interface CatalogData {
  massagers?: CatalogItem[];
  injectors?: CatalogItem[];
  slicers?: CatalogItem[];
  icemakers?: CatalogItem[];
  mincers?: CatalogItem[];
  blockcutters?: CatalogItem[];
  patty?: CatalogItem[];
  dumplings?: CatalogItem[];
}

export const CATALOG_URL =
  "https://functions.poehali.dev/7093349e-12b4-4025-a465-82ce3b87b0b2";

export interface CategoryMeta {
  slug: string;
  path: string;
  categoryLink: string;
  dataKey: keyof CatalogData;
  title: string;
  singular: string;
  topic: string;
}

export const CATEGORIES: Record<string, CategoryMeta> = {
  massagers: {
    slug: "massagers",
    path: "/massagers",
    categoryLink: "/massagers",
    dataKey: "massagers",
    title: "Массажёры мяса",
    singular: "массажёр",
    topic: "массажеры",
  },
  injector: {
    slug: "injector",
    path: "/injector",
    categoryLink: "/injector",
    dataKey: "injectors",
    title: "Инъекторы",
    singular: "инъектор",
    topic: "инъекторы",
  },
  slicers: {
    slug: "slicers",
    path: "/slicers",
    categoryLink: "/slicers",
    dataKey: "slicers",
    title: "Слайсеры",
    singular: "слайсер",
    topic: "слайсеры",
  },
  ldogenerator: {
    slug: "ldogenerator",
    path: "/ldogenerator",
    categoryLink: "/ldogenerator",
    dataKey: "icemakers",
    title: "Льдогенераторы",
    singular: "льдогенератор",
    topic: "льдогенераторы",
  },
  volchki: {
    slug: "volchki",
    path: "/volchki",
    categoryLink: "/volchki",
    dataKey: "mincers",
    title: "Волчки (мясорубки промышленные)",
    singular: "волчок",
    topic: "волчки",
  },
  "kotletnyy-avtomat": {
    slug: "kotletnyy-avtomat",
    path: "/kotletnyy-avtomat",
    categoryLink: "/kotletnyy-avtomat",
    dataKey: "patty",
    title: "Котлетные автоматы",
    singular: "котлетный автомат",
    topic: "котлетные автоматы",
  },
  "pelmennye-avtomaty": {
    slug: "pelmennye-avtomaty",
    path: "/pelmennye-avtomaty",
    categoryLink: "/pelmennye-avtomaty",
    dataKey: "dumplings",
    title: "Пельменные автоматы",
    singular: "пельменный автомат",
    topic: "пельменные автоматы",
  },
  blokorezki: {
    slug: "blokorezki",
    path: "/blokorezki",
    categoryLink: "/blokorezki",
    dataKey: "blockcutters",
    title: "Блокорезки",
    singular: "блокорезка",
    topic: "блокорезки",
  },
};

const TRANSLIT: Record<string, string> = {
  а: "a", б: "b", в: "v", г: "g", д: "d", е: "e", ё: "e", ж: "zh", з: "z",
  и: "i", й: "y", к: "k", л: "l", м: "m", н: "n", о: "o", п: "p", р: "r",
  с: "s", т: "t", у: "u", ф: "f", х: "h", ц: "ts", ч: "ch", ш: "sh",
  щ: "sch", ъ: "", ы: "y", ь: "", э: "e", ю: "yu", я: "ya",
};

export function slugify(name: string, id: string): string {
  const s = (name || "").toLowerCase().trim();
  let out = "";
  for (const ch of s) {
    if (TRANSLIT[ch] !== undefined) out += TRANSLIT[ch];
    else if (/[a-z0-9]/.test(ch)) out += ch;
    else out += "-";
  }
  out = out.replace(/-+/g, "-").replace(/^-|-$/g, "").slice(0, 60).replace(/^-|-$/g, "");
  const shortId = (id || "").replace(/-/g, "").slice(-6) || "0";
  return out ? `${out}-${shortId}` : shortId;
}

export function itemSlug(item: CatalogItem): string {
  return item.slug || slugify(item.name, item.id);
}

export function productPath(categorySlug: string, item: CatalogItem): string {
  const cat = CATEGORIES[categorySlug];
  return `${cat.path}/${itemSlug(item)}`;
}

// Приоритетные параметры для листингов: бренд, производительность, мощность, объём.
const PRIORITY_PARAM_WORDS = ["бренд", "производительн", "мощност", "объем", "объём"];

/**
 * Убирает повторы характеристик: в фиде одна и та же строка иногда приходит
 * дважды («Мощность (кВт): 5,5» подряд). Сравниваем по названию без регистра,
 * лишних пробелов и хвостовых знаков препинания.
 */
export function dedupeParams<T extends { name: string; value: string }>(params: T[]): T[] {
  const seen = new Set<string>();
  const result: T[] = [];
  for (const p of params || []) {
    if (isStockParam(p.name)) continue;
    const key = String(p.name).toLowerCase().replace(/\s+/g, " ").replace(/[:\s.]+$/, "").trim();
    if (seen.has(key)) continue;
    seen.add(key);
    result.push(p);
  }
  return result;
}

/**
 * Отбирает параметры для карточки в листинге:
 * исключает GUID, видео и повторы. Сначала берёт приоритетные (бренд,
 * производительность, мощность, объём), затем добирает оставшиеся до `limit` штук.
 */
export function pickListingParams<T extends { name: string; value: string }>(params: T[], limit = 5): T[] {
  const cleaned = dedupeParams(params || []).filter((p) => {
    const n = p.name.toLowerCase();
    return p.name !== "GUID" && !n.includes("видео") && !n.includes("video");
  });
  const isPriority = (p: T) => {
    const n = p.name.toLowerCase();
    return PRIORITY_PARAM_WORDS.some((w) => n.includes(w));
  };
  const priority = cleaned.filter(isPriority);
  const rest = cleaned.filter((p) => !isPriority(p));
  return [...priority, ...rest].slice(0, limit);
}

/**
 * Служебные остатки по складам («Наличие МОСКВА», «Наличие Новосибирск» и т.п.)
 * на сайте не показываем нигде — вырезаем их сразу при загрузке каталога.
 */
const STOCK_CITIES = ["москва", "новосибирск", "челябинск", "склад"];

export function isStockParam(name: string): boolean {
  const n = (name || "").toLowerCase().trim();
  return n.startsWith("наличие") && STOCK_CITIES.some((c) => n.includes(c));
}

function stripStockParams(items: CatalogItem[]): CatalogItem[] {
  return items.map((it) => ({
    ...it,
    extra_params: (it.extra_params || []).filter((p) => !isStockParam(p.name)),
    all_params: (it.all_params || []).filter((p) => !isStockParam(p.name)),
    productivity: it.productivity && isStockParam(it.productivity.name) ? null : it.productivity,
  }));
}

// Версия в ключе: при добавлении новых разделов каталога (волчки, блокорезки)
// её нужно поднять — иначе у посетителей останется старая копия без новых товаров.
const CACHE_KEY = "mm_catalog_cache_v5";

// Каталог на ВСЕХ страницах обновляется одновременно — в фиксированные часы
// (00:00, 08:00, 16:00 UTC), а не «через час после захода» у каждого раздела.
// Так посетитель везде видит один и тот же срез данных.
const REFRESH_INTERVAL = 8 * 60 * 60 * 1000;

/** Момент последнего общего обновления каталога. */
function currentWindow(): number {
  return Math.floor(Date.now() / REFRESH_INTERVAL) * REFRESH_INTERVAL;
}
const ALL_SECTIONS: (keyof CatalogData)[] = [
  "massagers", "injectors", "slicers", "icemakers", "mincers", "blockcutters", "patty", "dumplings",
];

const memoryCache: CatalogData = {};
const sectionPromises: Partial<Record<keyof CatalogData, Promise<CatalogData>>> = {};

function storageKey(section: keyof CatalogData) {
  return `${CACHE_KEY}_${section}`;
}

function readSection(section: keyof CatalogData): CatalogItem[] | null {
  if (memoryCache[section]?.length) return memoryCache[section]!;
  for (const store of [sessionStorage, localStorage]) {
    try {
      const raw = store.getItem(storageKey(section));
      if (!raw) continue;
      const parsed = JSON.parse(raw) as { ts: number; data: CatalogItem[] };
      // Копия устарела, если сделана до последнего общего окна обновления.
      if (parsed.ts < currentWindow()) continue;
      if (!parsed.data?.length) continue;
      const clean = stripStockParams(parsed.data);
      memoryCache[section] = clean;
      return clean;
    } catch {
      /* ignore */
    }
  }
  return null;
}

function writeSection(section: keyof CatalogData, items: CatalogItem[]) {
  memoryCache[section] = items;
  const payload = JSON.stringify({ ts: Date.now(), data: items });
  try { sessionStorage.setItem(storageKey(section), payload); } catch { /* лимит storage */ }
  try { localStorage.setItem(storageKey(section), payload); } catch { /* лимит storage */ }
}

/**
 * Загружает каталог по разделам: страница тянет только свою категорию,
 * поэтому ответ остаётся небольшим, а повторные визиты берут данные из кэша.
 * Без указания раздела (карточка товара) грузятся все разделы параллельно.
 */
export function fetchCatalog(requiredKey?: keyof CatalogData): Promise<CatalogData> {
  const sections = requiredKey ? [requiredKey] : ALL_SECTIONS;

  const jobs = sections.map((section) => {
    const cached = readSection(section);
    if (cached) return Promise.resolve({ [section]: cached } as CatalogData);
    if (sectionPromises[section]) return sectionPromises[section]!;

    const job = fetch(`${CATALOG_URL}?section=${section}`)
      .then((r) => r.json())
      .then((d: CatalogData) => {
        const items = stripStockParams(d[section] || []);
        if (items.length) writeSection(section, items);
        return { [section]: items } as CatalogData;
      })
      .catch((e) => {
        delete sectionPromises[section];
        throw e;
      });

    sectionPromises[section] = job;
    return job;
  });

  // Для карточки товара часть разделов может не ответить — это не должно ломать страницу.
  return Promise.allSettled(jobs).then((results) => {
    const merged: CatalogData = {};
    let ok = false;
    for (const r of results) {
      if (r.status === "fulfilled") { Object.assign(merged, r.value); ok = true; }
    }
    if (!ok) throw new Error("catalog unavailable");
    return merged;
  });
}