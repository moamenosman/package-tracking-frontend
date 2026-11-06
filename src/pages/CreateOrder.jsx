import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api, formatDate } from "../api.js";

const EMPTY = {
  pickup: "",
  recipientName: "",
  recipientPhone: "",
  dropoff: "",
  description: "",
  weight: "",
  deliveryTime: "",
  instructions: "",
};

export default function CreateOrder() {
  const navigate = useNavigate();
  const [form, setForm] = useState(EMPTY);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const set = (key) => (e) => setForm({ ...form, [key]: e.target.value });

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setBusy(true);

    // Body matches the "Create-order body" in the API contract.
    const body = {
      recipient: { name: form.recipientName, phone: form.recipientPhone },
      pickup: { address: form.pickup },
      dropoff: { address: form.dropoff },
      package: { description: form.description },
      // datetime-local has no timezone; toISOString() adds one (UTC).
      delivery_time: new Date(form.deliveryTime).toISOString(),
    };
    if (form.weight !== "") body.package.weight_kg = Number(form.weight);
    if (form.instructions.trim() !== "") body.delivery_instructions = form.instructions;

    try {
      const order = await api("/orders", { method: "POST", body });
      navigate(`/orders/${order.id}`);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="page-head">
        <span className="pill">Direct dispatch</span>
        <h1>Create New Shipment</h1>
        <p className="muted">Hand over your parcels quickly. Tell us where to pick up and where to deliver.</p>
      </div>

      {error && <div className="alert">{error}</div>}

      <div className="two-col">
        <div className="stack">
          {/* 1. Pickup */}
          <section className="card">
            <SectionTitle number="1" title="Pickup Location" subtitle="Where the courier collects the parcel" />
            <label className="field">
              <span>Pickup address</span>
              <input required maxLength={500} value={form.pickup} onChange={set("pickup")} placeholder="Main Cairo Boutique - Maadi St 9, Building 42, Floor 1" />
            </label>
          </section>

          {/* 2. Recipient */}
          <section className="card">
            <SectionTitle number="2" title="Recipient & Drop-Off" subtitle="Customer contact info and delivery address" />
            <div className="grid-2">
              <label className="field">
                <span>Customer full name</span>
                <input required maxLength={100} value={form.recipientName} onChange={set("recipientName")} placeholder="e.g. Salma Tariq Mansour" />
              </label>
              <label className="field">
                <span>Phone number</span>
                <input required maxLength={30} value={form.recipientPhone} onChange={set("recipientPhone")} placeholder="+20 102 984 5512" />
              </label>
            </div>
            <label className="field">
              <span>Drop-off address</span>
              <input required maxLength={500} value={form.dropoff} onChange={set("dropoff")} placeholder="e.g. 14 El Merghany Street, Heliopolis" />
            </label>
            <label className="field">
              <span>Courier delivery notes (optional)</span>
              <textarea rows={3} maxLength={1000} value={form.instructions} onChange={set("instructions")} placeholder="Ring buzzer #4 directly. Customer requested a call 15 minutes before arrival." />
            </label>
          </section>

          {/* 3. Package */}
          <section className="card">
            <SectionTitle number="3" title="Package Details" subtitle="What is being shipped and when it should arrive" />
            <label className="field">
              <span>Parcel description</span>
              <input required maxLength={1000} value={form.description} onChange={set("description")} placeholder="Summer linen midi dress (Beige, Size M) + gold buckle belt" />
            </label>
            <div className="grid-2">
              <label className="field">
                <span>Estimated weight (kg, optional)</span>
                <input type="number" min="0.01" step="any" value={form.weight} onChange={set("weight")} placeholder="0.8" />
              </label>
              <label className="field">
                <span>Delivery time</span>
                <input type="datetime-local" required value={form.deliveryTime} onChange={set("deliveryTime")} />
              </label>
            </div>
          </section>
        </div>

        {/* Summary column */}
        <aside className="stack summary">
          <section className="card">
            <div className="eyebrow">Shipment summary</div>
            <h2>Review & Create</h2>
            <dl className="summary-list">
              <div><dt>Recipient</dt><dd>{form.recipientName || "—"}</dd></div>
              <div><dt>Phone</dt><dd>{form.recipientPhone || "—"}</dd></div>
              <div><dt>Weight</dt><dd>{form.weight ? `${form.weight} kg` : "—"}</dd></div>
              <div>
                <dt>Delivery time</dt>
                <dd>{form.deliveryTime ? formatDate(new Date(form.deliveryTime).toISOString()) : "—"}</dd>
              </div>
            </dl>

            <button className="btn btn-primary btn-block" disabled={busy}>
              {busy ? "Creating..." : "Create Shipment"}
            </button>
            <button type="button" className="btn btn-soft btn-block" onClick={() => setForm(EMPTY)}>
              Reset Form
            </button>
          </section>

          <section className="card">
            <div className="eyebrow">Courier waybill preview</div>
            <div className="route">
              <div className="route-stop"><i className="dot dot-orange" /> <b>{form.pickup || "Pickup address"}</b></div>
              <div className="route-line" />
              <div className="route-stop"><i className="dot dot-green" /> <b>{form.dropoff || "Drop-off address"}</b></div>
            </div>
          </section>
        </aside>
      </div>
    </form>
  );
}

function SectionTitle({ number, title, subtitle }) {
  return (
    <div className="section-title">
      <div className="icon-box">{number}</div>
      <div>
        <h2>{title}</h2>
        <p className="muted small">{subtitle}</p>
      </div>
    </div>
  );
}
