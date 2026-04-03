import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { ShoppingBag, Plus, Minus, X, MapPin, Phone, User, Home, Truck, LogIn, LogOut } from "lucide-react";
import { removeFromCart, updateQuantity, clearCart, setCartItems } from "@/store/slices/cartSlice";
import { logout } from "@/store/slices/authSlice";
import { clearServerCart, removeCartItem, setCartItemQuantity } from "@/services/cartApi";
import { saveCheckoutDraft } from "@/services/checkoutDraft";
import { Button } from "./ui/button";
import { ScrollArea } from "./ui/scroll-area";
import { useEffect, useMemo, useState } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { Link, useNavigate } from "react-router-dom";
import { RootState } from "@/store";

const CART_OPEN_EVENT = "cart:open";

const CartSheet = () => {
    const dispatch = useAppDispatch();
    const navigate = useNavigate();
    const cartItems = useAppSelector((state) => state.cart.items);
    const { user, isAuthenticated } = useAppSelector((state: RootState) => state.auth);
    const [isOpen, setIsOpen] = useState(false);
    const [billNo] = useState(() => `BL${Math.random().toString(36).substr(2, 9).toUpperCase()}`);
    const [billDate] = useState(new Date().toLocaleDateString('en-US', { day: '2-digit', month: '2-digit', year: '2-digit' }));
    
    // Delivery details
    const [deliveryType, setDeliveryType] = useState<'pickup' | 'home'>('home');
    const [customerName, setCustomerName] = useState('');
    const [customerPhone, setCustomerPhone] = useState('');
    const [deliveryAddress, setDeliveryAddress] = useState('');
    const [instructions, setInstructions] = useState('');
    
    // Auto-populate from user data when authenticated
    useEffect(() => {
        if (isAuthenticated && user) {
            setCustomerName(user.name || '');
            setCustomerPhone(user.phone || '');
        }
    }, [isAuthenticated, user]);

    const count = useMemo(
        () => cartItems.reduce((acc, item) => acc + item.quantity, 0),
        [cartItems],
    );

    const subtotal = useMemo(
        () =>
            cartItems.reduce((acc, item) => {
                const price = Number(item.price) || 0;
                return acc + price * item.quantity;
            }, 0),
        [cartItems],
    );

    const deliveryFee = deliveryType === 'home' && count > 0 ? 49 : 0;
    const total = subtotal + deliveryFee;

    useEffect(() => {
        const handleOpenCart = () => setIsOpen(true);
        window.addEventListener(CART_OPEN_EVENT, handleOpenCart);
        return () => window.removeEventListener(CART_OPEN_EVENT, handleOpenCart);
    }, []);

    const updateItemQuantity = async (id: string, nextQuantity: number) => {
        const token = localStorage.getItem("token");

        if (isAuthenticated && token) {
            try {
                if (nextQuantity <= 0) {
                    const response = await removeCartItem(token, id);
                    dispatch(setCartItems(response.cart.items));
                    return;
                }

                const response = await setCartItemQuantity(token, id, nextQuantity);
                dispatch(setCartItems(response.cart.items));
                return;
            } catch (error) {
                console.error("Server cart update failed, applying local fallback:", error);
            }
        }

        if (nextQuantity <= 0) {
            dispatch(removeFromCart(id));
            return;
        }
        dispatch(updateQuantity({ id, quantity: nextQuantity }));
    };

    const removeItem = async (id: string) => {
        const token = localStorage.getItem("token");
        if (isAuthenticated && token) {
            try {
                const response = await removeCartItem(token, id);
                dispatch(setCartItems(response.cart.items));
                return;
            } catch (error) {
                console.error("Server remove failed, applying local fallback:", error);
            }
        }

        dispatch(removeFromCart(id));
    };

    const clearAllItems = async () => {
        const token = localStorage.getItem("token");
        if (isAuthenticated && token) {
            try {
                const response = await clearServerCart(token);
                dispatch(setCartItems(response.cart.items));
                return;
            } catch (error) {
                console.error("Server clear failed, applying local fallback:", error);
            }
        }

        dispatch(clearCart());
    };

    const getActualStock = (item: any) => {
        let actualStock = typeof item.stock === 'number' ? Number(item.stock) : Infinity;
        if (Array.isArray(item.variants) && item.variants.length > 0) {
            const match = item.name.match(/\(([^,]+),\s*([^)]+)\)$/);
            if (match) {
                const weightStr = match[2].trim();
                const variant = item.variants.find((v: any) => String(v.weight).toLowerCase() === weightStr.toLowerCase());
                if (variant && typeof variant.stock !== 'undefined') actualStock = Number(variant.stock) || 0;
            } else {
                const variant = item.variants.find((v: any) => item.name.includes(v.weight));
                if (variant && typeof variant.stock !== 'undefined') actualStock = Number(variant.stock) || 0;
            }
        }
        return actualStock;
    };

    const handlePayNow = () => {
        // Prevent checkout if any item is out of stock or quantity exceeds available stock
        const stockProblem = cartItems.some(it => {
            const actStock = getActualStock(it);
            return typeof actStock === 'number' && (actStock <= 0 || it.quantity > actStock);
        });
        if (stockProblem) {
            alert('Some items are out of stock or exceed available quantity. Please update your cart before placing the order.');
            return;
        }

        if (!isAuthenticated) {
            alert("Please login first to place order.");
            return;
        }

        if (!customerName.trim()) {
            alert("Please enter your full name.");
            return;
        }

        if (!customerPhone.trim()) {
            alert("Please enter your phone number.");
            return;
        }

        if (deliveryType === 'home' && !deliveryAddress.trim()) {
            alert("Please enter delivery address for home delivery.");
            return;
        }

        saveCheckoutDraft({
            customerName: customerName.trim(),
            customerPhone: customerPhone.trim(),
            deliveryType,
            deliveryAddress: deliveryType === 'home' ? deliveryAddress.trim() : '',
            instructions: instructions.trim(),
        });

        setIsOpen(false);
        navigate('/payment');
    };

    // Show login prompt if not authenticated and cart has items
    const showLoginPrompt = !isAuthenticated && cartItems.length > 0;

    return (
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
                <div className="relative cursor-pointer group">
                    <div className="p-2 rounded-full hover:bg-black/5 transition-colors">
                        <ShoppingBag className="w-6 h-6 text-[#1A2744]" />
                    </div>
                    {count > 0 && (
                        <span className="absolute top-0 right-0 bg-[#D4A373] text-white text-[10px] w-5 h-5 flex items-center justify-center rounded-full font-bold shadow-sm border-2 border-[#F5ECD7]">
                            {count}
                        </span>
                    )}
                </div>
            </SheetTrigger>
            <SheetContent side="right" className="w-full border-l-2 border-[#2C1810] bg-white p-0 sm:max-w-[420px]">
                <div className="flex h-full flex-col bg-white">
                    {/* Close Button */}
                    <div className="absolute right-4 top-4 z-50">
                        <button onClick={() => setIsOpen(false)} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                            <X className="w-5 h-5 text-[#2C1810]" />
                        </button>
                    </div>

                    {showLoginPrompt ? (
                        <div className="flex flex-1 flex-col items-center justify-center px-6 text-center space-y-6">
                            <div className="rounded-full bg-[#F5ECD7] p-6">
                                <LogIn className="h-10 w-10 text-[#2C1810]" />
                            </div>
                            <div>
                                <h3 className="font-playfair text-2xl font-bold text-[#2C1810] mb-2">Login Required</h3>
                                <p className="text-sm text-[#8D6E63]">
                                    Please log in to your account to place an order and checkout.
                                </p>
                            </div>
                            <div className="space-y-2 w-full">
                                <Link
                                    to="/login"
                                    className="block w-full bg-[#2C1810] text-white hover:bg-[#1f1008] font-bold py-3 px-4 rounded-lg transition-colors text-sm tracking-wider uppercase no-underline text-center"
                                >
                                    Login Now
                                </Link>
                                <Link
                                    to="/register"
                                    className="block w-full bg-[#D4A373] text-[#2C1810] hover:bg-[#c49260] font-bold py-3 px-4 rounded-lg transition-colors text-sm tracking-wider uppercase no-underline text-center"
                                >
                                    Create Account
                                </Link>
                            </div>
                        </div>
                    ) : cartItems.length === 0 ? (
                        <div className="flex flex-1 flex-col items-center justify-center px-6 text-center">
                            <div className="mb-4 rounded-full bg-[#F5ECD7] p-4">
                                <ShoppingBag className="h-7 w-7 text-[#8D6E63]" />
                            </div>
                            <h3 className="font-playfair text-2xl text-[#3E2723]">Cart is empty</h3>
                            <p className="mt-2 text-sm text-[#8D6E63]">Pick your favorites and add them to start your order.</p>
                            <Button
                                onClick={() => setIsOpen(false)}
                                variant="outline"
                                className="mt-5 border-[#D4A373] text-[#3E2723] hover:bg-[#F5ECD7]"
                            >
                                Continue Shopping
                            </Button>
                        </div>
                    ) : (
                        <>
                            <ScrollArea className="flex-1">
                                <div className="font-mono text-sm">
                                    {/* Bill Header */}
                                    <div className="bg-[#2C1810] text-[#F5ECD7] px-6 py-8 text-center space-y-2">
                                        <div className="text-xl font-bold tracking-widest">HANGARY? SWEET.</div>
                                        <div className="text-xs text-[#D4A373] font-semibold tracking-wide">ORDER BILL</div>
                                        {isAuthenticated && (
                                            <button
                                                onClick={() => {
                                                    dispatch(logout());
                                                    dispatch(clearCart());
                                                    setIsOpen(false);
                                                }}
                                                className="text-xs text-red-300 hover:text-red-400 transition-colors flex items-center justify-center gap-1 mx-auto mt-2 text-center"
                                            >
                                                <LogOut size={12} /> Logout
                                            </button>
                                        )}
                                        <div className="border-t border-b border-[#D4A373]/50 py-3 mt-3 text-xs space-y-1">
                                            <div className="flex justify-between">
                                                <span>BILL #</span>
                                                <span>{billNo}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span>DATE</span>
                                                <span>{billDate}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span>TYPE</span>
                                                <span>{deliveryType === 'pickup' ? 'PICKUP' : 'HOME DELIVERY'}</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Customer Info Section */}
                                    {(customerName || customerPhone || deliveryAddress) && (
                                        <div className="px-6 py-4 bg-[#F5ECD7] border-b border-dashed border-[#2C1810] text-xs text-[#2C1810] space-y-1">
                                            {customerName && <div><span className="font-bold">NAME:</span> {customerName}</div>}
                                            {customerPhone && <div><span className="font-bold">PHONE:</span> {customerPhone}</div>}
                                            {deliveryType === 'home' && deliveryAddress && (
                                                <div><span className="font-bold">ADDRESS:</span> {deliveryAddress}</div>
                                            )}
                                        </div>
                                    )}

                                    {/* Items Section */}
                                    <div className="px-6 py-6 border-b-2 border-dashed border-[#2C1810]">
                                        {/* Column Headers */}
                                        <div className="flex justify-between text-xs font-bold text-[#2C1810] mb-3 pb-2 border-b border-[#2C1810]">
                                            <div className="w-8">QTY</div>
                                            <div className="flex-1 px-2">ITEM</div>
                                            <div className="w-16 text-right">RATE</div>
                                            <div className="w-16 text-right">AMOUNT</div>
                                        </div>

                                        {/* Items */}
                                        <div className="space-y-3">
                                            {cartItems.map((item) => {
                                                const price = Number(item.price) || 0;
                                                const lineTotal = price * item.quantity;

                                                const actualStock = getActualStock(item);
                                                const availableStock = actualStock;
                                                const outOfStock = availableStock !== Infinity ? availableStock <= 0 : false;
                                                const canIncrease = !outOfStock && item.quantity < availableStock;

                                                return (
                                                    <div key={item.id} className="text-xs text-[#2C1810]">
                                                        {/* Item Row */}
                                                        <div className="flex justify-between items-start gap-2">
                                                            <div className="w-8">{item.quantity}</div>
                                                            <div className="flex-1 px-2">
                                                                <div className="font-semibold">{item.name}</div>
                                                                <div className="text-[10px] text-[#666]">{item.category} {typeof item.stock === 'number' && (<span className="ml-2 text-[10px] font-medium">• Stock: {availableStock}</span>)}</div>
                                                            </div>
                                                            <div className="w-16 text-right">${price.toFixed(2)}</div>
                                                            <div className="w-16 text-right font-bold">${lineTotal.toFixed(2)}</div>
                                                        </div>

                                                        {/* Quantity Controls */}
                                                        <div className="flex justify-end gap-1 mt-2 items-center">
                                                            <button
                                                                onClick={() => void updateItemQuantity(item.id, item.quantity - 1)}
                                                                className="p-1 hover:bg-[#F5ECD7] rounded transition-colors"
                                                                title="Decrease"
                                                            >
                                                                <Minus className="w-3 h-3" />
                                                            </button>
                                                            <span className="w-4 text-center text-xs font-bold">{item.quantity}</span>
                                                            <button
                                                                onClick={() => {
                                                                    if (!canIncrease) {
                                                                        if (outOfStock) alert(`Product "${item.name}" is out of stock`);
                                                                        else alert(`Only ${availableStock} unit(s) available for "${item.name}"`);
                                                                        return;
                                                                    }
                                                                    void updateItemQuantity(item.id, item.quantity + 1);
                                                                }}
                                                                disabled={!canIncrease}
                                                                className={`p-1 rounded transition-colors ${!canIncrease ? 'opacity-40 cursor-not-allowed' : 'hover:bg-[#F5ECD7]'}`}
                                                                title={canIncrease ? 'Increase' : 'Cannot increase'}
                                                            >
                                                                <Plus className="w-3 h-3" />
                                                            </button>
                                                            <button
                                                                onClick={() => void removeItem(item.id)}
                                                                className="ml-2 px-2 py-1 text-[10px] font-bold text-red-600 hover:bg-red-50 rounded transition-colors"
                                                            >
                                                                DEL
                                                            </button>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>

                                    {/* Delivery & Customer Details Section */}
                                    <div className="px-6 py-6 bg-[#F5ECD7] border-b-2 border-dashed border-[#2C1810]">
                                        <div className="space-y-4">
                                            {/* Delivery Type Selection */}
                                            <div>
                                                <div className="text-xs font-bold text-[#2C1810] mb-3 tracking-widest">DELIVERY TYPE</div>
                                                <div className="grid grid-cols-2 gap-2">
                                                    <button
                                                        onClick={() => setDeliveryType('pickup')}
                                                        className={`flex items-center gap-2 p-3 rounded-lg border-2 text-sm font-semibold transition-all ${
                                                            deliveryType === 'pickup'
                                                                ? 'border-[#2C1810] bg-white text-[#2C1810]'
                                                                : 'border-[#D4A373] bg-transparent text-[#666] hover:border-[#2C1810]'
                                                        }`}
                                                    >
                                                        <Home className="w-4 h-4" />
                                                        <span>PICKUP</span>
                                                    </button>
                                                    <button
                                                        onClick={() => setDeliveryType('home')}
                                                        className={`flex items-center gap-2 p-3 rounded-lg border-2 text-sm font-semibold transition-all ${
                                                            deliveryType === 'home'
                                                                ? 'border-[#2C1810] bg-white text-[#2C1810]'
                                                                : 'border-[#D4A373] bg-transparent text-[#666] hover:border-[#2C1810]'
                                                        }`}
                                                    >
                                                        <Truck className="w-4 h-4" />
                                                        <span>HOME DELIVERY</span>
                                                    </button>
                                                </div>
                                            </div>

                                            {/* Customer Details */}
                                            <div>
                                                <div className="text-xs font-bold text-[#2C1810] mb-2 tracking-widest">YOUR DETAILS</div>
                                                <div className="space-y-2">
                                                    <div className="flex items-center gap-2 bg-white rounded-lg px-3 py-2 border border-[#D4A373]">
                                                        <User className="w-4 h-4 text-[#8D6E63]" />
                                                        <input
                                                            type="text"
                                                            placeholder="Full Name"
                                                            value={customerName}
                                                            onChange={(e) => setCustomerName(e.target.value)}
                                                            className="flex-1 text-xs bg-white outline-none border-none text-[#2C1810]"
                                                        />
                                                    </div>
                                                    <div className="flex items-center gap-2 bg-white rounded-lg px-3 py-2 border border-[#D4A373]">
                                                        <Phone className="w-4 h-4 text-[#8D6E63]" />
                                                        <input
                                                            type="tel"
                                                            placeholder="Phone Number"
                                                            value={customerPhone}
                                                            onChange={(e) => setCustomerPhone(e.target.value)}
                                                            className="flex-1 text-xs bg-white outline-none border-none text-[#2C1810]"
                                                        />
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Delivery Address (if home delivery) */}
                                            {deliveryType === 'home' && (
                                                <div>
                                                    <div className="text-xs font-bold text-[#2C1810] mb-2 tracking-widest">DELIVERY ADDRESS</div>
                                                    <div className="flex items-start gap-2 bg-white rounded-lg px-3 py-2 border border-[#D4A373]">
                                                        <MapPin className="w-4 h-4 text-[#8D6E63] mt-2 flex-shrink-0" />
                                                        <textarea
                                                            placeholder="Enter delivery address, house number, area name..."
                                                            value={deliveryAddress}
                                                            onChange={(e) => setDeliveryAddress(e.target.value)}
                                                            rows={3}
                                                            className="flex-1 text-xs bg-white outline-none border-none text-[#2C1810] resize-none"
                                                        />
                                                    </div>
                                                </div>
                                            )}

                                            {/* Special Instructions */}
                                            <div>
                                                <div className="text-xs font-bold text-[#2C1810] mb-2 tracking-widest">SPECIAL INSTRUCTIONS (OPTIONAL)</div>
                                                <textarea
                                                    placeholder="Add any special requests (e.g., no sugar, extra frosting, etc.)"
                                                    value={instructions}
                                                    onChange={(e) => setInstructions(e.target.value)}
                                                    rows={2}
                                                    className="w-full text-xs bg-white rounded-lg px-3 py-2 border border-[#D4A373] outline-none text-[#2C1810] resize-none"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="px-6 py-6 space-y-2 text-xs text-[#2C1810] border-b-2 border-dashed border-[#2C1810]">
                                        <div className="flex justify-between">
                                            <span>SUBTOTAL</span>
                                            <span>${subtotal.toFixed(2)}</span>
                                        </div>
                                        {deliveryType === 'home' && (
                                            <div className="flex justify-between">
                                                <span>HOME DELIVERY</span>
                                                <span>${deliveryFee.toFixed(2)}</span>
                                            </div>
                                        )}
                                        {deliveryType === 'pickup' && (
                                            <div className="flex justify-between text-[10px] text-[#666]">
                                                <span>PICKUP (NO DELIVERY CHARGE)</span>
                                                <span>$0.00</span>
                                            </div>
                                        )}
                                        <div className="flex justify-between font-bold text-lg pt-2 border-t border-dashed border-[#2C1810]">
                                            <span>TOTAL</span>
                                            <span>${total.toFixed(2)}</span>
                                        </div>
                                    </div>

                                    {/* Footer */}
                                    {instructions && (
                                        <div className="px-6 py-4 bg-[#FFF9E6] border-b border-dashed border-[#2C1810] text-xs text-[#2C1810]">
                                            <div className="font-bold mb-1">SPECIAL INSTRUCTIONS:</div>
                                            <div className="text-[11px]">{instructions}</div>
                                        </div>
                                    )}
                                    <div className="px-6 py-6 text-center space-y-3 text-xs text-[#666]">
                                        <div className="text-[#2C1810] font-semibold">THANK YOU FOR YOUR ORDER!</div>
                                        <div className="text-xs">Please keep this receipt for reference.</div>
                                    </div>
                                </div>
                            </ScrollArea>

                            {/* Action Buttons */}
                            <div className="border-t-2 border-[#2C1810] bg-[#F5ECD7] px-6 py-4 space-y-3 font-mono text-sm">
                                <Button 
                                    onClick={handlePayNow}
                                    disabled={cartItems.length === 0 || cartItems.some(it => {
                                        const actualStk = getActualStock(it);
                                        return typeof actualStk === 'number' && (actualStk <= 0 || it.quantity > actualStk);
                                    })}
                                    className="w-full bg-[#2C1810] text-[#F5ECD7] hover:bg-[#1f1008] font-bold py-3 text-sm tracking-wider uppercase"
                                >
                                    Proceed to Payment
                                </Button>
                                <div className="grid grid-cols-2 gap-2">
                                    <Button
                                        variant="outline"
                                        className="border-[#2C1810] text-[#2C1810] hover:bg-white text-xs"
                                        onClick={() => void clearAllItems()}
                                    >
                                        Clear
                                    </Button>
                                    <Button
                                        variant="outline"
                                        className="border-[#2C1810] text-[#2C1810] hover:bg-white text-xs"
                                        onClick={() => setIsOpen(false)}
                                    >
                                        Close
                                    </Button>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </SheetContent>
        </Sheet>
    );
};

export default CartSheet;
