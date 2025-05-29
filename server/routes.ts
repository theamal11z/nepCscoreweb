import type { Express } from "express";
import { createServer, type Server } from "http";
import { setupAuth } from "./auth";
import { storage } from "./storage";
import { insertTeamSchema, insertMatchSchema, insertPlayerSchema, insertMatchScoreSchema, insertBallByBallSchema } from "@shared/schema";
import { z } from "zod";

function requireAuth(req: any, res: any, next: any) {
  if (!req.isAuthenticated() || !req.user) {
    return res.status(401).json({ message: "Authentication required" });
  }
  next();
}

function requireRole(roles: string[]) {
  return (req: any, res: any, next: any) => {
    if (!req.isAuthenticated() || !req.user) {
      return res.status(401).json({ message: "Authentication required" });
    }
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: "Insufficient permissions" });
    }
    next();
  };
}

export function registerRoutes(app: Express): Server {
  setupAuth(app);

  // Teams
  app.get("/api/teams", async (req, res) => {
    try {
      const teams = await storage.getAllTeams();
      res.json(teams);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch teams" });
    }
  });

  app.post("/api/teams", requireAuth, requireRole(["organizer", "admin"]), async (req, res) => {
    try {
      const validatedData = insertTeamSchema.parse(req.body);
      const team = await storage.createTeam({
        ...validatedData,
        createdById: req.user!.id,
      });
      res.status(201).json(team);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid team data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create team" });
    }
  });

  app.get("/api/teams/:id", async (req, res) => {
    try {
      const team = await storage.getTeam(parseInt(req.params.id));
      if (!team) {
        return res.status(404).json({ message: "Team not found" });
      }
      res.json(team);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch team" });
    }
  });

  app.get("/api/teams/my", requireAuth, async (req, res) => {
    try {
      if (!req.user || !req.user.id) {
        return res.status(401).json({ message: "User not authenticated" });
      }
      
      const teams = await storage.getUserTeams(req.user.id);
      res.json(teams || []);
    } catch (error) {
      console.error("Error fetching user teams:", error);
      res.status(500).json({ message: "Failed to fetch user teams" });
    }
  });

  // Matches
  app.get("/api/matches", async (req, res) => {
    try {
      const matches = await storage.getAllMatches();
      res.json(matches);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch matches" });
    }
  });
  
  // Live matches
  app.get("/api/matches/live", async (req, res) => {
    try {
      const matches = await storage.getLiveMatches();
      res.json(matches);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch live matches" });
    }
  });
  
  // Upcoming matches
  app.get("/api/matches/upcoming", async (req, res) => {
    try {
      const matches = await storage.getUpcomingMatches();
      res.json(matches);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch upcoming matches" });
    }
  });
  
  // Completed matches
  app.get("/api/matches/completed", async (req, res) => {
    try {
      const matches = await storage.getCompletedMatches();
      res.json(matches);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch completed matches" });
    }
  });
  
  // Organizer matches - matches created by the logged-in organizer
  app.get("/api/matches/organizer", requireAuth, requireRole(["organizer"]), async (req, res) => {
    try {
      const matches = await storage.getUserMatches(req.user!.id);
      res.json(matches);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch match" });
    }
  });

  app.post("/api/matches", requireAuth, requireRole(["organizer", "admin"]), async (req, res) => {
    try {
      console.log('Match creation request body:', JSON.stringify(req.body));
      const validatedData = insertMatchSchema.parse(req.body);
      console.log('Validated match data:', JSON.stringify(validatedData));
      
      // Ensure numeric fields are properly converted
      const matchData = {
        ...validatedData,
        team1Id: Number(validatedData.team1Id),
        team2Id: Number(validatedData.team2Id),
        organizerId: req.user!.id,
      };
      console.log('Creating match with data:', JSON.stringify(matchData));
      
      try {
        const match = await storage.createMatch(matchData);
        console.log('Match created successfully:', JSON.stringify(match));
        res.status(201).json(match);
      } catch (dbError) {
        console.error('Database error creating match:', dbError);
        res.status(500).json({ message: "Database error creating match", error: dbError instanceof Error ? dbError.message : String(dbError) });
      }
    } catch (error) {
      console.error('Error in match creation:', error);
      if (error instanceof z.ZodError) {
        console.log('Validation errors:', error.errors);
        return res.status(400).json({ message: "Invalid match data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create match", error: error instanceof Error ? error.message : String(error) });
    }
  });

  app.get("/api/matches/:id", async (req, res) => {
    try {
      const match = await storage.getMatch(parseInt(req.params.id));
      if (!match) {
        return res.status(404).json({ message: "Match not found" });
      }
      res.json(match);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch match" });
    }
  });

  app.get("/api/matches/organizer", requireAuth, async (req, res) => {
    try {
      const matches = await storage.getUserMatches(req.user!.id);
      res.json(matches);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch organizer matches" });
    }
  });

  app.get("/api/matches/scores", async (req, res) => {
    try {
      const matches = await storage.getAllMatches();
      const matchesWithScores = await Promise.all(
        matches.map(async (match) => {
          const scores = await storage.getMatchScores(match.id);
          return { ...match, scores };
        })
      );
      res.json(matchesWithScores);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch matches with scores" });
    }
  });

  app.patch("/api/matches/:id/status", requireAuth, requireRole(["organizer", "admin"]), async (req, res) => {
    try {
      const { status } = req.body;
      if (!["scheduled", "live", "completed", "cancelled"].includes(status)) {
        return res.status(400).json({ message: "Invalid status" });
      }
      
      await storage.updateMatchStatus(parseInt(req.params.id), status);
      res.json({ message: "Match status updated" });
    } catch (error) {
      res.status(500).json({ message: "Failed to update match status" });
    }
  });

  // Match Scores
  app.get("/api/matches/:id/scores", async (req, res) => {
    try {
      const scores = await storage.getMatchScores(parseInt(req.params.id));
      res.json(scores);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch scores" });
    }
  });

  app.post("/api/matches/:id/scores", requireAuth, requireRole(["organizer", "admin"]), async (req, res) => {
    try {
      const validatedData = insertMatchScoreSchema.parse({
        ...req.body,
        matchId: parseInt(req.params.id),
      });
      const score = await storage.createMatchScore(validatedData);
      res.status(201).json(score);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid score data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create score" });
    }
  });

  app.patch("/api/matches/:matchId/scores/:teamId", requireAuth, requireRole(["organizer", "admin"]), async (req, res) => {
    try {
      const matchId = parseInt(req.params.matchId);
      const teamId = parseInt(req.params.teamId);
      await storage.updateMatchScore(matchId, teamId, req.body);
      res.json({ message: "Score updated" });
    } catch (error) {
      res.status(500).json({ message: "Failed to update score" });
    }
  });

  // Ball by Ball
  app.get("/api/matches/:id/balls", async (req, res) => {
    try {
      const balls = await storage.getMatchBalls(parseInt(req.params.id));
      res.json(balls);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch ball data" });
    }
  });

  app.post("/api/matches/:id/balls", requireAuth, requireRole(["organizer", "admin"]), async (req, res) => {
    try {
      const validatedData = insertBallByBallSchema.parse({
        ...req.body,
        matchId: parseInt(req.params.id),
      });
      const ball = await storage.createBallByBall(validatedData);
      res.status(201).json(ball);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid ball data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create ball data" });
    }
  });

  app.get("/api/matches/:id/latest-ball", async (req, res) => {
    try {
      const ball = await storage.getLatestBall(parseInt(req.params.id));
      res.json(ball || null);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch latest ball" });
    }
  });

  // Players
  app.post("/api/players", requireAuth, requireRole(["player", "admin"]), async (req, res) => {
    try {
      const validatedData = insertPlayerSchema.parse(req.body);
      const player = await storage.createPlayer({
        ...validatedData,
        userId: req.user!.id,
      });
      res.status(201).json(player);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid player data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create player profile" });
    }
  });
  
  // Update player's team
  app.patch("/api/players/:id/team", requireAuth, requireRole(["organizer", "admin"]), async (req, res) => {
    try {
      const playerId = parseInt(req.params.id);
      const { teamId } = req.body;
      
      if (teamId === undefined) {
        return res.status(400).json({ message: "Team ID is required" });
      }
      
      // If organizer, check if they own the team
      if (req.user!.role === "organizer") {
        const team = await storage.getTeam(teamId);
        if (!team || team.createdById !== req.user!.id) {
          return res.status(403).json({ message: "You don't have permission to add players to this team" });
        }
      }
      
      await storage.updatePlayerTeam(playerId, teamId);
      res.json({ message: "Player team updated successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to update player team" });
    }
  });
  
  // Get team players
  app.get("/api/teams/:id/players", async (req, res) => {
    try {
      const teamId = parseInt(req.params.id);
      const players = await storage.getTeamPlayers(teamId);
      res.json(players);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch team players" });
    }
  });
  
  // Get available players (players without a team)
  app.get("/api/players/available", requireAuth, requireRole(["organizer", "admin"]), async (req, res) => {
    try {
      const availablePlayers = await storage.getPlayersWithoutTeam();
      res.json(availablePlayers);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch available players" });
    }
  });

  app.get("/api/players/me", requireAuth, async (req, res) => {
    try {
      const player = await storage.getPlayerByUserId(req.user!.id);
      res.json(player || null);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch player profile" });
    }
  });

  app.get("/api/players/:id/stats", async (req, res) => {
    try {
      const stats = await storage.getPlayerStats(parseInt(req.params.id));
      res.json(stats);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch player stats" });
    }
  });

  // Admin routes
  app.get("/api/admin/users", requireAuth, requireRole(["admin"]), async (req, res) => {
    try {
      const users = await storage.getAllUsers();
      res.json(users);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch users" });
    }
  });

  app.get("/api/admin/pending-users", requireAuth, requireRole(["admin"]), async (req, res) => {
    try {
      const users = await storage.getPendingUsers();
      res.json(users);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch pending users" });
    }
  });

  app.patch("/api/admin/users/:id/approve", requireAuth, requireRole(["admin"]), async (req, res) => {
    try {
      const { isApproved } = req.body;
      await storage.updateUserApproval(parseInt(req.params.id), isApproved);
      res.json({ message: "User approval updated" });
    } catch (error) {
      res.status(500).json({ message: "Failed to update user approval" });
    }
  });

  app.patch("/api/admin/users/:id/role", requireAuth, requireRole(["admin"]), async (req, res) => {
    try {
      const { role } = req.body;
      if (!["fan", "organizer", "player", "admin"].includes(role)) {
        return res.status(400).json({ message: "Invalid role" });
      }
      await storage.updateUserRole(parseInt(req.params.id), role);
      res.json({ message: "User role updated" });
    } catch (error) {
      res.status(500).json({ message: "Failed to update user role" });
    }
  });

  app.get("/api/admin/pending-players", requireAuth, requireRole(["admin"]), async (req, res) => {
    try {
      const players = await storage.getPendingPlayers();
      res.json(players);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch pending players" });
    }
  });

  app.patch("/api/admin/players/:id/approve", requireAuth, requireRole(["admin"]), async (req, res) => {
    try {
      const { isApproved } = req.body;
      await storage.updatePlayerApproval(parseInt(req.params.id), isApproved);
      res.json({ message: "Player approval updated" });
    } catch (error) {
      res.status(500).json({ message: "Failed to update player approval" });
    }
  });
  
  // User profile update
  app.patch("/api/users/profile", requireAuth, async (req, res) => {
    try {
      const { fullName, email, phone, bio } = req.body;
      // Validate data
      if (!fullName) {
        return res.status(400).json({ message: "Full name is required" });
      }
      
      // Validate email format
      if (email && !email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
        return res.status(400).json({ message: "Invalid email format" });
      }

      // Check if email already exists for another user
      if (email && email !== req.user!.email) {
        const existingUser = await storage.getUserByEmail(email);
        if (existingUser && existingUser.id !== req.user!.id) {
          return res.status(400).json({ message: "Email already in use" });
        }
      }

      // Update the user profile
      await storage.updateUserProfile(req.user!.id, { fullName, email, phone, bio });
      
      // Get the updated user data
      const updatedUser = await storage.getUser(req.user!.id);
      
      res.json(updatedUser);
    } catch (error) {
      res.status(500).json({ message: "Failed to update profile" });
    }
  });
  
  // Fan routes - Team and Player following
  app.get("/api/fan/:userId/followed-teams", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const teams = await storage.getFollowedTeams(userId);
      res.json(teams);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch followed teams" });
    }
  });
  
  app.get("/api/fan/:userId/followed-players", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const players = await storage.getFollowedPlayers(userId);
      res.json(players);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch followed players" });
    }
  });
  
  // Current user's followed teams and players
  app.get("/api/user/followed-teams", requireAuth, async (req, res) => {
    try {
      const teams = await storage.getFollowedTeams(req.user!.id);
      res.json(teams);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch followed teams" });
    }
  });

  app.get("/api/user/followed-players", requireAuth, async (req, res) => {
    try {
      const players = await storage.getFollowedPlayers(req.user!.id);
      res.json(players);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch followed players" });
    }
  });
  
  app.post("/api/fan/follow-team", requireAuth, requireRole(["fan"]), async (req, res) => {
    try {
      const { teamId } = req.body;
      if (!teamId) {
        return res.status(400).json({ message: "Team ID is required" });
      }
      const follow = await storage.followTeam(req.user!.id, teamId);
      res.status(201).json(follow);
    } catch (error) {
      res.status(500).json({ message: "Failed to follow team" });
    }
  });
  
  app.post("/api/fan/unfollow-team", requireAuth, requireRole(["fan"]), async (req, res) => {
    try {
      const { teamId } = req.body;
      if (!teamId) {
        return res.status(400).json({ message: "Team ID is required" });
      }
      await storage.unfollowTeam(req.user!.id, teamId);
      res.json({ message: "Successfully unfollowed team" });
    } catch (error) {
      res.status(500).json({ message: "Failed to unfollow team" });
    }
  });
  
  app.post("/api/fan/follow-player", requireAuth, requireRole(["fan"]), async (req, res) => {
    try {
      const { playerId } = req.body;
      if (!playerId) {
        return res.status(400).json({ message: "Player ID is required" });
      }
      const follow = await storage.followPlayer(req.user!.id, playerId);
      res.status(201).json(follow);
    } catch (error) {
      res.status(500).json({ message: "Failed to follow player" });
    }
  });
  
  app.post("/api/fan/unfollow-player", requireAuth, requireRole(["fan"]), async (req, res) => {
    try {
      const { playerId } = req.body;
      if (!playerId) {
        return res.status(400).json({ message: "Player ID is required" });
      }
      await storage.unfollowPlayer(req.user!.id, playerId);
      res.json({ message: "Successfully unfollowed player" });
    } catch (error) {
      res.status(500).json({ message: "Failed to unfollow player" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
