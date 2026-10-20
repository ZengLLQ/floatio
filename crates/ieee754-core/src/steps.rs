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
        total_bits: total,
        sign_bits: 1,
        exponent_bits: exp_bits,
        fraction_bits: frac_bits,
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

    let val = parsed.f64_val.abs();
    let int_part_u128 = val.trunc() as u128;
    let frac_part_f64 = val - (int_part_u128 as f64);

    // 1. Integer Part: Repeated division by 2
    let mut int_rows = Vec::new();
    let mut int_bits = Vec::new();

    if int_part_u128 == 0 {
        int_rows.push(DivisionRow {
            division: "0 ÷ 2".to_string(),
            quotient: "0".to_string(),
            remainder: "0".to_string(),
        });
        int_bits.push('0');
    } else {
        let mut curr = int_part_u128;
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
    }
    // Read from bottom to top
    let integer_binary: String = int_bits.into_iter().rev().collect();

    // 2. Fractional Part: Repeated multiplication by 2 using exact decimal arithmetic
    let mut frac_rows = Vec::new();
    let mut frac_bits = String::new();
    let mut is_terminating = false;

    let max_frac_steps = match precision {
        Precision::Single => 28,
        Precision::Double => 56,
    };

    let frac_str = &parsed.fractional_str;
    if frac_str.is_empty() || frac_str == "0" {
        is_terminating = true;
        frac_rows.push(MultiplicationRow {
            step: 1,
            expression: "0.0 × 2 = 0.0".to_string(),
            integer_bit: "0".to_string(),
            remaining_fraction: "0.0".to_string(),
        });
        frac_bits.push('0');
    } else if let Ok(num) = frac_str.parse::<u128>() {
        let decimals = frac_str.len().min(18);
        let den = 10u128.pow(decimals as u32);
        let mut current_num = num;
        let mut step = 1;

        while step <= max_frac_steps {
            let mult_num = current_num * 2;
            let bit = (mult_num / den) as u8;
            let rem_num = mult_num % den;

            let current_dec_str = format!("0.{:0width$}", current_num, width = decimals);
            let mult_dec_str = format!("{}.{:0width$}", bit, rem_num, width = decimals);
            let rem_dec_str = format!("0.{:0width$}", rem_num, width = decimals);

            frac_rows.push(MultiplicationRow {
                step,
                expression: format!("{} × 2 = {}", current_dec_str, mult_dec_str),
                integer_bit: bit.to_string(),
                remaining_fraction: rem_dec_str,
            });

            frac_bits.push(if bit == 1 { '1' } else { '0' });

            if rem_num == 0 {
                is_terminating = true;
                break;
            }

            current_num = rem_num;
            step += 1;
        }
    } else {
        // Fallback for non-standard formats
        let mut current_frac = frac_part_f64;
        let mut step = 1;
        while step <= max_frac_steps {
            let multiplied = current_frac * 2.0;
            let bit = if multiplied >= 1.0 { '1' } else { '0' };
            let next_frac = if multiplied >= 1.0 { multiplied - 1.0 } else { multiplied };

            frac_rows.push(MultiplicationRow {
                step,
                expression: format!("{:.6} × 2 = {:.6}", current_frac, multiplied),
                integer_bit: bit.to_string(),
                remaining_fraction: format!("{:.6}", next_frac),
            });

            frac_bits.push(bit);
            if next_frac == 0.0 {
                is_terminating = true;
                break;
            }
            current_frac = next_frac;
            step += 1;
        }
    }

    let combined_binary = if frac_part_f64 == 0.0 && int_part_u128 == 0 {
        "0.0".to_string()
    } else if frac_part_f64 == 0.0 {
        format!("{}.0", integer_binary)
    } else {
        format!("{}.{}", integer_binary, frac_bits)
    };

    let explanation = if is_terminating {
        format!("The fractional part terminates completely within {} multiplication steps.", frac_rows.len())
    } else {
        format!(
            "The fractional part does not terminate within {} binary digits (it repeats or continues indefinitely). IEEE 754 rounds the remaining significand.",
            max_frac_steps
        )
    };

    Step3DecimalToBinary {
        integer_part_dec: format!("{}", int_part_u128),
        fractional_part_dec: format!("{:.10}", frac_part_f64).trim_end_matches('0').to_string(),
        integer_division_rows: int_rows,
        integer_binary,
        fractional_multiplication_rows: frac_rows,
        fractional_binary: frac_bits,
        is_fraction_terminating: is_terminating,
        combined_binary_unnormalized: combined_binary,
        explanation,
    }
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
        let shift_pos = (-unbiased_exp) as usize;
        let bits = frac_part.as_str();
        if shift_pos <= bits.len() {
            let after_one = if shift_pos < bits.len() { &bits[shift_pos..] } else { "0" };
            format!("1.{}", after_one)
        } else {
            "1.0".to_string()
        }
    };

    let normalized_form = format!("{}₂ × 2^{{{}}}", normalized_significand, unbiased_exp);
    let latex_formula = r"x = (-1)^S \times 1.F \times 2^e".to_string();
    let latex_sub = format!(
        r"\begin{{aligned}}
x &= {}_2 \\
&= {}_2 \times 2^{{{}}} \\
\implies e &= {}
\end{{aligned}}",
        step3.combined_binary_unnormalized, normalized_significand, unbiased_exp, unbiased_exp
    );

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
    _step3: &Step3DecimalToBinary,
    step4: &Step4Normalization,
) -> Step6FractionField {
    let target_bits = precision.fraction_bits();
    let frac_binary = format!("{:0width$b}", fraction_raw, width = target_bits);

    if category == NumberCategory::Zero {
        return Step6FractionField {
            significand_with_hidden: "0.0".to_string(),
            raw_fraction_bits: "0".to_string(),
            target_bit_length: target_bits,
            final_fraction_bits: frac_binary,
            guard_bit: None,
            round_bit: None,
            sticky_bit: None,
            did_round: false,
            round_caused_exponent_increment: false,
            latex_formula: r"F = 0 \quad (\text{all } 0\text{s for zero})".to_string(),
            explanation: "Zero has an entirely zero fraction field.".to_string(),
        };
    }

    if category == NumberCategory::Infinity {
        return Step6FractionField {
            significand_with_hidden: "∞".to_string(),
            raw_fraction_bits: "0".to_string(),
            target_bit_length: target_bits,
            final_fraction_bits: frac_binary,
            guard_bit: None,
            round_bit: None,
            sticky_bit: None,
            did_round: false,
            round_caused_exponent_increment: false,
            latex_formula: r"F = 0 \quad (\text{all } 0\text{s for Infinity})".to_string(),
            explanation: "Infinity has an entirely zero fraction field.".to_string(),
        };
    }

    if category == NumberCategory::NaN {
        return Step6FractionField {
            significand_with_hidden: "NaN".to_string(),
            raw_fraction_bits: frac_binary.clone(),
            target_bit_length: target_bits,
            final_fraction_bits: frac_binary,
            guard_bit: None,
            round_bit: None,
            sticky_bit: None,
            did_round: false,
            round_caused_exponent_increment: false,
            latex_formula: r"F \neq 0 \quad (\text{non-zero for NaN})".to_string(),
            explanation: "NaN (Not a Number) must have a non-zero fraction field.".to_string(),
        };
    }

    let significand = &step4.normalized_form;
    let explanation = format!(
        "The leading bit (1 for normal numbers) is implicit and not stored. The fraction field holds exactly the {} bits immediately following the binary point.",
        target_bits
    );

    let latex_formula = match precision {
        Precision::Single => r"\text{Fraction length} = 23 \text{ bits}".to_string(),
        Precision::Double => r"\text{Fraction length} = 52 \text{ bits}".to_string(),
    };

    Step6FractionField {
        significand_with_hidden: significand.clone(),
        raw_fraction_bits: frac_binary.clone(),
        target_bit_length: target_bits,
        final_fraction_bits: frac_binary,
        guard_bit: None,
        round_bit: None,
        sticky_bit: None,
        did_round: false,
        round_caused_exponent_increment: false,
        latex_formula,
        explanation,
    }
}

