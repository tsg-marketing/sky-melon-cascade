import { useEffect, useState } from "react";
import Icon from "@/components/ui/icon";

const SIGNATURE = `С уважением,
Монахов Михаил Анатольевич
Директор по работе с ключевыми клиентами
Компания «Техно-Сиб»
https://meatmassagers.ru/santarnoe_oborudovanie
Тел.: 8 800 505-91-24
E-mail: massagers@t-sib.ru

P.S. Если тема неактуальна, сообщите в ответ — исключу адрес из рассылки.`;

const EMAILS = [
  {
    title: "Письмо 1 — Вход в цех: станции гигиены и мойки обуви",
    subject: "{{company}}: {станции гигиены с турникетом — 6 чел/мин|санпропускник на 6 человек в минуту|вход в цех: руки, подошвы, голенища за один проход}",
    body: `{Добрый день!|Здравствуйте!|Приветствую!}

Михаил Монахов, «Техно-Сиб». Поставляем санитарно-гигиеническое оборудование для мясо- и птицепереработки с 2001 года.

{Предлагаю|Для} {{company}} — {станции гигиены Bomeida для входа в производственную зону|оборудование санпропускника Bomeida}:

• BMD-B-05B — сквозной проход, 6 чел/мин. Двойной щёточный вал для подошв, три вертикальных вала для голенищ, обработка рук, турникет открывается только после полного цикла. 380 В, 0,68 кВт, 2570×1080×1630 мм.
• SH-05-A — компактная станция 1300×1050×1360 мм, 230 В, 0,5 кВт. Для небольших цехов и переходов между зонами.
• Отдельные мойки обуви BMD — подошвы или подошвы + голенища, 400 В, вода 2–4 бар, слив 50 мм, IP54.

Корпуса — нержавеющая сталь. Монтаж и пусконаладка — наши, сервис и запчасти — Москва, Новосибирск, Челябинск.

{Пришлите|Сообщите} численность самой большой смены и количество входов в чистую зону — {подберу|рассчитаю} комплектацию и пришлю КП в течение рабочего дня.

${SIGNATURE}`,
  },
  {
    title: "Письмо 2 — Мойка ящиков, тары и поддонов",
    subject: "{{company}}: {мойка ящиков от 150 до 1000 шт/ч|туннельные мойки ящиков и европоддонов|автоматическая мойка оборотной тары}",
    body: `{Добрый день!|Здравствуйте!|Приветствую!}

{Михаил Монахов, «Техно-Сиб».|Пишу по санитарному оборудованию для {{company}}.} {Если ящики и лотки у вас моют вручную или на устаревшей машине|Если в моечном отделении узкое место — оборотная тара}, вот туннельные мойки, которые мы поставляем:

• CW 200 — 150–200 ящ/ч, расход воды 300–600 л/ч, ТЭНы 25 кВт, 50 моющих и 14 ополаскивающих форсунок. 2900×1200×1860 мм.
• CW 300 — 300–600 ящ/ч, туннель 600×370 мм, бак 1000 л.
• CW 600 — 600–1000 ящ/ч, туннель 600×370 мм, бак 1000 л.
• MSK-125 — 125 ящ/ч, нагрев газом, паром или мазутом, автоматический дозатор моющего средства.
• BMD-4000 — мойка европоддонов, 60 шт/ч, конвейер 1–15 м/мин, IP65.

Цикл: мойка горячим раствором с рециркуляцией → ополаскивание → выход. Скорость транспортёра регулируется.

{Чтобы подобрать модель, нужны три цифры|Для подбора достаточно}: тип и размер тары, сколько единиц моете в смену, какой нагрев доступен (электричество, пар, газ). Пришлю 1–2 варианта с ценой и сроком поставки.

${SIGNATURE}`,
  },
  {
    title: "Письмо 3 — Стерилизаторы ножей и сушилки для спецобуви",
    subject: "{{company}}: {стерилизаторы ножей на 12–50+ предметов|стерилизация ножей и сушка спецобуви|обвалка и гардероб: стерилизаторы и сушилки}",
    body: `{Добрый день!|Здравствуйте!|Приветствую!}

{Последнее письмо по санитарному оборудованию для {{company}}|Завершаю серию писем для {{company}}} — по обвалке и гардеробу.

Стерилизаторы ножей и инструмента:
• УФ, настенные: СНУ — 12 ножей, СТУ — 18, СТУ-2 — 36. Таймер до 60 мин, 220 В.
• Озоновые: мод. 721 — 25+ предметов, цикл 30 мин; мод. 821 — 50+ предметов, цикл 40 мин, глубина камеры 12 см — помещаются кольчужные перчатки и решётки мясорубок. Горячая вода не нужна.

Сушилки для спецобуви:
• SB односторонние — 10 или 20 пар, 3 кВт, 230 В.
• BMD — 20 пар, плюс перчатки и одежда, 1,1 кВт.

{Если планируете оснащение обвалки или гардероба|Если вопрос актуален} — {напишите количество рабочих мест обвальщиков и численность смены|пришлите число обвальщиков и численность смены}, пришлю расчёт.

Каталог с характеристиками: https://meatmassagers.ru/santarnoe_oborudovanie

${SIGNATURE}`,
  },
];

