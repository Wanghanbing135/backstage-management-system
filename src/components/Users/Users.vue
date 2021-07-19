<template>
  <div class="users">
    <!-- 面包屑导航区域 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>用户管理</el-breadcrumb-item>
      <el-breadcrumb-item>用户列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图区域 -->
    <el-card>
      <el-row :gutter="20">
        <!-- 搜索与添加区域 -->
        <el-col :span="8">
          <el-input
            placeholder="请输入内容"
            v-model="queryInfo.query"
            clearable
            @clear="getUserList"
            @change="getUserList"
          >
            <el-button
              slot="append"
              icon="el-icon-search"
              @click="getUserList"
            ></el-button>
          </el-input>
        </el-col>
        <el-col :span="4">
          <el-button type="primary" @click="addDialogVisible = true"
            >添加用户</el-button
          >
        </el-col>
      </el-row>
      <!-- 用户列表区域 -->
      <el-table :data="userList" border stripe>
        <el-table-column type="index" label="#"></el-table-column>
        <el-table-column prop="username" label="姓名"></el-table-column>
        <el-table-column prop="email" label="邮箱"></el-table-column>
        <el-table-column prop="mobile" label="电话"> </el-table-column>
        <el-table-column prop="role_name" label="角色"> </el-table-column>
        <el-table-column label="状态">
          <template slot-scope="scope">
            <el-switch
              v-model="scope.row.mg_state"
              @change="userStateChanged(scope.row)"
            >
            </el-switch>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="180px">
          <template slot-scope="scope">
            <!-- 修改按钮 -->
            <el-button
              type="primary"
              icon="el-icon-edit"
              size="mini"
              @click="showEditDialog(scope.row.id)"
            ></el-button>
            <!-- 删除按钮 -->
            <el-button
              type="danger"
              icon="el-icon-delete"
              size="mini"
              @click="removeUserById(scope.row.id)"
            ></el-button>
            <!-- 分配角色按钮 -->
            <el-tooltip
              effect="dark"
              content="分配角色"
              :enterable="false"
              placement="top"
            >
              <el-button
                @click="setRole(scope.row)"
                type="warning"
                icon="el-icon-setting"
                size="mini"
              ></el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>
      <!-- 分页区 -->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryInfo.pagenum"
        :page-sizes="[1, 2, 3, 4]"
        :page-size="queryInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
      >
      </el-pagination>
    </el-card>
    <!-- 添加用户的对话框 -->
    <el-dialog
      title="添加用户"
      :visible.sync="addDialogVisible"
      width="40%"
      @close="addDialogClose"
    >
      <!-- 添加用户内容主体区域 -->
      <el-form
        :model="addForm"
        :rules="addFormRules"
        ref="addFormRef"
        label-width="70px"
      >
        <el-form-item label="用户名" prop="userName">
          <el-input v-model="addForm.userName"></el-input>
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input v-model="addForm.password"></el-input>
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="addForm.email"></el-input>
        </el-form-item>
        <el-form-item label="手机" prop="mobile">
          <el-input v-model="addForm.mobile"></el-input>
        </el-form-item>
      </el-form>
      <!-- 底部区域 -->
      <span slot="footer" class="dialog-footer">
        <el-button @click="addDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addUser">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 修改用户对话框 -->
    <el-dialog
      title="修改用户"
      :visible.sync="editDialogVisible"
      width="40%"
      @close="editDialogClosed"
    >
      <el-form
        :model="editFrom"
        :rules="editFromRules"
        ref="editFromRef"
        label-width="70px"
      >
        <el-form-item label="用户名">
          <el-input v-model="editFrom.username" disabled></el-input>
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="editFrom.email"></el-input>
        </el-form-item>
        <el-form-item label="手机号" prop="mobile">
          <el-input v-model="editFrom.mobile"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editUser">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 分配角色对话框 -->
    <el-dialog
      title="分配角色"
      :visible.sync="setrRoleDialogVisible"
      width="40%"
      @close="setRoleDialogClosed"
    >
      <p>当前的用户：{{ useInfo.username }}</p>
      <p>当前的角色：{{ useInfo.role_name }}</p>
      <p>
        分配新角色：<el-select v-model="selectedRoleId" placeholder="请选择">
          <el-option
            v-for="itemm in roleList"
            :key="itemm.id"
            :label="itemm.roleName"
            :value="itemm.id"
          >
          </el-option>
        </el-select>
      </p>
      <span slot="footer" class="dialog-footer">
        <el-button @click="setrRoleDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="saveRoleInfo">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import Http from "../../http/index.js";
