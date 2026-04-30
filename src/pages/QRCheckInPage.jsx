import React, { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { QrCode, ShieldCheck, RefreshCw } from 'lucide-react';

export default function QRCheckInPage() {
  const [token, setToken] = useState('');
  const [timeLeft, setTimeLeft] = useState(5);

  const generateToken = () => {
    // Generate a random string to represent a secure, rotating token
    return 'ts2-' + Math.random().toString(36).substring(2, 15) + '-' + Date.now();
  };

  useEffect(() => {
    setToken(generateToken());
    
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          setToken(generateToken());
          return 5; // Reset timer to 5 seconds
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="space-y-6 animate-fade-in flex flex-col items-center">
      <div className="w-full max-w-2xl text-center mb-4">
        <h1 className="text-2xl font-bold flex items-center justify-center gap-2" style={{ color: '#f1f5f9' }}>
          <QrCode size={28} color="#a5b4fc" /> Secure QR Check-in
        </h1>
        <p className="text-sm mt-2" style={{ color: '#94a3b8' }}>
          Project this code. Students scan via the app to mark attendance. <br/>
          To prevent proxy attendance, the code rotates every 5 seconds.
        </p>
      </div>

      <div className="glass-card p-12 flex flex-col items-center justify-center relative overflow-hidden" style={{ minWidth: '350px' }}>
        {/* Animated background pulse */}
        <div 
          className="absolute inset-0 opacity-10"
          style={{ 
            background: 'radial-gradient(circle, #6366f1 0%, transparent 70%)',
            animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite'
          }}
        />

        <div className="bg-white p-6 rounded-2xl shadow-2xl relative z-10 mb-8 transition-transform duration-300 hover:scale-105">
          <QRCodeSVG 
            value={token} 
            size={250} 
            bgColor={"#ffffff"}
            fgColor={"#0f172a"}
            level={"Q"}
            includeMargin={false}
          />
        </div>

        <div className="flex items-center gap-3 text-sm font-medium" style={{ color: '#e2e8f0' }}>
          <RefreshCw size={18} className={timeLeft <= 2 ? 'animate-spin' : ''} style={{ color: timeLeft <= 2 ? '#f87171' : '#a5b4fc' }} />
          <span>Code refreshes in <strong style={{ color: timeLeft <= 2 ? '#f87171' : '#34d399', fontSize: '1.1rem' }}>{timeLeft}s</strong></span>
        </div>

        <div className="mt-6 flex items-center gap-2 px-4 py-2 rounded-full" style={{ background: 'rgba(52,211,153,0.1)', color: '#34d399', fontSize: '0.8rem' }}>
          <ShieldCheck size={16} /> Anti-Proxy Protection Active
        </div>
      </div>
    </div>
  );
}
