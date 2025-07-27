import { useState } from "react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Search, MapPin, Star, Clock, TrendingUp, Mic } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function Home() {
  const [, setLocation] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");

  // Mock stats for demo
  const stats = {
    activeOrders: 5,
    nearbySuppliers: 12,
    todaysSavings: 450,
  };

  const handleSearch = (query: string) => {
    if (query.trim()) {
      setLocation(`/search?q=${encodeURIComponent(query)}`);
    }
  };

  const handleCategorySelect = (category: string) => {
    setLocation(`/search?category=${encodeURIComponent(category)}`);
  };

  const handleVendorLogin = () => {
    setLocation('/vendor');
  };

  const handleSupplierLogin = () => {
    setLocation('/supplier');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-red-50 to-yellow-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-orange-500 via-red-500 to-pink-500 p-6 text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <div className="w-full h-full bg-white/10 rounded-full transform -translate-x-1/2 -translate-y-1/2 scale-150"></div>
        </div>
        <div className="max-w-md mx-auto relative z-10">
          <div className="flex items-center space-x-3 mb-2">
            <div className="text-3xl animate-float">🍛</div>
            <h1 className="text-3xl font-bold">KachaMaal</h1>
          </div>
          <p className="text-orange-100 text-lg">Smart sourcing for street food vendors</p>
          <div className="flex items-center space-x-2 mt-2">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            <span className="text-sm text-green-200">Online & Ready</span>
          </div>
        </div>
      </div>

      <div className="max-w-md mx-auto p-4 space-y-6">
        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-3">
          <Card className="glass-card hover:shadow-xl transition-all duration-300 animate-pulse-glow">
            <CardContent className="p-3 text-center">
              <div className="text-2xl font-bold text-orange-600 mb-1">{stats.activeOrders}</div>
              <div className="text-xs text-gray-600">Active Orders</div>
              <div className="w-full bg-orange-100 rounded-full h-1 mt-2">
                <div className="bg-orange-500 h-1 rounded-full w-3/4"></div>
              </div>
            </CardContent>
          </Card>
          <Card className="glass-card hover:shadow-xl transition-all duration-300">
            <CardContent className="p-3 text-center">
              <div className="text-2xl font-bold text-green-600 mb-1">{stats.nearbySuppliers}</div>
              <div className="text-xs text-gray-600">Nearby Suppliers</div>
              <div className="w-full bg-green-100 rounded-full h-1 mt-2">
                <div className="bg-green-500 h-1 rounded-full w-4/5"></div>
              </div>
            </CardContent>
          </Card>
          <Card className="glass-card hover:shadow-xl transition-all duration-300">
            <CardContent className="p-3 text-center">
              <div className="text-2xl font-bold text-blue-600 mb-1">₹{stats.todaysSavings}</div>
              <div className="text-xs text-gray-600">Today's Savings</div>
              <div className="w-full bg-blue-100 rounded-full h-1 mt-2">
                <div className="bg-blue-500 h-1 rounded-full w-2/3"></div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-orange-400 to-red-400 rounded-lg blur opacity-20"></div>
          <div className="relative bg-white rounded-lg shadow-lg">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <Input
              placeholder="🔍 Search for fresh ingredients..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch(searchQuery)}
              className="pl-12 pr-14 h-12 text-lg border-0 focus:ring-2 focus:ring-orange-400"
            />
            <Button
              size="sm"
              className="absolute right-2 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600"
              onClick={() => handleSearch(searchQuery)}
            >
              <Mic className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Category Grid */}
        <div>
          <h2 className="text-xl font-bold mb-4 gradient-text">Popular Categories</h2>
          <div className="grid grid-cols-2 gap-4">
            {[
              { name: "Vegetables", icon: "🥬", color: "bg-gradient-to-br from-green-100 to-green-200 text-green-800", accent: "border-green-300" },
              { name: "Spices", icon: "🌶️", color: "bg-gradient-to-br from-red-100 to-red-200 text-red-800", accent: "border-red-300" },
              { name: "Grains", icon: "🌾", color: "bg-gradient-to-br from-yellow-100 to-yellow-200 text-yellow-800", accent: "border-yellow-300" },
              { name: "Dairy", icon: "🥛", color: "bg-gradient-to-br from-blue-100 to-blue-200 text-blue-800", accent: "border-blue-300" },
              { name: "Oil", icon: "🫗", color: "bg-gradient-to-br from-orange-100 to-orange-200 text-orange-800", accent: "border-orange-300" },
              { name: "Snacks", icon: "🥨", color: "bg-gradient-to-br from-purple-100 to-purple-200 text-purple-800", accent: "border-purple-300" },
            ].map((category) => (
              <Card 
                key={category.name} 
                className={`cursor-pointer hover:shadow-xl hover:scale-105 transition-all duration-300 border-2 ${category.accent} relative overflow-hidden`}
                onClick={() => handleCategorySelect(category.name)}
              >
                <div className="absolute top-0 right-0 w-20 h-20 bg-white/20 rounded-full -translate-y-10 translate-x-10"></div>
                <CardContent className={`p-4 text-center ${category.color} relative z-10`}>
                  <div className="text-3xl mb-2 animate-bounce">{category.icon}</div>
                  <div className="font-semibold text-sm">{category.name}</div>
                  <Badge variant="secondary" className="mt-2 bg-white/50 backdrop-blur-sm">
                    Available
                  </Badge>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold gradient-text">Quick Access</h2>
          
          <Card className="cursor-pointer hover:shadow-xl hover:scale-105 transition-all duration-300 glass-card" onClick={handleVendorLogin}>
            <CardContent className="p-5">
              <div className="flex items-center space-x-4">
                <div className="bg-gradient-to-br from-orange-400 to-orange-600 p-4 rounded-xl shadow-lg">
                  <TrendingUp className="h-6 w-6 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-lg">Vendor Dashboard</h3>
                  <p className="text-sm text-gray-600">Manage orders and find suppliers</p>
                  <div className="flex items-center space-x-2 mt-1">
                    <Star className="h-4 w-4 text-yellow-500 fill-current" />
                    <span className="text-xs text-gray-500">Trusted by 1000+ vendors</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:shadow-xl hover:scale-105 transition-all duration-300 glass-card" onClick={handleSupplierLogin}>
            <CardContent className="p-5">
              <div className="flex items-center space-x-4">
                <div className="bg-gradient-to-br from-green-400 to-green-600 p-4 rounded-xl shadow-lg">
                  <MapPin className="h-6 w-6 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-lg">Supplier Dashboard</h3>
                  <p className="text-sm text-gray-600">Manage inventory and orders</p>
                  <div className="flex items-center space-x-2 mt-1">
                    <Star className="h-4 w-4 text-yellow-500 fill-current" />
                    <span className="text-xs text-gray-500">500+ active suppliers</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card 
            className="bg-gradient-to-r from-red-500 via-orange-500 to-yellow-500 text-white cursor-pointer hover:shadow-xl hover:scale-105 transition-all duration-300 animate-pulse-glow"
            onClick={() => setLocation('/emergency')}
          >
            <CardContent className="p-5 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16"></div>
              <div className="flex items-center space-x-4 relative z-10">
                <div className="bg-white/20 p-4 rounded-xl backdrop-blur-sm">
                  <Clock className="h-6 w-6" />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-lg">🚨 Emergency Order</h3>
                  <p className="text-sm text-orange-100">Get supplies in 30 minutes</p>
                  <div className="flex items-center space-x-2 mt-1">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                    <span className="text-xs">24/7 Available</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Footer */}
        <div className="text-center py-8">
          <div className="bg-gradient-to-r from-orange-100 to-red-100 rounded-xl p-6 mb-4">
            <div className="text-4xl mb-2">🇮🇳</div>
            <h3 className="font-bold text-lg gradient-text">Made for Indian Street Food Vendors</h3>
            <p className="text-gray-600 mt-2">Connecting vendors with quality suppliers</p>
            <div className="flex justify-center space-x-4 mt-4 text-sm text-gray-500">
              <span>🌟 4.8/5 Rating</span>
              <span>🚀 1M+ Orders</span>
              <span>⚡ 30min Delivery</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}