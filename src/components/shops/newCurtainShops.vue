<template>
  <el-card shadow="never" style="min-height:500px;">
    <div>
      <el-input clearable v-model.trim="searchKey" @clear="searchCurtain" @keyup.enter.native="searchCurtain"
        placeholder="输入商品型号查找商品" style="width:300px;">
        <el-button @click="searchCurtain" slot="append" icon="el-icon-search">搜索</el-button>
      </el-input>
    </div>
    <div class="curtain-contain">
      <!-- 帘款 -->
      <div class="curtain-parent-item">
        <span>帘款：BQ507420K1</span>
      </div>
      <!-- 帘款参数 -->
      <div class="curtain-params">
        <span>成品宽：</span>
        <el-input style="width:60px;" size="mini"></el-input>
        <span style="margin-left:20px;">成品高：</span>
        <el-input style="width:60px;" size="mini"></el-input>
        <span style="margin-left:20px;">活动：</span>
      </div>
      <!-- 窗帘部件 -->
      <div class="curtain-list">
        <el-table :data="curtainData" class="curtain-table" size="small" border>
          <el-table-column label="预览" width="150" align="center"></el-table-column>
          <el-table-column label="部件" width="100" align="center"></el-table-column>
          <el-table-column label="编码" width="100" align="center"></el-table-column>
          <el-table-column label="制造说明" width="250" align="center"></el-table-column>
          <el-table-column label="用量" width="100" align="center"></el-table-column>
          <el-table-column label="单位" width="100" align="center"></el-table-column>
          <el-table-column label="库存" width="100" align="center"></el-table-column>
          <el-table-column label="单价" width="100" align="center"></el-table-column>
          <el-table-column label="折后" width="100" align="center"></el-table-column>
          <el-table-column label="总价" width="100" align="center"></el-table-column>
          <el-table-column label="说明" width="100" align="center"></el-table-column>
          <el-table-column label="备注" width="100" align="center"></el-table-column>
        </el-table>
      </div>
    </div>
  </el-card>
</template>

<script>
export default {
  data() {
    return {
      searchKey: "",
      curtainData:[]
    };
  },
  methods: {
    searchCurtain() {},
  },
};
</script>

<style scoped>
.curtain-contain {
  margin-top: 10px;
  padding: 5px 10px;
  border: 1px solid #000;
}
.curtain-parent-item {
  text-align: center;
  font-size: 18px;
  font-weight: bold;
}
.curtain-params {
  text-align: center;
  margin-top: 10px;
}
.curtain-list {
  margin-top: 10px;
}
</style>
