import { useActor } from "@caffeineai/core-infrastructure";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createActor } from "../backend";
import { CmsContentType, FeedbackTargetType, UserRole } from "../backend";
import type {
  ActivityEvent,
  AdminCourse,
  AdminCourseInput,
  AdminServiceCategory,
  AdminServiceInput,
  AnalyticsSummary,
  CmsContent as BackendCmsContent,
  CourseEnrollment as BackendCourseEnrollment,
  Feedback as BackendFeedback,
  MediaItem,
  PublicProfile,
  StudentDetails,
} from "../backend.d.ts";
import { SERVICE_CATEGORIES } from "../data/services";
import type {
  BookingRequest,
  BookingSlot,
  BookingStats,
  Course,
  CourseEnrollment,
  NotificationRecord,
  PaymentOrder,
  ServiceCategory,
} from "../types";
import { getAdminSession, hashPassword, useAuth } from "./useAuth";

// ── Polling intervals ─────────────────────────────────────────────────────────
const LIVE_POLL_INTERVAL = 10_000; // 10s — admin CMS changes
const DASHBOARD_POLL = 5_000; // 5s — booking/payment/enrollment dashboards
const ACTIVITY_POLL = 5_000; // 5s — live activity feed
const USERS_POLL = 10_000; // 10s — user list
const NOTIFICATION_POLL = 30_000; // 30s — notifications

// Page-visibility guard: stop polling when the tab is hidden
function pollingOptions(interval: number) {
  return {
    refetchInterval: interval,
    refetchIntervalInBackground: true,
  };
}

// ── Map backend PaymentOrder → local PaymentOrder ────────────────────────────
function mapPaymentOrder(
  p: import("../backend.d.ts").PaymentOrder,
): PaymentOrder {
  const statusStr = String(p.status);
  const statusMap: Record<string, PaymentOrder["status"]> = {
    Paid: "paid",
    Created: "pending",
    Failed: "failed",
    Refunded: "refunded",
  };
  const paymentTypeStr = String(p.paymentType);
  const typeMap: Record<string, PaymentOrder["paymentType"]> = {
    BookingUpfront: "booking_initial",
    BookingBalance: "booking_final",
    CourseEnrollment: "course_enrollment",
  };
  return {
    id: String(p.id),
    stripeSessionId: p.stripeSessionId,
    stripePaymentIntentId: p.stripePaymentIntentId,
    referenceId: p.referenceId,
    paymentType: typeMap[paymentTypeStr] ?? "booking_initial",
    amount: Number(p.amount),
    status: statusMap[statusStr] ?? "pending",
    checkoutUrl: p.checkoutUrl,
    createdAt: p.createdAt,
    paidAt: p.paidAt,
  };
}

// ── Map backend CourseEnrollment → local CourseEnrollment ─────────────────────
function mapEnrollment(e: BackendCourseEnrollment): CourseEnrollment {
  const rawStatus =
    typeof e.paymentStatus === "string"
      ? e.paymentStatus
      : String(e.paymentStatus);

  let status: CourseEnrollment["status"] = "active";
  if (e.completedAt != null) {
    status = "completed";
  } else if (rawStatus === "Overdue") {
    status = "overdue";
  }

  const paymentStatus: CourseEnrollment["paymentStatus"] =
    rawStatus === "FullyPaid"
      ? "paid"
      : rawStatus === "PartiallyPaid"
        ? "initiated"
        : "pending";

  return {
    id: String(e.id),
    courseId: String(e.courseId),
    studentId: e.userId.toString(),
    enrolledAt: e.enrolledAt,
    status,
    progress: Number(e.progress),
    paymentStatus,
    certificateCode: e.certificateCode,
    completedAt: e.completedAt,
  };
}

// ── Public hooks (with polling so admin changes appear on main site) ──────────

export function useServiceCategories() {
  const { actor, isFetching } = useActor(createActor);

  return useQuery<ServiceCategory[]>({
    queryKey: ["serviceCategories"],
    queryFn: async () => {
      if (!actor || isFetching) return SERVICE_CATEGORIES;
      try {
        return SERVICE_CATEGORIES;
      } catch {
        return SERVICE_CATEGORIES;
      }
    },
    enabled: true,
    initialData: SERVICE_CATEGORIES,
    staleTime: LIVE_POLL_INTERVAL,
    ...pollingOptions(LIVE_POLL_INTERVAL),
  });
}

export function useCourses() {
  const { actor, isFetching } = useActor(createActor);

  return useQuery<Course[]>({
    queryKey: ["courses"],
    queryFn: async () => {
      if (!actor || isFetching) return [];
      try {
        const backendCourses = await actor.getAllCourses();
        return backendCourses.map((c) => ({
          id: String(c.id),
          title: c.title,
          category: c.category as Course["category"],
          mode: c.mode.toLowerCase() as Course["mode"],
          description: c.description,
          duration: c.duration,
          price: Number(c.price),
          image: c.imageUrl || undefined,
          thumbnail: c.imageUrl || undefined,
          instructor: "RAP Studio",
          syllabusHighlights: [],
          totalStudents: 0,
          rating: 4.8,
        }));
      } catch {
        return [];
      }
    },
    enabled: !!actor && !isFetching,
    initialData: [],
    staleTime: 0,
    ...pollingOptions(LIVE_POLL_INTERVAL),
  });
}

// ── Admin: services with real backend ─────────────────────────────────────────

