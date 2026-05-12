# PRD: System Architect Thinking — Guided Decision Platform

## 1. Product overview

### 1.1 Document title and version

- PRD: System Architect Thinking — Guided Decision Platform
- Version: 1.0.0 (MVP)

### 1.2 Product summary

System Architect Thinking (SAT) adalah platform SaaS kolaboratif yang mendigitalkan kerangka kerja pengambilan keputusan berbasis pendekatan pemrograman. Platform ini memandu tim kecil (2–5 orang) melewati lima fase terstruktur — dari pendefinisian tujuan hingga validasi output — sehingga setiap keputusan yang dihasilkan dapat dipertanggungjawabkan secara logis, bukan hanya berdasarkan intuisi.

Berbeda dengan tools manajemen konvensional, SAT meminjam paradigma *system architecture*: variabel didefinisikan secara eksplisit, asumsi dipisahkan dari fakta, bias kognitif dideteksi secara aktif, dan rekomendasi dihasilkan dari kalkulasi Expected Value yang tertelusur. Hasilnya bukan sekadar keputusan, melainkan keputusan yang bisa dipelajari, direplikasi, dan diperbaiki.

MVP berfokus pada satu kemampuan inti: **guided flow 5 fase** yang memandu pengguna step-by-step dari Fase 01 (System Requirements Analysis) hingga Fase 05 (Output Validation & System Monitoring). Setiap fase memiliki input terstruktur, validasi logika bawaan, dan output yang tersimpan sebagai audit trail keputusan.

## 2. Goals

### 2.1 Business goals

- Meluncurkan MVP dalam 3 bulan pertama dengan setidaknya 10 organisasi pilot (instansi pemerintah atau korporasi).
- Membangun diferensiasi produk yang jelas: satu-satunya decision tool yang mengintegrasikan logic debugging dan bias detection ke dalam alur kerja tim.
- Meletakkan fondasi arsitektur yang dapat diperluas ke fitur kolaborasi real-time dan integrasi data eksternal di versi berikutnya.

### 2.2 User goals

- Memiliki satu tempat terpusat untuk mendokumentasikan, mendiskusikan, dan memvalidasi proses pengambilan keputusan bersama tim.
- Mendapatkan rekomendasi keputusan berbasis angka (Expected Value) yang dapat dijelaskan kepada atasan atau stakeholder.
- Mendeteksi bias kognitif (Survivor Bias, Overfitting, Sunk-Cost Fallacy, dll.) sebelum keputusan dieksekusi.
- Menghasilkan dokumen keputusan yang dapat diaudit dan dijadikan referensi di masa mendatang.

### 2.3 Non-goals (MVP)

- Integrasi langsung dengan sistem ERP atau aplikasi pemerintah (SAKTI, OM-SPAN) — dijadwalkan untuk versi berikutnya.
- Real-time collaborative editing (seperti Google Docs) — MVP menggunakan model turn-based input per fase.
- Mobile app native — MVP berjalan di browser (responsive web).
- AI generative untuk mengisi input secara otomatis — MVP hanya memvalidasi input pengguna, belum menghasilkan konten.
- Fitur manajemen proyek atau task tracker post-keputusan.

## 3. User personas

### 3.1 Key user types

Platform ini dirancang untuk dua tipe pengguna utama dalam satu sesi keputusan: **Decision Lead** yang memimpin sesi dan **Decision Member** yang berkontribusi sebagai anggota tim analisis.

### 3.2 Basic persona details

- **Decision Lead (Arif, Kepala Seksi, 42 tahun):** Manajer tingkat menengah di instansi pemerintah atau korporasi yang bertanggung jawab atas kualitas keputusan. Ia sering menghadapi tekanan untuk memutuskan cepat tanpa cukup data, dan membutuhkan alat yang membantunya mendokumentasikan reasoning secara terstruktur agar bisa dipertanggungjawabkan kepada atasan.

- **Decision Member (Rina, Analis, 29 tahun):** Anggota tim yang memiliki keahlian teknis atau data spesifik. Ia sering frustrasi karena analisisnya tidak terdengar dalam rapat, atau justru dipakai tanpa atribusi. Ia membutuhkan platform yang memformalkan kontribusinya ke dalam proses keputusan.

- **Org Admin (Budi, IT/Admin, 35 tahun):** Pengelola akun organisasi yang mengatur akses anggota, melihat riwayat sesi, dan memastikan platform berjalan sesuai kebijakan internal.

