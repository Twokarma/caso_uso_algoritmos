const $ = id => document.getElementById(id);
const BASE = { color: "#6b7a88", weight: 3, opacity: .8, dashArray: "2 7" };
const KMH = 20;                                   // velocidad urbana para estimar el tiempo
let nodes, edges, mode = "view", sel = null, run = 0;
let map, edgeLines = [], pins = [], routeLine = null, rider = null;
const sleep = ms => new Promise(r => setTimeout(r, ms));
const spd = () => +$("spd").value;
const ll = i => [nodes[i].lat, nodes[i].lng];
const mins = km => km / KMH * 60;
const f1 = v => v.toFixed(1);
const esc = s => String(s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
const hn = i => esc(nodes[i].name);

/* ---------- Navegación: menú lateral, una pantalla por parte ---------- */
const links = [...document.querySelectorAll("#side nav a")];
const pages = links.map(a => a.getAttribute("href").slice(1));
function route() {
  let h = location.hash.slice(1); if (!pages.includes(h)) h = pages[0];
  pages.forEach(p => $(p).classList.toggle("on", p === h));
  links.forEach(a => a.classList.toggle("on", a.getAttribute("href") === "#" + h));
  document.body.classList.remove("menu");
  window.scrollTo(0, 0);
  if (h === "aplicacion" && map) setTimeout(() => map.invalidateSize(), 50);
}
addEventListener("hashchange", route);
$("menuBtn").onclick = () => document.body.classList.toggle("menu");
pages.forEach((p, i) => {                         // botones Anterior / Siguiente al final de cada pantalla
  const d = document.createElement("div"); d.className = "pager";
  d.innerHTML = (i ? `<a href="#${pages[i - 1]}">← ${links[i - 1].textContent}</a>` : "<span></span>") +
    (i < pages.length - 1 ? `<a href="#${pages[i + 1]}">${links[i + 1].textContent} →</a>` : "");
  $(p).appendChild(d);
});

/* ---------- Mapa ---------- */
function init() {
  map = L.map("map").setView(CITY.center, CITY.zoom);
  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", { maxZoom: 19, attribution: "© OpenStreetMap" }).addTo(map);
  map.on("click", onMap);
  load();
}
function mk(a, b) { return { a, b, w: roadKm(nodes[a], nodes[b]) }; }
function load() {
  nodes = PLACES.map(p => ({ name: p[0], lat: p[1], lng: p[2] }));
  edges = LINKS.map(l => mk(l[0], l[1]));
  build(); fillSel(); clearAll();
}
function build() {
  edgeLines.forEach(l => l.remove()); pins.forEach(m => m.remove()); edgeLines = []; pins = [];
  edges.forEach(e => {
    const l = L.polyline([ll(e.a), ll(e.b)], BASE).addTo(map);
    l.bindTooltip(e.w + " km", { permanent: true, direction: "center", className: "wt" });
    edgeLines.push(l);
  });
  nodes.forEach((n, i) => {
    const m = L.marker([n.lat, n.lng], {
      title: n.name,
      icon: L.divIcon({ className: "pinwrap" + (i === 0 ? " dep" : ""), html: '<div class="pin"></div><span class="pl">' + esc(n.name) + "</span>", iconSize: [18, 18], iconAnchor: [9, 9] })
    }).addTo(map);
    m.on("click", () => pick(i)); pins.push(m);
  });
}
function fillSel() {
  ["from", "to"].forEach((id, k) => {
    const s = $(id), v = s.value;
    s.innerHTML = nodes.map((n, j) => `<option value="${j}">${esc(n.name)}</option>`).join("");
    s.value = v !== "" && +v < nodes.length ? v : (k ? 9 : 0);
  });
}
const cls = (l, c, on) => { const e = l.getElement(); if (e) e.classList.toggle(c, on); };
const mcls = (i, c, on) => { const e = pins[i].getElement(); if (e) e.classList.toggle(c, on); };
function countTo(id, val, fmt) {
  const el = $(id), t0 = performance.now(), dur = 900;
  (function f(now) { const p = Math.min(1, (now - t0) / dur); el.textContent = fmt(val * (1 - Math.pow(1 - p, 3))); if (p < 1) requestAnimationFrame(f); })(t0);
}
function clearAll() {
  run++;
  edgeLines.forEach(l => { l.setStyle(BASE); cls(l, "flow", false); });
  pins.forEach((m, i) => ["visit", "on", "sel"].forEach(c => mcls(i, c, false)));
  if (routeLine) { routeLine.remove(); routeLine = null; }
  if (rider) { rider.remove(); rider = null; }
  $("out").hidden = true; sel = null;
  $("rP").textContent = "Elige origen y destino (o haz clic en dos puntos del mapa) y pulsa Calcular ruta.";
}

/* ---------- Edición del grafo ---------- */
function pick(i) {
  if (mode === "con") {
    if (sel === null) { sel = i; mcls(i, "sel", true); return; }
    if (sel !== i && !edges.some(e => (e.a === sel && e.b === i) || (e.a === i && e.b === sel))) edges.push(mk(sel, i));
    build(); clearAll(); return;
  }
  if (sel === null) { $("from").value = i; sel = i; mcls(i, "sel", true); }
  else { $("to").value = i; mcls(sel, "sel", false); sel = null; }
}
function onMap(e) {
  if (mode !== "add") return;
  const name = prompt("Nombre del punto de entrega:", "Punto " + nodes.length); if (name === null) return;
  nodes.push({ name, lat: e.latlng.lat, lng: e.latlng.lng });
  const id = nodes.length - 1; let best = 0, bd = Infinity;
  nodes.forEach((n, j) => { if (j !== id) { const d = hav(n, nodes[id]); if (d < bd) { bd = d; best = j; } } });
  edges.push(mk(id, best));                       // se conecta solo con el punto más cercano
  build(); fillSel(); clearAll();
}
function setMode(m) {
  mode = m; if (sel !== null) { mcls(sel, "sel", false); sel = null; }
  document.querySelectorAll("[data-mode]").forEach(b => b.classList.toggle("act", b.dataset.mode === m));
  map.getContainer().style.cursor = m === "add" ? "crosshair" : "";
}

/* ---------- Animación del recorrido: el vehículo avanza sobre la línea de la ruta ---------- */
function travel(pts, my) {
  return new Promise(res => {
    const seg = [0]; for (let i = 1; i < pts.length; i++) seg.push(seg[i - 1] + map.distance(pts[i - 1], pts[i]));
    const total = seg[seg.length - 1], dur = Math.max(3000, total * 0.9) / spd();
    routeLine = L.polyline([pts[0]], { color: "#d9442b", weight: 7, opacity: .95, dashArray: "12 10", className: "flow" }).addTo(map);
    rider = L.marker(pts[0], { zIndexOffset: 1000, interactive: false, icon: L.divIcon({ className: "rider", html: "<span>🛵</span>", iconSize: [30, 30], iconAnchor: [15, 15] }) }).addTo(map);
    map.fitBounds(L.latLngBounds(pts), { padding: [70, 70] });
    const t0 = performance.now();
    (function f(now) {
      if (my !== run) return res();
      const p = Math.min(1, (now - t0) / dur), d = p * total; let i = 1;
      while (i < seg.length - 1 && seg[i] < d) i++;
      const k = (d - seg[i - 1]) / ((seg[i] - seg[i - 1]) || 1), a = pts[i - 1], b = pts[i];
      const cur = [a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k];
      routeLine.setLatLngs(pts.slice(0, i).concat([cur])); rider.setLatLng(cur);
      p < 1 ? requestAnimationFrame(f) : res();
    })(t0);
  });
}

/* ---------- Resultados debajo del mapa ---------- */
function showResults(r, t, ms) {
  const d = r.dist[t];
  $("out").hidden = false;
  countTo("rD", d, v => f1(v) + " km"); countTo("rT", mins(d), v => f1(v) + " min");
  $("rN").textContent = r.path.length; $("rC").textContent = ms.toFixed(2) + " ms";
  $("rP").textContent = "Ruta: " + r.path.map(i => nodes[i].name).join(" → ");
  let acc = 0;
  $("tRuta").innerHTML = "<tr><th>Paso</th><th>Desde</th><th>Hasta</th><th>Distancia</th><th>Tiempo</th><th>Acumulado</th></tr>" +
    r.pathE.map((k, i) => {
      const w = edges[k].w; acc += w;
      return `<tr><td>${i + 1}</td><td>${hn(r.path[i])}</td><td>${hn(r.path[i + 1])}</td><td>${f1(w)} km</td><td>${f1(mins(w))} min</td><td>${f1(acc)} km · ${f1(mins(acc))} min</td></tr>`;
    }).join("") +
    `<tr class="tot"><td colspan="3">Total</td><td>${f1(d)} km</td><td>${f1(mins(d))} min</td><td></td></tr>`;
  $("tPasos").innerHTML = "<tr><th>Orden</th><th>Punto fijado</th><th>Distancia mínima</th><th>Calles mejoradas</th></tr>" +
    r.steps.map((st, i) => `<tr><td>${i + 1}</td><td>${hn(st.u)}</td><td>${f1(st.d)} km</td><td>${st.relaxed.map(k => hn(edges[k].a) + " – " + hn(edges[k].b)).join(", ") || "—"}</td></tr>`).join("");
  $("out").scrollIntoView({ behavior: "smooth", block: "start" });
}

async function runD() {
  clearAll(); const my = run, s = +$("from").value, t = +$("to").value;
  if (s === t) { $("rP").textContent = "El origen y el destino son el mismo punto."; return; }
  const t0 = performance.now();
  const r = dijkstra(nodes.length, edges, s, t);
  const ms = performance.now() - t0;
  map.fitBounds(L.latLngBounds(nodes.map((_, i) => ll(i))), { padding: [40, 40] });
  $("rP").textContent = "Explorando el grafo con Dijkstra…";
  for (const st of r.steps) {
    if (my !== run) return;
    mcls(st.u, "visit", true);
    st.relaxed.forEach(k => edgeLines[k].setStyle({ color: "#e8a317", weight: 6, opacity: 1, dashArray: null }));
    await sleep(650 / spd());
    st.relaxed.forEach(k => edgeLines[k].setStyle({ weight: 3, opacity: .55 }));
  }
  if (my !== run) return;
  if (!r.path.length) { $("rP").textContent = "No hay camino entre esos puntos. Conéctalos con una calle."; return; }
  r.path.forEach(i => mcls(i, "on", true));
  $("rP").textContent = "Recorriendo la ruta…";
  await travel(r.path.map(ll), my);
  if (my !== run) return;
  showResults(r, t, ms);
}

$("bD").onclick = runD;
$("bR").onclick = () => { setMode("view"); load(); map.setView(CITY.center, CITY.zoom); };
document.querySelectorAll("[data-mode]").forEach(b => b.onclick = () => setMode(b.dataset.mode));
init(); route();