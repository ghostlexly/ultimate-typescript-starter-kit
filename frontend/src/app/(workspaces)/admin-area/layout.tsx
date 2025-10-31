import { AdminSidebar } from "@/app/(workspaces)/admin-area/_components/admin-sidebar";
import { SiteHeader } from "@/app/(workspaces)/admin-area/_components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { authGuard } from "@/lib/ghostlexly-auth/ghostlexly-auth.guard";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Fodmap Facile – Administration",
  description:
    "Suivez un régime pauvre en FODMAP en toute simplicité avec Fodmap Facile ! Grâce à notre application, identifiez instantanément si un produit alimentaire contient des FODMAP et en quelle quantité vous pouvez le consommer.",
};

export default async function AdminAreaLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  await authGuard({
    requiredRoles: ["ADMIN"],
    redirectPath: "/admin-area/signin",
  });

  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 72)",
          "--header-height": "calc(var(--spacing) * 12)",
        } as React.CSSProperties
      }
    >
      <AdminSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader />

        {children}
      </SidebarInset>
    </SidebarProvider>
  );
}
