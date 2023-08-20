import { z } from "zod";

export const CreateRequestParser = z.object({
  name: z.string().min(3).max(50),
  description: z.string().min(1).max(200).optional(),
  groupId: z.number().int().nonnegative(),
  done: z.boolean().optional(), // TODO: support more general 'status' field
  external: z.boolean().optional(), // TODO: support more general 'external' field
  externalId: z.number().int().positive().optional(),
});

export type CreateRequest = z.infer<typeof CreateRequestParser>;

export type CreateResponse = {
  item: Todo;
};

export const UpdateItemRequestParser = z.object({
  id: z.number().positive().optional(),
  externalId: z.number().positive().optional(),
  done: z.boolean(),
});

export type UpdateItemRequest = z.infer<typeof UpdateItemRequestParser>;

export const UpdateRequestParser = z.object({
  items: z.array(UpdateItemRequestParser).min(1).max(10),
  ignoreUnknownItems: z.boolean().optional(),
});

export type UpdateRequest = z.infer<typeof UpdateRequestParser>;

export type UpdateRespone = {
  items: Todo[];
};

export type Todo = {
  id: number;
  name: string;
  description?: string;
  groupId: number;
  done: boolean;
  external: boolean;
  externalId?: number;
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
