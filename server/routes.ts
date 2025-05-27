import type { Express } from "express";
import { createServer, type Server } from "http";
import { setupAuth } from "./auth";
import { storage } from "./storage";
import { insertTeamSchema, insertMatchSchema, insertPlayerSchema, insertMatchScoreSchema, insertBallByBallSchema } from "@shared/schema";
import { z } from "zod";

function requireAuth(req: any, res: any, next: any) {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ message: "Authentication required" });
  }
  next();
}

function requireRole(roles: string[]) {
  return (req: any, res: any, next: any) => {
    if (!req.isAuthenticated()) {
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
        createdById: req.user.id,
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
      const teams = await storage.getUserTeams(req.user.id);
      res.json(teams);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch user teams" });
    }
  });

  // Matches
  app.get("/api/matches", async (req, res) => {
    try {
      const { status } = req.query;
      let matches;
      
      if (status === "live") {
        matches = await storage.getLiveMatches();
      } else if (status === "upcoming") {
        matches = await storage.getUpcomingMatches();
      } else if (status === "completed") {
        matches = await storage.getCompletedMatches();
      } else {
        matches = await storage.getAllMatches();
      }
      
      res.json(matches);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch matches" });
    }
  });

  app.post("/api/matches", requireAuth, requireRole(["organizer", "admin"]), async (req, res) => {
    try {
      const validatedData = insertMatchSchema.parse(req.body);
      const match = await storage.createMatch({
        ...validatedData,
        organizerId: req.user.id,
      });
      res.status(201).json(match);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid match data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create match" });
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
      const matches = await storage.getUserMatches(req.user.id);
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
        userId: req.user.id,
      });
      res.status(201).json(player);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid player data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create player profile" });
    }
  });

  app.get("/api/players/me", requireAuth, async (req, res) => {
    try {
      const player = await storage.getPlayerByUserId(req.user.id);
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

  const httpServer = createServer(app);
  return httpServer;
}
