import { useEffect, useState } from "react";
import Header from "../../components/Header";
import {
  crearPublicacion,
  getCategorias,
  getFactoresEcologicos,
  type FactorEcologico,
   uploadMarketImages, 
} from "../../api/market";
import { useNavigate } from "react-router-dom";

type Categoria = { id: number; nombre: string };

export default function MarketCreate() {
  const navigate = useNavigate();

  const [titulo, setTitulo] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [valorCreditos, setValorCreditos] = useState<number>(0);
  const [ubicacion, setUbicacion] = useState("");
  const [pesoKg, setPesoKg] = useState<number>(0);
  const [categoriaId, setCategoriaId] = useState<number | null>(null);
  const [fotos, setFotos] = useState<string>(""); // por ahora coma-separado
  const [uploadedUrls, setUploadedUrls] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [factores, setFactores] = useState<FactorEcologico[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [seleccionFactores, setSeleccionFactores] = useState<number[]>([]);
  const [ninguna, setNinguna] = useState(false);

  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const [cats, facs] = await Promise.all([
          getCategorias(),
          getFactoresEcologicos(),
        ]);
        setCategorias(cats);
        setFactores(facs);
      } catch (e: any) {
        setMsg(e?.message || "No se pudieron cargar catálogos");
      }
    }
    load();
  }, []);

  function toggleFactor(id: number) {
    setSeleccionFactores((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
    setNinguna(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMsg("");
    if (!titulo || !descripcion || !ubicacion || !categoriaId) {
      setMsg("Completa título, descripción, ubicación y categoría");
      return;
    }
    try {
      setLoading(true);
      const fotosList = fotos
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);

      const resp = await crearPublicacion({
        titulo,
        descripcion,
        valor_creditos: valorCreditos,
        ubicacion_texto: ubicacion,
        latitud: null,
        longitud: null,
        peso_aprox_kg: pesoKg,
        categoria_id: categoriaId,
        estado_id: undefined, // usará "disponible" por defecto
        factor_ids: ninguna ? [] : seleccionFactores,
        sin_impacto: ninguna,
        fotos: [...uploadedUrls, ...fotosList],
      });

      navigate(`/market/${resp.id}`);
    } catch (e: any) {
      setMsg(e?.message || "No se pudo crear la publicación");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-50">
      <Header title="Crear publicación" onBack={() => navigate(-1)} />
      <main className="mx-auto max-w-3xl p-4 space-y-4">
        {msg && (
          <div className="rounded-lg border border-red-600 bg-red-950/40 p-3 text-sm">
            {msg}
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className="space-y-4 rounded-2xl border border-neutral-800 bg-neutral-900/60 p-4"
        >
          <div className="grid gap-3 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium">Título</label>
              <input
                className="w-full rounded-lg border border-neutral-700 bg-neutral-950 px-3 py-2 text-sm"
                value={titulo}
                onChange={(e) => setTitulo(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Créditos</label>
              <input
                type="number"
                min={0}
                className="w-full rounded-lg border border-neutral-700 bg-neutral-950 px-3 py-2 text-sm"
                value={valorCreditos}
                onChange={(e) => setValorCreditos(Number(e.target.value) || 0)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Descripción</label>
            <textarea
              rows={3}
              className="w-full rounded-lg border border-neutral-700 bg-neutral-950 px-3 py-2 text-sm"
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
            />
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium">Categoría</label>
              <select
                className="w-full rounded-lg border border-neutral-700 bg-neutral-950 px-3 py-2 text-sm"
                value={categoriaId ?? ""}
                onChange={(e) =>
                  setCategoriaId(e.target.value ? Number(e.target.value) : null)
                }
              >
                <option value="">Selecciona una categoría</option>
                {categorias.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.nombre}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Peso aprox. (kg)</label>
              <input
                type="number"
                min={0}
                step="0.01"
                className="w-full rounded-lg border border-neutral-700 bg-neutral-950 px-3 py-2 text-sm"
                value={pesoKg}
                onChange={(e) => setPesoKg(Number(e.target.value) || 0)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Ubicación</label>
            <input
              className="w-full rounded-lg border border-neutral-700 bg-neutral-950 px-3 py-2 text-sm"
              value={ubicacion}
              onChange={(e) => setUbicacion(e.target.value)}
              placeholder="Ej: Zona Norte, Cochabamba"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">
              URLs de fotos (separadas por coma)
            </label>
            <input
              className="w-full rounded-lg border border-neutral-700 bg-neutral-950 px-3 py-2 text-sm"
              value={fotos}
              onChange={(e) => setFotos(e.target.value)}
            />
          </div>
        <div className="space-y-2">
            <label className="text-sm font-medium">
                Imágenes (desde tu dispositivo)
            </label>
            <input
                type="file"
                accept="image/*"
                multiple
                className="block w-full text-sm text-neutral-200
                        file:mr-4 file:rounded-lg file:border-0
                        file:bg-green-600 file:px-4 file:py-2
                        file:text-sm file:font-semibold
                        hover:file:bg-green-500"
                onChange={async (e) => {
                const files = e.target.files;
                if (!files || files.length === 0) return;

                try {
                    setUploading(true);
                    const list = Array.from(files);
                    const urls = await uploadMarketImages(list);
                    // juntamos las nuevas con las anteriores
                    setUploadedUrls((prev) => [...prev, ...urls]);
                } catch (err: any) {
                    setMsg(err?.message || "Error al subir imágenes");
                } finally {
                    setUploading(false);
                }
                }}
            />

            {uploading && (
                <p className="text-xs text-neutral-400 mt-1">Subiendo imágenes…</p>
            )}

            {uploadedUrls.length > 0 && (
                <div className="mt-2 grid grid-cols-3 gap-2">
                {uploadedUrls.map((url) => (
                    <div key={url} className="relative">
                    <img
                        src={url}
                        alt="preview"
                        className="h-24 w-full rounded-lg object-cover border border-neutral-700"
                    />
                    </div>
                ))}
                </div>
            )}
            </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">
              Tipo de impacto social / ambiental
            </label>
            <div className="rounded-xl border border-neutral-800 bg-neutral-950/60 p-3 space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <input
                  id="impacto-ninguno"
                  type="checkbox"
                  checked={ninguna}
                  onChange={(e) => {
                    setNinguna(e.target.checked);
                    if (e.target.checked) setSeleccionFactores([]);
                  }}
                />
                <label htmlFor="impacto-ninguno">
                  Ninguna (no contabilizar impacto)
                </label>
              </div>

              <div className="grid gap-2 md:grid-cols-2">
                {factores.map((f) => (
                  <label
                    key={f.id}
                    className="flex items-start gap-2 rounded-lg border border-neutral-700/60 bg-neutral-900/60 p-2"
                  >
                    <input
                      type="checkbox"
                      checked={seleccionFactores.includes(f.id)}
                      onChange={() => toggleFactor(f.id)}
                      disabled={ninguna}
                    />
                    <div>
                      <p className="font-medium text-sm">{f.nombre_factor}</p>
                      <p className="text-xs text-neutral-400">
                        Unidad: {f.unidad_medida}
                      </p>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              className="rounded-xl border border-neutral-700 px-4 py-2 text-sm"
              onClick={() => navigate(-1)}
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="rounded-xl bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-500 disabled:opacity-50"
            >
              {loading ? "Guardando…" : "Publicar"}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}
