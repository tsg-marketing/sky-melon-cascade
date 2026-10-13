import Icon from "@/components/ui/icon";
import { sectionAnim } from "@/components/pelmeni/shared";
import { FISH_HERO_BENEFITS, FISH_IMAGES, FISH_STATS } from "./data";

export default function FishHero({ visible, onPick, onCatalog }: { visible: boolean; onPick: () => void; onCatalog: () => void }) {
  return (
    <>
      <section id="top" className="relative pt-24 sm:pt-28 pb-14 sm:pb-20 px-4 sm:px-6 bg-gradient-to-br from-primary/5 via-background to-background overflow-hidden">
        <div className="absolute inset-0 lg:hidden" style={{ backgroundImage: `url(${FISH_IMAGES.fishRaw})`, backgroundSize: "cover", backgroundPosition: "center", opacity: 0.08 }} />
        <div className="absolute top-24 right-0 w-[600px] h-[600px] bg-primary/6 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 max-w-7xl mx-auto w-full">
          <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">
            <div className={sectionAnim(visible)}>
              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-display font-black leading-[1.05] tracking-tight mb-4 text-foreground">
                Оборудование <span className="text-primary">для рыбопереработки</span>
              </h1>
              <p className="text-lg sm:text-2xl font-semibold text-foreground leading-relaxed mb-6 max-w-xl">
                Больше филе из каждой рыбы и меньше ручного труда: машины для разделки, филетирования и посола.
              </p>
              <div className="space-y-4 mb-7">
                {FISH_HERO_BENEFITS.map((t, i) => (
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
                <button onClick={onCatalog} className="px-8 py-4 border-2 border-primary text-primary rounded-full font-bold text-lg hover:bg-primary/5 transition-all">
                  Смотреть каталог
                </button>
              </div>
            </div>

            <div className={`hidden lg:block relative ${sectionAnim(visible)}`}>
              <div className="rounded-3xl overflow-hidden shadow-2xl border border-border bg-white aspect-[4/3] flex items-center justify-center">
                <img src={FISH_IMAGES.hero} alt="Головоотсекающая машина для рыбы SF-84" className="w-full h-full object-contain p-6" />
              </div>
              <div className="absolute -bottom-6 -left-6 w-48 rounded-2xl overflow-hidden shadow-xl border-4 border-white bg-white">
                <img src={FISH_IMAGES.fishRaw} alt="Свежая рыба для переработки" className="w-full h-32 object-cover" />
              </div>
              <div className="absolute -top-4 -right-4 px-5 py-3 bg-white rounded-2xl shadow-xl border border-border">
                <p className="text-2xl font-black text-primary leading-none">60–120</p>
                <p className="text-xs text-muted-foreground mt-1">рыб в минуту</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-10 px-6 bg-primary/5">
        <div className="max-w-7xl mx-auto grid grid-cols-2 lg:grid-cols-4 gap-6">
          {FISH_STATS.map((s, i) => (
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
