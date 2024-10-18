"use server";

import { wolfios } from "@/lib/wolfios";
import { cookies } from "next/headers";

const COOKIE_NAME = "cart";

const getCart = async () => {
  // get cart id from cookie
  const cartId = cookies().get(COOKIE_NAME)?.value;

  if (!cartId) {
    return null;
  }

  // get cart
  const data = await wolfios
    .get(`/api/carts/${cartId}`)
    .then(async (res) => await res.json());

  return data;
};

const createCart = async ({ customerId, housekeeperId }) => {
  // create cart
  const data = await wolfios
    .post("/api/carts", {
      data: {
        customerId,
        housekeeperId,
      },
    })
    .then(async (res) => await res.json());

  // save cart id in cookie
  cookies().set(COOKIE_NAME, data.id);

  return data;
};

const destroyCart = async () => {
  // get cart id from cookie
  const cartId = cookies().get(COOKIE_NAME)?.value;

  if (!cartId) {
    return null;
  }

  // delete cookie
  cookies().delete(COOKIE_NAME);
};

const getHousekeeperFromCart = async () => {
  const cart = await getCart();

  if (!cart) {
    return null;
  }

  const data = await wolfios
    .get(`/api/housekeepers/${cart.housekeeperId}`)
    .then(async (res) => await res.json());

  return data;
};

export { getCart, createCart, destroyCart, getHousekeeperFromCart };
