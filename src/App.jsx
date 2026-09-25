import { useEffect, useMemo, useState } from 'react'
import { Activity, CalendarDays, Check, CheckCheck, ChevronDown, ChevronLeft, ChevronRight, CircleHelp, Clock3, Command, Filter, Inbox, Leaf, ListTodo, LoaderCircle, Plus, Search, Settings2, Sparkles, Trash2, X } from 'lucide-react'
import { useAddTodoMutation, useDeleteTodoMutation, useGetTodosQuery, useUpdateTodoMutation } from './todosApi'

const filters = [
  { id: 'all', label: 'All tasks', icon: Inbox },
  { id: 'today', label: 'Today', icon: CalendarDays },
  { id: 'upcoming', label: 'Upcoming', icon: Clock3 },
  { id: 'completed', label: 'Completed', icon: CheckCheck },
]
const categories = ['Personal', 'Work', 'Ideas', 'Health']
const priorityTone = { high: 'bg-[#faeee7] text-[#ba6849]', medium: 'bg-[#f4f0df] text-[#9b8240]', low: 'bg-[#eaf0e7] text-[#658064]' }

const dateKey = (date) => {
  const d = new Date(date)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}
const todayKey = () => dateKey(new Date())
const dateLabel = (value) => {
  if (!value) return ''
  const date = new Date(`${value}T12:00:00`)
  if (value === todayKey()) return 'Today'
  const tomorrow = new Date(); tomorrow.setDate(tomorrow.getDate() + 1)
  if (value === dateKey(tomorrow)) return 'Tomorrow'
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}
const timeLabel = (value) => {
  if (!value) return ''
  const [hour, minute] = value.split(':').map(Number)
  return new Date(2000, 0, 1, hour, minute).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })
}

