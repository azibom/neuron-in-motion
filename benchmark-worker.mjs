import { benchmark } from './physics.mjs';
self.onmessage=({data})=>self.postMessage(benchmark(data.model,data.count));
