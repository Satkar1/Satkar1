import { useState, useEffect } from "react";
import { useRoute } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import MobileHeader from "@/components/layout/mobile-header";
import BottomNavigation from "@/components/layout/bottom-navigation";
import TrackingModal from "@/components/modals/tracking-modal";
import { 
  ArrowLeft, 
  MapPin, 
  Clock, 
  Phone, 
  MessageCircle, 
  CheckCircle, 
  Circle,
  Truck,
  Package,
  Star,
  Navigation,
  Timer
} from "lucide-react";
import { useLocation } from "wouter";

export default function OrderTracking() {
  const [, params] = useRoute("/order/:id");
  const [, setLocation] = useLocation();
  const [showTrackingModal, setShowTrackingModal] = useState(false);
  const [userType, setUserType] = useState<'vendor' | 'supplier'>('vendor');

  const orderId = params?.id;

  const { data: order, isLoading } = useQuery({
    queryKey: ['/api/orders', orderId],
    queryFn: async () => {
      if (!orderId) throw new Error('Order ID is required');
      const response = await fetch(`/api/orders/${orderId}`);
      if (!response.ok) throw new Error('Order not found');
      return response.json();
    },
    enabled: !!orderId,
    refetchInterval: 30000, // Refresh every 30 seconds for real-time updates
  });

  const trackingSteps = [
    {
      id: 'confirmed',
      title: 'Order Confirmed',
      description: 'Your order has been received and confirmed',
      icon: CheckCircle,
      completed: true,
      time: order ? new Date(order.createdAt).toLocaleTimeString() : '',
    },
    {
      id: 'preparing',
      title: 'Preparing Order',
      description: 'Supplier is gathering your items',
      icon: Package,
      completed: ['preparing', 'out_for_delivery', 'delivered'].includes(order?.status),
      current: order?.status === 'preparing',
      time: order?.status === 'preparing' ? 'In progress...' : '2:45 PM',
    },
    {
      id: 'out_for_delivery',
      title: 'Out for Delivery',
      description: 'Your order is on the way',
      icon: Truck,
      completed: ['out_for_delivery', 'delivered'].includes(order?.status),
      current: order?.status === 'out_for_delivery',
      time: order?.status === 'out_for_delivery' ? 'In progress...' : order?.estimatedDeliveryTime ? new Date(order.estimatedDeliveryTime).toLocaleTimeString() : 'ETA: 3:20 PM',
    },
    {
      id: 'delivered',
      title: 'Delivered',
      description: 'Order successfully delivered',
      icon: CheckCircle,
      completed: order?.status === 'delivered',
      time: order?.actualDeliveryTime ? new Date(order.actualDeliveryTime).toLocaleTimeString() : 'ETA: 3:25 PM',
    },
  ];

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

  const getStatusText = (status: string) => {
    const texts: Record<string, string> = {
      pending: 'Pending Confirmation',
      confirmed: 'Confirmed',
      preparing: 'Being Prepared',
      out_for_delivery: 'Out for Delivery',
      delivered: 'Delivered',
      cancelled: 'Cancelled',
    };
    return texts[status] || status;
  };

  const getCurrentProgress = () => {
    const statusProgress: Record<string, number> = {
      pending: 25,
      confirmed: 25,
      preparing: 50,
      out_for_delivery: 75,
      delivered: 100,
    };
    return statusProgress[order?.status] || 25;
  };

  const formatItems = (items: any[]) => {
    if (!items || items.length === 0) return [];
    return items.map(item => ({
      ...item,
      formattedName: `${item.quantity}${item.unit} ${item.productName}`,
      formattedPrice: `₹${parseFloat(item.totalPrice || item.pricePerUnit * item.quantity).toFixed(0)}`,
    }));
  };

  const getDeliveryETA = () => {
    if (order?.status === 'delivered') return 'Delivered';
    if (order?.status === 'out_for_delivery') return '10 minutes';
    if (order?.status === 'preparing') return '20 minutes';
    return '30 minutes';
  };

  if (isLoading) {
    return (
      <div className="mobile-container">
        <MobileHeader 
          userType={userType}
          onUserTypeChange={setUserType}
          onShowQR={() => {}}
          location="Loading..."
        />
        <div className="p-4 space-y-4">
          <div className="animate-pulse space-y-4">
            <div className="h-32 bg-gray-200 rounded-lg"></div>
            <div className="h-20 bg-gray-200 rounded-lg"></div>
            <div className="h-40 bg-gray-200 rounded-lg"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="mobile-container">
        <MobileHeader 
          userType={userType}
          onUserTypeChange={setUserType}
          onShowQR={() => {}}
          location="Order Not Found"
        />
        <div className="p-4 text-center py-20">
          <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-lg font-semibold text-gray-900 mb-2">Order Not Found</h2>
          <p className="text-gray-600 mb-6">The order you're looking for doesn't exist or has been removed.</p>
          <Button onClick={() => setLocation('/')}>
            Go Home
          </Button>
        </div>
      </div>
    );
  }

  const formattedItems = formatItems(order.items || []);

  return (
    <div className="mobile-container">
      <MobileHeader 
        userType={userType}
        onUserTypeChange={setUserType}
        onShowQR={() => {}}
        location="Order Tracking"
      />

      <div className="p-4 space-y-6">
        {/* Back Button */}
        <Button 
          variant="ghost" 
          size="sm"
          onClick={() => setLocation('/')}
          className="mb-2"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>

        {/* Order Header */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-xl font-bold outdoor-text">#{order.orderNumber}</h1>
                <p className="text-sm text-gray-600">
                  {order.isEmergency && <span className="text-red-600 font-medium">EMERGENCY • </span>}
                  Ordered {new Date(order.createdAt).toLocaleDateString()}
                </p>
              </div>
              <Badge className={`${getStatusColor(order.status)} text-sm`}>
                {getStatusText(order.status)}
              </Badge>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <MapPin className="h-4 w-4 text-gray-500" />
                <span className="text-sm text-gray-600">
                  {order.supplier?.user?.address || order.supplier?.businessName}
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <Timer className="h-4 w-4 text-gray-500" />
                <span className="text-sm font-medium">ETA: {getDeliveryETA()}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Live Tracking */}
        {order.status === 'out_for_delivery' && (
          <Card className="border-primary/20 bg-primary/5">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold outdoor-text">Live Tracking</h3>
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => setShowTrackingModal(true)}
                >
                  <Navigation className="h-4 w-4 mr-1" />
                  View Map
                </Button>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-full flex items-center justify-center">
                    <span className="text-sm font-medium">RK</span>
                  </div>
                  <div className="flex-1">
                    <p className="font-medium outdoor-text">Rajesh Kumar</p>
                    <p className="text-sm text-gray-600">Delivery Partner • 4.9 ⭐</p>
                  </div>
                  <div className="flex space-x-2">
                    <Button size="sm" className="bg-green-500 hover:bg-green-600 p-2">
                      <Phone className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="outline" className="p-2">
                      <MessageCircle className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                
                <div className="bg-white p-3 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-600">Progress</span>
                    <span className="text-sm font-medium">{getCurrentProgress()}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-primary h-2 rounded-full transition-all duration-500" 
                      style={{ width: `${getCurrentProgress()}%` }}
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    📍 Currently at Main Market Junction, 1.2km away
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Order Timeline */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Order Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {trackingSteps.map((step, index) => {
                const Icon = step.icon;
                return (
                  <div key={step.id} className="flex items-start space-x-3">
                    <div className="relative flex-shrink-0">
                      {step.completed ? (
                        <Icon className="w-6 h-6 text-green-500 fill-current" />
                      ) : step.current ? (
                        <Icon className="w-6 h-6 text-primary fill-current pulse-ring" />
                      ) : (
                        <Circle className="w-6 h-6 text-gray-300" />
                      )}
                      
                      {index < trackingSteps.length - 1 && (
                        <div className={`absolute top-6 left-3 w-0.5 h-8 ${
                          step.completed ? 'bg-green-500' : 'bg-gray-300'
                        }`} />
                      )}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className={`font-medium ${
                          step.completed || step.current ? 'text-gray-900' : 'text-gray-400'
                        }`}>
                          {step.title}
                        </p>
                        <span className={`text-xs ${
                          step.completed || step.current ? 'text-gray-500' : 'text-gray-400'
                        }`}>
                          {step.time}
                        </span>
                      </div>
                      <p className={`text-sm ${
                        step.completed || step.current ? 'text-gray-600' : 'text-gray-400'
                      }`}>
                        {step.description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Order Details */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Order Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-medium outdoor-text">Supplier</span>
                <span className="text-gray-600">{order.supplier?.businessName || 'Unknown'}</span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="font-medium outdoor-text">Delivery Address</span>
                <span className="text-gray-600 text-right max-w-48 truncate">
                  {order.deliveryAddress}
                </span>
              </div>
              
              <Separator />
              
              <div className="space-y-2">
                <h4 className="font-medium outdoor-text">Items Ordered</h4>
                {formattedItems.map((item: any, index: number) => (
                  <div key={index} className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">{item.formattedName}</span>
                    <span className="font-medium">{item.formattedPrice}</span>
                  </div>
                ))}
              </div>
              
              <Separator />
              
              <div className="flex items-center justify-between text-lg font-semibold">
                <span>Total Amount</span>
                <span className="text-primary">₹{parseFloat(order.totalAmount).toFixed(0)}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Voice Notes */}
        {order.voiceNotes && order.voiceNotes.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Voice Notes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {order.voiceNotes.map((note: any, index: number) => (
                  <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                    <Button size="sm" variant="outline" className="p-2">
                      <MessageCircle className="h-4 w-4" />
                    </Button>
                    <div className="flex-1">
                      <p className="text-sm text-gray-600">Voice note {index + 1}</p>
                      <p className="text-xs text-gray-500">{note.duration}s</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Action Buttons */}
        <div className="space-y-3 pb-20">
          {order.status === 'delivered' && (
            <Button className="w-full bg-accent hover:bg-accent/90">
              <Star className="h-4 w-4 mr-2" />
              Rate This Order
            </Button>
          )}
          
          {order.status === 'preparing' && (
            <Button className="w-full" variant="outline">
              <Phone className="h-4 w-4 mr-2" />
              Call Supplier
            </Button>
          )}
          
          {order.status === 'out_for_delivery' && (
            <Button className="w-full" variant="outline">
              <Phone className="h-4 w-4 mr-2" />
              Call Delivery Partner
            </Button>
          )}
          
          <Button 
            variant="outline" 
            className="w-full"
            onClick={() => window.print()}
          >
            Print Order Summary
          </Button>
        </div>
      </div>

      <BottomNavigation />

      <TrackingModal
        isOpen={showTrackingModal}
        onClose={() => setShowTrackingModal(false)}
        order={order}
      />
    </div>
  );
}
import React from 'react';
import { useRoute } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useAppContext } from '@/App';
import type { Order } from '@/types';

function OrderTimeline({ order }: { order: Order }) {
  const getStatusSteps = () => {
    const steps = [
      { key: 'pending', label: 'Order Placed', icon: '📝' },
      { key: 'confirmed', label: 'Confirmed', icon: '✅' },
      { key: 'preparing', label: 'Preparing', icon: '👨‍🍳' },
      { key: 'out_for_delivery', label: 'Out for Delivery', icon: '🚚' },
      { key: 'delivered', label: 'Delivered', icon: '🎉' },
    ];

    const currentStepIndex = steps.findIndex(step => step.key === order.status);
    
    return steps.map((step, index) => ({
      ...step,
      completed: index <= currentStepIndex,
      current: index === currentStepIndex,
    }));
  };

  const steps = getStatusSteps();

  return (
    <div className="space-y-4">
      {steps.map((step, index) => (
        <div key={step.key} className="flex items-center gap-4">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm ${
            step.completed 
              ? 'bg-green-500 text-white' 
              : step.current 
                ? 'bg-blue-500 text-white animate-pulse'
                : 'bg-gray-200 text-gray-500'
          }`}>
            {step.completed ? '✓' : index + 1}
          </div>
          <div className="flex-1">
            <p className={`font-medium ${step.completed || step.current ? 'text-primary' : 'text-muted-foreground'}`}>
              {step.icon} {step.label}
            </p>
            {step.current && (
              <p className="text-sm text-blue-600">Current status</p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

export default function OrderTracking() {
  const [match, params] = useRoute('/order-tracking/:orderId');
  const { state } = useAppContext();
  const orderId = params?.orderId;

  const { data: order, isLoading, error } = useQuery({
    queryKey: ['order', orderId],
    queryFn: async () => {
      const response = await fetch(`/api/orders/${orderId}`);
      if (!response.ok) throw new Error('Failed to fetch order');
      return response.json() as Promise<Order & { items: any[] }>;
    },
    enabled: !!orderId,
    refetchInterval: 30000, // Refetch every 30 seconds for real-time updates
  });

  if (!match || !orderId) {
    return (
      <div className="p-4 text-center">
        <h2 className="text-xl font-bold mb-4">Invalid Order</h2>
        <p>Order ID not found in URL.</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="p-4 space-y-4">
        <Card className="h-32 animate-pulse">
          <CardContent className="p-4">
            <div className="space-y-2">
              <div className="h-4 bg-gray-300 rounded w-1/3"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2"></div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="p-4 text-center space-y-4">
        <div className="text-6xl">❌</div>
        <h2 className="text-xl font-bold">Order Not Found</h2>
        <p className="text-muted-foreground">The order you're looking for doesn't exist or you don't have access to it.</p>
        <Button onClick={() => window.history.back()}>Go Back</Button>
      </div>
    );
  }

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
    <div className="p-4 space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-bold">Order Tracking</h1>
        <p className="text-muted-foreground">Order #{order.id}</p>
      </div>

      {/* Order Status Card */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <CardTitle>Order Status</CardTitle>
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
        <CardContent>
          <OrderTimeline order={order} />
        </CardContent>
      </Card>

      {/* Order Details */}
      <Card>
        <CardHeader>
          <CardTitle>Order Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium">Order Date</p>
              <p className="text-sm text-muted-foreground">
                {new Date(order.createdAt).toLocaleString()}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium">Total Amount</p>
              <p className="text-lg font-bold text-primary">₹{order.totalAmount}</p>
            </div>
          </div>

          {order.estimatedDelivery && (
            <div>
              <p className="text-sm font-medium">Estimated Delivery</p>
              <p className="text-sm text-muted-foreground">
                {new Date(order.estimatedDelivery).toLocaleString()}
              </p>
            </div>
          )}

          {order.deliveryAddress && (
            <div>
              <p className="text-sm font-medium">Delivery Address</p>
              <p className="text-sm text-muted-foreground">{order.deliveryAddress}</p>
            </div>
          )}

          {order.notes && (
            <div>
              <p className="text-sm font-medium">Notes</p>
              <p className="text-sm text-muted-foreground">{order.notes}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Order Items */}
      {order.items && order.items.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Order Items</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {order.items.map((item: any, index: number) => (
                <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium">Item #{index + 1}</p>
                    <p className="text-sm text-muted-foreground">
                      Quantity: {item.quantity} | Price: ₹{item.pricePerUnit}
                    </p>
                  </div>
                  <p className="font-bold">₹{item.totalPrice}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Emergency Contact */}
      {order.isEmergency && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-4">
            <h3 className="font-medium text-red-800 mb-2">🚨 Emergency Order Support</h3>
            <p className="text-sm text-red-700 mb-3">
              Need immediate assistance with your emergency order?
            </p>
            <Button variant="destructive" size="sm">
              Contact Emergency Support
            </Button>
          </CardContent>
        </Card>
      )}

      <div className="text-center">
        <Button variant="outline" onClick={() => window.history.back()}>
          Go Back
        </Button>
      </div>
    </div>
  );
}
