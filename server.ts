import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

// Lazy or safe GenAI initialization
function getGenAIClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return null;
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Health check endpoint
  app.get("/api/health", (_req, res) => {
    res.json({ status: "ok", time: new Date().toISOString() });
  });

  // AI Agent Endpoint
  app.post("/api/agent/chat", async (req, res) => {
    try {
      const { message, habits = [], songs = [], todayDate } = req.body;

      if (!message || typeof message !== "string") {
        return res.status(400).json({ error: "Message is required" });
      }

      const clientDate = todayDate || new Date().toISOString().split("T")[0];
      const ai = getGenAIClient();

      if (!ai) {
        // Fallback local rule-based intent parser if no API key is provided
        const fallbackResult = parseMessageLocally(message, habits, songs, clientDate);
        return res.json(fallbackResult);
      }

      const habitsContext = habits.map((h: any) => ({
        id: h.id,
        name: h.name,
        category: h.category,
      }));

      const songsContext = songs.map((s: any) => ({
        id: s.id,
        title: s.title,
        composerOrHymnNumber: s.composerOrHymnNumber,
        category: s.category,
        currentBpm: s.currentBpm,
      }));

      const systemInstruction = `You are an intelligent, friendly, and precise personal AI Assistant for a Habit & Piano Practice Tracker app.
The user is speaking or typing to you to:
1. Log piano practice time or drills (e.g. "I practiced Great Is Thy Faithfulness for 25 minutes at 76 bpm", "Log 30 mins for Clair de Lune", "I played hymn 139 for 15 mins")
2. Add a new hymn or piano piece/song (e.g. "Add hymn 'Be Thou My Vision' number 210 in Eb", "Add classical piece Moonlight Sonata 3rd Movement")
3. Mark habits as complete or incomplete for today (e.g. "Mark daily prayer and morning workout as done", "Completed 1 chapter of Psalms", "Check off daily piano practice")
4. Create a new habit (e.g. "Create a habit to drink 8 glasses of water daily", "Add a habit: Memorize 1 Bible verse")
5. Set Daily Habit Goal (e.g. "Set my daily habit goal to 6", "Change daily goal target to 4 habits per day")
6. Set for Beginners / Routine Presets (e.g. "Set up the beginner routine", "Switch to beginner mode")
7. Reorder habits 1-20 (e.g. "Move piano practice to #1", "Set devotional to position 2")
8. Set routine status (e.g. "Mark reading as a morning routine habit")
9. Answer questions or give encouraging summaries about their progress.

Today's date is: ${clientDate}.

Available Habits in user's app:
${JSON.stringify(habitsContext, null, 2)}

Available Piano Pieces/Hymns in user's app:
${JSON.stringify(songsContext, null, 2)}

Your response MUST be in JSON format matching the schema provided.
Always fuzzy match habit names (e.g., "prayer", "devotion" -> matches habit with devotion/prayer; "scripture", "Bible" -> matches Bible reading; "piano" -> matches Piano practice).
Always fuzzy match song titles or hymn numbers (e.g. "Great Is Thy Faithfulness" or "139", "It Is Well" or "493", "Survey" -> "When I Survey the Wondrous Cross", "Clair de Lune", "Nocturne").

If you detect any actions, return them in the "actions" array.
Action types allowed:
- 'TOGGLE_HABIT': payload { habitId, habitName, completed, date }
- 'LOG_PRACTICE': payload { songId, songTitle, durationMinutes, tempoAchievedBpm, notes, rating, date }
- 'ADD_SONG': payload { title, composerOrHymnNumber, category, keySignature, targetBpm, difficulty }
- 'CREATE_HABIT': payload { name, description, frequency, unit, targetCount, color, order, isRoutine, routineTime, difficulty }
- 'SET_DAILY_GOAL': payload { goal: number (1-20) }
- 'SET_BEGINNER_ROUTINE': payload { mode: 'replace' | 'append' }
- 'REORDER_HABIT': payload { habitId, habitName, targetOrder: number (1-20) }
- 'DELETE_HABIT': payload { habitId, habitName }
- 'SET_ROUTINE_HABIT': payload { habitId, habitName, isRoutine: boolean, routineTime?: 'morning' | 'afternoon' | 'evening' | 'anytime' }

Be warm, encouraging, concise, and confirm exactly what was updated or logged in the "reply" string.`;

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: message,
        config: {
          systemInstruction,
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              reply: {
                type: Type.STRING,
                description: "Conversational, encouraging confirmation response to the user.",
              },
              actions: {
                type: Type.ARRAY,
                description: "List of actionable changes to execute in the app state.",
                items: {
                  type: Type.OBJECT,
                  properties: {
                    type: {
                      type: Type.STRING,
                      description: "Action type: 'TOGGLE_HABIT', 'LOG_PRACTICE', 'ADD_SONG', 'CREATE_HABIT', 'SET_DAILY_GOAL', 'SET_BEGINNER_ROUTINE', 'REORDER_HABIT', 'DELETE_HABIT', 'SET_ROUTINE_HABIT'",
                    },
                    payload: {
                      type: Type.OBJECT,
                      description: "Payload for the action",
                      properties: {
                        // For TOGGLE_HABIT
                        habitId: { type: Type.STRING },
                        habitName: { type: Type.STRING },
                        completed: { type: Type.BOOLEAN },
                        date: { type: Type.STRING },

                        // For LOG_PRACTICE
                        songId: { type: Type.STRING },
                        songTitle: { type: Type.STRING },
                        durationMinutes: { type: Type.NUMBER },
                        tempoAchievedBpm: { type: Type.NUMBER },
                        notes: { type: Type.STRING },
                        rating: { type: Type.NUMBER },

                        // For ADD_SONG
                        title: { type: Type.STRING },
                        composerOrHymnNumber: { type: Type.STRING },
                        category: { type: Type.STRING },
                        keySignature: { type: Type.STRING },
                        targetBpm: { type: Type.NUMBER },
                        difficulty: { type: Type.STRING },

                        // For CREATE_HABIT
                        name: { type: Type.STRING },
                        description: { type: Type.STRING },
                        frequency: { type: Type.STRING },
                        unit: { type: Type.STRING },
                        targetCount: { type: Type.NUMBER },
                        color: { type: Type.STRING },
                        order: { type: Type.NUMBER },
                        isRoutine: { type: Type.BOOLEAN },
                        routineTime: { type: Type.STRING },

                        // For SET_DAILY_GOAL
                        goal: { type: Type.NUMBER },

                        // For REORDER_HABIT
                        targetOrder: { type: Type.NUMBER },
                      },
                    },
                  },
                  required: ["type", "payload"],
                },
              },
            },
            required: ["reply", "actions"],
          },
        },
      });

      const responseText = response.text || "{}";
      const parsed = JSON.parse(responseText);

      return res.json({
        success: true,
        reply: parsed.reply || "I've processed your request!",
        actions: parsed.actions || [],
      });
    } catch (err: any) {
      console.error("AI Agent Error:", err);
      // Fallback to local parsing on any API failure so user is never stranded
      const fallbackResult = parseMessageLocally(
        req.body?.message || "",
        req.body?.habits || [],
        req.body?.songs || [],
        req.body?.todayDate || new Date().toISOString().split("T")[0]
      );
      return res.json(fallbackResult);
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
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Habit & Piano Practice server running on http://0.0.0.0:${PORT}`);
  });
}

