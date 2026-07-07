import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Icon from "@/components/ui/icon";
import { useCart } from "@/hooks/useCart";

const CATALOG_FN = "https://functions.poehali.dev/19e6f517-e766-4ac9-b359-029df68cf0fa";

const MAIN_LINKS = [
  { href: "/massagers", label: "Массажёры мяса" },
  { href: "/injector", label: "Инъекторы" },
  { href: "/slicers", label: "Слайсеры" },
  { href: "/ldogenerator", label: "Льдогенераторы" },
];

interface CatLink { slug: string; title: string; }

let _catCache: CatLink[] | null = null;

/**
 * Единый хедер сайта с выпадающим меню "Оборудование":
 * сначала основные разделы, затем все категории из фида.
 * onGetKp — открыть форму КП (если задан), иначе ведёт на #contacts.
 */
export default function SiteHeader({ onGetKp, subtitle = "Оборудование для мясо и рыбопереработки" }: { onGetKp?: () => void; subtitle?: string }) {
  const navigate = useNavigate();
  const { totalCount } = useCart();
  const [menuOpen, setMenuOpen] = useState(false);
  const [equipOpen, setEquipOpen] = useState(false);
  const [cats, setCats] = useState<CatLink[]>(_catCache || []);

  useEffect(() => {
    if (_catCache) return;
    fetch(`${CATALOG_FN}?mode=categories`)
      .then((r) => r.json())
      .then((d) => {
        const list: CatLink[] = (d.categories || []).map((c: { slug: string; title: string }) => ({ slug: c.slug, title: c.title }));
        _catCache = list;
        setCats(list);
      })
      .catch(() => { /* ignore */ });
  }, []);

  const navLinks = [
    { href: "#catalog", label: "Каталог" },
    { href: "#technosib", label: "О компании" },
    { href: "#advantages", label: "Преимущества" },
    { href: "#delivery", label: "Доставка" },
    { href: "#contacts", label: "Контакты" },
  ];

  const kpBtn = onGetKp
    ? <button onClick={onGetKp} className="hidden sm:block px-5 py-2 text-sm font-semibold bg-primary text-white rounded-full hover:bg-primary/90 transition-all shadow-sm whitespace-nowrap">Получить КП</button>
    : <a href="#contacts" className="hidden sm:block px-5 py-2 text-sm font-semibold bg-primary text-white rounded-full hover:bg-primary/90 transition-all shadow-sm whitespace-nowrap">Получить КП</a>;

  return (
    <header className="fixed top-0 w-full bg-white/90 backdrop-blur-xl border-b border-border z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3">
        <div className="flex items-center gap-3 sm:gap-6">
          <div className="flex items-center gap-3 sm:gap-6 flex-shrink-0 min-w-0">
            <a href="/" className="flex flex-col min-w-0">
              <img src="https://cdn.poehali.dev/files/b643e2cd-1c2b-461b-b32b-4053b1b9e72b.jpg" alt="Техносиб" className="h-8 sm:h-9 w-auto object-contain" />
              <span className="text-xs text-muted-foreground leading-tight mt-0.5 hidden sm:block">{subtitle}</span>
            </a>
            <nav className="hidden lg:flex gap-6 text-sm font-semibold items-center">
              <div className="relative" onMouseEnter={() => setEquipOpen(true)} onMouseLeave={() => setEquipOpen(false)}>
                <button className="flex items-center gap-1 text-foreground hover:text-primary transition-colors whitespace-nowrap">
                  Оборудование
                  <Icon name="ChevronDown" size={14} className={`transition-transform ${equipOpen ? "rotate-180" : ""}`} />
                </button>
                {equipOpen && (
                  <div className="absolute top-full left-0 pt-2 z-50">
                    <div className="bg-white border border-border rounded-xl shadow-lg py-2 min-w-[260px] max-h-[70vh] overflow-y-auto">
                      {MAIN_LINKS.map((l) => (
                        <a key={l.href} href={l.href} className="block px-4 py-2.5 text-sm font-semibold text-foreground hover:text-primary hover:bg-primary/5 transition-colors" onClick={() => setEquipOpen(false)}>{l.label}</a>
                      ))}
                      {cats.length > 0 && <div className="my-1.5 border-t border-border" />}
                      {cats.map((c) => (
                        <a key={c.slug} href={`/${c.slug}`} className="block px-4 py-2 text-sm text-muted-foreground hover:text-primary hover:bg-primary/5 transition-colors" onClick={() => setEquipOpen(false)}>{c.title}</a>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              {navLinks.map((l) => (
                <a key={l.href} href={l.href} className="text-foreground hover:text-primary transition-colors whitespace-nowrap">{l.label}</a>
              ))}
            </nav>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 ml-auto flex-shrink-0">
            <a href="tel:88005059124" className="hidden sm:flex items-center gap-1.5 text-sm font-bold text-foreground hover:text-primary transition-colors whitespace-nowrap">
              <Icon name="Phone" size={14} className="text-primary" />8 800 505-91-24
            </a>
            <button onClick={() => navigate("/cart")} className="relative flex items-center justify-center w-10 h-10 sm:w-auto sm:h-auto sm:px-4 sm:py-2 sm:gap-2 border-2 border-primary/30 text-primary rounded-full text-sm font-semibold hover:border-primary hover:bg-primary/5 transition-all">
              <Icon name="ShoppingCart" size={16} />
              <span className="hidden sm:inline">Корзина</span>
              {totalCount > 0 && <span className="absolute -top-2 -right-2 w-5 h-5 bg-primary text-white text-xs font-bold rounded-full flex items-center justify-center">{totalCount}</span>}
            </button>
            {kpBtn}
            <button className="lg:hidden p-2 text-muted-foreground flex-shrink-0" onClick={() => setMenuOpen(!menuOpen)}><Icon name={menuOpen ? "X" : "Menu"} size={22} /></button>
          </div>
        </div>
        <div className="sm:hidden mt-1.5">
          <a href="tel:88005059124" className="flex items-center gap-1 text-sm font-bold text-primary hover:text-primary/80 transition-colors">
            <Icon name="Phone" size={14} className="flex-shrink-0" />8 800 505-91-24
          </a>
        </div>
      </div>
      {menuOpen && (
        <div className="lg:hidden border-t border-border bg-white px-6 py-4 flex flex-col gap-3 max-h-[75vh] overflow-y-auto">
          <div className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Оборудование</div>
          {MAIN_LINKS.map((l) => (
            <a key={l.href} href={l.href} className="text-sm font-semibold text-foreground hover:text-primary transition-colors pl-3 border-l-2 border-primary/20" onClick={() => setMenuOpen(false)}>{l.label}</a>
          ))}
          {cats.map((c) => (
            <a key={c.slug} href={`/${c.slug}`} className="text-sm text-muted-foreground hover:text-primary transition-colors pl-3 border-l-2 border-border" onClick={() => setMenuOpen(false)}>{c.title}</a>
          ))}
          <div className="h-px bg-border my-1" />
          {navLinks.map((l) => (
            <a key={l.href} href={l.href} className="text-sm text-muted-foreground hover:text-primary transition-colors" onClick={() => setMenuOpen(false)}>{l.label}</a>
          ))}
        </div>
      )}
    </header>
  );
}
