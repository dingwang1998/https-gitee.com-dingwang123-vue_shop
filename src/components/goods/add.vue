<template>
    <div>
        <!-- 面包屑导航区域 -->
        <el-breadcrumb separator-class="el-icon-arrow-right">
            <el-breadcrumb-item :to="{ path: '/welcome' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item>商品管理</el-breadcrumb-item>
            <el-breadcrumb-item>添加商品</el-breadcrumb-item>
        </el-breadcrumb>
        <!-- 卡片视图 -->
        <el-card>
            <!-- 提示区域 -->
            <el-alert
            title="添加商品信息"
                type="info"
                show-icon
                center>
            </el-alert>
            <!-- 步骤条区域 -->
            <el-steps :space="200" :active="activeIndex -0" finish-status="success" align-center>
                <el-step title="基础信息"></el-step>
                <el-step title="商品参数"></el-step>
                <el-step title="商品属性"></el-step>
                <el-step title="商品图片"></el-step>
                <el-step title="商品内容"></el-step>
                <el-step title="完成"></el-step>
            </el-steps>
            <!-- 外面嵌套表单 -->
            <el-form :model="addForm" :rules="addFormRules" ref="addFormRef" label-width="100px" label-position="top">
                <!-- 添加步骤区域 -->
                <el-tabs :tab-position="'left'" v-model="activeIndex" :before-leave="beforeTableave" @tab-click="tabClicked" >
                    <el-tab-pane label="基础信息" name="0">
                        <el-form-item label="商品名称" prop="goods_name">
                            <el-input v-model="addForm.goods_name"></el-input>
                        </el-form-item>
                        <el-form-item label="商品价格" prop="goods_price">
                            <el-input v-model="addForm.goods_price" type="number"></el-input>
                        </el-form-item>
                        <el-form-item label="商品重量" prop="goods_weight">
                            <el-input v-model="addForm.goods_weight" type="number"></el-input>
                        </el-form-item>
                        <el-form-item label="商品数量" prop="goods_number">
                            <el-input v-model="addForm.goods_number" type="number"></el-input>
                        </el-form-item>
                        <el-form-item label="商品分类" prop="goods_cate">
                              <el-cascader
                                v-model="addForm.goods_cate"
                                :options="cateList"
                                expandTrigger= 'hover'
                                :props="cateProps"
                                @change="handleChange"></el-cascader>
                        </el-form-item>
                    </el-tab-pane>
                    <el-tab-pane label="商品参数" name="1">
                        <!-- 动态渲染表单 -->
                        <el-form-item :label="item.attr_name" v-for="item in manyTablelist" :key="item.attr_id">
                            <!-- 动态渲染many里面的vals -->
                            <el-checkbox-group v-model="item.attr_vals">
                                <el-checkbox :label="cb" v-for="(cb ,i) in item.attr_vals" :key="i" border></el-checkbox>
                            </el-checkbox-group>
                        </el-form-item>
                    </el-tab-pane>
                    <el-tab-pane label="商品属性" name="2">
                        <el-form-item :label="item.attr_name" v-for="item in onlyTablist" :key="item.attr_id">
                            <el-input v-model="item.attr_vals"></el-input>
                        </el-form-item>
                    </el-tab-pane>
                    <el-tab-pane label="商品图片" name="3">
                        <el-upload
                            :action="uploadURL"
                            :on-preview="handlePreview"
                            :on-remove="handleRemove"
                            list-type="picture"
                            :headers="headerobj"
                            :on-success= "handleSuccess">
                            <el-button size="small" type="primary">点击上传</el-button>
                        </el-upload>
                    </el-tab-pane>
                    <el-tab-pane label="商品内容" name="4">
                          <quill-editor v-model="addForm.goods_introduce">
                          </quill-editor>
                          <el-button type="primary" class="btnAdd" @click="add">添加商品</el-button>
                    </el-tab-pane>
                </el-tabs>
            </el-form>
        </el-card>
        <!-- 图片预览对话框 -->
        <el-dialog
            title="图片预览"
            :visible.sync="preivewVisible"
            width="50%">
            <img :src="previewPath" class="preivewSIMG">
        </el-dialog>
    </div>
</template>

