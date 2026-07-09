import { useEffect, useMemo, useState } from "react";
import { useParams, Link } from "react-router-dom";
import Icon from "@/components/ui/icon";
import ThankYouModal from "@/components/ThankYouModal";
import { useLeadForm } from "@/hooks/useLeadForm";
import {
  CATEGORIES,
  CatalogData,
  CatalogItem,
  fetchCatalog,
  itemSlug,
  productPath,
  pickListingParams,
} from "@/lib/catalog";
import SiteHeader from "@/components/site/SiteHeader";
import NotFoundPage from "@/pages/NotFoundPage";
import { setPageMeta } from "@/lib/seo";

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
  const { sendLead, sending, thankYouOpen, setThankYouOpen } = useLeadForm();

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

  const related = useMemo(() => {
    if (!item) return [];
    const others = items.filter((it) => it.id !== item.id);
    if (item.price) {
      const min = item.price * 0.8;
      const max = item.price * 1.2;
      const inRange = others.filter((it) => it.price != null && it.price >= min && it.price <= max);
      if (inRange.length > 0) {
        return inRange
          .sort((a, b) => Math.abs((a.price || 0) - item.price!) - Math.abs((b.price || 0) - item.price!))
          .slice(0, 5);
      }
    }
    return others.slice(0, 5);
  }, [items, item]);

  useEffect(() => { setSlide(0); }, [slug]);

  useEffect(() => {
    if (!item) return;
    const url = `https://meatmassagers.ru${productPath(categorySlug, item)}`;
    const rawDesc = (item.description || "").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
    const desc = rawDesc
      ? rawDesc.slice(0, 300)
      : `${item.name}${item.price_display ? ` — ${item.price_display}` : ""}. Поставка, подбор и сервис оборудования Техно-Сиб по всей России.`;
    setPageMeta({
      title: `${item.name} — купить, цена, характеристики | Техно-Сиб`,
      description: desc,
      keywords: `${item.name}, ${category.singular}, купить ${category.singular}, ${category.title.toLowerCase()}, цена`,
      url,
      ogTitle: `${item.name} | Техно-Сиб`,
      ogDescription: desc,
      ogType: "product",
      image: item.pictures[0] || undefined,
    });

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

  // Товар не найден — отдаём 404
  if (!loading && !item) {
    return <NotFoundPage />;
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteHeader current={category.path} />

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

                {/* Характеристики + цена */}
                <div>
                  <h2 className="text-2xl font-display font-black text-foreground mb-4">Характеристики</h2>
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-3 py-3.5 border-b border-border/60">
                      <span className="text-base text-muted-foreground flex-1">Цена</span>
                      {item.price_display ? (
                        <span className="text-2xl font-display font-black text-primary text-right">{item.price_display}</span>
                      ) : (
                        <span className="text-base font-bold text-foreground text-right">По запросу</span>
                      )}
                    </div>
                    {item.all_params.filter((p) => p.name !== "GUID").map((p, pi) => (
                      <div key={pi} className="flex items-start gap-3 py-3.5 border-b border-border/60 last:border-0">
                        <span className="text-base text-muted-foreground flex-1">{p.name}</span>
                        <span className="text-base font-bold text-foreground text-right">{p.value}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* ФОС */}
                <div className="space-y-5 lg:sticky lg:top-24">
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
                    {item.video && (
                      <button onClick={() => setVideoOpen(true)} className="w-full py-3 mt-4 bg-white/20 hover:bg-white/30 text-white rounded-xl text-sm font-semibold transition-all flex items-center justify-center gap-2"><Icon name="Play" size={16} />Смотреть видео</button>
                    )}
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
                        <div className="p-4 flex flex-col flex-1">
                          <h3 className="font-bold text-lg text-foreground leading-snug mb-1 group-hover:text-primary transition-colors">{it.name}</h3>
                          {it.price_display && <p className="text-primary font-black mb-3">{it.price_display}</p>}
                          {pickListingParams(it.all_params).length > 0 && (
                            <div className="mt-auto space-y-1">
                              {pickListingParams(it.all_params).map((p, pi) => (
                                <div key={pi} className="flex items-baseline gap-2 text-sm">
                                  <span className="text-muted-foreground flex-shrink-0">{p.name}</span>
                                  <span className="flex-1 border-b border-dotted border-border/70" />
                                  <span className="font-semibold text-foreground text-right break-words">{p.value}</span>
                                </div>
                              ))}
                            </div>
                          )}
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