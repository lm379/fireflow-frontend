import { ref, computed, watch } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getRules, addRule, updateRule, deleteRule, executeRule, getCloudConfigs } from '../api'
import type { FirewallRule, CloudConfig, ExecuteRuleResponse } from '../api'
import { getProviderDisplayName } from '../constants/providers'

// 防火墙规则表单接口
export interface FirewallRuleForm {
  remark: string
  cloud_config_id: '' | number
  port: string
  protocol: string
  enabled: boolean
}

// 云配置选项接口
export interface CloudConfigOption {
  label: string
  value: number
}

// 使用防火墙规则的组合式函数
export function useFirewallRules() {
  const rules = ref<FirewallRule[]>([])
  const cloudConfigs = ref<CloudConfig[]>([])
  const cloudConfigOptions = ref<CloudConfigOption[]>([])
  const isEdit = ref(false)
  const editId = ref<number | null>(null)

  const form = ref<FirewallRuleForm>({
    remark: '',
    cloud_config_id: '',
    port: '',
    protocol: 'TCP',
    enabled: true,
  })

  // 选中的云配置
  const selectedCloudConfig = computed(() => {
    if (!form.value.cloud_config_id) return null
    return cloudConfigs.value.find(c => c.ID === form.value.cloud_config_id)
  })

  // 端口是否禁用
  const isPortDisabled = computed(() => {
    return form.value.protocol === 'ICMP' || form.value.protocol === 'ALL'
  })

  // 端口数量计算
  const portCount = computed(() => {
    if (!form.value.port.includes(',')) return 1
    
    const provider = selectedCloudConfig.value?.provider
    if (provider === 'HuaweiCloud') {
      // 华为云支持多端口，只创建一条规则
      return 1
    } else {
      // 其他云服务商需要拆分成多条规则
      return form.value.port.split(',').map(p => p.trim()).filter(p => p).length
    }
  })

  // 是否支持多端口
  const supportMultiPort = computed(() => {
    return selectedCloudConfig.value?.provider === 'HuaweiCloud'
  })

  // 监听协议和云配置变化，自动设置端口
  watch([() => form.value.protocol, () => form.value.cloud_config_id], ([newProtocol]) => {
    if (newProtocol === 'ICMP' || newProtocol === 'ALL') {
      if (selectedCloudConfig.value) {
        const provider = selectedCloudConfig.value.provider
        if (provider === 'Aliyun') {
          form.value.port = '-1/-1'
        } else if (provider === 'TencentCloud') {
          form.value.port = 'ALL'
        } else {
          form.value.port = 'ALL'
        }
      }
    }
  })

  // 获取规则列表
  const fetchRules = async () => {
    try {
      const response = await getRules()
      rules.value = response.data
    } catch (error) {
      ElMessage.error('获取规则列表失败')
    }
  }

  // 获取云服务配置
  const fetchCloudConfigs = async () => {
    try {
      const response = await getCloudConfigs()
      cloudConfigs.value = response.data
      cloudConfigOptions.value = response.data
        .filter(config => config.is_enabled)
        .map(config => ({
          label: `${getProviderDisplayName(config.provider)} - ${config.description || config.instance_id} (${config.region})`,
          value: config.ID,
        }))
    } catch (error) {
      ElMessage.error('获取云服务配置失败')
    }
  }

  // 处理端口格式（阿里云特殊处理）
  const processPort = (port: string): string => {
    const provider = selectedCloudConfig.value?.provider
    if (provider === 'Aliyun') {
      return port.replace(/-/g, '/')
    }
    return port
  }

  // 重置表单
  const resetForm = () => {
    form.value = {
      remark: '',
      cloud_config_id: '',
      port: '',
      protocol: 'TCP',
      enabled: true,
    }
    isEdit.value = false
    editId.value = null
  }

  // 表单验证
  const validateForm = (): boolean => {
    if (form.value.remark === '' || form.value.cloud_config_id === '' || form.value.port === '') {
      ElMessage.error('请填写所有必填项')
      return false
    }
    
    // 检查非华为云是否输入了多端口
    const provider = selectedCloudConfig.value?.provider
    if (provider !== 'HuaweiCloud' && form.value.port.includes(',')) {
      ElMessage.error('当前云服务商不支持多端口，请输入单个端口')
      return false
    }
    
    return true
  }

  // 提交表单
  const onSubmit = async () => {
    if (!validateForm()) return

    const ruleData = {
      remark: form.value.remark,
      cloud_config_id: form.value.cloud_config_id as number,
      port: form.value.port,
      protocol: form.value.protocol,
      enabled: form.value.enabled,
    }

    try {
      if (isEdit.value && editId.value !== null) {
        // 更新规则
        const fullRule = rules.value.find(r => r.ID === editId.value)
        if (fullRule) {
          const processedPort = processPort(ruleData.port)
          await updateRule(editId.value, { ...fullRule, ...ruleData, port: processedPort })
          ElMessage.success('规则更新成功')
        }
      } else {
        // 添加规则
        const provider = selectedCloudConfig.value?.provider
        if (provider === 'HuaweiCloud') {
          // 华为云支持多端口，直接提交（不拆分）
          const processedPort = processPort(ruleData.port)
          await addRule({ ...ruleData, port: processedPort })
          ElMessage.success('华为云规则添加成功')
        } else if (ruleData.port.includes(',')) {
          // 其他云服务商需要拆分多端口
          const ports = ruleData.port.split(',').map(p => p.trim()).filter(p => p)
          for (const port of ports) {
            const processedPort = processPort(port)
            await addRule({ ...ruleData, port: processedPort })
          }
          ElMessage.success(`多个规则添加成功，共 ${ports.length} 条`)
        } else {
          // 单端口处理
          const processedPort = processPort(ruleData.port)
          await addRule({ ...ruleData, port: processedPort })
          ElMessage.success('规则添加成功')
        }
      }
      resetForm()
      fetchRules()
    } catch (error) {
      ElMessage.error(isEdit.value ? '更新规则失败' : '添加规则失败')
    }
  }

  // 取消操作
  const onCancel = () => {
    resetForm()
  }

  // 编辑规则
  const handleEdit = (row: FirewallRule) => {
    isEdit.value = true
    editId.value = row.ID
    form.value = {
      remark: row.remark,
      cloud_config_id: row.cloud_config_id,
      port: row.port,
      protocol: row.protocol,
      enabled: row.enabled,
    }
  }

  // 删除规则
  const handleDelete = (row: FirewallRule) => {
    ElMessageBox.confirm('确定要删除这条规则吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    }).then(async () => {
      try {
        await deleteRule(row.ID)
        ElMessage.success('规则删除成功')
        fetchRules()
      } catch (error) {
        ElMessage.error('删除规则失败')
      }
    })
  }

  // 执行规则
  const handleExecute = (row: FirewallRule) => {
    ElMessageBox.confirm('确定要立即执行这条规则吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'info',
    }).then(async () => {
      try {
        const response = await executeRule(row.ID)
        const result: ExecuteRuleResponse = response.data
        
        // 根据执行结果显示不同的消息
        switch (result.status) {
          case 'unchanged':
            ElMessage.success(`${result.message} (云端IP: ${result.cloud_ip}, 当前IP: ${result.current_ip})`)
            break
          case 'updated':
            ElMessage.success(`${result.message} (IP已从 ${result.cloud_ip} 更新为 ${result.current_ip})`)
            break
          case 'error':
            ElMessage.error(`${result.message} (云端IP: ${result.cloud_ip}, 当前IP: ${result.current_ip})`)
            break
          default:
            ElMessage.success(result.message)
        }
        
        // 刷新规则列表
        fetchRules()
      } catch (error) {
        ElMessage.error('执行规则失败')
      }
    })
  }

  // 初始化数据
  const initData = () => {
    fetchRules()
    fetchCloudConfigs()
  }

  return {
    // 响应式数据
    rules,
    cloudConfigs,
    cloudConfigOptions,
    form,
    isEdit,
    editId,
    
    // 计算属性
    selectedCloudConfig,
    isPortDisabled,
    portCount,
    supportMultiPort,
    
    // 方法
    fetchRules,
    fetchCloudConfigs,
    onSubmit,
    onCancel,
    resetForm,
    handleEdit,
    handleDelete,
    handleExecute,
    initData,
    
    // 工具函数
    getProviderDisplayName,
  }
}