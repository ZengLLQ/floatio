use crate::parser::ParsedInput;
use crate::types::*;

pub fn build_step1(parsed: &ParsedInput, precision: Precision, category: NumberCategory) -> Step1InputAnalysis {
    let bias = precision.bias();
    let total = precision.total_bits();
    let exp_bits = precision.exponent_bits();
    let frac_bits = precision.fraction_bits();

    let latex = match precision {
        Precision::Single => format!(
            r"\begin{{aligned}}
\text{{Format}} &= \text{{IEEE 754 Single Precision (binary32)}} \\
\text{{Total Bits}} &= S(1) + E(8) + F(23) = 32 \\
\text{{Exponent Bias}} &= 2^{{8-1}} - 1 = 2^7 - 1 = 127
\end{{aligned}}"
        ),
        Precision::Double => format!(
            r"\begin{{aligned}}
\text{{Format}} &= \text{{IEEE 754 Double Precision (binary64)}} \\
\text{{Total Bits}} &= S(1) + E(11) + F(52) = 64 \\
\text{{Exponent Bias}} &= 2^{{11-1}} - 1 = 2^{{10}} - 1 = 1023
\end{{aligned}}"
        ),
    };

    Step1InputAnalysis {
        raw_input: parsed.raw.clone(),
        precision,
        total_bits: total as u32,
        sign_bits: 1,
        exponent_bits: exp_bits as u32,
        fraction_bits: frac_bits as u32,
        bias,
        category,
        latex_formula: latex,
    }
}

pub fn build_step2(parsed: &ParsedInput, sign_bit: u8) -> Step2SignBit {
    let latex_formula = r"S = \begin{cases} 0, & x \ge 0 \text{ (positive or } +0\text{)} \\ 1, & x < 0 \text{ or } x = -0 \end{cases}".to_string();

    let (explanation, latex_sub) = if parsed.is_negative_zero {
        (
            format!("The input value is negative zero (-0). IEEE 754 strictly distinguishes between +0 and -0, setting the sign bit to 1."),
            r"x = -0 \implies S = 1 \quad \text{(Preserved negative zero)}".to_string(),
        )
    } else if parsed.is_nan {
        (
            format!("The input is NaN (Not a Number). Sign bit is {}.", sign_bit),
            format!(r"\text{{NaN}} \implies S = {}", sign_bit),
        )
    } else if parsed.is_negative {
        (
            format!("The input value is negative ({} < 0), so the sign bit S is 1.", parsed.raw),
            format!(r"{} < 0 \implies S = 1", parsed.raw),
        )
    } else {
        (
            format!("The input value is positive or zero ({} ≥ 0), so the sign bit S is 0.", parsed.raw),
            format!(r"{} \ge 0 \implies S = 0", parsed.raw),
        )
    };

    Step2SignBit {
        sign_bit,
        is_negative: parsed.is_negative,
        is_negative_zero: parsed.is_negative_zero,
        explanation,
        latex_formula,
        latex_substitution: latex_sub,
    }
}

