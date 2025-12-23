import { pgTable, text, serial, timestamp, integer, varchar } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

export const posts = pgTable("posts", {
  id: serial("id").primaryKey(),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  likesCount: integer("likes_count").default(0),
});

export const comments = pgTable("comments", {
  id: serial("id").primaryKey(),
  postId: integer("post_id").notNull(),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  likesCount: integer("likes_count").default(0),
});

export const siteRatings = pgTable("site_ratings", {
  id: serial("id").primaryKey(),
  rating: integer("rating").notNull(),
  userSession: text("user_session").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const postLikes = pgTable("post_likes", {
  id: serial("id").primaryKey(),
  postId: integer("post_id").notNull(),
  userSession: text("user_session").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const commentLikes = pgTable("comment_likes", {
  id: serial("id").primaryKey(),
  commentId: integer("comment_id").notNull(),
  userSession: text("user_session").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const postsRelations = relations(posts, ({ many }) => ({
  comments: many(comments),
  postLikes: many(postLikes),
}));

export const commentsRelations = relations(comments, ({ one, many }) => ({
  post: one(posts, {
    fields: [comments.postId],
    references: [posts.id],
  }),
  commentLikes: many(commentLikes),
}));

export const postLikesRelations = relations(postLikes, ({ one }) => ({
  post: one(posts, {
    fields: [postLikes.postId],
    references: [posts.id],
  }),
}));

export const commentLikesRelations = relations(commentLikes, ({ one }) => ({
  comment: one(comments, {
    fields: [commentLikes.commentId],
    references: [comments.id],
  }),
}));

export const insertPostSchema = createInsertSchema(posts).pick({
  content: true,
});

export const insertCommentSchema = createInsertSchema(comments).pick({
  content: true,
  postId: true,
});

export const insertSiteRatingSchema = createInsertSchema(siteRatings).pick({
  rating: true,
  userSession: true,
});

export const insertPostLikeSchema = createInsertSchema(postLikes).pick({
  postId: true,
  userSession: true,
});

export const insertCommentLikeSchema = createInsertSchema(commentLikes).pick({
  commentId: true,
  userSession: true,
});

export type Post = typeof posts.$inferSelect;
export type InsertPost = z.infer<typeof insertPostSchema>;
export type Comment = typeof comments.$inferSelect;
export type InsertComment = z.infer<typeof insertCommentSchema>;
export type SiteRating = typeof siteRatings.$inferSelect;
export type InsertSiteRating = z.infer<typeof insertSiteRatingSchema>;
export type PostLike = typeof postLikes.$inferSelect;
export type InsertPostLike = z.infer<typeof insertPostLikeSchema>;
export type CommentLike = typeof commentLikes.$inferSelect;
export type InsertCommentLike = z.infer<typeof insertCommentLikeSchema>;
