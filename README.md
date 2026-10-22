# Floatio

<div align="center">

![Rust](https://img.shields.io/badge/Rust-1.80%2B-orange?logo=rust)
![Tauri](https://img.shields.io/badge/Tauri-v2-24C8D8?logo=tauri)
![WebAssembly](https://img.shields.io/badge/WebAssembly-WASM-654FF0?logo=webassembly)
![React](https://img.shields.io/badge/React-18-61DAFB?logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.5-3178C6?logo=typescript)
![Vite](https://img.shields.io/badge/Vite-5-646CFF?logo=vite)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.4-38B2AC?logo=tailwindcss)
![Vercel](https://img.shields.io/badge/Vercel-Deployable-black?logo=vercel)
![License](https://img.shields.io/badge/License-MIT-green)

**Floatio — University-grade Interactive IEEE 754 Floating-Point Converter & Mathematical Derivation Engine**  
*Rust Desktop Application (Tauri 2) + Web Application (WebAssembly + React + Vite + Tailwind CSS)*  

**Made by JAYCEE 曾令强**

[Live Web Demo (Vercel)](#-vercel-deployment) • [Download Windows Installer](#-desktop-packaging) • [Technical Documentation](#-technical-documentation)

</div>

---

## 📖 Table of Contents

- [Project Purpose](#-project-purpose)
- [Key Features](#-key-features)
- [System Architecture](#-system-architecture)
- [Technical Documentation](#-technical-documentation)
- [The 9-Stage Derivation Pipeline](#-the-9-stage-derivation-pipeline)
- [Test Cases & Ground Truth Verification](#-test-cases--ground-truth-verification)
- [Local Development & Building](#-local-development--building)
- [Desktop Packaging (Windows)](#-desktop-packaging)
- [Vercel Deployment](#-vercel-deployment)
- [License](#-license)

---

## 🎯 Project Purpose

**Floatio** is an interactive educational developer tool designed for university students, educators, and computer systems engineers studying Digital Systems, Computer Organization, and Computer Architecture.

Unlike standard black-box calculators that merely output a hexadecimal number, Floatio breaks down every mathematical operation required to convert a real decimal number into its IEEE 754 single-precision (binary32) or double-precision (binary64) representation. It illustrates integer repeated division by 2, fractional repeated multiplication by 2, normalization with interactive binary point movement, exponent bias calculation, fraction field rounding with round-to-nearest ties-to-even, bitstream concatenation, and nibble-by-nibble hexadecimal translation.

---

## ✨ Key Features

- **Single & Double Precision Support:**
  - **Single Precision (binary32):** 1-bit sign, 8-bit exponent (bias 127), 23-bit fraction (32 bits total).
  - **Double Precision (binary64):** 1-bit sign, 11-bit exponent (bias 1023), 52-bit fraction (64 bits total).
- **Comprehensive Numerical Handling:**
  - Positive numbers, negative numbers, and signed negative zero (`-0`).
  - Terminating fractions (e.g. `126.25`, `126.12`) and non-terminating repeating binary fractions (e.g. `0.1`).
  - Scientific notation (e.g. `1.25e-10`).
  - Subnormal numbers (e.g. `1.40129846e-45` in single, `5e-324` in double).
  - Special values (`+Infinity`, `-Infinity`, `NaN`).
  - Underflow to zero and overflow to infinity.
- **Interactive Visualizations:**
  - **Proportional Bit Bar:** Segmented bar showing exact bit allocation ($S \mid E \mid F$) with interactive field inspection.
  - **Interactive Binary Point Normalizer:** Animated bit scrubber showing the binary point moving left/right with dynamic exponent updates ($2^e$).
  - **Dynamic 4-Bit Hex Mapping:** Nibble-by-nibble translation table paired with a 16-row reference table ($0000_2 \to \text{0x0}$ through $1111_2 \to \text{0xF}$).
  - **Representation Error Analysis:** Decodes stored machine binary back to decimal to calculate exact error $|x - \hat{x}|$.
- **Design & Typography:**
  - Strict typography: **DM Sans** throughout all headings, labels, bitstreams, and inputs.
  - Calm, premium palette: `#181C14` (dark surface), `#3C3D37` (secondary cards), `#697565` (accent), and `#ECDFCC` (high-contrast text).
  - Wide layout ($1560\text{px}$ maximum container) with responsive wrapping.

---

## 🏛️ System Architecture

The project is organized as a Cargo workspace with independent web and desktop applications sharing a single Rust core:

```
├── crates/
│   ├── ieee754-core/          # Pure Rust conversion & 9-step mathematical engine
│   └── ieee754-wasm/          # WebAssembly bindings (wasm-bindgen / serde-wasm-bindgen)
├── apps/
│   ├── web/                   # React + TypeScript + Vite + Tailwind CSS web frontend
│   │   └── src/wasm/          # Precompiled WASM artifacts ready for browser execution
│   └── desktop/               # Tauri 2 native desktop application wrapper
│       └── src-tauri/         # Rust Tauri backend invoking ieee754-core
├── docs/                      # Comprehensive technical manuals & specifications
├── target/release/bundle/nsis/# Packaged Windows x64 NSIS Installer (.exe)
├── vercel.json                # Vercel deployment configuration
└── Cargo.toml                 # Root workspace manifest
```

---

## 📚 Technical Documentation

Explore the comprehensive technical guides in the `docs/` directory:

1. [**System Architecture Guide**](docs/architecture.md): Deep dive into crate structure, WASM compilation, Tauri 2 IPC, and memory safety.
2. [**Mathematical Specification**](docs/mathematical-specification.md): Complete mathematical formulation of IEEE 754-2019, rounding algorithms (Guard, Round, Sticky bits), and arbitrary-precision decimal multiplication.
3. [**API Reference**](docs/api-reference.md): Detailed signatures and schemas for the Rust core, WebAssembly exports, and TypeScript interfaces.
4. [**User & Educational Guide**](docs/user-guide.md): Walkthrough of the application interface, features, input formats, and educational controls.
5. [**Deployment & Packaging Guide**](docs/deployment-guide.md): Instructions for building the Windows NSIS installer and deploying to Vercel via GitHub.

---

## 🔢 The 9-Stage Derivation Pipeline

1. **Step 1 — Input Analysis:** Formats parameter breakdown, bit allocation bar, and exponent bias formula ($\text{Bias} = 2^{w-1} - 1$).
2. **Step 2 — Determine the Sign Bit:** Piecewise sign evaluation ($S = 0$ for $x \ge 0$, $S = 1$ for $x < 0$), with negative zero preservation (`-0`).
3. **Step 3 — Convert Decimal to Binary:**
   - **Integer Part:** Repeated division by 2 table with quotient and remainder read from bottom to top.
   - **Fractional Part:** Repeated multiplication by 2 table with integer bit extraction read from top to bottom.
4. **Step 4 — Normalize the Binary Number:** Demonstrates binary point shifting to obtain $1.\text{fraction}_2 \times 2^e$, with animated scrubbing controls and subnormal handling.
5. **Step 5 — Calculate the Biased Exponent:** Computes $E = e + \text{Bias}$ and converts $E$ into binary via repeated division by 2.
6. **Step 6 — Determine the Fraction Field:** Formulates the fraction field and evaluates IEEE 754 **Round-to-Nearest, Ties-to-Even** using Guard ($G$), Round ($R$), and Sticky ($S$) bits.
7. **Step 7 — Assemble the Bit Pattern:** Displays the combined color-coded word ($S \mid E \mid F$) with one-click copy support.
8. **Step 8 — Convert Binary to Hexadecimal:** Groups bits into 4-bit nibbles, generating the dynamic hexadecimal translation table.
9. **Step 9 — Final Result and Error Analysis:** Decodes the binary representation back into decimal, calculates the difference $|x - \hat{x}|$, and provides an exactness verdict.

---

## 🧪 Test Cases & Ground Truth Verification

The core engine is verified against 12 automated test cases (`cargo test --workspace`):

| Input Value | Precision | Sign | Unbiased Exp | Biased Exp (Bin) | Hexadecimal | Status |
| :--- | :--- | :---: | :---: | :---: | :--- | :--- |
| `126.25` | Single (32-bit) | 0 | 6 | `10000101` (133) | `0x42FC8000` | Exact |
| `126.25` | Double (64-bit) | 0 | 6 | `10000000101` (1029) | `0x405F900000000000` | Exact |
| `126.12` | Double (64-bit) | 0 | 6 | `10000000101` (1029) | `0x405F87AE147AE148` | Inexact |
| `0.1` | Single (32-bit) | 0 | -4 | `01111011` (123) | `0x3DCCCCCD` | Non-terminating |
| `0.1` | Double (64-bit) | 0 | -4 | `01111111011` (1019) | `0x3FB999999999999A` | Non-terminating |
| `-13.5` | Single (32-bit) | 1 | 3 | `10000010` (130) | `0xC1580000` | Exact |
| `0` | Single (32-bit) | 0 | 0 | `00000000` (0) | `0x00000000` | Exact Zero |
| `-0` | Single (32-bit) | 1 | 0 | `00000000` (0) | `0x80000000` | Signed Neg Zero |
| `1.40129846e-45` | Single (32-bit) | 0 | -126 | `00000000` (0) | `0x00000001` | Min Subnormal |
| `Infinity` | Single (32-bit) | 0 | N/A | `11111111` (255) | `0x7F800000` | Special |
| `NaN` | Single (32-bit) | 0 | N/A | `11111111` (255) | `0x7FC00000` | Special |

---

## 💻 Local Development & Building

### Prerequisites
1. **Rust 1.80+**: `rustup default stable`
2. **Node.js v18+ & npm**
3. **wasm-pack** *(optional, only if modifying Rust core)*: `cargo install wasm-pack`

### 1. Run Web Version Locally

```bash
cd apps/web
npm install
npm run dev
```
Open `http://localhost:5173` in your browser.

### 2. Run Desktop Version Locally

```bash
cd apps/desktop
npm install
npm run tauri dev
```

### 3. Run Test Suite

```bash
cargo test --workspace
```

---

## 📦 Desktop Packaging

To build the native Windows installer:

```bash
cd apps/desktop
npm run build
```

The resulting NSIS installer with embedded multi-size icons is output to:
```
target/release/bundle/nsis/Floatio_1.0.0_x64-setup.exe
```

---

## 🚀 Vercel Deployment

1. Push this repository to GitHub.
2. In the Vercel dashboard, click **Add New Project** and import the repository.
3. Vercel automatically detects `vercel.json` (Vite preset, `apps/web/dist` output, and `.wasm` MIME headers).
4. Click **Deploy**. The precompiled WASM in `apps/web/src/wasm/` ensures zero-dependency cloud building.

---

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.

**Made by JAYCEE 曾令强**
