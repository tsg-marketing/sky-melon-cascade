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
  { q: "Что вы производите?", options: ["Колбасы варёные", "Сырокопчёные", "Полуфабрикаты", "Фарш", "Деликатесы", "Другое"] },
  { q: "Какой объём в смену (кг)?", options: ["До 500", "500–2000", "2000–5000", "Больше 5000"] },
  { q: "Когда нужно оборудование?", options: ["Срочно 1–2 недели", "Месяц", "Квартал", "Изучаем"] },
  { q: "Какой бюджет?", options: ["До 500 тыс", "500 тыс – 1 млн", "1–3 млн", "Больше 3 млн", "Не определились"] },
  { q: "Нужна ли помощь в монтаже и запуске?", options: ["Да, под ключ", "Консультация", "Справимся сами"] },
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
          <p className="text-muted-foreground text-base mb-8 text-center">Оставьте контакты — технолог подберёт волчок и пришлёт КП</p>
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

const Volchki = () => {
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
  const [contactsComment, setContactsComment] = useState("");
  const [contactsPhoneTouched, setContactsPhoneTouched] = useState(false);
  const [contactsConsent, setContactsConsent] = useState(false);
  const [openFaq, setOpenFaq] = useState<string | null>(null);
  const [catalogExpanded, setCatalogExpanded] = useState(false);
  const [items, setItems] = useState<CatalogItem[] | null>(null);
  const [catalogLoading, setCatalogLoading] = useState(true);
  const [catalogSearch, setCatalogSearch] = useState("");
  const [brandFilter, setBrandFilter] = useState("all");
  const [cardSlides, setCardSlides] = useState<Record<string, number>>({});
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxPhotos, setLightboxPhotos] = useState<string[]>([]);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  useEffect(() => {
    document.title = "Промышленные волчки и мясорубки — купить от производителя";
    const setMeta = (name: string, content: string, property?: boolean) => {
      const attr = property ? "property" : "name";
      let el = document.querySelector(`meta[${attr}="${name}"]`);
      if (!el) { el = document.createElement("meta"); el.setAttribute(attr, name); document.head.appendChild(el); }
      el.setAttribute("content", content);
    };
    setMeta("description", "Промышленные волчки и мясорубки от 300 до 10 000 кг/ч. Купить от производителя с гарантией 12 месяцев. Демозалы в Москве и Новосибирске, доставка по всей России.");
    setMeta("keywords", "волчок промышленный, мясорубка промышленная, купить волчок, волчок для мяса, оборудование для измельчения мяса");
    setMeta("og:title", "Промышленные волчки и мясорубки — оборудование для мясопереработки | Техно-Сиб", true);
    setMeta("og:description", "Прямые поставки волчков от ведущих европейских и азиатских производителей. Подбор модели под ваш продукт, демонстрация работы, сервис.", true);
    setMeta("og:url", "https://meatmassagers.ru/volchki", true);
    setMeta("og:type", "website", true);
    const link = document.querySelector("link[rel='canonical']") || document.createElement("link");
    link.setAttribute("rel", "canonical");
    link.setAttribute("href", "https://meatmassagers.ru/volchki");
    if (!link.parentNode) document.head.appendChild(link);

    const schema = {
      "@context": "https://schema.org",
      "@graph": [
        { "@type": "WebPage", "@id": "https://meatmassagers.ru/volchki", "url": "https://meatmassagers.ru/volchki", "name": "Промышленные волчки и мясорубки", "description": "Промышленные волчки от 300 до 10 000 кг/ч для мясного производства.", "isPartOf": { "@id": "https://meatmassagers.ru/#website" } },
        { "@type": "WebSite", "@id": "https://meatmassagers.ru/#website", "url": "https://meatmassagers.ru", "name": "Техно-Сиб — оборудование для мясопереработки", "publisher": { "@id": "https://meatmassagers.ru/#org" } },
        { "@type": "Organization", "@id": "https://meatmassagers.ru/#org", "name": "Техно-Сиб", "url": "https://meatmassagers.ru", "telephone": "+7-800-505-91-24", "email": "massagers@t-sib.ru", "address": { "@type": "PostalAddress", "addressCountry": "RU", "addressLocality": "Новосибирск" }, "foundingDate": "2001" },
        { "@type": "BreadcrumbList", "itemListElement": [
          { "@type": "ListItem", "position": 1, "name": "Главная", "item": "https://meatmassagers.ru/" },
          { "@type": "ListItem", "position": 2, "name": "Волчки (мясорубки промышленные)", "item": "https://meatmassagers.ru/volchki" }
        ]},
        { "@type": "FAQPage", "mainEntity": [
          { "@type": "Question", "name": "Как быстро окупится новый волчок?", "acceptedAnswer": { "@type": "Answer", "text": "Окупаемость зависит от объёмов производства. При загрузке 2000+ кг/смену современное оборудование окупается за 8-12 месяцев за счёт снижения брака и увеличения производительности." }},
          { "@type": "Question", "name": "Какие гарантии качества?", "acceptedAnswer": { "@type": "Answer", "text": "Предоставляем официальную гарантию производителя 12-24 месяца, сервисное обслуживание, запчасти на складе. Всё оборудование сертифицировано для пищевого производства." }},
          { "@type": "Question", "name": "Какие требования к электрике?", "acceptedAnswer": { "@type": "Answer", "text": "Зависит от модели: от 380В 16А для малых волчков до 380В 63А для промышленных. Предоставляем полную техническую документацию и схемы подключения." }},
          { "@type": "Question", "name": "Как подобрать решётку под продукт?", "acceptedAnswer": { "@type": "Answer", "text": "Зависит от рецептуры: 3-5 мм для варёных колбас, 8-12 мм для рубленых полуфабрикатов. Можем провести тестовое измельчение вашего сырья в демозале." }}
        ]}
      ]
    };
    let scriptEl = document.getElementById("schema-volchki");
    if (!scriptEl) { scriptEl = document.createElement("script"); scriptEl.id = "schema-volchki"; scriptEl.setAttribute("type", "application/ld+json"); document.head.appendChild(scriptEl); }
    scriptEl.textContent = JSON.stringify(schema);

    return () => {
      document.title = "Массажеры и инъекторы от Техносиб";
      const canonical = document.querySelector("link[rel='canonical']");
      if (canonical) canonical.remove();
      const schemaEl = document.getElementById("schema-volchki");
      if (schemaEl) schemaEl.remove();
    };
  }, []);

  useEffect(() => {
    const ids = ["hero", "advantages", "catalog", "process", "videos", "segments", "about", "faq", "contacts"];
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
    fetchCatalog()
      .then((d) => setItems(d.mincers || []))
      .catch(() => setItems([]))
      .finally(() => setCatalogLoading(false));
  }, []);

  const brands = useCallback(() => {
    const set = new Set<string>();
    (items || []).forEach((i) => { if (i.brand) set.add(i.brand); });
    return Array.from(set).sort();
  }, [items]);

  const filteredItems = useCallback(() => {
    let list = items || [];
    if (brandFilter !== "all") list = list.filter((i) => i.brand === brandFilter);
    if (catalogSearch.trim()) {
      const q = catalogSearch.toLowerCase();
      list = list.filter((i) => i.name.toLowerCase().includes(q));
    }
    return list;
  }, [items, catalogSearch, brandFilter]);

  const openLightbox = (photos: string[], index: number) => { setLightboxPhotos(photos); setLightboxIndex(index); setLightboxOpen(true); };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteHeader current="/volchki" onGetKp={() => { setModalProduct(""); setModalOpen(true); }} />

      <section id="hero" className="relative pt-24 sm:pt-28 pb-14 sm:pb-20 px-4 sm:px-6 bg-gradient-to-br from-primary/5 via-background to-background overflow-hidden">
        <div className="absolute top-24 right-0 w-[600px] h-[600px] bg-primary/6 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 max-w-7xl mx-auto w-full">
          <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">
            <div className={`transition-all duration-1000 ${vis("hero") ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
              <span className="inline-block text-xs font-semibold tracking-widest text-primary uppercase border border-primary/30 rounded-full px-4 py-1.5 mb-4 bg-primary/5">Поставка и внедрение</span>
              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-display font-black leading-[1.05] tracking-tight mb-4 text-foreground">Промышленные мясорубки и <span className="text-primary">волчки</span></h1>
              <p className="text-lg sm:text-2xl font-semibold text-foreground leading-relaxed mb-6 max-w-xl">Прямые поставки от ведущих европейских и азиатских производителей</p>
              <div className="space-y-3 mb-8">
                {[
                  "От 300 до 10 000 кг/ч — модели для любых объёмов производства",
                  "Цена от производителя",
                  "Проверяем перед покупкой: демонстрация работы в МСК и НСК",
                  "Гарантия качества: ПНР, запчасти, техподдержка",
                ].map((t, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"><Icon name="Check" size={14} className="text-primary" /></div>
                    <span className="text-base text-muted-foreground leading-relaxed">{t}</span>
                  </div>
                ))}
              </div>
              <div className="flex flex-col sm:flex-row gap-4">
                <button onClick={() => { setModalProduct(""); setModalOpen(true); }} className="px-8 py-4 bg-orange-500 hover:bg-orange-600 text-white rounded-full font-bold text-lg transition-all shadow-lg text-center">Подобрать модель</button>
                <button onClick={() => { setModalProduct("Записаться в демозал"); setModalOpen(true); }} className="px-8 py-4 border-2 border-primary/30 text-primary rounded-full font-semibold text-lg hover:border-primary hover:bg-primary/5 transition-all text-center">Записаться в демозал</button>
              </div>
            </div>
            <div className={`hidden lg:block transition-all duration-1000 delay-300 ${vis("hero") ? "opacity-100 scale-100" : "opacity-0 scale-95"}`}>
              <img src="https://cdn.poehali.dev/files/f35072b8-8eec-4add-854f-6f13b9409465.jpg" alt="Промышленный волчок для измельчения мяса" className="w-full h-auto object-contain rounded-3xl" />
            </div>
          </div>
        </div>
      </section>

      <section id="advantages" className="py-12 px-6 bg-gradient-to-br from-primary/5 via-white to-primary/10">
        <div className="max-w-7xl mx-auto">
          <div className={`text-center mb-14 transition-all duration-1000 ${vis("advantages") ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-display font-black tracking-tight text-foreground">Преимущества компании Техно-Сиб как поставщика оборудования для мясного производства</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: "Gauge", title: "Производительность", desc: "От 300 до 10 000 кг/ч — модели для любых объёмов производства" },
              { icon: "Scissors", title: "Высокое качество реза", desc: "Чистый срез без замятия и нагрева продукта" },
              { icon: "Wrench", title: "Лёгкая разборка и мойка", desc: "Быстрая санитарная обработка без инструмента" },
              { icon: "MousePointerClick", title: "Простота в эксплуатации", desc: "Понятное управление, минимум обучения" },
              { icon: "FileCheck", title: "Пакет документов под тендер", desc: "Полный комплект для торгов и госзакупок" },
              { icon: "Boxes", title: "Подбор комплекта для новых цехов", desc: "Рассчитаем линию под задачу" },
              { icon: "ShieldCheck", title: "Гарантия 12 месяцев", desc: "Официальная гарантия производителя" },
              { icon: "Truck", title: "Доставка по всей России", desc: "Собственная логистика" },
            ].map((feat, i) => (
              <div key={i} className={`p-7 bg-white border border-border rounded-2xl hover:border-primary/40 hover:shadow-lg transition-all flex flex-col gap-4 ${vis("advantages") ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`} style={{ transitionDelay: `${i * 80}ms`, transitionDuration: "700ms" }}>
                <div className="w-14 h-14 bg-primary/10 rounded-xl flex items-center justify-center"><Icon name={feat.icon} fallback="Star" size={28} className="text-primary" /></div>
                <div><h3 className="font-bold text-xl text-foreground mb-2">{feat.title}</h3><p className="text-muted-foreground text-base">{feat.desc}</p></div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="catalog" className="py-12 px-6 bg-background">
        <div className="max-w-7xl mx-auto">
          <div className={`text-center mb-10 transition-all duration-1000 ${vis("catalog") ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
            <h2 className="text-4xl lg:text-5xl font-display font-black tracking-tight text-foreground leading-tight">Каталог оборудования</h2>
          </div>

          <div className="p-6 sm:p-8 bg-white border-2 border-primary/20 rounded-3xl shadow-sm mb-10">
            <h3 className="font-display font-bold text-2xl mb-1 text-foreground text-center">Подобрать оборудование с технологом</h3>
            <p className="text-muted-foreground text-sm mb-6 text-center">Оставьте контакты — подберём модель и пришлём КП</p>
            <div className="grid sm:grid-cols-3 gap-4 mb-4">
              <input type="text" placeholder="Ваше имя" value={quickName} onChange={e => setQuickName(e.target.value)} className={inputCls} />
              <div>
                <input type="tel" placeholder="+7 (___) ___-__-__" value={quickPhone} onChange={e => setQuickPhone(formatPhone(quickPhone, e.target.value))} onBlur={() => setQuickPhoneTouched(true)} className={quickPhoneTouched && !isValidPhone(quickPhone) ? inputError : inputCls} />
                {quickPhoneTouched && !isValidPhone(quickPhone) && <p className="text-xs text-red-500 mt-1">Проверьте номер телефона</p>}
              </div>
              <input type="email" placeholder="Email" value={quickEmail} onChange={e => setQuickEmail(e.target.value)} className={quickEmail.trim() && !isValidEmail(quickEmail) ? inputError : inputCls} />
            </div>
            <div className="mb-4"><ConsentCheckbox checked={quickConsent} onChange={setQuickConsent} /></div>
            <button
              onClick={() => {
                if (!isValidPhone(quickPhone) || !quickConsent || sending) return;
                if (quickEmail.trim() && !isValidEmail(quickEmail)) return;
                sendLead({ name: quickName, phone: quickPhone, email: quickEmail, product: "Подобрать оборудование с технологом", topic: "волчки", formType: "inquiry" });
                setQuickName(""); setQuickPhone(""); setQuickEmail(""); setQuickPhoneTouched(false); setQuickConsent(false);
              }}
              disabled={!isValidPhone(quickPhone) || !quickConsent || sending}
              className="w-full sm:w-auto sm:mx-auto sm:block px-10 py-4 bg-orange-500 hover:bg-orange-600 text-white rounded-xl font-bold text-base transition-all shadow-sm disabled:opacity-40"
            >
              {sending ? "Отправляем..." : "Оставить заявку"}
            </button>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-4 mb-10">
            <div className="relative w-full sm:w-80">
              <Icon name="Search" size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input type="text" placeholder="Поиск по каталогу..." value={catalogSearch} onChange={(e) => setCatalogSearch(e.target.value)} className="w-full pl-10 pr-4 py-3 bg-white border border-border rounded-xl text-foreground text-sm focus:outline-none focus:border-primary transition-colors" />
            </div>
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

          {!catalogLoading && items && (
            filteredItems().length === 0 ? (
              <div className="text-center py-20 text-muted-foreground"><Icon name="SearchX" size={48} className="mx-auto mb-4 opacity-30" /><p className="text-lg">Ничего не найдено</p></div>
            ) : (
              <div>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                  {(catalogExpanded ? filteredItems() : filteredItems().slice(0, 12)).map((item) => {
                    const slide = cardSlides[item.id] || 0;
                    const pics = item.pictures && item.pictures.length ? item.pictures : [];
                    return (
                      <div key={item.id} id={`product-${item.id}`} className="bg-white border border-border rounded-2xl overflow-hidden shadow-sm hover:shadow-xl hover:border-primary/40 transition-all flex flex-col group">
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
                          <h3 className="font-bold text-xl text-foreground mb-2 leading-snug cursor-pointer hover:text-primary transition-colors" onClick={() => navigate(productPath("volchki", item))}>{item.name}</h3>
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
                            <button onClick={() => navigate(productPath("volchki", item))} className="w-full py-3.5 border-2 border-primary/30 text-primary rounded-xl text-base font-semibold hover:border-primary hover:bg-primary/5 transition-all">Смотреть подробнее</button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
                {filteredItems().length > 12 && (
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

      <section id="process" className="py-12 px-6 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className={`text-center mb-14 transition-all duration-1000 ${vis("process") ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
            <h2 className="text-4xl lg:text-5xl font-display font-black tracking-tight text-foreground leading-tight">Как мы работаем</h2>
          </div>
          <div className="grid md:grid-cols-4 gap-6">
            {[
              { icon: "ClipboardCheck", step: "01", title: "Узнаём задачу", desc: "Продукт, кг/ч, сырьё, особенности цеха" },
              { icon: "Layers", step: "02", title: "Представляем 2–3 варианта на выбор", desc: "Под ваш бюджет и требования" },
              { icon: "Eye", step: "03", title: "Показываем в демозале", desc: "Можете привезти своё сырьё" },
              { icon: "GraduationCap", step: "04", title: "Ставим + обучаем", desc: "Пусконаладка и инструктаж персонала" },
            ].map((s, i) => (
              <div key={i} className={`relative p-7 bg-background border border-border rounded-2xl shadow-sm hover:shadow-lg hover:border-primary/40 transition-all flex flex-col gap-4 ${vis("process") ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`} style={{ transitionDelay: `${i * 100}ms`, transitionDuration: "700ms" }}>
                <div className="flex items-center justify-between"><div className="w-14 h-14 bg-primary/10 rounded-xl flex items-center justify-center"><Icon name={s.icon} fallback="Star" size={28} className="text-primary" /></div><span className="font-black text-3xl text-primary/20">{s.step}</span></div>
                <div><h3 className="font-bold text-xl text-foreground mb-2">{s.title}</h3><p className="text-muted-foreground text-base leading-relaxed">{s.desc}</p></div>
                {i < 3 && (<div className="hidden md:block absolute -right-4 top-1/2 -translate-y-1/2 z-10"><div className="w-8 h-8 bg-primary/10 border border-primary/20 rounded-full flex items-center justify-center"><Icon name="ChevronRight" size={16} className="text-primary" /></div></div>)}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="videos" className="py-12 px-6 bg-background">
        <div className="max-w-6xl mx-auto">
          <div className={`text-center mb-10 transition-all duration-1000 ${vis("videos") ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
            <span className="text-xs font-semibold tracking-widest text-primary uppercase">Смотрите в деле</span>
            <h2 className="text-4xl lg:text-5xl font-display font-black tracking-tight mt-3 text-foreground">Видео работы оборудования</h2>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            {[
              { id: "e9f5748185b428a295be966c7cbb4e1e", title: "Волчок Daribo JR-120" },
              { id: "9066f6b113d8967fa0176f717094c6d1", title: "Волчок для измельчения мяса двухшнековый JR 130" },
            ].map((v) => (
              <div key={v.id}>
                <div className="rounded-3xl overflow-hidden shadow-xl border border-border aspect-video">
                  <iframe src={`https://rutube.ru/play/embed/${v.id}/`} className="w-full h-full" allowFullScreen allow="autoplay; fullscreen" title={v.title} />
                </div>
                <p className="text-center text-sm font-semibold text-foreground mt-3">{v.title}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="segments" className="py-12 px-6 bg-gradient-to-br from-primary/5 via-white to-primary/10">
        <div className="max-w-4xl mx-auto">
          <div className={`text-center mb-14 transition-all duration-1000 ${vis("segments") ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
            <span className="text-xs font-semibold tracking-widest text-primary uppercase">Подбор оборудования</span>
            <h2 className="text-3xl sm:text-5xl font-display font-black tracking-tight mt-4 text-foreground leading-tight">Подобрать оборудование под ваши потребности</h2>
            <p className="text-lg text-muted-foreground mt-4">Ответьте на 5 вопросов — получите 3 модели с ценами</p>
          </div>
          <QuizBlock onSent={(name, phone, email, quizAnswers) => sendLead({ name, phone, email, quizAnswers, product: "Получить подборку (квиз)", topic: "волчки", formType: "quiz" })} />
        </div>
      </section>

      <section id="about" className="py-12 px-6 bg-gradient-to-b from-background to-white">
        <div className="max-w-7xl mx-auto">
          <div className={`text-center mb-12 transition-all duration-1000 ${vis("about") ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
            <span className="text-xs font-semibold tracking-widest text-primary uppercase">О компании</span>
            <h2 className="text-4xl lg:text-5xl font-display font-black tracking-tight mt-4 text-foreground">О компании ТЕХНО-СИБ</h2>
          </div>
          <div className="grid sm:grid-cols-3 gap-6 mb-12">
            {[
              { icon: "Award", num: "25 лет", text: "Опыт работы с 2001 года" },
              { icon: "Building2", num: "2 города", text: "Офисы в Москве и Новосибирске" },
              { icon: "Handshake", num: "Проверенные партнёры", text: "Из Европы, России и Китая" },
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
              <p className="text-lg text-muted-foreground leading-relaxed">Экспертиза наших специалистов помогает решать задачи любой сложности.</p>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              {[
                { icon: "Boxes", title: "Комплексные решения", desc: "От подбора оборудования до сервисного обслуживания" },
                { icon: "Truck", title: "Быстрая доставка", desc: "Собственная логистика по России и СНГ" },
                { icon: "Wrench", title: "Сервисная поддержка", desc: "Гарантийное и постгарантийное обслуживание" },
                { icon: "MessagesSquare", title: "Экспертная консультация", desc: "Помощь в выборе оптимального решения" },
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

      <section id="faq" className="py-12 px-6 bg-background">
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
                items: [
                  { q: "Как быстро окупится новый волчок?", a: "Окупаемость зависит от объёмов производства. При загрузке 2000+ кг/смену современное оборудование окупается за 8-12 месяцев за счёт снижения брака и увеличения производительности." },
                  { q: "Какие гарантии качества?", a: "Предоставляем официальную гарантию производителя 12-24 месяца, сервисное обслуживание, запчасти на складе. Всё оборудование сертифицировано для пищевого производства." },
                  { q: "Можно ли взять в лизинг?", a: "Да, работаем с ведущими лизинговыми компаниями. Поможем подготовить документы и подобрать оптимальные условия." },
                ],
              },
              {
                role: "Инженер",
                icon: "HardHat",
                items: [
                  { q: "Какие требования к электрике?", a: "Зависит от модели: от 380В 16А для малых волчков до 380В 63А для промышленных куттеров. Предоставляем полную техническую документацию и схемы подключения." },
                  { q: "Сложно ли обслуживать?", a: "Современные модели рассчитаны на простое обслуживание. Проводим обучение персонала, предоставляем инструкции по эксплуатации и техническому обслуживанию." },
                  { q: "Где брать запчасти?", a: "Основные запчасти всегда на нашем складе в Москве и Новосибирске. Редкие позиции доставляем от производителя за 7-14 дней." },
                ],
              },
              {
                role: "Технолог",
                icon: "FlaskConical",
                items: [
                  { q: "Как подобрать решётку под продукт?", a: "Зависит от рецептуры: 3-5 мм для варёных колбас, 8-12 мм для рубленых полуфабрикатов. Можем провести тестовое измельчение вашего сырья в демозале." },
                  { q: "Можно ли перерабатывать замороженное сырьё?", a: "Да, есть модели для работы с подмороженным блоком. Подберём волчок с нужной мощностью и конструкцией шнека под ваше сырьё." },
                  { q: "Как избежать нагрева фарша?", a: "Правильно подобранная режущая пара и производительность исключают перегрев. Мы рассчитываем режим под вашу рецептуру и объём." },
                ],
              },
            ].map((col, ci) => (
              <div key={ci} className={`bg-white border border-border rounded-2xl overflow-hidden shadow-sm transition-all duration-700 ${vis("faq") ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`} style={{ transitionDelay: `${ci * 100}ms` }}>
                <div className="flex items-center gap-4 px-5 pt-6 pb-5 bg-gradient-to-br from-primary/10 to-primary/5 border-b border-border">
                  <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center shadow-sm flex-shrink-0">
                    <Icon name={col.icon} fallback="User" size={28} className="text-primary" />
                  </div>
                  <p className="font-display font-black text-xl text-primary uppercase tracking-wide">{col.role}</p>
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
            <h2 className="text-4xl lg:text-5xl font-display font-black tracking-tight text-foreground leading-tight">Обсудим вашу задачу</h2>
          </div>
          <div className="grid lg:grid-cols-2 gap-14 items-start">
            <div className={`transition-all duration-1000 ${vis("contacts") ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-8"}`}>
              <div className="flex justify-center">
                <div className="p-8 bg-gradient-to-br from-primary/5 to-primary/10 border border-primary/20 rounded-3xl shadow-xl w-full max-w-sm">
                  <div className="flex justify-center mb-6"><div className="w-28 h-28 bg-primary/10 rounded-2xl flex items-center justify-center"><Icon name="Factory" size={56} className="text-primary" /></div></div>
                  <p className="text-center text-sm font-medium text-muted-foreground mb-6">Демозалы в Москве и Новосибирске</p>
                  <div className="space-y-4">
                    {[
                      { icon: "Phone", label: "Телефон", value: "8 800 505-91-24", href: "tel:88005059124", goal: "click_phone" },
                      { icon: "Mail", label: "Почта", value: "massagers@t-sib.ru", href: "mailto:massagers@t-sib.ru", goal: "click_email" },
                    ].map((c, i) => (
                      // eslint-disable-next-line @typescript-eslint/no-explicit-any
                      <a key={i} href={c.href} onClick={() => { try { (window as any).ym?.(107258870, 'reachGoal', c.goal); } catch (_e) { /* noop */ } }} className="flex items-center gap-4 p-4 bg-white border border-primary/10 rounded-xl hover:border-primary/30 transition-colors">
                        <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0"><Icon name={c.icon} fallback="Star" size={18} className="text-primary" /></div>
                        <div><p className="text-xs text-muted-foreground">{c.label}</p><p className="font-bold text-base text-foreground">{c.value}</p></div>
                      </a>
                    ))}
                  </div>
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
                  <textarea placeholder="Комментарий (продукт, объём, задача)" rows={4} value={contactsComment} onChange={e => setContactsComment(e.target.value)} className={inputCls + " resize-none"} />
                  <ConsentCheckbox checked={contactsConsent} onChange={setContactsConsent} />
                  <button
                    onClick={() => {
                      if (isValidPhone(contactsPhone) && contactsConsent && !sending) {
                        sendLead({ name: contactsName, phone: contactsPhone, comment: contactsComment, topic: "волчки", formType: "contacts" });
                        setContactsName(""); setContactsPhone(""); setContactsComment(""); setContactsPhoneTouched(false); setContactsConsent(false);
                      }
                    }}
                    disabled={!isValidPhone(contactsPhone) || !contactsConsent || sending}
                    className="w-full py-4 bg-orange-500 hover:bg-orange-600 text-white rounded-xl font-bold text-base transition-all shadow-sm disabled:opacity-40"
                  >
                    {sending ? "Отправляем..." : "Отправить"}
                  </button>
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
              <div>
                <h3 className="font-display font-bold text-2xl text-foreground">{modalProduct === "Записаться в демозал" ? "Записаться в демозал" : modalProduct ? "Оставить заявку" : "Получить КП за 24 часа"}</h3>
                {modalProduct && modalProduct !== "Записаться в демозал" && (<p className="text-sm text-primary mt-1">{modalProduct}</p>)}
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
                    sendLead({ name: modalName, phone: modalPhone, product: modalProduct || "Получить КП за 24 часа", topic: "волчки", formType: "modal" });
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

      <footer className="border-t border-border py-12 px-6 bg-background">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-10">
            <div>
              <img src="https://cdn.poehali.dev/files/b643e2cd-1c2b-461b-b32b-4053b1b9e72b.jpg" alt="Техносиб" className="h-8 w-auto object-contain mb-2" />
              <p className="text-xs text-muted-foreground mb-4">Поставщик оборудования для мясопереработки</p>
              <div className="space-y-2">
                {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                <a href="tel:88005059124" onClick={() => { try { (window as any).ym?.(107258870, 'reachGoal', 'click_phone'); } catch (_e) { /* noop */ } }} className="flex items-center gap-2 text-sm text-foreground hover:text-primary transition-colors"><Icon name="Phone" size={14} className="text-primary" />8 800 505-91-24</a>
                {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                <a href="mailto:massagers@t-sib.ru" onClick={() => { try { (window as any).ym?.(107258870, 'reachGoal', 'click_email'); } catch (_e) { /* noop */ } }} className="flex items-center gap-2 text-sm text-foreground hover:text-primary transition-colors"><Icon name="Mail" size={14} className="text-primary" />massagers@t-sib.ru</a>
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
              </div>
            </div>
            <div>
              <p className="font-semibold text-sm text-foreground mb-3">Разделы</p>
              <div className="space-y-2">
                {[["#advantages", "Преимущества"], ["#catalog", "Каталог волчков"], ["#videos", "Видео"], ["#segments", "Подбор"], ["#faq", "Частые вопросы"]].map(([href, label]) => (
                  <a key={href} href={href} className="block text-sm text-muted-foreground hover:text-primary transition-colors">{label}</a>
                ))}
              </div>
            </div>
            <div>
              <p className="font-semibold text-sm text-foreground mb-3">Контакты</p>
              <a href="/contacts" className="block text-sm text-muted-foreground hover:text-primary transition-colors mb-2">Все контакты</a>
              <button onClick={() => { setModalProduct(""); setModalOpen(true); }} className={btnPrimary + " !px-6 !py-3 !text-sm mt-2"}>Получить КП</button>
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

      <QuizSideTrigger storageKey="quiz_auto_volchki">
        {(close) => (
          <QuizBlock onSent={(name, phone, email, quizAnswers) => { sendLead({ name, phone, email, quizAnswers, product: "Получить подборку (квиз-попап)", topic: "волчки", formType: "quiz" }); close(); }} />
        )}
      </QuizSideTrigger>
      <ThankYouModal open={thankYouOpen} onClose={() => setThankYouOpen(false)} />
    </div>
  );
};

export default Volchki;