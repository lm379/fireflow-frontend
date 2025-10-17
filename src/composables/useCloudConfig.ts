import { ref, computed } from 'vue'
import dayjs from 'dayjs'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  getCloudConfigs,
  addCloudConfig,
  updateCloudConfig,
  deleteCloudConfig,
  testCloudConfig,
  getProviders,
  getRegions
} from '../api'
import type { CloudConfig } from '../api'
import { getProviderDisplayName } from '../constants/providers'
import {
  getServiceTypeDisplayName as getServiceTypeDisplayNameFromMap,
  getProviderServiceTypes,
  type ServiceType
} from '../constants/serviceTypes'

// 格式化日期
export const formatDate = (_row: any, _column: any, cellValue: string) => {
  if (!cellValue) return ''
  return dayjs(cellValue).format('YYYY-MM-DD HH:mm:ss')
}

// 服务类型映射函数
export const getServiceTypeDisplayName = (provider: string, typeValue: any): string => {
  return getServiceTypeDisplayNameFromMap(provider, typeValue)
}

// 导出映射函数供外部使用
export { getProviderDisplayName }

// 云配置表单接口
export interface CloudConfigForm {
  provider: string
  region: string
  instance_id: string
  secret_id: string
  secret_key: string
  description: string
  is_default: boolean
  is_enabled: boolean
  project_id?: string
  type?: string
}

// 区域接口
export interface Region {
  code: string
  name: string
}

