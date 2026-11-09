/* frontend/src/Pages/Dashboard.jsx */
import React, { useState } from 'react';
import '../Styles/Dashboard.css';

export default function Dashboard() {
  const [gastos, setGastos] = useState([
    { id: 1, concepto: 'Supermercado', monto: 45.50, categoria: 'Alimentos', fecha: '2026-11-08' },
    { id: 2, concepto: 'Internet', monto: 35.00, categoria: 'Servicios', fecha: '2026-11-05' },
    { id: 3, concepto: 'Plataforma Cloud', monto: 12.75, categoria: 'Suscripciones', fecha: '2026-11-09' }
  ]);

  const [concepto, setConcepto] = useState('');
  const [monto, setMonto] = useState('');
  const [categoria, setCategoria] = useState('Alimentos');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const conceptoInvalido = !concepto || concepto.trim().length < 3;
    const montoInvalido = !monto || parseFloat(monto) <= 0;

    // Validaciones específicas independientes
    if (conceptoInvalido && montoInvalido) {
      setError("Por favor, ingresa un concepto válido (mínimo 3 letras) y un monto mayor a 0.");
      return;
    }
    
    if (conceptoInvalido) {
      setError("El concepto debe tener al menos 3 caracteres.");
      return;
    }
    
    if (montoInvalido) {
      setError("Por favor, ingresa un monto mayor a 0.");
      return;
    }

    // Si pasa todas las validaciones, limpiamos el error
    setError('');

    const nuevoGasto = {
      id: Date.now(),
      concepto: concepto.trim(),
      monto: parseFloat(monto),
      categoria: categoria,
      fecha: new Date().toISOString().split('T')[0]
    };

    setGastos([nuevoGasto, ...gastos]);
    setConcepto('');
    setMonto('');
  };

  const eliminarGasto = (id) => {
    const gastosFiltrados = gastos.filter((gasto) => gasto.id !== id);
    setGastos(gastosFiltrados);
  };

  const totalGastos = gastos.reduce((acc, item) => acc + item.monto, 0);

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <h1>SistemaGastos 💸</h1>
        <p>Control financiero local (Modo sin Base de Datos)</p>
      </header>

      {/* Tarjeta de Resumen */}
      <div className="card-resumen">
        <h3>TOTAL GASTADO</h3>
        <p className="monto-total">${totalGastos.toFixed(2)}</p>
      </div>

      {/* Formulario para registrar un gasto en vivo */}
      <div className="form-container">
        <h3>Registrar Nuevo Gasto</h3>

        {/* Mensaje de error visual dinámico */}
        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit} className="gasto-form">
          <input 
            type="text" 
            placeholder="Concepto (ej. Almuerzo)" 
            value={concepto}
            onChange={(e) => setConcepto(e.target.value)}
          />
          <input 
            type="number" 
            step="0.01" 
            placeholder="Monto ($)" 
            value={monto}
            onChange={(e) => setMonto(e.target.value)}
          />
          <select value={categoria} onChange={(e) => setCategoria(e.target.value)}>
            <option value="Alimentos">Alimentos</option>
            <option value="Servicios">Servicios</option>
            <option value="Suscripciones">Suscripciones</option>
            <option value="Transporte">Transporte</option>
          </select>
          <button type="submit">Agregar</button>
        </form>
      </div>

      {/* Tabla de registros recientes */}
      <div className="tabla-container">
        <h3>Gastos Recientes</h3>
        <table className="tabla-gastos">
          <thead>
            <tr>
              <th>Concepto</th>
              <th>Categoría</th>
              <th>Fecha</th>
              <th>Monto</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {gastos.map((gasto) => (
              <tr key={gasto.id}>
                <td>{gasto.concepto}</td>
                <td>{gasto.categoria}</td>
                <td>{gasto.fecha}</td>
                <td className="monto-celda">${gasto.monto.toFixed(2)}</td>
                <td>
                  <button 
                    onClick={() => eliminarGasto(gasto.id)} 
                    className="btn-eliminar"
                  >
                    Eliminar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}