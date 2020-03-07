<template>
    <!-- 面包屑导航区域 -->
    <div>
        <el-breadcrumb separator-class="el-icon-arrow-right">
            <el-breadcrumb-item :to="{ path: '/welcome' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item>用户管理</el-breadcrumb-item>
            <el-breadcrumb-item>用户列表</el-breadcrumb-item>
        </el-breadcrumb>
        <!-- 卡片布局区 -->
        <el-card>
            <!-- 左右间距布局 -->
            <el-row :gutter="20">
                <el-col :span="7">
                    <el-input placeholder="请输入内容" v-model="queryinfo.query" clearable  @clear ="getUserslist()"> 
                        <el-button slot="append" icon="el-icon-search" @click="getUserslist()"></el-button>
                    </el-input>
                </el-col>
                <el-col :span="6">
                    <el-button type="primary"  @click="addDialogVisible = true">添加用户</el-button>
                </el-col>
            </el-row>
            <!-- 表格区 -->
            <el-table :data="userlist" border stripe>
                    <el-table-column type="index"></el-table-column>
                    <el-table-column label = "姓名" prop = "username"></el-table-column>
                    <el-table-column label = "邮箱" prop = "email"></el-table-column>
                    <el-table-column label = "电话" prop = "mobile"></el-table-column>
                    <el-table-column label = "角色" prop = "role_name"></el-table-column>
                    <el-table-column label = "状态" prop = "mg_state">
                        <template slot-scope="scope">
                            <el-switch v-model="scope.row.mg_state" @change = "userStateChanged(scope.row)">
                            </el-switch>
                        </template>
                    </el-table-column>
                    <el-table-column label = "操作" width="180px">
                        <template slot-scope="scope">
                            <!-- 修改按钮 -->
                            <el-button type="primary" icon="el-icon-edit" size="mini" @click ="showDialogVisible(scope.row.id)"></el-button>
                            <!-- 删除按钮 -->
                            <el-button type="danger" icon="el-icon-delete" size="mini" @click="removeUserbyId(scope.row.id)"></el-button>
                            <!-- 分配角色按钮 -->
                            <el-tooltip effect="dark" content="分配角色" placement="top" :enterable="false">
                                <el-button type="waring" icon="el-icon-share" size="mini"></el-button>
                            </el-tooltip>
                        </template>
                    </el-table-column>
            </el-table>
            <!-- 分页区 -->
            <el-pagination
                @size-change="handleSizeChange"
                @current-change="handleCurrentChange"
                :current-page="queryinfo.pagenum"
                :page-sizes="[1, 2, 3, 5]"
                :page-size="100"
                layout="total, sizes, prev, pager, next, jumper"
                :total="total">
            </el-pagination>
        </el-card>
        <!-- 对话框 添加部分-->
        <el-dialog title="添加用户" :visible.sync="addDialogVisible" width="50%" @close="addDialogCLosed">
        <!-- 对话框主体区域 -->
            <el-form :model="addForm" :rules="addFormrules" ref="addFormRef" label-width="70px" >
                <el-form-item label="用户名" prop="username">
                    <el-input v-model="addForm.username"></el-input>
                </el-form-item>
                <el-form-item label="密码" prop="password">
                    <el-input v-model="addForm.password"></el-input>
                </el-form-item>
                <el-form-item label="邮箱" prop="emali">
                    <el-input v-model="addForm.emali"></el-input>
                </el-form-item>
                <el-form-item label="手机" prop="mobile">
                    <el-input v-model="addForm.mobile"></el-input>
                </el-form-item>
            </el-form>
            <!-- 对话框的两个按钮 -->
            <span slot="footer" class="dialog-footer">
                <el-button @click="addDialogVisible =false">取 消</el-button>
                <el-button type="primary" @click="addUser">确 定</el-button>
            </span>
        </el-dialog>

        <!-- 对话框 修改部分 -->
        <el-dialog
            title="修改用户"
            :visible.sync="eidtDialogVisible"
            width="50%"
            @close = "eidtDialogClosed">
            <!-- 表单区 -->
            <el-form :model="eidtFrom" :rules="eidtFromRules" ref="eidtFromRef" label-width="70px" >
                <el-form-item label="用户名">
                    <el-input v-model="eidtFrom.username" disabled></el-input>
                </el-form-item>
                <el-form-item label="邮箱" prop = "email">
                    <el-input v-model="eidtFrom.email"></el-input>
                </el-form-item>
                <el-form-item label="手机" prop = "mobile">
                    <el-input v-model="eidtFrom.mobile"></el-input>
                </el-form-item>
            </el-form>
            <span slot="footer" class="dialog-footer">
                <el-button @click= "eidtDialogVisible =false">取 消</el-button>
                <el-button type="primary" @click= "editUserInfo">确 定</el-button>
            </span>
        </el-dialog>
    </div>
</template>

