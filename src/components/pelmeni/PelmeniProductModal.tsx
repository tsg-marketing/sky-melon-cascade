import { useEffect, useRef, useState } from "react";
import Icon from "@/components/ui/icon";
import { CatalogItem } from "@/lib/catalog";
import { visibleParams, formatPrice, sanitizeDescription } from "@/lib/pelmeni";

interface Props {
  item: CatalogItem | null;
  onClose: () => void;
  onLead: (item: CatalogItem) => void;
  /** Подпись к фото в alt, например «пельменный аппарат». */
  altLabel?: string;
}

export default function PelmeniProductModal({ item, onClose, onLead, altLabel = "пельменный аппарат" }: Props) {
  const [slide, setSlide] = useState(0);
  const boxRef = useRef<HTMLDivElement>(null);
  const returnFocus = useRef<HTMLElement | null>(null);

  useEffect(() => { setSlide(0); }, [item?.id]);

  useEffect(() => {
    if (!item) return;
    returnFocus.current = document.activeElement as HTMLElement;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") { onClose(); return; }
      if (e.key !== "Tab" || !boxRef.current) return;
      const nodes = boxRef.current.querySelectorAll<HTMLElement>('a[href], button:not([disabled]), input, textarea, select');
      if (!nodes.length) return;
      const first = nodes[0];
      const last = nodes[nodes.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
      returnFocus.current?.focus();
    };
  }, [item, onClose]);

  if (!item) return null;

  const pics = item.pictures || [];
  const params = visibleParams(item);
  const description = sanitizeDescription(item.description);
  const move = (dir: number) => pics.length > 1 && setSlide((slide + dir + pics.length) % pics.length);

  return (
    <div className="fixed inset-0 z-[100] flex items-start sm:items-center justify-center p-4 bg-black/50 backdrop-blur-sm overflow-y-auto" onClick={onClose}>
      <div
        ref={boxRef}
        role="dialog"
        aria-modal="true"
        aria-label={item.name}
        className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl my-4 sm:my-0 max-h-[92vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 z-10 flex items-start justify-between gap-4 px-6 py-4 bg-white/95 backdrop-blur border-b border-border">
          <h3 className="font-display font-bold text-lg sm:text-xl text-foreground leading-snug">{item.name}</h3>
          <button onClick={onClose} aria-label="Закрыть" className="w-9 h-9 flex-shrink-0 flex items-center justify-center rounded-xl hover:bg-secondary transition-colors">
            <Icon name="X" size={18} className="text-muted-foreground" />
          </button>
        </div>

        <div className="p-6 grid md:grid-cols-2 gap-6">
          <div>
            <div className="relative bg-gray-100 rounded-2xl overflow-hidden aspect-square">
              {pics[slide] && (
                <img src={pics[slide]} alt={`${item.name} — ${altLabel}`} referrerPolicy="no-referrer" className="w-full h-full object-contain" />
              )}
              {pics.length > 1 && (
                <>
                  <button onClick={() => move(-1)} aria-label="Предыдущее фото" className="absolute left-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 hover:bg-white rounded-full flex items-center justify-center shadow-sm">
                    <Icon name="ChevronLeft" size={20} className="text-foreground" />
                  </button>
                  <button onClick={() => move(1)} aria-label="Следующее фото" className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 hover:bg-white rounded-full flex items-center justify-center shadow-sm">
                    <Icon name="ChevronRight" size={20} className="text-foreground" />
                  </button>
                </>
              )}
            </div>
            {pics.length > 1 && (
              <div className="flex gap-2 mt-3 flex-wrap">
                {pics.slice(0, 8).map((p, i) => (
                  <button
                    key={i}
                    onClick={() => setSlide(i)}
                    aria-label={`Фото ${i + 1}`}
                    className={`w-14 h-14 rounded-lg overflow-hidden border-2 transition-all ${i === slide ? "border-primary" : "border-border"}`}
                  >
                    <img src={p} alt="" referrerPolicy="no-referrer" className="w-full h-full object-contain bg-gray-100" />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div>
            <p className={`text-2xl font-black mb-5 ${item.price ? "text-primary" : "text-muted-foreground"}`}>{formatPrice(item)}</p>

            {params.length > 0 && (
              <div className="mb-5">
                <p className="font-bold text-sm text-foreground mb-3">Характеристики</p>
                <div className="space-y-1.5">
                  {params.map((p, i) => (
                    <div key={i} className="flex gap-3 text-sm border-b border-border/60 pb-1.5">
                      <span className="text-muted-foreground flex-1">{p.name}</span>
                      <span className="text-foreground font-medium text-right">{p.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <button onClick={() => onLead(item)} className="w-full py-4 bg-orange-500 hover:bg-orange-600 text-white rounded-xl font-bold text-base transition-all shadow-sm">
              Получить консультацию
            </button>
          </div>
        </div>

        {description && (
          <div className="px-6 pb-8">
            <p className="font-bold text-sm text-foreground mb-3">Описание</p>
            <div
              className="text-sm text-muted-foreground leading-relaxed space-y-2 [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5 [&_strong]:text-foreground [&_h3]:font-bold [&_h3]:text-foreground [&_h3]:mt-4 [&_h4]:font-bold [&_h4]:text-foreground"
              dangerouslySetInnerHTML={{ __html: description }}
            />
          </div>
        )}
      </div>
    </div>
  );
}
