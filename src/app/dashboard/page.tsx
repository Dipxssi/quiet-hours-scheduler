import { createClient } from '@/utils/supabase/server'
import { getStudyBlocksCollection } from '@/lib/mongodb'
import Link from 'next/link'
import StudyBlockCard from './components/StudyBlockCard'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return <div>Not authenticated</div>
  }

  // Fetch user's study blocks from MongoDB
  const collection = await getStudyBlocksCollection()
  const studyBlocks = await collection
    .find({ user_id: user.id })
    .sort({ start_time: 1 })
    .toArray()

  // Convert MongoDB documents for client components
  const blocksData = studyBlocks.map(block => ({
    ...block,
    _id: block._id.toString(),
    start_time: block.start_time.toISOString(),
    end_time: block.end_time.toISOString(),
    created_at: block.created_at.toISOString(),
    updated_at: block.updated_at.toISOString(),
  }))

  const now = new Date()
  const upcomingBlocks = blocksData.filter(block => new Date(block.start_time) > now)
  const pastBlocks = blocksData.filter(block => new Date(block.end_time) <= now)
  const activeBlocks = blocksData.filter(block => 
    new Date(block.start_time) <= now && new Date(block.end_time) > now
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Welcome back, {user.email?.split('@')[0]}!
            </h1>
            <p className="mt-1 text-gray-500">
              Manage your focused study sessions
            </p>
          </div>
          <Link
            href="/dashboard/create"
            className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition-colors"
          >
            Schedule New Session
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-indigo-500 rounded-md flex items-center justify-center">
                  <span className="text-white font-bold">{activeBlocks.length}</span>
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Active Now
                  </dt>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-blue-500 rounded-md flex items-center justify-center">
                  <span className="text-white font-bold">{upcomingBlocks.length}</span>
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Upcoming
                  </dt>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-green-500 rounded-md flex items-center justify-center">
                  <span className="text-white font-bold">{pastBlocks.length}</span>
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Completed
                  </dt>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-gray-500 rounded-md flex items-center justify-center">
                  <span className="text-white font-bold">{blocksData.length}</span>
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Total Sessions
                  </dt>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Active Sessions */}
      {activeBlocks.length > 0 && (
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">🟢 Active Sessions</h2>
          <div className="grid gap-4">
            {activeBlocks.map((block) => (
              <StudyBlockCard key={block._id} block={block} status="active" />
            ))}
          </div>
        </div>
      )}

      {/* Upcoming Sessions */}
      {upcomingBlocks.length > 0 ? (
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">📅 Upcoming Sessions</h2>
          <div className="grid gap-4">
            {upcomingBlocks.slice(0, 5).map((block) => (
              <StudyBlockCard key={block._id} block={block} status="upcoming" />
            ))}
          </div>
          {upcomingBlocks.length > 5 && (
            <p className="mt-4 text-sm text-gray-500">
              And {upcomingBlocks.length - 5} more upcoming sessions...
            </p>
          )}
        </div>
      ) : (
        <div className="bg-white shadow rounded-lg p-6">
          <div className="text-center py-12">
            <h3 className="mt-2 text-sm font-medium text-gray-900">No study sessions scheduled</h3>
            <p className="mt-1 text-sm text-gray-500">
              Get started by scheduling your first focused study session.
            </p>
            <div className="mt-6">
              <Link
                href="/dashboard/create"
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
              >
                Schedule Your First Session
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Recent Completed Sessions */}
      {pastBlocks.length > 0 && (
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">✅ Recently Completed</h2>
          <div className="grid gap-4">
            {pastBlocks.slice(-3).reverse().map((block) => (
              <StudyBlockCard key={block._id} block={block} status="completed" />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
