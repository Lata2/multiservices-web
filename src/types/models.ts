/**
 * Domain models. These mirror the shape the future REST API should return.
 * Keep them backend-agnostic: no UI-only fields.
 */

export type ID = string;
export type ISODate = string;

export type Role = 'customer' | 'provider' | 'delivery' | 'admin';
export type AccountStatus = 'active' | 'pending' | 'blocked' | 'rejected';

export interface User {
  id: ID;
  role: Role;
  name: string;
  email: string;
  phone: string;
  avatar?: string;
  status: AccountStatus;
  city?: string;
  createdAt: ISODate;
  /** Linked entity for non-customer roles (provider id / delivery partner id). */
  profileId?: ID;
  referralCode?: string;
}

export interface City {
  id: ID;
  name: string;
  state: string;
  active: boolean;
}

export interface Category {
  id: ID;
  name: string;
  icon: string; // Ionicons glyph name
  parentId?: ID | null;
  description?: string;
  image?: string;
  active: boolean;
  serviceCount: number;
  commissionRate: number; // percent taken by platform
}

export type ProviderType = 'individual' | 'organization';
export type ProviderStatus = 'pending' | 'approved' | 'rejected' | 'suspended';

export interface WeeklyHours {
  day: number; // 0 = Sunday
  open: boolean;
  start: string; // "09:00"
  end: string; // "18:00"
}

export interface Provider {
  id: ID;
  userId: ID;
  businessName: string;
  ownerName: string;
  type: ProviderType;
  avatar: string;
  cover: string;
  about: string;
  city: string;
  address: string;
  phone: string;
  email: string;
  categoryIds: ID[];
  rating: number;
  reviewCount: number;
  jobsCompleted: number;
  yearsExperience: number;
  distanceKm: number;
  verified: boolean;
  status: ProviderStatus;
  commissionRate: number;
  startingPrice: number;
  visitingCharge: number;
  hours: WeeklyHours[];
  holidays: ISODate[];
  slotDurationMin: number;
  advanceBookingDays: number;
  documents: ProviderDocument[];
  bank?: BankDetails;
  joinedAt: ISODate;
}

export interface ProviderDocument {
  id: ID;
  name: string;
  status: 'verified' | 'pending' | 'rejected' | 'missing';
}

export interface BankDetails {
  accountName: string;
  accountNumber: string;
  ifsc: string;
  bankName: string;
}

export interface Service {
  id: ID;
  providerId: ID;
  categoryId: ID;
  subcategoryId?: ID;
  title: string;
  description: string;
  image: string;
  gallery: string[];
  price: number;
  discountPrice?: number;
  durationMin: number;
  membersRequired: number;
  rating: number;
  reviewCount: number;
  includes: string[];
  excludes: string[];
  tags: string[];
  active: boolean;
  /** Service involves item pickup / drop (laundry, repair at workshop) → creates delivery task. */
  requiresPickup: boolean;
  maxQuantity: number;
  cancellable: boolean;
  createdAt: ISODate;
}

export interface Address {
  id: ID;
  userId: ID;
  label: 'Home' | 'Work' | 'Other';
  contactName: string;
  phone: string;
  line1: string;
  line2?: string;
  landmark?: string;
  city: string;
  state: string;
  pincode: string;
  isDefault: boolean;
  lat?: number;
  lng?: number;
}

export interface CartItem {
  serviceId: ID;
  quantity: number;
}

export interface TimeSlot {
  time: string; // "09:00"
  label: string; // "9:00 AM"
  available: boolean;
}

export type BookingStatus =
  | 'pending'
  | 'confirmed'
  | 'on_the_way'
  | 'in_progress'
  | 'completed'
  | 'cancelled'
  | 'rejected';

export type PaymentMethod =
  | 'card'
  | 'upi'
  | 'wallet'
  | 'cash'
  | 'razorpay'
  | 'stripe'
  | 'paystack'
  | 'flutterwave';

export type PaymentStatus = 'pending' | 'paid' | 'refunded' | 'failed';

export interface BookingItem {
  serviceId: ID;
  categoryId: ID;
  title: string;
  image: string;
  unitPrice: number;
  quantity: number;
  durationMin: number;
}

export interface PriceBreakdown {
  subtotal: number;
  discount: number;
  visitingCharge: number;
  tax: number;
  total: number;
}

export interface BookingEvent {
  status: BookingStatus | 'rescheduled' | 'payment';
  at: ISODate;
  note?: string;
}

export interface Booking {
  id: ID;
  code: string;
  customerId: ID;
  customerName: string;
  customerPhone: string;
  providerId: ID;
  providerName: string;
  items: BookingItem[];
  address: Address;
  scheduledDate: string; // YYYY-MM-DD
  slot: string; // "10:00"
  status: BookingStatus;
  payment: { method: PaymentMethod; status: PaymentStatus; transactionId?: string };
  pricing: PriceBreakdown;
  promoCode?: string;
  notes?: string;
  startOtp: string;
  timeline: BookingEvent[];
  cancelReason?: string;
  rescheduleCount: number;
  reviewId?: ID;
  deliveryTaskId?: ID;
  createdAt: ISODate;
}

