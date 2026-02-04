
import { getKaisaDashboardData } from "@/app/actions/customer";
import { 
  CheckCircle, 
  Clock, 
  Calendar,
  AlertCircle
} from "lucide-react";
import { KaisaTask } from "@/types/kaisa";

export default async function KaisaTasksPage() {
  const data = await getKaisaDashboardData();
  const { tasks } = data;

  const inProgress = tasks.filter(t => t.status === "in_progress");
  const pending = tasks.filter(t => t.status === "pending");
  const scheduled = tasks.filter(t => t.status === "scheduled");
  const completed = tasks.filter(t => t.status === "completed");

  const TaskCard = ({ task }: { task: KaisaTask }) => (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 hover:border-zinc-700 transition-colors">
      <div className="flex items-start justify-between mb-3">
        <span className={`px-2 py-1 rounded text-xs font-bold uppercase tracking-wider ${
          task.priority === "high" ? "bg-red-500/10 text-red-500" :
          task.priority === "medium" ? "bg-amber-500/10 text-amber-500" :
          "bg-blue-500/10 text-blue-500"
        }`}>
          {task.priority} Priority
        </span>
        <span className="text-xs text-zinc-500">{task.module}</span>
      </div>
      <h3 className="text-white font-medium mb-1">{task.title}</h3>
      <p className="text-sm text-zinc-400 mb-4">{task.description}</p>
      <div className="flex items-center gap-2 text-xs text-zinc-500 border-t border-zinc-800 pt-3">
        <Clock className="w-3 h-3" />
        <span>Created {new Date(task.createdAt).toLocaleDateString()}</span>
        {task.scheduledFor && (
            <span className="flex items-center gap-1 ml-auto text-blue-400">
                <Calendar className="w-3 h-3" />
                Due {new Date(task.scheduledFor).toLocaleDateString()}
            </span>
        )}
      </div>
    </div>
  );

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white mb-1">Tasks & Operations</h1>
        <p className="text-zinc-400">Track what your AI workforce is working on.</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        
        {/* Column 1: In Progress & Pending */}
        <div className="lg:col-span-2 space-y-8">
            <section>
                <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                    In Progress
                </h2>
                <div className="grid md:grid-cols-2 gap-4">
                    {inProgress.map(task => <TaskCard key={task.id} task={task} />)}
                    {inProgress.length === 0 && <p className="text-zinc-500 text-sm">No tasks currently in progress.</p>}
                </div>
            </section>

            <section>
                <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-amber-500" />
                    Pending Review
                </h2>
                <div className="grid md:grid-cols-2 gap-4">
                    {pending.map(task => <TaskCard key={task.id} task={task} />)}
                    {pending.length === 0 && <p className="text-zinc-500 text-sm">No tasks pending review.</p>}
                </div>
            </section>
        </div>

        {/* Column 2: Scheduled & History */}
        <div className="space-y-8">
             <section>
                <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-zinc-400" />
                    Scheduled
                </h2>
                <div className="space-y-4">
                    {scheduled.map(task => <TaskCard key={task.id} task={task} />)}
                    {scheduled.length === 0 && <p className="text-zinc-500 text-sm">No scheduled tasks.</p>}
                </div>
            </section>

             <section>
                <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    Recently Completed
                </h2>
                <div className="space-y-4 opacity-75">
                    {completed.map(task => <TaskCard key={task.id} task={task} />)}
                    {completed.length === 0 && <p className="text-zinc-500 text-sm">No completed tasks history.</p>}
                </div>
            </section>
        </div>

      </div>
    </div>
  );
}
