"use server";

import { revalidatePath, revalidateTag } from "next/cache";

const cacheRevalidateTag = (tags: string[]) => {
  tags.map((tag) => {
    revalidateTag(tag);
  });
};

const cacheRevalidate = () => {
  revalidatePath("/");
};

export { cacheRevalidateTag, cacheRevalidate };
