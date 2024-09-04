import { Knex } from "knex";

const config: { [key: string]: Knex.Config } = {
  development: {
    client: 'mssql',
    connection: {
      host: 'localhost',
      user: 'sa',
      password: 'test',
      database: 'master',
    },
  },

  staging: {
    client: 'mssql',
    connection: {
      host: 'localhost',
      user: 'sa',
      password: 'test',
      database: 'master',
    },
    pool: {
      min: 2,
      max: 10,
    },
    migrations: {
      tableName: 'knex_migrations',
    },
  },

  production: {
    client: 'mssql',
    connection: {
      host: 'localhost',
      user: 'sa',
      password: 'test',
      database: 'master',
    },
    pool: {
      min: 2,
      max: 10,
    },
    migrations: {
      tableName: 'knex_migrations',
    },
  },
};

export default config;