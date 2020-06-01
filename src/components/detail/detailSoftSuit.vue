<template>
  <div>
    <el-card shadow="hover">
      <div slot="header">
        <span class="fstrong f16">修改商品信息：</span>
        <!-- <el-steps
                    style="margin-top: -10px;"
                    align-center
                    class="r scale" 
                    :space="150"
                    :active="1"
                    process-status="wait" 
                    finish-status="success">
                    <el-step title="填写商品信息"></el-step>
                    <el-step class="ml10 mr10" title="核对订单信息"></el-step>
                    <el-step class="ml10" title="成功提交订单"></el-step>
                </el-steps> -->
      </div>
      <router-link to="/shoppingCar/shopping?softSuit" tag="div">
        <el-button
          type="info"
          plain
          size="mini"
          class="r mr40"
          @click.native="
            closeToTab({
              oldUrl: 'detail/detailSoftSuit',
              newUrl: 'shoppingCar/shopping?softSuit'
            })
          "
        >
          返回
        </el-button>
      </router-link>
      <div class="dib" style="border-bottom: 1px solid #ebeef5;">
        <!-- <p class="fstrong f16" style="margin:0;">商品信息：</p> -->
        <table id="messageRight">
          <tr>
            <td>型号：</td>
            <td>{{ data.item.itemNo }}</td>
          </tr>
          <tr>
            <td>品牌：</td>
            <td>{{ data.item.brandName }}</td>
          </tr>
          <tr></tr>
          <tr>
            <td>尺寸：</td>
            <td>
              <span
                v-if="data.item.rzGrade !== null || data.item.rzGrade !== 0"
                >{{ data.item.rzGrade }}</span
              >
              <span v-else>{{ data.item.fixGrade / 100 + "米" }}</span>
            </td>
          </tr>
          <tr>
            <td>风格：</td>
            <td>{{ data.item.fixType === "01" ? "定宽" : "定高" }}</td>
          </tr>
          <tr>
            <td>单位：</td>
            <td>{{ data.unit }}</td>
          </tr>
          <tr>
            <td>单价：</td>
            <td>
              <span v-if="customerType === '10'">
                <currency-input
                  v-model="data.price"
                  :placeholder="'请输入单价'"
                  :customStyle="'width: 150px;'"
                  :customClass="customClass"
                ></currency-input>
              </span>
              <span v-else-if="isManager === '0'">***</span>
              <span v-else>{{ data.price }}</span>
            </td>
          </tr>
          <tr v-if="customerType === '10'">
            <td>网上销售金额：</td>
            <td>
              <span>
                <currency-input
                  v-model="data.onlineSalesAmount"
                  :placeholder="'请输入单价'"
                  :customStyle="'width: 150px;'"
                  :customClass="customClass"
                ></currency-input>
              </span>
            </td>
          </tr>
          <tr v-if="data.item.minimumPurchase">
            <td>起购数量：</td>
            <td>{{ data.item.minimumPurchase }}</td>
          </tr>
          <tr>
            <td>数量<span v-if="data.unit === '平方米'">(宽*高)</span>：</td>
            <td>
              <div v-if="data.unit === '平方米'">
                <currency-input
                  v-model="data.width"
                  :placeholder="'请输入宽度'"
                  :customStyle="'width: 100px;'"
                  :customClass="customClass"
                ></currency-input>
                ×
                <currency-input
                  v-model="data.height"
                  :placeholder="'请输入高度'"
                  :customStyle="'width: 100px;'"
                  :customClass="customClass"
                ></currency-input>
              </div>
              <div v-else>
                <currency-input
                  v-model="data.quantity"
                  :placeholder="'请输入数量'"
                  :customStyle="'width: 150px;'"
                  :customClass="customClass"
                ></currency-input>
              </div>
            </td>
          </tr>
          <tr>
            <td>活动：</td>
            <td>
              <el-select
                style="width:300px;"
                :disabled="disableFlag"
                v-model="data.activityId"
                :placeholder="
                  disableFlag === false ? '请选择一个活动' : '此产品不参与活动'
                "
              >
                <el-option
                  v-for="item in activity"
                  :label="item.label"
                  :key="item.value"
                  :value="item.value"
                >
                </el-option>
              </el-select>
              <span
                class="pl10 t-red"
                v-if="
                  data.activityId === data.activityName &&
                    data.activityEffective != null &&
                    !data.activityEffective
                "
              >
                此活动已经过期，请重新选择
              </span>
            </td>
          </tr>
          <tr>
            <td>备注：</td>
            <td>
              <div class="rel dib" style="width:300px;position:relative;">
                <el-input
                  resize="none"
                  type="textarea"
                  maxlength="50"
                  placeholder="请输入您的备注信息（50字内）"
                  :autosize="{ minRows: 3, maxRows: 6 }"
                  v-model="data.note"
                >
                </el-input>
                <i
                  class="el-icon-edit"
                  style="position:absolute;
                                        right:10px;bottom:5px;"
                >
                </i>
              </div>
              <span style="margin-left:10px;"
                >{{ data.note ? data.note.length : 0 }}/50</span
              >
            </td>
          </tr>
        </table>
      </div>
      <div class="mt20">
        <div style="text-align: left; margin-left: 125px;" class="mt20">
          <!-- <el-button type="success" class="mr20">一键购</el-button> -->
          <!-- <router-link to="/shoppingCar/shopping?softSuit"> -->
          <el-button type="danger" @click.native="update">
            保存至购物车
          </el-button>
          <!-- </router-link> -->
        </div>
      </div>
    </el-card>
  </div>
