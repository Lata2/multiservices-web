import { describe, it, expect } from 'vitest';
import type { PromoCode } from '@/types/models';
import { computePricing, discountPercent, effectivePrice, evaluatePromo } from '@/utils/pricing';

const base: PromoCode = {
  id: 'p',
  code: 'TEST20',
  title: '',
  description: '',
  discountType: 'percent',
  value: 20,
  minOrder: 500,
  maxDiscount: 300,
  providerId: null,
  expiresAt: new Date(Date.now() + 86_400_000).toISOString(),
  active: true,
  usageCount: 0,
  usageLimit: 10,
};

describe('evaluatePromo', () => {
  it('applies a capped percentage discount', () => {
    expect(evaluatePromo(base, 1000, 'prov_1')).toMatchObject({ valid: true, discount: 200 });
    expect(evaluatePromo(base, 5000, 'prov_1')).toMatchObject({ valid: true, discount: 300 });
  });

  it('applies flat discounts but never more than the subtotal', () => {
    expect(evaluatePromo({ ...base, discountType: 'flat', value: 800, minOrder: 0 }, 600, 'prov_1').discount).toBe(600);
  });

  it('rejects unknown, expired, inactive, wrong provider and below-minimum codes', () => {
    expect(evaluatePromo(undefined, 1000, 'x').valid).toBe(false);
    expect(evaluatePromo({ ...base, expiresAt: new Date(Date.now() - 1000).toISOString() }, 1000, 'x').message).toMatch(/expired/);
    expect(evaluatePromo({ ...base, active: false }, 1000, 'x').valid).toBe(false);
    expect(evaluatePromo({ ...base, providerId: 'prov_2' }, 1000, 'prov_1').message).toMatch(/not valid/);
    expect(evaluatePromo(base, 100, 'x').message).toMatch(/more to use/);
    expect(evaluatePromo({ ...base, usageCount: 10 }, 1000, 'x').message).toMatch(/limit/);
  });
});

describe('computePricing', () => {
  it('computes tax on discounted subtotal plus visiting charge', () => {
    expect(computePricing({ subtotal: 1000, discount: 200, visitingCharge: 100, taxPercent: 18 })).toEqual({
      subtotal: 1000,
      discount: 200,
      visitingCharge: 100,
      tax: 162,
      total: 1062,
    });
  });
});

describe('price helpers', () => {
  it('derives effective price and discount percent', () => {
    expect(effectivePrice({ price: 999, discountPrice: 799 })).toBe(799);
    expect(effectivePrice({ price: 999 })).toBe(999);
    expect(discountPercent({ price: 1000, discountPrice: 750 })).toBe(25);
    expect(discountPercent({ price: 1000 })).toBe(0);
  });
});
