import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Search, Filter, MapPin, Star, Clock, ArrowLeft } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function SearchPage() {
  const [, setLocation] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [category, setCategory] = useState("");
  const [sortBy, setSortBy] = useState("price");

  // Extract query parameters from URL
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const queryParam = urlParams.get('q');
    const categoryParam = urlParams.get('category');
    
    if (queryParam) setSearchQuery(queryParam);
    if (categoryParam) setCategory(categoryParam);
  }, []);

  // Mock search results - in production, this would come from API
  const mockResults = [
    {
      id: "1",
      name: "Fresh Tomatoes",
      supplier: "Raj Vegetable Mart",
      price: 30,
      unit: "kg",
      rating: 4.5,
      distance: "1.2 km",
      image: "🍅",
      category: "Vegetables",
      availability: "In Stock"
    },
    {
      id: "2",
      name: "Basmati Rice",
      supplier: "Grain World",
      price: 80,
      unit: "kg",
      rating: 4.8,
      distance: "2.1 km",
      image: "🌾",
      category: "Grains",
      availability: "In Stock"
    },
    {
      id: "3",
      name: "Red Chili Powder",
      supplier: "Spice Palace",
      price: 200,
      unit: "kg",
      rating: 4.6,
      distance: "0.8 km",
      image: "🌶️",
      category: "Spices",
      availability: "Limited"
    },
    {
      id: "4",
      name: "Cooking Oil",
      supplier: "Oil Express",
      price: 120,
      unit: "liter",
      rating: 4.3,
      distance: "1.5 km",
      image: "🫗",
      category: "Oil",
      availability: "In Stock"
    }
  ];

  const filteredResults = mockResults.filter(item => {
    const matchesQuery = !searchQuery || item.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = !category || item.category === category;
    return matchesQuery && matchesCategory;
  });

  const sortedResults = [...filteredResults].sort((a, b) => {
    switch (sortBy) {
      case "price":
        return a.price - b.price;
      case "rating":
        return b.rating - a.rating;
      case "distance":
        return parseFloat(a.distance) - parseFloat(b.distance);
      default:
        return 0;
    }
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-orange-500 to-red-500 p-4 text-white sticky top-0 z-10">
        <div className="max-w-md mx-auto">
          <div className="flex items-center space-x-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setLocation('/')}
              className="text-white hover:bg-white/20 p-2"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="flex-1">
              <h1 className="text-xl font-bold">Search Results</h1>
              <p className="text-sm text-orange-100">
                {sortedResults.length} products found
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-md mx-auto p-4 space-y-4">
        {/* Search and Filter */}
        <div className="space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <div className="flex space-x-2">
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger className="flex-1">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Categories</SelectItem>
                <SelectItem value="Vegetables">Vegetables</SelectItem>
                <SelectItem value="Spices">Spices</SelectItem>
                <SelectItem value="Grains">Grains</SelectItem>
                <SelectItem value="Oil">Oil</SelectItem>
                <SelectItem value="Dairy">Dairy</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="flex-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="price">Price: Low to High</SelectItem>
                <SelectItem value="rating">Rating: High to Low</SelectItem>
                <SelectItem value="distance">Distance: Near to Far</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Results */}
        <div className="space-y-3">
          {sortedResults.map((item) => (
            <Card key={item.id} className="hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="p-4">
                <div className="flex items-start space-x-3">
                  <div className="text-3xl">{item.image}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-semibold text-gray-900 truncate">
                          {item.name}
                        </h3>
                        <p className="text-sm text-gray-600">{item.supplier}</p>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-lg text-green-600">
                          ₹{item.price}/{item.unit}
                        </div>
                        <Badge 
                          variant={item.availability === "In Stock" ? "default" : "secondary"}
                          className="text-xs"
                        >
                          {item.availability}
                        </Badge>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                      <div className="flex items-center space-x-1">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        <span>{item.rating}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <MapPin className="h-4 w-4" />
                        <span>{item.distance}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Clock className="h-4 w-4" />
                        <span>30 min</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="flex space-x-2 mt-3">
                  <Button size="sm" className="flex-1">
                    Add to Cart
                  </Button>
                  <Button size="sm" variant="outline" className="flex-1">
                    Quick Order
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {sortedResults.length === 0 && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-lg font-semibold text-gray-900">No results found</h3>
            <p className="text-gray-600 mt-2">
              Try adjusting your search terms or filters
            </p>
            <Button 
              onClick={() => setLocation('/')}
              className="mt-4"
            >
              Back to Home
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}