<template>
    <div>
        <!-- 面包屑导航区域 -->
        <el-breadcrumb separator-class="el-icon-arrow-right">
            <el-breadcrumb-item :to="{ path: '/welcome' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item>商品管理</el-breadcrumb-item>
            <el-breadcrumb-item>商品列表</el-breadcrumb-item>
        </el-breadcrumb>
        <!-- 卡片视图 -->
        <el-card>
            <!-- loya布局区域 -->
            <el-row :gutter="20">
                <!-- 搜素框 -->
                <el-col :span="8">
                    <el-input placeholder="请输入内容" v-model="queryInfo.query" clearable @clear="getGoodlist">
                    <el-button slot="append" icon="el-icon-search" @click="getGoodlist"></el-button>
                    </el-input>
                </el-col>
                <!-- 添加框 -->
                <el-col :span="4">
                    <el-button type="primary" @click="goAddpage">添加商品</el-button>
                </el-col>
            </el-row>
            <!-- 表格区域 -->
            <el-table :data= "goodslist" border stripe>
                <el-table-column type="index"></el-table-column>
                <el-table-column label="商品名称"  prop="goods_name"></el-table-column>
                <el-table-column label="商品价格(元)"  prop="goods_price" width="95px"></el-table-column>
                <el-table-column label="商品重量"  prop="goods_weight" width="60px"></el-table-column>
                <el-table-column label="创建时间"  prop="add_time" width="198px">
                    <template slot-scope="scope">
                        {{scope.row.add_time | dateFormat}}
                    </template>
                </el-table-column>
                <el-table-column label="操作" width="130px">
                    <template slot-scope="scope">
                        <el-button type="primary" icon="el-icon-edit" size="mini"></el-button>
                        <el-button type="danger" icon="el-icon-delete" size="mini" @click="removeByid(scope.row.goods_id)"></el-button>
                    </template>
                </el-table-column>
            </el-table>
            <!-- 分页区 -->
            <el-pagination
                @size-change="handleSizeChange"
                @current-change="handleCurrentChange"
                :current-page="queryInfo.pagenum"
                :page-sizes="[5, 10, 15, 20]"
                :page-size="queryInfo.pagesize"
                layout="total, sizes, prev, pager, next, jumper"
                :total="total">
            </el-pagination>
        </el-card>
    </div>
</template>

<script>
export default {
    data(){
        return{
            // 查询商品传递的参数
            queryInfo:{
                query:'',
                pagenum:1,
                pagesize:10
            },
            // 请求的商品参数列表
            goodslist:[],
            total:0
        }
    },
    created(){
        this.getGoodlist()
    },
    methods:{
        // 获取列表数据
        async getGoodlist(){
            const {data:res} = await this.$http.get('goods',{params:this.queryInfo})
            if(res.meta.status !==200){
                return this.$message.error('请求列表失败')
            }
            this.$message.success('获取列表成功')
            this.goodslist = res.data.goods
            console.log(this.goodslist)
            this.total = res.data.total
        },
        // 监控页面显示的条数
        handleSizeChange(newSize){
            this.queryInfo.pagesize = newSize
            this.getGoodlist()
        },
        // 监控需要的页数
        handleCurrentChange(newPage){
            this.queryInfo.pagenum = newPage
            this.getGoodlist()
        },
        //点击删除按钮删除商品
        async removeByid(id){
            const confirmResult = await this.$confirm('此操作将永久删除该商品, 是否继续?', '提示', {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
            }).catch(err=>err)
            if(confirmResult !== 'confirm')
            {
               return this.$message.info('已取消删除')
            }
            const {data:res} = await this.$http.delete(`goods/${id}`)
            if(res.meta.status !==200)
            {
                this.$message.error('删除失败')
            }
            this.getGoodlist()
            this.$message.success('删除商品成功啦')
        },
        // 去往增加的页面
        goAddpage(){
            this.$router.push('goods/add')
        }
    }
}
</script>

<style lang="less" scoped>

</style>