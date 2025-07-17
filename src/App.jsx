import "./App.css";
import { Routes, Route } from "react-router-dom";
import Login from "./pages/login";
import Dashboard from "./pages/dashboard";
import DashboardUsuario from "./pages/dashboardUsuario";
import PrivateRoute from "./components/PrivateRoute";
import Carrito from "./pages/Carrito";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import HistorialDeCompras from "./components/HistorialDeCompras";

export default function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route
          path="/dashboard"
          element={
            <PrivateRoute>
              <Dashboard />
            </PrivateRoute>
          }
        />
        <Route path="/" element={<Login />} />
        <Route
          path="/dashboardUsuario"
          element={
            <PrivateRoute>
              <DashboardUsuario />
            </PrivateRoute>
          }
        />
        <Route
          path="/carrito"
          element={
            <PrivateRoute>
              <Carrito></Carrito>
            </PrivateRoute>
          }
        />
        <Route
          path="/historial"
          element={
            <PrivateRoute>
              <HistorialDeCompras></HistorialDeCompras>
            </PrivateRoute>
          }
        />
      </Routes>
      <ToastContainer position="bottom-right" autoClose={3000} />
    </>
  );
}
