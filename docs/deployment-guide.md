# IEEE 754 Explorer — Deployment & Packaging Guide

> **Production Deployment Guide for Vercel Web Hosting & Windows Desktop Packaging**  
> *Author: JAYCEE 曾令强*

---

## 1. Web Deployment to Vercel

The application is pre-configured for automated continuous deployment to [Vercel](https://vercel.com) via GitHub:

### Architecture on Vercel
Because the compiled WebAssembly package is pre-bundled in `apps/web/src/wasm/`, Vercel builds the web application using standard Node.js without requiring Rust, Cargo, or `wasm-pack` installed in the cloud build environment.

### Deployment Steps:

1. **Push Repository to GitHub:**
   ```bash
   git add .
   git commit -m "feat: complete IEEE 754 Explorer release"
   git push origin main
   ```

2. **Import Project into Vercel:**
   - Log into your [Vercel Dashboard](https://vercel.com).
   - Click **Add New...** $\rightarrow$ **Project**.
   - Select the `ieee-754-explorer` repository.

3. **Verify Configuration:**
   Vercel reads [`vercel.json`](../vercel.json) automatically from the repository root:
   - **Framework Preset:** Vite
   - **Build Command:** `cd apps/web && npm run build`
   - **Output Directory:** `apps/web/dist`
   - **WASM MIME Header:** Automatically serves `.wasm` files with `Content-Type: application/wasm` and immutable caching headers:
     ```json
     {
       "source": "/(.*).wasm",
       "headers": [
         {
           "key": "Content-Type",
           "value": "application/wasm"
         },
         {
           "key": "Cache-Control",
           "value": "public, max-age=31536000, immutable"
         }
       ]
     }
     ```

4. **Deploy:**
   Click **Deploy**. Your application will be live at `https://ieee-754-explorer.vercel.app` (or your custom domain) with instant worldwide edge CDN caching.

---

## 2. Desktop Application Packaging (Windows x64)

The desktop edition uses **Tauri 2** to package the application into a native lightweight Windows executable and NSIS installer.

### Prerequisites:
- Windows 10/11 x64
- Rust toolchain (`rustup default stable-x86_64-pc-windows-msvc`)
- Node.js v18+ and `npm`

### Build Command:

```powershell
# Navigate to desktop app directory
cd apps/desktop

# Build the release binary and NSIS setup installer
npm run build
```

### Build Artifacts:

Upon successful completion, the installer is generated at:
```
target/release/bundle/nsis/IEEE 754 Explorer_1.0.0_x64-setup.exe
```
And the standalone portable binary is generated at:
```
target/release/ieee754-desktop.exe
```

### Installer Characteristics:
- **Installer Size:** $\approx 3.04\text{ MB}$ (extremely lightweight compared to Electron's typical $80\text{--}120\text{ MB}$).
- **Icon:** Embedded high-resolution multi-size Windows icon (`16x16`, `24x24`, `32x32`, `48x48`, `64x64`, `128x128`, `256x256`).
- **Memory Footprint:** $\approx 35\text{--}50\text{ MB}$ RAM using native Windows WebView2 runtime.

---

## 3. Recompiling WebAssembly (Optional / Development)

If you modify the core mathematical engine in `crates/ieee754-core` and want to update the browser WASM package:

```powershell
# Prerequisites: cargo install wasm-pack
wasm-pack build crates/ieee754-wasm --target web --out-dir ../../apps/web/src/wasm
```
Then commit the updated files in `apps/web/src/wasm/`.
