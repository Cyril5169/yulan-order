<template>
  <div id="wallPaperCon">
    <el-card shadow="hover">
      <div id="shopsCon">
        <div id="searchBoxW" class="tl">
          <el-input clearable v-model.trim="searchKey" @clear="tableData = []"
            @keyup.enter.native="_getShopsWallPaperMsg" placeholder="输入商品型号查找商品" style="width:25%; min-width:280px;">
            <div id="searchBtn" slot="append" style="cursor:pointer;" @click="_getShopsWallPaperMsg">
              搜索
            </div>
          </el-input>
          <div id="searchHistory" style="margin: 5px 0 0">
            <ul class="ovh l" style="font-size: 12px;">
              <li>历史搜索：</li>
              <li v-if="history.length === 0">暂无搜索记录</li>
              <li v-for="item in history" :key="item">
                <a @click="searchByHistory(item)">{{ item }}</a>
              </li>
              <li v-if="history.length !== 0">
                <a @click="removeHistory">删除历史记录</a>
              </li>
            </ul>
          </div>
        </div>
        <el-table class="loading-area" :data="tableData" :row-key="getRowKeys" :expand-row-keys="expands"
          @expand-change="expandChange" style="margin: 0px auto 20px auto;">
          <el-table-column label="型号" prop="type" width="120" align="center"></el-table-column>
          <el-table-column label="样本型号" prop="sample" width="120" align="center"></el-table-column>
          <el-table-column label="版本" prop="versionNumber" width="130" align="center"></el-table-column>
          <el-table-column label="类别" prop="version" width="110" align="center"></el-table-column>
          <el-table-column label="品牌" prop="brand" width="80" align="center"></el-table-column>
          <el-table-column v-if="minimumPurchaseShow" label="起购数量" prop="minimumPurchase" width="80" align="center">
          </el-table-column>
          <el-table-column :width="numWidth" label="数量" align="center">
            <template slot-scope="scope">
              <div v-if="scope.row.unit === '平方米'">
                <span class="num-font">宽</span>
                <currency-input :customStyle="'width: 60px;'" :decimalNum="decimalNum" v-model="scope.row.number">
                </currency-input>&nbsp;×
                <span class="num-font">高</span>
                <currency-input :customStyle="'width: 60px;'" :decimalNum="decimalNum"
                  v-model="scope.row.anotherNumber"></currency-input>
              </div>
              <div v-else>
                <currency-input :customStyle="'width: 60px;'" :decimalNum="decimalNum" v-model="scope.row.number">
                </currency-input>
              </div>
            </template>
          </el-table-column>
          <el-table-column label="单位" prop="unit" width="80" align="center"></el-table-column>
          <el-table-column width="100px" label="操作" align="center">
            <template slot-scope="scope">
              <a v-if="scope.row.noteType != 'I_S_H'" class="mr10" @click="seeStore(scope)">查看库存</a>
              <span v-else style="color:red;">库存异常</span>
              <el-dialog title="库存查询" :visible.sync="dialogTableVisible" width="520px">
                <el-table border :data="produceStore" style="width:500px;" :row-style="rowClass">
                  <el-table-column property="STOCK_NO" label="库房" align="center"></el-table-column>
                  <el-table-column property="BATCH_NO" label="批号" width="200" show-overflow-tooltip align="center">
                  </el-table-column>
                  <el-table-column property="QTY" label="库存" align="center"></el-table-column>
                </el-table>
                <div slot="footer">
                  <p class="f14 tc border-b mb10">
                    <b>以上数值仅供参考，以实际订单处理为准</b>
                  </p>
                  <el-button type="success" plain @click="dialogTableVisible = false">关 闭</el-button>
                </div>
              </el-dialog>
            </template>
          </el-table-column>
          <el-table-column width="20px;" type="expand">
            <template slot-scope="scope">
              <div v-if="scope.row.noteTypeName" style="color:red;font-size:15px;font-weight:bold;margin:10px 20px;">
                {{ scope.row.noteTypeName }}
              </div>
              <div v-if="baobei" style="color:red;font-size:15px;font-weight:bold;margin:10px 20px;">
                此型号已报备，如果直接下单，有可能不被处理，请先与工厂订单部联系
              </div>
              <el-form label-position="left" class="loading-area">
                <el-form-item label="活动：">
                  <el-select style="width:300px;" :disabled="disableFlag" v-model="seletedActivity" :placeholder="
                      disableFlag === false
                        ? '请选择一个活动'
                        : '此产品不参与活动'
                    ">
                    <el-option v-for="item in activity" :label="item.label" :key="item.value" :value="item.value">
                    </el-option>
                  </el-select>
                </el-form-item>
                <el-form-item label="备注：">
                  <div class="dib rel" style="width: 55%;">
                    <el-input resize="none" type="textarea" placeholder="请输入您的备注信息（50字内）" maxlength="50"
                      :autosize="{ minRows: 3, maxRows: 6 }" v-model="remark"></el-input>
                    <i class="el-icon-edit" style="position:absolute;right:10px;bottom:5px;"></i>
                  </div>
                  <span style="margin-left:10px;">{{ remark ? remark.length : 0 }}/50</span>
                </el-form-item>
                <el-form-item class="tc">
                  <el-button style="width: 130px;" type="danger" @click="saveToShoppingCar(scope.row)">加入购物车</el-button>
                  <el-button style="width: 130px;" type="info" @click="closeExpand">取消</el-button>
                </el-form-item>
              </el-form>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </el-card>
  </div>
