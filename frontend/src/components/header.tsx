"use client";

import LogoImg from "@/assets/images/logo.png";
import Container from "@/components/ui/container";
import {
  Button,
  Drawer,
  IconButton,
  List,
  ListItemButton,
  ListItemText,
} from "@mui/material";
import {
  ArrowRightIcon,
  BriefcaseIcon,
  FileTextIcon,
  HomeIcon,
  InfoIcon,
  MenuIcon,
  UserIcon,
  UsersIcon,
  XIcon,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React, { useState } from "react";
import { NotLoggedMenu } from "./not-logged-menu";
import { NotLoggedMobileNav } from "./not-logged-mobile-nav";
import { NavMenuItem, NavProvider } from "./ui/nav-menu";

export type UserData = {
  name?: string;
  email?: string;
  image?: string;
  role?: string;
};

const Logo: React.FC = () => (
  <Link href="/" aria-label="Homepage">
    <div className="relative w-full sm:w-56">
      <Image src={LogoImg} alt="Dispo Ménage" className="object-cover" />
    </div>
  </Link>
);

const Header: React.FC = () => {
  return (
    <>
      <DesktopHeader />

      <MobileHeader />
    </>
  );
};

const DesktopHeader = () => {
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [menuAnchorEl, setMenuAnchorEl] = useState<null | HTMLElement>(null);

  const MenuByUserRole = () => {
    return (
      <NotLoggedMenu
        anchorEl={menuAnchorEl}
        open={isMenuOpen}
        onClose={() => setIsMenuOpen(false)}
      />
    );
  };

  return (
    <header className="bg-background sticky top-0 z-50 hidden w-full justify-center backdrop-blur xl:flex">
      <Container>
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <div className="flex w-1/4 overflow-hidden">
            <Logo />
          </div>

          {/* Right side buttons */}
          <div className="flex items-center justify-end gap-2 overflow-hidden">
            <DesktopNavigation activePath={pathname} />

            <Button
              variant="outlined"
              className="flex rounded-full border-gray-300 text-black"
            >
              <Link href="/housekeeper-area/signup">Devenir aide ménagère</Link>
            </Button>

            <div className="flex">
              <IconButton
                className="flex items-center gap-1 rounded-full border border-gray-300 px-3 py-1.5 text-black shadow-sm"
                onClick={(e) => {
                  setMenuAnchorEl(e.currentTarget);
                  setIsMenuOpen(true);
                }}
              >
                <MenuIcon className="size-4" />

                <div className="flex size-6 items-center justify-center">
                  <UserIcon className="size-4" />
                </div>
              </IconButton>

              <MenuByUserRole />
            </div>
          </div>
        </div>
      </Container>
    </header>
  );
};

const DesktopNavigation: React.FC<{ activePath: string }> = ({
  activePath,
}) => (
  <NavProvider>
    <NavMenuItem title="Ménage">
      <div className="flex flex-row gap-2">
        <div>
          <div className="text-lg font-bold">Nos services</div>
          <List dense className="grid grid-cols-2 space-x-8">
            <ListItemButton>
              <ListItemText primary="Ménage classique" />
            </ListItemButton>

            <ListItemButton>
              <ListItemText primary="Ménage ponctuel" />
            </ListItemButton>

            <ListItemButton>
              <ListItemText primary="Ménage régulier" />
            </ListItemButton>

            <ListItemButton>
              <ListItemText primary="Ménage de printemps" />
            </ListItemButton>

            <ListItemButton>
              <ListItemText primary="Aide ménagère pour personne âgée" />
            </ListItemButton>

            <ListItemButton>
              <ListItemText primary="Repassage à domicile" />
            </ListItemButton>

            <ListItemButton>
              <ListItemText primary="Ménage et repassage" />
            </ListItemButton>

            <ListItemButton>
              <ListItemText primary="Ménage après travaux" />
            </ListItemButton>

            <ListItemButton>
              <ListItemText primary="Nettoyage des bâtiments" />
            </ListItemButton>

            <ListItemButton>
              <ListItemText primary="Nettoyage moquette et canapé" />
            </ListItemButton>

            <ListItemButton>
              <ListItemText primary="Nettoyage industriel" />
            </ListItemButton>

            <ListItemButton>
              <ListItemText primary="Services de linge" />
            </ListItemButton>

            <ListItemButton>
              <ListItemText primary="Nettoyage locaux professionnels" />
            </ListItemButton>

            <ListItemButton>
              <ListItemText primary="Nettoyage location courte durée" />
            </ListItemButton>

            <ListItemButton>
              <ListItemText primary="Nettoyage de véhicules" />
            </ListItemButton>

            <ListItemButton>
              <ListItemText primary="Nettoyage des vitres" />
            </ListItemButton>
          </List>
        </div>

        <div className="relative h-48 w-64">
          {/* Overlay content */}
          <div className="absolute -top-2 right-2 z-10">
            <div className="bg-action/90 rounded-full px-3 py-1 text-xs font-medium text-white shadow-sm backdrop-blur-sm">
              🎉 Sans engagement !
            </div>
          </div>

          <Link href="/">
            <div className="group h-full w-full overflow-hidden rounded-lg border shadow-lg transition-all duration-300 hover:shadow-xl">
              {/* Image */}
              <div className="relative h-full w-full overflow-hidden">
                {/* Gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
              </div>

              {/* Overlay call-to-action */}
              <div className="absolute bottom-6 left-6">
                <Button
                  variant="outlined"
                  size="small"
                  className="bg-white"
                  endIcon={<ArrowRightIcon className="size-4" />}
                >
                  Réserver mon ménage
                </Button>
              </div>
            </div>
          </Link>
        </div>
      </div>
    </NavMenuItem>

    <NavMenuItem title="Notre entreprise">
      <div className="flex flex-row gap-6">
        <div className="flex-1">
          <div className="mb-4 text-lg font-bold text-gray-800">
            Notre entreprise
          </div>
          <div className="grid grid-cols-2 gap-3">
            {/* Colonne 1 - À propos */}
            <div className="space-y-2">
              <Link href="/who-are-we" className="block">
                <div className="group flex items-center gap-3 rounded-lg p-3 transition-all duration-200 hover:bg-blue-50 hover:shadow-sm">
                  <div className="bg-primary group-hover:bg-primary/80 flex h-8 w-8 items-center justify-center rounded-lg text-white">
                    <UsersIcon className="size-4" />
                  </div>
                  <div>
                    <div className="group-hover:text-primary font-medium text-gray-900">
                      Qui sommes-nous ?
                    </div>
                    <div className="text-xs text-gray-500">
                      Découvrez notre mission
                    </div>
                  </div>
                </div>
              </Link>

              <Link href="/contact" className="block">
                <div className="group flex items-center gap-3 rounded-lg p-3 transition-all duration-200 hover:bg-blue-50 hover:shadow-sm">
                  <div className="bg-primary group-hover:bg-primary/80 flex h-8 w-8 items-center justify-center rounded-lg text-white">
                    <InfoIcon className="size-4" />
                  </div>
                  <div>
                    <div className="group-hover:text-primary font-medium text-gray-900">
                      Nous contacter
                    </div>
                    <div className="text-xs text-gray-500">
                      Besoin d&apos;aide ?
                    </div>
                  </div>
                </div>
              </Link>

              <Link href="/our-story" className="block">
                <div className="group flex items-center gap-3 rounded-lg p-3 transition-all duration-200 hover:bg-blue-50 hover:shadow-sm">
                  <div className="bg-primary group-hover:bg-primary/80 flex h-8 w-8 items-center justify-center rounded-lg text-white">
                    <FileTextIcon className="size-4" />
                  </div>
                  <div>
                    <div className="group-hover:text-primary font-medium text-gray-900">
                      Notre histoire
                    </div>
                    <div className="text-xs text-gray-500">
                      Comment tout a commencé
                    </div>
                  </div>
                </div>
              </Link>
            </div>

            {/* Colonne 2 - Engagement */}
            <div className="space-y-2">
              <Link href="/values" className="block">
                <div className="group flex items-center gap-3 rounded-lg p-3 transition-all duration-200 hover:bg-blue-50 hover:shadow-sm">
                  <div className="bg-primary group-hover:bg-primary/80 flex h-8 w-8 items-center justify-center rounded-lg text-white">
                    <BriefcaseIcon className="size-4" />
                  </div>
                  <div>
                    <div className="group-hover:text-primary font-medium text-gray-900">
                      Nos valeurs
                    </div>
                    <div className="text-xs text-gray-500">
                      Ce qui nous guide
                    </div>
                  </div>
                </div>
              </Link>

              <Link href="/testimonials" className="block">
                <div className="group flex items-center gap-3 rounded-lg p-3 transition-all duration-200 hover:bg-blue-50 hover:shadow-sm">
                  <div className="bg-primary group-hover:bg-primary/80 flex h-8 w-8 items-center justify-center rounded-lg text-white">
                    <UserIcon className="size-4" />
                  </div>
                  <div>
                    <div className="group-hover:text-primary font-medium text-gray-900">
                      Témoignages clients
                    </div>
                    <div className="text-xs text-gray-500">
                      Ils nous font confiance
                    </div>
                  </div>
                </div>
              </Link>

              <Link href="/careers" className="block">
                <div className="group flex items-center gap-3 rounded-lg p-3 transition-all duration-200 hover:bg-blue-50 hover:shadow-sm">
                  <div className="bg-primary group-hover:bg-primary/80 flex h-8 w-8 items-center justify-center rounded-lg text-white">
                    <HomeIcon className="size-4" />
                  </div>
                  <div>
                    <div className="group-hover:text-primary font-medium text-gray-900">
                      Rejoindre l&apos;équipe
                    </div>
                    <div className="text-xs text-gray-500">
                      Opportunités de carrière
                    </div>
                  </div>
                </div>
              </Link>
            </div>
          </div>
        </div>

        <div className="relative h-64 w-72">
          {/* Overlay content */}
          <div className="absolute -top-2 right-2 z-10">
            <div className="bg-action/90 rounded-full px-3 py-1 text-xs font-medium text-white shadow-sm backdrop-blur-sm">
              ✨ Équipe passionnée !
            </div>
          </div>

          <Link href="/who-are-we">
            <div className="group h-full w-full overflow-hidden rounded-lg border bg-gradient-to-br from-blue-50 via-blue-100 to-blue-200 shadow-lg transition-all duration-300 hover:shadow-xl">
              {/* Image */}
              <div className="relative h-full w-full overflow-hidden">
                {/* Gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
              </div>

              {/* Bottom content */}
              <div className="absolute right-0 bottom-0 left-0 p-6">
                <Button
                  variant="outlined"
                  size="small"
                  className="bg-white"
                  endIcon={<ArrowRightIcon className="size-4" />}
                >
                  Découvrir notre équipe
                </Button>
              </div>
            </div>
          </Link>
        </div>
      </div>
    </NavMenuItem>

    <Link href="/housekeeper-area/signin">
      <button className="hover:text-primary cursor-pointer border-none bg-transparent px-4 py-2 text-sm font-medium text-inherit transition-colors duration-200">
        Accès Aide Ménagère
      </button>
    </Link>
  </NavProvider>
);

const MobileHeader = () => {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  return (
    <header className="bg-background sticky top-0 z-50 flex w-full justify-center backdrop-blur xl:hidden">
      <Container>
        <div className="flex h-16 items-center">
          {/* Logo */}
          <div className="flex w-1/2 justify-start overflow-hidden">
            <Logo />
          </div>

          {/* Right side buttons */}
          <div className="flex w-1/2 items-center justify-end gap-2 overflow-hidden">
            {/* Mobile Menu Trigger */}
            <IconButton
              className="flex items-center gap-1 rounded-full border border-gray-300 px-3 py-1.5 text-black shadow-sm"
              onClick={(e) => {
                setIsDrawerOpen(true);
              }}
            >
              <MenuIcon className="size-4" />

              <div className="flex size-6 items-center justify-center text-sm">
                <UserIcon className="size-4" />
              </div>
            </IconButton>

            <Drawer
              open={isDrawerOpen}
              onClose={() => setIsDrawerOpen(false)}
              anchor="right"
            >
              <MobileNav setIsDrawerOpen={setIsDrawerOpen} />
            </Drawer>
          </div>
        </div>
      </Container>
    </header>
  );
};

interface MobileNavProps {
  setIsDrawerOpen: (open: boolean) => void;
}

const MobileNav: React.FC<MobileNavProps> = ({ setIsDrawerOpen }) => {
  const MobileNavByUserRole = () => {
    return <NotLoggedMobileNav setIsDrawerOpen={setIsDrawerOpen} />;
  };

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between border-b p-4">
        <Link href="/" className="relative flex w-48 items-center">
          <Image src={LogoImg} alt="Dispo Ménage" className="object-cover" />
        </Link>

        <IconButton onClick={() => setIsDrawerOpen(false)}>
          <XIcon className="size-6" />
        </IconButton>
      </div>

      <div className="flex-1 overflow-auto p-4">
        <MobileNavByUserRole />
      </div>
    </div>
  );
};

export { Header };
