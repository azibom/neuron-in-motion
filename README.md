# Neuron in Motion

An interactive browser presentation for **Assignment 0 · Part 2: The Neuron and Neural Activity**.

The experience begins with a conceptual neuron simulator, then opens a ten-slide, approximately ten-minute presentation explaining:

1. how graded input becomes discrete spike timing;
2. how neuronal anatomy shapes information flow;
3. membrane voltage, ion gradients and selective conductance;
4. excitatory and inhibitory integration;
5. action-potential generation;
6. axonal propagation and myelin;
7. chemical synaptic transmission;
8. what different experiments call “neural activity”;
9. rate, timing and population codes;
10. why different computational models preserve different biological details.

## Interactive model

The opening lab is a **conceptual leaky integrate-and-fire simulation**. Visitors can add brief excitatory and inhibitory inputs or increase sustained drive. The live display shows membrane-potential decay, threshold crossing, an illustrative action-potential waveform, refractoriness, axonal propagation and terminal release.

It is intentionally not a numerical Hodgkin–Huxley implementation. The project keeps the distinction visible in the interface and presentation.

## Presentation features

- Ten responsive, keyboard-navigable slides
- Presenter notes on every slide (`N` toggles notes)
- Fullscreen mode
- Inline source links and a complete reference dialog
- Original diagrams and animations
- No external runtime dependencies, analytics, backend, cookies or response uploads

## Run locally

No build step is required.

```bash
python -m http.server 4177
```

Then open `http://127.0.0.1:4177/`.

## Controls

- Lab: `E` adds excitatory input; `I` adds inhibitory input
- Slides: left/right arrows, Page Up/Page Down or Space
- Presenter notes: `N`
- Fullscreen: lower-right presentation control

## Core references

- Hodgkin, A. L. & Huxley, A. F. (1952). [A quantitative description of membrane current](https://doi.org/10.1113/jphysiol.1952.sp004764).
- Bean, B. P. (2007). [The action potential in mammalian central neurons](https://doi.org/10.1038/nrn2148).
- Debanne, D. et al. (2011). [Axon physiology](https://doi.org/10.1152/physrev.00048.2009).
- Südhof, T. C. (2013). [Neurotransmitter release](https://doi.org/10.1016/j.neuron.2013.10.022).
- Buzsáki, G. et al. (2012). [The origin of extracellular fields and currents](https://doi.org/10.1038/nrn3241).
- Dayan, P. & Abbott, L. F. (2001). [Theoretical Neuroscience](https://mitpress.mit.edu/9780262541855/theoretical-neuroscience/).

The complete selected bibliography is included in the website.

## License

Code and original diagrams are released under the MIT License. Linked publications retain their respective copyrights. No figures from the cited sources are redistributed.

