import { db } from "./db.js";
import { posts, comments, ratings, type Post, type InsertPost, type Comment, type InsertComment, type Rating, type InsertRating } from "../shared/schema.js";
import { eq, desc, avg } from "drizzle-orm";

export interface IStorage {
  getPosts(): Promise<Post[]>;
  getPost(id: number): Promise<Post | undefined>;
  createPost(post: InsertPost): Promise<Post>;
  getComments(postId: number): Promise<Comment[]>;
  createComment(comment: InsertComment): Promise<Comment>;
  createRating(rating: InsertRating): Promise<Rating>;
  getUserRating(postId: number, userSession: string): Promise<Rating | undefined>;
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

  async createRating(insertRating: InsertRating): Promise<Rating> {
    const [rating] = await db.insert(ratings).values(insertRating).returning();
    
    // Update post average rating and count
    const postRatings = await db.select().from(ratings).where(eq(ratings.postId, insertRating.postId));
    const totalRating = postRatings.reduce((sum, r) => sum + r.rating, 0);
    const avgRating = Math.round((totalRating / postRatings.length) * 20); // Convert to 0-100 scale
    
    await db.update(posts)
      .set({
        averageRating: avgRating,
        ratingCount: postRatings.length,
      })
      .where(eq(posts.id, insertRating.postId));
    
    return rating;
  }

  async getUserRating(postId: number, userSession: string): Promise<Rating | undefined> {
    const [rating] = await db.select().from(ratings)
      .where(eq(ratings.postId, postId) && eq(ratings.userSession, userSession));
    return rating;
  }
}

export const storage = new DatabaseStorage();
