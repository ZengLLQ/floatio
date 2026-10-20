# IEEE 754 Explorer

> **University-grade Interactive IEEE 754 Floating-Point Converter & Mathematical Derivation Engine**  
> *Rust Desktop Application (Tauri 2) + Web Application (WebAssembly + React + Vite + Tailwind CSS)*  
> **Made by JAYCEE 曾令强**

---

## 1. Project Purpose

**IEEE 754 Explorer** is an interactive educational developer tool designed for university students and engineers studying Digital Systems, Computer Organization, and Computer Architecture. 

Unlike standard calculators that merely display a hexadecimal or binary output, IEEE 754 Explorer breaks down every single mathematical step required to convert a real decimal number into its IEEE 754 single-precision (binary32) or double-precision (binary64) representation. It illustrates integer repeated division by 2, fractional repeated multiplication by 2, normalization with binary point shifting, exponent bias calculation, fraction field rounding with round-to-nearest ties-to-even, bitstream concatenation, and nibble-by-nibble hexadecimal translation.

---

## 2. Key Features

- **Single & Double Precision Support:**
  - **Single Precision (binary32):** 1-bit sign, 8-bit exponent (bias 127), 23-bit fraction (32 bits total).
  - **Double Precision (binary64):** 1-bit sign, 11-bit exponent (bias 1023), 52-bit fraction (64 bits total).
- **Comprehensive Numerical Handling:**
  - Positive numbers, negative numbers, and signed negative zero (`-0`).
  - Terminating fractions (e.g. `126.25`) and non-terminating repeating binary fractions (e.g. `0.1`).
  - Scientific notation (e.g. `1.25e-10`).
  - Subnormal numbers (e.g. `1.40129846e-45` in single, `5e-324` in double).
  - Special values (`+Infinity`, `-Infinity`, `NaN`).
  - Underflow to zero and overflow to infinity.
- **Nine Sequential Derivation Steps:**
  1. **Input Analysis:** Format breakdown, bit allocation bar, exponent bias formula.
  2. **Sign Bit Determination:** Evaluation using sign-magnitude piecewise logic and negative zero preservation.
  3. **Decimal to Binary Conversion:**
     - Integer part: repeated division by 2 table with quotient and remainder read from bottom to top.
     - Fractional part: repeated multiplication by 2 table with integer bit extraction read from top to bottom.
  4. **Binary Normalization:** Demonstrates binary point movement to achieve $1.\text{significand}_2 \times 2^e$, explains implicit leading bit (and explicit $0$ leading bit for subnormals).
  5. **Biased Exponent Calculation:** Calculates $E = e + \text{Bias}$ and converts $E$ to binary via repeated division by 2.
  6. **Fraction Field & Rounding:** Extraction of fraction bits, padding, and IEEE 754 round-to-nearest, ties-to-even logic (Guard, Round, Sticky bits).
  7. **Bit Pattern Assembly:** Interactive color-coded breakdown ($S \mid E \mid F$) with copy support.
  8. **Binary to Hexadecimal Conversion:** Dynamic 4-bit nibble mapping table alongside a full 16-row 4-bit reference table.
  9. **Final Representation & Error Analysis:** Exact decoded machine decimal value, representation error $|x - \hat{x}|$, and exactness verdict.
- **Strict Visual & Typographic Standards:**
  - Single typeface throughout: **DM Sans** (including mathematical expressions and tabular figures).
  - Tailored calm editorial palette: `#181C14` (darkest background), `#3C3D37` (secondary surfaces), `#697565` (accent), `#ECDFCC` (contrast text).
  - Wide layout (1440px–1560px max width) with responsive fluidity on smaller screens.
  - Header attribution: `Made by JAYCEE 曾令强`.

---

## 3. Architecture

The codebase is organized as a Rust workspace with independent web and desktop applications sharing a single centralized Rust conversion core:

```
├── crates/
│   ├── ieee754-core/          # Pure Rust conversion and 9-step mathematical engine
│   └── ieee754-wasm/          # WebAssembly bindings (wasm-bindgen / serde-wasm-bindgen)
├── apps/
│   ├── web/                   # React + TypeScript + Vite + Tailwind CSS frontend
│   │   └── src/wasm/          # Precompiled WASM artifacts ready for browser execution
│   └── desktop/               # Tauri 2 native desktop application wrapper
│       └── src-tauri/         # Rust Tauri backend invoking ieee754-core
├── vercel.json                # Vercel deployment configuration
└── Cargo.toml                 # Root workspace manifest
```

---

## 4. Installation Requirements

