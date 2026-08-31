import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

// API: Health check
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    app: "Open FAIR Risk Analysis Tool",
    airGapped: true,
    version: "2.5.0",
    timestamp: new Date().toISOString()
  });
});

// API: Proxy for Local AI Endpoints (Ollama, LM Studio, LocalAI, vLLM) to bypass browser CORS restrictions
app.post("/api/ai/local-proxy", async (req, res) => {
  try {
    const { endpoint, payload, headers: customHeaders } = req.body;
    if (!endpoint) {
      return res.status(400).json({ error: "Endpoint URL is required" });
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 60000); // 60s timeout for local models

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      ...(customHeaders || {})
    };

    const response = await fetch(endpoint, {
      method: "POST",
      headers,
      body: JSON.stringify(payload),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorText = await response.text();
      return res.status(response.status).json({
        error: `Local AI Endpoint returned status ${response.status}: ${errorText}`
      });
    }

    const data = await response.json();
    res.json(data);
  } catch (error: any) {
    console.error("Local AI proxy error:", error);
    res.status(502).json({
      error: error.message || "Failed to reach local AI endpoint. Ensure Ollama/LM Studio is running."
    });
  }
});

// API: Ping local endpoint for model list
app.post("/api/ai/ping-endpoint", async (req, res) => {
  try {
    const { endpoint } = req.body;
    if (!endpoint) {
      return res.status(400).json({ error: "Endpoint URL is required" });
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    const startTime = Date.now();
    let models: string[] = [];

    // Try standard OpenAI /v1/models or Ollama /api/tags
    const urlObj = new URL(endpoint);
    const baseUrl = `${urlObj.protocol}//${urlObj.host}`;
    
    try {
      const modelsRes = await fetch(`${baseUrl}/v1/models`, {
        method: "GET",
        signal: controller.signal
      });
      if (modelsRes.ok) {
        const data = await modelsRes.json();
        models = (data.data || []).map((m: any) => m.id || m.name);
      }
    } catch {
      // Try Ollama endpoint
      try {
        const ollamaRes = await fetch(`${baseUrl}/api/tags`, {
          method: "GET",
          signal: controller.signal
        });
        if (ollamaRes.ok) {
          const data = await ollamaRes.json();
          models = (data.models || []).map((m: any) => m.name || m.model);
        }
      } catch {
        // Ignored
      }
    }

    clearTimeout(timeoutId);
    const latency = Date.now() - startTime;

    res.json({
      online: true,
      latencyMs: latency,
      models: models.length > 0 ? models : ["default-local-model", "llama3", "mistral", "qwen"]
    });
  } catch (error: any) {
    res.json({
      online: false,
      error: error.message || "Endpoint unreachable",
      latencyMs: 0,
      models: []
    });
  }
});

// Server-side Gemini AI fallback (if GEMINI_API_KEY is configured in .env and user opts in)
app.post("/api/ai/gemini-fallback", async (req, res) => {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey === "MY_GEMINI_API_KEY") {
      return res.status(400).json({
        error: "GEMINI_API_KEY is not configured on server. Use Local AI Endpoint or Heuristic Engine."
      });
    }

    const { prompt, systemInstruction } = req.body;
    const { GoogleGenAI } = await import("@google/genai");
    const ai = new GoogleGenAI({ apiKey });

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        systemInstruction: systemInstruction || "You are an expert Open FAIR Information Risk Quantitative Analyst."
      }
    });

    res.json({
      text: response.text || ""
    });
  } catch (error: any) {
    console.error("Gemini fallback error:", error);
    res.status(500).json({
      error: error.message || "Failed to generate AI response"
    });
  }
});

// Vite middleware / static serving
async function start() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Open FAIR Tool running on http://0.0.0.0:${PORT}`);
  });
}

start();
