import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useActor } from "@caffeineai/core-infrastructure";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import {
  Briefcase,
  Calendar,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Clock,
  Eye,
  FileText,
  Images,
  Loader2,
  LogOut,
  Upload,
  User,
  X,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useCallback, useRef, useState } from "react";
import { toast } from "sonner";
import { ExternalBlob, createActor } from "../backend";
import type {
  AssignmentStatus,
  FileType,
  WorkAssignment,
} from "../backend.d.ts";
import { LiveIndicator } from "../components/dashboard/LiveIndicator";
import { Layout } from "../components/layout/Layout";
import { useAuth, useUserProfile } from "../hooks/useAuth";

// ── Constants ──────────────────────────────────────────────────────────────────
const POLL_MS = 5_000;
const MAX_FILE_BYTES = 50 * 1024 * 1024; // 50 MB
const ACCEPTED_MIME_PREFIXES = ["image/", "video/", "application/pdf"];

function pollingOptions(ms: number) {
  return { refetchInterval: ms, refetchIntervalInBackground: true };
}

// ── Hooks ─────────────────────────────────────────────────────────────────────

function useMyAssignedWork() {
  const { actor, isFetching } = useActor(createActor);
  const { isAuthenticated } = useAuth();

  return useQuery<WorkAssignment[]>({
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
    initialData: [] as WorkAssignment[],
    staleTime: POLL_MS,
    ...pollingOptions(POLL_MS),
  });
}

function useMyUploadedWork() {
  const { actor, isFetching } = useActor(createActor);
  const { isAuthenticated } = useAuth();

  return useQuery<WorkAssignment[]>({
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
    initialData: [] as WorkAssignment[],
    staleTime: POLL_MS,
    ...pollingOptions(POLL_MS),
  });
}

function useSubmitDeliverable() {
  const { actor } = useActor(createActor);
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async ({
      assignmentId,
      fileUrl,
      fileName,
    }: {
      assignmentId: bigint;
      fileUrl: string;
      fileName: string;
    }) => {
      if (!actor) throw new Error("Actor not ready");
      return actor.submitDeliverable(assignmentId, fileUrl, fileName);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["myAssignedWork"] });
      qc.invalidateQueries({ queryKey: ["myUploadedWork"] });
    },
  });
}

// ── Helpers ────────────────────────────────────────────────────────────────────

function statusColor(status: AssignmentStatus | string): string {
  switch (String(status)) {
    case "Assigned":
      return "bg-amber-500/20 text-amber-300 border-amber-500/30";
    case "InProgress":
      return "bg-blue-500/20 text-blue-300 border-blue-500/30";
    case "Delivered":
      return "bg-emerald-500/20 text-emerald-300 border-emerald-500/30";
    case "Approved":
      return "bg-primary/20 text-primary border-primary/40";
    default:
      return "bg-muted/40 text-muted-foreground border-border/40";
  }
}

