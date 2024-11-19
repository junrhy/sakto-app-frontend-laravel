import React, { useState } from 'react';
import { Link } from '@inertiajs/react';
import BottomNav from '@/Components/BottomNav';
import ApplicationLogo from '@/Components/ApplicationLogo';
import { 
    TagIcon,
    ShoppingBagIcon,
    DevicePhoneMobileIcon,
    BookOpenIcon,
    CakeIcon,
    ComputerDesktopIcon,
    TruckIcon,
    HomeIcon,
    SparklesIcon,
    WrenchIcon,
    ChevronUpIcon,
    ChevronDownIcon,
    HeartIcon,
    StarIcon,
    ShoppingCartIcon
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolidIcon, StarIcon as StarSolidIcon } from '@heroicons/react/24/solid';

interface Props {
    auth: {
        user: {
            name: string;
        };
    };
}

const categories = [
    { name: 'Clothing', icon: TagIcon },
    { name: 'Shoes', icon: ShoppingBagIcon },
    { name: 'Consumer Electronics', icon: DevicePhoneMobileIcon },
    { name: 'Books, Movies, Music & Games', icon: BookOpenIcon },
    { name: 'Food and Beverage', icon: CakeIcon },
    { name: 'Electronics & Gadgets', icon: ComputerDesktopIcon },
    { name: 'Apparel and Accessories', icon: ShoppingBagIcon },
    { name: 'Furniture and Decor', icon: HomeIcon },
    { name: 'Health & Beauty', icon: SparklesIcon },
    { name: 'Auto and Parts', icon: WrenchIcon },
];

interface Product {
    id: number;
    name: string;
    price: number;
    rating: number;
    image: string;
    category: string;
}

