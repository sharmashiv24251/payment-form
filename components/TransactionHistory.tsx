"use client";

export default function TransactionHistory() {
  return (
    <div className="w-full">
      <p className="text-[10px] tracking-widest text-[#555] mb-4">TRANSACTION HISTORY</p>
      <div className="bg-[#111] rounded-2xl p-5 text-[#555] text-sm text-center min-h-40 flex items-center justify-center">
        No transactions yet.
      </div>
    </div>
  );
}
