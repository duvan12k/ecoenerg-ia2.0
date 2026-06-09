export interface Zone {
  name: string;
  category: "Efficient" | "Normal" | "Critical" | "Generating" | "Moderate";
  normalPower: number;
  optimizedPower: number;
  isOptimized: boolean;
  activeDevices: number;
}

export interface DashboardState {
  currentConsumption: number;
  peakToday: number;
  estDaily: number;
  gridStatus: "STABLE" | "HIGH_DEMAND" | "PEAK_ALERT";
  renewablePercentage: number;
  currentSavings: number;
  efficiency: number;
  activeSensors: number;
  totalSensors: number;
  zones: Record<string, Zone>;
}

export interface ChatMessage {
  id: string;
  sender: "user" | "ai";
  text: string;
  timestamp: Date;
}
