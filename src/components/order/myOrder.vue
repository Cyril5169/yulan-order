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
        <template v-for="item in commodityTypeOptions">
          <el-option v-if="isContainAttr(item.attr)" :key="item.value" :label="getAttrMenu(item.attr).MENU_NAME"
            :value="item.value">
          </el-option>
        </template>
      </el-select>
      <el-select style="width:160px;" v-model="orderStatus" placeholder="请选择审核状态">
        <el-option v-for="item in options" :key="item.value" :label="item.label" :value="item.value"></el-option>
      </el-select>
      <el-input @keyup.enter.native="search()" placeholder="订单号,型号,购买人,联系方式" v-model="find" style="width:310px;">
        <el-button @click="search()" slot="append" icon="el-icon-search">搜索</el-button>
      </el-input>
    </div>
    <div class="outDiv">
      <el-card style="position:relative;" v-for="(item, index) of orderList" :key="index">
        <div slot="header">
          <span class="zoomLeft">时间：</span>
          <span class="zoomRight">{{ item.DATE_CRE }}</span>
          <span class="zoomLeft">订单号：</span>
          <span class="zoomRight">{{ item.ORDER_NO }}</span>
          <span class="zoomLeft">状态：</span>
          <span style="color:#8BC34A;font-weight:bold;" class="zoomRight">{{ item.STATUS_ID | transStatus
            }}{{ item.CURTAIN_STATUS_ID | curtainStatus }}</span>
          <countdown style="color:red;" v-if="item.STATUS_ID != 3 && (item.CURTAIN_STATUS_ID == 1 || item.CURTAIN_STATUS_ID == 2)"
            :time="new Date(item.DATE_UPDATE).getTime() - nowDate" format="DD 天 HH 时 mm 分 ss 秒后自动作废" />
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

        <div style="float:left;width:90%">
          <el-table border :data="orderList[index].ORDERBODY" style="width: 100%;margin-bottom:5px;"
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
              </template>
            </el-table-column>
          </el-table>
        </div>
        <div class="buttonDiv">
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
            <el-button @click="toCheckExamine(item.ORDER_NO, item.CURTAIN_STATUS_ID)" size="medium" type="success">订单详情
            </el-button>
          </p>
          <p>
            <el-button v-if="item.STATUS_ID == 7" @click="toUploadPicture(item)" size="medium" type="primary">上墙附件
            </el-button>
          </p>
        </div>
      </el-card>
      <div style="margin:0 25%;" class="block">
        <el-pagination @size-change="handleSizeChange" @current-change="handleCurrentChange" :current-page.sync="currentPage"
          :page-sizes="[5, 10, 15, 20]" :page-size="limit" layout="total,sizes, prev, pager, next, jumper" :total="count">
        </el-pagination>
      </div>
    </div>
    <!-- 出货详情 -->
    <el-dialog :visible.sync="shipmentVisible" width="1200px" title="出货详情">
      <keep-alive>
        <shipment v-if="shipmentVisible" :orderDetail="selectOrderDetail"></shipment>
      </keep-alive>
    </el-dialog>
    <!-- 上墙附件 -->
    <el-dialog :visible.sync="fileVisible" width="600px"
      :title="'上墙附件' + (selectOrder.YULAN_CONFIRM == '1'? '-审核通过' : '')">
      <div>
        <el-upload class="upload-de" :class="{'hideUploadBtn': selectOrder.YULAN_CONFIRM == '1' }" multiple action="#"
          list-type="picture-card" :http-request="handleUpload" :on-change="handleChange" :on-preview="handlePictureCardPreview"
          :before-remove="beforeRemove" :on-remove="handleRemove" :before-upload="beforeAvatarUpload" :file-list="fileList">
          <i class="el-icon-plus"></i>
        </el-upload>
      </div>
    </el-dialog>
    <!-- 查看大图 -->
    <el-dialog :visible.sync="dialogImageVisible">
      <img width="100%" :src="dialogImageUrl" />
    </el-dialog>
  </el-card>
</template>

<script>
import {
  getAllOrders,
  GetOrderDetailCurtains,
  InsertOperationRecord,
  cancelOrderNew,
  copyCartItem,
  GetPromotionByType,
  GetPromotionByTypeAndId,
  settlementAgain,
  DeleteFileByPath,
  UploadUpWallFiles,
  UpdateModel
} from "@/api/orderListASP";
import { mapMutations, mapActions, mapState } from "vuex";
import Cookies from "js-cookie";
import shipment from "./shipment";
import countdown from "./count-down";