function Sidebar({ active, setActive, todos, openComposer }) {
  const incomplete = todos.filter((todo) => !todo.completed)
  return <aside className="flex w-full shrink-0 flex-col border-r border-line bg-[#fcfcfa] md:w-[245px] xl:w-[268px]">
    <div className="flex items-center gap-3 px-6 py-7"><div className="flex h-9 w-9 items-center justify-center rounded-[13px] bg-forest text-lime"><Leaf size={18} strokeWidth={2.2} /></div><div><p className="font-display text-[16px] font-extrabold tracking-[-.7px]">to-do list<span className="text-forest">.</span></p><p className="-mt-0.5 text-[10px] tracking-[.15em] text-muted">MAKE SPACE FOR WHAT MATTERS</p></div></div>
    <div className="px-4"><button onClick={openComposer} className="flex w-full items-center justify-between rounded-xl bg-forest px-4 py-3 text-[13px] font-semibold text-white shadow-sm transition hover:bg-[#284b39]"><span className="flex items-center gap-2"><Plus size={16} /> New task</span><span className="flex items-center gap-1 rounded-md bg-white/10 px-1.5 py-1 text-[10px] text-white/70"><Command size={10} /> K</span></button></div>
    <div className="mt-9 px-5"><p className="mb-3 px-2 text-[10px] font-bold uppercase tracking-[.15em] text-[#aaa99f]">Workspace</p><nav className="space-y-1">{filters.map(({ id, label, icon: Icon }) => <button key={id} onClick={() => setActive(id)} className={`flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-[13px] transition ${active === id ? 'bg-[#edf1e9] font-semibold text-forest' : 'text-[#73756d] hover:bg-[#f3f4ef]'}`}><span className="flex items-center gap-3"><Icon size={16} strokeWidth={active === id ? 2.1 : 1.8} />{label}</span>{id === 'all' && <span className={`text-[11px] ${active === id ? 'text-forest' : 'text-[#aaa99f]'}`}>{incomplete.length}</span>}{id === 'today' && <span className="h-1.5 w-1.5 rounded-full bg-[#a4b86f]" />}</button>)}</nav></div>
    <div className="mt-9 px-5"><div className="mb-3 flex items-center justify-between px-2"><p className="text-[10px] font-bold uppercase tracking-[.15em] text-[#aaa99f]">Labels</p><button aria-label="Add label" className="rounded p-1 text-[#aaa99f] hover:text-ink"><Plus size={14} /></button></div><div className="space-y-1">{categories.map((name, i) => <button key={name} onClick={() => setActive(`category:${name}`)} className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-[13px] transition ${active === `category:${name}` ? 'bg-[#edf1e9] font-semibold text-forest' : 'text-[#73756d] hover:bg-[#f3f4ef]'}`}><span className="flex items-center gap-3"><span className={`h-2 w-2 rounded-full ${['bg-[#aabc83]', 'bg-[#d3a987]', 'bg-[#b1a2c8]', 'bg-[#8eafbd]'][i]}`} />{name}</span><span className="text-[11px] text-[#aaa99f]">{incomplete.filter((todo) => todo.category === name).length || ''}</span></button>)}</div></div>
    <div className="mt-auto px-4 pb-5 pt-10"><div className="rounded-xl bg-[#f1f2eb] p-4"><div className="mb-2 flex items-center gap-2 text-forest"><Sparkles size={15} /><span className="text-[11px] font-bold">A gentle reminder</span></div><p className="text-[12px] leading-[1.65] text-[#797c70]">Progress is progress, no matter how small. Keep showing up.</p><div className="mt-3 flex gap-1"><span className="h-1 flex-1 rounded-full bg-[#87a189]"/><span className="h-1 flex-1 rounded-full bg-[#bbca99]"/><span className="h-1 flex-1 rounded-full bg-[#dedfc9]"/><span className="h-1 flex-1 rounded-full bg-white"/></div></div><div className="mt-4 flex items-center justify-between px-2 text-[11px] text-[#999a91]"><span>Daylist v1.0</span><button aria-label="Help" className="hover:text-ink"><CircleHelp size={15} /></button></div></div>
  </aside>
}

function Composer({ onClose, onAdd, isSaving }) {
  const [title, setTitle] = useState('')
  const [category, setCategory] = useState('Personal')
  const [priority, setPriority] = useState('medium')
  const [dueDate, setDueDate] = useState(todayKey())
  const [startTime, setStartTime] = useState('')
  const [endTime, setEndTime] = useState('')
  const [timeError, setTimeError] = useState('')
  const submit = (event) => {
    event.preventDefault()
    if (!title.trim()) return
    if (!!startTime !== !!endTime) { setTimeError('Enter both a start and end time, or leave both blank.'); return }
    if (startTime && endTime <= startTime) { setTimeError('End time must be later than start time.'); return }
    setTimeError('')
    onAdd({ title: title.trim(), category, priority, dueDate, startTime: startTime || null, endTime: endTime || null })
  }
  return <div className="fixed inset-0 z-30 flex items-center justify-center overflow-y-auto bg-[#22251f]/25 p-4 backdrop-blur-[2px]" onMouseDown={(e) => { if (e.target === e.currentTarget) onClose() }}><form onSubmit={submit} className="my-auto w-full max-w-[440px] rounded-2xl border border-[#e8e9e1] bg-white p-6 shadow-2xl"><div className="mb-5 flex items-start justify-between"><div><p className="font-display text-[20px] font-bold tracking-[-.7px]">A new little thing</p><p className="mt-1 text-[12px] text-muted">One step at a time.</p></div><button type="button" onClick={onClose} className="rounded-lg p-2 text-muted hover:bg-paper"><X size={17}/></button></div><label className="mb-2 block text-[11px] font-semibold text-[#77796f]">Task name</label><input autoFocus maxLength={180} value={title} onChange={(e) => setTitle(e.target.value)} placeholder="What would you like to do?" className="w-full rounded-xl border border-line bg-[#fdfdfb] px-4 py-3 text-[14px] outline-none transition placeholder:text-[#b1b2a9] focus:border-[#9ab09b]"/><div className="mt-4 grid grid-cols-2 gap-3"><div><label className="mb-2 block text-[11px] font-semibold text-[#77796f]">Label</label><select value={category} onChange={(e) => setCategory(e.target.value)} className="w-full rounded-lg border border-line bg-white px-3 py-2.5 text-[12px] outline-none">{categories.map((c) => <option key={c}>{c}</option>)}</select></div><div><label className="mb-2 block text-[11px] font-semibold text-[#77796f]">Priority</label><select value={priority} onChange={(e) => setPriority(e.target.value)} className="w-full rounded-lg border border-line bg-white px-3 py-2.5 text-[12px] capitalize outline-none"><option value="low">Low</option><option value="medium">Medium</option><option value="high">High</option></select></div></div><div className="mt-4"><label className="mb-2 block text-[11px] font-semibold text-[#77796f]">Due date</label><input type="date" required min={todayKey()} value={dueDate} onChange={(e) => setDueDate(e.target.value)} className="w-full rounded-lg border border-line bg-white px-3 py-2.5 text-[12px] outline-none"/></div><div className="mt-4 grid grid-cols-2 gap-3"><div><label className="mb-2 block text-[11px] font-semibold text-[#77796f]">Start time <span className="font-normal text-[#a1a298]">(optional)</span></label><input type="time" value={startTime} onChange={(e) => { setStartTime(e.target.value); setTimeError('') }} className="w-full rounded-lg border border-line bg-white px-3 py-2.5 text-[12px] outline-none"/></div><div><label className="mb-2 block text-[11px] font-semibold text-[#77796f]">End time <span className="font-normal text-[#a1a298]">(optional)</span></label><input type="time" value={endTime} onChange={(e) => { setEndTime(e.target.value); setTimeError('') }} className="w-full rounded-lg border border-line bg-white px-3 py-2.5 text-[12px] outline-none"/></div></div>{timeError && <p role="alert" className="mt-2 text-[11px] text-[#b45e4a]">{timeError}</p>}<div className="mt-6 flex justify-end gap-2"><button type="button" onClick={onClose} className="rounded-lg px-4 py-2.5 text-[12px] font-semibold text-[#77796f] hover:bg-paper">Cancel</button><button disabled={!title.trim() || isSaving} className="flex items-center gap-2 rounded-lg bg-forest px-4 py-2.5 text-[12px] font-semibold text-white transition hover:bg-[#284b39] disabled:opacity-50">{isSaving && <LoaderCircle size={14} className="animate-spin"/>}<Plus size={14}/> Add task</button></div></form></div>
}

function TaskRow({ todo, onToggle, onDelete, isDeleting }) {
  return <div className={`task-row group flex items-start gap-3.5 border-b border-[#edeee8] px-1 py-[17px] transition ${todo.completed ? 'opacity-60' : ''}`}><button aria-label={todo.completed ? 'Mark incomplete' : 'Mark complete'} onClick={() => onToggle(todo)} className={`check-ring mt-0.5 flex h-[19px] w-[19px] shrink-0 items-center justify-center rounded-full border ${todo.completed ? 'border-forest bg-forest text-white' : 'border-[#d6d8ce] text-transparent'}`}>{todo.completed && <Check size={12} strokeWidth={3}/>}</button><div className="min-w-0 flex-1"><p className={`text-[13px] leading-[1.5] ${todo.completed ? 'text-[#999b91] line-through' : 'text-[#34362f]'}`}>{todo.title}</p><div className="mt-2 flex flex-wrap items-center gap-2.5"><span className="flex items-center gap-1.5 text-[10px] text-[#989a90]"><span className="h-1.5 w-1.5 rounded-full bg-[#aabc83]"/>{todo.category}</span><span className={`rounded px-1.5 py-0.5 text-[9px] font-semibold capitalize ${priorityTone[todo.priority]}`}>{todo.priority}</span>{todo.dueDate && <span className={`flex items-center gap-1 text-[10px] ${todo.dueDate < todayKey() && !todo.completed ? 'text-[#bb7056]' : 'text-[#989a90]'}`}><CalendarDays size={11}/>{dateLabel(todo.dueDate)}</span>}{todo.startTime && todo.endTime && <span className="flex items-center gap-1 text-[10px] text-[#989a90]"><Clock3 size={11}/>{timeLabel(todo.startTime)} – {timeLabel(todo.endTime)}</span>}</div></div><button type="button" aria-label={`Delete ${todo.title}`} title="Delete task" disabled={isDeleting} onClick={() => onDelete(todo)} className="rounded-md p-2 text-[#a3a49b] opacity-100 transition hover:bg-[#fbefeb] hover:text-[#b45e4a] disabled:cursor-wait disabled:opacity-50 sm:opacity-0 sm:group-hover:opacity-100 sm:focus:opacity-100"><Trash2 size={15}/></button></div>
}

function App() {
  const { data: todos = [], isLoading, isError, refetch } = useGetTodosQuery()
  const [addTodo, { isLoading: isAdding }] = useAddTodoMutation()
  const [updateTodo] = useUpdateTodoMutation()
  const [deleteTodo, { isLoading: isDeleting }] = useDeleteTodoMutation()
  const [active, setActive] = useState('all')
  const [search, setSearch] = useState('')
  const [showComposer, setShowComposer] = useState(false)
  const [sortBy, setSortBy] = useState('created')
  const [period, setPeriod] = useState(new Date())
  const [notice, setNotice] = useState('')

  const today = todayKey()
  const visible = useMemo(() => {
    let list = [...todos]
    if (active === 'today') list = list.filter((todo) => !todo.completed && (!todo.dueDate || todo.dueDate <= today))
    else if (active === 'upcoming') list = list.filter((todo) => !todo.completed && todo.dueDate > today)
    else if (active === 'completed') list = list.filter((todo) => todo.completed)
    else if (active.startsWith('category:')) list = list.filter((todo) => todo.category === active.slice(9))
    if (search.trim()) list = list.filter((todo) => `${todo.title} ${todo.category}`.toLowerCase().includes(search.toLowerCase()))
    return list
  }, [todos, active, search, today])
  const completedToday = todos.filter((todo) => todo.completed).length
  const incomplete = todos.filter((todo) => !todo.completed)
  const done = todos.filter((todo) => todo.completed)
  const progress = todos.length ? Math.round(completedToday / todos.length * 100) : 0
  const sectionLabel = active.startsWith('category:') ? active.slice(9) : filters.find((item) => item.id === active)?.label || 'All tasks'

 const add = async (body) => { try { await addTodo(body).unwrap(); setShowComposer(false); setNotice('Task added to your list.'); setTimeout(() => setNotice(''), 2400) } catch { setNotice('Could not add that task. Try again.'); setTimeout(() => setNotice(''), 3000) } }
  const toggle = async (todo) => { try { await updateTodo({ id: todo.id, completed: !todo.completed }).unwrap() } catch { setNotice('Could not update that task.'); setTimeout(() => setNotice(''), 3000) } }
  const remove = async (todo) => { try { await deleteTodo(todo.id).unwrap(); setNotice('Task deleted.'); setTimeout(() => setNotice(''), 2400) } catch { setNotice('Could not delete that task. Try again.'); setTimeout(() => setNotice(''), 3000) } }
  const changePeriod = (amount) => setPeriod((current) => new Date(current.getFullYear(), current.getMonth() + amount, 1))
  const monthName = period.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
  const monthStart = new Date(period.getFullYear(), period.getMonth(), 1)
  const firstDay = (monthStart.getDay() + 6) % 7
  const days = new Date(period.getFullYear(), period.getMonth() + 1, 0).getDate()
  const calendarCells = [...Array(firstDay).fill(null), ...Array.from({ length: days }, (_, i) => i + 1)]

  useEffect(() => {
    const handleShortcut = (event) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault()
        setShowComposer(true)
      }
    }
    window.addEventListener('keydown', handleShortcut)
    return () => window.removeEventListener('keydown', handleShortcut)
  }, [])

  const sortLabels = { created: 'Newest first', due: 'Due date', priority: 'Priority' }
  const cycleSort = () => setSortBy((current) => current === 'created' ? 'due' : current === 'due' ? 'priority' : 'created')
  const sortedVisible = [...visible].sort((a, b) => {
    if (sortBy === 'priority') return ['high', 'medium', 'low'].indexOf(a.priority) - ['high', 'medium', 'low'].indexOf(b.priority)
    if (sortBy === 'due') return (a.dueDate || '9999-12-31').localeCompare(b.dueDate || '9999-12-31')
    return new Date(b.createdAt) - new Date(a.createdAt)
  })

  return <div className="min-h-screen bg-paper text-ink md:flex"><Sidebar active={active} setActive={setActive} todos={todos} openComposer={() => setShowComposer(true)}/>
    <main className="min-w-0 flex-1"><header className="flex h-[72px] items-center justify-between border-b border-line px-5 sm:px-8 lg:px-11"><div className="flex items-center gap-2 text-[12px] text-muted"><span>My workspace</span><span className="text-[#c8c9c1]">/</span><span className="font-medium text-[#54564f]">{sectionLabel}</span></div><div className="flex items-center gap-2 sm:gap-3"><div className="relative hidden sm:block"><Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#a6a79f]"/><input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search tasks..." className="w-[190px] rounded-lg border border-[#e9eae4] bg-white/70 py-2 pl-9 pr-3 text-[11px] outline-none transition focus:border-[#c2cfbd]"/></div><button aria-label="Filter tasks" className="rounded-lg border border-line bg-white/70 p-2 text-[#777970] hover:bg-white"><Filter size={15}/></button><div className="ml-1 flex h-8 w-8 items-center justify-center rounded-full bg-[#e8ece3] text-[11px] font-bold text-forest">A</div></div></header>
      <div className="mx-auto max-w-[1160px] px-5 pb-12 pt-8 sm:px-8 lg:px-11 lg:pt-10"><div className="mb-8 flex flex-wrap items-end justify-between gap-4"><div><div className="mb-2 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[.14em] text-[#899381]"><span className="h-1.5 w-1.5 rounded-full bg-[#91a578]"/> {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</div><h1 className="font-display text-[31px] font-bold tracking-[-1.4px] sm:text-[36px]">A little progress, <span className="text-[#8b9c7b]">every day.</span></h1><p className="mt-2 text-[13px] text-[#8b8d84]">Your mind is for having ideas, not holding them.</p></div><button onClick={() => setShowComposer(true)} className="flex items-center gap-2 rounded-lg border border-[#dfe2d8] bg-white px-3.5 py-2.5 text-[11px] font-semibold text-[#4c6853] shadow-sm transition hover:border-[#b8c7b8] hover:bg-[#fbfcf9]"><Plus size={14}/> Add a task</button></div>
        <div className="mb-8 grid grid-cols-1 gap-3 sm:grid-cols-3"><div className="flex items-center gap-4 rounded-xl border border-line bg-white px-4 py-4 shadow-[0_2px_10px_rgba(37,42,32,.025)]"><div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#edf1e8] text-forest"><ListTodo size={18}/></div><div><p className="text-[10px] text-[#999b91]">On your plate</p><p className="mt-0.5 font-display text-[21px] font-bold tracking-[-.8px]">{incomplete.length}<span className="ml-1.5 font-sans text-[11px] font-normal tracking-normal text-[#a5a69d]">tasks</span></p></div></div><div className="flex items-center gap-4 rounded-xl border border-line bg-white px-4 py-4 shadow-[0_2px_10px_rgba(37,42,32,.025)]"><div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#f5f1e3] text-[#a58e4c]"><Activity size={18}/></div><div className="min-w-0 flex-1"><div className="flex items-baseline justify-between"><p className="text-[10px] text-[#999b91]">Your momentum</p><span className="font-display text-[14px] font-bold">{progress}<span className="text-[10px] font-medium text-[#9b9d93]">%</span></span></div><div className="mt-2 h-[5px] overflow-hidden rounded-full bg-[#f1f0e9]"><div style={{ width: `${progress}%` }} className="h-full rounded-full bg-[#a8b87d] transition-all"/></div></div></div><div className="flex items-center gap-4 rounded-xl border border-line bg-white px-4 py-4 shadow-[0_2px_10px_rgba(37,42,32,.025)]"><div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#f1ecf3] text-[#8e789e]"><Sparkles size={18}/></div><div><p className="text-[10px] text-[#999b91]">Already done</p><p className="mt-0.5 font-display text-[21px] font-bold tracking-[-.8px]">{completedToday}<span className="ml-1.5 font-sans text-[11px] font-normal tracking-normal text-[#a5a69d]">{completedToday === 1 ? 'small win' : 'small wins'}</span></p></div></div></div>

        <div className="grid grid-cols-1 items-start gap-5 xl:grid-cols-[minmax(0,1fr)_294px]"><section className="overflow-hidden rounded-xl border border-line bg-white"><div className="flex items-center justify-between border-b border-[#edeee8] px-5 py-4 sm:px-6"><div><h2 className="font-display text-[15px] font-bold tracking-[-.35px]">{sectionLabel}</h2><p className="mt-1 text-[10px] text-[#a1a298]">{visible.length} {visible.length === 1 ? 'task' : 'tasks'} in this list</p></div><button onClick={cycleSort} className="flex items-center gap-1.5 rounded-md px-2 py-1.5 text-[10px] font-medium text-[#888a80] hover:bg-paper"><Settings2 size={13}/> {sortLabels[sortBy]} <ChevronDown size={12}/></button></div>
          {isLoading ? <div className="flex h-48 items-center justify-center gap-2 text-[12px] text-muted"><LoaderCircle size={16} className="animate-spin"/> Gathering your tasks...</div> : isError ? <div className="px-6 py-12 text-center"><p className="text-[13px] text-[#8b695d]">We couldn’t connect to your list.</p><button onClick={() => refetch()} className="mt-3 text-[11px] font-semibold text-forest underline underline-offset-2">Try again</button></div> : <div className="px-5 sm:px-6">
            {sortedVisible.length ? <div>{sortedVisible.filter((todo) => !todo.completed).length > 0 && active !== 'completed' && <div className="mb-0 mt-1 flex items-center gap-2 pt-2 text-[9px] font-bold uppercase tracking-[.13em] text-[#abad9f]"><span>In progress</span><span className="h-px flex-1 bg-[#f0f1ec]"/></div>}{sortedVisible.filter((todo) => !todo.completed).map((todo) => <TaskRow key={todo.id} todo={todo} onToggle={toggle} onDelete={remove} isDeleting={isDeleting}/>)}{sortedVisible.some((todo) => todo.completed) && <div className="mb-0 mt-3 flex items-center gap-2 pt-2 text-[9px] font-bold uppercase tracking-[.13em] text-[#abad9f]"><span>Completed</span><span className="h-px flex-1 bg-[#f0f1ec]"/></div>}{sortedVisible.filter((todo) => todo.completed).map((todo) => <TaskRow key={todo.id} todo={todo} onToggle={toggle} onDelete={remove} isDeleting={isDeleting}/>)}</div> : <div className="flex min-h-[250px] flex-col items-center justify-center px-4 text-center"><div className="mb-3 flex h-11 w-11 items-center justify-center rounded-2xl bg-[#f0f2eb] text-[#809276]"><Check size={19}/></div><p className="font-display text-[14px] font-bold">{search ? 'No matching tasks' : active === 'completed' ? 'Nothing completed just yet' : 'All clear for now'}</p><p className="mt-1.5 max-w-[220px] text-[11px] leading-relaxed text-[#999b91]">{search ? 'Try a different search, or keep going with your day.' : 'Take a breath. Add a task whenever something comes to mind.'}</p>{!search && <button onClick={() => setShowComposer(true)} className="mt-4 flex items-center gap-1.5 text-[11px] font-semibold text-forest"><Plus size={13}/> Add your first task</button>}</div>}
            <div className="flex items-center justify-center gap-2 border-t border-[#edeee8] py-3 text-[10px] text-[#aaa99f]"><Leaf size={11}/> Small steps still move you forward.</div>
          </div>}</section>

          <aside className="space-y-4"><div className="rounded-xl border border-line bg-white p-4"><div className="mb-4 flex items-center justify-between"><div><h2 className="font-display text-[13px] font-bold">A date to remember</h2><p className="mt-0.5 text-[10px] text-[#a1a298]">A little look ahead</p></div><div className="flex items-center gap-1"><button aria-label="Previous month" onClick={() => changePeriod(-1)} className="rounded-md p-1 text-[#92948a] hover:bg-paper"><ChevronLeft size={15}/></button><button aria-label="Next month" onClick={() => changePeriod(1)} className="rounded-md p-1 text-[#92948a] hover:bg-paper"><ChevronRight size={15}/></button></div></div><div className="mb-2 text-[11px] font-semibold text-[#5a5c54]">{monthName}</div><div className="grid grid-cols-7 gap-y-1 text-center">{['M','T','W','T','F','S','S'].map((day, i) => <span key={`${day}-${i}`} className="py-1 text-[9px] font-medium text-[#b1b2a9]">{day}</span>)}{calendarCells.map((day, i) => { const cellDate = day ? dateKey(new Date(period.getFullYear(), period.getMonth(), day)) : null; const hasTask = todos.some((todo) => todo.dueDate === cellDate && !todo.completed); const isToday = cellDate === today; return <span key={i} className={`relative flex h-[29px] items-center justify-center text-[10px] ${!day ? '' : isToday ? 'font-bold text-white' : 'text-[#66685f]'}`}><span className={`${isToday ? 'flex h-6 w-6 items-center justify-center rounded-full bg-forest' : ''}`}>{day || ''}</span>{hasTask && !isToday && <i className="absolute bottom-0.5 h-1 w-1 rounded-full bg-[#a4b779]"/>}</span>})}</div><div className="mt-3 flex items-center gap-1.5 border-t border-[#edeee8] pt-3 text-[10px] text-[#999b91]"><span className="h-1.5 w-1.5 rounded-full bg-[#a4b779]"/> Days with things to do</div></div>
            <div className="rounded-xl border border-line bg-white p-4"><div className="mb-3 flex items-center justify-between"><div><h2 className="font-display text-[13px] font-bold">A soft landing</h2><p className="mt-0.5 text-[10px] text-[#a1a298]">What you’ve wrapped up</p></div><span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#edf1e8] text-forest"><CheckCheck size={14}/></span></div>{done.length ? <div className="custom-scrollbar max-h-[130px] space-y-2 overflow-auto">{done.slice(0, 4).map((todo) => <div key={todo.id} className="flex items-center gap-2.5"><span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-[#e9efe4] text-forest"><Check size={10} strokeWidth={3}/></span><span className="truncate text-[10px] text-[#999b91] line-through">{todo.title}</span></div>)}</div> : <p className="rounded-lg bg-[#f8f8f5] px-3 py-3 text-[10px] leading-relaxed text-[#92948a]">The things you finish will find a little home here.</p>}<div className="mt-3 border-t border-[#edeee8] pt-3 text-[10px] text-[#999b91]">{done.length} {done.length === 1 ? 'thing' : 'things'} finished so far</div></div>
            <div className="rounded-xl bg-[#e9ede3] px-4 py-3.5"><div className="flex items-center gap-2 text-forest"><Sparkles size={13}/><span className="text-[10px] font-bold">A thought to keep</span></div><p className="mt-2 font-display text-[12px] font-medium leading-relaxed text-[#53624e]">“How we spend our days is, of course, how we spend our lives.”</p><p className="mt-1.5 text-[9px] text-[#899581]">— Annie Dillard</p></div>
          </aside></div>
      </div>
    </main>
    {notice && <div role="status" className="fixed bottom-5 left-1/2 z-40 -translate-x-1/2 rounded-lg bg-[#2d4335] px-4 py-2.5 text-[12px] font-medium text-white shadow-lg">{notice}</div>}
    {showComposer && <Composer onClose={() => setShowComposer(false)} onAdd={add} isSaving={isAdding}/>}
  </div>
}

export default App
