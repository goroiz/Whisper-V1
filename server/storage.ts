import { db } from "./db.js";
import { posts, comments, siteRatings, postLikes, commentLikes, type Post, type InsertPost, type Comment, type InsertComment, type SiteRating, type InsertSiteRating, type PostLike, type InsertPostLike, type CommentLike, type InsertCommentLike } from "../shared/schema.js";
import { eq, desc, count, and } from "drizzle-orm";

export interface IStorage {
  getPosts(): Promise<Post[]>;
  getPost(id: number): Promise<Post | undefined>;
  createPost(post: InsertPost): Promise<Post>;
  getComments(postId: number): Promise<Comment[]>;
  createComment(comment: InsertComment): Promise<Comment>;
  
  // Site ratings
  getSiteRating(): Promise<{ averageRating: number; ratingCount: number }>;
  createSiteRating(rating: InsertSiteRating): Promise<SiteRating>;
  getUserSiteRating(userSession: string): Promise<SiteRating | undefined>;
  
  // Post likes
  likePost(postLike: InsertPostLike): Promise<PostLike>;
  unlikePost(postId: number, userSession: string): Promise<void>;
  getUserPostLike(postId: number, userSession: string): Promise<PostLike | undefined>;
  
  // Comment likes
  likeComment(commentLike: InsertCommentLike): Promise<CommentLike>;
  unlikeComment(commentId: number, userSession: string): Promise<void>;
  getUserCommentLike(commentId: number, userSession: string): Promise<CommentLike | undefined>;
}

export class DatabaseStorage implements IStorage {
  async getPosts(): Promise<Post[]> {
    return await db.select().from(posts).orderBy(desc(posts.createdAt));
  }

  async getPost(id: number): Promise<Post | undefined> {
    const [post] = await db.select().from(posts).where(eq(posts.id, id));
    return post;
  }

  async createPost(insertPost: InsertPost): Promise<Post> {
    const [post] = await db.insert(posts).values(insertPost).returning();
    return post;
  }

  async getComments(postId: number): Promise<Comment[]> {
    return await db.select().from(comments).where(eq(comments.postId, postId)).orderBy(desc(comments.createdAt));
  }

  async createComment(insertComment: InsertComment): Promise<Comment> {
    const [comment] = await db.insert(comments).values(insertComment).returning();
    return comment;
  }

  // Site rating methods
  async getSiteRating(): Promise<{ averageRating: number; ratingCount: number }> {
    const ratings = await db.select().from(siteRatings);
    if (ratings.length === 0) {
      return { averageRating: 0, ratingCount: 0 };
    }
    const totalRating = ratings.reduce((sum, r) => sum + r.rating, 0);
    const averageRating = Math.round((totalRating / ratings.length) * 20); // Convert to 0-100 scale
    return { averageRating, ratingCount: ratings.length };
  }

  async createSiteRating(insertSiteRating: InsertSiteRating): Promise<SiteRating> {
    const [rating] = await db.insert(siteRatings).values(insertSiteRating).returning();
    return rating;
  }

  async getUserSiteRating(userSession: string): Promise<SiteRating | undefined> {
    const [rating] = await db.select().from(siteRatings).where(eq(siteRatings.userSession, userSession));
    return rating;
  }

  // Post like methods
  async likePost(insertPostLike: InsertPostLike): Promise<PostLike> {
    const [like] = await db.insert(postLikes).values(insertPostLike).returning();
    
    // Update post likes count
    const likesCount = await db.select({ count: count() }).from(postLikes).where(eq(postLikes.postId, insertPostLike.postId));
    await db.update(posts)
      .set({ likesCount: likesCount[0]?.count || 0 })
      .where(eq(posts.id, insertPostLike.postId));
    
    return like;
  }

  async unlikePost(postId: number, userSession: string): Promise<void> {
    await db.delete(postLikes)
      .where(and(eq(postLikes.postId, postId), eq(postLikes.userSession, userSession)));
    
    // Update post likes count
    const likesCount = await db.select({ count: count() }).from(postLikes).where(eq(postLikes.postId, postId));
    await db.update(posts)
      .set({ likesCount: likesCount[0]?.count || 0 })
      .where(eq(posts.id, postId));
  }

  async getUserPostLike(postId: number, userSession: string): Promise<PostLike | undefined> {
    const [like] = await db.select().from(postLikes)
      .where(and(eq(postLikes.postId, postId), eq(postLikes.userSession, userSession)));
    return like;
  }

  // Comment like methods
  async likeComment(insertCommentLike: InsertCommentLike): Promise<CommentLike> {
    const [like] = await db.insert(commentLikes).values(insertCommentLike).returning();
    
    // Update comment likes count
    const likesCount = await db.select({ count: count() }).from(commentLikes).where(eq(commentLikes.commentId, insertCommentLike.commentId));
    await db.update(comments)
      .set({ likesCount: likesCount[0]?.count || 0 })
      .where(eq(comments.id, insertCommentLike.commentId));
    
    return like;
  }

  async unlikeComment(commentId: number, userSession: string): Promise<void> {
    await db.delete(commentLikes)
      .where(and(eq(commentLikes.commentId, commentId), eq(commentLikes.userSession, userSession)));
    
    // Update comment likes count
    const likesCount = await db.select({ count: count() }).from(commentLikes).where(eq(commentLikes.commentId, commentId));
    await db.update(comments)
      .set({ likesCount: likesCount[0]?.count || 0 })
      .where(eq(comments.id, commentId));
  }

  async getUserCommentLike(commentId: number, userSession: string): Promise<CommentLike | undefined> {
    const [like] = await db.select().from(commentLikes)
      .where(and(eq(commentLikes.commentId, commentId), eq(commentLikes.userSession, userSession)));
    return like;
  }
}

export const storage = new DatabaseStorage();
