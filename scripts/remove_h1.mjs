import fs from 'fs';
import path from 'path';

function walkDir(dir, callback) {
  const files = fs.readdirSync(dir);
  for (const f of files) {
    const dirPath = path.join(dir, f);
    const isDirectory = fs.statSync(dirPath).isDirectory();
    if (isDirectory) {
      walkDir(dirPath, callback);
    } else {
      callback(dirPath);
    }
  }
}

walkDir('./content', (filePath) => {
  if (!filePath.endsWith('.md')) return;
  let content = fs.readFileSync(filePath, 'utf8');
  
  // This regex matches:
  // 1. The frontmatter block starting at the very beginning of the string: ^(---[\s\S]*?---\r?\n)
  // 2. Any amount of whitespace/newlines: \s*
  // 3. The first H1 tag: #\s+[^\r\n]+\r?\n
  // 4. Any amount of whitespace/newlines: \s*
  const regex = /^(---[\s\S]*?---\r?\n)\s*#\s+[^\r\n]+\r?\n\s*/;
  
  if (regex.test(content)) {
    // Replace with just the frontmatter block and a double newline
    const newContent = content.replace(regex, '$1\n');
    fs.writeFileSync(filePath, newContent);
    console.log('Fixed:', filePath);
  }
});
