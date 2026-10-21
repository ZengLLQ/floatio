import React, { useState, useEffect, useCallback } from 'react';
import { Header } from './components/Header';
import { InputSection } from './components/InputSection';
import { BitVisualization } from './components/BitVisualization';
import { ResultSummary } from './components/ResultSummary';
import { StepSection } from './components/StepSection';
import { Footer } from './components/Footer';
import { convertDecimal } from './services/converter';
import { ConversionResult, Precision } from './types';

export const App: React.FC = () => {
  const [inputVal, setInputVal] = useState<string>('126.25');
  const [precision, setPrecision] = useState<Precision>('Single');
  const [result, setResult] = useState<ConversionResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const runConversion = useCallback(async (val: string, prec: Precision) => {
    try {
      setError(null);
      const res = await convertDecimal(val, prec);
      setResult(res);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Conversion error');
    }
  }, []);

  // Run initial conversion on mount
  useEffect(() => {
    runConversion('126.25', 'Single');
  }, [runConversion]);

  // Re-run conversion when precision changes
  const handlePrecisionChange = (p: Precision) => {
    setPrecision(p);
    if (inputVal.trim()) {
      runConversion(inputVal, p);
    }
  };

  const handleSelectExample = (val: string) => {
    setInputVal(val);
    runConversion(val, precision);
  };

  const handleConvert = () => {
    if (!inputVal.trim()) {
      setError('Please enter a decimal number');
      return;
    }
    runConversion(inputVal, precision);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#181C14] text-[#ECDFCC]">
      <Header />

      <main className="flex-1 w-full max-w-[1560px] mx-auto px-6 md:px-12">
        <InputSection
          inputVal={inputVal}
          setInputVal={setInputVal}
          precision={precision}
          setPrecision={handlePrecisionChange}
          onConvert={handleConvert}
          onSelectExample={handleSelectExample}
          error={error}
        />

        {result && (
          <div className="space-y-12 animate-in fade-in duration-300">
            <BitVisualization result={result} />
            <ResultSummary result={result} />
            <StepSection result={result} />
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default App;
