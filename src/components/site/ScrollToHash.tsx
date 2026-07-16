import { useEffect } from "react";
import { useLocation } from "react-router-dom";

/**
 * Прокручивает к секции по якорю (#id) после перехода между страницами.
 * React Router сам не скроллит к hash, а секции главной подгружаются не сразу —
 * поэтому пробуем найти элемент несколько раз с небольшой задержкой.
 */
export default function ScrollToHash() {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    if (!hash) {
      window.scrollTo(0, 0);
      return;
    }
    const id = decodeURIComponent(hash.slice(1));
    let tries = 0;
    let timer: ReturnType<typeof setTimeout>;

    const tryScroll = () => {
      const el = document.getElementById(id);
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "start" });
        return;
      }
      if (tries++ < 40) timer = setTimeout(tryScroll, 100);
    };
    tryScroll();

    return () => clearTimeout(timer);
  }, [pathname, hash]);

  return null;
}
