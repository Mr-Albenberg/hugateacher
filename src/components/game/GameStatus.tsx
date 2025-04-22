
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface GameStatusProps {
  targetName: string;
  isEliminated: boolean;
  onHugTarget: () => Promise<void>;
  onGotHugged: () => Promise<void>;
  onLogout: () => void;
  gaveHug: boolean;
  gotHug: boolean;
  isWinner: boolean;
}

export const GameStatus = ({
  targetName,
  isEliminated,
  onHugTarget,
  onGotHugged,
  onLogout,
  gaveHug,
  gotHug,
  isWinner,
}: GameStatusProps) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleAction = async (action: () => Promise<void>) => {
    setIsLoading(true);
    try {
      await action();
    } catch (error) {
      toast.error("Failed to update game status. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="p-6 w-full max-w-md animate-scale-in bg-white/50 backdrop-blur-sm border border-primary/10">
      {isWinner ? (
        <div className="space-y-4 text-center">
          <h2 className="text-2xl font-bold text-primary">🎉 Congratulations! You Won! 🎉</h2>
          <p className="text-muted-foreground">You are the last warrior standing!</p>
          <p className="text-primary font-medium">Talk to Ms. Mason to claim your prize!</p>
          <Button onClick={onLogout} variant="outline" className="w-full border-primary/20 hover:bg-primary/5">
            Logout
          </Button>
        </div>
      ) : isEliminated ? (
        <div className="space-y-4 text-center">
          <h2 className="text-2xl font-bold text-destructive">You've been eliminated!</h2>
          <p className="text-muted-foreground">Better luck next time!</p>
          <Button onClick={onLogout} variant="outline" className="w-full border-primary/20 hover:bg-primary/5">
            Logout
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="text-center">
            <h2 className="text-sm font-medium text-muted-foreground">YOUR TARGET</h2>
            <p className="text-2xl font-bold mt-1 text-primary">{targetName}</p>
          </div>
          <div className="space-y-2">
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  className="w-full bg-primary hover:bg-primary/90"
                  disabled={isLoading || gaveHug}
                >
                  {gaveHug ? "Target Hugged!" : "I Hugged My Target"}
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Confirm Action</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you hugged {targetName}? This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={() => handleAction(onHugTarget)}>
                    Confirm
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="destructive"
                  className="w-full"
                  disabled={isLoading || gotHug}
                >
                  {gotHug ? "Hug Confirmed!" : "I Got Hugged"}
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Confirm Action</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you got hugged? This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={() => handleAction(onGotHugged)}>
                    Confirm
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>

            <Button 
              onClick={onLogout} 
              variant="outline" 
              className="w-full border-primary/20 hover:bg-primary/5"
              disabled={isLoading}
            >
              Logout
            </Button>
          </div>
        </div>
      )}
    </Card>
  );
};
