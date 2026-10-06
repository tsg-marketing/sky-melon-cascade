import { useEffect, useMemo, useState } from "react";
import Icon from "@/components/ui/icon";
import { CatalogItem } from "@/lib/catalog";
import { sectionAnim } from "@/components/pelmeni/shared";
import PelmeniQuickForm from "@/components/pelmeni/PelmeniQuickForm";
import PelmeniProductCard from "@/components/pelmeni/PelmeniProductCard";
import { SAN_ALT, SAN_CATEGORIES } from "./data";

type SortMode = "price-asc" | "price-desc";

interface Props {
  visible: boolean;
  items: CatalogItem[];
  loading: boolean;
  sending: boolean;
  category: string;
  onCategory: (id: string) => void;
  onQuickLead: (name: string, phone: string, email: string) => void;
  onCardLead: (item: CatalogItem) => void;
  onDetails: (item: CatalogItem) => void;
  onEmptyLead: () => void;
  onZoom: (photos: string[], index: number) => void;
}

const selectCls = "px-4 py-2.5 bg-white border border-border rounded-xl text-sm text-foreground focus:outline-none focus:border-primary transition-colors";

export default function SanCatalog({ visible, items, loading, sending, category, onCategory, onQuickLead, onCardLead, onDetails, onEmptyLead, onZoom }: Props) {
  const [sort, setSort] = useState<SortMode>("price-asc");
  const [slides, setSlides] = useState<Record<string, number>>({});
  const [limit, setLimit] = useState(9);

  useEffect(() => { setLimit(9); }, [category]);

  const counts = useMemo(() => {
    const c: Record<string, number> = { all: items.length };
    items.forEach((i) => { c[i.category_id] = (c[i.category_id] || 0) + 1; });
    return c;
  }, [items]);

  const filtered = useMemo(() => {
    const list = category === "all" ? items : items.filter((i) => i.category_id === category);
    const dir = sort === "price-asc" ? 1 : -1;
    return [...list].sort((a, b) => {
      if (a.price === null && b.price === null) return 0;
      if (a.price === null) return 1;
      if (b.price === null) return -1;
      return (a.price - b.price) * dir;
    });
  }, [items, category, sort]);

  return (
    <section id="catalog" className="py-12 px-6 bg-secondary scroll-mt-32">
      <div className="max-w-7xl mx-auto">
        <div className={`text-center mb-10 ${sectionAnim(visible)}`}>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-display font-black tracking-tight text-foreground leading-tight">
            Каталог санитарного оборудования
          </h2>
          <p className="text-lg text-muted-foreground mt-4 max-w-3xl mx-auto">
            {items.length > 0 ? `${items.length} моделей` : "Модели"} для санпропускников, моечных и цехов обвалки. Цены обновляются автоматически.
          </p>
        </div>

        {loading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="bg-white border border-border rounded-2xl overflow-hidden animate-pulse">
                <div className="aspect-square bg-gray-200" />
                <div className="p-5 space-y-3">
                  <div className="h-4 bg-gray-200 rounded w-3/4" />
                  <div className="h-5 bg-gray-200 rounded w-1/3" />
                  <div className="h-11 bg-gray-200 rounded-xl" />
                </div>
              </div>
            ))}
          </div>
        ) : items.length === 0 ? (
          <div className="p-10 bg-white border border-border rounded-2xl text-center max-w-2xl mx-auto">
            <Icon name="PackageSearch" fallback="Package" size={40} className="text-primary mx-auto mb-4" />
            <p className="text-lg text-foreground leading-relaxed mb-6">
              Каталог обновляется. Оставьте заявку — пришлём актуальный список моделей и цены в течение рабочего дня.
            </p>
            <button onClick={onEmptyLead} className="px-8 py-3.5 bg-orange-500 hover:bg-orange-600 text-white rounded-xl font-bold transition-all shadow-sm">
              Оставить заявку
            </button>
          </div>
        ) : (
          <>
            <div className="mb-6 space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                {SAN_CATEGORIES.filter((c) => c.id === "all" || counts[c.id]).map((c) => (
                  <button
                    key={c.id}
                    onClick={() => onCategory(c.id)}
                    className={`w-full flex items-center justify-center gap-2 px-4 py-4 sm:py-5 rounded-2xl text-base sm:text-lg font-bold transition-all border ${category === c.id ? "bg-primary text-white border-primary" : "bg-white text-foreground border-border hover:border-primary/40"}`}
                  >
                    <Icon name={c.icon} fallback="Circle" size={22} className="flex-shrink-0" />
                    {c.label}
                    <span className={`text-sm font-semibold ${category === c.id ? "text-white/75" : "text-muted-foreground"}`}>{counts[c.id] || 0}</span>
                  </button>
                ))}
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <select aria-label="Сортировка" value={sort} onChange={(e) => setSort(e.target.value as SortMode)} className={selectCls}>
                  <option value="price-asc">Сначала дешевле</option>
                  <option value="price-desc">Сначала дороже</option>
                </select>
                <p className="text-sm text-muted-foreground ml-auto">Показано {filtered.length} из {items.length} моделей</p>
              </div>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtered.slice(0, limit).map((item) => (
                <PelmeniProductCard
                  key={item.id}
                  item={item}
                  altLabel={SAN_ALT[item.category_id] || "санитарное оборудование"}
                  bigParams
                  slide={slides[item.id] || 0}
                  onSlide={(index) => setSlides((prev) => ({ ...prev, [item.id]: index }))}
                  onZoom={onZoom}
                  onLead={() => onCardLead(item)}
                  onDetails={() => onDetails(item)}
                />
              ))}
            </div>
            {filtered.length > limit && (
              <div className="text-center mt-8">
                <button onClick={() => setLimit(limit + 9)} className="px-8 py-3.5 bg-white border-2 border-primary text-primary rounded-xl font-bold hover:bg-primary/5 transition-all">
                  Показать ещё {Math.min(9, filtered.length - limit)} из {filtered.length - limit}
                </button>
              </div>
            )}
          </>
        )}

        <div className="mt-12">
          <PelmeniQuickForm sending={sending} onSubmit={onQuickLead} />
        </div>
      </div>
    </section>
  );
}
