import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, beforeEach, expect, test, vi } from 'vitest'
import App from './App.jsx'
import data from '../public/data/koleksi.json'

beforeEach(() => {
  vi.stubGlobal('fetch', vi.fn(async () => new Response(JSON.stringify(data))))
})

afterEach(() => {
  vi.restoreAllMocks()
  vi.unstubAllGlobals()
})

function buka(path = '/statistik') {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <App />
    </MemoryRouter>,
  )
}

function cekJumlah(kategori, jumlah) {
  const baris = screen.getByRole('row', { name: `${kategori} ${jumlah}` })
  expect(within(baris).getByRole('cell')).toHaveTextContent(String(jumlah))
}

test('membuka statistik dari beranda dan menghitung semua kategori', async () => {
  const user = userEvent.setup()
  buka('/')
  await user.click(screen.getByRole('link', { name: 'Lihat statistik' }))

  const tabel = await screen.findByRole('table', { name: 'Jumlah destinasi per kategori' })
  expect(within(tabel).getByRole('columnheader', { name: 'Kategori' })).toBeInTheDocument()
  expect(within(tabel).getByRole('columnheader', { name: 'Jumlah' })).toBeInTheDocument()
  cekJumlah('Pantai', 4)
  cekJumlah('Pulau', 2)
  cekJumlah('Wisata Alam', 2)
  cekJumlah('Budaya', 1)
  cekJumlah('Air Terjun', 1)
  cekJumlah('Total', 10)
  expect(fetch).toHaveBeenCalledTimes(1)
})

test('statistik memakai koleksi yang tersimpan', async () => {
  localStorage.setItem('uts-paw-koleksi', JSON.stringify([data[1], data[5]]))
  buka()

  await screen.findByRole('table')
  cekJumlah('Pulau', 1)
  cekJumlah('Budaya', 1)
  cekJumlah('Total', 2)
  expect(screen.queryByRole('rowheader', { name: 'Pantai' })).not.toBeInTheDocument()
  expect(fetch).not.toHaveBeenCalled()
})

test('koleksi kosong menampilkan total nol', async () => {
  localStorage.setItem('uts-paw-koleksi', '[]')
  buka()

  expect(await screen.findByText('Belum ada destinasi.')).toBeInTheDocument()
  cekJumlah('Total', 0)
  expect(fetch).not.toHaveBeenCalled()
})

test('menampilkan loading dan error saat statistik gagal dimuat', async () => {
  fetch.mockResolvedValueOnce(new Response('Server error', { status: 500 }))
  buka()
  expect(screen.getByText('Memuat statistik...')).toBeInTheDocument()
  expect(screen.queryByRole('table')).not.toBeInTheDocument()

  expect(await screen.findByRole('alert')).toHaveTextContent('status 500')
  expect(screen.queryByRole('table')).not.toBeInTheDocument()
})

test('jumlah statistik ikut berubah setelah tambah dan hapus wisata', async () => {
  const user = userEvent.setup()
  vi.spyOn(window, 'confirm').mockReturnValue(true)
  buka()
  await screen.findByRole('table')
  cekJumlah('Total', 10)

  await user.click(screen.getByRole('link', { name: 'Kembali ke koleksi' }))
  await user.click(screen.getByRole('link', { name: 'Tambah destinasi' }))
  await user.type(screen.getByLabelText('Judul'), 'Destinasi Coba')
  await user.click(screen.getByRole('button', { name: 'Simpan' }))
  await user.click(screen.getByRole('link', { name: 'Kembali ke beranda' }))
  await user.click(screen.getByRole('link', { name: 'Lihat statistik' }))
  cekJumlah('Pantai', 5)
  cekJumlah('Total', 11)

  await user.click(screen.getByRole('link', { name: 'Kembali ke koleksi' }))
  await user.click(screen.getByRole('link', { name: 'Destinasi Coba' }))
  await user.click(screen.getByRole('button', { name: 'Hapus' }))
  await user.click(screen.getByRole('link', { name: 'Kembali ke beranda' }))
  await user.click(screen.getByRole('link', { name: 'Lihat statistik' }))
  cekJumlah('Pantai', 4)
  cekJumlah('Total', 10)
  expect(fetch).toHaveBeenCalledTimes(1)
})
