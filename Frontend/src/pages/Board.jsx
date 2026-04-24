import { useState } from "react";
import { useTaskStore } from "../store/useTaskStore";
import { DndContext, useDraggable, useDroppable } from "@dnd-kit/core";

function Board() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [tags, setTags] = useState("");
  const [priority, setPriority] = useState("low");
  const [dueDate, setDueDate] = useState("");
  const [search, setSearch] = useState("");
  const [filterPriority, setFilterPriority] = useState("all");

  const { tasks, logs, addTask, resetBoard, resetLogs, moveTask } =
    useTaskStore();

  const handleAdd = () => {
    if (!title.trim()) return;

    addTask({
      id: Date.now(),
      title,
      description,
      tags: tags.split(",").map(t => t.trim()).filter(Boolean),
      createdAt: new Date().toISOString(),
      status: "todo",
      priority,
      dueDate,
    });

    setTitle("");
    setDescription("");
    setTags("");
    setPriority("low");
    setDueDate("");
  };

  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (!over) return;
    moveTask(active.id, over.id);
  };

  const filterTasks = (status) => {
    return tasks
      .filter((t) => t.status === status)
      .filter((t) =>
        t.title.toLowerCase().includes(search.toLowerCase())
      )
      .filter((t) =>
        filterPriority === "all" ? true : t.priority === filterPriority
      );
  };
const getLogColor = (message) => {
  if (message.includes("created"))
    return "bg-green-100 text-green-700";

  if (message.includes("deleted"))
    return "bg-red-100 text-red-700";

  if (message.includes("moved"))
    return "bg-blue-100 text-blue-700";

  if (message.includes("edited"))
    return "bg-yellow-100 text-yellow-700";

  if (message.includes("reset"))
    return "bg-gray-200 text-gray-700";

  return "bg-gray-100 text-gray-700";
};
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-100 p-4">
      
      <h1 className="text-3xl font-bold text-center mb-6">
        Task Board
      </h1>

      {/* LOGOUT */}
      <button
        onClick={() => {
          localStorage.removeItem("isLoggedIn");
          window.location.href = "/";
        }}
        className="absolute top-4 right-4 bg-red-500 text-white px-3 py-1 rounded"
      >
        Logout
      </button>

      {/* ADD TASK */}
      <div className="flex flex-col md:flex-row gap-2 mb-6 max-w-4xl mx-auto bg-white p-4 rounded-xl shadow">
        <input
          placeholder="Title"
          className="border p-2 rounded flex-1"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />

        <input
          placeholder="Description"
          className="border p-2 rounded flex-1"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />

        <input
          placeholder="Tags"
          className="border p-2 rounded"
          value={tags}
          onChange={(e) => setTags(e.target.value)}
        />

        <select
          className="border p-2 rounded"
          value={priority}
          onChange={(e) => setPriority(e.target.value)}
        >
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
        </select>

        <input
          type="date"
          className="border p-2 rounded"
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
        />

        <button
          onClick={handleAdd}
          className="bg-blue-500 text-white px-4 rounded"
        >
          Add
        </button>
      </div>

      {/* RESET */}
      <div className="flex gap-3 justify-center mb-5">
        <button
          onClick={() => confirm("Reset tasks?") && resetBoard()}
          className="bg-red-500 text-white px-4 py-2 rounded"
        >
          Reset Board
        </button>

        <button
          onClick={() => confirm("Clear logs?") && resetLogs()}
          className="bg-gray-700 text-white px-4 py-2 rounded"
        >
          Reset Logs
        </button>
      </div>

      {/* SEARCH */}
      <div className="flex gap-2 mb-5 max-w-4xl mx-auto">
        <input
          placeholder="Search..."
          className="border p-2 rounded flex-1"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <select
          className="border p-2 rounded"
          value={filterPriority}
          onChange={(e) => setFilterPriority(e.target.value)}
        >
          <option value="all">All</option>
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
        </select>
      </div>

      {/* DRAG */}
      <DndContext onDragEnd={handleDragEnd}>
        <div className="grid md:grid-cols-3 gap-4">
          <Column title="Todo" status="todo" tasks={filterTasks("todo")} />
          <Column title="Doing" status="doing" tasks={filterTasks("doing")} />
          <Column title="Done" status="done" tasks={filterTasks("done")} />
        </div>
      </DndContext>

      {/* LOG */}
      {/* LOG */}
<div className="mt-8 bg-white p-5 rounded-xl shadow max-w-2xl mx-auto">
  <h2 className="font-bold mb-3">Activity Log</h2>

  <div className="space-y-2 max-h-60 overflow-y-auto">
    {logs.map((log) => (
      <div
        key={log.id}
        className={`p-2 rounded-lg text-sm flex justify-between ${getLogColor(
          log.message
        )}`}
      >
        <span>{log.message}</span>
        <span className="text-xs opacity-70">{log.time}</span>
      </div>
    ))}
  </div>
</div>
    </div>
  );
}

function Column({ title, status, tasks }) {
  const { setNodeRef } = useDroppable({ id: status });

  return (
    <div ref={setNodeRef} className="bg-gray-100 p-4 rounded shadow">
      <h2 className="font-bold mb-3">{title}</h2>

      {tasks.map((task) => (
        <TaskCard key={task.id} task={task} />
      ))}
    </div>
  );
}

function TaskCard({ task }) {
  const { deleteTask, updateTask } = useTaskStore();

  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: task.id,
  });

  const style = {
    transform: transform
      ? `translate(${transform.x}px, ${transform.y}px)`
      : undefined,
  };

  // 🔥 COLOR LOGIC
  const getColor = () => {
    if (!task.dueDate) return "bg-white border-gray-200";

    const today = new Date();
    const due = new Date(task.dueDate);

    const diff = (due - today) / (1000 * 60 * 60 * 24);

    if (diff < 0) return "bg-red-100 border-red-400";
    if (diff <= 1) return "bg-yellow-100 border-yellow-400";

    return "bg-white border-gray-200";
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`p-4 rounded border shadow mb-2 ${getColor()}`}
    >
      <div {...listeners} {...attributes} className="text-xs mb-2 text-right cursor-grab">
        ☰ Drag
      </div>

      <p className="font-semibold">{task.title}</p>
      <p className="text-sm">{task.description}</p>

      <div className="flex gap-1 mt-1 flex-wrap">
        {task.tags?.map((tag, i) => (
          <span key={i} className="text-xs bg-gray-200 px-2 rounded">
            #{tag}
          </span>
        ))}
      </div>

      <p className="text-xs mt-1">
        {task.priority} | {task.dueDate || "N/A"}
      </p>

      <p className="text-[10px] text-gray-400">
        Created: {new Date(task.createdAt).toLocaleDateString()}
      </p>

      <div className="flex gap-2 mt-2 text-sm">
        <button
          onClick={() => {
            const newTitle = prompt("Edit task:", task.title);
            if (newTitle) updateTask(task.id, newTitle);
          }}
          className="text-blue-500"
        >
          Edit
        </button>

        <button
          onClick={() => deleteTask(task.id)}
          className="text-red-500"
        >
          Delete
        </button>
      </div>
    </div>
  );
}

export default Board;