import express from 'express'
import { addTodo, deleteTodo, listTodos, updateTodo } from './todoStore.js'

const app = express()
const port = process.env.PORT || 4000
app.use(express.json())

app.get('/api/todos', async (_req, res, next) => {
  try { res.json(await listTodos()) } catch (error) { next(error) }
})

app.post('/api/todos', async (req, res, next) => {
  try {
    res.status(201).json(await addTodo(req.body))
  } catch (error) { next(error) }
})

app.patch('/api/todos/:id', async (req, res, next) => {
  try {
    const todo = await updateTodo(req.params.id, req.body)
    if (!todo) return res.status(404).json({ message: 'Task not found.' })
    res.json(todo)
  } catch (error) { next(error) }
})

app.delete('/api/todos/:id', async (req, res, next) => {
  try {
    const deleted = await deleteTodo(req.params.id)
    if (!deleted) return res.status(404).json({ message: 'Task not found.' })
    res.status(204).end()
  } catch (error) { next(error) }
})

app.use((error, _req, res, _next) => {
  console.error(error)
  res.status(error.status || 500).json({ message: error.status ? error.message : 'Something went wrong on the server.' })
})

if (!process.env.VERCEL) {
  app.listen(port, () => console.log(`To-do List API listening on http://localhost:${port}`))
}

export default app
