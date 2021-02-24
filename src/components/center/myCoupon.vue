<template>
  <el-card class="centerCard">
    <div slot="header">
      <span class="headSpan">我的优惠券</span>
      <!-- <el-button @click="addTab('order/myOrder')" style="float:right;" size="small"  type="success" plain>返回</el-button> -->
    </div>
    <div>
      <div
        v-for="(item, index) of couponData"
        :key="index"
        :class="
          item.dateId != 1 || item.rebateMoneyOver <= 0 || item.status !=1
            ? switchClass.cctvF
            : switchClass.cctvT
        "
      >
        <div class="couponHead">
          <div
            :class="
              item.dateId != 1 || item.rebateMoneyOver <= 0 || item.status !=1
                ? switchClass.logoF
                : switchClass.logoT
            "
          ></div>
          <div class="logoTxt">
            <p
              style="color:white; font-size:15px; padding-top:5px; font-weight:bold; letter-spacing:2px;"
            >
              {{ item.notes }}
            </p>
            <span>总返利&nbsp;{{ item.rebateMoney }}元</span>
            <span class="rightCoupon">券号：{{ item.id }}</span>
          </div>
        </div>

        <div class="couponBody">
          <p
            :class="
              item.dateId != 1 || item.rebateMoneyOver <= 0 || item.status !=1
                ? switchClass.transTxtF
                : switchClass.transTxtT
            "
            style="text-align:center"
          >
            <span style="font-size:18px;">余额￥</span>
            <span v-if="isManager === '0'">***</span>
            <span v-else>{{ item.rebateMoneyOver }}</span>
          </p>
          <div style="margin:0 auto; width:245px;">
            <div
              :class="
                item.dateId != 1 || item.rebateMoneyOver <= 0 || item.status !=1
                  ? switchClass.roundedRectangleF
                  : switchClass.roundedRectangleT
              "
            >
              <p>
                &nbsp;&nbsp;&nbsp;有效期：{{
                  item.dateStart | datatrans
                }}至&nbsp;&nbsp;{{ item.dateEnd | datatrans }}
              </p>
            </div>
          </div>
          <br />
          <p style="text-align:center;">适用：{{ item.application }}</p>
          <div class="Record" style="text-align:center">
            <span @click="RecordUse(item.id)" style="cursor: pointer;"
              >查看使用记录>>&nbsp;&nbsp;&nbsp;</span
            >
            <span @click="RecordBack(item.id)" style="cursor: pointer;"
              >查看返利记录>></span
            >
          </div>
        </div>
      </div>
    </div>
    <!-- 查看使用记录 -->
    <el-dialog
      :title="'优惠券使用记录[券号:' + useTable.couponId + ']'"
      :visible.sync="dialogUse"
      width="60%"
      top="5vh"
    >
      <keep-alive>
        <useRecordDetail
          v-if="dialogUse"
          :useTable="useTable"
        ></useRecordDetail>
      </keep-alive>
      <span slot="footer" class="dialog-footer">
        <el-button @click="dialogUse = false">关闭</el-button>
      </span>
    </el-dialog>
    <!-- 查看返利记录 -->
    <el-dialog
      :title="'优惠券返利记录[券号:' + backTable.couponId + ']'"
      :visible.sync="dialogBack"
      width="60%"
      top="5vh"
    >
      <keep-alive>
        <couponRecordDetail
          v-if="dialogBack"
          :backTable="backTable"
        ></couponRecordDetail>
      </keep-alive>
      <span slot="footer" class="dialog-footer">
        <el-button @click="dialogBack = false">关闭</el-button>
      </span>
    </el-dialog>
  </el-card>
</template>

