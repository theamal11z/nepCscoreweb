import { 
  users, teams, players, matches, matchScores, playerStats, ballByBall,
  type User, type InsertUser, type Team, type InsertTeam, 
  type Player, type InsertPlayer, type Match, type InsertMatch,
  type MatchScore, type InsertMatchScore, type PlayerStat, type InsertPlayerStat,
  type BallByBall, type InsertBallByBall
} from "@shared/schema";
import { db } from "./db";
import { eq, and, desc, asc } from "drizzle-orm";
import session from "express-session";
import connectPg from "connect-pg-simple";
import { pool } from "./db";

const PostgresSessionStore = connectPg(session);

export interface IStorage {
  sessionStore: session.SessionStore;
  
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUserApproval(id: number, isApproved: boolean): Promise<void>;
  updateUserRole(id: number, role: string): Promise<void>;
  getAllUsers(): Promise<User[]>;
  getPendingUsers(): Promise<User[]>;

  // Team operations
  createTeam(team: InsertTeam & { createdById: number }): Promise<Team>;
  getTeam(id: number): Promise<Team | undefined>;
  getAllTeams(): Promise<Team[]>;
  getUserTeams(userId: number): Promise<Team[]>;

  // Player operations
  createPlayer(player: InsertPlayer & { userId: number }): Promise<Player>;
  getPlayer(id: number): Promise<Player | undefined>;
  getPlayerByUserId(userId: number): Promise<Player | undefined>;
  updatePlayerApproval(id: number, isApproved: boolean): Promise<void>;
  updatePlayerTeam(id: number, teamId: number | null): Promise<void>;
  getTeamPlayers(teamId: number): Promise<Player[]>;
  getPendingPlayers(): Promise<Player[]>;

  // Match operations
  createMatch(match: InsertMatch & { organizerId: number }): Promise<Match>;
  getMatch(id: number): Promise<Match | undefined>;
  getAllMatches(): Promise<Match[]>;
  getLiveMatches(): Promise<Match[]>;
  getUpcomingMatches(): Promise<Match[]>;
  getCompletedMatches(): Promise<Match[]>;
  getUserMatches(userId: number): Promise<Match[]>;
  updateMatchStatus(id: number, status: string): Promise<void>;
  updateMatchWinner(id: number, winnerId: number): Promise<void>;

  // Match score operations
  createMatchScore(score: InsertMatchScore): Promise<MatchScore>;
  updateMatchScore(matchId: number, teamId: number, score: Partial<InsertMatchScore>): Promise<void>;
  getMatchScores(matchId: number): Promise<MatchScore[]>;

  // Player stats operations
  createPlayerStat(stat: InsertPlayerStat): Promise<PlayerStat>;
  updatePlayerStat(playerId: number, matchId: number, stat: Partial<InsertPlayerStat>): Promise<void>;
  getPlayerStats(playerId: number): Promise<PlayerStat[]>;
  getMatchPlayerStats(matchId: number): Promise<PlayerStat[]>;

  // Ball by ball operations
  createBallByBall(ball: InsertBallByBall): Promise<BallByBall>;
  getMatchBalls(matchId: number): Promise<BallByBall[]>;
  getLatestBall(matchId: number): Promise<BallByBall | undefined>;
}

export class DatabaseStorage implements IStorage {
  sessionStore: session.SessionStore;

