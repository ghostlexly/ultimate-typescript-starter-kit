import "@/assets/styles/globals.css";
import type { Metadata } from "next";
import { Header } from "./header";
import { Footer } from "./footer";

// export const metadata: Metadata = {
//   title: "ChatKraken - All-in-One AI Platform",
//   description:
//     "Get access to all the top AIs, like ChatGPT-4o, Gemini Advanced, Perplexity, Claude 3, and image generation AIs like Stable Diffusion, Animagine XL, Grok Flux, and DALL-E. Enjoy all of this with a single subscription for just $14 a month, with the first month free. Experience the unlimited power of artificial intelligence.",
// };

const DefaultLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <>
      <div className="flex min-h-dvh">
        {/* Main content area */}
        <div className="flex w-full flex-1 flex-col">
          {/* Sticky header */}
          <Header />

          {/* Main content */}
          <main className="flex-1">
            {children}

            {/* Footer */}
            <Footer />
          </main>
        </div>
      </div>
    </>
  );
};

export default DefaultLayout;
