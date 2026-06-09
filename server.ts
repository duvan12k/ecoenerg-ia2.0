import express from "express";
import path from "path";
import dotenv from "dotenv";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";

// Initialize environment variables from .env
dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Serve PWA web manifest dynamically
app.get("/manifest.json", (req, res) => {
  res.json({
    short_name: "ECOENERG-IA",
    name: "ECOENERG-IA: Gestión Energética Escolar",
    icons: [
      {
        src: "https://img.icons8.com/wired/192/00daf3/energy-saving-bulb.png",
        type: "image/png",
        sizes: "192x192"
      },
      {
        src: "https://img.icons8.com/wired/512/00daf3/energy-saving-bulb.png",
        type: "image/png",
        sizes: "512x512"
      }
    ],
    start_url: "/",
    background_color: "#0a0a0c",
    theme_color: "#10b981",
    display: "standalone",
    orientation: "portrait"
  });
});

// Serve PWA service worker with correct MIME type
app.get("/sw.js", (req, res) => {
  res.setHeader("Content-Type", "application/javascript");
  res.send(`
    self.addEventListener('install', (event) => {
      self.skipWaiting();
    });
    self.addEventListener('activate', (event) => {
      event.waitUntil(clients.claim());
    });
    self.addEventListener('fetch', (event) => {
      event.respondWith(fetch(event.request).catch(() => {
        // Safe offline fallback helper
      }));
    });
  `);
});

// Route to fetch system APP_URL dynamically
app.get("/api/config", (req, res) => {
  const reqHost = req.get("host") || "";
  const isSandboxHost = reqHost.startsWith("ais-dev-") || reqHost.startsWith("ais-pre-");
  let resolvedUrl = process.env.APP_URL || "";
  
  if (isSandboxHost && reqHost.endsWith(".run.app")) {
    resolvedUrl = `https://${reqHost}`;
  }
  
  res.json({
    appUrl: resolvedUrl || `https://${reqHost}`
  });
});



// Initialize GoogleGenAI client safely on the server side
// We check if GEMINI_API_KEY is available first and initialize if possible
let ai: GoogleGenAI | null = null;
try {
  const apiKey = process.env.GEMINI_API_KEY;
  if (apiKey && apiKey !== "MY_GEMINI_API_KEY" && apiKey.trim() !== "") {
    ai = new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
    console.log("GoogleGenAI initialized successfully with backend API Key.");
  } else {
    console.warn("GEMINI_API_KEY is placeholder or empty. AI features will fallback gracefully.");
  }
} catch (error) {
  console.error("Failed to initialize GoogleGenAI:", error);
}

