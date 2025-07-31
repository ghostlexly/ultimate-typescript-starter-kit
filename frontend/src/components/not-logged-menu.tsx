import { Divider, Menu, MenuItem } from "@mui/material";
import Link from "next/link";

interface NotLoggedMenuProps {
  anchorEl: HTMLElement | null;
  open: boolean;
  onClose: () => void;
}

const NotLoggedMenu: React.FC<NotLoggedMenuProps> = ({
  anchorEl,
  open,
  onClose,
}) => (
  <Menu
    anchorEl={anchorEl}
    open={open}
    onClose={onClose}
    anchorOrigin={{
      vertical: "bottom",
      horizontal: "right",
    }}
    transformOrigin={{
      vertical: "top",
      horizontal: "right",
    }}
    className="mt-2"
  >
    <div className="w-56">
      <MenuItem disabled className="opacity-100">
        <span className="text-muted-foreground">Accès Client</span>
      </MenuItem>

      <Divider className="my-1" />

      <MenuItem onClick={onClose}>
        <Link href="/customer-area/login">Se connecter</Link>
      </MenuItem>

      <MenuItem onClick={onClose}>
        <Link href="/customer-area/register">Créer un compte</Link>
      </MenuItem>
    </div>
  </Menu>
);

export { NotLoggedMenu };
