/* frontend/src/Pages/Statistics.jsx */
import React, { useState, useEffect, useRef } from 'react';
import {
  obtenerPresupuestoTotal,
  guardarPresupuestoTotal,
  obtenerAsignacionesCategoria,
  guardarAsignacionesCategoria,
  analizarDistribucionMes,
  formatearMoneda,
  normalizarCategoria,
  CATEGORIAS_BASE
} from '../utils/budgetInsights';
import '../Styles/Statistics.css';

const Statistics = () => {
  const [gastos, setGastos] = useState([]);
  const [presupuestoTotal, setPresupuestoTotal] = useState(() => obtenerPresupuestoTotal());
  const [inputTotal, setInputTotal] = useState(() => String(obtenerPresupuestoTotal()));

  const [asignaciones, setAsignaciones] = useState(() => obtenerAsignacionesCategoria());
  const [borradorAsignaciones, setBorradorAsignaciones] = useState(() => obtenerAsignacionesCategoria());
  const [editandoReparto, setEditandoReparto] = useState(false);
  const [mensajeGuardado, setMensajeGuardado] = useState('');

  // 'Todos' para vista global o 'YYYY-MM' para un mes específico
  const [mesSeleccionado, setMesSeleccionado] = useState(() => new Date().toISOString().slice(0, 7));
  const [menuMesAbierto, setMenuMesAbierto] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const gastosGuardados = JSON.parse(localStorage.getItem('sistema_gastos')) || [];
    setGastos(Array.isArray(gastosGuardados) ? gastosGuardados : []);
  }, []);

  useEffect(() => {
    const handleClickFuera = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setMenuMesAbierto(false);
      }
    };
    document.addEventListener('mousedown', handleClickFuera);
    return () => document.removeEventListener('mousedown', handleClickFuera);
  }, []);

  const esTodosLosMeses = mesSeleccionado === 'Todos';
  const mesActual = new Date().toISOString().slice(0, 7);

  const mesesDisponibles = [
    ...new Set([mesActual, ...gastos.map((g) => g.fecha?.slice(0, 7)).filter(Boolean)])
  ]
    .sort()
    .reverse();

  const formatearMesNombre = (anioMes) => {
    if (!anioMes) return '';
    if (anioMes === 'Todos') return 'Todos los meses';
    const [anio, mes] = anioMes.split('-');
    const fecha = new Date(parseInt(anio, 10), parseInt(mes, 10) - 1, 1);
    const nombreMes = fecha.toLocaleString('es-ES', { month: 'long' });
    return `${nombreMes.charAt(0).toUpperCase() + nombreMes.slice(1)} ${anio}`;
  };

  const handleGuardarTotal = (e) => {
    e.preventDefault();
    const nuevo = guardarPresupuestoTotal(inputTotal);
    if (!nuevo) return;
    setPresupuestoTotal(nuevo);
    setMensajeGuardado('Presupuesto mensual actualizado');
    setTimeout(() => setMensajeGuardado(''), 2500);
  };

  const handleCambioAsignacion = (categoria, valor) => {
    setBorradorAsignaciones((prev) => ({
      ...prev,
      [categoria]: valor === '' ? '' : Math.max(0, Number(valor))
    }));
  };

  const handleGuardarReparto = (e) => {
    e.preventDefault();
    const limpios = Object.entries(borradorAsignaciones).reduce((acc, [cat, val]) => {
      acc[cat] = Number(val) > 0 ? Number(val) : 0;
      return acc;
    }, {});
    guardarAsignacionesCategoria(limpios);
    setAsignaciones(limpios);
    setEditandoReparto(false);
    setMensajeGuardado('Reparto por categorías guardado');
    setTimeout(() => setMensajeGuardado(''), 2500);
  };

  // --- Datos para vista de un mes concreto ---
  const gastosMes = gastos.filter((g) => g.fecha && g.fecha.startsWith(mesSeleccionado));
  const analisis = analizarDistribucionMes(
    gastosMes,
    presupuestoTotal,
    asignaciones,
    esTodosLosMeses ? mesActual : mesSeleccionado
  );

  const sumaBorrador = Object.values(borradorAsignaciones).reduce(
    (acc, v) => acc + (Number(v) || 0),
    0
  );
  const diferenciaBorrador = presupuestoTotal - sumaBorrador;

  const categoriaMayor = analisis.categorias.find((c) => c.gastado > 0);
  const categoriasVisibles = analisis.categorias.filter((c) => c.gastado > 0 || c.asignado > 0);

  // --- Datos para vista global ("Todos los meses") ---
  const totalesPorMesMap = gastos.reduce((acc, item) => {
    if (!item.fecha) return acc;
    const claveMes = item.fecha.slice(0, 7);
    acc[claveMes] = (acc[claveMes] || 0) + (Number(item.monto) || 0);
    return acc;
  }, {});

  const mesesOrdenadosAsc = Object.keys(totalesPorMesMap).sort();
  const maxGastoMensual = mesesOrdenadosAsc.reduce(
    (max, m) => Math.max(max, totalesPorMesMap[m]),
    0
  );

  const serieMensualGlobal = mesesOrdenadosAsc.map((claveMes) => {
    const monto = totalesPorMesMap[claveMes];
    const porcentajeRelativo = maxGastoMensual > 0 ? (monto / maxGastoMensual) * 100 : 0;
    return {
      claveMes,
      etiqueta: formatearMesNombre(claveMes),
      monto,
      porcentajeRelativo
    };
  });

  const totalHistorico = gastos.reduce((acc, g) => acc + (Number(g.monto) || 0), 0);
  const cantidadMesesActivos = serieMensualGlobal.length;
  const promedioMensualGlobal =
    cantidadMesesActivos > 0 ? totalHistorico / cantidadMesesActivos : 0;

  const mesMayorConsumo = serieMensualGlobal.reduce(
    (mejor, actual) => (!mejor || actual.monto > mejor.monto ? actual : mejor),
    null
  );

  const acumuladoPorCategoriaMap = gastos.reduce((acc, item) => {
    const cat = normalizarCategoria(item.categoria);
    acc[cat] = (acc[cat] || 0) + (Number(item.monto) || 0);
    return acc;
  }, {});

  const categoriasGlobales = Object.entries(acumuladoPorCategoriaMap)
    .map(([nombre, gastado]) => {
      const meta = CATEGORIAS_BASE.find((c) => c.nombre === nombre);
      return {
        nombre,
        icono: meta ? meta.icono : '📦',
        gastado,
        porcentajeTotal: totalHistorico > 0 ? (gastado / totalHistorico) * 100 : 0
      };
    })
    .sort((a, b) => b.gastado - a.gastado);

  return (
    <div className="statistics-container">
      {/* Encabezado + Selector de Mes */}
      <div className="statistics-header-row">
        <div>
          <h2>📊 Estadísticas e Insights</h2>
          <p className="statistics-subtitle">
            {esTodosLosMeses
              ? 'Histórico global de gastos por mes y acumulado por categoría'
              : 'Presupuesto mensual, reparto por categoría y diagnóstico inteligente'}
          </p>
        </div>

        <div className="custom-month-dropdown" ref={dropdownRef}>
          <button
            type="button"
            className="custom-month-trigger"
            onClick={() => setMenuMesAbierto(!menuMesAbierto)}
          >
            <span className="month-trigger-left">
              <span>📅</span>
              <span>{formatearMesNombre(mesSeleccionado)}</span>
            </span>
            <span className={`month-chevron ${menuMesAbierto ? 'open' : ''}`}>▾</span>
          </button>

          {menuMesAbierto && (
            <div className="custom-month-menu">
              <button
                type="button"
                className={`custom-month-option ${esTodosLosMeses ? 'active' : ''}`}
                onClick={() => {
                  setMesSeleccionado('Todos');
                  setMenuMesAbierto(false);
                }}
              >
                <span>Todos los meses</span>
                {esTodosLosMeses && <span>✓</span>}
              </button>

              {mesesDisponibles.map((m) => (
                <button
                  key={m}
                  type="button"
                  className={`custom-month-option ${m === mesSeleccionado ? 'active' : ''}`}
                  onClick={() => {
                    setMesSeleccionado(m);
                    setMenuMesAbierto(false);
                  }}
                >
                  <span>{formatearMesNombre(m)}</span>
                  {m === mesSeleccionado && <span>✓</span>}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {esTodosLosMeses ? (
        <>
          {/* Tarjetas Resumen Global */}
          <div className="stats-cards-grid">
            <div className="stat-card">
              <h3>Gasto Histórico Total</h3>
              <p className="stat-value">${formatearMoneda(totalHistorico)}</p>
              <span className="stat-hint">
                en {cantidadMesesActivos} {cantidadMesesActivos === 1 ? 'mes' : 'meses'} con registros
              </span>
            </div>

            <div className="stat-card">
              <h3>Promedio Mensual</h3>
              <p className="stat-value">${formatearMoneda(promedioMensualGlobal)}</p>
              <span className="stat-hint">promedio por mes registrado</span>
            </div>

            <div className="stat-card">
              <h3>Mes de Mayor Consumo</h3>
              <p className="stat-value-small">
                {mesMayorConsumo && mesMayorConsumo.monto > 0
                  ? mesMayorConsumo.etiqueta
                  : 'Sin datos'}
              </p>
              <span className="stat-hint">
                {mesMayorConsumo && mesMayorConsumo.monto > 0
                  ? `$${formatearMoneda(mesMayorConsumo.monto)} gastados`
                  : '—'}
              </span>
            </div>
          </div>

          {/* Gráfica Global por Meses */}
          <div className="budget-insights-card">
            <div className="budget-header">
              <div>
                <h3>📈 Gráfica Global por Meses</h3>
                <p className="budget-sub">
                  Comparativa del gasto total en cada mes registrado
                </p>
              </div>
            </div>

            {serieMensualGlobal.length === 0 ? (
              <p className="no-data-text">No hay movimientos registrados todavía.</p>
            ) : (
              <div className="monthly-chart-list">
                {serieMensualGlobal.map((item) => (
                  <div key={item.claveMes} className="monthly-chart-row">
                    <div className="monthly-chart-meta">
                      <span className="monthly-chart-label">{item.etiqueta}</span>
                      <div className="monthly-chart-values">
                        <strong>${formatearMoneda(item.monto)}</strong>
                      </div>
                    </div>
                    <div className="progress-bar-background monthly-bar-track">
                      <div
                        className="progress-bar-fill monthly-bar-fill"
                        style={{ width: `${Math.max(item.porcentajeRelativo, item.monto > 0 ? 4 : 0)}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Acumulado Global por Categoría */}
          <div className="stats-breakdown-section">
            <div className="breakdown-header">
              <h3>Acumulado por Categoría (Todos los meses)</h3>
              <p className="budget-sub">
                Distribución histórica de tus gastos por rubro
              </p>
            </div>

            {categoriasGlobales.length === 0 ? (
              <p className="no-data-text">No hay gastos registrados para mostrar.</p>
            ) : (
              <div className="category-bars-list">
                {categoriasGlobales.map((cat) => (
                  <div key={cat.nombre} className="category-bar-item">
                    <div className="category-info">
                      <span className="cat-name">
                        {cat.icono} {cat.nombre}
                      </span>
                      <div className="cat-metrics">
                        <span className="cat-amount">
                          <strong>${formatearMoneda(cat.gastado)}</strong> acumulados
                        </span>
                      </div>
                    </div>
                    <div className="progress-bar-background">
                      <div
                        className="progress-bar-fill fill-normal"
                        style={{ width: `${Math.min(cat.porcentajeTotal, 100)}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      ) : (
        <>
          {/* Tarjetas de Resumen del Mes */}
          <div className="stats-cards-grid">
            <div className="stat-card">
              <h3>Gasto del Mes</h3>
              <p className="stat-value">${formatearMoneda(analisis.totalGastado)}</p>
              <span className="stat-hint">de ${formatearMoneda(analisis.presupuestoTotal)} presupuestados</span>
            </div>

            <div className="stat-card">
              <h3>Asignado en Categorías</h3>
              <p className="stat-value">${formatearMoneda(analisis.totalAsignado)}</p>
              <span className="stat-hint">
                {analisis.restantePorAsignar >= 0
                  ? `$${formatearMoneda(analisis.restantePorAsignar)} libres por asignar`
                  : `$${formatearMoneda(Math.abs(analisis.restantePorAsignar))} por encima del total`}
              </span>
            </div>

            <div className="stat-card">
              <h3>Mayor Consumo</h3>
              <p className="stat-value-small">
                {categoriaMayor ? `${categoriaMayor.icono} ${categoriaMayor.nombre}` : 'Sin datos'}
              </p>
              <span className="stat-hint">
                {categoriaMayor
                  ? `$${formatearMoneda(categoriaMayor.gastado)} de $${formatearMoneda(categoriaMayor.asignado)} asignados`
                  : '—'}
              </span>
            </div>
          </div>

          {/* Presupuesto Global, Reparto y Diagnóstico IA */}
          <div className="budget-insights-card">
            <div className="budget-header">
              <div>
                <h3>🎯 Presupuesto Mensual & Diagnóstico IA</h3>
                <p className="budget-sub">
                  Define tu monto total del mes y reparte cuánto planeas gastar en cada categoría
                </p>
              </div>

              <div className="budget-controls-right">
                {!editandoReparto && (
                  <form onSubmit={handleGuardarTotal} className="budget-global-form">
                    <div className="budget-input-group">
                      <span>$</span>
                      <input
                        type="number"
                        min="0.01"
                        step="0.01"
                        value={inputTotal}
                        onChange={(e) => setInputTotal(e.target.value)}
                        placeholder="1000.00"
                      />
                    </div>
                    <button type="submit" className="budget-save-btn">
                      Guardar Total
                    </button>
                  </form>
                )}

                <button
                  type="button"
                  className="budget-split-btn"
                  onClick={() => {
                    setBorradorAsignaciones(asignaciones);
                    setEditandoReparto(!editandoReparto);
                  }}
                >
                  {editandoReparto ? '✕ Cerrar reparto' : '🗂️ Repartir por categoría'}
                </button>
              </div>
            </div>

            {mensajeGuardado && <div className="budget-saved-toast">✓ {mensajeGuardado}</div>}

            {/* Panel para repartir el presupuesto total entre categorías */}
            {editandoReparto && (
              <form onSubmit={handleGuardarReparto} className="category-split-panel">
                <div className="split-summary-bar">
                  <span>
                    Repartido: <strong>${formatearMoneda(sumaBorrador)}</strong> de{' '}
                    <strong>${formatearMoneda(presupuestoTotal)}</strong>
                  </span>
                  <span className={diferenciaBorrador < 0 ? 'split-over' : 'split-ok'}>
                    {diferenciaBorrador >= 0
                      ? `Disponible para asignar: $${formatearMoneda(diferenciaBorrador)}`
                      : `Excedido en reparto: +$${formatearMoneda(Math.abs(diferenciaBorrador))}`}
                  </span>
                </div>

                <div className="category-split-grid">
                  {analisis.categorias.map((cat) => (
                    <div key={cat.nombre} className="split-input-card">
                      <label>
                        {cat.icono} {cat.nombre}
                      </label>
                      <div className="split-input-box">
                        <span>$</span>
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={borradorAsignaciones[cat.nombre] ?? ''}
                          onChange={(e) => handleCambioAsignacion(cat.nombre, e.target.value)}
                        />
                      </div>
                    </div>
                  ))}
                </div>

                <div className="split-actions">
                  <button type="submit" className="split-save-btn">
                    Guardar Reparto
                  </button>
                </div>
              </form>
            )}

            {/* Barra de consumo total vs presupuesto mensual */}
            <div className="budget-progress-wrapper">
              <div className="budget-numbers">
                <span>
                  Gastado este mes: <strong>${formatearMoneda(analisis.totalGastado)}</strong> de{' '}
                  <strong>${formatearMoneda(analisis.presupuestoTotal)}</strong>
                </span>
                <span className={`budget-percent badge-${analisis.estadoGlobal}`}>
                  {analisis.porcentajeGlobal.toFixed(1)}%
                </span>
              </div>

              <div className="progress-bar-background budget-bar-lg">
                <div
                  className={`progress-bar-fill fill-${analisis.estadoGlobal}`}
                  style={{ width: `${analisis.porcentajeBarraGlobal}%` }}
                ></div>
              </div>
            </div>

            {/* Insights y alertas */}
            <div className="insights-list">
              {analisis.estadoGlobal === 'excedido' && (
                <div className="insight-alert insight-danger">
                  <span>🚨</span>
                  <span>
                    <strong>Alerta IA:</strong> Superaste tu presupuesto mensual de $
                    {formatearMoneda(analisis.presupuestoTotal)} por{' '}
                    <strong>${formatearMoneda(Math.abs(analisis.restanteGlobal))}</strong>.
                  </span>
                </div>
              )}

              {analisis.estadoGlobal === 'alerta' && (
                <div className="insight-alert insight-warning">
                  <span>⚠️</span>
                  <span>
                    <strong>Aviso IA:</strong> Llevas el {analisis.porcentajeGlobal.toFixed(1)}% de tu presupuesto mensual;
                    te quedan <strong>${formatearMoneda(analisis.restanteGlobal)}</strong> disponibles.
                  </span>
                </div>
              )}

              {analisis.estadoGlobal === 'normal' && (
                <div className="insight-alert insight-success">
                  <span>✅</span>
                  <span>
                    <strong>Diagnóstico IA:</strong> Has usado el {analisis.porcentajeGlobal.toFixed(1)}% de tu presupuesto
                    mensual y aún tienes <strong>${formatearMoneda(analisis.restanteGlobal)}</strong> disponibles.
                  </span>
                </div>
              )}

              {analisis.categoriasExcedidas.length > 0 && (
                <div className="insight-alert insight-danger">
                  <span>📌</span>
                  <span>
                    <strong>Límite de categoría superado:</strong>{' '}
                    {analisis.categoriasExcedidas
                      .map(
                        (c) =>
                          `${c.nombre} ($${formatearMoneda(c.gastado)} / $${formatearMoneda(c.asignado)})`
                      )
                      .join(', ')}
                    .
                  </span>
                </div>
              )}

              {analisis.esMesActual && analisis.totalGastado > 0 && (
                <div
                  className={`insight-alert ${
                    analisis.proyectadoFinMes > analisis.presupuestoTotal ? 'insight-warning' : 'insight-info'
                  }`}
                >
                  <span>🤖</span>
                  <span>
                    <strong>Proyección IA:</strong> A tu ritmo promedio actual (~$
                    {formatearMoneda(analisis.promedioDiario)}/día), cerrarías el mes en{' '}
                    <strong>~${formatearMoneda(analisis.proyectadoFinMes)}</strong>
                    {analisis.proyectadoFinMes > analisis.presupuestoTotal
                      ? `, por encima de tu presupuesto de $${formatearMoneda(analisis.presupuestoTotal)}.`
                      : `, dentro de tu presupuesto de $${formatearMoneda(analisis.presupuestoTotal)}.`}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Desglose por Categoría frente a su monto asignado */}
          <div className="stats-breakdown-section">
            <div className="breakdown-header">
              <h3>Consumo por Categoría ({formatearMesNombre(mesSeleccionado)})</h3>
              <p className="budget-sub">
                Comparativa de lo gastado en cada rubro frente al monto asignado de tu presupuesto de $
                {formatearMoneda(analisis.presupuestoTotal)}
              </p>
            </div>

            {categoriasVisibles.length === 0 ? (
              <p className="no-data-text">No hay gastos ni asignaciones registradas para mostrar.</p>
            ) : (
              <div className="category-bars-list">
                {categoriasVisibles.map((cat) => (
                  <div key={cat.nombre} className="category-bar-item">
                    <div className="category-info">
                      <span className="cat-name">
                        {cat.icono} {cat.nombre}
                      </span>
                      <div className="cat-metrics">
                        <span className="cat-amount">
                          <strong>${formatearMoneda(cat.gastado)}</strong> / ${formatearMoneda(cat.asignado)} asignados ·{' '}
                          {cat.disponibleCat >= 0
                            ? `Quedan $${formatearMoneda(cat.disponibleCat)}`
                            : `Excedido por $${formatearMoneda(Math.abs(cat.disponibleCat))}`}
                        </span>
                        <span className={`cat-pill pill-${cat.estado}`}>
                          {cat.porcentajeUso > 99 && cat.porcentajeUso < 100
                            ? `${cat.porcentajeUso.toFixed(1)}%`
                            : `${cat.porcentajeUso.toFixed(0)}%`}
                        </span>
                      </div>
                    </div>
                    <div className="progress-bar-background">
                      <div
                        className={`progress-bar-fill fill-${cat.estado}`}
                        style={{ width: `${cat.porcentajeBarra}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default Statistics;