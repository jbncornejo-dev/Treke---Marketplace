// apps/web/src/pages/admin/AdminAdsPage.tsx
import { useEffect, useState } from "react";
import { Plus, Loader2, Link as LinkIcon, Image as ImageIcon } from "lucide-react";
import {
  adminListAnuncios,
  adminCrearAnuncio,
  type Anuncio,
  type UbicacionAnuncio,
} from "../../api/anuncios";

const UBICACIONES: { value: UbicacionAnuncio; label: string }[] = [
  { value: "market",        label: "Marketplace" },
  { value: "perfil",        label: "Perfil de usuario" },
  { value: "creditos",      label: "Página de créditos" },
  { value: "intercambios",  label: "Intercambios" },
  { value: "global",        label: "Global (todos los footers)" },
];

export default function AdminAdsPage() {
  const [rows, setRows] = useState<Anuncio[]>([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState<string | null>(null);
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

  async function load() {
    setLoading(true);
    setMsg(null);
    try {
      const data = await adminListAnuncios();
      setRows(data);
    } catch (e: any) {
      setMsg(e?.message || "Error cargando anuncios");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setMsg(null);
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
      setMsg("Anuncio creado correctamente ✅");
      setForm({ ...form, titulo: "", contenido: "", imagen_url: "", enlace_destino: "", presupuesto: "" });
    } catch (e: any) {
      setMsg(e?.message || "Error al crear el anuncio");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-dvh bg-neutral-950 text-neutral-50">
      <div className="mx-auto max-w-6xl px-4 py-6 space-y-6">
        <header className="flex items-center justify-between gap-3">
          <div>
            <h1 className="text-xl font-semibold">Gestión de anuncios</h1>
            <p className="text-sm text-neutral-400">
              Crea banners que aparecerán en los footers de Marketplace, Perfil,
              Créditos e Intercambios.
            </p>
          </div>
        </header>

        {/* Mensajes */}
        {msg && (
          <div className="rounded-lg border border-neutral-800 bg-neutral-900 px-3 py-2 text-sm">
            {msg}
          </div>
        )}

        {/* Formulario */}
        <section className="rounded-2xl border border-neutral-800 bg-neutral-900/60 p-4 space-y-4">
          <h2 className="text-sm font-semibold text-neutral-200 flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Nuevo anuncio
          </h2>

          <form
            onSubmit={handleSubmit}
            className="grid grid-cols-1 md:grid-cols-2 gap-4"
          >
            <div className="space-y-2">
              <label className="text-xs font-medium text-neutral-400">
                Título
              </label>
              <input
                className="w-full rounded-lg border border-neutral-700 bg-neutral-950 px-3 py-2 text-sm outline-none focus:border-emerald-500"
                value={form.titulo}
                onChange={(e) => setForm({ ...form, titulo: e.target.value })}
                required
              />

              <label className="text-xs font-medium text-neutral-400 mt-2 block">
                Texto corto / contenido
              </label>
              <textarea
                rows={3}
                className="w-full rounded-lg border border-neutral-700 bg-neutral-950 px-3 py-2 text-sm outline-none focus:border-emerald-500"
                value={form.contenido}
                onChange={(e) =>
                  setForm({ ...form, contenido: e.target.value })
                }
                required
              />

              <label className="text-xs font-medium text-neutral-400 mt-2 block">
                Ubicación
              </label>
              <select
                className="w-full rounded-lg border border-neutral-700 bg-neutral-950 px-3 py-2 text-sm outline-none focus:border-emerald-500"
                value={form.ubicacion}
                onChange={(e) =>
                  setForm({
                    ...form,
                    ubicacion: e.target.value as UbicacionAnuncio,
                  })
                }
              >
                {UBICACIONES.map((u) => (
                  <option key={u.value} value={u.value}>
                    {u.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-medium text-neutral-400 flex items-center gap-1">
                <ImageIcon className="h-3 w-3" />
                URL de la imagen
              </label>
              <input
                className="w-full rounded-lg border border-neutral-700 bg-neutral-950 px-3 py-2 text-sm outline-none focus:border-emerald-500"
                value={form.imagen_url}
                onChange={(e) =>
                  setForm({ ...form, imagen_url: e.target.value })
                }
                placeholder="https://..."
                required
              />

              <label className="text-xs font-medium text-neutral-400 mt-2 flex items-center gap-1">
                <LinkIcon className="h-3 w-3" />
                URL de destino (opcional)
              </label>
              <input
                className="w-full rounded-lg border border-neutral-700 bg-neutral-950 px-3 py-2 text-sm outline-none focus:border-emerald-500"
                value={form.enlace_destino}
                onChange={(e) =>
                  setForm({ ...form, enlace_destino: e.target.value })
                }
                placeholder="https://tu-sitio.com"
              />

              <div className="mt-2 grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="text-xs font-medium text-neutral-400">
                    Inicio
                  </label>
                  <input
                    type="date"
                    className="w-full rounded-lg border border-neutral-700 bg-neutral-950 px-3 py-2 text-xs outline-none focus:border-emerald-500"
                    value={form.fecha_ini}
                    onChange={(e) =>
                      setForm({ ...form, fecha_ini: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium text-neutral-400">
                    Fin
                  </label>
                  <input
                    type="date"
                    className="w-full rounded-lg border border-neutral-700 bg-neutral-950 px-3 py-2 text-xs outline-none focus:border-emerald-500"
                    value={form.fecha_fin}
                    onChange={(e) =>
                      setForm({ ...form, fecha_fin: e.target.value })
                    }
                  />
                </div>
              </div>

              <div className="mt-2 flex items-center gap-2">
                <input
                  id="activo"
                  type="checkbox"
                  checked={form.esta_activo}
                  onChange={(e) =>
                    setForm({ ...form, esta_activo: e.target.checked })
                  }
                />
                <label
                  htmlFor="activo"
                  className="text-xs text-neutral-300 select-none"
                >
                  Anuncio activo
                </label>
              </div>

              <label className="text-xs font-medium text-neutral-400 mt-2 block">
                Presupuesto (Bs)
              </label>
              <input
                type="number"
                min={0}
                step="0.01"
                required     
                className="w-full rounded-lg border border-neutral-700 bg-neutral-950 px-3 py-2 text-sm outline-none focus:border-emerald-500"
                value={form.presupuesto}
                onChange={(e) =>
                  setForm({ ...form, presupuesto: e.target.value })
                }
                placeholder="Ej: 150.00"
              />

              <button
                type="submit"
                disabled={submitting}
                className="mt-4 inline-flex items-center justify-center gap-2 rounded-lg bg-emerald-500 px-4 py-2 text-sm font-semibold text-neutral-950 hover:bg-emerald-400 disabled:opacity-60"
              >
                {submitting && (
                  <Loader2 className="h-4 w-4 animate-spin" />
                )}
                Crear anuncio
              </button>
            </div>
          </form>
        </section>

        {/* Tabla de anuncios */}
        <section className="rounded-2xl border border-neutral-800 bg-neutral-900/60 p-4">
          <h2 className="text-sm font-semibold text-neutral-200 mb-3">
            Anuncios existentes
          </h2>

          {loading ? (
            <div className="py-6 text-sm text-neutral-400 flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              Cargando anuncios...
            </div>
          ) : rows.length === 0 ? (
            <div className="py-6 text-sm text-neutral-400">
              No hay anuncios creados todavía.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-xs">
                <thead className="border-b border-neutral-800 text-neutral-400">
                  <tr>
                    <th className="py-2 pr-3 text-left">Título</th>
                    <th className="py-2 px-3 text-left">Ubicación</th>
                    <th className="py-2 px-3 text-left">Rango</th>
                    <th className="py-2 px-3 text-right">Clicks</th>
                    <th className="py-2 px-3 text-right">Presupuesto</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((ad) => (
                    <tr
                      key={ad.id}
                      className="border-b border-neutral-900 last:border-0"
                    >
                      <td className="py-2 pr-3 align-middle">
                        <div className="flex items-center gap-2">
                          <img
                            src={ad.imagen_url}
                            alt={ad.titulo}
                            className="h-8 w-8 rounded-md object-cover border border-neutral-800"
                          />
                          <div>
                            <div className="font-medium text-neutral-100">
                              {ad.titulo}
                            </div>
                            <div className="text-[11px] text-neutral-400 line-clamp-1">
                              {ad.contenido}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="py-2 px-3 align-middle text-[11px] text-neutral-300">
                        {ad.ubicacion}
                      </td>
                      <td className="py-2 px-3 align-middle text-[11px] text-neutral-300">
                        {ad.fecha_ini?.slice(0, 10)} –{" "}
                        {ad.fecha_fin?.slice(0, 10)}
                      </td>
                      <td className="py-2 px-3 align-middle text-right text-[11px] text-neutral-300">
                        {ad.clicks}
                      </td>
                      <td className="py-2 px-3 align-middle text-right text-[11px] text-neutral-300">
                        {ad.presupuesto != null ? `Bs ${ad.presupuesto}` : "–"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
