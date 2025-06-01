/*
# Fitur : Mediafire Downloader Forwarder
# Type : Plugins ESM
# Created by : https://whatsapp.com/channel/0029Vb2qri6JkK72MIrI8F1Z
# Api : https://api.siputzx.my.id/api/d/mediafire

   ⚠️ _Note_ ⚠️
jangan hapus wm ini banggg
*/

const axios = require("axios");

const CREATOR_NAME = "Cuki Digital";
const BASE_URL = "https://api.siputzx.my.id/api/d/mediafire?url=";

async function forwardMediafireDownload(url) {
  try {
    const { data } = await axios.get(BASE_URL + encodeURIComponent(url));
    const result = data.data || data;

    return {
      status: true,
      creator: CREATOR_NAME,
      result
    };
  } catch (err) {
    return {
      status: false,
      creator: CREATOR_NAME,
      message: "Gagal mengambil data dari API Mediafire",
      error: err.message
    };
  }
}

module.exports = function (app) {
  app.get("/download/mediafire", async (req, res) => {
    const { url } = req.query;

    if (!url) {
      return res.status(400).json({
        status: false,
        creator: CREATOR_NAME,
        message: "Parameter 'url' wajib diisi"
      });
    }

    const result = await forwardMediafireDownload(url.trim());
    res.json(result);
  });
};
