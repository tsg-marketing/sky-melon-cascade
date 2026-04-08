import { useState, useEffect, useRef, useCallback } from "react";
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

const LOGO_URL =
  "https://cdn.poehali.dev/files/b643e2cd-1c2b-461b-b32b-4053b1b9e72b.jpg";
const ACCENT = "#e8712a";
const MEAT_DENSITY = 1.05;
const MAINTENANCE_RATE = 0.01;
const YIELD_INCREASE = 0.10;

interface FormData {
  volumePerDay: number;
  shiftsPerDay: number;
  shiftHours: number;
  workDaysPerMonth: number;
  currentWorkers: number;
  avgSalary: number;
  currentLossPercent: number;
  rawCostPerKg: number;
  oldEnergyPerDay: number;
  oldRepairPerMonth: number;
  equipmentCost: number;
  deliveryCost: number;
  drumVolume: number;
  loadFactor: number;
  cycleTime: number;
  newEnergyKwh: number;
  newWorkers: number;
  energyCostPerKwh: number;
  marginPerKg: number;
  hasDemand: boolean;
}

interface CalcResults {
  paybackMonths: number;
  monthlySavings: number;
  roi1y: number;
  benefit5y: number;
  savingsStaff: number;
  savingsLoss: number;
  yieldBenefit: number;
  savingsEnergy: number;
  savingsRepair: number;
  totalSavings: number;
  additionalProfit: number;
  totalMonthlyBenefit: number;
  oldCostStaff: number;
  oldCostLoss: number;
  oldCostEnergy: number;
  oldCostRepair: number;
  oldCostTotal: number;
  newCostStaff: number;
  newCostEnergy: number;
  newCostMaintenance: number;
  newCostTotal: number;
  roi1yVal: number;
  roi3yVal: number;
  roi5yVal: number;
  benefit1y: number;
  benefit3y: number;
  netBenefit1y: number;
  netBenefit3y: number;
  netBenefit5y: number;
  cycleLoad: number;
  cyclesPerShift: number;
  prodPerShift: number;
  prodPerDay: number;
  prodPerMonth: number;
  currentMonthlyVolume: number;
  surplusKg: number;
  surplusPercent: number;
  totalInvestment: number;
}

const DEFAULTS: FormData = {
  volumePerDay: 1000,
  shiftsPerDay: 1,
  shiftHours: 8,
  workDaysPerMonth: 22,
  currentWorkers: 4,
  avgSalary: 65000,
  currentLossPercent: 5,
  rawCostPerKg: 350,
  oldEnergyPerDay: 0,
  oldRepairPerMonth: 0,
  equipmentCost: 2800000,
  deliveryCost: 150000,
  drumVolume: 1200,
  loadFactor: 0.7,
  cycleTime: 4,
  newEnergyKwh: 7.5,
  newWorkers: 1,
  energyCostPerKwh: 8,
  marginPerKg: 80,
  hasDemand: true,
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

function TooltipIcon({ text }: { text: string }) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          type="button"
          className="inline-flex items-center justify-center w-5 h-5 rounded-full border border-gray-300 text-gray-400 hover:text-[#e8712a] hover:border-[#e8712a] transition-colors ml-1.5 flex-shrink-0"
        >
          <Icon name="HelpCircle" size={13} />
        </button>
      </TooltipTrigger>
      <TooltipContent
        side="top"
        className="max-w-xs text-sm bg-gray-800 text-white px-3 py-2 rounded-lg"
      >
        {text}
      </TooltipContent>
    </Tooltip>
  );
}

function FormulaTooltip({ text }: { text: string }) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          type="button"
          className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-gray-100 text-gray-400 hover:text-[#e8712a] hover:bg-[#e8712a]/10 transition-colors ml-1.5 flex-shrink-0 text-xs font-bold"
        >
          ?
        </button>
      </TooltipTrigger>
      <TooltipContent
        side="top"
        className="max-w-sm text-xs bg-gray-800 text-white px-4 py-3 rounded-lg whitespace-pre-line leading-relaxed"
      >
        {text}
      </TooltipContent>
    </Tooltip>
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
        {fmt(Math.abs(value))} ₽/мес
      </span>
    </div>
  );
}

