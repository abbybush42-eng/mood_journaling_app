import { useState } from "react";
import MoodSelector from "./MoodSelector";
import { updateEntry, deleteEntry } from "../services/api";

export default function EntryList({ entries, onUpdate }) {
  const [sortField, setSortField] = useState("date");
  const [sortOrder, setSortOrder] = useState("desc");
  const [editingEntryId, setEditingEntryId] = useState(null);
  const [editData, setEditData] = useState({ date: "", mood: "", note: "" });
  const [deletingEntryId, setDeletingEntryId] = useState(null);

  if (!entries || entries.length === 0) {
    return <div>No entries yet. Add your first journal entry above!</div>;
  }

  const formatDate = (dateString) => {
    const [year, month, day] = dateString.split("-").map(Number);
    const date = new Date(year, month - 1, day);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const startEdit = (entry) => {
    setEditingEntryId(entry.id);
    setEditData({
      date: entry.date,
      mood: String(entry.mood),
      note: entry.note || "",
    });
  };

  const saveEdit = async (entryId) => {
    try {
      await updateEntry(entryId, {
        date: editData.date,
        mood: Number(editData.mood),
        note: editData.note,
      });
      setEditingEntryId(null);
      setEditData({ date: "", mood: "", note: "" });
      if (onUpdate) onUpdate();
    } catch (error) {
      console.error("Failed to save edited entry", error);
    }
  };

  const cancelEdit = () => {
    setEditingEntryId(null);
    setEditData({ date: "", mood: "", note: "" });
  };

  const initiateDelete = (entryId) => {
    setDeletingEntryId(entryId);
  };

  const confirmDelete = async () => {
    if (deletingEntryId === null) return;
    try {
      await deleteEntry(deletingEntryId);
      setDeletingEntryId(null);
      if (onUpdate) onUpdate();
    } catch (error) {
      console.error("Failed to delete entry", error);
      setDeletingEntryId(null);
    }
  };

  const cancelDelete = () => {
    setDeletingEntryId(null);
  };

  const moodLabel = (moodValue) => {
    const moodMap = {
      1: "Very Sad",
      2: "Sad",
      3: "Neutral",
      4: "Happy",
      5: "Very Happy",
    };
    return moodMap[moodValue] || "Unknown";
  };

  const sortedEntries = [...entries].sort((a, b) => {
    if (sortField === "mood") {
      return sortOrder === "asc" ? a.mood - b.mood : b.mood - a.mood;
    }
    const [aYear, aMonth, aDay] = a.date.split("-").map(Number);
    const [bYear, bMonth, bDay] = b.date.split("-").map(Number);
    const dateA = new Date(aYear, aMonth - 1, aDay);
    const dateB = new Date(bYear, bMonth - 1, bDay);
    return sortOrder === "asc" ? dateA - dateB : dateB - dateA;
  });

  return (
    <div>
      <h2>Your Journal Entries</h2>
      <div style={{ display: "flex", gap: "8px", marginBottom: "12px" }}>
        <button
          type="button"
          onClick={() => {
            if (sortField === "date") {
              setSortOrder((current) => (current === "asc" ? "desc" : "asc"));
            } else {
              setSortField("date");
              setSortOrder("desc");
            }
          }}
          className="sort-button"
        >
          Date {sortField === "date" ? (sortOrder === "asc" ? "↑" : "↓") : "↓"}
        </button>

        <button
          type="button"
          onClick={() => {
            if (sortField === "mood") {
              setSortOrder((current) => (current === "asc" ? "desc" : "asc"));
            } else {
              setSortField("mood");
              setSortOrder("desc");
            }
          }}
          className="sort-button"
        >
          Mood {sortField === "mood" ? (sortOrder === "asc" ? "↑" : "↓") : "↓"}
        </button>
      </div>
      <div>
        {sortedEntries.map((entry) => (
          <div key={entry.id} className="entry-card">
            <div className="entry-top">
              {editingEntryId !== entry.id && (
                <div className="entry-top-buttons">
                  <button
                    type="button"
                    className="edit-button"
                    onClick={() => startEdit(entry)}
                  >
                    ✏️
                  </button>
                  <button
                    type="button"
                    className="delete-button"
                    onClick={() => initiateDelete(entry.id)}
                  >
                    Delete
                  </button>
                </div>
              )}
            </div>

            {editingEntryId === entry.id ? (
              <>
                <div className="entry-edit-row">
                  <div className="entry-edit-item">
                    <label htmlFor={`date-input-${entry.id}`}>Date</label>
                    <input
                      id={`date-input-${entry.id}`}
                      type="date"
                      value={editData.date}
                      onChange={(e) =>
                        setEditData((prev) => ({
                          ...prev,
                          date: e.target.value,
                        }))
                      }
                    />
                  </div>
                  <div className="entry-edit-item">
                    <MoodSelector
                      id={`mood-select-${entry.id}`}
                      value={editData.mood}
                      onChange={(e) =>
                        setEditData((prev) => ({
                          ...prev,
                          mood: e.target.value,
                        }))
                      }
                    />
                  </div>
                </div>
                <div>
                  <textarea
                    rows={3}
                    value={editData.note}
                    onChange={(e) =>
                      setEditData((prev) => ({ ...prev, note: e.target.value }))
                    }
                    className="entry-note-input"
                  />
                </div>
                <div className="edit-actions">
                  <button
                    type="button"
                    className="sort-button"
                    onClick={() => saveEdit(entry.id)}
                  >
                    Save
                  </button>
                  <button
                    type="button"
                    className="cancel-button"
                    onClick={cancelEdit}
                  >
                    Cancel
                  </button>
                </div>
              </>
            ) : (
              <>
                <div className="entry-header">
                  <span className="entry-meta">{formatDate(entry.date)}</span>
                  <span className="entry-meta">{moodLabel(entry.mood)}</span>
                </div>
                <div>{entry.note || ""}</div>
              </>
            )}
          </div>
        ))}
      </div>

      {deletingEntryId !== null && (
        <div className="modal-overlay">
          <div className="modal-content">
            <p>
              Are you sure you would like to delete this entry? You cannot
              recover it.
            </p>
            <div className="modal-actions">
              <button
                type="button"
                className="sort-button"
                onClick={confirmDelete}
              >
                Delete
              </button>
              <button
                type="button"
                className="cancel-button"
                onClick={cancelDelete}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
