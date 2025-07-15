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
  const [productQuantities, setProductQuantities] = useState({});
  const [carritoCount, setCarritoCount] = useState(0);
  const authToken = localStorage.getItem("authToken");

  useEffect(() => {
    const fetchCarrito = async () => {
      try {
        const res = await fetch(`${API_URL}/api/carrito`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${authToken}`,
          },
        });

        if (!res.ok) throw new Error("Error al cargar el carrito");

        const data = await res.json();
        const totalCantidad = data.reduce(
          (acc, item) => acc + item.cantidad,
          0
        );
        setCarritoCount(totalCantidad);
      } catch (error) {
        console.error("Error al consultar carrito:", error.message);
        setCarritoCount(0);
      }
    };

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
          const errData = await res.json();
          throw new Error(errData.error || `HTTP error! status: ${res.status}`);
        }

        const data = await res.json();
        setProducts(data);

        const initialQuantities = {};
        data.forEach((product) => {
          initialQuantities[product.id] = 0;
        });
        setProductQuantities(initialQuantities);
      } catch (err) {
        console.error("Error fetching products:", err);
        setError(err.message || "No se pudieron cargar los productos.");
      } finally {
        setLoading(false);
      }
    };

    if (authToken) {
      fetchCarrito();
      fetchProductos();
    }
  }, [authToken]);

  const handleQuantityChange = (productId, value) => {
    let newQuantity = parseInt(value || "0", 10);
    newQuantity = Math.max(0, Math.min(999, newQuantity));

    setProductQuantities((prevQuantities) => ({
      ...prevQuantities,
      [productId]: newQuantity,
    }));
  };

  const handleAgregarAlCarrito = async (productoId) => {
    const cantidad = productQuantities[productoId] || 0;
    if (cantidad <= 0) {
      toast.warn("La cantidad debe ser mayor a 0.");
      return;
    }

    try {
      const res = await fetch(`${API_URL}/api/carrito`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({
          producto_id: productoId,
          cantidad: cantidad,
        }),
      });

      if (!res.ok)
        throw new Error("No se pudo agregar el producto al carrito.");

      await res.json();
      toast.success("Producto agregado al carrito correctamente.");

      const updatedRes = await fetch(`${API_URL}/api/carrito`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
      });

      if (updatedRes.ok) {
        const updatedCarrito = await updatedRes.json();
        const total = updatedCarrito.reduce(
          (acc, item) => acc + item.cantidad,
          0
        );
        setCarritoCount(total);
      }
    } catch (error) {
      console.error("Error al agregar al carrito:", error.message);
      toast.error("Hubo un problema al agregar el producto al carrito.");
    }
  };

  return (
    <>
      <Navbar></Navbar>

      <div className="container my-5">
        <h1 className="text-center mb-4">Dashboard de Productos</h1>

        {loading && (
          <div className="alert alert-info text-center">
            Cargando productos...
          </div>
        )}

        {error && <div className="alert alert-danger text-center">{error}</div>}

        {!loading && !error && products.length > 0 && (
          <div className="table-responsive">
            <table className="table table-striped align-middle">
              <thead className="table-success">
                <tr>
                  <th>Nombre</th>
                  <th>Cantidad</th>
                  <th>Precio</th>
                  <th>Agregar</th>
                </tr>
              </thead>
              <tbody>
                {products.map((product) => (
                  <tr key={product.id}>
                    <td>{product.nombre}</td>
                    <td style={{ width: "100px" }}>
                      <input
                        type="number"
                        min="0"
                        max="999"
                        className="form-control text-center"
                        value={productQuantities[product.id] || 0}
                        onChange={(e) =>
                          handleQuantityChange(product.id, e.target.value)
                        }
                      />
                    </td>
                    <td>${product.precio}</td>
                    <td>
                      <button
                        className="btn btn-success"
                        onClick={() => handleAgregarAlCarrito(product.id)}
                        disabled={productQuantities[product.id] <= 0}
                      >
                        Agregar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {carritoCount > 0 && (
          <button
            onClick={() => navigate("/carrito")}
            className="btn btn-primary position-fixed top-0 end-0 m-3 rounded-pill shadow"
          >
            🛒 Ver carrito ({carritoCount})
          </button>
        )}
      </div>
    </>
  );
}
