import express from "express";
import path from "path";
import dotenv from "dotenv";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize Gemini SDK with named parameters
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    }
  }
});

// API endpoint for decision analysis
app.post("/api/decide", async (req, res) => {
  try {
    const { decision, type = "pros_cons", options = [], criteria = [] } = req.body;

    if (!decision || typeof decision !== "string" || decision.trim() === "") {
      return res.status(400).json({ error: "Decision statement is required." });
    }

    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({ 
        error: "GEMINI_API_KEY environment variable is not set on the server. Please add it via Secrets." 
      });
    }

    // Build model prompt
    let prompt = `Analyze the following decision dilemma: "${decision}"\n`;
    
    if (options && options.length > 0) {
      prompt += `Options to consider: ${options.map((o: string) => `"${o}"`).join(", ")}\n`;
    } else {
      prompt += `Please deduce the logical options or contrasting courses of action for this decision (e.g. Yes vs No, or action vs inaction).\n`;
    }

    if (criteria && criteria.length > 0) {
      prompt += `Criteria of importance to focus on or evaluate: ${criteria.map((c: string) => `"${c}"`).join(", ")}\n`;
    }

    prompt += `\nPlease compile an objective, smart, highly insightful tie-breaker analysis of type "${type}". `;
    prompt += `Provide a clear winner, a confidence score (0-100) indicating how clear the choice is, a helpful synopsis, a definitive tiebreaker verdict, and a concrete action plan with step-by-step next tasks. `;
    
    if (type === "pros_cons") {
      prompt += `Make sure to fill out the "alternatives" list. Each alternative should have numerical scores, list of pros (with importance weights 1 to 5 and brief explanations) and list of cons (with importance weights 1 to 5 and brief explanations).`;
    } else if (type === "comparison") {
      prompt += `Make sure to fill out the "comparison" object, detailing the key criteria of evaluation and scores (1 to 10) + comments for each option under each criterion.`;
    } else if (type === "swot") {
      prompt += `Make sure to fill out the "swot" list of objects, specifying the internal Strengths, internal Weaknesses, external Opportunities, and external Threats for each option, ending with actionable SWOT insights.`;
    } else {
      // verdict: do everything/a blend
      prompt += `Provide a comprehensive analysis. Fill out the "alternatives", "comparison", and "swot" blocks so we can show a detailed, multi-perspective tiebreaker report. Delineate excellent strategic SWOT details and pros/cons.`;
    }

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        systemInstruction: `You are 'The Tiebreaker', an elite, decisive AI Decisionist. Your purpose is to help users resolve difficult conflicts, break deadlocks, and choose optimal paths. 
Avoid being wishy-washy. Even in highly complex dilemmas, weigh variables logically, run a detailed evaluation, and make a definitive recommendation (declare an unambiguous winner).
Your output must be structured exactly to the requested JSON schema. Deliver sharp, insightful, psychological and practical evaluations. No fluff.`,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            decisionTitle: { 
              type: Type.STRING,
              description: "A refined, professional title for the decision analyzed." 
            },
            winner: { 
              type: Type.STRING,
              description: "The definitive winning option recommendation." 
            },
            confidenceScore: { 
              type: Type.INTEGER, 
              description: "Confidence percentage (0 to 100) about this recommendation." 
            },
            synopsis: { 
              type: Type.STRING, 
              description: "A crisp 2-3 sentence overview of the trade-offs and core dilemma." 
            },
            alternatives: {
              type: Type.ARRAY,
              description: "An evaluation of options with their pros and cons. Provide at least 2 alternatives.",
              items: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING, description: "Name of the option or path name." },
                  score: { type: Type.INTEGER, description: "Net weighted score calculated by summing pro weights and subtracting con weights." },
                  pros: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        point: { type: Type.STRING },
                        weight: { type: Type.INTEGER, description: "Importance weight on scale of 1 (nice-to-have) to 5 (critical positive factor)" },
                        explanation: { type: Type.STRING, description: "Brief 1-sentence analysis of why this is a pro." }
                      },
                      required: ["point", "weight", "explanation"]
                    }
                  },
                  cons: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        point: { type: Type.STRING },
                        weight: { type: Type.INTEGER, description: "Disadvantage weight on scale of 1 (minor annoyance) to 5 (deal-breaker)" },
                        explanation: { type: Type.STRING, description: "Brief 1-sentence analysis of why this is a con." }
                      },
                      required: ["point", "weight", "explanation"]
                    }
                  }
                },
                required: ["name", "score", "pros", "cons"]
              }
            },
            comparison: {
              type: Type.OBJECT,
              description: "Detailed criteria-by-criteria scoring matrix.",
              properties: {
                criteria: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING }
                },
                matrix: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      criterion: { type: Type.STRING, description: "The evaluation dimension (e.g. Cost, Growth potential)." },
                      scores: {
                        type: Type.ARRAY,
                        items: {
                          type: Type.OBJECT,
                          properties: {
                            option: { type: Type.STRING, description: "The option string." },
                            score: { type: Type.INTEGER, description: "Relative score from 1 to 10 (10 being perfect)." },
                            comment: { type: Type.STRING, description: "Short justification sentence." }
                          },
                          required: ["option", "score", "comment"]
                        }
                      }
                    },
                    required: ["criterion", "scores"]
                  }
                }
              },
              required: ["criteria", "matrix"]
            },
            swot: {
              type: Type.ARRAY,
              description: "SWOT (Strengths, Weaknesses, Opportunities, Threats) analysis for critical strategic options.",
              items: {
                type: Type.OBJECT,
                properties: {
                  option: { type: Type.STRING, description: "Name of the option evaluated." },
                  strengths: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Internal advantages." },
                  weaknesses: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Internal constraints or weaknesses." },
                  opportunities: { type: Type.ARRAY, items: { type: Type.STRING }, description: "External positive catalysts or trends." },
                  threats: { type: Type.ARRAY, items: { type: Type.STRING }, description: "External risks or challenges." },
                  insights: { type: Type.STRING, description: "Key takeaway combining SWOT variables for this option." }
                },
                required: ["option", "strengths", "weaknesses", "opportunities", "threats", "insights"]
              }
            },
            tiebreakerVerdict: { 
              type: Type.STRING, 
              description: "The main, deeply persuasive concluding statement breaking the deadlock." 
            },
            actionPlan: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "3-5 key prioritized action steps to execute the decision."
            }
          },
          required: ["decisionTitle", "winner", "confidenceScore", "synopsis", "tiebreakerVerdict", "actionPlan"]
        }
      }
    });

    const textOutput = response.text || "";
    const parsedData = JSON.parse(textOutput);
    res.json(parsedData);

  } catch (error: any) {
    console.error("Gemini Decide Error:", error);
    res.status(500).json({ 
      error: "Failed to perform tiebreaker analysis.", 
      message: error.message || error 
    });
  }
});

// Configure Vite or Static asset serving
async function startServer() {
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
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
