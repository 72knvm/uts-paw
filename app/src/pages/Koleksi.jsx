import { useState } from 'react'
import { Link } from 'react-router-dom'
import useKoleksi from '../hooks/useKoleksi.js'
import KotakPencarian from '../components/KotakPencarian.jsx'

export default function Koleksi() {
  const { items, loading, error } = useKoleksi()
  const [cari, setCari] = useState('')
  const kataCari = cari.trim().toLowerCase()
  const tampil = items.filter((item) => item.judul.toLowerCase().includes(kataCari))

  return (
    <main>
      <h1>Koleksi Destinasi Wisata Lampung</h1>
      {loading ? (
        <p>Memuat data...</p>
      ) : error ? (
        <p role="alert">Gagal memuat: {error}</p>
      ) : (
        <>
          <KotakPencarian nilai={cari} onUbah={setCari} />
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
