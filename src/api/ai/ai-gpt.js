const axios = require("axios");

module.exports = function(app) {
    async function fetchFromOnlineGPT(content) {
        try {
            const { data } = await axios(`https://onlinegpt.org/wp-json/mwai-ui/v1/chats/submit`, {
                method: "post",
                data: {
                    botId: "default",
                    newMessage: content,
                    stream: false
                },
                headers: {
                    Accept: "text/event-stream",
                    "Content-Type": "application/json"
                }
            });
            return data;
        } catch (err) {
            console.error("Error fetching from OnlineGPT:", err.response?.data || err.message);
            throw new Error(err.response?.data?.message || "Failed to fetch from OnlineGPT");
        }
    }

    app.get("/ai/onlinegpt", async (req, res) => {
        try {
            const { text } = req.query;
            if (!text) {
                return res.status(400).json({ status: false, error: "Text is required" });
            }

            const result = await fetchFromOnlineGPT(text);
            res.status(200).json({
                status: true,
                result
            });
        } catch (error) {
            res.status(500).json({ status: false, error: error.message });
        }
    });
};
