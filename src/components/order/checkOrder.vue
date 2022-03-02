<template>
  <el-card class="centerCard">
    <div slot="header">
      <span class="zoomLeft">甲方：</span>
      <span class="zoomRight">广东玉兰集团股份有限公司</span>
      <span class="zoomLeft">乙方：</span>
      <span class="zoomRight">{{ realName }}</span>
      <span class="zoomLeft">经办人：</span>
      <span class="zoomRight">{{ chargeData.CUSTOMER_AGENT }}({{ chargeData.OFFICE_TEL }})</span>
    </div>

    <div class="grayDiv">
      <fieldset>
        <legend>发货信息</legend>
        <div>
          <div :class="{'overflow-cls': moreAddressVisible}" style="position: relative;">
            <div v-for="(item, index) of addressShowData" :key="index">
              <el-radio @change="selectAddress" v-model="radio" :label="index" border size="medium" style="margin-top:5px;">
                {{ item.WL_CONTACTS }}({{ item.WL_TEL }})
                {{ item.PROVINCE }}{{ item.CITY }}{{ item.COUNTRY}}{{ item.POST_ADDRESS }}
              </el-radio>
              <span v-if="item.ADDRESS_ID == 0" style="color:tomato; font-weight:bold;">默认地址</span>
            </div>
            <span @click.prevent="dialogOpen" class="charge" style="position:absolute;top:0;right:20px;">
              管理收货地址
            </span>
          </div>
          <div style="width:250px;margin-top:10px;" class="charge" @click.prevent="moreAddressVisible=!moreAddressVisible">
            {{ moreAddressVisible? '收起↑':'更多地址⇣' }}
          </div>
        </div>
        <!-- 配送信息 -->
        <span>选择配送方式：</span>
        <el-select @change="changePeiSong" style="width:300px;" v-model="ctm_order.deliveryType" placeholder="请选择">
          <el-option v-for="item in options" :key="item.deliveryType" :label="item.label" :value="item.deliveryType"
            :disabled="item.disabled"></el-option>
        </el-select>
        <span style="margin-left:50px;">物流公司：</span>
        <el-input style="width:300px;" :disabled="this.ctm_order.deliveryType == 3 ? false : true"
          v-model="ctm_order.deliveryNotes" placeholder="物流公司"></el-input>
      </fieldset>

      <fieldset>
        <legend>购买用户信息</legend>
        <span>用户姓名：</span>
        <el-input style="width:330px;" v-model="ctm_order.buyUser" placeholder="请输入用户姓名"></el-input>
        <span style="margin-left:50px;">用户电话：</span>
        <el-input style="width:300px;" v-model="ctm_order.buyUserPhone" placeholder="请输入用户电话"></el-input>
        <span @click.prevent="buyUserShow" class="charge" style="float:right;margin-right:20px;">
          管理消费者信息
        </span>
        <br />
        <br />
        <span>选择地区：</span>
        <el-select @change="getCity" style="width:253px;" v-model="ctm_order.buyUserArea1" placeholder="请选择省份">
          <el-option v-for="(item, index) in provinceData" :key="index" :label="item.REGION_NAME" :value="item.REGION_NAME">
          </el-option>
        </el-select>
        <el-select @change="getArea" style="width:253px;" v-model="ctm_order.buyUserArea2" placeholder="请选择城市">
          <el-option v-for="(item, index) in cityData" :key="index" :label="item.REGION_NAME" :value="item.REGION_NAME">
          </el-option>
        </el-select>
        <el-select style="width:254px;" v-model="ctm_order.buyUserArea3" placeholder="请选择县区">
          <el-option v-for="(item, index) in areaData" :key="index" :label="item.REGION_NAME" :value="item.REGION_NAME">
          </el-option>
        </el-select>
        <br />
        <span>详细地址：</span>
        <el-input style="width:770px;margin-top:10px;" v-model="ctm_order.buyUserPostAddress" placeholder="请输入用户地址">
        </el-input>
        <br />
        <span>天猫订单号：</span>
        <el-input style="width:200px;margin-top:10px;" v-model="ctm_order.tmallOrderNo" placeholder="请输入天猫订单号">
        </el-input>
        <br />
        <div style="display:inline-block;vertical-align:middle;margin:10px 10px 0 0;">
          <div style="margin:auto;">上传购买凭证：</div>
          <span style="font-size:13px;color:grey;vertical-align:middle;">(消费者在门店的订货单)</span>
        </div>
        <el-upload class="upload-de" style="display:inline-block;vertical-align:middle;margin-top:10px;" multiple action="#"
          list-type="picture-card" :http-request="handleUpload" :on-change="handleChange" :on-preview="handlePictureCardPreview"
          :on-remove="handleRemove" :before-upload="beforeAvatarUpload" :file-list="fileList">
          <i class="el-icon-plus"></i>
        </el-upload>
      </fieldset>

      <fieldset>
        <legend>备注信息</legend>
        <el-input type="textarea" maxlength="140" style="width:100%" :autosize="{ minRows: 3, maxRow: 4 }" resize="none"
          v-model="ctm_order.notes" placeholder="请输入订单备注(140字符以内，任何发货信息写在备注无效！)"></el-input>
        <span style="color:#ccc">{{ ctm_order.notes | calLength }}/140</span>
      </fieldset>
      <!-- <div v-if="packingShow">
          <span>分包提示：<span style="color:red;">*</span></span>
          <el-radio-group
            v-model="ctm_order.packingNote"
            style="margin-left:10px;"
          >
            <el-radio label="不分包">不分包</el-radio>
            <el-radio label="同型号不分包，不同型号分包"
              >同型号不分包，不同型号分包</el-radio
            >
            <el-radio label="全部分包">全部分包</el-radio>
          </el-radio-group>
        </div>
        <br /> -->
      <fieldset>
        <legend>工程报备单号</legend>
        <el-input style="width:400px" v-model="ctm_order.projectNo" placeholder="请输入工程报备单号"></el-input>
      </fieldset>
    </div>
    <!-- 明细 -->
    <el-table :data="order_details" border :row-class-name="tableRowClassName">
      <el-table-column prop="itemNo" align="center" label="型号"></el-table-column>
      <el-table-column align="center" label="数量">
        <template slot-scope="scope1">
          <span>{{ scope1.row.qtyRequired }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="unit" align="center" label="单位"></el-table-column>
      <el-table-column prop="promotion" align="center" label="活动类型" show-overflow-tooltip></el-table-column>
      <el-table-column prop="partSendId" align="center" :formatter="formatRole" label="发货说明"></el-table-column>
      <el-table-column align="center" label="实际金额">
        <template slot-scope="scope1">
          <span v-if="isManager === '0'">***</span>
          <span v-else>{{ scope1.row.prime_cost }}</span>
        </template>
      </el-table-column>
      <el-table-column align="center" label="折后金额">
        <template slot-scope="scope1">
          <span v-if="isManager === '0'">***</span>
          <span v-else>{{ scope1.row.finalPrice }}</span>
        </template>
      </el-table-column>
      <el-table-column align="center" label="月返利">
        <template slot-scope="scope1">
          <span v-if="isManager === '0'">***</span>
          <span v-else>{{ scope1.row.yuefanli }}</span>
        </template>
      </el-table-column>
      <el-table-column align="center" label="年返利">
        <template slot-scope="scope1">
          <span v-if="isManager === '0'">***</span>
          <span v-else>{{ scope1.row.nianfanli }}</span>
        </template>
      </el-table-column>
      <el-table-column align="center" label="应付金额">
        <template slot-scope="scope1">
          <span v-if="isManager === '0'">***</span>
          <span v-else>{{
              (scope1.row.finalPrice -
                scope1.row.yuefanli -
                scope1.row.nianfanli)
                | priceFilter
            }}</span>
        </template>
      </el-table-column>
    </el-table>

    <!-- 使用优惠券 -->
    <el-collapse v-model="activeNames" v-if="couponDataGroup.length > 0">
      <el-collapse-item title="使用优惠券" name="1">
        <div v-if="couponDataGroup.length > 1" style="color:red;">不同分组优惠券不能同时使用!</div>
        <div v-for="(couponList, couponIndex) in couponDataGroup" :key="couponIndex">
          <div v-if="couponDataGroup.length > 1">分组{{couponList.group}}</div>
          <div v-for="(item, index) in couponList.value" :key="index" class="coupon-card"
            :class="{'coupon-card-uneffect': !canUseCoupon(item)}">
            <div class="couponHead">
              <div class="coupon-logo" :class="{'coupon-logo-uneffect': !canUseCoupon(item)}"></div>
              <div class="logoTxt">
                <div class="head-title">
                  {{ item.NOTES }}
                </div>
                <span>总返利&nbsp;{{ item.REBATE_MONEY }}元</span>
                <span class="rightCoupon">券号：{{ item.ID }}</span>
              </div>
            </div>

            <div class="couponBody">
              <div class="over-money" :class="canUseCoupon(item) ? 'over-money-effect' : 'over-money-uneffect'">
                <span style="font-size:20px;">余额￥</span>
                <span v-if="isManager === '0'">***</span>
                <span v-else>{{ item.REBATE_MONEY_OVER }}</span>
              </div>
              <div>
                <div class="valid-date" :class="{'valid-date-uneffect': !canUseCoupon(item)}">
                  有效期：{{item.DATE_START | dateFilter}}&nbsp;至&nbsp;{{ item.DATE_END | dateFilter }}
                </div>
                <el-checkbox :disabled="!canUseCoupon(item)" v-model="item.checked" @change="changeCoupon($event, item)">
                </el-checkbox>
              </div>
              <div>适用：{{ item.APPLICATION }}</div>
              <div>
                <span @click="getRecordUseData(item.ID)" class="record-text">查看使用记录>>&nbsp;&nbsp;&nbsp;</span>
                <span @click="RecordBack(item.ID)" class="record-text">查看返利记录>></span>
              </div>
            </div>
            <div style="margin-left:20px;" v-if="!canUseCoupon(item)">
              由于活动："{{ canNotUseActivity(item) }}"，该优惠券无法使用
            </div>
          </div>
        </div>
      </el-collapse-item>
    </el-collapse>
    <div v-else style="margin:5px 0 0 5px">无可用优惠券</div>

    <div class="rightDiv">
      <div class="right-money">
        折后总金额：
        <span v-if="isManager === '0'">***</span>
        <span v-else>{{ totalPrice | priceFilter }}</span>
      </div>
      <div class="right-money">
        总返利：
        <span v-if="isManager === '0'">***</span>
        <span v-else>{{ backPrice | priceFilter }}</span>
      </div>
      <div class="right-money">
        应付总金额：
        <span v-if="isManager === '0'">***</span>
        <span v-else>{{ allSpend | priceFilter }}</span>
      </div>
      <el-button @click="backToOrder" size="medium" type="success" plain>返回订单</el-button>
      <el-button v-if="curtainStatus == '0'" @click="payIt" size="medium" type="danger" plain>立即提交</el-button>
      <el-button v-if="curtainStatus == '3'" @click="payNew" size="medium" type="danger" plain>确认提交</el-button>
    </div>

    <!-- 查看大图 -->
    <el-dialog :visible.sync="dialogImageVisible">
      <img width="100%" :src="dialogImageUrl" />
    </el-dialog>

    <!-- 地址管理信息 -->
    <el-dialog @close="getAllAddress()" title="管理收货地址" :visible.sync="dialogFormVisible" width="65vw">
      <addressList style="height: 500px;" />
    </el-dialog>

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

    <!-- 消费者管理 -->
    <el-dialog v-if="buyUserVisible" :visible.sync="buyUserVisible" title="管理消费者信息" :close-on-click-modal="false" width="65vw">
      <buyUserInfo style="height: 500px;" @row-dblclick="handleRowDBClick" canCheck></buyUserInfo>
    </el-dialog>
  </el-card>
</template>

<script>
import Cookies from "js-cookie";
import { GetCanUseCoupon } from "@/api/couponASP";
import {
  GetAreaList,
  orderSettlement,
  normalOrderSettlement,
  getCustomerInfo,
  GetPromotionsById,
  GetBuyUserInfo,
  GetPromotionByTypeAndId,
  UploadBuyUserFiles,
  DeleteFileByPath,
  GetCustomerAddressList
} from "@/api/orderListASP";
import Axios from "axios";
import { mapMutations, mapActions } from "vuex";
import useRecordDetail from "../center/useRecordDetail";
import couponRecordDetail from "../center/couponRecordDetail";
import buyUserInfo from "../buyUser/buyUserInfo"
import addressList from "../addressManagment/addressList"

export default {
  name: "checkOrder",
  components: {
    useRecordDetail,
    couponRecordDetail,
    buyUserInfo,
    addressList
  },
  data() {
    return {
      arrearsFlag: "",
      isManager: Cookies.get("isManager"),
      cid: Cookies.get("cid"),
      realName: Cookies.get("realName"),
      //返利弹窗
      dialogUse: false,
      dialogBack: false,
      curtainStatus: "",
      newCurtainStatus: "",
      buyUserVisible: false,
      couponId: "",
      product_group_tpye: "", //类型
      //获取地址
      addressListData: [],
      packingShow: false,
      overflowCls: "",
      moreAddressVisible: false,
      radio: 0,
      backPrice: 0.0,
      ctm_order: {
        buyUser: "",
        buyUserPhone: "",
        buyUserAddress: "",
        buyUserPicture: "",
        buyUserArea1: "",
        buyUserArea2: "",
        buyUserArea3: "",
        buyUserPostAddress: "",
        notes: "",
        deliveryNotes: "",
        deliveryType: "1",
        projectNo: "",
        postAddressModified: "0", //新增
        allSpend: "0",
        deliveryFlag: "0",
        invoiceFlag: "0",
        wlContacts: "",
        wlTel: "",
        postAddress: "",
        reciverArea1: "",
        reciverArea2: "",
        reciverArea3: "",
        tmallOrderNo: "",
      },
      options: [
        {
          deliveryType: "1",
          label: "普通物流(运费由甲方负责)",
        },
        {
          deliveryType: "3",
          label: "其它物流公司(运费由乙方负责)",
        },
      ],
      province: [],
      provinceData: [],
      cityData: [],
      areaData: [],
      //地址
      dialogFormVisible: false,
      order_details: [],
      activeNames: ["1"],
      couponData: [],
      couponDataGroup: [],
      selectCouponGroup: "",
      rebateY: "",
      rebateM: "",
      chargeData: {
        CUSTOMER_AGENT: "",
        OFFICE_TEL: "",
      },
      dialogImageUrl: "",
      dialogImageVisible: false,
      fileList: [],
      showWriteBuyUser: false,
      activityArray: [],
    };
  },
  filters: {
    priceFilter(value) {
      //四舍五入过滤大法
      let realVal = Math.round(parseFloat(value).mul(100)) / 100;
      //防止出现-0.00；
      if (realVal <= 0) {
        realVal = 0.0;
      }
      return realVal;
    },
    nameTrans(value) {
      if (value == "year") {
        return "年返券";
      } else if (value == "month") {
        return "月返券";
      } else return "其它券类";
    },
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
    },
  },
  computed: {
    totalPrice() {
      var allcost = 0;
      for (var i = 0; i < this.order_details.length; i++) {
        allcost = allcost.add(this.order_details[i].promotionCost);
      }
      return allcost;
    },
    //计算总价
    allSpend() {
      return this.totalPrice - this.backPrice;
    },
    addressShowData() {
      if (this.moreAddressVisible) {
        return this.addressListData;
      } else {
        if (this.addressListData.length)
          return [this.addressListData[0]];
        else
          return [];
      }
    }
  },
  methods: {
    ...mapActions("navTabs", ["closeToTab"]),
    //清除表单验证规则
    clearRule(formName) {
      this.$refs[formName].resetFields();
    },
    clearData() {
      this.country = [];
      this.city = [];
    },
    //清空下拉框
    changePeiSong() {
      if (this.ctm_order.deliveryType == 1) {
        this.ctm_order.deliveryNotes = "";
      }
    },
    //表格过滤  --是否允许分批
    formatRole(row, column) {
      if (row.partSendId == 0) {
        return "等生产";
      } else if (row.partSendId == 1) {
        return "分批发货";
      } else return "--";
    },
    getBackMoney(promotion_cost, money, thisMoney) {
      var backMoney = 0;
      if (money != 0) {
        backMoney = this.dosageFilter(thisMoney * money / promotion_cost);
      }
      return backMoney;
    },
    getLastBackMoney(allMoney, lastAllMoney, thisMoney) {
      if (allMoney == 0) {
        return allMoney;
      }
      if (allMoney - lastAllMoney > thisMoney) {
        return thisMoney;
      }
      else {
        return allMoney - lastAllMoney;
      }
    },
    //获取优惠券
    _getTickets() {
      var url = "/order/getRebate.do";
      var data = {
        cid: Cookies.get("cid"),
        companyId: Cookies.get("companyId"),
        typeId: this.product_group_tpye,
      };
      GetCanUseCoupon({ companyId: Cookies.get("companyId") }).then((res) => {
        this.couponData = res.data;
        for (var i = 0; i < this.couponData.length; i++) {
          this.$set(this.couponData[i], "checked", false);
        }
        //按照组别进行分组
        this.couponDataGroup = this.groupBy(this.couponData, "GROUP_TYPE");
      });
    },
    //单列的groupby
    groupBy(array, name, filterMethod = function (a) { return a }) {
      let groups = [];
      array.forEach((item) => {
        let groupName = filterMethod(item[name]);
        var hasgroup = groups.filter((item) => item.group == groupName);
        if (hasgroup.length) {
          hasgroup[0].value.push(item);
        } else {
          groups.push({
            group: groupName,
            value: [item],
          });
        }
      });
      return groups;
    },
    canUseCoupon(couponData) {
      for (var i = 0; i < this.order_details.length; i++) {
        if (
          this.order_details[i].activityId &&
          this.order_details[i].salPromotion
        ) {
          var onePro = this.order_details[i].salPromotion;
          if (onePro.REBATE_FLAG == "N") {
            return false;
          }
          if (
            couponData.REBATE_TYPE != onePro.REBATE_TYPE &&
            onePro.REBATE_TYPE != "all"
          ) {
            return false;
          }
        }
      }
      return true;
    },
    canNotUseActivity(couponData) {
      for (var i = 0; i < this.order_details.length; i++) {
        if (
          this.order_details[i].activityId &&
          this.order_details[i].salPromotion
        ) {
          var onePro = this.order_details[i].salPromotion;
          if (onePro.REBATE_FLAG == "N") {
            return onePro.ORDER_NAME;
          }
          if (
            couponData.REBATE_TYPE != onePro.REBATE_TYPE &&
            onePro.REBATE_TYPE != "all"
          ) {
            return onePro.ORDER_NAME;
          }
        }
      }
      return "";
    },
    //单选框使用优惠券
    changeCoupon(checked, coupon) {
      if (checked) {
        //判断当前勾选的组
        if (this.selectCouponGroup != coupon.GROUP_TYPE) {
          //取消之前的勾选
          var oneCouponGroupData = this.couponData.filter(item => item.GROUP_TYPE == this.selectCouponGroup);
          for (var i = 0; i < oneCouponGroupData.length; i++) {
            oneCouponGroupData[i].checked = false;
          }
        } else {
          //看选择的返利券是否超过金额,不给多选
          if (this.totalPrice == this.backPrice) {
            var thisCoupon = this.couponData.filter(item => item.ID == coupon.ID);
            thisCoupon[0].checked = false;
          }
        }
      }
      //根据选择的数据进行计算返利
      this.rebateY = "";
      var money_y = 0;
      this.rebateM = "";
      var money_m = 0;
      var promotion_money = 0;
      var selectCoupon = this.couponData.filter(item => item.checked);
      this.selectCouponGroup = "";
      for (var i = 0; i < selectCoupon.length; i++) {
        if (selectCoupon[i].REBATE_TYPE == "year") {
          this.rebateY = selectCoupon[i].ID;
          money_y = selectCoupon[i].REBATE_MONEY_OVER;
        } else if (selectCoupon[i].REBATE_TYPE == "month") {
          this.rebateM = selectCoupon[i].ID;
          money_m = selectCoupon[i].REBATE_MONEY_OVER;
        }
        this.selectCouponGroup = selectCoupon[i].GROUP_TYPE; //赋值分组
      }
      this.ctm_order.allSpend = this.totalPrice;
      //优惠券分摊
      for (var i = 0; i < this.order_details.length; i++) {
        var oneDetails = this.order_details[i];
        oneDetails.yuefanli = 0;
        oneDetails.nianfanli = 0;
      }
      var allRebateMonth = 0;
      var allRebateYear = 0;
      //两步走，先分摊月券
      if (money_m > 0) {
        //先算出需要分担的金额
        var shouldSharePrice = this.totalPrice <= money_m ? this.totalPrice : money_m;
        for (var i = 0; i < this.order_details.length; i++) {
          var oneDetails = this.order_details[i];
          if (i != this.order_details.length - 1) {
            oneDetails.yuefanli = this.getBackMoney(this.totalPrice, shouldSharePrice, oneDetails.promotionCost)
          } else {
            oneDetails.yuefanli = shouldSharePrice.sub(allRebateMonth);
          }
          allRebateMonth = allRebateMonth.add(oneDetails.yuefanli);
        }
      }
      //然后分摊年券
      if (money_y > 0 && this.totalPrice.sub(allRebateMonth) > 0) {
        //先算出需要分担的金额
        var shouldSharePrice = (this.totalPrice.sub(allRebateMonth)) <= money_y ? this.totalPrice.sub(allRebateMonth) : money_y;
        for (var i = 0; i < this.order_details.length; i++) {
          var oneDetails = this.order_details[i];
          if (i != this.order_details.length - 1) {
            oneDetails.nianfanli = this.getBackMoney(this.totalPrice, shouldSharePrice, oneDetails.promotionCost)
          } else {
            oneDetails.nianfanli = shouldSharePrice.sub(allRebateYear);
          }
          allRebateYear = allRebateYear.add(oneDetails.nianfanli);
        }
      }

      this.backPrice = allRebateMonth.add(allRebateYear);
    },
    getRecordUseData(itemID) {
      this.couponId = itemID;
      this.dialogUse = true;
    },
    RecordBack(itemId) {
      this.couponId = itemId;
      this.dialogBack = true;
    },
    //获取省份
    getProvince() {
      GetAreaList({
        region_level: 1
      }, { loading: false }).then((res) => {
        this.provinceData = res.data;
      }).catch((error) => {
        console.log(error);
      });
    },
    getCity(value) {
      //新增
      this.ctm_order.buyUserArea2 = "";
      this.ctm_order.buyUserArea3 = "";
      this.cityData = [];
      this.areaData = [];
      var selectProvince = this.provinceData.filter((item) => item.REGION_NAME == value)[0];
      this.refreshCity(selectProvince.REGION_ID);
    },
    refreshCity(id) {
      GetAreaList({
        region_level: 2,
        parent_code: id
      }, { loading: false }).then((res) => {
        this.cityData = res.data;
      }).catch((error) => {
        console.log(error);
      });
    },
    getArea(value) {
      this.ctm_order.buyUserArea3 = "";
      this.areaData = [];
      var selectCity = this.cityData.filter((item) => item.REGION_NAME == value)[0];
      this.refreshArea(selectCity.REGION_ID);
    },
    refreshArea(id) {
      GetAreaList({
        region_level: 3,
        parent_code: id
      }, { loading: false }).then((res) => {
        this.areaData = res.data;
      }).catch((error) => {
        console.log(error);
      });
    },
    //弹窗打开事件
    dialogOpen() {
      this.dialogFormVisible = true;
    },
    //获取收货地址
    getAllAddress() {
      GetCustomerAddressList({
        cid: Cookies.get("cid"),
        condition: "",
      }, { loading: false }).then((res) => {
        this.addressListData = res.data;
        if (this.ctm_order.wlTel && this.ctm_order.wlContacts) {
          var addIndex = 0;
          //如果是窗帘重新提交进来有默认值
          var temp = this.addressListData.filter(item => item.WL_CONTACTS == this.ctm_order.wlContacts && item.WL_TEL == this.ctm_order.wlTel
            && item.POST_ADDRESS == this.ctm_order.postAddress && item.PROVINCE == this.ctm_order.reciverArea1
            && item.CITY == this.ctm_order.reciverArea2 && item.COUNTRY == this.ctm_order.reciverArea3);
          if (temp.length) {
            temp = temp[0];
            var index = this.addressListData.indexOf(temp);
            if (index > -1) {
              this.radio = index;
            }
          }
        }
        this.selectAddress();
      }).catch((error) => {
        console.log(error);
      });
    },
    //选中地址
    selectAddress() {
      this.moreAddressVisible = false;

      //把选中的放到最前面
      if (this.addressListData.length > 1) {
        var cutPoint = this.radio;
        var temp = this.addressListData.splice(cutPoint, 1);
        this.addressListData.unshift(temp[0]);
        this.radio = 0;
      }

      //赋值
      this.ctm_order.wlTel = this.addressListData[0].WL_TEL;
      this.ctm_order.wlContacts = this.addressListData[0].WL_CONTACTS;
      this.ctm_order.postAddress = this.addressListData[0].POST_ADDRESS;
      this.ctm_order.reciverArea1 = this.addressListData[0].PROVINCE;
      this.ctm_order.reciverArea2 = this.addressListData[0].CITY;
      this.ctm_order.reciverArea3 = this.addressListData[0].COUNTRY;
      this.ctm_order.allAddress = `${this.ctm_order.reciverArea1 ? this.ctm_order.reciverArea1 : ""
        }${this.ctm_order.reciverArea2 ? this.ctm_order.reciverArea2 : ""}${this.ctm_order.reciverArea3 ? this.ctm_order.reciverArea3 : ""
        }${this.ctm_order.postAddress}`;
      if (this.addressListData[0].ADDRESS_ID == 0) {
        this.ctm_order.postAddressModified = "0";
        this.ctm_order.allAddress = this.addressListData[0].POST_ADDRESS;
      } else {
        this.ctm_order.postAddressModified = "1";
      }
    },
    //窗帘
    payNew() {
      if (!this.checkPay()) return;
      var getPush3 = JSON.parse(sessionStorage.getItem("shopping"));
      var deleteArray = [];
      for (var i = 0; i < getPush3.length; i++) {
        deleteArray[i] = getPush3[i].cartItemId;
      }
      this.ctm_order.allSpend = this.totalPrice;
      var data2 = {
        product_group_tpye: this.newCurtainStatus == "1" ? "EE" : this.product_group_tpye, //产品类别
        promotion_cost: this.totalPrice, //活动价格【】
        cid: Cookies.get("cid"), //登录用户账号
        companyId: Cookies.get("companyId"),
        rebateY: this.rebateY, //年优惠券编号，有则传，无则传空串
        rebateM: this.rebateM, //月优惠券编号
        arrearsFlag: this.arrearsFlag,
        ctm_order: this.ctm_order,
        ctm_orders: this.order_details,
        cartItemIDs: deleteArray,
      };
      orderSettlement(data2).then((res) => {
        this.$root.$emit("refreshMoneyEvent"); //触发主页面刷新余额
        if (this.newCurtainStatus == "1")
          this.$root.$emit("refreshBadgeIcon", "newCurtainCount");
        else
          this.$root.$emit("refreshBadgeIcon", "curtainCount");
        if (res.msg) {
          this.$alert(res.msg, "提示", {
            confirmButtonText: "确定",
            type: "warning",
          });
        } else {
          this.$alert("提交成功", "提示", {
            confirmButtonText: "确定",
            type: "success",
          });
        }
        //跳转到我的订单
        this.closeToTab({
          oldUrl: "order/checkOrder",
          newUrl: "order/myOrder",
        });
      })
        .catch((res) => {
          this.$alert("提交失败:" + res.msg, "提示", {
            confirmButtonText: "确定",
            type: "warning",
          });
        });
    },
    //提交结算
    payIt() {
      if (!this.checkPay()) return;
      //删除购物车数据
      var deleteArray = [];
      var getPush3 = JSON.parse(sessionStorage.getItem("shopping"));
      for (var i = 0; i < getPush3.length; i++) {
        deleteArray[i] = getPush3[i].id;
      }
      this.ctm_order.allSpend = this.totalPrice;
      var data2 = {
        product_group_tpye: this.product_group_tpye, //产品类别，从购物车出获取
        promotion_cost: this.totalPrice, //活动价格【】
        cid: Cookies.get("cid"), //登录用户账号
        companyId: Cookies.get("companyId"),
        rebateY: this.rebateY, //年优惠券编号，有则传，无则传空串
        rebateM: this.rebateM, //月优惠券编号
        arrearsFlag: this.arrearsFlag,
        ctm_order: this.ctm_order,
        ctm_orders: this.order_details,
        cartItemIDs: deleteArray,
      };
      normalOrderSettlement(data2).then((res) => {
        this.$root.$emit("refreshMoneyEvent"); //触发主页面刷新余额
        this.$root.$emit("refreshBadgeIcon", "wallCount");
        this.$root.$emit("refreshBadgeIcon", "softCount");
        if (res.msg) {
          this.$alert(res.msg, "提示", {
            confirmButtonText: "确定",
            type: "success",
          });
        } else {
          this.$alert("提交成功", "提示", {
            confirmButtonText: "确定",
            type: "success",
          });
        }
        //跳转到我的订单
        this.closeToTab({
          oldUrl: "order/checkOrder",
          newUrl: "order/myOrder",
        });
      })
        .catch((res) => {
          this.$alert("提交失败:" + res.msg, "提示", {
            confirmButtonText: "确定",
            type: "warning",
          });
        });
    },
    checkPay() {
      if (
        this.ctm_order.deliveryNotes == "" &&
        this.ctm_order.deliveryType == 3
      ) {
        this.$alert("请填写指定的物流公司", "提示", {
          confirmButtonText: "确定",
          type: "warning",
        });
        return false;
      }
      // if (this.packingShow && !this.ctm_order.packingNote) {
      //   this.$alert("请选择分包提示", "提示", {
      //     confirmButtonText: "确定",
      //     type: "warning"
      //   });
      //   return;
      // }
      //购买人地址
      this.ctm_order.buyUserAddress = this.rsplitAddress(this.ctm_order);
      //附件拼接
      this.ctm_order.buyUserPicture = "";
      for (var i = 0; i < this.fileList.length; i++) {
        this.ctm_order.buyUserPicture +=
          "/Files/BuyUser/" + this.cid + "/" + this.fileList[i].name + ";";
      }
      if (this.showWriteBuyUser) {
        //要填写购买人信息(有些地方可能没有第三级)
        if (
          !this.ctm_order.buyUser ||
          !this.ctm_order.buyUserPhone ||
          !this.ctm_order.buyUserArea1 ||
          !this.ctm_order.buyUserArea2 ||
          //!this.ctm_order.buyUserArea3 ||
          !this.ctm_order.buyUserPostAddress ||
          !this.ctm_order.tmallOrderNo
        ) {
          this.$alert("请填写完整的购买用户信息", "提示", {
            confirmButtonText: "确定",
            type: "warning",
          });
          return false;
        }
        if (!this.ctm_order.buyUserPicture) {
          this.$alert("请上传购买凭证", "提示", {
            confirmButtonText: "确定",
            type: "warning",
          });
          return false;
        }
      }
      return true;
    },
    //查询经办人
    chargeQuery() {
      var data = {
        cid: Cookies.get("cid"),
        companyId: Cookies.get("companyId"),
      };
      getCustomerInfo(data).then((res) => {
        this.chargeData = res.data;
      });
    },
    //返回订单
    backToOrder() {
      this.closeToTab({
        oldUrl: "order/checkOrder",
        newUrl: "order/myOrder",
      });
    },
    subtotal(data) {
      var price = 0;
      var quantity = data.quantity != 0 ? data.quantity : this.dosageFilter(data.width.mul(data.height));
      price = quantity.mul(data.price);
      return this.dosageFilter(price);
    },
    //获取订单信息
    getOrderInfo() {
      var getPush = JSON.parse(sessionStorage.getItem("shopping"));
      var orderItem = JSON.parse(sessionStorage.getItem("shoppingHead"));
      if (getPush[0].orderNumber) {
        //窗帘重新提交本身有表头数据，加载默认数据
        this.ctm_order.orderNo = orderItem.ORDER_NO;
        this.ctm_order.buyUser = orderItem.BUYUSER.trim();
        this.ctm_order.buyUserPhone = orderItem.BUYUSERPHONE.trim();
        this.ctm_order.buyUserAddress = orderItem.BUYUSER_ADDRESS.trim();
        this.ctm_order.buyUserPicture = orderItem.BUYUSER_PICTURE.trim();
        this.ctm_order.buyUserArea1 = orderItem.BUYUSER_AREA1.trim();
        this.ctm_order.buyUserArea2 = orderItem.BUYUSER_AREA2.trim();
        this.ctm_order.buyUserArea3 = orderItem.BUYUSER_AREA3.trim();
        this.ctm_order.buyUserPostAddress = orderItem.BUYUSER_POST_ADDRESS.trim();
        this.ctm_order.tmallOrderNo = orderItem.TMALL_ORDER_NO.trim();

        if (this.ctm_order.buyUserPicture) {
          var list = this.ctm_order.buyUserPicture.split(";");
          for (var i = 0; i < list.length - 1; i++) {
            var index = list[i].lastIndexOf("/");
            if (index == -1) index = list[i].lastIndexOf("\\");
            var fileName = list[i].substr(index + 1);
            this.fileList.push({
              name: fileName,
              url: this.Global.baseUrl + list[i],
            });
          }
        }
        this.ctm_order.wlContacts = orderItem.WL_CONTACTS;
        this.ctm_order.wlTel = orderItem.WL_TEL;
        this.ctm_order.postAddress = orderItem.POST_ADDRESS;
        this.ctm_order.reciverArea1 = orderItem.RECIVER_AREA1;
        this.ctm_order.reciverArea2 = orderItem.RECIVER_AREA2;
        this.ctm_order.reciverArea3 = orderItem.RECIVER_AREA3;
        this.ctm_order.notes = orderItem.NOTES.trim();
        this.ctm_order.deliveryNotes = orderItem.DELIVERY_NOTES;
        this.ctm_order.deliveryType = orderItem.DELIVERY_TYPE;
        this.ctm_order.projectNo = orderItem.PROJECT_NO;
        this.ctm_order.postAddressModified = orderItem.POST_ADDRESS_MODIFIED;
        this.ctm_order.allSpend = orderItem.ALL_SPEND;
        this.ctm_order.deliveryFlag = orderItem.DELIVERY_FLAG;
        this.ctm_order.invoiceFlag = orderItem.INVOICE_FLAG;
        this.ctm_order.allAddress = orderItem.ALL_ADDRESS;
      }
      //其他信息
      //分包
      this.product_group_tpye = getPush[0].item.groupType; //产品类别
      if (this.product_group_tpye == "B" || this.product_group_tpye == "B1")
        this.packingShow = true;
      else this.packingShow = false;
      //明细
      this.order_details = [];
      for (var i = 0; i < getPush.length; i++) {
        var onedetail = {};
        //窗帘特有
        onedetail.ancaoHeight = getPush[i].ancaoHeight ? getPush[i].ancaoHeight : 0;
        onedetail.curtainFixType = getPush[i].curtainFixType;
        onedetail.curtainWidth = getPush[i].width;
        onedetail.curtainHeight = getPush[i].height;
        onedetail.curtainHeight2 = getPush[i].falseShadeHigh
          ? getPush[i].falseShadeHigh
          : 0;
        onedetail.curtainSizeTimes = getPush[i].drape ? getPush[i].drape : 0;
        onedetail.curtainWbhSize = getPush[i].outsourcingBoxWidth
          ? getPush[i].outsourcingBoxWidth
          : 0;
        onedetail.curtainRoomName = getPush[i].location
          ? getPush[i].location
          : "";
        //共有
        onedetail.activityId = getPush[i].activityId;
        if (
          this.activityArray.indexOf(getPush[i].activityId) == -1 &&
          getPush[i].activityId
        ) {
          //活动集合
          this.activityArray.push(getPush[i].activityId);
        }
        onedetail.salPromotion = getPush[i].salPromotion;
        onedetail.orderNo = getPush[i].orderNumber;
        onedetail.yuefanli = 0;
        onedetail.nianfanli = 0;
        onedetail.itemNoSample = getPush[i].item.itemNo;
        onedetail.lineNo = getPush[i].lineNo;
        onedetail.itemNo = getPush[i].item.itemNo;
        onedetail.partSendId = getPush[i].splitShipment;
        onedetail.productionVersion = getPush[i].item.itemVersion;
        onedetail.notes = getPush[i].note;
        onedetail.price = getPush[i].price;
        onedetail.unitPrice = getPush[i].price;
        onedetail.prime_cost = this.subtotal(getPush[i]);
        onedetail.promotionCost = onedetail.prime_cost;
        onedetail.finalPrice = onedetail.prime_cost;
        onedetail.promotion = getPush[i].activityName;
        onedetail.unit = getPush[i].unit;
        onedetail.qtyRequired = getPush[i].quantity
          ? getPush[i].quantity
          : this.dosageFilter(getPush[i].width.mul(getPush[i].height));
        //网销
        onedetail.onlineSalesAmount = getPush[i].onlineSalesAmount;
        //一口价
        onedetail.batchNo = getPush[i].batchNo;
        onedetail.stockNo = getPush[i].stockNo;
        this.order_details.push(onedetail);
      }
    },
    //获取所有活动
    getActivity() {
      //看看是否需要加载活动
      var showLoadActivity = false;
      for (var i = 0; i < this.order_details.length; i++) {
        if (
          this.order_details[i].activityId &&
          !this.order_details[i].salPromotion
        ) {
          showLoadActivity = true;
          break;
        }
      }
      if (showLoadActivity) {
        GetPromotionsById({ PID: this.activityArray }).then((res) => {
          this.activityArray = res.data;
          //赋值活动
          for (var i = 0; i < this.order_details.length; i++) {
            var onePro = this.activityArray.filter(
              (item) => item.P_ID == this.order_details[i].activityId
            );
            if (onePro.length) {
              this.order_details[i].salPromotion = onePro[0];
            }
          }
          this.setActivity();
        });
      } else {
        this.setActivity();
      }
    },
    setActivity() {
      for (var i = 0; i < this.order_details.length; i++) {
        if (
          this.order_details[i].activityId &&
          this.order_details[i].salPromotion
        ) {
          var onePro = this.order_details[i].salPromotion;
          //活动需要限制的属性
          if (this.arrearsFlag != "N") this.arrearsFlag = onePro.ARREARS_FLAG;
          if (!this.showWriteBuyUser)
            this.showWriteBuyUser = onePro.BUYER_FLAG == 1;
          //存入detail的属性
          this.order_details[i].pId = onePro.P_ID;
          this.order_details[i].promotionType = onePro.ORDER_TYPE;
          this.order_details[i].flagFlType = onePro.FLAG_FL;
          this.order_details[i].type = onePro.TYPE;
          this.order_details[i].salePrice = onePro.PRICE;
          this.order_details[i].saleDiscount = onePro.DISCOUNT;
          //计算价格
          var price = this.calculatePromotionPrice(this.order_details[i]);
          this.order_details[i].promotionCost = price;
          this.order_details[i].finalPrice = price;
        }
      }
    },
    calculatePromotionPrice(data) {
      var price = 0;
      var quantity = data.qtyRequired;
      //首先判断TYPE,1折扣，2定价。然后判断priority
      if (data.salPromotion && data.salPromotion.P_ID) {
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
    handleUpload(param) {
      const formData = new FormData();
      formData.append("file", param.file);
      UploadBuyUserFiles(formData, {
        params: {
          cid: this.cid
        }
      }).then(res => {
        this.fileList.push({
          name: res.data,
          url: this.Global.baseUrl + "/Files/BuyUser/" + this.cid + "/" + res.data
        })
      })
    },
    handleChange(file, fileList) {
      //this.fileList = fileList;
    },
    handleRemove(file, fileList) {
      DeleteFileByPath({
        path: "/Files/BuyUser/" + this.cid + "/" + file.name
      })
      this.fileList = fileList;
    },
    handlePictureCardPreview(file) {
      this.dialogImageUrl = file.url;
      this.dialogImageVisible = true;
    },
    beforeAvatarUpload(file) {
      let types = ["image/jpeg", "image/gif", "image/bmp", "image/png"];
      const isJPG = types.includes(file.type);
      if (!isJPG) {
        this.$message.error("上传头像图片只能是图片格式!");
      }
      return isJPG;
    },
    buyUserShow() {
      this.buyUserVisible = true;
    },
    rsplitAddress(row) {
      var address = `${row.buyUserArea1 ? row.buyUserArea1 : ""}${row.buyUserArea2 ? row.buyUserArea2 : ""
        }${row.buyUserArea3 ? row.buyUserArea3 : ""}${row.buyUserPostAddress ? row.buyUserPostAddress : ""
        }`;
      return address;
    },
    handleRowDBClick(row, column) {
      this.ctm_order.buyUser = row.BUYUSER;
      this.ctm_order.buyUserPhone = row.BUYUSER_PHONE;
      this.ctm_order.buyUserArea1 = row.PROVINCE;
      this.ctm_order.buyUserArea2 = row.CITY;
      this.ctm_order.buyUserArea3 = row.COUNTRY;
      this.ctm_order.buyUserPostAddress = row.POST_ADDRESS;
      this.refreshCity(row.PROVINCE_ID);
      this.refreshArea(row.CITY_ID);
      this.buyUserVisible = false;
    },
    //隔行变色
    tableRowClassName({ row, rowIndex }) {
      if (rowIndex % 2 == 0) {
        return "success-row";
      }
      return "";
    },
  },
  created() {
    this.curtainStatus = Cookies.get("cur_status");
    this.newCurtainStatus = Cookies.get("new_cur_status");
    this.getOrderInfo(); //获得订单相关信息
    this.getActivity(); //获取活动价
    this.getProvince(); //三级联动
    this.getAllAddress(); //获取地址
    this._getTickets(); //获取优惠券
    this.chargeQuery(); //经办人
  },
};
</script>

<style scoped>
.overflow-cls {
  max-height: 150px;
  overflow: auto;
}
.charge {
  color: #8bc34a;
  cursor: pointer;
  font-weight: bold;
}
.centerCard {
  margin: 0 auto;
  position: relative;
}
.centerCard p {
  margin: 0;
}
.zoomRight {
  font-weight: 400;
  font-size: 16px;
  line-height: 30px;
  display: inline-block;
  margin-right: 30px;
}
.zoomLeft {
  font-size: 16px;
  font-weight: bold;
}
.headSpan {
  font-weight: bold;
  font-size: 18px;
  color: black;
}
.grayDiv {
  background: rgb(244, 245, 245);
  padding: 20px;
  line-height: 25px;
}
.rightDiv {
  float: right;
  margin: 10px 50px 10px 0;
}
.rightDiv span {
  font-weight: bold;
  color: tomato;
  font-size: 18px;
}
.right-money {
  margin-bottom: 5px;
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
}
.coupon-card-uneffect {
  background: url("../../assets/img/coupon/blackCoupon.png");
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
  background: url("../../assets/img/coupon/blackLogo.jpg");
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
.over-money-uneffect {
  color: rgb(180, 180, 180);
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

<style>
.el-table .success-row {
  background: #f0f9eb;
}
.couponBody .el-checkbox__inner {
  background: greenyellow;
}
.upload-de .el-upload--picture-card {
  width: 70px;
  height: 70px;
  line-height: 80px;
}
.upload-de .el-upload-list--picture-card .el-upload-list__item {
  width: 70px;
  height: 70px;
  line-height: 70px;
  margin-right: 8px;
}
.upload-de .el-upload-list__item {
  transition: none !important;
}
</style>