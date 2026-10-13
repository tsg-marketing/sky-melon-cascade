import { useState } from "react";
import Icon from "@/components/ui/icon";
import { sectionAnim } from "@/components/pelmeni/shared";
import { FISH_ADVANTAGES, FISH_DIRECTIONS, FISH_FAQ, FISH_FISH_TYPES, FISH_IMAGES, FISH_LINE, FISH_PAINS, FISH_PROCESS } from "./data";

const H2 = "text-3xl sm:text-4xl lg:text-5xl font-display font-black tracking-tight text-foreground leading-tight";
const cardAnim = (visible: boolean) => (visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8");
const delay = (i: number, step = 80) => ({ transitionDelay: `${i * step}ms`, transitionDuration: "700ms" });

export function FishDirections({ visible, onSelect }: { visible: boolean; onSelect: (cat: string) => void }) {
  return (
    <section id="directions" className="py-12 px-6 bg-gradient-to-br from-primary/5 via-white to-primary/10">
      <div className="max-w-7xl mx-auto">
        <div className={`text-center mb-12 ${sectionAnim(visible)}`}>
          <h2 className={H2}>Оборудование для каждого этапа переработки рыбы</h2>
          <p className="text-lg text-muted-foreground mt-4">От удаления чешуи до посола — подберём отдельную машину или всю линию</p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {FISH_DIRECTIONS.map((d, i) => (
            <div key={d.cat} className={`bg-white border border-border rounded-2xl shadow-sm hover:shadow-lg hover:border-primary/40 transition-all flex flex-col overflow-hidden ${cardAnim(visible)}`} style={delay(i)}>
              <div className="h-56 bg-white flex items-center justify-center border-b border-border p-4 overflow-hidden">
                <img src={d.img} alt={d.title} loading="lazy" className="max-w-full max-h-full object-contain" />
              </div>
              <div className="p-6 flex flex-col flex-1">
                <h3 className="font-bold text-xl text-foreground mb-2">{d.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed mb-4">{d.desc}</p>
                <ul className="space-y-1.5 mb-5">
                  {d.points.map((p, pi) => (
                    <li key={pi} className="flex items-start gap-2 text-sm text-foreground">
                      <Icon name="Check" size={16} className="text-primary flex-shrink-0 mt-0.5" />
                      <span>{p}</span>
                    </li>
                  ))}
                </ul>
                <button onClick={() => onSelect(d.cat)} className="mt-auto inline-flex items-center gap-2 text-primary font-bold hover:gap-3 transition-all">
                  Смотреть модели <Icon name="ArrowRight" size={18} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function FishPains({ visible, onLead }: { visible: boolean; onLead: () => void }) {
  return (
    <section id="pain" className="py-12 px-6 bg-white">
      <div className="max-w-7xl mx-auto">
        <div className={`text-center mb-12 ${sectionAnim(visible)}`}>
          <h2 className={H2}>Какие проблемы решает автоматизация рыбного цеха</h2>
          <p className="text-lg text-muted-foreground mt-4 max-w-3xl mx-auto">Ручная разделка дорожает с каждым годом — машины окупаются за счёт выхода продукта и экономии на персонале</p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {FISH_PAINS.map((p, i) => (
            <div key={i} className={`p-7 bg-background border border-border rounded-2xl transition-all ${cardAnim(visible)}`} style={delay(i)}>
              <div className="w-14 h-14 bg-red-50 rounded-xl flex items-center justify-center mb-4">
                <Icon name={p.icon} fallback="AlertCircle" size={28} className="text-red-500" />
              </div>
              <h3 className="font-bold text-xl text-foreground mb-2">{p.title}</h3>
              <p className="text-muted-foreground leading-relaxed">{p.desc}</p>
            </div>
          ))}
        </div>
        <div className="text-center mt-10">
          <button onClick={onLead} className="px-8 py-4 bg-orange-500 hover:bg-orange-600 text-white rounded-full font-bold text-lg transition-all shadow-lg shadow-orange-500/20">
            Рассчитать окупаемость оборудования
          </button>
        </div>
      </div>
    </section>
  );
}

export function FishAdvantages({ visible }: { visible: boolean }) {
  return (
    <section id="advantages" className="py-12 px-6 bg-secondary">
      <div className="max-w-7xl mx-auto grid lg:grid-cols-5 gap-10 items-center">
        <div className={`lg:col-span-2 ${sectionAnim(visible)}`}>
          <h2 className={H2}>Почему наше оборудование выгодно</h2>
          <p className="text-lg text-muted-foreground mt-4 mb-6">Немецкие машины AGK Kronawitter, современные линии Suntok и Daribo, шкуросъёмные машины Nock — проверенные решения для рыбных цехов любого масштаба.</p>
          <div className="rounded-3xl overflow-hidden border border-border bg-white aspect-[4/3] flex items-center justify-center shadow-lg">
            <img src={FISH_IMAGES.fillet} alt="Филетировочная машина AGK-1970" loading="lazy" className="w-full h-full object-contain p-4" />
          </div>
        </div>
        <div className="lg:col-span-3 grid sm:grid-cols-2 gap-5">
          {FISH_ADVANTAGES.map((a, i) => (
            <div key={i} className={`p-6 bg-white border border-border rounded-2xl shadow-sm transition-all ${cardAnim(visible)}`} style={delay(i)}>
              <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-3">
                <Icon name={a.icon} fallback="Star" size={24} className="text-primary" />
              </div>
              <h3 className="font-bold text-lg text-foreground mb-1.5">{a.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{a.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function FishLine({ visible, onSelect, onLead }: { visible: boolean; onSelect: (cat: string) => void; onLead: () => void }) {
  return (
    <section id="line" className="py-12 px-6 bg-white">
      <div className="max-w-7xl mx-auto">
        <div className={`text-center mb-12 ${sectionAnim(visible)}`}>
          <h2 className={H2}>Линия переработки рыбы под ключ</h2>
          <p className="text-lg text-muted-foreground mt-4">Соберём технологическую цепочку под ваш вид рыбы и объём сырья</p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-10">
          {FISH_LINE.map((s, i) => (
            <button key={i} onClick={() => onSelect(s.cat)} className={`relative p-5 bg-background border border-border rounded-2xl hover:border-primary/40 hover:shadow-lg transition-all text-center ${cardAnim(visible)}`} style={delay(i, 100)}>
              <span className="absolute top-3 left-4 text-xs font-black text-primary/40">0{i + 1}</span>
              <div className="w-14 h-14 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                <Icon name={s.icon} fallback="Circle" size={26} className="text-primary" />
              </div>
              <p className="font-bold text-foreground leading-tight">{s.title}</p>
              {i < FISH_LINE.length - 1 && (
                <Icon name="ChevronRight" size={20} className="hidden lg:block absolute -right-3.5 top-1/2 -translate-y-1/2 text-primary/50 z-10" />
              )}
            </button>
          ))}
        </div>
        <div className="relative rounded-3xl overflow-hidden">
          <img src={FISH_IMAGES.fishRaw} alt="Свежая рыба для переработки" loading="lazy" className="absolute inset-0 w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-r from-primary/95 via-primary/85 to-primary/40" />
          <div className="relative p-8 sm:p-12 max-w-2xl">
            <h3 className="text-2xl sm:text-3xl font-display font-black text-white mb-3">Работаем с любой рыбой</h3>
            <div className="flex flex-wrap gap-2 mb-6">
              {FISH_FISH_TYPES.map((f) => (
                <span key={f} className="px-3 py-1.5 bg-white/15 border border-white/25 text-white rounded-full text-sm font-semibold">{f}</span>
              ))}
            </div>
            <button onClick={onLead} className="px-7 py-3.5 bg-orange-500 hover:bg-orange-600 text-white rounded-full font-bold transition-all shadow-lg">
              Получить проект линии
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

export function FishProcess({ visible }: { visible: boolean }) {
  return (
    <section id="process" className="py-12 px-6 bg-secondary">
      <div className="max-w-7xl mx-auto">
        <div className={`text-center mb-12 ${sectionAnim(visible)}`}>
          <h2 className={H2}>Как мы работаем</h2>
        </div>
        <div className="grid md:grid-cols-4 gap-6">
          {FISH_PROCESS.map((s, i) => (
            <div key={i} className={`relative p-7 bg-white border border-border rounded-2xl shadow-sm transition-all flex flex-col gap-4 ${cardAnim(visible)}`} style={delay(i, 100)}>
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

export function FishFaq({ visible }: { visible: boolean }) {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <section id="faq" className="py-12 px-6 bg-white">
      <div className="max-w-4xl mx-auto">
        <div className={`text-center mb-12 ${sectionAnim(visible)}`}>
          <h2 className={H2}>Частые вопросы</h2>
        </div>
        <div className="space-y-3">
          {FISH_FAQ.map((f, i) => {
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
