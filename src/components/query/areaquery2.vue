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
            @change="getCustomerData">
            <el-option label="全部" value=""></el-option>
            <el-option v-for="item in areaDistinctList" :key="item.DISTRICT_ID" :label="item.DISTRICT_NAME"
              :value="item.DISTRICT_ID">
            </el-option>
          </el-select>
          <el-select size="small" v-model="selectCustomerType" placeholder="请选择客户类型" style="width:130px"
            @change="getCustomerData">
            <el-option v-for="item in customerTypeData" :key="item.value" :label="item.label" :value="item.value">
            </el-option>
          </el-select>
          <!-- <el-checkbox v-model="isValid" style="margin-left:10px" @change="getCustomerData">仅有效客户</el-checkbox> -->
        </div>
        <hr />
        <div style="margin-top:10px;">
          <div style="display:inline-block;">
            <el-transfer :titles="['可选用户', '已选用户']" class="transferP" filterable filter-placeholder="筛选"
              v-model="selectCustomer" :data="customerData" :props="{
                  key: 'CUSTOMER_CODE',
                  label: 'CUSTOMER_NAME'
                }" @left-check-change="checkChange" @right-check-change="checkChange2">
            </el-transfer>
          </div>
          <div style="display:inline-block;vertical-align:top;margin-left:20px;">
            <div>
              <span>日期范围</span>
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
          <el-table :data="customerOrderData" border>
            <el-table-column prop="num" width="55" align="center" label="序号">
              <template slot-scope="scope"><span>{{ scope.$index + (currentPage - 1) * limit + 1 }}
                </span>
              </template>
            </el-table-column>
            <el-table-column label="客户代码" align="center" width="120px">
              <template slot-scope="scope1">
                <el-button size="mini" @click="openDetail_1(scope1.row)" type="text">{{ scope1.row.CUSTOMER_CODE }}
                </el-button>
              </template>
            </el-table-column>
            <el-table-column label="客户名称" align="center" width="350px">
              <template slot-scope="scope3">
                <el-button size="mini" @click="customer_info(scope3.row)" type="text">{{ scope3.row.CUSTOMER_NAME }}
                </el-button>
              </template>
            </el-table-column>
            <el-table-column prop="TASK" label="目标任务" align="center">
            </el-table-column>
            <el-table-column prop="ORDER_MONEY" label="订单总额" align="center">
            </el-table-column>
            <el-table-column prop="TASK_MONEY_DF" label="任务差额" align="center">
            </el-table-column>
            <el-table-column prop="flag" label="任务完成标记" align="center" :filters="[
                { text: '未完成', value: '' },
                { text: '已完成', value: '完成' }
              ]" :filter-method="filterHandler">
            </el-table-column>
          </el-table>
        </div>
      </div>
    </el-card>
  </div>
</template>

<script>
import Cookies from "js-cookie";
import {
  getAreaCode,
  getDistrictByAreaCode,
  getCustomerByAreaCode2,
  getCustomerData,
  getPackDetails,
  getCustomerName
} from "@/api/areaInfoASP";

export default {
  data() {
    return {
      beginTime: "",
      finishTime: "",
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
      customerOrderData: []
    };
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
      this.getCustomerData();
    },
    getAreaDistinctData() {
      getDistrictByAreaCode(
        { areaCode: this.selectAreaCode },
        { loading: false }
      ).then(res => {
        this.areaDistinctList = res.data;
      });
    },
    getCustomerData() {
      this.customerData = [];
      var data = {
        areaCode: this.selectAreaCode, //市场
        district: this.selectAreaDistinct, //片区
        customerType: this.selectCustomerType //客户类型
      };
      getCustomerData(data).then(res => {
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

    },
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
</style>
<style>
.transferP .el-transfer-panel {
  width: 300px;
  height: 200px;
}
.transferP .el-transfer-panel__list.is-filterable {
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
</style>