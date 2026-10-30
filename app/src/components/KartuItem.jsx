import { Link } from 'react-router-dom'

export default function KartuItem({ item }) {
  return (
    <li className="kartu">
      <h2>
        <Link to={`/koleksi/${item.id}`}>{item.judul}</Link>
      </h2>
      <p>{item.kategori} · {item.kabupaten}</p>
    </li>
  )
}
