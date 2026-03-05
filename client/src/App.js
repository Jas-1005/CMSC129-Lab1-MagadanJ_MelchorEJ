import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import "./App.css";

const API_BASE = process.env.REACT_APP_API_URL || "http://localhost:5000";

function App() {
  const [message, setMessage] = useState("");
  const [countryCode, setCountryCode] = useState("PH");
  const [messages, setMessages] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [showDeleted, setShowDeleted] = useState(false);

  const selected = useMemo(
    () => messages.find((item) => item._id === editingId),
    [messages, editingId]
  );

  const fetchMessages = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await axios.get(
        `${API_BASE}/api/messages?includeDeleted=${showDeleted}`
      );
      setMessages(response.data);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to load messages.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, [showDeleted]);

  const resetForm = () => {
    setMessage("");
    setCountryCode("PH");
    setEditingId(null);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!message.trim()) {
      setError("Message is required.");
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      const payload = { message: message.trim(), countryCode: countryCode.trim() };
      if (editingId) {
        await axios.put(`${API_BASE}/api/messages/${editingId}`, payload);
      } else {
        await axios.post(`${API_BASE}/api/messages`, payload);
      }
      resetForm();
      fetchMessages();
    } catch (err) {
      setError(err.response?.data?.error || "Failed to save message.");
    } finally {
      setSubmitting(false);
    }
  };

  const startEdit = (item) => {
    setEditingId(item._id);
    setMessage(item.message);
    setCountryCode(item.countryCode);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const softDelete = async (id) => {
    try {
      await axios.delete(`${API_BASE}/api/messages/${id}`);
      fetchMessages();
    } catch (err) {
      setError(err.response?.data?.error || "Failed to soft delete.");
    }
  };

  const restore = async (id) => {
    try {
      await axios.patch(`${API_BASE}/api/messages/${id}/restore`);
      fetchMessages();
    } catch (err) {
      setError(err.response?.data?.error || "Failed to restore.");
    }
  };

  const hardDelete = async (id) => {
    try {
      await axios.delete(`${API_BASE}/api/messages/${id}/hard`);
      if (editingId === id) resetForm();
      fetchMessages();
    } catch (err) {
      setError(err.response?.data?.error || "Failed to hard delete.");
    }
  };

  return (
    <main className="app">
      <section className="card">
        <div className="brand-row">
          <h1>anon</h1>
          <span>Speak to the void.</span>
        </div>

        <form className="composer" onSubmit={handleSubmit}>
          <label htmlFor="message">Message</label>
          <textarea
            id="message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            maxLength={280}
            placeholder="Drop an anonymous thought..."
          />

          <div className="form-row">
            <div>
              <label htmlFor="countryCode">Country Code</label>
              <input
                id="countryCode"
                value={countryCode}
                onChange={(e) => setCountryCode(e.target.value.toUpperCase())}
                maxLength={4}
                placeholder="PH"
              />
            </div>

            <button type="submit" disabled={submitting}>
              {submitting ? "Saving..." : editingId ? "Update Message" : "Post Message"}
            </button>
          </div>

          {editingId && (
            <button type="button" className="ghost" onClick={resetForm}>
              Cancel Edit
            </button>
          )}
        </form>

        <div className="toolbar">
          <button type="button" onClick={() => setShowDeleted((prev) => !prev)}>
            {showDeleted ? "Show Active Only" : "Show Including Deleted"}
          </button>
          <button type="button" className="ghost" onClick={fetchMessages}>
            Refresh
          </button>
        </div>

        {error && <p className="error">{error}</p>}
        {loading && <p className="info">Loading messages...</p>}
        {!loading && messages.length === 0 && (
          <p className="info">No messages found. Create one above.</p>
        )}

        <ul className="message-list">
          {messages.map((item) => (
            <li key={item._id} className={item.isDeleted ? "deleted" : ""}>
              <div className="message-head">
                <strong>{item.countryCode}</strong>
                <small>{new Date(item.createdAt).toLocaleString()}</small>
              </div>
              <p>{item.message}</p>
              <div className="actions">
                {!item.isDeleted && (
                  <>
                    <button type="button" onClick={() => startEdit(item)}>
                      Edit
                    </button>
                    <button type="button" onClick={() => softDelete(item._id)}>
                      Soft Delete
                    </button>
                  </>
                )}
                {item.isDeleted && (
                  <button type="button" onClick={() => restore(item._id)}>
                    Restore
                  </button>
                )}
                <button type="button" className="danger" onClick={() => hardDelete(item._id)}>
                  Hard Delete
                </button>
              </div>
            </li>
          ))}
        </ul>

        {selected && <p className="info">Editing: {selected.message.slice(0, 60)}</p>}
      </section>
    </main>
  );
}

export default App;
