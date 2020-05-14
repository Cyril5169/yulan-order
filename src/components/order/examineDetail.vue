<template>
  <el-card class="centerCard">
    <el-dialog
      title="窗帘详情"
      :show-close="false"
      :visible.sync="detailVisible"
      :close-on-click-modal="false"
      width="95%"
      top="5vh"
    >
      <keep-alive>
        <detailCurtainTable
          v-if="detailVisible"
          v-bind:tableStatus="1"
          v-bind:STATUS_ID="STATUS_ID"
          v-bind:isModified="isModified"
          v-bind:headerData="headerData"
          v-bind:curtainData="curtainData"
          v-bind:suggestion="ljsuggestion"
          v-on:visible="closeTheDialog"
          v-on:finalData="getFinalData"
          v-on:deleteArr="getDeleteArr"
          v-on:suggest="getSuggest"
        ></detailCurtainTable>
      </keep-alive>
    </el-dialog>

    <div slot="header">
      <span class="headSpan">审核详情</span>
      <el-button
        @click.native="
          closeToTab({ oldUrl: 'order/examineDetail', newUrl: 'order/examine' })
        "
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
          <span class="zoomRight"
            >{{ ruleForm.LINKPERSON }}({{ ruleForm.TELEPHONE }})</span
          >
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
          <span class="zoomRight">{{ ruleForm.ALL_ADDRESS }}</span>
        </span>
        <span class="zoomLeft">
          订单备注：
          <span class="zoomRight">{{ ruleForm.NOTES }}</span>
        </span>
        <br />
        <span class="zoomLeft">
          玉兰处理说明：
          <span class="zoomRight">{{ ruleForm.YULAN_NOTES }}</span>
        </span>
      </div>
      <el-table
        border
        :data="ruleForm.ORDERBODY"
        style="width: 100%"
        :row-class-name="tableRowClassName"
      >
        <el-table-column
          align="center"
          prop="LINE_NO"
          label="序号"
          width="50"
        ></el-table-column>
        <el-table-column
          align="center"
          prop="ITEM_NO"
          label="型号"
        ></el-table-column>
        <el-table-column
          align="center"
          prop="BRAND_NAME"
          label="品牌"
        ></el-table-column>
        <el-table-column
          align="center"
          prop="NOTE"
          label="类型"
        ></el-table-column>
        <el-table-column
          prop="PRODUCTION_VERSION"
          align="center"
          label="所属版本"
        ></el-table-column>
        <el-table-column
          align="center"
          prop="QTY_REQUIRED"
          label="数量"
        ></el-table-column>
        <el-table-column
          prop="PROMOTION"
          align="center"
          label="活动类型"
        ></el-table-column>
        <el-table-column
          align="center"
          prop="NOTES"
          label="备注"
        ></el-table-column>
        <el-table-column align="center" label="详情">
          <template slot-scope="scope">
            <el-button
              @click="openDialog(scope.row, scope.$index)"
              type="primary"
              size="mini"
              >查看详情</el-button
            >
          </template>
        </el-table-column>
        <el-table-column
          align="center"
          prop="checkStatus"
          label="明细状态"
        ></el-table-column>
      </el-table>
      <div style="float:right;margin-top:20px;height:80px;">
        <el-button
          :disabled="!passORback"
          @click="LanjuChange()"
          size="medium"
          type="danger"
          >兰居修改</el-button
        >
        <el-button
          :disabled="!passORback"
          size="medium"
          type="warning"
          @click="_back()"
          >退回修改</el-button
        >
        <el-button
          :disabled="passORnot"
          @click="_pass()"
          size="medium"
          type="success"
          >通过审核</el-button
        >
      </div>
      <div style="padding:10px;">
        <span class="timeLeft">
          创建：
          <span class="timeRight">{{ ruleForm.DATE_CRE }}</span>
        </span>
        <span v-if="ruleForm.WEB_TJ_TIME" class="timeLeft">
          提交：
          <span class="timeRight">{{ ruleForm.WEB_TJ_TIME }}</span>
        </span>
        <span class="timeLeft">
          更新：
          <span class="timeRight">{{ ruleForm.DATE_UPDATE }}</span>
        </span>
        <br />
        <span v-if="ruleForm.DATE_ACCEPT" class="timeLeft">
          接收：
          <span class="timeRight">{{ ruleForm.DATE_ACCEPT }}</span>
        </span>
        <span v-if="ruleForm.DATE_DEAL" class="timeLeft">
          处理：
          <span class="timeRight">{{ ruleForm.DATE_DEAL | datatrans }}</span>
        </span>
        <span v-if="ruleForm.USER_NO" class="timeLeft">
          处理人：
          <span class="timeRight">{{ ruleForm.USER_NO }}</span>
        </span>
      </div>
      <el-divider></el-divider>
      <div style="margin-top:0px;">
        <!-- <span style="margin-left:10px;color:red;"
          >订单修改说明：当修改数量不超过200卷时，双方可通过电话在原订单上进行修改，当修改数量超过200卷时，乙方应向甲方提供书面修改说明。</span
        >
        <br /> -->
        <span style="margin-left:10px;color:red;"
          >法律效力：本订单是双方合作协议不可分割的一部分，是乙方向甲方订货的凭证，具法力效力。</span
        >
        <el-divider></el-divider>
      </div>
      <div
        v-if="operationRecords.length > 0"
        style="width:800px;margin-bottom:20px;"
      >
        <h1 style="margin-left:10px;">处理记录：</h1>
        <el-steps
          direction="vertical"
          :active="operationRecords.length"
          style="margin-top:10px;margin-left:20px;"
        >
          <el-step
            v-for="item in operationRecords"
            :key="item.value"
            style="margin-top:1px;"
          >
            <template slot="title">
              <div v-html="item.OPERATION_NOTE"></div>
            </template>
          </el-step>
        </el-steps>
      </div>
    </el-card>
  </el-card>
