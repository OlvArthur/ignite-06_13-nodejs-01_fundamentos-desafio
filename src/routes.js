import { randomUUID } from 'node:crypto'
import { Database } from './database.js'
import { buildRoutePath } from './utils/build-route-path.js'

const database = new Database()

export const routes = [
  {
    method: 'GET',
    path: buildRoutePath('/tasks'),
    handler: (req, res) => {
      const { search } = req.query

      const tasks = database.select('tasks', search ? {
        title: search,
        description: search
      }: null)

      return res.end(JSON.stringify(tasks))
    }
  },
  {
    method: 'POST',
    path: buildRoutePath('/tasks'),
    handler: (req, res)  => {
      const { title, description } = req.body

      if(!title || !description) return res.writeHead(400).end(JSON.stringify({ error: 'Missing Title Or Description'}))

      const task = {
        id: randomUUID(),
        title,
        description,
        completed_at: null,
        created_at: new Date(),
        updated_at: new Date()
      }

      database.insert('tasks', task)

      return res.writeHead(201).end()
    }
  },
  {
    method: 'DELETE',
    path: buildRoutePath('/tasks/:id'),
    handler: (req, res) => {
      const { id } = req.params

      const [existentTask] = database.select('tasks', {
        id
      })

      if(!existentTask) return res.writeHead(404).end(JSON.stringify({error: 'Task not found'}))

      database.delete('tasks',id)

      return res.writeHead(204).end()
    }
  },
  {
    method: 'PUT',
    path: buildRoutePath('/tasks/:id'),
    handler: (req, res) => {
      const { id } = req.params
      const { title, description } = req.body

      if(!title && !description) return res.writeHead(400).end(JSON.stringify({ error: 'Missing Title And Description'}))

      const [existentTask] = database.select('tasks', {
        id
      })

      if(!existentTask) return res.writeHead(404).end(JSON.stringify({error: 'Task not found'}))

      database.update('tasks', id, {
        title: title ?? existentTask.title,
        description: description ?? existentTask.description,
        completed_at: existentTask.completed_at,
        created_at: existentTask.created_at,
        updated_at: new Date(),
      })

      return res.writeHead(204).end()
    }
  },
  {
    method: 'PATCH',
    path: buildRoutePath('/tasks/:id/complete'),
    handler: (req, res) => {
      const { id } = req.params

      const [existentTask] = database.select('tasks', {
        id
      })

      if(!existentTask) return res.writeHead(404).end('Task not found')

      database.update('tasks', id, Object.assign(existentTask, {
        completed_at: existentTask.completed_at ? null : new Date(),
        updated_at: new Date(),
      }))

      return res.writeHead(204).end()
    }
  }
]