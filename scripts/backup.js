#!/usr/bin/env node
/**
 * Download the whole Realtime Database to backups/<project>-<timestamp>.json.
 *
 *   npm run backup                 # default project from .firebaserc
 *   npm run backup -- --project x  # another project
 *
 * Uses the Firebase CLI's login (`firebase login`), which reads as the project
 * owner and ignores database rules. Backups hold everyone's picks and names,
 * so backups/ is git-ignored. Restore steps are in README.md.
 */
import { spawnSync } from 'node:child_process';
import { mkdirSync, readFileSync, statSync } from 'node:fs';
import { dirname, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const args = process.argv.slice(2);
const flag = args.indexOf('--project');
const project =
	flag >= 0 ? args[flag + 1] : JSON.parse(readFileSync(join(root, '.firebaserc'), 'utf8')).projects.default;

const stamp = new Date().toISOString().replace(/[:.]/g, '-').replace(/-\d{3}Z$/, 'Z');
const dir = join(root, 'backups');
const file = join(dir, `${project}-${stamp}.json`);
mkdirSync(dir, { recursive: true });

console.log(`Backing up ${project} …`);
const run = spawnSync('firebase', ['database:get', '/', '--project', project, '--output', file], {
	stdio: 'inherit',
	cwd: root
});
if (run.error?.code === 'ENOENT') {
	console.error('The Firebase CLI is not installed. Run: npm i -g firebase-tools && firebase login');
	process.exit(1);
}
if (run.status !== 0) {
	console.error('\nIf that was an auth error, run: firebase login --reauth');
	process.exit(run.status ?? 1);
}

// Sanity-check the file and print a summary, so an empty or broken backup is obvious.
let data;
try {
	data = JSON.parse(readFileSync(file, 'utf8'));
} catch (err) {
	console.error(`Backup written but it isn't valid JSON: ${err.message}`);
	process.exit(1);
}
if (!data || typeof data !== 'object') {
	console.error('Backup is empty. Check the project name.');
	process.exit(1);
}

const count = (node) => (node && typeof node === 'object' ? Object.keys(node).length : 0);
const kb = (statSync(file).size / 1024).toFixed(1);
console.log(`\nSaved ${relative(root, file)} (${kb} KB)`);
for (const year of Object.keys(data.settings || {}).sort()) {
	const cats = count(data.groups?.[year]);
	const ballots = count(data.ballots?.[year]);
	const results = (Object.values(data.settings[year]?.results || {})).filter(Boolean).length;
	console.log(`  ${year}: ${cats} categories, ${ballots} ballots, ${results} results`);
}
console.log(`  admins: ${count(data.admins)}`);
