<template>
  <div class="categories">
    <!-- 面包屑导航区域 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品分类</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图区域 -->
    <el-card>
      <!-- 添加角色按钮 -->
      <el-row>
        <el-col>
          <el-button class="btn" type="primary" @click="showAddCateDialog"
            >添加分类</el-button
          >
        </el-col>
      </el-row>
      <!-- 用户列表区域 -->
      <tree-table
        :data="cateList"
        :columns="columns"
        :selection-type="false"
        :expand-type="false"
        :show-index="true"
        index-text="#"
        border
        :show-row-hover="false"
      >
        <!-- 是否有效 -->
        <template slot="isok" slot-scope="scope">
          <i
            class="el-icon-success"
            style="color: lightgreen"
            v-if="scope.row.cat_deleted === false"
          ></i>
          <i class="el-icon-error" style="color: red" v-else></i>
        </template>
        <!-- 排序 -->
        <template slot="order" slot-scope="scope">
          <el-tag v-if="scope.row.cat_level === 0">一级</el-tag>
          <el-tag type="success" v-else-if="scope.row.cat_level === 1"
            >二级</el-tag
          >
          <el-tag type="warning" v-else>三级</el-tag>
        </template>
        <!-- 操作 -->
        <template slot="opt" slot-scope="scope">
          <!-- 修改按钮 -->
          <el-button
            type="primary"
            icon="el-icon-edit"
            size="mini"
            @click="showEditDialog(scope.row.cat_id)"
            >编辑</el-button
          >
          <!-- 删除按钮 -->
          <el-button
            type="danger"
            icon="el-icon-delete"
            size="mini"
            @click="removeCateById(scope.row.cat_id)"
            >删除</el-button
          >
        </template>
      </tree-table>
      <!-- 分页区 -->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryInfo.pagenum"
        :page-sizes="[3, 5, 10, 15]"
        :page-size="queryInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
      >
      </el-pagination>
    </el-card>
    <!-- 添加分类的对话框 -->
    <el-dialog
      title="添加分类"
      :visible.sync="addDialogVisible"
      width="40%"
      @close="addDialogClose"
    >
      <!-- 添加分类内容主体区域 -->
      <el-form
        :model="addCateForm"
        :rules="addCateFormRules"
        ref="addCateFormRef"
        label-width="80px"
      >
        <el-form-item label="分类名称" prop="cat_name">
          <el-input v-model="addCateForm.cat_name"></el-input>
        </el-form-item>
        <el-form-item label="父级分类">
          <el-cascader
            v-model="selectedKeys"
            :options="parentCateList"
            expand-trigger="hover"
            :props="checkStrictly"
            @change="parentCateChanged"
            clearable
            change-on-select
          ></el-cascader>
        </el-form-item>
      </el-form>
      <!-- 底部区域 -->
      <span slot="footer" class="dialog-footer">
        <el-button @click="addDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addCate">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 修改商品分类对话框 -->
    <el-dialog
      title="修改分类"
      :visible.sync="editDialogVisible"
      width="40%"
      @close="editDialogClosed"
    >
      <el-form :model="editCateFrom" ref="editCateFromRef" label-width="80px">
        <el-form-item label="角色名称">
          <el-input v-model="editCateFrom.cat_name"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editCate">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import Http from "../../http/index.js";
