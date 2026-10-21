import React, { useState, useEffect } from 'react';
import { Play, Pause, RotateCcw, ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';
import { formatNibbles } from '../utils/format';

interface BinaryPointNormalizerProps {
  binaryBefore: string;
  unbiasedExp: number;
  shiftAmount: number;
  shiftDirection: string; // "left", "right", or "none"
  normalizedForm: string;
  hiddenBit: string;
  isSubnormal: boolean;
}

export const BinaryPointNormalizer: React.FC<BinaryPointNormalizerProps> = ({
  binaryBefore,
  unbiasedExp: _unbiasedExp,
  shiftAmount,
  shiftDirection,
  normalizedForm: _normalizedForm,
  hiddenBit: _hiddenBit,
  isSubnormal,
}) => {
  const [currentStep, setCurrentStep] = useState<number>(shiftAmount);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);

  // When props change (e.g. new input), set to completed step
  useEffect(() => {
    setCurrentStep(shiftAmount);
    setIsPlaying(false);
  }, [binaryBefore, shiftAmount, shiftDirection]);

  // Animation interval
  useEffect(() => {
    if (!isPlaying) return;
    const interval = setInterval(() => {
      setCurrentStep((prev) => {
        if (prev >= shiftAmount) {
          setIsPlaying(false);
          return shiftAmount;
        }
        return prev + 1;
      });
    }, 600);
    return () => clearInterval(interval);
  }, [isPlaying, shiftAmount]);

  if (isSubnormal || shiftDirection === 'none' || shiftAmount === 0) {
    const cleanBefore = binaryBefore.replace(/(?:_2|₂)$/, '').trim();
    const formattedBefore =
      cleanBefore === 'NaN' || cleanBefore === 'Infinity' || cleanBefore === '-Infinity'
        ? cleanBefore
        : `${formatNibbles(cleanBefore)}₂`;

    return (
      <div className="p-6 rounded-2xl bg-[#3C3D37]/30 border border-[#3C3D37] space-y-4 min-w-0">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-[#697565]">
            Binary Point Position
          </span>
          <span className="text-xs px-2.5 py-1 rounded-full bg-[#3C3D37] text-[#ECDFCC] font-semibold">
            {isSubnormal ? 'Subnormal Number' : 'Zero Shift Required'}
          </span>
        </div>
        <div className="overflow-x-auto scrollbar-thin py-2 min-w-0">
          <span className="text-xl sm:text-2xl font-bold text-[#ECDFCC] tabular-nums tracking-wider font-mono whitespace-nowrap block">
            {formattedBefore}
          </span>
        </div>
        <p className="text-sm text-[#ECDFCC]/70 leading-relaxed">
          {isSubnormal
            ? 'Subnormal numbers do not undergo standard normalization. The implicit leading bit is fixed at 0 to enable gradual underflow.'
            : 'The magnitude of this number already has exactly one non-zero bit preceding the binary point; no shift was needed (e = 0).'}
        </p>
      </div>
    );
  }

  // Parse digits around initial point
  // binaryBefore might have "_2" or "₂" suffix from steps.rs, strip it
  const cleanBinary = binaryBefore.replace(/(?:_2|₂)$/, '').trim();
  const [leftPart = '0', rightPart = '0'] = cleanBinary.split('.');

  // Compute the bit string representation at step `currentStep`
  // Left shift: point moves left from original index
  // Right shift: point moves right from original index
  const renderPointAtStep = () => {
    if (shiftDirection === 'left') {
      // Original: leftPart . rightPart
      // Shift left by s: moves point s positions into leftPart
      const s = currentStep;
      const splitIndex = Math.max(1, leftPart.length - s);
      const beforePoint = leftPart.slice(0, splitIndex);
      const afterPoint = leftPart.slice(splitIndex) + rightPart;
      return (
        <span>
          <span className="text-[#ECDFCC] font-bold">
            {formatNibbles(beforePoint, { alignRight: true })}
          </span>
          <span className="inline-block px-1.5 py-0.5 mx-1 rounded bg-[#697565] text-[#181C14] font-black text-xs animate-pulse">
            •
          </span>
          <span className="text-[#ECDFCC]/90">{formatNibbles(afterPoint)}</span>
        </span>
      );
    } else {
      // Right shift: point moves s positions into rightPart
      const s = currentStep;
      const combined = leftPart + rightPart;
      const dotPos = leftPart.length + s;
      const beforePoint = combined.slice(0, dotPos);
      const rawAfter = combined.slice(dotPos);
      const afterPoint = rawAfter.length > 0 ? rawAfter : '0';

      const lastBeforeChar = beforePoint.slice(-1);
      const leadingZeros = beforePoint.slice(0, -1);

      return (
        <span>
          {leadingZeros && <span className="text-[#ECDFCC]/40">{formatNibbles(leadingZeros, { alignRight: true })} </span>}
          <span className="text-[#ECDFCC] font-bold">{lastBeforeChar}</span>
          <span className="inline-block px-1.5 py-0.5 mx-1 rounded bg-[#697565] text-[#181C14] font-black text-xs animate-pulse">
            •
          </span>
          <span className="text-[#ECDFCC]/90">{formatNibbles(afterPoint)}</span>
        </span>
      );
    }
  };

  const currentExponentVal = shiftDirection === 'left' ? currentStep : -currentStep;
  const isComplete = currentStep === shiftAmount;

  return (
    <div className="p-6 rounded-2xl bg-[#3C3D37]/25 border border-[#3C3D37] space-y-6 min-w-0">
      {/* Title & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-[#697565]">
            Interactive Demonstration
          </span>
          <h4 className="text-lg md:text-xl font-bold text-[#ECDFCC] flex items-center gap-2 mt-0.5">
            <span>Movement of the Binary Point</span>
            {isComplete && <Sparkles className="w-4 h-4 text-[#697565]" />}
          </h4>
        </div>

        {/* Animation & Scrubber Controls */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              setCurrentStep(0);
              setIsPlaying(true);
            }}
            title="Replay shift animation"
            className="p-2 rounded-xl bg-[#3C3D37]/50 hover:bg-[#3C3D37] text-[#ECDFCC] border border-[#3C3D37] transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={() => setIsPlaying(!isPlaying)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#697565] hover:bg-[#697565]/80 text-[#ECDFCC] text-xs font-bold tracking-wider uppercase transition-colors"
          >
            {isPlaying ? (
              <>
                <Pause className="w-3.5 h-3.5" />
                <span>Pause</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5" />
                <span>{isComplete ? 'Replay' : 'Play'}</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={() => {
              setIsPlaying(false);
              setCurrentStep((p) => Math.max(0, p - 1));
            }}
            disabled={currentStep === 0}
            className="p-2 rounded-xl bg-[#3C3D37]/50 hover:bg-[#3C3D37] text-[#ECDFCC] disabled:opacity-30 border border-[#3C3D37] transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <div className="px-3 py-1.5 rounded-xl bg-[#181C14] border border-[#3C3D37] text-xs font-bold text-[#ECDFCC] tabular-nums">
            {currentStep} / {shiftAmount}
          </div>

          <button
            type="button"
            onClick={() => {
              setIsPlaying(false);
              setCurrentStep((p) => Math.min(shiftAmount, p + 1));
            }}
            disabled={currentStep === shiftAmount}
            className="p-2 rounded-xl bg-[#3C3D37]/50 hover:bg-[#3C3D37] text-[#ECDFCC] disabled:opacity-30 border border-[#3C3D37] transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Visual Bit Stream with Active Binary Point */}
      <div className="p-5 rounded-2xl bg-[#181C14] border border-[#3C3D37] overflow-x-auto scrollbar-thin">
        <div className="text-xl sm:text-2xl md:text-3xl font-bold tracking-widest tabular-nums font-mono whitespace-nowrap">
          {renderPointAtStep()}₂
        </div>
      </div>

      {/* Step Progress Slider */}
      <div className="space-y-2">
        <div className="flex justify-between items-center text-xs font-semibold uppercase tracking-wider text-[#ECDFCC]/60">
          <span>Initial (Step 0)</span>
          <span className="text-[#ECDFCC] font-bold">
            Shifted {currentStep} position{currentStep === 1 ? '' : 's'} {shiftDirection}
          </span>
          <span>Normalized (Step {shiftAmount})</span>
        </div>
        <input
          type="range"
          min={0}
          max={shiftAmount}
          value={currentStep}
          onChange={(e) => {
            setIsPlaying(false);
            setCurrentStep(parseInt(e.target.value, 10));
          }}
          className="w-full accent-[#697565] cursor-pointer h-2 bg-[#3C3D37] rounded-lg"
        />
      </div>

      {/* Dynamic Exponent & State Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-[#3C3D37]/50">
        <div className="p-4 rounded-xl bg-[#3C3D37]/30 border border-[#3C3D37] flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-[#697565]">
            Current Exponent (e)
          </span>
          <span className="text-xl font-bold text-[#ECDFCC] tabular-nums">
            2<sup>{currentExponentVal}</sup> (e = {currentExponentVal})
          </span>
        </div>

        <div className="p-4 rounded-xl bg-[#3C3D37]/30 border border-[#3C3D37] flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-[#697565]">
            Normalization Status
          </span>
          <span
            className={`text-sm font-bold px-3 py-1 rounded-full ${
              isComplete
                ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-800'
                : 'bg-amber-950/80 text-amber-300 border border-amber-800'
            }`}
          >
            {isComplete ? 'Fully Normalized' : `Shifting (${shiftAmount - currentStep} ${shiftDirection})`}
          </span>
        </div>
      </div>
    </div>
  );
};
