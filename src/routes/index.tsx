import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Search, Plus, Trash2, Phone, Mail, Star, X } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Rolodex — Your Contacts" },
      { name: "description", content: "Keep the people you know close: add, search, and favorite contacts." },
      { property: "og:title", content: "Rolodex — Your Contacts" },
      { property: "og:description", content: "Add, search, and favorite contacts." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Index,
});

type Contact = { id: string; name: string; email: string; phone: string; company: string; fav: boolean };
const KEY = "rolodex-contacts";
const seed: Contact[] = [
  { id: "1", name: "Ada Lovelace", email: "ada@engine.io", phone: "+44 20 7946 0018", company: "Analytical Engines", fav: true },
  { id: "2", name: "Grace Hopper", email: "grace@cobol.dev", phone: "+1 202 555 0143", company: "US Navy", fav: false },
  { id: "3", name: "Alan Turing", email: "alan@bletchley.uk", phone: "+44 1908 640404", company: "Bletchley Park", fav: false },
];
const empty = { name: "", email: "", phone: "", company: "" };

function Index() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [q, setQ] = useState("");
  const [sel, setSel] = useState<string | null>(null);
  const [form, setForm] = useState<typeof empty | null>(null);

  useEffect(() => {
    const raw = localStorage.getItem(KEY);
    setContacts(raw ? JSON.parse(raw) : seed);
    setLoaded(true);
  }, []);
  useEffect(() => { if (loaded) localStorage.setItem(KEY, JSON.stringify(contacts)); }, [contacts, loaded]);

  const list = useMemo(() => contacts
    .filter((c) => (c.name + c.email + c.company + c.phone).toLowerCase().includes(q.toLowerCase()))
    .sort((a, b) => Number(b.fav) - Number(a.fav) || a.name.localeCompare(b.name)), [contacts, q]);
  const current = contacts.find((c) => c.id === sel);

  const save = () => {
    if (!form?.name.trim()) return;
    if (sel && current) setContacts(contacts.map((c) => (c.id === sel ? { ...c, ...form } : c)));
    else { const id = crypto.randomUUID(); setContacts([...contacts, { id, fav: false, ...form }]); setSel(id); }
    setForm(null);
  };
  const initials = (n: string) => n.split(" ").map((p) => p[0]).slice(0, 2).join("").toUpperCase();
  const input = "w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring";

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="mx-auto grid max-w-5xl gap-6 p-6 md:grid-cols-[320px_1fr]">
        <aside className="rounded-xl border bg-card p-4">
          <div className="mb-4 flex items-center justify-between">
            <h1 className="font-serif text-3xl">Rolodex</h1>
            <button aria-label="Add contact" onClick={() => { setSel(null); setForm({ ...empty }); }} className="rounded-full bg-primary p-2 text-primary-foreground"><Plus size={18} /></button>
          </div>
          <div className="relative mb-3">
            <Search size={16} className="absolute left-3 top-2.5 text-muted-foreground" />
            <input className={input + " pl-9"} placeholder="Search" value={q} onChange={(e) => setQ(e.target.value)} />
          </div>
          <ul className="space-y-1">
            {list.map((c) => (
              <li key={c.id}>
                <button onClick={() => { setSel(c.id); setForm(null); }} className={`flex w-full items-center gap-3 rounded-lg p-2 text-left hover:bg-accent ${sel === c.id ? "bg-accent" : ""}`}>
                  <span className="grid h-9 w-9 place-items-center rounded-full bg-secondary text-xs font-semibold text-secondary-foreground">{initials(c.name)}</span>
                  <span className="flex-1 truncate">{c.name}</span>
                  {c.fav && <Star size={14} className="fill-primary text-primary" />}
                </button>
              </li>
            ))}
            {loaded && list.length === 0 && <p className="p-2 text-sm text-muted-foreground">No contacts found.</p>}
          </ul>
        </aside>
        <main className="rounded-xl border bg-card p-8">
          {form ? (
            <div className="max-w-md space-y-3">
              <h2 className="font-serif text-2xl">{sel ? "Edit contact" : "New contact"}</h2>
              {(["name", "email", "phone", "company"] as const).map((k) => (
                <label key={k} className="block text-sm capitalize">{k}
                  <input className={input + " mt-1"} value={form[k]} onChange={(e) => setForm({ ...form, [k]: e.target.value })} />
                </label>
              ))}
              <div className="flex gap-2 pt-2">
                <button onClick={save} className="rounded-md bg-primary px-4 py-2 text-sm text-primary-foreground">Save</button>
                <button onClick={() => setForm(null)} className="rounded-md border px-4 py-2 text-sm">Cancel</button>
              </div>
            </div>
          ) : current ? (
            <div>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-4">
                  <span className="grid h-16 w-16 place-items-center rounded-full bg-primary text-xl font-semibold text-primary-foreground">{initials(current.name)}</span>
                  <div><h2 className="font-serif text-3xl">{current.name}</h2><p className="text-muted-foreground">{current.company}</p></div>
                </div>
                <div className="flex gap-1">
                  <button aria-label="Favorite" onClick={() => setContacts(contacts.map((c) => c.id === current.id ? { ...c, fav: !c.fav } : c))} className="rounded-md p-2 hover:bg-accent"><Star size={18} className={current.fav ? "fill-primary text-primary" : ""} /></button>
                  <button aria-label="Delete" onClick={() => { setContacts(contacts.filter((c) => c.id !== current.id)); setSel(null); }} className="rounded-md p-2 text-destructive hover:bg-accent"><Trash2 size={18} /></button>
                </div>
              </div>
              <div className="mt-8 space-y-3">
                {current.email && <a href={`mailto:${current.email}`} className="flex items-center gap-3 hover:underline"><Mail size={16} />{current.email}</a>}
                {current.phone && <a href={`tel:${current.phone}`} className="flex items-center gap-3 hover:underline"><Phone size={16} />{current.phone}</a>}
              </div>
              <button onClick={() => setForm({ name: current.name, email: current.email, phone: current.phone, company: current.company })} className="mt-8 rounded-md border px-4 py-2 text-sm">Edit</button>
            </div>
          ) : (
            <div className="grid h-full place-items-center text-muted-foreground"><p>Select a contact or add a new one.</p></div>
          )}
        </main>
      </div>
    </div>
  );
}
