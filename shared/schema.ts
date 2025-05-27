import { pgTable, text, serial, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email").notNull().unique(),
  role: text("role").notNull().default("fan"), // fan, organizer, player, admin
  fullName: text("full_name").notNull(),
  isApproved: boolean("is_approved").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const teams = pgTable("teams", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  location: text("location").notNull(),
  logoUrl: text("logo_url"),
  createdById: integer("created_by_id").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
});

export const players = pgTable("players", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  teamId: integer("team_id").references(() => teams.id),
  position: text("position"), // batsman, bowler, all-rounder, wicket-keeper
  battingStyle: text("batting_style"), // right-hand, left-hand
  bowlingStyle: text("bowling_style"), // right-arm fast, left-arm spin, etc.
  isApproved: boolean("is_approved").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const matches = pgTable("matches", {
  id: serial("id").primaryKey(),
  team1Id: integer("team1_id").references(() => teams.id).notNull(),
  team2Id: integer("team2_id").references(() => teams.id).notNull(),
  venue: text("venue").notNull(),
  matchDate: timestamp("match_date").notNull(),
  matchType: text("match_type").notNull(), // T20, ODI, Test
  status: text("status").default("scheduled"), // scheduled, live, completed, cancelled
  winnerId: integer("winner_id").references(() => teams.id),
  organizerId: integer("organizer_id").references(() => users.id).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const matchScores = pgTable("match_scores", {
  id: serial("id").primaryKey(),
  matchId: integer("match_id").references(() => matches.id).notNull(),
  teamId: integer("team_id").references(() => teams.id).notNull(),
  runs: integer("runs").default(0),
  wickets: integer("wickets").default(0),
  overs: text("overs").default("0.0"),
  innings: integer("innings").notNull(), // 1 or 2
  extras: integer("extras").default(0),
});

export const playerStats = pgTable("player_stats", {
  id: serial("id").primaryKey(),
  playerId: integer("player_id").references(() => players.id).notNull(),
  matchId: integer("match_id").references(() => matches.id).notNull(),
  runs: integer("runs").default(0),
  ballsFaced: integer("balls_faced").default(0),
  fours: integer("fours").default(0),
  sixes: integer("sixes").default(0),
  wicketsTaken: integer("wickets_taken").default(0),
  oversBowled: text("overs_bowled").default("0.0"),
  runsConceded: integer("runs_conceded").default(0),
  catches: integer("catches").default(0),
  stumps: integer("stumps").default(0),
  runOuts: integer("run_outs").default(0),
});

export const ballByBall = pgTable("ball_by_ball", {
  id: serial("id").primaryKey(),
  matchId: integer("match_id").references(() => matches.id).notNull(),
  innings: integer("innings").notNull(),
  over: integer("over").notNull(),
  ball: integer("ball").notNull(),
  batsmanId: integer("batsman_id").references(() => players.id),
  bowlerId: integer("bowler_id").references(() => players.id),
  runs: integer("runs").default(0),
  extras: integer("extras").default(0),
  isWicket: boolean("is_wicket").default(false),
  wicketType: text("wicket_type"), // bowled, caught, lbw, etc.
  dismissedPlayerId: integer("dismissed_player_id").references(() => players.id),
  timestamp: timestamp("timestamp").defaultNow(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  teamsCreated: many(teams),
  matchesOrganized: many(matches),
  playerProfile: many(players),
}));

export const teamsRelations = relations(teams, ({ one, many }) => ({
  creator: one(users, {
    fields: [teams.createdById],
    references: [users.id],
  }),
  players: many(players),
  homeMatches: many(matches, { relationName: "team1" }),
  awayMatches: many(matches, { relationName: "team2" }),
  scores: many(matchScores),
}));

export const playersRelations = relations(players, ({ one, many }) => ({
  user: one(users, {
    fields: [players.userId],
    references: [users.id],
  }),
  team: one(teams, {
    fields: [players.teamId],
    references: [teams.id],
  }),
  stats: many(playerStats),
  ballsAsBatsman: many(ballByBall, { relationName: "batsman" }),
  ballsAsBowler: many(ballByBall, { relationName: "bowler" }),
}));

export const matchesRelations = relations(matches, ({ one, many }) => ({
  team1: one(teams, {
    fields: [matches.team1Id],
    references: [teams.id],
    relationName: "team1",
  }),
  team2: one(teams, {
    fields: [matches.team2Id],
    references: [teams.id],
    relationName: "team2",
  }),
  winner: one(teams, {
    fields: [matches.winnerId],
    references: [teams.id],
  }),
  organizer: one(users, {
    fields: [matches.organizerId],
    references: [users.id],
  }),
  scores: many(matchScores),
  playerStats: many(playerStats),
  ballByBall: many(ballByBall),
}));

export const matchScoresRelations = relations(matchScores, ({ one }) => ({
  match: one(matches, {
    fields: [matchScores.matchId],
    references: [matches.id],
  }),
  team: one(teams, {
    fields: [matchScores.teamId],
    references: [teams.id],
  }),
}));

export const playerStatsRelations = relations(playerStats, ({ one }) => ({
  player: one(players, {
    fields: [playerStats.playerId],
    references: [players.id],
  }),
  match: one(matches, {
    fields: [playerStats.matchId],
    references: [matches.id],
  }),
}));

export const ballByBallRelations = relations(ballByBall, ({ one }) => ({
  match: one(matches, {
    fields: [ballByBall.matchId],
    references: [matches.id],
  }),
  batsman: one(players, {
    fields: [ballByBall.batsmanId],
    references: [players.id],
    relationName: "batsman",
  }),
  bowler: one(players, {
    fields: [ballByBall.bowlerId],
    references: [players.id],
    relationName: "bowler",
  }),
  dismissedPlayer: one(players, {
    fields: [ballByBall.dismissedPlayerId],
    references: [players.id],
  }),
}));

// Insert schemas
export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  email: true,
  fullName: true,
  role: true,
});

export const insertTeamSchema = createInsertSchema(teams).pick({
  name: true,
  location: true,
  logoUrl: true,
});

export const insertPlayerSchema = createInsertSchema(players).pick({
  teamId: true,
  position: true,
  battingStyle: true,
  bowlingStyle: true,
});

export const insertMatchSchema = createInsertSchema(matches).pick({
  team1Id: true,
  team2Id: true,
  venue: true,
  matchDate: true,
  matchType: true,
});

export const insertMatchScoreSchema = createInsertSchema(matchScores).pick({
  matchId: true,
  teamId: true,
  runs: true,
  wickets: true,
  overs: true,
  innings: true,
  extras: true,
});

export const insertPlayerStatSchema = createInsertSchema(playerStats).omit({
  id: true,
  createdAt: true,
});

export const insertBallByBallSchema = createInsertSchema(ballByBall).omit({
  id: true,
  timestamp: true,
});

// Types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertTeam = z.infer<typeof insertTeamSchema>;
export type Team = typeof teams.$inferSelect;
export type InsertPlayer = z.infer<typeof insertPlayerSchema>;
export type Player = typeof players.$inferSelect;
export type InsertMatch = z.infer<typeof insertMatchSchema>;
export type Match = typeof matches.$inferSelect;
export type InsertMatchScore = z.infer<typeof insertMatchScoreSchema>;
export type MatchScore = typeof matchScores.$inferSelect;
export type InsertPlayerStat = z.infer<typeof insertPlayerStatSchema>;
export type PlayerStat = typeof playerStats.$inferSelect;
export type InsertBallByBall = z.infer<typeof insertBallByBallSchema>;
export type BallByBall = typeof ballByBall.$inferSelect;
