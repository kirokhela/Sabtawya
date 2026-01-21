import AppBackground from "../components/AppBackground";
import Sidebar from "../components/Sidebar";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen relative">
      <AppBackground />
      <Sidebar />

      <main className="pt-4 md:pt-6 md:pr-72 px-4 md:px-6">
        {children}
      </main>
    </div>
  );
}
