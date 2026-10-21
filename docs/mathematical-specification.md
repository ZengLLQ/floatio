# IEEE 754 Mathematical Specification

> **Rigorous Mathematical Formulation of the 9-Step Conversion Engine**  
> *Author: JAYCEE 曾令强*  
> *Reference Standards: IEEE 754-2008 / IEEE 754-2019 Standard for Floating-Point Arithmetic*

---

## 1. IEEE 754 Formats Overview

IEEE 754 defines formats for representing floating-point numbers in binary computer hardware. The two primary formats supported by IEEE 754 Explorer are:

| Parameter | Single Precision (binary32) | Double Precision (binary64) |
| :--- | :---: | :---: |
| **Total Bit Width ($k$)** | $32\text{ bits}$ | $64\text{ bits}$ |
| **Sign Bit Width ($S$)** | $1\text{ bit}$ | $1\text{ bit}$ |
| **Exponent Bit Width ($w$)** | $8\text{ bits}$ | $11\text{ bits}$ |
| **Fraction Field Width ($p - 1$)** | $23\text{ bits}$ | $52\text{ bits}$ |
| **Significand Precision ($p$)** | $24\text{ bits}$ (including hidden bit) | $53\text{ bits}$ (including hidden bit) |
| **Exponent Bias ($\text{Bias} = 2^{w-1} - 1$)** | $127$ | $1023$ |
| **Unbiased Exponent Range ($e$)** | $[-126, +127]$ | $[-1022, +1023]$ |
| **Biased Exponent Range ($E$)** | $[1, 254]$ | $[1, 2046]$ |
| **Smallest Positive Subnormal** | $2^{-149} \approx 1.401298 \times 10^{-45}$ | $2^{-1074} \approx 4.940656 \times 10^{-324}$ |
| **Smallest Positive Normal** | $2^{-126} \approx 1.175494 \times 10^{-38}$ | $2^{-1022} \approx 2.225074 \times 10^{-308}$ |
| **Largest Finite Number** | $(2 - 2^{-23}) \times 2^{127} \approx 3.402823 \times 10^{38}$ | $(2 - 2^{-52}) \times 2^{1023} \approx 1.797693 \times 10^{308}$ |

---

## 2. Number Classifications

A real number $x$ mapped into IEEE 754 belongs to one of five mutually exclusive categories based on its biased exponent $E$ and fraction field $F$:

$$
x = \begin{cases}
(-1)^S \times 0.0, & E = 0, \quad F = 0 \quad (\text{Zero}) \\
(-1)^S \times 0.F_2 \times 2^{1 - \text{Bias}}, & E = 0, \quad F \neq 0 \quad (\text{Subnormal Number}) \\
(-1)^S \times 1.F_2 \times 2^{E - \text{Bias}}, & 1 \le E \le 2^w - 2 \quad (\text{Normal Number}) \\
(-1)^S \times \infty, & E = 2^w - 1, \quad F = 0 \quad (\text{Infinity}) \\
\text{NaN}, & E = 2^w - 1, \quad F \neq 0 \quad (\text{Not-a-Number})
\end{cases}
$$

---

## 3. The 9-Stage Mathematical Pipeline

### Step 1: Input Analysis & Format Sizing
Calculates the structural parameters for the selected precision:
- Exponent Bias:
  $$\text{Bias} = 2^{w - 1} - 1$$
- Total bit width:
  $$k = 1 + w + (p - 1)$$

### Step 2: Determine Sign Bit ($S$)
The sign bit is evaluated through sign-magnitude logic:
$$
S = \begin{cases}
0, & x > 0 \quad \text{or} \quad x = +0 \\
1, & x < 0 \quad \text{or} \quad x = -0
\end{cases}
$$
> **Signed Zero Handling:** Ordinary floating-point equality considers $+0 = -0$. To preserve signed zero, the string tokenizer inspects the leading character for `-` even when the numerical value is zero.

### Step 3: Decimal to Binary Conversion

The input magnitude $|x|$ is separated into an integer part $I$ and a fractional part $f$:
$$|x| = I + f, \quad I \in \mathbb{N}_0, \quad f \in [0, 1)$$

#### A. Integer Part: Repeated Division by 2
The integer $I$ is repeatedly divided by 2:
$$I_k = 2 \cdot I_{k+1} + r_k, \quad r_k \in \{0, 1\}$$
The binary digits are obtained by reading the remainders from bottom to top:
$$I_{(2)} = r_n r_{n-1} \dots r_1 r_0$$

