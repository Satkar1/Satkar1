import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Bell, MapPin, Edit, Utensils } from "lucide-react";

interface MobileHeaderProps {
  userType: 'vendor' | 'supplier';
  onUserTypeChange: (type: 'vendor' | 'supplier') => void;
  onShowQR: () => void;
  location: string;
  notificationCount?: number;
}

export default function MobileHeader({
  userType,
  onUserTypeChange,
  onShowQR,
  location,
  notificationCount = 3,
}: MobileHeaderProps) {
  return (
    <header className="gradient-bg text-white p-4 relative">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Utensils className="h-8 w-8" />
          <div>
            <h1 className="text-xl font-bold outdoor-text-light">KachaMaal</h1>
            <p className="text-xs opacity-90">Smart Sourcing for Street Food</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          {/* User Type Toggle */}
          <div className="bg-white/20 rounded-full p-1 flex">
            <Button
              size="sm"
              variant={userType === 'vendor' ? 'default' : 'ghost'}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                userType === 'vendor' 
                  ? 'bg-white text-primary hover:bg-white/90' 
                  : 'text-white hover:bg-white/10'
              }`}
              onClick={() => onUserTypeChange('vendor')}
            >
              Vendor
            </Button>
            <Button
              size="sm"
              variant={userType === 'supplier' ? 'default' : 'ghost'}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                userType === 'supplier' 
                  ? 'bg-white text-primary hover:bg-white/90' 
                  : 'text-white hover:bg-white/10'
              }`}
              onClick={() => onUserTypeChange('supplier')}
            >
              Supplier
            </Button>
          </div>
          
          {/* Notifications */}
          <div className="relative">
            <Button
              size="sm"
              variant="ghost"
              className="text-white hover:bg-white/10 p-2"
            >
              <Bell className="h-5 w-5" />
              {notificationCount > 0 && (
                <Badge className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center p-0">
                  {notificationCount}
                </Badge>
              )}
            </Button>
          </div>
        </div>
      </div>
      
      {/* Location Display */}
      <div className="mt-3 flex items-center space-x-2 text-sm">
        <MapPin className="h-4 w-4" />
        <span className="flex-1">{location}</span>
        <Button
          size="sm"
          variant="ghost"
          className="text-white hover:bg-white/10 p-1"
        >
          <Edit className="h-3 w-3" />
        </Button>
      </div>
    </header>
  );
}
