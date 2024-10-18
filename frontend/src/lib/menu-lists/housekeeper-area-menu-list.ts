import {
  CalendarClock,
  CalendarDays,
  CalendarPlus,
  LayoutGrid,
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

export function getHousekeeperAreaMenuList(pathname: string): Group[] {
  return [
    {
      groupLabel: "",
      menus: [
        {
          href: "/housekeeper-area",
          label: "Accueil",
          active: pathname === "/housekeeper-area",
          icon: LayoutGrid,
          submenus: [],
        },
      ],
    },
    {
      groupLabel: "Mon activité",
      menus: [
        {
          href: "/housekeeper-area/orders",
          label: "Commandes",
          active: false,
          icon: CalendarClock,
          submenus: [
            {
              href: "/housekeeper-area/orders",
              label: "Toutes les commandes",
              active: pathname === "/housekeeper-area/orders",
            },
            {
              href: "/posts/new",
              label: "Commandes en attente",
              active: pathname === "/posts/new",
            },
          ],
        },

        // {
        //   href: "",
        //   label: "Planning",
        //   active: pathname.includes("/housekeeper-area/schedule"),
        //   icon: CalendarDays,
        //   submenus: [],
        // },

        {
          href: "/housekeeper-area/tracking",
          label: "Pointage",
          active: pathname.includes("/housekeeper-area/tracking"),
          icon: CalendarClock,
          submenus: [],
        },
      ],
    },
    {
      groupLabel: "Mon profil",
      menus: [
        {
          href: "/housekeeper-area/availabilities",
          label: "Disponibilités",
          active: pathname.includes("/housekeeper-area/availabilities"),
          icon: CalendarPlus,
          submenus: [],
        },
      ],
    },
  ];
}
