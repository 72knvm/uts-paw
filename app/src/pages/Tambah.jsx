import { Link, useNavigate } from 'react-router-dom'
import FormItem from '../components/FormItem.jsx'
import useKoleksi from '../hooks/useKoleksi.js'

export default function Tambah() {
  const { tambah, loading, error } = useKoleksi()
  const navigate = useNavigate()

  function simpan(item) {
    tambah(item)
    navigate('/koleksi')
  }

  return (
    <main>
      <h1>Tambah Destinasi</h1>
      {loading ? (
        <p>Memuat data...</p>
      ) : error ? (
        <p role="alert">Gagal memuat: {error}</p>
      ) : (
        <>
          <p>Judul wajib diisi. Bagian lainnya boleh memakai nilai awal.</p>
          <FormItem onSimpan={simpan} />
        </>
      )}
      <Link to="/koleksi">Kembali ke koleksi</Link>
    </main>
  )
}
