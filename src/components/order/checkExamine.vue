<template>
  <el-card class="centerCard" shadow="never">
    <el-dialog title="窗帘详情" :visible.sync="detailVisible" width="95%" top="5vh" append-to-body>
      <keep-alive>
        <detailCurtainTable v-if="detailVisible" :tableStatus="check_CURTAIN_STATUS_ID != 1 ? 3 : 2" :headerData="headerData"
          :curtainData="curtainData" :suggestion="ljsuggestion" @visible="closeTheDialog" @deleteArr="getDeleteArr"
          @finalData="getFinalData">
        </detailCurtainTable>
      </keep-alive>
    </el-dialog>
    <el-dialog title="查看购买凭证" width="700px" :visible.sync="buyUserPictureVisible">
      <div style="display: inline-block;margin:5px;cursor:pointer;" v-for="(file,index) in fileList" :key="index">
        <el-image style="width: 200px; height: 200px" :src="file" fit="fill" @click="handleImgClick(index)"
          :preview-src-list="fileList2"></el-image>
      </div>
    </el-dialog>
    <el-dialog v-if="newCurtainDetailVisible" title="窗帘详情" :visible.sync="newCurtainDetailVisible" width="1200px" top="5vh"
      :close-on-click-modal="false" append-to-body>
      <newCurtainOrderDetail :ORDERBODY="selectOrderDetail" :ruleForm="ruleForm" :originDelete="originDelete"
        @resolveModify="resolveModify" />
    </el-dialog>

    <div slot="header">
      <span class="headSpan">订单详情</span>
      <!-- 审核人员对测试账号的订单专用 -->
      <el-button @click="exportProductExcel" v-if="isExamine && showExportProduct && button_1" size="mini" plain>
        导出生产模板
      </el-button>
      <countdown style="color:red;"
        v-if="!isExamine && ruleForm.STATUS_ID != 3 && (ruleForm.CURTAIN_STATUS_ID == 1 || ruleForm.CURTAIN_STATUS_ID == 2)"
        :time="new Date(ruleForm.DATE_UPDATE).getTime() - nowDate" format="DD 天 HH 时 mm 分 ss 秒后自动作废" @finish="backTowhere" />
      <el-button @click="backTowhere()" style="float:right;" size="small" type="success" plain v-if="button_1">返回
      </el-button>
    </div>
    <el-card class="tableCard" shadow="never" body-style="padding:1px">
      <div slot="header">
        <span class="zoomLeft">
          订单号：
          <span class="zoomRight">{{ ruleForm.ORDER_NO }}</span>
        </span>
        <span class="zoomLeft">
          经办人：
          <span class="zoomRight">{{ ruleForm.LINKPERSON }}({{ ruleForm.TELEPHONE }})</span>
        </span>
        <span class="zoomLeft">
          收货人：
          <span class="zoomRight">{{ ruleForm.WL_CONTACTS }}({{ ruleForm.WL_TEL }})</span>
        </span>
        <span class="zoomLeft">
          收货地址：
          <span class="zoomRight">{{ ruleForm.ALL_ADDRESS }}</span>
        </span>

        <br />
        <span class="zoomLeft">
          购买人：
          <span class="zoomRight">{{ ruleForm.BUYUSER }}<span
              v-if="ruleForm.BUYUSERPHONE">({{ ruleForm.BUYUSERPHONE }})</span></span>
        </span>
        <span class="zoomLeft">
          购买人地址：
          <span class="zoomRight">{{ ruleForm.BUYUSER_ADDRESS }}</span>
        </span>
        <span class="zoomLeft" v-if="ruleForm.BUYUSER_PICTURE">
          <el-link type="primary" @click="buyUserPictureVisible=true">查看购买凭证</el-link>
        </span>
        <span class="zoomLeft" v-if="ruleForm.PACKING_NOTE">
          分包备注：
          <span class="zoomRight">{{ ruleForm.PACKING_NOTE }}</span>
        </span>
        <br />
        <span class="zoomLeft">
          订单备注：
          <span class="zoomRight">{{ ruleForm.NOTES }}</span>
        </span>
        <span class="zoomLeft">
          玉兰处理说明：
          <span class="zoomRight">{{ ruleForm.YULAN_NOTES }}</span>
        </span>
        <template v-if="isN">
          <br />
          <span class="zoomLeft">
            交货日期：
            <span class="zoomRight">{{ ruleForm.JIAOHUO_DATE | dateFilter('yyyy-MM-dd HH:mm:ss') }}</span>
          </span>
          <span class="zoomLeft">
            兰居处理说明：
            <span class="zoomRight">{{ ruleForm.LANJU_NOTE }}</span>
          </span>
        </template>
      </div>
      <el-table border :show-summary="ruleForm.ORDERBODY.length > 1" :summary-method="getSummaries" :data="ruleForm.ORDERBODY"
        style="width: 100%" :row-class-name="tableRowClassName">
        <el-table-column align="center" prop="LINE_NO" label="序号" width="50"></el-table-column>
        <el-table-column align="center" prop="ITEM_NO" label="型号" width="140"></el-table-column>
        <el-table-column align="center" label="经销单价" width="80">
          <template slot-scope="scope1">
            <span v-if="isManager === '0' && !isExamine">***</span>
            <span v-else>{{ scope1.row.UNIT_PRICE | priceFilter }}</span>
          </template>
        </el-table-column>
        <el-table-column align="center" prop="QTY_REQUIRED" label="数量" width="60"></el-table-column>
        <el-table-column prop="PROMOTION" align="center" label="活动" width="110" show-overflow-tooltip></el-table-column>
        <el-table-column prop="PART_SEND_ID" align="center" :formatter="formatRole" label="发货说明" width="90">
        </el-table-column>
        <el-table-column prop="PROMOTION_COST" align="center" label="折后金额" width="90">
          <template slot-scope="scope1">
            <span v-if="isManager === '0' && !isExamine">***</span>
            <span v-else>{{ scope1.row.PROMOTION_COST }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="BACK_Y" align="center" label="年返利使用金额" width="90">
          <template slot-scope="scope1">
            <span v-if="isManager === '0' && !isExamine">***</span>
            <span v-else>{{ scope1.row.BACK_Y }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="BACK_M" align="center" label="月返利使用金额" width="90">
          <template slot-scope="scope1">
            <span v-if="isManager === '0' && !isExamine">***</span>
            <span v-else>{{ scope1.row.BACK_M }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="FINAL_COST" align="center" label="应付金额" width="90">
          <template slot-scope="scope1">
            <span v-if="isManager === '0' && !isExamine">***</span>
            <span v-else>{{ scope1.row.FINAL_COST }}</span>
          </template>
        </el-table-column>
        <el-table-column align="center" prop="NOTES" label="备注"></el-table-column>
        <el-table-column v-if="isX" prop="LJ_SUGGESTION" align="center" label="兰居备注"></el-table-column>
        <el-table-column v-if="isX" align="center" label="窗帘详情" width="105">
          <template slot-scope="scope">
            <el-button @click="openDialog(scope.row, scope.$index)" type="primary" size="mini">查看详情</el-button>
          </template>
        </el-table-column>
        <el-table-column v-if="isN" align="center" label="窗帘详情" width="105">
          <template slot-scope="scope">
            <el-button @click="openNewCurtain(scope.row, scope.$index)" type="primary" size="mini">查看详情</el-button>
          </template>
        </el-table-column>
        <el-table-column v-if="ruleForm.CURTAIN_STATUS_ID == 1 && (isX || isN)" align="center" prop="checkStatus" label="是否修改"
          width="80">
        </el-table-column>
      </el-table>

      <div style="float:right;margin-top:20px;margin-right:10px;height:80px;" v-if="!isExamine">
        <el-button v-if="ruleForm.CURTAIN_STATUS_ID == 2" @click="_defeat()" size="medium" type="warning">退回兰居修改
        </el-button>
        <el-button v-if="ruleForm.CURTAIN_STATUS_ID == 2" @click="_pass()" size="medium" type="success">确认兰居修改</el-button>
        <el-button :disabled="!modifyBtnVisible" v-if="ruleForm.CURTAIN_STATUS_ID == 1 && isX" @click="LjExamine()" size="medium"
          type="success">确认修改</el-button>
        <el-button :disabled="!modifyBtnVisible" v-if="ruleForm.CURTAIN_STATUS_ID == 1 && isN" @click="customerChange"
          size="medium" type="success">确认修改</el-button>
        <el-button v-if="(ruleForm.CURTAIN_STATUS_ID == 0 || ruleForm.CURTAIN_STATUS_ID == 4) && ruleForm.STATUS_ID == 0 && isX"
          @click="summitCurtain" size="medium" type="primary">提交订单</el-button>
        <el-button v-if="(ruleForm.CURTAIN_STATUS_ID == 0 || ruleForm.CURTAIN_STATUS_ID == 4) && ruleForm.STATUS_ID == 0 && isN"
          @click="summitNewCurtain" size="medium" type="primary">提交订单</el-button>
        <el-button v-if="ruleForm.STATUS_ID == 5 || ruleForm.STATUS_ID == 6" @click="refreshPay()" size="medium" type="danger"
          plain>
          提交订单</el-button>
      </div>
      <div style="padding:10px;">
        <span class="timeLeft">
          创建：
          <span class="timeRight">{{ ruleForm.DATE_CRE | dateFilter('yyyy-MM-dd HH:mm:ss')}}</span>
        </span>
        <span v-if="ruleForm.WEB_TJ_TIME && ruleForm.WEB_TJ_TIME != '9999/12/31 00:00:00'" class="timeLeft">
          提交：
          <span class="timeRight">{{ ruleForm.WEB_TJ_TIME | dateFilter('yyyy-MM-dd HH:mm:ss')}}</span>
        </span>
        <span class="timeLeft">
          更新：
          <span class="timeRight">{{ ruleForm.DATE_UPDATE | dateFilter('yyyy-MM-dd HH:mm:ss')}}</span>
        </span>
        <br />
        <span v-if="ruleForm.DATE_ACCEPT && ruleForm.DATE_ACCEPT != '9999/12/31 00:00:00'" class="timeLeft">
          接收：
          <span class="timeRight">{{ ruleForm.DATE_ACCEPT | dateFilter('yyyy-MM-dd HH:mm:ss')}}</span>
        </span>
        <span v-if="ruleForm.DATE_DEAL && ruleForm.DATE_DEAL != '9999/12/31 00:00:00'" class="timeLeft">
          处理：
          <span class="timeRight">{{ ruleForm.DATE_DEAL | dateFilter('yyyy-MM-dd HH:mm:ss') }}</span>
        </span>
        <span v-if="ruleForm.USER_NO" class="timeLeft">
          处理人：
          <span class="timeRight">{{ ruleForm.USER_NO }}</span>
        </span>
      </div>
      <el-divider></el-divider>
      <div style="margin-top:0px;">
        <span style="margin-left:10px;color:red;">注意：本订单是双方合作协议不可分割的一部分，是乙方向甲方订货的凭证，具有法律效力。</span>
      </div>
      <div v-if="operationRecords.length > 0" style="width:800px;margin-bottom:20px;">
        <h1 style="margin-left:10px;">处理记录：</h1>
        <el-steps direction="vertical" :active="operationRecords.length" style="margin-top:10px;margin-left:20px;">
          <el-step v-for="item in operationRecords" :key="item.value" style="margin-top:1px;">
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
import {
  updateCurtainOrder,
  getOperationRecord,
  getOrderDetails,
  GetCtmOrder,
  GetPromotionByType,
  GetPromotionByTypeAndId,
  ljExportProductExcel,
  updateCurtainOrderStatus,
  settlementAgain
} from "@/api/orderListASP";
import { newCurtainUpdateCurtainOrder, newCurtainExportProductExcel } from "@/api/newCurtainASP";
import { downLoadFile } from "@/common/js/downLoadFile";
import { mapMutations, mapActions } from "vuex";
import Cookies from "js-cookie";
import DetailCurtainTable from "../detail/detailCurtainTable";
import NewCurtainOrderDetail from "./newCurtainOrderDetail";
import countdown from "./count-down";

export default {
  name: "examineDatail",
  props: ["isShowButton"],
  data() {
    return {
      button_1: true,
      deleteIds: [],
      ljsuggestion: "", //兰居审核意见
      cyLineNo: 0,
      allCurtains: [],
      headerData: {},
      isX: false,
      isN: false,
      curtainData: "",
      Initial_balance: 0,
      renderArray: [],
      tableIndex: "",
      isManager: Cookies.get("isManager"),
      isExamine: Cookies.get("isExamine") == "true",
      check_CURTAIN_STATUS_ID: "",
      orderNum: "",
      detailVisible: false,
      newCurtainDetailVisible: false,
      buyUserPictureVisible: false,
      fileList: [],
      fileList2: [],
      showViewer: false,
      operationRecords: [],
      ruleForm: {
        ORDER_NO: "",
        LINKPERSON: "",
        WL_CONTACTS: "",
        WL_TEL: "",
        POST_ADDRESS: "",
        NOTES: "",
        ORDERBODY: [],
      },
      showExportProduct: false,
      selectOrderDetail: {},
      newCurtainData: [],
      deleteCurtainData: [],
      originDelete: [],
      nowDate: 0
    };
  },
  components: {
    DetailCurtainTable,
    NewCurtainOrderDetail,
    countdown
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
    },
  },
  computed: {
    modifyBtnVisible() {
      var visible = true;
      for (var i = 0; i < this.ruleForm.ORDERBODY.length; i++) {
        if (this.ruleForm.ORDERBODY[i].checkStatus == "未修改") visible = false;
      }
      return visible;
    },
    ruleFormPost() {
      var data = [];
      if (this.ruleForm) {
        data = JSON.parse(JSON.stringify(this.ruleForm));
        //去除ORDERBODY
        data.ORDERBODY = [];
      }
      return data;
    },
    orderDetailsPost() {
      var data = [];
      if (this.ruleForm.ORDERBODY) {
        data = JSON.parse(JSON.stringify(this.ruleForm.ORDERBODY));
        //去除curtains
        data.curtains = [];
      }
      return data;
    }
  },
  methods: {
    formatRole: function (row, column) {
      if (row.PART_SEND_ID == 0) {
        return "等生产";
      } else if (row.PART_SEND_ID == 1) {
        return "分批发货";
      } else return "--";
    },
    closeTheDialog(msg) {
      this.detailVisible = msg;
    },
    getDeleteArr(msg) {
      for (var i = 0; i < msg.length; i++) {
        this.deleteIds.push(msg[i]);
      }
    },
    //获取修改后的表格数据
    getFinalData(msg) {
      if (msg != null) {
        this.saveChange();
      }
      let innerLine = msg[0].lineNo;
      this.allCurtains.push(msg);
      //换掉的item赋值
      for (let i = 0; i < msg.length; i++) {
        msg[i].itemId = msg[i].item.itemNo;
      }
      for (let a = 0; a < this.allCurtains.length - 1; a++) {
        if (this.allCurtains[a][0].lineNo == innerLine) {
          this.allCurtains.splice(a, 1);
        }
      }
    },
    summitCurtain() {
      var item = this.ruleForm;
      let orderBody = item.ORDERBODY;
      let transCookies = [];
      for (let i = 0; i < orderBody.length; i++) {
        transCookies[i] = new Object();
        transCookies[i].width = orderBody[i].CURTAIN_WIDTH;
        transCookies[i].height = orderBody[i].CURTAIN_HEIGHT;
        transCookies[i].orderNumber = item.ORDER_NO;
        transCookies[i].lineNo = orderBody[i].LINE_NO;
        transCookies[i].activityId = orderBody[i].P_ID;
        transCookies[i].quantity = orderBody[i].QTY_REQUIRED;
        var price = 0;
        for (let j = 0; j < orderBody[i].curtains.length; j++) {
          price += orderBody[i].curtains[j].price.mul(
            orderBody[i].curtains[j].dosage
          );
        }
        transCookies[i].price = price;
        transCookies[i].splitShipment = orderBody[i].PART_SEND_ID;
        transCookies[i].activityName = orderBody[i].PROMOTION;
        transCookies[i].unit = orderBody[i].UNIT;
        transCookies[i].item = orderBody[i].item;
      }
      sessionStorage.setItem("shopping", JSON.stringify(transCookies));
      sessionStorage.setItem("shoppingHead", JSON.stringify(item));
      Cookies.set("cur_status", 3);
      Cookies.set("new_cur_status", 0);
      this.addTab("order/checkOrder");
      this.closeTab("order/checkExamine");
    },
    summitNewCurtain() {
      var item = this.ruleForm;
      let orderBody = item.ORDERBODY;
      let transCookies = [];
      for (let i = 0; i < orderBody.length; i++) {
        transCookies[i] = new Object();
        transCookies[i].width = orderBody[i].CURTAIN_WIDTH;
        transCookies[i].height = orderBody[i].CURTAIN_HEIGHT;
        transCookies[i].orderNumber = item.ORDER_NO;
        transCookies[i].lineNo = orderBody[i].LINE_NO;
        transCookies[i].activityId = orderBody[i].P_ID;
        transCookies[i].quantity = orderBody[i].QTY_REQUIRED;
        //重新计算价格
        var price = 0;
        for (let j = 0; j < orderBody[i].curtains.length; j++) {
          price += this.oneTotal(orderBody[i].curtains[j]);
        }
        transCookies[i].price = price;
        transCookies[i].splitShipment = orderBody[i].PART_SEND_ID;
        transCookies[i].activityName = orderBody[i].PROMOTION;
        transCookies[i].unit = orderBody[i].UNIT;
        transCookies[i].item = orderBody[i].item;
      }
      sessionStorage.setItem("shopping", JSON.stringify(transCookies));
      sessionStorage.setItem("shoppingHead", JSON.stringify(item));
      Cookies.set("cur_status", 3);
      Cookies.set("new_cur_status", 1);
      this.addTab("order/checkOrder");
      this.closeTab("order/checkExamine");
    },
    //一个子件的总价
    oneTotal(row) {
      var price = row.PRICE;
      //最小下单量 帘头1.帘身里衬，窗纱4
      var DOSAGE = row.DOSAGE;
      if (row.NC_PART_TYPECODE == 'LT' && DOSAGE < 1 && DOSAGE > 0) {
        DOSAGE = 1;
      } else if ((row.NC_PART_TYPECODE == 'LS' || row.NC_PART_TYPECODE == 'LCB' || row.NC_PART_TYPECODE == 'CS') && DOSAGE < 4 && DOSAGE > 0) {
        DOSAGE = 4;
      }
      price = price.mul(DOSAGE)
      return price;
    },
    //客户修改
    LjExamine() {
      updateCurtainOrder({
        cid: Cookies.get("cid"),
        orderNo: this.orderNum,
        curtainStatusId: "0",
        allCurtains: this.allCurtains,
        deleteIds: this.deleteIds,
      })
        .then((res) => {
          this.$alert("操作成功,请提交结算再次审核", "提示", {
            confirmButtonText: "确定",
            type: "success",
          });
          this.getDetail();
        })
        .catch((res) => {
          this.$alert("操作失败:" + res.msg, "提示", {
            confirmButtonText: "确定",
            type: "warning",
          });
        });
    },
    //确认兰居修改，通过订单审核变为可提交状态
    _pass() {
      this.$confirm("确认同意兰居修改？", "提示", {
        confirmButtonText: "是",
        cancelButtonText: "否",
        type: "info",
      }).then(() => {
        updateCurtainOrderStatus({
          cid: Cookies.get("cid"),
          orderNo: this.orderNum,
          curtainStatusId: "4",
        }).then((res) => {
          this.$alert("操作成功,该订单已经确认,可再次提交", "提示", {
            confirmButtonText: "确定",
            type: "success",
          }).then(() => {
            this.ruleForm.CURTAIN_STATUS_ID = '4'
          });
        }).catch((res) => {
          this.$alert("操作失败，请稍后重试", "提示", {
            confirmButtonText: "确定",
            type: "warning",
          });
        });
      });
    },
    //退回兰居修改
    _defeat() {
      this.$confirm("确定将订单退回兰居重新修改？", "提示", {
        confirmButtonText: "是",
        cancelButtonText: "否",
        type: "info",
      }).then(() => {
        updateCurtainOrderStatus({
          cid: Cookies.get("cid"),
          orderNo: this.orderNum,
          curtainStatusId: "3",
        }).then((res) => {
          this.$alert("操作成功,该订单已退回兰居修改", "提示", {
            confirmButtonText: "确定",
            type: "success",
          }).then(() => {
            this.closeToTab({
              oldUrl: "order/checkExamine",
              newUrl: "order/myOrder",
            });
          });
        })
          .catch((res) => {
            this.$alert("操作失败，请稍后重试", "提示", {
              confirmButtonText: "确定",
              type: "warning",
            });
          });
      });
    },
    openDialog(tab, index) {
      this.ljsuggestion = tab.LJ_SUGGESTION;
      this.tableIndex = index;
      this.cyLineNo = index + 1;
      this.detailVisible = true;
      for (let i = 0; i < tab.curtains.length; i++) {
        tab.curtains[i].choose = true;
        tab.curtains[i].productType = tab.curtains[i].item.productType;
        tab.curtains[i].itemType = tab.curtains[i].curtainPartName;
      }
      this.curtainData = tab.curtains;
      for (let i = 0; i < this.allCurtains.length; i++) {
        if (this.cyLineNo == this.allCurtains[i][0].lineNo) {
          this.curtainData = this.allCurtains[i];
        }
      }
      this.headerData.quantity = tab.QTY_REQUIRED;
      this.headerData.highJia = tab.CURTAIN_HEIGHT2;
      this.headerData.productGroupType = "";
      //this.headerData.price = tab.all_cost;
      if (tab.CURTAIN_WBH_SIZE == -1) {
        this.headerData.outsourcingBoxExist = 0;
      } else {
        this.headerData.outsourcingBoxExist = 1;
      }
      this.headerData.outsourcingBoxWidth = tab.CURTAIN_WBH_SIZE;
      this.headerData.modelNumber = tab.ITEM_NO;
      this.headerData.location = tab.CURTAIN_ROOM_NAME
        ? tab.CURTAIN_ROOM_NAME
        : "无";
      this.headerData.height = tab.CURTAIN_HEIGHT;
      this.headerData.width = tab.CURTAIN_WIDTH;
      this.headerData.drape = tab.CURTAIN_SIZE_TIMES;
      this.headerData.checked = "";
      this.headerData.cartItemId = "";
      this.headerData.activityGroupType = "";
      this.headerData.activity = tab.PROMOTION_TYPE;
      this.headerData.activityId = tab.curtains[0].activityId;
      this.headerData.activityName = tab.PROMOTION;
    },
    openNewCurtain(tab, index) {
      this.newCurtainDetailVisible = true;
      this.selectOrderDetail = tab;
      this.originDelete = [];
      if (this.deleteCurtainData && this.deleteCurtainData[index]) {
        for (var i = 0; i < this.deleteCurtainData[index].length; i++) {
          this.originDelete.push(this.deleteCurtainData[index][i].ID)
        }
      }
      this.tableIndex = index;
    },
    //保存修改
    saveChange() {
      this.ruleForm.ORDERBODY[this.tableIndex].checkStatus = "已修改";
      this.detailVisible = false;
    },
    getDetail() {
      getOrderDetails({ orderNo: this.orderNum }).then((res) => {
        this.ruleForm = res.data[0];
        if (this.ruleForm.CUSTOMER_CODE == "C01613" || this.ruleForm.CUSTOMER_CODE == "C01613A") {
          this.showExportProduct = true;
        }
        this.nowDate = new Date(new Date().setDate(new Date().getDate() - 2)).getTime();
        if (this.ruleForm.BUYUSER_PICTURE) {
          var list = this.ruleForm.BUYUSER_PICTURE.split(";");
          for (var i = 0; i < list.length - 1; i++) {
            var index = list[i].lastIndexOf("/");
            if (index == -1) index = list[i].lastIndexOf("\\");
            var fileName = list[i].substr(index + 1);
            this.fileList.push(this.Global.baseUrl + list[i]);
          }
        }
        for (let i = 0; i < this.ruleForm.ORDERBODY.length; i++) {
          this.$set(this.ruleForm.ORDERBODY[i], "checkStatus", "未修改");
        }
        var recordData = {
          orderNo: this.orderNum,
        };
        getOperationRecord(recordData).then((res2) => {
          this.operationRecords = res2.data;
        });
      });
    },
    //返回指定
    backTowhere() {
      let customerType = Cookies.get("customerType");
      if (customerType == 110) {
        this.addTab("order/examine");
        this.closeTab("order/checkExamine");
      } else {
        this.addTab("order/myOrder");
        this.closeTab("order/checkExamine");
      }
    },
    refreshPay() {
      settlementAgain({
        cid: Cookies.get("cid"),
        orderNo: this.orderNum,
      }).then((res) => {
        this.$alert("提交成功", "提示", {
          confirmButtonText: "确定",
          type: "success",
        });
        this.$root.$emit("refreshMoneyEvent"); //触发主页面刷新余额
        this.addTab("order/myOrder");
      }).catch((res) => {
        this.$alert("提交失败！" + res.msg, "提示", {
          confirmButtonText: "确定",
          type: "warning",
        });
      });
    },
    handleImgClick(index) {
      let tempImgList = [...this.fileList];
      let temp = [];
      for (let i = 0; i < index; i++) {
        temp.push(tempImgList.shift());
      }
      this.fileList2 = tempImgList.concat(temp);
      this.showViewer = true;
    },
    exportProductExcel() {
      this.$confirm(
        "此功能只适用于导出测试账号订单，导出模板后订单状态将变成已完成状态，请慎重操作，是否确认导出？",
        "提示",
        {
          confirmButtonText: "确定",
          type: "warning",
        }
      ).then(() => {
        if (this.isX) {
          ljExportProductExcel({
            cid: Cookies.get("cid"),
            orderNo: this.orderNum,
          }).then((res) => {
            if (res.msg) {
              downLoadFile(
                this.Global.baseUrl + `DownLoadAPI/DownloadFile?path=${res.msg}`
              );
              this.closeToTab({
                oldUrl: "order/checkExamine",
                newUrl: "order/examine",
              });
            }
          });
        } else if (this.isN) {
          newCurtainExportProductExcel({
            cid: Cookies.get("cid"),
            orderNo: this.orderNum,
          }).then((res) => {
            if (res.msg) {
              downLoadFile(
                this.Global.baseUrl + `DownLoadAPI/DownloadFile?path=${res.msg}`
              );
              this.closeToTab({
                oldUrl: "order/checkExamine",
                newUrl: "order/examine",
              });
            }
          });
        }
      }).catch(() => {
        return;
      });
    },
    resolveModify(data, deleteIds) {
      this.$set(this.ruleForm.ORDERBODY, this.tableIndex, data);
      this.deleteCurtainData[this.tableIndex] = deleteIds;
      this.newCurtainDetailVisible = false;
    },
    getCurtainData() {
      this.newCurtainData = [];
      this.deleteIds = [];
      for (var i = 0; i < this.ruleForm.ORDERBODY.length; i++) {
        var detail = this.ruleForm.ORDERBODY[i];
        for (var j = 0; j < detail.curtains.length; j++) {
          var oneCurtain = detail.curtains[j];
          if (oneCurtain.curtain_choose) {
            oneCurtain.ITEM_ID = oneCurtain.ITEM_NO;
            this.newCurtainData.push(JSON.parse(JSON.stringify(oneCurtain)))
          }
        }
      }
      for (var i = 0; i < this.deleteCurtainData.length; i++) {
        for (var j = 0; j < this.deleteCurtainData[i].length; j++) {
          this.deleteIds.push(this.deleteCurtainData[i][j]);
        }
      }

    },
    customerChange() {
      //拼接删除的数据
      this.getCurtainData();
      newCurtainUpdateCurtainOrder({
        cid: Cookies.get("cid"),
        curtainStatusId: "0",
        orderHead: this.ruleFormPost,
        orderDetails: this.orderDetailsPost,
        allCurtains: this.newCurtainData,
        deleteIds: this.deleteIds
      }).then((res) => {
        this.$alert("操作成功,请提交结算再次审核", "提示", {
          confirmButtonText: "确定",
          type: "success",
        });
        this.getDetail();
      }).catch((res) => {
        this.$alert("操作失败:" + res.msg, "提示", {
          confirmButtonText: "确定",
          type: "warning",
        });
      });
    },
    //合计行显示
    getSummaries({ columns, data }) {
      var sums = [];
      columns.forEach((column, index) => {
        if (index == 0) {
          sums[index] = "总计";
          return;
        } else if (index == 6 || index == 7 || index == 8 || index == 9) {
          var values = data.map((item) => Number(item[column.property]));
          var cancelIndex = data.map((item) => Number(item["STATUS_ID"])); //取得状态判断是否是作废的
          if (!values.every((value) => isNaN(value))) {
            sums[index] = values.reduce((prev, curr, index) => {
              const value = Number(curr);
              if (!isNaN(value) && cancelIndex[index] != "3") {
                //作废的不统计
                return prev + curr;
              } else {
                return prev;
              }
            }, 0);
            sums[index] = sums[index].toFixed(2);
            if (this.isManager == "0" && !this.isExamine)
              sums[index] = "***";
          } else {
            sums[index] = "";
          }
        } else {
          sums[index] = "";
        }
      });
      return sums;
    },
    //隔行变色
    tableRowClassName({ row, rowIndex }) {
      if (row.STATUS_ID == "3") {
        return "delete-row";
      }
      if (rowIndex % 2 == 0) {
        return "success-row";
      }
      return "";
    },
    ...mapMutations("navTabs", ["addTab"]),
    ...mapActions("navTabs", ["closeTab", "closeToTab"]),
  },
  created: function () {
    this.orderNum = Cookies.get("ORDER_NO");
    this.isX = this.orderNum.slice(0, 1) == "X";
    this.isN = this.orderNum.slice(0, 1) == "N";
    this.check_CURTAIN_STATUS_ID = Cookies.get("CURTAIN_STATUS_ID");
    this.getDetail();
    if (this.isShowButton != undefined) {
      this.button_1 = this.isShowButton;
    }
  },
  activated() {
    if (this.isShowButton != undefined) {
      this.orderNum = Cookies.get("ORDER_NO");
      this.isX = this.orderNum.slice(0, 1) == "X";
      this.isN = this.orderNum.slice(0, 1) == "N";
      this.check_CURTAIN_STATUS_ID = Cookies.get("CURTAIN_STATUS_ID");
      this.getDetail();
    }
  },
  destroyed() {
    Cookies.remove("isExamine");
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
.el-table .delete-row {
  background: #f0f9eb;
  color: tomato;
  text-decoration: line-through;
}
</style>