pub fn build_step7(
    sign_str: &str,
    exp_str: &str,
    frac_str: &str,
    complete_bits: &str,
    precision: Precision,
) -> Step7BitPatternAssembly {
    let formatted = match precision {
        Precision::Single => format!("{} {} {}", sign_str, exp_str, frac_str),
        Precision::Double => format!("{} {} {}", sign_str, exp_str, frac_str),
    };

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
            index: i + 1,
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
                let exact_str = format!("{:.20}", val);
                let trimmed = exact_str.trim_end_matches('0').trim_end_matches('.');
                // Check if representation matches user input
                let matches_input = parsed.raw == trimmed || parsed.raw == format!("{}", val);
                let diff = (parsed.f64_val - (val as f64)).abs();
                let diff_display = if matches_input || diff == 0.0 {
                    "0 (Exact representation)".to_string()
                } else {
                    format!("{:.10e}", diff)
                };
                (trimmed.to_string(), diff_display, matches_input || diff == 0.0)
            }
        }
        Precision::Double => {
            let val = parsed.f64_val;
            if val.is_nan() {
                ("NaN".to_string(), "0".to_string(), true)
            } else if val.is_infinite() {
                (if val.is_sign_negative() { "-Infinity".to_string() } else { "Infinity".to_string() }, "0".to_string(), true)
            } else {
                let exact_str = format!("{:.30}", val);
                let trimmed = exact_str.trim_end_matches('0').trim_end_matches('.');
                let matches_input = parsed.raw == trimmed || parsed.raw == format!("{}", val);
                let diff_display = if matches_input {
                    "0 (Exact representation)".to_string()
                } else {
                    "Difference due to finite IEEE 754 precision".to_string()
                };
                (trimmed.to_string(), diff_display, matches_input)
            }
        }
    };

    let explanation = if is_exact {
        format!(
            "The decimal number {} has an exact finite binary representation in {} and is preserved with zero representation error.",
            parsed.raw,
            precision.short_name()
        )
    } else {
        format!(
            "The decimal number {} cannot be represented exactly in binary floating-point. The stored value {} is the closest representable value under IEEE 754 round-to-nearest.",
            parsed.raw,
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
