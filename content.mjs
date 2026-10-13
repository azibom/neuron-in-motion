export const references = {
  "navstructure": {
    "title": "Shen et al. (2017) · NaVPaS · PDB 5X0M",
    "url": "https://www.rcsb.org/structure/5X0M",
    "detail": "Cryo-EM structure of a cockroach sodium channel. The measured view traces Cα coordinates; this static example is distinct from the squid HH model."
  },
  "kvstructure": {
    "title": "Long et al. (2007) · Kv paddle chimera · PDB 2R9R",
    "url": "https://www.rcsb.org/structure/2R9R",
    "detail": "X-ray structure of a rat Kv1.2/Kv2.1 chimera and beta subunits. Four channel-forming subunits surround the pore."
  },
  "opm": {
    "title": "OPM · Orientations of Proteins in Membranes",
    "url": "https://opm.phar.umich.edu/",
    "detail": "Membrane-oriented coordinates derived from deposited structures. Original local coordinate files and conversion script are included."
  },
  "anatomy": {
    "title": "Gerstner et al. · Neuronal Dynamics (2014), §1.1",
    "url": "https://neuronaldynamics.epfl.ch/online/Ch1.S1.html",
    "detail": "Cell anatomy, dendrites, soma, axon and spike signaling."
  },
  "lif": {
    "title": "Gerstner et al. · Neuronal Dynamics, §1.3",
    "url": "https://neuronaldynamics.epfl.ch/online/Ch1.S3.html",
    "detail": "Passive RC membrane; leaky integration, threshold and reset."
  },
  "nernst": {
    "title": "Gerstner et al. · Neuronal Dynamics, §2.1",
    "url": "https://neuronaldynamics.epfl.ch/online/Ch2.S1.html",
    "detail": "Ion concentrations, electrochemical gradients and equilibrium potentials."
  },
  "hh": {
    "title": "Hodgkin & Huxley (1952) · Journal of Physiology",
    "url": "https://doi.org/10.1113/jphysiol.1952.sp004764",
    "detail": "A quantitative description of membrane current and its application to conduction and excitation in nerve. Classical squid-axon model."
  },
  "gates": {
    "title": "Gerstner et al. · Neuronal Dynamics, §2.2",
    "url": "https://neuronaldynamics.epfl.ch/online/Ch2.S2.html",
    "detail": "Conductance-based equations, activation and inactivation. The cortical parameter table on this page differs from our classical squid parameters."
  },
  "synapse": {
    "title": "Gerstner et al. · Neuronal Dynamics, §3.1",
    "url": "https://neuronaldynamics.epfl.ch/online/Ch3.S1.html",
    "detail": "Chemical synapses, receptors, excitatory and inhibitory currents."
  },
  "axon": {
    "title": "Debanne et al. (2011) · Axon physiology",
    "url": "https://doi.org/10.1152/physrev.00048.2009",
    "detail": "Physiological review of propagation, myelin and axonal computation."
  },
  "code": {
    "title": "Gerstner et al. · Neuronal Dynamics, §7.2",
    "url": "https://neuronaldynamics.epfl.ch/online/Ch7.S2.html",
    "detail": "Mean firing rate and the importance of defining an observation window."
  },
  "bluebrain": {
    "title": "Markram et al. (2015) · Cell",
    "url": "https://pubmed.ncbi.nlm.nih.gov/26451489/",
    "detail": "Reconstruction and Simulation of Neocortical Microcircuitry. A juvenile rat cortical microcircuit, not an entire human brain."
  },
  "portal": {
    "title": "Blue Brain · Neocortical Microcircuit Portal",
    "url": "https://bbp.epfl.ch/nmc-portal/microcircuit.html",
    "detail": "Published reconstruction: 31,346 neurons, approximately 37 million intrinsic synapses."
  },
  "brian": {
    "title": "Brian 2 · Models and neuron groups",
    "url": "https://brian2.readthedocs.io/en/stable/user/models.html",
    "detail": "Differential equations, thresholds, resets and refractory conditions in computational models."
  },
  "fhn": {
    "title": "FitzHugh (1961) · Biophysical Journal",
    "url": "https://doi.org/10.1016/S0006-3495(61)86902-6",
    "detail": "Original two-state excitation/recovery model. We use one dimensionless sign convention, with a = 0.7, b = 0.8 and ε = 0.08."
  },
  "navmotion": {
    "title": "PDB-101 · Voltage-gated Sodium Channels",
    "url": "https://pdb101.rcsb.org/motm/243",
    "detail": "Folded pore-forming chain, four voltage-sensing elements and charged helical segments."
  },
  "inactivation": {
    "title": "Li et al. (2021) · Sodium-channel fast inactivation",
    "url": "https://doi.org/10.1073/pnas.2100069118",
    "detail": "Human Nav1.5 structural evidence for allosteric fast inactivation involving the intracellular III–IV linker. The animated view is a generic mammalian-type teaching model, not an experimental trajectory."
  },
  "proteinview": {
    "title": "PDB-101 · Molecular graphics representations",
    "url": "https://pdb101.rcsb.org/learn/guide-to-understanding-pdb-data/molecular-graphics-programs",
    "detail": "Backbone traces show the course of a protein chain; they omit much of its atomic volume and side chains."
  },
  "kvmotion": {
    "title": "Long et al. (2007) · Atomic structure of a voltage-dependent K channel",
    "url": "https://doi.org/10.1038/nature06265",
    "detail": "Four pore-forming subunits, voltage-sensing domains and a central ion pathway; source of PDB 2R9R."
  }
};

