import AdminSidebar from "@/components/admin/AdminSidebar";
import { Toaster } from "react-hot-toast";

export const metadata = {
  title: { default: "Admin", template: "%s | Styles Admin" },
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-stone-50">
      <AdminSidebar />
      <main className="flex-1 overflow-auto md:ml-0 pt-16 md:pt-0">
        <div className="p-6 md:p-8">{children}</div>
      </main>
      <Toaster
        position="top-right"
        toastOptions={{
          style: { background: "#1c1917", color: "#fff", borderRadius: "0", fontSize: "13px" },
        }}
      />
    </div>
  );
}