</template>

<script>
import Axios from "axios";
import {
  getOrderlist,
  passExamine,
  orderDetail,
  defeatChange
} from "@/api/orderList";
import { updateCurtainOrder, getOperationRecord } from "@/api/orderListASP";
import { mapMutations, mapActions } from "vuex";
import { mapState } from "vuex";
import Cookies from "js-cookie";
import DetailCurtainTable from "../detail/detailCurtainTable";
export default {
  name: "examineDatail",
  data() {
    return {
      isModified: "",
      deleteIds: [],
      BENarray: "",
      ljsuggestion: "",
      allCurtains: [],
      headerData: {},
      curtainData: "",
      orderNumber: "",
      renderArray: [],
      operationRecords: [],
      tableIndex: "",
      cyLineNo: 0,
      passORback: false,
      passORnot: true,
      detailVisible: false,
      ctmOrderDetails: [],
      STATUS_ID: "",
      //advanceVisible:false,
      //advance:'',
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
  created: function() {
    this.getDetail();
    this.orderNumber = Cookies.get("ORDER_NO");
  },
  filters: {
    datatrans(value) {
      //时间戳转化大法
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
      return y + "-" + MM + "-" + d + " " + h + ":" + m + ":" + s;
    }
  },
  methods: {
    //关闭页面
    closeTheDialog(msg) {
      this.detailVisible = msg;
    },
    //获取修改后的表格数据
    getFinalData(msg, passFlag) {
      if (msg != null && msg != 1) {
        if (passFlag != null && passFlag == 1) this.saveChange(1);
        else this.saveChange(0);
      } else if (msg == 1) {
        this.saveChange(1);
        return;
      }
      let innerLine = msg[0].lineNo;
      this.allCurtains.push(msg);
      //强制换掉这个傻逼数据
      for (let i = 0; i < msg.length; i++) {
        msg[i].itemId = msg[i].item.itemNo;
      }
      for (let a = 0; a < this.allCurtains.length - 1; a++) {
        if (this.allCurtains[a][0].lineNo == innerLine) {
          this.allCurtains.splice(a, 1);
        }
      }
    },
    //获取要删除的配件id
    getDeleteArr(msg) {
      for (var i = 0; i < msg.length; i++) {
        this.deleteIds.push(msg[i]);
      }
    },
    getSuggest(val) {
      let transData = {};
      transData.lineNo = this.cyLineNo;
      transData.orderNo = this.orderNumber;
      transData.ljSuggestion = val;
      if (this.ctmOrderDetails.length == 0) {
        this.ctmOrderDetails.push(transData);
      } else {
        var isContainIndex = this.ctmOrderDetails.findIndex(
          item => item.lineNo == this.cyLineNo
        );
        if (isContainIndex != -1) {
          this.ctmOrderDetails[isContainIndex] = transData;
        } else {
          this.ctmOrderDetails.push(transData);
        }
      }
    },
    //渲染
    Render() {
      this.$set(this.ruleForm.ORDERBODY, this.tableIndex, this.renderArray);
    },
    //保存修改
    saveChange(opreate) {
      this.renderArray = this.ruleForm.ORDERBODY[this.tableIndex];
      if (opreate == 0) {
        this.renderArray.checkStatus = "已修改";
        this.passORback = true;
      } else if (opreate == 1) {
        this.renderArray.checkStatus = "已通过";
      }
      this.Render();
      this.listenStatus();
      this.detailVisible = false;
    },
    openDialog(tab, index) {
      this.detailVisible = true;
      if (tab.checkStatus == "已修改") {
        this.isModified = 1;
      } else {
        this.isModified = 0;
      }
      //this.ljsuggestion='';
      this.ljsuggestion = tab.LJ_SUGGESTION; // 应该可以了吧，不行就换回去
      this.tableIndex = index;
      this.cyLineNo = index + 1;
      this.STATUS_ID = tab.STATUS_ID;
      //拿到保存的建议
      for (let i = 0; i < this.ctmOrderDetails.length; i++) {
        if (this.ctmOrderDetails[i].lineNo == this.cyLineNo) {
          this.ljsuggestion = this.ctmOrderDetails[i].ljSuggestion;
        }
      }

      //强制塞数据
      for (let i = 0; i < tab.curtains.length; i++) {
        tab.curtains[i].choose = true;
        //tab.curtains[i].suggestion='';
        tab.curtains[i].productType = tab.curtains[i].item.productType;
        tab.curtains[i].itemType = tab.curtains[i].curtainPartName;
        if (tab.curtains[i].unit === "°ü") {
          tab.curtains[i].unit = "包";
        }
        tab.curtains[i].dosage = Math.round(tab.curtains[i].dosage.mul(100)) / 100;
      }
      //拿到保存的数据
      this.curtainData = tab.curtains;
      for (let i = 0; i < this.allCurtains.length; i++) {
        if (this.cyLineNo == this.allCurtains[i][0].lineNo) {
          this.curtainData = this.allCurtains[i];
        }
      }
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
    //兰居修改
    LanjuChange() {
      let url = "/order/updateCurtainOrder.do";
      let data = {
        cid: Cookies.get("cid"),
        orderNo: this.orderNumber,
        curtainStatusId: "2",
        allCurtains: this.allCurtains,
        ctmOrderDetails: this.ctmOrderDetails,
        deleteIds: this.deleteIds
      };
      //defeatChange(url, data).then(res => {
      updateCurtainOrder(data)
        .then(res => {
          if (res.code == 0) {
            this.$alert("操作成功,已将该订单退回给用户进行确认", "提示", {
              confirmButtonText: "确定",
              type: "success"
            });
            this.closeToTab({
              oldUrl: "order/examineDetail",
              newUrl: "order/examine"
            });
          } else {
            this.$alert("操作失败，请稍后重试", "提示", {
              confirmButtonText: "确定",
              type: "warning"
            });
          }
        })
        .catch(res => {
          this.$alert("操作失败:" + res.msg, "提示", {
            confirmButtonText: "确定",
            type: "warning"
          });
          console.log(res);
        });
    },
    getDetail() {
      let url = "/order/getOrderContent.do";
      let data = {
        cid: Cookies.get("cid"),
        order_no: Cookies.get("ORDER_NO")
      };
      orderDetail(url, data).then(res => {
        this.ruleForm.ORDER_NO = Cookies.get("ORDER_NO");
        this.ruleForm = res.data.data[0];
        for (let i = 0; i < this.ruleForm.ORDERBODY.length; i++) {
          this.ruleForm.ORDERBODY[i].checkStatus = "未修改";
        }
        var recordData = {
          orderNo: this.orderNumber
        };
        getOperationRecord(recordData).then(res => {
          this.operationRecords = res.data;
        });
      });
    },
    //退回客户修改
    _back() {
      let url = "/order/updateCurtainOrder.do";
      let data = {
        cid: Cookies.get("cid"),
        orderNo: this.orderNumber,
        curtainStatusId: "1",
        allCurtains: [],
        ctmOrderDetails: this.ctmOrderDetails
      };
      for (let j = 0; j < this.allCurtains.length; j++) {
        let array = new Array();
        for (let i = 0; i < this.allCurtains[j].length; i++) {
          array[i] = new Object();
          array[i].suggestion = this.allCurtains[j][i].suggestion;
          array[i].lineNo = this.allCurtains[j][i].lineNo;
          array[i].orderItemNumber = this.allCurtains[j][i].orderItemNumber;
          array[i].orderNo = this.orderNumber;
        }
        data.allCurtains.push(array);
      }
      //defeatChange(url, data).then(res => {
      updateCurtainOrder(data)
        .then(res => {
          if (res.code == 0) {
            this.$alert("操作成功,已将该订单退回给用户修改", "提示", {
              confirmButtonText: "确定",
              type: "success"
            });
            this.closeToTab({
              oldUrl: "order/examineDetail",
              newUrl: "order/examine"
            });
          } else {
            this.$alert("操作失败，请稍后重试", "提示", {
              confirmButtonText: "确定",
              type: "warning"
            });
          }
        })
        .catch(res => {
          this.$alert("操作失败:" + res.msg, "提示", {
            confirmButtonText: "确定",
            type: "warning"
          });
          console.log(res);
        });
    },
    //审核通过
    _pass() {
      var url = "/order/updateCurOrderStatus.do";
      var data = {
        cid: Cookies.get("cid"),
        orderNo: Cookies.get("ORDER_NO"),
        curtainStatusId: "4",
        allCurtains: [],
        ctmOrderDetails: this.ctmOrderDetails
      };
      for (let j = 0; j < this.allCurtains.length; j++) {
        let array = new Array();
        for (let i = 0; i < this.allCurtains[j].length; i++) {
          array[i] = new Object();
          array[i].note = this.allCurtains[j][i].note;
          array[i].suggestion = this.allCurtains[j][i].suggestion;
          array[i].lineNo = this.allCurtains[j][i].lineNo;
          array[i].orderItemNumber = this.allCurtains[j][i].orderItemNumber;
          array[i].orderNo = this.orderNumber;
        }
        data.allCurtains.push(array);
      }
      //passExamine(url, data).then(res => {
      updateCurtainOrder(data)
        .then(res => {
          if (res.code == 0) {
            this.$alert("操作成功,该订单已通过审核", "提示", {
              confirmButtonText: "确定",
              type: "success"
            });
            //this.addTab('order/examine');
            this.closeToTab({
              oldUrl: "order/examineDetail",
              newUrl: "order/examine"
            });
            //跳转
          } else {
            this.$alert("操作失败，请稍后重试", "提示", {
              confirmButtonText: "确定",
              type: "warning"
            });
          }
        })
        .catch(res => {
          this.$alert("操作失败:" + res.msg, "提示", {
            confirmButtonText: "确定",
            type: "warning"
          });
          console.log(res);
        });
    },
    //监听状态
    listenStatus() {
      let count = 0;
      for (let i = 0; i < this.ruleForm.ORDERBODY.length; i++) {
        if (this.ruleForm.ORDERBODY[i].checkStatus == "已通过") {
          count++;
        }
      }
      if (count == this.ruleForm.ORDERBODY.length) {
        this.passORnot = false;
        this.passORback = false;
      } else {
        this.passORnot = true;
        this.passORback = true;
      }
    },
    //隔行变色
    tableRowClassName({ row, rowIndex }) {
      if (rowIndex % 2 == 0) {
        return "success-row";
      }
      return "";
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
  display: inline-block;
  margin-right: 10px;
}
.timeLeft {
  font-size: 14px;
  line-height: 30px;
  display: inline-block;
}
.timeRight {
  font-size: 14px;
  line-height: 30px;
  display: inline-block;
  margin-right: 20px;
  font-weight: bold;
}
</style>
<style>
.el-table .success-row {
  background: #f0f9eb;
}
</style>