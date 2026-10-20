import React from 'react';

export const Footer: React.FC = () => {
  return (
    <footer className="w-full mt-24 border-t border-[#3C3D37]/50 py-12">
      <div className="max-w-[1560px] mx-auto px-6 md:px-12 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-[#ECDFCC]/60">
        <div>
          <span className="font-semibold text-[#ECDFCC]">IEEE 754 Explorer</span> — Designed for Computer Architecture & Digital Systems education.
        </div>
        <div className="text-sm font-medium text-[#697565]">
          Made by JAYCEE 曾令强
        </div>
      </div>
    </footer>
  );
};
