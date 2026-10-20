use crate::parser::ParsedInput;
use crate::types::*;

pub fn convert(input_str: &str, precision: Precision) -> Result<ConversionResult, String> {
    let parsed = ParsedInput::parse(input_str, precision)?;

    let (bits_raw, category, sign_bit, exponent_raw, fraction_raw) = match precision {
        Precision::Single => {
            let f = parsed.f32_val;
            let bits = f.to_bits() as u64;
            let sign = ((bits >> 31) & 1) as u8;
            let exp = ((bits >> 23) & 0xFF) as u32;
            let frac = bits & 0x7FFFFF;

            let cat = if exp == 0 && frac == 0 {
                NumberCategory::Zero
            } else if exp == 0 && frac != 0 {
                NumberCategory::Subnormal
            } else if exp == 0xFF && frac == 0 {
                NumberCategory::Infinity
            } else if exp == 0xFF && frac != 0 {
                NumberCategory::NaN
            } else {
                NumberCategory::Normal
            };

            (bits, cat, sign, exp, frac)
        }
        Precision::Double => {
            let f = parsed.f64_val;
            let bits = f.to_bits();
            let sign = ((bits >> 63) & 1) as u8;
            let exp = ((bits >> 52) & 0x7FF) as u32;
            let frac = bits & 0xFFFFFFFFFFFFF;

            let cat = if exp == 0 && frac == 0 {
                NumberCategory::Zero
            } else if exp == 0 && frac != 0 {
                NumberCategory::Subnormal
            } else if exp == 0x7FF && frac == 0 {
                NumberCategory::Infinity
            } else if exp == 0x7FF && frac != 0 {
                NumberCategory::NaN
            } else {
                NumberCategory::Normal
            };

            (bits, cat, sign, exp, frac)
        }
    };

    let _total_bits = precision.total_bits();
    let exp_bits = precision.exponent_bits();
    let frac_bits = precision.fraction_bits();

    let sign_bit_str = format!("{}", sign_bit);
    let exp_bit_str = format!("{:0width$b}", exponent_raw, width = exp_bits);
    let frac_bit_str = format!("{:0width$b}", fraction_raw, width = frac_bits);
    let complete_bits = format!("{}{}{}", sign_bit_str, exp_bit_str, frac_bit_str);

    let hex_string = match precision {
        Precision::Single => format!("0x{:08X}", bits_raw as u32),
        Precision::Double => format!("0x{:016X}", bits_raw),
    };

    // Build the 9 educational steps
    let step1 = crate::steps::build_step1(&parsed, precision, category);
    let step2 = crate::steps::build_step2(&parsed, sign_bit);
    let step3 = crate::steps::build_step3(&parsed, precision, category);
    let step4 = crate::steps::build_step4(&parsed, precision, category, exponent_raw, &step3);
    let step5 = crate::steps::build_step5(precision, category, exponent_raw, &step4);
    let step6 = crate::steps::build_step6(precision, category, fraction_raw, &step3, &step4);
    let step7 = crate::steps::build_step7(&sign_bit_str, &exp_bit_str, &frac_bit_str, &complete_bits, precision);
    let step8 = crate::steps::build_step8(&complete_bits, &hex_string, precision);
    let step9 = crate::steps::build_step9(&parsed, precision, category, sign_bit, &exp_bit_str, &frac_bit_str, &complete_bits, &hex_string);

    Ok(ConversionResult {
        raw_input: parsed.raw.clone(),
        precision,
        category,
        is_valid: true,
        error_message: None,
        bits_raw,
        bit_pattern: complete_bits,
        hex_string,
        sign_bit,
        exponent_raw,
        fraction_raw,
        step1,
        step2,
        step3,
        step4,
        step5,
        step6,
        step7,
        step8,
        step9,
    })
}