</template>

<script>
import { getShopsWallPaperMsg } from "@/api/shopSearch";
import { getWallPaperStore, checkStore } from "@/api/searchStore";
import { findItemActivity } from "@/api/findActivity";
import { addShoppingCar } from "@/api/shop";
import { getItemById, GetPromotionByItem } from "@/api/orderListASP";
import Vue from "vue";
import Cookies from "js-cookie";
import {
  GetWallpaperInfo,
  GetSalPutonRecord,
  GetItemStock
} from "@/api/itemInfoASP";

export default {
  name: "WallPaper",
  data() {
    return {
      cid: Cookies.get("cid"), //假定给的用户id
      customerType: Cookies.get("customerType"), //客户类型
      searchKey: "", //搜索的关键词
      activity: [], //活动
      seletedActivity: "", //选择的活动
      remark: "", //备注
      numWidth: 100,
      tableData: [
        {
          type: "DT35010", //型号
          sample: "111", //样本型号
          versionNumber: "新墙标(大)", //版本
          version: "窄幅墙纸", //名称
          brand: "玉兰", //品牌
          number: "", //计量
          anotherNumber: "", //辅助计量、
          unit: "", //单位
          activity: [
            { value: "活动一" },
            { value: "活动二" },
            { value: "活动三" },
            { value: "活动四" }
          ], //活动
          seletedActivity: "", //选择的活动
          remark: "", //备注
          itemFlag: "0" //状态
        }
      ],
      expands: [], //展开行type的数组
      produceStore: [
        {
          stockNo: "1", //库房
          batchNo: "131", //批号
          qty: "361", //库存
          itemNo: "" //产品型号
        },
        {
          stockNo: "2",
          batchNo: "132",
          qty: "100",
          itemNo: ""
        },
        {
          stockNo: "3",
          batchNo: "133",
          qty: "100",
          itemNo: ""
        }
      ],
      dialogTableVisible: false, //控制展开的是哪些行
      disableFlag: false, //判断是否禁用选择框
      history: [], //本地存储
      decimalNum: 2, //保留小数的位数
      baobei: false,
      minimumPurchaseShow: false
    };
  },
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
    }
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
    },
    //获取row的key值
    getRowKeys(row) {
      return row.type;
    },
    //收起展开行-获取商品的活动
    expandChange(row) {},
    //通过历史记录查询产品
    searchByHistory(name) {
      this.tableData = [];
      this.expands = [];
      this.clearMsg();
      this.searchKey = name;
      this._getShopsWallPaperMsg();
    },
    //查询搜索墙纸
    _getShopsWallPaperMsg() {
      var data = {
        ITEM_NO: this.searchKey.toUpperCase(),
        LOGINNAME: this.cid,
        type: ""
      };
      this.expands = [];
      this.baobei = false;
      //getShopsWallPaperMsg(data)
      GetWallpaperInfo(data)
        .then(res => {
          //getItemById({ itemNo: res.data.itemNo }).then(res2 => {
          GetSalPutonRecord({ itemNo: res.data[0].ITEM_NO }).then(res2 => {
            this.baobei = res2.count > 0 ? true : false;
            res.data[0].DECIMAL_PLACES == "1"
              ? (this.decimalNum = 1)
              : (this.decimalNum = 2);
            res.data[0].MINIMUM_PURCHASE == 0
              ? (this.minimumPurchaseShow = false)
              : (this.minimumPurchaseShow = true);
            this.tableData = [];
            this.tableData.push({
              type: res.data[0].ITEM_NO, //型号
              sample: res.data[0].OLD_ITEM_NO, //样本型号
              versionNumber: res.data[0].PRODUCTVERSION_NAME, //版本
              version: res.data[0].NOTE, //名称
              brand: res.data[0].BRAND_NAME, //品牌
              productType: res.data[0].PRODUCT_TYPE, //类型
              unit: res.data[0].UNIT, //单位
              noteType: res.data[0].NOTE_TYPE,
              noteTypeName: res.data[0].NOTE_TYPE_NAME,
              itemFlag: res.data[0].ITEM_FALG, //不知是啥
              number: "", //数量
              anotherNumber: "", //辅助数量
              minimumPurchase: res.data[0].MINIMUM_PURCHASE // 起购数量
            });
            if (res.data[0].UNIT == "平方米") this.numWidth = 220;
            else this.numWidth = 100;
            let storage = window.localStorage;
            let arr = [];
            if (storage.history !== undefined && storage.history !== null) {
              arr = storage.history.toLocaleString().split(",");
            }
            //记录去重
            arr.push(this.searchKey.toUpperCase());
            arr = [...new Set(arr)];
            //只保留最新的8条记录
            if (arr.length > 8) {
              arr = arr.splice(arr.length - 8);
            }
            storage.history = arr;
            this.history = arr.reverse();
            storage.history.toLocaleString();
            this.clearMsg();
            //findItemActivity({
            GetPromotionByItem({
              cid: this.cid,
              customerType: this.customerType,
              itemNo: res.data[0].ITEM_NO,
              itemVersion: res.data[0].ITEM_VERSION,
              productType: res.data[0].PRODUCT_TYPE,
              productBrand: res.data[0].PRODUCT_BRAND
            })
              .then(res2 => {
                if (res2.data.length === 0) {
                  this.disableFlag = true;
                } else {
                  this.disableFlag = false;
                }
                var defaultSel = {
                  pri: 0,
                  id: 0
                };
                for (var i = 0; i < res2.data.length; i++) {
                  var obj = {
                    label:
                      res2.data[i].ORDER_TYPE +
                      " -- " +
                      res2.data[i].ORDER_NAME,
                    value: res2.data[i].P_ID
                  };
                  if (res2.data[i].PRIORITY != 0 && defaultSel.pri == 0) {
                    defaultSel.pri = res2.data[i].PRIORITY;
                    defaultSel.id = res2.data[i].P_ID;
                  } else if (
                    res2.data[i].PRIORITY != 0 &&
                    defaultSel.pri > res2.data[i].PRIORITY
                  ) {
                    defaultSel.pri = res2.data[i].PRIORITY;
                    defaultSel.id = res2.data[i].P_ID;
                  }
                  this.activity.push(obj);
                }
                if (defaultSel.pri != 0) {
                  this.seletedActivity = defaultSel.id;
                }
                this.activity.push({
                  label: "不参与活动",
                  value: null
                });
              })
              .catch(err => {
                console.log(err);
              });
            this.expands = [];
            this.expands.push(res.data[0].ITEM_NO);
          });
        })
        .catch(err => {
          this.tableData = [];
          this.expands = [];
          this.clearMsg();
        });
    },
    //获取库存信息
    getStore(row, res) {
      let storeMessage;
      switch (res.msg) {
        case "SUCCESS":
          storeMessage = "-1";
          break;
        case "waitForProduction":
          this.$confirm("当前库存不足，请等待生产", "提示", {
            confirmButtonText: "等生产",
            cancelButtonText: "返回",
            type: "warning",
            showClose: false,
            closeOnClickModal: false,
            closeOnPressEscape: false
          })
            .then(() => {
              storeMessage = "0";
              this.addToCar(row, storeMessage);
              return;
            })
            .catch(() => {
              this.searchKey = "";
              this.tableData = [];
              this.expands = [];
              this.clearMsg();
              return;
            });
          break;
        case "splitShipment":
          this.$confirm("此型号单个批次库存不满足需求量", "提示", {
            distinguishCancelAndClose: true,
            confirmButtonText: "分批出货",
            cancelButtonText: "等生产",
            type: "warning",
            closeOnClickModal: false,
            closeOnPressEscape: false
          })
            .then(() => {
              storeMessage = "1";
              this.addToCar(row, storeMessage);
              return;
            })
            .catch(action => {
              if (action === "cancel") {
                storeMessage = "0";
                this.addToCar(row, storeMessage);
              }
              return;
            });
          break;
        case "null":
          this.$confirm("当前库存不足，请等待生产", "提示", {
            confirmButtonText: "等生产",
            cancelButtonText: "返回",
            type: "warning",
            showClose: false,
            closeOnClickModal: false,
            closeOnPressEscape: false
          })
            .then(() => {
              storeMessage = "0";
              this.addToCar(row, storeMessage);
              return;
            })
            .catch(() => {
              this.searchKey = "";
              this.tableData = [];
              this.expands = [];
              this.clearMsg();
              return;
            });
          break;
        default:
          storeMessage = "0";
          break;
      }
      this.addToCar(row, storeMessage);
      return;
    },
    //库存无问题，添加入购物车
    addToCar(row, storeMessage) {
      if (storeMessage === undefined) return;
      if (this.seletedActivity === null || this.seletedActivity === undefined)
        this.seletedActivity = "";
      if (row.unit !== "平方米") {
        var data = {
          customer_type: this.customerType,
          CID: this.cid,
          itemNO: row.type,
          commodityType: "wallpaper",
          activityID: this.seletedActivity,
          quantity: row.number,
          height: "",
          width: "",
          note: this.remark,
          splitShipment: storeMessage
        };
      } else {
        var data = {
          customer_type: this.customerType,
          CID: this.cid,
          itemNO: row.type,
          commodityType: "wallpaper",
          activityID: this.seletedActivity,
          quantity: "",
          height: row.anotherNumber,
          width: row.number,
          note: this.remark,
          splitShipment: storeMessage
        };
      }
      addShoppingCar(data)
        .then(res => {
          if (res.data.code === 0) {
            this.$alert("此型号已添加成功，请前往购物车查看", "添加成功", {
              confirmButtonText: "确定",
              type: "success"
            });
            this.searchKey = "";
            this.tableData = [];
            this.expands = [];
            this.clearMsg();
            this.$root.$emit("refreshBadgeIcon", "wallCount");
          } else {
            var msg = res.data.msg;
            if (msg == "该产品正在上架，暂时不能加入购物车") {
              msg =
                "没有维护经销/分销/家装/零售价格，暂时不能加入购物车，请联系玉兰订单部";
            }
            this.$alert(msg, "添加失败", {
              confirmButtonText: "确定",
              type: "warning"
            });
            this.searchKey = "";
            this.tableData = [];
            this.expands = [];
            this.clearMsg();
          }
        })
        .catch(err => {
          this.$alert(
            "请查看信息填写是否正确或者检查网络是否通畅",
            "添加失败",
            {
              confirmButtonText: "确定",
              type: "warning"
            }
          );
          this.searchKey = "";
          this.tableData = [];
          this.expands = [];
          this.clearMsg();
        });
    },
    //保存到购物车
    saveToShoppingCar(row) {
      //库存判断,判断成功才可以添加
      let val;
      if (row.unit === "平方米") {
        val = row.number * row.anotherNumber;
      } else {
        val = row.number;
      }
      val = Number(val).toFixed(2);
      if (val === "0.00" || val === 0.0) {
        this.$alert("数量不能为空", "提示", {
          type: "warning",
          confirmButtonText: "确定"
        });
        return;
      }
      //判断数字合理性
      var re = /((^[1-9](\d+)?(\.\d{1,2})?$)|(^0$)|(^\d\.\d{1,2}$))/;
      if (re.test(val) === false) {
        this.$alert("请填写正确的数字", "提示", {
          type: "warning",
          confirmButtonText: "确定"
        });
        return;
      }
      //判断起购数量
      if (row.minimumPurchase != 0 && val < row.minimumPurchase) {
        this.$alert(
          "本产品最小起购数量为" + row.minimumPurchase + row.unit,
          "提示",
          {
            type: "warning",
            confirmButtonText: "确定"
          }
        );
        return;
      }
      if (this.seletedActivity === "" && this.disableFlag === false) {
        this.$alert("请选择一个活动", "提示", {
          type: "warning",
          confirmButtonText: "确定"
        });
        return;
      }
      checkStore({
        itemNo: row.type,
        stockShowNum: val
      })
        .then(res => {
          this.getStore(row, res);
          return;
        })
        .catch(err => {
          console.log(err);
        });
    },
    //修改该商品的计量
    numberChange(value, index) {},
    //查看该商品的库存
    seeStore(scope) {
      this.produceStore = [];
      //getWallPaperStore({
      GetItemStock({
        itemNo: scope.row.type
      })
        .then(res => {
          this.produceStore = res.data;
          this.dialogTableVisible = true;
        })
        .catch(err => {
          console.log(err.data);
        });
    },
    //选择该商品加入购物车
    chooseItem(value) {},
    //点击取消收起
    closeExpand() {
      this.searchKey = "";
      this.tableData = [];
      this.clearMsg();
    },
    //获取历史记录
    localHistory() {
      let storage = window.localStorage;
      let arr = [];
      if (storage.history !== undefined && storage.history !== null) {
        arr = storage.history.toLocaleString().split(",");
      }
      return arr.reverse();
    },
    //删除历史记录
    removeHistory() {
      this.$confirm("是否清空历史搜索纪录，清空后不可恢复", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
      })
        .then(() => {
          let storage = window.localStorage;
          storage.removeItem("history");
          this.history = this.localHistory();
        })
        .catch(() => {});
    }
  },
  created() {
    this.tableData = [];
    this.history = this.localHistory();
  },
  activated() {
    var selectNo = this.$route.params.selectNo;
    if (selectNo) {
      this.searchKey = selectNo;
      this._getShopsWallPaperMsg();
    }
  },
  computed: {
    getNum(index) {
      if (typeof data !== "number") return "";
      return data.toFixed(2);
    }
  }
};
</script>