const dummyProducts: Product[] = [
    // Clothing
    {
        id: 1,
        name: "Cotton Basic Tee",
        price: 24.99,
        rating: 4.5,
        image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=300&h=400&fit=crop",
        category: "Clothing"
    },
    {
        id: 2,
        name: "Denim Jacket",
        price: 89.99,
        rating: 4.3,
        image: "https://images.unsplash.com/photo-1601333144130-8cbb312386b6?w=300&h=300&fit=crop",
        category: "Clothing"
    },
    {
        id: 3,
        name: "Slim Fit Jeans",
        price: 59.99,
        rating: 4.7,
        image: "https://images.unsplash.com/photo-1542272604-787c3835535d?w=300&h=400&fit=crop",
        category: "Clothing"
    },

    // Shoes
    {
        id: 4,
        name: "Running Sneakers",
        price: 129.99,
        rating: 4.6,
        image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=300&h=300&fit=crop",
        category: "Shoes"
    },
    {
        id: 5,
        name: "Casual Loafers",
        price: 79.99,
        rating: 4.2,
        image: "https://images.unsplash.com/photo-1533867617858-e7b97e060509?w=300&h=400&fit=crop",
        category: "Shoes"
    },
    {
        id: 6,
        name: "Hiking Boots",
        price: 149.99,
        rating: 4.8,
        image: "https://images.unsplash.com/photo-1520639888713-7851133b1ed0?w=300&h=300&fit=crop",
        category: "Shoes"
    },

    // Consumer Electronics
    {
        id: 7,
        name: "Wireless Earbuds",
        price: 159.99,
        rating: 4.7,
        image: "https://images.unsplash.com/photo-1605464315542-bda3e2f4e605?w=300&h=400&fit=crop",
        category: "Consumer Electronics"
    },
    {
        id: 8,
        name: "Smart Watch",
        price: 199.99,
        rating: 4.5,
        image: "https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=300&h=300&fit=crop",
        category: "Consumer Electronics"
    },
    {
        id: 9,
        name: "Bluetooth Speaker",
        price: 89.99,
        rating: 4.4,
        image: "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=300&h=400&fit=crop",
        category: "Consumer Electronics"
    },

    // Books, Movies, Music & Games
    {
        id: 10,
        name: "Bestseller Novel",
        price: 19.99,
        rating: 4.6,
        image: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=300&h=300&fit=crop",
        category: "Books, Movies, Music & Games"
    },
    {
        id: 11,
        name: "Video Game Console",
        price: 299.99,
        rating: 4.8,
        image: "https://images.unsplash.com/photo-1486401899868-0e435ed85128?w=300&h=400&fit=crop",
        category: "Books, Movies, Music & Games"
    },
    {
        id: 12,
        name: "Classic Movie Collection",
        price: 49.99,
        rating: 4.3,
        image: "https://images.unsplash.com/photo-1598899134739-24c46f58b8c0?w=300&h=300&fit=crop",
        category: "Books, Movies, Music & Games"
    },

    // Food and Beverage
    {
        id: 13,
        name: "Gourmet Coffee Beans",
        price: 29.99,
        rating: 4.7,
        image: "https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=300&h=400&fit=crop",
        category: "Food and Beverage"
    },
    {
        id: 14,
        name: "Organic Tea Set",
        price: 34.99,
        rating: 4.5,
        image: "https://images.unsplash.com/photo-1597481499750-3e6b22637e12?w=300&h=300&fit=crop",
        category: "Food and Beverage"
    },
    {
        id: 15,
        name: "Chocolate Gift Box",
        price: 39.99,
        rating: 4.6,
        image: "https://images.unsplash.com/photo-1549007994-cb92caebd54b?w=300&h=400&fit=crop",
        category: "Food and Beverage"
    },

    // Electronics & Gadgets
    {
        id: 16,
        name: "4K Webcam",
        price: 129.99,
        rating: 4.4,
        image: "https://images.unsplash.com/photo-1623949556303-b0d17d198863?w=300&h=400&fit=crop",
        category: "Electronics & Gadgets"
    },
    {
        id: 17,
        name: "Mechanical Keyboard",
        price: 149.99,
        rating: 4.7,
        image: "https://images.unsplash.com/photo-1595225476474-87563907a212?w=300&h=300&fit=crop",
        category: "Electronics & Gadgets"
    },
    {
        id: 18,
        name: "Gaming Mouse",
        price: 79.99,
        rating: 4.6,
        image: "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=300&h=400&fit=crop",
        category: "Electronics & Gadgets"
    },

    // Furniture and Decor
    {
        id: 19,
        name: "Modern Table Lamp",
        price: 69.99,
        rating: 4.3,
        image: "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=300&h=300&fit=crop",
        category: "Furniture and Decor"
    },
    {
        id: 20,
        name: "Decorative Pillows",
        price: 29.99,
        rating: 4.4,
        image: "https://images.unsplash.com/photo-1567225557594-88d73e55f2cb?w=300&h=300&fit=crop",
        category: "Furniture and Decor"
    },
    {
        id: 21,
        name: "Wall Art Print",
        price: 49.99,
        rating: 4.5,
        image: "https://images.unsplash.com/photo-1582045253062-f63cfbd45bcb?w=300&h=400&fit=crop",
        category: "Furniture and Decor"
    },

    // Health & Beauty
    {
        id: 22,
        name: "Skincare Set",
        price: 89.99,
        rating: 4.6,
        image: "https://images.unsplash.com/photo-1556228720-195a672e8a03?w=300&h=300&fit=crop",
        category: "Health & Beauty"
    },
    {
        id: 23,
        name: "Hair Care Bundle",
        price: 69.99,
        rating: 4.4,
        image: "https://images.unsplash.com/photo-1526947425960-945c6e72858f?w=300&h=400&fit=crop",
        category: "Health & Beauty"
    },
    {
        id: 24,
        name: "Makeup Collection",
        price: 129.99,
        rating: 4.7,
        image: "https://images.unsplash.com/photo-1512496015851-a90fb38ba796?w=300&h=300&fit=crop",
        category: "Health & Beauty"
    },

    // Auto and Parts
    {
        id: 25,
        name: "Car Phone Mount",
        price: 24.99,
        rating: 4.3,
        image: "https://images.unsplash.com/photo-1617788138017-80ad40651399?w=300&h=400&fit=crop",
        category: "Auto and Parts"
    },
    {
        id: 26,
        name: "LED Car Lights",
        price: 39.99,
        rating: 4.5,
        image: "https://images.unsplash.com/photo-1511919884226-fd3cad34687c?w=300&h=300&fit=crop",
        category: "Auto and Parts"
    },
    {
        id: 27,
        name: "Car Vacuum Cleaner",
        price: 59.99,
        rating: 4.4,
        image: "https://images.unsplash.com/photo-1558317374-067fb5f30001?w=300&h=400&fit=crop",
        category: "Auto and Parts"
    }
];

