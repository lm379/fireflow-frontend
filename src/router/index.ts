import { createRouter, createWebHashHistory } from 'vue-router'
import FirewallRules from '../components/FirewallRules.vue'
import CloudConfig from '../components/CloudConfig.vue'
import SystemSettings from '../components/SystemSettings.vue'

const routes = [
  {
    path: '/',
    redirect: '/rules'
  },
  {
    path: '/rules',
    name: 'rules',
    component: FirewallRules,
    meta: {
      title: '防火墙规则'
    }
  },
  {
    path: '/cloud-config',
    name: 'cloud-config',
    component: CloudConfig,
    meta: {
      title: '云服务配置'
    }
  },
  {
    path: '/system',
    name: 'system',
    component: SystemSettings,
    meta: {
      title: '系统设置'
    }
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: '/rules'
  }
]

const router = createRouter({
  history: createWebHashHistory(),
  routes
})

export default router