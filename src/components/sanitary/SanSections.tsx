import { useState } from "react";
import Icon from "@/components/ui/icon";
import { sectionAnim } from "@/components/pelmeni/shared";
import { SAN_DIRECTIONS, SAN_FAQ, SAN_PAINS, SAN_PROCESS, SAN_ZONES, SAN_CATEGORIES } from "./data";

const H2 = "text-3xl sm:text-4xl lg:text-5xl font-display font-black tracking-tight text-foreground leading-tight";
const cardAnim = (visible: boolean) => (visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8");

export function SanPains({ visible, onLead }: { visible: boolean; onLead: () => void }) {
  return (
    <section id="pain" className="py-12 px-6 bg-white">
      <div className="max-w-7xl mx-auto">
        <div className={`text-center mb-12 ${sectionAnim(visible)}`}>
          <h2 className={H2}>Знакомые проблемы?</h2>
          <p className="text-lg text-muted-foreground mt-4 max-w-3xl mx-auto">Санитарный режим — первое, что смотрят проверяющие и аудиторы торговых сетей</p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {SAN_PAINS.map((p, i) => (
            <div key={i} className={`p-7 bg-background border border-border rounded-2xl transition-all ${cardAnim(visible)}`} style={{ transitionDelay: `${i * 80}ms`, transitionDuration: "700ms" }}>
              <div className="w-14 h-14 bg-red-50 rounded-xl flex items-center justify-center mb-4">
                <Icon name={p.icon} fallback="AlertTriangle" size={28} className="text-red-500" />
              </div>
              <h3 className="font-bold text-xl text-foreground mb-2">{p.title}</h3>
              <p className="text-muted-foreground leading-relaxed">{p.desc}</p>
            </div>
          ))}
        </div>
        <div className="mt-10 p-6 sm:p-8 bg-gradient-to-r from-primary to-primary/85 rounded-3xl flex flex-col md:flex-row items-center justify-between gap-6">
          <p className="text-white text-xl sm:text-2xl font-bold text-center md:text-left">Решим всё одним комплектом оборудования — подберём под ваш поток персонала</p>
          <button onClick={onLead} className="px-8 py-4 bg-orange-500 hover:bg-orange-600 text-white rounded-full font-bold text-lg transition-all shadow-lg flex-shrink-0">
            Получить расчёт
          </button>
        </div>
      </div>
    </section>
  );
}

export function SanDirections({ visible, onSelect }: { visible: boolean; onSelect: (cat: string) => void }) {
  return (
    <section id="directions" className="py-12 px-6 bg-gradient-to-br from-primary/5 via-white to-primary/10">
      <div className="max-w-7xl mx-auto">
        <div className={`text-center mb-12 ${sectionAnim(visible)}`}>
          <h2 className={H2}>5 направлений санитарного оборудования</h2>
          <p className="text-lg text-muted-foreground mt-4">Всё для санпропускника, моечного отделения и цеха обвалки</p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {SAN_DIRECTIONS.map((d, i) => {
            const icon = SAN_CATEGORIES.find((c) => c.id === d.cat)?.icon || "Circle";
            return (
              <div key={d.cat} className={`p-7 bg-white border border-border rounded-2xl shadow-sm hover:shadow-lg hover:border-primary/40 transition-all flex flex-col ${i === 0 ? "lg:row-span-2" : ""} ${cardAnim(visible)}`} style={{ transitionDelay: `${i * 80}ms`, transitionDuration: "700ms" }}>
                {d.img && (
                  <div className="-mx-7 -mt-7 mb-6 aspect-[16/10] overflow-hidden rounded-t-2xl bg-secondary">
                    <img src={d.img} alt={d.title} loading="lazy" className="w-full h-full object-cover" />
                  </div>
                )}
                <div className="w-14 h-14 bg-primary/10 rounded-xl flex items-center justify-center mb-4">
                  <Icon name={icon} fallback="Circle" size={28} className="text-primary" />
                </div>
                <h3 className="font-bold text-2xl text-foreground mb-2">{d.title}</h3>
                <p className="text-muted-foreground leading-relaxed mb-4">{d.desc}</p>
                <ul className="space-y-2 mb-6">
                  {d.points.map((p, pi) => (
                    <li key={pi} className="flex items-start gap-2 text-foreground">
                      <Icon name="Check" size={18} className="text-primary flex-shrink-0 mt-0.5" />
                      <span>{p}</span>
                    </li>
                  ))}
                </ul>
                <button onClick={() => onSelect(d.cat)} className="mt-auto inline-flex items-center gap-2 text-primary font-bold hover:gap-3 transition-all">
                  Смотреть модели <Icon name="ArrowRight" size={18} />
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export function SanZones({ visible, onPick }: { visible: boolean; onPick: (zone: string) => void }) {
  return (
    <section id="zones" className="py-12 px-6 bg-white">
      <div className="max-w-7xl mx-auto">
        <div className={`text-center mb-12 ${sectionAnim(visible)}`}>
          <h2 className={H2}>Что поставить в каждой зоне</h2>
          <p className="text-lg text-muted-foreground mt-4">Карта санитарной защиты предприятия</p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {SAN_ZONES.map((z, i) => (
            <button key={i} onClick={() => onPick(z.title)} className={`text-left p-6 bg-background border border-border rounded-2xl hover:border-primary/40 hover:shadow-lg transition-all flex flex-col gap-3 ${cardAnim(visible)}`} style={{ transitionDelay: `${i * 80}ms`, transitionDuration: "700ms" }}>
              <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                <Icon name={z.icon} fallback="MapPin" size={24} className="text-primary" />
              </div>
              <h3 className="font-bold text-lg text-foreground">{z.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed flex-1">{z.pick}</p>
              <span className="text-sm font-bold text-orange-500">Подобрать →</span>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}

export function SanProcess({ visible }: { visible: boolean }) {
  return (
    <section id="process" className="py-12 px-6 bg-secondary">
      <div className="max-w-7xl mx-auto">
        <div className={`text-center mb-12 ${sectionAnim(visible)}`}>
          <h2 className={H2}>Как мы работаем</h2>
        </div>
        <div className="grid md:grid-cols-4 gap-6">
          {SAN_PROCESS.map((s, i) => (
            <div key={i} className={`relative p-7 bg-white border border-border rounded-2xl shadow-sm transition-all flex flex-col gap-4 ${cardAnim(visible)}`} style={{ transitionDelay: `${i * 100}ms`, transitionDuration: "700ms" }}>
              <div className="flex items-center justify-between">
                <div className="w-14 h-14 bg-primary/10 rounded-xl flex items-center justify-center">
                  <Icon name={s.icon} fallback="Star" size={28} className="text-primary" />
                </div>
                <span className="font-black text-3xl text-primary/20">{s.step}</span>
              </div>
              <div>
                <h3 className="font-bold text-xl text-foreground mb-2">{s.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{s.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function SanFaq({ visible }: { visible: boolean }) {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <section id="faq" className="py-12 px-6 bg-white">
      <div className="max-w-4xl mx-auto">
        <div className={`text-center mb-12 ${sectionAnim(visible)}`}>
          <h2 className={H2}>Частые вопросы</h2>
        </div>
        <div className="space-y-3">
          {SAN_FAQ.map((f, i) => {
            const isOpen = open === i;
            return (
              <div key={i} className="border border-border rounded-2xl overflow-hidden bg-background">
                <button onClick={() => setOpen(isOpen ? null : i)} aria-expanded={isOpen} className="w-full flex items-start justify-between gap-4 px-6 py-5 text-left hover:bg-primary/5 transition-colors">
                  <h3 className="font-semibold text-lg text-foreground">{f.q}</h3>
                  <Icon name={isOpen ? "ChevronUp" : "ChevronDown"} size={20} className="text-primary flex-shrink-0 mt-1" />
                </button>
                {isOpen && <div className="px-6 pb-5 text-muted-foreground leading-relaxed">{f.a}</div>}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
