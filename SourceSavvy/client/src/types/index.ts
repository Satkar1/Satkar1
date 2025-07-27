export interface AppState {
  user: User | null;
  isOnline: boolean;
  activeOrders: Order[];
  nearbySuppliers: Supplier[];
}

export interface NavigationState {
  currentPage: string;
  userType: 'vendor' | 'supplier';
}

export interface User {
  id: string;
  name: string;
  phone: string;
  email?: string;
  userType: 'vendor' | 'supplier';
  vendor?: Vendor;
  supplier?: Supplier;
}

export interface Vendor {
  id: string;
  userId: string;
  stallName: string;
  foodTypes: string[];
  location: {
    latitude: number;
    longitude: number;
    address: string;
  };
}

export interface Supplier {
  id: string;
  userId: string;
  businessName: string;
  categories: string[];
  deliveryRadius: number;
  isOnline: boolean;
  location: {
    latitude: number;
    longitude: number;
    address: string;
  };
}

export interface Order {
  id: string;
  vendorId: string;
  supplierId: string;
  items: OrderItem[];
  totalAmount: number;
  status: 'pending' | 'confirmed' | 'preparing' | 'out_for_delivery' | 'delivered' | 'cancelled';
  isEmergency: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface OrderItem {
  productId: string;
  quantity: number;
  pricePerUnit: number;
}

export interface Product {
  id: string;
  supplierId: string;
  name: string;
  category: string;
  pricePerUnit: number;
  unit: string;
  stockQuantity: number;
  isAvailable: boolean;
}