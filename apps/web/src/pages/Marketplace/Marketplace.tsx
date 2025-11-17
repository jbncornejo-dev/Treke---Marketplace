import { useEffect, useMemo, useState } from "react";
import Header from "../../components/Header";
import { list, type MarketItem, type MarketListResp } from "../../api/market";
import { useNavigate } from "react-router-dom";



type SortKey = "recent" | "price_asc" | "price_desc" | "near";

export default function Marketplace() {
  const [q, setQ] = useState("");
  const [categoriaId, setCategoriaId] = useState<number | null>(null);
  const [minCred, setMinCred] = useState<number | null>(null);
  const [maxCred, setMaxCred] = useState<number | null>(null);
  const [sort, setSort] = useState<SortKey>("recent");
  const navigate = useNavigate();

  const [items, setItems] = useState<MarketItem[]>([]);
  const [page, setPage] = useState<{ total: number; limit: number; offset: number; has_more: boolean }>({ total: 0, limit: 12, offset: 0, has_more: false });
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");

  async function fetchData(offset = 0) {
    setLoading(true); setMsg("");
    try {
      const resp: MarketListResp = await list({
        q, categoria_id: categoriaId, min_cred: minCred, max_cred: maxCred,
        sort, limit: 12, offset
      });
      if (offset === 0) {
        setItems(resp.items);
      } else {
        setItems(prev => [...prev, ...resp.items]);
      }
      setPage(resp.page);
    } catch (e:any) {
      setMsg(e?.message || "No se pudo cargar el marketplace");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { fetchData(0); /* eslint-disable-next-line */ }, [q, categoriaId, minCred, maxCred, sort]);

  const total = page.total;

  return (
    <div className="min-h-dvh bg-neutral-950 text-neutral-100">
      <Header title="Marketplace" />
      <main className="mx-auto max-w-6xl p-4 space-y-4">
        <div className="flex justify-end">
          <button
            onClick={() => navigate("/market/nueva")}
            className="mb-2 rounded-xl bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-500"
          >
          Crear publicación
          </button>
        </div>

        {/* Filtros */}
        <div className="rounded-2xl border border-neutral-800 p-3 grid md:grid-cols-5 gap-2">
          <input
            className="rounded-xl bg-neutral-900/60 px-3 py-2 md:col-span-2"
            placeholder="Buscar por título o descripción…"
            value={q} onChange={e=>setQ(e.target.value)}
          />
          <select className="rounded-xl bg-neutral-900/60 px-3 py-2"
            value={categoriaId ?? ""} onChange={e=>setCategoriaId(e.target.value ? Number(e.target.value) : null)}>
            <option value="">Categorías</option>
            {/* si tienes categorías precargadas, mapéalas; de momento placeholders */}
            <option value="1">Electrónica</option>
            <option value="2">Hogar</option>
          </select>
          <input className="rounded-xl bg-neutral-900/60 px-3 py-2" type="number" placeholder="Créditos mín."
            value={minCred ?? ""} onChange={e=>setMinCred(e.target.value ? Number(e.target.value) : null)} />
          <input className="rounded-xl bg-neutral-900/60 px-3 py-2" type="number" placeholder="Créditos máx."
            value={maxCred ?? ""} onChange={e=>setMaxCred(e.target.value ? Number(e.target.value) : null)} />
          <select className="rounded-xl bg-neutral-900/60 px-3 py-2"
            value={sort} onChange={e=>setSort(e.target.value as SortKey)}>
            <option value="recent">Más recientes</option>
            <option value="price_asc">Precio ↑</option>
            <option value="price_desc">Precio ↓</option>
            <option value="near">Cerca de mí</option>
          </select>
          <button className="rounded-xl border border-neutral-700 px-3 py-2" onClick={()=>fetchData(0)}>Aplicar</button>
        </div>

        {/* Mensaje */}
        {msg && <div className="rounded-lg border border-red-600 p-3">{msg}</div>}

        {/* Grid */}
        <div className="grid grid-cols-[repeat(auto-fit,minmax(190px,1fr))] gap-4">
          {items.map(item => <Card key={item.id} item={item} />)}
        </div>

        {/* Paginación */}
        <div className="flex justify-center py-4">
          {loading ? <span>Cargando…</span> : page.has_more && (
            <button className="rounded-xl border border-neutral-700 px-4 py-2" onClick={()=>fetchData(page.offset + page.limit)}>
              Ver más
            </button>
          )}
        </div>

        {/* Resumen */}
        <div className="text-sm text-neutral-400">{items.length} de {total} resultados</div>
      </main>
    </div>
  );
}

function Card({ item }: { item: MarketItem }) {
  return (
    <a href={`/market/${item.id}`} className="rounded-xl border border-neutral-800 overflow-hidden hover:border-emerald-700 transition-colors">
      <div className="aspect-square bg-neutral-900">
        {item.foto_principal
          ? <img src={item.foto_principal} alt={item.titulo} className="w-full h-full object-cover" />
          : <div className="w-full h-full flex items-center justify-center opacity-60">Sin foto</div>
        }
      </div>
      <div className="p-3">
        <p className="font-semibold line-clamp-1">{item.titulo}</p>
        <p className="text-emerald-400 font-semibold">{item.valor_creditos} créditos</p>
        <p className="text-xs text-neutral-400 line-clamp-1">{item.categoria} • {item.estado_nombre}</p>
        {item.vendedor_nombre && <p className="text-xs text-neutral-400">Vendedor: {item.vendedor_nombre}</p>}
        {item.distancia_km != null && <p className="text-xs text-neutral-500">{item.distancia_km.toFixed(1)} km</p>}
      </div>
    </a>
  );
}
