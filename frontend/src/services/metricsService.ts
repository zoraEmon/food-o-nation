import axios from 'axios';

const API_URL = 'http://localhost:5000/api/metrics';

export interface AppMetrics {
  totalFamilies: number;
  mealsDistributed: number;
  activePrograms: number;
  communityImpactPercentage: number;
}

export interface MetricsResponse {
  success: boolean;
  data: AppMetrics;
}

export const getAppMetrics = async (): Promise<AppMetrics> => {
  try {
    const response = await axios.get<MetricsResponse>(API_URL);
    return response.data.data;
  } catch (error) {
    console.error('Error fetching app metrics:', error);
    throw error;
  }
};
