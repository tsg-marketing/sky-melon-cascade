import { Button } from "@/components/ui/button";
import Icon from "@/components/ui/icon";
import Navigation from "@/components/Navigation";

const HeroHeader = () => {
  const scrollToPortfolio = () => {
    const portfolioSection = document.querySelector('#portfolio');
    portfolioSection?.scrollIntoView({ behavior: 'smooth' });
  };

  const scrollToContact = () => {
    const contactSection = document.querySelector('#contact');
    contactSection?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section className="relative min-h-screen flex flex-col">
      <Navigation />

      <div className="flex-1 flex items-center justify-center px-4 pt-24 pb-8 bg-gradient-to-b from-background via-background to-card relative overflow-hidden">
        
        <div className="container mx-auto text-center relative z-10 max-w-4xl">
          <img 
            src="https://cdn.poehali.dev/projects/dce3c669-40cb-458b-84d5-2fd7d036caae/bucket/7c47876a-e0ae-41dc-9c50-c2d65c4a8182.png" 
            alt="Протэк" 
            className="w-64 md:w-80 mx-auto mb-8 animate-fade-in"
          />
          <h1 className="text-4xl md:text-6xl font-bold mb-6 text-foreground animate-fade-in">
            Техническое обеспечение мероприятий под ключ
          </h1>
          <p className="text-xl md:text-2xl text-secondary mb-8 animate-fade-in">
            Звуковое и световое оборудование, LED-экраны, сценические конструкции, шатры
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8 animate-scale-in">
            <Button size="lg" className="text-lg bg-accent hover:bg-accent/90" onClick={scrollToContact}>
              <Icon name="MessageCircle" className="mr-2" size={20} />
              Получить расчет
            </Button>
            <Button size="lg" variant="outline" className="text-lg border-primary text-primary hover:bg-primary hover:text-primary-foreground" onClick={scrollToPortfolio}>
              Портфолио
            </Button>
          </div>
          <div className="flex flex-wrap gap-6 justify-center text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Icon name="Clock" size={18} className="text-primary" />
              <span>Работаем 24/7</span>
            </div>

          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroHeader;