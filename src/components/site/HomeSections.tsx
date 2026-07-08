import { useState, type ReactNode } from "react";
import Icon from "@/components/ui/icon";
import ThankYouModal from "@/components/ThankYouModal";
import { useLeadForm } from "@/hooks/useLeadForm";

const inputCls = "w-full px-4 py-3 bg-background border border-border rounded-xl text-foreground placeholder-muted-foreground text-sm focus:outline-none focus:border-primary transition-colors";
const inputError = "w-full px-4 py-3 bg-background border border-red-400 rounded-xl text-foreground placeholder-muted-foreground text-sm focus:outline-none focus:border-red-500 transition-colors";

function isValidPhone(v: string): boolean {
  const digits = v.replace(/\D/g, "");
  if (/^[78]\d{10}$/.test(digits)) return true;
  if (/^375\d{9}$/.test(digits)) return true;
  return false;
}
function formatPhone(_prev: string, next: string): string {
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

/**
 * Общие информационные секции сайта: О компании, Преимущества, Сервис, Доставка, Обсудим задачу.
 * Форма "Обсудим задачу" использует единый механизм useLeadForm (formType: 'contacts').
 * topic — тема раздела (для лендингов категорий), попадает в заявку.
 */
export default function HomeSections({ topic, afterDelivery }: { topic?: string; afterDelivery?: ReactNode }) {
  const { sendLead, sending, thankYouOpen, setThankYouOpen } = useLeadForm();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [comment, setComment] = useState("");
  const [phoneTouched, setPhoneTouched] = useState(false);
  const [consent, setConsent] = useState(false);

  const submit = () => {
    if (name.trim() && isValidPhone(phone) && consent && !sending) {
      sendLead({ name, phone, comment, topic, formType: "contacts" });
      setName(""); setPhone(""); setComment(""); setPhoneTouched(false); setConsent(false);
    }
  };

  return (
    <>
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

      {/* НАШИ ПРЕИМУЩЕСТВА */}
      <section id="advantages" className="py-16 px-4 sm:px-6 bg-background">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl lg:text-5xl font-display font-black text-foreground mb-3">Наши преимущества</h2>
            <p className="text-muted-foreground text-lg">Почему заказчики работают с нами годами</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: "Globe", title: "Прямые контракты с производителями", desc: "Без посредников — выгодные цены и оригинальные запчасти" },
              { icon: "Truck", title: "Склад запчастей в РФ", desc: "Базовые комплектующие — на складе, отгрузка в день заказа" },
              { icon: "SlidersHorizontal", title: "Монтаж и пусконаладка", desc: "Свои инженеры запускают линию в вашем цехе" },
              { icon: "GraduationCap", title: "Обучение персонала", desc: "Готовим операторов к самостоятельной работе на оборудовании" },
              { icon: "ShieldCheck", title: "Гарантия 12 месяцев", desc: "Расширенная гарантия и сервисное обслуживание" },
              { icon: "FileText", title: "Документы для сетей", desc: "Сертификаты, декларации, маркировка под требования ритейлеров" },
            ].map((s, i) => (
              <div key={i} className="bg-white rounded-2xl shadow-sm hover:shadow-lg transition-shadow p-7">
                <div className="w-12 h-12 rounded-xl bg-orange-100 flex items-center justify-center mb-5">
                  <Icon name={s.icon} fallback="Star" size={24} className="text-orange-500" />
                </div>
                <h3 className="font-bold text-lg text-foreground mb-2 leading-snug">{s.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* СЕРВИС И ПОДДЕРЖКА */}
      <section id="service" className="py-16 px-4 sm:px-6 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl lg:text-5xl font-display font-black text-foreground">Сервис и поддержка</h2>
          </div>
          <div className="grid sm:grid-cols-3 gap-6">
            {[
              { icon: "Truck", title: "Доставка и монтаж", desc: "Доставляем по всей России. Монтаж и пусконаладка выполняются нашими специалистами" },
              { icon: "GraduationCap", title: "Обучение персонала", desc: "Проводим инструктаж и обучение ваших сотрудников работе с оборудованием" },
              { icon: "Wrench", title: "Гарантийное обслуживание", desc: "12 месяцев гарантии. Быстрое реагирование на заявки и наличие запчастей на складе" },
            ].map((s, i) => (
              <div key={i} className="bg-background rounded-2xl shadow-sm p-8 text-center">
                <div className="w-16 h-16 rounded-full bg-sky-100 flex items-center justify-center mx-auto mb-5">
                  <Icon name={s.icon} fallback="Star" size={30} className="text-sky-500" />
                </div>
                <h3 className="font-bold text-lg text-foreground mb-2">{s.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ДОСТАВКА ТОВАРА */}
      <section id="delivery" className="py-16 px-4 sm:px-6 bg-background">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl lg:text-5xl font-display font-black text-foreground mb-3">Доставка товара</h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Доставка в пределах г. Новосибирск и г. Москва — <strong className="text-orange-500">бесплатно</strong>. Выгрузка товара осуществляется силами Покупателя.
            </p>
          </div>
          <div className="grid lg:grid-cols-2 gap-6">
            <div className="bg-orange-50 border border-orange-100 rounded-2xl p-8">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-11 h-11 rounded-full bg-orange-100 flex items-center justify-center">
                  <Icon name="MapPin" size={22} className="text-orange-500" />
                </div>
                <h3 className="font-bold text-xl text-foreground">Самовывоз</h3>
              </div>
              <p className="text-muted-foreground text-sm mb-4">Забрать оплаченный товар можно на складе по адресу:</p>
              <ul className="space-y-3">
                {["г. Новосибирск, ул. Электрозаводская, 2, корпус 5", "г. Москва, ш. Энтузиастов, д. 56, стр. 32"].map((a, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-foreground">
                    <Icon name="MapPin" size={16} className="text-orange-500 flex-shrink-0 mt-0.5" />
                    <span>{a}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-sky-50 border border-sky-100 rounded-2xl p-8">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-11 h-11 rounded-full bg-sky-100 flex items-center justify-center">
                  <Icon name="Truck" size={22} className="text-sky-500" />
                </div>
                <h3 className="font-bold text-xl text-foreground">Доставка по России</h3>
              </div>
              <ul className="space-y-3.5">
                {[
                  { icon: "Check", node: <>Доставка по России осуществляется через транспортные компании.</> },
                  { icon: "Check", node: <><strong className="text-green-600">Бесплатно</strong> доставим товар до терминала любой ТК в пределах г. Новосибирск и г. Москва.</> },
                  { icon: "Check", node: <>Перевозчики: «Деловые линии», «ПЭК», «СДЭК».</> },
                  { icon: "Clock", node: <>Сроки поставки зависят от места назначения и выбора перевозчика.</> },
                  { icon: "CreditCard", node: <>Оплата доставки — заказчиком при получении по тарифам перевозчика.</> },
                ].map((r, i) => (
                  <li key={i} className="flex items-start gap-2.5 text-sm text-foreground leading-relaxed">
                    <Icon name={r.icon} fallback="Check" size={17} className="text-sky-500 flex-shrink-0 mt-0.5" />
                    <span>{r.node}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {afterDelivery}

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
                  <p className="text-center text-sm font-medium text-muted-foreground mb-6">Оборудование для мясо и рыбопереработки</p>
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
                  <input type="text" placeholder="Имя *" required value={name} onChange={e => setName(e.target.value)} className={inputCls} />
                  <div>
                    <input type="tel" placeholder="+7 (___) ___-__-__" required value={phone} onChange={e => setPhone(formatPhone(phone, e.target.value))} onBlur={() => setPhoneTouched(true)} className={phoneTouched && !isValidPhone(phone) ? inputError : inputCls} />
                    {phoneTouched && !isValidPhone(phone) && <p className="text-xs text-red-500 mt-1">Введите номер России, Казахстана или Беларуси</p>}
                  </div>
                  <textarea placeholder="Комментарий (продукт, объём, задача)" rows={4} value={comment} onChange={e => setComment(e.target.value)} className={inputCls + " resize-none"} />
                  <ConsentCheckbox checked={consent} onChange={setConsent} />
                  <button onClick={submit} disabled={!name.trim() || !isValidPhone(phone) || !consent || sending} style={{ backgroundColor: "#D98E5C" }} className="w-full py-4 text-white rounded-xl font-bold text-base hover:brightness-95 transition-all shadow-sm disabled:opacity-40">
                    {sending ? "Отправляем..." : "Отправить"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <ThankYouModal open={thankYouOpen} onClose={() => setThankYouOpen(false)} />
    </>
  );
}