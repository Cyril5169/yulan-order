<template>
  <div>
    <el-card shadow="hover">
      <el-dialog title="订单详情" :show-close="true" :visible.sync="dialogVisible" width="65%">
        <dialogOrderDetail :ruleForm="ruleForm"></dialogOrderDetail>
      </el-dialog>

      <div class="yearArea">
        <table class="task-area">
          <tr>
            <td width="160">
              <el-select size="mini" v-model="selectYear" style="width:75px;" @change="searchByYear">
                <el-option v-for="item in 85" :key="item+2015" :value="item+2015" :label="item+2015"></el-option>
              </el-select>
              <span style="font-size:14px;">年任务查询</span>
            </td>
            <td width="22%">
              <span class="year-task-item">{{selectYear}}年协议年任务:{{yearData.ASSIGNMENTS?yearData.ASSIGNMENTS:'无'}}</span>
            </td>
            <td width="22%">
              <span class="year-task-item">{{selectYear}}年实付总额:{{yearData.ALL_SPEND}}</span>
            </td>
            <td width="22%">
              <span
                class="year-task-item">{{selectYear}}年年任务完成差额:{{(yearData.ASSIGNMENTS - yearData.ALL_SPEND) | dosageFilter}}</span>
            </td>
            <td>
              <span class="year-task-item" v-if="(yearData.ASSIGNMENTS - yearData.ALL_SPEND) > 0">未完成</span>
              <span class="year-task-item" style="color: green;" v-else>已完成</span>
            </td>
          </tr>
        </table>
      </div>
      <div>
        <span class="fstrong f16" style="margin-right:20px;">订单信息汇总表:</span>
        <span>选择月份：</span>
        <el-date-picker size="mini" style="width:120px;" :picker-options="pickerOptions1" v-model="date1" type="month"
          placeholder="请选择月份" value-format="yyyy-MM-dd"></el-date-picker>&nbsp;至
        <el-date-picker size="mini" style="width:120px;" :picker-options="pickerOptions2" v-model="date2" type="month"
          placeholder="请选择月份" value-format="yyyy-MM-dd"></el-date-picker>
        <el-button @click="searchByMonth()" slot="append" size="mini" type="success" icon="el-icon-search">搜索
        </el-button>

      </div>
      <el-table :data="tableData" border :summary-method="getSummaries" :row-class-name="tableRowClassName" show-summary
        style="width: 100%; margin-top:10px">
        <el-table-column>
          <el-table-column prop="WEB_TJ_TIME" width="160" label="提交时间" align="center"></el-table-column>
        </el-table-column>
        <el-table-column :render-header="renderFirstHead">
          <el-table-column label="订单号" align="center">
            <template slot-scope="scope1">
              <el-button @click="openDialog(scope1.row.ORDER_NO, scope1.row.STATUS_ID)" type="text" size="medium">
                {{ scope1.row.ORDER_NO }}</el-button>
            </template>
          </el-table-column>
          <el-table-column label="订单状态" align="center">
            <template slot-scope="scope">
              <span>{{ scope.row.STATUS_ID | transStatus }}</span>
            </template>
          </el-table-column>
        </el-table-column>
        <el-table-column>
          <template slot="header">
            <span style="color:red;">{{ tableHead2 }}</span>
          </template>
          <el-table-column prop="sumMoney" label="订单金额" align="center"></el-table-column>
          <el-table-column prop="ALLBACK_Y" label="年返利使用金额" align="center"></el-table-column>
        </el-table-column>
        <el-table-column>
          <template slot="header">
            <span style="color:red;">{{ tableHead3 }}</span>
          </template>
          <el-table-column prop="ALLBACK_M" label="月返利使用金额" align="center"></el-table-column>
          <el-table-column prop="ALL_SPEND" label="实付金额" align="center"></el-table-column>
        </el-table-column>
        <el-table-column>
          <template slot="header">
            <span style="color:red;" v-if="assignmentsReduce > 0">未完成</span>
            <span style="color:green;" v-else>已完成</span>
          </template>
          <el-table-column prop="REBATE_MONEY" label="返利金额" align="center"></el-table-column>
          <el-table-column label="备注" align="center">
            <template slot-scope="scope1">
              <span>{{ scope1.row.REBATE_NOTES }}</span>
            </template>
          </el-table-column>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>
