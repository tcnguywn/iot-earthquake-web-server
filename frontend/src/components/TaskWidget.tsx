import { useState } from "react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Checkbox } from "./ui/checkbox";
import { Plus, Trash2 } from "lucide-react";
import { Badge } from "./ui/badge";

interface TaskWidgetProps {
  className?: string;
}

interface Task {
  id: string;
  title: string;
  completed: boolean;
  priority: "high" | "medium" | "low";
}

export function TaskWidget({ className }: TaskWidgetProps) {
  const [tasks, setTasks] = useState<Task[]>([
    {
      id: "1",
      title: "Review quarterly report",
      completed: false,
      priority: "high",
    },
    {
      id: "2",
      title: "Update project documentation",
      completed: false,
      priority: "medium",
    },
    {
      id: "3",
      title: "Schedule team meeting",
      completed: true,
      priority: "low",
    },
    {
      id: "4",
      title: "Respond to client emails",
      completed: false,
      priority: "high",
    },
  ]);
  const [newTask, setNewTask] = useState("");

  const addTask = () => {
    if (newTask.trim()) {
      const task: Task = {
        id: Date.now().toString(),
        title: newTask,
        completed: false,
        priority: "medium",
      };
      setTasks([...tasks, task]);
      setNewTask("");
    }
  };

  const toggleTask = (id: string) => {
    setTasks(
      tasks.map((task) =>
        task.id === id ? { ...task, completed: !task.completed } : task
      )
    );
  };

  const deleteTask = (id: string) => {
    setTasks(tasks.filter((task) => task.id !== id));
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-700";
      case "medium":
        return "bg-yellow-100 text-yellow-700";
      case "low":
        return "bg-green-100 text-green-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const activeTasks = tasks.filter((t) => !t.completed);
  const completedTasks = tasks.filter((t) => t.completed);

  return (
    <Card className={`p-6 ${className}`}>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-gray-500">Tasks</h2>
          <Badge variant="secondary">
            {activeTasks.length} active
          </Badge>
        </div>

        <div className="flex gap-2">
          <Input
            placeholder="Add a new task..."
            value={newTask}
            onChange={(e) => setNewTask(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addTask()}
            className="flex-1"
          />
          <Button onClick={addTask} size="icon">
            <Plus className="w-4 h-4" />
          </Button>
        </div>

        <div className="space-y-2 max-h-96 overflow-y-auto">
          {tasks.map((task) => (
            <div
              key={task.id}
              className={`flex items-start gap-3 p-3 rounded-lg border transition-all ${
                task.completed
                  ? "bg-gray-50 border-gray-200"
                  : "bg-white border-gray-200 hover:border-gray-300"
              }`}
            >
              <Checkbox
                checked={task.completed}
                onCheckedChange={() => toggleTask(task.id)}
                className="mt-0.5"
              />
              <div className="flex-1 min-w-0">
                <p
                  className={`text-sm ${
                    task.completed
                      ? "line-through text-gray-400"
                      : "text-gray-900"
                  }`}
                >
                  {task.title}
                </p>
                <Badge
                  className={`text-xs mt-1 ${getPriorityColor(task.priority)}`}
                  variant="secondary"
                >
                  {task.priority}
                </Badge>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => deleteTask(task.id)}
                className="h-8 w-8 text-gray-400 hover:text-red-600"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          ))}
        </div>

        {completedTasks.length > 0 && (
          <div className="pt-4 border-t border-gray-200">
            <p className="text-xs text-gray-500">
              {completedTasks.length} task{completedTasks.length !== 1 ? "s" : ""} completed today
            </p>
          </div>
        )}
      </div>
    </Card>
  );
}
