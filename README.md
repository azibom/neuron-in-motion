# Neuron in Motion

**[Open the live presentation](https://azibom.github.io/neuron-in-motion/)**

A self-contained, English-language 3D presentation for a live audience, designed around a causal story rather than a sequence of definitions. It runs entirely in the browser and can be published as a static GitHub Pages site.

## Run

From this folder:

```sh
node server.mjs
```

Open **http://localhost:4178**. No package installation is needed. `npm start` runs the same server. Use `node server.mjs --port=4180` to choose another port.

The server prints same-network addresses. Students can scan **Join** or open the reachable address on the same Wi-Fi. On this computer the Wi-Fi address at creation was `http://172.21.225.103:4178`; it may change. The sharing dialog lets you edit the address and regenerate its QR code. Windows Firewall must allow inbound access to the selected port for other devices to connect.

Once hosted, the GitHub Pages URL works on phones and laptops outside the local network. Experiments are independent on each device; slide positions and results are not synchronized.

## The narrative

Begin with the cell, then build a model of its electrical pulse before following the mechanisms and connections.

1. Introduce the neuron and its four main parts.
2. Explain LIF, HH and FHN once, using the same current-balance structure in three tabs. Real circuits and a dimensionless state plane accompany the equations.
3. Explore folded channel proteins, voltage sensing, pore opening, sodium inactivation and recovery in four cinematic views. Compare Na/K architecture and inspect separate measured backbones.
4. Follow a spike along the axon and nodes.
5. Cross a synapse and test the receiver’s response.
6. Change timing while keeping input pulses identical.
7. Compare equal charge delivered in different ways.
8. Read output as event times and explore adaptation.
9. Play a 27-second explanation: A alone, B alone, then simultaneous A + B. Watch a real LIF receiver cross threshold only for the pair.
10. Play a simple state-count explanation: one modeled cell keeps 1, 2 or 4 changing values; the same 10,000 cells therefore keep 10,000, 20,000 or 40,000 values. A research example opens separately.
11. Close with Thank you, a cinematic return to the opening neuron, and questions & discussion.

Each stop introduces a reason for the next. The screen shows one question and one main experiment. **Explore parameters** reveals extra controls and equations. Full explanations, assumptions and source links are in **Notes** and **Tools → Scientific references**.

Read [PRESENTER_GUIDE.md](./PRESENTER_GUIDE.md) for a practical demonstration script.
The agreed Persian speaking script for the first two slides is in [SLIDES_01_02_SPEAKER_FA.md](./SLIDES_01_02_SPEAKER_FA.md). The presentation UI and in-app notes remain English.
The channel mechanism narration is in [SLIDE_03_SPEAKER_FA.md](./SLIDE_03_SPEAKER_FA.md).
The one-click decision animation narration is in [SLIDE_09_SPEAKER_FA.md](./SLIDE_09_SPEAKER_FA.md).
The simple state-count explanation is in [SLIDE_10_SPEAKER_FA.md](./SLIDE_10_SPEAKER_FA.md).

## Controls

| Control | Action |
| --- | --- |
| Drag / one-finger drag | Orbit the 3D scene |
| Scroll / pinch | Zoom |
| Next, Previous / arrow keys | Move through the narrative; on slide 2, switch between LIF, HH and FHN; on slide 3, follow four mechanism views before moving on |
| Space | Run the current experiment, when focus is outside a control |
| N | Presenter notes |
| M | Expedition map |
| F | Fullscreen |
| H | Hide or show captions |
| Reset view | Restore this stop’s camera |
| Expand, on a phone | Enlarge the experiment drawer |
| Tools | Sources, notes, graphics quality and optional sound |

Reduced-motion preferences disable camera flights. If WebGL is unavailable, the controls, numerical experiments, plots and notes remain usable. Discovery progress is saved locally in the browser when storage is available.

## Scientific and visual conventions

- **Passive RC:** exact exponential integration per constant-current step; nA, mV, MΩ, nF and ms. Input equals capacitive current plus leak current. The capacitor plates are an equivalent circuit, not literal anatomy.
- **LIF:** rest/reset −65 mV, threshold −50 mV, R = 100 MΩ, C = 0.1 nF, 0.1 ms steps. Voltage is held at reset for a 5 ms refractory interval. Event marks are not biological spike waveforms.
- **Hodgkin–Huxley:** classical squid axon at 6.3 °C; C = 1 µF/cm², gNa = 120, gK = 36, gL = 0.3 mS/cm²; reversal potentials +50, −77 and −54.387 mV. Four-variable RK4, 0.025 ms steps. Spike count uses upward 0 mV crossings.
- **Channel explorer:** evidence-informed structural teaching geometry with exaggerated, synchronized movement, an illustrative 15-second cycle and assumed Na inward / K outward flow. S4 sensing, S4–S5 coupling and S6 pore rearrangement are shown. Mammalian-type Na fast inactivation uses an IFM side pocket; the Kv example shows activation/deactivation. No flux, biological time or atomistic pathway is calculated. Static measured Cα structures are a separate inspection view.
- **Synapse / circuit:** delayed voltage jumps drive a LIF receiver. Transmitter release, vesicles, calcium and receptors are anatomical teaching animations, not a molecular release simulation.
- **Adaptation:** a phenomenological opposing current increments by 0.04 nA per spike and decays over 120 ms.
- **FitzHugh–Nagumo:** one dimensionless form, dv/ds = i + v − v³/3 − w and dw/ds = ε(v + a − bw). a = 0.7, b = 0.8, ε = 0.08; RK4 at Δs = 0.02. Zero-input equilibrium initializes the trace. There is no reset; upward v = 0 crossings count excursions only.
- **Axon:** slowed conceptual propagation with chosen animation speeds, not a cable-equation conduction solver. Myelin is shown as a cutaway of layered insulation.
- **State-count finale:** exactly 10,000 proxy points illustrate modeled cells. LIF/FHN/HH retain 1/2/4 continuous state variables per cell. Counts exclude connections, fixed parameters, refractory bookkeeping, event queues and solver temporaries. No speed ratio or full runtime-memory estimate is claimed.
- **Blue Brain:** the published rat microcircuit is discussed and linked. The population block is a data illustration; this application does not run that reconstruction or simulate a full brain.

### Experimental protein geometry

The separate measured-structure view uses **4,171 experimental Cα positions** across these two examples:

| Structure | Local data | Source |
| --- | --- | --- |
| Cockroach sodium channel NaVPaS | `assets/nav-5x0m.json` | [Shen et al. / PDB 5X0M](https://www.rcsb.org/structure/5X0M) |
| Rat Kv paddle chimera + beta subunits | `assets/kv-2r9r.json` | [Long et al. / PDB 2R9R](https://www.rcsb.org/structure/2R9R) |

[OPM](https://opm.phar.umich.edu/) supplies membrane-oriented coordinates. Original files are retained in `research/structures/`; `node tools/prepare-structures.mjs` regenerates the compact data. The representation is a smoothed Cα backbone trace, not an all-atom surface. Missing residue stretches remain gaps. Structural examples are static and are distinct from the squid HH parameter set and generic mammalian-type animated mechanism. **Inspect measured structure** shows one of these examples; **Return to mechanism** restores the animated teaching view. No experimental coordinates are deformed.

All cell anatomy, lipid positions, receptor cartoons and circuits are designed teaching scenes rather than measured anatomical reconstructions. Features are enlarged when needed for visibility, so the overall journey does not preserve a single physical length scale.

## Relationship to the supplied notebooks

The files in `../github/` informed these experiments:

- `neuron_lab_01_input_current_to_action_potentials.ipynb`: RC derivation, core LIF parameters, close/distant input pulses, equal-charge stimuli and slow adaptation.
- `Neuron_Lab_02_From_Spikes_to_Synapses.ipynb`: prescribed sending event, 2 ms delay and a subthreshold receiving response. The presentation extends this with bursts and inhibitory jumps.

The browser implementation is separate JavaScript code, not Brian2 running in the browser. One explicit numerical difference: this LIF implementation holds voltage at reset during the refractory interval. A Brian differential equation without `unless refractory` can continue evolving while its threshold events are refractory.

## Verify

```sh
npm test
```

The automated tests cover analytical RC response and signed current balance, timing and equal-charge outcomes, Nernst reversals, HH rate singularities and step convergence, sodium blockade, synaptic integration, circuit truth tables, dimensionless FHN current balance, rest, excursions and step convergence, memory estimates, narrative order, coordinate continuity, and channel storyboard invariants (closure, inactivation, recovery and blocked ion transit).

Browser verification was performed separately against the served site for the main experiments, responsive layouts, local QR generation, notes, offline runtime dependencies and WebGL fallback. QA scripts and screenshots are in the ignored `qa/` folder; they are not part of the public build.

## Publish to GitHub Pages

```sh
npm run build
```

This creates a static **dist/** folder. All scripts, structure data, the 3D library and the QR generator are local. Runtime operation does not require a CDN or API. External source links require internet access when opened.

The repository is published at **https://azibom.github.io/neuron-in-motion/**. GitHub Pages uses **GitHub Actions** and the included `.github/workflows/pages.yml`, which tests, builds and publishes `dist/` on pushes to `main`. The workflow runs from the repository root.

All application URLs are relative, so project subpaths work. A `.nojekyll` file is included. There is no backend, sign-in, secret, database or build-time dependency installation. The local-only `/__host` helper is optional and is not needed on GitHub Pages.

## Files and credits

`app.mjs` handles the experience; `scene.mjs` builds 3D scenes; `decision-film.mjs` drives the fixed, solver-backed decision animation; `physics.mjs` contains numerical models; `content.mjs` holds the ordered narrative, notes and citations. `server.mjs` serves a local preview; `build.mjs` prepares static output.

See [THIRD_PARTY.md](./THIRD_PARTY.md) for bundled-library and structural-data attribution. Original application code and designed teaching scenes are under the MIT license in [LICENSE](./LICENSE). Publications and third-party data retain their own attribution and terms.
