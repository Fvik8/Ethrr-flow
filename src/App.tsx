/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useMemo, type ReactNode } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Wallet, 
  TrendingUp, 
  ShieldCheck, 
  BarChart3, 
  Activity, 
  ArrowUpRight, 
  ArrowDownRight,
  Zap,
  Globe,
  Layers
} from 'lucide-react';

// --- Types ---
interface StakingTier {
  id: string;
  name: string;
  apy: number;
  minStake: number;
  color: string;
  description: string;
  details: {
    benefits: string[];
    risks: string[];
    conditions: string[];
  };
}

interface LiquidityPool {
  id: string;
  pair: string;
  assets: [string, string];
  liquidity: string;
  apy: number;
  volume24h: string;
  trend: 'up' | 'down';
}

interface Transaction {
  id: string;
  type: 'stake' | 'liquidation' | 'harvest';
  amount: number;
  asset: string;
  timestamp: string;
  address: string;
}

// --- Constants ---
const TIERS: StakingTier[] = [
  { 
    id: 'core', 
    name: 'Core', 
    apy: 5.4, 
    minStake: 0.1, 
    color: 'from-blue-500/20 to-cyan-500/20',
    description: 'Entry-level liquidity provisioning with stable returns.',
    details: {
      benefits: ['Stable APY', 'Low Entry Barrier', '24/7 Liquidity'],
      risks: ['Standard Smart Contract Risk', 'Minor APY Fluctuations'],
      conditions: ['7-day Unbonding Period', 'Min. 0.1 ETH Stake']
    }
  },
  { 
    id: 'advanced', 
    name: 'Advanced', 
    apy: 8.2, 
    minStake: 10, 
    color: 'from-violet-500/20 to-purple-500/20',
    description: 'Optimized yield strategies for experienced governors.',
    details: {
      benefits: ['Higher Yield Multiplier', 'Governance Voting Power', 'Priority Access'],
      risks: ['Impermanent Loss Exposure', 'Moderate Strategy Risk'],
      conditions: ['14-day Unbonding Period', 'Min. 10 ETH Stake']
    }
  },
  { 
    id: 'institutional', 
    name: 'Institutional', 
    apy: 12.5, 
    minStake: 250, 
    color: 'from-fuchsia-500/20 to-pink-500/20',
    description: 'High-volume liquidity pools with priority governance.',
    details: {
      benefits: ['Maximum Yield Protocol', 'Direct Engineering Support', 'Fee Share Rights'],
      risks: ['Complex Strategy Exposure', 'Liquidity Depth Sensitivity'],
      conditions: ['30-day Unbonding Period', 'Whitelisted Address Only']
    }
  },
];

const INITIAL_TRANSACTIONS: Transaction[] = [
  { id: '1', type: 'stake', amount: 12.4, asset: 'ETH', timestamp: 'Just now', address: '0x4f2...a12' },
  { id: '2', type: 'liquidation', amount: 0.85, asset: 'BTC', timestamp: '2m ago', address: '0x9a1...1e4' },
  { id: '3', type: 'harvest', amount: 1540, asset: 'FLOW', timestamp: '5m ago', address: '0x32b...f91' },
  { id: '4', type: 'stake', amount: 45.0, asset: 'USDC', timestamp: '8m ago', address: '0x77c...d32' },
  { id: '5', type: 'stake', amount: 2.1, asset: 'ETH', timestamp: '12m ago', address: '0x11e...c88' },
];

const POOLS: LiquidityPool[] = [
  { id: 'p1', pair: 'ETH / USDC', assets: ['ETH', 'USDC'], liquidity: '$142.5M', apy: 18.4, volume24h: '$12.8M', trend: 'up' },
  { id: 'p2', pair: 'WBTC / ETH', assets: ['BTC', 'ETH'], liquidity: '$84.2M', apy: 12.1, volume24h: '$8.4M', trend: 'up' },
  { id: 'p3', pair: 'FLOW / USDT', assets: ['FLOW', 'USDT'], liquidity: '$32.1M', apy: 24.8, volume24h: '$4.2M', trend: 'down' },
];

// --- Components ---