// Local smart fallback parser when offline or when API key isn't provided
function parseMessageLocally(message: string, habits: any[], songs: any[], clientDate: string) {
  const lower = message.toLowerCase();
  const actions: any[] = [];
  let replyParts: string[] = [];

  // Check for practice logging: e.g. "practiced Great Is Thy Faithfulness for 20 mins", "log 15 minutes for Clair de Lune"
  const durationMatch = lower.match(/(\d+)\s*(?:mins|minutes|min|m\b)/i);
  const duration = durationMatch ? parseInt(durationMatch[1], 10) : 20;

  // BPM match: e.g. "at 72 bpm"
  const bpmMatch = lower.match(/(?:at|tempo|bpm)\s*(\d+)\s*(?:bpm)?/i);
  const bpm = bpmMatch ? parseInt(bpmMatch[1], 10) : undefined;

  let matchedSong = songs.find((s) => lower.includes(s.title.toLowerCase()));
  if (!matchedSong) {
    // Check keywords
    if (lower.includes("faithfulness") || lower.includes("139")) {
      matchedSong = songs.find((s) => s.title.includes("Faithfulness"));
    } else if (lower.includes("it is well") || lower.includes("493")) {
      matchedSong = songs.find((s) => s.title.includes("It Is Well"));
    } else if (lower.includes("how great") || lower.includes("77")) {
      matchedSong = songs.find((s) => s.title.includes("How Great"));
    } else if (lower.includes("clair de lune")) {
      matchedSong = songs.find((s) => s.title.includes("Clair"));
    } else if (lower.includes("nocturne")) {
      matchedSong = songs.find((s) => s.title.includes("Nocturne"));
    } else if (lower.includes("wondrous cross") || lower.includes("survey")) {
      matchedSong = songs.find((s) => s.title.includes("Survey"));
    }
  }

  if (lower.includes("practice") || lower.includes("played") || lower.includes("drilled") || lower.includes("log")) {
    if (matchedSong) {
      actions.push({
        type: "LOG_PRACTICE",
        payload: {
          songId: matchedSong.id,
          songTitle: matchedSong.title,
          durationMinutes: duration,
          tempoAchievedBpm: bpm || matchedSong.currentBpm || 72,
          notes: "Logged via AI Voice Assistant",
          rating: 4,
          date: clientDate,
        },
      });
      replyParts.push(`Logged ${duration} minutes of practice for "${matchedSong.title}"${bpm ? ` at ${bpm} BPM` : ""}.`);
    }
  }

  // Check for habit completions: e.g. "mark devotion as done", "completed Bible reading", "check off workout"
  habits.forEach((h) => {
    const habitLower = h.name.toLowerCase();
    const isKeywordInMessage =
      lower.includes(habitLower) ||
      (habitLower.includes("devotion") && (lower.includes("devotion") || lower.includes("prayer"))) ||
      (habitLower.includes("bible") && (lower.includes("bible") || lower.includes("scripture") || lower.includes("psalm"))) ||
      (habitLower.includes("piano") && (lower.includes("piano practice") || lower.includes("practiced piano"))) ||
      (habitLower.includes("water") && lower.includes("water")) ||
      (habitLower.includes("exercise") && (lower.includes("workout") || lower.includes("gym") || lower.includes("exercise")));

    if (isKeywordInMessage) {
      const isUnchecking = lower.includes("uncheck") || lower.includes("incomplete") || lower.includes("not done");
      actions.push({
        type: "TOGGLE_HABIT",
        payload: {
          habitId: h.id,
          habitName: h.name,
          completed: !isUnchecking,
          date: clientDate,
        },
      });
      replyParts.push(`Marked "${h.name}" as ${isUnchecking ? "incomplete" : "completed"} for today.`);
    }
  });

  // Check for adding new song or hymn: e.g. "add hymn Be Thou My Vision #210"
  if (lower.includes("add hymn") || lower.includes("add song") || lower.includes("add piece")) {
    const titleMatch = message.match(/(?:add hymn|add song|add piece)\s+["']?([^"'\n,]+)["']?/i);
    const title = titleMatch ? titleMatch[1].trim() : "New Song";
    const isHymn = lower.includes("hymn");

    actions.push({
      type: "ADD_SONG",
      payload: {
        title,
        composerOrHymnNumber: isHymn ? "Hymn Selection" : "Standard",
        category: isHymn ? "hymn" : "classical",
        keySignature: "C Major",
        targetBpm: 80,
        difficulty: "Intermediate",
      },
    });
    replyParts.push(`Added "${title}" to your repertoire.`);
  }

  // Check for goal setting: e.g. "set daily goal to 6", "goal 4 habits"
  const goalMatch = lower.match(/(?:set\s+)?(?:daily\s+)?goal\s+(?:to\s+)?(\d+)/i);
  if (goalMatch) {
    const goalNum = Math.min(20, Math.max(1, parseInt(goalMatch[1], 10)));
    actions.push({
      type: "SET_DAILY_GOAL",
      payload: { goal: goalNum },
    });
    replyParts.push(`Updated your daily habit goal to ${goalNum} tasks per day.`);
  }

  // Check for beginner routine: e.g. "set for beginners", "beginner routine", "beginner mode"
  if (lower.includes("beginner") && (lower.includes("set") || lower.includes("routine") || lower.includes("mode") || lower.includes("starter"))) {
    actions.push({
      type: "SET_BEGINNER_ROUTINE",
      payload: { mode: "replace" },
    });
    replyParts.push("Applied the Beginner Starter Routine with gentle 1-5 habits and a 4-task daily goal.");
  }

  // Check for reordering: e.g. "move piano to #1", "move water to position 2"
  const reorderMatch = lower.match(/move\s+(.+?)\s+(?:to\s+)?(?:#|position\s+|rank\s+)?(\d+)/i);
  if (reorderMatch) {
    const habitQuery = reorderMatch[1].trim().toLowerCase();
    const targetOrder = Math.min(20, Math.max(1, parseInt(reorderMatch[2], 10)));
    const matched = habits.find((h) => h.name.toLowerCase().includes(habitQuery));
    if (matched) {
      actions.push({
        type: "REORDER_HABIT",
        payload: {
          habitId: matched.id,
          habitName: matched.name,
          targetOrder,
        },
      });
      replyParts.push(`Moved "${matched.name}" to position #${targetOrder}.`);
    }
  }

  if (replyParts.length === 0) {
    replyParts.push("I received your message! You can tell me to log practice time, complete habits, adjust daily goals (1-20), or set beginner routines.");
  }

  return {
    success: true,
    reply: replyParts.join(" "),
    actions,
  };
}

startServer();
