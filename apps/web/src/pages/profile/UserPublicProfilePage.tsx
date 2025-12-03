import { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  ShieldCheck,
  Star,
  Sparkles,
  Package,
  Loader2,
  AlertCircle,
  MessageCircle,
  Clock,
} from "lucide-react";

import {
  fetchPublicProfile,
  upsertProfileReview,
  type PublicProfile,
} from "../../api/profilePublic";
import { getCurrentUserId } from "../../api/profile";

export default function UserPublicProfilePage() {
  const { usuarioId } = useParams();
  const navigate = useNavigate();

  const [data, setData] = useState<PublicProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [reviewCalif, setReviewCalif] = useState<number>(5);
  const [reviewComent, setReviewComent] = useState<string>("");
  const [savingReview, setSavingReview] = useState(false);

  const currentUserId = getCurrentUserId(); // null si no está logueado
  const parsedUserId = usuarioId ? Number(usuarioId) : NaN;
  const isOwner =
    currentUserId && !Number.isNaN(parsedUserId)
      ? Number(currentUserId) === parsedUserId
      : false;

  const reload = useCallback(() => {
    if (!usuarioId) return;
    setLoading(true);
    fetchPublicProfile(Number(usuarioId), {
      pub_limit: 6,
      rev_limit: 10,
    })
      .then((d) => {
        setData(d);
        setError(null);

        // Prefill de la reseña si ya existe una del viewer
        if (d.viewerReview) {
          setReviewCalif(d.viewerReview.calificacion);
          setReviewComent(d.viewerReview.comentario ?? "");
        }
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [usuarioId]);

  useEffect(() => {
    reload();
  }, [reload]);

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!usuarioId) return;
    if (!currentUserId) {
      alert("Debes iniciar sesión para dejar una reseña");
      return;
    }
    if (isOwner) {
      alert("No puedes reseñarte a ti mismo");
      return;
    }

    try {
      setSavingReview(true);
      await upsertProfileReview(Number(usuarioId), {
        calificacion: reviewCalif,
        comentario: reviewComent,
      });
      await reload();
    } catch (err: any) {
      alert(err.message || "Error al guardar reseña");
    } finally {
      setSavingReview(false);
    }
  };

  // --- ESTADOS DE CARGA / ERROR ---

  if (loading) return <ProfileSkeleton />;

  if (error || !data) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 text-gray-500 gap-4">
        <AlertCircle size={48} className="text-gray-300" />
        <p>{error ?? "No se pudo cargar el perfil"}</p>
        <button
          onClick={() => navigate(-1)}
          className="text-emerald-600 font-medium hover:underline"
        >
          Volver atrás
        </button>
      </div>
    );
  }

  const p = data.perfil;
  const ratingNumber = Number(p.calificacion_prom ?? 0);
  const totalReviews = p.total_resenias ?? 0;
  const totalPubs = p.total_publicaciones ?? 0;

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-900 pb-20 selection:bg-emerald-100">
      {/* HEADER STICKY */}
      <div className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-gray-100 px-4 py-3 shadow-sm">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <button
            onClick={() => navigate(-1)}
            className="p-2 -ml-2 rounded-full hover:bg-gray-100 text-gray-600 transition-colors group"
          >
            <ArrowLeft
              size={20}
              className="group-hover:-translate-x-1 transition-transform"
            />
          </button>

          <span className="font-semibold text-gray-900 truncate max-w-[200px] md:max-w-md text-center">
            {p.full_name ?? "Perfil de usuario"}
          </span>

          <span className="text-xs text-gray-400">Perfil público</span>
        </div>
      </div>

      <main className="max-w-6xl mx-auto p-4 md:p-6 space-y-8 lg:space-y-10">
        {/* CABECERA PERFIL */}
        <section className="bg-white rounded-3xl border border-gray-100 shadow-sm p-5 md:p-7 flex flex-col md:flex-row gap-6 md:gap-8 items-start">
          {/* Avatar */}
          <div className="relative shrink-0">
            {p.foto ? (
              <img
                src={p.foto}
                alt={p.full_name ?? "Usuario"}
                className="w-24 h-24 md:w-28 md:h-28 rounded-full object-cover border border-gray-100 shadow-sm"
              />
            ) : (
              <div className="w-24 h-24 md:w-28 md:h-28 rounded-full bg-emerald-100 flex items-center justify-center text-3xl font-bold text-emerald-700 border border-emerald-50">
                {(p.full_name ?? "U").charAt(0)}
              </div>
            )}
            <div className="absolute -bottom-1 -right-1 bg-white p-0.5 rounded-full shadow-sm">
              <ShieldCheck
                size={18}
                className="text-emerald-500 fill-emerald-100"
              />
            </div>
          </div>

          {/* Info principal */}
          <div className="flex-1 flex flex-col gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
                {p.full_name ?? "Usuario sin nombre"}
              </h1>
              {isOwner && (
                <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-100">
                  Este eres tú ✨
                </span>
              )}
            </div>

            <p className="text-sm md:text-base text-gray-600 leading-relaxed">
              {p.acerca_de ?? "Este usuario aún no completó su descripción."}
            </p>

            <div className="flex flex-wrap gap-4 text-sm text-gray-600 mt-2">
              <div className="flex items-center gap-2">
                <div className="flex items-center text-amber-400">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      size={14}
                      className={
                        i < Math.round(ratingNumber)
                          ? "fill-amber-400"
                          : "text-gray-200"
                      }
                    />
                  ))}
                </div>
                <span className="font-semibold text-gray-900">
                  {ratingNumber.toFixed(1)}
                </span>
                <span className="text-gray-400 text-xs">
                  ({totalReviews} reseñas)
                </span>
              </div>

              <div className="flex items-center gap-2">
                <Sparkles size={16} className="text-emerald-500" />
                <span className="font-medium text-gray-900">
                  {totalPubs}{" "}
                  <span className="font-normal text-gray-500">
                    publicaciones activas
                  </span>
                </span>
              </div>

              {/* En lugar de ubicacion_texto usamos perfil_created_at */}
              {p.perfil_created_at && (
                <div className="flex items-center gap-1 text-gray-500">
                  <Clock size={14} />
                  <span className="text-xs md:text-sm">
                    Miembro desde{" "}
                    {new Date(p.perfil_created_at).toLocaleDateString()}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Botón dueño */}
          {isOwner && (
            <div className="md:self-center">
              <button
                onClick={() => navigate("/panel")}
                className="px-4 py-2 rounded-xl bg-gray-900 text-white text-sm font-semibold shadow hover:bg-emerald-600 transition-colors"
              >
                Ir a mi panel
              </button>
            </div>
          )}
        </section>

        {/* CONTENIDO PRINCIPAL: PUBLICACIONES + RESEÑAS */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          {/* PUBLICACIONES (ocupa 2/3) */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-lg md:text-xl font-bold text-gray-900 flex items-center gap-2">
                <Package size={18} className="text-gray-500" />
                Publicaciones
                <span className="text-xs font-normal text-gray-400">
                  ({data.publicaciones.items.length})
                </span>
              </h2>
              <button
                type="button"
                className="text-xs text-emerald-600 hover:underline"
                onClick={() =>
                  navigate(`/market?usuario_id=${usuarioId ?? ""}`)
                }
              >
                Ver más en el marketplace
              </button>
            </div>

            {data.publicaciones.items.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                <Package size={32} className="text-gray-300 mb-2" />
                <p className="text-gray-500 text-sm">
                  Este usuario no tiene publicaciones disponibles.
                </p>
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2">
                {data.publicaciones.items.map((pub) => (
                  <article
                    key={pub.id}
                    className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow overflow-hidden flex flex-col"
                  >
                    <div className="relative aspect-[4/3] bg-gray-100">
                      {pub.foto_principal ? (
                        <img
                          src={pub.foto_principal}
                          alt={pub.titulo}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-300">
                          <Package size={32} />
                        </div>
                      )}
                      <div className="absolute top-3 left-3 px-2 py-1 rounded-full text-[11px] font-semibold bg-white/90 text-gray-700 shadow-sm">
                        {pub.categoria}
                      </div>
                    </div>

                    <div className="p-4 flex flex-col gap-2 flex-1">
                      <h3 className="font-semibold text-gray-900 line-clamp-2">
                        {pub.titulo}
                      </h3>
                      <p className="text-xs text-gray-500 line-clamp-2">
                        {pub.descripcion}
                      </p>
                      <div className="mt-auto flex items-center justify-between pt-2">
                        <span className="text-sm font-bold text-emerald-600">
                          {pub.valor_creditos}{" "}
                          <span className="text-xs font-medium text-gray-500">
                            créditos
                          </span>
                        </span>
                        <button
                          onClick={() => navigate(`/market/${pub.id}`)}
                          className="text-xs font-semibold text-gray-600 hover:text-emerald-600"
                        >
                          Ver detalle
                        </button>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </div>

          {/* RESEÑAS (1/3) */}
          <div className="space-y-4">
            <h2 className="text-lg md:text-xl font-bold text-gray-900 flex items-center gap-2">
              <MessageCircle size={18} className="text-gray-500" />
              Reseñas
              <span className="text-xs font-normal text-gray-400">
                ({data.reviews.items.length})
              </span>
            </h2>

            {/* Formulario reseña */}
            {!isOwner && (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 space-y-3">
                {currentUserId ? (
                  <form
                    onSubmit={handleSubmitReview}
                    className="space-y-3 text-sm"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <label className="text-gray-700 font-medium">
                        Tu calificación
                      </label>
                      <select
                        value={reviewCalif}
                        onChange={(e) =>
                          setReviewCalif(Number(e.target.value))
                        }
                        disabled={savingReview}
                        className="border border-gray-200 rounded-lg px-2 py-1 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-emerald-100 focus:border-emerald-500"
                      >
                        {[1, 2, 3, 4, 5].map((n) => (
                          <option key={n} value={n}>
                            {n} ⭐
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-gray-700 font-medium mb-1">
                        Comentario (opcional)
                      </label>
                      <textarea
                        rows={3}
                        value={reviewComent}
                        onChange={(e) => setReviewComent(e.target.value)}
                        disabled={savingReview}
                        className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm resize-none focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-100 focus:border-emerald-500"
                        placeholder="¿Cómo fue tu experiencia con este usuario?"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={savingReview}
                      className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-gray-900 hover:bg-emerald-600 text-white text-sm font-semibold shadow disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
                    >
                      {savingReview ? (
                        <>
                          <Loader2 size={16} className="animate-spin" />
                          Guardando...
                        </>
                      ) : (
                        "Guardar reseña"
                      )}
                    </button>
                  </form>
                ) : (
                  <p className="text-xs text-gray-500">
                    <span className="font-medium">Inicia sesión</span> para
                    dejar una reseña sobre este usuario.
                  </p>
                )}
              </div>
            )}

            {/* Lista reseñas */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 space-y-3 max-h-[460px] overflow-y-auto">
              {data.reviews.items.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-6 text-sm text-gray-500">
                  <MessageCircle size={24} className="text-gray-300 mb-2" />
                  Este usuario aún no tiene reseñas.
                </div>
              ) : (
                data.reviews.items.map((r) => (
                  <article
                    key={r.id}
                    className="border-b border-gray-100 pb-3 mb-3 last:border-none last:pb-0 last:mb-0"
                  >
                    <div className="flex items-start gap-3">
                      <img
                        src={r.autor_foto ?? "/avatar-placeholder.png"}
                        alt={r.autor_nombre}
                        className="w-9 h-9 rounded-full object-cover bg-gray-100"
                      />
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <div>
                            <strong className="text-sm text-gray-900">
                              {r.autor_nombre}
                            </strong>
                            <div className="flex items-center gap-1 text-xs text-amber-500">
                              <Star
                                size={12}
                                className="fill-amber-400 text-amber-400"
                              />
                              <span>{r.calificacion}</span>
                            </div>
                          </div>
                          <small className="text-[10px] text-gray-400">
                            {new Date(r.created_at).toLocaleDateString()}
                          </small>
                        </div>
                        {r.comentario && (
                          <p className="mt-1 text-xs text-gray-600 leading-relaxed">
                            {r.comentario}
                          </p>
                        )}
                      </div>
                    </div>
                  </article>
                ))
              )}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

// Skeleton de carga similar al del market
function ProfileSkeleton() {
  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6 animate-pulse">
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 flex gap-6">
        <div className="w-24 h-24 rounded-full bg-gray-200" />
        <div className="flex-1 space-y-3">
          <div className="h-6 bg-gray-200 rounded w-1/2" />
          <div className="h-4 bg-gray-200 rounded w-3/4" />
          <div className="h-4 bg-gray-200 rounded w-2/3" />
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <div className="h-5 bg-gray-200 rounded w-1/3" />
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="h-56 bg-gray-200 rounded-2xl" />
            <div className="h-56 bg-gray-200 rounded-2xl" />
          </div>
        </div>
        <div className="space-y-4">
          <div className="h-5 bg-gray-200 rounded w-1/2" />
          <div className="h-40 bg-gray-200 rounded-2xl" />
          <div className="h-40 bg-gray-200 rounded-2xl" />
        </div>
      </div>
    </div>
  );
}
