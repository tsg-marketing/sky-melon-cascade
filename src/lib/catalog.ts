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
 * Отбирает параметры для карточки в листинге:
 * исключает GUID и видео. Сначала берёт приоритетные (бренд, производительность,
 * мощность, объём), затем добирает любые оставшиеся параметры до `limit` штук.
 */
export function pickListingParams<T extends { name: string; value: string }>(params: T[], limit = 5): T[] {
  const cleaned = (params || []).filter((p) => {
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

const CACHE_KEY = "mm_catalog_cache";
const CACHE_TTL = 60 * 60 * 1000; // 1 час
let memoryCache: CatalogData | null = null;
let catalogPromise: Promise<CatalogData> | null = null;

function readCache(): CatalogData | null {
  if (memoryCache) return memoryCache;
  // Читаем из localStorage — переживает закрытие вкладки, ускоряет повторные визиты.
  for (const store of [sessionStorage, localStorage]) {
    try {
      const raw = store.getItem(CACHE_KEY);
      if (!raw) continue;
      const parsed = JSON.parse(raw) as { ts: number; data: CatalogData };
      if (Date.now() - parsed.ts > CACHE_TTL) continue;
      memoryCache = parsed.data;
      return parsed.data;
    } catch {
      /* ignore */
    }
  }
  return null;
}

/**
 * Загружает каталог с кэшированием: повторные вызовы (переходы между листингами
 * и товарами) отдают данные мгновенно из памяти/хранилища, без сетевого запроса.
 */
export function fetchCatalog(): Promise<CatalogData> {
  const cached = readCache();
  if (cached) return Promise.resolve(cached);
  if (catalogPromise) return catalogPromise;
  catalogPromise = fetch(CATALOG_URL)
    .then((r) => r.json())
    .then((d: CatalogData) => {
      memoryCache = d;
      const payload = JSON.stringify({ ts: Date.now(), data: d });
      try { sessionStorage.setItem(CACHE_KEY, payload); } catch { /* лимит storage */ }
      try { localStorage.setItem(CACHE_KEY, payload); } catch { /* лимит storage */ }
      return d;
    })
    .catch((e) => {
      catalogPromise = null;
      throw e;
    });
  return catalogPromise;
}