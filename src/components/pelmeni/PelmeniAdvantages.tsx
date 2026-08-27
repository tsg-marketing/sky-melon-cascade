import Icon from "@/components/ui/icon";
import { sectionAnim } from "./shared";

const ITEMS = [
  { icon: "Layers", title: "Более 30 моделей в одной категории", desc: "Настольные аппараты, автоматы средней производительности и промышленные линии до 350 кг/ч. Подберём под объём смены, а не «что есть на складе»." },
  { icon: "Building2", title: "Проверка до покупки", desc: "Демозалы в Москве, Новосибирске и Челябинске. Привозите своё тесто и фарш — отформуем ваш продукт и покажем реальный выход, а не паспортную цифру." },
  { icon: "Warehouse", title: "Наличие на трёх складах", desc: "Основные модели отгружаем со склада. Доставка по России и СНГ собственной логистикой и транспортными компаниями." },
  { icon: "Wrench", title: "Пусконаладка и сервис", desc: "Монтаж, запуск, обучение персонала. Гарантия, склад запчастей и расходных формующих узлов, техподдержка после запуска." },
];

export default function PelmeniAdvantages({ visible }: { visible: boolean }) {
  return (
    <section id="advantages" className="py-12 px-6 bg-background">
      <div className="max-w-7xl mx-auto">
        <div className={`text-center mb-12 ${sectionAnim(visible)}`}>
          <span className="text-xs font-semibold tracking-widest text-primary uppercase">Преимущества</span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-display font-black tracking-tight mt-3 text-foreground leading-tight">
            Почему пельменное оборудование берут в Техно-Сиб
          </h2>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {ITEMS.map((it, i) => (
            <div
              key={i}
              className={`p-7 bg-white border border-border rounded-2xl shadow-sm hover:shadow-lg hover:border-primary/40 transition-all ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
              style={{ transitionDelay: `${i * 90}ms`, transitionDuration: "700ms" }}
            >
              <div className="w-14 h-14 bg-primary/10 rounded-xl flex items-center justify-center mb-4">
                <Icon name={it.icon} fallback="Star" size={28} className="text-primary" />
              </div>
              <h3 className="font-bold text-lg text-foreground mb-2 leading-snug">{it.title}</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">{it.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
