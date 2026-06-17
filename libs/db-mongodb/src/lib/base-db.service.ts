import { Collection, Document } from 'mongodb';

export abstract class BaseDbService<T extends Document> {
  protected abstract readonly collectionName: string;

  get collection(): Collection<T> {
    return global.dbClient.db.collection<T>(this.collectionName);
  }
}
