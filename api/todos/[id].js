import { deleteTodo, updateTodo } from '../../server/todoStore.js'

export default async function handler(req, res) {
  try {
    const { id } = req.query
    if (req.method === 'PATCH') {
      const todo = await updateTodo(id, req.body)
      return todo ? res.status(200).json(todo) : res.status(404).json({ message: 'Task not found.' })
    }
    if (req.method === 'DELETE') {
      const deleted = await deleteTodo(id)
      return deleted ? res.status(204).end() : res.status(404).json({ message: 'Task not found.' })
    }
    res.setHeader('Allow', ['PATCH', 'DELETE'])
    return res.status(405).json({ message: 'Method not allowed.' })
  } catch (error) {
    console.error('Todo item API error:', error)
    return res.status(error.status || 500).json({ message: error.status ? error.message : 'Could not access task storage. Connect a Vercel Blob store and redeploy.' })
  }
}
