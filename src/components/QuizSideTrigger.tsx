import { useEffect, useState, ReactNode } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import Icon from "@/components/ui/icon";

interface QuizSideTriggerProps {
  children: ReactNode | ((close: () => void) => ReactNode);
  storageKey?: string;
  label?: string;
  autoOpenMs?: number;
}

export default function QuizSideTrigger({
  children,
  storageKey = "quiz_auto_opened",
  label = "Подобрать оборудование",
  autoOpenMs = 30000,
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
    const t = setTimeout(() => {
      try {
        sessionStorage.setItem(storageKey, "1");
      } catch {
        /* noop */
      }
      setOpen(true);
    }, autoOpenMs);
    return () => clearTimeout(t);
  }, [storageKey, autoOpenMs]);

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
            {typeof children === "function" ? children(close) : children}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}