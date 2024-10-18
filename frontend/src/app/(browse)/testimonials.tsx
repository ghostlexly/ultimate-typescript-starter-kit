import Marquee from "@/components/ui/magicui/marquee";
import { XLogoSvg } from "@/components/ui/svgs/x-logo";
import { cn } from "@/lib/utils";

const reviews = [
  {
    name: "Katalynx!",
    username: "@KatalystFn",
    body: "Merci Alexandre pour ce bien off market à 12% de rentabilité !",
    img: "/assets/images/testimonials/avatars/KatalystFn.jpg",
  },
  {
    name: "PL Bompard",
    username: "@PLBompard",
    body: "Alexandre m'a trouvé un immeuble exceptionnel. Incroyable !",
    img: "/assets/images/testimonials/avatars/PLBompard.jpg",
  },
  {
    name: "Ross Alex",
    username: "@rossalex_",
    body: "Rentabilité de 15% sur mon dernier achat. Merci Alexandre !",
    img: "/assets/images/testimonials/avatars/rossalex_.jpg",
  },
  {
    name: "Demitri",
    username: "@iprogramidesign",
    body: "Alexandre déniche des perles rares. Très satisfait !",
    img: "/assets/images/testimonials/avatars/iprogramidesign.jpg",
  },
  {
    name: "Oscar Bastos",
    username: "@oscarbastos_web",
    body: "Biens off market de qualité. Alexandre est un expert !",
    img: "/assets/images/testimonials/avatars/oscarbastos_web.jpg",
  },
  {
    name: "Satarupa Saha",
    username: "@satarupasaha334",
    body: "Rentabilités impressionnantes. Merci pour tout, Alexandre !",
    img: "/assets/images/testimonials/avatars/satarupasaha334.jpg",
  },
  {
    name: "RITIK",
    username: "@_R_T_K__",
    body: "Alexandre m'a aidé à trouver des biens exceptionnels.",
    img: "/assets/images/testimonials/avatars/_R_T_K__.jpg",
  },
  {
    name: "Bhanu singh",
    username: "@Bhanu_here",
    body: "Expertise incroyable. Merci pour ces opportunités, Alexandre !",
    img: "/assets/images/testimonials/avatars/Bhanu_here.jpg",
  },
  {
    name: "Sagar Rana",
    username: "@SoarinSkySagar",
    body: "Alexandre trouve toujours des biens à forte rentabilité.",
    img: "/assets/images/testimonials/avatars/SoarinSkySagar.jpg",
  },
  {
    name: "Samy ⵣ",
    username: "@samydotsh",
    body: "Grâce à Alexandre, mon patrimoine s'est considérablement accru.",
    img: "/assets/images/testimonials/avatars/samydotsh.jpg",
  },
  {
    name: "Calou",
    username: "@__calou__",
    body: "Des biens off market incroyables. Merci Alexandre !",
    img: "/assets/images/testimonials/avatars/__calou__.jpg",
  },
  {
    name: "Phil BARRETT",
    username: "@Phil_BARR3TT",
    body: "Alexandre est le meilleur pour trouver des biens rentables.",
    img: "/assets/images/testimonials/avatars/Phil_BARR3TT.png",
  },
  {
    name: "Matt Hand",
    username: "@matterpreter",
    body: "Expertise remarquable. Merci pour ces opportunités uniques !",
    img: "/assets/images/testimonials/avatars/matterpreter.png",
  },
];

const firstRow = reviews.slice(0, reviews.length / 2);
const secondRow = reviews.slice(reviews.length / 2);

const Testimonials = () => {
  return (
    <>
      <div className="flex flex-col items-center justify-center">
        <div className="max-w-4xl bg-gradient-to-r from-orange-400 to-red-600 bg-clip-text text-4xl text-transparent lg:text-6xl">
          Ce Que Disent Nos Clients
        </div>

        <div className="max-w-2xl pt-6 text-lg text-muted-foreground lg:text-xl">
          Rejoignez des milliers de clients satisfaits qui ont investi à
          Marseille.
        </div>
      </div>

      <div className="my-10" />

      <TestimonialsDesktop />

      <TestimonialsMobile />
    </>
  );
};

const TestimonialsDesktop = () => {
  return (
    <>
      <div className="relative hidden h-[500px] w-full flex-row items-center justify-center overflow-hidden rounded-lg lg:flex">
        <Marquee pauseOnHover vertical className="[--duration:50s]">
          {firstRow.map((review) => (
            <AppCard key={review.username} {...review} />
          ))}
        </Marquee>
        <Marquee reverse pauseOnHover vertical className="[--duration:50s]">
          {secondRow.map((review) => (
            <AppCard key={review.username} {...review} />
          ))}
        </Marquee>

        <div className="pointer-events-none absolute inset-x-0 top-0 h-1/3 bg-gradient-to-b from-background"></div>
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-background"></div>
      </div>
    </>
  );
};

const TestimonialsMobile = () => {
  return (
    <div className="relative flex h-[500px] w-full flex-row items-center justify-center overflow-hidden rounded-lg lg:hidden">
      <Marquee pauseOnHover vertical className="[--duration:50s]">
        {firstRow.map((review) => (
          <AppCard key={review.username} {...review} />
        ))}
      </Marquee>

      <div className="pointer-events-none absolute inset-x-0 top-0 h-1/3 bg-gradient-to-b from-background"></div>
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-background"></div>
    </div>
  );
};

const AppCard = ({
  img,
  name,
  username,
  body,
}: {
  img: string;
  name: string;
  username: string;
  body: string;
}) => {
  return (
    <figure
      className={cn(
        "relative w-64 cursor-pointer overflow-hidden rounded-xl border p-4",
        "border bg-muted shadow-lg"
      )}
    >
      <blockquote className="text-left text-sm">{body}</blockquote>
      <div className="mt-4" />

      <div className="flex items-center justify-between">
        <div className="flex flex-row items-center gap-2">
          <img
            className="rounded-full"
            width="32"
            height="32"
            alt=""
            src={img}
          />
          <div className="flex flex-col">
            <figcaption className="text-sm font-medium dark:text-white">
              {name}
            </figcaption>
            <p className="text-xs font-medium dark:text-white/40">{username}</p>
          </div>
        </div>

        <XLogoSvg className="h-5 w-5 text-black" />
      </div>
    </figure>
  );
};

export { Testimonials };
