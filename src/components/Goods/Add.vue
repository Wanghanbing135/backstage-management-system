<template>
  <div class="add">
    <!-- 面包屑导航区域 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图区域 -->
    <el-card>
      <!-- 提示区 -->
      <el-alert
        :closable="false"
        title="添加商品信息"
        type="info"
        center
        show-icon
      >
      </el-alert>
      <!-- 步骤条 -->
      <el-steps
        :space="200"
        :active="activeIndex - 0"
        finish-status="success"
        align-center
      >
        <el-step title="基本信息"></el-step>
        <el-step title="商品参数"></el-step>
        <el-step title="商品属性"></el-step>
        <el-step title="商品图片"></el-step>
        <el-step title="商品内容"></el-step>
        <el-step title="完成"></el-step>
      </el-steps>
      <!-- tab栏区域 -->
      <el-form
        :model="addForm"
        :rules="addFormRules"
        ref="addFormRef"
        label-width="100px"
        label-position="top"
      >
        <el-tabs
          v-model="activeIndex"
          :tab-position="'left'"
          :before-leave="beforeTabLeave"
          @tab-click="tabClicked"
        >
          <el-tab-pane label="基本信息" name="0">
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
            <el-form-item label="商品分类" prop="goods_cat">
              <el-cascader
                v-model="addForm.goods_cat"
                :options="cateList"
                expandTrigger="hover"
                :props="cateProps"
                @change="handleChange"
              ></el-cascader>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品参数" name="1">
            <!-- 渲染表单的item项 -->
            <el-form-item
              :label="item.attr_name"
              v-for="item in manyTableData"
              :key="item.attr_id"
            >
              <el-checkbox-group v-model="item.attr_vals">
                <el-checkbox
                  border
                  :label="ite"
                  v-for="(ite, i) in item.attr_vals"
                  :key="i"
                ></el-checkbox>
              </el-checkbox-group>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品属性" name="2">
            <el-form-item
              :label="item.attr_name"
              v-for="item in onlyTableData"
              :key="item.attr_id"
            >
              <el-input v-model="item.attr_vals"></el-input>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品图片" name="3">
            <!-- action表示图片要上传到的后台API地址 -->
            <el-upload
              :headers="headersObj"
              :action="uploadUrl"
              :on-preview="handlePreview"
              :on-remove="handleRemove"
              list-type="picture"
              :on-success="handleSuccess"
            >
              <el-button size="small" type="primary">点击上传</el-button>
            </el-upload>
          </el-tab-pane>
          <el-tab-pane label="商品内容" name="4">
            <quill-editor v-model="addForm.goods_introduce"> </quill-editor>
            <!-- 添加商品的按钮 -->
            <el-button class="btnAdd" type="primary" @click="add"
              >添加商品</el-button
            >
          </el-tab-pane>
        </el-tabs>
      </el-form>
    </el-card>
    <!-- 图片预览 -->
    <el-dialog title="图片预览" :visible.sync="previewVisible" width="40%">
      <img :src="previewPath" alt="" class="previewImg" />
    </el-dialog>
  </div>
</template>

