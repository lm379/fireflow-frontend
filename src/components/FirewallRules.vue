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
              <div v-if="form.port.includes(',')" style="color: #E6A23C; font-size: 12px; line-height: 1.5;">
                提示：当前输入包含多个端口，将自动创建 {{ portCount }} 条规则
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
        <el-table-column prop="remark" label="备注" width="180" />
        <el-table-column prop="provider" label="云服务商" width="120" />
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
import { ref, onMounted, watch, computed } from 'vue';
import dayjs from 'dayjs';
import { getRules, addRule, updateRule, deleteRule, executeRule, getCloudConfigs } from '../api';
import type { FirewallRule, CloudConfig } from '../api';
import { ElMessage, ElMessageBox } from 'element-plus';

const formatDate = (_row: any, _column: any, cellValue: string) => {
  if (!cellValue) return ''
  return dayjs(cellValue).format('YYYY-MM-DD HH:mm:ss')
}

const rules = ref<FirewallRule[]>([]);
const cloudConfigs = ref<CloudConfig[]>([]);
const cloudConfigOptions = ref<{ label: string, value: number }[]>([]);

const form = ref({
  remark: '',
  cloud_config_id: '' as '' | number,
  port: '',
  protocol: 'TCP',
  enabled: true,
});

const selectedCloudConfig = computed(() => {
  if (!form.value.cloud_config_id) return null;
  return cloudConfigs.value.find(c => c.ID === form.value.cloud_config_id);
});

watch([() => form.value.protocol, () => form.value.cloud_config_id], ([newProtocol]) => {
  if (newProtocol === 'ICMP' || newProtocol === 'ALL') {
    if (selectedCloudConfig.value) {
      const provider = selectedCloudConfig.value.provider;
      if (provider === 'Aliyun') {
        form.value.port = '-1/-1';
      } else if (provider === 'TencentCloud') {
        form.value.port = 'ALL';
      } else {
        form.value.port = 'ALL';
      }
    }
  }
});

const isPortDisabled = computed(() => {
  return form.value.protocol === 'ICMP' || form.value.protocol === 'ALL';
});

const portCount = computed(() => {
  if (form.value.port.includes(',')) {
    return form.value.port.split(',').map(p => p.trim()).filter(p => p).length;
  }
  return 1;
});

const isEdit = ref(false);
const editId = ref<number | null>(null);

const fetchRules = async () => {
  try {
    const response = await getRules();
    rules.value = response.data;
  } catch (error) {
    ElMessage.error('获取规则列表失败');
  }
};

const fetchCloudConfigs = async () => {
  try {
    const response = await getCloudConfigs();
    cloudConfigs.value = response.data;
    cloudConfigOptions.value = response.data
      .filter(config => config.is_enabled)
      .map(config => ({
        label: `${config.provider} - ${config.description || config.instance_id} (${config.region})`,
        value: config.ID,
      }));
  } catch (error) {
    ElMessage.error('获取云服务配置失败');
  }
};

onMounted(() => {
  fetchRules();
  fetchCloudConfigs();
});

const onSubmit = async () => {
  if (form.value.remark === '' || form.value.cloud_config_id === '' || form.value.port === '') {
    ElMessage.error('请填写所有必填项');
    return;
  }

  const provider = selectedCloudConfig.value?.provider;

  const processPort = (port: string) => {
    if (provider === 'Aliyun') {
      return port.replace(/-/g, '/');
    }
    return port;
  };

  const ruleData = {
    remark: form.value.remark,
    cloud_config_id: form.value.cloud_config_id as number,
    port: form.value.port,
    protocol: form.value.protocol,
    enabled: form.value.enabled,
  };

  try {
    if (isEdit.value && editId.value !== null) {
      const fullRule = rules.value.find(r => r.ID === editId.value);
      if (fullRule) {
        const processedPort = processPort(ruleData.port);
        await updateRule(editId.value, { ...fullRule, ...ruleData, port: processedPort });
        ElMessage.success('规则更新成功');
      }
    } else {
      if (ruleData.port.includes(',')) {
        const ports = ruleData.port.split(',').map(p => p.trim()).filter(p => p);
        for (const port of ports) {
          const processedPort = processPort(port);
          await addRule({ ...ruleData, port: processedPort });
        }
        ElMessage.success('多个规则添加成功');
      } else {
        const processedPort = processPort(ruleData.port);
        await addRule({ ...ruleData, port: processedPort });
        ElMessage.success('规则添加成功');
      }
    }
    resetForm();
    fetchRules();
  } catch (error) {
    ElMessage.error(isEdit.value ? '更新规则失败' : '添加规则失败');
  }
};

const onCancel = () => {
  resetForm();
};

const resetForm = () => {
  form.value = {
    remark: '',
    cloud_config_id: '',
    port: '',
    protocol: 'TCP',
    enabled: true,
  };
  isEdit.value = false;
  editId.value = null;
};

const handleEdit = (row: FirewallRule) => {
  isEdit.value = true;
  editId.value = row.ID;
  form.value = {
    remark: row.remark,
    cloud_config_id: row.cloud_config_id,
    port: row.port,
    protocol: row.protocol,
    enabled: row.enabled,
  };
};

const handleDelete = (row: FirewallRule) => {
  ElMessageBox.confirm('确定要删除这条规则吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
  }).then(async () => {
    try {
      await deleteRule(row.ID);
      ElMessage.success('规则删除成功');
      fetchRules();
    } catch (error) {
      ElMessage.error('删除规则失败');
    }
  });
};

const handleExecute = (row: FirewallRule) => {
  ElMessageBox.confirm('确定要立即执行这条规则吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'info',
  }).then(async () => {
    try {
      await executeRule(row.ID);
      ElMessage.success('规则执行成功');
      fetchRules();
    } catch (error) {
      ElMessage.error('执行规则失败');
    }
  });
};
</script>

<style scoped>
.box-card {
  margin-bottom: 20px;
}
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
</style>
