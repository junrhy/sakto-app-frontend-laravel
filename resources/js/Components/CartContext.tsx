import React, { createContext, useContext, useReducer, useEffect } from 'react';

interface CartItem {
    id: number;
    name: string;
    price: number;
    quantity: number;
    thumbnail_url?: string;
    type: 'physical' | 'digital' | 'service' | 'subscription';
    stock_quantity?: number;
}

interface CartState {
    items: CartItem[];
    isOpen: boolean;
}

type CartAction =
    | { type: 'ADD_ITEM'; payload: CartItem }
    | { type: 'REMOVE_ITEM'; payload: number }
    | { type: 'UPDATE_QUANTITY'; payload: { id: number; quantity: number } }
    | { type: 'CLEAR_CART' }
    | { type: 'TOGGLE_CART' }
    | { type: 'CLOSE_CART' }
    | { type: 'LOAD_CART'; payload: CartItem[] };

const cartReducer = (state: CartState, action: CartAction): CartState => {
    switch (action.type) {
        case 'ADD_ITEM': {
            const existingItem = state.items.find(item => item.id === action.payload.id);
            
            if (existingItem) {
                // Check stock availability for physical products
                if (action.payload.type === 'physical' && action.payload.stock_quantity !== undefined) {
                    const newQuantity = existingItem.quantity + action.payload.quantity;
                    if (newQuantity > action.payload.stock_quantity) {
                        return state; // Don't add if exceeds stock
                    }
                }
                
                return {
                    ...state,
                    items: state.items.map(item =>
                        item.id === action.payload.id
                            ? { ...item, quantity: item.quantity + action.payload.quantity }
                            : item
                    )
                };
            } else {
                return {
                    ...state,
                    items: [...state.items, action.payload]
                };
            }
        }
        
        case 'REMOVE_ITEM':
            return {
                ...state,
                items: state.items.filter(item => item.id !== action.payload)
            };
        
        case 'UPDATE_QUANTITY': {
            const item = state.items.find(item => item.id === action.payload.id);
            if (!item) return state;
            
            // Check stock availability for physical products
            if (item.type === 'physical' && item.stock_quantity !== undefined) {
                if (action.payload.quantity > item.stock_quantity) {
                    return state; // Don't update if exceeds stock
                }
            }
            
            if (action.payload.quantity <= 0) {
                return {
                    ...state,
                    items: state.items.filter(item => item.id !== action.payload.id)
                };
            }
            
            return {
                ...state,
                items: state.items.map(item =>
                    item.id === action.payload.id
                        ? { ...item, quantity: action.payload.quantity }
                        : item
                )
            };
        }
        
        case 'CLEAR_CART':
            return {
                ...state,
                items: []
            };
        
        case 'TOGGLE_CART':
            return {
                ...state,
                isOpen: !state.isOpen
            };
        
        case 'CLOSE_CART':
            return {
                ...state,
                isOpen: false
            };
        
        case 'LOAD_CART':
            return {
                ...state,
                items: action.payload
            };
        
        default:
            return state;
    }
};

interface CartContextType {
    state: CartState;
    addItem: (item: Omit<CartItem, 'quantity'>) => void;
    removeItem: (id: number) => void;
    updateQuantity: (id: number, quantity: number) => void;
    clearCart: () => void;
    toggleCart: () => void;
    closeCart: () => void;
    getItemCount: () => number;
    getTotalPrice: () => number;
    getItemQuantity: (id: number) => number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const useCart = () => {
    const context = useContext(CartContext);
    if (context === undefined) {
        throw new Error('useCart must be used within a CartProvider');
    }
    return context;
};

interface CartProviderProps {
    children: React.ReactNode;
}

export const CartProvider: React.FC<CartProviderProps> = ({ children }) => {
    const [state, dispatch] = useReducer(cartReducer, {
        items: [],
        isOpen: false
    });

    // Load cart from localStorage on mount
    useEffect(() => {
        const savedCart = localStorage.getItem('cart');
        if (savedCart) {
            try {
                const cartItems = JSON.parse(savedCart);
                dispatch({ type: 'LOAD_CART', payload: cartItems });
            } catch (error) {
                console.error('Failed to load cart from localStorage:', error);
            }
        }
    }, []);

    // Save cart to localStorage whenever it changes
    useEffect(() => {
        localStorage.setItem('cart', JSON.stringify(state.items));
    }, [state.items]);

    const addItem = (item: Omit<CartItem, 'quantity'>) => {
        dispatch({ type: 'ADD_ITEM', payload: { ...item, quantity: 1 } });
    };

    const removeItem = (id: number) => {
        dispatch({ type: 'REMOVE_ITEM', payload: id });
    };

    const updateQuantity = (id: number, quantity: number) => {
        dispatch({ type: 'UPDATE_QUANTITY', payload: { id, quantity } });
    };

    const clearCart = () => {
        dispatch({ type: 'CLEAR_CART' });
    };

    const toggleCart = () => {
        dispatch({ type: 'TOGGLE_CART' });
    };

    const closeCart = () => {
        dispatch({ type: 'CLOSE_CART' });
    };

    const getItemCount = () => {
        return state.items.reduce((total, item) => total + item.quantity, 0);
    };

    const getTotalPrice = () => {
        return state.items.reduce((total, item) => total + (item.price * item.quantity), 0);
    };

    const getItemQuantity = (id: number) => {
        const item = state.items.find(item => item.id === id);
        return item ? item.quantity : 0;
    };

    const value: CartContextType = {
        state,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        toggleCart,
        closeCart,
        getItemCount,
        getTotalPrice,
        getItemQuantity
    };

    return (
        <CartContext.Provider value={value}>
            {children}
        </CartContext.Provider>
    );
}; 