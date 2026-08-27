export const inputCls = "w-full px-4 py-3 bg-background border border-border rounded-xl text-foreground placeholder-muted-foreground text-sm focus:outline-none focus:border-primary transition-colors";
export const inputError = "w-full px-4 py-3 bg-background border border-red-400 rounded-xl text-foreground placeholder-muted-foreground text-sm focus:outline-none focus:border-red-500 transition-colors";

export function isValidPhone(v: string): boolean {
  const digits = v.replace(/\D/g, "");
  if (/^[78]\d{10}$/.test(digits)) return true;
  if (/^375\d{9}$/.test(digits)) return true;
  return false;
}

export function formatPhone(prev: string, next: string): string {
  let raw = next.replace(/[^\d+]/g, "");
  if (raw.startsWith("8")) raw = "7" + raw.slice(1);
  if (/^[9]/.test(raw)) raw = "7" + raw;
  raw = raw.replace(/\+/g, "");
  const isBy = raw.startsWith("375");
  raw = raw.slice(0, isBy ? 12 : 11);
  if (!raw) return "";
  return "+" + raw;
}

export function isValidEmail(v: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
}

export const ConsentCheckbox = ({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) => (
  <label className="flex items-start gap-2 cursor-pointer select-none">
    <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="mt-0.5 w-4 h-4 flex-shrink-0 accent-orange-500 cursor-pointer" />
    <span className="text-xs text-muted-foreground leading-relaxed">
      Отправляя форму, я соглашаюсь с{" "}
      <a href="https://t-sib.ru/assets/politika_t-sib16.05.25.pdf" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">политикой обработки персональных данных</a>
      {" "}и даю{" "}
      <a href="https://t-sib.ru/assets/soglasie_t-sib16.05.25.pdf" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">согласие на обработку персональных данных</a>.
    </span>
  </label>
);

export const sectionAnim = (visible: boolean) =>
  `transition-all duration-1000 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`;
