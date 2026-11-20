import { useEffect, useMemo, useRef, useState } from 'react'
import {
  ArrowDownRight,
  ArrowLeft,
  ArrowRight,
  Bell,
  BookOpen,
  Check,
  CheckCircle2,
  ChevronDown,
  CircleHelp,
  Clock3,
  GraduationCap,
  LayoutDashboard,
  LogIn,
  LogOut,
  MessageCircle,
  Plus,
  Search,
  Send,
  ShieldCheck,
  Sparkles,
  Users,
  X,
} from 'lucide-react'
import './App.css'

const SUBJECTS = ['DBMS', 'C Programming', 'Mathematics', 'Python', 'Data Structures']

const HELPERS = [
  {
    id: 'helper-aisha',
    name: 'Aisha Khan',
    initials: 'AK',
    subjects: ['DBMS', 'Python'],
    semester: '6th semester',
    availability: 'Available now',
    color: 'lavender',
    rating: '4.9',
    helped: 28,
  },
  {
    id: 'helper-rohan',
    name: 'Rohan Mehta',
    initials: 'RM',
    subjects: ['C Programming', 'Data Structures'],
    semester: '5th semester',
    availability: 'Available now',
    color: 'blue',
    rating: '4.8',
    helped: 34,
  },
  {
    id: 'helper-priya',
    name: 'Priya Sharma',
    initials: 'PS',
    subjects: ['Mathematics', 'Data Structures'],
    semester: '7th semester',
    availability: 'Available today',
    color: 'peach',
    rating: '5.0',
    helped: 41,
  },
  {
    id: 'helper-arjun',
    name: 'Arjun Das',
    initials: 'AD',
    subjects: ['Python', 'DBMS', 'Data Structures'],
    semester: '6th semester',
    availability: 'Available now',
    color: 'mint',
    rating: '4.9',
    helped: 22,
  },
]

const AI_HELPER = {
  id: 'helper-ai',
  name: 'PeerBridge AI',
  initials: 'AI',
  subjects: SUBJECTS,
  semester: 'AI study buddy',
  availability: 'Instant replies',
  color: 'indigo',
}

const INITIAL_DOUBTS = [
  {
    id: 'sample-normalization',
    title: 'Explain normalization in DBMS.',
    subject: 'DBMS',
    topic: '1NF, 2NF & 3NF',
    description: 'I understand the definitions but I am not sure how to apply them to a table.',
    urgency: 'Medium',
    status: 'pending',
    helperId: null,
    createdAt: Date.now() - 1000 * 60 * 38,
  },
  {
    id: 'sample-binary-search',
    title: 'How does binary search work?',
    subject: 'Data Structures',
    topic: 'Searching algorithms',
    description: 'Could someone walk me through how the search space gets smaller?',
    urgency: 'Low',
    status: 'connected',
    helperId: 'helper-priya',
    createdAt: Date.now() - 1000 * 60 * 60 * 3,
  },
  {
    id: 'sample-pointers',
    title: 'Explain pointers in C.',
    subject: 'C Programming',
    topic: 'Pointers',
    description: 'I am getting confused between a pointer and the value it points to.',
    urgency: 'High',
    status: 'pending',
    helperId: null,
    createdAt: Date.now() - 1000 * 60 * 60 * 7,
  },
  {
    id: 'sample-bfs-dfs',
    title: 'Difference between BFS and DFS.',
    subject: 'Data Structures',
    topic: 'Graph traversal',
    description: 'When should I use each traversal method?',
    urgency: 'Low',
    status: 'resolved',
    helperId: 'helper-rohan',
    createdAt: Date.now() - 1000 * 60 * 60 * 24,
  },
]

function readStorage(key, fallback) {
  try {
    const savedValue = window.localStorage.getItem(key)
    return savedValue === null ? fallback : JSON.parse(savedValue)
  } catch (error) {
    console.error(`Unable to read ${key} from local storage.`, error)
    return fallback
  }
}

function saveStorage(key, value, setToast) {
  try {
    window.localStorage.setItem(key, JSON.stringify(value))
    return true
  } catch (error) {
    console.error(`Unable to save ${key} to local storage.`, error)
    setToast('Your change could not be saved. Please check your browser storage.')
    return false
  }
}

function formatTime(timestamp) {
  const difference = Math.max(0, Date.now() - timestamp)
  const minutes = Math.floor(difference / 60000)
  if (minutes < 1) return 'Just now'
  if (minutes < 60) return `${minutes} min ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours} hr ago`
  return `${Math.floor(hours / 24)} day ago`
}

