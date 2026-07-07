import { useEffect } from "react";
import { useLocation } from "react-router-dom";

const SITE_ORIGIN = "https://meatmassagers.ru";

/**
 * Глобально при каждой смене маршрута:
 *  - скроллит страницу к верху (карточка/раздел открывается с первого экрана);
 *  - выставляет canonical на текущую страницу (сам URL без query/hash).
 * Отдельные страницы могут переопределить canonical позже в своих эффектах.
 */
export default function RouteMeta() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);

    const href = `${SITE_ORIGIN}${pathname}`;
    let link = document.querySelector("link[rel='canonical']") as HTMLLinkElement | null;
    if (!link) {
      link = document.createElement("link");
      link.setAttribute("rel", "canonical");
      document.head.appendChild(link);
    }
    link.setAttribute("href", href);
  }, [pathname]);

  return null;
}
