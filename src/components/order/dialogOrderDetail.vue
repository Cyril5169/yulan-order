<template>
  <el-card class="centerCard">
    <el-card class="tableCard" shadow="hover">
      <div slot="header">
        <span class="zoomLeft">
          订单号：
          <span class="zoomRight">{{ ruleForm.ORDER_NO }}</span>
        </span>
        <span class="zoomLeft">
          经办人：
          <span class="zoomRight">{{ ruleForm.LINKPERSON }}</span>
        </span>
        <span class="zoomLeft">
          收货人：
          <span class="zoomRight">{{ ruleForm.WL_CONTACTS }}({{ ruleForm.WL_TEL }})</span>
        </span>
        <br />
        <span class="zoomLeft">
          收货地址：
          <span class="zoomRight">{{ ruleForm.ALL_ADDRESS }}</span>
        </span>
        <br />
        <span class="zoomLeft">
          备注：
          <span class="zoomRight">{{ ruleForm.NOTES }}</span>
        </span>
      </div>
      <el-table :data="ruleForm.ORDERBODY" style="width: 100%" :row-class-name="tableRowClassName">
        <el-table-column align="center" prop="ITEM_NO" label="型号"></el-table-column>
        <el-table-column prop="ITEM_NO_SAMPLE" align="center" label="样本型号"></el-table-column>
        <el-table-column align="center" prop="TYPE_NAME" label="类型"></el-table-column>
        <el-table-column align="center" prop="QTY_REQUIRED" label="数量"></el-table-column>
        <el-table-column prop="PROMOTION" align="center" label="活动类型"></el-table-column>
        <el-table-column label="应付金额" align="center">
          <template slot-scope="scope1">
            <span v-if="isManager === '0'">***</span>
            <span v-else>{{ scope1.row.FINAL_COST }}</span>
          </template>
        </el-table-column>
        <el-table-column align="center" prop="NOTES" label="备注"></el-table-column>
      </el-table>

      <div style="float:right; margin-right:18%;height:100px;">
        <p v-if="isManager === '0'">
          商品总价格：
          <span style="color:tomato;font-weight:bold;">***</span>
        </p>
        <p v-else>
          商品总价格：
          <span style="color:tomato;font-weight:bold;">{{
            ruleForm.ALL_SPEND
          }}</span>
        </p>
      </div>
    </el-card>
  </el-card>
</template>

<script>
import Cookies from "js-cookie";
export default {
  data() {
    return {
      isManager: Cookies.get("isManager"),
    };
  },
  props: ["ruleForm"],
  methods: {
    //隔行变色
    tableRowClassName({ row, rowIndex }) {
      if (rowIndex % 2 == 0) {
        return "success-row";
      }
      return "";
    }
  },
};
</script>

<style scoped>
.centerCard {
  margin: 0 auto;
  position: relative;
}
.childCard {
  width: 90%;
  height: 200px;
  float: left;
}
.tableCard {
  float: left;
  width: 100%;
}
.headSpan {
  font-weight: bold;
  font-size: 18px;
  color: black;
}
.zoomRight {
  font-weight: 400;
  font-size: 15px;
  line-height: 30px;
  display: inline-block;
  margin-right: 30px;
}
.zoomLeft {
  font-size: 15px;
  font-weight: bold;
  display: inline-block;
  margin-right: 10px;
}
</style>
<style>
.el-table .success-row {
  background: #f0f9eb;
}
</style>