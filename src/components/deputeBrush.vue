<template>
  <div>
    <el-card shadow="hover">
      <el-dialog
        title="订单详情"
        :show-close="true"
        :visible.sync="dialogVisible"
        width="65%"
      >
        <dialogOrderDetail :ruleForm="ruleForm"></dialogOrderDetail>
      </el-dialog>
      <div class="block">
        <span>选择月份：</span>
        <el-date-picker
          :picker-options="pickerOptions1"
          v-model="date1"
          type="month"
          placeholder="请选择月份"
          value-format="yyyy-MM-dd"
        ></el-date-picker
        >&nbsp;至
        <el-date-picker
          :picker-options="pickerOptions2"
          v-model="date2"
          type="month"
          placeholder="请选择月份"
          value-format="yyyy-MM-dd"
        ></el-date-picker>
        <el-button
          @click="searchByMonth()"
          slot="append"
          type="success"
          icon="el-icon-search"
          >搜索</el-button
        >
      </div>
      <div>
        <p class="fstrong f16" style="margin-top:10px;">订单信息汇总表:</p>
      </div>
      <el-table
        :data="tableData"
        border
        :summary-method="getSummaries"
        :row-class-name="tableRowClassName"
        show-summary
        style="width: 100%; margin-top:10px"
      >
        <el-table-column>
          <el-table-column
            prop="WEB_TJ_TIME"
            width="160"
            label="提交时间"
            align="center"
          ></el-table-column>
        </el-table-column>
        <el-table-column :label="tableHead1">
          <el-table-column label="订单号" align="center">
            <template slot-scope="scope1">
              <el-button
                @click="openDialog(scope1.row.ORDER_NO, scope1.row.STATUS_ID)"
                type="text"
                size="medium"
                >{{ scope1.row.ORDER_NO }}</el-button
              >
            </template>
          </el-table-column>
          <el-table-column label="订单状态" align="center">
            <template slot-scope="scope">
              <span>{{ scope.row.STATUS_ID | transStatus }}</span>
            </template>
          </el-table-column>
        </el-table-column>
        <el-table-column :label="tableHead2">
          <template slot="header">
            <span style="color:red;">{{ tableHead2 }}</span>
          </template>
          <el-table-column
            prop="sumMoney"
            label="订单金额"
            align="center"
          ></el-table-column>
          <el-table-column
            prop="ALLBACK_Y"
            label="年返利使用金额"
            align="center"
          ></el-table-column>
        </el-table-column>
        <el-table-column :label="tableHead3">
          <template slot="header">
            <span style="color:red;">{{ tableHead3 }}</span>
          </template>
          <el-table-column
            prop="ALLBACK_M"
            label="月返利使用金额"
            align="center"
          ></el-table-column>
          <el-table-column
            prop="ALL_SPEND"
            label="实付金额"
            align="center"
          ></el-table-column>
        </el-table-column>
        <el-table-column>
          <el-table-column
            prop="REBATE_MONEY"
            label="返利金额"
            align="center"
          ></el-table-column>
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
import { GetTaskProgress } from "@/api/orderListASP";
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
      tableData: [],
      assignments: "",
      assignmentsTarget: "",
      assignmentsReduce: "",
      tableHead1: "",
      tableHead2: "",
      tableHead3: "",
      pickerOptions1: {
        disabledDate: date1 => {
          if (this.date2) {
            return date1.getTime() >= new Date(this.date2).getTime();
          }
        }
      },
      pickerOptions2: {
        disabledDate: date2 => {
          if (this.date1) {
            return date2.getTime() <= new Date(this.date1).getTime();
          }
        }
      }
    };
  },
  created: function() {
    this.initMonth();
  },
  components: {
    dialogOrderDetail
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
        const values = data.map(item => Number(item[column.property]));
        if (!values.every(value => isNaN(value))) {
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
        order_no: this.order_no
      };
      orderDetail(url, data).then(res => {
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
      let url = "/assignments/getAssignments.do";
      let data = {
        year: year,
        endYear: endYear,
        month: month,
        endMonth: endMonth,
        cid: Cookies.get("cid"),
        companyId: Cookies.get("companyId")
      };
      //searchAssignments(url, data)
      GetTaskProgress(data).then(res => {
        let zoom = res.data[0].orders;
        let reduce = 0;
        for (let i = 0; i < zoom.length; i++) {
          zoom[i].sumMoney =
            zoom[i].ALL_SPEND.add(zoom[i].ALLBACK_Y).add(zoom[i].ALLBACK_M);
          reduce = reduce.add(zoom[i].ALL_SPEND);
        }
        this.tableData = zoom;
        if (res.data[0].assignments) {
          this.assignments = res.data[0].assignments.ASSIGNMENTS;
          this.assignmentsTarget = res.data[0].assignments.ASSIGNMENTS_TARGET;
          this.assignmentsReduce = (this.assignmentsTarget - reduce).toFixed(2);
          this.tHead();
        } else {
          this.tableHead1 = "所选月无任务";
        }
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
      this.tableHead1 = `${selectMonth}协议月任务：${this.assignments}`;
      this.tableHead2 = `${selectMonth}促销目标任务：${this.assignmentsTarget}`;
      this.tableHead3 = `任务完成差额：${this.assignmentsReduce}`;
    }
  },
  filters: {
    transStatus: function(value) {
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
    }
  }
};
</script>
<style scoped>
.headSpan {
  font-weight: bold;
  font-size: 18px;
  color: black;
}
</style>

<style>
.el-table .success-row {
  background: #f0f9eb;
}
</style>