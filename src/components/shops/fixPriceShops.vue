<template>
  <div class="fixPriceShops">
    <el-card shadow="never">
      <div class="mt10 ml10">
        <span>型号：
        </span>
        <el-input clearable v-model="itemNoKey" @clear="searchShops" @keyup.enter.native="searchShops"
          placeholder="商品型号" style="width:200px;">
        </el-input>
        <span class="ml10">版本：</span>
        <el-input clearable v-model="productKey" @clear="searchShops" @keyup.enter.native="searchShops"
          placeholder="商品版本号" style="width:200px;">
        </el-input>
        <span class="ml10">库存范围:</span>
        <el-input v-model="minNumber" @keyup.enter.native="searchShops" style="width:80px;" oninput="value=value.replace(/[^\d.]/g,'')
                                .replace(/^\./g, '').replace(/\.{2,}/g, '.')
                                .replace('.', '$#$').replace(/\./g, '')
                                .replace('$#$', '.')
                                .slice(0,value.indexOf('.') === -1? value.length: value.indexOf('.') + 3)">
        </el-input>
        <span>至</span>
        <el-input v-model="maxNumber" @keyup.enter.native="searchShops" style="width:80px;" oninput="value=value.replace(/[^\d.]/g,'')
                                .replace(/^\./g, '').replace(/\.{2,}/g, '.')
                                .replace('.', '$#$').replace(/\./g, '')
                                .replace('$#$', '.')
                                .slice(0,value.indexOf('.') === -1? value.length: value.indexOf('.') + 3)">
        </el-input>
        <el-button type="success" @click="searchShops" icon="el-icon-search" size="medium" style="margin-left:20px;">查询
        </el-button>
      </div>
      <div style="margin: 10px 0;">
        <el-button type="primary" size="medium" style="margin-left:20px;" :disabled="selectShops.length == 0"
          @click="addListToCart">
          批量加入购车({{selectShops.length}})
        </el-button>
      </div>
      <el-table :data="shopsData" style="min-width: 750px; margin: 5px auto;" @selection-change="handleSelectionChange"
        :row-style="{height:'40px'}">
        <el-table-column type="selection" width="55" align="center"></el-table-column>
        <el-table-column label="型号" prop="ITEM_NO" width="100" align="center"></el-table-column>
        <el-table-column label="批号" prop="BATCH_NO" width="200" align="center"></el-table-column>
        <el-table-column label="库存数量" prop="QTY" width="80" align="center"></el-table-column>
        <el-table-column label="单位" prop="UNIT_NAME" width="80" align="center"></el-table-column>
        <el-table-column label="版本" prop="PRODUCTVERSION_NAME" width="120" align="center"></el-table-column>
        <el-table-column label="活动" prop="ORDER_NAME" width="200" align="center"></el-table-column>
        <el-table-column label="更新时间" prop="UPDATE_TIME" width="150" align="center">
          <template slot-scope="scope">
            {{scope.row.UPDATE_TIME | datatrans}}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="100" align="center">
          <template slot-scope="scope">
            <a style="color:red;cursor:pointer;" @click="addToCart(scope.row)">加入购物车</a>
          </template>
        </el-table-column>
      </el-table>
      <el-pagination style="margin:0 20%;" @size-change="handleSizeChange" @current-change="handleCurrentChange"
        :current-page.sync="currentPage" :page-size="pageSize" layout="total, prev, pager, next, jumper"
        :total="totalNumber">
      </el-pagination>
    </el-card>
  </div>
</template>

<script>
import { mapMutations } from "vuex";
import Cookies from "js-cookie";
import { GetFixPriceShopsByCondition } from "@/api/itemInfoASP";
import {
  FixPriceShopAddToCart,
  FixPriceShopAddListToCart,
} from "@/api/shopASP";

export default {
  data() {
    return {
      itemNoKey: "",
      productKey: "",
      minNumber: "",
      maxNumber: "",
      shopsData: [],
      currentPage: 1, //当前的页数
      pageSize: 10, //每页的个数
      totalNumber: 0, //总条数
      selectShops: [],
    };
  },
  filters: {
    datatrans(value) {
      //时间戳转化大法
      if (value == null || value == "9999/12/31 00:00:00") {
        return "";
      }
      let date = new Date(value);
      let y = date.getFullYear();
      let MM = date.getMonth() + 1;
      MM = MM < 10 ? "0" + MM : MM;
      let d = date.getDate();
      d = d < 10 ? "0" + d : d;
      let h = date.getHours();
      h = h < 10 ? "0" + h : h;
      let m = date.getMinutes();
      m = m < 10 ? "0" + m : m;
      let ss = date.getSeconds();
      ss = ss < 10 ? "0" + ss : ss;
      return y + "-" + MM + "-" + d + " " + h + ":" + m + ":" + ss;
    },
  },
  methods: {
    searchShops() {
      this.shopsData = [];
      GetFixPriceShopsByCondition({
        itemNoKey: this.itemNoKey.toUpperCase(),
        productKey: this.productKey,
        minNumber: this.minNumber ? this.minNumber : 0,
        maxNumber: this.maxNumber ? this.maxNumber : 0,
        companyId: Cookies.get("companyId"),
        limit: this.pageSize,
        page: this.currentPage,
      })
        .then((res) => {
          this.shopsData = res.data;
          this.totalNumber = res.count;
        })
        .catch((err) => {});
    },
    handleSizeChange() {},
    handleCurrentChange() {
      this.searchShops();
    },
    handleSelectionChange(val) {
      this.selectShops = val;
    },
    addToCart(data) {
      this.$confirm("确定加入该型号，批次的商品？", "提示", {
        confirmButtonText: "是",
        cancelButtonText: "否",
        type: "warning",
      })
        .then(() => {
          FixPriceShopAddToCart({ cid: Cookies.get("cid"), id: data.ID, pId: data.P_ID })
            .then((res) => {
              this.$alert("此型号已添加成功，请前往购物车查看", "添加成功", {
                confirmButtonText: "确定",
                type: "success",
              });
              this.searchShops();
              this.$root.$emit("refreshBadgeIcon", "wallCount");
            })
            .catch((res) => {
              this.$alert("加入失败," + res.msg, "提示", {
                confirmButtonText: "确定",
                type: "error",
              });
            });
        })
        .catch(() => {});
    },
    addListToCart() {
      if (!this.selectShops.length) return;
      this.$confirm("确定加入这些型号，批次的商品？", "提示", {
        confirmButtonText: "是",
        cancelButtonText: "否",
        type: "warning",
      })
        .then(() => {
          var ids = [];
          var pIds = [];
          for (var i = 0; i < this.selectShops.length; i++) {
            ids.push(this.selectShops[i].ID);
            pIds.push(this.selectShops[i].P_ID)
          }
          FixPriceShopAddListToCart({ cid: Cookies.get("cid"), ids: ids, pIds:pIds })
            .then((res) => {
              this.$alert("此型号已添加成功，请前往购物车查看", "添加成功", {
                confirmButtonText: "确定",
                type: "success",
              });
              this.searchShops();
              this.$root.$emit("refreshBadgeIcon", "wallCount");
            })
            .catch((res) => {
              this.$alert("加入失败," + res.msg, "提示", {
                confirmButtonText: "确定",
                type: "error",
              });
            });
        })
        .catch(() => {});
    },
  },
  created() {
    var selectNo = this.$route.params.selectNo;
    if (selectNo) {
      this.itemNoKey = selectNo;
    }
    this.searchShops();
  },
};
</script>

<style scoped>
</style>
