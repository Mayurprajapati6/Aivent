import { useState, useEffect, useRef } from "react";
import { QrCode, Loader2 } from "lucide-react";
import { eventAPI } from "../../services/api";
import { toast } from "sonner";

// Add html5-qrcode to package.json
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";

interface QRScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function QRScannerModal({ isOpen, onClose }: QRScannerModalProps) {
  const [scannerReady, setScannerReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scannerRef = useRef<any>(null);
  const mountedRef = useRef(true);

  const handleCheckIn = async (qrCode: string) => {
    try {
      const response = await eventAPI.checkInAttendee(qrCode);
      if (response.data.success) {
        toast.success("✅ Check-in successful!");
        onClose();
      } else {
        toast.error(response.data.message || "Check-in failed");
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Invalid QR code");
    }
  };

  useEffect(() => {
    mountedRef.current = true;

    const initScanner = async () => {
      if (!isOpen) return;

      try {
        // Check camera permissions
        try {
          await navigator.mediaDevices.getUserMedia({ video: true });
        } catch (permError) {
          setError("Camera permission denied. Please enable camera access.");
          return;
        }

        // Dynamically import html5-qrcode
        const { Html5QrcodeScanner } = await import("html5-qrcode");
        
        if (!mountedRef.current) return;

        scannerRef.current = new Html5QrcodeScanner(
          "qr-reader",
          {
            fps: 10,
            qrbox: { width: 250, height: 250 },
            aspectRatio: 1.0,
            showTorchButtonIfSupported: true,
            videoConstraints: {
              facingMode: "environment",
            },
          },
          false
        );

        const onScanSuccess = (decodedText: string) => {
          if (scannerRef.current) {
            scannerRef.current.clear().catch(console.error);
          }
          handleCheckIn(decodedText);
        };

        const onScanError = (error: string) => {
          if (error && !error.includes("NotFoundException")) {
            console.debug("Scan error:", error);
          }
        };

        scannerRef.current.render(onScanSuccess, onScanError);
        setScannerReady(true);
        setError(null);
      } catch (error: any) {
        console.error("Failed to initialize scanner:", error);
        setError(`Failed to start camera: ${error.message}`);
        toast.error("Camera failed. Please use manual entry.");
      }
    };

    initScanner();

    return () => {
      mountedRef.current = false;
      if (scannerRef.current) {
        scannerRef.current.clear().catch(console.error);
      }
      setScannerReady(false);
    };
  }, [isOpen]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <QrCode className="w-5 h-5 text-purple-500" />
            Check-In Attendee
          </DialogTitle>
          <DialogDescription>
            Scan QR code or enter ticket ID manually
          </DialogDescription>
        </DialogHeader>
        {error ? (
          <div className="text-red-500 text-sm">{error}</div>
        ) : (
          <>
            <div id="qr-reader" className="w-full" style={{ minHeight: "350px" }}></div>
            {!scannerReady && (
              <div className="flex items-center justify-center py-4">
                <Loader2 className="w-6 h-6 animate-spin text-purple-500" />
                <span className="ml-2 text-sm text-muted-foreground">Starting camera...</span>
              </div>
            )}
            <p className="text-sm text-muted-foreground text-center">
              {scannerReady
                ? "Position the QR code within the frame"
                : "Please allow camera access when prompted"}
            </p>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