const AnimatedFlow = () => (
  <svg className="absolute inset-0 w-full h-full opacity-30 pointer-events-none" viewBox="0 0 800 300" preserveAspectRatio="none">
    <defs>
      <linearGradient id="flowGradient" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0" />
        <stop offset="50%" stopColor="#22d3ee" stopOpacity="0.5" />
        <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0" />
      </linearGradient>
      <filter id="glow">
        <feGaussianBlur stdDeviation="2" result="blur" />
        <feComposite in="SourceGraphic" in2="blur" operator="over" />
      </filter>
    </defs>
    
    {/* Flowing Paths */}
    <motion.path
      d="M -50,150 Q 200,50 400,150 T 850,150"
      stroke="url(#flowGradient)"
      strokeWidth="1.5"
      fill="none"
      initial={{ pathLength: 0.2, pathOffset: 0 }}
      animate={{ pathOffset: [0, 1] }}
      transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
    />
    <motion.path
      d="M -50,150 Q 200,250 400,150 T 850,150"
      stroke="url(#flowGradient)"
      strokeWidth="1"
      fill="none"
      initial={{ pathLength: 0.3, pathOffset: 0.5 }}
      animate={{ pathOffset: [0.5, 1.5] }}
      transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
    />
    
    {/* Flow Particles */}
    {[...Array(5)].map((_, i) => (
      <motion.circle
        key={i}
        r="2"
        fill="#22d3ee"
        filter="url(#glow)"
        initial={{ offsetDistance: "0%" }}
        animate={{ offsetDistance: "100%" }}
        transition={{
          duration: 3 + i,
          repeat: Infinity,
          ease: "linear",
          delay: i * 1.5
        }}
        style={{ offsetPath: "path('M -50,150 Q 200,100 400,150 T 850,150')" }}
      />
    ))}
  </svg>
);

