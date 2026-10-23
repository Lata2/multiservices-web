import type { IconName } from '@/components/ui/Icon';
import type { Role } from '@/types/models';

export const ROLES: Record<Role, { title: string; short: string; description: string; icon: IconName; canSignup: boolean }> = {
  customer: { title: 'Customer', short: 'Customer', description: 'Book trusted home services in minutes', icon: 'user', canSignup: true },
  provider: { title: 'Service Provider', short: 'Provider', description: 'Grow your business and manage bookings', icon: 'briefcase', canSignup: true },
  delivery: { title: 'Delivery Partner', short: 'Delivery', description: 'Earn by handling pickups & drops', icon: 'bike', canSignup: true },
  admin: { title: 'Administrator', short: 'Admin', description: 'Manage the marketplace & operations', icon: 'shield-check', canSignup: false },
};

export const ROLE_ORDER: Role[] = ['customer', 'provider', 'delivery', 'admin'];
