import { authGuard } from "@/lib/ghostlexly-auth/ghostlexly-auth.guard";
import { AppHeader } from "./header";
import { Sidebar } from "./sidebar";

const AppLayout = async ({ children }) => {
  await authGuard({
    requiredRoles: ["ADMIN", "CUSTOMER"],
    redirectPath: "/workspace/signin",
  });

  return (
    <>
      <div className="flex min-h-dvh">
        {/* Sticky sidebar */}
        <div className="sticky top-0 hidden h-dvh lg:block">
          <Sidebar />
        </div>

        {/* Main content area */}
        <div className="flex w-full flex-1 flex-col">
          {/* Mobile-only header */}
          <AppHeader />

          {/* Main content */}
          <main className="flex-1">{children}</main>
        </div>
      </div>
    </>
  );
};

export default AppLayout;
