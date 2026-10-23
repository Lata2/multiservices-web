import type {
  Address,
  AppNotification,
  Banner,
  Booking,
  BookingStatus,
  Category,
  ChatMessage,
  ChatThread,
  City,
  DeliveryPartner,
  DeliveryTask,
  Faq,
  Payout,
  PlatformSettings,
  PromoCode,
  Provider,
  Review,
  Service,
  SupportTicket,
  User,
  WalletTransaction,
  WeeklyHours,
} from '@/types/models';
import { avatar, between, dateKey, daysFromNow, hoursAgo, pick, rand, resetSeed, round1 } from './helpers';

resetSeed(7);

/* ───────────────────────────── Platform ───────────────────────────── */

export const settings: PlatformSettings = {
  taxPercent: 18,
  defaultCommission: 15,
  currency: 'INR',
  currencySymbol: '₹',
  minPayout: 500,
  cancellationWindowHours: 3,
  supportEmail: 'support@servio.app',
  supportPhone: '+91 98765 43210',
  paymentGateways: { card: true, upi: true, razorpay: true, stripe: true, paystack: false, flutterwave: false },
  cashOnService: true,
  maintenanceMode: false,
};

export const cities: City[] = [
  { id: 'city_1', name: 'Bengaluru', state: 'Karnataka', active: true },
  { id: 'city_2', name: 'Mumbai', state: 'Maharashtra', active: true },
  { id: 'city_3', name: 'New Delhi', state: 'Delhi', active: true },
  { id: 'city_4', name: 'Hyderabad', state: 'Telangana', active: true },
  { id: 'city_5', name: 'Pune', state: 'Maharashtra', active: true },
  { id: 'city_6', name: 'Raipur', state: 'Chhattisgarh', active: false },
];

/* ───────────────────────────── Categories ───────────────────────────── */

type CatSeed = [id: string, name: string, icon: string, subs: string[], desc: string];
const catSeeds: CatSeed[] = [
  ['cat_clean', 'Home Cleaning', 'sparkles', ['Deep Cleaning', 'Bathroom Cleaning', 'Kitchen Cleaning', 'Sofa & Carpet'], 'Spotless homes by trained professionals'],
  ['cat_ac', 'AC & Appliances', 'snowflake', ['AC Service', 'Refrigerator', 'Washing Machine', 'Water Purifier'], 'Repair, service & installation'],
  ['cat_elec', 'Electrician', 'zap', ['Wiring', 'Fans & Lights', 'Switchboards'], 'Certified, insured electricians'],
  ['cat_plumb', 'Plumbing', 'droplet', ['Leakage Repair', 'Tap & Mixer', 'Bathroom Fittings'], 'Fast fixes for leaks and blockages'],
  ['cat_salon', 'Salon for Women', 'flower', ['Waxing', 'Facial & Cleanup', 'Manicure & Pedicure', 'Hair'], 'Salon experience at home'],
  ['cat_men', "Men's Grooming", 'scissors', ['Haircut', 'Beard & Shave', 'Massage'], 'Barbers who come to you'],
  ['cat_paint', 'Painting', 'palette', ['Interior', 'Exterior', 'Waterproofing'], 'Fresh walls with zero mess'],
  ['cat_pest', 'Pest Control', 'bug', ['Cockroach', 'Termite', 'Bed Bugs'], 'Safe, odourless treatments'],
  ['cat_carp', 'Carpentry', 'hammer', ['Furniture Assembly', 'Door & Window', 'Repairs'], 'Skilled woodwork on demand'],
  ['cat_laundry', 'Laundry', 'shirt', ['Wash & Fold', 'Dry Cleaning', 'Ironing'], 'Free pickup & doorstep delivery'],
  ['cat_car', 'Car Care', 'car', ['Car Wash', 'Detailing', 'Servicing'], 'Doorstep wash & workshop pickup'],
  ['cat_spa', 'Spa & Wellness', 'leaf', ['Massage', 'Yoga Trainer', 'Physiotherapy'], 'Relax and recover at home'],
];

export const categories: Category[] = [];
for (const [id, name, icon, subs, description] of catSeeds) {
  categories.push({ id, name, icon, parentId: null, description, active: true, serviceCount: 0, commissionRate: 15 });
  subs.forEach((s, i) =>
    categories.push({
      id: `${id}_${i + 1}`,
      name: s,
      icon,
      parentId: id,
      active: true,
      serviceCount: 0,
      commissionRate: 15,
    }),
  );
}

/* ───────────────────────────── Users ───────────────────────────── */

const now = new Date().toISOString();

export const users: User[] = [
  { id: 'u_c1', role: 'customer', name: 'Aarav Sharma', email: 'customer@servio.app', phone: '+91 98200 11223', avatar: avatar(12), status: 'active', city: 'Bengaluru', createdAt: daysFromNow(-210), referralCode: 'AARAV50' },
  { id: 'u_p1', role: 'provider', name: 'Meera Iyer', email: 'provider@servio.app', phone: '+91 99000 22334', avatar: avatar(47), status: 'active', city: 'Bengaluru', createdAt: daysFromNow(-400), profileId: 'prov_1' },
  { id: 'u_d1', role: 'delivery', name: 'Ravi Kumar', email: 'delivery@servio.app', phone: '+91 97400 33445', avatar: avatar(59), status: 'active', city: 'Bengaluru', createdAt: daysFromNow(-150), profileId: 'dp_1' },
  { id: 'u_a1', role: 'admin', name: 'Neha Kapoor', email: 'admin@servio.app', phone: '+91 90000 44556', avatar: avatar(45), status: 'active', city: 'Bengaluru', createdAt: daysFromNow(-700) },
];

const customerNames = ['Priya Nair', 'Rohan Mehta', 'Ananya Gupta', 'Vikram Singh', 'Sneha Reddy', 'Arjun Das', 'Kavya Joshi', 'Ishaan Verma', 'Diya Patel', 'Kabir Malhotra', 'Tara Menon', 'Aditya Rao'];
customerNames.forEach((name, i) =>
  users.push({
    id: `u_c${i + 2}`,
    role: 'customer',
    name,
    email: `${name.split(' ')[0].toLowerCase()}@mail.com`,
    phone: `+91 9${between(100000000, 999999999)}`,
    avatar: avatar(i + 20),
    status: i === 7 ? 'blocked' : 'active',
    city: pick(['Bengaluru', 'Mumbai', 'Pune', 'Hyderabad']),
    createdAt: daysFromNow(-between(5, 300)),
  }),
);

/* ───────────────────────────── Providers ───────────────────────────── */

const defaultHours = (): WeeklyHours[] =>
  [0, 1, 2, 3, 4, 5, 6].map((day) => ({ day, open: day !== 0, start: '09:00', end: '19:00' }));