<script>
import Http from "../../http/index.js";
import _ from "lodash";
export default {
  props: {},
  data() {
    return {
      // 步骤条默认完成
      activeIndex: "0",
      // 添加商品的表单数据
      addForm: {
        goods_name: "",
        goods_price: 0,
        goods_weight: 0,
        goods_number: 0,
        goods_cat: [],
        // 图片的数组
        pics: [],
        // 商品的详情描述
        goods_introduce: "",
        attrs: [],
      },
      // 商品分类列表
      cateList: [],
      // 添加商品的表单验证
      addFormRules: {
        goods_name: [
          { required: true, message: "请输入商品名称", trigger: "blur" },
        ],
        goods_price: [
          { required: true, message: "请输入商品价格", trigger: "blur" },
        ],
        goods_weight: [
          { required: true, message: "请输入商品重量", trigger: "blur" },
        ],
        goods_number: [
          { required: true, message: "请输入商品数量", trigger: "blur" },
        ],
        goods_cat: [
          { required: true, message: "请选择商品分类", trigger: "blur" },
        ],
      },
      cateProps: {
        label: "cat_name",
        value: "cat_id",
        children: "children",
      },
      //   动态参数列表
      manyTableData: [],
      //   静态参数列表
      onlyTableData: [],
      //   上传图片的url地址
      uploadUrl: "http://127.0.0.1:8888/api/private/v1/upload",
      //图片上传组件的请求头对象
      headersObj: {
        Authorization: window.sessionStorage.getItem("token"),
      },
      // 上传的图片的查看路径
      previewPath: "",
      //   图片预览的显示与隐藏
      previewVisible: false,
    };
  },
  methods: {
    //   获取商品分类
    getCateList() {
      Http({
        url: "categories",
        method: "get",
      }).then((res) => {
        // console.log(res.data);
        if (res.meta.status !== 200) {
          this.$message.error("获取商品分类列表失败");
        } else {
          this.cateList = res.data;
        }
      });
    },
    // 级联选择器选中项，会触发的函数
    handleChange() {
      if (this.addForm.goods_cat.length !== 3) {
        this.addForm.goods_cat = [];
      }
    },
    beforeTabLeave(activeName, oldActiveName) {
      if (oldActiveName === "0" && this.addForm.goods_cat.length !== 3) {
        this.$message.error("请选择商品分类");
        return false;
      }
    },
    // 点击tab页标签执行的函数
    tabClicked() {
      //访问动态参数面板执行
      if (this.activeIndex === "1") {
        Http({
          url: `categories/${this.cadeId}/attributes`,
          method: "get",
          params: {
            sel: "many",
          },
        }).then((res) => {
          //   console.log(res.data);
          if (res.meta.status !== 200) {
            this.$message.error("获取动态参数列表失败");
          } else {
            res.data.forEach((item) => {
              item.attr_vals =
                item.attr_vals.length === 0 ? [] : item.attr_vals.split(" ");
            });
            this.manyTableData = res.data;
          }
        });
      } else if (this.activeIndex === "2") {
        Http({
          url: `categories/${this.cadeId}/attributes`,
          method: "get",
          params: {
            sel: "only",
          },
        }).then((res) => {
          //   console.log(res.data);
          if (res.meta.status !== 200) {
            this.$message.error("获取静态参数列表失败");
          } else {
            this.onlyTableData = res.data;
          }
        });
      }
    },
    // 处理 图片预览效果
    handlePreview(file) {
      this.previewPath = file.response.data.url;
      this.previewVisible = true;
    },
    // 处理移除图片的函数
    handleRemove(file) {
      console.log(file);
      const filePath = file.response.data.tmp_path;
      const i = this.addForm.pics.findIndex((x) => x.pic === filePath);
      this.addForm.pics.splice(i, 1);
    },
    //监听图片上传成功的事件
    handleSuccess(res) {
      const picInfo = { pic: res.data.tmp_path };
      this.addForm.pics.push(picInfo);
      // console.log(this.addForm);
    },
    // 添加商品按钮 点击添加商品
    add() {
      this.$refs.addFormRef.validate((valid) => {
        if (!valid) {
          return this.$message.error("请填写必要的表单项目");
        } else {
          // console.log(this.addForm)
          let form = _.cloneDeep(this.addForm);
          form.goods_cat = form.goods_cat.join(",");
          //处理动态参数
          this.manyTableData.forEach((item) => {
            const newInfo = {
              attr_id: item.attr_id,
              attr_value: item.attr_vals.join(' '),
            };
            this.addForm.attrs.push(newInfo);
          });
            // 处理静态属性
          this.onlyTableData.forEach((ite) => {
            const newInfo = {
              attr_id: ite.attr_id,
              attr_value: ite.attr_vals,
            };
            this.addForm.attrs.push(newInfo);
          });
          form.attrs = this.addForm.attrs
          console.log(this.addForm.attrs);

        //   执行添加商品  
          Http({
            url: "goods",
            method: "post",

            data:form
          }).then((res) => {
            console.log(res);
            if (res.meta.status !== 201) {
              this.$message.error("添加商品失败");
            } else {
              this.$message.success("添加商品成功");
              this.$router.push('goods')
            }
          });
        }
      });
    },
  },
  mounted() {
    this.getCateList();
  },
  computed: {
    cadeId() {
      if (this.addForm.goods_cat.length === 3) {
        return this.addForm.goods_cat[2];
      } else {
        return null;
      }
    },
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
.el-steps {
  margin: 15px 0;
}
/deep/.el-step__title {
  font-size: 14px;
}
/deep/.el-checkbox {
  margin: 0 10px 0 0;
}
.previewImg {
  width: 100%;
}
/deep/.ql-editor {
  min-height: 400px;
}
/deep/.btnAdd {
  margin-top: 15px;
}
</style>
