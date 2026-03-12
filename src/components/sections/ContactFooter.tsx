import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Icon from "@/components/ui/icon";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState, useEffect, useRef } from "react";

const ContactFooter = () => {
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    eventType: "",
    message: "",
  });
  const [isFooterVisible, setIsFooterVisible] = useState(false);
  const footerRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsFooterVisible(entry.isIntersecting);
      },
      { threshold: 0.1 }
    );

    if (footerRef.current) {
      observer.observe(footerRef.current);
    }

    return () => {
      if (footerRef.current) {
        observer.unobserve(footerRef.current);
      }
    };
  }, []);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus('idle');
    
    try {
      const response = await fetch('https://functions.poehali.dev/2309ba17-4ede-49a6-b3d3-603168ba5fed', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          phone: formData.phone,
          message: `Тип мероприятия: ${formData.eventType || 'Не указан'}\n\n${formData.message || 'Нет дополнительных комментариев'}`
        }),
      });
      
      const data = await response.json();
      
      if (response.ok && data.success) {
        setSubmitStatus('success');
        setFormData({ name: '', phone: '', eventType: '', message: '' });
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        try { (window as any).ym?.(107258870, 'reachGoal', 'send_FOS'); } catch (_e) { /* noop */ }
        setTimeout(() => setSubmitStatus('idle'), 5000);
      } else {
        setSubmitStatus('error');
        setTimeout(() => setSubmitStatus('idle'), 5000);
      }
    } catch (error) {
      console.error('Error:', error);
      setSubmitStatus('error');
      setTimeout(() => setSubmitStatus('idle'), 5000);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <section id="contact" className="py-20 px-4 bg-gradient-to-br from-primary to-primary/80">
        <div className="container mx-auto max-w-3xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-5xl font-bold mb-4 text-primary-foreground">
              Готовы обсудить ваше мероприятие?
            </h2>
            <p className="text-lg text-primary-foreground/90">
              Оставьте заявку, и наш менеджер свяжется с вами в течение часа. Мы ответим на все вопросы, рассчитаем стоимость и предложим оптимальное решение.
            </p>
          </div>

          <Card className="backdrop-blur-sm bg-background/95">
            <CardContent className="pt-6">
              <form onSubmit={handleSubmit} className="space-y-4">
                <Input
                  placeholder="Ваше имя*"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  className="text-base"
                />
                <Input
                  type="tel"
                  placeholder="Телефон*"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  required
                  className="text-base"
                />
                <Select onValueChange={(value) => setFormData({ ...formData, eventType: value })}>
                  <SelectTrigger className="text-base">
                    <SelectValue placeholder="Тип мероприятия" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="corporate">Корпоративное мероприятие</SelectItem>
                    <SelectItem value="concert">Концерт / Фестиваль</SelectItem>
                    <SelectItem value="wedding">Свадьба / Частное мероприятие</SelectItem>
                    <SelectItem value="government">Деловое мероприятие</SelectItem>
                    <SelectItem value="other">Другое мероприятие</SelectItem>
                  </SelectContent>
                </Select>
                <Textarea
                  placeholder="Комментарий / Вопрос"
                  rows={4}
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  className="text-base"
                />
                <Button 
                  type="submit" 
                  className="w-full bg-accent hover:bg-accent/90 text-lg py-6"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Отправка...' : 'Отправить заявку'}
                </Button>
                
                {submitStatus === 'success' && (
                  <div className="p-4 bg-green-500/10 border border-green-500/30 rounded-lg text-green-500 text-center">
                    ✓ Заявка отправлена! Мы свяжемся с вами в ближайшее время.
                  </div>
                )}
                
                {submitStatus === 'error' && (
                  <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg text-red-500 text-center">
                    ✗ Ошибка отправки. Попробуйте позвонить нам напрямую.
                  </div>
                )}
              </form>

              <div className="mt-8 pt-8 border-t">
                <p className="text-center mb-4 font-semibold">Или свяжитесь с нами удобным способом:</p>
                <div className="flex flex-wrap justify-center gap-3">
                  {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                  <a href="tel:+79089925030" onClick={() => { try { (window as any).ym?.(107258870, 'reachGoal', 'click_phone'); } catch (_e) { /* noop */ } }} className="flex items-center gap-2 px-4 py-2 border-2 border-primary/30 rounded-lg hover:border-accent hover:bg-accent/10 transition-all">
                    <Icon name="Phone" size={18} className="text-primary" />
                    <span className="text-sm">+7 (908) 992-50-30</span>
                  </a>
                  {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                  <a href="tel:+79147063497" onClick={() => { try { (window as any).ym?.(107258870, 'reachGoal', 'click_phone'); } catch (_e) { /* noop */ } }} className="flex items-center gap-2 px-4 py-2 border-2 border-primary/30 rounded-lg hover:border-accent hover:bg-accent/10 transition-all">
                    <Icon name="PhoneCall" size={18} className="text-primary" />
                    <span className="text-sm">+7 (914) 706-34-97</span>
                  </a>
                  {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                  <a href="mailto:ppt@pmvl.ru" onClick={() => { try { (window as any).ym?.(107258870, 'reachGoal', 'click_email'); } catch (_e) { /* noop */ } }} className="flex items-center gap-2 px-4 py-2 border-2 border-primary/30 rounded-lg hover:border-accent hover:bg-accent/10 transition-all">
                    <Icon name="Mail" size={18} className="text-primary" />
                    <span className="text-sm">ppt@pmvl.ru</span>
                  </a>
                  <a href="https://t.me/protechvl" className="flex items-center gap-2 px-4 py-2 border-2 border-primary/30 rounded-lg hover:border-accent hover:bg-accent/10 transition-all">
                    <Icon name="Send" size={18} className="text-primary" />
                    <span className="text-sm">Telegram</span>
                  </a>
                </div>
              </div>

              <div className="mt-6 text-center text-sm text-muted-foreground">
                <Icon name="MapPin" size={16} className="inline mr-2" />
                г. Владивосток, пр-кт Океанский, 54, оф. 315
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      <footer ref={footerRef} className="py-16 px-4 bg-gradient-to-b from-slate-900 via-slate-950 to-black border-t border-primary/20 relative overflow-hidden">
        <div className={`absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-accent/5 pointer-events-none transition-opacity duration-1000 ${isFooterVisible ? 'opacity-100 animate-pulse' : 'opacity-50'}`}></div>
        <div className={`absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-1 bg-gradient-to-r from-transparent via-accent to-transparent transition-opacity duration-1000 ${isFooterVisible ? 'opacity-100' : 'opacity-0'}`}></div>
        <div className="container mx-auto relative z-10">
          <div className="grid md:grid-cols-4 gap-12 mb-12">
            <div>
              <img 
                src="https://cdn.poehali.dev/projects/dce3c669-40cb-458b-84d5-2fd7d036caae/bucket/7c47876a-e0ae-41dc-9c50-c2d65c4a8182.png" 
                alt="Протэк" 
                className="h-16 w-auto mb-4"
              />
              <p className="text-secondary italic mb-4">«Создаем события своими руками»</p>
              <p className="text-sm text-muted-foreground">
                Профессиональное техническое обеспечение мероприятий во Владивостоке и на Дальнем Востоке.
              </p>
            </div>

            <div>
              <h4 className="font-bold text-lg mb-4 text-white">Услуги</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-primary transition-colors">Звуковое оборудование</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Световое оборудование</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">LED-экраны</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Сценические конструкции</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Шатры</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Комплексное обеспечение</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold text-lg mb-4 text-white">Информация</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-primary transition-colors">О компании</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Портфолио</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Отзывы</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Контакты</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Политика конфиденциальности</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold text-lg mb-4 text-white">Контакты</h4>
              <ul className="space-y-3 text-sm">
                <li className="flex items-start gap-2">
                  <Icon name="Phone" size={16} className="text-primary mt-1" />
                  <a href="tel:+79089925030" className="text-primary hover:text-accent transition-colors">+7 (908) 992-50-30</a>
                </li>
                <li className="flex items-start gap-2">
                  <Icon name="Phone" size={16} className="text-primary mt-1" />
                  <a href="tel:+79147063497" className="text-primary hover:text-accent transition-colors">+7 (914) 706-34-97</a>
                </li>
                <li className="flex items-start gap-2">
                  <Icon name="Mail" size={16} className="text-primary mt-1" />
                  <a href="mailto:ppt@pmvl.ru" className="text-primary hover:text-accent transition-colors">ppt@pmvl.ru</a>
                </li>
                <li className="flex items-start gap-2">
                  <Icon name="MapPin" size={16} className="text-primary mt-1" />
                  <span className="text-muted-foreground">г. Владивосток, пр-кт Океанский, 54, оф. 315</span>
                </li>
              </ul>

              <div className="mt-6">
                <p className="text-sm font-semibold mb-3">Мы в соцсетях:</p>
                <a href="https://t.me/protechvl" className="inline-flex items-center gap-2 text-primary hover:text-accent transition-colors">
                  <Icon name="Send" size={20} />
                  <span className="text-sm">Telegram</span>
                </a>
              </div>
            </div>
          </div>

          <div className="pt-8 border-t border-border flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-muted-foreground">
            <p>© 2026 Pacific Protec. Все права защищены.</p>
            <p>ООО "Пасифик Протек" | ИНН 2543XXXXXX</p>
          </div>
        </div>
      </footer>
    </>
  );
};

export default ContactFooter;