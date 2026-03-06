import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Icon from "@/components/ui/icon";
import { useCart } from "@/hooks/useCart";
import { useLeadForm } from "@/hooks/useLeadForm";
import ThankYouModal from "@/components/ThankYouModal";

const inputCls = "w-full px-4 py-3 bg-background border border-border rounded-xl text-foreground placeholder-muted-foreground text-sm focus:outline-none focus:border-primary transition-colors";
const inputError = "w-full px-4 py-3 bg-background border border-red-400 rounded-xl text-foreground placeholder-muted-foreground text-sm focus:outline-none focus:border-red-500 transition-colors";

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

export default function Cart() {
  const navigate = useNavigate();
  const { items, addItem, removeItem, removeAll, clearCart, totalCount, totalPrice } = useCart();
  const { sendLead, sending, thankYouOpen, setThankYouOpen } = useLeadForm();

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [phoneTouched, setPhoneTouched] = useState(false);
  const [sent, setSent] = useState(false);

  const phoneValid = isValidPhone(phone);

  const handleSubmit = async () => {
    if (!name.trim() || !phoneValid) return;
    const cartComment = items
      .map((i) => `${i.name} × ${i.quantity}${i.price_display ? " (" + i.price_display + ")" : ""}`)
      .join("\n");
    await sendLead({
      name,
      phone,
      comment: cartComment,
      formType: "cart",
    });
    setSent(true);
    clearCart();
  };

  return (
    <div className="min-h-screen bg-background">
      <ThankYouModal open={thankYouOpen} onClose={() => setThankYouOpen(false)} />

      {/* Шапка */}
      <header className="fixed top-0 w-full bg-white/90 backdrop-blur-xl border-b border-border z-50 shadow-sm">
        <div className="max-w-5xl mx-auto px-6 py-3 flex items-center gap-4">
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-2 text-sm font-semibold text-foreground hover:text-primary transition-colors"
          >
            <Icon name="ArrowLeft" size={18} />
            Вернуться к каталогу
          </button>
          <div className="ml-auto flex items-center gap-2 text-sm font-bold text-foreground">
            <Icon name="ShoppingCart" size={18} className="text-primary" />
            Корзина
            {totalCount > 0 && (
              <span className="w-5 h-5 bg-primary text-white text-xs font-bold rounded-full flex items-center justify-center">
                {totalCount}
              </span>
            )}
          </div>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-6 pt-28 pb-20">
        <h1 className="text-3xl font-black text-foreground mb-8">Корзина</h1>

        {items.length === 0 && !sent && (
          <div className="text-center py-24">
            <Icon name="ShoppingCart" size={64} className="mx-auto mb-6 text-muted-foreground opacity-30" />
            <p className="text-xl text-muted-foreground mb-6">Корзина пуста</p>
            <button
              onClick={() => navigate("/")}
              className="px-8 py-3 bg-primary text-white rounded-full font-bold hover:bg-primary/90 transition-all"
            >
              Перейти к каталогу
            </button>
          </div>
        )}

        {sent && (
          <div className="text-center py-24">
            <Icon name="CheckCircle" size={64} className="mx-auto mb-6 text-primary" />
            <h2 className="text-2xl font-bold text-foreground mb-3">Заявка отправлена!</h2>
            <p className="text-muted-foreground mb-8">Мы свяжемся с вами в ближайшее время</p>
            <button
              onClick={() => navigate("/")}
              className="px-8 py-3 bg-primary text-white rounded-full font-bold hover:bg-primary/90 transition-all"
            >
              На главную
            </button>
          </div>
        )}

        {items.length > 0 && !sent && (
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Список товаров */}
            <div className="lg:col-span-2 space-y-4">
              {items.map((item) => (
                <div key={item.id} className="flex gap-4 bg-white border border-border rounded-2xl p-4 shadow-sm">
                  <img
                    src={item.picture}
                    alt={item.name}
                    className="w-24 h-24 object-contain rounded-xl bg-gray-50 flex-shrink-0 p-2"
                  />
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-foreground text-base leading-snug mb-1 line-clamp-2">{item.name}</h3>
                    {item.price_display && (
                      <p className="text-primary font-black text-lg mb-3">{item.price_display}</p>
                    )}
                    <div className="flex items-center gap-3">
                      {/* Счётчик */}
                      <div className="flex items-center gap-1 border-2 border-primary/30 rounded-xl px-2 py-1">
                        <button
                          onClick={() => removeItem(item.id)}
                          className="w-7 h-7 flex items-center justify-center text-primary font-bold text-lg hover:bg-primary/10 rounded-lg transition-colors"
                        >−</button>
                        <span className="w-6 text-center font-bold text-foreground">{item.quantity}</span>
                        <button
                          onClick={() => addItem({ id: item.id, name: item.name, price: item.price, price_display: item.price_display, picture: item.picture })}
                          className="w-7 h-7 flex items-center justify-center text-primary font-bold text-lg hover:bg-primary/10 rounded-lg transition-colors"
                        >+</button>
                      </div>
                      {item.price && (
                        <span className="text-sm text-muted-foreground">
                          = {(item.price * item.quantity).toLocaleString("ru-RU")} ₽
                        </span>
                      )}
                      <button
                        onClick={() => removeAll(item.id)}
                        className="ml-auto p-2 text-muted-foreground hover:text-red-500 transition-colors"
                        title="Убрать из корзины"
                      >
                        <Icon name="Trash2" size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}

              {/* Итог */}
              {totalPrice > 0 && (
                <div className="bg-primary/5 border border-primary/20 rounded-2xl p-4 flex justify-between items-center">
                  <span className="font-semibold text-foreground">Итого:</span>
                  <span className="font-black text-xl text-primary">{totalPrice.toLocaleString("ru-RU")} ₽</span>
                </div>
              )}
            </div>

            {/* Форма заявки */}
            <div className="lg:col-span-1">
              <div className="bg-white border-2 border-primary/20 rounded-3xl p-6 shadow-sm sticky top-28">
                <h2 className="font-bold text-xl text-foreground mb-1">Оставить заявку</h2>
                <p className="text-sm text-muted-foreground mb-5">Менеджер свяжется с вами и уточнит детали</p>

                <div className="space-y-3">
                  <input
                    type="text"
                    placeholder="Ваше имя *"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className={inputCls}
                  />
                  <div>
                    <input
                      type="tel"
                      placeholder="+7 (___) ___-__-__"
                      value={phone}
                      onChange={(e) => setPhone(formatPhone(phone, e.target.value))}
                      onBlur={() => setPhoneTouched(true)}
                      className={phoneTouched && !phoneValid ? inputError : inputCls}
                    />
                    {phoneTouched && !phoneValid && (
                      <p className="text-xs text-red-500 mt-1">Введите номер России, Казахстана или Беларуси</p>
                    )}
                  </div>
                  <button
                    onClick={handleSubmit}
                    disabled={!name.trim() || !phoneValid || sending}
                    className="w-full py-4 bg-primary text-white rounded-xl font-bold text-base hover:bg-primary/90 transition-all shadow-sm disabled:opacity-40"
                  >
                    {sending ? "Отправляем..." : "Отправить заявку"}
                  </button>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Отправляя форму, я соглашаюсь с{" "}
                    <a href="https://t-sib.ru/assets/politika_t-sib16.05.25.pdf" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                      политикой обработки персональных данных
                    </a>
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}