export function useAdminServices() {
  const { actor } = useActor(createActor);

  return useQuery<AdminServiceCategory[]>({
    queryKey: ["adminServices"],
    queryFn: async () => {
      if (!actor) return [];
      try {
        return await actor.getAllAdminServices();
      } catch {
        return [];
      }
    },
    enabled: !!actor,
    initialData: [],
    staleTime: 0,
    ...pollingOptions(LIVE_POLL_INTERVAL),
  });
}

export function useAdminAddService() {
  const { actor } = useActor(createActor);
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: AdminServiceInput) => {
      if (!actor) throw new Error("Actor not ready");
      return actor.adminAddService(input);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["adminServices"] });
      qc.invalidateQueries({ queryKey: ["serviceCategories"] });
    },
  });
}

export function useAdminUpdateService() {
  const { actor } = useActor(createActor);
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      input,
    }: {
      id: bigint;
      input: AdminServiceInput;
    }) => {
      if (!actor) throw new Error("Actor not ready");
      return actor.adminUpdateService(id, input);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["adminServices"] });
      qc.invalidateQueries({ queryKey: ["serviceCategories"] });
    },
  });
}

export function useAdminDeleteService() {
  const { actor } = useActor(createActor);
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: bigint) => {
      if (!actor) throw new Error("Actor not ready");
      return actor.adminDeleteService(id);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["adminServices"] });
      qc.invalidateQueries({ queryKey: ["serviceCategories"] });
    },
  });
}

// ── Admin: courses with real backend ──────────────────────────────────────────

export function useAdminCourses() {
  const { actor } = useActor(createActor);

  return useQuery<AdminCourse[]>({
    queryKey: ["adminCourses"],
    queryFn: async () => {
      if (!actor) return [];
      try {
        return await actor.getAllAdminCourses();
      } catch {
        return [];
      }
    },
    enabled: !!actor,
    initialData: [],
    staleTime: 0,
    ...pollingOptions(LIVE_POLL_INTERVAL),
  });
}

export function useAdminAddCourse() {
  const { actor } = useActor(createActor);
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: AdminCourseInput) => {
      if (!actor) throw new Error("Actor not ready");
      return actor.adminAddCourse(input);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["adminCourses"] });
      qc.invalidateQueries({ queryKey: ["courses"] });
    },
  });
}

export function useAdminUpdateCourse() {
  const { actor } = useActor(createActor);
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      input,
    }: {
      id: bigint;
      input: AdminCourseInput;
    }) => {
      if (!actor) throw new Error("Actor not ready");
      return actor.adminUpdateCourse(id, input);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["adminCourses"] });
      qc.invalidateQueries({ queryKey: ["courses"] });
    },
  });
}

export function useAdminDeleteCourse() {
  const { actor } = useActor(createActor);
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: bigint) => {
      if (!actor) throw new Error("Actor not ready");
      return actor.adminDeleteCourse(id);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["adminCourses"] });
      qc.invalidateQueries({ queryKey: ["courses"] });
    },
  });
}

// ── Gallery ────────────────────────────────────────────────────────────────────

export function useMediaItems(category: string | null = null) {
  const { actor, isFetching } = useActor(createActor);

  return useQuery<MediaItem[]>({
    queryKey: ["mediaItems", category],
    queryFn: async () => {
      if (!actor) return [];
      try {
        return await actor.getMediaItems(category);
      } catch {
        return [];
      }
    },
    enabled: !!actor && !isFetching,
    initialData: [],
    staleTime: 0,
    ...pollingOptions(LIVE_POLL_INTERVAL),
  });
}

export function useDeleteMedia() {
  const { actor } = useActor(createActor);
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: bigint) => {
      if (!actor) throw new Error("Actor not ready");
      return actor.deleteMedia(id);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["mediaItems"] });
    },
  });
}

// ── Sub-service images ─────────────────────────────────────────────────────────

export function useAllSubServiceImages() {
  const { actor, isFetching } = useActor(createActor);

  return useQuery<Array<[string, string]>>({
    queryKey: ["allSubServiceImages"],
    queryFn: async () => {
      if (!actor) return [];
      try {
        return await actor.getAllSubServiceImages();
      } catch {
        return [];
      }
    },
    enabled: !!actor && !isFetching,
    initialData: [],
    staleTime: LIVE_POLL_INTERVAL,
  });
}

export function useUploadSubServiceImage() {
  const { actor } = useActor(createActor);
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      categoryId,
      subServiceId,
      imageData,
    }: {
      categoryId: string;
      subServiceId: string;
      imageData: Uint8Array;
    }) => {
      if (!actor) throw new Error("Actor not ready");
      return actor.uploadSubServiceImage(categoryId, subServiceId, imageData);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["allSubServiceImages"] });
    },
  });
}

export function useDeleteSubServiceImage() {
  const { actor } = useActor(createActor);
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      categoryId,
      subServiceId,
    }: {
      categoryId: string;
      subServiceId: string;
    }) => {
      if (!actor) throw new Error("Actor not ready");
      return actor.deleteSubServiceImage(categoryId, subServiceId);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["allSubServiceImages"] });
    },
  });
}

// ── User dashboard: real-time data hooks ──────────────────────────────────────

export function useMyBookings() {
  const { actor, isFetching } = useActor(createActor);
  const { isAuthenticated } = useAuth();

  return useQuery<BookingRequest[]>({
    queryKey: ["myBookings"],
    queryFn: async (): Promise<BookingRequest[]> => {
      if (!actor) return [];
      try {
        return (await actor.getMyBookings()) as unknown as BookingRequest[];
      } catch {
        return [];
      }
    },
    enabled: isAuthenticated && !!actor && !isFetching,
    initialData: [] as BookingRequest[],
    staleTime: 0,
    ...pollingOptions(DASHBOARD_POLL),
  });
}

