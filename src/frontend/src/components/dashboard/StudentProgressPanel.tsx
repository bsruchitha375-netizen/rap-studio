/**
 * StudentProgressPanel — Admin view of all student course progress.
 * Polls every 5 seconds via useAdminAllProgress.
 * Color-coded: green=certificate earned, gold=>50%, grey=<50%
 */
import { Award, BookOpen, TrendingUp, User } from "lucide-react";
import { useAdminAllProgress, useAdminCourses } from "../../hooks/useBackend";
import type { CourseLessonProgress } from "../../types";

function ProgressBar({ value }: { value: number }) {
  const pct = Math.min(100, Math.max(0, value));
  const color =
    pct >= 100
      ? "bg-emerald-500"
      : pct > 50
        ? "bg-primary"
        : "bg-muted-foreground/40";
  return (
    <div className="w-full h-1.5 rounded-full bg-muted/30 overflow-hidden">
      <div
        className={`h-full rounded-full transition-all duration-500 ${color}`}
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}

function RowBadge({ progress }: { progress: CourseLessonProgress }) {
  if (progress.certificateEarned) {
    return (
      <span className="flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 font-semibold">
        <Award className="w-3 h-3" />
        Certificate
      </span>
    );
  }
  if (progress.overallPercent > 50) {
    return (
      <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary/15 border border-primary/30 text-primary font-semibold">
        {Math.round(progress.overallPercent)}%
      </span>
    );
  }
  return (
    <span className="text-[10px] px-2 py-0.5 rounded-full bg-muted/30 border border-border/30 text-muted-foreground">
      {Math.round(progress.overallPercent)}%
    </span>
  );
}

export function StudentProgressPanel() {
  const { data: allProgress = [], isLoading } = useAdminAllProgress();
  const { data: allCourses = [] } = useAdminCourses();

  const courseNameMap = new Map<number, string>(
    allCourses.map((c) => [Number(c.id), c.title]),
  );

  const certCount = allProgress.filter((p) => p.certificateEarned).length;
  const activeCount = allProgress.filter(
    (p) => !p.certificateEarned && p.overallPercent > 0,
  ).length;

  if (isLoading) {
    return (
      <div
        className="flex items-center justify-center py-12 text-muted-foreground text-sm"
        data-ocid="cms-progress-loading_state"
      >
        <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin mr-2" />
        Loading student progress…
      </div>
    );
  }

  return (
    <div className="space-y-4" data-ocid="cms-student-progress-panel">
      {/* Summary stat row */}
      <div className="grid grid-cols-3 gap-3">
        <div className="rounded-xl border border-border/40 bg-background/40 p-3 text-center">
          <div className="text-xl font-bold text-foreground">
            {allProgress.length}
          </div>
          <div className="text-[10px] text-muted-foreground flex items-center justify-center gap-1 mt-0.5">
            <BookOpen className="w-3 h-3" />
            Enrollments
          </div>
        </div>
        <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3 text-center">
          <div className="text-xl font-bold text-emerald-400">{certCount}</div>
          <div className="text-[10px] text-emerald-400/70 flex items-center justify-center gap-1 mt-0.5">
            <Award className="w-3 h-3" />
            Certificates
          </div>
        </div>
        <div className="rounded-xl border border-primary/20 bg-primary/10 p-3 text-center">
          <div className="text-xl font-bold text-primary">{activeCount}</div>
          <div className="text-[10px] text-primary/70 flex items-center justify-center gap-1 mt-0.5">
            <TrendingUp className="w-3 h-3" />
            In Progress
          </div>
        </div>
      </div>

      {allProgress.length === 0 ? (
        <div
          className="py-10 text-center text-muted-foreground text-sm"
          data-ocid="cms-progress-empty_state"
        >
          <User className="w-10 h-10 mx-auto mb-3 opacity-25" />
          <p>No student progress data yet.</p>
          <p className="text-[11px] mt-1 text-muted-foreground/60">
            Progress appears here once students enroll and start lessons.
          </p>
        </div>
      ) : (
        <div className="rounded-xl border border-border/30 overflow-hidden">
          {/* Table header */}
          <div className="grid grid-cols-[1fr_1.5fr_80px_70px_90px] gap-2 px-4 py-2.5 bg-muted/30 border-b border-border/30 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
            <span>Student</span>
            <span>Course</span>
            <span className="text-center">Lessons</span>
            <span className="text-center">Progress</span>
            <span className="text-center">Status</span>
          </div>

          {/* Table rows */}
          <div className="divide-y divide-border/20 max-h-[480px] overflow-y-auto">
            {allProgress.map((progress, idx) => {
              const courseName =
                courseNameMap.get(progress.courseId) ??
                `Course #${progress.courseId}`;
              const rowClass = progress.certificateEarned
                ? "bg-emerald-500/5 hover:bg-emerald-500/8"
                : progress.overallPercent > 50
                  ? "bg-primary/5 hover:bg-primary/8"
                  : "hover:bg-muted/15";

              return (
                <div
                  key={`${progress.studentId}-${progress.courseId}`}
                  className={`grid grid-cols-[1fr_1.5fr_80px_70px_90px] gap-2 px-4 py-3 items-center transition-colors ${rowClass}`}
                  data-ocid={`cms-progress-row.${idx + 1}`}
                >
                  {/* Student */}
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                      <User className="w-3 h-3 text-primary" />
                    </div>
                    <span className="text-xs text-foreground truncate">
                      {progress.studentId
                        ? `${progress.studentId.slice(0, 8)}…`
                        : "—"}
                    </span>
                  </div>

                  {/* Course */}
                  <span className="text-xs text-foreground truncate">
                    {courseName}
                  </span>

                  {/* Lessons completed */}
                  <div className="text-center">
                    <span className="text-xs font-semibold text-foreground">
                      {progress.completedLessonIds.length}
                    </span>
                  </div>

                  {/* Progress bar */}
                  <div className="space-y-0.5">
                    <ProgressBar value={progress.overallPercent} />
                    <p className="text-[9px] text-center text-muted-foreground">
                      {Math.round(progress.overallPercent)}%
                    </p>
                  </div>

                  {/* Status badge */}
                  <div className="flex justify-center">
                    <RowBadge progress={progress} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <p className="text-[10px] text-muted-foreground/50 text-center">
        Auto-refreshes every 5 seconds · {allProgress.length} total enrollments
        tracked
      </p>
    </div>
  );
}
