const axios = require("axios");

const CREATOR_NAME = "Cuki Digital";
const BASE_URL = "https://api.siputzx.my.id/api/ai/gemini-pro?content=";

async function askGeminiPro(content) {
  try {
    const { data } = await axios.get(BASE_URL + encodeURIComponent(content));
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
      message: "Gagal mengambil respons dari Gemini-Pro",
      error: err.message
    };
  }
}

module.exports = function (app) {
  app.get("/ai/gemini-pro", async (req, res) => {
    const { content } = req.query;

    if (!content) {
      return res.status(400).json({
        status: false,
        creator: CREATOR_NAME,
        message: "Parameter 'content' wajib diisi"
      });
    }

    const result = await askGeminiPro(content.trim());
    res.json(result);
  });
};
