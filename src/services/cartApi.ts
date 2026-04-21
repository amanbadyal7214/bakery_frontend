import type { CartItem } from "@/store/slices/cartSlice";

const API_BASE_URL = (import.meta.env.VITE_API_URL as string) || "https://bakery-bakend.onrender.com";

type CartApiResponse = {
  cart: {
    items: CartItem[];
    summary: {
      itemsCount: number;
      subtotal: number;
    };
  };
  error?: string;
};

const authHeaders = (token: string) => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${token}`,
});

const parseResponse = async (response: Response): Promise<CartApiResponse> => {
  const data = (await response.json()) as CartApiResponse;
  if (!response.ok) {
    throw new Error(data.error || "Cart request failed");
  }
  return data;
};

export const fetchCart = async (token: string) => {
  const response = await fetch(`${API_BASE_URL}/api/cart`, {
    method: "GET",
    headers: authHeaders(token),
  });
  return parseResponse(response);
};

export const addCartItem = async (token: string, payload: { productId: string; variantId?: string; quantity: number; name?: string; stock?: number; price?: number; weight?: string }) => {
  const response = await fetch(`${API_BASE_URL}/api/cart/items`, {
    method: "POST",
    headers: authHeaders(token),
    body: JSON.stringify(payload),
  });
  return parseResponse(response);
};

export const setCartItemQuantity = async (
  token: string,
  productId: string,
  variantId: string | undefined,
  quantity: number,
) => {
  const response = await fetch(`${API_BASE_URL}/api/cart/items/${productId}`, {
    method: "PATCH",
    headers: authHeaders(token),
    body: JSON.stringify({ quantity, variantId }),
  });
  return parseResponse(response);
};

export const removeCartItem = async (token: string, productId: string, variantId?: string) => {
  const url = variantId 
    ? `${API_BASE_URL}/api/cart/items/${productId}?variantId=${variantId}`
    : `${API_BASE_URL}/api/cart/items/${productId}`;
    
  const response = await fetch(url, {
    method: "DELETE",
    headers: authHeaders(token),
  });
  return parseResponse(response);
};

export const clearServerCart = async (token: string) => {
  const response = await fetch(`${API_BASE_URL}/api/cart`, {
    method: "DELETE",
    headers: authHeaders(token),
  });
  return parseResponse(response);
};