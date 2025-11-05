import { useState } from "react";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert(`Login demo:\n${email}\n${password}`);
    // aquí luego llamarías a tu API: fetch/axios -> /api/auth/login
  };

  return (
    <div className="page">
      <div className="card form-card">
        <h2>Entrar a TREKE</h2>
        <form onSubmit={onSubmit} className="form">
          <label>Email</label>
          <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="tu@mail.com" />
          <label>Contraseña</label>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" />
          <button className="btn btn-primary" type="submit">Entrar</button>
        </form>
      </div>
    </div>
  );
}
