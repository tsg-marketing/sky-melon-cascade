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
import FishHero from "@/components/fish/FishHero";
import FishCatalog from "@/components/fish/FishCatalog";
import { FishDirections, FishPains, FishAdvantages, FishLine, FishProcess, FishFaq } from "@/components/fish/FishSections";
import { FISH_ALT, FISH_QUIZ } from "@/components/fish/data";

const PATH = "/oborudovanie-dlya-rybopererabotki";
const TOPIC = "оборудование для рыбопереработки";
const LEAD_KEY = "lead_sent_270";
const SECTION_IDS = ["top", "directions", "catalog", "advantages", "line", "pain", "process", "quiz", "about", "faq", "contact-us"];

export default function FishProcessing() {
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
    fetchCatalog("fish")
      .then((d) => setItems((d.fish || []).filter((i) => !/ebro|эбро/i.test(i.name || ""))))
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    document.title = "Оборудование для рыбопереработки — купить с доставкой | Техно-Сиб";
    let meta = document.querySelector("meta[name='description']") as HTMLMetaElement | null;
    if (!meta) {
      meta = document.createElement("meta");
      meta.setAttribute("name", "description");
      document.head.appendChild(meta);
    }
    meta.setAttribute("content", "Филетировочные, чешуесъёмные, шкуросъёмные и головоотсекающие машины, инъекторы для рыбы и оборудование для посола. AGK, Suntok, Daribo. Подбор линии, доставка и монтаж по России.");
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

  const scrollToCatalog = () => document.getElementById("catalog")?.scrollIntoView({ behavior: "smooth" });
  const showCategory = (cat: string) => { setCategory(cat); scrollToCatalog(); };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteHeader current={PATH} onGetKp={() => openModal("Получить КП за 24 часа")} />

      <FishHero
        visible={vis("top")}
        onPick={() => openModal("Подобрать оборудование для рыбопереработки")}
        onCatalog={scrollToCatalog}
      />

      <FishDirections visible={vis("directions")} onSelect={showCategory} />

      <FishCatalog
        visible={vis("catalog")}
        items={items}
        loading={loading}
        sending={sending}
        category={category}
        onCategory={setCategory}
        onQuickLead={(n, p, e) => lead(n, p, e, "Подобрать оборудование для рыбопереработки с технологом", "inquiry")}
        onCardLead={(item) => openModal(`Оставить заявку на ${item.name}`)}
        onDetails={setDetails}
        onEmptyLead={() => openModal("Заявка при недоступном каталоге")}
        onZoom={(photos, index) => setLightbox({ photos, index })}
      />

      <FishAdvantages visible={vis("advantages")} />
      <FishLine visible={vis("line")} onSelect={showCategory} onLead={() => openModal("Проект линии переработки рыбы")} />
      <FishPains visible={vis("pain")} onLead={() => openModal("Расчёт окупаемости оборудования для рыбы")} />
      <FishProcess visible={vis("process")} />

      <section id="quiz" className="py-12 px-6 bg-gradient-to-br from-orange-50 via-orange-100/50 to-background scroll-mt-32">
        <div className="max-w-4xl mx-auto">
          <div className={`text-center mb-12 ${sectionAnim(vis("quiz"))}`}>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-display font-black tracking-tight text-foreground leading-tight">
              Подберите оборудование для рыбного цеха
            </h2>
            <p className="text-lg text-muted-foreground mt-4">Ответьте на 5 вопросов — технолог пришлёт подборку машин с ценами.</p>
          </div>
          <PelmeniQuiz
            questions={FISH_QUIZ}
            sending={sending}
            onSent={(n, p, e, answers) => lead(n, p, e, "Получить подборку (квиз)", "quiz", answers)}
          />
        </div>
      </section>

      <PelmeniAbout
        visible={vis("about")}
        intro="поставляет оборудование для мясо- и рыбопереработки. Работаем с 2001 года и помогаем предприятиям оснащать и модернизировать цеха."
        outro="Технологи компании подбирают машины под конкретный вид и размер рыбы, проводят пусконаладку и обучают персонал — от точной настройки ножей напрямую зависит выход филе."
        highlight="Рыбное направление: филетировочные, чешуесъёмные, шкуросъёмные и головоотсекающие машины, инъекторы и оборудование для посола от AGK Kronawitter, Suntok, Daribo и Nock — оснащаем рыбные цеха от небольших участков до крупных производств."
      />
      <FishFaq visible={vis("faq")} />

      <PelmeniContacts
        visible={vis("contact-us")}
        sending={sending}
        onSubmit={(n, p, e) => lead(n, p, e, "Оставить заявку (рыбопереработка)", "contacts")}
      />

      <SiteFooter onGetKp={() => openModal("Получить КП за 24 часа")} />

      <PelmeniProductModal
        item={details}
        altLabel={details ? FISH_ALT[details.category_id] || "оборудование для рыбопереработки" : undefined}
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

      <QuizSideTrigger storageKey="quiz_auto_fish" topic="Оборудование для рыбопереработки" autoOpenMs={45000} autoOpenScroll={0.4} skipIfLeadKey={LEAD_KEY}>
        {(close) => (
          <PelmeniQuiz
            questions={FISH_QUIZ}
            sending={sending}
            onSent={(n, p, e, answers) => { lead(n, p, e, "Получить подборку (квиз-попап)", "quiz", answers); close(); }}
          />
        )}
      </QuizSideTrigger>

      <ThankYouModal open={thankYouOpen} onClose={() => setThankYouOpen(false)} />
    </div>
  );
}