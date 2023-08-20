# todos

This an app which serves both as a 'our' Todo app and external Todo app. Throughout the codebase I've referred to them as `internal` and `external` respectively. Both apps use 2 different PostgreSQL instances defined in `.env.local` and `.env.external` files. The databses defined there are free tier of ElephantSQL service.

The sync process between the 2 services is as follows:

- When a new todo gets created in `external` service it also gets created in `internal` service
- When a todo gets updated in `external` service it also gets updated in `internal` service
- When a todo gets updated in `internal` service it also gets updated in `external` service
- The old data in `external` service does NOT get synced with `internal` service.

API definitions (same for both services)

type Todo = {
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

- http://localhost:${PORT}/api/v1/todos/create

* Request body {
  name: string().min(3).max(50),
  description: string().min(1).max(200).optional(),
  groupId: number().int().nonnegative(),
  done: boolean().optional(),
  }

* Response body {
  item: Todo
  }

- http://localhost:${PORT}/api/v1/todos/webhook/create

* Request body {
  name: string().min(3).max(50),
  description: string().min(1).max(200).optional(),
  done: boolean().optional(),
  external: boolean(),
  externalId: number().int().positive(),
  }

* Response body {
  items: Todo
  }

- http://localhost:${PORT}/api/v1/todos/update

* Request body {
  items: {
  id: number().positive(),
  done: z.boolean(),
  }[]
  }

* Response body {
  items: Todo[]
  }

- http://localhost:${PORT}/api/v1/todos/webhook/update

* Request body {
  items: {
  externalId: number().positive(),
  done: z.boolean(),
  }[]
  }

* Response body {
  items: Todo[]
  }

- http://localhost:${PORT}/api/v1/todos/query

* Request body {
  limit: number().min(1).max(100).optional(),
  cursor: number().int().positive().optional(),
  done: boolean().optional(),
  groupId: number().int().positive().optional(),
  }

* Response body:
  {
  items: Todo[];
  cursor: number | undefined;
  }

To start the `internal` service simple run

- yarn
- yarn start:local

To start the `external` service simple run

- yarn
- yarn start:external
