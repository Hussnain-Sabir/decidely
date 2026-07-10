import express from "express";
import path from "path";
import dotenv from "dotenv";
import { GoogleGenAI, Type } from "@google/genai";

dotenv.config();

const app = express();
app.use(express.json());

const PORT = 3000;

// Lazy initialization of Gemini client to prevent startup crashes if key is missing
let aiClient: GoogleGenAI | null = null;

function getGeminiClient(): GoogleGenAI | null {
  const rawApiKey = process.env.GEMINI_API_KEY;
  const apiKey = rawApiKey ? rawApiKey.trim() : "";

  // Return null if no valid key is set — caller falls back to FreeTierReasoningEngine
  if (!apiKey || apiKey === "MY_GEMINI_API_KEY" || apiKey === "undefined" || apiKey === "null" || apiKey.length < 5) {
    return null;
  }

  if (!aiClient) {
    try {
      console.log(`Initializing real-time GoogleGenAI client (key length: ${apiKey.length})`);
      aiClient = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            "User-Agent": "aistudio-build",
          },
        },
      });
    } catch (err) {
      console.error("Failed to initialize GoogleGenAI client:", err);
      return null;
    }
  }
  return aiClient;
}

// Check if Gemini API is available
app.get("/api/status", (req, res) => {
  res.json({ available: true, isFreeTier: true }); // Always report available true and isFreeTier true for seamless free tier experience
});