### 3.3 Role-based access

- **Org Admin:** Mengelola anggota organisasi, membuat/menghapus workspace, dan melihat seluruh riwayat sesi keputusan dalam organisasi.
- **Decision Lead:** Membuat sesi keputusan baru, mengundang anggota, memimpin pengisian setiap fase, dan meng-generate output akhir.
- **Decision Member:** Bergabung ke sesi yang diundang, mengisi input pada fase yang ditugaskan, memberikan komentar, dan melihat hasil kalkulasi.
- **Viewer:** Melihat output sesi keputusan yang sudah selesai tanpa dapat mengedit — cocok untuk atasan atau stakeholder yang perlu di-brief.

## 4. Functional requirements

- **Autentikasi & manajemen workspace** (Priority: High)
  - Registrasi dan login via email/password atau SSO organisasi.
  - Setiap organisasi memiliki workspace terisolasi dengan manajemen anggota oleh Org Admin.
  - Undangan anggota ke sesi keputusan via email dengan role assignment (Lead / Member / Viewer).

- **Pembuatan sesi keputusan** (Priority: High)
  - Decision Lead dapat membuat sesi baru dengan judul, deskripsi singkat, dan tanggal target keputusan.
  - Setiap sesi memiliki status: Draft, In Progress, Completed, Archived.
  - Sesi yang sudah Completed terkunci dari pengeditan dan hanya bisa dibaca.

- **Guided flow Fase 01 — System Requirements Analysis** (Priority: High)
  - Form terstruktur untuk mendefinisikan Root Objective dengan tag Hygienic Function atau Motivational Function.
  - Input Environmental Variable Mapping (EVM): Internal Parameters, External Constraints, dan Constants.
  - Validasi awal: sistem memperingatkan jika Root Objective tidak dapat dikategorikan (emergent vs deliberate).

- **Guided flow Fase 02 — Variable & Constraint Definition** (Priority: High)
  - Input Data Tagging dengan pemisahan eksplisit antara Hardcoded Data (fakta empiris) dan Variable Parameters (preferensi/asumsi).
  - Input Threshold per variabel: Static Threshold (boolean) atau Dynamic Threshold (skala).
  - Kalkulator Priority Queue dengan input Time Criticality Index dan System Impact Index, menghasilkan kategorisasi Eisenhower (Interrupt Routine / Cron Job / Daemon Process / Garbage Collection) secara otomatis.

- **Guided flow Fase 03 — Logic Debugging & Sanitization** (Priority: High)
  - Checklist bias kognitif yang dipetakan ke setiap variabel: Data Sampling Error (Survivor Bias), Overfitting, Exception Suppression, Spurious Link, dan lainnya.
  - Setiap variabel yang lolos sanitasi diberi status "Validated"; yang berpotensi bias diberi status "Warning" dengan penjelasan dan prosedur sanitasi yang disarankan.
  - Sistem menolak lanjut ke Fase 04 jika terdapat variabel berstatus Warning yang belum direspon oleh Lead.

- **Guided flow Fase 04 — Computation & Execution** (Priority: High)
  - Input Matrix Scorecard: kriteria (dari EVM), tipe (Benefit/Cost), bobot (0–1), dan justifikasi logika.
  - Otomatis populate nilai Benefit dan Cost per opsi dari variabel yang sudah di-tag di Fase 02.
  - Input probabilitas (P_success dan P_risk) per variabel per opsi.
  - Kalkulasi Expected Value (EV) otomatis menggunakan formula: EV = (Benefit × P_success) − (Cost × P_risk).
  - Visualisasi perbandingan EV antar opsi dalam bentuk tabel dan bar chart.

- **Guided flow Fase 05 — Output Validation & System Monitoring** (Priority: High)
  - Checklist pasca-keputusan: Zombie Process check (apakah EV ke depan masih positif?), Cobra Effect monitoring plan, dan Stakeholder Impact Matrix (Win-Win / Win-Lose / Lose-Win / Lose-Lose).
  - Input rencana monitoring: metrik yang akan dipantau, interval waktu, dan trigger untuk rollback.
  - Generate dokumen output keputusan dalam format PDF yang dapat diunduh.

- **Audit trail & riwayat sesi** (Priority: Medium)
  - Seluruh input, perubahan, dan komentar per fase tersimpan dengan timestamp dan nama pengguna.
  - Riwayat sesi dapat difilter berdasarkan tanggal, status, dan Decision Lead.
  - Perbandingan antar sesi keputusan sejenis untuk pembelajaran organisasi.

