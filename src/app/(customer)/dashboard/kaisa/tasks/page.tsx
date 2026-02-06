
import { getKaisaDashboardData } from "@/app/actions/customer";
import { 
  CheckCircle, 
  Clock, 
  Calendar,
  AlertCircle
} from "lucide-react";
import { KaisaTask } from "@/types/kaisa";
import { TaskCard } from "./TaskCard";

export default async function KaisaTasksPage() {
  const data = await getKaisaDashboardData();
  const { tasks } = data;

  const inProgress = tasks.filter(t => t.status === "in_progress");
  const queued = tasks.filter(t => t.status === "queued");
  const scheduled = tasks.filter(t => t.status === "scheduled"); // Not used yet
  const completed = tasks.filter(t => t.status === "completed");

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white mb-1">Tasks & Operations</h1>
        <p className="text-zinc-400">Track what your AI workforce is working on.</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        
        {/* Column 1: In Progress & Queued */}
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
                    Queued / Pending
                </h2>
                <div className="grid md:grid-cols-2 gap-4">
                    {queued.map(task => <TaskCard key={task.id} task={task} />)}
                    {queued.length === 0 && <p className="text-zinc-500 text-sm">No tasks queued.</p>}
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
