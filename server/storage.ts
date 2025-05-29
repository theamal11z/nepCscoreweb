import { 
  users, teams, players, matches, matchScores, playerStats, ballByBall,
  teamFollows, playerFollows,
  type User, type InsertUser, type Team, type InsertTeam, 
  type Player, type InsertPlayer, type Match, type InsertMatch,
  type MatchScore, type InsertMatchScore, type PlayerStat, type InsertPlayerStat,
  type BallByBall, type InsertBallByBall, type TeamFollow, type InsertTeamFollow,
  type PlayerFollow, type InsertPlayerFollow
} from "@shared/schema";
import { db } from "./db";
import { eq, and, desc, asc, count, isNull } from "drizzle-orm";
import session from "express-session";
import connectPg from "connect-pg-simple";
import { pool } from "./db";

const PostgresSessionStore = connectPg(session);

export interface IStorage {
  sessionStore: any; // Using 'any' type as express-session doesn't export SessionStore directly // Update type annotation
  
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUserApproval(id: number, isApproved: boolean): Promise<void>;
  updateUserRole(id: number, role: string): Promise<void>;
  updateUserProfile(id: number, profileData: { fullName?: string; email?: string; phone?: string; bio?: string }): Promise<void>;
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
  getPlayersWithoutTeam(): Promise<Player[]>;

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
  
  // Fan operations - Team Following
  followTeam(userId: number, teamId: number): Promise<TeamFollow>;
  unfollowTeam(userId: number, teamId: number): Promise<void>;
  getFollowedTeams(userId: number): Promise<Team[]>;
  getTeamFollowStatus(userId: number, teamId: number): Promise<boolean>;
  getTeamFollowerCount(teamId: number): Promise<number>;
  
  // Fan operations - Player Following
  followPlayer(userId: number, playerId: number): Promise<PlayerFollow>;
  unfollowPlayer(userId: number, playerId: number): Promise<void>;
  getFollowedPlayers(userId: number): Promise<Player[]>;
  getPlayerFollowStatus(userId: number, playerId: number): Promise<boolean>;
  getPlayerFollowerCount(playerId: number): Promise<number>;
}

export class DatabaseStorage implements IStorage {
  sessionStore: any; // Using 'any' type as express-session doesn't export SessionStore directly // Update type annotation

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

