/* frontend/src/utils/budgetInsights.js */

const CLAVE_PRESUPUESTO_TOTAL = 'sistema_gastos_presupuesto_total';
const CLAVE_ASIGNACIONES_CAT = 'sistema_gastos_asignaciones_cat';

export const CATEGORIAS_BASE = [
  { nombre: 'Alimentos', icono: '🍔', asignacionDefecto: 60 },
  { nombre: 'Transporte', icono: '🚗', asignacionDefecto: 80 },
  { nombre: 'Servicios', icono: '💡', asignacionDefecto: 100 },
  { nombre: 'Suscripciones', icono: '⚡', asignacionDefecto: 50 },
  { nombre: 'Entretenimiento', icono: '🎮', asignacionDefecto: 70 },
  { nombre: 'Tecnología', icono: '💻', asignacionDefecto: 250 },
  { nombre: 'Hogar', icono: '🏠', asignacionDefecto: 150 },
  { nombre: 'Otros', icono: '📦', asignacionDefecto: 100 }
];

export const formatearMoneda = (valor) => {
  const numero = Number(valor);
  if (!Number.isFinite(numero)) return '0.00';
  return numero.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
};

export const normalizarCategoria = (cat) => {
  if (!cat) return 'Otros';
  const limpia = cat.trim();
  if (limpia.toLowerCase() === 'alimentación' || limpia.toLowerCase() === 'alimentacion') {
    return 'Alimentos';
  }
  return limpia;
};

export const obtenerPresupuestoTotal = () => {
  const guardado = parseFloat(localStorage.getItem(CLAVE_PRESUPUESTO_TOTAL));
  return Number.isFinite(guardado) && guardado > 0 ? guardado : 1000;
};

export const guardarPresupuestoTotal = (monto) => {
  const limpio = parseFloat(monto);
  if (!Number.isFinite(limpio) || limpio <= 0) return null;
  localStorage.setItem(CLAVE_PRESUPUESTO_TOTAL, String(limpio));
  return limpio;
};

export const obtenerAsignacionesCategoria = () => {
  const defaults = CATEGORIAS_BASE.reduce((acc, item) => {
    acc[item.nombre] = item.asignacionDefecto;
    return acc;
  }, {});

  try {
    const guardado = JSON.parse(localStorage.getItem(CLAVE_ASIGNACIONES_CAT));
    if (guardado && typeof guardado === 'object') {
      return { ...defaults, ...guardado };
    }
  } catch (e) {
    console.error('Error leyendo asignaciones por categoría:', e);
  }
  return defaults;
};

export const guardarAsignacionesCategoria = (asignaciones) => {
  localStorage.setItem(CLAVE_ASIGNACIONES_CAT, JSON.stringify(asignaciones));
  return asignaciones;
};

export const analizarDistribucionMes = (gastosMes, presupuestoTotal, asignacionesCat, mesSeleccionado) => {
  const gastadoPorCat = gastosMes.reduce((acc, item) => {
    const cat = normalizarCategoria(item.categoria);
    acc[cat] = (acc[cat] || 0) + (Number(item.monto) || 0);
    return acc;
  }, {});

  const totalGastado = Object.values(gastadoPorCat).reduce((a, b) => a + b, 0);
  const totalAsignado = Object.values(asignacionesCat).reduce((a, b) => a + (Number(b) || 0), 0);
  const restantePorAsignar = presupuestoTotal - totalAsignado;

  const porcentajeGlobal = presupuestoTotal > 0 ? (totalGastado / presupuestoTotal) * 100 : 0;
  const restanteGlobal = presupuestoTotal - totalGastado;

  let estadoGlobal = 'normal';
  if (porcentajeGlobal >= 100) estadoGlobal = 'excedido';
  else if (porcentajeGlobal >= 75) estadoGlobal = 'alerta';

  const nombresCategorias = Array.from(
    new Set([...CATEGORIAS_BASE.map((c) => c.nombre), ...Object.keys(gastadoPorCat)])
  );

  const categorias = nombresCategorias
    .map((nombre) => {
      const meta = CATEGORIAS_BASE.find((c) => c.nombre === nombre);
      const icono = meta ? meta.icono : '📦';
      const gastado = gastadoPorCat[nombre] || 0;
      const asignado = Number(asignacionesCat[nombre]) || 0;

      const porcentajeUso = asignado > 0 ? (gastado / asignado) * 100 : gastado > 0 ? 100 : 0;
      const porcentajeDeBolsa = presupuestoTotal > 0 ? (asignado / presupuestoTotal) * 100 : 0;
      const disponibleCat = asignado - gastado;

      let estado = 'normal';
      if (asignado > 0 && gastado > asignado) estado = 'excedido';
      else if (asignado > 0 && porcentajeUso >= 75) estado = 'alerta';
      else if (asignado === 0 && gastado > 0) estado = 'excedido';

      return {
        nombre,
        icono,
        gastado,
        asignado,
        disponibleCat,
        porcentajeUso,
        porcentajeBarra: Math.min(porcentajeUso, 100),
        porcentajeDeBolsa,
        estado
      };
    })
    .sort((a, b) => b.gastado - a.gastado || b.asignado - a.asignado);

  // Proyección del mes según ritmo diario
  const [anioStr, mesStr] = mesSeleccionado.split('-');
  const anio = parseInt(anioStr, 10);
  const mes = parseInt(mesStr, 10) - 1;
  const diasEnMes = new Date(anio, mes + 1, 0).getDate();
  const hoy = new Date();
  const esMesActual = hoy.getFullYear() === anio && hoy.getMonth() === mes;
  const diaTranscurrido = esMesActual ? Math.max(hoy.getDate(), 1) : diasEnMes;
  const promedioDiario = totalGastado / diaTranscurrido;
  const proyectadoFinMes = promedioDiario * diasEnMes;

  const categoriasExcedidas = categorias.filter((c) => c.estado === 'excedido');

  return {
    totalGastado,
    presupuestoTotal,
    totalAsignado,
    restantePorAsignar,
    porcentajeGlobal,
    porcentajeBarraGlobal: Math.min(porcentajeGlobal, 100),
    restanteGlobal,
    estadoGlobal,
    categorias,
    categoriasExcedidas,
    esMesActual,
    promedioDiario,
    proyectadoFinMes
  };
};