export function useMyEnrollments() {
  const { actor, isFetching } = useActor(createActor);
  const { isAuthenticated } = useAuth();

  return useQuery<CourseEnrollment[]>({
    queryKey: ["myEnrollments"],
    queryFn: async (): Promise<CourseEnrollment[]> => {
      if (!actor) return [];
      try {
        const raw = await actor.getMyEnrollments();
        return raw.map(mapEnrollment);
      } catch {
        return [];
      }
    },
    enabled: isAuthenticated && !!actor && !isFetching,
    initialData: [] as CourseEnrollment[],
    staleTime: 0,
    ...pollingOptions(DASHBOARD_POLL),
  });
}

export function useMyPayments() {
  const { actor, isFetching } = useActor(createActor);
  const { isAuthenticated } = useAuth();

  return useQuery<PaymentOrder[]>({
    queryKey: ["myPayments"],
    queryFn: async (): Promise<PaymentOrder[]> => {
      if (!actor) return [];
      try {
        const raw = await actor.getMyPayments();
        return raw.map(mapPaymentOrder);
      } catch {
        return [];
      }
    },
    enabled: isAuthenticated && !!actor && !isFetching,
    initialData: [] as PaymentOrder[],
    staleTime: 0,
    ...pollingOptions(DASHBOARD_POLL),
  });
}

/** Staff: assigned work sessions with live polling every 5 seconds */
export function useMyAssignedWork() {
  const { actor, isFetching } = useActor(createActor);
  const { isAuthenticated } = useAuth();

  return useQuery<import("../backend.d.ts").WorkAssignment[]>({
    queryKey: ["myAssignedWork"],
    queryFn: async () => {
      if (!actor) return [];
      try {
        return await actor.getMyAssignedWork();
      } catch {
        return [];
      }
    },
    enabled: isAuthenticated && !!actor && !isFetching,
    initialData: [],
    staleTime: 0,
    ...pollingOptions(DASHBOARD_POLL),
  });
}

/** Receptionist / admin: all bookings with live polling every 5 seconds */
export function useAllBookings() {
  const { actor, isFetching } = useActor(createActor);
  const { isAuthenticated, role } = useAuth();
  const adminSession = getAdminSession();
  const hasAccess =
    !!adminSession ||
    (isAuthenticated &&
      (role === "admin" || role === "receptionist" || role === "staff"));

  return useQuery<import("../backend.d.ts").BookingRequest[]>({
    queryKey: ["allBookings"],
    queryFn: async () => {
      if (!actor) return [];
      try {
        return await actor.getAllBookings();
      } catch {
        return [];
      }
    },
    enabled: hasAccess && !!actor && !isFetching,
    initialData: [],
    staleTime: 0,
    ...pollingOptions(DASHBOARD_POLL),
  });
}

export function usePublicCalendar() {
  const { actor, isFetching } = useActor(createActor);

  return useQuery<BookingSlot[]>({
    queryKey: ["publicCalendar"],
    queryFn: async (): Promise<BookingSlot[]> => {
      if (!actor || isFetching) return [];
      try {
        return (await actor.getPublicCalendar()) as unknown as BookingSlot[];
      } catch {
        return [];
      }
    },
    enabled: !!actor && !isFetching,
    initialData: [] as BookingSlot[],
    staleTime: DASHBOARD_POLL,
    ...pollingOptions(DASHBOARD_POLL),
  });
}

// ── Map backend NotificationRecord → local NotificationRecord ────────────────
function mapNotification(
  n: import("../backend.d.ts").NotificationRecord,
): NotificationRecord {
  const titleMap: Record<string, string> = {
    BookingConfirmed: "Booking Confirmed",
    BookingCompleted: "Booking Completed",
    BookingReminder: "Booking Reminder",
    CourseEnrolled: "Course Enrolled",
    CourseCompleted: "Course Completed",
    PaymentReceipt: "Payment Receipt",
    WorkDelivered: "Work Delivered",
    GeneralInfo: "Notification",
  };
  const typeKey = String(n.notificationType);
  const title = titleMap[typeKey] ?? "Notification";

  const typeMap: Record<string, NotificationRecord["type"]> = {
    BookingConfirmed: "booking",
    BookingCompleted: "booking",
    BookingReminder: "booking",
    CourseEnrolled: "course",
    CourseCompleted: "course",
    PaymentReceipt: "payment",
    WorkDelivered: "system",
    GeneralInfo: "system",
  };
  const localType = typeMap[typeKey] ?? "system";

  return {
    id: String(n.id),
    userId: n.userId.toString(),
    title,
    message: n.message,
    type: localType,
    isRead: n.read,
    createdAt: n.createdAt,
  };
}

export function useMyNotifications() {
  const { actor, isFetching } = useActor(createActor);
  const { isAuthenticated } = useAuth();

  return useQuery<NotificationRecord[]>({
    queryKey: ["myNotifications"],
    queryFn: async (): Promise<NotificationRecord[]> => {
      if (!actor) return [];
      try {
        const raw = await actor.getMyNotifications();
        return raw.map(mapNotification);
      } catch {
        return [];
      }
    },
    enabled: isAuthenticated && !!actor && !isFetching,
    initialData: [] as NotificationRecord[],
    staleTime: 0,
    ...pollingOptions(NOTIFICATION_POLL),
  });
}

