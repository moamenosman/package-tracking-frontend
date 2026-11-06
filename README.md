# PulseShip Frontend

A simple React (Vite) frontend for the PulseShip FastAPI backend.
Design theme: the "Create Order - PulseShip" Figma screen (orange primary, soft blue fields, Inter + Plus Jakarta Sans).

## Run

1. Start the backend (from the backend folder):

   ```bash
   python -m uvicorn app.main:app --reload
   ```

2. Start the frontend (from this folder):

   ```bash
   npm install
   npm run dev
   ```

3. Open **http://localhost:5173** (use `localhost`, not `127.0.0.1`, because the backend only accepts
   the origin set in `PUBLIC_ORIGIN`).

Vite proxies every `/api` request to `http://127.0.0.1:8000` (see `vite.config.js`),
so the session cookie works without any CORS setup.

## Pages by role

| Role | Pages |
|---|---|
| Merchant (`user`) | Create Order, My Orders, Order Details (cancel) |
| Courier | Assigned Deliveries, Order Details (accept / decline / advance status) |
| Admin | Manage All Shipments, Order Details (assign courier, advance status, delete) |
| Anyone | Login, Register |

Demo accounts come from your backend seed script (seller@example.com / seller-demo, etc.).

## Structure

```
src/
  api.js            fetch wrapper (credentials: include, error parsing)
  AuthContext.jsx   login state restored with GET /api/auth/me
  App.jsx           routes + role protection
  components/       Layout (top bar + sidebar), StatusBadge
  pages/            Login, Register, CreateOrder, OrderList, OrderDetails
  styles.css        all styling
```
