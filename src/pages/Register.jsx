import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../api.js";

export default function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", phone: "", password: "" });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const set = (key) => (e) => setForm({ ...form, [key]: e.target.value });

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      // Registration does not log in automatically, so go to the login page.
      await api("/auth/register", { method: "POST", body: form });
      navigate("/login");
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="auth-page">
      <form className="card auth-card" onSubmit={handleSubmit}>
        <div className="brand brand-lg">PulseShip</div>
        <h1>Create your account</h1>
        <p className="muted">Start sending parcels in minutes.</p>

        {error && <div className="alert">{error}</div>}

        <label className="field">
          <span>Full name</span>
          <input required maxLength={100} value={form.name} onChange={set("name")} />
        </label>
        <label className="field">
          <span>Email</span>
          <input type="email" required value={form.email} onChange={set("email")} />
        </label>
        <label className="field">
          <span>Phone</span>
          <input required maxLength={30} value={form.phone} onChange={set("phone")} placeholder="+20 100 123 4567" />
        </label>
        <label className="field">
          <span>Password</span>
          <input type="password" required maxLength={128} value={form.password} onChange={set("password")} />
        </label>

        <button className="btn btn-primary btn-block" disabled={busy}>
          {busy ? "Creating..." : "Create account"}
        </button>
        <p className="muted center">
          Already have an account? <Link to="/login">Log in</Link>
        </p>
      </form>
    </div>
  );
}
