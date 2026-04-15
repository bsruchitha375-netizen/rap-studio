import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Briefcase, Camera, Images, Loader2, Upload } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import { Layout } from "../components/layout/Layout";
import { useAuth, useUserProfile } from "../hooks/useAuth";
import { useMyBookings } from "../hooks/useBackend";
import type { BookingRequest } from "../types";

const MEDIA_CATEGORIES = [
  "couple_shoot",
  "single_shoot",
  "family_shoot",
  "wedding_shoot",
  "event_shoot",
  "corporate_shoot",
  "fashion_shoot",
  "product_shoot",
  "real_estate",
  "videography",
  "creative_shoot",
  "fitness_shoot",
];

const SAMPLE_GALLERY = [
  {
    id: "m1",
    title: "Pre-Wedding Shoot",
    category: "couple_shoot",
    type: "image" as const,
  },
  {
    id: "m2",
    title: "Corporate Headshots",
    category: "corporate_shoot",
    type: "image" as const,
  },
  {
    id: "m3",
    title: "Fashion Editorial",
    category: "fashion_shoot",
    type: "image" as const,
  },
];

const SAMPLE_WORK: BookingRequest[] = [
  {
    id: "BK005",
    clientId: "u5",
    clientName: "Client",
    serviceCategoryId: "fashion_shoot",
    subServiceId: "editorial_shoot",
    date: "2026-04-26",
    timeSlot: "afternoon",
    duration: "4 hours",
    location: { type: "studio" },
    status: "confirmed",
    initialPaymentAmount: 2,
    finalPaymentAmount: 3,
    createdAt: BigInt(Date.now() - 86400000) * BigInt(1_000_000),
    updatedAt: BigInt(Date.now() - 86400000) * BigInt(1_000_000),
  },
];

