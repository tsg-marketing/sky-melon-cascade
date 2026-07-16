import { useEffect } from "react";
import { useLocation } from "react-router-dom";

// Высота фиксированной шапки — чтобы секция не пряталась под ней.
const HEADER_OFFSET = 90;

/**
 * Прокручивает к секции по якорю (#id) после перехода между страницами.
 * Контент главной подгружается асинхронно, из-за чего высота страницы меняется
 * и обычный scrollIntoView «промахивается». Поэтому мы:
 *  1) ждём появления элемента;
 *  2) докручиваем повторно, пока целевая позиция не стабилизируется.
 */
export default function ScrollToHash() {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    if (!hash) {
      window.scrollTo(0, 0);
      return;
    }
    const id = decodeURIComponent(hash.slice(1));
    let cancelled = false;
    let timer: ReturnType<typeof setTimeout>;

    const targetTop = (el: HTMLElement) =>
      Math.max(0, el.getBoundingClientRect().top + window.scrollY - HEADER_OFFSET);

    // Ждём, пока элемент появится в DOM.
    const waitForEl = (tries: number) => {
      if (cancelled) return;
      const el = document.getElementById(id);
      if (el) {
        stabilize(el, 0, -1);
        return;
      }
      if (tries < 50) timer = setTimeout(() => waitForEl(tries + 1), 80);
    };

    // Докручиваем, пока целевая позиция не перестанет меняться (страница «дорастёт»).
    const stabilize = (el: HTMLElement, stableCount: number, prevTop: number) => {
      if (cancelled) return;
      const top = targetTop(el);
      window.scrollTo({ top, behavior: "smooth" });

      // Позиция считается стабильной, если 4 замера подряд почти не меняются.
      const same = Math.abs(top - prevTop) < 2;
      const nextStable = same ? stableCount + 1 : 0;
      if (nextStable < 4) {
        timer = setTimeout(() => stabilize(el, nextStable, top), 150);
      }
    };

    waitForEl(0);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [pathname, hash]);

  return null;
}
