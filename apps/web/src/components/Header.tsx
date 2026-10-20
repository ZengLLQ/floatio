import React from 'react';
import { Cpu } from 'lucide-react';

export const Header: React.FC = () => {
  return (
    <header className="w-full border-b border-[#3C3D37]/50 bg-[#181C14]/90 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-[1560px] mx-auto px-6 md:px-12 py-5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-[#3C3D37] flex items-center justify-center border border-[#697565]/30 text-[#ECDFCC]">
            <Cpu className="w-5 h-5 text-[#ECDFCC]" />
          </div>
          <span className="text-xl md:text-2xl font-bold tracking-tight text-[#ECDFCC]">
            IEEE 754 Explorer
          </span>
        </div>

        <div className="text-[13px] md:text-[15px] font-medium text-[#697565] tracking-wide">
          Made by JAYCEE 曾令强
        </div>
      </div>
    </header>
  );
};
