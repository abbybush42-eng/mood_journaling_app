import { useState } from "react";
import MoodSelector from "./MoodSelector";

export default function EntryForm({ onSubmit }) {
  const [date, setDate] = useState("");
  const [mood, setMood] = useState("");
  const [note, setNote] = useState("");

  function handleSubmit(event) {
    event.preventDefault();

    const entry = { date, mood: Number(mood), note };

    if (onSubmit) {
      onSubmit(entry);
    } else {
      // fallback behavior while wiring integration
      console.log("Submitting journal entry:", entry);
    }

    // reset form after successful submit
    setDate("");
    setMood("");
    setNote("");
  }

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label htmlFor="entry-date">Date (YYYY-MM-DD)</label>
        <input
          id="entry-date"
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          required
        />
      </div>

      <div>
        <MoodSelector value={mood} onChange={(e) => setMood(e.target.value)} />
      </div>

      <div>
        <label htmlFor="entry-note">Note</label>
        <textarea
          id="entry-note"
          rows={5}
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Write your journal note here..."
        />
      </div>

      <button type="submit">Save Entry</button>
    </form>
  );
}
