import React, { createContext, useContext, useReducer, ReactNode } from 'react';
import { toast } from 'sonner';

interface CartItem {
    productId: number;
    variantId: number;
    id: number;
    name: string;
    quantity: number;
    price: number;
    type?: 'physical' | 'digital' | 'service' | 'subscription';
    attributes?: Record<string, string>;
    thumbnail_url?: string;
}

interface CartState {
    items: CartItem[];
    total: number;
    itemCount: number;
}

type CartAction =
    | { type: 'ADD_ITEM'; payload: CartItem }
    | { type: 'UPDATE_QUANTITY'; payload: { productId: number; variantId: number; quantity: number } }
    | { type: 'REMOVE_ITEM'; payload: { productId: number; variantId: number } }
    | { type: 'CLEAR_CART' }
    | { type: 'LOAD_CART'; payload: CartItem[] };

const CartContext = createContext<{
    state: CartState;
    addItem: (item: CartItem) => void;
    updateQuantity: (productId: number, variantId: number, quantity: number) => void;
    removeItem: (productId: number, variantId: number) => void;
    clearCart: () => void;
    getItemQuantity: (productId: number, variantId: number) => number;
    getTotalPrice: () => number;
} | undefined>(undefined);

const cartReducer = (state: CartState, action: CartAction): CartState => {
    switch (action.type) {
        case 'ADD_ITEM': {
            const existingItemIndex = state.items.findIndex(
                item => item.productId === action.payload.productId && item.variantId === action.payload.variantId
            );

            if (existingItemIndex >= 0) {
                // Update existing item quantity
                const updatedItems = [...state.items];
                updatedItems[existingItemIndex].quantity += action.payload.quantity;
                
                const newTotal = updatedItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
                const newItemCount = updatedItems.reduce((sum, item) => sum + item.quantity, 0);
                
                return {
                    items: updatedItems,
                    total: newTotal,
                    itemCount: newItemCount
                };
            } else {
                // Add new item
                const newItems = [...state.items, action.payload];
                const newTotal = newItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
                const newItemCount = newItems.reduce((sum, item) => sum + item.quantity, 0);
                
                return {
                    items: newItems,
                    total: newTotal,
                    itemCount: newItemCount
                };
            }
        }

        case 'UPDATE_QUANTITY': {
            const updatedItems = state.items.map(item => {
                if (item.productId === action.payload.productId && item.variantId === action.payload.variantId) {
                    return { ...item, quantity: action.payload.quantity };
                }
                return item;
            }).filter(item => item.quantity > 0); // Remove items with 0 quantity

            const newTotal = updatedItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
            const newItemCount = updatedItems.reduce((sum, item) => sum + item.quantity, 0);

            return {
                items: updatedItems,
                total: newTotal,
                itemCount: newItemCount
            };
        }

        case 'REMOVE_ITEM': {
            const updatedItems = state.items.filter(
                item => !(item.productId === action.payload.productId && item.variantId === action.payload.variantId)
            );

            const newTotal = updatedItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
            const newItemCount = updatedItems.reduce((sum, item) => sum + item.quantity, 0);

            return {
                items: updatedItems,
                total: newTotal,
                itemCount: newItemCount
            };
        }

        case 'CLEAR_CART':
            return {
                items: [],
                total: 0,
                itemCount: 0
            };

        case 'LOAD_CART': {
            const newTotal = action.payload.reduce((sum, item) => sum + (item.price * item.quantity), 0);
            const newItemCount = action.payload.reduce((sum, item) => sum + item.quantity, 0);

            return {
                items: action.payload,
                total: newTotal,
                itemCount: newItemCount
            };
        }

        default:
            return state;
    }
};

export const CartProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [state, dispatch] = useReducer(cartReducer, {
        items: [],
        total: 0,
        itemCount: 0
    });

    const addItem = (item: CartItem) => {
        // Create a unique id for the cart item (productId + variantId combination)
        const uniqueId = item.variantId > 0 ? item.productId * 1000 + item.variantId : item.productId;
        const itemWithId = {
            ...item,
            id: uniqueId
        };
        dispatch({ type: 'ADD_ITEM', payload: itemWithId });
        toast.success(`${item.name} added to cart!`);
    };

    const updateQuantity = (productId: number, variantId: number, quantity: number) => {
        dispatch({ type: 'UPDATE_QUANTITY', payload: { productId, variantId, quantity } });
    };

    const removeItem = (productId: number, variantId: number) => {
        dispatch({ type: 'REMOVE_ITEM', payload: { productId, variantId } });
        toast.success('Item removed from cart');
    };

    const clearCart = () => {
        dispatch({ type: 'CLEAR_CART' });
        toast.success('Cart cleared');
    };

    const getItemQuantity = (productId: number, variantId: number): number => {
        const item = state.items.find(
            item => item.productId === productId && item.variantId === variantId
        );
        return item ? item.quantity : 0;
    };

    const getTotalPrice = () => {
        return state.total;
    };

    return (
        <CartContext.Provider value={{
            state,
            addItem,
            updateQuantity,
            removeItem,
            clearCart,
            getItemQuantity,
            getTotalPrice
        }}>
            {children}
        </CartContext.Provider>
    );
};

export const useCart = () => {
    const context = useContext(CartContext);
    if (context === undefined) {
        throw new Error('useCart must be used within a CartProvider');
    }
    return context;
}; 