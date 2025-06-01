const axios = require('axios');

module.exports = function(app) {

    async function teraboxdl(url) {
        try {
            const { data: tokenData } = await axios.get('https://teraboxdl.site/api/token');
            const token = tokenData.token;

            const { data } = await axios.get('https://teraboxdl.site/api/terabox', {
                params: { url },
                headers: {
                    'x-access-token': token
                }
            });

            return data;

        } catch (err) {
            throw new Error('Gagal mengambil data dari terabox: ' + err.message);
        }
    }

    app.get('/dl/terabox', async (req, res) => {
        try {
            const { url } = req.query;
            if (!url) {
                return res.status(400).json({
                    status: false,
                    error: '❌ Error\nLogs error : Parameter url tidak ditemukan'
                });
            }

            const result = await teraboxdl(url);

            res.status(200).json({
                status: true,
                result
            });

        } catch (error) {
            res.status(500).json({
                status: false,
                error: '❌ Error\nLogs error : ' + error.message
            });
        }
    });

            }
