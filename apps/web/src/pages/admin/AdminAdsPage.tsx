// apps/web/src/pages/admin/AdminAdsPage.tsx
import { useEffect, useState } from "react";
import {
  Plus,
  Loader2,
  Link as LinkIcon,
  Image as ImageIcon,
  CalendarDays,
  CheckCircle2,
  X,
} from "lucide-react";
import {
  adminListAnuncios,
  adminCrearAnuncio,
  type Anuncio,
  type UbicacionAnuncio,
} from "../../api/anuncios";

const UBICACIONES: { value: UbicacionAnuncio; label: string }[] = [
  { value: "market",       label: "Marketplace" },
  { value: "perfil",       label: "Perfil de usuario" },
  { value: "creditos",     label: "Página de créditos" },
  { value: "intercambios", label: "Intercambios" },
  { value: "global",       label: "Global (todos los footers)" },
];

type MsgType = "success" | "error" | "info" | null;

export default function AdminAdsPage() {
  const [rows, setRows] = useState<Anuncio[]>([]);
  const [loading, setLoading] = useState(true);

  const [msg, setMsg] = useState<string | null>(null);
  const [msgType, setMsgType] = useState<MsgType>(null);

  const [submitting, setSubmitting] = useState(false);

  const today = new Date().toISOString().slice(0, 10);
  const [form, setForm] = useState({
    titulo: "",
    contenido: "",
    imagen_url: "",
    enlace_destino: "",
    ubicacion: "market" as UbicacionAnuncio,
    fecha_ini: today,
    fecha_fin: today,
    esta_activo: true,
    presupuesto: "",
  });

  // --------- LOAD ----------
  async function load() {
    setLoading(true);
    setMsg(null);
    setMsgType(null);
    try {
      const data = await adminListAnuncios();
      setRows(data);
    } catch (e: any) {
      setMsg(e?.message || "Error cargando anuncios");
      setMsgType("error");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  // --------- SUBMIT ----------
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setMsg(null);
    setMsgType(null);

    try {
      const payload = {
        titulo: form.titulo.trim(),
        contenido: form.contenido.trim(),
        imagen_url: form.imagen_url.trim(),
        enlace_destino: form.enlace_destino.trim() || undefined,
        ubicacion: form.ubicacion,
        fecha_ini: form.fecha_ini,
        fecha_fin: form.fecha_fin,
        esta_activo: form.esta_activo,
        presupuesto: form.presupuesto
          ? Number(form.presupuesto)
          : undefined,
      };

      const nuevo = await adminCrearAnuncio(payload);
      setRows((prev) => [nuevo, ...prev]);

      setMsg("Anuncio creado correctamente");
      setMsgType("success");

      setForm((prev) => ({
        ...prev,
        titulo: "",
        contenido: "",
        imagen_url: "",
        enlace_destino: "",
        presupuesto: "",
      }));
    } catch (e: any) {
      setMsg(e?.message || "Error al crear el anuncio");
      setMsgType("error");
    } finally {
      setSubmitting(false);
    }
  }

  // --------- UI ----------
  let msgClasses =
    "p-4 rounded-xl text-sm font-medium flex items-center gap-2 border";
  if (msgType === "error") {
    msgClasses +=
      " bg-red-50 border-red-200 text-red-600";
  } else if (msgType === "success") {
    msgClasses +=
      " bg-emerald-50 border-emerald-200 text-emerald-700";
  } else {
    msgClasses +=
      " bg-gray-50 border-gray-200 text-gray-700";
  }

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-900 pb-24 selection:bg-emerald-100">
      {/* HEADER superior (no sticky para admin, pero mismo look) */}
      <div className="border-b border-gray-100 bg-white/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
          <div>
            <h1 className="text-lg font-semibold text-gray-900">
              Gestión de anuncios
            </h1>
            <p className="text-xs text-gray-500">
              Administra los banners que aparecerán en los footers del sistema.
            </p>
          </div>
          <span className="rounded-full bg-gray-900 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-white">
            Admin · Ads
          </span>
        </div>
      </div>

      <main className="mx-auto max-w-5xl p-4 md:p-6 space-y-6">
        {/* MENSAJES */}
        {msg && (
          <div className={msgClasses}>
            {msgType === "error" && <X size={16} />}
            {msgType === "success" && <CheckCircle2 size={16} />}
            {msg}
          </div>
        )}

        {/* TARJETA: FORMULARIO */}
        <div className="space-y-5 rounded-3xl border border-gray-100 bg-white p-5 shadow-sm md:p-7">
          {/* Título sección */}
          <div className="mb-2 flex items-center justify-between gap-3">
            <div>
              <h2 className="flex items-center gap-2 text-base font-bold text-gray-900">
                <Plus className="text-emerald-500" size={18} />
                Nuevo anuncio
              </h2>
              <p className="text-xs text-gray-400">
                Completa los campos para crear un banner promocional.
              </p>
            </div>
            <span className="rounded-full bg-gray-100 px-2 py-1 text-[11px] font-medium text-gray-500">
              {form.esta_activo ? "Activo" : "Inactivo"}
            </span>
          </div>

          <form
            onSubmit={handleSubmit}
            className="grid grid-cols-1 gap-6 md:grid-cols-[1.2fr,1fr]"
          >
            {/* Columna izquierda – contenido */}
            <div className="space-y-4">
              {/* Título */}
              <div className="space-y-1.5">
                <label className="ml-1 text-sm font-semibold text-gray-700">
                  Título <span className="text-red-400">*</span>
                </label>
                <input
                  className="w-full rounded-xl border-none bg-gray-50 p-3.5 text-sm font-medium text-gray-900 outline-none transition-all placeholder:text-gray-400 focus:bg-white focus:ring-2 focus:ring-emerald-100"
                  placeholder="Ej. Gana créditos extra este mes"
                  value={form.titulo}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, titulo: e.target.value }))
                  }
                  required
                />
              </div>

              {/* Contenido */}
              <div className="space-y-1.5">
                <label className="ml-1 text-sm font-semibold text-gray-700">
                  Texto corto / contenido{" "}
                  <span className="text-red-400">*</span>
                </label>
                <textarea
                  rows={4}
                  className="w-full resize-none rounded-xl border-none bg-gray-50 p-3.5 text-sm text-gray-800 outline-none transition-all placeholder:text-gray-400 focus:bg-white focus:ring-2 focus:ring-emerald-100"
                  placeholder="Mensaje que acompañará al banner…"
                  value={form.contenido}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, contenido: e.target.value }))
                  }
                  required
                />
              </div>

              {/* Ubicación */}
              <div className="space-y-1.5">
                <label className="ml-1 text-sm font-semibold text-gray-700">
                  Ubicación
                </label>
                <div className="relative group">
                  <select
                    className="w-full appearance-none rounded-xl border-none bg-gray-50 py-3.5 pl-3.5 pr-9 text-sm font-medium text-gray-700 outline-none transition-all focus:bg-white focus:ring-2 focus:ring-emerald-100"
                    value={form.ubicacion}
                    onChange={(e) =>
                      setForm((p) => ({
                        ...p,
                        ubicacion: e.target.value as UbicacionAnuncio,
                      }))
                    }
                  >
                    {UBICACIONES.map((u) => (
                      <option key={u.value} value={u.value}>
                        {u.label}
                      </option>
                    ))}
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-400">
                    <svg
                      className="h-4 w-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </div>
                </div>
                <p className="text-[11px] text-gray-400">
                  Define dónde se mostrará este anuncio dentro de la plataforma.
                </p>
              </div>
            </div>

            {/* Columna derecha – imagen, fechas, presupuesto */}
            <div className="space-y-4">
              {/* URL imagen + preview */}
              <div className="space-y-1.5">
                <label className="ml-1 flex items-center gap-1 text-sm font-semibold text-gray-700">
                  <ImageIcon size={16} className="text-emerald-500" />
                  URL de la imagen <span className="text-red-400">*</span>
                </label>
                <input
                  className="w-full rounded-xl border-none bg-gray-50 p-3.5 text-sm text-gray-800 outline-none transition-all placeholder:text-gray-400 focus:bg-white focus:ring-2 focus:ring-emerald-100"
                  value={form.imagen_url}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, imagen_url: e.target.value }))
                  }
                  placeholder="https://tu-cdn.com/banner.png"
                  required
                />

                {form.imagen_url && (
                  <div className="mt-3 flex items-center gap-3 rounded-2xl border border-gray-100 bg-gray-50 p-2.5">
                    <img
                      src={form.imagen_url}
                      alt={form.titulo || "Preview"}
                      className="h-12 w-12 rounded-xl object-cover"
                    />
                    <div className="space-y-0.5">
                      <p className="text-xs font-semibold text-gray-800 line-clamp-1">
                        {form.titulo || "Vista previa del anuncio"}
                      </p>
                      <p className="text-[11px] text-gray-500 line-clamp-2">
                        {form.contenido ||
                          "Escribe el texto para ver cómo se verá el banner."}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* URL destino */}
              <div className="space-y-1.5">
                <label className="ml-1 flex items-center gap-1 text-sm font-semibold text-gray-700">
                  <LinkIcon size={16} className="text-emerald-500" />
                  URL de destino (opcional)
                </label>
                <input
                  className="w-full rounded-xl border-none bg-gray-50 p-3.5 text-sm text-gray-800 outline-none transition-all placeholder:text-gray-400 focus:bg-white focus:ring-2 focus:ring-emerald-100"
                  value={form.enlace_destino}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, enlace_destino: e.target.value }))
                  }
                  placeholder="https://tu-sitio.com/landing"
                />
              </div>

              {/* Fechas */}
              <div className="grid grid-cols-2 gap-4 pt-1">
                <div className="space-y-1.5">
                  <label className="ml-1 flex items-center gap-1 text-xs font-semibold text-gray-700">
                    <CalendarDays size={14} className="text-emerald-500" />
                    Inicio
                  </label>
                  <input
                    type="date"
                    className="w-full rounded-xl border-none bg-gray-50 p-2.5 text-xs text-gray-800 outline-none transition-all focus:bg-white focus:ring-2 focus:ring-emerald-100"
                    value={form.fecha_ini}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, fecha_ini: e.target.value }))
                    }
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="ml-1 flex items-center gap-1 text-xs font-semibold text-gray-700">
                    <CalendarDays size={14} className="text-emerald-500" />
                    Fin
                  </label>
                  <input
                    type="date"
                    className="w-full rounded-xl border-none bg-gray-50 p-2.5 text-xs text-gray-800 outline-none transition-all focus:bg-white focus:ring-2 focus:ring-emerald-100"
                    value={form.fecha_fin}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, fecha_fin: e.target.value }))
                    }
                  />
                </div>
              </div>

              {/* Activo + presupuesto + botón */}
              <div className="space-y-3 pt-1">
                <div className="flex items-center gap-2">
                  <input
                    id="activo"
                    type="checkbox"
                    className="h-4 w-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                    checked={form.esta_activo}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, esta_activo: e.target.checked }))
                    }
                  />
                  <label
                    htmlFor="activo"
                    className="text-xs text-gray-600 select-none"
                  >
                    Anuncio activo
                  </label>
                </div>

                <div className="space-y-1.5">
                  <label className="ml-1 text-sm font-semibold text-gray-700">
                    Presupuesto (Bs) <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="number"
                    min={0}
                    step="0.01"
                    required
                    className="w-full rounded-xl border-none bg-gray-50 p-3.5 text-sm text-gray-800 outline-none transition-all placeholder:text-gray-400 focus:bg-white focus:ring-2 focus:ring-emerald-100"
                    value={form.presupuesto}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, presupuesto: e.target.value }))
                    }
                    placeholder="Ej: 150.00"
                  />
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="mt-2 flex w-full items-center justify-center gap-2 rounded-2xl bg-gray-900 py-3 text-sm font-bold text-white shadow-xl transition-all hover:bg-emerald-600 hover:shadow-emerald-500/20 disabled:opacity-60 disabled:hover:bg-gray-900"
                >
                  {submitting ? (
                    <>
                      <Loader2 size={18} className="animate-spin" />
                      Creando anuncio...
                    </>
                  ) : (
                    "Crear anuncio"
                  )}
                </button>
              </div>
            </div>
          </form>
        </div>

        {/* TARJETA: TABLA */}
        <div className="rounded-3xl border border-gray-100 bg-white p-5 shadow-sm md:p-7">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-base font-bold text-gray-900">
              Anuncios existentes
            </h2>
            <span className="text-xs text-gray-400">
              Total:{" "}
              <span className="font-semibold text-gray-700">
                {rows.length}
              </span>
            </span>
          </div>

          {loading ? (
            <div className="flex items-center gap-2 py-6 text-sm text-gray-500">
              <Loader2 className="h-4 w-4 animate-spin" />
              Cargando anuncios...
            </div>
          ) : rows.length === 0 ? (
            <div className="py-6 text-sm text-gray-500">
              No hay anuncios creados todavía.
            </div>
          ) : (
            <div className="overflow-x-auto rounded-2xl border border-gray-100 bg-gray-50/60">
              <table className="min-w-full border-separate border-spacing-y-1 text-xs">
                <thead className="text-[11px] uppercase tracking-wide text-gray-400">
                  <tr>
                    <th className="px-3 py-2 text-left">Título</th>
                    <th className="px-3 py-2 text-left">Ubicación</th>
                    <th className="px-3 py-2 text-left">Rango</th>
                    <th className="px-3 py-2 text-right">Clicks</th>
                    <th className="px-3 py-2 text-right">Presupuesto</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((ad) => (
                    <tr
                      key={ad.id}
                      className="align-middle hover:bg-white"
                    >
                      <td className="px-3 py-2">
                        <div className="flex items-center gap-2.5">
                          <img
                            src={ad.imagen_url}
                            alt={ad.titulo}
                            className="h-8 w-8 rounded-lg border border-gray-200 object-cover"
                          />
                          <div>
                            <div className="text-xs font-semibold text-gray-900 line-clamp-1">
                              {ad.titulo}
                            </div>
                            <div className="text-[11px] text-gray-500 line-clamp-1">
                              {ad.contenido}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-3 py-2 text-[11px] text-gray-600">
                        {ad.ubicacion}
                      </td>
                      <td className="px-3 py-2 text-[11px] text-gray-600">
                        {ad.fecha_ini?.slice(0, 10)} –{" "}
                        {ad.fecha_fin?.slice(0, 10)}
                      </td>
                      <td className="px-3 py-2 text-right text-[11px] text-gray-700">
                        {ad.clicks}
                      </td>
                      <td className="px-3 py-2 text-right text-[11px] text-gray-700">
                        {ad.presupuesto != null
                          ? `Bs ${ad.presupuesto}`
                          : "–"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
