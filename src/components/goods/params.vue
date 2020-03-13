<template>
    <div>
        <!-- 面包屑导航区域 -->
        <el-breadcrumb separator-class="el-icon-arrow-right">
            <el-breadcrumb-item :to="{ path: '/welcome' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item>商品管理</el-breadcrumb-item>
            <el-breadcrumb-item>参数列表</el-breadcrumb-item>
        </el-breadcrumb>
        <!-- 卡片视图 -->
        <el-card>
            <!-- 提示区域 -->
            <el-alert
                title="注意：只允许第三级分类设置相关属性"
                type="warning"
                :closable ="false"
                show-icon>
            </el-alert>
            <!-- 商品选择分类区 -->
            <el-row :gutter="20">
                <el-col >
                    <span>选择商品分类:</span>
                    <el-cascader
                        v-model="selectedCateKeys"
                        :options="Catelist"
                        expandTrigger='hover'
                        :props="Cateprops"
                        @change="handleChange"
                        clearable>
                    </el-cascader>
                </el-col>
            </el-row>
            <!-- tab 页标区 -->
            <el-tabs v-model="activeName" @tab-click="handleClick">
                    <!-- 添加动态参数的页面 -->
                    <el-tab-pane label="动态参数" name="many">
                        <el-button type="primary" size="mini" :disabled ="isbtnDisabled" @click="CatedialogVisible=true">添加参数</el-button>
                        <!-- 动态数据渲染 -->
                        <el-table :data="manyTabData" border stripe>
                            <!-- 展开行数据 -->
                            <el-table-column type="expand">
                                <!-- 展开后的详细数据 -->
                                <template slot-scope="scope">
                                    <!-- 渲染每个已有数据的按钮 -->
                                    <el-tag v-for="(item,i) in scope.row.attr_vals" :key ="i" closable @close= "handleClose(i,scope.row)">{{item}}</el-tag>
                                    <!-- 展开后可以添加的按钮 -->
                                    <el-input
                                        class="input-new-tag"
                                        v-if="scope.row.inputVisible"
                                        v-model="scope.row.inputValue"
                                        ref="saveTagInput"
                                        size="small"
                                        @keyup.enter.native="handleInputConfirm(scope.row)"
                                        @blur="handleInputConfirm(scope.row)"
                                        >
                                    </el-input>
                                    <el-button v-else class="button-new-tag" size="small" @click="showInput(scope.row)">+ New Tag</el-button>
                                </template>
                            </el-table-column>
                            <el-table-column type="index"></el-table-column>
                            <el-table-column label="参数名称" prop ="attr_name"></el-table-column>
                            <el-table-column label="操作">
                                <template slot-scope="scope">
                                    <el-button type="primary" icon="el-icon-edit" @click="showEditdiglog(scope.row.attr_id)">编辑</el-button>
                                    <el-button type="danger" icon="el-icon-delete" @click="removeParams(scope.row.attr_id)">删除</el-button>
                                </template>
                            </el-table-column>
                        </el-table>
                    </el-tab-pane>
                    <!-- 添加静态页面 -->
                    <el-tab-pane label="静态属性" name="only">
                        <el-button type="primary" size="mini" :disabled ="isbtnDisabled" @click="CatedialogVisible=true">添加属性</el-button>
                        <!-- 渲染静态表格 -->
                        <el-table :data="onlyTabData" border stripe>
                            <el-table-column type="expand">
                                <!-- 展开后的详细数据 -->
                                <template slot-scope="scope">
                                    <!-- 渲染每个已有数据的按钮 -->
                                    <el-tag v-for="(item,i) in scope.row.attr_vals" :key ="i" closable @close= "handleClose(i,scope.row)">{{item}}</el-tag>
                                    <!-- 展开后可以添加的按钮 -->
                                    <el-input
                                        class="input-new-tag"
                                        v-if="scope.row.inputVisible"
                                        v-model="scope.row.inputValue"
                                        ref="saveTagInput"
                                        size="small"
                                        @keyup.enter.native="handleInputConfirm(scope.row)"
                                        @blur="handleInputConfirm(scope.row)"
                                        >
                                    </el-input>
                                    <el-button v-else class="button-new-tag" size="small" @click="showInput(scope.row)">+ New Tag</el-button>
                                </template>
                            </el-table-column>
                            <el-table-column type="index"></el-table-column>
                            <el-table-column label="属性名称" prop ="attr_name"></el-table-column>
                            <el-table-column label="操作">
                                <template slot-scope="scope">
                                    <el-button type="primary" icon="el-icon-edit" @click="showEditdiglog(scope.row.attr_id)">编辑</el-button>
                                    <el-button type="danger" icon="el-icon-delete" @click="removeParams(scope.row.attr_id)">删除</el-button>
                                </template>
                            </el-table-column>
                        </el-table>
                    </el-tab-pane>
            </el-tabs>
        </el-card>
        <!-- 添加对话框 -->
        <el-dialog
            :title="'添加'+Titletext"
            :visible.sync="CatedialogVisible"
            width="50%" @close= "CatedialogClosed">
            <el-form :model="addForm" :rules="addFormRules" ref="addFormRef" label-width="100px">
                <el-form-item :label="Titletext" prop="attr_name">
                    <el-input v-model="addForm.attr_name"></el-input>
                </el-form-item>
            </el-form>
            <span slot="footer" class="dialog-footer">
                <el-button @click="CatedialogVisible = false">取 消</el-button>
                <el-button type="primary" @click="addParams" >确 定</el-button>
            </span>
        </el-dialog>
        <!-- 修改对话框 -->
        <el-dialog
            :title="'修改'+Titletext"
            :visible.sync="editDialog"
            width="50%" @close= "editDialogClosed">
            <el-form :model="editForm" :rules="addFormRules" ref="editFormRef" label-width="100px">
                <el-form-item :label="Titletext" prop="attr_name">
                    <el-input v-model="editForm.attr_name"></el-input>
                </el-form-item>
            </el-form>
            <span slot="footer" class="dialog-footer">
                <el-button @click="editDialog = false">取 消</el-button>
                <el-button type="primary" @click="editParams" >确 定</el-button>
            </span>
        </el-dialog>
    </div>
    
