"use client";

import LogoImg from "@/assets/images/logo.png";
import { UserAvatar } from "@/components/project/user-avatar";
import { Button } from "@/components/ui/button";
import Container from "@/components/ui/container";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuPortal,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useSession } from "@/lib/ghostlexly-auth/ghostlexly-auth.provider";
import {
  ChevronRightIcon,
  CircleCheckIcon,
  CircleHelpIcon,
  CircleIcon,
  MailIcon,
  MenuIcon,
  UserIcon,
  UserPlusIcon,
  UsersIcon,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

const Header = () => {
  return (
    <>
      <DesktopHeader />

      <MobileHeader />
    </>
  );
};

const Logo: React.FC = () => (
  <Link href="/" aria-label="Homepage">
    <div className="relative size-14">
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

const DesktopHeader = () => {
  const pathname = usePathname();
  const session = useSession();
  const isAuthenticated = session.status === "authenticated";

  const DropdownMenuByRole = () => {
    if (isAuthenticated && session.data?.role === "CUSTOMER") {
      return (
        <CustomerDropdownMenu>
          <Button className="flex items-center gap-1 rounded-full border border-gray-300 px-3 py-1.5 text-black shadow-sm">
            <MenuIcon className="size-4" />

            <div className="flex size-6 items-center justify-center text-sm">
              <UserAvatar
                imageUrl={session.data.imageUrl}
                name={session.data.name}
                email={session.data.email}
              />
            </div>
          </Button>
        </CustomerDropdownMenu>
      );
    }

    return (
      <NotAuthenticatedDropdownMenu>
        <Button
          variant={"outline"}
          className="flex items-center gap-1 rounded-full border border-gray-300 px-3 py-1.5 text-black shadow-sm"
        >
          <MenuIcon className="size-4" />

          <div className="flex size-6 items-center justify-center">
            <UserIcon className="size-4" />
          </div>
        </Button>
      </NotAuthenticatedDropdownMenu>
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
          <div className="flex items-center justify-end gap-2">
            <DesktopNavigation activePath={pathname} />

            <Button
              variant="outline"
              className="flex rounded-full border-gray-300 text-black"
            >
              <Link href="/">Sign Up</Link>
            </Button>

            <div className="flex">
              <DropdownMenuByRole />
            </div>
          </div>
        </div>
      </Container>
    </header>
  );
};

const DesktopNavigation = ({ activePath }: { activePath: string }) => {
  // Navigation Menu List Item Component
  const ListItem = ({
    title,
    children,
    href,
    ...props
  }: React.ComponentPropsWithoutRef<"li"> & { href: string }) => {
    return (
      <li {...props}>
        <NavigationMenuLink asChild>
          <Link href={href}>
            <div className="text-sm leading-none font-medium">{title}</div>
            <p className="text-muted-foreground line-clamp-2 text-sm leading-snug">
              {children}
            </p>
          </Link>
        </NavigationMenuLink>
      </li>
    );
  };

  // Desktop Navigation Component
  return (
    <NavigationMenu viewport={false}>
      <NavigationMenuList className="flex-wrap">
        <NavigationMenuItem>
          <NavigationMenuTrigger>Home</NavigationMenuTrigger>
          <NavigationMenuContent>
            <ul className="grid gap-2 md:w-[400px] lg:w-[500px] lg:grid-cols-[.75fr_1fr]">
              <li className="row-span-3">
                <NavigationMenuLink asChild>
                  <div className="from-muted/50 to-muted flex h-full w-full flex-col justify-end rounded-md bg-linear-to-b p-4 no-underline outline-hidden transition-all duration-200 select-none focus:shadow-md md:p-6">
                    <div className="mb-2 text-lg font-medium sm:mt-4">
                      shadcn/ui
                    </div>
                    <p className="text-muted-foreground text-sm leading-tight">
                      Beautifully designed components built with Tailwind CSS.
                    </p>
                  </div>
                </NavigationMenuLink>
              </li>
              <ListItem href="/docs" title="Introduction">
                Re-usable components built using Radix UI and Tailwind CSS.
              </ListItem>
              <ListItem href="/docs/installation" title="Installation">
                How to install dependencies and structure your app.
              </ListItem>
              <ListItem href="/docs/primitives/typography" title="Typography">
                Styles for headings, paragraphs, lists...etc
              </ListItem>
            </ul>
          </NavigationMenuContent>
        </NavigationMenuItem>
        <NavigationMenuItem>
          <NavigationMenuTrigger>Components</NavigationMenuTrigger>
          <NavigationMenuContent>
            <ul className="grid gap-2 sm:w-[400px] md:w-[500px] md:grid-cols-2 lg:w-[600px]">
              <ListItem title={"Alert Dialog"} href={"/"}>
                A modal dialog that interrupts the user with important content
                and expects a response.
              </ListItem>

              <ListItem title={"Hover Card"} href={"/"}>
                For sighted users to preview content available behind a link.
              </ListItem>

              <ListItem title={"Progress"} href={"/"}>
                Display the length of a task with a progress indicator.
              </ListItem>

              <ListItem title={"Scroll Area"} href={"/"}>
                Visually or semantically separates content.
              </ListItem>

              <ListItem title={"Tabs"} href={"/"}>
                A set of layered sections of content—known as tab panels—that
                are displayed one at a time.
              </ListItem>

              <ListItem title={"Tooltip"} href={"/"}>
                A popup that displays information related to an element when the
                element receives keyboard focus or the mouse hovers over it.
              </ListItem>
            </ul>
          </NavigationMenuContent>
        </NavigationMenuItem>
        <NavigationMenuItem>
          <NavigationMenuLink asChild>
            <Link href="/">Docs</Link>
          </NavigationMenuLink>
        </NavigationMenuItem>
        <NavigationMenuItem className="hidden md:block">
          <NavigationMenuTrigger>List</NavigationMenuTrigger>
          <NavigationMenuContent>
            <ul className="grid w-[300px] gap-4">
              <li>
                <NavigationMenuLink asChild>
                  <Link href="#">
                    <div className="font-medium">Components</div>
                    <div className="text-muted-foreground">
                      Browse all components in the library.
                    </div>
                  </Link>
                </NavigationMenuLink>
                <NavigationMenuLink asChild>
                  <Link href="#">
                    <div className="font-medium">Documentation</div>
                    <div className="text-muted-foreground">
                      Learn how to use the library.
                    </div>
                  </Link>
                </NavigationMenuLink>
                <NavigationMenuLink asChild>
                  <Link href="#">
                    <div className="font-medium">Blog</div>
                    <div className="text-muted-foreground">
                      Read our latest blog posts.
                    </div>
                  </Link>
                </NavigationMenuLink>
              </li>
            </ul>
          </NavigationMenuContent>
        </NavigationMenuItem>
        <NavigationMenuItem className="hidden md:block">
          <NavigationMenuTrigger>Simple</NavigationMenuTrigger>
          <NavigationMenuContent>
            <ul className="grid w-[200px] gap-4">
              <li>
                <NavigationMenuLink asChild>
                  <Link href="#">Components</Link>
                </NavigationMenuLink>
                <NavigationMenuLink asChild>
                  <Link href="#">Documentation</Link>
                </NavigationMenuLink>
                <NavigationMenuLink asChild>
                  <Link href="#">Blocks</Link>
                </NavigationMenuLink>
              </li>
            </ul>
          </NavigationMenuContent>
        </NavigationMenuItem>
        <NavigationMenuItem className="hidden md:block">
          <NavigationMenuTrigger>With Icon</NavigationMenuTrigger>
          <NavigationMenuContent>
            <ul className="grid w-[200px] gap-4">
              <li>
                <NavigationMenuLink asChild>
                  <Link href="#" className="flex-row items-center gap-2">
                    <CircleHelpIcon />
                    Backlog
                  </Link>
                </NavigationMenuLink>
                <NavigationMenuLink asChild>
                  <Link href="#" className="flex-row items-center gap-2">
                    <CircleIcon />
                    To Do
                  </Link>
                </NavigationMenuLink>
                <NavigationMenuLink asChild>
                  <Link href="#" className="flex-row items-center gap-2">
                    <CircleCheckIcon />
                    Done
                  </Link>
                </NavigationMenuLink>
              </li>
            </ul>
          </NavigationMenuContent>
        </NavigationMenuItem>
      </NavigationMenuList>
    </NavigationMenu>
  );
};

const NotAuthenticatedDropdownMenu = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>{children}</DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="start">
        <DropdownMenuLabel>My Account</DropdownMenuLabel>
        <DropdownMenuGroup>
          <Link href="/signin">
            <DropdownMenuItem>Sign in</DropdownMenuItem>
          </Link>
          <DropdownMenuItem>Create a new account</DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

const CustomerDropdownMenu = ({ children }: { children: React.ReactNode }) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>{children}</DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="start">
        <DropdownMenuLabel>My Account</DropdownMenuLabel>
        <DropdownMenuGroup>
          <DropdownMenuItem>
            Profile
            <DropdownMenuShortcut>⇧⌘P</DropdownMenuShortcut>
          </DropdownMenuItem>
          <DropdownMenuItem>
            Billing
            <DropdownMenuShortcut>⌘B</DropdownMenuShortcut>
          </DropdownMenuItem>
          <DropdownMenuItem>
            Settings
            <DropdownMenuShortcut>⌘S</DropdownMenuShortcut>
          </DropdownMenuItem>
          <DropdownMenuItem>
            Keyboard shortcuts
            <DropdownMenuShortcut>⌘K</DropdownMenuShortcut>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem>Team</DropdownMenuItem>
          <DropdownMenuSub>
            <DropdownMenuSubTrigger>Invite users</DropdownMenuSubTrigger>
            <DropdownMenuPortal>
              <DropdownMenuSubContent>
                <DropdownMenuItem>Email</DropdownMenuItem>
                <DropdownMenuItem>Message</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem>More...</DropdownMenuItem>
              </DropdownMenuSubContent>
            </DropdownMenuPortal>
          </DropdownMenuSub>
          <DropdownMenuItem>
            New Team
            <DropdownMenuShortcut>⌘+T</DropdownMenuShortcut>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem>GitHub</DropdownMenuItem>
        <DropdownMenuItem>Support</DropdownMenuItem>
        <DropdownMenuItem disabled>API</DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem>
          Log out
          <DropdownMenuShortcut>⇧⌘Q</DropdownMenuShortcut>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

const MobileHeader = () => {
  const pathname = usePathname();
  const session = useSession();
  const isAuthenticated = session.status === "authenticated";

  const SheetMenuByRole = () => {
    if (isAuthenticated && session.data?.role === "CUSTOMER") {
      return (
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
  };

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
            <SheetMenuByRole />
          </div>
        </div>
      </Container>
    </header>
  );
};

const NotLoggedSheetMenu = ({ children }: { children: React.ReactNode }) => {
  return (
    <Sheet>
      <SheetTrigger asChild>{children}</SheetTrigger>
      <SheetContent side="right" className="w-full overflow-y-auto">
        <SheetHeader>
          <div className="mb-4">
            <Link href="/" className="relative flex size-14 items-center">
              <Image
                src={LogoImg}
                alt="LUNISOFT"
                className="object-contain"
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 70vw"
              />
            </Link>
          </div>
        </SheetHeader>

        <Button asChild size="lg" className="mb-4 w-full">
          <Link href="/housekeeper-area/signup">Devenir aide ménagère</Link>
        </Button>

        <Button asChild size="lg" className="mb-4 w-full">
          <Link href="/">Réserver un ménage</Link>
        </Button>

        <Separator className="my-2" />

        <div className="space-y-4 py-2">
          <p className="mb-6 px-2 text-xl font-medium">Navigation</p>

          <Link href={"/who-are-we"} className="block">
            <SheetClose className="flex items-center justify-between w-full">
              <div className="flex items-center gap-4">
                <UsersIcon className="size-6" />
                Qui sommes-nous ?
              </div>

              <ChevronRightIcon className="size-6" />
            </SheetClose>
          </Link>

          <Link href={"/who-are-we"} className="block">
            <SheetClose className="flex items-center justify-between w-full">
              <div className="flex items-center gap-4">
                <MailIcon className="size-6" />
                Nous contacter
              </div>

              <ChevronRightIcon className="size-6" />
            </SheetClose>
          </Link>

          <Link href={"/housekeeper-area/signin"} className="block">
            <SheetClose className="flex items-center justify-between w-full">
              <div className="flex items-center gap-4">
                <UserIcon className="size-6" />
                Accès Aide Ménagère
              </div>

              <ChevronRightIcon className="size-6" />
            </SheetClose>
          </Link>
        </div>

        <Separator className="my-6" />

        <div className="space-y-6 py-2">
          <p className="mb-6 px-2 text-xl font-medium">Accès Client</p>

          <Link href={"/signin"} className="block">
            <SheetClose className="flex items-center justify-between w-full">
              <div className="flex items-center gap-4">
                <UserIcon className="size-6" />
                Se connecter
              </div>

              <ChevronRightIcon className="size-6" />
            </SheetClose>
          </Link>

          <Link href={"/signup"} className="block">
            <SheetClose className="flex items-center justify-between w-full">
              <div className="flex items-center gap-4">
                <UserPlusIcon className="size-6" />
                Créer un compte
              </div>

              <ChevronRightIcon className="size-6" />
            </SheetClose>
          </Link>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export { Header };
