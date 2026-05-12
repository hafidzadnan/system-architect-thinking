# System Architect Thinking (SAT)

Platform pengambilan keputusan terstruktur berbasis kerangka kerja "Algoritma Berpikir" yang mengadopsi paradigma pemrograman.

## 🚀 Quick Start

1.  Masuk ke direktori aplikasi:
    ```bash
    cd sat-app
    ```
2.  Install dependensi:
    ```bash
    npm install
    ```
3.  Jalankan aplikasi:
    ```bash
    npm run dev
    ```

---

## 📋 Rencana Implementasi (Implementation Plan)

Platform pengambilan keputusan terstruktur berbasis kerangka kerja "Algoritma Berpikir" yang mengadopsi paradigma pemrograman. MVP ini berfokus pada **guided flow 5 fase** + **Eisenhower Matrix tool** sebagai fitur standalone, menggunakan pendekatan **frontend-only** dengan localStorage untuk validasi konsep cepat.

### Keputusan Desain yang Telah Disetujui

| # | Keputusan | Status |
|---|-----------|--------|
| 1 | Single-user, tanpa kolaborasi | ✅ |
| 2 | Demo login (`demo`/`demo123`), tanpa auth management | ✅ |
| 3 | Tanpa PDF generation (tampil di layar saja) | ✅ |
| 4 | localStorage (frontend-only, validasi konsep cepat) | ✅ |
| 5 | Localhost dulu, deploy ke Vercel nanti | ✅ |
| 6 | 4 jenis bias: Data Sampling Error, Overfitting, Exception Suppression, Spurious Link | ✅ |
| 7 | LLM: Google Gemini API (free tier) | ✅ |
| 8 | Eisenhower Matrix sebagai fitur standalone (update PRD) | ✅ |
| 9 | Bobot terpisah per tipe (Benefit total = 1.0, Cost total = 1.0) | ✅ |
| 10 | Desain formal, clean, kontras baik, untuk instansi pemerintah | ✅ |
| 11 | Bahasa antarmuka: Bahasa Indonesia | ✅ |
| 12 | Opsi kebijakan: 2–5 opsi | ✅ |
| 13 | Template demo: Studi kasus "Migrasi Supervisi KPPN" | ✅ |
| 14 | Fase 01: Import hasil dari AI agent eksternal (paste JSON/structured data) | ✅ |
| 15 | Fase 02: User menentukan variabel & threshold secara manual | ✅ |
| 16 | Fase 03 → Fase 02 loop: Hanya variabel Warning yang editable, Fase 03 re-run setelah edit | ✅ |
| 17 | Iterasi Fase 02 ↔ 03 tidak dibatasi, user bisa edit kapan saja | ✅ |
| 18 | Fase 04: Tipe Benefit/Cost ditentukan AI via logika mapping nuanced | ✅ |
| 19 | Satu EVM → satu kriteria, AI dapat memecah jika diperlukan | ✅ |

### Tech Stack

| Layer | Teknologi | Alasan |
|-------|-----------|--------|
| Build Tool | **Vite** | Cepat, Vercel-ready |
| UI Framework | **React 18** | State management kompleks (5 fase, banyak form) |
| State Management | **Zustand + persist middleware** | Lightweight, built-in localStorage sync |
| Styling | **Vanilla CSS** + CSS Variables | Clean, formal, tanpa dependency |
| Chart | **Chart.js + react-chartjs-2** | Bar chart perbandingan EV |
| LLM Integration | **Google Gemini API** (client-side fetch) | Free tier, default API key tersedia untuk demo |
| Font | **Inter** (Google Fonts) | Clean, professional, high readability |
| Routing | **React Router v6** | SPA navigation |

### Design System

