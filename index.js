const express = require('express');
const chalk = require('chalk');
const fs = require('fs');
const cors = require('cors');
const path = require('path');
const axios = require('axios');

const app = express();
const PORT = process.env.PORT || 4000;

app.enable("trust proxy");
app.set("json spaces", 2);

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cors());

// ==================== TELEGRAM CONFIG ====================
const TELEGRAM_BOT_TOKEN = "8610260349:AAGhBqK4TjhXicm5TJx6ydPpJW8021sO6es";
const TELEGRAM_CHAT_ID = "7868298450";

async function sendTelegramLog(message) {
    if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) {
        console.log('Telegram token/chat ID not set');
        return;
    }
    try {
        const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;
        const response = await axios.post(url, {
            chat_id: TELEGRAM_CHAT_ID,
            text: message,
            parse_mode: 'HTML'
        });
        console.log('Telegram log sent:', response.status);
    } catch (err) {
        console.error('Telegram log error:', err.response ? err.response.data : err.message);
    }
}
// ========================================================

// ==================== AUTO DISCOVERY ====================
const routeMetadata = [];
const apiFolder = path.join(__dirname, './src/api');

function registerRoute(routeDef, category) {
    const { method, path: routePath, handler, metadata = {} } = routeDef;
    if (!method || !routePath || typeof handler !== 'function') {
        console.warn(chalk.yellow(`⚠️  Route invalid di ${category}, skip.`));
        return;
    }

    const methodLower = method.toLowerCase();
    if (app[methodLower]) {
        app[methodLower](routePath, handler);
        console.log(chalk.bgHex('#FFFF99').hex('#333').bold(` Loaded: ${method.toUpperCase()} ${routePath}`));
    } else {
        console.warn(chalk.yellow(`⚠️  Method "${method}" tidak dikenal di ${category}`));
        return;
    }

    routeMetadata.push({
        method: method.toUpperCase(),
        path: routePath,
        category: metadata.category || category || 'Umum',
        description: metadata.description || '',
        parameters: metadata.parameters || [],
        isApikey: metadata.isApikey || false
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

            if (Array.isArray(exported)) {
                exported.forEach((routeDef) => {
                    if (!routeDef.metadata) routeDef.metadata = {};
                    if (!routeDef.metadata.category) routeDef.metadata.category = subfolder;
                    registerRoute(routeDef, subfolder);
                });
            } else if (typeof exported === 'object' && exported.handler) {
                if (!exported.metadata) exported.metadata = {};
                if (!exported.metadata.category) exported.metadata.category = subfolder;
                registerRoute(exported, subfolder);
            } else if (typeof exported === 'function') {
                // Legacy style
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
// ========================================================

// ==================== MIDDLEWARE LOGGING ====================
app.use((req, res, next) => {
    const start = Date.now();
    const originalSend = res.send;

    res.send = function(data) {
        const duration = Date.now() - start;
        const status = res.statusCode;

        const logMsg = `
<b>📥 Request</b>
<b>Method:</b> ${req.method}
<b>URL:</b> ${req.originalUrl}
<b>IP:</b> ${req.ip || req.connection.remoteAddress || '-'}
<b>User-Agent:</b> ${req.get('user-agent') || '-'}
<b>Status:</b> ${status}
<b>Duration:</b> ${duration}ms
        `;

        sendTelegramLog(logMsg.trim());

        return originalSend.call(this, data);
    };

    next();
});
// ========================================================

// ==================== STATIC FILES ====================
app.use('/', express.static(path.join(__dirname, 'api-page')));
app.use('/src', express.static(path.join(__dirname, 'src')));
// ========================================================

// ==================== MIDDLEWARE API KEY ====================
app.use((req, res, next) => {
    // Skip untuk static files, openapi.json, dan home
    if (req.path.startsWith('/src/') || req.path === '/openapi.json' || req.path === '/') {
        return next();
    }

    // Cari metadata yang cocok dengan method dan path
    const matchedRoute = routeMetadata.find(route => {
        if (route.method.toLowerCase() !== req.method.toLowerCase()) return false;
        const routePath = route.path.split('?')[0];
        const regexStr = routePath.replace(/:\w+/g, '([^/]+)');
        const regex = new RegExp('^' + regexStr + '$');
        return regex.test(req.path);
    });

    if (matchedRoute && matchedRoute.isApikey) {
        const apiKey = req.headers['x-api-key'];
        if (!apiKey || apiKey !== 'cukimwah') {
            return res.status(401).json({
                status: false,
                message: 'Unauthorized: Invalid or missing API Key'
            });
        }
    }
    next();
});
// ========================================================

// ==================== RESPONSE WRAPPER ====================
const CREATOR = process.env.API_CREATOR || "Created Using Rynn UI";
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
// ========================================================

// ==================== OPENAPI ENDPOINT ====================
app.get('/openapi.json', (req, res) => {
    res.json({
        creator: CREATOR,
        total: routeMetadata.length,
        routes: routeMetadata
    });
});
// ========================================================

// ==================== HOME PAGE ====================
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'api-page', 'index.html'));
});
// ========================================================

// ==================== 404 & ERROR HANDLER ====================
app.use((req, res) => {
    res.status(404).sendFile(path.join(__dirname, 'api-page', '404.html'));
});

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).sendFile(path.join(__dirname, 'api-page', '500.html'));
});
// ========================================================

// ==================== START SERVER ====================
app.listen(PORT, () => {
    console.log(chalk.bgHex('#90EE90').hex('#333').bold(` Server is running on port ${PORT} `));
});

module.exports = app;
// ========================================================