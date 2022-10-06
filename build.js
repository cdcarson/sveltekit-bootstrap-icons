import { readdir, readFile, writeFile } from 'node:fs/promises';
import { join, extname, basename } from 'node:path';
import { ensureDir, emptyDir } from 'fs-extra';
import { camelCase, upperFirst} from 'lodash-es';
import { execFile} from 'node:child_process'

const bsIconsDir = join(process.cwd(), 'node_modules', 'bootstrap-icons', 'icons');
const libDir = join(process.cwd(), 'src', 'lib');
const files = await readdir(bsIconsDir);
const svgFiles = files.filter((name) => extname(name) === '.svg');
const replacements = {
	'width="16"': 'width="1em"',
	'height="16"': 'height="1em"'
};
/** @type {Record<string, string[]>} */

await ensureDir(libDir);
await emptyDir(libDir);
for (const svgFileName of svgFiles) {
	const svgFilePath = join(bsIconsDir, svgFileName);
  const componentName = `Bi${upperFirst(camelCase(basename(svgFileName, '.svg')))}.svelte`;
  const componentFilePath = join(libDir, componentName)
	let content = await readFile(svgFilePath, { encoding: 'utf-8' });
	Object.keys(replacements).forEach((search) => {
		if (content.indexOf(search) < 0) {
			throw new Error(`File ${svgFileName} does not have the string ${search}`);
		}
		content = content.replace(search, replacements[search]);
	});
  await writeFile(componentFilePath, content)

}
execFile(join('node_modules', '.bin', 'svelte-package'), (error, stdout) => {
  if (error) {
    throw error;
  }
  console.log(stdout);
})
console.log(svgFiles.length);
