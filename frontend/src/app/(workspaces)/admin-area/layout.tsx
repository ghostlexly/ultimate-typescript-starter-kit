import { AppSidebar } from "@/app/(workspaces)/admin-area/_components/app-sidebar";
import { Header } from "@/app/(workspaces)/admin-area/_components/header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { BreadcrumbProvider } from "@/hooks/use-breadcrumb";
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
  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 72)",
          "--header-height": "calc(var(--spacing) * 12)",
        } as React.CSSProperties
      }
    >
      <AppSidebar variant="inset" />
      <SidebarInset className="max-h-svh overflow-auto">
        <BreadcrumbProvider>
          <Header />

          {children}
        </BreadcrumbProvider>
      </SidebarInset>
    </SidebarProvider>
  );
}
