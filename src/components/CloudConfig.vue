<template>
  <div>
    <el-card class="box-card">
      <template #header>
        <div class="card-header">
          <span>{{ isEdit ? '编辑云服务配置' : '添加云服务配置' }}</span>
        </div>
      </template>
      <el-form :model="form" label-width="140px">
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="云服务商">
              <el-select v-model="form.provider" placeholder="请选择云服务商" @change="onProviderChange" style="width: 100%;">
                <el-option v-for="item in providers" :key="item" :label="item" :value="item"></el-option>
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="区域">
              <el-select v-model="form.region" placeholder="请选择区域" filterable :loading="loadingRegions" style="width: 100%;">
                <el-option v-for="item in regions" :key="item.code" :label="`${item.name} (${item.code})`" :value="item.code"></el-option>
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="实例ID/安全组ID">
              <el-input v-model="form.instance_id" placeholder="云服务器实例ID/安全组ID"></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="配置描述">
              <el-input v-model="form.description" placeholder="配置用途描述"></el-input>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="Access Key ID">
              <el-input v-model="form.secret_id" placeholder="访问密钥ID"></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="Access Key Secret">
              <el-input v-model="form.secret_key" type="password" placeholder="访问密钥Secret"></el-input>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="设为默认配置">
              <el-select v-model="form.is_default" style="width: 100%;">
                <el-option label="否" :value="false"></el-option>
                <el-option label="是" :value="true"></el-option>
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="启用状态">
              <el-select v-model="form.is_enabled" style="width: 100%;">
                <el-option label="启用" :value="true"></el-option>
                <el-option label="禁用" :value="false"></el-option>
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item>
          <el-button type="primary" @click="onSubmit">{{ isEdit ? '更新配置' : '保存配置' }}</el-button>
          <el-button @click="onCancel">取消</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card class="box-card" style="margin-top: 20px;">
      <template #header>
        <div class="card-header">
          <span>已保存的云服务配置</span>
        </div>
      </template>
      <el-table :data="configs" style="width: 100%">
        <el-table-column prop="provider" label="云服务商" width="120" />
        <el-table-column prop="region" label="区域" width="150" />
        <el-table-column prop="instance_id" label="实例ID" width="180" />
        <el-table-column label="Access Key ID" width="150">
          <template #default="scope">
            {{ scope.row.secret_id ? scope.row.secret_id.substr(0, 8) + '***' : '' }}
          </template>
        </el-table-column>
        <el-table-column prop="description" label="描述" />
        <el-table-column label="默认" width="80">
          <template #default="scope">
            <el-tag :type="scope.row.is_default ? 'success' : 'info'">{{ scope.row.is_default ? '是' : '否' }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="状态" width="80">
          <template #default="scope">
            <el-tag :type="scope.row.is_enabled ? 'success' : 'danger'">{{ scope.row.is_enabled ? '启用' : '禁用' }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="CreatedAt" label="创建时间" width="180" :formatter="formatDate" />
        <el-table-column label="操作" fixed="right" width="200">
          <template #default="scope">
            <el-button size="small" @click="handleEdit(scope.row)">编辑</el-button>
            <el-button size="small" type="danger" @click="handleDelete(scope.row)">删除</el-button>
            <el-button size="small" type="info" @click="handleTest(scope.row)">测试</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import dayjs from 'dayjs';
import { getCloudConfigs, addCloudConfig, updateCloudConfig, deleteCloudConfig, testCloudConfig, getProviders, getRegions } from '../api';
import type { CloudConfig } from '../api';
import { ElMessage, ElMessageBox } from 'element-plus';

const formatDate = (_row: any, _column: any, cellValue: string) => {
  if (!cellValue) return ''
  return dayjs(cellValue).format('YYYY-MM-DD HH:mm:ss')
}

const configs = ref<CloudConfig[]>([]);
const providers = ref<string[]>([]);
const regions = ref<{ code: string, name: string }[]>([]);
const loadingRegions = ref(false);

const form = ref({
  provider: '',
  region: '',
  instance_id: '',
  secret_id: '',
  secret_key: '',
  description: '',
  is_default: false,
  is_enabled: true,
});

const isEdit = ref(false);
const editId = ref<number | null>(null);

const fetchCloudConfigs = async () => {
  try {
    const response = await getCloudConfigs();
    configs.value = response.data;
  } catch (error) {
    ElMessage.error('获取云服务配置失败');
  }
};

const fetchProviders = async () => {
  try {
    const response = await getProviders();
    providers.value = response.data.data;
  } catch (error) {
    ElMessage.error('获取云服务商列表失败');
  }
};

const fetchRegions = async (provider: string) => {
  loadingRegions.value = true;
  try {
    const response = await getRegions(provider);
    regions.value = response.data.data;
  } catch (error) {
    ElMessage.error('获取区域列表失败');
  } finally {
    loadingRegions.value = false;
  }
};

onMounted(() => {
  fetchCloudConfigs();
  fetchProviders();
});

const onProviderChange = (provider: string) => {
  form.value.region = '';
  regions.value = [];
  if (provider) {
    fetchRegions(provider);
  }
};

const onSubmit = async () => {
  const configData = {
    provider: form.value.provider,
    region: form.value.region,
    instance_id: form.value.instance_id,
    secret_id: form.value.secret_id,
    secret_key: form.value.secret_key,
    description: form.value.description,
    is_default: form.value.is_default,
    is_enabled: form.value.is_enabled,
  };

  try {
    if (isEdit.value && editId.value !== null) {
      if (!configData.secret_key) {
        delete (configData as Partial<typeof configData>).secret_key;
      }
      await updateCloudConfig(editId.value, configData);
      ElMessage.success('配置更新成功');
    } else {
      await addCloudConfig(configData);
      ElMessage.success('配置添加成功');
    }
    resetForm();
    fetchCloudConfigs();
  } catch (error) {
    ElMessage.error(isEdit.value ? '更新配置失败' : '添加配置失败');
  }
};

const onCancel = () => {
  resetForm();
};

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
  };
  isEdit.value = false;
  editId.value = null;
};

const handleEdit = (row: CloudConfig) => {
  isEdit.value = true;
  editId.value = row.ID;
  form.value = {
    provider: row.provider,
    region: row.region,
    instance_id: row.instance_id,
    secret_id: row.secret_id,
    secret_key: '', // Do not show secret key
    description: row.description,
    is_default: row.is_default,
    is_enabled: row.is_enabled,
  };
  fetchRegions(row.provider);
};

const handleDelete = (row: CloudConfig) => {
  ElMessageBox.confirm('确定要删除这个云服务配置吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
  }).then(async () => {
    try {
      await deleteCloudConfig(row.ID);
      ElMessage.success('配置删除成功');
      fetchCloudConfigs();
    } catch (error) {
      ElMessage.error('删除配置失败');
    }
  });
};

const handleTest = async (row: CloudConfig) => {
  try {
    const response = await testCloudConfig(row.ID);
    if (response.data.success) {
      ElMessage.success(response.data.message);
    } else {
      ElMessage.error(response.data.message);
    }
  } catch (error) {
    ElMessage.error('测试连接失败');
  }
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
