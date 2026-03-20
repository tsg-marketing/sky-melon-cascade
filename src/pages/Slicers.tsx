import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import Icon from "@/components/ui/icon";
import ThankYouModal from "@/components/ThankYouModal";
import { useLeadForm } from "@/hooks/useLeadForm";
import { useCart } from "@/hooks/useCart";

const CATALOG_URL = "https://functions.poehali.dev/7093349e-12b4-4025-a465-82ce3b87b0b2";

interface CatalogItem {
  id: string;
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
}

const inputCls = "w-full px-4 py-3 bg-background border border-border rounded-xl text-foreground placeholder-muted-foreground text-sm focus:outline-none focus:border-primary transition-colors";
const inputError = "w-full px-4 py-3 bg-background border border-red-400 rounded-xl text-foreground placeholder-muted-foreground text-sm focus:outline-none focus:border-red-500 transition-colors";

function isValidPhone(v: string): boolean {
  const digits = v.replace(/\D/g, "");
  if (/^[78]\d{10}$/.test(digits)) return true;
  if (/^375\d{9}$/.test(digits)) return true;
  return false;
}

function formatPhone(prev: string, next: string): string {
  let raw = next.replace(/[^\d+]/g, "");
  if (raw.startsWith("8")) raw = "7" + raw.slice(1);
  if (/^[9]/.test(raw)) raw = "7" + raw;
  raw = raw.replace(/\+/g, "");
  const isBy = raw.startsWith("375");
  const maxDigits = isBy ? 12 : 11;
  raw = raw.slice(0, maxDigits);
  if (!raw) return "";
  return "+" + raw;
}
const btnPrimary = "px-8 py-4 bg-primary text-white rounded-full font-bold text-lg hover:bg-primary/90 transition-all shadow-lg shadow-primary/20";
const btnOutline = "px-8 py-4 border-2 border-primary/30 text-primary rounded-full font-semibold text-lg hover:border-primary hover:bg-primary/5 transition-all";

const CompareForm = ({ onSent }: { onSent: (name: string, phone: string) => void }) => {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [phoneTouched, setPhoneTouched] = useState(false);
  const phoneValid = isValidPhone(phone);
  return (
    <div className="p-8 bg-white border-2 border-primary/20 rounded-3xl shadow-sm">
      <h3 className="font-display font-bold text-2xl mb-1 text-foreground text-center">Хотите подобрать оборудование?</h3>
      <p className="text-muted-foreground text-base mb-6 text-center">Оставьте контакты — технолог свяжется в течение 2 часов</p>
      <div className="space-y-4">
        <input type="text" placeholder="Ваше имя" value={name} onChange={e => setName(e.target.value)} className={inputCls} />
        <div>
          <input type="tel" placeholder="+7 (___) ___-__-__" value={phone} onChange={e => setPhone(formatPhone(phone, e.target.value))} onBlur={() => setPhoneTouched(true)} className={phoneTouched && !phoneValid ? inputError : inputCls} />
          {phoneTouched && !phoneValid && <p className="text-xs text-red-500 mt-1">Введите номер России, Казахстана или Беларуси</p>}
        </div>
        <button
          onClick={() => { if (name && phoneValid) onSent(name, phone); }}
          disabled={!name.trim() || !phoneValid}
          className="w-full py-4 bg-primary text-white rounded-xl font-bold text-lg hover:bg-primary/90 transition-all shadow-sm disabled:opacity-40"
        >
          Отправить
        </button>
        <p className="text-xs text-muted-foreground leading-relaxed">
          Отправляя форму, я соглашаюсь с{" "}
          <a href="https://t-sib.ru/assets/politika_t-sib16.05.25.pdf" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">политикой обработки персональных данных</a>
          {" "}и даю{" "}
          <a href="https://t-sib.ru/assets/soglasie_t-sib16.05.25.pdf" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">согласие на обработку персональных данных</a>.
        </p>
      </div>
    </div>
  );
};

const CONSENT_TEXT = (
  <p className="text-xs text-muted-foreground leading-relaxed">
    Отправляя форму, я соглашаюсь с{" "}
    <a href="https://t-sib.ru/assets/politika_t-sib16.05.25.pdf" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">политикой обработки персональных данных</a>
    {" "}и даю{" "}
    <a href="https://t-sib.ru/assets/soglasie_t-sib16.05.25.pdf" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">согласие на обработку персональных данных</a>.
  </p>
);

