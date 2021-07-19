<template>
  <div class="roles">
    <!-- 面包屑导航区域 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>权限管理</el-breadcrumb-item>
      <el-breadcrumb-item>角色列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图区域 -->
    <el-card>
      <!-- 添加角色按钮 -->
      <el-row>
        <el-col>
          <el-button class="btn" type="primary" @click="addDialogVisible = true"
            >添加角色</el-button
          >
        </el-col>
      </el-row>
      <!-- 用户列表区域 -->
      <el-table :data="rolesList" border stripe>
        <!-- 展开列 -->
        <el-table-column type="expand">
          <template slot-scope="scope">
            <el-row
              class="border vcenter"
              v-for="item in scope.row.children"
              :key="item.id"
            >
              <!-- 渲染一级权限 -->
              <el-col :span="5">
                <el-tag closable @close="removeRolesById(scope.row, item.id)">{{
                  item.authName
                }}</el-tag>
                <i class="el-icon-caret-right"></i>
              </el-col>
              <!-- 渲染二级和三级权限 -->
              <el-col :span="19">
                <el-row
                  class="vcenter border"
                  v-for="ite in item.children"
                  :key="ite.id"
                >
                  <!-- 二级权限 -->
                  <el-col :span="6">
                    <el-tag
                      closable
                      type="success"
                      @close="removeRolesById(scope.row, ite.id)"
                      >{{ ite.authName }}</el-tag
                    >
                    <i class="el-icon-caret-right"></i>
                  </el-col>
                  <!-- 三级权限 -->
                  <el-col :span="18">
                    <el-tag
                      @close="removeRolesById(scope.row, it.id)"
                      closable
                      v-for="it in ite.children"
                      :key="it.id"
                      type="warning"
                      >{{ it.authName }}</el-tag
                    >
                  </el-col>
                </el-row>
              </el-col>
            </el-row>
          </template>
        </el-table-column>
        <!-- 索引列 -->
        <el-table-column type="index" label="#"></el-table-column>
        <el-table-column prop="roleName" label="角色名称"></el-table-column>
        <el-table-column prop="roleDesc" label="角色描述"></el-table-column>
        <el-table-column label="操作">
          <template slot-scope="scope">
            <el-button
              type="primary"
              icon="el-icon-edit"
              @click="showEditDialog(scope.row.id)"
              >编辑</el-button
            >
            <el-button
              type="danger"
              icon="el-icon-delete"
              @click="removeRolesById(scope.row.id)"
              >删除</el-button
            >
            <el-button
              type="warning"
              icon="el-icon-setting"
              @click="showSetRightDialog(scope.row)"
              >分配权限</el-button
            >
          </template>
        </el-table-column>
      </el-table>
    </el-card>
    <!-- 分配权限的对话框 -->
    <el-dialog
      title="分配权限"
      :visible.sync="setRightDialogVisible"
      width="40%"
      @close="setRightDialogClosed"
    >
      <!-- 树形控件 -->
      <el-tree
        :data="rightList"
        :props="treeProps"
        show-checkbox
        node-key="id"
        default-expand-all
        :default-checked-keys="defKeys"
        ref="treeRef"
      ></el-tree>
      <span slot="footer" class="dialog-footer">
        <el-button @click="setRightDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="allotRights">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 添加角色对话框 -->
    <el-dialog
      title="添加角色"
      :visible.sync="addDialogVisible"
      width="40%"
      @close="addDialogClose"
    >
      <!-- 添加用户内容主体区域 -->
      <el-form
        :model="addRoleForm"
        :rules="addRoleFormRules"
        ref="addRoleFormRef"
        label-width="80px"
      >
        <el-form-item label="角色名称" prop="roleName">
          <el-input v-model="addRoleForm.roleName"></el-input>
        </el-form-item>
        <el-form-item label="角色描述" prop="roleDesc">
          <el-input v-model="addRoleForm.roleDesc"></el-input>
        </el-form-item>
      </el-form>
      <!-- 底部区域 -->
      <span slot="footer" class="dialog-footer">
        <el-button @click="addDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addRoles">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 修改角色对话框 -->
    <el-dialog
      title="修改角色"
      :visible.sync="editDialogVisible"
      width="40%"
      @close="editDialogClosed"
    >
      <el-form
        :model="editRoleFrom"
        :rules="addRoleFormRules"
        ref="editRoleFromRef"
        label-width="80px"
      >
        <el-form-item label="角色名称" prop="roleName">
          <el-input v-model="editRoleFrom.roleName"></el-input>
        </el-form-item>
        <el-form-item label="角色描述" prop="roleDesc">
          <el-input v-model="editRoleFrom.roleDesc"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editRoles">确 定</el-button>
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
      rolesList: [],
      setRightDialogVisible: false,
      //   所有权限的数据
      rightList: [],
      // 树形控件
      treeProps: {
        label: "authName",
        children: "children",
      },
      //   默认选中的节点id值
      defKeys: [],
      roleId: "",
      // 添加角色对话框显示与隐藏
      addDialogVisible: false,
      // 添加角色的表单数据
      addRoleForm: {
        roleName: "",
        roleDesc: "",
      },
      //添加角色的验证规则
      addRoleFormRules: {
        roleName: [
          { required: true, message: "请输入角色名称", trigger: "blur" },
        ],
        roleDesc: [
          { required: true, message: "请输入角色描述", trigger: "blur" },
        ],
      },
      // 根据id查询到的角色
      editRoleFrom: {},
      // 修改角色对话框显示与隐藏
      editDialogVisible: false,
    };
  },
  methods: {
    getrolesList() {
      Http({
        url: "roles",
        method: "get",
      }).then((res) => {
        // console.log(res);
        if (res.meta.status !== 200) {
          this.$message.error("获取权限列表失败");
        } else {
          this.rolesList = res.data;
        }
      });
    },
    // 根据id删除对应权限
    removeRolesById(role, rightId) {
      this.$confirm("此操作将永久删除该文件, 是否继续?", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
      })
        .then((res) => {
          // 确认删除
          Http({
            url: `roles/${role.id}/rights/${rightId}`,
            method: "delete",
          }).then((res) => {
            // console.log(res);

            if (res.meta.status !== 200) {
              this.$message.error("删除用户失败");
            } else {
              this.$message.success("删除成功");
              role.children = res.data;
            }
          });
        })
        .catch((err) => {
          this.$message.info("已取消删除");
        });
    },
    // 展示分配权限的对话框
    showSetRightDialog(role) {  
      this.getLeafKeys(role, this.defKeys);
      this.roleId = role.id;
      this.setRightDialogVisible = true;
      Http({
        url: "rights/tree",
        method: "get",
      }).then((res) => {
        // console.log(res);
        if (res.meta.status !== 200) {
          this.$message.error("获取权限数据失败");
        } else {
          this.rightList = res.data;
        }
      });
    },
    // 通过递归的形式 获取三级下所有权限的id
    getLeafKeys(node, arr) {
      if (!node.children) {
        return arr.push(node.id);
      } else {
        node.children.forEach((item) => {
          this.getLeafKeys(item, arr);
        });
      }
    },
    // 监听分配权限对话框的关闭事件
    setRightDialogClosed() {
      this.defKeys = [];
    },
    // 点击为角色分配权限
    allotRights() {
      const keys = [
        ...this.$refs.treeRef.getCheckedKeys(),
        ...this.$refs.treeRef.getHalfCheckedKeys(),
      ];
      const idStr = keys.join(",");
      //   console.log(this.roleId);
      Http({
        url: `roles/${this.roleId}/rights`,
        method: "post",
        data: {
          rids: idStr,
        },
      }).then((res) => {
        //   console.log(res);
        if (res.meta.status !== 200) {
          this.$message.error("分配权限失败");
        } else {
          this.$message.success("分配权限成功");
          this.getrolesList();
          this.setRightDialogVisible = false;
        }
      });
    },
    // 添加角色框的点击按钮 添加新角色
    addRoles() {
      this.$refs.addRoleFormRef.validate((valid) => {
        if (!valid) {
          return;
        } else {
          Http({
            url: "roles",
            method: "post",
            data: {
              roleName: this.addRoleForm.roleName,
              roleDesc: this.addRoleForm.roleDesc,
            },
          }).then((res) => {
            if (res.meta.status !== 201) {
              this.$message.error("添加角色失败");
            } else {
              this.$message.success("添加角色成功");
              // 添加框隐藏
              this.addDialogVisible = false;
              // 重新获取数据
              this.getrolesList();
            }
          });
        }
      });
    },
    // 添加角色框的关闭事件
    addDialogClose() {
      this.$refs.addRoleFormRef.resetFields();
    },
    // 修改角色框的关闭事件
    editDialogClosed() {
      this.$refs.editRoleFromRef.resetFields();
    },
    // 展示编辑角色的对话框
    showEditDialog(id) {
      this.editDialogVisible = true;
      Http({
        url: `roles/${id}`,
        method: "get",
      }).then((res) => {
        // console.log(res);
        if (res.meta.status !== 200) {
          this.$message.error("查询用户信息失败");
        } else {
          this.editRoleFrom = res.data;
        }
      });
    },
    // 修改角色信息并提交
    editRoles() {
      this.$refs.editRoleFromRef.validate((valid) => {
        if (!valid) {
          return;
        } else {
          // 发起修改角色信息的数据请求
          Http({
            url: `roles/${this.editRoleFrom.roleId}`,
            method: "put",
            data: {
              roleName: this.editRoleFrom.roleName,
              roleDesc: this.editRoleFrom.roleDesc,
            },
          }).then((res) => {
            // console.log(res);
            if (res.meta.status !== 200) {
              this.$message.error("修改角色信息失败");
            } else {
              this.$message.success("修改角色信息成功");
              // 关闭对话框
              this.editDialogVisible = false;
              this.getrolesList();
            }
          });
        }
      });
    },
    // 根据id删角色
    removeRolesById(id) {
      this.$confirm("此操作将永久删除该用户, 是否继续?", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
      })
        .then((res) => {
          // 确认删除
          Http({
            url: `roles/${id}`,
            method: "delete",
          }).then((res) => {
            // console.log(res);
            if (res.meta.status !== 200) {
              this.$message.error("删除用户失败");
            } else {
              this.getrolesList();
              this.$message.success("删除成功");
            }
          });
        })
        .catch((err) => {
          this.$message.info("已取消删除");
        });
    },
  },
  components: {},
  mounted() {
    this.getrolesList();
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
.btn {
  margin-bottom: 15px;
}
.el-tag {
  margin: 7px;
}
.border {
  border-bottom: 1px solid #eee;
}
.vcenter {
  display: flex;
  align-items: center;
}
</style>