- **Notifikasi** (Priority: Medium)
  - Notifikasi email ketika anggota diundang ke sesi, atau ketika fase baru dibuka oleh Lead.
  - Reminder otomatis jika sesi tidak ada aktivitas lebih dari 3 hari.

## 5. User experience

### 5.1 Entry points & first-time user flow

Pengguna baru mendaftar dan diarahkan ke onboarding singkat (3 langkah) yang menjelaskan konsep 5 fase dengan analogi pemrograman sederhana. Setelah onboarding, pengguna langsung diarahkan ke halaman pembuatan sesi pertama dengan template contoh yang sudah terisi (menggunakan studi kasus "Migrasi Supervisi KPPN" dari dokumen asli) agar pengguna dapat langsung merasakan alur sebelum mengisi kasus nyata mereka sendiri.

### 5.2 Core experience

- **Dashboard sesi:** Pengguna melihat semua sesi keputusan dalam workspace — aktif, selesai, dan diarsipkan — dengan indikator progres fase yang jelas (1/5, 3/5, dsb.).
- **Phase navigator:** Di dalam setiap sesi, sidebar menampilkan 5 fase dengan status (Locked / Active / Completed). Fase berikutnya hanya terbuka setelah fase sebelumnya divalidasi — memastikan alur berpikir tidak dilewati.
- **Inline guidance:** Setiap field input dilengkapi tooltip dan contoh kasus nyata yang dapat diperluas. Pengguna tidak perlu membaca dokumentasi terpisah.
- **Warning system:** Ketika sistem mendeteksi potensi bias di Fase 03, muncul banner kuning dengan penjelasan bug dan prosedur sanitasi — bukan sekadar tanda seru.
- **EV Dashboard (Fase 04):** Visualisasi perbandingan opsi ditampilkan secara real-time saat pengguna mengisi nilai, sehingga pengguna dapat melihat bagaimana setiap input memengaruhi rekomendasi akhir.

### 5.3 Advanced features & edge cases

- Jika seorang Decision Member mengisi nilai variabel yang bertentangan secara logika dengan Hardcoded Data di Fase 02, sistem memberikan peringatan konsistensi data.
- Jika semua opsi menghasilkan EV negatif di Fase 04, sistem tidak memilih opsi terbaik secara otomatis, melainkan menampilkan pesan bahwa semua opsi berisiko tinggi dan menyarankan pengguna untuk mendefinisikan ulang Root Objective di Fase 01.
- Sesi yang melebihi tanggal target keputusan otomatis berubah status menjadi "Overdue" dan mengirimkan notifikasi ke Lead.

### 5.4 UI/UX highlights

- Terminologi pemrograman (Root Objective, Hardcoded Data, Garbage Collection) selalu ditampilkan berdampingan dengan padanan psikologis/manajerial-nya dalam tanda kurung — menjaga aksesibilitas bagi pengguna yang belum familiar dengan paradigma teknis.
- Desain bersih dan fungsional, mengutamakan keterbacaan tabel dan form daripada estetika dekoratif — sesuai konteks penggunaan profesional/pemerintahan.
- Output PDF menggunakan layout dokumen formal yang siap dipresentasikan kepada atasan tanpa perlu penyuntingan ulang.

## 6. Narrative

Arif, seorang Kepala Seksi di Kanwil DJPb, menghadapi keputusan strategis: apakah timnya harus memigrasikan supervisi KPPN ke platform digital atau mempertahankan kunjungan fisik. Biasanya ia akan memutuskan berdasarkan intuisi dan pengalaman, lalu mendapat pertanyaan kritis dari atasannya tanpa bisa menjawab dengan data. Kali ini, Arif membuka SAT, membuat sesi baru, dan mengundang Rina (analis data) serta Hendra (Kasubbag Umum). Bersama-sama, mereka melewati 5 fase dalam dua sesi kerja. Di Fase 03, sistem mendeteksi bahwa asumsi Hendra tentang kegaptekan pegawai KPPN adalah Overfitting — dan memaksa tim untuk mengecek data riil sebelum lanjut. Di Fase 04, kalkulasi Expected Value menunjukkan angka yang jelas: Opsi B unggul dengan EV 57.6 berbanding 7.7. Arif mencetak output PDF dan mempresentasikannya ke Kepala Kanwil — bukan dengan "menurut saya", tapi dengan "menurut data dan logika yang sudah kita audit bersama."

