import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import Icon from "@/components/ui/icon";
import ThankYouModal from "@/components/ThankYouModal";
import QuizSideTrigger from "@/components/QuizSideTrigger";
import { useLeadForm } from "@/hooks/useLeadForm";
import { useCart } from "@/hooks/useCart";
import { productPath, pickListingParams } from "@/lib/catalog";
import SiteHeader from "@/components/site/SiteHeader";

const CATALOG_URL = "https://functions.poehali.dev/6070fa9b-5de5-408c-984f-0ae244eb68ef";

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
  video: string | null;
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
      <h3 className="font-display font-bold text-2xl mb-1 text-foreground text-center">Хотите подобрать льдогенератор?</h3>
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

const ConsentCheckbox = ({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) => (
  <label className="flex items-start gap-2 cursor-pointer select-none">
    <input
      type="checkbox"
      checked={checked}
      onChange={(e) => onChange(e.target.checked)}
      className="mt-0.5 w-4 h-4 flex-shrink-0 accent-orange-500 cursor-pointer"
    />
    <span className="text-xs text-muted-foreground leading-relaxed">
      Отправляя форму, я соглашаюсь с{" "}
      <a href="https://t-sib.ru/assets/politika_t-sib16.05.25.pdf" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">политикой обработки персональных данных</a>
      {" "}и даю{" "}
      <a href="https://t-sib.ru/assets/soglasie_t-sib16.05.25.pdf" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">согласие на обработку персональных данных</a>.
    </span>
  </label>
);

const QUIZ_QUESTIONS = [
  { q: "Для какой отрасли нужен лёд?", options: ["Мясопереработка / куттерование", "Рыба и морепродукты", "Хлебопечение", "Торговля, HoReCa, витрины", "Сельское хозяйство / другое"] },
  { q: "Какой объём льда нужен в сутки?", options: ["До 300 кг", "300–1000 кг", "1000–3000 кг", "Свыше 3000 кг", "Не знаю — нужна консультация"] },
  { q: "Какой тип льда предпочтителен?", options: ["Чешуйчатый (для куттеров, рыбы, витрин)", "Гранулированный/кусковой (для охлаждения, теплообмена)", "Не знаю, подскажите"] },
  { q: "Исполнение и условия размещения?", options: ["Моноблок (всё в одном корпусе)", "Библок (агрегат выносится из цеха)", "Нужна рекомендация"] },
];

const QuizBlock = ({ onSent }: { onSent: (name: string, phone: string, quizAnswers: Record<string, string>) => void }) => {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<string[]>([]);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [phoneTouched, setPhoneTouched] = useState(false);
  const [consent, setConsent] = useState(false);
  const isLast = step === QUIZ_QUESTIONS.length;
  const phoneValid = isValidPhone(phone);
  const choose = (opt: string) => { setAnswers([...answers, opt]); setStep(step + 1); };
  const handleSubmit = () => {
    if (!name.trim() || !phoneValid || !consent) return;
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
          <h3 className="font-display font-bold text-3xl mb-2 text-foreground text-center">Куда отправить подборку моделей с ценами?</h3>
          <p className="text-muted-foreground text-base mb-8 text-center">Пришлём 2–3 подходящие модели с ценами — технолог свяжется в течение 2 часов</p>
          <div className="space-y-4">
            <input type="text" placeholder="Ваше имя" value={name} onChange={e => setName(e.target.value)} className={inputCls} />
            <div>
              <input type="tel" placeholder="+7 (___) ___-__-__" value={phone} onChange={e => setPhone(formatPhone(phone, e.target.value))} onBlur={() => setPhoneTouched(true)} className={phoneTouched && !phoneValid ? inputError : inputCls} />
              {phoneTouched && !phoneValid && <p className="text-xs text-red-500 mt-1">Введите номер России, Казахстана или Беларуси</p>}
            </div>
            <ConsentCheckbox checked={consent} onChange={setConsent} />
            <button onClick={handleSubmit} disabled={!name.trim() || !phoneValid || !consent} className="w-full py-4 bg-orange-500 hover:bg-orange-600 text-white rounded-xl font-bold text-xl transition-all shadow-sm disabled:opacity-40">Отправить</button>
          </div>
        </div>
      )}
    </div>
  );
};

