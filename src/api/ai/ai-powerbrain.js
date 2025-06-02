/*

# Fitur : PowerBrainAI Chat
# Type : Plugins ESM
# Created by : https://whatsapp.com/channel/0029Vb2qri6JkK72MIrI8F1Z
# Api : https://api.siputzx.my.id/api/ai/powerbrainai?query=

   ⚠️ _Note_ ⚠️
jangan hapus wm ini banggg

*/

const axios = require("axios");

const CREATOR_NAME = "Cuki Digital";
const BASE_URL = "https://api.siputzx.my.id/api/ai/powerbrainai?query=";

async function askPowerBrainAI(text) {
  try {
    const { data } = await axios.get(BASE_URL + encodeURIComponent(text));
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
      message: "❌ Error\nLogs error : " + err.message
    };
  }
}

module.exports = function (app) {
  app.get("/ai/powerbrainai", async (req, res) => {
    const queryText = req.query.query;

    if (!queryText) {
      return res.status(400).json({
        status: false,
        creator: CREATOR_NAME,
        message: "❌ Error\nLogs error : Parameter 'query' wajib diisi"
      });
    }

    const result = await askPowerBrainAI(queryText.trim());
    res.json(result);
  });
};