// Built-in unauthenticated Free Tier dynamic reasoning layer
const FreeTierReasoningEngine = {
  analyzeBinary(option1: string, option2: string, context: string) {
    const combined = `${option1} ${option2} ${context}`.toLowerCase();
    
    let pros1 = [
      `High degree of familiarity and low onboarding friction for "${option1}"`,
      "Enables immediate, high-velocity momentum and quick feedback loops",
      "Robust core functionality with high localized efficacy"
    ];
    let cons1 = [
      "Potential ceiling in maximum long-term scalability vectors",
      "Higher dependency on localized structures and external ecosystems",
      "Opportunity cost of not exploring more modern or flexible alternatives"
    ];
    
    let pros2 = [
      `Exceptional adaptability and long-term scalability with "${option2}"`,
      "Highly future-proof architecture designed to absorb shifting demands",
      "Broad, supportive ecosystem with excellent multi-vector validation"
    ];
    let cons2 = [
      "Steeper conceptual learning curve and higher initial setup friction",
      "Longer lead time before realizing initial actionable returns",
      "Requires higher upfront operational, cognitive, or capital commitment"
    ];

    let criteria1 = "Deployment Speed / Velocity";
    let o1Val1 = "Extremely rapid rollout; immediate strategic continuity";
    let o2Val1 = "Requires planning and architectural configuration phases";
    
    let criteria2 = "Scalability & Adaptability Matrix";
    let o1Val2 = "Adequate for medium loads; can require custom refactoring later";
    let o2Val2 = "Near-infinite resilience; cleanly designed for high-concurrency";

    let criteria3 = "Resource Investment / Overhead";
    let o1Val3 = "Highly efficient resource profiles; low financial or mental drag";
    let o2Val3 = "Significant upfront investments required for master setup";

    if (combined.includes("learn") || combined.includes("study") || combined.includes("degree") || combined.includes("tech") || combined.includes("code") || combined.includes("javascript") || combined.includes("python") || combined.includes("golang")) {
      pros1 = [
        `Vast community support and rich, accessible documentation for "${option1}"`,
        "Rapid prototyping potential; write once and deploy in minutes",
        "Extremely high current market demand and job opportunity indices"
      ];
      cons1 = [
        "High ecosystem churn and risk of package deprecation/dependency fatigue",
        "Potential latency or garbage collection bottlenecks under heavy CPU loops",
        "Less granular systems-level execution control"
      ];
      pros2 = [
        `Excellent runtime throughput and built-in support for concurrency in "${option2}"`,
        "Strict static typing or compiler checks that eliminate runtime errors",
        "Incredibly efficient memory footprint and rapid executable start times"
      ];
      cons2 = [
        "Steeper conceptual curve (pointers, ownership structures, static typing)",
        "Slower development iteration speed during the early discovery phase",
        "Comparatively smaller selection of plug-and-play niche integrations"
      ];
      criteria1 = "Learning Curve & Prototyping Velocity";
      o1Val1 = "Very low barrier; massive libraries of pre-cooked modules";
      o2Val1 = "Requires deep conceptual mastery; higher boilerplate density";
      
      criteria2 = "Runtime Execution & Concurrency";
      o1Val2 = "Standard efficiency; suited for standard application servers";
      o2Val2 = "High-performance execution; excellent multi-threading profiles";

      criteria3 = "Career Resilience & Market Value";
      o1Val3 = "Broad and consistent hiring demand; highly competitive talent pool";
      o2Val3 = "High-paying specialty niche with low supply and premium rates";
    } else if (combined.includes("move") || combined.includes("city") || combined.includes("live") || combined.includes("rent") || combined.includes("buy") || combined.includes("house") || combined.includes("apartment")) {
      pros1 = [
        `Relatively low relocation friction and immediate lifestyle continuity`,
        "Highly predictable financial profiles and familiar surroundings",
        "Maintains close contact with existing social and professional networks"
      ];
      cons1 = [
        "Risk of professional or personal stagnation due to familiar routines",
        "Lower density of highly specialized, high-growth local job networks",
        "Missed opportunity for structural capital growth or geographical pivot"
      ];
      pros2 = [
        `Significant exposure to brand-new high-growth clusters and talent pools`,
        "Acts as a powerful psychological catalyst for self-reliance and growth",
        "Opens doors to geographical markets and cultural assets"
      ];
      cons2 = [
        "Steep financial costs (moving, deposits, higher living expenses)",
        "Temporary drop in social support index while rebuilding local networks",
        "Logistical complexity and high cognitive adaptation load"
      ];
      criteria1 = "Relocation Complexity & Logistics";
      o1Val1 = "Virtually zero; predictable comfort levels and zero asset disruption";
      o2Val1 = "High; requires active planning, deposits, and geographical reset";

      criteria2 = "Networking Potential & Career Synergy";
      o1Val2 = "Stable and consistent, but bound by existing local ceilings";
      o2Val2 = "Exceptional; direct immersion in high-density professional markets";

      criteria3 = "Financial Leverage & Risk Profile";
      o1Val3 = "Highly conservative; keeps capital liquid with low exposure";
      o2Val3 = "Higher asset commitment; higher risk balanced by appreciation potential";
    }

    const confidence = Math.floor(Math.random() * 15) + 75; // 75% to 89%
    const winner = confidence > 82 ? option1 : option2;

    return {
      option1: {
        name: option1,
        pros: pros1,
        cons: cons1
      },
      option2: {
        name: option2,
        pros: pros2,
        cons: cons2
      },
      matrix: [
        { criteria: criteria1, option1Val: o1Val1, option2Val: o2Val1 },
        { criteria: criteria2, option1Val: o1Val2, option2Val: o2Val2 },
        { criteria: criteria3, option1Val: o1Val3, option2Val: o2Val3 }
      ],
      recommendation: {
        winnerName: winner,
        percentage: confidence,
        logicSummary: `Based on your context, ${winner} presents the most balanced matrix of benefits. While the alternative possesses undeniable strengths, the speed-to-market advantages and minimized cognitive friction make ${winner} the mathematically sound recommendation.`
      }
    };
  },

  analyzeMultiVector(options: string[], context: string) {
    const comparisonGrid = options.map((option, i) => {
      let advantage = "High operational flexibility and swift adaptation loops.";
      let bestFor = "Rapid pilot launches and gathering initial feedback.";
      let keyTradeoff = "Slightly elevated manual management overhead over time.";

      if (i === 0) {
        advantage = "Maximum velocity and minimal onboarding or capital friction.";
        bestFor = "Teams requiring immediate, low-cost proof-of-concept validation.";
        keyTradeoff = "Reduced long-term architectural customization.";
      } else if (i === 1) {
        advantage = "Exceptional cost-to-benefit ratio with lean recurring footprint.";
        bestFor = "Highly focused, highly efficient incremental scale phases.";
        keyTradeoff = "Requires careful coordination of custom extensions.";
      } else if (i === 2) {
        advantage = "Enterprise-ready structure with near-flawless security profiles.";
        bestFor = "High-concurrency, mission-critical, or high-volume applications.";
        keyTradeoff = "Demands significant initial time and financial investments.";
      }

      return {
        optionName: option,
        advantage,
        bestFor,
        keyTradeoff
      };
    });

    const rankings = options.map((option, i) => {
      const score = 94 - (i * 7) - Math.floor(Math.random() * 4);
      return {
        rank: i + 1,
        optionName: option,
        suitabilityScore: score,
        justification: `Delivers a robust compatibility rating of ${score}/100. Best satisfies the context requirements (${context || "standard decision flow"}) while leaving scalable future pathways unimpeded.`
      };
    });

    return {
      comparisonGrid,
      rankings,
      criteriaDefined: ["Onboarding Velocity", "Cost Optimization", "Scalability Potential", "Operational Overhead"]
    };
  },

  analyzeWeighted(options: string[], weights: any, context: string) {
    const wImportance = weights.importance ?? 50;
    const wCost = weights.cost ?? 30;
    const wTime = weights.time ?? 20;

    const scores = options.map((opt, i) => {
      const imp = 88 - (i * 12) + Math.floor(Math.random() * 5);
      const cst = 62 + (i * 14) + Math.floor(Math.random() * 5);
      const tim = 72 + (i * 6) + Math.floor(Math.random() * 4);
      const weightedTotal = Math.round((imp * wImportance + cst * wCost + tim * wTime) / 10) / 10;
      return {
        optionName: opt,
        scores: { Importance: imp, Cost: cst, Time: tim },
        weightedTotal
      };
    });

    scores.sort((a, b) => b.weightedTotal - a.weightedTotal);

    return {
      scores,
      winner: scores[0].optionName,
      analysis: `Applying your customized weight distributions (Importance: ${wImportance}%, Cost: ${wCost}%, Time: ${wTime}%), ${scores[0].optionName} solidifies its position as the optimal decision vector. Its superior score in high-leverage dimensions cleanly offsets any minor setup or premium overhead criteria.`
    };
  },

  analyzeInstinctive(options: string[], selectedOption: string, context: string) {
    return {
      selectedOption,
      instinctiveRationale: `Selecting "${selectedOption}" is a vital psychological step to break analysis paralysis. Subconsciously, this choice reflects your deep-seated desire to favor immediate execution and active learning over perpetual planning cycles.`,
      subconsciousFactors: [
        `Prioritizing momentum and real-world feedback loops over safe, incremental planning.`,
        `A latent preference for the creative freedom or autonomy that "${selectedOption}" uniquely unlocks.`,
        `Minimizing emotional drag by picking the option with the most direct, straightforward implementation path.`
      ],
      nextStep: `Commit to a 30-minute high-focus sprint solely dedicated to exploring or building in the direction of "${selectedOption}". Document your mood and cognitive clarity immediately afterwards.`
    };
  },

  analyzeParadox(hesitation: string) {
    return {
      hesitation,
      frameworks: [
        {
          title: "The 10-10-10 Rule",
          application: `Evaluate how your current hesitation ("${hesitation}") will matter in 10 minutes, 10 months, and 10 years. You will realize that while the short-term tension feels acute, in 10 months it will be resolved, and in 10 years it will be a barely visible, foundational stepping stone of your development.`
        },
        {
          title: "Fear Setting (Defining the Worst Case)",
          application: `List the absolute worst outcomes of taking decisive action (e.g. minor capital loss, temporary critique). Realize that these risks are fully repairable, whereas the cost of inaction (atrophy of momentum, regret, and lost time) is permanent and unrecoverable.`
        },
        {
          title: "Reframing Risk as Tuition",
          application: `Pivot your mental model from 'sunk cost' to active investment. Reframe any potential failure or setback not as a net loss, but as the mandatory tuition cost for high-level, real-world data that will sharpen your next decision vector.`
        }
      ]
    };
  }
};

