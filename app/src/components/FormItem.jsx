import { useState } from 'react'

export default function FormItem({ onSimpan }) {
  const [form, setForm] = useState({
    judul: '',
    kategori: 'Pantai',
    kabupaten: '',
    hargaTiket: 0,
    jamBuka: '',
  })
  const [error, setError] = useState('')

  function ubah(event) {
    const { name, value } = event.target
    setForm({ ...form, [name]: value })
  }

  function simpan(event) {
    event.preventDefault()

    if (!form.judul.trim()) {
      setError('Judul belum diisi.')
      return
    }

    const hargaTiket = Number(form.hargaTiket)
    if (!Number.isFinite(hargaTiket) || hargaTiket < 0) {
      setError('Harga tiket harus 0 atau lebih.')
      return
    }

    setError('')
    onSimpan({
      ...form,
      judul: form.judul.trim(),
      kabupaten: form.kabupaten.trim(),
      hargaTiket,
      jamBuka: form.jamBuka.trim(),
    })
  }

  return (
    <form className="form-item" onSubmit={simpan} noValidate>
      <label htmlFor="judul">Judul</label>
      <input id="judul" name="judul" value={form.judul} onChange={ubah} />

      <label htmlFor="kategori">Kategori</label>
      <select id="kategori" name="kategori" value={form.kategori} onChange={ubah}>
        {['Pantai', 'Pulau', 'Wisata Alam', 'Budaya', 'Air Terjun'].map((kategori) => (
          <option key={kategori} value={kategori}>{kategori}</option>
        ))}
      </select>

      <label htmlFor="kabupaten">Kabupaten/Kota</label>
      <input id="kabupaten" name="kabupaten" value={form.kabupaten} onChange={ubah} />

      <label htmlFor="hargaTiket">Harga Tiket</label>
      <input id="hargaTiket" name="hargaTiket" type="number" min="0" value={form.hargaTiket} onChange={ubah} />

      <label htmlFor="jamBuka">Jam Buka</label>
      <input id="jamBuka" name="jamBuka" value={form.jamBuka} onChange={ubah} placeholder="08.00-17.00" />

      {error && <p role="alert">{error}</p>}
      <button type="submit">Simpan</button>
    </form>
  )
}
