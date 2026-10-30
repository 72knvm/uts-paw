import { Link, Route, Routes } from 'react-router-dom'
import mahasiswa from '../mahasiswa.json'
import { KoleksiProvider } from './context/KoleksiProvider.jsx'
import useKoleksi from './hooks/useKoleksi.js'
import Layout from './components/Layout.jsx'
import Koleksi from './pages/Koleksi.jsx'
import Detail from './pages/Detail.jsx'
import Tambah from './pages/Tambah.jsx'
import Statistik from './pages/Statistik.jsx'
import Tentang from './pages/Tentang.jsx'

// Rute wajib: /, /koleksi, /koleksi/:id, /tambah, /statistik, /tentang, dan *.

function Beranda() {
  const { items, loading, error } = useKoleksi()
  const jumlahKategori = new Set(items.map((item) => item.kategori)).size

  return (
    <main className="beranda">
      <section className="pengantar">
        <h1>{mahasiswa.tema}</h1>
        <p>Koleksi destinasi wisata di Lampung.</p>
        <p className="identitas">
          {mahasiswa.nama || 'Marvin Karyanda'} ({mahasiswa.nim || '123140185'})
        </p>
        <Link className="tombol" to="/koleksi">Lihat destinasi wisata</Link>
      </section>
      <section className="ringkasan-beranda" aria-label="Ringkasan koleksi">
        <h2>Ringkasan koleksi</h2>
        {loading ? (
          <p>Memuat ringkasan...</p>
        ) : error ? (
          <p role="alert">Gagal memuat: {error}</p>
        ) : (
          <p className="jumlah-koleksi">Ada {items.length} destinasi dalam {jumlahKategori} kategori.</p>
        )}
        <Link to="/statistik">Lihat statistik</Link>
      </section>
    </main>
  )
}

function TidakDitemukan() {
  return (
    <main>
      <h1>404</h1>
      <p>Halaman tidak ditemukan.</p>
      <Link to="/">Kembali ke beranda</Link>
    </main>
  )
}

export default function App() {
  return (
    <KoleksiProvider>
      <Layout>
        <Routes>
          <Route path="/" element={<Beranda />} />
          <Route path="/koleksi" element={<Koleksi />} />
          <Route path="/koleksi/:id" element={<Detail />} />
          <Route path="/tambah" element={<Tambah />} />
          <Route path="/statistik" element={<Statistik />} />
          <Route path="/tentang" element={<Tentang />} />
          <Route path="*" element={<TidakDitemukan />} />
        </Routes>
      </Layout>
    </KoleksiProvider>
  )
}
