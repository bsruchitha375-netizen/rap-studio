import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
  FileText,
  Images,
  Loader2,
  LogOut,
  Moon,
  Pencil,
  Sun,
  Upload,
  User,
  X,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useTheme } from "next-themes";
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
const MAX_FILE_BYTES = 50 * 1024 * 1024;
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

function useSubmitDeliverable() {
  const { actor } = useActor(createActor);
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      assignmentId,
      fileUrl,
      fileName,
    }: { assignmentId: bigint; fileUrl: string; fileName: string }) => {
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
    if (!ACCEPTED_MIME_PREFIXES.some((p) => f.type.startsWith(p)))
      return "Only images, videos, and PDF files are accepted.";
    if (f.size > MAX_FILE_BYTES)
      return `File must be under 50 MB (${(f.size / 1024 / 1024).toFixed(1)} MB).`;
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
      const bytes = new Uint8Array(await file.arrayBuffer());
      const blob = ExternalBlob.fromBytes(bytes).withUploadProgress(
        (pct: number) => setProgress(Math.round(pct * 0.9)),
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

      {isUploading && (
        <div>
          <div className="flex justify-between text-xs mb-1.5">
            <span className="text-muted-foreground">Uploading…</span>
            <span className="text-primary">{progress}%</span>
          </div>
          <div className="h-1.5 rounded-full bg-muted/40 overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ ease: "linear" }}
              className="h-full rounded-full bg-primary"
            />
          </div>
        </div>
      )}

      <Button
        type="button"
        onClick={handleUpload}
        disabled={!file || isUploading}
        className="w-full gap-2 btn-primary-luxury"
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

// ── WorkItemCard ───────────────────────────────────────────────────────────────

interface WorkItemCardProps {
  assignment: WorkAssignment;
  index: number;
  showUpload?: boolean;
}

function WorkItemCard({
  assignment,
  index,
  showUpload = false,
}: WorkItemCardProps) {
  const [expanded, setExpanded] = useState(false);
  const qc = useQueryClient();
  const statusStr = String(assignment.status ?? "Assigned");

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
      data-ocid={`work-item.item.${index + 1}`}
    >
      <button
        type="button"
        className="w-full p-5 text-left flex items-start justify-between gap-3 hover:bg-primary/5 transition-colors"
        onClick={() => setExpanded((v) => !v)}
        aria-expanded={expanded}
        data-ocid={`work-item.expand_button.${index + 1}`}
      >
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span className="font-semibold text-foreground capitalize text-sm">
              {String(assignment.sessionType ?? "")}
            </span>
            <Badge
              className={`text-[10px] border px-2 py-0.5 ${statusColor(statusStr)}`}
            >
              {statusStr.replace(/([A-Z])/g, " $1").trim()}
            </Badge>
          </div>
          <div className="flex items-center gap-4 text-xs text-muted-foreground flex-wrap">
            <span className="flex items-center gap-1">
              <User className="w-3 h-3" />
              {String(assignment.clientName ?? "—")}
            </span>
            <span className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              {String(assignment.sessionDate ?? "—")}
            </span>
            <span className="flex items-center gap-1">
              <FileText className="w-3 h-3" />
              {(assignment.deliverables ?? []).length} file
              {(assignment.deliverables ?? []).length !== 1 ? "s" : ""}
            </span>
          </div>
        </div>
        {expanded ? (
          <ChevronUp className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" />
        ) : (
          <ChevronDown className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" />
        )}
      </button>

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
                    {String(assignment.notes)}
                  </p>
                </div>
              )}
              {(assignment.deliverables ?? []).length > 0 && (
                <div>
                  <p className="text-xs text-muted-foreground mb-2 uppercase tracking-wider">
                    Submitted Files
                  </p>
                  <div className="space-y-2">
                    {(assignment.deliverables ?? []).map((d, di) => (
                      <div
                        key={`${String(assignment.id)}-d-${di}`}
                        className="flex items-center gap-2 p-2.5 rounded-lg bg-muted/20 border border-border/30"
                        data-ocid={`work-deliverable.item.${di + 1}`}
                      >
                        <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
                        <span className="text-sm text-foreground truncate flex-1 min-w-0">
                          {d.fileName ?? ""}
                        </span>
                        <span className="text-xs text-muted-foreground shrink-0">
                          {formatTimestamp(d.submittedAt)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {showUpload && statusStr !== "Approved" ? (
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
              ) : showUpload && statusStr === "Approved" ? (
                <div
                  className="flex items-center gap-2 p-3 rounded-lg border"
                  style={{
                    background: "oklch(0.72 0.14 82 / 0.08)",
                    borderColor: "oklch(0.72 0.14 82 / 0.3)",
                  }}
                >
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-primary" />
                  <p className="text-sm font-medium text-primary">
                    Work approved — no further uploads needed.
                  </p>
                </div>
              ) : null}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ── Profile Tab ────────────────────────────────────────────────────────────────

interface ProfileTabProps {
  name: string;
  user: { email?: string; phone?: string; name?: string } | null;
  profile:
    | {
        email?: string;
        phone?: string;
        address?: string;
        status?: string;
        role?: string;
      }
    | null
    | undefined;
}

function ProfileTab({ name, user, profile }: ProfileTabProps) {
  const [editing, setEditing] = useState(false);
  const [displayName, setDisplayName] = useState(name);

  const fields = [
    { label: "Full Name", value: displayName, icon: User },
    {
      label: "Email",
      value: profile?.email ?? user?.email ?? "—",
      icon: FileText,
    },
    {
      label: "Phone",
      value: profile?.phone ?? user?.phone ?? "—",
      icon: Calendar,
    },
    { label: "Role", value: "Staff", icon: Briefcase },
    {
      label: "Status",
      value: String(profile?.status ?? "Active"),
      icon: CheckCircle2,
    },
    { label: "Address", value: profile?.address ?? "—", icon: Images },
  ];

  const initials = displayName
    .split(" ")
    .map((w: string) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Avatar card */}
      <div
        className="flex flex-col items-center py-8 mb-6 rounded-2xl"
        style={{
          background: "oklch(0.12 0.014 275 / 0.6)",
          border: "1px solid oklch(0.22 0.018 275 / 0.4)",
          backdropFilter: "blur(12px)",
        }}
      >
        <div
          className="w-20 h-20 rounded-full flex items-center justify-center text-2xl font-bold font-display mb-3"
          style={{
            background:
              "linear-gradient(135deg, oklch(0.7 0.22 70 / 0.25), oklch(0.7 0.22 70 / 0.08))",
            border: "2px solid oklch(0.7 0.22 70 / 0.5)",
            color: "oklch(0.82 0.2 70)",
          }}
        >
          {initials || <User className="w-8 h-8" />}
        </div>
        <h2 className="text-xl font-display font-bold text-foreground">
          {displayName}
        </h2>
        <p className="text-xs text-muted-foreground mt-1">
          RAP Studio · Staff Member
        </p>
        <Badge
          className="mt-2 text-[10px] border"
          style={{
            background: "oklch(0.7 0.22 70 / 0.15)",
            color: "oklch(0.82 0.2 70)",
            borderColor: "oklch(0.7 0.22 70 / 0.35)",
          }}
        >
          Staff
        </Badge>
      </div>

      {/* Info grid */}
      <div
        className="rounded-2xl overflow-hidden mb-4"
        style={{
          background: "oklch(0.12 0.014 275 / 0.5)",
          border: "1px solid oklch(0.22 0.018 275 / 0.4)",
          backdropFilter: "blur(10px)",
        }}
      >
        {fields.map((f, i) => {
          const Icon = f.icon;
          return (
            <div
              key={f.label}
              className={`flex items-center gap-4 px-5 py-3.5 ${i < fields.length - 1 ? "border-b border-border/20" : ""}`}
            >
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                style={{ background: "oklch(0.72 0.14 82 / 0.12)" }}
              >
                <Icon className="w-4 h-4 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider">
                  {f.label}
                </p>
                {editing && f.label === "Full Name" ? (
                  <Input
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    className="mt-0.5 h-7 text-sm"
                    data-ocid="profile.name_input"
                  />
                ) : (
                  <p className="text-sm text-foreground font-medium truncate">
                    {f.value}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <Button
        type="button"
        variant={editing ? "default" : "outline"}
        className={`w-full gap-2 ${editing ? "btn-primary-luxury" : ""}`}
        onClick={() => setEditing((v) => !v)}
        data-ocid="profile.edit_button"
      >
        {editing ? (
          <>
            <CheckCircle2 className="w-4 h-4" />
            Save Changes
          </>
        ) : (
          <>
            <Pencil className="w-4 h-4" />
            Edit Profile
          </>
        )}
      </Button>
    </motion.div>
  );
}

// ── StaffDashboard ─────────────────────────────────────────────────────────────

function StaffThemeToggle() {
  const { theme, setTheme } = useTheme();
  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      className="gap-1.5 text-xs border-border/40 text-white/80 border-white/20 hover:text-foreground hover:border-border"
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      aria-label="Toggle theme"
      data-ocid="staff-dashboard.theme_toggle"
    >
      {theme === "dark" ? (
        <Sun className="w-3.5 h-3.5" />
      ) : (
        <Moon className="w-3.5 h-3.5" />
      )}
      {theme === "dark" ? "Light" : "Dark"}
    </Button>
  );
}

export function StaffDashboard() {
  const { isAuthenticated, user, logout } = useAuth();
  const { data: profile } = useUserProfile();
  const navigate = useNavigate();

  const {
    data: assignments = [],
    isLoading: assignmentsLoading,
    dataUpdatedAt,
  } = useMyAssignedWork();
  const [activeTab, setActiveTab] = useState("work");

  const name = profile?.name ?? user?.name ?? "Staff Member";
  const initials = name
    .split(" ")
    .map((w: string) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const assignedCount = assignments.filter(
    (a) => String(a.status ?? "") === "Assigned",
  ).length;
  const inProgressCount = assignments.filter(
    (a) => String(a.status ?? "") === "InProgress",
  ).length;
  const completedCount = assignments.filter((a) =>
    ["Delivered", "Approved"].includes(String(a.status ?? "")),
  ).length;

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
              <StaffThemeToggle />
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
                value="work"
                className="gap-1.5"
                data-ocid="staff-dashboard.tab.work"
              >
                <Briefcase className="w-4 h-4" />
                My Work
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
                value="upload"
                className="gap-1.5"
                data-ocid="staff-dashboard.tab.upload"
              >
                <Upload className="w-4 h-4" />
                Upload Deliverables
              </TabsTrigger>
              <TabsTrigger
                value="profile"
                className="gap-1.5"
                data-ocid="staff-dashboard.tab.profile"
              >
                <User className="w-4 h-4" />
                Profile
              </TabsTrigger>
            </TabsList>

            {activeTab === "work" && (
              <LiveIndicator
                updatedAt={dataUpdatedAt}
                pollMs={POLL_MS}
                label="assignments"
              />
            )}
          </div>

          {/* ── My Work Tab ── */}
          <TabsContent value="work">
            <AnimatePresence mode="wait">
              <motion.div
                key="work"
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
                    data-ocid="work.empty_state"
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
                      No work assigned yet
                    </h3>
                    <p className="text-sm text-muted-foreground max-w-xs mx-auto">
                      Your assigned sessions will appear here once the admin
                      assigns work to you.
                    </p>
                  </motion.div>
                ) : (
                  <div className="space-y-3">
                    {assignments.map((assignment, i) => (
                      <WorkItemCard
                        key={String(assignment.id)}
                        assignment={assignment}
                        index={i}
                        showUpload={false}
                      />
                    ))}
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </TabsContent>

          {/* ── Upload Deliverables Tab ── */}
          <TabsContent value="upload">
            <AnimatePresence mode="wait">
              <motion.div
                key="upload"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.28 }}
              >
                <p className="text-xs text-muted-foreground mb-4 uppercase tracking-wider">
                  Select an assignment to upload files for
                </p>
                {assignmentsLoading ? (
                  <div className="space-y-3">
                    {[1, 2].map((i) => (
                      <Skeleton key={i} className="h-20 rounded-xl" />
                    ))}
                  </div>
                ) : assignments.filter(
                    (a) => String(a.status ?? "") !== "Approved",
                  ).length === 0 ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.97 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center py-20"
                    data-ocid="upload.empty_state"
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
                      No pending uploads
                    </h3>
                    <p className="text-sm text-muted-foreground max-w-xs mx-auto">
                      All assigned work has been delivered, or no assignments
                      are pending.
                    </p>
                  </motion.div>
                ) : (
                  <div className="space-y-3">
                    {assignments
                      .filter((a) => String(a.status ?? "") !== "Approved")
                      .map((assignment, i) => (
                        <WorkItemCard
                          key={String(assignment.id)}
                          assignment={assignment}
                          index={i}
                          showUpload={true}
                        />
                      ))}
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </TabsContent>

          {/* ── Profile Tab ── */}
          <TabsContent value="profile">
            <ProfileTab
              name={name}
              user={
                user
                  ? {
                      email: (user as { email?: string }).email,
                      phone: (user as { phone?: string }).phone,
                      name: (user as { name?: string }).name,
                    }
                  : null
              }
              profile={profile}
            />
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}
