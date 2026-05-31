/**
 * Vite resolves `new URL('../../assets/...', import.meta.url)` from src/game/assets.ts
 * against apps/<name>/assets. Assets live under static/assets — link them for every app.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const appsDir = path.join(root, 'apps');

for (const app of fs.readdirSync(appsDir)) {
	const appDir = path.join(appsDir, app);
	if (!fs.statSync(appDir).isDirectory()) continue;

	const staticAssets = path.join(appDir, 'static', 'assets');
	if (!fs.existsSync(staticAssets)) continue;

	const link = path.join(appDir, 'assets');
	try {
		const stat = fs.lstatSync(link);
		if (stat.isSymbolicLink()) continue;
		fs.rmSync(link, { recursive: true, force: true });
	} catch {
		// link does not exist
	}

	fs.symlinkSync('static/assets', link);
	console.log(`[prepare-app-assets] ${app}/assets -> static/assets`);
}
