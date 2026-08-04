const API_BASE_URL = (import.meta.env.VITE_API_URL as string) || "https://api.hangrysweet.com";

export type PlaceCheckoutOrderPayload = {
  customerName: string;
  customerPhone: string;
  deliveryType: "pickup" | "home";
  deliveryAddress?: string;
  instructions?: string;
  paymentMethod: "upi" | "card" | "netbanking" | "cod";
};

type PlaceCheckoutOrderResponse = {
  message: string;
  order: {
    id: string;
    orderNumber: string;
    totalAmount: number;
    paymentStatus: string;
    orderStatus: string;
    createdAt: string;
  };
  error?: string;
};

export const placeCheckoutOrder = async (
  token: string,
  payload: PlaceCheckoutOrderPayload,
): Promise<PlaceCheckoutOrderResponse> => {
  const response = await fetch(`${API_BASE_URL}/api/checkout-orders`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });

  const data = (await response.json()) as PlaceCheckoutOrderResponse;
  if (!response.ok) {
    throw new Error(data.error || "Failed to place checkout order");
  }
  return data;
};