function formatTimestamp(ts: bigint): string {
  return new Date(Number(ts / BigInt(1_000_000))).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function isImageFile(fileName: string): boolean {
  return /\.(jpg|jpeg|png|gif|webp|avif|svg)$/i.test(fileName);
}

// ── UploadZone ────────────────────────────────────────────────────────────────

interface UploadZoneProps {
  assignmentId: bigint;
  onUploaded: () => void;
}

function UploadZone({ assignmentId, onUploaded }: UploadZoneProps) {
  const { actor } = useActor(createActor);
  const submitDeliverable = useSubmitDeliverable();
  const [isDragOver, setIsDragOver] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [progress, setProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const validateFile = useCallback((f: File): string | null => {
    const accepted = ACCEPTED_MIME_PREFIXES.some((p) => f.type.startsWith(p));
    if (!accepted) return "Only images, videos, and PDF files are accepted.";
    if (f.size > MAX_FILE_BYTES)
      return `File must be under 50 MB (this file is ${(f.size / 1024 / 1024).toFixed(1)} MB).`;
    return null;
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragOver(false);
      const dropped = e.dataTransfer.files[0];
      if (!dropped) return;
      const err = validateFile(dropped);
      if (err) {
        toast.error(err);
        return;
      }
      setFile(dropped);
    },
    [validateFile],
  );

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (!selected) return;
    const err = validateFile(selected);
    if (err) {
      toast.error(err);
      e.target.value = "";
      return;
    }
    setFile(selected);
  };

  const handleUpload = async () => {
    if (!file || !actor) {
      toast.error("Select a file first.");
      return;
    }
    setIsUploading(true);
    setProgress(0);

    try {
      // Build ExternalBlob with real upload progress from object-storage extension
      const bytes = new Uint8Array(await file.arrayBuffer());
      const blob = ExternalBlob.fromBytes(bytes).withUploadProgress(
        (pct: number) => setProgress(Math.round(pct * 0.9)), // 0-90% for upload
      );

      const fileTypeValue: FileType = file.type.startsWith("image/")
        ? ("Photo" as FileType)
        : ("Video" as FileType);

      const mediaResult = await actor.uploadMedia({
        title: file.name,
        serviceCategory: "staff_deliverable",
        blob,
        fileType: fileTypeValue,
      });

      setProgress(95);

      const fileUrl = mediaResult.blob.getDirectURL();
      await submitDeliverable.mutateAsync({
        assignmentId,
        fileUrl,
        fileName: file.name,
      });

      setProgress(100);
      toast.success("Deliverable uploaded and submitted!");
      setFile(null);
      setProgress(0);
      if (fileRef.current) fileRef.current.value = "";
      onUploaded();
    } catch (err) {
      toast.error("Upload failed — please try again.");
      console.error("Upload error:", err);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-3 mt-3">
      {/* Drop zone */}
      <motion.button
        type="button"
        animate={
          isDragOver
            ? {
                boxShadow:
                  "0 0 0 2px oklch(0.72 0.14 82 / 0.8), 0 0 24px oklch(0.72 0.14 82 / 0.2)",
              }
            : { boxShadow: "none" }
        }
        transition={{ duration: 0.18 }}
        className={`w-full relative border-2 border-dashed rounded-xl p-5 text-center cursor-pointer transition-colors duration-200 ${
          isDragOver
            ? "border-primary bg-primary/10"
            : file
              ? "border-primary/50 bg-primary/5"
              : "border-border/40 hover:border-primary/40 hover:bg-primary/5"
        }`}
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragOver(true);
        }}
        onDragLeave={() => setIsDragOver(false)}
        onDrop={handleDrop}
        onClick={() => fileRef.current?.click()}
        aria-label="Upload deliverable — drag and drop or click"
        data-ocid="upload.dropzone"
      >
        <input
          ref={fileRef}
          type="file"
          accept="image/*,video/*,.pdf"
          className="hidden"
          onChange={handleFileChange}
        />

        {file ? (
          <div className="flex items-center justify-center gap-3">
            <FileText className="w-5 h-5 text-primary shrink-0" />
            <div className="text-left min-w-0">
              <p className="text-sm font-medium text-foreground truncate max-w-[220px]">
                {file.name}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                {(file.size / 1024 / 1024).toFixed(2)} MB
              </p>
            </div>
            <button
              type="button"
              className="ml-auto p-1 rounded hover:bg-destructive/20 text-muted-foreground hover:text-destructive transition-colors"
              onClick={(e) => {
                e.stopPropagation();
                setFile(null);
                if (fileRef.current) fileRef.current.value = "";
              }}
              aria-label="Remove selected file"
              data-ocid="upload.remove_file_button"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div>
            <Upload
              className={`w-7 h-7 mx-auto mb-2 transition-colors ${isDragOver ? "text-primary" : "text-muted-foreground/50"}`}
            />
            <p className="text-sm text-muted-foreground">
              {isDragOver ? "Drop file here" : "Drag & drop or click to select"}
            </p>
            <p className="text-xs text-muted-foreground/60 mt-1">
              Images, videos, PDF · Max 50 MB
            </p>
          </div>
        )}
      </motion.button>

      {/* Progress bar */}
      {isUploading && (
        <div>
          <div className="flex justify-between text-xs mb-1.5">
            <span className="text-muted-foreground">Uploading…</span>
            <span style={{ color: "oklch(0.82 0.2 70)" }}>{progress}%</span>
          </div>
          <div className="h-1.5 rounded-full bg-muted/40 overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ ease: "linear" }}
              className="h-full rounded-full"
              style={{ background: "oklch(0.72 0.14 82)" }}
            />
          </div>
        </div>
      )}

      <Button
        type="button"
        onClick={handleUpload}
        disabled={!file || isUploading}
        className="w-full btn-primary-luxury gap-2"
        data-ocid="upload.submit_button"
      >
        {isUploading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            Uploading…
          </>
        ) : (
          <>
            <Upload className="w-4 h-4" />
            Submit Deliverable
          </>
        )}
      </Button>
    </div>
  );
}

