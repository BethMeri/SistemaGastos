/* frontend/src/utils/smartParser.js */

export const parsearGastoInteligente = (texto) => {
  if (!texto || typeof texto !== 'string') return null;

  const textoLower = texto.toLowerCase();

  // 1. Extracción de Monto (busca números enteros o decimales como 15, 12.50, etc.)
  const regexMonto = /\d+(\.\d{1,2})?/;
  const matchMonto = texto.match(regexMonto);
  const monto = matchMonto ? parseFloat(matchMonto[0]) : 0;

  // 2. Detección Inteligente de Categoría basada en palabras clave (NLP heurístico)
  let categoria = 'Otros';

  if (/almuerzo|comida|desayuno|merienda|super|supermercado|restaurante|mcdonalds|eddy|cafe|sweet|pizza|hamburguesa/i.test(textoLower)) {
    categoria = 'Alimentación';
  } else if (/uber|taxi|gasolina|transporte|bus|pasaje|peaje/i.test(textoLower)) {
    categoria = 'Transporte';
  } else if (/cine|netflix|juego|steam|spotify|diversion|pelicula|juegos/i.test(textoLower)) {
    categoria = 'Entretenimiento';
  } else if (/ropa|zapatos|camisa|compras|tienda/i.test(textoLower)) {
    categoria = 'Compras';
  } else if (/luz|agua|internet|telefono|recarga|plan|servicios/i.test(textoLower)) {
    categoria = 'Servicios';
  }

  // 3. Limpieza de descripción (remueve el número detectado para dejar el concepto limpio)
  let descripcion = texto.replace(regexMonto, '').replace(/gast[eé]|pagu[eé]|cost[oó]|\$/gi, '').trim();
  
  // Si la descripción queda vacía, le ponemos un valor por defecto descriptivo
  if (!descripcion) {
    descripcion = 'Gasto rápido con IA';
  }

  // Capitalizamos la primera letra de la descripción
  descripcion = descripcion.charAt(0).toUpperCase() + descripcion.slice(1);

  return {
    id: Date.now(),
    monto,
    categoria,
    descripcion,
    fecha: new Date().toISOString().split('T')[0] // Fecha actual en formato YYYY-MM-DD
  };
};