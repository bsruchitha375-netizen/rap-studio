// ─── Stripe types ────────────────────────────────────────────────────────────

export interface StripeCheckoutState {
  sessionId: string;
  referenceId: string;
  paymentType: "booking_initial" | "booking_final" | "course_enrollment";
  amount: number;
  name: string;
}

// ─── User & Auth ─────────────────────────────────────────────────────────────

export type UserRole =
  | "admin"
  | "staff"
  | "receptionist"
  | "client"
  | "student";

export interface UserProfile {
  id: string;
  name: string;
  phone: string;
  role: UserRole;
  email?: string;
  createdAt: bigint;
  isActive: boolean;
}

// ─── Services ────────────────────────────────────────────────────────────────

export interface SubService {
  id: string;
  name: string;
  description: string;
  duration: string;
  price: number;
}

export interface ServiceCategory {
  id: string;
  name: string;
  emoji: string;
  description: string;
  subServices: SubService[];
  coverImage?: string;
  featured: boolean;
}

// ─── Booking ─────────────────────────────────────────────────────────────────

export type BookingStatus =
  | "pending"
  | "reviewing"
  | "awaiting_payment"
  | "confirmed"
  | "in_progress"
  | "delivered"
  | "awaiting_final_payment"
  | "completed"
  | "cancelled";

export type TimeSlot =
  | "morning"
  | "afternoon"
  | "evening"
  | "night"
  | "half_day"
  | "full_day";

export type LocationType = "indoor" | "outdoor" | "studio" | "custom";

export interface BookingLocation {
  type: LocationType;
  customAddress?: string;
  placeName?: string;
}

export interface BookingInput {
  serviceCategoryId: string;
  subServiceId: string;
  date: string;
  timeSlot: TimeSlot;
  duration: string;
  location: BookingLocation;
  notes?: string;
}

export interface BookingSlot {
  date: string;
  timeSlot: TimeSlot;
  isBooked: boolean;
  label: string;
}

export interface BookingRequest {
  id: string;
  clientId: string;
  clientName: string;
  serviceCategoryId: string;
  subServiceId: string;
  date: string;
  timeSlot: TimeSlot;
  duration: string;
  location: BookingLocation;
  notes?: string;
  status: BookingStatus;
  initialPaymentAmount: number;
  finalPaymentAmount: number;
  createdAt: bigint;
  updatedAt: bigint;
}

// ─── Courses ─────────────────────────────────────────────────────────────────

export type CourseMode = "online" | "offline" | "hybrid";
export type CourseCategory =
  | "photography"
  | "videography"
  | "editing"
  | "business"
  | "specialized";

export interface Course {
  id: string;
  title: string;
  category: CourseCategory;
  mode: CourseMode;
  description: string;
  duration: string;
  price: number;
  thumbnail?: string;
  image?: string;
  instructor: string;
  syllabusHighlights: string[];
  totalStudents: number;
  rating: number;
}

export type EnrollmentStatus =
  | "active"
  | "overdue"
  | "completed"
  | "certificate_blocked";

export interface CourseEnrollment {
  id: string;
  courseId: string;
  studentId: string;
  enrolledAt: bigint;
  status: EnrollmentStatus;
  progress: number;
  paymentStatus: PaymentStatus;
  certificateCode?: string;
  completedAt?: bigint;
}

// ─── Payments ────────────────────────────────────────────────────────────────

export type PaymentStatus =
  | "pending"
  | "initiated"
  | "paid"
  | "failed"
  | "refunded";
export type PaymentType =
  | "booking_initial"
  | "booking_final"
  | "course_enrollment";

export interface PaymentOrder {
  id: string;
  /** @deprecated use stripeSessionId */
  razorpayOrderId?: string;
  stripeSessionId?: string;
  stripePaymentIntentId?: string;
  referenceId: string;
  paymentType: PaymentType;
  amount: number;
  status: PaymentStatus;
  checkoutUrl?: string;
  createdAt: bigint;
  paidAt?: bigint;
}

export interface StripeConfirmation {
  stripeSessionId: string;
  stripePaymentIntentId: string;
}

// ─── Certificates ────────────────────────────────────────────────────────────

export interface Certificate {
  code: string;
  studentName: string;
  courseName: string;
  issuedAt: bigint;
  isValid: boolean;
}

// ─── Feedback ────────────────────────────────────────────────────────────────

export interface FeedbackRecord {
  id: string;
  userId: string;
  targetId: string;
  targetType: "Service" | "Course";
  rating: number;
  comment: string;
  createdAt: bigint;
}

// ─── Media ───────────────────────────────────────────────────────────────────

export interface MediaItem {
  id: string;
  title: string;
  category: string;
  url: string;
  thumbnailUrl: string;
  type: "image" | "video";
  createdAt: bigint;
}

// ─── Notifications ───────────────────────────────────────────────────────────

export interface NotificationRecord {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: "booking" | "payment" | "course" | "system";
  isRead: boolean;
  createdAt: bigint;
}

// ─── Analytics ───────────────────────────────────────────────────────────────

export interface BookingStats {
  totalBookings: number;
  pendingBookings: number;
  confirmedBookings: number;
  completedBookings: number;
  totalRevenue: number;
  totalStudents: number;
  totalCourseEnrollments: number;
  recentActivity: RecentActivity[];
}

export interface RecentActivity {
  id: string;
  type: string;
  description: string;
  timestamp: bigint;
}
