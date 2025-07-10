/// <reference types="@capacitor/health" />

declare module '@capacitor/health' {
  export interface HealthPlugin {
    isAvailable(): Promise<{ value: boolean }>;
    
    requestAuthorization(requested: {
      read: string[];
      write?: string[];
    }): Promise<{ value: string }>;
    
    query<T = any>(options: {
      startDate: string;
      endDate: string;
      dataType: string;
      limit?: number;
      unit?: string;
    }): Promise<{ value: T }>;
  }

  const Health: HealthPlugin;
  
  export { Health };
}
