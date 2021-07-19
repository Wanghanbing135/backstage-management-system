<template>
  <div class="home">
    <!-- 头部 -->
    <el-container class="home_con">
      <el-header>
        <div>
          <img src="../assets/profile.jpg" alt="" />
          <span>电商后台管理系统</span>
        </div>
        <el-button type="info" @click="logout">退出</el-button>
      </el-header>
      <!-- 主体 -->
      <el-container>
        <!-- 菜单栏 -->
        <el-aside :width="iscollapse ? '64px' : '200px'">
          <div class="toggle-button" @click="toggle">|||</div>
          <el-menu
            :collapse-transition="false"
            :collapse="iscollapse"
            unique-opened
            background-color="#333744"
            text-color="#fff"
            active-text-color="#409eef"
            :router="true"
          >
            <el-submenu
              v-for="item in list"
              :key="item.id"
              :index="item.id + ''"
            >
              <template slot="title">
                <i :class="icons[item.id]"></i>
                <span>{{ item.authName }}</span>
              </template>
              <!-- 二级菜单栏 -->
              <el-menu-item-group>
                <el-menu-item
                  v-for="ite in item.children"
                  :key="ite.id"
                  :index="ite.id + ''"
                  :route="{ path: '/home/' + ite.path }"
                >
                  <i class="el-icon-menu"></i>
                  {{ ite.authName }}</el-menu-item
                >
              </el-menu-item-group>
            </el-submenu>
          </el-menu>
        </el-aside>
        <!-- 主体 -->
        <el-main>
          <router-view></router-view>
        </el-main>
      </el-container>
    </el-container>
  </div>
</template>

<script>
import Http from "../http/index.js";
export default {
  props: {},
  data() {
    return {
      list: [],
      icons: {
        125: "el-icon-s-custom",
        103: "el-icon-s-flag",
        101: "el-icon-s-goods",
        102: "el-icon-s-order",
        145: "el-icon-s-data",
      },
      //   是否折叠
      iscollapse: false,
    };
  },
  mounted() {
    //   获取所有菜单
    Http({
      url: "/menus",
      method: "get",
    }).then((res) => {
      // console.log(res.data);
      this.list = res.data;
    });
  },
  methods: {
    //   退出按钮
    logout() {
      window.sessionStorage.clear();
      this.$router.push({ path: "/" });
    },
    //   切换菜单的折叠与展开
    toggle() {
      this.iscollapse = !this.iscollapse;
    },
  },
  components: {},
};
</script>

<style scoped lang="less">
.home {
  height: 100%;
  .home_con {
    height: 100%;
    // 头部
    .el-header {
      background-color: #373d41;
      display: flex;
      justify-content: space-between;
      align-items: center;
      div {
        display: flex;
        color: white;
        font-size: 20px;
        align-items: center;
      }
      img {
        width: 50px;
        height: 50px;
        border-radius: 50%;
        margin-right: 10px;
      }
    }
    // 侧边栏
    .el-aside {
      background-color: #333744;
      .toggle-button {
        height: 24px;
        color: #fff;
        text-align: center;
        font-size: 10px;
        line-height: 24px;
        letter-spacing: 0.2em;
        background-color: #4a5064;
        cursor: pointer;
      }
      .el-menu {
        border: none;
      }
    }
    .el-main {
      background-color: #eaedf1;
    }
  }
}
</style>

