const axios = require("axios");

const CREATOR_NAME = "Cuki Digital";
const BASE_URL = "https://api.siputzx.my.id/api/d/facebook?url=";

async function forwardFacebookDownload(url) {
  try {
    const { data } = await axios.get(BASE_URL + encodeURIComponent(url));
    let resultData = data.result || data;

    if (typeof resultData === "object" && resultData !== null && Array.isArray(resultData.data)) {
      resultData = resultData.data;
    }

    if (typeof resultData === "object" && resultData !== null && "status" in resultData) {
      delete resultData.status;
    }

    return {
      status: true,
      creator: CREATOR_NAME,
      result: resultData,
    };
  } catch (err) {
    return {
      status: false,
      creator: CREATOR_NAME,
      message: "Gagal mengambil data dari API Facebook",
      error: err.message,
    };
  }
}

module.exports = function (app) {
  app.get("/download/facebook", async (req, res) => {
    const { url } = req.query;

    if (!url) {
      return res.status(400).json({
        status: false,
        creator: CREATOR_NAME,
        message: "Parameter 'url' wajib diisi",
      });
    }

    const result = await forwardFacebookDownload(url.trim());
    res.json(result);
  });
};
