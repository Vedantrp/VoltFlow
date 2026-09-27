import fs from 'fs';
import path from 'path';

const dir = './node_modules/@wokwi/elements/dist/esm';
const files = fs.readdirSync(dir).filter(f => f.endsWith('-element.js'));

const results = {};

for (const file of files) {
  const content = fs.readFileSync(path.join(dir, file), 'utf8');
  const tagMatch = content.match(/@customElement\(['"]([^'"]+)['"]\)/) || content.match(/customElement\(['"]([^'"]+)['"]\)/);
  const tag = tagMatch ? tagMatch[1] : file.replace('-element.js', '');

  // Extract pinInfo array
  const pinMatch = content.match(/this\.pinInfo\s*=\s*(\[[^\]]+\])/s);
  let pins = [];
  if (pinMatch) {
    try {
      // Evaluate or parse the pin array
      // pin objects look like { name: '...', x: 12, y: 34 ... }
      const pinStr = pinMatch[1]
        .replace(/signals:\s*\[[^\]]*\]/g, 'signals: []')
        .replace(/number:\s*\d+/g, '')
        .replace(/description:\s*['"][^'"]*['"]/g, '');
      const fn = new Function(`return ${pinMatch[1]};`);
      pins = fn();
    } catch (e) {
      // regex fallback
      const re = /{\s*name:\s*['"]([^'"]+)['"],\s*x:\s*([\d.-]+),\s*y:\s*([\d.-]+)/g;
      let pm;
      while ((pm = re.exec(pinMatch[1])) !== null) {
        pins.push({ name: pm[1], x: parseFloat(pm[2]), y: parseFloat(pm[3]) });
      }
    }
  }

  // Extract svg width & height or viewBox
  const svgMatch = content.match(/<svg[^>]*>/);
  let width = null;
  let height = null;
  if (svgMatch) {
    const wm = svgMatch[0].match(/width="([\d.]+)(?:mm)?"/);
    const hm = svgMatch[0].match(/height="([\d.]+)(?:mm)?"/);
    const vbm = svgMatch[0].match(/viewBox="[^"]*?\s+[^"]*?\s+([\d.]+)\s+([\d.]+)"/);
    if (wm) width = parseFloat(wm[1]);
    else if (vbm) width = parseFloat(vbm[1]);
    if (hm) height = parseFloat(hm[1]);
    else if (vbm) height = parseFloat(vbm[2]);
  }

  results[tag] = {
    file,
    width,
    height,
    pins: pins.map(p => ({ name: p.name, x: p.x, y: p.y, label: p.label || p.name }))
  };
}

fs.writeFileSync('wokwi_elements_info.json', JSON.stringify(results, null, 2));
console.log('Extracted info for', Object.keys(results).length, 'elements');
