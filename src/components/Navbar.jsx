import React from "react";
import { useNavigate } from "react-router-dom";
import { NavLink } from "react-router-dom";
export default function Navbar() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    navigate("/");
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-light bg-light px-4">
      <NavLink className="nav-link" to="/dashboard">
        <span className="navbar-brand">IFTS N16</span>
      </NavLink>
      <NavLink className="nav-link" to="/historial">
        Historial
      </NavLink>

      <div className="ms-auto">
        <button className="btn btn-outline-dark" onClick={handleLogout}>
          Cerrar sesión
        </button>
      </div>
    </nav>
  );
}