export default {
  name: "MyOrder",
  data() {
    return {
      isManager: Cookies.get("isManager"),
      orderList: [],
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
      selectOrderDetail: {},
      statusIdOptionValue1: ["0", "5", "6", "21", "22"],
      commodityTypeOptions: [
        {
          label: "墙纸配套类",
          value: "W",
          attr: 'shoppingCar/shopping?wallPaper'
        },
        {
          label: "窗帘",
          value: "X",
          attr: 'shoppingCar/shopping?curtain'
        },
        {
          label: "软装",
          value: "Y",
          attr: 'shoppingCar/shopping?softSuit'
        },
        {
          label: "新窗帘",
          value: "N",
          attr: 'shoppingCar/shopping?newCurtain'
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
      nowDate: 0,
      selectOrder: {},
      fileList: [],
      fileVisible: false,
      dialogImageVisible: false,
      dialogImageUrl: '',
      removeByAuto: false
    };
  },
  components: {
    shipment,
    countdown
  },
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
      var realVal = parseFloat(value).toFixed(2);
      //防止出现-0.00；
      if (realVal <= 0) {
        realVal = 0.0;
      }

      return realVal;
    },
  },
  computed: {
    ...mapState("navTabs", ["menuTreeListFlatten"]),
  },
  methods: {
    ...mapMutations("navTabs", ["addTab"]),
    ...mapActions("navTabs", ["closeTab", "closeToTab"]),
    isContainAttr(attr) {
      //是否包含权限
      return this.menuTreeListFlatten.filter(item => item.MENU_LINK == attr).length > 0;
    },
    getAttrMenu(attr) {
      var menu = {};
      var hasMenu = this.menuTreeListFlatten.filter(item => item.MENU_LINK == attr);
      if (hasMenu.length) {
        menu = hasMenu[0];
      }
      return menu;
    },
    //窗帘提交订单
    summitCurtain(item) {
      var orderBody = item.ORDERBODY;
      var transCookies = [];
      //查询窗帘原价
      GetOrderDetailCurtains({
        orderNo: item.ORDER_NO,
        lineNo: 0
      }).then(res => {
        for (var i = 0; i < orderBody.length; i++) {
          transCookies[i] = new Object();
          transCookies[i].width = orderBody[i].CURTAIN_WIDTH;
          transCookies[i].height = orderBody[i].CURTAIN_HEIGHT;
          transCookies[i].orderNumber = item.ORDER_NO;
          transCookies[i].lineNo = orderBody[i].LINE_NO;
          transCookies[i].activityId = orderBody[i].P_ID;
          transCookies[i].quantity = orderBody[i].QTY_REQUIRED;
          var price = 0;
          //获取原价
          for (var j = 0; j < res.data[i].curtains.length; j++) {
            price += res.data[i].curtains[j].PRICE.mul(res.data[i].curtains[j].DOSAGE);
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
      })
    },
    summitNewCurtain(item) {
      var orderBody = item.ORDERBODY;
      var transCookies = [];
      //查询窗帘原价
      GetOrderDetailCurtains({
        orderNo: item.ORDER_NO,
        lineNo: 0
      }).then(res => {
        for (var i = 0; i < orderBody.length; i++) {
          transCookies[i] = new Object();
          transCookies[i].width = orderBody[i].CURTAIN_WIDTH;
          transCookies[i].height = orderBody[i].CURTAIN_HEIGHT;
          transCookies[i].orderNumber = item.ORDER_NO;
          transCookies[i].lineNo = orderBody[i].LINE_NO;
          transCookies[i].activityId = orderBody[i].P_ID;
          transCookies[i].quantity = orderBody[i].QTY_REQUIRED;
          var price = 0;
          //获取原价
          for (var j = 0; j < res.data[i].curtains.length; j++) {
            price += this.oneTotal(res.data[i].curtains[j]);
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
      })
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
    //查看审核
    toCheckExamine(value, ID) {
      Cookies.set("ORDER_NO", value);
      Cookies.set("CURTAIN_STATUS_ID", ID);
      Cookies.set("isExamine", "false");
      this.addTab("order/checkExamine");
    },
    //订单获取
    refresh() {
      //新后台
      this.orderList = [];
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
        this.orderList = res.data;
        if (this.activeName == "pending")
          this.$root.$emit("refreshBadgeIcon", "orderDeal");
        this.nowDate = new Date(new Date().setDate(new Date().getDate() - 2)).getTime();
      });
    },
    //出货详情
    shipmentDetail(tab) {
      this.selectOrderDetail = tab;
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
        copyCartItem({ orderNo: orderNo }).then((res) => {
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
    toUploadPicture(item) {
      this.selectOrder = item;
      this.fileList = [];
      if (item.BUYUSER_PICTURE1) {
        var list = item.BUYUSER_PICTURE1.split(";");
        for (var i = 0; i < list.length - 1; i++) {
          var index = list[i].lastIndexOf("/");
          if (index == -1) index = list[i].lastIndexOf("\\");
          var fileName = list[i].substr(index + 1);
          this.fileList.push({
            name: fileName,
            url: this.Global.baseUrl + list[i],
          });
        }
      }
      this.fileVisible = true;
    },
    beforeAvatarUpload(file) {
      this.removeByAuto = false;
      if (this.selectOrder.YULAN_CONFIRM == '1') {
        this.$alert("已审核通过！", "提示", {
          confirmButtonText: "确定",
          type: "warning",
        });
        this.removeByAuto = true;
        return false;
      }
      let types = ["image/jpeg", "image/gif", "image/bmp", "image/png"];
      const isJPG = types.includes(file.type);
      if (!isJPG) {
        this.$message.error("上传头像图片只能是图片格式!");
      }
      return isJPG;
    },
    handleUpload(param) {
      const formData = new FormData();
      formData.append("file", param.file);
      UploadUpWallFiles(formData, {
        params: {
          cid: Cookies.get("cid")
        }
      }).then(res => {
        this.fileList.push({
          name: res.data,
          url: this.Global.baseUrl + "/Files/UpWall/" + Cookies.get("cid") + "/" + res.data
        })
        //上传成功更新order
        if (!this.selectOrder.BUYUSER_PICTURE) this.selectOrder.BUYUSER_PICTURE = "";

        var row = JSON.parse(JSON.stringify(this.selectOrder));
        row += "/Files/UpWall/" + Cookies.get("cid") + "/" + res.data + ";";
        row.UpdateColumns = ["BUYUSER_PICTURE1"];
        UpdateModel(row).then(res => {
          this.$message({
            message: "上传成功!",
            type: "success",
            duration: 1000
          });
          this.selectOrder.BUYUSER_PICTURE1 += "/Files/UpWall/" + Cookies.get("cid") + "/" + res.data + ";";
        })
      })
    },
    handleChange(file, fileList) {
      //this.fileList = fileList;
    },
    beforeRemove(file, fileList) {
      if(this.removeByAuto) return true;
      if (this.selectOrder.YULAN_CONFIRM == '1') {
        this.$alert("已审核通过！", "提示", {
          confirmButtonText: "确定",
          type: "warning",
        });
        return false;
      }
      return this.$confirm("确定删除吗", "提示", {
        confirmButtonText: "是",
        cancelButtonText: "否",
        type: "warning",
      })
    },
    handleRemove(file, fileList) {
      DeleteFileByPath({
        path: "/Files/UpWall/" + Cookies.get("cid") + "/" + file.name
      }).then(res => {
        this.fileList = fileList;
        //删除成功更新order
        var temPath
        for (var i = 0; i < this.fileList.length; i++) {
          temPath += "/Files/UpWall/" + Cookies.get("cid") + "/" + this.fileList[i].name + ";";
        }
        var row = JSON.parse(JSON.stringify(this.selectOrder));
        row.BUYUSER_PICTURE1 = temPath;
        row.UpdateColumns = ["BUYUSER_PICTURE1"];
        UpdateModel(row).then(res => {
          this.$message({
            message: "删除成功!",
            type: "success",
            duration: 1000
          });
          this.selectOrder.BUYUSER_PICTURE1 = temPath;
        })
      })
    },
    handlePictureCardPreview(file) {
      this.dialogImageUrl = file.url;
      this.dialogImageVisible = true;
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
.outDiv .el-card__header {
  padding: 12px 20px;
  background-color: rgb(245, 245, 245);
}
.outDiv .el-card__body {
  padding: 5px 10px;
}
.outDiv .el-card {
  margin-top: 5px;
  border: 1px solid rgb(140, 214, 198);
}
.upload-de .el-upload--picture-card {
  width: 70px;
  height: 70px;
  line-height: 80px;
}
.upload-de .el-upload-list--picture-card .el-upload-list__item {
  width: 70px;
  height: 70px;
  line-height: 70px;
  margin-right: 8px;
}
.upload-de .el-upload-list__item {
  transition: none !important;
}
.hideUploadBtn .el-upload--picture-card {
  display: none;
}
</style>