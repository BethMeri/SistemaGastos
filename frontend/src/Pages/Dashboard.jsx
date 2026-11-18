/* frontend/src/Pages/Dashboard.jsx */
import React, { useState, useEffect } from 'react';
import * as XLSX from 'xlsx';
import '../Styles/Dashboard.css';

export default function Dashboard() {
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
  
  // Estados para los filtros (Iniciamos en el mes actual del sistema por defecto)
  const [categoriaFiltro, setCategoriaFiltro] = useState('Todas');
  const [mesFiltro, setMesFiltro] = useState(() => {
    return new Date().toISOString().slice(0, 7);
  });

  const [idEditando, setIdEditando] = useState(null);
  const [idConfirmando, setIdConfirmando] = useState(null);

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

  // Función para transformar "2026-11-18" a "18/11/2026"
  const formatearFechaVisual = (fechaStr) => {
    if (!fechaStr) return '';
    const [anio, mes, dia] = fechaStr.split('-');
    return `${dia}/${mes}/${anio}`;
  };

  // Obtener meses únicos presentes en los gastos (ej. "2026-11")
  const mesesDisponibles = [...new Set(gastos.map((gasto) => gasto.fecha.slice(0, 7)))].sort().reverse();

  // Función para formatear "2026-11" a "noviembre de 2026"
  const formatearMesNombre = (anioMes) => {
    if (!anioMes) return '';
    const [anio, mes] = anioMes.split('-');
    const fecha = new Date(parseInt(anio), parseInt(mes) - 1, 1);
    return fecha.toLocaleString('es-ES', { month: 'long', year: 'numeric' });
  };

  // Filtrar gastos por categoría y por mes simultáneamente
  const gastosMostrados = gastos.filter((gasto) => {
    const coincideCategoria = categoriaFiltro === 'Todas' || gasto.categoria === categoriaFiltro;
    const coincideMes = mesFiltro === 'Todos' || gasto.fecha.startsWith(mesFiltro);
    return coincideCategoria && coincideMes;
  });

  // Función para exportar un archivo de Excel (.xlsx) con nombre dinámico elegante
  const exportarExcel = () => {
    if (gastosMostrados.length === 0) {
      alert("No hay gastos para exportar con los filtros actuales.");
      return;
    }

    const aoa = [
      ["Concepto", "Categoría", "Fecha", "Monto ($)"]
    ];

    gastosMostrados.forEach((gasto) => {
      aoa.push([
        gasto.concepto,
        gasto.categoria,
        formatearFechaVisual(gasto.fecha),
        Number(gasto.monto)
      ]);
    });

    const filaInicio = 2;
    const filaFin = filaInicio + gastosMostrados.length - 1;
    aoa.push(["TOTAL GASTADO", "", "", { f: `SUM(D${filaInicio}:D${filaFin})` }]);

    const worksheet = XLSX.utils.aoa_to_sheet(aoa);

    // Activamos los filtros automáticos desplegables en Excel
    const rangoDatos = XLSX.utils.encode_range({
      s: { r: 0, c: 0 },
      e: { r: gastosMostrados.length, c: 3 }
    });
    worksheet['!autofilter'] = { ref: rangoDatos };

    worksheet['!cols'] = [
      { wch: 30 }, 
      { wch: 22 }, 
      { wch: 16 }, 
      { wch: 18 }  
    ];

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Reporte Gastos");

    // Construcción del nombre de archivo profesional y limpio
    let nombreArchivo = "";
    if (mesFiltro === 'Todos') {
      const anioActual = new Date().getFullYear();
      nombreArchivo = `SistemaGastos_${anioActual}.xlsx`;
    } else {
      const [anio, mes] = mesFiltro.split('-');
      const fecha = new Date(parseInt(anio), parseInt(mes) - 1, 1);
      const nombreMes = fecha.toLocaleString('es-ES', { month: 'long' });
      const nombreMesCapitalizado = nombreMes.charAt(0).toUpperCase() + nombreMes.slice(1);
      nombreArchivo = `SistemaGastos_${nombreMesCapitalizado}_${anio}.xlsx`;
    }

    XLSX.writeFile(workbook, nombreArchivo);
  };

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
            <option value="Alimentos">🍔 Alimentos</option>
            <option value="Servicios">💡 Servicios</option>
            <option value="Suscripciones">⚡ Suscripciones</option>
            <option value="Transporte">🚗 Transporte</option>
            <option value="Entretenimiento">🎮 Entretenimiento</option>
            <option value="Tecnología">💻 Tecnología</option>
            <option value="Hogar">🏠 Hogar</option>
            <option value="Otros">📦 Otros</option>
          </select>
          <button type="submit" className={idEditando !== null ? 'dashboard-btn-actualizar' : ''}>
            {idEditando !== null ? 'Actualizar' : 'Agregar'}
          </button>
        </form>
      </div>

      {/* Tabla de registros recientes */}
      <div className="tabla-container">
        <div className="dashboard-table-header-box">
          <div className="table-title-group">
            <h3>Gastos Recientes</h3>
            <p>Historial detallado de tus movimientos</p>
          </div>
          
          <div className="dashboard-filters-group">
            {/* Filtro por Mes */}
            <div className="filter-box-modern">
              <span className="filter-icon">📅</span>
              <select 
                className="dashboard-filter-dropdown"
                value={mesFiltro} 
                onChange={(e) => setMesFiltro(e.target.value)}
              >
                <option value="Todos">Todos los meses</option>
                {mesesDisponibles.map((mes) => (
                  <option key={mes} value={mes}>
                    {formatearMesNombre(mes)}
                  </option>
                ))}
              </select>
            </div>

            {/* Filtro por Categoría */}
            <div className="filter-box-modern">
              <span className="filter-icon">🔍</span>
              <select 
                className="dashboard-filter-dropdown"
                value={categoriaFiltro} 
                onChange={(e) => setCategoriaFiltro(e.target.value)}
              >
                <option value="Todas">Todas las categorías</option>
                <option value="Alimentos">🍔 Alimentos</option>
                <option value="Servicios">💡 Servicios</option>
                <option value="Suscripciones">⚡ Suscripciones</option>
                <option value="Transporte">🚗 Transporte</option>
                <option value="Entretenimiento">🎮 Entretenimiento</option>
                <option value="Tecnología">💻 Tecnología</option>
                <option value="Hogar">🏠 Hogar</option>
                <option value="Otros">📦 Otros</option>
              </select>
            </div>

            {/* Botón de Exportar a Excel Pro */}
            <button 
              onClick={exportarExcel} 
              className="dashboard-export-btn"
              title="Descargar reporte profesional en formato Excel (.xlsx)"
            >
              <span>📊</span> Exportar Excel Pro
            </button>
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
                  <td>{formatearFechaVisual(gasto.fecha)}</td>
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
                  No hay gastos registrados con estos filtros.
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