
import { useEffect, useState } from "react";
import { LoginForm } from "@/components/auth/LoginForm";
import { GameStatus } from "@/components/game/GameStatus";
import { Leaderboard } from "@/components/game/Leaderboard";
import { EliminationHistory } from "@/components/game/EliminationHistory";
import { GameRules } from "@/components/auth/GameRules";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

const Index = () => {
  const [email, setEmail] = useState("");
  const [gameData, setGameData] = useState<{
    targetName: string;
    isEliminated: boolean;
    gaveHug: boolean;
    gotHug: boolean;
    isWinner: boolean;
  } | null>(null);

  useEffect(() => {
    const checkSession = async () => {
      const storedEmail = localStorage.getItem("playerEmail");
      if (storedEmail) {
        try {
          const { data: player } = await supabase
            .from("Player")
            .select("PlayerEmail, IsEliminated, TargetEmail, GaveHug, GotHug")
            .eq("PlayerEmail", storedEmail)
            .maybeSingle();

          if (player) {
            setEmail(storedEmail);
            
            // Check if player is the last one standing
            const { data: activePlayers } = await supabase
              .from("Player")
              .select("PlayerEmail")
              .eq("IsEliminated", false);
            
            const isWinner = activePlayers?.length === 1 && activePlayers[0].PlayerEmail === storedEmail;

            if (player.IsEliminated || isWinner) {
              setGameData({
                targetName: "",
                isEliminated: player.IsEliminated,
                gaveHug: false,
                gotHug: false,
                isWinner: isWinner
              });
            } else if (player.TargetEmail) {
              const { data: targetPlayer } = await supabase
                .from("Player")
                .select("PlayerName")
                .eq("PlayerEmail", player.TargetEmail)
                .single();

              setGameData({
                targetName: targetPlayer.PlayerName,
                isEliminated: player.IsEliminated,
                gaveHug: player.GaveHug,
                gotHug: player.GotHug,
                isWinner: false
              });
            }
          }
        } catch (error) {
          console.error("Session restoration error:", error);
        }
      }
    };

    checkSession();
  }, []);

  const handleLogin = async (email: string, password: string) => {
    try {
      const { data: player } = await supabase
        .from("Player")
        .select("PlayerEmail, PlayerPassword, IsEliminated, TargetEmail, GaveHug, GotHug")
        .eq("PlayerEmail", email)
        .maybeSingle();

      if (!player) {
        toast.error("Email not found");
        return;
      }

      if (player.PlayerPassword !== password) {
        toast.error("Incorrect password");
        return;
      }

      localStorage.setItem("playerEmail", email);
      setEmail(email);

      // Check if player is the last one standing
      const { data: activePlayers } = await supabase
        .from("Player")
        .select("PlayerEmail")
        .eq("IsEliminated", false);
      
      const isWinner = activePlayers?.length === 1 && activePlayers[0].PlayerEmail === email;

      if (player.IsEliminated || isWinner) {
        setGameData({
          targetName: "",
          isEliminated: player.IsEliminated,
          gaveHug: false,
          gotHug: false,
          isWinner: isWinner
        });
      } else if (player.TargetEmail) {
        const { data: targetPlayer } = await supabase
          .from("Player")
          .select("PlayerName")
          .eq("PlayerEmail", player.TargetEmail)
          .single();

        setGameData({
          targetName: targetPlayer.PlayerName,
          isEliminated: player.IsEliminated,
          gaveHug: player.GaveHug,
          gotHug: player.GotHug,
          isWinner: false
        });
      }

      toast.success("Login successful!");
    } catch (error: any) {
      toast.error(error.message || "Login failed");
    }
  };

  const handleHugTarget = async () => {
    try {
      // Get current player's target
      const { data: currentPlayer } = await supabase
        .from("Player")
        .select("TargetEmail")
        .eq("PlayerEmail", email)
        .single();

      if (!currentPlayer?.TargetEmail) return;

      // Set GaveHug to true for the current player
      await supabase
        .from("Player")
        .update({ GaveHug: true })
        .eq("PlayerEmail", email);

      // Update local state for current player
      setGameData(prev => ({
        ...prev!,
        gaveHug: true,
      }));

      // Check if target is already marked as GotHug
      const { data: targetPlayer } = await supabase
        .from("Player")
        .select("GotHug, TargetEmail")
        .eq("PlayerEmail", currentPlayer.TargetEmail)
        .single();

      // If target has confirmed they got hugged, proceed with elimination
      if (targetPlayer?.GotHug) {
        // Record the elimination
        await supabase
          .from("eliminationhistory")
          .insert({
            eliminator_email: email,
            eliminated_player_email: currentPlayer.TargetEmail,
          });

        // Get target's target before eliminating them
        const targetNextTarget = targetPlayer.TargetEmail;

        // Eliminate target and clear their data
        await supabase
          .from("Player")
          .update({ 
            IsEliminated: true,
            TargetEmail: null,
            GaveHug: false,
            GotHug: false
          })
          .eq("PlayerEmail", currentPlayer.TargetEmail);

        // Update current player's target to eliminated player's target
        if (targetNextTarget) {
          await supabase
            .from("Player")
            .update({ 
              TargetEmail: targetNextTarget,
              GaveHug: false
            })
            .eq("PlayerEmail", email);

          // Get new target's name
          const { data: newTarget } = await supabase
            .from("Player")
            .select("PlayerName")
            .eq("PlayerEmail", targetNextTarget)
            .single();

          // Update local state with new target
          setGameData(prev => ({
            ...prev!,
            targetName: newTarget.PlayerName,
            gaveHug: false,
          }));
        }

        toast.success("Target eliminated!");
      } else {
        toast.success("Hug registered! Waiting for target to confirm.");
      }
    } catch (error) {
      toast.error("Failed to update game status");
      throw error;
    }
  };

  const handleGotHugged = async () => {
    try {
      // Set GotHug to true for current player
      await supabase
        .from("Player")
        .update({ GotHug: true })
        .eq("PlayerEmail", email);

      // Update local state
      setGameData(prev => ({
        ...prev!,
        gotHug: true,
      }));

      // Find the player who has current player as their target
      const { data: hugger } = await supabase
        .from("Player")
        .select("PlayerEmail, GaveHug")
        .eq("TargetEmail", email)
        .single();

      // If hugger has confirmed giving hug, proceed with elimination
      if (hugger?.GaveHug) {
        // Get current player's target before being eliminated
        const { data: currentPlayer } = await supabase
          .from("Player")
          .select("TargetEmail")
          .eq("PlayerEmail", email)
          .single();

        // Record the elimination
        await supabase
          .from("eliminationhistory")
          .insert({
            eliminator_email: hugger.PlayerEmail,
            eliminated_player_email: email,
          });

        // Transfer target to hugger and reset their hug status
        if (currentPlayer?.TargetEmail) {
          await supabase
            .from("Player")
            .update({ 
              TargetEmail: currentPlayer.TargetEmail,
              GaveHug: false
            })
            .eq("PlayerEmail", hugger.PlayerEmail);
        }

        // Eliminate current player
        await supabase
          .from("Player")
          .update({ 
            IsEliminated: true,
            TargetEmail: null,
            GaveHug: false,
            GotHug: false
          })
          .eq("PlayerEmail", email);

        // Update local state to show elimination
        setGameData(prev => ({
          ...prev!,
          isEliminated: true,
          gaveHug: false,
          gotHug: false,
        }));

        toast.error("You've been eliminated!");
      } else {
        toast.error("You've confirmed being hugged! Waiting for hugger to confirm.");
      }
    } catch (error) {
      toast.error("Failed to update game status");
      throw error;
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("playerEmail");
    setEmail("");
    setGameData(null);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-primary/5 to-background p-4">
      {!email ? (
        <div className="w-full max-w-[1400px] grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] gap-8 items-start">
          <div className="hidden md:block">
            <GameRules leftSide />
          </div>
          <div className="space-y-8">
            <div className="flex flex-row items-center justify-center gap-4">
              <img
                src="/lovable-uploads/0e42bc5a-a7cd-41f3-82dc-596a709fd796.png"
                alt="Centaurus Warriors Logo"
                className="w-16 h-16"
              />
              <div className="text-center">
                <h1 className="text-4xl font-bold tracking-tight text-primary">Hug A Warrior</h1>
                <p className="text-muted-foreground">Spread love, eliminate targets!</p>
              </div>
            </div>
            <LoginForm onLogin={handleLogin} />
          </div>
          <div className="hidden md:block">
            <GameRules rightSide />
          </div>
        </div>
      ) : (
        gameData && (
          <div className="w-full max-w-6xl grid grid-cols-1 md:grid-cols-[auto_1fr_auto] gap-8 items-start justify-items-center">
            <Leaderboard currentPlayerEmail={email} />
            <GameStatus
              targetName={gameData.targetName}
              isEliminated={gameData.isEliminated}
              onHugTarget={handleHugTarget}
              onGotHugged={handleGotHugged}
              onLogout={handleLogout}
              gaveHug={gameData.gaveHug}
              gotHug={gameData.gotHug}
              isWinner={gameData.isWinner}
            />
            <EliminationHistory />
          </div>
        )
      )}
    </div>
  );
};

export default Index;
