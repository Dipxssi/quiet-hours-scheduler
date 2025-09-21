'use client'

import { format } from 'date-fns'
import Link from 'next/link'

interface StudyBlock {
  _id: string
  title: string
  description?: string
  start_time: string
  end_time: string
  notification_sent: boolean
  status: string
}

interface StudyBlockCardProps {
  block: StudyBlock
  status: 'active' | 'upcoming' | 'completed'
}

export default function StudyBlockCard({ block, status }: StudyBlockCardProps) {
  const startTime = new Date(block.start_time)
  const endTime = new Date(block.end_time)
  const duration = Math.round((endTime.getTime() - startTime.getTime()) / (1000 * 60)) // minutes

  const statusColors = {
    active: 'bg-green-100 text-green-800 border-green-200',
    upcoming: 'bg-blue-100 text-blue-800 border-blue-200',
    completed: 'bg-gray-100 text-gray-800 border-gray-200',
  }

  const statusIcons = {
    active: '🟢',
    upcoming: '⏰',
    completed: '✅',
  }

  return (
    <div className={`border rounded-lg p-4 ${statusColors[status]}`}>
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-lg">{statusIcons[status]}</span>
            <h3 className="font-medium text-gray-900">{block.title}</h3>
            <span className="text-xs px-2 py-1 bg-white rounded-full">
              {duration} min
            </span>
          </div>
          
          {block.description && (
            <p className="text-sm text-gray-600 mb-2">{block.description}</p>
          )}
          
          <div className="flex items-center gap-4 text-sm text-gray-600">
            <span>
              📅 {format(startTime, 'MMM dd, yyyy')}
            </span>
            <span>
              🕐 {format(startTime, 'h:mm a')} - {format(endTime, 'h:mm a')}
            </span>
            {block.notification_sent && (
              <span className="text-green-600">✉️ Reminder sent</span>
            )}
          </div>
        </div>
        
        {status !== 'completed' && (
          <div className="ml-4">
            <Link
              href={`/dashboard/edit/${block._id}`}
              className="text-indigo-600 hover:text-indigo-800 text-sm font-medium"
            >
              Edit
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
