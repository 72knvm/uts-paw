import { Link, Route, Routes } from 'react-router-dom'
import mahasiswa from '../mahasiswa.json'
import { KoleksiProvider } from './context/KoleksiProvider.jsx'
import Koleksi from './pages/Koleksi.jsx'

// Rute wajib: /, /koleksi, /koleksi/:id, /tambah, /statistik, /tentang, dan *.

function Beranda() {
  return (
    <main>
      <h1>Ujian Tengah Semester Pengembangan Aplikasi Web</h1>
      <p>
        {mahasiswa.nama || 'Marvin Karyanda'} ({mahasiswa.nim || '123140185'})
      </p>
      <Link to="/koleksi">Lihat destinasi wisata</Link>
    </main>
  )
}

function TidakDitemukan() {
  return (
    <main>
      <h1>404</h1>
      <p>Halaman tidak ditemukan.</p>
    </main>
  )
}

export default function App() {
  return (
    <KoleksiProvider>
      <Routes>
        <Route path="/" element={<Beranda />} />
        <Route path="/koleksi" element={<Koleksi />} />
        <Route path="*" element={<TidakDitemukan />} />
      </Routes>
    </KoleksiProvider>
  )
}
