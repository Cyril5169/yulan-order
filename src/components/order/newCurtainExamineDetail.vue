<template>
  <el-card class="centerCard" shadow="hover">
    <div slot="header" :class="{fixHead:isFixed}">
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
    <div slot="header" v-if="isFixed">
      <div style="height:80px;width:100%;"></div>
    </div>
    <!-- 循环订单详情 -->
    <el-table border :data="ruleForm.ORDERBODY" :row-class-name="tableRowClassName" :expand-row-keys="expands"
      :row-key="getRowKeys">
      <el-table-column width="1" type="expand">
        <!-- 窗帘详情 -->
        <template slot-scope="scope">
          <div class="curtain-list">
            <el-table :data="scope.row.curtains" ref="curtainTable" class="curtain-table" border>
              <el-table-column label="部件" width="80" header-align="center" prop="NC_PART_TYPECODE">
                <template slot-scope="scope">
                  <!-- 树缩进 -->
                  <span v-if="scope.row.curtain_level > 0">
                    <span :style="{'padding-left': scope.row.curtain_level * 16 + 'px'}"></span>
                  </span>
                  <span :class="{'delete-cls': !scope.row.curtain_choose}"
                    :style="{'font-weight': scope.row.curtain_level==0?'bold':''}">{{transPartTypeCode(scope.row.NC_PART_TYPECODE)}}</span>
                </template>
              </el-table-column>
              <el-table-column label="编码" width="140" header-align="center" prop="ITEM_NO">
                <template slot-scope="scope">
                  <!-- 标定 -->
                  <template v-if="scope.row.ITEM_NO">
                    <!-- 是否可替换 -->
                    <a v-if="scope.row.NCT_CHANGE == 1 && scope.row.NCM_CHANGE == 1" class="a-link"
                      :class="{'delete-cls': !scope.row.curtain_choose}"
                      @click="exchangeModelOrItem(scope.row)">{{scope.row.ITEM_NO}}</a>
                    <span v-else :class="{'delete-cls': !scope.row.curtain_choose}">{{scope.row.ITEM_NO}}</span>
                    <!-- 是否可删/是否默认勾选 -->
                    <el-checkbox v-if="scope.row.NCT_DELETE > 0 && scope.row.NCM_DELETE > 0" v-model="scope.row.curtain_choose"
                      @change="onCheckChange($event, scope.row)"></el-checkbox>
                  </template>
                  <!-- 没有模板，非标定 -->
                  <template v-else-if="scope.row.curtain_level == 0">
                    <a class="a-link" :class="{'delete-cls': !scope.row.curtain_choose}"
                      @click="exchangeModelOrItem(scope.row)">请选择</a>
                    <el-checkbox v-model="scope.row.curtain_choose" @change="onCheckChange($event, scope.row)">
                    </el-checkbox>
                  </template>
                  <template v-else>
                    <span style="color:red;">未维护数据!</span>
                  </template>
                </template>
              </el-table-column>
            </el-table>
          </div>
        </template>
      </el-table-column>
      <el-table-column align="center" prop="LINE_NO" label="序号" width="40"></el-table-column>
      <el-table-column align="center" prop="ITEM_NO" label="款号" width="100"></el-table-column>
      <el-table-column align="center" prop="BRAND_NAME" label="品牌" width="90"></el-table-column>
      <el-table-column align="center" prop="TYPE_NAME" label="类型" width="90"></el-table-column>
      <el-table-column prop="PRODUCTION_VERSION" align="center" label="所属版本" width="90"></el-table-column>
      <el-table-column label="销售状态" align="center" width="90">
        <template slot-scope="scope">
          <span>{{ scope.row.SALE_ID | transSaleId }}</span>
        </template>
      </el-table-column>
      <el-table-column align="center" prop="CURTAIN_WIDTH" label="成品宽" width="80"></el-table-column>
      <el-table-column align="center" prop="CURTAIN_HEIGHT" label="成品高" width="80"></el-table-column>
      <el-table-column align="center" prop="CURTAIN_ROOM_NAME" label="位置" width="100"></el-table-column>
      <el-table-column align="center" prop="QTY_REQUIRED" label="套数" width="80"></el-table-column>
      <el-table-column prop="PROMOTION" align="center" label="活动" show-overflow-tooltip></el-table-column>
      <el-table-column label="总价" align="center" width="130">
        <template slot-scope="scope">
          <span>{{
                    (scope.row.UNIT_PRICE * scope.row.QTY_REQUIRED)
                      | dosageFilter
                  }}</span>
          <span v-if="dosageFilter(allTotal(scope.$index)) != scope.row.UNIT_PRICE"
            style="color:red;">({{allTotal(scope.$index) | dosageFilter}})</span>
        </template>
      </el-table-column>
      <el-table-column align="center" prop="NOTES" label="备注"></el-table-column>
    </el-table>
    <!-- 底部 -->
    <div style="float:right;margin-top:20px;height:80px;">
      <el-button @click="LanjuChange()" size="medium" type="danger">兰居修改</el-button>
      <el-button size="medium" type="warning" @click="_back()">退回修改</el-button>
      <el-button @click="_pass()" size="medium" type="success">通过审核</el-button>
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
      <span style="margin-left:10px;color:red;">法律效力：本订单是双方合作协议不可分割的一部分，是乙方向甲方订货的凭证，具法力效力。</span>
      <el-divider></el-divider>
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
</template>

