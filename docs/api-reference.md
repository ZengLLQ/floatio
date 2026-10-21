# IEEE 754 Explorer — API Reference

> **Complete Interface Reference for Rust Core, WebAssembly, and TypeScript**  
> *Author: JAYCEE 曾令强*

---

## 1. Rust Core Engine (`ieee754-core`)

### Primary Conversion Function

```rust
pub fn convert(input: &str, precision: Precision) -> Result<ConversionResult, String>
```
Takes a decimal input string and precision enum, returning a full `ConversionResult` containing native hardware bit truth and all 9 educational step structures.

#### Arguments
- `input: &str`: Raw decimal string (e.g. `"126.25"`, `"-13.5"`, `"0.1"`, `"-0"`, `"1.25e-10"`, `"Infinity"`, `"NaN"`).
- `precision: Precision`: Precision target (`Precision::Single` or `Precision::Double`).

#### Returns
- `Ok(ConversionResult)`: On successful parsing and conversion.
- `Err(String)`: If input contains invalid non-numeric tokens.

---

### Core Data Models (`types.rs`)

```rust
pub enum Precision {
    Single, // 32-bit (binary32)
    Double, // 64-bit (binary64)
}

pub enum NumberCategory {
    Zero,
    Normal,
    Subnormal,
    Infinity,
    NaN,
}

pub struct ConversionResult {
    pub raw_input: String,
    pub precision: Precision,
    pub category: NumberCategory,
    pub is_valid: bool,
    pub error_message: Option<String>,
    
    // Core bit truth from hardware primitives
    pub bits_raw: u64,
    pub bit_pattern: String,
    pub hex_string: String,
    pub sign_bit: u8,
    pub exponent_raw: u32,
    pub fraction_raw: u64,
    
    // 9 Educational Steps
    pub step1: Step1InputAnalysis,
    pub step2: Step2SignBit,
    pub step3: Step3DecimalToBinary,
    pub step4: Step4Normalization,
    pub step5: Step5BiasedExponent,
    pub step6: Step6FractionField,
    pub step7: Step7BitPatternAssembly,
    pub step8: Step8HexConversion,
    pub step9: Step9FinalResult,
}
```

---

## 2. WebAssembly Bridge (`ieee754-wasm`)

### Exported Function

```typescript
export function convert_ieee754(input: string, precision_str: string): any;
```

#### Signature in Rust
```rust
#[wasm_bindgen]
pub fn convert_ieee754(input: &str, precision_str: &str) -> Result<JsValue, JsValue>
```

#### Behavior
- Parses `precision_str` (case-insensitive: `"single"`, `"32"`, `"double"`, `"64"`).
- Serializes `ConversionResult` using `serde_wasm_bindgen::Serializer::new().serialize_large_number_types_as_bigints(true)`.
- Returns a rich JavaScript object directly usable by React without manual JSON deserialization.

---

## 3. Desktop Tauri IPC (`apps/desktop`)

### Tauri Command

```rust
#[tauri::command]
fn convert_decimal(input: String, precision: String) -> Result<ConversionResult, String>
```

Invoked from frontend JavaScript when running in Tauri context:
```typescript
import { invoke } from '@tauri-apps/api/core';

const result = await invoke<ConversionResult>('convert_decimal', {
  input: '126.25',
  precision: 'Single',
});
```

---

## 4. TypeScript Definitions (`apps/web/src/types.ts`)

```typescript
export type Precision = 'Single' | 'Double';
export type NumberCategory = 'Zero' | 'Normal' | 'Subnormal' | 'Infinity' | 'NaN';

export interface DivisionRow {
  division: string;
  quotient: string;
  remainder: string;
}

export interface MultiplicationRow {
  step: number;
  expression: string;
  integer_bit: string;
  remaining_fraction: string;
}

export interface NibbleConversion {
  index: number;
  binary: string;
  hex: string;
  bit_range: string;
  field_type: string;
}

export interface Step1InputAnalysis {
  raw_input: string;
  precision: Precision;
  total_bits: number;
  sign_bits: number;
  exponent_bits: number;
  fraction_bits: number;
  bias: number;
  category: NumberCategory;
  latex_formula: string;
}

export interface Step6FractionField {
  significand_with_hidden: string;
  candidate_unrounded_fraction: string;
  target_bit_length: number;
  stored_fraction_bits: string;
  guard_bit?: string | null;
  round_bit?: string | null;
  sticky_bit?: string | null;
  did_round: boolean;
  round_caused_exponent_increment: boolean;
  latex_formula: string;
  explanation: string;
}
```