pub fn build_step3(parsed: &ParsedInput, precision: Precision, category: NumberCategory) -> Step3DecimalToBinary {
    if category == NumberCategory::NaN {
        return Step3DecimalToBinary {
            integer_part_dec: "NaN".to_string(),
            fractional_part_dec: "".to_string(),
            integer_division_rows: Vec::new(),
            integer_binary: "NaN".to_string(),
            fractional_multiplication_rows: Vec::new(),
            fractional_binary: "".to_string(),
            is_fraction_terminating: true,
            combined_binary_unnormalized: "NaN".to_string(),
            explanation: "NaN does not correspond to a finite real number.".to_string(),
        };
    }

    if category == NumberCategory::Infinity {
        return Step3DecimalToBinary {
            integer_part_dec: "Infinity".to_string(),
            fractional_part_dec: "".to_string(),
            integer_division_rows: Vec::new(),
            integer_binary: "∞".to_string(),
            fractional_multiplication_rows: Vec::new(),
            fractional_binary: "".to_string(),
            is_fraction_terminating: true,
            combined_binary_unnormalized: "∞".to_string(),
            explanation: "Infinity is represented using all ones in the exponent field and all zeros in the fraction field.".to_string(),
        };
    }

    // 1. Integer Part: Repeated division by 2
    let mut int_rows = Vec::new();
    let mut int_bits = Vec::new();

    let int_str = &parsed.integer_str;
    if int_str.is_empty() || int_str == "0" {
        int_rows.push(DivisionRow {
            division: "0 ÷ 2".to_string(),
            quotient: "0".to_string(),
            remainder: "0".to_string(),
        });
        int_bits.push('0');
    } else if let Ok(mut curr) = int_str.parse::<u128>() {
        let mut count = 0;
        while curr > 0 && count < 64 {
            let rem = curr % 2;
            let next_val = curr / 2;
            int_rows.push(DivisionRow {
                division: format!("{} ÷ 2", curr),
                quotient: format!("{}", next_val),
                remainder: format!("{}", rem),
            });
            int_bits.push(if rem == 1 { '1' } else { '0' });
            curr = next_val;
            count += 1;
        }
    } else {
        // Fallback for massive integers
        let mut curr_f64 = parsed.f64_val.abs().trunc();
        let mut count = 0;
        while curr_f64 >= 1.0 && count < 64 {
            let rem = (curr_f64 % 2.0) as u8;
            let next_val = (curr_f64 / 2.0).trunc();
            int_rows.push(DivisionRow {
                division: format!("{:.0} ÷ 2", curr_f64),
                quotient: format!("{:.0}", next_val),
                remainder: format!("{}", rem),
            });
            int_bits.push(if rem == 1 { '1' } else { '0' });
            curr_f64 = next_val;
            count += 1;
        }
    }
    // Read remainders from bottom to top
    let integer_binary: String = int_bits.into_iter().rev().collect();

    // 2. Fractional Part: Exact digit-by-digit decimal multiplication by 2
    let mut frac_rows = Vec::new();
    let mut frac_bits = String::new();
    let mut is_terminating = false;

    let frac_str = &parsed.fractional_str;
    let int_is_zero = integer_binary == "0";
    let target_significant_bits = match precision {
        Precision::Single => 23 + 3,
        Precision::Double => 52 + 3,
    };
    let max_frac_steps = if int_is_zero { 80 } else { target_significant_bits + 5 };

    if frac_str.is_empty() || frac_str == "0" {
        is_terminating = true;
        frac_rows.push(MultiplicationRow {
            step: 1,
            expression: "0.0 × 2 = 0.0".to_string(),
            integer_bit: "0".to_string(),
            remaining_fraction: "0.0".to_string(),
        });
        frac_bits.push('0');
    } else {
        let mut current_digits: Vec<u8> = frac_str
            .chars()
            .filter_map(|c| c.to_digit(10).map(|d| d as u8))
            .collect();

        let mut step: u32 = 1;
        while (step as usize) <= max_frac_steps {
            let curr_str = digits_to_string(&current_digits);
            let (bit, next_digits) = mul2_decimal_digits(&current_digits);
            let next_str = digits_to_string(&next_digits);

            frac_rows.push(MultiplicationRow {
                step,
                expression: format!("0.{} × 2 = {}.{}", curr_str, bit, next_str),
                integer_bit: bit.to_string(),
                remaining_fraction: format!("0.{}", next_str),
            });

            frac_bits.push(if bit == 1 { '1' } else { '0' });

            if next_digits.iter().all(|&d| d == 0) {
                is_terminating = true;
                break;
            }

            current_digits = next_digits;
            step += 1;
        }
    }

    let combined_binary = if integer_binary == "0" && (frac_str.is_empty() || frac_str == "0") {
        "0.0".to_string()
    } else if frac_str.is_empty() || frac_str == "0" {
        format!("{}.0", integer_binary)
    } else {
        format!("{}.{}", integer_binary, frac_bits)
    };

    let explanation = if is_terminating {
        format!("The fractional part terminates completely within {} multiplication steps.", frac_rows.len())
    } else {
        format!(
            "The fractional part does not terminate within {} binary digits (it repeats or continues indefinitely). IEEE 754 rounds the remaining significand.",
            frac_rows.len()
        )
    };

    // Cap the displayed multiplication table to at most 32 rows to preserve UI responsiveness
    let displayed_frac_rows = if frac_rows.len() > 32 {
        frac_rows[..32].to_vec()
    } else {
        frac_rows
    };

    Step3DecimalToBinary {
        integer_part_dec: int_str.clone(),
        fractional_part_dec: frac_str.clone(),
        integer_division_rows: int_rows,
        integer_binary,
        fractional_multiplication_rows: displayed_frac_rows,
        fractional_binary: frac_bits,
        is_fraction_terminating: is_terminating,
        combined_binary_unnormalized: combined_binary,
        explanation,
    }
}

