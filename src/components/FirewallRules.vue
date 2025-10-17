<template>
  <div>
    <el-card class="box-card">
      <template #header>
        <div class="card-header">
          <span>{{ isEdit ? '编辑规则' : '添加新规则' }}</span>
        </div>
      </template>
      <el-form :model="form" label-width="120px">
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="规则备注 *">
              <el-input v-model="form.remark" placeholder="例如：办公网络SSH访问"></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="云服务配置 *">
              <el-select v-model="form.cloud_config_id" placeholder="请选择已配置的云服务" style="width: 100%;">
                <el-option v-for="item in cloudConfigOptions" :key="item.value" :label="item.label" :value="item.value"></el-option>
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="端口号 *">
              <el-input v-model="form.port" :disabled="isPortDisabled" placeholder="例如：22, 80, 443, 8000-8080, ALL"></el-input>
              <div v-if="form.port.includes(',') && selectedCloudConfig" style="color: #909399; font-size: 12px; line-height: 1.5;">
                <span v-if="selectedCloudConfig.provider === 'HuaweiCloud'" style="color: #67C23A;">
                  华为云ECS/Flexus均支持多端口，将创建 1 条包含所有端口的规则
                </span>
                <span v-else-if="selectedCloudConfig.provider === 'Aliyun' && Number(selectedCloudConfig.type) === 1" style="color: #67C23A;">
                  阿里云轻量应用服务器支持多端口，将创建 1 条包含所有端口的规则
                </span>
                <span v-else style="color: #E6A23C;">
                  {{ getSelectedConfigDisplayName() }}不支持多端口，将自动创建 {{ portCount }} 条独立规则
                </span>
              </div>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="协议类型 *">
              <el-select v-model="form.protocol" style="width: 100%;">
                <el-option label="TCP" value="TCP"></el-option>
                <el-option label="UDP" value="UDP"></el-option>
                <el-option label="ICMP" value="ICMP"></el-option>
                <el-option label="ALL" value="ALL"></el-option>
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="启用状态">
              <el-select v-model="form.enabled" style="width: 100%;">
                <el-option label="启用" :value="true"></el-option>
                <el-option label="禁用" :value="false"></el-option>
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item>
          <el-button type="primary" @click="onSubmit">{{ isEdit ? '更新规则' : '添加规则' }}</el-button>
          <el-button @click="onCancel">取消</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card class="box-card" style="margin-top: 20px;">
      <template #header>
        <div class="card-header">
          <span>规则列表</span>
        </div>
      </template>
      <el-table :data="rules" style="width: 100%">
        <el-table-column prop="remark" label="备注" width="120" />
        <el-table-column prop="provider" label="云服务商" width="180">
          <template #default="scope">
            {{ getFullProviderDisplayName(scope.row) }}
          </template>
        </el-table-column>
        <el-table-column prop="instance_id" label="实例ID" width="180" />
        <el-table-column prop="port" label="端口" width="120" />
        <el-table-column prop="protocol" label="协议" width="100" />
        <el-table-column prop="last_ip" label="当前IP" width="150" />
        <el-table-column label="状态" width="100">
          <template #default="scope">
            <el-tag :type="scope.row.enabled ? 'success' : 'danger'">{{ scope.row.enabled ? '启用' : '禁用' }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="UpdatedAt" label="最后更新" width="180" :formatter="formatDate" />
        <el-table-column label="操作" fixed="right" width="200">
          <template #default="scope">
            <el-button size="small" @click="handleEdit(scope.row)">编辑</el-button>
            <el-button size="small" type="danger" @click="handleDelete(scope.row)">删除</el-button>
            <el-button size="small" type="success" @click="handleExecute(scope.row)">执行</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useFirewallRules } from '../composables/useFirewallRules'
import { formatDateTime } from '../utils/common'
import '../styles/components/firewall-rules.css'

const {
  rules,
  cloudConfigOptions,
  form,
  isEdit,
  isPortDisabled,
  portCount,
  selectedCloudConfig,
  onSubmit,
  onCancel,
  handleEdit,
  handleDelete,
  handleExecute,
  initData,
  getFullProviderDisplayName,
  getSelectedConfigDisplayName,
} = useFirewallRules()

const formatDate = (_row: any, _column: any, cellValue: string) => {
  return formatDateTime(cellValue)
}

onMounted(() => {
  initData()
});
</script>
