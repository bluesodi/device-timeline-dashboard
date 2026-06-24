export interface MetricPoint {
  timestamp: number;
  value: number;
}

export interface MetricData {
  id: string;
  name: string;
  unit: string;
  points: MetricPoint[];
  maxValue: number;
  isAlert?: boolean;
  color?: string;
}

export interface DeviceInfo {
  name: string;
  model: string;
  os: string;
  osVersion: string;
  eventTime: string;
  detail?: DeviceDetailExtra;
}

export interface DeviceDetailExtra {
  ipAddress: string;
  macAddress: string;
  cpuCores: string;
  totalMemory: string;
  diskTotal: string;
  biosVersion: string;
  lastBootTime: string;
  agentVersion: string;
}

export interface TimeRangeOption {
  label: string;
  value: string;
}

export interface TimeGranularityOption {
  label: string;
  value: number;
}

/* ---- Metric Config Models ---- */

export interface MetricOption {
  id: string;
  name: string;
  selected: boolean;
}

export interface AppOption {
  id: string;
  name: string;
  version?: string;
  selected: boolean;
}

export interface MetricConfig {
  deviceMetrics: MetricOption[];
  appMetrics: MetricOption[];
  appMode: 'top10' | 'custom';
  selectedApps: string[];
}

export interface AppMetricGroup {
  appId: string;
  appName: string;
  appVersion: string;
  metrics: MetricData[]; // app-cpu, app-memory, handles, threads
  isExpanded: boolean;
}

export interface MetricConfigState {
  deviceMetrics: MetricOption[];
  appMetrics: MetricOption[];
  appMode: 'top10' | 'custom';
  availableApps: AppOption[];
}