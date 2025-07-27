import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Clock, Truck } from "lucide-react";

interface OrderCardProps {
  order: any;
  onClick: () => void;
}

export default function OrderCard({ order, onClick }: OrderCardProps) {
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
      pending: 'Pending',
      confirmed: 'Confirmed',
      preparing: 'Preparing',
      out_for_delivery: 'In Transit',
      delivered: 'Delivered',
      cancelled: 'Cancelled',
    };
    return texts[status] || status;
  };

  const getBorderColor = (status: string) => {
    if (status === 'out_for_delivery') return 'border-l-4 border-primary';
    if (status === 'delivered') return 'border-l-4 border-accent';
    return 'border-l-4 border-gray-300';
  };

  const getProgressWidth = (status: string) => {
    const progress: Record<string, string> = {
      pending: '25%',
      confirmed: '50%',
      preparing: '75%',
      out_for_delivery: '90%',
      delivered: '100%',
    };
    return progress[status] || '25%';
  };

  const formatItems = (items: any[]) => {
    if (!items || items.length === 0) return 'No items';
    return items.slice(0, 2).map(item => 
      `${item.quantity}${item.unit} ${item.productName}`
    ).join(', ') + (items.length > 2 ? '...' : '');
  };

  return (
    <Card 
      className={`bg-white shadow-sm hover:shadow-md transition-shadow cursor-pointer ${getBorderColor(order.status)}`}
      onClick={onClick}
    >
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="font-medium outdoor-text">#{order.orderNumber}</span>
          <Badge className={`text-xs ${getStatusColor(order.status)}`}>
            {getStatusText(order.status)}
          </Badge>
        </div>
        
        <p className="text-sm text-gray-600 mb-2">
          {order.supplier?.businessName || order.supplier?.user?.name || 'Unknown Supplier'}
        </p>
        
        <div className="flex items-center justify-between text-xs mb-2">
          <span className="text-gray-500">
            {formatItems(order.items)}
          </span>
          <span className="font-medium outdoor-text">
            ₹{parseFloat(order.totalAmount).toFixed(0)}
          </span>
        </div>

        {order.status === 'out_for_delivery' && (
          <div className="mt-3">
            <div className="flex items-center space-x-2 mb-2">
              <div className="flex-1 bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-primary h-2 rounded-full transition-all" 
                  style={{ width: getProgressWidth(order.status) }}
                />
              </div>
              <div className="flex items-center space-x-1 text-xs text-gray-500">
                <Clock className="h-3 w-3" />
                <span>ETA: 10 mins</span>
              </div>
            </div>
          </div>
        )}

        {order.status === 'delivered' && (
          <Button 
            size="sm" 
            className="w-full mt-3 bg-accent hover:bg-accent/90"
            onClick={(e) => {
              e.stopPropagation();
              // Handle rate order action
            }}
          >
            Rate Order
          </Button>
        )}

        {order.status === 'preparing' && (
          <Button 
            size="sm" 
            className="w-full mt-3 bg-accent hover:bg-accent/90"
            onClick={(e) => {
              e.stopPropagation();
              // Handle confirm pickup action
            }}
          >
            Confirm Pickup
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
