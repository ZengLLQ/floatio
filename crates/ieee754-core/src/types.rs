use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
pub enum Precision {
    Single, // 32-bit (binary32)
    Double, // 64-bit (binary64)
}

impl Precision {
    pub fn total_bits(&self) -> usize {
        match self {
            Precision::Single => 32,
            Precision::Double => 64,
        }
    }

    pub fn exponent_bits(&self) -> usize {
        match self {
            Precision::Single => 8,
            Precision::Double => 11,
        }
    }

    pub fn fraction_bits(&self) -> usize {
        match self {
            Precision::Single => 23,
            Precision::Double => 52,
        }
    }

    pub fn bias(&self) -> i32 {
        match self {
            Precision::Single => 127,
            Precision::Double => 1023,
        }
    }

    pub fn name(&self) -> &'static str {
        match self {
            Precision::Single => "Single Precision (binary32)",
            Precision::Double => "Double Precision (binary64)",
        }
    }

    pub fn short_name(&self) -> &'static str {
        match self {
            Precision::Single => "binary32",
            Precision::Double => "binary64",
        }
    }
}

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
pub enum NumberCategory {
    Zero,
    Normal,
    Subnormal,
    Infinity,
    NaN,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DivisionRow {
    pub division: String,
    pub quotient: String,
    pub remainder: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct MultiplicationRow {
    pub step: u32,
    pub expression: String,
    pub integer_bit: String,
    pub remaining_fraction: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct NibbleConversion {
    pub index: u32,
    pub binary: String,
    pub hex: String,
    pub bit_range: String,
    pub field_type: String, // "sign", "exponent", "fraction", or mixed
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Step1InputAnalysis {
    pub raw_input: String,
    pub precision: Precision,
    pub total_bits: u32,
    pub sign_bits: u32,
    pub exponent_bits: u32,
    pub fraction_bits: u32,
    pub bias: i32,
    pub category: NumberCategory,
    pub latex_formula: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Step2SignBit {
    pub sign_bit: u8,
    pub is_negative: bool,
    pub is_negative_zero: bool,
    pub explanation: String,
    pub latex_formula: String,
    pub latex_substitution: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Step3DecimalToBinary {
    pub integer_part_dec: String,
    pub fractional_part_dec: String,
    pub integer_division_rows: Vec<DivisionRow>,
    pub integer_binary: String,
    pub fractional_multiplication_rows: Vec<MultiplicationRow>,
    pub fractional_binary: String,
    pub is_fraction_terminating: bool,
    pub combined_binary_unnormalized: String,
    pub explanation: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Step4Normalization {
    pub binary_before: String,
    pub normalized_form: String,
    pub unbiased_exponent: i32,
    pub shift_amount: i32,
    pub shift_direction: String, // "left", "right", or "none"
    pub hidden_bit: String,
    pub is_subnormal: bool,
    pub latex_formula: String,
    pub latex_substitution: String,
    pub explanation: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Step5BiasedExponent {
    pub unbiased_exponent: i32,
    pub bias: i32,
    pub biased_exponent: u32,
    pub exponent_binary: String,
    pub division_rows: Vec<DivisionRow>,
    pub latex_formula: String,
    pub latex_substitution: String,
    pub latex_result: String,
    pub explanation: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Step6FractionField {
    pub significand_with_hidden: String,
    pub raw_fraction_bits: String,
    pub target_bit_length: u32,
    pub final_fraction_bits: String,
    pub guard_bit: Option<char>,
    pub round_bit: Option<char>,
    pub sticky_bit: Option<char>,
    pub did_round: bool,
    pub round_caused_exponent_increment: bool,
    pub latex_formula: String,
    pub explanation: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Step7BitPatternAssembly {
    pub sign_bit: String,
    pub exponent_bits: String,
    pub fraction_bits: String,
    pub complete_bit_pattern: String,
    pub formatted_bit_pattern: String,
    pub explanation: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Step8HexConversion {
    pub nibbles: Vec<NibbleConversion>,
    pub hex_string: String,
    pub explanation: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Step9FinalResult {
    pub raw_input: String,
    pub precision: Precision,
    pub category: NumberCategory,
    pub sign_bit: u8,
    pub exponent_binary: String,
    pub fraction_binary: String,
    pub complete_bits: String,
    pub hex_string: String,
    pub exact_decoded_decimal: String,
    pub difference: String,
    pub is_exact: bool,
    pub explanation: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ConversionResult {
    pub raw_input: String,
    pub precision: Precision,
    pub category: NumberCategory,
    pub is_valid: bool,
    pub error_message: Option<String>,
    
    // Core bit truth directly from Rust primitives
    pub bits_raw: u64,
    pub bit_pattern: String,
    pub hex_string: String,
    pub sign_bit: u8,
    pub exponent_raw: u32,
    pub fraction_raw: u64,
    
    // All 9 educational steps
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
