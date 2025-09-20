import { MongoClient, Db, Collection, ObjectId } from 'mongodb'

if (!process.env.MONGODB_URI) {
  throw new Error('Invalid/Missing environment variable: "MONGODB_URI"')
}

const uri = process.env.MONGODB_URI
const options = {}

let client: MongoClient
let clientPromise: Promise<MongoClient>

if (process.env.NODE_ENV === 'development') {
  let globalWithMongo = global as typeof globalThis & {
    _mongoClientPromise?: Promise<MongoClient>
  }

  if (!globalWithMongo._mongoClientPromise) {
    client = new MongoClient(uri, options)
    globalWithMongo._mongoClientPromise = client.connect()
  }
  clientPromise = globalWithMongo._mongoClientPromise
} else {
  client = new MongoClient(uri, options)
  clientPromise = client.connect()
}

export default clientPromise

export interface StudyBlock {
  _id?: ObjectId
  user_id: string
  title: string
  description?: string
  start_time: Date
  end_time: Date
  created_at: Date
  updated_at: Date
  notification_sent: boolean
  status: 'scheduled' | 'active' | 'completed' | 'cancelled'
}

export async function getDatabase(): Promise<Db> {
  const client = await clientPromise
  return client.db('quiet-hours')
}

export async function getStudyBlocksCollection(): Promise<Collection<StudyBlock>> {
  const db = await getDatabase()
  return db.collection<StudyBlock>('study_blocks')
}
