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
            <el-form-item label="云服务商 *">
              <el-select v-model="form.provider" placeholder="请选择云服务商" @change="onProviderChange" style="width: 100%;">
                <el-option v-for="item in providers" :key="item" :label="getProviderDisplayName(item)" :value="item"></el-option>
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="区域 *">
              <el-select v-model="form.region" placeholder="请选择区域" filterable :loading="loadingRegions" style="width: 100%;">
                <el-option v-for="item in regions" :key="item.code" :label="`${item.name} (${item.code})`" :value="item.code"></el-option>
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="实例ID/安全组ID *">
              <el-input v-model="form.instance_id" placeholder="云服务器实例ID/安全组ID"></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="配置描述">
              <el-input v-model="form.description" placeholder="配置用途描述"></el-input>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20" v-if="showProjectId">
          <el-col :span="12">
            <el-form-item label="Project ID *">
              <el-input v-model="form.project_id" placeholder="华为云项目ID"></el-input>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="AK *">
              <el-input v-model="form.secret_id" placeholder="访问密钥ID"></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="SK *">
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
        <el-table-column prop="provider" label="云服务商" width="120">
          <template #default="scope">
            {{ getProviderDisplayName(scope.row.provider) }}
          </template>
        </el-table-column>
        <el-table-column prop="region" label="区域" width="150" />
        <el-table-column prop="instance_id" label="实例ID" width="180" />
        <el-table-column prop="project_id" label="Project ID" width="150">
          <template #default="scope">
            {{ scope.row.project_id || '-' }}
          </template>
        </el-table-column>
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
import { onMounted } from 'vue'
import { useCloudConfig, getProviderDisplayName, formatDate } from '../composables/useCloudConfig'

const {
  configs,
  providers,
  regions,
  loadingRegions,
  form,
  isEdit,
  showProjectId,
  onProviderChange,
  onSubmit,
  onCancel,
  handleEdit,
  handleDelete,
  handleTest,
  initData,
} = useCloudConfig()

onMounted(() => {
  initData()
})
</script>
