import { useEffect, useState, ReactNode } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import Icon from "@/components/ui/icon";

interface QuizSideTriggerProps {
  children: ReactNode | ((close: () => void) => ReactNode);
  storageKey?: string;
  label?: string;
  autoOpenMs?: number;
  /** Раздел оборудования — показывается заголовком внутри окна квиза. */
  topic?: string;
  /**
   * Ключ в localStorage: если посетитель уже отправлял заявку,
   * автопоказ квиза не срабатывает (кнопка сбоку остаётся).
   */
  skipIfLeadKey?: string;
  /** Доля прокрутки страницы (0–1), при которой квиз открывается раньше таймера. */
  autoOpenScroll?: number;
}

export default function QuizSideTrigger({
  children,
  storageKey = "quiz_auto_opened",
  label = "Подобрать оборудование",
  autoOpenMs = 30000,
  topic,
  skipIfLeadKey,
  autoOpenScroll,
}: QuizSideTriggerProps) {
  const [open, setOpen] = useState(false);
  const [renderKey, setRenderKey] = useState(0);
  const close = () => {
    setOpen(false);
    setRenderKey((k) => k + 1);
  };

  useEffect(() => {
    if (typeof window === "undefined") return;
    let already = false;
    try {
      already = sessionStorage.getItem(storageKey) === "1";
    } catch {
      already = false;
    }
    if (already) return;

    // Посетитель уже оставил заявку — второй раз квиз не навязываем.
    if (skipIfLeadKey) {
      try {
        if (localStorage.getItem(skipIfLeadKey) === "1") return;
      } catch {
        /* noop */
      }
    }

    const show = () => {
      try {
        sessionStorage.setItem(storageKey, "1");
      } catch {
        /* noop */
      }
      setOpen(true);
    };

    const t = setTimeout(show, autoOpenMs);

    let onScroll: (() => void) | undefined;
    if (autoOpenScroll) {
      onScroll = () => {
        const height = document.documentElement.scrollHeight - window.innerHeight;
        if (height <= 0) return;
        if (window.scrollY / height >= autoOpenScroll) {
          window.removeEventListener("scroll", onScroll!);
          clearTimeout(t);
          show();
        }
      };
      window.addEventListener("scroll", onScroll, { passive: true });
    }

    return () => {
      clearTimeout(t);
      if (onScroll) window.removeEventListener("scroll", onScroll);
    };
  }, [storageKey, autoOpenMs, skipIfLeadKey, autoOpenScroll]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label={label}
        className="fixed right-0 top-1/2 -translate-y-1/2 z-40 bg-orange-500 hover:bg-orange-600 text-white shadow-2xl rounded-l-xl py-5 px-2.5 transition-all hover:pr-3.5"
        style={{ writingMode: "vertical-rl", transform: "translateY(-50%) rotate(180deg)" }}
      >
        <span className="inline-flex items-center gap-2 font-bold text-sm tracking-wide whitespace-nowrap">
          <Icon name="ClipboardList" size={18} />
          {label}
        </span>
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto p-6 sm:p-8">
          <div className="pt-2" key={renderKey}>
            {topic && (
              <div className="mb-6 text-center">
                <span className="text-xs font-semibold tracking-widest text-primary uppercase">Подбор оборудования</span>
                <h2 className="text-2xl sm:text-3xl font-display font-black tracking-tight text-foreground mt-2">{topic}</h2>
              </div>
            )}
            {typeof children === "function" ? children(close) : children}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}