
const axios = require("axios");

const CREATOR_NAME = "Cuki Digital";
const BASE_URL = "https://api.siputzx.my.id/api/ai/blackboxai-pro?content=";

async function forwardBlackboxAI(text) {
  try {
    const { data } = await axios.get(BASE_URL + encodeURIComponent(text));
    const result = data.result || data.data || data;

    return {
      status: true,
      creator: CREATOR_NAME,
      result
    };
  } catch (err) {
    return {
      status: false,
      creator: CREATOR_NAME,
      message: "Gagal mengambil respon dari BlackboxAI",
      error: err.message
    };
  }
}

module.exports = function (app) {
  app.get("/ai/blackboxai", async (req, res) => {
    const { text } = req.query;

    if (!text) {
      return res.status(400).json({
        status: false,
        creator: CREATOR_NAME,
        message: "Parameter 'text' wajib diisi"
      });
    }

    const result = await forwardBlackboxAI(text.trim());
    res.json(result);
  });
};
