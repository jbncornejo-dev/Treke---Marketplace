import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { 
  Search, 
  Filter, 
  Heart, 
  Plus, 
  Store, 
  Sparkles,
  Tag,
  ArrowUpDown,
  ShoppingBag
} from "lucide-react";
import AdsFooter from "../../components/AdsFooter";


// 👇 Tus imports de API se mantienen igual
import { list, getCategorias, toggleFav, type MarketItem, type MarketListResp } from "../../api/market";

type SortKey = "recent" | "price_asc" | "price_desc";
type CategoriaSimple = { id: number; nombre: string };

export default function Marketplace() {
  const navigate = useNavigate();

  // --- ESTADOS (Misma lógica) ---
  const [q, setQ] = useState("");
  const [categoriaId, setCategoriaId] = useState<number | null>(null);
  const [minCred, setMinCred] = useState<number | null>(null);
  const [maxCred, setMaxCred] = useState<number | null>(null);
  const [sort, setSort] = useState<SortKey>("recent");

  const [items, setItems] = useState<MarketItem[]>([]);
  const [categorias, setCategorias] = useState<CategoriaSimple[]>([]); 
  const [page, setPage] = useState({ total: 0, limit: 12, offset: 0, has_more: false });
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");

  // --- EFECTOS ---
  useEffect(() => {
    getCategorias()
      .then((data) => setCategorias(data))
      .catch((err) => console.error("Error cargando categorías:", err));
  }, []);

  async function fetchData(offset = 0) {
    setLoading(true);
    setMsg("");
    try {
      const resp: MarketListResp = await list({ q, categoria_id: categoriaId, min_cred: minCred, max_cred: maxCred, sort, limit: 12, offset });
      if (offset === 0) setItems(resp.items);
      else setItems((prev) => [...prev, ...resp.items]);
      setPage(resp.page);
    } catch (e: any) {
      setMsg(e?.message || "No se pudo cargar el marketplace");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchData(0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q, categoriaId, sort]); 

  return (
    <div className="min-h-screen bg-gray-50/50 font-sans text-gray-900 pb-32">
      
      {/* --- HERO HEADER (Bloque de Color) --- */}
      <div className="bg-linear-to-r from-emerald-700 to-emerald-500 pt-8 pb-16 px-4 rounded-b-[2.5rem] shadow-xl shadow-emerald-900/10 relative z-10">
        <div className="max-w-7xl mx-auto">
          
          {/* Top Bar: Logo/Titulo + Botones Accion */}
          <div className="flex justify-between items-center mb-6">
            <div className="text-white">
              <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
                <ShoppingBag className="text-emerald-200" />
                Explorar Mercado
              </h1>
              <p className="text-emerald-100 text-sm opacity-90">Encuentra tesoros, ahorra dinero.</p>
            </div>

            <div className="flex gap-3">
               <Link to="/intercambios" className="bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-xl text-sm font-medium backdrop-blur-md transition-all">
                  Mis Trueques
               </Link>
               <Link to="/perfil" className="bg-white/10 hover:bg-white/20 text-white w-10 h-10 flex items-center justify-center rounded-xl backdrop-blur-md transition-all">
                  <div className="w-6 h-6 rounded-full bg-emerald-200 overflow-hidden">
                     <img src="https://i.pravatar.cc/150?img=12" alt="Perfil" className="w-full h-full object-cover opacity-90"/>
                  </div>
               </Link>
            </div>
          </div>

          {/* Search Bar Grande */}
          <div className="relative max-w-2xl mx-auto transform translate-y-4">
             <div className="bg-white p-2 rounded-2xl shadow-lg flex items-center gap-2">
                <div className="pl-3 text-gray-400">
                   <Search size={22} />
                </div>
                <input 
                  className="flex-1 h-12 outline-none text-gray-700 placeholder:text-gray-400 text-lg"
                  placeholder="¿Qué buscas hoy? (ej. Bici, Libros...)"
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                />
                <button 
                  className="bg-gray-900 hover:bg-black text-white px-6 h-12 rounded-xl font-medium transition-colors"
                  onClick={() => fetchData(0)}
                >
                  Buscar
                </button>
             </div>
          </div>

        </div>
      </div>

      {/* --- BARRA DE FILTROS (Debajo del Hero) --- */}
      <div className="max-w-7xl mx-auto px-4 mt-8 mb-8">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
           
           {/* Chips de Filtros Rápidos */}
           <div className="flex items-center gap-3 overflow-x-auto pb-2 w-full md:w-auto no-scrollbar">
              
              {/* Dropdown Categoría Estilizado */}
              <div className="relative group shrink-0">
                 <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-emerald-600">
                    <Tag size={16} />
                 </div>
                 <select
                    className="appearance-none pl-9 pr-8 py-2.5 bg-white border border-gray-200 rounded-lg text-sm font-semibold text-gray-700 hover:border-emerald-500 focus:ring-2 focus:ring-emerald-100 outline-none cursor-pointer transition-all shadow-sm"
                    value={categoriaId ?? ""}
                    onChange={(e) => setCategoriaId(e.target.value ? Number(e.target.value) : null)}
                 >
                    <option value="">Todas las Categorías</option>
                    {categorias.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
                 </select>
              </div>

              {/* Dropdown Orden */}
              <div className="relative shrink-0">
                 <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-emerald-600">
                    <ArrowUpDown size={16} />
                 </div>
                 <select
                    className="appearance-none pl-9 pr-8 py-2.5 bg-white border border-gray-200 rounded-lg text-sm font-semibold text-gray-700 hover:border-emerald-500 focus:ring-2 focus:ring-emerald-100 outline-none cursor-pointer transition-all shadow-sm"
                    value={sort}
                    onChange={(e) => setSort(e.target.value as SortKey)}
                 >
                    <option value="recent">Recientes</option>
                    <option value="price_asc">Precio: Bajo a Alto</option>
                    <option value="price_desc">Precio: Alto a Bajo</option>
                 </select>
              </div>

           </div>

           {/* Filtro Rango (Visualmente separado) */}
           <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-lg border border-gray-200 shadow-sm">
              <span className="text-xs font-bold text-amber-500 uppercase tracking-wider">Rango Créditos</span>
              <input 
                 type="number" placeholder="0" 
                 className="w-12 text-sm text-center border-b border-gray-200 focus:border-amber-500 outline-none"
                 value={minCred ?? ""} onChange={e => setMinCred(e.target.value ? Number(e.target.value) : null)}
              />
              <span className="text-gray-300">-</span>
              <input 
                 type="number" placeholder="Max" 
                 className="w-12 text-sm text-center border-b border-gray-200 focus:border-amber-500 outline-none"
                 value={maxCred ?? ""} onChange={e => setMaxCred(e.target.value ? Number(e.target.value) : null)}
              />
           </div>
        </div>
      </div>

      {/* --- GRID DE PRODUCTOS --- */}
      <main className="max-w-7xl mx-auto px-4">
        
        {msg && <div className="p-4 bg-red-100 text-red-700 rounded-xl mb-6 text-center">{msg}</div>}

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {items.map((item) => (
            <VibrantCard key={item.id} item={item} />
          ))}
        </div>

        {/* Loading / Empty States */}
        {!loading && items.length === 0 && (
           <div className="text-center py-20">
              <div className="inline-flex p-4 rounded-full bg-gray-100 mb-4">
                 <Filter size={32} className="text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-600">Sin resultados</h3>
              <p className="text-gray-400 text-sm">Prueba ajustando los filtros.</p>
           </div>
        )}

        <div className="flex justify-center py-12">
          {loading ? (
             <div className="bg-white px-6 py-3 rounded-full shadow-lg flex items-center gap-3 text-emerald-600 font-medium">
                <div className="animate-spin rounded-full h-5 w-5 border-2 border-current border-t-transparent"></div>
                Cargando...
             </div>
          ) : page.has_more && (
             <button onClick={() => fetchData(page.offset + page.limit)} className="bg-white border border-emerald-100 text-emerald-700 px-8 py-3 rounded-full font-medium hover:bg-emerald-50 transition-colors shadow-sm">
                Cargar más
             </button>
          )}
        </div>
      </main>

      {/* --- BOTONES FLOTANTES (FAB) MEJORADOS --- */}
      
      {/* Tienda Créditos (Color Diferente para resaltar) */}
      <Link to="/creditosyplanes" className="fixed bottom-6 left-6 z-40 group">
         <div className="flex items-center gap-3 bg-white pl-2 pr-5 py-2 rounded-full shadow-2xl shadow-amber-500/20 border border-amber-100 hover:scale-105 transition-all">
            <div className="w-10 h-10 rounded-full bg-linear-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white shadow-md">
               <Store size={20} />
            </div>
            <div>
               <p className="text-[10px] font-bold text-amber-500 uppercase tracking-wider">Tienda</p>
               <p className="text-sm font-bold text-gray-800">Créditos</p>
            </div>
         </div>
      </Link>

      {/* Crear Publicación (Principal) */}
      <button 
         onClick={() => navigate("/market/nueva")}
         className="fixed bottom-6 right-6 z-40 w-16 h-16 bg-gray-900 text-white rounded-2xl shadow-2xl shadow-gray-900/40 flex items-center justify-center hover:bg-emerald-600 hover:rounded-full transition-all duration-300 hover:rotate-90"
      >
         <Plus size={32} />
      </button>
   <AdsFooter ubicacion="market" />
    </div>
  );
}

// --- SUBCOMPONENTE TARJETA "VIBRANT" ---
function VibrantCard({ item }: { item: MarketItem }) {
  const [liked, setLiked] = useState(!!item.is_fav);
  const [loadingLike, setLoadingLike] = useState(false);

  const handleToggleLike = async (e: React.MouseEvent) => {
    e.preventDefault(); e.stopPropagation();
    if (loadingLike) return;
    setLiked(!liked); setLoadingLike(true);
    try { await toggleFav(item.id, !liked); } 
    catch { setLiked(liked); } // Rollback
    finally { setLoadingLike(false); }
  };

  return (
    <Link to={`/market/${item.id}`} className="group relative bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl hover:shadow-emerald-900/10 border border-gray-100 transition-all duration-300 flex flex-col h-full hover:-translate-y-1">
      
      {/* Imagen */}
      <div className="relative aspect-4/3 overflow-hidden bg-gray-100">
         {item.foto_principal ? (
            <img src={item.foto_principal} alt={item.titulo} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
         ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-300"><Sparkles size={32}/></div>
         )}
         
         {/* Like Button (Flotante top-right) */}
         <button onClick={handleToggleLike} className="absolute top-2 right-2 p-2 rounded-full bg-white/80 backdrop-blur-sm hover:bg-white text-gray-400 hover:text-red-500 transition-colors shadow-sm">
            <Heart size={18} fill={liked ? "currentColor" : "none"} className={liked ? "text-red-500" : ""} />
         </button>

         {/* Badge Categoría (Flotante top-left) */}
         {/* Si tuviéramos el nombre de la categoría en el item, iría aquí. Usamos un placeholder visual */}
         <div className="absolute top-2 left-2 bg-black/50 backdrop-blur-md px-2 py-0.5 rounded text-[10px] font-medium text-white">
            Artículo
         </div>
      </div>

      {/* Contenido (Padding generoso) */}
      <div className="p-4 flex flex-col flex-1">
         
         {/* Título */}
         <h3 className="text-gray-800 font-bold text-base leading-tight line-clamp-2 mb-1 group-hover:text-emerald-700 transition-colors">
            {item.titulo}
         </h3>
         
         {/* Vendedor */}
         <div className="flex items-center gap-1.5 mb-3">
            <div className="w-4 h-4 rounded-full bg-emerald-100 flex items-center justify-center text-[9px] font-bold text-emerald-700">
               {item.vendedor_nombre?.charAt(0) || "U"}
            </div>
            <span className="text-xs text-gray-500 truncate">{item.vendedor_nombre || "Usuario"}</span>
         </div>

         {/* Spacer */}
         <div className="flex-1"></div>

         {/* Footer: Precio Destacado */}
         <div className="flex items-center justify-between border-t border-gray-50 pt-3 mt-1">
            <div className="flex flex-col">
               <span className="text-[10px] text-gray-400 font-medium uppercase tracking-wide">Valor</span>
               <div className="flex items-center gap-1 text-amber-500 font-extrabold text-lg">
                  <Sparkles size={14} className="animate-pulse"/>
                  {item.valor_creditos}
               </div>
            </div>
            
            {/* Botón visual "Ver" */}
            <div className="w-8 h-8 rounded-full bg-gray-50 group-hover:bg-emerald-600 group-hover:text-white flex items-center justify-center text-emerald-600 transition-colors">
               <ArrowUpDown size={16} className="rotate-45 group-hover:rotate-90 transition-transform"/>
            </div>
         </div>
         
         
      </div>
    </Link>
  );
}