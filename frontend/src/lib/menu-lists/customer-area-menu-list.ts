import { CalendarCheck, CalendarClock, LayoutGrid } from "lucide-react";

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

export function getCustomerAreaMenuList(pathname: string): Group[] {
  return [
    {
      groupLabel: "",
      menus: [
        {
          href: "/customer-area",
          label: "Accueil",
          active: pathname === "/customer-area",
          icon: LayoutGrid,
          submenus: [],
        },
      ],
    },

    {
      groupLabel: "Mon activité",
      menus: [
        {
          href: "/customer-area/orders",
          label: "Commandes",
          active: pathname.includes("/customer-area/orders"),
          icon: CalendarClock,
          submenus: [
            // {
            //   href: "/posts",
            //   label: "All Posts",
            //   active: pathname === "/posts",
            // },
            // {
            //   href: "/posts/new",
            //   label: "New Post",
            //   active: pathname === "/posts/new",
            // },
          ],
        },
      ],
    },
    {
      groupLabel: "Réservations",
      menus: [
        {
          href: "/customer-area/bookings/to-confirm",
          label: "À Confirmer",
          active: pathname.includes("/customer-area/bookings/to-confirm"),
          icon: CalendarCheck,
          submenus: [],
        },
      ],
    },
  ];
}
