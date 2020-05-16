<template>
  <el-card class="centerCard">
    <el-dialog
      title="窗帘详情"
      :visible.sync="detailVisible"
      width="1300px"
      top="5vh"
    >
      <keep-alive>
        <detailCurtainTable
          v-if="detailVisible"
          v-bind:tableStatus="3"
          v-bind:headerData="headerData"
          v-bind:curtainData="curtainData"
          v-bind:suggestion="ljsuggestion"
          v-on:visible="closeTheDialog"
          v-on:finalData="getFinalData"
        ></detailCurtainTable>
      </keep-alive>
    </el-dialog>
    <div slot="header">
      <span class="headSpan">订单详情</span>
      <el-button
        @click="returnOrder"
        style="float:right;"
        size="small"
        type="success"
        plain
        >返回</el-button
      >
    </div>
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
          <span class="zoomRight"
            >{{ ruleForm.WL_CONTACTS }}({{ ruleForm.WL_TEL }})</span
          >
        </span>
        <br />
        <span class="zoomLeft">
          收货地址：
          <span class="zoomRight"
            >{{ ruleForm.RECIVER_AREA1 }}{{ ruleForm.RECIVER_AREA2
            }}{{ ruleForm.RECIVER_AREA3 }}{{ ruleForm.POST_ADDRESS }}</span
          >
        </span>
        <br />
        <span class="zoomLeft">
          备注：
          <span class="zoomRight">{{ ruleForm.NOTES }}</span>
        </span>
        <br />
        <span class="zoomLeft">
          玉兰处理说明：
          <span class="zoomRight">{{ ruleForm.YULAN_NOTES }}</span>
        </span>
      </div>
      <el-table
        :data="ruleForm.ORDERBODY"
        style="width: 100%"
        :row-class-name="tableRowClassName"
      >
        <el-table-column
          align="center"
          prop="ITEM_NO"
          label="型号"
        ></el-table-column>
        <el-table-column
          align="center"
          prop="NOTE"
          label="类型"
        ></el-table-column>
        <el-table-column align="center" label="经销单价">
          <template slot-scope="scope1">
            <span v-if="isManager === '0'">***</span>
            <span v-else>{{ scope1.row.UNIT_PRICE | priceFilter }}</span>
          </template>
        </el-table-column>
        <el-table-column
          prop="PROMOTION"
          align="center"
          label="活动类型"
        ></el-table-column>
        <el-table-column
          prop="PART_SEND_ID"
          align="center"
          :formatter="formatRole"
          label="发货说明"
        ></el-table-column>
        <el-table-column
          align="center"
          prop="QTY_REQUIRED"
          label="数量"
        ></el-table-column>
        <el-table-column align="center" label="折后金额">
          <template slot-scope="scope1">
            <span v-if="isManager === '0'">***</span>
            <span v-else>{{ scope1.row.PROMOTION_COST }}</span>
            <!-- <span v-else>{{scope1.row.PROMOTION_COST/scope1.row.QTY_REQUIRED |priceFilter}}</span> -->
          </template>
        </el-table-column>
        <el-table-column align="center" label="年返利使用金额">
          <template slot-scope="scope1">
            <span v-if="isManager === '0'">***</span>
            <span v-else>{{ scope1.row.BACK_Y }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="BACK_M" align="center" label="月返利使用金额">
          <template slot-scope="scope1">
            <span v-if="isManager === '0'">***</span>
            <span v-else>{{ scope1.row.BACK_M }}</span>
          </template>
        </el-table-column>
        <el-table-column align="center" label="应付金额">
          <template slot-scope="scope1">
            <span v-if="isManager === '0'">***</span>
            <span v-else>{{ scope1.row.FINAL_COST }}</span>
          </template>
        </el-table-column>
        <el-table-column v-if="isX" align="center" label="详情">
          <template slot-scope="scope">
            <el-button
              @click="openDialog(scope.row, scope.$index)"
              type="primary"
              size="small"
              >查看详情</el-button
            >
          </template>
        </el-table-column>
        <el-table-column
          align="center"
          prop="NOTES"
          label="备注"
          show-overflow-tooltip
        ></el-table-column>
      </el-table>

      <div v-show="payShow" style="float:right; margin-right:10%;height:100px;">
        <p v-if="isManager === '0'">
          应付总金额：
          <span style="color:tomato;font-weight:bold;">***</span>
        </p>
        <p v-else>
          应付总金额：
          <span style="color:tomato;font-weight:bold;">{{
            ruleForm.ALL_SPEND
          }}</span>
        </p>
        <br />
        <el-button @click="refreshPay()" size="medium" type="danger" plain
          >订单提交</el-button
        >
      </div>
    </el-card>
  </el-card>
</template>

<script>
import Axios from "axios";
import { getOrderlist, orderDetail } from "@/api/orderList";
import { payAgain } from "@/api/orderList";
import { queryCash } from "@/api/orderList";
import { mapMutations, mapActions } from "vuex";
import { mapState } from "vuex";
import Cookies from "js-cookie";
import DetailCurtainTable from "../detail/detailCurtainTable";
export default {
  data() {
    return {
      //弹窗
      ljsuggestion: "",
      tableIndex: "",
      detailVisible: false,
      curtainData: "",
      headerData: {},
      isX: false,
      isW: false,
      isManager: Cookies.get("isManager"),
      status: "",
      Initial_balance: 0,
      payShow: false,
      ruleForm: {
        ORDER_NO: "",
        LINKPERSON: "",
        WL_CONTACTS: "",
        WL_TEL: "",
        POST_ADDRESS: "",
        NOTES: "",
        ORDERBODY: []
      }
    };
  },
  components: {
    DetailCurtainTable
  },
  filters: {
    priceFilter(value) {
      //四舍五入过滤大法
      let realVal = parseFloat(value).toFixed(2);
      //防止出现-0.00；
      if (realVal <= 0) {
        realVal = 0.0;
      }

      return realVal;
    }
  },
  created: function() {
    this.status = Cookies.get("status_ID");
    if (this.status == 5 || this.status == 6) {
      this.payShow = true;
    }
    let theTYPE = Cookies.get("ORDER_NO").slice(0, 1);
    if (theTYPE == "W") {
      this.isW = true;
    } else if (theTYPE == "X") {
      this.isX = true;
    }
    this.queryMoney();
    this.getDetail();
  },
  methods: {
    closeTheDialog(msg) {
      this.detailVisible = msg;
    },
    getFinalData(msg) {
      console.log("fuck");
    },
    openDialog(tab, index) {
      this.ljsuggestion = tab.LJ_SUGGESTION;
      console.log(tab);
      console.log(index);
      this.tableIndex = index;
      this.detailVisible = true;
      for (let i = 0; i < tab.curtains.length; i++) {
        tab.curtains[i].choose = true;
        tab.curtains[i].productType = tab.curtains[i].item.productType;
        tab.curtains[i].itemType = tab.curtains[i].curtainPartName;
        //tab.curtains[i].suggestion='';
        if (tab.curtains[i].unit === "°ü") {
          tab.curtains[i].unit = "包";
        }
      }
      this.curtainData = tab.curtains;
      console.log(this.curtainData);

      this.headerData.quantity = tab.QTY_REQUIRED;
      this.headerData.highJia = tab.CURTAIN_HEIGHT2;
      this.headerData.productGroupType = ""; //
      this.headerData.price = tab.all_cost;
      if (tab.CURTAIN_WBH_SIZE == -1) {
        this.headerData.outsourcingBoxExist = 0; //判断
      } else {
        this.headerData.outsourcingBoxExist = 1; //判断
      }
      this.headerData.outsourcingBoxWidth = tab.CURTAIN_WBH_SIZE;
      this.headerData.modelNumber = tab.ITEM_NO;
      this.headerData.location = tab.CURTAIN_ROOM_NAME
        ? tab.CURTAIN_ROOM_NAME
        : "无"; //'无';
      this.headerData.height = tab.CURTAIN_HEIGHT;
      this.headerData.width = tab.CURTAIN_WIDTH;
      this.headerData.drape = tab.CURTAIN_SIZE_TIMES;
      this.headerData.checked = "";
      this.headerData.cartItemId = "";
      this.headerData.activityGroupType = ""; //
      this.headerData.activity = tab.PROMOTION_TYPE;
    },
    formatRole: function(row, column) {
      //return row.PART_SEND_ID ===0? "是":"否";  //预留
      if (row.PART_SEND_ID == 0) {
        return "等生产";
      } else if (row.PART_SEND_ID == 1) {
        return "分批发货";
      } else return "--";
    },
    //余额判断
    queryMoney() {
      var url = "/order/getResidemoney.do";
      var data = {
        cid: Cookies.get("cid"),
        companyId: Cookies.get("companyId")
      };
      queryCash(url, data).then(res => {
        this.Initial_balance = res.data;
        console.log(this.Initial_balance);
      });
    },
    //[新]订单获取
    getDetail() {
      let url = "/order/getOrderContent.do";
      let data = {
        cid: Cookies.get("cid"),
        order_no: Cookies.get("ORDER_NO")
      };
      orderDetail(url, data).then(res => {
        this.ruleForm.ORDER_NO = Cookies.get("ORDER_NO");
        this.ruleForm = res.data.data[0];
      });
    },
    //重新提交   后面加个判断语句，余额不足可提交的话不做金额判断
    refreshPay() {
      let url = "/order/putAgainOrder.do";
      let data = {
        cid: Cookies.get("cid"),
        orderNo: Cookies.get("ORDER_NO")
      };
      if (this.ruleForm.ALL_SPEND > this.Initial_balance && this.status == 5) {
        //欠款可提交的话可以跳过判断
        this.$alert("余额不足，请尽快充值", "提示", {
          confirmButtonText: "确定",
          type: "warning"
        });
      } else {
        payAgain(url, data)
          .then(res => {
            var recordData = {
              ORDER_NO: Cookies.get("ORDER_NO"),
              OPERATION_PERSON: Cookies.get("cid"),
              OPERATION_NAME: "重新提交"
            };
            InsertOperationRecord(recordData); //插入操作记录
            this.$alert("提交成功", "提示", {
              confirmButtonText: "确定",
              type: "success"
            });
            this.$root.$emit("refreshMoneyEvent"); //触发主页面刷新余额
            this.addTab("order/myOrder");
            this.closeTab("order/orderDetail");
          })
          .catch(res => {
            this.$alert("操作失败，请稍后重试", "提示", {
              confirmButtonText: "确定",
              type: "warning"
            });
          });
      }
    },
    //隔行变色
    tableRowClassName({ row, rowIndex }) {
      if (row.STATUS_ID == "3") {
        return "fuck-row";
      }
      if (rowIndex % 2 == 0) {
        return "success-row";
      }
      return "";
    },
    returnOrder() {
      this.addTab("order/myOrder");
      this.closeTab("order/orderDetail");
    },
    ...mapMutations("navTabs", ["addTab"]),
    ...mapActions("navTabs", ["closeTab", "closeToTab"])
  }
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
  font-weight: bold;
}
.zoomLeft {
  font-size: 15px;
  line-height: 30px;
  display: inline-block;
  margin-right: 10px;
}
/* p{
  font-size: 23px;
  font-weight: 500;
} */
/* span{
  color: gray;
  font-weight: 200;
  font-size: 22px;
} */
</style>
<style>
.el-table .success-row {
  background: #f0f9eb;
}
</style>