export default function Shop({ auth }: Props) {
    const [showCategories, setShowCategories] = useState(false);
    const [wishlist, setWishlist] = useState<number[]>([]);
    const [cart, setCart] = useState<number[]>([]);

    const toggleWishlist = (productId: number) => {
        setWishlist(prev => 
            prev.includes(productId) 
                ? prev.filter(id => id !== productId)
                : [...prev, productId]
        );
    };

    const addToCart = (productId: number) => {
        setCart(prev => [...prev, productId]);
        // You might want to show a notification here
    };

    const renderRatingStars = (rating: number) => {
        return [...Array(5)].map((_, index) => (
            <StarIcon
                key={index}
                className={`w-4 h-4 ${
                    index < Math.floor(rating) 
                        ? 'text-yellow-400 fill-yellow-400' 
                        : 'text-gray-300'
                }`}
            />
        ));
    };

    return (
        <div className="relative min-h-screen pb-16">
            <div className="fixed top-0 left-0 right-0 bg-gradient-to-r from-black to-gray-900 z-10">
                <div className="container mx-auto px-4 py-4">
                    <div className="flex justify-between items-center">
                        <div className="flex items-center">
                            <ApplicationLogo className="h-10 w-auto fill-current text-white" />
                            <span className="ml-2 text-xl font-bold text-white">Sakto Shop</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-4 pt-[100px] md:pt-[80px]">
                <div>
                    <div className="flex items-center justify-between mb-6">
                        <button 
                            onClick={() => setShowCategories(!showCategories)}
                            className="flex items-center gap-1 text-gray-600 hover:text-gray-800 transition-colors duration-200"
                        >
                            {showCategories ? (
                                <>
                                    Categories
                                    <ChevronUpIcon className="w-5 h-5" />
                                </>
                            ) : (
                                <>
                                    Categories
                                    <ChevronDownIcon className="w-5 h-5" />
                                </>
                            )}
                        </button>
                    </div>
                    <div className={`grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 transition-all duration-300 ${
                        showCategories ? 'opacity-100 max-h-[2000px]' : 'opacity-0 max-h-0 overflow-hidden'
                    }`}>
                        {categories.map((category) => (
                            <Link
                                key={category.name}
                                href={`/shop/${category.name.toLowerCase().replace(/\s+/g, '-')}`}
                                className="flex flex-col items-center p-4 bg-white rounded-lg transition-all duration-200 hover:scale-105"
                            >
                                <category.icon className="w-8 h-8 text-gray-600 mb-2" />
                                <span className="text-sm text-center font-medium text-gray-800">
                                    {category.name}
                                </span>
                            </Link>
                        ))}
                    </div>
                </div>
            </div>
            
            <div className="container mx-auto mt-8 mb-8 px-4">
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
                    {dummyProducts.map((product) => (
                        <div key={product.id} className="bg-white rounded-lg shadow-sm p-2 h-fit">
                            <div className="relative group">
                                <img 
                                    src={product.image} 
                                    alt={product.name}
                                    className="w-full object-cover rounded-md h-fit"
                                />
                                <button
                                    onClick={() => toggleWishlist(product.id)}
                                    className="absolute top-2 right-2 p-2 bg-white rounded-full shadow-md 
                                             hover:scale-110 transform transition-all duration-200 
                                             group-hover:opacity-100 opacity-90"
                                >
                                    {wishlist.includes(product.id) ? (
                                        <HeartSolidIcon className="w-4 h-4 sm:w-5 sm:h-5 text-red-500 
                                                                  transform transition-transform duration-200 
                                                                  hover:scale-110" />
                                    ) : (
                                        <HeartIcon className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 
                                                            hover:text-gray-600 transition-colors duration-200" />
                                    )}
                                </button>
                                {wishlist.includes(product.id) && (
                                    <div className="absolute top-2 left-2 bg-red-500 text-white text-xs 
                                                  px-2 py-1 rounded-full opacity-0 group-hover:opacity-100 
                                                  transition-opacity duration-200">
                                        Wishlisted
                                    </div>
                                )}
                            </div>
                            <h3 className="mt-1 text-xs sm:text-sm font-medium text-gray-900 truncate">
                                {product.name}
                            </h3>
                            <div className="flex items-center mt-0.5">
                                <StarIcon className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                                <span className="ml-1 text-xs text-gray-500">
                                    {product.rating}
                                </span>
                            </div>
                            <div className="flex items-center justify-between mt-1">
                                <span className="text-sm font-bold text-gray-900">
                                    ${product.price}
                                </span>
                                <button
                                    onClick={() => addToCart(product.id)}
                                    className="p-1.5 text-white bg-black hover:bg-gray-800 rounded-lg transition-colors duration-200 flex items-center gap-1"
                                >
                                    <ShoppingCartIcon className="w-4 h-4" />
                                    <span className="text-xs">Add to Cart</span>
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
            
            <BottomNav />
        </div>
    );
} 