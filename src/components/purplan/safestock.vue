<template>
  <div class="safeStock">
    <el-card shadow="never">
      <div style="margin-left:20px;">
        <span>统计范围:{{beginTime | dateFilter}} ~ {{finishTime | dateFilter}}</span>
        <el-button icon="el-icon-search" class="greenBtn" @click="initSearch" style="margin-left:10px;" size="small">查询
        </el-button>
        <el-button v-if="buttonShow" type="primary" @click="onSaveClick" size="small">保存数据</el-button>
      </div>
      <hr />
      <el-table :data="stockData" height="530">
        <el-table-column label="型号" prop="ITEM_NO" width="100" align="center"></el-table-column>
        <el-table-column label="版本名称" prop="PRODUCTVERSION_NAME" width="80" align="center"></el-table-column>
        <el-table-column label="供货周期(天)" prop="OEM_SUPPLY_DAYS" width="100" align="center"></el-table-column>
        <el-table-column label="上市年月" prop="DATE_UP" width="70" align="center"></el-table-column>
        <el-table-column label="已上市月份数" prop="SSYS" width="100" align="center"></el-table-column>
        <el-table-column label="总销售量" prop="QTY" width="80" align="center"></el-table-column>
        <el-table-column label="总销售频次" prop="QTY_PC" width="80" align="center"></el-table-column>
        <el-table-column label="单位" prop="UNIT" width="50" align="center"></el-table-column>
        <el-table-column label="统计月份数" prop="YS" width="90" align="center"></el-table-column>
        <el-table-column label="计算月份数" prop="JSYS" width="90" align="center"></el-table-column>
        <el-table-column label="月均销售量" prop="QTY_MONTH" width="90" align="center"></el-table-column>
        <el-table-column label="月均销售频次" prop="QTY_PC_MONTH" width="100" align="center"></el-table-column>
        <el-table-column label="日均销售量" prop="QTY_DAY" width="90" align="center"></el-table-column>
        <el-table-column label="预警数" prop="QTY_ARM" width="60" align="center"></el-table-column>
        <el-table-column label="新产品标志" prop="NEW_FLAG" width="90" align="center"></el-table-column>
        <el-table-column label="版本发放数量" prop="VERSION_NUM" width="100" align="center"></el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script>
import {
  GetSupplySetting,
  GetSafeStockData,
  GetPlanBaseByMounth,
  InsertPlanBaseList
} from "@/api/safeStockASP";

export default {
  data() {
    return {
      beginTime: "",
      finishTime: "",
      currentPage: 1,
      stockData: [],
      buttonShow: false
    }
  },
  methods: {
    initDate() {
      //查找周期
      GetSupplySetting().then(res => {
        if (res.data.length) {
          //周期
          var month_num_para = res.data.filter(item => item.PARAMETER == 'month_num');
          if (month_num_para.length) {
            month_num_para = month_num_para[0];
            var month_num = month_num_para.VALUE;
            //结束时间为本月第一天
            this.finishTime = new Date(new Date(new Date().getTime()).setDate(1));
            //开始时间取得参数
            this.beginTime = new Date(new Date(this.finishTime.getTime()).setMonth(this.finishTime.getMonth() - month_num));
          }
        }

      })
    },
    initSearch() {
      this.currentPage = 1;
      this.searchData();
    },
    searchData() {
      this.stockData = [];
      GetSafeStockData({}, { timeout: 10 * 60 * 1000 }).then(res => {
        this.stockData = res.data;
        this.buttonShow = true;
      })
    },
    onSaveClick() {
      //查询这个月有没有数据
      GetPlanBaseByMounth().then(res => {
        if (res.data.length > 0) {
          this.$confirm("本月已保存过数据，确认再次保存？", "提示", {
            confirmButtonText: "是",
            cancelButtonText: "否",
            type: "warning",
          }).then(() => {
            this.saveData();
          }).catch(() => { });
        } else {
          this.$confirm("确认无误并保存？", "提示", {
            confirmButtonText: "是",
            cancelButtonText: "否",
            type: "warning",
          }).then(() => {
            this.saveData();
          }).catch(() => { });
        }
      })
    },
    saveData() {
      InsertPlanBaseList({ list: this.stockData }).then(res => {
        this.$alert("保存成功！", "提示", {
          confirmButtonText: "确定",
          type: "warning",
        });
      }).catch(res => {
        this.$alert("保存失败！" + res.msg, "提示", {
          confirmButtonText: "确定",
          type: "warning",
        });
      })
    }
  },
  mounted() {
    this.initDate();
  },
}
</script>

<style scoped>
.greenBtn {
  background: #8bc34a;
  color: rgb(255, 255, 255);
}
</style>
