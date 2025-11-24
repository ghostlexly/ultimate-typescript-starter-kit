"use client";

import Link from "next/link";
import { Container } from "@/components/ui/container";
import { dateUtils } from "@/lib/date";
import { NoSsr } from "@/components/ui/no-ssr";

const Footer = () => {
  return (
    <>
      {/* Similaire au header en terme d'espacement / width */}
      <Container variant="centered" className="my-14 px-0 sm:px-4 lg:px-6">
        <footer className="px-20 py-10 rounded-lg bg-[#f6f6f6]">
          <div className="grid grid-cols-1 gap-20 md:grid-cols-3">
            {/* NAVIGATION */}
            <div className="flex flex-col gap-6">
              <h3 className="text-lg">Navigation</h3>

              <p className="text-sm">F.A.Q.</p>
              <p className="text-sm">Blog</p>
            </div>

            {/* SERVICES */}
            <div className="flex flex-col gap-6">
              <h3 className="text-lg">Notre entreprise</h3>

              <p className="text-sm">Qui sommes-nous ?</p>
              <p className="text-sm">Nous contacter</p>
              <p className="text-sm">Notre histoire</p>
              <p className="text-sm">Nos valeurs</p>
              <p className="text-sm">Témoignages</p>
              <p className="text-sm">Rejoindre l'équipe</p>
            </div>

            {/* SUIVEZ-NOUS */}
            <div className="flex flex-col gap-6">
              <div>
                <h3 className="text-lg">Service clientèle</h3>

                <p className="mt-4 text-2xl font-extrabold">01 23 45 67 89</p>
                <p>Du lundi au vendredi de 9h à 18h</p>

                <div className="mt-3 flex items-center gap-1">
                  <MailSvg />
                  <p>contact@lunisoft.fr</p>
                </div>
              </div>

              <div>
                <h3 className="mb-2 text-lg">Suivez-nous</h3>

                <div className="flex gap-5">
                  <FacebookSvg />
                  <TwitterSvg />
                  <YoutubeSvg />
                </div>
              </div>
            </div>
          </div>

          <div className="mt-16 flex flex-wrap gap-x-2 gap-y-4 md:gap-x-4">
            <p className="text-sm">Mentions légales</p>

            <p className="text-sm">Cookies</p>
            <p className="text-sm">Modalités de référencement</p>
            <p className="text-sm">Conditions générales de service</p>
            <p className="text-sm">Conditions générales d'utilisation</p>
            <p className="text-sm">Politique de confidentialité</p>
            <p className="text-sm">Avis client</p>
          </div>

          <hr className="my-6 h-px border-dashed border-gray-300" />

          <div>
            <p className="text-center">
              © LUNISOFT{" "}
              <NoSsr>
                <time>{dateUtils.format(new Date(), "yyyy")}</time>
              </NoSsr>{" "}
              - Tous droits réservés
            </p>
          </div>
        </footer>
      </Container>
    </>
  );
};

const FacebookSvg = () => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
    >
      <path
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.5"
        d="M17 2h-3a5 5 0 0 0-5 5v3H6v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3V2Z"
      />
    </svg>
  );
};

const TwitterSvg = () => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
    >
      <path
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.5"
        d="M23 3.01s-2.018 1.192-3.14 1.53a4.48 4.48 0 0 0-7.86 3v1a10.66 10.66 0 0 1-9-4.53s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5c0-.278-.028-.556-.08-.83C21.94 5.674 23 3.01 23 3.01Z"
      />
    </svg>
  );
};

const YoutubeSvg = () => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
    >
      <g fill="none" stroke="currentColor" strokeWidth="1.5">
        <path
          fill="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          d="m14 12l-3.5 2v-4l3.5 2Z"
        />
        <path d="M2 12.707v-1.415c0-2.895 0-4.343.905-5.274c.906-.932 2.332-.972 5.183-1.053C9.438 4.927 10.818 4.9 12 4.9c1.181 0 2.561.027 3.912.065c2.851.081 4.277.121 5.182 1.053c.906.931.906 2.38.906 5.274v1.415c0 2.896 0 4.343-.905 5.275c-.906.931-2.331.972-5.183 1.052c-1.35.039-2.73.066-3.912.066a141.1 141.1 0 0 1-3.912-.066c-2.851-.08-4.277-.12-5.183-1.052C2 17.05 2 15.602 2 12.708Z" />
      </g>
    </svg>
  );
};

const MailSvg = () => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
    >
      <g fill="none" stroke="currentColor" strokeWidth="1.5">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="m7 9l5 3.5L17 9"
        />
        <path d="M2 17V7a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2Z" />
      </g>
    </svg>
  );
};

export { Footer };
