import { mkdir, readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const dataFile = path.join(path.dirname(fileURLToPath(import.meta.url)), 'data', 'todos.json')
const blobPath = 'daylist/todos.json'

function todayInIndia() {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: 'Asia/Kolkata', year: 'numeric', month: '2-digit', day: '2-digit',
  }).formatToParts(new Date())
  const values = Object.fromEntries(parts.map(({ type, value }) => [type, value]))
  return `${values.year}-${values.month}-${values.day}`
}

function validateDueDate(value) {
  const today = todayInIndia()
  if (value == null || value === '') return today
  const parsed = typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value)
    ? new Date(`${value}T00:00:00.000Z`)
    : null
  if (!parsed || Number.isNaN(parsed.getTime()) || parsed.toISOString().slice(0, 10) !== value) {
    const error = new Error('Choose a valid due date.')
    error.status = 400
    throw error
  }
  if (value < today) {
    const error = new Error('Due date must be today or a future day.')
    error.status = 400
    throw error
  }
  return value
}

async function readLocalTodos() {
  try { return JSON.parse(await readFile(dataFile, 'utf8')) }
  catch (error) {
    if (error.code !== 'ENOENT') throw error
    await mkdir(path.dirname(dataFile), { recursive: true })
    await writeFile(dataFile, '[]', 'utf8')
    return []
  }
}

async function writeLocalTodos(todos) {
  await mkdir(path.dirname(dataFile), { recursive: true })
  await writeFile(dataFile, JSON.stringify(todos, null, 2), 'utf8')
}

async function readBlobTodos() {
  const { get } = await import('@vercel/blob')
  const blob = await get(blobPath, { access: 'private', useCache: false })
  if (!blob) return []
  return JSON.parse(await new Response(blob.stream).text())
}

async function writeBlobTodos(todos) {
  const { put } = await import('@vercel/blob')
  await put(blobPath, JSON.stringify(todos), {
    access: 'private',
    allowOverwrite: true,
    contentType: 'application/json',
    cacheControlMaxAge: 60,
  })
}

const readTodos = () => process.env.VERCEL ? readBlobTodos() : readLocalTodos()
const writeTodos = (todos) => process.env.VERCEL ? writeBlobTodos(todos) : writeLocalTodos(todos)

export async function listTodos() {
  return readTodos()
}

export async function addTodo(body = {}) {
  const title = typeof body.title === 'string' ? body.title.trim() : ''
  if (!title) {
    const error = new Error('A task title is required.')
    error.status = 400
    throw error
  }
  const todo = {
    id: crypto.randomUUID(),
    title: title.slice(0, 180),
    completed: false,
    priority: ['low', 'medium', 'high'].includes(body.priority) ? body.priority : 'medium',
    category: typeof body.category === 'string' ? body.category.slice(0, 40) : 'Personal',
    dueDate: validateDueDate(body.dueDate),
    createdAt: new Date().toISOString(),
  }
  const todos = await readTodos()
  todos.unshift(todo)
  await writeTodos(todos)
  return todo
}

export async function updateTodo(id, body = {}) {
  const todos = await readTodos()
  const index = todos.findIndex((todo) => todo.id === id)
  if (index === -1) return null
  const update = {}
  if (typeof body.title === 'string' && body.title.trim()) update.title = body.title.trim().slice(0, 180)
  if (typeof body.completed === 'boolean') update.completed = body.completed
  if (['low', 'medium', 'high'].includes(body.priority)) update.priority = body.priority
  if (typeof body.category === 'string') update.category = body.category.slice(0, 40)
  if (Object.hasOwn(body, 'dueDate')) update.dueDate = validateDueDate(body.dueDate)
  todos[index] = { ...todos[index], ...update }
  await writeTodos(todos)
  return todos[index]
}

export async function deleteTodo(id) {
  const todos = await readTodos()
  const remaining = todos.filter((todo) => todo.id !== id)
  if (remaining.length === todos.length) return false
  await writeTodos(remaining)
  return true
}
