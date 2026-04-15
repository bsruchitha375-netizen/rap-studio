import { useActor } from "@caffeineai/core-infrastructure";
import { useQuery } from "@tanstack/react-query";
import { createActor } from "../backend";
import { COURSES } from "../data/courses";
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
import { useAuth } from "./useAuth";

export function useServiceCategories() {
  const { actor, isFetching } = useActor(createActor);

  return useQuery<ServiceCategory[]>({
    queryKey: ["serviceCategories"],
    queryFn: async () => {
      if (!actor || isFetching) return SERVICE_CATEGORIES;
      return SERVICE_CATEGORIES;
    },
    enabled: true,
    initialData: SERVICE_CATEGORIES,
    staleTime: 5 * 60 * 1000,
  });
}

export function useCourses() {
  const { actor, isFetching } = useActor(createActor);

  return useQuery<Course[]>({
    queryKey: ["courses"],
    queryFn: async () => {
      if (!actor || isFetching) return COURSES;
      return COURSES;
    },
    enabled: true,
    initialData: COURSES,
    staleTime: 5 * 60 * 1000,
  });
}

export function useMyBookings() {
  const { actor, isFetching } = useActor(createActor);
  const { isAuthenticated } = useAuth();

  return useQuery<BookingRequest[]>({
    queryKey: ["myBookings"],
    queryFn: async () => {
      if (!actor) return [];
      return [];
    },
    enabled: isAuthenticated && !!actor && !isFetching,
    initialData: [],
  });
}

export function useMyEnrollments() {
  const { actor, isFetching } = useActor(createActor);
  const { isAuthenticated } = useAuth();

  return useQuery<CourseEnrollment[]>({
    queryKey: ["myEnrollments"],
    queryFn: async () => {
      if (!actor) return [];
      return [];
    },
    enabled: isAuthenticated && !!actor && !isFetching,
    initialData: [],
  });
}

export function useMyPayments() {
  const { actor, isFetching } = useActor(createActor);
  const { isAuthenticated } = useAuth();

  return useQuery<PaymentOrder[]>({
    queryKey: ["myPayments"],
    queryFn: async () => {
      if (!actor) return [];
      return [];
    },
    enabled: isAuthenticated && !!actor && !isFetching,
    initialData: [],
  });
}

export function usePublicCalendar() {
  const { actor, isFetching } = useActor(createActor);

  return useQuery<BookingSlot[]>({
    queryKey: ["publicCalendar"],
    queryFn: async () => {
      if (!actor || isFetching) return [];
      return [];
    },
    enabled: !!actor && !isFetching,
    initialData: [],
  });
}

export function useMyNotifications() {
  const { actor, isFetching } = useActor(createActor);
  const { isAuthenticated } = useAuth();

  return useQuery<NotificationRecord[]>({
    queryKey: ["myNotifications"],
    queryFn: async () => {
      if (!actor) return [];
      return [];
    },
    enabled: isAuthenticated && !!actor && !isFetching,
    initialData: [],
    refetchInterval: 30000,
  });
}

export function useAdminStats() {
  const { actor, isFetching } = useActor(createActor);
  const { isAuthenticated } = useAuth();

  return useQuery<BookingStats | null>({
    queryKey: ["adminStats"],
    queryFn: async () => {
      if (!actor) return null;
      return null;
    },
    enabled: isAuthenticated && !!actor && !isFetching,
    initialData: null,
  });
}

// ── CMS Content type ──────────────────────────────────────────────────────────
export interface CmsEntry {
  key: string;
  value: string;
  contentType: "text" | "color" | "imageUrl";
  updatedAt: number;
}

export function useAdminCmsContent() {
  const { actor, isFetching } = useActor(createActor);
  const { isAuthenticated } = useAuth();

  return useQuery<CmsEntry[]>({
    queryKey: ["adminCmsContent"],
    queryFn: async () => {
      if (!actor) return [];
      // When backend CMS methods are available, call actor.getAllCmsContent()
      // For now return empty so localStorage values take precedence
      return [];
    },
    enabled: isAuthenticated && !!actor && !isFetching,
    initialData: [],
    staleTime: 60 * 1000,
  });
}

export function useCmsValue(key: string) {
  const { actor, isFetching } = useActor(createActor);

  return useQuery<string>({
    queryKey: ["cmsValue", key],
    queryFn: async () => {
      if (!actor || isFetching) return localStorage.getItem(`cms_${key}`) ?? "";
      // When backend CMS method is available: return actor.getCmsContent(key)
      return localStorage.getItem(`cms_${key}`) ?? "";
    },
    enabled: true,
    staleTime: 60 * 1000,
  });
}

export function useAdminAllPayments() {
  const { actor, isFetching } = useActor(createActor);
  const { isAuthenticated } = useAuth();

  return useQuery<PaymentOrder[]>({
    queryKey: ["adminAllPayments"],
    queryFn: async () => {
      if (!actor) return [];
      // When backend method is available: return actor.getAllPayments()
      return [];
    },
    enabled: isAuthenticated && !!actor && !isFetching,
    initialData: [],
    refetchInterval: 60 * 1000,
  });
}
