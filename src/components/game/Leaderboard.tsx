
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Trophy } from "lucide-react";

interface LeaderboardProps {
  currentPlayerEmail: string;
}

export const Leaderboard = ({ currentPlayerEmail }: LeaderboardProps) => {
  const { data: leaderboard } = useQuery({
    queryKey: ["leaderboard"],
    queryFn: async () => {
      const { data } = await supabase
        .from("Player")
        .select("PlayerName, PlayerEmail, NumberOfEliminations")
        .order("NumberOfEliminations", { ascending: false })
        .limit(10);
      return data || [];
    },
  });

  return (
    <Card className="p-4 w-64 bg-white/50 backdrop-blur-sm border border-primary/10">
      <div className="flex items-center gap-2 mb-4">
        <Trophy className="w-5 h-5 text-primary" />
        <h2 className="text-lg font-semibold text-primary">Top Huggers</h2>
      </div>
      <div className="space-y-2">
        {leaderboard?.map((player, index) => (
          <div
            key={player.PlayerEmail}
            className={`flex justify-between items-center p-2 rounded ${
              player.PlayerEmail === currentPlayerEmail
                ? "font-bold bg-primary/10"
                : "hover:bg-primary/5"
            }`}
          >
            <span>
              {index + 1}. {player.PlayerName}
            </span>
            <span>{player.NumberOfEliminations}</span>
          </div>
        ))}
      </div>
    </Card>
  );
};
