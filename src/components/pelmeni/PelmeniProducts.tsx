import { sectionAnim } from "./shared";

const ITEMS = [
  { img: "pel-pelmeni", title: "Пельмени", desc: "Классический ассортимент: вес изделия от 7 до 25 г, сменные матрицы под разные типоразмеры." },
  { img: "pel-hinkali", title: "Хинкали", desc: "Формовка с характерным защипом, отдельная производительность в паспорте моделей." },
  { img: "pel-manty", title: "Манты и позы", desc: "Крупное изделие с защипом. Формовка без предварительного подмораживания фарша, тесто толщиной от 0,8 до 2 мм." },
  { img: "pel-vareniki", title: "Вареники", desc: "Сладкая и овощная начинка, творог, картофель. Регулировка дозы начинки без замены формующего узла." },
  { img: "pel-cheburek", title: "Чебуреки и самса", desc: "Формующий модуль под чебурек, производительность самсы до 12 000 шт/ч на моделях старшей линейки." },
  { img: "pel-ravioli", title: "Равиоли и изделия с начинкой", desc: "Универсальные машины для теста с начинкой: от мини-равиоли до крупных изделий весом до 80 г." },
];

export default function PelmeniProducts({ visible }: { visible: boolean }) {
  return (
    <section id="products" className="py-12 px-6 bg-secondary">
      <div className="max-w-7xl mx-auto">
        <div className={`text-center mb-12 ${sectionAnim(visible)}`}>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-display font-black tracking-tight text-foreground leading-tight">
            Что можно производить на пельменном автомате
          </h2>
          <p className="text-lg text-muted-foreground mt-4 max-w-3xl mx-auto">
            Смена формующей головы или матрицы — и то же оборудование выпускает другой вид изделия.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {ITEMS.map((it, i) => (
            <div
              key={i}
              className={`bg-white border border-border rounded-2xl overflow-hidden shadow-sm hover:shadow-lg hover:border-primary/40 transition-all flex flex-col ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
              style={{ transitionDelay: `${i * 80}ms`, transitionDuration: "700ms" }}
            >
              <div className="relative aspect-[4/3] overflow-hidden bg-secondary">
                <img src={`/features/${it.img}.webp`} alt={it.title} loading="lazy" className="w-full h-full object-cover" />
              </div>
              <div className="p-7">
                <h3 className="font-bold text-2xl text-foreground mb-3">{it.title}</h3>
                <p className="text-muted-foreground text-lg leading-relaxed">{it.desc}</p>
              </div>
            </div>
          ))}
        </div>

        <p className="text-lg text-muted-foreground leading-relaxed mt-8 max-w-4xl mx-auto text-center">
          Точный перечень изделий зависит от модели и комплектации формующей головы. Пришлите ваше ТЗ по продукту — подберём матрицу под нужный вес и форму.
        </p>
      </div>
    </section>
  );
}
