import { createApp } from 'vue';
import App from './App.vue';
import router from './router';
import { useAuth } from './stores/auth';
import './style.css';

const app = createApp(App);

useAuth().init();

app.use(router).mount('#app');
