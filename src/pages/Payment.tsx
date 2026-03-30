import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { RootState } from "@/store";
import { clearCart } from "@/store/slices/cartSlice";
import { Button } from "@/components/ui/button";
import { placeCheckoutOrder } from "@/services/checkoutOrderApi";
import { clearCheckoutDraft, getCheckoutDraft } from "@/services/checkoutDraft";

const Payment = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const cartItems = useAppSelector((state) => state.cart.items);
  const { isAuthenticated } = useAppSelector((state: RootState) => state.auth);
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<"upi" | "card" | "netbanking" | "cod">("upi");

  const draft = getCheckoutDraft();

  const subtotal = useMemo(
    () => cartItems.reduce((acc, item) => acc + (Number(item.price) || 0) * item.quantity, 0),
    [cartItems],
  );

  const deliveryFee = draft?.deliveryType === "home" && cartItems.length > 0 ? 49 : 0;
  const total = subtotal + deliveryFee;

  const handlePayAndPlaceOrder = async () => {
    if (!isAuthenticated) {
      alert("Please login first.");
      navigate("/login");
      return;
    }

    if (!draft) {
      alert("Checkout details missing. Please review cart first.");
      navigate("/");
      return;
    }

    if (cartItems.length === 0) {
      alert("Your cart is empty.");
      navigate("/");
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) {
      alert("Session expired. Please login again.");
      navigate("/login");
      return;
    }

    setIsProcessing(true);
    try {
      const result = await placeCheckoutOrder(token, {
        customerName: draft.customerName,
        customerPhone: draft.customerPhone,
        deliveryType: draft.deliveryType,
        deliveryAddress: draft.deliveryAddress,
        instructions: draft.instructions,
        paymentMethod: paymentMethod,
      });

      dispatch(clearCart());
      clearCheckoutDraft();
      alert(`Payment successful via ${paymentMethod.toUpperCase()}. Order No: ${result.order.orderNumber}`);
      navigate("/");
    } catch (error) {
      console.error("Payment/order failed:", error);
      alert(error instanceof Error ? error.message : "Payment failed. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  if (!draft) {
    return (
      <div className="min-h-screen bg-[#FDFBF7]">
        <Navbar />
        <div className="pt-28 px-6 max-w-xl mx-auto">
          <div className="bg-white border border-[#D4A373] rounded-2xl p-6 text-center space-y-4">
            <h1 className="text-2xl font-bold text-[#2C1810]">No Checkout Details</h1>
            <p className="text-sm text-[#8D6E63]">Please go to cart and continue to payment again.</p>
            <Button onClick={() => navigate("/")} className="bg-[#2C1810] hover:bg-[#1f1008] text-white">Go Home</Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FDFBF7] flex flex-col">
      <Navbar />
      <div className="flex-1 pt-28 pb-16 px-6 flex items-center justify-center">
        <div className="w-full max-w-2xl grid grid-cols-1 lg:grid-cols-2 gap-8">
        <section className="bg-white rounded-2xl border-2 border-[#2C1810] p-6 space-y-5">
          <h1 className="text-2xl font-bold text-[#2C1810]">Payment</h1>
          <p className="text-sm text-[#8D6E63]">Choose payment method and confirm. Order will be placed only after payment.</p>

          <div className="space-y-3">
            <button
              onClick={() => setPaymentMethod("upi")}
              className={`w-full text-left border rounded-xl px-4 py-3 ${paymentMethod === "upi" ? "border-[#2C1810] bg-[#F5ECD7]" : "border-[#D4A373]"}`}
            >
              UPI
            </button>
            <button
              onClick={() => setPaymentMethod("card")}
              className={`w-full text-left border rounded-xl px-4 py-3 ${paymentMethod === "card" ? "border-[#2C1810] bg-[#F5ECD7]" : "border-[#D4A373]"}`}
            >
              Card
            </button>
            <button
              onClick={() => setPaymentMethod("netbanking")}
              className={`w-full text-left border rounded-xl px-4 py-3 ${paymentMethod === "netbanking" ? "border-[#2C1810] bg-[#F5ECD7]" : "border-[#D4A373]"}`}
            >
              Net Banking
            </button>
            <button
              onClick={() => setPaymentMethod("cod")}
              className={`w-full text-left border rounded-xl px-4 py-3 ${paymentMethod === "cod" ? "border-[#2C1810] bg-[#F5ECD7]" : "border-[#D4A373]"}`}
            >
              Cash on Delivery
            </button>
          </div>

          <div className="text-sm text-[#2C1810] space-y-1 border-t border-dashed border-[#D4A373] pt-4">
            <div><span className="font-semibold">Name:</span> {draft.customerName}</div>
            <div><span className="font-semibold">Phone:</span> {draft.customerPhone}</div>
            <div><span className="font-semibold">Delivery:</span> {draft.deliveryType === "home" ? "Home Delivery" : "Pickup"}</div>
            {draft.deliveryType === "home" && <div><span className="font-semibold">Address:</span> {draft.deliveryAddress}</div>}
          </div>
        </section>

        <section className="bg-white rounded-2xl border border-[#D4A373] p-6 space-y-4">
          <h2 className="text-xl font-bold text-[#2C1810]">Order Summary</h2>
          <div className="space-y-2 text-sm text-[#2C1810] max-h-64 overflow-auto pr-1">
            {cartItems.map((item) => (
              <div key={item.id} className="flex justify-between">
                <span>{item.name} x {item.quantity}</span>
                <span>${((Number(item.price) || 0) * item.quantity).toFixed(2)}</span>
              </div>
            ))}
          </div>
          <div className="border-t border-dashed border-[#D4A373] pt-3 text-sm space-y-1">
            <div className="flex justify-between"><span>Subtotal</span><span>${subtotal.toFixed(2)}</span></div>
            <div className="flex justify-between"><span>Delivery</span><span>${deliveryFee.toFixed(2)}</span></div>
            <div className="flex justify-between font-bold text-lg text-[#2C1810]"><span>Total</span><span>${total.toFixed(2)}</span></div>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-2">
            <Button
              variant="outline"
              onClick={() => navigate(-1)}
              className="border-[#2C1810] text-[#2C1810]"
            >
              Back
            </Button>
            <Button
              onClick={() => void handlePayAndPlaceOrder()}
              disabled={isProcessing || cartItems.length === 0}
              className="bg-[#2C1810] hover:bg-[#1f1008] text-white"
            >
              {isProcessing ? "Processing..." : "Pay & Place Order"}
            </Button>
          </div>
        </section>
      </div>
    </div>
    </div>
  );
};

export default Payment;