export default {
  props: {},
  data() {
    // 验证邮箱
    var checkEmail = (rule, value, cb) => {
      const regEmail = /\w+([-+.]\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*/;
      if (regEmail.test(value)) {
        return cb();
      } else {
        return cb(new Error("请输入合法的邮箱"));
      }
    };

    // 验证手机号
    var checkMobie = (rule, value, cb) => {
      const regMobile =
        /^(0|86|17951)?(13[0-9]|15[012356789]|166|17[3678]|18[0-9]|14[57])[0-9]{8}$/;
      if (regMobile.test(value)) {
        return cb();
      } else {
        return cb(new Error("请输入合法的手机号"));
      }
    };
    return {
      queryInfo: {
        query: "",
        pagenum: 1,
        pagesize: 2,
      },
      userList: [],
      total: 0,
      // 控制添加对话框的显示与隐藏
      addDialogVisible: false,
      // 控制修改用户对话框的显示与隐藏
      editDialogVisible: false,
      // 添加用户的表单数据
      addForm: {
        userName: "",
        password: "",
        email: "",
        mobile: "",
      },
      // 查询到的用户信息
      editFrom: {},
      // 添加用户的验证规则
      addFormRules: {
        userName: [
          { required: true, message: "请输入用户名", trigger: "blur" },
          { min: 3, max: 6, message: "长度在 3 到 6 个字符", trigger: "blur" },
        ],
        password: [
          { required: true, message: "请输入密码", trigger: "blur" },
          {
            min: 6,
            max: 15,
            message: "长度在 6 到 15 个字符",
            trigger: "blur",
          },
        ],
        email: [
          { required: true, message: "请输入邮箱", trigger: "blur" },
          { validator: checkEmail, trigger: "blur" },
        ],
        mobile: [
          { required: true, message: "请输入手机号", trigger: "blur" },
          { validator: checkMobie, trigger: "blur" },
        ],
      },
      // 修改表单的验证规则
      editFromRules: {
        email: [
          { required: true, message: "请输入邮箱", trigger: "blur" },
          { validator: checkEmail, trigger: "blur" },
        ],
        mobile: [
          { required: true, message: "请输入手机号", trigger: "blur" },
          { validator: checkMobie, trigger: "blur" },
        ],
      },
      // 控制分配角色框的显示与隐藏
      setrRoleDialogVisible: false,
      // 分配角色的用户信息
      useInfo: {},
      // 所有角色的数据
      roleList: [],
      // 已选中的角色id值
      selectedRoleId: "",
    };
  },
  methods: {
    // 监听pagesize改变的事件
    handleSizeChange(newSize) {
      // console.log(newSize);
      this.queryInfo.pagesize = newSize;
      this.getUserList();
    },
    // 监听页码值改变的事件
    handleCurrentChange(newPage) {
      // console.log(newPage);
      this.queryInfo.pagenum = newPage;
      this.getUserList();
    },
    userStateChanged(userinfo) {
      // console.log(userinfo);
      Http({
        url: `users/${userinfo.id}/state/${userinfo.mg_state}`,
        method: "put",
      }).then((res) => {
        console.log(res);
        if (res.meta.status !== 200) {
          userinfo.mg_state = !userinfo.mg_state;
          this.$message.error("用户更新失败");
        } else {
          this.$message.success("用户更新成功");
        }
      });
    },
    // 获取用户列表
    getUserList() {
      Http({
        url: "users",
        method: "get",
        params: this.queryInfo,
      }).then((res) => {
        // console.log(res);
        if (res.meta.status !== 200) {
          this.$message.error("获取用户列表失败");
        } else {
          this.userList = res.data.users;
          this.total = res.data.total;
        }
      });
    },
    // 添加用户框的关闭事件
    addDialogClose() {
      this.$refs.addFormRef.resetFields();
    },
    // 添加用户框的点击按钮 添加新用户
    addUser() {
      this.$refs.addFormRef.validate((valid) => {
        if (!valid) {
          return;
        } else {
          Http({
            url: "users",
            method: "post",
            data: {
              username: this.addForm.userName,
              password: this.addForm.password,
              email: this.addForm.email,
              mobile: this.addForm.mobile,
            },
          }).then((res) => {
            // console.log(res);
            if (res.meta.status !== 201) {
              this.$message.error("添加用户失败");
            } else {
              this.$message.success("添加用户成功");
              // 添加框隐藏
              this.addDialogVisible = false;
              // 重新获取数据
              this.getUserList();
            }
          });
        }
      });
    },
    // 展示编辑用户的对话框
    showEditDialog(id) {
      this.editDialogVisible = true;
      // console.log(id);
      Http({
        url: `users/${id}`,
        method: "get",
      }).then((res) => {
        // console.log(res);
        if (res.meta.status !== 200) {
          this.$message.error("查询用户信息失败");
        } else {
          this.editFrom = res.data;
        }
      });
    },
    // 监听修改对话框的关闭事件
    editDialogClosed() {
      this.$refs.editFromRef.resetFields();
    },
    // 修改用户信息并提交
    editUser() {
      this.$refs.editFromRef.validate((valid) => {
        if (!valid) {
          return;
        } else {
          // 发起修改用户信息的数据请求
          Http({
            url: `users/${this.editFrom.id}`,
            method: "put",
            data: {
              email: this.editFrom.email,
              mobile: this.editFrom.mobile,
            },
          }).then((res) => {
            // console.log(res);
            if (res.meta.status !== 200) {
              this.$message.error("修改用户信息失败");
            } else {
              // 关闭对话框
              this.editDialogVisible = false;
              this.getUserList();
              this.$message.success("修改用户信息成功");
            }
          });
        }
      });
    },
    // 根据id删除用户信息
    removeUserById(id) {
      this.$confirm("此操作将永久删除该用户, 是否继续?", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
      })
        .then((res) => {
          // 确认删除
          Http({
            url: `users/${id}`,
            method: "delete",
          }).then((res) => {
            // console.log(res);
            if (res.meta.status !== 200) {
              this.$message.error("删除用户失败");
            } else {
              this.getUserList();
              this.$message.success("删除用户成功");
            }
          });
        })
        .catch((err) => {
          this.$message.info("已取消删除");
        });
    },
    // 展示分配角色的对话框
    setRole(useInfo) {
      this.useInfo = useInfo;
      // 获取所有角色的列表
      Http({
        url: "roles",
        method: "get",
      }).then((res) => {
        if (res.meta.status !== 200) {
          this.$message.error("获取角色列表失败失败");
        } else {
          this.roleList = res.data;
        }
      });
      this.setrRoleDialogVisible = true;
    },
    // 点击按钮分配角色
    saveRoleInfo() {
      if (!this.selectedRoleId) {
        return this.$message.error("请选择要分配的角色");
      } else {
        Http({
          url: `users/${this.useInfo.id}/role`,
          method: "put",
          data: {
            rid: this.selectedRoleId,
          },
        }).then((res) => {
          if (res.meta.status !== 200) {
            this.$message.error("用户角色失败");
          } else {
            this.$message.success("角色更新成功");
            this.getUserList();
            this.setrRoleDialogVisible = false;
          }
        });
      }
    },
    setRoleDialogClosed() {
      this.selectedRoleId = "";
      this.useInfo = {};
    },
  },
  components: {},
  mounted() {
    this.getUserList();
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
.el-table {
  margin-top: 15px;
}
.el-pagination {
  margin-top: 15px;
}
</style>
