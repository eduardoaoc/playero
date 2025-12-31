import { createApp } from 'vue';
import App from './App.vue';
import router from './router';
import { useAuth } from './stores/auth';
import apiClient from './services/apiClient';
import './style.css';

const app = createApp(App);

const auth = useAuth();
auth.init();

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error?.response?.status === 403 && auth.role.value === 'cliente') {
      if (!router.currentRoute.value.path.startsWith('/cliente')) {
        router.push('/cliente/dashboard');
      }
    }
    return Promise.reject(error);
  },
);

app.use(router).mount('#app');
