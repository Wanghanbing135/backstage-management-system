import Vue from 'vue'
import VueRouter from 'vue-router'

Vue.use(VueRouter)

const routes = [
  {
    path:'/',
    component: ()=>import('../views/Login.vue')
  },
  {
    path:'/home',
    component: ()=>import('../views/Home.vue'),
    redirect: '/home/welcome',
    children:[
      {path:'welcome',component:()=>import('../components/Welcome.vue')},
      {path:'categories',component:()=>import('../components/Goods/Categories.vue')},
      {path:'goods',component:()=>import('../components/Goods/Goods.vue')},
      {path:'params',component:()=>import('../components/Goods/Params.vue')},
      {path:'orders',component:()=>import('../components/Orders/Orders.vue')},
      {path:'reports',component:()=>import('../components/Reports/Reports.vue')},
      {path:'rights',component:()=>import('../components/Rights/Rights.vue')},
      {path:'roles',component:()=>import('../components/Rights/Roles.vue')},
      {path:'users',component:()=>import('../components/Users/Users.vue')},
      {path:'/goods/add',component:()=>import('../components/Goods/Add.vue')}
    ]
  }

]

const router = new VueRouter({
  routes
})
router.beforeEach((to, from, next) => {
  if( to.path === '/') return next();
  const tokenStr = window.sessionStorage.getItem('token');
  if( !tokenStr) return next('/');
  next();
})

export default router
