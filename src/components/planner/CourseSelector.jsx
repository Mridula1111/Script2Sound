export default function CourseSelector({ courses, value, onChange }) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full px-4 py-2 rounded-lg bg-slate-900 border border-slate-700 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
    >
      <option value="">No course</option>
      {courses?.map((course) => (
        <option key={course._id} value={course._id}>
          {course.name} {course.code ? `(${course.code})` : ""}
        </option>
      ))}
    </select>
  );
}
