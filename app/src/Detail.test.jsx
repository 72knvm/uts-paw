import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, beforeEach, expect, test, vi } from 'vitest'
import App from './App.jsx'

const data = [
  {
    id: '1',
    judul: 'Pantai Mutun',
    kategori: 'Pantai',
    kabupaten: 'Pesawaran',
    hargaTiket: 25000,
    jamBuka: '08.00-17.00',
  },
  {
    id: '2',
    judul: 'Pulau Pahawang',
    kategori: 'Pulau',
    kabupaten: 'Pesawaran',
    hargaTiket: 50000,
    jamBuka: '07.00-17.00',
  },
]

beforeEach(() => {
  vi.stubGlobal('fetch', vi.fn(async () => new Response(JSON.stringify(data))))
})

afterEach(() => {
  vi.unstubAllGlobals()
})

function buka(path) {
  render(
    <MemoryRouter initialEntries={[path]}>
      <App />
    </MemoryRouter>,
  )
}

test('membuka detail lewat judul kartu', async () => {
  const user = userEvent.setup()
  buka('/koleksi')

  await user.click(await screen.findByRole('link', { name: data[1].judul }))

  expect(await screen.findByRole('heading', { level: 1, name: data[1].judul })).toBeInTheDocument()
  expect(fetch).toHaveBeenCalledTimes(1)
})

test('detail menampilkan data wisata lengkap', async () => {
  const item = data[0]
  buka(`/koleksi/${item.id}`)
  expect(screen.getByText('Memuat detail...')).toBeInTheDocument()

  expect(await screen.findByRole('heading', { level: 1, name: item.judul })).toBeInTheDocument()
  for (const label of ['ID', 'Kategori', 'Kabupaten/Kota', 'Harga Tiket', 'Jam Buka']) {
    expect(screen.getByText(label)).toBeInTheDocument()
  }
  expect(screen.getByText(item.id)).toBeInTheDocument()
  expect(screen.getByText(item.kategori)).toBeInTheDocument()
  expect(screen.getByText(item.kabupaten)).toBeInTheDocument()
  expect(screen.getByText('Rp 25.000')).toBeInTheDocument()
  expect(screen.getByText(item.jamBuka)).toBeInTheDocument()
})

test('id yang tidak ada menampilkan pesan', async () => {
  buka('/koleksi/id-tidak-ada')

  expect(await screen.findByRole('heading', { name: 'Destinasi tidak ditemukan' })).toBeInTheDocument()
  expect(screen.queryByText(/404/)).not.toBeInTheDocument()
  expect(screen.getByRole('link', { name: 'Kembali ke koleksi' })).toHaveAttribute('href', '/koleksi')
})

test('menampilkan error saat detail gagal dimuat', async () => {
  fetch.mockResolvedValueOnce(new Response('Server error', { status: 500 }))
  buka('/koleksi/1')

  expect(await screen.findByRole('alert')).toHaveTextContent('status 500')
  expect(screen.queryByText('Destinasi tidak ditemukan')).not.toBeInTheDocument()
})

test('kembali dari detail ke koleksi', async () => {
  const user = userEvent.setup()
  buka(`/koleksi/${data[0].id}`)
  await screen.findByRole('heading', { level: 1, name: data[0].judul })

  await user.click(screen.getByRole('link', { name: 'Kembali ke koleksi' }))

  expect(screen.getByRole('searchbox', { name: 'Cari judul' })).toBeInTheDocument()
  expect(screen.getAllByRole('listitem')).toHaveLength(data.length)
  expect(fetch).toHaveBeenCalledTimes(1)
})
