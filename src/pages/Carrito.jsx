import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import Navbar from "../components/Navbar";
import API_URL from "../config";


export default function Carrito() {
  const navigate = useNavigate();

  const [carrito, setCarrito] = useState([]);
  const [loading, setLoading] = useState(true);
  const [finalizado, setFinalizado] = useState(null);
  const authToken = localStorage.getItem("authToken");

  const cargarCarrito = async () => {
    setLoading(true);
    const res = await fetch(`${API_URL}/api/carrito`, {
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    });
    const data = await res.json();
    setCarrito(data);
    setLoading(false);
  };

  useEffect(() => {
    cargarCarrito();
  }, []);

  const eliminarProducto = async (id) => {
    await fetch(`${API_URL}/api/carrito/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    });
    toast.success("Producto eliminado");
    cargarCarrito();
  };

  const finalizarCompra = async () => {
    const res = await fetch(`${API_URL}/api/compra`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    });
    const data = await res.json();
    setFinalizado(data);
    setCarrito([]);
  };

  if (loading)
    return (
      <div className="container mt-5">
        <div className="alert alert-info text-center">Cargando carrito...</div>
      </div>
    );

  return (
    <>
      <Navbar></Navbar>
      <div className="container mt-5">
        <h2 className="mb-4 text-center">🛒 Mi carrito</h2>

        {finalizado ? (
          <div className="card p-4 shadow-sm">
            <h3 className="text-success">{finalizado.message}</h3>
            <p>
              <strong>Items comprados:</strong> {finalizado.itemsComprados}
            </p>
            <ul className="list-group mb-3">
              {finalizado.detalles.map((item) => (
                <li
                  className="list-group-item d-flex justify-content-between align-items-center"
                  key={item.id}
                >
                  {item.nombre} x {item.cantidad}
                  <span className="badge bg-primary rounded-pill">
                    ${item.precio * item.cantidad}
                  </span>
                </li>
              ))}
              <li className="list-group-item d-flex justify-content-between align-items-center">
                <p>
                  <strong>Total:</strong>
                </p>
                <span className="badge bg-primary rounded-pill">
                  ${finalizado.total}
                </span>
              </li>
            </ul>
            <button
              className="btn btn-outline-primary"
              onClick={() => navigate("/dashboard")}
            >
              Seguir comprando
            </button>
          </div>
        ) : (
          <>
            {carrito.length === 0 ? (
              <div className="alert alert-warning text-center">
                <p>No hay productos en tu carrito.</p>
                <button
                  className="btn btn-primary mt-2"
                  onClick={() => navigate("/dashboard")}
                >
                  Comprar productos
                </button>
              </div>
            ) : (
              <div className="card p-4 shadow-sm">
                <ul className="list-group mb-4">
                  {carrito.map((item) => (
                    <li
                      className="list-group-item d-flex justify-content-between align-items-center"
                      key={item.id}
                    >
                      <div>
                        {item.nombre} x {item.cantidad}
                      </div>
                      <div className="d-flex align-items-center">
                        <span className="me-3">
                          ${item.precio * item.cantidad}
                        </span>
                        <button
                          className="btn btn-sm btn-danger"
                          onClick={() => eliminarProducto(item.id)}
                        >
                          Eliminar
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
                <div className="d-flex justify-content-between">
                  <button className="btn btn-success" onClick={finalizarCompra}>
                    Finalizar compra
                  </button>
                  <button
                    className="btn btn-outline-primary"
                    onClick={() => navigate("/dashboard")}
                  >
                    Seguir comprando
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </>
  );
}
