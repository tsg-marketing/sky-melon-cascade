import Icon from "@/components/ui/icon";
import { sectionAnim } from "./shared";

const BENEFITS = [
  "От 3 600 до 13 200 шт/ч — модели под цех любого масштаба",
  "Пельмени, хинкали, манты, вареники, чебуреки, самса — на одном автомате",
  "Смотрите работу до покупки: демозалы в Москве, Новосибирске, Челябинске",
  "Пусконаладка, обучение персонала, запчасти и сервис",
];

export default function PelmeniHero({ visible, onPick, onDemo }: { visible: boolean; onPick: () => void; onDemo: () => void }) {
  return (
    <section id="top" className="relative pt-24 sm:pt-28 pb-14 sm:pb-20 px-4 sm:px-6 bg-gradient-to-br from-primary/5 via-background to-background overflow-hidden">
      <div className="absolute top-24 right-0 w-[600px] h-[600px] bg-primary/6 rounded-full blur-3xl pointer-events-none" />
      <div className="relative z-10 max-w-7xl mx-auto w-full">
        <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">
          <div className={sectionAnim(visible)}>
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-display font-black leading-[1.05] tracking-tight mb-4 text-foreground">
              Пельменные автоматы <span className="text-primary">и аппараты</span>
            </h1>
            <p className="text-lg sm:text-2xl font-semibold text-foreground leading-relaxed mb-6 max-w-xl">
              Оборудование для производства пельменей, хинкали, мантов и вареников. От настольных моделей до промышленных линий 350 кг/ч.
            </p>
            <div className="space-y-5 mb-6">
              {BENEFITS.map((t, i) => (
                <div key={i} className="flex items-start gap-3">
                  <Icon name="CheckCircle2" fallback="Check" size={28} className="text-primary flex-shrink-0 mt-0.5" />
                  <span className="text-base sm:text-lg text-foreground leading-relaxed">{t}</span>
                </div>
              ))}
            </div>
            <div className="flex flex-col sm:flex-row gap-4">
              <button onClick={onPick} className="px-8 py-4 bg-orange-500 hover:bg-orange-600 text-white rounded-full font-bold text-lg transition-all shadow-lg shadow-orange-500/20">
                Подобрать модель
              </button>
              <button onClick={onDemo} className="px-8 py-4 border-2 border-primary text-primary rounded-full font-bold text-lg hover:bg-primary/5 transition-all">
                Записаться на демонстрацию
              </button>
            </div>
            <p className="text-sm text-muted-foreground mt-5">Более 30 моделей в наличии и под заказ. Цены от 155 000 ₽.</p>
          </div>

          <div className={`hidden lg:block ${sectionAnim(visible)}`}>
            <div className="rounded-3xl overflow-hidden shadow-2xl border border-border bg-secondary aspect-[4/3]">
              <img
                src="/features/hero-pelmeni.webp"
                alt="Пельменный автомат в работе на производстве полуфабрикатов"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
