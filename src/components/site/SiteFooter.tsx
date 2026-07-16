import Icon from "@/components/ui/icon";

const MAIN_LINKS = [
  { href: "/massagers", label: "Массажёры мяса" },
  { href: "/injector", label: "Инъекторы" },
  { href: "/slicers", label: "Слайсеры" },
  { href: "/ldogenerator", label: "Льдогенераторы" },
];

/**
 * Единый футер сайта. onGetKp — открыть форму КП (если задан), иначе ведёт на #contacts.
 */
export default function SiteFooter({ onGetKp }: { onGetKp?: () => void }) {
  return (
    <footer className="border-t border-border py-12 px-6 bg-background">
      <div className="max-w-7xl mx-auto">
        <div className="grid md:grid-cols-4 gap-8 mb-10">
          <div className="md:col-span-1">
            <a href="/"><img src="https://cdn.poehali.dev/files/b643e2cd-1c2b-461b-b32b-4053b1b9e72b.jpg" alt="Техносиб" className="h-8 w-auto object-contain mb-2" /></a>
            <p className="text-xs text-muted-foreground mb-4">Оборудование для мясо и рыбопереработки</p>
            <div className="space-y-2">
              <a href="tel:88005059124" className="flex items-center gap-2 text-sm text-foreground hover:text-primary transition-colors">
                <Icon name="Phone" size={14} className="text-primary" />8 800 505-91-24
              </a>
              <a href="mailto:massagers@t-sib.ru" className="flex items-center gap-2 text-sm text-foreground hover:text-primary transition-colors">
                <Icon name="Mail" size={14} className="text-primary" />massagers@t-sib.ru
              </a>
            </div>
          </div>
          <div>
            <p className="font-semibold text-sm text-foreground mb-3">Оборудование</p>
            <div className="space-y-2">
              {MAIN_LINKS.map((l) => (
                <a key={l.href} href={l.href} className="block text-sm text-muted-foreground hover:text-primary transition-colors">{l.label}</a>
              ))}
            </div>
          </div>
          <div>
            <p className="font-semibold text-sm text-foreground mb-3">Компания</p>
            <div className="space-y-2">
              <a href="#technosib" className="block text-sm text-muted-foreground hover:text-primary transition-colors">О компании</a>
              <a href="#advantages" className="block text-sm text-muted-foreground hover:text-primary transition-colors">Преимущества</a>
              <a href="#service" className="block text-sm text-muted-foreground hover:text-primary transition-colors">Сервис и поддержка</a>
              <a href="#delivery" className="block text-sm text-muted-foreground hover:text-primary transition-colors">Доставка</a>
              <a href="/contacts" className="block text-sm text-muted-foreground hover:text-primary transition-colors">Контакты</a>
            </div>
          </div>
          <div>
            <p className="font-semibold text-sm text-foreground mb-3">Заявка</p>
            <div className="mt-1">
              {onGetKp ? (
                <button onClick={onGetKp} className="inline-block px-5 py-2.5 bg-primary text-white text-sm font-semibold rounded-full hover:bg-primary/90 transition-all shadow-sm">Получить КП</button>
              ) : (
                <a href="#contacts" className="inline-block px-5 py-2.5 bg-primary text-white text-sm font-semibold rounded-full hover:bg-primary/90 transition-all shadow-sm">Получить КП</a>
              )}
            </div>
          </div>
        </div>
        <div className="border-t border-border pt-6 space-y-4">
          <p className="text-xs text-muted-foreground leading-relaxed max-w-4xl">
            Общество с ограниченной ответственностью «Техно-Сиб Групп». Юридический адрес: 630005, г. Новосибирск, ул. Крылова, д. 36, этаж 8, офис 81. ИНН 5406804844, ОГРН 1205400012146, КПП 540601001.
          </p>
          <div className="flex flex-col md:flex-row items-center justify-end gap-6 text-xs text-muted-foreground">
            <a href="https://t-sib.ru/assets/politika_t-sib16.05.25.pdf" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">Политика обработки данных</a>
            <a href="https://t-sib.ru/assets/soglasie_t-sib16.05.25.pdf" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">Согласие на обработку</a>
          </div>
        </div>
      </div>
    </footer>
  );
}