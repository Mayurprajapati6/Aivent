import { Sparkles } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { Button } from "./ui/button";

interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  trigger?: string;
}

export default function UpgradeModal({ isOpen, onClose, trigger = "limit" }: UpgradeModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="w-6 h-6 text-purple-500" />
            <DialogTitle className="text-2xl">Upgrade to Pro</DialogTitle>
          </div>
          <DialogDescription>
            {trigger === "header" && "Create Unlimited Events with Pro! "}
            {trigger === "limit" && "You've reached your free event limit. "}
            {trigger === "color" && "Custom theme colors are a Pro feature. "}
            Unlock unlimited events and premium features!
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="p-6 border rounded-lg">
            <h3 className="text-xl font-bold mb-2">Pro Plan</h3>
            <ul className="space-y-2 text-sm">
              <li>✓ Unlimited events</li>
              <li>✓ Custom theme colors</li>
              <li>✓ Priority support</li>
              <li>✓ Advanced analytics</li>
            </ul>
            <p className="mt-4 text-2xl font-bold">Coming Soon</p>
          </div>
        </div>

        <div className="flex gap-3">
          <Button variant="outline" onClick={onClose} className="flex-1 cursor-pointer bg-gray-700 hover:bg-gray-900">
            Maybe Later
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

