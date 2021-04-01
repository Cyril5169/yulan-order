<template>
  <div class="limitPriceQuery">
    <el-card shadow="never">
      <div>
        <span>版本</span>
        <el-select v-model="productKey" placeholder="--请选择版本--" filterable>
          <el-option label="全部" value=""></el-option>
          <el-option v-for="item in productVersionData" :key="item.PRODUCTVERSION_ID" :label="item.PRODUCTVERSION_NAME"
            :value="item.PRODUCTVERSION_ID"></el-option>
        </el-select>
        <el-button icon="el-icon-search" class="greenBtn" @click="initSearch" style="margin-left:10px;">查询</el-button>
      </div>
      <hr />
      <el-table :data="shopsData">
        <el-table-column label="版本号" prop="ITEM_VERSION" width="100" align="center"></el-table-column>
        <el-table-column label="版本名称" prop="PRODUCTVERSION_NAME" width="150" align="center"></el-table-column>
        <el-table-column label="产品型号" prop="ITEM_NO" width="100" align="center"></el-table-column>
        <el-table-column label="单位" prop="UNIT_NAME" width="100" align="center"></el-table-column>
        <el-table-column label="长(mm)" prop="LENGTH" width="100" align="center"></el-table-column>
        <el-table-column label="宽(mm)" prop="WIDTH" width="100" align="center"></el-table-column>
        <el-table-column label="基材类型" prop="PROPERTY_TYPE_NAME" width="120" align="center"></el-table-column>
        <el-table-column label="财务分类" prop="PROPERTY_TYPE_NAME2" width="120" align="center"></el-table-column>
        <el-table-column label="非普通出口贸易价" prop="PRICE_ADVISE_CK2" width="130" align="center"></el-table-column>
      </el-table>
      <el-pagination style="margin:0 30%;" @current-change="searchShops" :current-page.sync="currentPage"
        :page-size="limit" layout="total, prev, pager, next, jumper" :total="totalNumber">
      </el-pagination>
    </el-card>
  </div>
</template>

<script>
import {
  GetProductVersionData,
  GetLimitPriceByProVersion,
} from "@/api/itemInfoASP";

export default {
  data() {
    return {
      productVersionData: [],
      productKey: "",
      shopsData: [],
      currentPage: 1, //当前的页数
      limit: 12, //每页的个数
      totalNumber: 0, //总条数
    };
  },
  methods: {
    getProductVersion() {
      this.productVersionData = [];
      GetProductVersionData().then((res) => {
        this.productVersionData = res.data;
      });
    },
    initSearch() {
      this.currentPage = 1;
      this.searchShops();
    },
    searchShops() {
      this.shopsData = [];
      GetLimitPriceByProVersion({
        productVersion: this.productKey,
        limit: this.limit,
        page: this.currentPage,
      }).then((res) => {
        this.shopsData = res.data;
        this.totalNumber = res.count;
        console.log(res.data);
      });
    },
  },
  created() {
    this.getProductVersion();
  },
};
</script>

<style scoped>
.greenBtn {
  background: #8bc34a;
  color: rgb(255, 255, 255);
}
</style>
