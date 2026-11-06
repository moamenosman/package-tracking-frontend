import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../AuthContext.jsx";

const NAV = {
  user: {
    title: "Main",
    links: [
      { to: "/orders/new", label: "Create Order" },
      { to: "/orders/mine", label: "My Orders" },
    ],
  },
  courier: {
    title: "Courier Operations",
    links: [{ to: "/assigned", label: "Assigned Deliveries" }],
  },
  admin: {
    title: "Administration",
    links: [{ to: "/admin/orders", label: "Manage All Shipments" }],
  },
};

const ROLE_LABEL = { user: "Merchant", courier: "Courier", admin: "Admin" };

export default function Layout({ children }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const nav = NAV[user.role];

  async function handleLogout() {
    await logout();
    navigate("/login");
  }

  return (
    <div className="app">
      <header className="topbar">
        <span className="brand">PulseShip</span>
        <div className="topbar-right">
          {user.role === "user" && (
            <button className="btn btn-primary" onClick={() => navigate("/orders/new")}>
              + New Shipment
            </button>
          )}
          <div className="user-chip">
            <div className="avatar">{user.name.charAt(0).toUpperCase()}</div>
            <div>
              <div className="user-name">{user.name}</div>
              <div className="user-role">{ROLE_LABEL[user.role]}</div>
            </div>
          </div>
          <button className="btn btn-soft" onClick={handleLogout}>
            Log out
          </button>
        </div>
      </header>

      <div className="body">
        <aside className="sidebar">
          <div className="nav-title">{nav.title}</div>
          {nav.links.map((link) => (
            <NavLink key={link.to} to={link.to} className="nav-link">
              {link.label}
            </NavLink>
          ))}
        </aside>
        <main className="main">{children}</main>
      </div>
    </div>
  );
}