<script>
import _ from 'lodash'
export default {
    data(){
        return{
            activeIndex:'0',
            addForm:{
                goods_name:'',
                goods_price:0,
                goods_weight:0,
                goods_number:0,
                // 级联选择器拿到的数组
                goods_cate:[],
                // 图片的临时路径
                pics:[],
                goods_introduce:'',
                // 被过滤的参数信息
                attrs:[]
            },
            addFormRules:{
                goods_name:[
                    {required: true, message: '请输入需要添加的名称', trigger: 'blur' }
                ],
                goods_price:[
                    {required: true, message: '请输入需要添加的价格', trigger: 'blur' }
                ],
                goods_weight:[
                    {required: true, message: '请输入需要添加的重量', trigger: 'blur' }
                ],
                goods_number:[
                    {required: true, message: '请输入需要添加的数量', trigger: 'blur' }
                ],
                goods_cate:[
                    {required: true, message: '请选择商品分类', trigger: 'blur' }
                ]             
            },
            // 数据分类列表
            cateList:[],
            cateProps:{
                value:'cat_id',
                label:'cat_name',
                children:'children'
            },
            // 动态参数列表
            manyTablelist:[],
            // 静态参数
            onlyTablist:[],
            // 图片请求的地址
            uploadURL:'http://127.0.0.1:8888/api/private/v1/upload',
            // 为上传头像设置请求头
            headerobj:{
                Authorization: window.sessionStorage.getItem('token')
            },
            //图片的服务器真实地址
            previewPath:'' ,
            // 预览图片对黄框
            preivewVisible:false
        }
    },
    created(){
        this.getCateList()
    },
    methods:{
        async getCateList(){
            const {data:res} = await this.$http.get('categories')
            if(res.meta.status !==200)
            {
                this.$message.error('获取商品分类失败')
            }
            this.cateList = res.data
            //console.log(this.cateList);
            
        },
        handleChange(){
            if(this.addForm.goods_cate.length !==3)
            {
                this.addForm.goods_cate = []
            }
            console.log(this.addForm.goods_cate)
        },
        // 监听tab切换到事件
        beforeTableave(activeName, oldActiveName){
            // old表示即将离开的页面序号 act表示即将进入的
            if(oldActiveName ==='0' && this.addForm.goods_cate.length !==3)
            {
                this.$message.error('请先选择商品分类')
                return false
            }
        },
        // 点击tab切换触发的事件
        async tabClicked(){
            if(this.activeIndex === '1')
            {
                const {data:res} = await this.$http.get(`categories/${this.CateId}/attributes`,{params:{sel:'many'}})
                if(res.meta.status !==200)
                {
                    this.$message.error('请求数据失败')
                }
                res.data.forEach(item=>{
                    item.attr_vals = item.attr_vals.length == 0? [] :item.attr_vals.split(' ')
                })
                this.manyTablelist = res.data
                console.log(this.manyTablelist)
            }else if(this.activeIndex === '2')
            {
                const {data:res} = await this.$http.get(`categories/${this.CateId}/attributes`,{params:{sel:'only'}})
                if(res.meta.status !==200)
                {
                    this.$message.error('请求数据失败')
                }
                this.onlyTablist = res.data
                console.log(this.onlyTablist)
            }
        },
        // 预览图片的事件
        handlePreview(file){
            this.previewPath = file.response.data.url
            this.preivewVisible = true
        },
        // 移除图片的事件
        handleRemove(file){
            // file能监听到图片的临时路径
            console.log(file)
            // 获取图片的临时路径
            const filePath = file.response.data.tmp_path
            // 找到路径对应的索引
            const i =  this.addForm.pics.findIndex(x=>x.pic === filePath)
            // 删除索引
            this.addForm.pics.splice(i,1)
            console.log(this.addForm.pics)   
        },
        // 监听图片上传成功后的事件
        handleSuccess(response){
            const picInfo = {
                pic:response.data.tmp_path
            }
            this.addForm.pics.push(picInfo)
            console.log(this.addForm.pics) 
        },
        add(){
            //console.log(this.addForm)
            this.$refs.addFormRef.validate(async vaild=>{
                if(!vaild){
                    return this.$message.error('请填写必要的选项')
                }
                // 应用ladash进行深拷贝
                const from =  _.cloneDeep(this.addForm)
                from.goods_cate = from.goods_cate.join(',')
                // 处理动态参数---渲染参数的时候把attr_vals渲染成了数组，需要再次join
                this.manyTablelist.forEach(item=>{
                    const newinfo = {
                        attr_id: item.attr_id,
                        attr_value: item.attr_vals.join(' ')
                    }
                    this.addForm.attrs.push(newinfo)
                })
                //处理静态数据
                this.onlyTablist.forEach(item=>{
                    const newinfo = {
                        attr_id:item.attr_id,
                        attr_value:item.attr_vals
                    }
                    this.addForm.attrs.push(newinfo)
                })
                from.attrs = this.addForm.attrs
                console.log(from)
                const {data: res} = await this.$http.post('goods',from)
                if(res.meta.status !==201)
                {
                    return this.$message.error('添加失败')
                }
                this.$message.success('添加成功')
                this.$router.push('/goods')
            })
        }
    },
    computed:{
        CateId(){
            if(this.addForm.goods_cate.length ===3)
            {
                return this.addForm.goods_cate[2]
            }
            return null
        }
    }
}
</script>

<style lang="less" scoped>
.el-checkbox{
    margin: 0 10px 0 0 !important;
}
.preivewSIMG{
    width: 100%;
}
.btnAdd{
    margin-top: 15px;
}
</style>