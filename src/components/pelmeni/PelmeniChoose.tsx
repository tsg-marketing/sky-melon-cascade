import Icon from "@/components/ui/icon";
import { sectionAnim } from "./shared";

const SEGMENTS = [
  {
    icon: "Sprout",
    name: "Старт и небольшой цех",
    volume: "до 300 кг в смену",
    productivity: "до 4 000 шт/ч",
    text: "Компактные настольные и напольные аппараты. Подходят кулинариям, фермерским хозяйствам, кафе и цехам, которые только выводят пельмени в ассортимент. Минимальная площадь под установку, питание 220 В на части моделей.",
    price: "от 155 000 ₽",
    btn: "Подобрать под старт",
  },
  {
    icon: "Factory",
    name: "Действующее производство",
    volume: "300–1 500 кг в смену",
    productivity: "7 000–13 200 шт/ч",
    text: "Автоматы с несколькими рядами формовки и сменными матрицами под разный вес изделия. Основной выбор мясокомбинатов и цехов полуфабрикатов, которые закрывают собственную розницу и локальные сети.",
    price: "от 240 000 до 1 100 000 ₽",
    btn: "Подобрать под цех",
  },
  {
    icon: "Cog",
    name: "Промышленная линия",
    volume: "более 1 500 кг в смену",
    productivity: "230–350 кг/ч",
    text: "Автоматы промышленного класса с расчётной производительностью в кг/ч, регулировкой толщины теста от 0,8 до 2 мм и точностью формовки до 15%. Работают в непрерывном режиме и встраиваются в линию с подачей теста и фарша.",
    price: "от 1 600 000 ₽",
    btn: "Рассчитать линию",
  },
];

export default function PelmeniChoose({ visible, onPick }: { visible: boolean; onPick: (segment: string) => void }) {
  return (
    <section id="choose" className="py-12 px-6 bg-background">
      <div className="max-w-7xl mx-auto">
        <div className={`text-center mb-12 ${sectionAnim(visible)}`}>
          <span className="text-xs font-semibold tracking-widest text-primary uppercase">Ориентир по объёму</span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-display font-black tracking-tight mt-3 text-foreground leading-tight">
            Как выбрать пельменный автомат под свой объём
          </h2>
          <p className="text-lg text-muted-foreground mt-4 max-w-3xl mx-auto">
            Три типовых сценария. Если ваш случай между ними — напишите, посчитаем вместе.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {SEGMENTS.map((s, i) => (
            <div
              key={i}
              className={`p-7 bg-white border border-border rounded-2xl shadow-sm hover:shadow-lg hover:border-primary/40 transition-all flex flex-col ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
              style={{ transitionDelay: `${i * 100}ms`, transitionDuration: "700ms" }}
            >
              <div className="w-14 h-14 bg-primary/10 rounded-xl flex items-center justify-center mb-4">
                <Icon name={s.icon} fallback="Star" size={28} className="text-primary" />
              </div>
              <h3 className="font-bold text-xl text-foreground mb-3">{s.name}</h3>
              <div className="space-y-1.5 mb-4">
                <p className="text-sm text-foreground"><span className="text-muted-foreground">Объём:</span> <strong>{s.volume}</strong></p>
                <p className="text-sm text-foreground"><span className="text-muted-foreground">Производительность:</span> <strong>{s.productivity}</strong></p>
              </div>
              <p className="text-muted-foreground text-sm leading-relaxed mb-5 flex-1">{s.text}</p>
              <p className="text-lg font-bold text-primary mb-5">Ориентир по цене: {s.price}</p>
              <button
                onClick={() => onPick(s.name)}
                className="w-full py-3.5 bg-orange-500 hover:bg-orange-600 text-white rounded-xl text-base font-bold transition-all shadow-sm"
              >
                {s.btn}
              </button>
            </div>
          ))}
        </div>

        <p className="text-sm text-muted-foreground leading-relaxed mt-8 max-w-4xl mx-auto text-center">
          Производительность в паспорте — расчётная кинематическая. Реальный выход зависит от рецептуры теста, влажности фарша и квалификации оператора. На демонстрации показываем фактический результат на вашем сырье.
        </p>
      </div>
    </section>
  );
}
