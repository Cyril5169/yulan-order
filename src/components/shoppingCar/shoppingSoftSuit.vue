<template>
  <div class="shoppingCarCls">
    <el-table default-expand-all width="100%" style="margin-top:10px;" :row-class-name="tableRowClassName" :row-key="getRowKeys"
      :expand-row-keys="expands" @expand-change="packUpNot" :data="activityData" empty-text="该购物车是空的">
      <el-table-column width="100px" type="expand">
        <template slot-scope="scope">
          <el-table :ref="multipleTable(scope.$index)" :data="table(scope.$index)" tooltip-effect="dark" style="width:100%;"
            @selection-change="handleSelectionChange">
            <el-table-column type="selection" width="55" :selectable="checkActiviyEffect" align="center">
            </el-table-column>
            <el-table-column prop="item.itemNo" label="型号" min-width="100" align="center"></el-table-column>
            <el-table-column min-width="80" label="版本" prop="item.productversionName" align="center"></el-table-column>
            <el-table-column label="活动" min-width="140px" show-overflow-tooltip align="center">
              <template slot-scope="scope">
                <span style="color: red;" v-if="scope.row.activityEffective === false">(过期活动)</span>
                {{
                  scope.row.activityName ? scope.row.activityName : "不参与活动"
                }}
              </template>
            </el-table-column>
            <!-- <el-table-column
                        label="发货说明"
                        min-width="120"
                        show-overflow-tooltip>
                        <template slot-scope="scope">
                            <span v-if="scope.row.splitShipment === '0'">等生产</span>
                            <span v-else-if="scope.row.splitShipment === '1'">分批发货</span>
                            <span style="margin-left:20px;" v-else>--</span>
                        </template>
            </el-table-column>-->
            <el-table-column label="单价" align="center">
              <template slot-scope="scope">
                <span v-if="isManager === '0'">***</span>
                <span v-else>{{ scope.row.price }}</span>
              </template>
            </el-table-column>
            <el-table-column label="数量" min-width="120" align="center">
              <template slot-scope="scope1">
                <div v-if="scope1.row.unit === '平方米'">
                  <span>
                    {{ scope1.row.width }} × {{ scope1.row.height }} =
                    {{ (scope1.row.width * scope1.row.height) | dosageFilter }}
                  </span>

                  <span style="color: red;" v-if="
                      scope1.row.width * scope1.row.height <
                        scope1.row.item.minimumPurchase
                    ">(最小起购数量{{ scope1.row.item.minimumPurchase }})</span>
                </div>
                <div v-else>
                  <span>{{ scope1.row.quantity }}</span><span style="color: red;" v-if="scope1.row.quantity 
                    < scope1.row.item.minimumPurchase">(最小起购数量{{ scope1.row.item.minimumPurchase }})</span>
                </div>
              </template>
            </el-table-column>
            <el-table-column min-width="100" label="单位" prop="unit" align="center"></el-table-column>
            <el-table-column label="小计" align="center">
              <template slot-scope="scope">
                <div v-if="isManager === '0'">***</div>
                <div v-else>{{subtotal(scope.row)}}</div>
              </template>
            </el-table-column>
            <el-table-column label="折后金额" align="center">
              <template slot-scope="scope">
                <div v-if="isManager === '0'">***</div>
                <div v-else>
                  {{ calculatePromotionPrice(scope.row) }}
                </div>
              </template>
            </el-table-column>
            <el-table-column label="操作" width="170px" align="center">
              <template slot-scope="scope">
                <a class="link-detail" @click="handleDetails(scope.$index, scope.row)" v-if="canShowDetail(scope.row)">查看详情</a>
                <a class="link-delete" @click="deleteSingle(scope.row)">删除商品</a>
              </template>
            </el-table-column>
          </el-table>
        </template>
      </el-table-column>
      <el-table-column>
        <template slot-scope="scope">
          <div v-if="scope.row.activity">
            {{ scope.row.activity }}
            <a class="ml20" style="color:#606266" @click="deleteGroup(scope.$index)">删除分组</a>
          </div>
        </template>
      </el-table-column>
      <el-table-column>
        <template slot-scope="scope">
          <div class="r">
            <a class="ml20" @click="deleteChoose(scope.$index)" style="color: red;">删除选中的商品</a>
          </div>
        </template>
      </el-table-column>
    </el-table>
    <div class="accountBox">
      <div class="r">
        <div>
          <span>已选择</span>
          <span style="color:red;">{{ multipleSelection.length }}</span>
          <span>件商品</span>
        </div>
        <div>
          <span>合计：</span>
          <span v-if="isManager === '0'" style="color:red; font-size:20px;" class="mr10">***</span>
          <span v-else style="color:red; font-size:20px;" class="mr10">￥{{ totalPriceMoney | dosageFilter }}</span>
        </div>
        <div @click="handleCommit" class="commitBtn" :style="{'background':multipleSelection.length?'#E15B60':'gray'}">
          去结算
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import Cookies from "js-cookie";
import { mapMutations } from "vuex";
import { updateShoppingCar } from "@/api/shop";
import { GetCartItem } from "@/api/shopASP";
import { deleteItems, deleteGroup } from "@/api/delete";

