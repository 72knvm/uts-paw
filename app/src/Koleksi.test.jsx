import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, beforeEach, expect, test, vi } from 'vitest'
import App from './App.jsx'
import data from '../public/data/koleksi.json'

beforeEach(() => {
  vi.stubGlobal('fetch', vi.fn(async () => new Response(JSON.stringify(data))))
})

afterEach(() => {
  vi.unstubAllGlobals()
})

function bukaKoleksi() {
  return render(
    <MemoryRouter initialEntries={['/koleksi']}>
      <App />
    </MemoryRouter>,
  )
}

test('menampilkan loading lalu semua destinasi dari fetch dan menyimpannya', async () => {
  const tampilan = bukaKoleksi()
  expect(screen.getByText('Memuat data...')).toBeInTheDocument()

  for (const item of data) {
    expect(await screen.findByRole('heading', { name: item.judul })).toBeInTheDocument()
  }

  expect(fetch).toHaveBeenCalledWith(`${import.meta.env.BASE_URL}data/koleksi.json`)
  expect(screen.queryByText('Memuat data...')).not.toBeInTheDocument()
  await waitFor(() => {
    expect(JSON.parse(localStorage.getItem('uts-paw-koleksi'))).toEqual(data)
  })

  tampilan.unmount()
  fetch.mockClear()
  bukaKoleksi()

  expect(screen.getAllByRole('listitem')).toHaveLength(data.length)
  expect(fetch).not.toHaveBeenCalled()
})

test('menampilkan pesan error ketika server gagal mengirim data', async () => {
  fetch.mockResolvedValueOnce(new Response('Server error', { status: 500 }))
  bukaKoleksi()

  expect(await screen.findByRole('alert')).toHaveTextContent('status 500')
  expect(screen.queryByText('Memuat data...')).not.toBeInTheDocument()
  expect(localStorage.getItem('uts-paw-koleksi')).toBeNull()
})

test('menampilkan pesan error ketika koneksi gagal', async () => {
  fetch.mockRejectedValueOnce(new Error('Koneksi terputus'))
  bukaKoleksi()

  expect(await screen.findByRole('alert')).toHaveTextContent('Koneksi terputus')
  expect(screen.queryByText('Memuat data...')).not.toBeInTheDocument()
  expect(localStorage.getItem('uts-paw-koleksi')).toBeNull()
})

test('menggunakan koleksi tersimpan tanpa menimpanya dengan data awal', () => {
  const tersimpan = [{ ...data[0], judul: 'Destinasi tersimpan' }]
  localStorage.setItem('uts-paw-koleksi', JSON.stringify(tersimpan))
  bukaKoleksi()

  expect(screen.getByRole('heading', { name: 'Destinasi tersimpan' })).toBeInTheDocument()
  expect(screen.queryByRole('heading', { name: data[0].judul })).not.toBeInTheDocument()
  expect(screen.queryByText('Memuat data...')).not.toBeInTheDocument()
  expect(fetch).not.toHaveBeenCalled()
})

test('mempertahankan koleksi kosong tanpa mengambil data awal lagi', () => {
  localStorage.setItem('uts-paw-koleksi', JSON.stringify([]))
  bukaKoleksi()

  expect(screen.queryAllByRole('listitem')).toHaveLength(0)
  expect(screen.queryByText('Memuat data...')).not.toBeInTheDocument()
  expect(localStorage.getItem('uts-paw-koleksi')).toBe('[]')
  expect(fetch).not.toHaveBeenCalled()
})

test('memuat data awal ketika JSON tersimpan rusak', async () => {
  localStorage.setItem('uts-paw-koleksi', 'bukan JSON')
  bukaKoleksi()

  expect(await screen.findByRole('heading', { name: data[0].judul })).toBeInTheDocument()
  await waitFor(() => {
    expect(JSON.parse(localStorage.getItem('uts-paw-koleksi'))).toEqual(data)
  })
})

test('memuat data awal ketika koleksi tersimpan bukan array', async () => {
  localStorage.setItem('uts-paw-koleksi', JSON.stringify({ judul: 'Data lama' }))
  bukaKoleksi()

  expect(await screen.findByRole('heading', { name: data[0].judul })).toBeInTheDocument()
  await waitFor(() => {
    expect(JSON.parse(localStorage.getItem('uts-paw-koleksi'))).toEqual(data)
  })
})

test('menampilkan error jika respons server bukan daftar destinasi', async () => {
  fetch.mockResolvedValueOnce(new Response(JSON.stringify({ pesan: 'Data tidak tersedia' })))
  bukaKoleksi()

  expect(await screen.findByRole('alert')).toHaveTextContent('Data koleksi harus berupa daftar destinasi.')
  expect(localStorage.getItem('uts-paw-koleksi')).toBeNull()
  expect(fetch).toHaveBeenCalledTimes(1)
})

test('mencari berdasarkan judul tanpa membedakan huruf besar dan spasi tepi', async () => {
  const user = userEvent.setup()
  bukaKoleksi()
  await screen.findByRole('heading', { name: data[0].judul })

  await user.type(screen.getByRole('searchbox', { name: 'Cari judul' }), ' kLaRa ')

  expect(screen.getByRole('heading', { name: 'Pantai Klara' })).toBeInTheDocument()
  expect(screen.queryByRole('heading', { name: data[0].judul })).not.toBeInTheDocument()
  expect(screen.getAllByRole('listitem')).toHaveLength(1)
  expect(JSON.parse(localStorage.getItem('uts-paw-koleksi'))).toEqual(data)
  expect(fetch).toHaveBeenCalledTimes(1)
})

test('menampilkan pesan ketika tidak ada judul yang cocok', async () => {
  const user = userEvent.setup()
  bukaKoleksi()
  await screen.findByRole('heading', { name: data[0].judul })

  await user.type(screen.getByRole('searchbox', { name: 'Cari judul' }), 'destinasi tidak terdaftar')

  expect(screen.getByText('Tidak ada destinasi yang cocok.')).toBeInTheDocument()
  expect(screen.queryAllByRole('listitem')).toHaveLength(0)
})

test('menampilkan semua destinasi lagi setelah pencarian dikosongkan', async () => {
  const user = userEvent.setup()
  bukaKoleksi()
  await screen.findByRole('heading', { name: data[0].judul })
  const input = screen.getByRole('searchbox', { name: 'Cari judul' })

  await user.type(input, 'Klara')
  expect(screen.getAllByRole('listitem')).toHaveLength(1)

  await user.clear(input)

  expect(screen.getAllByRole('listitem')).toHaveLength(data.length)
  expect(screen.queryByText('Tidak ada destinasi yang cocok.')).not.toBeInTheDocument()
})
