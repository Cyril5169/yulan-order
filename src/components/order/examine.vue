<template>
  <el-card class="centerCard">
    <div>
      <el-tabs
        style="display:inline-block;width:900px;"
        v-model="activeName"
        @tab-click="handleClick"
      >
        <el-tab-pane label="待处理的订单" name="unCheck"></el-tab-pane>
        <el-tab-pane label="待客户处理的订单" name="customCheck"></el-tab-pane>
        <el-tab-pane label="审核过的订单" name="checked"></el-tab-pane>
        <el-tab-pane label="全部订单" name="allOrder"></el-tab-pane>
      </el-tabs>
      <a
        target="_blank"
        style="float:right;"
        href="http://www.luxlano.com/ddkc/"
        >玉兰·兰居尚品->订单及库存查询</a
      >
    </div>
    <div>
      <el-date-picker
        type="date"
        format="yyyy-MM-dd"
        value-format="yyyy-MM-dd"
        placeholder="日期区间"
        v-model="date1"
        style="width:14%;"
      ></el-date-picker
      >&nbsp;--
      <el-date-picker
        type="date"
        format="yyyy-MM-dd"
        value-format="yyyy-MM-dd"
        placeholder="日期区间"
        v-model="date2"
        style="width:14%;"
      ></el-date-picker>
      <el-select v-model="orderType" placeholder="请选择审核状态">
        <el-option
          v-for="item in options"
          :key="item.value"
          :label="item.label"
          :value="item.value"
        ></el-option>
      </el-select>
      <el-input
        @keyup.enter.native="search()"
        placeholder="请输入订单号或客户名称"
        v-model="find"
        style="width:300px;"
      >
        <el-button @click="search()" slot="append" icon="el-icon-search"
          >搜索</el-button
        >
      </el-input>
    </div>
    <div id="outDiv">
      <el-card
        style="position:relative;"
        v-for="(item, index) of data"
        :key="index"
      >
        <div slot="header">
          <i
            style="float: right;color:#20a0ff;line-height: 35px;cursor: pointer;"
            class="el-icon-caret-bottom"
            @click="collapseClick($event, item.ORDER_NO)"
          ></i>

          <a
            v-if="
              (item.STATUS_ID == 1 &&
                (item.CURTAIN_STATUS_ID == '' ||
                  item.CURTAIN_STATUS_ID == 4)) ||
                item.STATUS_ID == 2 ||
                item.STATUS_ID == 4 ||
                item.STATUS_ID == 7 ||
                item.STATUS_ID == 12
            "
            target="_blank"
            style="float:right;cursor: pointer;font-size:13px;line-height: 35px;margin-right:10px;"
            :href="
              'http://www.luxlano.com/ddkc/DDrs2.asp?DDid=' + item.ORDER_NO
            "
            >兰居订单查询</a
          >
          <el-button
            :id="'cardBtnDetail' + item.ORDER_NO"
            style="float: right;margin-right:20px;"
            @click="toCheckExamine(item.ORDER_NO)"
            size="mini"
            type="primary"
            plain
            >订单详情</el-button
          >
          <el-button
            :id="'cardBtnCheck' + item.ORDER_NO"
            style="float: right;margin-right:10px;"
            v-if="
              (item.CURTAIN_STATUS_ID == '0' && item.STATUS_ID == '1') ||
                item.CURTAIN_STATUS_ID == '3'
            "
            @click="toExamineDetail(item.ORDER_NO)"
            size="mini"
            type="success"
            plain
            >审核订单</el-button
          >
          <span class="zoomLeft">时间：</span>
          <span class="zoomRight">{{ item.DATE_CRE }}</span>
          <span class="zoomLeft">订单号：</span>
          <span class="zoomRight">{{ item.ORDER_NO }}</span>
          <span class="zoomLeft">窗帘状态：</span>
          <span style="color:#8BC34A;font-weight:bold;" class="zoomRight">{{
            item.CURTAIN_STATUS_ID | curtainStatus
          }}</span>
          <span class="zoomLeft">订单状态：</span>
          <span style="color:#8BC34A;font-weight:bold;" class="zoomRight">{{
            item.STATUS_ID | transStatus
          }}</span>
          <br />
          <span class="zoomLeft">客户名称：</span>
          <span class="zoomRight">{{ item.REALNAME || item.realName }}</span>
          <span class="zoomLeft">联系人：</span>
          <span class="zoomRight">{{ item.LINKPERSON }}</span>
          <span class="zoomLeft">电话：</span>
          <span class="zoomRight">{{ item.TELEPHONE }}</span>
          <span class="zoomLeft">地址：</span>
          <span class="zoomRight">{{ item.ALL_ADDRESS }}</span>
        </div>
        <div :id="'cardBody' + item.ORDER_NO" class="collapseHive">
          <div class="outDiv" style="float:left;width:90%">
            <el-table
              border
              :data="data[index].ORDERBODY"
              style="width: 100%;margin-bottom:5px;"
              :row-class-name="tableRowClassName"
            >
              <el-table-column
                prop="ITEM_NO"
                label="型号"
                align="center"
              ></el-table-column>
              <el-table-column
                prop="BRAND_NAME"
                label="品牌"
                align="center"
              ></el-table-column>
              <el-table-column prop="NOTE" label="类型" align="center">
                <template slot-scope="scope1">
                  <span v-if="scope1.row.NOTE == '帘头'">定制窗帘</span>
                  <span v-else>{{ scope1.row.NOTE }}</span>
                </template>
              </el-table-column>
              <el-table-column label="数量" align="center">
                <template slot-scope="scope1">
                  <span>{{ scope1.row.QTY_REQUIRED }}</span>
                </template>
              </el-table-column>
              <el-table-column label="商品单价" align="center">
                <template slot-scope="scope1">
                  <span>{{ scope1.row.UNIT_PRICE }}</span>
                </template>
              </el-table-column>
              <el-table-column label="商品总价" align="center">
                <template slot-scope="scope1">
                  <span>{{
                    (scope1.row.UNIT_PRICE * scope1.row.QTY_REQUIRED)
                      | dosageFilter
                  }}</span>
                </template>
              </el-table-column>
            </el-table>
          </div>
          <div class="buttonDiv">
            <p
              style="width:100px; font-size:18px; color:tomato; text-align:center;"
            >
              {{ item.status }}
            </p>
            <p>
              <el-button
                v-if="
                  (item.CURTAIN_STATUS_ID == '0' && item.STATUS_ID == '1') ||
                    item.CURTAIN_STATUS_ID == '3'
                "
                @click="toExamineDetail(item.ORDER_NO)"
                size="medium"
                type="success"
                plain
                >审核订单</el-button
              >
            </p>
            <p>
              <el-button
                @click="toCheckExamine(item.ORDER_NO)"
                size="medium"
                type="primary"
                plain
                >订单详情</el-button
              >
            </p>
          </div>
        </div>
      </el-card>
      <!-- <div v-if="data.length == 0" style="text-align:center;margin:20px 0;">
        {{ waitText }}
      </div> -->
      <div style="margin:0 25%;" class="block">
        <el-pagination
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
          :current-page.sync="currentPage"
          :page-sizes="[20, 50, 100, 1000]"
          :page-size="limit"
          layout="total, sizes, prev, pager, next, jumper"
          :total="count"
        ></el-pagination>
      </div>
    </div>
  </el-card>
