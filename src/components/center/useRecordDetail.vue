<template>
  <div>
    <div>
      <h1 style="margin: 0 0 10px 0">累计使用金额:{{ accMoney }}</h1>
      <el-date-picker type="date" format="yyyy-MM-dd" value-format="yyyy-MM-dd" placeholder="日期区间" v-model="date1"
        style="width:14%;"></el-date-picker>&nbsp;至
      <el-date-picker type="date" format="yyyy-MM-dd" value-format="yyyy-MM-dd" placeholder="日期区间" v-model="date2"
        style="width:14%;"></el-date-picker>
      <el-input @keyup.enter.native="search()" placeholder="请输入订单号搜索订单" v-model="find" style="width:300px;">
        <el-button @click="search()" slot="append" icon="el-icon-search">搜索</el-button>
      </el-input>
    </div>
    <el-table empty-text="暂无使用记录" :data="useRecordData" :show-summary="useRecordData.length > 1" :summary-method="getSummaries"
      style="width: 100%" :row-class-name="tableRowClassName">
      <el-table-column align="center" prop="ORDER_NO" label="订单号"></el-table-column>
      <el-table-column align="center" prop="ITEM_NO" label="商品型号"></el-table-column>
      <el-table-column align="center" label="使用时间">
        <template slot-scope="scope1">
          <span>{{ scope1.row.DATE_USE | dateFilter('yyyy-MM-dd HH:mm:ss') }}</span>
        </template>
      </el-table-column>
      <el-table-column align="center" prop="REBATE_MONEY" label="使用金额">
        <template slot-scope="scope1">
          <span v-if="isManager === '0'">***</span>
          <span v-else>{{ scope1.row.REBATE_MONEY }}</span>
        </template>
      </el-table-column>
      <el-table-column align="center" prop="NOTES" label="备注"></el-table-column>
    </el-table>
    <el-pagination class="tc mt10" @size-change="handleSizeChange" @current-change="handleCurrentChange"
      :current-page.sync="currentPage" :page-sizes="[10, 20, 50, 100]" :page-size="limit"
      layout="total, sizes, prev, pager, next, jumper" :total="count">
    </el-pagination>
  </div>
</template>

<script>
import Cookies from "js-cookie";
import { getUseRecord, getTotalRecordSum } from "@/api/orderListASP";

export default {
  name: "useRecordDetail",
  props: ["couponId"],
  data() {
    return {
      isManager: Cookies.get("isManager"),
      useRecordData: [],
      useTable: [],
      date1: "",
      date2: "",
      find: "",
      limit: 20,
      count: 0,
      currentPage: 1,
      accMoney: 0
    };
  },
  methods: {
    getRecordUse() {
      this.useRecordData = [];
      var data = {
        couponId: this.couponId,
        keyWords: this.find,
        beginTime: this.date1,
        finishTime: this.date2,
        page: this.currentPage,
        limit: this.limit
      };
      if (!data.beginTime) {
        data.beginTime = "0001/1/1";
      }
      if (!data.finishTime) {
        data.finishTime = "9999/12/31";
      } else {
        data.finishTime = data.finishTime + " 23:59:59";
      }
      getUseRecord(data).then(res => {
        this.useRecordData = res.data;
        this.count = res.count;
        //总数
        getTotalRecordSum({ couponId: this.couponId }).then(res1 => {
          this.accMoney = res1.data;
        });
      });
    },
    search() {
      this.currentPage = 1;
      this.getRecordUse();
    },
    handleSizeChange(val) {
      this.limit = val;
      this.currentPage = 1;
      this.getRecordUse();
    },
    //翻页获取订单
    handleCurrentChange(val) {
      this.currentPage = val;
      this.getRecordUse();
    },
    getSummaries({ columns, data }) {
      var sums = [];
      columns.forEach((column, index) => {
        if (index == 0) {
          sums[index] = "本页合计";
          return;
        } else if (index == 3) {
          var values = data.map(item => Number(item[column.property]));
          if (!values.every(value => isNaN(value))) {
            sums[index] = values.reduce((prev, curr, index) => {
              const value = Number(curr);
              if (!isNaN(value)) {
                //作废的不统计
                return prev + curr;
              } else {
                return prev;
              }
            }, 0);
            sums[index] = sums[index].toFixed(2);
            if (this.isManager == "0") sums[index] = "***";
          } else {
            sums[index] = "";
          }
        } else {
          sums[index] = "";
        }
      });
      return sums;
    },
    tableRowClassName({ row, rowIndex }) {
      if (rowIndex % 2 == 0) {
        return "success-row";
      }
      return "";
    }
  },
  activated() {
    // this.find = "";
    // this.date1 = "";
    // this.date2 = "";
    // this.currentPage = 1;
    // this.limit = 20;
    this.getRecordUse();
  }
};
</script>