1. **Rust Toolchain:** Rust 1.80+ (MSVC on Windows, or GCC/Clang on Unix).
2. **Node.js:** Node.js v18+ and `npm`.
3. **Optional for WASM recompilation:** `wasm-pack` (`cargo install wasm-pack` or prebuilt binary).

---

## 5. Development Workflow

### Running the Web Version Locally

```powershell
# Navigate to web app
cd apps/web

# Install dependencies
npm install

# Start Vite development server
npm run dev
```

Visit `http://localhost:5173` in your browser.

### Running the Desktop Version Locally

```powershell
# Navigate to desktop app
cd apps/desktop

# Run Tauri in development mode (launches Vite + native window)
npx @tauri-apps/cli dev
```

---

## 6. Running Tests

Run all unit and integration tests across the entire Rust workspace:

```powershell
cargo test --workspace
```

To run tests specifically for the numerical core:

```powershell
cargo test --package ieee754-core
```

---

## 7. Building the Applications

### 1. Build the WASM Module

```powershell
wasm-pack build crates/ieee754-wasm --target web --out-dir ../../apps/web/src/wasm
```

### 2. Build the Web Application for Production

```powershell
cd apps/web
npm run build
```

The optimized static assets will be output to `apps/web/dist/`.

### 3. Build the Windows Desktop Installer (.exe)

```powershell
cd apps/desktop
npx @tauri-apps/cli build --bundles nsis
```

The resulting NSIS installer is generated at:
```
target/release/bundle/nsis/IEEE 754 Explorer_1.0.0_x64-setup.exe
```

---

## 8. Vercel Deployment

The application is pre-configured for one-click deployment on [Vercel](https://vercel.com):

1. Push this repository to GitHub.
2. In Vercel, import the repository.
3. Vercel automatically detects `vercel.json`:
   - **Framework:** Vite
   - **Build Command:** `cd apps/web && npm run build`
   - **Output Directory:** `apps/web/dist`
   - **Headers:** Automatically sets `Content-Type: application/wasm` for `.wasm` assets.
4. Deploy! The WASM package is committed under `apps/web/src/wasm/`, so Vercel builds the project without requiring any Rust or external toolchains.

---

## 9. Understanding Floating-Point Limitations

Binary floating-point numbers represent values as:
$$x = (-1)^S \times (1 + \text{fraction}) \times 2^{E - \text{Bias}}$$

Because the significand is expressed in powers of $2$ ($2^{-1} = 0.5$, $2^{-2} = 0.25$, $2^{-3} = 0.125$, etc.), fractions whose denominators have prime factors other than $2$ (such as $0.1 = \frac{1}{10} = \frac{1}{2 \times 5}$) cannot be represented with a finite number of bits. In IEEE 754 single precision:
- $0.1_{10} = 0.00011001100110011001100110011..._2$
- The stored value is `0x3DCCCCCD`, which equals exactly:
  $$0.100000001490116119384765625$$
- The absolute representation error is:
  $$|0.1 - 0.100000001490116119384765625| \approx 1.49 \times 10^{-9}$$

IEEE 754 Explorer dynamically computes and displays these exact machine representations and error terms for any input.

---

## 10. Verification Test Cases

| Input Value | Precision | Sign | Unbiased Exp | Biased Exp (Bin) | Hexadecimal | Status |
| :--- | :--- | :---: | :---: | :---: | :--- | :--- |
| `126.25` | Single (32-bit) | 0 | 6 | `10000101` (133) | `0x42FC8000` | Exact |
| `126.25` | Double (64-bit) | 0 | 6 | `10000000101` (1029) | `0x405F900000000000` | Exact |
| `0.1` | Single (32-bit) | 0 | -4 | `01111011` (123) | `0x3DCCCCCD` | Non-terminating |
| `0.1` | Double (64-bit) | 0 | -4 | `01111111011` (1019) | `0x3FB999999999999A` | Non-terminating |
| `-13.5` | Single (32-bit) | 1 | 3 | `10000010` (130) | `0xC1580000` | Exact |
| `0` | Single (32-bit) | 0 | 0 | `00000000` (0) | `0x00000000` | Exact Zero |
| `-0` | Single (32-bit) | 1 | 0 | `00000000` (0) | `0x80000000` | Signed Neg Zero |
| `1.40129846e-45` | Single (32-bit) | 0 | -126 | `00000000` (0) | `0x00000001` | Min Subnormal |
| `Infinity` | Single (32-bit) | 0 | N/A | `11111111` (255) | `0x7F800000` | Special |
| `NaN` | Single (32-bit) | 0 | N/A | `11111111` (255) | `0x7FC00000` | Special |
