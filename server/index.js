import express from 'express'
import { randomUUID } from 'node:crypto'
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const app = express()
const port = process.env.PORT || 4000
const here = path.dirname(fileURLToPath(import.meta.url))
const dataFile = path.join(here, 'data', 'todos.json')

app.use(express.json())

async function readTodos() {
  try { return JSON.parse(await readFile(dataFile, 'utf8')) }
  catch (error) {
    if (error.code !== 'ENOENT') throw error
    await mkdir(path.dirname(dataFile), { recursive: true })
    await writeFile(dataFile, '[]', 'utf8')
    return []
  }
}

async function saveTodos(todos) {
  await mkdir(path.dirname(dataFile), { recursive: true })
  await writeFile(dataFile, JSON.stringify(todos, null, 2), 'utf8')
}

app.get('/api/todos', async (_req, res, next) => {
  try { res.json(await readTodos()) } catch (error) { next(error) }
})

app.post('/api/todos', async (req, res, next) => {
  try {
    const title = typeof req.body.title === 'string' ? req.body.title.trim() : ''
    if (!title) return res.status(400).json({ message: 'A task title is required.' })
    const todo = {
      id: randomUUID(), title: title.slice(0, 180), completed: false,
      priority: ['low', 'medium', 'high'].includes(req.body.priority) ? req.body.priority : 'medium',
      category: typeof req.body.category === 'string' ? req.body.category.slice(0, 40) : 'Personal',
      dueDate: typeof req.body.dueDate === 'string' ? req.body.dueDate : null,
      createdAt: new Date().toISOString(),
    }
    const todos = await readTodos()
    todos.unshift(todo)
    await saveTodos(todos)
    res.status(201).json(todo)
  } catch (error) { next(error) }
})

app.patch('/api/todos/:id', async (req, res, next) => {
  try {
    const todos = await readTodos()
    const index = todos.findIndex((todo) => todo.id === req.params.id)
    if (index === -1) return res.status(404).json({ message: 'Task not found.' })
    const update = {}
    if (typeof req.body.title === 'string' && req.body.title.trim()) update.title = req.body.title.trim().slice(0, 180)
    if (typeof req.body.completed === 'boolean') update.completed = req.body.completed
    if (['low', 'medium', 'high'].includes(req.body.priority)) update.priority = req.body.priority
    if (typeof req.body.category === 'string') update.category = req.body.category.slice(0, 40)
    if (typeof req.body.dueDate === 'string' || req.body.dueDate === null) update.dueDate = req.body.dueDate
    todos[index] = { ...todos[index], ...update }
    await saveTodos(todos)
    res.json(todos[index])
  } catch (error) { next(error) }
})

app.delete('/api/todos/:id', async (req, res, next) => {
  try {
    const todos = await readTodos()
    const remainingTodos = todos.filter((todo) => todo.id !== req.params.id)
    if (remainingTodos.length === todos.length) return res.status(404).json({ message: 'Task not found.' })
    await saveTodos(remainingTodos)
    res.status(204).end()
  } catch (error) { next(error) }
})

app.use((error, _req, res, _next) => {
  console.error(error)
  res.status(500).json({ message: 'Something went wrong on the server.' })
})

app.listen(port, () => console.log(`To-do List API listening on http://localhost:${port}`))