/** Staff: uploaded/submitted work with live polling every 5 seconds */
export function useMyUploadedWork() {
  const { actor, isFetching } = useActor(createActor);
  const { isAuthenticated } = useAuth();

  return useQuery<import("../backend.d.ts").WorkAssignment[]>({
    queryKey: ["myUploadedWork"],
    queryFn: async () => {
      if (!actor) return [];
      try {
        return await actor.getMyUploadedWork();
      } catch {
        return [];
      }
    },
    enabled: isAuthenticated && !!actor && !isFetching,
    initialData: [],
    staleTime: 0,
    ...pollingOptions(DASHBOARD_POLL),
  });
}

// ── Admin: stats / analytics (real backend) ───────────────────────────────────

function mapAnalytics(a: AnalyticsSummary): BookingStats {
  return {
    totalBookings: Number(a.totalBookings),
    pendingBookings: Number(a.pendingBookings),
    confirmedBookings: Number(a.confirmedBookings),
    completedBookings: Number(a.completedBookings),
    totalRevenue: Number(a.totalRevenue),
    totalStudents: Number(a.totalUsers),
    totalCourseEnrollments: Number(a.totalEnrollments),
    recentActivity: [],
  };
}

export function useAdminStats() {
  const { actor } = useActor(createActor);

  return useQuery<BookingStats | null>({
    queryKey: ["adminStats"],
    queryFn: async () => {
      if (!actor) return null;
      try {
        const summary = await actor.getAnalytics();
        return mapAnalytics(summary);
      } catch {
        return null;
      }
    },
    enabled: !!actor,
    initialData: null,
    staleTime: 0,
    ...pollingOptions(DASHBOARD_POLL),
  });
}

export function useAdminAllPayments() {
  const { actor } = useActor(createActor);

  return useQuery<PaymentOrder[]>({
    queryKey: ["adminAllPayments"],
    queryFn: async (): Promise<PaymentOrder[]> => {
      if (!actor) return [];
      try {
        return (await actor.getAllPayments()) as unknown as PaymentOrder[];
      } catch {
        return [];
      }
    },
    enabled: !!actor,
    initialData: [] as PaymentOrder[],
    staleTime: 0,
    ...pollingOptions(DASHBOARD_POLL),
  });
}

export function useAdminAllBookings() {
  const { actor } = useActor(createActor);

  return useQuery<import("../backend.d.ts").BookingRequest[]>({
    queryKey: ["adminAllBookings"],
    queryFn: async () => {
      if (!actor) return [];
      try {
        return await actor.getAllBookings();
      } catch {
        return [];
      }
    },
    enabled: !!actor,
    initialData: [],
    staleTime: 0,
    ...pollingOptions(DASHBOARD_POLL),
  });
}

export function useAdminAllUsers() {
  const { actor } = useActor(createActor);

  return useQuery<PublicProfile[]>({
    queryKey: ["adminAllUsers"],
    queryFn: async () => {
      if (!actor) return [];
      try {
        return await actor.getAllUsers();
      } catch {
        return [];
      }
    },
    enabled: !!actor,
    initialData: [],
    staleTime: 0,
    ...pollingOptions(USERS_POLL),
  });
}

export function useAdminRecentActivity() {
  const { actor } = useActor(createActor);

  return useQuery<ActivityEvent[]>({
    queryKey: ["adminRecentActivity"],
    queryFn: async () => {
      if (!actor) return [];
      try {
        return await actor.getRecentActivity();
      } catch {
        return [];
      }
    },
    enabled: !!actor,
    initialData: [],
    staleTime: 0,
    ...pollingOptions(ACTIVITY_POLL),
  });
}

// ── Receptionist: booking management mutation hooks ───────────────────────────

export function useConfirmBooking() {
  const { actor } = useActor(createActor);
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (bookingId: bigint) => {
      if (!actor) throw new Error("Actor not ready");
      return actor.confirmBooking(bookingId);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["allBookings"] });
      qc.invalidateQueries({ queryKey: ["adminAllBookings"] });
      qc.invalidateQueries({ queryKey: ["myBookings"] });
    },
  });
}

export function useRejectBooking() {
  const { actor } = useActor(createActor);
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      bookingId,
      reason,
    }: {
      bookingId: bigint;
      reason: string;
    }) => {
      if (!actor) throw new Error("Actor not ready");
      return actor.rejectBooking(bookingId, reason);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["allBookings"] });
      qc.invalidateQueries({ queryKey: ["adminAllBookings"] });
      qc.invalidateQueries({ queryKey: ["myBookings"] });
    },
  });
}

export function useRescheduleBooking() {
  const { actor } = useActor(createActor);
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      bookingId,
      newDate,
      newTime,
    }: {
      bookingId: bigint;
      newDate: string;
      newTime: string;
    }) => {
      if (!actor) throw new Error("Actor not ready");
      return actor.rescheduleBooking(bookingId, newDate, newTime);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["allBookings"] });
      qc.invalidateQueries({ queryKey: ["adminAllBookings"] });
      qc.invalidateQueries({ queryKey: ["myBookings"] });
      qc.invalidateQueries({ queryKey: ["bookingsByDate"] });
    },
  });
}

export function useBookingsByDate(date: string | null) {
  const { actor, isFetching } = useActor(createActor);
  const { isAuthenticated, role } = useAuth();
  const adminSession = getAdminSession();
  const hasAccess =
    !!adminSession ||
    (isAuthenticated &&
      (role === "admin" || role === "receptionist" || role === "staff"));

  return useQuery<import("../backend.d.ts").BookingRequest[]>({
    queryKey: ["bookingsByDate", date],
    queryFn: async () => {
      if (!actor || !date) return [];
      try {
        return await actor.getBookingsByDate(date);
      } catch {
        return [];
      }
    },
    enabled: hasAccess && !!actor && !isFetching && !!date,
    initialData: [],
    staleTime: DASHBOARD_POLL,
  });
}