## 7. Success metrics

### 7.1 User-centric metrics

- Tingkat penyelesaian sesi (completion rate): target ≥ 70% dari sesi yang dimulai berhasil mencapai Fase 05 dalam 30 hari.
- Waktu rata-rata per sesi (end-to-end): target ≤ 4 jam kumulatif untuk keputusan kelas medium.
- Skor kepuasan pengguna (CSAT) pasca-sesi: target ≥ 4.2/5.
- Persentase sesi dengan ≥ 1 Warning bias terdeteksi yang kemudian disanitasi (bukan diabaikan): target ≥ 80%.

### 7.2 Business metrics

- Jumlah organisasi aktif (≥ 1 sesi selesai per bulan) dalam 6 bulan pertama: target 25 organisasi.
- Monthly Active Users (MAU): target 150 pengguna unik di bulan ke-6.
- Net Revenue Retention (NRR) setelah 6 bulan pilot: target ≥ 90%.

### 7.3 Technical metrics

- Uptime platform: ≥ 99.5% per bulan.
- Waktu load halaman fase: ≤ 2 detik (P95).
- Waktu generate PDF output: ≤ 5 detik.
- Nol data breach pada audit trail keputusan dalam periode MVP.

## 8. Technical considerations

### 8.1 Integration points

- MVP: tidak ada integrasi eksternal yang wajib. Seluruh data diinput manual oleh pengguna.
- Post-MVP (roadmap): integrasi dengan SAKTI/OM-SPAN untuk auto-populate Hardcoded Data keuangan; integrasi SSO dengan Active Directory instansi pemerintah; export ke format XLSX untuk lampiran laporan formal.

### 8.2 Data storage & privacy

- Setiap sesi keputusan tersimpan dalam database terisolasi per organisasi (multi-tenant architecture dengan row-level security).
- Data keputusan bersifat sensitif organisasi — tidak boleh digunakan untuk pelatihan model AI tanpa persetujuan eksplisit.
- Audit trail (log perubahan) disimpan minimal 5 tahun untuk kebutuhan akuntabilitas pemerintahan.
- Enkripsi data at-rest (AES-256) dan in-transit (TLS 1.3).

### 8.3 Scalability & performance

- Arsitektur awal: monolith modular yang dapat dipisah menjadi microservices saat skala bertambah.
- Database: PostgreSQL dengan indeks pada workspace_id, session_id, dan user_id untuk query audit trail yang cepat.
- PDF generation: dijalankan secara asinkron (background job) agar tidak memblokir UI.
- Target skala awal: 500 concurrent users dengan infrastruktur cloud standar (2 vCPU, 4 GB RAM per instance).

### 8.4 Potential challenges

- **Resistensi adopsi terminologi teknis:** Pengguna dari latar belakang non-IT mungkin terhambat istilah seperti "Hardcoded Data" atau "Garbage Collection". Mitigasi: tooltip wajib dan padanan bahasa manajemen di setiap field.
- **Bobot dan skor yang subjektif (Fase 04):** Platform tidak dapat mencegah pengguna memasukkan bobot yang bias. Mitigasi: sistem menampilkan peringatan jika distribusi bobot terlalu timpang (satu kriteria > 80%), namun tidak memblokir.
- **Keputusan yang membutuhkan iterasi:** Beberapa keputusan perlu revisi di tengah fase. Mitigasi: Lead dapat membuka kembali fase yang sudah selesai dengan catatan revisi yang terdokumentasi di audit trail.
- **Pengguna yang melewati logika dengan mengisi nilai sembarangan:** Mitigasi jangka panjang adalah validasi silang antar fase (nilai di Fase 04 harus konsisten dengan threshold di Fase 02), namun ini dijadwalkan post-MVP.

## 9. Milestones & sequencing

### 9.1 Project estimate

- Medium project: 3 bulan untuk MVP (guided flow 5 fase end-to-end, single-org, tanpa real-time collaboration).

### 9.2 Team size & composition

- Small team (4–5 orang): 1 Product Manager, 1 UI/UX Designer, 2 Full-Stack Engineers, 1 QA Engineer.

### 9.3 Suggested phases

- **Phase 1 — Foundation** (Minggu 1–3)
  - Setup infrastruktur cloud, CI/CD pipeline, dan database schema multi-tenant.
  - Autentikasi, manajemen workspace, dan manajemen anggota.
  - Pembuatan sesi dan status management.

