import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { homePath, useAuth } from "../AuthContext.jsx";

export default function Login() {
  const { user, loading, login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  if (!loading && user) return <Navigate to={homePath(user.role)} replace />;

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      const account = await login(email, password);
      navigate(homePath(account.role));
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
        <h1>Welcome back</h1>
        <p className="muted">Log in to create and track your shipments.</p>

        {error && <div className="alert">{error}</div>}

        <label className="field">
          <span>Email</span>
          <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />
        </label>
        <label className="field">
          <span>Password</span>
          <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} />
        </label>

        <button className="btn btn-primary btn-block" disabled={busy}>
          {busy ? "Logging in..." : "Log in"}
        </button>
        <p className="muted center">
          New merchant? <Link to="/register">Create an account</Link>
        </p>
      </form>
    </div>
  );
}
