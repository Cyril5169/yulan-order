<template>
  <div id="shopTabCon">
    <el-table :data="tableData" :row-key="getRowKeys" :expand-row-keys="expands" @expand-change="expandChange"
      style="min-width: 750px; margin: 5px auto;">
      <el-table-column label="型号" prop="ITEM_NO" width="150" align="center">
      </el-table-column>
      <el-table-column label="名称" prop="NOTE" width="140" align="center">
        <template slot-scope="scope">
          <span v-if="scope.row.NOTE">{{ scope.row.NOTE }}</span>
          <span v-else>--</span>
        </template>
      </el-table-column>
      <el-table-column label="规格尺寸" width="120" align="center">
        <template slot-scope="scope">
          <span v-if="scope.row.FIX_TYPE === '01'">
            <span v-if="scope.row.RZ_GRADE">
              定宽
              {{scope.row.FIX_GRADE/1000 + (scope.row.UNIT_NAME?scope.row.UNIT_NAME:'米')}}
            </span>
            <span v-else>
              定宽
            </span>
          </span>
          <span v-else-if="scope.row.FIX_TYPE === '02'">
            <span v-if="scope.row.RZ_GRADE">
              定高
              {{scope.row.FIX_GRADE/1000 + (scope.row.UNIT_NAME?scope.row.UNIT_NAME:'米')}}
            </span>
            <span v-else>
              定高
            </span>
          </span>
          <span v-else-if="scope.row.RZ_GRADE">
            {{ scope.row.RZ_GRADE }}
          </span>
          <span v-else>--</span>
        </template>
      </el-table-column>
      <el-table-column v-if="minimumPurchaseShow" label="起购数量" prop="MINIMUM_PURCHASE" width="80" align="center">
      </el-table-column>
      <el-table-column width="200" label="数量" align="center">
        <template slot-scope="scope">
          <div v-if="scope.row.UNIT_NAME === '平方米'" align="center">
            <span class="num-font">宽</span>
            <currency-input :customStyle="'width: 60px;'" v-model.number="numberList[scope.$index].value">
            </currency-input>
            ×
            <span class="num-font">高</span>
            <currency-input :customStyle="'width: 60px;'" v-model="numberList[scope.$index].value1">
            </currency-input>
          </div>
          <div v-else>
            <currency-input :customStyle="'width: 80px;'" v-model.number="numberList[scope.$index].value">
            </currency-input>
          </div>
        </template>
      </el-table-column>
      <el-table-column label="单位" width="80" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.UNIT_NAME ? scope.row.UNIT_NAME : "米" }}</span>
        </template>
      </el-table-column>
      <el-table-column width="100px" label="操作" align="center">
        <template slot-scope="scope">
          <a class="mr10" @click="seeStore(scope)">
            查看库存
          </a>
          <iframe v-if="scope.row.ITEM_NO == currentItemNo" :src="storeUrl(scope.row.ITEM_NO)" style="display:none;"
            frameborder="0"></iframe>
        </template>
      </el-table-column>
      <el-table-column width="100px;" type="expand">
        <template slot-scope="scope">
          <el-form label-position="left" class="loading-area">
            <el-form-item label="活动：">
              <el-select style="width:300px;" :disabled="disableFlag" v-model="seletedActivity" :placeholder="
                  disableFlag === false ? '请选择一个活动' : '此产品不参与活动'
                ">
                <el-option v-for="item in activity" :label="item.label" :key="item.value" :value="item.value">
                </el-option>
              </el-select>
            </el-form-item>
            <el-form-item label="备注：">
              <div class="dib rel" style="width: 55%;">
                <el-input resize="none" type="textarea" placeholder="请输入您的备注信息（50字内）" maxlength="50"
                  :autosize="{ minRows: 3, maxRows: 6 }" v-model="remark">
                </el-input>
                <i class="el-icon-edit" style="position:absolute;
                                        right:10px;bottom:5px;">
                </i>
              </div>
              <span style="margin-left:10px;">{{ remark ? remark.length : 0 }}/50</span>
            </el-form-item>
            <el-form-item class="tc">
              <el-button style="width: 130px;" type="danger" @click="saveToShoppingCar(scope.row, scope.$index)">加入购物车
              </el-button>
              <el-button style="width: 130px;" type="info" @click="expandChange(scope)">取消</el-button>
            </el-form-item>
          </el-form>
        </template>
      </el-table-column>
    </el-table>

    <el-dialog border title="库存查询" :visible.sync="dialogTableVisible" width="550px">
      <el-table id="storeTable" :data="produceStore" :row-style="rowClass">
        <el-table-column property="header" min-width="30%"></el-table-column>
        <el-table-column property="body" style="width: 70%;"></el-table-column>
      </el-table>
      <div slot="footer">
        <el-button type="success" plain @click="dialogTableVisible = false">关 闭</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { findItemActivity } from "@/api/findActivity";
