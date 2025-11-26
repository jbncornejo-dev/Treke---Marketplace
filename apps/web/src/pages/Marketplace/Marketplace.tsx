import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
// 👇 1. Importamos getCategorias
import { list, getCategorias, toggleFav, type MarketItem, type MarketListResp } from "../../api/market";

// Definimos los tipos para el ordenamiento
type SortKey = "recent" | "price_asc" | "price_desc";

// Tipo simple para el estado local de categorías
type CategoriaSimple = { id: number; nombre: string };

export default function Marketplace() {
  const navigate = useNavigate();

  // Estados de filtros
  const [q, setQ] = useState("");
  const [categoriaId, setCategoriaId] = useState<number | null>(null);
  const [minCred, setMinCred] = useState<number | null>(null);
  const [maxCred, setMaxCred] = useState<number | null>(null);
  const [sort, setSort] = useState<SortKey>("recent");

  // Estados de datos
  const [items, setItems] = useState<MarketItem[]>([]);
  // 👇 2. Estado para guardar las categorías que vienen del backend
  const [categorias, setCategorias] = useState<CategoriaSimple[]>([]); 
  
  const [page, setPage] = useState({ total: 0, limit: 12, offset: 0, has_more: false });
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");

  // 👇 3. Efecto para cargar las categorías (Solo una vez al montar)
  useEffect(() => {
    getCategorias()
      .then((data) => setCategorias(data))
      .catch((err) => console.error("Error cargando categorías:", err));
  }, []);

  // Carga de productos (Marketplace)
  async function fetchData(offset = 0) {
    setLoading(true);
    setMsg("");
    try {
      const resp: MarketListResp = await list({
        q,
        categoria_id: categoriaId,
        min_cred: minCred,
        max_cred: maxCred,
        sort,
        limit: 12,
        offset,
      });
      if (offset === 0) {
        setItems(resp.items);
      } else {
        setItems((prev) => [...prev, ...resp.items]);
      }
      setPage(resp.page);
    } catch (e: any) {
      setMsg(e?.message || "No se pudo cargar el marketplace");
    } finally {
      setLoading(false);
    }
  }

  // Efecto para recargar productos cuando cambian los filtros
  useEffect(() => {
    fetchData(0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q, categoriaId, sort]); 

  return (
    <div className="min-h-screen bg-[#f6f8f7] dark:bg-[#112117] text-[#333] dark:text-[#f5f5f5] font-sans pb-24">
      
      {/* --- HEADER / BUSCADOR --- */}
      <div className="sticky top-14 z-30 bg-[#f6f8f7]/95 dark:bg-[#112117]/95 backdrop-blur-sm pt-4 pb-2 px-4 shadow-sm border-b border-gray-100 dark:border-gray-800">
        
        <div className="flex items-center gap-3 mb-3">
          {/* Input Buscador */}
          <div className="flex-1 flex items-center bg-white dark:bg-[#1a2e22] border border-gray-200 dark:border-gray-700 rounded-xl h-12 px-4 shadow-sm focus-within:ring-2 focus-within:ring-[#2ecc71] transition-all">
            <svg className="w-6 h-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              className="flex-1 bg-transparent border-none focus:ring-0 text-base placeholder:text-gray-400 dark:placeholder:text-gray-500 ml-2"
              placeholder="Busca lo que necesitas..."
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
          </div>

          {/* Botón Perfil */}
          <Link 
            to="/perfil" 
            className="flex items-center justify-center h-12 w-12 rounded-xl bg-white dark:bg-[#1a2e22] border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-[#253f30] text-gray-600 dark:text-gray-300 transition-colors shadow-sm"
            title="Mi Perfil"
          >
             <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
             </svg>
          </Link>
        </div>

        {/* Filtros Horizontales */}
        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
          
          {/* 👇 4. Select de Categoría DINÁMICO */}
          <select
            className="h-9 rounded-full bg-gray-200 dark:bg-gray-800 px-4 pr-8 text-sm font-medium border-none focus:ring-0 cursor-pointer hover:bg-gray-300 dark:hover:bg-gray-700 transition-colors appearance-none"
            value={categoriaId ?? ""}
            onChange={(e) => setCategoriaId(e.target.value ? Number(e.target.value) : null)}
          >
            <option value="">Todas las categorías</option>
            {/* Mapeamos el estado 'categorias' en lugar de opciones fijas */}
            {categorias.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.nombre}
              </option>
            ))}
          </select>

          {/* Select de Orden */}
          <select
            className="h-9 rounded-full bg-gray-200 dark:bg-gray-800 px-4 pr-8 text-sm font-medium border-none focus:ring-0 cursor-pointer hover:bg-gray-300 dark:hover:bg-gray-700 transition-colors appearance-none"
            value={sort}
            onChange={(e) => setSort(e.target.value as SortKey)}
          >
            <option value="recent">Recientes</option>
            <option value="price_asc">Precio: Bajo a Alto</option>
            <option value="price_desc">Precio: Alto a Bajo</option>
          </select>

           {/* Input Rango Créditos */}
           <div className="flex items-center h-9 rounded-full bg-gray-200 dark:bg-gray-800 px-3 text-sm">
              <span className="mr-2 text-gray-500">Créditos:</span>
              <input 
                type="number" 
                placeholder="Min" 
                className="w-12 bg-transparent border-none p-0 text-sm focus:ring-0 text-center"
                value={minCred ?? ""}
                onChange={e => setMinCred(e.target.value ? Number(e.target.value) : null)}
              />
              <span className="mx-1 text-gray-400">-</span>
              <input 
                type="number" 
                placeholder="Max" 
                className="w-12 bg-transparent border-none p-0 text-sm focus:ring-0 text-center"
                value={maxCred ?? ""}
                onChange={e => setMaxCred(e.target.value ? Number(e.target.value) : null)}
              />
           </div>
        </div>
      </div>

      {/* --- GRID DE PRODUCTOS --- */}
      <main className="max-w-7xl mx-auto p-4">
        
        {msg && (
            <div className="mb-6 p-4 rounded-xl border border-red-200 bg-red-50 text-red-600 text-center">
                {msg}
            </div>
        )}

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {items.map((item) => (
            <Card key={item.id} item={item} />
          ))}
        </div>

        {!loading && items.length === 0 && (
            <div className="flex flex-col items-center justify-center py-20 text-center opacity-60">
                <svg className="w-16 h-16 mb-4 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
                <p>No se encontraron publicaciones</p>
            </div>
        )}

        <div className="flex justify-center py-8">
          {loading ? (
             <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#2ecc71]"></div>
          ) : page.has_more ? (
            <button
              className="px-6 py-2.5 rounded-full border border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-sm font-medium"
              onClick={() => fetchData(page.offset + page.limit)}
            >
              Ver más resultados
            </button>
          ) : null}
        </div>
      </main>

      {/* --- FAB: BOTÓN FLOTANTE CREAR --- */}
      <div className="fixed bottom-6 right-6 z-40">
        <button
          onClick={() => navigate("/market/nueva")}
          className="flex items-center justify-center w-16 h-16 rounded-full bg-[#2ecc71] hover:bg-[#27ae60] text-white shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 group"
          title="Crear publicación"
        >
          <svg className="w-8 h-8 group-hover:rotate-90 transition-transform duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
          </svg>
        </button>
      </div>

    </div>
  );
}

