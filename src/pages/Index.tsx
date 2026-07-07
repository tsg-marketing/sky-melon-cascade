import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import Icon from "@/components/ui/icon";
import ThankYouModal from "@/components/ThankYouModal";
import { useLeadForm } from "@/hooks/useLeadForm";
import { useCart } from "@/hooks/useCart";

const HOME_CATALOG_URL = "https://functions.poehali.dev/19e6f517-e766-4ac9-b359-029df68cf0fa";
const HERO_IMG = "https://cdn.poehali.dev/projects/63874bed-e293-4b07-975b-a3b344891b91/files/48e646fe-cdd9-4e60-9c2a-fc7daabf0e5d.jpg";

const inputCls = "w-full px-4 py-3 bg-background border border-border rounded-xl text-foreground placeholder-muted-foreground text-sm focus:outline-none focus:border-primary transition-colors";
const inputError = "w-full px-4 py-3 bg-background border border-red-400 rounded-xl text-foreground placeholder-muted-foreground text-sm focus:outline-none focus:border-red-500 transition-colors";

interface FeedItem {
  id: string;
  name: string;
  price: number | null;
  price_display: string | null;
  picture: string | null;
  vendor: string | null;
  url: string | null;
}
interface FeedGroup {
  subcategory_id: string;
  subcategory: string;
  parent_id: string;
  parent: string;
  items: FeedItem[];
}

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

const HERO_BULLETS = [
  "21 категория, более 1000 моделей оборудования",
  "Оборудование по ценам заводов-изготовителей от ведущих Европейских, Азиатских и Российских производителей",
  "Оборудование на любые производства — от ресторанов до крупных мясо- и рыбокомбинатов",
  "Доставка и пусконаладка по всей России",
];

