import { DbClient } from './db-client';

declare global {
  var dbClient: DbClient;
}

export {};
