import { Shield } from 'lucide-react';

export default function Loading() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center min-h-[60vh]">
      <div className="relative flex flex-col items-center justify-center animate-pulse duration-700">
        <Shield className="w-16 h-16 text-[#00F0FF] animate-bounce" style={{ animationDuration: '2s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-24 bg-[#00F0FF]/20 rounded-full blur-xl animate-ping" style={{ animationDuration: '2s' }}></div>
      </div>
      <div className="mt-8 font-mono text-sm text-[#00F0FF] tracking-[0.3em] font-bold uppercase animate-pulse">
        Initializing Engine...
      </div>
    </div>
  );
}
