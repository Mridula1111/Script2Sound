import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  getCourses,
  createCourse,
  updateCourse,
  deleteCourse,
} from "../services/planner-api";
import FloatingLabel from "../components/FloatingLabel";

export default function Courses() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    code: "",
    color: "#6366f1",
  });

  useEffect(() => {
    loadCourses();
  }, []);

  const loadCourses = async () => {
    try {
      setLoading(true);
      const data = await getCourses();
      setCourses(data);
    } catch (error) {
      console.error("Failed to load courses:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingCourse) {
        await updateCourse(editingCourse._id, formData);
      } else {
        await createCourse(formData);
      }
      setShowForm(false);
      setEditingCourse(null);
      setFormData({ name: "", code: "", color: "#6366f1" });
      loadCourses();
    } catch (error) {
      console.error("Failed to save course:", error);
      alert(error.message || "Failed to save course");
    }
  };

  const handleEdit = (course) => {
    setEditingCourse(course);
    setFormData({
      name: course.name,
      code: course.code || "",
      color: course.color || "#6366f1",
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this course?")) return;

    try {
      await deleteCourse(id);
      loadCourses();
    } catch (error) {
      console.error("Failed to delete course:", error);
      alert("Failed to delete course");
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-white">Courses</h1>
        <button
          onClick={() => {
            setShowForm(true);
            setEditingCourse(null);
            setFormData({ name: "", code: "", color: "#6366f1" });
          }}
          className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg transition"
        >
          + Add Course
        </button>
      </div>

      {showForm && (
        <div className="bg-slate-800 p-6 rounded-xl space-y-4">
          <h2 className="text-xl font-semibold text-white">
            {editingCourse ? "Edit Course" : "New Course"}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <FloatingLabel label="Course Name" required>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                className="w-full px-4 pt-6 pb-2 rounded-lg bg-slate-900 border border-slate-700 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </FloatingLabel>
            <FloatingLabel label="Course Code">
              <input
                type="text"
                value={formData.code}
                onChange={(e) =>
                  setFormData({ ...formData, code: e.target.value })
                }
                className="w-full px-4 pt-6 pb-2 rounded-lg bg-slate-900 border border-slate-700 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </FloatingLabel>
            <div>
              <label className="block text-slate-300 text-sm mb-2">
                Color
              </label>
              <input
                type="color"
                value={formData.color}
                onChange={(e) =>
                  setFormData({ ...formData, color: e.target.value })
                }
                className="w-full h-12 rounded-lg cursor-pointer"
              />
            </div>
            <div className="flex gap-3">
              <button
                type="submit"
                className="bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-2 rounded-lg transition"
              >
                {editingCourse ? "Update" : "Create"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  setEditingCourse(null);
                }}
                className="bg-slate-700 hover:bg-slate-600 text-white px-6 py-2 rounded-lg transition"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {loading ? (
        <p className="text-slate-400">Loading courses...</p>
      ) : courses.length === 0 ? (
        <div className="bg-slate-800 p-8 rounded-xl text-center">
          <p className="text-slate-400">No courses yet. Create your first course!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {courses.map((course) => (
            <div
              key={course._id}
              className="bg-slate-800 p-6 rounded-xl space-y-3"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="font-semibold text-white text-lg">
                    {course.name}
                  </h3>
                  {course.code && (
                    <p className="text-slate-400 text-sm">{course.code}</p>
                  )}
                </div>
                <div
                  className="w-6 h-6 rounded-full"
                  style={{ backgroundColor: course.color }}
                />
              </div>
              <div className="flex gap-2 pt-2">
                <button
                  onClick={() => handleEdit(course)}
                  className="flex-1 bg-slate-700 hover:bg-slate-600 text-white px-3 py-2 rounded-lg transition text-sm"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(course._id)}
                  className="flex-1 bg-red-600 hover:bg-red-500 text-white px-3 py-2 rounded-lg transition text-sm"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
