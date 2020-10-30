<template>
  <div class="productQuery">
    <el-card shadow="never">
      <div class="tbarStyle">
        <span>日期</span>
        <el-date-picker format="yyyy-MM-dd" value-format="yyyy-MM-dd" placeholder="开始日期区间" v-model="beginTime"
          style="width:150px" @change="initSearch"></el-date-picker>
        &nbsp;--
        <el-date-picker format="yyyy-MM-dd" value-format="yyyy-MM-dd" placeholder="结束日期区间" v-model="finishTime"
          style="width:150px;" @change="initSearch"></el-date-picker>
        <span style="margin-left:5px;">型号/旧型号</span>
        <el-input size="small" @keyup.enter.native="initSearch" placeholder="型号/旧型号" clearable v-model="condition"
          style="width:250px;">
          <el-button @click="initSearch" slot="append" icon="el-icon-search">搜索</el-button>
        </el-input>
      </div>
      <hr />
      <div style="margin-top:10px;">
        <el-table :data="productData" border highlight-current-row style="width: 100%;">
          <el-table-column label="产品型号" prop="ITEM_NO" width="100" align="center"></el-table-column>
          <el-table-column label="旧型号" prop="OLD_ITEM_NO" width="100" align="center"></el-table-column>
          <el-table-column label="批号" prop="BATCH_PLAN" width="120" align="center"></el-table-column>
          <el-table-column label="销售工单号" prop="DJBH" width="120" align="center"></el-table-column>
          <el-table-column label="下单数量" prop="JHSL" width="100" align="center"></el-table-column>
          <el-table-column label="生产数量" prop="SCSL" width="100" align="center"></el-table-column>
          <el-table-column label="状态" prop="STATUS" width="100" align="center">
            <template slot-scope="scope">
              {{scope.row.STATUS | transType}}
            </template>
          </el-table-column>
          <el-table-column label="销售工单日期" prop="FDRQ" width="110" align="center">
            <template slot-scope="scope">
              {{scope.row.FDRQ | datatrans}}
            </template>
          </el-table-column>
          <el-table-column label="要求完工日期" prop="QHRQ" width="110" align="center">
            <template slot-scope="scope">
              {{scope.row.QHRQ | datatrans}}
            </template>
          </el-table-column>
        </el-table>
        <el-pagination style="margin:0 20%;" @current-change="handleCurrentChange" :current-page.sync="currentPage"
          :page-size="limit" layout="total, prev, pager, next, jumper" :total="totalNumber"></el-pagination>
      </div>
    </el-card>
  </div>
</template>

<script>
import { GetProductStatus } from "@/api/itemInfoASP";

export default {
  data() {
    return {
      condition: "",
      beginTime: "",
      finishTime: "",
      productData: [],
      currentPage: 1,
      limit: 15,
      totalNumber: 0,
    };
  },
  filters: {
    transType(value) {
      switch (value) {
        case "0":
          return "待排产";
          break;
        case "1":
          return "已排产";
          break;
        case "2":
          return "生产中";
        case "3":
          return "完工";
      }
    },
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
      let s = date.getSeconds();
      s = s < 10 ? "0" + s : s;
      return y + "-" + MM + "-" + d + " "; /* + h + ':' + m + ':' + s; */
    },
  },
  computed: {
    timeDefault_1() {
      var date = new Date();
      var month = date.getMonth();
      if (month < 10) month = "0" + month;
      var day = date.getDate();
      if (day < 10) day = "0" + day;
      var s1 = date.getFullYear() + "-" + month + "-" + day;
      return s1;
    },
    timeDefault_2() {
      var date = new Date();
      var month = date.getMonth() + 1;
      if (month < 10) month = "0" + month;
      var day = date.getDate();
      if (day < 10) day = "0" + day;
      var s1 = date.getFullYear() + "-" + month + "-" + day;
      return s1;
    },
  },
  methods: {
    initSearch(){
      this.currentPage = 1;
      this.searchData();
    },
    searchData() {
      this.productData = [];
      var data = {
        beginTime: this.beginTime,
        finishTime: this.finishTime,
        condition: this.condition,
        limit: this.limit,
        page: this.currentPage,
      };
      if (!data.beginTime) {
        data.beginTime = "0001/1/1";
      }
      if (!data.finishTime) {
        data.finishTime = "9999/12/31";
      } else {
        data.finishTime = data.finishTime + " 23:59:59";
      }
      GetProductStatus(data).then((res) => {
        this.productData = res.data;
        this.totalNumber = res.count;
      });
    },
    //当前页改变时的操作
    handleCurrentChange() {
      this.searchData();
    },
  },
  created() {
    this.beginTime = this.timeDefault_1;
    this.finishTime = this.timeDefault_2;
    //this.searchData();
  },
};
</script>

<style scoped>
</style>