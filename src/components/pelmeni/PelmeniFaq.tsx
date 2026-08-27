import { useState } from "react";
import Icon from "@/components/ui/icon";
import { sectionAnim } from "./shared";
import { PELMENI_FAQ } from "./faqData";

export default function PelmeniFaq({ visible }: { visible: boolean }) {
  const [openFaq, setOpenFaq] = useState<string | null>(null);

  return (
    <section id="faq" className="py-12 px-6 bg-secondary">
      <div className="max-w-7xl mx-auto">
        <div className={`text-center mb-12 ${sectionAnim(visible)}`}>
          <span className="text-xs font-semibold tracking-widest text-primary uppercase">FAQ</span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-display font-black tracking-tight mt-3 text-foreground leading-tight">Частые вопросы</h2>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {PELMENI_FAQ.map((col, ci) => (
            <div
              key={ci}
              className={`bg-white border border-border rounded-2xl overflow-hidden shadow-sm transition-all duration-700 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}
              style={{ transitionDelay: `${ci * 100}ms` }}
            >
              <div className="relative aspect-[4/3] overflow-hidden bg-secondary">
                <img src={`/features/${col.img}.webp`} alt={col.role} loading="lazy" className="w-full h-full object-cover" />
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent px-5 pt-10 pb-4 flex items-center gap-3">
                  <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm flex-shrink-0">
                    <Icon name={col.icon} fallback="User" size={20} className="text-primary" />
                  </div>
                  <p className="font-display font-black text-lg text-white uppercase tracking-wide">{col.role}</p>
                </div>
              </div>
              <div className="p-5">
                <div className="space-y-2">
                  {col.items.map((f, i) => {
                    const key = `${ci}-${i}`;
                    const isOpen = openFaq === key;
                    return (
                      <div key={i} className="border border-border rounded-xl overflow-hidden">
                        <button
                          onClick={() => setOpenFaq(isOpen ? null : key)}
                          aria-expanded={isOpen}
                          className="w-full flex items-start justify-between gap-3 px-4 py-3 text-left hover:bg-primary/5 transition-colors"
                        >
                          <h3 className="font-semibold text-sm text-foreground">{f.q}</h3>
                          <Icon name={isOpen ? "ChevronUp" : "ChevronDown"} size={16} className="text-primary flex-shrink-0 mt-0.5" />
                        </button>
                        {isOpen && <div className="px-4 pb-4 text-sm text-muted-foreground leading-relaxed">{f.a}</div>}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
