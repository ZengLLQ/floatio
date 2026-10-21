# IEEE 754 Explorer — User & Educational Guide

> **Interactive Step-by-Step Learning Guide for Students & Engineers**  
> *Author: JAYCEE 曾令强*

---

## 1. Getting Started

When you launch **IEEE 754 Explorer**, the application opens to the conversion workspace:

1. **Precision Selector:** Toggle between **Single Precision (32-bit / binary32)** and **Double Precision (64-bit / binary64)** using the segmented control at the top.
2. **Decimal Input Field:** Enter any decimal number or select one of the built-in preset values.
3. **Trigger Conversion:** Press <kbd>Enter</kbd> or click the **Convert $\rightarrow$** button.

---

## 2. Supported Input Formats & Edge Cases

The converter accepts all standard numerical formats and computer architecture edge cases:

| Input Example | Description | Expected Single Precision (32-bit) Hex |
| :--- | :--- | :---: |
| `126.25` | Standard finite decimal with terminating fraction | `0x42FC8000` |
| `0.1` | Infinite repeating binary fraction ($0.000110011\dots_2$) | `0x3DCCCCCD` |
| `-13.5` | Negative decimal value (Sign bit $S = 1$) | `0xC1580000` |
| `-0` | Signed negative zero (preserves $S = 1, E = 0, F = 0$) | `0x80000000` |
| `1.25e-10` | Scientific notation with negative base-10 exponent | `0x2EE2D50E` |
| `1.40129846e-45` | Smallest positive subnormal number ($E = 0, F = 1$) | `0x00000001` |
| `Infinity` | Positive infinity ($S = 0, E = 255, F = 0$) | `0x7F800000` |
| `-Infinity` | Negative infinity ($S = 1, E = 255, F = 0$) | `0xFF800000` |
| `NaN` | Not-a-Number ($E = 255, F \neq 0$) | `0x7FC00000` |

---

## 3. Navigating the 9 Educational Steps

Below the primary bit visualization and result card, you will find the **Step-by-Step Educational Derivation**:

- **Step Navigation Pill Bar:** Click any number from `1` to `9` to jump directly to that step.
- **Previous / Next Controls:** Step through the derivation sequentially to follow the mathematical narrative.
- **Collapsible Cards:** Click the chevron toggle on any step card to expand or collapse details.

### What Each Step Teaches:

1. **Step 1 (Input Analysis):** Visualizes the bit layout bar ($1$ sign bit, $8$ or $11$ exponent bits, $23$ or $52$ fraction bits) and calculates the format bias ($\text{Bias} = 2^{w-1} - 1$).
2. **Step 2 (Sign Bit):** Demonstrates sign evaluation:
   $$S = \begin{cases} 0, & x \ge 0 \\ 1, & x < 0 \end{cases}$$
3. **Step 3 (Decimal to Binary):**
   - **Integer Part:** Table displaying repeated division by 2 with remainders read bottom-to-top.
   - **Fractional Part:** Table displaying repeated multiplication by 2 with extracted integer bits.
4. **Step 4 (Binary Normalization):**
   - Displays the unnormalized binary stream and explains the binary point shift to achieve $1.\text{significand}_2 \times 2^e$.
   - **Interactive Animated Normalizer:** Use the Play/Pause buttons or the interactive step slider to scrub the binary point left or right and watch the exponent counter update dynamically!
5. **Step 5 (Biased Exponent):** Computes $E = e + \text{Bias}$ and converts $E$ into binary via repeated division by 2.
6. **Step 6 (Fraction Field & Rounding):**
   - Drops the implicit leading bit ($1$ for normal numbers, $0$ for subnormal numbers).
   - Demonstrates IEEE 754 **Round-to-Nearest, Ties-to-Even** with Guard ($G$), Round ($R$), and Sticky ($S$) bit analysis.
7. **Step 7 (Bit Pattern Assembly):** Displays the color-coded concatenation $S \mid E \mid F$ with a one-click copy button.
8. **Step 8 (Hexadecimal Conversion):** Shows the 4-bit nibble mapping table and provides a complete 16-row reference table ($0000_2 \to \text{0x0}$ through $1111_2 \to \text{0xF}$).
9. **Step 9 (Final Result & Error Analysis):** Compares your original decimal input $x$ against the exact machine-represented decimal $\hat{x}$, calculating the absolute error $|x - \hat{x}|$ and indicating whether the encoding is **Exact** or **Inexact**.

---

## 4. Copying Values

The application includes one-click copy buttons throughout:
- **Copy Full Bit Pattern:** In the Bit Visualization header.
- **Copy Hex:** In the Primary Result summary card.
- **Copy Normalized Form:** In Step 4.
- **Copy Assembled Bits:** In Step 7.
- **Copy Decoded Decimal:** In Step 9.
