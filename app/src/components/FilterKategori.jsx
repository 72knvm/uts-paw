export default function FilterKategori({ daftarKategori, nilai, onUbah }) {
  return (
    <div className="filter-kategori">
      <label htmlFor="filter-kategori">Kategori</label>
      <select id="filter-kategori" value={nilai} onChange={(e) => onUbah(e.target.value)}>
        {daftarKategori.map((kategori) => (
          <option key={kategori} value={kategori}>{kategori}</option>
        ))}
      </select>
    </div>
  )
}