export type DeliveryTaskType = 'pickup' | 'drop' | 'parts';
export type DeliveryTaskStatus = 'available' | 'accepted' | 'picked_up' | 'delivered' | 'cancelled';

export interface DeliveryStop {
  name: string;
  phone: string;
  address: string;
}

export interface DeliveryTask {
  id: ID;
  bookingId: ID;
  bookingCode: string;
  type: DeliveryTaskType;
  status: DeliveryTaskStatus;
  partnerId?: ID;
  pickup: DeliveryStop;
  drop: DeliveryStop;
  itemsSummary: string;
  distanceKm: number;
  fee: number;
  codAmount: number;
  otp: string;
  scheduledFor: ISODate;
  createdAt: ISODate;
  updatedAt: ISODate;
}

export interface DeliveryPartner {
  id: ID;
  userId: ID;
  name: string;
  phone: string;
  avatar: string;
  vehicleType: 'bike' | 'scooter' | 'car' | 'van';
  vehicleNumber: string;
  licenseNumber: string;
  rating: number;
  completedTasks: number;
  online: boolean;
  status: ProviderStatus;
  city: string;
  joinedAt: ISODate;
}

export interface Review {
  id: ID;
  bookingId: ID;
  serviceId: ID;
  providerId: ID;
  customerId: ID;
  customerName: string;
  customerAvatar?: string;
  rating: number;
  comment: string;
  createdAt: ISODate;
  reply?: { text: string; at: ISODate };
}

export type NotificationType = 'booking' | 'promo' | 'payment' | 'system' | 'task' | 'review';

export interface AppNotification {
  id: ID;
  userId: ID;
  type: NotificationType;
  title: string;
  body: string;
  read: boolean;
  createdAt: ISODate;
  /** In-app route to open when tapped. */
  href?: string;
}

export interface PromoCode {
  id: ID;
  code: string;
  title: string;
  description: string;
  discountType: 'percent' | 'flat';
  value: number;
  minOrder: number;
  maxDiscount?: number;
  providerId?: ID | null; // null = platform-wide
  expiresAt: ISODate;
  active: boolean;
  usageCount: number;
  usageLimit: number;
}

export interface Banner {
  id: ID;
  title: string;
  subtitle: string;
  cta: string;
  image: string;
  categoryId?: ID;
  active: boolean;
}

export type TicketStatus = 'open' | 'in_progress' | 'resolved' | 'closed';

export interface TicketMessage {
  id: ID;
  from: 'user' | 'support';
  text: string;
  at: ISODate;
}

export interface SupportTicket {
  id: ID;
  userId: ID;
  userName: string;
  userRole: Role;
  subject: string;
  category: 'booking' | 'payment' | 'account' | 'provider' | 'other';
  priority: 'low' | 'medium' | 'high';
  status: TicketStatus;
  bookingId?: ID;
  messages: TicketMessage[];
  createdAt: ISODate;
  updatedAt: ISODate;
}

export interface WalletTransaction {
  id: ID;
  userId: ID;
  type: 'credit' | 'debit';
  amount: number;
  title: string;
  reference?: string;
  createdAt: ISODate;
}

export type PayoutStatus = 'requested' | 'approved' | 'paid' | 'rejected';

export interface Payout {
  id: ID;
  payeeId: ID; // provider or delivery partner id
  payeeName: string;
  payeeRole: 'provider' | 'delivery';
  amount: number;
  status: PayoutStatus;
  requestedAt: ISODate;
  processedAt?: ISODate;
  note?: string;
}

export interface ChatThread {
  id: ID;
  bookingId?: ID;
  customerId: ID;
  providerId: ID;
  title: string;
  avatar: string;
  lastMessage: string;
  updatedAt: ISODate;
  unread: number;
}

export interface ChatMessage {
  id: ID;
  threadId: ID;
  senderId: ID;
  text: string;
  at: ISODate;
}

export interface Faq {
  id: ID;
  question: string;
  answer: string;
  audience: Role | 'all';
}

export interface PlatformSettings {
  taxPercent: number;
  defaultCommission: number;
  currency: string;
  currencySymbol: string;
  minPayout: number;
  cancellationWindowHours: number;
  supportEmail: string;
  supportPhone: string;
  paymentGateways: Record<Exclude<PaymentMethod, 'wallet' | 'cash'>, boolean>;
  cashOnService: boolean;
  maintenanceMode: boolean;
}

export interface EarningsSummary {
  total: number;
  thisMonth: number;
  pendingPayout: number;
  withdrawn: number;
  commissionPaid: number;
  series: { label: string; value: number }[];
}
