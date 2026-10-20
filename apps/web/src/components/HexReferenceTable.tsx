import React from 'react';

const HEX_PAIRS = [
  { hex1: '0', bin1: '0000', hex2: '8', bin2: '1000' },
  { hex1: '1', bin1: '0001', hex2: '9', bin2: '1001' },
  { hex1: '2', bin1: '0010', hex2: 'A', bin2: '1010' },
  { hex1: '3', bin1: '0011', hex2: 'B', bin2: '1011' },
  { hex1: '4', bin1: '0100', hex2: 'C', bin2: '1100' },
  { hex1: '5', bin1: '0101', hex2: 'D', bin2: '1101' },
  { hex1: '6', bin1: '0110', hex2: 'E', bin2: '1110' },
  { hex1: '7', bin1: '0111', hex2: 'F', bin2: '1111' },
];

export const HexReferenceTable: React.FC = () => {
  return (
    <div className="p-6 rounded-2xl bg-[#3C3D37]/30 border border-[#3C3D37] space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="text-base font-bold text-[#ECDFCC]">
          4-Bit Hex Reference Table
        </h4>
        <span className="text-xs uppercase text-[#697565] font-semibold">
          Standard
        </span>
      </div>

      <div className="overflow-hidden rounded-xl border border-[#3C3D37]">
        <table className="w-full text-center text-sm border-collapse">
          <thead>
            <tr className="bg-[#3C3D37]/60 text-[#697565] uppercase text-xs border-b border-[#3C3D37]">
              <th className="py-2.5 px-3 font-semibold">Hex</th>
              <th className="py-2.5 px-3 font-semibold">Binary</th>
              <th className="py-2.5 px-3 font-semibold border-l border-[#3C3D37]">Hex</th>
              <th className="py-2.5 px-3 font-semibold">Binary</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#3C3D37]/40 tabular-nums">
            {HEX_PAIRS.map((row, idx) => (
              <tr key={idx} className="hover:bg-[#3C3D37]/20 transition-colors">
                <td className="py-2 px-3 font-bold text-[#ECDFCC]">{row.hex1}</td>
                <td className="py-2 px-3 tracking-widest text-[#ECDFCC]/80">{row.bin1}</td>
                <td className="py-2 px-3 font-bold text-[#ECDFCC] border-l border-[#3C3D37]">{row.hex2}</td>
                <td className="py-2 px-3 tracking-widest text-[#ECDFCC]/80">{row.bin2}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
