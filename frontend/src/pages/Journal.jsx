// import EntryForm from "../components/EntryForm";
// import EntryList from "../components/EntryList";
// import MoodSelector from "../components/MoodSelector";
import { useEffect, useState } from "react";
import { getEntries, createEntry } from "../services/api";
import EntryForm from "../components/EntryForm";

function Journal() {
  const [entries, setEntries] = useState([]);

  const loadEntries = () => {
    getEntries().then(res => setEntries(res.data)).catch(err => {
      console.error("Failed to load entries", err);
    });
  };

  useEffect(() => {
    loadEntries();
  }, []);

  const handleEntrySubmit = async (entry) => {
    try {
      const response = await createEntry(entry);
      console.log("entry saved", response.data);
      // refresh list after successful save
      loadEntries();
    } catch (error) {
      console.error("Failed to save entry", error);
    }
  };

  return (
    <div>
      <h1>Journal</h1>
      <EntryForm onSubmit={handleEntrySubmit} />
      ...
      <pre>{JSON.stringify(entries, null, 2)}</pre>
    </div>
  );
}

export default Journal;

// export default function Journal() {
//   const [entries, setEntries] = useState([]);

//   useEffect(() => {
//     getEntries().then(res => setEntries(res.data));
//   }, []);

//   return (
//     <div>
//       <h1>Journal</h1>
//       <pre>{JSON.stringify(entries, null, 2)}</pre>
//     </div>
//   );
// }

// function Journal() {
// //   return <h1>Journal</h1>;
// return (
//     <div>
//       <h1>Journal</h1>
//       <MoodSelector />
//       <EntryForm />
//       <EntryList />
//     </div>
// )
// }

// export default Journal;