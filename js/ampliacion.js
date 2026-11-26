// Amplía cada sección con más contenido y una galería de imágenes de referencia.
// Imágenes: API pública de Wikipedia en español (sin clave, con CORS: origin=*).
(function () {
  'use strict';

  // Por sección: texto adicional (html) y títulos de artículos de Wikipedia para las imágenes.
  const EXTRA = {
    introduccion: {
      titulos: ['La Paz (Bolivia)', 'Mi Teleférico', 'Algoritmo de Dijkstra', 'Logística'],
      html: `<h2>Contexto de la ciudad</h2>
<p>La Paz es la sede de gobierno de Bolivia y una de las ciudades más altas del mundo, con desniveles de cientos de metros entre El Alto, el centro y la Zona Sur. Ese relieve hace que dos puntos cercanos en línea recta puedan estar lejos por calle.</p>
<h2>Qué obtendrás con RouteFlow</h2>
<ul><li>Una ruta óptima calculada en milisegundos.</li><li>Una animación que muestra cómo piensa el algoritmo.</li><li>Tablas con distancia, tiempo estimado y decisiones tomadas.</li></ul>
<div class="box"><b>Idea central:</b> convertir un problema de calles y esquinas en un problema de grafos, donde existen algoritmos probados para resolverlo.</div>`
    },
    problema: {
      titulos: ['Problema del camino más corto', 'Tráfico', 'Logística'],
      html: `<h2>Impacto de una mala ruta</h2>
<ul><li><b>Tiempo:</b> cada kilómetro extra en tráfico urbano suma minutos por entrega.</li><li><b>Costo:</b> más combustible y más desgaste del vehículo.</li><li><b>Servicio:</b> entregas tardías y clientes insatisfechos.</li></ul>
<h2>Formulación matemática</h2>
<p>Dado G = (V, E) con pesos w(e) ≥ 0, hallar el camino P de s a t que minimice la suma de w(e) para e en P. Es el problema del camino más corto de origen único.</p>
<h2>Ejemplo del crecimiento</h2>
<p>Con 10 puntos hay miles de recorridos posibles; con 20, millones. Revisar todos es inviable, por eso se necesita un algoritmo que descarte opciones peores de forma sistemática.</p>`
    },
    objetivos: {
      titulos: ['Logística', 'Optimización matemática', 'OpenStreetMap'],
      html: `<h2>Cómo se mide el logro</h2>
<ul><li>La ruta devuelta coincide con la mejor ruta posible en el grafo de ejemplo.</li><li>El usuario puede cambiar origen y destino y ver el resultado al instante.</li><li>Cada paso del algoritmo queda registrado y explicado en una tabla.</li></ul>
<h2>Alcance</h2>
<p>El proyecto cubre un camino entre dos puntos sobre un mapa reducido. No incluye tráfico en vivo ni varias entregas encadenadas; eso se menciona como trabajo futuro.</p>`
    },
    grafos: {
      titulos: ['Teoría de grafos', 'Grafo ponderado', 'Leonhard Euler', 'Problema de los puentes de Königsberg'],
      html: `<h2>Origen histórico</h2>
<p>La teoría de grafos nació en 1736 cuando Leonhard Euler resolvió el problema de los puentes de Königsberg: modeló las zonas de tierra como vértices y los puentes como aristas.</p>
<h2>Terminología adicional</h2>
<ul><li><b>Grado:</b> número de aristas que llegan a un vértice (cuántas calles salen de una esquina).</li><li><b>Subgrafo:</b> parte del grafo; por ejemplo, solo las calles de un barrio.</li><li><b>Árbol:</b> grafo conexo sin ciclos.</li></ul>
<h2>Ejemplo en La Paz</h2>
<p>Plaza Murillo → Av. Mariscal Santa Cruz → Estación del teleférico: tres vértices y dos aristas con distancias en km. La suma de ambas es el costo del camino.</p>`
    },
    repr: {
      titulos: ['Matriz de adyacencia', 'Lista de adyacencia', 'Montículo binario'],
      html: `<h2>Ejemplo con 4 nodos</h2>
<div class="box formula">Aristas: A–B (2), A–C (5), B–C (1), C–D (3)

Matriz:            Lista:
    A B C D        A: [(B,2), (C,5)]
A [ 0 2 5 ∞ ]      B: [(A,2), (C,1)]
B [ 2 0 1 ∞ ]      C: [(A,5), (B,1), (D,3)]
C [ 5 1 0 3 ]      D: [(C,3)]
D [ ∞ ∞ 3 0 ]</div>
<p>Con 1000 intersecciones, la matriz guardaría un millón de celdas aunque cada esquina tenga solo 3 o 4 calles. La lista guarda apenas unos miles de entradas.</p>
<h2>Cola de prioridad</h2>
<p>Para elegir el siguiente vértice con menor distancia, un heap binario permite extraer el mínimo en O(log V) en lugar de recorrer todos los vértices.</p>`
    },
    dijkstra: {
      titulos: ['Algoritmo de Dijkstra', 'Edsger Dijkstra', 'Algoritmo de búsqueda A*', 'Algoritmo de Bellman-Ford', 'Algoritmo de Floyd-Warshall'],
      html: `<h2>Idea intuitiva</h2>
<p>Imagina una mancha de agua que se expande desde el origen a velocidad constante: llega primero a lo más cercano y después a lo más lejano. Dijkstra simula esa expansión.</p>
<h2>Invariante</h2>
<p>Cuando un vértice se fija, su distancia ya es la mínima posible. Por eso el algoritmo puede terminar en cuanto fija el destino, como hace RouteFlow.</p>
<h2>Seguimiento resumido</h2>
<div class="scroll"><table class="cmp"><tr><th>Paso</th><th>Fijado</th><th>A</th><th>B</th><th>C</th><th>D</th></tr>
<tr><td>0</td><td>—</td><td>0</td><td>∞</td><td>∞</td><td>∞</td></tr>
<tr><td>1</td><td>A</td><td>0</td><td>2</td><td>5</td><td>∞</td></tr>
<tr><td>2</td><td>B</td><td>0</td><td>2</td><td>3</td><td>∞</td></tr>
<tr><td>3</td><td>C</td><td>0</td><td>2</td><td>3</td><td>6</td></tr></table></div>
<p>Nota cómo C baja de 5 a 3 al pasar por B: eso es la relajación.</p>
<h2>Cuándo elegir cada algoritmo</h2>
<ul><li><b>Dijkstra:</b> un origen, pesos no negativos.</li><li><b>A*:</b> un origen y un destino con coordenadas; la heurística acelera la búsqueda.</li><li><b>Bellman-Ford:</b> hay pesos negativos.</li><li><b>Floyd-Warshall:</b> se necesitan todas las parejas de puntos.</li></ul>`
    },
    demo: {
      titulos: ['Algoritmo de Dijkstra'],
      html: `<h2>Cómo leer la demo</h2>
<ul><li><b>Nodo amarillo:</b> el vértice que se está fijando en este paso.</li><li><b>Nodo verde:</b> vértice ya fijado, con distancia definitiva.</li><li><b>Arista punteada:</b> calle que se está relajando.</li><li><b>Celda verde en la tabla:</b> distancia definitiva.</li></ul>
<p><b>Pruébalo:</b> avanza paso a paso y, antes de pulsar, intenta predecir qué vértice se fijará. Si aciertas, entendiste el algoritmo.</p>`
    },
    refs: {
      titulos: ['Introduction to Algorithms', 'Edsger Dijkstra', 'Numerische Mathematik', 'OpenStreetMap'],
      html: `<h2>Cómo usar estas fuentes</h2>
<ul><li><b>Cormen et al.:</b> demostración formal de la corrección de Dijkstra.</li><li><b>Sedgewick y Wayne:</b> implementaciones y visualizaciones.</li><li><b>Skiena:</b> catálogo de problemas y cuándo aplicar cada algoritmo.</li><li><b>Dijkstra (1959):</b> el artículo original, de apenas tres páginas.</li></ul>
<p class="note">Las imágenes provienen de Wikipedia y Wikimedia Commons, obtenidas con su API pública; cada una enlaza a su artículo de origen y a su licencia.</p>`
    },
    aplicacion: {
      titulos: ['La Paz (Bolivia)', 'Plaza Murillo', 'Mi Teleférico', 'OpenStreetMap'],
      html: `<h2>Guía de uso</h2>
<ol><li>Elige origen y destino, o haz clic en dos puntos del mapa.</li><li>Pulsa <b>Calcular ruta</b> y observa los nodos explorados en amarillo.</li><li>Revisa las tablas: la primera es el recorrido y la segunda justifica cada decisión.</li><li>Con <b>Agregar punto</b> y <b>Conectar calle</b> crea un caso propio y vuelve a calcular.</li></ol>
<h2>Cómo se calcula el tiempo</h2>
<p>tiempo = distancia total / 20 km/h. Es un promedio de tráfico urbano; en horas pico real el valor puede ser menor.</p>
<h2>Sugerencias para pruebas</h2>
<ul><li>Conecta dos puntos con una calle muy corta y verifica que la ruta cambie.</li><li>Prueba un destino igual al origen: la distancia debe ser 0.</li></ul>`
    },
    conclusiones: {
      titulos: ['Investigación de operaciones', 'Logística', 'Algoritmo de búsqueda A*', 'Problema del viajante'],
      html: `<h2>Aprendizajes</h2>
<ul><li>Un problema de la vida diaria puede abstraerse a un modelo matemático claro.</li><li>La eficiencia depende tanto del algoritmo como de la estructura de datos.</li><li>Mostrar los pasos hace el algoritmo comprensible para cualquiera.</li></ul>
<h2>Aplicaciones reales de lo aprendido</h2>
<p>El mismo enfoque se usa en aplicaciones de navegación, enrutamiento de redes de internet, logística de empresas de reparto y planificación de transporte público.</p>`
    }
  };

  const API = 'https://es.wikipedia.org/w/api.php';

  async function imagenes(titulos) {
    const url = API + '?action=query&format=json&origin=*&redirects=1&prop=pageimages|info' +
      '&piprop=thumbnail&pithumbsize=480&inprop=url&titles=' + encodeURIComponent(titulos.join('|'));
    const r = await fetch(url);
    if (!r.ok) throw new Error('HTTP ' + r.status);
    const j = await r.json();
    return Object.values((j.query && j.query.pages) || {})
      .filter(p => p.thumbnail)
      .map(p => ({ titulo: p.title, src: p.thumbnail.source, enlace: p.fullurl }));
  }

  function esc(s) { return String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c])); }

  async function cargarGaleria(cont, titulos) {
    try {
      const imgs = await imagenes(titulos);
      if (!imgs.length) { cont.remove(); return; }
      cont.innerHTML = '<h2>Imágenes de referencia</h2><div class="gal">' + imgs.map(i =>
        `<figure><a href="${esc(i.enlace)}" target="_blank" rel="noopener"><img src="${esc(i.src)}" alt="${esc(i.titulo)}" loading="lazy"></a>` +
        `<figcaption>${esc(i.titulo)} · <a href="${esc(i.enlace)}" target="_blank" rel="noopener">Wikipedia</a></figcaption></figure>`).join('') + '</div>';
    } catch (e) {
      cont.innerHTML = '<p class="note">No se pudieron cargar las imágenes de referencia (revisa tu conexión).</p>';
    }
  }

  function iniciar() {
    Object.keys(EXTRA).forEach(id => {
      const sec = document.getElementById(id);
      if (!sec) return;
      const bloque = document.createElement('div');
      bloque.className = 'ampl';
      bloque.innerHTML = EXTRA[id].html;
      const gal = document.createElement('div');
      gal.className = 'galwrap';
      bloque.appendChild(gal);
      const pager = sec.querySelector('.pager');
      sec.insertBefore(bloque, pager || null);
      // Carga diferida: solo cuando la sección se muestra por primera vez.
      let hecho = false;
      const cargar = () => { if (!hecho) { hecho = true; cargarGaleria(gal, EXTRA[id].titulos); } };
      if (sec.classList.contains('on')) cargar();
      new MutationObserver(() => { if (sec.classList.contains('on')) cargar(); })
        .observe(sec, { attributes: true, attributeFilter: ['class'] });
    });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', iniciar);
  else iniciar();
})();