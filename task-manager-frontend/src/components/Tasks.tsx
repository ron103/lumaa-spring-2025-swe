import React, { useState, useEffect } from 'react';

interface Task {
  id: number;
  title: string;
  description: string;
  is_complete: boolean;
}

interface TasksProps {
  token: string;
}

const Tasks: React.FC<TasksProps> = ({ token }) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskDescription, setNewTaskDescription] = useState('');
  const API_URL = process.env.REACT_APP_API_URL;

  const fetchTasks = async () => {
    const res = await fetch(`${API_URL}/tasks`, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });
    if (res.ok) {
      const data = await res.json();
      setTasks(data);
    } else {
      alert('Failed to fetch tasks');
    }
  };

  useEffect(() => {
    fetchTasks();
  }, [token]);

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch(`${API_URL}/tasks`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ title: newTaskTitle, description: newTaskDescription }),
    });
    if (res.ok) {
      const data = await res.json();
      setTasks([...tasks, data]);
      setNewTaskTitle('');
      setNewTaskDescription('');
    } else {
      alert('Failed to create task');
    }
  };

  const handleToggleComplete = async (task: Task) => {
    const res = await fetch(`${API_URL}/tasks/${task.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ isComplete: !task.is_complete }),
    });
    if (res.ok) {
      const updatedTask = await res.json();
      setTasks(tasks.map((t) => (t.id === updatedTask.id ? updatedTask : t)));
    } else {
      alert('Failed to update task');
    }
  };

  const handleDeleteTask = async (id: number) => {
    const res = await fetch(`${API_URL}/tasks/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.ok) {
      setTasks(tasks.filter((t) => t.id !== id));
    } else {
      alert('Failed to delete task');
    }
  };

  return (
    <div>
      <h2>Your Tasks</h2>
      <form onSubmit={handleCreateTask}>
        <input
          type="text"
          placeholder="Task title"
          value={newTaskTitle}
          onChange={(e) => setNewTaskTitle(e.target.value)}
          required
        />
        <textarea
          placeholder="Task description (optional)"
          value={newTaskDescription}
          onChange={(e) => setNewTaskDescription(e.target.value)}
          style={{ resize: 'vertical' }}
        />
        <button type="submit">Create Task</button>
      </form>
      <ul>
        {tasks.map((task) => (
          <li key={task.id}>
            <h3>{task.title}</h3>
            {task.description && <p>{task.description}</p>}
            <p style={{ color: task.is_complete ? 'green' : 'red' }}>
              {task.is_complete ? 'Completed' : 'Pending'}
            </p>
            <div>
              <button onClick={() => handleToggleComplete(task)} style={{ marginRight: '10px' }}>
                {task.is_complete ? 'Mark Pending' : 'Mark Complete'}
              </button>
              <button onClick={() => handleDeleteTask(task.id)}>Delete</button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Tasks;