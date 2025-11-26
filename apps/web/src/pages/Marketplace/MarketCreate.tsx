import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  crearPublicacion,
  getCategorias,
  uploadMarketImages,
} from "../../api/market";

type Categoria = { id: number; nombre: string };

export default function MarketCreate() {
  const navigate = useNavigate();

  // Estados del formulario
  const [titulo, setTitulo] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [valorCreditos, setValorCreditos] = useState<number | "">("");
  const [ubicacion, setUbicacion] = useState("");
  const [pesoKg, setPesoKg] = useState<number | "">("");
  const [categoriaId, setCategoriaId] = useState<number | null>(null);
  
  // Estados de imágenes
  const [uploadedUrls, setUploadedUrls] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [fotosUrlManual, setFotosUrlManual] = useState(""); 

  // Estados de catálogos
  const [categorias, setCategorias] = useState<Categoria[]>([]);

  // UI States
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);

  // Cargar solo categorías
  useEffect(() => {
    async function load() {
      try {
        const cats = await getCategorias();
        setCategorias(cats);
      } catch (e: any) {
        setMsg(e?.message || "No se pudieron cargar las categorías");
      }
    }
    load();
  }, []);

  // Manejo de subida de archivos
  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    try {
      setUploading(true);
      const list = Array.from(files);
      const urls = await uploadMarketImages(list);
      setUploadedUrls((prev) => [...prev, ...urls]);
    } catch (err: any) {
      setMsg(err?.message || "Error al subir imágenes");
    } finally {
      setUploading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMsg("");
    
    if (!titulo || !descripcion || !ubicacion || !categoriaId || !valorCreditos) {
      setMsg("Por favor completa los campos obligatorios.");
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    try {
      setLoading(true);
      // Combinar fotos subidas con URLs manuales
      const manualList = fotosUrlManual.split(",").map((s) => s.trim()).filter(Boolean);
      const fotosFinales = [...uploadedUrls, ...manualList];

      const resp = await crearPublicacion({
        titulo,
        descripcion,
        valor_creditos: Number(valorCreditos),
        ubicacion_texto: ubicacion,
        peso_aprox_kg: Number(pesoKg) || 0,
        categoria_id: categoriaId,
        estado_id: undefined, // El backend asignará "disponible" por defecto
        
        // Enviamos arrays vacíos para los factores (ya no se usan en UI)
        factor_ids: [],
        sin_impacto: true,
        
        fotos: fotosFinales,
      });

      navigate(`/market/${resp.id}`);
    } catch (e: any) {
      setMsg(e?.message || "No se pudo crear la publicación");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#f6f8f7] dark:bg-[#112117] text-[#112117] dark:text-[#ecf0f1] font-sans pb-10 transition-colors">
      
      {/* --- HEADER --- */}
      <div className="sticky top-0 z-20 flex items-center justify-between px-4 py-3 bg-[#f6f8f7]/90 dark:bg-[#112117]/90 backdrop-blur-md border-b border-gray-200 dark:border-gray-800">
        <button onClick={() => navigate(-1)} className="p-2 -ml-2 rounded-full hover:bg-gray-200 dark:hover:bg-white/10 transition-colors">
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
        </button>
        <h2 className="text-lg font-bold tracking-tight">Crear Publicación</h2>
        <div className="w-10 flex justify-end">
            <span className="text-xs font-bold text-[#2ecc71] bg-[#2ecc71]/10 px-2 py-1 rounded-md">
                Treke
            </span>
        </div>
      </div>

      <main className="max-w-2xl mx-auto p-4 space-y-8">
        
        {/* Mensaje de Error */}
        {msg && (
          <div className="p-4 rounded-xl bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 text-sm font-medium animate-pulse">
            {msg}
          </div>
        )}

        {/* --- SECCIÓN FOTOS --- */}
        <div>
          <h3 className="text-base font-bold mb-3">Añade fotos del producto</h3>
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
            
            {/* Botón Subir */}
            <label className="relative aspect-square cursor-pointer flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-700 bg-white dark:bg-[#1a2e22] hover:border-[#2ecc71] hover:bg-[#2ecc71]/5 transition-all group">
              {uploading ? (
                 <div className="animate-spin rounded-full h-6 w-6 border-2 border-gray-400 border-t-[#2ecc71]"></div>
              ) : (
                <>
                  <svg className="w-8 h-8 text-gray-400 group-hover:text-[#2ecc71] transition-colors mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span className="text-xs text-gray-500 font-medium group-hover:text-[#2ecc71]">Añadir</span>
                </>
              )}
              <input type="file" accept="image/*" multiple className="hidden" onChange={handleFileUpload} />
            </label>

            {/* Previews */}
            {uploadedUrls.map((url, idx) => (
              <div key={idx} className="relative aspect-square rounded-xl overflow-hidden bg-gray-100 border border-gray-200 dark:border-gray-700 group">
                <img src={url} alt="preview" className="w-full h-full object-cover" />
                <button 
                  type="button"
                  onClick={() => setUploadedUrls(prev => prev.filter(u => u !== url))}
                  className="absolute top-1 right-1 bg-black/50 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>
            ))}
          </div>

          {/* Opción Manual */}
          <input 
             className="mt-3 w-full text-sm bg-transparent border-b border-gray-300 dark:border-gray-700 focus:border-[#2ecc71] focus:outline-none py-2 placeholder:text-gray-400"
             placeholder="O pega URLs de imagen aquí (separadas por coma)"
             value={fotosUrlManual}
             onChange={e => setFotosUrlManual(e.target.value)}
          />
        </div>

        {/* --- FORMULARIO PRINCIPAL --- */}
        <div className="space-y-6">
            
            {/* Título */}
            <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700 dark:text-gray-300">Título</label>
                <input
                    placeholder="Ej. Bicicleta de montaña rodado 29"
                    className="w-full h-14 px-4 rounded-xl bg-white dark:bg-[#1a2e22] border border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-[#2ecc71] focus:border-transparent transition-all placeholder:text-gray-400"
                    value={titulo}
                    onChange={(e) => setTitulo(e.target.value)}
                />
            </div>

            {/* Descripción */}
            <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700 dark:text-gray-300">Descripción</label>
                <textarea
                    rows={4}
                    placeholder="Describe los detalles, estado y motivo del intercambio..."
                    className="w-full p-4 rounded-xl bg-white dark:bg-[#1a2e22] border border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-[#2ecc71] focus:border-transparent transition-all placeholder:text-gray-400 resize-none"
                    value={descripcion}
                    onChange={(e) => setDescripcion(e.target.value)}
                />
            </div>

            {/* Precio y Categoría (Grid) */}
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-700 dark:text-gray-300">Precio (Créditos)</label>
                    <input
                        type="number"
                        min="0"
                        placeholder="0"
                        className="w-full h-14 px-4 rounded-xl bg-white dark:bg-[#1a2e22] border border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-[#2ecc71] transition-all"
                        value={valorCreditos}
                        onChange={(e) => setValorCreditos(e.target.value === "" ? "" : Number(e.target.value))}
                    />
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-700 dark:text-gray-300">Categoría</label>
                    <div className="relative">
                        <select
                            className="w-full h-14 px-4 rounded-xl bg-white dark:bg-[#1a2e22] border border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-[#2ecc71] appearance-none transition-all"
                            value={categoriaId ?? ""}
                            onChange={(e) => setCategoriaId(e.target.value ? Number(e.target.value) : null)}
                        >
                            <option value="">Seleccionar</option>
                            {categorias.map((c) => (
                                <option key={c.id} value={c.id}>{c.nombre}</option>
                            ))}
                        </select>
                        {/* Icono flecha custom */}
                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-500">
                            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                        </div>
                    </div>
                </div>
            </div>

            {/* Ubicación y Peso */}
            <div className="grid grid-cols-2 gap-4">
                 <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-700 dark:text-gray-300">Ubicación</label>
                    <input
                        placeholder="Ej. Zona Norte"
                        className="w-full h-14 px-4 rounded-xl bg-white dark:bg-[#1a2e22] border border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-[#2ecc71] transition-all"
                        value={ubicacion}
                        onChange={(e) => setUbicacion(e.target.value)}
                    />
                </div>
                <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-700 dark:text-gray-300">Peso (Kg aprox)</label>
                    <input
                        type="number"
                        placeholder="0.0"
                        className="w-full h-14 px-4 rounded-xl bg-white dark:bg-[#1a2e22] border border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-[#2ecc71] transition-all"
                        value={pesoKg}
                        onChange={(e) => setPesoKg(e.target.value === "" ? "" : Number(e.target.value))}
                    />
                </div>
            </div>
            
        </div>

        {/* Botón Acción */}
        <div className="pt-6">
            <button
                onClick={handleSubmit}
                disabled={loading}
                className="w-full h-14 rounded-2xl bg-[#2ecc71] hover:bg-[#27ae60] text-white font-bold text-lg tracking-wide shadow-lg hover:shadow-green-500/30 hover:scale-[1.01] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
                {loading ? "Publicando..." : "Publicar ahora"}
            </button>
        </div>

      </main>
    </div>
  );
}