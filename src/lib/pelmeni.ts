import { CatalogItem } from "@/lib/catalog";

/** Параметры фида, которые не показываем на странице ни в карточке, ни в модалке. */
const HIDDEN_PARAMS = [
  "guid",
  "наличие",
  "видео",
  "объем (м3)",
  "объём (м3)",
];

export function isHiddenParam(name: string): boolean {
  const n = (name || "").toLowerCase().trim();
  return HIDDEN_PARAMS.some((h) => n.includes(h));
}

/** Порядок вывода характеристик в карточке товара (по ТЗ). */
const PRIORITY = [
  "производительность (шт/час)",
  "производительность расчётная кинематическая* (шт/час)",
  "производительность, пельмени (шт/ч)",
  "расчетная производительность (кг/ч)",
  "расчётная производительность (шт/ч)",
  "вес изделия (г)",
  "диапазон веса (г)",
  "форма пельменя",
  "мощность (квт)",
  "мощность (вт)",
  "напряжение (в)",
  "питание (в/гц)",
  "габариты (д×ш×в) (мм)",
  "габариты в упаковке  (д×ш×в) (мм)",
  "вес брутто (кг)",
  "гарантийный срок",
  "бренд",
];

function priorityIndex(name: string): number {
  const n = (name || "").toLowerCase().replace(/[:\s]+$/, "").trim();
  const exact = PRIORITY.indexOf(n);
  if (exact >= 0) return exact;
  const partial = PRIORITY.findIndex((p) => n.startsWith(p.slice(0, 18)));
  return partial >= 0 ? partial : PRIORITY.length;
}

export interface Param { name: string; value: string; }

export function visibleParams(item: CatalogItem): Param[] {
  const seen = new Set<string>();
  const out: Param[] = [];
  for (const p of item.all_params || []) {
    if (!p?.name || !p?.value) continue;
    if (isHiddenParam(p.name)) continue;
    const key = p.name.toLowerCase().replace(/\s+/g, " ").trim();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push({ name: p.name.replace(/\s*:\s*$/, ""), value: p.value });
  }
  return out;
}

/**
 * До `limit` характеристик для карточки, отсортированных по приоритету ТЗ.
 * В фиде производительность и мощность нередко продублированы в двух
 * формулировках — в карточке оставляем только первую, самую приоритетную.
 */
export function cardParams(item: CatalogItem, limit = 5): Param[] {
  const sorted = [...visibleParams(item)].sort((a, b) => priorityIndex(a.name) - priorityIndex(b.name));
  const usedGroups = new Set<string>();
  const out: Param[] = [];
  for (const p of sorted) {
    const n = p.name.toLowerCase();
    let group = "";
    if (n.includes("производительность") && !n.includes("кг")) group = "productivity";
    else if (n.includes("мощность")) group = "power";
    else if (n.includes("напряжение") || n.includes("питание")) group = "voltage";
    else if (n.includes("габарит") || n.includes("размер")) group = "size";
    else if (n.includes("вес") && !n.includes("изделия")) group = "weight";
    if (group) {
      if (usedGroups.has(group)) continue;
      usedGroups.add(group);
    }
    out.push(p);
    if (out.length >= limit) break;
  }
  return out;
}

/**
 * Производительность в шт/ч — для фильтра и сортировки.
 * В фиде встречаются диапазоны («2000-3600», «12000-20000») —
 * берём верхнюю границу, как указано в паспорте оборудования.
 */
export function productivitySht(item: CatalogItem): number | null {
  for (const p of item.all_params || []) {
    const n = (p.name || "").toLowerCase();
    if (!n.includes("производительность")) continue;
    if (n.includes("кг")) continue;
    const numbers = String(p.value)
      .replace(/\s/g, "")
      .replace(",", ".")
      .match(/\d+(?:\.\d+)?/g);
    if (!numbers?.length) continue;
    const max = Math.max(...numbers.map(Number).filter((v) => Number.isFinite(v) && v > 0));
    if (max > 0) return max;
  }
  return null;
}

export type SpeedKey = "all" | "low" | "mid" | "high";

export const SPEED_FILTERS: { key: SpeedKey; label: string; hint: string }[] = [
  { key: "all", label: "Все", hint: "" },
  { key: "low", label: "До 4 000 шт/ч", hint: "настольные и компактные" },
  { key: "mid", label: "4 000–8 000 шт/ч", hint: "средний цех" },
  { key: "high", label: "Более 8 000 шт/ч", hint: "промышленные" },
];

export function matchSpeed(item: CatalogItem, key: SpeedKey): boolean {
  if (key === "all") return true;
  const v = productivitySht(item);
  if (v === null) return false;
  if (key === "low") return v < 4000;
  if (key === "mid") return v >= 4000 && v <= 8000;
  return v > 8000;
}

export function formatPrice(item: CatalogItem): string {
  if (!item.price) return "Цена по запросу";
  return `от ${Math.round(item.price).toLocaleString("ru-RU").replace(/\u00A0/g, " ")} ₽`;
}

/**
 * Описание из фида содержит HTML. Оставляем только простую разметку:
 * абзацы, списки, переносы и выделения — без стилей, классов и скриптов.
 */
export function sanitizeDescription(html: string | null): string {
  if (!html) return "";
  let out = html;
  out = out.replace(/<!--[\s\S]*?-->/g, "");
  out = out.replace(/<\/?(html|body|head)[^>]*>/gi, "");
  out = out.replace(/<(script|style|iframe|object|embed)[\s\S]*?<\/\1>/gi, "");
  out = out.replace(/<\/?(?!\/?(p|br|ul|ol|li|strong|b|em|i|h3|h4)\b)[a-z][^>]*>/gi, "");
  out = out.replace(/<(p|br|ul|ol|li|strong|b|em|i|h3|h4)([^>]*)>/gi, "<$1>");
  out = out.replace(/(\s*<br>\s*){3,}/gi, "<br><br>");
  return out.trim();
}