/*

# Fitur : MuslimAI Chat
# Type : Plugins ESM
# Created by : https://whatsapp.com/channel/0029Vb2qri6JkK72MIrI8F1Z
# Api : https://api.siputzx.my.id/api/ai/muslimai?query=

   ⚠️ _Note_ ⚠️
jangan hapus wm ini banggg

*/

const axios = require("axios");

const CREATOR_NAME = "Cuki Digital";
const BASE_URL = "https://api.siputzx.my.id/api/ai/muslimai?query=";

async function askMuslimAI(query) {
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
      message: "Gagal mengambil respons dari MuslimAI",
      error: err.message
    };
  }
}

module.exports = function (app) {
  app.get("/ai/muslimai", async (req, res) => {
    const { query } = req.query;

    if (!query) {
      return res.status(400).json({
        status: false,
        creator: CREATOR_NAME,
        message: "Parameter 'query' wajib diisi"
      });
    }

    const result = await askMuslimAI(query.trim());
    res.json(result);
  });
};