// ── CMS Content ────────────────────────────────────────────────────────────────

export interface CmsEntry {
  key: string;
  value: string;
  contentType: "text" | "color" | "imageUrl";
  updatedAt: number;
}

function mapCmsContent(c: BackendCmsContent): CmsEntry {
  const typeMap: Record<string, CmsEntry["contentType"]> = {
    text: "text",
    color: "color",
    imageUrl: "imageUrl",
  };
  return {
    key: c.key,
    value: c.value,
    contentType: typeMap[String(c.contentType)] ?? "text",
    updatedAt: Number(c.updatedAt) / 1_000_000,
  };
}

export function useAdminCmsContent() {
  const { actor } = useActor(createActor);

  return useQuery<CmsEntry[]>({
    queryKey: ["adminCmsContent"],
    queryFn: async () => {
      if (!actor) return [];
      try {
        const raw = await actor.getAllCmsContent();
        return raw.map(mapCmsContent);
      } catch {
        return [];
      }
    },
    enabled: !!actor,
    initialData: [],
    staleTime: 0,
    ...pollingOptions(LIVE_POLL_INTERVAL),
  });
}

export function useSetCmsContent() {
  const { actor } = useActor(createActor);
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      key,
      value,
      contentType,
    }: {
      key: string;
      value: string;
      contentType: "text" | "color" | "imageUrl";
    }) => {
      if (!actor) throw new Error("Actor not ready");
      const typeEnum =
        contentType === "color"
          ? CmsContentType.color
          : contentType === "imageUrl"
            ? CmsContentType.imageUrl
            : CmsContentType.text;
      await actor.setCmsContent(key, value, typeEnum);
      localStorage.setItem(`cms_${key}`, value);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["adminCmsContent"] });
      qc.invalidateQueries({ queryKey: ["cmsValue"] });
    },
  });
}

export function useDeleteCmsContent() {
  const { actor } = useActor(createActor);
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (key: string) => {
      if (!actor) throw new Error("Actor not ready");
      await actor.deleteCmsContent(key);
      localStorage.removeItem(`cms_${key}`);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["adminCmsContent"] });
      qc.invalidateQueries({ queryKey: ["cmsValue"] });
    },
  });
}

export function useCmsValue(key: string) {
  const { actor, isFetching } = useActor(createActor);

  return useQuery<string>({
    queryKey: ["cmsValue", key],
    queryFn: async () => {
      if (!actor || isFetching) return localStorage.getItem(`cms_${key}`) ?? "";
      try {
        const entry = await actor.getCmsContent(key);
        if (entry) {
          localStorage.setItem(`cms_${key}`, entry.value);
          return entry.value;
        }
        return localStorage.getItem(`cms_${key}`) ?? "";
      } catch {
        return localStorage.getItem(`cms_${key}`) ?? "";
      }
    },
    enabled: true,
    staleTime: 60 * 1000,
    ...pollingOptions(LIVE_POLL_INTERVAL),
  });
}

// ── Admin: pending users approval ────────────────────────────────────────────

export function useAdminPendingUsers() {
  const { actor } = useActor(createActor);

  return useQuery<PublicProfile[]>({
    queryKey: ["adminPendingUsers"],
    queryFn: async () => {
      if (!actor) return [];
      try {
        return await actor.listPendingUsers();
      } catch {
        return [];
      }
    },
    enabled: !!actor,
    initialData: [],
    staleTime: 0,
    ...pollingOptions(DASHBOARD_POLL),
  });
}

export function useApproveUser() {
  const { actor } = useActor(createActor);
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (userId: import("../backend.d.ts").UserId) => {
      if (!actor) throw new Error("Actor not ready");
      return actor.approveUser(userId);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["adminPendingUsers"] });
      qc.invalidateQueries({ queryKey: ["adminAllUsers"] });
    },
  });
}

export function useRejectUser() {
  const { actor } = useActor(createActor);
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (userId: import("../backend.d.ts").UserId) => {
      if (!actor) throw new Error("Actor not ready");
      return actor.rejectUser(userId);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["adminPendingUsers"] });
      qc.invalidateQueries({ queryKey: ["adminAllUsers"] });
    },
  });
}

export function useAdminAllFeedback() {
  const { actor } = useActor(createActor);

  return useQuery<BackendFeedback[]>({
    queryKey: ["adminAllFeedback"],
    queryFn: async () => {
      if (!actor) return [];
      try {
        return await actor.getAllFeedback();
      } catch {
        return [];
      }
    },
    enabled: !!actor,
    initialData: [] as BackendFeedback[],
    staleTime: 0,
    ...pollingOptions(DASHBOARD_POLL),
  });
}

// ── Certificate hooks ─────────────────────────────────────────────────────────

export interface CertificateResult {
  code: string;
  studentName: string;
  courseName: string;
  issuedAt: bigint;
  isValid: boolean;
}

export function useGetCertificate(code: string) {
  const { actor, isFetching } = useActor(createActor);

  return useQuery<CertificateResult | null>({
    queryKey: ["certificate", code],
    queryFn: async () => {
      if (!actor || isFetching || !code) return null;
      try {
        const cert = await actor.getCertificate(code);
        if (!cert) return null;
        return {
          code: cert.code,
          studentName: cert.studentName,
          courseName: cert.courseName,
          issuedAt: cert.issuedAt,
          isValid: cert.verified,
        };
      } catch {
        return null;
      }
    },
    enabled: !!actor && !isFetching && !!code,
    staleTime: 60_000,
  });
}

