import { Link, useNavigate } from 'react-router-dom';
import { Trophy, Users, Target, Brain } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Home() {
  const navigate = useNavigate();
  return (
    <div className="space-y-12">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center text-white"
      >

        <h1 className="text-6xl font-bold mb-4">🏆 Sports Tournament System</h1>
        <p className="text-2xl mb-8 opacity-90">Professional platform with tournament management & AI predictions</p>
        <Link 
          to="/tournaments/create"
          className="gradient-btn text-white px-10 py-4 rounded-lg text-xl font-bold inline-block"
        >
          Create Tournament
        </Link>
      </motion.div>

      <div className="grid md:grid-cols-4 gap-6">
        {[
          { 
            icon: Trophy, 
            title: 'Multi-Sport', 
            desc: 'Football, Basketball, Cricket & more',
            action: () => navigate('/sports')
          },
          { 
            icon: Users, 
            title: 'Team Management', 
            desc: 'Easy registration & player tracking',
            action: () => navigate('/teams')
          },
          { 
            icon: Target, 
            title: 'Auto Brackets', 
            desc: '4 tournament formats supported',
            action: () => navigate('/tournaments/1')
          },
          { 
            icon: Brain, 
            title: 'AI Predictions', 
            desc: 'Smart match outcome analysis',
            action: () => navigate('/tournaments/1?tab=predictions')
          }
        ].map((feature, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            onClick={feature.action}
            className="glass-card p-6 text-white text-center hover:scale-105 transition cursor-pointer"
          >
            <feature.icon className="w-12 h-12 mx-auto mb-4" />
            <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
            <p className="text-sm opacity-80">{feature.desc}</p>
            <div className="mt-4 text-xs opacity-60">
              Click to explore →
            </div>
          </motion.div>
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="glass-card p-8 text-white"
      >
        <h2 className="text-3xl font-bold mb-4">Features</h2>
        <ul className="space-y-3 text-lg">
          <li>Multiple tournament formats (Single/Double Elimination, Round Robin, Swiss)</li>
          <li>Automated bracket generation and seeding</li>
          <li>Live score tracking and standings</li>
          <li>AI-powered match predictions with confidence scores</li>
          <li>Comprehensive analytics and performance insights</li>
          <li>Beautiful, responsive design for all devices</li>
        </ul>
      </motion.div>
    </div>
  );
}
