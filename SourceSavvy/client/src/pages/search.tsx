
import React, { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAppContext } from '@/App';
import { useToast } from '@/hooks/use-toast';
import type { Product, Category, CartItem } from '@/types';

// Product Card Component
function ProductCard({ 
  product, 
  onAddToCart, 
  cartItem 
}: { 
  product: Product & { supplierName: string; distance?: number };
  onAddToCart: (product: Product & { supplierName: string }) => void;
  cartItem?: CartItem;
}) {
  const [quantity, setQuantity] = useState(1);

  const handleAddToCart = () => {
    onAddToCart(product);
    setQuantity(1);
  };

  return (
    <Card className="h-full">
      <CardContent className="p-4">
        <div className="space-y-3">
          <div className="flex justify-between items-start">
            <h3 className="font-medium text-lg">{product.name}</h3>
            <Badge variant={product.isAvailable ? "default" : "secondary"}>
              {product.isAvailable ? "Available" : "Out of Stock"}
            </Badge>
          </div>
          
          {product.description && (
            <p className="text-sm text-muted-foreground">{product.description}</p>
          )}
          
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-lg font-bold text-primary">
                ₹{product.pricePerUnit}/{product.unit}
              </span>
              {product.distance && (
                <span className="text-xs text-muted-foreground">
                  {product.distance.toFixed(1)} km away
                </span>
              )}
            </div>
            
            <div className="text-sm text-muted-foreground">
              <p>Supplier: {product.supplierName}</p>
              <p>Min order: {product.minOrderQuantity} {product.unit}</p>
              <p>Stock: {product.stockQuantity} {product.unit}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Input
              type="number"
              min={product.minOrderQuantity}
              max={product.stockQuantity}
              value={quantity}
              onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
              className="w-20"
            />
            <Button 
              onClick={handleAddToCart}
              disabled={!product.isAvailable || quantity < product.minOrderQuantity}
              className="flex-1"
            >
              Add to Cart
            </Button>
          </div>

          {cartItem && (
            <div className="text-sm text-green-600">
              In cart: {cartItem.quantity} {product.unit}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// Cart Component
function CartTab() {
  const { state, dispatch } = useAppContext();
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  const totalAmount = state.cart.reduce((sum, item) => sum + (item.pricePerUnit * item.quantity), 0);

  const handleUpdateQuantity = (productId: number, quantity: number) => {
    dispatch({ type: 'UPDATE_CART_ITEM', payload: { productId, quantity } });
  };

  const handleRemoveItem = (productId: number) => {
    dispatch({ type: 'REMOVE_FROM_CART', payload: productId });
    toast({ title: "Item removed from cart" });
  };

  const handleCheckout = () => {
    if (state.cart.length === 0) return;
    setLocation('/checkout');
  };

  if (state.cart.length === 0) {
    return (
      <div className="text-center py-8 space-y-4">
        <div className="text-6xl">🛒</div>
        <h3 className="text-lg font-medium">Your cart is empty</h3>
        <p className="text-muted-foreground">Add some products to get started</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {state.cart.map((item) => (
        <Card key={item.productId}>
          <CardContent className="p-4">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <h3 className="font-medium">{item.productName}</h3>
                <p className="text-sm text-muted-foreground">
                  ₹{item.pricePerUnit}/{item.unit}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  min="1"
                  value={item.quantity}
                  onChange={(e) => handleUpdateQuantity(item.productId, parseInt(e.target.value) || 1)}
                  className="w-20"
                />
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => handleRemoveItem(item.productId)}
                >
                  Remove
                </Button>
              </div>
            </div>
            <div className="mt-2 text-right">
              <span className="font-medium">
                Total: ₹{(item.pricePerUnit * item.quantity).toFixed(2)}
              </span>
            </div>
          </CardContent>
        </Card>
      ))}
      
      <Card className="border-primary">
        <CardContent className="p-4">
          <div className="flex justify-between items-center">
            <span className="text-lg font-bold">Total: ₹{totalAmount.toFixed(2)}</span>
            <Button onClick={handleCheckout} size="lg">
              Proceed to Checkout
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Main Search Component
export default function Search() {
  const { state, dispatch } = useAppContext();
  const { toast } = useToast();
  const [location] = useLocation();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);

  // Get URL parameters
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const categoryParam = urlParams.get('category');
    const searchParam = urlParams.get('search');
    
    if (categoryParam) {
      setSelectedCategory(parseInt(categoryParam));
    }
    if (searchParam) {
      setSearchQuery(searchParam);
    }
  }, [location]);

  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const response = await fetch('/api/categories');
      if (!response.ok) throw new Error('Failed to fetch categories');
      return response.json() as Promise<Category[]>;
    },
  });

  const { data: products, isLoading } = useQuery({
    queryKey: ['products', selectedCategory, searchQuery, state.currentLocation],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (selectedCategory) params.append('categoryId', selectedCategory.toString());
      if (searchQuery) params.append('search', searchQuery);
      if (state.currentLocation) {
        params.append('lat', state.currentLocation.latitude.toString());
        params.append('lng', state.currentLocation.longitude.toString());
      }

      const response = await fetch(`/api/products?${params}`);
      if (!response.ok) throw new Error('Failed to fetch products');
      return response.json() as Promise<Product[]>;
    },
    enabled: !!(selectedCategory || searchQuery),
  });

  const handleAddToCart = (product: Product & { supplierName: string }) => {
    if (!state.vendor) {
      toast({ title: "Access denied", description: "Only vendors can add items to cart", variant: "destructive" });
      return;
    }

    const cartItem: CartItem = {
      productId: product.id,
      productName: product.name,
      supplierId: product.supplierId,
      supplierName: product.supplierName,
      pricePerUnit: product.pricePerUnit,
      unit: product.unit,
      quantity: 1,
      minOrderQuantity: product.minOrderQuantity,
    };

    dispatch({ type: 'ADD_TO_CART', payload: cartItem });
    toast({ title: "Added to cart", description: `${product.name} added successfully` });
  };

  const getCartItem = (productId: number): CartItem | undefined => {
    return state.cart.find(item => item.productId === productId);
  };

  const handleCategorySelect = (categoryId: number | null) => {
    setSelectedCategory(categoryId);
    setSearchQuery('');
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setSelectedCategory(null);
  };

  if (!state.vendor) {
    return (
      <div className="p-4 text-center">
        <h2 className="text-xl font-bold mb-4">Access Restricted</h2>
        <p>Only vendors can access the search functionality.</p>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-6">
      <Tabs defaultValue="search" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="search">Search Products</TabsTrigger>
          <TabsTrigger value="cart">
            Cart ({state.cart.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="search" className="space-y-6">
          {/* Search Bar */}
          <div className="space-y-4">
            <Input
              type="text"
              placeholder="Search for products..."
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              className="w-full"
            />
          </div>

          {/* Categories */}
          {categories && categories.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Categories</h3>
              <div className="flex flex-wrap gap-2">
                <Button
                  variant={selectedCategory === null ? "default" : "outline"}
                  onClick={() => handleCategorySelect(null)}
                  size="sm"
                >
                  All
                </Button>
                {categories.map((category) => (
                  <Button
                    key={category.id}
                    variant={selectedCategory === category.id ? "default" : "outline"}
                    onClick={() => handleCategorySelect(category.id)}
                    size="sm"
                  >
                    {category.icon} {category.name}
                  </Button>
                ))}
              </div>
            </div>
          )}

          {/* Location Status */}
          {state.currentLocation && (
            <Badge variant="secondary" className="text-xs">
              📍 Showing results near you
            </Badge>
          )}

          {/* Products Grid */}
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[...Array(6)].map((_, i) => (
                <Card key={i} className="h-48 animate-pulse">
                  <CardContent className="p-4">
                    <div className="space-y-3">
                      <div className="h-4 bg-gray-300 rounded"></div>
                      <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                      <div className="h-6 bg-gray-300 rounded w-1/3"></div>
                      <div className="h-8 bg-gray-300 rounded"></div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : products && products.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {products.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onAddToCart={handleAddToCart}
                  cartItem={getCartItem(product.id)}
                />
              ))}
            </div>
          ) : (selectedCategory || searchQuery) ? (
            <div className="text-center py-8 space-y-4">
              <div className="text-6xl">🔍</div>
              <h3 className="text-lg font-medium">No products found</h3>
              <p className="text-muted-foreground">Try adjusting your search or category filter</p>
            </div>
          ) : (
            <div className="text-center py-8 space-y-4">
              <div className="text-6xl">🛍️</div>
              <h3 className="text-lg font-medium">Start exploring</h3>
              <p className="text-muted-foreground">Search for products or select a category</p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="cart">
          <CartTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}
