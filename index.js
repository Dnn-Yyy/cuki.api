const express = require('express');
const chalk = require('chalk');
const fs = require('fs');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 4000;

app.enable("trust proxy");
app.set("json spaces", 2);

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cors());
app.use('/', express.static(path.join(__dirname, 'api-page')));
app.use('/src', express.static(path.join(__dirname, 'src')));

// ---------- Konfigurasi Creator ----------
// Ganti settings.json dengan environment variable atau hardcode
const CREATOR = process.env.API_CREATOR || "Created Using Rynn UI";

// ---------- Middleware Response Wrapper ----------
app.use((req, res, next) => {
  const originalJson = res.json;
  res.json = function (data) {
    if (data && typeof data === 'object') {
      const responseData = {
        status: data.status,
        creator: CREATOR,
        ...data
      };
      return originalJson.call(this, responseData);
    }
    return originalJson.call(this, data);
  };
  next();
});

// ---------- Auto Discovery & Registry ----------
const routeMetadata = []; // untuk openapi.json

const apiFolder = path.join(__dirname, './src/api');

// Fungsi untuk memproses satu definisi route
function registerRoute(routeDef, category) {
  const { method, path: routePath, handler, metadata = {} } = routeDef;
  if (!method || !routePath || typeof handler !== 'function') {
    console.warn(chalk.yellow(`⚠️  Route invalid di ${category}, skip.`));
    return;
  }

  // Daftarkan ke Express
  const methodLower = method.toLowerCase();
  if (app[methodLower]) {
    app[methodLower](routePath, handler);
    console.log(chalk.bgHex('#FFFF99').hex('#333').bold(` Loaded: ${method.toUpperCase()} ${routePath}`));
  } else {
    console.warn(chalk.yellow(`⚠️  Method "${method}" tidak dikenal di ${category}`));
    return;
  }

  // Simpan metadata untuk openapi.json
  routeMetadata.push({
    method: method.toUpperCase(),
    path: routePath,
    category: metadata.category || category || 'Umum',
    description: metadata.description || '',
    parameters: metadata.parameters || [],
    // bisa tambahkan field lain sesuai kebutuhan
  });
}

// Baca semua subfolder di src/api
fs.readdirSync(apiFolder).forEach((subfolder) => {
  const subfolderPath = path.join(apiFolder, subfolder);
  if (!fs.statSync(subfolderPath).isDirectory()) return;

  fs.readdirSync(subfolderPath).forEach((file) => {
    if (path.extname(file) !== '.js') return;

    const filePath = path.join(subfolderPath, file);
    try {
      const exported = require(filePath);

      // Jika file mengekspor array, proses satu per satu
      if (Array.isArray(exported)) {
        exported.forEach((routeDef, idx) => {
          // Jika routeDef tidak punya category, pakai nama subfolder
          if (!routeDef.metadata) routeDef.metadata = {};
          if (!routeDef.metadata.category) routeDef.metadata.category = subfolder;
          registerRoute(routeDef, subfolder);
        });
      } 
      // Jika file mengekspor objek tunggal
      else if (typeof exported === 'object' && exported.handler) {
        if (!exported.metadata) exported.metadata = {};
        if (!exported.metadata.category) exported.metadata.category = subfolder;
        registerRoute(exported, subfolder);
      } 
      // Jika masih menggunakan style lama (fungsi yang menerima app) – kita tetap support
      else if (typeof exported === 'function') {
        // Jalankan fungsi lama (tidak akan terekam di metadata)
        exported(app);
        console.log(chalk.yellow(`⚠️  Legacy style detected: ${file} (metadata tidak tersimpan)`));
      } else {
        console.warn(chalk.yellow(`⚠️  Format tidak dikenali di ${file}, skip.`));
      }
    } catch (err) {
      console.error(chalk.red(`❌ Gagal load ${file}: ${err.message}`));
    }
  });
});

console.log(chalk.bgHex('#90EE90').hex('#333').bold(' Load Complete! ✓ '));
console.log(chalk.bgHex('#90EE90').hex('#333').bold(` Total Routes Loaded: ${routeMetadata.length} `));

// ---------- Endpoint OpenAPI JSON ----------
app.get('/openapi.json', (req, res) => {
  res.json({
    creator: CREATOR,
    total: routeMetadata.length,
    routes: routeMetadata
  });
});

// ---------- Static Pages ----------
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'api-page', 'index.html'));
});

// ---------- 404 & Error Handler ----------
app.use((req, res) => {
  res.status(404).sendFile(path.join(__dirname, 'api-page', '404.html'));
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).sendFile(path.join(__dirname, 'api-page', '500.html'));
});

// ---------- Start Server ----------
app.listen(PORT, () => {
  console.log(chalk.bgHex('#90EE90').hex('#333').bold(` Server is running on port ${PORT} `));
});

module.exports = app;