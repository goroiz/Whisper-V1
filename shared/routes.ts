import { z } from 'zod';
import { insertPostSchema, insertCommentSchema, insertSiteRatingSchema, insertPostLikeSchema, insertCommentLikeSchema, posts, comments, siteRatings, postLikes, commentLikes } from './schema.js';

export const errorSchemas = {
  validation: z.object({
    message: z.string(),
    field: z.string().optional(),
  }),
  notFound: z.object({
    message: z.string(),
  }),
  internal: z.object({
    message: z.string(),
  }),
};

export const api = {
  posts: {
    list: {
      method: 'GET' as const,
      path: '/api/posts',
      responses: {
        200: z.array(z.custom<typeof posts.$inferSelect>()),
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/posts',
      input: insertPostSchema,
      responses: {
        201: z.custom<typeof posts.$inferSelect>(),
        400: errorSchemas.validation,
      },
    },
    get: {
      method: 'GET' as const,
      path: '/api/posts/:id',
      responses: {
        200: z.custom<typeof posts.$inferSelect>(),
        404: errorSchemas.notFound,
      },
    },
  },
  comments: {
    list: {
      method: 'GET' as const,
      path: '/api/posts/:postId/comments',
      responses: {
        200: z.array(z.custom<typeof comments.$inferSelect>()),
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/posts/:postId/comments',
      input: insertCommentSchema.omit({ postId: true }),
      responses: {
        201: z.custom<typeof comments.$inferSelect>(),
        400: errorSchemas.validation,
        404: errorSchemas.notFound,
      },
    },
  },
  siteRating: {
    get: {
      method: 'GET' as const,
      path: '/api/site-rating',
      responses: {
        200: z.object({
          averageRating: z.number(),
          ratingCount: z.number(),
        }),
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/site-rating',
      input: insertSiteRatingSchema.omit({ userSession: true }),
      responses: {
        201: z.custom<typeof siteRatings.$inferSelect>(),
        400: errorSchemas.validation,
      },
    },
  },
  postLikes: {
    create: {
      method: 'POST' as const,
      path: '/api/posts/:postId/like',
      input: z.object({}),
      responses: {
        201: z.custom<typeof postLikes.$inferSelect>(),
        400: errorSchemas.validation,
      },
    },
    delete: {
      method: 'DELETE' as const,
      path: '/api/posts/:postId/like',
      responses: {
        200: z.object({ success: z.boolean() }),
        400: errorSchemas.validation,
      },
    },
  },
  commentLikes: {
    create: {
      method: 'POST' as const,
      path: '/api/comments/:commentId/like',
      input: z.object({}),
      responses: {
        201: z.custom<typeof commentLikes.$inferSelect>(),
        400: errorSchemas.validation,
      },
    },
    delete: {
      method: 'DELETE' as const,
      path: '/api/comments/:commentId/like',
      responses: {
        200: z.object({ success: z.boolean() }),
        400: errorSchemas.validation,
      },
    },
  },
};

export function buildUrl(path: string, params?: Record<string, string | number>): string {
  let url = path;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (url.includes(`:${key}`)) {
        url = url.replace(`:${key}`, String(value));
      }
    });
  }
  return url;
}
