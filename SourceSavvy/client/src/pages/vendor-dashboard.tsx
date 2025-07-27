import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import MobileHeader from "@/components/layout/mobile-header";
import BottomNavigation from "@/components/layout/bottom-navigation";
import { TrendingUp, ShoppingCart, MapPin, Clock, Star, AlertTriangle } from "lucide-react";

export default function VendorDashboard() {
  const [userType, setUserType] = useState<'vendor' | 'supplier'>('vendor');

  // Mock vendor data - in production, get from user context
  const vendorId = "vendor-123";

  const { data: stats } = useQuery({
    queryKey: ['/api/vendors', vendorId, 'stats'],
    queryFn: async () => {
      const response = await fetch(`/api/vendors/${vendorId}/stats`);
      return response.json();
    },
  });

  const { data: orders = [] } = useQuery({
    queryKey: ['/api/orders/vendor', vendorId],
    queryFn: async () => {
      const response = await fetch(`/api/orders/vendor/${vendorId}`);
      return response.json();
    },
  });

  const { data: emergencyOrders = [] } = useQuery({
    queryKey: ['/api/orders/emergency/all'],
    queryFn: async () => {
      const response = await fetch('/api/orders/emergency/all');
      return response.json();
    },
  });

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      pending: 'bg-yellow-100 text-yellow-700',
      confirmed: 'bg-blue-100 text-blue-700',
      preparing: 'bg-orange-100 text-orange-700',
      out_for_delivery: 'bg-purple-100 text-purple-700',
      delivered: 'bg-green-100 text-green-700',
    };
    return colors[status] || 'bg-gray-100 text-gray-700';
  };

  return (
    <div className="mobile-container">
      <MobileHeader 
        userType={userType}
        onUserTypeChange={setUserType}
        onShowQR={() => {}}
        location="Vendor Dashboard"
      />

      <div className="p-4 space-y-6">
        {/* Quick Stats */}
        <div className="grid grid-cols-2 gap-4">
          <Card className="vibrant-green text-white">
            <CardContent className="p-4 text-center">
              <TrendingUp className="h-6 w-6 mx-auto mb-2" />
              <div className="text-xl font-bold">{stats?.totalOrders || 0}</div>
              <div className="text-xs opacity-90">Total Orders</div>
            </CardContent>
          </Card>
          
          <Card className="vibrant-blue text-white">
            <CardContent className="p-4 text-center">
              <ShoppingCart className="h-6 w-6 mx-auto mb-2" />
              <div className="text-xl font-bold">₹{stats?.totalSpent || 0}</div>
              <div className="text-xs opacity-90">Total Spent</div>
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
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-red-600 mb-3">
                {emergencyOrders.length} urgent orders need immediate attention
              </p>
              <div className="space-y-2">
                {emergencyOrders.slice(0, 3).map((order: any) => (
                  <div key={order.id} className="flex items-center justify-between p-2 bg-white rounded">
                    <div>
                      <span className="font-medium">#{order.orderNumber}</span>
                      <span className="text-xs text-gray-500 ml-2">
                        {order.vendor.stallName}
                      </span>
                    </div>
                    <Badge className="bg-red-100 text-red-700">
                      {Math.floor((Date.now() - new Date(order.createdAt).getTime()) / 60000)}m ago
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Recent Orders */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Recent Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {orders.slice(0, 5).map((order: any) => (
                <div key={order.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <span className="font-medium">#{order.orderNumber}</span>
                      <Badge className={`text-xs ${getStatusColor(order.status)}`}>
                        {order.status.replace('_', ' ')}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">
                      {order.supplier.businessName}
                    </p>
                    <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                      <span>₹{parseFloat(order.totalAmount).toFixed(0)}</span>
                      <span>{new Date(order.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                  
                  {order.status === 'delivered' && (
                    <Button size="sm" variant="outline">
                      <Star className="h-4 w-4 mr-1" />
                      Rate
                    </Button>
                  )}
                </div>
              ))}
              
              {orders.length === 0 && (
                <div className="text-center py-8">
                  <ShoppingCart className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">No orders yet</p>
                  <p className="text-sm text-gray-500">Start ordering to see your history here</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Favorite Suppliers */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Favorite Suppliers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {stats?.favoriteSuppliers?.slice(0, 3).map((supplierId: string, index: number) => (
                <div key={supplierId} className="flex items-center space-x-3 p-2 border rounded-lg">
                  <div className="w-8 h-8 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-full flex items-center justify-center">
                    <span className="text-sm font-medium">{index + 1}</span>
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">Supplier {index + 1}</p>
                    <div className="flex items-center space-x-2 text-xs text-gray-500">
                      <MapPin className="h-3 w-3" />
                      <span>2.5 km away</span>
                      <Star className="h-3 w-3 text-yellow-400 fill-current" />
                      <span>4.8</span>
                    </div>
                  </div>
                  <Button size="sm" variant="outline">
                    Order
                  </Button>
                </div>
              ))}
              
              {(!stats?.favoriteSuppliers || stats.favoriteSuppliers.length === 0) && (
                <div className="text-center py-6">
                  <Star className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-600">No favorite suppliers yet</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Performance Insights */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Insights</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Average order value</span>
                <span className="font-medium">
                  ₹{stats?.totalSpent && stats?.totalOrders 
                    ? Math.round(stats.totalSpent / stats.totalOrders) 
                    : 0}
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Orders this month</span>
                <span className="font-medium">{Math.floor((stats?.totalOrders || 0) * 0.3)}</span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Preferred category</span>
                <span className="font-medium">Vegetables</span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Best delivery time</span>
                <span className="font-medium">Morning (8-10 AM)</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <BottomNavigation />
    </div>
  );
}