fn mul2_decimal_digits(digits: &[u8]) -> (u8, Vec<u8>) {
    let mut next = vec![0u8; digits.len()];
    let mut carry = 0u8;
    for i in (0..digits.len()).rev() {
        let prod = digits[i] * 2 + carry;
        next[i] = prod % 10;
        carry = prod / 10;
    }
    (carry, next)
}

fn digits_to_string(digits: &[u8]) -> String {
    digits.iter().map(|&d| (b'0' + d) as char).collect()
}

pub fn build_step4(
    parsed: &ParsedInput,
    precision: Precision,
    category: NumberCategory,
    exponent_raw: u32,
    step3: &Step3DecimalToBinary,
) -> Step4Normalization {
    let bias = precision.bias();

    if category == NumberCategory::Zero {
        return Step4Normalization {
            binary_before: "0.0".to_string(),
            normalized_form: "0.0 × 2^0".to_string(),
            unbiased_exponent: 0,
            shift_amount: 0,
            shift_direction: "none".to_string(),
            hidden_bit: "0".to_string(),
            is_subnormal: false,
            latex_formula: r"x = 0 \implies \text{No normalization, exponent field is 0}".to_string(),
            latex_substitution: r"0.0 \times 2^0".to_string(),
            explanation: "Zero is a special case in IEEE 754. Both the biased exponent and fraction fields are zero.".to_string(),
        };
    }

    if category == NumberCategory::Subnormal {
        let unbiased_exp = 1 - bias; // -126 or -1022
        return Step4Normalization {
            binary_before: step3.combined_binary_unnormalized.clone(),
            normalized_form: format!("0.{} × 2^{{{}}}", step3.fractional_binary, unbiased_exp),
            unbiased_exponent: unbiased_exp,
            shift_amount: 0,
            shift_direction: "subnormal".to_string(),
            hidden_bit: "0".to_string(),
            is_subnormal: true,
            latex_formula: match precision {
                Precision::Single => r"x = (-1)^S \times 0.F \times 2^{-126} \quad (e_{\min} = -126)".to_string(),
                Precision::Double => r"x = (-1)^S \times 0.F \times 2^{-1022} \quad (e_{\min} = -1022)".to_string(),
            },
            latex_substitution: format!(r"e = {} \quad \text{{(Implicit leading bit is 0, not 1)}}", unbiased_exp),
            explanation: format!(
                "This number is subnormal (magnitude too small to normalize without exponent underflow). The implicit leading bit is 0, and the effective exponent is fixed at 1 - Bias = {}.",
                unbiased_exp
            ),
        };
    }

    if category == NumberCategory::Infinity || category == NumberCategory::NaN {
        return Step4Normalization {
            binary_before: parsed.raw.clone(),
            normalized_form: parsed.raw.clone(),
            unbiased_exponent: 0,
            shift_amount: 0,
            shift_direction: "none".to_string(),
            hidden_bit: "N/A".to_string(),
            is_subnormal: false,
            latex_formula: r"\text{Special Value: Exponent field is all 1s}".to_string(),
            latex_substitution: parsed.raw.clone(),
            explanation: "Special values (Infinity and NaN) bypass normalization and are encoded with a maximum exponent field.".to_string(),
        };
    }

    // Normal numbers
    let unbiased_exp = (exponent_raw as i32) - bias;
    let (shift_amount, shift_direction) = if unbiased_exp > 0 {
        (unbiased_exp, "left".to_string())
    } else if unbiased_exp < 0 {
        (-unbiased_exp, "right".to_string())
    } else {
        (0, "none".to_string())
    };

    let int_part = &step3.integer_binary;
    let frac_part = &step3.fractional_binary;

    let normalized_significand = if unbiased_exp >= 0 {
        let first_bit = '1';
        let remaining_int = if int_part.len() > 1 { &int_part[1..] } else { "" };
        let combined = format!("{}{}", remaining_int, frac_part);
        let trimmed = combined.trim_end_matches('0');
        if trimmed.is_empty() {
            format!("{}.0", first_bit)
        } else {
            format!("{}.{}", first_bit, trimmed)
        }
    } else {
        // For numbers < 1: first '1' occurs in the fractional part
        if let Some(pos) = frac_part.find('1') {
            let after_one = &frac_part[pos + 1..];
            let trimmed = after_one.trim_end_matches('0');
            if trimmed.is_empty() {
                "1.0".to_string()
            } else {
                format!("1.{}", trimmed)
            }
        } else {
            "1.0".to_string()
        }
    };

    let normalized_form = format!("{}₂ × 2^{{{}}}", normalized_significand, unbiased_exp);
    let latex_formula = if parsed.is_negative {
        r"x = (-1)^1 \times 1.F \times 2^e".to_string()
    } else {
        r"x = (-1)^0 \times 1.F \times 2^e = 1.F \times 2^e".to_string()
    };

    let latex_sub = if parsed.is_negative {
        format!(
            r"\begin{{aligned}}
|x| &= {}_2 \\
    &= {}_2 \times 2^{{{}}} \\
\implies x &= (-1)^1 \times {}_2 \times 2^{{{}}} \\
\implies e &= {}
\end{{aligned}}",
            step3.combined_binary_unnormalized, normalized_significand, unbiased_exp, normalized_significand, unbiased_exp, unbiased_exp
        )
    } else {
        format!(
            r"\begin{{aligned}}
x &= {}_2 \\
  &= {}_2 \times 2^{{{}}} \\
\implies e &= {}
\end{{aligned}}",
            step3.combined_binary_unnormalized, normalized_significand, unbiased_exp, unbiased_exp
        )
    };

    let explanation = format!(
        "The binary point was shifted {} position(s) to the {} to place exactly one non-zero digit (1) before the binary point, giving unbiased exponent e = {}.",
        shift_amount, shift_direction, unbiased_exp
    );

    Step4Normalization {
        binary_before: format!("{}_2", step3.combined_binary_unnormalized),
        normalized_form,
        unbiased_exponent: unbiased_exp,
        shift_amount,
        shift_direction,
        hidden_bit: "1".to_string(),
        is_subnormal: false,
        latex_formula,
        latex_substitution: latex_sub,
        explanation,
    }
}

