import { NavLink } from 'react-router-dom'

const menu = [
  { ke: '/', label: 'Beranda' },
  { ke: '/koleksi', label: 'Koleksi' },
  { ke: '/tambah', label: 'Tambah' },
  { ke: '/statistik', label: 'Statistik' },
  { ke: '/tentang', label: 'Tentang' },
]

export default function Layout({ children }) {
  return (
    <div className="kerangka">
      <header className="kepala">
        <div className="isi-kepala">
          <strong>Wisata Lampung</strong>
          <nav className="menu" aria-label="Navigasi utama">
            {menu.map(({ ke, label }) => (
              <NavLink key={ke} to={ke} end={ke === '/'}>
                {label}
              </NavLink>
            ))}
          </nav>
        </div>
      </header>
      {children}
      <footer className="kaki">UTS Pengembangan Aplikasi Web</footer>
    </div>
  )
}
