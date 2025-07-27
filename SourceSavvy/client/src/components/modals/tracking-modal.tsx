import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Phone, MapPin, Clock, CheckCircle, Circle } from "lucide-react";

interface TrackingModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: any;
}

export default function TrackingModal({ isOpen, onClose, order }: TrackingModalProps) {
  if (!order) return null;

  const trackingSteps = [
    {
      id: 'confirmed',
      title: 'Order Confirmed',
      time: '2:30 PM',
      completed: true,
    },
    {
      id: 'preparing',
      title: 'Preparing Order',
      time: '2:45 PM',
      completed: true,
    },
    {
      id: 'out_for_delivery',
      title: 'Out for Delivery',
      time: '3:10 PM',
      completed: order.status === 'out_for_delivery' || order.status === 'delivered',
      current: order.status === 'out_for_delivery',
    },
    {
      id: 'delivered',
      title: 'Delivered',
      time: order.status === 'delivered' ? '3:25 PM' : 'ETA: 3:25 PM',
      completed: order.status === 'delivered',
    },
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md max-h-96 overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle>Track Order #{order.orderNumber}</DialogTitle>
            <Button variant="ghost" size="sm" onClick={onClose}>
              ×
            </Button>
          </div>
        </DialogHeader>
        
        {/* Delivery map placeholder */}
        <div className="bg-gray-100 rounded-lg p-4 mb-4 h-32 flex items-center justify-center">
          <div className="text-center">
            <MapPin className="h-8 w-8 text-gray-400 mx-auto mb-2" />
            <p className="text-sm text-gray-600">Real-time tracking map</p>
            <p className="text-xs text-gray-500">GPS location updates</p>
          </div>
        </div>
        
        {/* Order status timeline */}
        <div className="space-y-4">
          {trackingSteps.map((step, index) => (
            <div key={step.id} className="flex items-center space-x-3">
              <div className="relative">
                {step.completed ? (
                  <CheckCircle className="w-5 h-5 text-green-500 fill-current" />
                ) : step.current ? (
                  <Circle className="w-5 h-5 text-primary fill-current pulse-ring" />
                ) : (
                  <Circle className="w-5 h-5 text-gray-300" />
                )}
                
                {index < trackingSteps.length - 1 && (
                  <div className={`absolute top-5 left-2 w-0.5 h-8 ${
                    step.completed ? 'bg-green-500' : 'bg-gray-300'
                  }`} />
                )}
              </div>
              
              <div className="flex-1">
                <p className={`text-sm font-medium ${
                  step.completed || step.current ? 'text-gray-900' : 'text-gray-400'
                }`}>
                  {step.title}
                </p>
                <p className={`text-xs ${
                  step.completed || step.current ? 'text-gray-500' : 'text-gray-400'
                }`}>
                  {step.time}
                </p>
              </div>
            </div>
          ))}
        </div>
        
        {/* Contact delivery person */}
        {order.status === 'out_for_delivery' && (
          <div className="mt-6 pt-4 border-t border-gray-200">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-full flex items-center justify-center">
                <span className="text-sm font-medium">RK</span>
              </div>
              
              <div className="flex-1">
                <p className="text-sm font-medium">Rajesh Kumar</p>
                <p className="text-xs text-gray-500">Delivery Partner</p>
              </div>
              
              <Button 
                size="sm"
                className="bg-green-500 hover:bg-green-600 p-2"
              >
                <Phone className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
