"use client";

import { useEffect, useState } from "react";
import { fetchWithAuth } from "@/lib/api/fetcher";
import { useDashboardStore } from "@/store/useDashboardStore";
import { getBusinessLabels, getPersonaCapabilities } from "@/lib/business-context";
import { 
  CheckSquare, Plus, X, Clock, AlertTriangle, 
  Loader2, Trash2, Edit, Calendar, User, Wrench, Check
} from "lucide-react";
import { format, parseISO, isBefore, isAfter, isPast, isToday } from "date-fns";
import { cn } from "@/lib/utils";

interface Task {
  id: string;
  listing_id: string;
  booking_id: string | null;
  title: string;
  description: string;
  type: string;
  status: string;
  priority: string;
  assigned_to: string;
  due_date: string;
  completed_at: string | null;
}

interface Booking {
  id: string;
  start_date: string;
  guest_name: string;
}

interface Listing {
  id: string;
  title: string;
}

const TASK_TYPES = [
  { value: "cleaning", label: "Cleaning", icon: "🧹" },
  { value: "maintenance", label: "Maintenance", icon: "🔧" },
  { value: "inspection", label: "Inspection", icon: "🔍" },
  { value: "checkin", label: "Check-in", icon: "🚪" },
  { value: "checkout", label: "Check-out", icon: "🔑" },
  { value: "general", label: "General", icon: "📋" },
];

const PRIORITIES = [
  { value: "low", label: "Low", color: "text-gray-500" },
  { value: "normal", label: "Normal", color: "text-blue-500" },
  { value: "high", label: "High", color: "text-orange-500" },
  { value: "urgent", label: "Urgent", color: "text-red-500" },
];