pub fn build_step5(
    precision: Precision,
    category: NumberCategory,
    exponent_raw: u32,
    step4: &Step4Normalization,
) -> Step5BiasedExponent {
    let bias = precision.bias();
    let exp_bits = precision.exponent_bits();
    let exponent_binary = format!("{:0width$b}", exponent_raw, width = exp_bits);

    let mut div_rows = Vec::new();
    if exponent_raw > 0 {
        let mut curr = exponent_raw;
        while curr > 0 {
            let rem = curr % 2;
            let next_val = curr / 2;
            div_rows.push(DivisionRow {
                division: format!("{} ÷ 2", curr),
                quotient: format!("{}", next_val),
                remainder: format!("{}", rem),
            });
            curr = next_val;
        }
    } else {
        div_rows.push(DivisionRow {
            division: "0 ÷ 2".to_string(),
            quotient: "0".to_string(),
            remainder: "0".to_string(),
        });
    }

    let latex_formula = match precision {
        Precision::Single => r"E = e + \text{Bias} = e + 127".to_string(),
        Precision::Double => r"E = e + \text{Bias} = e + 1023".to_string(),
    };

    let (latex_sub, latex_res, explanation) = match category {
        NumberCategory::Zero => (
            r"E = 0 \quad \text{(Zero is encoded with all-zero exponent field)}".to_string(),
            format!(r"E_{{(2)}} = {}_2", exponent_binary),
            "Zero is represented with an exponent field of 0.".to_string(),
        ),
        NumberCategory::Subnormal => (
            r"E = 0 \quad \text{(Subnormal numbers use an exponent field of 0)}".to_string(),
            format!(r"E_{{(2)}} = {}_2", exponent_binary),
            format!(
                "Subnormal numbers are explicitly identified by an all-zero exponent field (E = 0), representing effective exponent {}.",
                step4.unbiased_exponent
            ),
        ),
        NumberCategory::Infinity => (
            format!(r"E = 2^{{{}}} - 1 = {} \quad \text{{(All ones for Infinity)}}", exp_bits, exponent_raw),
            format!(r"E_{{(2)}} = {}_2", exponent_binary),
            "Infinity is encoded with the maximum possible exponent (all 1s) and a zero fraction.".to_string(),
        ),
        NumberCategory::NaN => (
            format!(r"E = 2^{{{}}} - 1 = {} \quad \text{{(All ones for NaN)}}", exp_bits, exponent_raw),
            format!(r"E_{{(2)}} = {}_2", exponent_binary),
            "NaN is encoded with the maximum possible exponent (all 1s) and a non-zero fraction.".to_string(),
        ),
        NumberCategory::Normal => (
            format!(
                r"\begin{{aligned}}
E &= e + \text{{Bias}} \\
  &= {} + {} \\
  &= {}
\end{{aligned}}",
                step4.unbiased_exponent, bias, exponent_raw
            ),
            format!(r"E_{{(2)}} = {}_2", exponent_binary),
            format!(
                "Adding the bias ({}) to the unbiased exponent ({}) yields the biased exponent {} (in binary: {}).",
                bias, step4.unbiased_exponent, exponent_raw, exponent_binary
            ),
        ),
    };

    Step5BiasedExponent {
        unbiased_exponent: step4.unbiased_exponent,
        bias,
        biased_exponent: exponent_raw,
        exponent_binary,
        division_rows: div_rows,
        latex_formula,
        latex_substitution: latex_sub,
        latex_result: latex_res,
        explanation,
    }
}

