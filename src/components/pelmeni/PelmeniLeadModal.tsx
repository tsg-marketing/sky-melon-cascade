import { useEffect, useRef, useState } from "react";
import Icon from "@/components/ui/icon";
import { inputCls, inputError, isValidPhone, formatPhone, isValidEmail, ConsentCheckbox } from "./shared";

interface Props {
  open: boolean;
  title: string;
  sending: boolean;
  onClose: () => void;
  onSubmit: (name: string, phone: string, email: string) => void;
}

export default function PelmeniLeadModal({ open, title, sending, onClose, onSubmit }: Props) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [phoneTouched, setPhoneTouched] = useState(false);
  const [consent, setConsent] = useState(false);
  const boxRef = useRef<HTMLDivElement>(null);
  const returnFocus = useRef<HTMLElement | null>(null);

  const phoneValid = isValidPhone(phone);
  const emailValid = !email.trim() || isValidEmail(email);
  const canSend = phoneValid && consent && emailValid && !sending;

  useEffect(() => {
    if (!open) return;
    returnFocus.current = document.activeElement as HTMLElement;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") { onClose(); return; }
      if (e.key !== "Tab" || !boxRef.current) return;
      const nodes = boxRef.current.querySelectorAll<HTMLElement>('a[href], button:not([disabled]), input, textarea, select');
      if (!nodes.length) return;
      const first = nodes[0];
      const last = nodes[nodes.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    };
    window.addEventListener("keydown", onKey);
    const t = setTimeout(() => boxRef.current?.querySelector<HTMLElement>("input")?.focus(), 40);
    return () => { window.removeEventListener("keydown", onKey); clearTimeout(t); returnFocus.current?.focus(); };
  }, [open, onClose]);

  if (!open) return null;

  const submit = () => {
    if (!canSend) return;
    onSubmit(name, phone, email);
    setName(""); setPhone(""); setEmail(""); setPhoneTouched(false); setConsent(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm" onClick={onClose}>
      <div ref={boxRef} role="dialog" aria-modal="true" aria-label={title} className="bg-white rounded-3xl shadow-2xl p-8 w-full max-w-md max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-start justify-between gap-4 mb-6">
          <div>
            <h3 className="font-display font-bold text-2xl text-foreground">Оставить заявку</h3>
            {title && <p className="text-sm text-primary mt-1 leading-snug">{title}</p>}
          </div>
          <button onClick={onClose} aria-label="Закрыть" className="w-9 h-9 flex-shrink-0 flex items-center justify-center rounded-xl hover:bg-secondary transition-colors">
            <Icon name="X" size={18} className="text-muted-foreground" />
          </button>
        </div>
        <div className="space-y-4">
          <input type="text" placeholder="Ваше имя" aria-label="Ваше имя" value={name} onChange={e => setName(e.target.value)} className={inputCls} />
          <div>
            <input
              type="tel"
              placeholder="+7 (___) ___-__-__"
              aria-label="Телефон"
              required
              value={phone}
              onChange={e => setPhone(formatPhone(phone, e.target.value))}
              onBlur={() => setPhoneTouched(true)}
              className={phoneTouched && !phoneValid ? inputError : inputCls}
            />
            {phoneTouched && !phoneValid && <p aria-live="polite" className="text-xs text-red-500 mt-1">Введите номер России, Казахстана или Беларуси</p>}
          </div>
          <input type="email" placeholder="Email" aria-label="Email" value={email} onChange={e => setEmail(e.target.value)} className={email.trim() && !emailValid ? inputError : inputCls} />
          <ConsentCheckbox checked={consent} onChange={setConsent} />
          <button onClick={submit} disabled={!canSend} className="w-full py-4 bg-orange-500 hover:bg-orange-600 text-white rounded-xl font-bold text-lg transition-all shadow-md disabled:opacity-40">
            {sending ? "Отправляем..." : "Отправить"}
          </button>
        </div>
      </div>
    </div>
  );
}