</template>

<script>
import Cookies from "js-cookie";
import { mapMutations, mapActions } from "vuex";
import { mapState } from "vuex";
import { findItemActivity } from "@/api/findActivity";
import { updateShoppingCar, updateShopPrice } from "@/api/shop";
import { getItemById, GetPromotionByItem } from "@/api/orderListASP";

export default {
  name: "DetailSoftSuit",
  data() {
    return {
      cid: Cookies.get("cid"),
      customerType: Cookies.get("customerType"),
      isManager: Cookies.get("isManager"), //是否为管理员
      activity: [], //活动
      getParams: this.$route.params.message, //获取到的传参
      data: [], //传过来的数据
      remark: "",
      isSplitShipment: true, //库存不足时分批发货吗
      disableFlag: false, //判断是否禁用选择框
      //按钮样式
      customClass: ["qty-btn"]
    };
  },
  created() {
    if (this.getParams !== undefined) Cookies.set("softSuit", this.getParams);
    this.data = JSON.parse(Cookies.get("softSuit"));
    this.findShopsActivity();
  },
  methods: {
    ...mapMutations("navTabs", ["addTab"]),
    ...mapActions("navTabs", ["closeTab", "closeToTab"]),
    //找到商品可选活动
    findShopsActivity() {
      //判断活动是否存在，不存在的话将activityId转为activityName，让选择器显示
      if (this.data.activityEffective === false) {
        this.data.activityId = this.data.activityName;
      }
      var itemVersion = this.data.item.itemVersion
        ? this.data.item.itemVersion
        : "";
      //findItemActivity({
      GetPromotionByItem({
        //CID: this.cid,
        cid: this.cid,
        customerType: this.customerType,
        itemNo: this.data.item.itemNo,
        itemVersion: this.data.item.itemVersion,
        productType: this.data.item.productType,
        productBrand: this.data.item.productBrand
      })
        .then(res => {
          if (res.data.length === 0 && this.data.activityEffective !== false) {
            this.disableFlag = true;
          } else {
            this.disableFlag = false;
          }
          for (var i = 0; i < res.data.length; i++) {
            var obj = {
              label: res.data[i].ORDER_TYPE + " -- " + res.data[i].ORDER_NAME,
              value: res.data[i].P_ID
            };
            this.activity.push(obj);
          }
          this.activity.push({
            label: "不参与活动",
            value: ""
          });
        })
        .catch(err => {
          console.log(err);
        });
    },
    //保存至购物车
    update() {
      //判空操作
      if (
        this.data.width === null ||
        this.data.width === 0 ||
        this.data.height === null ||
        this.data.height === 0 ||
        this.data.width === undefined ||
        this.data.height === undefined
      ) {
        this.data.width = "";
        this.data.height = "";
      }
      if (
        this.data.quantity === null ||
        this.data.quantity === 0 ||
        this.data.quantity === undefined
      )
        this.data.quantity = "";
      //判断数据是否合理
      let newNum;
      if (this.data.unit === "平方米") {
        newNum = this.data.width * this.data.height;
      } else {
        newNum = this.data.quantity;
      }
      newNum = parseFloat(newNum);
      //判断活动是否合理
      let actRe = this.activity.some(item => {
        if (item.value === this.data.activityId) {
          return true;
        }
      });
      if (!actRe) {
        this.$alert("请选择合适的活动", "提示", {
          type: "warning",
          confirmButtonText: "确定"
        });
        return;
      }
      //位运算符判断
      let re = /^[1-9]\d*$/;
      if (this.data.softType === "ML" || this.data.softType === "XHB") {
        re = /^[0-9]+(.[0-9]{1})?$/;
      }
      if (re.test(newNum) === false) {
        this.$alert("数量栏请填写正确的数字", "提示", {
          type: "warning",
          confirmButtonText: "确定"
        });
        return;
      }
      if (this.customerType === "10") {
        if (!this.data.onlineSalesAmount) {
          this.$alert("请填写网上销售金额", "提示", {
            type: "warning",
            confirmButtonText: "确定"
          });
          return;
        }
      }
      //判断起购数量
      if (
        this.data.item.minimumPurchase != 0 &&
        newNum < this.data.item.minimumPurchase
      ) {
        this.$alert(
          "本产品最小起购数量为" +
            this.data.item.minimumPurchase +
            this.data.unit,
          "提示",
          {
            type: "warning",
            confirmButtonText: "确定"
          }
        );
        return;
      }
      newNum = newNum.toString();
      let changeArr = [];
      let updateObj = {
        commodityID: this.data.id,
        activityID: this.data.activityId,
        quantity: this.data.quantity,
        width: this.data.width,
        height: this.data.height,
        note: this.data.note
      };
      if (this.customerType === "10") {
        updateObj.onlineSalesAmount = this.data.onlineSalesAmount;
      }
      changeArr.push(updateShoppingCar(updateObj));
      if (this.customerType === "10") {
        if (this.data.price === "" || !this.data) {
          this.$alert("请输入价格", "提示", {
            type: "warning",
            confirmButtonText: "确定"
          });
          return;
        }
        let obj = {
          commodityID: this.data.id,
          customerType: this.customerType,
          price: this.data.price.toString()
        };
        //将价格修改塞入数组，和修改详情一起处理
        changeArr.push(updateShopPrice(obj));
      }
      Promise.all(changeArr)
        .then(res => {
          Cookies.set("softSuit", this.data);
          this.$alert("此型号已修改成功", "添加成功", {
            confirmButtonText: "确定",
            type: "success",
            showClose: false
          }).then(() => {
            this.addTab("shoppingCar/shopping?softSuit");
            this.closeTab("detail/detailSoftSuit");
          });
        })
        .catch(err => {
          this.$alert(`${err.msg}`, "添加失败", {
            confirmButtonText: "确定",
            type: "warning"
          });
          console.log(err);
        });
    }
  }
};
</script>

<style scoped>
.scale {
  transform: scale(0.75, 0.75);
  -ms-transform: scale(0.75, 0.75);
  -moz-transform: scale(0.75, 0.75);
  -webkit-transform: scale(0.75, 0.75);
  -o-transform: scale(0.75, 0.75);
}
#messageRight {
  margin: 10px 20px;
  display: inline-block;
  vertical-align: middle;
}
#messageRight tr td:nth-child(1) {
  font-weight: bold;
  text-align: right;
}
#messageRight tr td:nth-child(2) {
  padding-left: 20px;
}
#messageRight td {
  padding: 5px;
  font-size: 14px;
}
.t-red {
  color: red;
}
.pl10 {
  padding-left: 10px;
}
.qty-btn {
  font-size: 14px;
}
</style>