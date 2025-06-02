const fetch = require('node-fetch');

module.exports = async (req, res) => {
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

    const apiUrl = `https://fastrestapis.fasturl.cloud/aiimage/flux/dimension?prompt=${encodeURIComponent(prompt)}&model=flux&width=${width}&height=${height}&enhance=${enhance}`;

    const response = await fetch(apiUrl);

    if (!response.ok) {
      return res.status(response.status).json({
        status: false,
        creator: 'Cuki Digital',
        message: `Upstream API error: ${response.statusText}`
      });
    }

    const buffer = await response.buffer();

    res.setHeader('Content-Type', response.headers.get('content-type') || 'image/png');
    res.setHeader('Content-Disposition', 'inline; filename="flux-image.png"');
    res.send(buffer);
  } catch (err) {
    res.status(500).json({
      status: false,
      creator: 'Cuki Digital',
      message: err.message || 'Internal Server Error'
    });
  }
};
