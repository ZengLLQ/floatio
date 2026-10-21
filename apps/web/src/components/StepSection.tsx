import React, { useState } from 'react';
import { ConversionResult } from '../types';
import { MathView } from './MathView';
import { HexReferenceTable } from './HexReferenceTable';
import { BinaryPointNormalizer } from './BinaryPointNormalizer';
import { ChevronDown, ChevronUp, ChevronLeft, ChevronRight, CheckCircle2, Copy, Check } from 'lucide-react';
import { formatNibbles } from '../utils/format';

interface StepSectionProps {
  result: ConversionResult;
}

export const StepSection: React.FC<StepSectionProps> = ({ result }) => {
  const [activeStep, setActiveStep] = useState<number>(1);
  const [copiedNormalizedStep4, setCopiedNormalizedStep4] = useState<boolean>(false);
  const [copiedHexStep8, setCopiedHexStep8] = useState<boolean>(false);
  const [copiedHexStep9, setCopiedHexStep9] = useState<boolean>(false);
  const [copiedBitsStep7, setCopiedBitsStep7] = useState<boolean>(false);
  const [copiedFractionStep6, setCopiedFractionStep6] = useState<boolean>(false);
  const [copiedDecimalStep9, setCopiedDecimalStep9] = useState<boolean>(false);

  const renderNormalizedForm = (form: string) => {
    if (!form) return null;
    const match = form.match(/^(.*?)\s*(?:×|\\times|\\cdot|\*)\s*2\^\{?\+?(-?\d+)\}?$/);
    if (match) {
      const [, significand, exp] = match;
      const cleanSig = significand.replace(/(?:₂|_2)$/, '').trim();
      return (
        <span className="inline-flex items-baseline gap-1.5 whitespace-nowrap">
          <span className="font-mono text-[#ECDFCC]">{formatNibbles(cleanSig)}₂</span>
          <span className="text-[#ECDFCC]/70 font-sans font-normal">×</span>
          <span className="font-mono text-[#ECDFCC]">
            2<sup className="text-sm font-bold text-[#ECDFCC] ml-0.5">{exp}</sup>
          </span>
        </span>
      );
    }
    // Clean any unformatted curly braces from LaTeX exponents e.g. 2^{6} -> 2^6
    const cleaned = form.replace(/2\^\{?\+?(-?\d+)\}?/g, '2^$1');
    return <span className="font-mono text-[#ECDFCC]">{cleaned}</span>;
  };

  const renderSignificand = (sig: string) => {
    if (!sig) return '';
    if (sig === '∞' || sig === 'NaN' || sig === '-Infinity') return sig;
    const clean = sig
      .replace(/\s*(?:×|\\times|\\cdot|\*)\s*2\^?.*$/, '')
      .replace(/(?:₂|_2)$/, '')
      .trim();
    const formatted = formatNibbles(clean);
    return formatted.endsWith('₂') ? formatted : `${formatted}₂`;
  };
  const [expandedSteps, setExpandedSteps] = useState<Record<number, boolean>>({
    1: true,
    2: true,
    3: true,
    4: true,
    5: true,
    6: true,
    7: true,
    8: true,
    9: true,
  });

  const toggleStep = (stepNum: number) => {
    setExpandedSteps((prev) => ({
      ...prev,
      [stepNum]: !prev[stepNum],
    }));
  };

  const handleNext = () => {
    if (activeStep < 9) {
      setActiveStep((prev) => prev + 1);
    }
  };

  const handlePrev = () => {
    if (activeStep > 1) {
      setActiveStep((prev) => prev - 1);
    }
  };

  return (
    <section className="w-full my-16 space-y-10">
      {/* Section Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-[#3C3D37]">
        <div>
          <span className="text-xs font-semibold tracking-wider uppercase text-[#697565]">
            Step-by-Step Educational Derivation
          </span>
          <h2 className="text-4xl sm:text-5xl font-bold text-[#ECDFCC] tracking-tight mt-1">
            Mathematical Conversion
          </h2>
        </div>

        {/* Sequential Step Controller */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handlePrev}
            disabled={activeStep === 1}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#3C3D37]/40 hover:bg-[#3C3D37] disabled:opacity-40 disabled:pointer-events-none text-[#ECDFCC] text-sm font-semibold border border-[#3C3D37] transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Previous Step</span>
          </button>

          <div className="px-4 py-2 rounded-xl bg-[#181C14] border border-[#3C3D37] text-sm font-bold text-[#ECDFCC] tabular-nums">
            Step {activeStep} of 9
          </div>

          <button
            type="button"
            onClick={handleNext}
            disabled={activeStep === 9}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#697565] hover:bg-[#697565]/80 disabled:opacity-40 disabled:pointer-events-none text-[#ECDFCC] text-sm font-semibold transition-colors"
          >
            <span>Next Step</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Step Navigation Pill Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((stepNum) => (
          <button
            key={stepNum}
            type="button"
            onClick={() => setActiveStep(stepNum)}
            className={`px-4 py-2 rounded-xl text-sm font-semibold whitespace-nowrap transition-all duration-150 border ${
              activeStep === stepNum
                ? 'bg-[#ECDFCC] text-[#181C14] border-[#ECDFCC] shadow-md'
                : 'bg-[#3C3D37]/30 text-[#ECDFCC]/70 border-[#3C3D37] hover:border-[#697565]'
            }`}
          >
            Step {stepNum}
          </button>
        ))}
      </div>

      {/* The 9 Steps */}
      <div className="space-y-8">
        {/* STEP 1: Input Analysis */}
        <div
          id="step-1"
          className={`rounded-3xl border transition-all duration-200 ${
            activeStep === 1
              ? 'bg-[#181C14] border-[#ECDFCC] ring-1 ring-[#ECDFCC]/30'
              : 'bg-[#181C14] border-[#3C3D37]'
          } p-6 md:p-10`}
        >
          <div
            className="flex items-center justify-between cursor-pointer"
            onClick={() => toggleStep(1)}
          >
            <div className="flex items-center gap-4">
              <span className="w-10 h-10 rounded-2xl bg-[#3C3D37] border border-[#697565]/40 flex items-center justify-center font-bold text-lg text-[#ECDFCC]">
                1
              </span>
              <div>
                <span className="text-xs font-semibold tracking-wider uppercase text-[#697565]">
                  Step 1
                </span>
                <h3 className="text-2xl md:text-3xl font-bold text-[#ECDFCC]">Input Analysis & IEEE 754 Format</h3>
              </div>
            </div>
            {expandedSteps[1] ? <ChevronUp className="w-6 h-6 text-[#697565]" /> : <ChevronDown className="w-6 h-6 text-[#697565]" />}
          </div>

          {expandedSteps[1] && (
            <div className="mt-8 space-y-6 pt-6 border-t border-[#3C3D37]/60">
              <p className="text-lg text-[#ECDFCC]/80 leading-relaxed">
                We begin by identifying the precision requirements, field bit counts, and numerical category of the user-provided input.
              </p>

              {/* Parameter Table & KaTeX Equation */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="p-6 rounded-2xl bg-[#3C3D37]/20 border border-[#3C3D37] space-y-4 min-w-0">
                  <h4 className="text-sm font-semibold uppercase tracking-wider text-[#697565]">
                    Format Specification
                  </h4>
                  <ul className="space-y-2.5 text-base text-[#ECDFCC]/90">
                    <li className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 border-b border-[#3C3D37]/40 pb-2 min-w-0">
                      <span className="text-[#ECDFCC]/60 flex-shrink-0">Original Decimal Input:</span>
                      <div className="overflow-x-auto scrollbar-thin min-w-0 text-left sm:text-right">
                        <span className="font-bold text-[#ECDFCC] font-mono whitespace-nowrap">{result.raw_input}</span>
                      </div>
                    </li>
                    <li className="flex justify-between border-b border-[#3C3D37]/40 pb-2">
                      <span className="text-[#ECDFCC]/60">Selected Precision:</span>
                      <span className="font-bold text-[#ECDFCC]">{result.precision} Precision</span>
                    </li>
                    <li className="flex justify-between border-b border-[#3C3D37]/40 pb-2">
                      <span className="text-[#ECDFCC]/60">Total Bit Width:</span>
                      <span className="font-bold text-[#ECDFCC]">{result.step1.total_bits} bits</span>
                    </li>
                    <li className="flex justify-between border-b border-[#3C3D37]/40 pb-2">
                      <span className="text-[#ECDFCC]/60">Sign Field (S):</span>
                      <span className="font-bold text-[#ECDFCC]">1 bit</span>
                    </li>
                    <li className="flex justify-between border-b border-[#3C3D37]/40 pb-2">
                      <span className="text-[#ECDFCC]/60">Biased Exponent Field (E):</span>
                      <span className="font-bold text-[#ECDFCC]">{result.step1.exponent_bits} bits</span>
                    </li>
                    <li className="flex justify-between border-b border-[#3C3D37]/40 pb-2">
                      <span className="text-[#ECDFCC]/60">Fraction Field (F):</span>
                      <span className="font-bold text-[#ECDFCC]">{result.step1.fraction_bits} bits</span>
                    </li>
                    <li className="flex justify-between">
                      <span className="text-[#ECDFCC]/60">Exponent Bias:</span>
                      <span className="font-bold text-[#ECDFCC]">{result.step1.bias}</span>
                    </li>
                  </ul>
                </div>

                <div className="p-6 rounded-2xl bg-[#3C3D37]/20 border border-[#3C3D37] flex flex-col justify-center space-y-4 min-w-0">
                  <h4 className="text-sm font-semibold uppercase tracking-wider text-[#697565]">
                    Mathematical Definition
                  </h4>
                  <MathView math={result.step1.latex_formula} display className="text-[#ECDFCC]" />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* STEP 2: Sign Bit */}
        <div
          id="step-2"
          className={`rounded-3xl border transition-all duration-200 ${
            activeStep === 2
              ? 'bg-[#181C14] border-[#ECDFCC] ring-1 ring-[#ECDFCC]/30'
              : 'bg-[#181C14] border-[#3C3D37]'
          } p-6 md:p-10`}
        >
          <div
            className="flex items-center justify-between cursor-pointer"
            onClick={() => toggleStep(2)}
          >
            <div className="flex items-center gap-4">
              <span className="w-10 h-10 rounded-2xl bg-[#3C3D37] border border-[#697565]/40 flex items-center justify-center font-bold text-lg text-[#ECDFCC]">
                2
              </span>
              <div>
                <span className="text-xs font-semibold tracking-wider uppercase text-[#697565]">
                  Step 2
                </span>
                <h3 className="text-2xl md:text-3xl font-bold text-[#ECDFCC]">Determine the Sign Bit</h3>
              </div>
            </div>
            {expandedSteps[2] ? <ChevronUp className="w-6 h-6 text-[#697565]" /> : <ChevronDown className="w-6 h-6 text-[#697565]" />}
          </div>

          {expandedSteps[2] && (
            <div className="mt-8 space-y-6 pt-6 border-t border-[#3C3D37]/60">
              <p className="text-lg text-[#ECDFCC]/80 leading-relaxed">
                The sign bit S determines whether the number is positive or negative. IEEE 754 uses a sign-magnitude scheme where:
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-6 rounded-2xl bg-[#3C3D37]/20 border border-[#3C3D37] space-y-4 min-w-0">
                  <h4 className="text-sm font-semibold uppercase tracking-wider text-[#697565]">
                    Sign Determination Rule
                  </h4>
                  <MathView math={result.step2.latex_formula} display />
                </div>

                <div className="p-6 rounded-2xl bg-[#3C3D37]/20 border border-[#3C3D37] space-y-4 min-w-0">
                  <h4 className="text-sm font-semibold uppercase tracking-wider text-[#697565]">
                    Evaluation for Input
                  </h4>
                  <MathView math={result.step2.latex_substitution} display />
                  <div className="pt-2 text-base text-[#ECDFCC]/90">
                    {result.step2.explanation}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* STEP 3: Convert Decimal to Binary */}
        <div
          id="step-3"
          className={`rounded-3xl border transition-all duration-200 ${
            activeStep === 3
              ? 'bg-[#181C14] border-[#ECDFCC] ring-1 ring-[#ECDFCC]/30'
              : 'bg-[#181C14] border-[#3C3D37]'
          } p-6 md:p-10`}
        >
          <div
            className="flex items-center justify-between cursor-pointer"
            onClick={() => toggleStep(3)}
          >
            <div className="flex items-center gap-4">
              <span className="w-10 h-10 rounded-2xl bg-[#3C3D37] border border-[#697565]/40 flex items-center justify-center font-bold text-lg text-[#ECDFCC]">
                3
              </span>
              <div>
                <span className="text-xs font-semibold tracking-wider uppercase text-[#697565]">
                  Step 3
                </span>
                <h3 className="text-2xl md:text-3xl font-bold text-[#ECDFCC]">Convert Decimal to Binary</h3>
              </div>
            </div>
            {expandedSteps[3] ? <ChevronUp className="w-6 h-6 text-[#697565]" /> : <ChevronDown className="w-6 h-6 text-[#697565]" />}
          </div>

          {expandedSteps[3] && (
            <div className="mt-8 space-y-8 pt-6 border-t border-[#3C3D37]/60">
              <p className="text-lg text-[#ECDFCC]/80 leading-relaxed">
                We convert the integer part and fractional part separately: integer via repeated division by 2, and fraction via repeated multiplication by 2.
              </p>

              {/* Part A: Integer Division Table */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-xl font-bold text-[#ECDFCC]">
                    Part A: Integer Part ({result.step3.integer_part_dec}₁₀)
                  </h4>
                  <span className="text-xs text-[#697565] uppercase font-semibold">
                    Read Remainders: Bottom → Top
                  </span>
                </div>

                {result.step3.integer_division_rows.length > 0 ? (
                  <div className="overflow-x-auto rounded-2xl border border-[#3C3D37]">
                    <table className="w-full text-left text-base border-collapse">
                      <thead>
                        <tr className="bg-[#3C3D37]/50 text-[#697565] uppercase text-xs tracking-wider border-b border-[#3C3D37]">
                          <th className="py-3.5 px-6 font-semibold">Division (N ÷ 2)</th>
                          <th className="py-3.5 px-6 font-semibold">Quotient</th>
                          <th className="py-3.5 px-6 font-semibold text-right">Remainder</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#3C3D37]/40 font-medium tabular-nums">
                        {result.step3.integer_division_rows.map((row, idx) => (
                          <tr key={idx} className="hover:bg-[#3C3D37]/20 transition-colors">
                            <td className="py-3 px-6 text-[#ECDFCC]">{row.division}</td>
                            <td className="py-3 px-6 text-[#ECDFCC]/80">{row.quotient}</td>
                            <td className="py-3 px-6 text-right font-bold text-[#ECDFCC]">{row.remainder}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="p-4 rounded-xl bg-[#3C3D37]/20 text-[#ECDFCC]/70">
                    Integer part is zero.
                  </div>
                )}

                <div className="p-4 rounded-xl bg-[#181C14] border border-[#3C3D37] space-y-2 min-w-0">
                  <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-[#697565]">
                    <span>Integer Binary Result</span>
                    <span className="font-mono text-[#ECDFCC]/60">
                      {result.step3.integer_binary.replace(/[\s_]/g, '').length} bits
                    </span>
                  </div>
                  <div className="overflow-x-auto scrollbar-thin py-1 min-w-0">
                    <span className="text-xl sm:text-2xl font-bold text-[#ECDFCC] tabular-nums tracking-wider font-mono whitespace-nowrap block">
                      {formatNibbles(result.step3.integer_binary, { alignRight: true })}₂
                    </span>
                  </div>
                </div>
              </div>

              {/* Part B: Fractional Multiplication Table */}
              <div className="space-y-4 pt-4 border-t border-[#3C3D37]/40">
                <div className="flex items-center justify-between">
                  <h4 className="text-xl font-bold text-[#ECDFCC]">
                    Part B: Fractional Part (0.{result.step3.fractional_part_dec && result.step3.fractional_part_dec !== '0' ? result.step3.fractional_part_dec : '0'}₁₀)
                  </h4>
                  <span className="text-xs text-[#697565] uppercase font-semibold">
                    Read Integer Bits: Top → Bottom
                  </span>
                </div>

                {result.step3.fractional_multiplication_rows.length > 0 ? (
                  <div className="overflow-x-auto rounded-2xl border border-[#3C3D37] max-h-80 overflow-y-auto">
                    <table className="w-full text-left text-base border-collapse">
                      <thead className="sticky top-0 bg-[#181C14] z-10">
                        <tr className="bg-[#3C3D37]/50 text-[#697565] uppercase text-xs tracking-wider border-b border-[#3C3D37]">
                          <th className="py-3.5 px-6 font-semibold">Step</th>
                          <th className="py-3.5 px-6 font-semibold">Fraction × 2</th>
                          <th className="py-3.5 px-6 font-semibold text-center">Integer Bit</th>
                          <th className="py-3.5 px-6 font-semibold text-right">Remaining Fraction</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#3C3D37]/40 font-medium tabular-nums">
                        {result.step3.fractional_multiplication_rows.map((row) => (
                          <tr key={row.step} className="hover:bg-[#3C3D37]/20 transition-colors">
                            <td className="py-2.5 px-6 text-[#697565]">{row.step}</td>
                            <td className="py-2.5 px-6 text-[#ECDFCC]">{row.expression}</td>
                            <td className="py-2.5 px-6 text-center font-bold text-[#ECDFCC]">
                              <span className="px-2 py-0.5 rounded bg-[#3C3D37] text-white">
                                {row.integer_bit}
                              </span>
                            </td>
                            <td className="py-2.5 px-6 text-right text-[#ECDFCC]/80">{row.remaining_fraction}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="p-4 rounded-xl bg-[#3C3D37]/20 text-[#ECDFCC]/70">
                    Fractional part is zero.
                  </div>
                )}

                <div className="p-4 rounded-xl bg-[#181C14] border border-[#3C3D37] space-y-2 min-w-0">
                  <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-[#697565]">
                    <span>Unnormalized Combined Binary</span>
                    <span className="font-mono text-[#ECDFCC]/60">Integer + Fraction</span>
                  </div>
                  <div className="overflow-x-auto scrollbar-thin py-1 min-w-0">
                    <span className="text-xl sm:text-2xl font-bold text-[#ECDFCC] tabular-nums tracking-wider font-mono whitespace-nowrap block">
                      {formatNibbles(result.step3.combined_binary_unnormalized)}₂
                    </span>
                  </div>
                </div>

                <p className="text-sm text-[#ECDFCC]/70 italic">
                  {result.step3.explanation}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* STEP 4: Normalize the Binary Number */}
        <div
          id="step-4"
          className={`rounded-3xl border transition-all duration-200 ${
            activeStep === 4
              ? 'bg-[#181C14] border-[#ECDFCC] ring-1 ring-[#ECDFCC]/30'
              : 'bg-[#181C14] border-[#3C3D37]'
          } p-6 md:p-10`}
        >
          <div
            className="flex items-center justify-between cursor-pointer"
            onClick={() => toggleStep(4)}
          >
            <div className="flex items-center gap-4">
              <span className="w-10 h-10 rounded-2xl bg-[#3C3D37] border border-[#697565]/40 flex items-center justify-center font-bold text-lg text-[#ECDFCC]">
                4
              </span>
              <div>
                <span className="text-xs font-semibold tracking-wider uppercase text-[#697565]">
                  Step 4
                </span>
                <h3 className="text-2xl md:text-3xl font-bold text-[#ECDFCC]">Normalize the Binary Number</h3>
              </div>
            </div>
            {expandedSteps[4] ? <ChevronUp className="w-6 h-6 text-[#697565]" /> : <ChevronDown className="w-6 h-6 text-[#697565]" />}
          </div>

          {expandedSteps[4] && (
            <div className="mt-8 space-y-6 pt-6 border-t border-[#3C3D37]/60">
              <p className="text-lg text-[#ECDFCC]/80 leading-relaxed">
                Normalization repositions the binary point so that exactly one non-zero bit (the hidden bit 1) precedes the binary point:
              </p>

              {/* Interactive Visual Movement of the Binary Point */}
              <BinaryPointNormalizer
                binaryBefore={result.step4.binary_before}
                unbiasedExp={result.step4.unbiased_exponent}
                shiftAmount={result.step4.shift_amount}
                shiftDirection={result.step4.shift_direction}
                normalizedForm={result.step4.normalized_form}
                hiddenBit={result.step4.hidden_bit}
                isSubnormal={result.step4.is_subnormal}
              />

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="p-6 rounded-2xl bg-[#3C3D37]/20 border border-[#3C3D37] space-y-4 min-w-0">
                  <h4 className="text-sm font-semibold uppercase tracking-wider text-[#697565]">
                    Binary Point Transformation
                  </h4>
                  <MathView math={result.step4.latex_substitution} display />
                </div>

                <div className="p-6 rounded-2xl bg-[#3C3D37]/20 border border-[#3C3D37] space-y-5 min-w-0">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-semibold uppercase tracking-wider text-[#697565]">
                      Normalization Result
                    </h4>
                    <span className="text-xs px-2.5 py-0.5 rounded-full bg-[#3C3D37] text-[#ECDFCC] font-mono">
                      e = {result.step4.unbiased_exponent}
                    </span>
                  </div>

                  {/* Self-contained Full-Width Normalized Form Card */}
                  <div className="p-4 rounded-xl bg-[#181C14] border border-[#3C3D37] space-y-2 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold uppercase tracking-wider text-[#697565]">
                          Normalized Form
                        </span>
                        <span className="text-xs font-mono text-[#ECDFCC]/60">
                          {result.step4.is_subnormal ? '0.F₂ × 2ᵉ' : '1.F₂ × 2ᵉ'}
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          const cleanForm = result.step4.normalized_form.replace(/2\^\{?\+?(-?\d+)\}?/g, '2^$1');
                          navigator.clipboard.writeText(cleanForm);
                          setCopiedNormalizedStep4(true);
                          setTimeout(() => setCopiedNormalizedStep4(false), 2000);
                        }}
                        title="Copy Normalized Form"
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#3C3D37]/50 hover:bg-[#3C3D37] text-[#ECDFCC] text-xs font-semibold uppercase tracking-wider border border-[#3C3D37] transition-colors flex-shrink-0"
                      >
                        {copiedNormalizedStep4 ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                            <span className="text-emerald-400">Copied</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5 text-[#697565]" />
                            <span>Copy Form</span>
                          </>
                        )}
                      </button>
                    </div>
                    <div className="overflow-x-auto scrollbar-thin py-2 min-w-0">
                      <div className="font-mono text-base sm:text-lg md:text-xl font-bold text-[#ECDFCC] tabular-nums whitespace-nowrap tracking-wide">
                        {renderNormalizedForm(result.step4.normalized_form)}
                      </div>
                    </div>
                  </div>

                  {/* Detail Parameter Cards */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="p-3.5 rounded-xl bg-[#181C14] border border-[#3C3D37] min-w-0">
                      <span className="text-xs uppercase tracking-wider text-[#697565] block mb-1">
                        Unbiased Exponent (e)
                      </span>
                      <span className="text-xl font-bold text-[#ECDFCC] tabular-nums font-mono block">
                        {result.step4.unbiased_exponent}
                      </span>
                    </div>

                    <div className="p-3.5 rounded-xl bg-[#181C14] border border-[#3C3D37] min-w-0">
                      <span className="text-xs uppercase tracking-wider text-[#697565] block mb-1">
                        Implicit Bit
                      </span>
                      <span className="text-xl font-bold text-[#ECDFCC] tabular-nums font-mono block">
                        {result.step4.hidden_bit}
                      </span>
                    </div>

                    <div className="p-3.5 rounded-xl bg-[#181C14] border border-[#3C3D37] min-w-0">
                      <span className="text-xs uppercase tracking-wider text-[#697565] block mb-1">
                        Shift
                      </span>
                      <span
                        className="text-sm sm:text-base font-bold text-[#ECDFCC] block truncate"
                        title={
                          result.step4.is_subnormal
                            ? 'Subnormal (Fixed leading bit 0)'
                            : result.step4.shift_amount === 0
                            ? 'Zero shift required'
                            : `${result.step4.shift_amount} positions ${result.step4.shift_direction}`
                        }
                      >
                        {result.step4.is_subnormal
                          ? 'Subnormal'
                          : result.step4.shift_amount === 0
                          ? 'None (e = 0)'
                          : `${result.step4.shift_amount} pos ${result.step4.shift_direction}`}
                      </span>
                    </div>
                  </div>

                  <p className="text-sm text-[#ECDFCC]/70 pt-1 leading-relaxed">
                    {result.step4.explanation}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* STEP 5: Calculate Biased Exponent */}
        <div
          id="step-5"
          className={`rounded-3xl border transition-all duration-200 ${
            activeStep === 5
              ? 'bg-[#181C14] border-[#ECDFCC] ring-1 ring-[#ECDFCC]/30'
              : 'bg-[#181C14] border-[#3C3D37]'
          } p-6 md:p-10`}
        >
          <div
            className="flex items-center justify-between cursor-pointer"
            onClick={() => toggleStep(5)}
          >
            <div className="flex items-center gap-4">
              <span className="w-10 h-10 rounded-2xl bg-[#3C3D37] border border-[#697565]/40 flex items-center justify-center font-bold text-lg text-[#ECDFCC]">
                5
              </span>
              <div>
                <span className="text-xs font-semibold tracking-wider uppercase text-[#697565]">
                  Step 5
                </span>
                <h3 className="text-2xl md:text-3xl font-bold text-[#ECDFCC]">Calculate the Biased Exponent</h3>
              </div>
            </div>
            {expandedSteps[5] ? <ChevronUp className="w-6 h-6 text-[#697565]" /> : <ChevronDown className="w-6 h-6 text-[#697565]" />}
          </div>

          {expandedSteps[5] && (
            <div className="mt-8 space-y-6 pt-6 border-t border-[#3C3D37]/60">
              <p className="text-lg text-[#ECDFCC]/80 leading-relaxed">
                To allow exponents to be both positive and negative without a separate sign bit in the exponent field, IEEE 754 adds a fixed bias ({result.step5.bias}).
              </p>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="p-6 rounded-2xl bg-[#3C3D37]/20 border border-[#3C3D37] space-y-4 min-w-0">
                  <h4 className="text-sm font-semibold uppercase tracking-wider text-[#697565]">
                    Exponent Bias Formula
                  </h4>
                  <MathView math={result.step5.latex_formula} display />
                  <MathView math={result.step5.latex_substitution} display />
                  <div className="pt-2 text-base text-[#ECDFCC]/90">
                    {result.step5.explanation}
                  </div>
                </div>

                {/* Repeated division by 2 table for biased exponent */}
                <div className="p-6 rounded-2xl bg-[#3C3D37]/20 border border-[#3C3D37] space-y-4 min-w-0">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-semibold uppercase tracking-wider text-[#697565]">
                      Biased Exponent to Binary ({result.step5.biased_exponent}₁₀)
                    </h4>
                    <span className="text-xs text-[#697565] uppercase font-semibold">
                      Bottom → Top
                    </span>
                  </div>

                  <div className="overflow-x-auto rounded-xl border border-[#3C3D37] max-h-56 overflow-y-auto">
                    <table className="w-full text-left text-sm border-collapse">
                      <thead className="sticky top-0 bg-[#181C14]">
                        <tr className="bg-[#3C3D37]/50 text-[#697565] uppercase text-xs border-b border-[#3C3D37]">
                          <th className="py-2 px-4">Division</th>
                          <th className="py-2 px-4">Quotient</th>
                          <th className="py-2 px-4 text-right">Remainder</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#3C3D37]/40 tabular-nums">
                        {result.step5.division_rows.map((r, idx) => (
                          <tr key={idx} className="hover:bg-[#3C3D37]/20">
                            <td className="py-1.5 px-4 text-[#ECDFCC]">{r.division}</td>
                            <td className="py-1.5 px-4 text-[#ECDFCC]/70">{r.quotient}</td>
                            <td className="py-1.5 px-4 text-right font-bold text-[#ECDFCC]">{r.remainder}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div className="p-4 rounded-xl bg-[#181C14] border border-[#3C3D37] space-y-2 min-w-0">
                    <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-[#697565]">
                      <span>Biased Exponent Field (E)</span>
                      <span className="font-mono text-[#ECDFCC]/60">
                        {result.step1.exponent_bits} bits
                      </span>
                    </div>
                    <div className="overflow-x-auto scrollbar-thin py-1 min-w-0">
                      <span className="text-xl sm:text-2xl font-bold text-[#ECDFCC] tabular-nums tracking-widest font-mono whitespace-nowrap block">
                        {formatNibbles(result.step5.exponent_binary)}₂
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* STEP 6: Determine the Fraction Field */}
        <div
          id="step-6"
          className={`rounded-3xl border transition-all duration-200 ${
            activeStep === 6
              ? 'bg-[#181C14] border-[#ECDFCC] ring-1 ring-[#ECDFCC]/30'
              : 'bg-[#181C14] border-[#3C3D37]'
          } p-6 md:p-10`}
        >
          <div
            className="flex items-center justify-between cursor-pointer"
            onClick={() => toggleStep(6)}
          >
            <div className="flex items-center gap-4">
              <span className="w-10 h-10 rounded-2xl bg-[#3C3D37] border border-[#697565]/40 flex items-center justify-center font-bold text-lg text-[#ECDFCC]">
                6
              </span>
              <div>
                <span className="text-xs font-semibold tracking-wider uppercase text-[#697565]">
                  Step 6
                </span>
                <h3 className="text-2xl md:text-3xl font-bold text-[#ECDFCC]">Determine the Fraction Field & Rounding</h3>
              </div>
            </div>
            {expandedSteps[6] ? <ChevronUp className="w-6 h-6 text-[#697565]" /> : <ChevronDown className="w-6 h-6 text-[#697565]" />}
          </div>

          {expandedSteps[6] && (
            <div className="mt-8 space-y-6 pt-6 border-t border-[#3C3D37]/60">
              <p className="text-lg text-[#ECDFCC]/80 leading-relaxed">
                For normal numbers, the leading bit `1` is implicit and omitted. The remaining bits form the fraction field, padded with zeros or rounded via IEEE 754 round-to-nearest, ties-to-even.
              </p>

              <div className="p-6 rounded-2xl bg-[#3C3D37]/20 border border-[#3C3D37] space-y-6 min-w-0">
                <div className="space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-4 rounded-xl bg-[#181C14] border border-[#3C3D37] min-w-0">
                    <span className="text-xs font-semibold uppercase tracking-wider text-[#697565]">
                      Target Fraction Width
                    </span>
                    <span className="text-base sm:text-lg font-bold text-[#ECDFCC] font-mono">
                      {result.step6.target_bit_length} bits ({result.precision} Precision)
                    </span>
                  </div>

                  <div className="p-4 rounded-xl bg-[#181C14] border border-[#3C3D37] space-y-2 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold uppercase tracking-wider text-[#697565]">
                        Normalized Significand (with implicit bit)
                      </span>
                      <span className="text-xs text-[#ECDFCC]/60 font-mono">
                        Hidden {result.step4.hidden_bit} + {result.step6.target_bit_length}b fraction
                      </span>
                    </div>
                    <div className="overflow-x-auto scrollbar-thin py-1 min-w-0">
                      <span className="text-base sm:text-lg font-bold text-[#ECDFCC] tabular-nums font-mono whitespace-nowrap block">
                        {renderSignificand(result.step6.significand_with_hidden)}
                      </span>
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-[#181C14] border border-[#3C3D37] space-y-2 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold uppercase tracking-wider text-[#697565]">
                        Candidate Unrounded Fraction
                      </span>
                      <span className="text-xs text-[#ECDFCC]/60 font-mono">
                        Raw fraction bits
                      </span>
                    </div>
                    <div className="overflow-x-auto scrollbar-thin py-1 min-w-0">
                      <span className="text-base sm:text-lg font-bold text-[#ECDFCC]/90 tabular-nums font-mono whitespace-nowrap block">
                        {formatNibbles(result.step6.raw_fraction_bits)}
                      </span>
                    </div>
                  </div>

                  {/* Guard, Round, Sticky Bit Callout Cards */}
                  {result.step6.guard_bit && (
                    <div className="pt-2 pb-1 space-y-3">
                      <span className="text-xs font-semibold uppercase tracking-wider text-[#697565] block">
                        IEEE 754 Discarded Bits Analysis
                      </span>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div className="p-3.5 rounded-xl bg-[#181C14] border border-[#3C3D37] flex items-center justify-between">
                          <div>
                            <span className="text-xs uppercase text-[#697565] font-semibold block">Guard Bit (G)</span>
                            <span className="text-xs text-[#ECDFCC]/60">First discarded bit</span>
                          </div>
                          <span className="text-2xl font-bold text-[#ECDFCC] tabular-nums px-2 py-0.5 rounded bg-[#3C3D37]/60">
                            {result.step6.guard_bit}
                          </span>
                        </div>

                        <div className="p-3.5 rounded-xl bg-[#181C14] border border-[#3C3D37] flex items-center justify-between">
                          <div>
                            <span className="text-xs uppercase text-[#697565] font-semibold block">Round Bit (R)</span>
                            <span className="text-xs text-[#ECDFCC]/60">Second discarded bit</span>
                          </div>
                          <span className="text-2xl font-bold text-[#ECDFCC] tabular-nums px-2 py-0.5 rounded bg-[#3C3D37]/60">
                            {result.step6.round_bit}
                          </span>
                        </div>

                        <div className="p-3.5 rounded-xl bg-[#181C14] border border-[#3C3D37] flex items-center justify-between">
                          <div>
                            <span className="text-xs uppercase text-[#697565] font-semibold block">Sticky Bit (S)</span>
                            <span className="text-xs text-[#ECDFCC]/60">OR of remaining bits</span>
                          </div>
                          <span className="text-2xl font-bold text-[#ECDFCC] tabular-nums px-2 py-0.5 rounded bg-[#3C3D37]/60">
                            {result.step6.sticky_bit}
                          </span>
                        </div>
                      </div>

                      {/* Rounding Status Pill */}
                      <div className="flex flex-wrap items-center gap-3 pt-1">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                          result.step6.did_round
                            ? 'bg-amber-950/80 border border-amber-800 text-amber-300'
                            : 'bg-emerald-950/80 border border-emerald-800 text-emerald-300'
                        }`}>
                          {result.step6.did_round ? 'Rounded Up (+1 to Fraction)' : 'Truncated / Exact (No Increment)'}
                        </span>

                        {result.step6.round_caused_exponent_increment && (
                          <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-purple-950/80 border border-purple-800 text-purple-300">
                            Biased Exponent Incremented by Carry (+1 to E)
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Mathematical Derivation */}
                  {result.step6.latex_formula && (
                    <div className="p-4 rounded-xl bg-[#181C14] border border-[#3C3D37] my-3">
                      <MathView math={result.step6.latex_formula} display />
                    </div>
                  )}

                  <div className="pt-3 border-t border-[#3C3D37]/40 space-y-3">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold uppercase tracking-wider text-[#697565]">
                          Final Stored Fraction Field ({result.step6.target_bit_length}b)
                        </span>
                        <span className="text-xs px-2.5 py-0.5 rounded-full bg-[#3C3D37] text-[#ECDFCC]/80 font-mono font-medium">
                          {result.step6.target_bit_length} bits · {Math.ceil(result.step6.target_bit_length / 4)} nibbles
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          navigator.clipboard.writeText(result.step6.final_fraction_bits);
                          setCopiedFractionStep6(true);
                          setTimeout(() => setCopiedFractionStep6(false), 2000);
                        }}
                        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-[#3C3D37]/50 hover:bg-[#3C3D37] text-[#ECDFCC] text-xs font-semibold uppercase tracking-wider border border-[#3C3D37] transition-colors"
                      >
                        {copiedFractionStep6 ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                            <span className="text-emerald-400">Copied</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5 text-[#697565]" />
                            <span>Copy Fraction</span>
                          </>
                        )}
                      </button>
                    </div>

                    <div className="p-4 rounded-xl bg-[#181C14] border border-[#3C3D37] overflow-x-auto scrollbar-thin min-w-0">
                      <div className="font-mono text-base sm:text-lg md:text-xl font-bold text-[#ECDFCC] tabular-nums tracking-wider whitespace-nowrap">
                        {formatNibbles(result.step6.final_fraction_bits)}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-2 border-t border-[#3C3D37]/40 text-sm text-[#ECDFCC]/80 leading-relaxed">
                  {result.step6.explanation}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* STEP 7: Assemble IEEE 754 Bit Pattern */}
        <div
          id="step-7"
          className={`rounded-3xl border transition-all duration-200 ${
            activeStep === 7
              ? 'bg-[#181C14] border-[#ECDFCC] ring-1 ring-[#ECDFCC]/30'
              : 'bg-[#181C14] border-[#3C3D37]'
          } p-6 md:p-10`}
        >
          <div
            className="flex items-center justify-between cursor-pointer"
            onClick={() => toggleStep(7)}
          >
            <div className="flex items-center gap-4">
              <span className="w-10 h-10 rounded-2xl bg-[#3C3D37] border border-[#697565]/40 flex items-center justify-center font-bold text-lg text-[#ECDFCC]">
                7
              </span>
              <div>
                <span className="text-xs font-semibold tracking-wider uppercase text-[#697565]">
                  Step 7
                </span>
                <h3 className="text-2xl md:text-3xl font-bold text-[#ECDFCC]">Assemble the IEEE 754 Bit Pattern</h3>
              </div>
            </div>
            {expandedSteps[7] ? <ChevronUp className="w-6 h-6 text-[#697565]" /> : <ChevronDown className="w-6 h-6 text-[#697565]" />}
          </div>

          {expandedSteps[7] && (
            <div className="mt-8 space-y-6 pt-6 border-t border-[#3C3D37]/60">
              <p className="text-lg text-[#ECDFCC]/80 leading-relaxed">
                We concatenate the three fields: 1 bit for Sign, {result.step1.exponent_bits} bits for Biased Exponent, and {result.step1.fraction_bits} bits for Fraction.
              </p>

              <div className="p-6 rounded-2xl bg-[#3C3D37]/20 border border-[#3C3D37] space-y-4 min-w-0">
                <div className="overflow-x-auto scrollbar-thin pb-2 min-w-0">
                  <div className="flex items-center gap-3 text-lg sm:text-xl md:text-2xl font-bold tabular-nums font-mono whitespace-nowrap min-w-max">
                    <div className="flex flex-col items-center">
                      <span className="text-[10px] uppercase tracking-wider text-[#697565] mb-1 font-sans">
                        Sign (1b)
                      </span>
                      <span className="px-3 py-1.5 rounded-xl bg-[#697565]/30 text-[#ECDFCC] border border-[#697565]">
                        {result.step7.sign_bit}
                      </span>
                    </div>

                    <span className="text-[#3C3D37] text-2xl select-none">+</span>

                    <div className="flex flex-col items-center">
                      <span className="text-[10px] uppercase tracking-wider text-[#697565] mb-1 font-sans">
                        Exponent ({result.step7.exponent_bits.length}b)
                      </span>
                      <span className="px-3 py-1.5 rounded-xl bg-[#697565] text-[#181C14]">
                        {result.step7.exponent_bits}
                      </span>
                    </div>

                    <span className="text-[#3C3D37] text-2xl select-none">+</span>

                    <div className="flex flex-col items-start">
                      <span className="text-[10px] uppercase tracking-wider text-[#697565] mb-1 font-sans">
                        Fraction ({result.step7.fraction_bits.length}b)
                      </span>
                      <span className="px-4 py-1.5 rounded-xl bg-[#3C3D37] text-[#ECDFCC] font-mono tracking-wider whitespace-nowrap">
                        {formatNibbles(result.step7.fraction_bits)}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-[#181C14] border border-[#3C3D37] space-y-2 min-w-0">
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-xs font-semibold uppercase tracking-wider text-[#697565]">
                      Complete {result.step1.total_bits}-Bit Representation
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard.writeText(result.step7.complete_bit_pattern);
                        setCopiedBitsStep7(true);
                        setTimeout(() => setCopiedBitsStep7(false), 2000);
                      }}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#3C3D37]/50 hover:bg-[#3C3D37] text-[#ECDFCC] text-xs font-bold uppercase tracking-wider border border-[#3C3D37] transition-colors flex-shrink-0"
                    >
                      {copiedBitsStep7 ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                          <span className="text-emerald-400">Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5 text-[#697565]" />
                          <span>Copy Bits</span>
                        </>
                      )}
                    </button>
                  </div>
                  <div className="overflow-x-auto scrollbar-thin py-1 min-w-0">
                    <span className="text-base sm:text-lg md:text-xl font-bold text-[#ECDFCC] tabular-nums font-mono tracking-wider whitespace-nowrap block">
                      {formatNibbles(result.step7.complete_bit_pattern)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* STEP 8: Convert Binary to Hexadecimal */}
        <div
          id="step-8"
          className={`rounded-3xl border transition-all duration-200 ${
            activeStep === 8
              ? 'bg-[#181C14] border-[#ECDFCC] ring-1 ring-[#ECDFCC]/30'
              : 'bg-[#181C14] border-[#3C3D37]'
          } p-6 md:p-10`}
        >
          <div
            className="flex items-center justify-between cursor-pointer"
            onClick={() => toggleStep(8)}
          >
            <div className="flex items-center gap-4">
              <span className="w-10 h-10 rounded-2xl bg-[#3C3D37] border border-[#697565]/40 flex items-center justify-center font-bold text-lg text-[#ECDFCC]">
                8
              </span>
              <div>
                <span className="text-xs font-semibold tracking-wider uppercase text-[#697565]">
                  Step 8
                </span>
                <h3 className="text-2xl md:text-3xl font-bold text-[#ECDFCC]">Convert Binary to Hexadecimal</h3>
              </div>
            </div>
            {expandedSteps[8] ? <ChevronUp className="w-6 h-6 text-[#697565]" /> : <ChevronDown className="w-6 h-6 text-[#697565]" />}
          </div>

          {expandedSteps[8] && (
            <div className="mt-8 space-y-8 pt-6 border-t border-[#3C3D37]/60">
              <p className="text-lg text-[#ECDFCC]/80 leading-relaxed">
                The {result.step1.total_bits} bits are divided into {result.step8.nibbles.length} 4-bit nibbles. Each 4-bit group corresponds to a single hexadecimal digit (0–F).
              </p>

              {/* Grid with Nibble Mapping Table + Hex Reference Table */}
              <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                {/* Dynamic Nibble Table */}
                <div className="xl:col-span-2 space-y-4">
                  <h4 className="text-base font-bold text-[#ECDFCC]">
                    Active Nibble Grouping
                  </h4>

                  <div className="overflow-x-auto rounded-2xl border border-[#3C3D37]">
                    <table className="w-full text-left text-base border-collapse">
                      <thead>
                        <tr className="bg-[#3C3D37]/50 text-[#697565] uppercase text-xs tracking-wider border-b border-[#3C3D37]">
                          <th className="py-3 px-4 font-semibold">Group</th>
                          <th className="py-3 px-4 font-semibold">Bit Range</th>
                          <th className="py-3 px-4 font-semibold">Field Origin</th>
                          <th className="py-3 px-4 font-semibold text-center">4-Bit Binary</th>
                          <th className="py-3 px-4 font-semibold text-right">Hex Digit</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#3C3D37]/40 font-medium tabular-nums">
                        {result.step8.nibbles.map((nibble) => (
                          <tr key={nibble.index} className="hover:bg-[#3C3D37]/20 transition-colors">
                            <td className="py-2.5 px-4 text-[#697565]">#{nibble.index}</td>
                            <td className="py-2.5 px-4 text-[#ECDFCC]/70">{nibble.bit_range}</td>
                            <td className="py-2.5 px-4 text-xs font-semibold text-[#697565]">{nibble.field_type}</td>
                            <td className="py-2.5 px-4 text-center font-bold text-[#ECDFCC] tracking-widest">{nibble.binary}</td>
                            <td className="py-2.5 px-4 text-right font-bold text-xl text-[#ECDFCC]">{nibble.hex}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div className="p-4 rounded-xl bg-[#181C14] border border-[#3C3D37] space-y-2 min-w-0">
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-xs font-semibold uppercase tracking-wider text-[#697565]">
                        Hexadecimal Word
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          navigator.clipboard.writeText(result.step8.hex_string);
                          setCopiedHexStep8(true);
                          setTimeout(() => setCopiedHexStep8(false), 2000);
                        }}
                        title="Copy Hexadecimal word"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#3C3D37]/50 hover:bg-[#3C3D37] text-[#ECDFCC] text-xs font-bold uppercase tracking-wider border border-[#3C3D37] transition-colors flex-shrink-0"
                      >
                        {copiedHexStep8 ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                            <span className="text-emerald-400">Copied</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5 text-[#697565]" />
                            <span>Copy Hex</span>
                          </>
                        )}
                      </button>
                    </div>
                    <div className="overflow-x-auto scrollbar-thin py-1 min-w-0">
                      <span className="text-2xl sm:text-3xl font-bold text-[#ECDFCC] tracking-widest font-mono whitespace-nowrap block">
                        {result.step8.hex_string}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Reference 4-bit to Hex Table */}
                <div className="xl:col-span-1">
                  <HexReferenceTable />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* STEP 9: Final Result and Interpretation */}
        <div
          id="step-9"
          className={`rounded-3xl border transition-all duration-200 ${
            activeStep === 9
              ? 'bg-[#181C14] border-[#ECDFCC] ring-1 ring-[#ECDFCC]/30'
              : 'bg-[#181C14] border-[#3C3D37]'
          } p-6 md:p-10`}
        >
          <div
            className="flex items-center justify-between cursor-pointer"
            onClick={() => toggleStep(9)}
          >
            <div className="flex items-center gap-4">
              <span className="w-10 h-10 rounded-2xl bg-[#3C3D37] border border-[#697565]/40 flex items-center justify-center font-bold text-lg text-[#ECDFCC]">
                9
              </span>
              <div>
                <span className="text-xs font-semibold tracking-wider uppercase text-[#697565]">
                  Step 9
                </span>
                <h3 className="text-2xl md:text-3xl font-bold text-[#ECDFCC]">Final Result & Precision Interpretation</h3>
              </div>
            </div>
            {expandedSteps[9] ? <ChevronUp className="w-6 h-6 text-[#697565]" /> : <ChevronDown className="w-6 h-6 text-[#697565]" />}
          </div>

          {expandedSteps[9] && (
            <div className="mt-8 space-y-6 pt-6 border-t border-[#3C3D37]/60">
              <div className="p-6 md:p-8 rounded-2xl bg-[#3C3D37]/20 border border-[#3C3D37] space-y-6 min-w-0">
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
                  <div className="min-w-0 p-4 rounded-xl bg-[#181C14] border border-[#3C3D37] space-y-1">
                    <span className="text-xs uppercase text-[#697565] font-semibold tracking-wider block">
                      Input Decimal
                    </span>
                    <div className="overflow-x-auto scrollbar-none min-w-0">
                      <span className="text-xl sm:text-2xl font-bold text-[#ECDFCC] block font-mono whitespace-nowrap">
                        {result.raw_input}
                      </span>
                    </div>
                  </div>

                  <div className="min-w-0 p-4 rounded-xl bg-[#181C14] border border-[#3C3D37] space-y-1">
                    <span className="text-xs uppercase text-[#697565] font-semibold tracking-wider block">
                      Selected Precision
                    </span>
                    <span className="text-xl sm:text-2xl font-bold text-[#ECDFCC] block">
                      {result.precision} ({result.step1.total_bits}-bit)
                    </span>
                  </div>

                  <div className="min-w-0 p-4 rounded-xl bg-[#181C14] border border-[#3C3D37] space-y-1">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs uppercase text-[#697565] font-semibold tracking-wider block">
                        Hexadecimal Output
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          navigator.clipboard.writeText(result.step9.hex_string);
                          setCopiedHexStep9(true);
                          setTimeout(() => setCopiedHexStep9(false), 2000);
                        }}
                        title="Copy Hex representation"
                        className="p-1.5 rounded-lg bg-[#3C3D37]/60 hover:bg-[#3C3D37] text-[#ECDFCC] border border-[#3C3D37] transition-colors flex-shrink-0"
                      >
                        {copiedHexStep9 ? (
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                        ) : (
                          <Copy className="w-3.5 h-3.5 text-[#697565]" />
                        )}
                      </button>
                    </div>
                    <div className="overflow-x-auto scrollbar-none min-w-0 py-0.5">
                      <span className="text-base sm:text-lg md:text-xl font-bold text-[#ECDFCC] tracking-wider font-mono whitespace-nowrap block">
                        {result.step9.hex_string}
                      </span>
                    </div>
                  </div>

                  <div className="min-w-0 p-4 rounded-xl bg-[#181C14] border border-[#3C3D37] space-y-1">
                    <span className="text-xs uppercase text-[#697565] font-semibold tracking-wider block">
                      Representation Status
                    </span>
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs sm:text-sm font-semibold mt-1 max-w-full ${
                      result.step9.is_exact ? 'bg-emerald-900/60 text-emerald-300' : 'bg-amber-900/60 text-amber-300'
                    }`}>
                      <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                      <span className="truncate min-w-0">{result.step9.is_exact ? 'Exact Representation' : 'Rounded / Inexact'}</span>
                    </span>
                  </div>
                </div>

                <div className="pt-4 border-t border-[#3C3D37]/40 space-y-3">
                  <div className="p-4 rounded-xl bg-[#181C14] border border-[#3C3D37] space-y-2 min-w-0">
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-xs font-semibold uppercase tracking-wider text-[#697565]">
                        Decoded Machine Decimal Value
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          navigator.clipboard.writeText(result.step9.exact_decoded_decimal);
                          setCopiedDecimalStep9(true);
                          setTimeout(() => setCopiedDecimalStep9(false), 2000);
                        }}
                        title="Copy Decoded Decimal value"
                        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-[#3C3D37]/50 hover:bg-[#3C3D37] text-[#ECDFCC] text-xs font-semibold uppercase tracking-wider border border-[#3C3D37] transition-colors flex-shrink-0"
                      >
                        {copiedDecimalStep9 ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                            <span className="text-emerald-400">Copied</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5 text-[#697565]" />
                            <span>Copy Value</span>
                          </>
                        )}
                      </button>
                    </div>
                    <div className="overflow-x-auto scrollbar-thin py-1 min-w-0">
                      <span className="text-base sm:text-lg font-bold text-[#ECDFCC] tabular-nums font-mono whitespace-nowrap block">
                        {result.step9.exact_decoded_decimal}
                      </span>
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-[#181C14] border border-[#3C3D37] space-y-1.5 min-w-0">
                    <span className="text-xs font-semibold uppercase tracking-wider text-[#697565] block">
                      Representation Error / Difference |x - x̂|
                    </span>
                    <div className="overflow-x-auto scrollbar-thin min-w-0">
                      <span className="text-sm sm:text-base font-semibold text-[#ECDFCC]/80 tabular-nums font-mono whitespace-nowrap block">
                        {result.step9.difference}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-[#181C14] border border-[#3C3D37] text-base text-[#ECDFCC]/90 leading-relaxed">
                  {result.step9.explanation}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};
