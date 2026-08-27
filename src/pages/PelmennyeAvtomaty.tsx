import { useEffect, useState } from "react";
import SiteHeader from "@/components/site/SiteHeader";
import SiteFooter from "@/components/site/SiteFooter";
import ThankYouModal from "@/components/ThankYouModal";
import { useLeadForm } from "@/hooks/useLeadForm";
import { fetchCatalog, CatalogItem } from "@/lib/catalog";
import PelmeniHero from "@/components/pelmeni/PelmeniHero";
import PelmeniCatalog from "@/components/pelmeni/PelmeniCatalog";
import PelmeniProductModal from "@/components/pelmeni/PelmeniProductModal";
import PelmeniLightbox from "@/components/pelmeni/PelmeniLightbox";
import PelmeniProducts from "@/components/pelmeni/PelmeniProducts";
import PelmeniAdvantages from "@/components/pelmeni/PelmeniAdvantages";
import PelmeniChoose from "@/components/pelmeni/PelmeniChoose";
import PelmeniProcess from "@/components/pelmeni/PelmeniProcess";
import PelmeniAbout from "@/components/pelmeni/PelmeniAbout";
import PelmeniFaq from "@/components/pelmeni/PelmeniFaq";
import PelmeniContacts from "@/components/pelmeni/PelmeniContacts";
import PelmeniLeadModal from "@/components/pelmeni/PelmeniLeadModal";

const PAGE_URL = "https://meatmassagers.ru/pelmennye-avtomaty";
const TOPIC = "пельменные автоматы";

const SECTION_IDS = ["top", "products", "advantages", "catalog", "choose", "process", "videos", "quiz", "about", "faq", "contact-us"];

