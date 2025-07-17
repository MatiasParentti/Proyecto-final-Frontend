import React from "react";
import { useNavigate } from "react-router-dom";
import { NavLink } from "react-router-dom";
import API_URL from "../config";

export default function Navbar() {
  const navigate = useNavigate();
  const authToken = localStorage.getItem("authToken");
  
 const handleLogout = async () => {
    try {
      const res = await fetch(`${API_URL}/api/carrito`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
      });

      if (!res.ok) {
        throw new Error('Failed to clear cart');
      }

      localStorage.removeItem("authToken");
      navigate("/");
    } catch (error) {
      console.error('Logout error:', error);
    }
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
        <button className="btn btn-outline-dark"
         onClick={handleLogout}
         >
          Cerrar sesión
        </button>
      </div>
    </nav>
  );
}