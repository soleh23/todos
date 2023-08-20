// NOTE: in production environment groupId would be a foreign key to 'groups' table,
// I decided to omit creating 'groups' table for simplicity.
// Also in production environment I would use sql migrations technologies to manage database schema.
export const createTodoTableQuery = `
CREATE TABLE IF NOT EXISTS todos(
    id SERIAL,
    name VARCHAR(50) NOT NULL,
    description VARCHAR(200),
    group_id INT NOT NULL,
    done boolean NOT NULL,
    external boolean NOT NULL,
    external_id INTEGER,
    created_at BIGINT NOT NULL,
    updated_at BIGINT NOT NULL,
    PRIMARY KEY (ID),
    UNIQUE (external_id)
);
`;
