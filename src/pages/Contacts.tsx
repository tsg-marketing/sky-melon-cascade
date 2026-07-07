import { useEffect } from "react";
import Icon from "@/components/ui/icon";
import SiteHeader from "@/components/site/SiteHeader";
import SiteFooter from "@/components/site/SiteFooter";

const PHONE = "8 800 505-91-24";
const PHONE_HREF = "tel:88005059124";
const EMAIL_SERVICE = "massagers@t-sib.ru";

const OFFICES = [
  {
    city: "Москва",
    address: "ш. Энтузиастов, д. 56, стр. 32, офис 115",
  },
  {
    city: "Новосибирск",
    address: "ул. Электрозаводская, 2 к1, офис 304, 314",
  },
];

export default function Contacts() {
  useEffect(() => {
    document.title = "Контакты — Техносиб | Оборудование для мясо и рыбопереработки";
    let el = document.querySelector('meta[name="description"]');
    if (!el) { el = document.createElement("meta"); el.setAttribute("name", "description"); document.head.appendChild(el); }
    el.setAttribute("content", "Контакты компании Техно-Сиб: телефон 8 800 505-91-24, почта, адреса офисов в Москве и Новосибирске. Оборудование для мясо и рыбопереработки с 2001 года.");
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteHeader current="/contacts" />

      <main className="pt-24 sm:pt-28 pb-16 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto">
          <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-8">
            <a href="/" className="hover:text-primary transition-colors">Главная</a>
            <Icon name="ChevronRight" size={14} />
            <span className="text-foreground">Контакты</span>
          </nav>

          <h1 className="text-5xl sm:text-6xl font-display font-black tracking-tight text-foreground mb-10">Контакты</h1>

          {/* Карточки офисов */}
          <div className="grid lg:grid-cols-2 gap-6 mb-16">
            {OFFICES.map((o) => (
              <div key={o.city} className="bg-white border border-border rounded-3xl shadow-sm p-7 sm:p-9">
                <h2 className="text-2xl sm:text-3xl font-display font-black text-foreground mb-1">{o.city}</h2>
                <p className="text-muted-foreground mb-6">{o.address}</p>

                <div className="grid sm:grid-cols-2 gap-5">
                  <ContactRow icon="Phone" label="Телефон">
                    <a href={PHONE_HREF} className="font-bold text-foreground hover:text-primary transition-colors">{PHONE}</a>
                  </ContactRow>
                  <ContactRow icon="Clock" label="График работы офиса:">
                    <span className="text-foreground">Пн-Пт <strong>09:00-18:00</strong></span>
                  </ContactRow>
                  <ContactRow icon="Clock" label="График работы склада:">
                    <span className="text-foreground">Пн-Пт <strong>09:00-17:00</strong></span>
                  </ContactRow>
                  <ContactRow icon="Mail" label="Почта">
                    <a href={`mailto:${EMAIL_SERVICE}`} className="font-semibold text-primary hover:underline">{EMAIL_SERVICE}</a>
                  </ContactRow>
                </div>
              </div>
            ))}
          </div>

          {/* О компании */}
          <section className="bg-gradient-to-b from-background to-white rounded-3xl">
            <h2 className="text-4xl lg:text-5xl font-display font-black text-center mb-10 text-foreground">О компании ТЕХНО-СИБ</h2>

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
                <p className="font-medium text-foreground">
                  Мы сотрудничаем с ведущими заводами-производителями Европы, России и Китая, подбирая решения под задачи и бюджет клиента.
                </p>
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
          </section>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}

function ContactRow({ icon, label, children }: { icon: string; label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-3">
      <div className="w-10 h-10 rounded-full bg-background border border-border flex items-center justify-center flex-shrink-0">
        <Icon name={icon} fallback="Info" size={18} className="text-foreground" />
      </div>
      <div>
        <p className="text-xs text-muted-foreground mb-0.5">{label}</p>
        <div className="text-sm">{children}</div>
      </div>
    </div>
  );
}