</template>

<script>
import { getOrderlist, getExamineOrder } from "@/api/orderList";
import { getCurtainOrders } from "@/api/orderListASP";
import { cancelOrder } from "@/api/orderList";
import { mapMutations, mapActions } from "vuex";
import { mapState } from "vuex";
import Cookies from "js-cookie";

export default {
  name: "examine",
  data() {
    return {
      data: [],
      date1: "",
      date2: "",
      find: "",
      orderType: "",
      state_id: "",
      activeName: "unCheck",
      limit: 100,
      count: 0,
      currentPage: 1,
      buttonShow: true,
      isAll: false,
      orderBy:'',
      canOptionValue: ["0", "3"],
      options: [
        {
          label: "待审核",
          value: "0"
        },
        {
          label: "兰居待修改",
          value: "3"
        }
      ],
      options1: [
        {
          label: "待审核",
          value: "0"
        },
        {
          label: "兰居待修改",
          value: "3"
        }
      ],
      options2: [
        {
          label: "客户待修改",
          value: "1"
        },
        {
          label: "客户待确认",
          value: "2"
        },
        {
          label: "客户待提交",
          value: "8"
        }
      ],
      options3: [
        {
          label: "已通过",
          value: "4"
        }
      ],
      options4: [
        {
          label: "待审核",
          value: "0"
        },
        {
          label: "客户待修改",
          value: "1"
        },
        {
          label: "客户待确认",
          value: "2"
        },
        {
          label: "兰居待修改",
          value: "3"
        },
        {
          label: "已通过",
          value: "4"
        }
      ],
      waitText: "加载中。。。"
    };
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
          return "客户待修改";
          break;
        case "2":
          return "客户待确认";
          break;
        case "3":
          return "兰居待修改";
          break;
        case "4":
          return "已通过";
          break;
      }
    }
  },
  methods: {
    //订单详情
    toExamineDetail(val) {
      Cookies.set("ORDER_NO", val);
      //console.log(Cookies.get("ORDER_NO"));
      this.addTab("order/examineDetailNew");
    },
    toCheckExamine(val) {
      Cookies.set("ORDER_NO", val);
      Cookies.set("CURTAIN_STATUS_ID", -1);
      Cookies.set("status_ID", -2);
      this.addTab("order/checkExamine");
    },
    //[新]获取审核订单
    // getorderList() {
    //   let url = "/order/gatAllCurOrders.do";
    //   let data = {
    //     limit: this.orderType?this.limit:100000,
    //     page: this.orderType?this.currentPage:1,
    //     find: this.find,
    //     beginTime: this.date1,
    //     finishTime: this.date2,
    //     curtainStatusId: this.orderType
    //   };
    //   if (data.beginTime == "") {
    //     data.beginTime = "0001/1/1";
    //   }
    //   if (data.finishTime == "") {
    //     data.finishTime = "9999/12/31";
    //   } else {
    //     data.finishTime = data.finishTime + " 23:59:59";
    //   }
    //   getOrderlist(url,data).then(res => {
    //     //不改后台的情况下筛选不同页签的数据
    //     var allData = res.data;
    //     var filter = [];
    //     switch(this.activeName)
    //     {
    //       case "unCheck":
    //            filter  = allData.filter(item =>item.CURTAIN_STATUS_ID =='0'||item.CURTAIN_STATUS_ID=='3');
    //            break;
    //            case "customCheck":
    //              filter  = allData.filter(item =>item.CURTAIN_STATUS_ID =='1'||item.CURTAIN_STATUS_ID=='2');
    //              break;
    //              case "checked":
    //             filter  = allData.filter(item =>item.CURTAIN_STATUS_ID =='4');
    //              break;
    //     }
    //     this.count = filter.length;
    //     this.data = [];
    //     this.data = filter.slice(this.currentPage*5 -5,this.currentPage *5);
    //   });
    // },
    getorderList() {
      let data = {
        limit: this.limit,
        page: this.currentPage,
        find: this.find,
        beginTime: this.date1,
        finishTime: this.date2,
        curtainStatusId: this.orderType || this.canOptionValue,
        isAll: this.isAll,
        orderBy : this.orderBy
      };
      if (!data.beginTime) {
        data.beginTime = "0001/1/1";
      }
      if (!data.finishTime) {
        data.finishTime = "9999/12/31";
      } else {
        data.finishTime = data.finishTime + " 23:59:59";
      }
      //新后台
      getCurtainOrders(data).then(res => {
        this.count = res.count;
        this.data = [];
        this.data = res.data;
      });
    },
    //标签页切换
    handleClick(tab) {
      var tabName = tab.name;
      this.state_id = tabName;
      this.currentPage = 1;
      this.orderType = "";
      switch (tabName) {
        case "unCheck":
          this.options = this.options1;
          this.canOptionValue = ["0", "3"];
          this.isAll = false;
          this.orderBy = '';
          break;
        case "customCheck":
          this.options = this.options2;
          this.canOptionValue = ["1", "2", "8"];
          this.isAll = false;
          this.orderBy = ' DESC';
          break;
        case "checked":
          this.options = this.options3;
          this.canOptionValue = ["4"];
          this.isAll = false;
          this.orderBy = ' DESC';
          break;
        case "allOrder":
          this.options = this.options4;
          //this.canOptionValue = ["0","1", "2", "3","4"];
          this.canOptionValue = [];
          this.isAll = true;
          this.orderBy = ' DESC';
          break;
      }
      this.getorderList();
    },
    //搜索
    search() {
      this.currentPage = 1;
      this.getorderList();
    },
    //页面条数
    handleSizeChange(val) {
      this.limit = val;
      this.currentPage = 1;
      this.getorderList();
    },
    //翻页获取订单
    handleCurrentChange(val) {
      this.currentPage = val;
      this.getorderList();
    },
    ...mapMutations("navTabs", ["addTab"]),
    ...mapActions("navTabs", ["closeTab", "closeToTab"]),
    //隔行变色
    tableRowClassName({ row, rowIndex }) {
      if (rowIndex % 2 == 0) {
        return "success-row";
      }
      return "";
    },
    collapseClick: function(event, data) {
      if (event.target.className == "el-icon-caret-top")
        event.target.setAttribute("class", "el-icon-caret-bottom");
      else event.target.setAttribute("class", "el-icon-caret-top");

      let div = document.getElementById("cardBody" + data);
      if (div.className == "collapseHive") div.removeAttribute("class");
      else div.setAttribute("class", "collapseHive");

      let btnDetail = document.getElementById("cardBtnDetail" + data);
      if (btnDetail) {
        if (btnDetail.className.indexOf("collapseHive") > -1)
          btnDetail.classList.remove("collapseHive");
        else btnDetail.classList.add("collapseHive");
      }

      let btnCheck = document.getElementById("cardBtnCheck" + data);
      if (btnCheck) {
        if (btnCheck.className.indexOf("collapseHive") > -1)
          btnCheck.classList.remove("collapseHive");
        else btnCheck.classList.add("collapseHive");
      }
    }
  },
  //生命周期
  created() {
    this.getorderList();
    //console.log(Cookies.get("cid"));
  },
  activated: function() {
    this.getorderList();
  }
};
</script>

<style scoped>
.centerCard {
  margin: 0 auto;
  position: relative;
}
.centerCard .el-card__body {
  padding: 0px;
}
/* .childCard{
    width: 40%;
    float: left;
} */
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
.collapseHive {
  display: none;
}
</style>
<style>
.el-table .success-row {
  background: #f0f9eb;
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