<template>
  <el-container style="height: 100vh;">
    <el-aside :width="isCollapse ? '64px' : '200px'" style="background-color: #545c64; transition: width 0.3s; position: relative;">
      <el-menu
        :default-active="activeMenu"
        class="el-menu-vertical-demo"
        @select="handleMenuSelect"
        background-color="#545c64"
        text-color="#fff"
        active-text-color="#409EFF"
        :collapse="isCollapse">
        <div class="sidebar-header">
          <h3 v-if="!isCollapse">FireFlow</h3>
          <el-icon v-else style="color: white; font-size: 24px;">
            <Menu />
          </el-icon>
        </div>
        <el-menu-item index="rules">
          <el-icon><List /></el-icon>
          <template #title>防火墙规则</template>
        </el-menu-item>
        <el-menu-item index="cloud-config">
          <el-icon><Cloudy /></el-icon>
          <template #title>云服务配置</template>
        </el-menu-item>
        <el-menu-item index="system">
          <el-icon><Setting /></el-icon>
          <template #title>系统设置</template>
        </el-menu-item>
        <el-menu-item index="github">
          <el-icon><Link /></el-icon>
          <template #title>GitHub 地址</template>
        </el-menu-item>
      </el-menu>
    </el-aside>
    <el-container>
      <el-header style="text-align: right; font-size: 12px; border-bottom: 1px solid #e6e6e6;">
        <div class="toolbar">
          <el-button 
            type="text" 
            @click="toggleCollapse"
            style="color: #409EFF;">
            <el-icon><Fold v-if="!isCollapse" /><Expand v-else /></el-icon>
          </el-button>
          <span class="page-title">{{ currentPageTitle }}</span>
          <span style="margin-left: auto;">Admin</span>
        </div>
      </el-header>
      <el-main>
        <div v-if="activeMenu === 'rules'">
          <FirewallRules />
        </div>
        <div v-if="activeMenu === 'cloud-config'">
          <CloudConfig />
        </div>
        <div v-if="activeMenu === 'system'">
          <SystemSettings />
        </div>
      </el-main>
    </el-container>
  </el-container>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
import FirewallRules from './components/FirewallRules.vue';
import CloudConfig from './components/CloudConfig.vue';
import SystemSettings from './components/SystemSettings.vue';
import { Menu, List, Cloudy, Setting, Fold, Expand, Link } from '@element-plus/icons-vue';
import './styles/app.css';

const activeMenu = ref('rules');
const isCollapse = ref(false);

const currentPageTitle = computed(() => {
  switch (activeMenu.value) {
    case 'rules':
      return '防火墙规则';
    case 'cloud-config':
      return '云服务配置';
    case 'system':
      return '系统设置';
    default:
      return '防火墙规则';
  }
});

const handleMenuSelect = (index: string) => {
  if (index === 'github') {
    // 打开GitHub链接，但不改变当前页面
    window.open('https://github.com/lm379/fireflow', '_blank', 'noopener,noreferrer');
    return;
  }
  activeMenu.value = index;
};

const toggleCollapse = () => {
  isCollapse.value = !isCollapse.value;
};

// 响应式设计：屏幕宽度小于768px时自动收起侧边栏
const checkScreenSize = () => {
  if (window.innerWidth < 768) {
    isCollapse.value = true;
  } else {
    isCollapse.value = false;
  }
};

onMounted(() => {
  checkScreenSize();
  window.addEventListener('resize', checkScreenSize);
});

onUnmounted(() => {
  window.removeEventListener('resize', checkScreenSize);
});
</script>