export function useVerifyCertificate(code: string) {
  const { actor, isFetching } = useActor(createActor);

  return useQuery<boolean>({
    queryKey: ["verifyCertificate", code],
    queryFn: async () => {
      if (!actor || isFetching || !code) return false;
      try {
        return await actor.verifyCertificate(code);
      } catch {
        return false;
      }
    },
    enabled: !!actor && !isFetching && !!code,
    staleTime: 60_000,
  });
}

// ── Feedback hook (real backend) ──────────────────────────────────────────────

export function useAddFeedback() {
  const { actor } = useActor(createActor);
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async ({
      targetId,
      targetType,
      rating,
      comment,
    }: {
      targetId: string;
      targetType: "Course" | "Service";
      rating: number;
      comment: string;
    }) => {
      if (!actor) throw new Error("Actor not ready");
      const backendTargetType =
        targetType === "Course"
          ? FeedbackTargetType.Course
          : FeedbackTargetType.Service;
      return actor.addFeedback(
        targetId,
        backendTargetType,
        BigInt(rating),
        comment,
      );
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["myEnrollments"] });
    },
  });
}

// ── Admin: Create User directly (admin creates account with any role) ─────────
export interface AdminCreateUserInput {
  name: string;
  email: string;
  phone: string;
  password: string;
  role: "client" | "student" | "staff" | "receptionist";
  address?: string;
}

function toBackendRole(role: string): UserRole {
  const map: Record<string, UserRole> = {
    client: UserRole.Client,
    student: UserRole.Student,
    staff: UserRole.Staff,
    receptionist: UserRole.Receptionist,
    admin: UserRole.Admin,
  };
  return map[role.toLowerCase()] ?? UserRole.Client;
}

export function useAdminCreateUser() {
  const { actor } = useActor(createActor);
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (input: AdminCreateUserInput) => {
      if (!actor) throw new Error("Actor not ready");
      const passwordHash = await hashPassword(input.password);
      const backendRole = toBackendRole(input.role);
      const studentDetails: StudentDetails | null =
        input.role === "student"
          ? {
              courseType: "Online",
              preferredSlot: "Saturday",
              learningMode: "Self-paced",
            }
          : null;
      const result = await actor.register(
        input.email.trim().toLowerCase(),
        input.name.trim(),
        input.phone,
        passwordHash,
        backendRole,
        input.address?.trim() ?? null,
        null,
        studentDetails,
      );
      if (result.__kind__ === "err") {
        throw new Error(result.err);
      }
      // Admin-created users should be immediately active: approve if needed
      const profile = result.ok;
      const statusStr = String(profile.status);
      if (statusStr === "Pending") {
        try {
          await actor.approveUser(profile.id);
        } catch {
          // ignore approval error — user was created
        }
      }
      return profile;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["adminAllUsers"] });
      qc.invalidateQueries({ queryKey: ["adminPendingUsers"] });
    },
  });
}

// ── Admin: Delete/Remove User ─────────────────────────────────────────────────
export function useAdminDeleteUser() {
  const { actor } = useActor(createActor);
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (userId: import("../backend.d.ts").UserId) => {
      if (!actor) throw new Error("Actor not ready");
      // Use manageUser with "suspend" action as "delete" equivalent
      // If backend supports "delete" action, use it; otherwise suspend
      const result = await actor.manageUser(userId, "suspend");
      return result;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["adminAllUsers"] });
      qc.invalidateQueries({ queryKey: ["adminPendingUsers"] });
    },
  });
}

// ── Course Enrollment mutation ─────────────────────────────────────────────────

export function useEnrollCourse() {
  const { actor } = useActor(createActor);
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (courseId: number): Promise<CourseEnrollment> => {
      if (!actor) throw new Error("Actor not ready");
      const raw = await actor.enrollCourse(BigInt(courseId));
      return mapEnrollment(raw);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["myEnrollments"] });
      qc.invalidateQueries({ queryKey: ["courses"] });
      qc.invalidateQueries({ queryKey: ["adminAllProgress"] });
    },
  });
}

// ── Course Lessons (student view) ─────────────────────────────────────────────

import type {
  CourseLessonProgress as FrontendCourseLessonProgress,
  Lesson as FrontendLesson,
  LessonProgress as FrontendLessonProgress,
  QuizResult as FrontendQuizResult,
} from "../types";

const LESSON_POLL = 10_000;

function mapLesson(l: import("../backend.d.ts").Lesson): FrontendLesson {
  return {
    id: Number(l.id),
    courseId: Number(l.courseId),
    title: l.title ?? "",
    description: l.description ?? "",
    youtubeUrl: l.youtubeUrl ?? "",
    order: Number(l.order),
    quizQuestions: (l.quizQuestions ?? []).map((q) => ({
      id: Number(q.id),
      lessonId: Number(q.lessonId),
      question: q.question ?? "",
      options: q.options ?? [],
      correctOptionIndex: Number(q.correctOptionIndex),
    })),
  };
}

function mapLessonProgress(
  lp: import("../backend.d.ts").LessonProgress,
): FrontendLessonProgress {
  return {
    studentId: lp.studentId?.toString() ?? "",
    lessonId: Number(lp.lessonId),
    videoWatched: lp.videoWatched ?? false,
    quizScore: lp.quizScore != null ? Number(lp.quizScore) : undefined,
    quizPassed: lp.quizPassed ?? false,
    completedAt: lp.completedAt != null ? Number(lp.completedAt) : undefined,
  };
}

