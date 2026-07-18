import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";

export default function Register() {
  const [form, setForm] = useState({ name: "", email: "", password: "", facility: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await api.post("/auth/register", form);
      login(res.data.user, res.data.token);
      navigate("/triage");
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-page">
      <h1>SahayakAI</h1>
      <p className="subtitle">Register as a health worker</p>
      <form onSubmit={handleSubmit} className="auth-form">
        <input placeholder="Full name" value={form.name} onChange={(e) => update("name", e.target.value)} required />
        <input type="email" placeholder="Email" value={form.email} onChange={(e) => update("email", e.target.value)} required />
        <input type="password" placeholder="Password" value={form.password} onChange={(e) => update("password", e.target.value)} required />
        <input placeholder="PHC / facility name (optional)" value={form.facility} onChange={(e) => update("facility", e.target.value)} />
        {error && <p className="error">{error}</p>}
        <button type="submit" disabled={loading}>{loading ? "Creating account..." : "Register"}</button>
      </form>
      <p>Already have an account? <Link to="/login">Sign in</Link></p>
    </div>
  );
}
