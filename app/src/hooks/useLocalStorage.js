import { useEffect, useState } from 'react'

export default function useLocalStorage(kunci, nilaiAwal) {
  const [nilai, setNilai] = useState(() => {
    try {
      const tersimpan = localStorage.getItem(kunci)
      return tersimpan === null ? nilaiAwal : JSON.parse(tersimpan)
    } catch {
      return nilaiAwal
    }
  })

  useEffect(() => {
    if (nilai !== null) {
      localStorage.setItem(kunci, JSON.stringify(nilai))
    }
  }, [kunci, nilai])

  return [nilai, setNilai]
}
