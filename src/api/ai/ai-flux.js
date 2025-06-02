const fetch = require('node-fetch');
const AbortController = require('abort-controller');

module.exports = function (app) {
  app.get('/ai/flux', async (req, res) => {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 60000); // 60 detik

    try {
      const {
        prompt,
        width = 1024,
        height = 1024,
        enhance = 'true'
      } = req.query;

      if (!prompt || prompt.trim().length < 3) {
        return res.status(400).json({
          status: false,
          creator: 'Cuki Digital',
          message: 'Prompt terlalu pendek atau kosong'
        });
      }

      const apiUrl = `https://fastrestapis.fasturl.cloud/aiimage/flux/dimension?prompt=${encodeURIComponent(prompt)}&width=${width}&height=${height}&enhance=${enhance}`;
      const response = await fetch(apiUrl, {
        signal: controller.signal
      });

      clearTimeout(timeout); // Bersihkan timeout setelah berhasil

      if (!response.ok) {
        return res.status(response.status).json({
          status: false,
          creator: 'Cuki Digital',
          message: `Upstream API error: ${response.statusText}`
        });
      }

      res.setHeader('Content-Type', response.headers.get('content-type') || 'image/png');
      response.body.pipe(res);
    } catch (err) {
      if (err.name === 'AbortError') {
        return res.status(504).json({
          status: false,
          creator: 'Cuki Digital',
          message: '⏰ Timeout! Gambar terlalu lama digenerate. Coba prompt yang lebih ringan.'
        });
      }
      res.status(500).json({
        status: false,
        creator: 'Cuki Digital',
        message: err.message || 'Internal Server Error'
      });
    }
  });
};
