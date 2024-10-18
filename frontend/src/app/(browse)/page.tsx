"use client";

import Container from "@/components/ui/container";
import LazyButton from "@/components/ui/lazy-button";
import BlurFade from "@/components/ui/magicui/blur-fade";
import { WhatsAppLogoSvg } from "@/components/ui/svgs/whatsapp-logo";
import { Check } from "lucide-react";
import Link from "next/link";
import { Testimonials } from "./testimonials";
import { Title } from "./title";

const HomePage = () => {
  return (
    <>
      <Container className="text-center">
        <div className="py-2" />
        <div className="flex flex-col items-center justify-center">
          <BlurFade delay={0} inView>
            <Title>La Référence</Title>
            <Title>de l'Investissement</Title>
            <Title>Immobilier à Marseille</Title>
          </BlurFade>

          <BlurFade delay={0.25 * 1} inView>
            <div className="max-w-xl pt-6 text-left text-xl">
              <div className="flex items-start gap-2">
                <Check className="mt-1 h-4 w-4 text-primary" />{" "}
                <div>
                  <span className="font-visbycfBold">
                    Conseils en investissement locatif
                  </span>
                </div>
              </div>

              <div className="flex items-start gap-2">
                <Check className="mt-1 h-4 w-4 text-primary" />{" "}
                <div>
                  <span className="font-visbycfBold">
                    Opportunités off-market à forte rentabilité
                  </span>
                </div>
              </div>

              <div className="flex items-start gap-2">
                <Check className="mt-1 h-4 w-4 text-primary" />{" "}
                <div>
                  <span className="font-visbycfBold">
                    Suivi de votre investissement avec un expert
                  </span>
                </div>
              </div>
            </div>

            <div className="my-8">
              <Link href={"/properties"}>
                <LazyButton>
                  <div className="flex items-center gap-2 px-6 py-2 text-lg">
                    <WhatsAppLogoSvg className="h-6 w-6" />

                    <div>Contactez-nous</div>
                  </div>
                </LazyButton>
              </Link>
            </div>
          </BlurFade>

          <div className="py-4" />

          <BlurFade delay={0.25 * 2} inView>
            <video
              src="https://s3.terra-capital.fr/terracapital_intro.mp4?v=1"
              playsInline
              autoPlay
              loop
              muted
              className="h-full w-full rounded-lg shadow-[0_35px_60px_-15px_rgba(0,0,0,0.3)] lg:h-96 lg:max-w-6xl"
            />
          </BlurFade>
        </div>
        <div className="py-20" />
        <div className="flex flex-col items-center justify-center">
          <div className="max-w-5xl bg-gradient-to-r from-purple-400 to-indigo-600 bg-clip-text text-4xl text-transparent lg:text-6xl">
            Quelques chiffres
          </div>

          <div className="max-w-2xl pt-6 text-lg text-muted-foreground lg:text-xl">
            Nos experts travaillent tous les jours pour trouver des biens
            rentables pour nos clients.
          </div>

          <div className="py-6" />

          <div className="hidden lg:block">
            <ListOfLlmsDesktop />
          </div>

          <div className="lg:hidden">
            <ListOfLlmsMobile />
          </div>
        </div>

        <div className="py-20" />

        <Testimonials />
        <div className="py-6" />
        <Link href={"/properties"}>
          <LazyButton>
            <div className="flex items-center gap-2 px-4 py-2">
              <WhatsAppLogoSvg className="h-6 w-6" />

              <div>Contactez-nous</div>
            </div>
          </LazyButton>
        </Link>
        {/* @TODO : Add this section to ask to users to subscribe (add the logo of ChatKraken too) https://ui.aceternity.com/components/background-gradient */}
      </Container>
    </>
  );
};

const ListOfLlmsDesktop = () => {
  return (
    <div className="grid grid-cols-3 place-items-center items-center gap-y-8">
      <BlurFade delay={0.25 + 0 * 0.05} inView>
        <div className="flex flex-col items-center gap-2">
          <div className="font-visbycfBold text-4xl">150</div>
          <div className="text-muted-foreground">
            Opérations immobilières <br /> réussies
          </div>
        </div>
      </BlurFade>

      <BlurFade delay={0.25 + 1 * 0.05} inView>
        <Flare />
      </BlurFade>

      <BlurFade delay={0.25 + 2 * 0.05} inView>
        <div className="flex flex-col items-center gap-2">
          <div className="font-visbycfBold text-4xl">200</div>
          <div className="text-muted-foreground">Clients déjà satisfaits</div>
        </div>
      </BlurFade>
    </div>
  );
};

const ListOfLlmsMobile = () => {
  return (
    <div className="grid grid-cols-3 place-items-center items-center gap-y-8">
      <BlurFade delay={0.25 + 0 * 0.05} inView>
        <div className="flex flex-col items-center gap-2">
          <div className="font-visbycfBold text-4xl">150</div>
          <div className="text-muted-foreground">
            Opérations immobilières <br /> réussies
          </div>
        </div>
      </BlurFade>

      <BlurFade delay={0.25 + 1 * 0.05} inView>
        <Flare />
      </BlurFade>

      <BlurFade delay={0.25 + 2 * 0.05} inView>
        <div className="flex flex-col items-center gap-2">
          <div className="font-visbycfBold text-4xl">200</div>
          <div className="text-muted-foreground">Clients déjà satisfaits</div>
        </div>
      </BlurFade>
    </div>
  );
};

const Flare = () => {
  return (
    <div className="relative h-14 w-14">
      {/* Flare core */}
      <div className="absolute left-1/2 top-1/2 h-2 w-2 -translate-x-1/2 -translate-y-1/2 animate-pulse">
        <div className="absolute inset-0 scale-150 rounded-full bg-primary blur-sm"></div>
        <div className="blur-xs absolute inset-0 scale-75 rounded-full bg-primary"></div>
        <div className="absolute inset-0 scale-50 rounded-full bg-white"></div>
      </div>

      {/* Vertical line */}
      <div className="absolute bottom-0 left-1/2 top-0 w-px -translate-x-full bg-neutral-300/10"></div>

      {/* Horizontal line */}
      <div className="absolute left-0 right-0 top-1/2 h-px -translate-y-full bg-neutral-300/10"></div>
    </div>
  );
};

export default HomePage;
