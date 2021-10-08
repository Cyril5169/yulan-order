<template>
  <div class="zj-flex-page">
    <div class="zj-tbar">
      <el-button icon="el-icon-refresh" size="mini" circle @click="refreshBuyUserStatistic">
      </el-button>
      <el-button @click="exportStatisticExcel" type="primary" size="small">导出Excel</el-button>
    </div>
    <div class="zj-table-ct">
      <el-table class="zj-flex-table" height="100%" :data="buyUserData">
        <el-table-column width="120" prop="BUYUSER" label="消费者姓名" align="center"></el-table-column>
        <el-table-column width="150" prop="BUYUSER_PHONE" label="联系电话" align="center"></el-table-column>
        <el-table-column width="160" prop="CRE_DATE" label="创建日期" align="center">
          <template slot-scope="scope">
            {{scope.row.CRE_DATE | dateFilter('yyyy-MM-dd HH:mm:ss')}}
          </template>
        </el-table-column>
        <el-table-column width="160" prop="FIRST_BUY_TIME" label="首次购买日期" align="center">
          <template slot-scope="scope">
            {{scope.row.FIRST_BUY_TIME | dateFilter('yyyy-MM-dd HH:mm:ss')}}
          </template>
        </el-table-column>
        <el-table-column width="160" prop="LAST_BUY_TIME" label="最后购买日期" align="center">
          <template slot-scope="scope">
            {{scope.row.LAST_BUY_TIME | dateFilter('yyyy-MM-dd HH:mm:ss')}}
          </template>
        </el-table-column>
        <el-table-column width="120" prop="BUY_COUNT" label="购买次数" align="center"></el-table-column>
        <el-table-column width="150" prop="MONEY_SUM" label="总订单金额" align="center"></el-table-column>
        <el-table-column label="操作">
          <template slot-scope="scope">
            <a>查看订单列表</a>
          </template>
        </el-table-column>
      </el-table>
    </div>
  </div>
</template>

<script>
import Cookies from "js-cookie";
import { GetBuyUserStatistic } from "@/api/orderListASP";
import { downLoadFile } from "@/common/js/downLoadFile";

export default {
  data() {
    return {
      isManager: Cookies.get("isManager"),
      buyUserData: []
    }
  },
  methods: {
    refreshBuyUserStatistic() {
      GetBuyUserStatistic({
        //company_id: Cookies.get("companyId"),
        company_id: 'C23036'
      }).then(res => {
        this.buyUserData = res.data;
      })
    },
    exportStatisticExcel() {
      downLoadFile(this.Global.baseUrl + `BUYUSER_INFO/ExportStatisticExcel?company_id=C23036`);
    }
  },
  mounted() {
    this.refreshBuyUserStatistic();
  }
}
</script>

<style scoped>
</style>
