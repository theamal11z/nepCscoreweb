import { useParams } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Play, Pause, Target, Users, Clock, Trophy, Plus } from "lucide-react";
import { useState } from "react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Match, MatchScore, BallByBall, Team } from "@shared/schema";

export default function LiveScoring() {
  const params = useParams();
  const matchId = parseInt(params.id as string);
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [currentOver, setCurrentOver] = useState(1);
  const [currentBall, setCurrentBall] = useState(1);
  const [runs, setRuns] = useState("");
  const [ballType, setBallType] = useState("regular");
  const [batsman, setBatsman] = useState("");
  const [bowler, setBowler] = useState("");
  const [comments, setComments] = useState("");

  const { data: match } = useQuery<Match>({
    queryKey: ["/api/matches", matchId],
  });

  const { data: scores = [] } = useQuery<MatchScore[]>({
    queryKey: ["/api/matches", matchId, "scores"],
  });

  const { data: balls = [] } = useQuery<BallByBall[]>({
    queryKey: ["/api/matches", matchId, "balls"],
  });

  const { data: teams = [] } = useQuery<Team[]>({
    queryKey: ["/api/teams"],
  });

  const addBallMutation = useMutation({
    mutationFn: async (ballData: any) => {
      const res = await apiRequest("POST", `/api/matches/${matchId}/balls`, ballData);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/matches", matchId, "balls"] });
      queryClient.invalidateQueries({ queryKey: ["/api/matches", matchId, "scores"] });
      setRuns("");
      setComments("");
      toast({
        title: "Success",
        description: "Ball recorded successfully!",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const updateScoreMutation = useMutation({
    mutationFn: async ({ teamId, scoreData }: { teamId: number; scoreData: any }) => {
      const res = await apiRequest("PATCH", `/api/matches/${matchId}/scores/${teamId}`, scoreData);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/matches", matchId, "scores"] });
      toast({
        title: "Success",
        description: "Score updated successfully!",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleAddBall = () => {
    if (!runs || !batsman || !bowler) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    const ballData = {
      overNumber: currentOver,
      ballNumber: currentBall,
      batsman,
      bowler,
      runs: parseInt(runs) || 0,
      ballType,
      comments,
    };

    addBallMutation.mutate(ballData);
    
    // Auto increment ball count
    if (currentBall === 6) {
      setCurrentOver(currentOver + 1);
      setCurrentBall(1);
    } else {
      setCurrentBall(currentBall + 1);
    }
  };

  const getTeamName = (teamId: number) => {
    const team = teams.find(t => t.id === teamId);
    return team?.name || `Team ${teamId}`;
  };

  const getTeamScore = (teamId: number) => {
    const score = scores.find(s => s.teamId === teamId);
    return score || { runs: 0, wickets: 0, overs: 0 };
  };

  const getCurrentRunRate = (teamId: number) => {
    const score = getTeamScore(teamId);
    if (score.overs === 0) return "0.00";
    return (score.runs / score.overs).toFixed(2);
  };

  const ballTypes = [
    { value: "regular", label: "Regular" },
    { value: "wide", label: "Wide" },
    { value: "no_ball", label: "No Ball" },
    { value: "bye", label: "Bye" },
    { value: "leg_bye", label: "Leg Bye" },
    { value: "wicket", label: "Wicket" },
  ];

  if (!match) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-12">
            <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              Loading match details...
            </h3>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Match Header */}
        <Card className="border-l-4 border-l-[#DC143C]">
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-2xl">
                  {getTeamName(match.team1Id)} vs {getTeamName(match.team2Id)}
                </CardTitle>
                <CardDescription className="flex items-center space-x-4 mt-2">
                  <span className="flex items-center space-x-1">
                    <Clock className="h-4 w-4" />
                    <span>{new Date(match.matchDate).toLocaleDateString()}</span>
                  </span>
                  <span>{match.venue}</span>
                </CardDescription>
              </div>
              <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
                LIVE
              </Badge>
            </div>
          </CardHeader>
        </Card>

        {/* Live Scoreboard */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Trophy className="h-5 w-5 text-[#DC143C]" />
                <span>{getTeamName(match.team1Id)}</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="text-3xl font-bold">
                  {getTeamScore(match.team1Id).runs}/{getTeamScore(match.team1Id).wickets}
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm text-gray-600 dark:text-gray-400">
                  <div>
                    <span className="font-medium">Overs:</span> {getTeamScore(match.team1Id).overs}
                  </div>
                  <div>
                    <span className="font-medium">Run Rate:</span> {getCurrentRunRate(match.team1Id)}
                  </div>
                </div>
                <Button
                  size="sm"
                  onClick={() => updateScoreMutation.mutate({
                    teamId: match.team1Id,
                    scoreData: { runs: getTeamScore(match.team1Id).runs + 1 }
                  })}
                  disabled={updateScoreMutation.isPending}
                >
                  Update Score
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Trophy className="h-5 w-5 text-[#DC143C]" />
                <span>{getTeamName(match.team2Id)}</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="text-3xl font-bold">
                  {getTeamScore(match.team2Id).runs}/{getTeamScore(match.team2Id).wickets}
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm text-gray-600 dark:text-gray-400">
                  <div>
                    <span className="font-medium">Overs:</span> {getTeamScore(match.team2Id).overs}
                  </div>
                  <div>
                    <span className="font-medium">Run Rate:</span> {getCurrentRunRate(match.team2Id)}
                  </div>
                </div>
                <Button
                  size="sm"
                  onClick={() => updateScoreMutation.mutate({
                    teamId: match.team2Id,
                    scoreData: { runs: getTeamScore(match.team2Id).runs + 1 }
                  })}
                  disabled={updateScoreMutation.isPending}
                >
                  Update Score
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Live Scoring Interface */}
        <Tabs defaultValue="ball-by-ball" className="space-y-6">
          <TabsList className="grid grid-cols-2 w-full max-w-md">
            <TabsTrigger value="ball-by-ball">Ball by Ball</TabsTrigger>
            <TabsTrigger value="match-stats">Match Stats</TabsTrigger>
          </TabsList>

          <TabsContent value="ball-by-ball" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Target className="h-5 w-5 text-[#DC143C]" />
                  <span>Record Ball</span>
                </CardTitle>
                <CardDescription>
                  Over {currentOver}, Ball {currentBall}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Batsman</label>
                    <Input
                      placeholder="Enter batsman name"
                      value={batsman}
                      onChange={(e) => setBatsman(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Bowler</label>
                    <Input
                      placeholder="Enter bowler name"
                      value={bowler}
                      onChange={(e) => setBowler(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Runs Scored</label>
                    <Input
                      type="number"
                      placeholder="0"
                      value={runs}
                      onChange={(e) => setRuns(e.target.value)}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Ball Type</label>
                    <Select value={ballType} onValueChange={setBallType}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {ballTypes.map((type) => (
                          <SelectItem key={type.value} value={type.value}>
                            {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Over & Ball</label>
                    <div className="flex space-x-2">
                      <Input
                        type="number"
                        placeholder="Over"
                        value={currentOver}
                        onChange={(e) => setCurrentOver(parseInt(e.target.value) || 1)}
                      />
                      <Input
                        type="number"
                        placeholder="Ball"
                        value={currentBall}
                        onChange={(e) => setCurrentBall(parseInt(e.target.value) || 1)}
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Comments (Optional)</label>
                  <Textarea
                    placeholder="Add any comments about this ball..."
                    value={comments}
                    onChange={(e) => setComments(e.target.value)}
                    rows={3}
                  />
                </div>

                <Button
                  onClick={handleAddBall}
                  disabled={addBallMutation.isPending}
                  className="w-full bg-[#DC143C] hover:bg-[#B91C3C] text-white"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  {addBallMutation.isPending ? "Recording..." : "Record Ball"}
                </Button>
              </CardContent>
            </Card>

            {/* Recent Balls */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Balls</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {balls.slice(-10).reverse().map((ball, index) => (
                    <div key={index} className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <div className="flex items-center space-x-4">
                        <Badge variant="outline">{ball.overNumber}.{ball.ballNumber}</Badge>
                        <span className="font-medium">{ball.batsman}</span>
                        <span className="text-sm text-gray-600 dark:text-gray-400">vs {ball.bowler}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge className="bg-[#DC143C] text-white">{ball.runs} runs</Badge>
                        <Badge variant="secondary">{ball.ballType}</Badge>
                      </div>
                    </div>
                  ))}
                  {balls.length === 0 && (
                    <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                      No balls recorded yet. Start scoring to see the ball-by-ball commentary here.
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="match-stats">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Users className="h-5 w-5 text-[#DC143C]" />
                  <span>Match Statistics</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold mb-3">{getTeamName(match.team1Id)} Stats</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Total Runs:</span>
                        <span className="font-medium">{getTeamScore(match.team1Id).runs}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Wickets:</span>
                        <span className="font-medium">{getTeamScore(match.team1Id).wickets}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Overs:</span>
                        <span className="font-medium">{getTeamScore(match.team1Id).overs}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Run Rate:</span>
                        <span className="font-medium">{getCurrentRunRate(match.team1Id)}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold mb-3">{getTeamName(match.team2Id)} Stats</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Total Runs:</span>
                        <span className="font-medium">{getTeamScore(match.team2Id).runs}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Wickets:</span>
                        <span className="font-medium">{getTeamScore(match.team2Id).wickets}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Overs:</span>
                        <span className="font-medium">{getTeamScore(match.team2Id).overs}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Run Rate:</span>
                        <span className="font-medium">{getCurrentRunRate(match.team2Id)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}