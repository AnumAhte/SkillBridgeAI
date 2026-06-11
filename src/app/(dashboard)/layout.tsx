import { Sidebar } from "@/components/dashboard/sidebar";
import { AuthGate } from "@/components/auth-gate";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col md:flex-row">
      <Sidebar />
      <main className="flex-1 p-4 md:h-screen md:overflow-y-auto md:p-8">
        <AuthGate>{children}</AuthGate>
      </main>
    </div>
  );
}
