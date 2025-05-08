export interface User {
  id: string;
  name: string;
  email: string;
  companyName: string;
  phone: string;
  role: 'admin' | 'user';
}

export interface Space {
  id: string;
  name: string;
  description: string;
  capacity: number;
  price: number;
  location: string;
  amenities: string[];
  images: string[];
  availability: {
    start: string;
    end: string;
  }[];
  ownerId: string;
}

export interface Reservation {
  id: string;
  spaceId: string;
  userId: string;
  startDate: string;
  endDate: string;
  status: 'pending' | 'confirmed' | 'cancelled';
  totalPrice: number;
  paymentStatus: 'pending' | 'paid' | 'refunded';
}

export interface LoginFormValues {
  email: string;
  password: string;
}

export interface RegisterFormValues {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  companyName: string;
  phone: string;
}

export interface SpaceFormValues {
  name: string;
  description: string;
  capacity: number;
  price: number;
  location: string;
  amenities: string[];
  images: File[];
  availability: {
    start: string;
    end: string;
  }[];
} 