type ProvSeed = [id: string, biz: string, owner: string, type: 'individual' | 'organization', cats: string[], status: Provider['status'], avatarN: number, about: string];
const provSeeds: ProvSeed[] = [
  ['prov_1', 'SparkleClean Co.', 'Meera Iyer', 'organization', ['cat_clean', 'cat_pest'], 'approved', 47, 'Award-winning cleaning team with 40+ background-verified professionals. We use eco-friendly, child-safe products and industrial-grade equipment.'],
  ['prov_2', 'CoolBreeze Appliance Care', 'Sanjay Rao', 'organization', ['cat_ac'], 'approved', 33, 'Authorised multi-brand appliance specialists. Genuine spares and a 30-day service warranty on every job.'],
  ['prov_3', 'Rakesh Electricals', 'Rakesh Yadav', 'individual', ['cat_elec', 'cat_carp'], 'approved', 52, 'Licensed electrician with 12 years of residential experience. Neat work, fair prices.'],
  ['prov_4', 'FlowFix Plumbing', 'Imran Shaikh', 'individual', ['cat_plumb'], 'approved', 60, 'From dripping taps to full bathroom refits — fixed right the first time.'],
  ['prov_5', 'Glow Studio at Home', 'Ritika Bansal', 'organization', ['cat_salon', 'cat_spa'], 'approved', 44, 'Certified beauticians and therapists using premium, single-use kits for hygiene you can trust.'],
  ['prov_6', 'Sharp Cuts Grooming', 'Faizan Ali', 'individual', ['cat_men'], 'approved', 68, 'Modern barbering at your doorstep. Fades, beard sculpting and relaxing head massages.'],
  ['prov_7', 'ColorCraft Painters', 'Joseph Thomas', 'organization', ['cat_paint', 'cat_carp'], 'approved', 15, 'Professional painting crews with free colour consultation and furniture protection.'],
  ['prov_8', 'FreshFold Laundry', 'Pooja Shetty', 'organization', ['cat_laundry'], 'approved', 9, 'Hygienic wash & fold, dry cleaning and steam ironing with free pickup and 48-hour delivery.'],
  ['prov_9', 'AutoShine Car Care', 'Manpreet Gill', 'organization', ['cat_car'], 'approved', 13, 'Waterless doorstep washes, ceramic detailing and workshop servicing with pickup & drop.'],
  ['prov_10', 'SafeHome Pest Solutions', 'Gaurav Jain', 'organization', ['cat_pest'], 'pending', 18, 'Government-approved chemicals and certified technicians for complete pest management.'],
  ['prov_11', 'HandyHub Services', 'Suresh Pillai', 'individual', ['cat_carp', 'cat_elec'], 'pending', 57, 'All-round handyman for quick home fixes and furniture assembly.'],
];

export const providers: Provider[] = provSeeds.map(([id, businessName, ownerName, type, categoryIds, status, n, about], i) => {
  const userId = id === 'prov_1' ? 'u_p1' : `u_p${i + 1}`;
  if (id !== 'prov_1') {
    users.push({
      id: userId,
      role: 'provider',
      name: ownerName,
      email: `${ownerName.split(' ')[0].toLowerCase()}@${businessName.split(' ')[0].toLowerCase()}.in`,
      phone: `+91 9${between(100000000, 999999999)}`,
      avatar: avatar(n),
      status: status === 'approved' ? 'active' : 'pending',
      city: 'Bengaluru',
      createdAt: daysFromNow(-between(10, 500)),
      profileId: id,
    });
  }
  return {
    id,
    userId,
    businessName,
    ownerName,
    type,
    avatar: avatar(n),
    cover: '',
    about,
    city: 'Bengaluru',
    address: `${between(10, 400)}, ${pick(['Indiranagar', 'Koramangala', 'HSR Layout', 'Whitefield', 'Jayanagar'])}, Bengaluru`,
    phone: `+91 9${between(100000000, 999999999)}`,
    email: `hello@${businessName.split(' ')[0].toLowerCase()}.in`,
    categoryIds,
    rating: status === 'approved' ? round1(4 + rand() * 0.9) : 0,
    reviewCount: 0,
    jobsCompleted: status === 'approved' ? between(120, 2400) : 0,
    yearsExperience: between(2, 15),
    distanceKm: round1(0.8 + rand() * 9),
    verified: status === 'approved',
    status,
    commissionRate: 15,
    startingPrice: 0,
    visitingCharge: pick([0, 49, 79, 99]),
    hours: defaultHours(),
    holidays: [dateKey(9)],
    slotDurationMin: 60,
    advanceBookingDays: 14,
    documents: [
      { id: 'doc_id', name: 'Government ID', status: status === 'approved' ? 'verified' : 'pending' },
      { id: 'doc_addr', name: 'Address Proof', status: status === 'approved' ? 'verified' : 'pending' },
      { id: 'doc_biz', name: type === 'organization' ? 'GST / Business Registration' : 'Skill Certificate', status: status === 'approved' ? 'verified' : 'missing' },
    ],
    bank: { accountName: businessName, accountNumber: `XXXXXX${between(1000, 9999)}`, ifsc: 'HDFC0001234', bankName: 'HDFC Bank' },
    joinedAt: daysFromNow(-between(60, 900)),
  };
});

/* ───────────────────────────── Services ───────────────────────────── */

