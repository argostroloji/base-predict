'use client';

import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

export default function RewardPool() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <motion.div
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.8, ease: 'easeOut' }}
      className="relative group inline-block"
    >
      <div className="absolute -inset-1 bg-gradient-to-r from-[#0052FF] to-[#3B82FF] rounded-2xl blur opacity-30 group-hover:opacity-50 transition duration-1000 group-hover:duration-200 animate-pulse"></div>
      <div className="relative bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6 text-center shadow-xl">
        <p className="text-xs uppercase tracking-widest text-gray-400 font-semibold mb-2">
          Winners Earn
        </p>
        <div className="flex flex-col items-center justify-center">
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-br from-white to-[#0052FF] drop-shadow-[0_0_15px_rgba(0,82,255,0.5)]"
          >
            50%
          </motion.div>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8, duration: 0.5 }}
            className="mt-1 text-sm text-gray-400 font-medium"
          >
            of $BASEPRE token fees<br/>
            distributed to correct-date NFT holders
          </motion.div>
        </div>

        <div className="absolute top-2 left-2 w-1 h-1 bg-white rounded-full animate-ping opacity-50"></div>
        <div className="absolute bottom-4 right-4 w-1.5 h-1.5 bg-[#0052FF] rounded-full animate-ping opacity-75"></div>
      </div>
    </motion.div>
  );
}
