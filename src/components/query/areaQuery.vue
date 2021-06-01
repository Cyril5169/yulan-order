<template>
  <div class="orderQuery">
    <el-card shadow="never">
      <div class="tbarStyle">
        <div>
          <span>市场</span>
          <el-select size="small" v-model="selectAreaCode" placeholder="请选择市场" style="width:150px"
            @change="areaCodeChange">
            <el-option v-for="item in areaCodeList" :key="item.AREA_CODE" :label="item.AREA_NAME"
              :value="item.AREA_CODE">
            </el-option>
          </el-select>
          <span style="margin-left:5px;">片区</span>
          <el-select size="small" v-model="selectAreaDistinct" placeholder="请选择片区" style="width:150px"
            @change="getCustomerDataList">
            <el-option label="全部" value=""></el-option>
            <el-option v-for="item in areaDistinctList" :key="item.DISTRICT_ID" :label="item.DISTRICT_NAME"
              :value="item.DISTRICT_ID">
            </el-option>
          </el-select>
          <span style="margin-left:5px;">客户类型</span>
          <el-select size="small" v-model="selectCustomerType" placeholder="请选择客户类型" style="width:130px"
            @change="getCustomerDataList">
            <el-option v-for="item in customerTypeData" :key="item.value" :label="item.label" :value="item.value">
            </el-option>
          </el-select>
          <!-- <el-checkbox v-model="isValid" style="margin-left:10px" @change="getCustomerDataList">仅有效客户</el-checkbox> -->
          <span style="margin-left:5px;">关键字筛选</span>
          <el-input size="small" @keyup.enter.native="getCustomerDataList()" placeholder="客户名称，客户代码" clearable
            v-model="condition" style="width:250px;">
            <el-button @click="getCustomerDataList()" slot="append" icon="el-icon-search">搜索</el-button>
          </el-input>
        </div>
        <hr />
        <div style="margin-top:10px;">
          <div style="display:inline-block;">
            <el-transfer :titles="['可选用户', '已选用户']" class="transferP" v-model="selectCustomer" :data="customerData"
              :props="{
                  key: 'CUSTOMER_CODE',
                  label: 'CUSTOMER_NAME'
                }" @left-check-change="checkChange" @right-check-change="checkChange2">
            </el-transfer>
          </div>
          <div style="display:inline-block;vertical-align:top;margin-left:20px;">
            <div>
              <span>发货日期</span>
              <el-date-picker format="yyyy-MM-dd" value-format="yyyy-MM-dd" placeholder="开始日期区间" v-model="beginTime"
                style="width:150px"></el-date-picker>
              &nbsp;--
              <el-date-picker format="yyyy-MM-dd" value-format="yyyy-MM-dd" placeholder="结束日期区间" v-model="finishTime"
                style="width:150px;"></el-date-picker>
            </div>
            <!-- <div style="margin-top:20px;">
              <span>提货状态</span>
              <el-select v-model="selectOrderType" style="width:150px">
                <el-option v-for="item in orderTypeData" :key="item.value" :label="item.label" :value="item.value">
                </el-option>
              </el-select>
            </div> -->
            <div style="margin-top:20px;">
              <el-button icon="el-icon-search" class="greenBtn" @click="searchData">查询</el-button>
              <el-button icon="el-icon-s-grid" class="greenBtn" @click="resetData" style="margin-left:35px;">重置
              </el-button>
            </div>
          </div>
        </div>
        <hr />
        <div>
          <div style="font-size:15px;color:blue;margin:5px" v-if="sumOrderMoney > 0">
            订单金额汇总：{{ sumOrderMoney }}元
          </div>
          <!-- <el-table :data="customerOrderTaskData" border class="orderDataTable">
            <el-table-column type="index">
            </el-table-column>
            <el-table-column label="客户代码" align="center">
              <template slot-scope="scope">
                <el-button size="mini" @click="getCustomerAllOrder(scope.row)" type="text">{{ scope.row.CUSTOMER_CODE }}
                </el-button>
              </template>
            </el-table-column>
            <el-table-column prop="CUSTOMER_NAME" label="客户名称" align="center">
            </el-table-column>
            <el-table-column prop="MONEY_SUM" label="时间段内订单提货总额" align="center">
            </el-table-column>
          </el-table> -->
          <el-table :summary-method="getSummaries2" show-summary :data="customerOrderData" border highlight-current-row
            style="width: 100%;">
            <el-table-column type="index">
            </el-table-column>
            <el-table-column prop="CUSTOMER_NAME" label="客户名称" align="center" width="200" show-overflow-tooltip>
            </el-table-column>
            <el-table-column label="提货单号" width="100" align="center">
              <template slot-scope="scope1">
                <el-button size="mini" @click="getOrderDetail(scope1.row)" type="text">{{ scope1.row.SALE_NO }}
                </el-button>
              </template>
            </el-table-column>
            <el-table-column label="状态" align="center">
              <template slot-scope="scope2">
                {{ scope2.row.STATUS_ID | transStatus }}
              </template>
            </el-table-column>
            <el-table-column prop="CONTRACT_NO" label="B2B订单号" align="center"></el-table-column>
            <el-table-column label="单据类型" align="center" prop="BILL_ID"
              :filters="[{text: '冲减单', value: '0'}, {text: '自动提货单', value: '1'},{text: '手工提货单', value: '2'},{text: '退货单', value: '3'}, ]"
              :filter-method="filterHandler">
              <template slot-scope="scope3">
                {{ scope3.row.BILL_ID | transType }}
              </template>
            </el-table-column>
            <el-table-column prop="BILL_DATE" label="开单日期" align="center">
              <template slot-scope="scope5">
                {{ scope5.row.BILL_DATE | datatrans }}
              </template>
            </el-table-column>
            <el-table-column prop="DATE_OUT_STOCK" label="提货日期" align="center">
              <template slot-scope="scope5">
                {{ scope5.row.DATE_OUT_STOCK | datatrans }}
              </template>
            </el-table-column>
            <el-table-column prop="MONEY_SUM" label="金额" align="center"></el-table-column>
            <el-table-column prop="TRANSTYPE_NAME" label="运输方式" align="center"></el-table-column>
            <el-table-column prop="TRANS_ID" label="运输单号" align="center"></el-table-column>
            <el-table-column prop="HTBM" label="合同号" align="center"></el-table-column>
          </el-table>
          <div style="margin:0 35%;" class="block">
            <el-pagination @current-change="handleCurrentChange2" :current-page="currentPage" :page-size="limit"
              layout="total, prev, pager, next, jumper" :total="count"></el-pagination>
          </div>
        </div>
      </div>
    </el-card>
    <!-- 提货单汇总 -->
    <el-dialog :visible.sync="allOrderVisible" width="1100px" top="5vh">
      <div style="font-size:18px">
        <div style="text-align:center;">
          客户名称：{{ selectOneCustomer.CUSTOMER_NAME }}
        </div>
      </div>
      <div>
        <div style="font-size:15px;color:blue;margin:5px" v-if="getMoney > 0">
          订单金额汇总：{{ getMoney }}元
        </div>
        <el-table :summary-method="getSummaries" show-summary :data="customerOrderData" border highlight-current-row
          style="width: 100%;">
          <el-table-column type="index">
          </el-table-column>
          <el-table-column label="提货单号" width="100" align="center">
            <template slot-scope="scope1">
              <el-button size="mini" @click="getOrderDetail(scope1.row)" type="text">{{ scope1.row.SALE_NO }}
              </el-button>
            </template>
          </el-table-column>
          <el-table-column label="状态" align="center">
            <template slot-scope="scope2">
              {{ scope2.row.STATUS_ID | transStatus }}
            </template>
          </el-table-column>
          <el-table-column prop="CONTRACT_NO" label="B2B订单号" align="center"></el-table-column>
          <el-table-column label="单据类型" align="center" prop="BILL_ID"
            :filters="[{text: '冲减单', value: '0'}, {text: '自动提货单', value: '1'},{text: '手工提货单', value: '2'},{text: '退货单', value: '3'}, ]"
            :filter-method="filterHandler">
            <template slot-scope="scope3">
              {{ scope3.row.BILL_ID | transType }}
            </template>
          </el-table-column>
          <el-table-column prop="BILL_DATE" label="开单日期" align="center">
            <template slot-scope="scope5">
              {{ scope5.row.BILL_DATE | datatrans }}
            </template>
          </el-table-column>
          <el-table-column prop="DATE_OUT_STOCK" label="提货日期" align="center">
            <template slot-scope="scope5">
              {{ scope5.row.DATE_OUT_STOCK | datatrans }}
            </template>
          </el-table-column>
          <el-table-column prop="MONEY_SUM" label="金额" align="center"></el-table-column>
          <el-table-column prop="TRANSTYPE_NAME" label="运输方式" align="center"></el-table-column>
          <el-table-column prop="TRANS_ID" label="运输单号" align="center"></el-table-column>
          <el-table-column prop="HTBM" label="合同号" align="center"></el-table-column>
        </el-table>
        <!-- 分页 -->
        <div style="margin:0 35%;" class="block">
          <el-pagination @current-change="handleCurrentChange" :current-page="currentPage" :page-size="limit"
            layout="total, prev, pager, next, jumper" :total="count"></el-pagination>
        </div>
      </div>
    </el-dialog>
    <!-- 提货单明细 -->
    <el-dialog title="提货单详情" :visible.sync="orderVisible" :close-on-click-modal="false" width="1100px" append-to-body
      top="5vh">
      <div style="margin:0 auto;">
        <table style="width:100%;height:160px" class="table_2" border="1">
          <tr>
            <td class="td_1">提货单</td>
            <td class="td_1">{{ orderHead.SALE_NO }}</td>
            <td class="td_1">发货日期</td>
            <td class="td_1">{{ orderHead.BILL_DATE | datatrans }}</td>
            <td class="td_1">状态</td>
            <td class="td_1">{{ orderHead.STATUS_ID | transStatus }}</td>
          </tr>
          <tr>
            <td class="td_1">合同号</td>
            <td class="td_1">{{ orderHead.HTBM }}</td>
            <td class="td_1">金额</td>
            <td class="td_1">{{ orderHead.MONEY_SUM }}</td>
            <td class="td_1">提货日期</td>
            <td class="td_1">
              {{ orderHead.DATE_OUT_STOCK | datatrans }}
            </td>
          </tr>
          <tr>
            <td class="td_1">客户</td>
            <td colspan="5">
              <span style="margin-left:10px;">
                {{ orderHead.CUSTOMER_NAME }}/联系人:{{
                    orderHead.LINKMAN
                  }}</span>
            </td>
          </tr>
          <tr>
            <td class="td_1">备注</td>
            <td colspan="5">
              <span style="margin-left:10px;">{{ orderHead.NOTES }}</span>
            </td>
          </tr>
        </table>
        <br>
        <el-table max-height="500" :data="orderDetailList" border style="width:100%;" show-summary
          :summary-method="getSummaries2">
          <el-table-column width="80" label="状态" align="center">
            <template slot-scope="scope1">
              <span>{{ scope1.row.STATUS_ID | transStatus }}</span>
            </template>
          </el-table-column>
          <el-table-column prop="ITEM_NO" label="型号" width="110" align="center">
          </el-table-column>
          <el-table-column prop="BATCH_NO" label="批次" width="180" align="center">
          </el-table-column>
          <el-table-column prop="PRODUCTVERSION_NAME" label="版本" width="150" align="center"></el-table-column>
          <el-table-column prop="NOTE" label="仓库" align="center"></el-table-column>
          <el-table-column prop="QTY_DELIVER" label="发货数" width="80" align="center"></el-table-column>
          <el-table-column prop="TRANS_PRICE" label="物流单价" width="80" align="center"></el-table-column>
          <el-table-column prop="SALE_PRICE" label="单价" width="70" align="center">
          </el-table-column>
          <el-table-column prop="MONEY" label="金额" width="90" align="center"></el-table-column>
        </el-table>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import Cookies from "js-cookie";
