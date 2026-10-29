export default function KartuItem({ item }) {
  return (
    <li className="kartu">
      <h2>{item.judul}</h2>
      <p>{item.kategori} · {item.kabupaten}</p>
    </li>
  )
}
