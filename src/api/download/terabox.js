/*
# Fitur : Terabox Downloader
# Type : Plugins REST API
# Created by : https://whatsapp.com/channel/0029Vb2qri6JkK72MIrI8F1Z
# Api : https://teraboxdl.site

   ⚠️ _Note_ ⚠️
jangan hapus wm ini banggg
*/

const axios = require('axios');

module.exports = function (app) {
    async function teraboxdl(url) {
        const token = (await axios.get('https://teraboxdl.site/api/token')).data.token;
        const res = await axios.get('https://teraboxdl.site/api/terabox?url=' + url, {
            headers: {
                'x-access-token': token
            }
        });
        return res.data;
    }

    app.get('/dl/terabox', async (req, res) => {
        try {
            const { url } = req.query;
            if (!url) return res.status(400).json({ status: false, message: 'Missing url parameter' });

            const result = await teraboxdl(url);
            res.json({ status: true, result });
        } catch (err) {
            res.status(500).json({
                status: false,
                message: '❌ Error\nLogs error : ' + err.message
            });
        }
    });
};
