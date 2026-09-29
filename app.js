const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];

const screens = { intro: $("#introScreen"), lab: $("#labScreen") };
const neuronCanvas = $("#neuronCanvas");
const neuronContext = neuronCanvas.getContext("2d");
const traceCanvas = $("#traceCanvas");
const traceContext = traceCanvas.getContext("2d");
const miniTraceCanvas = $("#miniTraceCanvas");
const miniTraceContext = miniTraceCanvas.getContext("2d");

const simulation = {
  rest: -70,
  threshold: -55,
  voltage: -70,
  drive: 0,
  spikeCount: 0,
  spikeTime: null,
  refractoryUntil: 0,
  propagation: [],
  inputs: [],
  history: [],
  lastTime: performance.now(),
  active: false,
  completed: false,
};

const deckState = { slide: 0, notes: false };

function switchScreen(name) {
  Object.values(screens).forEach((screen) => screen.classList.remove("is-active"));
  $("#deck").hidden = name !== "deck";
  if (screens[name]) screens[name].classList.add("is-active");
  $("#phaseLabel").textContent = name === "deck" ? "Neuron presentation" : name === "lab" ? "Interactive neuron lab" : "Interactive primer";
  simulation.active = name === "lab";
  window.scrollTo(0, 0);
}

function resetSimulation() {
  simulation.voltage = simulation.rest;
  simulation.drive = 0;
  simulation.spikeCount = 0;
  simulation.spikeTime = null;
  simulation.refractoryUntil = 0;
  simulation.propagation = [];
  simulation.inputs = [];
  simulation.history = Array.from({ length: 250 }, (_, index) => ({ t: index / 60, v: simulation.rest }));
  simulation.lastTime = performance.now();
  simulation.completed = false;
  $("#driveSlider").value = "0";
  $("#driveOutput").textContent = "0.0";
  $("#spikeCount").textContent = "0";
  $("#spikeDots").parentElement.className = "spike-counter";
  $("#labMessage").textContent = "Try three quick excitatory inputs. Spacing matters.";
  $("#labComplete").hidden = true;
  updateVoltageReadout();
}

function updateVoltageReadout() {
  const rounded = Math.round(simulation.voltage * 10) / 10;
  $("#voltageReadout").textContent = `${rounded < 0 ? "−" : "+"}${Math.abs(rounded).toFixed(1)} mV`;
}

function addInput(type) {
  const now = performance.now();
  const excitatory = type === "excite";
  simulation.inputs.push({ type, started: now, branch: Math.floor(Math.random() * 4) });
  if (now < simulation.refractoryUntil) {
    $("#labMessage").textContent = "The neuron is refractory: another full spike cannot start yet.";
    return;
  }
  simulation.voltage += excitatory ? 6 : -5;
  simulation.voltage = Math.max(-82, Math.min(-51, simulation.voltage));
  $("#labMessage").textContent = excitatory
    ? "An EPSP raised the membrane potential. Add another before it decays."
    : "An inhibitory input moved the membrane farther from threshold.";
  updateVoltageReadout();
}

function triggerSpike(now) {
  simulation.spikeTime = now;
  simulation.refractoryUntil = now + 290;
  simulation.spikeCount += 1;
  simulation.propagation.push({ started: now });
  $("#spikeCount").textContent = simulation.spikeCount;
  const dotClass = simulation.spikeCount >= 2 ? "two" : "one";
  $("#spikeDots").parentElement.className = `spike-counter ${dotClass}`;
  $("#labMessage").textContent = simulation.spikeCount === 1
    ? "Spike! The axon is regenerating the signal. Make one more."
    : "Two spikes: you created a tiny spike train.";
  if (simulation.spikeCount >= 2 && !simulation.completed) {
    simulation.completed = true;
    $("#personalSpikeText").textContent = `In the interactive lab, you generated ${simulation.spikeCount} spikes. Graded input changed the neuron's state; threshold converted that state into discrete event times.`;
    window.setTimeout(() => { $("#labComplete").hidden = false; $("#labComplete").scrollIntoView({ behavior: "smooth", block: "nearest" }); }, 720);
  }
}

