import Icon from "@/components/ui/icon";
import { sectionAnim } from "./shared";

const FACTS = [
  { icon: "Award", num: "25 лет", text: "Опыт работы с 2001 года" },
  { icon: "Building2", num: "3 города", text: "Москва, Новосибирск, Челябинск" },
  { icon: "Handshake", num: "Проверенные партнёры", text: "Заводы Европы, России и Китая" },
];

const PERKS = [
  { icon: "Boxes", title: "Комплексные решения", desc: "От подбора оборудования до сервисного обслуживания" },
  { icon: "Truck", title: "Быстрая доставка", desc: "Собственная логистика по России и СНГ" },
  { icon: "LifeBuoy", title: "Сервисная поддержка", desc: "Гарантийное и постгарантийное обслуживание" },
  { icon: "MessagesSquare", title: "Экспертная консультация", desc: "Помощь в выборе и отладке технологии" },
];

export default function PelmeniAbout({ visible }: { visible: boolean }) {
  return (
    <section id="about" className="py-12 px-6 bg-gradient-to-b from-secondary to-white">
      <div className="max-w-7xl mx-auto">
        <div className={`text-center mb-12 ${sectionAnim(visible)}`}>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-display font-black tracking-tight text-foreground">О компании ТЕХНО-СИБ</h2>
        </div>

        <div className="grid sm:grid-cols-3 gap-6 mb-12">
          {FACTS.map((f, i) => (
            <div key={i} className="p-7 bg-white border border-border rounded-2xl text-center shadow-sm">
              <div className="w-14 h-14 bg-primary/10 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Icon name={f.icon} fallback="Star" size={28} className="text-primary" />
              </div>
              <p className="font-black text-2xl text-foreground mb-1">{f.num}</p>
              <p className="text-sm text-muted-foreground">{f.text}</p>
            </div>
          ))}
        </div>

        <div className="grid lg:grid-cols-2 gap-12 items-start">
          <div>
            <p className="text-lg text-muted-foreground leading-relaxed mb-5">
              Компания <strong className="text-foreground">«Техно-Сиб»</strong> поставляет оборудование для мясопереработки и производства полуфабрикатов. Работаем с 2001 года и помогаем предприятиям оснащать и модернизировать цеха.
            </p>
            <div className="p-6 bg-primary/5 border border-primary/15 rounded-2xl mb-5">
              <p className="text-lg text-foreground leading-relaxed">
                Пельменное направление — одно из ключевых: в наличии и под заказ более 30 моделей от настольных аппаратов до промышленных автоматов производительностью 350 кг/ч.
              </p>
            </div>
            <p className="text-lg text-muted-foreground leading-relaxed mb-5">
              Собственные офисы продаж, склады и сервисная служба в Москве, Новосибирске и Челябинске. Отгружаем со склада и доставляем по России и СНГ.
            </p>
            <p className="text-lg text-muted-foreground leading-relaxed">
              Технологи компании помогают не только выбрать автомат, но и отладить рецептуру теста под конкретную модель — от этого напрямую зависит процент брака на формовке.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            {PERKS.map((item, i) => (
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
  );
}
