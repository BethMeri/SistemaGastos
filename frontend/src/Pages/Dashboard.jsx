/* frontend/src/Pages/Dashboard.jsx */
import React, { useState, useEffect } from 'react';
import '../Styles/Dashboard.css';

export default function Dashboard() {
  // Inicializamos el estado cargando desde localStorage (si existe) o con datos por defecto
  const [gastos, setGastos] = useState(() => {
    const gastosGuardados = localStorage.getItem('sistema_gastos');
    if (gastosGuardados) {
      try {
        return JSON.parse(gastosGuardados);
      } catch (error) {
        console.error("Error al leer localStorage:", error);
      }
    }
    return [
      { id: 1, concepto: 'Supermercado', monto: 45.50, categoria: 'Alimentos', fecha: '2026-11-08' },
      { id: 2, concepto: 'Internet', monto: 35.00, categoria: 'Servicios', fecha: '2026-11-05' },
      { id: 3, concepto: 'Plataforma Cloud', monto: 12.75, categoria: 'Suscripciones', fecha: '2026-11-09' }
    ];
  });

  const [concepto, setConcepto] = useState('');
  const [monto, setMonto] = useState('');
  const [categoria, setCategoria] = useState('Alimentos');
  const [error, setError] = useState('');
  const [categoriaFiltro, setCategoriaFiltro] = useState('Todas');
  const [idEditando, setIdEditando] = useState(null);
  const [idConfirmando, setIdConfirmando] = useState(null);

  // Cada vez que el arreglo 'gastos' cambie, lo guardamos automáticamente en localStorage
  useEffect(() => {
    localStorage.setItem('sistema_gastos', JSON.stringify(gastos));
  }, [gastos]);

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const conceptoInvalido = !concepto || concepto.trim().length < 3;
    const montoInvalido = !monto || parseFloat(monto) <= 0;

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

    setError('');

    if (idEditando !== null) {
      const gastosActualizados = gastos.map((gasto) => {
        if (gasto.id === idEditando) {
          return {
            ...gasto,
            concepto: concepto.trim(),
            monto: parseFloat(monto),
            categoria: categoria
          };
        }
        return gasto;
      });

      setGastos(gastosActualizados);
      setIdEditando(null);
    } else {
      const nuevoGasto = {
        id: Date.now(),
        concepto: concepto.trim(),
        monto: parseFloat(monto),
        categoria: categoria,
        fecha: new Date().toISOString().split('T')[0]
      };

      setGastos([nuevoGasto, ...gastos]);
    }

    setConcepto('');
    setMonto('');
    setCategoria('Alimentos');
  };

  const eliminarGasto = (id) => {
    const gastosFiltrados = gastos.filter((gasto) => gasto.id !== id);
    setGastos(gastosFiltrados);
    setIdConfirmando(null);
    
    if (idEditando === id) {
      setIdEditando(null);
      setConcepto('');
      setMonto('');
    }
  };

  const iniciarEdicion = (gasto) => {
    setIdEditando(gasto.id);
    setConcepto(gasto.concepto);
    setMonto(gasto.monto);
    setCategoria(gasto.categoria);
    setError('');
  };

  const gastosMostrados = categoriaFiltro === 'Todas' 
    ? gastos 
    : gastos.filter((gasto) => gasto.categoria === categoriaFiltro);

  const totalGastos = gastos.reduce((acc, item) => acc + item.monto, 0);

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <h1>SistemaGastos 💸</h1>
        <p>Control financiero local (Modo con Persistencia Local)</p>
      </header>

      {/* Tarjeta de Resumen */}
      <div className="card-resumen">
        <h3>TOTAL GASTADO</h3>
        <p className="monto-total">${totalGastos.toFixed(2)}</p>
      </div>

      {/* Formulario para registrar o editar un gasto */}
      <div className="form-container">
        <h3>{idEditando !== null ? 'Editar Gasto' : 'Registrar Nuevo Gasto'}</h3>

        {error && <div className="dashboard-error-alert">{error}</div>}

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
            <option value="Entretenimiento">Entretenimiento</option>
            <option value="Tecnología">Tecnología</option>
            <option value="Hogar">Hogar</option>
          </select>
          <button type="submit" className={idEditando !== null ? 'dashboard-btn-actualizar' : ''}>
            {idEditando !== null ? 'Actualizar' : 'Agregar'}
          </button>
        </form>
      </div>

      {/* Tabla de registros recientes con Filtro por Categoría */}
      <div className="tabla-container">
        <div className="dashboard-table-header-box">
          <h3>Gastos Recientes</h3>
          
          <div className="dashboard-filter-box">
            <label htmlFor="filtro-cat">Filtrar:</label>
            <select 
              id="filtro-cat"
              className="dashboard-filter-dropdown"
              value={categoriaFiltro} 
              onChange={(e) => setCategoriaFiltro(e.target.value)}
            >
              <option value="Todas">Todas las categorías</option>
              <option value="Alimentos">Alimentos</option>
              <option value="Servicios">Servicios</option>
              <option value="Suscripciones">Suscripciones</option>
              <option value="Transporte">Transporte</option>
              <option value="Entretenimiento">Entretenimiento</option>
              <option value="Tecnología">Tecnología</option>
              <option value="Hogar">Hogar</option>
            </select>
          </div>
        </div>

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
            {gastosMostrados.length > 0 ? (
              gastosMostrados.map((gasto) => (
                <tr key={gasto.id}>
                  <td>{gasto.concepto}</td>
                  <td>{gasto.categoria}</td>
                  <td>{gasto.fecha}</td>
                  <td className="monto-celda">${gasto.monto.toFixed(2)}</td>
                  <td>
                    <div className="dashboard-acciones-celda">
                      <button 
                        onClick={() => iniciarEdicion(gasto)} 
                        className="dashboard-action-edit-btn"
                      >
                        Editar
                      </button>
                      <button 
                        onClick={() => setIdConfirmando(gasto.id)} 
                        className="dashboard-action-delete-btn"
                      >
                        Eliminar
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" className="dashboard-table-empty-row">
                  No hay gastos registrados en esta categoría.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pantallita Modal flotante para confirmar eliminación */}
      {idConfirmando !== null && (
        <div className="dashboard-modal-overlay">
          <div className="dashboard-modal-card">
            <h3>Confirmar Eliminación</h3>
            <p>¿Estás segura de que deseas eliminar este gasto del sistema?</p>
            <div className="dashboard-modal-buttons">
              <button 
                onClick={() => eliminarGasto(idConfirmando)} 
                className="dashboard-modal-confirm-btn"
              >
                Sí, eliminar
              </button>
              <button 
                onClick={() => setIdConfirmando(null)} 
                className="dashboard-modal-cancel-btn"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}