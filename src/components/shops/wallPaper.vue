<template>
  <div id="wallPaperCon">
    <el-card shadow="hover">
      <div>
        <el-input clearable v-model.trim="searchKey" @clear="tableData = []" @keyup.enter.native="searchWallPaper"
          placeholder="输入商品型号查找商品" style="width:25%; min-width:280px;">
          <el-button @click="searchWallPaper" slot="append" icon="el-icon-search">搜索</el-button>
        </el-input>
        <div class="searchHistory" style="margin: 5px 0 0">
          <ul class="ovh l" style="font-size: 12px;margin:0">
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
      <el-table :data="tableData" :row-key="getRowKeys" :expand-row-keys="expands">
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
              <currency-input :customStyle="'width: 60px;'" :decimalNum="decimalNum" v-model="scope.row.anotherNumber">
              </currency-input>
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
            <el-form label-position="left">
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
    </el-card>

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
  </div>
</template>

<script>
import { addShoppingCar } from "@/api/shop";
import { getItemById, GetPromotionByItem } from "@/api/orderListASP";
import { mapMutations } from "vuex";
import { mapState } from "vuex";
import Cookies from "js-cookie";
import {
  GetWallpaperInfo,
  GetSalPutonRecord,
  GetItemStock,
  GetFixPriceShopsByItemNo,
  GetItemStoreCheckData
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
      tableData: [],
      expands: [], //展开行type的数组
      produceStore: [],
      dialogTableVisible: false, //控制展开的是哪些行
      disableFlag: false, //判断是否禁用选择框
      history: [], //本地存储
      decimalNum: 2, //保留小数的位数
      baobei: false,
      minimumPurchaseShow: false,
    };
  },
  computed: {
    ...mapState("navTabs", ["menuTreeListFlatten"]),
  },
  methods: {
    ...mapMutations("navTabs", ["addTab"]),
    isContainAttr(attr) {
      //是否包含权限
      return (
        this.menuTreeListFlatten.filter((item) => item.MENU_LINK == attr)
          .length > 0
      );
    },
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
    //通过历史记录查询产品
    searchByHistory(name) {
      this.clearMsg();
      this.searchKey = name;
      this.searchWallPaper();
    },
    //查询搜索墙纸
    searchWallPaper() {
      this.tableData = [];
      this.expands = [];
      this.baobei = false;
      var data = {
        ITEM_NO: this.searchKey,
        LOGINNAME: this.cid,
        type: "",
      };
      GetWallpaperInfo(data).then((res) => {
        GetSalPutonRecord({ itemNo: res.data[0].ITEM_NO }).then((res2) => {
          this.baobei = res2.count > 0 ? true : false;
          res.data[0].DECIMAL_PLACES == "1"
            ? (this.decimalNum = 1)
            : (this.decimalNum = 2);
          res.data[0].MINIMUM_PURCHASE == 0
            ? (this.minimumPurchaseShow = false)
            : (this.minimumPurchaseShow = true);
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
            number: "", //数量
            anotherNumber: "", //辅助数量
            minimumPurchase: res.data[0].MINIMUM_PURCHASE, // 起购数量
          });
          this.expands.push(res.data[0].ITEM_NO);
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
          GetPromotionByItem({
            cid: this.cid,
            customerType: this.customerType,
            itemNo: res.data[0].ITEM_NO,
            itemVersion: res.data[0].ITEM_VERSION,
            productType: res.data[0].PRODUCT_TYPE,
            productBrand: res.data[0].PRODUCT_BRAND,
          }).then((res2) => {
            if (res2.data.length === 0) {
              this.disableFlag = true;
            } else {
              this.disableFlag = false;
            }
            var defaultSel = {
              pri: 0,
              id: 0,
            };
            for (var i = 0; i < res2.data.length; i++) {
              var obj = {
                label:
                  res2.data[i].ORDER_TYPE +
                  " -- " +
                  res2.data[i].ORDER_NAME,
                value: res2.data[i].P_ID,
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
              value: null,
            });
          }).catch((err) => {
            console.log(err);
          });
        });
      }).catch((err) => {
        this.tableData = [];
        this.expands = [];
        this.clearMsg();
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
    //保存到购物车
    saveToShoppingCar(row) {
      if (this.isContainAttr("shops/fixPriceShops")) {
        //判断是否有一口价
        GetFixPriceShopsByItemNo({ ITEM_NO: row.type })
          .then((res) => {
            if (res.data.length) {
              //判断数量
              var QTY_JUDGE = res.data[0].QTY_JUDGE;
              var quantity = row.anotherNumber
                ? row.anotherNumber * row.number
                : row.number;
              if (quantity <= QTY_JUDGE) {
                this.$confirm(
                  "您要购买的产品数量，一口价专区有促销活动，是否前往购买？",
                  "提示",
                  {
                    confirmButtonText: "是",
                    cancelButtonText: "否",
                    type: "warning",
                  }
                )
                  .then(() => {
                    //跳转
                    this.addTab("shops/fixPriceShops");
                    this.$router.push({
                      name: "fixPriceShops",
                      params: {
                        selectNo: row.type,
                      },
                    });
                  })
                  .catch(() => {
                    //不跳转
                    this.beforAddToCart(row);
                  });
              } else {
                //不到判断数量
                this.beforAddToCart(row);
              }
            } else {
              //没有一口价
              this.beforAddToCart(row);
            }
          })
          .catch((res) => {
            //报错，直接进入后面的环节
            this.beforAddToCart(row);
          });
      } else {
        this.beforAddToCart(row);
      }
    },
    beforAddToCart(row) {
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
          confirmButtonText: "确定",
        });
        return;
      }
      //判断数字合理性
      var re = /((^[1-9](\d+)?(\.\d{1,2})?$)|(^0$)|(^\d\.\d{1,2}$))/;
      if (re.test(val) === false) {
        this.$alert("请填写正确的数字", "提示", {
          type: "warning",
          confirmButtonText: "确定",
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
            confirmButtonText: "确定",
          }
        );
        return;
      }
      if (this.seletedActivity === "" && this.disableFlag === false) {
        this.$alert("请选择一个活动", "提示", {
          type: "warning",
          confirmButtonText: "确定",
        });
        return;
      }
      //库存判断
      GetItemStoreCheckData({ itemNo: row.type }).then((res) => {
        var msg = "null";
        if (res.data.maxStock && res.data.maxStock.length) {
          var sumStock = res.data.sumStock[0].SUM_QTY;
          var maxStock = res.data.maxStock[0].QTY;
          if (val <= maxStock) {
            msg = "SUCCESS";
          } else if (maxStock < val && val <= sumStock) {
            //允许分批出货
            msg = "splitShipment";
          } else if (val > sumStock) {
            //等待制作
            msg = "waitForProduction";
          }
        }
        this.getStore(row, msg);
        return;
      }).catch((err) => {
        console.log(err);
      });
    },
    //获取库存信息
    getStore(row, msg) {
      let storeMessage;
      switch (msg) {
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
            closeOnPressEscape: false,
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
            closeOnPressEscape: false,
          })
            .then(() => {
              storeMessage = "1";
              this.addToCar(row, storeMessage);
              return;
            })
            .catch((action) => {
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
            closeOnPressEscape: false,
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
      var data = {};
      if (row.unit !== "平方米") {
        data = {
          customer_type: this.customerType,
          CID: this.cid,
          itemNO: row.type,
          commodityType: "wallpaper",
          activityID: this.seletedActivity,
          quantity: row.number,
          height: "",
          width: "",
          note: this.remark,
          splitShipment: storeMessage,
        };
      } else {
        data = {
          customer_type: this.customerType,
          CID: this.cid,
          itemNO: row.type,
          commodityType: "wallpaper",
          activityID: this.seletedActivity,
          quantity: "",
          height: row.anotherNumber,
          width: row.number,
          note: this.remark,
          splitShipment: storeMessage,
        };
      }
      addShoppingCar(data).then((res) => {
        this.$alert("此型号已添加成功，请前往购物车查看", "添加成功", {
          confirmButtonText: "确定",
          type: "success",
        });
        this.searchKey = "";
        this.tableData = [];
        this.expands = [];
        this.clearMsg();
        this.$root.$emit("refreshBadgeIcon", "wallCount");
      }).catch((res) => {
        var msg = res.msg ? res.msg : "";
        if (msg == "该产品正在上架，暂时不能加入购物车") {
          msg = "没有维护" + this.getPriceTip() + "价格，暂时不能加入购物车，请联系玉兰订单部";
        }
        this.$alert(msg, "添加失败", {
          confirmButtonText: "确定",
          type: "warning",
        });
        this.searchKey = "";
        this.tableData = [];
        this.expands = [];
        this.clearMsg();
      });
    },
    //查看该商品的库存
    seeStore(scope) {
      this.produceStore = [];
      GetItemStock({ itemNo: scope.row.type }).then((res) => {
        this.produceStore = res.data;
        this.dialogTableVisible = true;
      }).catch((err) => {
        console.log(err.data);
      });
    },
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
        type: "warning",
      })
        .then(() => {
          let storage = window.localStorage;
          storage.removeItem("history");
          this.history = this.localHistory();
        })
        .catch(() => { });
    },
  },
  created() {
    this.history = this.localHistory();
  },
  activated() {
    var selectNo = this.$route.params.selectNo;
    if (selectNo) {
      this.searchKey = selectNo;
      this.searchWallPaper();
    }
  },
};
</script>

<style scoped>
.border-b {
  border-bottom: 1px solid black;
}
a:hover {
  cursor: pointer;
}
.searchHistory ul {
  display: inline-block;
}
.searchHistory ul li {
  min-width: 50px;
  height: 20px;
  line-height: 20px;
  float: left;
  padding: 5px 0px;
  margin-right: 5px;
  text-align: center;
}
.searchHistory ul li a {
  margin-right: 5px;
  text-decoration: none;
  color: #303133;
}
.searchHistory ul li a:hover {
  color: orangered;
  font-weight: bold;
}
.num-font {
  margin: 0 2px;
}
</style>

<style>
#wallPaperCon .el-table__expand-icon > i {
  display: none !important;
}
</style>