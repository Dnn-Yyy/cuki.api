// src/api/download/tiktok.js
const fetch = require('node-fetch'); // jika pakai Node <18, install node-fetch

// Regex untuk mendeteksi URL TikTok
const ttRegex = /(https:\/\/(vt|vm)\.tiktok\.com\/[^\s]+|https:\/\/www\.tiktok\.com\/@[\w.-]+\/video\/\d+)/;

// Fungsi utama untuk mengambil data dari tikwm.com
async function getTikTokData(input) {
    let ttUrl = input.match(ttRegex)?.[0];
    let ttData;

    if (ttUrl) {
        // Jika input berupa URL
        const res = await fetch(`https://www.tikwm.com/api/?url=${ttUrl}&hd=1`);
        const json = await res.json();
        if (!json?.data) throw new Error('Gagal mengambil data TikTok dari URL');
        ttData = json.data;
    } else {
        // Jika input dianggap sebagai kata kunci pencarian
        const searchRes = await fetch(
            `https://www.tikwm.com/api/feed/search?keywords=${encodeURIComponent(input)}&count=1&cursor=0&web=1&hd=1`
        );
        const searchJson = await searchRes.json();
        const video = searchJson?.data?.videos?.[0];
        if (!video) throw new Error(`Hasil tidak ditemukan untuk "${input}"`);

        // Ambil detail video dari hasil pencarian
        const detailUrl = `https://www.tikwm.com/api/?url=https://www.tiktok.com/@${video.author.unique_id}/video/${video.video_id}&hd=1`;
        const detailRes = await fetch(detailUrl);
        const detailJson = await detailRes.json();
        if (!detailJson?.data) throw new Error('Gagal mengambil data hasil pencarian');
        ttData = detailJson.data;
    }

    return ttData;
}

// Ekspor sebagai route
module.exports = {
    method: 'get',
    path: '/download/tiktok',
    handler: async (req, res) => {
        try {
            // Ambil parameter: url atau q (query)
            const { url, q } = req.query;
            const input = url || q;

            if (!input) {
                return res.status(400).json({
                    status: false,
                    message: 'Parameter diperlukan: ?url=... atau ?q=... (untuk pencarian)'
                });
            }

            const ttData = await getTikTokData(input);

            // Siapkan respons
            const isPhoto = ttData.images && ttData.images.length > 0;
            const responseData = {
                status: true,
                data: {
                    type: isPhoto ? 'photo' : 'video',
                    title: ttData.title || '-',
                    author: {
                        nickname: ttData.author?.nickname || '-',
                        unique_id: ttData.author?.unique_id || '-'
                    },
                    views: ttData.play_count || 0,
                    duration: ttData.duration || 0,
                    // Media URLs
                    media: isPhoto ? ttData.images : [ttData.play],
                    music: ttData.music_info?.play || null,
                    // Tambahan jika diperlukan
                    cover: ttData.cover || null,
                    description: ttData.title || ''
                }
            };

            res.json(responseData);
        } catch (err) {
            res.status(500).json({
                status: false,
                message: err.message || 'Terjadi kesalahan saat memproses permintaan'
            });
        }
    },
    metadata: {
        category: 'Download',
        description: 'Ambil video/foto dari TikTok (via URL atau pencarian)',
        parameters: [
            {
                name: 'url',
                in: 'query',
                required: false,
                description: 'URL lengkap TikTok (vt.tiktok.com/... atau www.tiktok.com/@.../video/...)'
            },
            {
                name: 'q',
                in: 'query',
                required: false,
                description: 'Kata kunci untuk mencari video TikTok (jika tidak pakai url)'
            }
        ],
        // Contoh respons (bisa diisi)
        // exampleResponse: { status: true, data: { ... } }
    }
};