import ApplicationLogo from '@/Components/ApplicationLogo';
import BottomNav from '@/Components/BottomNav';
import {
    BookOpenIcon,
    CakeIcon,
    ChevronDownIcon,
    ChevronUpIcon,
    ComputerDesktopIcon,
    DevicePhoneMobileIcon,
    HeartIcon,
    HomeIcon,
    ShoppingBagIcon,
    ShoppingCartIcon,
    SparklesIcon,
    StarIcon,
    TagIcon,
    WrenchIcon,
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolidIcon } from '@heroicons/react/24/solid';
import { Link } from '@inertiajs/react';
import { useState } from 'react';

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
        name: 'Cotton Basic Tee',
        price: 24.99,
        rating: 4.5,
        image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=300&h=400&fit=crop',
        category: 'Clothing',
    },
    {
        id: 2,
        name: 'Denim Jacket',
        price: 89.99,
        rating: 4.3,
        image: 'https://images.unsplash.com/photo-1601333144130-8cbb312386b6?w=300&h=300&fit=crop',
        category: 'Clothing',
    },
    {
        id: 3,
        name: 'Slim Fit Jeans',
        price: 59.99,
        rating: 4.7,
        image: 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=300&h=400&fit=crop',
        category: 'Clothing',
    },

    // Shoes
    {
        id: 4,
        name: 'Running Sneakers',
        price: 129.99,
        rating: 4.6,
        image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=300&h=300&fit=crop',
        category: 'Shoes',
    },
    {
        id: 5,
        name: 'Casual Loafers',
        price: 79.99,
        rating: 4.2,
        image: 'https://images.unsplash.com/photo-1533867617858-e7b97e060509?w=300&h=400&fit=crop',
        category: 'Shoes',
    },
    {
        id: 6,
        name: 'Hiking Boots',
        price: 149.99,
        rating: 4.8,
        image: 'https://images.unsplash.com/photo-1520639888713-7851133b1ed0?w=300&h=300&fit=crop',
        category: 'Shoes',
    },

    // Consumer Electronics
    {
        id: 7,
        name: 'Wireless Earbuds',
        price: 159.99,
        rating: 4.7,
        image: 'https://images.unsplash.com/photo-1605464315542-bda3e2f4e605?w=300&h=400&fit=crop',
        category: 'Consumer Electronics',
    },
    {
        id: 8,
        name: 'Smart Watch',
        price: 199.99,
        rating: 4.5,
        image: 'https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=300&h=300&fit=crop',
        category: 'Consumer Electronics',
    },
    {
        id: 9,
        name: 'Bluetooth Speaker',
        price: 89.99,
        rating: 4.4,
        image: 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=300&h=400&fit=crop',
        category: 'Consumer Electronics',
    },

    // Books, Movies, Music & Games
    {
        id: 10,
        name: 'Bestseller Novel',
        price: 19.99,
        rating: 4.6,
        image: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=300&h=300&fit=crop',
        category: 'Books, Movies, Music & Games',
    },
    {
        id: 11,
        name: 'Video Game Console',
        price: 299.99,
        rating: 4.8,
        image: 'https://images.unsplash.com/photo-1486401899868-0e435ed85128?w=300&h=400&fit=crop',
        category: 'Books, Movies, Music & Games',
    },
    {
        id: 12,
        name: 'Classic Movie Collection',
        price: 49.99,
        rating: 4.3,
        image: 'https://images.unsplash.com/photo-1598899134739-24c46f58b8c0?w=300&h=300&fit=crop',
        category: 'Books, Movies, Music & Games',
    },

    // Food and Beverage
    {
        id: 13,
        name: 'Gourmet Coffee Beans',
        price: 29.99,
        rating: 4.7,
        image: 'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=300&h=400&fit=crop',
        category: 'Food and Beverage',
    },
    {
        id: 14,
        name: 'Organic Tea Set',
        price: 34.99,
        rating: 4.5,
        image: 'https://images.unsplash.com/photo-1597481499750-3e6b22637e12?w=300&h=300&fit=crop',
        category: 'Food and Beverage',
    },
    {
        id: 15,
        name: 'Chocolate Gift Box',
        price: 39.99,
        rating: 4.6,
        image: 'https://images.unsplash.com/photo-1549007994-cb92caebd54b?w=300&h=400&fit=crop',
        category: 'Food and Beverage',
    },

    // Electronics & Gadgets
    {
        id: 16,
        name: '4K Webcam',
        price: 129.99,
        rating: 4.4,
        image: 'https://images.unsplash.com/photo-1623949556303-b0d17d198863?w=300&h=400&fit=crop',
        category: 'Electronics & Gadgets',
    },
    {
        id: 17,
        name: 'Mechanical Keyboard',
        price: 149.99,
        rating: 4.7,
        image: 'https://images.unsplash.com/photo-1595225476474-87563907a212?w=300&h=300&fit=crop',
        category: 'Electronics & Gadgets',
    },
    {
        id: 18,
        name: 'Gaming Mouse',
        price: 79.99,
        rating: 4.6,
        image: 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=300&h=400&fit=crop',
        category: 'Electronics & Gadgets',
    },

    // Furniture and Decor
    {
        id: 19,
        name: 'Modern Table Lamp',
        price: 69.99,
        rating: 4.3,
        image: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=300&h=300&fit=crop',
        category: 'Furniture and Decor',
    },
    {
        id: 20,
        name: 'Decorative Pillows',
        price: 29.99,
        rating: 4.4,
        image: 'https://images.unsplash.com/photo-1567225557594-88d73e55f2cb?w=300&h=300&fit=crop',
        category: 'Furniture and Decor',
    },
    {
        id: 21,
        name: 'Wall Art Print',
        price: 49.99,
        rating: 4.5,
        image: 'https://images.unsplash.com/photo-1582045253062-f63cfbd45bcb?w=300&h=400&fit=crop',
        category: 'Furniture and Decor',
    },

    // Health & Beauty
    {
        id: 22,
        name: 'Skincare Set',
        price: 89.99,
        rating: 4.6,
        image: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=300&h=300&fit=crop',
        category: 'Health & Beauty',
    },
    {
        id: 23,
        name: 'Hair Care Bundle',
        price: 69.99,
        rating: 4.4,
        image: 'https://images.unsplash.com/photo-1526947425960-945c6e72858f?w=300&h=400&fit=crop',
        category: 'Health & Beauty',
    },
    {
        id: 24,
        name: 'Makeup Collection',
        price: 129.99,
        rating: 4.7,
        image: 'https://images.unsplash.com/photo-1512496015851-a90fb38ba796?w=300&h=300&fit=crop',
        category: 'Health & Beauty',
    },

    // Auto and Parts
    {
        id: 25,
        name: 'Car Phone Mount',
        price: 24.99,
        rating: 4.3,
        image: 'https://images.unsplash.com/photo-1617788138017-80ad40651399?w=300&h=400&fit=crop',
        category: 'Auto and Parts',
    },
    {
        id: 26,
        name: 'LED Car Lights',
        price: 39.99,
        rating: 4.5,
        image: 'https://images.unsplash.com/photo-1511919884226-fd3cad34687c?w=300&h=300&fit=crop',
        category: 'Auto and Parts',
    },
    {
        id: 27,
        name: 'Car Vacuum Cleaner',
        price: 59.99,
        rating: 4.4,
        image: 'https://images.unsplash.com/photo-1558317374-067fb5f30001?w=300&h=400&fit=crop',
        category: 'Auto and Parts',
    },
];

