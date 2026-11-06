import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api, formatDate } from "../api.js";
import StatusBadge from "../components/StatusBadge.jsx";

// One list page for the three list endpoints in the API contract.
const MODES = {
  mine: { path: "/orders/mine", title: "My Orders", subtitle: "Every shipment you have created." },
  assigned: { path: "/orders/assigned", title: "Assigned Deliveries", subtitle: "Shipments offered to or accepted by you." },
  all: { path: "/orders", title: "Manage All Shipments", subtitle: "Open a shipment to assign a courier, update its status or delete it." },
};

const PAGE_SIZE = 10;

export default function OrderList({ mode }) {
  const config = MODES[mode];
  const [page, setPage] = useState(1);
  const [data, setData] = useState(null);
  const [error, setError] = useState("");

  // Go back to page 1 when switching between list types.
  useEffect(() => setPage(1), [mode]);

  useEffect(() => {
    setData(null);
    setError("");
    api(`${config.path}?page=${page}&page_size=${PAGE_SIZE}`)
      .then(setData)
      .catch((err) => setError(err.message));
  }, [config.path, page]);

  const totalPages = data ? Math.max(1, Math.ceil(data.total / data.page_size)) : 1;

  return (
    <div>
      <div className="page-head">
        <h1>{config.title}</h1>
        <p className="muted">{config.subtitle}</p>
      </div>

      {error && <div className="alert">{error}</div>}
      {!data && !error && <p className="muted">Loading...</p>}

      {data && data.items.length === 0 && <div className="card muted">No shipments yet.</div>}

      {data && data.items.length > 0 && (
        <div className="card table-card">
          <table>
            <thead>
              <tr>
                <th>Recipient</th>
                <th>Drop-off</th>
                <th>Delivery time</th>
                <th>Status</th>
                <th>Assignment</th>
                <th>Courier</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {data.items.map((order) => (
                <tr key={order.id}>
                  <td><b>{order.recipient.name}</b></td>
                  <td>{order.dropoff.address}</td>
                  <td>{formatDate(order.delivery_time)}</td>
                  <td><StatusBadge value={order.delivery_status} /></td>
                  <td><StatusBadge value={order.assignment_state} /></td>
                  <td>{order.courier ? order.courier.name : "—"}</td>
                  <td><Link className="link" to={`/orders/${order.id}`}>View</Link></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {data && data.total > PAGE_SIZE && (
        <div className="pager">
          <button className="btn btn-soft" disabled={page <= 1} onClick={() => setPage(page - 1)}>Previous</button>
          <span className="muted">Page {page} of {totalPages}</span>
          <button className="btn btn-soft" disabled={page >= totalPages} onClick={() => setPage(page + 1)}>Next</button>
        </div>
      )}
    </div>
  );
}
