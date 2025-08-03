import React, { useState, useEffect } from 'react';
import { Link } from '@inertiajs/react';
import { Button } from '@/Components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import { Badge } from '@/Components/ui/badge';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import { Textarea } from '@/Components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/Components/ui/select';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  EyeOff, 
  Archive, 
  Package,
  DollarSign,
  Tag,
  Calendar,
  X,
  Save
} from 'lucide-react';

interface Product {
  id: number;
  name: string;
  description: string;
  price: number | string;
  category: string;
  type: 'physical' | 'digital' | 'service' | 'subscription';
  sku: string | null;
  stock_quantity: number | null;
  weight: number | null;
  dimensions: string | null;
  file_url: string | null;
  thumbnail_url: string | null;
  status: 'draft' | 'published' | 'archived' | 'inactive';
  tags: string[] | null;
  metadata: any;
  client_identifier: string;
  created_at: string;
  updated_at: string;
  images?: Array<{
    id: number;
    image_url: string;
    alt_text?: string;
    is_primary: boolean;
    sort_order: number;
  }>;
  active_variants?: Array<{
    id: number;
    sku?: string;
    price?: number;
    stock_quantity: number;
    weight?: number;
    dimensions?: string;
    thumbnail_url?: string;
    attributes: Record<string, string>;
    is_active: boolean;
  }>;
}

interface MyProductsProps {
  member: {
    id: number;
    identifier?: string;
  };
  appCurrency?: { code: string; symbol: string } | null;
  contactId?: number;
}

