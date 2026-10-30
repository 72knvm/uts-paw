import mahasiswa from '../../mahasiswa.json'

export default function Tentang() {
  return (
    <main>
      <h1>Tentang Aplikasi</h1>
      <p>Aplikasi untuk mencatat destinasi wisata di Lampung.</p>
      <dl>
        <dt>Nama</dt>
        <dd>{mahasiswa.nama}</dd>
        <dt>NIM</dt>
        <dd>{mahasiswa.nim}</dd>
        <dt>Kelas</dt>
        <dd>{mahasiswa.kelas}</dd>
        <dt>Tema</dt>
        <dd>{mahasiswa.tema}</dd>
      </dl>
      <a href="https://github.com/72knvm/uts-paw" target="_blank" rel="noopener noreferrer">
        Repo GitHub
      </a>
    </main>
  )
}
