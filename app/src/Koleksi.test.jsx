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

test('memuat dan menyimpan data wisata', async () => {
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

test('menampilkan error saat server gagal', async () => {
  fetch.mockResolvedValueOnce(new Response('Server error', { status: 500 }))
  bukaKoleksi()

  expect(await screen.findByRole('alert')).toHaveTextContent('status 500')
  expect(screen.queryByText('Memuat data...')).not.toBeInTheDocument()
  expect(localStorage.getItem('uts-paw-koleksi')).toBeNull()
})

test('menampilkan error saat koneksi putus', async () => {
  fetch.mockRejectedValueOnce(new Error('Koneksi terputus'))
  bukaKoleksi()

  expect(await screen.findByRole('alert')).toHaveTextContent('Koneksi terputus')
  expect(screen.queryByText('Memuat data...')).not.toBeInTheDocument()
  expect(localStorage.getItem('uts-paw-koleksi')).toBeNull()
})

test('memakai data wisata yang sudah tersimpan', () => {
  const tersimpan = [{ ...data[0], judul: 'Destinasi tersimpan' }]
  localStorage.setItem('uts-paw-koleksi', JSON.stringify(tersimpan))
  bukaKoleksi()

  expect(screen.getByRole('heading', { name: 'Destinasi tersimpan' })).toBeInTheDocument()
  expect(screen.queryByRole('heading', { name: data[0].judul })).not.toBeInTheDocument()
  expect(screen.queryByText('Memuat data...')).not.toBeInTheDocument()
  expect(fetch).not.toHaveBeenCalled()
})

test('koleksi kosong tidak diisi ulang', () => {
  localStorage.setItem('uts-paw-koleksi', JSON.stringify([]))
  bukaKoleksi()

  expect(screen.queryAllByRole('listitem')).toHaveLength(0)
  expect(screen.queryByText('Memuat data...')).not.toBeInTheDocument()
  expect(localStorage.getItem('uts-paw-koleksi')).toBe('[]')
  expect(fetch).not.toHaveBeenCalled()
})

test('memuat ulang data jika JSON tersimpan rusak', async () => {
  localStorage.setItem('uts-paw-koleksi', 'bukan JSON')
  bukaKoleksi()

  expect(await screen.findByRole('heading', { name: data[0].judul })).toBeInTheDocument()
  await waitFor(() => {
    expect(JSON.parse(localStorage.getItem('uts-paw-koleksi'))).toEqual(data)
  })
})

test('memuat ulang data jika simpanan bukan array', async () => {
  localStorage.setItem('uts-paw-koleksi', JSON.stringify({ judul: 'Data lama' }))
  bukaKoleksi()

  expect(await screen.findByRole('heading', { name: data[0].judul })).toBeInTheDocument()
  await waitFor(() => {
    expect(JSON.parse(localStorage.getItem('uts-paw-koleksi'))).toEqual(data)
  })
})

test('menampilkan error jika format data salah', async () => {
  fetch.mockResolvedValueOnce(new Response(JSON.stringify({ pesan: 'Data tidak tersedia' })))
  bukaKoleksi()

  expect(await screen.findByRole('alert')).toHaveTextContent('Format data wisata tidak sesuai.')
  expect(localStorage.getItem('uts-paw-koleksi')).toBeNull()
  expect(fetch).toHaveBeenCalledTimes(1)
})

test('pencarian mengabaikan huruf besar dan spasi tepi', async () => {
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

test('menampilkan pesan jika pencarian tidak cocok', async () => {
  const user = userEvent.setup()
  bukaKoleksi()
  await screen.findByRole('heading', { name: data[0].judul })

  await user.type(screen.getByRole('searchbox', { name: 'Cari judul' }), 'destinasi tidak terdaftar')

  expect(screen.getByText('Tidak ada destinasi yang cocok.')).toBeInTheDocument()
  expect(screen.queryAllByRole('listitem')).toHaveLength(0)
})

test('menampilkan semua wisata saat pencarian dihapus', async () => {
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
