import { Navigate, Route, Routes } from "react-router-dom";
import { homePath, useAuth } from "./AuthContext.jsx";
import Layout from "./components/Layout.jsx";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import CreateOrder from "./pages/CreateOrder.jsx";
import OrderList from "./pages/OrderList.jsx";
import OrderDetails from "./pages/OrderDetails.jsx";

// Shows the page only for logged-in users with an allowed role.
function Protected({ roles, children }) {
  const { user, loading } = useAuth();
  if (loading) return <p className="center-note">Loading...</p>;
  if (!user) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user.role)) return <Navigate to={homePath(user.role)} replace />;
  return <Layout>{children}</Layout>;
}

function Home() {
  const { user, loading } = useAuth();
  if (loading) return <p className="center-note">Loading...</p>;
  return <Navigate to={user ? homePath(user.role) : "/login"} replace />;
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      <Route path="/orders/new" element={<Protected roles={["user"]}><CreateOrder /></Protected>} />
      <Route path="/orders/mine" element={<Protected roles={["user"]}><OrderList mode="mine" /></Protected>} />
      <Route path="/assigned" element={<Protected roles={["courier"]}><OrderList mode="assigned" /></Protected>} />
      <Route path="/admin/orders" element={<Protected roles={["admin"]}><OrderList mode="all" /></Protected>} />
      <Route path="/orders/:id" element={<Protected><OrderDetails /></Protected>} />

      <Route path="*" element={<Home />} />
    </Routes>
  );
}
