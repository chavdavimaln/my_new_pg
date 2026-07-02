import React, { useState } from "react";
import { Edit2, MessageCircle, Paperclip, Send, Trash2 } from "lucide-react";
import AdminLayout from "../../Components/Layout/AdminLayout";
import { PageHeader, ThemePanel } from "../../Components/Layout/ThemeElements";
import { getChatThreads, logSendAction, saveChatThreads, todayISO } from "../../Utils/pgRequirementStore";

const channels = ["WhatsApp", "SMS", "Email", "Internal Note"];

const emptyForm = { contactName: "", phone: "", channel: "WhatsApp", message: "", attachment: null };

const ChatMessageCenter = () => {
    const [threads, setThreads] = useState(getChatThreads());
    const [form, setForm] = useState(emptyForm);
    const [query, setQuery] = useState("");
    const [channelFilter, setChannelFilter] = useState("All");
    const [sortKey, setSortKey] = useState("latest");
    const [editing, setEditing] = useState(null);

    const persistThreads = (next) => {
        setThreads(next);
        saveChatThreads(next);
    };

    const handleFile = (event) => {
        const file = event.target.files?.[0];
        if (!file) {
            setForm({ ...form, attachment: null });
            return;
        }

        const reader = new FileReader();
        reader.onload = () => {
            setForm({
                ...form,
                attachment: {
                    name: file.name,
                    type: file.type || "application/octet-stream",
                    size: file.size,
                    dataUrl: reader.result,
                },
            });
        };
        reader.readAsDataURL(file);
    };

    const saveMessage = (event) => {
        event.preventDefault();
        const message = {
            id: editing?.messageId || Date.now(),
            date: editing?.date || todayISO(),
            sender: "Admin",
            text: form.message,
            status: "Queued",
            attachment: form.attachment,
        };

        const next = editing
            ? threads.map((thread) =>
                  thread.id === editing.threadId
                      ? {
                            ...thread,
                            contactName: form.contactName,
                            phone: form.phone,
                            channel: form.channel,
                            messages: (thread.messages || []).map((item) =>
                                item.id === editing.messageId ? message : item,
                            ),
                        }
                      : thread,
              )
            : (() => {
                  const existing = threads.find((thread) => thread.phone === form.phone);
                  if (existing) {
                      return threads.map((thread) =>
                          thread.phone === form.phone
                              ? {
                                    ...thread,
                                    contactName: form.contactName || thread.contactName,
                                    channel: form.channel,
                                    messages: [message, ...(thread.messages || [])],
                                }
                              : thread,
                      );
                  }
                  return [
                      {
                          id: Date.now(),
                          contactName: form.contactName,
                          phone: form.phone,
                          channel: form.channel,
                          messages: [message],
                      },
                      ...threads,
                  ];
              })();

        persistThreads(next);
        logSendAction({ type: form.channel.toLowerCase(), module: "chat", target: form.phone, studentName: form.contactName });
        setForm(emptyForm);
        setEditing(null);
    };

    const editMessage = (thread, message) => {
        setEditing({ threadId: thread.id, messageId: message.id, date: message.date });
        setForm({
            contactName: thread.contactName || "",
            phone: thread.phone || "",
            channel: thread.channel || "WhatsApp",
            message: message.text || "",
            attachment: message.attachment || null,
        });
    };

    const deleteMessage = (threadId, messageId) => {
        persistThreads(
            threads
                .map((thread) =>
                    thread.id === threadId
                        ? { ...thread, messages: (thread.messages || []).filter((message) => message.id !== messageId) }
                        : thread,
                )
                .filter((thread) => (thread.messages || []).length),
        );
    };

    const deleteThread = (threadId) => {
        persistThreads(threads.filter((thread) => thread.id !== threadId));
    };

    const filteredThreads = threads
        .filter((thread) => channelFilter === "All" || thread.channel === channelFilter)
        .filter((thread) =>
            `${thread.contactName} ${thread.phone} ${thread.channel} ${(thread.messages || [])
                .map((item) => `${item.text} ${item.attachment?.name || ""}`)
                .join(" ")}`
                .toLowerCase()
                .includes(query.toLowerCase()),
        )
        .sort((a, b) => {
            if (sortKey === "name") return String(a.contactName || "").localeCompare(String(b.contactName || ""));
            if (sortKey === "channel") return String(a.channel || "").localeCompare(String(b.channel || ""));
            return String(b.messages?.[0]?.date || "").localeCompare(String(a.messages?.[0]?.date || ""));
        });

    return (
        <AdminLayout>
            <div className="space-y-6">
                <PageHeader
                    eyebrow="Messages"
                    title="Message & Chat Center"
                    description="Search, sort, edit, delete, and store message attachments for WhatsApp, SMS, email, and internal notes."
                />

                <div className="grid gap-6 xl:grid-cols-[0.75fr_1.25fr]">
                    <ThemePanel title={editing ? "Edit Message" : "New Message"} description="Files are stored in browser data now; Node API should store them on server/S3 later.">
                        <form className="space-y-3" onSubmit={saveMessage}>
                            <input className="pg-input" placeholder="Contact name" value={form.contactName} onChange={(event) => setForm({ ...form, contactName: event.target.value })} />
                            <input className="pg-input" placeholder="Phone / email" value={form.phone} onChange={(event) => setForm({ ...form, phone: event.target.value })} />
                            <select className="pg-input" value={form.channel} onChange={(event) => setForm({ ...form, channel: event.target.value })}>
                                {channels.map((channel) => <option key={channel}>{channel}</option>)}
                            </select>
                            <textarea className="pg-input" rows="5" placeholder="Message" value={form.message} onChange={(event) => setForm({ ...form, message: event.target.value })} />
                            <label className="flex cursor-pointer items-center gap-2 rounded-lg border bg-white px-3 py-2 text-sm font-semibold text-slate-600">
                                <Paperclip size={16} />
                                <span className="truncate">{form.attachment?.name || "Attach file"}</span>
                                <input className="hidden" type="file" onChange={handleFile} />
                            </label>
                            <div className="flex gap-2">
                                <button className="pg-button-primary flex-1" type="submit"><Send size={18} /> {editing ? "Update" : "Queue"}</button>
                                {editing && <button className="rounded-lg border px-4 text-sm font-bold" type="button" onClick={() => { setEditing(null); setForm(emptyForm); }}>Cancel</button>}
                            </div>
                        </form>
                    </ThemePanel>

                    <ThemePanel title="Messages List" description="Filter, sort, edit, delete, and download attached files.">
                        <div className="mb-4 grid gap-3 md:grid-cols-3">
                            <input className="pg-input" placeholder="Search messages..." value={query} onChange={(event) => setQuery(event.target.value)} />
                            <select className="pg-input" value={channelFilter} onChange={(event) => setChannelFilter(event.target.value)}>
                                <option>All</option>
                                {channels.map((channel) => <option key={channel}>{channel}</option>)}
                            </select>
                            <select className="pg-input" value={sortKey} onChange={(event) => setSortKey(event.target.value)}>
                                <option value="latest">Sort by latest</option>
                                <option value="name">Sort by name</option>
                                <option value="channel">Sort by channel</option>
                            </select>
                        </div>

                        <div className="space-y-4">
                            {filteredThreads.map((thread) => (
                                <div className="rounded-lg border p-4" key={thread.id}>
                                    <div className="mb-3 flex items-center gap-3">
                                        <span className="pg-icon-button"><MessageCircle size={17} /></span>
                                        <div className="min-w-0 flex-1">
                                            <p className="truncate font-bold">{thread.contactName || thread.phone}</p>
                                            <p className="text-sm text-slate-500">{thread.channel} - {thread.phone}</p>
                                        </div>
                                        <button className="text-red-500" type="button" onClick={() => deleteThread(thread.id)} title="Delete conversation"><Trash2 size={16} /></button>
                                    </div>

                                    <div className="space-y-2">
                                        {(thread.messages || []).map((message) => (
                                            <div className="rounded-lg bg-slate-50 p-3 text-sm" key={message.id}>
                                                <div className="flex flex-wrap items-start justify-between gap-2">
                                                    <p className="min-w-0 flex-1 break-words">{message.date} - {message.sender}: {message.text}</p>
                                                    <div className="flex gap-2">
                                                        <button className="text-violet-600" type="button" onClick={() => editMessage(thread, message)} title="Edit message"><Edit2 size={15} /></button>
                                                        <button className="text-red-500" type="button" onClick={() => deleteMessage(thread.id, message.id)} title="Delete message"><Trash2 size={15} /></button>
                                                    </div>
                                                </div>
                                                {message.attachment && (
                                                    <a className="mt-2 inline-flex max-w-full items-center gap-1 rounded border bg-white px-2 py-1 text-xs font-semibold text-violet-700" href={message.attachment.dataUrl} download={message.attachment.name}>
                                                        <Paperclip size={13} /> <span className="truncate">{message.attachment.name}</span> ({Math.ceil((message.attachment.size || 0) / 1024)} KB)
                                                    </a>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                            {!filteredThreads.length && <p className="text-slate-500">No messages matched.</p>}
                        </div>
                    </ThemePanel>
                </div>
            </div>
        </AdminLayout>
    );
};

export default ChatMessageCenter;
