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
  vi.unstubAllGlobals()
})

function bukaKoleksi() {
  render(
    <MemoryRouter initialEntries={['/koleksi']}>
      <App />
    </MemoryRouter>,
  )
}

test('pilihan kategori mengikuti data dan tidak berulang', () => {
  const tersimpan = [
    { ...data[0], kategori: 'Wisata Kota' },
    { ...data[1], kategori: 'Wisata Kota' },
  ]
  localStorage.setItem('uts-paw-koleksi', JSON.stringify(tersimpan))
  bukaKoleksi()
  const filter = screen.getByRole('combobox', { name: 'Kategori' })

  expect(within(filter).getAllByRole('option')).toHaveLength(2)
  expect(within(filter).getByRole('option', { name: 'Semua' })).toBeInTheDocument()
  expect(within(filter).getByRole('option', { name: 'Wisata Kota' })).toBeInTheDocument()
  expect(within(filter).queryByRole('option', { name: 'Pantai' })).not.toBeInTheDocument()
})

test('memilih kategori lalu kembali ke semua wisata', async () => {
  const user = userEvent.setup()
  bukaKoleksi()
  await screen.findByRole('heading', { name: data[0].judul })
  const filter = screen.getByRole('combobox', { name: 'Kategori' })

  await user.selectOptions(filter, 'Pantai')

  for (const judul of ['Pantai Mutun', 'Pantai Sari Ringgung', 'Pantai Gigi Hiu', 'Pantai Klara']) {
    expect(screen.getByRole('heading', { name: judul })).toBeInTheDocument()
  }
  expect(screen.getAllByRole('listitem')).toHaveLength(4)

  await user.selectOptions(filter, 'Semua')

  expect(screen.getAllByRole('listitem')).toHaveLength(data.length)
  expect(JSON.parse(localStorage.getItem('uts-paw-koleksi'))).toEqual(data)
  expect(fetch).toHaveBeenCalledTimes(1)
})

test('pencarian tetap mengikuti kategori yang dipilih', async () => {
  const user = userEvent.setup()
  bukaKoleksi()
  await screen.findByRole('heading', { name: data[0].judul })
  const filter = screen.getByRole('combobox', { name: 'Kategori' })
  const input = screen.getByRole('searchbox', { name: 'Cari judul' })

  await user.selectOptions(filter, 'Pantai')
  await user.type(input, 'Klara')

  expect(screen.getByRole('heading', { name: 'Pantai Klara' })).toBeInTheDocument()
  expect(screen.getAllByRole('listitem')).toHaveLength(1)

  await user.selectOptions(filter, 'Pulau')

  expect(input).toHaveValue('Klara')
  expect(screen.getByText('Tidak ada destinasi yang cocok.')).toBeInTheDocument()
  expect(screen.queryAllByRole('listitem')).toHaveLength(0)

  await user.selectOptions(filter, 'Semua')

  expect(screen.getByRole('heading', { name: 'Pantai Klara' })).toBeInTheDocument()
  expect(screen.getAllByRole('listitem')).toHaveLength(1)
})

test('menghapus pencarian tetap memakai kategori aktif', async () => {
  const user = userEvent.setup()
  bukaKoleksi()
  await screen.findByRole('heading', { name: data[0].judul })
  const filter = screen.getByRole('combobox', { name: 'Kategori' })
  const input = screen.getByRole('searchbox', { name: 'Cari judul' })

  await user.selectOptions(filter, 'Pulau')
  await user.type(input, 'Pahawang')
  expect(screen.getAllByRole('listitem')).toHaveLength(1)

  await user.clear(input)

  expect(filter).toHaveValue('Pulau')
  expect(screen.getByRole('heading', { name: 'Pulau Pahawang' })).toBeInTheDocument()
  expect(screen.getByRole('heading', { name: 'Pulau Tegal Mas' })).toBeInTheDocument()
  expect(screen.getAllByRole('listitem')).toHaveLength(2)
})