<script>
import Axios from "axios";
import Cookies from "js-cookie";
import dialogOrderDetail from "../components/order/dialogOrderDetail";
import { searchAssignments, orderDetail } from "@/api/orderList";
import { GetTaskProgress, GetYearTaskProgress } from "@/api/orderListASP";
import { mapMutations, mapActions } from "vuex";
import { mapState } from "vuex";
export default {
  data() {
    return {
      cid: "",
      order_no: "",
      ruleForm: {},
      dialogVisible: false,
      date1: "",
      date2: "",
      selectYear: new Date().getFullYear(),
      tableData: [],
      yearData: [],
      assignments: "",
      assignmentsTarget: "",
      assignmentsReduce: "",
      allSpanSum: 0,
      tableHead1: "",
      tableHead2: "",
      tableHead3: "",
      pickerOptions1: {
        disabledDate: (date1) => {
          if (this.date2) {
            return (
              date1.getTime() >= new Date(this.date2).getTime() ||
              date1.getFullYear() != this.selectYear
            );
          }
        },
      },
      pickerOptions2: {
        disabledDate: (date2) => {
          if (this.date1) {
            return (
              date2.getTime() <= new Date(this.date1).getTime() ||
              date2.getFullYear() != this.selectYear
            );
          }
        },
      },
    };
  },
  created: function () {
    this.initMonth();
    this.searchByYear();
  },
  components: {
    dialogOrderDetail,
  },
  methods: {
    openDialog(val, status) {
      this.cid = Cookies.get("cid");
      this.order_no = val;
      this.getDetail();
    },
    //获取当前月份
    initMonth() {
      let date = new Date();
      let year = date.getFullYear();
      let month = date.getMonth() + 1;
      if (month < 10) {
        month = `0${month}`;
      }
      this.date1 = `${year}-${month}-01`;
      this.date2 = this.date1;
      this.searchByMonth();
    },
    //计算表格末行
    getSummaries(param) {
      const { columns, data } = param;
      const sums = [];
      columns.forEach((column, index) => {
        if (index === 0) {
          sums[index] = "总计";
          return;
        }
        const values = data.map((item) => Number(item[column.property]));
        if (!values.every((value) => isNaN(value))) {
          sums[index] = values.reduce((prev, curr) => {
            const value = Number(curr);
            if (!isNaN(value)) {
              return prev + curr;
            } else {
              return prev;
            }
          }, 0);
          if (index >= 3 && index <= 7) {
            sums[index] = sums[index].toFixed(2);
            sums[index] += " 元";
          }
        } else {
          sums[index] = "";
        }
      });
      return sums;
    },
    getDetail() {
      let url = "/order/getOrderContent.do";
      let data = {
        cid: this.cid,
        order_no: this.order_no,
      };
      orderDetail(url, data).then((res) => {
        this.ruleForm = res.data.data[0];
        this.dialogVisible = true;
      });
    },
    //按月搜索
    searchByMonth() {
      this.tableData = [];
      if (!this.date1 && !this.date2) return;
      else {
        if (!this.date1) this.date1 = this.date2;
        if (!this.date2) this.date2 = this.date1;
      }
      let year = this.date1.slice(0, 4);
      let endYear = this.date2.slice(0, 4);
      let month = this.date1.slice(5, 7);
      let endMonth = this.date2.slice(5, 7);
      if (year != endYear) {
        this.$alert("不能跨年，只能选择同一年度月份查询", "提示", {
          confirmButtonText: "确定",
          type: "warning",
        });
      }
      let url = "/assignments/getAssignments.do";
      let data = {
        year: year,
        endYear: endYear,
        month: month,
        endMonth: endMonth,
        cid: Cookies.get("cid"),
        companyId: Cookies.get("companyId"),
      };
      GetTaskProgress(data).then((res) => {
        let zoom = res.data[0].orders;
        this.allSpanSum = 0;
        for (let i = 0; i < zoom.length; i++) {
          zoom[i].sumMoney = zoom[i].ALL_SPEND.add(zoom[i].ALLBACK_Y).add(
            zoom[i].ALLBACK_M
          );
          this.allSpanSum = this.allSpanSum.add(zoom[i].ALL_SPEND);
        }
        this.tableData = zoom;
        if (res.data[0].assignments) {
          this.assignments = res.data[0].assignments.ASSIGNMENTS;
          this.assignmentsTarget = res.data[0].assignments.ASSIGNMENTS_TARGET;
          this.assignmentsReduce = (
            this.assignmentsTarget - this.allSpanSum
          ).toFixed(2);
          this.tHead();
        } else {
          this.tableHead1 = "所选月无任务";
        }
      });
    },
    searchByYear() {
      this.yearData = [];
      GetYearTaskProgress({
        year: this.selectYear,
        cid: Cookies.get("cid"),
      }).then((res) => {
        this.yearData = res.data[0];
      });
    },
    //隔行变色
    tableRowClassName({ row, rowIndex }) {
      if (rowIndex % 2 == 0) {
        return "success-row";
      }
      return "";
    },
    ...mapMutations("navTabs", ["addTab"]),
    ...mapActions("navTabs", ["closeTab", "closeToTab"]),
    //表头
    tHead() {
      var selectMonth = "";
      if (this.date1 == this.date2) {
        selectMonth = this.date1.slice(5, 7) + "月";
      } else if (this.date1.slice(0, 4) == this.date2.slice(0, 4)) {
        selectMonth =
          this.date1.slice(5, 7) + "-" + this.date2.slice(5, 7) + "月总";
      } else {
        selectMonth =
          this.date1.slice(0, 4) +
          "." +
          this.date1.slice(5, 7) +
          "-" +
          this.date2.slice(0, 4) +
          "." +
          this.date2.slice(5, 7) +
          "月总";
      }
      this.date1 == this.date2
        ? this.date1.slice(5, 7) + "月"
        : this.date1.slice(5, 7) + "-" + this.date2.slice(5, 7) + "月总";
      this.tableHead1 = `${selectMonth}促销目标任务：${this.assignmentsTarget}`;
      this.tableHead2 = `${selectMonth}实付总额：${this.allSpanSum}`;
      this.tableHead3 = `任务完成差额：${this.assignmentsReduce}`;
    },
    renderFirstHead(h) {
      return h("span", { attrs: { style: "color:red" } }, this.tableHead1);
    },
  },
  filters: {
    transStatus: function (value) {
      switch (value) {
        case "0":
          return "窗帘待审核";
          break;
        case "1":
          return "已提交";
          break;
        case "12":
          return "已接收";
          break;
        case "2":
          return "已受理";
          break;
        case "3":
          return "已作废";
          break;
        case "4":
          return "部分发货";
          break;
        case "5":
          return "余额不足待提交";
          break;
        case "6":
          return "余额不足可提交";
          break;
        case "7":
          return "已完成";
          break;
      }
    },
  },
};
</script>
<style scoped>
.yearArea {
  padding: 5px;
  margin-bottom: 20px;
  border: 1px solid gray;
  background: #f5f7fa;
}
.task-area {
  margin-right: 10px;
  width: 100%;
}
.year-task-item {
  font-size: 14px;
  color: red;
  font-weight: bold;
}
</style>

<style>
.el-table .success-row {
  background: #f0f9eb;
}
</style>