import { useEffect, useState } from "react";
import Icon from "@/components/ui/icon";
import ThankYouModal from "@/components/ThankYouModal";
import { useLeadForm } from "@/hooks/useLeadForm";
import { useCart } from "@/hooks/useCart";
import { pickListingParams } from "@/lib/catalog";
import SiteHeader from "@/components/site/SiteHeader";
import SiteFooter from "@/components/site/SiteFooter";
import HomeSections from "@/components/site/HomeSections";

const HOME_CATALOG_URL = "https://functions.poehali.dev/19e6f517-e766-4ac9-b359-029df68cf0fa";
const HERO_IMG = "https://cdn.poehali.dev/projects/63874bed-e293-4b07-975b-a3b344891b91/bucket/ad6dcf2b-75be-4c10-b179-c8c18d5fb7f9.png";

const inputCls = "w-full px-4 py-3 bg-background border border-border rounded-xl text-foreground placeholder-muted-foreground text-sm focus:outline-none focus:border-primary transition-colors";
const inputError = "w-full px-4 py-3 bg-background border border-red-400 rounded-xl text-foreground placeholder-muted-foreground text-sm focus:outline-none focus:border-red-500 transition-colors";

interface FeedItem {
  id: string;
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
interface FeedGroup {
  subcategory_id: string;
  subcategory: string;
  parent_id: string;
  parent: string;
  slug: string;
  items: FeedItem[];
}

const LANDING_LINKS: Record<string, string> = {
  "229": "/massagers",
  "223": "/injector",
  "230": "/slicers",
  "228": "/ldogenerator",
};
function categoryHref(g: FeedGroup): string {
  return LANDING_LINKS[g.subcategory_id] || `/${g.slug}`;
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

const HERO_BULLETS = [
  "21 категория, более 1000 моделей оборудования",
  "Оборудование по ценам заводов-изготовителей от ведущих Европейских, Азиатских и Российских производителей",
  "Оборудование на любые производства — от ресторанов до крупных рыбокомбинатов",
  "Доставка и пусконаладка по всей России",
];

const Index = () => {
  const { sendLead, sending, thankYouOpen, setThankYouOpen } = useLeadForm();
  const { addItem, removeItem, getQuantity } = useCart();

  // Lightbox (просмотр фото)
  const [lightbox, setLightbox] = useState<{ pics: string[]; index: number } | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);

  // Catalog feed
  const [groups, setGroups] = useState<FeedGroup[]>([]);
  const [catalogLoading, setCatalogLoading] = useState(true);

  // Detail modal (Подробнее)
  const [detailItem, setDetailItem] = useState<FeedItem | null>(null);
  const [detailSlide, setDetailSlide] = useState(0);

  // Modal ФОС
  const [modalOpen, setModalOpen] = useState(false);
  const [modalTitle, setModalTitle] = useState("Получить предложение");
  const [modalProduct, setModalProduct] = useState("");
  const [modalName, setModalName] = useState("");
  const [modalPhone, setModalPhone] = useState("");
  const [modalPhoneTouched, setModalPhoneTouched] = useState(false);
  const [modalConsent, setModalConsent] = useState(false);

  useEffect(() => {
    document.title = "Оборудование для мясо и рыбопереработки — купить | meatmassagers.ru";
    const setMeta = (name: string, content: string, property?: boolean) => {
      const attr = property ? "property" : "name";
      let el = document.querySelector(`meta[${attr}="${name}"]`);
      if (!el) { el = document.createElement("meta"); el.setAttribute(attr, name); document.head.appendChild(el); }
      el.setAttribute("content", content);
    };
    setMeta("description", "Оборудование для мясо и рыбопереработки: более 1000 моделей от ведущих европейских, азиатских и российских производителей по ценам заводов. Доставка и пусконаладка по всей России.");
  }, []);

  useEffect(() => {
    setCatalogLoading(true);
    fetch(HOME_CATALOG_URL)
      .then((r) => r.json())
      .then((d) => { setGroups(d.groups || []); })
      .catch(() => setGroups([]))
      .finally(() => setCatalogLoading(false));
  }, []);

  const openModal = (title: string, product = "") => {
    setModalTitle(title); setModalProduct(product); setModalOpen(true);
  };

  const openDetail = (item: FeedItem) => {
    setDetailItem(item); setDetailSlide(0);
  };

  const cartPayload = (item: FeedItem) => ({
    id: item.id,
    name: item.name,
    price: item.price,
    price_display: item.price_display,
    picture: (item.pictures && item.pictures[0]) || item.picture || "",
  });

  const submitModal = () => {
    if (modalName.trim() && isValidPhone(modalPhone) && modalConsent && !sending) {
      sendLead({ name: modalName, phone: modalPhone, product: modalProduct, formType: "modal" });
      setModalOpen(false); setModalName(""); setModalPhone(""); setModalPhoneTouched(false); setModalConsent(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteHeader onGetKp={() => openModal("Получить предложение")} />

      {/* HERO / БАННЕР */}
      <section id="hero" className="relative pt-28 sm:pt-32 pb-14 px-4 sm:px-6 bg-gradient-to-br from-primary/5 via-background to-background">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-10 lg:gap-14 items-center">
          <div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-display font-black tracking-tight text-foreground leading-tight mb-8">
              Оборудование для мясо и рыбопереработки
            </h1>
            <ul className="space-y-5 mb-9">
              {HERO_BULLETS.map((b, i) => (
                <li key={i} className="flex items-start gap-3">
                  <Icon name="CheckCircle2" fallback="Check" size={28} className="text-primary flex-shrink-0 mt-1" />
                  <span className="text-lg sm:text-xl lg:text-2xl text-foreground font-medium leading-snug">{b}</span>
                </li>
              ))}
            </ul>
            <div className="flex flex-col sm:flex-row gap-4">
              <button onClick={() => openModal("Получить предложение")} className="px-8 py-4 bg-primary text-white rounded-full font-bold text-lg hover:bg-primary/90 transition-all shadow-lg shadow-primary/20">
                Получить КП
              </button>
              <a href="#catalog" className="px-8 py-4 border-2 border-primary/30 text-primary rounded-full font-semibold text-lg hover:border-primary hover:bg-primary/5 transition-all text-center">
                Смотреть каталог
              </a>
            </div>
          </div>
          <div className="relative">
            <img src={HERO_IMG} alt="Оборудование для мясо и рыбопереработки" className="w-full h-full object-contain aspect-[4/3]" />
          </div>
        </div>
      </section>

      {/* КАТАЛОГ */}
      <section id="catalog" className="py-14 px-4 sm:px-6 bg-white">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-display font-black text-foreground mb-3">
            Каталог оборудования для мясо и рыбопереработки
          </h2>
          <p className="text-muted-foreground text-lg mb-10">Актуальные позиции и цены из нашего каталога</p>

          {catalogLoading && (
            <div className="text-center py-20 text-muted-foreground">
              <Icon name="Loader" size={40} className="mx-auto mb-4 animate-spin opacity-40" />
              <p>Загружаем каталог...</p>
            </div>
          )}

          {!catalogLoading && groups.map((g) => (
            <CatalogGrid
              key={g.subcategory_id}
              group={g}
              onInquiry={(name) => openModal("Получить предложение", name)}
              onDetail={openDetail}
              onAdd={(it) => addItem(cartPayload(it))}
              onRemove={(id) => removeItem(id)}
              getQty={getQuantity}
              onZoom={(pics, index) => setLightbox({ pics, index })}
              onVideo={(url) => setVideoUrl(url)}
            />
          ))}
        </div>
      </section>

      <HomeSections />

      {/* МОДАЛ ФОС */}
      {modalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm" onClick={() => setModalOpen(false)}>
          <div className="bg-white rounded-3xl shadow-2xl p-8 w-full max-w-md" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="font-display font-bold text-2xl text-foreground">{modalTitle}</h3>
                {modalProduct && <p className="text-sm text-primary mt-1">{modalProduct}</p>}
              </div>
              <button onClick={() => setModalOpen(false)} className="w-10 h-10 flex items-center justify-center rounded-xl bg-background hover:bg-primary/10 transition-colors">
                <Icon name="X" size={20} className="text-muted-foreground" />
              </button>
            </div>
            <div className="space-y-4">
              <input type="text" placeholder="Имя *" required value={modalName} onChange={e => setModalName(e.target.value)} className={inputCls} />
              <div>
                <input type="tel" placeholder="+7 (___) ___-__-__" required value={modalPhone} onChange={e => setModalPhone(formatPhone(modalPhone, e.target.value))} onBlur={() => setModalPhoneTouched(true)} className={modalPhoneTouched && !isValidPhone(modalPhone) ? inputError : inputCls} />
                {modalPhoneTouched && !isValidPhone(modalPhone) && <p className="text-xs text-red-500 mt-1">Введите номер России, Казахстана или Беларуси</p>}
              </div>
              <ConsentCheckbox checked={modalConsent} onChange={setModalConsent} />
              <button onClick={submitModal} disabled={!modalName.trim() || !isValidPhone(modalPhone) || !modalConsent || sending} style={{ backgroundColor: "#D98E5C" }} className="w-full py-4 text-white rounded-xl font-bold text-base hover:brightness-95 transition-all shadow-sm disabled:opacity-40">
                {sending ? "Отправляем..." : "Отправить"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* МОДАЛ ПОДРОБНЕЕ */}
      {detailItem && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={() => setDetailItem(null)}>
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="sticky top-0 bg-white/95 backdrop-blur-sm border-b border-border px-6 py-4 flex items-center justify-between z-10">
              <h3 className="font-display font-bold text-xl text-foreground pr-4 leading-snug">{detailItem.name}</h3>
              <button onClick={() => setDetailItem(null)} className="w-10 h-10 flex-shrink-0 flex items-center justify-center rounded-xl bg-background hover:bg-primary/10 transition-colors">
                <Icon name="X" size={20} className="text-muted-foreground" />
              </button>
            </div>
            <div className="p-6 grid md:grid-cols-2 gap-6">
              <div>
                <div className="relative bg-gray-50 rounded-2xl overflow-hidden aspect-square flex items-center justify-center">
                  {detailItem.pictures.length ? (
                    <img src={detailItem.pictures[detailSlide]} alt={detailItem.name} referrerPolicy="no-referrer" onClick={() => setLightbox({ pics: detailItem.pictures, index: detailSlide })} className="w-full h-full object-contain p-4 cursor-zoom-in" />
                  ) : (
                    <Icon name="ImageOff" size={48} className="text-muted-foreground opacity-30" />
                  )}
                  {detailItem.pictures.length > 1 && (
                    <>
                      <button onClick={() => setDetailSlide((s) => (s - 1 + detailItem.pictures.length) % detailItem.pictures.length)} className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-white/90 hover:bg-white rounded-full shadow flex items-center justify-center"><Icon name="ChevronLeft" size={18} className="text-foreground" /></button>
                      <button onClick={() => setDetailSlide((s) => (s + 1) % detailItem.pictures.length)} className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-white/90 hover:bg-white rounded-full shadow flex items-center justify-center"><Icon name="ChevronRight" size={18} className="text-foreground" /></button>
                    </>
                  )}
                </div>
                {detailItem.pictures.length > 1 && (
                  <div className="flex gap-2 overflow-x-auto pt-3">
                    {detailItem.pictures.map((pic, pi) => (
                      <button key={pi} onClick={() => setDetailSlide(pi)} className={`flex-shrink-0 w-14 h-14 rounded-lg overflow-hidden border-2 transition-all ${pi === detailSlide ? "border-primary" : "border-transparent opacity-60 hover:opacity-100"}`}>
                        <img src={pic} alt="" referrerPolicy="no-referrer" className="w-full h-full object-contain bg-white p-1" />
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <div>
                {detailItem.price_display ? (
                  <p className="text-3xl font-display font-black text-primary mb-5">{detailItem.price_display}</p>
                ) : (
                  <p className="text-xl font-bold text-muted-foreground mb-5">Цена по запросу</p>
                )}
                {detailItem.params.length > 0 && (
                  <div className="mb-5">
                    <h4 className="font-bold text-sm text-foreground mb-2 uppercase tracking-wider">Характеристики</h4>
                    <div className="space-y-0.5">
                      {detailItem.params.map((p, pi) => (
                        <div key={pi} className="flex items-start gap-3 py-2 border-b border-border/50 last:border-0">
                          <span className="text-sm text-muted-foreground flex-1">{p.name}</span>
                          <span className="text-sm font-semibold text-foreground text-right">{p.value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                <div className="flex gap-3">
                  <button onClick={() => { const n = detailItem.name; setDetailItem(null); openModal("Получить предложение", n); }} style={{ backgroundColor: "#F97316" }} className="flex-1 py-4 text-white rounded-xl font-bold text-base hover:brightness-95 transition-all shadow-md">
                    Получить предложение
                  </button>
                  {getQuantity(detailItem.id) > 0 ? (
                    <div className="flex items-center gap-1 border-2 border-primary/40 rounded-xl px-2 flex-shrink-0">
                      <button onClick={() => removeItem(detailItem.id)} className="w-9 h-9 flex items-center justify-center text-primary font-bold text-lg hover:bg-primary/10 rounded-lg transition-colors">−</button>
                      <span className="w-5 text-center font-bold text-primary">{getQuantity(detailItem.id)}</span>
                      <button onClick={() => addItem(cartPayload(detailItem))} className="w-9 h-9 flex items-center justify-center text-primary font-bold text-lg hover:bg-primary/10 rounded-lg transition-colors">+</button>
                    </div>
                  ) : (
                    <button onClick={() => addItem(cartPayload(detailItem))} title="В корзину" className="py-4 px-4 border-2 border-primary/30 text-primary rounded-xl hover:border-primary hover:bg-primary/5 transition-all flex-shrink-0">
                      <Icon name="ShoppingCart" size={20} />
                    </button>
                  )}
                </div>
              </div>
              {detailItem.description && (
                <div className="md:col-span-2">
                  <h4 className="font-bold text-sm text-foreground mb-2 uppercase tracking-wider">Описание</h4>
                  <div className="prose prose-sm max-w-none text-muted-foreground leading-relaxed [&_ul]:list-disc [&_ul]:pl-5 [&_li]:my-1 [&_p]:my-2 [&_strong]:text-foreground" dangerouslySetInnerHTML={{ __html: detailItem.description }} />
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <SiteFooter onGetKp={() => openModal("Получить предложение")} />

      {/* ЛАЙТБОКС */}
      {lightbox && lightbox.pics.length > 0 && (
        <div className="fixed inset-0 z-[200] bg-black/90 flex items-center justify-center" onClick={() => setLightbox(null)}>
          <button onClick={() => setLightbox(null)} className="absolute top-4 right-4 z-10 w-12 h-12 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition-colors">
            <Icon name="X" size={24} className="text-white" />
          </button>
          {lightbox.pics.length > 1 && (
            <>
              <button onClick={(e) => { e.stopPropagation(); setLightbox((lb) => lb ? { ...lb, index: (lb.index - 1 + lb.pics.length) % lb.pics.length } : lb); }} className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition-colors">
                <Icon name="ChevronLeft" size={28} className="text-white" />
              </button>
              <button onClick={(e) => { e.stopPropagation(); setLightbox((lb) => lb ? { ...lb, index: (lb.index + 1) % lb.pics.length } : lb); }} className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition-colors">
                <Icon name="ChevronRight" size={28} className="text-white" />
              </button>
            </>
          )}
          <img src={lightbox.pics[lightbox.index]} alt="" referrerPolicy="no-referrer" onClick={(e) => e.stopPropagation()} className="max-w-[90vw] max-h-[85vh] object-contain" />
          {lightbox.pics.length > 1 && (
            <div className="absolute bottom-5 left-0 right-0 flex justify-center gap-2">
              {lightbox.pics.map((_, i) => (
                <button key={i} onClick={(e) => { e.stopPropagation(); setLightbox((lb) => lb ? { ...lb, index: i } : lb); }} className={`w-2.5 h-2.5 rounded-full transition-colors ${i === lightbox.index ? "bg-white" : "bg-white/40"}`} />
              ))}
            </div>
          )}
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

const CatalogGrid = ({ group, onInquiry, onDetail, onAdd, onRemove, getQty, onZoom, onVideo }: {
  group: FeedGroup;
  onInquiry: (product: string) => void;
  onDetail: (item: FeedItem) => void;
  onAdd: (item: FeedItem) => void;
  onRemove: (id: string) => void;
  getQty: (id: string) => number;
  onZoom: (pics: string[], index: number) => void;
  onVideo: (url: string) => void;
}) => {
  if (!group.items.length) return null;
  return (
    <div className="mb-14">
      <div className="mb-6 flex items-end justify-between gap-4 flex-wrap">
        <div>
          <a href={categoryHref(group)} className="text-xl sm:text-2xl font-display font-black text-foreground hover:text-primary transition-colors">{group.subcategory}</a>
          <p className="text-sm text-muted-foreground">{group.parent}</p>
        </div>
        <a href={categoryHref(group)} className="text-sm font-semibold text-primary hover:underline flex items-center gap-1 whitespace-nowrap">
          Все товары раздела <Icon name="ArrowRight" size={16} />
        </a>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {group.items.map((it) => (
          <ProductCard key={it.id} item={it} onInquiry={onInquiry} onDetail={onDetail} onAdd={onAdd} onRemove={onRemove} qty={getQty(it.id)} onZoom={onZoom} onVideo={it.video ? () => onVideo(it.video || "") : undefined} />
        ))}
      </div>
      <div className="text-center mt-8">
        <a href={categoryHref(group)} style={{ backgroundColor: "#F97316" }} className="inline-flex items-center gap-2 px-8 py-4 text-white rounded-full font-bold text-lg hover:brightness-95 transition-all shadow-lg shadow-orange-500/30">
          Смотреть все {group.subcategory.toLowerCase()} <Icon name="ArrowRight" size={20} />
        </a>
      </div>
    </div>
  );
};

const ProductCard = ({ item, onInquiry, onDetail, onAdd, onRemove, qty, onZoom, onVideo }: {
  item: FeedItem;
  onInquiry: (product: string) => void;
  onDetail: (item: FeedItem) => void;
  onAdd: (item: FeedItem) => void;
  onRemove: (id: string) => void;
  qty: number;
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
        ) : (
          <Icon name="ImageOff" size={40} className="text-muted-foreground opacity-30" />
        )}
        {count > 1 && (
          <>
            <span className="absolute top-2 right-2 bg-slate-700/80 text-white text-[11px] font-semibold px-2 py-0.5 rounded-md">{slide + 1} / {count}</span>
            <button onClick={() => setSlide((s) => (s - 1 + count) % count)} className="absolute left-1 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/80 hover:bg-white rounded-full shadow flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"><Icon name="ChevronLeft" size={16} className="text-foreground" /></button>
            <button onClick={() => setSlide((s) => (s + 1) % count)} className="absolute right-1 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/80 hover:bg-white rounded-full shadow flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"><Icon name="ChevronRight" size={16} className="text-foreground" /></button>
            <div className="absolute bottom-2 left-0 right-0 flex justify-center gap-1.5 px-4 overflow-hidden">
              {pics.slice(0, 12).map((_, pi) => (
                <button key={pi} onClick={() => setSlide(pi)} className={`w-1.5 h-1.5 rounded-full transition-colors ${pi === slide ? "bg-primary" : "bg-slate-300"}`} />
              ))}
            </div>
          </>
        )}
      </div>
      <div className="p-4 flex flex-col flex-1">
        <h4 className="font-bold text-base text-foreground leading-snug mb-3 line-clamp-2 min-h-[2.6em]">{item.name}</h4>
        {item.params && pickListingParams(item.params).length > 0 && (
          <div className="mb-3 space-y-1">
            {pickListingParams(item.params).map((p, pi) => (
              <div key={pi} className="flex items-start gap-2 text-xs">
                <span className="text-muted-foreground flex-shrink-0">{p.name}</span>
                <span className="flex-1 border-b border-dotted border-border/60 translate-y-[-3px]" />
                <span className="font-semibold text-foreground text-right">{p.value}</span>
              </div>
            ))}
          </div>
        )}
        <div className="mt-auto">
          {item.price_display ? (
            <p className="text-xl font-display font-black text-primary mb-4">{item.price_display}</p>
          ) : (
            <p className="text-base font-semibold text-muted-foreground mb-4">Цена по запросу</p>
          )}
          <div className="flex flex-col gap-2.5">
            {onVideo && (
              <button onClick={onVideo} className="w-full py-2.5 bg-sky-100 text-sky-600 rounded-xl text-sm font-bold hover:bg-sky-200 transition-all flex items-center justify-center gap-2"><Icon name="Play" size={16} />Смотреть видео</button>
            )}
            <button onClick={() => onDetail(item)} className="w-full py-2.5 bg-orange-100 text-orange-600 rounded-xl text-sm font-bold hover:bg-orange-200 transition-all">Подробнее</button>
            <div className="flex gap-2.5">
              <button onClick={() => onInquiry(item.name)} style={{ backgroundColor: "#F97316" }} className="flex-1 py-2.5 text-white rounded-xl text-sm font-bold hover:brightness-95 transition-all shadow-md shadow-orange-500/20">Получить предложение</button>
              {qty > 0 ? (
                <div className="flex items-center gap-1 border-2 border-primary/40 rounded-xl px-1.5 flex-shrink-0">
                  <button onClick={() => onRemove(item.id)} className="w-7 h-7 flex items-center justify-center text-primary font-bold text-lg hover:bg-primary/10 rounded-lg transition-colors">−</button>
                  <span className="w-4 text-center font-bold text-primary text-sm">{qty}</span>
                  <button onClick={() => onAdd(item)} className="w-7 h-7 flex items-center justify-center text-primary font-bold text-lg hover:bg-primary/10 rounded-lg transition-colors">+</button>
                </div>
              ) : (
                <button onClick={() => onAdd(item)} title="В корзину" className="py-2.5 px-3.5 border-2 border-primary/30 text-primary rounded-xl hover:border-primary hover:bg-primary/5 transition-all flex-shrink-0">
                  <Icon name="ShoppingCart" size={18} />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;