</template>

<script>
export default {
    data(){
        return{
            //获取的所有分类数据
            Catelist:[],
            // 级联规则
            Cateprops:{
                value:'cat_id',
                label:'cat_name',
                children:'children'
            },
            //级联选择点击监听的数组
            selectedCateKeys:[],
            // 页标绑定内容区域
            activeName:'many',
            //获取的动态参数
            manyTabData:[],
            //获取得静态参数
            onlyTabData:[],
            // 控制对话框按钮
            CatedialogVisible:false,
            // 表单数据
            addForm:{
                attr_name:''
            },
            // 表单规则
            addFormRules:{
                attr_name:[
                    { required: true, message: '请输入参数名称', trigger: 'blur' }
                ]
            },
            // 修改对话框的控制
            editDialog:false,
            // 修改的表单
            editForm:{
                attr_name:''
            }
        }
    },
    created(){
        this.getCateList()
    },
    methods:{
        // 获取数据类型
        async getCateList(){
            const {data:res} =  await this.$http.get('categories')
            if(res.meta.status !==200)
            {
                this.$message.error('获取分类信息失败')
            }
            this.Catelist = res.data
            console.log(this.Catelist)
        },
        // 监听级联选择框
        handleChange(){
            // 调用获取参数列表
            this.getParamsData()
        },
        // 监听tab页面的切换
        handleClick(){
            this.getParamsData()
            console.log(this.activeName)
        },
        // 获取参数的函数
        async getParamsData(){
            //console.log(this.selectedCateKeys)
            if(this.selectedCateKeys.length !==3)
            {
                this.selectedCateKeys =[]
                this.manyTabData = []
                this.onlyTabData = []
                return
            }
            console.log(this.selectedCateKeys)
            const {data:res} = await this.$http.get(`categories/${this.Cateid}/attributes`,{params:{sel:this.activeName}})   
            if(res.meta.status !==200)
            {
                this.$message.error('请求添加数据失败')
            }
            //将data数据里面的attr_vals转化为数组
            res.data.forEach(item=>{
                item.attr_vals = item.attr_vals ? item.attr_vals.split(' '):[]
                // 控住button和input按钮的切换
                item.inputVisible = false
                // 按钮转换为input后的值
                item.inputValue =''
            })
            console.log(res.data)
            if(this.activeName ==='many')
            {
                this.manyTabData = res.data
            }else{
                this.onlyTabData = res.data
            }
        },
        // 关闭对表单进行清空
        CatedialogClosed(){
            this.$refs.addFormRef.resetFields()
        },
        // 点击添加数据
        addParams(){
            this.$refs.addFormRef.validate(async vaild=>{
                if(!vaild) return
                const {data:res} = await this.$http.post(`categories/${this.Cateid}/attributes`,{
                    attr_name:this.addForm.attr_name,
                    attr_sel:this.activeName
                })
                if(res.meta.status !==201)
                {
                    return this.$message.error('添加属性失败')
                }
                this.$message.success('添加属性成功')
                this.getParamsData()
                this.CatedialogVisible = false
            })
        },
        // 关闭修改对话框对话框清空表单
        editDialogClosed(){
            this.$refs.editFormRef.resetFields()
        },
        // 编辑对话框的打开根据id查询到数据渲染到表单
        async showEditdiglog(attr_id){
            this.editDialog = true
            const {data:res} = await this.$http.get(`categories/${this.Cateid}/attributes/${attr_id}`,{params:{
                attr_sel:this.activeName
            }})
            if(res.meta.status !==200)
            {
               this.$message.error('查询数据失败')
            }
            this.editForm = res.data
            //console.log(this.editForm)
        },
        // 点击确认修改参数
        editParams()
        {
            this.$refs.editFormRef.validate(async vail=>{
                if(!vail) return
                const {data:res}= await this.$http.put(`categories/${this.Cateid}/attributes/${this.editForm.attr_id}`,
                {
                    attr_name:this.editForm.attr_name,
                    attr_sel:this.activeName
                })
                if(res.meta.status !==200)
                {
                    this.$message.error('修改数据失败')
                }
                this.$message.success('修改参数成功')
                this.getParamsData()
                this.editDialog =false
            })
        },
        // 点击删除删除数据
        async removeParams(attr_id)
        {
            const confirmResult=  await this.$confirm('此操作将永久删除该参数, 是否继续?', '提示', {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
            }).catch(err=>err)
            if(confirmResult !== 'confirm')
            {
                this.$message.info('已经取消删除')
            }
            const {data:res} = await this.$http.delete(`categories/${this.Cateid}/attributes/${attr_id}`)
            if(res.meta.status !==200)
            {
                this.$message.error('删除参数失败了')
            }
            this.$message.success('删除参数成功了')
            this.getParamsData()
        },
        // input失去焦点 或者按下enter都会触发的事件
        async handleInputConfirm(row){
            if(row.inputValue.trim().length ===0)
                {
                    row.inputValue = ''
                    row.inputVisible = false
                    return
                }
            row.attr_vals.push(row.inputValue.trim())
            row.inputVisible =false
            row.inputValue = ''
            this.saveAttrvals(row)
        },
        // 新增或者删除 重新push数组到保存数据库的方法
        async saveAttrvals(row){
            const {data:res} = await this.$http.put(`categories/${this.Cateid}/attributes/${row.attr_id}`,{
                attr_name:row.attr_name,
                attr_sel:row.attr_sel,
                // 拼接字符串一定要打空格，不然格式没有转化
                attr_vals:row.attr_vals.join(' ')
            })
            if(res.meta.status !==200)
            {
                return this.$message.error('添加失败')
            }
            this.$message.success('修改参数成功')
        },
        // 点击button按钮的事件
        showInput(row){
            row.inputVisible =true
            //当页面重新渲染之后才会执行nexttick
            this.$nextTick(_ => {
                this.$refs.saveTagInput.$refs.input.focus()
            })
        },
        // tag关闭时再次提交数据库
        handleClose(i,row){
            row.attr_vals.splice(i,1)
            this.saveAttrvals(row)
        }
    },
    computed:{
        isbtnDisabled(){
            if(this.selectedCateKeys.length !==3)
            {
                return true
            }
            return false
        },
        Cateid(){
            if(this.selectedCateKeys.length ===3)
            {
                return this.selectedCateKeys[2]
            }
            return null
        },
        Titletext(){
            if(this.activeName == 'many')
            {
                return '商品参数'
            }
            else{
                return '商品属性'
            }
        }
    }
}
</script>

<style lang="less" scoped>
.el-row{
    margin: 15px 0;
}
.input-new-tag{
    width: 120px;
}
</style>