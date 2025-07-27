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
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAppContext } from '@/App';
import { useToast } from '@/hooks/use-toast';
import type { Order } from '@/types';

function OrderCard({ order }: { order: Order }) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const cancelOrderMutation = useMutation({
    mutationFn: async (orderId: number) => {
      const response = await fetch(`/api/orders/${orderId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'cancelled' }),
      });
      if (!response.ok) throw new Error('Failed to cancel order');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vendor-orders'] });
      toast({ title: "Order cancelled successfully" });
    },
    onError: () => {
      toast({ title: "Failed to cancel order", variant: "destructive" });
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

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg">Order #{order.id}</CardTitle>
            <p className="text-sm text-muted-foreground">
              {new Date(order.createdAt).toLocaleDateString()}
            </p>
          </div>
          <div className="text-right">
            <Badge className={getStatusColor(order.status)}>
              {order.status.replace('_', ' ').toUpperCase()}
            </Badge>
            {order.isEmergency && (
              <Badge variant="destructive" className="ml-2">🚨 Emergency</Badge>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <p className="font-medium">Total Amount: ₹{order.totalAmount}</p>
          <p className="text-sm text-muted-foreground">
            Estimated Delivery: {new Date(order.estimatedDelivery).toLocaleString()}
          </p>
        </div>
        
        {order.deliveryAddress && (
          <div>
            <p className="text-sm font-medium">Delivery Address:</p>
            <p className="text-sm text-muted-foreground">{order.deliveryAddress}</p>
          </div>
        )}

        {order.notes && (
          <div>
            <p className="text-sm font-medium">Notes:</p>
            <p className="text-sm text-muted-foreground">{order.notes}</p>
          </div>
        )}

        {order.status === 'pending' && (
          <Button 
            variant="destructive" 
            onClick={() => cancelOrderMutation.mutate(order.id)}
            disabled={cancelOrderMutation.isPending}
          >
            Cancel Order
          </Button>
        )}
      </CardContent>
    </Card>
  );
}

function StatsCard({ title, value, icon }: { title: string; value: string | number; icon: string }) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-medium text-muted-foreground">{title}</h3>
            <p className="text-2xl font-bold">{value}</p>
          </div>
          <div className="text-2xl">{icon}</div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function VendorDashboard() {
  const { state } = useAppContext();
  const [activeTab, setActiveTab] = useState('orders');

  const { data: orders, isLoading: ordersLoading } = useQuery({
    queryKey: ['vendor-orders', state.vendor?.id],
    queryFn: async () => {
      if (!state.vendor) return [];
      const response = await fetch(`/api/orders/vendor/${state.vendor.userId}`);
      if (!response.ok) throw new Error('Failed to fetch orders');
      return response.json() as Promise<Order[]>;
    },
    enabled: !!state.vendor,
  });

  const { data: stats } = useQuery({
    queryKey: ['vendor-stats', state.vendor?.id],
    queryFn: async () => {
      if (!state.vendor) return null;
      const response = await fetch(`/api/vendors/${state.vendor.id}/stats`);
      if (!response.ok) throw new Error('Failed to fetch stats');
      return response.json();
    },
    enabled: !!state.vendor,
  });

  if (!state.vendor) {
    return (
      <div className="p-4 text-center">
        <h2 className="text-xl font-bold mb-4">Access Restricted</h2>
        <p>Only vendors can access this dashboard.</p>
      </div>
    );
  }

  const pendingOrders = orders?.filter(order => order.status === 'pending') || [];
  const completedOrders = orders?.filter(order => order.status === 'delivered') || [];

  return (
    <div className="p-4 space-y-6">
      <div className="space-y-2">
        <h1 className="text-2xl font-bold gradient-text">Vendor Dashboard</h1>
        <p className="text-muted-foreground">{state.vendor.businessName}</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4">
        <StatsCard 
          title="Total Orders" 
          value={orders?.length || 0} 
          icon="📦" 
        />
        <StatsCard 
          title="Pending Orders" 
          value={pendingOrders.length} 
          icon="⏳" 
        />
        <StatsCard 
          title="Completed Orders" 
          value={completedOrders.length} 
          icon="✅" 
        />
        <StatsCard 
          title="This Month" 
          value={stats?.ordersThisMonth || 0} 
          icon="📈" 
        />
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="orders">All Orders</TabsTrigger>
          <TabsTrigger value="pending">Pending ({pendingOrders.length})</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
        </TabsList>

        <TabsContent value="orders" className="space-y-4">
          {ordersLoading ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <Card key={i} className="h-32 animate-pulse">
                  <CardContent className="p-4">
                    <div className="space-y-2">
                      <div className="h-4 bg-gray-300 rounded w-1/3"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                      <div className="h-6 bg-gray-300 rounded w-1/4"></div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : orders && orders.length > 0 ? (
            <div className="space-y-4">
              {orders.map(order => (
                <OrderCard key={order.id} order={order} />
              ))}
            </div>
          ) : (
            <div className="text-center py-8 space-y-4">
              <div className="text-6xl">📦</div>
              <h3 className="text-lg font-medium">No orders yet</h3>
              <p className="text-muted-foreground">Start placing orders to see them here</p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="pending" className="space-y-4">
          {pendingOrders.length > 0 ? (
            <div className="space-y-4">
              {pendingOrders.map(order => (
                <OrderCard key={order.id} order={order} />
              ))}
            </div>
          ) : (
            <div className="text-center py-8 space-y-4">
              <div className="text-6xl">⏳</div>
              <h3 className="text-lg font-medium">No pending orders</h3>
              <p className="text-muted-foreground">All your orders are being processed</p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="completed" className="space-y-4">
          {completedOrders.length > 0 ? (
            <div className="space-y-4">
              {completedOrders.map(order => (
                <OrderCard key={order.id} order={order} />
              ))}
            </div>
          ) : (
            <div className="text-center py-8 space-y-4">
              <div className="text-6xl">✅</div>
              <h3 className="text-lg font-medium">No completed orders</h3>
              <p className="text-muted-foreground">Completed orders will appear here</p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
