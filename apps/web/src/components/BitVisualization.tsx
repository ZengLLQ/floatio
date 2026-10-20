import React, { useState } from 'react';
import { ConversionResult } from '../types';
import { Copy, Check, Info } from 'lucide-react';

interface BitVisualizationProps {
  result: ConversionResult;
}

export const BitVisualization: React.FC<BitVisualizationProps> = ({ result }) => {
  const [copied, setCopied] = useState(false);
  const [selectedField, setSelectedField] = useState<'sign' | 'exponent' | 'fraction' | null>(null);

  const signBit = result.step7.sign_bit;
  const expBits = result.step7.exponent_bits;
  const fracBits = result.step7.fraction_bits;
  const totalBits = result.step1.total_bits;

  const handleCopy = () => {
    navigator.clipboard.writeText(result.bit_pattern);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getFieldInfo = () => {
    switch (selectedField) {
      case 'sign':
        return {
          title: 'Sign Bit (1 bit)',
          range: `Bit ${totalBits - 1}`,
          desc: `Stores the sign of the number: 0 for positive (or +0), 1 for negative (or -0). Current value: ${signBit}.`,
        };
      case 'exponent':
        return {
          title: `Biased Exponent (${expBits.length} bits)`,
          range: `Bits ${totalBits - 2} to ${totalBits - 1 - expBits.length}`,
          desc: `Encodes the magnitude scale with bias ${result.step1.bias}. Unbiased exponent e = ${result.step4.unbiased_exponent}, Biased E = ${result.step5.biased_exponent} (${expBits}₂).`,
        };
      case 'fraction':
        return {
          title: `Fraction / Mantissa (${fracBits.length} bits)`,
          range: `Bits ${totalBits - 2 - expBits.length} to 0`,
          desc: `Stores the fractional significand bits after the implicit leading bit (1 for normal numbers, 0 for subnormal). Stored: ${fracBits}.`,
        };
      default:
        return null;
    }
  };

  const activeInfo = getFieldInfo();

  return (
    <section className="w-full my-12 bg-[#181C14] border border-[#3C3D37] rounded-3xl p-6 md:p-10 shadow-2xl space-y-8">
      {/* Header with Title and Copy */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-semibold tracking-wider uppercase text-[#697565]">
            Field Decomposition
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-[#ECDFCC] tracking-tight mt-1">
            IEEE 754 Bit Pattern
          </h2>
        </div>

        <button
          type="button"
          onClick={handleCopy}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#3C3D37]/40 hover:bg-[#3C3D37] text-[#ECDFCC] text-sm font-semibold border border-[#3C3D37] hover:border-[#697565] transition-all duration-150"
        >
          {copied ? (
            <>
              <Check className="w-4 h-4 text-emerald-400" />
              <span className="text-emerald-400">Copied 32/64-bit Pattern</span>
            </>
          ) : (
            <>
              <Copy className="w-4 h-4 text-[#697565]" />
              <span>Copy Full Bit Pattern</span>
            </>
          )}
        </button>
      </div>

      {/* Proportional Overview Bar */}
      <div className="space-y-3">
        <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-[#ECDFCC]/60">
          <span>Sign (1b)</span>
          <span>Biased Exponent ({expBits.length}b)</span>
          <span>Fraction / Significand ({fracBits.length}b)</span>
        </div>

        <div className="w-full h-14 rounded-2xl overflow-hidden flex border-2 border-[#3C3D37] bg-[#181C14] p-1 gap-1">
          {/* Sign Bar Segment */}
          <button
            type="button"
            onClick={() => setSelectedField(selectedField === 'sign' ? null : 'sign')}
            style={{ flex: `1 1 ${(1 / totalBits) * 100}%` }}
            className={`min-w-[48px] rounded-xl flex items-center justify-center font-bold text-sm tracking-wider transition-all duration-150 ${
              selectedField === 'sign'
                ? 'bg-[#ECDFCC] text-[#181C14] ring-2 ring-[#ECDFCC]'
                : 'bg-[#697565]/40 text-[#ECDFCC] hover:bg-[#697565]/60'
            }`}
            title="Click to inspect Sign Bit"
          >
            S
          </button>

          {/* Exponent Bar Segment */}
          <button
            type="button"
            onClick={() => setSelectedField(selectedField === 'exponent' ? null : 'exponent')}
            style={{ flex: `${expBits.length} ${expBits.length} ${(expBits.length / totalBits) * 100}%` }}
            className={`rounded-xl flex items-center justify-center font-bold text-sm tracking-wider transition-all duration-150 ${
              selectedField === 'exponent'
                ? 'bg-[#ECDFCC] text-[#181C14] ring-2 ring-[#ECDFCC]'
                : 'bg-[#697565] text-[#181C14] hover:bg-[#697565]/80'
            }`}
            title="Click to inspect Exponent Field"
          >
            EXPONENT ({expBits.length}b)
          </button>

          {/* Fraction Bar Segment */}
          <button
            type="button"
            onClick={() => setSelectedField(selectedField === 'fraction' ? null : 'fraction')}
            style={{ flex: `${fracBits.length} ${fracBits.length} ${(fracBits.length / totalBits) * 100}%` }}
            className={`rounded-xl flex items-center justify-center font-bold text-sm tracking-wider transition-all duration-150 ${
              selectedField === 'fraction'
                ? 'bg-[#ECDFCC] text-[#181C14] ring-2 ring-[#ECDFCC]'
                : 'bg-[#3C3D37] text-[#ECDFCC] hover:bg-[#3C3D37]/80'
            }`}
            title="Click to inspect Fraction Field"
          >
            FRACTION ({fracBits.length}b)
          </button>
        </div>
      </div>

      {/* Field Inspection Callout when a segment is clicked */}
      {activeInfo && (
        <div className="bg-[#3C3D37]/30 border border-[#697565]/40 rounded-2xl p-5 flex items-start gap-4 animate-in fade-in duration-200">
          <div className="p-2 rounded-xl bg-[#697565]/20 text-[#ECDFCC] mt-0.5">
            <Info className="w-5 h-5 text-[#ECDFCC]" />
          </div>
          <div>
            <div className="flex items-center gap-3">
              <h4 className="text-base font-bold text-[#ECDFCC]">{activeInfo.title}</h4>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-[#3C3D37] text-[#ECDFCC]/80 font-medium">
                {activeInfo.range}
              </span>
            </div>
            <p className="text-sm text-[#ECDFCC]/80 mt-1.5 leading-relaxed">{activeInfo.desc}</p>
          </div>
        </div>
      )}

      {/* Complete Bit String Display with Field Badges */}
      <div className="space-y-4">
        <span className="text-xs font-semibold tracking-wider uppercase text-[#697565]">
          Encoded Bit Stream
        </span>

        <div className="p-6 rounded-2xl bg-[#181C14] border border-[#3C3D37] space-y-6">
          <div className="flex flex-wrap items-center gap-4 text-2xl sm:text-3xl md:text-4xl font-bold tracking-widest tabular-nums">
            {/* Sign Bit */}
            <div className="flex flex-col items-center">
              <span className="text-xs uppercase text-[#697565] tracking-widest mb-1">Sign</span>
              <span className="px-3 py-1.5 rounded-xl bg-[#697565]/30 text-[#ECDFCC] border border-[#697565]/40">
                {signBit}
              </span>
            </div>

            <span className="text-[#3C3D37] text-2xl select-none">|</span>

            {/* Exponent Bits */}
            <div className="flex flex-col items-center">
              <span className="text-xs uppercase text-[#697565] tracking-widest mb-1">
                Exponent ({expBits.length}b)
              </span>
              <span className="px-4 py-1.5 rounded-xl bg-[#697565] text-[#181C14] font-bold">
                {expBits}
              </span>
            </div>

            <span className="text-[#3C3D37] text-2xl select-none">|</span>

            {/* Fraction Bits */}
            <div className="flex flex-col items-start flex-1 min-w-[240px]">
              <span className="text-xs uppercase text-[#697565] tracking-widest mb-1">
                Fraction ({fracBits.length}b)
              </span>
              <span className="px-4 py-1.5 rounded-xl bg-[#3C3D37] text-[#ECDFCC] font-semibold break-all tracking-wider text-xl sm:text-2xl md:text-3xl">
                {fracBits}
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
