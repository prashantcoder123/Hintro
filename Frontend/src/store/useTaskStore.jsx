import { create } from "zustand";

const loadTasks = () => {
  try {
    const data = localStorage.getItem("tasks");
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
};

const loadLogs = () => {
  try {
    const data = localStorage.getItem("logs");
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
};

export const useTaskStore = create((set, get) => ({
  tasks: loadTasks(),
  logs: loadLogs(),

  saveTasks: (tasks) => {
    localStorage.setItem("tasks", JSON.stringify(tasks));
  },

  saveLogs: (logs) => {
    localStorage.setItem("logs", JSON.stringify(logs));
  },

  addLog: (message) => {
    const newLog = {
      id: Date.now(),
      message,
      time: new Date().toLocaleTimeString(),
    };

    const updatedLogs = [newLog, ...get().logs];
    set({ logs: updatedLogs });
    get().saveLogs(updatedLogs);
  },

  addTask: (task) => {
    const updated = [...get().tasks, task];
    set({ tasks: updated });
    get().saveTasks(updated);

    get().addLog(`Task "${task.title}" created`);
  },

  deleteTask: (id) => {
    const task = get().tasks.find((t) => t.id === id);

    const updated = get().tasks.filter((t) => t.id !== id);
    set({ tasks: updated });
    get().saveTasks(updated);

    get().addLog(`Task "${task?.title}" deleted`);
  },

  updateTask: (id, newTitle) => {
    const task = get().tasks.find((t) => t.id === id);

    const updated = get().tasks.map((t) =>
      t.id === id ? { ...t, title: newTitle } : t
    );

    set({ tasks: updated });
    get().saveTasks(updated);

    get().addLog(`Task "${task?.title}" edited`);
  },

  moveTask: (id, newStatus) => {
    const task = get().tasks.find((t) => t.id === id);

    const updated = get().tasks.map((t) =>
      t.id === id ? { ...t, status: newStatus } : t
    );

    set({ tasks: updated });
    get().saveTasks(updated);

    get().addLog(`Task "${task?.title}" moved to ${newStatus}`);
  },

  // 🔥 Reset Board (keep only reset log)
  resetBoard: () => {
    const resetLog = {
      id: Date.now(),
      message: "Board reset",
      time: new Date().toLocaleTimeString(),
    };
//agar resent board ke sath log ko bhi reset krna hai toh ...

    set({
      tasks: [],
      // logs: [resetLog],
    });

    localStorage.removeItem("tasks");
    localStorage.setItem("logs", JSON.stringify([resetLog]));
  },

  // 🔥 Reset Logs ONLY
  resetLogs: () => {
    set({ logs: [] });
    localStorage.removeItem("logs");
  },
}));