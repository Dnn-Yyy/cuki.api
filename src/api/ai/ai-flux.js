
const axios = require("axios");

const CREATOR_NAME = "Cuki Digital";
const BASE_URL = "https://api.siputzx.my.id/api/ai/flux?prompt=";

async function generateFluxImage(prompt) {
  try {
    const { data } = await axios.get(BASE_URL + encodeURIComponent(prompt));
    const result = data.result || data;

    return {
      status: true,
      creator: CREATOR_NAME,
      result
    };
  } catch (err) {
    return {
      status: false,
      creator: CREATOR_NAME,
      message: "Gagal mengambil data dari API FluxAI",
      error: err.message
    };
  }
}

module.exports = function (app) {
  app.get("/ai/flux", async (req, res) => {
    const { prompt } = req.query;

    if (!prompt) {
      return res.status(400).json({
        status: false,
        creator: CREATOR_NAME,
        message: "Parameter 'prompt' wajib diisi"
      });
    }

    const result = await generateFluxImage(prompt.trim());
    res.json(result);
  });
};
