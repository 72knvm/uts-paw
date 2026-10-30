import { Link, useNavigate, useParams } from 'react-router-dom'
import useKoleksi from '../hooks/useKoleksi.js'

export default function Detail() {
  const { id } = useParams()
  const { items, loading, error, hapus } = useKoleksi()
  const navigate = useNavigate()
  const item = items.find((item) => String(item.id) === id)

  function hapusItem() {
    if (window.confirm(`Hapus ${item.judul}?`)) {
      hapus(item.id)
      navigate('/koleksi')
    }
  }

  if (loading) {
    return <main><p>Memuat detail...</p></main>
  }

  if (error) {
    return (
      <main>
        <p role="alert">Gagal memuat: {error}</p>
        <Link to="/koleksi">Kembali ke koleksi</Link>
      </main>
    )
  }

  return (
    <main>
      {item ? (
        <>
          <h1>{item.judul}</h1>
          <dl>
            <dt>ID</dt>
            <dd>{item.id}</dd>
            <dt>Kategori</dt>
            <dd>{item.kategori}</dd>
            <dt>Kabupaten/Kota</dt>
            <dd>{item.kabupaten}</dd>
            <dt>Harga Tiket</dt>
            <dd>Rp {Number(item.hargaTiket).toLocaleString('id-ID')}</dd>
            <dt>Jam Buka</dt>
            <dd>{item.jamBuka}</dd>
          </dl>
          <p>
            <button type="button" onClick={hapusItem}>Hapus</button>
          </p>
        </>
      ) : (
        <h1>Destinasi tidak ditemukan</h1>
      )}
      <Link to="/koleksi">Kembali ke koleksi</Link>
    </main>
  )
}
