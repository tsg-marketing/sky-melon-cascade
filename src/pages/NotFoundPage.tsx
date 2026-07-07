import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import Icon from "@/components/ui/icon";
import SiteHeader from "@/components/site/SiteHeader";
import SiteFooter from "@/components/site/SiteFooter";

const NotFoundPage = () => {
  const location = useLocation();

  useEffect(() => {
    document.title = "Страница не найдена — Техносиб";
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <SiteHeader />

      <main className="flex-1 flex items-center justify-center px-4 pt-24 pb-16">
        <div className="text-center max-w-lg">
          <div className="relative inline-flex items-center justify-center mb-6">
            <span className="text-[7rem] sm:text-[9rem] font-display font-black leading-none bg-gradient-to-br from-primary to-orange-400 bg-clip-text text-transparent">404</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-display font-black text-foreground mb-3">Страница не найдена</h1>
          <p className="text-muted-foreground text-base sm:text-lg mb-8">
            Возможно, товар снят с производства или ссылка устарела. Загляните в каталог — там более 1000 моделей оборудования.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <a href="/" className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-primary text-white rounded-full font-bold text-base hover:bg-primary/90 transition-all shadow-lg shadow-primary/20">
              <Icon name="LayoutGrid" size={18} />Смотреть каталог
            </a>
            <a href="/contacts" className="inline-flex items-center justify-center gap-2 px-8 py-4 border-2 border-primary/30 text-primary rounded-full font-semibold text-base hover:border-primary hover:bg-primary/5 transition-all">
              <Icon name="Phone" size={18} />Связаться с нами
            </a>
          </div>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
};

export default NotFoundPage;
