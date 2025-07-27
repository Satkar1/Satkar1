import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import MobileHeader from "@/components/layout/mobile-header";
import BottomNavigation from "@/components/layout/bottom-navigation";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { 
  Package, 
  TrendingUp, 
  Clock, 
  CheckCircle, 
  AlertTriangle,
  Edit,
  Plus,
  Eye,
  Truck
} from "lucide-react";

export default function SupplierDashboard() {
  const [userType, setUserType] = useState<'vendor' | 'supplier'>('supplier');
  const { toast } = useToast();

  // Mock supplier data - in production, get from user context
  const supplierId = "supplier-123";

  const { data: stats } = useQuery({
    queryKey: ['/api/suppliers', supplierId, 'stats'],
    queryFn: async () => {
      const response = await fetch(`/api/suppliers/${supplierId}/stats`);
      return response.json();
    },
  });

  const { data: orders = [] } = useQuery({
    queryKey: ['/api/orders/supplier', supplierId],
    queryFn: async () => {
      const response = await fetch(`/api/orders/supplier/${supplierId}`);
      return response.json();
    },
  });

  const { data: products = [] } = useQuery({
    queryKey: ['/api/products/supplier', supplierId],
    queryFn: async () => {
      const response = await fetch(`/api/products/supplier/${supplierId}`);
      return response.json();
    },
  });

  const { data: emergencyOrders = [] } = useQuery({
    queryKey: ['/api/orders/emergency/all'],
    queryFn: async () => {
      const response = await fetch('/api/orders/emergency/all');
      return response.json();
    },
    refetchInterval: 30000, // Refresh every 30 seconds for emergency orders
  });

  const updateOrderStatusMutation = useMutation({
    mutationFn: async ({ orderId, status }: { orderId: string; status: string }) => {
      const response = await fetch(`/api/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/orders'] });
      toast({
        title: "Order Updated",
        description: "Order status has been updated successfully.",
      });
    },
  });

  const updateOnlineStatusMutation = useMutation({
    mutationFn: async (isOnline: boolean) => {
      const response = await fetch(`/api/suppliers/${supplierId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isOnline }),
      });
      return response.json();
    },
    onSuccess: (_, isOnline) => {
      toast({
        title: isOnline ? "Now Online" : "Now Offline",
        description: isOnline 
          ? "You're now visible to vendors for new orders." 
          : "You won't receive new orders while offline.",
      });
    },
  });

  const updateProductStockMutation = useMutation({
    mutationFn: async ({ productId, stockQuantity }: { productId: string; stockQuantity: number }) => {
      const response = await fetch(`/api/products/${productId}/stock`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stockQuantity }),
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/products'] });
      toast({
        title: "Stock Updated",
        description: "Product stock has been updated successfully.",
      });
    },
  });

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      pending: 'bg-yellow-100 text-yellow-700',
      confirmed: 'bg-blue-100 text-blue-700',
      preparing: 'bg-orange-100 text-orange-700',
      out_for_delivery: 'bg-purple-100 text-purple-700',
      delivered: 'bg-green-100 text-green-700',
      cancelled: 'bg-red-100 text-red-700',
    };
    return colors[status] || 'bg-gray-100 text-gray-700';
  };

  const getNextStatus = (currentStatus: string): string | null => {
    const statusFlow: Record<string, string> = {
      pending: 'confirmed',
      confirmed: 'preparing',
      preparing: 'out_for_delivery',
      out_for_delivery: 'delivered',
    };
    return statusFlow[currentStatus] || null;
  };

  const getStatusText = (status: string) => {
    const texts: Record<string, string> = {
      pending: 'Pending',
      confirmed: 'Confirmed',
      preparing: 'Preparing',
      out_for_delivery: 'Out for Delivery',
      delivered: 'Delivered',
      cancelled: 'Cancelled',
    };
    return texts[status] || status;
  };

  const handleOrderStatusUpdate = (orderId: string, status: string) => {
    updateOrderStatusMutation.mutate({ orderId, status });
  };

  const handleStockUpdate = (productId: string, newStock: number) => {
    updateProductStockMutation.mutate({ productId, stockQuantity: newStock });
  };

  const priorityOrders = orders.filter((order: any) => 
    order.isEmergency || order.status === 'pending'
  ).slice(0, 5);

  return (
    <div className="mobile-container">
      <MobileHeader 
        userType={userType}
        onUserTypeChange={setUserType}
        onShowQR={() => {}}
        location="Supplier Dashboard"
      />

      <div className="p-4 space-y-6">
        {/* Online Status Toggle */}
        <Card className="vibrant-orange text-white">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold outdoor-text-light">Business Status</h3>
                <p className="text-xs opacity-90">
                  {updateOnlineStatusMutation.isPending ? 'Updating...' : 'Toggle to receive orders'}
                </p>
              </div>
              <Switch
                checked={true} // Default online - in production, get from supplier data
                onCheckedChange={(checked) => updateOnlineStatusMutation.mutate(checked)}
                disabled={updateOnlineStatusMutation.isPending}
              />
            </div>
          </CardContent>
        </Card>

        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-3">
          <Card className="vibrant-green text-white">
            <CardContent className="p-3 text-center">
              <Package className="h-5 w-5 mx-auto mb-1" />
              <div className="text-lg font-bold outdoor-text-light">{stats?.totalOrders || 0}</div>
              <div className="text-xs outdoor-text-light">Total Orders</div>
            </CardContent>
          </Card>
          
          <Card className="vibrant-blue text-white">
            <CardContent className="p-3 text-center">
              <TrendingUp className="h-5 w-5 mx-auto mb-1" />
              <div className="text-lg font-bold outdoor-text-light">₹{stats?.totalRevenue || 0}</div>
              <div className="text-xs outdoor-text-light">Revenue</div>
            </CardContent>
          </Card>

          <Card className="vibrant-yellow text-white">
            <CardContent className="p-3 text-center">
              <Clock className="h-5 w-5 mx-auto mb-1" />
              <div className="text-lg font-bold outdoor-text-light">{stats?.averageRating || 0}</div>
              <div className="text-xs outdoor-text-light">Rating</div>
            </CardContent>
          </Card>
        </div>

        {/* Emergency Orders Alert */}
        {emergencyOrders.length > 0 && (
          <Card className="border-red-200 bg-red-50">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center space-x-2 text-red-700">
                <AlertTriangle className="h-5 w-5" />
                <span>Emergency Orders</span>
                <Badge className="bg-red-100 text-red-700 pulse-ring">
                  {emergencyOrders.length}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-red-600 mb-3">
                Urgent orders requiring immediate attention (30 min SLA)
              </p>
              <div className="space-y-2">
                {emergencyOrders.slice(0, 3).map((order: any) => (
                  <div key={order.id} className="flex items-center justify-between p-3 bg-white rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <span className="font-medium">#{order.orderNumber}</span>
                        <Badge className="bg-red-100 text-red-700 text-xs">URGENT</Badge>
                      </div>
                      <p className="text-sm text-gray-600">{order.vendor.stallName}</p>
                      <p className="text-xs text-gray-500">
                        {Math.floor((Date.now() - new Date(order.createdAt).getTime()) / 60000)}m ago
                      </p>
                    </div>
                    <Button 
                      size="sm"
                      className="bg-red-500 hover:bg-red-600"
                      onClick={() => handleOrderStatusUpdate(order.id, 'confirmed')}
                    >
                      Accept
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Priority Orders */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center justify-between">
              <span>Priority Orders</span>
              <Badge className="bg-orange-100 text-orange-700">
                {priorityOrders.length} pending
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {priorityOrders.map((order: any) => (
                <div key={order.id} className="border rounded-lg p-3">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <span className="font-medium">#{order.orderNumber}</span>
                      {order.isEmergency && (
                        <Badge className="bg-red-100 text-red-700 text-xs pulse-ring">
                          EMERGENCY
                        </Badge>
                      )}
                      <Badge className={`text-xs ${getStatusColor(order.status)}`}>
                        {getStatusText(order.status)}
                      </Badge>
                    </div>
                    <span className="text-sm font-medium">₹{parseFloat(order.totalAmount).toFixed(0)}</span>
                  </div>
                  
                  <p className="text-sm text-gray-600 mb-2">{order.vendor.stallName}</p>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500">
                      {new Date(order.createdAt).toLocaleTimeString()}
                    </span>
                    
                    <div className="flex space-x-2">
                      <Button size="sm" variant="outline">
                        <Eye className="h-3 w-3 mr-1" />
                        View
                      </Button>
                      
                      {getNextStatus(order.status) && (
                        <Button 
                          size="sm"
                          onClick={() => handleOrderStatusUpdate(order.id, getNextStatus(order.status)!)}
                          disabled={updateOrderStatusMutation.isPending}
                        >
                          {order.status === 'pending' && <CheckCircle className="h-3 w-3 mr-1" />}
                          {order.status === 'confirmed' && <Package className="h-3 w-3 mr-1" />}
                          {order.status === 'preparing' && <Truck className="h-3 w-3 mr-1" />}
                          {order.status === 'pending' && 'Accept'}
                          {order.status === 'confirmed' && 'Start Prep'}
                          {order.status === 'preparing' && 'Dispatch'}
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              
              {priorityOrders.length === 0 && (
                <div className="text-center py-8">
                  <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                  <p className="text-gray-600">All caught up!</p>
                  <p className="text-sm text-gray-500">No pending orders at the moment</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Inventory Management */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center justify-between">
              <span>Inventory</span>
              <Button size="sm" variant="outline">
                <Plus className="h-4 w-4 mr-1" />
                Add Product
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {products.slice(0, 5).map((product: any) => (
                <div key={product.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex-1">
                    <h4 className="font-medium outdoor-text">{product.name}</h4>
                    <div className="flex items-center space-x-4 text-sm text-gray-600">
                      <span>₹{parseFloat(product.pricePerUnit).toFixed(0)}/{product.unit}</span>
                      <span className={`font-medium ${
                        product.stockQuantity < 10 ? 'text-red-500' : 'text-green-600'
                      }`}>
                        {product.stockQuantity} {product.unit}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <div className="flex items-center space-x-1">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleStockUpdate(product.id, Math.max(0, product.stockQuantity - 10))}
                        disabled={updateProductStockMutation.isPending}
                      >
                        -
                      </Button>
                      <span className="w-8 text-center text-sm">{product.stockQuantity}</span>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleStockUpdate(product.id, product.stockQuantity + 10)}
                        disabled={updateProductStockMutation.isPending}
                      >
                        +
                      </Button>
                    </div>
                    
                    <Button size="sm" variant="ghost">
                      <Edit className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              ))}
              
              {products.length === 0 && (
                <div className="text-center py-8">
                  <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">No products added yet</p>
                  <p className="text-sm text-gray-500">Add your first product to start selling</p>
                  <Button className="mt-3">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Product
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Performance Analytics */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Today's Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Orders processed</span>
                <span className="font-medium">{Math.floor((stats?.totalOrders || 0) * 0.1)}</span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Average response time</span>
                <span className="font-medium">8 minutes</span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Customer satisfaction</span>
                <span className="font-medium">{stats?.averageRating || 4.5}/5.0</span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Revenue today</span>
                <span className="font-medium">₹{Math.floor((stats?.totalRevenue || 0) * 0.05)}</span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Low stock items</span>
                <span className={`font-medium ${
                  products.filter((p: any) => p.stockQuantity < 10).length > 0 ? 'text-red-500' : 'text-green-600'
                }`}>
                  {products.filter((p: any) => p.stockQuantity < 10).length}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <BottomNavigation />
    </div>
  );
}