export function StaffDashboard() {
  const { isAuthenticated } = useAuth();
  const { data: profile } = useUserProfile();
  const { data: bookings = [] } = useMyBookings();
  const [activeTab, setActiveTab] = useState("mywork");
  const [uploadTitle, setUploadTitle] = useState("");
  const [uploadCategory, setUploadCategory] = useState("");
  const [uploadType, setUploadType] = useState<"photo" | "video">("photo");
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);

  const name = profile?.name ?? "there";
  const myWork = bookings.filter((b) =>
    ["confirmed", "in_progress"].includes(b.status),
  );
  const displayWork = myWork.length > 0 ? myWork : SAMPLE_WORK;

  const handleUpload = async () => {
    if (!uploadFile || !uploadTitle || !uploadCategory) {
      toast.error("Please fill in all fields and select a file.");
      return;
    }
    setIsUploading(true);
    setUploadProgress(0);

    const interval = setInterval(() => {
      setUploadProgress((p) => {
        if (p >= 90) {
          clearInterval(interval);
          return p;
        }
        return p + 10;
      });
    }, 200);

    await new Promise((resolve) => setTimeout(resolve, 2200));
    clearInterval(interval);
    setUploadProgress(100);
    setIsUploading(false);
    toast.success("Media uploaded successfully!");
    setUploadTitle("");
    setUploadCategory("");
    setUploadFile(null);
    setUploadProgress(0);
  };

  if (!isAuthenticated) {
    return (
      <Layout>
        <div className="container mx-auto py-20 text-center text-muted-foreground">
          Access denied. Please log in.
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-10 max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <p className="section-label mb-1">Staff Portal</p>
          <h1 className="text-3xl font-display font-bold text-foreground">
            Welcome, {name} 📸
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage your assigned sessions and upload deliverables.
          </p>
        </motion.div>

        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          data-ocid="staff-dashboard-tabs"
        >
          <TabsList className="bg-card border border-border/50 mb-6">
            <TabsTrigger
              value="mywork"
              className="gap-2"
              data-ocid="tab-mywork"
            >
              <Briefcase className="w-4 h-4" />
              My Work
            </TabsTrigger>
            <TabsTrigger
              value="upload"
              className="gap-2"
              data-ocid="tab-upload"
            >
              <Upload className="w-4 h-4" />
              Upload Media
            </TabsTrigger>
            <TabsTrigger
              value="gallery"
              className="gap-2"
              data-ocid="tab-gallery"
            >
              <Images className="w-4 h-4" />
              Gallery
            </TabsTrigger>
          </TabsList>

          <TabsContent value="mywork">
            <AnimatePresence mode="wait">
              <motion.div
                key="work"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
              >
                <div className="space-y-4">
                  {displayWork.map((booking, i) => (
                    <motion.div
                      key={booking.id}
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.07 }}
                      className="rounded-xl border border-border/50 bg-card p-5 hover:border-primary/30 transition-smooth"
                      data-ocid="staff-work-card"
                    >
                      <div className="flex items-start justify-between gap-3 mb-2">
                        <div className="flex items-center gap-2">
                          <Camera className="w-4 h-4 text-primary" />
                          <span className="font-semibold text-foreground capitalize text-sm">
                            {booking.serviceCategoryId.replace(/_/g, " ")}
                          </span>
                        </div>
                        <Badge className="text-xs border bg-blue-500/20 text-blue-300 border-blue-500/30">
                          {booking.status.replace(/_/g, " ")}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground capitalize ml-6 mb-3">
                        {booking.subServiceId.replace(/_/g, " ")}
                      </p>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span>📅 {booking.date}</span>
                        <span>⏱ {booking.timeSlot}</span>
                        <span>📍 {booking.location.type}</span>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            </AnimatePresence>
          </TabsContent>

          <TabsContent value="upload">
            <AnimatePresence mode="wait">
              <motion.div
                key="upload"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
              >
                <div className="rounded-xl border border-border/50 bg-card p-6 max-w-lg">
                  <h2 className="font-semibold text-foreground mb-5">
                    Upload Deliverable
                  </h2>
                  <div className="space-y-4">
                    <div>
                      <Label className="text-xs text-muted-foreground mb-1 block">
                        Title *
                      </Label>
                      <Input
                        value={uploadTitle}
                        onChange={(e) => setUploadTitle(e.target.value)}
                        placeholder="e.g. Pre-Wedding Session — April 2026"
                        className="bg-muted/20 border-border/50"
                        data-ocid="upload-title-input"
                      />
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground mb-1 block">
                        Service Category *
                      </Label>
                      <Select
                        value={uploadCategory}
                        onValueChange={setUploadCategory}
                      >
                        <SelectTrigger
                          className="bg-muted/20 border-border/50"
                          data-ocid="upload-category-select"
                        >
                          <SelectValue placeholder="Select category..." />
                        </SelectTrigger>
                        <SelectContent>
                          {MEDIA_CATEGORIES.map((cat) => (
                            <SelectItem key={cat} value={cat}>
                              {cat.replace(/_/g, " ")}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground mb-1 block">
                        File Type *
                      </Label>
                      <div className="flex gap-3">
                        {(["photo", "video"] as const).map((t) => (
                          <button
                            key={t}
                            type="button"
                            onClick={() => setUploadType(t)}
                            className={`flex-1 py-2 rounded-lg text-sm border transition-smooth capitalize ${
                              uploadType === t
                                ? "bg-primary text-primary-foreground border-primary"
                                : "border-border/50 text-muted-foreground hover:border-primary/40"
                            }`}
                            data-ocid={`upload-type-${t}`}
                          >
                            {t}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground mb-1 block">
                        File *
                      </Label>
                      <button
                        type="button"
                        className={`w-full border-2 border-dashed rounded-lg p-6 text-center transition-smooth cursor-pointer hover:border-primary/50 ${
                          uploadFile
                            ? "border-primary/50 bg-primary/5"
                            : "border-border/40"
                        }`}
                        onClick={() =>
                          document.getElementById("file-input")?.click()
                        }
                        data-ocid="upload-dropzone"
                      >
                        <input
                          id="file-input"
                          type="file"
                          className="hidden"
                          accept={
                            uploadType === "photo" ? "image/*" : "video/*"
                          }
                          onChange={(e) =>
                            setUploadFile(e.target.files?.[0] ?? null)
                          }
                        />
                        {uploadFile ? (
                          <div>
                            <p className="text-sm text-foreground font-medium">
                              {uploadFile.name}
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">
                              {(uploadFile.size / 1024 / 1024).toFixed(2)} MB
                            </p>
                          </div>
                        ) : (
                          <div>
                            <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground/50" />
                            <p className="text-sm text-muted-foreground">
                              Click to select a {uploadType} file
                            </p>
                          </div>
                        )}
                      </button>
                    </div>

                    {isUploading && (
                      <div>
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-muted-foreground">
                            Uploading...
                          </span>
                          <span className="text-primary">
                            {uploadProgress}%
                          </span>
                        </div>
                        <div className="h-2 rounded-full bg-muted/40 overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${uploadProgress}%` }}
                            className="h-full rounded-full bg-primary"
                          />
                        </div>
                      </div>
                    )}

                    <Button
                      type="button"
                      onClick={handleUpload}
                      disabled={isUploading}
                      className="w-full btn-primary-luxury"
                      data-ocid="upload-submit-btn"
                    >
                      {isUploading ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Uploading...
                        </>
                      ) : (
                        <>
                          <Upload className="w-4 h-4 mr-2" />
                          Upload Media
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </TabsContent>

          <TabsContent value="gallery">
            <AnimatePresence mode="wait">
              <motion.div
                key="gallery"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
              >
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {SAMPLE_GALLERY.map((item, i) => (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: i * 0.07 }}
                      className="group rounded-xl overflow-hidden border border-border/50 bg-card aspect-square relative"
                      data-ocid="gallery-item"
                    >
                      <div className="w-full h-full bg-gradient-to-br from-primary/20 via-muted/30 to-accent/20 flex items-center justify-center">
                        <Camera className="w-10 h-10 text-primary/40" />
                      </div>
                      <div className="absolute inset-0 bg-background/80 opacity-0 group-hover:opacity-100 transition-smooth flex flex-col items-center justify-center gap-2">
                        <p className="text-xs font-semibold text-foreground text-center px-2">
                          {item.title}
                        </p>
                        <Badge className="text-[10px] capitalize">
                          {item.category.replace(/_/g, " ")}
                        </Badge>
                        <Button
                          type="button"
                          size="sm"
                          variant="destructive"
                          className="text-xs h-7 px-3"
                          onClick={() => toast.success("Media deleted.")}
                          data-ocid="gallery-delete-btn"
                        >
                          Delete
                        </Button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            </AnimatePresence>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}
