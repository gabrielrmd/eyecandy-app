import { Navbar } from "@/components/layout/navbar";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Navbar />
      <main className="mx-auto max-w-7xl p-6 lg:p-8">{children}</main>
    </>
  );
}