function updateSimulation(time) {
  const elapsedMs = Math.min(50, time - simulation.lastTime);
  const dt = elapsedMs / 1000;
  simulation.lastTime = time;

  if (simulation.active) {
    if (simulation.spikeTime !== null) {
      const phase = time - simulation.spikeTime;
      if (phase < 28) simulation.voltage = -55 + (phase / 28) * 87;
      else if (phase < 118) simulation.voltage = 32 - ((phase - 28) / 90) * 108;
      else if (phase < 260) simulation.voltage = -76 + ((phase - 118) / 142) * 6;
      else { simulation.spikeTime = null; simulation.voltage = simulation.rest; }
    } else {
      const target = simulation.rest + simulation.drive * 1.28;
      simulation.voltage += (target - simulation.voltage) * (dt / .34);
      if (time >= simulation.refractoryUntil && simulation.voltage >= simulation.threshold) triggerSpike(time);
    }

    simulation.history.push({ t: time, v: simulation.voltage });
    if (simulation.history.length > 250) simulation.history.shift();
    simulation.inputs = simulation.inputs.filter((input) => time - input.started < 900);
    simulation.propagation = simulation.propagation.filter((event) => time - event.started < 1600);
    updateVoltageReadout();
    drawNeuron(time);
    drawTrace();
  }
  requestAnimationFrame(updateSimulation);
}