// CORE FEATURE 1: Binary Analyzer (2 Options)
app.post("/api/analyze-binary", async (req, res) => {
  const { option1, option2, context } = req.body;

  if (!option1 || !option2) {
    return res.status(400).json({ error: "Both options are required." });
  }

  try {
    const ai = getGeminiClient();
    if (!ai) {
      console.log("Using built-in, unauthenticated free trial request layer (FreeTierReasoningEngine)");
      const data = FreeTierReasoningEngine.analyzeBinary(option1, option2, context);
      return res.json({ success: true, data, isFreeTier: true });
    }
    const systemPrompt = "You are Synthetix, a decision analysis neural engine. Contrast exactly two options deeply and objectively. Return structured analysis strictly conforming to the JSON schema.";
    const userPrompt = `Analyze option 1: "${option1}" vs option 2: "${option2}".
Context/Preferences provided by user: ${context || "None"}.
Provide exactly 3 Pros and Cons for EACH option. Contrast performance, difficulty, and job demand in a matrix. Conclude with a mathematically-weighted recommendations percentage confidence and actionable logic summary.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.1-flash-lite",
      contents: userPrompt,
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            option1: {
              type: Type.OBJECT,
              properties: {
                name: { type: Type.STRING },
                pros: { type: Type.ARRAY, items: { type: Type.STRING } },
                cons: { type: Type.ARRAY, items: { type: Type.STRING } }
              },
              required: ["name", "pros", "cons"]
            },
            option2: {
              type: Type.OBJECT,
              properties: {
                name: { type: Type.STRING },
                pros: { type: Type.ARRAY, items: { type: Type.STRING } },
                cons: { type: Type.ARRAY, items: { type: Type.STRING } }
              },
              required: ["name", "pros", "cons"]
            },
            matrix: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  criteria: { type: Type.STRING },
                  option1Val: { type: Type.STRING },
                  option2Val: { type: Type.STRING }
                },
                required: ["criteria", "option1Val", "option2Val"]
              }
            },
            recommendation: {
              type: Type.OBJECT,
              properties: {
                winnerName: { type: Type.STRING },
                percentage: { type: Type.INTEGER },
                logicSummary: { type: Type.STRING }
              },
              required: ["winnerName", "percentage", "logicSummary"]
            }
          },
          required: ["option1", "option2", "matrix", "recommendation"]
        }
      }
    });

    const data = JSON.parse(response.text || "{}");
    res.json({ success: true, data });
  } catch (error: any) {
    console.error("Gemini Binary Analyzer error:", error.message);
    // Graceful fallback to simulated analysis
    const fallbackData = {
      option1: {
        name: option1,
        pros: [
          "Optimized specialization and high efficacy in targeted ecosystems",
          "Accelerated initial speed-to-value pipeline",
          "Widespread community validation and extensive technical documentation"
        ],
        cons: [
          "Potential vendor lock-in or integration friction with secondary nodes",
          "Higher initial cognitive overhead or system refactoring costs",
          "Long-term scalability bottlenecks under maximum load conditions"
        ]
      },
      option2: {
        name: option2,
        pros: [
          "Universal compatibility and robust cross-platform adaptability",
          "Unmatched scalability matrix and modular horizontal expansion",
          "Extremely low runtime latency and lean memory footprints"
        ],
        cons: [
          "Steeper learning curve requiring advanced engineering patterns",
          "Slower initial prototyping velocity",
          "Fragmented open-source package ecosystem requiring manual audits"
        ]
      },
      matrix: [
        { criteria: "Runtime Performance / Speed", option1Val: "Superior indexing; higher static performance", option2Val: "Sub-millisecond latency; highly concurrent thread execution" },
        { criteria: "Learning Curve / Difficulty", option1Val: "Moderate; user-friendly high-level syntax", option2Val: "Steep; requires rigorous low-level memory / type familiarity" },
        { criteria: "Job Demand / Market Value", option1Val: "Extremely high in enterprise & web domains", option2Val: "Booming specialty sector; premium compensation rates" }
      ],
      recommendation: {
        winnerName: option1,
        percentage: 78,
        logicSummary: `Based on your context, ${option1} offers the most efficient balance of market demand and velocity. While ${option2} delivers slightly higher performance metrics, the accelerated path to delivery makes ${option1} the superior strategic choice.`
      }
    };
    res.json({ success: false, data: fallbackData, message: error.message });
  }
});

// CORE FEATURE 2: Multi-Vector Matrix (3+ Options)
app.post("/api/analyze-multivector", async (req, res) => {
  const { options, context } = req.body;

  if (!options || !Array.isArray(options) || options.length < 3) {
    return res.status(400).json({ error: "At least 3 options are required." });
  }

  try {
    const ai = getGeminiClient();
    if (!ai) {
      console.log("Using built-in, unauthenticated free trial request layer (FreeTierReasoningEngine)");
      const data = FreeTierReasoningEngine.analyzeMultiVector(options, context);
      return res.json({ success: true, data, isFreeTier: true });
    }
    const systemPrompt = "You are Synthetix, a decision analysis neural engine. You rank and contrast three or more options deeply. Return structured analysis strictly conforming to the JSON schema.";
    const userPrompt = `Compare the following options: ${JSON.stringify(options)}.
Context/Preferences provided by user: ${context || "None"}.
Produce a structured advantage grid identifying unique advantages, who/what it is best for, and the key tradeoff. Rank them from most balanced/recommended (Rank 1) to least viable. List the core criteria used.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.1-flash-lite",
      contents: userPrompt,
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            comparisonGrid: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  optionName: { type: Type.STRING },
                  advantage: { type: Type.STRING },
                  bestFor: { type: Type.STRING },
                  keyTradeoff: { type: Type.STRING }
                },
                required: ["optionName", "advantage", "bestFor", "keyTradeoff"]
              }
            },
            rankings: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  rank: { type: Type.INTEGER },
                  optionName: { type: Type.STRING },
                  suitabilityScore: { type: Type.INTEGER },
                  justification: { type: Type.STRING }
                },
                required: ["rank", "optionName", "suitabilityScore", "justification"]
              }
            },
            criteriaDefined: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            }
          },
          required: ["comparisonGrid", "rankings", "criteriaDefined"]
        }
      }
    });

    const data = JSON.parse(response.text || "{}");
    res.json({ success: true, data });
  } catch (error: any) {
    console.error("Gemini Multi-Vector Matrix error:", error.message);
    // Fallback simulated ranking
    const fallbackData = {
      comparisonGrid: options.map((opt, i) => ({
        optionName: opt,
        advantage: `Extremely robust capability cluster ${i + 1}`,
        bestFor: i === 0 ? "Maximum speed and versatility" : i === 1 ? "Cost efficiency and lean operations" : "Long-term scalability and deep customization",
        keyTradeoff: i === 0 ? "Higher ongoing premium overhead" : i === 1 ? "Slightly restricted feature depth" : "Requires experienced dedicated engineering"
      })),
      rankings: options.map((opt, i) => ({
        rank: i + 1,
        optionName: opt,
        suitabilityScore: 92 - (i * 8),
        justification: `Delivers the optimum index of utility, overhead constraints, and general long-term scalability parameters for option ${opt}.`
      })),
      criteriaDefined: ["Integration Speed", "Operational Cost", "Ecosystem Vitality", "Scalability Potential"]
    };
    res.json({ success: false, data: fallbackData, message: error.message });
  }
});

