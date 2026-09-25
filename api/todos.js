import { addTodo, listTodos } from '../server/todoStore.js'

export default async function handler(req, res) {
  try {
    if (req.method === 'GET') return res.status(200).json(await listTodos())
    if (req.method === 'POST') return res.status(201).json(await addTodo(req.body))
    res.setHeader('Allow', ['GET', 'POST'])
    return res.status(405).json({ message: 'Method not allowed.' })
  } catch (error) {
    console.error('Todo collection API error:', error)
    return res.status(error.status || 500).json({ message: error.status ? error.message : 'Could not access task storage. Connect a Vercel Blob store and redeploy.' })
  }
}
