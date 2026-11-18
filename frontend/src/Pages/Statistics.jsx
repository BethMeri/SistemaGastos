import React, { useState, useEffect } from 'react';
import '../Styles/Statistics.css';

const Statistics = () => {
  const [gastos, setGastos] = useState([]);

  // Cargar los gastos del localStorage al montar el componente
  useEffect(() => {
    const gastosGuardados = JSON.parse(localStorage.getItem('gastos')) || [];
    setGastos(gastosGuardados);
  }, []);

  // Calcular el total general
  const totalGastos = gastos.reduce((acc, item) => acc + Number(item.monto || 0), 0);

  // Agrupar gastos por categoría
  const gastosPorCategoria = gastos.reduce((acc, item) => {
    const categoria = item.categoria || 'Otros';
    acc[categoria] = (acc[categoria] || 0) + Number(item.monto || 0);
    return acc;
  }, {});

  // Encontrar la categoría con mayor gasto
  const categoriaMayor = Object.entries(gastosPorCategoria).reduce(
    (max, [cat, monto]) => (monto > (max.monto || 0) ? { cat, monto } : max),
    {}
  );

  return (
    <div className="statistics-container">
      <h2>📊 Estadísticas de Gastos</h2>
      <p className="statistics-subtitle">Análisis visual y resumen de tus finanzas personales</p>

      {/* Tarjetas de Resumen Rápido */}
      <div className="stats-cards-grid">
        <div className="stat-card">
          <h3>Gasto Total</h3>
          <p className="stat-value">${totalGastos.toFixed(2)}</p>
        </div>
        <div className="stat-card">
          <h3>Total de Registros</h3>
          <p className="stat-value">{gastos.length}</p>
        </div>
        <div className="stat-card">
          <h3>Categoría Principal</h3>
          <p className="stat-value-small">
            {categoriaMayor.cat ? `${categoriaMayor.cat} ($${categoriaMayor.monto.toFixed(2)})` : 'N/A'}
          </p>
        </div>
      </div>

      {/* Sección de Desglose por Categorías con Barras Visuales */}
      <div className="stats-breakdown-section">
        <h3>Desglose por Categoría</h3>
        {Object.keys(gastosPorCategoria).length === 0 ? (
          <p className="no-data-text">No hay gastos registrados todavía para analizar.</p>
        ) : (
          <div className="category-bars-list">
            {Object.entries(gastosPorCategoria).map(([categoria, monto]) => {
              const porcentaje = totalGastos > 0 ? (monto / totalGastos) * 100 : 0;
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