import { useState } from "react";
import { X, Star, Loader2, Send } from "lucide-react";
// Asegúrate de tener esta función en tu API (te la dejé en la respuesta anterior)
import { crearResenia } from "../api/resenias"; 

interface Props {
  targetUserId: number;
  onClose: () => void;
}

export default function CreateReviewModal({ targetUserId, onClose }: Props) {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (rating === 0) return alert("Debes seleccionar al menos 1 estrella.");

    setLoading(true);
    try {
      await crearResenia({
        destinatario_id: targetUserId,
        calificacion: rating,
        comentario: comment
      });
      alert("¡Gracias por tu opinión!");
      onClose();
    } catch (error: any) {
      alert("Error: " + error.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in">
      <div className="bg-white w-full max-w-sm rounded-2xl shadow-2xl p-6 relative animate-in zoom-in-95">
        
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
          <X size={20} />
        </button>

        <h3 className="text-lg font-bold text-center mb-2">Calificar Intercambio</h3>
        <p className="text-sm text-gray-500 text-center mb-6">¿Cómo fue tu experiencia con este usuario?</p>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Selector de Estrellas */}
          <div className="flex justify-center gap-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                className={`transition-transform hover:scale-110 ${rating >= star ? "text-amber-400" : "text-gray-200"}`}
              >
                <Star size={32} fill="currentColor" />
              </button>
            ))}
          </div>
          <p className="text-center text-xs font-bold text-amber-500 h-4">
            {rating > 0 ? ["Malo", "Regular", "Bueno", "Muy Bueno", "Excelente"][rating - 1] : ""}
          </p>

          {/* Comentario */}
          <textarea
            className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-100 outline-none resize-none"
            rows={3}
            placeholder="Escribe un comentario (opcional)..."
            value={comment}
            onChange={(e) => setComment(e.target.value)}
          />

          <button
            disabled={loading || rating === 0}
            className="w-full py-3 rounded-xl bg-gray-900 hover:bg-emerald-600 text-white font-bold shadow-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 size={18} className="animate-spin"/> : <Send size={18} />}
            Enviar Reseña
          </button>
        </form>
      </div>
    </div>
  );
}