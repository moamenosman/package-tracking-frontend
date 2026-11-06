import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { api, formatDate } from "../api.js";
import { useAuth } from "../AuthContext.jsx";
import StatusBadge from "../components/StatusBadge.jsx";

// Allowed delivery-status transitions (same as the backend).
const NEXT_STATUS = { PENDING: "PICKED_UP", PICKED_UP: "IN_TRANSIT", IN_TRANSIT: "DELIVERED" };
const CANCELLABLE = ["PENDING", "PICKED_UP", "IN_TRANSIT"];

export default function OrderDetails() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [order, setOrder] = useState(null);
  const [couriers, setCouriers] = useState([]);
  const [selectedCourier, setSelectedCourier] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  function load() {
    return api(`/orders/${id}`).then(setOrder).catch((err) => setError(err.message));
  }

  useEffect(() => {
    load();
  }, [id]);

  // Admin needs the courier list for the assignment dropdown.
  useEffect(() => {
    if (user.role === "admin") {
      api("/couriers?page=1&page_size=100")
        .then((data) => setCouriers(data.items))
        .catch((err) => setError(err.message));
    }
  }, [user.role]);

  // Runs an action, shows errors, and refreshes the order after a 409 (see API contract).
  async function run(action, { after } = {}) {
    setError("");
    setBusy(true);
    try {
      const result = await action();
      if (after) after();
      else setOrder(result);
    } catch (err) {
      setError(err.message);
      if (err.status === 409) load();
    } finally {
      setBusy(false);
    }
  }

  if (!order) return error ? <div className="alert">{error}</div> : <p className="muted">Loading...</p>;

  const isOwner = user.role === "user";
  const isCourier = user.role === "courier";
  const isAdmin = user.role === "admin";
  const next = NEXT_STATUS[order.delivery_status];
  const pending = order.delivery_status === "PENDING";
  const hasActiveCourier = order.courier_id !== null && order.assignment_state !== "UNASSIGNED";

  return (
    <div>
      <div className="page-head">
        <h1>Shipment Details</h1>
        <p className="muted small">Order ID: {order.id}</p>
      </div>

      {error && <div className="alert">{error}</div>}

      <div className="two-col">
        <div className="stack">
          <section className="card">
            <h2>Route</h2>
            <div className="route">
              <div className="route-stop"><i className="dot dot-orange" /> <div><div className="small muted">Pickup</div><b>{order.pickup.address}</b></div></div>
              <div className="route-line" />
              <div className="route-stop"><i className="dot dot-green" /> <div><div className="small muted">Drop-off</div><b>{order.dropoff.address}</b></div></div>
            </div>
          </section>

          <section className="card">
            <h2>Recipient & Package</h2>
            <dl className="summary-list">
              <div><dt>Recipient</dt><dd>{order.recipient.name}</dd></div>
              <div><dt>Phone</dt><dd>{order.recipient.phone}</dd></div>
              <div><dt>Package</dt><dd>{order.package.description}</dd></div>
              <div><dt>Weight</dt><dd>{order.package.weight_kg ? `${order.package.weight_kg} kg` : "—"}</dd></div>
              <div><dt>Delivery time</dt><dd>{formatDate(order.delivery_time)}</dd></div>
              <div><dt>Notes</dt><dd>{order.delivery_instructions || "—"}</dd></div>
            </dl>
          </section>

          <section className="card">
            <h2>Status History</h2>
            <ul className="timeline">
              {order.status_history.map((entry, i) => (
                <li key={i}>
                  <StatusBadge value={entry.to_status} />
                  <span className="muted small">{formatDate(entry.changed_at)}</span>
                </li>
              ))}
            </ul>
            {order.assignment_history.length > 0 && (
              <>
                <h2 className="mt">Assignment History</h2>
                <ul className="timeline">
                  {order.assignment_history.map((entry, i) => (
                    <li key={i}>
                      <b className="capitalize">{entry.action}</b>
                      <span className="muted small">{formatDate(entry.changed_at)}</span>
                    </li>
                  ))}
                </ul>
              </>
            )}
          </section>
        </div>

        <aside className="stack summary">
          <section className="card">
            <div className="eyebrow">Current state</div>
            <div className="badge-row">
              <StatusBadge value={order.delivery_status} />
              <StatusBadge value={order.assignment_state} />
            </div>
            <dl className="summary-list">
              <div><dt>Courier</dt><dd>{order.courier ? order.courier.name : "Not assigned"}</dd></div>
              {order.courier && <div><dt>Courier phone</dt><dd>{order.courier.phone}</dd></div>}
              <div><dt>Created</dt><dd>{formatDate(order.created_at)}</dd></div>
            </dl>
          </section>

          {/* Actions depend on role and order state */}
          <section className="card">
            <div className="eyebrow">Actions</div>

            {isAdmin && pending && (
              <div className="field">
                <span>{order.courier_id ? "Reassign courier" : "Assign courier"}</span>
                <select value={selectedCourier} onChange={(e) => setSelectedCourier(e.target.value)}>
                  <option value="">Select a courier...</option>
                  {couriers.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
                <button
                  type="button"
                  className="btn btn-soft btn-block"
                  disabled={busy || !selectedCourier}
                  onClick={() => run(() => api(`/orders/${id}/assignment`, { method: "PATCH", body: { courier_id: selectedCourier } }))}
                >
                  Assign
                </button>
              </div>
            )}

            {isCourier && pending && order.assignment_state === "OFFERED" && (
              <button type="button" className="btn btn-primary btn-block" disabled={busy}
                onClick={() => run(() => api(`/orders/${id}/accept`, { method: "POST" }))}>
                Accept Assignment
              </button>
            )}
            {isCourier && pending && ["OFFERED", "ACCEPTED"].includes(order.assignment_state) && (
              <button type="button" className="btn btn-soft btn-block" disabled={busy}
                onClick={() => run(() => api(`/orders/${id}/decline`, { method: "POST" }), { after: () => navigate("/assigned") })}>
                Decline Assignment
              </button>
            )}

            {(isCourier || isAdmin) && next && hasActiveCourier && (
              <button type="button" className="btn btn-primary btn-block" disabled={busy}
                onClick={() => run(() => api(`/orders/${id}/status`, { method: "PATCH", body: { delivery_status: next } }))}>
                Mark as {next.replace("_", " ").toLowerCase()}
              </button>
            )}

            {isOwner && CANCELLABLE.includes(order.delivery_status) && (
              <button type="button" className="btn btn-danger btn-block" disabled={busy}
                onClick={() => window.confirm("Cancel this shipment?") && run(() => api(`/orders/${id}/cancel`, { method: "POST" }))}>
                Cancel Shipment
              </button>
            )}

            {isAdmin && (
              <button type="button" className="btn btn-danger btn-block" disabled={busy}
                onClick={() => window.confirm("Delete this shipment?") && run(() => api(`/orders/${id}`, { method: "DELETE" }), { after: () => navigate("/admin/orders") })}>
                Delete Shipment
              </button>
            )}

            <button type="button" className="btn btn-soft btn-block" onClick={() => navigate(-1)}>
              Back
            </button>
          </section>
        </aside>
      </div>
    </div>
  );
}
