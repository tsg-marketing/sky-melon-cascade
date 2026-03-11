import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Icon from "@/components/ui/icon";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const API_URL = "https://functions.poehali.dev/ce15942a-c5f3-4e40-a6ce-0aca3ead1e01";

const fallbackTestimonials = [
  {
    id: 0,
    rating: 5,
    quote: "Сотрудничаем с Пасифик Протэк уже второй год. Обеспечивали наш бизнес-форум на 500 участников — всё прошло безупречно.",
    name: "Алексей Морозов",
    position: "Организатор мероприятий",
  },
];

const TestimonialsAndFAQ = () => {
  const [testimonials, setTestimonials] = useState(fallbackTestimonials);

  useEffect(() => {
    fetch(API_URL)
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) setTestimonials(data);
      })
      .catch(() => {});
  }, []);

  return (
    <>
      <section id="testimonials" className="py-20 px-4">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <Badge className="mb-4">Отзывы</Badge>
            <h2 className="text-3xl md:text-5xl font-bold mb-4 text-secondary">Что говорят наши клиенты</h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial) => (
              <Card key={testimonial.id} className="testimonial-card border-primary/20">
                <CardHeader>
                  <div className="flex gap-1 mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Icon key={i} name="Star" size={18} className="fill-accent text-accent" />
                    ))}
                  </div>
                  <CardDescription className="text-base italic">"{testimonial.quote}"</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="font-semibold text-primary">{testimonial.name}</div>
                  <div className="text-sm text-muted-foreground">{testimonial.position}</div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 px-4 bg-card">
        <div className="container mx-auto max-w-4xl">
          <div className="text-center mb-16">
            <Badge className="mb-4">FAQ</Badge>
            <h2 className="text-3xl md:text-5xl font-bold mb-4 text-secondary">Ответы на частые вопросы</h2>
          </div>

          <Accordion type="single" collapsible className="space-y-4">
            <AccordionItem value="faq-1" className="border border-primary/20 rounded-lg px-6">
              <AccordionTrigger className="text-lg font-bold text-foreground hover:no-underline">
                ❓ За какой срок нужно бронировать оборудование?
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground">
                Рекомендуем бронировать за 2-4 недели до мероприятия, особенно в пиковые сезоны (июль-октябрь). Однако мы готовы принять срочный заказ — позвоните, и мы найдем решение.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="faq-2" className="border border-primary/20 rounded-lg px-6">
              <AccordionTrigger className="text-lg font-bold text-foreground hover:no-underline">
                ❓ Входит ли доставка и монтаж в стоимость?
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground">
                Доставка рассчитывается индивидуально в зависимости от количества оборудования и удаленности площадки. Монтаж, настройка и демонтаж включаются в стоимость аренды. При необходимости обсудим иные условия.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="faq-3" className="border border-primary/20 rounded-lg px-6">
              <AccordionTrigger className="text-lg font-bold text-foreground hover:no-underline">
                ❓ Работают ли ваши специалисты на мероприятии?
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground">
                Да, при заказе комплексного обеспечения на мероприятии работает наша команда: звукорежиссер, светорежиссер, видеооператоры и выпускающий видеоинженер, а также прочие технические специалисты. Они управляют оборудованием, оперативно реагируют на изменения программы и гарантируют бесперебойную работу.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="faq-4" className="border border-primary/20 rounded-lg px-6">
              <AccordionTrigger className="text-lg font-bold text-foreground hover:no-underline">
                ❓ Что делать, если оборудование сломается во время мероприятия?
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground">
                Мы регулярно тестируем и обслуживаем всю технику, поэтому сбои крайне редки. На критически важных мероприятиях мы привозим дублирующее оборудование. Если всё же произойдет форс-мажор, наши специалисты оперативно заменят технику.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="faq-6" className="border border-primary/20 rounded-lg px-6">
              <AccordionTrigger className="text-lg font-bold text-foreground hover:no-underline">
                ❓ Работаете ли вы за пределами Владивостока?
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground">
                Да, мы выезжаем в любую точку Дальнего Востока. Стоимость доставки рассчитывается индивидуально в зависимости от расстояния.
              </AccordionContent>
            </AccordionItem>
          </Accordion>

          <div className="text-center mt-12">
            <p className="text-xl mb-4">Не нашли ответа?</p>
            <Button className="bg-accent hover:bg-accent/90">
              Задать вопрос <Icon name="ArrowRight" className="ml-2" size={18} />
            </Button>
          </div>
        </div>
      </section>
    </>
  );
};

export default TestimonialsAndFAQ;