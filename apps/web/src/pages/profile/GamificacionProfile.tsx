// apps/web/src/pages/profile/GamificacionProfile.tsx
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  Sparkles,
  Star,
  Trophy,
  Zap,
  Target,
  ListChecks,
  History,
} from "lucide-react";

import {
  fetchGamificacionActual,
  type GamificacionResumen,
  type HistorialPaginado,
  type LogroUsuario,
  type NivelAcelerador,
  type AccionAcelerador,
} from "../../api/gamificacion";
import { fetchPanel, type PanelResponse, getCurrentUserId } from "../../api/profile";
import AdsFooter from "../../components/AdsFooter";

export default function GamificacionProfile() {
  const [panel, setPanel] = useState<PanelResponse | null>(null);
  const [resumen, setResumen] = useState<GamificacionResumen | null>(null);
  const [historial, setHistorial] = useState<HistorialPaginado | null>(null);
  const [logros, setLogros] = useState<LogroUsuario[]>([]);
  const [niveles, setNiveles] = useState<NivelAcelerador[]>([]);
  const [acciones, setAcciones] = useState<AccionAcelerador[]>([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState<string>("");

  const usuarioId = getCurrentUserId();

  useEffect(() => {
    if (!usuarioId) {
      setMsg("Inicia sesión para ver tu progreso de puntos");
      setLoading(false);
      return;
    }

    (async () => {
      try {
        setLoading(true);
        const [panelData, gam] = await Promise.all([
          fetchPanel(usuarioId, { pubs_limit: 0, movs_limit: 0 }),
          fetchGamificacionActual({ page: 1, pageSize: 20 }),
        ]);

        setPanel(panelData);
        setResumen(gam.resumen);
        setHistorial(gam.historial);
        setLogros(gam.logros);
        setNiveles(gam.niveles);
        setAcciones(gam.acciones);
      } catch (e: any) {
        console.error(e);
        setMsg(e?.message || "No se pudo cargar la gamificación");
      } finally {
        setLoading(false);
      }
    })();
  }, [usuarioId]);

  const nombreUsuario = useMemo(() => {
    if (!panel) return "";
    return panel.usuario.full_name || panel.usuario.email.split("@")[0];
  }, [panel]);

  const avatar = panel?.usuario.foto;
  const nivelActual = resumen?.nivel_actual || null;
  const siguienteNivel = resumen?.siguiente_nivel || null;

  const progresoPorcentaje = useMemo(() => {
    if (!resumen || !nivelActual || !siguienteNivel) return 100;
    const base = Number(nivelActual.puntos_requeridos) || 0;
    const objetivo = Number(siguienteNivel.puntos_requeridos) || 0;
    const actual = Number(resumen.puntos_acumulados) || 0;

    if (objetivo <= base) return 100;

    const rango = objetivo - base;
    const progreso = Math.min(Math.max(actual - base, 0), rango);
    return Math.round((progreso / rango) * 100);
  }, [resumen, nivelActual, siguienteNivel]);

  // Loading
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950">
        <div className="flex flex-col items-center gap-3">
          <div className="animate-spin rounded-full h-9 w-9 border-2 border-violet-400 border-t-transparent" />
          <p className="text-violet-100/70 text-sm">
            Cargando puntos y logros...
          </p>
        </div>
      </div>
    );
  }

  // Error / no user
  if (msg) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-950 text-center px-4">
        <div className="bg-slate-900/80 border border-violet-500/30 rounded-2xl p-8 max-w-sm shadow-2xl shadow-violet-900/40">
          <p className="text-slate-100 mb-4 text-sm">{msg}</p>
          <Link
            to="/login"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-violet-500 text-white text-sm font-semibold hover:bg-violet-400 transition-all"
          >
            Iniciar sesión
          </Link>
        </div>
      </div>
    );
  }

  if (!panel || !resumen) return null;

  // Helpers para logros / acciones
  const logrosPorAccion = new Map<number, LogroUsuario>();
  logros.forEach((l) => logrosPorAccion.set(l.accion_id, l));

  const totalAcciones = acciones.length;
  const accionesCompletadas = logros.filter((l) => l.veces_realizada > 0).length;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 pb-24">
      {/* HEADER */}
      <div className="border-b border-violet-500/20 bg-gradient-to-b from-slate-950 via-slate-950 to-slate-900">
        <div className="max-w-5xl mx-auto px-4 py-4 md:py-8">
          {/* Back + title */}
          <div className="flex items-center justify-between mb-6">
            <Link
              to="/perfil"
              className="inline-flex items-center gap-2 text-xs text-slate-300 hover:text-white px-3 py-1.5 rounded-full bg-slate-900/80 border border-slate-700/70 hover:border-violet-500/50 transition-all"
            >
              <ArrowLeft size={14} />
              Volver al perfil
            </Link>
            <div className="flex items-center gap-2 text-xs text-violet-200/80">
              <Sparkles size={14} className="text-violet-400" />
              <span>Sistema de puntos y acelerador</span>
            </div>
          </div>

          {/* Top section */}
          <div className="flex flex-col md:flex-row md:items-start gap-6 md:gap-8">
            {/* Avatar + nivel badge */}
            <div className="relative mx-auto md:mx-0 shrink-0">
              <div className="w-28 h-28 md:w-32 md:h-32 rounded-full p-[3px] bg-gradient-to-tr from-violet-500 via-fuchsia-400 to-emerald-400 shadow-[0_0_40px_rgba(129,140,248,0.45)]">
                <div className="w-full h-full rounded-full bg-slate-950 border border-slate-700 overflow-hidden flex items-center justify-center">
                  {avatar ? (
                    <img
                      src={avatar}
                      alt="avatar"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-4xl font-bold uppercase text-violet-200">
                      {nombreUsuario.charAt(0)}
                    </span>
                  )}
                </div>
              </div>
              {nivelActual && (
                <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-slate-900 border border-violet-500/70 shadow-lg shadow-violet-900/40 flex items-center gap-1.5 text-[10px] font-semibold">
                  <Trophy size={12} className="text-amber-300" />
                  <span className="text-violet-100">
                    {nivelActual.nombre || "Nivel actual"}
                  </span>
                </div>
              )}
            </div>

            {/* Info usuario + resumen puntos */}
            <div className="flex-1 text-center md:text-left">
              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                <div>
                  <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-white mb-1">
                    {nombreUsuario}
                  </h1>
                  <p className="text-xs uppercase tracking-[0.2em] text-violet-300/80 mb-4">
                    Puntos, niveles y logros
                  </p>

                  <div className="flex flex-wrap gap-3 justify-center md:justify-start">
                    <BadgePill
                      icon={<Zap size={14} />}
                      label="Puntos actuales"
                      value={resumen.puntos_acumulados}
                      accent="violet"
                    />
                    <BadgePill
                      icon={<Star size={14} />}
                      label="Multiplicador"
                      value={
                        nivelActual
                          ? `${Number(
                              (nivelActual as any).multiplicador_bono ?? 0
                            ).toFixed(2)}x`
                          : "1.00x"
                      }
                      accent="amber"
                    />
                    <BadgePill
                      icon={<History size={14} />}
                      label="Últimos 30 días"
                      value={resumen.puntos_ultimos_30d}
                      accent="emerald"
                    />
                    <BadgePill
                      icon={<ListChecks size={14} />}
                      label="Logros únicos"
                      value={`${accionesCompletadas}/${totalAcciones}`}
                      accent="indigo"
                    />
                  </div>
                </div>

                {/* Resumen créditos/impacto mini */}
                <div className="bg-slate-900/80 border border-slate-700/70 rounded-2xl px-4 py-3 text-xs flex flex-col gap-2 shadow-lg shadow-slate-950/40 min-w-[210px]">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Créditos</span>
                    <span className="font-semibold text-emerald-300">
                      {Number(
                        panel.billetera?.saldo_disponible ?? 0
                      ).toLocaleString()}{" "}
                      Cr
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Intercambios</span>
                    <span className="font-semibold text-slate-100">
                      {Number(panel.metricas?.intercambios_totales ?? 0)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">CO₂ evitado</span>
                    <span className="font-semibold text-sky-300">
                      {Number(panel.impacto?.total_co2_evitado ?? 0)} kg
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-500 mt-1">
                    Tus acciones en el trueque se convierten en puntos, niveles
                    y bonos acelerados de créditos.
                  </p>
                </div>
              </div>

              {/* Barra de progreso nivel */}
              <div className="mt-6">
                <div className="flex items-center justify-between mb-2 text-[11px] text-slate-400">
                  <div className="flex items-center gap-2">
                    <Target size={13} className="text-violet-400" />
                    <span>
                      Progreso al siguiente nivel{" "}
                      {siguienteNivel ? `(${siguienteNivel.nombre})` : ""}
                    </span>
                  </div>
                  {resumen.puntos_para_siguiente != null &&
                    siguienteNivel && (
                      <span className="text-violet-200">
                        Faltan{" "}
                        <span className="font-semibold">
                          {resumen.puntos_para_siguiente}
                        </span>{" "}
                        pts
                      </span>
                    )}
                </div>
                <div className="w-full h-2.5 rounded-full bg-slate-800 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-violet-500 via-fuchsia-500 to-emerald-400 transition-all"
                    style={{ width: `${progresoPorcentaje}%` }}
                  />
                </div>
                <div className="flex justify-between text-[10px] text-slate-500 mt-1.5">
                  <span>
                    {nivelActual
                      ? `${nivelActual.puntos_requeridos} pts`
                      : "0 pts"}
                  </span>
                  {siguienteNivel && (
                    <span>{siguienteNivel.puntos_requeridos} pts</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CONTENIDO */}
      <div className="max-w-5xl mx-auto px-4 mt-8 space-y-8">
        {/* Sección: resumen + niveles */}
        <div className="grid grid-cols-1 lg:grid-cols-[1.5fr_minmax(0,1fr)] gap-6">
          {/* Tarjeta resumen puntos */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 md:p-6 shadow-2xl shadow-slate-950/60">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-sm font-semibold text-slate-100 flex items-center gap-2">
                  <Sparkles size={16} className="text-violet-300" />
                  Resumen de puntos
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  Visualiza tu avance total y cómo se han generado tus puntos.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4">
              <StatCard
                label="Puntos totales históricos"
                value={resumen.puntos_totales_historial}
                subtitle="Desde que comenzaste a usar Treke"
                tone="violet"
              />
              <StatCard
                label="Puntos actuales activos"
                value={resumen.puntos_acumulados}
                subtitle="Para determinar tu nivel y acelerador"
                tone="indigo"
              />
              <StatCard
                label="Puntos últimos 30 días"
                value={resumen.puntos_ultimos_30d}
                subtitle="Actividad reciente"
                tone="emerald"
              />
            </div>
          </div>

          {/* Tarjeta niveles */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 md:p-6 shadow-2xl shadow-slate-950/60">
            <div className="flex items-center gap-2 mb-4">
              <Trophy size={18} className="text-amber-300" />
              <h2 className="text-sm font-semibold text-slate-100">
                Niveles y aceleradores
              </h2>
            </div>
            <div className="space-y-3 max-h-[260px] overflow-y-auto pr-1">
              {niveles.map((n) => {
                const esActual = nivelActual && nivelActual.id === n.id;
                const esSiguiente =
                  siguienteNivel && siguienteNivel.id === n.id;

                // 👇 conversión segura del multiplicador
                const multiplicador = Number(
                  (n as any).multiplicador_bono ?? 0
                );

                return (
                  <div
                    key={n.id}
                    className={`flex items-center justify-between rounded-xl px-3 py-2.5 text-xs border ${
                      esActual
                        ? "border-violet-400 bg-violet-500/15"
                        : esSiguiente
                        ? "border-emerald-400/70 bg-emerald-500/10"
                        : "border-slate-800 bg-slate-900/60"
                    }`}
                  >
                    <div>
                      <p className="font-semibold text-slate-100 flex items-center gap-2">
                        {esActual && (
                          <span className="inline-block w-1.5 h-1.5 rounded-full bg-violet-400" />
                        )}
                        {esSiguiente && !esActual && (
                          <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-400" />
                        )}
                        {n.nombre_nivel}
                      </p>
                      <p className="text-slate-400 text-[11px] mt-0.5 line-clamp-2">
                        {n.descripcion}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-[11px] text-slate-400">
                        Requiere{" "}
                        <span className="font-semibold text-slate-100">
                          {n.puntos_requeridos} pts
                        </span>
                      </p>
                      <p className="text-[11px] text-violet-200/90">
                        x{multiplicador.toFixed(2)} en{" "}
                        <span className="font-semibold">bonos</span>
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Sección: logros y catálogo de acciones */}
        <div className="grid grid-cols-1 lg:grid-cols-[1.4fr_minmax(0,1.1fr)] gap-6">
          {/* Logros alcanzados */}
<div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 md:p-6 shadow-2xl shadow-slate-950/60">
  <div className="flex items-center justify-between mb-4">
    <div className="flex items-center gap-2">
      <ListChecks size={18} className="text-emerald-300" />
      <h2 className="text-sm font-semibold text-slate-100">
        Tus logros de puntos
      </h2>
    </div>
    <span className="text-[11px] text-slate-400">
      {/* Ej: 3 de 17 logros desbloqueados */}
      {accionesCompletadas} de {totalAcciones} logros desbloqueados
    </span>
  </div>

  {logros.length ? (
    <div className="space-y-3 max-h-[260px] overflow-y-auto pr-1">
      {logros.map((l) => {
        const veces = l.veces_realizada ?? 0;
        const acumulado = l.puntos_totales ?? 0;
        const completado = veces > 0;
        const vecesLabel =
          veces === 1 ? "1 vez" : `${veces} veces`;

        return (
          <div
            key={l.accion_id}
            className={`flex items-center justify-between rounded-xl px-3 py-2.5 text-xs border ${
              completado
                ? "border-emerald-400/70 bg-emerald-500/5"
                : "border-slate-800 bg-slate-900/70"
            }`}
          >
            <div>
              <p className="font-semibold text-slate-100">
                {l.nombre_accion}
              </p>
              <p className="text-[11px] text-slate-400">
                Categoría:{" "}
                {l.categoria_accion || "Sin categoría asignada"}
              </p>

              <p
                className={`text-[11px] mt-0.5 ${
                  completado ? "text-violet-200" : "text-slate-500"
                }`}
              >
                {completado
                  ? `${vecesLabel} • ${acumulado} pts acumulados`
                  : "Aún no has conseguido este logro"}
              </p>
            </div>

            <div className="text-right">
              <p className="text-[11px] text-emerald-300 font-semibold">
                +{l.puntos_otorgados} pts
              </p>
              {l.ultima_vez && completado && (
                <p className="text-[10px] text-slate-500 mt-1">
                  Última vez:{" "}
                  {new Date(l.ultima_vez).toLocaleDateString()}
                </p>
              )}
              <p
                className={`text-[10px] mt-1 ${
                  completado ? "text-emerald-300" : "text-slate-500"
                }`}
              >
                {completado ? "Desbloqueado" : "Pendiente"}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  ) : (
    <div className="text-center py-10 text-slate-400 text-sm">
      Todavía no tienes logros registrados.  
      <br />
      Empieza a interactuar con la plataforma para desbloquearlos.
    </div>
  )}
</div>


          {/* Catálogo de acciones que dan puntos */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 md:p-6 shadow-2xl shadow-slate-950/60">
            <div className="flex items-center gap-2 mb-4">
              <Zap size={18} className="text-fuchsia-300" />
              <h2 className="text-sm font-semibold text-slate-100">
                ¿Cómo ganar más puntos?
              </h2>
            </div>
            <div className="space-y-3 max-h-[260px] overflow-y-auto pr-1">
              {acciones.map((a) => {
                const logro = logrosPorAccion.get(a.id);
                const veces = logro?.veces_realizada ?? 0;
                const totalPts = logro?.puntos_totales ?? 0;

                return (
                  <div
                    key={a.id}
                    className={`rounded-xl px-3 py-2.5 text-xs border ${
                      veces > 0
                        ? "border-fuchsia-400/70 bg-fuchsia-500/10"
                        : "border-slate-800 bg-slate-900/60"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-semibold text-slate-100">
                          {a.nombre_accion}
                        </p>
                        <p className="text-[11px] text-slate-400 mt-0.5 line-clamp-2">
                          {a.descripcion}
                        </p>
                        <p className="text-[11px] text-slate-500 mt-1">
                          {a.categoria_accion
                            ? `Categoría: ${a.categoria_accion}`
                            : "Categoría general"}
                        </p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-[11px] text-emerald-300 font-semibold">
                          +{a.puntos_otorgados} pts
                        </p>
                        <p className="text-[10px] text-slate-500 mt-1">
                          Máx/día: {a.max_diario ?? 1}
                        </p>
                        {veces > 0 && (
                          <p className="text-[10px] text-fuchsia-200 mt-1">
                            Hecha {veces} vez/veces • {totalPts} pts
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
              {!acciones.length && (
                <p className="text-xs text-slate-500">
                  No hay acciones configuradas aún en el sistema.
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Sección: Historial de eventos de puntos */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 md:p-6 shadow-2xl shadow-slate-950/60">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <History size={18} className="text-sky-300" />
              <h2 className="text-sm font-semibold text-slate-100">
                Historial de puntos
              </h2>
            </div>
            <span className="text-[11px] text-slate-500">
              Mostrando {historial?.items.length ?? 0} eventos
            </span>
          </div>

          {historial && historial.items.length ? (
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="border-b border-slate-800 text-slate-400 uppercase">
                  <tr>
                    <th className="px-4 py-3">Fecha</th>
                    <th className="px-4 py-3">Acción</th>
                    <th className="px-4 py-3">Detalle</th>
                    <th className="px-4 py-3 text-right">Puntos</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80">
                  {historial.items.map((h) => (
                    <tr
                      key={h.id}
                      className="hover:bg-slate-900/80 transition-colors"
                    >
                      <td className="px-4 py-3 text-slate-300 whitespace-nowrap">
                        {new Date(h.fecha_evento).toLocaleDateString()}
                        <div className="text-[10px] text-slate-500">
                          {new Date(h.fecha_evento).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </div>
                      </td>
                      <td className="px-4 py-3 align-top">
                        <p className="font-semibold text-slate-100">
                          {h.nombre_accion}
                        </p>
                        <p className="text-[11px] text-slate-500">
                          Código: {h.codigo_accion}
                        </p>
                      </td>
                      <td className="px-4 py-3 align-top">
                        <p className="text-[11px] text-slate-400 max-w-xs line-clamp-2">
                          {h.descripcion || "Acción registrada en el sistema"}
                        </p>
                      </td>
                      <td className="px-4 py-3 text-right align-top">
                        <span className="inline-flex items-center justify-end text-[11px] font-semibold text-emerald-300">
                          +{h.puntos_ganados} pts
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {/* (Opcional) Paginación simple */}
            </div>
          ) : (
            <div className="py-10 text-center text-slate-400 text-sm">
              Todavía no hay historial de puntos registrado.
            </div>
          )}
        </div>
      </div>

      <AdsFooter ubicacion="perfil" />
    </div>
  );
}

// --- Subcomponentes internos ---

function BadgePill({
  icon,
  label,
  value,
  accent,
}: {
  icon: React.ReactNode;
  label: string;
  value: number | string;
  accent: "violet" | "amber" | "emerald" | "indigo";
}) {
  const map: Record<string, string> = {
    violet: "bg-violet-500/15 text-violet-100 border-violet-400/50",
    amber: "bg-amber-500/15 text-amber-100 border-amber-400/60",
    emerald: "bg-emerald-500/15 text-emerald-100 border-emerald-400/60",
    indigo: "bg-indigo-500/15 text-indigo-100 border-indigo-400/60",
  };

  return (
    <div
      className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border text-[11px] ${map[accent]}`}
    >
      {icon}
      <span className="uppercase tracking-[0.15em]">{label}</span>
      <span className="font-semibold text-xs">{value}</span>
    </div>
  );
}

function StatCard({
  label,
  value,
  subtitle,
  tone,
}: {
  label: string;
  value: number | string;
  subtitle?: string;
  tone: "violet" | "indigo" | "emerald";
}) {
  const map: Record<string, string> = {
    violet: "from-violet-500/40 via-fuchsia-500/30 to-slate-900",
    indigo: "from-indigo-500/40 via-sky-500/25 to-slate-900",
    emerald: "from-emerald-500/35 via-teal-500/25 to-slate-900",
  };

  const numericValue = Number(value ?? 0);

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900 overflow-hidden">
      <div className={`bg-gradient-to-br ${map[tone]} px-4 py-3`}>
        <p className="text-[11px] text-slate-200/80 uppercase tracking-[0.18em]">
          {label}
        </p>
        <p className="text-xl font-bold text-white mt-1">
          {numericValue.toLocaleString()} pts
        </p>
      </div>
      {subtitle && (
        <div className="px-4 py-2 text-[11px] text-slate-400">{subtitle}</div>
      )}
    </div>
  );
}
