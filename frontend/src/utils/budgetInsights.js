/* frontend/src/utils/budgetInsights.js */

const CLAVE_PRESUPUESTO = 'sistema_gastos_presupuesto';

export const obtenerPresupuestoMensual = () => {
  const guardado = localStorage.getItem(CLAVE_PRESUPUESTO);
  const valor = guardado ? parseFloat(guardado) : 500;
  return Number.isFinite(valor) && valor > 0 ? valor : 500;
};

export const guardarPresupuestoMensual = (monto) => {
  const limpio = parseFloat(monto);
  if (!Number.isFinite(limpio) || limpio <= 0) return null;
  localStorage.setItem(CLAVE_PRESUPUESTO, String(limpio));
  return limpio;
};

export const analizarPresupuesto = (gastosMes, presupuestoMensual, mesSeleccionado) => {
  const totalGastado = gastosMes.reduce((acc, item) => acc + (Number(item.monto) || 0), 0);
  const presupuesto = Number(presupuestoMensual) > 0 ? Number(presupuestoMensual) : 1;

  const porcentaje = (totalGastado / presupuesto) * 100;
  const porcentajeBarra = Math.min(porcentaje, 100);
  const diferencia = presupuesto - totalGastado;

  let estado = 'normal'; // 'normal' | 'alerta' | 'excedido'
  if (porcentaje >= 100) {
    estado = 'excedido';
  } else if (porcentaje >= 75) {
    estado = 'alerta';
  }

  // Cálculo de proyección según el mes seleccionado ("YYYY-MM")
  const [anioStr, mesStr] = mesSeleccionado.split('-');
  const anio = parseInt(anioStr, 10);
  const mes = parseInt(mesStr, 10) - 1;
  const diasEnMes = new Date(anio, mes + 1, 0).getDate();

  const hoy = new Date();
  const esMesActual = hoy.getFullYear() === anio && hoy.getMonth() === mes;
  const diaTranscurrido = esMesActual ? Math.max(hoy.getDate(), 1) : diasEnMes;

  const promedioDiario = totalGastado / diaTranscurrido;
  const proyectadoFinMes = promedioDiario * diasEnMes;

  const insights = [];

  if (estado === 'excedido') {
    insights.push({
      tipo: 'danger',
      icono: '🚨',
      texto: `¡Alerta! Superaste tu presupuesto mensual por $${Math.abs(diferencia).toFixed(2)} (${porcentaje.toFixed(1)}% usado).`
    });
  } else if (estado === 'alerta') {
    insights.push({
      tipo: 'warning',
      icono: '⚠️',
      texto: `Precaución: ya consumiste el ${porcentaje.toFixed(1)}% de tu presupuesto. Te quedan $${diferencia.toFixed(2)} disponibles.`
    });
  } else {
    insights.push({
      tipo: 'success',
      icono: '✅',
      texto: `Vas muy bien: has usado el ${porcentaje.toFixed(1)}% de tu presupuesto y aún cuentas con $${diferencia.toFixed(2)}.`
    });
  }

  if (totalGastado > 0) {
    if (esMesActual && proyectadoFinMes > presupuesto && estado !== 'excedido') {
      insights.push({
        tipo: 'warning',
        icono: '📈',
        texto: `Predicción de ritmo: gastando ~$${promedioDiario.toFixed(2)}/día, cerrarías el mes alrededor de $${proyectadoFinMes.toFixed(2)}, superando tu meta.`
      });
    } else if (esMesActual) {
      insights.push({
        tipo: 'info',
        icono: '🧠',
        texto: `Proyección a fin de mes: ~$${proyectadoFinMes.toFixed(2)} (promedio de $${promedioDiario.toFixed(2)} diarios).`
      });
    }
  }

  return {
    totalGastado,
    presupuesto,
    porcentaje,
    porcentajeBarra,
    diferencia,
    estado,
    insights
  };
};