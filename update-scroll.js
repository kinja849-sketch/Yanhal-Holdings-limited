const fs = require('fs');
const path = require('path');
const dir = path.join(__dirname, 'src', 'components');

const files = fs.readdirSync(dir).filter(f => f.endsWith('.tsx'));
files.forEach(f => {
  const p = path.join(dir, f);
  let content = fs.readFileSync(p, 'utf8');
  let changed = false;

  // Replace once: true with once: false
  if (content.includes('once: true')) {
    content = content.replace(/once:\s*true/g, 'once: false');
    changed = true;
  }

  // In Hero.tsx, replace animate={{ opacity: 1, ... }} with whileInView={{ ... }} viewport={{ once: false }}
  if (f === 'Hero.tsx') {
    // For motion.p and others that use animate instead of whileInView
    content = content.replace(/animate=\{\{\s*opacity:\s*1,\s*y:\s*0\s*\}\}/g, 'whileInView={{ opacity: 1, y: 0 }} viewport={{ once: false }}');
    content = content.replace(/animate=\{\{\s*opacity:\s*1,\s*x:\s*0\s*\}\}/g, 'whileInView={{ opacity: 1, x: 0 }} viewport={{ once: false }}');
    changed = true;
  }

  if (changed) {
    fs.writeFileSync(p, content);
    console.log('Updated ' + f);
  }
});