import {
  getAreaCode,
  getPackDetails,
  getPackDetailsBySaleNo,
  getPackDetailsType,
  getDistrictByAreaCode,
  getCustomerDataForPack,
  getPackByCustomer
} from "@/api/areaInfoASP";
import { getOrderByAreaCustomer } from "@/api/orderInfoASP";

export default {
  data() {
    return {
      condition: "",
      beginTime: "",
      nowBeginTime: "",
      finishTime: "",
      nowFinishTime: "",
      areaCodeList: [],
      selectAreaCode: "",
      areaDistinctList: [],
      selectAreaDistinct: "",
      customerData: [],
      selectCustomer: [],
      nowCustomers:[],
      customerTypeData: [
        {
          value: "",
          label: "全部"
        },
        {
          value: "notspeciality",
          label: "非专业市场客户"
        },
        {
          value: "speciality",
          label: "专业市场客户"
        }
      ],
      selectCustomerType: "",
      isValid: true,
      orderTypeData: [
        {
          value: "",
          label: "全部"
        },
        {
          value: "1",
          label: "待提"
        },
        {
          value: "2",
          label: "已提货"
        },
        {
          value: "3",
          label: "作废"
        },
        {
          value: "4",
          label: "已月结"
        }
      ],
      selectOrderType: "",
      nowSelectOrderType: "",
      customerOrderTaskData: [],
      limit: 10,
      count: 0,
      currentPage: 1,
      allOrderVisible: false,
      customerOrderData: [],
      selectOneCustomer: {},
      getMoney: 0,
      orderVisible: false,
      order_no: "",
      orderHead: {},
      orderDetailList: []
    };
  },
  filters: {
    transStatus(value) {
      switch (value) {
        case "1":
          return "待提";
        case "2":
          return "已提货";
        case "3":
          return "作废";
        case "4":
          return "已月结";
          break;
      }
    },
    transType(value) {
      switch (value) {
        case "0":
          return "冲减单";
        case "3":
          return "退货单";
        default:
          return "提货单";
          break;
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
    }
  },
  computed: {
    timeDefault_1() {
      var date = new Date();
      var month = date.getMonth() + 1;
      if (month < 10) month = "0" + month;
      var s1 = date.getFullYear() + "-" + month + "-" + "01";
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
    sumOrderMoney() {
      var sum = 0;
      for (var i = 0; i < this.customerOrderTaskData.length; i++) {
        sum = sum.add(this.customerOrderTaskData[i].MONEY_SUM);
      }
      return sum;
    }
  },
  methods: {
    resetData() {
      //默认选中第一个市场
      this.selectAreaCode = this.areaCodeList[0].AREA_CODE;
      //加载市场对应的片区和对应的客户
      this.areaCodeChange();
      this.beginTime = this.timeDefault_1;
      this.finishTime = this.timeDefault_2;
      this.selectOrderType = "";
    },
    //获得能查看的市场
    getAreaCodeData() {
      this.areaCodeList = [];
      var userInfo = JSON.parse(Cookies.get("userInfo"));
      getAreaCode({ userid: userInfo.loginName }).then(res => {
        this.areaCodeList = res.data;
        if (this.areaCodeList.length == 0) {
          this.$alert("没有区域权限，请联系管理员配置", "提示", {
            confirmButtonText: "确定",
            type: "success"
          });
          return;
        }
        //默认选中第一个市场
        this.selectAreaCode = this.areaCodeList[0].AREA_CODE;
        //加载市场对应的片区和对应的客户
        this.areaCodeChange();
      });
    },
    areaCodeChange() {
      //查找市场对应的片区
      this.getAreaDistinctData();
      //查找市场对应的客户
      this.getCustomerDataList();
    },
    getAreaDistinctData() {
      this.areaDistinctList = [];
      getDistrictByAreaCode(
        { areaCode: this.selectAreaCode },
        { loading: false }
      ).then(res => {
        this.areaDistinctList = res.data;
      });
    },
    getCustomerDataList() {
      this.customerData = [];
      var data = {
        areaCode: this.selectAreaCode, //市场
        district: this.selectAreaDistinct, //片区
        customerType: this.selectCustomerType, //客户类型
        condition: this.condition
      };
      getCustomerDataForPack(data).then(res => {
        this.customerData = res.data;
        //自动选中所有客户
        this.selectCustomer = [];
        for (var i = 0; i < this.customerData.length; i++) {
          this.selectCustomer.push(this.customerData[i].CUSTOMER_CODE);
        }
      });
    },
    checkChange(newVal, oldVal) {
      if (oldVal.length == 1) this.selectCustomer.push(oldVal[0]);
    },
    checkChange2(newVal, oldVal) {
      if (oldVal.length == 1)
        this.selectCustomer.splice(this.selectCustomer.indexOf(oldVal[0]), 1);
    },
    searchData() {
      if (!this.selectCustomer.length) {
        this.$alert("未选择用户", "提示", {
          confirmButtonText: "确定",
          type: "success"
        });
        return;
      }
      if (!this.beginTime || !this.finishTime) {
        this.$alert("请选择时间", "提示", {
          confirmButtonText: "确定",
          type: "success"
        });
        return;
      }
      this.customerOrderTaskData = [];
      var data = {
        CUSTOMER_CODEs: this.selectCustomer,
        beginTime: this.beginTime,
        finishTime: this.finishTime,
      };
      data.finishTime = data.finishTime + " 23:59:59";
      getPackByCustomer(data).then(res => {
        this.customerOrderTaskData = res.data;
      });
      this.nowBeginTime = this.beginTime;
      this.nowFinishTime = this.finishTime;
      this.nowCustomers = this.selectCustomer;
      this.currentPage = 1;
      this.getAllCustomerAllOrder();
    },
    getAllCustomerAllOrder(){
      this.customerOrderData = [];
      var data = {
        CUSTOMER_CODEs: this.nowCustomers, //已选用户
        beginTime: this.nowBeginTime, //起始时间
        finishTime: this.nowFinishTime, //结束时间
        limit: this.limit, //限制数
        page: this.currentPage, //页数
      };
      data.finishTime = data.finishTime + " 23:59:59";
      getPackDetails(data).then(res => {
        this.count = res.count;
        this.customerOrderData = res.data;
        this.nowBeginTime = this.beginTime;
        this.nowFinishTime = this.finishTime;
        this.nowSelectOrderType = this.selectOrderType;
      });
    },
    getCustomerAllOrder(row) {
      this.currentPage = 1;
      this.selectOneCustomer = row;
      this.getMoney = row.MONEY_SUM;
      this.getOrderAll();
    },
    getOrderAll() {
      this.customerOrderData = [];
      var data = {
        CUSTOMER_CODEs: this.selectOneCustomer.CUSTOMER_CODE, //已选用户
        beginTime: this.nowBeginTime, //起始时间
        finishTime: this.nowFinishTime, //结束时间
        limit: this.limit, //限制数
        page: this.currentPage, //页数
      };
      data.finishTime = data.finishTime + " 23:59:59";
      getPackDetails(data).then(res => {
        this.count = res.count;
        this.customerOrderData = res.data;
        this.allOrderVisible = true;
      });
    },
    handleCurrentChange(val) {
      this.currentPage = val;
      this.getOrderAll();
    },
    handleCurrentChange2(val){
      this.currentPage = val;
      this.getAllCustomerAllOrder();
    },
    getOrderDetail(row) {
      this.orderHead = row;
      var data_2 = {
        saleNo: row.SALE_NO //所选提货单
      };
      this.orderDetailList = [];
      getPackDetailsBySaleNo(data_2).then(res => {
        this.orderDetailList = res.data;
        this.orderVisible = true;
      });
    },
    filterHandler(value, row, column) {
      const property = column["BILL_ID"];
      return row[property] === value;
    },
    //计算表格末行
    getSummaries(param) {
      const { columns, data } = param;
      const sums = [];
      if (data && data.length > 0) {
        columns.forEach((column, index) => {
          if (index === 1) {
            sums[index] = "页合计";
            return;
          } else if (index == 7) {
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
              if (this.isManager == "0") sums[index] = "***";
            } else {
              sums[index] = "";
            }
          } else {
            sums[index] = "";
          }
        });
      }
      return sums;
    },
    getSummaries2(param) {
      const { columns, data } = param;
      const sums = [];
      if (data && data.length > 0) {
        columns.forEach((column, index) => {
          if (index === 1) {
            sums[index] = "页合计";
            return;
          } else if (index == 8) {
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
              if (this.isManager == "0") sums[index] = "***";
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
  created() {
    this.beginTime = this.timeDefault_1;
    this.finishTime = this.timeDefault_2;
    this.getAreaCodeData();
  }
};
</script>

<style scoped>
.tbarStyle {
  margin-bottom: 10px;
}
.greenBtn {
  background: #8bc34a;
  color: rgb(255, 255, 255);
}
.table_2 {
  border-collapse: collapse;
  border: 1px solid black;
}
.td_1 {
  text-align: center;
  padding: 0;
}
</style>
<style>
.transferP .el-transfer-panel {
  width: 300px;
  height: 165px;
}
.transferP .el-transfer-panel__list.is-filterable {
  height: 100px;
}
.transferP .el-transfer-panel__list {
  height: 135px;
}
.transferP .el-transfer-panel .el-transfer-panel__header {
  height: 30px;
  line-height: 30px;
}
.transferP .el-transfer-panel .el-transfer-panel__header .el-checkbox {
  line-height: 30px;
}
.transferP .el-transfer-panel__filter {
  margin: 5px;
}
.transferP .el-transfer__buttons {
  padding: 0 10px;
}
.orderDataTable .el-table__column-filter-trigger {
  line-height: 0;
}
</style>