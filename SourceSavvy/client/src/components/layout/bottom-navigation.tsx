import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Home, Search, ShoppingBag, User } from "lucide-react";
import { useAppContext } from "@/App";

export default function BottomNavigation() {
  const [location, setLocation] = useLocation();
  const { navigationState, setNavigationState } = useAppContext();
  
  const navItems = [
    {
      id: 'home' as const,
      icon: Home,
      label: 'Home',
      path: '/',
    },
    {
      id: 'search' as const,
      icon: Search,
      label: 'Search',
      path: '/search',
    },
    {
      id: 'orders' as const,
      icon: ShoppingBag,
      label: 'Orders',
      path: '/orders',
    },
    {
      id: 'profile' as const,
      icon: User,
      label: 'Profile',
      path: '/profile',
    },
  ];

  const handleNavigation = (item: typeof navItems[0]) => {
    setNavigationState({ currentPage: item.id });
    setLocation(item.path);
  };

  return (
    <nav className="fixed bottom-0 left-1/2 transform -translate-x-1/2 w-full max-w-md bg-white border-t border-gray-200 px-4 py-2 z-30">
      <div className="flex items-center justify-around">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = navigationState.currentPage === item.id;
          
          return (
            <Button
              key={item.id}
              variant="ghost"
              className={`nav-item flex flex-col items-center space-y-1 py-2 h-auto ${
                isActive ? 'active' : ''
              }`}
              onClick={() => handleNavigation(item)}
            >
              <Icon 
                className={`h-5 w-5 ${
                  isActive ? 'text-primary' : 'text-gray-400'
                }`} 
              />
              <span 
                className={`text-xs ${
                  isActive ? 'text-primary font-medium' : 'text-gray-400'
                }`}
              >
                {item.label}
              </span>
            </Button>
          );
        })}
      </div>
    </nav>
  );
}
