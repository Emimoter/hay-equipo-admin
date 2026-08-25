import { z } from "zod";

// ==========================================
// 1. ENUMS & CONSTANTS
// ==========================================

export const SportTypeEnum = z.enum([
  "PADEL",
  "FUTBOL_5",
  "FUTBOL_7",
  "FUTBOL_8",
  "FUTBOL_11",
  "TENIS",
  "PICKLEBALL",
  "BASQUET",
  "VOLEY",
  "HOCKEY",
  "SQUASH"
]);
export type SportType = z.infer<typeof SportTypeEnum>;

export const BookingStatusEnum = z.enum([
  "AVAILABLE",
  "HELD",
  "CONFIRMED",
  "CANCELLED",
  "COMPLETED",
  "MANUAL_ENTRY"
]);
export type BookingStatus = z.infer<typeof BookingStatusEnum>;

export const PaymentStatusEnum = z.enum([
  "PENDING",
  "APPROVED",
  "REJECTED",
  "REFUNDED",
  "PARTIALLY_PAID"
]);
export type PaymentStatus = z.infer<typeof PaymentStatusEnum>;

export const SplitTypeEnum = z.enum(["EQUAL", "CUSTOM"]);
export type SplitType = z.infer<typeof SplitTypeEnum>;

export const SubscriptionStatusEnum = z.enum([
  "PENDING_APPROVAL",
  "ACTIVE",
  "PAUSED",
  "CANCELLED",
  "EXPIRED"
]);
export type SubscriptionStatus = z.infer<typeof SubscriptionStatusEnum>;

export const BillingFrequencyEnum = z.enum(["WEEKLY", "MONTHLY", "SEASON"]);
export type BillingFrequency = z.infer<typeof BillingFrequencyEnum>;

export const OccurrenceStatusEnum = z.enum([
  "SCHEDULED",
  "SKIPPED_BY_USER",
  "RELEASED_TO_MARKETPLACE",
  "COMPLETED",
  "CANCELLED"
]);
export type OccurrenceStatus = z.infer<typeof OccurrenceStatusEnum>;

// ==========================================
// 2. CORE SCHEMAS
// ==========================================

export const SportSchema = z.object({
  id: z.string(),
  name: z.string(),
  slug: z.string(),
  icon: z.string(),
  defaultDurationMinutes: z.number().default(90),
  active: z.boolean().default(true)
});
export type Sport = z.infer<typeof SportSchema>;

export const ClubAmenitiesSchema = z.object({
  parking: z.boolean().default(false),
  showers: z.boolean().default(false),
  lockerRooms: z.boolean().default(false),
  buffet: z.boolean().default(false),
  grill: z.boolean().default(false),
  wifi: z.boolean().default(false),
  equipmentRental: z.boolean().default(false),
  covered: z.boolean().default(false),
  lighting: z.boolean().default(true)
});
export type ClubAmenities = z.infer<typeof ClubAmenitiesSchema>;

export const ClubSchema = z.object({
  id: z.string(),
  name: z.string(),
  slug: z.string(),
  description: z.string().optional(),
  address: z.string(),
  city: z.string(),
  province: z.string(),
  latitude: z.number(),
  longitude: z.number(),
  phone: z.string(),
  whatsapp: z.string(),
  instagram: z.string().optional(),
  website: z.string().optional(),
  rating: z.number().min(1).max(5).default(4.8),
  reviewCount: z.number().default(0),
  images: z.array(z.string()),
  amenities: ClubAmenitiesSchema,
  openingTime: z.string().default("08:00"),
  closingTime: z.string().default("00:00"),
  minPrice: z.number().default(0),
  sports: z.array(z.string()).optional(),
  active: z.boolean().default(true)
});
export type Club = z.infer<typeof ClubSchema>;

export const CourtSchema = z.object({
  id: z.string(),
  clubId: z.string(),
  sportType: SportTypeEnum,
  name: z.string(),
  surface: z.string(), // Panorámica, Césped Sintético, Cemento, etc.
  isCovered: z.boolean(),
  hasLighting: z.boolean().default(true),
  durationMinutes: z.number().default(90),
  pricePerHour: z.number(),
  priceFixedSlotDiscount: z.number().default(0.1),
  images: z.array(z.string()).default([])
});
export type Court = z.infer<typeof CourtSchema>;

export const TimeSlotSchema = z.object({
  courtId: z.string(),
  courtName: z.string(),
  clubId: z.string(),
  clubName: z.string(),
  sportType: SportTypeEnum,
  date: z.string(),
  startTime: z.string(),
  endTime: z.string(),
  durationMinutes: z.number(),
  price: z.number(),
  fixedSlotPrice: z.number(),
  status: BookingStatusEnum,
  holdExpiresAt: z.string().optional()
});
export type TimeSlot = z.infer<typeof TimeSlotSchema>;

