# Presenter guide

Suggested duration: 25–35 minutes with audience experiments. Introduce each concept once. Use predict → run → explain for the experiments. Slide 2 has three model tabs, not a chain of derivation slides.

## 1. What is a neuron?
Select dendrites, soma, axon and axon terminals. Explain receiving branches, the cell body, pulse transmission and connections to other cells. Return to Whole neuron. Bridge: “Now let us model its electrical behavior.”

## 2. Three models, one current-balance method
Use LIF → HH → FHN. For each: where input goes → how currents are written → substitution into the voltage equation. Read the meaning of each term, rather than repeating the same formula in several views.

LIF: charging plus leak. Constant capacitance gives Icharge = C dV/dt; Ohm’s law gives Ileak = (V − E_L)/R. Add threshold/reset separately. This predicts event times.

HH: charging plus Na, K and leak. Each ionic current is g(V − E). Explain m, h and n, then m³h and n⁴ as effective gating factors under classical assumptions. Their coupled currents compute the spike waveform. Injected inward input is positive; ionic currents are outward-positive.

FHN: use dimensionless v, i and time s. Represent combined ionic effects by w − v + v³/3. Explain fast excitation, the cubic limiting term, and slow recovery w. The cubic is a model choice; no reset is added. Small epsilon slows recovery. Physical capacitance and scaling have been absorbed.

Try this model reveals a live trace. Adjust & inspect contains parameter controls and assumptions. The comparison table is optional within this slide. No model explanation is repeated in a later slide. Bridge: “What physical membrane ingredients do these models describe?”

## 3. How does a channel move?
Use Next to move through four camera views on one slide. Begin with the folded protein; the coils show backbone, not the full molecular volume. Compare one Na chain with four repeated domains against four Kv pore-forming subunits. Highlight charged S4 voltage sensors, S4–S5 coupling, and rearrangement of the inner S6 pore. Use Cutaway view to see the ion pathway. The filter selects by chemistry, not only size.

For Sodium, inspect the intracellular IFM motif binding to a side pocket: allosteric inactivation, not a cork on the pore axis. Scrub into recovery after repolarization. For Potassium, show closure; this view does not animate its other possible inactivation mechanisms. Play/pause and scrub the deliberately slowed motion. The geometry and trajectory are illustrative. Inspect measured structure gives a separate static experimental backbone, not a measured movie. Bridge: “Changes in conductance generate a spike. How does it travel?”

## 4. How does the spike travel?
Launch the wave and ride beside it. Show myelin and exposed nodes. Explain local regeneration, not an ion flying the full axon. Animation speed is illustrative.

## 5. Will the next cell fire?
At the chemical synapse, explain calcium-dependent release and postsynaptic receptors. Compare one 8 mV event with a close burst in the simplified delayed-jump LIF receiver. Arrival does not guarantee output.

## 6. Can timing change the decision?
Compare identical 0.20 nA, 10 ms pulses at 40 and 5 ms gaps. Their number and charge stay fixed; less of the first response decays before the closer second pulse.

## 7. Is total input enough?
Predict before comparing 0.6 nA × 5 ms with 0.1 nA × 30 ms. Both deliver 3 pC. Only the short strong pulse fires with these parameters. Ask the audience to explain this using leak.

## 8. What is the message?
Read event times and rate over the 400 ms drive interval. Increase input and then enable adaptation. Count, timing and population patterns can matter; mean rate discards detail.

## 9. One receiver, two possible inputs
Press Play the explanation once. In 27 seconds the camera follows no input, A alone, B alone, both together, and the summary. Each independent trial starts at −65 mV. One message produces an 8 mV jump, below the 15 mV rise needed to reach −50 mV. Two simultaneous messages add to 16 mV and produce one LIF output event. The meter retains peak rise; the cell returns to rest after leak/reset. Pause/continue or replay if useful. There is no tuning game or learning algorithm. Say: “Each alone is insufficient; together they cross the threshold.” Bridge: “What numbers must the computer remember for each neuron?”

## 10. What must the computer remember?
Start with one neuron. A computer keeps numbers describing its current state, such as voltage, then updates those numbers as time advances. Press Play once. The data record shows one value for LIF (V), two for FHN (v, w), and four for HH (V, m, h, n). Keep the population fixed at 10,000 cells: totals become 10,000, 20,000 and 40,000 continuous state values. Each colored box is a data field, not a biological organelle. The point block is an illustration, not a running brain simulation.

Say: “More modeled detail means more state to keep and update. Choose what the question needs.” Connections, parameters, timers, event history and temporary arrays are outside this simple count. There is no budget puzzle or benchmark. A real research example is optional; it opens separately so the main narrative stays focused.

## 11. Thank you
Thank the audience and invite questions. The camera returns to the original conceptual neuron. Previous returns to slide 10; Replay starts the presentation again.
