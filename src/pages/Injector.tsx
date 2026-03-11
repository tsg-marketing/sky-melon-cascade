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

const QUIZ_QUESTIONS = [
  { q: "Какой продукт обрабатываете?", options: ["Мясо (говядина/свинина)", "Птица (тушки/филе)", "Рыба", "Деликатесы"] },
  { q: "Какой объём производства в смену?", options: ["До 500 кг", "500 кг — 2 т", "2–5 т", "Более 5 т"] },
  { q: "Тип сырья?", options: ["Целые куски", "Тушки с костью", "Филе / без кости", "Смешанное"] },
  { q: "Цель обработки?", options: ["Посол / засолка", "Маринование", "Ускорение цикла", "Увеличение выхода"] },
  { q: "Вязкость маринада?", options: ["Жидкий рассол", "Густой маринад", "С кусочками специй", "Ещё не знаю"] },
  { q: "Нужна программируемость (PLC)?", options: ["Да, несколько программ", "Нет, простое управление", "Нужна консультация"] },
];

const QuizBlock = ({ onSent }: { onSent: (name: string, phone: string, quizAnswers: Record<string, string>) => void }) => {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<string[]>([]);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [phoneTouched, setPhoneTouched] = useState(false);
  const isLast = step === QUIZ_QUESTIONS.length;
  const phoneValid = isValidPhone(phone);
  const choose = (opt: string) => { setAnswers([...answers, opt]); setStep(step + 1); };
  const handleSubmit = () => {
    if (!name.trim() || !phoneValid) return;
    const quizAnswers: Record<string, string> = {};
    QUIZ_QUESTIONS.forEach((q, i) => { quizAnswers[q.q] = answers[i] || ""; });
    onSent(name, phone, quizAnswers);
  };
  return (
    <div className="max-w-2xl mx-auto">
      {!isLast ? (
        <div>
          <div className="flex items-center gap-3 mb-8">
            {QUIZ_QUESTIONS.map((_, i) => (<div key={i} className={`h-2 flex-1 rounded-full transition-all ${i < step ? "bg-primary" : i === step ? "bg-primary/50" : "bg-border"}`} />))}
          </div>
          <p className="text-sm text-muted-foreground mb-2">Вопрос {step + 1} из {QUIZ_QUESTIONS.length}</p>
          <h3 className="text-3xl font-bold text-foreground mb-8">{QUIZ_QUESTIONS[step].q}</h3>
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
          <p className="text-muted-foreground text-base mb-8 text-center">Оставьте контакты — технолог подберёт оборудование и пришлёт КП</p>
          <div className="space-y-4">
            <input type="text" placeholder="Ваше имя" value={name} onChange={e => setName(e.target.value)} className={inputCls} />
            <div>
              <input type="tel" placeholder="+7 (___) ___-__-__" value={phone} onChange={e => setPhone(formatPhone(phone, e.target.value))} onBlur={() => setPhoneTouched(true)} className={phoneTouched && !phoneValid ? inputError : inputCls} />
              {phoneTouched && !phoneValid && <p className="text-xs text-red-500 mt-1">Введите номер России, Казахстана или Беларуси</p>}
            </div>
            <button onClick={handleSubmit} disabled={!name.trim() || !phoneValid} className="w-full py-4 bg-primary text-white rounded-xl font-bold text-xl hover:bg-primary/90 transition-all shadow-sm disabled:opacity-40">Отправить</button>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Отправляя форму, я соглашаюсь с{" "}
              <a href="https://t-sib.ru/assets/politika_t-sib16.05.25.pdf" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">политикой обработки персональных данных</a>
              {" "}и даю{" "}
              <a href="https://t-sib.ru/assets/soglasie_t-sib16.05.25.pdf" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">согласие на обработку персональных данных</a>.
            </p>
          </div>
        </div>
      )}
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

const Injector = () => {
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
  const [catalogData, setCatalogData] = useState<{ massagers: CatalogItem[]; injectors: CatalogItem[] } | null>(null);
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
    const ids = ["hero","pain","catalog","benefits","compare","selector","service","about","faq","contacts"];
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
        const found = (d.injectors || []).find((it: CatalogItem) => it.id === productId);
        if (found) { setCatalogExpanded(true); setTimeout(() => { setSelectedItem(found); setSelectedSlide(0); const el = document.getElementById("product-" + productId); if (el) el.scrollIntoView({ behavior: "smooth", block: "center" }); }, 100); }
      }
    }).finally(() => setCatalogLoading(false));
  }, []);

  const filteredItems = useCallback(() => {
    if (!catalogData) return [];
    const items = catalogData.injectors;
    if (!catalogSearch.trim()) return items;
    const q = catalogSearch.toLowerCase();
    return items.filter((it) => it.name.toLowerCase().includes(q) || (it.brand || "").toLowerCase().includes(q));
  }, [catalogData, catalogSearch]);

  const navLinks = [
    { href: "/",             label: "Массажеры" },
    { href: "#catalog",      label: "Каталог" },
    { href: "#advantages",   label: "Преимущества" },
    { href: "#selector",     label: "Подбор" },
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
      </header>

      <section id="hero" className="relative pt-28 pb-20 px-6 min-h-screen flex items-center bg-gradient-to-br from-primary/5 via-background to-background overflow-hidden">
        <div className="absolute inset-0 lg:hidden" style={{ backgroundImage: "url(https://cdn.poehali.dev/files/31cdb492-7133-4082-ab8b-95564d292c21.jpg)", backgroundSize: "cover", backgroundPosition: "center", backgroundRepeat: "no-repeat", opacity: 0.13 }} />
        <div className="absolute top-24 right-0 w-[600px] h-[600px] bg-primary/6 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 max-w-7xl mx-auto w-full">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className={`transition-all duration-1000 ${vis("hero") ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
              <span className="inline-block text-xs font-semibold tracking-widest text-primary uppercase border border-primary/30 rounded-full px-4 py-1.5 mb-6 bg-primary/5">Поставка и внедрение</span>
              <h1 className="text-3xl sm:text-5xl lg:text-6xl xl:text-7xl font-display font-black leading-[1.05] tracking-tight mb-6 text-foreground">Инъекторы для равномерного{" "}<span className="text-primary">маринования мяса</span></h1>
              <p className="text-2xl font-semibold text-foreground leading-relaxed mb-3 max-w-xl">Инъекторы для мяса от ведущих производителей мясного оборудования Daribo (Дарибо), Niro-Tech (Ниро-Тех), INWESTPOL (Инвестпол)</p>
              <p className="text-lg text-muted-foreground leading-relaxed mb-10 max-w-xl">Точная дозировка рассола, работа с вязкими маринадами, подпружиненные иглы для тушек с костью. Подбираем модель и настройки под ваш продукт.</p>
              <div className="flex flex-col sm:flex-row gap-4">
                <button onClick={() => setModalOpen(true)} className="px-8 py-4 bg-primary text-white rounded-full font-bold text-lg hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 text-center">Получить предложение</button>
                <a href="#catalog" className="px-8 py-4 border-2 border-primary/30 text-primary rounded-full font-semibold text-lg hover:border-primary hover:bg-primary/5 transition-all text-center">Смотреть оборудование</a>
              </div>
            </div>
            <div className={`hidden lg:block transition-all duration-1000 delay-300 ${vis("hero") ? "opacity-100 scale-100" : "opacity-0 scale-95"}`}>
              <img src="https://cdn.poehali.dev/files/31cdb492-7133-4082-ab8b-95564d292c21.jpg" alt="Инъектор для мяса Daribo" className="w-full h-auto object-contain lg:scale-125" />
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 px-6 bg-primary/5">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl lg:text-5xl font-display font-black tracking-tight text-foreground mb-4">Зачем нужен инъектор для мяса?</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: "Target", title: "Равномерный посол без серых пятен", desc: "Регистр давления обеспечивает одинаковое давление на каждой игле — нет пересола и недосола" },
              { icon: "Zap", title: "Работа с вязкими маринадами до 4,3 бар", desc: "Густые маринады, соусы с частицами и специями — без засора системы" },
              { icon: "ArrowUpCircle", title: "Увеличение выхода готового продукта", desc: "Точная дозировка рассола повышает выход продукта без потери качества" },
            ].map((item, i) => (
              <div key={i} className="bg-white rounded-2xl p-6 border border-primary/10 flex flex-col gap-4 hover:shadow-md transition-shadow">
                <div className="w-12 h-12 flex items-center justify-center bg-primary/10 rounded-xl flex-shrink-0"><Icon name={item.icon} fallback="CheckCircle" size={24} className="text-primary" /></div>
                <div><h3 className="font-bold text-xl text-foreground mb-2">{item.title}</h3><p className="text-base text-muted-foreground leading-relaxed">{item.desc}</p></div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="advantages" className="py-12 px-6 bg-gradient-to-br from-primary/5 via-white to-primary/10">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-14"><h2 className="text-4xl lg:text-5xl font-display font-black tracking-tight text-foreground">Преимущества наших инъекторов</h2></div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[
              { icon: "Grid3x3", title: "84 иглы", desc: "Максимальное покрытие продукта" },
              { icon: "Gauge", title: "Давление до 4,3 бар", desc: "Работа с вязкими маринадами без потери качества" },
              { icon: "Zap", title: "Подпружиненные иглы", desc: "Не ломаются при контакте с костью, равномерно покрывают продукт" },
              { icon: "MoveHorizontal", title: "Зубчатый конвейер", desc: "Боковые направляющие — продукт не сдвигается" },
              { icon: "Ruler", title: "Шаг 15–60 мм", desc: "Точная настройка под любой продукт" },
              { icon: "Repeat", title: "Повторяемость", desc: "Одинаковый шаг на каждой партии" },
              { icon: "Droplets", title: "Мойка без разбора корпуса", desc: "Быстрая санитарная обработка без простоев" },
              { icon: "ListChecks", title: "До 99 программ работы", desc: "Время, интервалы, вакуум, скорость — всё сохраняется" },
            ].map((feat, i) => (
              <div key={i} className="flex items-center gap-3 bg-white rounded-xl border border-border px-4 py-3 hover:border-primary/40 hover:shadow-sm transition-all">
                <div className="w-10 h-10 shrink-0 bg-primary/10 rounded-lg flex items-center justify-center"><Icon name={feat.icon} fallback="Star" size={20} className="text-primary" /></div>
                <div><p className="font-bold text-xl text-foreground leading-snug">{feat.title}</p><p className="text-base text-muted-foreground">{feat.desc}</p></div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="catalog" className="py-12 px-6 bg-background">
        <div className="max-w-7xl mx-auto">
          <div className={`text-center mb-14 transition-all duration-1000 ${vis("catalog") ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
            <h2 className="text-5xl lg:text-6xl font-display font-black tracking-tight text-foreground leading-tight">Инъекторы для мяса</h2>
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
                            <button onClick={() => { setInquiryItem(item); setInquiryName(""); setInquiryPhone(""); setInquirySent(false); }} className="w-full py-4 bg-primary text-white rounded-xl text-base font-bold hover:bg-primary/90 transition-all shadow-md">Узнать подробней</button>
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
                    <img src={selectedItem.pictures[selectedSlide]} alt={selectedItem.name} className="w-full h-full object-contain p-3" />
                    {selectedItem.pictures.length > 1 && (<><button onClick={() => setSelectedSlide((s) => (s - 1 + selectedItem.pictures.length) % selectedItem.pictures.length)} className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-white rounded-full shadow flex items-center justify-center hover:bg-primary/5"><Icon name="ChevronLeft" size={16} /></button><button onClick={() => setSelectedSlide((s) => (s + 1) % selectedItem.pictures.length)} className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-white rounded-full shadow flex items-center justify-center hover:bg-primary/5"><Icon name="ChevronRight" size={16} /></button></>)}
                  </div>
                  {selectedItem.pictures.length > 1 && (<div className="flex gap-2 overflow-x-auto pb-1">{selectedItem.pictures.map((pic, pi) => (<button key={pi} onClick={() => setSelectedSlide(pi)} className={`flex-shrink-0 w-12 h-12 rounded-lg overflow-hidden border-2 transition-all ${pi === selectedSlide ? "border-primary shadow-md" : "border-transparent opacity-60 hover:opacity-100"}`}><img src={pic} alt="" className="w-full h-full object-contain bg-white p-1" /></button>))}</div>)}
                </div>
                <div className="p-5 sm:p-6 flex flex-col justify-center gap-2 flex-1">
                  {selectedItem.brand && (<span className="text-xs font-bold text-primary uppercase tracking-widest">{selectedItem.brand}</span>)}
                  <h2 className="text-xl sm:text-2xl font-display font-black text-foreground leading-tight">{selectedItem.name}</h2>
                  {selectedItem.price_display && (<p className="text-2xl sm:text-3xl font-black text-primary">{selectedItem.price_display}</p>)}
                  <button onClick={() => { setSelectedItem(null); setInquiryItem(selectedItem); setInquiryName(""); setInquiryPhone(""); setInquirySent(false); }} className="hidden sm:block mt-2 w-full py-3 bg-primary text-white rounded-xl text-base font-bold hover:bg-primary/90 transition-all shadow-md">Узнать подробней</button>
                </div>
              </div>
              <div className="px-5 sm:px-6 pb-6 flex flex-col gap-4 border-t border-border/40">
                {selectedItem.all_params.length > 0 && (<div className="pt-4"><p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-2">Характеристики</p><div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8">{selectedItem.all_params.map((p, pi) => (<div key={pi} className="flex justify-between gap-4 py-1.5 border-b border-border/40 text-sm"><span className="text-muted-foreground">{p.name}</span><span className="font-medium text-foreground text-right">{p.value}</span></div>))}</div></div>)}
                {selectedItem.description && (<div><p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-2">Описание</p><div className="text-sm text-muted-foreground leading-relaxed" dangerouslySetInnerHTML={{ __html: selectedItem.description }} /></div>)}
                <button onClick={() => { setSelectedItem(null); setInquiryItem(selectedItem); setInquiryName(""); setInquiryPhone(""); setInquirySent(false); }} className="sm:hidden w-full py-4 bg-primary text-white rounded-xl text-lg font-bold hover:bg-primary/90 transition-all shadow-md">Узнать подробней</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {inquiryItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={() => setInquiryItem(null)}>
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
          <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-md p-8" onClick={(e) => e.stopPropagation()}>
            <button onClick={() => setInquiryItem(null)} className="absolute top-4 right-4 w-10 h-10 bg-background hover:bg-primary/10 rounded-xl flex items-center justify-center transition-colors"><Icon name="X" size={18} className="text-muted-foreground" /></button>
            <h3 className="text-2xl font-display font-black text-foreground mb-1">Узнать подробней</h3>
            <p className="text-sm text-muted-foreground mb-6 leading-relaxed"><span className="font-medium text-foreground">{inquiryItem.name}</span></p>
            <div className="space-y-3">
              <input type="text" placeholder="Ваше имя" value={inquiryName} onChange={(e) => setInquiryName(e.target.value)} className={inputCls} />
              <div>
                <input type="tel" placeholder="+7 (___) ___-__-__" value={inquiryPhone} onChange={(e) => setInquiryPhone(formatPhone(inquiryPhone, e.target.value))} onBlur={() => setInquiryPhoneTouched(true)} className={inquiryPhoneTouched && !isValidPhone(inquiryPhone) ? inputError : inputCls} />
                {inquiryPhoneTouched && !isValidPhone(inquiryPhone) && <p className="text-xs text-red-500 mt-1">Введите номер России, Казахстана или Беларуси</p>}
              </div>
              <button onClick={() => { if (inquiryName.trim() && isValidPhone(inquiryPhone) && !sending) { sendLead({ name: inquiryName, phone: inquiryPhone, product: inquiryItem?.name, topic: 'инъекторы для мяса', formType: 'inquiry' }); setInquiryItem(null); setInquiryName(""); setInquiryPhone(""); setInquiryPhoneTouched(false); } }} disabled={!inquiryName.trim() || !isValidPhone(inquiryPhone) || sending} className="w-full py-4 bg-primary text-white rounded-xl font-bold text-lg hover:bg-primary/90 transition-all shadow-md disabled:opacity-40">{sending ? "Отправляем..." : "Отправить"}</button>
              {CONSENT_TEXT}
            </div>
          </div>
        </div>
      )}

      <section id="benefits" className="py-12 px-6 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className={`text-center mb-16 transition-all duration-1000 ${vis("benefits") ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
            <h2 className="text-5xl lg:text-6xl font-display font-black tracking-tight text-foreground leading-tight">Что меняется после внедрения</h2>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {[
              { icon: "TrendingUp", title: "Выше выход", desc: "Ориентир +20–30% влаги при корректной технологии и режиме" },
              { icon: "Target", title: "Стабильный посол", desc: "Однородный цвет, вкус, текстура — без серых пятен и недосола" },
              { icon: "Gauge", title: "Быстрее цикл", desc: "Вакуум и интенсивное массирование сокращают время выдержки" },
              { icon: "ThumbsUp", title: "Меньше брака", desc: "Равномерная инъекция исключает пересол и недосол крупных кусков" },
              { icon: "Repeat", title: "Повторяемость", desc: "Программы PLC: одинаковый результат на каждой партии" },
              { icon: "Droplets", title: "Санитария без потерь", desc: "Быстросъёмные детали — мойка без простоев и сложной разборки" },
            ].map((tile, i) => (
              <div key={i} className={`p-7 bg-background border border-border rounded-2xl hover:border-primary/40 hover:shadow-lg transition-all flex flex-col gap-4 ${vis("benefits") ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`} style={{ transitionDelay: `${i * 90}ms`, transitionDuration: "700ms" }}>
                <div className="w-14 h-14 bg-primary/10 rounded-xl flex items-center justify-center"><Icon name={tile.icon} fallback="Star" size={28} className="text-primary" /></div>
                <div><h3 className="font-bold text-xl text-foreground mb-2">{tile.title}</h3><p className="text-muted-foreground text-base">{tile.desc}</p></div>
              </div>
            ))}
          </div>
          <div className="text-center"><a href="#selector" className={btnPrimary + " inline-flex items-center gap-2"}>Рассчитать эффект<Icon name="Calculator" size={18} /></a></div>
        </div>
      </section>

      <section id="pain" className="py-12 px-6 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className={`text-center mb-16 transition-all duration-1000 ${vis("pain") ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}><h2 className="text-5xl lg:text-6xl font-display font-black tracking-tight text-foreground leading-tight">Качество посола и маринования</h2></div>
          <div className={`flex items-center justify-center gap-2 flex-wrap mb-16 transition-all duration-700 ${vis("pain") ? "opacity-100" : "opacity-0"}`}>
            {[{ icon: "Package", label: "Сырьё" },{ icon: "Pipette", label: "Инъектор" },{ icon: "RefreshCw", label: "Массажер" },{ icon: "Thermometer", label: "Термообработка" },{ icon: "CheckCircle", label: "Готово" }].map((step, i, arr) => (
              <div key={i} className="flex items-center gap-2">
                <div className="flex flex-col items-center gap-2 px-5 py-4 bg-primary/5 border border-primary/15 rounded-2xl min-w-[100px]"><Icon name={step.icon} fallback="Circle" size={28} className="text-primary" /><span className="text-sm font-semibold text-foreground">{step.label}</span></div>
                {i < arr.length - 1 && <Icon name="ChevronRight" size={20} className="text-primary/40" />}
              </div>
            ))}
          </div>
          <div className="grid lg:grid-cols-2 gap-12">
            <div className={`transition-all duration-700 ${vis("pain") ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-8"}`}>
              <div className="flex items-center gap-3 mb-6"><div className="w-10 h-10 bg-red-50 border border-red-200 rounded-xl flex items-center justify-center"><Icon name="AlertTriangle" size={20} className="text-red-500" /></div><h3 className="text-xl font-bold text-foreground">Типичные проблемы производства</h3></div>
              <div className="space-y-3">
                {[{ icon: "AlertCircle", text: "Непросол и пятна — рекламации и брак партий" },{ icon: "Clock", text: "Длинный цикл посола сдерживает объёмы выпуска" },{ icon: "ThumbsDown", text: "Жалобы на качество — неповторяемость вкуса" },{ icon: "Wrench", text: "Простои из-за мойки — сложная санобработка" }].map((item, i) => (
                  <div key={i} className="flex items-start gap-4 p-4 border border-red-100 rounded-xl bg-red-50 hover:bg-red-100/60 transition-all" style={{ transitionDelay: `${i * 80}ms` }}><Icon name={item.icon} fallback="AlertCircle" size={20} className="text-red-400 flex-shrink-0 mt-0.5" /><span className="text-base text-foreground">{item.text}</span></div>
                ))}
              </div>
            </div>
            <div className={`transition-all duration-700 delay-200 ${vis("pain") ? "opacity-100 translate-x-0" : "opacity-0 translate-x-8"}`}>
              <div className="flex items-center gap-3 mb-6"><div className="w-10 h-10 bg-primary/10 border border-primary/20 rounded-xl flex items-center justify-center"><Icon name="CheckCircle" size={20} className="text-primary" /></div><h3 className="text-xl font-bold text-foreground">Что даёт наше оборудование</h3></div>
              <div className="space-y-3">
                {[{ icon: "Gauge", text: "Регистр давления — стабильная подача в каждую иглу" },{ icon: "Wind", text: "Вакуум: меньше окисления, лучше текстура продукта" },{ icon: "Settings", text: "Программируемые режимы — повторяемые результаты" },{ icon: "Shield", text: "Санитарный конструктив — быстрая мойка без разборки" }].map((item, i) => (
                  <div key={i} className="flex items-start gap-4 p-4 border border-primary/15 rounded-xl bg-primary/5 hover:bg-primary/10 transition-all" style={{ transitionDelay: `${i * 80}ms` }}><Icon name={item.icon} fallback="CheckCircle" size={20} className="text-primary flex-shrink-0 mt-0.5" /><span className="text-base text-foreground">{item.text}</span></div>
                ))}
              </div>
            </div>
          </div>
          <div className={`text-center mt-12 transition-all duration-700 ${vis("pain") ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}>
            <button onClick={() => { setModalProduct("consult"); setModalOpen(true); }} className="inline-flex items-center gap-2 px-8 py-4 bg-primary text-white rounded-full font-bold text-lg hover:bg-primary/90 transition-all shadow-lg shadow-primary/20"><Icon name="Phone" size={18} />Получить консультацию технолога</button>
          </div>
        </div>
      </section>

      <section id="compare" className="py-12 px-6 bg-background">
        <div className="max-w-7xl mx-auto">
          <div className={`text-center mb-16 transition-all duration-1000 ${vis("compare") ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}><h2 className="text-5xl lg:text-6xl font-display font-black tracking-tight text-foreground leading-tight">Инъекторы с давлением и обычные инъекторы</h2></div>
          <div className={`transition-all duration-700 ${vis("compare") ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
            <h3 className="font-bold text-2xl text-foreground mb-4">Сравнение инъекторов</h3>
            <div className="overflow-x-auto -mx-4 px-4">
              <div className="bg-white border border-border rounded-2xl overflow-hidden shadow-sm min-w-[600px]">
                {[["Параметр","Регистр давления","Обычный инъектор"],["Давление на каждой игле","Одинаковое","Варьируется"],["Риск серых пятен","Минимальный","Высокий"],["Засор одной иглы","Остальные работают","Падает вся система"],["Вязкие маринады","Да, до 4,3 бар","Ограниченно"],["Кость / тушки птицы","Да (подпружинен.)","Нет"],["Точность дозировки","Высокая","Средняя"]].map((row, ri) => (
                  <div key={ri} className={`grid grid-cols-3 text-base ${ri === 0 ? "bg-primary/5 font-bold text-foreground" : "border-t border-border text-foreground"} hover:bg-primary/3 transition-colors`}>
                    {row.map((cell, ci) => (<div key={ci} className={`px-4 py-4 ${ci === 1 && ri > 0 ? "text-primary font-semibold" : ""}`}>{cell}</div>))}
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="max-w-md mx-auto mt-14"><CompareForm onSent={(name, phone) => sendLead({ name, phone, topic: 'инъекторы для мяса', formType: 'compare' })} /></div>
        </div>
      </section>

      <section className="py-12 px-6 bg-white">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-10"><span className="text-xs font-semibold tracking-widest text-primary uppercase">Смотрите в деле</span><h2 className="text-4xl lg:text-5xl font-display font-black tracking-tight mt-3 text-foreground">Посмотрите как работает наше оборудование</h2></div>
          <div className="rounded-3xl overflow-hidden shadow-xl border border-border aspect-video">
            <iframe src="https://rutube.ru/play/embed/a4b1832f47b691f9066c6370f007d8d0/" className="w-full h-full" allowFullScreen allow="autoplay; fullscreen" title="Оборудование Daribo" />
          </div>
        </div>
      </section>

      <section id="selector" className="py-12 px-6 bg-background">
        <div className="max-w-4xl mx-auto">
          <div className={`text-center mb-16 transition-all duration-1000 ${vis("selector") ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}><span className="text-xs font-semibold tracking-widest text-primary uppercase">Подбор оборудования</span><h2 className="text-5xl lg:text-6xl font-display font-black tracking-tight mt-4 text-foreground leading-tight">Ответьте на 6 вопросов — получите решение</h2><p className="text-lg text-muted-foreground mt-4">Технолог подберёт оборудование и пришлёт КП в течение 2 часов</p></div>
          <QuizBlock onSent={(name, phone, quizAnswers) => sendLead({ name, phone, quizAnswers, topic: 'инъекторы для мяса', formType: 'quiz' })} />
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
              { q: "Что происходит при засоре одной иглы?", a: "При конструкции с регистром давления засор одной иглы не влияет на остальные — давление перераспределяется. В обычных инъекторах засор одной иглы снижает давление во всей системе." },
              { q: "Работает ли с вязкими маринадами и специями?", a: "Да. Инъекторы работают при давлении до 4,3 бар, что позволяет использовать густые маринады, соусы с частицами и специями без засора системы." },
              { q: "Можно ли работать с тушками птицы и костью?", a: "Да. Модели с подпружиненными иглами специально рассчитаны на работу с тушками птицы и продуктом на кости — иглы пружинят при контакте с костью, не ломаются." },
              { q: "Как устроена мойка оборудования?", a: "Конвейер снимается без инструмента за 1–2 минуты. Корпус и внутренние поверхности из SUS304 легко моются стандартными дезинфектантами. Полная мойка занимает 15–30 минут." },
              { q: "Что такое PLC и зачем нужны 99 программ?", a: "PLC — программируемый логический контроллер. Позволяет сохранять до 99 рецептур (время, вакуум, скорость, направление, интервалы) и воспроизводить их в одно касание. Исключает человеческий фактор и обеспечивает повторяемость." },
              { q: "Что нужно для подбора оборудования?", a: "Достаточно указать: продукт (мясо/птица/рыба), объём в смену (кг/ч или т/смену), тип сырья (куски, тушки, филе, кость), цель (посол, маринование, выход), вязкость маринада. Остальное уточним на звонке." },
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
                    {[{ icon: "Phone", label: "Телефон", value: "8 800 505-91-24", href: "tel:88005059124" },{ icon: "Mail", label: "Почта", value: "massagers@t-sib.ru", href: "mailto:massagers@t-sib.ru" }].map((c, i) => (
                      <a key={i} href={c.href} className="flex items-center gap-4 p-4 bg-white border border-primary/10 rounded-xl hover:border-primary/30 transition-colors"><div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0"><Icon name={c.icon} fallback="Star" size={18} className="text-primary" /></div><div><p className="text-xs text-muted-foreground">{c.label}</p><p className="font-bold text-base text-foreground">{c.value}</p></div></a>
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
                  <button onClick={() => { if (contactsName.trim() && isValidPhone(contactsPhone) && !sending) { sendLead({ name: contactsName, phone: contactsPhone, comment: contactsComment, topic: 'инъекторы для мяса', formType: 'contacts' }); setContactsName(""); setContactsPhone(""); setContactsComment(""); setContactsPhoneTouched(false); } }} disabled={!contactsName.trim() || !isValidPhone(contactsPhone) || sending} className="w-full py-4 bg-primary text-white rounded-xl font-bold text-base hover:bg-primary/90 transition-all shadow-sm disabled:opacity-40">{sending ? "Отправляем..." : "Отправить"}</button>
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
              <button onClick={() => { if (modalName.trim() && isValidPhone(modalPhone) && !sending) { sendLead({ name: modalName, phone: modalPhone, product: modalProduct, topic: 'инъекторы для мяса', formType: 'modal' }); setModalOpen(false); setModalName(""); setModalPhone(""); setModalPhoneTouched(false); } }} disabled={!modalName.trim() || !isValidPhone(modalPhone) || sending} className="w-full py-4 bg-primary text-white rounded-xl font-bold text-base hover:bg-primary/90 transition-all shadow-sm disabled:opacity-40">{sending ? "Отправляем..." : "Отправить"}</button>
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
                <a href="tel:88005059124" className="flex items-center gap-2 text-sm text-foreground hover:text-primary transition-colors"><Icon name="Phone" size={14} className="text-primary" />8 800 505-91-24</a>
                <a href="mailto:massagers@t-sib.ru" className="flex items-center gap-2 text-sm text-foreground hover:text-primary transition-colors"><Icon name="Mail" size={14} className="text-primary" />massagers@t-sib.ru</a>
              </div>
            </div>
            <div>
              <p className="font-semibold text-sm text-foreground mb-3">Оборудование</p>
              <div className="space-y-2">
                <a href="/" className="block text-sm text-muted-foreground hover:text-primary transition-colors">Вакуумные массажеры</a>
                <a href="#catalog" className="block text-sm text-muted-foreground hover:text-primary transition-colors">Каталог инъекторов</a>
              </div>
            </div>
            <div>
              <p className="font-semibold text-sm text-foreground mb-3">Компания</p>
              <div className="space-y-2">
                {["#benefits", "#compare", "#service", "#about", "#faq"].map((href, i) => (<a key={i} href={href} className="block text-sm text-muted-foreground hover:text-primary transition-colors">{["Преимущества", "Почему работает лучше", "От подбора до запуска", "О компании Daribo (Дарибо)", "FAQ"][i]}</a>))}
              </div>
            </div>
            <div>
              <p className="font-semibold text-sm text-foreground mb-3">Подбор</p>
              <div className="space-y-2">
                {[["#selector", "Подобрать оборудование"], ["#contacts", "Контакты"], ["#contacts", "Запросить КП"]].map(([href, label], i) => (<a key={i} href={href} className="block text-sm text-muted-foreground hover:text-primary transition-colors">{label}</a>))}
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
            <iframe src="https://rutube.ru/play/embed/a4b1832f47b691f9066c6370f007d8d0/" className="w-full h-full rounded-2xl" allowFullScreen allow="autoplay; fullscreen" title="Оборудование Daribo" />
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

export default Injector;