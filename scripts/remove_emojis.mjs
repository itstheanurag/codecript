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

const processFile = (filePath) => {
  if (!filePath.endsWith('.md')) return;
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Use Unicode property escapes to match emojis safely
  const emojiRegex = /[\p{Emoji_Presentation}\p{Extended_Pictographic}]/gu;
  
  if (emojiRegex.test(content)) {
    const newContent = content.replace(emojiRegex, '');
    fs.writeFileSync(filePath, newContent);
    console.log('Removed emojis from:', filePath);
  }
}

walkDir('./content', processFile);
processFile('./README.md');
