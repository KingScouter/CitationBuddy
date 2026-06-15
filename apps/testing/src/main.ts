import { MongoClient } from 'mongodb';

interface Post {
  title: string;
  body: string;
  category: string;
  likes: number;
  tags: string[];
  date: Date;
}

const uri = process.env.MONGODB_CONN_STRING ?? '';
const client = new MongoClient(uri);

async function runMain(): Promise<void> {
  try {
    await client.connect();

    const db = client.db('blog');
    const collection = db.collection<Post>('posts');

    const posts = await collection.find().toArray();
    console.log('Posts: ', posts);

    for (const post of posts) {
      console.log(
        `Post:\n\t- Title: ${post.title}\n\t- Likes: ${post.likes}\n\t- Date: ${post.date}`
      );
    }
  } catch (ex) {
    console.error('Error during application', ex);
  } finally {
    await client.close();
  }
}

runMain();