<script>
import { searchTickets } from "@/api/orderList";
import { manageCoupon } from "@/api/orderList";
import { CouponUseRecord } from "@/api/orderList";
import { CouponbackRecord } from "@/api/orderList";
import Cookies from "js-cookie";
import useRecordDetail from "./useRecordDetail";
import couponRecordDetail from "./couponRecordDetail";
import { getUseRecord } from "@/api/orderListASP";

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
      switchClass: {
        cctvT: "cctvT",
        cctvF: "cctvF",
        logoT: "logoT",
        logoF: "logoF",
        transTxtT: "transTxtT",
        transTxtF: "transTxtF",
        roundedRectangleT: "roundedRectangleT",
        roundedRectangleF: "roundedRectangleF"
      },
      dialogUse: false,
      dialogBack: false,
      useTable: [],
      backTable: []
    };
  },
  methods: {
    allTickets() {
      var url = "/order/findRebate.do";
      var data = {
        cid: Cookies.get("cid"),
        companyId: Cookies.get("companyId")
      };
      manageCoupon(url, data).then(res => {
        this.couponData = res.data;
      });
    },
    RecordUse(itemID) {
      this.useTable = [];
      var url = "/order/findRecrods.do";
      // var data = {
      //   id: itemID
      // };
      var data = {
        couponId: itemID,
        keyWords: "",
        beginTime: "0001/1/1",
        finishTime: "9999/12/31",
        page: 1,
        limit: 20
      };
      //CouponUseRecord(url, data)
      getUseRecord(data).then(res => {
        this.useTable = res.data;
        this.useTable.couponId = itemID;
        this.useTable.count = res.count;
        this.dialogUse = true;
      });
    },
    RecordBack(itemId) {
      var url = "/order/getReturnRecord.do";
      var data = {
        id: itemId
      };
      CouponbackRecord(url, data).then(res => {
        this.backTable = res.data;
        this.backTable.couponId = itemId;
        this.dialogBack = true;
      });
    }
  },
  filters: {
    datatrans(value) {
      //时间戳转化大法
      let date = new Date(value);
      let y = date.getFullYear();
      let MM = date.getMonth() + 1;
      MM = MM < 10 ? "0" + MM : MM;
      let d = date.getDate();
      d = d < 10 ? "0" + d : d;
      let h = date.getHours();
      h = h < 10 ? "0" + h : h;
      let m = date.getMinutes();
      m = m < 10 ? "0" + m : m;
      let s = date.getSeconds();
      s = s < 10 ? "0" + s : s;
      return y + "-" + MM + "-" + d + " "; /* + h + ':' + m + ':' + s; */
    }
  },
  created: function() {
    this.allTickets();
  }
};
</script>

<style scoped>
.headSpan {
  font-weight: bold;
  font-size: 18px;
  color: black;
}
.centerCard {
  margin: 0 auto;
  position: relative;
}
.centerCard p{
  margin: 0;
}
.roundedRectangleF {
  display: inline-block;
  height: 30px;
  line-height: 30px;
  margin: 0 auto;
  color: white;
  width: 238px;
  background: gray;
  /* background: rgb(253, 85, 56);这个是能用的 */
  border-width: 10px; /*边缘的宽度*/
  border-radius: 15px; /*圆角的大小 */
}
.roundedRectangleT {
  display: inline-block;
  height: 30px;
  line-height: 30px;
  margin: 0 auto;
  color: white;
  width: 238px;
  background: rgb(253, 85, 56);
  border-width: 10px; /*边缘的宽度*/
  border-radius: 15px; /*圆角的大小 */
}
.cctvF {
  background: url("blackCoupon.png");
  width: 350px;
  height: 230px;
  margin-right: 5%;
  background-size: 100%;
  background-repeat: no-repeat;
  display: inline-block;
  font-size: 13px;
}
.cctvT {
  background: url("coupon.png");
  width: 350px;
  height: 230px;
  margin-right: 5%;
  background-size: 100%;
  background-repeat: no-repeat;
  display: inline-block;
  font-size: 13px;
}
.couponHead {
  height: 50px;
}
.couponBody {
  height: 170px;
  margin-top: 15px;
}
.logoF {
  background: url("blackLogo.jpg");
  width: 40px;
  height: 40px;
  background-size: 100%;
  background-repeat: no-repeat;
  border-radius: 50%;
  float: left;
  margin-top: 8px;
  margin-left: 5%;
  margin-right: 3%;
}
.logoT {
  background: url("logopng.png");
  width: 40px;
  height: 40px;
  background-size: 100%;
  background-repeat: no-repeat;
  border-radius: 50%;
  float: left;
  margin-top: 8px;
  margin-left: 5%;
  margin-right: 3%;
}
.logoTxt span {
  display: inline-block;
  color: white;
  margin-top: 3px;
}
.transTxtF {
  font-size: 40px;
  font-weight: bold;
  color: rgb(
    180,
    180,
    180
  ); /* 
  background: -webkit-linear-gradient(left,  rgb(253,59,49) 22%, rgb(253,128,67) 50%,  rgb(253,168,77) 100% );   
  -webkit-background-clip: text;        
  -webkit-text-fill-color: transparent;  */
}
.transTxtT {
  font-size: 40px;
  font-weight: bold;
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
.Record span:hover {
  color: orange;
}
.rightCoupon {
  float: right;
  margin-right: 10px;
}
</style>
<style>
.el-table .success-row {
  background: #f0f9eb;
}
</style>