export default function MyProducts({ member, appCurrency, contactId }: MyProductsProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  
  // Form state for creating new product
  const [newProduct, setNewProduct] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
    type: 'physical' as 'physical' | 'digital' | 'service' | 'subscription',
    sku: '',
    stock_quantity: '',
    weight: '',
    dimensions: '',
    status: 'draft' as 'draft' | 'published' | 'archived' | 'inactive',
    tags: [] as string[],
  });

  // Format price with currency
  const formatPrice = (price: number | string | null | undefined): string => {
    if (price === null || price === undefined) {
      const symbol = appCurrency?.symbol || '$';
      return `${symbol}0.00`;
    }
    const numericPrice = typeof price === 'string' ? parseFloat(price) || 0 : price;
    const symbol = appCurrency?.symbol || '$';
    return `${symbol}${numericPrice.toFixed(2)}`;
  };

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'draft':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'archived':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
      case 'inactive':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  // Get type icon
  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'physical':
        return <Package className="w-4 h-4" />;
      case 'digital':
        return <Eye className="w-4 h-4" />;
      case 'service':
        return <Tag className="w-4 h-4" />;
      case 'subscription':
        return <Calendar className="w-4 h-4" />;
      default:
        return <Package className="w-4 h-4" />;
    }
  };

  // Get product image
  const getProductImage = (product: Product): string | null => {
    if (product.images && product.images.length > 0) {
      const sortedImages = [...product.images].sort((a, b) => a.sort_order - b.sort_order);
      const primaryImage = sortedImages.find(img => img.is_primary);
      if (primaryImage) {
        return primaryImage.image_url;
      }
      return sortedImages[0].image_url;
    }
    return product.thumbnail_url;
  };

  // Handle product deletion
  const handleDelete = async (productId: number) => {
    if (!confirm('Are you sure you want to delete this product? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await fetch(`/m/${member.identifier || member.id}/products/${productId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
        },
      });

      if (response.ok) {
        setProducts(prev => prev.filter(p => p.id !== productId));
      } else {
        setError('Failed to delete product');
      }
    } catch (err) {
      setError('An error occurred while deleting the product');
    }
  };

  // Handle form field changes
  const handleFormChange = (field: string, value: any) => {
    setNewProduct(prev => ({ ...prev, [field]: value }));
  };

  // Handle form submission
  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    setCreateError(null);

    try {
      const response = await fetch(`/m/${member.identifier || member.id}/products`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
        },
        body: JSON.stringify({
          ...newProduct,
          contact_id: contactId,
          price: parseFloat(newProduct.price) || 0,
          stock_quantity: newProduct.stock_quantity ? parseInt(newProduct.stock_quantity) : null,
          weight: newProduct.weight ? parseFloat(newProduct.weight) : null,
        }),
      });

      if (response.ok) {
        const createdProduct = await response.json();
        setProducts(prev => [createdProduct, ...prev]);
        setShowCreateForm(false);
        setNewProduct({
          name: '',
          description: '',
          price: '',
          category: '',
          type: 'physical',
          sku: '',
          stock_quantity: '',
          weight: '',
          dimensions: '',
          status: 'draft',
          tags: [],
        });
      } else {
        const errorData = await response.json();
        setCreateError(errorData.error || 'Failed to create product');
      }
    } catch (err) {
      setCreateError('An error occurred while creating the product');
    } finally {
      setCreating(false);
    }
  };

  // Handle status toggle
  const handleStatusToggle = async (productId: number, currentStatus: string) => {
    const newStatus = currentStatus === 'published' ? 'inactive' : 'published';
    
    try {
      const response = await fetch(`/m/${member.identifier || member.id}/products/${productId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        setProducts(prev => prev.map(p => 
          p.id === productId ? { ...p, status: newStatus as any } : p
        ));
      } else {
        setError('Failed to update product status');
      }
    } catch (err) {
      setError('An error occurred while updating the product status');
    }
  };

  // Fetch user's products
  useEffect(() => {
    const fetchProducts = async () => {
      if (!contactId) {
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(`/m/${member.identifier || member.id}/products?contact_id=${contactId}`);
        if (response.ok) {
          const data = await response.json();
          setProducts(data);
        } else {
          setError('Failed to fetch products');
        }
      } catch (err) {
        setError('An error occurred while fetching products');
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [contactId, member.identifier, member.id]);

  if (!contactId) {
    return (
      <div className="text-center text-gray-500 dark:text-gray-400 py-12">
        <svg className="w-12 h-12 mx-auto text-gray-300 dark:text-gray-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
        <p className="text-lg font-medium">Authentication Required</p>
        <p className="text-sm">Please log in to manage your products</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
        <p className="text-gray-500 dark:text-gray-400 mt-2">Loading your products...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-red-500 dark:text-red-400 py-12">
        <p className="text-lg font-medium">Error</p>
        <p className="text-sm">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">My Products</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Manage your products and track their performance
          </p>
        </div>
        <Button
          onClick={() => setShowCreateForm(!showCreateForm)}
          className="inline-flex items-center px-4 py-2 bg-indigo-600 dark:bg-indigo-500 text-white rounded-lg hover:bg-indigo-700 dark:hover:bg-indigo-600 transition-colors text-sm font-medium"
        >
          {showCreateForm ? <X className="w-4 h-4 mr-2" /> : <Plus className="w-4 h-4 mr-2" />}
          {showCreateForm ? 'Cancel' : 'Add Product'}
        </Button>
      </div>

      {/* Create Product Form */}
      {showCreateForm && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg">Create New Product</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreateProduct} className="space-y-4">
              {createError && (
                <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                  <p className="text-red-600 dark:text-red-400 text-sm">{createError}</p>
                </div>
              )}
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Product Name *</Label>
                  <Input
                    id="name"
                    value={newProduct.name}
                    onChange={(e) => handleFormChange('name', e.target.value)}
                    placeholder="Enter product name"
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="category">Category *</Label>
                  <Input
                    id="category"
                    value={newProduct.category}
                    onChange={(e) => handleFormChange('category', e.target.value)}
                    placeholder="Enter category"
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="price">Price *</Label>
                  <Input
                    id="price"
                    type="number"
                    step="0.01"
                    min="0"
                    value={newProduct.price}
                    onChange={(e) => handleFormChange('price', e.target.value)}
                    placeholder="0.00"
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="type">Product Type *</Label>
                  <Select value={newProduct.type} onValueChange={(value) => handleFormChange('type', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="physical">Physical</SelectItem>
                      <SelectItem value="digital">Digital</SelectItem>
                      <SelectItem value="service">Service</SelectItem>
                      <SelectItem value="subscription">Subscription</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="sku">SKU</Label>
                  <Input
                    id="sku"
                    value={newProduct.sku}
                    onChange={(e) => handleFormChange('sku', e.target.value)}
                    placeholder="Enter SKU"
                  />
                </div>
                
                <div>
                  <Label htmlFor="stock_quantity">Stock Quantity</Label>
                  <Input
                    id="stock_quantity"
                    type="number"
                    min="0"
                    value={newProduct.stock_quantity}
                    onChange={(e) => handleFormChange('stock_quantity', e.target.value)}
                    placeholder="Enter stock quantity"
                  />
                </div>
                
                <div>
                  <Label htmlFor="weight">Weight (kg)</Label>
                  <Input
                    id="weight"
                    type="number"
                    step="0.01"
                    min="0"
                    value={newProduct.weight}
                    onChange={(e) => handleFormChange('weight', e.target.value)}
                    placeholder="Enter weight"
                  />
                </div>
                
                <div>
                  <Label htmlFor="dimensions">Dimensions</Label>
                  <Input
                    id="dimensions"
                    value={newProduct.dimensions}
                    onChange={(e) => handleFormChange('dimensions', e.target.value)}
                    placeholder="e.g., 10x5x2 cm"
                  />
                </div>
                
                <div>
                  <Label htmlFor="status">Status *</Label>
                  <Select value={newProduct.status} onValueChange={(value) => handleFormChange('status', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="draft">Draft</SelectItem>
                      <SelectItem value="published">Published</SelectItem>
                      <SelectItem value="archived">Archived</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div>
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  value={newProduct.description}
                  onChange={(e) => handleFormChange('description', e.target.value)}
                  placeholder="Enter product description"
                  rows={4}
                  required
                />
              </div>
              
              <div className="flex justify-end space-x-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowCreateForm(false)}
                  disabled={creating}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={creating}
                  className="bg-indigo-600 dark:bg-indigo-500 hover:bg-indigo-700 dark:hover:bg-indigo-600"
                >
                  {creating ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Creating...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Create Product
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Products Grid */}
      {products.length === 0 ? (
        <div className="text-center text-gray-500 dark:text-gray-400 py-12">
          <svg className="w-12 h-12 mx-auto text-gray-300 dark:text-gray-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
          </svg>
          <p className="text-lg font-medium">No products yet</p>
          <p className="text-sm mb-4">Start by adding your first product to the marketplace</p>
          <Button
            onClick={() => setShowCreateForm(true)}
            className="inline-flex items-center px-4 py-2 bg-indigo-600 dark:bg-indigo-500 text-white rounded-lg hover:bg-indigo-700 dark:hover:bg-indigo-600 transition-colors text-sm font-medium"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create Your First Product
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((product) => (
            <Card key={product.id} className="overflow-hidden">
              {/* Product Image */}
              <div className="aspect-video bg-gray-100 dark:bg-gray-800 relative">
                {getProductImage(product) ? (
                  <img
                    src={getProductImage(product)!}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <Package className="w-12 h-12 text-gray-400" />
                  </div>
                )}
                <div className="absolute top-2 right-2">
                  <Badge className={getStatusColor(product.status)}>
                    {product.status}
                  </Badge>
                </div>
              </div>

              <CardContent className="p-4">
                {/* Product Info */}
                <div className="space-y-3">
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-gray-100 line-clamp-2">
                      {product.name}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2 mt-1">
                      {product.description}
                    </p>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      {getTypeIcon(product.type)}
                      <span className="text-sm text-gray-500 dark:text-gray-400 capitalize">
                        {product.type}
                      </span>
                    </div>
                    <div className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                      {formatPrice(product.price)}
                    </div>
                  </div>

                  {/* Stock Info */}
                  {product.stock_quantity !== null && (
                    <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
                      <Package className="w-4 h-4" />
                      <span>
                        {product.stock_quantity > 0 
                          ? `${product.stock_quantity} in stock`
                          : 'Out of stock'
                        }
                      </span>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex items-center space-x-2 pt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleStatusToggle(product.id, product.status)}
                      className="flex-1"
                    >
                      {product.status === 'published' ? (
                        <>
                          <EyeOff className="w-4 h-4 mr-1" />
                          Hide
                        </>
                      ) : (
                        <>
                          <Eye className="w-4 h-4 mr-1" />
                          Publish
                        </>
                      )}
                    </Button>
                    

                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(product.id)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:text-red-300 dark:hover:bg-red-900/20"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
} 