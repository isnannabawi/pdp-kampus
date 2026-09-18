import Link from "next/link";

const stats = [
  ["1.284", "Prestasi tercatat"],
  ["98,2%", "Tingkat verifikasi"],
  ["24 jam", "Rata-rata waktu review"],
];

const recentAchievements = [
  { title: "Juara 1 Gemastik 2024", name: "Nadia Putri", unit: "Teknik Informatika", tone: "blue" },
  { title: "Publikasi Jurnal Sinta 2", name: "Dr. Ahmad Fauzi", unit: "Fakultas Sains", tone: "purple" },
  { title: "Sertifikasi Kompetensi BNSP", name: "Rizky Ramadhan", unit: "Sistem Informasi", tone: "orange" },
];

function ArrowUpRight() {
  return <span aria-hidden="true" className="arrow-icon">↗</span>;
}

export default function Home() {
  return (
    <main className="site-shell">
      <header className="site-header">
        <Link href="/" className="brand">
          <span className="brand-mark">✦</span>
          <span>Sistem <strong>Prestasi</strong></span>
        </Link>
        <nav className="main-nav" aria-label="Navigasi utama">
          <Link href="#tentang">Tentang</Link>
          <Link href="#cara-kerja">Cara Kerja</Link>
          <Link href="#rekap">Rekap Prestasi</Link>
        </nav>
        <div className="header-actions">
          <Link href="/status" className="text-link">Cek Status</Link>
          <Link href="/login" className="login-link">Masuk</Link>
          <Link href="/ajukan" className="button button-dark button-small">Ajukan Prestasi <ArrowUpRight /></Link>
        </div>
      </header>

      <section className="hero-section">
        <div className="hero-copy">
          <p className="eyebrow"><span className="eyebrow-dot" /> PLATFORM PRESTASI KAMPUS</p>
          <h1>Setiap pencapaian,<br /><em>layak diapresiasi.</em></h1>
          <p className="hero-description">Catat, verifikasi, dan rayakan prestasi civitas akademika dalam satu platform yang transparan dan terpercaya.</p>
          <div className="hero-buttons">
            <Link href="/ajukan" className="button button-primary">Ajukan Prestasi <ArrowUpRight /></Link>
            <Link href="/status" className="button button-outline">Cek Status Pengajuan</Link>
          </div>
          <div className="hero-note"><span>✓</span> Tanpa perlu membuat akun</div>
        </div>
        <div className="hero-art" aria-label="Ilustrasi pencapaian prestasi">
          <div className="art-orbit orbit-one" />
          <div className="art-orbit orbit-two" />
          <div className="art-glow" />
          <div className="trophy-card">
            <div className="trophy-star">✦</div>
            <div className="trophy-cup">♜</div>
            <div className="trophy-base" />
            <strong>PRESTASI</strong>
            <span>UNGGULAN 2024</span>
          </div>
          <span className="float-tag tag-one">🏆</span>
          <span className="float-tag tag-two">✦</span>
          <span className="float-tag tag-three">★</span>
          <span className="float-tag tag-four">↗</span>
        </div>
      </section>

      <section className="stats-strip">
        {stats.map(([value, label]) => <div className="stat-item" key={label}><strong>{value}</strong><span>{label}</span></div>)}
        <div className="stat-caption">Data diperbarui<br /><strong>setiap hari</strong> <span>✺</span></div>
      </section>

      <section className="intro-section" id="tentang">
        <div>
          <p className="eyebrow">SATU LANGKAH LEBIH MAJU</p>
          <h2>Prestasi Anda,<br /><em>cerita kampus kita.</em></h2>
        </div>
        <p className="intro-text">Sistem Prestasi membantu mahasiswa dan dosen mendokumentasikan setiap pencapaian dengan mudah. Dari pengajuan hingga verifikasi, semua proses dirancang sederhana, cepat, dan dapat dipantau.</p>
      </section>

      <section className="feature-grid" id="cara-kerja">
        <article className="feature-card feature-dark"><span className="feature-number">01</span><div className="feature-icon">◌</div><h3>Ajukan dengan mudah</h3><p>Isi data prestasi dan lampirkan bukti melalui tautan Google Drive. Tanpa akun, tanpa ribet.</p><Link href="/ajukan">Mulai mengajukan <ArrowUpRight /></Link></article>
        <article className="feature-card feature-yellow"><span className="feature-number">02</span><div className="feature-icon">✓</div><h3>Verifikasi terpercaya</h3><p>Tim verifikator meninjau setiap pengajuan secara objektif dan transparan.</p><Link href="/status">Pelajari proses <ArrowUpRight /></Link></article>
        <article className="feature-card feature-lilac"><span className="feature-number">03</span><div className="feature-icon">↗</div><h3>Rekap yang bermakna</h3><p>Lihat kontribusi dan pencapaian civitas akademika dalam data yang terukur.</p><Link href="/dashboard">Lihat dashboard <ArrowUpRight /></Link></article>
      </section>

      <section className="recent-section" id="rekap">
        <div className="section-heading"><div><p className="eyebrow">PENCAPAIAN TERKINI</p><h2>Mereka yang <em>berprestasi.</em></h2></div><Link href="/status" className="underlined-link">Lihat semua prestasi <ArrowUpRight /></Link></div>
        <div className="achievement-list">{recentAchievements.map((item, index) => <div className="achievement-row" key={item.title}><span className={`achievement-avatar avatar-${item.tone}`}>{index === 0 ? "NP" : index === 1 ? "AF" : "RR"}</span><div className="achievement-info"><strong>{item.title}</strong><span>{item.name} · {item.unit}</span></div><span className="achievement-year">2024</span><span className="row-arrow">↗</span></div>)}</div>
      </section>

      <section className="cta-section"><div><p className="eyebrow">SIAP MENCATAT PRESTASI?</p><h2>Jadikan pencapaian Anda<br /><em>bagian dari cerita.</em></h2></div><Link href="/ajukan" className="button button-dark">Ajukan Prestasi <ArrowUpRight /></Link></section>
      <footer className="site-footer"><Link href="/" className="brand"><span className="brand-mark">✦</span><span>Sistem <strong>Prestasi</strong></span></Link><span>© 2024 Sistem Prestasi · Universitas Kita</span><div><Link href="/login">Portal Internal</Link><Link href="/status">Bantuan</Link></div></footer>
    </main>
  );
}