export default function TasksPage() {
  const { tenant } = useDashboardStore();
  const labels = getBusinessLabels(tenant?.businessType);
  const capabilities = getPersonaCapabilities(tenant?.businessType);

  const [tasks, setTasks] = useState<Task[]>([]);
  const [listings, setListings] = useState<Listing[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterType, setFilterType] = useState<string>("all");
  const [filterPriority, setFilterPriority] = useState<string>("all");
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [taskForm, setTaskForm] = useState({
    listingId: "",
    bookingId: "",
    title: "",
    description: "",
    type: "cleaning",
    priority: "normal",
    assignedTo: "",
    dueDate: ""
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (tenant?.id) {
      loadData();
    }
  }, [tenant?.id]);

  const loadData = async () => {
    try {
      const tasksData = await fetchWithAuth<{ tasks: Task[] }>(`/api/tasks?tenant_id=${tenant?.id}`);
      setTasks(tasksData.tasks || []);
      
      const listingsData = await fetchWithAuth<{ listings: Listing[] }>(`/api/listings?tenant_id=${tenant?.id}`);
      setListings(listingsData.listings || []);
      if (listingsData.listings?.length > 0) {
        setTaskForm(prev => ({ ...prev, listingId: listingsData.listings[0].id }));
      }
      
      const bookingsData = await fetchWithAuth<{ bookings: Booking[] }>(`/api/bookings?tenant_id=${tenant?.id}`);
      setBookings(bookingsData.bookings || []);
    } catch (error) {
      console.error("Failed to load data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTask = async () => {
    if (!taskForm.title || !taskForm.listingId || !taskForm.dueDate) return;
    
    setSaving(true);
    try {
      const newTask = await fetchWithAuth<{ task: Task }>("/api/tasks", {
        method: "POST",
        body: JSON.stringify({
          tenant_id: tenant?.id,
          listing_id: taskForm.listingId,
          booking_id: taskForm.bookingId || null,
          title: taskForm.title,
          description: taskForm.description,
          type: taskForm.type,
          priority: taskForm.priority,
          assigned_to: taskForm.assignedTo,
          due_date: taskForm.dueDate
        })
      });
      
      setTasks([...tasks, newTask.task]);
      setShowTaskModal(false);
      setTaskForm({
        listingId: taskForm.listingId,
        bookingId: "",
        title: "",
        description: "",
        type: "cleaning",
        priority: "normal",
        assignedTo: "",
        dueDate: ""
      });
    } catch (error) {
      console.error("Failed to create task:", error);
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateStatus = async (taskId: string, newStatus: string) => {
    try {
      const updated = await fetchWithAuth<{ task: Task }>(`/api/tasks/${taskId}`, {
        method: "PATCH",
        body: JSON.stringify({ status: newStatus })
      });
      setTasks(tasks.map(t => t.id === taskId ? updated.task : t));
    } catch (error) {
      console.error("Failed to update task:", error);
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    try {
      await fetchWithAuth(`/api/tasks/${taskId}`, {
        method: "DELETE"
      });
      setTasks(tasks.filter(t => t.id !== taskId));
    } catch (error) {
      console.error("Failed to delete task:", error);
    }
  };

  const filteredTasks = tasks.filter(task => {
    if (filterStatus !== "all" && task.status !== filterStatus) return false;
    if (filterType !== "all" && task.type !== filterType) return false;
    if (filterPriority !== "all" && task.priority !== filterPriority) return false;
    return true;
  });

  const getTaskTypeInfo = (type: string) => TASK_TYPES.find(t => t.value === type) || TASK_TYPES[0];
  const getPriorityInfo = (priority: string) => PRIORITIES.find(p => p.value === priority) || PRIORITIES[1];

  const getListingTitle = (listingId: string) => {
    const listing = listings.find(l => l.id === listingId);
    return listing?.title || "Unknown";
  };

  const getBookingInfo = (bookingId: string | null) => {
    if (!bookingId) return null;
    const booking = bookings.find(b => b.id === bookingId);
    return booking;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed": return "bg-green-500";
      case "in_progress": return "bg-blue-500";
      case "pending": return "bg-yellow-500";
      case "cancelled": return "bg-gray-500";
      default: return "bg-gray-500";
    }
  };

  const isOverdue = (dueDate: string, status: string) => {
    if (status === "completed") return false;
    return isBefore(parseISO(dueDate), new Date()) && !isToday(parseISO(dueDate));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const pendingTasks = tasks.filter(t => t.status !== "completed" && t.status !== "cancelled");
  const completedTasks = tasks.filter(t => t.status === "completed");
  const overdueTasks = pendingTasks.filter(t => isOverdue(t.due_date, t.status));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Tasks</h1>
          <p className="text-muted-foreground">Manage cleaning, maintenance, and operational tasks</p>
        </div>
        <button
          onClick={() => setShowTaskModal(true)}
          className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
        >
          <Plus className="h-4 w-4 mr-2 inline" />
          Add Task
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-card border rounded-lg p-4">
          <div className="text-2xl font-bold">{pendingTasks.length}</div>
          <p className="text-sm text-muted-foreground">Pending Tasks</p>
        </div>
        <div className="bg-card border rounded-lg p-4">
          <div className="text-2xl font-bold">{completedTasks.length}</div>
          <p className="text-sm text-muted-foreground">Completed</p>
        </div>
        <div className="bg-card border rounded-lg p-4">
          <div className="text-2xl font-bold text-orange-500">{overdueTasks.length}</div>
          <p className="text-sm text-muted-foreground">Overdue</p>
        </div>
        <div className="bg-card border rounded-lg p-4">
          <div className="text-2xl font-bold text-blue-500">
            {pendingTasks.filter(t => t.status === "in_progress").length}
          </div>
          <p className="text-sm text-muted-foreground">In Progress</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <select 
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="bg-background border rounded-md px-3 py-2 text-sm"
        >
          <option value="all">All Status</option>
          <option value="pending">Pending</option>
          <option value="in_progress">In Progress</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
        </select>
        
        <select 
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          className="bg-background border rounded-md px-3 py-2 text-sm"
        >
          <option value="all">All Types</option>
          {TASK_TYPES.map(type => (
            <option key={type.value} value={type.value}>{type.label}</option>
          ))}
        </select>

        <select 
          value={filterPriority}
          onChange={(e) => setFilterPriority(e.target.value)}
          className="bg-background border rounded-md px-3 py-2 text-sm"
        >
          <option value="all">All Priorities</option>
          {PRIORITIES.map(p => (
            <option key={p.value} value={p.value}>{p.label}</option>
          ))}
        </select>
      </div>

      {/* Tasks List */}
      {filteredTasks.length === 0 ? (
        <div className="text-center py-12">
          <CheckSquare className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold">No tasks found</h3>
          <p className="text-muted-foreground">Create your first task to get started</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredTasks.map(task => {
            const typeInfo = getTaskTypeInfo(task.type);
            const priorityInfo = getPriorityInfo(task.priority);
            const booking = getBookingInfo(task.booking_id);
            
            return (
              <div 
                key={task.id}
                className={cn(
                  "bg-card border rounded-lg p-4",
                  task.status === "completed" && "opacity-60",
                  isOverdue(task.due_date, task.status) && "border-orange-300"
                )}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <button
                      onClick={() => handleUpdateStatus(
                        task.id, 
                        task.status === "completed" ? "pending" : "completed"
                      )}
                      className={cn(
                        "mt-1 w-5 h-5 rounded border-2 flex items-center justify-center",
                        task.status === "completed" 
                          ? "bg-green-500 border-green-500" 
                          : "border-muted-foreground hover:border-primary"
                      )}
                    >
                      {task.status === "completed" && <Check className="h-3 w-3 text-white" />}
                    </button>
                    
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{typeInfo.icon}</span>
                        <span className={cn("font-medium", task.status === "completed" && "line-through")}>
                          {task.title}
                        </span>
                        <span className={cn("text-xs px-2 py-0.5 rounded-full", getStatusColor(task.status))}>
                          {task.status.replace("_", " ")}
                        </span>
                      </div>
                      
                      {task.description && (
                        <p className="text-sm text-muted-foreground mt-1">{task.description}</p>
                      )}
                      
                      <div className="flex flex-wrap items-center gap-4 mt-2 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {format(parseISO(task.due_date), "MMM d, yyyy")}
                          {isOverdue(task.due_date, task.status) && (
                            <span className="text-orange-500 font-medium">(Overdue)</span>
                          )}
                        </span>
                        <span className="flex items-center gap-1">
                          <User className="h-3 w-3" />
                          {task.assigned_to || "Unassigned"}
                        </span>
                        <span className="flex items-center gap-1">
                          {getListingTitle(task.listing_id)}
                        </span>
                        {booking && (
                          <span className="flex items-center gap-1">
                            Guest: {booking.guest_name}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <span className={cn("text-sm font-medium", priorityInfo.color)}>
                      {priorityInfo.label}
                    </span>
                    <button
                      onClick={() => handleDeleteTask(task.id)}
                      className="p-1 hover:bg-muted rounded text-muted-foreground"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create Task Modal */}
      {showTaskModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-card border rounded-lg w-full max-w-lg">
            <div className="p-4 border-b flex items-center justify-between">
              <h3 className="font-semibold">Create New Task</h3>
              <button onClick={() => setShowTaskModal(false)} className="p-1 hover:bg-muted rounded">
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="p-4 space-y-4">
              <div>
                <label className="text-sm font-medium">Property *</label>
                <select
                  value={taskForm.listingId}
                  onChange={(e) => setTaskForm({ ...taskForm, listingId: e.target.value })}
                  className="mt-1 w-full border rounded-md px-3 py-2"
                >
                  {listings.map(listing => (
                    <option key={listing.id} value={listing.id}>{listing.title}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="text-sm font-medium">Task Type *</label>
                <select
                  value={taskForm.type}
                  onChange={(e) => setTaskForm({ ...taskForm, type: e.target.value })}
                  className="mt-1 w-full border rounded-md px-3 py-2"
                >
                  {TASK_TYPES.map(type => (
                    <option key={type.value} value={type.value}>{type.icon} {type.label}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="text-sm font-medium">Title *</label>
                <input
                  type="text"
                  value={taskForm.title}
                  onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })}
                  placeholder="e.g., Deep clean before guest arrival"
                  className="mt-1 w-full border rounded-md px-3 py-2"
                />
              </div>
              
              <div>
                <label className="text-sm font-medium">Description</label>
                <textarea
                  value={taskForm.description}
                  onChange={(e) => setTaskForm({ ...taskForm, description: e.target.value })}
                  placeholder="Add details about the task..."
                  className="mt-1 w-full border rounded-md px-3 py-2 min-h-[80px]"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Priority</label>
                  <select
                    value={taskForm.priority}
                    onChange={(e) => setTaskForm({ ...taskForm, priority: e.target.value })}
                    className="mt-1 w-full border rounded-md px-3 py-2"
                  >
                    {PRIORITIES.map(p => (
                      <option key={p.value} value={p.value}>{p.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium">Due Date *</label>
                  <input
                    type="datetime-local"
                    value={taskForm.dueDate}
                    onChange={(e) => setTaskForm({ ...taskForm, dueDate: e.target.value })}
                    className="mt-1 w-full border rounded-md px-3 py-2"
                  />
                </div>
              </div>
              
              <div>
                <label className="text-sm font-medium">Assign To</label>
                <input
                  type="text"
                  value={taskForm.assignedTo}
                  onChange={(e) => setTaskForm({ ...taskForm, assignedTo: e.target.value })}
                  placeholder="e.g., Cleaning team, John"
                  className="mt-1 w-full border rounded-md px-3 py-2"
                />
              </div>

              <div>
                <label className="text-sm font-medium">Link to Booking (optional)</label>
                <select
                  value={taskForm.bookingId}
                  onChange={(e) => setTaskForm({ ...taskForm, bookingId: e.target.value })}
                  className="mt-1 w-full border rounded-md px-3 py-2"
                >
                  <option value="">None</option>
                  {bookings.slice(0, 10).map(booking => (
                    <option key={booking.id} value={booking.id}>
                      {booking.guest_name} - {format(parseISO(booking.start_date), "MMM d")}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="p-4 border-t flex justify-end gap-2">
              <button
                onClick={() => setShowTaskModal(false)}
                className="px-4 py-2 text-sm border rounded-md hover:bg-muted"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateTask}
                disabled={!taskForm.title || !taskForm.listingId || !taskForm.dueDate || saving}
                className="px-4 py-2 text-sm bg-primary text-primary-foreground rounded-md hover:bg-primary/90 disabled:opacity-50"
              >
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Create Task"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
