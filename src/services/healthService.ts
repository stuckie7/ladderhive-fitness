import { Health } from '@capacitor/health';
import { supabase } from '@/lib/supabase';

type HealthDataType = 'steps' | 'workouts' | 'heart_rate' | 'active_energy' | 'sleep';

export interface HealthDataPoint {
  value: number;
  unit: string;
  start_date: string;
  end_date: string;
  data_type: string;
}

export class HealthService {
  static async isAvailable(): Promise<boolean> {
    try {
      const available = await Health.isAvailable();
      return available.value;
    } catch {
      return false;
    }
  }

  static async requestPermissions(): Promise<boolean> {
    try {
      const permissions = await Health.requestAuthorization({
        read: ['steps', 'workouts', 'heart_rate', 'active_energy', 'sleep'],
        write: []
      });
      return permissions === 'granted';
    } catch (error) {
      console.error('Error requesting health permissions:', error);
      return false;
    }
  }

  static async syncHealthData(userId: string, daysBack = 7): Promise<boolean> {
    try {
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(endDate.getDate() - daysBack);

      // Sync different types of health data
      const [steps, workouts] = await Promise.all([
        this.queryData({ 
          dataType: 'steps', 
          startDate, 
          endDate,
          unit: 'count'
        }),
        this.queryData({ 
          dataType: 'workouts', 
          startDate, 
          endDate 
        })
      ]);

      // Combine all data
      const allData = [
        ...steps.map(d => ({ ...d, data_type: 'steps' })),
        ...workouts.map(d => ({ ...d, data_type: 'workouts' }))
      ];

      // Insert or update in Supabase
      const { error } = await supabase
        .from('health_data')
        .upsert(
          allData.map(item => ({
            user_id: userId,
            data_type: item.data_type,
            value: item.value,
            unit: item.unit,
            start_date: item.start_date,
            end_date: item.end_date,
            source: 'health'
          })),
          { onConflict: 'user_id,data_type,start_date,end_date' }
        );

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error syncing health data:', error);
      throw error;
    }
  }

  private static async queryData(options: {
    dataType: HealthDataType;
    startDate: Date;
    endDate: Date;
    unit?: string;
  }): Promise<HealthDataPoint[]> {
    try {
      const result = await Health.query({
        startDate: options.startDate.toISOString(),
        endDate: options.endDate.toISOString(),
        dataType: options.dataType,
        unit: options.unit
      });

      if ('value' in result) {
        return result.value.map((sample: any) => ({
          value: sample.value,
          unit: sample.unit,
          start_date: sample.startDate,
          end_date: sample.endDate,
          data_type: options.dataType
        }));
      }

      return [];
    } catch (error) {
      console.error(`Error querying ${options.dataType}:`, error);
      return [];
    }
  }
}