export default {
  data() {
    return {
      // 获取所有商品列表数据
      cateList: [],
      //   查询条件
      queryInfo: {
        type: 3,
        pagenum: 1,
        pagesize: 5,
      },

      //   总数据条数
      total: 0,
      //   为table指定列的定义
      columns: [
        {
          label: "分类名称",
          prop: "cat_name",
        },
        {
          label: "是否有效",
          type: "template",
          template: "isok",
        },
        {
          label: "排序",
          type: "template",
          template: "order",
        },
        {
          label: "操作",
          type: "template",
          template: "opt",
        },
      ],
      //   添加分类内容的表单数据
      addCateForm: {
        cat_name: "",
        cat_level: 0,
        cat_pid: 0,
      },
      //添加分类内容的表单验证
      addCateFormRules: {
        cat_name: [
          { required: true, message: "请输入分类名称", trigger: "blur" },
        ],
      },
      //   添加分类框的显示与隐藏
      addDialogVisible: false,
      //   获取的父级分类数据
      parentCateList: [],
      //   指定级联选择器的配置对象
      checkStrictly: {
        value: "cat_id",
        label: "cat_name",
        children: "children",
      },
      // 选中的父级分类的数组
      selectedKeys: [],
      // 根据id查询到的商品分类
      editCateFrom: {},
      // 修改分类对话框显示与隐藏
      editDialogVisible: false,
    };
  },
  methods: {
    getcategoriesList() {
      Http({
        url: "categories",
        method: "get",
        params: this.queryInfo,
      }).then((res) => {
        // console.log(res.data.result);
        if (res.meta.status !== 200) {
          this.$message.error("获取商品分类失败");
        } else {
          this.cateList = res.data.result;
          this.total = res.data.total;
          //   console.log(this.cateList);
          //   console.log(this.total);
        }
      });
    },
    // 监听 pagesize 改变
    handleSizeChange(newSize) {
      this.queryInfo.pagesize = newSize;
      this.getcategoriesList();
    },
    // 监听页码值改变的事件
    handleCurrentChange(newPage) {
      // console.log(newPage);
      this.queryInfo.pagenum = newPage;
      this.getcategoriesList();
    },

    // 获取父级分类商品列表数据
    getParentCateList() {
      Http({
        url: "categories",
        method: "get",
        params: {
          type: 2,
        },
      }).then((res) => {
        // console.log(res);
        if (res.meta.status !== 200) {
          this.$message.error("获取父级商品分类失败");
        } else {
          console.log(res.data);
          this.parentCateList = res.data;
        }
      });
    },
    // 选择项发生变化出发
    parentCateChanged() {
      if (this.selectedKeys.length > 0) {
        //   父级分类的id
        this.addCateForm.cat_pid =
          this.selectedKeys[this.selectedKeys.length - 1];
        this.addCateForm.cat_level = this.selectedKeys.length;
      } else {
        this.addCateForm.cat_pid = 0;
        this.addCateForm.cat_level = 0;
      }
    },
    // 添加分类框的点击按钮 添加新角色
    addCate() {
      this.$refs.addCateFormRef.validate((valid) => {
        if (!valid) {
          return;
        } else {
          Http({
            url: "categories",
            method: "post",
            data: {
              cat_name: this.addCateForm.cat_name,
              cat_pid: this.addCateForm.cat_pid,
              cat_level: this.addCateForm.cat_level,
            },
          }).then((res) => {
            // console.log(res);
            if (res.meta.status !== 201) {
              this.$message.error("添加分类失败");
            } else {
              this.$message.success("添加分类成功");
              // 重新获取数据
              this.getcategoriesList();
              // 添加框隐藏 
              this.addDialogVisible = false;
            }
          });
        }
      });
    },
    // 展示添加分类的对话框
    showAddCateDialog() {
      // 获取父级分类的数据
      this.getParentCateList();
      this.addDialogVisible = true;
    },
    // 添加角色框的关闭事件
    addDialogClose() {
      this.$refs.addCateFormRef.resetFields();
      this.selectedKeys = [];
      this.addCateForm.cat_level = 0;
      this.addCateForm.cat_pid = 0;
    },
    // 修改分类框的关闭事件
    editDialogClosed() {
      this.$refs.editCateFromRef.resetFields();
    },
    // 展示编辑分类的对话框
    showEditDialog(id) {
      this.editDialogVisible = true;
      Http({
        url: `categories/${id}`,
        method: "get",
      }).then((res) => {
        // console.log(res);
        if (res.meta.status !== 200) {
          this.$message.error("查询分类信息失败");
        } else {
          this.editCateFrom = res.data;
        }
      });
    },
    // 修改角色信息并提交
    editCate() {
      this.$refs.editCateFromRef.validate((valid) => {
        if (!valid) {
          return;
        } else {
          // 发起修改分类信息的数据请求
          Http({
            url: `categories/${this.editCateFrom.cat_id}`,
            method: "put",
            data: {
              cat_name: this.editCateFrom.cat_name,
            },
          }).then((res) => {
            // console.log(res);
            if (res.meta.status !== 200) {
              this.$message.error("修改分类信息失败");
            } else {
              this.$message.success("修改分类信息成功");
              // 关闭对话框
              this.editDialogVisible = false;
              this.getcategoriesList();
            }
          });
        }
      });
    },
    // 根据id删分类
    removeCateById(id) {
      // console.log(id);
      this.$confirm("此操作将永久删除该分类, 是否继续?", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
      })
        .then((res) => {
          // 确认删除
          Http({
            url: `categories/${id}`,
            method: "delete",
          }).then((res) => {
            // console.log(res);
            if (res.meta.status !== 200) {
              this.$message.error("删除用户失败");
            } else {
              this.getcategoriesList();
              this.$message.success("删除用户成功");
            }
          });
        })
        .catch((err) => {
          this.$message.info("已取消删除");
        });
    },
  },
  mounted() {
    this.getcategoriesList();
  },
  components: {},
};
</script>

<style scoped lang="less">
.el-breadcrumb {
  margin-bottom: 15px;
}
.el-card {
  box-shadow: 0 1px 1px rgba(0, 0, 0, 0.15);
}
.btn {
  margin-bottom: 15px;
}
.el-tag {
  margin: 7px;
}
.border {
  border-bottom: 1px solid #eee;
}
.el-cascader {
  width: 100%;
}
</style>
