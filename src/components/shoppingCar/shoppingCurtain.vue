<template>
  <div class="shoppingCarCls">
    <el-table default-expand-all width="100%" style="margin-top:10px;" :row-class-name="tableRowClassName" :row-key="getRowKeys"
      :expand-row-keys="expands" @expand-change="packUpNot" :data="activityData" empty-text="该购物车是空的">
      <el-table-column width="100px" type="expand">
        <template slot-scope="scope">
          <el-table :ref="'multipleTable' + scope.$index" :data="tableData(scope.$index)"
            @selection-change="handleSelectionChange">
            <el-table-column type="selection" width="55" :selectable="checkActiviyEffect" align="center">
            </el-table-column>
            <el-table-column label="型号" width="100" align="center">
              <template slot-scope="scope1">{{scope1.row.modelNumber}}</template>
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
                {{ scope1.row.count }}
              </template>
            </el-table-column>
            <el-table-column label="小计" width="100" align="center">
              <template slot-scope="scope1">
                <span v-if="isManager === '0'">***</span>
                <span v-else>{{(scope1.row.price * scope1.row.count) | dosageFilter}}</span>
              </template>
            </el-table-column>
            <el-table-column label="折后金额" width="100" align="center">
              <template slot-scope="scope1">
                <span v-if="isManager === '0'">***</span>
                <span v-else>{{ calculatePromotionPrice(scope1.row) }}</span>
              </template>
            </el-table-column>
            <el-table-column label="操作" width="160px" align="center">
              <template slot-scope="scope1">
                <a class="link-detail" @click="handleDetails(scope1.$index, scope1.row)" v-if="canShowDetail(scope1.row)">查看详情</a>
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
            <a class="ml20" style="color:#606266" @click="deleteOneGroup(scope.$index)">删除分组</a>
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
        <div @click="handleCommitNew" class="commitBtn" :style="{'background':multipleSelection.length?'#E15B60':'gray'}">
          去结算
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import Cookies from "js-cookie";
import { deleteTheGroup, alterCount } from "@/api/curtain";
import { GetCartItem } from "@/api/shopASP";
import { mapMutations } from "vuex";

export default {
  name: "ShoppingCurtain",
  data() {
    return {
      cid: Cookies.get("cid"), //假定给的用户id
      isManager: Cookies.get("isManager"), //是否为管理员
      activityData: [], //获取组别
      shopsData: [],
      multipleSelection: [], //选中的数据
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
        commodityType: "curtain",
      })
        .then((res) => {
          //过滤无效数据
          this.dataDeal(res.data);
          this.$root.$emit("refreshBadgeIcon", "curtainCount");
        })
        .catch((err) => {
          this.shopsData = [];
        });
    },
    dataDeal(theData) {
      for (let i = 0; i < theData.length; i++) {
        //获取分组
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
        for (let j = 0; j < theData[i].curtainCartItems.length; j++) {
          theData[i].curtainCartItems[j].index = i; //赋值下标
        }
      }
      this.shopsData = theData;
    },
    //判断商品是否可选(活动是否有效)
    checkActiviyEffect(row, index) {
      if (row.activityEffective === false) {
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
        totalPrice += this.calculatePromotionPrice(val[i]);
      }
      this.totalMoney = total;
      this.totalPriceMoney = totalPrice;
    },
    calculatePromotionPrice(data) {
      var price = 0;
      var quantity = data.count;
      //首先判断TYPE,1折扣，2定价
      if (data.salPromotion) {
        switch (data.salPromotion.TYPE) {
          case "1":
            //折扣
            price = quantity.mul(data.price).mul(data.salPromotion.DISCOUNT);
            break;
          case "2":
            //定价
            price = quantity.mul(data.salPromotion.PRICE);
        }
      } else {
        price = quantity.mul(data.price);
      }
      return this.dosageFilter(price);
    },
    //活动是否可以修改
    canShowDetail(row) {
      return (!row.salPromotion || (row.salPromotion && row.salPromotion.MODIFY_FLAG != "N"));
    },
    //查看详情
    handleDetails(index, data) {
      this.addTab("detail/detailCurtain");
      this.$router.push({
        name: `detailCurtain`,
        params: {
          curtain: data,
        },
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
        type: "warning",
      })
        .then(() => {
          let _data = [];
          _data.push(data.cartItemId);
          deleteTheGroup(_data)
            .then((res) => {
              this.$alert("删除成功", "提示", {
                confirmButtonText: "确定",
                type: "success",
              });
              this.init();
            })
            .catch((err) => {
              this.$alert("发生错误，删除失败", "提示", {
                confirmButtonText: "确定",
                type: "warning",
              });
            });
        })
        .catch(() => { });
    },
    //删除选中项
    deleteChoose() {
      if (this.multipleSelection.length == 0) return;
      this.$confirm("是否删除选中的商品？", "提示", {
        confirmButtonText: "确定删除",
        cancelButtonText: "我再想想",
        type: "warning",
      })
        .then(() => {
          let obj = [];
          let _index = this.multipleSelection[0].index;
          for (let i = 0; i < this.multipleSelection.length; i++) {
            obj.push(this.multipleSelection[i].cartItemId);
          }
          deleteTheGroup(obj)
            .then((res) => {
              this.$alert("删除成功", "提示", {
                confirmButtonText: "确定",
                type: "success",
              });
              this.init();
            })
            .catch((err) => {
              this.$alert("发生错误，删除失败", "提示", {
                confirmButtonText: "确定",
                type: "warning",
              });
            });
        })
        .catch(() => { });
    },
    //删除分组
    deleteOneGroup(index) {
      this.$confirm("是否删除本组中的商品？删除后将不可恢复！", "提示", {
        confirmButtonText: "确定删除",
        cancelButtonText: "我再想想",
        type: "warning",
      })
        .then(() => {
          let obj = [];
          let multipleTable = "multipleTable" + index;
          for (let i = 0; i < this.shopsData[index].curtainCartItems.length; i++) {
            obj.push(this.shopsData[index].curtainCartItems[i].cartItemId);
          }
          deleteTheGroup(obj)
            .then((res) => {
              this.deleteTable(index);
              this.$refs[multipleTable].clearSelection();
              this.$alert("删除成功", "提示", {
                confirmButtonText: "确定",
                type: "success",
              });
            })
            .catch((err) => {
              this.$alert("删除失败", "提示", {
                confirmButtonText: "确定",
                type: "warning",
              }).then(() => {
                this.$refs[multipleTable].clearSelection();
              });
            });
        })
        .catch(() => { });
    },
    //新建一个方法，不动原来的
    handleCommitNew() {
      if (this.multipleSelection.length === 0) {
        this.$alert("选择不能为空！", "提示", {
          type: "warning",
          confirmButtonText: "确定",
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
              confirmButtonText: "确定",
            }
          );
          return;
        }
      }
      sessionStorage.setItem("shopping", JSON.stringify(this.multipleSelection));
      Cookies.set("cur_status", 3);
      this.addTab("order/checkOrder");
    },
    //收起不能
    packUpNot(row, expandsRow) {
      this.expands.push(row.activity);
    },
    //返回展开行的商品数据
    tableData(index) {
      if (
        Array.isArray(this.shopsData) &&
        this.shopsData[index] &&
        this.shopsData[index].curtainCartItems
      ) {
        return this.shopsData[index].curtainCartItems;
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
  },
  created() {
    this.init();
  },
};
</script>