export default function PelmennyeAvtomaty() {
  const { sendLead, sending, thankYouOpen, setThankYouOpen } = useLeadForm();
  const [visible, setVisible] = useState<Record<string, boolean>>({ top: true });
  const [modalOpen, setModalOpen] = useState(false);
  const [modalTitle, setModalTitle] = useState("");
  const [items, setItems] = useState<CatalogItem[]>([]);
  const [catalogLoading, setCatalogLoading] = useState(true);
  const [detailsItem, setDetailsItem] = useState<CatalogItem | null>(null);
  const [lightbox, setLightbox] = useState<{ photos: string[]; index: number } | null>(null);

  useEffect(() => {
    setCatalogLoading(true);
    fetchCatalog("dumplings")
      .then((d) => setItems(d.dumplings || []))
      .catch(() => setItems([]))
      .finally(() => setCatalogLoading(false));
  }, []);

  useEffect(() => {
    document.title = "Пельменные автоматы и аппараты — купить оборудование для пельменей | Техно-Сиб";

    const setMeta = (key: string, content: string, isProperty = false) => {
      const attr = isProperty ? "property" : "name";
      let el = document.querySelector(`meta[${attr}='${key}']`);
      if (!el) {
        el = document.createElement("meta");
        el.setAttribute(attr, key);
        document.head.appendChild(el);
      }
      el.setAttribute("content", content);
    };

    const description = "Пельменные автоматы и аппараты производительностью от 3 600 до 13 200 шт/ч. Пельмени, хинкали, манты, вареники, чебуреки. Демонстрация в Москве, Новосибирске и Челябинске. Пусконаладка, гарантия, сервис. Цены от 155 000 ₽.";
    setMeta("description", description);
    setMeta("keywords", "пельменный автомат, пельменный аппарат, оборудование для пельменей, аппарат для хинкали, машина для мантов, автомат для вареников, пельменная линия");
    setMeta("og:title", "Пельменные автоматы и аппараты | Техно-Сиб", true);
    setMeta("og:description", description, true);
    setMeta("og:url", PAGE_URL, true);
    setMeta("og:type", "website", true);

    const schema = {
      "@context": "https://schema.org",
      "@graph": [
        { "@type": "WebPage", "@id": PAGE_URL, url: PAGE_URL, name: "Пельменные автоматы и аппараты", description, isPartOf: { "@id": "https://meatmassagers.ru/#website" } },
        { "@type": "WebSite", "@id": "https://meatmassagers.ru/#website", url: "https://meatmassagers.ru", name: "Техно-Сиб — оборудование для мясопереработки", publisher: { "@id": "https://meatmassagers.ru/#org" } },
        { "@type": "BreadcrumbList", itemListElement: [
          { "@type": "ListItem", position: 1, name: "Главная", item: "https://meatmassagers.ru/" },
          { "@type": "ListItem", position: 2, name: "Пельменные автоматы", item: PAGE_URL },
        ] },
      ],
    };
    let scriptEl = document.getElementById("schema-pelmeni");
    if (!scriptEl) {
      scriptEl = document.createElement("script");
      scriptEl.id = "schema-pelmeni";
      scriptEl.setAttribute("type", "application/ld+json");
      document.head.appendChild(scriptEl);
    }
    scriptEl.textContent = JSON.stringify(schema);
  }, []);

  useEffect(() => {
    if (!items.length) return;
    const schema = {
      "@context": "https://schema.org",
      "@type": "ItemList",
      name: "Пельменные автоматы и аппараты",
      numberOfItems: items.length,
      itemListElement: items.map((item, i) => ({
        "@type": "ListItem",
        position: i + 1,
        item: {
          "@type": "Product",
          name: item.name,
          image: item.pictures?.[0] || undefined,
          ...(item.price
            ? { offers: { "@type": "Offer", price: Math.round(item.price), priceCurrency: "RUB", availability: "https://schema.org/InStock", url: PAGE_URL } }
            : {}),
        },
      })),
    };
    let el = document.getElementById("schema-pelmeni-items");
    if (!el) {
      el = document.createElement("script");
      el.id = "schema-pelmeni-items";
      el.setAttribute("type", "application/ld+json");
      document.head.appendChild(el);
    }
    el.textContent = JSON.stringify(schema);
  }, [items]);

  useEffect(() => {
    const observers: Record<string, IntersectionObserver> = {};
    SECTION_IDS.forEach((id) => {
      const el = document.getElementById(id);
      if (!el) return;
      observers[id] = new IntersectionObserver(([entry]) => {
        if (entry.isIntersecting) {
          setVisible((prev) => ({ ...prev, [id]: true }));
          observers[id].unobserve(el);
        }
      }, { threshold: 0.08 });
      observers[id].observe(el);
    });
    return () => Object.values(observers).forEach((o) => o.disconnect());
  }, [items]);

  const openModal = (title: string) => { setModalTitle(title); setModalOpen(true); };

  const vis = (id: string) => !!visible[id];

  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteHeader current="/pelmennye-avtomaty" onGetKp={() => openModal("Получить КП за 24 часа")} />

      <PelmeniHero
        visible={vis("top")}
        onPick={() => openModal("Подобрать модель (пельменные автоматы)")}
        onDemo={() => openModal("Записаться на демонстрацию (пельмени)")}
      />

      <PelmeniProducts visible={vis("products")} />
      <PelmeniAdvantages visible={vis("advantages")} />

      <PelmeniCatalog
        visible={vis("catalog")}
        items={items}
        loading={catalogLoading}
        sending={sending}
        onQuickLead={(name, phone, email) => sendLead({ name, phone, email, product: "Подобрать пельменный автомат с технологом", topic: TOPIC, formType: "inquiry" })}
        onCardLead={(item) => openModal(`Оставить заявку на ${item.name}`)}
        onDetails={(item) => setDetailsItem(item)}
        onEmptyLead={() => openModal("Заявка при недоступном каталоге")}
        onZoom={(photos, index) => setLightbox({ photos, index })}
      />

      <PelmeniChoose visible={vis("choose")} onPick={(segment) => openModal(`Подбор оборудования: ${segment}`)} />
      <PelmeniProcess visible={vis("process")} />

      {/* Видео работы оборудования — наполняется в части 3 */}
      <section id="videos" className="scroll-mt-32" />
      {/* Квиз-подбор — наполняется в части 3 */}
      <section id="quiz" className="scroll-mt-32" />

      <PelmeniAbout visible={vis("about")} />
      <PelmeniFaq visible={vis("faq")} />

      <PelmeniContacts
        visible={vis("contact-us")}
        sending={sending}
        onSubmit={(name, phone, email) => sendLead({ name, phone, email, product: "Оставить заявку (страница пельменных автоматов)", topic: TOPIC, formType: "contacts" })}
      />

      <SiteFooter onGetKp={() => openModal("Получить КП за 24 часа")} />

      <PelmeniProductModal
        item={detailsItem}
        onClose={() => setDetailsItem(null)}
        onLead={(item) => { setDetailsItem(null); openModal(`Оставить заявку на ${item.name}`); }}
      />

      {lightbox && (
        <PelmeniLightbox
          photos={lightbox.photos}
          index={lightbox.index}
          onIndex={(i) => setLightbox({ ...lightbox, index: i })}
          onClose={() => setLightbox(null)}
        />
      )}

      <PelmeniLeadModal
        open={modalOpen}
        title={modalTitle}
        sending={sending}
        onClose={() => setModalOpen(false)}
        onSubmit={(name, phone, email) => sendLead({ name, phone, email, product: modalTitle || "Получить КП за 24 часа", topic: TOPIC, formType: "modal" })}
      />

      <ThankYouModal open={thankYouOpen} onClose={() => setThankYouOpen(false)} />
    </div>
  );
}