function mapCourseLessonProgress(
  cp: import("../backend.d.ts").CourseLessonProgress,
): FrontendCourseLessonProgress {
  return {
    studentId: cp.studentId?.toString() ?? "",
    courseId: Number(cp.courseId),
    completedLessonIds: (cp.completedLessonIds ?? []).map(Number),
    currentLessonId:
      cp.currentLessonId != null ? Number(cp.currentLessonId) : undefined,
    overallPercent: Number(cp.overallPercent ?? 0),
    certificateEarned: cp.certificateEarned ?? false,
  };
}

export function useLessons(courseId: number | null) {
  const { actor, isFetching } = useActor(createActor);
  const { isAuthenticated } = useAuth();

  return useQuery<FrontendLesson[]>({
    queryKey: ["lessons", courseId],
    queryFn: async () => {
      if (!actor || isFetching || !courseId) return [];
      try {
        const raw = await actor.getLessons(BigInt(courseId));
        return raw.map(mapLesson).sort((a, b) => a.order - b.order);
      } catch {
        return [];
      }
    },
    enabled: isAuthenticated && !!actor && !isFetching && !!courseId,
    initialData: [],
    staleTime: 0,
    ...pollingOptions(LESSON_POLL),
  });
}

export function useCourseProgress(courseId: number | null) {
  const { actor, isFetching } = useActor(createActor);
  const { isAuthenticated } = useAuth();

  return useQuery<FrontendCourseLessonProgress | null>({
    queryKey: ["courseProgress", courseId],
    queryFn: async () => {
      if (!actor || isFetching || !courseId) return null;
      try {
        const raw = await actor.getCourseProgress(BigInt(courseId));
        if (!raw) return null;
        return mapCourseLessonProgress(raw);
      } catch {
        return null;
      }
    },
    enabled: isAuthenticated && !!actor && !isFetching && !!courseId,
    initialData: null,
    staleTime: 0,
    ...pollingOptions(DASHBOARD_POLL),
  });
}

export function useLessonProgress(courseId: number | null) {
  const { actor, isFetching } = useActor(createActor);
  const { isAuthenticated } = useAuth();

  return useQuery<FrontendLessonProgress[]>({
    queryKey: ["lessonProgress", courseId],
    queryFn: async () => {
      if (!actor || isFetching || !courseId) return [];
      try {
        const raw = await actor.getLessonProgressForCourse(BigInt(courseId));
        return raw.map(mapLessonProgress);
      } catch {
        return [];
      }
    },
    enabled: isAuthenticated && !!actor && !isFetching && !!courseId,
    initialData: [],
    staleTime: 0,
    ...pollingOptions(DASHBOARD_POLL),
  });
}

export function useMarkVideoWatched() {
  const { actor } = useActor(createActor);
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (lessonId: number) => {
      if (!actor) throw new Error("Actor not ready");
      const raw = await actor.markVideoWatched(BigInt(lessonId));
      return mapLessonProgress(raw);
    },
    onSuccess: (_, lessonId) => {
      qc.invalidateQueries({ queryKey: ["lessonProgress"] });
      qc.invalidateQueries({ queryKey: ["courseProgress"] });
      void lessonId;
    },
  });
}

export function useSubmitQuiz() {
  const { actor } = useActor(createActor);
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async ({
      lessonId,
      answers,
    }: {
      lessonId: number;
      answers: number[];
    }): Promise<FrontendQuizResult> => {
      if (!actor) throw new Error("Actor not ready");
      const result = await actor.submitQuiz(
        BigInt(lessonId),
        answers.map(BigInt),
      );
      if (result.__kind__ === "err") throw new Error(result.err);
      const raw = result.ok;
      return {
        lessonId: Number(raw.lessonId),
        score: Number(raw.score),
        totalQuestions: Number(raw.totalQuestions),
        passed: raw.passed,
        courseProgress: mapCourseLessonProgress(raw.courseProgress),
      };
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["lessonProgress"] });
      qc.invalidateQueries({ queryKey: ["courseProgress"] });
      qc.invalidateQueries({ queryKey: ["myEnrollments"] });
    },
  });
}

// ── Admin: All Course Progress ────────────────────────────────────────────────

export function useAdminAllProgress() {
  const { actor } = useActor(createActor);

  return useQuery<FrontendCourseLessonProgress[]>({
    queryKey: ["adminAllProgress"],
    queryFn: async () => {
      if (!actor) return [];
      try {
        const raw = await actor.adminGetAllCourseProgress();
        return raw.map(mapCourseLessonProgress);
      } catch {
        return [];
      }
    },
    enabled: !!actor,
    initialData: [],
    staleTime: 0,
    ...pollingOptions(DASHBOARD_POLL),
  });
}

// ── Admin: Lesson management mutations ───────────────────────────────────────

export function useAddLesson() {
  const { actor } = useActor(createActor);
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (input: {
      courseId: number;
      title: string;
      description: string;
      youtubeUrl: string;
      order: number;
    }) => {
      if (!actor) throw new Error("Actor not ready");
      const raw = await actor.addLesson({
        courseId: BigInt(input.courseId),
        title: input.title,
        description: input.description,
        youtubeUrl: input.youtubeUrl,
        order: BigInt(input.order),
      });
      return mapLesson(raw);
    },
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ["lessons", vars.courseId] });
      qc.invalidateQueries({ queryKey: ["adminLessons", vars.courseId] });
      qc.invalidateQueries({ queryKey: ["adminCourses"] });
    },
  });
}

