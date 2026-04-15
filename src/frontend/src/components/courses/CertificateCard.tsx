import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Award, Download, ExternalLink, QrCode, Star } from "lucide-react";
import { motion } from "motion/react";
import type { Certificate } from "../../types";

interface CertificateCardProps {
  certificate: Certificate;
}

function formatDate(ts: bigint): string {
  return new Date(Number(ts) / 1_000_000).toLocaleDateString("en-IN", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export function CertificateCard({ certificate }: CertificateCardProps) {
  const verifyUrl = `${window.location.origin}/verify/${certificate.code}`;

  const handleDownload = () => {
    window.print();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="relative rounded-2xl overflow-hidden border-2 border-primary/40 bg-card shadow-2xl shadow-primary/10"
      data-ocid="certificate-card"
    >
      {/* Gold top accent */}
      <div className="h-1.5 w-full bg-gradient-to-r from-primary/60 via-primary to-primary/60" />

      {/* Header */}
      <div className="bg-gradient-to-br from-primary/10 via-card to-card px-8 pt-6 pb-4 text-center">
        <div className="flex items-center justify-center gap-2 mb-3">
          <Star className="w-4 h-4 text-primary fill-primary" />
          <span className="text-xs font-semibold tracking-[0.2em] uppercase text-primary">
            Certificate of Completion
          </span>
          <Star className="w-4 h-4 text-primary fill-primary" />
        </div>

        <div className="w-16 h-16 rounded-full bg-primary/20 border-2 border-primary/40 flex items-center justify-center mx-auto mb-3">
          <Award className="w-8 h-8 text-primary" />
        </div>

        <p className="text-muted-foreground text-sm">This certifies that</p>
        <h2 className="text-2xl font-display font-bold text-foreground mt-1">
          {certificate.studentName}
        </h2>
        <p className="text-muted-foreground text-sm mt-1">
          has successfully completed
        </p>
        <h3 className="text-xl font-display text-primary font-semibold mt-1">
          {certificate.courseName}
        </h3>
      </div>

      <Separator className="bg-border/40" />

      {/* Details */}
      <div className="px-8 py-4 grid grid-cols-2 gap-4">
        <div>
          <p className="text-xs text-muted-foreground uppercase tracking-wide">
            Issued by
          </p>
          <p className="text-sm font-semibold text-foreground mt-0.5">
            RAP Integrated Studio
          </p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground uppercase tracking-wide">
            Issued on
          </p>
          <p className="text-sm font-semibold text-foreground mt-0.5">
            {formatDate(certificate.issuedAt)}
          </p>
        </div>
        <div className="col-span-2">
          <p className="text-xs text-muted-foreground uppercase tracking-wide">
            Certificate Code
          </p>
          <p className="text-sm font-mono font-semibold text-primary mt-0.5 tracking-widest">
            {certificate.code}
          </p>
        </div>
      </div>

      <Separator className="bg-border/40" />

      {/* QR / Verification */}
      <div className="px-8 py-4 flex items-center gap-4">
        {/* QR placeholder */}
        <div
          className="flex-shrink-0 w-20 h-20 rounded-xl border border-border/40 bg-muted/30
          flex flex-col items-center justify-center text-muted-foreground"
        >
          <QrCode className="w-8 h-8 mb-1" />
          <span className="text-[9px] text-center leading-tight">
            Scan to verify
          </span>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs text-muted-foreground mb-1">Verify at:</p>
          <a
            href={verifyUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-primary hover:underline break-all flex items-start gap-1"
            data-ocid="cert-verify-link"
          >
            <ExternalLink className="w-3 h-3 flex-shrink-0 mt-0.5" />
            {verifyUrl}
          </a>
          <Badge
            className={`mt-2 text-xs border ${
              certificate.isValid
                ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
                : "bg-destructive/20 text-destructive border-destructive/30"
            }`}
          >
            {certificate.isValid ? "✓ Valid Certificate" : "✗ Invalidated"}
          </Badge>
        </div>
      </div>

      {/* Actions */}
      <div className="px-8 pb-6 flex gap-3">
        <Button
          variant="outline"
          className="flex-1 border-primary/30 text-primary hover:bg-primary/10"
          onClick={handleDownload}
          data-ocid="cert-download-btn"
        >
          <Download className="w-4 h-4 mr-2" />
          Download
        </Button>
        <Button
          className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90"
          onClick={() => window.open(`/verify/${certificate.code}`, "_blank")}
          data-ocid="cert-verify-btn"
        >
          <ExternalLink className="w-4 h-4 mr-2" />
          Verify Online
        </Button>
      </div>
    </motion.div>
  );
}
