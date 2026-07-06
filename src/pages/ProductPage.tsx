import { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import Icon from "@/components/ui/icon";
import ThankYouModal from "@/components/ThankYouModal";
import { useLeadForm } from "@/hooks/useLeadForm";
import { useCart } from "@/hooks/useCart";
import {
  CATEGORIES,
  CatalogData,
  CatalogItem,
  fetchCatalog,
  itemSlug,
  productPath,
} from "@/lib/catalog";

function isValidPhone(v: string): boolean {
  const digits = v.replace(/\D/g, "");
  if (/^[78]\d{10}$/.test(digits)) return true;
  if (/^375\d{9}$/.test(digits)) return true;
  return false;
}
function formatPhone(prev: string, next: string): string {
  let raw = next.replace(/[^\d+]/g, "");
  if (raw.startsWith("8")) raw = "7" + raw.slice(1);
  if (/^[9]/.test(raw)) raw = "7" + raw;
  raw = raw.replace(/\+/g, "");
  const isBy = raw.startsWith("375");
  raw = raw.slice(0, isBy ? 12 : 11);
  if (!raw) return "";
  return "+" + raw;
}

const ProductPage = ({ categorySlug }: { categorySlug: string }) => {
  const category = CATEGORIES[categorySlug];
  const { slug } = useParams();
  const navigate = useNavigate();
  const { sendLead, sending, thankYouOpen, setThankYouOpen } = useLeadForm();
  const { addItem, removeItem, getQuantity, totalCount } = useCart();

  const [data, setData] = useState<CatalogData | null>(null);
  const [loading, setLoading] = useState(true);
  const [slide, setSlide] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [videoOpen, setVideoOpen] = useState(false);

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [phoneTouched, setPhoneTouched] = useState(false);
  const [consent, setConsent] = useState(false);

  useEffect(() => {
    let alive = true;
    setLoading(true);
    fetchCatalog()
      .then((d) => { if (alive) { setData(d); setLoading(false); } })
      .catch(() => { if (alive) setLoading(false); });
    return () => { alive = false; };
  }, []);

  const items: CatalogItem[] = useMemo(
    () => (data ? (data[category.dataKey] as CatalogItem[]) || [] : []),
    [data, category.dataKey]
  );

  const item = useMemo(
    () => items.find((it) => itemSlug(it) === slug),
    [items, slug]
  );

  const related = useMemo(
    () => (item ? items.filter((it) => it.id !== item.id).slice(0, 3) : []),
    [items, item]
  );

  useEffect(() => { setSlide(0); }, [slug]);

  useEffect(() => {
    if (!item) return;
    const url = `https://meatmassagers.ru${productPath(categorySlug, item)}`;
    document.title = `${item.name} — купить, цена, характеристики | Техно-Сиб`;
    const rawDesc = (item.description || "").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
    const desc = rawDesc
      ? rawDesc.slice(0, 300)
      : `${item.name}${item.price_display ? ` — ${item.price_display}` : ""}. Поставка, подбор и сервис оборудования Техно-Сиб по всей России.`;
    const setMeta = (n: string, c: string, prop?: boolean) => {
      const attr = prop ? "property" : "name";
      let el = document.querySelector(`meta[${attr}="${n}"]`);
      if (!el) { el = document.createElement("meta"); el.setAttribute(attr, n); document.head.appendChild(el); }
      el.setAttribute("content", c);
    };
    setMeta("description", desc);
    setMeta("keywords", `${item.name}, ${category.singular}, купить ${category.singular}, ${category.title.toLowerCase()}, цена`);
    setMeta("og:title", `${item.name} | Техно-Сиб`, true);
    setMeta("og:description", desc, true);
    setMeta("og:url", url, true);
    setMeta("og:type", "product", true);
    if (item.pictures[0]) setMeta("og:image", item.pictures[0], true);
    let link = document.querySelector("link[rel='canonical']") as HTMLLinkElement | null;
    if (!link) { link = document.createElement("link"); link.setAttribute("rel", "canonical"); document.head.appendChild(link); }
    link.setAttribute("href", url);

    const ld = document.createElement("script");
    ld.type = "application/ld+json";
    ld.setAttribute("data-product-ld", "true");
    ld.textContent = JSON.stringify({
      "@context": "https://schema.org/",
      "@type": "Product",
      name: item.name,
      image: item.pictures,
      description: desc,
      brand: item.brand ? { "@type": "Brand", name: item.brand } : undefined,
      offers: item.price
        ? { "@type": "Offer", price: item.price, priceCurrency: "RUB", availability: "https://schema.org/InStock", url }
        : undefined,
    });
    document.head.appendChild(ld);

    return () => {
      document.title = "Массажеры и инъекторы от Техносиб";
      const canonical = document.querySelector("link[rel='canonical']");
      if (canonical) canonical.remove();
      document.querySelectorAll("script[data-product-ld]").forEach((s) => s.remove());
    };
  }, [item, categorySlug, category]);

  const phoneValid = isValidPhone(phone);
  const submit = () => {
    if (!phoneValid || !consent || sending || !item) return;
    sendLead({ name: name || "—", phone, product: item.name, topic: category.topic, formType: "inquiry" });
    setName(""); setPhone(""); setPhoneTouched(false); setConsent(false);
  };

  const equipmentLinks = [
    { href: "/", label: "Мясомассажеры" },
    { href: "/injector", label: "Инъекторы" },
    { href: "/slicers", label: "Слайсеры" },
    { href: "/ldogenerator", label: "Льдогенераторы" },
  ];

  const qty = item ? getQuantity(item.id) : 0;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="fixed top-0 w-full bg-white/90 backdrop-blur-xl border-b border-border z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center gap-3 sm:gap-6">
          <a href="/"><img src="https://cdn.poehali.dev/files/b643e2cd-1c2b-461b-b32b-4053b1b9e72b.jpg" alt="Техносиб" className="h-8 sm:h-9 w-auto object-contain" /></a>
          <nav className="hidden lg:flex gap-6 text-sm font-semibold items-center">
            {equipmentLinks.map((l) => (<a key={l.href} href={l.href} className="text-foreground hover:text-primary transition-colors whitespace-nowrap">{l.label}</a>))}
          </nav>
          <div className="flex items-center gap-2 sm:gap-3 ml-auto flex-shrink-0">
            <a href="tel:88005059124" className="hidden md:flex items-center gap-1.5 text-sm font-bold text-foreground hover:text-primary transition-colors whitespace-nowrap"><Icon name="Phone" size={14} className="text-primary" />8 800 505-91-24</a>
            <button onClick={() => navigate("/cart")} className="relative flex items-center justify-center w-10 h-10 sm:w-auto sm:h-auto sm:px-4 sm:py-2 sm:gap-2 border-2 border-primary/30 text-primary rounded-full text-sm font-semibold hover:border-primary hover:bg-primary/5 transition-all">
              <Icon name="ShoppingCart" size={16} /><span className="hidden sm:inline">Корзина</span>
              {totalCount > 0 && (<span className="absolute -top-2 -right-2 w-5 h-5 bg-primary text-white text-xs font-bold rounded-full flex items-center justify-center">{totalCount}</span>)}
            </button>
          </div>
        </div>
      </header>

      <main className="pt-24 sm:pt-28 pb-16 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto">
          <nav className="flex items-center flex-wrap gap-2 text-sm text-muted-foreground mb-6">
            <a href="/" className="hover:text-primary transition-colors">Главная</a>
            <Icon name="ChevronRight" size={14} />
            <a href={category.categoryLink} className="hover:text-primary transition-colors">{category.title}</a>
            {item && (<><Icon name="ChevronRight" size={14} /><span className="text-foreground truncate max-w-[200px] sm:max-w-none">{item.name}</span></>)}
          </nav>

          {loading && (
            <div className="text-center py-32 text-muted-foreground"><Icon name="Loader" size={40} className="mx-auto mb-4 animate-spin opacity-40" /><p>Загружаем товар...</p></div>
          )}

          {!loading && !item && (
            <div className="text-center py-24">
              <Icon name="PackageX" size={56} className="mx-auto mb-5 text-muted-foreground opacity-30" />
              <h1 className="text-2xl font-display font-black text-foreground mb-3">Товар не найден</h1>
              <p className="text-muted-foreground mb-6">Возможно, он снят с производства или ссылка устарела.</p>
              <a href={category.categoryLink} className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-full font-semibold hover:bg-primary/90 transition-all">
                <Icon name="ArrowLeft" size={18} />Все {category.title.toLowerCase()}
              </a>
            </div>
          )}

          {!loading && item && (
            <>
              {item.brand && item.brand.toLowerCase() !== "hualian" && (
                <p className="text-sm font-bold text-primary uppercase tracking-wider mb-1">{item.brand}</p>
              )}
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-display font-black text-foreground leading-tight mb-8">{item.name}</h1>

              <div className="grid lg:grid-cols-3 gap-6 lg:gap-8 items-start">
                {/* Фото */}
                <div className="bg-white border border-border rounded-3xl p-5 sm:p-6 shadow-sm">
                  <div className="relative bg-gray-50 rounded-2xl overflow-hidden" style={{ aspectRatio: "1/1" }}>
                    <img src={item.pictures[slide]} alt={item.name} referrerPolicy="no-referrer" className="w-full h-full object-contain p-4 cursor-zoom-in" onClick={() => { setLightboxIndex(slide); setLightboxOpen(true); }} />
                    {item.pictures.length > 1 && (<>
                      <button onClick={() => setSlide((s) => (s - 1 + item.pictures.length) % item.pictures.length)} className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-white/90 hover:bg-white rounded-full shadow flex items-center justify-center"><Icon name="ChevronLeft" size={18} className="text-foreground" /></button>
                      <button onClick={() => setSlide((s) => (s + 1) % item.pictures.length)} className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-white/90 hover:bg-white rounded-full shadow flex items-center justify-center"><Icon name="ChevronRight" size={18} className="text-foreground" /></button>
                    </>)}
                  </div>
                  {item.pictures.length > 1 && (
                    <div className="flex gap-2 overflow-x-auto pt-4">
                      {item.pictures.map((pic, pi) => (<button key={pi} onClick={() => setSlide(pi)} className={`flex-shrink-0 w-16 h-16 rounded-xl overflow-hidden border-2 transition-all ${pi === slide ? "border-primary shadow-md" : "border-transparent opacity-60 hover:opacity-100"}`}><img src={pic} alt="" referrerPolicy="no-referrer" className="w-full h-full object-contain bg-white p-1" /></button>))}
                    </div>
                  )}
                </div>

                {/* Характеристики */}
                <div>
                  {item.all_params.filter((p) => p.name !== "GUID").length > 0 ? (
                    <div>
                      <h2 className="text-2xl font-display font-black text-foreground mb-4">Характеристики</h2>
                      <div className="space-y-0.5">
                        {item.all_params.filter((p) => p.name !== "GUID").map((p, pi) => (
                          <div key={pi} className="flex items-start gap-3 py-3.5 border-b border-border/60 last:border-0">
                            <span className="text-base text-muted-foreground flex-1">{p.name}</span>
                            <span className="text-base font-bold text-foreground text-right">{p.value}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="text-muted-foreground">Характеристики уточняйте у менеджера.</div>
                  )}
                </div>

                {/* Цена + ФОС */}
                <div className="space-y-5 lg:sticky lg:top-24">
                  <div className="bg-white border border-border rounded-2xl p-6 shadow-sm">
                    {item.price_display ? (
                      <span className="text-4xl font-display font-black text-primary">{item.price_display}</span>
                    ) : (
                      <>
                        <span className="text-2xl font-display font-black text-foreground">Цена по запросу</span>
                        <p className="text-sm text-muted-foreground mt-1">Оставьте заявку — пришлём актуальную цену</p>
                      </>
                    )}
                  </div>

                  <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl p-6 shadow-xl shadow-orange-500/25">
                    <h2 className="font-display font-black text-2xl text-white mb-1">Получить предложение</h2>
                    <p className="text-sm text-orange-50 mb-5">Оставьте контакты — технолог свяжется в течение 2 часов и рассчитает стоимость</p>
                    <div className="space-y-3">
                      <input type="text" placeholder="Ваше имя" value={name} onChange={(e) => setName(e.target.value)} className="w-full px-4 py-3.5 bg-white border-2 border-transparent rounded-xl text-foreground placeholder-muted-foreground text-base focus:outline-none focus:border-slate-800/40 transition-colors" />
                      <div>
                        <input type="tel" placeholder="+7 (___) ___-__-__" value={phone} onChange={(e) => setPhone(formatPhone(phone, e.target.value))} onBlur={() => setPhoneTouched(true)} className={`w-full px-4 py-3.5 bg-white rounded-xl text-foreground placeholder-muted-foreground text-base focus:outline-none border-2 transition-colors ${phoneTouched && !phoneValid ? "border-red-500" : "border-transparent focus:border-slate-800/40"}`} />
                        {phoneTouched && !phoneValid && <p className="text-xs text-white font-medium mt-1">Введите номер России, Казахстана или Беларуси</p>}
                      </div>
                      <label className="flex items-start gap-2 cursor-pointer select-none">
                        <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} className="mt-0.5 w-4 h-4 flex-shrink-0 accent-slate-800 cursor-pointer" />
                        <span className="text-xs text-orange-50 leading-relaxed">
                          Отправляя форму, я соглашаюсь с{" "}
                          <a href="https://t-sib.ru/assets/politika_t-sib16.05.25.pdf" target="_blank" rel="noopener noreferrer" className="text-white font-medium hover:underline">политикой обработки персональных данных</a>
                          {" "}и даю{" "}
                          <a href="https://t-sib.ru/assets/soglasie_t-sib16.05.25.pdf" target="_blank" rel="noopener noreferrer" className="text-white font-medium hover:underline">согласие на обработку персональных данных</a>.
                        </span>
                      </label>
                      <button onClick={submit} disabled={!phoneValid || !consent || sending} className="w-full py-4 bg-slate-800 hover:bg-slate-900 text-white rounded-xl font-bold text-base transition-all shadow-md disabled:opacity-40">{sending ? "Отправляем..." : "Получить консультацию"}</button>
                    </div>
                    <div className="flex gap-3 mt-4">
                      {item.video && (<button onClick={() => setVideoOpen(true)} className="flex-1 py-3 bg-white/20 hover:bg-white/30 text-white rounded-xl text-sm font-semibold transition-all flex items-center justify-center gap-2"><Icon name="Play" size={16} />Видео</button>)}
                      {qty > 0 ? (
                        <div className="flex items-center gap-1 border-2 border-white/60 rounded-xl px-2">
                          <button onClick={() => removeItem(item.id)} className="w-9 h-9 flex items-center justify-center text-white font-bold text-lg hover:bg-white/15 rounded-lg transition-colors">−</button>
                          <span className="w-6 text-center font-bold text-white">{qty}</span>
                          <button onClick={() => addItem({ id: item.id, name: item.name, price: item.price, price_display: item.price_display, picture: item.pictures[0] })} className="w-9 h-9 flex items-center justify-center text-white font-bold text-lg hover:bg-white/15 rounded-lg transition-colors">+</button>
                        </div>
                      ) : (
                        <button onClick={() => addItem({ id: item.id, name: item.name, price: item.price, price_display: item.price_display, picture: item.pictures[0] })} className="flex-1 py-3 border-2 border-white/50 text-white rounded-xl text-sm font-semibold hover:bg-white/15 transition-all flex items-center justify-center gap-2"><Icon name="ShoppingCart" size={16} />В корзину</button>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Описание ниже */}
              {item.description && (
                <div className="mt-10 bg-white border border-border rounded-3xl p-6 sm:p-10 shadow-sm">
                  <h2 className="text-2xl font-display font-black text-foreground mb-5">Описание</h2>
                  <div className="prose prose-sm sm:prose max-w-none text-muted-foreground text-base leading-relaxed [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5 [&_li]:my-1 [&_p]:my-2 [&_strong]:font-semibold [&_strong]:text-foreground [&_a]:text-primary [&_a]:underline" dangerouslySetInnerHTML={{ __html: item.description }} />
                </div>
              )}

              {/* Похожие товары */}
              {related.length > 0 && (
                <div className="mt-12">
                  <h2 className="text-2xl font-display font-black text-foreground mb-6">Другие {category.title.toLowerCase()}</h2>
                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {related.map((it) => (
                      <Link key={it.id} to={productPath(categorySlug, it)} className="bg-white border border-border rounded-2xl overflow-hidden shadow-sm hover:shadow-xl hover:border-primary/40 transition-all flex flex-col group">
                        <div className="relative bg-gray-50" style={{ aspectRatio: "4/3" }}>
                          <img src={it.pictures[0]} alt={it.name} referrerPolicy="no-referrer" loading="lazy" className="w-full h-full object-contain p-4 group-hover:scale-105 transition-transform duration-500" />
                        </div>
                        <div className="p-4">
                          <h3 className="font-bold text-lg text-foreground leading-snug mb-1 group-hover:text-primary transition-colors">{it.name}</h3>
                          {it.price_display && <p className="text-primary font-black">{it.price_display}</p>}
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              <div className="mt-10 text-center">
                <a href={category.categoryLink} className="inline-flex items-center gap-2 px-6 py-3 border-2 border-primary/30 text-primary rounded-full font-semibold hover:border-primary hover:bg-primary/5 transition-all">
                  <Icon name="ArrowLeft" size={18} />Все {category.title.toLowerCase()}
                </a>
              </div>
            </>
          )}
        </div>
      </main>

      {item && videoOpen && item.video && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm" onClick={() => setVideoOpen(false)}>
          <button onClick={() => setVideoOpen(false)} className="absolute top-5 right-5 w-11 h-11 bg-white/15 hover:bg-white/25 rounded-full flex items-center justify-center transition-all"><Icon name="X" size={22} className="text-white" /></button>
          <div className="relative w-full max-w-4xl" style={{ aspectRatio: "16/9" }} onClick={(e) => e.stopPropagation()}>
            <iframe src={item.video.includes("?") ? `${item.video}&autoplay=1` : `${item.video}?autoplay=1`} title="Видео" allow="autoplay; fullscreen" allowFullScreen className="w-full h-full rounded-2xl" frameBorder="0" />
          </div>
        </div>
      )}

      {item && lightboxOpen && (
        <div className="fixed inset-0 z-[200] bg-black/90 flex items-center justify-center" onClick={() => setLightboxOpen(false)}>
          <button onClick={() => setLightboxOpen(false)} className="absolute top-4 right-4 z-10 w-12 h-12 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition-colors"><Icon name="X" size={24} className="text-white" /></button>
          <div className="relative w-full h-full flex items-center justify-center p-4" onClick={(e) => e.stopPropagation()}>
            <img src={item.pictures[lightboxIndex]} alt="" className="max-w-full max-h-full object-contain" />
            {item.pictures.length > 1 && (<>
              <button onClick={() => setLightboxIndex((i) => (i - 1 + item.pictures.length) % item.pictures.length)} className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition-colors"><Icon name="ChevronLeft" size={24} className="text-white" /></button>
              <button onClick={() => setLightboxIndex((i) => (i + 1) % item.pictures.length)} className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition-colors"><Icon name="ChevronRight" size={24} className="text-white" /></button>
            </>)}
          </div>
        </div>
      )}

      <ThankYouModal open={thankYouOpen} onClose={() => setThankYouOpen(false)} />
    </div>
  );
};

export default ProductPage;