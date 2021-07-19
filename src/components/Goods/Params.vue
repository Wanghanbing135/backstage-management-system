<template>
  <div class="params">
    <!-- 面包屑导航区域 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>参数列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图区域 -->
    <el-card>
      <!-- 头部的警告区域 -->
      <el-alert
        :closable="false"
        title="注意: 只允许为第三级分类设置相关参数!"
        type="warning"
        show-icon
      >
      </el-alert>
      <!-- 选择商品分类区域 -->
      <el-row class="cat_opt">
        <el-col>
          <span>选择商品分类: </span>
          <!-- 选择商品分类的级联选择框 -->
          <el-cascader
            v-model="selectedCateKeys"
            :options="cateList"
            :props="cateProps"
            expandTrigger="hover"
            @change="handleChange"
          ></el-cascader>
        </el-col>
      </el-row>
      <!-- tab页签区域 -->
      <el-tabs v-model="activeName" @tab-click="handleTabClick">
        <!-- 添加动态参数 -->
        <el-tab-pane label="动态参数" name="many">
          <el-button
            class="btn"
            type="primary"
            size="mini"
            :disabled="isBtnDisabled"
            @click="addDialogVisible = true"
          >
            添加参数
          </el-button>
          <!-- 动态参数表格 -->
          <el-table :data="manyTabData" border stripe>
            <!-- 展开行 -->
            <el-table-column type="expand">
              <!-- 循环渲染tag标签 -->
              <template slot-scope="scope">
                <el-tag
                  closable
                  v-for="(ite, i) in scope.row.attr_vals"
                  :key="i"
                  @close="handleClose(i, scope.row)"
                >
                  {{ ite }}
                </el-tag>
                <!-- 添加tag标签 -->
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
                <el-button
                  v-else
                  class="button-new-tag"
                  size="small"
                  @click="showInput(scope.row)"
                  >+ New Tag</el-button
                >
              </template>
            </el-table-column>
            <!-- 索引列 -->
            <el-table-column type="index" label="#"> </el-table-column>
            <el-table-column label="参数名称" prop="attr_name">
            </el-table-column>
            <el-table-column label="操作">
              <template slot-scope="scope">
                <!-- 编辑按钮 -->
                <el-button
                  @click="showEditDialog(scope.row.attr_id)"
                  icon="el-icon-edit"
                  type="primary"
                  >编辑</el-button
                >
                <!-- 删除按钮 -->
                <el-button
                  @click="removeParamsById(scope.row.attr_id)"
                  icon="el-icon-delete"
                  type="danger"
                  >删除</el-button
                >
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
        <!-- 添加静态属性  -->
        <el-tab-pane label="静态属性" name="only">
          <el-button
            class="btn"
            type="primary"
            size="mini"
            :disabled="isBtnDisabled"
            @click="addDialogVisible = true"
            >添加属性</el-button
          >
          <!-- 静态参数表格 -->
          <el-table :data="onlyTabData" border stripe>
            <!-- 展开行 -->
            <el-table-column type="expand">
              <!-- 循环渲染tag标签 -->
              <template slot-scope="scope">
                <el-tag
                  closable
                  v-for="(ite, i) in scope.row.attr_vals"
                  :key="i"
                  @close="handleClose(i, scope.row)"
                >
                  {{ ite }}
                </el-tag>
                <!-- 添加tag标签 -->
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
                <el-button
                  v-else
                  class="button-new-tag"
                  size="small"
                  @click="showInput(scope.row)"
                  >+ New Tag</el-button
                >
              </template>
            </el-table-column>
            <el-table-column type="index" label="#"> </el-table-column>
            <el-table-column label="属性名称" prop="attr_name">
            </el-table-column>
            <el-table-column label="操作">
              <template slot-scope="scope">
                <!-- 编辑按钮 -->
                <el-button
                  @click="showEditDialog(scope.row.attr_id)"
                  icon="el-icon-edit"
                  type="primary"
                  >编辑</el-button
                >
                <!-- 删除按钮 -->
                <el-button
                  @click="removeParamsById(scope.row.attr_id)"
                  icon="el-icon-delete"
                  type="danger"
                  >删除</el-button
                >
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
      </el-tabs>
    </el-card>
    <!-- 添加参数对话框 -->
    <el-dialog
      :title="`添加${titleText}`"
      :visible.sync="addDialogVisible"
      width="40%"
      @close="addDialogClose"
    >
      <!-- 添加参数的对话框 -->
      <el-form
        ref="addFormRef"
        :rules="addFormRules"
        :model="addForm"
        label-width="80px"
      >
        <el-form-item :label="titleText" prop="attr_name">
          <el-input v-model="addForm.attr_name"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addParams">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 修改参数的对话框 -->
    <el-dialog
      :title="`修改${titleText}`"
      :visible.sync="editDialogVisible"
      width="40%"
      @close="editDialogClosed"
    >
      <!-- 修改参数的对话框  -->
      <el-form
        ref="editFormRef"
        :rules="editFormRules"
        :model="editForm"
        label-width="80px"
      >
        <el-form-item :label="titleText" prop="attr_name">
          <el-input v-model="editForm.attr_name"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editParams">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import Http from "../../http/index.js";