// ── AssignmentCard ─────────────────────────────────────────────────────────────

interface AssignmentCardProps {
  assignment: WorkAssignment;
  index: number;
}

function AssignmentCard({ assignment, index }: AssignmentCardProps) {
  const [expanded, setExpanded] = useState(false);
  const qc = useQueryClient();
  const statusStr = String(assignment.status);

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.07 }}
      className="rounded-xl overflow-hidden transition-all duration-300"
      style={{
        background: "oklch(0.12 0.014 275 / 0.6)",
        backdropFilter: "blur(12px)",
        border: `1px solid ${expanded ? "oklch(0.72 0.14 82 / 0.4)" : "oklch(0.22 0.018 275 / 0.5)"}`,
      }}
      data-ocid={`staff-assignment.item.${index + 1}`}
    >
      {/* Header row — clickable to expand */}
      <button
        type="button"
        className="w-full p-5 text-left flex items-start justify-between gap-3 hover:bg-primary/5 transition-colors"
        onClick={() => setExpanded((v) => !v)}
        aria-expanded={expanded}
        data-ocid={`staff-assignment.expand_button.${index + 1}`}
      >
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span className="font-semibold text-foreground capitalize text-sm">
              {assignment.sessionType}
            </span>
            <Badge
              className={`text-[10px] border px-2 py-0.5 ${statusColor(assignment.status)}`}
            >
              {statusStr.replace(/([A-Z])/g, " $1").trim()}
            </Badge>
          </div>
          <div className="flex items-center gap-4 text-xs text-muted-foreground flex-wrap">
            <span className="flex items-center gap-1">
              <User className="w-3 h-3" />
              {assignment.clientName}
            </span>
            <span className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              {assignment.sessionDate}
            </span>
            <span className="flex items-center gap-1">
              <FileText className="w-3 h-3" />
              {assignment.deliverables.length} file
              {assignment.deliverables.length !== 1 ? "s" : ""}
            </span>
          </div>
        </div>
        {expanded ? (
          <ChevronUp className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" />
        ) : (
          <ChevronDown className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" />
        )}
      </button>

      {/* Expanded details + upload */}
      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            key="details"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.28, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div
              className="px-5 pb-5 space-y-4 border-t"
              style={{ borderColor: "oklch(0.22 0.018 275 / 0.4)" }}
            >
              {assignment.notes && (
                <div className="pt-4">
                  <p className="text-xs text-muted-foreground mb-1 uppercase tracking-wider">
                    Notes
                  </p>
                  <p className="text-sm text-foreground/80">
                    {assignment.notes}
                  </p>
                </div>
              )}

              {/* Existing deliverables list */}
              {assignment.deliverables.length > 0 && (
                <div>
                  <p className="text-xs text-muted-foreground mb-2 uppercase tracking-wider">
                    Submitted Files
                  </p>
                  <div className="space-y-2">
                    {assignment.deliverables.map((d, di) => (
                      <div
                        key={`${String(assignment.id)}-d-${di}`}
                        className="flex items-center gap-2 p-2.5 rounded-lg bg-muted/20 border border-border/30"
                        data-ocid={`staff-deliverable.item.${di + 1}`}
                      >
                        <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
                        <span className="text-sm text-foreground truncate flex-1 min-w-0">
                          {d.fileName}
                        </span>
                        <span className="text-xs text-muted-foreground shrink-0">
                          {formatTimestamp(d.submittedAt)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Upload zone — hidden when Approved */}
              {statusStr !== "Approved" ? (
                <div>
                  <p className="text-xs text-muted-foreground mb-0.5 uppercase tracking-wider">
                    Upload New Deliverable
                  </p>
                  <UploadZone
                    assignmentId={assignment.id}
                    onUploaded={() => {
                      qc.invalidateQueries({ queryKey: ["myAssignedWork"] });
                      qc.invalidateQueries({ queryKey: ["myUploadedWork"] });
                    }}
                  />
                </div>
              ) : (
                <div
                  className="flex items-center gap-2 p-3 rounded-lg border"
                  style={{
                    background: "oklch(0.72 0.14 82 / 0.08)",
                    borderColor: "oklch(0.72 0.14 82 / 0.3)",
                  }}
                >
                  <CheckCircle2
                    className="w-4 h-4 shrink-0"
                    style={{ color: "oklch(0.72 0.14 82)" }}
                  />
                  <p
                    className="text-sm font-medium"
                    style={{ color: "oklch(0.82 0.2 70)" }}
                  >
                    Work approved — no further uploads needed.
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ── StaffDashboard ─────────────────────────────────────────────────────────────

export function StaffDashboard() {
  const { isAuthenticated, user, logout } = useAuth();
  const { data: profile } = useUserProfile();
  const navigate = useNavigate();

  const {
    data: assignments = [],
    isLoading: assignmentsLoading,
    dataUpdatedAt,
  } = useMyAssignedWork();

  const { data: submittedWork = [], isLoading: submittedLoading } =
    useMyUploadedWork();

  const [activeTab, setActiveTab] = useState("assignments");
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [filterAssignmentId, setFilterAssignmentId] = useState<string>("all");

  const name = profile?.name ?? user?.name ?? "Staff Member";
  const initials = name
    .split(" ")
    .map((w: string) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  // Flatten all deliverables from submitted work
  const allDeliverables = submittedWork.flatMap((a) =>
    a.deliverables.map((d, di) => ({
      key: `${String(a.id)}-${di}`,
      fileName: d.fileName,
      fileUrl: d.fileUrl,
      submittedAt: d.submittedAt,
      assignment: a,
    })),
  );

  const filteredDeliverables =
    filterAssignmentId === "all"
      ? allDeliverables
      : allDeliverables.filter(
          (d) => String(d.assignment.id) === filterAssignmentId,
        );

  function handleLogout() {
    logout();
    void navigate({ to: "/login" });
  }

  if (!isAuthenticated) {
    return (
      <Layout>
        <div className="container mx-auto py-20 text-center text-muted-foreground">
          Access denied. Please{" "}
          <button
            type="button"
            className="text-primary underline"
            onClick={() => void navigate({ to: "/login" })}
          >
            log in
          </button>
          .
        </div>
      </Layout>
    );
  }

  // Stat counts
  const assignedCount = assignments.filter(
    (a) => String(a.status) === "Assigned",
  ).length;
  const inProgressCount = assignments.filter(
    (a) => String(a.status) === "InProgress",
  ).length;
  const completedCount = assignments.filter(
    (a) => String(a.status) === "Delivered" || String(a.status) === "Approved",
  ).length;

  return (
    <Layout>
      {/* ── Header ── */}
      <div
        className="border-b border-border/20"
        style={{
          background:
            "linear-gradient(135deg, oklch(0.10 0.018 280), oklch(0.15 0.025 285))",
        }}
      >
        <div className="container mx-auto px-4 py-8 max-w-5xl">
          <motion.div
            initial={{ opacity: 0, y: -16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45 }}
            className="flex items-start justify-between gap-4 flex-wrap"
          >
            {/* Identity */}
            <div className="flex items-center gap-4">
              <motion.div
                initial={{ scale: 0.85 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.4, type: "spring" }}
                className="w-14 h-14 rounded-full flex items-center justify-center text-lg font-bold font-display shrink-0"
                style={{
                  background:
                    "linear-gradient(135deg, oklch(0.7 0.22 70 / 0.25), oklch(0.7 0.22 70 / 0.08))",
                  border: "2px solid oklch(0.7 0.22 70 / 0.45)",
                  color: "oklch(0.82 0.2 70)",
                  boxShadow: "0 0 20px oklch(0.7 0.22 70 / 0.15)",
                }}
              >
                {initials || <User className="w-6 h-6" />}
              </motion.div>
              <div>
                <div className="flex items-center gap-2 mb-0.5">
                  <p
                    className="text-xs uppercase tracking-widest"
                    style={{ color: "oklch(0.7 0.22 70 / 0.7)" }}
                  >
                    Staff Portal
                  </p>
                  <Badge
                    className="text-[10px] border"
                    style={{
                      background: "oklch(0.7 0.22 70 / 0.15)",
                      color: "oklch(0.82 0.2 70)",
                      borderColor: "oklch(0.7 0.22 70 / 0.35)",
                    }}
                  >
                    Staff
                  </Badge>
                </div>
                <h1 className="text-2xl font-display font-bold text-foreground">
                  Welcome,{" "}
                  <span style={{ color: "oklch(0.82 0.2 70)" }}>{name}</span> 📸
                </h1>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Manage assigned sessions · Upload deliverables
                </p>
              </div>
            </div>

            {/* Stat chips + logout */}
            <div className="flex items-center gap-3 flex-wrap">
              {[
                {
                  label: "Assigned",
                  value: assignedCount,
                  color: "oklch(0.82 0.18 75)",
                },
                {
                  label: "In Progress",
                  value: inProgressCount,
                  color: "oklch(0.7 0.2 230)",
                },
                {
                  label: "Completed",
                  value: completedCount,
                  color: "oklch(0.72 0.18 155)",
                },
              ].map((stat) => (
                <div
                  key={stat.label}
                  className="text-center px-3 py-2 rounded-lg"
                  style={{
                    background: "oklch(0.12 0.014 275 / 0.5)",
                    border: "1px solid oklch(0.22 0.018 275 / 0.4)",
                    minWidth: "4rem",
                  }}
                >
                  <div
                    className="text-xl font-bold font-display leading-none"
                    style={{ color: stat.color }}
                  >
                    {stat.value}
                  </div>
                  <div className="text-[10px] text-muted-foreground uppercase tracking-wider mt-0.5">
                    {stat.label}
                  </div>
                </div>
              ))}

              <Button
                type="button"
                variant="outline"
                size="sm"
                className="gap-2 text-xs border-border/40 hover:border-destructive/40 hover:text-destructive"
                onClick={handleLogout}
                data-ocid="staff-dashboard.logout_button"
              >
                <LogOut className="w-3.5 h-3.5" />
                Sign Out
              </Button>
            </div>
          </motion.div>
        </div>
      </div>

      {/* ── Body ── */}
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          data-ocid="staff-dashboard.tabs"
        >
          <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
            <TabsList
              className="border border-border/50"
              style={{ background: "oklch(0.12 0.014 275 / 0.6)" }}
            >
              <TabsTrigger
                value="assignments"
                className="gap-1.5"
                data-ocid="staff-dashboard.tab.assignments"
              >
                <Briefcase className="w-4 h-4" />
                My Assignments
                {assignments.length > 0 && (
                  <Badge
                    className="ml-1 text-xs border-0 h-4 px-1.5"
                    style={{
                      background: "oklch(0.72 0.14 82 / 0.25)",
                      color: "oklch(0.82 0.2 70)",
                    }}
                  >
                    {assignments.length}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger
                value="submitted"
                className="gap-1.5"
                data-ocid="staff-dashboard.tab.submitted"
              >
                <Images className="w-4 h-4" />
                Submitted Work
                {allDeliverables.length > 0 && (
                  <Badge
                    className="ml-1 text-xs border-0 h-4 px-1.5"
                    style={{
                      background: "oklch(0.65 0.2 290 / 0.25)",
                      color: "oklch(0.75 0.18 290)",
                    }}
                  >
                    {allDeliverables.length}
                  </Badge>
                )}
              </TabsTrigger>
            </TabsList>

            {activeTab === "assignments" && (
              <LiveIndicator
                updatedAt={dataUpdatedAt}
                pollMs={POLL_MS}
                label="assignments"
              />
            )}
          </div>

          {/* ── Assignments tab ── */}
          <TabsContent value="assignments">
            <AnimatePresence mode="wait">
              <motion.div
                key="assignments"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.28 }}
              >
                {assignmentsLoading ? (
                  <div className="space-y-3">
                    {[1, 2, 3].map((i) => (
                      <Skeleton key={i} className="h-20 rounded-xl" />
                    ))}
                  </div>
                ) : assignments.length === 0 ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.97 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center py-20"
                    data-ocid="staff-assignment.empty_state"
                  >
                    <div
                      className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
                      style={{
                        background: "oklch(0.72 0.14 82 / 0.1)",
                        border: "1px solid oklch(0.72 0.14 82 / 0.25)",
                      }}
                    >
                      <Clock
                        className="w-7 h-7"
                        style={{ color: "oklch(0.72 0.14 82)" }}
                      />
                    </div>
                    <h3 className="font-semibold text-foreground mb-1">
                      No assignments yet
                    </h3>
                    <p className="text-sm text-muted-foreground max-w-xs mx-auto">
                      Your assigned sessions will appear here once the admin
                      assigns work to you.
                    </p>
                  </motion.div>
                ) : (
                  <div className="space-y-3">
                    {assignments.map((assignment, i) => (
                      <AssignmentCard
                        key={String(assignment.id)}
                        assignment={assignment}
                        index={i}
                      />
                    ))}
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </TabsContent>

          {/* ── Submitted work tab ── */}
          <TabsContent value="submitted">
            <AnimatePresence mode="wait">
              <motion.div
                key="submitted"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.28 }}
              >
                {/* Filter pills */}
                {submittedWork.length > 0 && (
                  <div className="flex items-center gap-2 mb-5 flex-wrap">
                    <span className="text-xs text-muted-foreground uppercase tracking-wider">
                      Filter:
                    </span>
                    <button
                      type="button"
                      onClick={() => setFilterAssignmentId("all")}
                      className={`text-xs px-3 py-1 rounded-full border transition-colors ${
                        filterAssignmentId === "all"
                          ? "border-primary/40 bg-primary/15 text-primary"
                          : "border-border/40 text-muted-foreground hover:border-primary/30"
                      }`}
                      data-ocid="staff-submitted.filter.all"
                    >
                      All ({allDeliverables.length})
                    </button>
                    {submittedWork.map((a) => (
                      <button
                        key={String(a.id)}
                        type="button"
                        onClick={() => setFilterAssignmentId(String(a.id))}
                        className={`text-xs px-3 py-1 rounded-full border transition-colors capitalize ${
                          filterAssignmentId === String(a.id)
                            ? "border-primary/40 bg-primary/15 text-primary"
                            : "border-border/40 text-muted-foreground hover:border-primary/30"
                        }`}
                        data-ocid="staff-submitted.filter.assignment"
                      >
                        {a.sessionType} · {a.sessionDate}
                      </button>
                    ))}
                  </div>
                )}

                {submittedLoading ? (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                      <Skeleton key={i} className="aspect-square rounded-xl" />
                    ))}
                  </div>
                ) : filteredDeliverables.length === 0 ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.97 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center py-20"
                    data-ocid="staff-submitted.empty_state"
                  >
                    <div
                      className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
                      style={{
                        background: "oklch(0.65 0.2 290 / 0.1)",
                        border: "1px solid oklch(0.65 0.2 290 / 0.25)",
                      }}
                    >
                      <Images
                        className="w-7 h-7"
                        style={{ color: "oklch(0.65 0.2 290)" }}
                      />
                    </div>
                    <h3 className="font-semibold text-foreground mb-1">
                      No submitted work yet
                    </h3>
                    <p className="text-sm text-muted-foreground max-w-xs mx-auto">
                      Upload deliverables from your assignments — they'll appear
                      here after submission.
                    </p>
                  </motion.div>
                ) : (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {filteredDeliverables.map((item, i) => {
                      const isImg = isImageFile(item.fileName);
                      const isPdf = item.fileName
                        .toLowerCase()
                        .endsWith(".pdf");
                      const canPreview =
                        item.fileUrl.startsWith("http") && isImg;

                      return (
                        <motion.div
                          key={item.key}
                          initial={{ opacity: 0, scale: 0.94 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: i * 0.05 }}
                          className="group rounded-xl overflow-hidden relative aspect-square border cursor-pointer"
                          style={{
                            background: "oklch(0.12 0.014 275 / 0.5)",
                            borderColor: "oklch(0.22 0.018 275 / 0.5)",
                          }}
                          onClick={() =>
                            canPreview
                              ? setPreviewUrl(item.fileUrl)
                              : toast.info(
                                  "Preview not available for this file type.",
                                )
                          }
                          data-ocid={`staff-submitted.item.${i + 1}`}
                        >
                          {/* Thumbnail */}
                          {canPreview ? (
                            <img
                              src={item.fileUrl}
                              alt={item.fileName}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex flex-col items-center justify-center gap-2 p-3">
                              {isPdf ? (
                                <FileText
                                  className="w-10 h-10"
                                  style={{
                                    color: "oklch(0.72 0.14 82 / 0.6)",
                                  }}
                                />
                              ) : (
                                <Images
                                  className="w-10 h-10"
                                  style={{
                                    color: "oklch(0.65 0.2 290 / 0.6)",
                                  }}
                                />
                              )}
                              <span className="text-xs text-muted-foreground/70 text-center line-clamp-2 break-all">
                                {item.fileName}
                              </span>
                            </div>
                          )}

                          {/* Hover overlay */}
                          <div
                            className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-all duration-200 flex flex-col items-center justify-center gap-1.5 p-3"
                            style={{
                              background: "oklch(0.07 0.01 270 / 0.88)",
                            }}
                          >
                            <p className="text-xs font-semibold text-foreground text-center line-clamp-2 break-all">
                              {item.fileName}
                            </p>
                            <p className="text-[10px] text-muted-foreground capitalize">
                              {item.assignment.sessionType}
                            </p>
                            <p className="text-[10px] text-muted-foreground">
                              {formatTimestamp(item.submittedAt)}
                            </p>
                            {canPreview && (
                              <Button
                                type="button"
                                size="sm"
                                variant="outline"
                                className="h-7 px-2 text-xs gap-1 mt-1"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setPreviewUrl(item.fileUrl);
                                }}
                                data-ocid={`staff-submitted.preview_button.${i + 1}`}
                              >
                                <Eye className="w-3 h-3" />
                                View
                              </Button>
                            )}
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </TabsContent>
        </Tabs>
      </div>

      {/* ── Image preview dialog ── */}
      <Dialog
        open={!!previewUrl}
        onOpenChange={(open) => !open && setPreviewUrl(null)}
      >
        <DialogContent
          className="max-w-3xl p-2"
          data-ocid="staff-preview.dialog"
        >
          <DialogHeader className="sr-only">
            <DialogTitle>File Preview</DialogTitle>
          </DialogHeader>
          {previewUrl && (
            <img
              src={previewUrl}
              alt="Deliverable preview"
              className="w-full h-auto rounded-lg max-h-[80vh] object-contain"
            />
          )}
        </DialogContent>
      </Dialog>
    </Layout>
  );
}