function createStudyAnswer(doubt, prompt) {
  const question = `${doubt.title} ${doubt.topic} ${prompt}`.toLowerCase()
  let explanation

  if (doubt.subject === 'DBMS') {
    if (/normaliz|1nf|2nf|3nf/.test(question)) {
      explanation = 'Normalization organizes related data into tables to reduce duplication and update errors. 1NF means each cell holds one value; 2NF removes dependencies on only part of a composite key; 3NF removes dependencies between non-key columns. For example, keep student details in a Student table and reference student_id from an Enrollment table.'
    } else if (/join/.test(question)) {
      explanation = 'A JOIN combines rows from two tables using a related column. INNER JOIN keeps only matching rows; LEFT JOIN keeps every row from the left table and fills missing matches with NULL. For example, join Students and Enrollments on student_id to see each student’s courses.'
    } else {
      explanation = 'Start with the tables and the result you want. Identify the primary key, then check how each column depends on that key. For a query, decide which tables contain the needed data and connect them through their related keys.'
    }
  } else if (doubt.subject === 'C Programming') {
    explanation = 'A pointer stores the memory address of another variable. For example: int value = 10; int *ptr = &value;. The & operator gets value’s address, and *ptr reads the value at that address (10). Changing *ptr changes value itself.'
  } else if (doubt.subject === 'Data Structures') {
    if (/binary|search/.test(question)) {
      explanation = 'Binary search works on a sorted list. Check the middle item: if it is too small, discard the left half; if it is too large, discard the right half. Repeat on the remaining half. The search takes O(log n) time because the search space halves each step.'
    } else if (/bfs|dfs|breadth|depth/.test(question)) {
      explanation = 'BFS visits a graph level by level using a queue, which is useful for the shortest path in an unweighted graph. DFS follows one path as far as it can before backtracking, using a stack or recursion. Both run in O(V + E) time with an adjacency list.'
    } else {
      explanation = 'First identify the operations you need most (such as lookup, insertion, or removing the next item). A stack is last-in, first-out; a queue is first-in, first-out; a tree organizes values hierarchically. Choosing the structure around the operation makes the solution easier to reason about.'
    }
  } else if (doubt.subject === 'Python') {
    if (/list|dict|dictionary/.test(question)) {
      explanation = 'A Python list is an ordered collection accessed by position, such as names[0]. A dictionary stores key-value pairs, such as student["name"], and is useful when you want to look up a value by a meaningful key.'
    } else if (/loop|for|while/.test(question)) {
      explanation = 'Use a for loop when you want to visit each item in a sequence. Use a while loop when repetition should continue until a condition changes. Make sure the while-loop condition can become false so it does not run forever.'
    } else {
      explanation = 'Break the task into small steps, store values in clearly named variables, and test one case at a time. In Python, a function lets you give a reusable block of logic a name and return a result with return.'
    }
  } else {
    if (/derivative|differentiat/.test(question)) {
      explanation = 'For a power function, use the power rule: d(xⁿ)/dx = n·xⁿ⁻¹. For example, the derivative of 3x² is 6x. Apply the rule to each term, then simplify.'
    } else if (/integrat/.test(question)) {
      explanation = 'For a power function, the reverse power rule is ∫xⁿ dx = xⁿ⁺¹/(n+1) + C (when n ≠ -1). For example, ∫3x² dx = x³ + C. Differentiate your result to check it.'
    } else if (/limit/.test(question)) {
      explanation = 'For a limit, first try substituting the value directly. If you get an indeterminate form such as 0/0, simplify or factor the expression and cancel the common factor before substituting again.'
    } else {
      explanation = `For ${doubt.topic}, write down what is given and what you need to find, then choose the definition or formula that connects them. Work one algebra step at a time and substitute the values at the end.`
    }
  }

  return `${explanation}\n\nIf you share a specific step or example, I can help break it down further.`
}

async function requestAiAnswer(doubt, history, question) {
  const response = await fetch('/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      subject: doubt.subject,
      topic: doubt.topic,
      question: `${doubt.title}\n${question}`,
      history: history.map(({ sender, text }) => ({ sender, text })),
    }),
  })
  const result = await response.json()
  if (!response.ok) throw new Error(result.error || 'Gemini could not answer right now.')
  if (typeof result.reply !== 'string' || !result.reply.trim()) {
    throw new Error('Gemini returned an invalid answer. Please try again.')
  }
  return result.reply.trim()
}

function Avatar({ helper, size = 'regular' }) {
  return (
    <div className={`avatar avatar-${helper.color} avatar-${size}`} aria-label={helper.name}>
      {helper.initials}
    </div>
  )
}

function Brand({ compact = false }) {
  return (
    <div className={`brand ${compact ? 'brand-compact' : ''}`}>
      <div className="brand-mark"><BookOpen size={19} strokeWidth={2.2} /></div>
      <span>peer<span>bridge</span></span>
    </div>
  )
}