  async updateUserProfile(id: number, profileData: { fullName?: string; email?: string; phone?: string; bio?: string }): Promise<void> {
    // Extract the fields we want to update
    const { fullName, email } = profileData;
    
    // Create update object with only defined fields
    const updateData: any = {};
    if (fullName !== undefined) updateData.fullName = fullName;
    if (email !== undefined) updateData.email = email;
    
    // We need to add columns for phone and bio in the users table
    // For now, we'll just update the fields that already exist
    
    // Perform the update
    await db
      .update(users)
      .set(updateData)
      .where(eq(users.id, id));
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

  async getPlayersWithoutTeam(): Promise<Player[]> {
    return await db
      .select()
      .from(players)
      .where(isNull(players.teamId));
  }

  async getPendingPlayers(): Promise<Player[]> {
    return await db.select().from(players).where(eq(players.isApproved, false)).orderBy(desc(players.createdAt));
  }

  // Match operations
  async createMatch(matchData: InsertMatch & { organizerId: number }): Promise<Match> {
    try {
      // Create a new object with the correct data types
      const match = {
        ...matchData,
        // Convert string date to Date object
        matchDate: new Date(matchData.matchDate)
      };
      
      console.log('Storage: Creating match with data:', match);
      
      const [newMatch] = await db
        .insert(matches)
        .values(match)
        .returning();
        
      console.log('Storage: Match created successfully');
      return newMatch;
    } catch (error) {
      console.error('Storage: Error creating match:', error);
      throw error;
    }
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
  async createPlayerStat(stat: {
    matchId: number;
    playerId: number;
    runs?: number;
    ballsFaced?: number;
    fours?: number;
    sixes?: number;
    wicketsTaken?: number;
    oversBowled?: string;
    runsConceded?: number;
    catches?: number;
    stumps?: number;
    runOuts?: number;
  }): Promise<PlayerStat> {
    // Validate that required fields are present
    if (!stat.matchId || !stat.playerId) {
      throw new Error('matchId and playerId are required for player stats');
    }
    
    // Create a properly typed object with required fields
    const playerStat = {
      matchId: stat.matchId,
      playerId: stat.playerId,
      runs: stat.runs ?? 0,
      ballsFaced: stat.ballsFaced ?? 0,
      fours: stat.fours ?? 0,
      sixes: stat.sixes ?? 0,
      wicketsTaken: stat.wicketsTaken ?? 0,
      oversBowled: stat.oversBowled ?? '0.0',
      runsConceded: stat.runsConceded ?? 0,
      catches: stat.catches ?? 0,
      stumps: stat.stumps ?? 0,
      runOuts: stat.runOuts ?? 0
    };
    
    const [newStat] = await db
      .insert(playerStats)
      .values(playerStat)
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
    return await db.select().from(ballByBall).where(eq(ballByBall.matchId, matchId));  
  }
  
  async getLatestBall(matchId: number): Promise<BallByBall | undefined> {
    const [ball] = await db
      .select()
      .from(ballByBall)
      .where(eq(ballByBall.matchId, matchId))
      .orderBy(desc(ballByBall.timestamp))
      .limit(1);
    return ball || undefined;
  }

  // Fan operations - Team Following
  async followTeam(userId: number, teamId: number): Promise<TeamFollow> {
    try {
      const [follow] = await db.insert(teamFollows).values({ userId, teamId }).returning();
      return follow;
    } catch (error: any) {
      // Check if it's a duplicate entry error (PostgreSQL duplicate key error)
      if (error.code === '23505') {
        const [existingFollow] = await db.select().from(teamFollows).where(
          and(eq(teamFollows.userId, userId), eq(teamFollows.teamId, teamId))
        );
        if (existingFollow) {
          return existingFollow;
        }
      }
      // Re-throw other errors
      throw error;
    }
  }

  async unfollowTeam(userId: number, teamId: number): Promise<void> {
    await db
      .delete(teamFollows)
      .where(
        and(
          eq(teamFollows.userId, userId),
          eq(teamFollows.teamId, teamId)
        )
      );
  }

  async getFollowedTeams(userId: number): Promise<any[]> {
    const results = await db
      .select()
      .from(teamFollows)
      .innerJoin(teams, eq(teamFollows.teamId, teams.id))
      .where(eq(teamFollows.userId, userId))
      .orderBy(desc(teamFollows.id));
    
    // Get the follower count for each team
    const teamsWithMetadata = await Promise.all(
      results.map(async (row) => {
        const followerCount = await this.getTeamFollowerCount(row.teams.id);
        return {
          ...row.teams,
          followerCount
        };
      })
    );
    
    return teamsWithMetadata;
  }

  async getTeamFollowStatus(userId: number, teamId: number): Promise<boolean> {
    const [follow] = await db
      .select()
      .from(teamFollows)
      .where(
        and(
          eq(teamFollows.userId, userId),
          eq(teamFollows.teamId, teamId)
        )
      );
    return !!follow;
  }

  async getTeamFollowerCount(teamId: number): Promise<number> {
    const [result] = await db
      .select({
        count: count()
      })
      .from(teamFollows)
      .where(eq(teamFollows.teamId, teamId));
    return result?.count || 0;
  }
  
  // Fan operations - Player Following
  async followPlayer(userId: number, playerId: number): Promise<PlayerFollow> {
    try {
      const [follow] = await db.insert(playerFollows).values({ userId, playerId }).returning();
      return follow;
    } catch (error: any) {
      // Check if it's a duplicate entry error (PostgreSQL duplicate key error)
      if (error.code === '23505') {
        const [existingFollow] = await db.select().from(playerFollows).where(
          and(eq(playerFollows.userId, userId), eq(playerFollows.playerId, playerId))
        );
        if (existingFollow) {
          return existingFollow;
        }
      }
      // Re-throw other errors
      throw error;
    }
  }

  async unfollowPlayer(userId: number, playerId: number): Promise<void> {
    await db
      .delete(playerFollows)
      .where(
        and(
          eq(playerFollows.userId, userId),
          eq(playerFollows.playerId, playerId)
        )
      );
  }

  async getFollowedPlayers(userId: number): Promise<any[]> {
    const results = await db
      .select()
      .from(playerFollows)
      .innerJoin(players, eq(playerFollows.playerId, players.id))
      .innerJoin(users, eq(players.userId, users.id))
      .leftJoin(teams, eq(players.teamId, teams.id))
      .where(eq(playerFollows.userId, userId));
    
    return results.map(row => ({
      ...row.players,
      fullName: row.users.fullName,
      teamName: row.teams?.name
    }));
  }

  async getPlayerFollowStatus(userId: number, playerId: number): Promise<boolean> {
    const [follow] = await db
      .select()
      .from(playerFollows)
      .where(
        and(
          eq(playerFollows.userId, userId),
          eq(playerFollows.playerId, playerId)
        )
      );
    return !!follow;
  }

  async getPlayerFollowerCount(playerId: number): Promise<number> {
    const [result] = await db
      .select({
        count: count()
      })
      .from(playerFollows)
      .where(eq(playerFollows.playerId, playerId));
    return result?.count || 0;
  }
}

export const storage = new DatabaseStorage();
