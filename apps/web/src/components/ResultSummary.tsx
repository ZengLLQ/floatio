import React, { useState } from 'react';
import { ConversionResult } from '../types';
import { Copy, Check, CheckCircle2, AlertCircle, Binary } from 'lucide-react';
import { formatNibbles } from '../utils/format';

interface ResultSummaryProps {
  result: ConversionResult;
}

export const ResultSummary: React.FC<ResultSummaryProps> = ({ result }) => {
  const [copiedHex, setCopiedHex] = useState<boolean>(false);
  const [copiedBits, setCopiedBits] = useState<boolean>(false);

  const handleCopyHex = () => {
    navigator.clipboard.writeText(result.hex_string);
    setCopiedHex(true);
    setTimeout(() => setCopiedHex(false), 2000);
  };

  const handleCopyBits = () => {
    navigator.clipboard.writeText(result.bit_pattern);
    setCopiedBits(true);
    setTimeout(() => setCopiedBits(false), 2000);
  };

  return (
    <div className="w-full bg-[#181C14] border border-[#3C3D37] rounded-3xl p-6 md:p-10 shadow-2xl space-y-8">
      {/* Header with Title, Hex Display, Copy Action, and Representation Status */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5 pb-6 border-b border-[#3C3D37]/60">
        {/* Left Column: Result Label + Monospace Hex String + Inline Copy Button */}
        <div className="space-y-2 min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold tracking-wider uppercase text-[#697565]">
              Primary Hexadecimal Result
            </span>
            <span className="px-2 py-0.5 rounded-md bg-[#3C3D37]/50 text-[#ECDFCC]/80 text-[11px] font-mono font-medium border border-[#3C3D37]">
              {result.precision} ({result.step1.total_bits}-bit)
            </span>
          </div>

          <div className="flex items-center gap-3 min-w-0">
            <div className="min-w-0 max-w-full overflow-x-auto scrollbar-none py-1">
              <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-[#ECDFCC] tracking-tight font-mono whitespace-nowrap">
                {result.hex_string}
              </h2>
            </div>

            <button
              type="button"
              onClick={handleCopyHex}
              title="Copy Hexadecimal representation"
              className="p-2.5 sm:px-3.5 sm:py-2.5 rounded-xl bg-[#3C3D37]/50 hover:bg-[#3C3D37] text-[#ECDFCC] border border-[#3C3D37] hover:border-[#697565] transition-all duration-150 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider flex-shrink-0 cursor-pointer shadow-sm active:scale-95"
            >
              {copiedHex ? (
                <>
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span className="text-emerald-400 hidden sm:inline">Copied Hex</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 text-[#697565]" />
                  <span className="hidden sm:inline">Copy Hex</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Right Column: Representation Status Badge */}
        <div className="flex flex-col lg:items-end gap-1.5 flex-shrink-0 self-start lg:self-center">
          <span className="text-xs font-semibold tracking-wider uppercase text-[#697565]">
            Representation Status
          </span>
          <div
            className={`px-3.5 py-1.5 rounded-full inline-flex items-center gap-2 text-xs sm:text-sm font-semibold border ${
              result.step9.is_exact
                ? 'bg-emerald-950/60 border-emerald-800 text-emerald-300'
                : 'bg-amber-950/60 border-amber-800 text-amber-300'
            }`}
          >
            {result.step9.is_exact ? (
              <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
            )}
            <span className="whitespace-nowrap">
              {result.step9.is_exact ? 'Exact Representation' : 'Rounded / Inexact'}
            </span>
          </div>
        </div>
      </div>

      {/* Numerical Breakdown Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Sign Card */}
        <div className="p-5 rounded-2xl bg-[#3C3D37]/25 border border-[#3C3D37] space-y-1.5 min-w-0">
          <span className="text-xs font-semibold uppercase tracking-wider text-[#697565]">
            Sign Bit (1 bit)
          </span>
          <div className="text-2xl sm:text-3xl font-bold text-[#ECDFCC] tabular-nums">
            {result.sign_bit}{' '}
            <span className="text-xs font-medium text-[#697565]">
              ({result.sign_bit === 1 ? 'Negative / -0' : 'Positive / +0'})
            </span>
          </div>
        </div>

        {/* Biased Exponent Card */}
        <div className="p-5 rounded-2xl bg-[#3C3D37]/25 border border-[#3C3D37] space-y-1.5 min-w-0">
          <span className="text-xs font-semibold uppercase tracking-wider text-[#697565]">
            Biased Exponent ({result.step1.exponent_bits} bits)
          </span>
          <div className="text-2xl sm:text-3xl font-bold text-[#ECDFCC] tabular-nums font-mono">
            {result.exponent_raw}{' '}
            <span className="text-xs font-medium text-[#697565]">
              (e = {result.step4.unbiased_exponent})
            </span>
          </div>
        </div>

        {/* Fraction Bits Card */}
        <div className="p-5 rounded-2xl bg-[#3C3D37]/25 border border-[#3C3D37] space-y-1.5 min-w-0">
          <span className="text-xs font-semibold uppercase tracking-wider text-[#697565]">
            Fraction Width
          </span>
          <div className="text-2xl sm:text-3xl font-bold text-[#ECDFCC] tabular-nums font-mono">
            {result.step1.fraction_bits} bits{' '}
            <span className="text-xs font-medium text-[#697565]">
              ({result.precision})
            </span>
          </div>
        </div>

        {/* Decoded Machine Value */}
        <div className="p-5 rounded-2xl bg-[#3C3D37]/25 border border-[#3C3D37] space-y-1.5 min-w-0">
          <span className="text-xs font-semibold uppercase tracking-wider text-[#697565]">
            Decoded Decimal Value
          </span>
          <div className="text-xl sm:text-2xl font-bold text-[#ECDFCC] tabular-nums truncate font-mono" title={result.step9.exact_decoded_decimal}>
            {result.step9.exact_decoded_decimal}
          </div>
        </div>
      </div>

      {/* Bit Pattern Stream with Copy Button */}
      <div className="p-5 rounded-2xl bg-[#3C3D37]/20 border border-[#3C3D37] flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-2 overflow-x-auto scrollbar-thin flex-1 min-w-0 pr-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-[#697565] flex items-center gap-1.5">
            <Binary className="w-3.5 h-3.5" />
            <span>Full Binary Representation ({result.step1.total_bits} bits)</span>
          </span>
          <div className="font-mono text-sm sm:text-base md:text-lg font-bold tabular-nums tracking-wider whitespace-nowrap flex items-center gap-2">
            <span
              className="px-2 py-0.5 rounded-lg bg-[#697565]/30 text-[#ECDFCC] border border-[#697565]/50 flex-shrink-0"
              title="Sign Bit (1 bit)"
            >
              {result.step7.sign_bit}
            </span>
            <span
              className="px-2.5 py-0.5 rounded-lg bg-[#697565] text-[#181C14] flex-shrink-0"
              title={`Biased Exponent (${result.step7.exponent_bits.length} bits)`}
            >
              {result.step7.exponent_bits}
            </span>
            <span
              className="px-3 py-0.5 rounded-lg bg-[#3C3D37] text-[#ECDFCC] flex-shrink-0"
              title={`Fraction (${result.step7.fraction_bits.length} bits, 4-bit nibbles)`}
            >
              {formatNibbles(result.step7.fraction_bits)}
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={handleCopyBits}
          className="flex-shrink-0 inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#3C3D37]/60 hover:bg-[#3C3D37] text-[#ECDFCC] text-xs font-bold uppercase tracking-wider border border-[#3C3D37] transition-colors"
        >
          {copiedBits ? (
            <>
              <Check className="w-4 h-4 text-emerald-400" />
              <span className="text-emerald-400">Copied Bits</span>
            </>
          ) : (
            <>
              <Copy className="w-4 h-4 text-[#697565]" />
              <span>Copy Bits</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
