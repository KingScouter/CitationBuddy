import { DbClient } from './db-client';

declare global {
  var client: DbClient;
}

export {};