<script>
import Cookies from "js-cookie";
import { mapActions } from "vuex";
import {
  getOrderDetails,
  updateCurtainOrder,
  getOperationRecord,
  getCustomerInfo,
} from "@/api/orderListASP";
import { GetPartTypeDataTabale } from "@/api/newCurtainASP";

export default {
  data() {
    return {
      orderNumber: '',
      customerType: Cookies.get("customerType"),
      cus_customerType: "",
      operationRecords: [],
      expands: [],
      ruleForm: {
        ORDER_NO: "",
        LINKPERSON: "",
        WL_CONTACTS: "",
        WL_TEL: "",
        POST_ADDRESS: "",
        NOTES: "",
        ORDERBODY: [],
      },
      isFixed: false,
    }
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
    },
    transSaleId(value) {
      switch (value) {
        case "A":
          return "销售";
          break;
        case "B":
          return "待淘汰";
          break;
        case "C":
          return "淘汰";
          break;
        case "D":
          return "内留";
          break;
        case "E":
          return "外留";
          break;
        case "F":
          return "永久淘汰";
          break;
      }
    },
    meshutie_filter(value) {
      switch (value) {
        case "ZC":
          return "正车";
          break;
        case "FC":
          return "反车";
          break;
        default:
          return value;
          break;
      }
    },
    kaikou_filter(value) {
      switch (value) {
        case "TK":
          return "对开";
          break;
        case "DK":
          return "单开";
          break;
        case "SK":
          return "特殊开";
          break;
        default:
          return value;
          break;
      }
    },
    operation_filter(value) {
      switch (value) {
        case "GDZ":
          return "固定褶";
          break;
        case "DQ":
          return "打圈";
          break;
        default:
          return value;
          break;
      }
    },
    bian_filter(value) {
      switch (value) {
        case "4B":
          return "4S边";
          break;
        case "3B":
          return "3.0边";
          break;
        default:
          return value;
          break;
      }
    },
    makeType_filter(value) {
      switch (value) {
        case "01":
          return "定宽制作";
          break;
        case "02":
          return "定高制作";
          break;
      }
    },
    joint_filter(value) {
      switch (value) {
        case "SP":
          return "竖拼接";
          break;
        case "HP":
          return "横拼接";
          break;
      }
    },
  },
  methods: {
    ...mapActions("navTabs", ["closeToTab"]),
    //PartType字典
    getPartTypeData() {
      GetPartTypeDataTabale().then((res) => {
        this.curtainPartTypeData = res.data;
      });
    },
    //PartType字典Filter
    transPartTypeCode(val) {
      var name = val;
      var typeCode = this.curtainPartTypeData.filter((item) => item.NC_PART_TYPECODE == val);
      if (typeCode.length) {
        name = typeCode[0].NC_PART_NAME;
      }
      return name;
    },
    allTotal() {

    },
    getRowKeys(row) {
      return row.LINE_NO;
    },
    getCustomer() {
      var data = {
        cid: this.ruleForm.CUSTOMER_CODE,
        companyId: this.ruleForm.CUSTOMER_CODE,
      };
      getCustomerInfo(data, { loading: false }).then((res) => {
        this.cus_customerType = res.data.CUSTOMER_TYPE;
      });
    },
    getDetail() {
      getOrderDetails({ orderNo: this.orderNumber }).then((res) => {
        this.ruleForm = res.data[0];
        this.getCustomer();
        for (let i = 0; i < this.ruleForm.ORDERBODY.length; i++) {
          this.ruleForm.ORDERBODY[i].checkStatus = "未修改";
          this.expands.push(this.ruleForm.ORDERBODY[i].LINE_NO);
        }
        this.dealCurtainData();
        getOperationRecord({ orderNo: this.orderNumber }, { loading: false }).then((res) => {
          this.operationRecords = res.data;
        });
      });
    },
    dealCurtainData() {
      for (var i = 0; i < this.ruleForm.ORDERBODY.length; i++) {
        var detail = this.ruleForm.ORDERBODY[i];
        for (var j = 0; j < detail.curtains.length; j++) {
          var oneCurtain = detail.curtains[j];
          //窗帘层级
          var level = 0;
          var NCM_PID = oneCurtain.NCM_PID;
          while (NCM_PID != 0) {
            var temp = detail.curtains.filter((item) => item.NC_MODEL_ID == NCM_PID);
            if (temp.length) {
              NCM_PID = temp[0].NCM_PID;
              level++;
            }
          }
          this.$set(detail.curtains[j], "curtain_level", level);
          //选中标识(这里既然有那肯定都是选中的)
          this.$set(detail.curtains[j], "curtain_choose", true);
          //库存
          this.$set(detail.curtains[j], "curtain_store", "");
        }
      }
    },
    //根据客户类型获取价格
    getPrice(type, item) {
      var price = 0;
      //只有第一级需要计算价格
      if (item && item.curtain_level == 0) {
        if (type == "02" || type == "08" || type == "10") {
          //经销
          price = item.PRICE_SALE;
        } else if (type == "05") {
          price = item.SALE_PRICE;
        } else if (type == "06") {
          price = item.PRICE_FX;
        } else if (type == "09") {
          price = item.PRICE_HOME;
        }
      }
      return price;
    },
    //隔行变色
    tableRowClassName({ row, rowIndex }) {
      return "success-row";
    },
    handleScroll() {
      this.$nextTick(() => {
        let main = document.getElementById("mainBackTop");
        let scrollTop = main.scrollTop;
        if (scrollTop > 110) {
          this.isFixed = true;
        } else {
          this.isFixed = false;
        }
      });
    },
  },
  mounted() {
    this.orderNumber = Cookies.get("NEW_ORDER_NO");
    this.getPartTypeData();
    this.getDetail();

    window.addEventListener("scroll", this.handleScroll, true);
  },
  destroyed() {
    window.removeEventListener("scroll", this.handleScroll, true);
  },
}
</script>

