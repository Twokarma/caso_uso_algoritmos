// Datos de La Paz, Bolivia. Coordenadas aproximadas [nombre, latitud, longitud].
// Puedes corregirlas o agregar más puntos: abre Google Maps, clic derecho en el lugar y copia las coordenadas.
const CITY = { center: [-16.5100, -68.1250], zoom: 13 };

const PLACES = [
  ["Depósito Central",      -16.4895, -68.1395], // 0  (punto de salida)
  ["Plaza Murillo",         -16.4955, -68.1336], // 1
  ["Plaza San Francisco",   -16.4965, -68.1373], // 2
  ["Mercado Lanza",         -16.4975, -68.1357], // 3
  ["Terminal de Buses",     -16.4952, -68.1507], // 4
  ["Cementerio General",    -16.4937, -68.1440], // 5
  ["Villa Fátima",          -16.4859, -68.1239], // 6
  ["Estadio Hernando Siles",-16.5051, -68.1226], // 7
  ["Monoblock UMSA",        -16.5043, -68.1303], // 8
  ["Plaza Abaroa",          -16.5114, -68.1262], // 9
  ["Obrajes",               -16.5262, -68.1085], // 10
  ["San Miguel",            -16.5330, -68.0880], // 11
  ["Calacoto",              -16.5405, -68.0825]  // 12
];

// Calles que conectan los puntos (pares de índices de PLACES)
const LINKS = [
  [0,1],[0,2],[0,5],[0,6],[1,2],[1,3],[2,3],[2,5],[5,4],[3,8],[1,8],[1,6],
  [6,7],[8,7],[8,9],[7,9],[9,10],[7,10],[10,11],[10,12],[11,12]
];

// Distancia en línea recta (fórmula de Haversine) en km
function hav(a, b) {
  const R = 6371, rad = Math.PI / 180;
  const dLat = (b.lat - a.lat) * rad, dLng = (b.lng - a.lng) * rad;
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(a.lat * rad) * Math.cos(b.lat * rad) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}
// Peso de la calle: distancia recta x 1.35 (las calles de La Paz no son rectas por la topografía)
function roadKm(a, b) { return Math.max(0.1, Math.round(hav(a, b) * 1.35 * 10) / 10); }