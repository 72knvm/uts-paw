import { useEffect, useState } from 'react'
import { KoleksiContext } from './koleksiContext.js'
import useLocalStorage from '../hooks/useLocalStorage.js'

export function KoleksiProvider({ children }) {
  const [items, setItems] = useLocalStorage('uts-paw-koleksi', null)
  const [loading, setLoading] = useState(!Array.isArray(items))
  const [error, setError] = useState(null)

  useEffect(() => {
    if (Array.isArray(items)) return
    let aktif = true

    async function muat() {
      try {
        const res = await fetch(`${import.meta.env.BASE_URL}data/koleksi.json`)
        if (!res.ok) throw new Error(`Gagal memuat data (status ${res.status})`)

        const data = await res.json()
        if (!Array.isArray(data)) throw new Error('Format data wisata tidak sesuai.')
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
  }, [items, setItems])

  function tambah(item) {
    const itemBaru = { ...item, id: crypto.randomUUID() }
    setItems((lama) => [...(lama ?? []), itemBaru])
  }

  function hapus(id) {
    setItems((lama) => (lama ?? []).filter((item) => String(item.id) !== String(id)))
  }

  return (
    <KoleksiContext.Provider value={{ items: Array.isArray(items) ? items : [], loading, error, tambah, hapus }}>
      {children}
    </KoleksiContext.Provider>
  )
}
