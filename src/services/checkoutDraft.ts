export type CheckoutDraft = {
  customerName: string;
  customerPhone: string;
  deliveryType: "pickup" | "home";
  deliveryAddress: string;
  instructions: string;
};

const CHECKOUT_DRAFT_KEY = "checkout:draft";

export const saveCheckoutDraft = (draft: CheckoutDraft) => {
  sessionStorage.setItem(CHECKOUT_DRAFT_KEY, JSON.stringify(draft));
};

export const getCheckoutDraft = (): CheckoutDraft | null => {
  const raw = sessionStorage.getItem(CHECKOUT_DRAFT_KEY);
  if (!raw) return null;

  try {
    return JSON.parse(raw) as CheckoutDraft;
  } catch {
    return null;
  }
};

export const clearCheckoutDraft = () => {
  sessionStorage.removeItem(CHECKOUT_DRAFT_KEY);
};