function App() {
  const [studentName, setStudentName] = useState(() => readStorage('peerbridge.studentName', ''))
  const [screen, setScreen] = useState('login')
  const [doubts, setDoubts] = useState(() => readStorage('peerbridge.doubts', INITIAL_DOUBTS))
  const [messages, setMessages] = useState(() => readStorage('peerbridge.messages', []))
  const [selectedDoubtId, setSelectedDoubtId] = useState(() => (
    readStorage('peerbridge.doubts', INITIAL_DOUBTS).find((doubt) => doubt.status === 'pending')?.id
    ?? INITIAL_DOUBTS[0].id
  ))
  const [toast, setToast] = useState('')
  const [aiStatus, setAiStatus] = useState({ state: 'checking', model: '' })
  const [aiBusy, setAiBusy] = useState(false)
  const [helperFilter, setHelperFilter] = useState('All subjects')
  const [searchQuery, setSearchQuery] = useState('')
  const [messageDraft, setMessageDraft] = useState('')
  const [doubtForm, setDoubtForm] = useState({
    title: '',
    subject: 'DBMS',
    topic: '',
    description: '',
    urgency: 'Medium',
  })

  useEffect(() => {
    if (!toast) return undefined
    const timeoutId = window.setTimeout(() => setToast(''), 3200)
    return () => window.clearTimeout(timeoutId)
  }, [toast])

  useEffect(() => {
    let active = true
    fetch('/api/health')
      .then(async (response) => {
        if (!response.ok) throw new Error('PeerBridge AI server is unavailable.')
        return response.json()
      })
      .then((health) => {
        if (active) {
          setAiStatus({
            state: health.configured ? 'ready' : 'missing-key',
            model: health.model || '',
          })
        }
      })
      .catch((error) => {
        console.error('Unable to check Gemini configuration.', error)
        if (active) setAiStatus({ state: 'offline', model: '' })
      })
    return () => { active = false }
  }, [])

  const selectedDoubt = doubts.find((doubt) => doubt.id === selectedDoubtId) ?? doubts[0]
  const selectedHelper = selectedDoubt?.helperId === AI_HELPER.id
    ? AI_HELPER
    : HELPERS.find((helper) => helper.id === selectedDoubt?.helperId)
  const pendingCount = doubts.filter((doubt) => doubt.status === 'pending').length
  const connectedCount = doubts.filter((doubt) => doubt.status === 'connected').length
  const resolvedCount = doubts.filter((doubt) => doubt.status === 'resolved').length

  const visibleHelpers = useMemo(() => HELPERS.filter((helper) => {
    const matchesSubject = helperFilter === 'All subjects' || helper.subjects.includes(helperFilter)
    const matchesSearch = `${helper.name} ${helper.subjects.join(' ')}`
      .toLowerCase()
      .includes(searchQuery.toLowerCase().trim())
    return matchesSubject && matchesSearch
  }), [helperFilter, searchQuery])

  function login(event) {
    event.preventDefault()
    const name = studentName.trim()
    if (!name) return
    if (saveStorage('peerbridge.studentName', name, setToast)) {
      setStudentName(name)
      setScreen('dashboard')
    }
  }

  function submitDoubt(event) {
    event.preventDefault()
    const doubt = {
      ...doubtForm,
      id: `doubt-${Date.now()}`,
      title: doubtForm.title.trim(),
      topic: doubtForm.topic.trim(),
      description: doubtForm.description.trim(),
      status: 'pending',
      helperId: null,
      createdAt: Date.now(),
    }
    const updatedDoubts = [doubt, ...doubts]
    if (!saveStorage('peerbridge.doubts', updatedDoubts, setToast)) return
    setDoubts(updatedDoubts)
    setSelectedDoubtId(doubt.id)
    setHelperFilter(doubt.subject)
    setSearchQuery('')
    setDoubtForm({ title: '', subject: 'DBMS', topic: '', description: '', urgency: 'Medium' })
    setScreen('helpers')
    setToast('Your doubt is posted. Choose a peer to get started.')
  }

  function connectHelper(helper) {
    const doubt = doubts.find((item) => item.id === selectedDoubtId)
      ?? doubts.find((item) => item.status === 'pending')
    if (!doubt) {
      setToast('Post a doubt first so a helper knows what you need.')
      setScreen('post')
      return
    }
    if (doubt.status === 'connected' && doubt.helperId === helper.id) {
      setSelectedDoubtId(doubt.id)
      setScreen('chat')
      return
    }
    const updatedDoubts = doubts.map((item) => (
      item.id === doubt.id ? { ...item, status: 'connected', helperId: helper.id } : item
    ))
    const greeting = {
      id: `message-${Date.now()}`,
      doubtId: doubt.id,
      sender: 'helper',
      text: `Hi! I’m ${helper.name}. I saw your question and would be happy to work through it with you.`,
      createdAt: Date.now(),
    }
    const updatedMessages = [...messages, greeting]
    if (!saveStorage('peerbridge.doubts', updatedDoubts, setToast)) return
    if (!saveStorage('peerbridge.messages', updatedMessages, setToast)) return
    setDoubts(updatedDoubts)
    setMessages(updatedMessages)
    setSelectedDoubtId(doubt.id)
    setScreen('chat')
    setToast(`Request sent to ${helper.name}. You’re connected!`)
  }

  async function appendAiReply(doubt, history, question, baseMessages) {
    setAiBusy(true)
    let reply
    let mode
    try {
      reply = await requestAiAnswer(doubt, history, question)
      mode = 'gemini'
    } catch (error) {
      console.error('Gemini answer failed; using the local demo response.', error)
      reply = createStudyAnswer(doubt, question)
      mode = 'offline'
      setAiStatus((current) => ({ ...current, state: 'unavailable' }))
      setToast(`${error.message} Showing a local demo answer instead.`)
    }

    const updatedMessages = [
      ...baseMessages,
      {
        id: `message-${Date.now()}`,
        doubtId: doubt.id,
        sender: 'helper',
        text: reply,
        mode,
        createdAt: Date.now(),
      },
    ]
    if (saveStorage('peerbridge.messages', updatedMessages, setToast)) setMessages(updatedMessages)
    setAiBusy(false)
  }

  function startAiChat() {
    if (!selectedDoubt) return
    const updatedDoubts = doubts.map((doubt) => (
      doubt.id === selectedDoubt.id
        ? { ...doubt, status: 'connected', helperId: AI_HELPER.id }
        : doubt
    ))
    if (!saveStorage('peerbridge.doubts', updatedDoubts, setToast)) return
    setDoubts(updatedDoubts)
    setScreen('chat')
    setToast(aiStatus.state === 'ready'
      ? 'Asking Gemini for an explanation…'
      : 'Gemini is not configured. Opening the offline demo study buddy.')
    void appendAiReply(selectedDoubt, [], selectedDoubt.description, messages)
  }

  function sendMessage(event) {
    event.preventDefault()
    const text = messageDraft.trim()
    if (!text || !selectedDoubt) return
    const now = Date.now()
    const newMessages = [{
      id: `message-${now}`,
      doubtId: selectedDoubt.id,
      sender: 'student',
      text,
      createdAt: now,
    }]
    const updatedMessages = [...messages, ...newMessages]
    if (!saveStorage('peerbridge.messages', updatedMessages, setToast)) return
    setMessages(updatedMessages)
    setMessageDraft('')
    if (selectedDoubt.helperId === AI_HELPER.id) {
      void appendAiReply(
        selectedDoubt,
        messages.filter((message) => message.doubtId === selectedDoubt.id),
        text,
        updatedMessages,
      )
    }
  }

  function resolveDoubt() {
    if (!selectedDoubt) return
    const updatedDoubts = doubts.map((doubt) => (
      doubt.id === selectedDoubt.id ? { ...doubt, status: 'resolved' } : doubt
    ))
    if (!saveStorage('peerbridge.doubts', updatedDoubts, setToast)) return
    setDoubts(updatedDoubts)
    setScreen('dashboard')
    setToast('Marked as resolved. Nice work learning together!')
  }

  function openDoubt(doubt) {
    setSelectedDoubtId(doubt.id)
    setScreen(doubt.status === 'pending' ? 'helpers' : 'chat')
  }

  function handleFlowStep(step) {
    if (step === 'login') {
      setScreen('login')
      return
    }
    if (step === 'post') {
      setScreen('post')
      return
    }
    const connectedDoubt = doubts.find((doubt) => doubt.status === 'connected')
    const pendingDoubt = doubts.find((doubt) => doubt.status === 'pending')
    const nextDoubt = connectedDoubt ?? pendingDoubt

    if (step === 'helpers') {
      if (nextDoubt) {
        setSelectedDoubtId(nextDoubt.id)
        setHelperFilter(nextDoubt.subject)
      }
      setSearchQuery('')
      setScreen('helpers')
      return
    }
    if (connectedDoubt) {
      setSelectedDoubtId(connectedDoubt.id)
      setScreen('chat')
      if (step === 'resolve') setToast('Use “Mark as resolved” in the study chat when you’re ready.')
      return
    }
    if (pendingDoubt) {
      setSelectedDoubtId(pendingDoubt.id)
      setHelperFilter(pendingDoubt.subject)
      setSearchQuery('')
      setScreen('helpers')
      setToast('Connect with a peer or ask the AI study buddy to start a chat.')
      return
    }
    setScreen('post')
    setToast('Post a doubt first to start a study session.')
  }

  function logout() {
    if (!saveStorage('peerbridge.studentName', '', setToast)) return
    setStudentName('')
    setScreen('login')
  }

  if (screen === 'login') {
    return (
      <div className="login-page">
        <section className="login-story">
          <Brand />
          <div className="story-content">
            <div className="eyebrow eyebrow-light"><Sparkles size={14} /> YOUR CAMPUS, CONNECTED</div>
            <h1>Better together.<br /><span>Every subject.</span></h1>
            <p>Find a fellow student who can make that tricky topic finally click.</p>
            <div className="story-note">
              <div className="story-note-icon"><MessageCircle size={20} /></div>
              <div>
                <strong>Small questions. Big breakthroughs.</strong>
                <span>Learning is better when it’s shared.</span>
              </div>
            </div>
          </div>
          <div className="login-orbit orbit-one" />
          <div className="login-orbit orbit-two" />
          <div className="login-footer">A little help goes a long way.</div>
        </section>
        <main className="login-form-wrap">
          <div className="mobile-login-brand"><Brand /></div>
          <div className="login-form-card">
            <div className="form-icon"><GraduationCap size={24} /></div>
            <p className="eyebrow">WELCOME TO PEERBRIDGE</p>
            <h2>Let’s get you connected</h2>
            <p className="login-subtitle">Enter your name to explore your student dashboard.</p>
            <form onSubmit={login}>
              <label className="field-label" htmlFor="student-name">Your name</label>
              <input
                id="student-name"
                className="text-input"
                autoComplete="name"
                placeholder="e.g. Maya Patel"
                value={studentName}
                onChange={(event) => setStudentName(event.target.value)}
                required
              />
              <button className="button button-primary login-button" type="submit">
                Demo login <ArrowRight size={17} />
              </button>
            </form>
            <div className="login-safe"><ShieldCheck size={15} /> Just a demo — no password needed</div>
          </div>
          <div className="login-bottom">Made for students, by students <span>·</span> INT335 Design Thinking</div>
        </main>
      </div>
    )
  }

  return (
    <div className="app-shell min-h-screen">
      <aside className="sidebar">
        <Brand />
        <div className="sidebar-label">YOUR SPACE</div>
        <nav className="sidebar-nav" aria-label="Main navigation">
          <button
            className={`nav-item ${screen === 'dashboard' ? 'active' : ''}`}
            onClick={() => setScreen('dashboard')}
          >
            <LayoutDashboard size={18} /> Dashboard
          </button>
          <button
            className={`nav-item ${screen === 'helpers' ? 'active' : ''}`}
            onClick={() => setScreen('helpers')}
          >
            <Users size={18} /> Find a helper
            <span className="nav-dot" />
          </button>
        </nav>
        <div className="sidebar-bottom">
          <div className="sidebar-tip">
            <div className="tip-icon"><Sparkles size={16} /></div>
            <strong>Learning is better together</strong>
            <span>Share what you know. Ask what you don’t.</span>
          </div>
          <button className="user-menu" onClick={logout} title="Log out">
            <div className="student-avatar">{studentName.slice(0, 1).toUpperCase()}</div>
            <span className="user-menu-copy"><strong>{studentName}</strong><small>Student account</small></span>
            <LogOut size={16} />
          </button>
        </div>
      </aside>

      <main className="main-panel">
        <header className="topbar">
          <div className="mobile-brand"><Brand compact /></div>
          <div className="breadcrumb">
            <span>PeerBridge</span><span className="breadcrumb-slash">/</span>
            <strong>{screen === 'dashboard' ? 'Dashboard' : screen === 'post' ? 'Post a doubt' : screen === 'helpers' ? 'Find a helper' : 'Study room'}</strong>
          </div>
          <div className="topbar-actions">
            <div className="topbar-date">Your campus study space</div>
            <button className="icon-button notification-button" aria-label="Notifications" onClick={() => setToast('You’re all caught up!')}>
              <Bell size={18} /><span />
            </button>
            <div className="topbar-avatar">{studentName.slice(0, 1).toUpperCase()}</div>
          </div>
        </header>

        <div className="page-content">
          {screen === 'dashboard' && (
            <Dashboard
              name={studentName}
              doubts={doubts}
              pendingCount={pendingCount}
              connectedCount={connectedCount}
              resolvedCount={resolvedCount}
              onPost={() => setScreen('post')}
              onFindHelpers={() => setScreen('helpers')}
              onFlowStep={handleFlowStep}
              onOpenDoubt={openDoubt}
              onConnect={connectHelper}
            />
          )}
          {screen === 'post' && (
            <PostDoubt
              form={doubtForm}
              setForm={setDoubtForm}
              onSubmit={submitDoubt}
              onBack={() => setScreen('dashboard')}
            />
          )}
          {screen === 'helpers' && (
            <FindHelpers
              helpers={visibleHelpers}
              filter={helperFilter}
              setFilter={setHelperFilter}
              search={searchQuery}
              setSearch={setSearchQuery}
              doubt={selectedDoubt}
              onBack={() => setScreen('dashboard')}
              onConnect={connectHelper}
              onAskAi={startAiChat}
              aiStatus={aiStatus}
            />
          )}
          {screen === 'chat' && selectedDoubt && (
            <Chat
              doubt={selectedDoubt}
              helper={selectedHelper}
              studentName={studentName}
              messages={messages.filter((message) => message.doubtId === selectedDoubt.id)}
              messageDraft={messageDraft}
              setMessageDraft={setMessageDraft}
              aiBusy={aiBusy}
              aiStatus={aiStatus}
              onSend={sendMessage}
              onResolve={resolveDoubt}
              onBack={() => setScreen('dashboard')}
            />
          )}
        </div>
      </main>
      {toast && (
        <div className="toast" role="status">
          <CheckCircle2 size={18} /><span>{toast}</span>
          <button onClick={() => setToast('')} aria-label="Dismiss notification"><X size={16} /></button>
        </div>
      )}
    </div>
  )
}

