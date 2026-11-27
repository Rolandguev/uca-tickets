// Genera public/api/events.json a partir de src/data/events.js (una sola fuente de datos).
// Se ejecuta solo antes de "npm run dev" y "npm run build" (scripts predev / prebuild).
import { mkdirSync, writeFileSync } from 'node:fs';
import { EVENTS } from '../src/data/events.js';

mkdirSync('public/api', { recursive: true });
writeFileSync('public/api/events.json', `${JSON.stringify(EVENTS, null, 2)}\n`);
console.log(`public/api/events.json: ${EVENTS.length} eventos`);
