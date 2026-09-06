/*
  Compiles the CSS and JS the PHP site serves.

  The site does not need Node to run — this only has to be re-run when the
  design or the scripts change, and the outputs are committed.
*/
import { build } from 'esbuild';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
const run = promisify(execFile);

await build({
  entryPoints: {
    home: 'src/home.js',
    projects: 'src/projects.js',
    project: 'src/project.js',
  },
  outdir: 'assets',
  bundle: true,
  format: 'esm',
  minify: true,
  target: ['es2020'],
  logLevel: 'info',
});

for (const [input, output] of [['src/site.css', 'assets/site.css'], ['src/admin.css', 'assets/admin.css']]) {
  await run('npx', ['tailwindcss', '-i', input, '-o', output, '--minify'], { cwd: process.cwd() });
  console.log('css →', output);
}