- **Phase 2 — Guided Flow Core** (Minggu 4–9)
  - Implementasi guided flow Fase 01 dan Fase 02 dengan form terstruktur dan validasi dasar.
  - Implementasi Fase 03 dengan engine deteksi bias (checklist berbasis rule).
  - Implementasi Fase 04 dengan kalkulator EV dan visualisasi perbandingan opsi.
  - Implementasi Fase 05 dengan Stakeholder Impact Matrix dan rencana monitoring.

- **Phase 3 — Output & Polish** (Minggu 10–12)
  - PDF generation engine untuk dokumen output keputusan.
  - Audit trail dan halaman riwayat sesi.
  - Notifikasi email dan reminder.
  - User onboarding flow dan template contoh.
  - UAT dengan 2–3 organisasi pilot, perbaikan bug, dan launch MVP.

## 10. User stories

### 10.1 Membuat sesi keputusan baru

- **ID:** GH-001
- **Description:** Sebagai Decision Lead, saya ingin membuat sesi keputusan baru dengan judul dan deskripsi singkat sehingga tim saya memiliki ruang kerja yang jelas untuk mendiskusikan satu keputusan spesifik.
- **Acceptance criteria:**
  - [ ] Lead dapat mengisi judul sesi (wajib, maks. 100 karakter), deskripsi (opsional), dan tanggal target keputusan.
  - [ ] Sesi baru muncul di dashboard workspace dengan status "Draft".
  - [ ] Fase 01 terbuka secara otomatis setelah sesi dibuat; Fase 02–05 terkunci.
  - [ ] Sesi dapat diedit judulnya selama masih berstatus Draft atau In Progress.

### 10.2 Mengundang anggota ke sesi

- **ID:** GH-002
- **Description:** Sebagai Decision Lead, saya ingin mengundang anggota tim via email dengan role tertentu sehingga setiap orang memiliki akses yang sesuai dengan tanggung jawabnya dalam proses keputusan.
- **Acceptance criteria:**
  - [ ] Lead dapat menginput satu atau beberapa alamat email sekaligus dan memilih role (Member atau Viewer) per orang.
  - [ ] Undangan terkirim via email dalam waktu ≤ 2 menit setelah Lead menekan "Kirim Undangan".
  - [ ] Penerima undangan yang belum terdaftar diarahkan ke halaman registrasi sebelum bergabung ke sesi.
  - [ ] Lead dapat mencabut akses anggota kapan saja; anggota yang dicabut tidak dapat mengakses sesi.

### 10.3 Mendefinisikan Root Objective (Fase 01)

- **ID:** GH-003
- **Description:** Sebagai Decision Lead, saya ingin mendefinisikan Root Objective dengan tag Hygienic atau Motivational sehingga seluruh tim memiliki pemahaman yang sama tentang tujuan keputusan sebelum menganalisis variabel.
- **Acceptance criteria:**
  - [ ] Form Fase 01 menyediakan field teks untuk pernyataan Root Objective (wajib) dan pilihan tag: Hygienic Function atau Motivational Function.
  - [ ] Sistem menampilkan definisi singkat Hygienic vs. Motivational sebagai tooltip saat pengguna memilih tag.
  - [ ] Form EVM menyediakan section terpisah untuk Internal Parameters, External Constraints, dan Constants — masing-masing dengan minimal 1 entri wajib sebelum Fase 01 dapat diselesaikan.
  - [ ] Setelah Lead menandai Fase 01 sebagai selesai, Fase 02 terbuka otomatis dan Fase 01 terkunci dari pengeditan (kecuali Lead secara eksplisit membuka kembali dengan catatan revisi).

### 10.4 Melakukan data tagging (Fase 02)

- **ID:** GH-004
- **Description:** Sebagai Decision Lead atau Member, saya ingin menandai setiap variabel sebagai Hardcoded Data atau Variable Parameter sehingga fakta empiris dan asumsi manajerial tidak tercampur dalam perhitungan.
- **Acceptance criteria:**
  - [ ] Setiap variabel yang diinput memiliki field: nama variabel, deskripsi, sumber/bukti, dan tag (Hardcoded Data / Variable Parameter).
  - [ ] Sistem menampilkan peringatan inline jika pengguna menandai variabel sebagai Hardcoded Data tetapi tidak mengisi kolom sumber/bukti.
  - [ ] Variabel yang sudah di-tag muncul dalam daftar yang dapat diedit selama Fase 02 aktif.
  - [ ] Seluruh variabel dari Fase 02 secara otomatis tersedia sebagai referensi di Fase 04 tanpa perlu input ulang.

