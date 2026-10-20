import React from 'react';
import { Precision } from '../types';
import { ArrowRight, X } from 'lucide-react';

interface InputSectionProps {
  inputVal: string;
  setInputVal: (val: string) => void;
  precision: Precision;
  setPrecision: (p: Precision) => void;
  onConvert: () => void;
  error: string | null;
}

const PRESET_EXAMPLES = [
  { label: '126.25', desc: 'Standard decimal' },
  { label: '0.1', desc: 'Repeating binary fraction' },
  { label: '-13.5', desc: 'Negative value' },
  { label: '-0', desc: 'Signed negative zero' },
  { label: '1.25e-10', desc: 'Scientific notation' },
  { label: '1.40129846e-45', desc: 'Subnormal single' },
  { label: 'Infinity', desc: 'Positive infinity' },
  { label: 'NaN', desc: 'Not-a-Number' },
];

export const InputSection: React.FC<InputSectionProps> = ({
  inputVal,
  setInputVal,
  precision,
  setPrecision,
  onConvert,
  error,
}) => {
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      onConvert();
    }
  };

  return (
    <section className="w-full pt-12 pb-16">
      {/* Editorial Hero Heading */}
      <div className="mb-12">
        <h1 className="text-5xl sm:text-7xl lg:text-8xl font-bold tracking-tight text-[#ECDFCC] leading-[1.05] mb-6">
          Floating-Point, <br className="hidden sm:inline" />
          <span className="text-[#697565]">Bit by Bit.</span>
        </h1>
        <p className="text-lg md:text-xl text-[#ECDFCC]/70 max-w-3xl leading-relaxed">
          Convert any real number into IEEE 754 representation with complete, rigorous mathematical derivations from integer division to final hexadecimal encoding.
        </p>
      </div>

      {/* Main Input & Control Container */}
      <div className="bg-[#181C14] border border-[#3C3D37] rounded-3xl p-6 md:p-10 shadow-2xl space-y-8">
        {/* Precision Selector */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#3C3D37]/60">
          <span className="text-sm font-semibold tracking-wider uppercase text-[#697565]">
            Target Precision
          </span>
          <div className="inline-flex p-1.5 rounded-2xl bg-[#3C3D37]/40 border border-[#3C3D37]">
            <button
              type="button"
              onClick={() => setPrecision('Single')}
              className={`px-6 py-2.5 rounded-xl text-base font-semibold transition-all duration-200 ${
                precision === 'Single'
                  ? 'bg-[#ECDFCC] text-[#181C14] shadow-md'
                  : 'text-[#ECDFCC]/70 hover:text-[#ECDFCC]'
              }`}
            >
              Single (32-bit / binary32)
            </button>
            <button
              type="button"
              onClick={() => setPrecision('Double')}
              className={`px-6 py-2.5 rounded-xl text-base font-semibold transition-all duration-200 ${
                precision === 'Double'
                  ? 'bg-[#ECDFCC] text-[#181C14] shadow-md'
                  : 'text-[#ECDFCC]/70 hover:text-[#ECDFCC]'
              }`}
            >
              Double (64-bit / binary64)
            </button>
          </div>
        </div>

        {/* Large Decimal Input */}
        <div>
          <label htmlFor="decimal-input" className="block text-sm font-semibold tracking-wider uppercase text-[#697565] mb-3">
            Decimal Input Value
          </label>
          <div className="relative flex items-center">
            <input
              id="decimal-input"
              type="text"
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="e.g. 126.25, 0.1, -13.5, -0"
              className="w-full bg-[#181C14] text-[#ECDFCC] text-3xl sm:text-4xl md:text-5xl font-medium tracking-tight px-6 py-5 rounded-2xl border-2 border-[#3C3D37] focus:border-[#ECDFCC] focus:outline-none transition-colors duration-200 pr-32 placeholder:text-[#3C3D37]"
            />
            
            <div className="absolute right-4 flex items-center gap-2">
              {inputVal && (
                <button
                  type="button"
                  onClick={() => setInputVal('')}
                  aria-label="Clear input"
                  className="p-2.5 rounded-xl text-[#ECDFCC]/60 hover:text-[#ECDFCC] hover:bg-[#3C3D37]/60 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
              <button
                type="button"
                onClick={onConvert}
                className="flex items-center gap-2 px-6 py-4 rounded-xl bg-[#697565] hover:bg-[#697565]/80 text-[#ECDFCC] font-semibold text-lg transition-all duration-200 shadow-lg"
              >
                <span>Convert</span>
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </div>

          {error && (
            <div className="mt-3 text-red-400 text-sm font-medium flex items-center gap-2">
              <span>{error}</span>
            </div>
          )}
        </div>

        {/* Clickable Preset Values */}
        <div>
          <span className="block text-xs font-semibold tracking-wider uppercase text-[#697565] mb-3">
            Quick Examples
          </span>
          <div className="flex flex-wrap gap-2.5">
            {PRESET_EXAMPLES.map((item) => (
              <button
                key={item.label}
                type="button"
                onClick={() => {
                  setInputVal(item.label);
                }}
                className={`px-4 py-2 rounded-xl text-sm font-medium border transition-all duration-150 ${
                  inputVal === item.label
                    ? 'bg-[#3C3D37] text-[#ECDFCC] border-[#697565]'
                    : 'bg-[#3C3D37]/30 text-[#ECDFCC]/80 border-[#3C3D37] hover:border-[#697565]/60 hover:text-[#ECDFCC]'
                }`}
                title={item.desc}
              >
                <span className="font-semibold">{item.label}</span>
                <span className="ml-2 text-xs text-[#697565]">({item.desc})</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
