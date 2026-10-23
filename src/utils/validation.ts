import { z } from 'zod';

/** Reusable field rules — keep messages user-friendly. */
export const rules = {
  name: z.string().trim().min(2, 'Enter at least 2 characters').max(60, 'Name is too long'),
  email: z.string().trim().min(1, 'Email is required').email('Enter a valid email address'),
  phone: z
    .string()
    .trim()
    .min(1, 'Phone number is required')
    .refine((v) => v.replace(/\D/g, '').length >= 10 && v.replace(/\D/g, '').length <= 13, 'Enter a valid phone number'),
  password: z
    .string()
    .min(8, 'Use at least 8 characters')
    .regex(/[A-Za-z]/, 'Include at least one letter')
    .regex(/\d/, 'Include at least one number'),
  loginPassword: z.string().min(1, 'Password is required'),
  otp: z.string().regex(/^\d{6}$/, 'Enter the 6-digit code'),
  pincode: z.string().trim().regex(/^\d{6}$/, 'Enter a valid 6-digit PIN code'),
  required: (label: string) => z.string().trim().min(1, `${label} is required`),
  money: (label: string) =>
    z
      .string()
      .trim()
      .min(1, `${label} is required`)
      .refine((v) => !Number.isNaN(Number(v)) && Number(v) >= 0, `${label} must be a valid amount`),
};

export const loginSchema = z.object({
  email: rules.email,
  password: rules.loginPassword,
});
export type LoginForm = z.infer<typeof loginSchema>;

export const phoneLoginSchema = z.object({ phone: rules.phone });
export type PhoneLoginForm = z.infer<typeof phoneLoginSchema>;

const baseSignup = {
  name: rules.name,
  email: rules.email,
  phone: rules.phone,
  password: rules.password,
  confirmPassword: z.string(),
  acceptTerms: z.boolean().refine((v) => v, 'Please accept the terms to continue'),
};

export const customerSignupSchema = z
  .object({ ...baseSignup, referralCode: z.string().optional() })
  .refine((d) => d.password === d.confirmPassword, { message: 'Passwords do not match', path: ['confirmPassword'] });

export const providerSignupSchema = z
  .object({
    ...baseSignup,
    businessName: rules.required('Business name'),
    providerType: z.enum(['individual', 'organization']),
    categoryIds: z.array(z.string()).min(1, 'Select at least one category'),
    city: rules.required('City'),
    yearsExperience: z.string().regex(/^\d{1,2}$/, 'Enter years (0–99)'),
  })
  .refine((d) => d.password === d.confirmPassword, { message: 'Passwords do not match', path: ['confirmPassword'] });

export const deliverySignupSchema = z
  .object({
    ...baseSignup,
    vehicleType: z.enum(['bike', 'scooter', 'car', 'van']),
    vehicleNumber: z
      .string()
      .trim()
      .min(6, 'Enter a valid vehicle number')
      .max(14, 'Enter a valid vehicle number'),
    licenseNumber: z.string().trim().min(8, 'Enter a valid licence number'),
    city: rules.required('City'),
  })
  .refine((d) => d.password === d.confirmPassword, { message: 'Passwords do not match', path: ['confirmPassword'] });

export type CustomerSignupForm = z.infer<typeof customerSignupSchema>;
export type ProviderSignupForm = z.infer<typeof providerSignupSchema>;
export type DeliverySignupForm = z.infer<typeof deliverySignupSchema>;

export const addressSchema = z.object({
  label: z.enum(['Home', 'Work', 'Other']),
  contactName: rules.name,
  phone: rules.phone,
  line1: rules.required('House / flat & building'),
  line2: z.string().optional(),
  landmark: z.string().optional(),
  city: rules.required('City'),
  state: rules.required('State'),
  pincode: rules.pincode,
  isDefault: z.boolean(),
});
export type AddressForm = z.infer<typeof addressSchema>;

export const profileSchema = z.object({
  name: rules.name,
  email: rules.email,
  phone: rules.phone,
});
export type ProfileForm = z.infer<typeof profileSchema>;

export const changePasswordSchema = z
  .object({ current: rules.loginPassword, next: rules.password, confirm: z.string() })
  .refine((d) => d.next === d.confirm, { message: 'Passwords do not match', path: ['confirm'] });
export type ChangePasswordForm = z.infer<typeof changePasswordSchema>;

export const serviceSchema = z
  .object({
    title: z.string().trim().min(4, 'Title must be at least 4 characters').max(80),
    description: z.string().trim().min(20, 'Describe the service in at least 20 characters'),
    categoryId: rules.required('Category'),
    subcategoryId: z.string().optional(),
    price: rules.money('Price'),
    discountPrice: z.string().optional(),
    durationMin: z.string().regex(/^\d+$/, 'Enter minutes'),
    membersRequired: z.string().regex(/^\d+$/, 'Enter a number'),
    includes: z.string().optional(),
    excludes: z.string().optional(),
    requiresPickup: z.boolean(),
    active: z.boolean(),
  })
  .refine((d) => !d.discountPrice || Number(d.discountPrice) < Number(d.price), {
    message: 'Discounted price must be lower than price',
    path: ['discountPrice'],
  });
export type ServiceForm = z.infer<typeof serviceSchema>;

export const promoSchema = z.object({
  code: z
    .string()
    .trim()
    .min(4, 'At least 4 characters')
    .max(16)
    .regex(/^[A-Z0-9]+$/, 'Use capital letters and numbers only'),
  title: rules.required('Title'),
  description: z.string().optional(),
  discountType: z.enum(['percent', 'flat']),
  value: rules.money('Value'),
  minOrder: rules.money('Minimum order'),
  maxDiscount: z.string().optional(),
  validDays: z.string().regex(/^\d+$/, 'Enter number of days'),
  usageLimit: z.string().regex(/^\d+$/, 'Enter a number'),
});
export type PromoForm = z.infer<typeof promoSchema>;

export const ticketSchema = z.object({
  subject: z.string().trim().min(6, 'Subject is too short').max(90),
  category: z.enum(['booking', 'payment', 'account', 'provider', 'other']),
  message: z.string().trim().min(15, 'Please describe the issue in at least 15 characters'),
  bookingId: z.string().optional(),
});
export type TicketForm = z.infer<typeof ticketSchema>;

export const categorySchema = z.object({
  name: rules.required('Name'),
  icon: rules.required('Icon'),
  description: z.string().optional(),
  parentId: z.string().optional(),
  commissionRate: z.string().regex(/^\d{1,2}$/, '0–99'),
  active: z.boolean(),
});
export type CategoryForm = z.infer<typeof categorySchema>;
