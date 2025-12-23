import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage.js";
import { api } from "../shared/routes.js";
import { z } from "zod";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  app.get(api.posts.list.path, async (req, res) => {
    const posts = await storage.getPosts();
    res.json(posts);
  });

  app.post(api.posts.create.path, async (req, res) => {
    try {
      const input = api.posts.create.input.parse(req.body);
      const post = await storage.createPost(input);
      res.status(201).json(post);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      }
      throw err;
    }
  });

  app.get(api.posts.get.path, async (req, res) => {
    const post = await storage.getPost(Number(req.params.id));
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }
    res.json(post);
  });

  app.get(api.comments.list.path, async (req, res) => {
    const comments = await storage.getComments(Number(req.params.postId));
    res.json(comments);
  });

  app.post(api.comments.create.path, async (req, res) => {
    try {
      const input = api.comments.create.input.parse(req.body);
      const postId = Number(req.params.postId);
      
      const comment = await storage.createComment({
        ...input,
        postId
      });
      res.status(201).json(comment);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      }
      throw err;
    }
  });

  app.get(api.siteRating.get.path, async (req, res) => {
    const rating = await storage.getSiteRating();
    res.json(rating);
  });

  app.post(api.siteRating.create.path, async (req, res) => {
    try {
      const input = api.siteRating.create.input.parse(req.body);
      
      // Get user session from localStorage (passed from client)
      let userSession = req.headers['x-user-session'] as string;
      if (!userSession) {
        userSession = `session-${Date.now()}-${Math.random()}`;
      }
      
      // Check if user already rated
      const existingRating = await storage.getUserSiteRating(userSession);
      
      const rating = await storage.createSiteRating({
        ...input,
        userSession,
      });
      res.status(201).json(rating);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      }
      throw err;
    }
  });

  app.post(api.postLikes.create.path, async (req, res) => {
    try {
      const postId = Number(req.params.postId);
      let userSession = req.headers['x-user-session'] as string;
      if (!userSession) {
        userSession = `session-${Date.now()}-${Math.random()}`;
      }
      
      const like = await storage.likePost({
        postId,
        userSession,
      });
      res.status(201).json(like);
    } catch (err) {
      throw err;
    }
  });

  app.delete(api.postLikes.delete.path, async (req, res) => {
    try {
      const postId = Number(req.params.postId);
      let userSession = req.headers['x-user-session'] as string;
      if (!userSession) {
        return res.status(400).json({ message: 'User session required' });
      }
      
      await storage.unlikePost(postId, userSession);
      res.json({ success: true });
    } catch (err) {
      throw err;
    }
  });

  app.post(api.commentLikes.create.path, async (req, res) => {
    try {
      const commentId = Number(req.params.commentId);
      let userSession = req.headers['x-user-session'] as string;
      if (!userSession) {
        userSession = `session-${Date.now()}-${Math.random()}`;
      }
      
      const like = await storage.likeComment({
        commentId,
        userSession,
      });
      res.status(201).json(like);
    } catch (err) {
      throw err;
    }
  });

  app.delete(api.commentLikes.delete.path, async (req, res) => {
    try {
      const commentId = Number(req.params.commentId);
      let userSession = req.headers['x-user-session'] as string;
      if (!userSession) {
        return res.status(400).json({ message: 'User session required' });
      }
      
      await storage.unlikeComment(commentId, userSession);
      res.json({ success: true });
    } catch (err) {
      throw err;
    }
  });

  return httpServer;
}
