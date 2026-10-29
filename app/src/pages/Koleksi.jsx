import { useState } from 'react'
import { Link } from 'react-router-dom'
import useKoleksi from '../hooks/useKoleksi.js'
import KotakPencarian from '../components/KotakPencarian.jsx'
import FilterKategori from '../components/FilterKategori.jsx'

export default function Koleksi() {
  const { items, loading, error } = useKoleksi()
  const [cari, setCari] = useState('')
  const [kategori, setKategori] = useState('Semua')
  const kataCari = cari.trim().toLowerCase()
  const daftarKategori = ['Semua', ...new Set(items.map((item) => item.kategori))]
  const tampil = items.filter(
    (item) =>
      item.judul.toLowerCase().includes(kataCari) &&
      (kategori === 'Semua' || item.kategori === kategori),
  )

  return (
    <main>
      <h1>Koleksi Destinasi Wisata Lampung</h1>
      {loading ? (
        <p>Memuat data...</p>
      ) : error ? (
        <p role="alert">Gagal memuat: {error}</p>
      ) : (
        <>
          <div className="alat-koleksi">
            <KotakPencarian nilai={cari} onUbah={setCari} />
            <FilterKategori daftarKategori={daftarKategori} nilai={kategori} onUbah={setKategori} />
          </div>
          {tampil.length === 0 ? (
            <p>Tidak ada destinasi yang cocok.</p>
          ) : (
            <ul>
              {tampil.map((item) => (
                <li key={item.id}>
                  <h2>{item.judul}</h2>
                  <p>{item.kategori} · {item.kabupaten}</p>
                </li>
              ))}
            </ul>
          )}
        </>
      )}
      <Link to="/">Kembali ke beranda</Link>
    </main>
  )
}
