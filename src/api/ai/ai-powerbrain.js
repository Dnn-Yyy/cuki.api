const axios = require("axios");

const CREATOR_NAME = "Cuki Digital";
const BASE_URL = "https://api.siputzx.my.id/api/ai/powerbrainai?query=";

async function askPowerBrainAI(query) {
  try {
    const { data } = await axios.get(BASE_URL + encodeURIComponent(query));
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
      message: "Gagal mengambil respons dari PowerBrainAI",
      error: err.message
    };
  }
}

module.exports = function (app) {
  app.get("/ai/powerbrainai", async (req, res) => {
    const { query } = req.query;

    if (!query) {
      return res.status(400).json({
        status: false,
        creator: CREATOR_NAME,
        message: "Parameter 'query' wajib diisi"
      });
    }

    const result = await askPowerBrainAI(query.trim());
    res.json(result);
  });
};