<style scoped>
.border-b {
  border-bottom: 1px solid black;
}
a:hover {
  cursor: pointer;
}
#wallPaperCon .clearfix:before,
#wallPaperCon .clearfix:after {
  display: table;
  content: "";
}
#wallPaperCon .clearfix:after {
  clear: both;
}
#shopSearchBox div:hover {
  cursor: pointer;
}
#searchBtn {
  color: #101010;
  cursor: pointer;
}
#searchHistory ul {
  display: inline-block;
}
#searchHistory ul li {
  min-width: 50px;
  height: 20px;
  line-height: 20px;
  float: left;
  padding: 5px 0px;
  margin-right: 5px;
  text-align: center;
}
#searchHistory ul li a {
  margin-right: 5px;
  text-decoration: none;
  color: #303133;
}
#searchHistory ul li a:hover {
  color: orangered;
  font-weight: bold;
}
.num-font {
  margin: 0 2px;
}
</style>


<style>
#wallPaperCon .el-dialog__body {
  padding: 10px;
}
#shopsCon .el-table__expand-icon::after {
  display: none;
  position: relative;
  bottom: 1px;
  font-size: 14px;
  content: "选择此款";
  color: red;
  cursor: pointer;
  -webkit-transition: background-color 0.25s ease;
  transition: background-color 0.25s ease;
}
#wallPaperCon .el-table__expand-icon > i {
  display: none !important;
}
#searchBoxW .el-form-item {
  display: block;
}
</style>