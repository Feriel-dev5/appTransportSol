const fs = require('fs');

const files = [
  'src/pages/passager/NotificationP.jsx',
  'src/pages/chauffeur/NotificationM.jsx'
];

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf-8');
  const regex = /\{n\.actionable\s*&&\s*n\.category\s*===\s*"Demandes"\s*\?\s*\(\s*(<>[\s\S]*?<\/>)\s*\)\s*:\s*\(\s*<button[^>]*className="np-btn-primary"[\s\S]*?<\/button>\s*\)\s*\}/g;
  content = content.replace(regex, '{n.actionable && n.category === "Demandes" && (\n                        $1\n                      )}');
  fs.writeFileSync(file, content, 'utf-8');
  console.log('Replaced in', file);
});
