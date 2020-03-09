<template>
    <div>
        <!-- 面包屑导航区域 -->
        <el-breadcrumb separator-class="el-icon-arrow-right">
            <el-breadcrumb-item :to="{ path: '/welcome' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item>权限管理</el-breadcrumb-item>
            <el-breadcrumb-item>权限列表</el-breadcrumb-item>
        </el-breadcrumb>
        <!-- 卡片区域 -->
        <el-card>
            <!-- 添加角色区域 -->
            <el-row>
                <el-col>
                    <el-button type="primary">添加角色</el-button>
                </el-col>
            </el-row>
            <!-- 表格区域 -->
            <el-table :data = "RolesList" border stripe>
                <!-- 展开列 -->
                <el-table-column type="expand">
                    <template slot-scope="scope">
                        <el-row :class="['bdbottom', i1===0? 'bdtop':'','vcerter']" :gutter="20" v-for= "(item1,i1) in scope.row.children" :key="item1.id">
                            <!--第一列 一级权限 -->
                            <el-col :span= "5">
                                <el-tag closable @close= "removeRightById(scope.row,item1.id)">{{item1.authName}}</el-tag>
                                <i class="el-icon-caret-right"></i>
                            </el-col>
                            <!--  第二列 写入二级和三级权限 -->
                            <el-col :span= "19">
                                <el-row :class="[i2 ===0? '':'bdtop','vcerter']" v-for= "(item2,i2) in item1.children" :key="item2.id">
                                    <!-- 二级权限 -->
                                    <el-col :span = "6">
                                        <el-tag type= "success" closable @close= "removeRightById(scope.row,item2.id)">{{item2.authName}}</el-tag>
                                        <i class="el-icon-caret-right"></i>
                                    </el-col>
                                    <!-- 三级权限 -->
                                    <el-col :span = "18">
                                      <el-tag type="warning" v-for="(item3) in item2.children" :key="item3.id" closable @close= "removeRightById(scope.row,item3.id)">
                                          {{item3.authName}}
                                      </el-tag >
                                    </el-col>
                                </el-row>
                            </el-col>
                        </el-row>
                    </template>
                </el-table-column>
                <!-- 索引列 -->
                <el-table-column type= "index"></el-table-column>
                <el-table-column label ="角色名称"  prop="roleName"></el-table-column>
                <el-table-column label ="角色描述"  prop="roleDesc"></el-table-column>
                <el-table-column label ="操作" width="290px">
                    <template slot-scope="scope">
                        <el-button type="primary" icon="el-icon-edit" size="mini">编辑</el-button>
                        <el-button type="danger" icon="el-icon-delete" size="mini">删除</el-button>
                        <el-button type="waring" icon="el-icon-setting" size="mini" @click="showsetRightsDialog(scope.row)">分配权限</el-button>
                    </template>
                </el-table-column>
            </el-table>
        </el-card>
        <!-- 弹出分配权限窗口 -->
        <el-dialog
            title="分配权限"
            :visible.sync="setRightsDialogVisible"
            width="50%" @close ="setRightsDialogVclose">
            <!-- 树形结构 -->
            <el-tree :data="Rightlist" :props="treeProps" show-checkbox node-key ="id" default-expand-all :default-checked-keys ="defkeys" ref="Reftree"></el-tree>
            <span slot="footer" class="dialog-footer">
                <el-button @click="setRightsDialogVisible = false">取 消</el-button>
                <el-button type="primary" @click="allotRights" >确 定</el-button>
            </span>
        </el-dialog>
    </div>
</template>
<script>
export default {
    data(){
        return{
            // 角色列表信息
            RolesList:[],
            setRightsDialogVisible: false,
            // 所有权限列表
            Rightlist:[],
            treeProps:{
                label:'authName',
                children:'children'
            },
            // 默认选中的节点id值 id给到这个数组就会被选中
            defkeys:[],
            // 每个角色的id
            roleId:''
        }
    },
    created(){
        this.getRolesList()
    },
    methods:{
        async getRolesList(){
            const {data:res} = await this.$http.get('roles')
            this.RolesList = res.data
            //console.log(this.RolesList)     
        },
        // 根据id去删除权限
        async removeRightById(role,rightId){
            const confirmRuselt= await this.$confirm('此操作将永久删除该文件, 是否继续?', '提示', {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
            }).catch(err=>err)
            if(confirmRuselt !=='confirm')
            {
                return this.$message.info('已取消删除')
            }
            //console.log('已经删除');
            const {data:res}=  await this.$http.delete(`roles/${role.id}/rights/${rightId}`)
            if(res.meta.status !==200)
            {
                this.$message.error('删除权限失败')
            }
            this.$message.success('删除权限成功')
            role.children = res.data
        },
        // 控制分配权限的对话框 打开对话框
        async showsetRightsDialog(role)
        {
            // 打开对话框拿到对应角色的id
            this.roleId = role.id
            this.setRightsDialogVisible =true
            const {data:res} =  await this.$http.get('rights/tree')
            if(res.meta.status !==200)
            {
                this.$message.error('获取权限失败')
            }
            this.Rightlist = res.data
            //console.log(this.Rightlist) 
            this.getLeafKeys(role,this.defkeys)
        },
        // 被调用的递归函数
        getLeafKeys(node,arr){
            // 如果node不包含children，则是第三节点
            if(!node.children)
            {
                return arr.push(node.id)
            }
            node.children.forEach(item => {
                this.getLeafKeys(item,arr)
            })
        },
        // 监听关闭并清空三级权限被选中的默认值
        setRightsDialogVclose(){
            this.defkeys = [] 
        },
        // 添加权限
        async allotRights(){
            const keys= [
                ...this.$refs.Reftree.getCheckedKeys(),
                ...this.$refs.Reftree.getHalfCheckedKeys()
            ]
            const Idstr = keys.join(',')  
            //console.log(Idstr)
            const {data:res} =  await this.$http.post(`roles/${this.roleId}/rights`,{rids:Idstr})
            if(res.meta.status !==200)
            {
                this.$message.error('授权失败')
            }
            this.$message.success('授权成功啦')
            this.getRolesList()
            this.setRightsDialogVisible = false
        }
    }
}
</script>
<style lang="less">
.el-breadcrumb{
    margin-bottom: 20px;
}
.el-table{
    margin-top: 15px;
}
.el-tag{
    margin: 7px;
}
.bdtop{
    border-top: 1px solid #eee;
}
.bdbottom{
    border-bottom: 1px solid #eee;
}
.vcerter{
    display: flex;
    align-items: center;
}
</style>