<template>
  <div>
    <el-table empty-text="暂无返利记录" :data="rebateRecordData" style="width: 100%" :row-class-name="tableRowClassName">
      <el-table-column align="center" label="优惠券类型">
        <template slot-scope="scope1">
          <span>{{scope1.row.REBATE_TYPE |nameTrans}}</span>
        </template>
      </el-table-column>
      <el-table-column align="center" label="创建日期">
        <template slot-scope="scope1">
          <span>{{scope1.row.DATE_CRE |dateFilter}}</span>
        </template>
      </el-table-column>
      <el-table-column align="center" label="有效期" width="200">
        <template slot-scope="scope1">
          <span>{{scope1.row.DATE_START |dateFilter}}至{{scope1.row.DATE_END |dateFilter}}</span>
        </template>
      </el-table-column>
      <el-table-column align="center" label="返利金额">
        <template slot-scope="scope1">
          <span v-if="isManager === '0'">***</span>
          <span v-else>{{scope1.row.RETURN_MONEY}}</span>
        </template>
      </el-table-column>
      <el-table-column prop="NOTES" align="center" label="备注说明"></el-table-column>
    </el-table>
  </div>
</template>

<script>
import Cookies from "js-cookie";
import { GetSalReturnRecord } from "@/api/couponASP";

export default {
  name: "couponRecordDetail",
  props: ["couponId"],
  data() {
    return {
      isManager: Cookies.get("isManager"),
      rebateRecordData: [],
    };
  },
  methods: {
    getRebateRecord() {
      this.rebateRecordData = [];
      GetSalReturnRecord({ couponId: this.couponId }).then(res => {
        this.rebateRecordData = res.data;
      });
    },
    tableRowClassName({ row, rowIndex }) {
      if (rowIndex % 2 == 0) {
        return "success-row";
      }
      return "";
    }
  },
  filters: {
    nameTrans(value) {
      if (value == "year") {
        return "年返券";
      } else if (value == "month") {
        return "月返券";
      } else return "其它券类";
    }
  },
  activated() {
    this.getRebateRecord();
  }
};
</script>