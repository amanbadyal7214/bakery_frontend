const fs = require('fs');
const path = require('path');

const walkSync = (dir, filelist = []) => {
  fs.readdirSync(dir).forEach(file => {
    const dirFile = path.join(dir, file);
    if (fs.statSync(dirFile).isDirectory()) {
      if (file !== 'node_modules' && file !== '.git') {
        filelist = walkSync(dirFile, filelist);
      }
    } else {
      if (file.endsWith('.tsx') || file.endsWith('.ts')) {
        filelist.push(dirFile);
      }
    }
  });
  return filelist;
};

const replaceFonts = (files) => {
  files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    let changed = false;

    if (content.includes('font-playfair')) {
      content = content.replace(/font-playfair/g, 'font-dancing');
      changed = true;
    }
    
    if (content.includes('font-poppins')) {
      content = content.replace(/font-poppins/g, 'font-lora');
      changed = true;
    }

    if (changed) {
      fs.writeFileSync(file, content, 'utf8');
      console.log(`Updated: ${file}`);
    }
  });
};

const srcFiles = walkSync('./src');
replaceFonts(srcFiles);
console.log('Font replacement complete.');