function Dashboard({ name, doubts, pendingCount, connectedCount, resolvedCount, onPost, onFindHelpers, onFlowStep, onOpenDoubt, onConnect }) {
  const firstName = name.split(' ')[0]
  const recentDoubts = [...doubts].sort((a, b) => b.createdAt - a.createdAt).slice(0, 4)

  return (
    <>
      <section className="welcome-banner">
        <div className="welcome-copy">
          <div className="eyebrow eyebrow-light"><span className="welcome-dot" /> YOUR PEER LEARNING SPACE</div>
          <h1>Good to see you, {firstName} <span className="wave">✦</span></h1>
          <p>Got a question? There’s a classmate who can help.</p>
          <button className="button button-white" onClick={onPost}><Plus size={17} /> Post a doubt</button>
        </div>
        <div className="welcome-art" aria-hidden="true">
          <div className="art-glow" />
          <div className="art-book"><BookOpen size={46} strokeWidth={1.4} /></div>
          <div className="art-orbit orbit-a" />
          <div className="art-orbit orbit-b" />
          <div className="art-star star-a">✦</div><div className="art-star star-b">✳</div>
        </div>
        <div className="banner-decoration banner-decoration-one" />
        <div className="banner-decoration banner-decoration-two" />
      </section>

      <UserFlowGraph onSelectStep={onFlowStep} />

      <div className="section-heading dashboard-stats-heading">
        <div><h2>Your learning snapshot</h2><p>A little progress, one question at a time.</p></div>
        <span className="last-updated"><span className="online-dot" /> Updated just now</span>
      </div>
      <div className="stats-grid">
        <StatCard label="Total doubts" value={doubts.length} icon={<CircleHelp size={19} />} tone="indigo" detail="Questions shared" />
        <StatCard label="Waiting for help" value={pendingCount} icon={<Clock3 size={19} />} tone="amber" detail="Ready for a peer" />
        <StatCard label="In a study session" value={connectedCount} icon={<MessageCircle size={19} />} tone="blue" detail="Learning together" />
        <StatCard label="Resolved" value={resolvedCount} icon={<CheckCircle2 size={19} />} tone="green" detail="Nice work!" />
      </div>

      <div className="dashboard-columns">
        <section className="panel recent-panel">
          <div className="panel-heading">
            <div><h2>Recent doubts</h2><p>Your questions and their progress</p></div>
            <button className="text-button" onClick={onPost}>New doubt <ArrowRight size={15} /></button>
          </div>
          {recentDoubts.length ? (
            <div className="doubt-list">
              {recentDoubts.map((doubt) => {
                const helper = doubt.helperId === AI_HELPER.id
                  ? AI_HELPER
                  : HELPERS.find((item) => item.id === doubt.helperId)
                return (
                  <button className="doubt-row" key={doubt.id} onClick={() => onOpenDoubt(doubt)}>
                    <div className={`doubt-subject-icon subject-${SUBJECTS.indexOf(doubt.subject) % 4}`}><BookOpen size={17} /></div>
                    <div className="doubt-row-main">
                      <strong>{doubt.title}</strong>
                      <span>{doubt.subject} <i>·</i> {formatTime(doubt.createdAt)}</span>
                    </div>
                    <div className="doubt-row-end">
                      {helper && <div className="mini-helper"><Avatar helper={helper} size="mini" /><span>{helper.name.split(' ')[0]}</span></div>}
                      <StatusBadge status={doubt.status} />
                    </div>
                    <ArrowRight className="row-arrow" size={16} />
                  </button>
                )
              })}
            </div>
          ) : (
            <div className="empty-state"><CircleHelp size={26} /><strong>Your next question starts here</strong><span>Post a doubt to find a classmate who can help.</span><button className="button button-primary" onClick={onPost}>Post a doubt</button></div>
          )}
          <button className="list-footer" onClick={onFindHelpers}>Explore all peer helpers <ArrowRight size={15} /></button>
        </section>

        <section className="panel helper-preview-panel">
          <div className="panel-heading">
            <div><h2>Peers ready to help</h2><p>Friendly faces from your campus</p></div>
            <button className="icon-button panel-more" aria-label="Find more helpers" onClick={onFindHelpers}><ArrowRight size={17} /></button>
          </div>
          <div className="preview-helper-list">
            {HELPERS.slice(0, 3).map((helper) => (
              <div className="preview-helper" key={helper.id}>
                <div className="avatar-wrap"><Avatar helper={helper} /><span className="availability-dot" /></div>
                <div className="preview-helper-copy">
                  <strong>{helper.name}</strong>
                  <span>{helper.subjects.slice(0, 2).join(' · ')}</span>
                </div>
                <button className="connect-mini" onClick={() => onConnect(helper)} aria-label={`Connect with ${helper.name}`}><ArrowDownRight size={17} /></button>
              </div>
            ))}
          </div>
          <button className="browse-helper-button" onClick={onFindHelpers}><Users size={16} /> Browse all helpers</button>
        </section>
      </div>
    </>
  )
}