export default {
  props: {},
  data() {
    return {
      // 所有商品分类
      cateList: [],
      //   级联选择框的配置对象
      cateProps: {
        value: "cat_id",
        label: "cat_name",
        children: "children",
      },
      //   级联选择框双向绑定的数组
      selectedCateKeys: [],
      // 被激活页签的名称
      activeName: "many",
      //动态参数定义
      manyTabData: [],
      //静态参数定义
      onlyTabData: [],
      //   控制添加对话框的显示与隐藏
      addDialogVisible: false,
      //   添加参数的表单数据对象
      addForm: {
        attr_name: "",
      },
      // 添加表单的验证规则
      addFormRules: {
        attr_name: [
          { required: true, message: "请输入参数名称", trigger: "blur" },
        ],
      },
      // 修改参数对话框的显示与隐藏
      editDialogVisible: false,
      // 修改的表单数据的对象
      editForm: {},
      // 修改参数表单的验证
      editFormRules: {
        attr_name: [
          { required: true, message: "请输入参数名称", trigger: "blur" },
        ],
      },
    };
  },
  methods: {
    //   获取所有商品分类
    getCateList() {
      Http({
        url: "categories",
        method: "get",
      }).then((res) => {
        // console.log(res.data);
        if (res.meta.status !== 200) {
          this.$message.error("获取商品分类失败");
        } else {
          this.cateList = res.data;
        }
      });
    },
    // 级联选择框选中项变化，会触发的函数
    handleChange() {
      // 证明选中的不是三级分类
      if (this.selectedCateKeys.length !== 3) {
        this.selectedCateKeys = [];
        this.manyTabData = [];
        this.onlyTabData = [];
        return;
      } else {
        this.getParamsData();
      }
    },
    //   根据所选分类的id，和当前所处的面板，获取对应的参数
    getParamsData() {
      Http({
        url: `categories/${this.cateId}/attributes`,
        method: "get",
        params: {
          sel: this.activeName,
        },
      }).then((res) => {
        // console.log(res);
        if (res.meta.status !== 200) {
          // this.$message.error("获取参数列表失败");
          return;
        } else {
          res.data.forEach((item) => {
            item.attr_vals = item.attr_vals ? item.attr_vals.split(" ") : [];
            //控制文本框的显示与隐藏
            item.inputVisible = false;
            // 文本框中输入的值
            item.inputValue = "";
          });
          // console.log(res.data);
          if (this.activeName === "many") {
            this.manyTabData = res.data;
          } else {
            this.onlyTabData = res.data;
          }
        }
      });
    },
    // tab页签点击事件的处理函数
    handleTabClick() {
      this.getParamsData();
    },
    // 监听添加对话框的关闭事件
    addDialogClose() {
      this.$refs.addFormRef.resetFields();
    },
    // 点击按钮添加参数
    addParams() {
      this.$refs.addFormRef.validate((valid) => {
        if (!valid) {
          return;
        } else {
          Http({
            url: `categories/${this.cateId}/attributes`,
            method: "post",
            data: {
              attr_name: this.addForm.attr_name,
              attr_sel: this.activeName,
            },
          }).then((res) => {
            // console.log(res);
            if (res.meta.status !== 201) {
              this.$message.error("添加参数失败");
            } else {
              this.$message.success("添加参数成功");
              // 重新获取数据
              this.getParamsData();
              // 添加框隐藏  validate
              this.addDialogVisible = false;
            }
          });
        }
      });
    },
    // 点击按钮显示修改属性对话框
    showEditDialog(attr_id) {
      // 查询当前参数的信息
      Http({
        url: `categories/${this.cateId}/attributes/${attr_id}`,
        method: "get",
        params: {
          attr_sel: this.activeName,
        },
      }).then((res) => {
        // console.log(res);
        if (res.meta.status !== 200) {
          this.$message.error("获取参数信息");
        } else {
          this.editForm = res.data;
        }
      });
      this.editDialogVisible = true;
    },
    // 修改参数框的关闭事件
    editDialogClosed() {
      this.$refs.editFormRef.resetFields();
    },
    // 点击按钮修改对话框
    editParams() {
      this.$refs.editFormRef.validate((valid) => {
        if (!valid) {
          return;
        } else {
          Http({
            url: `categories/${this.cateId}/attributes/${this.editForm.attr_id}`,
            method: "put",
            data: {
              attr_name: this.editForm.attr_name,
              attr_sel: this.activeName,
            },
          }).then((res) => {
            // console.log(res);
            if (res.meta.status !== 200) {
              this.$message.error("修改参数失败");
            } else {
              this.$message.success("修改参数成功");
              // 重新获取数据
              this.getParamsData();
              // 修改框隐藏
              this.editDialogVisible = false;
            }
          });
        }
      });
    },
    // 根据id删参数  change
    removeParamsById(id) {
      // console.log(id);
      this.$confirm("此操作将永久删除该参数, 是否继续?", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
      })
        .then((res) => {
          // 确认删除
          Http({
            url: `categories/${this.cateId}/attributes/${id}`,
            method: "delete",
          }).then((res) => {
            // console.log(res);
            if (res.meta.status !== 200) {
              this.$message.error("删除参数失败");
            } else {
              this.getParamsData();
              this.$message.success("删除参数成功");
            }
          });
        })
        .catch((err) => {
          this.$message.info("已取消删除");
        });
    },
    // 点击按钮展示input框
    showInput(row) {
      row.inputVisible = true;
      this.$nextTick((_) => {
        this.$refs.saveTagInput.$refs.input.focus();
      });
    },
    // 添加tag标签的处理函数
    handleInputConfirm(row) {
      if (row.inputValue.trim().length === 0) {
        (row.inputValue = ""), (row.inputVisible = false);
        return;
      } else {
        row.attr_vals.push(row.inputValue.trim());
        row.inputValue = "";
        row.inputVisible = false;
        console.log(row.attr_sel);
        // 发起请求保存到数据库中
        this.saveAttrVals(row);
      }
    },
    // 将对attr_valsd 的操作保存到数据库
    saveAttrVals(row) {
      // 发起请求保存到数据库中
      Http({
        url: `categories/${this.cateId}/attributes/${row.attr_id}`,
        method: "put",
        data: {
          attr_name: row.attr_name,
          attr_sel: row.attr_sel,
          attr_vals: row.attr_vals.join(" "),
        },
      }).then((res) => {
        // console.log(res);
        if (res.meta.status !== 200) {
          this.$message.error("修改参数失败");
        } else {
          this.$message.success("修改参数成功");
        }
      });
    },
    // 删除对应的参数和选项
    handleClose(i, row) {
      row.attr_vals.splice(i, 1);
      this.saveAttrVals(row);
    },
  },
  computed: {
    //   如果按钮需要被禁用则返回 true ,否则返回false
    isBtnDisabled() {
      if (this.selectedCateKeys.length !== 3) {
        return true;
      } else {
        return false;
      }
    },
    // 当前选中的三级分类
    cateId() {
      if (this.selectedCateKeys.length === 3) {
        return this.selectedCateKeys[2];
      } else {
        return null;
      }
    },
    // 动态计算标题的文本
    titleText() {
      if (this.activeName === "many") {
        return "动态参数";
      } else {
        return "静态参数";
      }
    },
  },
  mounted() {
    this.getCateList();
  },
};
</script>

<style scoped lang="less">
.el-breadcrumb {
  margin-bottom: 15px;
}
.el-card {
  box-shadow: 0 1px 1px rgba(0, 0, 0, 0.15);
}
.cat_opt {
  margin: 15px 0;
}
.btn {
  margin-bottom: 15px;
}
.el-tag,
.button-new-tag {
  margin-left: 10px;
}
.input-new-tag {
  width: 100px;
  margin-left: 10px;
}
</style>
