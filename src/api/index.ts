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
  type?: string;
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
  apiClient.patch(`/rules/${id}`, { action: 'execute' });

// Cloud Configs
export const getCloudConfigs = () => apiClient.get<CloudConfig[]>('/cloud-configs/');
export const addCloudConfig = (config: Omit<CloudConfig, 'ID' | 'CreatedAt'>) => apiClient.post('/cloud-configs/', config);
export const updateCloudConfig = (id: number, config: Partial<CloudConfig>) => apiClient.put(`/cloud-configs/${id}`, config);
export const deleteCloudConfig = (id: number) => apiClient.delete(`/cloud-configs/${id}`);
export const testCloudConfig = (id: number) => apiClient.post(`/cloud-configs/${id}/actions`, { action: 'test' });
export const getProviders = () => apiClient.get<ApiResponse<string[]>>('/providers');
export const getRegions = (provider: string) => apiClient.get<ApiResponse<{code: string, name: string}[]>>(`/regions/?provider=${provider}`);
export const searchRegions = (provider: string, keyword: string) => apiClient.get<ApiResponse<{code: string, name: string}[]>>(`/regions/?provider=${provider}&search=${keyword}`);
export const getServiceTypes = (provider: string) => apiClient.get<ApiResponse<any[]>>(`/providers/${provider}/service-types`);
export const getServiceTypeDetail = (provider: string, type: string) => apiClient.get<ApiResponse<{value: number, name: string, display_name: string, description: string}>>(`/providers/${provider}/service-types/${type}`);
export const getServiceTypeByValue = (provider: string, value: number) => apiClient.get<ApiResponse<{value: number, name: string, display_name: string, description: string}>>(`/providers/${provider}/service-types/${value}`);


// System Config
export const getSystemConfig = () => apiClient.get<SystemConfig>('/system/config');
export const saveSystemConfig = (config: SystemConfig) => apiClient.put('/system/config', config);
export const getConfigs = (category: string) => apiClient.get<any>(`/configs/?category=${category}`);
export const getConfig = (key: string) => apiClient.get<{key: string, value: string}>(`/configs/${key}`);
export const setConfig = (key: string, value: string, type?: string, category?: string, description?: string) => 
  apiClient.put(`/configs/${key}`, { value, type, category, description });

// System IP Management
export const syncIPNow = () => apiClient.post('/system/ip/sync');
export const getCurrentIP = () => apiClient.get<{current_ip: string, success: boolean}>('/system/ip/current');
