import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import Navbar from "../components/Navbar";
import API_URL from "../config";

export default function Dashboard() {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const authToken = localStorage.getItem("authToken");

  useEffect(() => {
    if (!authToken) {
      toast.error("Debes iniciar sesión para acceder a esta página");
      navigate("/login");
      return;
    }

    const fetchProductos = async () => {
      try {
        setLoading(true);
        const res = await fetch(`${API_URL}/api/productos`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${authToken}`,
          },
        });

        if (!res.ok) {
          if (res.status === 401) {
            localStorage.removeItem("authToken");
            toast.error("Sesión expirada, por favor inicia sesión nuevamente");
            navigate("/login");
            return;
          }
          throw new Error(`Error ${res.status}: ${res.statusText}`);
        }

        const data = await res.json();
        setProducts(data);
      } catch (err) {
        console.error("Error fetching products:", err);
        setError(err.message);
        toast.error(err.message || "Error al cargar los productos");
      } finally {
        setLoading(false);
      }
    };

    fetchProductos();
  }, [authToken, navigate]);

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    toast.success("Sesión cerrada correctamente");
    navigate("/login");
  };

  return (
    <>
      <Navbar onLogout={handleLogout} />
      
      <div className="container my-5">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h1 className="mb-0">Dashboard de Productos</h1>
          <span className="badge bg-primary">
            {products.length} productos disponibles
          </span>
        </div>

        {loading ? (
          <div className="text-center my-5">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Cargando...</span>
            </div>
            <p className="mt-2">Cargando productos...</p>
          </div>
        ) : error ? (
          <div className="alert alert-danger text-center">
            {error}
            <button 
              className="btn btn-link" 
              onClick={() => window.location.reload()}
            >
              Reintentar
            </button>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="table table-hover align-middle">
              <thead className="table-dark">
                <tr>
                  <th>Nombre</th>
                  <th>Precio</th>
                </tr>
              </thead>
              <tbody>
                {products.map((product) => (
                  <tr key={product.id}>
                    <td>{product.nombre}</td>
                    <td>${product.precio.toLocaleString()}</td>
                    <td>

                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
}