const SITE = "https://meatmassagers.ru";
const ORG_ID = `${SITE}/#organization`;
const WEBSITE_ID = `${SITE}/#website`;
const ORG_PHONE = "+7 800 505-91-24";
const ORG_LOGO = "https://cdn.poehali.dev/files/b643e2cd-1c2b-461b-b32b-4053b1b9e72b.jpg";

export interface Crumb { name: string; url: string; }
export interface ListedProduct { name: string; url: string; }

function organization() {
  return {
    "@type": "Organization",
    "@id": ORG_ID,
    name: "meatmassagers.ru",
    url: `${SITE}/`,
    logo: ORG_LOGO,
    telephone: ORG_PHONE,
    contactPoint: {
      "@type": "ContactPoint",
      contactType: "sales",
      telephone: ORG_PHONE,
      areaServed: "RU",
      availableLanguage: "Russian",
    },
  };
}

function website() {
  return {
    "@type": "WebSite",
    "@id": WEBSITE_ID,
    url: `${SITE}/`,
    name: "meatmassagers.ru",
    inLanguage: "ru-RU",
    publisher: { "@id": ORG_ID },
  };
}

function breadcrumbList(crumbs: Crumb[]) {
  return {
    "@type": "BreadcrumbList",
    itemListElement: crumbs.map((c, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: c.name,
      item: c.url,
    })),
  };
}

export function breadcrumbGraph(crumbs: Crumb[]) {
  return { "@context": "https://schema.org", ...breadcrumbList(crumbs) };
}

export function homeGraph(opts: { h1: string; description: string }) {
  const url = `${SITE}/`;
  return {
    "@context": "https://schema.org",
    "@graph": [
      organization(),
      website(),
      {
        "@type": "WebPage",
        "@id": `${url}#webpage`,
        url,
        name: opts.h1,
        description: opts.description,
        inLanguage: "ru-RU",
        isPartOf: { "@id": WEBSITE_ID },
        about: { "@id": ORG_ID },
      },
    ],
  };
}

export function categoryGraph(opts: {
  pageUrl: string;
  h1: string;
  description: string;
  crumbs: Crumb[];
  products: ListedProduct[];
}) {
  const graph: Record<string, unknown>[] = [organization(), website(), breadcrumbList(opts.crumbs)];
  const collection: Record<string, unknown> = {
    "@type": "CollectionPage",
    "@id": `${opts.pageUrl}#webpage`,
    url: opts.pageUrl,
    name: opts.h1,
    description: opts.description,
    inLanguage: "ru-RU",
    isPartOf: { "@id": WEBSITE_ID },
  };
  if (opts.products.length > 0) {
    collection.mainEntity = { "@id": `${opts.pageUrl}#itemlist` };
    graph.push({
      "@type": "ItemList",
      "@id": `${opts.pageUrl}#itemlist`,
      itemListElement: opts.products.map((p, i) => ({
        "@type": "ListItem",
        position: i + 1,
        url: p.url,
        name: p.name,
      })),
    });
  }
  graph.push(collection);
  return { "@context": "https://schema.org", "@graph": graph };
}

export function productGraph(opts: {
  pageUrl: string;
  name: string;
  description: string;
  image: string[];
  sku: string;
  brand?: string | null;
  category: string;
  priceDisplay?: string | null;
  price?: number | null;
  crumbs: Crumb[];
}) {
  const offer: Record<string, unknown> = {
    "@type": "Offer",
    priceCurrency: "RUB",
    availability: "https://schema.org/InStock",
    url: opts.pageUrl,
    seller: { "@id": ORG_ID },
  };
  if (opts.price != null) offer.price = opts.price;

  const product: Record<string, unknown> = {
    "@type": "Product",
    "@id": `${opts.pageUrl}#product`,
    name: opts.name,
    description: opts.description,
    sku: opts.sku,
    category: opts.category,
    offers: offer,
  };
  if (opts.image.length > 0) product.image = opts.image;
  if (opts.brand) product.brand = { "@type": "Brand", name: opts.brand };

  return {
    "@context": "https://schema.org",
    "@graph": [organization(), website(), breadcrumbList(opts.crumbs), product],
  };
}

export function setJsonLd(data: object) {
  const id = "jsonld-page";
  let el = document.getElementById(id) as HTMLScriptElement | null;
  if (!el) {
    el = document.createElement("script");
    el.id = id;
    el.type = "application/ld+json";
    document.head.appendChild(el);
  }
  el.textContent = JSON.stringify(data);
}