- **Color Palette:** Formal, muted
  - Primary: Navy (#1B2A4A)
  - Secondary: Slate (#475569)
  - Background: White (#FFFFFF) / Off-white (#F8FAFC)
  - Surface: Light gray (#F1F5F9)
  - Success/Validated: Green (#166534) on light green (#DCFCE7)
  - Warning: Amber (#92400E) on light amber (#FEF3C7)
  - Error: Red (#991B1B) on light red (#FEE2E2)
  - AI-tagged: Indigo (#3730A3) on light indigo (#E0E7FF)
  - Text primary: (#1E293B), Text secondary: (#64748B)
- **Typography:** Inter, hierarchy jelas (h1 28px, h2 22px, h3 18px, body 15px)
- **Layout:** Sidebar navigation (240px) + main content area, max-width 1200px
- **Bahasa:** Seluruh UI dalam **Bahasa Indonesia**, terminologi teknis ditampilkan bersama padanan manajerial dalam tanda kurung

---

### Arsitektur File

```
src/
├── main.jsx
├── App.jsx
├── index.css                       # Global styles + design tokens
│
├── stores/
│   ├── authStore.js                # Demo login state
│   ├── sessionStore.js             # Decision sessions CRUD + fase state
│   └── settingsStore.js            # API key, preferences
│
├── pages/
│   ├── LoginPage.jsx
│   ├── DashboardPage.jsx
│   ├── SessionPage.jsx             # Phase navigator + phase content
│   ├── EisenhowerPage.jsx          # Standalone tool
│   └── SettingsPage.jsx
│
├── components/
│   ├── layout/
│   │   ├── Sidebar.jsx
│   │   ├── Header.jsx
│   │   └── AppLayout.jsx
│   ├── session/
│   │   ├── PhaseNavigator.jsx      # 5-phase sidebar dalam sesi
│   │   ├── SessionCard.jsx
│   │   └── SessionSummary.jsx      # Ringkasan output akhir
│   ├── phases/
│   │   ├── Phase01.jsx             # System Requirements Analysis
│   │   ├── Phase02.jsx             # Variable & Constraint Definition
│   │   ├── Phase03.jsx             # Logic Debugging & Sanitization
│   │   ├── Phase04.jsx             # Computation & Execution
│   │   └── Phase05.jsx             # Output Validation & Monitoring
│   ├── eisenhower/
│   │   └── EisenhowerMatrix.jsx
│   ├── charts/
│   │   └── EVComparisonChart.jsx
│   └── ui/
│       ├── Button.jsx
│       ├── Input.jsx
│       ├── Card.jsx
│       ├── Alert.jsx
│       ├── Modal.jsx
│       ├── Tooltip.jsx
│       ├── Badge.jsx
│       └── ProgressBar.jsx
│
├── utils/
│   ├── evCalculator.js             # EV formula logic
│   ├── eisenhowerLogic.js          # Priority queue categorization
│   ├── biasAnalyzer.js             # Gemini API: bias analysis prompt + call
│   ├── criteriaMapper.js           # Gemini API: EVM → Benefit/Cost mapping
│   ├── templateData.js             # Studi kasus KPPN (pre-filled)
│   └── constants.js                # Bias types, categories, labels
│
└── assets/
    └── logo.svg
```

---

### Detail Fitur per Halaman

#### 1. Login Page (Demo)
- Kredensial hardcoded: `demo` / `demo123`
- Tampilan formal: logo, judul "System Architect Thinking", subtitle "Platform Pengambilan Keputusan Terstruktur"
- Redirect ke Dashboard setelah login berhasil

#### 2. Dashboard
- **Daftar sesi keputusan** dalam format kartu (cards)
- **Tombol "Buat Sesi Baru"** → Modal form (opsi template studi kasus KPPN)
- **Filter** berdasarkan status (Semua / Draft / Berlangsung / Selesai)

#### 3. Session Page — Guided Flow 5 Fase
##### [FASE 01] System Requirements Analysis
- Mode Input Manual & Import AI Agent (JSON)
- Pendefinisian Root Objective, Tag Fungsi, EVM

##### [FASE 02] Variable & Constraint Definition
- Data Tagging (Hardcoded/Variable Parameter)
- Threshold Definition
- Priority Queue (Eisenhower Matrix)

##### [FASE 03] Logic Debugging & Sanitization
- Analisis 4 jenis bias (Sampling Error, Overfitting, Exception Suppression, Spurious Link)
- Integrasi Gemini API untuk deteksi bias otomatis

##### [FASE 04] Computation & Execution
- Mapping Kriteria (Benefit/Cost) oleh AI
- Matrix Scorecard & Scoring
- Kalkulasi Expected Value (EV) & Visualisasi Bar Chart

##### [FASE 05] Output Validation & Monitoring
- Zombie Process Check
- Cobra Effect Monitoring Plan
- Stakeholder Impact Matrix (Cipolla Matrix)
- Ringkasan Keputusan Akhir

#### 4. Eisenhower Matrix (Fitur Standalone)
- Tool prioritas mandiri berbasis U (Time Criticality) dan I (System Impact)

#### 5. Settings Page
- Manajemen Gemini API Key (Default tersedia)

---

### Data Template: Studi Kasus Migrasi Supervisi KPPN
- Data studi kasus lengkap dari Fase 01 hingga Fase 05 tersedia sebagai template demo.

### Verification Plan
- `npm run build` & `npm run dev` verification
- Browser testing untuk seluruh alur 5 fase
- Visual verification untuk desain formal dan bahasa Indonesia yang konsisten
