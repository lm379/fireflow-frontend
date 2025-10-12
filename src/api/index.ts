import axios from 'axios';

const apiClient = axios.create({
  baseURL: '/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Generic API response type
export interface ApiResponse<T> {
  code: number;
  data: T;
  message: string;
}

// Firewall Rule types
export interface FirewallRule {
  ID: number;
  remark: string;
  provider: string;
  instance_id: string;
  port: string;
  protocol: string;
  last_ip: string;
  enabled: boolean;
  UpdatedAt: string;
  cloud_config_id: number;
}

// Cloud Config types
export interface CloudConfig {
  ID: number;
  provider: string;
  region: string;
  instance_id: string;
  secret_id: string;
  description: string;
  is_default: boolean;
  is_enabled: boolean;
  project_id?: string;
  CreatedAt: string;
}

// System Config types
export interface SystemConfig {
  ip_fetch_url: string;
  ip_check_interval: number;
  cron_enabled: string;
}

// Execute Rule Response types
export interface ExecuteRuleResponse {
  cloud_ip: string;
  current_ip: string;
  ip_changed: boolean;
  message: string;
  status: 'unchanged' | 'updated' | 'error';
}

// API functions

// Firewall Rules
export const getRules = () => apiClient.get<FirewallRule[]>('/rules/');
export const addRule = (rule: Omit<FirewallRule, 'ID' | 'UpdatedAt' | 'last_ip' | 'provider' | 'instance_id'>) => apiClient.post('/rules/', rule);
export const updateRule = (id: number, rule: FirewallRule) => apiClient.put(`/rules/${id}`, rule);
export const deleteRule = (id: number) => apiClient.delete(`/rules/${id}`);
export const executeRule = (id: number): Promise<ApiResponse<ExecuteRuleResponse>> => 
  apiClient.post(`/rules/${id}/execute`);

// Cloud Configs
export const getCloudConfigs = () => apiClient.get<CloudConfig[]>('/cloud-configs/');
export const addCloudConfig = (config: Omit<CloudConfig, 'ID' | 'CreatedAt'>) => apiClient.post('/cloud-configs/', config);
export const updateCloudConfig = (id: number, config: Partial<CloudConfig>) => apiClient.put(`/cloud-configs/${id}`, config);
export const deleteCloudConfig = (id: number) => apiClient.delete(`/cloud-configs/${id}`);
export const testCloudConfig = (id: number) => apiClient.post(`/cloud-configs/${id}/test`);
export const getProviders = () => apiClient.get<ApiResponse<string[]>>('/providers');
export const getRegions = (provider: string) => apiClient.get<ApiResponse<{code: string, name: string}[]>>(`/regions?provider=${provider}`);
export const searchRegions = (provider: string, keyword: string) => apiClient.get<ApiResponse<{code: string, name: string}[]>>(`/regions/search?provider=${provider}&keyword=${keyword}`);


// System Config
export const getSystemConfig = () => apiClient.get<SystemConfig>('/system-config/');
export const saveSystemConfig = (config: SystemConfig) => apiClient.put('/system-config/', config);

// Other
export const syncIPNow = () => apiClient.post('/sync-ip/');
export const getCurrentIP = () => apiClient.get<{current_ip: string}>('/current-ip/');
