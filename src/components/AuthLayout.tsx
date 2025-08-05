export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0a101f] px-4 md:px-0 py-4">
      <div className="w-full max-w-xl p-8 sm:p-12 rounded-2xl bg-[#181e29] border border-[#232a3a] shadow-2xl relative"
        style={{ boxShadow: '0 0 40px 0 #3b82f6, 0 0 120px 0 #8b5cf6, 0 0 0 1px #232a3a' }}>
        <div className="absolute inset-0 rounded-2xl pointer-events-none" style={{ boxShadow: '0 0 60px 10px #3b82f6, 0 0 120px 40px #8b5cf6', opacity: 0.15 }} />
        <div className="relative z-10">{children}</div>
      </div>
    </div>
  );
} 