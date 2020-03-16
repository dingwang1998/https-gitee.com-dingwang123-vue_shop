<template>
    <div>
        <!-- 面包屑导航区域 -->
        <el-breadcrumb separator-class="el-icon-arrow-right">
            <el-breadcrumb-item :to="{ path: '/welcome' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item>订单管理</el-breadcrumb-item>
            <el-breadcrumb-item>订单列表</el-breadcrumb-item>
        </el-breadcrumb>
        <!-- 卡片视图 -->
        <el-card>
            <!-- 搜索框 -->
            <el-row :gutter="20">
                <el-col :span="8">
                    <el-input placeholder="请输入内容" v-model= "queryInfo.query" >
                        <el-button slot="append" icon="el-icon-search" @click="btngetlist"></el-button>
                    </el-input>
                </el-col>
            </el-row>
            <!-- 表格区域 -->
            <el-table :data="OrderList" stripe border>
                <el-table-column type="index"></el-table-column>
                <el-table-column label="订单编号" prop="order_number"></el-table-column>
                <el-table-column label="订单价格" prop="order_price"></el-table-column>
                <el-table-column label="是否付款" >
                    <template slot-scope="scope">
                        <el-tag type="success" v-if="scope.row.order_pay ==='1'">已付款</el-tag>
                        <el-tag type="danger" v-else>未付款</el-tag>
                    </template>
                </el-table-column>
                <el-table-column label="是否发货" prop="is_send"></el-table-column>
                <el-table-column label="下单时间" >
                    <template slot-scope="scope">
                        {{scope.row.create_time |dateFormat}}
                    </template>
                </el-table-column>
                <el-table-column label="操作" >
                    <template slot-scope="scope">
                        <el-button type="primary" icon="el-icon-edit" size="mini" @click="showbox"></el-button>
                        <el-button type="danger" icon="el-icon-location" size="mini" @click="showprogressbox"></el-button>
                    </template>
                </el-table-column>
            </el-table>
            <!-- 分页区 -->
            <el-pagination
                @size-change="handleSizeChange"
                @current-change="handleCurrentChange"
                :current-page= queryInfo.pagenum
                :page-sizes="[10, 15, 20, 25]"
                :page-size= queryInfo.pagesize
                layout="total, sizes, prev, pager, next, jumper"
                :total= total>
            </el-pagination>
        </el-card>
        <!-- 修改地址对话框 -->
        <el-dialog
            title="修改地址"
            :visible.sync="addressVisible"
            width="50%"
            @close = "addressDigoVisible">
            <!-- 表单区域 -->
            <el-form :model="addressForm" :rules="addressFormRules" ref="addressFormRef" label-width="100px" class="demo-ruleForm">
                <el-form-item label="省市区/县" prop="address1">
                    <el-cascader
                        v-model="addressForm.address1"
                        :options="cityData"
                        :props="{ expandTrigger: 'hover' }"
                        @change="handleChange">
                    </el-cascader>
                </el-form-item>
                <el-form-item label="详细地址" prop="address2">
                    <el-input v-model="addressForm.address2"></el-input>
                </el-form-item>
            </el-form>
            <span slot="footer" class="dialog-footer">
                <el-button @click="addressVisible = false">取 消</el-button>
                <el-button type="primary" @click="addressVisible = false">确 定</el-button>
            </span>
        </el-dialog>
        <!-- 展示物流进度的对话框 -->
        <el-dialog
            title="物流进度"
            :visible.sync="progressVisible"
            width="50%">
                 <!-- 时间线 -->
                <el-timeline>
                    <el-timeline-item
                    v-for="(activity, index) in progressInfo"
                    :key="index"
                    :timestamp="activity.time">
                    {{activity.context}}
                    </el-timeline-item>
                </el-timeline>
            <span slot="footer" class="dialog-footer">
                <el-button @click="progressVisible = false">取 消</el-button>
                <el-button type="primary" @click="progressVisible = false">确 定</el-button>
            </span>
        </el-dialog>
    </div>
</template>

<script>
import cityData from './citydata'
export default {
    data(){
        return{
            queryInfo:{
                query:'',
                pagenum:1,
                pagesize:10
            },
            total:0,
            OrderList:[],
            addressVisible:false,
            addressForm:{
                address1:[],
                address2:''
            },
            addressFormRules:{
                address1:[
                    { required: true, message: '请选择对应的地区', trigger: 'blur' }
                ],
                address2:[
                    { required: true, message: '请输入详细地址', trigger: 'blur' }
                ]
            },
            cityData,
            // 物流对话框
            progressVisible:false,
            // 物流信息
            progressInfo:[]
        }
    },
    created(){
        this.getOrderList()
    },
    methods:{
        async getOrderList(){
            const {data:res}= await this.$http.get('orders',{params:this.queryInfo})
            if(res.meta.status !==200)
            {
                this.$message.error('列表获取失败')
            }
            this.OrderList = res.data.goods
            this.total = res.data.total
            console.log(this.OrderList)
        },
        handleSizeChange(newSize){
            this.queryInfo.pagesize =  newSize
            this.getOrderList()
        },
        handleCurrentChange(newPage){
            this.queryInfo.pagenum = newPage
            this.getOrderList()
        },
        //查询未实现
        btngetlist()
        {
            this.getOrderList()
        },
        // 修改地址对话框
        showbox(){
            this.addressVisible = true
        },
        addressDigoVisible(){
            this.$refs.addressFormRef.resetFields()
        },
        // 监听级联选择器的结果
        handleChange(){
            console.log(this.addressForm.address1)  
        },
        // 监听物流的对话框
        async showprogressbox()
        {
            this.progressVisible = true
            const {data:res} = await this.$http.get('/kuaidi/1106975712662')
            if(res.meta.status !==200)
            {
                return this.$message.error('获取物流信息失败')
            }
            this.progressInfo = res.data
            console.log(this.progressInfo)
            
        }
    }
}
</script>

<style lang="less" scoped>

@import '../../plugins/timeline/timeline.css';
@import '../../plugins/timeline-item/timeline-item.css';

.el-cascader{
    width: 100%;
}
</style>