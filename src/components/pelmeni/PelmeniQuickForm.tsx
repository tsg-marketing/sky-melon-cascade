import { useState } from "react";
import { inputCls, inputError, isValidPhone, formatPhone, isValidEmail, ConsentCheckbox } from "./shared";

interface Props {
  sending: boolean;
  onSubmit: (name: string, phone: string, email: string) => void;
}

export default function PelmeniQuickForm({ sending, onSubmit }: Props) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [phoneTouched, setPhoneTouched] = useState(false);
  const [consent, setConsent] = useState(false);

  const phoneValid = isValidPhone(phone);
  const emailValid = !email.trim() || isValidEmail(email);
  const canSend = phoneValid && consent && emailValid && !sending;

  const submit = () => {
    if (!canSend) return;
    onSubmit(name, phone, email);
    setName(""); setPhone(""); setEmail(""); setPhoneTouched(false); setConsent(false);
  };

  return (
    <div className="relative p-6 sm:p-10 bg-gradient-to-br from-primary to-primary/85 rounded-3xl shadow-2xl mb-12 overflow-hidden">
      <div className="absolute -top-16 -right-16 w-64 h-64 bg-white/10 rounded-full pointer-events-none" />
      <div className="relative z-10">
        <h3 className="font-display font-black text-2xl sm:text-3xl mb-2 text-white text-center">Не знаете, какая модель нужна?</h3>
        <p className="text-white/85 text-base mb-7 text-center">Опишите продукт и объём — технолог подберёт 2–3 варианта с ценами.</p>

        <div className="grid sm:grid-cols-3 gap-4 mb-4">
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
            {phoneTouched && !phoneValid && <p aria-live="polite" className="text-xs text-white mt-1">Введите номер России, Казахстана или Беларуси</p>}
          </div>
          <input type="email" placeholder="Email" aria-label="Email" value={email} onChange={e => setEmail(e.target.value)} className={email.trim() && !emailValid ? inputError : inputCls} />
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="flex-1 [&_span]:text-white/80 [&_a]:text-white [&_a]:underline">
            <ConsentCheckbox checked={consent} onChange={setConsent} />
          </div>
          <button
            onClick={submit}
            disabled={!canSend}
            className="px-8 py-3.5 bg-orange-500 hover:bg-orange-600 text-white rounded-xl font-bold text-base transition-all shadow-lg disabled:opacity-40 whitespace-nowrap"
          >
            {sending ? "Отправляем..." : "Оставить заявку"}
          </button>
        </div>
      </div>
    </div>
  );
}
