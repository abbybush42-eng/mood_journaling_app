export default function MoodSelector({ value, onChange }) {
  return (
    <div>
      <label htmlFor="mood">Mood</label>
      <select id="mood" value={value} onChange={onChange} required>
        <option value="">Choose mood</option>
        <option value="5">Very Happy</option>
        <option value="4">Happy</option>
        <option value="3">Neutral</option>
        <option value="2">Sad</option>
        <option value="1">Very Sad</option>
      </select>
    </div>
  );
}