type SvcSeed = [provider: string, sub: string, title: string, price: number, discount: number | 0, minutes: number, includes: string[], excludes: string[], tags?: string[]];
const svcSeeds: SvcSeed[] = [
  ['prov_1', 'cat_clean_1', 'Full Home Deep Cleaning (2 BHK)', 4999, 3999, 300, ['All rooms, kitchen & 2 bathrooms', 'Machine scrubbing of floors', 'Cabinet exteriors & fans', 'Balcony & windows'], ['Wall washing', 'Interior of appliances'], ['bestseller']],
  ['prov_1', 'cat_clean_2', 'Intense Bathroom Cleaning', 599, 499, 60, ['Tiles & grout scrubbing', 'Hard-water stain removal', 'Fittings descaling', 'Exhaust fan wipe'], ['Ceiling cleaning'], ['popular']],
  ['prov_1', 'cat_clean_3', 'Kitchen Deep Clean', 1599, 1299, 150, ['Chimney exterior & hob', 'Cabinet in & out', 'Sink & tiles degreasing'], ['Utensil washing']],
  ['prov_1', 'cat_clean_4', 'Sofa Shampooing (5 seats)', 1199, 899, 90, ['Vacuum & shampoo', 'Stain treatment', 'Quick-dry finish'], ['Leather sofas']],
  ['prov_1', 'cat_pest_1', 'Cockroach & Ant Control', 1099, 899, 60, ['Gel treatment in kitchen', 'Odourless spray', '3-month warranty'], ['Termite treatment']],
  ['prov_1', 'cat_clean_1', 'Move-in / Move-out Cleaning', 5999, 0, 360, ['Empty-home deep clean', 'Inside cabinets & wardrobes', 'Post-paint residue removal'], ['Furniture shifting'], ['new']],
  ['prov_2', 'cat_ac_1', 'AC Power Jet Service', 799, 599, 60, ['Jet pump cleaning of indoor unit', 'Filter & coil wash', 'Gas pressure check'], ['Gas refill (charged separately)'], ['bestseller']],
  ['prov_2', 'cat_ac_1', 'AC Installation (Split)', 1499, 1299, 120, ['Indoor & outdoor unit mounting', 'Up to 3 ft copper pipe', 'Test run'], ['Stand & extra piping']],
  ['prov_2', 'cat_ac_1', 'AC Gas Refill & Leak Fix', 2499, 2199, 90, ['Leak detection', 'Full gas top-up', 'Cooling test'], ['Compressor replacement']],
  ['prov_2', 'cat_ac_2', 'Refrigerator Repair', 349, 0, 60, ['Diagnosis visit', 'Minor repairs', 'Repair quote'], ['Spare parts cost']],
  ['prov_2', 'cat_ac_3', 'Washing Machine Repair', 349, 299, 60, ['Diagnosis', 'Drum & motor check', 'Minor repairs'], ['Spare parts cost']],
  ['prov_2', 'cat_ac_4', 'RO Water Purifier Service', 699, 549, 45, ['Filter cleaning', 'TDS check', 'Sanitisation'], ['Membrane replacement']],
  ['prov_3', 'cat_elec_2', 'Ceiling Fan Installation', 249, 199, 45, ['Fan mounting', 'Wiring & testing'], ['Fan & down-rod']],
  ['prov_3', 'cat_elec_3', 'Switchboard Repair', 199, 0, 30, ['Switch/socket replacement', 'Safety check'], ['New switchboard cost']],
  ['prov_3', 'cat_elec_1', 'Full Home Wiring Inspection', 999, 799, 120, ['MCB & earthing test', 'Load analysis', 'Written report'], ['Rewiring']],
  ['prov_3', 'cat_carp_1', 'Furniture Assembly', 499, 449, 60, ['Bed, wardrobe or table assembly', 'Hardware fixing'], ['Wall drilling for heavy units']],
  ['prov_4', 'cat_plumb_1', 'Leakage Detection & Repair', 399, 349, 60, ['Pipe & joint inspection', 'Sealant fix'], ['Pipe replacement material']],
  ['prov_4', 'cat_plumb_2', 'Tap / Mixer Installation', 249, 199, 30, ['Old tap removal', 'New tap fitting'], ['Tap cost']],
  ['prov_4', 'cat_plumb_3', 'Toilet Repair & Unclogging', 449, 399, 60, ['Flush tank repair', 'Blockage removal'], ['New commode']],
  ['prov_4', 'cat_plumb_3', 'Water Tank Cleaning', 899, 749, 90, ['Draining & sludge removal', 'Anti-bacterial wash'], ['Tank above 2000 L']],
  ['prov_5', 'cat_salon_1', 'Full Arms + Legs Waxing (Rica)', 899, 749, 60, ['Rica liposoluble wax', 'Underarms included', 'Post-wax soothing gel'], ['Bikini wax']],
  ['prov_5', 'cat_salon_2', 'O3+ Brightening Facial', 1899, 1599, 75, ['Cleansing & exfoliation', 'Massage & mask', 'Single-use kit'], ['Threading']],
  ['prov_5', 'cat_salon_3', 'Spa Manicure & Pedicure', 1199, 999, 90, ['Soak, scrub & massage', 'Cuticle care', 'Nail polish'], ['Gel extensions'], ['popular']],
  ['prov_5', 'cat_salon_4', 'Hair Spa & Blow-dry', 1299, 0, 60, ['Deep conditioning', 'Steam & massage', 'Blow-dry styling'], ['Hair colour']],
  ['prov_5', 'cat_spa_1', 'Swedish Full-Body Massage (60 min)', 1999, 1699, 60, ['Aromatherapy oils', 'Disposable sheets', 'Trained therapist'], ['Steam']],
  ['prov_5', 'cat_spa_2', 'Personal Yoga Session', 799, 0, 60, ['Certified trainer', 'Customised flow'], ['Yoga mat']],
  ['prov_6', 'cat_men_1', 'Haircut + Styling', 349, 299, 30, ['Consultation', 'Cut & wash', 'Styling product'], ['Hair colour'], ['bestseller']],
  ['prov_6', 'cat_men_2', 'Beard Trim & Shape', 199, 149, 20, ['Beard sculpting', 'Hot towel'], []],
  ['prov_6', 'cat_men_3', 'Head & Shoulder Massage', 399, 349, 30, ['Warm oil massage', 'Pressure-point therapy'], []],
  ['prov_7', 'cat_paint_1', '1 Room Interior Painting', 6999, 5999, 480, ['Putty touch-up', '2 coats premium emulsion', 'Floor & furniture covering'], ['Texture work'], ['popular']],
  ['prov_7', 'cat_paint_3', 'Terrace Waterproofing (per 100 sq ft)', 3499, 2999, 240, ['Crack filling', 'Waterproof coating', '2-year warranty'], ['Civil repairs']],
  ['prov_7', 'cat_carp_2', 'Door Lock & Hinge Repair', 299, 0, 45, ['Lock alignment', 'Hinge replacement'], ['Lock cost']],
  ['prov_8', 'cat_laundry_1', 'Wash & Fold (per kg)', 99, 79, 2880, ['Free pickup & drop', 'Gentle detergent', 'Neatly folded'], ['Stain removal'], ['pickup']],
  ['prov_8', 'cat_laundry_2', 'Dry Cleaning (per piece)', 199, 169, 4320, ['Free pickup & drop', 'Garment-specific care', 'Hanger packing'], ['Leather & suede'], ['pickup']],
  ['prov_8', 'cat_laundry_3', 'Steam Ironing (per piece)', 15, 12, 1440, ['Free pickup & drop', 'Crisp steam press'], [], ['pickup']],
  ['prov_9', 'cat_car_1', 'Doorstep Foam Car Wash', 499, 399, 45, ['Exterior foam wash', 'Interior vacuum', 'Tyre dressing'], ['Engine bay cleaning'], ['bestseller']],
  ['prov_9', 'cat_car_2', 'Ceramic Coating & Detailing', 14999, 11999, 480, ['Paint correction', '9H ceramic coat', 'Interior detailing'], ['Dent repair'], ['pickup']],
  ['prov_9', 'cat_car_3', 'Periodic Car Service (Pickup)', 3999, 3499, 360, ['Free pickup & drop', 'Oil & filter change', '40-point inspection'], ['Spare parts beyond kit'], ['pickup']],
];

