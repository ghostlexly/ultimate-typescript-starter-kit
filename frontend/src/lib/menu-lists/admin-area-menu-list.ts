import {
  AlertCircle,
  CircleEllipsis,
  CreditCard,
  LayoutGrid,
  PlusCircle,
  Search,
  ShoppingCart,
} from "lucide-react";

type Submenu = {
  href: string;
  label: string;
  active: boolean;
};

type Menu = {
  href: string;
  label: string;
  active: boolean;
  icon: any;
  submenus: Submenu[];
};

type Group = {
  groupLabel: string;
  menus: Menu[];
};

export function getAdminAreaMenuList(pathname: string): Group[] {
  return [
    {
      groupLabel: "",
      menus: [
        {
          href: "/admin-area",
          label: "Accueil",
          active: pathname === "/admin-area",
          icon: LayoutGrid,
          submenus: [],
        },
      ],
    },

    {
      groupLabel: "Activité",
      menus: [
        {
          href: "/admin-area/",
          label: "Commandes",
          active: pathname.includes("/admin-area/orders/search"),
          icon: ShoppingCart,
          submenus: [],
        },

        {
          href: "/admin-area/",
          label: "Paiements",
          active: pathname.includes("/admin-area/payments"),
          icon: CreditCard,
          submenus: [],
        },

        {
          href: "/admin-area/",
          label: "Conflits",
          active: pathname.includes("/admin-area/conflicts"),
          icon: AlertCircle,
          submenus: [],
        },
      ],
    },

    {
      groupLabel: "Aides ménagères",
      menus: [
        {
          href: "/admin-area/housekeepers/search",
          label: "Rechercher",
          active: pathname.includes("/admin-area/housekeepers/search"),
          icon: Search,
          submenus: [
            // {
            //   href: "/admin-area/housekeepers/all",
            //   label: "Tous les profiles",
            //   active: pathname === "/admin-area/housekeepers/all",
            // },
            // {
            //   href: "/admin-area/housekeepers/waiting-for-approval",
            //   label: "En attente d'approbation",
            //   active: pathname === "/posts/new",
            // },
          ],
        },

        {
          href: "/admin-area/housekeepers/create",
          label: "Créer un profil",
          active: pathname === "/admin-area/housekeepers/create",
          icon: PlusCircle,
          submenus: [],
        },

        {
          href: "/admin-area/housekeepers/waiting-for-approval",
          label: "En attente d'approbation",
          active: pathname === "/posts/new",
          icon: CircleEllipsis,
          submenus: [],
        },
      ],
    },
    {
      groupLabel: "Clients",
      menus: [
        {
          href: "/admin-area/customers/search",
          label: "Rechercher",
          active: pathname.includes("/admin-area/customers/search"),
          icon: Search,
          submenus: [],
        },

        {
          href: "/admin-area/customers/create",
          label: "Créer un profil",
          active: pathname.includes("/admin-area/customers/create"),
          icon: PlusCircle,
          submenus: [],
        },
      ],
    },
  ];
}