const TierTooltip = ({ tier }: { tier: StakingTier }) => (
  <motion.div
    initial={{ opacity: 0, y: 10, scale: 0.95 }}
    animate={{ opacity: 1, y: 0, scale: 1 }}
    exit={{ opacity: 0, y: 10, scale: 0.95 }}
    className="absolute bottom-[calc(100%+1rem)] left-0 right-0 z-[60] p-4 glass-card shadow-2xl border-white/20 pointer-events-none"
    style={{ backdropFilter: 'blur(30px)' }}
  >
    <div className="grid grid-cols-1 gap-4 text-[10px]">
      <div>
        <h4 className="text-emerald-400 font-bold uppercase tracking-[0.2em] mb-2 flex items-center gap-1.5">
          <ArrowUpRight className="w-3 h-3" /> Benefits
        </h4>
        <div className="grid grid-cols-1 gap-1">
          {tier.details.benefits.map((b, i) => (
            <div key={i} className="text-slate-300 flex items-center gap-2">
              <div className="w-1 h-1 rounded-full bg-emerald-500/40" />
              {b}
            </div>
          ))}
        </div>
      </div>
      <div className="h-px bg-white/5" />
      <div>
        <h4 className="text-red-400 font-bold uppercase tracking-[0.2em] mb-2 flex items-center gap-1.5">
          <ArrowDownRight className="w-3 h-3" /> Risks
        </h4>
        <div className="grid grid-cols-1 gap-1">
          {tier.details.risks.map((r, i) => (
            <div key={i} className="text-slate-300 flex items-center gap-2">
              <div className="w-1 h-1 rounded-full bg-red-500/40" />
              {r}
            </div>
          ))}
        </div>
      </div>
      <div className="h-px bg-white/5" />
      <div>
        <h4 className="text-cyan-400 font-bold uppercase tracking-[0.2em] mb-2 flex items-center gap-1.5">
          <ShieldCheck className="w-3 h-3" /> Conditions
        </h4>
        <div className="grid grid-cols-1 gap-1">
          {tier.details.conditions.map((c, i) => (
            <div key={i} className="text-slate-300 flex items-center gap-2">
              <div className="w-1 h-1 rounded-full bg-cyan-500/40" />
              {c}
            </div>
          ))}
        </div>
      </div>
    </div>
    {/* Tooltip Arrow */}
    <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-[#1e293b] rotate-45 border-r border-b border-white/10" style={{ backgroundColor: 'rgba(255, 255, 255, 0.05)', backdropFilter: 'blur(30px)' }} />
  </motion.div>
);

const TransactionModal = ({ tx, onClose }: { tx: Transaction; onClose: () => void }) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    onClick={onClose}
    className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
  >
    <motion.div
      initial={{ scale: 0.9, opacity: 0, y: 20 }}
      animate={{ scale: 1, opacity: 1, y: 0 }}
      exit={{ scale: 0.9, opacity: 0, y: 20 }}
      onClick={(e) => e.stopPropagation()}
      className="w-full max-w-md glass-panel p-8 relative overflow-hidden"
    >
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-cyan-500 via-violet-500 to-fuchsia-500" />
      
      <button 
        onClick={onClose}
        className="absolute top-4 right-4 p-2 rounded-lg hover:bg-white/10 transition-colors text-slate-400 hover:text-white"
      >
        <Activity className="w-5 h-5 rotate-45" />
      </button>

      <div className="flex items-center gap-4 mb-8">
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
          tx.type === 'stake' ? 'bg-emerald-500/20 text-emerald-400' : 
          tx.type === 'liquidation' ? 'bg-red-500/20 text-red-400' : 'bg-cyan-500/20 text-cyan-400'
        }`}>
          {tx.type === 'stake' ? <ArrowUpRight className="w-6 h-6" /> : 
           tx.type === 'liquidation' ? <ArrowDownRight className="w-6 h-6" /> : <Zap className="w-6 h-6" />}
        </div>
        <div>
          <h2 className="text-xl font-bold capitalize">{tx.type} Details</h2>
          <p className="text-xs text-slate-400 font-mono tracking-wider">{tx.id}</p>
        </div>
      </div>

      <div className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 bg-white/5 rounded-xl border border-white/5">
            <p className="text-[10px] uppercase tracking-widest text-slate-500 mb-1">Amount</p>
            <p className="text-lg font-mono font-bold text-white">{tx.amount} {tx.asset}</p>
          </div>
          <div className="p-4 bg-white/5 rounded-xl border border-white/5">
            <p className="text-[10px] uppercase tracking-widest text-slate-500 mb-1">Status</p>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <p className="text-sm font-bold text-emerald-400 uppercase tracking-wider">Confirmed</p>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex justify-between items-center text-sm">
            <span className="text-slate-400">Wallet Address</span>
            <span className="font-mono text-cyan-400">{tx.address}</span>
          </div>
          <div className="flex justify-between items-center text-sm">
            <span className="text-slate-400">Timestamp</span>
            <span className="text-slate-200">{tx.timestamp}</span>
          </div>
          <div className="flex justify-between items-center text-sm">
            <span className="text-slate-400">Network Fee</span>
            <span className="text-slate-200 font-mono">0.00042 ETH</span>
          </div>
          <div className="flex justify-between items-center text-sm">
            <span className="text-slate-400">Block Explorer</span>
            <span className="text-violet-400 flex items-center gap-1 cursor-pointer hover:underline text-xs">
              View on Etherscan <ArrowUpRight className="w-3 h-3" />
            </span>
          </div>
        </div>

        <button 
          onClick={onClose}
          className="w-full py-3 bg-white/10 hover:bg-white/20 border border-white/10 rounded-xl font-bold transition-all text-sm"
        >
          CLOSE
        </button>
      </div>
    </motion.div>
  </motion.div>
);

const GlassCard = ({ children, className = '', glowColor = 'rgba(139, 92, 246, 0.05)' }: { children: ReactNode, className?: string, glowColor?: string }) => (
  <div 
    className={`glass-card relative group ${className}`}
    style={{ boxShadow: `0 0 40px ${glowColor}` }}
  >
    <div className="absolute inset-0 bg-gradient-to-br from-white/[0.02] to-transparent pointer-events-none" />
    <div className="relative z-10 p-5">
      {children}
    </div>
  </div>
);

export default function App() {
  const [isConnected, setIsConnected] = useState(false);
  const [stakeAmount, setStakeAmount] = useState(50000);
  const [activeTier, setActiveTier] = useState<StakingTier>(TIERS[1]);
  const [hoveredTierId, setHoveredTierId] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<'all' | 'stake' | 'liquidation' | 'harvest'>('all');
  const [transactions, setTransactions] = useState<Transaction[]>(INITIAL_TRANSACTIONS);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [pools, setPools] = useState<LiquidityPool[]>(POOLS);

  // Fake real-time updates for the feed and APYs
  useEffect(() => {
    const interval = setInterval(() => {
      // Update transaction feed
      const types: Array<'stake' | 'liquidation' | 'harvest'> = ['stake', 'liquidation', 'harvest'];
      const assets = ['ETH', 'BTC', 'FLOW', 'USDC'];
      const newTx: Transaction = {
        id: Math.random().toString(36).substr(2, 9),
        type: types[Math.floor(Math.random() * types.length)],
        amount: parseFloat((Math.random() * 50).toFixed(2)),
        asset: assets[Math.floor(Math.random() * assets.length)],
        timestamp: 'Just now',
        address: `0x${Math.random().toString(16).substr(2, 3)}...${Math.random().toString(16).substr(2, 3)}`
      };
      setTransactions(prev => [newTx, ...prev.slice(0, 10)]);

      // Update Liquidity Pool APYs
      setPools(prevPools => prevPools.map(pool => {
        const change = (Math.random() * 0.4 - 0.2); // Random change between -0.2 and 0.2
        const newApy = Math.max(1, parseFloat((pool.apy + change).toFixed(2)));
        return {
          ...pool,
          apy: newApy,
          trend: change >= 0 ? 'up' : 'down'
        };
      }));
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const filteredTransactions = useMemo(() => {
    if (activeFilter === 'all') return transactions;
    return transactions.filter(tx => tx.type === activeFilter);
  }, [transactions, activeFilter]);

  const estimatedReturn = useMemo(() => {
    return (stakeAmount * (activeTier.apy / 100)).toLocaleString(undefined, { maximumFractionDigits: 2 });
  }, [stakeAmount, activeTier]);

  return (
    <div className="min-h-screen flex flex-col p-6 max-w-[1200px] mx-auto overflow-hidden">
      {/* Header / Navbar */}
      <nav className="flex justify-between items-center mb-6 z-50">
        <div className="flex items-center space-x-3 group">
          <div className="w-10 h-10 bg-gradient-to-tr from-cyan-400 to-violet-600 rounded-lg flex items-center justify-center shadow-lg shadow-cyan-500/20">
            <Zap className="text-white w-6 h-6 fill-white/20" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white">
            EtherFlow
          </h1>
        </div>

        <div className="flex items-center gap-4">
          <div className="px-3 py-1 bg-white/5 border border-white/10 rounded-full text-xs font-mono text-cyan-400 hidden md:block">
            Mainnet: 48.2 Gwei
          </div>
          <button 
            onClick={() => setIsConnected(!isConnected)}
            className={`px-6 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 flex items-center space-x-2 relative group overflow-hidden border border-white/20 ${
              isConnected 
              ? 'bg-white/5 text-emerald-400 shadow-none' 
              : 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-[0_0_15px_rgba(34,211,238,0.4)] hover:scale-[1.02]'
            }`}
          >
            {isConnected && <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />}
            <span>{isConnected ? '0x71C...32f' : 'Connect Wallet'}</span>
          </button>
        </div>
      </nav>

      <main className="flex-1 grid grid-cols-12 gap-6 overflow-hidden">
        {/* Left Column: Visualizer, Tiers & Calculator */}
        <div className="col-span-12 lg:col-span-8 flex flex-col gap-6 overflow-y-auto pr-1">
          
          {/* Blockchain & Liquidity Visualizer */}
          <div className="relative h-[280px] bg-white/5 border border-white/10 backdrop-blur-md rounded-3xl overflow-hidden flex flex-col items-center justify-center p-6">
            <div className="absolute inset-0 opacity-10 pointer-events-none">
              <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                    <path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" strokeWidth="0.5"/>
                  </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#grid)" />
              </svg>
            </div>
            
            <AnimatedFlow />
            
            <div className="z-10 flex gap-12 items-center">
              <motion.div 
                animate={{ 
                  rotate: [0, 5, 0],
                  scale: [1, 1.05, 1],
                  boxShadow: [
                    "0 0 20px rgba(139, 92, 246, 0.1)",
                    "0 0 40px rgba(139, 92, 246, 0.3)",
                    "0 0 20px rgba(139, 92, 246, 0.1)"
                  ]
                }}
                transition={{ duration: 4, repeat: Infinity }}
                className="w-20 h-20 rounded-2xl bg-violet-600/20 border border-violet-400/30 flex items-center justify-center relative overflow-hidden"
              >
                <motion.div 
                  animate={{ opacity: [0.4, 0.8, 0.4] }}
                  transition={{ duration: 4, repeat: Infinity }}
                  className="w-10 h-10 bg-violet-400/40 rounded-lg shadow-inner" 
                />
                <div className="absolute inset-0 bg-gradient-to-tr from-violet-400/10 to-transparent pointer-events-none" />
              </motion.div>
              
              <div className="flex-1 h-0.5 bg-gradient-to-r from-violet-500 to-cyan-500 w-24 md:w-48 relative">
                <motion.div 
                  initial={{ left: "0%" }}
                  animate={{ left: "100%" }}
                  transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                  className="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-white rounded-full shadow-[0_0_20px_white]"
                />
              </div>

              <motion.div 
                animate={{ 
                  rotate: [0, -5, 0],
                  scale: [1, 1.05, 1],
                  boxShadow: [
                    "0 0 20px rgba(34, 211, 238, 0.1)",
                    "0 0 40px rgba(34, 211, 238, 0.3)",
                    "0 0 20px rgba(34, 211, 238, 0.1)"
                  ]
                }}
                transition={{ duration: 4, repeat: Infinity, delay: 1 }}
                className="w-20 h-20 rounded-2xl bg-cyan-600/20 border border-cyan-400/30 flex items-center justify-center relative overflow-hidden"
              >
                <motion.div 
                  animate={{ opacity: [0.4, 0.8, 0.4] }}
                  transition={{ duration: 4, repeat: Infinity, delay: 1 }}
                  className="w-10 h-10 bg-cyan-400/40 rounded-lg shadow-inner" 
                />
                <div className="absolute inset-0 bg-gradient-to-tr from-cyan-400/10 to-transparent pointer-events-none" />
              </motion.div>
            </div>
            
            <div className="mt-6 text-cyan-400/70 font-mono text-xs tracking-[0.3em] uppercase">Liquidity Flow Optimized</div>
          </div>

          {/* Staking Tiers */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {TIERS.map((tier) => (
              <motion.div
                key={tier.id}
                whileHover={{ 
                  y: -8, 
                  scale: 1.02,
                  boxShadow: activeTier.id === tier.id 
                    ? "0 20px 30px -10px rgba(139, 92, 246, 0.2)" 
                    : "0 20px 30px -10px rgba(255, 255, 255, 0.05)"
                }}
                whileTap={{ scale: 0.98 }}
                transition={{ type: "spring", stiffness: 400, damping: 17 }}
                onClick={() => setActiveTier(tier)}
                onMouseEnter={() => setHoveredTierId(tier.id)}
                onMouseLeave={() => setHoveredTierId(null)}
                className={`cursor-pointer transition-all duration-300 rounded-2xl relative ${
                  activeTier.id === tier.id ? 'ring-2 ring-violet-500/40' : 'opacity-80'
                }`}
              >
                <AnimatePresence>
                  {hoveredTierId === tier.id && <TierTooltip tier={tier} />}
                </AnimatePresence>

                <div className={`p-5 flex flex-col gap-3 h-full rounded-2xl border transition-colors ${
                  activeTier.id === tier.id 
                  ? 'bg-violet-500/10 border-violet-400/30' 
                  : 'bg-white/5 border-white/10'
                }`}>
                  <div className={`text-xs font-semibold uppercase tracking-wider ${
                    activeTier.id === tier.id ? 'text-violet-400' : 'text-slate-400'
                  }`}>
                    {tier.name} Tier
                  </div>
                  <div className="text-3xl font-bold text-white flex items-baseline gap-1">
                    {tier.apy}% <span className="text-sm font-normal text-slate-500">APY</span>
                  </div>
                  <div className="text-xs text-slate-500 leading-relaxed min-h-[48px]">
                    {tier.description}
                  </div>
                  <button className={`mt-2 w-full py-2 rounded-lg text-xs font-medium transition-colors ${
                    activeTier.id === tier.id 
                    ? 'bg-violet-500/20 border border-violet-400/30 text-white' 
                    : 'bg-white/5 border border-white/10 text-slate-300 hover:bg-white/10'
                  }`}>
                    {activeTier.id === tier.id ? 'Active Strategy' : 'Select Plan'}
                  </button>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Liquidity Pools Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between px-2">
              <div className="flex items-center gap-2">
                <Layers className="w-5 h-5 text-violet-400" />
                <h2 className="text-lg font-bold tracking-tight">Ecosystem Liquidity Pools</h2>
              </div>
              <span className="text-[10px] font-mono text-white/30 uppercase tracking-widest bg-white/5 px-3 py-1 rounded-full border border-white/5">
                V3 Concentrated
              </span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {pools.map((pool) => (
                <motion.div
                  key={pool.id}
                  layout
                  whileHover={{ y: -4 }}
                  className="glass-card group hover:border-cyan-500/30 transition-colors"
                >
                  <div className="p-5 space-y-4">
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-2">
                        <div className="flex -space-x-2">
                          <div className="w-6 h-6 rounded-full bg-violet-600 border border-white/20 flex items-center justify-center text-[10px] font-bold">{pool.assets[0][0]}</div>
                          <div className="w-6 h-6 rounded-full bg-cyan-600 border border-white/20 flex items-center justify-center text-[10px] font-bold">{pool.assets[1][0]}</div>
                        </div>
                        <span className="text-sm font-bold tracking-tight">{pool.pair}</span>
                      </div>
                      <div className={`flex items-center gap-1 text-[10px] font-bold transition-colors duration-500 ${pool.trend === 'up' ? 'text-emerald-400' : 'text-red-400'}`}>
                        {pool.trend === 'up' ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                        <motion.span
                          key={pool.apy}
                          initial={{ opacity: 0, y: -5 }}
                          animate={{ opacity: 1, y: 0 }}
                        >
                          {pool.apy}%
                        </motion.span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 border-t border-white/5 pt-4">
                      <div>
                        <p className="text-[10px] uppercase text-slate-500 tracking-wider mb-0.5">Liquidity</p>
                        <p className="text-xs font-mono font-medium">{pool.liquidity}</p>
                      </div>
                      <div>
                        <p className="text-[10px] uppercase text-slate-500 tracking-wider mb-0.5">24h Volume</p>
                        <p className="text-xs font-mono font-medium">{pool.volume24h}</p>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <button className="flex-1 py-2 bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/20 rounded-xl text-[10px] font-bold uppercase tracking-widest text-cyan-400 transition-all">
                        Add Liquidity
                      </button>
                      <button className="flex-1 py-2 bg-violet-500/10 hover:bg-violet-500/20 border border-violet-500/20 rounded-xl text-[10px] font-bold uppercase tracking-widest text-violet-400 transition-all">
                        Trade
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Profit Calculator */}
          <div className="bg-gradient-to-r from-blue-900/40 to-violet-900/40 border border-white/10 backdrop-blur-xl rounded-2xl p-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-4 gap-4">
              <div className="flex flex-col gap-1">
                <label className="text-xs text-slate-400 uppercase font-mono tracking-tighter">Amount to Stake</label>
                <div className="text-2xl font-bold flex items-center gap-2">
                  {stakeAmount.toLocaleString()}.00 <span className="text-blue-400 text-sm">USDT</span>
                </div>
              </div>
              <div className="flex flex-col items-start md:items-end gap-1">
                <label className="text-xs text-slate-400 uppercase font-mono tracking-tighter">Est. Yearly Return</label>
                <div className="text-2xl font-bold text-emerald-400 flex items-center gap-2">
                  + {estimatedReturn} <span className="text-sm font-normal">USDT</span>
                </div>
              </div>
            </div>
            
            <input 
              type="range" 
              min="1000" 
              max="100000" 
              step="1000"
              value={stakeAmount}
              onChange={(e) => setStakeAmount(Number(e.target.value))}
              className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-cyan-400 mb-2"
            />
            <div className="flex justify-between text-[10px] text-slate-500 font-mono tracking-wider">
              <span>1,000 USDT</span>
              <span>100,000 USDT</span>
            </div>
          </div>
        </div>

        {/* Right Column: Transaction Feed */}
        <div className="col-span-12 lg:col-span-4 bg-black/20 border border-white/10 backdrop-blur-md rounded-3xl flex flex-col p-4 overflow-hidden">
          <div className="flex justify-between items-center mb-4 px-2">
            <h3 className="text-sm font-bold uppercase tracking-widest text-slate-300">Activity Feed</h3>
            <div className="flex gap-1">
              <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse"></div>
              <div className="w-1.5 h-1.5 rounded-full bg-slate-700"></div>
            </div>
          </div>

          <div className="flex gap-2 mb-6 px-2 overflow-x-auto custom-scrollbar pb-2">
            {(['all', 'stake', 'liquidation', 'harvest'] as const).map((f) => (
              <button
                key={f}
                onClick={() => setActiveFilter(f)}
                className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all whitespace-nowrap ${
                  activeFilter === f 
                  ? 'bg-violet-500 text-white shadow-lg shadow-violet-500/20' 
                  : 'bg-white/5 text-slate-400 hover:bg-white/10 border border-white/5'
                }`}
              >
                {f === 'all' ? 'All' : f === 'stake' ? 'Stakes' : f === 'liquidation' ? 'Liquidations' : 'Harvests'}
              </button>
            ))}
          </div>

          <div className="flex-1 space-y-3 overflow-y-auto pr-2 custom-scrollbar">
            <AnimatePresence initial={false} mode="popLayout">
              {filteredTransactions.length > 0 ? (
                filteredTransactions.map((tx) => (
                  <motion.div
                    key={tx.id}
                    layout
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    onClick={() => setSelectedTransaction(tx)}
                    className="cursor-pointer"
                  >
                    <div className={`p-4 bg-white/5 rounded-r-lg border-l-2 transition-all hover:bg-white/10 hover:translate-x-1 ${
                      tx.type === 'stake' ? 'border-emerald-500' : 
                      tx.type === 'liquidation' ? 'border-red-500' : 'border-cyan-500'
                    }`}>
                      <div className="flex justify-between text-[10px] mb-1">
                        <span className={`font-bold uppercase ${
                          tx.type === 'stake' ? 'text-emerald-400' : 
                          tx.type === 'liquidation' ? 'text-red-400' : 'text-cyan-400'
                        }`}>
                          {tx.type}
                        </span>
                        <span className="text-slate-500 font-mono">{tx.timestamp}</span>
                      </div>
                      <div className="text-xs text-slate-200">
                        User <span className="font-mono text-[10px] text-white/40">{tx.address}</span> 
                        {tx.type === 'stake' ? ` deposited ${tx.amount} ${tx.asset}` : 
                         tx.type === 'liquidation' ? ` collateral liquidated in Pool #04` : 
                         ` harvested ${tx.amount} ${tx.asset} rewards`}
                      </div>
                    </div>
                  </motion.div>
                ))
              ) : (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="h-full flex items-center justify-center text-slate-500 text-xs font-mono tracking-widest uppercase py-12"
                >
                  No {activeFilter} actions found
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="mt-4 pt-4 border-t border-white/5 space-y-2">
            <div className="text-[10px] text-slate-500 font-mono text-center">
              Protocol TVL: $2.4B | 24h Vol: $412M
            </div>
            <div className="flex justify-center gap-4 text-[10px] text-slate-400 font-medium uppercase tracking-[0.2em] opacity-50">
              <span>Secure</span>
              <div className="w-1 h-1 bg-slate-600 rounded-full my-auto" />
              <span>Liquid</span>
              <div className="w-1 h-1 bg-slate-600 rounded-full my-auto" />
              <span>Transparent</span>
            </div>
          </div>
        </div>
      </main>

      <AnimatePresence>
        {selectedTransaction && (
          <TransactionModal 
            tx={selectedTransaction} 
            onClose={() => setSelectedTransaction(null)} 
          />
        )}
      </AnimatePresence>
    </div>
  );
}