export const services: Service[] = svcSeeds.map(([providerId, sub, title, price, discount, durationMin, includes, excludes, tags = []], i) => {
  const parent = sub.split('_').slice(0, 2).join('_');
  const pickup = tags.includes('pickup');
  return {
    id: `svc_${i + 1}`,
    providerId,
    categoryId: parent,
    subcategoryId: sub,
    title,
    description: `${title} by trained, background-verified professionals. Transparent pricing, on-time arrival and a satisfaction guarantee — if something isn't right, we'll fix it free within 7 days.`,
    image: '',
    gallery: [],
    price,
    discountPrice: discount || undefined,
    durationMin,
    membersRequired: durationMin >= 240 ? 2 : 1,
    rating: round1(4.1 + rand() * 0.85),
    reviewCount: 0,
    includes,
    excludes,
    tags: tags.filter((t) => t !== 'pickup'),
    active: true,
    requiresPickup: pickup,
    maxQuantity: price < 100 ? 30 : 5,
    cancellable: true,
    createdAt: daysFromNow(-between(10, 300)),
  };
});

// derive counts / starting price
for (const cat of categories) {
  cat.serviceCount = services.filter((s) => s.categoryId === cat.id || s.subcategoryId === cat.id).length;
}
for (const p of providers) {
  const own = services.filter((s) => s.providerId === p.id);
  p.startingPrice = own.length ? Math.min(...own.map((s) => s.discountPrice ?? s.price)) : 0;
}

/* ───────────────────────────── Addresses ───────────────────────────── */

export const addresses: Address[] = [
  { id: 'addr_1', userId: 'u_c1', label: 'Home', contactName: 'Aarav Sharma', phone: '+91 98200 11223', line1: 'Flat 1204, Prestige Lakeside Habitat', line2: 'Varthur Main Road', landmark: 'Opp. Gunjur Lake', city: 'Bengaluru', state: 'Karnataka', pincode: '560087', isDefault: true, lat: 12.94, lng: 77.73 },
  { id: 'addr_2', userId: 'u_c1', label: 'Work', contactName: 'Aarav Sharma', phone: '+91 98200 11223', line1: 'WeWork Galaxy, 43 Residency Road', line2: '4th Floor', landmark: 'Near Shanthala Nagar', city: 'Bengaluru', state: 'Karnataka', pincode: '560025', isDefault: false, lat: 12.97, lng: 77.6 },
  { id: 'addr_3', userId: 'u_c1', label: 'Other', contactName: 'Sunita Sharma', phone: '+91 98450 55667', line1: '22, 3rd Cross, HSR Layout Sector 2', landmark: 'Behind BDA Complex', city: 'Bengaluru', state: 'Karnataka', pincode: '560102', isDefault: false, lat: 12.91, lng: 77.64 },
];

/* ───────────────────────────── Delivery partners ───────────────────────────── */

export const deliveryPartners: DeliveryPartner[] = [
  { id: 'dp_1', userId: 'u_d1', name: 'Ravi Kumar', phone: '+91 97400 33445', avatar: avatar(59), vehicleType: 'scooter', vehicleNumber: 'KA 03 HX 4521', licenseNumber: 'KA0320190012345', rating: 4.8, completedTasks: 642, online: true, status: 'approved', city: 'Bengaluru', joinedAt: daysFromNow(-150) },
  { id: 'dp_2', userId: 'u_d2', name: 'Mohammed Arif', phone: '+91 97411 22990', avatar: avatar(53), vehicleType: 'bike', vehicleNumber: 'KA 01 EF 9032', licenseNumber: 'KA0120180044321', rating: 4.6, completedTasks: 410, online: false, status: 'approved', city: 'Bengaluru', joinedAt: daysFromNow(-260) },
  { id: 'dp_3', userId: 'u_d3', name: 'Deepak Gowda', phone: '+91 96320 11873', avatar: avatar(51), vehicleType: 'van', vehicleNumber: 'KA 05 MN 7710', licenseNumber: 'KA0520210077777', rating: 0, completedTasks: 0, online: false, status: 'pending', city: 'Bengaluru', joinedAt: daysFromNow(-3) },
];
users.push(
  { id: 'u_d2', role: 'delivery', name: 'Mohammed Arif', email: 'arif@mail.com', phone: '+91 97411 22990', avatar: avatar(53), status: 'active', city: 'Bengaluru', createdAt: daysFromNow(-260), profileId: 'dp_2' },
  { id: 'u_d3', role: 'delivery', name: 'Deepak Gowda', email: 'deepak@mail.com', phone: '+91 96320 11873', avatar: avatar(51), status: 'pending', city: 'Bengaluru', createdAt: daysFromNow(-3), profileId: 'dp_3' },
);

/* ───────────────────────────── Bookings ───────────────────────────── */

const svc = (id: string) => services.find((s) => s.id === id)!;
const prov = (id: string) => providers.find((p) => p.id === id)!;
const usr = (id: string) => users.find((u) => u.id === id)!;

function price(items: { serviceId: string; quantity: number }[], providerId: string, promoDiscount = 0) {
  const subtotal = items.reduce((sum, it) => {
    const s = svc(it.serviceId);
    return sum + (s.discountPrice ?? s.price) * it.quantity;
  }, 0);
  const visitingCharge = prov(providerId).visitingCharge;
  const discount = promoDiscount;
  const tax = Math.round(((subtotal - discount + visitingCharge) * settings.taxPercent) / 100);
  return { subtotal, discount, visitingCharge, tax, total: subtotal - discount + visitingCharge + tax };
}

const flowOrder: BookingStatus[] = ['pending', 'confirmed', 'on_the_way', 'in_progress', 'completed'];

