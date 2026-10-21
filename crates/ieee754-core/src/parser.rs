use crate::types::Precision;

#[derive(Debug, Clone)]
pub struct ParsedInput {
    pub raw: String,
    pub is_negative: bool,
    pub is_negative_zero: bool,
    pub is_infinity: bool,
    pub is_nan: bool,
    pub is_zero: bool,
    pub f32_val: f32,
    pub f64_val: f64,
    pub integer_str: String,
    pub fractional_str: String,
}

impl ParsedInput {
    pub fn parse(input: &str, precision: Precision) -> Result<Self, String> {
        let trimmed = input.trim();
        if trimmed.is_empty() {
            return Err("Input cannot be empty".to_string());
        }

        let is_negative = trimmed.starts_with('-');
        let abs_str = if is_negative || trimmed.starts_with('+') {
            &trimmed[1..]
        } else {
            trimmed
        };

        // Check for special names
        let lower = abs_str.to_lowercase();
        if lower == "nan" {
            let f32_val = if is_negative { -f32::NAN } else { f32::NAN };
            let f64_val = if is_negative { -f64::NAN } else { f64::NAN };
            return Ok(Self {
                raw: trimmed.to_string(),
                is_negative,
                is_negative_zero: false,
                is_infinity: false,
                is_nan: true,
                is_zero: false,
                f32_val,
                f64_val,
                integer_str: "NaN".to_string(),
                fractional_str: "".to_string(),
            });
        }

        if lower == "inf" || lower == "infinity" {
            let f32_val = if is_negative { f32::NEG_INFINITY } else { f32::INFINITY };
            let f64_val = if is_negative { f64::NEG_INFINITY } else { f64::INFINITY };
            return Ok(Self {
                raw: trimmed.to_string(),
                is_negative,
                is_negative_zero: false,
                is_infinity: true,
                is_nan: false,
                is_zero: false,
                f32_val,
                f64_val,
                integer_str: "Infinity".to_string(),
                fractional_str: "".to_string(),
            });
        }

        // Standard numerical parsing
        let f64_parsed: f64 = trimmed.parse().map_err(|e| format!("Invalid numerical format: {}", e))?;
        let f32_parsed: f32 = trimmed.parse().map_err(|e| format!("Invalid numerical format for single precision: {}", e))?;

        let is_zero = f64_parsed == 0.0;
        let is_neg_zero = is_zero && (is_negative || f64_parsed.is_sign_negative());

        // Split integer and fractional parts for educational display
        let (int_part, frac_part) = extract_int_and_frac(abs_str, f64_parsed.abs());

        Ok(Self {
            raw: trimmed.to_string(),
            is_negative: is_neg_zero || (f64_parsed.is_sign_negative() && !f64_parsed.is_nan()),
            is_negative_zero: is_neg_zero,
            is_infinity: match precision {
                Precision::Single => f32_parsed.is_infinite(),
                Precision::Double => f64_parsed.is_infinite(),
            },
            is_nan: match precision {
                Precision::Single => f32_parsed.is_nan(),
                Precision::Double => f64_parsed.is_nan(),
            },
            is_zero,
            f32_val: if is_neg_zero { -0.0_f32 } else { f32_parsed },
            f64_val: if is_neg_zero { -0.0_f64 } else { f64_parsed },
            integer_str: int_part,
            fractional_str: frac_part,
        })
    }
}

fn extract_int_and_frac(abs_str: &str, _f64_val: f64) -> (String, String) {
    let lower = abs_str.to_lowercase();
    if lower == "nan" || lower == "inf" || lower == "infinity" {
        return (abs_str.to_string(), "".to_string());
    }

    if lower.contains('e') {
        // Expand scientific notation accurately into exact decimal integer and fraction strings
        if let Some((mantissa, exp_s)) = lower.split_once('e') {
            if let Ok(exp) = exp_s.parse::<i32>() {
                let (int_part, frac_part) = if let Some((i, f)) = mantissa.split_once('.') {
                    (i, f)
                } else {
                    (mantissa, "")
                };

                let combined_digits = format!("{}{}", int_part, frac_part);
                let original_dot_pos = int_part.len() as i32;
                let new_dot_pos = original_dot_pos + exp;

                if new_dot_pos <= 0 {
                    let leading_zeros = (-new_dot_pos) as usize;
                    let zeros = "0".repeat(leading_zeros);
                    let frac = format!("{}{}", zeros, combined_digits);
                    let trimmed_frac = frac.trim_end_matches('0');
                    return ("0".to_string(), if trimmed_frac.is_empty() { "0".to_string() } else { trimmed_frac.to_string() });
                } else {
                    let dot_idx = new_dot_pos as usize;
                    if dot_idx < combined_digits.len() {
                        let int_p = &combined_digits[..dot_idx];
                        let clean_int = int_p.trim_start_matches('0');
                        let frac_p = combined_digits[dot_idx..].trim_end_matches('0');
                        return (
                            if clean_int.is_empty() { "0".to_string() } else { clean_int.to_string() },
                            frac_p.to_string(),
                        );
                    } else {
                        let trailing_zeros = dot_idx - combined_digits.len();
                        let int_p = format!("{}{}", combined_digits, "0".repeat(trailing_zeros));
                        let clean_int = int_p.trim_start_matches('0');
                        return (
                            if clean_int.is_empty() { "0".to_string() } else { clean_int.to_string() },
                            "".to_string(),
                        );
                    }
                }
            }
        }
    }

    if let Some((int_s, frac_s)) = abs_str.split_once('.') {
        let clean_int = if int_s.is_empty() { "0" } else { int_s.trim_start_matches('0') };
        let final_int = if clean_int.is_empty() { "0" } else { clean_int };
        let clean_frac = frac_s.trim_end_matches('0');
        (final_int.to_string(), clean_frac.to_string())
    } else {
        let clean_int = abs_str.trim_start_matches('0');
        let final_int = if clean_int.is_empty() { "0" } else { clean_int };
        (final_int.to_string(), "".to_string())
    }
}
