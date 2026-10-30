import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, beforeEach, expect, test, vi } from 'vitest'
import App from './App.jsx'
import mahasiswa from '../mahasiswa.json'
import data from '../public/data/koleksi.json'

beforeEach(() => {
  vi.stubGlobal('fetch', vi.fn(async () => new Response(JSON.stringify(data))))
})

afterEach(() => {
  vi.restoreAllMocks()
  vi.unstubAllGlobals()
})

function buka(path = '/') {
  render(
    <MemoryRouter initialEntries={[path]}>
      <App />
    </MemoryRouter>,
  )
}

test('beranda menampilkan tema dan ringkasan koleksi', async () => {
  buka()
  expect(screen.getByText('Memuat ringkasan...')).toBeInTheDocument()
  expect(screen.getAllByRole('heading', { level: 1 })).toHaveLength(1)
  expect(screen.getByRole('heading', { level: 1, name: mahasiswa.tema })).toBeInTheDocument()
  expect(screen.getByText(`${mahasiswa.nama} (${mahasiswa.nim})`)).toBeInTheDocument()

  expect(await screen.findByText('Ada 10 destinasi dalam 5 kategori.')).toBeInTheDocument()
})

test('ringkasan ikut berubah saat wisata ditambah dan dihapus', async () => {
  const user = userEvent.setup()
  vi.spyOn(window, 'confirm').mockReturnValue(true)
  localStorage.setItem('uts-paw-koleksi', JSON.stringify([data[0]]))
  buka()
  expect(screen.getByText('Ada 1 destinasi dalam 1 kategori.')).toBeInTheDocument()

  await user.click(screen.getByRole('link', { name: 'Tambah', exact: true }))
  await user.type(screen.getByLabelText('Judul'), 'Wisata Coba')
  await user.selectOptions(screen.getByLabelText('Kategori'), 'Budaya')
  await user.click(screen.getByRole('button', { name: 'Simpan' }))
  await user.click(screen.getByRole('link', { name: 'Beranda', exact: true }))
  expect(screen.getByText('Ada 2 destinasi dalam 2 kategori.')).toBeInTheDocument()

  await user.click(screen.getByRole('link', { name: 'Koleksi', exact: true }))
  await user.click(screen.getByRole('link', { name: 'Wisata Coba' }))
  await user.click(screen.getByRole('button', { name: 'Hapus' }))
  await user.click(screen.getByRole('link', { name: 'Beranda', exact: true }))
  expect(screen.getByText('Ada 1 destinasi dalam 1 kategori.')).toBeInTheDocument()
  expect(fetch).not.toHaveBeenCalled()
})

test('koleksi kosong menampilkan ringkasan nol', () => {
  localStorage.setItem('uts-paw-koleksi', '[]')
  buka()

  expect(screen.getByText('Ada 0 destinasi dalam 0 kategori.')).toBeInTheDocument()
  expect(fetch).not.toHaveBeenCalled()
})

test('beranda menampilkan error saat data gagal dimuat', async () => {
  fetch.mockResolvedValueOnce(new Response('Server error', { status: 500 }))
  buka()

  expect(await screen.findByRole('alert')).toHaveTextContent('status 500')
  expect(screen.queryByText(/Ada \d+ destinasi/)).not.toBeInTheDocument()
})

test('halaman 404 bisa kembali ke beranda', async () => {
  const user = userEvent.setup()
  buka('/tidak-ada')
  expect(screen.getByRole('heading', { name: '404' })).toBeInTheDocument()

  await user.click(screen.getByRole('link', { name: 'Kembali ke beranda' }))
  expect(screen.getByRole('heading', { level: 1, name: mahasiswa.tema })).toBeInTheDocument()
  expect(await screen.findByText('Ada 10 destinasi dalam 5 kategori.')).toBeInTheDocument()
  expect(screen.queryByRole('heading', { name: '404' })).not.toBeInTheDocument()
  expect(fetch).toHaveBeenCalledTimes(1)
})