function UserFlowGraph({ onSelectStep }) {
  const steps = [
    { id: 'login', title: 'Log in', detail: 'Enter your name', icon: <LogIn size={17} /> },
    { id: 'post', title: 'Post a doubt', detail: 'Share your question', icon: <CircleHelp size={17} /> },
    { id: 'helpers', title: 'Find a helper', detail: 'Choose a peer or AI', icon: <Users size={17} /> },
    { id: 'chat', title: 'Study chat', detail: 'Talk it through', icon: <MessageCircle size={17} /> },
    { id: 'resolve', title: 'Resolve', detail: 'Mark it complete', icon: <CheckCircle2 size={17} /> },
  ]

  return (
    <section className="panel journey-panel" aria-labelledby="journey-title">
      <div className="journey-heading">
        <div>
          <p className="eyebrow">HOW PEERBRIDGE WORKS</p>
          <h2 id="journey-title">Your peer-learning journey</h2>
        </div>
        <span>Choose a step to jump in</span>
      </div>
      <div className="journey-flow">
        {steps.map((step, index) => (
          <div className="journey-step-wrap" key={step.id}>
            <button className="journey-step" onClick={() => onSelectStep(step.id)} aria-label={`${step.title}: ${step.detail}`}>
              <span className={`journey-icon journey-icon-${step.id}`}>{step.icon}</span>
              <span className="journey-step-copy"><strong>{step.title}</strong><small>{step.detail}</small></span>
            </button>
            {index < steps.length - 1 && <span className="journey-connector" aria-hidden="true"><ArrowRight size={14} /></span>}
          </div>
        ))}
      </div>
    </section>
  )
}

