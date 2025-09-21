import { MongoClient, Db, Collection } from 'mongodb'

export interface StudyBlock {
  _id?: string
  user_id: string
  title: string
  description?: string | null
  start_time: Date
  end_time: Date
  status: 'scheduled' | 'active' | 'completed' | 'cancelled'
  notification_sent: boolean
  created_at: Date
  updated_at: Date
}

let client: MongoClient
let db: Db

if (!global._mongoClientPromise) {
  if (!process.env.MONGODB_URI) {
    throw new Error('Please add your MongoDB URI to .env.local')
  }

  client = new MongoClient(process.env.MONGODB_URI)
  global._mongoClientPromise = client.connect()
}

async function connectToDatabase() {
  try {
    const client = await global._mongoClientPromise
    
    // Extract database name from URI or use default
    const uri = process.env.MONGODB_URI!
    const dbName = uri.split('/')[3]?.split('?')[0] || 'quiet-hours-scheduler'
    
    db = client.db(dbName)
    console.log(` Connected to MongoDB database: ${dbName}`)
    
    return db
  } catch (error) {
    console.error(' MongoDB connection failed:', error)
    throw error
  }
}

export async function getStudyBlocksCollection(): Promise<Collection<StudyBlock>> {
  if (!db) {
    await connectToDatabase()
  }
  
  return db.collection<StudyBlock>('study_blocks')
}

// For TypeScript global augmentation
declare global {
  var _mongoClientPromise: Promise<MongoClient>
}