// --- COMPONENTE CARD ---
function Card({ item }: { item: MarketItem }) {
  const [liked, setLiked] = useState(!!item.is_fav);
  const [loadingLike, setLoadingLike] = useState(false);

  const handleToggleLike = async (e: React.MouseEvent) => {
    e.preventDefault(); 
    e.stopPropagation();

    if (loadingLike) return;
    
    const nuevoEstado = !liked;
    setLiked(nuevoEstado);
    setLoadingLike(true);

    try {
      await toggleFav(item.id, nuevoEstado);
    } catch (error) {
      console.error("Error al dar like", error);
      setLiked(!nuevoEstado);
      alert("Debes iniciar sesión para guardar favoritos");
    } finally {
      setLoadingLike(false);
    }
  };

  return (
    <Link to={`/market/${item.id}`} className="group flex flex-col gap-3">
      <div className="relative aspect-square w-full rounded-2xl overflow-hidden bg-gray-100 dark:bg-gray-800 shadow-sm group-hover:shadow-md transition-all">
        {item.foto_principal ? (
          <img
            src={item.foto_principal}
            alt={item.titulo}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400">
             <span className="text-4xl">📷</span>
          </div>
        )}
        
        <button 
            className={`absolute top-2 right-2 flex items-center justify-center h-8 w-8 rounded-full backdrop-blur-md transition-all duration-200 shadow-sm ${
                liked 
                ? "bg-red-50 dark:bg-red-900/30 text-red-500 scale-110" 
                : "bg-white/70 dark:bg-black/40 text-gray-600 dark:text-gray-300 hover:bg-white dark:hover:bg-black/60"
            }`}
            onClick={handleToggleLike}
            disabled={loadingLike}
        >
            <svg 
                className={`w-5 h-5 transition-transform duration-200 ${liked ? "fill-current" : "fill-none"}`} 
                viewBox="0 0 24 24" 
                stroke="currentColor"
            >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
        </button>
      </div>

      <div className="px-1">
        <h3 className="text-base font-medium leading-tight text-gray-900 dark:text-gray-100 line-clamp-1 group-hover:text-[#2ecc71] transition-colors">
            {item.titulo}
        </h3>
        <p className="text-[#2ecc71] text-sm font-bold mt-0.5">
            {item.valor_creditos} créditos verdes
        </p>

        <div className="flex items-center gap-2 mt-2">
           <div className="w-6 h-6 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center overflow-hidden">
              <span className="text-xs font-bold text-gray-500">
                 {item.vendedor_nombre?.charAt(0) || "U"}
              </span>
           </div>
           <p className="text-sm text-gray-500 dark:text-gray-400 font-normal truncate">
              {item.vendedor_nombre || "Usuario"} 
           </p>
        </div>
      </div>
    </Link>
  );
}