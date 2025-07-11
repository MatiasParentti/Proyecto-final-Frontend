import React, { useEffect, useState } from "react";

export default function Dashboard() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedProducts, setSelectedProducts] = useState([]); // State for selected products IDs
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
        setLoading(false);
        console.log("Products loaded:", data);
      })
      .catch((err) => {
        console.error("Error fetching products:", err);
        setError(err.message || "Could not load products. Please try again later.");
        setLoading(false);
      });
  }, [authToken]);

  // Function to handle product selection/deselection
  const handleToggleProduct = (productId) => {
    setSelectedProducts((prevSelected) => {
      if (prevSelected.includes(productId)) {
        // If already selected, remove it
        return prevSelected.filter((id) => id !== productId);
      } else {
        // If not selected, add it
        return [...prevSelected, productId];
      }
    });
  };

  // Function to send selected products to the backend
  const handleSaveSelectedProducts = async () => {
    if (selectedProducts.length === 0) {
      alert("Please select at least one product to save.");
      return;
    }

    setSaving(true);
    setError(null);

    // Filter complete product objects based on selected IDs
    const productsToSave = products.filter(product => selectedProducts.includes(product.id));

    try {
      // URL of your API to save selected products. CHANGE THIS URL!
      // For example: http://localhost:3500/api/guardar-seleccion
      const response = await fetch("http://localhost:3500/api/guardar-seleccion", {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify({ selectedProducts: productsToSave }), // Send complete product objects
      });

      const data = await response.json();

      if (response.ok) {
        alert("Selected products saved successfully!");
        setSelectedProducts([]); // Clear selection after saving
        console.log("Backend response:", data);
      } else {
        throw new Error(data.error || "Error saving selected products.");
      }
    } catch (err) {
      console.error("Error saving selected products:", err);
      setError(err.message || "Could not save selected products. Please try again.");
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
                    <th style={styles.th}>ID</th>
                    <th style={styles.th}>Nombre</th>
                    <th style={styles.th}>Precio</th>
                    <th style={styles.th}>Seleccionar</th> {/* New header for checkbox */}
                  </tr>
                </thead>
                <tbody>
                  {products.map((product) => (
                    <tr key={product.id} style={styles.tr}>
                      <td style={styles.td}>{product.id}</td>
                      <td style={styles.td}>{product.nombre}</td>
                      <td style={styles.td}>${product.precio}</td>
                      <td style={styles.tdCheckbox}> {/* New cell for checkbox */}
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
            <p style={styles.tdNoData}>No hay productos disponibles.</p>
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
    maxWidth: '800px', // Adjusted width for table layout
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
    // Removed justify-content: flex-start from here, as it's a table
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
    // Centered the button for better table presentation
    margin: '30px auto 20px auto',
    transition: 'background-color 0.3s ease',
  },
  tdNoData: {
    textAlign: 'center',
    padding: '20px',
    color: '#777',
    fontStyle: 'italic',
    // colSpan will be handled by the HTML structure, not CSS
  }
};