export default function Shop({ auth }: Props) {
    const [showCategories, setShowCategories] = useState(false);
    const [wishlist, setWishlist] = useState<number[]>([]);
    const [cart, setCart] = useState<number[]>([]);

    const toggleWishlist = (productId: number) => {
        setWishlist((prev) =>
            prev.includes(productId)
                ? prev.filter((id) => id !== productId)
                : [...prev, productId],
        );
    };

    const addToCart = (productId: number) => {
        setCart((prev) => [...prev, productId]);
        // You might want to show a notification here
    };

    const renderRatingStars = (rating: number) => {
        return [...Array(5)].map((_, index) => (
            <StarIcon
                key={index}
                className={`h-4 w-4 ${
                    index < Math.floor(rating)
                        ? 'fill-yellow-400 text-yellow-400'
                        : 'text-gray-300'
                }`}
            />
        ));
    };

    return (
        <div className="relative min-h-screen pb-16">
            <div className="fixed left-0 right-0 top-0 z-10 bg-gradient-to-r from-black to-gray-900">
                <div className="container mx-auto px-4 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center">
                            <ApplicationLogo className="h-10 w-auto fill-current text-white" />
                            <span className="ml-2 text-xl font-bold text-white">
                                Sakto Shop
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-4 pt-[100px] md:pt-[80px]">
                <div>
                    <div className="mb-6 flex items-center justify-between">
                        <button
                            onClick={() => setShowCategories(!showCategories)}
                            className="flex items-center gap-1 text-gray-600 transition-colors duration-200 hover:text-gray-800"
                        >
                            {showCategories ? (
                                <>
                                    Categories
                                    <ChevronUpIcon className="h-5 w-5" />
                                </>
                            ) : (
                                <>
                                    Categories
                                    <ChevronDownIcon className="h-5 w-5" />
                                </>
                            )}
                        </button>
                    </div>
                    <div
                        className={`grid grid-cols-2 gap-4 transition-all duration-300 md:grid-cols-3 lg:grid-cols-4 ${
                            showCategories
                                ? 'max-h-[2000px] opacity-100'
                                : 'max-h-0 overflow-hidden opacity-0'
                        }`}
                    >
                        {categories.map((category) => (
                            <Link
                                key={category.name}
                                href={`/shop/${category.name.toLowerCase().replace(/\s+/g, '-')}`}
                                className="flex flex-col items-center rounded-lg bg-white p-4 transition-all duration-200 hover:scale-105"
                            >
                                <category.icon className="mb-2 h-8 w-8 text-gray-600" />
                                <span className="text-center text-sm font-medium text-gray-800">
                                    {category.name}
                                </span>
                            </Link>
                        ))}
                    </div>
                </div>
            </div>

            <div className="container mx-auto mb-8 mt-8 px-4">
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-5">
                    {dummyProducts.map((product) => (
                        <div
                            key={product.id}
                            className="h-fit rounded-lg bg-white p-2 shadow-sm"
                        >
                            <div className="group relative">
                                <img
                                    src={product.image}
                                    alt={product.name}
                                    className="h-fit w-full rounded-md object-cover"
                                />
                                <button
                                    onClick={() => toggleWishlist(product.id)}
                                    className="absolute right-2 top-2 transform rounded-full bg-white p-2 opacity-90 shadow-md transition-all duration-200 hover:scale-110 group-hover:opacity-100"
                                >
                                    {wishlist.includes(product.id) ? (
                                        <HeartSolidIcon className="h-4 w-4 transform text-red-500 transition-transform duration-200 hover:scale-110 sm:h-5 sm:w-5" />
                                    ) : (
                                        <HeartIcon className="h-4 w-4 text-gray-400 transition-colors duration-200 hover:text-gray-600 sm:h-5 sm:w-5" />
                                    )}
                                </button>
                                {wishlist.includes(product.id) && (
                                    <div className="absolute left-2 top-2 rounded-full bg-red-500 px-2 py-1 text-xs text-white opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                                        Wishlisted
                                    </div>
                                )}
                            </div>
                            <h3 className="mt-1 truncate text-xs font-medium text-gray-900 sm:text-sm">
                                {product.name}
                            </h3>
                            <div className="mt-0.5 flex items-center">
                                <StarIcon className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                                <span className="ml-1 text-xs text-gray-500">
                                    {product.rating}
                                </span>
                            </div>
                            <div className="mt-1 flex items-center justify-between">
                                <span className="text-sm font-bold text-gray-900">
                                    ${product.price}
                                </span>
                                <button
                                    onClick={() => addToCart(product.id)}
                                    className="flex items-center gap-1 rounded-lg bg-black p-1.5 text-white transition-colors duration-200 hover:bg-gray-800"
                                >
                                    <ShoppingCartIcon className="h-4 w-4" />
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
