"use client";

import LogoImg from "@/assets/images/logo.png";
import { UserAvatar } from "@/components/project/user-avatar";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useSession } from "@/lib/luni-auth/luni-auth.provider";
import {
  ChevronRightIcon,
  LogOutIcon,
  MailIcon,
  MenuIcon,
  UserIcon,
  UserPlusIcon,
  UsersIcon,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

const MobileHeader = () => {
  const pathname = usePathname();

  return (
    <header className="bg-background sticky top-0 z-50 flex w-full justify-center backdrop-blur xl:hidden">
      <Container variant="centered" className="py-0 md:py-0">
        <div className="flex h-16 items-center">
          {/* Logo */}
          <div className="flex w-1/2 justify-start overflow-hidden">
            <Logo />
          </div>

          {/* Right side buttons */}
          <div className="flex w-1/2 items-center justify-end gap-2 overflow-hidden">
            {/* Mobile Menu Trigger */}
            <SheetMenuByRole />
          </div>
        </div>
      </Container>
    </header>
  );
};

const Logo: React.FC = () => (
  <Link href="/" aria-label="Homepage">
    <div className="relative size-11">
      <Image
        src={LogoImg}
        alt="LUNISOFT"
        className="object-contain"
        fill
        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 70vw"
      />
    </div>
  </Link>
);

const SheetMenuItem = ({
  icon: Icon,
  label,
  href,
  onClick,
}: {
  icon: React.ElementType;
  label: string;
  href: string;
  onClick?: () => void;
}) => {
  return (
    <Link href={href} className="block" onClick={onClick}>
      <SheetClose className="flex items-center justify-between w-full">
        <div className="flex items-center gap-4">
          <Icon className="size-6" />
          {label}
        </div>

        <ChevronRightIcon className="size-6" />
      </SheetClose>
    </Link>
  );
};

function SheetMenuByRole() {
  const session = useSession();
  const isAuthenticated = session.status === "authenticated";

  if (isAuthenticated && session.data?.role === "CUSTOMER") {
    return (
      <CustomerSheetMenu>
        <Button
          variant="outline"
          className="flex items-center gap-1 rounded-full border border-gray-300 px-3 py-1.5 text-black shadow-sm"
        >
          <MenuIcon className="size-4" />

          <div className="flex size-6 items-center justify-center text-sm">
            <UserAvatar
              imageUrl={session.data.imageUrl}
              name={session.data.name}
              email={session.data.email}
            />
          </div>
        </Button>
      </CustomerSheetMenu>
    );
  }

  return (
    <NotLoggedSheetMenu>
      <Button
        variant="outline"
        className="flex items-center gap-1 rounded-full border border-gray-300 px-3 py-1.5 text-black shadow-sm"
      >
        <MenuIcon className="size-4" />

        <div className="flex size-6 items-center justify-center text-sm">
          <UserIcon className="size-4" />
        </div>
      </Button>
    </NotLoggedSheetMenu>
  );
}

const NotLoggedSheetMenu = ({ children }: { children: React.ReactNode }) => {
  return (
    <Sheet>
      <SheetTrigger asChild>{children}</SheetTrigger>
      <SheetContent side="right" className="w-full overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="sr-only">Menu</SheetTitle>
        </SheetHeader>

        <div className="px-4 my-2">
          <Link href="/">
            <Button size="lg" className="mb-4 w-full">
              Devenir aide ménagère
            </Button>
          </Link>

          <Link href="/">
            <Button size="lg" className="mb-4 w-full">
              Réserver un ménage
            </Button>
          </Link>

          <Separator className="my-2" />

          <div className="space-y-4 py-2">
            <p className="mb-6 px-2 text-xl font-medium">Navigation</p>

            <SheetMenuItem
              icon={UsersIcon}
              label="Qui sommes-nous ?"
              href="/who-are-we"
            />

            <SheetMenuItem
              icon={MailIcon}
              label="Nous contacter"
              href="/contact"
            />
          </div>

          <Separator className="my-6" />

          <div className="space-y-6 py-2">
            <p className="mb-6 px-2 text-xl font-medium">Authentification</p>

            <SheetMenuItem
              icon={UserIcon}
              label="Se connecter"
              href="/auth/signin"
            />

            <SheetMenuItem
              icon={UserPlusIcon}
              label="Créer un compte"
              href="/auth/customer/signup"
            />
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

const CustomerSheetMenu = ({ children }: { children: React.ReactNode }) => {
  const session = useSession();

  return (
    <Sheet>
      <SheetTrigger asChild>{children}</SheetTrigger>
      <SheetContent side="right" className="w-full overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="sr-only">Menu</SheetTitle>
        </SheetHeader>

        <div className="px-4 my-2">
          <Link href="/">
            <Button size="lg" className="mb-4 w-full">
              Devenir aide ménagère
            </Button>
          </Link>

          <Link href="/">
            <Button size="lg" className="mb-4 w-full">
              Réserver un ménage
            </Button>
          </Link>

          <Separator className="my-2" />

          <div className="space-y-4 py-2">
            <p className="mb-6 px-2 text-xl font-medium">Navigation</p>

            <SheetMenuItem
              icon={UsersIcon}
              label="Qui sommes-nous ?"
              href="/who-are-we"
            />

            <SheetMenuItem
              icon={MailIcon}
              label="Nous contacter"
              href="/contact"
            />
          </div>

          <Separator className="my-6" />

          <div className="space-y-6 py-2">
            <SheetMenuItem
              icon={LogOutIcon}
              label="Se déconnecter"
              href="/"
              onClick={() => {
                session.destroy();
              }}
            />
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export { MobileHeader };
