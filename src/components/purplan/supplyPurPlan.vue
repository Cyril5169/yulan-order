<template>
  <div class="safeStock">
    <el-card shadow="never" class="flex-card">
      <div>
        <span>创建日期:</span>
        <el-date-picker style="width:130px;" v-model="beginTime" placeholder="日期区间" size="small">
        </el-date-picker>
        <span>至</span>
        <el-date-picker style="width:130px;" v-model="finishTime" placeholder="日期区间" size="small">
        </el-date-picker>
        <span style="margin-left:10px;">状态:</span>
        <el-select style="width:100px;" v-model="selectStatus" placeholder="请选择" @change="searchData" size="small">
          <el-option v-for="item in statusArray" :key="item.value" :label="item.label" :value="item.value">
          </el-option>
        </el-select>
        <span style="margin-left:10px;">型号:</span>
        <el-input v-model="itemCondition" size="small" style="width: 150px" placeholder="输入型号搜索" @keyup.enter.native="searchData">
        </el-input>
        <el-button icon="el-icon-search" class="greenBtn" @click="searchData" style="margin-left:10px;" size="small">查询
        </el-button>
      </div>
      <div style="margin-top:10px;">
        <el-button type="primary" size="small" :disabled="selectPlan.length == 0" @click="onSubmitToSupply">批量确认</el-button>
        <el-button type="danger" size="small" :disabled="selectPlan.length == 0" @click="onCancelToSupply">批量取消</el-button>
        <el-button @click="exportExcel" type="primary" size="small">导出Excel</el-button>
      </div>
      <hr style="width:100%;" />
      <div style="flex:1;position:relative;">
        <el-table :data="planData" height="100%" style="position:absolute;" ref="planDataTable"
          @selection-change="handleSelectionChange" :row-class-name="tableRowClassName" show-summary
          :summary-method="getSummaries">
          <el-table-column type="selection" width="55" align="center"></el-table-column>
          <el-table-column type="index" width="50" align="center"></el-table-column>
          <el-table-column label="型号" prop="ITEM_NO" width="100" align="center"></el-table-column>
          <el-table-column label="版本名称" prop="PRODUCTVERSION_NAME" width="100" align="center"></el-table-column>
          <el-table-column label="需求计划量" prop="PLAN_QUANTITY" width="100" align="center"></el-table-column>
          <el-table-column label="需求日期" prop="REQ_DATE" width="100" align="center">
            <template slot-scope="scope">
              <span>{{scope.row.REQ_DATE | dateFilter}}</span>
            </template>
          </el-table-column>
          <el-table-column label="距交货天数" width="100" align="center"
            :filters="[{text: '已超期', value: '已超期'},{text: '未超期', value: '未超期'}]" :filter-method="filterHandler">
            <template slot-scope="scope">
              <span>{{ getSpanDate(scope.row) }}</span>
            </template>
          </el-table-column>
          <el-table-column label="已到货数量" prop="ARRIVAL_QUANTITY" width="100" align="center"></el-table-column>
          <el-table-column label="未到货数量" prop="UNARRIVAL_QUANTITY" width="180" align="center"
            :filters="[{text: '小于', value: '小于'}]" :filter-method="filterHandler2">
            <template slot="header" slot-scope="scope">
              <span>未到货数量</span>
              <input v-model="unArrivalNum" class="inputCls" oninput="value=value.replace(/[^\d.]/g,'')
                           .replace(/^\./g, '').replace(/\.{2,}/g, '.')
                           .replace('.', '$#$').replace(/\./g, '')
                           .replace('$#$', '.')
                           .slice(0,value.indexOf('.') === -1? value.length: value.indexOf('.') + 3)" />
            </template>
          </el-table-column>
          <el-table-column label="状态" prop="STATE_ID" width="80" align="center">
            <template slot-scope="scope">
              <span>{{scope.row.STATE_ID | transStatus}}</span>
            </template>
          </el-table-column>
          <el-table-column label="供应商状态" prop="CONFIRM" width="80" align="center">
            <template slot-scope="scope">
              <span>{{scope.row.CONFIRM | confirmFilter}}</span>
            </template>
          </el-table-column>
          <el-table-column label="备注" width="200" prop="NOTE" align="center"></el-table-column>
          <el-table-column label="创建日期" prop="CRE_DATE" width="130" align="center">
            <template slot-scope="scope">
              <span>{{scope.row.CRE_DATE | dateFilter('yyyy-MM-dd HH:mm')}}</span>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </el-card>
  </div>
