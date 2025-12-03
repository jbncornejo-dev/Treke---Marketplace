import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  ImagePlus,
  X,
  MapPin,
  Tag,
  DollarSign,
  Package,
  Type,
  AlignLeft,
  Link as LinkIcon,
  Loader2,
  CheckCircle2
} from "lucide-react";

import {
  crearPublicacion,
  getCategorias,
  uploadMarketImages,
} from "../../api/market";

type Categoria = { id: number; nombre: string };

export default function MarketCreate() {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // --- ESTADOS ---
  const [titulo, setTitulo] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [valorCreditos, setValorCreditos] = useState<number | "">("");
  const [ubicacion, setUbicacion] = useState("");
  const [pesoKg, setPesoKg] = useState<number | "">("");
  const [categoriaId, setCategoriaId] = useState<number | null>(null);
  
  // Imágenes
  const [uploadedUrls, setUploadedUrls] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  
  // URL Manual (Toggle)
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [manualUrlText, setManualUrlText] = useState(""); 

  // Data & UI
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  // --- EFECTOS ---
  useEffect(() => {
    async function load() {
      try {
        const cats = await getCategorias();
        setCategorias(cats);
      } catch (e: any) {
        console.error("Error cat:", e);
      }
    }
    load();
  }, []);

  // --- HANDLERS ---
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
      // Limpiar input para permitir subir mismo archivo si se borró
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  const handleAddManualUrl = () => {
      if(!manualUrlText) return;
      const urls = manualUrlText.split(",").map(s => s.trim()).filter(Boolean);
      setUploadedUrls(prev => [...prev, ...urls]);
      setManualUrlText("");
      setShowUrlInput(false);
  }

  const removeImage = (urlToRemove: string) => {
      setUploadedUrls(prev => prev.filter(u => u !== urlToRemove));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMsg("");
    
    if (!titulo || !descripcion || !ubicacion || !categoriaId || !valorCreditos) {
      setMsg("Por favor completa los campos obligatorios (*)");
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    if (uploadedUrls.length === 0) {
        setMsg("Debes añadir al menos una foto.");
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
    }

    try {
      setLoading(true);
      
      const resp = await crearPublicacion({
        titulo,
        descripcion,
        valor_creditos: Number(valorCreditos),
        ubicacion_texto: ubicacion,
        peso_aprox_kg: Number(pesoKg) || 0,
        categoria_id: categoriaId,
        estado_id: undefined,
        factor_ids: [],
        sin_impacto: true,
        fotos: uploadedUrls, // Usamos el array unificado
      });

      setSuccess(true);
      setTimeout(() => {
          navigate(`/market/${resp.id}`);
      }, 1500);
      
    } catch (e: any) {
      setMsg(e?.message || "No se pudo crear la publicación");
      setLoading(false);
    }
  }

  // --- RENDER ---
  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-900 pb-24 selection:bg-emerald-100">
      
      {/* --- HEADER --- */}
      <div className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-gray-100 px-4 py-3">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
            <button onClick={() => navigate(-1)} className="p-2 -ml-2 rounded-full hover:bg-gray-100 text-gray-600 transition-colors">
                <ArrowLeft size={20} />
            </button>
            <h1 className="font-semibold text-gray-900">Nueva Publicación</h1>
            <div className="w-9"></div> {/* Spacer */}
        </div>
      </div>

      <main className="max-w-3xl mx-auto p-4 md:p-6 space-y-6">
        
        {/* Feedback Messages */}
        {msg && (
          <div className="p-4 rounded-xl bg-red-50 border border-red-100 text-red-600 text-sm font-medium flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
            <X size={16} /> {msg}
          </div>
        )}

        {/* --- TARJETA 1: FOTOS --- */}
        <div className="bg-white rounded-3xl p-5 md:p-8 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold flex items-center gap-2">
                    <ImagePlus className="text-emerald-500" size={20} />
                    Fotos del Producto
                </h2>
                <span className="text-xs font-medium text-gray-400 bg-gray-100 px-2 py-1 rounded-full">
                    {uploadedUrls.length} añadidas
                </span>
            </div>

            {/* Grid de Fotos */}
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
                
                {/* Botón Upload */}
                <button 
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                    className="aspect-square rounded-2xl border-2 border-dashed border-gray-200 hover:border-emerald-500 hover:bg-emerald-50 transition-all flex flex-col items-center justify-center gap-1 group cursor-pointer disabled:opacity-50"
                >
                    {uploading ? (
                        <Loader2 className="animate-spin text-emerald-500" size={24} />
                    ) : (
                        <>
                            <ImagePlus className="text-gray-400 group-hover:text-emerald-600 transition-colors" size={24} />
                            <span className="text-[10px] font-bold text-gray-400 group-hover:text-emerald-600 uppercase tracking-wide">Subir</span>
                        </>
                    )}
                </button>
                <input 
                    type="file" 
                    accept="image/*" 
                    multiple 
                    className="hidden" 
                    ref={fileInputRef}
                    onChange={handleFileUpload} 
                />

                {/* Previews */}
                {uploadedUrls.map((url, idx) => (
                    <div key={idx} className="relative aspect-square rounded-2xl overflow-hidden group border border-gray-100 shadow-sm">
                        <img src={url} alt="preview" className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <button 
                                onClick={() => removeImage(url)}
                                className="p-1.5 bg-white text-red-500 rounded-full hover:scale-110 transition-transform"
                            >
                                <X size={14} strokeWidth={3} />
                            </button>
                        </div>
                        {idx === 0 && (
                            <span className="absolute bottom-0 left-0 w-full bg-black/60 text-white text-[9px] font-bold text-center py-0.5">
                                PORTADA
                            </span>
                        )}
                    </div>
                ))}
            </div>

            {/* Opción URL Manual */}
            <div className="mt-4">
                {!showUrlInput ? (
                    <button 
                        onClick={() => setShowUrlInput(true)}
                        className="text-xs font-medium text-emerald-600 hover:underline flex items-center gap-1"
                    >
                        <LinkIcon size={12} /> Añadir desde URL externa
                    </button>
                ) : (
                    <div className="flex gap-2 animate-in fade-in slide-in-from-top-1">
                        <input 
                            className="flex-1 text-sm bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 outline-none focus:ring-1 focus:ring-emerald-500"
                            placeholder="https://ejemplo.com/foto.jpg"
                            value={manualUrlText}
                            onChange={e => setManualUrlText(e.target.value)}
                        />
                        <button 
                            onClick={handleAddManualUrl}
                            className="px-4 py-2 bg-gray-900 text-white text-xs font-bold rounded-xl hover:bg-emerald-600 transition-colors"
                        >
                            OK
                        </button>
                        <button onClick={() => setShowUrlInput(false)} className="p-2 text-gray-400 hover:text-gray-600">
                            <X size={16} />
                        </button>
                    </div>
                )}
            </div>
        </div>

        {/* --- TARJETA 2: DETALLES --- */}
        <div className="bg-white rounded-3xl p-5 md:p-8 shadow-sm border border-gray-100 space-y-6">
            
            <div className="mb-4">
                <h2 className="text-lg font-bold flex items-center gap-2 mb-1">
                    <Type className="text-emerald-500" size={20} />
                    Detalles Básicos
                </h2>
                <p className="text-xs text-gray-400">La información clara ayuda a intercambiar más rápido.</p>
            </div>

            {/* Título */}
            <div className="space-y-1.5">
                <label className="text-sm font-semibold text-gray-700 ml-1">¿Qué ofreces? <span className="text-red-400">*</span></label>
                <input
                    placeholder="Ej. Cámara Vintage Sony 1990"
                    className="w-full p-4 rounded-xl bg-gray-50 border-none focus:bg-white focus:ring-2 focus:ring-emerald-100 focus:outline-none transition-all placeholder:text-gray-400 font-medium"
                    value={titulo}
                    onChange={(e) => setTitulo(e.target.value)}
                />
            </div>

            {/* Grid Precio / Categoría */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-gray-700 ml-1 flex items-center gap-1">
                        Valor <span className="text-red-400">*</span>
                    </label>
                    <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400 group-focus-within:text-emerald-500">
                            <DollarSign size={18} />
                        </div>
                        <input
                            type="number"
                            min="0"
                            placeholder="Créditos"
                            className="w-full pl-10 pr-4 py-3.5 rounded-xl bg-gray-50 border-none focus:bg-white focus:ring-2 focus:ring-emerald-100 focus:outline-none transition-all font-medium"
                            value={valorCreditos}
                            onChange={(e) => setValorCreditos(e.target.value === "" ? "" : Number(e.target.value))}
                        />
                    </div>
                </div>

                <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-gray-700 ml-1">Categoría <span className="text-red-400">*</span></label>
                    <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400 group-focus-within:text-emerald-500">
                            <Tag size={18} />
                        </div>
                        <select
                            className="w-full pl-10 pr-8 py-3.5 rounded-xl bg-gray-50 border-none focus:bg-white focus:ring-2 focus:ring-emerald-100 focus:outline-none transition-all appearance-none cursor-pointer font-medium text-gray-600"
                            value={categoriaId ?? ""}
                            onChange={(e) => setCategoriaId(e.target.value ? Number(e.target.value) : null)}
                        >
                            <option value="">Seleccionar...</option>
                            {categorias.map((c) => (
                                <option key={c.id} value={c.id}>{c.nombre}</option>
                            ))}
                        </select>
                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-400">
                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                        </div>
                    </div>
                </div>
            </div>

            {/* Descripción */}
            <div className="space-y-1.5">
                <label className="text-sm font-semibold text-gray-700 ml-1 flex items-center gap-1">
                     Descripción <span className="text-red-400">*</span>
                </label>
                <div className="relative group">
                    <div className="absolute top-4 left-3 pointer-events-none text-gray-400 group-focus-within:text-emerald-500">
                        <AlignLeft size={18} />
                    </div>
                    <textarea
                        rows={4}
                        placeholder="Cuenta la historia de tu objeto, su estado y por qué buscas intercambiarlo..."
                        className="w-full pl-10 pr-4 py-3.5 rounded-xl bg-gray-50 border-none focus:bg-white focus:ring-2 focus:ring-emerald-100 focus:outline-none transition-all resize-none text-sm leading-relaxed"
                        value={descripcion}
                        onChange={(e) => setDescripcion(e.target.value)}
                    />
                </div>
            </div>

            {/* Ubicación y Peso */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-2">
                <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-gray-700 ml-1">Ubicación <span className="text-red-400">*</span></label>
                    <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400 group-focus-within:text-emerald-500">
                            <MapPin size={18} />
                        </div>
                        <input
                            placeholder="Ej. Centro, Zona Sur..."
                            className="w-full pl-10 pr-4 py-3.5 rounded-xl bg-gray-50 border-none focus:bg-white focus:ring-2 focus:ring-emerald-100 focus:outline-none transition-all"
                            value={ubicacion}
                            onChange={(e) => setUbicacion(e.target.value)}
                        />
                    </div>
                </div>
                
                <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-gray-700 ml-1">Peso aprox.</label>
                    <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400 group-focus-within:text-emerald-500">
                            <Package size={18} />
                        </div>
                        <input
                            type="number"
                            placeholder="Kg"
                            className="w-full pl-10 pr-4 py-3.5 rounded-xl bg-gray-50 border-none focus:bg-white focus:ring-2 focus:ring-emerald-100 focus:outline-none transition-all"
                            value={pesoKg}
                            onChange={(e) => setPesoKg(e.target.value === "" ? "" : Number(e.target.value))}
                        />
                    </div>
                </div>
            </div>

        </div>

        {/* --- BOTÓN FINAL --- */}
        <div className="pt-2">
            <button
                onClick={handleSubmit}
                disabled={loading || success}
                className={`w-full py-4 rounded-2xl font-bold text-lg shadow-xl transition-all flex items-center justify-center gap-2 ${
                    success 
                    ? "bg-green-500 text-white cursor-default scale-100" 
                    : "bg-gray-900 hover:bg-emerald-600 hover:shadow-emerald-500/20 text-white hover:-translate-y-1 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
                }`}
            >
                {loading ? (
                    <>
                       <Loader2 size={24} className="animate-spin" />
                       Publicando...
                    </>
                ) : success ? (
                    <>
                       <CheckCircle2 size={24} />
                       ¡Publicado!
                    </>
                ) : (
                    "Publicar ahora"
                )}
            </button>
            <p className="text-center text-xs text-gray-400 mt-4">
                Al publicar, aceptas los términos y condiciones de Treke.
            </p>
        </div>

      </main>
    </div>
  );
}