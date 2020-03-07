import Vue from 'vue'
import VueRouter from 'vue-router'
import Login from './components/Login.vue'
import Home from './components/Home.vue'
import Welcome from './components/Welcome.vue'
import Users from './components/Users/user.vue'
Vue.use(VueRouter)

const routes = [
  {path:'/',redirect:'/login'},
  {path:'/login',component:Login},
  {path:'/home',component:Home,children:[
    {path:'/home',redirect:'/welcome'},
    {path:'/welcome',component:Welcome},
    {path:'/users',component:Users}
  ]}
]

const router = new VueRouter({
  routes
})
// 设置路由导航守卫
//to表示将要访问的路径
//from代表从哪个路径跳转
//next是一个函数，表示放行
router.beforeEach((to,from,next)=>{
  if(to.path === '/login') next();
  const tokenstr = window.sessionStorage.getItem('token')
  if(!tokenstr) return next('login')
  next()
})

export default router
