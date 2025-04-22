
import { Card } from "@/components/ui/card";
import { Info } from "lucide-react";

interface GameRulesProps {
  leftSide?: boolean;
  rightSide?: boolean;
}

export const GameRules = ({ leftSide, rightSide }: GameRulesProps) => {
  // Function to render the content based on which side it's on
  const renderContent = () => {
    if (leftSide) {
      return (
        <div className="space-y-4">
          <section>
            <h3 className="font-medium text-primary mb-2">Safety Guidelines</h3>
            <ul className="list-disc pl-5 space-y-1">
              <li>This game is supposed to be fun, but it's not fun when people get hurt or property gets damaged</li>
              <li>Be aware of your surroundings</li>
              <li>Use good judgment and manners when interacting with other teachers</li>
              <li>You can be removed from the game if you fail to use good judgment</li>
            </ul>
          </section>

          <section>
            <h3 className="font-medium text-primary mb-2">Overview</h3>
            <ul className="list-disc pl-5 space-y-1">
              <li>Each teacher will be assigned a target</li>
              <li>After eliminating a target, teachers get assigned a new one</li>
              <li>The game will end when only one teacher remains</li>
            </ul>
          </section>
        </div>
      );
    }

    if (rightSide) {
      return (
        <div className="space-y-4">
      

          <section>
            <h3 className="font-medium text-primary mb-2">Boundaries</h3>
            <ul className="list-disc pl-5 space-y-1">
              <li>Safe zones include bathrooms, locker rooms, and when teachers are in a meeting</li>
              <li>Hugging is not allowed in places where you or your target needs to be professional</li>
              <li>Other than that, there are no safe spots. Hallways, offices, or even while teaching is all fair game/li>
            </ul>
          </section>
        </div>
      );
    }

    return null;
  };

  return (
    <Card className="p-6 bg-white/50 backdrop-blur-sm border border-primary/10">
      <div className="flex items-center gap-2 mb-4">
        <Info className="w-5 h-5 text-primary" />
        <h2 className="text-lg font-semibold text-primary">{leftSide ? "Game Rules Part 1" : "Game Rules Part 2"}</h2>
      </div>
      {renderContent()}
    </Card>
  );
};

