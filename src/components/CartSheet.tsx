import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { ShoppingBag, X, Plus, Minus } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/store";
import { removeFromCart, updateQuantity } from "@/store/slices/cartSlice";
import { Button } from "./ui/button";
import { ScrollArea } from "./ui/scroll-area";
import { useEffect, useState, useRef } from "react";

const CartSheet = () => {
    const dispatch = useDispatch();
    const cartItems = useSelector((state: RootState) => state.cart.items);
    
    const total = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
    const count = cartItems.reduce((acc, item) => acc + item.quantity, 0);

    const [receiptId, setReceiptId] = useState("");
    const [dateStr, setDateStr] = useState("");
    const [timeStr, setTimeStr] = useState("");
    const [isOpen, setIsOpen] = useState(false);
    
    // Auto-open logic when items are added (optional, but requested behavior implies "as user keep adding... chart sheet get updates and move upward")
    // Actually the user probably wants the sheet to be openable and stay open without blocking.
    // Or maybe auto-open. Let's make it stay openable without modal.
    
    // We need to manage the open state to potentially auto-open or just rely on Trigger. 
    // Since ShadCN Sheet is controlled or uncontrolled. 
    // If we want it to "grow" as items are added, that's just content height.
    
    useEffect(() => {
        setReceiptId(Math.floor(100000 + Math.random() * 900000).toString());
        const now = new Date();
        setDateStr(now.toLocaleDateString());
        setTimeStr(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    }, [count]); 

    // Handle auto-opening when items are added
    useEffect(() => {
        if (count > 0) {
            setIsOpen(true);
        } else {
            setIsOpen(false);
        }
    }, [count]);

    // If no items, simply return the trigger wrapper (or null if we want to hide perfectly)
    // The user said: "if cart is empty then dont show chart sheet"
    // But we still need the trigger button? "only show chart sheet... if cart has item then alwys show cahrt shee and dont hide"
    // Usually a cart icon is always visible. But maybe the user means the SHEET (receipt) pops up automatically.
    
    // User request: "if cart is empty then dont show chart sheet but if cart has item then alwys show cahrt shee and dont hide"
    // Interpretation: 
    // 1. Empty cart -> Sheet is closed/hidden.
    // 2. Has items -> Sheet is OPEN and STAYS OPEN.
    
    // To make it "always show" when items > 0, we can control the `open` prop of Sheet.

    return (
        <Sheet modal={false} open={isOpen} onOpenChange={setIsOpen}>
            {/* We can still keep Trigger if user ever wants to toggle, but per request "always show... dont hide" 
                Since we control `open`, the trigger might not be needed or would just not close it if we force open.
                However, if we put `open={count > 0}`, it will force open. 
                Shadcn Sheet's `open` prop controls the state. 
                If we want to allow user to close it? "dont hide". So maybe not allow close.
            */}
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
            {/* 
                User Requested:
                1. From Bottom
                2. No disable rest of screen (No Overlay)
                3. "Horizontal upward animation" -> Likely means sliding up from bottom. 
                4. "chart sheet get updates and moves upward direction as new orders added" -> The height should grow upwards.
            */}
            <SheetContent 
                side="bottom" 
                disableOverlay={true}
                className="w-full sm:w-[500px] sm:left-auto sm:right-10 p-0 border-none bg-transparent shadow-none max-h-[100vh] overflow-hidden pointer-events-none"
                style={{ bottom: 0 }}
            >
                {/* Pointer events auto needed for content because container is pointer-events-none to let click through if transparent? 
                    Actually SheetContent usually has a fixed position. If disableOverlay is true, the content is still a fixed div.
                    We want it to not block clicks outside.
                    The custom SheetContent implementation we did removes the Overlay, but the Content itself is `fixed inset-0` or similar?
                    Wait, `sheetVariants` for `bottom` is `inset-x-0 bottom-0`. It usually spans full width.
                    For a "receipt printing up", maybe we want it floating right?
                    User said "horizontal upward animation" which is confusing. Maybe "vertical upward"?
                    "sheet get move s upward" -> Standard bottom sheet behavior, but maybe width confined?
                    I'll make it a side sheet but positioned at bottom right, simulating a printer outputting up? 
                    Or just a standard bottom sheet but narrow?
                    The user said "bootm of the screen to top".
                    Let's use `side="bottom"` but constrain width so it looks like a receipt popping up, not a full drawer.
                 */}
                <div className="flex flex-col items-end justify-end p-4 pointer-events-auto h-[85vh]">
                    {/* Receipt Container */}
                    <div className="w-[350px] bg-white shadow-2xl relative font-mono text-sm text-gray-800 jagged-bottom animate-in slide-in-from-bottom duration-500 overflow-hidden flex flex-col max-h-full">
                         {/* Close Button styled for receipt - Absolute to container, will stay on top of ScrollArea? No, should be inside or separate overlay?
                             If we put it here, it overlays the ScrollArea. */}
                        <div className="absolute top-2 right-2 z-50">
                            {/* We rely on Sheet's default close, but we can add our own or just let the default one sit on top. 
                                Shadcn SheetContent usually includes a Close button. We can hide it via CSS if we want custom, 
                                but standard is fine. Let's ensure contrast. */}
                            <button 
                                onClick={() => setIsOpen(false)}
                                className="bg-gray-200 hover:bg-red-100 hover:text-red-500 rounded-full p-1 transition-colors"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                        
                        {/* Top Jagged Edge Decoration (Optional, using CSS gradient) - Absolute or part of flow?
                            Since we want header to scroll, this should be part of scroll flow.
                            But if we want a nice "paper coming out" effect, top might look better fixed?
                            User said "scroll then show paynow bottom". This implies vertical flow.
                            Let's make everything scrollable.
                         */}
                        
                        <div className="flex flex-col h-full overflow-hidden">
                            <ScrollArea className="flex-1 w-full bg-white rounded-t-sm">
                                <div className="flex flex-col">
                                    <div className="h-4 w-full bg-white relative z-10" 
                                        style={{
                                            backgroundImage: `linear-gradient(45deg, transparent 75%, #e5e7eb 75%), linear-gradient(-45deg, transparent 75%, #e5e7eb 75%)`,
                                            backgroundPosition: '0 0',
                                            backgroundSize: '20px 20px',
                                            opacity: 0.1
                                        }} 
                                    />

                                    <SheetHeader className="px-8 pt-6 pb-4 text-center border-b-2 border-dashed border-gray-300 space-y-2 bg-white">
                                        <SheetTitle className="font-mono text-3xl font-bold uppercase tracking-widest text-black">RECEIPT</SheetTitle>
                                        <div className="flex flex-col items-center space-y-1 text-xs text-gray-500 mt-2">
                                            <span className="font-bold text-lg text-gray-800">Hangary SweetRY</span>
                                            <span>123 Baker Street, Sweet City</span>
                                            <span>Tel: +1 (555) 123-4567</span>
                                        </div>
                                        <div className="w-full flex justify-between text-xs mt-6 pt-2 border-t border-dashed border-gray-200">
                                            <div className="flex flex-col items-start">
                                                <span>DATE: {dateStr}</span>
                                                <span>ORDER #: {receiptId}</span>
                                            </div>
                                            <div className="flex flex-col items-end">
                                                <span>TIME: {timeStr}</span>
                                                <span>AUTH: ADMIN</span>
                                            </div>
                                        </div>
                                    </SheetHeader>
                                    
                                    {/* Cart Items Table & Footer Combined without inner ScrollArea */}
                                    <div className="flex-1 bg-[url('/paper-texture.png')] bg-repeat">
                                        <div className="w-full">
                                            <div className="px-6 py-4 min-h-[200px]">
                                                {cartItems.length === 0 ? (
                                                    <div className="h-full flex flex-col items-center justify-center text-center p-8 text-gray-400 space-y-4">
                                                        <div className="w-16 h-16 border-2 border-dashed border-gray-300 rounded-full flex items-center justify-center">
                                                            <ShoppingBag className="w-8 h-8 opacity-50" />
                                                        </div>
                                                        <p className="font-mono uppercase tracking-widest text-sm">Your receipt is blank</p>
                                                    </div>
                                                ) : (
                                                    <table className="w-full text-sm">
                                                        <thead>
                                                            <tr className="border-b-2 border-dashed border-gray-800 text-xs text-gray-500">
                                                                <th className="text-left pb-2 w-10 pl-4">QTY</th>
                                                                <th className="text-left pb-2">ITEM</th>
                                                                <th className="text-right pb-2 pr-4">PRICE</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody className="divide-y divide-dashed divide-gray-200">
                                                            {cartItems.map((item) => (
                                                                <tr key={item.id} className="group">
                                                                    <td className="py-4 align-top font-bold pl-4">
                                                                        <div className="flex flex-col items-center gap-1">
                                                                            <span>{item.quantity}</span>
                                                                            {/* Tiny controls */}
                                                                            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                                                <button 
                                                                                    onClick={() => dispatch(updateQuantity({ id: item.id, quantity: item.quantity - 1 }))}
                                                                                    disabled={item.quantity <= 1}
                                                                                    className="text-xs hover:bg-gray-200 w-4 h-4 rounded flex items-center justify-center"
                                                                                >-</button>
                                                                                <button 
                                                                                    onClick={() => dispatch(updateQuantity({ id: item.id, quantity: item.quantity + 1 }))}
                                                                                    className="text-xs hover:bg-gray-200 w-4 h-4 rounded flex items-center justify-center"
                                                                                >+</button>
                                                                            </div>
                                                                        </div>
                                                                    </td>
                                                                    <td className="py-4 align-top px-2">
                                                                        <div className="uppercase font-bold tracking-tight">{item.name}</div>
                                                                        <div className="text-xs text-gray-500 truncate max-w-[150px]">{item.category}</div>
                                                                    </td>
                                                                    <td className="py-4 text-right align-top pr-4">
                                                                        <div className="font-bold">${(item.price * item.quantity).toFixed(2)}</div>
                                                                        <div className="text-xs text-gray-400">@ ${item.price.toFixed(2)}</div>
                                                                        <button 
                                                                            onClick={() => dispatch(removeFromCart(item.id))}
                                                                            className="text-[10px] text-red-400 hover:text-red-600 underline mt-1 block w-full text-right"
                                                                        >
                                                                            VOID
                                                                        </button>
                                                                    </td>
                                                                </tr>
                                                            ))}
                                                        </tbody>
                                                    </table>
                                                )}
                                            </div>

                                            {/* Receipt Footer - In flow */}
                                            {cartItems.length > 0 && (
                                                <div className="px-8 pb-8 pt-4 border-t-2 border-dashed border-gray-800 space-y-4">
                                                    <div className="space-y-2 text-sm">
                                                        <div className="flex justify-between">
                                                            <span>SUBTOTAL</span>
                                                            <span>${total.toFixed(2)}</span>
                                                        </div>
                                                        <div className="flex justify-between">
                                                            <span>TAX (0%)</span>
                                                            <span>$0.00</span>
                                                        </div>
                                                        <div className="border-b-2 border-dashed border-gray-300 my-2" />
                                                        <div className="flex justify-between text-xl font-bold tracking-widest">
                                                            <span>TOTAL</span>
                                                            <span>${total.toFixed(2)}</span>
                                                        </div>
                                                    </div>
                                                    
                                                    <div className="text-center space-y-3 pt-4">
                                                        <div className="border-t border-b border-double border-gray-300 py-2">
                                                            <p className="text-xs font-bold uppercase">Wait Number: {Math.floor(Math.random() * 50) + 1}</p>
                                                        </div>
                                                        <p className="text-[10px] text-gray-400 font-mono">
                                                            THANK YOU FOR YOUR BUSINESS!<br/>
                                                            PLEASE COME AGAIN
                                                        </p>
                                                        <div className="flex justify-center">
                                                            <div className="h-8 w-48 bg-[url('https://upload.wikimedia.org/wikipedia/commons/thumb/0/0b/Code_3_of_9.svg/1200px-Code_3_of_9.svg.png')] bg-cover opacity-80 mix-blend-multiply grayscale"></div>
                                                        </div>
                                                    </div>

                                                    <Button className="w-full h-12 bg-black hover:bg-gray-800 text-white font-mono uppercase tracking-widest text-lg shadow-lg transform active:scale-95 transition-all">
                                                        Print & Pay
                                                    </Button>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Jagged Bottom Edge CSS - In flow */}
                                    <div className="h-4 w-full bg-white relative" 
                                        style={{
                                            maskImage: 'linear-gradient(45deg, transparent 50%, black 50%), linear-gradient(-45deg, transparent 50%, black 50%)',
                                            maskSize: '20px 20px',
                                            maskRepeat: 'repeat-x',
                                            maskPosition: 'bottom',
                                            WebkitMaskImage: 'linear-gradient(45deg, transparent 50%, black 50%), linear-gradient(-45deg, transparent 50%, black 50%)',
                                            WebkitMaskSize: '20px 20px',
                                            WebkitMaskRepeat: 'repeat-x',
                                            WebkitMaskPosition: 'bottom',
                                            background: 'white',
                                            height: '20px',
                                        }}
                                    >
                                        <div style={{
                                            width: '100%', 
                                            height: '100%', 
                                            background: 'radial-gradient(circle at 10px 0, transparent 10px, white 11px) repeat-x',
                                            backgroundSize: '20px 20px',
                                            transform: 'rotate(180deg)'
                                        }}></div>
                                    </div>
                                </div>
                            </ScrollArea>
                        </div>
                    </div>
                </div>
            </SheetContent>
        </Sheet>
    );
};

export default CartSheet;