function CopyButton({ text, label }: { text: string; label: string }) {
  const [done, setDone] = useState(false);
  const copy = () => {
    navigator.clipboard?.writeText(text).then(() => {
      setDone(true);
      setTimeout(() => setDone(false), 1500);
    }).catch(() => { /* noop */ });
  };
  return (
    <button onClick={copy} className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-semibold rounded-lg border border-border bg-white hover:border-primary hover:text-primary transition-colors">
      <Icon name={done ? "Check" : "Copy"} size={14} />
      {done ? "Скопировано" : label}
    </button>
  );
}

export default function SanitaryEmailsCold() {
  useEffect(() => {
    document.title = "Письма для холодной рассылки — санитарное оборудование";
    let robots = document.querySelector("meta[name='robots']") as HTMLMetaElement | null;
    if (!robots) {
      robots = document.createElement("meta");
      robots.setAttribute("name", "robots");
      document.head.appendChild(robots);
    }
    robots.setAttribute("content", "noindex, nofollow");
    return () => { robots?.setAttribute("content", "index, follow"); };
  }, []);

  return (
    <div className="min-h-screen bg-secondary py-10 px-4 sm:px-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl sm:text-4xl font-display font-black text-foreground mb-2">Холодная рассылка: санитарно-гигиеническое оборудование</h1>
        <p className="text-muted-foreground mb-8">
          3 письма цепочки. Параметр — <code className="px-1.5 py-0.5 bg-white rounded">{"{{company}}"}</code>, варианты слов — <code className="px-1.5 py-0.5 bg-white rounded">{"{вариант1|вариант2}"}</code>.
        </p>

        <div className="space-y-8">
          {EMAILS.map((e, i) => (
            <div key={i} className="bg-white border border-border rounded-2xl shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-border flex flex-wrap items-center justify-between gap-3">
                <h2 className="font-bold text-xl text-foreground">{e.title}</h2>
                <CopyButton text={`Тема: ${e.subject}\n\n${e.body}`} label="Копировать всё" />
              </div>
              <div className="px-6 py-4 border-b border-border bg-primary/5 flex flex-wrap items-start justify-between gap-3">
                <p className="text-foreground"><span className="font-bold">Тема:</span> {e.subject}</p>
                <CopyButton text={e.subject} label="Тема" />
              </div>
              <div className="px-6 py-5">
                <div className="flex justify-end mb-3">
                  <CopyButton text={e.body} label="Текст письма" />
                </div>
                <pre className="whitespace-pre-wrap font-sans text-[15px] leading-relaxed text-foreground">{e.body}</pre>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
