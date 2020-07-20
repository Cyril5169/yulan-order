<template>
  <div id="shoppingCurtain" class="rel">
    <el-table id="shopBox" default-expand-all width="100%" style="margin-top:10px;" :row-class-name="tableRowClassName"
      :row-key="getRowKeys" :expand-row-keys="expands" @expand-change="packUpNot" :data="activityData"  empty-text="该购物车是空的">
      <el-table-column width="100px" type="expand">
        <template slot-scope="scope">
          <el-table :ref="multipleTable(scope.$index)" :data="table(scope.$index)" tooltip-effect="dark"
            style="width:100%;" @selection-change="handleSelectionChange">
            <el-table-column type="selection" width="55" :selectable="checkActiviyEffect" align="center">
            </el-table-column>
            <el-table-column label="型号" width="100" align="center">
              <template slot-scope="scope1">{{
                scope1.row.modelNumber
              }}</template>
            </el-table-column>
            <el-table-column label="宽度(m)" width="90" align="center">
              <template slot-scope="scope1">{{ scope1.row.width }}</template>
            </el-table-column>
            <el-table-column label="高度(m)" width="90" align="center">
              <template slot-scope="scope1">{{ scope1.row.height }}</template>
            </el-table-column>
            <el-table-column label="帘外包宽度(m)" width="120px" align="center">
              <template slot-scope="scope1">
                <span v-if="scope1.row.outsourcingBoxExist === 1">{{
                  scope1.row.outsourcingBoxWidth !== null &&
                  scope1.row.outsourcingBoxWidth !== 0
                    ? scope1.row.outsourcingBoxWidth
                    : "--"
                }}</span>
                <span v-else>--</span>
              </template>
            </el-table-column>
            <el-table-column label="褶皱倍数" width="90" align="center">
              <template slot-scope="scope1">{{ scope1.row.drape }}</template>
            </el-table-column>
            <el-table-column label="位置" width="100" align="center">
              <template slot-scope="scope1">{{
                scope1.row.location === null || scope1.row.location === ""
                  ? "--"
                  : scope1.row.location
              }}</template>
            </el-table-column>
            <el-table-column label="活动" align="center" show-overflow-tooltip>
              <template slot-scope="scope1">
                <span style="color: red;" v-if="
                    scope1.row.activityEffective === false
                  ">(过期活动)</span>
                {{ scope1.row.activity }}
              </template>
            </el-table-column>
            <el-table-column width="80" label="数量" align="center">
              <template slot-scope="scope1">
                <!-- <el-input-number
                  size="mini"
                  style="width: 100%;"
                  v-model="scope1.row.count"
                  :min="1"
                  :max="1"
                  :disabled="true"
                  :step="1"
                  step-strictly
                ></el-input-number> -->
                {{ scope1.row.count }}
              </template>
            </el-table-column>
            <el-table-column label="小计" width="100" align="center">
              <template slot-scope="scope1">
                <span v-if="isManager === '0'">***</span>
                <span v-else>{{
                  (scope1.row.price * scope1.row.count) | dosageFilter
                }}</span>
              </template>
            </el-table-column>
            <el-table-column label="折后金额" width="100" align="center">
              <template slot-scope="scope1">
                <span v-if="isManager === '0'">***</span>
                <span v-else>{{
                  scope1.row.salPromotion
                    ? (scope1.row.salPromotion.type == 1? 
                    scope1.row.salPromotion.discount *(scope1.row.price * scope1.row.count)
                    :scope1.row.salPromotion.price * scope1.row.count)
                    : (scope1.row.price * scope1.row.count) | dosageFilter
                }}</span>
              </template>
            </el-table-column>
            <el-table-column label="操作" width="160px" align="center">
              <template slot-scope="scope1">
                <a class="link-detail" @click="handleDetails(scope1.$index, scope1.row)">查看详情</a>
                <a class="link-delete" @click="deleteSingle(scope1.row)">删除商品</a>
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
          <!-- {{scope.$index}}
          {{shopsData.cartItems.wallPaper[scope.$index]}}-->
          <!-- {{typeof(shopsData.cartItems.wallPaper[scope.$index])}} -->
        </template>
      </el-table-column>
      <el-table-column>
        <template slot-scope="scope">
          <div class="r">
            <!-- <a class="ml20" @click="changeChoose(scope.$index)" style="color: #606266;">切换选择项</a> -->
            <a class="ml20" @click="deleteChoose(scope.$index)" style="color: red;">删除选中的商品</a>
          </div>
        </template>
      </el-table-column>
    </el-table>
    <div id="accountBox">
      <!-- style="width:1050px;position:fixed;bottom:10px;left:240px;z-index:999;" -->
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
        <div @click="handleCommitNew" v-bind:style="commitBtn" style="width:80px; height:50px;
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
import { getUserMarket } from "@/api/shop";
import { getActivityById, getActivityByList } from "@/api/findActivity";
import {
  deleteTheGroup,
  deleteCurtains,
  commitLook,
  deleteCurtain,
  alterCount
} from "@/api/curtain";
import { GetCartItem } from "@/api/shopASP";
import { mapMutations, mapActions } from "vuex";

