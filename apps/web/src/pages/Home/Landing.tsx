import { Link } from "react-router-dom";
import Header from "../../components/Header";
import Card from "../../components/Card";


export default function Landing() {
  return (
    <div className="min-h-dvh bg-neutral-50 text-neutral-900 dark:bg-neutral-950 dark:text-neutral-100 transition-colors">

      <Header title="Bienvenido a TREKE" />
      <main className="mx-auto max-w-7xl px-4 py-8 space-y-8">
        {/* Hero */}
        <section className="grid gap-6 md:grid-cols-2 items-center">
          <div className="space-y-4">
            <h2 className="text-2xl md:text-4xl font-bold tracking-tight">
              Trueque con{" "}
              <span className="text-green-600 dark:text-green-400">créditos verdes</span>
            </h2>
            <p className="text-neutral-600 dark:text-neutral-300 md:text-lg">
              Publica, intercambia y gana recompensas cuidando el planeta.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <Link
                to="/marketplace"
                className="inline-flex items-center rounded-xl bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700"
              >
                Explorar Marketplace
              </Link>
              <Link
                to="/auth"
                className="inline-flex items-center rounded-xl border px-4 py-2 text-sm
                           border-neutral-300 dark:border-neutral-800
                           text-neutral-800 dark:text-neutral-200
                           hover:bg-neutral-100 dark:hover:bg-neutral-900"
              >
                Crear cuenta
              </Link>
            </div>
          </div>

          <Card className="p-0 overflow-hidden bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800">
            <img
              className="w-full h-64 md:h-[360px] object-cover"
              src="https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?q=80&w=1600&auto=format&fit=crop"
              alt="Hero"
            />
          </Card>
        </section>

        {/* KPIs / beneficios */}
        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { t: "Publicaciones activas", v: "-" },
            { t: "Usuarios verificados", v: "-" },
            { t: "Créditos otorgados", v: "-" },
            { t: "CO₂ evitado", v: "-" },
          ].map((k) => (
            <Card
              key={k.t}
              className="p-5 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800"
            >
              <p className="text-sm text-neutral-600 dark:text-neutral-400">{k.t}</p>
              <p className="mt-1 text-2xl font-semibold text-neutral-900 dark:text-neutral-100">
                {k.v}
              </p>
            </Card>
          ))}
        </section>
      </main>
    </div>
  );
}
