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
      tags: tags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean),
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
      .filter((task) => task.status === status)
      .filter((task) => task.title.toLowerCase().includes(search.toLowerCase()))
      .filter((task) =>
        filterPriority === "all" ? true : task.priority === filterPriority,
      )
      .sort((a, b) => {
        if (!a.dueDate) return 1;
        if (!b.dueDate) return -1;
        return new Date(a.dueDate) - new Date(b.dueDate);
      });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-100 p-4">
      <h1 className="text-3xl font-bold text-center mb-6 text-gray-800">
        Task Board
      </h1>
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
          type="text"
          placeholder="Title..."
          className="border p-2 rounded flex-1"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />

        <input
          type="text"
          placeholder="Description..."
          className="border p-2 rounded flex-1"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />

        <input
          type="text"
          placeholder="Tags (comma)"
          className="border p-2 rounded"
          value={tags}
          onChange={(e) => setTags(e.target.value)}
        />

        <select
          value={priority}
          onChange={(e) => setPriority(e.target.value)}
          className="border p-2 rounded"
        >
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
        </select>

        <input
          type="date"
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
          className="border p-2 rounded"
        />

        <button
          onClick={handleAdd}
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 rounded-lg"
        >
          Add
        </button>
      </div>

      {/* RESET */}
      <div className="flex gap-3 justify-center mb-5">
        <button
          onClick={() => confirm("Reset tasks?") && resetBoard()}
          className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg"
        >
          Reset Board
        </button>

        <button
          onClick={() => confirm("Clear logs?") && resetLogs()}
          className="bg-gray-700 hover:bg-gray-800 text-white px-4 py-2 rounded-lg"
        >
          Reset Logs
        </button>
      </div>

      {/* SEARCH */}
      <div className="flex gap-2 mb-5 max-w-4xl mx-auto">
        <input
          type="text"
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Column title="Todo" status="todo" tasks={filterTasks("todo")} />
          <Column title="Doing" status="doing" tasks={filterTasks("doing")} />
          <Column title="Done" status="done" tasks={filterTasks("done")} />
        </div>
      </DndContext>

      {/* LOG */}
      <div className="mt-8 bg-white p-5 rounded-2xl shadow-lg max-w-2xl mx-auto">
        <h2 className="font-bold text-lg mb-4 text-gray-700">Activity Log</h2>

        <div className="max-h-60 overflow-y-auto space-y-2">
          {logs.map((log) => (
            <div
              key={log.id}
              className="p-2 rounded-lg text-sm bg-gray-100 flex justify-between"
            >
              <span>{log.message}</span>
              <span className="text-xs">{log.time}</span>
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
    <div
      ref={setNodeRef}
      className="bg-gray-100 p-4 rounded-xl shadow min-h-[250px]"
    >
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

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="p-4 rounded-lg bg-white border shadow mb-2"
    >
      <div
        {...listeners}
        {...attributes}
        className="text-xs text-gray-400 cursor-grab mb-2"
      >
        ☰ Drag
      </div>

      <p className="font-semibold">{task.title}</p>
      <p className="text-sm text-gray-600">{task.description}</p>

      {/* TAGS */}
      <div className="flex flex-wrap gap-1 mt-1">
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

        <button onClick={() => deleteTask(task.id)} className="text-red-500">
          Delete
        </button>
      </div>
    </div>
  );
}

export default Board;