const LDOGenerator = () => {
  const { sendLead, sending, thankYouOpen, setThankYouOpen } = useLeadForm();
  const { addItem, removeItem, getQuantity } = useCart();
  const navigate = useNavigate();
  const [visibleSections, setVisibleSections] = useState<Record<string, boolean>>({});
  const [modalOpen, setModalOpen] = useState(false);
  const [modalProduct, setModalProduct] = useState("");
  const [modalName, setModalName] = useState("");
  const [modalPhone, setModalPhone] = useState("");
  const [contactsName, setContactsName] = useState("");
  const [contactsPhone, setContactsPhone] = useState("");
  const [contactsComment, setContactsComment] = useState("");
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [catalogExpanded, setCatalogExpanded] = useState(false);
  const [catalogData, setCatalogData] = useState<{ massagers: CatalogItem[]; injectors: CatalogItem[]; slicers: CatalogItem[]; icemakers: CatalogItem[] } | null>(null);
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
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [modalConsent, setModalConsent] = useState(false);
  const [inquiryConsent, setInquiryConsent] = useState(false);
  const [contactsConsent, setContactsConsent] = useState(false);
  const [contactsEmail, setContactsEmail] = useState("");
  const [iceTab, setIceTab] = useState<"flake" | "granular">("flake");
  const [segLevel, setSegLevel] = useState(0);

  useEffect(() => {
    document.title = "Льдогенераторы - Купить льдогенераторы от производителя недорого с гарантией на meatmassagers.ru. Доставка и установка и по всей России.";
    const setMeta = (name: string, content: string, property?: boolean) => {
      const attr = property ? "property" : "name";
      let el = document.querySelector(`meta[${attr}="${name}"]`);
      if (!el) { el = document.createElement("meta"); el.setAttribute(attr, name); document.head.appendChild(el); }
      el.setAttribute("content", content);
    };
    setMeta("description", "Купить льдогенераторы от производителя недорого с гарантией. Доставка и установка и по всей России. 21 категория. Более 1000 моделей для мясо и рыбопереработки от ведущих европейских, азиатских и российских производителей.");
    setMeta("keywords", "льдогенератор, промышленный льдогенератор, чешуйчатый лёд, генератор льда, купить льдогенератор");
    setMeta("og:title", "Промышленные льдогенераторы — чешуйчатый и гранулированный лёд | Техно-Сиб", true);
    setMeta("og:description", "Промышленные льдогенераторы от 90 до 10 000 кг льда в сутки для пищевого производства. Подбор модели под вашу производительность.", true);
    setMeta("og:url", "https://meatmassagers.ru/ldogenerator", true);
    setMeta("og:type", "website", true);
    const link = document.querySelector("link[rel='canonical']") || document.createElement("link");
    link.setAttribute("rel", "canonical");
    link.setAttribute("href", "https://meatmassagers.ru/ldogenerator");
    if (!link.parentNode) document.head.appendChild(link);
    return () => {
      document.title = "Массажеры и инъекторы от Техносиб";
      const canonical = document.querySelector("link[rel='canonical']");
      if (canonical) canonical.remove();
    };
  }, []);

  useEffect(() => {
    const ids = ["hero","benefits","catalog","videos","industries","segmentation","compare","service","selector","faq","technosib","getkp","contacts"];
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
        const found = (d.icemakers || []).find((it: CatalogItem) => it.id === productId);
        if (found) { setCatalogExpanded(true); setSelectedItem(found); setSelectedSlide(0); }
      }
      setCatalogLoading(false);
    }).catch(() => setCatalogLoading(false));
  }, []);

  const filteredItems = useCallback(() => {
    if (!catalogData) return [];
    const items = catalogData.icemakers || [];
    if (!catalogSearch.trim()) return items;
    const q = catalogSearch.toLowerCase();
    return items.filter((it) => it.name.toLowerCase().includes(q) || (it.brand || "").toLowerCase().includes(q));
  }, [catalogData, catalogSearch]);

  const openModelModal = (model: string) => {
    const items = catalogData?.icemakers || [];
    const q = model.toLowerCase().replace(/\s+/g, "");
    const found = items.find((it) => {
      const hay = (it.name + " " + (it.brand || "")).toLowerCase().replace(/\s+/g, "");
      return hay.includes(q);
    });
    if (found) {
      setSelectedItem(found);
      setSelectedSlide(0);
      history.replaceState(null, "", `#product-${found.id}`);
    } else {
      setCatalogSearch(model);
      document.getElementById("catalog")?.scrollIntoView({ behavior: "smooth" });
    }
  };

  const closeProductModal = () => {
    setSelectedItem(null);
    history.replaceState(null, "", window.location.pathname);
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteHeader current="/ldogenerator" onGetKp={() => { setModalProduct(""); setModalOpen(true); }} />

      <section id="hero" className="relative pt-24 sm:pt-28 pb-14 sm:pb-20 px-4 sm:px-6 bg-gradient-to-br from-primary/5 via-background to-background overflow-hidden">
        <div className="absolute top-24 right-0 w-[600px] h-[600px] bg-primary/6 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 max-w-7xl mx-auto w-full">
          <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">
            <div className={`transition-all duration-1000 ${vis("hero") ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
              <span className="inline-block text-xs font-semibold tracking-widest text-primary uppercase border border-primary/30 rounded-full px-4 py-1.5 mb-4 bg-primary/5">Поставка и внедрение</span>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-display font-black leading-[1.07] tracking-tight mb-4 text-foreground">Промышленные льдогенераторы{" "}<span className="text-primary">до 10 000 кг</span> льда в сутки</h1>
              <p className="text-lg sm:text-xl text-muted-foreground leading-relaxed mb-7 max-w-xl">Чешуйчатый и гранулированный лёд от компактной модели до промышленной линии.</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8 max-w-xl">
                {[
                  { emoji: "❄️", text: "Производительность 90–10 000 кг/сутки" },
                  { emoji: "🔪", text: "Не тупит ножи" },
                  { emoji: "🏭", text: "Нержавеющая сталь" },
                  { emoji: "🛡️", text: "Гарантия до 2-х лет" },
                ].map((t, i) => (
                  <div key={i} className="flex items-center gap-3 text-lg sm:text-xl font-bold text-foreground"><span className="text-2xl leading-none flex-shrink-0">{t.emoji}</span><span>{t.text}</span></div>
                ))}
              </div>
              <div className="flex flex-col sm:flex-row gap-4">
                <a href="#selector" className="px-8 py-4 bg-primary text-white rounded-full font-bold text-lg hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 text-center">Подобрать льдогенератор</a>
                <button onClick={() => { setModalProduct(""); setModalOpen(true); }} className="px-8 py-4 border-2 border-primary/30 text-primary rounded-full font-semibold text-lg hover:border-primary hover:bg-primary/5 transition-all text-center">Получить КП за 15 минут</button>
              </div>
            </div>
            <div className={`hidden lg:block transition-all duration-1000 delay-300 ${vis("hero") ? "opacity-100 scale-100" : "opacity-0 scale-95"}`}>
              <img src="https://cdn.poehali.dev/projects/63874bed-e293-4b07-975b-a3b344891b91/files/362214e7-927a-4e58-a79c-737cc98a25b7.jpg" alt="Промышленный льдогенератор" className="w-full h-auto object-contain rounded-3xl shadow-xl" />
            </div>
          </div>
        </div>
      </section>

      <section id="benefits" className="py-12 px-6 bg-gradient-to-br from-primary/5 via-white to-primary/10">
        <div className="max-w-7xl mx-auto">
          <div className={`text-center mb-14 transition-all duration-1000 ${vis("benefits") ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}><h2 className="text-4xl lg:text-5xl font-display font-black tracking-tight text-foreground">Почему выбирают наши льдогенераторы</h2></div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {[
              { icon: "Snowflake", title: "Лёд, который не тупит ножи куттеров", desc: "Толщина чешуек 0,6–0,9 мм и температура −6…−9 °C — лёд мгновенно смешивается с фаршем, не перегружая оборудование." },
              { icon: "Fish", title: "Хранение рыбы до 28 суток", desc: "Чешуйчатый лёд бережно обволакивает продукт без острых краёв — сохраняет товарный вид рыбы и морепродуктов на витрине и в транспортировке." },
              { icon: "Gauge", title: "Премиальные компрессорные агрегаты", desc: "Ресурс и стабильность работы — оборудование рассчитано на непрерывную эксплуатацию." },
              { icon: "Cpu", title: "Полная автоматизация", desc: "Микропроцессорное управление с самодиагностикой, таймер программирования на 2 недели, автоподдержание уровня воды." },
              { icon: "Boxes", title: "Моноблок или библок — на выбор", desc: "Библочное исполнение позволяет вынести агрегат за пределы цеха — экономия площади и температурный режим в рабочей зоне." },
              { icon: "Shield", title: "Пищевая нержавеющая сталь AISI 304", desc: "Соответствие техрегламентам ТС, гигиеничность, долговечность корпуса." },
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
          <div className={`text-center mb-10 transition-all duration-1000 ${vis("catalog") ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
            <h2 className="text-5xl lg:text-6xl font-display font-black tracking-tight text-foreground leading-tight">Каталог льдогенераторов</h2>
            <p className="text-lg text-muted-foreground mt-4">Модели в наличии и под заказ — от компактных до промышленных линий</p>
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
                          <img src={item.pictures[slide]} alt={item.name} referrerPolicy="no-referrer" loading="lazy" className="w-full h-full object-contain p-4 group-hover:scale-105 transition-transform duration-500" onClick={() => { setLightboxPhotos(item.pictures); setLightboxIndex(slide); setLightboxOpen(true); }} style={{ cursor: "pointer" }} />
                          {item.pictures.length > 1 && (<>
                            <button onClick={(e) => { e.stopPropagation(); setCardSlides((prev) => ({ ...prev, [item.id]: (slide - 1 + item.pictures.length) % item.pictures.length })); }} className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/90 hover:bg-white rounded-full shadow flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"><Icon name="ChevronLeft" size={16} className="text-foreground" /></button>
                            <button onClick={(e) => { e.stopPropagation(); setCardSlides((prev) => ({ ...prev, [item.id]: (slide + 1) % item.pictures.length })); }} className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/90 hover:bg-white rounded-full shadow flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"><Icon name="ChevronRight" size={16} className="text-foreground" /></button>
                            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">{item.pictures.map((_, pi) => (<button key={pi} onClick={(e) => { e.stopPropagation(); setCardSlides((prev) => ({ ...prev, [item.id]: pi })); }} className={`w-1.5 h-1.5 rounded-full transition-all ${pi === slide ? "bg-primary w-4" : "bg-white/70"}`} />))}</div>
                          </>)}
                          {item.brand && item.brand.toLowerCase() !== "hualian" && (<div className="absolute top-3 left-3 bg-white/95 text-primary text-xs font-bold px-3 py-1 rounded-full shadow-sm border border-primary/20 uppercase tracking-wide">{item.brand}</div>)}
                        </div>
                        <div className="p-5 flex flex-col flex-1">
                          <h3 className="font-bold text-2xl text-foreground mb-2 leading-snug cursor-pointer hover:text-primary transition-colors" onClick={() => navigate(productPath("ldogenerator", item))}>{item.name}</h3>
                          {item.price_display && (<p className="text-xl font-black text-primary mb-3">{item.price_display}</p>)}
                          <div className="mb-4 flex-1 space-y-1">
                            {pickListingParams(item.all_params).map((p, pi) => (
                              <div key={pi} className="flex items-baseline gap-2 text-sm">
                                <span className="text-muted-foreground flex-shrink-0">{p.name}</span>
                                <span className="flex-1 border-b border-dotted border-border/70" />
                                <span className="font-semibold text-foreground text-right break-words">{p.value}</span>
                              </div>
                            ))}
                          </div>
                          <div className="flex flex-col gap-2 mt-2">
                            <button onClick={() => { setInquiryItem(item); setInquiryName(""); setInquiryPhone(""); setInquirySent(false); setInquiryConsent(false); }} className="w-full py-4 bg-orange-500 hover:bg-orange-600 text-white rounded-xl text-base font-bold transition-all shadow-md">Получить консультацию</button>
                            {item.video && (<button onClick={() => setVideoUrl(item.video)} className="w-full py-3.5 bg-primary/10 hover:bg-primary/20 text-primary rounded-xl text-base font-semibold transition-all flex items-center justify-center gap-2"><Icon name="Play" size={18} />Смотреть видео</button>)}
                            <div className="flex gap-2">
                              <button onClick={() => navigate(productPath("ldogenerator", item))} className="flex-1 py-3.5 border-2 border-orange-500 text-orange-500 rounded-xl text-base font-semibold hover:bg-orange-50 transition-all">Подробнее</button>
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

      {catalogData && (catalogData.icemakers || []).some((it) => it.video) && (
        <section id="videos" className="py-12 px-6 bg-gradient-to-br from-primary/5 via-white to-primary/10">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-10">
              <h2 className="text-5xl lg:text-6xl font-display font-black tracking-tight text-foreground leading-tight">Видео о нашем оборудовании</h2>
              <p className="text-lg text-muted-foreground mt-4">Смотрите льдогенераторы в работе</p>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {(catalogData.icemakers || []).filter((it) => it.video).map((it) => (
                <div key={it.id} className="bg-white border border-border rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all">
                  <div className="relative w-full bg-black" style={{ aspectRatio: "16/9" }}>
                    <iframe src={it.video!} title={it.name} allow="autoplay; fullscreen" allowFullScreen className="absolute inset-0 w-full h-full" frameBorder="0" />
                  </div>
                  <div className="p-4">
                    <h3 className="font-bold text-lg text-foreground leading-snug cursor-pointer hover:text-primary transition-colors" onClick={() => { setSelectedItem(it); setSelectedSlide(0); history.replaceState(null, "", `#product-${it.id}`); }}>{it.name}</h3>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {videoUrl && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm" onClick={() => setVideoUrl(null)}>
          <button onClick={() => setVideoUrl(null)} className="absolute top-5 right-5 w-11 h-11 bg-white/15 hover:bg-white/25 rounded-full flex items-center justify-center transition-all"><Icon name="X" size={22} className="text-white" /></button>
          <div className="relative w-full max-w-4xl" style={{ aspectRatio: "16/9" }} onClick={(e) => e.stopPropagation()}>
            <iframe src={videoUrl.includes("?") ? `${videoUrl}&autoplay=1` : `${videoUrl}?autoplay=1`} title="Видео" allow="autoplay; fullscreen" allowFullScreen className="w-full h-full rounded-2xl" frameBorder="0" />
          </div>
        </div>
      )}

      {selectedItem && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4" onClick={closeProductModal}>
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
          <div className="relative bg-white w-full sm:rounded-3xl shadow-2xl sm:max-w-4xl rounded-t-3xl overflow-hidden" style={{ maxHeight: "95dvh" }} onClick={(e) => e.stopPropagation()}>
            <button onClick={closeProductModal} className="absolute top-4 right-4 z-10 w-10 h-10 bg-white/90 hover:bg-white border border-border rounded-full flex items-center justify-center shadow-sm transition-all"><Icon name="X" size={18} className="text-foreground" /></button>
            <div className="sm:hidden flex justify-center pt-3 pb-1"><div className="w-10 h-1 bg-border rounded-full" /></div>
            <div className="overflow-y-auto" style={{ maxHeight: "95dvh" }}>
              <div className="flex flex-col sm:flex-row gap-0">
                <div className="bg-gray-50 p-4 sm:p-6 flex flex-col gap-3 sm:w-80 flex-shrink-0">
                  <div className="relative bg-white rounded-2xl overflow-hidden shadow-sm" style={{ aspectRatio: "4/3" }}>
                    <img src={selectedItem.pictures[selectedSlide]} alt={selectedItem.name} referrerPolicy="no-referrer" className="w-full h-full object-contain p-3 cursor-zoom-in" onClick={() => { setLightboxPhotos(selectedItem.pictures); setLightboxIndex(selectedSlide); setLightboxOpen(true); }} />
                    {selectedItem.pictures.length > 1 && (<>
                      <button onClick={() => setSelectedSlide((s) => (s - 1 + selectedItem.pictures.length) % selectedItem.pictures.length)} className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/90 hover:bg-white rounded-full shadow flex items-center justify-center"><Icon name="ChevronLeft" size={16} className="text-foreground" /></button>
                      <button onClick={() => setSelectedSlide((s) => (s + 1) % selectedItem.pictures.length)} className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/90 hover:bg-white rounded-full shadow flex items-center justify-center"><Icon name="ChevronRight" size={16} className="text-foreground" /></button>
                    </>)}
                  </div>
                  {selectedItem.pictures.length > 1 && (
                    <div className="flex gap-2 overflow-x-auto pb-1">
                      {selectedItem.pictures.map((pic, pi) => (<button key={pi} onClick={() => setSelectedSlide(pi)} className={`flex-shrink-0 w-16 h-16 rounded-xl overflow-hidden border-2 transition-all ${pi === selectedSlide ? "border-primary shadow-md" : "border-transparent opacity-60 hover:opacity-100"}`}><img src={pic} alt="" referrerPolicy="no-referrer" className="w-full h-full object-contain bg-white p-1" /></button>))}
                    </div>
                  )}
                </div>
                <div className="flex-1 p-6 sm:p-8">
                  {selectedItem.brand && (<p className="text-xs font-bold text-primary uppercase tracking-wider mb-2">{selectedItem.brand}</p>)}
                  <h2 className="text-2xl sm:text-3xl font-display font-black text-foreground mb-4 leading-tight">{selectedItem.name}</h2>
                  {selectedItem.price_display && (<p className="text-2xl font-black text-primary mb-6">{selectedItem.price_display}</p>)}
                  {selectedItem.description && (<div className="prose prose-sm max-w-none text-muted-foreground text-base leading-relaxed mb-6 [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5 [&_li]:my-1 [&_p]:my-2 [&_strong]:font-semibold [&_strong]:text-foreground [&_a]:text-primary [&_a]:underline" dangerouslySetInnerHTML={{ __html: selectedItem.description }} />)}
                  {selectedItem.all_params.length > 0 && (
                    <div className="mb-6">
                      <h4 className="font-bold text-sm text-foreground mb-3 uppercase tracking-wider">Характеристики</h4>
                      <div className="space-y-2">
                        {selectedItem.all_params.filter((p) => p.name !== "GUID").map((p, pi) => (<div key={pi} className="flex items-start gap-3 py-2 border-b border-border/50 last:border-0"><span className="text-sm text-muted-foreground min-w-[140px] flex-shrink-0">{p.name}</span><span className="text-sm font-medium text-foreground">{p.value}</span></div>))}
                      </div>
                    </div>
                  )}
                  {selectedItem.video && (<button onClick={() => setVideoUrl(selectedItem.video)} className="w-full mb-3 py-3.5 bg-primary/10 hover:bg-primary/20 text-primary rounded-xl text-base font-semibold transition-all flex items-center justify-center gap-2"><Icon name="Play" size={18} />Смотреть видео</button>)}
                  <div className="flex flex-col sm:flex-row gap-3 mt-3">
                    <button onClick={() => { setInquiryItem(selectedItem); setInquiryName(""); setInquiryPhone(""); setInquirySent(false); closeProductModal(); }} className="flex-1 py-4 bg-primary text-white rounded-xl text-base font-bold hover:bg-primary/90 transition-all shadow-md">Получить консультацию</button>
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
            <h3 className="text-2xl font-display font-black text-foreground mb-1">Получить консультацию</h3>
            <p className="text-sm text-muted-foreground mb-6 leading-relaxed"><span className="font-medium text-foreground">{inquiryItem.name}</span></p>
            <div className="space-y-3">
              <input type="text" placeholder="Ваше имя" value={inquiryName} onChange={(e) => setInquiryName(e.target.value)} className={inputCls} />
              <div>
                <input type="tel" placeholder="+7 (___) ___-__-__" value={inquiryPhone} onChange={(e) => setInquiryPhone(formatPhone(inquiryPhone, e.target.value))} onBlur={() => setInquiryPhoneTouched(true)} className={inquiryPhoneTouched && !isValidPhone(inquiryPhone) ? inputError : inputCls} />
                {inquiryPhoneTouched && !isValidPhone(inquiryPhone) && <p className="text-xs text-red-500 mt-1">Введите номер России, Казахстана или Беларуси</p>}
              </div>
              <ConsentCheckbox checked={inquiryConsent} onChange={setInquiryConsent} />
              <button onClick={() => { if (isValidPhone(inquiryPhone) && inquiryConsent && !sending) { sendLead({ name: inquiryName || "—", phone: inquiryPhone, product: inquiryItem?.name, topic: 'льдогенераторы', formType: 'inquiry' }); setInquiryItem(null); setInquiryName(""); setInquiryPhone(""); setInquiryPhoneTouched(false); setInquiryConsent(false); } }} disabled={!isValidPhone(inquiryPhone) || !inquiryConsent || sending} className="w-full py-4 bg-orange-500 hover:bg-orange-600 text-white rounded-xl font-bold text-lg transition-all shadow-md disabled:opacity-40">{sending ? "Отправляем..." : "Отправить"}</button>
            </div>
          </div>
        </div>
      )}

      <section id="industries" className="py-12 px-6 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className={`text-center mb-14 transition-all duration-1000 ${vis("industries") ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}><h2 className="text-4xl lg:text-5xl font-display font-black tracking-tight text-foreground">Для каких задач нужен льдогенератор</h2></div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[
              { emoji: "🥩", title: "Мясопереработка", problem: "Фарш перегревается при куттеровании", solution: "лёд −6 °C держит температуру, не тупит ножи" },
              { emoji: "🐟", title: "Рыба и морепродукты", problem: "Быстрая порча, потеря вида", solution: "охлаждение от вылова до прилавка, хранение до 28 суток" },
              { emoji: "🥖", title: "Хлебопечение", problem: "Тесто перегревается при замесе", solution: "ледяная вода / лёд для контроля температуры теста" },
              { emoji: "🛒", title: "Торговля, HoReCa", problem: "Невзрачная витрина", solution: "красивая выкладка рыбы и деликатесов на льду, салат-бары" },
              { emoji: "🥦", title: "Сельское хозяйство", problem: "Перегрев урожая", solution: "предварительное охлаждение овощей и фруктов" },
              { emoji: "🏗️", title: "Строительство, фарма", problem: "Нагрев процессов", solution: "охлаждение бетона, технологических процессов, ледяная вода" },
            ].map((item, i) => (
              <div key={i} className={`p-7 bg-background border border-border rounded-2xl hover:border-primary/40 hover:shadow-lg transition-all flex flex-col gap-3 ${vis("industries") ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`} style={{ transitionDelay: `${i * 80}ms`, transitionDuration: "700ms" }}>
                <div className="flex items-center gap-3"><span className="text-3xl leading-none">{item.emoji}</span><h3 className="font-bold text-xl text-foreground">{item.title}</h3></div>
                <div className="flex items-start gap-2 text-sm"><Icon name="AlertCircle" size={18} className="text-red-400 flex-shrink-0 mt-0.5" /><span className="text-muted-foreground">{item.problem}</span></div>
                <div className="flex items-start gap-2 text-sm"><Icon name="CheckCircle" size={18} className="text-primary flex-shrink-0 mt-0.5" /><span className="text-foreground font-medium">{item.solution}</span></div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="segmentation" className="py-12 px-6 bg-gradient-to-br from-primary/5 via-white to-primary/10">
        <div className="max-w-7xl mx-auto">
          <div className={`text-center mb-12 transition-all duration-1000 ${vis("segmentation") ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
            <h2 className="text-4xl lg:text-5xl font-display font-black tracking-tight text-foreground">Как разобраться в линейке</h2>
            <p className="text-lg text-muted-foreground mt-4 max-w-2xl mx-auto">Выберите свой объём производства — подсветим подходящие серии и модели</p>
          </div>

          {(() => {
            const levels = [
              { title: "Малый объём", range: "90 кг/сут", models: ["Л12"], use: "Кафе, малые цеха, рыбные отделы" },
              { title: "Средний", range: "300–720 кг/сут", models: ["Л101", "Л103"], use: "Средние производства" },
              { title: "Крупный", range: "1200–3000 кг/сут", models: ["Л105", "Л110", "WLK 2000"], use: "Крупные производства" },
              { title: "Промышленный", range: "5000–10 000 кг/сут", models: ["ZIEGRA", "Линии Bitzer"], use: "Заводы, комбинаты" },
            ];
            return (
              <div className="mb-16">
                <div className="relative mb-8">
                  <input type="range" min={0} max={3} step={1} value={segLevel} onChange={(e) => setSegLevel(Number(e.target.value))} className="w-full h-2 rounded-full appearance-none cursor-pointer accent-primary bg-primary/15" />
                  <div className="flex justify-between mt-3 text-xs font-semibold text-muted-foreground">
                    {levels.map((l, i) => (<button key={i} onClick={() => setSegLevel(i)} className={`flex-1 text-center transition-colors ${segLevel === i ? "text-primary" : "hover:text-primary"}`}>{l.title}</button>))}
                  </div>
                </div>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  {levels.map((l, i) => (
                    <div key={i} onClick={() => setSegLevel(i)} className={`p-6 rounded-2xl border-2 cursor-pointer transition-all flex flex-col gap-2 ${segLevel === i ? "border-primary bg-white shadow-xl scale-[1.03]" : "border-border bg-white/60 hover:border-primary/40"}`}>
                      <p className={`text-sm font-bold uppercase tracking-wide ${segLevel === i ? "text-primary" : "text-muted-foreground"}`}>{l.title}</p>
                      <p className="text-2xl font-display font-black text-foreground leading-tight">{l.range}</p>
                      <div className="flex flex-wrap gap-1.5 my-1">
                        {l.models.map((m, mi) => (<button key={mi} onClick={(e) => { e.stopPropagation(); openModelModal(m); }} className={`text-xs font-bold px-2.5 py-1 rounded-full transition-all hover:brightness-95 cursor-pointer ${segLevel === i ? "bg-primary text-white" : "bg-primary/10 text-primary hover:bg-primary/20"}`}>{m}</button>))}
                      </div>
                      <p className="text-sm text-muted-foreground">{l.use}</p>
                    </div>
                  ))}
                </div>
              </div>
            );
          })()}

          <div className="max-w-4xl mx-auto">
            <div className="flex justify-center gap-2 mb-8">
              <button onClick={() => setIceTab("flake")} className={`px-6 py-3 rounded-full font-semibold text-sm transition-all ${iceTab === "flake" ? "bg-primary text-white shadow-md" : "bg-white border border-border text-foreground hover:border-primary"}`}>❄️ Чешуйчатый лёд</button>
              <button onClick={() => setIceTab("granular")} className={`px-6 py-3 rounded-full font-semibold text-sm transition-all ${iceTab === "granular" ? "bg-primary text-white shadow-md" : "bg-white border border-border text-foreground hover:border-primary"}`}>🧊 Гранулированный лёд</button>
            </div>
            {iceTab === "flake" ? (
              <div className="bg-white rounded-3xl shadow-lg p-7 sm:p-10">
                <h3 className="text-2xl font-display font-black text-foreground mb-2">Чешуйчатый лёд — серии «Л» и «WLK»</h3>
                <p className="text-muted-foreground mb-6">Для куттеров, охлаждения рыбы и витрин. Тонкие чешуйки 0,6–0,9 мм, температура −6…−9 °C.</p>
                <div className="grid sm:grid-cols-2 gap-4">
                  {[
                    { tag: "Серия «Л»", desc: "Российские чешуйчатые льдогенераторы (Технохолод ГЛЕН): Л12 — 90 кг/сут, Л101 — 300, Л103 — 720, Л105 — 1200, Л110 — 3000 кг/сут." },
                    { tag: "Серия «WLK»", desc: "Чешуйчатый лёд для пищепрома: 2000 кг/сут, безопасное напряжение 24 В, компактные габариты." },
                  ].map((s, i) => (
                    <div key={i} className="p-5 bg-background border border-border rounded-2xl">
                      <span className="inline-block text-xs font-bold text-primary bg-primary/10 px-3 py-1 rounded-full mb-2">{s.tag}</span>
                      <p className="text-sm text-muted-foreground leading-relaxed">{s.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-3xl shadow-lg p-7 sm:p-10">
                <h3 className="text-2xl font-display font-black text-foreground mb-2">Гранулированный лёд — серия «ZIEGRA» и промышленные линии</h3>
                <p className="text-muted-foreground mb-6">Для теплообмена и охлаждения процессов. Премиальная немецкая технология, лёд −0,5 °C, толщина 5–10 мм.</p>
                <div className="grid sm:grid-cols-2 gap-4">
                  {[
                    { tag: "Серия «ZIEGRA»", desc: "Гранулированный (кусковой) лёд, линейка 30–10 000 кг/сут, лёд −0,5 °C, толщина 5–10 мм, патентованная система." },
                    { tag: "Линии Bitzer", desc: "Промышленные линии на базе Bitzer — до 5000–6000 кг/сут для крупных мясо- и рыбопроизводств." },
                  ].map((s, i) => (
                    <div key={i} className="p-5 bg-background border border-border rounded-2xl">
                      <span className="inline-block text-xs font-bold text-primary bg-primary/10 px-3 py-1 rounded-full mb-2">{s.tag}</span>
                      <p className="text-sm text-muted-foreground leading-relaxed">{s.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      <section id="compare" className="py-12 px-6 bg-background">
        <div className="max-w-7xl mx-auto">
          <div className={`text-center mb-16 transition-all duration-1000 ${vis("compare") ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}><h2 className="text-5xl lg:text-6xl font-display font-black tracking-tight text-foreground leading-tight">Хотите подобрать льдогенератор?</h2></div>
          <div className="max-w-md mx-auto"><CompareForm onSent={(name, phone) => sendLead({ name, phone, topic: 'льдогенераторы', formType: 'compare' })} /></div>
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

      <section id="selector" className="py-12 px-6 bg-background">
        <div className="max-w-4xl mx-auto">
          <div className={`text-center mb-16 transition-all duration-1000 ${vis("selector") ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
            <span className="text-xs font-semibold tracking-widest text-primary uppercase">Подбор оборудования</span>
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-display font-black tracking-tight mt-4 text-foreground leading-tight">Подберите льдогенератор за 1 минуту</h2>
            <p className="text-lg text-muted-foreground mt-4">Ответьте на 4 вопроса — пришлём 2–3 подходящие модели с ценами</p>
          </div>
          <QuizBlock onSent={(name, phone, quizAnswers) => sendLead({ name, phone, quizAnswers, topic: 'льдогенераторы', formType: 'quiz' })} />
        </div>
      </section>

      <section id="faq" className="py-12 px-6 bg-background">
        <div className="max-w-4xl mx-auto">
          <div className={`text-center mb-16 transition-all duration-1000 ${vis("faq") ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}><span className="text-xs font-semibold tracking-widest text-primary uppercase">FAQ</span><h2 className="text-5xl lg:text-6xl font-display font-black tracking-tight mt-4 text-foreground leading-tight">Частые вопросы</h2></div>
          <div className="space-y-3 mb-12">
            {[
              { q: "В чём разница между чешуйчатым и гранулированным льдом?", a: "Чешуйчатый (0,6–0,9 мм, −6…−9 °C) идеален для куттеров и охлаждения рыбы — мягкий, не режет продукт, не тупит ножи. Гранулированный (5–10 мм, −0,5 °C) даёт максимальную холодопроизводительность для теплообмена и охлаждения процессов." },
              { q: "Чем отличается моноблок от библока?", a: "В моноблоке агрегат и испаритель в одном корпусе. В библоке компрессорно-конденсаторный агрегат выносится отдельно (даже за пределы цеха) — это экономит площадь и поддерживает температуру в рабочей зоне." },
              { q: "Какая производительность мне нужна?", a: "Зависит от объёмов производства и отрасли. Пройдите квиз или оставьте заявку — рассчитаем под вашу задачу." },
              { q: "Какие сроки поставки?", a: "Часть моделей — в наличии на складе в Новосибирске. Промышленные линии под заказ — 6–7 недель." },
              { q: "Какая гарантия?", a: "До 2 лет, на компрессорные агрегаты — в рамках гарантии заводов Bitzer / L'UNITE HERMETIQUE." },
              { q: "Доставляете в регионы?", a: "Да, по всей России и странам Таможенного союза транспортными компаниями." },
              { q: "Какой хладагент используется?", a: "Безопасные фреоны R507, R404A, R407 — не разрушают озоновый слой, соответствуют техрегламентам ТС." },
              { q: "Сложно ли обслуживать?", a: "Микропроцессорное управление с самодиагностикой, автоподдержание уровня воды, программируемый таймер — оборудование максимально автоматизировано." },
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
            <p className="text-lg text-muted-foreground leading-relaxed mb-8">Собственные офисы продаж, склады, сервисная служба и отлаженная логистика в Москве и Новосибирске позволяют нам оперативно выполнять поставки и поддерживать оборудование на территории России и стран СНГ.</p>
            <div className="border-t border-border/50 pt-7 grid sm:grid-cols-2 gap-5">
              {[{ title: "Комплексные решения", desc: "От подбора оборудования до сервисного обслуживания" },{ title: "Быстрая доставка", desc: "Собственная логистика по всей России и СНГ" },{ title: "Сервисная поддержка", desc: "Гарантийное и постгарантийное обслуживание" },{ title: "Экспертная консультация", desc: "Помощь в выборе оптимального решения" }].map((f, i) => (
                <div key={i} className="flex items-start gap-3"><Icon name="CheckCircle" size={22} className="text-primary flex-shrink-0 mt-0.5" /><div><p className="font-semibold text-foreground">{f.title}</p><p className="text-sm text-muted-foreground">{f.desc}</p></div></div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section id="getkp" className="py-12 px-6 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className={`text-center mb-12 transition-all duration-1000 ${vis("getkp") ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
            <h2 className="text-4xl lg:text-5xl font-display font-black tracking-tight text-foreground leading-tight">Получите коммерческое предложение за 15 минут</h2>
            <p className="text-lg text-muted-foreground mt-4 max-w-2xl mx-auto">Подберём льдогенератор под вашу производительность, рассчитаем стоимость и сроки. Бесплатная консультация инженера.</p>
          </div>
          <div className="grid lg:grid-cols-2 gap-14 items-start">
            <div className={`transition-all duration-1000 ${vis("getkp") ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-8"}`}>
              <div className="bg-gradient-to-br from-primary/5 to-primary/10 border border-primary/20 rounded-3xl shadow-xl p-8 mb-6">
                <h3 className="font-display font-bold text-xl mb-5 text-foreground">Что вы получите:</h3>
                <div className="space-y-4">
                  {[
                    "2–3 подходящие модели с ценами",
                    "Расчёт производительности под вашу задачу",
                    "Условия поставки и гарантии",
                  ].map((t, i) => (
                    <div key={i} className="flex items-start gap-3"><Icon name="CheckCircle" size={22} className="text-primary flex-shrink-0 mt-0.5" /><span className="text-base font-medium text-foreground">{t}</span></div>
                  ))}
                </div>
              </div>
              <div className="p-7 bg-background border border-primary/15 rounded-3xl shadow-sm">
                <p className="font-bold text-base text-foreground mb-1">Перезвоним за 15 минут</p>
                <p className="text-sm text-muted-foreground mb-5">Звоните или пишите в мессенджеры — ответим оперативно</p>
                <div className="space-y-3">
                  {[
                    { icon: "Phone", label: "Телефон", value: "8 800 505-78-31", href: "tel:88005057831", goal: "click_phone" },
                    { icon: "Mail", label: "Почта", value: "massagers@t-sib.ru", href: "mailto:massagers@t-sib.ru", goal: "click_email" },
                  ].map((c, i) => (
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    <a key={i} href={c.href} onClick={() => { try { (window as any).ym?.(107258870, 'reachGoal', c.goal); } catch (_e) { /* noop */ } }} className="flex items-center gap-4 p-4 bg-white border border-primary/10 rounded-xl hover:border-primary/30 transition-colors"><div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0"><Icon name={c.icon} fallback="Star" size={18} className="text-primary" /></div><div><p className="text-xs text-muted-foreground">{c.label}</p><p className="font-bold text-base text-foreground">{c.value}</p></div></a>
                  ))}
                </div>
              </div>
            </div>
            <div id="contacts" className={`transition-all duration-1000 delay-300 ${vis("getkp") ? "opacity-100 translate-x-0" : "opacity-0 translate-x-8"}`}>
              <div className="p-8 bg-background border-2 border-primary/15 rounded-3xl shadow-sm">
                <h3 className="font-display font-bold text-2xl mb-2 text-foreground">Куда отправить КП?</h3>
                <p className="text-muted-foreground mb-6 text-sm">Технолог ответит в течение 2 часов</p>
                <div className="space-y-4">
                  <input type="text" placeholder="Имя *" required value={contactsName} onChange={e => setContactsName(e.target.value)} className={inputCls} />
                  <div><input type="tel" placeholder="+7 (___) ___-__-__" required value={contactsPhone} onChange={e => setContactsPhone(formatPhone(contactsPhone, e.target.value))} onBlur={() => setContactsPhoneTouched(true)} className={contactsPhoneTouched && !isValidPhone(contactsPhone) ? inputError : inputCls} />{contactsPhoneTouched && !isValidPhone(contactsPhone) && <p className="text-xs text-red-500 mt-1">Введите номер России, Казахстана или Беларуси</p>}</div>
                  <input type="email" placeholder="E-mail" value={contactsEmail} onChange={e => setContactsEmail(e.target.value)} className={inputCls} />
                  <textarea placeholder="Комментарий (необязательно): тип льда, объём, задача" rows={3} value={contactsComment} onChange={e => setContactsComment(e.target.value)} className={inputCls + " resize-none"} />
                  <ConsentCheckbox checked={contactsConsent} onChange={setContactsConsent} />
                  <button onClick={() => { if (contactsName.trim() && isValidPhone(contactsPhone) && contactsConsent && !sending) { sendLead({ name: contactsName, phone: contactsPhone, comment: [contactsEmail ? `E-mail: ${contactsEmail}` : "", contactsComment].filter(Boolean).join(". "), topic: 'льдогенераторы', formType: 'contacts' }); setContactsName(""); setContactsPhone(""); setContactsEmail(""); setContactsComment(""); setContactsPhoneTouched(false); setContactsConsent(false); } }} disabled={!contactsName.trim() || !isValidPhone(contactsPhone) || !contactsConsent || sending} className="w-full py-4 bg-orange-500 hover:bg-orange-600 text-white rounded-xl font-bold text-base transition-all shadow-sm disabled:opacity-40">{sending ? "Отправляем..." : "Получить КП"}</button>
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
              <div><h3 className="font-display font-bold text-2xl text-foreground">{modalProduct === "consult" ? "Получить консультацию технолога" : modalProduct ? "Запросить КП" : "Получить КП за 15 минут"}</h3>{modalProduct && modalProduct !== "consult" && (<p className="text-sm text-primary mt-1">{modalProduct}</p>)}</div>
              <button onClick={() => setModalOpen(false)} className="w-10 h-10 flex items-center justify-center rounded-xl bg-background hover:bg-primary/10 transition-colors"><Icon name="X" size={20} className="text-muted-foreground" /></button>
            </div>
            <div className="space-y-4">
              <input type="text" placeholder="Имя *" required value={modalName} onChange={e => setModalName(e.target.value)} className={inputCls} />
              <div><input type="tel" placeholder="+7 (___) ___-__-__" required value={modalPhone} onChange={e => setModalPhone(formatPhone(modalPhone, e.target.value))} onBlur={() => setModalPhoneTouched(true)} className={modalPhoneTouched && !isValidPhone(modalPhone) ? inputError : inputCls} />{modalPhoneTouched && !isValidPhone(modalPhone) && <p className="text-xs text-red-500 mt-1">Введите номер России, Казахстана или Беларуси</p>}</div>
              <ConsentCheckbox checked={modalConsent} onChange={setModalConsent} />
              <button onClick={() => { if (modalName.trim() && isValidPhone(modalPhone) && modalConsent && !sending) { sendLead({ name: modalName, phone: modalPhone, product: modalProduct, topic: 'льдогенераторы', formType: 'modal' }); setModalOpen(false); setModalName(""); setModalPhone(""); setModalPhoneTouched(false); setModalConsent(false); } }} disabled={!modalName.trim() || !isValidPhone(modalPhone) || !modalConsent || sending} className="w-full py-4 bg-orange-500 hover:bg-orange-600 text-white rounded-xl font-bold text-lg transition-all shadow-md disabled:opacity-40">{sending ? "Отправляем..." : "Отправить"}</button>
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
                <a href="tel:88005057831" onClick={() => { try { (window as any).ym?.(107258870, 'reachGoal', 'click_phone'); } catch (_e) { /* noop */ } }} className="flex items-center gap-2 text-sm text-foreground hover:text-primary transition-colors"><Icon name="Phone" size={14} className="text-primary" />8 800 505-78-31</a>
                {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                <a href="mailto:massagers@t-sib.ru" onClick={() => { try { (window as any).ym?.(107258870, 'reachGoal', 'click_email'); } catch (_e) { /* noop */ } }} className="flex items-center gap-2 text-sm text-foreground hover:text-primary transition-colors"><Icon name="Mail" size={14} className="text-primary" />massagers@t-sib.ru</a>
              </div>
            </div>
            <div>
              <p className="font-semibold text-sm text-foreground mb-3">Оборудование</p>
              <div className="space-y-2">
                <a href="/" className="block text-sm text-muted-foreground hover:text-primary transition-colors">Вакуумные массажеры</a>
                <a href="/injector" className="block text-sm text-muted-foreground hover:text-primary transition-colors">Инъекторы</a>
                <a href="/slicers" className="block text-sm text-muted-foreground hover:text-primary transition-colors">Слайсеры</a>
                <a href="#catalog" className="block text-sm text-muted-foreground hover:text-primary transition-colors">Каталог льдогенераторов</a>
              </div>
            </div>
            <div>
              <p className="font-semibold text-sm text-foreground mb-3">Компания</p>
              <div className="space-y-2">
                {["#benefits", "#segmentation", "#industries", "#technosib", "#faq"].map((href, i) => (<a key={i} href={href} className="block text-sm text-muted-foreground hover:text-primary transition-colors">{["Преимущества", "Линейка моделей", "Отрасли", "О компании Техно-Сиб", "Вопросы"][i]}</a>))}
              </div>
            </div>
            <div>
              <p className="font-semibold text-sm text-foreground mb-3">Подбор</p>
              <div className="space-y-2">
                {[["#selector", "Подобрать льдогенератор"], ["#contacts", "Контакты"], ["#contacts", "Запросить КП"]].map(([href, label], i) => (<a key={i} href={href} className="block text-sm text-muted-foreground hover:text-primary transition-colors">{label}</a>))}
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

      <QuizSideTrigger storageKey="quiz_auto_ldogenerator">
        {(close) => (
          <QuizBlock onSent={(name, phone, quizAnswers) => { sendLead({ name, phone, quizAnswers, topic: 'льдогенераторы', formType: 'quiz' }); close(); }} />
        )}
      </QuizSideTrigger>
      <ThankYouModal open={thankYouOpen} onClose={() => setThankYouOpen(false)} />
    </div>
  );
};

export default LDOGenerator;