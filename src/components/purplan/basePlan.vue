<template>
  <div class="safeStock">
    <el-card shadow="never" class="flex-card">
      <div style="margin-left:20px;">
        <el-button type="primary" size="small" :disabled="selectPlan.length == 0" @click="onSavePruPlanClick">生成需求计划</el-button>
        <el-button icon="el-icon-search" class="greenBtn" @click="searchData" style="margin-left:10px;" size="small">查询
        </el-button>
      </div>
      <hr style="width:100%;" />
      <div style="flex:1;position:relative;">
        <el-table :data="stockData" height="100%" style="position:absolute;" @selection-change="handleSelectionChange">
          <el-table-column type="selection" width="55" align="center"></el-table-column>
          <el-table-column label="ID" prop="ID" width="110" align="center"></el-table-column>
          <el-table-column label="型号" prop="ITEM_NO" width="100" align="center"></el-table-column>
          <el-table-column label="版本名称" prop="PRODUCTVERSION_NAME" width="80" align="center"></el-table-column>
          <el-table-column label="供货周期(天)" prop="OEM_SUPPLY_DAYS" width="100" align="center"></el-table-column>
          <el-table-column label="上市年月" prop="DATE_UP" width="70" align="center"></el-table-column>
          <!-- <el-table-column label="已上市月份数" prop="SSYS" width="100" align="center"></el-table-column> -->
          <el-table-column label="总销售量" prop="QTY" width="80" align="center"></el-table-column>
          <!-- <el-table-column label="总销售频次" prop="QTY_PC" width="80" align="center"></el-table-column> -->
          <el-table-column label="单位" prop="UNIT" width="50" align="center"></el-table-column>
          <!-- <el-table-column label="统计月份数" prop="YS" width="90" align="center"></el-table-column> -->
          <el-table-column label="计算月份数" prop="JSYS" width="90" align="center"></el-table-column>
          <el-table-column label="月均销售量" prop="QTY_MONTH" width="90" align="center"></el-table-column>
          <!-- <el-table-column label="月均销售频次" prop="QTY_PC_MONTH" width="100" align="center"></el-table-column> -->
          <el-table-column label="日均销售量" prop="QTY_DAY" width="90" align="center"></el-table-column>
          <el-table-column label="预警数" prop="QTY_ARM" width="60" align="center"></el-table-column>
          <el-table-column label="新产品标志" prop="NEW_FLAG" width="90" align="center"></el-table-column>
          <el-table-column label="版本发放数量" prop="VERSION_NUM" width="100" align="center"></el-table-column>
          <el-table-column label="计划需求量" prop="QTY_CG" width="100" align="center"></el-table-column>
          <el-table-column label="可用库存数" prop="AVAILABEL_STOCK" width="100" align="center"></el-table-column>
          <el-table-column label="计划单在途数" prop="ONWAY_NUMBER" width="100" align="center"></el-table-column>
          <el-table-column label="可用库存(含在途)" prop="ALL_AVAILABEL_STOCK" width="120" align="center">
            <template slot-scope="scope">
              <span
                :style="{'color': scope.row.ALL_AVAILABEL_STOCK < scope.row.QTY_ARM ? 'red': ''}">{{scope.row.ALL_AVAILABEL_STOCK}}</span>
            </template>
          </el-table-column>
          <el-table-column label="供应商" prop="SUPPLY_NAME" width="200" align="center"></el-table-column>
        </el-table>
      </div>
    </el-card>
  </div>
</template>

<script>
import { GetNewPlanBaseData, InsertPurPlanList } from "@/api/safeStockASP";

export default {
  data() {
    return {
      stockData: [],
      selectPlan: []
    }
  },
  methods: {
    searchData() {
      this.stockData = [];
      GetNewPlanBaseData().then(res => {
        this.stockData = res.data;
      })
    },
    handleSelectionChange(val) {
      this.selectPlan = val;
    },
    onSavePruPlanClick() {
      if (this.selectPlan.length) {
        this.$confirm("已选择" + this.selectPlan.length + "条记录，确定生成需求计划？", "提示", {
          confirmButtonText: "是",
          cancelButtonText: "否",
          type: "warning",
        }).then(() => {
          InsertPurPlanList(this.selectPlan).then(res => {
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
        }).catch(() => { });
      }
    }
  },
  mounted() {
    //this.searchData();
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
</style>
<style>
.flex-card .el-card__body {
  flex: 1;
  display: flex;
  flex-direction: column;
}
</style>
