import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";

interface EnhancedChartsProps {
  collectesData: any[];
  performanceData: any[];
}

export const EnhancedCharts = ({ collectesData, performanceData }: EnhancedChartsProps) => {
  return (
    <motion.div 
      className="grid gap-6 md:grid-cols-2"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Graphique d'évolution */}
      <Card className="chart-card p-6 bg-gradient-to-br from-blue-600 to-cyan-600 text-white">
        <h3 className="text-xl font-bold mb-6">Évolution des Collectes</h3>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={collectesData}>
              <defs>
                <linearGradient id="colorKg" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#fff" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#fff" stopOpacity={0.1}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis 
                dataKey="mois" 
                stroke="rgba(255,255,255,0.7)"
                tick={{ fill: 'rgba(255,255,255,0.7)' }}
              />
              <YAxis 
                stroke="rgba(255,255,255,0.7)"
                tick={{ fill: 'rgba(255,255,255,0.7)' }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgba(0,0,0,0.8)',
                  border: 'none',
                  borderRadius: '8px',
                  color: 'white'
                }}
              />
              <Line
                type="monotone"
                dataKey="kg"
                stroke="#fff"
                strokeWidth={3}
                dot={{ fill: '#fff', strokeWidth: 2, r: 4 }}
                activeDot={{ r: 8 }}
                fill="url(#colorKg)"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* Graphique de performance */}
      <Card className="chart-card p-6 bg-gradient-to-br from-purple-600 to-pink-600 text-white">
        <h3 className="text-xl font-bold mb-6">Performance Hebdomadaire</h3>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={performanceData}>
              <defs>
                <linearGradient id="colorCollectes" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#fff" stopOpacity={0.8}/>
                  <stop offset="100%" stopColor="#fff" stopOpacity={0.2}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis 
                dataKey="jour" 
                stroke="rgba(255,255,255,0.7)"
                tick={{ fill: 'rgba(255,255,255,0.7)' }}
              />
              <YAxis 
                stroke="rgba(255,255,255,0.7)"
                tick={{ fill: 'rgba(255,255,255,0.7)' }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgba(0,0,0,0.8)',
                  border: 'none',
                  borderRadius: '8px',
                  color: 'white'
                }}
              />
              <Bar 
                dataKey="collectes" 
                fill="url(#colorCollectes)"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>
    </motion.div>
  );
};