type BkSeed = [customer: string, items: [string, number][], dayOffset: number, slot: string, status: BookingStatus, method: Booking['payment']['method'], addressId?: string];
const bkSeeds: BkSeed[] = [
  // Demo customer u_c1
  ['u_c1', [['svc_7', 2]], 1, '11:00', 'confirmed', 'upi', 'addr_1'],
  ['u_c1', [['svc_2', 1], ['svc_4', 1]], 3, '14:00', 'pending', 'cash', 'addr_1'],
  ['u_c1', [['svc_33', 6]], 0, '10:00', 'in_progress', 'card', 'addr_1'],
  ['u_c1', [['svc_27', 1], ['svc_28', 1]], -4, '18:00', 'completed', 'wallet', 'addr_1'],
  ['u_c1', [['svc_1', 1]], -18, '09:00', 'completed', 'razorpay', 'addr_3'],
  ['u_c1', [['svc_17', 1]], -9, '16:00', 'cancelled', 'cash', 'addr_2'],
  ['u_c1', [['svc_36', 1]], -30, '08:00', 'completed', 'upi', 'addr_1'],
  // Provider prov_1 from other customers
  ['u_c2', [['svc_1', 1]], 0, '09:00', 'confirmed', 'upi'],
  ['u_c3', [['svc_2', 2]], 0, '13:00', 'pending', 'cash'],
  ['u_c4', [['svc_3', 1]], 1, '10:00', 'pending', 'card'],
  ['u_c5', [['svc_5', 1]], 2, '15:00', 'confirmed', 'razorpay'],
  ['u_c6', [['svc_4', 1]], 0, '11:00', 'on_the_way', 'upi'],
  ['u_c7', [['svc_6', 1]], -2, '09:00', 'completed', 'card'],
  ['u_c9', [['svc_2', 1]], -6, '12:00', 'completed', 'cash'],
  ['u_c10', [['svc_1', 1]], -12, '09:00', 'completed', 'upi'],
  ['u_c11', [['svc_3', 1]], -3, '17:00', 'cancelled', 'card'],
  ['u_c12', [['svc_5', 1]], -20, '10:00', 'completed', 'razorpay'],
  // Pickup services for delivery tasks
  ['u_c3', [['svc_34', 3]], 0, '12:00', 'confirmed', 'upi'],
  ['u_c5', [['svc_38', 1]], 1, '09:00', 'confirmed', 'card'],
  ['u_c8', [['svc_33', 8]], -1, '10:00', 'completed', 'cash'],
  ['u_c2', [['svc_9', 1]], -7, '11:00', 'completed', 'upi'],
  ['u_c4', [['svc_22', 1]], -5, '15:00', 'completed', 'card'],
];

export const bookings: Booking[] = bkSeeds.map(([customerId, its, dayOffset, slot, status, method, addressId], i) => {
  const items = its.map(([serviceId, quantity]) => ({ serviceId, quantity }));
  const first = svc(items[0].serviceId);
  const p = prov(first.providerId);
  const customer = usr(customerId);
  const address: Address = addressId
    ? addresses.find((a) => a.id === addressId)!
    : {
        id: `addr_x${i}`,
        userId: customerId,
        label: 'Home',
        contactName: customer.name,
        phone: customer.phone,
        line1: `${between(1, 300)}, ${pick(['12th Main', '5th Cross', 'MG Road', 'Church Street', 'Outer Ring Road'])}`,
        line2: pick(['Indiranagar', 'Koramangala 4th Block', 'HSR Layout', 'Bellandur', 'JP Nagar']),
        city: 'Bengaluru',
        state: 'Karnataka',
        pincode: `5600${between(10, 99)}`,
        isDefault: true,
      };
  const createdAt = daysFromNow(Math.min(dayOffset, 0) - between(1, 4), between(8, 20));
  const timeline: Booking['timeline'] = [{ status: 'pending', at: createdAt, note: 'Booking placed' }];
  if (status === 'cancelled') {
    timeline.push({ status: 'cancelled', at: daysFromNow(dayOffset - 1, 12), note: 'Cancelled by customer' });
  } else {
    const reach = flowOrder.indexOf(status);
    flowOrder.slice(1, reach + 1).forEach((st, k) =>
      timeline.push({ status: st, at: daysFromNow(dayOffset, Number(slot.slice(0, 2)) - (reach - k - 1), 0) }),
    );
  }
  const discount = i === 4 ? 500 : 0;
  const paid = method !== 'cash' || status === 'completed';
  return {
    id: `bk_${i + 1}`,
    code: `SRV${(240100 + i * 37).toString()}`,
    customerId,
    customerName: customer.name,
    customerPhone: customer.phone,
    providerId: p.id,
    providerName: p.businessName,
    items: items.map((it) => {
      const s = svc(it.serviceId);
      return { serviceId: s.id, categoryId: s.categoryId, title: s.title, image: s.image, unitPrice: s.discountPrice ?? s.price, quantity: it.quantity, durationMin: s.durationMin };
    }),
    address,
    scheduledDate: dateKey(dayOffset),
    slot,
    status,
    payment: {
      method,
      status: status === 'cancelled' ? (method === 'cash' ? 'pending' : 'refunded') : paid ? 'paid' : 'pending',
      transactionId: method !== 'cash' ? `TXN${between(10000000, 99999999)}` : undefined,
    },
    pricing: price(items, p.id, discount),
    promoCode: discount ? 'WELCOME500' : undefined,
    notes: i === 1 ? 'Please bring a ladder. Gate code 4521.' : undefined,
    startOtp: `${between(1000, 9999)}`,
    timeline,
    cancelReason: status === 'cancelled' ? 'Change of plans' : undefined,
    rescheduleCount: 0,
    createdAt,
  };
});

/* ───────────────────────────── Delivery tasks ───────────────────────────── */

export const deliveryTasks: DeliveryTask[] = [];
bookings
  .filter((b) => b.items.some((it) => svc(it.serviceId).requiresPickup))
  .forEach((b, i) => {
    const p = prov(b.providerId);
    const isDone = b.status === 'completed';
    const status: DeliveryTask['status'] = isDone ? 'delivered' : i === 0 ? 'picked_up' : i === 1 ? 'accepted' : 'available';
    const addr = `${b.address.line1}, ${b.address.line2 ?? ''}, ${b.address.city}`;
    const task: DeliveryTask = {
      id: `dt_${i + 1}`,
      bookingId: b.id,
      bookingCode: b.code,
      type: 'pickup',
      status,
      partnerId: status === 'available' ? undefined : 'dp_1',
      pickup: { name: b.customerName, phone: b.customerPhone, address: addr },
      drop: { name: p.businessName, phone: p.phone, address: p.address },
      itemsSummary: b.items.map((it) => `${it.quantity} × ${it.title}`).join(', '),
      distanceKm: round1(2 + rand() * 8),
      fee: between(45, 120),
      codAmount: b.payment.method === 'cash' && b.payment.status === 'pending' ? b.pricing.total : 0,
      otp: `${between(1000, 9999)}`,
      scheduledFor: daysFromNow(0, Number(b.slot.slice(0, 2))),
      createdAt: b.createdAt,
      updatedAt: hoursAgo(between(1, 30)),
    };
    deliveryTasks.push(task);
    b.deliveryTaskId = task.id;
  });

