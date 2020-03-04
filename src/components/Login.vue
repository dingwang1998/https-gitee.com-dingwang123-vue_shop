<template>
    <div class="login_container">
        <div class="login_box">
            <!-- 图像区域 -->
            <div class="avatar_box">
                <img src="../assets/logo.png" alt="">
            </div>
            <!-- 登录区域 -->
            <el-form ref="loginfromRef" :model="LoginForm" :rules="rules" label-width="0px" class="login_form">
                <!-- 用户名 -->
                <el-form-item prop="username">
                    <el-input v-model="LoginForm.username" prefix-icon="iconfont icon-user" ></el-input>
                </el-form-item>
                <!-- 密码 -->
                <el-form-item prop="password">
                    <el-input v-model="LoginForm.password" prefix-icon="iconfont icon-3702mima" type="password"></el-input>
                </el-form-item>
                <!-- 按钮区 -->
                <el-form-item class="btns">
                    <el-button type="primary" @click="login">登录</el-button>
                    <el-button type="info" @click="restloginform">重置</el-button>
                </el-form-item>
            </el-form>
        </div>
    </div>
</template>

<script>
export default {
    data(){
        return{
            LoginForm:{
                username:'admin',
                password:'123456'
            },
            rules:{
                username:[
                    { required: true, message: '请输入用户名', trigger: 'blur' },
                    { min: 3, max: 6, message: '长度在 3 到 6 个字符', trigger: 'blur' }
                ],
                password:[
                    { required: true, message: '请输入登录密码', trigger: 'blur' },
                    { min: 3, max: 6, message: '长度在 3 到 6 个字符', trigger: 'blur' }                   
                ]
            }
        }
    },
    methods:{
        // 重置表单数据，清空数据
        restloginform(){
            this.$refs.loginfromRef.resetFields()
        },
        login(){
            this.$refs.loginfromRef.validate(async valid=>{
               // console.log(valid);
                if(!valid) return;
                const {data:res} = await this.$http.post('login',this.LoginForm)
                if(res.meta.status !==200) return this.$message.error('登录失败');
                this.$message.success('登录成功');
                window.sessionStorage.setItem("token",res.data.token)
                this.$router.push('/home');
            })
        }
    }
}
</script>

<style lang="less" scoped>
.login_container{
    height: 100%;
    background-color:pink;
}
.login_box{
    width: 450px;
    height: 300px;
    background-color: #fff;
    border-radius: 3px;
    position:absolute;
    left: 50%;
    top: 50%;
    transform: translate(-50%,-50%)
}
.avatar_box{
    width: 110px;
    height: 110px;
    border: 1px solid #ccc;
    border-radius: 50%;
    padding: 10px;
    box-shadow: 0 0 10px #ddd;
    position: absolute;
    left: 50%;
    transform: translate(-50%,-50%);
    background-color: #fff;
    img{
        width: 100%;
        height: 100%;
        border-radius: 50%;
        background-color: #eee;
    }
}
.btns{
    display: flex;
    justify-content: flex-end;
}
.login_form{
    width: 100%;
    position: absolute;
    bottom: 0;
    padding: 0 20px;
    box-sizing: border-box;
}
</style>