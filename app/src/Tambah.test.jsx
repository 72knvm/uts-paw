import { render, screen } from '@testing-library/react'
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

function buka(path = '/tambah') {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <App />
    </MemoryRouter>,
  )
}

test('membuka form dari koleksi dengan label yang lengkap', async () => {
  const user = userEvent.setup()
  buka('/koleksi')
  await user.click(await screen.findByRole('link', { name: 'Tambah destinasi' }))

  for (const label of ['Judul', 'Kategori', 'Kabupaten/Kota', 'Harga Tiket', 'Jam Buka']) {
    expect(screen.getByLabelText(label)).toBeInTheDocument()
  }
  expect(screen.getByRole('button', { name: 'Simpan' })).toBeInTheDocument()
})

test('judul kosong atau spasi belum bisa disimpan', async () => {
  const user = userEvent.setup()
  buka()
  const judul = await screen.findByLabelText('Judul')

  await user.click(screen.getByRole('button', { name: 'Simpan' }))
  expect(screen.getByRole('alert')).toHaveTextContent('Judul belum diisi.')

  await user.type(judul, '   ')
  await user.click(screen.getByRole('button', { name: 'Simpan' }))
  expect(screen.getByRole('alert')).toHaveTextContent('Judul belum diisi.')
  expect(JSON.parse(localStorage.getItem('uts-paw-koleksi'))).toHaveLength(data.length)
})

test('menyimpan wisata lalu datanya tetap ada saat dibuka lagi', async () => {
  const user = userEvent.setup()
  const halaman = buka()
  await user.type(await screen.findByLabelText('Judul'), '  Kebun Raya Liwa  ')
  await user.selectOptions(screen.getByLabelText('Kategori'), 'Wisata Alam')
  await user.type(screen.getByLabelText('Kabupaten/Kota'), 'Lampung Barat')
  await user.clear(screen.getByLabelText('Harga Tiket'))
  await user.type(screen.getByLabelText('Harga Tiket'), '10000')
  await user.type(screen.getByLabelText('Jam Buka'), '08.00-16.00')
  await user.click(screen.getByRole('button', { name: 'Simpan' }))

  expect(screen.getByRole('heading', { level: 1, name: 'Koleksi Destinasi Wisata Lampung' })).toBeInTheDocument()
  expect(screen.getAllByRole('listitem')).toHaveLength(data.length + 1)
  const tersimpan = JSON.parse(localStorage.getItem('uts-paw-koleksi'))
  const baru = tersimpan.find((item) => item.judul === 'Kebun Raya Liwa')
  expect(baru).toEqual({
    id: expect.any(String),
    judul: 'Kebun Raya Liwa',
    kategori: 'Wisata Alam',
    kabupaten: 'Lampung Barat',
    hargaTiket: 10000,
    jamBuka: '08.00-16.00',
  })
  expect(new Set(tersimpan.map((item) => item.id)).size).toBe(tersimpan.length)

  halaman.unmount()
  buka(`/koleksi/${baru.id}`)
  expect(await screen.findByRole('heading', { level: 1, name: baru.judul })).toBeInTheDocument()
  expect(screen.getByText('Rp 10.000')).toBeInTheDocument()
  expect(fetch).toHaveBeenCalledTimes(1)
})

test('cukup mengisi judul untuk menambah wisata', async () => {
  const user = userEvent.setup()
  buka()
  await user.type(await screen.findByLabelText('Judul'), 'Wisata Baru')
  await user.click(screen.getByRole('button', { name: 'Simpan' }))

  expect(screen.getByRole('link', { name: 'Wisata Baru' })).toBeInTheDocument()
  expect(JSON.parse(localStorage.getItem('uts-paw-koleksi'))).toHaveLength(data.length + 1)
})

test('harga tiket negatif belum bisa disimpan', async () => {
  const user = userEvent.setup()
  buka()
  await user.type(await screen.findByLabelText('Judul'), 'Wisata Baru')
  await user.clear(screen.getByLabelText('Harga Tiket'))
  await user.type(screen.getByLabelText('Harga Tiket'), '-1000')
  await user.click(screen.getByRole('button', { name: 'Simpan' }))

  expect(screen.getByRole('alert')).toHaveTextContent('Harga tiket harus 0 atau lebih.')
  expect(JSON.parse(localStorage.getItem('uts-paw-koleksi'))).toHaveLength(data.length)
})

test('form menunggu data awal dan menampilkan error kalau gagal', async () => {
  fetch.mockResolvedValueOnce(new Response('Server error', { status: 500 }))
  buka()
  expect(screen.getByText('Memuat data...')).toBeInTheDocument()
  expect(screen.queryByRole('button', { name: 'Simpan' })).not.toBeInTheDocument()

  expect(await screen.findByRole('alert')).toHaveTextContent('status 500')
  expect(screen.queryByRole('button', { name: 'Simpan' })).not.toBeInTheDocument()
  expect(localStorage.getItem('uts-paw-koleksi')).toBeNull()
})
