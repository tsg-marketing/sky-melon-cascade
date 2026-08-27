import Icon from "@/components/ui/icon";
import { sectionAnim } from "./shared";

const STEPS = [
  { icon: "ClipboardCheck", step: "01", title: "Уточняем задачу", desc: "Вид изделия, вес, объём смены, площадь цеха" },
  { icon: "Layers", step: "02", title: "Предлагаем 2–3 модели", desc: "С расчётом по вашему объёму и бюджету" },
  { icon: "Eye", step: "03", title: "Показываем в демозале", desc: "Можно привезти своё тесто и фарш" },
  { icon: "GraduationCap", step: "04", title: "Ставим и обучаем", desc: "Пусконаладка, инструктаж, сервисная поддержка" },
];

export default function PelmeniProcess({ visible }: { visible: boolean }) {
  return (
    <section id="process" className="py-12 px-6 bg-secondary">
      <div className="max-w-7xl mx-auto">
        <div className={`text-center mb-12 ${sectionAnim(visible)}`}>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-display font-black tracking-tight text-foreground leading-tight">Как мы работаем</h2>
        </div>
        <div className="grid md:grid-cols-4 gap-6">
          {STEPS.map((s, i) => (
            <div
              key={i}
              className={`relative p-7 bg-white border border-border rounded-2xl shadow-sm hover:shadow-lg hover:border-primary/40 transition-all flex flex-col gap-4 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
              style={{ transitionDelay: `${i * 100}ms`, transitionDuration: "700ms" }}
            >
              <div className="flex items-center justify-between">
                <div className="w-14 h-14 bg-primary/10 rounded-xl flex items-center justify-center">
                  <Icon name={s.icon} fallback="Star" size={28} className="text-primary" />
                </div>
                <span className="font-black text-3xl text-primary/20">{s.step}</span>
              </div>
              <div>
                <h3 className="font-bold text-xl text-foreground mb-2">{s.title}</h3>
                <p className="text-muted-foreground text-base leading-relaxed">{s.desc}</p>
              </div>
              {i < 3 && (
                <div className="hidden md:block absolute -right-4 top-1/2 -translate-y-1/2 z-10">
                  <div className="w-8 h-8 bg-primary/10 border border-primary/20 rounded-full flex items-center justify-center">
                    <Icon name="ChevronRight" size={16} className="text-primary" />
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
