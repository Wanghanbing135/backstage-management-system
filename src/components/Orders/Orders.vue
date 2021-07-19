<template>
  <div class="orders">
    <!-- 面包屑导航区域 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>订单管理</el-breadcrumb-item>
      <el-breadcrumb-item>订单列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图区域 -->
    <el-card>
      <el-row :gutter="20">
        <!-- 搜索与添加区域 -->
        <el-col :span="8">
          <el-input
            v-model="queryInfo.query"
            placeholder="请输入内容"
            clearable
            @clear="getOrderList"
          >
            <el-button
              @click="getOrderList"
              slot="append"
              icon="el-icon-search"
            ></el-button>
          </el-input>
        </el-col>
      </el-row>
      <!-- 订单列表区域 -->
      <el-table :data="orderList" border stripe>
        <el-table-column type="index" label="#"></el-table-column>
        <el-table-column prop="order_number" label="订单编号"></el-table-column>
        <el-table-column prop="order_price" label="订单价格"></el-table-column>
        <el-table-column prop="pay_status" label="是否付款">
          <template slot-scope="scope">
            <el-tag type="success" v-if="scope.row.pay_status == '1'"
              >已付款</el-tag
            >
            <el-tag type="danger" v-else>未付款</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="is_send" label="是否发货"> </el-table-column>
        <el-table-column prop="create_time" label="下单时间">
          <template slot-scope="scope">
            {{ scope.row.create_time | dateFormat }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="150px">
          <template>
            <!-- 修改按钮 -->
            <el-button
              type="primary"
              icon="el-icon-edit"
              size="mini"
              @click="showBox"
            ></el-button>
            <!-- 查看物流信息按钮 -->
            <el-button
              type="success"
              icon="el-icon-location"
              size="mini"
              @click="showProgressBox"
            ></el-button>
          </template>
        </el-table-column>
      </el-table>
      <!-- 分页区 -->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryInfo.pagenum"
        :page-sizes="[5, 10, 15]"
        :page-size="queryInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
      >
      </el-pagination>
    </el-card>
    <!-- 修改地址对话框 -->
    <el-dialog
      title="修改地址"
      :visible.sync="addressVisible"
      width="40%"
      @close="addressDialogClosed"
    >
      <el-form
        :model="addressFrom"
        :rules="addressFromRules"
        ref="addressFromRef"
        label-width="90px"
      >
        <el-form-item label="省市区/县" placeholder="请选择" prop="address">
          <el-cascader
            v-model="addressFrom.address"
            :options="cityData"
          ></el-cascader>
        </el-form-item>
        <el-form-item label="详细地址" prop="addresss">
          <el-input v-model="addressFrom.address2"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addressVisible = false">取 消</el-button>
        <el-button type="primary" @click="addressVisible = false"
          >确 定</el-button
        >
      </span>
    </el-dialog>
    <!-- 查看物流信息对话框 -->
    <el-dialog title="物流进度" :visible.sync="progressVisible" width="40%">
      <!-- 时间线 -->
      <el-timeline>
        <el-timeline-item
          v-for="(activity, index) in progressInfo"
          :key="index"
          :timestamp="activity.time"
        >
          {{ activity.context }}
        </el-timeline-item>
      </el-timeline>
    </el-dialog>
  </div>
</template>

<script>
import Http from "../../http/index.js";
import cityData from "../../assets/js/citydata.js";
export default {
  props: {},
  data() {
    return {
      // 订单列表
      orderList: [],
      // 根据分页获取对应的商品列表
      queryInfo: {
        query: "",
        pagenum: 1,
        pagesize: 10,
      },
      //总数据条数
      total: 0,
      // 修改地址对话框的显示与隐藏
      addressVisible: false,
      // 修改表单的数据
      addressFrom: {
        address: [],
        address: "",
      },
      //修改表单的验证
      addressFromRules: {
        address: [{ required: true, message: "请选择省市区", trigger: "blur" }],
        addresss: [
          { required: true, message: "请填写详细地址", trigger: "blur" },
        ],
      },
      // 城市列表
      cityData,
      // 物流信息对话框的显示与隐藏
      progressVisible: false,
      // 物流信息
      progressInfo:[]
    };
  },
  methods: {
    //   获取订单列表
    getOrderList() {
      Http({
        url: "orders",
        method: "get",
        params: this.queryInfo,
      }).then((res) => {
        // console.log(res);
        if (res.meta.status !== 200) {
          this.$message.error("获取订单列表失败");
        } else {
          this.orderList = res.data.goods;
          this.total = res.data.total;
        }
      });
    },
    // 分页区
    handleSizeChange(newSize) {
      this.queryInfo.pagesize = newSize;
      this.getOrderList();
    },
    handleCurrentChange(newPage) {
      this.queryInfo.pagenum = newPage;
      this.getOrderList();
    },
    showBox() {
      this.addressVisible = true;
    },
    // 修改对话框关闭事件
    addressDialogClosed() {
      this.$refs.addressFromRef.resetFields();
    },
    // 查看物流信息
    showProgressBox() {
      // 获取物流信息数据
      Http({
        url: "/kuaidi/1106975712662",
        method: "get",
      }).then((res) => {
        // console.log(res.data);
        if (res.meta.status !== 200) {
          this.$message.error("获取物流信息失败");
        } else {
          this.progressInfo = res.data;
        }
      });
      this.progressVisible = true;
    },
  },
  mounted() {
    this.getOrderList();
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
.el-table {
  margin-top: 15px;
}
.el-pagination {
  margin-top: 15px;
}
.el-cascader {
  width: 100%;
}
</style>
