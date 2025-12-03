// apps/web/src/components/AdsFooter.tsx
import { useEffect, useState } from "react";
import type { Anuncio, UbicacionAnuncio } from "../api/anuncios";
import { getAnunciosByUbicacion, registrarClick } from "../api/anuncios";
import { ChevronLeft, ChevronRight } from "lucide-react";

type Props = {
  ubicacion: UbicacionAnuncio;
};

export default function AdsFooter({ ubicacion }: Props) {
  const [ads, setAds] = useState<Anuncio[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  // Cargar anuncios por ubicación
  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    setError(null);

    getAnunciosByUbicacion(ubicacion)
      .then((data) => {
        if (!isMounted) return;
        setAds(data);
        setActiveIndex(0);
      })
      .catch((e: any) => {
        if (!isMounted) return;
        setError(e?.message || "Error cargando anuncios");
      })
      .finally(() => {
        if (!isMounted) return;
        setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [ubicacion]);

  // Rotar anuncio cada 15 segundos
  useEffect(() => {
    if (ads.length <= 1) return;

    const id = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % ads.length);
    }, 10000);

    return () => clearInterval(id);
  }, [ads.length]);

  if (!loading && !error && ads.length === 0) {
    return null;
  }

  const currentAd = ads[activeIndex];

  const goPrev = () => {
    if (ads.length === 0) return;
    setActiveIndex((prev) =>
      prev === 0 ? ads.length - 1 : prev - 1
    );
  };

  const goNext = () => {
    if (ads.length === 0) return;
    setActiveIndex((prev) => (prev + 1) % ads.length);
  };

  return (
    <footer className="mt-8 border-t border-neutral-800 bg-neutral-950/95 backdrop-blur">
      <div className="mx-auto max-w-6xl px-0 md:px-4 py-3 space-y-2">
        {/* Header pequeño */}
        <div className="flex items-center justify-between gap-2 px-4">
          <span className="text-xs font-semibold uppercase tracking-wide text-neutral-400">
            Anuncio patrocinado
          </span>

          {loading && (
            <span className="text-[11px] text-neutral-500">
              Cargando anuncio...
            </span>
          )}

          {error && (
            <span className="text-[11px] text-red-400">
              {error}
            </span>
          )}
        </div>

        {/* Banner + flechas */}
        <div className="px-0 md:px-4">
          <div className="relative w-full overflow-hidden rounded-none md:rounded-2xl border-t border-neutral-800 md:border bg-neutral-900/80">
            {!loading && !error && currentAd && (
              <>
                {/* Flecha izquierda */}
                {ads.length > 1 && (
                  <button
                    type="button"
                    onClick={goPrev}
                    className="absolute left-2 top-1/2 z-10 -translate-y-1/2 rounded-full bg-black/50 p-1.5 text-neutral-100 hover:bg-black/70 transition"
                    aria-label="Anterior anuncio"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                )}

                {/* Flecha derecha */}
                {ads.length > 1 && (
                  <button
                    type="button"
                    onClick={goNext}
                    className="absolute right-2 top-1/2 z-10 -translate-y-1/2 rounded-full bg-black/50 p-1.5 text-neutral-100 hover:bg-black/70 transition"
                    aria-label="Siguiente anuncio"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                )}

                {/* Imagen del anuncio */}
                <a
                  href={currentAd.enlace_destino || "#"}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => registrarClick(currentAd.id).catch(() => {})}
                  className="block w-full"
                >
                  <img
                    src={currentAd.imagen_url}
                    alt={currentAd.titulo}
                    className="block w-full h-auto max-h-[260px] object-contain mx-auto transition-opacity duration-500"
                  />
                </a>
              </>
            )}
          </div>
        </div>

        {/* Título + indicadores */}
        {!loading && !error && currentAd && (
          <div className="px-4 flex items-center justify-between gap-3">
            {/* Título del anuncio */}
            <div className="min-w-0">
              <p className="text-sm font-medium text-neutral-100 truncate">
                {currentAd.titulo}
              </p>
              {currentAd.contenido && (
                <p className="text-[11px] text-neutral-400 truncate">
                  {currentAd.contenido}
                </p>
              )}
            </div>

            {/* Bullets del carrusel */}
            {ads.length > 1 && (
              <div className="flex items-center gap-1">
                {ads.map((ad, idx) => (
                  <button
                    key={ad.id}
                    type="button"
                    onClick={() => setActiveIndex(idx)}
                    className={`h-1.5 w-4 rounded-full transition ${
                      idx === activeIndex
                        ? "bg-emerald-400"
                        : "bg-neutral-700"
                    }`}
                    aria-label={`Ir al anuncio ${idx + 1}`}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </footer>
  );
}
