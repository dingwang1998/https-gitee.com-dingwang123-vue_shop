import Vue from 'vue'
import VueRouter from 'vue-router'
import Login from './components/Login.vue'
import Home from './components/Home.vue'
import Welcome from './components/Welcome.vue'
import Users from './components/Users/user.vue'
import Rights from './components/power/rights.vue'
import Roles from './components/power/roles.vue'
import Cate from './components/goods/cate.vue'
import Params from './components/goods/params.vue'
import List from './components/goods/list.vue'
import Add from './components/goods/add.vue'
import Order from './components/order/order.vue'
Vue.use(VueRouter)

const routes = [
  {path:'/',redirect:'/login'},
  {path:'/login',component:Login},
  {path:'/home',component:Home,children:[
    {path:'/home',redirect:'/welcome'},
    {path:'/welcome',component:Welcome},
    {path:'/users',component:Users},
    {path:'/rights',component:Rights},
    {path:'/roles',component:Roles},
    {path:'/categories', component:Cate},
    {path:'/params', component:Params},
    {path:'/goods',component:List},
    {path:'/goods/add',component:Add},
    {path:'/orders',component:Order}
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