function drawNeuron(time) {
  const ctx = neuronContext;
  const width = ctx.canvas.width;
  const height = ctx.canvas.height;
  ctx.clearRect(0, 0, width, height);
  ctx.fillStyle = "#faf8f2";
  ctx.fillRect(0, 0, width, height);
  ctx.strokeStyle = "rgba(23,25,21,.055)";
  ctx.lineWidth = 1;
  for (let x = 40; x < width; x += 70) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, height); ctx.stroke(); }
  for (let y = 35; y < height; y += 70) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(width, y); ctx.stroke(); }

  ctx.save();
  ctx.translate(8, 4);
  ctx.strokeStyle = "#171915";
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.lineWidth = 10;
  const branches = [
    [275, 278, 190, 185, 116, 103],
    [250, 275, 160, 280, 72, 230],
    [265, 330, 178, 366, 90, 450],
    [310, 351, 280, 428, 248, 525],
  ];
  branches.forEach(([sx, sy, cx, cy, ex, ey]) => { ctx.beginPath(); ctx.moveTo(sx, sy); ctx.quadraticCurveTo(cx, cy, ex, ey); ctx.stroke(); });
  ctx.lineWidth = 6;
  [[116,103,67,64],[116,103,122,39],[72,230,30,193],[72,230,19,247],[90,450,40,473],[90,450,66,510],[248,525,205,552]].forEach(([sx,sy,ex,ey]) => { ctx.beginPath(); ctx.moveTo(sx,sy); ctx.lineTo(ex,ey); ctx.stroke(); });

  ctx.fillStyle = "#faf8f2";
  ctx.lineWidth = 10;
  ctx.beginPath();
  ctx.bezierCurveTo(250, 245, 310, 180, 393, 209);
  ctx.bezierCurveTo(466, 234, 476, 327, 417, 374);
  ctx.bezierCurveTo(356, 421, 264, 381, 253, 323);
  ctx.bezierCurveTo(248, 296, 245, 272, 250, 245);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = "#b9d5dc";
  ctx.strokeStyle = "#195d72";
  ctx.lineWidth = 6;
  ctx.beginPath(); ctx.arc(352, 290, 47, 0, Math.PI * 2); ctx.fill(); ctx.stroke();

  ctx.strokeStyle = "#171915";
  ctx.lineWidth = 10;
  ctx.beginPath();
  ctx.moveTo(432, 316);
  ctx.bezierCurveTo(512, 319, 522, 402, 590, 392);
  ctx.bezierCurveTo(644, 385, 674, 337, 742, 359);
  ctx.stroke();
  ctx.strokeStyle = "#f6c9b9";
  ctx.lineWidth = 29;
  [[477,337,516,372],[547,396,586,392],[616,382,652,356],[679,349,713,353]].forEach(([sx,sy,ex,ey]) => { ctx.beginPath(); ctx.moveTo(sx,sy); ctx.lineTo(ex,ey); ctx.stroke(); });
  ctx.strokeStyle = "#195d72";
  ctx.lineWidth = 7;
  [[529,385],[601,386],[665,355]].forEach(([x,y]) => { ctx.beginPath(); ctx.moveTo(x,y-17); ctx.lineTo(x,y+17); ctx.stroke(); });
  ctx.strokeStyle = "#171915";
  ctx.lineWidth = 8;
  ctx.beginPath(); ctx.moveTo(742,359); ctx.lineTo(786,325); ctx.moveTo(742,359); ctx.lineTo(792,365); ctx.moveTo(742,359); ctx.lineTo(779,411); ctx.stroke();
  ctx.fillStyle = "#171915";
  [[791,320],[798,366],[782,416]].forEach(([x,y]) => { ctx.beginPath(); ctx.arc(x,y,11,0,Math.PI*2); ctx.fill(); });

  simulation.inputs.forEach((input) => {
    const branch = branches[input.branch];
    const age = (time - input.started) / 900;
    ctx.strokeStyle = input.type === "excite" ? `rgba(25,93,114,${1-age})` : `rgba(112,83,142,${1-age})`;
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.arc(branch[4], branch[5], 10 + age * 46, 0, Math.PI * 2);
    ctx.stroke();
  });

  simulation.propagation.forEach((event) => {
    const progress = Math.min(1, (time - event.started) / 1050);
    let x;
    let y;
    if (progress < .36) { const p = progress / .36; x = 430 + p * 110; y = 316 + p * 77; }
    else if (progress < .68) { const p = (progress - .36) / .32; x = 540 + p * 105; y = 393 - p * 23; }
    else { const p = (progress - .68) / .32; x = 645 + p * 105; y = 370 - p * 11; }
    ctx.fillStyle = "#e95c32";
    ctx.shadowColor = "#e95c32";
    ctx.shadowBlur = 18;
    ctx.beginPath(); ctx.arc(x, y, 14, 0, Math.PI * 2); ctx.fill();
    ctx.shadowBlur = 0;
    if (progress > .92) {
      const burst = (progress - .92) / .08;
      for (let dot = 0; dot < 6; dot += 1) {
        ctx.globalAlpha = 1 - burst;
        ctx.beginPath(); ctx.arc(790 + dot * 5, 350 + (dot - 2) * 12 + burst * 45, 5, 0, Math.PI * 2); ctx.fill();
      }
      ctx.globalAlpha = 1;
    }
  });
  ctx.restore();
}

