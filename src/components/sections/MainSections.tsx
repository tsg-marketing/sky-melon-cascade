import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Icon from "@/components/ui/icon";

const MainSections = () => {
  const statistics = [
    { icon: "CalendarCheck", number: "200+", text: "мероприятий за 5 лет" },
    { icon: "Users", number: "10 000+", text: "участников на крупнейшем проекте" },
    { icon: "Headset", number: "24/7", text: "техподдержка на мероприятии" },
    { icon: "Star", number: "100%", text: "положительных отзывов" },
  ];

  const services = [
    {
      id: "sound",
      title: "Звуковое оборудование",
      description: "Кристально чистый звук для 30-5000 гостей. Профессиональные акустические системы, микшерные пульты, микрофоны.",
      icon: "Volume2",
      image: "https://cdn.poehali.dev/projects/dce3c669-40cb-458b-84d5-2fd7d036caae/files/06e843f3-2a26-40ee-ac96-f319940d0dbf.jpg",
    },
    {
      id: "light",
      title: "Световое оборудование",
      description: "LED-головы, прожекторы, лазерные установки. Создаем атмосферу и wow-эффект световым дизайном любой сложности.",
      icon: "Lightbulb",
      image: "https://cdn.poehali.dev/projects/dce3c669-40cb-458b-84d5-2fd7d036caae/files/af9f46ea-d932-4d57-bbd4-5c5600cb3b57.jpg",
    },
    {
      id: "led",
      title: "LED-экраны",
      description: "Светодиодные экраны высокого разрешения для indoor и outdoor. Яркая картинка в любых условиях.",
      icon: "Monitor",
      image: "https://cdn.poehali.dev/projects/dce3c669-40cb-458b-84d5-2fd7d036caae/files/82d747da-1c70-45a8-9f14-4aade88fd9b5.jpg",
    },
    {
      id: "stage",
      title: "Сценические конструкции",
      description: "Монтаж сцен, подиумов, конструкций на фермах. Проектирование с учетом специфики мероприятия. Безопасность и эстетика.",
      icon: "Boxes",
      image: "https://cdn.poehali.dev/projects/dce3c669-40cb-458b-84d5-2fd7d036caae/files/53a03152-dc7d-4b9a-bef1-f9769e288ec3.jpg",
    },
    {
      id: "tents",
      title: "Шатры",
      description: "Установка шатров для выездных мероприятий. Защита от погоды и создание комфортного пространства.",
      icon: "Home",
      image: "https://cdn.poehali.dev/projects/dce3c669-40cb-458b-84d5-2fd7d036caae/files/58384b3b-cd78-45cd-b557-0c82f489ccfa.jpg",
    },
    {
      id: "turnkey",
      title: "Комплексное обеспечение",
      description: "Полный технический комплекс «под ключ»: от разработки концепции до постпродакшена. Один подрядчик — полная ответственность.",
      icon: "Sparkles",
      image: "https://cdn.poehali.dev/projects/dce3c669-40cb-458b-84d5-2fd7d036caae/files/d5272eda-60b5-41fc-81bb-84082b6843f5.jpg",
      highlight: true,
    },
  ];

  const targetAudience = [
    {
      icon: "Briefcase",
      title: "Корпоративные клиенты",
      description: "Новогодние корпоративы, конференции, презентации, тимбилдинги, деловые форумы. Гарантируем техническую безупречность и современные решения.",
      example: "Примеры: Новогодний корпоратив «Роснефть», Бизнес-форум «Дальний Восток»",
    },
    {
      icon: "Landmark",
      title: "Государственные и муниципальные органы",
      description: "Парады, городские праздники, официальные церемонии, выставки. Опыт работы с высокими стандартами безопасности и надежности.",
      example: "Реализовано: Техническое обеспечение Парада Победы во Владивостоке",
      highlighted: true,
    },
    {
      icon: "Music",
      title: "Концерты и фестивали",
      description: "Музыкальные концерты, фестивали, шоу-программы, DJ-party. Мощные системы и профессиональные специалисты для зрелищных событий.",
      example: "Примеры: Летний фестиваль V-ROX, Концерт на набережной Спортивная Гавань",
    },
    {
      icon: "Heart",
      title: "Частные мероприятия",
      description: "Свадьбы, юбилеи, дни рождения, выпускные. Создаем праздничную атмосферу с профессиональным звуком и светом.",
      example: "",
    },
  ];

  const advantages = [
    { icon: "Target", title: "Индивидуальный подход", description: "Выезд специалиста на площадку, оценка акустики и освещения, разработка технического решения под ваши задачи — бесплатно." },
    { icon: "Award", title: "Опыт на сложных проектах", description: "Более 200 мероприятий за последние 5 лет. От камерных корпоративов на 50 человек до массовых городских праздников на 10 000+ участников." },
    { icon: "Users", title: "Команда профессионалов", description: "Звукорежиссеры, светорежиссеры, видеоинженеры с большим опытом. Круглосуточная техническая поддержка на мероприятии." },
    { icon: "Package", title: "Собственный парк оборудования", description: "Только современная техника ведущих брендов. Регулярное обновление и обслуживание." },
    { icon: "Zap", title: "Быстрая реакция", description: "Доставка по Владивостоку в день заказа. Экстренные выезды для срочных мероприятий." },
    { icon: "Calculator", title: "Прозрачное ценообразование", description: "Детальная смета с указанием каждой позиции. Без скрытых доплат и сюрпризов." },
    { icon: "ShieldCheck", title: "Гарантии и надежность", description: "Дублирующее оборудование на критически важных мероприятиях. Договор с четкими обязательствами." },
    { icon: "MapPin", title: "Работаем по всему Дальнему Востоку", description: "Владивосток, Артём, Находка, Уссурийск, Партизанск. Выездные мероприятия в отдаленные районы края." },
  ];

  const processSteps = [
    { number: 1, icon: "Phone", title: "Заявка", description: "Вы оставляете заявку на сайте, звоните или пишете в мессенджеры. Мы отвечаем в течение часа в рабочее время." },
    { number: 2, icon: "UserCheck", title: "Консультация", description: "Наш менеджер уточняет детали: дата, место, формат, количество гостей, пожелания. Предлагаем оптимальное решение." },
    { number: 3, icon: "MapPin", title: "Выезд и расчет", description: "Технический специалист выезжает на площадку, оценивает условия, разрабатывает схему. Вы получаете детальную смету. Бесплатно." },
    { number: 4, icon: "FileText", title: "Договор и подготовка", description: "Заключаем договор, согласовываем ТЗ. Готовим и тестируем оборудование перед выездом." },
    { number: 5, icon: "CheckCircle", title: "Монтаж и проведение", description: "Привозим, монтируем, настраиваем оборудование. Наши специалисты работают на мероприятии от начала до конца." },
  ];

  return (
    <>
      <section id="statistics" className="py-8 px-4 bg-card">
        <div className="container mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {statistics.map((stat, idx) => (
              <Card key={idx} className="stat-card text-center border-primary/20 hover:border-primary/50 transition-all hover:-translate-y-2">
                <CardContent className="pt-6">
                  <Icon name={stat.icon} size={48} className="mx-auto mb-4 text-primary" strokeWidth={2} />
                  <div className="text-4xl font-bold mb-2">{stat.number}</div>
                  <p className="text-sm text-muted-foreground">{stat.text}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section id="services" className="py-20 px-4">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <Badge className="mb-4">Наши услуги</Badge>
            <h2 className="text-3xl md:text-5xl font-bold mb-4 text-secondary">Что мы предлагаем</h2>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
              Pacific Protech — ваш технический партнер для мероприятий любого масштаба. Мы предоставляем полный спектр услуг: от аренды современного оборудования до комплексного технического обеспечения с профессиональной командой специалистов.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {services.map((service) => (
              <Card key={service.id} className={`service-card overflow-hidden hover:-translate-y-2 transition-all ${service.highlight ? 'border-accent' : ''}`}>
                <div className="h-48 overflow-hidden">
                  <img src={service.image} alt={service.title} className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" />
                </div>
                <CardHeader>
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                    <Icon name={service.icon} size={24} className="text-primary" />
                  </div>
                  <CardTitle className="text-xl">{service.title}</CardTitle>
                  <CardDescription>{service.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button variant="ghost" className="text-accent hover:text-accent/80 p-0">
                    Подробнее <Icon name="ArrowRight" size={16} className="ml-1" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 px-4 bg-card">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold mb-4 text-secondary">
              Мы обеспечиваем мероприятия любого формата
            </h2>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {targetAudience.map((audience, idx) => (
              <Card key={idx} className={`border-primary/20 ${audience.highlighted ? 'border-accent' : ''}`}>
                <CardHeader>
                  <Icon name={audience.icon} size={48} className="text-primary mb-4" />
                  <CardTitle className="text-2xl">{audience.title}</CardTitle>
                  <CardDescription className="text-base">{audience.description}</CardDescription>
                  {audience.example && (
                    <p className={`text-sm italic mt-4 ${audience.highlighted ? 'text-accent font-semibold' : 'text-secondary'}`}>
                      {audience.example}
                    </p>
                  )}
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 px-4">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <Badge className="mb-4">Почему мы</Badge>
            <h2 className="text-3xl md:text-5xl font-bold mb-4 text-secondary">Почему выбирают нас</h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {advantages.map((adv, idx) => (
              <Card key={idx} className="border-primary/20 hover:border-primary/50 transition-all">
                <CardHeader>
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                    <Icon name={adv.icon} size={24} className="text-primary" />
                  </div>
                  <CardTitle className="text-lg">{adv.title}</CardTitle>
                  <CardDescription className="text-sm">{adv.description}</CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 px-4 bg-card">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold mb-4 text-secondary">
              Процесс работы — просто и понятно
            </h2>
          </div>

          <div className="hidden md:flex justify-between items-start mb-8 relative">
            <div className="absolute top-12 left-0 right-0 h-1 bg-primary" style={{ width: '80%', margin: '0 auto' }}></div>
            {processSteps.map((step) => (
              <div key={step.number} className="flex flex-col items-center max-w-[200px] relative z-10">
                <div className="w-16 h-16 rounded-full bg-accent text-primary-foreground flex items-center justify-center text-2xl font-bold mb-4">
                  {step.number}
                </div>
                <Icon name={step.icon} size={40} className="text-primary mb-4" strokeWidth={2} />
                <h3 className="font-semibold text-lg mb-2 text-center">{step.title}</h3>
                <p className="text-sm text-muted-foreground text-center">{step.description}</p>
              </div>
            ))}
          </div>

          <div className="md:hidden space-y-6">
            {processSteps.map((step) => (
              <Card key={step.number} className="border-primary/20">
                <CardHeader>
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 rounded-full bg-accent text-primary-foreground flex items-center justify-center text-xl font-bold flex-shrink-0">
                      {step.number}
                    </div>
                    <Icon name={step.icon} size={32} className="text-primary" />
                  </div>
                  <CardTitle className="text-lg">{step.title}</CardTitle>
                  <CardDescription>{step.description}</CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>

          <div className="text-center mt-12">
            <Button 
              size="lg" 
              className="bg-accent hover:bg-accent/90"
              onClick={() => {
                const contactSection = document.querySelector('#contact');
                contactSection?.scrollIntoView({ behavior: 'smooth' });
              }}
            >
              Начать работу <Icon name="ArrowRight" className="ml-2" size={20} />
            </Button>
          </div>
        </div>
      </section>
    </>
  );
};

export default MainSections;