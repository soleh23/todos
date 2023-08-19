import { z } from "zod";

export const CreateRequestParser = z.object({
  name: z.string().min(3).max(50),
  description: z.string().min(1).max(200).optional(),
  groupId: z.number().int().positive(),
  done: z.boolean().optional(), // TODO: potentially support more general 'status' field
});

export type CreateRequest = z.infer<typeof CreateRequestParser>;

export type CreateResponse = {
  id: number;
};

export const UpdateItemRequestParser = z.object({
  id: z.number(),
  done: z.boolean(),
});

export type UpdateItemRequest = z.infer<typeof UpdateItemRequestParser>;

export const UpdateRequestParser = z.object({
  items: z.array(UpdateItemRequestParser).min(1).max(100),
});

export type UpdateRequest = z.infer<typeof UpdateRequestParser>;

export type UpdateRespone = {};

export type Todo = {
  id: number;
  name: string;
  description?: string;
  groupId: number;
  done: boolean;
  createdAt: number;
  updatedAt: number;
};

export const QueryRequestParser = z.object({
  limit: z.number().min(1).max(100).optional(),
  cursor: z.number().int().positive().optional(),
  done: z.boolean().optional(),
  groupId: z.number().int().positive().optional(),
});

export type QueryRequest = z.infer<typeof QueryRequestParser>;

export type QueryResponse = {
  items: Todo[];
  cursor: number | undefined;
};