const Index = () => {
  const navigate = useNavigate();
  const { sendLead, sending, thankYouOpen, setThankYouOpen } = useLeadForm();
  const { totalCount } = useCart();

  const [menuOpen, setMenuOpen] = useState(false);
  const [equipMenuOpen, setEquipMenuOpen] = useState(false);

  // Catalog feed
  const [groups, setGroups] = useState<FeedGroup[]>([]);
  const [catalogLoading, setCatalogLoading] = useState(true);

  // Modal ФОС
  const [modalOpen, setModalOpen] = useState(false);
  const [modalTitle, setModalTitle] = useState("Получить предложение");
  const [modalProduct, setModalProduct] = useState("");
  const [modalName, setModalName] = useState("");
  const [modalPhone, setModalPhone] = useState("");
  const [modalPhoneTouched, setModalPhoneTouched] = useState(false);
  const [modalConsent, setModalConsent] = useState(false);

  // Contacts
  const [contactsName, setContactsName] = useState("");
  const [contactsPhone, setContactsPhone] = useState("");
  const [contactsComment, setContactsComment] = useState("");
  const [contactsPhoneTouched, setContactsPhoneTouched] = useState(false);
  const [contactsConsent, setContactsConsent] = useState(false);

  useEffect(() => {
    document.title = "Оборудование для мясо- и рыбопереработки — купить | Техносиб";
    const setMeta = (name: string, content: string, property?: boolean) => {
      const attr = property ? "property" : "name";
      let el = document.querySelector(`meta[${attr}="${name}"]`);
      if (!el) { el = document.createElement("meta"); el.setAttribute(attr, name); document.head.appendChild(el); }
      el.setAttribute("content", content);
    };
    setMeta("description", "Оборудование для мясо- и рыбопереработки: более 1000 моделей от ведущих европейских, азиатских и российских производителей по ценам заводов. Доставка и пусконаладка по всей России.");
  }, []);

  useEffect(() => {
    setCatalogLoading(true);
    fetch(HOME_CATALOG_URL)
      .then((r) => r.json())
      .then((d) => { setGroups(d.groups || []); })
      .catch(() => setGroups([]))
      .finally(() => setCatalogLoading(false));
  }, []);

  const openModal = (title: string, product = "") => {
    setModalTitle(title); setModalProduct(product); setModalOpen(true);
  };

  const submitModal = () => {
    if (modalName.trim() && isValidPhone(modalPhone) && modalConsent && !sending) {
      sendLead({ name: modalName, phone: modalPhone, product: modalProduct, formType: "modal" });
      setModalOpen(false); setModalName(""); setModalPhone(""); setModalPhoneTouched(false); setModalConsent(false);
    }
  };

  const submitContacts = () => {
    if (contactsName.trim() && isValidPhone(contactsPhone) && contactsConsent && !sending) {
      sendLead({ name: contactsName, phone: contactsPhone, comment: contactsComment, formType: "contacts" });
      setContactsName(""); setContactsPhone(""); setContactsComment(""); setContactsPhoneTouched(false); setContactsConsent(false);
    }
  };

  const navLinks = [
    { href: "#catalog", label: "Каталог" },
    { href: "#technosib", label: "О компании" },
    { href: "#advantages", label: "Преимущества" },
    { href: "#contacts", label: "Контакты" },
  ];
  const equipmentLinks = [
    { href: "/massagers", label: "Массажёры мяса" },
    { href: "/injector", label: "Инъекторы" },
    { href: "/slicers", label: "Слайсеры" },
    { href: "/ldogenerator", label: "Льдогенераторы" },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* HEADER */}
      <header className="fixed top-0 w-full bg-white/90 backdrop-blur-xl border-b border-border z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3">
          <div className="flex items-center gap-3 sm:gap-6">
            <div className="flex items-center gap-3 sm:gap-6 flex-shrink-0 min-w-0">
              <a href="/" className="flex flex-col min-w-0">
                <img src="https://cdn.poehali.dev/files/b643e2cd-1c2b-461b-b32b-4053b1b9e72b.jpg" alt="Техносиб" className="h-8 sm:h-9 w-auto object-contain" />
                <span className="text-xs text-muted-foreground leading-tight mt-0.5 hidden sm:block">Оборудование для мясо- и рыбопереработки</span>
              </a>
              <nav className="hidden lg:flex gap-6 text-sm font-semibold items-center">
                <div className="relative" onMouseEnter={() => setEquipMenuOpen(true)} onMouseLeave={() => setEquipMenuOpen(false)}>
                  <button className="flex items-center gap-1 text-foreground hover:text-primary transition-colors whitespace-nowrap">
                    Оборудование
                    <Icon name="ChevronDown" size={14} className={`transition-transform ${equipMenuOpen ? "rotate-180" : ""}`} />
                  </button>
                  {equipMenuOpen && (
                    <div className="absolute top-full left-0 pt-2 z-50">
                      <div className="bg-white border border-border rounded-xl shadow-lg py-2 min-w-[220px]">
                        {equipmentLinks.map((l) => (
                          <a key={l.href} href={l.href} className="block px-4 py-2.5 text-sm text-foreground hover:text-primary hover:bg-primary/5 transition-colors" onClick={() => setEquipMenuOpen(false)}>{l.label}</a>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                {navLinks.map((l) => (
                  <a key={l.href} href={l.href} className="text-foreground hover:text-primary transition-colors whitespace-nowrap">{l.label}</a>
                ))}
              </nav>
            </div>

            <div className="flex items-center gap-2 sm:gap-3 ml-auto flex-shrink-0">
              <a href="tel:88005059124" className="hidden sm:flex items-center gap-1.5 text-sm font-bold text-foreground hover:text-primary transition-colors whitespace-nowrap">
                <Icon name="Phone" size={14} className="text-primary" />
                8 800 505-91-24
              </a>
              <button onClick={() => navigate("/cart")} className="relative flex items-center justify-center w-10 h-10 sm:w-auto sm:h-auto sm:px-4 sm:py-2 sm:gap-2 border-2 border-primary/30 text-primary rounded-full text-sm font-semibold hover:border-primary hover:bg-primary/5 transition-all">
                <Icon name="ShoppingCart" size={16} />
                <span className="hidden sm:inline">Корзина</span>
                {totalCount > 0 && (
                  <span className="absolute -top-2 -right-2 w-5 h-5 bg-primary text-white text-xs font-bold rounded-full flex items-center justify-center">{totalCount}</span>
                )}
              </button>
              <button onClick={() => openModal("Получить предложение")} className="hidden sm:block px-5 py-2 text-sm font-semibold bg-primary text-white rounded-full hover:bg-primary/90 transition-all shadow-sm whitespace-nowrap">Получить КП</button>
              <button className="lg:hidden p-2 text-muted-foreground flex-shrink-0" onClick={() => setMenuOpen(!menuOpen)}>
                <Icon name={menuOpen ? "X" : "Menu"} size={22} />
              </button>
            </div>
          </div>
          <div className="sm:hidden mt-1.5">
            <a href="tel:88005059124" className="flex items-center gap-1 text-sm font-bold text-primary hover:text-primary/80 transition-colors">
              <Icon name="Phone" size={14} className="flex-shrink-0" />
              8 800 505-91-24
            </a>
          </div>
        </div>
        {menuOpen && (
          <div className="lg:hidden border-t border-border bg-white px-6 py-4 flex flex-col gap-4">
            <div className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Оборудование</div>
            {equipmentLinks.map((l) => (
              <a key={l.href} href={l.href} className="text-sm text-foreground hover:text-primary transition-colors pl-3 border-l-2 border-primary/20" onClick={() => setMenuOpen(false)}>{l.label}</a>
            ))}
            <div className="h-px bg-border" />
            {navLinks.map((l) => (
              <a key={l.href} href={l.href} className="text-sm text-muted-foreground hover:text-primary transition-colors" onClick={() => setMenuOpen(false)}>{l.label}</a>
            ))}
          </div>
        )}
      </header>

      {/* HERO / БАННЕР */}
      <section id="hero" className="relative pt-28 sm:pt-32 pb-14 px-4 sm:px-6 bg-gradient-to-br from-primary/5 via-background to-background">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-10 lg:gap-14 items-center">
          <div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-display font-black tracking-tight text-foreground leading-tight mb-8">
              Оборудование для мясо- и рыбопереработки
            </h1>
            <ul className="space-y-4 mb-9">
              {HERO_BULLETS.map((b, i) => (
                <li key={i} className="flex items-start gap-3">
                  <Icon name="CheckCircle2" fallback="Check" size={24} className="text-primary flex-shrink-0 mt-0.5" />
                  <span className="text-base sm:text-lg text-muted-foreground leading-snug">{b}</span>
                </li>
              ))}
            </ul>
            <div className="flex flex-col sm:flex-row gap-4">
              <button onClick={() => openModal("Получить предложение")} className="px-8 py-4 bg-primary text-white rounded-full font-bold text-lg hover:bg-primary/90 transition-all shadow-lg shadow-primary/20">
                Получить КП
              </button>
              <a href="#catalog" className="px-8 py-4 border-2 border-primary/30 text-primary rounded-full font-semibold text-lg hover:border-primary hover:bg-primary/5 transition-all text-center">
                Смотреть каталог
              </a>
            </div>
          </div>
          <div className="relative">
            <div className="rounded-3xl overflow-hidden shadow-2xl border border-border bg-white">
              <img src={HERO_IMG} alt="Оборудование для мясо- и рыбопереработки" className="w-full h-full object-cover aspect-[4/3]" />
            </div>
          </div>
        </div>
      </section>

      {/* КАТАЛОГ */}
      <section id="catalog" className="py-14 px-4 sm:px-6 bg-white">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-display font-black text-foreground mb-3">
            Каталог оборудования мясо- и рыбопереработки
          </h2>
          <p className="text-muted-foreground text-lg mb-10">Актуальные позиции и цены из нашего каталога</p>

          {catalogLoading && (
            <div className="text-center py-20 text-muted-foreground">
              <Icon name="Loader" size={40} className="mx-auto mb-4 animate-spin opacity-40" />
              <p>Загружаем каталог...</p>
            </div>
          )}

          {!catalogLoading && groups.map((g) => (
            <CatalogSlider key={g.subcategory_id} group={g} onInquiry={(name) => openModal("Получить предложение", name)} />
          ))}

          <div className="text-center mt-4">
            <button onClick={() => openModal("Получить весь ассортимент", "Весь ассортимент оборудования")} className="px-8 py-4 bg-primary text-white rounded-full font-bold text-lg hover:bg-primary/90 transition-all shadow-lg shadow-primary/20">
              Получить весь ассортимент
            </button>
          </div>
        </div>
      </section>

      {/* О КОМПАНИИ ТЕХНОСИБ */}
      <section id="technosib" className="py-12 px-6 bg-gradient-to-b from-background to-white">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl lg:text-5xl font-display font-black text-center mb-10 text-foreground">О компании ТЕХНОСИБ</h2>
          <div className="grid sm:grid-cols-3 gap-5 mb-8">
            {[
              { icon: "Calendar", title: "25 лет на рынке", desc: "Опыт работы с 2001 года" },
              { icon: "MapPin", title: "2 города", desc: "Офисы в Москве и Новосибирске" },
              { icon: "Globe", title: "Проверенные партнёры", desc: "Из Европы, России и Китая" },
            ].map((s, i) => (
              <div key={i} className="bg-white rounded-2xl shadow-md p-6 text-center hover:shadow-lg transition-shadow">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Icon name={s.icon} fallback="Star" size={30} className="text-primary" />
                </div>
                <h3 className="font-bold text-lg text-foreground mb-1">{s.title}</h3>
                <p className="text-muted-foreground text-sm">{s.desc}</p>
              </div>
            ))}
          </div>
          <div className="bg-white rounded-2xl shadow-lg p-7 sm:p-10">
            <p className="text-lg text-muted-foreground leading-relaxed mb-5">
              Компания <strong className="text-foreground">«Техно-Сиб»</strong> — надёжный поставщик и партнёр в сфере профессионального пищевого и фасовочно-упаковочного оборудования. Мы работаем с 2001 года и уже 25 лет помогаем предприятиям эффективно оснащать производства, предоставляем сервисное обслуживание, а также реализуем упаковочные и расходные материалы.
            </p>
            <div className="border-l-4 border-primary bg-primary/5 rounded-r-xl px-5 py-4 mb-5">
              <p className="font-medium text-foreground">Мы сотрудничаем с ведущими заводами-производителями Европы, России и Китая, подбирая решения под задачи и бюджет клиента.</p>
            </div>
            <p className="text-lg text-muted-foreground leading-relaxed mb-5">
              Собственные офисы продаж, склады, сервисная служба и отлаженная логистика в Москве и Новосибирске позволяют нам оперативно выполнять поставки и поддерживать оборудование на территории России и стран СНГ.
            </p>
            <p className="text-lg text-muted-foreground leading-relaxed mb-8">
              Экспертиза наших специалистов помогает решать задачи любого уровня сложности — от подбора единичной позиции до комплексного оснащения. <strong className="text-foreground">«Техно-Сиб»</strong> всегда предложит оптимальное решение для вашего бизнеса и обеспечит надёжную поддержку на всех этапах работы.
            </p>
            <div className="border-t border-border/50 pt-7 grid sm:grid-cols-2 gap-5">
              {[
                { title: "Комплексные решения", desc: "От подбора оборудования до сервисного обслуживания" },
                { title: "Быстрая доставка", desc: "Собственная логистика по всей России и СНГ" },
                { title: "Сервисная поддержка", desc: "Гарантийное и постгарантийное обслуживание" },
                { title: "Экспертная консультация", desc: "Помощь в выборе оптимального решения" },
              ].map((f, i) => (
                <div key={i} className="flex items-start gap-3">
                  <Icon name="CheckCircle" size={22} className="text-primary flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-foreground">{f.title}</p>
                    <p className="text-sm text-muted-foreground">{f.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ПРЕИМУЩЕСТВА / СЕРВИС / ДОСТАВКА — заглушка */}
      <section id="advantages" className="py-14 px-6 bg-white">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-display font-black text-center mb-3 text-foreground">Наши преимущества, сервис и доставка</h2>
          <p className="text-center text-muted-foreground text-lg mb-10">Раздел в разработке — скоро здесь появится подробная информация</p>
          <div className="grid sm:grid-cols-3 gap-5">
            {[
              { icon: "Award", title: "Наши преимущества", desc: "Скоро здесь появится описание" },
              { icon: "Wrench", title: "Сервис", desc: "Скоро здесь появится описание" },
              { icon: "Truck", title: "Доставка", desc: "Скоро здесь появится описание" },
            ].map((s, i) => (
              <div key={i} className="bg-background border border-border rounded-2xl p-8 text-center opacity-80">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Icon name={s.icon} fallback="Star" size={30} className="text-primary" />
                </div>
                <h3 className="font-bold text-lg text-foreground mb-1">{s.title}</h3>
                <p className="text-muted-foreground text-sm">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ОБСУДИМ ВАШУ ЗАДАЧУ */}
      <section id="contacts" className="py-12 px-6 bg-gradient-to-b from-white to-background">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-4xl lg:text-5xl font-display font-black tracking-tight text-foreground leading-tight">Обсудим вашу задачу</h2>
          </div>
          <div className="grid lg:grid-cols-2 gap-14 items-start">
            <div>
              <div className="flex justify-center mb-10">
                <div className="p-8 bg-gradient-to-br from-primary/5 to-primary/10 border border-primary/20 rounded-3xl shadow-xl w-full max-w-sm">
                  <div className="flex justify-center mb-6">
                    <div className="w-28 h-28 bg-primary/10 rounded-2xl flex items-center justify-center">
                      <Icon name="Factory" size={56} className="text-primary" />
                    </div>
                  </div>
                  <p className="text-center text-sm font-medium text-muted-foreground mb-6">Оборудование для мясо- и рыбопереработки</p>
                  <div className="space-y-4">
                    {[
                      { icon: "Phone", label: "Телефон", value: "8 800 505-91-24", href: "tel:88005059124" },
                      { icon: "Mail", label: "Почта", value: "massagers@t-sib.ru", href: "mailto:massagers@t-sib.ru" },
                    ].map((c, i) => (
                      <a key={i} href={c.href} className="flex items-center gap-4 p-4 bg-white border border-primary/10 rounded-xl hover:border-primary/30 transition-colors">
                        <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                          <Icon name={c.icon} fallback="Star" size={18} className="text-primary" />
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">{c.label}</p>
                          <p className="font-bold text-base text-foreground">{c.value}</p>
                        </div>
                      </a>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            <div>
              <div className="p-8 bg-background border-2 border-primary/15 rounded-3xl shadow-sm">
                <h3 className="font-display font-bold text-2xl mb-2 text-foreground">Отправить вопрос</h3>
                <p className="text-muted-foreground mb-6 text-sm">Технолог ответит в течение 2 часов</p>
                <div className="space-y-4">
                  <input type="text" placeholder="Имя *" required value={contactsName} onChange={e => setContactsName(e.target.value)} className={inputCls} />
                  <div>
                    <input type="tel" placeholder="+7 (___) ___-__-__" required value={contactsPhone} onChange={e => setContactsPhone(formatPhone(contactsPhone, e.target.value))} onBlur={() => setContactsPhoneTouched(true)} className={contactsPhoneTouched && !isValidPhone(contactsPhone) ? inputError : inputCls} />
                    {contactsPhoneTouched && !isValidPhone(contactsPhone) && <p className="text-xs text-red-500 mt-1">Введите номер России, Казахстана или Беларуси</p>}
                  </div>
                  <textarea placeholder="Комментарий (продукт, объём, задача)" rows={4} value={contactsComment} onChange={e => setContactsComment(e.target.value)} className={inputCls + " resize-none"} />
                  <ConsentCheckbox checked={contactsConsent} onChange={setContactsConsent} />
                  <button onClick={submitContacts} disabled={!contactsName.trim() || !isValidPhone(contactsPhone) || !contactsConsent || sending} style={{ backgroundColor: "#D98E5C" }} className="w-full py-4 text-white rounded-xl font-bold text-base hover:brightness-95 transition-all shadow-sm disabled:opacity-40">
                    {sending ? "Отправляем..." : "Отправить"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* МОДАЛ ФОС */}
      {modalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm" onClick={() => setModalOpen(false)}>
          <div className="bg-white rounded-3xl shadow-2xl p-8 w-full max-w-md" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="font-display font-bold text-2xl text-foreground">{modalTitle}</h3>
                {modalProduct && <p className="text-sm text-primary mt-1">{modalProduct}</p>}
              </div>
              <button onClick={() => setModalOpen(false)} className="w-10 h-10 flex items-center justify-center rounded-xl bg-background hover:bg-primary/10 transition-colors">
                <Icon name="X" size={20} className="text-muted-foreground" />
              </button>
            </div>
            <div className="space-y-4">
              <input type="text" placeholder="Имя *" required value={modalName} onChange={e => setModalName(e.target.value)} className={inputCls} />
              <div>
                <input type="tel" placeholder="+7 (___) ___-__-__" required value={modalPhone} onChange={e => setModalPhone(formatPhone(modalPhone, e.target.value))} onBlur={() => setModalPhoneTouched(true)} className={modalPhoneTouched && !isValidPhone(modalPhone) ? inputError : inputCls} />
                {modalPhoneTouched && !isValidPhone(modalPhone) && <p className="text-xs text-red-500 mt-1">Введите номер России, Казахстана или Беларуси</p>}
              </div>
              <ConsentCheckbox checked={modalConsent} onChange={setModalConsent} />
              <button onClick={submitModal} disabled={!modalName.trim() || !isValidPhone(modalPhone) || !modalConsent || sending} style={{ backgroundColor: "#D98E5C" }} className="w-full py-4 text-white rounded-xl font-bold text-base hover:brightness-95 transition-all shadow-sm disabled:opacity-40">
                {sending ? "Отправляем..." : "Отправить"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ФУТЕР */}
      <footer className="border-t border-border py-12 px-6 bg-background">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-10">
            <div className="md:col-span-1">
              <img src="https://cdn.poehali.dev/files/b643e2cd-1c2b-461b-b32b-4053b1b9e72b.jpg" alt="Техносиб" className="h-8 w-auto object-contain mb-2" />
              <p className="text-xs text-muted-foreground mb-4">Оборудование для мясо- и рыбопереработки</p>
              <div className="space-y-2">
                <a href="tel:88005059124" className="flex items-center gap-2 text-sm text-foreground hover:text-primary transition-colors">
                  <Icon name="Phone" size={14} className="text-primary" />8 800 505-91-24
                </a>
                <a href="mailto:massagers@t-sib.ru" className="flex items-center gap-2 text-sm text-foreground hover:text-primary transition-colors">
                  <Icon name="Mail" size={14} className="text-primary" />massagers@t-sib.ru
                </a>
              </div>
            </div>
            <div>
              <p className="font-semibold text-sm text-foreground mb-3">Оборудование</p>
              <div className="space-y-2">
                {equipmentLinks.map((l) => (
                  <a key={l.href} href={l.href} className="block text-sm text-muted-foreground hover:text-primary transition-colors">{l.label}</a>
                ))}
              </div>
            </div>
            <div>
              <p className="font-semibold text-sm text-foreground mb-3">Компания</p>
              <div className="space-y-2">
                <a href="#catalog" className="block text-sm text-muted-foreground hover:text-primary transition-colors">Каталог</a>
                <a href="#technosib" className="block text-sm text-muted-foreground hover:text-primary transition-colors">О компании</a>
                <a href="#advantages" className="block text-sm text-muted-foreground hover:text-primary transition-colors">Преимущества</a>
                <a href="#contacts" className="block text-sm text-muted-foreground hover:text-primary transition-colors">Контакты</a>
              </div>
            </div>
            <div>
              <p className="font-semibold text-sm text-foreground mb-3">Заявка</p>
              <div className="mt-1">
                <button onClick={() => openModal("Получить предложение")} className="inline-block px-5 py-2.5 bg-primary text-white text-sm font-semibold rounded-full hover:bg-primary/90 transition-all shadow-sm">Получить КП</button>
              </div>
            </div>
          </div>
          <div className="border-t border-border pt-6 flex flex-col md:flex-row items-center justify-end gap-6 text-xs text-muted-foreground">
            <a href="https://t-sib.ru/assets/politika_t-sib16.05.25.pdf" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">Политика обработки данных</a>
            <a href="https://t-sib.ru/assets/soglasie_t-sib16.05.25.pdf" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">Согласие на обработку</a>
          </div>
        </div>
      </footer>

      <ThankYouModal open={thankYouOpen} onClose={() => setThankYouOpen(false)} />
    </div>
  );
};

const CatalogSlider = ({ group, onInquiry }: { group: FeedGroup; onInquiry: (product: string) => void }) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const scrollBy = (dir: number) => {
    if (scrollRef.current) scrollRef.current.scrollBy({ left: dir * 320, behavior: "smooth" });
  };
  if (!group.items.length) return null;
  return (
    <div className="mb-12">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h3 className="text-xl sm:text-2xl font-display font-black text-foreground">{group.subcategory}</h3>
          <p className="text-sm text-muted-foreground">{group.parent}</p>
        </div>
        <div className="hidden sm:flex gap-2">
          <button onClick={() => scrollBy(-1)} className="w-10 h-10 rounded-full border border-border bg-white hover:border-primary hover:text-primary flex items-center justify-center transition-colors">
            <Icon name="ChevronLeft" size={18} />
          </button>
          <button onClick={() => scrollBy(1)} className="w-10 h-10 rounded-full border border-border bg-white hover:border-primary hover:text-primary flex items-center justify-center transition-colors">
            <Icon name="ChevronRight" size={18} />
          </button>
        </div>
      </div>
      <div ref={scrollRef} className="flex gap-5 overflow-x-auto pb-3 snap-x scroll-smooth [scrollbar-width:thin]">
        {group.items.map((it) => (
          <div key={it.id} className="flex-shrink-0 w-[280px] snap-start bg-white border border-border rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-shadow flex flex-col">
            <div className="bg-gray-50 aspect-square flex items-center justify-center p-4">
              {it.picture ? (
                <img src={it.picture} alt={it.name} referrerPolicy="no-referrer" className="w-full h-full object-contain" />
              ) : (
                <Icon name="ImageOff" size={40} className="text-muted-foreground opacity-30" />
              )}
            </div>
            <div className="p-4 flex flex-col flex-1">
              <h4 className="font-bold text-base text-foreground leading-snug mb-2 line-clamp-2 min-h-[2.6em]">{it.name}</h4>
              <div className="mt-auto">
                {it.price_display ? (
                  <p className="text-xl font-display font-black text-primary mb-3">{it.price_display}</p>
                ) : (
                  <p className="text-base font-semibold text-muted-foreground mb-3">Цена по запросу</p>
                )}
                <div className="flex flex-col gap-2">
                  {it.url && (
                    <a href={it.url} target="_blank" rel="noopener noreferrer" className="w-full py-2.5 border-2 border-primary/30 text-primary rounded-xl text-sm font-semibold hover:border-primary hover:bg-primary/5 transition-all text-center">Подробнее</a>
                  )}
                  <button onClick={() => onInquiry(it.name)} style={{ backgroundColor: "#D98E5C" }} className="w-full py-2.5 text-white rounded-xl text-sm font-semibold hover:brightness-95 transition-all">Получить предложение</button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Index;