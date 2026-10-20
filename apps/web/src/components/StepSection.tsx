import React, { useState } from 'react';
import { ConversionResult } from '../types';
import { MathView } from './MathView';
import { HexReferenceTable } from './HexReferenceTable';
import { ChevronDown, ChevronUp, ChevronLeft, ChevronRight, CheckCircle2 } from 'lucide-react';

interface StepSectionProps {
  result: ConversionResult;
}

export const StepSection: React.FC<StepSectionProps> = ({ result }) => {
  const [activeStep, setActiveStep] = useState<number>(1);
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
                <div className="p-6 rounded-2xl bg-[#3C3D37]/20 border border-[#3C3D37] space-y-4">
                  <h4 className="text-sm font-semibold uppercase tracking-wider text-[#697565]">
                    Format Specification
                  </h4>
                  <ul className="space-y-2.5 text-base text-[#ECDFCC]/90">
                    <li className="flex justify-between border-b border-[#3C3D37]/40 pb-2">
                      <span className="text-[#ECDFCC]/60">Original Decimal Input:</span>
                      <span className="font-bold text-[#ECDFCC]">{result.raw_input}</span>
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

                <div className="p-6 rounded-2xl bg-[#3C3D37]/20 border border-[#3C3D37] flex flex-col justify-center space-y-4">
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
                <div className="p-6 rounded-2xl bg-[#3C3D37]/20 border border-[#3C3D37] space-y-4">
                  <h4 className="text-sm font-semibold uppercase tracking-wider text-[#697565]">
                    Sign Determination Rule
                  </h4>
                  <MathView math={result.step2.latex_formula} display />
                </div>

                <div className="p-6 rounded-2xl bg-[#3C3D37]/20 border border-[#3C3D37] space-y-4">
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

                <div className="p-4 rounded-xl bg-[#3C3D37]/20 border border-[#3C3D37] flex items-center justify-between">
                  <span className="text-sm font-semibold uppercase tracking-wider text-[#697565]">
                    Integer Binary Result
                  </span>
                  <span className="text-2xl font-bold text-[#ECDFCC] tabular-nums tracking-wider">
                    {result.step3.integer_binary}₂
                  </span>
                </div>
              </div>

              {/* Part B: Fractional Multiplication Table */}
              <div className="space-y-4 pt-4 border-t border-[#3C3D37]/40">
                <div className="flex items-center justify-between">
                  <h4 className="text-xl font-bold text-[#ECDFCC]">
                    Part B: Fractional Part (0.{result.step3.fractional_part_dec || '0'}₁₀)
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

                <div className="p-4 rounded-xl bg-[#3C3D37]/20 border border-[#3C3D37] flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <span className="text-sm font-semibold uppercase tracking-wider text-[#697565]">
                    Unnormalized Combined Binary
                  </span>
                  <span className="text-2xl font-bold text-[#ECDFCC] tabular-nums tracking-wider break-all">
                    {result.step3.combined_binary_unnormalized}₂
                  </span>
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

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="p-6 rounded-2xl bg-[#3C3D37]/20 border border-[#3C3D37] space-y-4">
                  <h4 className="text-sm font-semibold uppercase tracking-wider text-[#697565]">
                    Binary Point Transformation
                  </h4>
                  <MathView math={result.step4.latex_substitution} display />
                </div>

                <div className="p-6 rounded-2xl bg-[#3C3D37]/20 border border-[#3C3D37] space-y-4">
                  <h4 className="text-sm font-semibold uppercase tracking-wider text-[#697565]">
                    Normalization Result
                  </h4>
                  <div className="space-y-3">
                    <div className="flex justify-between border-b border-[#3C3D37]/40 pb-2">
                      <span className="text-[#ECDFCC]/60">Normalized Form:</span>
                      <span className="font-bold text-[#ECDFCC] text-lg tabular-nums">
                        {result.step4.normalized_form}
                      </span>
                    </div>
                    <div className="flex justify-between border-b border-[#3C3D37]/40 pb-2">
                      <span className="text-[#ECDFCC]/60">Unbiased Exponent (e):</span>
                      <span className="font-bold text-[#ECDFCC] text-lg tabular-nums">
                        {result.step4.unbiased_exponent}
                      </span>
                    </div>
                    <div className="flex justify-between border-b border-[#3C3D37]/40 pb-2">
                      <span className="text-[#ECDFCC]/60">Implicit (Hidden) Bit:</span>
                      <span className="font-bold text-[#ECDFCC] text-lg">
                        {result.step4.hidden_bit}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#ECDFCC]/60">Shift Amount & Direction:</span>
                      <span className="font-bold text-[#ECDFCC]">
                        {result.step4.shift_amount} positions {result.step4.shift_direction}
                      </span>
                    </div>
                  </div>
                  <p className="text-sm text-[#ECDFCC]/70 pt-2 leading-relaxed">
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
                <div className="p-6 rounded-2xl bg-[#3C3D37]/20 border border-[#3C3D37] space-y-4">
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
                <div className="p-6 rounded-2xl bg-[#3C3D37]/20 border border-[#3C3D37] space-y-4">
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

                  <div className="pt-2 flex justify-between items-center border-t border-[#3C3D37]/40">
                    <span className="text-xs uppercase text-[#697565] font-semibold">
                      Exponent Field (E)
                    </span>
                    <span className="text-xl font-bold text-[#ECDFCC] tabular-nums tracking-widest">
                      {result.step5.exponent_binary}₂
                    </span>
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

              <div className="p-6 rounded-2xl bg-[#3C3D37]/20 border border-[#3C3D37] space-y-5">
                <div className="space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#3C3D37]/40 pb-3">
                    <span className="text-sm font-semibold uppercase tracking-wider text-[#697565]">
                      Target Fraction Width
                    </span>
                    <span className="text-lg font-bold text-[#ECDFCC]">
                      {result.step6.target_bit_length} bits
                    </span>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#3C3D37]/40 pb-3">
                    <span className="text-sm font-semibold uppercase tracking-wider text-[#697565]">
                      Normalized Significand (with implicit bit)
                    </span>
                    <span className="text-base font-semibold text-[#ECDFCC] tabular-nums">
                      {result.step6.significand_with_hidden}
                    </span>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 pt-1">
                    <span className="text-sm font-semibold uppercase tracking-wider text-[#697565]">
                      Final Stored Fraction Bits ({result.step6.target_bit_length}b)
                    </span>
                    <span className="text-xl md:text-2xl font-bold text-[#ECDFCC] tabular-nums tracking-wider break-all max-w-xl text-right">
                      {result.step6.final_fraction_bits}
                    </span>
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

              <div className="p-6 rounded-2xl bg-[#3C3D37]/20 border border-[#3C3D37] space-y-4">
                <div className="flex flex-wrap items-center gap-4 text-2xl sm:text-3xl md:text-4xl font-bold tabular-nums">
                  <span className="px-3 py-1 rounded-xl bg-[#697565]/30 text-[#ECDFCC] border border-[#697565]">
                    {result.step7.sign_bit}
                  </span>
                  <span className="text-[#3C3D37]">+</span>
                  <span className="px-3 py-1 rounded-xl bg-[#697565] text-[#181C14]">
                    {result.step7.exponent_bits}
                  </span>
                  <span className="text-[#3C3D37]">+</span>
                  <span className="px-3 py-1 rounded-xl bg-[#3C3D37] text-[#ECDFCC] break-all">
                    {result.step7.fraction_bits}
                  </span>
                </div>

                <div className="pt-4 border-t border-[#3C3D37]/40 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <span className="text-xs font-semibold uppercase tracking-wider text-[#697565]">
                    Complete 32/64-Bit Representation
                  </span>
                  <span className="text-xl font-bold text-[#ECDFCC] tabular-nums tracking-widest break-all">
                    {result.step7.complete_bit_pattern}
                  </span>
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

                  <div className="p-4 rounded-xl bg-[#3C3D37]/30 border border-[#3C3D37] flex items-center justify-between">
                    <span className="text-sm font-semibold uppercase tracking-wider text-[#697565]">
                      Hexadecimal Word
                    </span>
                    <span className="text-3xl font-bold text-[#ECDFCC] tracking-widest">
                      {result.step8.hex_string}
                    </span>
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
              <div className="p-6 md:p-8 rounded-2xl bg-[#3C3D37]/20 border border-[#3C3D37] space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div>
                    <span className="text-xs uppercase text-[#697565] font-semibold tracking-wider block">
                      Input Decimal
                    </span>
                    <span className="text-2xl font-bold text-[#ECDFCC] mt-1 block">
                      {result.raw_input}
                    </span>
                  </div>

                  <div>
                    <span className="text-xs uppercase text-[#697565] font-semibold tracking-wider block">
                      Selected Precision
                    </span>
                    <span className="text-2xl font-bold text-[#ECDFCC] mt-1 block">
                      {result.precision} (binary{result.step1.total_bits})
                    </span>
                  </div>

                  <div>
                    <span className="text-xs uppercase text-[#697565] font-semibold tracking-wider block">
                      Hexadecimal Output
                    </span>
                    <span className="text-2xl font-bold text-[#ECDFCC] mt-1 block tracking-wider">
                      {result.step9.hex_string}
                    </span>
                  </div>

                  <div>
                    <span className="text-xs uppercase text-[#697565] font-semibold tracking-wider block">
                      Representation Status
                    </span>
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-semibold mt-1 ${
                      result.step9.is_exact ? 'bg-emerald-900/60 text-emerald-300' : 'bg-amber-900/60 text-amber-300'
                    }`}>
                      <CheckCircle2 className="w-4 h-4" />
                      {result.step9.is_exact ? 'Exact Representation' : 'Rounded / Inexact'}
                    </span>
                  </div>
                </div>

                <div className="pt-4 border-t border-[#3C3D37]/40 space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <span className="text-sm font-semibold uppercase tracking-wider text-[#697565]">
                      Decoded Machine Decimal Value
                    </span>
                    <span className="text-lg font-bold text-[#ECDFCC] tabular-nums break-all">
                      {result.step9.exact_decoded_decimal}
                    </span>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <span className="text-sm font-semibold uppercase tracking-wider text-[#697565]">
                      Representation Error / Difference |x - x̂|
                    </span>
                    <span className="text-sm font-medium text-[#ECDFCC]/80 tabular-nums">
                      {result.step9.difference}
                    </span>
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
