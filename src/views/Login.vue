<template>
  <div class="login">
    <div class="login_box">
      <div class="login_avatar">
        <img src="../assets/profile.jpg" alt="" />
      </div>
      <el-form
        :rules="rules"
        class="login_form"
        ref="ruleForm"
        :label-position="labelPosition"
        label-width="80px"
        :model="formLabelAlign"
      >
        <!-- 用户名 -->
        <el-form-item class="user" prop="name">
          <el-input
            placeholder="请输入用户名"
            v-model="formLabelAlign.name"
            clearable
            prefix-icon="el-icon-user-solid"
          ></el-input>
        </el-form-item>
        <!-- 密码 -->
        <el-form-item class="user" prop="psd">
          <el-input
            placeholder="请输入密码"
            v-model="formLabelAlign.psd"
            clearable
            show-password
            prefix-icon="el-icon-lock"
          ></el-input>
        </el-form-item>
        <!-- 登录按钮 -->
        <el-button type="primary" class="btn" @click="submitForm('ruleForm')"
          >登录</el-button>
        <!-- 重置按钮 -->
        <el-button @click="resetForm('ruleForm')">重置</el-button>
      </el-form>
    </div>
  </div>
</template>

<script>
import Http from '../http/index.js'
export default {
  props: {},
  data() {
    return {
      labelPosition: "top",
      formLabelAlign: {
        name: "admin",
        psd: "123456",
      },
      ruleForm: {
        name: "",
        psd: "",
      },
      rules: {
        name: [
          { required: true, message: "请输入用户名", trigger: "blur" },
          { min: 1, max: 6, message: "长度在 1 到 6 个字符", trigger: "blur" },
        ],
        psd: [
          { required: true, message: "请输入密码", trigger: "blur" },
          {
            min: 6,
            max: 12,
            message: "长度在 6 到 12 个字符",
            trigger: "blur",
          },
        ],
      },
    };
  },
  methods: {
    submitForm(formName) {
      this.$refs[formName].validate((valid) => {
        if (valid) {
        Http({
            url:'/login',
            method:'post',
            data:{
                username: this.formLabelAlign.name,
                password: this.formLabelAlign.psd,
            }
        }).then(res =>{
            // console.log(res);
            if(res.meta.msg == '密码错误'){
              this.$message.error("密码错误");
            }else if(res.meta.msg == '用户名不存在'){
              this.$message.error("用户名不存在");
            }else{
              this.$message({
                  message: "恭喜你，登录成功",
                  type: "success",
                  duration: 1000,
                  onClose: () => {
                    //存储token值
                    window.sessionStorage.setItem("token", res.data.token);

                    // 跳转主页
                    this.$router.push({ path: "/home" });
                  },
                });
            }
        })
        } else {
          console.log("error submit!!");
          return false;
        }
      });
    },
    resetForm(formName) {
      this.$refs[formName].resetFields();
    },
  },
  components: {},
};
</script>

<style scoped lang="less">
.login {
  background-color: #2b4b6b;
  width: 100%;
  height: 100%;
}
.login_box {
  width: 450px;
  height: 300px;
  background-color: #fff;
  border-radius: 3px;
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  .login_avatar {
    width: 130px;
    height: 130px;
    border: 1px solid #ccc;
    border-radius: 50%;
    padding: 10px;
    background-color: #fff;
    position: absolute;
    left: 50%;
    transform: translate(-50%, -50%);
    img {
      width: 100%;
      height: 100%;
      border-radius: 50%;
      background-color: #eee;
    }
  }
  .el-form {
    width: 80%;
  }
  .login_form{
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%,-50%);
  }
  .btn{
      margin-left: 200px;
  }
}
</style>
