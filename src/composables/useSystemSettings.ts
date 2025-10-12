import { ref } from 'vue'
import { ElMessage } from 'element-plus'
import { getSystemConfig, saveSystemConfig, syncIPNow, getCurrentIP } from '../api'
import type { SystemConfig } from '../api'

// 使用系统设置的组合式函数
export function useSystemSettings() {
  const form = ref<SystemConfig>({
    ip_fetch_url: '',
    ip_check_interval: 5,
    cron_enabled: 'true',
  })

  const currentIP = ref('获取中...')
  const loading = ref(false)

  // 获取系统配置
  const fetchSystemConfig = async () => {
    try {
      loading.value = true
      const response = await getSystemConfig()
      form.value = response.data
    } catch (error) {
      ElMessage.error('获取系统配置失败')
    } finally {
      loading.value = false
    }
  }

  // 获取当前IP
  const fetchCurrentIP = async () => {
    try {
      const response = await getCurrentIP()
      currentIP.value = response.data.current_ip
    } catch (error) {
      currentIP.value = '获取失败'
      ElMessage.error('获取当前IP失败')
    }
  }

  // 保存系统设置
  const onSubmit = async () => {
    try {
      loading.value = true
      await saveSystemConfig(form.value)
      ElMessage.success('系统设置保存成功')
    } catch (error) {
      ElMessage.error('保存系统设置失败')
    } finally {
      loading.value = false
    }
  }

  // 立即同步IP
  const handleSyncIP = async () => {
    try {
      loading.value = true
      const response = await syncIPNow()
      ElMessage.success(response.data.message)
      await fetchCurrentIP()
    } catch (error) {
      ElMessage.error('同步IP失败')
    } finally {
      loading.value = false
    }
  }

  // 验证IP获取URL格式
  const validateIPFetchUrl = (url: string): boolean => {
    try {
      new URL(url)
      return url.startsWith('http://') || url.startsWith('https://')
    } catch {
      return false
    }
  }

  // 验证表单
  const validateForm = (): boolean => {
    if (!form.value.ip_fetch_url) {
      ElMessage.error('请输入IP获取服务URL')
      return false
    }

    if (!validateIPFetchUrl(form.value.ip_fetch_url)) {
      ElMessage.error('请输入有效的URL地址')
      return false
    }

    if (form.value.ip_check_interval < 1) {
      ElMessage.error('IP检查间隔必须大于0分钟')
      return false
    }

    return true
  }

  // 提交前验证
  const onSubmitWithValidation = async () => {
    if (!validateForm()) return
    await onSubmit()
  }

  // 重置表单到默认值
  const resetForm = () => {
    form.value = {
      ip_fetch_url: 'https://4.ipw.cn',
      ip_check_interval: 5,
      cron_enabled: 'true',
    }
  }

  // 初始化数据
  const initData = () => {
    fetchSystemConfig()
    fetchCurrentIP()
  }

  return {
    // 响应式数据
    form,
    currentIP,
    loading,
    
    // 方法
    fetchSystemConfig,
    fetchCurrentIP,
    onSubmit: onSubmitWithValidation,
    handleSyncIP,
    resetForm,
    initData,
    validateIPFetchUrl,
  }
}