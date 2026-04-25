import type { backendInterface } from "../backend";
import {
  ActivityEventKind,
  AssignmentStatus,
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

const sampleLesson = {
  id: BigInt(1),
  title: "Introduction to Photography",
  order: BigInt(1),
  description: "Learn the basics of camera settings, exposure, and composition.",
  quizQuestions: [
    {
      id: BigInt(1),
      lessonId: BigInt(1),
      question: "What does ISO control in a camera?",
      correctOptionIndex: BigInt(1),
      options: ["Shutter speed", "Sensor sensitivity", "Aperture", "White balance"],
    },
    {
      id: BigInt(2),
      lessonId: BigInt(1),
      question: "Which aperture setting allows more light?",
      correctOptionIndex: BigInt(0),
      options: ["f/1.8", "f/8", "f/16", "f/22"],
    },
    {
      id: BigInt(3),
      lessonId: BigInt(1),
      question: "What is the rule of thirds?",
      correctOptionIndex: BigInt(2),
      options: [
        "Divide exposure into thirds",
        "Use three lenses",
        "A composition guideline dividing frame into a 3x3 grid",
        "Shoot in thirds of a second",
      ],
    },
  ],
  youtubeUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
  courseId: BigInt(1),
};

const sampleLesson2 = {
  id: BigInt(2),
  title: "Lighting Techniques",
  order: BigInt(2),
  description: "Master natural and artificial lighting for stunning shots.",
  quizQuestions: [
    {
      id: BigInt(4),
      lessonId: BigInt(2),
      question: "What is the golden hour?",
      correctOptionIndex: BigInt(1),
      options: ["Midday sunlight", "Shortly after sunrise or before sunset", "Night time", "Cloudy day"],
    },
  ],
  youtubeUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
  courseId: BigInt(1),
};

export const mockBackend: backendInterface = {
  addFeedback: async (targetId, targetType, rating, comment) => ({
    id: BigInt(1),
    userId: samplePrincipal,
    createdAt: now,
    comment,
    targetType,
    rating,
    targetId,
  }),

  addLesson: async (input) => ({
    id: BigInt(Date.now()),
    title: input.title,
    order: input.order,
    description: input.description,
    quizQuestions: [],
    youtubeUrl: input.youtubeUrl,
    courseId: input.courseId,
  }),

  addQuizQuestion: async (input) => ({
    ...sampleLesson,
    id: input.lessonId,
  }),

  adminAddCourse: async (input) => ({
    id: BigInt(Date.now()),
    status: input.status,
    title: input.title,
    duration: input.duration,
    imageBlob: input.imageData,
    prerequisites: input.prerequisites,
    mode: input.mode,
    createdAt: now,
    description: input.description,
    category: input.category,
    price: input.price,
  }),

  adminAddService: async (input) => ({
    id: BigInt(Date.now()),
    imageBlob: input.imageData,
    subServices: input.subServices,
    icon: input.icon,
    name: input.name,
    createdAt: now,
    description: input.description,
  }),

  adminAdjustAmount: async () => true,
  adminConfirmPayment: async () => true,

  adminCreateUser: async (email, name, phone, passwordHash, role) => ({
    __kind__: "ok" as const,
    ok: {
      id: samplePrincipal,
      status: UserStatus.Active,
      name,
      role,
      email,
      phone,
      registeredAt: now,
    },
  }),

  adminDeleteCourse: async () => true,
  adminDeleteService: async () => true,

  adminGetAllCourseProgress: async () => [
    {
      studentId: samplePrincipal,
      overallPercent: BigInt(75),
      completedLessonIds: [BigInt(1)],
      certificateEarned: false,
      currentLessonId: BigInt(2),
      courseId: BigInt(1),
    },
  ],

  adminGetAllPayments: async () => [
    {
      id: BigInt(1),
      signatureVerified: true,
      status: PaymentStatus.Paid,
      userId: samplePrincipal,
      createdAt: now,
      referenceId: "booking_1",
      orderId: "order_001",
      currency: "INR",
      paymentType: PaymentType.BookingUpfront,
      amount: BigInt(50000),
    },
  ],

  adminRefundPayment: async () => true,
  adminUpdateCourse: async () => true,

  adminUpdatePayment: async () => true,

  adminUpdateService: async () => true,

  approveUser: async () => ({ __kind__: "ok" as const, ok: null }),

  assignCallerUserRole: async () => undefined,

  assignWork: async (input) => ({
    id: BigInt(1),
    status: AssignmentStatus.Assigned,
    bookingId: input.bookingId,
    assignedAt: now,
    sessionDate: input.sessionDate,
    staffId: input.staffId,
    clientName: "Sample Client",
    sessionType: input.sessionType,
    notes: input.notes,
    deliverables: [],
  }),

  confirmBooking: async () => true,
  confirmPayment: async () => true,

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
    signatureVerified: false,
    status: PaymentStatus.Created,
    userId: samplePrincipal,
    createdAt: now,
    referenceId,
    orderId: "order_demo123",
    currency: "INR",
    paymentType,
    amount,
    checkoutUrl: "https://checkout.stripe.com/demo",
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
  deleteSubServiceImage: async () => undefined,

  deleteUser: async () => ({ __kind__: "ok" as const, ok: null }),

  editLesson: async () => true,
  editQuizQuestion: async () => true,

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

  getAdminCourseBlob: async () => null,

  getAdminPaymentDashboard: async () => [
    {
      clientName: "Ashitha S",
      order: {
        id: BigInt(1),
        signatureVerified: true,
        status: PaymentStatus.Paid,
        userId: samplePrincipal,
        createdAt: now,
        referenceId: "enrollment_1",
        orderId: "order_001",
        currency: "INR",
        paymentType: PaymentType.CourseEnrollment,
        amount: BigInt(50000),
      },
      clientPhone: "9876543210",
    },
  ],

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
        { name: "Portrait Photography", subServiceId: "sub1", serviceId: "s1", price: BigInt(50000) },
      ],
      amount: BigInt(50000),
    },
  ],

  getAdminServiceBlob: async () => null,

  getAdminUsers: async () => [
    {
      id: samplePrincipal,
      status: UserStatus.Active,
      name: "Ruchitha B S",
      role: UserRole.Admin,
      email: "ruchithabs550@gmail.com",
      phone: "7338501228",
      registeredAt: now,
    },
    {
      id: samplePrincipal,
      status: UserStatus.Active,
      name: "Ashitha S",
      role: UserRole.Student,
      email: "ashitha@rapstudio.com",
      phone: "9876543210",
      registeredAt: now,
    },
  ],

  getAllActivityEvents: async () => [
    {
      id: "evt_1",
      title: "New Student Registration",
      userId: samplePrincipal,
      kind: ActivityEventKind.Registration,
      detail: "Ashitha S registered as Student",
      timestamp: now,
    },
    {
      id: "evt_2",
      title: "Course Enrollment",
      userId: samplePrincipal,
      kind: ActivityEventKind.Enrollment,
      detail: "Enrolled in Photography Fundamentals",
      timestamp: now,
    },
  ],

  getAllAdminCourses: async () => [
    {
      id: BigInt(1),
      status: CourseStatus.Active,
      title: "Photography Fundamentals",
      duration: "4 weeks",
      prerequisites: [],
      mode: CourseMode.Online,
      createdAt: now,
      description: "Master the art of photography from scratch.",
      category: "Photography",
      price: BigInt(50000),
    },
    {
      id: BigInt(2),
      status: CourseStatus.Active,
      title: "Videography & Film Making",
      duration: "6 weeks",
      prerequisites: ["Basic photography"],
      mode: CourseMode.Hybrid,
      createdAt: now,
      description: "Professional video production and storytelling.",
      category: "Videography",
      price: BigInt(70000),
    },
  ],

  getAllAdminServices: async () => [
    {
      id: BigInt(1),
      subServices: [
        { id: "portrait", name: "Portrait Photography" },
        { id: "wedding", name: "Wedding Photography" },
      ],
      icon: "📸",
      name: "Photography",
      createdAt: now,
      description: "Professional photography services for all occasions.",
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
      location: { __kind__: "Studio" as const, Studio: null },
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
      price: BigInt(50000),
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
      price: BigInt(70000),
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
      signatureVerified: true,
      status: PaymentStatus.Paid,
      userId: samplePrincipal,
      createdAt: now,
      referenceId: "booking_1",
      orderId: "order_001",
      currency: "INR",
      paymentType: PaymentType.BookingUpfront,
      amount: BigInt(50000),
    },
  ],

  getAllSubServiceImages: async () => [],

  getAllUsers: async () => [
    {
      id: samplePrincipal,
      status: UserStatus.Active,
      name: "Ruchitha B S",
      role: UserRole.Admin,
      email: "ruchithabs550@gmail.com",
      phone: "7338501228",
      registeredAt: now,
    },
    {
      id: samplePrincipal,
      status: UserStatus.Active,
      name: "Ashitha S",
      role: UserRole.Student,
      email: "ashitha@rapstudio.com",
      phone: "9876543210",
      registeredAt: now,
    },
    {
      id: samplePrincipal,
      status: UserStatus.Pending,
      name: "Prarthana R",
      role: UserRole.Receptionist,
      email: "prarthana@rapstudio.com",
      phone: "8765432109",
      registeredAt: now,
    },
  ],

  getAllWorkAssignments: async () => [
    {
      id: BigInt(1),
      status: AssignmentStatus.InProgress,
      bookingId: BigInt(1),
      assignedAt: now,
      sessionDate: "2024-12-25",
      staffId: samplePrincipal,
      clientName: "Sample Client",
      sessionType: "Portrait Photography",
      deliverables: [],
    },
  ],

  getAnalytics: async () => ({
    pendingFeedbackCount: BigInt(2),
    pendingBookings: BigInt(5),
    totalEnrollments: BigInt(23),
    emailLogCount: BigInt(18),
    cancelledBookings: BigInt(1),
    totalBookings: BigInt(42),
    totalCourseRevenue: BigInt(1150000),
    totalMultiServiceBookings: BigInt(8),
    totalFeedback: BigInt(15),
    confirmedBookings: BigInt(30),
    completedBookings: BigInt(25),
    totalUsers: BigInt(47),
    totalRevenue: BigInt(2100000),
    totalCmsEntries: BigInt(12),
    revenueByService: [
      { serviceName: "Photography", revenue: BigInt(800000), serviceId: "photography", bookingCount: BigInt(16) },
      { serviceName: "Videography", revenue: BigInt(700000), serviceId: "videography", bookingCount: BigInt(14) },
    ],
  }),

  getBookingsByDate: async () => [],

  getCallerUserProfile: async () => ({
    id: samplePrincipal,
    status: UserStatus.Active,
    name: "Ruchitha B S",
    role: UserRole.Admin,
    email: "ruchithabs550@gmail.com",
    phone: "7338501228",
    registeredAt: now,
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
    price: BigInt(50000),
  }),

  getCourseProgress: async (courseId) => ({
    studentId: samplePrincipal,
    overallPercent: BigInt(75),
    completedLessonIds: [BigInt(1)],
    certificateEarned: false,
    currentLessonId: BigInt(2),
    courseId,
  }),

  getEmailLogs: async () => [
    {
      id: BigInt(1),
      to: "ruchithabs550@gmail.com",
      subject: "Booking Confirmed",
      body: "Your booking has been confirmed.",
      createdAt: now,
      sent: true,
      relatedId: "booking_1",
    },
  ],

  getEnrollmentById: async (enrollmentId) => ({
    id: enrollmentId,
    paymentStatus: PaymentStatus__1.FullyPaid,
    userId: samplePrincipal,
    progress: BigInt(75),
    enrolledAt: now,
    courseId: BigInt(1),
  }),

  getFeedbackForTarget: async () => [],

  getLessonProgressForCourse: async () => [
    {
      lessonId: BigInt(1),
      completedAt: now,
      studentId: samplePrincipal,
      quizScore: BigInt(8),
      videoWatched: true,
      quizPassed: true,
    },
    {
      lessonId: BigInt(2),
      studentId: samplePrincipal,
      videoWatched: false,
      quizPassed: false,
    },
  ],

  getLessons: async () => [sampleLesson, sampleLesson2],

  getMediaItems: async () => [
    {
      id: BigInt(1),
      title: "Studio Portrait",
      serviceCategory: "Photography",
      featured: true,
      blob: {
        getBytes: async () => new Uint8Array(),
        getDirectURL: () => "https://images.unsplash.com/photo-1542038784456-1ea8e935640e?w=400",
        withUploadProgress: () => ({}) as never,
      } as never,
      date: now,
      fileType: FileType.Photo,
      uploadedBy: samplePrincipal,
    },
  ],

  getMyAssignedWork: async () => [
    {
      id: BigInt(1),
      status: AssignmentStatus.InProgress,
      bookingId: BigInt(1),
      assignedAt: now,
      sessionDate: "2024-12-25",
      staffId: samplePrincipal,
      clientName: "Sample Client",
      sessionType: "Portrait Photography",
      deliverables: [],
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
      location: { __kind__: "Studio" as const, Studio: null },
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
      totalAmount: BigInt(120000),
      selectedServices: [
        { name: "Portrait Photography", subServiceId: "sub1", serviceId: "s1", price: BigInt(50000) },
        { name: "Video Production", subServiceId: "sub2", serviceId: "s2", price: BigInt(70000) },
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
    {
      id: BigInt(2),
      userId: samplePrincipal,
      notificationType: NotificationType.CourseEnrolled,
      createdAt: now,
      read: true,
      message: "You have successfully enrolled in Photography Fundamentals.",
    },
  ],

  getMyPayments: async () => [
    {
      id: BigInt(1),
      signatureVerified: true,
      status: PaymentStatus.Paid,
      userId: samplePrincipal,
      createdAt: now,
      referenceId: "booking_1",
      orderId: "order_001",
      currency: "INR",
      paymentType: PaymentType.BookingUpfront,
      amount: BigInt(50000),
    },
  ],

  getMyProfile: async () => ({
    id: samplePrincipal,
    status: UserStatus.Active,
    name: "Ruchitha B S",
    role: UserRole.Student,
    email: "ruchithabs550@gmail.com",
    phone: "7338501228",
    registeredAt: now,
  }),

  getMyUploadedWork: async () => [],

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
    amount: BigInt(50000),
  }),

  getPaymentStatus: async (paymentId) => ({
    signatureVerified: true,
    status: PaymentStatus.Paid,
    orderId: "order_001",
    paymentId,
    stripePaymentIntentId: "pi_demo123",
    stripeSessionId: "cs_demo123",
    verifiedAt: now,
  }),

  getPublicCalendar: async () => [
    { status: SlotStatus.Taken, date: "2024-12-25", timeSlot: TimeSlot.Morning },
    { status: SlotStatus.Available, date: "2024-12-26", timeSlot: TimeSlot.Afternoon },
  ],

  getPublicProfile: async () => null,

  getRecentActivity: async () => [
    {
      id: "evt_1",
      title: "New Student Registration",
      userId: samplePrincipal,
      kind: ActivityEventKind.Registration,
      detail: "Ashitha S registered as Student",
      timestamp: now,
    },
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

  getSubServiceImage: async () => null,
  getSubServiceImageBlob: async () => null,
  getWhatsAppLogs: async () => [],

  isCallerAdmin: async () => false,

  listMyPayments: async () => [
    {
      id: BigInt(1),
      signatureVerified: true,
      status: PaymentStatus.Paid,
      userId: samplePrincipal,
      createdAt: now,
      referenceId: "enrollment_1",
      orderId: "order_001",
      currency: "INR",
      paymentType: PaymentType.CourseEnrollment,
      amount: BigInt(50000),
    },
  ],

  listPendingUsers: async () => [
    {
      id: samplePrincipal,
      status: UserStatus.Pending,
      name: "Prarthana R",
      role: UserRole.Receptionist,
      email: "prarthana@rapstudio.com",
      phone: "8765432109",
      registeredAt: now,
    },
  ],

  loginByEmail: async (email) => ({
    __kind__: "ok" as const,
    ok: {
      id: samplePrincipal,
      status: UserStatus.Active,
      name: "Ruchitha B S",
      role: UserRole.Student,
      email,
      phone: "7338501228",
      registeredAt: now,
    },
  }),

  loginByIdentifier: async (identifier) => ({
    __kind__: "ok" as const,
    ok: {
      id: samplePrincipal,
      status: UserStatus.Active,
      name: "Ruchitha B S",
      role: UserRole.Student,
      email: identifier,
      phone: "7338501228",
      registeredAt: now,
    },
  }),

  manageUser: async () => true,
  markCourseComplete: async () => ({ __kind__: "ok" as const, ok: "completed" }),
  markEnrollmentPaid: async () => true,
  markNotificationRead: async () => true,

  markVideoWatched: async (lessonId) => ({
    lessonId,
    studentId: samplePrincipal,
    videoWatched: true,
    quizPassed: false,
  }),

  markWorkDelivered: async () => true,

  register: async (email, name, phone, passwordHash, role) => ({
    __kind__: "ok" as const,
    ok: {
      id: samplePrincipal,
      status: UserStatus.Active,
      name,
      role,
      email,
      phone,
      registeredAt: now,
    },
  }),

  rejectBooking: async () => true,
  rejectUser: async () => ({ __kind__: "ok" as const, ok: null }),
  removeLesson: async () => true,
  removeQuizQuestion: async () => true,
  rescheduleBooking: async () => true,
  respondToFeedback: async () => true,
  saveCallerUserProfile: async () => undefined,

  sendBookingConfirmation: async () => true,
  sendCompletionMessage: async () => true,
  sendPaymentReceipt: async () => true,
  sendProgressReminder: async () => true,

  setCmsContent: async () => undefined,
  setFeatured: async () => true,
  setSubServiceImage: async () => undefined,

  submitDeliverable: async () => true,

  submitQuiz: async (lessonId, answers) => ({
    __kind__: "ok" as const,
    ok: {
      lessonId,
      score: BigInt(8),
      totalQuestions: BigInt(10),
      passed: true,
      courseProgress: {
        studentId: samplePrincipal,
        overallPercent: BigInt(85),
        completedLessonIds: [BigInt(1)],
        certificateEarned: false,
        currentLessonId: BigInt(2),
        courseId: BigInt(1),
      },
    },
  }),

  transform: async () => ({
    status: BigInt(200),
    body: new Uint8Array(),
    headers: [],
  }),

  transformWhatsApp: async () => ({
    status: BigInt(200),
    body: new Uint8Array(),
    headers: [],
  }),

  triggerPaymentRequest: async () => "https://checkout.stripe.com/demo",

  updateAssignmentStatus: async () => true,
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

  uploadSubServiceImage: async () => undefined,

  verifyCertificate: async () => true,
} as unknown as backendInterface;
