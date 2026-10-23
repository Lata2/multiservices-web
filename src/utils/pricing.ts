import type { PriceBreakdown, PromoCode } from '@/types/models';

export interface PromoResult {
  valid: boolean;
  discount: number;
  message: string;
}

/** Pure promo evaluation — shared by the cart UI and the (mock) backend. */
export function evaluatePromo(promo: PromoCode | undefined, subtotal: number, providerId: string, now = Date.now()): PromoResult {
  if (!promo) return { valid: false, discount: 0, message: 'This code does not exist.' };
  if (!promo.active || new Date(promo.expiresAt).getTime() < now) return { valid: false, discount: 0, message: 'This code has expired.' };
  if (promo.providerId && promo.providerId !== providerId)
    return { valid: false, discount: 0, message: 'This code is not valid for this provider.' };
  if (promo.usageCount >= promo.usageLimit) return { valid: false, discount: 0, message: 'This code has reached its usage limit.' };
  if (subtotal < promo.minOrder)
    return { valid: false, discount: 0, message: `Add items worth ₹${promo.minOrder - subtotal} more to use this code.` };

  let discount = promo.discountType === 'flat' ? promo.value : (subtotal * promo.value) / 100;
  if (promo.discountType === 'percent' && promo.maxDiscount) discount = Math.min(discount, promo.maxDiscount);
  discount = Math.min(Math.round(discount), subtotal);
  return { valid: true, discount, message: `You save ₹${discount}!` };
}

export function computePricing(args: { subtotal: number; discount?: number; visitingCharge?: number; taxPercent: number }): PriceBreakdown {
  const discount = args.discount ?? 0;
  const visitingCharge = args.visitingCharge ?? 0;
  const taxable = Math.max(args.subtotal - discount + visitingCharge, 0);
  const tax = Math.round((taxable * args.taxPercent) / 100);
  return { subtotal: args.subtotal, discount, visitingCharge, tax, total: taxable + tax };
}

export function effectivePrice(s: { price: number; discountPrice?: number }): number {
  return s.discountPrice ?? s.price;
}

export function discountPercent(s: { price: number; discountPrice?: number }): number {
  if (!s.discountPrice || s.discountPrice >= s.price) return 0;
  return Math.round(((s.price - s.discountPrice) / s.price) * 100);
}
