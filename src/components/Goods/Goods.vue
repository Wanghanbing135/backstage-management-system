<template>
  <div class="goods">
    <!-- 面包屑导航区域 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品列表</el-breadcrumb-item>
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
            @clear="getGoodsList"
          >
            <el-button
              @click="getGoodsList"
              slot="append"
              icon="el-icon-search"
            ></el-button>
          </el-input>
        </el-col>
        <el-col :span="4">
          <el-button type="primary" @click="goAddPage"
            >添加商品</el-button
          >
        </el-col>
      </el-row>
      <!-- 商品列表区域 -->
      <el-table :data="goodsList" border stripe>
        <el-table-column type="index" label="#"></el-table-column>
        <el-table-column prop="goods_name" label="商品名称"></el-table-column>
        <el-table-column
          width="95px"
          prop="goods_price"
          label="价格(元)"
        ></el-table-column>
        <el-table-column width="80px" prop="goods_weight" label="商品重量">
        </el-table-column>
        <el-table-column width="170px" prop="add_time" label="创建时间">
          <template slot-scope="scope">
            {{ scope.row.add_time | dateFormat }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="150px">
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
              @click="removeGoodsById(scope.row.goods_id)"
            ></el-button>
          </template>
        </el-table-column>
      </el-table>
      <!-- 分页区 -->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryInfo.pagenum"
        :page-sizes="[10, 20, 30, 40]"
        :page-size="queryInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
      >
      </el-pagination>
    </el-card>
  </div>
</template>

<script>
import Http from "../../http/index.js";
export default {
  props: {},
  data() {
    return {
      // 根据分页获取对应的商品列表
      queryInfo: {
        query: "",
        pagenum: 1,
        pagesize: 10,
      },
      //商品列表
      goodsList: [],
      //   总数居条数
      total: 0,
    };
  },
  methods: {
    //   获取商品列表
    getGoodsList() {
      Http({
        url: "goods",
        method: "get",
        params: this.queryInfo,
      }).then((res) => {
        // console.log(res.data);
        if (res.meta.status !== 200) {
          this.$message.error("获取商品列表失败");
        } else {
          this.goodsList = res.data.goods;
          this.total = res.data.total;
        }
      });
    },
    handleSizeChange(newSize) {
      this.queryInfo.pagesize = newSize;
      this.getGoodsList();
    },
    handleCurrentChange(newPage) {
      this.queryInfo.pagenum = newPage;
      this.getGoodsList();
    },
    // 根据id删除商品
    removeGoodsById(id) {
      this.$confirm("此操作将永久删除该商品, 是否继续?", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
      })
        .then((res) => {
          // 确认删除
          Http({
            url: `goods/${id}`,
            method: "delete",
          }).then((res) => {
            // console.log(res);
            if (res.meta.status !== 200) {
              this.$message.error("删除商品失败");
            } else {
              this.getGoodsList();
              this.$message.success("删除商品成功");
            }
          });
        })
        .catch((err) => {
          this.$message.info("已取消删除");
        });
    },
    // 添加按钮  点击按钮跳转
    goAddPage(){
        this.$router.push('/goods/add')
    }
  },
  mounted() {
    this.getGoodsList();
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
</style>