import { checkStore } from "@/api/searchStore";
import { addShoppingCar } from "@/api/shop";
import { GetPromotionByItem } from "@/api/orderListASP";
import Axios from "axios";
import Cookies from "js-cookie";

export default {
  name: "shopTab",
  data() {
    return {
      cid: Cookies.get("cid"), //客户ID
      customerType: Cookies.get("customerType"), //客户类型
      activity: [], //活动
      seletedActivity: "", //选择的活动
      remark: "", //备注
      expands: [], //展开行type的数组
      produceStore: [
        {
          header: "类别",
          body: "面料",
        },
        {
          header: "编号",
          body: "MLGB",
        },
        {
          header: "尺寸",
          body: "1.4",
        },
        {
          header: "库存信息",
          body: "查询中...",
        },
      ],
      storeMsg: [], //储存当前页面的库存信息
      dialogTableVisible: false,
      disableFlag: false, //判断是否禁用选择框
      minimumPurchaseShow: false,
      currentItemNo: "",
    };
  },
  props: ["tableData", "numberList"],
  filters: {
    calLength(str) {
      var len = 0;
      for (var i = 0; i < str.length; i++) {
        var c = str.charCodeAt(i);
        //单字节加1
        if ((c >= 0x0001 && c <= 0x007e) || (0xff60 <= c && c <= 0xff9f)) {
          len++;
        } else {
          len += 2;
        }
      }
      return len;
    },
  },
  methods: {
    //给库存表格切换不同的颜色
    rowClass(row, index) {
      if (row.rowIndex % 2 === 0) {
        return;
      } else {
        return { background: "rgba(225, 255, 229, 1)" };
      }
    },
    //清空值
    clearMsg() {
      this.activity = [];
      this.seletedActivity = "";
      this.remark = "";
      this.minimumPurchaseShow = false;
    },
    //获取row的key值
    getRowKeys(row) {
      return row.ITEM_NO;
    },
    storeUrl(IID) {
      return `http://www.luxlano.com/ddkc/ecqueryItemStock.asp?IID=${IID}`;
    },
    //展开行
    expandChange(row) {
      this.clearMsg();
      if (row.ITEM_NO === undefined) {
        this.expands = [];
        return;
      }
      row.MINIMUM_PURCHASE == 0
        ? (this.minimumPurchaseShow = false)
        : (this.minimumPurchaseShow = true);
      //findItemActivity({
      GetPromotionByItem({
        cid: this.cid,
        customerType: this.customerType,
        itemNo: row.ITEM_NO,
        itemVersion: row.ITEM_VERSION,
        productType: row.PRODUCT_TYPE,
        productBrand: row.PRODUCT_BRAND,
      })
        .then((res) => {
          if (res.data.length === 0) {
            this.disableFlag = true;
          } else {
            this.disableFlag = false;
          }
          var defaultSel = {
            pri: 0,
            id: 0,
          };
          for (var i = 0; i < res.data.length; i++) {
            var obj = {
              label: res.data[i].ORDER_TYPE + " -- " + res.data[i].ORDER_NAME,
              value: res.data[i].P_ID,
            };
            if (res.data[i].PRIORITY != 0 && defaultSel.pri == 0) {
              defaultSel.pri = res.data[i].PRIORITY;
              defaultSel.id = res.data[i].P_ID;
            } else if (
              res.data[i].PRIORITY != 0 &&
              defaultSel.pri > res.data[i].PRIORITY
            ) {
              defaultSel.pri = res.data[i].PRIORITY;
              defaultSel.id = res.data[i].P_ID;
            }
            this.activity.push(obj);
          }
          if (defaultSel.pri != 0) {
            this.seletedActivity = defaultSel.id;
          }
          this.activity.push({
            label: "不参与活动",
            value: null,
          });
        })
        .catch((err) => {
          console.log(err);
        });
      let temp = this.expands;
      this.expands = [];
      this.expands.push(row.ITEM_NO);
      if (temp.length === 1 && temp[0] === row.ITEM_NO) {
        // 收起展开行
        this.expands = [];
      }
    },
    //保存到购物车
    saveToShoppingCar(row, index) {
      //库存判断,判断成功才可以添加
      let val;
      if (row.UNIT_NAME === "平方米") {
        val = this.numberList[index].value * this.numberList[index].value1;
      } else {
        val = this.numberList[index].value;
      }
      if (val === "0" || val === 0) {
        this.$alert("数量不能为空", "提示", {
          type: "warning",
          confirmButtonText: "确定",
        });
        return;
      }
      //判断起购数量
      if (row.MINIMUM_PURCHASE != 0 && val < row.MINIMUM_PURCHASE) {
        this.$alert(
          "本产品最小起购数量为" + row.MINIMUM_PURCHASE + row.UNIT_NAME,
          "提示",
          {
            type: "warning",
            confirmButtonText: "确定",
          }
        );
        return;
      }
      //判断数字合理性
      //面料、花边保留一位小数
      //其余都是整数
      let _type = Cookies.get("activeNameSoftSuit");
      let re = /^[1-9]\d*$/;
      if (_type === "ML" || _type === "XHB") {
        re = /^[0-9]+(.[0-9]{1})?$/;
      }
      if (re.test(val) === false) {
        this.$alert("数量栏请填写正确的数字", "提示", {
          type: "warning",
          confirmButtonText: "确定",
        });
        return;
      }
      if (this.seletedActivity === "" && this.disableFlag === false) {
        this.$alert("请选择一个活动", "提示", {
          type: "warning",
          confirmButtonText: "确定",
        });
        return;
      }
      let storeMessage = "-1";
      if (this.seletedActivity === null || this.seletedActivity === undefined)
        this.seletedActivity = "";
      this.numberList[index].value = this.numberList[index].value.toString();
      this.numberList[index].value1 = this.numberList[index].value1.toString();
      addShoppingCar({
        customer_type: this.customerType,
        CID: this.cid,
        itemNO: row.ITEM_NO,
        commodityType: "soft",
        activityID: this.seletedActivity,
        quantity: row.UNIT_NAME == "平方米" ? "" : this.numberList[index].value,
        height: row.UNIT_NAME == "平方米" ? this.numberList[index].value1 : "",
        width: row.UNIT_NAME == "平方米" ? this.numberList[index].value : "",
        note: this.remark,
        splitShipment: storeMessage,
        softType: _type,
      })
        .then((res) => {
          this.numberList[index].value = "";
          this.numberList[index].value1 = "";
          this.expands = [];
          this.clearMsg();
          if (res.data.code === 0) {
            this.$alert("此型号已添加成功，请前往购物车查看", "添加成功", {
              confirmButtonText: "确定",
              type: "success",
            });
            this.$root.$emit("refreshBadgeIcon", "softCount");
          } else {
            var msg = res.data.msg;
            if (msg == "该产品正在上架，暂时不能加入购物车") {
              msg =
                "没有维护" +
                this.getPriceTip() +
                "价格，暂时不能加入购物车，请联系玉兰订单部";
            }
            this.$alert(msg, "添加失败", {
              confirmButtonText: "确定",
              type: "warning",
            });
          }
        })
        .catch((err) => {
          this.numberList[index].value = "";
          this.numberList[index].value1 = "";
          this.expands = [];
          this.clearMsg();
          this.$alert(
            "添加失败，请查看信息填写是否正确或者检查网络是否通畅",
            "提示",
            {
              confirmButtonText: "确定",
              type: "warning",
            }
          );
          console.log(err);
        });
    },
    getPriceTip() {
      switch (this.customerType) {
        case "02":
        case "08":
        case "10":
          return "经销";
        case "05":
          return "零售";
        case "06":
          return "分销";
        case "09":
          return "家装";
        default:
          return "";
      }
    },
    //查看该商品的库存
    seeStore(scope) {
      this.currentItemNo = scope.row.ITEM_NO;
      this.dialogTableVisible = true;
      //生成库存表格，依次是类别、编号、尺寸、库存信息
      this.produceStore[0].body = scope.row.NOTE ? scope.row.NOTE : "暂无数据";
      this.produceStore[1].body = scope.row.ITEM_NO
        ? scope.row.ITEM_NO
        : "暂无数据";
      this.produceStore[2].body = scope.row.FIX_GRADE / 1000;
      this.produceStore[3].body = "查询中...";
    },
    showStoreData() {
      this.produceStore[3].body = this.storeMsg.length
        ? this.storeMsg[0]
        : "暂无数据";
    },
  },
  mounted() {
    const self = this;
    window.addEventListener(
      "message",
      function (e) {
        if (e.origin && e.origin != "http://www.luxlano.com") return;
        self.storeMsg = [];
        self.storeMsg.push(e.data);
        self.showStoreData();
      },
      false
    );
  },
};
</script>
<style>
#storeTable .el-table__footer-wrapper,
#storeTable .el-table__header-wrapper {
  display: none;
}
#shopTabCon .el-tabs__header {
  margin: 0;
}
#shopTabCon .el-table__expand-icon::after {
  display: block !important;
  position: relative;
  bottom: 1px;
  font-size: 14px;
  content: "选择此款";
  color: red;
  cursor: pointer;
  -webkit-transition: background-color 0.25s ease;
  transition: background-color 0.25s ease;
}
#shopTabCon .el-table__expand-icon > i {
  display: none !important;
}
</style>

<style scoped>
#storeTable {
  border: 1px solid gray;
}
#storeTable tr > :nth-child(1) {
  border-bottom: 1px solid gray;
}
#storeTable tr > :nth-child(2) {
  border-left: 1px solid gray;
  border-bottom: 1px solid gray;
}
a:hover {
  cursor: pointer;
}
.num-font {
  margin: 0 2px;
}
</style>