pub fn build_step6(
    precision: Precision,
    category: NumberCategory,
    fraction_raw: u64,
    step3: &Step3DecimalToBinary,
    step4: &Step4Normalization,
) -> Step6FractionField {
    let target_bits = precision.fraction_bits();
    let frac_binary = format!("{:0width$b}", fraction_raw, width = target_bits);

    if category == NumberCategory::Zero {
        return Step6FractionField {
            significand_with_hidden: "0.0".to_string(),
            raw_fraction_bits: "0".repeat(target_bits),
            target_bit_length: target_bits as u32,
            final_fraction_bits: frac_binary,
            guard_bit: None,
            round_bit: None,
            sticky_bit: None,
            did_round: false,
            round_caused_exponent_increment: false,
            latex_formula: r"F = 0 \quad (\text{all } 0\text{s for zero})".to_string(),
            explanation: "Zero is encoded with all zeros in the fraction field.".to_string(),
        };
    }

    if category == NumberCategory::Infinity {
        return Step6FractionField {
            significand_with_hidden: "∞".to_string(),
            raw_fraction_bits: "0".repeat(target_bits),
            target_bit_length: target_bits as u32,
            final_fraction_bits: frac_binary,
            guard_bit: None,
            round_bit: None,
            sticky_bit: None,
            did_round: false,
            round_caused_exponent_increment: false,
            latex_formula: r"F = 0 \quad (\text{all } 0\text{s for Infinity})".to_string(),
            explanation: "Infinity is represented with all zeros in the fraction field.".to_string(),
        };
    }

    if category == NumberCategory::NaN {
        return Step6FractionField {
            significand_with_hidden: "NaN".to_string(),
            raw_fraction_bits: frac_binary.clone(),
            target_bit_length: target_bits as u32,
            final_fraction_bits: frac_binary,
            guard_bit: None,
            round_bit: None,
            sticky_bit: None,
            did_round: false,
            round_caused_exponent_increment: false,
            latex_formula: r"F \neq 0 \quad (\text{non-zero payload for NaN})".to_string(),
            explanation: "NaN (Not-a-Number) must maintain a non-zero fraction field.".to_string(),
        };
    }

    if category == NumberCategory::Subnormal {
        return Step6FractionField {
            significand_with_hidden: format!("0.{}", step3.fractional_binary),
            raw_fraction_bits: frac_binary.clone(),
            target_bit_length: target_bits as u32,
            final_fraction_bits: frac_binary.clone(),
            guard_bit: None,
            round_bit: None,
            sticky_bit: None,
            did_round: false,
            round_caused_exponent_increment: false,
            latex_formula: format!(r"F = {}_2 \quad (\text{{Subnormal significand}})", frac_binary),
            explanation: "For subnormal numbers, the leading bit is explicitly 0 (not 1). The fraction field stores the significand bits directly.".to_string(),
        };
    }

    // Normal numbers: Reconstruct candidate stream after the leading implicit 1
    let raw_stream = if step3.integer_binary != "0" && !step3.integer_binary.is_empty() {
        let int_tail = if step3.integer_binary.len() > 1 {
            &step3.integer_binary[1..]
        } else {
            ""
        };
        format!("{}{}", int_tail, step3.fractional_binary)
    } else if let Some(pos) = step3.fractional_binary.find('1') {
        step3.fractional_binary[pos + 1..].to_string()
    } else {
        String::new()
    };

    let stream_len = raw_stream.len();
    if stream_len <= target_bits {
        let padded = format!("{:0<width$}", raw_stream, width = target_bits);
        let zeros_added = target_bits - stream_len;
        Step6FractionField {
            significand_with_hidden: step4.normalized_form.clone(),
            raw_fraction_bits: padded.clone(),
            target_bit_length: target_bits as u32,
            final_fraction_bits: padded,
            guard_bit: Some('0'),
            round_bit: Some('0'),
            sticky_bit: Some('0'),
            did_round: false,
            round_caused_exponent_increment: false,
            latex_formula: format!(
                r"\begin{{aligned}}
\text{{Available bits after leading 1: }} &{} \text{{ bits}} \\
\text{{Target field width: }} &{} \text{{ bits}} \\
\text{{Trailing zeros appended: }} &{} \text{{ zeros}}
\end{{aligned}}",
                stream_len, target_bits, zeros_added
            ),
            explanation: format!(
                "The binary significand terminates within {} bit(s) after the hidden bit 1. Exactly {} trailing zero(s) were appended to fill the required {}-bit fraction field with zero rounding error.",
                stream_len, zeros_added, target_bits
            ),
        }
    } else {
        let raw_frac = &raw_stream[..target_bits];
        let g = raw_stream.chars().nth(target_bits).unwrap_or('0');
        let r = raw_stream.chars().nth(target_bits + 1).unwrap_or('0');
        let remaining_ones = raw_stream.chars().skip(target_bits + 2).any(|c| c == '1');
        let s = if remaining_ones || !step3.is_fraction_terminating { '1' } else { '0' };

        let lsb = raw_frac.chars().last().unwrap_or('0');
        let round_up = match (g, r, s) {
            ('0', _, _) => false,
            ('1', '1', _) | ('1', _, '1') => true,
            ('1', '0', '0') => lsb == '1', // halfway tie: round to nearest even LSB
            _ => false,
        };

        let all_ones = raw_frac.chars().all(|c| c == '1');
        let exp_inc = round_up && all_ones;

        let latex_formula = format!(
            r"\begin{{aligned}}
\text{{Truncated fraction }} (F_{{raw}}): &{} \\
\text{{Guard bit }} (G): &{} \\
\text{{Round bit }} (R): &{} \\
\text{{Sticky bit }} (S): &{} \\
\text{{Rounding condition: }} &\begin{{cases}} G=1 \land (R=1 \lor S=1) \implies \text{{Round Up}} \\ G=1 \land R=0 \land S=0 \implies \text{{Tie to Even (LSB={})}} \\ G=0 \implies \text{{Round Down (Truncate)}} \end{{cases}}
\end{{aligned}}",
            raw_frac, g, r, s, lsb
        );

        let explanation = if round_up {
            format!(
                "Guard bit G={}, Round bit R={}, Sticky bit S={}. Under IEEE 754 round-to-nearest (ties-to-even), the discarded bits are strictly greater than half an ULP (or an exact tie with an odd LSB={}), triggering a round-up (+1 added to fraction).{}",
                g, r, s, lsb,
                if exp_inc { " All fraction bits wrapped from 1 to 0, which propagated a carry into the biased exponent (E + 1)!" } else { "" }
            )
        } else {
            format!(
                "Guard bit G={}, Round bit R={}, Sticky bit S={}. Under IEEE 754 round-to-nearest (ties-to-even), the discarded bits are less than half an ULP (or an exact tie with an even LSB={}), so the fraction is truncated without incrementing.",
                g, r, s, lsb
            )
        };

        Step6FractionField {
            significand_with_hidden: step4.normalized_form.clone(),
            raw_fraction_bits: raw_frac.to_string(),
            target_bit_length: target_bits as u32,
            final_fraction_bits: frac_binary,
            guard_bit: Some(g),
            round_bit: Some(r),
            sticky_bit: Some(s),
            did_round: round_up,
            round_caused_exponent_increment: exp_inc,
            latex_formula,
            explanation,
        }
    }
}

