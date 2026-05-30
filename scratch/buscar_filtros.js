const fs = require('fs');
const path = require('path');

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) {
      results = results.concat(walk(file));
    } else {
      if (file.endsWith('.tsx') || file.endsWith('.css') || file.endsWith('.ts')) {
        results.push(file);
      }
    }
  });
  return results;
}

const files = walk(path.join(__dirname, '..', 'src'));
files.forEach(file => {
  const content = fs.readFileSync(file, 'utf8');
  // Busca seletor css "footer" ou qualquer coisa aplicando opacidade/filtro no footer
  const lines = content.split('\n');
  lines.forEach((line, idx) => {
    if (line.includes('footer') && (line.includes('opacity') || line.includes('filter') || line.includes('gray') || line.includes('opacity-'))) {
      console.log(`[${file}:${idx + 1}] ${line.trim()}`);
    }
  });
});
console.log('Busca finalizada!');
