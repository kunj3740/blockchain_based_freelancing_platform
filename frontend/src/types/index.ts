// types/user.ts
export interface PaymentMethod {
    type: 'credit_card' | 'paypal' | 'bank_account';
    details: Record<string, any>;
    isDefault: boolean;
  }
  
  export interface Order {
    _id: string;
    gigTitle: string;
    amount: number;
    status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
    createdAt: string;
  }
  
  export interface ClientUser {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber: string;
    country: string;
    city: string;
    address: string;
    avatar: string;
    orders: Order[];
    favorites: any[];
    paymentMethods: PaymentMethod[];
  }
  
  export interface Education {
    institution: string;
    degree: string;
    field: string;
    startDate: Date;
    endDate: Date;
    current: boolean;
  }
  
  export interface Experience {
    title: string;
    company: string;
    location: string;
    startDate: Date;
    endDate: Date;
    current: boolean;
    description: string;
  }
  
  export interface Portfolio {
    title: string;
    description: string;
    images: string[];
    link: string;
    category: string;
  }
  
  export interface FreelancerUser {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    professionalTitle: string;
    description: string;
    skills: string[];
    avatar: string;
    hourlyRate: number;
    metamaskid : string;
    country: string;
    timezone: string;
    portfolio: Portfolio[];
    education: Education[];
    experience: Experience[];
    rating: {
      average: number;
      totalReviews: number;
    };
    completedProjects: number;
    accountLevel: 'Beginner' | 'Level 1' | 'Level 2' | 'Top Rated';
    availability: {
      status: 'Available' | 'Partially Available' | 'Not Available';
      hoursPerWeek: number;
    };
  }