export function useEditLesson() {
  const { actor } = useActor(createActor);
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (input: {
      lessonId: number;
      courseId: number;
      title: string;
      description: string;
      youtubeUrl: string;
      order: number;
    }) => {
      if (!actor) throw new Error("Actor not ready");
      return actor.editLesson(BigInt(input.lessonId), {
        courseId: BigInt(input.courseId),
        title: input.title,
        description: input.description,
        youtubeUrl: input.youtubeUrl,
        order: BigInt(input.order),
      });
    },
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ["lessons", vars.courseId] });
      qc.invalidateQueries({ queryKey: ["adminLessons", vars.courseId] });
    },
  });
}

export function useRemoveLesson() {
  const { actor } = useActor(createActor);
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async ({
      lessonId,
      courseId,
    }: {
      lessonId: number;
      courseId: number;
    }) => {
      if (!actor) throw new Error("Actor not ready");
      void courseId;
      return actor.removeLesson(BigInt(lessonId));
    },
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ["lessons", vars.courseId] });
    },
  });
}

export function useAddQuizQuestion() {
  const { actor } = useActor(createActor);
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (input: {
      lessonId: number;
      courseId: number;
      question: string;
      options: string[];
      correctOptionIndex: number;
    }) => {
      if (!actor) throw new Error("Actor not ready");
      const raw = await actor.addQuizQuestion({
        lessonId: BigInt(input.lessonId),
        question: input.question,
        options: input.options,
        correctOptionIndex: BigInt(input.correctOptionIndex),
      });
      return mapLesson(raw);
    },
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ["lessons", vars.courseId] });
    },
  });
}

export function useEditQuizQuestion() {
  const { actor } = useActor(createActor);
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (input: {
      questionId: number;
      lessonId: number;
      courseId: number;
      question: string;
      options: string[];
      correctOptionIndex: number;
    }) => {
      if (!actor) throw new Error("Actor not ready");
      void input.courseId;
      return actor.editQuizQuestion(BigInt(input.questionId), {
        lessonId: BigInt(input.lessonId),
        question: input.question,
        options: input.options,
        correctOptionIndex: BigInt(input.correctOptionIndex),
      });
    },
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ["lessons", vars.courseId] });
    },
  });
}

export function useRemoveQuizQuestion() {
  const { actor } = useActor(createActor);
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async ({
      questionId,
      courseId,
    }: {
      questionId: number;
      courseId: number;
    }) => {
      if (!actor) throw new Error("Actor not ready");
      void courseId;
      return actor.removeQuizQuestion(BigInt(questionId));
    },
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ["lessons", vars.courseId] });
    },
  });
}

// ── Admin: Lesson read (no auth gate — admin session only) ───────────────────

export function useAdminLessons(courseId: number | null) {
  const { actor } = useActor(createActor);

  return useQuery<FrontendLesson[]>({
    queryKey: ["adminLessons", courseId],
    queryFn: async () => {
      if (!actor || !courseId) return [];
      try {
        const raw = await actor.getLessons(BigInt(courseId));
        return raw.map(mapLesson).sort((a, b) => a.order - b.order);
      } catch {
        return [];
      }
    },
    enabled: !!actor && !!courseId,
    initialData: [],
    staleTime: 0,
    ...pollingOptions(LESSON_POLL),
  });
}

// ── Admin: Stripe configuration ───────────────────────────────────────────────

export interface StripeConfig {
  publishableKey: string;
  secretKey: string;
  configured: boolean;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyActor = Record<string, (...args: any[]) => Promise<any>>;

export function useGetStripeConfig() {
  const { actor } = useActor(createActor);

  return useQuery<StripeConfig>({
    queryKey: ["stripeConfig"],
    queryFn: async (): Promise<StripeConfig> => {
      if (!actor)
        return { publishableKey: "", secretKey: "", configured: false };
      try {
        const a = actor as unknown as AnyActor;
        if (!a.getStripeConfig)
          return { publishableKey: "", secretKey: "", configured: false };
        const raw = await a.getStripeConfig();
        return {
          publishableKey: (raw?.publishableKey as string) ?? "",
          secretKey: (raw?.secretKey as string) ?? "",
          configured: (raw?.configured as boolean) ?? false,
        };
      } catch {
        return { publishableKey: "", secretKey: "", configured: false };
      }
    },
    enabled: !!actor,
    initialData: { publishableKey: "", secretKey: "", configured: false },
    staleTime: 0,
    refetchInterval: 30_000,
  });
}

export function useSetStripeKeys() {
  const { actor } = useActor(createActor);
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async ({
      publishableKey,
      secretKey,
    }: {
      publishableKey: string;
      secretKey: string;
    }) => {
      if (!actor) throw new Error("Actor not ready");
      const a = actor as unknown as AnyActor;
      if (!a.setStripeKeys) throw new Error("setStripeKeys not available");
      return a.setStripeKeys(publishableKey, secretKey);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["stripeConfig"] });
    },
  });
}

export interface StripeTestResult {
  success: boolean;
  message: string;
}

export function useTestStripeConnection() {
  const { actor } = useActor(createActor);

  return useMutation({
    mutationFn: async (): Promise<StripeTestResult> => {
      if (!actor) throw new Error("Actor not ready");
      const a = actor as unknown as AnyActor;
      if (!a.testStripeConnection)
        throw new Error("testStripeConnection not available");
      const result = await a.testStripeConnection();
      if (result?.__kind__ === "ok") {
        return { success: true, message: String(result.ok) };
      }
      return {
        success: false,
        message: String(result?.err ?? "Connection failed"),
      };
    },
  });
}
