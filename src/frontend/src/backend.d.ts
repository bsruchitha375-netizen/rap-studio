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
export interface TransformationOutput {
    status: bigint;
    body: Uint8Array;
    headers: Array<http_header>;
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
    userId: UserId;
    date: string;
    createdAt: Timestamp;
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
export interface StripeConfirmation {
    stripePaymentIntentId: string;
    stripeSessionId: string;
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
export type EnrollmentId = bigint;
export interface MultiServiceBookingInput {
    date: string;
    totalAmount: bigint;
    notes?: string;
    selectedServices: Array<SelectedServiceItem>;
    location: string;
    timeSlot: string;
}
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
export interface AdminPaymentEntry {
    enrollmentId?: EnrollmentId;
    bookingId?: BookingId;
    clientName: string;
    order: PaymentOrder;
    clientPhone: string;
    serviceId?: string;
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
export type PaymentId = bigint;
export type NotificationId = bigint;
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
export interface UserProfile {
    status: UserStatus;
    created: Timestamp;
    principal: UserId;
    name: string;
    role: UserRole;
    email?: string;
    phone: string;
}
export type MediaId = bigint;
export type Timestamp = bigint;
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
export interface BookingStats {
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
    totalRevenue: bigint;
    totalCmsEntries: bigint;
    revenueByService: Array<ServiceRevenue>;
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
export interface TransformationInput {
    context: Uint8Array;
    response: http_request_result;
}
export type BookingId = bigint;
export interface WhatsAppLog {
    id: bigint;
    createdAt: Timestamp;
    sent: boolean;
    message: string;
    phone: string;
    relatedId?: string;
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
export enum BookingStatus {
    WorkDelivered = "WorkDelivered",
    Confirmed = "Confirmed",
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
    Pending = "Pending"
}
export interface backendInterface {
    addFeedback(targetId: string, targetType: FeedbackTargetType, rating: bigint, comment: string): Promise<Feedback>;
    adminAdjustAmount(paymentId: PaymentId, newAmount: bigint, note: string): Promise<boolean>;
    adminConfirmPayment(paymentId: PaymentId, note: string): Promise<boolean>;
    adminGetAllPayments(): Promise<Array<PaymentOrder>>;
    adminRefundPayment(paymentId: PaymentId, note: string): Promise<boolean>;
    adminUpdatePayment(paymentId: PaymentId, action: PaymentAdminAction, adminNote: string | null): Promise<boolean>;
    assignCallerUserRole(user: Principal, role: UserRole__1): Promise<void>;
    confirmBooking(bookingId: BookingId): Promise<boolean>;
    confirmPayment(confirmation: StripeConfirmation): Promise<boolean>;
    createBookingRequest(input: BookingInput): Promise<BookingRequest>;
    createMultiServiceBooking(input: MultiServiceBookingInput): Promise<BookingId>;
    createPaymentOrder(amount: bigint, referenceId: string, paymentType: PaymentType): Promise<PaymentOrder>;
    createSystemNotification(userId: UserId, message: string, notifType: NotificationType): Promise<NotificationRecord>;
    deleteCmsContent(key: string): Promise<void>;
    deleteMedia(mediaId: MediaId): Promise<boolean>;
    deleteSubServiceImage(categoryId: string, subServiceId: string): Promise<void>;
    enrollCourse(courseId: CourseId): Promise<CourseEnrollment>;
    generateCertificate(enrollmentId: EnrollmentId): Promise<Certificate>;
    getAdminPaymentDashboard(): Promise<Array<AdminPaymentEntry>>;
    getAdminPayments(): Promise<Array<PaymentOrderExtended>>;
    getAllBookings(): Promise<Array<BookingRequest>>;
    getAllCmsContent(): Promise<Array<CmsContent>>;
    getAllCourses(): Promise<Array<Course>>;
    getAllEnrollments(): Promise<Array<CourseEnrollment>>;
    getAllFeedback(): Promise<Array<Feedback>>;
    getAllSubServiceImages(): Promise<Array<[string, string]>>;
    getAllUsers(): Promise<Array<UserProfile>>;
    getAnalytics(): Promise<BookingStats>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole__1>;
    getCertificate(code: string): Promise<Certificate | null>;
    getCmsContent(key: string): Promise<CmsContent | null>;
    getCourse(courseId: CourseId): Promise<Course | null>;
    getEmailLogs(): Promise<Array<EmailLog>>;
    getFeedbackForTarget(targetId: string): Promise<Array<Feedback>>;
    getMediaItems(category: string | null): Promise<Array<MediaItem>>;
    getMyBookings(): Promise<Array<BookingRequest>>;
    getMyEnrollments(): Promise<Array<CourseEnrollment>>;
    getMyFeedback(): Promise<Array<Feedback>>;
    getMyMultiServiceBookings(): Promise<Array<MultiServiceBooking>>;
    getMyNotifications(): Promise<Array<NotificationRecord>>;
    getMyProfile(): Promise<UserProfile | null>;
    getPaymentDetails(paymentId: PaymentId): Promise<PaymentOrderExtended | null>;
    getPaymentStatus(internalPaymentId: bigint): Promise<PaymentVerificationStatus | null>;
    getPublicCalendar(): Promise<Array<BookingSlot>>;
    getServiceCategories(): Promise<Array<ServiceCategory>>;
    getSubServiceImage(categoryId: string, subServiceId: string): Promise<string | null>;
    getWhatsAppLogs(): Promise<Array<WhatsAppLog>>;
    isCallerAdmin(): Promise<boolean>;
    listMyPayments(): Promise<Array<PaymentOrder>>;
    manageUser(userId: UserId, action: string): Promise<boolean>;
    markEnrollmentPaid(enrollmentId: EnrollmentId): Promise<boolean>;
    markNotificationRead(notificationId: NotificationId): Promise<boolean>;
    markWorkDelivered(bookingId: BookingId): Promise<boolean>;
    register(name: string, phone: string, role: UserRole): Promise<UserProfile>;
    respondToFeedback(feedbackId: bigint, responderComment: string): Promise<boolean>;
    saveCallerUserProfile(name: string, phone: string, role: UserRole): Promise<void>;
    sendBookingConfirmation(userId: UserId, details: BookingDetails): Promise<boolean>;
    sendCompletionMessage(userId: UserId, details: BookingDetails, feedbackLink: string): Promise<boolean>;
    sendPaymentReceipt(userId: UserId, details: PaymentReceiptDetails): Promise<boolean>;
    sendProgressReminder(userId: UserId, details: BookingDetails): Promise<boolean>;
    setCmsContent(key: string, value: string, contentType: CmsContentType): Promise<void>;
    setFeatured(mediaId: MediaId, featured: boolean): Promise<boolean>;
    setSubServiceImage(categoryId: string, subServiceId: string, imageUrl: string): Promise<void>;
    transform(input: TransformationInput): Promise<TransformationOutput>;
    transformWhatsApp(input: TransformationInput): Promise<TransformationOutput>;
    triggerPaymentRequest(bookingId: BookingId, paymentType: string): Promise<string>;
    updateCourseProgress(courseId: CourseId, completed: boolean): Promise<boolean>;
    updateProfile(name: string, phone: string): Promise<boolean>;
    uploadMedia(input: MediaInput): Promise<MediaItem>;
    verifyCertificate(code: string): Promise<boolean>;
}
