// Algoritmos puros: reciben n (cantidad de nodos) y edges [{a,b,w}] y devuelven los pasos para animarlos.

function dijkstra(n, edges, s, t) {
  const adj = Array.from({ length: n }, () => []);
  edges.forEach((e, k) => { adj[e.a].push({ v: e.b, w: e.w, k }); adj[e.b].push({ v: e.a, w: e.w, k }); });
  const dist = Array(n).fill(Infinity), prev = Array(n).fill(-1), pe = Array(n).fill(-1), done = Array(n).fill(false);
  const steps = [];
  dist[s] = 0;
  for (;;) {
    let u = -1;                                   // nodo pendiente con menor distancia (O(V²); con heap sería O(E log V))
    for (let i = 0; i < n; i++) if (!done[i] && dist[i] < Infinity && (u < 0 || dist[i] < dist[u])) u = i;
    if (u < 0) break;
    done[u] = true;
    const relaxed = [];
    for (const { v, w, k } of adj[u]) {           // relajación de aristas
      if (!done[v] && dist[u] + w < dist[v]) { dist[v] = dist[u] + w; prev[v] = u; pe[v] = k; relaxed.push(k); }
    }
    steps.push({ u, d: dist[u], relaxed, snap: dist.slice() });
    if (u === t) break;
  }
  const path = [], pathE = [];
  if (dist[t] < Infinity) for (let c = t; c !== -1; c = prev[c]) { path.unshift(c); if (pe[c] >= 0) pathE.unshift(pe[c]); }
  return { dist, path, pathE, steps };
}

function kruskal(n, edges) {
  const p = [...Array(n).keys()];                 // Union-Find
  const find = x => (p[x] === x ? x : (p[x] = find(p[x])));
  const order = edges.map((_, i) => i).sort((a, b) => edges[a].w - edges[b].w);
  const steps = []; let total = 0;
  for (const k of order) {
    const a = find(edges[k].a), b = find(edges[k].b);
    if (a !== b) { p[a] = b; total += edges[k].w; steps.push({ k, taken: true }); }
    else steps.push({ k, taken: false });         // formaría un ciclo
  }
  return { steps, total };
}