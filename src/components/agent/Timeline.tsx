import { Clock, Activity } from "lucide-react";
import './timeline.css';

interface Activity {
  type: string;
  description: string;
  timestamp: Date;
}

interface TimelineProps {
  activities: Activity[];
}

export const Timeline = ({ activities }: TimelineProps) => {
  return (
    <div className="timeline-card rounded-xl bg-gradient-to-br from-violet-600 via-purple-600 to-indigo-700 text-white h-full flex flex-col shadow-lg hover-card glass-effect overflow-hidden">
      <div className="flex items-center justify-between p-4 border-b border-white/10 backdrop-blur-md bg-white/5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center backdrop-blur-md">
            <Activity className="h-5 w-5 text-purple-200 floating" />
          </div>
          <div>
            <h3 className="text-lg font-semibold">Activités Récentes</h3>
            <p className="text-xs text-purple-200">Dernières actions effectuées</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-green-400 pulse"></div>
          <Clock className="h-5 w-5 text-purple-200" />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto timeline-scroll p-4 space-y-4 min-h-0">
        {activities.map((activity, index) => (
          <div 
            key={index} 
            className="timeline-item relative pl-6 pb-4 last:pb-0"
          >
            {/* Ligne verticale */}
            {index !== activities.length - 1 && (
              <div className="timeline-line absolute left-[0.6rem] top-3 w-0.5 h-full" />
            )}
            
            {/* Point */}
            <div className="timeline-dot absolute left-0 top-2 w-3 h-3 rounded-full" />
            
            <div className="timeline-activity-card bg-white/10 rounded-lg p-4 hover:bg-white/15 transition-all">
              <div className="text-sm font-medium">{activity.description}</div>
              <div className="text-xs text-purple-200 mt-2 flex items-center gap-2">
                <Clock className="w-3 h-3" />
                {new Date(activity.timestamp).toLocaleString('fr-FR', {
                  hour: '2-digit',
                  minute: '2-digit',
                  day: '2-digit',
                  month: 'long'
                })}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
