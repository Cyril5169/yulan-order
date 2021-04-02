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
              <span>提交日期</span>
              <el-date-picker format="yyyy-MM-dd" value-format="yyyy-MM-dd" placeholder="开始日期区间" v-model="beginTime"
                style="width:150px"></el-date-picker>
              &nbsp;--
              <el-date-picker format="yyyy-MM-dd" value-format="yyyy-MM-dd" placeholder="结束日期区间" v-model="finishTime"
                style="width:150px;"></el-date-picker>
            </div>
            <div style="margin-top:20px;">
              <span>订单状态</span>
              <el-select v-model="selectOrderType" style="width:150px">
                <el-option v-for="item in orderTypeData" :key="item.value" :label="item.label" :value="item.value">
                </el-option>
              </el-select>
            </div>
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
          <el-table :data="customerOrderTaskData" border class="orderDataTable">
            <el-table-column type="index">
            </el-table-column>
            <el-table-column label="客户代码" align="center" width="120px">
              <template slot-scope="scope">
                <el-button size="mini" @click="getCustomerAllOrder(scope.row)" type="text">{{ scope.row.CUSTOMER_CODE }}
                </el-button>
              </template>
            </el-table-column>
            <el-table-column label="客户名称" align="center" width="350px">
              <template slot-scope="scope">
                <el-button size="mini" @click="getCustomerInfo(scope.row)" type="text">{{ scope.row.CUSTOMER_NAME }}
                </el-button>
              </template>
            </el-table-column>
            <el-table-column prop="ASSIGNMENTS_TARGET" label="目标任务" align="center">
              <template slot-scope="scope">
                <span> {{scope.row.ASSIGNMENTS_TARGET >0 ? scope.row.ASSIGNMENTS_TARGET:"无任务"}}</span>
              </template>
            </el-table-column>
            <el-table-column prop="ALL_SPEND" label="订单总额" align="center">
            </el-table-column>
            <el-table-column label="任务差额" align="center">
              <template slot-scope="scope">
                <span>{{scope.row.ASSIGNMENTS_TARGET.sub(scope.row.ALL_SPEND)}}</span>
              </template>
            </el-table-column>
            <el-table-column label="任务完成标记" prop="" align="center" :filters="[
                { text: '未完成', value: '' },
                { text: '已完成', value: '完成' }
              ]" :filter-method="filterHandler">
              <template slot-scope="scope">
                <!-- 小于号eslint报错用&lt;代替 -->
                <span>{{scope.row.ASSIGNMENTS_TARGET.sub(scope.row.ALL_SPEND) &lt;= 0 &&  scope.row.ASSIGNMENTS_TARGET > 0?'完成':''}}</span>
              </template>
            </el-table-column>
          </el-table>
        </div>
      </div>
    </el-card>
    <!-- 订单汇总 -->
    <el-dialog width="600px" :visible.sync="allOrderVisible">
      <div style="font-size:18px">
        <div style="text-align:center;">
          客户名称：{{ selectOneCustomer.CUSTOMER_NAME }}
        </div>
      </div>
      <div>
        <div style="font-size:15px;color:blue;margin:5px" v-if="getMoney > 0">
          订单金额汇总：{{ getMoney }}元
        </div>
        <el-table :data="customerOrderData" border highlight-current-row style="width: 100%;">
          <el-table-column type="index">
          </el-table-column>
          <el-table-column label="订单号" align="center" width="120px">
            <template slot-scope="scope1">
              <el-button size="mini" @click="getOrderDetail(scope1.row.ORDER_NO)" type="text">{{ scope1.row.ORDER_NO }}
              </el-button>
            </template>
          </el-table-column>
          <el-table-column label="状态" width="150px" align="center">
            <template slot-scope="scope2">
              {{ scope2.row.STATUS_ID | transType }}
            </template>
          </el-table-column>
          <el-table-column prop="DATE_CRE" label="提交时间" align="center" width="150px">
            <template slot-scope="scope4">
              {{ scope4.row.DATE_CRE | datatrans }}
            </template>
          </el-table-column>
          <el-table-column prop="ALL_SPEND" label="订单金额" align="center"></el-table-column>
        </el-table>
        <!-- 分页 -->
        <div style="margin:0 25%;" class="block">
          <el-pagination @current-change="handleCurrentChange" :current-page="currentPage" :page-size="limit"
            layout="total, prev, pager, next, jumper" :total="count"></el-pagination>
        </div>
      </div>
    </el-dialog>
    <!-- 订单详情 -->
    <el-dialog :show-close="true" :visible.sync="orderVisible" width="1100px" top="5vh" append-to-body>
      <keep-alive>
        <checkExamine v-if="orderVisible" :isShowButton="false" :ruleForm="ruleForm">
        </checkExamine>
      </keep-alive>
    </el-dialog>
    <!-- 客户详情 -->
    <el-dialog title="客户详情" :visible.sync="customerDetailVisible" width="600px">
      <div style="margin:0,auto">
        <table class="table_2">
          <tr>
            <td>客户名称:</td>
            <td>{{ customerInfo.CUSTOMER_NAME }}</td>
          </tr>
          <tr>
            <td>联系人：</td>
            <td>{{ customerInfo.CUSTOMER_AGENT }}</td>
          </tr>
          <tr>
            <td>电话：</td>
            <td>{{ customerInfo.OFFICE_TEL }}</td>
          </tr>
          <tr>
            <td>地址：</td>
            <td>{{ customerInfo.POST_ADDRESS }}</td>
          </tr>
          <tr>
            <td style="width:150px">优惠券余额：</td>
            <td v-if="couponData.length">
              <span v-for="item of couponData" :key="item.index">
                {{item.id}}: ￥{{item.rebateMoneyOver}}
              </span>
            </td>
            <td v-else>
              <span style="color:red;">当前无生效优惠券</span>
            </td>
          </tr>
          <tr>
            <td>客户余额：</td>
            <td>￥{{ moneySituation }}</td>
          </tr>
        </table>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import checkExamine from "../order/checkExamine";
