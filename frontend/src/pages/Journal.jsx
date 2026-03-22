// import EntryForm from "../components/EntryForm";
// import EntryList from "../components/EntryList";
// import MoodSelector from "../components/MoodSelector";
import { useEffect, useState } from "react";
import { getEntries, createEntry } from "../services/api";
import EntryForm from "../components/EntryForm";
import EntryList from "../components/EntryList";

function Journal() {
  const [entries, setEntries] = useState([]);

  const loadEntries = () => {
    getEntries()
      .then((res) => {
        const { entries } = res.data;   // extract array
        setEntries(entries);
      })
      .catch((err) => {
        console.error("Failed to load entries", err);
      });
  };

  useEffect(() => {
    loadEntries();
  }, []);

  const handleEntrySubmit = async (entry) => {
    try {
      const response = await createEntry(entry);
      const { entry: newEntry } = response.data;

      console.log("entry saved", response.data);
      loadEntries();

    } catch (error) {
      console.error("Failed to save entry", error);
    }
  };

  return (
    <div className="container">
      <h1>Journal</h1>
      <EntryForm onSubmit={handleEntrySubmit} />
      <EntryList entries={entries} onUpdate={loadEntries} />
    </div>
  );
}

export default Journal;

