// Централизованная установка мета-тегов страницы.
// Гарантирует, что на КАЖДОМ URL в <head> стоят уникальные
// title, description, canonical, og:* и twitter:* — это позволяет
// поисковикам (в т.ч. Яндексу, который исполняет JS) индексировать
// SPA как набор отдельных страниц с разными метатегами.

export const SITE_URL = "https://meatmassagers.ru";
const DEFAULT_IMAGE = "https://cdn.poehali.dev/files/a80d03fc-2480-4c9b-a141-456c301f7d59.jpg";

export interface PageMeta {
  title: string;
  description: string;
  /** Абсолютный или относительный (от корня) URL страницы. По умолчанию — текущий путь. */
  url?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogType?: string;
  image?: string;
  keywords?: string;
}

function upsertMeta(attr: "name" | "property", key: string, content: string) {
  let el = document.head.querySelector(`meta[${attr}="${key}"]`);
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute("content", content);
}

function upsertLink(rel: string, href: string) {
  let el = document.head.querySelector(`link[rel="${rel}"]`) as HTMLLinkElement | null;
  if (!el) {
    el = document.createElement("link");
    el.setAttribute("rel", rel);
    document.head.appendChild(el);
  }
  el.setAttribute("href", href);
}

function absoluteUrl(url?: string): string {
  if (!url) {
    const path = typeof window !== "undefined" ? window.location.pathname : "/";
    return `${SITE_URL}${path === "/" ? "/" : path.replace(/\/$/, "")}`;
  }
  if (/^https?:\/\//i.test(url)) return url;
  return `${SITE_URL}${url.startsWith("/") ? "" : "/"}${url}`;
}

/**
 * Устанавливает все SEO мета-теги страницы разом.
 * Вызывать в useEffect после того, как известны данные страницы.
 */
export function setPageMeta(meta: PageMeta): void {
  const url = absoluteUrl(meta.url);
  const image = meta.image || DEFAULT_IMAGE;
  const ogTitle = meta.ogTitle || meta.title;
  const ogDescription = meta.ogDescription || meta.description;

  document.title = meta.title;

  upsertMeta("name", "description", meta.description);
  if (meta.keywords) upsertMeta("name", "keywords", meta.keywords);

  upsertLink("canonical", url);

  upsertMeta("property", "og:title", ogTitle);
  upsertMeta("property", "og:description", ogDescription);
  upsertMeta("property", "og:url", url);
  upsertMeta("property", "og:type", meta.ogType || "website");
  upsertMeta("property", "og:image", image);

  upsertMeta("name", "twitter:card", "summary_large_image");
  upsertMeta("name", "twitter:title", ogTitle);
  upsertMeta("name", "twitter:description", ogDescription);
  upsertMeta("name", "twitter:image", image);
}