  constructor() {
    this.sessionStore = new PostgresSessionStore({ 
      pool, 
      createTableIfMissing: true 
    });
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  async updateUserApproval(id: number, isApproved: boolean): Promise<void> {
    await db.update(users).set({ isApproved }).where(eq(users.id, id));
  }

  async updateUserRole(id: number, role: string): Promise<void> {
    await db.update(users).set({ role }).where(eq(users.id, id));
  }

  async getAllUsers(): Promise<User[]> {
    return await db.select().from(users).orderBy(desc(users.createdAt));
  }

  async getPendingUsers(): Promise<User[]> {
    return await db.select().from(users).where(eq(users.isApproved, false)).orderBy(desc(users.createdAt));
  }

  // Team operations
  async createTeam(team: InsertTeam & { createdById: number }): Promise<Team> {
    const [newTeam] = await db
      .insert(teams)
      .values(team)
      .returning();
    return newTeam;
  }

  async getTeam(id: number): Promise<Team | undefined> {
    const [team] = await db.select().from(teams).where(eq(teams.id, id));
    return team || undefined;
  }

  async getAllTeams(): Promise<Team[]> {
    return await db.select().from(teams).orderBy(asc(teams.name));
  }

  async getUserTeams(userId: number): Promise<Team[]> {
    return await db.select().from(teams).where(eq(teams.createdById, userId));
  }

  // Player operations
  async createPlayer(player: InsertPlayer & { userId: number }): Promise<Player> {
    const [newPlayer] = await db
      .insert(players)
      .values(player)
      .returning();
    return newPlayer;
  }

  async getPlayer(id: number): Promise<Player | undefined> {
    const [player] = await db.select().from(players).where(eq(players.id, id));
    return player || undefined;
  }

  async getPlayerByUserId(userId: number): Promise<Player | undefined> {
    const [player] = await db.select().from(players).where(eq(players.userId, userId));
    return player || undefined;
  }

  async updatePlayerApproval(id: number, isApproved: boolean): Promise<void> {
    await db.update(players).set({ isApproved }).where(eq(players.id, id));
  }

  async updatePlayerTeam(id: number, teamId: number | null): Promise<void> {
    await db.update(players).set({ teamId }).where(eq(players.id, id));
  }

  async getTeamPlayers(teamId: number): Promise<Player[]> {
    return await db.select().from(players).where(eq(players.teamId, teamId));
  }

  async getPendingPlayers(): Promise<Player[]> {
    return await db.select().from(players).where(eq(players.isApproved, false)).orderBy(desc(players.createdAt));
  }

  // Match operations
  async createMatch(match: InsertMatch & { organizerId: number }): Promise<Match> {
    const [newMatch] = await db
      .insert(matches)
      .values(match)
      .returning();
    return newMatch;
  }

  async getMatch(id: number): Promise<Match | undefined> {
    const [match] = await db.select().from(matches).where(eq(matches.id, id));
    return match || undefined;
  }

  async getAllMatches(): Promise<Match[]> {
    return await db.select().from(matches).orderBy(desc(matches.matchDate));
  }

  async getLiveMatches(): Promise<Match[]> {
    return await db.select().from(matches).where(eq(matches.status, "live")).orderBy(desc(matches.matchDate));
  }

  async getUpcomingMatches(): Promise<Match[]> {
    return await db.select().from(matches).where(eq(matches.status, "scheduled")).orderBy(asc(matches.matchDate));
  }

  async getCompletedMatches(): Promise<Match[]> {
    return await db.select().from(matches).where(eq(matches.status, "completed")).orderBy(desc(matches.matchDate));
  }

  async getUserMatches(userId: number): Promise<Match[]> {
    return await db.select().from(matches).where(eq(matches.organizerId, userId)).orderBy(desc(matches.matchDate));
  }

  async updateMatchStatus(id: number, status: string): Promise<void> {
    await db.update(matches).set({ status }).where(eq(matches.id, id));
  }

  async updateMatchWinner(id: number, winnerId: number): Promise<void> {
    await db.update(matches).set({ winnerId }).where(eq(matches.id, id));
  }

  // Match score operations
  async createMatchScore(score: InsertMatchScore): Promise<MatchScore> {
    const [newScore] = await db
      .insert(matchScores)
      .values(score)
      .returning();
    return newScore;
  }

  async updateMatchScore(matchId: number, teamId: number, score: Partial<InsertMatchScore>): Promise<void> {
    await db.update(matchScores)
      .set(score)
      .where(and(eq(matchScores.matchId, matchId), eq(matchScores.teamId, teamId)));
  }

  async getMatchScores(matchId: number): Promise<MatchScore[]> {
    return await db.select().from(matchScores).where(eq(matchScores.matchId, matchId));
  }

  // Player stats operations
  async createPlayerStat(stat: InsertPlayerStat): Promise<PlayerStat> {
    const [newStat] = await db
      .insert(playerStats)
      .values(stat)
      .returning();
    return newStat;
  }

  async updatePlayerStat(playerId: number, matchId: number, stat: Partial<InsertPlayerStat>): Promise<void> {
    await db.update(playerStats)
      .set(stat)
      .where(and(eq(playerStats.playerId, playerId), eq(playerStats.matchId, matchId)));
  }

  async getPlayerStats(playerId: number): Promise<PlayerStat[]> {
    return await db.select().from(playerStats).where(eq(playerStats.playerId, playerId));
  }

  async getMatchPlayerStats(matchId: number): Promise<PlayerStat[]> {
    return await db.select().from(playerStats).where(eq(playerStats.matchId, matchId));
  }

  // Ball by ball operations
  async createBallByBall(ball: InsertBallByBall): Promise<BallByBall> {
    const [newBall] = await db
      .insert(ballByBall)
      .values(ball)
      .returning();
    return newBall;
  }

  async getMatchBalls(matchId: number): Promise<BallByBall[]> {
    return await db.select().from(ballByBall)
      .where(eq(ballByBall.matchId, matchId))
      .orderBy(asc(ballByBall.innings), asc(ballByBall.over), asc(ballByBall.ball));
  }

  async getLatestBall(matchId: number): Promise<BallByBall | undefined> {
    const [ball] = await db.select().from(ballByBall)
      .where(eq(ballByBall.matchId, matchId))
      .orderBy(desc(ballByBall.timestamp))
      .limit(1);
    return ball || undefined;
  }
}

export const storage = new DatabaseStorage();