export const BookingSchema = z.object({
  id: z.string(),
  courtId: z.string(),
  courtName: z.string().optional(),
  clubId: z.string().optional(),
  clubName: z.string().optional(),
  sportType: SportTypeEnum.optional(),
  userId: z.string(),
  userName: z.string(),
  userPhone: z.string(),
  date: z.string(),
  startTime: z.string(),
  endTime: z.string(),
  totalPrice: z.number(),
  serviceFee: z.number().default(0),
  status: BookingStatusEnum,
  holdExpiresAt: z.string().optional(),
  paymentType: z.enum(["FULL", "SPLIT"]),
  paymentStatus: PaymentStatusEnum,
  isFixedSlot: z.boolean().default(false),
  splitToken: z.string().optional(),
  createdAt: z.string()
});
export type Booking = z.infer<typeof BookingSchema>;

export const SplitParticipantSchema = z.object({
  id: z.string(),
  splitPaymentId: z.string(),
  userId: z.string().optional(),
  name: z.string(),
  phone: z.string().optional(),
  amount: z.number(),
  status: z.enum(["PENDING", "PAID", "REFUNDED"]),
  paidAt: z.string().optional(),
  mpPaymentId: z.string().optional()
});
export type SplitParticipant = z.infer<typeof SplitParticipantSchema>;

export const SplitPaymentSchema = z.object({
  id: z.string(),
  bookingId: z.string(),
  totalAmount: z.number(),
  sharesCount: z.number(),
  splitType: SplitTypeEnum,
  shareToken: z.string(),
  status: PaymentStatusEnum,
  participants: z.array(SplitParticipantSchema)
});
export type SplitPayment = z.infer<typeof SplitPaymentSchema>;

export const FixedSlotSubscriptionSchema = z.object({
  id: z.string(),
  userId: z.string(),
  userName: z.string(),
  userPhone: z.string(),
  clubId: z.string(),
  clubName: z.string(),
  courtId: z.string(),
  courtName: z.string(),
  sportType: SportTypeEnum,
  dayOfWeek: z.number().min(0).max(6),
  startTime: z.string(),
  endTime: z.string(),
  startDate: z.string(),
  endDate: z.string().optional(),
  durationMonths: z.number().default(3),
  pricePerOccurrence: z.number(),
  discountMonthlyTotal: z.number(),
  billingFrequency: BillingFrequencyEnum,
  status: SubscriptionStatusEnum,
  autoRenew: z.boolean().default(true),
  occurrencesGenerated: z.number().default(0)
});
export type FixedSlotSubscription = z.infer<typeof FixedSlotSubscriptionSchema>;

export const RecurringOccurrenceSchema = z.object({
  id: z.string(),
  subscriptionId: z.string(),
  bookingId: z.string().optional(),
  date: z.string(),
  dayOfWeek: z.number(),
  startTime: z.string(),
  endTime: z.string(),
  courtName: z.string(),
  clubName: z.string(),
  status: OccurrenceStatusEnum,
  isPaid: z.boolean(),
  price: z.number()
});
export type RecurringOccurrence = z.infer<typeof RecurringOccurrenceSchema>;

// ==========================================
// 3. API REQUEST / RESPONSE CONTRACTS
// ==========================================

export const SearchAvailabilityQuerySchema = z.object({
  sport: SportTypeEnum.optional(),
  date: z.string().optional(),
  timeFrom: z.string().optional(),
  timeTo: z.string().optional(),
  latitude: z.coerce.number().optional(),
  longitude: z.coerce.number().optional(),
  maxDistanceKm: z.coerce.number().optional().default(15),
  isCovered: z.coerce.boolean().optional(),
  city: z.string().optional()
});
export type SearchAvailabilityQuery = z.infer<typeof SearchAvailabilityQuerySchema>;

export const HoldBookingRequestSchema = z.object({
  courtId: z.string(),
  date: z.string(),
  startTime: z.string(),
  userId: z.string(),
  userName: z.string(),
  userPhone: z.string(),
  paymentType: z.enum(["FULL", "SPLIT"]).default("FULL"),
  splitPlayerCount: z.number().min(2).max(22).optional()
});
export type HoldBookingRequest = z.infer<typeof HoldBookingRequestSchema>;

export const ConfirmPaymentRequestSchema = z.object({
  bookingId: z.string(),
  paymentMethod: z.string().default("MERCADO_PAGO"),
  mpPaymentId: z.string().optional()
});
export type ConfirmPaymentRequest = z.infer<typeof ConfirmPaymentRequestSchema>;

export const CreateManualBookingRequestSchema = z.object({
  clubId: z.string(),
  courtId: z.string(),
  date: z.string(),
  startTime: z.string(),
  endTime: z.string(),
  clientName: z.string(),
  clientPhone: z.string(),
  price: z.number(),
  notes: z.string().optional(),
  source: z.enum(["WHATSAPP", "PHONE", "COUNTER"]).default("WHATSAPP")
});
export type CreateManualBookingRequest = z.infer<typeof CreateManualBookingRequestSchema>;

export const LiberateOccurrenceRequestSchema = z.object({
  occurrenceId: z.string(),
  reason: z.string().optional()
});
export type LiberateOccurrenceRequest = z.infer<typeof LiberateOccurrenceRequestSchema>;
