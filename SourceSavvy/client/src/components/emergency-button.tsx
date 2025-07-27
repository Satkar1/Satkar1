import { Button } from "@/components/ui/button";
import { Zap } from "lucide-react";

interface EmergencyButtonProps {
  onClick: () => void;
}

export default function EmergencyButton({ onClick }: EmergencyButtonProps) {
  return (
    <Button
      onClick={onClick}
      className="w-full bg-red-500 hover:bg-red-600 text-white font-bold py-4 px-6 rounded-xl shadow-lg pulse-ring transition-all flex items-center justify-center space-x-3 h-auto"
    >
      <Zap className="h-6 w-6" />
      <div className="text-left">
        <div className="text-lg outdoor-text-light">Emergency Order</div>
        <div className="text-xs opacity-90">Get supplies in 30 mins</div>
      </div>
    </Button>
  );
}
