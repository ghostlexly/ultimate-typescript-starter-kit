import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const UserAvatar = ({
  imageUrl,
  name,
  email,
}: {
  imageUrl: string;
  name?: string;
  email?: string;
}) => (
  <Avatar className="size-full">
    <AvatarImage src={imageUrl || undefined} alt={name || "User"} />
    <AvatarFallback className="bg-primary text-primary-foreground">
      {name?.charAt(0).toUpperCase() || email?.charAt(0).toUpperCase()}
    </AvatarFallback>
  </Avatar>
);

export { UserAvatar };
