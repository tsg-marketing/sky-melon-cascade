import { useState } from "react";
import Icon from "@/components/ui/icon";
import { inputCls, inputError, isValidPhone, formatPhone, isValidEmail, ConsentCheckbox, sectionAnim } from "./shared";

const EMAIL = "massagers@t-sib.ru";

interface Props {
  visible: boolean;
  sending: boolean;
  onSubmit: (name: string, phone: string, email: string) => void;
}

export default function PelmeniContacts({ visible, sending, onSubmit }: Props) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [phoneTouched, setPhoneTouched] = useState(false);
  const [consent, setConsent] = useState(false);
  const [copied, setCopied] = useState(false);

  const phoneValid = isValidPhone(phone);
  const emailValid = !email.trim() || isValidEmail(email);
  const canSend = phoneValid && consent && emailValid && !sending;

  const copyEmail = () => {
    navigator.clipboard?.writeText(EMAIL).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    }).catch(() => { /* noop */ });
    try { (window as unknown as { ym?: (...a: unknown[]) => void }).ym?.(107258870, "reachGoal", "click_email"); } catch { /* noop */ }
  };

  const submit = () => {
    if (!canSend) return;
    onSubmit(name, phone, email);
    setName(""); setPhone(""); setEmail(""); setPhoneTouched(false); setConsent(false);
  };

  return (
    <section id="contact-us" className="py-14 px-6 bg-primary">
      <div className="max-w-7xl mx-auto">
        <div className={`text-center mb-12 ${sectionAnim(visible)}`}>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-display font-black tracking-tight text-white leading-tight">Получите расчёт под ваш объём</h2>
          <p className="text-lg text-white/85 mt-4 max-w-3xl mx-auto">
            Опишите продукт и планируемую загрузку — пришлём 2–3 модели с ценами, сроками поставки и условиями пусконаладки.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-10 items-start">
          <div className={sectionAnim(visible)}>
            <div className="space-y-4">
              <a
                href="tel:88005057684"
                onClick={() => { try { (window as unknown as { ym?: (...a: unknown[]) => void }).ym?.(107258870, "reachGoal", "phone_click"); } catch { /* noop */ } }}
                className="flex items-center gap-4 p-4 bg-white/10 border border-white/20 rounded-xl hover:bg-white/15 transition-colors"
              >
                <div className="w-11 h-11 bg-white/15 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Icon name="Phone" size={20} className="text-white" />
                </div>
                <div>
                  <p className="text-xs text-white/70">Телефон</p>
                  <p className="font-bold text-lg text-white">8-800-505-76-84</p>
                </div>
              </a>

              <button onClick={copyEmail} className="w-full flex items-center gap-4 p-4 bg-white/10 border border-white/20 rounded-xl hover:bg-white/15 transition-colors text-left">
                <div className="w-11 h-11 bg-white/15 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Icon name={copied ? "Check" : "Mail"} size={20} className="text-white" />
                </div>
                <div>
                  <p className="text-xs text-white/70">Почта</p>
                  <p className="font-bold text-lg text-white">{copied ? "Скопировано!" : EMAIL}</p>
                </div>
              </button>

              <div className="p-4 bg-white/10 border border-white/20 rounded-xl space-y-2">
                <p className="text-white text-base font-semibold">Демозалы: Москва · Новосибирск · Челябинск</p>
                <p className="text-white/80 text-sm">Работаем по России и СНГ</p>
              </div>
            </div>
          </div>

          <div className={sectionAnim(visible)}>
            <div className="p-8 bg-white rounded-3xl shadow-xl">
              <h3 className="font-display font-bold text-2xl mb-2 text-foreground">Оставить заявку</h3>
              <p className="text-muted-foreground mb-6 text-sm">Технолог ответит в течение рабочего дня</p>
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
                <button
                  onClick={submit}
                  disabled={!canSend}
                  className="w-full py-4 bg-orange-500 hover:bg-orange-600 text-white rounded-xl font-bold text-base transition-all shadow-sm disabled:opacity-40"
                >
                  {sending ? "Отправляем..." : "Оставить заявку"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
