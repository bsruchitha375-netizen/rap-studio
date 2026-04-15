import type { backendInterface } from "../backend";
import {
  BookingStatus,
  CmsContentType,
  CourseMode,
  CourseStatus,
  FeedbackTargetType,
  FileType,
  NotificationType,
  PaymentStatus,
  PaymentStatus__1,
  PaymentType,
  SlotStatus,
  TimeSlot,
  UserRole,
  UserRole__1,
  UserStatus,
} from "../backend";
import { Principal } from "@icp-sdk/core/principal";

const samplePrincipal = Principal.fromText("2vxsx-fae");
const now = BigInt(Date.now()) * BigInt(1_000_000);

export const mockBackend = {
  addFeedback: async (targetId: string, targetType: FeedbackTargetType, rating: bigint, comment: string) => ({
    id: BigInt(1),
    userId: samplePrincipal,
    createdAt: now,
    comment,
    targetType,
    rating,
    targetId,
  }),

  adminUpdatePayment: async () => true,

  assignCallerUserRole: async () => undefined,

  confirmBooking: async () => true,

  createBookingRequest: async (input) => ({
    id: BigInt(1),
    status: BookingStatus.Pending,
    duration: input.duration,
    userId: samplePrincipal,
    date: input.date,
    createdAt: now,
    subService: input.subService,
    notes: input.notes,
    serviceId: input.serviceId,
    location: input.location,
    timeSlot: input.timeSlot,
  }),

  createMultiServiceBooking: async () => BigInt(1),

  createPaymentOrder: async (amount, referenceId, paymentType) => ({
    id: BigInt(1),
    status: PaymentStatus.Created,
    userId: samplePrincipal,
    createdAt: now,
    referenceId,
    orderId: "order_demo123",
    razorpayOrderId: "rzp_order_demo123",
    currency: "INR",
    paymentType,
    amount,
  }),

  createSystemNotification: async (userId, message, notifType) => ({
    id: BigInt(1),
    userId,
    notificationType: notifType,
    createdAt: now,
    read: false,
    message,
  }),

  deleteCmsContent: async () => undefined,

  deleteMedia: async () => true,

  enrollCourse: async (courseId) => ({
    id: BigInt(1),
    paymentStatus: PaymentStatus__1.Pending,
    userId: samplePrincipal,
    progress: BigInt(0),
    enrolledAt: now,
    courseId,
  }),

  generateCertificate: async (enrollmentId) => ({
    id: BigInt(1),
    verified: true,
    enrollmentId,
    studentName: "Ruchitha B S",
    code: "RAP-CERT-2024-001",
    issuedAt: now,
    courseName: "Photography Fundamentals",
    courseId: BigInt(1),
  }),

  getAdminPayments: async () => [
    {
      id: BigInt(1),
      status: "Paid",
      userId: samplePrincipal,
      createdAt: now,
      referenceId: "booking_1",
      orderId: "order_001",
      razorpayOrderId: "rzp_order_001",
      currency: "INR",
      paymentType: "BookingUpfront",
      selectedServices: [
        { name: "Portrait Photography", subServiceId: "sub1", serviceId: "s1", price: BigInt(500) },
      ],
      amount: BigInt(200),
    },
  ],

  getAllBookings: async () => [
    {
      id: BigInt(1),
      status: BookingStatus.Confirmed,
      duration: "2 hours",
      userId: samplePrincipal,
      date: "2024-12-25",
      createdAt: now,
      subService: "Portrait Session",
      serviceId: "photography",
      location: { __kind__: "Studio", Studio: null },
      timeSlot: TimeSlot.Morning,
    },
  ],

  getAllCmsContent: async () => [
    {
      key: "hero_title",
      contentType: CmsContentType.text,
      value: "RAP Integrated Studio",
      updatedAt: now,
      updatedBy: samplePrincipal,
    },
    {
      key: "primary_color",
      contentType: CmsContentType.color,
      value: "#B8860B",
      updatedAt: now,
      updatedBy: samplePrincipal,
    },
  ],

  getAllCourses: async () => [
    {
      id: BigInt(1),
      status: CourseStatus.Active,
      title: "Photography Fundamentals",
      duration: "4 weeks",
      prerequisites: [],
      mode: CourseMode.Online,
      description: "Master the art of photography from scratch.",
      imageUrl: "https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=400",
      category: "Photography",
      price: BigInt(500),
    },
    {
      id: BigInt(2),
      status: CourseStatus.Active,
      title: "Videography & Film Making",
      duration: "6 weeks",
      prerequisites: ["Basic photography knowledge"],
      mode: CourseMode.Hybrid,
      description: "Professional video production and storytelling.",
      imageUrl: "https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?w=400",
      category: "Videography",
      price: BigInt(700),
    },
  ],

  getAllEnrollments: async () => [
    {
      id: BigInt(1),
      paymentStatus: PaymentStatus__1.FullyPaid,
      userId: samplePrincipal,
      progress: BigInt(75),
      enrolledAt: now,
      courseId: BigInt(1),
    },
  ],

  getAllFeedback: async () => [
    {
      id: BigInt(1),
      userId: samplePrincipal,
      createdAt: now,
      comment: "Excellent service! Very professional.",
      targetType: FeedbackTargetType.Service,
      rating: BigInt(5),
      targetId: "photography",
    },
  ],

  getAllPayments: async () => [
    {
      id: BigInt(1),
      status: PaymentStatus.Paid,
      userId: samplePrincipal,
      createdAt: now,
      referenceId: "booking_1",
      orderId: "order_001",
      razorpayOrderId: "rzp_order_001",
      currency: "INR",
      paymentType: PaymentType.BookingUpfront,
      amount: BigInt(200),
    },
  ],

  getAllUsers: async () => [
    {
      status: UserStatus.Active,
      created: now,
      principal: samplePrincipal,
      name: "Ruchitha B S",
      role: UserRole.Admin,
      email: "ruchithabs550@gmail.com",
      phone: "7338501228",
    },
  ],

  getAnalytics: async () => ({
    pendingFeedbackCount: BigInt(2),
    pendingBookings: BigInt(5),
    totalEnrollments: BigInt(23),
    emailLogCount: BigInt(18),
    cancelledBookings: BigInt(1),
    totalBookings: BigInt(42),
    totalCourseRevenue: BigInt(11500),
    totalFeedback: BigInt(15),
    confirmedBookings: BigInt(30),
    completedBookings: BigInt(25),
    totalRevenue: BigInt(21000),
    revenueByService: [
      { serviceName: "Photography", revenue: BigInt(8000), serviceId: "photography", bookingCount: BigInt(16) },
      { serviceName: "Videography", revenue: BigInt(7000), serviceId: "videography", bookingCount: BigInt(14) },
    ],
  }),

  getCallerUserProfile: async () => ({
    status: UserStatus.Active,
    created: now,
    principal: samplePrincipal,
    name: "Ruchitha B S",
    role: UserRole.Admin,
    email: "ruchithabs550@gmail.com",
    phone: "7338501228",
  }),

  getCallerUserRole: async () => UserRole__1.admin,

  getCertificate: async () => ({
    id: BigInt(1),
    verified: true,
    enrollmentId: BigInt(1),
    studentName: "Ruchitha B S",
    code: "RAP-CERT-2024-001",
    issuedAt: now,
    courseName: "Photography Fundamentals",
    courseId: BigInt(1),
  }),

  getCmsContent: async (key) => ({
    key,
    contentType: CmsContentType.text,
    value: "RAP Studio",
    updatedAt: now,
    updatedBy: samplePrincipal,
  }),

  getCourse: async (courseId) => ({
    id: courseId,
    status: CourseStatus.Active,
    title: "Photography Fundamentals",
    duration: "4 weeks",
    prerequisites: [],
    mode: CourseMode.Online,
    description: "Master the art of photography from scratch.",
    imageUrl: "https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=400",
    category: "Photography",
    price: BigInt(500),
  }),

  getEmailLogs: async () => [
    {
      id: BigInt(1),
      to: "ruchithabs550@gmail.com",
      subject: "Booking Confirmed",
      body: "Your booking has been confirmed.",
      createdAt: now,
      relatedId: "booking_1",
    },
  ],

  getFeedbackForTarget: async () => [],

  getMediaItems: async () => [
    {
      id: BigInt(1),
      title: "Studio Portrait",
      serviceCategory: "Photography",
      featured: true,
      blob: { getBytes: async () => new Uint8Array(), directURL: "https://images.unsplash.com/photo-1542038784456-1ea8e935640e?w=400", getDirectURL: () => "https://images.unsplash.com/photo-1542038784456-1ea8e935640e?w=400", withUploadProgress: () => ({ getBytes: async () => new Uint8Array(), directURL: "", getDirectURL: () => "", withUploadProgress: (fn: unknown) => ({} as never) }) as never },
      date: now,
      fileType: FileType.Photo,
      uploadedBy: samplePrincipal,
    },
  ],

  getMyBookings: async () => [
    {
      id: BigInt(1),
      status: BookingStatus.Confirmed,
      duration: "2 hours",
      userId: samplePrincipal,
      date: "2024-12-25",
      createdAt: now,
      subService: "Portrait Session",
      serviceId: "photography",
      location: { __kind__: "Studio", Studio: null },
      timeSlot: TimeSlot.Morning,
    },
  ],

  getMyEnrollments: async () => [
    {
      id: BigInt(1),
      paymentStatus: PaymentStatus__1.FullyPaid,
      userId: samplePrincipal,
      progress: BigInt(75),
      enrolledAt: now,
      courseId: BigInt(1),
    },
  ],

  getMyFeedback: async () => [],

  getMyMultiServiceBookings: async () => [
    {
      id: BigInt(1),
      status: "Confirmed",
      userId: samplePrincipal,
      date: "2024-12-25",
      createdAt: now,
      totalAmount: BigInt(1200),
      selectedServices: [
        { name: "Portrait Photography", subServiceId: "sub1", serviceId: "s1", price: BigInt(500) },
        { name: "Video Production", subServiceId: "sub2", serviceId: "s2", price: BigInt(700) },
      ],
      location: "Studio",
      timeSlot: "Morning",
    },
  ],

  getMyNotifications: async () => [
    {
      id: BigInt(1),
      userId: samplePrincipal,
      notificationType: NotificationType.BookingConfirmed,
      createdAt: now,
      read: false,
      message: "Your booking has been confirmed for Dec 25.",
    },
  ],

  getMyPayments: async () => [
    {
      id: BigInt(1),
      status: PaymentStatus.Paid,
      userId: samplePrincipal,
      createdAt: now,
      referenceId: "booking_1",
      orderId: "order_001",
      razorpayOrderId: "rzp_order_001",
      currency: "INR",
      paymentType: PaymentType.BookingUpfront,
      amount: BigInt(200),
    },
  ],

  getMyProfile: async () => ({
    status: UserStatus.Active,
    created: now,
    principal: samplePrincipal,
    name: "Ruchitha B S",
    role: UserRole.Admin,
    email: "ruchithabs550@gmail.com",
    phone: "7338501228",
  }),

  getPaymentDetails: async (paymentId) => ({
    id: paymentId,
    status: "Paid",
    userId: samplePrincipal,
    createdAt: now,
    referenceId: "booking_1",
    orderId: "order_001",
    razorpayOrderId: "rzp_order_001",
    currency: "INR",
    paymentType: "BookingUpfront",
    selectedServices: [],
    amount: BigInt(200),
  }),

  getPublicCalendar: async () => [
    { status: SlotStatus.Taken, date: "2024-12-25", timeSlot: TimeSlot.Morning },
    { status: SlotStatus.Available, date: "2024-12-26", timeSlot: TimeSlot.Afternoon },
  ],

  getServiceCategories: async () => [
    {
      id: "photography",
      subServices: [
        { id: "portrait", name: "Portrait Photography" },
        { id: "wedding", name: "Wedding Photography" },
      ],
      icon: "📸",
      name: "Photography",
      description: "Professional photography services for all occasions.",
    },
    {
      id: "videography",
      subServices: [
        { id: "commercial", name: "Commercial Video" },
        { id: "shortfilm", name: "Short Film Production" },
      ],
      icon: "🎬",
      name: "Videography",
      description: "Cinematic videography and film production.",
    },
  ],

  isCallerAdmin: async () => true,

  logBookingConfirmedEmail: async (toAddress, bookingId, serviceName, date) => ({
    id: BigInt(1),
    to: toAddress,
    subject: `Booking Confirmed: ${serviceName}`,
    body: `Your booking for ${serviceName} on ${date} has been confirmed.`,
    createdAt: now,
    relatedId: bookingId,
  }),

  logEnrollmentConfirmedEmail: async (toAddress, enrollmentId, courseTitle) => ({
    id: BigInt(1),
    to: toAddress,
    subject: `Enrollment Confirmed: ${courseTitle}`,
    body: `Your enrollment in ${courseTitle} has been confirmed.`,
    createdAt: now,
    relatedId: enrollmentId,
  }),

  manageUser: async () => true,

  markEnrollmentPaid: async () => true,

  markNotificationRead: async () => true,

  markWorkDelivered: async () => true,

  register: async (name, phone, role) => ({
    status: UserStatus.Active,
    created: now,
    principal: samplePrincipal,
    name,
    role,
    email: "ruchithabs550@gmail.com",
    phone,
  }),

  respondToFeedback: async () => true,

  saveCallerUserProfile: async () => undefined,

  sendWhatsAppNotification: async () => true,

  setCmsContent: async () => undefined,

  setFeatured: async () => true,

  transform: async (input) => ({
    status: BigInt(200),
    body: new Uint8Array(),
    headers: [],
  }),

  triggerPaymentRequest: async () => "payment_link_demo",

  updateCourseProgress: async () => true,

  updateProfile: async () => true,

  uploadMedia: async (input) => ({
    id: BigInt(1),
    title: input.title,
    serviceCategory: input.serviceCategory,
    featured: false,
    blob: input.blob,
    date: now,
    fileType: input.fileType,
    uploadedBy: samplePrincipal,
  }),

  verifyCertificate: async () => true,

  verifyPayment: async () => true,
} as unknown as backendInterface;
