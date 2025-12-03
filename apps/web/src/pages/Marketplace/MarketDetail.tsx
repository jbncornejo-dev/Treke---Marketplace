// apps/web/src/pages/market/MarketDetailPage.tsx
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom"; // Usamos useParams
import {
  ArrowLeft,
  Heart,
  Share2,
  MapPin,
  ShieldCheck,
  Star,
  Sparkles,
  Package,
  Clock,
  Send,
  Loader2,
  AlertCircle,
} from "lucide-react";

import {
  detail,
  toggleFav,
  type MarketDetail,
  getCurrentUserId,
} from "../../api/market";
import { iniciarPropuesta } from "../../api/intercambios";

const uid = getCurrentUserId();

export default function MarketDetailPage() {
  const navigate = useNavigate();
  const params = useParams();

  // ID desde la ruta /market/:id, con fallback al path
  const idFromUrl = Number(window.location.pathname.split("/").pop());
  const id = params.id ? Number(params.id) : idFromUrl;

  const [data, setData] = useState<MarketDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState("");
  const [mainImage, setMainImage] = useState<string>("");

  // Estados Modal
  const [showProposalModal, setShowProposalModal] = useState(false);
  const [offerMessage, setOfferMessage] = useState<string>("");
  const [loadingProp, setLoadingProp] = useState(false);

  // --- CARGA DE DATOS ---
  async function load() {
    setLoading(true);
    setMsg("");
    try {
      const d = await detail(id);
      setData(d);
      // Poner la foto principal por defecto
      const principal = d.fotos.find((f) => f.es_principal) || d.fotos[0];
      if (principal) setMainImage(principal.foto_url);
    } catch (e: any) {
      setMsg(e?.message || "No se pudo cargar el producto.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // --- ACCIONES ---
  async function onToggleFav() {
    if (!data) return;
    const newState = !data.is_fav;

    // Optimistic UI update
    setData({ ...data, is_fav: newState });

    try {
      await toggleFav(data.id, newState);
    } catch (e: any) {
      setData({ ...data, is_fav: !newState }); // Revertir si falla
      alert("Error al actualizar favorito");
    }
  }

  function abrirModalPropuesta() {
    if (!data) return;
    if (!uid) return alert("Inicia sesión para continuar");
    if (uid === data.usuario_id)
      return alert("No puedes ofertar en tu propia publicación");
    setOfferMessage("");
    setShowProposalModal(true);
  }

  async function enviarPropuesta() {
    if (!data) return;
    setLoadingProp(true);
    try {
      await iniciarPropuesta(data.id, offerMessage || undefined);
      setShowProposalModal(false);
      alert("¡Propuesta enviada correctamente! Revisa tus intercambios.");
      load();
    } catch (e: any) {
      alert(e?.message || "Error al enviar propuesta");
    } finally {
      setLoadingProp(false);
    }
  }

  // --- RENDERIZADO ---

  // Loading State
  if (loading) return <DetailSkeleton />;

  // Error State
  if (!data) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 text-gray-500 gap-4">
        <AlertCircle size={48} className="text-gray-300" />
        <p>{msg || "Producto no encontrado"}</p>
        <button
          onClick={() => navigate(-1)}
          className="text-emerald-600 font-medium hover:underline"
        >
          Volver atrás
        </button>
      </div>
    );
  }

  const vendedorRatingNumber = Number(data.vendedor_rating || 0);

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-900 pb-20 selection:bg-emerald-100">
      {/* --- HEADER STICKY --- */}
      <div className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-gray-100 px-4 py-3 shadow-sm transition-all">
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

          <span className="font-semibold text-gray-900 truncate max-w-[200px] md:max-w-md opacity-0 md:opacity-100 transition-opacity">
            {data.titulo}
          </span>

          <button
            className="p-2 rounded-full hover:bg-gray-100 text-gray-600 transition-colors"
            title="Compartir"
          >
            <Share2 size={20} />
          </button>
        </div>
      </div>

      <main className="max-w-6xl mx-auto p-4 md:p-6 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
        {/* --- COLUMNA IZQUIERDA: GALERÍA --- */}
        <div className="lg:col-span-7 space-y-4">
          {/* Imagen Principal */}
          <div className="relative aspect-4/3 w-full bg-white rounded-3xl overflow-hidden shadow-sm border border-gray-100 group">
            {mainImage ? (
              <img
                src={mainImage}
                alt={data.titulo}
                className="w-full h-full object-cover transition-transform duration-500"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-300 bg-gray-100">
                <Package size={48} strokeWidth={1.5} />
              </div>
            )}

            {/* Botón Favorito Flotante */}
            <button
              onClick={onToggleFav}
              className="absolute top-4 right-4 p-3 rounded-full bg-white/90 backdrop-blur shadow-sm hover:scale-110 transition-all z-10"
            >
              <Heart
                size={24}
                className={
                  data.is_fav
                    ? "fill-red-500 text-red-500"
                    : "text-gray-400 hover:text-gray-600"
                }
              />
            </button>
          </div>

          {/* Miniaturas */}
          {data.fotos.length > 1 && (
            <div className="flex gap-3 overflow-x-auto pb-2 no-scrollbar px-1">
              {data.fotos.map((f) => (
                <button
                  key={f.id}
                  onClick={() => setMainImage(f.foto_url)}
                  className={`relative shrink-0 w-20 h-20 rounded-xl overflow-hidden transition-all ${
                    mainImage === f.foto_url
                      ? "ring-2 ring-emerald-500 ring-offset-2 opacity-100"
                      : "opacity-70 hover:opacity-100 border border-transparent hover:border-gray-300"
                  }`}
                >
                  <img
                    src={f.foto_url}
                    className="w-full h-full object-cover"
                    alt="thumbnail"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* --- COLUMNA DERECHA: INFO Y ACCIÓN --- */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          {/* Header Producto */}
          <div>
            <div className="flex flex-wrap gap-2 mb-3">
              <Badge color="emerald">{data.categoria}</Badge>
              <Badge color="gray">{data.estado_nombre}</Badge>
              {data.peso_aprox_kg > 0 && (
                <Badge color="gray">{data.peso_aprox_kg} kg</Badge>
              )}
            </div>

            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 leading-tight mb-2">
              {data.titulo}
            </h1>

            <div className="flex items-center gap-2 text-gray-500 text-sm mb-6">
              <MapPin size={16} />
              {data.ubicacion_texto || "Ubicación no especificada"}
            </div>

            {/* Precio Destacado */}
            <div className="flex items-center gap-3 bg-amber-50 border border-amber-100 p-4 rounded-2xl">
              <div className="p-2 bg-amber-100 rounded-full text-amber-600">
                <Sparkles size={24} />
              </div>
              <div>
                <p className="text-xs font-bold text-amber-600 uppercase tracking-wider">
                  Valor
                </p>
                <p className="text-3xl font-extrabold text-gray-900 leading-none">
                  {data.valor_creditos}{" "}
                  <span className="text-lg font-medium text-gray-500">
                    Créditos
                  </span>
                </p>
              </div>
            </div>
          </div>

          {/* Tarjeta Vendedor */}
          <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="w-14 h-14 rounded-full bg-emerald-100 flex items-center justify-center text-xl font-bold text-emerald-700">
                  {data.vendedor_nombre?.charAt(0) || "U"}
                </div>
                <div className="absolute -bottom-1 -right-1 bg-white p-0.5 rounded-full">
                  <ShieldCheck
                    size={16}
                    className="text-emerald-500 fill-emerald-100"
                  />
                </div>
              </div>
              <div>
                <p className="text-sm text-gray-500">Publicado por</p>
                <button
                  type="button"
                  onClick={() => navigate(`/perfil/${data.usuario_id}`)}
                  className="font-bold text-gray-900 text-lg leading-tight hover:underline text-left"
                >
                  {data.vendedor_nombre || "Usuario"}
                </button>
                <div className="flex items-center gap-1 text-sm mt-0.5">
                  <Star
                    size={14}
                    className="text-amber-400 fill-amber-400"
                  />
                  <span className="font-semibold">
                    {vendedorRatingNumber.toFixed(1)}
                  </span>
                  <span className="text-gray-400 text-xs">(Rating)</span>
                </div>
              </div>
            </div>
            <button
              className="px-4 py-2 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
              onClick={() => navigate(`/perfil/${data.usuario_id}`)}
            >
              Ver Perfil
            </button>
          </div>

          {/* Descripción */}
          <div className="prose prose-sm text-gray-600">
            <h3 className="text-gray-900 font-semibold text-lg mb-2">
              Descripción
            </h3>
            <p className="whitespace-pre-line leading-relaxed">
              {data.descripcion}
            </p>
          </div>

          {/* Botón CTA Fijo en Móvil (Bottom Bar) o Normal en Desktop */}
          <div className="fixed bottom-0 left-0 w-full p-4 bg-white border-t border-gray-100 lg:static lg:border-none lg:bg-transparent lg:p-0 z-20">
            <button
              onClick={abrirModalPropuesta}
              className="w-full py-4 rounded-xl bg-gray-900 hover:bg-emerald-600 text-white font-bold text-lg shadow-xl shadow-gray-200 lg:shadow-emerald-500/20 transition-all flex items-center justify-center gap-2 group"
            >
              <span>Ofertar {data.valor_creditos} Créditos</span>
              <Send
                size={20}
                className="group-hover:translate-x-1 transition-transform"
              />
            </button>
            <p className="text-center text-xs text-gray-400 mt-2 lg:hidden">
              {data.total_propuestas} personas interesadas
            </p>
          </div>
        </div>

        {/* --- SECCIÓN INFERIOR: RESEÑAS --- */}
        <div className="col-span-1 lg:col-span-12 pt-8 border-t border-gray-200">
          <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            Reseñas del Vendedor{" "}
            <span className="text-gray-400 text-sm font-normal">
              ({data.reviews?.length || 0})
            </span>
          </h3>

          {data.reviews && data.reviews.length > 0 ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {data.reviews.map((rev) => (
                <div
                  key={rev.id}
                  className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-600">
                        {rev.autor_nombre?.charAt(0) || "U"}
                      </div>
                      <span className="text-sm font-semibold text-gray-900">
                        {rev.autor_nombre}
                      </span>
                    </div>
                    <div className="flex text-amber-400">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          size={12}
                          className={
                            i < rev.calificacion
                              ? "fill-current"
                              : "text-gray-200"
                          }
                        />
                      ))}
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 leading-relaxed italic">
                    "
                    {rev.comentario && rev.comentario.trim().length > 0
                      ? rev.comentario
                      : "Sin comentario"}
                    "
                  </p>
                  <div className="mt-3 flex items-center gap-1 text-xs text-gray-400">
                    <Clock size={12} />
                    {new Date(rev.created_at).toLocaleDateString()}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
              <p className="text-gray-400 font-medium">
                Este usuario aún no tiene reseñas.
              </p>
            </div>
          )}
        </div>
      </main>

      {/* --- MODAL DE PROPUESTA (Backdrop Blur) --- */}
      {showProposalModal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 sm:p-6">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm transition-opacity"
            onClick={() => setShowProposalModal(false)}
          />

          {/* Modal Content */}
          <div className="relative w-full max-w-md bg-white rounded-t-3xl sm:rounded-3xl p-6 sm:p-8 shadow-2xl animate-in slide-in-from-bottom-10 sm:zoom-in-95 duration-300">
            {/* Header Modal */}
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4 text-emerald-600">
                <Sparkles size={32} />
              </div>
              <h3 className="text-2xl font-bold text-gray-900">
                Confirmar Oferta
              </h3>
              <p className="text-gray-500 text-sm mt-1">
                Estás a un paso de iniciar el trueque.
              </p>
            </div>

            <div className="space-y-4">
              {/* Resumen del Costo */}
              <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-gray-400 uppercase">
                    Vas a ofrecer
                  </p>
                  <p className="text-sm font-medium text-gray-700">
                    {data.titulo}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-emerald-600">
                    {data.valor_creditos}
                  </p>
                  <p className="text-[10px] text-emerald-600/70 font-bold uppercase">
                    Créditos
                  </p>
                </div>
              </div>

              {/* Mensaje */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Mensaje para {data.vendedor_nombre} (Opcional)
                </label>
                <textarea
                  rows={3}
                  className="w-full p-4 rounded-xl bg-gray-50 border border-gray-200 focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 outline-none resize-none transition-all text-sm"
                  placeholder="¡Hola! Me interesa mucho, ¿está disponible para hoy?"
                  value={offerMessage}
                  onChange={(e) => setOfferMessage(e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 mt-8">
              <button
                onClick={() => setShowProposalModal(false)}
                className="py-3.5 rounded-xl border border-gray-200 font-semibold text-gray-600 hover:bg-gray-50 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={enviarPropuesta}
                disabled={loadingProp}
                className="py-3.5 rounded-xl bg-gray-900 hover:bg-emerald-600 text-white font-bold shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-all"
              >
                {loadingProp ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    Procesando...
                  </>
                ) : (
                  "Confirmar Oferta"
                )}
              </button>
            </div>

            <p className="text-center text-xs text-gray-400 mt-4">
              Al confirmar, se notificará al vendedor inmediatamente.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

// --- SUBCOMPONENTES ---

function Badge({
  children,
  color = "gray",
}: {
  children: React.ReactNode;
  color?: "gray" | "emerald";
}) {
  const styles: Record<string, string> = {
    gray: "bg-gray-100 text-gray-600 border-gray-200",
    emerald: "bg-emerald-50 text-emerald-700 border-emerald-100",
  };

  return (
    <span
      className={`px-3 py-1 rounded-full text-xs font-bold border ${
        styles[color]
      }`}
    >
      {children}
    </span>
  );
}

// Skeleton para carga
function DetailSkeleton() {
  return (
    <div className="max-w-6xl mx-auto p-6 grid grid-cols-1 lg:grid-cols-12 gap-8 animate-pulse">
      <div className="lg:col-span-7 space-y-4">
        <div className="aspect-4/3 bg-gray-200 rounded-3xl" />
        <div className="flex gap-3">
          <div className="w-20 h-20 bg-gray-200 rounded-xl" />
          <div className="w-20 h-20 bg-gray-200 rounded-xl" />
        </div>
      </div>
      <div className="lg:col-span-5 space-y-6">
        <div className="h-8 bg-gray-200 rounded w-3/4" />
        <div className="h-6 bg-gray-200 rounded w-1/4" />
        <div className="h-24 bg-gray-200 rounded-2xl" />
        <div className="h-20 bg-gray-200 rounded-2xl" />
        <div className="h-14 bg-gray-200 rounded-xl mt-auto" />
      </div>
    </div>
  );
}