// Extra open tasks so the delivery partner always has a queue
const extraStops = [
  ['Lavanya R', 'Plot 18, 2nd Stage, BTM Layout', 'FreshFold Laundry', 'Return 12 garments (dry cleaned)', 'drop'],
  ['CoolBreeze Appliance Care', 'Spare depot, Peenya Industrial Area', 'Sneha Reddy', 'Deliver AC capacitor & copper pipe', 'parts'],
  ['Kabir Malhotra', 'Tower B-702, Brigade Metropolis', 'AutoShine Car Care', 'Car keys + documents for service pickup', 'pickup'],
  ['FreshFold Laundry', 'Hub, 80 Ft Road, Koramangala', 'Tara Menon', 'Return 8 kg wash & fold', 'drop'],
] as const;
extraStops.forEach(([from, fromAddr, to, summary, type], i) => {
  deliveryTasks.push({
    id: `dt_x${i + 1}`,
    bookingId: bookings[17 + (i % 3)].id,
    bookingCode: `SRV${250300 + i * 11}`,
    type,
    status: i === 3 ? 'delivered' : 'available',
    partnerId: i === 3 ? 'dp_1' : undefined,
    pickup: { name: from, phone: `+91 9${between(100000000, 999999999)}`, address: fromAddr },
    drop: { name: to, phone: `+91 9${between(100000000, 999999999)}`, address: `${between(10, 200)}, ${pick(['HSR Layout', 'Bellandur', 'Indiranagar', 'Jayanagar'])}, Bengaluru` },
    itemsSummary: summary,
    distanceKm: round1(1.5 + rand() * 9),
    fee: between(40, 140),
    codAmount: i === 0 ? 1180 : 0,
    otp: `${between(1000, 9999)}`,
    scheduledFor: daysFromNow(i === 3 ? -1 : 0, 12 + i),
    createdAt: hoursAgo(between(1, 6)),
    updatedAt: hoursAgo(between(0, 2)),
  });
});

// Historical deliveries so the partner's history & earnings look lived-in.
const histNames = ['Neel Arora', 'Meghna Rao', 'Sahil Khan', 'Ira Bose', 'Varun Pai', 'Nisha Kulkarni'];
histNames.forEach((name, i) => {
  deliveryTasks.push({
    id: `dt_h${i + 1}`,
    bookingId: `bk_hist_${i + 1}`,
    bookingCode: `SRV${230100 + i * 23}`,
    type: i % 3 === 0 ? 'drop' : i % 3 === 1 ? 'pickup' : 'parts',
    status: 'delivered',
    partnerId: 'dp_1',
    pickup: { name: i % 2 ? name : 'FreshFold Laundry', phone: '+91 90000 00000', address: `${between(10, 300)}, ${pick(['HSR Layout', 'BTM Layout', 'Koramangala'])}, Bengaluru` },
    drop: { name: i % 2 ? 'FreshFold Laundry' : name, phone: '+91 90000 00001', address: `${between(10, 300)}, ${pick(['Bellandur', 'Indiranagar', 'Jayanagar'])}, Bengaluru` },
    itemsSummary: pick(['5 kg wash & fold', '7 garments dry cleaned', 'AC capacitor kit', '12 shirts ironed']),
    distanceKm: round1(2 + rand() * 7),
    fee: between(45, 130),
    codAmount: 0,
    otp: `${between(1000, 9999)}`,
    scheduledFor: daysFromNow(-(i + 1), 11 + (i % 5)),
    createdAt: daysFromNow(-(i + 1), 9),
    updatedAt: daysFromNow(-(i + 1), 12 + (i % 5)),
  });
});

/* ───────────────────────────── Reviews ───────────────────────────── */

const comments = [
  'Absolutely fantastic service. Arrived on time and left the place spotless!',
  'Very professional and polite. Will definitely book again.',
  'Good work overall, slightly delayed but kept me informed.',
  'Great value for money. The technician explained everything clearly.',
  'Superb attention to detail. Highly recommended!',
  'Decent job. A few corners were missed but they fixed it quickly when asked.',
  'Quick, clean and hassle-free. Exactly what I needed.',
  'Friendly staff and premium products. Loved it.',
];

export const reviews: Review[] = [];
let ri = 0;
for (const s of services) {
  const n = s.tags.includes('bestseller') ? 5 : between(1, 3);
  for (let k = 0; k < n; k++) {
    const cust = users.filter((u) => u.role === 'customer')[between(1, 12)];
    const rating = rand() > 0.82 ? between(3, 4) : 5;
    ri += 1;
    reviews.push({
      id: `rv_${ri}`,
      bookingId: `bk_hist_${ri}`,
      serviceId: s.id,
      providerId: s.providerId,
      customerId: cust.id,
      customerName: cust.name,
      customerAvatar: cust.avatar,
      rating,
      comment: pick(comments),
      createdAt: daysFromNow(-between(1, 120)),
      reply: rand() > 0.6 ? { text: 'Thank you so much for the kind words! See you again soon.', at: daysFromNow(-1) } : undefined,
    });
  }
}
// Link the demo customer's completed booking #4 to a review
const demoReview: Review = {
  id: 'rv_demo',
  bookingId: 'bk_4',
  serviceId: 'svc_27',
  providerId: 'prov_6',
  customerId: 'u_c1',
  customerName: 'Aarav Sharma',
  customerAvatar: avatar(12),
  rating: 5,
  comment: 'Faizan is brilliant — best fade I have had in years, and at home!',
  createdAt: daysFromNow(-3),
};
reviews.push(demoReview);
bookings.find((b) => b.id === 'bk_4')!.reviewId = demoReview.id;

for (const s of services) {
  const own = reviews.filter((r) => r.serviceId === s.id);
  s.reviewCount = own.length * between(8, 40);
  if (own.length) s.rating = round1(own.reduce((a, r) => a + r.rating, 0) / own.length);
}
for (const p of providers) {
  const own = reviews.filter((r) => r.providerId === p.id);
  p.reviewCount = own.length * between(10, 30);
}

/* ───────────────────────────── Promotions ───────────────────────────── */