</template>

<script>
import {
  GetSupplyPurPlanListByCondition,
  EditPruPlan,
  InsertPurPlanByHand,
  DeletePurPlan,
  GetItemAndSupply,
  EditSupplyStatus
} from "@/api/safeStockASP";
import { downLoadFile } from "@/common/js/downLoadFile";
import Cookies from "js-cookie";

export default {
  data() {
    return {
      beginTime: '',
      finishTime: '',
      selectStatus: '',
      statusArray: [
        {
          value: '',
          label: '全部'
        },
        {
          value: '1',
          label: '生效'
        },
        {
          value: '2',
          label: '部分到货'
        },
        {
          value: '3',
          label: '完成'
        },
      ],
      itemCondition: '',
      planData: [],
      selectPlan: [],
      unArrivalNum: 0
    }
  },
  filters: {
    transStatus(value) {
      switch (value) {
        case "":
          return "全部";
          break;
        case "1":
          return "生效";
          break;
        case "2":
          return "部分到货";
          break;
        case "3":
          return "完成";
          break;
      }
    },
    confirmFilter(value) {
      switch (value) {
        case "0":
          return "未提交";
          break;
        case "1":
          return "待确认";
          break;
        case "2":
          return "已确认";
          break;
      }
    }
  },
  methods: {
    searchData() {
      var data = {
        beginTime: this.beginTime,
        finishTime: this.finishTime,
        selectStatus: this.selectStatus,
        itemCondition: this.itemCondition,
        supplyCondition: Cookies.get("companyId")
      }
      if (!data.beginTime) {
        data.beginTime = "0001/1/1";
      }
      if (!data.finishTime) {
        data.finishTime = "9999/12/31";
      } else {
        data.finishTime = new Date(new Date(data.finishTime.getTime()).setHours(23, 59, 59, 999));
      }
      this.planData = [];
      GetSupplyPurPlanListByCondition(data).then(res => {
        this.planData = res.data;
        this.$nextTick(() => {
          this.$refs.planDataTable.doLayout();
        })
      })
    },
    handleSelectionChange(val) {
      this.selectPlan = val;
    },
    exportExcel() {
      var data = {
        beginTime: this.beginTime,
        finishTime: this.finishTime,
        selectStatus: this.selectStatus,
        itemCondition: this.itemCondition,
        supplyCondition: Cookies.get("companyId")
      }
      if (!data.beginTime) {
        data.beginTime = "0001/1/1";
      }
      if (!data.finishTime) {
        data.finishTime = "9999/12/31";
      } else {
        data.finishTime = new Date(new Date(data.finishTime.getTime()).setHours(23, 59, 59, 999));
      }
      downLoadFile(this.Global.baseUrl + `PUR_PLAN/ExportSupplyExcel?beginTime=${this.dateFilter(data.beginTime, 'yyyy-MM-dd HH:mm:ss')}
        &finishTime=${this.dateFilter(data.finishTime, 'yyyy-MM-dd HH:mm:ss')}
        &selectStatus=${data.selectStatus}&itemCondition=${data.itemCondition}&supplyCondition=${data.supplyCondition}`);
    },
    getSpanDate(row) {
      var date = "";
      if (row.STATE_ID == "1" || row.STATE_ID == "2") {
        var req_date = new Date(row.REQ_DATE);
        if (req_date) {
          date = Math.ceil((new Date(req_date).getTime() - new Date().getTime()) / (24 * 60 * 60 * 1000));
        }
      }
      return date;
    },
    tableRowClassName({ row, rowIndex }) {
      if (this.getSpanDate(row) < 0) {
        return "back-row";
      }
      return "";
    },
    onSubmitToSupply() {
      if (this.selectPlan.length) {
        this.$confirm("已选择" + this.selectPlan.length + "条记录，确定确认吗？", "提示", {
          confirmButtonText: "是",
          cancelButtonText: "否",
          type: "warning",
        }).then(() => {
          EditSupplyStatus({ planList: this.selectPlan, status: '2' }).then(res => {
            this.$alert("确认成功！", "提示", {
              confirmButtonText: "确定",
              type: "warning",
            });
            this.searchData();
          }).catch(res => {
            this.$alert("确认失败！" + res.msg, "提示", {
              confirmButtonText: "确定",
              type: "warning",
            });
          })
        }).catch(() => { });
      }
    },
    onCancelToSupply() {
      if (this.selectPlan.length) {
        this.$confirm("已选择" + this.selectPlan.length + "条记录，确定取消？", "提示", {
          confirmButtonText: "是",
          cancelButtonText: "否",
          type: "warning",
        }).then(() => {
          EditSupplyStatus({ planList: this.selectPlan, status: '1' }).then(res => {
            this.$alert("取消成功！", "提示", {
              confirmButtonText: "确定",
              type: "warning",
            });
            this.searchData();
          }).catch(res => {
            this.$alert("取消失败！" + res.msg, "提示", {
              confirmButtonText: "确定",
              type: "warning",
            });
          })
        }).catch(() => { });
      }
    },
    filterHandler(value, row, column) {
      if (value == '已超期')
        return this.getSpanDate(row) < 0
      else if (value == '未超期')
        return this.getSpanDate(row) > 0
    },
    filterHandler2(value, row, column) {
      if (value == '小于')
        return row.UNARRIVAL_QUANTITY < this.unArrivalNum && row.UNARRIVAL_QUANTITY > 0
    },
    getSummaries(param) {
      const { columns, data } = param;
      const sums = [];
      if (data && data.length > 0) {
        columns.forEach((column, index) => {
          if (index === 1) {
            sums[index] = "合计";
            return;
          } else if (column.property == 'PLAN_QUANTITY'
            || column.property == 'ARRIVAL_QUANTITY'
            || column.property == 'UNARRIVAL_QUANTITY'
            || column.property == 'STOCK_QUANTITY') {
            var values = data.map(item => Number(item[column.property]));
            if (!values.every(value => isNaN(value))) {
              sums[index] = values.reduce((prev, curr) => {
                const value = Number(curr);
                if (!isNaN(value)) {
                  return prev + curr;
                } else {
                  return prev;
                }
              }, 0);
              sums[index] = sums[index].toFixed(2);
            } else {
              sums[index] = "";
            }
          } else {
            sums[index] = "";
          }
        });
      }
      return sums;
    }
  },
  mounted() {
    this.beginTime = new Date(new Date().setMonth(new Date().getMonth() - 3));
    this.finishTime = new Date();
    this.searchData();
  },
}
</script>

<style scoped>
.safeStock {
  flex: 1;
  display: flex;
  flex-direction: column;
}
.greenBtn {
  background: #8bc34a;
  color: rgb(255, 255, 255);
}
.flex-card {
  flex: 1;
  display: flex;
  flex-direction: column;
}
.inputCls {
  background-color: #fff;
  background-image: none;
  border-radius: 4px;
  border: 1px solid #dcdfe6;
  box-sizing: border-box;
  color: #606266;
  display: inline-block;
  width: 50px;
}
.inputCls:focus {
  border-color: #409eff;
  outline: 0;
}
</style>
<style>
.flex-card .el-card__body {
  flex: 1;
  display: flex;
  flex-direction: column;
}
.safeStock .el-table .back-row {
  background: rgb(250, 159, 159);
}
</style>
