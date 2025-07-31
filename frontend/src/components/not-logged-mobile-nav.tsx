import { Button, Divider } from "@mui/material";
import {
  ChevronRightIcon,
  MailIcon,
  UserIcon,
  UserPlusIcon,
  UsersIcon,
} from "lucide-react";
import Link from "next/link";

const NotLoggedMobileNav = ({
  setIsDrawerOpen,
}: {
  setIsDrawerOpen: (open: boolean) => void;
}) => {
  const handleCloseDrawer = () => {
    setIsDrawerOpen(false);
  };

  return (
    <>
      <Link href="/housekeeper-area/signup">
        <Button variant="contained" size="large" className="mb-4 w-full">
          Devenir aide ménagère
        </Button>
      </Link>

      <Link href="/">
        <Button variant="contained" size="large" className="mb-4 w-full">
          Réserver un ménage
        </Button>
      </Link>

      <Divider className="my-2" />

      <div className="space-y-4 py-2">
        <p className="mb-6 px-2 text-xl font-medium">Navigation</p>

        <Link
          href={"/who-are-we"}
          onClick={handleCloseDrawer}
          className="flex items-center justify-between gap-3 px-2 py-2"
        >
          <div className="flex items-center gap-4">
            <UsersIcon className="size-6" />
            Qui sommes-nous ?
          </div>

          <ChevronRightIcon className="size-6" />
        </Link>

        <Link
          href={"/who-are-we"}
          className="flex items-center justify-between gap-3 px-2 py-2"
          onClick={handleCloseDrawer}
        >
          <div className="flex items-center gap-4">
            <MailIcon className="size-6" />
            Nous contacter
          </div>

          <ChevronRightIcon className="size-6" />
        </Link>

        <Link
          href={"/housekeeper-area/signin"}
          onClick={handleCloseDrawer}
          className="flex items-center justify-between gap-3 px-2 py-2"
        >
          <div className="flex items-center gap-4">
            <UserIcon className="size-6" />
            Accès Aide Ménagère
          </div>

          <ChevronRightIcon className="size-6" />
        </Link>
      </div>

      <Divider className="my-6" />

      <div className="space-y-4 py-2">
        <p className="mb-6 px-2 text-xl font-medium">Accès Client</p>

        <Link
          href={"/customer-area/login"}
          onClick={handleCloseDrawer}
          className="flex items-center justify-between gap-3 px-2 py-2"
        >
          <div className="flex items-center gap-4">
            <UserIcon className="size-6" />
            Se connecter
          </div>

          <ChevronRightIcon className="size-6" />
        </Link>

        <Link
          href={"/customer-area/register"}
          onClick={handleCloseDrawer}
          className="flex items-center justify-between gap-3 px-2 py-2"
        >
          <div className="flex items-center gap-4">
            <UserPlusIcon className="size-6" />
            Créer un compte
          </div>

          <ChevronRightIcon className="size-6" />
        </Link>
      </div>
    </>
  );
};

export { NotLoggedMobileNav };