export const promoCodes: PromoCode[] = [
  { id: 'pr_1', code: 'WELCOME500', title: 'Flat ₹500 off your first booking', description: 'Valid on orders above ₹1,999 for new users.', discountType: 'flat', value: 500, minOrder: 1999, providerId: null, expiresAt: daysFromNow(30), active: true, usageCount: 1240, usageLimit: 5000 },
  { id: 'pr_2', code: 'CLEAN20', title: '20% off cleaning services', description: 'Up to ₹400 off on any SparkleClean service.', discountType: 'percent', value: 20, minOrder: 499, maxDiscount: 400, providerId: 'prov_1', expiresAt: daysFromNow(14), active: true, usageCount: 318, usageLimit: 1000 },
  { id: 'pr_3', code: 'COOL15', title: '15% off AC servicing', description: 'Beat the heat — up to ₹300 off.', discountType: 'percent', value: 15, minOrder: 599, maxDiscount: 300, providerId: 'prov_2', expiresAt: daysFromNow(10), active: true, usageCount: 96, usageLimit: 500 },
  { id: 'pr_4', code: 'GLOW250', title: '₹250 off salon at home', description: 'On salon & spa orders above ₹1,499.', discountType: 'flat', value: 250, minOrder: 1499, providerId: 'prov_5', expiresAt: daysFromNow(21), active: true, usageCount: 77, usageLimit: 300 },
  { id: 'pr_5', code: 'MONSOON10', title: '10% off sitewide', description: 'Up to ₹200 off. Expired campaign.', discountType: 'percent', value: 10, minOrder: 0, maxDiscount: 200, providerId: null, expiresAt: daysFromNow(-5), active: false, usageCount: 2010, usageLimit: 2010 },
];

export const banners: Banner[] = [
  { id: 'bn_1', title: 'Summer-ready AC service', subtitle: 'Up to 25% off jet servicing', cta: 'Book now', image: '', categoryId: 'cat_ac', active: true },
  { id: 'bn_2', title: 'Deep clean, deep savings', subtitle: 'Use CLEAN20 for 20% off', cta: 'Explore', image: '', categoryId: 'cat_clean', active: true },
  { id: 'bn_3', title: 'Salon luxury at home', subtitle: 'Certified beauticians · single-use kits', cta: 'Pamper yourself', image: '', categoryId: 'cat_salon', active: true },
];

/* ───────────────────────────── Notifications ───────────────────────────── */

export const notifications: AppNotification[] = [
  { id: 'nt_1', userId: 'u_c1', type: 'booking', title: 'Booking confirmed', body: 'CoolBreeze Appliance Care accepted your AC Power Jet Service for tomorrow at 11:00 AM.', read: false, createdAt: hoursAgo(2), href: '/customer/booking/bk_1' },
  { id: 'nt_2', userId: 'u_c1', type: 'task', title: 'Laundry picked up', body: 'Ravi picked up your Wash & Fold order. Expected delivery in 48 hours.', read: false, createdAt: hoursAgo(5), href: '/customer/booking/bk_3' },
  { id: 'nt_3', userId: 'u_c1', type: 'promo', title: 'Weekend deal: 20% off cleaning', body: 'Use code CLEAN20 on any cleaning service. Valid till Sunday.', read: true, createdAt: hoursAgo(26), href: '/customer/offers' },
  { id: 'nt_4', userId: 'u_c1', type: 'payment', title: 'Refund processed', body: '₹470 has been refunded for booking SRV240285 to your original payment method.', read: true, createdAt: hoursAgo(200) },
  { id: 'nt_5', userId: 'u_c1', type: 'review', title: 'How was your haircut?', body: 'Rate Sharp Cuts Grooming and help others choose better.', read: true, createdAt: hoursAgo(90), href: '/customer/booking/bk_4' },
  { id: 'nt_6', userId: 'u_p1', type: 'booking', title: 'New booking request', body: 'Ananya Gupta requested Intense Bathroom Cleaning × 2 for today at 1:00 PM.', read: false, createdAt: hoursAgo(1), href: '/provider/booking/bk_9' },
  { id: 'nt_7', userId: 'u_p1', type: 'booking', title: 'New booking request', body: 'Vikram Singh requested Kitchen Deep Clean for tomorrow at 10:00 AM.', read: false, createdAt: hoursAgo(4), href: '/provider/booking/bk_10' },
  { id: 'nt_8', userId: 'u_p1', type: 'payment', title: 'Payout credited', body: '₹18,450 was transferred to your HDFC account ending 4521.', read: true, createdAt: hoursAgo(50), href: '/provider/earnings' },
  { id: 'nt_9', userId: 'u_p1', type: 'review', title: 'New 5★ review', body: 'Kavya Joshi rated Move-in / Move-out Cleaning 5 stars.', read: true, createdAt: hoursAgo(30), href: '/provider/reviews' },
  { id: 'nt_10', userId: 'u_d1', type: 'task', title: 'New pickup near you', body: 'Laundry pickup 2.4 km away · ₹68 fee.', read: false, createdAt: hoursAgo(0.5), href: '/delivery' },
  { id: 'nt_11', userId: 'u_d1', type: 'payment', title: 'Weekly earnings settled', body: '₹4,820 credited for last week.', read: true, createdAt: hoursAgo(72), href: '/delivery/earnings' },
  { id: 'nt_12', userId: 'u_a1', type: 'system', title: '2 providers awaiting approval', body: 'SafeHome Pest Solutions and HandyHub Services submitted documents.', read: false, createdAt: hoursAgo(3), href: '/admin/providers' },
  { id: 'nt_13', userId: 'u_a1', type: 'payment', title: 'Payout requests pending', body: '3 withdrawal requests need review.', read: false, createdAt: hoursAgo(8), href: '/admin/payouts' },
  { id: 'nt_14', userId: 'u_a1', type: 'system', title: 'High-priority ticket', body: 'Payment deducted but booking not confirmed — Rohan Mehta.', read: true, createdAt: hoursAgo(20), href: '/admin/support' },
];

/* ───────────────────────────── Support ───────────────────────────── */

export const tickets: SupportTicket[] = [
  {
    id: 'tk_1', userId: 'u_c1', userName: 'Aarav Sharma', userRole: 'customer', subject: 'Refund not received for cancelled booking', category: 'payment', priority: 'medium', status: 'in_progress', bookingId: 'bk_6',
    messages: [
      { id: 'm1', from: 'user', text: 'I cancelled my plumbing booking 9 days ago but have not received the refund yet.', at: hoursAgo(190) },
      { id: 'm2', from: 'support', text: 'Hi Aarav, sorry for the delay. The refund has been initiated and should reflect within 2 business days.', at: hoursAgo(180) },
    ],
    createdAt: hoursAgo(190), updatedAt: hoursAgo(180),
  },
  {
    id: 'tk_2', userId: 'u_c1', userName: 'Aarav Sharma', userRole: 'customer', subject: 'Change phone number on account', category: 'account', priority: 'low', status: 'resolved',
    messages: [
      { id: 'm1', from: 'user', text: 'How can I update my registered phone number?', at: hoursAgo(600) },
      { id: 'm2', from: 'support', text: 'You can now update it from Profile → Edit profile. We have enabled it for your account.', at: hoursAgo(590) },
    ],
    createdAt: hoursAgo(600), updatedAt: hoursAgo(590),
  },
  {
    id: 'tk_3', userId: 'u_c2', userName: 'Priya Nair', userRole: 'customer', subject: 'Payment deducted but booking not confirmed', category: 'payment', priority: 'high', status: 'open',
    messages: [{ id: 'm1', from: 'user', text: '₹1,299 was debited via UPI but the app shows payment failed.', at: hoursAgo(20) }],
    createdAt: hoursAgo(20), updatedAt: hoursAgo(20),
  },
  {
    id: 'tk_4', userId: 'u_p1', userName: 'Meera Iyer', userRole: 'provider', subject: 'Update GST details on invoices', category: 'account', priority: 'low', status: 'open',
    messages: [{ id: 'm1', from: 'user', text: 'Our GSTIN changed after re-registration. Please update it on invoices.', at: hoursAgo(40) }],
    createdAt: hoursAgo(40), updatedAt: hoursAgo(40),
  },
];