function drawTrace() {
  const ctx = traceContext;
  const width = ctx.canvas.width;
  const height = ctx.canvas.height;
  const margin = { left: 58, right: 18, top: 18, bottom: 34 };
  const plotWidth = width - margin.left - margin.right;
  const plotHeight = height - margin.top - margin.bottom;
  ctx.clearRect(0, 0, width, height);
  ctx.fillStyle = "#faf8f2";
  ctx.fillRect(0, 0, width, height);
  const yFor = (value) => margin.top + ((40 - value) / 120) * plotHeight;
  ctx.font = "11px Inter, sans-serif";
  ctx.fillStyle = "#6f7169";
  ctx.textAlign = "right";
  [-80, -55, -20, 20].forEach((tick) => {
    const y = yFor(tick);
    ctx.strokeStyle = tick === -55 ? "rgba(233,92,50,.7)" : "rgba(23,25,21,.12)";
    ctx.setLineDash(tick === -55 ? [7, 7] : []);
    ctx.beginPath(); ctx.moveTo(margin.left, y); ctx.lineTo(width - margin.right, y); ctx.stroke();
    ctx.fillText(`${tick}`, margin.left - 8, y + 4);
  });
  ctx.setLineDash([]);
  ctx.fillText("mV", margin.left - 8, 12);
  if (simulation.history.length < 2) return;
  ctx.strokeStyle = "#171915";
  ctx.lineWidth = 4;
  ctx.lineJoin = "round";
  ctx.beginPath();
  simulation.history.forEach((point, index) => {
    const x = margin.left + (index / (simulation.history.length - 1)) * plotWidth;
    const y = yFor(point.v);
    if (index === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
  });
  ctx.stroke();
}

function drawMiniTrace(time = 0) {
  const ctx = miniTraceContext;
  const width = ctx.canvas.width;
  const height = ctx.canvas.height;
  ctx.clearRect(0, 0, width, height);
  ctx.fillStyle = "#faf8f2";
  ctx.fillRect(0, 0, width, height);
  const baseline = height * .7;
  const threshold = height * .34;
  ctx.strokeStyle = "rgba(233,92,50,.65)";
  ctx.setLineDash([7, 7]);
  ctx.beginPath(); ctx.moveTo(30, threshold); ctx.lineTo(width - 25, threshold); ctx.stroke();
  ctx.setLineDash([]);
  const progress = (time % 5200) / 5200;
  const reveal = Math.min(1, progress * 1.35);
  const points = [];
  for (let index = 0; index <= 260; index += 1) {
    const xNorm = index / 260;
    let y = baseline;
    [0.18, 0.32, 0.45].forEach((input, inputIndex) => {
      if (xNorm > input) y -= (30 + inputIndex * 5) * Math.exp(-(xNorm - input) * 12);
    });
    if (xNorm > .49 && xNorm < .66) {
      const phase = (xNorm - .49) / .17;
      if (phase < .2) y = baseline - (phase / .2) * (baseline - 62);
      else if (phase < .55) y = 62 + ((phase - .2) / .35) * (baseline + 38 - 62);
      else y = baseline + 38 - ((phase - .55) / .45) * 38;
    }
    points.push({ x: 30 + xNorm * (width - 55), y });
  }
  ctx.strokeStyle = "#171915";
  ctx.lineWidth = 5;
  ctx.beginPath();
  points.slice(0, Math.max(2, Math.floor(points.length * reveal))).forEach((point, index) => index ? ctx.lineTo(point.x, point.y) : ctx.moveTo(point.x, point.y));
  ctx.stroke();
  [0.18, 0.32, 0.45].forEach((input) => { ctx.fillStyle = "#195d72"; ctx.fillRect(30 + input * (width - 55) - 2, baseline + 34, 4, 20); });
  requestAnimationFrame(drawMiniTrace);
}

function populateRaster() {
  const random = (() => { let seed = 1457; return () => ((seed = (seed * 16807) % 2147483647) - 1) / 2147483646; })();
  $("#populationRaster").innerHTML = Array.from({ length: 12 }, (_, row) => {
    const spikes = Array.from({ length: 5 + (row % 4) }, () => `<i style="--x:${Math.round(4 + random() * 92)}%"></i>`).join("");
    return `<div class="raster-row">${spikes}</div>`;
  }).join("");
}

function showSlide(index) {
  const slides = $$(".slide");
  deckState.slide = Math.max(0, Math.min(slides.length - 1, index));
  slides.forEach((slide, slideIndex) => slide.classList.toggle("is-current", slideIndex === deckState.slide));
  const current = slides[deckState.slide];
  $("#currentSlideNumber").textContent = deckState.slide + 1;
  $("#currentSlideLabel").textContent = current.dataset.label;
  $("#deckProgress").style.width = `${((deckState.slide + 1) / slides.length) * 100}%`;
  $("#previousSlide").disabled = deckState.slide === 0;
  $("#nextSlide").disabled = deckState.slide === slides.length - 1;
  current.scrollTop = 0;
}

function enterDeck() {
  switchScreen("deck");
  history.replaceState(null, "", `${location.pathname}#presentation`);
  showSlide(0);
}

function openReferences(referenceNumber = null) {
  $$(".reference-list li").forEach((item) => item.classList.remove("is-highlighted"));
  $("#referencesDialog").showModal();
  if (referenceNumber) {
    const item = $(`#reference-${referenceNumber}`);
    if (item) {
      item.classList.add("is-highlighted");
      window.setTimeout(() => item.scrollIntoView({ block: "center" }), 40);
    }
  }
}

function handleKeydown(event) {
  if (simulation.active && !["INPUT", "BUTTON"].includes(document.activeElement?.tagName)) {
    if (event.key.toLowerCase() === "e") { event.preventDefault(); addInput("excite"); }
    if (event.key.toLowerCase() === "i") { event.preventDefault(); addInput("inhibit"); }
  }
  if (!$("#deck").hidden && !$("#referencesDialog").open) {
    if (["ArrowRight", "PageDown", " "].includes(event.key)) { event.preventDefault(); showSlide(deckState.slide + 1); }
    if (["ArrowLeft", "PageUp"].includes(event.key)) { event.preventDefault(); showSlide(deckState.slide - 1); }
    if (event.key.toLowerCase() === "n") $("#notesButton").click();
  }
  if (event.key === "Escape") $("#popover").hidden = true;
}

$("#openLabButton").addEventListener("click", () => { resetSimulation(); switchScreen("lab"); });
$("#introPresentationButton").addEventListener("click", enterDeck);
$("#enterDeckButton").addEventListener("click", enterDeck);
$("#presentationLink").addEventListener("click", (event) => { event.preventDefault(); enterDeck(); });
$("#exciteButton").addEventListener("click", () => addInput("excite"));
$("#inhibitButton").addEventListener("click", () => addInput("inhibit"));
$("#driveSlider").addEventListener("input", (event) => { simulation.drive = Number(event.target.value); $("#driveOutput").textContent = simulation.drive.toFixed(1); });
$("#resetLab").addEventListener("click", resetSimulation);
$("#previousSlide").addEventListener("click", () => showSlide(deckState.slide - 1));
$("#nextSlide").addEventListener("click", () => showSlide(deckState.slide + 1));
$("#notesButton").addEventListener("click", () => { deckState.notes = !deckState.notes; $("#deck").classList.toggle("notes-visible", deckState.notes); $("#notesButton").setAttribute("aria-pressed", String(deckState.notes)); });
$("#fullscreenButton").addEventListener("click", () => document.fullscreenElement ? document.exitFullscreen() : document.documentElement.requestFullscreen());
$("#referencesButton").addEventListener("click", () => openReferences());
$("#openReferencesFromSlide").addEventListener("click", () => openReferences());
$$("[data-reference]").forEach((button) => button.addEventListener("click", () => openReferences(button.dataset.reference)));
$("#closeReferences").addEventListener("click", () => $("#referencesDialog").close());
$("#referencesDialog").addEventListener("click", (event) => { if (event.target === $("#referencesDialog")) $("#referencesDialog").close(); });
$("#aboutButton").addEventListener("click", () => $("#aboutDialog").showModal());
$("#closeAbout").addEventListener("click", () => $("#aboutDialog").close());
$("#aboutDialog").addEventListener("click", (event) => { if (event.target === $("#aboutDialog")) $("#aboutDialog").close(); });
$("[data-popover='model']").addEventListener("click", () => { $("#popoverContent").innerHTML = "<h3>What the simulator preserves</h3><p>Between spikes, voltage relaxes toward a drive-dependent equilibrium with a membrane time constant. Brief excitatory and inhibitory events shift voltage. At threshold, the visual emits a fixed spike waveform, resets, and enters a refractory interval. Channel kinetics, dendritic compartments, conductance reversal potentials and stochastic release are intentionally omitted.</p>"; $("#popover").hidden = false; });
$("#closePopover").addEventListener("click", () => $("#popover").hidden = true);
$(".brand").addEventListener("click", (event) => { event.preventDefault(); history.replaceState(null, "", location.pathname); switchScreen("intro"); });
document.addEventListener("keydown", handleKeydown);

resetSimulation();
populateRaster();
requestAnimationFrame(updateSimulation);
requestAnimationFrame(drawMiniTrace);
if (location.hash === "#presentation") enterDeck();
