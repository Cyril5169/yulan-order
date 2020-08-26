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
    </el-tabs>
  </el-card>
</template>

<script>
import ShoppingWallPaper from "./shoppingWallPaper";
import ShoppingCurtain from "./shoppingCurtain";
import ShoppingSoftSuit from "./shoppingSoftSuit";
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
        return this.$store.state.navTabs.activeParam;
      },
      set(value) {},
    },
  }
};
</script>
