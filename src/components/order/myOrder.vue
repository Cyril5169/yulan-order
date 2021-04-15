<template>
  <el-card class="centerCard">
    <div>
      <el-tabs style="display:inline-block;width:580px;" v-model="activeName" @tab-click="handleClick">
        <el-tab-pane label="待处理" name="pending"></el-tab-pane>
        <el-tab-pane label="窗帘审核订单" name="LJPending"></el-tab-pane>
        <el-tab-pane label="生效订单" name="YLPending"></el-tab-pane>
        <el-tab-pane label="已作废" name="invalid"></el-tab-pane>
        <el-tab-pane label="全部订单" name="allOrder"></el-tab-pane>
      </el-tabs>
      <a target="_blank" style="float:right;" href="http://www.luxlano.com/ddkc/">玉兰·兰居尚品->订单及库存查询</a>
    </div>

    <div>
      <el-date-picker type="date" format="yyyy-MM-dd" value-format="yyyy-MM-dd" placeholder="日期区间" v-model="date1"
        style="width:12%;"></el-date-picker>&nbsp;至
      <el-date-picker type="date" format="yyyy-MM-dd" value-format="yyyy-MM-dd" placeholder="日期区间" v-model="date2"
        style="width:12%;"></el-date-picker>
      <el-select style="width:150px;" v-model="commodityType" placeholder="请选择商品类型">
        <el-option v-for="item in commodityTypeOptions" :key="item.value" :label="item.label" :value="item.value">
        </el-option>
      </el-select>
      <el-select style="width:160px;" v-model="orderStatus" placeholder="请选择审核状态">
        <el-option v-for="item in options" :key="item.value" :label="item.label" :value="item.value"></el-option>
      </el-select>
      <el-input @keyup.enter.native="search()" placeholder="订单号,型号,购买人,联系方式" v-model="find" style="width:310px;">
        <el-button @click="search()" slot="append" icon="el-icon-search">搜索</el-button>
      </el-input>
    </div>
    <div id="outDiv">
      <el-card style="position:relative;" v-for="(item, index) of data" :key="index">
        <div slot="header">
          <span class="zoomLeft">时间：</span>
          <span class="zoomRight">{{ item.DATE_CRE }}</span>
          <span class="zoomLeft">订单号：</span>
          <span class="zoomRight">{{ item.ORDER_NO }}</span>
          <span class="zoomLeft">状态：</span>
          <span style="color:#8BC34A;font-weight:bold;" class="zoomRight">{{ item.STATUS_ID | transStatus
            }}{{ item.CURTAIN_STATUS_ID | curtainStatus }}</span>
          <el-tooltip v-if="item.STATUS_ID == 5 || item.STATUS_ID == 6 || item.STATUS_ID == 0 
            || (item.STATUS_ID == 1 && item.CURTAIN_STATUS_ID !== '' && item.CURTAIN_STATUS_ID == 0)" class="item" effect="dark"
            content="作废订单" placement="top">
            <i style="float:right;cursor: pointer;" class="el-icon-delete" @click="deleteOrder(item.ORDER_NO)"></i>
          </el-tooltip>
          <el-tooltip v-if="item.ORDER_NO.slice(0, 1) == 'X' || item.ORDER_NO.slice(0, 1) == 'N'" class="item" effect="dark"
            content="复制数据到购物车" placement="top">
            <i style="float:right;cursor: pointer;" class="el-icon-sell" @click="copyCart(item.ORDER_NO)"></i>
          </el-tooltip>
          <a v-if="
              ((item.STATUS_ID == 1 &&
                (item.CURTAIN_STATUS_ID == '' ||
                  item.CURTAIN_STATUS_ID == 4)) ||
                item.STATUS_ID == 2 ||
                item.STATUS_ID == 4 ||
                item.STATUS_ID == 7 ||
                item.STATUS_ID == 12) &&
                (item.ORDER_NO.slice(0, 1) == 'X' ||
                item.ORDER_NO.slice(0, 1) == 'N' ||
                  item.ORDER_NO.slice(0, 1) == 'Y')
            " target="_blank" style="float:right;font-size:13px;" :href="
              'http://www.luxlano.com/ddkc/DD_bjl.asp?b2b=' + item.ORDER_NO
            ">兰居尚品订单进度查询</a>
        </div>

        <div class="outDiv" style="float:left;width:90%">
          <el-table border :data="data[index].ORDERBODY" style="width: 100%;margin-bottom:5px;"
            :row-class-name="tableRowClassName">
            <el-table-column prop="ITEM_NO" label="型号" align="center" width="150"></el-table-column>
            <el-table-column prop="BRAND_NAME" label="品牌" align="center" width="150"></el-table-column>
            <el-table-column prop="PRODUCTVERSION_NAME" label="版本" align="center" width="150"></el-table-column>
            <el-table-column prop="TYPE_NAME" label="类型" align="center" width="120">
              <template slot-scope="scope1">
                <span v-if="scope1.row.TYPE_NAME == '帘头'">定制窗帘</span>
                <span v-else>{{ scope1.row.TYPE_NAME }}</span>
              </template>
            </el-table-column>
            <el-table-column label="数量（宽x高）" align="center" width="120">
              <template slot-scope="scope1">
                <span v-if="scope1.row.UNIT == '平方米'">{{ scope1.row.CURTAIN_WIDTH }}×{{
                    scope1.row.CURTAIN_HEIGHT
                  }}={{ scope1.row.QTY_REQUIRED }}</span>
                <span v-else>{{ scope1.row.QTY_REQUIRED }}</span>
              </template>
            </el-table-column>
            <el-table-column prop="UNIT" label="单位" align="center">
            </el-table-column>
            <el-table-column label="实际单价" align="center">
              <template slot-scope="scope1">
                <span v-if="isManager === '0'">***</span>
                <span v-else>{{
                  (scope1.row.FINAL_COST / scope1.row.QTY_REQUIRED)
                    | priceFilter
                }}</span>
              </template>
            </el-table-column>
            <el-table-column label="应付金额" align="center">
              <template slot-scope="scope1">
                <span v-if="isManager === '0'">***</span>
                <span v-else>{{ scope1.row.FINAL_COST }}</span>
                <!-- <span v-else>{{scope1.row.UNIT_PRICE*scope1.row.QTY_REQUIRED | priceFilter}}</span> -->
              </template>
            </el-table-column>
            <el-table-column width="150" align="center" label="出货详情">
              <template slot-scope="scope">
                <el-button :disabled="scope.row.packDetailId == 0 ? true : false" @click="shipmentDetail(scope.row)"
                  type="primary" size="mini">查看详情</el-button>
                <!-- :disabled="scope.row.packDetailId==0?true:false" -->
              </template>
            </el-table-column>
          </el-table>
        </div>
        <div class="buttonDiv">
          <p style="width:100px; font-size:18px; color:tomato; text-align:center;">
            {{ item.status }}
          </p>
          <p v-if="
                  (item.CURTAIN_STATUS_ID == 0 ||
                    item.CURTAIN_STATUS_ID == 4) &&
                    item.STATUS_ID == 0 && item.ORDER_NO.slice(0, 1) == 'X'">
            <el-button @click="summitCurtain(item)" size="medium" type="primary" plain>提交订单</el-button>
          </p>
          <p v-if="
                  (item.CURTAIN_STATUS_ID == 0 ||
                    item.CURTAIN_STATUS_ID == 4) &&
                    item.STATUS_ID == 0 && item.ORDER_NO.slice(0, 1) == 'N'">
            <el-button @click="summitNewCurtain(item)" size="medium" type="primary" plain>提交订单</el-button>
          </p>
          <p v-if="item.STATUS_ID == 5 || item.STATUS_ID == 6" @click="refreshPay(item)">
            <el-button size="medium" type="danger" plain>提交订单</el-button>
          </p>
          <p>
            <el-button @click="toCheckExamine(
                    item.ORDER_NO,
                    item.CURTAIN_STATUS_ID,
                    item.STATUS_ID)" size="medium" type="success">订单详情</el-button>
          </p>
        </div>
      </el-card>
      <div style="margin:0 25%;" class="block">
        <el-pagination @size-change="handleSizeChange" @current-change="handleCurrentChange" :current-page.sync="currentPage"
          :page-sizes="[5, 10, 15, 20]" :page-size="limit" layout="total,sizes, prev, pager, next, jumper" :total="count">
        </el-pagination>
      </div>
    </div>
    <el-dialog :show-close="true" :visible.sync="shipmentVisible" width="1100px" title="出货详情">
      <keep-alive>
        <shipment v-if="shipmentVisible" :orderNo="shipmentOrderNo" :itemNo="shipmentItemNo" :lineNo="shipmentLineNo"
          :PRODUCT="shipmentNote" :UNIT="shipmentUnit"></shipment>
      </keep-alive>
    </el-dialog>
  </el-card>