export default {
  name: "ShoppingSoftSuit",
  data() {
    return {
      cid: Cookies.get("cid"),
      isManager: Cookies.get("isManager"), //是否为管理员
      customerType: Cookies.get("customerType"),
      activityData: [], //获取组别
      //全部的商品信息(全类型)
      shopsData: [],
      multipleSelection: [],
      totalMoney: 0,
      totalPriceMoney: 0,
      expands: [], //控制展开行
    };
  },
  methods: {
    ...mapMutations("navTabs", ["addTab"]),
    //展开行的标识
    getRowKeys(row) {
      return row.activity;
    },
    //初始化
    init() {
      this.shopsData = [];
      this.activityData = [];
      this.multipleSelection = [];
      this.expands = [];
      this.totalMoney = 0;
      GetCartItem({
        cid: Cookies.get("cid"),
        commodityType: "soft",
      })
        .then((res) => {
          this.dataDeal(res.data);
          this.$root.$emit("refreshBadgeIcon", "softCount");
        })
        .catch((err) => {
          this.shopsData = [];
        });
    },
    dataDeal(theData) {
      for (var i = 0; i < theData.length; i++) {
        let cid = theData[i].cid;
        let value = theData[i].productGroupType;
        let value1 = theData[i].activityGroupType;
        if (!value || value === undefined) value = "无产品";
        if (!value1 || value1 === undefined) value1 = "Z";
        let val = cid + "+" + value + "+" + value1;
        this.activityData.push({
          activity: val,
        });
        this.expands.push(val);
      }
      this.shopsData = theData;
    },
    multipleTable(index) {
      var re = "multipleTable" + index;
      return re;
    },
    //返回展开行的商品数据
    table(index) {
      if (
        Array.isArray(this.shopsData) &&
        this.shopsData[index] &&
        this.shopsData[index].commodities
      ) {
        return this.shopsData[index].commodities;
      }
      return [];
    },
    //给不同的行添加样式颜色用于区分
    tableRowClassName({ row, rowIndex }) {
      if (rowIndex % 3 === 0) {
        return "colorType_0";
      } else if (rowIndex % 3 === 1) {
        return "colorType_1";
      } else if (rowIndex % 3 === 2) {
        return "colorType_2";
      }
      return "";
    },
    //计算每件商品的小计:长乘高
    squareChange(value, index, groupIndex, flag) {
      return;
      var re = /^[1-9]\d*$/;
      if (re.test(value) === false) {
        this.$alert("请填写正确的数字", "提示", {
          type: "warning",
          confirmButtonText: "确定",
        });
        if (flag === 0) {
          this.shopsData[groupIndex].commodities[index].width = "";
        } else {
          this.shopsData[groupIndex].commodities[index].height = "";
        }
        return;
      }
      if (flag === 0) {
        updateShoppingCar({
          commodityID: this.shopsData[groupIndex].commodities[index].id,
          activityID: this.shopsData[groupIndex].commodities[index].activityId,
          quantity: "",
          width: value,
          height: this.shopsData[groupIndex].commodities[index].height,
          remark: this.shopsData[groupIndex].commodities[index].remark,
        })
          .then((res) => { })
          .catch((err) => {
            console.log(err);
          });
      } else {
        updateShoppingCar({
          commodityID: this.shopsData[groupIndex].commodities[index].id,
          activityID: this.shopsData[groupIndex].commodities[index].activityId,
          quantity: "",
          width: this.shopsData[groupIndex].commodities[index].width,
          height: value,
          remark: this.shopsData[groupIndex].commodities[index].remark,
        })
          .then((res) => { })
          .catch((err) => {
            console.log(err);
          });
      }
      for (var i = 0; i < this.shopsData.length; i++) {
        var selected =
          this.multipleSelection.length &&
          this.multipleSelection.indexOf(
            this.shopsData[i].commodities[index]
          ) !== -1;
        if (selected === true) break;
      }
      if (selected === true) {
        var total = 0;
        if (this.multipleSelection[i].quantity)
          total += parseFloat(
            this.multipleSelection[i].price * this.multipleSelection[i].quantity
          );
        else {
          total += parseFloat(
            this.multipleSelection[i].width *
            this.multipleSelection[i].height *
            this.multipleSelection[i].price
          );
        }
        this.totalMoney = total;
      }
    },
    //计算每件商品的小计:非长乘高
    numberChange(value, index, groupIndex) {
      return;
      var re = /^[1-9]\d*$/;
      if (re.test(value) === false) {
        this.$alert("请填写正确的数字", "提示", {
          type: "warning",
          confirmButtonText: "确定",
        });
        this.shopsData[groupIndex].commodities[index].quantity = "";
        return;
      }
      updateShoppingCar({
        commodityID: this.shopsData[groupIndex].commodities[index].id,
        activityID: this.shopsData[groupIndex].commodities[index].activityId,
        quantity: this.shopsData[groupIndex].commodities[index].quantity,
        width: "",
        height: "",
        remark: this.shopsData[groupIndex].commodities[index].remark,
      })
        .then((res) => { })
        .catch((err) => {
          console.log(err);
        });
      for (var i = 0; i < this.shopsData.length; i++) {
        var selected =
          this.multipleSelection.length &&
          this.multipleSelection.indexOf(
            this.shopsData[i].commodities[index]
          ) !== -1;
        if (selected === true) break;
      }
      if (selected === true) {
        var total = 0;
        if (this.multipleSelection[i].quantity)
          total += parseFloat(
            this.multipleSelection[i].price * this.multipleSelection[i].quantity
          );
        else {
          total += parseFloat(
            this.multipleSelection[i].width *
            this.multipleSelection[i].height *
            this.multipleSelection[i].price
          );
        }
        this.totalMoney = total;
      }
    },
    //监测选中项的变化
    handleSelectionChange(val) {
      //当已有选项时，只能选当前组其他项，不可选其他组，若选其他组，原有组清空
      if (this.multipleSelection.length !== 0) {
        var value;
        var value1;
        for (var i = 0; i < this.multipleSelection.length; i++) {
          for (var j = 0; j < this.shopsData.length; j++) {
            for (var k = 0; k < this.shopsData[j].commodities.length; k++) {
              if (
                this.shopsData[j].commodities[k].id ===
                this.multipleSelection[i].id
              )
                value = j;
            }
          }
        }
        for (var i = 0; i < val.length; i++) {
          for (var j = 0; j < this.shopsData.length; j++) {
            for (var k = 0; k < this.shopsData[j].commodities.length; k++) {
              if (this.shopsData[j].commodities[k].id === val[i].id) value1 = j;
            }
          }
        }
        if (value !== value1) {
          var re = "multipleTable" + value;
          this.$refs[re].clearSelection();
        }
      }
      var total = 0;
      var totalPrice = 0;
      this.multipleSelection = val;
      for (var i = 0; i < this.multipleSelection.length; i++) {
        let _data = this.multipleSelection[i];
        var quantity =
          _data.quantity | this.dosageFilter(_data.width.mul(_data.height));
        let sub = _data.price.mul(_data.quantity);
        total += sub;
        totalPrice += this.calculatePromotionPrice(_data);
      }
      this.totalMoney = total;
      this.totalPriceMoney = totalPrice;
    },
    calculatePromotionPrice(data) {
      var price = 0;
      var quantity =
        data.quantity != 0
          ? data.quantity
          : this.dosageFilter(data.width.mul(data.height));
      //首先判断TYPE,1折扣，2定价。然后判断priority
      if (data.salPromotion) {
        //一口价
        if (data.salPromotion.PRIORITY == 99) {
          if (quantity < 1) quantity = 1;
          price = quantity.mul(data.salPromotion.PRICE);
        } else {
          switch (data.salPromotion.TYPE) {
            case "1":
              //折扣
              price = quantity.mul(data.price).mul(data.salPromotion.DISCOUNT);
              break;
            case "2":
              //定价
              price = quantity.mul(data.salPromotion.PRICE);
          }
        }
      } else {
        price = quantity.mul(data.price);
      }
      return this.dosageFilter(price);
    },
    canShowDetail(row) {
      return (
        !row.salPromotion ||
        (row.salPromotion && row.salPromotion.MODIFY_FLAG != "N")
      );
    },
    //查看详情
    handleDetails(index, row) {
      this.addTab("detail/detailSoftSuit");
      this.$router.push({
        name: `detailSoftSuit`,
        params: {
          message: row,
        },
      });
    },
    //判断商品是否可选(活动是否有效)
    checkActiviyEffect(row, index) {
      if (row.activityEffective === false) {
        return false;
      } else {
        return this.checkMinimumNumber(row);
      }
    },
    //最小起购数量
    checkMinimumNumber(row) {
      let val;
      if (row.unit === "平方米") {
        val = row.width * row.height;
      } else {
        val = row.quantity;
      }
      if (val < row.item.minimumPurchase) {
        return false;
      } else {
        return true;
      }
    },
    //删除单件商品
    deleteSingle(data) {
      this.$confirm("是否删除选中的商品？删除后将不可恢复！", "提示", {
        confirmButtonText: "确定删除",
        cancelButtonText: "我再想想",
        type: "warning",
      })
        .then(() => {
          let _data = [];
          _data.push(data.id);
          deleteItems(_data)
            .then((res) => {
              this.$alert("删除成功", "提示", {
                confirmButtonText: "确定",
                type: "success",
              });
              this.init();
            })
            .catch((err) => {
              this.$alert("删除失败", "提示", {
                confirmButtonText: "确定",
                type: "warning",
              });
            });
        })
        .catch(() => { });
    },
    //删除选中项
    deleteChoose(index) {
      if (this.multipleSelection.length == 0) return;
      //求出分组下标
      let theIndex;
      for (let i = 0; i < this.shopsData.length; i++) {
        for (let j = 0; j < this.shopsData[i].commodities.length; j++) {
          if (this.shopsData[i].commodities[j] == this.multipleSelection[0]) {
            theIndex = i;
            break;
          }
        }
      }
      if (index !== theIndex) return;
      this.$confirm("是否删除选中的商品？删除后将不可恢复！", "提示", {
        confirmButtonText: "确定删除",
        cancelButtonText: "我再想想",
        type: "warning",
      })
        .then(() => {
          var data = [];
          for (var i = 0; i < this.multipleSelection.length; i++) {
            data.push(this.multipleSelection[i].id);
          }
          deleteItems(data)
            .then((res) => {
              this.$alert("删除成功", "提示", {
                confirmButtonText: "确定",
                type: "success",
              });
              this.init();
            })
            .catch((err) => {
              this.$alert("删除失败", "提示", {
                confirmButtonText: "确定",
                type: "warning",
              });
            });
        })
        .catch(() => { });
    },
    //删除一整个分组
    deleteGroup(index) {
      this.$confirm("是否删除本组中的商品？删除后将不可恢复！", "提示", {
        confirmButtonText: "确定删除",
        cancelButtonText: "我再想想",
        type: "warning",
      })
        .then(() => {
          var data = [];
          for (var i = 0; i < this.multipleSelection.length; i++) {
            data.push(this.multipleSelection[i].id);
          }
          deleteGroup([this.shopsData[index].cartItemId])
            .then((res) => {
              this.activityData = [];
              this.init();
              this.$alert("删除成功", "提示", {
                confirmButtonText: "确定",
                type: "success",
              });
            })
            .catch((err) => {
              this.$alert("删除失败", "提示", {
                confirmButtonText: "确定",
                type: "warning",
              });
            });
        })
        .catch(() => { });
    },
    //判断结算
    handleCommit() {
      if (this.multipleSelection.length === 0) {
        this.$alert("选择不能为空！", "提示", {
          type: "warning",
          confirmButtonText: "确定",
        });
        return;
      }
      let arr = [];
      for (var i = 0; i < this.multipleSelection.length; i++) {
        if (this.multipleSelection[i].activityEffective === false) {
          this.$alert(
            `产品中的${this.multipleSelection[i].item.itemNo}对应的活动已经过期，无法提交，请更换活动`,
            "提示",
            {
              type: "warning",
              confirmButtonText: "确定",
            }
          );
          return;
        }
        if (this.customerType === "10" && !this.multipleSelection[i].onlineSalesAmount) {
          arr.push(this.multipleSelection[i].item.itemNo);
        }
      }
      if (arr.length !== 0) {
        let str = arr.join("、");
        this.$alert(
          `产品中的${str}的网上销售金额为空，请填写后再提交结算`,
          "提示",
          {
            type: "warning",
            confirmButtonText: "确定",
          }
        );
        return;
      }
      sessionStorage.setItem(
        "shopping",
        JSON.stringify(this.multipleSelection)
      );
      Cookies.set("cur_status", 0);
      this.addTab("order/checkOrder");
    },
    //收起不能
    packUpNot(row, expandsRow) {
      var that = this;
      that.expands.push(row.activity);
    },
    //小计：面积四舍五入后*价格
    subtotal(data) {
      var price = 0;
      var quantity =
        data.quantity != 0
          ? data.quantity
          : this.dosageFilter(data.width.mul(data.height));
      price = quantity.mul(data.price);
      return this.dosageFilter(price);
    },
  },
  created() {
    this.init();
  },
};
</script>
