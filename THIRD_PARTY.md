# Credits and provenance

- **Three.js r170** and **OrbitControls**, Three.js authors, MIT. Bundled locally in `vendor/`. License: `vendor/THREE-LICENSE.txt`.
- **QR Code Generator for JavaScript 1.4.4**, Kazuhiko Arase, MIT. Bundled locally as `vendor/qrcode.js`; its original copyright and license notice are preserved. License text: `vendor/QR-LICENSE.txt`.
- **NaVPaS experimental coordinates:** PDB [5X0M](https://www.rcsb.org/structure/5X0M), Shen et al., *Science* (2017), [doi:10.1126/science.aal4326](https://doi.org/10.1126/science.aal4326). The protein is from *Periplaneta americana*.
- **Kv experimental coordinates:** PDB [2R9R](https://www.rcsb.org/structure/2R9R), Long et al., *Nature* (2007), [doi:10.1038/nature06265](https://doi.org/10.1038/nature06265). Rat Kv1.2/Kv2.1 paddle chimera with associated beta subunits.
- **Membrane orientation:** [OPM — Orientations of Proteins in Membranes](https://opm.phar.umich.edu/). Downloaded files: `https://opm-assets.storage.googleapis.com/pdb/5x0m.pdb` and `https://opm-assets.storage.googleapis.com/pdb/2r9r.pdb`.

The PDB/OPM files are factual structural data. Original files remain under `research/structures/`. The public viewer uses compact JSON containing Cα positions and provenance metadata. The conversion script splits traces at residue gaps and distances over 7 Å, retains the OPM coordinate frame, and does not invent missing residues. Display uses a uniform scale and smooth backbone interpolation. It does not depict an all-atom surface or calculate conformational dynamics.

Cell morphology, bilayer placement, spines, equivalent-circuit geometry, myelin cutaways, vesicles, receptor cartoons and circuit scenes are original schematic illustrations. They are not anatomical or molecular reconstructions beyond the explicitly identified protein backbones.

No illustrations or figures from the linked publications are redistributed. Full educational sources and per-slide citations are available inside the presentation.
