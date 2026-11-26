import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;
const HOST = '0.0.0.0';

const blockedPaths = new Set([
  '/server.js',
  '/package.json',
  '/package-lock.json',
  '/metadata.json',
  '/Executar-Setup-GitHub-v2.bat',
  '/Setup-GitHub-v2.ps1',
  '/CNAME',
  '/README.md',
]);

app.use((req, res, next) => {
  if (blockedPaths.has(req.path) || req.path.startsWith('/.')) {
    return res.status(404).send('Not Found');
  }
  next();
});

app.use(express.static(__dirname, { extensions: ['html'] }));

app.get('/', (_req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, HOST, () => {
  console.log(`Server listening on http://${HOST}:${PORT}`);
});