pub fn build_step7(
    sign_str: &str,
    exp_str: &str,
    frac_str: &str,
    complete_bits: &str,
    precision: Precision,
) -> Step7BitPatternAssembly {
    let formatted = format!("{} {} {}", sign_str, exp_str, frac_str);

    let explanation = format!(
        "Assembling the Sign ({} bit), Exponent ({} bits), and Fraction ({} bits) produces the final {}-bit IEEE 754 representation.",
        1,
        precision.exponent_bits(),
        precision.fraction_bits(),
        precision.total_bits()
    );

    Step7BitPatternAssembly {
        sign_bit: sign_str.to_string(),
        exponent_bits: exp_str.to_string(),
        fraction_bits: frac_str.to_string(),
        complete_bit_pattern: complete_bits.to_string(),
        formatted_bit_pattern: formatted,
        explanation,
    }
}

pub fn build_step8(complete_bits: &str, hex_string: &str, precision: Precision) -> Step8HexConversion {
    let mut nibbles = Vec::new();
    let num_nibbles = precision.total_bits() / 4;
    let exp_bits = precision.exponent_bits();

    for i in 0..num_nibbles {
        let start = i * 4;
        let end = start + 4;
        let nibble_bits = &complete_bits[start..end];
        let val = u8::from_str_radix(nibble_bits, 2).unwrap_or(0);
        let hex_char = format!("{:X}", val);

        let bit_from = precision.total_bits() - 1 - start;
        let bit_to = precision.total_bits() - end;
        let bit_range = format!("Bits {}-{}", bit_from, bit_to);

        // Determine field origin
        let field_type = if i == 0 {
            "Sign + Exponent".to_string()
        } else if end <= 1 + exp_bits {
            "Exponent".to_string()
        } else if start < 1 + exp_bits && end > 1 + exp_bits {
            "Exponent + Fraction".to_string()
        } else {
            "Fraction".to_string()
        };

        nibbles.push(NibbleConversion {
            index: (i + 1) as u32,
            binary: nibble_bits.to_string(),
            hex: hex_char,
            bit_range,
            field_type,
        });
    }

    let explanation = format!(
        "The {}-bit binary pattern is partitioned into {} groups of 4 bits (nibbles), each directly mapped to one hexadecimal digit.",
        precision.total_bits(),
        num_nibbles
    );

    Step8HexConversion {
        nibbles,
        hex_string: hex_string.to_string(),
        explanation,
    }
}

