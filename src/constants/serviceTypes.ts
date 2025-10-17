/**
 * 服务类型定义接口
 */
export interface ServiceType {
  Value: number
  Name: string
  DisplayName: string
  Description: string
}

/**
 * 云服务商服务类型映射表
 * 用于前端显示友好的中文名称和描述
 */
export const SERVICE_TYPE_MAP: { [provider: string]: ServiceType[] } = {
  "Aliyun": [
    {
      Value: 0,
      Name: "ECS",
      DisplayName: "云服务器 ECS",
      Description: "阿里云弹性计算服务，提供安全可靠的弹性计算服务",
    },
    {
      Value: 1,
      Name: "SWAS",
      DisplayName: "轻量应用服务器",
      Description: "阿里云轻量应用服务器，适合轻量级业务场景",
    },
  ],
  "TencentCloud": [
    {
      Value: 0,
      Name: "CVM",
      DisplayName: "云服务器 CVM",
      Description: "腾讯云云服务器，提供安全稳定的云端计算服务",
    },
    {
      Value: 1,
      Name: "Lighthouse",
      DisplayName: "轻量应用服务器",
      Description: "腾讯云轻量应用服务器，开箱即用的应用镜像",
    },
  ],
  "HuaweiCloud": [
    {
      Value: 0,
      Name: "ECS",
      DisplayName: "弹性云服务器/Flexus云服务",
      Description: "华为云弹性云服务器，提供多种规格的云服务器",
    },
  ],
}

/**
 * 根据云服务商和Value值获取服务类型显示名称
 * @param provider 云服务商标识
 * @param value 服务类型值
 * @returns 服务类型显示名称，如果没有找到则返回原始值
 */
export function getServiceTypeDisplayName(provider: string, value: number | string): string {
  const numValue = typeof value === 'string' ? parseInt(value, 10) : value
  
  if (isNaN(numValue)) {
    return String(value)
  }

  const serviceTypes = SERVICE_TYPE_MAP[provider]
  if (!serviceTypes) {
    return String(value)
  }

  const serviceType = serviceTypes.find(type => type.Value === numValue)
  return serviceType ? serviceType.Name : String(value)
}

/**
 * 根据云服务商和Value值获取服务类型完整信息
 * @param provider 云服务商标识
 * @param value 服务类型值
 * @returns 服务类型信息，如果没有找到则返回null
 */
export function getServiceTypeInfo(provider: string, value: number | string): ServiceType | null {
  const numValue = typeof value === 'string' ? parseInt(value, 10) : value
  
  if (isNaN(numValue)) {
    return null
  }

  const serviceTypes = SERVICE_TYPE_MAP[provider]
  if (!serviceTypes) {
    return null
  }

  return serviceTypes.find(type => type.Value === numValue) || null
}

/**
 * 获取指定云服务商的所有服务类型
 * @param provider 云服务商标识
 * @returns 服务类型数组，如果没有找到则返回空数组
 */
export function getProviderServiceTypes(provider: string): ServiceType[] {
  return SERVICE_TYPE_MAP[provider] || []
}

/**
 * 检查云服务商是否支持指定的服务类型
 * @param provider 云服务商标识
 * @param value 服务类型值
 * @returns 是否支持
 */
export function isServiceTypeSupported(provider: string, value: number | string): boolean {
  return getServiceTypeInfo(provider, value) !== null
}

/**
 * 获取所有支持的云服务商列表（有服务类型映射的）
 * @returns 云服务商标识数组
 */
export function getSupportedProviders(): string[] {
  return Object.keys(SERVICE_TYPE_MAP)
}