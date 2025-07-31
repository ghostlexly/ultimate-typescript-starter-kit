import { Fade, Paper, Popper } from "@mui/material";
import { ChevronDownIcon } from "lucide-react";
import { usePathname } from "next/navigation";
import { createContext, useContext, useEffect, useRef, useState } from "react";

// Navigation Context for managing shared state between menu items
interface NavContextType {
  activeItem: string | null;
  setActiveItem: (item: string | null) => void;
}

const NavContext = createContext<NavContextType | null>(null);

// Navigation Provider Component
export const NavProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [activeItem, setActiveItem] = useState<string | null>(null);
  const pathname = usePathname();

  /**
   * Close the menu
   */
  const closeMenu = () => {
    setActiveItem(null);
  };

  /**
   * Do actions when navigation occurs
   */
  useEffect(() => {
    // Close the menu when navigation occurs
    closeMenu();
  }, [pathname]);

  return (
    <NavContext.Provider value={{ activeItem, setActiveItem }}>
      {children}
    </NavContext.Provider>
  );
};

// Hook to use navigation context
const useNavContext = () => {
  const context = useContext(NavContext);
  if (!context) {
    throw new Error("useNavContext must be used within NavProvider");
  }
  return context;
};

// Navigation Menu Item Component
interface NavMenuItemProps {
  title: string;
  children: React.ReactNode;
}

const NavMenuItem: React.FC<NavMenuItemProps> = ({ title, children }) => {
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const { activeItem, setActiveItem } = useNavContext();

  const handleMouseEnter = (event: React.MouseEvent<HTMLElement>) => {
    // Clear any existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // If another item is active, close it instantly and open this one
    if (activeItem && activeItem !== title) {
      setActiveItem(title);
      setAnchorEl(event.currentTarget);
      setIsOpen(true);
    } else {
      // Same item or no active item - normal behavior
      setActiveItem(title);
      setAnchorEl(event.currentTarget);
      setIsOpen(true);
    }
  };

  const handleMouseLeave = () => {
    // Start timeout to close menu (gives time to move to popover)
    timeoutRef.current = setTimeout(() => {
      setIsOpen(false);
      setActiveItem(null);
    }, 500);
  };

  const handlePopoverMouseEnter = () => {
    // Clear timeout when mouse enters popover
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
  };

  const handlePopoverMouseLeave = () => {
    // Start timeout to close menu when leaving popover
    timeoutRef.current = setTimeout(() => {
      setIsOpen(false);
      setActiveItem(null);
    }, 500);
  };

  // Close this menu if another item becomes active
  useEffect(() => {
    if (activeItem !== title && isOpen) {
      setIsOpen(false);
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    }
  }, [activeItem, title, isOpen]);

  return (
    <>
      <button
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        className="hover:text-primary cursor-pointer border-none bg-transparent px-4 py-2 text-sm font-medium text-inherit transition-colors duration-200"
      >
        <div className="flex items-center gap-1">
          <span>{title}</span>
          <ChevronDownIcon
            className={`size-4 ${isOpen ? "rotate-180" : "rotate-0"}`}
          />
        </div>
      </button>
      <Popper
        open={isOpen}
        anchorEl={anchorEl}
        placement="bottom"
        className="z-50"
        modifiers={[
          {
            name: "offset",
            options: {
              offset: [0, 12], // [horizontal, vertical]
            },
          },
        ]}
        transition
      >
        {({ TransitionProps }) => (
          <Fade {...TransitionProps} timeout={200}>
            <div className="rounded-lg border border-gray-200 bg-white shadow-xl">
              <Paper
                onMouseEnter={handlePopoverMouseEnter}
                onMouseLeave={handlePopoverMouseLeave}
                className="p-4"
                elevation={0}
              >
                {children}
              </Paper>
            </div>
          </Fade>
        )}
      </Popper>
    </>
  );
};

export { NavMenuItem };
