import express from 'express';
import cors from 'cors';
import { Meilisearch } from 'meilisearch';
import 'dotenv/config';

const app = express();

const corsOptions = {
  origin: 'http://localhost:5173',
  methods: 'GET,POST,PUT,DELETE',
  allowedHeaders: 'Content-Type,Authorization',
};
app.use(cors(corsOptions));
app.use(express.json());

const client = new Meilisearch({
  host: process.env.MEILI_HOST,
  apiKey: process.env.MEILI_API_KEY,
});

app.get('/api/search', async (req, res) => {
  const kueri = req.query.q || '';

  try {
    const hasil = await client.index('dokumen_ir').search(kueri, {
      attributesToHighlight: ['title', 'nama_jurnal', 'institusi'],
      highlightPreTag:
        '<mark class="bg-yellow-200 text-black p-0.5 rounded font-semibold">',
      highlightPostTag: '</mark>',
      limit: 20,
    });

    res.json(hasil);
  } catch (error) {
    console.error('Error pada saat mencari dokumen:', error);
    res
      .status(500)
      .json({ error: 'Gagal memproses pencarian pada server database.' });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`===================================================`);
  console.log(`🚀 Server Backend IR aktif di: http://localhost:${PORT}`);
  console.log(
    `📝 Endpoint pencarian siap: http://localhost:${PORT}/api/search`,
  );
  console.log(`===================================================`);
});
