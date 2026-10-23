import type { BadgeTone } from '@/components/ui/Badge';
import type { IconName } from '@/components/ui/Icon';
import type { BookingStatus, DeliveryTaskStatus, PaymentMethod, PayoutStatus, ProviderStatus, TicketStatus } from '@/types/models';

export const BOOKING_STATUS: Record<BookingStatus, { label: string; tone: BadgeTone; icon: IconName }> = {
  pending: { label: 'Awaiting confirmation', tone: 'warning', icon: 'clock' },
  confirmed: { label: 'Confirmed', tone: 'primary', icon: 'check-circle' },
  on_the_way: { label: 'On the way', tone: 'info', icon: 'navigate' },
  in_progress: { label: 'In progress', tone: 'highlight', icon: 'wrench' },
  completed: { label: 'Completed', tone: 'success', icon: 'check-double' },
  cancelled: { label: 'Cancelled', tone: 'danger', icon: 'x-circle' },
  rejected: { label: 'Declined', tone: 'danger', icon: 'ban' },
};

export const TASK_STATUS: Record<DeliveryTaskStatus, { label: string; tone: BadgeTone }> = {
  available: { label: 'New', tone: 'accent' },
  accepted: { label: 'Accepted', tone: 'primary' },
  picked_up: { label: 'Picked up', tone: 'info' },
  delivered: { label: 'Delivered', tone: 'success' },
  cancelled: { label: 'Cancelled', tone: 'danger' },
};

export const PROVIDER_STATUS: Record<ProviderStatus, { label: string; tone: BadgeTone }> = {
  pending: { label: 'Pending review', tone: 'warning' },
  approved: { label: 'Approved', tone: 'success' },
  rejected: { label: 'Rejected', tone: 'danger' },
  suspended: { label: 'Suspended', tone: 'neutral' },
};

export const PAYOUT_STATUS: Record<PayoutStatus, { label: string; tone: BadgeTone }> = {
  requested: { label: 'Requested', tone: 'warning' },
  approved: { label: 'Approved', tone: 'primary' },
  paid: { label: 'Paid', tone: 'success' },
  rejected: { label: 'Rejected', tone: 'danger' },
};

export const TICKET_STATUS: Record<TicketStatus, { label: string; tone: BadgeTone }> = {
  open: { label: 'Open', tone: 'warning' },
  in_progress: { label: 'In progress', tone: 'primary' },
  resolved: { label: 'Resolved', tone: 'success' },
  closed: { label: 'Closed', tone: 'neutral' },
};

export const PAYMENT_METHODS: { value: PaymentMethod; label: string; description: string; icon: IconName; gateway?: boolean }[] = [
  { value: 'upi', label: 'UPI', description: 'Google Pay, PhonePe, Paytm & more', icon: 'smartphone' },
  { value: 'card', label: 'Credit / Debit card', description: 'Visa, Mastercard, RuPay, Amex', icon: 'card' },
  { value: 'wallet', label: 'Servio Wallet', description: 'Pay instantly from your balance', icon: 'wallet' },
  { value: 'razorpay', label: 'Razorpay', description: 'Netbanking, EMI & pay later', icon: 'zap', gateway: true },
  { value: 'stripe', label: 'Stripe', description: 'International cards', icon: 'globe', gateway: true },
  { value: 'paystack', label: 'Paystack', description: 'Cards & bank transfer', icon: 'building', gateway: true },
  { value: 'flutterwave', label: 'Flutterwave', description: 'Mobile money & cards', icon: 'repeat', gateway: true },
  { value: 'cash', label: 'Pay after service', description: 'Cash or UPI to the professional', icon: 'cash' },
];

export const paymentLabel = (m: PaymentMethod) => PAYMENT_METHODS.find((p) => p.value === m)?.label ?? m;

export const CANCEL_REASONS = [
  'Change of plans',
  'Booked by mistake',
  'Found a better price',
  'Provider asked me to cancel',
  'Service no longer needed',
  'Other',
];

export const PROVIDER_REJECT_REASONS = ['Fully booked for this slot', 'Location outside service area', 'Required equipment unavailable', 'Other'];