// 使用云配置的组合式函数
export function useCloudConfig() {
  const configs = ref<CloudConfig[]>([])
  const providers = ref<string[]>([])
  const regions = ref<Region[]>([])
  const serviceTypes = ref<ServiceType[]>([])
  const loadingRegions = ref(false)
  const loadingServiceTypes = ref(false)
  const isEdit = ref(false)
  const editId = ref<number | null>(null)

  const form = ref<CloudConfigForm>({
    provider: '',
    region: '',
    instance_id: '',
    secret_id: '',
    secret_key: '',
    description: '',
    is_default: false,
    is_enabled: true,
    project_id: '',
    type: '',
  })

  // 是否显示ProjectID字段（仅华为云需要）
  const showProjectId = computed(() => {
    return form.value.provider === 'HuaweiCloud'
  })

  // 获取云服务配置列表
  const fetchCloudConfigs = async () => {
    try {
      const response = await getCloudConfigs()
      configs.value = response.data
    } catch (error) {
      ElMessage.error('获取云服务配置失败')
    }
  }

  // 获取云服务商列表
  const fetchProviders = async () => {
    try {
      const response = await getProviders()
      providers.value = response.data.data
    } catch (error) {
      ElMessage.error('获取云服务商列表失败')
    }
  }

  // 获取区域列表
  const fetchRegions = async (provider: string) => {
    loadingRegions.value = true
    try {
      const response = await getRegions(provider)
      regions.value = response.data.data
    } catch (error) {
      ElMessage.error('获取区域列表失败')
    } finally {
      loadingRegions.value = false
    }
  }

  // 获取服务类型列表
  const fetchServiceTypes = async (provider: string) => {
    loadingServiceTypes.value = true
    try {
      const providerServiceTypes = getProviderServiceTypes(provider)
      serviceTypes.value = providerServiceTypes
    } catch (error) {
      ElMessage.error('获取服务类型失败')
    } finally {
      loadingServiceTypes.value = false
    }
  }

  // 云服务商变更处理
  const onProviderChange = (provider: string) => {
    form.value.region = ''
    form.value.type = ''
    regions.value = []
    serviceTypes.value = []
    if (provider) {
      fetchRegions(provider)
      fetchServiceTypes(provider)
    }
  }

  // 重置表单
  const resetForm = () => {
    form.value = {
      provider: '',
      region: '',
      instance_id: '',
      secret_id: '',
      secret_key: '',
      description: '',
      is_default: false,
      is_enabled: true,
      project_id: '',
      type: '',
    }
    isEdit.value = false
    editId.value = null
  }

  // 表单验证
  const validateForm = (): boolean => {
    // 验证必填字段
    if (!form.value.provider) {
      ElMessage.error('请选择云服务商')
      return false
    }

    if (!form.value.region) {
      ElMessage.error('请选择区域')
      return false
    }

    if (!form.value.instance_id) {
      ElMessage.error('请输入实例ID/安全组ID')
      return false
    }

    if (!form.value.secret_id) {
      ElMessage.error('请输入Access Key ID')
      return false
    }

    if (!form.value.secret_key && !isEdit.value) {
      ElMessage.error('请输入Access Key Secret')
      return false
    }

    // 华为云必须填写ProjectID
    if (form.value.provider === 'HuaweiCloud' && !form.value.project_id) {
      ElMessage.error('华为云必须填写Project ID')
      return false
    }

    return true
  }

  // 提交表单
  const onSubmit = async () => {
    // 表单验证
    if (!validateForm()) {
      return
    }

    const configData: any = {
      provider: form.value.provider,
      region: form.value.region,
      instance_id: form.value.instance_id,
      secret_id: form.value.secret_id,
      secret_key: form.value.secret_key,
      description: form.value.description,
      is_default: form.value.is_default,
      is_enabled: form.value.is_enabled,
      type: form.value.type, // 添加服务类型字段
    }

    // 华为云添加project_id
    if (form.value.provider === 'HuaweiCloud' && form.value.project_id) {
      configData.project_id = form.value.project_id
    }

    try {
      if (isEdit.value && editId.value !== null) {
        if (!configData.secret_key) {
          delete (configData as Partial<typeof configData>).secret_key
        }
        await updateCloudConfig(editId.value, configData)
        ElMessage.success('配置更新成功')
      } else {
        await addCloudConfig(configData)
        ElMessage.success('配置添加成功')
      }
      resetForm()
      fetchCloudConfigs()
    } catch (error) {
      ElMessage.error(isEdit.value ? '更新配置失败' : '添加配置失败')
    }
  }

  // 取消操作
  const onCancel = () => {
    resetForm()
  }

  // 编辑配置
  const handleEdit = (row: CloudConfig) => {
    isEdit.value = true
    editId.value = row.ID
    form.value = {
      provider: row.provider,
      region: row.region,
      instance_id: row.instance_id,
      secret_id: row.secret_id,
      secret_key: '', // 不显示密钥
      description: row.description,
      is_default: row.is_default,
      is_enabled: row.is_enabled,
      project_id: row.project_id || '',
      type: row.type || '',
    }
    fetchRegions(row.provider)
    fetchServiceTypes(row.provider)
  }

  // 删除配置
  const handleDelete = (row: CloudConfig) => {
    ElMessageBox.confirm('确定要删除这个云服务配置吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    }).then(async () => {
      try {
        await deleteCloudConfig(row.ID)
        ElMessage.success('配置删除成功')
        fetchCloudConfigs()
      } catch (error) {
        ElMessage.error('删除配置失败')
      }
    })
  }

  // 测试配置
  const handleTest = async (row: CloudConfig) => {
    try {
      const response = await testCloudConfig(row.ID)
      if (response.data.success) {
        ElMessage.success(response.data.message)
      } else {
        ElMessage.error(response.data.message)
      }
    } catch (error) {
      ElMessage.error('测试连接失败')
    }
  }

  // 初始化数据
  const initData = () => {
    fetchCloudConfigs()
    fetchProviders()
  }

  return {
    // 响应式数据
    configs,
    providers,
    regions,
    serviceTypes,
    loadingRegions,
    loadingServiceTypes,
    form,
    isEdit,
    editId,

    // 计算属性
    showProjectId,

    // 方法
    fetchCloudConfigs,
    fetchProviders,
    fetchRegions,
    fetchServiceTypes,
    onProviderChange,
    onSubmit,
    onCancel,
    resetForm,
    handleEdit,
    handleDelete,
    handleTest,
    initData,
  }
}
