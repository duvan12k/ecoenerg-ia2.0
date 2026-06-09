import { useState, useEffect, useMemo, useRef } from "react";
import { 
  Bolt, 
  Sun, 
  Activity, 
  Sparkles, 
  ShieldAlert, 
  TrendingDown, 
  TrendingUp, 
  DollarSign, 
  Lightbulb, 
  Percent, 
  Cpu, 
  Layers, 
  RefreshCcw, 
  Send, 
  Info, 
  CheckCircle, 
  Play, 
  MessageSquare,
  AlertTriangle,
  Download,
  Laptop,
  Copy,
  ExternalLink
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { DashboardState, ChatMessage, Zone } from "./types";

export default function App() {
  // Navigation states
  const [isOnboarded, setIsOnboarded] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<"dashboard" | "map" | "advisor" | "install">("dashboard");
  const [is3D, setIs3D] = useState<boolean>(false);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  // PWA & Installation states with dynamic APP_URL integration
  const [appUrl, setAppUrl] = useState<string>("");
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstallable, setIsInstallable] = useState<boolean>(false);
  const [isCopied, setIsCopied] = useState<boolean>(false);

  useEffect(() => {
    // 1. Fetch backend APP_URL config
    fetch("/api/config")
      .then((res) => res.json())
      .then((data) => {
        if (data.appUrl) {
          setAppUrl(data.appUrl);
        }
      })
      .catch((err) => console.error("Error fetching app URL config:", err));

    // 2. Register Service Worker in production
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js")
        .then((reg) => console.log("Service Worker registrado con éxito en:", reg.scope))
        .catch((err) => console.error("Fallo de registro de Service Worker:", err));
    }

    // 3. Listen for browser PWA prompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsInstallable(true);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    };
  }, []);

  // Helpers for iframe verification, install triggering, and clipboard copy
  const isInsideIframe = useMemo(() => {
    try {
      return window.self !== window.top;
    } catch (e) {
      return true;
    }
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    console.log(`PWA Prompt choice outcome: ${outcome}`);
    setDeferredPrompt(null);
    setIsInstallable(false);
  };

  const copyToClipboard = () => {
    const activeAppUrl = appUrl && appUrl !== "MY_APP_URL" ? appUrl : window.location.origin;
    navigator.clipboard.writeText(activeAppUrl);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  // Notifications toggle
  const [showNotification, setShowNotification] = useState<boolean>(true);
  const [notificationMsg, setNotificationMsg] = useState<string>(
    "Consejo IA: Salas de Informática registran consumo crítico. Activa el modo inteligente para ahorrar un 45% hoy."
  );

  // Detailed Zone mapping
  const [zones, setZones] = useState<Record<string, Zone>>({
    "Salas de Informática": {
      name: "Salas de Informática",
      category: "Critical",
      normalPower: 62.0,
      optimizedPower: 34.1,
      isOptimized: false,
      activeDevices: 34,
    },
    "Administración": {
      name: "Administración",
      category: "Moderate",
      normalPower: 35.0,
      optimizedPower: 19.2,
      isOptimized: false,
      activeDevices: 12,
    },
    "Salones": {
      name: "Salones",
      category: "Efficient",
      normalPower: 18.0,
      optimizedPower: 9.9,
      isOptimized: false,
      activeDevices: 48,
    },
    "Cafetería": {
      name: "Cafetería",
      category: "Moderate",
      normalPower: 42.0,
      optimizedPower: 23.1,
      isOptimized: false,
      activeDevices: 18,
    },
    "Solar Array 01": {
      name: "Solar Array 01",
      category: "Generating",
      normalPower: -22.0, // negative represents generation
      optimizedPower: -22.0,
      isOptimized: true, // Always active
      activeDevices: 3,
    },
  });

  // Selected zone for detailed display in map panel
  const [selectedZoneName, setSelectedZoneName] = useState<string>("Salas de Informática");

  // Telemetry state calculations
  const baselinePower = 20.4; // fixed baseline for lights & support systems
  const currentConsumption = useMemo(() => {
    let sum = baselinePower;
    (Object.values(zones) as Zone[]).forEach((zone) => {
      if (zone.category === "Generating") {
        // Generates energy, offsets the total load
        sum += zone.isOptimized ? zone.optimizedPower : zone.normalPower;
      } else {
        sum += zone.isOptimized ? zone.optimizedPower : zone.normalPower;
      }
    });
    // Ensure we don't present negative consumption
    return Math.max(5.1, Math.round(sum * 10) / 10);
  }, [zones]);

  const peakToday = useMemo(() => {
    // Peak dynamically models based on how optimized the configuration is
    const activeOptimizationsCount = (Object.values(zones) as Zone[]).filter(z => z.isOptimized && z.category !== "Generating").length;
    return Math.round((88.2 - activeOptimizationsCount * 6.5) * 10) / 10;
  }, [zones]);

  const estDaily = useMemo(() => {
    return Math.round(currentConsumption * 7.5);
  }, [currentConsumption]);

  const currentSavings = useMemo(() => {
    const optimizedSavingsRate = (Object.values(zones) as Zone[]).filter(z => z.isOptimized && z.category !== "Generating").length;
    return Math.round((1240.50 + optimizedSavingsRate * 184.20) * 100) / 100;
  }, [zones]);

  const efficiency = useMemo(() => {
    const optimizedCount = (Object.values(zones) as Zone[]).filter(z => z.isOptimized && z.category !== "Generating").length;
    return Math.round((91.2 + optimizedCount * 2.2) * 10) / 10;
  }, [zones]);

  const activeSensors = useMemo(() => {
    const activeOptimizations = (Object.values(zones) as Zone[]).filter(z => z.isOptimized);
    return 126 + activeOptimizations.length;
  }, [zones]);

  const gridStatus = useMemo(() => {
    if (currentConsumption > 130) return "PEAK_ALERT";
    if (currentConsumption > 90) return "HIGH_DEMAND";
    return "STABLE";
  }, [currentConsumption]);

  // Handle active fluctuation simulation
  const [fluctuationOffset, setFluctuationOffset] = useState<number>(0);
  useEffect(() => {
    const interval = setInterval(() => {
      // Small simulated fluctuation factor to demonstrate true "real-time" sensor polling
      const factor = (Math.random() - 0.5) * 1.8;
      setFluctuationOffset(Math.round(factor * 10) / 10);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const liveConsumption = useMemo(() => {
    return Math.max(10.5, Math.round((currentConsumption + fluctuationOffset) * 10) / 10);
  }, [currentConsumption, fluctuationOffset]);

  // AI Chat Assistant State
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "init",
      sender: "ai",
      text: "¡Hola! Soy **ECOENERG-IA Assistant**. Analizo la telemetría en tiempo real del *Colegio Villas de San Ignacio*.\n\nActualmente veo que las **Salas de Informática** lideran con **62 kW** de carga. Pruébame haciendo clic en las opciones inferiores o formulándome preguntas sobre sostenibilidad escolar.",
      timestamp: new Date(),
    }
  ]);
  const [userInput, setUserInput] = useState<string>("");
  const [isLoadingAI, setIsLoadingAI] = useState<boolean>(false);
  const chatBottomRef = useRef<HTMLDivElement>(null);

  // Quick Action handler for interactive zones
  const toggleZoneOptimization = (zoneName: string) => {
    const targetZone = zones[zoneName];
    if (!targetZone || targetZone.category === "Generating") return;

    const willBeOptimized = !targetZone.isOptimized;

    setZones(prev => ({
      ...prev,
      [zoneName]: {
        ...prev[zoneName],
        isOptimized: willBeOptimized
      }
    }));

    // Provide contextual feedback notifications
    if (willBeOptimized) {
      setNotificationMsg(`Modo inteligente activado en ${zoneName}. Reducción inmediata registrada.`);
    } else {
      setNotificationMsg(`Modo inteligente desactivado en ${zoneName}. Consumo regular restablecido.`);
    }
    setShowNotification(true);
  };

  const syncTelemetry = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
      setNotificationMsg("Telemetría escolar sincronizada directamente con microcontroladores IoT.");
      setShowNotification(true);
    }, 1200);
  };

  // Chat request to Node/Express proxy
  const handleSendMessage = async (textToSend: string) => {
    if (!textToSend.trim() || isLoadingAI) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      sender: "user",
      text: textToSend,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMsg]);
    setUserInput("");
    setIsLoadingAI(true);

    // Scroll to bottom
    setTimeout(() => {
      chatBottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 50);

    // Build current dashboard state bundle for contextual AI answers
    const dashboardStateBundle = {
      currentConsumption: liveConsumption,
      peakToday,
      estDaily,
      efficiency,
      renewablePercentage: 42,
      currentSavings,
      activeSensors,
      zones
    };

    try {
      const response = await fetch("/api/gemini/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: textToSend,
          dashboardState: dashboardStateBundle,
          chatHistory: messages.map(m => ({ role: m.sender === "ai" ? "model" : "user", part: m.text }))
        })
      });

      if (!response.ok) {
        throw new Error("Respuesta no satisfactoria del servidor.");
      }

      const data = await response.json();

      setMessages(prev => [...prev, {
        id: Date.now().toString() + "_ai",
        sender: "ai",
        text: data.text || "Disculpa, no he podido procesar los espectros de energía actual.",
        timestamp: new Date()
      }]);

    } catch (error: any) {
      setMessages(prev => [...prev, {
        id: Date.now().toString() + "_ai",
        sender: "ai",
        text: "⚠️ **Error de conexión:** No se puede alcanzar el servidor de ECOENERG-IA. Por favor, asegúrate de que el backend se encuentra corriendo en el puerto 3000.",
        timestamp: new Date()
      }]);
    } finally {
      setIsLoadingAI(false);
      setTimeout(() => {
        chatBottomRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 50);
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("es-MX", { hour: '2-digit', minute: '2-digit' });
  };

  // Theme style attributes
  const maxCapacity = 160; // Max KW recommendation ceiling
  const gaugePercent = Math.min(100, Math.round((liveConsumption / maxCapacity) * 100));

  // Simulated daily hours
  const [selectedTrendPeriod, setSelectedTrendPeriod] = useState<"daily" | "weekly">("daily");

  return (
    <div className="bg-brand-bg text-on-surface min-h-screen flex flex-col font-sans select-none overflow-x-hidden antialiased">
      
      {/* 1. ONBOARDING SCREEN (WELCOME) */}
      <AnimatePresence>
        {!isOnboarded && (
          <motion.section 
            key="onboarding"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
            className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-brand-bg px-6 text-center"
          >
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,230,57,0.12)_0%,rgba(14,20,26,0)_70%)] pointer-events-none" />
            <div className="absolute inset-0 opacity-5 pointer-events-none" style={{ backgroundImage: "radial-gradient(#72ff70 0.5px, transparent 0.5px)", backgroundSize: "20px 20px" }} />
            
            <div className="relative z-10 max-w-md w-full space-y-8 flex flex-col items-center">
              <div className="relative inline-block">
                <div className="absolute inset-0 bg-brand-green/20 rounded-full blur-3xl" />
                <motion.img 
                  animate={{ y: [0, -8, 0] }}
                  transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
                  alt="ECOENERG-IA Logo" 
                  className="relative w-40 h-40 object-contain rounded-full border border-brand-green/20 p-2 bg-brand-bg/80" 
                  src="https://lh3.googleusercontent.com/aida/AP1WRLskxeT58PoAvYqxt5wSwjLUF-qCUsQSCEtDDic0IvRaxHdEekmOLjcR443J5CoWTe3dKA4yuF6t6WrqysjfAd3Cgqeff0Lflob4WNbn4GveZQ5CiOU4wsm6nA-DwWBMRBRdYg5isAdOfxz-Zq6XtFnSM-PnfoRyI2cykK-LoBUL4CjoUCCOcEZvrathyz51gF-5DLfoRVv0-g0vVnq6VlPdW_PpCI4Egrd_izQFRFHT5wB8aFfwCuDHP90L"
                  referrerPolicy="no-referrer"
                />
              </div>

              <div className="space-y-3">
                <span className="font-mono text-xs text-brand-green uppercase tracking-[0.25em]">TELEMETRÍA E INTELIGENCIA ECO-ESCOLAR</span>
                <h1 className="font-display text-4xl font-extrabold tracking-tight text-white">
                  ECOENERG-<span className="text-brand-green text-glow-green">IA</span>
                </h1>
                <p className="text-on-surface-variant text-sm leading-relaxed px-4">
                  Monitorea, educa y automatiza el rendimiento eléctrico de las instalaciones del <strong className="text-white">Colegio Villas de San Ignacio</strong> mediante sensores IoT avanzados y analítica potenciada con IA.
                </p>
              </div>

              <motion.button 
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setIsOnboarded(true)}
                className="w-full bg-brand-green text-brand-bg font-display font-semibold hover:neon-glow-green py-4 px-6 rounded-xl transition-all duration-300 flex items-center justify-center gap-2"
              >
                <span>Comenzar Dashboard</span>
                <Play className="w-4 h-4 fill-brand-bg" />
              </motion.button>

              <div className="text-xs text-on-surface-variant/60 font-mono">
                Desarrollado para STEM • Versión Electrón v2.4.0
              </div>
            </div>
          </motion.section>
        )}
      </AnimatePresence>

      {/* Main Top Header */}
      <header className="sticky top-0 z-40 bg-brand-bg/85 backdrop-blur-md border-b border-white/5 py-4 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <img 
              alt="ECOENERG-IA Logo" 
              className="h-9 w-9 object-contain" 
              src="https://lh3.googleusercontent.com/aida/AP1WRLsCegglIxc9seD8DrDUW0OoB98XiWAKSjb2uXtApfwHjnV_ipcSZkYoNSPry8mYjyLp93VX4LxSrSAgAtQ5M6U9jw5fpNiyObZ0LHC_8CWaEXwMcoH7QR5ldflu_JAsRIUOjFa7XjcYVo7vE0iRCjWViQ9loW8N9W6cqN33tTv5GUjK39cKa7xzf2h3Ip3svLc5_v8WQzaE_YBpYR33pMcdNcr1v39VNFLQeBov9KtQxL-haoNJoI581JVl"
              referrerPolicy="no-referrer"
            />
            <div className="flex flex-col">
              <h1 className="font-display text-lg sm:text-xl font-bold tracking-tight text-white flex items-center gap-1.5 leading-none">
                ECOENERG-<span className="text-brand-green">IA</span>
              </h1>
              <span className="text-[9px] text-brand-green/80 font-mono tracking-widest mt-0.5 uppercase hidden sm:inline">Villas de San Ignacio</span>
            </div>
          </div>

          {/* Quick Stats Ticker */}
          <div className="hidden lg:flex items-center gap-6">
            <div className="flex items-center gap-2 border-r border-white/10 pr-6">
              <span className="w-2.5 h-2.5 rounded-full bg-brand-green animate-pulse" />
              <span className="text-xs font-mono text-on-surface-variant">SISTEMA ELECTRÓNICO:</span>
              <span className="text-xs font-mono font-bold text-white uppercase">{gridStatus === "STABLE" ? "EFICIENTE (Estable)" : "ALTA DEMANDA"}</span>
            </div>
            <div className="flex items-center gap-2">
              <Sun className="w-4 h-4 text-[#00daf3]" />
              <span className="text-xs font-mono text-on-surface-variant">GENERACIÓN SOLAR:</span>
              <span className="text-xs font-mono font-bold text-[#00daf3]">22.0 kW (PV-01)</span>
            </div>
          </div>

          {/* Actions & Profile */}
          <div className="flex items-center gap-3">
            <button 
              onClick={syncTelemetry}
              title="Refrescar Sensores"
              className={`p-2.5 rounded-lg bg-white/5 border border-white/5 hover:border-brand-green/35 text-on-surface hover:text-brand-green transition-all ${isRefreshing ? 'animate-spin text-brand-green' : ''}`}
            >
              <RefreshCcw className="w-4 h-4" />
            </button>
            <div className="h-9 w-9 rounded-full border border-brand-green/40 p-0.5 overflow-hidden shadow-inner flex items-center justify-center">
              <img 
                alt="User Avatar" 
                className="w-full h-full object-cover rounded-full" 
                src="https://lh3.googleusercontent.com/aida/ADBb0ujzn8oa0LgOFf6eMDQWsYHHn2GIjBmbZdOI-WW7JUXcvai569G52n-TjfG-Yv4P28jRpGiYXfpL-7dJZ08JqY3TTbF3eXz-ukMfqkA6vFA4v7iTpK_OC78lWgdUWF9-QDdPab4roYoLqqwa9Cmpd4IqW_8l2vSutRoDxBeyRLTQGHu5xk5_0gn7qrHEYpVm9zcthOdN1SqdacGk4kfUYKNOUqmtgjnsVS9d-t0kYIY_oC-1LXImTxtGEOsI"
                referrerPolicy="no-referrer"
              />
            </div>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 pb-28">
        
        {/* Real-time Notification Banner */}
        <AnimatePresence>
          {showNotification && (
            <motion.div 
              initial={{ height: 0, opacity: 0, marginBottom: 0 }}
              animate={{ height: "auto", opacity: 1, marginBottom: 16 }}
              exit={{ height: 0, opacity: 0, marginBottom: 0 }}
              className="overflow-hidden"
            >
              <div className="bg-brand-green/10 border border-brand-green/30 p-3.5 rounded-xl flex items-start justify-between gap-3 text-sm text-brand-green">
                <div className="flex gap-2.5 items-center">
                  <Sparkles className="w-4.5 h-4.5 text-brand-green shrink-0 animate-bounce" />
                  <p className="font-semibold leading-snug">{notificationMsg}</p>
                </div>
                <button 
                  onClick={() => setShowNotification(false)}
                  className="text-brand-green hover:bg-brand-green/20 px-1.5 py-0.5 rounded text-xs font-mono uppercase tracking-wider"
                >
                  Cerrar
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Dynamic Route views based on activeTab */}
        <div className="min-h-[60vh]">
          
          {/* TAB 1: DASHBOARD VIEW */}
          {activeTab === "dashboard" && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                
                {/* Real-time Radial Gauge Card (Col-span-8) */}
                <div className="lg:col-span-8 glass-card rounded-2xl p-6 flex flex-col justify-between relative overflow-hidden group">
                  <div className="scan-line" />
                  <div className="absolute -right-24 -top-24 w-72 h-72 bg-brand-green/10 blur-[130px] rounded-full" />
                  
                  <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-6">
                    <div>
                      <span className="font-mono text-xs text-brand-green uppercase tracking-[0.15em] font-medium">POTENCIA ACTIVA DEL CAMPUS</span>
                      <h2 className="font-display text-2xl font-bold text-white mt-1">Consumo Eléctrico de Hoy</h2>
                    </div>
                    <div className="flex items-center gap-2 bg-brand-green/10 px-3 py-1.5 rounded-full border border-brand-green/20">
                      <span className="w-2 h-2 bg-brand-green rounded-full animate-ping" />
                      <span className="font-mono text-[10px] text-brand-green font-bold uppercase tracking-wider">Lectura IoT Activa</span>
                    </div>
                  </div>

                  <div className="flex flex-col md:flex-row items-center gap-8 py-4">
                    
                    {/* SVG Radial Meter */}
                    <div className="relative w-48 h-48 sm:w-56 sm:h-56 flex items-center justify-center shrink-0">
                      <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 100 100">
                        {/* Background grey track */}
                        <circle 
                          className="text-white/5" 
                          cx="50" 
                          cy="50" 
                          fill="none" 
                          r="42" 
                          stroke="currentColor" 
                          strokeWidth="8"
                        />
                        {/* Interactive dynamic track with green emission */}
                        <motion.circle 
                          className="text-brand-green" 
                          cx="50" 
                          cy="50" 
                          fill="none" 
                          r="42" 
                          stroke="currentColor" 
                          strokeWidth="8"
                          strokeDasharray="264"
                          initial={{ strokeDashoffset: 264 }}
                          animate={{ strokeDashoffset: 264 - (264 * gaugePercent) / 100 }}
                          transition={{ type: "spring", stiffness: 40 }}
                          style={{ filter: "drop-shadow(0 0 7px #00e639)" }}
                        />
                      </svg>
                      
                      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                        <motion.span 
                          key={liveConsumption}
                          className="font-display text-[2.5rem] sm:text-[3rem] font-extrabold text-white leading-none text-glow-green"
                        >
                          {liveConsumption}
                        </motion.span>
                        <span className="font-mono text-xs text-on-surface-variant font-bold mt-1 tracking-wider">kW Actual</span>
                        <span className="text-[10px] text-brand-green font-mono mt-1 leading-none">{gaugePercent}% del Máx</span>
                      </div>
                    </div>

                    {/* Gauge Metrics grid */}
                    <div className="flex-1 grid grid-cols-2 gap-4 w-full">
                      <div className="bg-white/[0.02] border border-white/5 p-3.5 rounded-xl">
                        <span className="font-mono text-[10px] text-on-surface-variant uppercase tracking-wider block">PICO DEL DÍA</span>
                        <p className="font-display text-xl sm:text-2xl font-bold text-white mt-1">{peakToday} kW</p>
                        <span className="text-[9px] text-[#00daf3] font-mono block mt-1 leading-none">Capacidad segura: 150 kW</span>
                      </div>
                      
                      <div className="bg-white/[0.02] border border-white/5 p-3.5 rounded-xl">
                        <span className="font-mono text-[10px] text-on-surface-variant uppercase tracking-wider block">EST. DIARIO ACUMULADO</span>
                        <p className="font-display text-xl sm:text-2xl font-bold text-[#00daf3] mt-1">{estDaily} kWh</p>
                        <span className="text-[9px] text-on-surface-variant font-mono block mt-1 leading-none">Proyección semanal: {estDaily * 5} kWh</span>
                      </div>

                      <div className="bg-white/[0.02] border border-white/5 p-3.5 rounded-xl">
                        <span className="font-mono text-[10px] text-on-surface-variant uppercase tracking-wider block">ESTADO RED VILLAS</span>
                        <p className={`font-display text-sm sm:text-base font-extrabold mt-1.5 ${
                          gridStatus === "STABLE" ? "text-brand-green" : "text-[#ffa500]"
                        }`}>
                          ● {gridStatus === "STABLE" ? "NORMAL ESTABLE" : "CARGA ALTA"}
                        </p>
                        <span className="text-[9px] text-on-surface-variant font-mono block mt-1 leading-none">Frecuencia: 60.1 Hz</span>
                      </div>

                      <div className="bg-white/[0.02] border border-white/5 p-3.5 rounded-xl">
                        <span className="font-mono text-[10px] text-on-surface-variant uppercase tracking-wider block">RENOVABLES</span>
                        <p className="font-display text-xl sm:text-2xl font-bold text-white mt-1">42%</p>
                        <span className="text-[9px] text-brand-green font-mono block mt-1 leading-none">22kW Fotovoltaicos</span>
                      </div>
                    </div>

                  </div>
                </div>

                {/* Quick Stats sidebar widgets (Col-span-4) */}
                <div className="lg:col-span-4 flex flex-col justify-between gap-4">
                  
                  {/* Current Savings Card */}
                  <div className="glass-card hover:border-brand-green/35 transition-all duration-300 p-5 rounded-2xl flex items-center gap-5 cursor-default relative overflow-hidden group">
                    <div className="w-12 h-12 rounded-xl bg-brand-green/10 flex items-center justify-center text-brand-green shrink-0">
                      <DollarSign className="w-6 h-6 text-glow-green" />
                    </div>
                    <div>
                      <span className="font-mono text-[10px] text-on-surface-variant uppercase tracking-wider block">AHORRO ACUMULADO MES</span>
                      <p className="font-display text-2xl font-extrabold text-brand-green text-glow-green leading-none mt-1.5">
                        ${currentSavings.toLocaleString()} USD
                      </p>
                      <span className="text-[10px] text-brand-green font-mono block mt-1">Carbono evitado: {(currentSavings * 0.42).toFixed(1)} kg CO₂</span>
                    </div>
                  </div>

                  {/* Efficiency Card */}
                  <div className="glass-card hover:border-[#00daf3]/35 transition-all duration-300 p-5 rounded-2xl flex items-center gap-5 cursor-default relative overflow-hidden group">
                    <div className="w-12 h-12 rounded-xl bg-[#00daf3]/10 flex items-center justify-center text-[#00daf3] shrink-0">
                      <Percent className="w-6 h-6 text-glow-cyan" />
                    </div>
                    <div>
                      <span className="font-mono text-[10px] text-on-surface-variant uppercase tracking-wider block">EFICIENCIA DE RED EFIS</span>
                      <p className="font-display text-2xl font-extrabold text-[#00daf3] tracking-wide leading-none mt-1.5">
                        {efficiency}%
                      </p>
                      <span className="text-[10px] text-[#00daf3] font-mono block mt-1">Pérdida óhmica: {(100 - efficiency).toFixed(1)}%</span>
                    </div>
                  </div>

                  {/* Active Sensors Card */}
                  <div className="glass-card p-5 rounded-2xl flex items-center gap-5 hover:border-white/20 transition-all duration-300 cursor-default">
                    <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center text-white shrink-0">
                      <Cpu className="w-6 h-6" />
                    </div>
                    <div>
                      <span className="font-mono text-[10px] text-on-surface-variant uppercase tracking-wider block">SENSORES IOT REPORTANDO</span>
                      <p className="font-display text-2xl font-extrabold text-white leading-none mt-1.5">
                        {activeSensors} <span className="text-sm font-normal text-on-surface-variant">/ 130</span>
                      </p>
                      <span className="text-[10px] text-brand-green font-mono block mt-1">Frecuencia MQTT: 5s poll</span>
                    </div>
                  </div>

                </div>

              </div>

              {/* Dynamic Line Graph Section */}
              <div className="glass-card rounded-2xl p-6 relative">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                  <div>
                    <h3 className="font-display text-lg sm:text-xl font-bold text-white">Consumo Histórico Diario</h3>
                    <p className="text-xs text-on-surface-variant">Análisis comparativo de carga real por hora en el campus</p>
                  </div>
                  {/* Period switcher */}
                  <div className="flex bg-white/5 rounded-lg border border-white/5 p-1 self-start sm:self-auto">
                    <button 
                      onClick={() => setSelectedTrendPeriod("daily")}
                      className={`px-4 py-1.5 text-xs font-mono rounded-md hover:text-white transition-all ${selectedTrendPeriod === 'daily' ? 'bg-brand-green text-brand-bg font-bold shadow-md' : 'text-on-surface-variant'}`}
                    >
                      DIARIO
                    </button>
                    <button 
                      onClick={() => setSelectedTrendPeriod("weekly")}
                      className={`px-4 py-1.5 text-xs font-mono rounded-md hover:text-white transition-all ${selectedTrendPeriod === 'weekly' ? 'bg-brand-green text-brand-bg font-bold shadow-md' : 'text-on-surface-variant'}`}
                    >
                      SEMANAL
                    </button>
                  </div>
                </div>

                {/* Highly optimized interactive SVG Line Graph */}
                <div className="relative w-full h-72 rounded-xl bg-brand-bg/40 p-4 border border-white/5 flex flex-col justify-between">
                  <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: "linear-gradient(#dde3ec 1px, transparent 1px), linear-gradient(90deg, #dde3ec 1px, transparent 1px)", backgroundSize: "40px 40px" }} />
                  
                  {/* Interactive Graphic nodes */}
                  <svg className="w-full h-48 z-10" viewBox="0 0 1000 240" preserveAspectRatio="none">
                    <defs>
                      <linearGradient id="chartGlow" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#00e639" stopOpacity="0.25" />
                        <stop offset="100%" stopColor="#00e639" stopOpacity="0" />
                      </linearGradient>
                    </defs>

                    {/* Grid Lines */}
                    <line x1="0" y1="60" x2="1000" y2="60" stroke="rgba(255,255,255,0.05)" strokeWidth="1" strokeDasharray="4" />
                    <line x1="0" y1="120" x2="1000" y2="120" stroke="rgba(255,255,255,0.05)" strokeWidth="1" strokeDasharray="4" />
                    <line x1="0" y1="180" x2="1000" y2="180" stroke="rgba(255,255,255,0.05)" strokeWidth="1" strokeDasharray="4" />

                    {/* Main Area & Line Path */}
                    {selectedTrendPeriod === "daily" ? (
                      <>
                        {/* Daily Area path */}
                        <path 
                          d="M  0 200 C 100 160, 200 180, 300 90 C 400 60, 500 120, 600 100 C 700 80, 800 110, 900 160 L 1000 150 L 1000 240 L 0 240 Z" 
                          fill="url(#chartGlow)"
                        />
                        {/* Daily line stroke */}
                        <path 
                          d="M  0 200 C 100 160, 200 180, 300 90 C 400 60, 500 120, 600 100 C 700 80, 800 110, 900 160 L 1000 150" 
                          fill="none" 
                          stroke="#00e639" 
                          strokeWidth="3.5"
                          strokeLinecap="round"
                        />
                        {/* Pulsating peak circles inside chart */}
                        <circle cx="300" cy="90" r="6" fill="#00e639" className="animate-ping" style={{ transformOrigin: "300px 90px" }} />
                        <circle cx="300" cy="90" r="4.5" fill="#0e141a" stroke="#00e639" strokeWidth="3" />
                      </>
                    ) : (
                      <>
                        {/* Weekly Area path */}
                        <path 
                          d="M 0 160 Q 150 110, 300 140 T 600 80 T 900 110 L 1000 130 L 1000 240 L 0 240 Z" 
                          fill="url(#chartGlow)"
                        />
                        {/* Weekly line stroke */}
                        <path 
                          d="M 0 160 Q 150 110, 300 140 T 600 80 T 900 110 L 1000 130" 
                          fill="none" 
                          stroke="#00daf3" 
                          strokeWidth="3.5"
                          strokeLinecap="round"
                        />
                        <circle cx="600" cy="80" r="5" fill="#00daf3" className="animate-ping" style={{ transformOrigin: "600px 80px" }} />
                        <circle cx="600" cy="80" r="4" fill="#0e141a" stroke="#00daf3" strokeWidth="3" />
                      </>
                    )}
                  </svg>

                  {/* Horizontal Time Scales */}
                  <div className="flex justify-between items-center text-[10px] font-mono text-on-surface-variant font-medium px-1 mt-2 border-t border-white/5 pt-2">
                    {selectedTrendPeriod === 'daily' ? (
                      <>
                        <span>00:00 - Silencio</span>
                        <span>06:00 - Clases</span>
                        <span>12:00 - Pico Demanda</span>
                        <span>18:00 - Biblioteca</span>
                        <span>23:59 - Mantenimiento</span>
                      </>
                    ) : (
                      <>
                        <span>Lunes</span>
                        <span>Martes</span>
                        <span>Miércoles</span>
                        <span>Jueves</span>
                        <span>Viernes</span>
                        <span>Sábado (Feria STEM)</span>
                        <span>Domingo</span>
                      </>
                    )}
                  </div>
                </div>

                {/* Additional diagnostic box */}
                <div className="mt-4 bg-white/[0.01] border border-white/5 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex gap-2.5 items-center">
                    <Info className="w-5 h-5 text-[#00daf3] shrink-0" />
                    <div>
                      <h4 className="text-xs font-bold text-white uppercase font-mono">Eficiencia del Almacenamiento PV</h4>
                      <p className="text-xs text-on-surface-variant">Tus arrays solares están operando con óptima retención de inversores del 98.4%. No se reporta recalentamiento hoy.</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => setActiveTab("advisor")}
                    className="whitespace-nowrap px-4 py-2 bg-white/5 border border-white/10 hover:border-[#00daf3]/50 text-xs text-glow-cyan font-semibold hover:text-[#00daf3] rounded-lg transition-all"
                  >
                    Consultar IA
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {/* TAB 2: INTERACTIVE MAP VIEW */}
          {activeTab === "map" && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-3">
                <div>
                  <span className="font-mono text-xs text-brand-green uppercase tracking-[0.15em] font-medium">CENTRAL DE CONTROL FÍSICO</span>
                  <h2 className="font-display text-2xl font-bold text-white mt-1">Mapa de Consumo por Zonas</h2>
                </div>
                
                {/* 3D Isometric View toggler */}
                <button 
                  onClick={() => setIs3D(prev => !prev)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg border text-xs font-mono transition-all ${
                    is3D 
                    ? 'bg-brand-green border-brand-green text-brand-bg font-bold neon-glow-green' 
                    : 'bg-white/5 border-white/10 text-on-surface hover:text-white hover:border-white/20'
                  }`}
                >
                  <Layers className="w-4 h-4" />
                  <span>PERSPECTIVA: {is3D ? "ISOMÉTRICO 3D" : "PLANO 2D"}</span>
                </button>
              </div>

              {/* Main Map Box Layout */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
                
                {/* SVG Play School Layout Area (Col-span-8) */}
                <div className="lg:col-span-8 glass-card rounded-2xl p-4 flex items-center justify-center relative overflow-hidden min-h-[400px]">
                  <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: "radial-gradient(#72ff70 0.5px, transparent 0.5px)", backgroundSize: "24px 24px" }} />
                  
                  {/* Floating active savings projection banner */}
                  <div className="absolute top-4 left-4 bg-brand-bg/80 border border-brand-green/30 px-3 py-2 rounded-xl backdrop-blur-md z-20 flex flex-col">
                    <span className="text-[10px] text-on-surface-variant font-mono uppercase">CONDUCCIÓN GLOBAL DEL CAMPUS</span>
                    <span className="text-sm font-extrabold text-brand-green text-glow-green mt-0.5">{liveConsumption} kW Actuales</span>
                  </div>

                  {/* Dynamic interactive SVG floor-plan container */}
                  <motion.div 
                    animate={{ 
                      rotateX: is3D ? 52 : 0, 
                      rotateZ: is3D ? -24 : 0, 
                      scale: is3D ? 1.05 : 1,
                      y: is3D ? -10 : 0
                    }}
                    transition={{ type: "spring", stiffness: 60, damping: 15 }}
                    className="relative w-full aspect-[16/10] max-w-2xl transition-all duration-300 transform"
                    style={{ transformStyle: "preserve-3d" }}
                  >
                    <svg className="w-full h-full" viewBox="0 0 1000 600">
                      {/* Campus Base Outline Grid */}
                      <rect x="30" y="30" width="940" height="540" rx="16" fill="rgba(255,255,255,0.01)" stroke="rgba(255,255,255,0.05)" strokeWidth="2" strokeDasharray="6" />

                      {/* Zone 1: Salas de Informática (Red hotspot if not optimized) */}
                      <g 
                        className="cursor-pointer group transition-all"
                        onClick={() => {
                          setSelectedZoneName("Salas de Informática");
                          toggleZoneOptimization("Salas de Informática");
                        }}
                      >
                        <rect 
                          x="100" y="80" width="300" height="180" rx="8"
                          className={`transition-colors duration-500 fill-current ${
                            zones["Salas de Informática"].isOptimized 
                            ? 'fill-brand-green/10 stroke-brand-green/50 text-brand-green hover:fill-brand-green/20' 
                            : 'fill-[#ff3232]/10 stroke-[#ff3232]/50 text-[#ff3232] hover:fill-[#ff3232]/20'
                          }`}
                          strokeWidth="2.5"
                        />
                        <text x="250" y="170" textAnchor="middle" className="font-mono text-xs fill-white font-bold pointer-events-none opacity-80 uppercase tracking-widest">
                          SALAS INFORMÁTICA
                        </text>
                        <circle 
                          cx="380" cy="100" r="5" 
                          className={`pointer-events-none ${zones["Salas de Informática"].isOptimized ? 'fill-brand-green animate-pulse' : 'fill-[#ff3232] animate-ping'}`} 
                        />
                        {/* Power draw tag */}
                        <text x="250" y="200" textAnchor="middle" className={`font-mono text-[11px] font-bold pointer-events-none ${
                          zones["Salas de Informática"].isOptimized ? 'fill-brand-green' : 'fill-[#ff3232]'
                        }`}>
                          {zones["Salas de Informática"].isOptimized ? "34.1 kW" : "62.0 kW"}
                        </text>
                      </g>

                      {/* Zone 2: Administración (Orange normal, optimized drops to yellow/green) */}
                      <g 
                        className="cursor-pointer group transition-all animate-none"
                        onClick={() => {
                          setSelectedZoneName("Administración");
                          toggleZoneOptimization("Administración");
                        }}
                      >
                        <rect 
                          x="430" y="80" width="220" height="140" rx="8"
                          className={`transition-colors duration-500 fill-current ${
                            zones["Administración"].isOptimized 
                            ? 'fill-brand-green/10 stroke-brand-green/50 text-brand-green hover:fill-brand-green/20' 
                            : 'fill-[#ffa500]/10 stroke-[#ffa500]/50 text-[#ffa500] hover:fill-[#ffa500]/20'
                          }`}
                          strokeWidth="2.5"
                        />
                        <text x="540" y="150" textAnchor="middle" className="font-mono text-[11px] fill-white font-bold pointer-events-none opacity-80 uppercase tracking-widest">
                          ADMINISTRACIÓN
                        </text>
                        <circle 
                          cx="630" cy="100" r="5" 
                          className={`pointer-events-none ${zones["Administración"].isOptimized ? 'fill-brand-green animate-pulse' : 'fill-[#ffa500] animate-ping'}`} 
                        />
                        <text x="540" y="180" textAnchor="middle" className={`font-mono text-[11px] font-bold pointer-events-none ${
                          zones["Administración"].isOptimized ? 'fill-brand-green' : 'fill-[#ffa500]'
                        }`}>
                          {zones["Administración"].isOptimized ? "19.2 kW" : "35.0 kW"}
                        </text>
                      </g>

                      {/* Zone 3: Salones (Green/Efficient area) */}
                      <g 
                        className="cursor-pointer group transition-all"
                        onClick={() => {
                          setSelectedZoneName("Salones");
                          toggleZoneOptimization("Salones");
                        }}
                      >
                        <rect 
                          x="100" y="300" width="480" height="220" rx="8"
                          className={`transition-colors duration-500 fill-current ${
                            zones["Salones"].isOptimized 
                            ? 'fill-brand-green/15 stroke-brand-green/60 text-brand-green hover:fill-brand-green/25' 
                            : 'fill-brand-green/5 stroke-brand-green/30 text-brand-green/70 hover:fill-brand-green/15'
                          }`}
                          strokeWidth="2.5"
                        />
                        <text x="340" y="400" textAnchor="middle" className="font-mono text-xs fill-white font-bold pointer-events-none opacity-90 uppercase tracking-widest">
                          AULAS Y SALONES GENERALES
                        </text>
                        <circle 
                          cx="550" cy="328" r="5" 
                          className="pointer-events-none fill-brand-green animate-pulse" 
                        />
                        <text x="340" y="430" textAnchor="middle" className="font-mono text-[11px] font-bold pointer-events-none fill-brand-green">
                          {zones["Salones"].isOptimized ? "9.9 kW" : "18.0 kW"}
                        </text>
                      </g>

                      {/* Zone 4: Cafetería (Medium load) */}
                      <g 
                        className="cursor-pointer group transition-all"
                        onClick={() => {
                          setSelectedZoneName("Cafetería");
                          toggleZoneOptimization("Cafetería");
                        }}
                      >
                        <rect 
                          x="610" y="300" width="290" height="220" rx="8"
                          className={`transition-colors duration-500 fill-current ${
                            zones["Cafetería"].isOptimized 
                            ? 'fill-brand-green/15 stroke-brand-green/50 text-brand-green hover:fill-brand-green/20' 
                            : 'fill-[#ffa500]/10 stroke-[#ffa500]/50 text-[#ffa500] hover:fill-[#ffa500]/20'
                          }`}
                          strokeWidth="2.5"
                        />
                        <text x="755" y="400" textAnchor="middle" className="font-mono text-xs fill-white font-bold pointer-events-none opacity-80 uppercase tracking-widest">
                          CAFETERÍA / CASINO
                        </text>
                        <circle 
                          cx="870" cy="328" r="5" 
                          className={`pointer-events-none ${zones["Cafetería"].isOptimized ? 'fill-brand-green animate-pulse' : 'fill-[#ffa500] animate-ping'}`} 
                        />
                        <text x="755" y="430" textAnchor="middle" className={`font-mono text-[11px] font-bold pointer-events-none ${
                          zones["Cafetería"].isOptimized ? 'fill-brand-green' : 'fill-[#ffa500]'
                        }`}>
                          {zones["Cafetería"].isOptimized ? "23.1 kW" : "42.0 kW"}
                        </text>
                      </g>

                      {/* Photovoltaic Solar array - Generating renewable power offset */}
                      <g 
                        className="cursor-pointer group transition-all"
                        onClick={() => {
                          setSelectedZoneName("Solar Array 01");
                          setNotificationMsg("Sensor PV: Los paneles solares están produciendo activamente 22 kW.");
                          setShowNotification(true);
                        }}
                      >
                        <rect 
                          x="680" y="80" width="220" height="150" rx="8"
                          fill="rgba(0, 218, 243, 0.12)"
                          stroke="#00daf3"
                          strokeWidth="2.5"
                          strokeDasharray="4 3"
                          className="hover:fill-cyan-400/20"
                        />
                        <text x="790" y="150" textAnchor="middle" className="font-mono text-[10px] fill-[#00daf3] font-bold pointer-events-none uppercase tracking-wider">
                          GENERACIÓN FOTOVOLTAICA
                        </text>
                        <text x="790" y="180" textAnchor="middle" className="font-mono text-[11px] font-extrabold pointer-events-none fill-[#00daf3]">
                          -22.0 kW (SOLAR-01)
                        </text>
                        <circle cx="870" cy="100" r="5.5" fill="#00daf3" className="animate-pulse" />
                      </g>
                    </svg>
                  </motion.div>
                  
                  {/* Floating instructions tag */}
                  <div className="absolute bottom-4 left-4 bg-brand-bg/85 border border-white/5 rounded-lg px-3 py-1.5 backdrop-blur-md z-10 text-[10px] sm:text-xs">
                    💡 <span className="text-on-surface-variant">Pulsa sobre cualquier zona escolar en el mapa para encender o apagar el control inteligente.</span>
                  </div>
                </div>

                {/* Info Panel & Interactive Control Deck Sidebar (Col-span-4) */}
                <div className="lg:col-span-4 flex flex-col justify-between gap-4">
                  
                  {/* Real-time details card forselected zone */}
                  <div className="glass-card rounded-2xl p-5 space-y-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="font-mono text-[9px] text-[#00daf3] uppercase tracking-wider font-bold">INFO DE SECCIÓN SELECCIONADA</span>
                        <h4 className="font-display text-lg font-bold text-white mt-1 uppercase">
                          {selectedZoneName}
                        </h4>
                      </div>
                      <span className={`px-2 py-0.5 rounded text-[9px] font-mono font-bold leading-none uppercase ${
                        zones[selectedZoneName]?.category === "Efficient" || zones[selectedZoneName]?.category === "Generating"
                        ? "bg-brand-green/10 text-brand-green border border-brand-green/20"
                        : zones[selectedZoneName]?.category === "Moderate"
                        ? "bg-[#ffa500]/10 text-[#ffa500] border border-[#ffa500]/20"
                        : "bg-[#ff3232]/10 text-[#ff3232] border border-[#ff3232]/20"
                      }`}>
                        {zones[selectedZoneName]?.category}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-3 pt-2">
                      <div className="bg-white/[0.02] border border-white/5 p-3 rounded-xl">
                        <span className="font-mono text-[9px] text-on-surface-variant block uppercase">POTENCIA NORMAL</span>
                        <span className="font-display font-medium text-[#ff3232] block text-sm mt-1">
                          {Math.abs(zones[selectedZoneName]?.normalPower)} kW
                        </span>
                      </div>
                      <div className="bg-white/[0.02] border border-white/5 p-3 rounded-xl">
                        <span className="font-mono text-[9px] text-on-surface-variant block uppercase">POTENCIA OPTIMIZADA</span>
                        <span className="font-display font-medium text-brand-green block text-sm mt-1">
                          {Math.abs(zones[selectedZoneName]?.optimizedPower)} kW
                        </span>
                      </div>
                    </div>

                    <div className="bg-white/[0.02] border border-white/5 rounded-xl p-3 flex justify-between items-center text-xs">
                      <span className="text-on-surface-variant">Sensores IoT en Sección:</span>
                      <strong className="text-white font-mono">{zones[selectedZoneName]?.activeDevices} nodos</strong>
                    </div>

                    <div className="border-t border-white/5 pt-4 space-y-3">
                      <div className="flex justify-between items-center">
                        <div>
                          <h5 className="text-xs font-bold text-white uppercase font-mono">Modo Ahorro Inteligente</h5>
                          <p className="text-[10px] text-on-surface-variant leading-tight">Drop automático de calefactor e iluminación</p>
                        </div>
                        {selectedZoneName !== "Solar Array 01" ? (
                          <button 
                            onClick={() => toggleZoneOptimization(selectedZoneName)}
                            className={`w-12 h-6 rounded-full relative transition-colors duration-300 ${
                              zones[selectedZoneName]?.isOptimized ? "bg-brand-green" : "bg-white/10"
                            }`}
                          >
                            <motion.span 
                              layout 
                              className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-brand-bg shadow ${
                                zones[selectedZoneName]?.isOptimized ? "right-1 left-auto" : "left-1"
                              }`}
                            />
                          </button>
                        ) : (
                          <span className="text-[10px] font-mono text-brand-cyan uppercase">Generador Activo</span>
                        )}
                      </div>
                    </div>

                    <div className="p-3 bg-brand-green/5 rounded-xl border border-brand-green/20">
                      <p className="text-[11px] text-brand-green font-medium leading-relaxed">
                        ★ Al activar la optimización en <strong className="text-white">{selectedZoneName}</strong>, el consumo se reduce en más de un <strong className="text-white">45%</strong>, aliviando la sobrecarga general.
                      </p>
                    </div>
                  </div>

                  {/* Heatmap color definitions card */}
                  <div className="glass-card rounded-2xl p-5 space-y-3">
                    <h5 className="font-mono text-[10px] text-on-surface-variant uppercase tracking-wider font-bold">Leyenda del Mapa Ternario</h5>
                    
                    <div className="space-y-2">
                      <div className="flex items-center gap-3">
                        <span className="w-3.5 h-3.5 rounded-full bg-brand-green shadow-[0_0_10px_#00e639]" />
                        <span className="text-xs text-on-surface font-mono">Eficiente (&lt; 20 kW/h)</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="w-3.5 h-3.5 rounded-full bg-[#ffa500] shadow-[0_0_10px_#ffa500]" />
                        <span className="text-xs text-on-surface font-mono">Normal (20 - 50 kW/h)</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="w-3.5 h-3.5 rounded-full bg-[#ff3232] shadow-[0_0_10px_#ff3232]" />
                        <span className="text-xs text-on-surface font-mono">Crítico (&gt; 50 kW/h)</span>
                      </div>
                    </div>
                  </div>

                </div>

              </div>
            </motion.div>
          )}

          {/* TAB 3: AI ADVISOR VIEW */}
          {activeTab === "advisor" && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              <div className="space-y-1">
                <span className="font-mono text-xs text-brand-green uppercase tracking-[0.15em] font-medium">CONSEJERO DE INTELIGENCIA ARTIFICIAL</span>
                <h2 className="font-display text-2xl font-bold text-white flex items-center gap-2">
                  <Sparkles className="w-6 h-6 text-brand-green text-glow-green" />
                  <span>ECOENERG-IA Copilot</span>
                </h2>
              </div>

              {/* Chat and Preset Chips layout */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
                
                {/* Main Chat Terminal (Col-span-8) */}
                <div className="lg:col-span-8 glass-card rounded-2xl flex flex-col h-[500px]">
                  
                  {/* Chat top info */}
                  <div className="border-b border-white/5 p-4 flex justify-between items-center bg-white/[0.01]">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-brand-green animate-pulse" />
                      <span className="font-mono text-xs text-white uppercase font-bold">ECOENERG-IA Consultor Activo</span>
                    </div>
                    <button 
                      onClick={() => setMessages([
                        {
                          id: "init",
                          sender: "ai",
                          text: "¡Sesión de consultoría reiniciada! Pregúntame sobre la optimización del Colegio Villas de San Ignacio.",
                          timestamp: new Date(),
                        }
                      ])}
                      className="text-xs font-mono text-on-surface-variant hover:text-white transition-all"
                    >
                      Limpiar Historial
                    </button>
                  </div>

                  {/* Conversation feed */}
                  <div className="flex-1 overflow-y-auto p-4 space-y-4 font-normal text-on-surface text-sm">
                    {messages.map((msg) => (
                      <div 
                        key={msg.id}
                        className={`flex gap-3 max-w-[85%] ${msg.sender === 'user' ? 'ml-auto flex-row-reverse' : 'mr-auto'}`}
                      >
                        {/* Sender Icon */}
                        <div className={`w-8 h-8 rounded-full shrink-0 flex items-center justify-center border font-mono text-xs ${
                          msg.sender === 'user' 
                          ? 'bg-brand-green/15 border-brand-green text-brand-green' 
                          : 'bg-[#00daf3]/15 border-[#00daf3] text-[#00daf3]'
                        }`}>
                          {msg.sender === 'user' ? 'Tú' : 'IA'}
                        </div>
                        
                        {/* Msg bubble */}
                        <div className={`p-4 rounded-2xl border text-sm leading-relaxed ${
                          msg.sender === 'user'
                          ? 'bg-brand-green/5 border-brand-green/20 rounded-tr-none text-white'
                          : 'bg-[#161c22] border-white/5 rounded-tl-none text-on-surface'
                        }`}>
                          
                          {/* Structured rendering formatting simulation */}
                          <div className="markdown-body whitespace-pre-wrap">
                            {msg.text.split('\n').map((line, idx) => {
                              // Render code blocks / bullet items beautifully / titles
                              if (line.startsWith('* **')) {
                                return (
                                  <p key={idx} className="my-1 text-xs">
                                    • <strong className="text-white">{line.replace('* **', '').replace('**', '')}</strong>
                                  </p>
                                );
                              }
                              if (line.startsWith('**')) {
                                return (
                                  <h4 key={idx} className="font-bold text-white mt-2 mb-1">
                                    {line.replace(/\*\*/g, '')}
                                  </h4>
                                );
                              }
                              if (line.startsWith('* ')) {
                                return <p key={idx} className="my-1 pl-4">• {line.slice(2)}</p>;
                              }
                              return <p key={idx} className="mb-2 leading-relaxed">{line}</p>;
                            })}
                          </div>

                          <span className="block text-[9px] text-on-surface-variant/70 text-right mt-2 font-mono leading-none">
                            {formatTime(msg.timestamp)}
                          </span>
                        </div>
                      </div>
                    ))}

                    {/* AI Loading bubble */}
                    {isLoadingAI && (
                      <div className="flex gap-3 mr-auto max-w-[80%] items-center animate-pulse">
                        <div className="w-8 h-8 rounded-full flex items-center justify-center bg-[#00daf3]/10 border border-[#00daf3]/30 text-[#00daf3] font-mono text-xs">
                          IA
                        </div>
                        <div className="bg-[#161c22] border border-white/5 p-4 rounded-2xl rounded-tl-none">
                          <div className="flex gap-1.5 justify-center items-center py-1 px-4">
                            <span className="w-2.5 h-2.5 rounded-full bg-[#00daf3] animate-bounce" style={{ animationDelay: '0s' }} />
                            <span className="w-2.5 h-2.5 rounded-full bg-[#00daf3] animate-bounce" style={{ animationDelay: '0.15s' }} />
                            <span className="w-2.5 h-2.5 rounded-full bg-[#00daf3] animate-bounce" style={{ animationDelay: '0.3s' }} />
                          </div>
                        </div>
                      </div>
                    )}
                    <div ref={chatBottomRef} />
                  </div>

                  {/* Live prompt submission input bar */}
                  <form 
                    onSubmit={(e) => {
                      e.preventDefault();
                      handleSendMessage(userInput);
                    }}
                    className="p-3.5 border-t border-white/5 flex gap-3 bg-brand-bg/95"
                  >
                    <input 
                      type="text"
                      value={userInput}
                      onChange={(e) => setUserInput(e.target.value)}
                      placeholder="Pregunta a ECOENERG-IA: '¿Cómo disminuir energía hoy?' o 'Analizar salas'..."
                      className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-on-surface-variant/60 focus:outline-none focus:border-brand-green/60 focus:bg-white/[0.08]"
                    />
                    <button 
                      type="submit"
                      disabled={!userInput.trim() || isLoadingAI}
                      className="px-5 rounded-xl bg-brand-green text-brand-bg font-bold flex items-center justify-center gap-2 disabled:opacity-50 transition-all hover:neon-glow-green"
                    >
                      <Send className="w-4 h-4" />
                      <span className="hidden sm:inline">Enviar</span>
                    </button>
                  </form>

                </div>

                {/* STEM Guidelines & Preset Quick queries (Col-span-4) */}
                <div className="lg:col-span-4 flex flex-col justify-between gap-4">
                  
                  {/* Preset Query Tags Card */}
                  <div className="glass-card rounded-2xl p-5 space-y-4">
                    <h4 className="font-mono text-[10px] text-on-surface-variant uppercase tracking-wider font-bold">Consultas Rápidas Recomendadas</h4>
                    <p className="text-xs text-on-surface-variant leading-relaxed">Selecciona una consulta automatizada para que Gemini analice los indicadores activos en este instante:</p>
                    
                    <div className="flex flex-col gap-2.5">
                      <button 
                        onClick={() => handleSendMessage("Analizar telemetría actual y dar un diagnóstico de optimización para el Colegio.")}
                        disabled={isLoadingAI}
                        className="text-left w-full text-xs p-3 rounded-xl bg-white/5 hover:bg-brand-green/10 border border-white/5 hover:border-brand-green/30 text-white font-medium transition-all"
                      >
                        ⚡ Analizar Telemetría Actual
                      </button>
                      
                      <button 
                        onClick={() => handleSendMessage("¿Por qué las Salas de Informática consumen tanto y de qué manera podemos recortar su huella de carbono?")}
                        disabled={isLoadingAI}
                        className="text-left w-full text-xs p-3 rounded-xl bg-white/5 hover:bg-brand-green/10 border border-white/5 hover:border-brand-green/30 text-white font-medium transition-all"
                      >
                        💻 Diagnóstico Salas Informáticas
                      </button>

                      <button 
                        onClick={() => handleSendMessage("Generar plan de sostenibilidad escolar integrando el autoconsumo FV para los estudiantes del Villas de San Ignacio.")}
                        disabled={isLoadingAI}
                        className="text-left w-full text-xs p-3 rounded-xl bg-white/5 hover:bg-brand-green/10 border border-white/5 hover:border-brand-green/30 text-white font-medium transition-all"
                      >
                        🌿 Plan de Sostenibilidad Escolar
                      </button>
                    </div>
                  </div>

                  {/* STEM Educational Core Widget */}
                  <div className="glass-card rounded-2xl p-5 space-y-3.5 border-l-2 border-l-brand-green bg-brand-green/[0.02]">
                    <div className="flex items-center gap-2">
                      <Sun className="w-5 h-5 text-brand-green animate-spin" style={{ animationDuration: "12s" }} />
                      <h4 className="font-display text-sm font-bold text-white uppercase font-mono tracking-wide">Educación STEM Integrada</h4>
                    </div>
                    <p className="text-xs text-on-surface-variant leading-relaxed">
                      Este software está calibrado para la feria ambiental de robótica del <strong className="text-white">Colegio Villas de San Ignacio</strong>. 
                      Los estudiantes pueden visualizar cómo influyen los voltajes y pérdidas en cables en la eficiencia general escolar.
                    </p>
                    <div className="flex justify-between items-center text-[10px] font-mono text-brand-green/80 mt-2">
                      <span>Prototipo Calibración v2</span>
                      <span>Colegio Villas de San Ignacio</span>
                    </div>
                  </div>

                </div>

              </div>
            </motion.div>
          )}

          {/* TAB 4: INSTALL PWA AND CONFIGURE APP_URL */}
          {activeTab === "install" && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="space-y-6 pb-24"
            >
              <div className="space-y-1">
                <span className="font-mono text-xs text-brand-green uppercase tracking-[0.15em] font-medium">APLICACIÓN DE ESCRITORIO & MOVIL</span>
                <h2 className="font-display text-2xl font-bold text-white flex items-center gap-2">
                  <Laptop className="w-6 h-6 text-brand-green animate-pulse" />
                  Instalar ECOENERG-IA
                </h2>
                <p className="text-xs text-on-surface-variant leading-relaxed">
                  Lleva el centro de control y optimización del Colegio Villas de San Ignacio directamente a tu pantalla de inicio en escritorio o celular.
                </p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                
                {/* Status and Action Panel (Col-span-7) */}
                <div className="lg:col-span-7 space-y-6">
                  
                  {isInsideIframe ? (
                    <div className="glass-card rounded-2xl p-6 border-l-2 border-l-amber-500 bg-amber-500/[0.02] space-y-4">
                      <div className="flex items-start gap-3">
                        <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                        <div>
                          <h4 className="font-display text-sm font-bold text-white uppercase font-mono tracking-wide">Entorno de Desarrollo Detectado</h4>
                          <p className="text-xs text-on-surface-variant mt-1.5 leading-relaxed font-mono text-[11px]">
                            Estás visualizando ECOENERG-IA dentro de un marco interactivo de desarrollo (iframe). Los navegadores web restringen las instalaciones de aplicaciones PWA fuera de pestañas directas e independientes por razones de seguridad.
                          </p>
                        </div>
                      </div>

                      <div className="bg-surface-container/50 rounded-xl p-4 border border-white/5 space-y-3">
                        <div className="flex justify-between items-center text-xs">
                          <span className="text-on-surface-variant font-mono text-[10px] uppercase">Enlace de la Aplicación (APP_URL):</span>
                          <span className="bg-brand-green/10 text-brand-green text-[9px] font-mono px-2 py-0.5 rounded-full font-bold">CONFIGURACIÓN ACTIVA</span>
                        </div>
                        <div className="font-mono text-xs text-white break-all bg-black/45 p-3 rounded-lg border border-white/5 flex justify-between items-center gap-3">
                          <span className="truncate select-all font-mono font-medium">{appUrl && appUrl !== "MY_APP_URL" ? appUrl : window.location.origin}</span>
                          <button
                            onClick={copyToClipboard}
                            className="bg-white/5 hover:bg-white/10 p-1.5 rounded-md transition-all text-on-surface-variant hover:text-white shrink-0"
                            title="Copiar Enlace"
                          >
                            {isCopied ? <CheckCircle className="w-4 h-4 text-brand-green" /> : <Copy className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>

                      <div className="flex flex-col sm:flex-row gap-3 pt-1">
                        <a
                          href={appUrl && appUrl !== "MY_APP_URL" ? appUrl : window.location.origin}
                          target="_blank"
                          rel="noopener referrer"
                          className="flex-1 text-center font-mono uppercase text-xs font-bold bg-[#00daf3] hover:bg-[#00daf3]/80 text-black py-3 px-4 rounded-xl transition-all flex items-center justify-center gap-2 shadow-[0_4px_16px_rgba(0,218,243,0.3)] hover:scale-[1.02]"
                        >
                          <ExternalLink className="w-4 h-4" />
                          Abrir en Nueva Pestaña
                        </a>
                        <button
                          onClick={copyToClipboard}
                          className="text-center font-mono uppercase text-xs font-bold bg-white/5 hover:bg-white/10 border border-white/10 text-white py-3 px-4 rounded-xl transition-all"
                        >
                          {isCopied ? "¡Enlace Copiado!" : "Copiar Enlace"}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="glass-card rounded-2xl p-6 border-l-2 border-l-brand-green bg-brand-green/[0.01] space-y-6">
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-xl bg-brand-green/10 flex items-center justify-center border border-brand-green/20 text-brand-green shrink-0 relative">
                          <div className="w-3 h-3 bg-brand-green rounded-full animate-ping absolute top-0 right-0" />
                          <Download className="w-5 h-5" />
                        </div>
                        <div>
                          <h4 className="font-display text-base font-bold text-white font-mono uppercase tracking-wide">Instalación Nativa Disponible</h4>
                          <p className="text-xs text-on-surface-variant mt-1 leading-relaxed">
                            Esta aplicación cuenta con soporte técnico **PWA (Progressive Web App)** completo. Puede instalarse en tu computador y ejecutarse de manera independiente como una aplicación de escritorio nativa.
                          </p>
                        </div>
                      </div>

                      <div className="border-t border-white/5 pt-4 space-y-4">
                        {isInstallable ? (
                          <div className="space-y-3">
                            <div className="text-xs text-brand-green font-mono bg-brand-green/10 rounded-lg p-2.5 border border-brand-green/20">
                              🚀 ¡Excelente! Tu navegador es totalmente compatible para instalar la aplicación de inmediato.
                            </div>
                            <button
                              onClick={handleInstallClick}
                              className="w-full text-center font-mono uppercase text-xs font-bold bg-brand-green hover:bg-brand-green/85 text-black py-4 px-4 rounded-xl transition-all flex items-center justify-center gap-2.5 shadow-[0_8px_32px_rgba(16,185,129,0.3)] hover:scale-[1.01]"
                            >
                              <Download className="w-4.5 h-4.5 animate-bounce" style={{ animationDuration: '2s' }} />
                              Instalar ECOENERG-IA en Escritorio
                            </button>
                          </div>
                        ) : (
                          <div className="space-y-4">
                            <div className="text-xs text-on-surface-variant font-mono bg-white/5 rounded-lg p-3 border border-white/5 space-y-1">
                              <div>💡 **Dato Técnico de Soporte:**</div>
                              <p className="text-[11px] leading-relaxed">
                                Si el botón interactivo automático no aparece, es porque el sistema ya está instalado, estás usando un navegador restrictivo, o la caché del sistema está leyéndose en modo offline. Consulta la guía de **Instalación Manual** a la derecha.
                              </p>
                            </div>
                            <div className="text-xs font-mono text-on-surface-variant">
                              Enlace actual de la instancia: <strong className="text-white bg-white/5 px-2 py-1 rounded font-mono border border-white/5 select-all">{appUrl && appUrl !== "MY_APP_URL" ? appUrl : window.location.origin}</strong>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* App Benefits Card */}
                  <div className="glass-card rounded-2xl p-6 space-y-4">
                    <h4 className="font-mono text-[10px] text-on-surface-variant uppercase tracking-wider font-bold">¿Por qué usar la versión instalada de escritorio?</h4>
                    <p className="text-xs text-on-surface-variant leading-relaxed">
                      El modo de aplicación nativa habilita ventajas de integración únicas para el personal de STEM y mantenimiento:
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                      <div className="bg-white/[0.02] border border-white/5 rounded-xl p-4 space-y-1.5 hover:border-brand-green/20 transition-all">
                        <Activity className="w-5 h-5 text-brand-green mb-1" />
                        <h5 className="text-xs font-bold text-white font-mono uppercase">Rendimiento Consolidado</h5>
                        <p className="text-[11px] text-on-surface-variant leading-relaxed">Carga súper liviana de recursos. Aprovecha el aislamiento de entorno para simulaciones táctiles.</p>
                      </div>

                      <div className="bg-white/[0.02] border border-white/5 rounded-xl p-4 space-y-1.5 hover:border-brand-green/20 transition-all">
                        <Cpu className="w-5 h-5 text-brand-green mb-1" />
                        <h5 className="text-xs font-bold text-white font-mono uppercase">Inmersión Completa</h5>
                        <p className="text-[11px] text-on-surface-variant leading-relaxed">Remueve las barras de direcciones URL, marcadores tradicionales para una experiencia de panel puro sin ruidos.</p>
                      </div>

                      <div className="bg-white/[0.02] border border-white/5 rounded-xl p-4 space-y-1.5 hover:border-brand-green/20 transition-all">
                        <Sun className="w-5 h-5 text-brand-green mb-1" />
                        <h5 className="text-xs font-bold text-white font-mono uppercase">Canalización STEM</h5>
                        <p className="text-[11px] text-on-surface-variant leading-relaxed">Perfecto para desplegar el mapa zonal de forma permanente en pantallas de monitoreo del laboratorio.</p>
                      </div>

                      <div className="bg-white/[0.02] border border-white/5 rounded-xl p-4 space-y-1.5 hover:border-[#00daf3]/20 transition-all">
                        <Sparkles className="w-5 h-5 text-[#00daf3] mb-1" />
                        <h5 className="text-xs font-bold text-white font-mono uppercase">Soporte APP_URL</h5>
                        <p className="text-[11px] text-on-surface-variant leading-relaxed">Sincroniza y redirige con seguridad a través del servidor activo en la nube de Google Cloud Run.</p>
                      </div>
                    </div>
                  </div>

                </div>

                {/* Installation Manual Guides (Col-span-5) */}
                <div className="lg:col-span-5 space-y-6">
                  
                  {/* Step by step manual Chrome */}
                  <div className="glass-card rounded-2xl p-5 space-y-3.5 border-l-2 border-l-[#00daf3] bg-[#00daf3]/[0.01]">
                    <div className="flex items-center gap-2">
                      <Laptop className="w-5 h-5 text-[#00daf3]" />
                      <h4 className="font-display text-xs font-bold text-white uppercase font-mono tracking-wide">Chrome o Edge (Escritorio)</h4>
                    </div>
                    <p className="text-xs text-on-surface-variant leading-relaxed">
                      Si utilizas Google Chrome o Microsoft Edge en tu computador personal:
                    </p>
                    <ol className="text-[11px] text-on-surface-variant space-y-2 list-decimal pl-4 leading-relaxed font-mono">
                      <li>Abre la aplicación en una pestaña directa (fuera del iframe).</li>
                      <li>Haz clic en el icono del **Monitor con Flecha** a la derecha en la barra de búsqueda de Chrome.</li>
                      <li>O haz clic en los tres puntos (**⋮**) arriba a la derecha y selecciona **"Instalar ECOENERG-IA..."**</li>
                    </ol>
                  </div>

                  {/* Safari macOS */}
                  <div className="glass-card rounded-2xl p-5 space-y-3.5 border-l-2 border-l-brand-green bg-brand-green/[0.01]">
                    <div className="flex items-center gap-2">
                      <Cpu className="w-5 h-5 text-brand-green" />
                      <h4 className="font-display text-xs font-bold text-white uppercase font-mono tracking-wide">Safari (macOS)</h4>
                    </div>
                    <p className="text-xs text-on-surface-variant leading-relaxed">
                      En dispositivos Apple macOS Sonoma o superior usando Safari como navegador:
                    </p>
                    <ol className="text-[11px] text-on-surface-variant space-y-2 list-decimal pl-4 leading-relaxed font-mono">
                      <li>Haz clic en el botón de **"Compartir"** (el icono de cuadrado con una flecha hacia arriba).</li>
                      <li>Despliega y pulsa la opción **"Agregar al Dock..."** en el menú contextual de Safari.</li>
                      <li>Dale un nombre a tu acceso de escritorio y pulsa Añadir para instalarlo en el Dock del Mac.</li>
                    </ol>
                  </div>

                  {/* Mobile devices */}
                  <div className="glass-card rounded-2xl p-5 space-y-3.5 border-l-2 border-l-purple-500 bg-purple-500/[0.01]">
                    <div className="flex items-center gap-2">
                      <Activity className="w-5 h-5 text-purple-400" />
                      <h4 className="font-display text-xs font-bold text-white uppercase font-mono tracking-wide">Móvil (Aulas y Celulares)</h4>
                    </div>
                    <p className="text-xs text-on-surface-variant leading-relaxed">
                      Úsalo de forma táctil en tabletas escolares o celulares de docentes:
                    </p>
                    <div className="space-y-3 text-[11px] leading-relaxed font-mono">
                      <div className="bg-white/5 p-2 rounded border border-white/5">
                        <strong className="text-purple-400 uppercase text-[10px]">🍎 iOS (Safari iPhone/iPad):</strong>
                        <p className="text-on-surface-variant text-[10px] mt-0.5">Pulsa **Compartir** en Safari, desplázate hacia abajo y selecciona **"Agregar a pantalla de inicio"**.</p>
                      </div>
                      <div className="bg-white/5 p-2 rounded border border-white/5">
                        <strong className="text-[#00daf3] uppercase text-[10px]">🤖 Android (Chrome):</strong>
                        <p className="text-on-surface-variant text-[10px] mt-0.5">Pulsa los tres puntos verticales (**⋮**) arriba a la derecha y selecciona **"Agregar a la pantalla de inicio"** o **"Instalar aplicación"**.</p>
                      </div>
                    </div>
                  </div>

                </div>

              </div>
            </motion.div>
          )}

        </div>

      </main>

      {/* FIXED BOTTOM APP BAR */}
      <nav className="fixed bottom-0 left-0 w-full z-45 bg-surface-container/90 backdrop-blur-xl border-t border-white/5 py-3 shadow-[0_-5px_30px_rgba(0,0,0,0.5)]">
        <div className="max-w-xl mx-auto flex justify-around items-center px-4">
          
          <button 
            onClick={() => setActiveTab("dashboard")}
            className={`flex flex-col items-center gap-1 px-4 py-1.5 rounded-xl transition-all ${
              activeTab === "dashboard" 
              ? "text-brand-green bg-brand-green/10 font-bold" 
              : "text-on-surface-variant/70 hover:text-white"
            }`}
          >
            <Activity className="w-5.5 h-5.5" />
            <span className="text-[10px] uppercase font-mono tracking-wider">Dashboard</span>
          </button>

          <button 
            onClick={() => setActiveTab("map")}
            className={`flex flex-col items-center gap-1 px-4 py-1.5 rounded-xl transition-all ${
              activeTab === "map" 
              ? "text-brand-green bg-brand-green/10 font-bold" 
              : "text-on-surface-variant/70 hover:text-white"
            }`}
          >
            <Sun className="w-5.5 h-5.5" />
            <span className="text-[10px] uppercase font-mono tracking-wider">Interactuar</span>
          </button>

          <button 
            onClick={() => setActiveTab("advisor")}
            className={`flex flex-col items-center gap-1 px-4 py-1.5 rounded-xl transition-all ${
              activeTab === "advisor" 
              ? "text-[#00daf3] bg-[#00daf3]/10 font-bold text-glow-cyan" 
              : "text-on-surface-variant/70 hover:text-white"
            }`}
          >
            <Sparkles className="w-5.5 h-5.5" />
            <span className="text-[10px] uppercase font-mono tracking-wider">Asesor IA</span>
          </button>

          <button 
            onClick={() => setActiveTab("install")}
            className={`flex flex-col items-center gap-1 px-4 py-1.5 rounded-xl transition-all ${
              activeTab === "install" 
              ? "text-brand-green bg-brand-green/10 font-bold font-bold text-glow-green" 
              : "text-on-surface-variant/70 hover:text-white"
            }`}
          >
            <Download className="w-5.5 h-5.5" />
            <span className="text-[10px] uppercase font-mono tracking-wider">Instalar</span>
          </button>

        </div>
      </nav>

    </div>
  );
}