<script>
export default {
    data(){
        // 添加表单验证规则 ----邮箱规则
        var checkEmail = (rules,value,cb)=>{
            const regEmail =  /^[A-Za-z\d]+([-_.][A-Za-z\d]+)*@([A-Za-z\d]+[-.])+[A-Za-z\d]{2,4}$/; 
            if(regEmail.test(value)){
                return cb()
            }
            cb(new Error('请输入合法邮箱'))
        }
        // 添加表单验证规则 ----手机规则
        var checkMobile = (rules,value,cb)=>{
            const regMobile = /^(13[0-9]|14[5|7]|15[0|1|2|3|4|5|6|7|8|9]|18[0|1|2|3|5|6|7|8|9])\d{8}$/
            if(regMobile.test(value)){
                return cb()
            }
            cb(new Error('请输入合法手机号'))
        }
        return{
            queryinfo:{
                query:'',
                // 当前的页数
                pagenum:1,
                // 每页有几条
                pagesize:2
            },
            userlist:[],
            total:0,
            // 添加用户对话框的显示与隐藏
            addDialogVisible:false,
            // 添加用户的表单数据
            addForm:{
                username:'',
                password:'',
                emali:'',
                mobile:''
            },
            // 添加表单的验证规则
            addFormrules:{
                username:[
                    { required: true, message: '请输入用户名', trigger: 'blur' },
                    { min: 3, max: 6, message: '长度在 3 到 6 个字符', trigger: 'blur' }
                ],
                password:[
                    { required: true, message: '请输入密码', trigger: 'blur' },
                    { min: 6, max: 15, message: '长度在 6 到 15 个字符', trigger: 'blur' }
                ],
                emali:[
                    { required: true, message: '请输入密码', trigger: 'blur' },
                    { min: 6, max: 15, message: '长度在 6 到 15 个字符', trigger: 'blur' },
                    { validator: checkEmail, trigger: 'blur' }
                ],
                mobile:[
                    { required: true, message: '请输入密码', trigger: 'blur' },
                    { min: 6, max: 15, message: '长度在 6 到 15 个字符', trigger: 'blur' },
                    { validator: checkMobile, trigger: 'blur' }
                ]
            },
            // 修改用户对话框的显示与隐藏
            eidtDialogVisible:false,
            // 查询到的新数据
            eidtFrom:{},
            eidtFromRules:{
                emali:[
                    { required: true, message: '请输入邮箱', trigger: 'blur' },
                    { min: 6, max: 15, message: '长度在 6 到 15 个字符', trigger: 'blur' },
                    { validator: checkEmail, trigger: 'blur' }
                ],
                mobile:[
                    { required: true, message: '请输入手机号', trigger: 'blur' },
                    { min: 6, max: 15, message: '长度在 6 到 15 个字符', trigger: 'blur' },
                    { validator: checkMobile, trigger: 'blur' }
                ]
            }
        }
    },
    created(){
        this.getUserslist()
    },
    methods:{
        async getUserslist(){
            const { data: res } = await this.$http.get('users',{params:this.queryinfo})
            if(res.meta.status !== 200)
            {
                return this.$message.error('获取用户列表失败');
            }
            //console.log(res);
            this.userlist = res.data.users
            this.total = res.data.total
        },
        // 监听每页有几条
        handleSizeChange(newsize){
            //console.log(newsize)
            this.queryinfo.pagesize = newsize
            this.getUserslist()
        },
        // 监听有几页
        handleCurrentChange(newpage){
            //console.log(newpage);
            this.queryinfo.pagenum = newpage
            this.getUserslist()
        },
        // 监听swith开关的改变状态
        async userStateChanged(userinfo){
            //console.log(userinfo)
            const{data:res} = await this.$http.put(`users/${userinfo.id}/state/${userinfo.mg_state}`)
            //console.log(res);
            if(res.meta.status != 200){
                return this.$message.error('更新用户失败')
                userinfo.mg_state = !userinfo.mg_state
            }
            this.$message.success('用户更新状态成功')
        },
        // 关闭对话框清空表单数据
        addDialogCLosed(){
            this.$refs.addFormRef.resetFields()
        },
        // 表单的校验
        addUser(){
            this.$refs.addFormRef.validate(async vaild=>{
                //console.log(vaild)
                if(!vaild) return 
                // 再发起网络的添加用户的网络请求
                const {data:res} = await this.$http.post('users',this.addForm)
                if(res.meta.status !==201)
                {
                    this.$message.error('添加用户失败')
                }
                this.$message.success('添加用户成功')
                this.addDialogVisible = false
                this.getUserslist()
            })
        },
        // 展示编辑用户对话框
        async showDialogVisible(id){
            //console.log(id);
            const {data:res} = await this.$http.get('users/' + id)
            if(res.meta.status !== 200)
            {
                this.$message.error('编辑失败')
            }
            this.eidtFrom = res.data
            this.eidtDialogVisible = true
        },
        //重置取消后表单的数据
        eidtDialogClosed(){
            this.$refs.eidtFromRef.resetFields()
        },
        // 表单预验证加上修改
        editUserInfo(){
            this.$refs.eidtFromRef.validate(async vail=>{
                if(!vail) return
                const {data:res} = await this.$http.put('users/'+ this.eidtFrom.id,
                    {
                    emali:this.eidtFrom.emali,
                    mobile:this.eidtFrom.mobile
                    }
                )
                console.log(res.data)
                
                if(res.meta.status !== 200){
                    return this.$message.error('更新用户失败')
                }
                this.eidtDialogVisible = false
                this.getUserslist()
                this.$message.success('更新用户成功啦')
            })   
        },
        // 根据id删除对应的用户信息
        async removeUserbyId(id){
            // 弹框确定是否删除用户星系
            const confirmResult =  await this.$confirm(
                '此操作将永久删除该用户, 是否继续?', 
                '提示', 
            {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
            }
            ).catch(err=>err)
            // 如果用户确认删除，则返回值为字符串confirm
            // 如果用户取消删除，则返回值为字符串cancel
            if(confirmResult !== 'confirm')
            {
                return this.$message.info('已取消删除')
            }
            //console.log('确认了删除')
            const {data:res} =  await this.$http.delete('users/'+id)
            if(res.meta.status != 200){
                return this.$message.error('删除用户失败了')
            }
            this.$message.success('删除用户成功了')
            this.getUserslist()
       }
    }
}
</script>
<style lang="less" scoped>
.el-breadcrumb{
    margin-bottom: 20px;
}
.el-table{
    margin-top:10px;
    font-size: 12px;
}
</style>