import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom'; // Importamos Link para la navegación
import { 
  Leaf, 
  ArrowRight, 
  ShieldCheck, 
  Users, 
  Recycle, 
  Menu, 
  X
} from 'lucide-react';

const TrekeLanding = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Efecto para el cambio de estilo en el Navbar al hacer scroll
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-white font-sans text-gray-900 selection:bg-emerald-100 selection:text-emerald-900">
      
      {/* --- 1. NAVBAR --- */}
      <nav className={`fixed w-full z-50 transition-all duration-500 ${scrolled ? 'bg-white/80 backdrop-blur-md border-b border-gray-100 py-4' : 'bg-transparent py-6'}`}>
        <div className="container mx-auto px-6 md:px-12 flex justify-between items-center">
          
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="bg-emerald-600 w-8 h-8 rounded-full flex items-center justify-center text-white transition-transform group-hover:scale-110">
              <Leaf size={16} fill="currentColor" />
            </div>
            <span className="text-xl font-semibold tracking-tight text-gray-900">Treke.</span>
          </Link>

          {/* Acciones Desktop (Con Links funcionales) */}
          <div className="hidden md:flex items-center gap-6">
            <Link 
              to="/login" 
              className="text-sm font-medium text-gray-500 hover:text-emerald-700 transition-colors"
            >
              Iniciar Sesión
            </Link>
            <Link 
              to="/register" 
              className="bg-gray-900 hover:bg-emerald-700 text-white px-6 py-2.5 rounded-full text-sm font-medium transition-all duration-300 shadow-sm hover:shadow-emerald-200/50"
            >
              Crear Cuenta
            </Link>
          </div>

          {/* Botón Menú Móvil */}
          <button className="md:hidden text-gray-900" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Menú Móvil Desplegable */}
        {isMenuOpen && (
          <div className="md:hidden absolute top-full left-0 w-full bg-white border-b border-gray-100 p-6 flex flex-col gap-4 shadow-lg animate-in slide-in-from-top-5">
            <Link 
              to="/login" 
              onClick={() => setIsMenuOpen(false)}
              className="w-full text-left py-2 font-medium text-gray-600 hover:text-emerald-600"
            >
              Iniciar Sesión
            </Link>
            <Link 
              to="/register" 
              onClick={() => setIsMenuOpen(false)}
              className="w-full bg-gray-900 text-white py-3 rounded-lg font-medium text-center hover:bg-emerald-700"
            >
              Crear Cuenta
            </Link>
          </div>
        )}
      </nav>

      {/* --- 2. HERO SECTION --- */}
      <section className="pt-32 pb-20 md:pt-48 md:pb-32 relative overflow-hidden">
        {/* Decoración de fondo sutil */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[500px] bg-radial-gradient from-emerald-50/50 to-transparent -z-10 pointer-events-none" />

        <div className="container mx-auto px-6 md:px-12">
          <div className="max-w-4xl mx-auto text-center">
            
            {/* Etiqueta */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-semibold tracking-wide mb-8 border border-emerald-100">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              ECONOMÍA CIRCULAR DIGITAL
            </div>

            {/* Título */}
            <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-gray-900 mb-6 leading-[1.1]">
              Dale valor real a <br className="hidden md:block" />
              lo que ya no usas.
            </h1>

            {/* Descripción */}
            <p className="text-xl text-gray-500 mb-10 max-w-xl mx-auto leading-relaxed font-light">
              Intercambia bienes y servicios usando <span className="text-emerald-600 font-medium">Créditos Verdes</span>. Sin dinero, solo impacto positivo.
            </p>

            {/* CTAs Principales */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link 
                to="/register" 
                className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-4 rounded-full font-medium text-lg transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/20 hover:-translate-y-1"
              >
                Únete a la comunidad
                <ArrowRight size={18} />
              </Link>
              
              <button 
                onClick={() => document.getElementById('como-funciona')?.scrollIntoView({ behavior: 'smooth' })}
                className="w-full sm:w-auto text-gray-600 hover:text-gray-900 px-8 py-4 rounded-full font-medium text-lg transition-all border border-transparent hover:bg-gray-50"
              >
                Cómo funciona
              </button>
            </div>
          </div>

          {/* Imagen / Arte Visual */}
          <div className="mt-20 relative max-w-5xl mx-auto">
            <div className="aspect-21/9 bg-stone-100 rounded-3xl overflow-hidden relative border border-stone-200 shadow-2xl shadow-gray-200/50">
               {/* Imagen de fondo */}
               <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-full h-full bg-[url('https://images.unsplash.com/photo-1593113598332-cd288d649433?auto=format&fit=crop&q=80&w=2000')] bg-cover bg-center opacity-90 transition-transform duration-[10s] hover:scale-105"></div>
                  {/* Gradiente sutil para legibilidad */}
                  <div className="absolute inset-0 bg-linear-to-t from-white/10 to-transparent"></div>
               </div>
               
               {/* UI Flotante: Tarjeta de ejemplo */}
               <div className="absolute bottom-6 left-6 right-6 md:left-auto md:right-12 bg-white/95 backdrop-blur-sm p-5 rounded-2xl shadow-lg border border-white/50 md:max-w-sm animate-in slide-in-from-bottom-10 fade-in duration-1000">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Último intercambio</span>
                    <span className="text-emerald-600 text-xs font-bold bg-emerald-50 px-2 py-1 rounded-full border border-emerald-100">+50 Créditos</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-full bg-gray-200 overflow-hidden ring-2 ring-white">
                        <img src="https://i.pravatar.cc/100?img=33" alt="Usuario" className="h-full w-full object-cover" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900 leading-tight">Marta cambió <span className="text-gray-500">Libros</span></p>
                      <p className="text-sm font-medium text-gray-900 leading-tight">por <span className="text-gray-500">Clases de Piano</span></p>
                    </div>
                  </div>
               </div>
            </div>
          </div>
        </div>
      </section>

      {/* --- 3. INDICADORES (KPIs) --- */}
      <section className="py-16 border-y border-gray-100 bg-gray-50/50">
        <div className="container mx-auto px-6 md:px-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-center md:text-left divide-y md:divide-y-0 md:divide-x divide-gray-200">
            
            <div className="px-6 py-4 md:py-0">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Comunidad Activa</p>
              <div className="flex items-baseline gap-2 justify-center md:justify-start">
                <span className="text-4xl font-light text-gray-900">15.2k</span>
                <span className="text-emerald-600 font-medium text-sm">Créditos Generados</span>
              </div>
            </div>

            <div className="px-6 py-4 md:py-0">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Economía Circular</p>
              <div className="flex items-baseline gap-2 justify-center md:justify-start">
                <span className="text-4xl font-light text-gray-900">2,450</span>
                <span className="text-emerald-600 font-medium text-sm">Trueques Completados</span>
              </div>
            </div>

            <div className="px-6 py-4 md:py-0">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Planeta</p>
              <div className="flex items-baseline gap-2 justify-center md:justify-start">
                <span className="text-4xl font-light text-gray-900">800kg</span>
                <span className="text-emerald-600 font-medium text-sm">CO₂ Ahorrado</span>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* --- 4. BENEFICIOS --- */}
      <section id="como-funciona" className="py-24 md:py-32 bg-white">
        <div className="container mx-auto px-6 md:px-12">
          <div className="grid md:grid-cols-3 gap-16">
            
            <BenefitItem 
              icon={<ShieldCheck size={24} strokeWidth={1.5} />}
              title="Seguridad y Trazabilidad"
              desc="Cada intercambio se registra en una bitácora inmutable. Olvídate de la informalidad; aquí las reglas son claras y seguras."
            />

            <BenefitItem 
              icon={<Recycle size={24} strokeWidth={1.5} />}
              title="Sostenibilidad Real"
              desc="Reutilizar es mejor que reciclar. Extendemos la vida útil de los objetos reduciendo la necesidad de nueva producción."
            />

            <BenefitItem 
              icon={<Users size={24} strokeWidth={1.5} />}
              title="Impacto Comunitario"
              desc="Monetiza tus habilidades o bienes sin depender del dinero. Las ONGs y emprendedores fortalecen el tejido social."
            />

          </div>
        </div>
      </section>

      {/* --- 5. FOOTER --- */}
      <footer className="py-12 border-t border-gray-100 bg-gray-50">
        <div className="container mx-auto px-6 md:px-12 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2 opacity-60 grayscale hover:grayscale-0 hover:opacity-100 transition-all cursor-pointer">
            <Leaf size={20} className="text-emerald-600" />
            <span className="font-semibold text-gray-900">Treke Inc.</span>
          </div>
          
          <div className="flex gap-8 text-sm text-gray-500">
            <button className="hover:text-gray-900 transition-colors">Términos</button>
            <button className="hover:text-gray-900 transition-colors">Privacidad</button>
            <button className="hover:text-gray-900 transition-colors">Ayuda</button>
          </div>

          <p className="text-sm text-gray-400">© 2025 Treke Marketplace</p>
        </div>
      </footer>
    </div>
  );
};

// Componente auxiliar para los beneficios (limpieza de código)
const BenefitItem = ({ icon, title, desc }: { icon: React.ReactNode; title: string; desc: string }) => (
  <div className="space-y-4 group">
    <div className="w-12 h-12 bg-stone-100 rounded-2xl flex items-center justify-center text-gray-900 group-hover:bg-emerald-600 group-hover:text-white transition-all duration-300 group-hover:scale-110 group-hover:shadow-lg group-hover:shadow-emerald-200">
      {icon}
    </div>
    <h3 className="text-xl font-semibold text-gray-900">{title}</h3>
    <p className="text-gray-500 leading-relaxed font-light">
      {desc}
    </p>
  </div>
);

export default TrekeLanding;