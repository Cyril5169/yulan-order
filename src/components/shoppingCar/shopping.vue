<template>
  <el-card shadow="hover">
    <el-tabs v-model="activeName" @tab-click="handleClick">
      <el-tab-pane label="墙纸配套类" name="wallPaper">
        <ShoppingWallPaper v-if="activeName =='wallPaper'"></ShoppingWallPaper>
      </el-tab-pane>
      <el-tab-pane label="定制窗帘" name="curtain">
        <ShoppingCurtain v-if="activeName =='curtain'"></ShoppingCurtain>
      </el-tab-pane>
      <el-tab-pane label="软装" name="softSuit">
        <ShoppingSoftSuit v-if="activeName =='softSuit'"></ShoppingSoftSuit>
      </el-tab-pane>
      <el-tab-pane label="全新定制窗帘" name="newCurtain">
        <ShoppingNewCurtain v-if="activeName =='newCurtain'"></ShoppingNewCurtain>
      </el-tab-pane>
    </el-tabs>
  </el-card>
</template>

<script>
import ShoppingWallPaper from "./shoppingWallPaper";
import ShoppingCurtain from "./shoppingCurtain";
import ShoppingSoftSuit from "./shoppingSoftSuit";
import ShoppingNewCurtain from "./shoppingNewCurtain";
import { mapMutations } from "vuex";

export default {
  name: "Shopping",
  data() {
    return {
    };
  },
  components: {
    ShoppingWallPaper,
    ShoppingCurtain,
    ShoppingSoftSuit,
    ShoppingNewCurtain
  },
  methods: {
    ...mapMutations("navTabs", ["addTab"]),
    handleClick(tab, event) {
      this.addTab("shoppingCar/shopping" + "?" + tab.name);
      this.$router.push({
        path: "/shoppingCar/shopping" + "?" + tab.name,
      });
    },
  },
  computed: {
    activeName: {
      get() {
        return this.$store.state.navTabs.activeUrlName.split("?")[1];
      },
      set(value) { },
    },
  }
};
</script>

<style>
.accountBox {
  width: 100%;
  height: 53px;
  margin-top: 20px;
  background: #f0f0f0;
  line-height: 50px;
  color: #101010;
  font-size: 14px;
}
.accountBox :nth-child(1) > div {
  margin-left: 20px;
  display: inline-block;
}
.link-detail {
  margin: 0 5px;
  display: inline;
}
.link-delete {
  color: #13ce66;
  margin: 0 5px;
  display: inline;
}
.commitBtn {
  width: 80px;
  height: 50px;
  color: white;
  font-size: 18px;
  text-align: center;
  cursor: pointer;
}
.shoppingCarCls {
  margin-top: -32px;
}
.shoppingCarCls .el-table .colorType_0 {
  background: oldlace;
}
.shoppingCarCls .el-table .colorType_1 {
  background: #ceecbe;
}
.shoppingCarCls .el-table .colorType_2 {
  background: #cde1f7;
}
.shoppingCarCls .el-table__expanded-cell[class*="cell"] {
  padding: 0;
}
.shoppingCarCls .el-table__expand-icon::after {
  position: relative;
  bottom: 1px;
  font-size: 14px;
  content: "分组";
  color: #606266;
  cursor: pointer;
  -webkit-transition: background-color 0.25s ease;
  transition: background-color 0.25s ease;
}
</style>
