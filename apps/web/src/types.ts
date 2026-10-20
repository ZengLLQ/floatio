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

export interface Step2SignBit {
  sign_bit: number;
  is_negative: boolean;
  is_negative_zero: boolean;
  explanation: string;
  latex_formula: string;
  latex_substitution: string;
}

export interface Step3DecimalToBinary {
  integer_part_dec: string;
  fractional_part_dec: string;
  integer_division_rows: DivisionRow[];
  integer_binary: string;
  fractional_multiplication_rows: MultiplicationRow[];
  fractional_binary: string;
  is_fraction_terminating: boolean;
  combined_binary_unnormalized: string;
  explanation: string;
}

export interface Step4Normalization {
  binary_before: string;
  normalized_form: string;
  unbiased_exponent: number;
  shift_amount: number;
  shift_direction: string;
  hidden_bit: string;
  is_subnormal: boolean;
  latex_formula: string;
  latex_substitution: string;
  explanation: string;
}

export interface Step5BiasedExponent {
  unbiased_exponent: number;
  bias: number;
  biased_exponent: number;
  exponent_binary: string;
  division_rows: DivisionRow[];
  latex_formula: string;
  latex_substitution: string;
  latex_result: string;
  explanation: string;
}

export interface Step6FractionField {
  significand_with_hidden: string;
  raw_fraction_bits: string;
  target_bit_length: number;
  final_fraction_bits: string;
  guard_bit?: string | null;
  round_bit?: string | null;
  sticky_bit?: string | null;
  did_round: boolean;
  round_caused_exponent_increment: boolean;
  latex_formula: string;
  explanation: string;
}

export interface Step7BitPatternAssembly {
  sign_bit: string;
  exponent_bits: string;
  fraction_bits: string;
  complete_bit_pattern: string;
  formatted_bit_pattern: string;
  explanation: string;
}

export interface Step8HexConversion {
  nibbles: NibbleConversion[];
  hex_string: string;
  explanation: string;
}

export interface Step9FinalResult {
  raw_input: string;
  precision: Precision;
  category: NumberCategory;
  sign_bit: number;
  exponent_binary: string;
  fraction_binary: string;
  complete_bits: string;
  hex_string: string;
  exact_decoded_decimal: string;
  difference: string;
  is_exact: boolean;
  explanation: string;
}

export interface ConversionResult {
  raw_input: string;
  precision: Precision;
  category: NumberCategory;
  is_valid: boolean;
  error_message?: string | null;
  bits_raw: number | bigint;
  bit_pattern: string;
  hex_string: string;
  sign_bit: number;
  exponent_raw: number;
  fraction_raw: number | bigint;
  step1: Step1InputAnalysis;
  step2: Step2SignBit;
  step3: Step3DecimalToBinary;
  step4: Step4Normalization;
  step5: Step5BiasedExponent;
  step6: Step6FractionField;
  step7: Step7BitPatternAssembly;
  step8: Step8HexConversion;
  step9: Step9FinalResult;
}