</template>

<script>
import {
  getAllOrders,
  InsertOperationRecord,
  cancelOrderNew,
  copyCartItem,
  GetPromotionByType,
  GetPromotionByTypeAndId,
  GetOrderUseRebate,
  settlementAgain
} from "@/api/orderListASP";
import { mapMutations, mapActions } from "vuex";
import Cookies from "js-cookie";
import shipment from "./shipment";

export default {
  name: "MyOrder",
  data() {
    return {
      isManager: Cookies.get("isManager"),
      data: [],
      date1: "",
      date2: "",
      find: "",
      commodityType: "",
      orderStatus: "",
      state_id: "",
      activeName: "pending",
      limit: 5,
      count: 0,
      currentPage: 1,
      Initial_balance: 0,
      buttonShow: true,
      shipmentVisible: false,
      shipmentOrderNo: "",
      shipmentItemNo: "",
      shipmentLineNo: "",
      shipmentNote: "",
      shipmentUnit: "",
      statusIdOptionValue1: ["0", "5", "6", "21", "22"],
      commodityTypeOptions: [
        {
          label: "墙纸配套类",
          value: "W",
        },
        {
          label: "窗帘",
          value: "X",
        },
        {
          label: "软装",
          value: "Y",
        },
        {
          label: "新窗帘",
          value: "N",
        },
      ],
      options: [
        {
          label: "待提交",
          value: "0",
        },
        {
          label: "余额不足待提交",
          value: "5",
        },
        {
          label: "余额不足可提交",
          value: "6",
        },
        {
          label: "待确认",
          value: "22",
        },
        {
          label: "待修改",
          value: "21",
        },
      ],
      options1: [
        {
          label: "待提交",
          value: "0",
        },
        {
          label: "余额不足待提交",
          value: "5",
        },
        {
          label: "余额不足可提交",
          value: "6",
        },
        {
          label: "待确认",
          value: "22",
        },
        {
          label: "待修改",
          value: "21",
        },
      ],
      options2: [
        {
          label: "待审核",
          value: "20",
        },
        {
          label: "兰居待修改",
          value: "23",
        },
      ],
      options3: [
        {
          label: "已提交",
          value: "1",
        },
        {
          label: "已接收",
          value: "12",
        },
        {
          label: "已受理",
          value: "2",
        },
        {
          label: "部分发货",
          value: "4",
        },
        {
          label: "已完成",
          value: "7",
        },
      ],
      options4: [
        {
          label: "已作废",
          value: "3",
        },
      ],
      options5: [
        {
          label: "待提交",
          value: "0",
        },
        {
          label: "余额不足待提交",
          value: "5",
        },
        {
          label: "余额不足可提交",
          value: "6",
        },
        {
          label: "待确认",
          value: "22",
        },
        {
          label: "待修改",
          value: "21",
        },
        {
          label: "待审核",
          value: "20",
        },
        {
          label: "兰居待修改",
          value: "23",
        },
        {
          label: "已提交",
          value: "1",
        },
        {
          label: "已接收",
          value: "12",
        },
        {
          label: "已受理",
          value: "2",
        },
        {
          label: "部分发货",
          value: "4",
        },
        {
          label: "已完成",
          value: "7",
        },
        {
          label: "已作废",
          value: "3",
        },
      ],
    };
  },
  components: { shipment },
  filters: {
    transStatus(value) {
      switch (value) {
        case "0":
          return "待提交";
          break;
        case "1":
          return "已提交";
          break;
        case "12":
          return "已接收";
          break;
        case "2":
          return "已受理";
          break;
        case "3":
          return "已作废";
          break;
        case "4":
          return "部分发货";
          break;
        case "5":
          return "余额不足待提交";
          break;
        case "6":
          return "余额不足可提交";
          break;
        case "7":
          return "已完成";
          break;
      }
    },
    curtainStatus(value) {
      switch (value) {
        case "0":
          return "待审核";
          break;
        case "1":
          return "待修改";
          break;
        case "2":
          return "待确认";
          break;
        case "3":
          return "兰居待修改";
          break;
        case "4":
          return "已通过";
          break;
      }
    },
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
  methods: {
    ...mapMutations("navTabs", ["addTab"]),
    ...mapActions("navTabs", ["closeTab", "closeToTab"]),
    //窗帘提交订单
    summitCurtain(item) {
      let orderBody = item.ORDERBODY;
      let transCookies = [];
      for (let i = 0; i < orderBody.length; i++) {
        transCookies[i] = new Object();
        transCookies[i].width = orderBody[i].CURTAIN_WIDTH;
        transCookies[i].height = orderBody[i].CURTAIN_HEIGHT;
        transCookies[i].orderNumber = item.ORDER_NO;
        transCookies[i].lineNo = orderBody[i].LINE_NO;
        transCookies[i].activityId = orderBody[i].curtains[0].activityId;
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
    },
    summitNewCurtain(item) {
      let orderBody = item.ORDERBODY;
      let transCookies = [];
      for (let i = 0; i < orderBody.length; i++) {
        transCookies[i] = new Object();
        transCookies[i].width = orderBody[i].CURTAIN_WIDTH;
        transCookies[i].height = orderBody[i].CURTAIN_HEIGHT;
        transCookies[i].orderNumber = item.ORDER_NO;
        transCookies[i].lineNo = orderBody[i].LINE_NO;
        transCookies[i].activityId = orderBody[i].curtains[0].activityId;
        transCookies[i].quantity = orderBody[i].QTY_REQUIRED;
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
    },
    //一个子件的总价
    oneTotal(row) {
      var price = row.PRICE;
      //最小下单量 帘头1.帘身里衬，窗纱4
      var DOSAGE = row.DOSAGE;
      if (row.NC_PART_TYPECODE == 'LT' && DOSAGE < 1) {
        DOSAGE = 1;
      } else if ((row.NC_PART_TYPECODE == 'LS' || row.NC_PART_TYPECODE == 'LCB' || row.NC_PART_TYPECODE == 'CS') && DOSAGE < 4) {
        DOSAGE = 4;
      }
      price = price.mul(DOSAGE)
      return price;
    },
    //查看审核
    toCheckExamine(value, ID, status) {
      Cookies.set("ORDER_NO", value);
      Cookies.set("CURTAIN_STATUS_ID", ID);
      Cookies.set("status_ID", status);
      Cookies.set("isExamine", "false");
      this.addTab("order/checkExamine");
    },
    //订单获取
    refresh() {
      //新后台
      this.data = [];
      var data = {
        companyId: Cookies.get("companyId"),
        limit: this.limit,
        page: this.currentPage,
        cid: Cookies.get("cid"),
        statusId: this.orderStatus || this.statusIdOptionValue1,
        find: this.find,
        beginTime: this.date1,
        finishTime: this.date2,
        orderType: this.commodityType,
      };
      if (!data.beginTime) {
        data.beginTime = "0001/1/1";
      }
      if (!data.finishTime) {
        data.finishTime = "9999/12/31";
      } else {
        data.finishTime = data.finishTime + " 23:59:59";
      }
      getAllOrders(data).then((res) => {
        this.count = res.count;
        this.data = res.data;
        this.$root.$emit("refreshBadgeIcon", "orderDeal");
      });
    },
    //出货详情
    shipmentDetail(tab) {
      this.shipmentOrderNo = tab.ORDER_NO;
      this.shipmentLineNo = tab.LINE_NO;
      this.shipmentItemNo = tab.ITEM_NO;
      this.shipmentNote = tab.TYEPE_NAME;
      this.shipmentUnit = tab.UNIT;
      this.shipmentVisible = true;
    },
    //标签页切换
    handleClick(tab) {
      var tabName = tab.name;
      this.orderStatus = "";
      this.commodityType = "";
      this.currentPage = 1;
      switch (tabName) {
        case "pending":
          this.options = this.options1;
          this.statusIdOptionValue1 = ["0", "5", "6", "21", "22"];
          break;
        case "LJPending":
          this.options = this.options2;
          this.statusIdOptionValue1 = ["20", "23"];
          break;
        case "YLPending":
          this.options = this.options3;
          this.statusIdOptionValue1 = ["1", "2", "4", "7", "12"];
          break;
        case "invalid":
          this.options = this.options4;
          this.statusIdOptionValue1 = ["3"];
          break;
        case "allOrder":
          this.options = this.options5;
          this.statusIdOptionValue1 = [];
          break;
      }
      this.refresh();
    },
    //搜索
    search() {
      this.currentPage = 1;
      this.refresh();
    },
    //页面条数
    handleSizeChange(val) {
      this.limit = val;
      this.currentPage = 1;
      this.refresh();
    },
    //翻页获取订单
    handleCurrentChange(val) {
      this.currentPage = val;
      this.refresh();
    },
    //删除订单
    deleteOrder(pushOrderNum) {
      this.$confirm("确定作废订单？", "提示", {
        confirmButtonText: "是",
        cancelButtonText: "否",
        type: "warning",
      }).then(() => {
        cancelOrderNew({
          cid: Cookies.get("cid"),
          orderNo: pushOrderNum,
        }).then((res) => {
          if (pushOrderNum.slice(0, 1) == "X" || pushOrderNum.slice(0, 1) == "N") {
            this.$confirm("作废成功，是否复制数据到购物车？", "提示", {
              confirmButtonText: "是",
              cancelButtonText: "否",
              type: "warning",
            }).then(() => {
              var data3 = {
                orderNo: pushOrderNum,
              };
              copyCartItem(data3).then((res) => {
                this.$alert("复制成功，请到购物车中查看", "提示", {
                  confirmButtonText: "确定",
                  type: "success",
                });
                if (pushOrderNum.slice(0, 1) == "X")
                  this.$root.$emit("refreshBadgeIcon", "curtainCount");
                else if (pushOrderNum.slice(0, 1) == "N") {
                  this.$root.$emit("refreshBadgeIcon", "newCurtainCount");
                }
              });
            }).catch(() => { });
          } else {
            this.$alert("作废成功", "提示", {
              confirmButtonText: "确定",
              type: "success",
            });
          }
          this.refresh();
          this.$root.$emit("refreshMoneyEvent"); //触发主页面刷新余额
        }).catch((res) => {
          this.$alert("删除失败,请刷新订单", "提示", {
            confirmButtonText: "确定",
            type: "success",
          });
        });
        //预留接口-删除订单
      }).catch((err) => { });
    },
    copyCart(orderNo) {
      this.$confirm("是否复制数据到购物车？", "提示", {
        confirmButtonText: "是",
        cancelButtonText: "否",
        type: "warning",
      }).then(() => {
        var data = {
          orderNo: orderNo,
        };
        copyCartItem(data).then((res) => {
          this.$alert("复制成功，请到购物车中查看", "提示", {
            confirmButtonText: "确定",
            type: "success",
          });
          if (orderNo.slice(0, 1) == "X")
            this.$root.$emit("refreshBadgeIcon", "curtainCount");
          else if (orderNo.slice(0, 1) == "N") {
            this.$root.$emit("refreshBadgeIcon", "newCurtainCount");
          }
        });
      }).catch(() => { });
    },
    refreshPay(item) {
      settlementAgain({
        cid: Cookies.get("cid"),
        orderNo: item.ORDER_NO,
      }).then((res) => {
        this.$alert("提交成功", "提示", {
          confirmButtonText: "确定",
          type: "success",
        });
        this.refresh();
        this.$root.$emit("refreshMoneyEvent"); //触发主页面刷新余额
      })
        .catch((res) => {
          this.$alert("提交失败！" + res.msg, "提示", {
            confirmButtonText: "确定",
            type: "warning",
          });
        });
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
  },
  activated() {
    this.refresh();
  },
};
</script>

<style scoped>
.centerCard {
  margin: 0 auto;
  position: relative;
}
.zoomLeft {
  font-size: 15px;
}
p {
  font-size: 13px;
  margin: 2px;
}
.buttonDiv {
  float: right;
  margin-right: 15px;
  width: 8%;
  /* position: absolute;
  top: 50%;
  left: 90%;
  width: 8%; */
}
.zoomRight {
  font-weight: 400;
  font-size: 15px;
  margin-right: 10px;
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
#outDiv .el-card__header {
  padding: 12px 20px;
  background-color: rgb(245, 245, 245);
}
#outDiv .el-card__body {
  padding: 5px 10px;
}
#outDiv .el-card {
  margin-top: 5px;
  border: 1px solid rgb(140, 214, 198);
}
</style>