import Cookies from "js-cookie";
import { manageCoupon } from "@/api/orderList";
import {
  getAreaCode,
  getDistrictByAreaCode,
  getCustomerDataForOrder
} from "@/api/areaInfoASP";
import { getOrderByAreaCustomer } from "@/api/orderInfoASP";
import { GetOrderAndTaskByCustomer, getCustomerInfo, getResideMonery } from "@/api/orderListASP";

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
          value: "0",
          label: "待提交"
        },
        {
          value: "1",
          label: "已提交"
        },
        {
          value: "2",
          label: "已受理"
        },
        {
          value: "3",
          label: "已作废"
        },
        {
          value: "4",
          label: "部分发货"
        },
        {
          value: "5",
          label: "余额不足待提交"
        },
        {
          value: "6",
          label: "余额不足可提交"
        },
        {
          value: "7",
          label: "已完成"
        },
        {
          value: "12",
          label: "已接收"
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
      ruleForm: {},
      customerDetailVisible: false,
      customerInfo: {},
      couponData: [],
      moneySituation: ""
    };
  },
  components: {
    checkExamine
  },
  filters: {
    transType(value) {
      switch (value) {
        case "0":
          return "待提交";
          break;
        case "1":
          return "已提交";
          break;
        case "2":
          return "已受理";
        case "3":
          return "已作废";
        case "4":
          return "部分发货";
        case "5":
          return "余额不足待提交";
        case "6":
          return "余额不足可提交";
        case "7":
          return "已完成";
        case "12":
          return "已接收";
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
        sum = sum.add(this.customerOrderTaskData[i].ALL_SPEND);
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
      getCustomerDataForOrder(data).then(res => {
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
        status: this.selectOrderType
      };
      data.finishTime = data.finishTime + " 23:59:59";
      GetOrderAndTaskByCustomer(data).then(res => {
        this.customerOrderTaskData = res.data;
        this.nowBeginTime = this.beginTime;
        this.nowFinishTime = this.finishTime;
        this.nowSelectOrderType = this.selectOrderType;
      });
    },
    filterHandler(value, row, column) {
      if (value == "完成")
        return (
          row.ASSIGNMENTS_TARGET - row.ALL_SPEND <= 0 &&
          row.ASSIGNMENTS_TARGET > 0
        );
      else return row.ASSIGNMENTS_TARGET - row.ALL_SPEND > 0;
    },
    getCustomerAllOrder(row) {
      this.currentPage = 1;
      this.selectOneCustomer = row;
      this.getMoney = row.ALL_SPEND;
      this.getOrderAll();
    },
    getOrderAll() {
      this.customerOrderData = [];
      var data = {
        customerCode: this.selectOneCustomer.CUSTOMER_CODE, //已选用户
        beginTime: this.nowBeginTime, //起始时间
        finishTime: this.nowFinishTime, //结束时间
        limit: this.limit, //限制数
        page: this.currentPage, //页数
        status: this.nowSelectOrderType //状态
      };
      data.finishTime = data.finishTime + " 23:59:59";
      getOrderByAreaCustomer(data).then(res => {
        this.count = res.count;
        this.customerOrderData = res.data;
        this.allOrderVisible = true;
      });
    },
    handleCurrentChange(val) {
      this.currentPage = val;
      this.getOrderAll();
    },
    getOrderDetail(order_no) {
      Cookies.set("ORDER_NO", order_no);
      Cookies.set("CURTAIN_STATUS_ID", -2);
      Cookies.set("status_ID", -2);
      this.orderVisible = true;
    },
    async getCustomerInfo(val) {
      var data = {
        cid: "",
        companyId: val.CUSTOMER_CODE
      };
      var res = await getResideMonery({companyId: val.CUSTOMER_CODE});
      this.moneySituation = res.data;
      var url = "/order/findRebate.do";
      var res2 = await manageCoupon(url, data);
      this.couponData = res2.data;
      this.couponData = this.couponData.filter(
        item => item.dateId == 1 && item.rebateMoneyOver > 0 && item.status == 1
      );
      var res3 = await getCustomerInfo(data);
      this.customerInfo = res3.data;
      this.customerDetailVisible = true;
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
  font-size: 20px;
}
.table_2 td {
  padding: 3px;
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