import Container from "@/components/ui/container";
import Link from "next/link";

const AppPage = () => {
  return (
    <>
      <Container className="my-8">
        <div className="font-visbycfBold text-4xl">
          Bienvenue dans l'administration
        </div>

        <span>Choisissez une application depuis le menu.</span>
      </Container>
    </>
  );
};

const AppItem = ({
  icon,
  title,
  href,
}: {
  icon: React.ReactNode;
  title: React.ReactNode;
  href: string;
}) => {
  return (
    <>
      <Link href={href}>
        <div className="h-full min-h-16 cursor-pointer rounded-lg border transition-all duration-500 hover:border-primary hover:shadow-sm hover:shadow-primary">
          <div className="flex h-full items-center justify-center gap-3">
            <span>{icon}</span>
            <div className="text-xl">{title}</div>
          </div>
        </div>
      </Link>
    </>
  );
};

export default AppPage;