#### B. Fractional Part: Repeated Multiplication by 2
The fractional part $f$ is repeatedly multiplied by 2:
$$2 \cdot f_k = d_k + f_{k+1}, \quad d_k = \lfloor 2 \cdot f_k \rfloor \in \{0, 1\}, \quad f_{k+1} = 2 \cdot f_k - d_k$$
The binary digits are obtained by reading the integer bits from top to bottom:
$$f_{(2)} = 0.d_1 d_2 d_3 \dots$$

To prevent primitive integer overflow with high-precision inputs (such as $\pi = 3.14159265358979323846\dots$), the engine executes this step using base-10 digit-by-digit arithmetic:
```rust
fn mul2_decimal_digits(digits: &[u8]) -> (u8, Vec<u8>)
```

### Step 4: Normalization & Binary Point Movement
For normal non-zero numbers, the combined binary value is normalized such that exactly one non-zero digit precedes the binary point:
$$|x|_{(2)} = 1.b_1 b_2 b_3 \dots \times 2^e$$
Where $e$ is the unbiased exponent:
- If $I \ge 1$: the binary point shifts **left** by $e = \lfloor \log_2 I \rfloor$ positions.
- If $I = 0$: the binary point shifts **right** by $e = -(\text{index of first 1-bit})$ positions.

For **subnormal numbers**, standard normalization is impossible because $e < 1 - \text{Bias}$. The implicit leading bit is fixed at $0$:
$$|x|_{(2)} = 0.b_1 b_2 b_3 \dots \times 2^{1 - \text{Bias}}$$

### Step 5: Calculate Biased Exponent ($E$)
The hardware exponent $E$ is an unsigned integer offset by $\text{Bias}$:
$$E = e + \text{Bias}$$

$E$ is converted to binary using repeated division by 2, zero-padded to $w$ bits ($8$ bits for single, $11$ bits for double).

### Step 6: Fraction Field Formation & Rounding
The significand bits following the leading bit ($1$ or $0$) are extracted to fill the target fraction width ($m = 23$ for single, $m = 52$ for double).

#### IEEE 754 Round-to-Nearest, Ties-to-Even
When the binary fraction contains more bits than the target field, rounding is evaluated using three indicator bits:
- **Least Significant Bit ($L$):** The lowest bit retained in the fraction field.
- **Guard Bit ($G$):** The first discarded bit (weight $2^{-(m+1)}$).
- **Round Bit ($R$):** The second discarded bit (weight $2^{-(m+2)}$).
- **Sticky Bit ($S$):** The logical OR of all remaining discarded bits ($S = \bigvee_{i=m+3}^{\infty} b_i$).

```
Retained Fraction Bits       Discarded Bits
[ ... b_{m-1} b_m ]        [ G ] [ R ] [ S ... ]
              |              |     |     |
             LSB           Guard Round Sticky
```

**Rounding Decision Rules:**
1. If $G = 0$: Round down (truncate; remainder is strictly $< \frac{1}{2}\text{ LSB}$).
2. If $G = 1$ and $(R = 1 \lor S = 1)$: Round up (remainder is strictly $> \frac{1}{2}\text{ LSB}$).
3. If $G = 1$ and $R = 0$ and $S = 0$ (**Halfway Tie**):
   - If $L = 1$: Round up to produce an **even** LSB ($0$).
   - If $L = 0$: Round down to keep the **even** LSB ($0$).

If rounding up causes a fraction overflow (e.g., `111...1` $+ 1 = 2^m$), the fraction resets to all zeros and the biased exponent $E$ increments by $1$.

### Step 7: Assemble the Bit Pattern
The three fields are concatenated into a single bitstream:
$$\text{Bit Pattern} = S \parallel E \parallel F$$

### Step 8: Convert Binary to Hexadecimal
The bitstream is partitioned into 4-bit nibbles:
- Single precision: $\frac{32}{4} = 8\text{ nibbles}$.
- Double precision: $\frac{64}{4} = 16\text{ nibbles}$.

Each nibble $b_3 b_2 b_1 b_0$ maps to its hexadecimal character:
$$H_i = \sum_{j=0}^{3} b_j \cdot 2^j \in \{0, 1, \dots, 9, \text{A}, \dots, \text{F}\}$$

### Step 9: Error Quantification & Exactness Verdict
The exact machine value $\hat{x}$ encoded by the bit pattern is decoded back into high-precision decimal:
$$\hat{x} = (-1)^S \times \left(1 + \sum_{i=1}^{m} F_i \cdot 2^{-i}\right) \times 2^{E - \text{Bias}}$$

The absolute representation error is:
$$\varepsilon = |x - \hat{x}|$$
- If $\varepsilon = 0$: the representation is **Exact**.
- If $\varepsilon > 0$: the representation is **Inexact / Rounded**.
