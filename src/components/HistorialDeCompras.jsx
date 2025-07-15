import React, { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import API_URL from "../config";


export default function HistorialDeCompras() {
  const [compras, setCompras] = useState([]);
  const [loading, setLoading] = useState(true);
  const authToken = localStorage.getItem("authToken");
  

  useEffect(() => {
    const fetchHistorial = async () => {
      try {
        const res = await fetch(`${API_URL}/api/compra`, {
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        });

        if (!res.ok) throw new Error("Error al obtener historial de compras");

        const data = await res.json();
        setCompras(data.compras || []);
      } catch (error) {
        console.error("Error al cargar historial:", error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchHistorial();
  }, [authToken]);

  if (loading) return <p className="text-center mt-4">Cargando historial...</p>;

  if (compras.length === 0)
    return (
      <div className="container mt-4">
        <div className="alert alert-info text-center">
          No hay compras registradas.
        </div>
      </div>
    );

  return (
    <>
      <Navbar></Navbar>
      <div className="container mt-4">
        <h3 className="mb-4">Historial de Compras</h3>
        {compras.map((compra) => (
          <div key={compra.id} className="card mb-3 shadow-sm">
            <div className="card-body">
              <h5 className="card-title">
                Compra #{compra.id} - {new Date(compra.fecha).toLocaleString()}
              </h5>
              <p className="card-text">
                Total: <strong>${compra.total}</strong>
              </p>
              <ul className="list-group list-group-flush">
                {compra.detalles.map((detalle, index) => (
                  <li key={index} className="list-group-item">
                    {detalle.nombre} x {detalle.cantidad} = $
                    {detalle.cantidad * detalle.precio_unitario}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
