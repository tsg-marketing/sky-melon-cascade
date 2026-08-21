import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import Icon from "@/components/ui/icon";
import ThankYouModal from "@/components/ThankYouModal";
import QuizSideTrigger from "@/components/QuizSideTrigger";
import { useLeadForm } from "@/hooks/useLeadForm";
import { productPath, fetchCatalog, pickListingParams, CatalogItem } from "@/lib/catalog";
import SiteHeader from "@/components/site/SiteHeader";

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
  raw = raw.slice(0, isBy ? 12 : 11);
  if (!raw) return "";
  return "+" + raw;
}

function isValidEmail(v: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
}

const btnPrimary = "px-8 py-4 bg-primary text-white rounded-full font-bold text-lg hover:bg-primary/90 transition-all shadow-lg shadow-primary/20";

// Сколько моделей показываем до нажатия «Показать все» (кратно 3 колонкам).
const VISIBLE_COUNT = 12;

const ConsentCheckbox = ({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) => (
  <label className="flex items-start gap-2 cursor-pointer select-none">
    <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="mt-0.5 w-4 h-4 flex-shrink-0 accent-orange-500 cursor-pointer" />
    <span className="text-xs text-muted-foreground leading-relaxed">
      Отправляя форму, я соглашаюсь с{" "}
      <a href="https://t-sib.ru/assets/politika_t-sib16.05.25.pdf" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">политикой обработки персональных данных</a>
      {" "}и даю{" "}
      <a href="https://t-sib.ru/assets/soglasie_t-sib16.05.25.pdf" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">согласие на обработку персональных данных</a>.
    </span>
  </label>
);

const QUIZ_QUESTIONS = [
  { q: "Какой продукт формуете?", options: ["Котлеты и шницели", "Бургеры и стейк-котлеты", "Наггетсы в панировке", "Фрикадельки и тефтели", "Рыба, птица, растительный фарш", "Несколько позиций"] },
  { q: "Какой объём в смену?", options: ["До 500 кг", "500–2000 кг", "2000–5000 кг", "Больше 5000 кг"] },
  { q: "Какой вес одного изделия?", options: ["До 50 г", "50–120 г", "120–250 г", "Больше 250 г", "Разный ассортимент"] },
  { q: "Нужна ли панировка и льезон?", options: ["Да, участок целиком", "Только формовка", "Панировка уже есть", "Ещё не решили"] },
  { q: "Когда нужно оборудование?", options: ["Срочно 1–2 недели", "В течение месяца", "Квартал", "Изучаем рынок"] },
];

const QuizBlock = ({ onSent }: { onSent: (name: string, phone: string, email: string, quizAnswers: Record<string, string>) => void }) => {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<string[]>([]);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [phoneTouched, setPhoneTouched] = useState(false);
  const [consent, setConsent] = useState(false);
  const isLast = step === QUIZ_QUESTIONS.length;
  const phoneValid = isValidPhone(phone);
  const emailValid = !email.trim() || isValidEmail(email);
  const choose = (opt: string) => { setAnswers([...answers, opt]); setStep(step + 1); };
  const handleSubmit = () => {
    if (!phoneValid || !consent || !emailValid) return;
    const quizAnswers: Record<string, string> = {};
    QUIZ_QUESTIONS.forEach((q, i) => { quizAnswers[q.q] = answers[i] || ""; });
    onSent(name, phone, email, quizAnswers);
  };
  return (
    <div className="max-w-2xl mx-auto">
      {!isLast ? (
        <div>
          <div className="flex items-center gap-3 mb-8">
            {QUIZ_QUESTIONS.map((_, i) => (<div key={i} className={`h-2 flex-1 rounded-full transition-all ${i < step ? "bg-primary" : i === step ? "bg-primary/50" : "bg-border"}`} />))}
          </div>
          <p className="text-sm text-muted-foreground mb-2">Вопрос {step + 1} из {QUIZ_QUESTIONS.length}</p>
          <h3 className="text-2xl sm:text-3xl font-bold text-foreground mb-8">{QUIZ_QUESTIONS[step].q}</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {QUIZ_QUESTIONS[step].options.map((opt, i) => (
              <button key={i} onClick={() => choose(opt)} className="p-5 text-left bg-white border-2 border-border rounded-2xl hover:border-primary hover:bg-primary/5 transition-all font-semibold text-lg text-foreground">{opt}</button>
            ))}
          </div>
          {step > 0 && (<button onClick={() => { setStep(step - 1); setAnswers(answers.slice(0, -1)); }} className="mt-6 text-sm text-muted-foreground hover:text-primary transition-colors">← Назад</button>)}
        </div>
      ) : (
        <div className="p-8 bg-white border-2 border-primary/20 rounded-3xl shadow-sm">
          <h3 className="font-display font-bold text-3xl mb-2 text-foreground text-center">Осталось совсем немного!</h3>
          <p className="text-muted-foreground text-base mb-8 text-center">Оставьте контакты — технолог подберёт автомат и пришлёт КП</p>
          <div className="space-y-4">
            <input type="text" placeholder="Ваше имя" value={name} onChange={e => setName(e.target.value)} className={inputCls} />
            <div>
              <input type="tel" placeholder="+7 (___) ___-__-__" value={phone} onChange={e => setPhone(formatPhone(phone, e.target.value))} onBlur={() => setPhoneTouched(true)} className={phoneTouched && !phoneValid ? inputError : inputCls} />
              {phoneTouched && !phoneValid && <p className="text-xs text-red-500 mt-1">Введите номер России, Казахстана или Беларуси</p>}
            </div>
            <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} className={email.trim() && !emailValid ? inputError : inputCls} />
            <ConsentCheckbox checked={consent} onChange={setConsent} />
            <button onClick={handleSubmit} disabled={!phoneValid || !consent || !emailValid} className="w-full py-4 bg-orange-500 hover:bg-orange-600 text-white rounded-xl font-bold text-lg transition-all shadow-sm disabled:opacity-40">Получить подборку</button>
          </div>
          <button onClick={() => { setStep(step - 1); setAnswers(answers.slice(0, -1)); }} className="mt-6 text-sm text-muted-foreground hover:text-primary transition-colors">← Назад</button>
        </div>
      )}
    </div>
  );
};

const TYPE_FILTERS = [
  { key: "all", label: "Все" },
  { key: "patty", label: "Котлетоформовочные автоматы" },
  { key: "industrial", label: "Промышленные формующие машины" },
  { key: "meatballs", label: "Фрикадельки" },
  { key: "breading", label: "Панировка и льезон" },
];

/** Тип оборудования определяется по названию товара — в фиде отдельного поля нет. */
function equipmentType(name: string): string {
  const n = (name || "").toLowerCase();
  if (n.includes("фрикадел")) return "meatballs";
  if (n.includes("hkf")) return "industrial";
  if (
    n.includes("панировк") || n.includes("панировщик") || n.includes("льезон") ||
    n.includes("посыпочн") || n.includes("gazer") || n.includes("газер") ||
    n.includes("hkskj") || n.includes("hknjj") || n.includes("hksfj")
  ) return "breading";
  return "patty";
}

/** Числовое значение производительности для сортировки «сначала производительные». */
function productivityValue(item: CatalogItem): number {
  const p = item.all_params?.find((x) => x.name.toLowerCase().includes("производительн"));
  if (!p) return -1;
  const m = p.value.replace(/\s/g, "").match(/(\d+(?:[.,]\d+)?)/g);
  if (!m) return -1;
  return Math.max(...m.map((x) => parseFloat(x.replace(",", "."))));
}

/** Минимальная цена по типу оборудования — для динамических текстов на странице. */
function minPriceByType(items: CatalogItem[] | null, type: string): string | null {
  const prices = (items || [])
    .filter((i) => equipmentType(i.name) === type && typeof i.price === "number" && i.price! > 0)
    .map((i) => i.price as number);
  if (!prices.length) return null;
  return `${Math.round(Math.min(...prices)).toLocaleString("ru-RU")} ₽`;
}

