import { useMemo, useState } from "react";
import Icon from "@/components/ui/icon";
import { CatalogItem } from "@/lib/catalog";
import { SPEED_FILTERS, KIND_FILTERS, SpeedKey, KindKey, matchSpeed, matchKind, availableKinds, productivitySht } from "@/lib/pelmeni";
import { sectionAnim } from "./shared";
import PelmeniQuickForm from "./PelmeniQuickForm";
import PelmeniProductCard from "./PelmeniProductCard";

type SortMode = "price-asc" | "price-desc" | "productivity";

interface Props {
  visible: boolean;
  items: CatalogItem[];
  loading: boolean;
  sending: boolean;
  onQuickLead: (name: string, phone: string, email: string) => void;
  onCardLead: (item: CatalogItem) => void;
  onDetails: (item: CatalogItem) => void;
  onEmptyLead: () => void;
  onZoom: (photos: string[], index: number) => void;
}

const selectCls = "px-4 py-2.5 bg-white border border-border rounded-xl text-sm text-foreground focus:outline-none focus:border-primary transition-colors";

export default function PelmeniCatalog({ visible, items, loading, sending, onQuickLead, onCardLead, onDetails, onEmptyLead, onZoom }: Props) {
  const [speed, setSpeed] = useState<SpeedKey>("all");
  const [brand, setBrand] = useState("all");
  const [kind, setKind] = useState<KindKey>("all");
  const [sort, setSort] = useState<SortMode>("price-asc");
  const [slides, setSlides] = useState<Record<string, number>>({});

  const brands = useMemo(() => {
    const set = new Set<string>();
    items.forEach((i) => { if (i.brand) set.add(i.brand); });
    return Array.from(set).sort((a, b) => a.localeCompare(b, "ru"));
  }, [items]);

  const kinds = useMemo(() => {
    const keys = availableKinds(items);
    return keys.length > 2 ? KIND_FILTERS.filter((k) => keys.includes(k.key)) : [];
  }, [items]);

  const filtered = useMemo(() => {
    let list = items.filter((i) => matchSpeed(i, speed) && matchKind(i, kind));
    if (brand !== "all") list = list.filter((i) => i.brand === brand);

    const byPrice = (a: CatalogItem, b: CatalogItem, dir: number) => {
      if (a.price === null && b.price === null) return 0;
      if (a.price === null) return 1;
      if (b.price === null) return -1;
      return (a.price - b.price) * dir;
    };

    if (sort === "price-asc") list = [...list].sort((a, b) => byPrice(a, b, 1));
    else if (sort === "price-desc") list = [...list].sort((a, b) => byPrice(a, b, -1));
    else list = [...list].sort((a, b) => (productivitySht(b) ?? -1) - (productivitySht(a) ?? -1));

    return list;
  }, [items, speed, brand, kind, sort]);

  const resetFilters = () => { setSpeed("all"); setBrand("all"); setKind("all"); };

  return (
    <section id="catalog" className="py-12 px-6 bg-secondary scroll-mt-32">
      <div className="max-w-7xl mx-auto">
        <div className={`text-center mb-10 ${sectionAnim(visible)}`}>
          <span className="text-xs font-semibold tracking-widest text-primary uppercase">Каталог</span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-display font-black tracking-tight mt-3 text-foreground leading-tight">
            Каталог пельменных автоматов
          </h2>
          <p className="text-lg text-muted-foreground mt-4 max-w-3xl mx-auto">
            {items.length > 0 ? `${items.length} моделей` : "Модели"} от настольных аппаратов до промышленных линий. Цены и наличие обновляются автоматически.
          </p>
        </div>

        <PelmeniQuickForm sending={sending} onSubmit={onQuickLead} />

        {loading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="bg-white border border-border rounded-2xl overflow-hidden animate-pulse">
                <div className="aspect-square bg-gray-200" />
                <div className="p-5 space-y-3">
                  <div className="h-4 bg-gray-200 rounded w-3/4" />
                  <div className="h-5 bg-gray-200 rounded w-1/3" />
                  <div className="h-3 bg-gray-200 rounded w-full" />
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
              <div className="flex flex-wrap gap-2">
                {SPEED_FILTERS.map((f) => (
                  <button
                    key={f.key}
                    onClick={() => setSpeed(f.key)}
                    className={`px-4 py-2.5 rounded-xl text-sm font-semibold transition-all border ${speed === f.key ? "bg-primary text-white border-primary" : "bg-white text-foreground border-border hover:border-primary/40"}`}
                  >
                    {f.label}
                    {f.hint && <span className={`block text-xs font-normal ${speed === f.key ? "text-white/75" : "text-muted-foreground"}`}>{f.hint}</span>}
                  </button>
                ))}
              </div>

              {kinds.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {kinds.map((k) => (
                    <button
                      key={k.key}
                      onClick={() => setKind(k.key)}
                      className={`px-4 py-2 rounded-full text-sm font-medium transition-all border ${kind === k.key ? "bg-primary/10 text-primary border-primary" : "bg-white text-muted-foreground border-border hover:border-primary/40"}`}
                    >
                      {k.label}
                    </button>
                  ))}
                </div>
              )}

              <div className="flex flex-wrap items-center gap-3">
                {brands.length > 0 && (
                  <select aria-label="Бренд" value={brand} onChange={(e) => setBrand(e.target.value)} className={selectCls}>
                    <option value="all">Все бренды</option>
                    {brands.map((b) => <option key={b} value={b}>{b}</option>)}
                  </select>
                )}
                <select aria-label="Сортировка" value={sort} onChange={(e) => setSort(e.target.value as SortMode)} className={selectCls}>
                  <option value="price-asc">Сначала дешевле</option>
                  <option value="price-desc">Сначала дороже</option>
                  <option value="productivity">По производительности</option>
                </select>
                <p className="text-sm text-muted-foreground ml-auto">
                  Показано {filtered.length} из {items.length} моделей
                </p>
              </div>
            </div>

            {filtered.length === 0 ? (
              <div className="p-10 bg-white border border-border rounded-2xl text-center max-w-2xl mx-auto">
                <p className="text-base text-foreground leading-relaxed mb-6">
                  Под эти параметры моделей не нашлось. Сбросьте фильтр или оставьте заявку — подберём вручную.
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <button onClick={resetFilters} className="px-6 py-3.5 border border-border hover:border-primary/40 text-foreground rounded-xl font-bold transition-all">
                    Сбросить фильтр
                  </button>
                  <button onClick={onEmptyLead} className="px-8 py-3.5 bg-orange-500 hover:bg-orange-600 text-white rounded-xl font-bold transition-all shadow-sm">
                    Оставить заявку
                  </button>
                </div>
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filtered.map((item) => (
                  <PelmeniProductCard
                    key={item.id}
                    item={item}
                    slide={slides[item.id] || 0}
                    onSlide={(index) => setSlides((prev) => ({ ...prev, [item.id]: index }))}
                    onZoom={onZoom}
                    onLead={() => onCardLead(item)}
                    onDetails={() => onDetails(item)}
                  />
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
}
