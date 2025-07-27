import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { QrCode } from "lucide-react";

interface QRCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function QRCodeModal({ isOpen, onClose }: QRCodeModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Quick Login</DialogTitle>
        </DialogHeader>
        
        <div className="text-center py-6">
          <div className="bg-gray-100 p-6 rounded-lg mb-4">
            <div className="w-32 h-32 mx-auto bg-white border-2 border-dashed border-gray-300 flex items-center justify-center">
              <QrCode className="h-12 w-12 text-gray-400" />
            </div>
          </div>
          
          <p className="text-sm text-gray-600 mb-4">
            Scan this QR code to login quickly on another device
          </p>
          
          <div className="text-xs text-gray-500 space-y-1">
            <p>• Open KachaMaal app on another device</p>
            <p>• Tap "Scan QR" in login screen</p>
            <p>• Point camera at this code</p>
          </div>
        </div>

        <Button 
          className="w-full bg-primary hover:bg-primary/90" 
          onClick={onClose}
        >
          Close
        </Button>
      </DialogContent>
    </Dialog>
  );
}