const KotletnyyAvtomat = () => {
  const { sendLead, sending, thankYouOpen, setThankYouOpen } = useLeadForm();
  const navigate = useNavigate();
  const [visibleSections, setVisibleSections] = useState<Record<string, boolean>>({});
  const [modalOpen, setModalOpen] = useState(false);
  const [modalProduct, setModalProduct] = useState("");
  const [modalName, setModalName] = useState("");
  const [modalPhone, setModalPhone] = useState("");
  const [modalPhoneTouched, setModalPhoneTouched] = useState(false);
  const [modalConsent, setModalConsent] = useState(false);
  const [quickName, setQuickName] = useState("");
  const [quickPhone, setQuickPhone] = useState("");
  const [quickEmail, setQuickEmail] = useState("");
  const [quickPhoneTouched, setQuickPhoneTouched] = useState(false);
  const [quickConsent, setQuickConsent] = useState(false);
  const [contactsName, setContactsName] = useState("");
  const [contactsPhone, setContactsPhone] = useState("");
  const [contactsEmail, setContactsEmail] = useState("");
  const [contactsComment, setContactsComment] = useState("");
  const [contactsPhoneTouched, setContactsPhoneTouched] = useState(false);
  const [contactsConsent, setContactsConsent] = useState(false);
  const [emailCopied, setEmailCopied] = useState(false);
  const [openFaq, setOpenFaq] = useState<string | null>(null);
  const [catalogExpanded, setCatalogExpanded] = useState(false);
  const [items, setItems] = useState<CatalogItem[] | null>(null);
  const [catalogLoading, setCatalogLoading] = useState(true);
  const [catalogSearch, setCatalogSearch] = useState("");
  const [brandFilter, setBrandFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [sortMode, setSortMode] = useState("price");
  const [cardSlides, setCardSlides] = useState<Record<string, number>>({});
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxPhotos, setLightboxPhotos] = useState<string[]>([]);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [playingVideo, setPlayingVideo] = useState<string | null>(null);
  const [videoModal, setVideoModal] = useState<CatalogItem | null>(null);

  const scrollTo = (id: string) => document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });

  useEffect(() => {
    document.title = "Котлетные автоматы — купить котлетоформовочный аппарат от поставщика";
    const setMeta = (name: string, content: string, property?: boolean) => {
      const attr = property ? "property" : "name";
      let el = document.querySelector(`meta[${attr}="${name}"]`);
      if (!el) { el = document.createElement("meta"); el.setAttribute(attr, name); document.head.appendChild(el); }
      el.setAttribute("content", content);
    };
    setMeta("description", "Котлетные автоматы для мясного производства: формовка котлет, бургеров, наггетсов и фрикаделек от 1 680 до 12 000 изделий в час. 25 моделей, точность дозирования до ±1%, гарантия 12 месяцев.");
    setMeta("keywords", "котлетный автомат, котлетоформовочный автомат, формовочная машина, аппарат для котлет, машина для бургеров, формовщик фрикаделек, панировочная линия");
    setMeta("og:title", "Котлетные автоматы и формовочное оборудование | Техно-Сиб", true);
    setMeta("og:description", "Подбираем автомат под ваш фарш, вес изделия и объём смены. Формовка, льезон, панировка и посыпка — собираем участок целиком.", true);
    setMeta("og:url", "https://meatmassagers.ru/kotletnyy-avtomat", true);
    setMeta("og:type", "website", true);
    const link = document.querySelector("link[rel='canonical']") || document.createElement("link");
    link.setAttribute("rel", "canonical");
    link.setAttribute("href", "https://meatmassagers.ru/kotletnyy-avtomat");
    if (!link.parentNode) document.head.appendChild(link);

    const schema = {
      "@context": "https://schema.org",
      "@graph": [
        { "@type": "WebPage", "@id": "https://meatmassagers.ru/kotletnyy-avtomat", "url": "https://meatmassagers.ru/kotletnyy-avtomat", "name": "Котлетные автоматы", "description": "Котлетоформовочные автоматы и формовочное оборудование для мясного производства.", "isPartOf": { "@id": "https://meatmassagers.ru/#website" } },
        { "@type": "WebSite", "@id": "https://meatmassagers.ru/#website", "url": "https://meatmassagers.ru", "name": "Техно-Сиб — оборудование для мясопереработки", "publisher": { "@id": "https://meatmassagers.ru/#org" } },
        { "@type": "Organization", "@id": "https://meatmassagers.ru/#org", "name": "Техно-Сиб", "url": "https://meatmassagers.ru", "telephone": "+7-800-505-76-84", "email": "massagers@t-sib.ru", "address": { "@type": "PostalAddress", "addressCountry": "RU", "addressLocality": "Новосибирск" }, "foundingDate": "2001" },
        { "@type": "BreadcrumbList", "itemListElement": [
          { "@type": "ListItem", "position": 1, "name": "Главная", "item": "https://meatmassagers.ru/" },
          { "@type": "ListItem", "position": 2, "name": "Котлетные автоматы", "item": "https://meatmassagers.ru/kotletnyy-avtomat" }
        ]},
        { "@type": "FAQPage", "mainEntity": [
          { "@type": "Question", "name": "Сколько стоит котлетный автомат?", "acceptedAnswer": { "@type": "Answer", "text": "В нашем каталоге цены начинаются от 174 000 ₽ за формовщик фрикаделек и от 293 000 ₽ за котлетоформовочный автомат. Промышленные формующие машины — от 2 300 000 ₽. Итоговая цена зависит от производительности, комплекта матриц и необходимости панировочной линии." }},
          { "@type": "Question", "name": "Автомат будет работать с моим фаршем?", "acceptedAnswer": { "@type": "Answer", "text": "Оборудование рассчитано на говяжий, свиной, куриный, рыбный и растительный фарш. Ключевые факторы — жирность, структура и температура сырья. Рекомендуем привезти своё сырьё в демозал и протестировать формовку до покупки." }},
          { "@type": "Question", "name": "Насколько точный вес изделия?", "acceptedAnswer": { "@type": "Answer", "text": "Погрешность дозирования зависит от модели: у промышленных формующих машин — до ±1%, у котлетоформовочных автоматов — от 4 до 5%. Точную цифру по конкретной модели смотрите в характеристиках карточки." }},
          { "@type": "Question", "name": "Какое нужно подключение?", "acceptedAnswer": { "@type": "Answer", "text": "Большинство моделей работают от 220 В, промышленные — от 380 В. Мощность в линейке — от 0,1 до 11 кВт. Некоторым моделям нужен сжатый воздух (6 бар). Все требования указаны в характеристиках товара." }}
        ]}
      ]
    };
    let scriptEl = document.getElementById("schema-kotletnyy");
    if (!scriptEl) { scriptEl = document.createElement("script"); scriptEl.id = "schema-kotletnyy"; scriptEl.setAttribute("type", "application/ld+json"); document.head.appendChild(scriptEl); }
    scriptEl.textContent = JSON.stringify(schema);
  }, []);

  useEffect(() => {
    const ids = ["hero", "segments-usecases", "advantages", "catalog", "howto", "line", "process", "videos", "quiz", "about", "faq", "contacts"];
    setVisibleSections((prev) => ({ ...prev, hero: true }));
    const observers: Record<string, IntersectionObserver> = {};
    ids.forEach((id) => {
      const el = document.getElementById(id);
      if (!el) return;
      observers[id] = new IntersectionObserver(([entry]) => { if (entry.isIntersecting) { setVisibleSections((prev) => ({ ...prev, [id]: true })); observers[id].unobserve(el); } }, { threshold: 0.08 });
      observers[id].observe(el);
    });
    return () => Object.values(observers).forEach((o) => o.disconnect());
  }, [items]);

  const vis = (id: string) => visibleSections[id];

  useEffect(() => {
    setCatalogLoading(true);
    fetchCatalog("patty")
      .then((d) => setItems(d.patty || []))
      .catch(() => setItems([]))
      .finally(() => setCatalogLoading(false));
  }, []);

  const brands = useCallback(() => {
    const set = new Set<string>();
    (items || []).forEach((i) => { if (i.brand) set.add(i.brand); });
    return Array.from(set).sort();
  }, [items]);

  const filteredItems = useCallback(() => {
    let list = [...(items || [])];
    if (brandFilter !== "all") list = list.filter((i) => i.brand === brandFilter);
    if (typeFilter !== "all") list = list.filter((i) => equipmentType(i.name) === typeFilter);
    if (catalogSearch.trim()) {
      const q = catalogSearch.toLowerCase();
      list = list.filter((i) => i.name.toLowerCase().includes(q));
    }
    if (sortMode === "name") list.sort((a, b) => a.name.localeCompare(b.name, "ru"));
    else if (sortMode === "productivity") list.sort((a, b) => productivityValue(b) - productivityValue(a));
    else list.sort((a, b) => (a.price ?? Infinity) - (b.price ?? Infinity));
    return list;
  }, [items, catalogSearch, brandFilter, typeFilter, sortMode]);

  const videoItems = useCallback(() => (items || []).filter((i) => i.video).slice(0, 3), [items]);

  const priceAnswer = useCallback(() => {
    const meatballs = minPriceByType(items, "meatballs");
    const patty = minPriceByType(items, "patty");
    const industrial = minPriceByType(items, "industrial");
    if (!meatballs && !patty && !industrial) {
      return "Цена зависит от производительности, комплекта матриц и необходимости панировочной линии. Оставьте заявку — пришлём актуальный прайс.";
    }
    const parts: string[] = [];
    if (meatballs) parts.push(`от ${meatballs} за формовщик фрикаделек`);
    if (patty) parts.push(`от ${patty} за котлетоформовочный автомат`);
    const head = parts.length ? `В нашем каталоге цены начинаются ${parts.join(" и ")}. ` : "";
    const ind = industrial ? `Промышленные формующие машины — от ${industrial}. ` : "";
    return `${head}${ind}Итоговая цена зависит от производительности, комплекта матриц и необходимости панировочной линии.`;
  }, [items]);

  useEffect(() => {
    if (!videoModal && !lightboxOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      setVideoModal(null);
      setLightboxOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [videoModal, lightboxOpen]);

  const openLightbox = (photos: string[], index: number) => { setLightboxPhotos(photos); setLightboxIndex(index); setLightboxOpen(true); };

  const copyEmail = () => {
    navigator.clipboard?.writeText("massagers@t-sib.ru").then(() => {
      setEmailCopied(true);
      setTimeout(() => setEmailCopied(false), 1500);
    }).catch(() => { /* noop */ });
    try { (window as unknown as { ym?: (...a: unknown[]) => void }).ym?.(107258870, "reachGoal", "click_email"); } catch { /* noop */ }
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteHeader current="/kotletnyy-avtomat" onGetKp={() => { setModalProduct("Получить КП за 24 часа"); setModalOpen(true); }} />

      <nav className="hidden lg:block sticky top-[72px] z-40 bg-white/95 backdrop-blur border-b border-border">
        <div className="max-w-7xl mx-auto px-6 flex items-center gap-1 h-12 overflow-x-auto">
          {[["catalog", "Каталог"], ["quiz", "Подбор"], ["howto", "Как подобрать"], ["videos", "Видео"], ["faq", "Вопросы"], ["contacts", "Контакты"]].map(([id, label]) => (
            <button key={id} onClick={() => scrollTo(id)} className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-primary transition-colors whitespace-nowrap">{label}</button>
          ))}
        </div>
      </nav>

      <section id="hero" className="relative pt-24 sm:pt-28 pb-14 sm:pb-20 px-4 sm:px-6 bg-gradient-to-br from-primary/5 via-background to-background overflow-hidden">
        <div className="absolute top-24 right-0 w-[600px] h-[600px] bg-primary/6 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 max-w-7xl mx-auto w-full">
          <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">
            <div className={`transition-all duration-1000 ${vis("hero") ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-display font-black leading-[1.05] tracking-tight mb-4 text-foreground">Котлетные автоматы <span className="text-primary">для мясного производства</span></h1>
              <p className="text-lg sm:text-2xl font-semibold text-foreground leading-relaxed mb-6 max-w-xl">Формовка котлет, бургеров, наггетсов и фрикаделек — от 1 680 до 12 000 изделий в час. Подбираем автомат под ваш фарш, вес изделия и объём смены.</p>
              <div className="space-y-5 mb-6">
                {[
                  "25 моделей в наличии и под заказ — от компактных до промышленных линий",
                  "Точность дозирования до ±1% — стабильный вес каждого изделия",
                  "Нержавеющая сталь и пищевой пластик — быстрая разборка и мойка",
                  "Формовка, льезон, панировка и посыпка — собираем участок целиком",
                ].map((t, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <Icon name="CheckCircle2" fallback="Check" size={28} className="text-primary flex-shrink-0 mt-1" />
                    <span className="text-lg sm:text-xl lg:text-2xl text-foreground font-medium leading-snug">{t}</span>
                  </div>
                ))}
              </div>
              <div className="flex flex-col sm:flex-row gap-4">
                <button onClick={() => { setModalProduct("Получить предложение (первый экран)"); setModalOpen(true); }} className="px-8 py-4 bg-orange-500 hover:bg-orange-600 text-white rounded-full font-bold text-lg transition-all shadow-lg text-center">Получить предложение</button>
                <button onClick={() => scrollTo("catalog")} className="px-8 py-4 border-2 border-primary/30 text-primary rounded-full font-semibold text-lg hover:border-primary hover:bg-primary/5 transition-all text-center">Смотреть оборудование</button>
              </div>
            </div>
            <div className={`hidden lg:block transition-all duration-1000 delay-300 ${vis("hero") ? "opacity-100 scale-100" : "opacity-0 scale-95"}`}>
              <img src="/features/hero-kotletnyy.webp" alt="Котлетный автомат F 2000 PLUS" className="w-full h-auto object-contain rounded-3xl" />
            </div>
          </div>
        </div>
      </section>

      <section id="segments-usecases" className="py-12 px-6 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className={`text-center mb-14 transition-all duration-1000 ${vis("segments-usecases") ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-display font-black tracking-tight text-foreground">Какие задачи закрывает котлетный автомат</h2>
            <p className="text-lg text-muted-foreground mt-4 max-w-3xl mx-auto">Одно оборудование — разные продукты. Ниже типовые сценарии, с которыми к нам приходят чаще всего.</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: "Beef", img: "uc-cutlets", title: "Котлеты и полуфабрикаты", desc: "Классические котлеты, шницели, зразы. Вес изделия от 20 до 500 г, толщина от 6 до 25 мм. Формовка идёт без предварительного подмораживания фарша." },
              { icon: "Sandwich", img: "uc-burgers", title: "Бургеры и стейк-котлеты", desc: "Круглые и овальные заготовки диаметром до 135 мм. Ровный край, одинаковая толщина, стабильный вес — продукт не «плывёт» на гриле." },
              { icon: "Drumstick", img: "uc-nuggets", title: "Наггетсы и продукция в панировке", desc: "Формовка + льезон + панировочные сухари в одну линию. Панировщики работают синхронно с формовочной машиной через транспортёр." },
              { icon: "Circle", img: "uc-meatballs", title: "Фрикадельки и тефтели", desc: "Отдельные машины под шарики диаметром от 18 до 38 мм, производительность до 250 шт/мин." },
              { icon: "Fish", img: "uc-fish", title: "Рыба, птица, растительный фарш", desc: "Оборудование работает не только с говядиной и свининой: подходит для куриного фарша, рыбного фарша и растительных альтернатив." },
              { icon: "Factory", img: "uc-newshop", title: "Запуск нового цеха с нуля", desc: "Рассчитаем весь участок — от формовки до упаковки — под заявленный объём смены и площадь помещения." },
            ].map((c, i) => (
              <div key={i} className={`bg-background border border-border rounded-2xl overflow-hidden hover:border-primary/40 hover:shadow-lg transition-all ${vis("segments-usecases") ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`} style={{ transitionDelay: `${i * 80}ms`, transitionDuration: "700ms" }}>
                <div className="relative aspect-[4/3] overflow-hidden bg-secondary">
                  <img src={`/features/${c.img}.webp`} alt={c.title} loading="lazy" className="w-full h-full object-cover" />
                  <div className="absolute top-3 left-3 w-11 h-11 bg-white/95 backdrop-blur rounded-xl flex items-center justify-center shadow-sm"><Icon name={c.icon} fallback="Star" size={22} className="text-primary" /></div>
                </div>
                <div className="p-6">
                  <h3 className="font-bold text-xl text-foreground mb-2">{c.title}</h3>
                  <p className="text-muted-foreground text-base leading-relaxed">{c.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="advantages" className="py-12 px-6 bg-secondary">
        <div className="max-w-7xl mx-auto">
          <div className={`text-center mb-14 transition-all duration-1000 ${vis("advantages") ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-display font-black tracking-tight text-foreground">Почему котлетный автомат берут в Техно-Сиб</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: "SlidersHorizontal", img: "adv-select-kotletnyy", title: "Подбор под ваш фарш", desc: "Учитываем жирность, температуру и структуру сырья. Подбираем матрицу под нужный вес и форму изделия." },
              { icon: "Target", img: "adv-precision", title: "Точность и стабильный вес", desc: "Погрешность дозирования от ±1% до 5% в зависимости от модели — меньше перевеса, меньше потерь на смене." },
              { icon: "Building2", img: "co-demo", title: "Демозал и тест на вашем сырье", desc: "Приезжайте с собственным фаршем и посмотрите результат формовки до покупки. Демозалы в Москве и Новосибирске." },
              { icon: "Cookie", img: "adv-molds", title: "Матрицы и оснастка", desc: "Подбираем и поставляем сменные формы под ваш ассортимент — круг, овал, произвольная форма." },
              { icon: "GraduationCap", img: "adv-simple", title: "Пусконаладка и обучение", desc: "Запускаем оборудование и обучаем операторов работе и мойке. Инструктаж входит в поставку." },
              { icon: "Wrench", img: "co-service", title: "Сервис и запчасти", desc: "Собственная сервисная служба, склад расходников и ЗИП. Не оставляем клиента после отгрузки." },
              { icon: "FileCheck", img: "adv-docs", title: "Документы для тендера", desc: "Полный комплект: КП, спецификации, сертификаты, паспорта. Готовим пакет под 44-ФЗ и 223-ФЗ." },
              { icon: "Truck", img: "adv-delivery", title: "Доставка по всей России", desc: "Отгрузка со складов в Москве и Новосибирске, отлаженная логистика в любой регион." },
            ].map((feat, i) => (
              <div key={i} className={`bg-white border border-border rounded-2xl overflow-hidden hover:border-primary/40 hover:shadow-lg transition-all flex flex-col ${vis("advantages") ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`} style={{ transitionDelay: `${i * 80}ms`, transitionDuration: "700ms" }}>
                <div className="relative aspect-[4/3] overflow-hidden bg-secondary">
                  <img src={`/features/${feat.img}.webp`} alt={feat.title} loading="lazy" className="w-full h-full object-cover" />
                  <div className="absolute top-3 left-3 w-11 h-11 bg-white/95 backdrop-blur rounded-xl flex items-center justify-center shadow-sm"><Icon name={feat.icon} fallback="Star" size={22} className="text-primary" /></div>
                </div>
                <div className="p-6"><h3 className="font-bold text-lg text-foreground mb-2">{feat.title}</h3><p className="text-muted-foreground text-sm leading-relaxed">{feat.desc}</p></div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="catalog" className="py-20 px-6 bg-background">
        <div className="max-w-7xl mx-auto">
          <div className="relative p-6 sm:p-10 bg-gradient-to-br from-primary to-primary/85 rounded-3xl shadow-2xl mb-12 overflow-hidden">
            <div className="absolute -top-16 -right-16 w-64 h-64 bg-white/10 rounded-full pointer-events-none" />
            <div className="relative z-10">
            <h3 className="font-display font-black text-2xl sm:text-3xl mb-2 text-white text-center">Подобрать оборудование с менеджером</h3>
            <p className="text-white/85 text-base mb-7 text-center">Оставьте контакты — подберём модель и пришлём КП</p>
            <div className="grid sm:grid-cols-3 gap-4 mb-4">
              <input type="text" placeholder="Ваше имя" value={quickName} onChange={e => setQuickName(e.target.value)} className={inputCls} />
              <div>
                <input type="tel" placeholder="+7 (___) ___-__-__" value={quickPhone} onChange={e => setQuickPhone(formatPhone(quickPhone, e.target.value))} onBlur={() => setQuickPhoneTouched(true)} className={quickPhoneTouched && !isValidPhone(quickPhone) ? inputError : inputCls} />
                {quickPhoneTouched && !isValidPhone(quickPhone) && <p className="text-xs text-red-500 mt-1">Проверьте номер телефона</p>}
              </div>
              <input type="email" placeholder="Email" value={quickEmail} onChange={e => setQuickEmail(e.target.value)} className={quickEmail.trim() && !isValidEmail(quickEmail) ? inputError : inputCls} />
            </div>
            <div className="mb-5 [&_a]:text-white [&_a]:font-semibold [&_a]:underline [&_span]:text-white"><ConsentCheckbox checked={quickConsent} onChange={setQuickConsent} /></div>
            <button
              onClick={() => {
                if (!isValidPhone(quickPhone) || !quickConsent || sending) return;
                if (quickEmail.trim() && !isValidEmail(quickEmail)) return;
                sendLead({ name: quickName, phone: quickPhone, email: quickEmail, product: "Подобрать оборудование с менеджером", topic: "котлетные автоматы", formType: "inquiry" });
                setQuickName(""); setQuickPhone(""); setQuickEmail(""); setQuickPhoneTouched(false); setQuickConsent(false);
              }}
              disabled={!isValidPhone(quickPhone) || !quickConsent || sending}
              className="w-full sm:w-auto sm:mx-auto sm:block px-12 py-4 bg-orange-500 hover:bg-orange-600 text-white rounded-xl font-bold text-lg transition-all shadow-xl disabled:opacity-40"
            >
              {sending ? "Отправляем..." : "Оставить заявку"}
            </button>
          </div>
          </div>

          <div className={`text-center mb-10 transition-all duration-1000 ${vis("catalog") ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
            <h2 className="text-4xl lg:text-5xl font-display font-black tracking-tight text-foreground leading-tight">Каталог котлетных автоматов</h2>
            <p className="text-lg text-muted-foreground mt-4">Актуальные цены и характеристики. Данные обновляются из каталога сайта ежедневно.</p>
          </div>

          <div className="flex flex-wrap gap-2 justify-center mb-6">
            {TYPE_FILTERS.map((t) => (
              <button key={t.key} onClick={() => { setTypeFilter(t.key); setCatalogExpanded(false); }} className={`px-4 py-2 rounded-full text-sm font-semibold border-2 transition-all ${typeFilter === t.key ? "bg-primary text-white border-primary" : "bg-white text-foreground border-border hover:border-primary/40"}`}>{t.label}</button>
            ))}
          </div>

          <div className="flex flex-col lg:flex-row items-center gap-4 mb-10">
            <div className="relative w-full lg:w-72">
              <Icon name="Search" size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input type="text" placeholder="Поиск по каталогу..." value={catalogSearch} onChange={(e) => setCatalogSearch(e.target.value)} className="w-full pl-10 pr-4 py-3 bg-white border border-border rounded-xl text-foreground text-sm focus:outline-none focus:border-primary transition-colors" />
            </div>
            <select value={sortMode} onChange={(e) => setSortMode(e.target.value)} className="w-full lg:w-56 px-4 py-3 bg-white border border-border rounded-xl text-foreground text-sm focus:outline-none focus:border-primary transition-colors cursor-pointer">
              <option value="price">Сначала недорогие</option>
              <option value="productivity">Сначала производительные</option>
              <option value="name">По названию</option>
            </select>
            {brands().length > 0 && (
              <div className="flex flex-wrap gap-2 justify-center">
                <button onClick={() => setBrandFilter("all")} className={`px-4 py-2 rounded-full text-sm font-semibold border-2 transition-all ${brandFilter === "all" ? "bg-primary text-white border-primary" : "bg-white text-foreground border-border hover:border-primary/40"}`}>Все бренды</button>
                {brands().map((b) => (
                  <button key={b} onClick={() => setBrandFilter(b)} className={`px-4 py-2 rounded-full text-sm font-semibold border-2 transition-all ${brandFilter === b ? "bg-primary text-white border-primary" : "bg-white text-foreground border-border hover:border-primary/40"}`}>{b}</button>
                ))}
              </div>
            )}
          </div>

          {catalogLoading && (<div className="flex items-center justify-center py-24"><div className="flex flex-col items-center gap-4"><div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" /><p className="text-muted-foreground text-sm">Загружаем каталог...</p></div></div>)}

          {!catalogLoading && items && items.length === 0 && (
            <div className="max-w-2xl mx-auto p-8 bg-white border-2 border-primary/20 rounded-3xl text-center">
              <Icon name="PackageSearch" size={48} className="mx-auto mb-4 text-primary/40" />
              <h3 className="font-display font-bold text-2xl text-foreground mb-2">Каталог обновляется</h3>
              <p className="text-muted-foreground mb-6">Оставьте заявку — пришлём актуальный прайс с ценами и характеристиками.</p>
              <button onClick={() => { setModalProduct("Прислать актуальный прайс"); setModalOpen(true); }} className="px-8 py-4 bg-orange-500 hover:bg-orange-600 text-white rounded-full font-bold text-base transition-all shadow-sm">Получить прайс</button>
            </div>
          )}

          {!catalogLoading && items && items.length > 0 && (
            filteredItems().length === 0 ? (
              <div className="text-center py-20 text-muted-foreground">
                <Icon name="SearchX" size={48} className="mx-auto mb-4 opacity-30" />
                <p className="text-lg">Ничего не найдено по вашему запросу</p>
              </div>
            ) : (
              <div>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                  {(catalogExpanded ? filteredItems() : filteredItems().slice(0, VISIBLE_COUNT)).map((item) => {
                    const slide = cardSlides[item.id] || 0;
                    const pics = item.pictures && item.pictures.length ? item.pictures : [];
                    return (
                      <div key={item.id} id={item.slug || `product-${item.id}`} className="bg-white border border-border rounded-2xl overflow-hidden shadow-sm hover:shadow-xl hover:border-primary/40 transition-all flex flex-col group scroll-mt-32">
                        <div className="relative bg-gray-50 overflow-hidden" style={{ aspectRatio: "4/3" }}>
                          {pics.length > 0 ? (
                            <img src={pics[slide]} alt={item.name} referrerPolicy="no-referrer" loading="lazy" onClick={() => openLightbox(pics, slide)} style={{ cursor: "pointer" }} className="w-full h-full object-contain p-4 group-hover:scale-105 transition-transform duration-500" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center"><Icon name="ImageOff" size={40} className="text-muted-foreground/30" /></div>
                          )}
                          {pics.length > 1 && (<>
                            <button onClick={(e) => { e.stopPropagation(); setCardSlides((prev) => ({ ...prev, [item.id]: (slide - 1 + pics.length) % pics.length })); }} className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/90 hover:bg-white rounded-full shadow flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"><Icon name="ChevronLeft" size={16} className="text-foreground" /></button>
                            <button onClick={(e) => { e.stopPropagation(); setCardSlides((prev) => ({ ...prev, [item.id]: (slide + 1) % pics.length })); }} className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/90 hover:bg-white rounded-full shadow flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"><Icon name="ChevronRight" size={16} className="text-foreground" /></button>
                            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">{pics.slice(0, 8).map((_, pi) => (<button key={pi} onClick={(e) => { e.stopPropagation(); setCardSlides((prev) => ({ ...prev, [item.id]: pi })); }} className={`w-1.5 h-1.5 rounded-full transition-all ${pi === slide ? "bg-primary w-4" : "bg-white/70"}`} />))}</div>
                          </>)}
                          {item.brand && (<div className="absolute top-3 left-3 bg-white/95 text-primary text-xs font-bold px-3 py-1 rounded-full shadow-sm border border-primary/20 uppercase tracking-wide">{item.brand}</div>)}
                        </div>
                        <div className="p-5 flex flex-col flex-1">
                          <h3 className="font-bold text-xl text-foreground mb-2 leading-snug cursor-pointer hover:text-primary transition-colors" onClick={() => navigate(productPath("kotletnyy-avtomat", item))}>{item.name}</h3>
                          {item.price_display ? (<p className="text-xl font-black text-primary mb-3">от {item.price_display}</p>) : (<p className="text-base font-semibold text-muted-foreground mb-3">Цена по запросу</p>)}
                          <div className="mb-4 flex-1 space-y-1">
                            {pickListingParams(item.all_params).map((p, pi) => (
                              <div key={pi} className="flex items-baseline gap-2 text-sm">
                                <span className="text-muted-foreground">{p.name}:</span>
                                <span className="font-medium text-foreground">{p.value}</span>
                              </div>
                            ))}
                          </div>
                          <div className="space-y-2">
                            <button onClick={() => { setModalProduct(item.name); setModalOpen(true); }} className="w-full py-3.5 bg-orange-500 hover:bg-orange-600 text-white rounded-xl text-base font-bold transition-all shadow-sm">Получить консультацию</button>
                            <button onClick={() => navigate(productPath("kotletnyy-avtomat", item))} className="w-full py-3.5 border-2 border-primary/30 text-primary rounded-xl text-base font-semibold hover:border-primary hover:bg-primary/5 transition-all">Смотреть подробнее</button>
                            {item.video && (
                              <button onClick={() => setVideoModal(item)} className="w-full py-3.5 flex items-center justify-center gap-2 bg-primary/10 border-2 border-primary/20 text-primary rounded-xl text-base font-semibold hover:bg-primary/15 transition-all">
                                <Icon name="Play" size={18} /> Смотреть видео
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
                {filteredItems().length > VISIBLE_COUNT && (
                  <div className="text-center">
                    <button onClick={() => setCatalogExpanded(!catalogExpanded)} className="px-8 py-4 border-2 border-primary/30 text-primary rounded-full font-semibold text-base hover:border-primary hover:bg-primary/5 transition-all">
                      {catalogExpanded ? "Свернуть каталог" : `Показать все модели (${filteredItems().length})`}
                    </button>
                  </div>
                )}
              </div>
            )
          )}
        </div>
      </section>

      <section id="howto" className="py-12 px-6 bg-secondary">
        <div className="max-w-6xl mx-auto">
          <div className={`text-center mb-12 transition-all duration-1000 ${vis("howto") ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
            <h2 className="text-4xl lg:text-5xl font-display font-black tracking-tight text-foreground leading-tight">Как подобрать котлетный автомат под свой объём</h2>
            <p className="text-lg text-muted-foreground mt-4 max-w-3xl mx-auto">Ориентировочные сценарии. Точную модель технолог подберёт после уточнения веса изделия, типа фарша и графика работы цеха.</p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 mb-8">
            {[
              { icon: "Store", volume: "Небольшой цех", scale: "до 500 кг/смену", pick: "Компактные формовочные машины и формовщики фрикаделек", type: "meatballs" },
              { icon: "Factory", volume: "Средний цех", scale: "500–2 000 кг/смену", pick: "Котлетоформовочные автоматы производительностью 1 600–4 000 шт/час", type: "patty" },
              { icon: "Building2", volume: "Крупный цех", scale: "2 000–5 000 кг/смену", pick: "Автоматы 4 000 шт/час в связке с панировочной линией", type: "breading" },
              { icon: "Warehouse", volume: "Промышленное производство", scale: "свыше 5 000 кг/смену", pick: "Барабанные формующие машины 100–800 кг/ч с точностью ±1% и линией льезон/панировка", type: "industrial" },
            ].map((r, i) => (
              <div key={i} className={`p-7 bg-white border border-border rounded-2xl hover:border-primary/40 hover:shadow-lg transition-all flex gap-5 ${vis("howto") ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`} style={{ transitionDelay: `${i * 90}ms`, transitionDuration: "700ms" }}>
                <div className="w-14 h-14 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0"><Icon name={r.icon} fallback="Factory" size={28} className="text-primary" /></div>
                <div className="flex-1">
                  <h3 className="font-bold text-xl text-foreground leading-snug">{r.volume}</h3>
                  <p className="text-sm font-semibold text-primary mb-3">{r.scale}</p>
                  <p className="text-muted-foreground text-base leading-relaxed mb-4">{r.pick}</p>
                  <button onClick={() => { setTypeFilter(r.type); setCatalogExpanded(false); scrollTo("catalog"); }} className="text-sm font-semibold text-primary hover:underline">Смотреть модели →</button>
                </div>
              </div>
            ))}
          </div>

          <div className="p-6 sm:p-8 bg-white border-2 border-primary/20 rounded-3xl flex flex-col sm:flex-row items-center gap-6 justify-between">
            <p className="text-base text-foreground leading-relaxed">Не подходит ни один сценарий? Так бывает почти всегда — реальный подбор зависит от фарша и веса изделия.</p>
            <button onClick={() => scrollTo("quiz")} className="px-8 py-4 bg-orange-500 hover:bg-orange-600 text-white rounded-full font-bold text-base transition-all shadow-sm whitespace-nowrap flex-shrink-0">Рассчитать под мой цех</button>
          </div>
        </div>
      </section>

      <section id="line" className="py-12 px-6 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className={`text-center mb-14 transition-all duration-1000 ${vis("line") ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
            <h2 className="text-4xl lg:text-5xl font-display font-black tracking-tight text-foreground leading-tight">Собираем не машину, а участок целиком</h2>
            <p className="text-lg text-muted-foreground mt-4 max-w-3xl mx-auto">Формовочный автомат редко работает один. Ниже — как выстраивается линия и что мы можем поставить на каждом этапе.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6 mb-10">
            {[
              { icon: "Grid2x2", step: "01", title: "Подготовка фарша", desc: "Волчки и куттеры. Отдельное направление, подберём при необходимости." },
              { icon: "Cookie", step: "02", title: "Формовка", desc: "Котлетоформовочные автоматы и барабанные формующие машины. Задают вес, форму и толщину изделия." },
              { icon: "Droplets", step: "03", title: "Льезон", desc: "Машины нанесения льезона. Равномерное покрытие перед панировкой, производительность 400–700 кг/ч." },
              { icon: "Wheat", step: "04", title: "Панировка и посыпка", desc: "Панировщики и посыпочные машины. Обвалка в сухарях, удаление излишков воздуходувкой, возврат сухарей на ленту." },
              { icon: "Snowflake", step: "05", title: "Заморозка и упаковка", desc: "Смежные направления Техно-Сиб. Дополним линию до полного цикла." },
            ].map((s, i) => (
              <div key={i} className={`relative p-6 bg-background border border-border rounded-2xl shadow-sm hover:shadow-lg hover:border-primary/40 transition-all ${vis("line") ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`} style={{ transitionDelay: `${i * 90}ms`, transitionDuration: "700ms" }}>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center"><Icon name={s.icon} fallback="Star" size={24} className="text-primary" /></div>
                  <span className="font-black text-2xl text-primary/20">{s.step}</span>
                </div>
                <h3 className="font-bold text-lg text-foreground mb-2">{s.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{s.desc}</p>
                {i < 4 && (<div className="hidden lg:block absolute -right-4 top-1/2 -translate-y-1/2 z-10"><div className="w-8 h-8 bg-primary/10 border border-primary/20 rounded-full flex items-center justify-center"><Icon name="ChevronRight" size={16} className="text-primary" /></div></div>)}
              </div>
            ))}
          </div>
          <div className="p-6 sm:p-8 bg-primary/5 border border-primary/15 rounded-3xl flex flex-col sm:flex-row items-center gap-6 justify-between">
            <p className="text-base text-foreground leading-relaxed">Все машины участка синхронизируются транспортёрами и работают в линии. Если у вас уже есть часть оборудования — встроим новое в существующую линию.</p>
            <button onClick={() => { setModalProduct("Рассчитать линию под ключ (котлетные автоматы)"); setModalOpen(true); }} className="px-8 py-4 bg-orange-500 hover:bg-orange-600 text-white rounded-full font-bold text-base transition-all shadow-sm whitespace-nowrap flex-shrink-0">Рассчитать линию под ключ</button>
          </div>
        </div>
      </section>

      <section id="process" className="py-12 px-6 bg-secondary">
        <div className="max-w-7xl mx-auto">
          <div className={`text-center mb-14 transition-all duration-1000 ${vis("process") ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
            <h2 className="text-4xl lg:text-5xl font-display font-black tracking-tight text-foreground leading-tight">Как мы работаем</h2>
          </div>
          <div className="grid md:grid-cols-4 gap-6">
            {[
              { icon: "ClipboardCheck", step: "01", title: "Узнаём задачу", desc: "Продукт, вес изделия, объём смены, тип фарша, площадь цеха" },
              { icon: "Layers", step: "02", title: "Предлагаем 2–3 варианта", desc: "Под ваш бюджет и требования, с ценами и сроками поставки" },
              { icon: "Eye", step: "03", title: "Показываем в демозале", desc: "Можете привезти своё сырьё и увидеть результат формовки" },
              { icon: "GraduationCap", step: "04", title: "Ставим и обучаем", desc: "Пусконаладка, подбор матриц, инструктаж операторов" },
            ].map((s, i) => (
              <div key={i} className={`relative p-7 bg-white border border-border rounded-2xl shadow-sm hover:shadow-lg hover:border-primary/40 transition-all flex flex-col gap-4 ${vis("process") ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`} style={{ transitionDelay: `${i * 100}ms`, transitionDuration: "700ms" }}>
                <div className="flex items-center justify-between"><div className="w-14 h-14 bg-primary/10 rounded-xl flex items-center justify-center"><Icon name={s.icon} fallback="Star" size={28} className="text-primary" /></div><span className="font-black text-3xl text-primary/20">{s.step}</span></div>
                <div><h3 className="font-bold text-xl text-foreground mb-2">{s.title}</h3><p className="text-muted-foreground text-base leading-relaxed">{s.desc}</p></div>
                {i < 3 && (<div className="hidden md:block absolute -right-4 top-1/2 -translate-y-1/2 z-10"><div className="w-8 h-8 bg-primary/10 border border-primary/20 rounded-full flex items-center justify-center"><Icon name="ChevronRight" size={16} className="text-primary" /></div></div>)}
              </div>
            ))}
          </div>
        </div>
      </section>

      {videoItems().length > 0 && (
        <section id="videos" className="py-20 px-6 bg-white">
          <div className="max-w-7xl mx-auto">
            <div className={`text-center mb-10 transition-all duration-1000 ${vis("videos") ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
              <span className="text-xs font-semibold tracking-widest text-primary uppercase">Смотрите в деле</span>
              <h2 className="text-4xl lg:text-5xl font-display font-black tracking-tight mt-3 text-foreground">Видео работы оборудования</h2>
              <p className="text-lg text-muted-foreground mt-4">Посмотрите, как автомат формует изделия и как работает панировочная линия.</p>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {videoItems().map((v) => (
                <div key={v.id} className="bg-background border border-border rounded-2xl overflow-hidden shadow-sm">
                  <div className="relative bg-black aspect-video">
                    {playingVideo === v.id ? (
                      <video src={v.video || ""} controls autoPlay playsInline className="w-full h-full object-contain" />
                    ) : (
                      <button onClick={() => setPlayingVideo(v.id)} className="absolute inset-0 w-full h-full group">
                        {v.pictures[0] && <img src={v.pictures[0]} alt={v.name} referrerPolicy="no-referrer" loading="lazy" className="w-full h-full object-contain opacity-70 group-hover:opacity-90 transition-opacity" />}
                        <span className="absolute inset-0 flex items-center justify-center">
                          <span className="w-16 h-16 bg-white/95 rounded-full flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform"><Icon name="Play" size={28} className="text-primary ml-1" /></span>
                        </span>
                      </button>
                    )}
                  </div>
                  <div className="p-5">
                    <p className="font-bold text-base text-foreground mb-2 leading-snug">{v.name}</p>
                    <a href={`#${v.slug || `product-${v.id}`}`} className="text-sm text-primary font-semibold hover:underline">Смотреть в каталоге →</a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      <section id="quiz" className="py-12 px-6 bg-secondary">
        <div className="max-w-4xl mx-auto">
          <div className={`text-center mb-14 transition-all duration-1000 ${vis("quiz") ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
            <span className="text-xs font-semibold tracking-widest text-primary uppercase">Подбор оборудования</span>
            <h2 className="text-3xl sm:text-5xl font-display font-black tracking-tight mt-4 text-foreground leading-tight">Подобрать автомат под ваш продукт</h2>
            <p className="text-lg text-muted-foreground mt-4">Ответьте на 5 вопросов — получите 2–3 модели с ценами</p>
          </div>
          <QuizBlock onSent={(name, phone, email, quizAnswers) => sendLead({ name, phone, email, quizAnswers, product: "Получить подборку (квиз)", topic: "котлетные автоматы", formType: "quiz" })} />
        </div>
      </section>

      <section id="about" className="py-12 px-6 bg-gradient-to-b from-secondary to-white">
        <div className="max-w-7xl mx-auto">
          <div className={`text-center mb-12 transition-all duration-1000 ${vis("about") ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
            <span className="text-xs font-semibold tracking-widest text-primary uppercase">О компании</span>
            <h2 className="text-4xl lg:text-5xl font-display font-black tracking-tight mt-4 text-foreground">О компании ТЕХНО-СИБ</h2>
          </div>
          <div className="grid sm:grid-cols-3 gap-6 mb-12">
            {[
              { icon: "Award", num: "25 лет", text: "Опыт работы с 2001 года" },
              { icon: "Building2", num: "2 города", text: "Офисы и демозалы в Москве и Новосибирске" },
              { icon: "Handshake", num: "Проверенные партнёры", text: "Заводы Европы, России и Китая" },
            ].map((f, i) => (
              <div key={i} className="p-7 bg-white border border-border rounded-2xl text-center shadow-sm">
                <div className="w-14 h-14 bg-primary/10 rounded-xl flex items-center justify-center mx-auto mb-4"><Icon name={f.icon} fallback="Star" size={28} className="text-primary" /></div>
                <p className="font-black text-2xl text-foreground mb-1">{f.num}</p>
                <p className="text-sm text-muted-foreground">{f.text}</p>
              </div>
            ))}
          </div>
          <div className="grid lg:grid-cols-2 gap-12 items-start">
            <div>
              <p className="text-lg text-muted-foreground leading-relaxed mb-5">Компания <strong className="text-foreground">«Техно-Сиб»</strong> — надёжный поставщик оборудования для мясной промышленности. Мы работаем с 2001 года и уже 25 лет помогаем предприятиям оснащать и модернизировать производство.</p>
              <div className="p-6 bg-primary/5 border border-primary/15 rounded-2xl mb-5">
                <p className="text-lg text-foreground leading-relaxed">Мы сотрудничаем с ведущими заводами-производителями Европы, России и Китая, подбирая решения под задачи и бюджет клиента.</p>
              </div>
              <p className="text-lg text-muted-foreground leading-relaxed mb-5">Собственные офисы продаж, склады, сервисная служба и отлаженная логистика в Москве и Новосибирске.</p>
              <p className="text-lg text-muted-foreground leading-relaxed">Экспертиза наших специалистов помогает решать задачи любой сложности — от замены одной машины до запуска цеха с нуля.</p>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              {[
                { icon: "Boxes", title: "Комплексные решения", desc: "От подбора оборудования до сервисного обслуживания" },
                { icon: "Scale", title: "Работа с любым объёмом", desc: "От небольшого цеха до промышленной линии" },
                { icon: "Building2", title: "Демозалы", desc: "Можно увидеть оборудование в работе до покупки" },
                { icon: "LifeBuoy", title: "Поддержка после продажи", desc: "Запчасти, расходники, выезд специалиста" },
              ].map((item, i) => (
                <div key={i} className="p-5 bg-white border border-border rounded-2xl">
                  <Icon name={item.icon} fallback="Star" size={22} className="text-primary mb-3" />
                  <p className="font-bold text-base text-foreground mb-1">{item.title}</p>
                  <p className="text-sm text-muted-foreground">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section id="faq" className="py-12 px-6 bg-secondary">
        <div className="max-w-7xl mx-auto">
          <div className={`text-center mb-14 transition-all duration-1000 ${vis("faq") ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
            <span className="text-xs font-semibold tracking-widest text-primary uppercase">FAQ</span>
            <h2 className="text-4xl lg:text-5xl font-display font-black tracking-tight mt-4 text-foreground leading-tight">Частые вопросы</h2>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                role: "Директор",
                icon: "Briefcase",
                img: "faq-director",
                items: [
                  { q: "Сколько стоит котлетный автомат?", a: priceAnswer() },
                  { q: "Как быстро окупится автомат?", a: "Основная экономия — на фонде оплаты труда и на перевесе. Автомат заменяет ручную формовку и держит стабильный вес изделия, поэтому уходят потери от «щедрых» котлет. При загрузке от 1 000 кг в смену оборудование окупается в среднем за 6–12 месяцев." },
                  { q: "Даёте документы для тендера?", a: "Да. Готовим полный комплект: коммерческое предложение, спецификацию, технические характеристики, сертификаты и паспорта. Работаем по 44-ФЗ и 223-ФЗ." },
                ],
              },
              {
                role: "Технолог",
                icon: "FlaskConical",
                img: "faq-tech",
                items: [
                  { q: "Автомат будет работать с моим фаршем?", a: "Оборудование рассчитано на говяжий, свиной, куриный, рыбный и растительный фарш. Ключевые факторы — жирность, структура и температура сырья. Рекомендуем привезти своё сырьё в демозал и протестировать формовку до покупки." },
                  { q: "Какой вес и форму изделия можно получить?", a: "В линейке есть модели с весом изделия от 20 до 500 г и толщиной от 6 до 25 мм. Диаметр форм — до 135 мм, доступны круг, овал и нестандартные формы под заказ. Матрицы сменные — один автомат закрывает несколько позиций ассортимента." },
                  { q: "Насколько точный вес изделия?", a: "Погрешность дозирования зависит от модели: у промышленных формующих машин — до ±1%, у котлетоформовочных автоматов — от 4 до 5%. Точную цифру по конкретной модели смотрите в характеристиках карточки." },
                ],
              },
              {
                role: "Инженер",
                icon: "HardHat",
                img: "faq-engineer",
                items: [
                  { q: "Какое нужно подключение?", a: "Большинство моделей работают от 220 В, промышленные — от 380 В. Мощность в линейке — от 0,1 до 11 кВт. Некоторым моделям нужен сжатый воздух (6 бар). Все требования указаны в характеристиках товара." },
                  { q: "Сложно ли мыть и обслуживать?", a: "Корпуса выполнены из нержавеющей стали и пищевого пластика, машины разбираются для мойки без специального инструмента. Панировочные машины имеют опрокидыватель для быстрой выгрузки сухарей." },
                  { q: "Что с гарантией и сервисом?", a: "Официальная гарантия производителя — 12 месяцев. У нас собственная сервисная служба и склад запчастей в Москве и Новосибирске. Выезжаем на пусконаладку и обучаем персонал." },
                ],
              },
            ].map((col, ci) => (
              <div key={ci} className={`bg-white border border-border rounded-2xl overflow-hidden shadow-sm transition-all duration-700 ${vis("faq") ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`} style={{ transitionDelay: `${ci * 100}ms` }}>
                <div className="relative aspect-[4/3] overflow-hidden bg-secondary">
                  <img src={`/features/${col.img}.webp`} alt={col.role} loading="lazy" className="w-full h-full object-cover" />
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent px-5 pt-10 pb-4 flex items-center gap-3">
                    <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm flex-shrink-0">
                      <Icon name={col.icon} fallback="User" size={20} className="text-primary" />
                    </div>
                    <p className="font-display font-black text-lg text-white uppercase tracking-wide">{col.role}</p>
                  </div>
                </div>
                <div className="p-5">
                  <div className="space-y-2">
                    {col.items.map((f, i) => {
                      const key = `${ci}-${i}`;
                      const isOpen = openFaq === key;
                      return (
                        <div key={i} className="border border-border rounded-xl overflow-hidden">
                          <button onClick={() => setOpenFaq(isOpen ? null : key)} className="w-full flex items-start justify-between gap-3 px-4 py-3 text-left hover:bg-primary/5 transition-colors">
                            <span className="font-semibold text-sm text-foreground">{f.q}</span>
                            <Icon name={isOpen ? "ChevronUp" : "ChevronDown"} size={16} className="text-primary flex-shrink-0 mt-0.5" />
                          </button>
                          {isOpen && (<div className="px-4 pb-4 text-sm text-muted-foreground leading-relaxed">{f.a}</div>)}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="contacts" className="py-12 px-6 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className={`text-center mb-14 transition-all duration-1000 ${vis("contacts") ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
            <h2 className="text-4xl lg:text-5xl font-display font-black tracking-tight text-foreground leading-tight">Обсудим ваш проект</h2>
            <p className="text-lg text-muted-foreground mt-4 max-w-3xl mx-auto">Опишите задачу — технолог перезвонит, задаст уточняющие вопросы и подберёт 2–3 модели с ценами.</p>
          </div>
          <div className="grid lg:grid-cols-2 gap-14 items-start">
            <div className={`transition-all duration-1000 ${vis("contacts") ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-8"}`}>
              <div className="flex justify-center">
                <div className="p-8 bg-gradient-to-br from-primary/5 to-primary/10 border border-primary/20 rounded-3xl shadow-xl w-full max-w-sm">
                  <div className="flex justify-center mb-6"><div className="w-28 h-28 bg-primary/10 rounded-2xl flex items-center justify-center"><Icon name="Factory" size={56} className="text-primary" /></div></div>
                  <p className="text-center text-sm font-medium text-muted-foreground mb-6">Демозалы: Москва и Новосибирск</p>
                  <div className="space-y-4">
                    <a
                      href="tel:88005057684"
                      onClick={() => { try { (window as unknown as { ym?: (...a: unknown[]) => void }).ym?.(107258870, "reachGoal", "phone_click"); } catch { /* noop */ } }}
                      className="flex items-center gap-4 p-4 bg-white border border-primary/10 rounded-xl hover:border-primary/30 transition-colors"
                    >
                      <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0"><Icon name="Phone" size={18} className="text-primary" /></div>
                      <div><p className="text-xs text-muted-foreground">Телефон</p><p className="font-bold text-base text-foreground">8 800 505-76-84</p></div>
                    </a>
                    <button onClick={copyEmail} className="w-full flex items-center gap-4 p-4 bg-white border border-primary/10 rounded-xl hover:border-primary/30 transition-colors text-left">
                      <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0"><Icon name={emailCopied ? "Check" : "Mail"} size={18} className="text-primary" /></div>
                      <div><p className="text-xs text-muted-foreground">Почта</p><p className="font-bold text-base text-foreground">{emailCopied ? "Скопировано!" : "massagers@t-sib.ru"}</p></div>
                    </button>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed mt-6 text-center">Работаем по всей России, отгрузка со складов в Москве и Новосибирске</p>
                </div>
              </div>
            </div>
            <div className={`transition-all duration-1000 delay-300 ${vis("contacts") ? "opacity-100 translate-x-0" : "opacity-0 translate-x-8"}`}>
              <div className="p-8 bg-background border-2 border-primary/15 rounded-3xl shadow-sm">
                <h3 className="font-display font-bold text-2xl mb-2 text-foreground">Оставить заявку</h3>
                <p className="text-muted-foreground mb-6 text-sm">Технолог ответит в течение 2 часов</p>
                <div className="space-y-4">
                  <input type="text" placeholder="Имя" value={contactsName} onChange={e => setContactsName(e.target.value)} className={inputCls} />
                  <div>
                    <input type="tel" placeholder="+7 (___) ___-__-__" required value={contactsPhone} onChange={e => setContactsPhone(formatPhone(contactsPhone, e.target.value))} onBlur={() => setContactsPhoneTouched(true)} className={contactsPhoneTouched && !isValidPhone(contactsPhone) ? inputError : inputCls} />
                    {contactsPhoneTouched && !isValidPhone(contactsPhone) && <p className="text-xs text-red-500 mt-1">Введите номер России, Казахстана или Беларуси</p>}
                  </div>
                  <input type="email" placeholder="Email" value={contactsEmail} onChange={e => setContactsEmail(e.target.value)} className={contactsEmail.trim() && !isValidEmail(contactsEmail) ? inputError : inputCls} />
                  <textarea placeholder="Что производите и какой объём в смену?" rows={4} value={contactsComment} onChange={e => setContactsComment(e.target.value)} className={inputCls + " resize-none"} />
                  <ConsentCheckbox checked={contactsConsent} onChange={setContactsConsent} />
                  <button
                    onClick={() => {
                      if (!isValidPhone(contactsPhone) || !contactsConsent || sending) return;
                      if (contactsEmail.trim() && !isValidEmail(contactsEmail)) return;
                      sendLead({ name: contactsName, phone: contactsPhone, email: contactsEmail, comment: contactsComment, product: "Оставить заявку (котлетные автоматы)", topic: "котлетные автоматы", formType: "contacts" });
                      setContactsName(""); setContactsPhone(""); setContactsEmail(""); setContactsComment(""); setContactsPhoneTouched(false); setContactsConsent(false);
                    }}
                    disabled={!isValidPhone(contactsPhone) || !contactsConsent || sending}
                    className="w-full py-4 bg-orange-500 hover:bg-orange-600 text-white rounded-xl font-bold text-base transition-all shadow-sm disabled:opacity-40"
                  >
                    {sending ? "Отправляем..." : "Оставить заявку"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <footer className="py-14 px-6 bg-white border-t border-border">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-10 mb-10">
            <div>
              <p className="font-display font-black text-2xl text-foreground mb-3">ТЕХНОСИБ</p>
              <p className="text-sm text-muted-foreground mb-4">Поставщик оборудования для мясопереработки</p>
              <div className="space-y-2">
                <a href="tel:88005057684" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"><Icon name="Phone" size={14} /> 8 800 505-76-84</a>
                <a href="mailto:massagers@t-sib.ru" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"><Icon name="Mail" size={14} /> massagers@t-sib.ru</a>
                <p className="text-sm text-muted-foreground">Демозалы: Москва и Новосибирск</p>
              </div>
            </div>
            <div>
              <p className="font-semibold text-sm text-foreground mb-3">Оборудование</p>
              <div className="space-y-2">
                <a href="/massagers" className="block text-sm text-muted-foreground hover:text-primary transition-colors">Массажёры мяса</a>
                <a href="/injector" className="block text-sm text-muted-foreground hover:text-primary transition-colors">Инъекторы</a>
                <a href="/slicers" className="block text-sm text-muted-foreground hover:text-primary transition-colors">Слайсеры</a>
                <a href="/ldogenerator" className="block text-sm text-muted-foreground hover:text-primary transition-colors">Льдогенераторы</a>
                <a href="/volchki" className="block text-sm text-muted-foreground hover:text-primary transition-colors">Волчки</a>
                <a href="/blokorezki" className="block text-sm text-muted-foreground hover:text-primary transition-colors">Блокорезки</a>
              </div>
            </div>
            <div>
              <p className="font-semibold text-sm text-foreground mb-3">Разделы</p>
              <div className="space-y-2">
                {[["#catalog", "Каталог"], ["#quiz", "Подбор"], ["#howto", "Как подобрать"], ["#line", "Схема участка"], ["#videos", "Видео"], ["#faq", "Частые вопросы"]].map(([href, label]) => (
                  <a key={href} href={href} className="block text-sm text-muted-foreground hover:text-primary transition-colors">{label}</a>
                ))}
              </div>
            </div>
            <div>
              <p className="font-semibold text-sm text-foreground mb-3">Контакты</p>
              <a href="/contacts" className="block text-sm text-muted-foreground hover:text-primary transition-colors mb-2">Все контакты</a>
              <button onClick={() => { setModalProduct("Получить КП за 24 часа"); setModalOpen(true); }} className={btnPrimary + " !px-6 !py-3 !text-sm mt-2"}>Получить КП</button>
            </div>
          </div>
          <div className="pt-8 border-t border-border text-xs text-muted-foreground leading-relaxed">
            <p>Общество с ограниченной ответственностью «Техно-Сиб Групп»</p>
            <p>Юридический адрес: 630005, г. Новосибирск, ул. Крылова, д. 36, этаж 8, офис 81</p>
            <p>ИНН 5406804844 · ОГРН 1205400012146 · КПП 540601001</p>
            <p className="text-center mt-6">2026 Техно-Сиб Групп. Все права защищены.</p>
          </div>
        </div>
      </footer>

      {modalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm" onClick={() => setModalOpen(false)}>
          <div className="bg-white rounded-3xl shadow-2xl p-8 w-full max-w-md" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="font-display font-bold text-2xl text-foreground">Оставить заявку</h3>
                {modalProduct && (<p className="text-sm text-primary mt-1">{modalProduct}</p>)}
              </div>
              <button onClick={() => setModalOpen(false)} className="w-10 h-10 flex items-center justify-center rounded-xl bg-background hover:bg-primary/10 transition-colors"><Icon name="X" size={20} className="text-muted-foreground" /></button>
            </div>
            <div className="space-y-4">
              <input type="text" placeholder="Имя" value={modalName} onChange={e => setModalName(e.target.value)} className={inputCls} />
              <div>
                <input type="tel" placeholder="+7 (___) ___-__-__" required value={modalPhone} onChange={e => setModalPhone(formatPhone(modalPhone, e.target.value))} onBlur={() => setModalPhoneTouched(true)} className={modalPhoneTouched && !isValidPhone(modalPhone) ? inputError : inputCls} />
                {modalPhoneTouched && !isValidPhone(modalPhone) && <p className="text-xs text-red-500 mt-1">Введите номер России, Казахстана или Беларуси</p>}
              </div>
              <ConsentCheckbox checked={modalConsent} onChange={setModalConsent} />
              <button
                onClick={() => {
                  if (isValidPhone(modalPhone) && modalConsent && !sending) {
                    sendLead({ name: modalName, phone: modalPhone, product: modalProduct || "Получить КП за 24 часа", topic: "котлетные автоматы", formType: "modal" });
                    setModalOpen(false); setModalName(""); setModalPhone(""); setModalPhoneTouched(false); setModalConsent(false);
                  }
                }}
                disabled={!isValidPhone(modalPhone) || !modalConsent || sending}
                className="w-full py-4 bg-orange-500 hover:bg-orange-600 text-white rounded-xl font-bold text-lg transition-all shadow-md disabled:opacity-40"
              >
                {sending ? "Отправляем..." : "Отправить"}
              </button>
            </div>
          </div>
        </div>
      )}

      {videoModal && (
        <div className="fixed inset-0 z-[105] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm" onClick={() => setVideoModal(null)}>
          <div className="w-full max-w-4xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between gap-4 mb-4">
              <p className="font-display font-bold text-lg sm:text-xl text-white leading-snug">{videoModal.name}</p>
              <button onClick={() => setVideoModal(null)} className="w-10 h-10 flex-shrink-0 flex items-center justify-center rounded-xl bg-white/10 hover:bg-white/20 transition-colors"><Icon name="X" size={20} className="text-white" /></button>
            </div>
            <div className="bg-black rounded-2xl overflow-hidden shadow-2xl aspect-video">
              <video src={videoModal.video || ""} controls autoPlay playsInline className="w-full h-full object-contain" />
            </div>
            <button onClick={() => { const it = videoModal; setVideoModal(null); setModalProduct(it.name); setModalOpen(true); }} className="w-full sm:w-auto sm:mx-auto sm:block mt-5 px-10 py-4 bg-orange-500 hover:bg-orange-600 text-white rounded-xl font-bold text-base transition-all shadow-lg">Получить консультацию</button>
          </div>
        </div>
      )}

      {lightboxOpen && (
        <div className="fixed inset-0 z-[110] bg-black/90 flex items-center justify-center" onClick={() => setLightboxOpen(false)}>
          <button onClick={() => setLightboxOpen(false)} className="absolute top-4 right-4 w-12 h-12 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition-colors z-10">
            <Icon name="X" size={24} className="text-white" />
          </button>
          <div className="relative w-full h-full flex items-center justify-center p-4" onClick={(e) => e.stopPropagation()}>
            <img src={lightboxPhotos[lightboxIndex]} alt="" referrerPolicy="no-referrer" className="max-w-full max-h-full object-contain" />
            {lightboxPhotos.length > 1 && (
              <>
                <button onClick={() => setLightboxIndex((i) => (i - 1 + lightboxPhotos.length) % lightboxPhotos.length)} className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition-colors"><Icon name="ChevronLeft" size={24} className="text-white" /></button>
                <button onClick={() => setLightboxIndex((i) => (i + 1) % lightboxPhotos.length)} className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition-colors"><Icon name="ChevronRight" size={24} className="text-white" /></button>
              </>
            )}
          </div>
        </div>
      )}

      <QuizSideTrigger storageKey="quiz_auto_kotletnyy" topic="Котлетные автоматы">
        {(close) => (
          <QuizBlock onSent={(name, phone, email, quizAnswers) => { sendLead({ name, phone, email, quizAnswers, product: "Получить подборку (квиз-попап)", topic: "котлетные автоматы", formType: "quiz" }); close(); }} />
        )}
      </QuizSideTrigger>
      <ThankYouModal open={thankYouOpen} onClose={() => setThankYouOpen(false)} />
    </div>
  );
};

export default KotletnyyAvtomat;
