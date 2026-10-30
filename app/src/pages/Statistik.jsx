import { Link } from 'react-router-dom'
import useKoleksi from '../hooks/useKoleksi.js'

export default function Statistik() {
  const { items, loading, error } = useKoleksi()
  const perKategori = items.reduce((hasil, item) => {
    hasil[item.kategori] = (hasil[item.kategori] ?? 0) + 1
    return hasil
  }, {})

  return (
    <main>
      <h1>Statistik Destinasi Wisata</h1>
      {loading ? (
        <p>Memuat statistik...</p>
      ) : error ? (
        <p role="alert">Gagal memuat: {error}</p>
      ) : (
        <>
          {items.length === 0 && <p>Belum ada destinasi.</p>}
          <table>
            <caption>Jumlah destinasi per kategori</caption>
            <thead>
              <tr>
                <th scope="col">Kategori</th>
                <th scope="col">Jumlah</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(perKategori).map(([kategori, jumlah]) => (
                <tr key={kategori}>
                  <th scope="row">{kategori}</th>
                  <td>{jumlah}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr>
                <th scope="row">Total</th>
                <td>{items.length}</td>
              </tr>
            </tfoot>
          </table>
        </>
      )}
      <p><Link to="/koleksi">Kembali ke koleksi</Link></p>
    </main>
  )
}
