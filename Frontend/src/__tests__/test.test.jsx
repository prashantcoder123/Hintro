import { describe, it, expect } from "vitest";
import { useTaskStore } from "../store/useTaskStore";

describe("Task Store Tests", () => {

  it("should add a task", () => {
    const { addTask, tasks } = useTaskStore.getState();

    addTask({
      id: 1,
      title: "Test Task",
      status: "todo",
    });

    const updatedTasks = useTaskStore.getState().tasks;

    expect(updatedTasks.length).toBeGreaterThan(0);
    expect(updatedTasks[0].title).toBe("Test Task");
  });

  it("should delete a task", () => {
    const { deleteTask } = useTaskStore.getState();

    deleteTask(1);

    const updatedTasks = useTaskStore.getState().tasks;

    expect(updatedTasks.find(t => t.id === 1)).toBeUndefined();
  });

  it("should move a task", () => {
    const { addTask, moveTask } = useTaskStore.getState();

    addTask({
      id: 2,
      title: "Move Task",
      status: "todo",
    });

    moveTask(2, "doing");

    const task = useTaskStore.getState().tasks.find(t => t.id === 2);

    expect(task.status).toBe("doing");
  });

});