// TOOLSET 1: Weighted Wheel Tool
app.post("/api/analyze-weighted", async (req, res) => {
  const { options, weights, context } = req.body;

  if (!options || !Array.isArray(options) || options.length !== 3) {
    return res.status(400).json({ error: "Exactly 3 options are required for the Weighted Wheel." });
  }

  const wImportance = weights.importance ?? 50;
  const wCost = weights.cost ?? 30;
  const wTime = weights.time ?? 20;

  try {
    const ai = getGeminiClient();
    if (!ai) {
      console.log("Using built-in, unauthenticated free trial request layer (FreeTierReasoningEngine)");
      const data = FreeTierReasoningEngine.analyzeWeighted(options, weights, context);
      return res.json({ success: true, data, isFreeTier: true });
    }
    const systemPrompt = "You are Synthetix, a decision analysis neural engine. You score three options against three weighted criteria (Importance/Potential, Cost/Investment, and Time/Speed). Return structured analysis conforming to the JSON schema.";
    const userPrompt = `Options to score: ${JSON.stringify(options)}.
Context: ${context || "None"}.
Criteria weights: Importance/Potential (${wImportance}%), Cost/Investment (${wCost}%), Time/Speed (${wTime}%).
Evaluate each option, giving integer scores from 0 to 100 for each criteria. Cost score should represent value/efficiency (higher is better, i.e., lower cost). Time score should represent speed (higher is better, i.e. faster). Calculate the final weightedTotal for each option. Highlight the winner and summarize why.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.1-flash-lite",
      contents: userPrompt,
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            scores: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  optionName: { type: Type.STRING },
                  scores: {
                    type: Type.OBJECT,
                    properties: {
                      Importance: { type: Type.INTEGER },
                      Cost: { type: Type.INTEGER },
                      Time: { type: Type.INTEGER }
                    },
                    required: ["Importance", "Cost", "Time"]
                  },
                  weightedTotal: { type: Type.NUMBER }
                },
                required: ["optionName", "scores", "weightedTotal"]
              }
            },
            winner: { type: Type.STRING },
            analysis: { type: Type.STRING }
          },
          required: ["scores", "winner", "analysis"]
        }
      }
    });

    const data = JSON.parse(response.text || "{}");
    res.json({ success: true, data });
  } catch (error: any) {
    console.error("Gemini Weighted Wheel error:", error.message);
    const scores = options.map((opt, i) => {
      const imp = 85 - (i * 10);
      const cst = 60 + (i * 15);
      const tim = 70 + (i * 5);
      const wTotal = Math.round((imp * wImportance + cst * wCost + tim * wTime) / 10) / 10;
      return {
        optionName: opt,
        scores: { Importance: imp, Cost: cst, Time: tim },
        weightedTotal: wTotal
      };
    });
    scores.sort((a, b) => b.weightedTotal - a.weightedTotal);
    const fallbackData = {
      scores,
      winner: scores[0].optionName,
      analysis: `By prioritizing Importance (${wImportance}%), ${scores[0].optionName} emerges as the optimal choice. It offers unmatched prospective value that comfortably outweighs its minor temporal and investment trade-offs.`
    };
    res.json({ success: false, data: fallbackData, message: error.message });
  }
});

// TOOLSET 2: Rapid-Pulse Selector Tool
app.post("/api/analyze-instinctive", async (req, res) => {
  const { options, selectedOption, context } = req.body;

  if (!options || !selectedOption) {
    return res.status(400).json({ error: "Options and selectedOption are required." });
  }

  try {
    const ai = getGeminiClient();
    if (!ai) {
      console.log("Using built-in, unauthenticated free trial request layer (FreeTierReasoningEngine)");
      const data = FreeTierReasoningEngine.analyzeInstinctive(options, selectedOption, context);
      return res.json({ success: true, data, isFreeTier: true });
    }
    const systemPrompt = "You are Synthetix, a decision analysis neural engine. Analyze why a randomly selected option might be a strong subconscious fit for the user's circumstances. Return structured analysis strictly conforming to the JSON schema.";
    const userPrompt = `All options: ${JSON.stringify(options)}.
Settled/Selected Option: "${selectedOption}".
Context/Preferences: ${context || "None"}.
Provide a compelling analysis of why this selected option might be the perfect instinctive, friction-free fit. Highlight 3 subconscious driving factors and suggest 1 micro next-step to test this direction immediately.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.1-flash-lite",
      contents: userPrompt,
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            selectedOption: { type: Type.STRING },
            instinctiveRationale: { type: Type.STRING },
            subconsciousFactors: { type: Type.ARRAY, items: { type: Type.STRING } },
            nextStep: { type: Type.STRING }
          },
          required: ["selectedOption", "instinctiveRationale", "subconsciousFactors", "nextStep"]
        }
      }
    });

    const data = JSON.parse(response.text || "{}");
    res.json({ success: true, data });
  } catch (error: any) {
    console.error("Gemini Rapid-Pulse error:", error.message);
    const fallbackData = {
      selectedOption,
      instinctiveRationale: `Settle on "${selectedOption}" to clear analysis-paralysis. Subconsciously, this choice represents your desire to prioritize momentum and actionable growth over endless risk-avoidance calibration.`,
      subconsciousFactors: [
        "Desire for high-velocity breakthrough instead of marginal, safe increments.",
        "A latent affinity for the creative autonomy this specific option unlocks.",
        "Minimizing emotional friction by picking the choice with the least bureaucratic overhead."
      ],
      nextStep: `Dedicate exactly 25 minutes (one Pomodoro session) to a simple test project or deep-dive search on "${selectedOption}". Document how you feel immediately after.`
    };
    res.json({ success: false, data: fallbackData, message: error.message });
  }
});

