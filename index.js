import { Meilisearch } from 'meilisearch';
import 'dotenv/config';
import fs from 'fs';
const client = new Meilisearch({
  host: process.env.MEILI_HOST,
  apiKey: process.env.MEILI_API_KEY,
});

async function bersihkanDanUpload() {
  try {
    console.log('Membaca data dari dataset.json...');
    const rawData = fs.readFileSync('./all_sinta_journals.json', 'utf-8');
    const dataAsli = JSON.parse(rawData);

    const hasilKonversi = [];
    let counterId = 1;

    dataAsli.journals.forEach((jurnal) => {
      const namaJurnal = jurnal.basic_info.name;
      const institusi = jurnal.basic_info.institution;
      const akreditasi = jurnal.basic_info.accreditation;

      jurnal.articles.forEach((artikel) => {
        hasilKonversi.push({
          id: `art_${counterId++}`,
          title: artikel.title,
          url: artikel.url,
          tahun: artikel.publication.year || 'Tidak diketahui',
          volume: artikel.publication.volume,
          nama_jurnal: namaJurnal,
          institusi: institusi,
          akreditasi: akreditasi,
        });
      });
    });

    console.log(`\nSukses Membongkar Data!`);
    console.log(
      `Total artikel ilmiah siap di-index: ${hasilKonversi.length} dokumen.`,
    );
    console.log('Mengunggah dokumen bersih ke Meilisearch Cloud...');

    const response = await client
      .index('dokumen_ir')
      .addDocuments(hasilKonversi);

    console.log('Sukses memicu indexing cloud! Detail task:', response);
    console.log('Silakan cek dashboard Meilisearch Cloud Anda dalam 10 detik.');
  } catch (error) {
    console.error('Gagal memproses data:', error);
  }
}

bersihkanDanUpload();
