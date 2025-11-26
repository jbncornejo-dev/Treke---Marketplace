import { useEffect } from "react";

export default function ThemeToggle() {
  // Mantenemos esta lógica para que la app detecte si el usuario
  // prefiere modo oscuro o claro en su sistema operativo al entrar.
  useEffect(() => {
    const root = document.documentElement;
    const saved = localStorage.getItem("treke_theme");
    const desired =
      saved === "dark" || saved === "light"
        ? saved
        : window.matchMedia?.("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light";
        
    root.classList.toggle("dark", desired === "dark");
  }, []);

  // Al retornar null, el componente existe pero no pinta nada en la pantalla.
  return null;
}
