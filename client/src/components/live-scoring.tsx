import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Plus, Minus, Target, Users, Timer, AlertCircle } from "lucide-react";
import type { Match, MatchScore, BallByBall } from "@shared/schema";

interface LiveScoringProps {
  matchId: number;
}

const ballSchema = z.object({
  innings: z.number().min(1).max(2),
  over: z.number().min(1),
  ball: z.number().min(1).max(6),
  batsmanId: z.number().optional(),
  bowlerId: z.number().optional(),
  runs: z.number().min(0).max(6),
  extras: z.number().min(0),
  isWicket: z.boolean().default(false),
  wicketType: z.string().optional(),
  dismissedPlayerId: z.number().optional(),
});

const scoreUpdateSchema = z.object({
  runs: z.number().min(0),
  wickets: z.number().min(0).max(10),
  overs: z.string(),
  extras: z.number().min(0),
});

type BallData = z.infer<typeof ballSchema>;
type ScoreUpdateData = z.infer<typeof scoreUpdateSchema>;

export default function LiveScoring({ matchId }: LiveScoringProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeInnings, setActiveInnings] = useState(1);
  const [currentOver, setCurrentOver] = useState(1);
  const [currentBall, setCurrentBall] = useState(1);

  const { data: match } = useQuery<Match>({
    queryKey: [`/api/matches/${matchId}`],
  });

  const { data: scores } = useQuery<MatchScore[]>({
    queryKey: [`/api/matches/${matchId}/scores`],
  });

  const { data: balls } = useQuery<BallByBall[]>({
    queryKey: [`/api/matches/${matchId}/balls`],
  });

  const ballForm = useForm<BallData>({
    resolver: zodResolver(ballSchema),
    defaultValues: {
      innings: activeInnings,
      over: currentOver,
      ball: currentBall,
      runs: 0,
      extras: 0,
      isWicket: false,
    },
  });

  const scoreForm = useForm<ScoreUpdateData>({
    resolver: zodResolver(scoreUpdateSchema),
    defaultValues: {
      runs: 0,
      wickets: 0,
      overs: "0.0",
      extras: 0,
    },
  });

  const addBallMutation = useMutation({
    mutationFn: async (data: BallData) => {
      const res = await apiRequest("POST", `/api/matches/${matchId}/balls`, data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/matches/${matchId}/balls`] });
      queryClient.invalidateQueries({ queryKey: [`/api/matches/${matchId}/scores`] });
      queryClient.invalidateQueries({ queryKey: [`/api/matches/${matchId}/latest-ball`] });
      
      // Auto-increment ball
      if (currentBall < 6) {
        setCurrentBall(currentBall + 1);
        ballForm.setValue("ball", currentBall + 1);
      } else {
        setCurrentOver(currentOver + 1);
        setCurrentBall(1);
        ballForm.setValue("over", currentOver + 1);
        ballForm.setValue("ball", 1);
      }
      
      toast({
        title: "Ball recorded successfully",
        description: "The ball has been added to the match",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to record ball",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const updateScoreMutation = useMutation({
    mutationFn: async ({ teamId, data }: { teamId: number; data: ScoreUpdateData }) => {
      const res = await apiRequest("PATCH", `/api/matches/${matchId}/scores/${teamId}`, data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/matches/${matchId}/scores`] });
      toast({
        title: "Score updated successfully",
        description: "The team score has been updated",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to update score",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const startMatchMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("PATCH", `/api/matches/${matchId}/status`, { status: "live" });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/matches/${matchId}`] });
      toast({
        title: "Match started",
        description: "The match is now live",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to start match",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const endMatchMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("PATCH", `/api/matches/${matchId}/status`, { status: "completed" });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/matches/${matchId}`] });
      toast({
        title: "Match completed",
        description: "The match has been marked as completed",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to end match",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onAddBall = (data: BallData) => {
    addBallMutation.mutate({
      ...data,
      innings: activeInnings,
      over: currentOver,
      ball: currentBall,
    });
  };

  const onUpdateScore = (teamId: number, data: ScoreUpdateData) => {
    updateScoreMutation.mutate({ teamId, data });
  };

  const quickRuns = [0, 1, 2, 3, 4, 5, 6];
  const wicketTypes = ["bowled", "caught", "lbw", "stumped", "run-out", "hit-wicket"];

  const getCurrentScore = (teamId: number) => {
    return scores?.find(s => s.teamId === teamId && s.innings === activeInnings);
  };

  const getLastBalls = () => {
    return balls?.slice(-6).reverse() || [];
  };

  if (!match) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <AlertCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">Match not found</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Match Control */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Match Control</span>
            <Badge variant={match.status === "live" ? "destructive" : "secondary"}>
              {match.status.toUpperCase()}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            {match.status === "scheduled" && (
              <Button 
                onClick={() => startMatchMutation.mutate()}
                disabled={startMatchMutation.isPending}
                className="bg-green-600 hover:bg-green-700"
              >
                <Timer className="w-4 h-4 mr-2" />
                Start Match
              </Button>
            )}
            {match.status === "live" && (
              <Button 
                onClick={() => endMatchMutation.mutate()}
                disabled={endMatchMutation.isPending}
                variant="destructive"
              >
                End Match
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Current Score Overview */}
      <div className="grid lg:grid-cols-2 gap-6">
        {[match.team1Id, match.team2Id].map((teamId, index) => {
          const teamScore = getCurrentScore(teamId);
          return (
            <Card key={teamId} className={activeInnings === index + 1 ? "border-primary" : ""}>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                      <Users className="text-white w-5 h-5" />
                    </div>
                    Team {teamId}
                  </div>
                  {activeInnings === index + 1 && (
                    <Badge variant="destructive">Batting</Badge>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <div className="text-4xl font-bold text-primary mb-2">
                    {teamScore ? `${teamScore.runs}/${teamScore.wickets}` : "0/0"}
                  </div>
                  <div className="text-lg text-muted-foreground">
                    ({teamScore?.overs || "0.0"} overs)
                  </div>
                  {teamScore && teamScore.extras > 0 && (
                    <div className="text-sm text-muted-foreground mt-2">
                      Extras: {teamScore.extras}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Live Scoring Interface */}
      {match.status === "live" && (
        <Tabs defaultValue="ball-by-ball" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="ball-by-ball">Ball by Ball</TabsTrigger>
            <TabsTrigger value="score-update">Score Update</TabsTrigger>
          </TabsList>

          <TabsContent value="ball-by-ball" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Ball by Ball Scoring</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-6">
                  {/* Innings Selection */}
                  <div className="flex items-center gap-4">
                    <label className="text-sm font-medium">Innings:</label>
                    <div className="flex gap-2">
                      {[1, 2].map((innings) => (
                        <Button
                          key={innings}
                          variant={activeInnings === innings ? "default" : "outline"}
                          size="sm"
                          onClick={() => {
                            setActiveInnings(innings);
                            ballForm.setValue("innings", innings);
                          }}
                        >
                          {innings}
                        </Button>
                      ))}
                    </div>
                  </div>

                  {/* Over and Ball Info */}
                  <div className="flex items-center gap-4">
                    <div className="text-lg font-semibold">
                      Over {currentOver}.{currentBall}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        if (currentBall > 1) {
                          setCurrentBall(currentBall - 1);
                          ballForm.setValue("ball", currentBall - 1);
                        } else if (currentOver > 1) {
                          setCurrentOver(currentOver - 1);
                          setCurrentBall(6);
                          ballForm.setValue("over", currentOver - 1);
                          ballForm.setValue("ball", 6);
                        }
                      }}
                    >
                      <Minus className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        if (currentBall < 6) {
                          setCurrentBall(currentBall + 1);
                          ballForm.setValue("ball", currentBall + 1);
                        } else {
                          setCurrentOver(currentOver + 1);
                          setCurrentBall(1);
                          ballForm.setValue("over", currentOver + 1);
                          ballForm.setValue("ball", 1);
                        }
                      }}
                    >
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>

                  <Form {...ballForm}>
                    <form onSubmit={ballForm.handleSubmit(onAddBall)} className="space-y-4">
                      {/* Quick Runs */}
                      <div>
                        <label className="text-sm font-medium">Runs:</label>
                        <div className="flex gap-2 mt-2">
                          {quickRuns.map((runs) => (
                            <Button
                              key={runs}
                              type="button"
                              variant={ballForm.watch("runs") === runs ? "default" : "outline"}
                              size="sm"
                              onClick={() => ballForm.setValue("runs", runs)}
                            >
                              {runs}
                            </Button>
                          ))}
                        </div>
                      </div>

                      {/* Extras */}
                      <FormField
                        control={ballForm.control}
                        name="extras"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Extras</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                min="0"
                                placeholder="0"
                                {...field}
                                onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {/* Wicket */}
                      <FormField
                        control={ballForm.control}
                        name="isWicket"
                        render={({ field }) => (
                          <FormItem>
                            <div className="flex items-center space-x-2">
                              <input
                                type="checkbox"
                                checked={field.value}
                                onChange={field.onChange}
                                className="w-4 h-4"
                              />
                              <FormLabel>Wicket</FormLabel>
                            </div>
                          </FormItem>
                        )}
                      />

                      {ballForm.watch("isWicket") && (
                        <FormField
                          control={ballForm.control}
                          name="wicketType"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Wicket Type</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select wicket type" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {wicketTypes.map((type) => (
                                    <SelectItem key={type} value={type}>
                                      {type.charAt(0).toUpperCase() + type.slice(1)}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      )}

                      <Button 
                        type="submit" 
                        disabled={addBallMutation.isPending}
                        className="w-full"
                      >
                        <Target className="w-4 h-4 mr-2" />
                        Record Ball
                      </Button>
                    </form>
                  </Form>
                </div>
              </CardContent>
            </Card>

            {/* Recent Balls */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Balls</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {getLastBalls().map((ball) => (
                    <div key={ball.id} className="flex justify-between items-center p-2 border rounded">
                      <span className="text-sm">
                        {ball.over}.{ball.ball}
                      </span>
                      <span className="font-medium">
                        {ball.runs} run{ball.runs !== 1 ? 's' : ''}
                        {ball.isWicket && <span className="text-red-600 ml-1">WICKET</span>}
                        {ball.extras > 0 && <span className="text-blue-600 ml-1">+{ball.extras}</span>}
                      </span>
                    </div>
                  ))}
                  {getLastBalls().length === 0 && (
                    <p className="text-center text-muted-foreground py-4">No balls recorded yet</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="score-update" className="space-y-6">
            <div className="grid lg:grid-cols-2 gap-6">
              {[match.team1Id, match.team2Id].map((teamId) => {
                const currentScore = getCurrentScore(teamId);
                return (
                  <Card key={teamId}>
                    <CardHeader>
                      <CardTitle>Update Team {teamId} Score</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <Form {...scoreForm}>
                        <form 
                          onSubmit={scoreForm.handleSubmit((data) => onUpdateScore(teamId, data))}
                          className="space-y-4"
                        >
                          <FormField
                            control={scoreForm.control}
                            name="runs"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Runs</FormLabel>
                                <FormControl>
                                  <Input
                                    type="number"
                                    min="0"
                                    placeholder={currentScore?.runs.toString() || "0"}
                                    {...field}
                                    onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={scoreForm.control}
                            name="wickets"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Wickets</FormLabel>
                                <FormControl>
                                  <Input
                                    type="number"
                                    min="0"
                                    max="10"
                                    placeholder={currentScore?.wickets.toString() || "0"}
                                    {...field}
                                    onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={scoreForm.control}
                            name="overs"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Overs</FormLabel>
                                <FormControl>
                                  <Input
                                    placeholder={currentScore?.overs || "0.0"}
                                    {...field}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={scoreForm.control}
                            name="extras"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Extras</FormLabel>
                                <FormControl>
                                  <Input
                                    type="number"
                                    min="0"
                                    placeholder={currentScore?.extras.toString() || "0"}
                                    {...field}
                                    onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <Button 
                            type="submit" 
                            disabled={updateScoreMutation.isPending}
                            className="w-full"
                          >
                            Update Score
                          </Button>
                        </form>
                      </Form>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}
