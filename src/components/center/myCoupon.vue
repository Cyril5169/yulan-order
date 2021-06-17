<template>
  <el-card class="centerCard">
    <div slot="header">
      <span class="headSpan">我的优惠券</span>
    </div>
    <div>
      <div v-for="(item, index) of couponData" :key="index" class="coupon-card"
        :class="{ 'coupon-card-uneffect': notEffectiveCoupon(item)}">
        <div class="couponHead">
          <div class="coupon-logo" :class="{'coupon-logo-uneffect': notEffectiveCoupon(item)}">
          </div>
          <div class="logoTxt">
            <div class="head-title">
              {{ item.NOTES }}
            </div>
            <span>总返利&nbsp;{{ item.REBATE_MONEY }}元</span>
            <span class="rightCoupon">券号：{{ item.ID }}</span>
          </div>
        </div>

        <div class="couponBody">
          <div class="over-money" :class="notEffectiveCoupon(item) ? 'over-money-uneffect' : 'over-money-effect'">
            <span style="font-size:20px;">余额￥</span>
            <span v-if="isManager === '0'">***</span>
            <span v-else>{{ item.REBATE_MONEY_OVER }}</span>
          </div>
          <div class="valid-date" :class="{'valid-date-uneffect': notEffectiveCoupon(item)}">
            有效期：{{ item.DATE_START | dateFilter }}&nbsp;至&nbsp;{{ item.DATE_END | dateFilter }}
          </div>
          <div>适用：{{ item.APPLICATION }}</div>
          <div>
            <span @click="getRecordUseData(item.ID)" class="record-text">查看使用记录>></span>
            <span @click="getRecordBackData(item.ID)" class="record-text">查看返利记录>></span>
          </div>
        </div>
      </div>
    </div>

    <!-- 查看使用记录 -->
    <el-dialog :title="'优惠券使用记录[券号:' + couponId + ']'" :visible.sync="dialogUse" width="1000px" top="5vh">
      <keep-alive>
        <useRecordDetail v-if="dialogUse" :couponId="couponId"></useRecordDetail>
      </keep-alive>
    </el-dialog>
    <!-- 查看返利记录 -->
    <el-dialog :title="'优惠券返利记录[券号:' + couponId + ']'" :visible.sync="dialogBack" width="60%" top="5vh">
      <keep-alive>
        <couponRecordDetail v-if="dialogBack" :couponId="couponId"></couponRecordDetail>
      </keep-alive>
    </el-dialog>
  </el-card>
</template>

<script>
import { GetAllCoupon } from "@/api/couponASP";
import Cookies from "js-cookie";
import useRecordDetail from "./useRecordDetail";
import couponRecordDetail from "./couponRecordDetail";

export default {
  name: "MyCoupon",
  components: {
    useRecordDetail,
    couponRecordDetail
  },
  data() {
    return {
      isManager: Cookies.get("isManager"),
      couponData: [],
      dialogUse: false,
      dialogBack: false,
      couponId: "",
    };
  },
  methods: {
    getAllCouponData() {
      GetAllCoupon({ companyId: Cookies.get("companyId") }).then(res => {
        this.couponData = res.data;
      });
    },
    notEffectiveCoupon(item) {
      var unValidDate = true;
      var nowDate = new Date(new Date().setDate(new Date().getDate() - 1));
      //判断有效日期
      if (new Date(item.DATE_START).getTime() <= nowDate.getTime()
        && new Date(item.DATE_END).getTime() >= nowDate.getTime()) {
        unValidDate = false;
      }
      return unValidDate || item.REBATE_MONEY_OVER <= 0 || item.STATUS != '1';
    },
    getRecordUseData(itemID) {
      this.couponId = itemID;
      this.dialogUse = true;
    },
    getRecordBackData(itemId) {
      this.couponId = itemId;
      this.dialogBack = true;
    }
  },
  created() {
    this.getAllCouponData();
  }
};
</script>

<style scoped>
.headSpan {
  font-weight: bold;
  font-size: 18px;
  color: black;
}
.couponHead {
  height: 58px;
}
.couponBody {
  height: 160px;
  text-align: center;
  box-sizing: border-box;
}
.coupon-card {
  width: 369px;
  height: 219px;
  margin: 0 50px 20px 0;
  background: url("../../assets/img/coupon/coupon.png") no-repeat;
  background-size: 100% 100%;
  display: inline-block;
  font-size: 13px;
}
.coupon-card-uneffect {
  background: url("../../assets/img/coupon/blackCoupon.png") no-repeat;
  background-size: 100% 100%;
}
.coupon-logo {
  width: 40px;
  height: 40px;
  background: url("../../assets/img/coupon/logopng.png") no-repeat;
  background-size: 100% 100%;
  border-radius: 50%;
  float: left;
  margin-top: 8px;
  margin-left: 15px;
  margin-right: 10px;
}
.coupon-logo-uneffect {
  background: url("../../assets/img/coupon/blackLogo.jpg") no-repeat;
  background-size: 100% 100%;
}
.head-title {
  color: white;
  font-size: 18px;
  padding-top: 5px;
  font-weight: bold;
  letter-spacing: 2px;
}
.logoTxt span {
  display: inline-block;
  color: white;
  margin-top: 3px;
}
.rightCoupon {
  float: right;
  margin-right: 10px;
}
.over-money {
  font-size: 40px;
  font-weight: bold;
  margin: 5px 0;
  height: 45px;
  display: flex;
  justify-content: center;
  align-items: center;
}
.over-money-uneffect {
  color: rgb(180, 180, 180);
}
.over-money-effect {
  background: -webkit-linear-gradient(
    left,
    rgb(253, 59, 49) 22%,
    rgb(253, 128, 67) 50%,
    rgb(253, 168, 77) 100%
  );
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}
.valid-date {
  display: inline-block;
  height: 30px;
  line-height: 30px;
  padding: 0 20px;
  margin: 5px 0;
  color: white;
  background: rgb(253, 85, 56);
  border-width: 10px;
  border-radius: 15px;
}
.valid-date-uneffect {
  background: gray;
}
.record-text {
  margin: 0 5px;
  cursor: pointer;
}
.record-text:hover {
  color: orange;
}
</style>