export default function CalculatorMassager() {
  const [form, setForm] = useState<FormData>({ ...DEFAULTS });
  const [results, setResults] = useState<CalcResults | null>(null);
  const [showResults, setShowResults] = useState(false);
  const [leadName, setLeadName] = useState("");
  const [leadPhone, setLeadPhone] = useState("");
  const [leadEmail, setLeadEmail] = useState("");
  const [leadComment, setLeadComment] = useState("");
  const [leadConsent, setLeadConsent] = useState(false);
  const [leadSent, setLeadSent] = useState(false);
  const [leadErrors, setLeadErrors] = useState<Record<string, string>>({});
  const resultsRef = useRef<HTMLDivElement>(null);

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
    (key: keyof FormData, value: number | boolean) =>
      setForm((prev) => ({ ...prev, [key]: value })),
    []
  );

  const calculate = () => {
    const d = form;
    const totalInvestment = d.equipmentCost + d.deliveryCost;

    const oldCostStaff = d.currentWorkers * d.avgSalary;
    const oldCostLoss =
      d.volumePerDay *
      d.workDaysPerMonth *
      (d.currentLossPercent / 100) *
      d.rawCostPerKg;
    const oldCostEnergy =
      d.oldEnergyPerDay * d.workDaysPerMonth * d.energyCostPerKwh;
    const oldCostRepair = d.oldRepairPerMonth;
    const oldCostTotal =
      oldCostStaff + oldCostLoss + oldCostEnergy + oldCostRepair;

    const newCostStaff = d.newWorkers * d.avgSalary;
    const energyPerHour = d.cycleTime > 0 ? d.newEnergyKwh / d.cycleTime : 0;
    const newCostEnergy =
      energyPerHour *
      d.shiftHours *
      d.shiftsPerDay *
      d.workDaysPerMonth *
      d.energyCostPerKwh;
    const newCostMaintenance = (d.equipmentCost * MAINTENANCE_RATE) / 12;
    const newCostTotal =
      newCostStaff + newCostEnergy + newCostMaintenance;

    const yieldBenefit =
      d.volumePerDay *
      d.workDaysPerMonth *
      YIELD_INCREASE *
      d.rawCostPerKg;

    const savingsStaff = oldCostStaff - newCostStaff;
    const savingsLoss = oldCostLoss;
    const savingsEnergy = oldCostEnergy - newCostEnergy;
    const savingsRepair = oldCostRepair - newCostMaintenance;
    const totalSavings =
      savingsStaff + savingsLoss + yieldBenefit + savingsEnergy + savingsRepair;

    const cycleLoad = d.drumVolume * d.loadFactor * MEAT_DENSITY;
    const cyclesPerShift =
      d.cycleTime > 0 ? Math.floor(d.shiftHours / d.cycleTime) : 0;
    const prodPerShift = cycleLoad * cyclesPerShift;
    const prodPerDay = prodPerShift * d.shiftsPerDay;
    const prodPerMonth = prodPerDay * d.workDaysPerMonth;
    const currentMonthlyVolume = d.volumePerDay * d.workDaysPerMonth;
    const surplusKg = Math.max(0, prodPerMonth - currentMonthlyVolume);
    const surplusPercent =
      currentMonthlyVolume > 0
        ? (surplusKg / currentMonthlyVolume) * 100
        : 0;

    let additionalProfit = 0;
    if (d.hasDemand && surplusKg > 0) {
      additionalProfit = surplusKg * d.marginPerKg;
    }

    const totalMonthlyBenefit = totalSavings + additionalProfit;
    const paybackMonths =
      totalMonthlyBenefit > 0
        ? totalInvestment / totalMonthlyBenefit
        : Infinity;

    const benefit1y = totalMonthlyBenefit * 12;
    const benefit3y = totalMonthlyBenefit * 36;
    const benefit5y_val = totalMonthlyBenefit * 60;

    const netBenefit1y = benefit1y - totalInvestment;
    const netBenefit3y = benefit3y - totalInvestment;
    const netBenefit5y = benefit5y_val - totalInvestment;

    const roi1y =
      totalInvestment > 0
        ? ((benefit1y - totalInvestment) / totalInvestment) * 100
        : 0;
    const roi3y =
      totalInvestment > 0
        ? ((benefit3y - totalInvestment) / totalInvestment) * 100
        : 0;
    const roi5y =
      totalInvestment > 0
        ? ((benefit5y_val - totalInvestment) / totalInvestment) * 100
        : 0;

    setResults({
      paybackMonths,
      monthlySavings: totalSavings,
      roi1y,
      benefit5y: benefit5y_val,
      savingsStaff,
      savingsLoss,
      yieldBenefit,
      savingsEnergy,
      savingsRepair,
      totalSavings,
      additionalProfit,
      totalMonthlyBenefit,
      oldCostStaff,
      oldCostLoss,
      oldCostEnergy,
      oldCostRepair,
      oldCostTotal,
      newCostStaff,
      newCostEnergy,
      newCostMaintenance,
      newCostTotal,
      roi1yVal: roi1y,
      roi3yVal: roi3y,
      roi5yVal: roi5y,
      benefit1y,
      benefit3y,
      netBenefit1y,
      netBenefit3y,
      netBenefit5y,
      cycleLoad,
      cyclesPerShift,
      prodPerShift,
      prodPerDay,
      prodPerMonth,
      currentMonthlyVolume,
      surplusKg,
      surplusPercent,
      totalInvestment,
    });
    setShowResults(true);
    setTimeout(() => {
      resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 100);
  };

  const reset = () => {
    setForm({ ...DEFAULTS });
    setShowResults(false);
    setResults(null);
  };

  const handleLeadSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const errs: Record<string, string> = {};
    if (!leadName.trim()) errs.name = "Укажите имя";
    if (!leadPhone.trim()) errs.phone = "Укажите телефон";
    if (!leadConsent) errs.consent = "Необходимо согласие";
    setLeadErrors(errs);
    if (Object.keys(errs).length > 0) return;
    setLeadSent(true);
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
      <div className="bg-amber-50 border-b border-amber-200 px-4 py-2.5 text-center text-sm text-amber-800">
        ⚠️ Внутренний инструмент. Калькулятор находится на проверке. Не размещайте ссылку на эту страницу в каталоге товаров до согласования с руководством.
      </div>

      <header className="bg-white border-b border-gray-100 sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4 flex items-center gap-4">
          <a href="/">
            <img src={LOGO_URL} alt="Техно-Сиб" className="h-8 sm:h-9 w-auto object-contain" />
          </a>
          <div className="h-8 w-px bg-gray-200 hidden sm:block" />
          <div className="min-w-0">
            <h1 className="text-base sm:text-lg font-bold text-[#333] leading-tight truncate">
              Калькулятор окупаемости мясомассажёра
            </h1>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <div className="text-center mb-10">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#333] mb-3">
            Калькулятор окупаемости мясомассажёра
          </h2>
          <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto mb-2">
            Рассчитайте срок окупаемости, ежемесячную экономию и ROI за 2 минуты
          </p>
          <p className="text-xs text-gray-400 max-w-xl mx-auto">
            Результат расчёта носит ориентировочный характер. Для точного расчёта свяжитесь с нашими специалистами.
          </p>
        </div>

        <div className="space-y-6">
          <Card title="Текущее производство" icon="Factory">
            <div className="grid sm:grid-cols-2 gap-x-6">
              <NumberInput
                label="Объём производства (кг/сутки)"
                value={form.volumePerDay}
                onChange={(v) => set("volumePerDay", v)}
                placeholder="например, 1000"
                tooltip="Общий объём мясного сырья, проходящий через участок массирования за сутки"
              />
              <div className="mb-4">
                <label className="flex items-center text-sm font-medium text-[#333] mb-1.5">
                  Количество смен в сутки
                </label>
                <select
                  value={form.shiftsPerDay}
                  onChange={(e) => set("shiftsPerDay", parseInt(e.target.value))}
                  className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-lg text-[#333] text-sm focus:outline-none focus:ring-2 focus:ring-[#e8712a]/30 focus:border-[#e8712a] transition-all"
                >
                  <option value={1}>1 смена</option>
                  <option value={2}>2 смены</option>
                  <option value={3}>3 смены</option>
                </select>
              </div>
              <NumberInput
                label="Длительность смены (часов)"
                value={form.shiftHours}
                onChange={(v) => set("shiftHours", v)}
                placeholder="8"
              />
              <NumberInput
                label="Рабочих дней в месяц"
                value={form.workDaysPerMonth}
                onChange={(v) => set("workDaysPerMonth", v)}
                placeholder="22"
              />
            </div>
          </Card>

          <Card
            title="Текущие затраты"
            subtitle="Укажите параметры текущего процесса массирования (ручной труд или старое оборудование)"
            icon="Wallet"
          >
            <div className="grid sm:grid-cols-2 gap-x-6">
              <NumberInput
                label="Количество рабочих на участке массирования"
                value={form.currentWorkers}
                onChange={(v) => set("currentWorkers", v)}
                placeholder="4"
              />
              <NumberInput
                label="Средняя зарплата одного рабочего с налогами (₽/мес)"
                value={form.avgSalary}
                onChange={(v) => set("avgSalary", v)}
                placeholder="65 000"
              />
              <NumberInput
                label="Текущий процент потерь сырья (%)"
                value={form.currentLossPercent}
                onChange={(v) => set("currentLossPercent", v)}
                placeholder="5"
                step={0.5}
                tooltip="Потери при ручном массировании обычно 4–8%, при старом оборудовании 3–5%"
                suffix="%"
              />
              <NumberInput
                label="Стоимость сырья (₽/кг)"
                value={form.rawCostPerKg}
                onChange={(v) => set("rawCostPerKg", v)}
                placeholder="350"
              />
              <NumberInput
                label="Потребление электроэнергии старым оборудованием (кВт·ч/сутки)"
                value={form.oldEnergyPerDay}
                onChange={(v) => set("oldEnergyPerDay", v)}
                placeholder="0"
                tooltip="Укажите 0, если сейчас массирование выполняется вручную"
              />
              <NumberInput
                label="Затраты на ремонт старого оборудования (₽/мес)"
                value={form.oldRepairPerMonth}
                onChange={(v) => set("oldRepairPerMonth", v)}
                placeholder="0"
                tooltip="Укажите 0, если сейчас нет оборудования"
              />
            </div>
          </Card>

          <Card title="Параметры нового мясомассажёра" icon="Cog">
            <div className="grid sm:grid-cols-2 gap-x-6">
              <NumberInput
                label="Стоимость мясомассажёра (₽)"
                value={form.equipmentCost}
                onChange={(v) => set("equipmentCost", v)}
                placeholder="2 800 000"
              />
              <NumberInput
                label="Стоимость доставки и монтажа (₽)"
                value={form.deliveryCost}
                onChange={(v) => set("deliveryCost", v)}
                placeholder="150 000"
              />
              <NumberInput
                label="Объём барабана (литров)"
                value={form.drumVolume}
                onChange={(v) => set("drumVolume", v)}
                placeholder="1200"
              />
              <div className="mb-4">
                <label className="flex items-center text-sm font-medium text-[#333] mb-1.5 flex-wrap">
                  <span>Коэффициент загрузки барабана: <strong>{form.loadFactor.toFixed(2)}</strong></span>
                  <TooltipIcon text="Оптимальная загрузка барабана — 60–80% от полного объёма. Зависит от типа продукции." />
                </label>
                <div className="pt-2 pb-1 px-1">
                  <Slider
                    value={[form.loadFactor]}
                    onValueChange={([v]) => set("loadFactor", v)}
                    min={0.5}
                    max={0.9}
                    step={0.05}
                    className="[&_[role=slider]]:bg-[#e8712a] [&_[role=slider]]:border-[#e8712a] [&_span[data-orientation=horizontal]>span]:bg-[#e8712a]"
                  />
                  <div className="flex justify-between text-xs text-gray-400 mt-1">
                    <span>0,50</span>
                    <span>0,90</span>
                  </div>
                </div>
              </div>
              <NumberInput
                label="Время одного цикла массирования (часов)"
                value={form.cycleTime}
                onChange={(v) => set("cycleTime", v)}
                placeholder="4"
                step={0.5}
                tooltip="Стандартный цикл массирования — от 2 до 12 часов в зависимости от рецептуры"
              />
              <NumberInput
                label="Потребление электроэнергии нового оборудования (кВт·ч)"
                value={form.newEnergyKwh}
                onChange={(v) => set("newEnergyKwh", v)}
                placeholder="7.5"
                step={0.5}
              />
              <NumberInput
                label="Количество рабочих с новым оборудованием"
                value={form.newWorkers}
                onChange={(v) => set("newWorkers", v)}
                placeholder="1"
              />
            </div>
          </Card>

          <Card title="Дополнительные параметры" icon="SlidersHorizontal">
            <div className="grid sm:grid-cols-2 gap-x-6">
              <NumberInput
                label="Стоимость электроэнергии (₽/кВт·ч)"
                value={form.energyCostPerKwh}
                onChange={(v) => set("energyCostPerKwh", v)}
                placeholder="8"
              />
              <NumberInput
                label="Маржа на 1 кг готовой продукции (₽/кг)"
                value={form.marginPerKg}
                onChange={(v) => set("marginPerKg", v)}
                placeholder="80"
                tooltip="Средняя прибыль с 1 кг готовой продукции после вычета себестоимости. Нужна для расчёта дополнительной прибыли при росте объёмов."
              />
              <div className="mb-4 sm:col-span-2">
                <label className="flex items-center text-sm font-medium text-[#333] mb-1.5 flex-wrap">
                  <span>Есть спрос на дополнительный объём продукции?</span>
                  <TooltipIcon text="Если у вас есть возможность продать больше продукции, калькулятор учтёт дополнительную прибыль от роста производительности" />
                </label>
                <div className="flex gap-3 mt-1">
                  <button
                    type="button"
                    onClick={() => set("hasDemand", true)}
                    className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all ${
                      form.hasDemand
                        ? "bg-[#e8712a] text-white shadow-md"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}
                  >
                    Да
                  </button>
                  <button
                    type="button"
                    onClick={() => set("hasDemand", false)}
                    className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all ${
                      !form.hasDemand
                        ? "bg-[#e8712a] text-white shadow-md"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}
                  >
                    Нет
                  </button>
                </div>
              </div>
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
                label="Срок окупаемости"
                value={paybackDisplay()}
                sub="простой срок окупаемости"
                icon="Clock"
                tooltip={`Полные инвестиции / Ежемесячная выгода\n${fmt(results.totalInvestment)} ₽ / ${fmt(results.totalMonthlyBenefit)} ₽/мес\n\nИнвестиции: ${fmt(form.equipmentCost)} + ${fmt(form.deliveryCost)} = ${fmt(results.totalInvestment)} ₽`}
              />
              <MetricCard
                label="Ежемесячная экономия"
                value={`${fmt(results.totalMonthlyBenefit)} ₽`}
                sub="экономия в месяц"
                icon="PiggyBank"
                tooltip={`Экономия на затратах + Доп. прибыль\n${fmt(results.totalSavings)} + ${fmt(results.additionalProfit)} = ${fmt(results.totalMonthlyBenefit)} ₽/мес`}
              />
              <MetricCard
                label="ROI за 1 год"
                value={`${fmtDecimal(results.roi1y)}%`}
                sub="возврат на инвестиции"
                icon="TrendingUp"
                tooltip={`(Выгода за 12 мес − Инвестиции) / Инвестиции × 100%\n(${fmt(results.benefit1y)} − ${fmt(results.totalInvestment)}) / ${fmt(results.totalInvestment)} × 100%\n= ${fmtDecimal(results.roi1y)}%`}
              />
              <MetricCard
                label="Выгода за 5 лет"
                value={`${fmt(results.benefit5y)} ₽`}
                sub="общая выгода за 5 лет"
                icon="BadgeRussianRuble"
                tooltip={`Ежемесячная выгода × 60 мес\n${fmt(results.totalMonthlyBenefit)} × 60 = ${fmt(results.benefit5y)} ₽`}
              />
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 sm:p-7">
              <h3 className="text-lg font-bold text-[#333] mb-4 flex items-center gap-2">
                <Icon name="PieChart" fallback="BarChart" size={20} className="text-[#e8712a]" />
                Из чего складывается экономия
              </h3>
              <SavingsRow label="Экономия на персонале" value={results.savingsStaff} tooltip={`Было: ${form.currentWorkers} чел × ${fmt(form.avgSalary)} ₽ = ${fmt(results.oldCostStaff)} ₽\nСтало: ${form.newWorkers} чел × ${fmt(form.avgSalary)} ₽ = ${fmt(results.newCostStaff)} ₽\nЭкономия: ${fmt(results.oldCostStaff)} − ${fmt(results.newCostStaff)} = ${fmt(results.savingsStaff)} ₽`} />
              <SavingsRow label="Экономия на потерях сырья" value={results.savingsLoss} tooltip={`${fmt(form.volumePerDay)} кг/сут × ${form.workDaysPerMonth} дн × ${form.currentLossPercent}% × ${fmt(form.rawCostPerKg)} ₽/кг\n= ${fmt(results.savingsLoss)} ₽/мес\n\nС новым оборудованием потери сырья устранены полностью`} />
              <SavingsRow label="Увеличение выхода продукции (+10%)" value={results.yieldBenefit} tooltip={`${fmt(form.volumePerDay)} кг/сут × ${form.workDaysPerMonth} дн × 10% × ${fmt(form.rawCostPerKg)} ₽/кг\n= ${fmt(results.yieldBenefit)} ₽/мес\n\nВакуумный массажёр увеличивает выход продукции на 10%`} />
              <SavingsRow label="Экономия на электроэнергии" value={results.savingsEnergy} tooltip={`Было: ${fmt(form.oldEnergyPerDay)} кВт·ч/сут × ${form.workDaysPerMonth} дн × ${fmt(form.energyCostPerKwh)} ₽ = ${fmt(results.oldCostEnergy)} ₽\nСтало: ${fmtDecimal(form.newEnergyKwh / (form.cycleTime || 1))} кВт·ч × ${form.shiftHours} ч × ${form.shiftsPerDay} см × ${form.workDaysPerMonth} дн × ${fmt(form.energyCostPerKwh)} ₽ = ${fmt(results.newCostEnergy)} ₽\nРазница: ${fmt(results.savingsEnergy)} ₽`} />
              <SavingsRow label="Экономия на ремонте / ТО" value={results.savingsRepair} tooltip={`Было: ремонт ${fmt(form.oldRepairPerMonth)} ₽/мес\nСтало: ТО = ${fmt(form.equipmentCost)} × 1% / 12 = ${fmt(results.newCostMaintenance)} ₽/мес\nРазница: ${fmt(results.savingsRepair)} ₽`} />
              <SavingsRow label="Итого экономия" value={results.totalSavings} bold tooltip={`${fmt(results.savingsStaff)} + ${fmt(results.savingsLoss)} + ${fmt(results.yieldBenefit)} + (${fmt(results.savingsEnergy)}) + (${fmt(results.savingsRepair)})\n= ${fmt(results.totalSavings)} ₽/мес`} />
              {form.hasDemand && results.additionalProfit > 0 && (
                <>
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <SavingsRow
                      label="Дополнительная прибыль от роста объёмов"
                      value={results.additionalProfit}
                      tooltip={`Запас: ${fmt(Math.round(results.surplusKg))} кг/мес × ${fmt(form.marginPerKg)} ₽/кг маржа\n= ${fmt(results.additionalProfit)} ₽/мес`}
                    />
                    <SavingsRow
                      label="Общая ежемесячная выгода"
                      value={results.totalMonthlyBenefit}
                      bold
                      tooltip={`Экономия ${fmt(results.totalSavings)} + Доп. прибыль ${fmt(results.additionalProfit)}\n= ${fmt(results.totalMonthlyBenefit)} ₽/мес`}
                    />
                  </div>
                </>
              )}
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 sm:p-7">
              <h3 className="text-lg font-bold text-[#333] mb-6 flex items-center gap-2">
                <Icon name="ArrowLeftRight" fallback="BarChart" size={20} className="text-[#e8712a]" />
                Сравнение затрат: до и после
              </h3>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <div className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-3">
                    Текущие затраты в месяц
                  </div>
                  <div className="text-2xl font-extrabold text-[#333] mb-4 flex items-center gap-1">
                    {fmt(results.oldCostTotal)} ₽
                    <FormulaTooltip text={`${fmt(results.oldCostStaff)} + ${fmt(results.oldCostLoss)} + ${fmt(results.oldCostEnergy)} + ${fmt(results.oldCostRepair)}`} />
                  </div>
                  <div className="space-y-2">
                    {[
                      { l: "Персонал", v: results.oldCostStaff, t: `${form.currentWorkers} чел × ${fmt(form.avgSalary)} ₽` },
                      { l: "Потери сырья", v: results.oldCostLoss, t: `${fmt(form.volumePerDay)} кг × ${form.workDaysPerMonth} дн × ${form.currentLossPercent}% × ${fmt(form.rawCostPerKg)} ₽/кг` },
                      { l: "Электроэнергия", v: results.oldCostEnergy, t: `${fmt(form.oldEnergyPerDay)} кВт·ч/сут × ${form.workDaysPerMonth} дн × ${fmt(form.energyCostPerKwh)} ₽` },
                      { l: "Ремонт", v: results.oldCostRepair, t: `Указано пользователем: ${fmt(form.oldRepairPerMonth)} ₽/мес` },
                    ].map((row) => (
                      <div key={row.l} className="flex justify-between text-sm">
                        <span className="text-gray-500 flex items-center">{row.l}<FormulaTooltip text={row.t} /></span>
                        <span className="font-medium text-[#333] tabular-nums">
                          {fmt(row.v)} ₽
                        </span>
                      </div>
                    ))}
                  </div>
                  <div className="mt-3 h-3 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full bg-red-400"
                      style={{
                        width: `${Math.min(100, results.oldCostTotal > 0 ? 100 : 0)}%`,
                      }}
                    />
                  </div>
                </div>
                <div>
                  <div className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-3">
                    Новые затраты в месяц
                  </div>
                  <div className="text-2xl font-extrabold text-[#e8712a] mb-4 flex items-center gap-1">
                    {fmt(results.newCostTotal)} ₽
                    <FormulaTooltip text={`${fmt(results.newCostStaff)} + ${fmt(results.newCostEnergy)} + ${fmt(results.newCostMaintenance)}`} />
                  </div>
                  <div className="space-y-2">
                    {[
                      { l: "Персонал", v: results.newCostStaff, t: `${form.newWorkers} чел × ${fmt(form.avgSalary)} ₽` },
                      { l: "Электроэнергия", v: results.newCostEnergy, t: `${fmtDecimal(form.newEnergyKwh / (form.cycleTime || 1))} кВт·ч × ${form.shiftHours} ч × ${form.shiftsPerDay} см × ${form.workDaysPerMonth} дн × ${fmt(form.energyCostPerKwh)} ₽` },
                      { l: "ТО оборудования", v: results.newCostMaintenance, t: `${fmt(form.equipmentCost)} ₽ × 1% / 12 мес` },
                    ].map((row) => (
                      <div key={row.l} className="flex justify-between text-sm">
                        <span className="text-gray-500 flex items-center">{row.l}<FormulaTooltip text={row.t} /></span>
                        <span className="font-medium text-[#333] tabular-nums">
                          {fmt(row.v)} ₽
                        </span>
                      </div>
                    ))}
                  </div>
                  <div className="mt-3 h-3 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full"
                      style={{
                        backgroundColor: ACCENT,
                        width: `${
                          results.oldCostTotal > 0
                            ? Math.min(
                                100,
                                (results.newCostTotal / results.oldCostTotal) * 100
                              )
                            : 0
                        }%`,
                      }}
                    />
                  </div>
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
                        Общая выгода
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
                        benefit: results.benefit1y,
                        net: results.netBenefit1y,
                        roi: results.roi1yVal,
                      },
                      {
                        period: "3 года",
                        months: 36,
                        benefit: results.benefit3y,
                        net: results.netBenefit3y,
                        roi: results.roi3yVal,
                      },
                      {
                        period: "5 лет",
                        months: 60,
                        benefit: results.benefit5y,
                        net: results.netBenefit5y,
                        roi: results.roi5yVal,
                      },
                    ].map((row) => (
                      <tr key={row.period} className="border-b border-gray-50">
                        <td className="py-3 pr-4 font-semibold text-[#333]">
                          {row.period}
                        </td>
                        <td className="py-3 px-4 text-right tabular-nums text-[#333]">
                          <span className="inline-flex items-center gap-1">
                            {fmt(row.benefit)} ₽
                            <FormulaTooltip text={`${fmt(results.totalMonthlyBenefit)} ₽/мес × ${row.months} мес`} />
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

            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 sm:p-7">
              <h3 className="text-lg font-bold text-[#333] mb-4 flex items-center gap-2">
                <Icon name="Gauge" fallback="Activity" size={20} className="text-[#e8712a]" />
                Производительность нового мясомассажёра
              </h3>
              <div className="grid sm:grid-cols-2 gap-x-8 gap-y-2">
                {[
                  {
                    l: "Загрузка одного цикла",
                    v: `${fmt(Math.round(results.cycleLoad))} кг`,
                    t: `${fmt(form.drumVolume)} л × ${form.loadFactor.toFixed(2)} × 1,05 кг/л`,
                  },
                  {
                    l: "Циклов за смену",
                    v: `${results.cyclesPerShift}`,
                    t: `${form.shiftHours} ч / ${form.cycleTime} ч = ${results.cyclesPerShift} (округлено вниз)`,
                  },
                  {
                    l: "Производительность за смену",
                    v: `${fmt(Math.round(results.prodPerShift))} кг`,
                    t: `${fmt(Math.round(results.cycleLoad))} кг × ${results.cyclesPerShift} циклов`,
                  },
                  {
                    l: "Производительность за сутки",
                    v: `${fmt(Math.round(results.prodPerDay))} кг`,
                    t: `${fmt(Math.round(results.prodPerShift))} кг × ${form.shiftsPerDay} смен`,
                  },
                  {
                    l: "Производительность за месяц",
                    v: `${fmt(Math.round(results.prodPerMonth))} кг`,
                    t: `${fmt(Math.round(results.prodPerDay))} кг × ${form.workDaysPerMonth} дней`,
                  },
                  {
                    l: "Текущий объём за месяц",
                    v: `${fmt(results.currentMonthlyVolume)} кг`,
                    t: `${fmt(form.volumePerDay)} кг/сут × ${form.workDaysPerMonth} дней`,
                  },
                  {
                    l: "Запас производительности",
                    v: `+${fmt(Math.round(results.surplusKg))} кг (+${fmtDecimal(results.surplusPercent, 0)}%)`,
                    highlight: true,
                    t: `${fmt(Math.round(results.prodPerMonth))} − ${fmt(results.currentMonthlyVolume)} = ${fmt(Math.round(results.surplusKg))} кг`,
                  },
                ].map((row) => (
                  <div
                    key={row.l}
                    className="flex justify-between py-2 border-b border-gray-50"
                  >
                    <span className="text-sm text-gray-600 flex items-center">{row.l}<FormulaTooltip text={row.t} /></span>
                    <span
                      className={`text-sm font-semibold tabular-nums ${
                        row.highlight ? "text-[#e8712a]" : "text-[#333]"
                      }`}
                    >
                      {row.v}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-gradient-to-br from-[#e8712a]/5 via-white to-[#e8712a]/10 rounded-2xl border border-[#e8712a]/20 p-6 sm:p-8">
              <h3 className="text-xl sm:text-2xl font-extrabold text-[#333] mb-2 text-center">
                Получите детальный расчёт под ваше производство
              </h3>
              <p className="text-sm text-gray-500 text-center mb-6 max-w-lg mx-auto">
                Наш технолог проверит параметры, уточнит данные и подготовит персональное коммерческое предложение
              </p>
              {leadSent ? (
                <div className="text-center py-8">
                  <div
                    className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
                    style={{ backgroundColor: `${ACCENT}15` }}
                  >
                    <Icon name="CheckCircle" size={32} className="text-[#e8712a]" />
                  </div>
                  <p className="text-lg font-bold text-[#333]">Спасибо!</p>
                  <p className="text-sm text-gray-500 mt-1">
                    Наш специалист свяжется с вами в течение рабочего дня.
                  </p>
                </div>
              ) : (
                <form
                  onSubmit={handleLeadSubmit}
                  className="max-w-lg mx-auto space-y-4"
                >
                  <div>
                    <input
                      type="text"
                      placeholder="Имя *"
                      value={leadName}
                      onChange={(e) => setLeadName(e.target.value)}
                      className={`w-full px-4 py-3 bg-white border rounded-lg text-sm text-[#333] focus:outline-none focus:ring-2 focus:ring-[#e8712a]/30 focus:border-[#e8712a] transition-all ${
                        leadErrors.name
                          ? "border-red-400 ring-2 ring-red-100"
                          : "border-gray-200"
                      }`}
                    />
                    {leadErrors.name && (
                      <p className="text-red-500 text-xs mt-1">
                        {leadErrors.name}
                      </p>
                    )}
                  </div>
                  <div>
                    <input
                      type="tel"
                      placeholder="Телефон *"
                      value={leadPhone}
                      onChange={(e) => setLeadPhone(e.target.value)}
                      className={`w-full px-4 py-3 bg-white border rounded-lg text-sm text-[#333] focus:outline-none focus:ring-2 focus:ring-[#e8712a]/30 focus:border-[#e8712a] transition-all ${
                        leadErrors.phone
                          ? "border-red-400 ring-2 ring-red-100"
                          : "border-gray-200"
                      }`}
                    />
                    {leadErrors.phone && (
                      <p className="text-red-500 text-xs mt-1">
                        {leadErrors.phone}
                      </p>
                    )}
                  </div>
                  <input
                    type="email"
                    placeholder="Email"
                    value={leadEmail}
                    onChange={(e) => setLeadEmail(e.target.value)}
                    className="w-full px-4 py-3 bg-white border border-gray-200 rounded-lg text-sm text-[#333] focus:outline-none focus:ring-2 focus:ring-[#e8712a]/30 focus:border-[#e8712a] transition-all"
                  />
                  <textarea
                    placeholder="Расскажите о вашем производстве"
                    value={leadComment}
                    onChange={(e) => setLeadComment(e.target.value)}
                    rows={3}
                    className="w-full px-4 py-3 bg-white border border-gray-200 rounded-lg text-sm text-[#333] focus:outline-none focus:ring-2 focus:ring-[#e8712a]/30 focus:border-[#e8712a] transition-all resize-none"
                  />
                  <div>
                    <label className="flex items-start gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={leadConsent}
                        onChange={(e) => setLeadConsent(e.target.checked)}
                        className="mt-1 accent-[#e8712a]"
                      />
                      <span className="text-xs text-gray-500">
                        Согласен на обработку персональных данных
                      </span>
                    </label>
                    {leadErrors.consent && (
                      <p className="text-red-500 text-xs mt-1">
                        {leadErrors.consent}
                      </p>
                    )}
                  </div>
                  <button
                    type="submit"
                    className="w-full py-3.5 rounded-xl text-white font-bold text-base shadow-lg hover:shadow-xl transition-all active:scale-[0.98]"
                    style={{ backgroundColor: ACCENT }}
                  >
                    Получить персональный расчёт
                  </button>
                </form>
              )}
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 sm:p-7">
              <h3 className="text-lg font-bold text-[#333] mb-4 flex items-center gap-2">
                <Icon name="BookOpen" fallback="FileText" size={20} className="text-[#e8712a]" />
                Методология расчёта
              </h3>
              <Accordion type="multiple" className="w-full">
                <AccordionItem value="perf">
                  <AccordionTrigger className="text-sm font-semibold text-[#333] hover:text-[#e8712a]">
                    Производительность оборудования
                  </AccordionTrigger>
                  <AccordionContent className="text-sm text-gray-600 leading-relaxed">
                    <p className="mb-2">Производительность нового мясомассажёра рассчитывается по формуле:</p>
                    <p className="mb-2"><strong>Загрузка одного цикла (кг)</strong> = Объём барабана (л) × Коэффициент загрузки × Плотность мяса</p>
                    <p className="mb-2">Плотность мяса принимается равной 1,05 кг/л — среднее значение для различных видов мясного сырья.</p>
                    <p className="mb-2"><strong>Количество циклов за смену</strong> = Длительность смены (ч) / Время одного цикла (ч), округлённое вниз до целого числа.</p>
                    <p className="mb-2">Производительность за смену = Загрузка одного цикла × Количество циклов.</p>
                    <p className="mb-2">Производительность за сутки = Производительность за смену × Количество смен.</p>
                    <p>Производительность за месяц = Производительность за сутки × Рабочих дней в месяц.</p>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="old-cost">
                  <AccordionTrigger className="text-sm font-semibold text-[#333] hover:text-[#e8712a]">
                    Расчёт текущих затрат
                  </AccordionTrigger>
                  <AccordionContent className="text-sm text-gray-600 leading-relaxed">
                    <p className="mb-2">Текущие ежемесячные затраты на участке массирования складываются из четырёх компонентов:</p>
                    <p className="mb-2">1. <strong>Затраты на персонал</strong> = Количество рабочих × Зарплата с налогами.</p>
                    <p className="mb-2">2. <strong>Потери сырья</strong> = Объём производства (кг/сут) × Рабочих дней × Процент потерь (%) / 100 × Стоимость сырья (руб/кг). Потери при ручном массировании обычно составляют 4–8%, при использовании устаревшего оборудования — 3–5%.</p>
                    <p className="mb-2">3. <strong>Затраты на электроэнергию</strong> = Потребление старого оборудования (кВт·ч/сут) × Рабочих дней × Тариф (руб/кВт·ч). При ручном труде этот параметр равен нулю.</p>
                    <p>4. <strong>Затраты на ремонт</strong> старого оборудования — указываются пользователем.</p>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="new-cost">
                  <AccordionTrigger className="text-sm font-semibold text-[#333] hover:text-[#e8712a]">
                    Расчёт новых затрат
                  </AccordionTrigger>
                  <AccordionContent className="text-sm text-gray-600 leading-relaxed">
                    <p className="mb-2">Ежемесячные затраты при работе с новым мясомассажёром:</p>
                    <p className="mb-2">1. <strong>Затраты на персонал</strong> = Количество рабочих с новым оборудованием × Зарплата с налогами. Современные мясомассажёры автоматизируют процесс и позволяют сократить штат участка.</p>
                    <p className="mb-2">2. <strong>Затраты на электроэнергию</strong> = (Мощность оборудования (кВт·ч) / Время цикла (ч)) × Длительность смены (ч) × Количество смен × Рабочих дней × Тариф.</p>
                    <p className="mb-2">3. <strong>Затраты на техническое обслуживание</strong> = 1% от стоимости оборудования в год / 12 месяцев. Это усреднённая оценка, включающая плановое ТО, замену расходных материалов и мелкий ремонт.</p>
                    <p>Потери сырья при работе с новым оборудованием не учитываются как отдельная статья расходов, поскольку вакуумный мясомассажёр не только устраняет потери, но и увеличивает выход готовой продукции на 10% за счёт лучшего впитывания рассола и маринада.</p>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="savings">
                  <AccordionTrigger className="text-sm font-semibold text-[#333] hover:text-[#e8712a]">
                    Расчёт экономии
                  </AccordionTrigger>
                  <AccordionContent className="text-sm text-gray-600 leading-relaxed">
                    <p className="mb-2">Ежемесячная экономия = Текущие затраты − Новые затраты + Выгода от увеличения выхода продукции.</p>
                    <p className="mb-2">Экономия складывается из:</p>
                    <ul className="list-disc list-inside mb-2 space-y-1">
                      <li>Экономия на персонале (сокращение штата участка)</li>
                      <li>Экономия на потерях сырья (полное устранение потерь при переходе на вакуумный массажёр)</li>
                      <li>Увеличение выхода готовой продукции на 10% — за счёт лучшего впитывания рассола и маринада вакуумный мясомассажёр увеличивает массу готового продукта. Выгода = Объём производства (кг/сут) × Рабочих дней × 10% × Стоимость сырья (руб/кг)</li>
                      <li>Разница в затратах на электроэнергию (может быть как экономией, так и дополнительным расходом)</li>
                      <li>Разница в затратах на ремонт/ТО</li>
                    </ul>
                    <p>Отдельные компоненты экономии могут быть отрицательными (например, электроэнергия при переходе с ручного труда), но общая экономия, как правило, положительная за счёт устранения потерь, увеличения выхода продукции и сокращения персонала.</p>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="extra-profit">
                  <AccordionTrigger className="text-sm font-semibold text-[#333] hover:text-[#e8712a]">
                    Дополнительная прибыль от роста объёмов
                  </AccordionTrigger>
                  <AccordionContent className="text-sm text-gray-600 leading-relaxed">
                    <p className="mb-2">Если производительность нового мясомассажёра превышает текущий объём производства и есть спрос на дополнительную продукцию, калькулятор учитывает дополнительную прибыль:</p>
                    <p className="mb-2"><strong>Прирост объёма (кг/мес)</strong> = Производительность нового оборудования (кг/мес) − Текущий объём (кг/мес).</p>
                    <p className="mb-2"><strong>Дополнительная прибыль</strong> = Прирост объёма × Маржа на 1 кг готовой продукции.</p>
                    <p>Этот параметр учитывается только если пользователь указал наличие спроса на дополнительный объём. В противном случае дополнительная прибыль принимается равной нулю.</p>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="payback">
                  <AccordionTrigger className="text-sm font-semibold text-[#333] hover:text-[#e8712a]">
                    Срок окупаемости
                  </AccordionTrigger>
                  <AccordionContent className="text-sm text-gray-600 leading-relaxed">
                    <p className="mb-2"><strong>Простой срок окупаемости</strong> = Полные инвестиции / Ежемесячная выгода.</p>
                    <p className="mb-2">Полные инвестиции = Стоимость оборудования + Стоимость доставки и монтажа.</p>
                    <p className="mb-2">Ежемесячная выгода = Экономия + Дополнительная прибыль (если применимо).</p>
                    <p>Калькулятор показывает два варианта: без учёта дополнительной прибыли (консервативный) и с учётом (оптимистичный).</p>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="roi">
                  <AccordionTrigger className="text-sm font-semibold text-[#333] hover:text-[#e8712a]">
                    ROI — возврат на инвестиции
                  </AccordionTrigger>
                  <AccordionContent className="text-sm text-gray-600 leading-relaxed">
                    <p className="mb-2"><strong>ROI за период</strong> = ((Ежемесячная выгода × Количество месяцев) − Полные инвестиции) / Полные инвестиции × 100%.</p>
                    <p className="mb-2">Калькулятор показывает ROI за три периода: 1 год, 3 года и 5 лет.</p>
                    <p>Положительный ROI означает, что инвестиции окупились и принесли прибыль. Например, ROI 71% за 1 год означает, что каждый вложенный рубль вернул 1 руб. 71 коп.</p>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="limits">
                  <AccordionTrigger className="text-sm font-semibold text-[#333] hover:text-[#e8712a]">
                    Допущения и ограничения
                  </AccordionTrigger>
                  <AccordionContent className="text-sm text-gray-600 leading-relaxed">
                    <p className="mb-2">Калькулятор использует следующие допущения:</p>
                    <ul className="list-disc list-inside space-y-1 mb-2">
                      <li>Плотность мясного сырья: 1,05 кг/л</li>
                      <li>Увеличение выхода готовой продукции с новым оборудованием: +10% от объёма сырья (за счёт лучшего впитывания рассола и маринада в вакуумном барабане)</li>
                      <li>Затраты на ТО нового оборудования: 1% от стоимости в год</li>
                      <li>Расчёт не учитывает инфляцию, изменение цен на сырьё и электроэнергию</li>
                      <li>Расчёт не учитывает стоимость кредита (если оборудование приобретается в кредит/лизинг)</li>
                      <li>Фактические показатели могут отличаться в зависимости от типа продукции, рецептуры, условий производства и квалификации персонала</li>
                    </ul>
                    <p>Для получения точного расчёта с учётом всех особенностей вашего производства рекомендуем обратиться к нашим специалистам.</p>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
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
    </div>
  );
}