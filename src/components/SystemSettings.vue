<template>
  <div>
    <el-row :gutter="20">
      <el-col :span="12">
        <el-card class="box-card">
          <template #header>
            <div class="card-header">
              <span>IP获取设置</span>
            </div>
          </template>
          <el-form :model="form" label-width="160px">
            <el-form-item label="IP获取服务URL">
              <el-input v-model="form.ip_fetch_url" placeholder="https://api.ipify.org"></el-input>
              <div style="color: #909399; font-size: 12px; margin-top: 1px;">
                用于获取当前公网IP地址的API地址
                <br/>
                要求API必须直接返回IP的值，且api必须仅返回IPv4地址
                <br/>
                例如：https://4.ipw.cn 或者 https://api-ipv4.ip.sb/ip
              </div>
            </el-form-item>
          </el-form>
        </el-card>
      </el-col>
      <el-col :span="12">
        <el-card class="box-card">
          <template #header>
            <div class="card-header">
              <span>定时任务设置</span>
            </div>
          </template>
          <el-form :model="form" label-width="160px">
            <el-form-item label="IP检查间隔(分钟)">
              <el-input-number v-model="form.ip_check_interval" :min="1"></el-input-number>
            </el-form-item>
            <el-form-item label="启用定时检查">
              <el-select v-model="form.cron_enabled">
                <el-option label="启用" value="true"></el-option>
                <el-option label="禁用" value="false"></el-option>
              </el-select>
            </el-form-item>
          </el-form>
        </el-card>
      </el-col>
    </el-row>
    <el-row :gutter="20" style="margin-top: 20px;">
      <el-col :span="24">
        <el-card class="box-card">
          <template #header>
            <div class="card-header">
              <span>当前状态</span>
            </div>
          </template>
          <p>当前公网IP: {{ currentIP }}</p>
          <el-button type="primary" @click="handleSyncIP">立即获取并同步IP</el-button>
        </el-card>
      </el-col>
    </el-row>
    <div style="text-align: center; margin-top: 20px;">
      <el-button type="primary" @click="onSubmit">保存所有设置</el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { getSystemConfig, saveSystemConfig, syncIPNow, getCurrentIP } from '../api';
import type { SystemConfig } from '../api';
import { ElMessage } from 'element-plus';

const form = ref<SystemConfig>({
  ip_fetch_url: '',
  ip_check_interval: 5,
  cron_enabled: 'true',
});

const currentIP = ref('获取中...');

const fetchSystemConfig = async () => {
  try {
    const response = await getSystemConfig();
    form.value = response.data;
  } catch (error) {
    ElMessage.error('获取系统配置失败');
  }
};

const fetchCurrentIP = async () => {
  try {
    const response = await getCurrentIP();
    currentIP.value = response.data.current_ip;
  } catch (error) {
    currentIP.value = '获取失败';
    ElMessage.error('获取当前IP失败');
  }
};

onMounted(() => {
  fetchSystemConfig();
  fetchCurrentIP();
});

const onSubmit = async () => {
  try {
    await saveSystemConfig(form.value);
    ElMessage.success('系统设置保存成功');
  } catch (error) {
    ElMessage.error('保存系统设置失败');
  }
};

const handleSyncIP = async () => {
  try {
    const response = await syncIPNow();
    ElMessage.success(response.data.message);
    fetchCurrentIP();
  } catch (error) {
    ElMessage.error('同步IP失败');
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
