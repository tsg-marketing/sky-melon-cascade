import { useEffect, useState } from "react";
import SiteHeader from "@/components/site/SiteHeader";
import SiteFooter from "@/components/site/SiteFooter";
import ThankYouModal from "@/components/ThankYouModal";
import QuizSideTrigger from "@/components/QuizSideTrigger";
import { useLeadForm, LeadPayload } from "@/hooks/useLeadForm";
import { fetchCatalog, CatalogItem } from "@/lib/catalog";
import { sectionAnim } from "@/components/pelmeni/shared";
import PelmeniQuiz from "@/components/pelmeni/PelmeniQuiz";
import PelmeniProductModal from "@/components/pelmeni/PelmeniProductModal";
import PelmeniLightbox from "@/components/pelmeni/PelmeniLightbox";
import PelmeniLeadModal from "@/components/pelmeni/PelmeniLeadModal";
import PelmeniAbout from "@/components/pelmeni/PelmeniAbout";
import PelmeniContacts from "@/components/pelmeni/PelmeniContacts";
import SanHero from "@/components/sanitary/SanHero";
import SanCatalog from "@/components/sanitary/SanCatalog";
import { SanPains, SanDirections, SanZones, SanProcess, SanFaq } from "@/components/sanitary/SanSections";
import { SAN_ALT, SAN_QUIZ } from "@/components/sanitary/data";

const PATH = "/santarnoe_oborudovanie";
const TOPIC = "санитарное оборудование";
const LEAD_KEY = "lead_sent_211";
const SECTION_IDS = ["top", "pain", "directions", "catalog", "zones", "process", "quiz", "about", "faq", "contact-us"];

