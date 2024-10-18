import { wolfios } from "@/lib/wolfios";
import Link from "next/link";
import { Metadata } from "next";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import Container from "@/components/ui/container";

export async function generateMetadata({ params }): Promise<Metadata> {
  const shortLink = await wolfios
    .get(`/api/short-links/${params.code}`)
    .then(async (res) => await res.json())
    .catch((err) => {
      console.error("Error fetching short link: ", err);
      return null;
    });

  if (shortLink) {
    return {
      metadataBase: new URL(shortLink.url),
      openGraph: {
        url: shortLink.url,
      },
    };
  }

  return {};
}

const RedirectPage = async ({ params }) => {
  const shortLink = await wolfios
    .get(`/api/short-links/${params.code}`)
    .then(async (res) => await res.json())
    .catch((err) => {
      console.error("Error fetching short link: ", err);
      return null;
    });

  if (!shortLink) {
    return (
      <div className="text-center">
        <h1 className="text-2xl font-bold">Short link not found.</h1>
        <Link href="/" className="underline">
          Go back to the home page
        </Link>
      </div>
    );
  }

  // Redirection côté serveur
  return (
    <>
      <meta httpEquiv="refresh" content={`0;url=${shortLink.url}`} />

      <Container className="my-20">
        <div className="flex flex-col items-center justify-center gap-4">
          <LoadingSpinner className={"h-6 w-6"} />

          <p className="text-center">
            Please wait while we redirect you to the destination page.
          </p>
        </div>
      </Container>
    </>
  );
};

export default RedirectPage;
