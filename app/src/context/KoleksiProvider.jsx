import { useEffect, useState } from 'react'
import { KoleksiContext } from './koleksiContext.js'

export function KoleksiProvider({ children }) {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let aktif = true

    async function muat() {
      try {
        const res = await fetch(`${import.meta.env.BASE_URL}data/koleksi.json`)
        if (!res.ok) throw new Error(`Gagal memuat data (status ${res.status})`)

        const data = await res.json()
        if (aktif) setItems(data)
      } catch (err) {
        if (aktif) setError(err.message)
      } finally {
        if (aktif) setLoading(false)
      }
    }

    muat()

    return () => {
      aktif = false
    }
  }, [])

  return (
    <KoleksiContext.Provider value={{ items, loading, error }}>
      {children}
    </KoleksiContext.Provider>
  )
}
