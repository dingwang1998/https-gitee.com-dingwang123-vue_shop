<template>
    <el-container class="home-contaniner">
        <!-- 头部区域 -->
        <el-header>
            <div>
                <img src="../assets/heima.png" alt="">
                <span>电商管理系统</span>
            </div>
            <el-button type= "info" @click="loginout">退出</el-button>
        </el-header>
        <!-- 主体区域 -->
        <el-container>
            <!-- 左侧边栏 -->
            <el-aside :width="iscollapse ? '64px':'200px'">
                <div class="toggle-button" @click="toggleCollapse">|||</div>
                <!-- 标签区 -->
                <el-menu background-color="#333744" text-color="#fff" active-text-color="#ffd04b" unique-opened :collapse="iscollapse" :collapse-transition ="false" router :default-active="activePath">
                    <!-- 一级标题区 -->
                    <el-submenu :index="item.id+''" v-for="item in menulist" :key="item.id">
                        <template slot="title">
                            <i :class="iconobj[item.id]"></i>
                            <span>{{item.authName}}</span>
                        </template>
                            <!--二级标题区  -->
                            <el-menu-item :index="'/'+subitem.path" v-for="subitem in item.children" :key="subitem.id" @click="SaveactivePath('/'+subitem.path)">
                                <i class="el-icon-menu"></i>
                                <span>{{subitem.authName}}</span>
                            </el-menu-item>  
                    </el-submenu>
                </el-menu>
            </el-aside>
            <!-- 右显示区 -->
            <el-main>
                <!-- 路由占位符 -->
                <router-view></router-view>
            </el-main>
        </el-container>
    </el-container>
</template>
<script>
export default {
    data(){
        return{
            menulist:[],
            iconobj:{
                '125':'iconfont icon-users',
                '103':'iconfont icon-tijikongjian',
                '101':'iconfont icon-shangpin',
                '102':'iconfont icon-danju',
                '145':'iconfont icon-baobiao'
            },
            iscollapse:false,
            // 被激活的空地址拿出来
            activePath:''
        }
    },
    created(){
        this.getMenulist()
        this.activePath = window.sessionStorage.getItem('activePath')
    },
    methods:{
        loginout(){
            window.sessionStorage.clear()
            this.$router.push('/login')
        },
        async getMenulist(){
            const {data:res} = await this.$http.get('menus')
            if(res.meta.status !==200) return this.$message.error(res.meta.msg)
            this.menulist = res.data
            //console.log(res); 
        },
        //点击按钮 切换折叠效果
        toggleCollapse(){
            this.iscollapse = !this.iscollapse
        },
        // 激活高亮图标
        SaveactivePath(active){
            window.sessionStorage.setItem('activePath',active)
            this.activePath = active
        }
    }
}
</script>
<style lang="less" scoped>
.home-contaniner{
    height: 100%;
}
.el-header{
    background-color: #373d41;
    display: flex;
    justify-content:space-between;
    padding-left: 0;
    align-items: center;
    color: #EAEDF1;
    font-size: 20px;
    > div{
        display: flex;
        align-items: center;
        span{
            margin-left: 15px;
        }
    }
}
.el-aside{
    background-color: #333744;
    .el-menu{
        border: none;
    }
    .toggle-button{
        background-color: #4a5064;
        font-size: 10px;
        line-height: 24px;
        color: #fff;
        text-align: center;
        letter-spacing: 0.2em;
        cursor: pointer;
    }
}
.el-main{
    background-color: #EAEDF1;
}
span {
    margin-left: 10px;

}
</style>
