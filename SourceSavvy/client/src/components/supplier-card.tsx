import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Star, MapPin, Clock, Circle } from "lucide-react";

interface SupplierCardProps {
  supplier: any;
  onClick: () => void;
}

export default function SupplierCard({ supplier, onClick }: SupplierCardProps) {
  const getStatusColor = (isOnline: boolean) => {
    return isOnline ? 'text-green-500' : 'text-yellow-500';
  };

  const getStatusText = (isOnline: boolean) => {
    return isOnline ? 'Online' : 'Busy';
  };

  return (
    <Card 
      className="bg-white border border-gray-200 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
      onClick={onClick}
    >
      <CardContent className="p-4">
        <div className="flex items-start space-x-3">
          <div className="w-12 h-12 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-full flex items-center justify-center">
            <span className="text-xl">{supplier.user?.name?.[0] || 'S'}</span>
          </div>
          
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <h4 className="font-medium outdoor-text">
                {supplier.businessName || supplier.user?.name || 'Unknown Supplier'}
              </h4>
              <div className="flex items-center space-x-1">
                <Star className="h-3 w-3 text-yellow-400 fill-current" />
                <span className="text-sm outdoor-text">
                  {supplier.user?.rating || '4.5'}
                </span>
              </div>
            </div>
            
            <div className="flex items-center space-x-1 mt-1">
              <MapPin className="h-3 w-3 text-gray-500" />
              <p className="text-xs text-gray-600">
                {supplier.distance ? `${supplier.distance}km • ` : ''}
                {supplier.user?.address || 'Location not available'}
              </p>
            </div>
            
            <div className="flex items-center justify-between mt-2">
              <Badge 
                variant="secondary" 
                className={`text-xs ${
                  supplier.isOnline 
                    ? 'bg-green-100 text-green-700' 
                    : 'bg-yellow-100 text-yellow-700'
                }`}
              >
                <Circle className={`h-2 w-2 mr-1 fill-current ${getStatusColor(supplier.isOnline)}`} />
                {getStatusText(supplier.isOnline)}
              </Badge>
              
              <div className="flex items-center space-x-1 text-xs text-gray-500">
                <Clock className="h-3 w-3" />
                <span>
                  Delivers in {supplier.avgDeliveryTime || 25} mins
                </span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
