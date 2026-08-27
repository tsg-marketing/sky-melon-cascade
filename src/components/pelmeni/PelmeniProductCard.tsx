import Icon from "@/components/ui/icon";
import { CatalogItem } from "@/lib/catalog";
import { cardParams, formatPrice } from "@/lib/pelmeni";

interface Props {
  item: CatalogItem;
  slide: number;
  onSlide: (index: number) => void;
  onZoom: (photos: string[], index: number) => void;
  onLead: () => void;
  onDetails: () => void;
}

export default function PelmeniProductCard({ item, slide, onSlide, onZoom, onLead, onDetails }: Props) {
  const pics = (item.pictures || []).slice(0, 8);
  const current = pics.length ? pics[Math.min(slide, pics.length - 1)] : "";
  const params = cardParams(item, 5);
  const alt = `${item.name} — пельменный аппарат`;

  const move = (dir: number) => {
    if (pics.length < 2) return;
    onSlide((slide + dir + pics.length) % pics.length);
  };

  return (
    <div id={item.slug || `product-${item.id}`} className="bg-white border border-border rounded-2xl overflow-hidden shadow-sm hover:shadow-xl hover:border-primary/40 transition-all flex flex-col scroll-mt-32">
      <div className="relative bg-gray-100 aspect-square overflow-hidden group">
        {current && (
          <img
            src={current}
            alt={alt}
            loading="lazy"
            referrerPolicy="no-referrer"
            onClick={() => onZoom(pics, slide)}
            className="w-full h-full object-contain cursor-zoom-in"
          />
        )}

        {pics.length > 1 && (
          <>
            <button
              onClick={() => move(-1)}
              aria-label="Предыдущее фото"
              className="absolute left-2 top-1/2 -translate-y-1/2 w-9 h-9 bg-white/90 hover:bg-white rounded-full flex items-center justify-center shadow-sm transition-all opacity-0 group-hover:opacity-100 focus:opacity-100"
            >
              <Icon name="ChevronLeft" size={18} className="text-foreground" />
            </button>
            <button
              onClick={() => move(1)}
              aria-label="Следующее фото"
              className="absolute right-2 top-1/2 -translate-y-1/2 w-9 h-9 bg-white/90 hover:bg-white rounded-full flex items-center justify-center shadow-sm transition-all opacity-0 group-hover:opacity-100 focus:opacity-100"
            >
              <Icon name="ChevronRight" size={18} className="text-foreground" />
            </button>
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5">
              {pics.map((_, pi) => (
                <button
                  key={pi}
                  onClick={() => onSlide(pi)}
                  aria-label={`Фото ${pi + 1} из ${pics.length}`}
                  className={`h-1.5 rounded-full transition-all ${pi === slide ? "bg-primary w-4" : "bg-white/80 w-1.5"}`}
                />
              ))}
            </div>
          </>
        )}
      </div>

      <div className="flex-1 p-5 flex flex-col">
        <h3 className="font-bold text-base text-foreground mb-2 leading-snug">{item.name}</h3>

        <p className={`text-lg font-bold mb-3 ${item.price ? "text-primary" : "text-muted-foreground"}`}>
          {formatPrice(item)}
        </p>

        {params.length > 0 && (
          <div className="text-xs text-muted-foreground space-y-1 mb-5">
            {params.map((p, i) => (
              <div key={i} className="flex gap-1.5">
                <span className="flex-shrink-0">{p.name}:</span>
                <span className="text-foreground font-medium">{p.value}</span>
              </div>
            ))}
          </div>
        )}

        <div className="mt-auto space-y-2">
          <button onClick={onLead} className="w-full py-3.5 bg-orange-500 hover:bg-orange-600 text-white rounded-xl text-base font-bold transition-all shadow-sm">
            Получить консультацию
          </button>
          <button onClick={onDetails} className="w-full py-3 border border-border hover:border-primary/40 text-foreground rounded-xl text-sm font-bold transition-all">
            Смотреть подробнее
          </button>
        </div>
      </div>
    </div>
  );
}