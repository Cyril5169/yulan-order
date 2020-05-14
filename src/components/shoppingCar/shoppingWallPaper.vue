<template>
  <div id="shoppingCarCon" class="rel">
    <el-table id="shopBox" default-expand-all width="100%" style="margin-top:10px;" :row-class-name="tableRowClassName"
      :row-key="getRowKeys" :expand-row-keys="expands" @expand-change="packUpNot" :data="activityData">
      <el-table-column width="100px" type="expand">
        <template slot-scope="scope">
          <el-table :ref="multipleTable(scope.$index)" :data="table(scope.$index)" tooltip-effect="dark"
            style="width:100%;" @selection-change="handleSelectionChange">
            <el-table-column type="selection" width="55" :selectable="checkActiviyEffect" align="center">
            </el-table-column>
            <el-table-column prop="item.itemNo" label="型号" min-width="100" align="center"></el-table-column>
            <el-table-column label="活动" min-width="140px" show-overflow-tooltip align="center">
              <template slot-scope="scope">
                <span style="color: red;" v-if="scope.row.activityEffective === false">(过期活动)</span>
                {{
                  scope.row.activityName ? scope.row.activityName : "不参与活动"
                }}
              </template>
            </el-table-column>
            <el-table-column label="发货说明" min-width="80" show-overflow-tooltip align="center">
              <template slot-scope="scope">
                <span v-if="scope.row.splitShipment === 0">等生产</span>
                <span v-else-if="scope.row.splitShipment === 1">分批发货</span>
                <span v-else>--</span>
              </template>
            </el-table-column>
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
                    {{ scope1.row.width.mul(scope1.row.height) | dosageFilter }}
                  </span>
                  <span style="color: red;" v-if="
                      scope1.row.width.mul(scope1.row.height) <
                        scope1.row.item.minimumPurchase
                    ">(最小起购数量{{ scope1.row.item.minimumPurchase }})</span>
                </div>
                <div v-else>
                  <span>{{ scope1.row.quantity }}</span>
                  <span style="color: red;" v-if="scope1.row.quantity 
                    < scope1.row.item.minimumPurchase">(最小起购数量{{ scope1.row.item.minimumPurchase }})</span>
                </div>
              </template>
            </el-table-column>
            <el-table-column min-width="100" label="单位" prop="unit" align="center">
            </el-table-column>
            <el-table-column label="小计" align="center">
              <template slot-scope="scope">
                <div v-if="isManager === '0'">***</div>
                <div v-else-if="scope.row.unit === '平方米'">
                  {{
                    subtotal(scope.row.width, scope.row.height, scope.row.price)
                  }}
                </div>
                <div v-else>
                  {{
                    (parseFloat(scope.row.price) *
                      parseFloat(scope.row.quantity))
                      | dosageFilter
                  }}
                </div>
              </template>
            </el-table-column>
            <el-table-column label="折后金额" align="center">
              <template slot-scope="scope">
                <div v-if="isManager === '0'">***</div>
                <div v-else-if="scope.row.unit === '平方米'">
                  {{
                    scope.row.salPromotion? 
                    (scope.row.salPromotion.type == 1? 
                    scope.row.salPromotion.discount * subtotal( scope.row.width,scope.row.height,scope.row.price)
                    :subtotal(scope.row.width,scope.row.height,scope.row.salPromotion.price))
                    : subtotal(scope.row.width,scope.row.height,scope.row.price)
                  }}
                </div>
                <div v-else>
                  {{
                    scope.row.salPromotion? 
                    (scope.row.salPromotion.type == 1? 
                    scope.row.salPromotion.discount * parseFloat(scope.row.price) * parseFloat(scope.row.quantity)
                    :parseFloat(scope.row.salPromotion.price) *parseFloat(scope.row.quantity))
                    : parseFloat(scope.row.price) * parseFloat(scope.row.quantity)
                        | dosageFilter
                  }}
                </div>
              </template>
            </el-table-column>
            <el-table-column label="操作" min-width="170" align="center">
              <template slot-scope="scope">
                <a class="link-detail" @click="handleDetails(scope.$index, scope.row)">查看详情</a>
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
    <div id="accountBox">
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
        <div @click="handleCommit" v-bind:style="commitBtn" style="width:80px; height:50px;
                        color:white; font-size:18px; 
                        text-align:center; cursor: pointer;">
          去结算
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import Cookies from "js-cookie";
import { mapMutations, mapActions } from "vuex";
import lodash from "lodash";
import { getUserMarket, updateShoppingCar } from "@/api/shop";
import {
  getActivityFromName,
  getActivityById,
  getActivityByList,
  getGroupById
} from "@/api/findActivity";
import { GetCartItem } from "@/api/shopASP";
import { deleteItems, deleteGroup } from "@/api/delete";

