import Icon from "@/components/ui/icon";
import { sectionAnim } from "@/components/pelmeni/shared";
import { SAN_HERO_BENEFITS, SAN_STATS } from "./data";

const HERO_IMG = "https://cdn.poehali.dev/projects/63874bed-e293-4b07-975b-a3b344891b91/files/df52e066-8dbb-404b-95c6-4849c33ba6d7.jpg";

export default function SanHero({ visible, onPick, onAudit }: { visible: boolean; onPick: () => void; onAudit: () => void }) {
  return (
    <>
      <section id="top" className="relative pt-24 sm:pt-28 pb-14 sm:pb-20 px-4 sm:px-6 bg-gradient-to-br from-primary/5 via-background to-background overflow-hidden">
        <div className="absolute inset-0 lg:hidden" style={{ backgroundImage: `url(${HERO_IMG})`, backgroundSize: "cover", backgroundPosition: "center", opacity: 0.1 }} />
        <div className="absolute top-24 right-0 w-[600px] h-[600px] bg-primary/6 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 max-w-7xl mx-auto w-full">
          <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">
            <div className={sectionAnim(visible)}>
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary rounded-full text-sm font-semibold mb-5">
                <Icon name="ShieldCheck" size={16} />
                Соответствие ХАССП и ТР ТС 021/2011
              </div>
              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-display font-black leading-[1.05] tracking-tight mb-4 text-foreground">
                Санитарное оборудование <span className="text-primary">для пищевых производств</span>
              </h1>
              <p className="text-lg sm:text-2xl font-semibold text-foreground leading-relaxed mb-6 max-w-xl">
                Чистый вход в цех без очередей и предписаний: станции гигиены, мойки обуви и тары, стерилизаторы, сушилки.
              </p>
              <div className="space-y-4 mb-7">
                {SAN_HERO_BENEFITS.map((t, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <Icon name="CheckCircle2" fallback="Check" size={26} className="text-primary flex-shrink-0 mt-0.5" />
                    <span className="text-base sm:text-lg text-foreground leading-relaxed">{t}</span>
                  </div>
                ))}
              </div>
              <div className="flex flex-col sm:flex-row gap-4">
                <button onClick={onPick} className="px-8 py-4 bg-orange-500 hover:bg-orange-600 text-white rounded-full font-bold text-lg transition-all shadow-lg shadow-orange-500/20">
                  Подобрать оборудование
                </button>
                <button onClick={onAudit} className="px-8 py-4 border-2 border-primary text-primary rounded-full font-bold text-lg hover:bg-primary/5 transition-all">
                  Бесплатный аудит санпропускника
                </button>
              </div>
            </div>

            <div className={`hidden lg:block ${sectionAnim(visible)}`}>
              <div className="rounded-3xl overflow-hidden shadow-2xl border border-border bg-secondary aspect-[4/3]">
                <img src={HERO_IMG} alt="Станция гигиены на входе в цех пищевого производства" className="w-full h-full object-cover" />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-10 px-6 bg-primary/5">
        <div className="max-w-7xl mx-auto grid grid-cols-2 lg:grid-cols-4 gap-6">
          {SAN_STATS.map((s, i) => (
            <div key={i} className="text-center">
              <p className="text-3xl sm:text-4xl font-display font-black text-primary">{s.num}</p>
              <p className="text-sm sm:text-base text-muted-foreground mt-1">{s.text}</p>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