export const faqs: Faq[] = [
  { id: 'f1', audience: 'customer', question: 'How do I reschedule a booking?', answer: 'Open the booking from My Bookings and tap “Reschedule”. You can pick any available slot up to 3 hours before the scheduled time at no extra cost.' },
  { id: 'f2', audience: 'customer', question: 'What is the cancellation policy?', answer: 'Cancellations are free up to 3 hours before the slot. Later cancellations may attract a visiting fee charged by the provider.' },
  { id: 'f3', audience: 'customer', question: 'When will I receive my refund?', answer: 'Refunds to wallets are instant. Card and UPI refunds take 3–5 business days depending on your bank.' },
  { id: 'f4', audience: 'customer', question: 'Are professionals background-verified?', answer: 'Yes. Every provider submits government ID and address proof, and organisations submit business registration before approval.' },
  { id: 'f5', audience: 'customer', question: 'Why can I only add services from one provider?', answer: 'Each booking is fulfilled by a single provider so they can plan their team and time slot. Place separate bookings for different providers.' },
  { id: 'f6', audience: 'provider', question: 'When are payouts processed?', answer: 'Request a withdrawal once your balance exceeds ₹500. Approved payouts are transferred within 2 business days.' },
  { id: 'f7', audience: 'provider', question: 'How is commission calculated?', answer: 'The platform commission is a percentage of the service subtotal (excluding tax) set per category. You can see it on every booking breakdown.' },
  { id: 'f8', audience: 'delivery', question: 'How do I mark a task delivered?', answer: 'Ask the recipient for the 4-digit OTP shown in their app and enter it on the task screen.' },
  { id: 'f9', audience: 'all', question: 'How do I contact support?', answer: 'Raise a ticket from Help & Support. Our team responds within 4 working hours.' },
];

/* ───────────────────────────── Wallet & payouts ───────────────────────────── */

export const walletTxns: WalletTransaction[] = [
  { id: 'wt_1', userId: 'u_c1', type: 'credit', amount: 1000, title: 'Added via UPI', reference: 'UPI8823', createdAt: hoursAgo(400) },
  { id: 'wt_2', userId: 'u_c1', type: 'debit', amount: 637, title: 'Paid for SRV240211', reference: 'bk_4', createdAt: hoursAgo(96) },
  { id: 'wt_3', userId: 'u_c1', type: 'credit', amount: 150, title: 'Referral bonus — Rohan joined', createdAt: hoursAgo(60) },
  { id: 'wt_4', userId: 'u_c1', type: 'credit', amount: 250, title: 'Cashback on SRV240100', createdAt: hoursAgo(20) },
];

export const payouts: Payout[] = [
  { id: 'po_1', payeeId: 'prov_1', payeeName: 'SparkleClean Co.', payeeRole: 'provider', amount: 18450, status: 'paid', requestedAt: daysFromNow(-4), processedAt: daysFromNow(-2) },
  { id: 'po_2', payeeId: 'prov_1', payeeName: 'SparkleClean Co.', payeeRole: 'provider', amount: 12200, status: 'paid', requestedAt: daysFromNow(-19), processedAt: daysFromNow(-17) },
  { id: 'po_3', payeeId: 'prov_2', payeeName: 'CoolBreeze Appliance Care', payeeRole: 'provider', amount: 9800, status: 'requested', requestedAt: daysFromNow(-1) },
  { id: 'po_4', payeeId: 'prov_5', payeeName: 'Glow Studio at Home', payeeRole: 'provider', amount: 15600, status: 'requested', requestedAt: daysFromNow(-1) },
  { id: 'po_5', payeeId: 'dp_1', payeeName: 'Ravi Kumar', payeeRole: 'delivery', amount: 4820, status: 'paid', requestedAt: daysFromNow(-3), processedAt: daysFromNow(-3) },
  { id: 'po_6', payeeId: 'dp_2', payeeName: 'Mohammed Arif', payeeRole: 'delivery', amount: 2150, status: 'requested', requestedAt: daysFromNow(0) },
];

/* ───────────────────────────── Chat ───────────────────────────── */

export const chatThreads: ChatThread[] = [
  { id: 'ch_1', bookingId: 'bk_1', customerId: 'u_c1', providerId: 'prov_2', title: 'CoolBreeze Appliance Care', avatar: avatar(33), lastMessage: 'Our technician Arun will reach by 11.', updatedAt: hoursAgo(1), unread: 1 },
  { id: 'ch_2', bookingId: 'bk_2', customerId: 'u_c1', providerId: 'prov_1', title: 'SparkleClean Co.', avatar: avatar(47), lastMessage: 'Sure, we will bring the ladder.', updatedAt: hoursAgo(20), unread: 0 },
];
export const chatMessages: ChatMessage[] = [
  { id: 'cm_1', threadId: 'ch_1', senderId: 'u_c1', text: 'Hi, can the technician check the outdoor unit too?', at: hoursAgo(3) },
  { id: 'cm_2', threadId: 'ch_1', senderId: 'prov_2', text: 'Yes of course, outdoor unit cleaning is included.', at: hoursAgo(2.5) },
  { id: 'cm_3', threadId: 'ch_1', senderId: 'prov_2', text: 'Our technician Arun will reach by 11.', at: hoursAgo(1) },
  { id: 'cm_4', threadId: 'ch_2', senderId: 'u_c1', text: 'Please bring a ladder, the bathroom ceiling has a vent.', at: hoursAgo(21) },
  { id: 'cm_5', threadId: 'ch_2', senderId: 'prov_1', text: 'Sure, we will bring the ladder.', at: hoursAgo(20) },
];

export const seedTimestamp = now;
