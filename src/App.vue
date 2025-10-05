<template>
  <el-container style="height: 100vh;">
    <el-aside :width="isCollapse ? '64px' : '200px'" style="background-color: #545c64; transition: width 0.3s;">
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
      </el-menu>
    </el-aside>
    <el-container>
      <el-header style="text-align: right; font-size: 12px; border-bottom: 1px solid #e6e6e6;">
        <div class="toolbar">
          <el-button 
            type="text" 
            @click="toggleCollapse"
            style="margin-right: auto; color: #409EFF;">
            <el-icon><Fold v-if="!isCollapse" /><Expand v-else /></el-icon>
          </el-button>
          <span>Admin</span>
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
import { ref, onMounted, onUnmounted } from 'vue';
import FirewallRules from './components/FirewallRules.vue';
import CloudConfig from './components/CloudConfig.vue';
import SystemSettings from './components/SystemSettings.vue';
import { Menu, List, Cloudy, Setting, Fold, Expand } from '@element-plus/icons-vue';

const activeMenu = ref('rules');
const isCollapse = ref(false);

const handleMenuSelect = (index: string) => {
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

<style>
body {
  margin: 0;
}

.sidebar-header {
  color: white;
  text-align: center;
  padding: 20px;
  font-size: 20px;
  transition: all 0.3s;
}

.el-menu-item {
  justify-content: center;
}

.el-menu-vertical-demo:not(.el-menu--collapse) {
  width: 200px;
  min-height: 100%;
}

.el-menu-vertical-demo.el-menu--collapse {
  width: 64px;
}

.toolbar {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  height: 100%;
  padding: 0 20px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .el-aside {
    position: fixed !important;
    left: 0;
    top: 0;
    height: 100vh;
    z-index: 1000;
  }
  
  .el-main {
    margin-left: 64px;
    transition: margin-left 0.3s;
  }
}

/* 侧边栏收起时的图标样式 */
.el-menu--collapse .sidebar-header {
  padding: 15px 10px;
}

.el-menu--collapse .el-menu-item {
  padding: 0 20px;
}

/* 过渡动画 */
.el-aside {
  transition: width 0.3s ease;
}
</style>
