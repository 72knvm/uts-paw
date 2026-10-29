import { render, screen } from '@testing-library/react'
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

test('menampilkan loading lalu semua destinasi dari fetch', async () => {
  bukaKoleksi()
  expect(screen.getByText('Memuat data...')).toBeInTheDocument()

  for (const item of data) {
    expect(await screen.findByRole('heading', { name: item.judul })).toBeInTheDocument()
  }

  expect(fetch).toHaveBeenCalledWith(`${import.meta.env.BASE_URL}data/koleksi.json`)
  expect(screen.queryByText('Memuat data...')).not.toBeInTheDocument()
})

test('menampilkan pesan error ketika server gagal mengirim data', async () => {
  fetch.mockResolvedValueOnce(new Response('Server error', { status: 500 }))
  bukaKoleksi()

  expect(await screen.findByRole('alert')).toHaveTextContent('status 500')
  expect(screen.queryByText('Memuat data...')).not.toBeInTheDocument()
})

test('menampilkan pesan error ketika koneksi gagal', async () => {
  fetch.mockRejectedValueOnce(new Error('Koneksi terputus'))
  bukaKoleksi()

  expect(await screen.findByRole('alert')).toHaveTextContent('Koneksi terputus')
  expect(screen.queryByText('Memuat data...')).not.toBeInTheDocument()
})
