import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { User, Trophy } from "lucide-react";
import type { PlayerStat, Player } from "@shared/schema";

interface PlayerMatchStatsProps {
  matchId: number;
}

export default function PlayerMatchStats({ matchId }: PlayerMatchStatsProps) {
  const { data: playerStats, isLoading } = useQuery<PlayerStat[]>({
    queryKey: [`/api/matches/${matchId}/player-stats`],
  });

  const { data: players, isLoading: playersLoading } = useQuery<Player[]>({
    queryKey: ["/api/players"],
  });

  // Get player details by ID
  const getPlayerName = (playerId: number) => {
    const player = players?.find(p => p.id === playerId);
    return player ? `Player #${player.userId}` : `Player #${playerId}`;
  };

  // Sort stats by runs scored (for batting) or wickets taken (for bowling)
  const battingStats = [...(playerStats || [])].sort((a, b) => b.runs - a.runs);
  const bowlingStats = [...(playerStats || [])].sort((a, b) => b.wicketsTaken - a.wicketsTaken);

  // Find top performers
  const topBatsman = battingStats[0];
  const topBowler = bowlingStats[0];

  if (isLoading || playersLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="space-y-4 animate-pulse">
            <div className="h-8 bg-muted rounded-md w-1/3"></div>
            <div className="h-24 bg-muted rounded-md"></div>
            <div className="h-24 bg-muted rounded-md"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!playerStats || playerStats.length === 0) {
    return (
      <Card>
        <CardContent className="py-8 text-center">
          <Trophy className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">No Player Statistics</h3>
          <p className="text-muted-foreground">
            Player statistics will appear here once the match is in progress or completed.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Performers */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {topBatsman && (
          <Card className="overflow-hidden border-blue-200 dark:border-blue-800">
            <CardHeader className="bg-blue-50 dark:bg-blue-900/20 pb-3">
              <CardTitle className="text-md font-medium">Top Batsman</CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-full bg-blue-100 dark:bg-blue-800 flex items-center justify-center">
                  <User className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <Link href={`/player/${topBatsman.playerId}`}>
                    <h3 className="font-semibold hover:text-primary cursor-pointer">
                      {getPlayerName(topBatsman.playerId)}
                    </h3>
                  </Link>
                  <div className="flex items-center gap-2 text-sm">
                    <span className="font-bold text-blue-600 dark:text-blue-400">{topBatsman.runs} runs</span>
                    <span className="text-muted-foreground">
                      ({topBatsman.ballsFaced} balls, {topBatsman.fours} fours, {topBatsman.sixes} sixes)
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {topBowler && (
          <Card className="overflow-hidden border-green-200 dark:border-green-800">
            <CardHeader className="bg-green-50 dark:bg-green-900/20 pb-3">
              <CardTitle className="text-md font-medium">Top Bowler</CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-full bg-green-100 dark:bg-green-800 flex items-center justify-center">
                  <User className="h-6 w-6 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <Link href={`/player/${topBowler.playerId}`}>
                    <h3 className="font-semibold hover:text-primary cursor-pointer">
                      {getPlayerName(topBowler.playerId)}
                    </h3>
                  </Link>
                  <div className="flex items-center gap-2 text-sm">
                    <span className="font-bold text-green-600 dark:text-green-400">
                      {topBowler.wicketsTaken} wicket{topBowler.wicketsTaken !== 1 ? 's' : ''}
                    </span>
                    <span className="text-muted-foreground">
                      ({topBowler.oversBowled} overs, {topBowler.runsConceded} runs)
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Detailed Stats */}
      <Card>
        <CardContent className="p-0">
          <Tabs defaultValue="batting">
            <TabsList className="w-full border-b rounded-none justify-start p-0">
              <TabsTrigger 
                value="batting" 
                className="data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none"
              >
                Batting
              </TabsTrigger>
              <TabsTrigger 
                value="bowling" 
                className="data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none"
              >
                Bowling
              </TabsTrigger>
              <TabsTrigger 
                value="fielding" 
                className="data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none"
              >
                Fielding
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="batting" className="p-4">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Player</TableHead>
                    <TableHead className="text-right">Runs</TableHead>
                    <TableHead className="text-right">Balls</TableHead>
                    <TableHead className="text-right">4s</TableHead>
                    <TableHead className="text-right">6s</TableHead>
                    <TableHead className="text-right">S/R</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {battingStats.map((stat) => {
                    const strikeRate = stat.ballsFaced > 0 
                      ? ((stat.runs / stat.ballsFaced) * 100).toFixed(2) 
                      : "0.00";
                    
                    return (
                      <TableRow key={stat.playerId}>
                        <TableCell className="font-medium">
                          <Link href={`/player/${stat.playerId}`}>
                            <span className="hover:text-primary cursor-pointer">
                              {getPlayerName(stat.playerId)}
                            </span>
                          </Link>
                        </TableCell>
                        <TableCell className="text-right">{stat.runs}</TableCell>
                        <TableCell className="text-right">{stat.ballsFaced}</TableCell>
                        <TableCell className="text-right">{stat.fours}</TableCell>
                        <TableCell className="text-right">{stat.sixes}</TableCell>
                        <TableCell className="text-right">{strikeRate}</TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TabsContent>
            
            <TabsContent value="bowling" className="p-4">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Player</TableHead>
                    <TableHead className="text-right">Overs</TableHead>
                    <TableHead className="text-right">Runs</TableHead>
                    <TableHead className="text-right">Wickets</TableHead>
                    <TableHead className="text-right">Economy</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {bowlingStats
                    .filter(stat => stat.oversBowled && stat.oversBowled !== "0.0")
                    .map((stat) => {
                      // Calculate economy rate (runs per over)
                      const overs = stat.oversBowled.split(".");
                      const totalBalls = (parseInt(overs[0]) * 6) + (overs[1] ? parseInt(overs[1]) : 0);
                      const totalOvers = totalBalls / 6;
                      const economy = totalOvers > 0 
                        ? (stat.runsConceded / totalOvers).toFixed(2) 
                        : "0.00";
                      
                      return (
                        <TableRow key={stat.playerId}>
                          <TableCell className="font-medium">
                            <Link href={`/player/${stat.playerId}`}>
                              <span className="hover:text-primary cursor-pointer">
                                {getPlayerName(stat.playerId)}
                              </span>
                            </Link>
                          </TableCell>
                          <TableCell className="text-right">{stat.oversBowled}</TableCell>
                          <TableCell className="text-right">{stat.runsConceded}</TableCell>
                          <TableCell className="text-right">{stat.wicketsTaken}</TableCell>
                          <TableCell className="text-right">{economy}</TableCell>
                        </TableRow>
                      );
                    })}
                </TableBody>
              </Table>
            </TabsContent>
            
            <TabsContent value="fielding" className="p-4">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Player</TableHead>
                    <TableHead className="text-right">Catches</TableHead>
                    <TableHead className="text-right">Stumpings</TableHead>
                    <TableHead className="text-right">Run Outs</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {playerStats
                    .filter(stat => stat.catches > 0 || stat.stumps > 0 || stat.runOuts > 0)
                    .sort((a, b) => (b.catches + b.stumps + b.runOuts) - (a.catches + a.stumps + a.runOuts))
                    .map((stat) => (
                      <TableRow key={stat.playerId}>
                        <TableCell className="font-medium">
                          <Link href={`/player/${stat.playerId}`}>
                            <span className="hover:text-primary cursor-pointer">
                              {getPlayerName(stat.playerId)}
                            </span>
                          </Link>
                        </TableCell>
                        <TableCell className="text-right">{stat.catches}</TableCell>
                        <TableCell className="text-right">{stat.stumps}</TableCell>
                        <TableCell className="text-right">{stat.runOuts}</TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
              
              {playerStats.filter(stat => stat.catches > 0 || stat.stumps > 0 || stat.runOuts > 0).length === 0 && (
                <div className="text-center py-4 text-muted-foreground">
                  No fielding statistics recorded yet
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