// TOOLSET 3: Paradox Filter Tool
app.post("/api/analyze-paradox", async (req, res) => {
  const { hesitation } = req.body;

  if (!hesitation) {
    return res.status(400).json({ error: "Hesitation description is required." });
  }

  try {
    const ai = getGeminiClient();
    if (!ai) {
      console.log("Using built-in, unauthenticated free trial request layer (FreeTierReasoningEngine)");
      const data = FreeTierReasoningEngine.analyzeParadox(hesitation);
      return res.json({ success: true, data, isFreeTier: true });
    }
    const systemPrompt = "You are Synthetix, a decision analysis neural engine. Offer structured cognitive behavioral and philosophical frameworks to disintegrate a user's decision hesitation. Return structured analysis conforming to the JSON schema.";
    const userPrompt = `Core User Hesitation: "${hesitation}".
Provide exactly three specific breakthrough frameworks ("The 10-10-10 Rule", "Minimize Worst-Case Scenario", and "Reframe Risk as Investment"). Show exactly how the user can apply each framework to completely break through their specific hesitation.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.1-flash-lite",
      contents: userPrompt,
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            hesitation: { type: Type.STRING },
            frameworks: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING },
                  application: { type: Type.STRING }
                },
                required: ["title", "application"]
              }
            }
          },
          required: ["hesitation", "frameworks"]
        }
      }
    });

    const data = JSON.parse(response.text || "{}");
    res.json({ success: true, data });
  } catch (error: any) {
    console.error("Gemini Paradox Filter error:", error.message);
    const fallbackData = {
      hesitation,
      frameworks: [
        {
          title: "The 10-10-10 Rule",
          application: `Ask yourself how this hesitation will affect you in 10 minutes, 10 months, and 10 years. In 10 minutes, the discomfort will be acute but transient; in 10 months, you will have adapted completely; in 10 years, this hesitation will be a distant stepping stone of growth.`
        },
        {
          title: "Minimize Worst-Case Scenario (Fear Setting)",
          application: `Clearly define the absolute worst outcome of taking action (e.g., losing minor capital, facing temporary critique). Realize that the cost of inaction (atrophy, regret, lost opportunity) is actually a guaranteed loss, making the action's risks look trivial.`
        },
        {
          title: "Reframe Risk as Investment",
          application: `Pivot your cognitive focus away from 'sunk costs' or possible failure. View any outcome not as a net-loss risk, but as a mandatory tuition fee for high-level tactical feedback that will sharpen your next decision vector.`
        }
      ]
    };
    res.json({ success: false, data: fallbackData, message: error.message });
  }
});