export default {
  name: "ShoppingWallPaper",
  props: ["wallpaperData"],
  data() {
    return {
      cid: Cookies.get("cid"),
      isManager: Cookies.get("isManager"), //是否为管理员
      customerType: Cookies.get("customerType"),
      //按钮样式
      commitBtn: {
        background: "gray"
      },
      activityData: [], //获取组别
      //全部的商品信息(全类型)
      shopsData: [],
      tempData: [],
      multipleSelection: [],
      //促销活动
      activity: [
        { value: "活动一" },
        { value: "活动二" },
        { value: "活动三" },
        { value: "活动四" }
      ],
      totalMoney: 0,
      totalPriceMoney: 0,
      expands: [], //控制展开行
      //展开行的标识
      getRowKeys(row) {
        return row.activity;
      }
    };
  },
  methods: {
    //初始化
    init() {
      this.shopsData = [];
      this.activityData = [];
      this.multipleSelection = [];
      this.expands = [];
      this.totalMoney = 0;
      // getUserMarket({
      //   CID: this.cid
      // })
      GetCartItem({
        cid: Cookies.get("cid"),
        commodityType: "wallpaper"
      })
        .then(res => {
          let theData = res.data;
          this.dataDeal(theData);
          this.$root.$emit("refreshBadgeIcon", "wallCount");
        })
        .catch(err => {
          this.shopsData = [];
        });
    },
    dataDeal(theData) {
      for (var i = theData.length - 1; i >= 0; i--) {
        if (theData[i].commodities.length === 0) {
          theData.splice(i, 1);
        }
      }
      for (var i = 0; i < theData.length; i++) {
        let cid = theData[i].cid;
        let value = theData[i].productGroupType;
        let value1 = theData[i].activityGroupType;
        if (!value || value === undefined) value = "无产品";
        if (!value1 || value1 === undefined) value1 = "Z";
        let val = cid + "+" + value + "+" + value1;
        this.activityData.push({
          activity: val
        });
        this.expands.push(val);
      }
      this.shopsData = theData;
      // let obj = [];
      // let index = [];
      // for (var i = 0; i < theData.length; i++) {
      //   for (var j = 0; j < theData[i].commodities.length; j++) {
      //     if (
      //       theData[i].commodities[j].activityId !== undefined &&
      //       theData[i].commodities[j].activityId !== null &&
      //       theData[i].commodities[j].activityId !== ""
      //     ) {
      //       obj.push(theData[i].commodities[j].activityId);
      //       index.push({
      //         group: i,
      //         item: j
      //       });
      //     }
      //   }
      // }
      // getActivityByList(obj)
      //   .then(res => {
      //     for (var k = 0; k < index.length; k++) {
      //       theData[index[k].group].commodities[index[k].item].activityName =
      //         res[k];
      //     }
      //     this.shopsData = theData;
      //   })
      //   .catch(err => {
      //     console.log(err);
      //   });
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
        this.shopsData[index].commodities.forEach(item => {
          if (item.unit === "°ü") {
            item.unit = "包";
          }
        });
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
    ...mapMutations("navTabs", ["addTab"]),
    ...mapActions("navTabs", ["closeTab"]),
    //计算每件商品的小计:长乘高
    squareChange(value, index, groupIndex, flag) {
      return;
      var re = /((^[1-9](\d+)?(\.\d{1,2})?$)|(^0$)|(^\d\.\d{1,2}$))/;
      if (re.test(value) === false) {
        this.$alert("请填写正确的数字", "提示", {
          type: "warning",
          confirmButtonText: "确定"
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
          width: this.shopsData[groupIndex].commodities[index].width,
          height: this.shopsData[groupIndex].commodities[index].height,
          remark: this.shopsData[groupIndex].commodities[index].remark
        })
          .then(res => {})
          .catch(err => {
            console.log(err);
          });
      } else {
        updateShoppingCar({
          commodityID: this.shopsData[groupIndex].commodities[index].id,
          activityID: this.shopsData[groupIndex].commodities[index].activityId,
          quantity: "",
          width: this.shopsData[groupIndex].commodities[index].width,
          height: value,
          remark: this.shopsData[groupIndex].commodities[index].remark
        })
          .then(res => {})
          .catch(err => {
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
        let _data = this.shopsData[groupIndex].commodities[index];
        if (this.multipleSelection[i].quantity)
          total += parseFloat(this.multipleSelection[i].price * _data.quantity);
        else {
          let sub = this.subtotal(
            _data.width,
            _data.height,
            this.multipleSelection[i].price
          );
          total += sub;
        }
        this.totalMoney = total;
      }
    },
    //计算每件商品的小计:非长乘高
    numberChange(value, index, groupIndex) {
      return;
      var re = /((^[1-9](\d+)?(\.\d{1,2})?$)|(^0$)|(^\d\.\d{1,2}$))/;
      if (re.test(value) === false) {
        this.$alert("请填写正确的数字", "提示", {
          type: "warning",
          confirmButtonText: "确定"
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
        remark: this.shopsData[groupIndex].commodities[index].remark
      })
        .then(res => {})
        .catch(err => {
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
        let _data = this.shopsData[groupIndex].commodities[index];
        if (this.multipleSelection[i].quantity)
          total += parseFloat(
            this.multipleSelection[i].price *
              this.shopsData[groupIndex].commodities[index].quantity
          );
        else {
          let sub = this.subtotal(
            _data.width,
            _data.height,
            this.multipleSelection[i].price
          );
          total += sub;
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
        if (_data.quantity) {
          let sub = parseFloat(_data.price * _data.quantity);
          total += sub;
          totalPrice +=
            Math.round(
              (_data.salPromotion
                ? _data.salPromotion.type == 1
                  ? _data.salPromotion.discount * sub
                  : parseFloat(_data.salPromotion.price * _data.quantity)
                : sub).mul(100)
            ) / 100;
        } else {
          let sub = this.subtotal(_data.width, _data.height, _data.price);
          total += sub;
          totalPrice +=
            Math.round(
              (_data.salPromotion
                ? _data.salPromotion.type == 1
                  ? _data.salPromotion.discount * sub
                  : this.subtotal(
                      _data.width,
                      _data.height,
                      _data.salPromotion.price
                    )
                : sub).mul(100)
            ) / 100;
        }
      }
      this.totalMoney = total;
      this.totalPriceMoney = totalPrice;
      if (this.multipleSelection.length === 0) {
        this.commitBtn.background = "gray";
      } else {
        this.commitBtn.background = "#E15B60";
      }
    },
    //查看详情
    handleDetails(index, row) {
      this.addTab("detail/detailWallPaper");
      this.$router.push({
        name: `detailWallPaper`,
        params: {
          message: row
        }
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
    checkMinimumNumber(row) {
      let val;
      if (row.unit === "平方米") {
        val = row.width.mul(row.height);
      } else {
        val = row.quantity;
      }
      if (val < row.item.minimumPurchase) {
        return false;
      } else {
        return true;
      }
    },
    //切换选中项
    changeChoose(index) {
      var re = "multipleTable" + index;
      for (var i = 0; i < this.shopsData[index].commodities.length; i++)
        this.$refs[re].toggleRowSelection(this.shopsData[index].commodities[i]);
    },
    //删除单件商品
    deleteSingle(data) {
      this.$confirm("是否删除选中的商品？删除后将不可恢复！", "提示", {
        confirmButtonText: "确定删除",
        cancelButtonText: "我再想想",
        type: "warning"
      })
        .then(() => {
          let _data = [];
          _data.push(data.id);
          deleteItems(_data)
            .then(res => {
              this.$alert("删除成功", "提示", {
                confirmButtonText: "确定",
                type: "success"
              });
              this.init();
            })
            .catch(err => {
              this.$alert("删除失败", "提示", {
                confirmButtonText: "确定",
                type: "warning"
              });
            });
        })
        .catch(() => {});
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
        type: "warning"
      })
        .then(() => {
          var data = [];
          for (var i = 0; i < this.multipleSelection.length; i++) {
            data.push(this.multipleSelection[i].id);
          }
          deleteItems(data)
            .then(res => {
              this.$alert("删除成功", "提示", {
                confirmButtonText: "确定",
                type: "success"
              });
              this.init();
            })
            .catch(err => {
              this.$alert("删除失败", "提示", {
                confirmButtonText: "确定",
                type: "warning"
              });
            });
          // for(var i = 0; i < this.multipleSelection.length; i++){
          //     this.tableData.splice(this.shopsData[index].commodities.indexOf(this.multipleSelection[i]),1);
          // }
          // this.$message({
          //     type: 'success',
          //     message: '删除成功!'
          // });
        })
        .catch(() => {
          // this.$message({
          //     type: 'info',
          //     message: '已取消删除'
          // });
        });
    },
    //删除一整个分组
    deleteGroup(index) {
      this.$confirm("是否删除本组中的商品？删除后将不可恢复！", "提示", {
        confirmButtonText: "确定删除",
        cancelButtonText: "我再想想",
        type: "warning"
      })
        .then(() => {
          var data = [];
          for (var i = 0; i < this.multipleSelection.length; i++) {
            data.push(this.multipleSelection[i].id);
          }
          deleteGroup([this.shopsData[index].cartItemId])
            .then(res => {
              this.activityData = [];
              this.init();
              this.$alert("删除成功", "提示", {
                confirmButtonText: "确定",
                type: "success"
              });
            })
            .catch(err => {
              this.$alert("删除失败", "提示", {
                confirmButtonText: "确定",
                type: "warning"
              });
            });
          // for(var i = 0; i < this.multipleSelection.length; i++){
          //     this.tableData.splice(this.shopsData[index].commodities.indexOf(this.multipleSelection[i]),1);
          // }
          // this.$message({
          //     type: 'success',
          //     message: '删除成功!'
          // });
        })
        .catch(() => {
          // this.$message({
          //     type: 'info',
          //     message: '已取消删除'
          // });
        });
    },
    //判断结算
    handleCommit() {
      let arr = [];
      for (var i = 0; i < this.multipleSelection.length; i++) {
        if (this.multipleSelection[i].activityEffective === false) {
          this.$alert(
            `产品中的${this.multipleSelection[i].item.itemNo}对应的活动已经过期，无法提交，请更换活动`,
            "提示",
            {
              type: "warning",
              confirmButtonText: "确定"
            }
          );
          return;
        }
        if (
          this.customerType === "10" &&
          (this.multipleSelection[i].onlineSalesAmount === null ||
            this.multipleSelection[i].onlineSalesAmount == 0)
        ) {
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
            confirmButtonText: "确定"
          }
        );
        return;
      }
      if (this.multipleSelection.length === 0) {
        this.$alert("选择不能为空！", "提示", {
          type: "warning",
          confirmButtonText: "确定"
        });
        return;
      }
      let theData = this.multipleSelection;
      this.addTab("order/checkOrder");
      sessionStorage.setItem("shopping", JSON.stringify(theData));
      Cookies.set("cur_status", 0);
      this.$router.push({
        name: `checkOrder`
      });
    },
    //收起不能
    packUpNot(row, expandsRow) {
      var that = this;
      that.expands.push(row.activity);
    },
    //小计：面积四舍五入后*价格
    subtotal(width, height, price) {
      let _width = parseFloat(width);
      let _height = parseFloat(height);
      let _price = parseFloat(price);
      let square = Math.round(_width.mul(_height).mul(100)) / 100;
      return Math.round(price.mul(square).mul(100)) / 100;
    }
  },
  created() {
    this.init();
  }
};
</script>

<style>
#shoppingCarCon {
  margin-top: -32px;
}
#shoppingCarCon .el-table .colorType_0 {
  background: oldlace;
}
#shoppingCarCon .el-table .colorType_1 {
  background: #ceecbe;
}
#shoppingCarCon .el-table .colorType_2 {
  background: #cde1f7;
}
#shoppingCarCon .el-table__expanded-cell[class*="cell"] {
  padding: 0;
}
#shoppingCarCon .el-table__expand-icon::after {
  position: relative;
  bottom: 1px;
  font-size: 14px;
  content: "分组";
  color: #606266;
  cursor: pointer;
  -webkit-transition: background-color 0.25s ease;
  transition: background-color 0.25s ease;
}
/* .el-table .warning-row {
    background: oldlace;
}

.el-table .success-row {
    background: #f0f9eb;
} */
</style>
<style scoped>
a {
  text-decoration: none;
}
a:hover {
  cursor: pointer;
}
#accountBox {
  width: 100%;
  height: 53px;
  margin-top: 20px;
  background: #f0f0f0;
  line-height: 50px;
  color: #101010;
  font-size: 14px;
}
#accountBox span {
  cursor: pointer;
}
#accountBox :nth-child(1) > div {
  margin-left: 20px;
  display: inline-block;
}
.link-detail {
  margin: 0 5px;
  display: inline;
}
.link-delete {
  color: #13ce66;
  margin: 0 5px;
  display: inline;
}
</style>