export default {
  name: "ShoppingCurtain",
  props: ["curtainData"],
  data() {
    return {
      cid: Cookies.get("cid"), //假定给的用户id
      customerType: Cookies.get("customerType"), //客户类型
      isManager: Cookies.get("isManager"), //是否为管理员
      //按钮样式
      commitBtn: {
        background: "gray"
      },
      controllNum: 0, //控制表格下标
      activityData: [], //获取组别
      //全部的商品信息(全类型)
      shopsData: [],
      tempData: [],
      numberList: [],
      multipleSelection: [], //选中的数据
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
      this.controllNum = 0;
      // getUserMarket({
      //   CID: this.cid
      // })
      GetCartItem({
        cid: Cookies.get("cid"),
        commodityType: "curtain"
      })
        .then(res => {
          //过滤无效数据
          let theData = res.data;
          this.dataDeal(theData);
          this.$root.$emit("refreshBadgeIcon", "curtainCount");
        })
        .catch(err => {
          this.shopsData = [];
        });
    },
    dataDeal(theData) {
      for (let i = theData.length - 1; i >= 0; i--) {
        if (theData[i].curtainCartItems.length === 0) {
          theData.splice(i, 1);
        }
      }
      for (let i = 0; i < theData.length; i++) {
        //获取分组
        let value = theData[i].productGroupType;
        let value1 = theData[i].activityGroupType;
        let cid;
        if (!value || value === undefined) value = "无产品";
        if (!value1 || value1 === undefined) value1 = "Z";
        if (!theData[i].curtainCartItems.length) {
          cid = "";
        } else {
          cid = theData[i].curtainCartItems[0].cid;
        }
        let val = cid + "+" + value + "+" + value1;
        this.activityData.push({
          activity: val
        });
        this.expands.push(val);
        for (let j = 0; j < theData[i].curtainCartItems.length; j++) {
          theData[i].curtainCartItems[j].index = i; //赋值下标
        }
        // for (let j = 0; j < theData[i].curtainCartItems.length; j++) {
        //   for (
        //     let k = 0;
        //     k < theData[i].curtainCartItems[j].curtainLists.length;
        //     k++
        //   ) {
        //     let index =
        //       theData[i].curtainCartItems[j].curtainLists[k].curtainCommodities
        //         .length;
        //     if (index > 0) {
        //       theData[i].curtainCartItems[j].unNullNum = k;
        //       break;
        //     }
        //   }
        // }
        //总价赋值
        // for (let j = 0; j < theData[i].curtainCartItems.length; j++) {
        //   if (theData[i].curtainCartItems[j].price == 0) {
        //     var totalPrice = 0;
        //     for (
        //       let k = 0;
        //       k < theData[i].curtainCartItems[j].curtainLists.length;
        //       k++
        //     ) {
        //       for (
        //         let l = 0;
        //         l <
        //         theData[i].curtainCartItems[j].curtainLists[k]
        //           .curtainCommodities.length;
        //         l++
        //       ) {
        //         totalPrice +=
        //           theData[i].curtainCartItems[j].curtainLists[k]
        //             .curtainCommodities[l].price *
        //           theData[i].curtainCartItems[j].curtainLists[k]
        //             .curtainCommodities[l].dosage;
        //       }
        //     }
        //     theData[i].curtainCartItems[j].price = totalPrice;
        //   }
        // }
      }
      this.shopsData = theData;
      //获取中文活动名
      // let pIdArr = [];
      // for (let i = 0; i < theData.length; i++) {
      //   for (let j = 0; j < theData[i].curtainCartItems.length; j++) {
      //     let index = theData[i].curtainCartItems[j].unNullNum;
      //     theData[i].curtainCartItems[j].index = i; //赋值下标
      //     pIdArr.push(
      //       theData[i].curtainCartItems[j].curtainLists[index]
      //         .curtainCommodities[0].activityId
      //     );
      //   }
      // }
      // getActivityByList(pIdArr)
      //   .then(res => {
      //     let k = 0;
      //     for (let i = 0; i < theData.length; i++) {
      //       for (let j = 0; j < theData[i].curtainCartItems.length; j++) {
      //         theData[i].curtainCartItems[j].activity = res[k++];
      //       }
      //     }
      //     this.shopsData = theData;
      //   })
      //   .catch(err => {
      //     console.log(err);
      //   });
    },
    ...mapMutations("navTabs", ["addTab"]),
    ...mapActions("navTabs", ["closeTab"]),
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
    //判断商品是否可选(活动是否有效)
    checkActiviyEffect(row, index) {
      if (
        row.activityEffective === false
      ) {
        return false;
      } else {
        return true;
      }
    },
    //监测选中项的变化
    handleSelectionChange(val) {
      //不可选择多组
      if (this.multipleSelection.length !== 0 && val.length !== 0) {
        if (this.multipleSelection[0].index !== val[0].index) {
          var re = "multipleTable" + this.multipleSelection[0].index;
          this.$refs[re].clearSelection();
        }
      }
      this.multipleSelection = val;
      //价格计算
      let total = 0;
      let totalPrice = 0;
      for (let i = 0; i < val.length; i++) {
        let sub = val[i].price * val[i].count;
        total += sub;
        totalPrice +=
          Math.round(
            (val[i].salPromotion
              ? val[i].salPromotion.type == 1
                ? val[i].salPromotion.discount * sub
                : val[i].salPromotion.price * val[i].count
              : sub).mul(100)
          ) / 100;
      }
      this.totalMoney = total;
      this.totalPriceMoney = totalPrice;
      //无勾选时按钮黯淡
      if (this.multipleSelection.length === 0) {
        this.commitBtn.background = "gray";
      } else {
        this.commitBtn.background = "#E15B60";
      }
    },
    //数量修改
    //7.23新需求，数量不作修改，仅为1
    getChange(index0, index1, data) {
      //判断数量是否为整数
      if (!Number.isInteger(data.count)) {
        let _count = Math.round(data.count);
        this.$nextTick(() => {
          this.shopsData[index0].curtainCartItems[index1].count = _count;
        });
      }
      //调用修改数量的接口
      let obj = {
        cartItemID: data.cartItemId,
        count: data.count
      };
      alterCount(obj)
        .then(res => {
          //若该商品被选中，修改总价
          //判断是否选中
          let val = this.multipleSelection;
          let result = val.some(item => {
            if (item === data) {
              return true;
            }
          });
          if (!result) return;
          //价格计算
          let total = 0;
          for (let i = 0; i < val.length; i++) {
            let index = val[i].unNullNum;
            total += val[i].price * data.count;
          }
          this.totalMoney = total;
        })
        .catch(err => {
          this.$alert("修改数量失败", "提示", {
            confirmButtonText: "好的",
            type: "warning"
          });
        });
    },
    //查看详情
    handleDetails(index, data) {
      //Cookies.set('curtain',data);
      this.addTab("detail/detailCurtain");
      this.$router.push({
        name: `detailCurtain`,
        params: {
          curtain: data
        }
      });
    },
    //删除一整个表格
    deleteTable(index) {
      this.shopsData.splice(index, 1);
      this.activityData.splice(index, 1);
      for (let i = index; i < this.shopsData.length; i++) {
        for (let j = 0; j < this.shopsData[i].curtainCartItems.length; j++) {
          this.shopsData[i].curtainCartItems[j].index--;
        }
      }
    },
    //删除单件商品
    deleteSingle(data) {
      let _index = data.index;
      this.$confirm("是否删除选中的商品？删除后将不可恢复！", "提示", {
        confirmButtonText: "确定删除",
        cancelButtonText: "我再想想",
        type: "warning"
      })
        .then(() => {
          let _data = [];
          _data.push(data.cartItemId);
          deleteTheGroup(_data)
            .then(res => {
              this.$alert("删除成功", "提示", {
                confirmButtonText: "确定",
                type: "success"
              });
              this.init();
            })
            .catch(err => {
              this.$alert("发生错误，删除失败", "提示", {
                confirmButtonText: "确定",
                type: "warning"
              });
            });
        })
        .catch(() => {});
    },
    //删除选中项
    deleteChoose() {
      if (this.multipleSelection.length == 0) return;
      this.$confirm("是否删除选中的商品？", "提示", {
        confirmButtonText: "确定删除",
        cancelButtonText: "我再想想",
        type: "warning"
      })
        .then(() => {
          let obj = [];
          let _index = this.multipleSelection[0].index;
          for (let i = 0; i < this.multipleSelection.length; i++) {
            obj.push(this.multipleSelection[i].cartItemId);
          }
          deleteTheGroup(obj)
            .then(res => {
              this.$alert("删除成功", "提示", {
                confirmButtonText: "确定",
                type: "success"
              });
              this.init();
            })
            .catch(err => {
              this.$alert("发生错误，删除失败", "提示", {
                confirmButtonText: "确定",
                type: "warning"
              });
            });
        })
        .catch(() => {});
    },
    //删除分组
    deleteGroup(index) {
      let obj = [];
      let multipleTable = "multipleTable" + index;
      for (let i = 0; i < this.shopsData[index].curtainCartItems.length; i++) {
        obj.push(this.shopsData[index].curtainCartItems[i].cartItemId);
      }
      deleteTheGroup(obj)
        .then(res => {
          this.deleteTable(index);
          this.$refs[multipleTable].clearSelection();
          this.$alert("删除成功", "提示", {
            confirmButtonText: "确定",
            type: "success"
          });
        })
        .catch(err => {
          this.$alert("删除失败", "提示", {
            confirmButtonText: "确定",
            type: "warning"
          }).then(() => {
            this.$refs[multipleTable].clearSelection();
          });
        });
    },
    //新建一个方法，不动原来的
    handleCommitNew() {
      let ids = [];
      if (this.multipleSelection.length === 0) {
        this.$alert("选择不能为空！", "提示", {
          type: "warning",
          confirmButtonText: "确定"
        });
        return;
      }
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
        ids.push(this.multipleSelection[i].cartItemId);
        //添加item用于结算页面的判断
        let _index = this.multipleSelection[i].unNullNum;
        let _data = this.multipleSelection[i].curtainLists[_index]
          .curtainCommodities[0];
        let _itemNoSample = _data.item.oldItemNo;
        this.multipleSelection[i].item = new Object();
        this.multipleSelection[i].item.itemNo = this.multipleSelection[
          i
        ].modelNumber;
        this.multipleSelection[i].item.itemNoSample = !_itemNoSample
          ? this.multipleSelection[i].modelNumber
          : _itemNoSample;
        this.multipleSelection[i].item.itemVersion = _data.item.itemVersion;
        this.multipleSelection[i].item.groupType = "E";
        this.multipleSelection[i].id = _data.id;
        this.multipleSelection[i].unit = "米";
        this.multipleSelection[i].quantity = 1;
      }
      let theData = this.multipleSelection;
      this.addTab("order/checkOrder");
      sessionStorage.setItem("shopping", JSON.stringify(theData));
      Cookies.set("cur_status", 3);
      this.$router.push({
        name: `checkOrder`
      });
    },
    //提交审核
    handleCommit() {
      //判断是否为空
      let val = this.multipleSelection;
      if (val.length === 0) {
        this.$alert("选择不能为空！", "提示", {
          type: "warning",
          confirmButtonText: "确定"
        });
        return;
      }
      //提交审核
      let orders = [];
      let ids = [];
      let deleteId = [];
      for (let i = 0; i < val.length; i++) {
        let _index = val[i].unNullNum;
        let _data = val[i].curtainLists[_index].curtainCommodities[0];
        let _itemNoSample = _data.item.oldItemNo;
        let _outHeightChoose = val[i].outsourcingBoxExist;
        let _wbh = val[i].outsourcingBoxWidth;
        let _order = {
          flagFlType: !val[i].salPromotion ? "" : val[i].salPromotion.flagFl, //新增活动字段
          itemNo: val[i].modelNumber, //型号
          itemNoSample: !_itemNoSample ? val[i].modelNumber : _itemNoSample, //样本型号
          partSendId: "0", //分批发货标志，0不可以，1可以
          productionVersion: _data.item.itemVersion, //产品版本
          //7.23新需求只要1个
          qtyRequired: "1",
          //qtyRequired: val[i].count.toString(),//数量
          //notes: '',//备注
          unitPrice: val[i].price.toString(), //单价
          promotionCost: "0", //(必传，初为0)
          promotion: val[i].activity, //活动名称
          promotionType: _data.activityId, //活动类型代号
          curtainWidth: val[i].width, //成品尺寸（宽）xing
          curtainHeight: val[i].height, //成品尺寸（高）xing
          curtainHeight2: val[i].falseShadeHigh, //假帘（高) xing
          curtainSizeTimes: val[i].drape, //窗帘褶皱倍数2-3 xing
          curtainRoomName: val[i].location
        };
        if (_wbh !== null && _wbh !== 0) {
          _order.curtainWbhSize = _wbh;
        }
        orders.push(_order);
        ids.push(val[i].cartItemId);
        deleteId.push(val[i].cartItemId);
      }
      let obj = {
        cid: this.cid,
        companyId: Cookies.get("companyId"),
        ctm_order: {
          allSpend: this.totalMoney.toString(),
          arrearsFlag: val[0].salPromotion
            ? val[0].salPromotion.arrearsFlag
            : null
        }, //头部信息
        ctm_orders: orders, //订单信息
        cartItemIDs: ids //购物车id信息
      };
      commitLook(obj)
        .then(res => {
          deleteCurtain(deleteId).then(res => {
            let _index = this.multipleSelection[0].index;
            let multipleTable = "multipleTable" + _index;
            if (
              this.multipleSelection.length ===
              this.$refs[multipleTable].data.length
            ) {
              this.deleteTable(_index);
            } else {
              for (let i = 0; i < this.multipleSelection.length; i++) {
                let num = this.shopsData[_index].curtainCartItems.indexOf(
                  this.multipleSelection[i]
                );
                this.shopsData[_index].curtainCartItems.splice(num, 1);
              }
            }
            this.$refs[multipleTable].clearSelection();
            this.$alert("提交成功，请在我的订单中查看", "提示", {
              confirmButtonText: "确定"
            });
          });
        })
        .catch(err => {
          this.$refs[multipleTable].clearSelection();
          this.$alert("提交失败", "提示", {
            confirmButtonText: "确定",
            type: "warning"
          });
          console.log(err);
        });
    },
    //收起不能
    packUpNot(row, expandsRow) {
      var that = this;
      that.expands.push(row.activity);
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
        this.shopsData[index].curtainCartItems
      ) {
        return this.shopsData[index].curtainCartItems;
      }
      return [];
    }
  },
  created() {
    this.init();
  }
  // watch: {
  //   curtainData(data) {
  //     this.shopsData = [];
  //     this.activityData = [];
  //     this.multipleSelection = [];
  //     this.expands = [];
  //     this.totalMoney = 0;
  //     this.controllNum = 0;
  //     this.tempData = data;
  //     if (this.tempData.length > 0) this.dataDeal(this.tempData);
  //   }
  // }
};
</script>
<style>
#shoppingCurtain {
  margin-top: -32px;
}
#shoppingCurtain .el-table .colorType_0 {
  background: oldlace;
}
#shoppingCurtain .el-table .colorType_1 {
  background: #ceecbe;
}
#shoppingCurtain .el-table .colorType_2 {
  background: #cde1f7;
}
#shoppingCurtain .el-table__expanded-cell[class*="cell"] {
  padding: 0;
}
#shoppingCurtain .el-table__expand-icon::after {
  position: relative;
  bottom: 1px;
  font-size: 14px;
  content: "分组";
  color: #606266;
  cursor: pointer;
  -webkit-transition: background-color 0.25s ease;
  transition: background-color 0.25s ease;
}
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
#accountBox > div > div {
  display: inline-block;
  margin: 0 5px;
}
#accountBox span {
  cursor: pointer;
}
#accountBox :nth-child(2) > div {
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