// API: IA Energy Advisor Chat and Report Analyzer
app.post("/api/gemini/chat", async (req, res) => {
  try {
    const { message, dashboardState, chatHistory } = req.body;

    if (!message) {
      return res.status(400).json({ error: "Disculpe, el mensaje es requerido." });
    }

    if (!ai) {
      // Graceful fallback when API key is missing or invalid
      return res.json({
        text: `**[Modo Demostración - Sin API Key]**\n\n¡Hola! Veo que estás analizando los datos del **Colegio Villas de San Ignacio**.\n\nPara reactivar la Inteligencia Artificial real con Gemini, introduce una clave de servicio válida. Mientras tanto, aquí tienes un consejo preprogramado:\n\n* **Salas de Informática:** Actualmente registran carga crítica (62kW). Te sugiero programar el apagado automático de computadores a partir de las 18:30.\n* **Energía Solar:** La generación está al 42%. Excelente día soleado.\n\n¿Deseas implementar alguna optimización remota en Salones o Cafetería?`
      });
    }

    // Prepare a context-rich prompt adding real-time telemetry from the dashboard
    const telemetryContext = `
      Información de Telemetría en Tiempo Real del Colegio Villas de San Ignacio:
      - Carga Real de Consumo: ${dashboardState?.currentConsumption ?? 72.4} kW
      - Pico Máximo Registrado Hoy: ${dashboardState?.peakToday ?? 88.2} kW
      - Estimado Diario Acumulado: ${dashboardState?.estDaily ?? 540} kWh
      - Eficiencia del Sistema: ${dashboardState?.efficiency ?? 94.8} %
      - Porcentaje Renovables (Solar Arrays): ${dashboardState?.renewablePercentage ?? 42} %
      - Ahorro Económico Mensual Acumulado: $${dashboardState?.currentSavings ?? 1240.50} USD
      - Sensores Activos en Red IoT: ${dashboardState?.activeSensors ?? 128} de 130
      
      Estados de Zonas Escolares:
      1. Salas de Informática: ${dashboardState?.zones?.['Salas de Informática']?.isOptimized ? "Modo Optimizando (Consumo Reducido ~28kW)" : "Consumo Normal/Alto (Aproximadamente 62kW)"}
      2. Administración: ${dashboardState?.zones?.['Administración']?.isOptimized ? "Modo Optimizando (Ahorro activado ~19kW)" : "Consumo Normal (~35kW)"}
      3. Salones Generales: ${dashboardState?.zones?.['Salones']?.isOptimized ? "Modo Inteligente Activo (~10kW)" : "Consumo Normal (~18kW)"}
      4. Cafetería: ${dashboardState?.zones?.['Cafetería']?.isOptimized ? "Modo Ecológico Activo (~22kW)" : "Consumo Normal/Alto (~42kW)"}
      5. Generador Solar (Photovoltaic): Generando constantemente ~22kW estables.
    `;

    // Construct history structure
    const systemPrompt = `
      Eres ECOENERG-IA, un asistente virtual experto en optimización energética y sostenibilidad ambiental especializado en el campus del "Colegio Villas de San Ignacio".
      Tu objetivo es guiar a directores del colegio, personal de mantenimiento administratrivo y estudiantes de STEM a comprender su consumo e implementar automatizaciones eficientes.
      Debes dar respuestas motivadoras, didácticas y técnicamente precisas.
      
      Reglas de respuesta:
      - Responde siempre en español.
      - Sé profesional, amigable y mantén un lenguaje estructurado en formato Markdown.
      - Utiliza los datos de telemetría reales proporcionados para justificar tus consejos (ej. mencionar consumos exactos en kW).
      - Si el usuario te pide apagar o regular una zona, indícale amablemente que puede usar los botones o interruptores del "Mapa Interactivo" en la barra inferior para efectuar la simulación del control directo.
      - Ofrece 2 o 3 recomendaciones de infraestructura basadas en la telemetría actual.
    `;

    // Form contents for model
    const contents = [
      {
        role: "user" as const,
        parts: [{ text: `${systemPrompt}\n\nContexto actual de Telemetría:\n${telemetryContext}\n\nHistorial previo de conversación:\n${JSON.stringify(chatHistory || [])}\n\nPregunta o acción del usuario:\n"${message}"` }]
      }
    ];

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: contents,
    });

    res.json({ text: response.text });

  } catch (error: any) {
    console.error("Error in /api/gemini/chat:", error);
    res.status(500).json({ error: "Fallo al procesar su solicitud en ECOENERG-IA.", details: error.message });
  }
});


// Serve API Health check
app.get("/api/health", (req, res) => {
  res.json({
    status: "online",
    time: new Date(),
    aiEnabled: ai !== null
  });
});

// Configure Vite integration or Static File Serving depending on Environment
async function setupServer() {
  if (process.env.NODE_ENV !== "production") {
    // Development mode with hot module replacement (HMR) proxying
    console.log("Configuring Vite Development Middleware...");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    // Production mode
    console.log("Serving static production assets [Caching Disabled]...");
    const distPath = path.join(process.cwd(), "dist");
    
    // Configure express static server with cache-control headers
    app.use(express.static(distPath, {
      etag: false,
      lastModified: false,
      setHeaders: (res, filePath) => {
        res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0");
        res.setHeader("Pragma", "no-cache");
        res.setHeader("Expires", "0");
      }
    }));

    app.get("*", (req, res) => {
      res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0");
      res.setHeader("Pragma", "no-cache");
      res.setHeader("Expires", "0");
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`ECOENERG-IA Server boot successful!`);
    console.log(`Running in ${process.env.NODE_ENV || "development"} mode on http://localhost:${PORT}`);
  });
}

setupServer();
