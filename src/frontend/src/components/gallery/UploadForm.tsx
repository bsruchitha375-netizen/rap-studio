import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Upload, X } from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";

const SERVICE_CATEGORIES = [
  "Photography",
  "Videography",
  "Weddings",
  "Events",
  "Corporate",
  "Portraits",
  "Fashion",
  "Products",
  "Real Estate",
  "Travel",
  "Fitness",
  "Automobiles",
];

interface UploadFormProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function UploadForm({ open, onClose, onSuccess }: UploadFormProps) {
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [fileType, setFileType] = useState<"image" | "video">("image");
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0] ?? null;
    setFile(selected);
    if (selected) {
      setFileType(selected.type.startsWith("video/") ? "video" : "image");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !category || !file) {
      toast.error("Please fill all fields and select a file.");
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    // Simulate progress (real upload uses object-storage extension)
    const interval = setInterval(() => {
      setUploadProgress((p) => {
        if (p >= 90) {
          clearInterval(interval);
          return 90;
        }
        return p + 15;
      });
    }, 200);

    try {
      // Simulated upload — in production this would call uploadMedia()
      await new Promise((res) => setTimeout(res, 1500));
      clearInterval(interval);
      setUploadProgress(100);

      toast.success("Media uploaded successfully!");
      onSuccess?.();
      handleClose();
    } catch {
      clearInterval(interval);
      toast.error("Upload failed. Please try again.");
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const handleClose = () => {
    setTitle("");
    setCategory("");
    setFile(null);
    setUploadProgress(0);
    setIsUploading(false);
    if (fileRef.current) fileRef.current.value = "";
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && handleClose()}>
      <DialogContent
        className="bg-card border-border/30 max-w-md"
        data-ocid="upload-form-modal"
      >
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="font-display text-xl text-foreground">
              Upload Media
            </DialogTitle>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5 mt-2">
          {/* Title */}
          <div className="space-y-1.5">
            <Label htmlFor="upload-title" className="text-foreground/80">
              Title
            </Label>
            <Input
              id="upload-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Golden Hour Wedding"
              className="bg-background/40 border-border/40"
              required
              data-ocid="upload-title-input"
            />
          </div>

          {/* Category */}
          <div className="space-y-1.5">
            <Label className="text-foreground/80">Service Category</Label>
            <Select value={category} onValueChange={setCategory} required>
              <SelectTrigger
                className="bg-background/40 border-border/40"
                data-ocid="upload-category-select"
              >
                <SelectValue placeholder="Select category…" />
              </SelectTrigger>
              <SelectContent className="bg-card border-border/30">
                {SERVICE_CATEGORIES.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* File Type */}
          <div className="space-y-1.5">
            <Label className="text-foreground/80">File Type</Label>
            <div className="flex gap-3">
              {(["image", "video"] as const).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setFileType(t)}
                  className={`flex-1 py-2 rounded-lg border text-sm font-medium capitalize transition-smooth ${
                    fileType === t
                      ? "gradient-gold text-background border-primary"
                      : "bg-background/30 border-border/30 text-muted-foreground hover:border-primary/40"
                  }`}
                  data-ocid={`upload-type-${t}`}
                >
                  {t === "image" ? "📸 Photo" : "🎥 Video"}
                </button>
              ))}
            </div>
          </div>

          {/* File Input */}
          <div className="space-y-1.5">
            <Label htmlFor="upload-file" className="text-foreground/80">
              File
            </Label>
            <button
              type="button"
              className="relative border-2 border-dashed border-border/30 rounded-xl p-6 text-center cursor-pointer hover:border-primary/40 transition-smooth w-full"
              onClick={() => fileRef.current?.click()}
            >
              <input
                ref={fileRef}
                id="upload-file"
                type="file"
                className="sr-only"
                accept={fileType === "image" ? "image/*" : "video/*"}
                onChange={handleFileChange}
                required
                data-ocid="upload-file-input"
              />
              {file ? (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-foreground truncate max-w-[200px]">
                    {file.name}
                  </span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 text-muted-foreground hover:text-destructive"
                    onClick={(e) => {
                      e.stopPropagation();
                      setFile(null);
                      if (fileRef.current) fileRef.current.value = "";
                    }}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ) : (
                <div className="space-y-2">
                  <Upload className="w-8 h-8 text-muted-foreground mx-auto" />
                  <p className="text-sm text-muted-foreground">
                    Click to select {fileType === "image" ? "image" : "video"}
                  </p>
                  <p className="text-xs text-muted-foreground/60">
                    {fileType === "image"
                      ? "JPG, PNG, WebP — max 10MB"
                      : "MP4, MOV, WebM — max 100MB"}
                  </p>
                </div>
              )}
            </button>
          </div>

          {/* Progress bar */}
          {isUploading && (
            <div className="space-y-1">
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Uploading…</span>
                <span>{uploadProgress}%</span>
              </div>
              <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full gradient-gold transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-1">
            <Button
              type="button"
              variant="outline"
              className="flex-1 border-border/40"
              onClick={handleClose}
              disabled={isUploading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1 gradient-gold text-background hover:opacity-90 border-0"
              disabled={isUploading || !title || !category || !file}
              data-ocid="upload-submit-btn"
            >
              {isUploading ? "Uploading…" : "Upload"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