export const slides = [
  {
    "key": "arrival",
    "chapter": "THE CELL",
    "title": "What is<br>a neuron?",
    "tag": "THE CELL",
    "model": "Conceptual anatomy",
    "refs": [
      "anatomy"
    ],
    "cue": "Explore its four main parts.",
    "notes": [
      "This is a neuron: a cell of the nervous system. It receives signals, changes in response to them, and can pass signals to other cells. Before exploring how that works, let us identify its main parts. Start with the whole cell, then select the four part buttons in order.",
      "Dendrites are the branching structures. Many incoming signals reach the neuron through synaptic connections on these branches. Select Dendrites and let the camera settle before continuing.",
      "The soma is the cell body. It contains the nucleus and much of the machinery that keeps the cell alive and working. Signals can also arrive on the soma; integration involves the cell and its dendrites rather than a single universal decision switch.",
      "The axon is the long process along which action potentials travel. Introduce it as the route for outgoing electrical pulses; the mechanism of those pulses will come later.",
      "Axon terminals are the endings through which the neuron can affect other cells at connections called synapses. Select Axon terminals, then Whole neuron to reconnect all four parts.",
      "From a computer-science viewpoint, we can ask what inputs this system receives, what changes inside it, and what outputs it produces. To understand that process, we need to look closer: a thin membrane surrounds this cell. How do incoming signals affect that membrane?",
      "Presenter accuracy note: this is a schematic pyramidal neuron, not an anatomical reconstruction. Geometry and scale are adjusted for teaching. Incoming synapses can occur on dendrites, soma or axon. Spike initiation often occurs in the axon initial segment. Keep the introduction focused on anatomy; membrane voltage, ions and spike mechanisms belong to the following steps."
    ],
    "scene": 0,
    "nextLabel": "Look closer"
  },
  {
    "key": "modeling",
    "chapter": "01 / MODEL",
    "title": "Three models.<br>One current balance.",
    "tag": "01 / MODEL",
    "model": "LIF / classic squid HH / dimensionless FHN",
    "refs": [
      "lif",
      "hh",
      "gates",
      "fhn"
    ],
    "cue": "LIF · HH · FitzHugh–Nagumo",
    "notes": [
      "Use one shared method for all three models: where does input current go, and how do we write each current? Show LIF, HH and FHN in that order using the three tabs. Each model is explained once; there are no extra derivation slides.",
      "LIF: Input splits into membrane charging and leak. Charge obeys Q = CV, hence Icharge = C dV/dt for constant capacitance. Ohm’s law gives Ileak = (V − E_L)/R. Substitute into current balance and isolate C dV/dt. E_L is the leak reversal voltage. Add a separate threshold/reset rule; this records event times rather than calculating biological spike shape.",
      "HH: Keep capacitive charging and split ionic flow into Na, K and leak branches. Each is conductance times V minus the branch reversal potential. Sodium uses gbar_Na m³h; potassium gbar_K n⁴. Explain m as Na activation, h as Na availability, n as K activation. Independent effective gating factors under classical assumptions give the powers; their kinetics are empirical and are not literal molecular doors. The gate equation is opening α(1−x) minus closing βx. Coupled currents calculate the voltage waveform. Inward injected input is positive; ionic current is outward-positive, so inward Na current is negative.",
      "FHN: Use dimensionless voltage v, input i and time s, with physical scales and capacitance absorbed. Write i = dv/ds + Iionic, choose Iionic = w − v + v³/3, and rearrange. Add dw/ds = epsilon(v + a − bw). +v permits reinforcement, the cubic limits growth at large values, and −w opposes excitation. w summarizes slower recovery effects. The cubic is a phenomenological model choice, not an Ohmic derivation or gate count. The example uses a = 0.7, b = 0.8 and epsilon = 0.08; it is one dimensionless FHN variant, with no reset rule.",
      "The 3D circuits are electrical equivalents. FHN’s state plane is a mathematical visualization of v and w, not anatomy. Try this model reveals its computed trace; parameter controls and assumptions stay in Adjust & inspect. Models have different input/time units, so compare their questions and retained states rather than treating their drives as physically equal.",
      "Bridge: We have three descriptions of electrical behavior. Now inspect the real membrane: what creates charge separation, and where do the ionic currents in these models come from?"
    ],
    "scene": 1,
    "nextLabel": "Enter the membrane"
  },
  {
    "key": "ions",
    "chapter": "02 / PROTEIN MOTION",
    "title": "How does a<br>channel move?",
    "tag": "02 / PROTEIN MOTION",
    "model": "Structural teaching animation + static measured backbones",
    "refs": [
      "navmotion",
      "kvmotion",
      "inactivation",
      "proteinview",
      "navstructure",
      "kvstructure",
      "opm"
    ],
    "cue": "Follow protein shape, voltage sensing and the ion pathway.",
    "notes": [
      "Bridge from the models: conductance changes because a protein changes its conformation. Stay on this single slide and use Next to visit four views: folded protein, voltage sensor, pore, and inactivation/recovery. Choose Sodium first, then compare Potassium. The concentration game has been removed.",
      "Folded protein: channels are made of amino-acid chains folded into a 3D structure within the membrane. The helical coils trace the protein backbone; the protein has atomic volume and side chains that are not fully shown. These coils are not hollow ion tubes. A typical animal sodium pore-forming subunit is one chain with four repeated domains; this Kv example uses four separate pore-forming subunits. Each domain/subunit has S1–S6 membrane-spanning segments. The exact architecture depends on channel family.",
      "Sense voltage: identify the gold S4 segments and positively charged residues. The membrane electric field affects their energetically preferred positions. During activation the sensors rearrange; mechanical/allosteric coupling involving the S4–S5 linkers affects the pore. The illustration synchronizes the sensors and exaggerates their displacement/rotation so the motion can be seen; real domains can have distinct kinetics and conformations.",
      "Open the pore: rotate to the outside view and use Cutaway view. S5, pore loops and S6 help form the central pathway; the intracellular S6 bundle rearranges during gating. The selectivity filter has specific chemistry that favors the relevant ion. Ions pass down their electrochemical driving force, rather than being pumped by the channel. Illustrative Na inward and K outward particles assume ordinary spike-related gradients and voltage; direction is not a universal property of each channel and is not calculated here. Particle count/speed, aperture and displayed progress do not represent measured flux, distances or biological time.",
      "Sodium inactivation: inspect the intracellular III–IV linker motif at the SIDE of the pore. In the illustrated mammalian-type mechanism an IFM motif binds to a hydrophobic pocket, allosterically stabilizing a nonconducting pore arrangement. It is not animated as a ball plugging the central pathway. A depolarized, inactivated channel differs from a resting, closed channel: availability must recover before ordinary reactivation. Continue the motion through repolarization, motif release and recovery. This is one mechanistic teaching example; no precise recovery time or atomistic route is predicted.",
      "Potassium comparison: four separate pore-forming subunits surround one pore. Show sensor activation, pore opening and closure with repolarization. No IFM motif is attached to the potassium channel. Some potassium channels have additional inactivation mechanisms; this view only illustrates activation/deactivation, so do not claim all K channels lack inactivation.",
      "Play the full cycle or scrub and pause the motion. Directly select any of the four views; click a helical sensor or pore to focus it. The animation uses schematic geometry and a chosen 15-second presentation cycle. It is not molecular dynamics, HH gate kinetics, an atomically accurate morph or a quantitative voltage-clamp experiment. The mechanism is evidence-informed; the displayed trajectory is illustrative.",
      "Inspect measured structure switches to separate static Cα coordinates, with missing residues kept as gaps: 5X0M cockroach NaVPaS (3.8 Å cryo-EM) or 2R9R rat Kv chimera and beta subunits (2.4 Å X-ray), oriented by OPM. These examples are different species from the generic mammalian-type inactivation animation and the classic squid HH model. Never call the animated IFM pathway a measured motion of the 5X0M protein. Backbone lines are a representation, not the entire surface or atomic volume. Evidence gives provenance and interpretation.",
      "Computing connection: the protein has multiple physical conformations. HH summarizes population-level activation and availability with a few state variables; m, h and n are not literal door counts. Bridge: coordinated changes in membrane conductance generate a spike. Now follow its propagation along the axon."
    ],
    "scene": 5,
    "nextLabel": "Follow the spike"
  },
  {
    "key": "axon",
    "chapter": "03 / RELAY",
    "title": "How does the<br>spike travel?",
    "tag": "03 / RELAY",
    "model": "Conceptual propagation · slowed animation",
    "refs": [
      "axon"
    ],
    "cue": "Follow local regeneration along the axon.",
    "notes": [
      "The cell has produced a spike. Track how that event reaches the output terminal without imagining an ion flying down the whole axon. First watch the wave from outside; then ride alongside it. Toggle myelin to see the distinction between exposed nodes and insulated internodes.",
      "Follow the signal down the axon. Local current spreads to neighboring membrane, where voltage-gated channels regenerate an action potential. A spike is a traveling change in membrane voltage; the same sodium ion does not travel the whole axon carrying a message.",
      "With myelin, insulated regions favor rapid passive spread between exposed nodes of Ranvier, where spikes regenerate. Toggle myelin to compare the visual pattern. The animation is deliberately slowed and uses a chosen speed ratio; it does not solve cable equations or predict a biological conduction velocity.",
      "Computing connection: a signal can be relayed while preserving a recognizable event. Do not imply that neurons are lossless wires: conduction depends on geometry, channel properties and physiological state. Click exposed nodes to send a conceptual wave."
    ],
    "scene": 7,
    "nextLabel": "Cross the synapse"
  },
  {
    "key": "synapse",
    "chapter": "04 / RECEIVE AGAIN",
    "title": "It arrived.<br>Will the next cell fire?",
    "tag": "04 / RECEIVE AGAIN",
    "model": "Delayed voltage-jump synapse + LIF",
    "refs": [
      "synapse",
      "lif"
    ],
    "cue": "Send one event. Then send a close burst.",
    "notes": [
      "Return to the opening question. The message made it to another cell, but its arrival is not a promise of a new spike. Watch release, the cleft and the receiver, then compare one incoming event with a close burst. The anatomy is illustrative; the receiver uses the stated delayed-jump LIF model.",
      "At a chemical synapse, a presynaptic spike can trigger calcium-dependent neurotransmitter release. Transmitter binds to postsynaptic receptors and changes conductance. The floating particles are an illustration of this sequence; release probability and receptor biophysics are not calculated here.",
      "The numerical experiment uses a deliberately simpler synapse: after a delay, an arriving event jumps the receiver’s voltage by the chosen weight in mV. One 8 mV excitatory event takes rest −65 mV to −57 mV and does not fire. A close burst can sum. A negative voltage jump implements a simple inhibitory effect, not all forms of biological inhibition.",
      "Computing connection: a sent event is weighted, delayed, and combined with a receiver’s state. This extends the supplied Lab 02 single-spike experiment. Change weight and burst count. Our trace shows only the receiver; time zero is experiment start and the first sender event is at 20 ms."
    ],
    "scene": 8,
    "nextLabel": "Follow the receiver’s state"
  },
  {
    "key": "timing",
    "chapter": "05 / COMBINE",
    "title": "Can timing<br>change the decision?",
    "tag": "05 / COMBINE",
    "model": "LIF · τ 10 ms · threshold −50 mV",
    "refs": [
      "lif"
    ],
    "cue": "Two identical pulses. Change only the gap.",
    "notes": [
      "We saw that one synaptic input need not fire the receiver. Now isolate one reason: recent inputs can combine before their effects fade. For control, we replace synaptic jumps with two precisely timed injected-current pulses. Keep their number, amplitude and duration fixed; change only the gap.",
      "Deliver two identical current pulses. Each is 0.20 nA for 10 ms. First separate them with a 40 ms gap, then a 5 ms gap. The close pair crosses threshold because some of the first voltage response remains. The distant pair loses that short-lived memory through the leak.",
      "Computing connection: this is a leaky temporal accumulator. Same pulse count and charge can lead to different decisions. A neuron’s state matters; it is not just an input/output lookup table.",
      "Our LIF neuron has rest/reset −65 mV, R = 100 MΩ, C = 0.1 nF and threshold −50 mV, matching the supplied lab’s core parameters. Spikes are recorded events, not calculated biological waveforms. We explicitly hold voltage at reset for 5 ms after a spike. This differs from a Brian model whose differential equation continues evolving during refractoriness unless it is marked “unless refractory”."
    ],
    "scene": 3,
    "nextLabel": "Test another prediction"
  },
  {
    "key": "charge",
    "chapter": "06 / TEST",
    "title": "Is the total<br>input enough?",
    "tag": "06 / TEST",
    "model": "Two identical LIF neurons",
    "refs": [
      "lif"
    ],
    "cue": "Equal charge. Predict which delivery will work.",
    "notes": [
      "The close-pulse experiment showed that timing matters. Test a stronger claim: would equal total input always produce the same result? Ask for a prediction before revealing either trace. Use the surprise to connect leak and state to the result.",
      "Ask for a prediction before pressing Compare. A short strong pulse is 0.6 nA × 5 ms. A long weak pulse is 0.1 nA × 30 ms. Both deliver 3 nA·ms, or 3 pC. Only the short strong pulse crosses threshold with these parameters.",
      "The slow pulse gives leak more time to oppose voltage change. In a passive membrane with constant current, V(t) = E_L + RI(1 − exp(−t/τ)). The long pulse here approaches −55 mV, below our −50 mV threshold.",
      "Computing connection: integrating input is not the same as adding all values without regard to time. This reproduces the central equal-charge experiment in the supplied notebook. The visible flashes mark threshold events; their 3D size is illustrative."
    ],
    "scene": 4,
    "nextLabel": "Read the output"
  },
  {
    "key": "code",
    "chapter": "07 / READ",
    "title": "What is the<br>message, exactly?",
    "tag": "07 / READ",
    "model": "LIF / adapting LIF · 500 ms window",
    "refs": [
      "code",
      "lif"
    ],
    "cue": "Read the event times. Change the drive.",
    "notes": [
      "We have followed the physical event. Now ask what a computer could record from it: a sequence of times. Increase the input and compare the event train, then use adaptation to show that an unchanged input can still produce a changing pattern.",
      "The raster shows event times. Count events in the 400 ms stimulation interval from 50 to 450 ms: rate = count / 0.4 seconds. Increasing drive can increase firing rate in this model. This demonstrates one possible code, not a universal rule for every neuron or stimulus.",
      "Switch on adaptation. Each spike adds a 0.04 nA opposing variable w, which decays with a 120 ms time constant. The same sustained input can then produce a changing rhythm. This is a phenomenological mechanism from the supplied lab; it does not identify a particular ion channel.",
      "Computing connection: an event stream can carry information in count, timing and patterns across neurons. Reducing it to a single mean rate discards information. All spikes in LIF are threshold events; greater input does not make a simulated spike “taller”."
    ],
    "scene": 9,
    "nextLabel": "Connect the inputs"
  },
  {
    "key": "network",
    "chapter": "08 / CONNECT",
    "title": "One receiver.<br>Two possible inputs.",
    "tag": "08 / CONNECT",
    "model": "Guided LIF animation · fixed 8 mV event weights",
    "refs": [
      "lif",
      "synapse"
    ],
    "cue": "Press play. Follow one message, then two.",
    "notes": [
      "Press Play the explanation once. A 27-second film automatically visits no messages, A alone, B alone, both together, and the final summary. Camera movement, packet delivery and the receiver are synchronized. Pause/continue and replay are optional; there are no weights to tune and no manual tests.",
      "The labeled A and B source spheres are prescribed event generators, not fully simulated biological neurons. Connections lead to schematic receiving dendrites. The central cell uses the LIF model; its axon carries the output event to an output indicator. Geometry is a teaching circuit, not a measured anatomical reconstruction.",
      "Each trial starts independently at rest −65 mV. The threshold is −50 mV, requiring a 15 mV rise. Each enabled source sends one event at model time 20 ms; after 10 ms it creates an 8 mV voltage jump at the receiver. R = 100 MΩ, C = 0.1 nF, τ = 10 ms. A alone and B alone each reach −57 mV, then leak back toward rest without firing. With no input the cell stays at rest.",
      "Both events arrive simultaneously in the paired trial. Their jumps add to 16 mV, reaching −49 mV and crossing threshold. The solver records exactly one event, resets to −65 mV and holds for 5 ms. The output particle reflects that recorded event. LIF does not calculate the biological spike waveform; the bright flash is an event marker.",
      "The UI meter and 16-segment 3D bar show PEAK voltage rise from the current trial, not stored charge or sustained voltage. An orange mark indicates the 15 mV threshold. The cell glow follows the current LIF voltage; the retained meter is a summary of the peak. Playback holds the event-time trace sample for one presentation second so the audience can see the crossing before reset. Visual motion and the 27-second story clock are deliberately slowed, not biological timing.",
      "For the narrative say: A alone changes the state but stays below the line. B alone does the same. Arriving together, their effects add and produce an output. The four quiet/fired cards record actual solver outcomes only as each trial finishes. Both are necessary in this chosen, simultaneous-input setup: a finite-window AND-like behavior, not a universal biological Boolean rule.",
      "This is a fixed explanatory animation. No learning algorithm chooses the weights and no student tuning is required. Different weights, timing or initial states could give different behavior. Computing connection: input events update a continuous state; a threshold converts that state into a discrete output event. Bridge: what numbers must the computer remember for each modeled neuron?"
    ],
    "scene": 11,
    "nextLabel": "Scale it up"
  },
  {
    "key": "scale",
    "chapter": "09 / SCALE",
    "title": "What must the<br>computer remember?",
    "tag": "09 / SCALE",
    "model": "State-count illustration · fixed 10,000 cells",
    "refs": [
      "lif",
      "fhn",
      "gates",
      "bluebrain",
      "portal"
    ],
    "cue": "Start with one neuron and the numbers describing its state.",
    "notes": [
      "The question is concrete: what current information must a computer retain to describe one neuron? A state value is a number that describes the modeled neuron now and is updated as simulated time advances. Voltage is the easiest example. Begin with the single schematic neuron; then point to its data record. Each colored box represents one continuous dynamical state variable, not a part of the biological cell.",
      "Press Play the explanation once. The 25-second animation visits LIF, FHN and HH in increasing state-count order, then ends with the choice of detail. Pause/continue and replay are optional. No memory-unit arithmetic, budget challenge or speed benchmark is shown. All three comparisons use the SAME 10,000 modeled cells.",
      "LIF retains one continuous state value, V: the current membrane voltage. At each simulation step its equation updates that value; a separate threshold/reset rule records events. For 10,000 cells that means 10,000 continuous state values. This count excludes refractory bookkeeping and recorded spike times.",
      "FHN retains two continuous state values, v and w: dimensionless excitation/voltage-like state and slower recovery. For 10,000 cells that means 20,000 state values. The v shown in FHN is not a voltage measured in mV; no equations or numerical trace are repeated on this slide.",
      "Classic HH retains four continuous state values, V, m, h and n: voltage, sodium activation, sodium availability, and potassium activation. For 10,000 cells that means 40,000 state values. Gates describe effective activation and availability, not individual molecular door counts.",
      "The 3D block contains exactly 10,000 proxy points, each standing for one modeled cell. It is a data illustration; no coupled 10,000-cell simulation or empirical brain anatomy is displayed. The selected model changes the one-cell data record and total state count, while the population stays fixed. Animated box appearance is presentation motion, not a biological trajectory.",
      "Counting continuous state values illustrates one reason model detail matters at scale. It is not total runtime memory or a speed ratio: connectivity, fixed parameters, refractory timers, event queues, spike recordings and solver work arrays are excluded. Models also differ in equations, methods, units and the phenomena they can explain. Do not say HH is exactly four times slower or automatically the best model. Choose sufficient detail for the scientific question.",
      "A real research example opens separately: Markram et al. (2015) reconstructed a juvenile rat somatosensory cortical microcircuit; the public portal reports 31,346 neurons. The presentation’s 10,000-dot block does not reproduce that reconstruction. End the narrative: we began with a cell, modeled its state, followed its signals, and now understand what a computer keeps when many such cells are represented."
    ],
    "scene": 12,
    "nextLabel": "Questions & discussion"
  },
  {
    "key": "thanks",
    "chapter": "10 / DISCUSSION",
    "title": "Thank you.",
    "tag": "FROM CELL TO COMPUTATION",
    "model": "Conceptual neuron · closing view",
    "refs": ["anatomy"],
    "cue": "Questions & discussion",
    "notes": [
      "Thank the audience for following the journey from one cell to computational models. Pause and invite questions.",
      "If a discussion prompt helps, ask which details a model needs for a question about spike times, recovery, or ion-channel currents.",
      "The closing view returns to the same conceptual neuron used in the opening. Its geometry is a teaching illustration rather than an anatomical reconstruction.",
      "Previous returns to the state-count explanation. Replay returns to the opening. The Join control remains available for the audience to revisit experiments on their own devices."
    ],
    "scene": 13,
    "nextLabel": "Replay the journey"
  }
];
