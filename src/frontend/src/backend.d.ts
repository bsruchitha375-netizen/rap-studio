import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export class ExternalBlob {
    getBytes(): Promise<Uint8Array<ArrayBuffer>>;
    getDirectURL(): string;
    static fromURL(url: string): ExternalBlob;
    static fromBytes(blob: Uint8Array<ArrayBuffer>): ExternalBlob;
    withUploadProgress(onProgress: (percentage: number) => void): ExternalBlob;
}
export interface AdminServiceCategory {
    id: ServiceId;
    imageBlob?: Uint8Array;
    subServices: Array<SubService>;
    icon: string;
    name: string;
    createdAt: Timestamp;
    description: string;
}
export interface AnalyticsSummary {
    pendingFeedbackCount: bigint;
    pendingBookings: bigint;
    totalEnrollments: bigint;
    emailLogCount: bigint;
    cancelledBookings: bigint;
    totalBookings: bigint;
    totalCourseRevenue: bigint;
    totalMultiServiceBookings: bigint;
    totalFeedback: bigint;
    confirmedBookings: bigint;
    completedBookings: bigint;
    totalUsers: bigint;
    totalRevenue: bigint;
    totalCmsEntries: bigint;
    revenueByService: Array<ServiceRevenue>;
}
export interface TransformationOutput {
    status: bigint;
    body: Uint8Array;
    headers: Array<http_header>;
}
export interface AdminCourse {
    id: CourseId;
    status: CourseStatus;
    title: string;
    duration: string;
    imageBlob?: Uint8Array;
    prerequisites: Array<string>;
    mode: CourseMode;
    createdAt: Timestamp;
    description: string;
    category: string;
    price: bigint;
}
export interface Feedback {
    id: bigint;
    userId: UserId;
    createdAt: Timestamp;
    responderComment?: string;
    comment: string;
    targetType: FeedbackTargetType;
    rating: bigint;
    targetId: string;
}
export interface EmailLog {
    id: bigint;
    to: string;
    subject: string;
    body: string;
    createdAt: Timestamp;
    sent: boolean;
    relatedId?: string;
}
export interface BookingRequest {
    id: BookingId;
    status: BookingStatus;
    duration: string;
    rejectedReason?: string;
    userId: UserId;
    date: string;
    createdAt: Timestamp;
    rescheduledDate?: string;
    rescheduledTime?: string;
    subService: string;
    notes?: string;
    serviceId: string;
    location: LocationType;
    timeSlot: TimeSlot;
}
export interface NotificationRecord {
    id: NotificationId;
    userId: UserId;
    notificationType: NotificationType;
    createdAt: Timestamp;
    read: boolean;
    message: string;
}
export interface PaymentVerificationStatus {
    signatureVerified: boolean;
    status: PaymentStatus;
    orderId: string;
    paymentId: PaymentId;
    stripePaymentIntentId?: string;
    stripeSessionId?: string;
    verifiedAt?: Timestamp;
}
export interface AdminServiceInput {
    imageData: Uint8Array;
    subServices: Array<SubService>;
    icon: string;
    name: string;
    description: string;
}
export interface ActivityEvent {
    id: string;
    title: string;
    userId: UserId;
    kind: ActivityEventKind;
    detail: string;
    timestamp: Timestamp;
}
export interface StripeConfirmation {
    stripePaymentIntentId: string;
    stripeSessionId: string;
}
export interface QuizQuestionInput {
    lessonId: bigint;
    question: string;
    correctOptionIndex: bigint;
    options: Array<string>;
}
export interface Lesson {
    id: bigint;
    title: string;
    order: bigint;
    description: string;
    quizQuestions: Array<QuizQuestion>;
    youtubeUrl: string;
    courseId: CourseId;
}
export interface SubService {
    id: string;
    name: string;
}
export type CourseId = bigint;
export interface PaymentOrder {
    id: PaymentId;
    signatureVerified: boolean;
    status: PaymentStatus;
    userId: UserId;
    createdAt: Timestamp;
    referenceId: string;
    orderId: string;
    currency: string;
    paymentType: PaymentType;
    stripePaymentIntentId?: string;
    checkoutUrl?: string;
    stripeSessionId?: string;
    amount: bigint;
    adminNotes?: string;
    verifiedAt?: Timestamp;
    paidAt?: Timestamp;
}
export interface CourseLessonProgress {
    studentId: UserId;
    overallPercent: bigint;
    completedLessonIds: Array<bigint>;
    certificateEarned: boolean;
    currentLessonId?: bigint;
    courseId: CourseId;
}
export interface ServiceCategory {
    id: string;
    subServices: Array<SubService>;
    icon: string;
    name: string;
    description: string;
}
export interface PaymentReceiptDetails {
    clientEmail: string;
    referenceId: string;
    currency: string;
    clientPhone: string;
    paymentId: string;
    amount: bigint;
    paidAt: string;
}
export interface StudentDetails {
    learningMode: string;
    preferredSlot: string;
    courseType: string;
}
export interface MultiServiceBookingInput {
    date: string;
    totalAmount: bigint;
    notes?: string;
    selectedServices: Array<SelectedServiceItem>;
    location: string;
    timeSlot: string;
}
export type EnrollmentId = bigint;
export interface BookingInput {
    duration: string;
    date: string;
    subService: string;
    notes?: string;
    serviceId: string;
    location: LocationType;
    timeSlot: TimeSlot;
}
export interface PaymentOrderExtended {
    id: PaymentId;
    razorpayPaymentId?: string;
    status: string;
    userId: UserId;
    createdAt: Timestamp;
    referenceId: string;
    orderId: string;
    razorpayOrderId: string;
    currency: string;
    paymentType: string;
    selectedServices: Array<SelectedServiceItem>;
    amount: bigint;
    adminNotes?: string;
    paidAt?: Timestamp;
}
export interface QuizResult {
    lessonId: bigint;
    score: bigint;
    totalQuestions: bigint;
    passed: boolean;
    courseProgress: CourseLessonProgress;
}
export interface WorkAssignment {
    id: bigint;
    status: AssignmentStatus;
    bookingId: BookingId;
    assignedAt: Timestamp;
    sessionDate: string;
    staffId: UserId;
    clientName: string;
    sessionType: string;
    notes?: string;
    deliverables: Array<Deliverable>;
}
export interface http_header {
    value: string;
    name: string;
}
export interface http_request_result {
    status: bigint;
    body: Uint8Array;
    headers: Array<http_header>;
}
export interface MediaInput {
    title: string;
    serviceCategory: string;
    blob: ExternalBlob;
    fileType: FileType;
}
export type UserId = Principal;
export interface PublicProfile {
    id: UserId;
    status: UserStatus;
    name: string;
    role: UserRole;
    studentDetails?: StudentDetails;
    email: string;
    address?: string;
    phone: string;
    registeredAt: Timestamp;
}
export type LoginError = {
    __kind__: "lockedOut";
    lockedOut: null;
} | {
    __kind__: "other";
    other: string;
} | {
    __kind__: "pendingApproval";
    pendingApproval: null;
} | {
    __kind__: "notFound";
    notFound: null;
} | {
    __kind__: "incorrectPassword";
    incorrectPassword: null;
} | {
    __kind__: "suspended";
    suspended: null;
};
export type PaymentId = bigint;
export type NotificationId = bigint;
export interface BookingDetails {
    serviceName: string;
    bookingId: string;
    date: string;
    time: string;
    clientEmail: string;
    totalAmount: bigint;
    clientPhone: string;
    location: string;
}
export interface AdminPaymentEntry {
    enrollmentId?: EnrollmentId;
    bookingId?: BookingId;
    clientName: string;
    order: PaymentOrder;
    clientPhone: string;
    serviceId?: string;
}
export interface LessonProgress {
    lessonId: bigint;
    completedAt?: bigint;
    studentId: UserId;
    quizScore?: bigint;
    videoWatched: boolean;
    quizPassed: boolean;
}
export interface Certificate {
    id: CertificateId;
    verified: boolean;
    enrollmentId: EnrollmentId;
    studentName: string;
    code: string;
    issuedAt: Timestamp;
    courseName: string;
    courseId: CourseId;
}
export type MediaId = bigint;
export interface WorkAssignmentInput {
    bookingId: BookingId;
    sessionDate: string;
    staffId: UserId;
    sessionType: string;
    notes?: string;
}
export type Timestamp = bigint;
export interface Deliverable {
    submittedAt: Timestamp;
    fileName: string;
    fileUrl: string;
}
export interface QuizQuestion {
    id: bigint;
    lessonId: bigint;
    question: string;
    correctOptionIndex: bigint;
    options: Array<string>;
}
export interface MediaItem {
    id: MediaId;
    title: string;
    serviceCategory: string;
    featured: boolean;
    blob: ExternalBlob;
    date: Timestamp;
    fileType: FileType;
    uploadedBy: UserId;
}
export interface ServiceRevenue {
    serviceName: string;
    revenue: bigint;
    serviceId: string;
    bookingCount: bigint;
}
export interface Course {
    id: CourseId;
    status: CourseStatus;
    title: string;
    duration: string;
    prerequisites: Array<string>;
    mode: CourseMode;
    description: string;
    imageUrl: string;
    category: string;
    price: bigint;
}
export type LocationType = {
    __kind__: "Studio";
    Studio: null;
} | {
    __kind__: "Custom";
    Custom: string;
} | {
    __kind__: "Outdoor";
    Outdoor: null;
} | {
    __kind__: "Indoor";
    Indoor: null;
};
export interface CmsContent {
    key: string;
    contentType: CmsContentType;
    value: string;
    updatedAt: Timestamp;
    updatedBy: UserId;
}
export interface AdminCourseInput {
    status: CourseStatus;
    title: string;
    duration: string;
    imageData: Uint8Array;
    prerequisites: Array<string>;
    mode: CourseMode;
    description: string;
    category: string;
    price: bigint;
}
export interface TransformationInput {
    context: Uint8Array;
    response: http_request_result;
}
export type ServiceId = bigint;
export type BookingId = bigint;
export interface WhatsAppLog {
    id: bigint;
    createdAt: Timestamp;
    sent: boolean;
    message: string;
    phone: string;
    relatedId?: string;
}
export interface LessonInput {
    title: string;
    order: bigint;
    description: string;
    youtubeUrl: string;
    courseId: CourseId;
}
export type CertificateId = bigint;
export interface MultiServiceBooking {
    id: BookingId;
    status: string;
    userId: UserId;
    date: string;
    createdAt: Timestamp;
    totalAmount: bigint;
    notes?: string;
    selectedServices: Array<SelectedServiceItem>;
    adminNotes?: string;
    location: string;
    timeSlot: string;
}
export interface SelectedServiceItem {
    name: string;
    subServiceId: string;
    serviceId: string;
    price: bigint;
}
export interface BookingSlot {
    status: SlotStatus;
    date: string;
    timeSlot: TimeSlot;
}
export type PaymentAdminAction = {
    __kind__: "confirm";
    confirm: null;
} | {
    __kind__: "adjustAmount";
    adjustAmount: bigint;
} | {
    __kind__: "refund";
    refund: null;
};
export interface CourseEnrollment {
    id: EnrollmentId;
    completedAt?: Timestamp;
    paymentStatus: PaymentStatus__1;
    userId: UserId;
    progress: bigint;
    enrolledAt: Timestamp;
    certificateCode?: string;
    courseId: CourseId;
}
export enum ActivityEventKind {
    Login = "Login",
    Registration = "Registration",
    Booking = "Booking",
    Enrollment = "Enrollment",
    Payment = "Payment"
}
export enum AssignmentStatus {
    Delivered = "Delivered",
    Approved = "Approved",
    InProgress = "InProgress",
    Assigned = "Assigned"
}
export enum BookingStatus {
    WorkDelivered = "WorkDelivered",
    Confirmed = "Confirmed",
    Rejected = "Rejected",
    PaymentPending = "PaymentPending",
    Cancelled = "Cancelled",
    Completed = "Completed",
    Pending = "Pending"
}
export enum CmsContentType {
    color = "color",
    text = "text",
    imageUrl = "imageUrl"
}
export enum CourseMode {
    Online = "Online",
    Offline = "Offline",
    Hybrid = "Hybrid"
}
export enum CourseStatus {
    Inactive = "Inactive",
    Active = "Active",
    ComingSoon = "ComingSoon"
}
export enum FeedbackTargetType {
    Course = "Course",
    Service = "Service"
}
export enum FileType {
    Photo = "Photo",
    Video = "Video"
}
export enum NotificationType {
    BookingCompleted = "BookingCompleted",
    CourseCompleted = "CourseCompleted",
    CourseEnrolled = "CourseEnrolled",
    WorkDelivered = "WorkDelivered",
    GeneralInfo = "GeneralInfo",
    PaymentReceipt = "PaymentReceipt",
    BookingConfirmed = "BookingConfirmed",
    BookingReminder = "BookingReminder"
}
export enum PaymentStatus {
    Failed = "Failed",
    Refunded = "Refunded",
    Paid = "Paid",
    Created = "Created"
}
export enum PaymentStatus__1 {
    PartiallyPaid = "PartiallyPaid",
    FullyPaid = "FullyPaid",
    Overdue = "Overdue",
    Pending = "Pending"
}
export enum PaymentType {
    BookingBalance = "BookingBalance",
    CourseEnrollment = "CourseEnrollment",
    BookingUpfront = "BookingUpfront"
}
export enum SlotStatus {
    Available = "Available",
    Taken = "Taken"
}
export enum TimeSlot {
    Night = "Night",
    Afternoon = "Afternoon",
    FullDay = "FullDay",
    Morning = "Morning",
    Evening = "Evening",
    HalfDay = "HalfDay"
}
export enum UserRole {
    Staff = "Staff",
    Client = "Client",
    Student = "Student",
    Receptionist = "Receptionist",
    Admin = "Admin"
}
export enum UserRole__1 {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export enum UserStatus {
    Active = "Active",
    Suspended = "Suspended",
    Rejected = "Rejected",
    Pending = "Pending"
}
export interface backendInterface {
    addFeedback(targetId: string, targetType: FeedbackTargetType, rating: bigint, comment: string): Promise<Feedback>;
    addLesson(input: LessonInput): Promise<Lesson>;
    addQuizQuestion(input: QuizQuestionInput): Promise<Lesson>;
    adminAddCourse(input: AdminCourseInput): Promise<AdminCourse>;
    adminAddService(input: AdminServiceInput): Promise<AdminServiceCategory>;
    adminAdjustAmount(paymentId: PaymentId, newAmount: bigint, note: string): Promise<boolean>;
    adminConfirmPayment(paymentId: PaymentId, note: string): Promise<boolean>;
    adminCreateUser(email: string, name: string, phone: string, passwordHash: string, role: UserRole, address: string | null, studentDetails: StudentDetails | null): Promise<{
        __kind__: "ok";
        ok: PublicProfile;
    } | {
        __kind__: "err";
        err: string;
    }>;
    adminDeleteCourse(courseId: CourseId): Promise<boolean>;
    adminDeleteService(serviceId: ServiceId): Promise<boolean>;
    adminGetAllCourseProgress(): Promise<Array<CourseLessonProgress>>;
    adminGetAllPayments(): Promise<Array<PaymentOrder>>;
    adminRefundPayment(paymentId: PaymentId, note: string): Promise<boolean>;
    adminUpdateCourse(courseId: CourseId, input: AdminCourseInput): Promise<boolean>;
    adminUpdatePayment(paymentId: PaymentId, action: PaymentAdminAction, adminNote: string | null): Promise<boolean>;
    adminUpdateService(serviceId: ServiceId, input: AdminServiceInput): Promise<boolean>;
    approveUser(userId: UserId): Promise<{
        __kind__: "ok";
        ok: null;
    } | {
        __kind__: "err";
        err: string;
    }>;
    assignCallerUserRole(user: Principal, role: UserRole__1): Promise<void>;
    assignWork(input: WorkAssignmentInput): Promise<WorkAssignment>;
    confirmBooking(bookingId: BookingId): Promise<boolean>;
    confirmPayment(confirmation: StripeConfirmation): Promise<boolean>;
    createBookingRequest(input: BookingInput): Promise<BookingRequest>;
    createMultiServiceBooking(input: MultiServiceBookingInput): Promise<BookingId>;
    createPaymentOrder(amount: bigint, referenceId: string, paymentType: PaymentType): Promise<PaymentOrder>;
    createSystemNotification(userId: UserId, message: string, notifType: NotificationType): Promise<NotificationRecord>;
    deleteCmsContent(key: string): Promise<void>;
    deleteMedia(mediaId: MediaId): Promise<boolean>;
    deleteSubServiceImage(categoryId: string, subServiceId: string): Promise<void>;
    deleteUser(userId: UserId): Promise<{
        __kind__: "ok";
        ok: null;
    } | {
        __kind__: "err";
        err: string;
    }>;
    editLesson(lessonId: bigint, input: LessonInput): Promise<boolean>;
    editQuizQuestion(questionId: bigint, input: QuizQuestionInput): Promise<boolean>;
    enrollCourse(courseId: CourseId): Promise<CourseEnrollment>;
    generateCertificate(enrollmentId: EnrollmentId): Promise<Certificate>;
    getAdminCourseBlob(courseId: CourseId): Promise<Uint8Array | null>;
    getAdminPaymentDashboard(): Promise<Array<AdminPaymentEntry>>;
    getAdminPayments(): Promise<Array<PaymentOrderExtended>>;
    getAdminServiceBlob(serviceId: ServiceId): Promise<Uint8Array | null>;
    getAdminUsers(): Promise<Array<PublicProfile>>;
    getAllActivityEvents(): Promise<Array<ActivityEvent>>;
    getAllAdminCourses(): Promise<Array<AdminCourse>>;
    getAllAdminServices(): Promise<Array<AdminServiceCategory>>;
    getAllBookings(): Promise<Array<BookingRequest>>;
    getAllCmsContent(): Promise<Array<CmsContent>>;
    getAllCourses(): Promise<Array<Course>>;
    getAllEnrollments(): Promise<Array<CourseEnrollment>>;
    getAllFeedback(): Promise<Array<Feedback>>;
    getAllPayments(): Promise<Array<PaymentOrder>>;
    getAllSubServiceImages(): Promise<Array<[string, string]>>;
    getAllUsers(): Promise<Array<PublicProfile>>;
    getAllWorkAssignments(): Promise<Array<WorkAssignment>>;
    getAnalytics(): Promise<AnalyticsSummary>;
    getBookingsByDate(date: string): Promise<Array<BookingRequest>>;
    getCallerUserProfile(): Promise<PublicProfile | null>;
    getCallerUserRole(): Promise<UserRole__1>;
    getCertificate(code: string): Promise<Certificate | null>;
    getCmsContent(key: string): Promise<CmsContent | null>;
    getCourse(courseId: CourseId): Promise<Course | null>;
    getCourseProgress(courseId: CourseId): Promise<CourseLessonProgress | null>;
    getEmailLogs(): Promise<Array<EmailLog>>;
    getEnrollmentById(enrollmentId: EnrollmentId): Promise<CourseEnrollment | null>;
    getFeedbackForTarget(targetId: string): Promise<Array<Feedback>>;
    getLessonProgressForCourse(courseId: CourseId): Promise<Array<LessonProgress>>;
    getLessons(courseId: CourseId): Promise<Array<Lesson>>;
    getMediaItems(category: string | null): Promise<Array<MediaItem>>;
    getMyAssignedWork(): Promise<Array<WorkAssignment>>;
    getMyBookings(): Promise<Array<BookingRequest>>;
    getMyEnrollments(): Promise<Array<CourseEnrollment>>;
    getMyFeedback(): Promise<Array<Feedback>>;
    getMyMultiServiceBookings(): Promise<Array<MultiServiceBooking>>;
    getMyNotifications(): Promise<Array<NotificationRecord>>;
    getMyPayments(): Promise<Array<PaymentOrder>>;
    getMyProfile(): Promise<PublicProfile | null>;
    getMyUploadedWork(): Promise<Array<WorkAssignment>>;
    getPaymentDetails(paymentId: PaymentId): Promise<PaymentOrderExtended | null>;
    getPaymentStatus(internalPaymentId: bigint): Promise<PaymentVerificationStatus | null>;
    getPublicCalendar(): Promise<Array<BookingSlot>>;
    getPublicProfile(email: string): Promise<PublicProfile | null>;
    getRecentActivity(): Promise<Array<ActivityEvent>>;
    getServiceCategories(): Promise<Array<ServiceCategory>>;
    getStripeConfig(): Promise<{
        secretKey: string;
        configured: boolean;
        publishableKey: string;
    }>;
    getSubServiceImage(categoryId: string, subServiceId: string): Promise<string | null>;
    getSubServiceImageBlob(categoryId: string, subServiceId: string): Promise<Uint8Array | null>;
    getWhatsAppLogs(): Promise<Array<WhatsAppLog>>;
    isCallerAdmin(): Promise<boolean>;
    listMyPayments(): Promise<Array<PaymentOrder>>;
    listPendingUsers(): Promise<Array<PublicProfile>>;
    loginByEmail(email: string, passwordHash: string): Promise<{
        __kind__: "ok";
        ok: PublicProfile;
    } | {
        __kind__: "err";
        err: LoginError;
    }>;
    loginByIdentifier(identifier: string, passwordHash: string): Promise<{
        __kind__: "ok";
        ok: PublicProfile;
    } | {
        __kind__: "err";
        err: LoginError;
    }>;
    manageUser(userId: UserId, action: string): Promise<boolean>;
    markCourseComplete(enrollmentId: EnrollmentId): Promise<{
        __kind__: "ok";
        ok: string;
    } | {
        __kind__: "err";
        err: string;
    }>;
    markEnrollmentPaid(enrollmentId: EnrollmentId): Promise<boolean>;
    markNotificationRead(notificationId: NotificationId): Promise<boolean>;
    markVideoWatched(lessonId: bigint): Promise<LessonProgress>;
    markWorkDelivered(bookingId: BookingId): Promise<boolean>;
    register(email: string, name: string, phone: string, passwordHash: string, role: UserRole, address: string | null, profilePhoto: Uint8Array | null, studentDetails: StudentDetails | null): Promise<{
        __kind__: "ok";
        ok: PublicProfile;
    } | {
        __kind__: "err";
        err: string;
    }>;
    rejectBooking(bookingId: BookingId, reason: string): Promise<boolean>;
    rejectUser(userId: UserId): Promise<{
        __kind__: "ok";
        ok: null;
    } | {
        __kind__: "err";
        err: string;
    }>;
    removeLesson(lessonId: bigint): Promise<boolean>;
    removeQuizQuestion(questionId: bigint): Promise<boolean>;
    rescheduleBooking(bookingId: BookingId, newDate: string, newTime: string): Promise<boolean>;
    respondToFeedback(feedbackId: bigint, responderComment: string): Promise<boolean>;
    saveCallerUserProfile(name: string, phone: string, role: UserRole): Promise<void>;
    sendBookingConfirmation(userId: UserId, details: BookingDetails): Promise<boolean>;
    sendCompletionMessage(userId: UserId, details: BookingDetails, feedbackLink: string): Promise<boolean>;
    sendPaymentReceipt(userId: UserId, details: PaymentReceiptDetails): Promise<boolean>;
    sendProgressReminder(userId: UserId, details: BookingDetails): Promise<boolean>;
    setCmsContent(key: string, value: string, contentType: CmsContentType): Promise<void>;
    setFeatured(mediaId: MediaId, featured: boolean): Promise<boolean>;
    setStripeKeys(publishableKey: string, secretKey: string): Promise<boolean>;
    setSubServiceImage(categoryId: string, subServiceId: string, imageUrl: string): Promise<void>;
    submitDeliverable(assignmentId: bigint, fileUrl: string, fileName: string): Promise<boolean>;
    submitQuiz(lessonId: bigint, answers: Array<bigint>): Promise<{
        __kind__: "ok";
        ok: QuizResult;
    } | {
        __kind__: "err";
        err: string;
    }>;
    testStripeConnection(): Promise<{
        __kind__: "ok";
        ok: string;
    } | {
        __kind__: "err";
        err: string;
    }>;
    transform(input: TransformationInput): Promise<TransformationOutput>;
    transformWhatsApp(input: TransformationInput): Promise<TransformationOutput>;
    triggerPaymentRequest(bookingId: BookingId, paymentType: string): Promise<string>;
    updateAssignmentStatus(assignmentId: bigint, status: AssignmentStatus): Promise<boolean>;
    updateCourseProgress(courseId: CourseId, completed: boolean): Promise<boolean>;
    updateProfile(name: string, phone: string, address: string | null): Promise<boolean>;
    uploadMedia(input: MediaInput): Promise<MediaItem>;
    uploadSubServiceImage(categoryId: string, subServiceId: string, imageData: Uint8Array): Promise<void>;
    verifyCertificate(code: string): Promise<boolean>;
}
