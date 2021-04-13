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
            <el-table-column label="宽度(m)" width="100" align="center">
              <template slot-scope="scope1">{{ scope1.row.width }}</template>
            </el-table-column>
            <el-table-column label="高度(m)" width="100" align="center">
              <template slot-scope="scope1">{{ scope1.row.height }}</template>
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
            <el-table-column label="单价" width="100" align="center">
              <template slot-scope="scope1">
                <span v-if="isManager === '0'">***</span>
                <span v-else>{{(scope1.row.price) | dosageFilter}}</span>
              </template>
            </el-table-column>
            <el-table-column width="100" label="数量" align="center">
              <template slot-scope="scope1">
                {{ scope1.row.count }}
              </template>
            </el-table-column>
            <el-table-column label="小计" width="100" align="center">
              <template slot-scope="scope1">
                <span v-if="isManager === '0'">***</span>
                <span v-else>{{scope1.row.totalPrice}}</span>
              </template>
            </el-table-column>
            <el-table-column label="折后金额" width="100" align="center">
              <template slot-scope="scope1">
                <span v-if="isManager === '0'">***</span>
                <span v-else>{{ scope1.row.totalActivityPrice }}</span>
              </template>
            </el-table-column>
            <el-table-column label="操作" width="180" align="center">
              <template slot-scope="scope1">
                <a class="link-detail" @click="handleDetails(scope1.row)" v-if="canShowDetail(scope1.row)">查看详情</a>
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
import { GetCartItem, DeleteCartItems } from "@/api/shopASP";
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
      expands: [], //控制展开行
    };
  },
  computed: {
    totalPriceMoney() {
      var totalPrice = 0;
      for (var i = 0; i < this.multipleSelection.length; i++) {
        totalPrice += this.multipleSelection[i].totalActivityPrice
      }
      return totalPrice;
    }
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
      GetCartItem({
        cid: Cookies.get("cid"),
        commodityType: "newcurtain",
      })
        .then((res) => {
          //过滤无效数据
          this.dataDeal(res.data);
          this.$root.$emit("refreshBadgeIcon", "newCurtainCount");
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
    },
    //活动是否可以修改
    canShowDetail(row) {
      return (!row.salPromotion || (row.salPromotion && row.salPromotion.MODIFY_FLAG != "N"));
    },
    //查看详情
    handleDetails(data) {
      this.addTab("shoppingCar/shoppingNewCurtainEdit");
      this.$router.push({
        name: `shoppingNewCurtainEdit`,
        params: {
          curtain: data,
        },
      });
    },
    //删除单件商品
    deleteSingle(row) {
      this.$confirm("是否删除选中的商品？删除后将不可恢复！", "提示", {
        confirmButtonText: "确定删除",
        cancelButtonText: "我再想想",
        type: "warning",
      })
        .then(() => {
          let data = [];
          data.push(row.cartItemId);
          DeleteCartItems({ cartItemIds: data }).then((res) => {
            this.$alert("删除成功", "提示", {
              confirmButtonText: "确定",
              type: "success",
            });
            this.init();
          }).catch((err) => {
            this.$alert("发生错误，删除失败", "提示", {
              confirmButtonText: "确定",
              type: "warning",
            });
          });
        }).catch(() => { });
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
          let data = [];
          let _index = this.multipleSelection[0].index;
          for (let i = 0; i < this.multipleSelection.length; i++) {
            data.push(this.multipleSelection[i].cartItemId);
          }
          DeleteCartItems({ cartItemIds: data }).then((res) => {
            this.$alert("删除成功", "提示", {
              confirmButtonText: "确定",
              type: "success",
            });
            this.init();
          }).catch((err) => {
            this.$alert("发生错误，删除失败", "提示", {
              confirmButtonText: "确定",
              type: "warning",
            });
          });
        }).catch(() => { });
    },
    //删除分组
    deleteOneGroup(index) {
      this.$confirm("是否删除本组中的商品？删除后将不可恢复！", "提示", {
        confirmButtonText: "确定删除",
        cancelButtonText: "我再想想",
        type: "warning",
      })
        .then(() => {
          let data = [];
          let multipleTable = "multipleTable" + index;
          for (let i = 0; i < this.shopsData[index].curtainCartItems.length; i++) {
            data.push(this.shopsData[index].curtainCartItems[i].cartItemId);
          }
          DeleteCartItems({ cartItemIds: data }).then((res) => {
            this.$alert("删除成功", "提示", {
              confirmButtonText: "确定",
              type: "success",
            });
            this.init();
          }).catch((err) => {
            this.$alert("删除失败", "提示", {
              confirmButtonText: "确定",
              type: "warning",
            }).then(() => {
              this.$refs[multipleTable].clearSelection();
            });
          });
        }).catch(() => { });
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
            `产品中的${this.multipleSelection[i].modelNumber}对应的活动已经过期，无法提交，请更换活动`,
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
      Cookies.set("new_cur_status", 1);
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
