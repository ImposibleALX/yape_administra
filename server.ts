import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    }
  }
});

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API routes
  app.post("/api/parse-transaction", async (req, res) => {
    try {
      const { text } = req.body;
      if (!text) {
        return res.status(400).json({ error: "Text is required" });
      }

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: `Analiza este texto o comando de voz del usuario peruano para una app financiera: "${text}". 
Extrae la información para registrar una transacción.
El monto total extraido (debe ser un número, si menciona soles y céntimos súmalo). Si no menciona monto, asume 10.
La categoría debe ser una de estas: 'food' (para comida, menú, mercado, bodega, restaurante), 'services' (agua, luz, internet, celular, pasajes, transporte), 'emergency' (medicinas, emergencias), 'investment' (inversión, ahorro), 'other' (gustitos, compras varias, etc).
El tipo (type) debe ser 'expense' si es un gasto, o 'income' si es un ingreso (sueldo, pago que recibe, venta).
El título será una versión resumida de lo que dictó (Ej. si dijo "20 soles de pollo y 5 de papa", el título puede ser "Pollo y papa").`,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              amount: {
                type: Type.NUMBER,
                description: "El monto total de la transacción",
              },
              category: {
                type: Type.STRING,
                description: "La categoría: food, services, emergency, investment, other",
              },
              type: {
                type: Type.STRING,
                description: "El tipo: expense o income",
              },
              title: {
                type: Type.STRING,
                description: "Un título breve descriptivo",
              },
            },
            required: ["amount", "category", "type", "title"],
          },
        },
      });

      const jsonStr = response.text?.trim() || "{}";
      const data = JSON.parse(jsonStr);
      
      res.json(data);
    } catch (error) {
      console.error("Error parsing transaction:", error);
      res.status(500).json({ error: "Failed to parse transaction" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
