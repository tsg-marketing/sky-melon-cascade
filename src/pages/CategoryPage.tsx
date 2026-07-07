import { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Icon from "@/components/ui/icon";
import ThankYouModal from "@/components/ThankYouModal";
import { useLeadForm } from "@/hooks/useLeadForm";
import { useCart } from "@/hooks/useCart";
import SiteHeader from "@/components/site/SiteHeader";
import SiteFooter from "@/components/site/SiteFooter";
import HomeSections from "@/components/site/HomeSections";

const CATALOG_FN = "https://functions.poehali.dev/19e6f517-e766-4ac9-b359-029df68cf0fa";
const inputCls = "w-full px-4 py-3 bg-background border border-border rounded-xl text-foreground placeholder-muted-foreground text-sm focus:outline-none focus:border-primary transition-colors";
const inputError = "w-full px-4 py-3 bg-background border border-red-400 rounded-xl text-foreground placeholder-muted-foreground text-sm focus:outline-none focus:border-red-500 transition-colors";

interface FeedItem {
  id: string;
  slug: string;
  name: string;
  price: number | null;
  price_display: string | null;
  picture: string | null;
  pictures: string[];
  params: { name: string; value: string }[];
  video?: string | null;
  description?: string;
  vendor: string | null;
  url: string | null;
}
interface CategoryInfo {
  id: string;
  slug: string;
  title: string;
  parent: string;
  parent_id: string;
  count: number;
  banner_image: string | null;
  banner_product?: FeedItem | null;
}

function isValidPhone(v: string): boolean {
  const digits = v.replace(/\D/g, "");
  if (/^[78]\d{10}$/.test(digits)) return true;
  if (/^375\d{9}$/.test(digits)) return true;
  return false;
}
function formatPhone(_prev: string, next: string): string {
  let raw = next.replace(/[^\d+]/g, "");
  if (raw.startsWith("8")) raw = "7" + raw.slice(1);
  if (/^[9]/.test(raw)) raw = "7" + raw;
  raw = raw.replace(/\+/g, "");
  const isBy = raw.startsWith("375");
  raw = raw.slice(0, isBy ? 12 : 11);
  if (!raw) return "";
  return "+" + raw;
}

const ConsentCheckbox = ({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) => (
  <label className="flex items-start gap-2 cursor-pointer select-none">
    <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="mt-0.5 w-4 h-4 flex-shrink-0 accent-orange-500 cursor-pointer" />
    <span className="text-xs text-muted-foreground leading-relaxed">
      Отправляя форму, я соглашаюсь с{" "}
      <a href="https://t-sib.ru/assets/politika_t-sib16.05.25.pdf" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">политикой обработки персональных данных</a>
      {" "}и даю{" "}
      <a href="https://t-sib.ru/assets/soglasie_t-sib16.05.25.pdf" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">согласие на обработку персональных данных</a>.
    </span>
  </label>
);

const CategoryPage = () => {
  const { slug, productSlug } = useParams();
  const navigate = useNavigate();
  const { sendLead, sending, thankYouOpen, setThankYouOpen } = useLeadForm();
  const { addItem, removeItem, getQuantity } = useCart();

  const [category, setCategory] = useState<CategoryInfo | null>(null);
  const [items, setItems] = useState<FeedItem[]>([]);
  const [loading, setLoading] = useState(true);

  const [lightbox, setLightbox] = useState<{ pics: string[]; index: number } | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);

  // Modal ФОС
  const [modalOpen, setModalOpen] = useState(false);
  const [modalTitle, setModalTitle] = useState("Получить предложение");
  const [modalProduct, setModalProduct] = useState("");
  const [modalName, setModalName] = useState("");
  const [modalPhone, setModalPhone] = useState("");
  const [modalPhoneTouched, setModalPhoneTouched] = useState(false);
  const [modalConsent, setModalConsent] = useState(false);

  // Product page inquiry
  const [pName, setPName] = useState("");
  const [pPhone, setPPhone] = useState("");
  const [pPhoneTouched, setPPhoneTouched] = useState(false);
  const [pConsent, setPConsent] = useState(false);
  const [prodSlide, setProdSlide] = useState(0);

  useEffect(() => {
    let alive = true;
    const key = `cat_${slug}`;
    let hasCache = false;
    // Мгновенно показываем из кэша, если есть
    try {
      const raw = sessionStorage.getItem(key);
      if (raw) {
        const cached = JSON.parse(raw) as { ts: number; category: CategoryInfo; items: FeedItem[] };
        if (Date.now() - cached.ts < 10 * 60 * 1000) {
          setCategory(cached.category); setItems(cached.items || []); setLoading(false); hasCache = true;
        }
      }
    } catch { /* ignore */ }
    if (!hasCache) setLoading(true);

    fetch(`${CATALOG_FN}?category=${encodeURIComponent(slug || "")}`)
      .then((r) => r.json())
      .then((d) => {
        if (!alive) return;
        setCategory(d.category); setItems(d.items || []); setLoading(false);
        try { sessionStorage.setItem(key, JSON.stringify({ ts: Date.now(), category: d.category, items: d.items || [] })); } catch { /* ignore */ }
      })
      .catch(() => { if (alive) setLoading(false); });
    return () => { alive = false; };
  }, [slug]);

  const product = useMemo(
    () => (productSlug ? items.find((it) => it.slug === productSlug) || null : null),
    [items, productSlug]
  );

  useEffect(() => { setProdSlide(0); window.scrollTo(0, 0); }, [productSlug]);

  useEffect(() => {
    if (category) {
      document.title = product
        ? `${product.name} — купить | Техносиб`
        : `${category.title} — купить, цены | Техносиб`;
    }
  }, [category, product]);

  const openModal = (title: string, prod = "") => { setModalTitle(title); setModalProduct(prod); setModalOpen(true); };
  const cartPayload = (it: FeedItem) => ({ id: it.id, name: it.name, price: it.price, price_display: it.price_display, picture: (it.pictures && it.pictures[0]) || it.picture || "" });

  const submitModal = () => {
    if (modalName.trim() && isValidPhone(modalPhone) && modalConsent && !sending) {
      sendLead({ name: modalName, phone: modalPhone, product: modalProduct, topic: category?.title, formType: "modal" });
      setModalOpen(false); setModalName(""); setModalPhone(""); setModalPhoneTouched(false); setModalConsent(false);
    }
  };
  const submitProduct = () => {
    if (isValidPhone(pPhone) && pConsent && !sending && product) {
      sendLead({ name: pName || "—", phone: pPhone, product: product.name, topic: category?.title, formType: "inquiry" });
      setPName(""); setPPhone(""); setPPhoneTouched(false); setPConsent(false);
    }
  };

  const pPhoneValid = isValidPhone(pPhone);
  const related = product ? items.filter((it) => it.id !== product.id).slice(0, 4) : [];

  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteHeader current={slug ? `/${slug}` : undefined} onGetKp={() => openModal("Получить предложение")} />

      <main className="pt-24 sm:pt-28 pb-16 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto">
          {/* Хлебные крошки */}
          <nav className="flex items-center flex-wrap gap-2 text-sm text-muted-foreground mb-6">
            <a href="/" className="hover:text-primary transition-colors">Главная</a>
            <Icon name="ChevronRight" size={14} />
            {category && (
              <>
                <a href={`/${category.slug}`} className="hover:text-primary transition-colors">{category.title}</a>
                {product && (<><Icon name="ChevronRight" size={14} /><span className="text-foreground truncate max-w-[200px] sm:max-w-none">{product.name}</span></>)}
              </>
            )}
          </nav>

          {loading && (
            <div className="text-center py-32 text-muted-foreground"><Icon name="Loader" size={40} className="mx-auto mb-4 animate-spin opacity-40" /><p>Загружаем каталог...</p></div>
          )}

          {!loading && !category && (
            <div className="text-center py-24">
              <Icon name="PackageX" size={56} className="mx-auto mb-5 text-muted-foreground opacity-30" />
              <h1 className="text-2xl font-display font-black text-foreground mb-3">Раздел не найден</h1>
              <a href="/" className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-full font-semibold hover:bg-primary/90 transition-all"><Icon name="ArrowLeft" size={18} />На главную</a>
            </div>
          )}

          {/* СТРАНИЦА ТОВАРА */}
          {!loading && category && productSlug && (
            product ? (
              <>
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-display font-black text-foreground leading-tight mb-8">{product.name}</h1>
                <div className="grid lg:grid-cols-3 gap-6 lg:gap-8 items-start">
                  {/* Фото */}
                  <div className="bg-white border border-border rounded-3xl p-5 sm:p-6 shadow-sm">
                    <div className="relative bg-gray-50 rounded-2xl overflow-hidden aspect-square flex items-center justify-center">
                      {product.pictures.length ? (
                        <img src={product.pictures[prodSlide]} alt={product.name} referrerPolicy="no-referrer" onClick={() => setLightbox({ pics: product.pictures, index: prodSlide })} className="w-full h-full object-contain p-4 cursor-zoom-in" />
                      ) : (<Icon name="ImageOff" size={48} className="text-muted-foreground opacity-30" />)}
                      {product.pictures.length > 1 && (<>
                        <button onClick={() => setProdSlide((s) => (s - 1 + product.pictures.length) % product.pictures.length)} className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-white/90 hover:bg-white rounded-full shadow flex items-center justify-center"><Icon name="ChevronLeft" size={18} /></button>
                        <button onClick={() => setProdSlide((s) => (s + 1) % product.pictures.length)} className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-white/90 hover:bg-white rounded-full shadow flex items-center justify-center"><Icon name="ChevronRight" size={18} /></button>
                      </>)}
                    </div>
                    {product.pictures.length > 1 && (
                      <div className="flex gap-2 overflow-x-auto pt-3">
                        {product.pictures.map((pic, pi) => (
                          <button key={pi} onClick={() => setProdSlide(pi)} className={`flex-shrink-0 w-14 h-14 rounded-lg overflow-hidden border-2 transition-all ${pi === prodSlide ? "border-primary" : "border-transparent opacity-60 hover:opacity-100"}`}><img src={pic} alt="" referrerPolicy="no-referrer" className="w-full h-full object-contain bg-white p-1" /></button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Характеристики + цена */}
                  <div>
                    <h2 className="text-2xl font-display font-black text-foreground mb-4">Характеристики</h2>
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-3 py-3.5 border-b border-border/60">
                        <span className="text-base text-muted-foreground flex-1">Цена</span>
                        {product.price_display ? (
                          <span className="text-2xl font-display font-black text-primary text-right">{product.price_display}</span>
                        ) : (<span className="text-base font-bold text-foreground text-right">По запросу</span>)}
                      </div>
                      {product.params.map((p, pi) => (
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
                        <input type="text" placeholder="Ваше имя" value={pName} onChange={(e) => setPName(e.target.value)} className="w-full px-4 py-3.5 bg-white border-2 border-transparent rounded-xl text-foreground placeholder-muted-foreground text-base focus:outline-none focus:border-slate-800/40 transition-colors" />
                        <div>
                          <input type="tel" placeholder="+7 (___) ___-__-__" value={pPhone} onChange={(e) => setPPhone(formatPhone(pPhone, e.target.value))} onBlur={() => setPPhoneTouched(true)} className={`w-full px-4 py-3.5 bg-white rounded-xl text-foreground placeholder-muted-foreground text-base focus:outline-none border-2 transition-colors ${pPhoneTouched && !pPhoneValid ? "border-red-500" : "border-transparent focus:border-slate-800/40"}`} />
                          {pPhoneTouched && !pPhoneValid && <p className="text-xs text-white font-medium mt-1">Введите номер России, Казахстана или Беларуси</p>}
                        </div>
                        <label className="flex items-start gap-2 cursor-pointer select-none">
                          <input type="checkbox" checked={pConsent} onChange={(e) => setPConsent(e.target.checked)} className="mt-0.5 w-4 h-4 flex-shrink-0 accent-slate-800 cursor-pointer" />
                          <span className="text-xs text-orange-50 leading-relaxed">
                            Отправляя форму, я соглашаюсь с{" "}
                            <a href="https://t-sib.ru/assets/politika_t-sib16.05.25.pdf" target="_blank" rel="noopener noreferrer" className="text-white font-medium hover:underline">политикой обработки персональных данных</a>
                            {" "}и даю{" "}
                            <a href="https://t-sib.ru/assets/soglasie_t-sib16.05.25.pdf" target="_blank" rel="noopener noreferrer" className="text-white font-medium hover:underline">согласие на обработку персональных данных</a>.
                          </span>
                        </label>
                        <button onClick={submitProduct} disabled={!pPhoneValid || !pConsent || sending} className="w-full py-4 bg-slate-800 hover:bg-slate-900 text-white rounded-xl font-bold text-base transition-all shadow-md disabled:opacity-40">{sending ? "Отправляем..." : "Получить консультацию"}</button>
                      </div>
                      <div className="flex gap-3 mt-4">
                        {product.video && (
                          <button onClick={() => setVideoUrl(product.video || null)} className="flex-1 py-3 bg-white/20 hover:bg-white/30 text-white rounded-xl text-sm font-semibold transition-all flex items-center justify-center gap-2"><Icon name="Play" size={16} />Смотреть видео</button>
                        )}
                        {getQuantity(product.id) > 0 ? (
                          <div className="flex items-center gap-1 border-2 border-white/60 rounded-xl px-2 flex-1 justify-center">
                            <button onClick={() => removeItem(product.id)} className="w-9 h-9 flex items-center justify-center text-white font-bold text-lg hover:bg-white/15 rounded-lg transition-colors">−</button>
                            <span className="w-6 text-center font-bold text-white">{getQuantity(product.id)}</span>
                            <button onClick={() => addItem(cartPayload(product))} className="w-9 h-9 flex items-center justify-center text-white font-bold text-lg hover:bg-white/15 rounded-lg transition-colors">+</button>
                          </div>
                        ) : (
                          <button onClick={() => addItem(cartPayload(product))} className="flex-1 py-3 border-2 border-white/50 text-white rounded-xl text-sm font-semibold hover:bg-white/15 transition-all flex items-center justify-center gap-2"><Icon name="ShoppingCart" size={16} />В корзину</button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {product.description && (
                  <div className="mt-10 bg-white border border-border rounded-3xl p-6 sm:p-10 shadow-sm">
                    <h2 className="text-2xl font-display font-black text-foreground mb-5">Описание</h2>
                    <div className="prose prose-sm sm:prose max-w-none text-muted-foreground text-base leading-relaxed [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5 [&_li]:my-1 [&_p]:my-2 [&_strong]:font-semibold [&_strong]:text-foreground [&_a]:text-primary [&_a]:underline" dangerouslySetInnerHTML={{ __html: product.description }} />
                  </div>
                )}

                {related.length > 0 && (
                  <div className="mt-12">
                    <h2 className="text-2xl font-display font-black text-foreground mb-6">Другие {category.title.toLowerCase()}</h2>
                    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
                      {related.map((it) => (
                        <button key={it.id} onClick={() => navigate(`/${category.slug}/${it.slug}`)} className="text-left bg-white border border-border rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-shadow">
                          <div className="bg-gray-50 aspect-square flex items-center justify-center p-4">
                            {it.picture ? <img src={it.picture} alt={it.name} referrerPolicy="no-referrer" className="w-full h-full object-contain" /> : <Icon name="ImageOff" size={36} className="text-muted-foreground opacity-30" />}
                          </div>
                          <div className="p-4">
                            <h4 className="font-bold text-sm text-foreground leading-snug mb-2 line-clamp-2 min-h-[2.6em]">{it.name}</h4>
                            {it.price_display ? <p className="text-lg font-display font-black text-primary">{it.price_display}</p> : <p className="text-sm font-semibold text-muted-foreground">Цена по запросу</p>}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <div className="mt-10 text-center">
                  <a href={`/${category.slug}`} className="inline-flex items-center gap-2 px-6 py-3 border-2 border-primary/30 text-primary rounded-full font-semibold hover:border-primary hover:bg-primary/5 transition-all"><Icon name="ArrowLeft" size={18} />Все {category.title.toLowerCase()}</a>
                </div>
              </>
            ) : (
              <div className="text-center py-24">
                <Icon name="PackageX" size={56} className="mx-auto mb-5 text-muted-foreground opacity-30" />
                <h1 className="text-2xl font-display font-black text-foreground mb-3">Товар не найден</h1>
                <a href={`/${category.slug}`} className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-full font-semibold hover:bg-primary/90 transition-all"><Icon name="ArrowLeft" size={18} />Все {category.title.toLowerCase()}</a>
              </div>
            )
          )}

          {/* СТРАНИЦА КАТЕГОРИИ */}
          {!loading && category && !productSlug && (
            <>
              {/* Баннер */}
              <section className="grid lg:grid-cols-2 gap-10 items-center mb-14 bg-gradient-to-br from-primary/5 to-background rounded-3xl p-6 sm:p-10">
                <div>
                  <h1 className="text-5xl sm:text-6xl lg:text-7xl font-display font-black text-foreground leading-[1.05] mb-6">{category.title}</h1>
                  <p className="text-xl sm:text-2xl text-muted-foreground leading-snug mb-9">{category.count} моделей в наличии и под заказ. Поставка и пусконаладка по всей России.</p>
                  <div className="flex flex-col sm:flex-row gap-4">
                    <button onClick={() => openModal("Получить предложение", category.title)} style={{ backgroundColor: "#F97316" }} className="px-9 py-5 text-white rounded-full font-bold text-lg hover:brightness-95 transition-all shadow-xl shadow-orange-500/30">Получить предложение</button>
                    <a href="#cat-list" className="px-9 py-5 border-2 border-orange-500 text-orange-600 bg-orange-50 rounded-full font-bold text-lg hover:bg-orange-100 transition-all text-center">Смотреть каталог</a>
                  </div>
                </div>
                <div className="relative">
                  {category.banner_image ? (
                    <img src={category.banner_image} alt={category.title} referrerPolicy="no-referrer" className="w-full h-full object-contain aspect-[4/3]" />
                  ) : (
                    <div className="aspect-[4/3] bg-gray-50 rounded-2xl flex items-center justify-center"><Icon name="Image" size={56} className="text-muted-foreground opacity-30" /></div>
                  )}
                </div>
              </section>

              <div id="cat-list">
                <h2 className="text-2xl sm:text-3xl font-display font-black text-foreground mb-6">Каталог: {category.title}</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                  {items.map((it) => (
                    <ProductCard
                      key={it.id}
                      item={it}
                      qty={getQuantity(it.id)}
                      onOpen={() => navigate(`/${category.slug}/${it.slug}`)}
                      onInquiry={() => openModal("Получить предложение", it.name)}
                      onAdd={() => addItem(cartPayload(it))}
                      onRemove={() => removeItem(it.id)}
                      onZoom={(pics, index) => setLightbox({ pics, index })}
                      onVideo={it.video ? () => setVideoUrl(it.video || null) : undefined}
                    />
                  ))}
                </div>
                <div className="text-center mt-10">
                  <button onClick={() => openModal("Оставить заявку", `Весь ассортимент — ${category.title}`)} style={{ backgroundColor: "#F97316" }} className="px-8 py-4 text-white rounded-full font-bold text-lg hover:brightness-95 transition-all shadow-lg shadow-orange-500/30">Оставить заявку</button>
                </div>
              </div>
            </>
          )}
        </div>
      </main>

      {/* Общие блоки сайта — на листинге категории (после каталога) */}
      {!loading && category && !productSlug && <HomeSections topic={category.title} />}

      <SiteFooter onGetKp={() => openModal("Получить предложение")} />

      {/* МОДАЛ ФОС */}
      {modalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm" onClick={() => setModalOpen(false)}>
          <div className="bg-white rounded-3xl shadow-2xl p-8 w-full max-w-md" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="font-display font-bold text-2xl text-foreground">{modalTitle}</h3>
                {modalProduct && <p className="text-sm text-primary mt-1">{modalProduct}</p>}
              </div>
              <button onClick={() => setModalOpen(false)} className="w-10 h-10 flex items-center justify-center rounded-xl bg-background hover:bg-primary/10 transition-colors"><Icon name="X" size={20} className="text-muted-foreground" /></button>
            </div>
            <div className="space-y-4">
              <input type="text" placeholder="Имя *" value={modalName} onChange={e => setModalName(e.target.value)} className={inputCls} />
              <div>
                <input type="tel" placeholder="+7 (___) ___-__-__" value={modalPhone} onChange={e => setModalPhone(formatPhone(modalPhone, e.target.value))} onBlur={() => setModalPhoneTouched(true)} className={modalPhoneTouched && !isValidPhone(modalPhone) ? inputError : inputCls} />
                {modalPhoneTouched && !isValidPhone(modalPhone) && <p className="text-xs text-red-500 mt-1">Введите номер России, Казахстана или Беларуси</p>}
              </div>
              <ConsentCheckbox checked={modalConsent} onChange={setModalConsent} />
              <button onClick={submitModal} disabled={!modalName.trim() || !isValidPhone(modalPhone) || !modalConsent || sending} style={{ backgroundColor: "#D98E5C" }} className="w-full py-4 text-white rounded-xl font-bold text-base hover:brightness-95 transition-all shadow-sm disabled:opacity-40">{sending ? "Отправляем..." : "Отправить"}</button>
            </div>
          </div>
        </div>
      )}

      {/* ЛАЙТБОКС */}
      {lightbox && lightbox.pics.length > 0 && (
        <div className="fixed inset-0 z-[200] bg-black/90 flex items-center justify-center" onClick={() => setLightbox(null)}>
          <button onClick={() => setLightbox(null)} className="absolute top-4 right-4 z-10 w-12 h-12 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition-colors"><Icon name="X" size={24} className="text-white" /></button>
          {lightbox.pics.length > 1 && (<>
            <button onClick={(e) => { e.stopPropagation(); setLightbox((lb) => lb ? { ...lb, index: (lb.index - 1 + lb.pics.length) % lb.pics.length } : lb); }} className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition-colors"><Icon name="ChevronLeft" size={28} className="text-white" /></button>
            <button onClick={(e) => { e.stopPropagation(); setLightbox((lb) => lb ? { ...lb, index: (lb.index + 1) % lb.pics.length } : lb); }} className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition-colors"><Icon name="ChevronRight" size={28} className="text-white" /></button>
          </>)}
          <img src={lightbox.pics[lightbox.index]} alt="" referrerPolicy="no-referrer" onClick={(e) => e.stopPropagation()} className="max-w-[90vw] max-h-[85vh] object-contain" />
        </div>
      )}

      {/* ВИДЕО */}
      {videoUrl && (
        <div className="fixed inset-0 z-[200] bg-black/90 flex items-center justify-center p-4" onClick={() => setVideoUrl(null)}>
          <button onClick={() => setVideoUrl(null)} className="absolute top-4 right-4 z-10 w-12 h-12 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition-colors"><Icon name="X" size={24} className="text-white" /></button>
          <div className="w-full max-w-4xl aspect-video" onClick={(e) => e.stopPropagation()}>
            <iframe src={videoUrl} title="Видео" className="w-full h-full rounded-xl" frameBorder="0" allow="autoplay; encrypted-media; fullscreen" allowFullScreen />
          </div>
        </div>
      )}

      <ThankYouModal open={thankYouOpen} onClose={() => setThankYouOpen(false)} />
    </div>
  );
};

const ProductCard = ({ item, qty, onOpen, onInquiry, onAdd, onRemove, onZoom, onVideo }: {
  item: FeedItem;
  qty: number;
  onOpen: () => void;
  onInquiry: () => void;
  onAdd: () => void;
  onRemove: () => void;
  onZoom: (pics: string[], index: number) => void;
  onVideo?: () => void;
}) => {
  const [slide, setSlide] = useState(0);
  const pics = item.pictures && item.pictures.length ? item.pictures : (item.picture ? [item.picture] : []);
  const count = pics.length;
  return (
    <div className="bg-white border border-border rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-shadow flex flex-col">
      <div className="relative bg-gray-50 aspect-square flex items-center justify-center p-4 group">
        {count ? (
          <img src={pics[slide]} alt={item.name} referrerPolicy="no-referrer" onClick={() => onZoom(pics, slide)} className="w-full h-full object-contain cursor-zoom-in" />
        ) : (<Icon name="ImageOff" size={40} className="text-muted-foreground opacity-30" />)}
        {count > 1 && (<>
          <span className="absolute top-2 right-2 bg-slate-700/80 text-white text-[11px] font-semibold px-2 py-0.5 rounded-md">{slide + 1} / {count}</span>
          <button onClick={() => setSlide((s) => (s - 1 + count) % count)} className="absolute left-1 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/80 hover:bg-white rounded-full shadow flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"><Icon name="ChevronLeft" size={16} /></button>
          <button onClick={() => setSlide((s) => (s + 1) % count)} className="absolute right-1 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/80 hover:bg-white rounded-full shadow flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"><Icon name="ChevronRight" size={16} /></button>
          <div className="absolute bottom-2 left-0 right-0 flex justify-center gap-1.5 px-4 overflow-hidden">
            {pics.slice(0, 12).map((_, pi) => (<button key={pi} onClick={() => setSlide(pi)} className={`w-1.5 h-1.5 rounded-full transition-colors ${pi === slide ? "bg-primary" : "bg-slate-300"}`} />))}
          </div>
        </>)}
      </div>
      <div className="p-4 flex flex-col flex-1">
        <h4 onClick={onOpen} className="font-bold text-base text-foreground leading-snug mb-3 line-clamp-2 min-h-[2.6em] cursor-pointer hover:text-primary transition-colors">{item.name}</h4>
        {item.params.length > 0 && (
          <div className="mb-3 space-y-1">
            {item.params.map((p, pi) => (
              <div key={pi} className="flex items-start gap-2 text-xs">
                <span className="text-muted-foreground flex-shrink-0">{p.name}</span>
                <span className="flex-1 border-b border-dotted border-border/60 translate-y-[-3px]" />
                <span className="font-semibold text-foreground text-right">{p.value}</span>
              </div>
            ))}
          </div>
        )}
        <div className="mt-auto">
          {item.price_display ? <p className="text-xl font-display font-black text-primary mb-4">{item.price_display}</p> : <p className="text-base font-semibold text-muted-foreground mb-4">Цена по запросу</p>}
          <div className="flex flex-col gap-2.5">
            {onVideo && (
              <button onClick={onVideo} className="w-full py-2.5 bg-sky-100 text-sky-600 rounded-xl text-sm font-bold hover:bg-sky-200 transition-all flex items-center justify-center gap-2"><Icon name="Play" size={16} />Смотреть видео</button>
            )}
            <button onClick={onOpen} className="w-full py-2.5 bg-orange-100 text-orange-600 rounded-xl text-sm font-bold hover:bg-orange-200 transition-all">Подробнее</button>
            <div className="flex gap-2.5">
              <button onClick={onInquiry} style={{ backgroundColor: "#F97316" }} className="flex-1 py-2.5 text-white rounded-xl text-sm font-bold hover:brightness-95 transition-all shadow-md shadow-orange-500/20">Получить предложение</button>
              {qty > 0 ? (
                <div className="flex items-center gap-1 border-2 border-primary/40 rounded-xl px-1.5 flex-shrink-0">
                  <button onClick={onRemove} className="w-7 h-7 flex items-center justify-center text-primary font-bold text-lg hover:bg-primary/10 rounded-lg transition-colors">−</button>
                  <span className="w-4 text-center font-bold text-primary text-sm">{qty}</span>
                  <button onClick={onAdd} className="w-7 h-7 flex items-center justify-center text-primary font-bold text-lg hover:bg-primary/10 rounded-lg transition-colors">+</button>
                </div>
              ) : (
                <button onClick={onAdd} title="В корзину" className="py-2.5 px-3.5 border-2 border-primary/30 text-primary rounded-xl hover:border-primary hover:bg-primary/5 transition-all flex-shrink-0"><Icon name="ShoppingCart" size={18} /></button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CategoryPage;