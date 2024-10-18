import { redirect } from "next/navigation";
import Content from "./content";

const PropertyPage = async ({ searchParams, params }) => {
  if (!searchParams?.customerId) {
    // redirect to home
    redirect("/");
  }

  return <Content />;
};

export default PropertyPage;
