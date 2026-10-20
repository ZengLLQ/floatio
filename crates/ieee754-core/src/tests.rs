#[cfg(test)]
mod tests {
    use crate::converter::convert;
    use crate::types::{NumberCategory, Precision};

    #[test]
    fn test_a_single_precision_126_25() {
        let res = convert("126.25", Precision::Single).expect("conversion should succeed");
        assert_eq!(res.sign_bit, 0);
        assert_eq!(res.step4.unbiased_exponent, 6);
        assert_eq!(res.step5.bias, 127);
        assert_eq!(res.step5.biased_exponent, 133);
        assert_eq!(res.step5.exponent_binary, "10000101");
        assert_eq!(res.step6.final_fraction_bits, "11111001000000000000000");
        assert_eq!(res.bit_pattern, "01000010111111001000000000000000");
        assert_eq!(res.hex_string, "0x42FC8000");
        assert_eq!(res.category, NumberCategory::Normal);
    }

    #[test]
    fn test_b_double_precision_126_25() {
        let res = convert("126.25", Precision::Double).expect("conversion should succeed");
        assert_eq!(res.sign_bit, 0);
        assert_eq!(res.step4.unbiased_exponent, 6);
        assert_eq!(res.step5.bias, 1023);
        assert_eq!(res.step5.biased_exponent, 1029);
        assert_eq!(res.step5.exponent_binary, "10000000101");
        assert_eq!(res.step6.final_fraction_bits.len(), 52);
        assert_eq!(res.hex_string, "0x405F900000000000");
        assert_eq!(res.category, NumberCategory::Normal);
    }

    #[test]
    fn test_c_single_and_double_0_1() {
        let res_single = convert("0.1", Precision::Single).expect("conversion should succeed");
        let expected_f32_bits = 0.1_f32.to_bits();
        assert_eq!(res_single.bits_raw as u32, expected_f32_bits);
        assert_eq!(res_single.hex_string, format!("0x{:08X}", expected_f32_bits));
        assert!(!res_single.step3.is_fraction_terminating);

        let res_double = convert("0.1", Precision::Double).expect("conversion should succeed");
        let expected_f64_bits = 0.1_f64.to_bits();
        assert_eq!(res_double.bits_raw, expected_f64_bits);
        assert_eq!(res_double.hex_string, format!("0x{:016X}", expected_f64_bits));
        assert!(!res_double.step3.is_fraction_terminating);
    }

    #[test]
    fn test_d_negative_value_minus_13_5() {
        let res = convert("-13.5", Precision::Single).expect("conversion should succeed");
        assert_eq!(res.sign_bit, 1);
        let expected_f32 = (-13.5_f32).to_bits();
        assert_eq!(res.bits_raw as u32, expected_f32);
        assert_eq!(res.hex_string, format!("0x{:08X}", expected_f32));
    }

    #[test]
    fn test_e_positive_and_negative_zero() {
        let res_pos = convert("0", Precision::Single).expect("pos zero should succeed");
        assert_eq!(res_pos.sign_bit, 0);
        assert_eq!(res_pos.category, NumberCategory::Zero);
        assert_eq!(res_pos.hex_string, "0x00000000");

        let res_neg = convert("-0", Precision::Single).expect("neg zero should succeed");
        assert_eq!(res_neg.sign_bit, 1);
        assert_eq!(res_neg.category, NumberCategory::Zero);
        assert_eq!(res_neg.hex_string, "0x80000000");

        let res_neg_double = convert("-0.0", Precision::Double).expect("neg zero double should succeed");
        assert_eq!(res_neg_double.sign_bit, 1);
        assert_eq!(res_neg_double.category, NumberCategory::Zero);
        assert_eq!(res_neg_double.hex_string, "0x8000000000000000");
    }

    #[test]
    fn test_f_subnormal_and_special_values() {
        // Smallest positive subnormal f32: 1.40129846e-45
        let res_subnormal = convert("1.401298464324817e-45", Precision::Single).expect("subnormal single should succeed");
        assert_eq!(res_subnormal.category, NumberCategory::Subnormal);
        assert_eq!(res_subnormal.exponent_raw, 0);
        assert_eq!(res_subnormal.fraction_raw, 1);

        // Smallest positive normal f32: 1.17549435e-38 (exp = 1, frac = 0)
        let res_normal_min = convert("1.17549435e-38", Precision::Single).expect("normal min should succeed");
        assert_eq!(res_normal_min.category, NumberCategory::Normal);
        assert_eq!(res_normal_min.exponent_raw, 1);

        // Infinity and -Infinity
        let res_inf = convert("Infinity", Precision::Single).expect("infinity should succeed");
        assert_eq!(res_inf.category, NumberCategory::Infinity);
        assert_eq!(res_inf.sign_bit, 0);
        assert_eq!(res_inf.hex_string, "0x7F800000");

        let res_neg_inf = convert("-inf", Precision::Single).expect("neg infinity should succeed");
        assert_eq!(res_neg_inf.category, NumberCategory::Infinity);
        assert_eq!(res_neg_inf.sign_bit, 1);
        assert_eq!(res_neg_inf.hex_string, "0xFF800000");

        // NaN
        let res_nan = convert("NaN", Precision::Single).expect("nan should succeed");
        assert_eq!(res_nan.category, NumberCategory::NaN);

        // Max finite single
        let res_max_f32 = convert("3.4028234663852886e+38", Precision::Single).expect("max f32 should succeed");
        assert_eq!(res_max_f32.category, NumberCategory::Normal);
        assert_eq!(res_max_f32.exponent_raw, 254);
        assert_eq!(res_max_f32.hex_string, "0x7F7FFFFF");

        // Smallest positive subnormal f64: 5e-324
        let res_subnormal_f64 = convert("5e-324", Precision::Double).expect("subnormal f64 should succeed");
        assert_eq!(res_subnormal_f64.category, NumberCategory::Subnormal);
        assert_eq!(res_subnormal_f64.exponent_raw, 0);
        assert_eq!(res_subnormal_f64.fraction_raw, 1);
        assert_eq!(res_subnormal_f64.hex_string, "0x0000000000000001");

        // Underflow to zero in f32
        let res_underflow = convert("1e-50", Precision::Single).expect("underflow should succeed");
        assert_eq!(res_underflow.category, NumberCategory::Zero);
        assert_eq!(res_underflow.hex_string, "0x00000000");
    }
}