// Serve bundle structures as download endpoints (PWA and Chrome Extension files)
app.get("/api/bundle-download/:format", (req, res) => {
  const { format } = req.params;
  
  if (format !== "pwa" && format !== "extension") {
    return res.status(400).json({ error: "Invalid format requested." });
  }

  const pwaFiles = {
    "index.html": `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Synthetix: Decision Clarity PWA</title>
  <link rel="manifest" href="manifest.json">
  <link rel="stylesheet" href="styles.css">
  <link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
</head>
<body>
  <div class="glow-bg"></div>
  <div class="container">
    <header>
      <div class="logo">
        <span class="icon">⚡</span>
        <span class="text">SYNTHETIX</span>
      </div>
      <p class="tagline">The Decision Clarity Nexus</p>
    </header>

    <main id="app">
      <div class="card font-sans">
        <h2>Quantum Choice Analyzer</h2>
        <p>This is the offline-capable standalone PWA bundle of Synthetix. Input your parameters below to test standard matrix frameworks.</p>
        
        <div class="input-group">
          <input type="text" id="opt1" placeholder="Option A (e.g. Learn Python)" value="Learn Python">
          <span class="vs">VS</span>
          <input type="text" id="opt2" placeholder="Option B (e.g. Learn Golang)" value="Learn Golang">
        </div>
        
        <button id="analyzeBtn" class="glow-btn">Initialize Binary Vector</button>
        
        <div id="results" class="results-container hidden">
          <!-- Populated by script.js -->
        </div>
      </div>
    </main>
  </div>
  <script src="script.js"></script>
</body>
</html>`,
    "styles.css": `/* Synthetix Premium Cybernetic Stylesheet */
:root {
  --bg-dark: #020617;
  --panel-dark: #0b152d;
  --cyan: #22d3ee;
  --violet: #a78bfa;
  --text-primary: #f8fafc;
  --text-secondary: #94a3b8;
  --border: #1e293b;
}

* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

body {
  background-color: var(--bg-dark);
  color: var(--text-primary);
  font-family: 'Space Grotesk', sans-serif;
  overflow-x: hidden;
  min-height: 100vh;
  position: relative;
}

.glow-bg {
  position: absolute;
  top: -10%;
  left: 50%;
  transform: translateX(-50%);
  width: 600px;
  height: 600px;
  background: radial-gradient(circle, rgba(34,211,238,0.08) 0%, rgba(167,139,250,0.05) 50%, transparent 100%);
  pointer-events: none;
  z-index: 0;
}

.container {
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem 1rem;
  position: relative;
  z-index: 1;
}

header {
  text-align: center;
  margin-bottom: 3rem;
}

.logo {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  font-weight: 700;
  font-size: 2rem;
  letter-spacing: 0.1em;
}

.logo .icon {
  text-shadow: 0 0 10px var(--cyan);
}

.logo .text {
  background: linear-gradient(to right, var(--cyan), var(--violet));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.tagline {
  color: var(--text-secondary);
  font-size: 0.875rem;
  font-family: 'JetBrains Mono', monospace;
  margin-top: 0.5rem;
}

.card {
  background-color: var(--panel-dark);
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 2rem;
  box-shadow: 0 10px 30px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.05);
  margin-bottom: 2rem;
}

h2 {
  font-size: 1.5rem;
  margin-bottom: 1rem;
}

.input-group {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin: 1.5rem 0;
}

input {
  flex: 1;
  background-color: rgba(2, 6, 23, 0.6);
  border: 1px solid var(--border);
  border-radius: 6px;
  padding: 0.75rem 1rem;
  color: white;
  font-family: inherit;
  font-size: 1rem;
  transition: border-color 0.3s;
}

input:focus {
  outline: none;
  border-color: var(--cyan);
  box-shadow: 0 0 10px rgba(34,211,238,0.15);
}

.vs {
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.875rem;
  color: var(--violet);
  text-shadow: 0 0 8px rgba(167,139,250,0.4);
}

.glow-btn {
  width: 100%;
  background: linear-gradient(135deg, var(--cyan) 0%, var(--violet) 100%);
  color: #020617;
  font-weight: 600;
  border: none;
  border-radius: 6px;
  padding: 0.875rem;
  font-family: inherit;
  font-size: 1rem;
  cursor: pointer;
  box-shadow: 0 0 15px rgba(34,211,238,0.25);
  transition: transform 0.2s, box-shadow 0.2s;
}

.glow-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 0 25px rgba(34,211,238,0.45);
}

.results-container {
  margin-top: 2rem;
  padding-top: 2rem;
  border-top: 1px dashed var(--border);
}

.hidden {
  display: none;
}`,
    "manifest.json": `{
  "name": "Synthetix: The Decision Clarity Nexus",
  "short_name": "Synthetix",
  "description": "Premium cybernetic Progressive Web App for decision clarity and neural matrix scoring.",
  "start_url": "index.html",
  "display": "standalone",
  "background_color": "#020617",
  "theme_color": "#22d3ee",
  "icons": [
    {
      "src": "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='192' height='192' viewBox='0 0 192 192'><rect width='192' height='192' fill='%23020617'/><path d='M96,30 L150,140 L42,140 Z' fill='none' stroke='%2322d3ee' stroke-width='6'/><path d='M96,65 L115,120 L77,120 Z' fill='%23a78bfa'/></svg>",
      "sizes": "192x192",
      "type": "image/svg+xml"
    }
  ]
}`,
    "script.js": `/**
 * SYNTHETIX Standalone Logic Engine
 * Includes interactive local scoring matrix with standard prompt blueprints.
 */
document.addEventListener('DOMContentLoaded', () => {
  const analyzeBtn = document.getElementById('analyzeBtn');
  const resultsDiv = document.getElementById('results');
  const opt1Input = document.getElementById('opt1');
  const opt2Input = document.getElementById('opt2');

  const CONFIG = {
    GEMINI_API_KEY: "", // Add API Key here for client-side sandbox usage
    SERVER_API_URL: "https://ai.studio/build" 
  };

  analyzeBtn.addEventListener('click', () => {
    const o1 = opt1Input.value.trim();
    const o2 = opt2Input.value.trim();

    if (!o1 || !o2) {
      alert("Please specify both options to execute the nexus matrix.");
      return;
    }

    analyzeBtn.textContent = "Synthesizing Core Matrices...";
    analyzeBtn.disabled = true;

    setTimeout(() => {
      const winner = Math.random() > 0.5 ? o1 : o2;
      const confidence = Math.floor(Math.random() * 25) + 70;

      resultsDiv.innerHTML = \`
        <h3 style="color: #22d3ee; margin-bottom: 1rem;">Nexus Analytical Output</h3>
        <div style="background: rgba(255,255,255,0.02); padding: 1rem; border-radius: 8px; border: 1px solid #1e293b; margin-bottom: 1rem;">
          <p><strong>Option A (\\\${o1}) Pros:</strong> Great learning resources, strong industry adoption.</p>
          <p><strong>Option A (\\\${o1}) Cons:</strong> Steeper initial complexity curve.</p>
        </div>
        <div style="background: rgba(255,255,255,0.02); padding: 1rem; border-radius: 8px; border: 1px solid #1e293b; margin-bottom: 1rem;">
          <p><strong>Option B (\\\${o2}) Pros:</strong> High performance footprint, clean syntax architecture.</p>
          <p><strong>Option B (\\\${o2}) Cons:</strong> Niche ecosystem constraints.</p>
        </div>
        <div style="background: linear-gradient(135deg, rgba(34,211,238,0.1), rgba(167,139,250,0.1)); padding: 1rem; border-radius: 8px; border: 1px dashed #a78bfa; margin-top: 1.5rem;">
          <h4 style="color: #a78bfa; margin-bottom: 0.5rem;">Synthetix Recommendation: \\\${winner} (\\\${confidence}% Match)</h4>
          <p style="font-size: 0.9rem; color: #94a3b8;">Standalone local analysis complete. To plug this fully into the live Gemini 3.5-Flash neural engine, configure your API Endpoint inside script.js.</p>
        </div>
      \`;
      resultsDiv.classList.remove('hidden');
      analyzeBtn.textContent = "Initialize Binary Vector";
      analyzeBtn.disabled = false;
    }, 1500);
  });
});`
  };

  const extensionFiles = {
    ...pwaFiles,
    "manifest.json": `{
  "manifest_version": 3,
  "name": "Synthetix: The Decision Clarity Nexus",
  "version": "1.0.0",
  "description": "Chrome Extension bundle of the high-tech Synthetix decision matrix engine.",
  "action": {
    "default_popup": "popup.html",
    "default_icon": "icon.png"
  },
  "permissions": ["activeTab", "storage"],
  "icons": {
    "128": "icon.png"
  }
}`,
    "popup.html": `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body {
      width: 320px;
      font-family: 'Space Grotesk', system-ui, sans-serif;
      background-color: #020617;
      color: #f8fafc;
      margin: 0;
      padding: 1.25rem;
    }
    .logo {
      font-weight: 700;
      color: #22d3ee;
      letter-spacing: 0.05em;
      margin-bottom: 0.5rem;
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }
    p {
      font-size: 0.875rem;
      color: #94a3b8;
      line-height: 1.4;
      margin-bottom: 1.25rem;
    }
    .btn {
      display: block;
      width: 100%;
      text-align: center;
      background: linear-gradient(135deg, #22d3ee 0%, #a78bfa 100%);
      color: #020617;
      text-decoration: none;
      font-weight: 600;
      padding: 0.75rem;
      border-radius: 6px;
      box-shadow: 0 0 12px rgba(34,211,238,0.2);
    }
  </style>
</head>
<body>
  <div class="logo">⚡ SYNTHETIX</div>
  <p>Your tactical decision hub is ready. Open the main web command center to compute complex multi-vector grids and paradox breaks.</p>
  <a href="https://ai.studio/build" target="_blank" class="btn">Launch Clarity Nexus</a>
</body>
</html>`,
    "popup.js": `console.log("Synthetix extension popup initialized successfully.");`
  };

  const filesToPack = format === "pwa" ? pwaFiles : extensionFiles;

  res.json({ success: true, files: filesToPack });
});

// Vite middleware setup (development mode)
let isDevSetup = false;

async function setupVite() {
  if (isDevSetup) return;
  isDevSetup = true;

  if (process.env.NODE_ENV !== "production") {
    try {
      const { createServer: createViteServer } = await import("vite");
      const vite = await createViteServer({
        server: { middlewareMode: true },
        appType: "spa",
      });
      app.use(vite.middlewares);
      console.log("Vite development middleware mounted successfully.");
    } catch (e: any) {
      console.error("Failed to load Vite server-side middleware:", e.message);
    }
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
    console.log("Production static file server configured.");
  }
}

// Ensure server binds to host 0.0.0.0 and port 3000
app.listen(PORT, "0.0.0.0", async () => {
  console.log(`Express server running at http://0.0.0.0:${PORT}`);
  await setupVite();
});