const Slicers = () => {
  const { sendLead, sending, thankYouOpen, setThankYouOpen } = useLeadForm();
  const { addItem, removeItem, getQuantity, totalCount } = useCart();
  const navigate = useNavigate();
  const [visibleSections, setVisibleSections] = useState<Record<string, boolean>>({});
  const [menuOpen, setMenuOpen] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalProduct, setModalProduct] = useState("");
  const [modalName, setModalName] = useState("");
  const [modalPhone, setModalPhone] = useState("");
  const [contactsName, setContactsName] = useState("");
  const [contactsPhone, setContactsPhone] = useState("");
  const [contactsComment, setContactsComment] = useState("");
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [catalogExpanded, setCatalogExpanded] = useState(false);
  const [catalogData, setCatalogData] = useState<{ massagers: CatalogItem[]; injectors: CatalogItem[]; slicers: CatalogItem[] } | null>(null);
  const [catalogLoading, setCatalogLoading] = useState(true);
  const [catalogSearch, setCatalogSearch] = useState("");
  const [selectedItem, setSelectedItem] = useState<CatalogItem | null>(null);
  const [selectedSlide, setSelectedSlide] = useState(0);
  const [cardSlides, setCardSlides] = useState<Record<string, number>>({});
  const [inquiryItem, setInquiryItem] = useState<CatalogItem | null>(null);
  const [inquiryName, setInquiryName] = useState("");
  const [inquiryPhone, setInquiryPhone] = useState("");
  const [inquiryPhoneTouched, setInquiryPhoneTouched] = useState(false);
  const [inquirySent, setInquirySent] = useState(false);
  const [contactsPhoneTouched, setContactsPhoneTouched] = useState(false);
  const [modalPhoneTouched, setModalPhoneTouched] = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxPhotos, setLightboxPhotos] = useState<string[]>([]);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [videoOpen, setVideoOpen] = useState(false);

  useEffect(() => {
    document.title = "Слайсеры для нарезки мяса и овощей — купить промышленный слайсер | Техно-Сиб";
    const setMeta = (name: string, content: string, property?: boolean) => {
      const attr = property ? "property" : "name";
      let el = document.querySelector(`meta[${attr}="${name}"]`);
      if (!el) { el = document.createElement("meta"); el.setAttribute(attr, name); document.head.appendChild(el); }
      el.setAttribute("content", content);
    };
    setMeta("description", "Промышленные слайсеры для точной нарезки мяса, рыбы и овощей. Толщина от 1 мм, до 260 резов/мин. Подбор, поставка и сервис по всей России. Техно-Сиб — 25 лет на рынке.");
    setMeta("keywords", "слайсер для мяса, промышленный слайсер, слайсер для нарезки, оборудование для нарезки мяса, купить слайсер");
    setMeta("og:title", "Слайсеры для нарезки мяса и овощей — промышленное оборудование | Техно-Сиб", true);
    setMeta("og:description", "Промышленные слайсеры для точной нарезки мяса, рыбы и овощей. Подбор модели под ваш продукт, поставка и сервис по всей России.", true);
    setMeta("og:url", "https://meatmassagers.ru/slicers", true);
    setMeta("og:type", "website", true);
    const link = document.querySelector("link[rel='canonical']") || document.createElement("link");
    link.setAttribute("rel", "canonical");
    link.setAttribute("href", "https://meatmassagers.ru/slicers");
    if (!link.parentNode) document.head.appendChild(link);

    const schema = {
      "@context": "https://schema.org",
      "@graph": [
        {
          "@type": "WebPage",
          "@id": "https://meatmassagers.ru/slicers",
          "url": "https://meatmassagers.ru/slicers",
          "name": "Слайсеры для нарезки мяса и овощей — купить промышленный слайсер",
          "description": "Промышленные слайсеры для точной нарезки мяса, рыбы и овощей. Толщина от 1 мм, до 260 резов/мин.",
          "isPartOf": { "@id": "https://meatmassagers.ru/#website" }
        },
        {
          "@type": "WebSite",
          "@id": "https://meatmassagers.ru/#website",
          "url": "https://meatmassagers.ru",
          "name": "Техно-Сиб — оборудование для маринования и посола мяса",
          "publisher": { "@id": "https://meatmassagers.ru/#org" }
        },
        {
          "@type": "Organization",
          "@id": "https://meatmassagers.ru/#org",
          "name": "Техно-Сиб",
          "url": "https://meatmassagers.ru",
          "telephone": "+7-800-505-91-24",
          "email": "massagers@t-sib.ru",
          "address": { "@type": "PostalAddress", "addressCountry": "RU", "addressLocality": "Новосибирск" },
          "foundingDate": "2001",
          "description": "Поставщик профессионального пищевого оборудования с 2001 года. Вакуумные массажеры, инъекторы и слайсеры для мяса."
        },
        {
          "@type": "BreadcrumbList",
          "itemListElement": [
            { "@type": "ListItem", "position": 1, "name": "Главная", "item": "https://meatmassagers.ru/" },
            { "@type": "ListItem", "position": 2, "name": "Слайсеры для нарезки", "item": "https://meatmassagers.ru/slicers" }
          ]
        },
        {
          "@type": "FAQPage",
          "mainEntity": [
            { "@type": "Question", "name": "Какую минимальную толщину нарезки обеспечивает слайсер?", "acceptedAnswer": { "@type": "Answer", "text": "Наши слайсеры обеспечивают нарезку от 1 мм с погрешностью менее 1%. Точная настройка толщины позволяет получить одинаковые ломтики для любого продукта." }},
            { "@type": "Question", "name": "Какие продукты можно нарезать?", "acceptedAnswer": { "@type": "Answer", "text": "Слайсеры работают с мясом (свежим и замороженным), птицей, рыбой, сыром, овощами и деликатесами. Модели подбираются под конкретный продукт и задачу." }},
            { "@type": "Question", "name": "Как часто нужно менять ножи?", "acceptedAnswer": { "@type": "Answer", "text": "Ресурс ножей зависит от интенсивности работы и типа продукта. В среднем заточка требуется каждые 2–4 недели. Замена ножей — простая процедура без специальных инструментов." }},
            { "@type": "Question", "name": "Какая производительность слайсеров?", "acceptedAnswer": { "@type": "Answer", "text": "До 260 резов в минуту в зависимости от модели. Точная производительность зависит от типа продукта и толщины нарезки." }},
            { "@type": "Question", "name": "Как устроена санитарная обработка?", "acceptedAnswer": { "@type": "Answer", "text": "Корпус из нержавеющей стали, быстросъёмные детали. Полная мойка занимает 15–30 минут стандартными дезинфектантами." }}
          ]
        }
      ]
    };
    let scriptEl = document.getElementById("schema-slicers");
    if (!scriptEl) { scriptEl = document.createElement("script"); scriptEl.id = "schema-slicers"; scriptEl.setAttribute("type", "application/ld+json"); document.head.appendChild(scriptEl); }
    scriptEl.textContent = JSON.stringify(schema);

    return () => {
      document.title = "Массажеры и инъекторы от Техносиб";
      const canonical = document.querySelector("link[rel='canonical']");
      if (canonical) canonical.remove();
      const schemaEl = document.getElementById("schema-slicers");
      if (schemaEl) schemaEl.remove();
    };
  }, []);

  useEffect(() => {
    const ids = ["hero","benefits","catalog","compare","service","about","faq","contacts"];
    setVisibleSections((prev) => ({ ...prev, hero: true }));
    const observers: Record<string, IntersectionObserver> = {};
    ids.forEach((id) => {
      const el = document.getElementById(id);
      if (!el) return;
      observers[id] = new IntersectionObserver(([entry]) => { if (entry.isIntersecting) { setVisibleSections((prev) => ({ ...prev, [id]: true })); observers[id].unobserve(el); } }, { threshold: 0.08 });
      observers[id].observe(el);
    });
    return () => Object.values(observers).forEach((o) => o.disconnect());
  }, []);

  const vis = (id: string) => visibleSections[id];

  useEffect(() => {
    setCatalogLoading(true);
    fetch(CATALOG_URL).then((r) => r.json()).then((d) => {
      setCatalogData(d);
      const hash = window.location.hash;
      if (hash.startsWith("#product-")) {
        const productId = hash.slice("#product-".length);
        const found = (d.slicers || []).find((it: CatalogItem) => it.id === productId);
        if (found) { setCatalogExpanded(true); setTimeout(() => { setSelectedItem(found); setSelectedSlide(0); const el = document.getElementById("product-" + productId); if (el) el.scrollIntoView({ behavior: "smooth", block: "center" }); }, 100); }
      }
    }).finally(() => setCatalogLoading(false));
  }, []);

  const filteredItems = useCallback(() => {
    if (!catalogData) return [];
    const items = catalogData.slicers;
    if (!catalogSearch.trim()) return items;
    const q = catalogSearch.toLowerCase();
    return items.filter((it) => it.name.toLowerCase().includes(q) || (it.brand || "").toLowerCase().includes(q));
  }, [catalogData, catalogSearch]);

  const navLinks = [
    { href: "/",             label: "Массажеры" },
    { href: "/injector",     label: "Инъекторы" },
    { href: "#catalog",      label: "Каталог" },
    { href: "#benefits",     label: "Преимущества" },
    { href: "#technosib",    label: "О компании" },
    { href: "#faq",          label: "Вопросы" },
    { href: "#contacts",     label: "Контакты" },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="fixed top-0 w-full bg-white/90 backdrop-blur-xl border-b border-border z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center gap-3 sm:gap-6">
          <div className="flex items-center gap-3 sm:gap-6 flex-shrink-0 min-w-0">
            <div className="flex flex-col min-w-0">
              <a href="/"><img src="https://cdn.poehali.dev/files/b643e2cd-1c2b-461b-b32b-4053b1b9e72b.jpg" alt="Техносиб" className="h-8 sm:h-9 w-auto object-contain" /></a>
              <span className="text-xs text-muted-foreground leading-tight mt-0.5 hidden sm:block">Оборудование для маринования и посола мяса</span>
            </div>
            <nav className="hidden lg:flex gap-6 text-sm font-semibold">
              {navLinks.map((l) => (<a key={l.href} href={l.href} className="text-foreground hover:text-primary transition-colors whitespace-nowrap">{l.label}</a>))}
            </nav>
          </div>
          <div className="flex items-center gap-2 sm:gap-3 ml-auto flex-shrink-0">
            <a href="tel:88005059124" className="hidden md:flex items-center gap-1.5 text-sm font-bold text-foreground hover:text-primary transition-colors whitespace-nowrap"><Icon name="Phone" size={14} className="text-primary" />8 800 505-91-24</a>
            <button onClick={() => navigate("/cart")} className="relative flex items-center justify-center w-10 h-10 sm:w-auto sm:h-auto sm:px-4 sm:py-2 sm:gap-2 border-2 border-primary/30 text-primary rounded-full text-sm font-semibold hover:border-primary hover:bg-primary/5 transition-all">
              <Icon name="ShoppingCart" size={16} /><span className="hidden sm:inline">Корзина</span>
              {totalCount > 0 && (<span className="absolute -top-2 -right-2 w-5 h-5 bg-primary text-white text-xs font-bold rounded-full flex items-center justify-center">{totalCount}</span>)}
            </button>
            <button onClick={() => { setModalProduct(""); setModalOpen(true); }} className="hidden sm:block px-5 py-2 text-sm font-semibold bg-primary text-white rounded-full hover:bg-primary/90 transition-all shadow-sm whitespace-nowrap">Рассчитать решение</button>
            <button className="lg:hidden p-2 text-muted-foreground flex-shrink-0" onClick={() => setMenuOpen(!menuOpen)}><Icon name={menuOpen ? "X" : "Menu"} size={22} /></button>
          </div>
        </div>
        {menuOpen && (<div className="lg:hidden border-t border-border bg-white px-6 py-4 flex flex-col gap-4"><span className="text-xs text-muted-foreground leading-tight">Оборудование для маринования и посола мяса</span>{navLinks.map((l) => (<a key={l.href} href={l.href} className="text-sm text-muted-foreground hover:text-primary transition-colors" onClick={() => setMenuOpen(false)}>{l.label}</a>))}</div>)}
        <div className="border-t border-border/50 bg-primary/5">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-1.5 flex items-center gap-2 text-xs sm:text-sm overflow-x-auto">
            <a href="/" className="text-foreground hover:text-primary transition-colors whitespace-nowrap">Массажеры</a>
            <span className="text-muted-foreground">·</span>
            <a href="/injector" className="text-foreground hover:text-primary transition-colors whitespace-nowrap">Инъекторы</a>
            <span className="text-muted-foreground">·</span>
            <span className="font-semibold text-primary whitespace-nowrap">Слайсеры</span>
          </div>
        </div>
      </header>

      <section id="hero" className="relative pt-20 sm:pt-24 pb-10 sm:pb-14 px-4 sm:px-6 bg-gradient-to-br from-primary/5 via-background to-background overflow-hidden">
        <div className="absolute top-24 right-0 w-[600px] h-[600px] bg-primary/6 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 max-w-7xl mx-auto w-full">
          <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">
            <div className={`transition-all duration-1000 ${vis("hero") ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
              <span className="inline-block text-xs font-semibold tracking-widest text-primary uppercase border border-primary/30 rounded-full px-4 py-1.5 mb-4 bg-primary/5">Поставка и внедрение</span>
              <h1 className="text-3xl sm:text-5xl lg:text-6xl xl:text-7xl font-display font-black leading-[1.05] tracking-tight mb-4 text-foreground">Слайсеры для точной нарезки{" "}<span className="text-primary">мяса и овощей</span></h1>
              <p className="text-xl sm:text-2xl font-semibold text-foreground leading-relaxed mb-6 max-w-xl">От ведущих производителей мясного оборудования</p>
              <div className="flex flex-col sm:flex-row gap-4">
                <button onClick={() => setModalOpen(true)} className="px-8 py-4 bg-primary text-white rounded-full font-bold text-lg hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 text-center">Рассчитать решение</button>
                <a href="#catalog" className="px-8 py-4 border-2 border-primary/30 text-primary rounded-full font-semibold text-lg hover:border-primary hover:bg-primary/5 transition-all text-center">Смотреть оборудование</a>
              </div>
            </div>
            <div className={`hidden lg:block transition-all duration-1000 delay-300 ${vis("hero") ? "opacity-100 scale-100" : "opacity-0 scale-95"}`}>
              <img src="https://cdn.poehali.dev/files/7308cb6f-19e3-4561-ab04-3797adef2d37.jpg" alt="Слайсер DRB-120" className="w-full h-auto object-contain lg:scale-110" />
            </div>
          </div>
        </div>
      </section>

      <section id="benefits" className="py-12 px-6 bg-gradient-to-br from-primary/5 via-white to-primary/10">
        <div className="max-w-7xl mx-auto">
          <div className={`text-center mb-14 transition-all duration-1000 ${vis("benefits") ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}><h2 className="text-4xl lg:text-5xl font-display font-black tracking-tight text-foreground">Преимущества наших слайсеров</h2></div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {[
              { icon: "Ruler", title: "Толщина от 1 мм", desc: "Погрешность менее 1% — точная нарезка каждого ломтика" },
              { icon: "Zap", title: "До 260 резов/мин", desc: "Высокая скорость нарезки для максимальной производительности" },
              { icon: "Scale", title: "Порционирование", desc: "Интеллектуальное порционирование по весу и толщине — минимум отходов" },
              { icon: "Shield", title: "Нержавеющая сталь", desc: "Гигиеничность и влагозащита — соответствие стандартам пищевой безопасности" },
              { icon: "Wrench", title: "Удобство эксплуатации", desc: "Простая санитарная обработка и быстрая замена ножей" },
              { icon: "Settings", title: "Программирование", desc: "Сохранение до 99 рецептур нарезки для повторяемого результата" },
            ].map((feat, i) => (
              <div key={i} className={`p-7 bg-white border border-border rounded-2xl hover:border-primary/40 hover:shadow-lg transition-all flex flex-col gap-4 ${vis("benefits") ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`} style={{ transitionDelay: `${i * 90}ms`, transitionDuration: "700ms" }}>
                <div className="w-14 h-14 bg-primary/10 rounded-xl flex items-center justify-center"><Icon name={feat.icon} fallback="Star" size={28} className="text-primary" /></div>
                <div><h3 className="font-bold text-xl text-foreground mb-2">{feat.title}</h3><p className="text-muted-foreground text-base">{feat.desc}</p></div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="catalog" className="py-12 px-6 bg-background">
        <div className="max-w-7xl mx-auto">
          <div className={`text-center mb-14 transition-all duration-1000 ${vis("catalog") ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
            <h2 className="text-5xl lg:text-6xl font-display font-black tracking-tight text-foreground leading-tight">Каталог слайсеров</h2>
          </div>
          <div className="flex flex-col sm:flex-row items-center gap-4 mb-10">
            <div className="relative w-full sm:w-80">
              <Icon name="Search" size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input type="text" placeholder="Поиск по каталогу..." value={catalogSearch} onChange={(e) => setCatalogSearch(e.target.value)} className="w-full pl-10 pr-4 py-3 bg-white border border-border rounded-xl text-foreground text-sm focus:outline-none focus:border-primary transition-colors" />
            </div>
          </div>
          {catalogLoading && (<div className="flex items-center justify-center py-24"><div className="flex flex-col items-center gap-4"><div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" /><p className="text-muted-foreground text-sm">Загружаем каталог...</p></div></div>)}
          {!catalogLoading && catalogData && (
            <>
              {filteredItems().length === 0 ? (
                <div className="text-center py-20 text-muted-foreground"><Icon name="SearchX" size={48} className="mx-auto mb-4 opacity-30" /><p className="text-lg">Ничего не найдено по запросу «{catalogSearch}»</p></div>
              ) : (
                <div>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                  {(catalogExpanded ? filteredItems() : filteredItems().slice(0, 12)).map((item) => {
                    const slide = cardSlides[item.id] || 0;
                    return (
                      <div key={item.id} id={`product-${item.id}`} className="bg-white border border-border rounded-2xl overflow-hidden shadow-sm hover:shadow-xl hover:border-primary/40 transition-all flex flex-col group">
                        <div className="relative bg-gray-50 overflow-hidden" style={{ aspectRatio: "4/3" }}>
                          <img src={item.pictures[slide]} alt={item.name} className="w-full h-full object-contain p-4 group-hover:scale-105 transition-transform duration-500" onClick={() => { setLightboxPhotos(item.pictures); setLightboxIndex(slide); setLightboxOpen(true); }} style={{ cursor: "pointer" }} />
                          {item.pictures.length > 1 && (<>
                            <button onClick={(e) => { e.stopPropagation(); setCardSlides((prev) => ({ ...prev, [item.id]: (slide - 1 + item.pictures.length) % item.pictures.length })); }} className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/90 hover:bg-white rounded-full shadow flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"><Icon name="ChevronLeft" size={16} className="text-foreground" /></button>
                            <button onClick={(e) => { e.stopPropagation(); setCardSlides((prev) => ({ ...prev, [item.id]: (slide + 1) % item.pictures.length })); }} className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/90 hover:bg-white rounded-full shadow flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"><Icon name="ChevronRight" size={16} className="text-foreground" /></button>
                            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">{item.pictures.map((_, pi) => (<button key={pi} onClick={(e) => { e.stopPropagation(); setCardSlides((prev) => ({ ...prev, [item.id]: pi })); }} className={`w-1.5 h-1.5 rounded-full transition-all ${pi === slide ? "bg-primary w-4" : "bg-white/70"}`} />))}</div>
                          </>)}
                          {item.brand && item.brand.toLowerCase() !== "hualian" && (<div className="absolute top-3 left-3 bg-white/95 text-primary text-xs font-bold px-3 py-1 rounded-full shadow-sm border border-primary/20 uppercase tracking-wide">{item.brand}</div>)}
                        </div>
                        <div className="p-5 flex flex-col flex-1">
                          <h3 className="font-bold text-2xl text-foreground mb-2 leading-snug cursor-pointer hover:text-primary transition-colors" onClick={() => { setSelectedItem(item); setSelectedSlide(0); }}>{item.name}</h3>
                          {item.price_display && (<p className="text-xl font-black text-primary mb-3">{item.price_display}</p>)}
                          <div className="space-y-1.5 mb-4 flex-1">
                            {item.productivity && (<div className="flex items-start gap-2 text-base"><Icon name="Zap" size={16} className="text-primary flex-shrink-0 mt-0.5" /><span className="text-muted-foreground"><span className="font-medium text-foreground">{item.productivity.name}:</span> {item.productivity.value}</span></div>)}
                            {item.extra_params.map((p, pi) => (<div key={pi} className="flex items-start gap-2 text-base"><Icon name="ChevronRight" size={16} className="text-primary flex-shrink-0 mt-0.5" /><span className="text-muted-foreground"><span className="font-medium text-foreground">{p.name}:</span> {p.value}</span></div>))}
                          </div>
                          <div className="flex flex-col gap-2 mt-2">
                            <button onClick={() => { setInquiryItem(item); setInquiryName(""); setInquiryPhone(""); setInquirySent(false); }} className="w-full py-4 bg-primary text-white rounded-xl text-base font-bold hover:bg-primary/90 transition-all shadow-md">Оставить заявку</button>
                            <div className="flex gap-2">
                              <button onClick={() => { setSelectedItem(item); setSelectedSlide(0); }} className="flex-1 py-3.5 border-2 border-primary/30 text-primary rounded-xl text-base font-semibold hover:border-primary hover:bg-primary/5 transition-all">Подробнее</button>
                              {(() => { const qty = getQuantity(item.id); return qty > 0 ? (<div className="flex items-center gap-1 border-2 border-primary rounded-xl px-2"><button onClick={() => removeItem(item.id)} className="w-8 h-8 flex items-center justify-center text-primary font-bold text-lg hover:bg-primary/10 rounded-lg transition-colors">−</button><span className="w-5 text-center font-bold text-primary text-sm">{qty}</span><button onClick={() => addItem({ id: item.id, name: item.name, price: item.price, price_display: item.price_display, picture: item.pictures[0] })} className="w-8 h-8 flex items-center justify-center text-primary font-bold text-lg hover:bg-primary/10 rounded-lg transition-colors">+</button></div>) : (<button onClick={() => addItem({ id: item.id, name: item.name, price: item.price, price_display: item.price_display, picture: item.pictures[0] })} className="py-3.5 px-4 border-2 border-primary/30 text-primary rounded-xl hover:border-primary hover:bg-primary/5 transition-all" title="В корзину"><Icon name="ShoppingCart" size={18} /></button>); })()}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
                {!catalogExpanded && filteredItems().length > 12 && (<div className="text-center mb-8"><button onClick={() => setCatalogExpanded(true)} className={btnOutline + " inline-flex items-center gap-2"}>Показать все ({filteredItems().length})<Icon name="ChevronDown" size={18} /></button></div>)}
                </div>
              )}
            </>
          )}
        </div>
      </section>

      {selectedItem && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4" onClick={() => setSelectedItem(null)}>
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
          <div className="relative bg-white w-full sm:rounded-3xl shadow-2xl sm:max-w-4xl rounded-t-3xl overflow-hidden" style={{ maxHeight: "95dvh" }} onClick={(e) => e.stopPropagation()}>
            <button onClick={() => setSelectedItem(null)} className="absolute top-4 right-4 z-10 w-10 h-10 bg-white/90 hover:bg-white border border-border rounded-full flex items-center justify-center shadow-sm transition-all"><Icon name="X" size={18} className="text-foreground" /></button>
            <div className="sm:hidden flex justify-center pt-3 pb-1"><div className="w-10 h-1 bg-border rounded-full" /></div>
            <div className="overflow-y-auto" style={{ maxHeight: "95dvh" }}>
              <div className="flex flex-col sm:flex-row gap-0">
                <div className="bg-gray-50 p-4 sm:p-6 flex flex-col gap-3 sm:w-80 flex-shrink-0">
                  <div className="relative bg-white rounded-2xl overflow-hidden shadow-sm" style={{ aspectRatio: "4/3" }}>
                    <img src={selectedItem.pictures[selectedSlide]} alt={selectedItem.name} className="w-full h-full object-contain p-3 cursor-zoom-in" onClick={() => { setLightboxPhotos(selectedItem.pictures); setLightboxIndex(selectedSlide); setLightboxOpen(true); }} />
                    {selectedItem.pictures.length > 1 && (<>
                      <button onClick={() => setSelectedSlide((s) => (s - 1 + selectedItem.pictures.length) % selectedItem.pictures.length)} className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/90 hover:bg-white rounded-full shadow flex items-center justify-center"><Icon name="ChevronLeft" size={16} className="text-foreground" /></button>
                      <button onClick={() => setSelectedSlide((s) => (s + 1) % selectedItem.pictures.length)} className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/90 hover:bg-white rounded-full shadow flex items-center justify-center"><Icon name="ChevronRight" size={16} className="text-foreground" /></button>
                    </>)}
                  </div>
                  {selectedItem.pictures.length > 1 && (
                    <div className="flex gap-2 overflow-x-auto pb-1">
                      {selectedItem.pictures.map((pic, pi) => (<button key={pi} onClick={() => setSelectedSlide(pi)} className={`flex-shrink-0 w-16 h-16 rounded-xl overflow-hidden border-2 transition-all ${pi === selectedSlide ? "border-primary shadow-md" : "border-transparent opacity-60 hover:opacity-100"}`}><img src={pic} alt="" className="w-full h-full object-contain bg-white p-1" /></button>))}
                    </div>
                  )}
                </div>
                <div className="flex-1 p-6 sm:p-8">
                  {selectedItem.brand && (<p className="text-xs font-bold text-primary uppercase tracking-wider mb-2">{selectedItem.brand}</p>)}
                  <h2 className="text-2xl sm:text-3xl font-display font-black text-foreground mb-4 leading-tight">{selectedItem.name}</h2>
                  {selectedItem.price_display && (<p className="text-2xl font-black text-primary mb-6">{selectedItem.price_display}</p>)}
                  {selectedItem.description && (<p className="text-muted-foreground text-base leading-relaxed mb-6">{selectedItem.description}</p>)}
                  {selectedItem.all_params.length > 0 && (
                    <div className="mb-6">
                      <h4 className="font-bold text-sm text-foreground mb-3 uppercase tracking-wider">Характеристики</h4>
                      <div className="space-y-2">
                        {selectedItem.all_params.map((p, pi) => (<div key={pi} className="flex items-start gap-3 py-2 border-b border-border/50 last:border-0"><span className="text-sm text-muted-foreground min-w-[140px] flex-shrink-0">{p.name}</span><span className="text-sm font-medium text-foreground">{p.value}</span></div>))}
                      </div>
                    </div>
                  )}
                  <div className="flex flex-col sm:flex-row gap-3 mt-6">
                    <button onClick={() => { setInquiryItem(selectedItem); setInquiryName(""); setInquiryPhone(""); setInquirySent(false); setSelectedItem(null); }} className="flex-1 py-4 bg-primary text-white rounded-xl text-base font-bold hover:bg-primary/90 transition-all shadow-md">Оставить заявку</button>
                    {(() => { const qty = getQuantity(selectedItem.id); return qty > 0 ? (<div className="flex items-center gap-2 border-2 border-primary rounded-xl px-4"><button onClick={() => removeItem(selectedItem.id)} className="w-10 h-10 flex items-center justify-center text-primary font-bold text-xl hover:bg-primary/10 rounded-lg transition-colors">−</button><span className="w-6 text-center font-bold text-primary">{qty}</span><button onClick={() => addItem({ id: selectedItem.id, name: selectedItem.name, price: selectedItem.price, price_display: selectedItem.price_display, picture: selectedItem.pictures[0] })} className="w-10 h-10 flex items-center justify-center text-primary font-bold text-xl hover:bg-primary/10 rounded-lg transition-colors">+</button></div>) : (<button onClick={() => addItem({ id: selectedItem.id, name: selectedItem.name, price: selectedItem.price, price_display: selectedItem.price_display, picture: selectedItem.pictures[0] })} className="flex-1 py-4 border-2 border-primary/30 text-primary rounded-xl text-base font-semibold hover:border-primary hover:bg-primary/5 transition-all flex items-center justify-center gap-2"><Icon name="ShoppingCart" size={18} />В корзину</button>); })()}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {inquiryItem && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm" onClick={() => setInquiryItem(null)}>
          <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-md p-8" onClick={(e) => e.stopPropagation()}>
            <button onClick={() => setInquiryItem(null)} className="absolute top-4 right-4 w-10 h-10 bg-background hover:bg-primary/10 rounded-xl flex items-center justify-center transition-colors"><Icon name="X" size={18} className="text-muted-foreground" /></button>
            <h3 className="text-2xl font-display font-black text-foreground mb-1">Оставить заявку</h3>
            <p className="text-sm text-muted-foreground mb-6 leading-relaxed"><span className="font-medium text-foreground">{inquiryItem.name}</span></p>
            <div className="space-y-3">
              <input type="text" placeholder="Ваше имя" value={inquiryName} onChange={(e) => setInquiryName(e.target.value)} className={inputCls} />
              <div>
                <input type="tel" placeholder="+7 (___) ___-__-__" value={inquiryPhone} onChange={(e) => setInquiryPhone(formatPhone(inquiryPhone, e.target.value))} onBlur={() => setInquiryPhoneTouched(true)} className={inquiryPhoneTouched && !isValidPhone(inquiryPhone) ? inputError : inputCls} />
                {inquiryPhoneTouched && !isValidPhone(inquiryPhone) && <p className="text-xs text-red-500 mt-1">Введите номер России, Казахстана или Беларуси</p>}
              </div>
              <button onClick={() => { if (inquiryName.trim() && isValidPhone(inquiryPhone) && !sending) { sendLead({ name: inquiryName, phone: inquiryPhone, product: inquiryItem?.name, topic: 'слайсеры', formType: 'inquiry' }); setInquiryItem(null); setInquiryName(""); setInquiryPhone(""); setInquiryPhoneTouched(false); } }} disabled={!inquiryName.trim() || !isValidPhone(inquiryPhone) || sending} className="w-full py-4 bg-primary text-white rounded-xl font-bold text-lg hover:bg-primary/90 transition-all shadow-md disabled:opacity-40">{sending ? "Отправляем..." : "Отправить"}</button>
              {CONSENT_TEXT}
            </div>
          </div>
        </div>
      )}

      <section className="py-12 px-6 bg-white">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-10"><span className="text-xs font-semibold tracking-widest text-primary uppercase">Смотрите в деле</span><h2 className="text-4xl lg:text-5xl font-display font-black tracking-tight mt-3 text-foreground">Посмотрите как работает наше оборудование</h2></div>
          <div className="rounded-3xl overflow-hidden shadow-xl border border-border aspect-video">
            <iframe src="https://rutube.ru/play/embed/8da885b0d83746946a92da33e0538c41/" className="w-full h-full" allowFullScreen allow="autoplay; fullscreen" title="Оборудование для нарезки" />
          </div>
        </div>
      </section>

      <section id="compare" className="py-12 px-6 bg-background">
        <div className="max-w-7xl mx-auto">
          <div className={`text-center mb-16 transition-all duration-1000 ${vis("compare") ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}><h2 className="text-5xl lg:text-6xl font-display font-black tracking-tight text-foreground leading-tight">Хотите подобрать оборудование?</h2></div>
          <div className="max-w-md mx-auto"><CompareForm onSent={(name, phone) => sendLead({ name, phone, topic: 'слайсеры', formType: 'compare' })} /></div>
        </div>
      </section>

      <section id="service" className="py-12 px-6 bg-background">
        <div className="max-w-7xl mx-auto">
          <div className={`text-center mb-16 transition-all duration-1000 ${vis("service") ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}><h2 className="text-5xl lg:text-6xl font-display font-black tracking-tight text-foreground leading-tight">От подбора до запуска — под ключ</h2></div>
          <div className="grid md:grid-cols-4 gap-6 mb-14">
            {[{ icon: "ClipboardCheck", step: "01", title: "Подбор", desc: "Анализ задачи, продукта, объёма. Подбор модели и режима. КП в течение 24 ч." },{ icon: "Truck", step: "02", title: "Поставка и монтаж", desc: "Доставка, распаковка, установка на площадке. Подключение к коммуникациям." },{ icon: "GraduationCap", step: "03", title: "Пусконаладка и обучение", desc: "Настройка режимов под ваш продукт. Обучение персонала, первые тестовые партии." },{ icon: "Wrench", step: "04", title: "Сервис и запчасти", desc: "Гарантийное и постгарантийное обслуживание. Наличие запчастей. Поддержка технолога." }].map((s, i) => (
              <div key={i} className={`relative p-7 bg-white border border-border rounded-2xl shadow-sm hover:shadow-lg hover:border-primary/40 transition-all flex flex-col gap-4 ${vis("service") ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`} style={{ transitionDelay: `${i * 100}ms`, transitionDuration: "700ms" }}>
                <div className="flex items-center justify-between"><div className="w-14 h-14 bg-primary/10 rounded-xl flex items-center justify-center"><Icon name={s.icon} fallback="Star" size={28} className="text-primary" /></div><span className="font-black text-3xl text-primary/20">{s.step}</span></div>
                <div><h3 className="font-bold text-2xl text-foreground mb-2">{s.title}</h3><p className="text-muted-foreground text-base leading-relaxed">{s.desc}</p></div>
                {i < 3 && (<div className="hidden md:block absolute -right-4 top-1/2 -translate-y-1/2 z-10"><div className="w-8 h-8 bg-primary/10 border border-primary/20 rounded-full flex items-center justify-center"><Icon name="ChevronRight" size={16} className="text-primary" /></div></div>)}
              </div>
            ))}
          </div>
          <div className="text-center"><a href="#contacts" className={btnPrimary + " inline-flex items-center gap-2"}>Уточнить условия<Icon name="ArrowRight" size={18} /></a></div>
        </div>
      </section>

      <section id="about" className="py-12 px-6 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className={`transition-all duration-1000 ${vis("about") ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
              <span className="text-xs font-semibold tracking-widest text-primary uppercase">О компании</span>
              <h2 className="text-3xl sm:text-5xl lg:text-6xl font-display font-black tracking-tight mt-4 mb-6 text-foreground">О компании Daribo (Дарибо)</h2>
              <p className="text-lg text-muted-foreground leading-relaxed mb-5">Мы предлагаем оборудование компании <strong className="text-foreground">Daribo (Дарибо)</strong>. «Shanghai DARIBO Food Machinery Co., Ltd» — крупный производитель оборудования для пищевой промышленности, базирующийся в Шанхае.</p>
              <p className="text-lg text-muted-foreground leading-relaxed mb-5">Специализация Daribo (Дарибо) включает вакуумные массажеры (серия GRY, например DRB-GRY750L), автоматические инъекторы рассола, слайсеры, порционирующие машины, волчки для замороженного мяса, блокорезки, вакуумные фаршемесы, котлетные машины и полные производственные линии под ключ. Поставляет продукцию в США, Мексику, Францию, Индонезию, Таиланд, Филиппины и другие страны.</p>
              <p className="text-lg text-muted-foreground leading-relaxed mb-8">Специализация Daribo (Дарибо) включает <strong className="text-foreground">вакуумные массажеры</strong> (серия GRY, например DRB-GRY750L), <strong className="text-foreground">инъекторы рассола</strong>, мясорезки, котлетные машины и полные производственные линии под ключ.</p>
              <div className="grid grid-cols-2 gap-3">
                {[{ icon: "Building2", text: "Производитель: Шанхай" },{ icon: "Globe", text: "Поставки в 20+ стран" },{ icon: "Factory", text: "Полные линии под ключ" },{ icon: "Settings", text: "Подбор режимов и сервис" }].map((item, i) => (
                  <div key={i} className="flex items-center gap-3 p-4 bg-primary/5 border border-primary/10 rounded-xl"><Icon name={item.icon} fallback="Star" size={18} className="text-primary flex-shrink-0" /><span className="text-sm font-medium text-foreground">{item.text}</span></div>
                ))}
              </div>
            </div>
            <div className={`transition-all duration-1000 delay-300 ${vis("about") ? "opacity-100 scale-100" : "opacity-0 scale-95"}`}><img src="https://cdn.poehali.dev/files/dbffb4e8-22d1-4072-9a78-6ecbbe2efa4f.jpg" alt="Завод Daribo, Шанхай" className="w-full rounded-3xl shadow-xl object-cover" /></div>
          </div>
        </div>
      </section>

      <section id="faq" className="py-12 px-6 bg-background">
        <div className="max-w-4xl mx-auto">
          <div className={`text-center mb-16 transition-all duration-1000 ${vis("faq") ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}><span className="text-xs font-semibold tracking-widest text-primary uppercase">FAQ</span><h2 className="text-5xl lg:text-6xl font-display font-black tracking-tight mt-4 text-foreground leading-tight">Частые вопросы</h2></div>
          <div className="space-y-3 mb-12">
            {[
              { q: "Какую минимальную толщину нарезки обеспечивает слайсер?", a: "Наши слайсеры обеспечивают нарезку от 1 мм с погрешностью менее 1%. Точная настройка толщины позволяет получить одинаковые ломтики для любого продукта." },
              { q: "Какие продукты можно нарезать?", a: "Слайсеры работают с мясом (свежим и замороженным), птицей, рыбой, сыром, овощами и деликатесами. Модели подбираются под конкретный продукт и задачу." },
              { q: "Как часто нужно менять ножи?", a: "Ресурс ножей зависит от интенсивности работы и типа продукта. В среднем заточка требуется каждые 2–4 недели. Замена ножей — простая процедура без специальных инструментов." },
              { q: "Какая производительность слайсеров?", a: "До 260 резов в минуту в зависимости от модели. Точная производительность зависит от типа продукта и толщины нарезки." },
              { q: "Как устроена санитарная обработка?", a: "Корпус из нержавеющей стали, быстросъёмные детали. Полная мойка занимает 15–30 минут стандартными дезинфектантами." },
            ].map((faq, i) => (
              <div key={i} className={`bg-white border border-border rounded-2xl overflow-hidden transition-all duration-700 ${vis("faq") ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`} style={{ transitionDelay: `${i * 60}ms` }}>
                <button onClick={() => setOpenFaq(openFaq === i ? null : i)} className="w-full flex items-center justify-between px-6 py-5 text-left hover:bg-primary/3 transition-colors"><span className="font-semibold text-base text-foreground pr-4">{faq.q}</span><Icon name={openFaq === i ? "ChevronUp" : "ChevronDown"} size={20} className="text-primary flex-shrink-0" /></button>
                {openFaq === i && (<div className="px-6 pb-5 text-muted-foreground text-base leading-relaxed border-t border-border bg-primary/3"><div className="pt-4">{faq.a}</div></div>)}
              </div>
            ))}
          </div>
          <div className="text-center"><a href="#contacts" className={btnPrimary + " inline-flex items-center gap-2"}>Задать вопрос<Icon name="MessageCircle" size={18} /></a></div>
        </div>
      </section>

      <section id="technosib" className="py-12 px-6 bg-gradient-to-b from-background to-white">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-display font-black text-center mb-10 text-foreground">О компании ТЕХНО-СИБ</h2>
          <div className="grid sm:grid-cols-3 gap-5 mb-8">
            {[{ icon: "Calendar", title: "25 лет на рынке", desc: "Опыт работы с 2001 года" },{ icon: "MapPin", title: "2 города", desc: "Офисы в Москве и Новосибирске" },{ icon: "Globe", title: "Проверенные партнёры", desc: "Из Европы, России и Китая" }].map((s, i) => (
              <div key={i} className="bg-white rounded-2xl shadow-md p-6 text-center hover:shadow-lg transition-shadow"><div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4"><Icon name={s.icon} fallback="Star" size={30} className="text-primary" /></div><h3 className="font-bold text-lg text-foreground mb-1">{s.title}</h3><p className="text-muted-foreground text-sm">{s.desc}</p></div>
            ))}
          </div>
          <div className="bg-white rounded-2xl shadow-lg p-7 sm:p-10">
            <p className="text-lg text-muted-foreground leading-relaxed mb-5">Компания <strong className="text-foreground">«Техно-Сиб»</strong> — надёжный поставщик и партнёр в сфере профессионального пищевого и фасовочно-упаковочного оборудования. Мы работаем с 2001 года и уже 25 лет помогаем предприятиям эффективно оснащать производства, предоставляем сервисное обслуживание, а также реализуем упаковочные и расходные материалы.</p>
            <div className="border-l-4 border-primary bg-primary/5 rounded-r-xl px-5 py-4 mb-5"><p className="font-medium text-foreground">Мы сотрудничаем с ведущими заводами-производителями Европы, России и Китая, подбирая решения под задачи и бюджет клиента.</p></div>
            <p className="text-lg text-muted-foreground leading-relaxed mb-5">Собственные офисы продаж, склады, сервисная служба и отлаженная логистика в Москве и Новосибирске позволяют нам оперативно выполнять поставки и поддерживать оборудование на территории России и стран СНГ.</p>
            <p className="text-lg text-muted-foreground leading-relaxed mb-8">Экспертиза наших специалистов помогает решать задачи любого уровня сложности — от подбора единичной позиции до комплексного оснащения. <strong className="text-foreground">«Техно-Сиб»</strong> всегда предложит оптимальное решение для вашего бизнеса и обеспечит надёжную поддержку на всех этапах работы.</p>
            <div className="border-t border-border/50 pt-7 grid sm:grid-cols-2 gap-5">
              {[{ title: "Комплексные решения", desc: "От подбора оборудования до сервисного обслуживания" },{ title: "Быстрая доставка", desc: "Собственная логистика по всей России и СНГ" },{ title: "Сервисная поддержка", desc: "Гарантийное и постгарантийное обслуживание" },{ title: "Экспертная консультация", desc: "Помощь в выборе оптимального решения" }].map((f, i) => (
                <div key={i} className="flex items-start gap-3"><Icon name="CheckCircle" size={22} className="text-primary flex-shrink-0 mt-0.5" /><div><p className="font-semibold text-foreground">{f.title}</p><p className="text-sm text-muted-foreground">{f.desc}</p></div></div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section id="contacts" className="py-12 px-6 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className={`text-center mb-16 transition-all duration-1000 ${vis("contacts") ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}><h2 className="text-5xl lg:text-6xl font-display font-black tracking-tight text-foreground leading-tight">Обсудим вашу задачу</h2></div>
          <div className="grid lg:grid-cols-2 gap-14 items-start">
            <div className={`transition-all duration-1000 ${vis("contacts") ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-8"}`}>
              <div className="flex justify-center mb-10">
                <div className="p-8 bg-gradient-to-br from-primary/5 to-primary/10 border border-primary/20 rounded-3xl shadow-xl w-full max-w-sm">
                  <div className="flex justify-center mb-6"><div className="w-28 h-28 bg-primary/10 rounded-2xl flex items-center justify-center"><Icon name="Factory" size={56} className="text-primary" /></div></div>
                  <p className="text-center text-sm font-medium text-muted-foreground mb-6">Оборудование в чистом пищевом цехе</p>
                  <div className="space-y-4">
                    {[{ icon: "Phone", label: "Телефон", value: "8 800 505-91-24", href: "tel:88005059124", goal: "click_phone" },{ icon: "Mail", label: "Почта", value: "massagers@t-sib.ru", href: "mailto:massagers@t-sib.ru", goal: "click_email" }].map((c, i) => (
                      // eslint-disable-next-line @typescript-eslint/no-explicit-any
                      <a key={i} href={c.href} onClick={() => { try { (window as any).ym?.(107258870, 'reachGoal', c.goal); } catch (_e) { /* noop */ } }} className="flex items-center gap-4 p-4 bg-white border border-primary/10 rounded-xl hover:border-primary/30 transition-colors"><div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0"><Icon name={c.icon} fallback="Star" size={18} className="text-primary" /></div><div><p className="text-xs text-muted-foreground">{c.label}</p><p className="font-bold text-base text-foreground">{c.value}</p></div></a>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            <div className={`transition-all duration-1000 delay-300 ${vis("contacts") ? "opacity-100 translate-x-0" : "opacity-0 translate-x-8"}`}>
              <div className="p-8 bg-background border-2 border-primary/15 rounded-3xl shadow-sm">
                <h3 className="font-display font-bold text-2xl mb-2 text-foreground">Отправить вопрос</h3>
                <p className="text-muted-foreground mb-6 text-sm">Технолог ответит в течение 2 часов</p>
                <div className="space-y-4">
                  <input type="text" placeholder="Имя *" required value={contactsName} onChange={e => setContactsName(e.target.value)} className={inputCls} />
                  <div><input type="tel" placeholder="+7 (___) ___-__-__" required value={contactsPhone} onChange={e => setContactsPhone(formatPhone(contactsPhone, e.target.value))} onBlur={() => setContactsPhoneTouched(true)} className={contactsPhoneTouched && !isValidPhone(contactsPhone) ? inputError : inputCls} />{contactsPhoneTouched && !isValidPhone(contactsPhone) && <p className="text-xs text-red-500 mt-1">Введите номер России, Казахстана или Беларуси</p>}</div>
                  <textarea placeholder="Комментарий (продукт, объём, задача)" rows={4} value={contactsComment} onChange={e => setContactsComment(e.target.value)} className={inputCls + " resize-none"} />
                  <button onClick={() => { if (contactsName.trim() && isValidPhone(contactsPhone) && !sending) { sendLead({ name: contactsName, phone: contactsPhone, comment: contactsComment, topic: 'слайсеры', formType: 'contacts' }); setContactsName(""); setContactsPhone(""); setContactsComment(""); setContactsPhoneTouched(false); } }} disabled={!contactsName.trim() || !isValidPhone(contactsPhone) || sending} className="w-full py-4 bg-primary text-white rounded-xl font-bold text-base hover:bg-primary/90 transition-all shadow-sm disabled:opacity-40">{sending ? "Отправляем..." : "Отправить"}</button>
                  {CONSENT_TEXT}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {modalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm" onClick={() => setModalOpen(false)}>
          <div className="bg-white rounded-3xl shadow-2xl p-8 w-full max-w-md" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <div><h3 className="font-display font-bold text-2xl text-foreground">{modalProduct === "consult" ? "Получить консультацию технолога" : modalProduct ? "Запросить КП" : "Получить предложение"}</h3>{modalProduct && modalProduct !== "consult" && (<p className="text-sm text-primary mt-1">{modalProduct}</p>)}</div>
              <button onClick={() => setModalOpen(false)} className="w-10 h-10 flex items-center justify-center rounded-xl bg-background hover:bg-primary/10 transition-colors"><Icon name="X" size={20} className="text-muted-foreground" /></button>
            </div>
            <div className="space-y-4">
              <input type="text" placeholder="Имя *" required value={modalName} onChange={e => setModalName(e.target.value)} className={inputCls} />
              <div><input type="tel" placeholder="+7 (___) ___-__-__" required value={modalPhone} onChange={e => setModalPhone(formatPhone(modalPhone, e.target.value))} onBlur={() => setModalPhoneTouched(true)} className={modalPhoneTouched && !isValidPhone(modalPhone) ? inputError : inputCls} />{modalPhoneTouched && !isValidPhone(modalPhone) && <p className="text-xs text-red-500 mt-1">Введите номер России, Казахстана или Беларуси</p>}</div>
              <button onClick={() => { if (modalName.trim() && isValidPhone(modalPhone) && !sending) { sendLead({ name: modalName, phone: modalPhone, product: modalProduct, topic: 'слайсеры', formType: 'modal' }); setModalOpen(false); setModalName(""); setModalPhone(""); setModalPhoneTouched(false); } }} disabled={!modalName.trim() || !isValidPhone(modalPhone) || sending} className="w-full py-4 bg-primary text-white rounded-xl font-bold text-lg hover:bg-primary/90 transition-all shadow-md disabled:opacity-40">{sending ? "Отправляем..." : "Отправить"}</button>
              {CONSENT_TEXT}
            </div>
          </div>
        </div>
      )}

      <footer className="border-t border-border py-12 px-6 bg-background">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-10">
            <div className="md:col-span-1">
              <img src="https://cdn.poehali.dev/files/b643e2cd-1c2b-461b-b32b-4053b1b9e72b.jpg" alt="Техносиб" className="h-8 w-auto object-contain mb-2" />
              <p className="text-xs text-muted-foreground mb-4">Оборудование для маринования и посола мяса</p>
              <div className="space-y-2">
                {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                <a href="tel:88005059124" onClick={() => { try { (window as any).ym?.(107258870, 'reachGoal', 'click_phone'); } catch (_e) { /* noop */ } }} className="flex items-center gap-2 text-sm text-foreground hover:text-primary transition-colors"><Icon name="Phone" size={14} className="text-primary" />8 800 505-91-24</a>
                {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                <a href="mailto:massagers@t-sib.ru" onClick={() => { try { (window as any).ym?.(107258870, 'reachGoal', 'click_email'); } catch (_e) { /* noop */ } }} className="flex items-center gap-2 text-sm text-foreground hover:text-primary transition-colors"><Icon name="Mail" size={14} className="text-primary" />massagers@t-sib.ru</a>
              </div>
            </div>
            <div>
              <p className="font-semibold text-sm text-foreground mb-3">Оборудование</p>
              <div className="space-y-2">
                <a href="/" className="block text-sm text-muted-foreground hover:text-primary transition-colors">Вакуумные массажеры</a>
                <a href="/injector" className="block text-sm text-muted-foreground hover:text-primary transition-colors">Инъекторы</a>
                <a href="#catalog" className="block text-sm text-muted-foreground hover:text-primary transition-colors">Каталог слайсеров</a>
              </div>
            </div>
            <div>
              <p className="font-semibold text-sm text-foreground mb-3">Компания</p>
              <div className="space-y-2">
                {["#benefits", "#compare", "#service", "#technosib", "#faq"].map((href, i) => (<a key={i} href={href} className="block text-sm text-muted-foreground hover:text-primary transition-colors">{["Преимущества", "Подбор оборудования", "От подбора до запуска", "О компании Техно-Сиб", "Вопросы"][i]}</a>))}
              </div>
            </div>
            <div>
              <p className="font-semibold text-sm text-foreground mb-3">Подбор</p>
              <div className="space-y-2">
                {[["#compare", "Подобрать оборудование"], ["#contacts", "Контакты"], ["#contacts", "Запросить КП"]].map(([href, label], i) => (<a key={i} href={href} className="block text-sm text-muted-foreground hover:text-primary transition-colors">{label}</a>))}
              </div>
              <div className="mt-6"><a href="#contacts" className="inline-block px-5 py-2.5 bg-primary text-white text-sm font-semibold rounded-full hover:bg-primary/90 transition-all shadow-sm">Рассчитать решение</a></div>
            </div>
          </div>
          <div className="border-t border-border pt-6 flex flex-col md:flex-row items-center justify-end gap-6 text-xs text-muted-foreground">
            <a href="https://t-sib.ru/assets/politika_t-sib16.05.25.pdf" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">Политика обработки данных</a>
            <a href="https://t-sib.ru/assets/soglasie_t-sib16.05.25.pdf" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">Согласие на обработку</a>
          </div>
        </div>
      </footer>

      {videoOpen && (
        <div className="fixed inset-0 z-[150] bg-black/95 flex items-center justify-center p-4" onClick={() => setVideoOpen(false)}>
          <button onClick={() => setVideoOpen(false)} className="absolute top-4 right-4 z-10 w-12 h-12 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition-colors">
            <Icon name="X" size={24} className="text-white" />
          </button>
          <div className="w-full max-w-5xl aspect-video" onClick={(e) => e.stopPropagation()}>
            <iframe src="https://rutube.ru/play/embed/8da885b0d83746946a92da33e0538c41/" className="w-full h-full rounded-2xl" allowFullScreen allow="autoplay; fullscreen" title="Оборудование для нарезки" />
          </div>
        </div>
      )}

      {lightboxOpen && lightboxPhotos.length > 0 && (
        <div className="fixed inset-0 z-[200] bg-black/90 flex items-center justify-center" onClick={() => setLightboxOpen(false)}>
          <button onClick={() => setLightboxOpen(false)} className="absolute top-4 right-4 z-10 w-12 h-12 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition-colors">
            <Icon name="X" size={24} className="text-white" />
          </button>
          <div className="relative w-full h-full flex items-center justify-center p-4" onClick={(e) => e.stopPropagation()}>
            <img src={lightboxPhotos[lightboxIndex]} alt="" className="max-w-full max-h-full object-contain" />
            {lightboxPhotos.length > 1 && (
              <>
                <button onClick={() => setLightboxIndex((i) => (i - 1 + lightboxPhotos.length) % lightboxPhotos.length)} className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition-colors">
                  <Icon name="ChevronLeft" size={24} className="text-white" />
                </button>
                <button onClick={() => setLightboxIndex((i) => (i + 1) % lightboxPhotos.length)} className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition-colors">
                  <Icon name="ChevronRight" size={24} className="text-white" />
                </button>
                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2">
                  {lightboxPhotos.map((_, i) => (
                    <button key={i} onClick={() => setLightboxIndex(i)} className={`w-2.5 h-2.5 rounded-full transition-all ${i === lightboxIndex ? "bg-white" : "bg-white/40"}`} />
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      )}

      <ThankYouModal open={thankYouOpen} onClose={() => setThankYouOpen(false)} />
    </div>
  );
};

export default Slicers;