function StatCard({ label, value, icon, tone, detail }) {
  return (
    <div className="stat-card">
      <div className={`stat-icon stat-${tone}`}>{icon}</div>
      <div className="stat-copy"><span>{label}</span><strong>{value}</strong><small>{detail}</small></div>
    </div>
  )
}

function StatusBadge({ status }) {
  const labels = { pending: 'Waiting', connected: 'In session', resolved: 'Resolved' }
  return <span className={`status-badge status-${status}`}>{status === 'resolved' && <Check size={12} />}{labels[status]}</span>
}

function PostDoubt({ form, setForm, onSubmit, onBack }) {
  function update(field, value) {
    setForm((current) => ({ ...current, [field]: value }))
  }

  return (
    <div className="form-page">
      <button className="back-link" onClick={onBack}><ArrowLeft size={16} /> Back to dashboard</button>
      <div className="page-intro">
        <div className="page-icon page-icon-indigo"><CircleHelp size={21} /></div>
        <div><p className="eyebrow">ASK YOUR CAMPUS</p><h1>What are you stuck on?</h1><p>Share the details and we’ll find a peer who gets it.</p></div>
      </div>
      <form className="panel doubt-form" onSubmit={onSubmit}>
        <div className="form-section-title"><span>01</span><div><strong>Tell us about your question</strong><small>A clear question makes it easier for a peer to jump in.</small></div></div>
        <div className="form-grid">
          <div className="form-field form-field-full">
            <label className="field-label" htmlFor="question-title">Question title <span>*</span></label>
            <input id="question-title" className="text-input" placeholder="e.g. Explain normalization in DBMS" value={form.title} onChange={(event) => update('title', event.target.value)} maxLength={110} required />
          </div>
          <div className="form-field">
            <label className="field-label" htmlFor="question-subject">Subject <span>*</span></label>
            <div className="select-wrap"><select id="question-subject" className="text-input" value={form.subject} onChange={(event) => update('subject', event.target.value)} required>{SUBJECTS.map((subject) => <option key={subject}>{subject}</option>)}</select><ChevronDown size={16} /></div>
          </div>
          <div className="form-field">
            <label className="field-label" htmlFor="question-topic">Topic <span>*</span></label>
            <input id="question-topic" className="text-input" placeholder="e.g. Joins, recursion, limits" value={form.topic} onChange={(event) => update('topic', event.target.value)} maxLength={60} required />
          </div>
          <div className="form-field form-field-full">
            <label className="field-label" htmlFor="question-description">Add a little context <span>*</span></label>
            <textarea id="question-description" className="text-input textarea" placeholder="What have you tried so far? Which part would you like explained?" value={form.description} onChange={(event) => update('description', event.target.value)} rows={4} maxLength={500} required />
            <span className="character-count">{form.description.length}/500</span>
          </div>
        </div>
        <div className="urgency-section">
          <div className="field-label">How urgent is it?</div>
          <div className="urgency-options">
            {['Low', 'Medium', 'High'].map((level) => (
              <label className={`urgency-option ${form.urgency === level ? 'selected' : ''}`} key={level}>
                <input type="radio" name="urgency" value={level} checked={form.urgency === level} onChange={() => update('urgency', level)} />
                <span className={`urgency-mark urgency-${level.toLowerCase()}`} />
                <span><strong>{level}</strong><small>{level === 'Low' ? 'Whenever you can' : level === 'Medium' ? 'In the next few days' : 'As soon as possible'}</small></span>
              </label>
            ))}
          </div>
        </div>
        <div className="form-footer"><span><ShieldCheck size={15} /> Your question is only shared with student helpers.</span><button className="button button-primary" type="submit">Post &amp; find a helper <ArrowRight size={16} /></button></div>
      </form>
      <div className="form-reassurance"><Sparkles size={16} /> Every great study session starts with a question.</div>
    </div>
  )
}

