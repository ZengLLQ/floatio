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

fn extract_int_and_frac(abs_str: &str, f64_val: f64) -> (String, String) {
    if abs_str.contains('e') || abs_str.contains('E') {
        // If scientific notation is used, decompose the actual magnitude
        let int_val = f64_val.trunc();
        let frac_val = f64_val - int_val;
        if int_val < 1e15 {
            let int_str = format!("{:.0}", int_val);
            let frac_str = format!("{:.15}", frac_val);
            let trimmed_frac = frac_str.trim_start_matches("0.").trim_end_matches('0');
            return (int_str, trimmed_frac.to_string());
        } else {
            return (format!("{:.0}", int_val), "".to_string());
        }
    }

    if let Some((int_s, frac_s)) = abs_str.split_once('.') {
        let clean_int = if int_s.is_empty() { "0" } else { int_s };
        let clean_frac = frac_s.trim_end_matches('0');
        (clean_int.to_string(), clean_frac.to_string())
    } else {
        (abs_str.to_string(), "".to_string())
    }
}
