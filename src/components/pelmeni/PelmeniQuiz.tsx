import { useState } from "react";
import { inputCls, inputError, isValidPhone, formatPhone, isValidEmail, ConsentCheckbox } from "./shared";

export const PELMENI_QUIZ_QUESTIONS = [
  { q: "Какое изделие планируете производить?", options: ["Пельмени", "Хинкали", "Манты или позы", "Вареники", "Чебуреки или самса", "Несколько видов"] },
  { q: "Какой объём выпуска в смену?", options: ["До 300 кг", "300–800 кг", "800–1 500 кг", "Более 1 500 кг", "Пока не считали"] },
  { q: "Какой вес одного изделия?", options: ["До 10 г", "10–15 г", "15–25 г", "Более 25 г", "Разный вес"] },
  { q: "Что уже есть в цехе?", options: ["Ничего, запускаем с нуля", "Есть тестомес и фаршемешалка", "Есть линия, меняем автомат", "Расширяем ассортимент"] },
  { q: "Когда нужно оборудование?", options: ["Срочно, 1–2 недели", "В течение месяца", "В этом квартале", "Изучаем рынок"] },
];

interface Props {
  sending: boolean;
  questions?: { q: string; options: string[] }[];
  onSent: (name: string, phone: string, email: string, quizAnswers: Record<string, string>) => void;
}

export default function PelmeniQuiz({ sending, onSent, questions = PELMENI_QUIZ_QUESTIONS }: Props) {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<string[]>([]);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [phoneTouched, setPhoneTouched] = useState(false);
  const [consent, setConsent] = useState(false);
  const [done, setDone] = useState(false);

  const total = questions.length;
  const isLast = step === total;
  const phoneValid = isValidPhone(phone);
  const emailValid = !email.trim() || isValidEmail(email);
  const canSend = phoneValid && consent && emailValid && !sending;

  const choose = (opt: string) => { setAnswers([...answers, opt]); setStep(step + 1); };
  const back = () => { setStep(step - 1); setAnswers(answers.slice(0, -1)); };

  const handleSubmit = () => {
    if (!canSend) return;
    const quizAnswers: Record<string, string> = {};
    questions.forEach((q, i) => { quizAnswers[q.q] = answers[i] || ""; });
    onSent(name, phone, email, quizAnswers);
    setDone(true);
  };

  if (done) {
    return (
      <div className="max-w-2xl mx-auto p-8 bg-white border-2 border-primary/20 rounded-3xl shadow-sm text-center">
        <h3 className="font-display font-bold text-3xl mb-3 text-foreground">Заявка принята</h3>
        <p className="text-muted-foreground text-base leading-relaxed">
          Технолог свяжется с вами в течение рабочего дня и пришлёт 2–3 модели под ваш объём с ценами и сроками поставки.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      {!isLast ? (
        <div>
          <div className="flex items-center gap-3 mb-8">
            {questions.map((_, i) => (
              <div key={i} className={`h-2 flex-1 rounded-full transition-all ${i < step ? "bg-primary" : i === step ? "bg-primary/50" : "bg-border"}`} />
            ))}
          </div>
          <p className="text-sm text-muted-foreground mb-2">Вопрос {step + 1} из {total}</p>
          <h3 className="text-2xl sm:text-3xl font-bold text-foreground mb-8">{questions[step].q}</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {questions[step].options.map((opt, i) => (
              <button
                key={i}
                onClick={() => choose(opt)}
                className="p-5 text-left bg-white border-2 border-border rounded-2xl hover:border-primary hover:bg-primary/5 transition-all font-semibold text-lg text-foreground"
              >
                {opt}
              </button>
            ))}
          </div>
          {step > 0 && (
            <button onClick={back} className="mt-6 text-sm text-muted-foreground hover:text-primary transition-colors">← Назад</button>
          )}
        </div>
      ) : (
        <div className="p-8 bg-white border-2 border-primary/20 rounded-3xl shadow-sm">
          <h3 className="font-display font-bold text-3xl mb-2 text-foreground text-center">Готово. Куда прислать подборку?</h3>
          <p className="text-muted-foreground text-base mb-8 text-center">Технолог пришлёт 2–3 модели с ценами под ваш объём</p>
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
              onClick={handleSubmit}
              disabled={!canSend}
              className="w-full py-4 bg-orange-500 hover:bg-orange-600 text-white rounded-xl font-bold text-lg transition-all shadow-sm disabled:opacity-40"
            >
              {sending ? "Отправляем..." : "Получить подборку"}
            </button>
          </div>
          <button onClick={back} className="mt-6 text-sm text-muted-foreground hover:text-primary transition-colors">← Назад</button>
        </div>
      )}
    </div>
  );
}
