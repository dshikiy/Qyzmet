import Link from "next/link";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC]">
      <header className="border-b border-[#E2E8F0] bg-white">
        <div className="container-app flex h-16 items-center justify-between">
          <Link
            href="/"
            className="text-xl font-bold tracking-tight text-[#0F172A]"
          >
            Qyzmet<span className="text-[#2563EB]">Tap</span>
          </Link>
          <Link
            href="/"
            className="text-sm font-medium text-[#64748B] hover:text-[#2563EB] transition-colors"
          >
            Басты бетке оралу
          </Link>
        </div>
      </header>
      <main className="flex-1 flex items-center justify-center px-4 py-12">
        {children}
      </main>
    </div>
  );
}

