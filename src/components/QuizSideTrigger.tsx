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

const SESSION_DELAY_MS = 30000;

export default function QuizSideTrigger({
  children,
  label = "Подобрать оборудование",
  topic,
  skipIfLeadKey,
}: QuizSideTriggerProps) {
  const [open, setOpen] = useState(false);
  const [renderKey, setRenderKey] = useState(0);
  const close = () => {
    setOpen(false);
    setRenderKey((k) => k + 1);
  };

  useEffect(() => {
    if (typeof window === "undefined") return;
    const SHOWN_KEY = "quiz_popup_shown";
    const START_KEY = "quiz_session_start";
    let startedAt = Date.now();
    try {
      if (sessionStorage.getItem(SHOWN_KEY) === "1") return;
      const saved = Number(sessionStorage.getItem(START_KEY));
      if (saved) startedAt = saved;
      else sessionStorage.setItem(START_KEY, String(startedAt));
    } catch {
      /* noop */
    }

    if (skipIfLeadKey) {
      try {
        if (localStorage.getItem(skipIfLeadKey) === "1") return;
      } catch {
        /* noop */
      }
    }

    const show = () => {
      try {
        if (sessionStorage.getItem(SHOWN_KEY) === "1") return;
        sessionStorage.setItem(SHOWN_KEY, "1");
      } catch {
        /* noop */
      }
      setOpen(true);
    };

    const t = setTimeout(show, Math.max(0, SESSION_DELAY_MS - (Date.now() - startedAt)));
    return () => clearTimeout(t);
  }, [skipIfLeadKey]);

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