import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useParams } from "@tanstack/react-router";
import { AlertTriangle, Award, CheckCircle2 } from "lucide-react";
import { motion } from "motion/react";
import { Layout } from "../components/layout/Layout";
import { useGetCertificate } from "../hooks/useBackend";

function QRCode({ data }: { data: string }) {
  const encoded = encodeURIComponent(data);
  const src = `https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${encoded}&bgcolor=ffffff&color=1a1a2e&margin=2`;
  return (
    <img
      src={src}
      alt="QR code for certificate verification"
      width={160}
      height={160}
      className="rounded-lg border border-border/30"
      loading="lazy"
    />
  );
}

export function CertificateVerifyPage() {
  const { code } = useParams({ from: "/verify/$code" });

  const {
    data: certificate,
    isLoading,
    isError,
  } = useGetCertificate(code ?? "");

  const verifyUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/verify/${code}`
      : `/verify/${code}`;

  const issuedDate = certificate?.issuedAt
    ? new Date(
        Number(certificate.issuedAt / BigInt(1_000_000)),
      ).toLocaleDateString("en-IN", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "";

  const isNotFound =
    !isLoading && !isError && (!certificate || !certificate.isValid);

  return (
    <Layout>
      <div className="container mx-auto px-4 py-16 max-w-3xl">
        {isLoading && (
          <div className="space-y-6" data-ocid="cert-loading.loading_state">
            <Skeleton className="h-10 w-48 mx-auto" />
            <Skeleton className="h-64 rounded-2xl" />
          </div>
        )}

        {!isLoading && (isError || isNotFound) && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-20 space-y-6"
            data-ocid="cert-not-found.error_state"
          >
            <div className="w-20 h-20 rounded-full bg-destructive/10 border border-destructive/30 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-10 h-10 text-destructive" />
            </div>
            <div className="space-y-2">
              <h1 className="font-display text-3xl font-bold text-foreground">
                Certificate Not Found
              </h1>
              <p className="text-muted-foreground max-w-sm mx-auto">
                The certificate code{" "}
                <code className="font-mono text-sm bg-muted px-2 py-0.5 rounded">
                  {code}
                </code>{" "}
                is invalid or has been revoked.
              </p>
            </div>
            <Button
              type="button"
              variant="outline"
              className="border-border/40"
              onClick={() => window.history.back()}
            >
              Go Back
            </Button>
          </motion.div>
        )}

        {!isLoading && !isError && certificate && certificate.isValid && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            data-ocid="cert-valid.success_state"
          >
            {/* Verified banner */}
            <div className="text-center mb-8 space-y-3">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.3, type: "spring", stiffness: 300 }}
                className="w-16 h-16 rounded-full bg-green-500/10 border-2 border-green-500/40 flex items-center justify-center mx-auto"
              >
                <CheckCircle2 className="w-8 h-8 text-green-500" />
              </motion.div>
              <h2 className="font-display text-3xl font-bold text-green-500">
                Certificate Verified ✓
              </h2>
              <p className="text-muted-foreground text-sm">
                This certificate is authentic and was issued by RAP Integrated
                Studio Management
              </p>
            </div>

            {/* Certificate Card */}
            <div className="relative rounded-3xl border-2 border-primary/30 bg-card/60 backdrop-blur-sm overflow-hidden shadow-elevated">
              <div className="h-2 gradient-gold" />

              <div className="p-8 md:p-12 space-y-8">
                <div className="text-center space-y-1">
                  <div className="flex items-center justify-center gap-2 mb-4">
                    <Award className="w-8 h-8 text-primary" />
                    <span className="font-display text-2xl font-bold text-primary text-glow-gold">
                      RAP Integrated Studio
                    </span>
                    <Award className="w-8 h-8 text-primary" />
                  </div>
                  <Badge className="gradient-gold text-background border-0 px-4 py-1 text-sm">
                    Certificate of Completion
                  </Badge>
                </div>

                <div className="text-center space-y-3">
                  <p className="text-muted-foreground text-sm tracking-widest uppercase font-medium">
                    This certifies that
                  </p>
                  <h1 className="font-display text-4xl md:text-5xl font-bold text-foreground tracking-tight">
                    {certificate.studentName}
                  </h1>
                  <p className="text-muted-foreground text-sm tracking-widest uppercase font-medium">
                    has successfully completed the course
                  </p>
                  <h2 className="font-display text-2xl md:text-3xl font-bold text-primary">
                    {certificate.courseName}
                  </h2>
                </div>

                <div className="flex flex-col md:flex-row items-center justify-between gap-6 pt-4 border-t border-border/20">
                  <div className="space-y-4 text-center md:text-left">
                    <div>
                      <p className="text-xs text-muted-foreground uppercase tracking-widest font-medium mb-1">
                        Date of Issue
                      </p>
                      <p className="font-display text-lg font-semibold text-foreground">
                        {issuedDate}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground uppercase tracking-widest font-medium mb-1">
                        Certificate ID
                      </p>
                      <code className="font-mono text-sm text-primary bg-primary/10 px-3 py-1 rounded-lg">
                        {certificate.code}
                      </code>
                    </div>
                  </div>

                  <div className="flex flex-col items-center gap-2">
                    <QRCode data={verifyUrl} />
                    <p className="text-xs text-muted-foreground text-center">
                      Scan to verify
                    </p>
                  </div>
                </div>

                <div className="text-center pt-4 border-t border-border/20">
                  <p className="text-xs text-muted-foreground">
                    Issued by{" "}
                    <span className="text-primary font-medium">
                      RAP Integrated Studio Management
                    </span>{" "}
                    · Founders: Ruchitha B S, Ashitha S &amp; Prarthana R
                  </p>
                  <p className="text-xs text-muted-foreground mt-1 font-mono break-all">
                    {verifyUrl}
                  </p>
                </div>
              </div>

              <div className="h-2 gradient-gold" />
            </div>

            <div className="text-center mt-6">
              <Button
                type="button"
                variant="outline"
                className="border-primary/30 text-primary hover:bg-primary/10"
                onClick={() => window.print()}
                data-ocid="cert-print-btn"
              >
                Print Certificate
              </Button>
            </div>
          </motion.div>
        )}
      </div>
    </Layout>
  );
}
