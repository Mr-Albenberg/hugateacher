
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { History } from "lucide-react";

export const EliminationHistory = () => {
  const { data: eliminations } = useQuery({
    queryKey: ["eliminations"],
    queryFn: async () => {
      const { data: history } = await supabase
        .from("eliminationhistory")
        .select(`
          eliminated_at,
          eliminated_player:Player!fk_eliminated_player(PlayerName)
        `)
        .order("eliminated_at", { ascending: false });
      return history || [];
    },
  });

  return (
    <Card className="p-4 w-64 bg-white/50 backdrop-blur-sm border border-primary/10">
      <div className="flex items-center gap-2 mb-4">
        <History className="w-5 h-5 text-primary" />
        <h2 className="text-lg font-semibold text-primary">Recent Eliminations</h2>
      </div>
      <ScrollArea className="h-[400px] pr-4">
        <div className="space-y-3">
          {eliminations?.map((elimination) => (
            <div
              key={elimination.eliminated_at}
              className="text-sm p-2 rounded hover:bg-primary/5"
            >
              <p className="text-muted-foreground">
                {elimination.eliminated_player.PlayerName} was eliminated
              </p>
              <p className="text-xs text-muted-foreground">
                {new Date(elimination.eliminated_at || "").toLocaleDateString()}
              </p>
            </div>
          ))}
        </div>
      </ScrollArea>
    </Card>
  );
};
