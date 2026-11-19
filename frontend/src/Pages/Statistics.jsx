/* frontend/src/Pages/Statistics.jsx */
import React, { useState, useEffect } from 'react';
import {
  obtenerPresupuestoMensual,
  guardarPresupuestoMensual,
  analizarPresupuesto
} from '../utils/budgetInsights';
import '../Styles/Statistics.css';

const Statistics = () => {
  const [gastos, setGastos] = useState([]);
  const [presupuesto, setPresupuesto] = useState(() => obtenerPresupuestoMensual());
  const [inputPresupuesto, setInputPresupuesto] = useState(() => String(obtenerPresupuestoMensual()));
  const [mensajeGuardado, setMensajeGuardado] = useState('');

  const [mesSeleccionado, setMesSeleccionado] = useState(() => {
    return new Date().toISOString().slice(0, 7);
  });

  // Cargar los gastos reales desde 'sistema_gastos'
  useEffect(() => {
    const gastosGuardados = JSON.parse(localStorage.getItem('sistema_gastos')) || [];
    setGastos(gastosGuardados);
  }, []);

  const handleGuardarPresupuesto = (e) => {
    e.preventDefault();
    const nuevo = guardarPresupuestoMensual(inputPresupuesto);
    if (!nuevo) return;
    setPresupuesto(nuevo);
    setMensajeGuardado('Meta actualizada');
    setTimeout(() => setMensajeGuardado(''), 2500);
  };

  // Meses disponibles en los registros + el mes actual
  const mesActual = new Date().toISOString().slice(0, 7);
  const mesesDisponibles = [...new Set([mesActual, ...gastos.map((g) => g.fecha?.slice(0, 7)).filter(Boolean)])]
    .sort()
    .reverse();

  const formatearMesNombre = (anioMes) => {
    if (!anioMes) return '';
    const [anio, mes] = anioMes.split('-');
    const fecha = new Date(parseInt(anio, 10), parseInt(mes, 10) - 1, 1);
    return fecha.toLocaleString('es-ES', { month: 'long', year: 'numeric' });
  };

  // Filtrar gastos del mes seleccionado
  const gastosMes = gastos.filter((g) => g.fecha && g.fecha.startsWith(mesSeleccionado));

  // Análisis de presupuesto e insights
  const analisis = analizarPresupuesto(gastosMes, presupuesto, mesSeleccionado);

  // Agrupar gastos del mes por categoría
  const gastosPorCategoria = gastosMes.reduce((acc, item) => {
    const categoria = item.categoria || 'Otros';
    acc[categoria] = (acc[categoria] || 0) + Number(item.monto || 0);
    return acc;
  }, {});

  // Encontrar la categoría con mayor gasto en el mes
  const categoriaMayor = Object.entries(gastosPorCategoria).reduce(
    (max, [cat, monto]) => (monto > (max.monto || 0) ? { cat, monto } : max),
    {}
  );

  return (
    <div className="statistics-container">
      <div className="statistics-header-row">
        <div>
          <h2>📊 Estadísticas e Insights</h2>
          <p className="statistics-subtitle">Análisis visual, presupuesto mensual y alertas inteligentes</p>
        </div>

        <div className="stats-month-selector">
          <span>📅</span>
          <select
            value={mesSeleccionado}
            onChange={(e) => setMesSeleccionado(e.target.value)}
          >
            {mesesDisponibles.map((mes) => (
              <option key={mes} value={mes}>
                {formatearMesNombre(mes)}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Tarjetas de Resumen Rápido */}
      <div className="stats-cards-grid">
        <div className="stat-card">
          <h3>Gasto del Mes</h3>
          <p className="stat-value">${analisis.totalGastado.toFixed(2)}</p>
        </div>
        <div className="stat-card">
          <h3>Registros del Mes</h3>
          <p className="stat-value">{gastosMes.length}</p>
        </div>
        <div className="stat-card">
          <h3>Categoría Principal</h3>
          <p className="stat-value-small">
            {categoriaMayor.cat ? `${categoriaMayor.cat} ($${categoriaMayor.monto.toFixed(2)})` : 'N/A'}
          </p>
        </div>
      </div>

      {/* Sección de Presupuesto Mensual y Alertas Inteligentes */}
      <div className="budget-insights-card">
        <div className="budget-header">
          <div>
            <h3>🎯 Control de Presupuesto Mensual</h3>
            <p className="budget-sub">Define tu límite mensual para activar las alertas de consumo</p>
          </div>

          <form onSubmit={handleGuardarPresupuesto} className="budget-form">
            <input
              type="number"
              step="1"
              min="1"
              value={inputPresupuesto}
              onChange={(e) => setInputPresupuesto(e.target.value)}
              placeholder="Ej: 500"
            />
            <button type="submit">Guardar Meta</button>
          </form>
        </div>

        {mensajeGuardado && <span className="budget-saved-badge">✓ {mensajeGuardado}</span>}

        <div className="budget-progress-wrapper">
          <div className="budget-numbers">
            <span>
              Consumido: <strong>${analisis.totalGastado.toFixed(2)}</strong> de <strong>${analisis.presupuesto.toFixed(2)}</strong>
            </span>
            <span className={`budget-percent badge-${analisis.estado}`}>
              {analisis.porcentaje.toFixed(1)}%
            </span>
          </div>

          <div className="progress-bar-background budget-bar-lg">
            <div
              className={`progress-bar-fill fill-${analisis.estado}`}
              style={{ width: `${analisis.porcentajeBarra}%` }}
            ></div>
          </div>
        </div>

        {/* Lista de Insights / Alertas */}
        <div className="insights-list">
          {analisis.insights.map((item, idx) => (
            <div key={idx} className={`insight-alert insight-${item.tipo}`}>
              <span className="insight-icon">{item.icono}</span>
              <span>{item.texto}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Sección de Desglose por Categorías con Barras Visuales */}
      <div className="stats-breakdown-section">
        <h3>Desglose por Categoría ({formatearMesNombre(mesSeleccionado)})</h3>
        {Object.keys(gastosPorCategoria).length === 0 ? (
          <p className="no-data-text">No hay gastos registrados en este mes para analizar.</p>
        ) : (
          <div className="category-bars-list">
            {Object.entries(gastosPorCategoria)
              .sort((a, b) => b[1] - a[1])
              .map(([categoria, monto]) => {
                const porcentaje = analisis.totalGastado > 0 ? (monto / analisis.totalGastado) * 100 : 0;
                return (
                  <div key={categoria} className="category-bar-item">
                    <div className="category-info">
                      <span className="cat-name">{categoria}</span>
                      <span className="cat-amount">${monto.toFixed(2)} ({porcentaje.toFixed(1)}%)</span>
                    </div>
                    <div className="progress-bar-background">
                      <div
                        className="progress-bar-fill"
                        style={{ width: `${porcentaje}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Statistics;