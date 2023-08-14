export const createTodoTableQuery = `
CREATE TABLE IF NOT EXISTS todos(
    id INT NOT NULL,
    name VARCHAR(50) NOT NULL,
    description VARCHAR(200) NOT NULL,
    createdAt TIMESTAMP WITH TIME ZONE NOT NULL,
    updatedAt TIMESTAMP WITH TIME ZONE NOT NULL,
    done boolean NOT NULL,
    PRIMARY KEY (ID)
);
`;