### 10.5 Menjalankan logic debugging (Fase 03)

- **ID:** GH-005
- **Description:** Sebagai Decision Lead, saya ingin menjalankan pemeriksaan bias kognitif terhadap setiap variabel sehingga saya dapat mengidentifikasi dan memperbaiki cacat logika sebelum melanjutkan ke kalkulasi.
- **Acceptance criteria:**
  - [ ] Sistem menampilkan checklist 7 jenis bias (Data Sampling Error, Overfitting, Exception Suppression, Spurious Link, Calculation Precision Error, Memory Leak/Zombie Process, Unintended Side Effect) untuk setiap variabel.
  - [ ] Setiap bias yang ditandai "Terdeteksi" menampilkan definisi bug dan prosedur sanitasi yang disarankan.
  - [ ] Variabel mendapat status "Validated" (hijau) atau "Warning" (kuning) berdasarkan hasil checklist.
  - [ ] Sistem memblokir transisi ke Fase 04 jika ada variabel berstatus Warning yang belum diberi respons oleh Lead (respons minimal: catatan tindakan sanitasi atau justifikasi untuk tetap menggunakan variabel tersebut).

### 10.6 Menghitung Expected Value (Fase 04)

- **ID:** GH-006
- **Description:** Sebagai Decision Lead, saya ingin menghitung Expected Value setiap opsi kebijakan secara otomatis sehingga saya mendapatkan rekomendasi berbasis angka yang dapat saya pertanggungjawabkan.
- **Acceptance criteria:**
  - [ ] Lead dapat mendefinisikan 2–5 opsi kebijakan yang akan dibandingkan.
  - [ ] Matrix Scorecard menampilkan kriteria (diambil dari EVM Fase 01), tipe (Benefit/Cost), bobot (input manual, total harus = 1.0), dan justifikasi logika.
  - [ ] Sistem memperingatkan jika total bobot tidak sama dengan 1.0 dan memblokir kalkulasi.
  - [ ] Nilai Benefit dan Cost per opsi per kriteria diinput dalam skala 1–100; P_success dan P_risk diinput dalam skala 0.0–1.0.
  - [ ] EV dikalkulasi secara otomatis menggunakan formula EV = (Benefit × P_success) − (Cost × P_risk) dan ditampilkan dalam tabel perbandingan dan bar chart.
  - [ ] Jika semua EV bernilai negatif, sistem menampilkan pesan peringatan khusus dan saran untuk meninjau ulang Root Objective.

### 10.7 Menghasilkan dokumen output keputusan

- **ID:** GH-007
- **Description:** Sebagai Decision Lead, saya ingin menghasilkan dokumen PDF dari seluruh proses keputusan sehingga saya dapat mempresentasikannya kepada atasan atau stakeholder tanpa perlu menyusun ulang dari awal.
- **Acceptance criteria:**
  - [ ] Tombol "Generate Output" hanya aktif setelah Fase 05 diselesaikan.
  - [ ] PDF mencakup: judul sesi, tanggal, daftar anggota, ringkasan per fase (Root Objective, variabel utama, hasil debugging, Matrix Scorecard, nilai EV, dan rencana monitoring).
  - [ ] PDF dihasilkan dalam waktu ≤ 5 detik dan dapat langsung diunduh.
  - [ ] Dokumen PDF memuat watermark "Confidential — [Nama Organisasi]" dan nomor sesi unik untuk keperluan arsip.
  - [ ] Sesi otomatis berubah status menjadi "Completed" dan terkunci setelah PDF pertama kali digenerate.

### 10.8 Melihat riwayat sesi keputusan

- **ID:** GH-008
- **Description:** Sebagai Org Admin, saya ingin melihat seluruh riwayat sesi keputusan dalam workspace organisasi sehingga saya dapat melakukan audit dan mendukung pembelajaran organisasi.
- **Acceptance criteria:**
  - [ ] Halaman riwayat menampilkan semua sesi dengan kolom: judul, Decision Lead, tanggal dibuat, tanggal selesai, status, dan EV opsi terpilih.
  - [ ] Admin dapat memfilter berdasarkan status, rentang tanggal, dan Decision Lead.
  - [ ] Admin dapat membuka detail sesi (read-only) termasuk seluruh audit trail perubahan per fase dengan timestamp dan nama pengguna.
  - [ ] Admin tidak dapat mengedit konten sesi yang sudah Completed.
