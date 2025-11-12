import { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import Spline from '@splinetool/react-spline'

const neon = {
  coral: '#FF6B6B',
  peach: '#FFD56B',
  turquoise: '#48CFCB',
  violet: '#A46BF2',
}

function Countdown({ expiresAt }) {
  const [now, setNow] = useState(Date.now())
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(t)
  }, [])
  const text = useMemo(() => {
    const diff = Math.max(0, new Date(expiresAt).getTime() - now)
    const d = Math.floor(diff / (1000 * 60 * 60 * 24))
    const h = Math.floor((diff / (1000 * 60 * 60)) % 24)
    const m = Math.floor((diff / (1000 * 60)) % 60)
    const s = Math.floor((diff / 1000) % 60)
    return `${d}d ${h}h ${m}m ${s}s`
  }, [now, expiresAt])
  return (
    <div className="text-sm font-semibold tracking-wide text-white/90 drop-shadow">
      {text}
    </div>
  )
}

function Hero() {
  return (
    <div className="relative h-[70vh] w-full overflow-hidden">
      <Spline scene="https://prod.spline.design/xzUirwcZB9SOxUWt/scene.splinecode" style={{ width: '100%', height: '100%' }} />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/10 via-black/20 to-black/60" />
      <div className="absolute inset-0 flex items-center justify-center">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} className="text-center px-6">
          <h1 className="text-4xl sm:text-6xl font-semibold text-white drop-shadow-lg">
            PixFlow 2025
          </h1>
          <p className="mt-4 text-white/90 text-lg sm:text-xl">
            Photos that live for 15 days
          </p>
        </motion.div>
      </div>
    </div>
  )
}

function SearchBar({ onSearch }) {
  const [q, setQ] = useState('')
  return (
    <div className="max-w-3xl mx-auto -mt-12 z-10 relative">
      <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl p-2 flex gap-2 shadow-lg">
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search events" className="flex-1 bg-transparent outline-none text-white placeholder-white/60 px-4 py-3" />
        <button onClick={() => onSearch(q)} className="px-5 py-3 rounded-xl bg-gradient-to-r from-[#FF6B6B] via-[#FFD56B] to-[#48CFCB] text-black font-semibold shadow-[0_0_20px_rgba(164,107,242,0.5)]">
          Search
        </button>
      </div>
    </div>
  )
}

function EventCard({ ev, onOpen }) {
  return (
    <motion.button onClick={() => onOpen(ev)} whileHover={{ y: -4 }} className="group text-left rounded-2xl overflow-hidden bg-white/5 border border-white/15 backdrop-blur-xl shadow-xl">
      <div className="aspect-video w-full overflow-hidden">
        <img src={ev.cover_url} alt={ev.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
      </div>
      <div className="p-4">
        <div className="flex items-center justify-between">
          <h3 className="text-white font-semibold text-lg">{ev.title}</h3>
          <Countdown expiresAt={ev.expires_at} />
        </div>
        <p className="text-white/70 text-sm mt-1">{new Date(ev.date).toLocaleDateString()}</p>
      </div>
    </motion.button>
  )
}

function GalleryModal({ open, onClose, event, photos }) {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-white/5 border border-white/15 rounded-3xl max-w-6xl w-full h-[80vh] overflow-hidden flex flex-col">
        <div className="p-4 flex items-center justify-between">
          <div className="text-white font-semibold">{event?.title}</div>
          <button onClick={onClose} className="text-white/80 hover:text-white">Close</button>
        </div>
        <div className="px-4 pb-4 overflow-auto grid gap-3" style={{ gridTemplateColumns: 'repeat(auto-fill,minmax(220px,1fr))' }}>
          {photos.map((p) => (
            <motion.div key={p._id} initial={{ opacity: 0, scale: 0.98 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} className="rounded-xl overflow-hidden bg-black/30">
              <img src={p.watermarked_url} className="w-full h-56 object-cover" />
              <div className="p-2 flex items-center justify-between text-white/90 text-sm">
                <span>Photo</span>
                <a href={p.watermarked_url} download className="px-3 py-1 rounded-lg bg-gradient-to-r from-[#A46BF2] to-[#48CFCB] text-black font-semibold">Download</a>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  )
}

function App() {
  const API = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000'
  const [events, setEvents] = useState([])
  const [filtered, setFiltered] = useState([])
  const [modalOpen, setModalOpen] = useState(false)
  const [activeEvent, setActiveEvent] = useState(null)
  const [photos, setPhotos] = useState([])

  useEffect(() => {
    fetch(`${API}/api/events`).then(r => r.json()).then((data) => { setEvents(data); setFiltered(data) })
  }, [])

  const openEvent = async (ev) => {
    setActiveEvent(ev)
    const list = await fetch(`${API}/api/events/${ev._id}/photos`).then(r => r.json())
    setPhotos(list)
    setModalOpen(true)
  }

  const onSearch = (q) => {
    const s = q.trim().toLowerCase()
    if (!s) return setFiltered(events)
    setFiltered(events.filter(e => e.title.toLowerCase().includes(s)))
  }

  return (
    <div className="min-h-screen bg-[#0b0f1a] text-white">
      <Hero />
      <SearchBar onSearch={onSearch} />

      <section className="max-w-6xl mx-auto px-6 py-12">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-semibold">Live Events</h2>
          <div className="text-white/70 text-sm">Auto-hides after 15 days</div>
        </div>
        {filtered.length === 0 ? (
          <div className="text-white/60">No active events yet.</div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map(ev => (
              <EventCard key={ev._id} ev={ev} onOpen={openEvent} />
            ))}
          </div>
        )}
      </section>

      <GalleryModal open={modalOpen} onClose={() => setModalOpen(false)} event={activeEvent} photos={photos} />
    </div>
  )
}

export default App
