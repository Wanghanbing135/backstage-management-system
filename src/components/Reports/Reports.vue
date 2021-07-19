<template>
  <div class="reports">
    <!-- 面包屑导航区域 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>数据统计</el-breadcrumb-item>
      <el-breadcrumb-item>数据报表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图区域 -->
    <el-card>
      <!-- 为ECharts准备一个具备大小（宽高）的Dom -->
      <div id="main" style="width: 600px; height: 400px"></div>
    </el-card>
  </div>
</template>

<script>
// 导入echarts
import * as echarts from "echarts";
import Http from "../../http/index.js";
import _ from "lodash";
export default {
  props: {},
  data() {
    return {
      // 需要合并的数据
      options: {
        title: {
          text: "用户来源",
        },
        tooltip: {
          trigger: "axis",
          axisPointer: {
            type: "cross",
            label: {
              backgroundColor: "#E9EEF3",
            },
          },
        },
        grid: {
          left: "3%",
          right: "4%",
          bottom: "3%",
          containLabel: true,
        },
        xAxis: [
          {
            boundaryGap: false,
          },
        ],
        yAxis: [
          {
            type: "value",
          },
        ],
      },
    };
  },
  methods: {},
  mounted() {
    // 基于准备好的dom，初始化echarts实例  init
    var myChart = echarts.init(document.getElementById("main"));
    //获取数据
    Http({
      url: "reports/type/1",
      method: "get",
    }).then((res) => {
    //   console.log(res.data);
      if (res.meta.status !== 200) {
        this.$message.error("获取数据列表信息失败");
      } else {
        const result = _.merge(res.data, this.options);
        myChart.setOption(result);
      }
    });

    // 展示数据
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
</style>
