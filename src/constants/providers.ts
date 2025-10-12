/**
 * 云服务商中英文映射表
 * 用于在界面上显示友好的中文名称
 */
export const PROVIDER_DISPLAY_MAP: { [key: string]: string } = {
  // 腾讯云
  'TencentCloud': '腾讯云',
  'TencentCloudInternational': '腾讯云国际站',
  
  // 阿里云
  'Aliyun': '阿里云',
  'AliyunInternational': '阿里云国际站',
  
  // 华为云
  'HuaweiCloud': '华为云',
  
  // 亚马逊云
  'AWS': '亚马逊云',
  'AWSCN': '亚马逊云中国',
  
  // 谷歌云
  'GoogleCloud': '谷歌云',
  
  // 微软云
  'Azure': '微软云',
  'AzureCN': '微软云中国',
  
  // 百度云
  'BaiduCloud': '百度云',
  
  // 火山引擎
  'VolcanoEngine': '火山引擎',
  
  // UCloud
  'UCloud': 'UCloud',
  
  // 青云
  'QingCloud': '青云',
  
  // 京东云
  'JDCloud': '京东云',
  
  // 金山云
  'KingsoftCloud': '金山云',
  
  // 七牛云
  'Qiniu': '七牛云',
  
  // 又拍云
  'UPYUN': '又拍云',
  
  // 网宿科技
  'Wangsu': '网宿科技',
  
  // 其他国际云服务商
  'DigitalOcean': 'DigitalOcean',
  'Vultr': 'Vultr',
  'Linode': 'Linode',
  'Oracle': '甲骨文云',
  'IBM': 'IBM云',
}

/**
 * 获取云服务商的显示名称
 * @param provider 云服务商英文标识
 * @returns 云服务商中文显示名称，如果没有映射则返回原始值
 */
export function getProviderDisplayName(provider: string): string {
  return PROVIDER_DISPLAY_MAP[provider] || provider
}

/**
 * 获取所有支持的云服务商列表
 * @returns 云服务商映射对象数组
 */
export function getAllProviders(): Array<{ key: string; name: string; displayName: string }> {
  return Object.entries(PROVIDER_DISPLAY_MAP).map(([key, displayName]) => ({
    key,
    name: key,
    displayName,
  }))
}

/**
 * 根据显示名称获取云服务商标识
 * @param displayName 显示名称
 * @returns 云服务商英文标识，如果没有找到则返回原始值
 */
export function getProviderKeyByDisplayName(displayName: string): string {
  const entry = Object.entries(PROVIDER_DISPLAY_MAP).find(([, name]) => name === displayName)
  return entry ? entry[0] : displayName
}

/**
 * 检查是否为支持的云服务商
 * @param provider 云服务商标识
 * @returns 是否支持
 */
export function isSupportedProvider(provider: string): boolean {
  return provider in PROVIDER_DISPLAY_MAP
}
