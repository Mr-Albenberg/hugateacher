import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

interface PinVerificationProps {
  onVerify: (pin: string) => void;
  onBack: () => void;
}

export const PinVerification = ({ onVerify, onBack }: PinVerificationProps) => {
  const [pin, setPin] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pin) {
      toast.error("Please enter the PIN");
      return;
    }
    setIsLoading(true);
    try {
      await onVerify(pin);
    } catch (error) {
      toast.error("Invalid PIN. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 w-full max-w-sm animate-scale-in">
      <div className="space-y-2">
        <Input
          type="text"
          placeholder="Enter PIN"
          value={pin}
          onChange={(e) => setPin(e.target.value)}
          className="w-full"
          maxLength={6}
          disabled={isLoading}
        />
      </div>
      <div className="space-y-2">
        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? "Verifying..." : "Verify PIN"}
        </Button>
        <Button
          type="button"
          variant="outline"
          className="w-full"
          onClick={onBack}
          disabled={isLoading}
        >
          Back to Login
        </Button>
      </div>
    </form>
  );
};