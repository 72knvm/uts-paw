import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, beforeEach, expect, test, vi } from 'vitest'
import App from './App.jsx'
import data from '../public/data/koleksi.json'
import mahasiswa from '../mahasiswa.json'

beforeEach(() => {
  localStorage.setItem('uts-paw-koleksi', JSON.stringify(data))
  vi.stubGlobal('fetch', vi.fn())
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

test('menu berpindah halaman dan menandai halaman aktif', async () => {
  const user = userEvent.setup()
  buka('/')
  const navigasi = within(screen.getByRole('navigation', { name: 'Navigasi utama' }))
  expect(navigasi.getByRole('link', { name: 'Beranda' })).toHaveAttribute('aria-current', 'page')

  await user.click(navigasi.getByRole('link', { name: 'Koleksi' }))
  expect(screen.getByRole('heading', { level: 1, name: 'Koleksi Destinasi Wisata Lampung' })).toBeInTheDocument()
  expect(navigasi.getByRole('link', { name: 'Koleksi' })).toHaveAttribute('aria-current', 'page')
  expect(navigasi.getByRole('link', { name: 'Beranda' })).not.toHaveAttribute('aria-current')

  await user.click(navigasi.getByRole('link', { name: 'Tambah' }))
  expect(screen.getByRole('heading', { level: 1, name: 'Tambah Destinasi' })).toBeInTheDocument()
  expect(navigasi.getByRole('link', { name: 'Tambah' })).toHaveAttribute('aria-current', 'page')

  await user.click(navigasi.getByRole('link', { name: 'Statistik' }))
  expect(screen.getByRole('table')).toBeInTheDocument()
  expect(navigasi.getByRole('link', { name: 'Statistik' })).toHaveAttribute('aria-current', 'page')

  await user.click(navigasi.getByRole('link', { name: 'Tentang' }))
  expect(screen.getByRole('heading', { level: 1, name: 'Tentang Aplikasi' })).toBeInTheDocument()
  expect(navigasi.getByRole('link', { name: 'Tentang' })).toHaveAttribute('aria-current', 'page')

  await user.click(navigasi.getByRole('link', { name: 'Beranda' }))
  expect(screen.getByRole('link', { name: 'Lihat destinasi wisata' })).toBeInTheDocument()
  expect(navigasi.getByRole('link', { name: 'Beranda' })).toHaveAttribute('aria-current', 'page')
  expect(fetch).not.toHaveBeenCalled()
})

test.each([
  { path: '/koleksi/1', judul: 'Pantai Mutun' },
  { path: '/koleksi/id-tidak-ada', judul: 'Destinasi tidak ditemukan' },
  { path: '/alamat-acak', judul: '404' },
])('header, menu, dan footer tetap ada di $path', ({ path, judul }) => {
  buka(path)

  expect(screen.getByRole('heading', { level: 1, name: judul })).toBeInTheDocument()
  expect(screen.getByRole('banner')).toBeInTheDocument()
  expect(screen.getByRole('contentinfo')).toHaveTextContent('UTS Pengembangan Aplikasi Web')
  expect(screen.getAllByRole('main')).toHaveLength(1)
  const navigasi = within(screen.getByRole('navigation', { name: 'Navigasi utama' }))
  expect(navigasi.getAllByRole('link')).toHaveLength(5)

  if (path.startsWith('/koleksi/')) {
    expect(navigasi.getByRole('link', { name: 'Koleksi' })).toHaveAttribute('aria-current', 'page')
  } else {
    for (const tautan of navigasi.getAllByRole('link')) {
      expect(tautan).not.toHaveAttribute('aria-current')
    }
  }
})

test('halaman tentang menampilkan identitas dan tautan repo', () => {
  buka('/tentang')
  const halaman = within(screen.getByRole('main'))

  expect(halaman.getByRole('heading', { level: 1, name: 'Tentang Aplikasi' })).toBeInTheDocument()
  for (const nilai of [mahasiswa.nama, mahasiswa.nim, mahasiswa.kelas, mahasiswa.tema]) {
    expect(halaman.getByText(nilai, { exact: true })).toBeInTheDocument()
  }
  expect(halaman.getByRole('link', { name: 'Repo GitHub' })).toHaveAttribute('href', 'https://github.com/72knvm/uts-paw')
  const navigasi = within(screen.getByRole('navigation', { name: 'Navigasi utama' }))
  expect(navigasi.getByRole('link', { name: 'Tentang' })).toHaveAttribute('aria-current', 'page')
})
