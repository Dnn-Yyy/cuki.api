const fetch = require('node-fetch');

module.exports = function (app) {
  app.get('/ai/flux', async (req, res) => {
    try {
      const {
        prompt,
        width = 1024,
        height = 1024,
        enhance = 'true'
      } = req.query;

      if (!prompt) {
        return res.status(400).json({
          status: false,
          creator: 'ZenzzXD',
          message: 'Missing required query: prompt'
        });
      }

      const apiUrl = `https://fastrestapis.fasturl.cloud/aiimage/flux/dimension?prompt=${encodeURIComponent(prompt)}&model=flux&width=${width}&height=${height}&enhance=${enhance}`;

      const response = await fetch(apiUrl);

      if (!response.ok) {
        return res.status(response.status).json({
          status: false,
          creator: 'ZenzzXD',
          message: `Upstream API error: ${response.statusText}`
        });
      }

      res.setHeader('Content-Type', response.headers.get('content-type') || 'image/png');
      response.body.pipe(res);
    } catch (err) {
      res.status(500).json({
        status: false,
        creator: 'ZenzzXD',
        message: err.message || 'Internal Server Error'
      });
    }
  });
};