export default function SanitaryEquipment() {
  const { sendLead, sending, thankYouOpen, setThankYouOpen } = useLeadForm();
  const [visible, setVisible] = useState<Record<string, boolean>>({ top: true });
  const [items, setItems] = useState<CatalogItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState("all");
  const [modalOpen, setModalOpen] = useState(false);
  const [modalTitle, setModalTitle] = useState("");
  const [details, setDetails] = useState<CatalogItem | null>(null);
  const [lightbox, setLightbox] = useState<{ photos: string[]; index: number } | null>(null);

  useEffect(() => {
    fetchCatalog("sanitary")
      .then((d) => setItems(d.sanitary || []))
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  }, []);

  // Страница пока скрыта: закрыта от индексации, нет в меню и sitemap.
  useEffect(() => {
    document.title = "Санитарное оборудование для пищевых производств | Техно-Сиб";
    let robots = document.querySelector("meta[name='robots']") as HTMLMetaElement | null;
    if (!robots) {
      robots = document.createElement("meta");
      robots.setAttribute("name", "robots");
      document.head.appendChild(robots);
    }
    robots.setAttribute("content", "noindex, nofollow");
    return () => { robots?.setAttribute("content", "index, follow"); };
  }, []);

  useEffect(() => {
    const observers: IntersectionObserver[] = [];
    SECTION_IDS.forEach((id) => {
      const el = document.getElementById(id);
      if (!el) return;
      const o = new IntersectionObserver(([entry]) => {
        if (entry.isIntersecting) {
          setVisible((prev) => ({ ...prev, [id]: true }));
          o.unobserve(el);
        }
      }, { threshold: 0.08 });
      o.observe(el);
      observers.push(o);
    });
    return () => observers.forEach((o) => o.disconnect());
  }, [items]);

  const vis = (id: string) => !!visible[id];
  const openModal = (title: string) => { setModalTitle(title); setModalOpen(true); };
  const markLeadSent = () => { try { localStorage.setItem(LEAD_KEY, "1"); } catch { /* noop */ } };

  const lead = (name: string, phone: string, email: string, product: string, formType: LeadPayload["formType"], quizAnswers?: Record<string, string>) => {
    sendLead({ name, phone, email, product, topic: TOPIC, formType, ...(quizAnswers ? { quizAnswers } : {}) });
    markLeadSent();
  };

  const showCategory = (cat: string) => {
    setCategory(cat);
    document.getElementById("catalog")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteHeader current={PATH} onGetKp={() => openModal("Получить КП за 24 часа")} />

      <SanHero
        visible={vis("top")}
        onPick={() => openModal("Подобрать санитарное оборудование")}
        onAudit={() => openModal("Бесплатный аудит санпропускника")}
      />

      <SanPains visible={vis("pain")} onLead={() => openModal("Расчёт комплекта санитарного оборудования")} />
      <SanDirections visible={vis("directions")} onSelect={showCategory} />

      <SanCatalog
        visible={vis("catalog")}
        items={items}
        loading={loading}
        sending={sending}
        category={category}
        onCategory={setCategory}
        onQuickLead={(n, p, e) => lead(n, p, e, "Подобрать санитарное оборудование с технологом", "inquiry")}
        onCardLead={(item) => openModal(`Оставить заявку на ${item.name}`)}
        onDetails={setDetails}
        onEmptyLead={() => openModal("Заявка при недоступном каталоге")}
        onZoom={(photos, index) => setLightbox({ photos, index })}
      />

      <SanZones visible={vis("zones")} onPick={(zone) => openModal(`Подбор оборудования: ${zone}`)} />
      <SanProcess visible={vis("process")} />

      <section id="quiz" className="py-12 px-6 bg-gradient-to-br from-orange-50 via-orange-100/50 to-background scroll-mt-32">
        <div className="max-w-4xl mx-auto">
          <div className={`text-center mb-12 ${sectionAnim(vis("quiz"))}`}>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-display font-black tracking-tight text-foreground leading-tight">
              Подберите оборудование для санпропускника
            </h2>
            <p className="text-lg text-muted-foreground mt-4">Ответьте на 5 вопросов — технолог пришлёт готовый комплект с ценами.</p>
          </div>
          <PelmeniQuiz
            questions={SAN_QUIZ}
            sending={sending}
            onSent={(n, p, e, answers) => lead(n, p, e, "Получить подборку (квиз)", "quiz", answers)}
          />
        </div>
      </section>

      <PelmeniAbout
        visible={vis("about")}
        highlight="Санитарно-гигиеническое направление: станции гигиены, мойки обуви и тары, стерилизаторы и сушилки — комплектуем санпропускники мясных, молочных и птицеперерабатывающих предприятий под ключ."
      />
      <SanFaq visible={vis("faq")} />

      <PelmeniContacts
        visible={vis("contact-us")}
        sending={sending}
        onSubmit={(n, p, e) => lead(n, p, e, "Оставить заявку (санитарное оборудование)", "contacts")}
      />

      <SiteFooter onGetKp={() => openModal("Получить КП за 24 часа")} />

      <PelmeniProductModal
        item={details}
        altLabel={details ? SAN_ALT[details.category_id] || "санитарное оборудование" : undefined}
        onClose={() => setDetails(null)}
        onLead={(item) => { setDetails(null); openModal(`Оставить заявку на ${item.name}`); }}
      />

      {lightbox && (
        <PelmeniLightbox
          photos={lightbox.photos}
          index={lightbox.index}
          onIndex={(i) => setLightbox({ ...lightbox, index: i })}
          onClose={() => setLightbox(null)}
        />
      )}

      <PelmeniLeadModal
        open={modalOpen}
        title={modalTitle}
        sending={sending}
        onClose={() => setModalOpen(false)}
        onSubmit={(n, p, e) => lead(n, p, e, modalTitle || "Получить КП за 24 часа", "modal")}
      />

      <QuizSideTrigger storageKey="quiz_auto_sanitary" topic="Санитарное оборудование" autoOpenMs={45000} autoOpenScroll={0.4} skipIfLeadKey={LEAD_KEY}>
        {(close) => (
          <PelmeniQuiz
            questions={SAN_QUIZ}
            sending={sending}
            onSent={(n, p, e, answers) => { lead(n, p, e, "Получить подборку (квиз-попап)", "quiz", answers); close(); }}
          />
        )}
      </QuizSideTrigger>

      <ThankYouModal open={thankYouOpen} onClose={() => setThankYouOpen(false)} />
    </div>
  );
}
