const fs = require('fs');
const path = require('path');

function processDirectory(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      processDirectory(fullPath);
    } else if (fullPath.endsWith('.tsx')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      if (content.includes('<div className="loading-container"><div className="loading-spinner" /></div>')) {
        content = content.replace(/<div className="loading-container"><div className="loading-spinner" \/><\/div>/g, '<Loader />');
        if (!content.includes('import Loader')) {
          const importStmt = "import Loader from '@/components/Loader';\n";
          if (content.includes('import ')) {
             content = content.replace('import ', importStmt + 'import ');
          } else {
             content = importStmt + content;
          }
        }
        fs.writeFileSync(fullPath, content);
        console.log('Updated', fullPath);
      }
    }
  }
}

processDirectory('app');
