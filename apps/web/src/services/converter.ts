import init, { convert_ieee754 } from '../wasm/ieee754_wasm.js';
import wasmUrl from '../wasm/ieee754_wasm_bg.wasm?url';
import { ConversionResult, Precision } from '../types';

let wasmInitPromise: Promise<void> | null = null;

export async function ensureWasmInitialized(): Promise<void> {
  if (!wasmInitPromise) {
    wasmInitPromise = init(wasmUrl).then(() => {
      // initialized
    });
  }
  return wasmInitPromise;
}

export async function convertDecimal(input: string, precision: Precision): Promise<ConversionResult> {
  await ensureWasmInitialized();
  try {
    const rawResult = convert_ieee754(input, precision.toLowerCase());
    return rawResult as ConversionResult;
  } catch (err: unknown) {
    throw new Error(typeof err === 'string' ? err : (err as Error).message || 'Conversion failed');
  }
}
