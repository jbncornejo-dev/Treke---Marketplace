import { Link } from "react-router-dom";

export default function Landing() {
  return (
    <div className="min-h-screen bg-[#f6f8f7] dark:bg-[#112117] text-[#34495e] dark:text-[#ecf0f1] font-sans transition-colors">

      <main className="w-full max-w-7xl mx-auto px-4 py-6 space-y-10">
        
        {/* --- HERO SECTION --- */}
        <div 
          className="relative flex min-h-[60vh] flex-col items-center justify-center gap-6 rounded-2xl p-8 text-center bg-cover bg-center bg-no-repeat shadow-xl overflow-hidden group"
          style={{
            backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.3) 0%, rgba(0, 0, 0, 0.7) 100%), url("https://images.unsplash.com/photo-1542601906990-b4d3fb7d5fa5?q=80&w=2613&auto=format&fit=crop")`
            // He puesto una imagen de parque/naturaleza real de Unsplash
          }}
        >
          {/* Contenido del Hero */}
          <div className="relative z-10 flex flex-col gap-4 max-w-2xl animate-fade-in-up">
            <h1 className="text-white text-5xl md:text-7xl font-bold leading-tight tracking-tighter drop-shadow-lg">
              TREKE
            </h1>
            <h2 className="text-gray-100 text-lg md:text-2xl font-medium leading-relaxed drop-shadow-md">
              Tu comunidad de trueque para un planeta más verde.
            </h2>
            
            {/* Botones de Acción */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center mt-4 w-full">
              <Link
                to="/register"
                className="flex items-center justify-center h-12 px-8 rounded-xl bg-[#2ecc71] text-white text-base font-bold tracking-wide shadow-lg hover:bg-[#27ae60] transform hover:scale-105 transition-all duration-200"
              >
                Únete a TREKE
              </Link>
              <Link
                to="/login"
                className="flex items-center justify-center h-12 px-8 rounded-xl bg-white/90 text-[#112117] text-base font-bold tracking-wide backdrop-blur-sm hover:bg-white transform hover:scale-105 transition-all duration-200"
              >
                Iniciar Sesión
              </Link>
            </div>
          </div>
        </div>

        {/* --- FEATURES GRID --- */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Card 1: Trueque */}
          <FeatureCard 
            icon={<SwapIcon />}
            title="Trueque"
            desc="Intercambia lo que no usas."
          />

          {/* Card 2: Créditos Verdes */}
          <FeatureCard 
            icon={<ForestIcon />}
            title="Créditos Verdes"
            desc="Gana por ser sostenible."
          />

          {/* Card 3: Impacto Ambiental */}
          <FeatureCard 
            icon={<WorldIcon />}
            title="Impacto Ambiental"
            desc="Reduce tu huella de carbono."
          />
        </div>

        {/* --- KPIs (Mantenemos tu sección de métricas pero con el nuevo estilo) --- */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4">
           {[
             { t: "Publicaciones", v: "120+" },
             { t: "Usuarios", v: "850" },
             { t: "Créditos", v: "5k" },
             { t: "CO₂ Ahorrado", v: "1.2T" },
           ].map((k, i) => (
             <div key={i} className="p-4 rounded-xl bg-white dark:bg-[#1a2e22] border border-gray-100 dark:border-gray-800 text-center shadow-sm">
               <p className="text-3xl font-bold text-[#2ecc71]">{k.v}</p>
               <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">{k.t}</p>
             </div>
           ))}
        </div>

      </main>
    </div>
  );
}

// --- Subcomponentes para mantener el código limpio ---

function FeatureCard({ icon, title, desc }: { icon: React.ReactNode, title: string, desc: string }) {
  return (
    <div className="flex flex-col items-center text-center p-8 gap-4 rounded-2xl bg-white dark:bg-[#1a2e22] border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-md transition-shadow">
      <div className="text-[#2ecc71] p-3 bg-[#e8f8f0] dark:bg-[#2ecc71]/10 rounded-full">
        {icon}
      </div>
      <div className="flex flex-col gap-2">
        <h3 className="text-[#112117] dark:text-[#ecf0f1] text-xl font-bold">{title}</h3>
        <p className="text-gray-500 dark:text-gray-400 font-medium">{desc}</p>
      </div>
    </div>
  );
}

// --- Iconos SVG (Reemplazo de Material Symbols para no depender de fuentes externas) ---

const SwapIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M8 3 4 7l4 4"/>
    <path d="M4 7h16"/>
    <path d="m16 21 4-4-4-4"/>
    <path d="M20 17H4"/>
  </svg>
);

const ForestIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 19V5"/>
    <path d="m5 19 2.55-7.65a2 2 0 0 1 3.8 0L13.9 19"/>
    <path d="m10.1 19 2.55-7.65a2 2 0 0 1 3.8 0L19 19"/>
    <path d="M2 19h20"/>
  </svg>
);

const WorldIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/>
    <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/>
    <path d="M2 12h20"/>
  </svg>
);