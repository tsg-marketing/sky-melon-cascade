import { useState, useEffect, useRef, useCallback, type ReactNode } from "react";
import Icon from "@/components/ui/icon";
import { Slider } from "@/components/ui/slider";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
import { useLeadForm } from "@/hooks/useLeadForm";
const LOGO_URL =
  "https://cdn.poehali.dev/files/b643e2cd-1c2b-461b-b32b-4053b1b9e72b.jpg";
const ACCENT = "#e8712a";
const BRINE_INJECTION_RATE = 0.35;

interface FormData {
  rawMeatPerDay: number;
  workDaysPerMonth: number;

  oldBrineRetention: number;
  oldThermoLoss: number;
  oldDefectPercent: number;
  oldBrineLossKg: number;
  oldEnergyPerCycle: number;
  oldCyclesPerDay: number;
  oldWorkers: number;

  newBrineRetention: number;
  newThermoLoss: number;
  newDefectPercent: number;
  newBrineLossKg: number;
  newEnergyPerCycle: number;
  newCyclesPerDay: number;
  newWorkers: number;

  rawCostPerKg: number;
  brineCostPerKg: number;
  energyCostPerKwh: number;
  laborCostPerHour: number;
  laborHoursSaved: number;

  equipmentCost: number;
  deliveryCost: number;
}

interface CalcResults {
  oldBrineKg: number;
  oldMassAfter: number;
  oldThermoLossKg: number;
  oldYieldKg: number;
  oldYieldPercent: number;
  oldDefectKg: number;

  newBrineKg: number;
  newMassAfter: number;
  newThermoLossKg: number;
  newYieldKg: number;
  newYieldPercent: number;
  newDefectKg: number;

  diffYieldKg: number;
  diffDefectKg: number;
  diffBrineLossKg: number;
  diffEnergyKwh: number;

  savYieldPerDay: number;
  savDefectPerDay: number;
  savBrinePerDay: number;
  savEnergyPerDay: number;
  savLaborPerDay: number;
  totalSavPerDay: number;
  totalSavPerMonth: number;
  totalSavPerYear: number;

  totalInvestment: number;
  paybackMonths: number;
  roi1y: number;
  roi3y: number;
  roi5y: number;
  netBenefit1y: number;
  netBenefit3y: number;
  netBenefit5y: number;
}

const DEFAULTS: FormData = {
  rawMeatPerDay: 1000,
  workDaysPerMonth: 22,

  oldBrineRetention: 82,
  oldThermoLoss: 9,
  oldDefectPercent: 4,
  oldBrineLossKg: 70,
  oldEnergyPerCycle: 17.5,
  oldCyclesPerDay: 1.5,
  oldWorkers: 4,

  newBrineRetention: 94,
  newThermoLoss: 7,
  newDefectPercent: 0.75,
  newBrineLossKg: 20,
  newEnergyPerCycle: 10,
  newCyclesPerDay: 2.5,
  newWorkers: 2,

  rawCostPerKg: 350,
  brineCostPerKg: 80,
  energyCostPerKwh: 8,
  laborCostPerHour: 350,
  laborHoursSaved: 2,

  equipmentCost: 2800000,
  deliveryCost: 150000,
};

function fmt(n: number): string {
  if (!isFinite(n) || isNaN(n)) return "0";
  const rounded = Math.round(n);
  return rounded.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
}

function fmtDecimal(n: number, digits = 1): string {
  if (!isFinite(n) || isNaN(n)) return "0";
  return n
    .toFixed(digits)
    .replace(/\B(?=(\d{3})+(?!\d))/g, " ")
    .replace(".", ",");
}

function ClickTooltip({ children, content, className = "" }: { children: ReactNode; content: ReactNode; className?: string }) {
  const [open, setOpen] = useState(false);
  return (
    <Tooltip open={open} onOpenChange={setOpen}>
      <TooltipTrigger asChild>
        <button type="button" onClick={() => setOpen((p) => !p)} className={className}>
          {children}
        </button>
      </TooltipTrigger>
      <TooltipContent side="top" className="max-w-sm text-xs bg-gray-800 text-white px-4 py-3 rounded-lg whitespace-pre-line leading-relaxed z-[100]">
        {content}
      </TooltipContent>
    </Tooltip>
  );
}

function TooltipIcon({ text }: { text: string }) {
  return (
    <ClickTooltip
      content={text}
      className="inline-flex items-center justify-center w-5 h-5 rounded-full border border-gray-300 text-gray-400 hover:text-[#e8712a] hover:border-[#e8712a] transition-colors ml-1.5 flex-shrink-0"
    >
      <Icon name="HelpCircle" size={13} />
    </ClickTooltip>
  );
}

function FormulaTooltip({ text }: { text: string }) {
  return (
    <ClickTooltip
      content={text}
      className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-gray-100 text-gray-400 hover:text-[#e8712a] hover:bg-[#e8712a]/10 transition-colors ml-1.5 flex-shrink-0 text-xs font-bold"
    >
      ?
    </ClickTooltip>
  );
}

function NumberInput({
  label,
  value,
  onChange,
  placeholder,
  tooltip,
  step,
  min = 0,
  error,
  suffix,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  placeholder: string;
  tooltip?: string;
  step?: number;
  min?: number;
  error?: string;
  suffix?: string;
}) {
  return (
    <div className="mb-4">
      <label className="flex items-center text-sm font-medium text-[#333] mb-1.5 flex-wrap">
        <span>{label}</span>
        {tooltip && <TooltipIcon text={tooltip} />}
      </label>
      <div className="relative">
        <input
          type="number"
          value={value || ""}
          onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
          placeholder={placeholder}
          step={step || 1}
          min={min}
          className={`w-full px-4 py-2.5 bg-white border rounded-lg text-[#333] text-sm focus:outline-none focus:ring-2 focus:ring-[#e8712a]/30 focus:border-[#e8712a] transition-all ${
            error ? "border-red-400 ring-2 ring-red-100" : "border-gray-200"
          } ${suffix ? "pr-14" : ""}`}
        />
        {suffix && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400">
            {suffix}
          </span>
        )}
      </div>
      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
  );
}

function SliderInput({
  label,
  value,
  onChange,
  min,
  max,
  step = 1,
  tooltip,
  suffix = "%",
  decimals = 0,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  min: number;
  max: number;
  step?: number;
  tooltip?: string;
  suffix?: string;
  decimals?: number;
}) {
  const display = decimals > 0 ? value.toFixed(decimals).replace(".", ",") : String(value);
  return (
    <div className="mb-4">
      <label className="flex items-center text-sm font-medium text-[#333] mb-1.5 flex-wrap">
        <span>{label}: <strong>{display}{suffix}</strong></span>
        {tooltip && <TooltipIcon text={tooltip} />}
      </label>
      <div className="pt-2 pb-1 px-1">
        <Slider
          value={[value]}
          onValueChange={([v]) => onChange(v)}
          min={min}
          max={max}
          step={step}
          className="[&_[role=slider]]:bg-[#e8712a] [&_[role=slider]]:border-[#e8712a] [&_span[data-orientation=horizontal]>span]:bg-[#e8712a]"
        />
        <div className="flex justify-between text-xs text-gray-400 mt-1">
          <span>{decimals > 0 ? min.toFixed(decimals).replace(".", ",") : min}{suffix}</span>
          <span>{decimals > 0 ? max.toFixed(decimals).replace(".", ",") : max}{suffix}</span>
        </div>
      </div>
    </div>
  );
}

