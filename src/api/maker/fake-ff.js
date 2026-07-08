const generateFF = require('fake-ff');
const path = require('path');
const fs = require('fs');

module.exports = {
    method: 'get',
    path: '/maker/fakeff',
    handler: async (req, res) => {
        try {
            const username = req.query?.name || req.query?.username || req.query?.q;
            const lobby = req.query?.template || req.query?.lobby || req.query?.t;

            if (!username) {
                return res.status(400).json({
                    status: false,
                    creator: "Rin imup",
                    message: 'Parameter username diperlukan! Contoh: ?username=Ditzzx&lobby=5'
                });
            }

            let lobbyNumber = parseInt(lobby, 10);
            if (lobby && (isNaN(lobbyNumber) || lobbyNumber < 1 || lobbyNumber > 17)) {
                return res.status(400).json({
                    status: false,
                    creator: "Rin imup",
                    message: 'Parameter lobby harus angka 1-17 atau kosong untuk random.'
                });
            }

            const options = {
                username: username
            };

            if (lobby && !isNaN(lobbyNumber) && lobbyNumber >= 1 && lobbyNumber <= 17) {
                options.lobby = lobbyNumber;
            }

            let result;
            try {
                result = await generateFF(options);
            } catch (genErr) {
                console.error('[GENERATE ERROR]', genErr);
                return res.status(500).json({
                    status: false,
                    creator: "Rin imup",
                    message: 'Gagal generate gambar: ' + genErr.message,
                    error: genErr.stack
                });
            }

            if (!result) {
                return res.status(500).json({
                    status: false,
                    creator: "Rin imup",
                    message: 'Module fake-ff mengembalikan response kosong.'
                });
            }

            if (result.status !== 'success') {
                return res.status(500).json({
                    status: false,
                    creator: "Rin imup",
                    message: 'Module fake-ff gagal: ' + (result.message || 'Unknown error'),
                    result: result
                });
            }

            if (!result.result) {
                return res.status(500).json({
                    status: false,
                    creator: "Rin imup",
                    message: 'Module fake-ff tidak mengembalikan path gambar.'
                });
            }

            const imagePath = path.resolve(result.result);
            
            if (!fs.existsSync(imagePath)) {
                return res.status(500).json({
                    status: false,
                    creator: "Rin imup",
                    message: 'File gambar tidak ditemukan di path: ' + imagePath
                });
            }

            const imageBuffer = fs.readFileSync(imagePath);
            
            res.setHeader('Content-Type', 'image/png');
            res.setHeader('X-Username', result.username || username);
            res.setHeader('X-Lobby', String(result.lobby || lobbyNumber || 'random'));
            res.setHeader('Cache-Control', 'public, max-age=3600');
            
            return res.send(imageBuffer);

        } catch (err) {
            console.error('[ERROR]', err);
            res.status(500).json({
                status: false,
                creator: "Rin imup",
                message: err.message || 'Terjadi kesalahan internal.',
                stack: err.stack
            });
        }
    },
    metadata: {
        category: 'Maker',
        description: 'Membuat gambar lobby custom Free Fire menggunakan module fake-ff.',
        parameters: [
            {
                name: 'username',
                in: 'query',
                required: true,
                description: 'Username atau nickname yang ingin ditampilkan'
            },
            {
                name: 'lobby',
                in: 'query',
                required: false,
                description: 'Nomor lobby 1-17 (kosong = random)'
            }
        ],
    }
};