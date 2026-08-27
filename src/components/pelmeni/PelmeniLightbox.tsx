import { useEffect } from "react";
import Icon from "@/components/ui/icon";

interface Props {
  photos: string[];
  index: number;
  onIndex: (i: number) => void;
  onClose: () => void;
}

export default function PelmeniLightbox({ photos, index, onIndex, onClose }: Props) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") onIndex((index - 1 + photos.length) % photos.length);
      if (e.key === "ArrowRight") onIndex((index + 1) % photos.length);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [index, photos.length, onIndex, onClose]);

  if (!photos.length) return null;

  return (
    <div className="fixed inset-0 z-[110] bg-black/90 flex items-center justify-center" onClick={onClose}>
      <button onClick={onClose} aria-label="Закрыть" className="absolute top-4 right-4 w-12 h-12 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition-colors z-10">
        <Icon name="X" size={24} className="text-white" />
      </button>
      <div className="relative w-full h-full flex items-center justify-center p-4" onClick={(e) => e.stopPropagation()}>
        <img src={photos[index]} alt="" referrerPolicy="no-referrer" className="max-w-full max-h-full object-contain" />
        {photos.length > 1 && (
          <>
            <button
              onClick={() => onIndex((index - 1 + photos.length) % photos.length)}
              aria-label="Предыдущее фото"
              className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition-colors"
            >
              <Icon name="ChevronLeft" size={24} className="text-white" />
            </button>
            <button
              onClick={() => onIndex((index + 1) % photos.length)}
              aria-label="Следующее фото"
              className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition-colors"
            >
              <Icon name="ChevronRight" size={24} className="text-white" />
            </button>
          </>
        )}
      </div>
    </div>
  );
}