function Card({
  title,
  subtitle,
  icon,
  children,
}: {
  title: string;
  subtitle?: string;
  icon: string;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 sm:p-7">
      <div className="flex items-center gap-3 mb-5">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ backgroundColor: `${ACCENT}15` }}
        >
          <Icon name={icon} fallback="Settings" size={20} className="text-[#e8712a]" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-[#333]">{title}</h3>
          {subtitle && (
            <p className="text-xs text-gray-500 mt-0.5">{subtitle}</p>
          )}
        </div>
      </div>
      {children}
    </div>
  );
}

function MetricCard({
  label,
  value,
  sub,
  icon,
  tooltip,
}: {
  label: string;
  value: string;
  sub: string;
  icon: string;
  tooltip?: string;
}) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 sm:p-6 flex flex-col items-center text-center">
      <div
        className="w-12 h-12 rounded-xl flex items-center justify-center mb-3"
        style={{ backgroundColor: `${ACCENT}15` }}
      >
        <Icon name={icon} fallback="TrendingUp" size={24} className="text-[#e8712a]" />
      </div>
      <div className="text-2xl sm:text-3xl font-extrabold text-[#333] mb-1 flex items-center gap-1">
        {value}
        {tooltip && <FormulaTooltip text={tooltip} />}
      </div>
      <div className="text-sm font-semibold text-[#333]">{label}</div>
      <div className="text-xs text-gray-500 mt-0.5">{sub}</div>
    </div>
  );
}

function SavingsRow({
  label,
  value,
  bold,
  tooltip,
}: {
  label: string;
  value: number;
  bold?: boolean;
  tooltip?: string;
}) {
  const isNeg = value < 0;
  return (
    <div
      className={`flex items-center justify-between py-2.5 ${
        bold ? "border-t-2 border-gray-200 pt-3 mt-1" : ""
      }`}
    >
      <span
        className={`text-sm flex items-center ${bold ? "font-bold text-[#333]" : "text-gray-600"}`}
      >
        {label}
        {tooltip && <FormulaTooltip text={tooltip} />}
      </span>
      <span
        className={`text-sm font-semibold tabular-nums ${
          isNeg ? "text-red-500" : bold ? "text-[#e8712a]" : "text-[#333]"
        }`}
      >
        {isNeg ? "−" : ""}
        {fmt(Math.abs(value))} ₽/сут
      </span>
    </div>
  );
}

function isValidPhone(v: string): boolean {
  const digits = v.replace(/\D/g, "");
  if (/^[78]\d{10}$/.test(digits)) return true;
  if (/^375\d{9}$/.test(digits)) return true;
  return false;
}

function formatPhone(prev: string, next: string): string {
  let raw = next.replace(/[^\d+]/g, "");
  if (raw.startsWith("8")) raw = "7" + raw.slice(1);
  if (/^[9]/.test(raw)) raw = "7" + raw;
  raw = raw.replace(/\+/g, "");
  const isBy = raw.startsWith("375");
  const maxDigits = isBy ? 12 : 11;
  raw = raw.slice(0, maxDigits);
  if (!raw) return "";
  return "+" + raw;
}

