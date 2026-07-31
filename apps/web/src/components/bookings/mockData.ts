import { addDays, subDays } from 'date-fns';

export type BookingPhase = 'pending' | 'confirmed' | 'active' | 'completed';
export type DeliveryType = 'pickup' | 'delivery';

export interface MockBooking {
  id: string;
  listing: {
    title: string;
    image: string;
    dailyRate: number;
    area: string;
    deliveryAvailable: boolean;
  };
  counterpart: {
    name: string;
    avatar: string;
    rating: number;
    phone: string;
    joined: string;
    completedRentals: number;
  };
  phase: BookingPhase;
  startDate: Date;
  endDate: Date;
  totalDays: number;
  deliveryType: DeliveryType;
  financials: {
    rentTotal: number;
    deliveryFee: number;
    securityDeposit: number;
  };
  rules: string[];
}

const today = new Date();

export const mockRenterBookings: MockBooking[] = [
  {
    id: 'b1',
    listing: {
      title: 'DSLR Camera Kit (Canon 90D)',
      image: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&q=80&w=200&h=200',
      dailyRate: 800,
      area: 'Gulberg',
      deliveryAvailable: true,
    },
    counterpart: {
      name: 'Ali Raza',
      avatar: 'https://i.pravatar.cc/150?u=ali',
      rating: 4.9,
      phone: '0321-4567890',
      joined: 'Apr 2026',
      completedRentals: 12,
    },
    phase: 'active',
    startDate: subDays(today, 1),
    endDate: addDays(today, 1), // 1 day left
    totalDays: 3,
    deliveryType: 'pickup',
    financials: {
      rentTotal: 2400,
      deliveryFee: 0,
      securityDeposit: 1500,
    },
    rules: ['Do not use in rain', 'Return with fully charged battery'],
  },
  {
    id: 'b2',
    listing: {
      title: 'Portable Power Station',
      image: 'https://images.unsplash.com/photo-1582214631379-38b413693e50?auto=format&fit=crop&q=80&w=200&h=200',
      dailyRate: 1500,
      area: 'DHA Phase 5',
      deliveryAvailable: false,
    },
    counterpart: {
      name: 'Zainab B.',
      avatar: 'https://i.pravatar.cc/150?u=zainab',
      rating: 5.0,
      phone: '0300-1112222',
      joined: 'Jan 2026',
      completedRentals: 4,
    },
    phase: 'pending',
    startDate: addDays(today, 5),
    endDate: addDays(today, 7),
    totalDays: 3,
    deliveryType: 'pickup',
    financials: {
      rentTotal: 4500,
      deliveryFee: 0,
      securityDeposit: 0,
    },
    rules: ['Handle with care'],
  },
  {
    id: 'b3',
    listing: {
      title: 'Party JBL Speaker 1000W',
      image: 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?auto=format&fit=crop&q=80&w=200&h=200',
      dailyRate: 2000,
      area: 'Johar Town',
      deliveryAvailable: true,
    },
    counterpart: {
      name: 'Usman T.',
      avatar: 'https://i.pravatar.cc/150?u=usman',
      rating: 4.7,
      phone: '0333-9998888',
      joined: 'Nov 2025',
      completedRentals: 28,
    },
    phase: 'confirmed',
    startDate: addDays(today, 2),
    endDate: addDays(today, 3),
    totalDays: 2,
    deliveryType: 'delivery',
    financials: {
      rentTotal: 4000,
      deliveryFee: 500,
      securityDeposit: 2000,
    },
    rules: ['No liquid spills', 'Return cables neatly tied'],
  }
];

export const mockLenderBookings: MockBooking[] = [
  {
    id: 'l1',
    listing: {
      title: 'DJI Mini 3 Pro Drone',
      image: 'https://images.unsplash.com/photo-1508614589041-895b88991e3e?auto=format&fit=crop&q=80&w=200&h=200',
      dailyRate: 2500,
      area: 'Gulberg',
      deliveryAvailable: true,
    },
    counterpart: {
      name: 'Hassan Ali',
      avatar: 'https://i.pravatar.cc/150?u=hassan',
      rating: 4.8,
      phone: '0345-6667777',
      joined: 'May 2026',
      completedRentals: 6,
    },
    phase: 'pending',
    startDate: addDays(today, 3),
    endDate: addDays(today, 5),
    totalDays: 3,
    deliveryType: 'pickup',
    financials: {
      rentTotal: 7500,
      deliveryFee: 0,
      securityDeposit: 5000,
    },
    rules: ['Only fly in permitted areas', 'Do not fly in high winds'],
  },
  {
    id: 'l2',
    listing: {
      title: 'Camping Tent (4 Person)',
      image: 'https://images.unsplash.com/photo-1523987355523-c7b5b0dd90a7?auto=format&fit=crop&q=80&w=200&h=200',
      dailyRate: 600,
      area: 'Model Town',
      deliveryAvailable: false,
    },
    counterpart: {
      name: 'Sara K.',
      avatar: 'https://i.pravatar.cc/150?u=sara',
      rating: 5.0,
      phone: '0301-2223333',
      joined: 'Dec 2025',
      completedRentals: 15,
    },
    phase: 'active',
    startDate: subDays(today, 2),
    endDate: addDays(today, 1),
    totalDays: 4,
    deliveryType: 'pickup',
    financials: {
      rentTotal: 2400,
      deliveryFee: 0,
      securityDeposit: 1000,
    },
    rules: ['Dry completely before packing', 'Clean inner lining'],
  }
];