function FindHelpers({ helpers, filter, setFilter, search, setSearch, doubt, onBack, onConnect, onAskAi, aiStatus }) {
  const onlineHelpers = doubt
    ? HELPERS.filter((helper) => helper.subjects.includes(doubt.subject) && helper.availability === 'Available now')
    : []

  return (
    <div className="helpers-page">
      <button className="back-link" onClick={onBack}><ArrowLeft size={16} /> Back to dashboard</button>
      <div className="helpers-heading">
        <div className="page-intro">
          <div className="page-icon page-icon-blue"><Users size={21} /></div>
          <div><p className="eyebrow">YOUR CAMPUS COMMUNITY</p><h1>Find your study buddy</h1><p>Real students, happy to help you get unstuck.</p></div>
        </div>
        <div className="helpers-count"><span className="online-dot" /> {helpers.length} {helpers.length === 1 ? 'peer matches' : 'peers match'}</div>
      </div>
      {doubt && (
        <div className="matching-doubt">
          <div className="matching-icon"><CircleHelp size={18} /></div>
          <div><small>FINDING A PEER FOR</small><strong>{doubt.title}</strong><span>{doubt.subject} <i>·</i> {doubt.topic}</span></div>
          <span className="status-badge status-pending">Waiting</span>
        </div>
      )}
      {doubt?.status === 'pending' && onlineHelpers.length === 0 && (
        <section className="ai-fallback-card">
          <div className="ai-fallback-icon"><Sparkles size={20} /></div>
          <div className="ai-fallback-copy">
            <small>NO {doubt.subject.toUpperCase()} HELPERS ONLINE RIGHT NOW</small>
            <strong>{aiStatus.state === 'ready' ? 'Get an explanation from Gemini AI.' : 'Get help from your AI study buddy.'}</strong>
            <span>
              {aiStatus.state === 'ready'
                ? `Connected to ${aiStatus.model}.`
                : 'Gemini needs a local API key; an offline demo answer is available meanwhile.'}
              {' '}Check answers against your course notes.
            </span>
          </div>
          <button className="button button-primary" onClick={onAskAi}>
            {aiStatus.state === 'ready' ? 'Ask Gemini AI' : 'Ask AI study buddy'} <ArrowRight size={16} />
          </button>
        </section>
      )}
      <div className="helper-toolbar">
        <div className="subject-filters" role="group" aria-label="Filter by subject">
          {['All subjects', ...SUBJECTS].map((subject) => (
            <button key={subject} className={`filter-chip ${filter === subject ? 'selected' : ''}`} onClick={() => setFilter(subject)}>{subject}</button>
          ))}
        </div>
        <label className="search-field"><Search size={16} /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search peers" aria-label="Search peers" />{search && <button onClick={() => setSearch('')} aria-label="Clear search"><X size={15} /></button>}</label>
      </div>
      <div className="helpers-grid">
        {helpers.map((helper) => {
          const alreadyConnected = doubt?.helperId === helper.id && doubt.status === 'connected'
          return (
            <article className="helper-card" key={helper.id}>
              <div className="helper-card-top"><div className="avatar-wrap"><Avatar helper={helper} size="large" /><span className="availability-dot" /></div><div className="helper-rating"><span>★</span> {helper.rating}</div></div>
              <h2>{helper.name}</h2><p className="helper-semester"><GraduationCap size={14} /> {helper.semester}</p>
              <div className="helper-subjects">{helper.subjects.map((subject) => <span key={subject}>{subject}</span>)}</div>
              <div className="helper-card-meta"><span><span className="online-dot" /> {helper.availability}</span><span>{helper.helped} students helped</span></div>
              <button className={`button ${alreadyConnected ? 'button-outline' : 'button-primary'} helper-connect`} onClick={() => onConnect(helper)}>
                {alreadyConnected ? <><MessageCircle size={16} /> Continue chat</> : <>Connect <ArrowRight size={16} /></>}
              </button>
            </article>
          )
        })}
      </div>
      {helpers.length === 0 && <div className="empty-state helper-empty"><Search size={27} /><strong>No peers found just yet</strong><span>Try a different subject or search term.</span><button className="button button-outline" onClick={() => { setFilter('All subjects'); setSearch('') }}>Clear filters</button></div>}
      <p className="helpers-note"><ShieldCheck size={15} /> PeerBridge connects you with fellow students. Be kind, be curious, learn together.</p>
    </div>
  )
}

