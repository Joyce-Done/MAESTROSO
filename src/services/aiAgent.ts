import { Habit, PianoSong } from '../types';

export interface AgentAction {
  type:
    | 'TOGGLE_HABIT'
    | 'LOG_PRACTICE'
    | 'ADD_SONG'
    | 'CREATE_HABIT'
    | 'SET_DAILY_GOAL'
    | 'SET_BEGINNER_ROUTINE'
    | 'REORDER_HABIT'
    | 'DELETE_HABIT'
    | 'SET_ROUTINE_HABIT';
  payload: any;
}

export interface AgentResponse {
  success: boolean;
  reply: string;
  actions: AgentAction[];
}

export interface MessageItem {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  actionsExecuted?: AgentAction[];
}

export async function sendAgentMessage(
  message: string,
  habits: Habit[],
  songs: PianoSong[],
  todayDate: string
): Promise<AgentResponse> {
  try {
    const res = await fetch('/api/agent/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message,
        habits,
        songs,
        todayDate,
      }),
    });

    if (!res.ok) {
      throw new Error(`Server returned ${res.status}`);
    }

    const data = await res.json();
    return data;
  } catch (error) {
    console.error('Agent chat fetch error:', error);
    // Fallback response
    return {
      success: false,
      reply: "I had trouble connecting to the server. Please try again or check your internet connection.",
      actions: [],
    };
  }
}
