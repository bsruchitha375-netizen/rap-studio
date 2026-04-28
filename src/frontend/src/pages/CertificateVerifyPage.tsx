import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useParams } from "@tanstack/react-router";
import { AlertTriangle, Award, CheckCircle2, Search } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
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
  const params = useParams({ from: "/verify/$code" });
  const urlCode = params.code ?? "";

  const [inputCode, setInputCode] = useState(urlCode);
  const [searchCode, setSearchCode] = useState(urlCode);

  const {
    data: certificate,
    isLoading,
    isError,
  } = useGetCertificate(searchCode);

  const verifyUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/verify/${searchCode}`
      : `/verify/${searchCode}`;

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
    !isLoading &&
    !isError &&
    searchCode &&
    (!certificate || !certificate.isValid);

  const handleVerify = () => {
    const trimmed = inputCode.trim();
    if (!trimmed) return;
    setSearchCode(trimmed);
    if (typeof window !== "undefined") {
      window.history.replaceState(
        {},
        "",
        `/verify/${encodeURIComponent(trimmed)}`,
      );
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") handleVerify();
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-16 max-w-3xl">
        {/* Page header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-10"
        >
          <div
            className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 border"
            style={{
              background: "oklch(var(--primary) / 0.1)",
              borderColor: "oklch(var(--primary) / 0.2)",
            }}
          >
            <Award className="w-8 h-8 text-primary" />
          </div>
          <h1 className="font-display text-3xl font-bold text-foreground mb-2">
            Certificate Verification
          </h1>
          <p className="text-muted-foreground max-w-sm mx-auto text-sm">
            Enter a certificate code to verify its authenticity from RAP
            Integrated Studio Management.
          </p>
        </motion.div>

        {/* Search input */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="flex gap-3 mb-10 max-w-xl mx-auto"
        >
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
            <Input
              placeholder="Enter certificate code (e.g. CERT-XXXXXXXX)"
              value={inputCode}
              onChange={(e) => setInputCode(e.target.value)}
              onKeyDown={handleKeyDown}
              className="pl-10 bg-card/60 border-border/50 focus:border-primary/60 text-foreground placeholder:text-muted-foreground h-12 font-mono text-sm"
              data-ocid="cert-verify.search_input"
            />
          </div>
          <Button
            onClick={handleVerify}
            disabled={!inputCode.trim() || isLoading}
            className="h-12 px-6 font-semibold"
            style={{
              background:
                "linear-gradient(135deg, oklch(0.72 0.14 82), oklch(0.78 0.18 82))",
              color: "oklch(0.08 0.01 280)",
            }}
            data-ocid="cert-verify.submit_button"
          >
            Verify
          </Button>
        </motion.div>

        {/* No search yet */}
        {!searchCode && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-16 space-y-3"
            data-ocid="cert-verify.empty_state"
          >
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center mx-auto"
              style={{ background: "oklch(var(--muted) / 0.2)" }}
            >
              <Award className="w-8 h-8 text-muted-foreground opacity-50" />
            </div>
            <p className="text-muted-foreground text-sm">
              Enter a certificate code above to verify it.
            </p>
            <p className="text-xs text-muted-foreground/60">
              Certificates contain a unique QR code that links to this
              verification page.
            </p>
          </motion.div>
        )}

        {/* Loading */}
        {searchCode && isLoading && (
          <div className="space-y-6" data-ocid="cert-verify.loading_state">
            <Skeleton className="h-10 w-48 mx-auto" />
            <Skeleton className="h-64 rounded-2xl" />
          </div>
        )}

        {/* Not found / invalid */}
        {searchCode && !isLoading && (isError || isNotFound) && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-16 space-y-6"
            data-ocid="cert-verify.error_state"
          >
            <div
              className="w-20 h-20 rounded-full flex items-center justify-center mx-auto border"
              style={{
                background: "oklch(var(--destructive) / 0.1)",
                borderColor: "oklch(var(--destructive) / 0.3)",
              }}
            >
              <AlertTriangle className="w-10 h-10 text-destructive" />
            </div>
            <div className="space-y-2">
              <h2 className="font-display text-2xl font-bold text-foreground">
                Certificate Not Found
              </h2>
              <p className="text-muted-foreground max-w-sm mx-auto text-sm">
                The certificate code{" "}
                <code className="font-mono text-sm bg-muted px-2 py-0.5 rounded text-foreground">
                  {searchCode}
                </code>{" "}
                is invalid, expired, or has been revoked.
              </p>
            </div>
            <Button
              type="button"
              variant="outline"
              className="border-border/40"
              onClick={() => {
                setInputCode("");
                setSearchCode("");
              }}
              data-ocid="cert-verify.close_button"
            >
              Try Another Code
            </Button>
          </motion.div>
        )}

        {/* Valid certificate */}
        {searchCode &&
          !isLoading &&
          !isError &&
          certificate &&
          certificate.isValid && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              data-ocid="cert-verify.success_state"
            >
              {/* Verified banner */}
              <div className="text-center mb-8 space-y-3">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.3, type: "spring", stiffness: 300 }}
                  className="w-16 h-16 rounded-full flex items-center justify-center mx-auto border-2"
                  style={{
                    background: "oklch(0.65 0.18 150 / 0.1)",
                    borderColor: "oklch(0.65 0.18 150 / 0.4)",
                  }}
                >
                  <CheckCircle2
                    className="w-8 h-8"
                    style={{ color: "oklch(0.65 0.18 150)" }}
                  />
                </motion.div>
                <h2
                  className="font-display text-3xl font-bold"
                  style={{ color: "oklch(0.65 0.18 150)" }}
                >
                  Certificate Verified ✓
                </h2>
                <p className="text-muted-foreground text-sm">
                  This certificate is authentic and was issued by RAP Integrated
                  Studio Management
                </p>
              </div>

              {/* Certificate Card */}
              <div
                className="relative rounded-3xl overflow-hidden"
                style={{
                  border: "2px solid oklch(0.72 0.14 82 / 0.3)",
                  background: "oklch(var(--card) / 0.6)",
                  backdropFilter: "blur(16px)",
                  boxShadow:
                    "0 0 0 1px oklch(0.72 0.14 82 / 0.08), 0 0 48px oklch(0.72 0.14 82 / 0.12), 0 16px 48px rgba(0,0,0,0.2)",
                }}
              >
                {/* Gold top stripe */}
                <div
                  className="h-2 w-full"
                  style={{
                    background:
                      "linear-gradient(90deg, oklch(0.6 0.14 82 / 0.4), oklch(0.78 0.18 82), oklch(0.85 0.2 85), oklch(0.78 0.18 82), oklch(0.6 0.14 82 / 0.4))",
                  }}
                />

                <div className="p-8 md:p-12 space-y-8">
                  <div className="text-center space-y-1">
                    <div className="flex items-center justify-center gap-2 mb-4">
                      <Award className="w-8 h-8 text-primary" />
                      <span
                        className="font-display text-2xl font-bold text-primary"
                        style={{
                          textShadow: "0 0 20px oklch(var(--primary) / 0.3)",
                        }}
                      >
                        RAP Integrated Studio
                      </span>
                      <Award className="w-8 h-8 text-primary" />
                    </div>
                    <Badge
                      className="px-4 py-1 text-sm font-semibold border-0"
                      style={{
                        background:
                          "linear-gradient(135deg, oklch(0.72 0.14 82), oklch(0.78 0.18 82))",
                        color: "oklch(0.08 0.01 280)",
                      }}
                    >
                      Certificate of Completion
                    </Badge>
                  </div>

                  <div className="text-center space-y-3">
                    <p className="text-muted-foreground text-sm tracking-widest uppercase font-medium">
                      This certifies that
                    </p>
                    <h3 className="font-display text-4xl md:text-5xl font-bold text-foreground tracking-tight">
                      {certificate.studentName ?? ""}
                    </h3>
                    <p className="text-muted-foreground text-sm tracking-widest uppercase font-medium">
                      has successfully completed the course
                    </p>
                    <h4 className="font-display text-2xl md:text-3xl font-bold text-primary">
                      {certificate.courseName ?? ""}
                    </h4>
                  </div>

                  <div className="flex flex-col md:flex-row items-center justify-between gap-6 pt-4 border-t border-border/20">
                    <div className="space-y-4 text-center md:text-left">
                      {issuedDate && (
                        <div>
                          <p className="text-xs text-muted-foreground uppercase tracking-widest font-medium mb-1">
                            Date of Issue
                          </p>
                          <p className="font-display text-lg font-semibold text-foreground">
                            {issuedDate}
                          </p>
                        </div>
                      )}
                      <div>
                        <p className="text-xs text-muted-foreground uppercase tracking-widest font-medium mb-1">
                          Certificate ID
                        </p>
                        <code
                          className="font-mono text-sm px-3 py-1 rounded-lg break-all"
                          style={{
                            color: "oklch(var(--primary))",
                            background: "oklch(var(--primary) / 0.1)",
                          }}
                        >
                          {certificate.code ?? searchCode}
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
                    <p className="text-xs text-muted-foreground/60 mt-1 font-mono break-all">
                      {verifyUrl}
                    </p>
                  </div>
                </div>

                {/* Gold bottom stripe */}
                <div
                  className="h-2 w-full"
                  style={{
                    background:
                      "linear-gradient(90deg, oklch(0.6 0.14 82 / 0.4), oklch(0.78 0.18 82), oklch(0.6 0.14 82 / 0.4))",
                  }}
                />
              </div>

              <div className="flex justify-center gap-3 mt-6">
                <Button
                  type="button"
                  variant="outline"
                  className="border-border/40"
                  onClick={() => {
                    setInputCode("");
                    setSearchCode("");
                  }}
                  data-ocid="cert-verify.close_button"
                >
                  Check Another
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="border-primary/30 text-primary hover:bg-primary/10"
                  onClick={() => window.print()}
                  data-ocid="cert-verify.primary_button"
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
