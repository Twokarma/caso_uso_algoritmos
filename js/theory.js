// Mini demo de Dijkstra paso a paso para la sección de Marco teórico
(function () {
  const N = [["A",50,115],["B",150,40],["C",150,190],["D",275,45],["E",335,170]];
  const E = [{a:0,b:1,w:4},{a:0,b:2,w:2},{a:1,b:2,w:1},{a:1,b:3,w:5},{a:2,b:3,w:8},{a:2,b:4,w:10},{a:3,b:4,w:2}];
  const R = dijkstra(5, E, 0, -1);
  const svg = document.getElementById("tg"), tbl = document.getElementById("tt"), txt = document.getElementById("tdesc");
  let i = -1, timer = null;
  const f = v => (v === Infinity ? "∞" : Math.round(v * 10) / 10);

  function draw() {
    const st = R.steps[i], done = R.steps.slice(0, i + 1).map(s => s.u);
    const snap = st ? st.snap : [0, Infinity, Infinity, Infinity, Infinity];
    let h = "";
    E.forEach((e, k) => {
      const A = N[e.a], B = N[e.b], hot = st && st.relaxed.includes(k);
      h += `<line x1="${A[1]}" y1="${A[2]}" x2="${B[1]}" y2="${B[2]}" class="te ${hot ? "hot flow" : ""}"/>`;
      h += `<text x="${(A[1]+B[1])/2}" y="${(A[2]+B[2])/2-5}" class="tw">${e.w}</text>`;
    });
    N.forEach((n, j) => {
      const cur = st && st.u === j, d = done.includes(j);
      h += `<g><circle cx="${n[1]}" cy="${n[2]}" r="19" class="tn ${cur ? "cur" : d ? "dn" : ""}"/><text x="${n[1]}" y="${n[2]+5}" class="tl">${n[0]}</text></g>`;
    });
    svg.innerHTML = h;
    tbl.innerHTML = "<tr><th>Nodo</th>" + N.map(n => `<th>${n[0]}</th>`).join("") + "</tr><tr><th>dist</th>" +
      snap.map((v, j) => `<td class="${done.includes(j) ? "fixed" : ""}">${f(v)}</td>`).join("") + "</tr>";
    if (!st) txt.textContent = "Inicio: dist(A) = 0 y todos los demás nodos en ∞. Pulsa «Siguiente paso».";
    else {
      const names = st.relaxed.map(k => N[E[k].a][0] + "–" + N[E[k].b][0]);
      txt.textContent = `Paso ${i + 1}: se fija ${N[st.u][0]} con distancia ${f(st.d)}. ` +
        (names.length ? "Se mejoran las distancias por las calles " + names.join(", ") + "." : "No hay mejoras en sus vecinos.");
    }
  }
  function next() { if (i < R.steps.length - 1) { i++; draw(); } else stop(); }
  function stop() { clearInterval(timer); timer = null; document.getElementById("tAuto").textContent = "Reproducir"; }
  document.getElementById("tNext").onclick = () => { stop(); next(); };
  document.getElementById("tReset").onclick = () => { stop(); i = -1; draw(); };
  document.getElementById("tAuto").onclick = function () {
    if (timer) return stop();
    if (i >= R.steps.length - 1) i = -1;
    this.textContent = "Pausar"; next(); timer = setInterval(next, 1400);
  };
  draw();
})();