<template>
    <div>
        <!-- 面包屑导航区域 -->
        <el-breadcrumb separator-class="el-icon-arrow-right">
            <el-breadcrumb-item :to="{ path: '/welcome' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item>商品管理</el-breadcrumb-item>
            <el-breadcrumb-item>商品分类</el-breadcrumb-item>
        </el-breadcrumb>
        <!-- 卡片视图 -->
        <el-card>
            <el-row>
                <el-col>
                    <el-button type="primary" @click="showAdddialog">添加分类</el-button>
                </el-col>
            </el-row>
            <!-- 表格区域 -->
            <tree-table class="treeTable" :data= "Catelist" :columns="columns" border :selection-type="false" 
            :expand-type="false" show-index index-text="#" :show-row-hover="false">
                <!-- 是否有效模板 -->
                <template slot="isok" slot-scope="scope">
                    <i class="el-icon-success" v-if="scope.row.cat_deleted === false" style="color:lightgreen"></i>
                    <i class="el-icon-error" v-else style="color:red"></i>
                </template>
                <!-- 排序模板 -->
                <template slot="order" slot-scope="scope">
                    <el-tag size="mini" v-if="scope.row.cat_level===0">一级</el-tag>
                    <el-tag type="success" size="mini" v-else-if= "scope.row.cat_level===1">二级</el-tag>
                    <el-tag type="warning" size="mini" v-else>三级</el-tag>
                </template>
                <!-- 操作模板 -->
                <template slot="ipt" slot-scope="scope">
                    <el-button type="primary" icon="el-icon-edit" size="mini">编辑</el-button>
                    <el-button type="danger" icon="el-icon-delete" size="mini">删除</el-button>
                </template>
            </tree-table>
            <!-- 分页区 -->
                <el-pagination
                    @size-change="handleSizeChange"
                    @current-change="handleCurrentChange"
                    :current-page="queryinfo.pagenum"
                    :page-sizes="[3, 5, 10, 15]"
                    :page-size="queryinfo.pagesize"
                    layout="total, sizes, prev, pager, next, jumper"
                    :total="total">
                </el-pagination>
        </el-card>
            <el-cascader
                v-model="selectedKeys"
                :options="parentCatelist"
                 expandTrigger= 'hover'
                :props="cascaderProps"
                @change="handleChange">
            </el-cascader>
        <!-- 添加分类的对话框 -->
        <el-dialog
            title="添加分类"
            :visible.sync="addCatedialogVisible"
            width="50%" @close = "addCatedialogClose">
            <!-- 要输入的表单区 -->
            <el-form :rules= "addCateFromRules" ref="addCateFromRef" :model="addCatefrom" label-width="100px">
                <el-form-item label="分类名称" prop="cat_name">
                    <el-input v-model="addCatefrom.cat_name"></el-input>
                </el-form-item>
                <el-form-item  label="父类名称">
                      <el-cascader
                        v-model="selectedKeys"
                        :options="parentCatelist"
                         expandTrigger= 'hover' 
                        :props="cascaderProps"
                        @change="handleChange" clearable></el-cascader>
                </el-form-item>
            </el-form>
            <span slot="footer" class="dialog-footer">
                <el-button @click="addCatedialogVisible= false">取 消</el-button>
                <el-button type="primary" @click="addCate">确 定</el-button>
            </span>
        </el-dialog>
    </div>
</template>
<script>
export default {
    data(){
        return{
            // 商品列表请求信息
            queryinfo:{
                type:3,
                pagenum:1,
                pagesize:5
            },
            //获取的商品信息
            Catelist:[],
            // 获取的总数据条数
            total:0,
            // 表格属性
            columns: [
                {
                    label: '分类名称',
                    prop: 'cat_name'
                },
                {
                    label:'是否有效',
                    // 自定义模板列
                    type:'template',
                    // 模板名称
                    template:'isok'
                },
                {
                    label:'排序',
                    // 自定义模板列
                    type:'template',
                    // 模板名称
                    template:'order'
                },
                {
                    label:'操作',
                    // 自定义模板列
                    type:'template',
                    // 模板名称
                    template:'ipt'
                }
            ],
            // 控制添加对话框的开关按钮
            addCatedialogVisible:false,
            //表单添加的内容区
            addCatefrom:{
                //表单添加的名称
                cat_name:'',
                // 父级分类的id
                cat_pid:0,
                // 分类的等级，默认是一等级
                cat_level:0
            },
            // 表单规则
            addCateFromRules:{
                cat_name:[
                    { required: true, message: '请输入需要添加的名称', trigger: 'blur' }
                ]
            },
            //父集分类的列表
            parentCatelist:[],
            // 级联选择器规则
            cascaderProps:{
                value:'cat_id',
                label:'cat_name',
                children:'children'
            },
            //级联选择器区到的id
            selectedKeys:[]
        }
    },
    created(){
        this.getCatelist()
    },
    methods:{
        async getCatelist(){
            const {data:res} = await this.$http.get('categories',{params:this.queryinfo})
            if(res.meta.status !==200)
            {
                this.$message.error('请求数据失败')
            }
            //console.log(res.data)
            this.Catelist = res.data.result
            this.total = res.data.total
        },
        // 监听一页需要显示的条数变化
        handleSizeChange(newSize){
            this.queryinfo.pagesize = newSize
            this.getCatelist()
        },
        // 监听需要用几页去显示
        handleCurrentChange(newPage){
            this.queryinfo.pagenum = newPage
            this.getCatelist()
        },
        //展示添加对话框
        showAdddialog(){
            this.getparentCatelist()
            this.addCatedialogVisible = true
        },
        // 获取父集节点元素
        async getparentCatelist(){
            const {data:res} = await this.$http.get('categories',{params:{type:2}})
            if(res.meta.status !==200)
            {
                this.$message.error('获取父集节点失败')   
            }
            //console.log(res.data)
            this.parentCatelist = res.data
            //console.log(this.parentCatelist);
            
        },
        // 监听级联选择添加id的等级和父亲的id
        handleChange(){
            console.log(this.selectedKeys)
            if(this.selectedKeys.length>0)
            {
                this.addCatefrom.cat_pid = this.selectedKeys[this.selectedKeys.length-1]
                this.addCatefrom.cat_level = this.selectedKeys.length
            }else
            {
                this.addCatefrom.cat_pid = 0
                this.addCatefrom.cat_level= 0
            }
        },
        // 点击确定添加分类
        addCate(){
            //console.log(this.addCatefrom)
            this.$refs.addCateFromRef.validate( async vaild=>{
                if(!vaild) return
                const {data:res} = await this.$http.post('categories',this.addCatefrom)
                if(res.meta.status !==201)
                {
                    this.$message.error('添加分类失败')
                }
                this.$message.success('添加分类成功')
                this.getCatelist()
                this.addCatedialogVisible = false
            })
        },
        //关闭对话框情况所有的对话框选择数据
        addCatedialogClose(){
            this.$refs.addCateFromRef.resetFields()
            this.selectedKeys = []
            this.addCatefrom.cat_pid = 0
            this.addCatefrom.cat_level = 0
        }
    }
}
</script>
<style lang="less" scoped>
.treeTable{
    margin-top: 15px;
}
.el-cascader{
    width: 100%;
}
</style>