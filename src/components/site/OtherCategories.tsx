import { useEffect, useState } from "react";
import Icon from "@/components/ui/icon";

const CATALOG_FN = "https://functions.poehali.dev/19e6f517-e766-4ac9-b359-029df68cf0fa";

interface Group {
  subcategory_id: string;
  subcategory: string;
  parent: string;
  slug: string;
}

let cache: Group[] | null = null;

// Категории-лендинги: у них отдельные страницы вне фида — фиксируем правильные URL и названия
const LANDING_SLUGS: Record<string, { slug: string; name: string }> = {
  "229": { slug: "massagers", name: "Массажёры мяса" },
  "223": { slug: "injector", name: "Инъекторы для мяса" },
  "230": { slug: "slicers", name: "Слайсеры" },
  "228": { slug: "ldogenerator", name: "Льдогенераторы" },
};

export default function OtherCategories({ currentSlug }: { currentSlug?: string }) {
  const [groups, setGroups] = useState<Group[]>(cache || []);

  useEffect(() => {
    if (cache) return;
    fetch(`${CATALOG_FN}?categories=1`)
      .then((r) => r.json())
      .then((d) => {
        const list: Group[] = (d.groups || []).map((g: Group) => {
          const override = LANDING_SLUGS[g.subcategory_id];
          return {
            subcategory_id: g.subcategory_id,
            subcategory: override ? override.name : g.subcategory,
            parent: g.parent,
            slug: override ? override.slug : g.slug,
          };
        });
        cache = list;
        setGroups(list);
      })
      .catch(() => { /* ignore */ });
  }, []);

  const others = groups.filter((g) => g.slug && g.slug !== currentSlug);
  if (others.length === 0) return null;

  return (
    <section className="py-16 px-4 sm:px-6 bg-white">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-10">
          <h2 className="text-3xl lg:text-4xl font-display font-black text-foreground mb-3">
            Посмотрите другое наше оборудование для мясо- и рыбопереработки
          </h2>
          <p className="text-muted-foreground text-lg">Более 30 категорий оборудования от производителя</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {others.map((g) => (
            <a
              key={g.subcategory_id}
              href={`/${g.slug}`}
              className="group flex items-center gap-3 bg-background border border-border rounded-xl px-4 py-3.5 hover:border-primary hover:bg-primary/5 transition-all"
            >
              <span className="w-9 h-9 flex-shrink-0 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                <Icon name="Package" size={18} className="text-primary" />
              </span>
              <span className="flex-1 font-semibold text-sm text-foreground leading-snug">{g.subcategory}</span>
              <Icon name="ChevronRight" size={16} className="text-muted-foreground group-hover:text-primary transition-colors flex-shrink-0" />
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}