export default function CalculatorMassager() {
  const [form, setForm] = useState<FormData>({ ...DEFAULTS });
  const [results, setResults] = useState<CalcResults | null>(null);
  const [showResults, setShowResults] = useState(false);
  const [fosOpen, setFosOpen] = useState(false);
  const [fosName, setFosName] = useState("");
  const [fosPhone, setFosPhone] = useState("");
  const [fosPhoneTouched, setFosPhoneTouched] = useState(false);
  const [fosSent, setFosSent] = useState(false);
  const [fosSending, setFosSending] = useState(false);
  const [fosConsent, setFosConsent] = useState(false);
  const resultsRef = useRef<HTMLDivElement>(null);
  const { sendLead } = useLeadForm();

  useEffect(() => {
    document.title =
      "Калькулятор окупаемости мясомассажёра — Техно-Сиб";
    const meta = document.createElement("meta");
    meta.name = "robots";
    meta.content = "noindex, nofollow";
    document.head.appendChild(meta);
    return () => {
      document.head.removeChild(meta);
    };
  }, []);

  const set = useCallback(
    (key: keyof FormData, value: number) =>
      setForm((prev) => ({ ...prev, [key]: value })),
    []
  );

  const computeResults = useCallback((d: FormData) => {
    const brineAdded = d.rawMeatPerDay * BRINE_INJECTION_RATE;

    const oldBrineKg = brineAdded * (d.oldBrineRetention / 100);
    const oldMassAfter = d.rawMeatPerDay + oldBrineKg;
    const oldThermoLossKg = oldMassAfter * (d.oldThermoLoss / 100);
    const oldYieldKg = oldMassAfter - oldThermoLossKg;
    const oldYieldPercent = (oldYieldKg / d.rawMeatPerDay) * 100;
    const oldDefectKg = d.rawMeatPerDay * (d.oldDefectPercent / 100);

    const newBrineKg = brineAdded * (d.newBrineRetention / 100);
    const newMassAfter = d.rawMeatPerDay + newBrineKg;
    const newThermoLossKg = newMassAfter * (d.newThermoLoss / 100);
    const newYieldKg = newMassAfter - newThermoLossKg;
    const newYieldPercent = (newYieldKg / d.rawMeatPerDay) * 100;
    const newDefectKg = d.rawMeatPerDay * (d.newDefectPercent / 100);

    const diffYieldKg = newYieldKg - oldYieldKg;
    const diffDefectKg = oldDefectKg - newDefectKg;
    const diffBrineLossKg = d.oldBrineLossKg - d.newBrineLossKg;
    const diffEnergyKwh =
      d.oldEnergyPerCycle * d.oldCyclesPerDay -
      d.newEnergyPerCycle * d.newCyclesPerDay;

    const savYieldPerDay = diffYieldKg * d.rawCostPerKg;
    const savDefectPerDay = diffDefectKg * d.rawCostPerKg;
    const savBrinePerDay = diffBrineLossKg * d.brineCostPerKg;
    const savEnergyPerDay = diffEnergyKwh * d.energyCostPerKwh;
    const savLaborPerDay = d.laborHoursSaved * d.laborCostPerHour;
    const totalSavPerDay =
      savYieldPerDay + savDefectPerDay + savBrinePerDay + savEnergyPerDay + savLaborPerDay;
    const totalSavPerMonth = totalSavPerDay * d.workDaysPerMonth;
    const totalSavPerYear = totalSavPerMonth * 12;

    const totalInvestment = d.equipmentCost + d.deliveryCost;
    const paybackMonths =
      totalSavPerMonth > 0 ? totalInvestment / totalSavPerMonth : Infinity;

    const roi1y =
      totalInvestment > 0
        ? ((totalSavPerYear - totalInvestment) / totalInvestment) * 100
        : 0;
    const roi3y =
      totalInvestment > 0
        ? ((totalSavPerYear * 3 - totalInvestment) / totalInvestment) * 100
        : 0;
    const roi5y =
      totalInvestment > 0
        ? ((totalSavPerYear * 5 - totalInvestment) / totalInvestment) * 100
        : 0;

    const netBenefit1y = totalSavPerYear - totalInvestment;
    const netBenefit3y = totalSavPerYear * 3 - totalInvestment;
    const netBenefit5y = totalSavPerYear * 5 - totalInvestment;

    return {
      oldBrineKg, oldMassAfter, oldThermoLossKg, oldYieldKg, oldYieldPercent, oldDefectKg,
      newBrineKg, newMassAfter, newThermoLossKg, newYieldKg, newYieldPercent, newDefectKg,
      diffYieldKg, diffDefectKg, diffBrineLossKg, diffEnergyKwh,
      savYieldPerDay, savDefectPerDay, savBrinePerDay, savEnergyPerDay, savLaborPerDay,
      totalSavPerDay, totalSavPerMonth, totalSavPerYear,
      totalInvestment, paybackMonths, roi1y, roi3y, roi5y,
      netBenefit1y, netBenefit3y, netBenefit5y,
    };
  }, []);

  useEffect(() => {
    if (fosSent && showResults) {
      setResults(computeResults(form));
    }
     
  }, [form, fosSent, showResults, computeResults]);

  const calculate = () => {
    const r = computeResults(form);
    setResults(r);
    if (!fosSent) {
      setFosOpen(true);
      return;
    }
    setShowResults(true);
    setTimeout(() => {
      resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 100);
  };

  const handleFosSubmit = async () => {
    if (!fosName.trim() || !isValidPhone(fosPhone) || !fosConsent || fosSending) return;
    setFosSending(true);
    try {
      await sendLead({
        name: fosName,
        phone: fosPhone,
        comment: "Лид из калькулятора окупаемости мясомассажёра",
        formType: "modal",
      });
    } catch (_e) { /* ignore */ }
    setFosSending(false);
    setFosSent(true);
    setFosOpen(false);
    setShowResults(true);
    requestAnimationFrame(() => {
      setTimeout(() => {
        resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 50);
    });
  };

  const reset = () => {
    setForm({ ...DEFAULTS });
    setShowResults(false);
    setResults(null);
  };



  const paybackDisplay = () => {
    if (!results) return "";
    if (!isFinite(results.paybackMonths) || results.paybackMonths <= 0)
      return "—";
    const m = results.paybackMonths;
    if (m < 1) return "< 1 мес.";
    if (m >= 120) return "> 10 лет";
    if (m < 12) return `${Math.ceil(m)} мес.`;
    const y = Math.floor(m / 12);
    const rm = Math.ceil(m % 12);
    return rm > 0 ? `${y} г. ${rm} мес.` : `${y} г.`;
  };

  return (
    <div className="min-h-screen" style={{ background: "#fafafa", color: "#333", fontFamily: "'Inter', 'Onest', system-ui, sans-serif" }}>

      <header className="bg-white border-b border-gray-100 sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4 flex items-center gap-4">
          <a href="/">
            <img src={LOGO_URL} alt="Техно-Сиб" className="h-8 sm:h-9 w-auto object-contain" />
          </a>
          <div className="h-8 w-px bg-gray-200 hidden sm:block" />
          <div className="min-w-0 flex-1">
            <h1 className="text-base sm:text-lg font-bold text-[#333] leading-tight truncate">
              Калькулятор окупаемости мясомассажёра
            </h1>
          </div>
          <a
            href="/"
            className="hidden sm:inline-flex items-center gap-2 px-5 py-2.5 bg-[#2563eb] text-white rounded-lg font-semibold text-sm hover:bg-[#1d4ed8] transition-all shadow-sm"
          >
            <Icon name="ShoppingCart" size={16} />
            Подобрать мясомассажёр
          </a>
          <a
            href="/"
            className="sm:hidden flex items-center justify-center w-10 h-10 bg-[#2563eb] text-white rounded-lg"
          >
            <Icon name="ShoppingCart" size={18} />
          </a>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <div className="text-center mb-10">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#333] mb-3">
            Калькулятор окупаемости мясомассажёра
          </h2>
          <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto mb-2">
            Сравните старый и новый массажёр: выход продукции, потери, брак, энергия. Рассчитайте экономию и срок окупаемости за 2 минуты.
          </p>
          <p className="text-xs text-gray-400 max-w-xl mx-auto">
            Результат расчёта носит ориентировочный характер. Для точного расчёта свяжитесь с нашими специалистами.
          </p>
        </div>

        <div className="space-y-6">
          <Card
            title="Параметры производства"
            subtitle="Общие параметры загрузки и графика работы"
            icon="Factory"
          >
            <div className="grid sm:grid-cols-2 gap-x-6">
              <NumberInput
                label="Загрузка мясного сырья (кг/сутки)"
                value={form.rawMeatPerDay}
                onChange={(v) => set("rawMeatPerDay", v)}
                placeholder="1000"
                tooltip="Количество мясного сырья, загружаемого в массажёр за сутки"
                suffix="кг"
              />
              <NumberInput
                label="Рабочих дней в месяц"
                value={form.workDaysPerMonth}
                onChange={(v) => set("workDaysPerMonth", v)}
                placeholder="22"
                suffix="дн."
              />
            </div>
          </Card>

          <Card
            title="Текущее оборудование (старый массажёр)"
            subtitle="Параметры процесса массирования на существующем оборудовании"
            icon="Warehouse"
          >
            <div className="grid sm:grid-cols-2 gap-x-6">
              <SliderInput
                label="Удержание рассола"
                value={form.oldBrineRetention}
                onChange={(v) => set("oldBrineRetention", v)}
                min={70}
                max={90}
                step={1}
                tooltip="Процент рассола, который удерживается в мясе после массирования. У старых массажёров обычно 80-85%."
              />
              <SliderInput
                label="Потери при термообработке"
                value={form.oldThermoLoss}
                onChange={(v) => set("oldThermoLoss", v)}
                min={5}
                max={15}
                step={0.5}
                tooltip="Потеря массы при термообработке (варке, копчении). У старого оборудования обычно 8-10%."
              />
              <SliderInput
                label="Технологический брак"
                value={form.oldDefectPercent}
                onChange={(v) => set("oldDefectPercent", v)}
                min={1}
                max={8}
                step={0.5}
                tooltip="Процент брака от загрузки сырья. При старом оборудовании обычно 3-5%."
              />
              <NumberInput
                label="Потери рассола в отжим/слив (кг)"
                value={form.oldBrineLossKg}
                onChange={(v) => set("oldBrineLossKg", v)}
                placeholder="70"
                tooltip="Количество рассола, теряемого при сливе/отжиме за сутки"
                suffix="кг"
              />
              <NumberInput
                label="Расход электроэнергии (кВт·ч/цикл)"
                value={form.oldEnergyPerCycle}
                onChange={(v) => set("oldEnergyPerCycle", v)}
                placeholder="17.5"
                step={0.5}
                tooltip="Потребление электроэнергии за один цикл массирования. У старых массажёров обычно 15-20 кВт·ч."
                suffix="кВт·ч"
              />
              <NumberInput
                label="Количество циклов в сутки"
                value={form.oldCyclesPerDay}
                onChange={(v) => set("oldCyclesPerDay", v)}
                placeholder="1.5"
                step={0.5}
                tooltip="Сколько полных циклов массирования выполняется за сутки. У старых массажёров обычно 1-2."
                suffix="шт"
              />
              <NumberInput
                label="Рабочих на участке"
                value={form.oldWorkers}
                onChange={(v) => set("oldWorkers", v)}
                placeholder="4"
                suffix="чел."
              />
            </div>
          </Card>

          <Card
            title="Новое оборудование (вакуумный массажёр)"
            subtitle="Параметры нового вакуумного массажёра"
            icon="Cog"
          >
            <div className="grid sm:grid-cols-2 gap-x-6">
              <SliderInput
                label="Удержание рассола"
                value={form.newBrineRetention}
                onChange={(v) => set("newBrineRetention", v)}
                min={85}
                max={99}
                step={1}
                tooltip="Процент удержания рассола у нового вакуумного массажёра. Обычно 92-96%."
              />
              <SliderInput
                label="Потери при термообработке"
                value={form.newThermoLoss}
                onChange={(v) => set("newThermoLoss", v)}
                min={3}
                max={10}
                step={0.5}
                tooltip="Потери при термообработке с новым оборудованием. Обычно 6-8% благодаря лучшему удержанию влаги."
              />
              <SliderInput
                label="Технологический брак"
                value={form.newDefectPercent}
                onChange={(v) => set("newDefectPercent", v)}
                min={0.1}
                max={5}
                step={0.1}
                decimals={1}
                tooltip="Процент брака с новым оборудованием. Вакуумные массажёры обеспечивают равномерное распределение рассола, снижая брак до 0,5-1%."
              />
              <NumberInput
                label="Потери рассола в отжим/слив (кг)"
                value={form.newBrineLossKg}
                onChange={(v) => set("newBrineLossKg", v)}
                placeholder="20"
                tooltip="Потери рассола при работе нового оборудования. Значительно ниже за счёт вакуумной технологии."
                suffix="кг"
              />
              <NumberInput
                label="Расход электроэнергии (кВт·ч/цикл)"
                value={form.newEnergyPerCycle}
                onChange={(v) => set("newEnergyPerCycle", v)}
                placeholder="10"
                step={0.5}
                tooltip="Потребление электроэнергии за один цикл. У новых вакуумных массажёров обычно 8-12 кВт·ч."
                suffix="кВт·ч"
              />
              <NumberInput
                label="Количество циклов в сутки"
                value={form.newCyclesPerDay}
                onChange={(v) => set("newCyclesPerDay", v)}
                placeholder="2.5"
                step={0.5}
                tooltip="Количество циклов за сутки. Новое оборудование позволяет делать 2-3 цикла."
                suffix="шт"
              />
              <NumberInput
                label="Рабочих на участке"
                value={form.newWorkers}
                onChange={(v) => set("newWorkers", v)}
                placeholder="2"
                suffix="чел."
              />
            </div>
          </Card>

          <Card
            title="Стоимости и инвестиции"
            subtitle="Цены на сырьё, энергию, труд и стоимость оборудования"
            icon="BadgeRussianRuble"
          >
            <div className="grid sm:grid-cols-2 gap-x-6">
              <NumberInput
                label="Стоимость сырья / готовой продукции (руб/кг)"
                value={form.rawCostPerKg}
                onChange={(v) => set("rawCostPerKg", v)}
                placeholder="350"
                tooltip="Средняя стоимость 1 кг готовой продукции. Используется для расчёта экономии от дополнительного выхода и снижения брака."
                suffix="руб/кг"
              />
              <NumberInput
                label="Стоимость рассола / ингредиентов (руб/кг)"
                value={form.brineCostPerKg}
                onChange={(v) => set("brineCostPerKg", v)}
                placeholder="80"
                tooltip="Средняя стоимость 1 кг рассола и ингредиентов для массирования."
                suffix="руб/кг"
              />
              <NumberInput
                label="Тариф электроэнергии (руб/кВт·ч)"
                value={form.energyCostPerKwh}
                onChange={(v) => set("energyCostPerKwh", v)}
                placeholder="8"
                suffix="руб"
              />
              <NumberInput
                label="Стоимость человеко-часа (руб)"
                value={form.laborCostPerHour}
                onChange={(v) => set("laborCostPerHour", v)}
                placeholder="350"
                tooltip="Средняя стоимость одного человеко-часа работы на участке массирования с учётом налогов."
                suffix="руб/ч"
              />
              <NumberInput
                label="Экономия трудозатрат (чел·ч/сутки)"
                value={form.laborHoursSaved}
                onChange={(v) => set("laborHoursSaved", v)}
                placeholder="2"
                step={0.5}
                tooltip="Сокращение трудозатрат в человеко-часах за сутки при переходе на новое оборудование."
                suffix="чел·ч"
              />
              <div className="hidden sm:block" />
              <NumberInput
                label="Стоимость оборудования (руб)"
                value={form.equipmentCost}
                onChange={(v) => set("equipmentCost", v)}
                placeholder="2 800 000"
                suffix="руб"
              />
              <NumberInput
                label="Доставка и монтаж (руб)"
                value={form.deliveryCost}
                onChange={(v) => set("deliveryCost", v)}
                placeholder="150 000"
                suffix="руб"
              />
            </div>
          </Card>

          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={calculate}
              className="flex-1 px-8 py-4 rounded-xl text-white font-bold text-lg shadow-lg hover:shadow-xl transition-all active:scale-[0.98]"
              style={{ backgroundColor: ACCENT }}
            >
              Рассчитать окупаемость
            </button>
            <button
              onClick={reset}
              className="px-8 py-4 rounded-xl border-2 border-gray-200 text-gray-500 font-semibold text-lg hover:border-gray-300 hover:text-gray-700 transition-all"
            >
              Сбросить
            </button>
          </div>
        </div>

        {showResults && results && (
          <div
            ref={resultsRef}
            className="mt-12 space-y-8 animate-in fade-in duration-700"
          >
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#333] text-center mb-2">
              Результаты расчёта
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <MetricCard
                label="Экономия в сутки"
                value={`${fmt(results.totalSavPerDay)} ₽`}
                sub="суммарная экономия за рабочий день"
                icon="CalendarCheck"
                tooltip={`${fmt(results.savYieldPerDay)} + ${fmt(results.savDefectPerDay)} + ${fmt(results.savBrinePerDay)} + ${fmt(results.savEnergyPerDay)} + ${fmt(results.savLaborPerDay)}\n= ${fmt(results.totalSavPerDay)} ₽/сут`}
              />
              <MetricCard
                label="Экономия в месяц"
                value={`${fmt(results.totalSavPerMonth)} ₽`}
                sub={`${form.workDaysPerMonth} рабочих дней`}
                icon="PiggyBank"
                tooltip={`${fmt(results.totalSavPerDay)} ₽/сут × ${form.workDaysPerMonth} дн\n= ${fmt(results.totalSavPerMonth)} ₽/мес`}
              />
              <MetricCard
                label="Срок окупаемости"
                value={paybackDisplay()}
                sub="простой срок окупаемости"
                icon="Clock"
                tooltip={`Инвестиции / Экономия в месяц\n${fmt(results.totalInvestment)} ₽ / ${fmt(results.totalSavPerMonth)} ₽/мес\n= ${fmtDecimal(results.paybackMonths)} мес.\n\nИнвестиции: ${fmt(form.equipmentCost)} + ${fmt(form.deliveryCost)} = ${fmt(results.totalInvestment)} ₽`}
              />
              <MetricCard
                label="ROI за 1 год"
                value={`${fmtDecimal(results.roi1y)}%`}
                sub="возврат на инвестиции"
                icon="TrendingUp"
                tooltip={`(Экономия за год − Инвестиции) / Инвестиции × 100%\n(${fmt(results.totalSavPerYear)} − ${fmt(results.totalInvestment)}) / ${fmt(results.totalInvestment)} × 100%\n= ${fmtDecimal(results.roi1y)}%`}
              />
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 sm:p-7">
              <h3 className="text-lg font-bold text-[#333] mb-4 flex items-center gap-2">
                <Icon name="ArrowLeftRight" fallback="BarChart" size={20} className="text-[#e8712a]" />
                Сравнительная таблица процесса
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b-2 border-gray-200">
                      <th className="text-left py-3 pr-4 font-semibold text-gray-500">Параметр</th>
                      <th className="text-right py-3 px-4 font-semibold text-gray-500">Старый</th>
                      <th className="text-right py-3 px-4 font-semibold text-[#e8712a]">Новый</th>
                      <th className="text-right py-3 pl-4 font-semibold text-gray-500">Разница</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      {
                        label: "Загрузка мясного сырья",
                        old: `${fmt(form.rawMeatPerDay)} кг`,
                        new_: `${fmt(form.rawMeatPerDay)} кг`,
                        diff: "—",
                        diffClass: "",
                      },
                      {
                        label: "Удержание рассола",
                        old: `${form.oldBrineRetention}%`,
                        new_: `${form.newBrineRetention}%`,
                        diff: `+${form.newBrineRetention - form.oldBrineRetention}%`,
                        diffClass: "text-green-600",
                      },
                      {
                        label: "Удержанный рассол",
                        old: `${fmt(Math.round(results.oldBrineKg))} кг`,
                        new_: `${fmt(Math.round(results.newBrineKg))} кг`,
                        diff: `+${fmt(Math.round(results.newBrineKg - results.oldBrineKg))} кг`,
                        diffClass: "text-green-600",
                        tooltip: `Рассол добавлен = ${fmt(form.rawMeatPerDay)} × ${BRINE_INJECTION_RATE} = ${fmt(Math.round(form.rawMeatPerDay * BRINE_INJECTION_RATE))} кг\nСтарый: ${fmt(Math.round(form.rawMeatPerDay * BRINE_INJECTION_RATE))} × ${form.oldBrineRetention}% = ${fmt(Math.round(results.oldBrineKg))} кг\nНовый: ${fmt(Math.round(form.rawMeatPerDay * BRINE_INJECTION_RATE))} × ${form.newBrineRetention}% = ${fmt(Math.round(results.newBrineKg))} кг`,
                      },
                      {
                        label: "Масса после массирования",
                        old: `${fmt(Math.round(results.oldMassAfter))} кг`,
                        new_: `${fmt(Math.round(results.newMassAfter))} кг`,
                        diff: `+${fmt(Math.round(results.newMassAfter - results.oldMassAfter))} кг`,
                        diffClass: "text-green-600",
                      },
                      {
                        label: "Потери при термообработке",
                        old: `${form.oldThermoLoss}% (${fmt(Math.round(results.oldThermoLossKg))} кг)`,
                        new_: `${form.newThermoLoss}% (${fmt(Math.round(results.newThermoLossKg))} кг)`,
                        diff: `−${fmt(Math.round(results.oldThermoLossKg - results.newThermoLossKg))} кг`,
                        diffClass: "text-green-600",
                      },
                      {
                        label: "Выход готовой продукции",
                        old: `${fmt(Math.round(results.oldYieldKg))} кг (${fmtDecimal(results.oldYieldPercent)}%)`,
                        new_: `${fmt(Math.round(results.newYieldKg))} кг (${fmtDecimal(results.newYieldPercent)}%)`,
                        diff: `+${fmt(Math.round(results.diffYieldKg))} кг (+${fmtDecimal(results.newYieldPercent - results.oldYieldPercent)}%)`,
                        diffClass: "text-green-600 font-bold",
                        tooltip: `Старый: ${fmt(Math.round(results.oldMassAfter))} − ${fmt(Math.round(results.oldThermoLossKg))} = ${fmt(Math.round(results.oldYieldKg))} кг\nНовый: ${fmt(Math.round(results.newMassAfter))} − ${fmt(Math.round(results.newThermoLossKg))} = ${fmt(Math.round(results.newYieldKg))} кг\nРазница: +${fmt(Math.round(results.diffYieldKg))} кг`,
                      },
                      {
                        label: "Технологический брак",
                        old: `${fmtDecimal(form.oldDefectPercent)}% (${fmt(Math.round(results.oldDefectKg))} кг)`,
                        new_: `${fmtDecimal(form.newDefectPercent)}% (${fmt(Math.round(results.newDefectKg))} кг)`,
                        diff: `−${fmt(Math.round(results.diffDefectKg))} кг`,
                        diffClass: "text-green-600",
                      },
                      {
                        label: "Потери рассола в отжим/слив",
                        old: `${fmt(form.oldBrineLossKg)} кг`,
                        new_: `${fmt(form.newBrineLossKg)} кг`,
                        diff: `−${fmt(results.diffBrineLossKg)} кг`,
                        diffClass: "text-green-600",
                      },
                      {
                        label: "Расход электроэнергии/сутки",
                        old: `${fmtDecimal(form.oldEnergyPerCycle * form.oldCyclesPerDay)} кВт·ч`,
                        new_: `${fmtDecimal(form.newEnergyPerCycle * form.newCyclesPerDay)} кВт·ч`,
                        diff: `${results.diffEnergyKwh >= 0 ? "−" : "+"}${fmtDecimal(Math.abs(results.diffEnergyKwh))} кВт·ч`,
                        diffClass: results.diffEnergyKwh >= 0 ? "text-green-600" : "text-red-500",
                        tooltip: `Старый: ${fmtDecimal(form.oldEnergyPerCycle)} кВт·ч × ${fmtDecimal(form.oldCyclesPerDay)} цикл = ${fmtDecimal(form.oldEnergyPerCycle * form.oldCyclesPerDay)} кВт·ч/сут\nНовый: ${fmtDecimal(form.newEnergyPerCycle)} кВт·ч × ${fmtDecimal(form.newCyclesPerDay)} цикл = ${fmtDecimal(form.newEnergyPerCycle * form.newCyclesPerDay)} кВт·ч/сут`,
                      },
                      {
                        label: "Количество циклов в сутки",
                        old: `${fmtDecimal(form.oldCyclesPerDay)}`,
                        new_: `${fmtDecimal(form.newCyclesPerDay)}`,
                        diff: `+${fmtDecimal(form.newCyclesPerDay - form.oldCyclesPerDay)}`,
                        diffClass: "text-green-600",
                      },
                      {
                        label: "Рабочие на участке",
                        old: `${form.oldWorkers} чел.`,
                        new_: `${form.newWorkers} чел.`,
                        diff: `−${form.oldWorkers - form.newWorkers} чел.`,
                        diffClass: form.oldWorkers > form.newWorkers ? "text-green-600" : "",
                      },
                    ].map((row) => (
                      <tr key={row.label} className="border-b border-gray-50">
                        <td className="py-2.5 pr-4 text-gray-600 flex items-center">
                          {row.label}
                          {row.tooltip && <FormulaTooltip text={row.tooltip} />}
                        </td>
                        <td className="py-2.5 px-4 text-right tabular-nums text-[#333]">{row.old}</td>
                        <td className="py-2.5 px-4 text-right tabular-nums text-[#333] font-medium">{row.new_}</td>
                        <td className={`py-2.5 pl-4 text-right tabular-nums font-semibold ${row.diffClass}`}>{row.diff}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 sm:p-7">
              <h3 className="text-lg font-bold text-[#333] mb-4 flex items-center gap-2">
                <Icon name="PieChart" fallback="BarChart" size={20} className="text-[#e8712a]" />
                Структура экономии (в сутки)
              </h3>
              <SavingsRow
                label={`Дополнительный выход продукции (+${fmt(Math.round(results.diffYieldKg))} кг)`}
                value={results.savYieldPerDay}
                tooltip={`+${fmt(Math.round(results.diffYieldKg))} кг × ${fmt(form.rawCostPerKg)} руб/кг\n= ${fmt(results.savYieldPerDay)} руб/сут`}
              />
              <SavingsRow
                label={`Снижение брака (−${fmt(Math.round(results.diffDefectKg))} кг)`}
                value={results.savDefectPerDay}
                tooltip={`−${fmt(Math.round(results.diffDefectKg))} кг × ${fmt(form.rawCostPerKg)} руб/кг\n= ${fmt(results.savDefectPerDay)} руб/сут`}
              />
              <SavingsRow
                label={`Экономия рассола и ингредиентов (−${fmt(results.diffBrineLossKg)} кг)`}
                value={results.savBrinePerDay}
                tooltip={`−${fmt(results.diffBrineLossKg)} кг × ${fmt(form.brineCostPerKg)} руб/кг\n= ${fmt(results.savBrinePerDay)} руб/сут`}
              />
              <SavingsRow
                label={`Экономия электроэнергии (−${fmtDecimal(Math.abs(results.diffEnergyKwh))} кВт·ч)`}
                value={results.savEnergyPerDay}
                tooltip={`−${fmtDecimal(Math.abs(results.diffEnergyKwh))} кВт·ч × ${fmt(form.energyCostPerKwh)} руб\n= ${fmt(results.savEnergyPerDay)} руб/сут`}
              />
              <SavingsRow
                label={`Снижение трудозатрат (−${fmtDecimal(form.laborHoursSaved)} чел·ч)`}
                value={results.savLaborPerDay}
                tooltip={`−${fmtDecimal(form.laborHoursSaved)} чел·ч × ${fmt(form.laborCostPerHour)} руб\n= ${fmt(results.savLaborPerDay)} руб/сут`}
              />
              <SavingsRow
                label="ИТОГО экономия в сутки"
                value={results.totalSavPerDay}
                bold
                tooltip={`${fmt(results.savYieldPerDay)} + ${fmt(results.savDefectPerDay)} + ${fmt(results.savBrinePerDay)} + ${fmt(results.savEnergyPerDay)} + ${fmt(results.savLaborPerDay)}\n= ${fmt(results.totalSavPerDay)} руб/сут`}
              />
              <div className="mt-4 pt-4 border-t border-gray-100">
                <div className="flex items-center justify-between py-2">
                  <span className="text-sm font-semibold text-[#333] flex items-center">
                    Экономия в месяц ({form.workDaysPerMonth} смен)
                    <FormulaTooltip text={`${fmt(results.totalSavPerDay)} × ${form.workDaysPerMonth} = ${fmt(results.totalSavPerMonth)} руб/мес`} />
                  </span>
                  <span className="text-lg font-extrabold text-[#e8712a] tabular-nums">
                    {fmt(results.totalSavPerMonth)} ₽
                  </span>
                </div>
                <div className="flex items-center justify-between py-2">
                  <span className="text-sm font-semibold text-[#333] flex items-center">
                    Экономия в год
                    <FormulaTooltip text={`${fmt(results.totalSavPerMonth)} × 12 = ${fmt(results.totalSavPerYear)} руб/год`} />
                  </span>
                  <span className="text-lg font-extrabold text-[#e8712a] tabular-nums">
                    {fmt(results.totalSavPerYear)} ₽
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 sm:p-7">
              <h3 className="text-lg font-bold text-[#333] mb-4 flex items-center gap-2">
                <Icon name="LineChart" fallback="TrendingUp" size={20} className="text-[#e8712a]" />
                Возврат инвестиций по периодам
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 pr-4 font-semibold text-gray-500">
                        Период
                      </th>
                      <th className="text-right py-3 px-4 font-semibold text-gray-500">
                        Общая экономия
                      </th>
                      <th className="text-right py-3 px-4 font-semibold text-gray-500">
                        За вычетом инвестиций
                      </th>
                      <th className="text-right py-3 pl-4 font-semibold text-gray-500">
                        ROI
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      {
                        period: "1 год",
                        months: 12,
                        benefit: results.totalSavPerYear,
                        net: results.netBenefit1y,
                        roi: results.roi1y,
                      },
                      {
                        period: "3 года",
                        months: 36,
                        benefit: results.totalSavPerYear * 3,
                        net: results.netBenefit3y,
                        roi: results.roi3y,
                      },
                      {
                        period: "5 лет",
                        months: 60,
                        benefit: results.totalSavPerYear * 5,
                        net: results.netBenefit5y,
                        roi: results.roi5y,
                      },
                    ].map((row) => (
                      <tr key={row.period} className="border-b border-gray-50">
                        <td className="py-3 pr-4 font-semibold text-[#333]">
                          {row.period}
                        </td>
                        <td className="py-3 px-4 text-right tabular-nums text-[#333]">
                          <span className="inline-flex items-center gap-1">
                            {fmt(row.benefit)} ₽
                            <FormulaTooltip text={`${fmt(results.totalSavPerMonth)} ₽/мес × ${row.months} мес`} />
                          </span>
                        </td>
                        <td
                          className={`py-3 px-4 text-right tabular-nums font-semibold ${
                            row.net < 0 ? "text-red-500" : "text-green-600"
                          }`}
                        >
                          <span className="inline-flex items-center gap-1">
                            {row.net < 0 ? "−" : ""}
                            {fmt(Math.abs(row.net))} ₽
                            <FormulaTooltip text={`${fmt(row.benefit)} − ${fmt(results.totalInvestment)} (инвестиции)`} />
                          </span>
                        </td>
                        <td
                          className={`py-3 pl-4 text-right tabular-nums font-bold ${
                            row.roi < 0 ? "text-red-500" : "text-[#e8712a]"
                          }`}
                        >
                          <span className="inline-flex items-center gap-1">
                            {fmtDecimal(row.roi)}%
                            <FormulaTooltip text={`(${fmt(row.benefit)} − ${fmt(results.totalInvestment)}) / ${fmt(results.totalInvestment)} × 100%`} />
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="bg-gradient-to-br from-[#e8712a]/5 via-white to-[#e8712a]/10 rounded-2xl border border-[#e8712a]/20 p-6 sm:p-8">
              <h3 className="text-xl sm:text-2xl font-extrabold text-[#333] mb-2 text-center">
                Получите детальный расчёт под ваше производство
              </h3>
              <p className="text-sm text-gray-500 text-center mb-6 max-w-lg mx-auto">
                Наш технолог проверит параметры, уточнит данные и подготовит персональное коммерческое предложение
              </p>
              {fosSent ? (
                <div className="text-center py-8">
                  <div
                    className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
                    style={{ backgroundColor: `${ACCENT}15` }}
                  >
                    <Icon name="CheckCircle" size={32} className="text-[#e8712a]" />
                  </div>
                  <p className="text-lg font-bold text-[#333]">Заявка отправлена!</p>
                  <p className="text-sm text-gray-500 mt-1">
                    Наш специалист свяжется с вами в течение рабочего дня.
                  </p>
                </div>
              ) : (
                <div className="text-center py-6">
                  <p className="text-sm text-gray-500 mb-4">Оставьте контакты — технолог подготовит персональное КП</p>
                  <button
                    onClick={() => setFosOpen(true)}
                    className="px-8 py-3.5 rounded-xl text-white font-bold text-base shadow-lg hover:shadow-xl transition-all active:scale-[0.98]"
                    style={{ backgroundColor: ACCENT }}
                  >
                    Получить персональный расчёт
                  </button>
                </div>
              )}
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 sm:p-7">
              <h3 className="text-lg font-bold text-[#333] mb-4 flex items-center gap-2">
                <Icon name="BookOpen" fallback="FileText" size={20} className="text-[#e8712a]" />
                Методология расчёта
              </h3>
              <Accordion type="multiple" className="w-full">
                <AccordionItem value="process">
                  <AccordionTrigger className="text-sm font-semibold text-[#333] hover:text-[#e8712a]">
                    Расчёт технологического процесса
                  </AccordionTrigger>
                  <AccordionContent className="text-sm text-gray-600 leading-relaxed">
                    <p className="mb-2">Модель основана на сравнении двух массажёров при одинаковой загрузке мясного сырья.</p>
                    <p className="mb-2"><strong>Объём добавленного рассола</strong> = Загрузка сырья (кг) x 0,35 (35% от массы сырья --- стандартная инъекция).</p>
                    <p className="mb-2"><strong>Удержанный рассол</strong> = Добавленный рассол x Процент удержания (%). У старых массажёров удержание 80-85%, у вакуумных --- 92-96%.</p>
                    <p className="mb-2"><strong>Масса после массирования</strong> = Загрузка сырья + Удержанный рассол.</p>
                    <p className="mb-2"><strong>Потери при термообработке</strong> = Масса после массирования x Процент потерь (%). У старых 8-10%, у новых 6-8%.</p>
                    <p className="mb-2"><strong>Выход готовой продукции</strong> = Масса после массирования - Потери при термообработке.</p>
                    <p><strong>Технологический брак</strong> = Загрузка сырья x Процент брака (%). У старых 3-5%, у вакуумных 0,5-1%.</p>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="economy">
                  <AccordionTrigger className="text-sm font-semibold text-[#333] hover:text-[#e8712a]">
                    Расчёт экономии
                  </AccordionTrigger>
                  <AccordionContent className="text-sm text-gray-600 leading-relaxed">
                    <p className="mb-2">Суточная экономия складывается из пяти компонентов:</p>
                    <ul className="list-disc list-inside mb-2 space-y-1">
                      <li><strong>Дополнительный выход продукции</strong> = Разница выхода (кг) x Стоимость продукции (руб/кг)</li>
                      <li><strong>Снижение брака</strong> = Разница брака (кг) x Стоимость продукции (руб/кг)</li>
                      <li><strong>Экономия рассола и ингредиентов</strong> = Разница потерь рассола (кг) x Стоимость рассола (руб/кг)</li>
                      <li><strong>Экономия электроэнергии</strong> = Разница потребления (кВт·ч/сут) x Тариф (руб/кВт·ч)</li>
                      <li><strong>Снижение трудозатрат</strong> = Сэкономленные человеко-часы x Стоимость чел·ч</li>
                    </ul>
                    <p className="mb-2"><strong>Экономия в месяц</strong> = Экономия в сутки x Рабочих дней в месяц.</p>
                    <p><strong>Экономия в год</strong> = Экономия в месяц x 12.</p>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="payback">
                  <AccordionTrigger className="text-sm font-semibold text-[#333] hover:text-[#e8712a]">
                    Срок окупаемости
                  </AccordionTrigger>
                  <AccordionContent className="text-sm text-gray-600 leading-relaxed">
                    <p className="mb-2"><strong>Простой срок окупаемости</strong> = Полные инвестиции / Ежемесячная экономия.</p>
                    <p className="mb-2">Полные инвестиции = Стоимость оборудования + Доставка и монтаж.</p>
                    <p>Калькулятор не учитывает стоимость кредита/лизинга. Для лизинговых расчётов обращайтесь к нашим менеджерам.</p>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="roi">
                  <AccordionTrigger className="text-sm font-semibold text-[#333] hover:text-[#e8712a]">
                    ROI — возврат на инвестиции
                  </AccordionTrigger>
                  <AccordionContent className="text-sm text-gray-600 leading-relaxed">
                    <p className="mb-2"><strong>ROI за период</strong> = ((Экономия за период - Инвестиции) / Инвестиции) x 100%.</p>
                    <p className="mb-2">Калькулятор показывает ROI за три периода: 1 год, 3 года и 5 лет.</p>
                    <p>Положительный ROI означает, что инвестиции окупились и принесли прибыль. Например, ROI 309% за 1 год означает, что каждый вложенный рубль принёс 3 руб. 09 коп. чистой прибыли сверх вложений.</p>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="limits">
                  <AccordionTrigger className="text-sm font-semibold text-[#333] hover:text-[#e8712a]">
                    Допущения и ограничения
                  </AccordionTrigger>
                  <AccordionContent className="text-sm text-gray-600 leading-relaxed">
                    <p className="mb-2">Калькулятор использует следующие допущения:</p>
                    <ul className="list-disc list-inside space-y-1 mb-2">
                      <li>Объём инъецированного рассола: 35% от массы сырья (стандартная норма инъекции)</li>
                      <li>Значения по умолчанию для старого оборудования основаны на средних отраслевых показателях</li>
                      <li>Значения по умолчанию для нового оборудования основаны на характеристиках вакуумных массажёров</li>
                      <li>Расчёт не учитывает инфляцию, изменение цен на сырьё и электроэнергию</li>
                      <li>Расчёт не учитывает стоимость кредита (если оборудование приобретается в кредит/лизинг)</li>
                      <li>Фактические показатели могут отличаться в зависимости от типа продукции, рецептуры, условий производства и квалификации персонала</li>
                    </ul>
                    <p>Для получения точного расчёта с учётом всех особенностей вашего производства рекомендуем обратиться к нашим специалистам.</p>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </div>
            <div className="text-center mt-8">
              <a
                href="/"
                className="inline-flex items-center gap-3 px-10 py-5 rounded-xl bg-[#2563eb] text-white font-bold text-xl shadow-lg shadow-blue-600/25 hover:bg-[#1d4ed8] hover:shadow-xl hover:shadow-blue-600/30 transition-all active:scale-[0.98]"
              >
                <Icon name="ShoppingCart" size={22} />
                Выбрать мясомассажёр
                <Icon name="ArrowRight" size={20} />
              </a>
            </div>
          </div>
        )}
      </main>

      <footer className="bg-white border-t border-gray-100 py-6 mt-12">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-gray-400">
          <span>© Техно-Сиб, 2025. Все права защищены.</span>
          <a
            href="/"
            className="hover:text-[#e8712a] transition-colors"
          >
            Вернуться на главный сайт
          </a>
          <span>
            Данные, введённые в калькулятор, не сохраняются и не передаются третьим лицам.
          </span>
        </div>
      </footer>

      {fosOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setFosOpen(false)} />
          <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 animate-in fade-in zoom-in-95 duration-200">
            <button onClick={() => setFosOpen(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors">
              <Icon name="X" size={20} />
            </button>

            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-orange-100 mb-4">
                <Icon name="Calculator" size={28} className="text-orange-500" />
              </div>
              <h3 className="text-xl font-bold text-[#333] mb-2">
                Оставьте контакты и получите расчёт окупаемости мясомассажера
              </h3>
              <p className="text-sm text-gray-500">Результат появится сразу после отправки</p>
            </div>

            <div className="space-y-4">
              <input
                type="text"
                placeholder="Ваше имя"
                value={fosName}
                onChange={(e) => setFosName(e.target.value)}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-[#333] placeholder-gray-400 text-sm focus:outline-none focus:border-orange-400 transition-colors"
              />
              <div>
                <input
                  type="tel"
                  placeholder="+7 (___) ___-__-__"
                  value={fosPhone}
                  onChange={(e) => setFosPhone(formatPhone(fosPhone, e.target.value))}
                  onBlur={() => setFosPhoneTouched(true)}
                  className={`w-full px-4 py-3 bg-gray-50 border rounded-xl text-[#333] placeholder-gray-400 text-sm focus:outline-none transition-colors ${fosPhoneTouched && !isValidPhone(fosPhone) ? "border-red-400 focus:border-red-500" : "border-gray-200 focus:border-orange-400"}`}
                />
                {fosPhoneTouched && !isValidPhone(fosPhone) && (
                  <p className="text-xs text-red-500 mt-1">Введите номер России, Казахстана или Беларуси</p>
                )}
              </div>
              <label className="flex items-start gap-2.5 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={fosConsent}
                  onChange={(e) => setFosConsent(e.target.checked)}
                  className="mt-0.5 w-4 h-4 accent-[#e8712a] shrink-0"
                />
                <span className="text-xs text-gray-400 leading-relaxed">
                  Соглашаюсь с{" "}
                  <a href="https://t-sib.ru/assets/politika_t-sib16.05.25.pdf" target="_blank" rel="noopener noreferrer" className="text-orange-500 hover:underline">политикой обработки персональных данных</a>
                  {" "}и даю{" "}
                  <a href="https://t-sib.ru/assets/soglasie_t-sib16.05.25.pdf" target="_blank" rel="noopener noreferrer" className="text-orange-500 hover:underline">согласие на обработку персональных данных</a>.
                </span>
              </label>
              <button
                onClick={handleFosSubmit}
                disabled={!fosName.trim() || !isValidPhone(fosPhone) || !fosConsent || fosSending}
                className="w-full py-4 rounded-xl text-white font-bold text-lg shadow-lg hover:shadow-xl transition-all active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed"
                style={{ backgroundColor: ACCENT }}
              >
                {fosSending ? "Отправка..." : "Отправить"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}