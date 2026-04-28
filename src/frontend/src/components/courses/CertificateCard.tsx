import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Award, Download, ExternalLink, Star } from "lucide-react";
import { motion } from "motion/react";
import { useRef } from "react";
import type { Certificate } from "../../types";

interface CertificateCardProps {
  certificate: Certificate;
}

function formatDate(ts: bigint): string {
  try {
    return new Date(Number(ts) / 1_000_000).toLocaleDateString("en-IN", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  } catch {
    return "Date unavailable";
  }
}

function QRCodeImage({ data }: { data: string }) {
  const encoded = encodeURIComponent(data);
  const src = `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encoded}&bgcolor=ffffff&color=1a1a2e&margin=3`;
  return (
    <img
      src={src}
      alt="QR code — scan to verify certificate"
      width={90}
      height={90}
      className="rounded-xl border-4"
      style={{ borderColor: "oklch(0.72 0.14 82 / 0.4)", background: "#fff" }}
      loading="lazy"
    />
  );
}

export function CertificateCard({ certificate }: CertificateCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const verifyUrl = `${window.location.origin}/verify/${certificate.code ?? ""}`;
  const code = certificate.code ?? "";
  const studentName = certificate.studentName ?? "Student";
  const courseName = certificate.courseName ?? "Course";
  const issuedAt = certificate.issuedAt ?? BigInt(Date.now() * 1_000_000);

  const handleDownload = () => {
    // Print-to-PDF
    window.print();
  };

  return (
    <motion.div
      ref={cardRef}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="relative rounded-2xl overflow-hidden"
      style={{
        background: "oklch(var(--card))",
        border: "2px solid oklch(0.72 0.14 82 / 0.5)",
        boxShadow:
          "0 0 0 1px oklch(0.72 0.14 82 / 0.08), 0 0 48px oklch(0.72 0.14 82 / 0.15), 0 16px 48px rgba(0,0,0,0.3)",
      }}
      data-ocid="certificate-card"
    >
      {/* Gold foil top accent */}
      <div
        className="h-2 w-full"
        style={{
          background:
            "linear-gradient(90deg, oklch(0.6 0.14 82 / 0.4), oklch(0.78 0.18 82), oklch(0.85 0.2 85), oklch(0.78 0.18 82), oklch(0.6 0.14 82 / 0.4))",
        }}
      />

      {/* Subtle corner ornaments */}
      <div
        className="absolute top-4 left-4 w-8 h-8 opacity-20 pointer-events-none"
        style={{
          borderTop: "2px solid oklch(0.78 0.18 82)",
          borderLeft: "2px solid oklch(0.78 0.18 82)",
        }}
      />
      <div
        className="absolute top-4 right-4 w-8 h-8 opacity-20 pointer-events-none"
        style={{
          borderTop: "2px solid oklch(0.78 0.18 82)",
          borderRight: "2px solid oklch(0.78 0.18 82)",
        }}
      />

      {/* Header */}
      <div
        className="px-8 pt-7 pb-5 text-center"
        style={{
          background:
            "linear-gradient(180deg, oklch(0.72 0.14 82 / 0.1) 0%, oklch(var(--card)) 100%)",
        }}
      >
        <div className="flex items-center justify-center gap-2 mb-4">
          <Star
            className="w-3.5 h-3.5 fill-current"
            style={{ color: "oklch(0.78 0.18 82)" }}
          />
          <span
            className="text-xs font-bold tracking-[0.25em] uppercase"
            style={{ color: "oklch(0.78 0.18 82)" }}
          >
            Certificate of Completion
          </span>
          <Star
            className="w-3.5 h-3.5 fill-current"
            style={{ color: "oklch(0.78 0.18 82)" }}
          />
        </div>

        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
          className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-5"
          style={{
            background:
              "linear-gradient(135deg, oklch(0.72 0.14 82 / 0.2), oklch(0.78 0.18 82 / 0.1))",
            border: "3px solid oklch(0.72 0.14 82 / 0.6)",
            boxShadow: "0 0 32px oklch(0.72 0.14 82 / 0.25)",
          }}
        >
          <Award className="w-9 h-9" style={{ color: "oklch(0.78 0.18 82)" }} />
        </motion.div>

        <p className="text-muted-foreground text-sm mb-1">
          This certifies that
        </p>
        <h2 className="text-2xl font-display font-bold text-foreground mb-1">
          {studentName}
        </h2>
        <p className="text-muted-foreground text-sm mb-1">
          has successfully completed
        </p>
        <h3
          className="text-xl font-display font-semibold"
          style={{ color: "oklch(0.78 0.18 82)" }}
        >
          {courseName}
        </h3>
      </div>

      <Separator
        style={{
          background:
            "linear-gradient(90deg, transparent, oklch(0.72 0.14 82 / 0.4), transparent)",
        }}
      />

      {/* Details */}
      <div className="px-8 py-4 grid grid-cols-2 gap-4">
        <div>
          <p className="text-xs text-muted-foreground uppercase tracking-wide mb-0.5">
            Issued by
          </p>
          <p className="text-sm font-semibold text-foreground">
            RAP Integrated Studio
          </p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground uppercase tracking-wide mb-0.5">
            Issued on
          </p>
          <p className="text-sm font-semibold text-foreground">
            {formatDate(issuedAt)}
          </p>
        </div>
        <div className="col-span-2">
          <p className="text-xs text-muted-foreground uppercase tracking-wide mb-0.5">
            Certificate ID
          </p>
          <p
            className="text-sm font-mono font-bold tracking-widest"
            style={{ color: "oklch(0.78 0.18 82)" }}
          >
            {code}
          </p>
        </div>
      </div>

      <Separator
        style={{
          background:
            "linear-gradient(90deg, transparent, oklch(0.72 0.14 82 / 0.3), transparent)",
        }}
      />

      {/* QR + validity */}
      <div className="px-8 py-5 flex items-center gap-5">
        <div className="flex-shrink-0 flex flex-col items-center gap-1.5">
          <QRCodeImage data={verifyUrl} />
          <p className="text-[9px] text-muted-foreground text-center">
            Scan to verify
          </p>
        </div>
        <div className="flex-1 min-w-0 space-y-2.5">
          <div>
            <p className="text-xs text-muted-foreground mb-1">Verify online:</p>
            <a
              href={verifyUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs hover:underline break-all flex items-start gap-1"
              style={{ color: "oklch(0.78 0.18 82)" }}
              data-ocid="cert-verify-link"
            >
              <ExternalLink className="w-3 h-3 flex-shrink-0 mt-0.5" />
              {verifyUrl}
            </a>
          </div>
          <Badge
            className={`text-xs border ${
              certificate.isValid
                ? "bg-emerald-500/15 text-emerald-300 border-emerald-500/30"
                : "bg-destructive/15 text-destructive border-destructive/30"
            }`}
          >
            {certificate.isValid ? "✓ Valid Certificate" : "✗ Invalidated"}
          </Badge>
          <p className="text-[10px] text-muted-foreground">
            Issued by RAP Integrated Studio, India
          </p>
        </div>
      </div>

      <Separator
        style={{
          background:
            "linear-gradient(90deg, transparent, oklch(0.72 0.14 82 / 0.3), transparent)",
        }}
      />

      {/* Actions */}
      <div className="px-8 py-5 flex gap-3">
        <Button
          variant="outline"
          className="flex-1 gap-2"
          style={{
            borderColor: "oklch(0.72 0.14 82 / 0.4)",
            color: "oklch(0.78 0.18 82)",
          }}
          onClick={handleDownload}
          data-ocid="cert-download-btn"
        >
          <Download className="w-4 h-4" />
          Download PDF
        </Button>
        <Button
          className="flex-1 gap-2 font-semibold"
          style={{
            background:
              "linear-gradient(135deg, oklch(0.72 0.14 82), oklch(0.78 0.18 82))",
            color: "oklch(0.08 0.01 280)",
            boxShadow: "0 4px 16px oklch(0.72 0.14 82 / 0.3)",
          }}
          onClick={() => window.open(`/verify/${code}`, "_blank")}
          data-ocid="cert-verify-btn"
        >
          <ExternalLink className="w-4 h-4" />
          Verify Online
        </Button>
      </div>

      {/* Gold foil bottom accent */}
      <div
        className="h-1 w-full"
        style={{
          background:
            "linear-gradient(90deg, oklch(0.6 0.14 82 / 0.4), oklch(0.78 0.18 82), oklch(0.6 0.14 82 / 0.4))",
        }}
      />
    </motion.div>
  );
}