function Chat({ doubt, helper, studentName, messages, messageDraft, setMessageDraft, aiBusy, aiStatus, onSend, onResolve, onBack }) {
  const conversationRef = useRef(null)
  const isResolved = doubt.status === 'resolved'
  const displayHelper = helper ?? HELPERS[0]
  const isAiHelper = displayHelper.id === AI_HELPER.id

  useEffect(() => {
    if (conversationRef.current) conversationRef.current.scrollTop = conversationRef.current.scrollHeight
  }, [messages])

  return (
    <div className="chat-page">
      <button className="back-link" onClick={onBack}><ArrowLeft size={16} /> Back to dashboard</button>
      <div className="chat-header panel">
        <div className="chat-header-main"><div className="chat-book"><BookOpen size={20} /></div><div><p className="eyebrow">{doubt.subject} <span>·</span> {doubt.topic}</p><h1>{doubt.title}</h1></div></div>
        <StatusBadge status={doubt.status} />
      </div>
      <div className="chat-layout">
        <section className="chat-room panel">
          <div className="chat-room-top">
            <div className="chat-participants">
              <div className="participant-stack"><div className="student-avatar student-avatar-small">{studentName.slice(0, 1).toUpperCase()}</div><Avatar helper={displayHelper} size="small" /></div>
              <div><strong>{studentName} <span>&amp;</span> {displayHelper.name}</strong><small><span className="online-dot" /> Study room · {isAiHelper ? 'AI study buddy' : displayHelper.availability.toLowerCase()}</small></div>
            </div>
            {!isResolved && <button className="button button-success" onClick={onResolve}><CheckCircle2 size={16} /> Mark as resolved</button>}
          </div>
          <div className="conversation" ref={conversationRef}>
            <div className="conversation-date"><span /> TODAY <span /></div>
            <div className="question-card">
              <span className="question-card-label"><CircleHelp size={14} /> YOUR QUESTION</span>
              <p>{doubt.description}</p>
              <span className="question-urgency"><span className={`urgency-mark urgency-${doubt.urgency.toLowerCase()}`} /> {doubt.urgency} priority</span>
            </div>
            <div className={`session-note ${isAiHelper ? 'ai-session-note' : ''}`}>
              {isAiHelper ? <Sparkles size={14} /> : <CheckCircle2 size={14} />}
              {isAiHelper
                ? aiStatus.state === 'ready'
                  ? `Gemini AI · ${aiStatus.model}`
                  : 'Offline demo mode · configure Gemini for live answers'
                : `You’re connected with ${displayHelper.name}. Say hello!`}
            </div>
            {messages.map((message) => {
              const isMine = message.sender === 'student'
              const senderName = isMine
                ? studentName
                : isAiHelper
                  ? message.mode === 'offline' ? 'PeerBridge AI · offline demo' : 'PeerBridge AI · Gemini'
                  : displayHelper.name
              return (
                <div className={`message-row ${isMine ? 'message-mine' : ''}`} key={message.id}>
                  {!isMine && <Avatar helper={displayHelper} size="mini" />}
                  <div className="message-content"><span>{senderName}</span><div className="message-bubble">{message.text}</div><small>{formatTime(message.createdAt)}</small></div>
                  {isMine && <div className="student-avatar student-avatar-small">{studentName.slice(0, 1).toUpperCase()}</div>}
                </div>
              )
            })}
            {isAiHelper && aiBusy && <div className="ai-typing" role="status"><Sparkles size={14} /> Gemini is working on an explanation…</div>}
            {isResolved && <div className="resolved-note"><CheckCircle2 size={16} /> This doubt has been marked as resolved. Great work!</div>}
          </div>
          <form className="chat-composer" onSubmit={onSend}>
            <input value={messageDraft} onChange={(event) => setMessageDraft(event.target.value)} placeholder={aiBusy ? 'Waiting for an answer…' : isResolved ? 'Send a follow-up message…' : 'Write a message…'} aria-label="Write a message" disabled={aiBusy} />
            <button className="button button-primary send-button" type="submit" disabled={!messageDraft.trim() || aiBusy} aria-label="Send message"><Send size={17} /><span>Send</span></button>
          </form>
          <div className="chat-footnote"><ShieldCheck size={14} /> Keep it kind. This is a peer-to-peer study space.</div>
        </section>
        <aside className="chat-sidebar">
          <section className="panel study-card">
            <p className="eyebrow">YOUR STUDY BUDDY</p>
            <div className="study-helper"><Avatar helper={displayHelper} size="large" /><div><strong>{displayHelper.name}</strong><span>{displayHelper.semester}</span></div></div>
            <div className="study-divider" />
            <span className="study-subject-label">CAN HELP WITH</span>
            <div className="helper-subjects">{displayHelper.subjects.map((subject) => <span key={subject}>{subject}</span>)}</div>
            {isAiHelper ? (
              <div className="study-stats">
                <span><strong>{aiStatus.state === 'ready' ? 'Connected' : 'Offline'}</strong> {aiStatus.state === 'ready' ? 'Gemini AI' : 'demo replies'}</span>
                <span>Verify details with your class notes</span>
              </div>
            ) : (
              <div className="study-stats"><span><strong>★ {displayHelper.rating}</strong> peer rating</span><span><strong>{displayHelper.helped}</strong> students helped</span></div>
            )}
          </section>
          <section className="panel study-tips">
            <div className="tip-icon"><Sparkles size={16} /></div><strong>Make it a great session</strong>
            <ul><li>Share where you got stuck</li><li>Ask follow-up questions</li><li>Thank your study buddy!</li></ul>
          </section>
        </aside>
      </div>
    </div>
  )
}

export default App
