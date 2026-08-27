import { useState } from "react";
import Icon from "@/components/ui/icon";
import { CatalogItem } from "@/lib/catalog";
import { sectionAnim } from "./shared";

/**
 * Ролики RuTube по пельменному оборудованию.
 * Заказчик передаёт videoId — до этого показываем только видео из фида.
 */
const RUTUBE_VIDEOS: { id: string; title: string }[] = [];

interface Props {
  visible: boolean;
  items: CatalogItem[];
}

export default function PelmeniVideos({ visible, items }: Props) {
  const [playing, setPlaying] = useState<string | null>(null);
  const [embedded, setEmbedded] = useState<string | null>(null);

  const withVideo = items.filter((i) => i.video).slice(0, 4);
  if (!withVideo.length && !RUTUBE_VIDEOS.length) return null;

  return (
    <section id="videos" className="py-12 px-6 bg-white scroll-mt-32">
      <div className="max-w-7xl mx-auto">
        <div className={`text-center mb-10 ${sectionAnim(visible)}`}>
          <span className="text-xs font-semibold tracking-widest text-primary uppercase">Смотрите в деле</span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-display font-black tracking-tight mt-3 text-foreground">
            Видео работы пельменных автоматов
          </h2>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {withVideo.map((v) => (
            <div key={v.id} className="bg-background border border-border rounded-2xl overflow-hidden shadow-sm">
              <div className="relative bg-black aspect-video">
                {playing === v.id ? (
                  <video src={v.video || ""} controls autoPlay playsInline preload="metadata" className="w-full h-full object-contain" />
                ) : (
                  <button onClick={() => setPlaying(v.id)} aria-label={`Смотреть видео: ${v.name}`} className="absolute inset-0 w-full h-full group">
                    {v.pictures[0] && (
                      <img src={v.pictures[0]} alt={`${v.name} — пельменный аппарат`} referrerPolicy="no-referrer" loading="lazy" className="w-full h-full object-contain opacity-70 group-hover:opacity-90 transition-opacity" />
                    )}
                    <span className="absolute inset-0 flex items-center justify-center">
                      <span className="w-16 h-16 bg-white/95 rounded-full flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                        <Icon name="Play" size={28} className="text-primary ml-1" />
                      </span>
                    </span>
                  </button>
                )}
              </div>
              <div className="p-5">
                <p className="font-bold text-base text-foreground leading-snug">{v.name}</p>
                <a href={`#${v.slug || `product-${v.id}`}`} className="inline-block mt-2 text-sm text-primary font-semibold hover:underline">
                  Смотреть в каталоге →
                </a>
              </div>
            </div>
          ))}

          {RUTUBE_VIDEOS.map((r) => (
            <div key={r.id} className="bg-background border border-border rounded-2xl overflow-hidden shadow-sm">
              <div className="relative bg-black aspect-video">
                {embedded === r.id ? (
                  <iframe
                    src={`https://rutube.ru/play/embed/${r.id}/`}
                    title={r.title}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    loading="lazy"
                    className="w-full h-full"
                  />
                ) : (
                  <button onClick={() => setEmbedded(r.id)} aria-label={`Смотреть видео: ${r.title}`} className="absolute inset-0 w-full h-full flex items-center justify-center group bg-black/80">
                    <span className="w-16 h-16 bg-white/95 rounded-full flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                      <Icon name="Play" size={28} className="text-primary ml-1" />
                    </span>
                  </button>
                )}
              </div>
              <div className="p-5">
                <p className="font-bold text-base text-foreground leading-snug">{r.title}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
