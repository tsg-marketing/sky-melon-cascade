import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import Icon from "@/components/ui/icon";

const Navigation = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("");

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 100);

      const sections = ['#statistics', '#services', '#portfolio', '#testimonials', '#contact'];
      const scrollPosition = window.scrollY + 200;

      for (const sectionId of sections) {
        const section = document.querySelector(sectionId);
        if (section) {
          const sectionTop = (section as HTMLElement).offsetTop;
          const sectionHeight = (section as HTMLElement).offsetHeight;
          
          if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
            setActiveSection(sectionId);
            break;
          }
        }
      }
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToSection = (id: string) => {
    const section = document.querySelector(id);
    section?.scrollIntoView({ behavior: 'smooth' });
    setIsMobileMenuOpen(false);
  };

  const navItems = [
    { id: '#statistics', label: 'О нас' },
    { id: '#services', label: 'Услуги' },
    { id: '#portfolio', label: 'Портфолио' },
    { id: '#testimonials', label: 'Отзывы' },
    { id: '#contact', label: 'Контакты' },
  ];

  return (
    <nav 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled 
          ? 'bg-background/95 backdrop-blur-sm shadow-md' 
          : 'bg-transparent'
      }`}
    >
      <div className="container mx-auto px-4 py-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            <img 
              src="https://cdn.poehali.dev/projects/dce3c669-40cb-458b-84d5-2fd7d036caae/bucket/7c47876a-e0ae-41dc-9c50-c2d65c4a8182.png" 
              alt="Протэк" 
              className="h-12 w-auto cursor-pointer"
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            />
          </div>

          <div className="hidden lg:flex items-center gap-8">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => scrollToSection(item.id)}
                className={`transition-colors font-medium relative ${
                  activeSection === item.id 
                    ? 'text-accent' 
                    : 'text-foreground hover:text-accent'
                }`}
              >
                {item.label}
                {activeSection === item.id && (
                  <span className="absolute -bottom-1 left-0 right-0 h-0.5 bg-accent rounded-full" />
                )}
              </button>
            ))}
            <Button 
              size="sm" 
              className="bg-accent hover:bg-accent/90"
              onClick={() => scrollToSection('#contact')}
            >
              <Icon name="MessageCircle" className="mr-2" size={16} />
              Заказать
            </Button>
          </div>

          <div className="flex lg:hidden items-center gap-4">
            <a href="tel:+79089925030" className="text-primary hover:text-accent transition-colors">
              <Icon name="Phone" size={20} />
            </a>
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="text-primary hover:text-accent transition-colors"
              aria-label="Меню"
            >
              <Icon name={isMobileMenuOpen ? "X" : "Menu"} size={24} />
            </button>
          </div>
        </div>

        {isMobileMenuOpen && (
          <div className="lg:hidden mt-4 pb-4 border-t border-border/40 pt-4 space-y-3">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => scrollToSection(item.id)}
                className={`block w-full text-left transition-colors font-medium py-2 ${
                  activeSection === item.id 
                    ? 'text-accent' 
                    : 'text-foreground hover:text-accent'
                }`}
              >
                {item.label}
              </button>
            ))}
            <Button 
              className="w-full bg-accent hover:bg-accent/90"
              onClick={() => scrollToSection('#contact')}
            >
              <Icon name="MessageCircle" className="mr-2" size={16} />
              Заказать
            </Button>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navigation;