import { sectionAnim } from "./shared";

const ITEMS = [
  { img: "pel-abs-models", title: "Более 30 моделей в одной категории", desc: "Настольные аппараты, автоматы средней производительности и промышленные линии до 350 кг/ч. Подберём под объём смены, а не «что есть на складе»." },
  { img: "pel-abs-demo", title: "Проверка до покупки", desc: "Демозалы в Москве и Новосибирске. Привозите своё тесто и фарш — отформуем ваш продукт и покажем реальный выход, а не паспортную цифру." },
  { img: "pel-abs-stock", title: "Наличие на складах", desc: "Основные модели отгружаем со склада. Доставка по России и СНГ собственной логистикой и транспортными компаниями." },
  { img: "pel-abs-service", title: "Пусконаладка и сервис", desc: "Монтаж, запуск, обучение персонала. Гарантия, склад запчастей и расходных формующих узлов, техподдержка после запуска." },
];

export default function PelmeniAdvantages({ visible }: { visible: boolean }) {
  return (
    <section id="advantages" className="py-12 px-6 bg-background scroll-mt-32">
      <div className="max-w-7xl mx-auto">
        <div className={`text-center mb-12 ${sectionAnim(visible)}`}>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-display font-black tracking-tight text-foreground leading-tight">
            Почему пельменное оборудование берут в Техно-Сиб
          </h2>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {ITEMS.map((it, i) => (
            <div
              key={i}
              className={`bg-white border border-border rounded-2xl overflow-hidden shadow-sm hover:shadow-lg hover:border-primary/40 transition-all flex flex-col ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
              style={{ transitionDelay: `${i * 90}ms`, transitionDuration: "700ms" }}
            >
              <div className="relative aspect-[4/3] overflow-hidden bg-gradient-to-b from-secondary/60 to-white">
                <img src={`/features/${it.img}.webp`} alt={it.title} loading="lazy" className="w-full h-full object-contain p-6" />
              </div>
              <div className="p-7">
                <h3 className="font-bold text-2xl text-foreground mb-3 leading-snug">{it.title}</h3>
                <p className="text-muted-foreground text-lg leading-relaxed">{it.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}