pub fn build_step9(
    parsed: &ParsedInput,
    precision: Precision,
    category: NumberCategory,
    sign_bit: u8,
    exp_bits: &str,
    frac_bits: &str,
    complete_bits: &str,
    hex_string: &str,
) -> Step9FinalResult {
    let (exact_decoded, diff_str, is_exact) = match precision {
        Precision::Single => {
            let val = parsed.f32_val;
            if val.is_nan() {
                ("NaN".to_string(), "0".to_string(), true)
            } else if val.is_infinite() {
                (if val.is_sign_negative() { "-Infinity".to_string() } else { "Infinity".to_string() }, "0".to_string(), true)
            } else {
                let exact_str = format!("{}", val);
                let diff = (parsed.f64_val - (val as f64)).abs();
                let matches_input = parsed.raw == exact_str || parsed.raw == format!("{:.20}", val).trim_end_matches('0').trim_end_matches('.');
                let is_exact = diff == 0.0 || (matches_input && diff < 1e-12);
                let diff_display = if is_exact {
                    "0 (Exact representation)".to_string()
                } else {
                    format!("{:.8e}", diff)
                };
                (format!("{:.10}", val).trim_end_matches('0').trim_end_matches('.').to_string(), diff_display, is_exact)
            }
        }
        Precision::Double => {
            let val = parsed.f64_val;
            if val.is_nan() {
                ("NaN".to_string(), "0".to_string(), true)
            } else if val.is_infinite() {
                (if val.is_sign_negative() { "-Infinity".to_string() } else { "Infinity".to_string() }, "0".to_string(), true)
            } else {
                let exact_str = format!("{}", val);
                let matches_input = parsed.raw == exact_str;
                let is_exact = matches_input;
                let diff_display = if is_exact {
                    "0 (Exact representation)".to_string()
                } else {
                    "Difference due to finite IEEE 754 precision (inexact binary representation)".to_string()
                };
                (exact_str, diff_display, is_exact)
            }
        }
    };

    let explanation = if is_exact {
        format!(
            "The decimal number {} has an exact finite binary representation in {} and is encoded with zero representation error.",
            parsed.raw,
            precision.short_name()
        )
    } else {
        format!(
            "The decimal number {} cannot be represented exactly in {} binary floating-point. The stored value {} is the closest representable value under IEEE 754 round-to-nearest (ties-to-even).",
            parsed.raw,
            precision.short_name(),
            exact_decoded
        )
    };

    Step9FinalResult {
        raw_input: parsed.raw.clone(),
        precision,
        category,
        sign_bit,
        exponent_binary: exp_bits.to_string(),
        fraction_binary: frac_bits.to_string(),
        complete_bits: complete_bits.to_string(),
        hex_string: hex_string.to_string(),
        exact_decoded_decimal: exact_decoded,
        difference: diff_str,
        is_exact,
        explanation,
    }
}
