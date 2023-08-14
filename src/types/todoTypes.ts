import { z } from "zod";

export const TodoParser = z.object({
  name: z.string().min(3).max(50),
  description: z.string().min(1).max(200).optional(),
  done: z.boolean().optional(),
});

export type Todo = z.infer<typeof TodoParser>;

export const CreateRequestParser = TodoParser;

export type CreateRequest = z.infer<typeof CreateRequestParser>;

export type CreateResponse = {
  id: string;
};

export const UpdateItemRequestParser = z.object({
  id: z.string().min(10).max(100), // TODO: more precise scoping
  done: z.boolean(),
});

export type UpdateItemRequest = z.infer<typeof UpdateItemRequestParser>;

export const UpdateRequestParser = z.object({
  items: z.array(UpdateItemRequestParser).min(1).max(100),
});

export type UpdateRequest = z.infer<typeof UpdateRequestParser>;

export type UpdateRespone = boolean;

export const QueryRequestParser = z.object({
  limit: z.number().min(1).max(100).optional(),
  cursor: z.string().optional(),
  done: z.boolean().optional(),
});

export type QueryRequest = z.infer<typeof QueryRequestParser>;

export type QueryResponse = {
  items: Todo[];
  cursor: string | undefined;
};