<style scoped>
.centerCard {
  margin: 0 auto;
  position: relative;
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
.fixHead {
  position: fixed;
  top: 81px;
  z-index: 100;
  background: white;
  width: 100%;
}
.a-link {
  text-decoration: underline;
}
.a-userset {
  color: #409eff;
  background: 0 0;
  text-decoration: none;
  outline: 0;
  transition: color 0.2s ease;
}
.delete-cls {
  color: tomato;
  text-decoration: line-through;
  cursor: unset;
}
.manufacturing-ct {
  margin-bottom: 0;
}
.no-data {
  width: 100%;
  height: 500px;
  text-align: center;
  line-height: 500px;
  font-size: 20px;
}
.model-exchange-list {
  position: relative;
  width: 100%;
  height: calc(100% - 30px);
  overflow-x: hidden;
  overflow-y: auto;
}
.model-exchange-list-ct {
  position: absolute;
}
.model-exchange-ct {
  display: inline-block;
  padding: 5px;
  margin: 5px 10px;
  background: #eee;
  cursor: pointer;
  box-sizing: border-box;
}
.model-exchange-ct:hover {
  border: 1px solid #409eff;
}
.model-exchange-now {
  background: #409eff;
}
.model-exchange-now:hover {
  border: none;
}
.model-exchange-inner {
  background-color: white;
  display: flex;
  position: relative;
}
.default-model-label {
  padding: 2px;
  background-color: #8bc34a;
  color: white;
  font-size: 12px;
  text-align: center;
  writing-mode: tb;
}
.index-badge {
  position: absolute;
  left: 1px;
  top: 3px;
}
.item-exchange-list {
  position: relative;
  width: 100%;
  height: calc(100% - 90px);
  overflow-x: hidden;
  overflow-y: auto;
}
.item-exchange-list-ct {
  position: absolute;
}
.item-exchange-ct {
  padding: 8px 10px 0 10px;
  margin: 5px;
  border-radius: 3px;
  height: 32px;
  border: 1px solid #dcdfe6;
  display: inline-block;
  cursor: pointer;
}
.item-exchange-ct:hover {
  border: 1px solid #000;
}
.item-exchange-now {
  background: #409eff;
}
.item-exchange-now:hover {
  border: 1px solid #dcdfe6;
}
.default-item-label {
  padding: 2px;
  background-color: #8bc34a;
  color: white;
  font-size: 12px;
  text-align: center;
}
</style>

<style>
.centerCard .el-icon-arrow-right:before {
  content: "";
}
.curtain-list .el-table td,
.curtain-list .el-table th {
  padding: 1px !important;
}
.curtain-list .el-input__inner {
  padding: 0 5px;
  height: 20px;
}
.index-badge .el-badge__content {
  background: gray;
}
</style>
