import { Link } from 'react-router-dom'
import useKoleksi from '../hooks/useKoleksi.js'

export default function Koleksi() {
  const { items, loading, error } = useKoleksi()

  return (
    <main>
      <h1>Koleksi Destinasi Wisata Lampung</h1>
      {loading ? (
        <p>Memuat data...</p>
      ) : error ? (
        <p role="alert">Gagal memuat: {error}</p>
      ) : (
        <ul>
          {items.map((item) => (
            <li key={item.id}>
              <h2>{item.judul}</h2>
              <p>{item.kategori} · {item.kabupaten}</p>
            </li>
          ))}
        </ul>
      )}
      <Link to="/">Kembali ke beranda</Link>
    </main>
  )
}
