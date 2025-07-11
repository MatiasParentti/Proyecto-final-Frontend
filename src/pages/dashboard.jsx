import React, { useEffect, useState } from "react";

export default function Dashboard() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedProducts, setSelectedProducts] = useState([]); // State for selected products IDs
  const [productQuantities, setProductQuantities] = useState({}); // Nuevo estado para las cantidades de los productos
  const [saving, setSaving] = useState(false); // State for saving process

  const authToken = localStorage.getItem("authToken");

  useEffect(() => {
    setLoading(true);
    setError(null);

    fetch("http://localhost:3500/api/productos", { // Ensure this URL is correct to get products
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      },
    })
      .then((res) => {
        if (!res.ok) {
          return res.json().then(errData => {
            throw new Error(errData.error || `HTTP error! status: ${res.status}`);
          });
        }
        return res.json();
      })
      .then((data) => {
        setProducts(data);
        // Inicializar las cantidades a 0 para todos los productos cargados
        const initialQuantities = {};
        data.forEach(product => {
          initialQuantities[product.id] = 0; // Cantidad inicial a 0
        });
        setProductQuantities(initialQuantities);
        setLoading(false);
        console.log("Products loaded:", data);
      })
      .catch((err) => {
        console.error("Error fetching products:", err);
        setError(err.message || "Could not load products. Please try again later.");
        setLoading(false);
      });
  }, [authToken]);

  // Function to handle product selection/deselection via checkbox
  const handleToggleProduct = (productId) => {
    setSelectedProducts((prevSelected) => {
      const isSelected = prevSelected.includes(productId);
      if (isSelected) {
        // If already selected, remove it
        // When deselected, set its quantity to 0
        setProductQuantities(prevQuantities => ({
            ...prevQuantities,
            [productId]: 0
        }));
        return prevSelected.filter((id) => id !== productId);
      } else {
        // If not selected, add it.
        // If it's being selected, ensure its quantity is at least 1 if it was 0.
        setProductQuantities(prevQuantities => ({
            ...prevQuantities,
            [productId]: Math.max(1, prevQuantities[productId] || 0) // Ensure quantity is at least 1 when selected via checkbox
        }));
        return [...prevSelected, productId];
      }
    });
  };

  // Nueva función para manejar el cambio de cantidad
  const handleQuantityChange = (productId, value) => {
    let newQuantity = parseInt(value || '0', 10);
    // Asegura que la cantidad esté entre 0 y 999
    newQuantity = Math.max(0, newQuantity); // Mínimo 0
    newQuantity = Math.min(999, newQuantity); // Máximo 999

    setProductQuantities(prevQuantities => ({
      ...prevQuantities,
      [productId]: newQuantity,
    }));

    // Sincronizar la selección con la cantidad
    setSelectedProducts(prevSelected => {
      const currentlySelected = prevSelected.includes(productId);
      if (newQuantity === 0 && currentlySelected) {
        // Si la cantidad se vuelve 0 Y estaba seleccionado, deseleccionarlo.
        return prevSelected.filter(id => id !== productId);
      } else if (newQuantity > 0 && !currentlySelected) {
        // Si la cantidad se vuelve > 0 Y NO estaba seleccionado, seleccionarlo.
        return [...prevSelected, productId];
      }
      // En cualquier otro caso (cantidad > 0 y ya seleccionado, o cantidad 0 y ya deseleccionado), no hay cambio en la selección.
      return prevSelected;
    });
  };


  // Function to send selected products to the backend
  const handleSaveSelectedProducts = async () => {
    // Filtramos solo los productos que están seleccionados Y tienen una cantidad mayor a 0
    const productsToSave = products.filter(product => 
        selectedProducts.includes(product.id) && (productQuantities[product.id] || 0) > 0
    ).map(product => ({
        ...product,
        cantidad: productQuantities[product.id] || 0 // Asegura que tenga cantidad (0 por defecto si no se tocó)
    }));

    if (productsToSave.length === 0) {
      alert("Por favor, selecciona al menos un producto con una cantidad mayor a 0 para guardar.");
      return;
    }

    setSaving(true);
    setError(null);
    
    try {
      // URL of your API to save selected products. CHANGE THIS URL!
      // For example: http://localhost:3500/api/guardar-seleccion
      const response = await fetch("http://localhost:3500/api/guardar-seleccion", {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify({ selectedProducts: productsToSave }), // Send complete product objects with quantities
      });

      const data = await response.json();

      if (response.ok) {
        alert("Productos seleccionados guardados exitosamente!");
        setSelectedProducts([]); // Clear selection after saving
        // Resetear cantidades a 0 para todos los productos después de guardar
        const resetQuantities = {};
        products.forEach(product => {
          resetQuantities[product.id] = 0;
        });
        setProductQuantities(resetQuantities);
        console.log("Backend response:", data);
      } else {
        throw new Error(data.error || "Error saving selected products.");
      }
    } catch (err) {
      console.error("Error saving selected products:", err);
      setError(err.message || "No se pudieron guardar los productos seleccionados. Por favor, intenta de nuevo.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>Dashboard de Productos</h1>

      {loading && <p style={styles.message}>Cargando productos...</p>}

      {error && <p style={styles.errorMessage}>{error}</p>}

      {!loading && !error && (
        <>
          {products.length > 0 ? (
            <>
              <table style={styles.table}>
                <thead>
                  <tr>
                    {/* <th style={styles.th}>ID</th> -- Columna ID eliminada */}
                    <th style={styles.th}>Nombre</th>
                    <th style={styles.th}>Cantidad</th> {/* Nueva columna Cantidad */}
                    <th style={styles.th}>Precio</th>
                    <th style={styles.th}>Seleccionar</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((product) => (
                    <tr key={product.id} style={styles.tr}>
                      {/* <td style={styles.td}>{product.id}</td> -- Celda ID eliminada */}
                      <td style={styles.td}>{product.nombre}</td>
                      <td style={styles.tdQuantity}> {/* Celda para la cantidad */}
                        <input
                          type="number"
                          min="0" // Cantidad mínima 0
                          max="999" // Cantidad máxima 999
                          value={productQuantities[product.id] || 0} // Muestra la cantidad actual o 0 por defecto
                          onChange={(e) => handleQuantityChange(product.id, e.target.value)}
                          style={styles.quantityInput}
                        />
                      </td>
                      <td style={styles.td}>${product.precio}</td>
                      <td style={styles.tdCheckbox}>
                        <input
                          type="checkbox"
                          checked={selectedProducts.includes(product.id)}
                          onChange={() => handleToggleProduct(product.id)}
                          style={styles.checkbox}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <button
                style={styles.saveButton}
                onClick={handleSaveSelectedProducts}
                disabled={saving || selectedProducts.length === 0}
              >
                {saving ? 'Guardando...' : `Guardar ${selectedProducts.length} Seleccionados`}
              </button>
            </>
          ) : (
            <p style={styles.tdNoData} colSpan="4">No hay productos disponibles.</p>
          )}
        </>
      )}
    </div>
  );
}

// Styles for the table and elements
const styles = {
  container: {
    fontFamily: 'Arial, sans-serif',
    padding: '20px',
    maxWidth: '900px', // Adjusted width for table layout with new column
    margin: '0 auto',
    backgroundColor: '#f9f9f9',
    borderRadius: '8px',
    boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
    textAlign: 'left', // Aligns container content to the left
  },
  title: {
    textAlign: 'center', // Title remains centered
    color: '#333',
    marginBottom: '25px',
  },
  message: {
    textAlign: 'center',
    color: '#555',
    fontSize: '1.1em',
    padding: '15px',
    backgroundColor: '#e0f7fa',
    borderRadius: '5px',
    borderLeft: '5px solid #00bcd4',
    marginBottom: '20px',
  },
  errorMessage: {
    textAlign: 'center',
    color: 'red',
    fontSize: '1.1em',
    padding: '15px',
    backgroundColor: '#ffebee',
    borderRadius: '5px',
    borderLeft: '5px solid #d32f2f',
    marginBottom: '20px',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    marginTop: '20px',
  },
  th: {
    backgroundColor: '#4CAF50',
    color: 'white',
    padding: '12px 15px',
    textAlign: 'left',
    borderBottom: '1px solid #ddd',
  },
  td: {
    padding: '10px 15px',
    borderBottom: '1px solid #ddd',
    color: '#333',
    textAlign: 'left', // Ensure text in cells is left-aligned
  },
  tdQuantity: { // New style for quantity cell
    padding: '10px 15px',
    borderBottom: '1px solid #ddd',
    color: '#333',
    textAlign: 'center', // Center the quantity input
  },
  quantityInput: { // Style for the number input
    width: '60px',
    padding: '5px',
    textAlign: 'center',
    borderRadius: '4px',
    border: '1px solid #ccc',
  },
  tdCheckbox: {
    padding: '10px 15px',
    borderBottom: '1px solid #ddd',
    textAlign: 'center', // Center the checkbox
  },
  tr: {
    backgroundColor: '#fff',
  },
  checkbox: {
    width: '18px',
    height: '18px',
    cursor: 'pointer',
  },
  saveButton: {
    display: 'block',
    width: 'auto',
    padding: '12px 25px',
    backgroundColor: '#007bff',
    color: 'white',
    border: 'none',
    borderRadius: '5px',
    fontSize: '1.1em',
    cursor: 'pointer',
    marginTop: '30px',
    marginBottom: '20px',
    margin: '30px auto 20px auto',
    transition: 'background-color 0.3s ease',
  },
  tdNoData: {
    textAlign: 'center',
    padding: '20px',
    color: '#777',
    fontStyle: 'italic',
  }
};
