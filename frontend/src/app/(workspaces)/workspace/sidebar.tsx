"use client";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { GhostImage } from "@/components/ui/ghost-image";
import { LoadingDots } from "@/components/ui/loading-dots";
import TerraCapitalLogo from "@/assets/images/terracapital.png";
import { useSession } from "@/lib/ghostlexly-auth/ghostlexly-auth.provider";
import { ModelLogo } from "@/lib/model-logo";
import { cn } from "@/lib/utils";
import { wolfios } from "@/lib/wolfios";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  BookUser,
  Ellipsis,
  LogOut,
  Settings,
  Trash,
  Users,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { BiSolidEdit } from "react-icons/bi";
import { FaRegFilePdf } from "react-icons/fa";
import { MdOutlineBugReport, MdOutlineImage } from "react-icons/md";

const Sidebar = ({
  classNames,
  onNavigate,
}: {
  classNames?: {
    wrapper?: string;
  };
  onNavigate?: () => void;
}) => {
  return (
    <>
      {/* container: define the max sizes and defaults */}
      <div
        className={cn(
          "h-full w-full flex-shrink-0 bg-secondary p-4 text-secondary-foreground lg:w-[260px]",
          classNames?.wrapper
        )}
      >
        {/* wrapper: take all the available height space */}
        <div className="flex h-full flex-col">
          {/* logo */}
          <Link href={"/workspace"}>
            <div className="flex items-center justify-center">
              <div className="relative h-16 w-16">
                <GhostImage
                  src={TerraCapitalLogo}
                  alt="Terra Capital"
                  className="object-contain"
                  fill
                />
              </div>
            </div>
          </Link>

          <div className="my-4" />

          <div className="flex h-full min-h-0 flex-col justify-between gap-6">
            <div className="overflow-y-auto">
              {/* menus */}
              <Menus onNavigate={onNavigate} />
            </div>

            {/* user account */}
            <UserAccount />
          </div>
        </div>
      </div>
    </>
  );
};

const Menus = ({ onNavigate }: { onNavigate?: () => void }) => {
  const router = useRouter();

  const createNewProperty = async () => {
    const data = await wolfios
      .post("/api/customer/properties", {
        data: {
          name: "Nouveau bien - Brouillon",
        },
      })
      .then(async (res) => await res.json());

    router.push(`/workspace/properties/${data.id}/edit`);
  };

  return (
    <>
      <div className="flex flex-col gap-3">
        <div
          className="group cursor-pointer p-1 hover:rounded-lg hover:bg-neutral-300/40"
          onClick={createNewProperty}
        >
          <div className="flex items-center gap-3">
            <BiSolidEdit className="h-5 w-5 text-muted-foreground" />
            <div>Nouveau bien</div>
          </div>
        </div>

        <SidebarButton href={"/workspace/properties"} onNavigate={onNavigate}>
          <div className="flex items-center gap-3">
            <MdOutlineImage className="h-5 w-5 text-muted-foreground" />
            <div>Gestion des biens</div>
          </div>
        </SidebarButton>

        <SidebarButton href={"/workspace/subscribers"} onNavigate={onNavigate}>
          <div className="flex items-center gap-3">
            <Users className="h-5 w-5 text-muted-foreground" />
            <div>Gestion des contacts</div>
          </div>
        </SidebarButton>

        <SidebarButton href={"/workspace/listings"} onNavigate={onNavigate}>
          <div className="flex items-center gap-3">
            <BookUser className="h-5 w-5 text-muted-foreground" />
            <div>Gestion des listes de diffusion</div>
          </div>
        </SidebarButton>
      </div>
    </>
  );
};

const UserAccount = () => {
  const session = useSession();
  const router = useRouter();

  const { mutateAsync: mutateBillingPreferences } = useMutation({
    mutationFn: async () => {
      return await wolfios
        .get("/api/payments/stripe/manage")
        .then(async (res) => await res.json());
    },

    onSuccess: (data) => {
      window.location.href = data.portalLink;
    },

    onError: (error) => {
      toast.error("An error occurred. Please try again later.");
    },
  });

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger className="rounded-lg p-1 hover:bg-neutral-300/40 data-[state=open]:bg-neutral-300/40">
          <div className="flex items-center gap-2">
            <div>
              <Avatar className="h-6 w-6 border border-primary text-xs">
                <AvatarFallback>
                  {session.data?.email.slice(0, 1).toUpperCase()}
                </AvatarFallback>
              </Avatar>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-ellipsis text-sm">{session.data?.email}</div>

              <div>
                <Ellipsis className="h-4 w-4" />
              </div>
            </div>
          </div>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuGroup>
            <DropdownMenuItem
              onClick={() => {
                session.destroy();
                router.push("/workspace/signin");
              }}
            >
              <div className="flex items-center gap-2">
                <LogOut className="h-4 w-4" />
                <span>Se déconnecter</span>
              </div>
            </DropdownMenuItem>
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
};

const SidebarButton = ({ children, href, onNavigate }) => {
  const router = useRouter();

  const handleClick = () => {
    if (onNavigate) {
      onNavigate();
    }
    router.push(href);
  };

  return (
    <div
      className="group cursor-pointer p-1 hover:rounded-lg hover:bg-neutral-300/40"
      onClick={handleClick}
    >
      {children}
    </div>
  );
};

export { Sidebar };
