<template>
  <el-card class="centerCard">
    <div>
      <!-- 地址管理信息 -->
      <el-dialog width="70%" @close="dialogClose" title="管理收货信息" :visible.sync="dialogFormVisible">
        <el-button @click="clickNew()" type="success">添加地址</el-button>
        <el-table border :data="data" style="width: 100%" :row-class-name="tableRowClassName">
          <el-table-column prop="wlContacts" label="收货人" align="center"></el-table-column>
          <el-table-column prop="wlTel" label="联系电话" align="center"></el-table-column>
          <el-table-column label="收货地址">
            <template slot-scope="scope">
              <span>{{ scope.row.province }}</span>
              <span>{{ scope.row.city }}</span>
              <span>{{ scope.row.country }}</span>
              <span>{{ scope.row.postAddress }}</span>
            </template>
          </el-table-column>
          <el-table-column align="center" label="操作">
            <template slot-scope="scope">
              <el-button v-show="scope.row.addressId != 0" @click="editIt(scope.row)" type="warning" size="small">编辑
              </el-button>
              <el-button v-show="scope.row.addressId != 0" @click="deleteIt(scope.row)" type="danger" size="small">删除
              </el-button>
              <span v-show="scope.row.addressId === 0">默认地址不可操作</span>
            </template>
          </el-table-column>
        </el-table>
        <el-dialog width="60%" title="地址管理" @close="clearRule('form')" :visible.sync="innerVisible" append-to-body>
          <el-select @change="getCity()" style="width:30%;" v-model="value" placeholder="请选择省份">
            <el-option v-for="(item, index) in province" :key="index" :label="item.regionName" :value="index">
            </el-option>
          </el-select>
          <el-select @change="getCountry()" style="width:30%;" v-model="value2" placeholder="请选择城市">
            <el-option v-for="(item, index) in city" :key="index" :label="item.regionName" :value="index"></el-option>
          </el-select>
          <el-select @change="printfCountry()" style="width:30%;" v-model="value3" placeholder="请选择县区">
            <el-option v-for="(item, index) in country" :key="index" :label="item.regionName" :value="index">
            </el-option>
          </el-select>
          <div>
            <el-form :model="form" ref="form" class="demo-ruleForm" :rules="formRules" label-width="80px">
              <el-form-item label="详细地址" prop="address">
                <el-input style="width:90%;" v-model="form.address" autocomplete="off" placeholder="请输入详细地址"></el-input>
              </el-form-item>
              <el-form-item label="收货人" prop="name">
                <el-input style="width:90%;" v-model="form.name" autocomplete="off" placeholder="请输入收货人姓名"></el-input>
              </el-form-item>
              <el-form-item label="联系电话" prop="telephone">
                <el-input style="width:90%;" v-model="form.telephone" autocomplete="off" placeholder="请输入联系电话">
                </el-input>
              </el-form-item>
            </el-form>
            <el-button v-if="chageOrAdd" type="danger" @click="changeAddress('form')">确认修改</el-button>
            <el-button v-else type="success" @click="NewAddress('form')">确认添加</el-button>
          </div>
        </el-dialog>
      </el-dialog>
      <!-- 查看使用记录 -->
      <el-dialog :title="'优惠券使用记录[券号:' + useTable.couponId + ']'" :visible.sync="dialogUse" width="60%" top="5vh">
        <keep-alive>
          <useRecordDetail v-if="dialogUse" :useTable="useTable"></useRecordDetail>
        </keep-alive>
        <span slot="footer" class="dialog-footer">
          <el-button @click="dialogUse = false">关闭</el-button>
        </span>
      </el-dialog>
      <!-- 查看返利记录 -->
      <el-dialog :title="'优惠券返利记录[券号:' + backTable.couponId + ']'" :visible.sync="dialogBack" width="60%" top="5vh">
        <couponRecordDetail :backTable="backTable"></couponRecordDetail>
        <span slot="footer" class="dialog-footer">
          <el-button @click="dialogBack = false">关闭</el-button>
        </span>
      </el-dialog>
      <!-- 维护购买人 -->
      <el-dialog :visible.sync="buyUserVisible" title="管理购买用户" :close-on-click-modal="false" width="1000px">
        <div style="margin-bottom:2px;">
          <el-input @keyup.enter.native="searchBuyUser()" size="medium" placeholder="输入用户姓名/地址" v-model="condition"
            style="width:350px;">
            <el-button @click="searchBuyUser()" slot="append" icon="el-icon-search">搜索</el-button>
          </el-input>
          <el-button style="margin-left:20px;" size="medium" @click="addBuyUserShow()" type="primary">新增购买用户信息
          </el-button>
          <el-button type="danger" size="medium" :disabled="userSelect.length==0" @click="deleteBuyUserList">
            删除选中用户({{userSelect.length}})
          </el-button>
          <div style="color:darkgrey;">*双击填充到购买人信息</div>
        </div>
        <div>
          <el-table border :data="buyUserInfoData" style="width: 100%" height="400" :row-class-name="tableRowClassName"
            @row-dblclick="handleRowDBClick" @selection-change="handleSelectionChange">
            <el-table-column type="selection" width="55" align="center"></el-table-column>
            <el-table-column width="130" prop="BUYUSER" label="用户姓名" align="center"></el-table-column>
            <el-table-column width="130" prop="BUYUSER_PHONE" label="用户电话" align="center"></el-table-column>
            <el-table-column label="地址" align="center">
              <template slot-scope="scope">
                {{splitAddress(scope.row)}}
              </template>
            </el-table-column>
            <el-table-column width="150" label="操作">
              <template slot-scope="scope">
                <el-button @click="editBuyUserShow(scope.row)" type="primary" icon="el-icon-edit" size="mini" circle>
                </el-button>
                <el-button @click="deleteBuyUser(scope.row)" type="danger" icon="el-icon-delete" size="mini" circle>
                </el-button>
              </template>
            </el-table-column>
          </el-table>
        </div>
      </el-dialog>
      <!-- 新增/编辑购买人 -->
      <el-dialog width="650px" @close="clearData" :title="addOrNot?'新增购买用户':'编辑购买用户'" v-if="addBuyUserVisible"
        :visible.sync="addBuyUserVisible" append-to-body>
        <el-form size="small" :model="buyUserModel" label-width="100px" ref="buyUserForm" :rules="add_rules">
          <el-form-item label="用户姓名" prop="BUYUSER">
            <el-input style="width:250px;" v-model="buyUserModel.BUYUSER">
            </el-input>
          </el-form-item>
          <el-form-item label="联系电话" prop="BUYUSER_PHONE">
            <el-input style="width:250px;" v-model="buyUserModel.BUYUSER_PHONE">
            </el-input>
          </el-form-item>
          <el-form-item label="所在地区">
            <el-select @change="getCity2" style="width:150px;" v-model="buyUserModel.PROVINCE_ID" placeholder="请选择省份">
              <el-option v-for="(item, index) in province" :key="index" :label="item.regionName" :value="item.regionId">
              </el-option>
            </el-select>
            <el-select @change="getCountry2" style="width:150px;" v-model="buyUserModel.CITY_ID" placeholder="请选择城市">
              <el-option v-for="(item, index) in city" :key="index" :label="item.regionName" :value="item.regionId">
              </el-option>
            </el-select>
            <el-select @change="printfCountry2" style="width:150px;" v-model="buyUserModel.COUNTRY_ID"
              placeholder="请选择县区">
              <el-option v-for="(item, index) in country" :key="index" :label="item.regionName" :value="item.regionId">
              </el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="详细地址">
            <el-input style="width:450px;" v-model="buyUserModel.POST_ADDRESS">
            </el-input>
          </el-form-item>
          <el-form-item style="text-align:center;margin-right:100px;">
            <el-button size="medium" @click="addBuyUserVisible = false">取&nbsp;&nbsp;消</el-button>
            <el-button type="primary" size="medium" @click="onSaveTaskClick" style="margin-left:30px;">保&nbsp;&nbsp;存
            </el-button>
          </el-form-item>
        </el-form>
      </el-dialog>
    </div>

    <el-card shadow="hover">
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
          <div :class="overflow">
            <p v-for="(item, index) of data" :key="index">
              <el-radio @change="showAddress" v-model="radio" :label="index" border>{{ item.wlContacts }}
                ({{ item.wlTel }}) {{ item.province
                }}{{ item.city }}{{ item.country
                }}{{ item.postAddress }}</el-radio>
              <span v-if="item.addressId === 0" style="color:tomato; font-weight:bold;">默认地址</span>
            </p>
          </div>
          <p style="font-weight:bold;">
            <span class="charge" @click.prevent="showAddress">
              <div style="width:250px;display:inline-block;">
                {{ addressAppear }}
              </div>
            </span>
            <span @click.prevent="dialogOpen" class="charge" style="float:right;margin-right:20px;">
              管理收货地址
            </span>
          </p>

          <!-- 配送信息 -->
          <span>选择配送方式：</span>
          <el-select @change="changePeiSong" style="width:300px; display:inline-block;" v-model="ctm_order.deliveryType"
            placeholder="请选择">
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
          <span style="display:inline-block;margin-left:50px;">用户电话：</span>
          <el-input style="width:300px;" v-model="ctm_order.buyUserPhone" placeholder="请输入用户电话"></el-input>
          <span @click.prevent="buyUserShow" class="charge" style="float:right;margin-right:20px;font-weight:bold;">
            管理购买用户信息
          </span>
          <br />
          <br />
          <span>选择地区：</span>
          <el-select @change="getCity3" style="width:250px;" v-model="ctm_order.buyUserArea1" placeholder="请选择省份">
            <el-option v-for="(item, index) in provinceData" :key="index" :label="item.regionName"
              :value="item.regionName">
            </el-option>
          </el-select>
          <el-select @change="getCountry3" style="width:250px;" v-model="ctm_order.buyUserArea2" placeholder="请选择城市">
            <el-option v-for="(item, index) in cityData" :key="index" :label="item.regionName" :value="item.regionName">
            </el-option>
          </el-select>
          <el-select style="width:250px;" v-model="ctm_order.buyUserArea3" placeholder="请选择县区">
            <el-option v-for="(item, index) in countryData" :key="index" :label="item.regionName"
              :value="item.regionName">
            </el-option>
          </el-select>
          <br />
          <span>详细地址：</span>
          <el-input style="width:770px;margin-top:10px;" v-model="ctm_order.buyUserPostAddress" placeholder="请输入用户地址">
          </el-input>
          <br />
          <div style="display:inline-block;vertical-align:middle;margin:10px 10px 0 0;">
            <div style="margin:auto;">上传购买凭证：</div>
            <span style="font-size:13px;color:grey;vertical-align:middle;">(消费者在门店的订货单)</span>
          </div>
          <el-upload class="upload-de" style="display:inline-block;vertical-align:middle;margin-top:10px;"
            :action="Global.baseUrl + '/CTM_ORDER/UploadBuyUserFiles'" list-type="picture-card"
            :on-change="handleChange" :on-preview="handlePictureCardPreview" :on-remove="handleRemove"
            :before-upload="beforeAvatarUpload" :file-list="fileList" :data="{ cid: cid }">
            <i class="el-icon-plus"></i>
          </el-upload>
        </fieldset>

        <fieldset>
          <legend>备注信息</legend>
          <el-input type="textarea" maxlength="140" style="width:100%" :autosize="{ minRows: 3, maxRow: 4 }"
            resize="none" v-model="ctm_order.notes" placeholder="请输入订单备注(140字符以内，任何发货信息写在备注无效！)"></el-input>
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
      <el-dialog :visible.sync="dialogImageVisible">
        <img width="100%" :src="dialogImageUrl" alt="" />
      </el-dialog>
      <el-table :data="order_details" border style="width: 100%" :row-class-name="tableRowClassName">
        <el-table-column prop="itemNo" align="center" label="型号"></el-table-column>
        <!-- :formatter="FixIt"  -->
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
    </el-card>
    <!-- 使用优惠券 -->
    <el-card shadow="never">
      <el-collapse v-model="activeNames">
        <el-collapse-item title="使用优惠券/礼品卡" name="1">
          <div v-for="(item, index) of couponData" :key="index"
            :class="canUseConpon(item) ? switchClass.cctv : switchClass.cctvF">
            <div class="couponHead">
              <div :class="canUseConpon(item) ? switchClass.logo : switchClass.logoF"></div>
              <div class="logoTxt">
                <p style="color:white; font-size:15px; padding-top:5px; font-weight:bold; letter-spacing:2px;">
                  {{ item.notes }}
                </p>
                <span>总返利&nbsp;{{ item.rebateMoney }}元</span>
                <span class="rightCoupon">券号：{{ item.id }}</span>
              </div>
            </div>

            <div class="couponBody">
              <p style="text-align:center" :class="
                  canUseConpon(item) ? switchClass.transTxt : switchClass.transTxtF
                ">
                <span style="font-size:18px;">余额￥</span>
                <span v-if="isManager === '0'">***</span>
                <span v-else>{{ item.rebateMoneyOver }}</span>
              </p>
              <div style="margin:0 auto; width:245px;">
                <div :class="
                    canUseConpon(item)
                      ? switchClass.roundedRectangle
                      : switchClass.roundedRectangleF
                  ">
                  <p>
                    &nbsp;&nbsp;&nbsp;有效期：{{
                      item.dateStart | datatrans
                    }}至{{ item.dateEnd | datatrans }}
                  </p>
                </div>
                <el-checkbox :disabled="!canUseConpon(item)" v-model="couponStatus[index]" @change="
                    changeCoupon(couponStatus[index], item.id, item.rebateType)
                  "></el-checkbox>
              </div>
              <p style="text-align:center;">适用：{{ item.application }}</p>
              <div class="Record" style="text-align:center">
                <span @click="RecordUse(item.id)" style="cursor: pointer;">查看使用记录>>&nbsp;&nbsp;&nbsp;</span>
                <span @click="RecordBack(item.id)" style="cursor: pointer;">查看返利记录>></span>
              </div>
            </div>
            <div style="margin-left:20px;" v-if="!canUseConpon(item)">
              由于活动："{{ canNotUseActivity(item) }}"，该优惠券无法使用
            </div>
          </div>
        </el-collapse-item>
      </el-collapse>

      <div class="rightDiv">
        <p>
          折后总金额：
          <span v-if="isManager === '0'">***</span>
          <span v-else>{{ totalPrice | priceFilter }}</span>
        </p>
        <p>
          总返利：
          <span v-if="isManager === '0'">***</span>
          <span v-else>{{ backPrice | priceFilter }}</span>
        </p>
        <p>
          应付总金额：
          <span v-if="isManager === '0'">***</span>
          <span v-else>{{ allSpend | priceFilter }}</span>
        </p>
        <el-button @click="backToOrder" size="medium" type="success" plain>返回订单</el-button>
        <el-button v-if="curtainStatus == '0'" @click="payIt" size="medium" type="danger" plain>立即提交</el-button>
        <el-button v-if="curtainStatus == '3'" @click="payNew" size="medium" type="danger" plain>确认提交</el-button>
      </div>
    </el-card>
  </el-card>
</template>

<script>
import Cookies from "js-cookie";
import { addAddress } from "@/api/orderList";
import { usetheCoupon } from "@/api/orderList";
import { querycharge } from "@/api/orderList";
import { queryCash } from "@/api/orderList";
import { searchTickets } from "@/api/orderList";
import { deleteAddress } from "@/api/orderList";
import { editAddress } from "@/api/orderList";
import { submitOrder } from "@/api/orderList";
import { CouponbackRecord } from "@/api/orderList";
import {
  orderSettlement,
  normalOrderSettlement,
  getUseRecord,
  getCustomerInfo,
  GetPromotionsById,
  GetBuyUserInfo,
  InsertBuyUser,
  UpdateBuyUser,
  DeleteBuyUser,
  DeleteBuyUserList,
  GetPromotionByTypeAndId,
} from "@/api/orderListASP";
import Axios from "axios";
import { mapMutations, mapActions } from "vuex";
import useRecordDetail from "../center/useRecordDetail";
import couponRecordDetail from "../center/couponRecordDetail";

export default {
  name: "checkOrder",
  components: {
    useRecordDetail,
    couponRecordDetail,
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
      buyUserVisible: false,
      addBuyUserVisible: false,
      buyUserInfoData: [],
      buyUserModel: {},
      currentPage: 1,
      limit: 10,
      count: 0,
      condition: "",
      addOrNot: false,
      add_rules: {
        BUYUSER: [{ required: true, message: "请填写姓名", trigger: "blur" }],
        BUYUSER_PHONE: [
          { required: true, message: "请填写电话", trigger: "blur" },
        ],
      },
      useTable: [],
      backTable: [],
      couponStatus: [false, false],
      Initial_balance: "",
      product_group_tpye: "", //类型
      //获取地址
      transferData: [],
      data: [
        {
          wlContacts: "",
          wlTel: "",
          postAddress: "",
          addressId: 1,
        },
      ],
      packingShow: false,
      addressAppear: "更多地址⇣",
      overflow: "",
      addressIt: false,
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
      city: [],
      country: [],
      provinceData: [],
      cityData: [],
      countryData: [],
      value: "",
      value2: "",
      value3: "",
      chageOrAdd: true,
      notes: "",
      //地址
      dialogFormVisible: false,
      innerVisible: false,
      form: {
        name: "",
        telephone: "",
        address: "",
        theSheng: "",
        shengID: "",
        theshi: "",
        shiID: "",
        thequ: "",
        quID: "",
        addressId: "",
      },
      order_details: [],
      array: [],
      activeNames: ["1"],
      couponData: [],
      rebateY: "",
      rebateM: "",
      chargeData: {
        CUSTOMER_AGENT: "",
        OFFICE_TEL: "",
      },
      formRules: {
        telephone: [
          {
            min: 11,
            max: 11,
            message: "请填写正确的手机号码",
            trigger: "blur",
          },
        ],
      },
      switchClass: {
        cctv: "cctv",
        cctvF: "cctvF",
        logo: "logo",
        logoF: "logoF",
        transTxt: "transTxt",
        transTxtF: "transTxtF",
        roundedRectangle: "roundedRectangle",
        roundedRectangleF: "roundedRectangleF",
      },
      dialogImageUrl: "",
      dialogImageVisible: false,
      fileList: [],
      userSelect: [],
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
    allSpend: function () {
      return this.totalPrice - this.backPrice;
    },
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
    //将地址按照顺序渲染
    sortAddress() {
      var compare = function (a, b) {
        if (a.addressId < b.addressId) {
          return -1;
        } else if (a.addressId > b.addressId) {
          return 1;
        } else {
          return 0;
        }
      };
      this.transferData.sort(compare);
      this.transferData.reverse();
      var morendizhi = this.transferData.pop();
      this.transferData.unshift(morendizhi);
    },
    //表格过滤  --是否允许分批
    formatRole: function (row, column) {
      //return row.PART_SEND_ID ===0? "是":"否";  //预留
      if (row.partSendId == 0) {
        return "等生产";
      } else if (row.partSendId == 1) {
        return "分批发货";
      } else return "--";
    },
    //单选框使用优惠券
    changeCoupon(index, id, type) {
      if (type == "year" && index == true) {
        this.rebateY = id;
      } else if (type == "year" && index == false) {
        this.rebateY = "";
      } else if (type == "month" && index == true) {
        this.rebateM = id;
      } else if (type == "month" && index == false) {
        this.rebateM = "";
      }
      var url = "/order/showRebate.do"; //接口
      this.ctm_order.allSpend = this.totalPrice;
      var data = {
        product_group_tpye: this.product_group_tpye,
        promotion_cost: this.totalPrice,
        rebateY: this.rebateY,
        rebateM: this.rebateM,
        cid: Cookies.get("cid"),
        ctm_orders: this.order_details,
        ctm_order: this.ctm_order,
      };
      usetheCoupon(url, data).then((res) => {
        for (var i = 0; i < res.data.rebate.length; i++) {
          this.order_details[i].nianfanli = res.data.rebate[i].rebateYear;
          this.order_details[i].yuefanli = res.data.rebate[i].rebateMonth;
        }
        this.backPrice = res.data.allRebateMonth + res.data.allRebateYear;
      });
    },
    //获取优惠券
    _getTickets() {
      var url = "/order/getRebate.do";
      var data = {
        cid: Cookies.get("cid"),
        companyId: Cookies.get("companyId"),
        typeId: this.product_group_tpye,
      };
      searchTickets(url, data).then((res) => {
        this.couponData = res.data;
        for (let i = 0; i < this.couponData.length; i++) {
          if (
            this.couponData[i].dateId === 0 ||
            this.couponData[i].rebateMoneyOver <= 0
          ) {
            this.couponData.splice(i, 1);
          }
        }
      });
    },
    canUseConpon(couponData) {
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
            couponData.rebateType != onePro.REBATE_TYPE &&
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
            couponData.rebateType != onePro.REBATE_TYPE &&
            onePro.REBATE_TYPE != "all"
          ) {
            return onePro.ORDER_NAME;
          }
        }
      }
      return "";
    },
    RecordUse(itemID) {
      this.useTable = [];
      var url = "/order/findRecrods.do";
      var data = {
        couponId: itemID,
        keyWords: "",
        beginTime: "0001/1/1",
        finishTime: "9999/12/31",
        page: 1,
        limit: 20,
      };
      getUseRecord(data).then((res) => {
        this.useTable = res.data;
        this.useTable.couponId = itemID;
        this.useTable.count = res.count;
        this.dialogUse = true;
      });
    },
    RecordBack(itemId) {
      var url = "/order/getReturnRecord.do";
      var data = {
        id: itemId,
      };
      CouponbackRecord(url, data).then((res) => {
        this.backTable = res.data;
        this.backTable.couponId = itemId;
        this.dialogBack = true;
      });
    },
    //确定修改地址
    changeAddress(formName) {
      var url = "/postAddress/updatePostAddress.do";
      var data = {
        cid: Cookies.get("cid"),
        addressId: this.form.addressId /* 33, */,
        postAddress: this.form.address /* "其实我不是渣渣曹" */,
        wlContacts: this.form.name /* "渣渣陈" */,
        wlTel: this.form.telephone /* "11011011010", */,
        province: this.form.theSheng /* "广东省" */,
        city: this.form.theshi /* "汕头市" */,
        country: this.form.thequ /* "升平区", */,
        provinceID: this.form.shengID /* "P19" */,
        cityID: this.form.shiID /* "S200" */,
        countryID: this.form.quID /* "D1994" */,
      };
      if (data.country == "" || data.country == undefined) {
        data.countryID = "";
      }
      this.$refs[formName].validate((valid) => {
        if (
          valid &&
          data.province != undefined &&
          data.city != undefined &&
          this.form.address != undefined &&
          this.form.name != undefined &&
          data.province != "" &&
          data.city != "" &&
          this.form.address != "" &&
          this.form.name != "" &&
          this.form.telephone != "" &&
          this.form.telephone != undefined
        ) {
          editAddress(url, data).then((res) => {
            this.dialogFormVisible = false;
            this.innerVisible = false;
            this.allAddress();
            this.$alert("修改地址成功", "提示", {
              confirmButtonText: "确定",
              type: "success",
            });
          });
        } else {
          this.$alert("请填写正确信息", "提示", {
            confirmButtonText: "确定",
            type: "warning",
          });
          return false;
        }
      });
    },
    //编辑地址弹窗初始化
    editIt(row) {
      //输入框初始化
      this.chageOrAdd = true;
      this.innerVisible = true;
      this.value = row.province;
      this.value2 = row.city;
      this.value3 = row.country;
      //表单初始化
      this.form.theSheng = row.province;
      this.form.shengID = row.provinceID;
      this.form.theshi = row.city;
      this.form.shiID = row.cityID;
      this.form.quID = row.countryID;
      this.form.thequ = row.country;
      this.form.address = row.postAddress;
      this.form.name = row.wlContacts;
      this.form.telephone = row.wlTel;
      this.form.addressId = row.addressId;
      //接口
      Axios.post("/areaRegion/getCity.do", {
        regionId: row.provinceID,
        regionName: row.provinceID,
      })
        .then((res) => {
          this.city = res.data.city;
        })
        .catch((error) => {
          console.log(error);
        });
      Axios.post("/areaRegion/getCountry.do", {
        regionId: row.cityID,
        regionName: row.city,
      })
        .then((res) => {
          this.country = res.data.country;
        })
        .catch((error) => {
          console.log(error);
        });
    },
    //删除地址
    deleteIt(row) {
      this.$confirm("确定删除该地址吗？", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
      })
        .then(() => {
          var url = "/postAddress/deletePostAddress.do";
          var data = {
            cid: Cookies.get("cid"),
            addressId: row.addressId,
          };
          deleteAddress(url, data).then((res) => {
            this.dialogFormVisible = false;
            this.innerVisible = false;
            this.allAddress();
            this.$alert("删除成功！", "提示", {
              confirmButtonText: "确定",
              type: "success",
            });
            //预留一下
            //this.allAddress();
            //this.data=this.transferData;
          });
        })
        .catch(() => {
          console.log("地址没有删除！！！");
        });
    },
    //输出区县
    printfCountry() {
      var country = this.value3;
      this.form.thequ = this.country[country].regionName;
      this.form.quID = this.country[country].regionId;
    },
    printfCountry2(value) {
      var country = this.country.filter((item) => item.regionId == value)[0];
      this.buyUserModel.COUNTRY = country.regionName;
    },
    refreshCountry(regionId, regionName) {
      Axios.post(
        "/areaRegion/getCountry.do",
        {
          regionId: regionId,
          regionName: regionName,
        },
        { loading: false }
      )
        .then((res) => {
          this.country = res.data.country;
          this.countryData = res.data.country;
        })
        .catch((error) => {
          console.log(error);
        });
    },
    //获取区县
    getCountry() {
      this.value3 = "";
      this.form.thequ = "";
      this.country = [];
      var city = this.value2;
      this.form.theshi = this.city[city].regionName;
      this.form.shiID = this.city[city].regionId;
      this.refreshCountry(this.city[city].regionId, this.city[city].regionName);
    },
    getCountry2(value) {
      this.buyUserModel.COUNTRY = "";
      this.buyUserModel.COUNTRY_ID = "";
      this.country = [];
      var city = this.city.filter((item) => item.regionId == value)[0];
      this.buyUserModel.CITY = city.regionName;
      this.refreshCountry(city.regionId, city.regionName);
    },
    getCountry3(value) {
      this.ctm_order.buyUserArea3 = "";
      this.countryData = [];
      var city = this.city.filter((item) => item.regionName == value)[0];
      this.refreshCountry(city.regionId, city.regionName);
    },
    refreshCity(regionId, regionName) {
      Axios.post(
        "/areaRegion/getCity.do",
        {
          regionId: regionId,
          regionName: regionName,
        },
        { loading: false }
      )
        .then((res) => {
          this.city = res.data.city;
          this.cityData = res.data.city;
        })
        .catch((error) => {
          console.log(error);
        });
    },
    //获取城市
    getCity() {
      //新增
      this.form.theshi = "";
      this.form.thequ = "";

      this.value2 = "";
      this.value3 = "";
      var shengfen = this.value;
      this.form.theSheng = this.province[shengfen].regionName;
      this.form.shengID = this.province[shengfen].regionId;
      this.refreshCity(
        this.province[shengfen].regionId,
        this.province[shengfen].regionName
      );
    },
    getCity2(value) {
      //新增
      this.buyUserModel.CITY = "";
      this.buyUserModel.CITY_ID = "";
      this.buyUserModel.COUNTRY = "";
      this.buyUserModel.COUNTRY_ID = "";
      this.city = [];
      this.country = [];
      var shengfen = this.province.filter((item) => item.regionId == value)[0];
      this.buyUserModel.PROVINCE = shengfen.regionName;
      this.refreshCity(shengfen.regionId, shengfen.regionName);
    },
    getCity3(value) {
      //新增
      this.ctm_order.buyUserArea2 = "";
      this.ctm_order.buyUserArea3 = "";
      this.cityData = [];
      this.countryData = [];
      var shengfen = this.provinceData.filter(
        (item) => item.regionName == value
      )[0];
      this.refreshCity(shengfen.regionId, shengfen.regionName);
    },
    //获取省份
    getProvince() {
      Axios.post("/areaRegion/getProvince.do", {})
        .then((res) => {
          this.province = res.data.province;
          this.provinceData = res.data.province;
        })
        .catch((error) => {
          console.log(error);
        });
    },
    //弹窗打开事件
    dialogOpen() {
      this.dialogFormVisible = true;
      this.data = this.transferData;
      this.overflow = "overflow";
    },
    //弹窗关闭事件
    dialogClose() {
      this.data = [];
      this.data[0] = this.transferData[0];
      this.overflow = "";
    },
    //新增地址按钮
    clickNew() {
      this.chageOrAdd = false;
      this.innerVisible = true;
      this.form = {};
      this.value = "";
      this.value2 = "";
      this.value3 = "";
    },
    //新增地址
    NewAddress(formName) {
      var url = "/postAddress/addPostAddress.do";
      var data = {
        cid: Cookies.get("cid"),
        postAddress: this.form.address,
        wlContacts: this.form.name,
        wlTel: this.form.telephone,
        province: this.form.theSheng,
        city: this.form.theshi,
        country: this.form.thequ,
        provinceID: this.form.shengID,
        cityID: this.form.shiID,
        countryID: this.form.quID,
      };
      this.$refs[formName].validate((valid) => {
        if (
          valid &&
          data.province != undefined &&
          data.city != undefined &&
          this.form.address != undefined &&
          this.form.name != undefined &&
          data.province != "" &&
          data.city != "" &&
          this.form.address != "" &&
          this.form.name != "" &&
          this.form.telephone != "" &&
          this.form.telephone != undefined
        ) {
          addAddress(url, data).then((res) => {
            this.dialogFormVisible = false;
            this.innerVisible = false;
            this.allAddress();
            this.$alert("地址添加成功", "提示", {
              confirmButtonText: "确定",
              type: "success",
            });
          });
        } else {
          this.$alert("请完善并填写正确信息", "提示", {
            confirmButtonText: "确定",
            type: "warning",
          });
          return false;
        }
      });
    },
    //获取收货地址
    allAddress() {
      Axios.post("/postAddress/getPostAddress.do", {
        cid: Cookies.get("cid"),
      })
        .then((res) => {
          this.transferData = res.data.data;
          this.sortAddress();
          this.data = [];
          if (this.ctm_order.wlTel && this.ctm_order.wlContacts) {
            //如果是窗帘重新提交进来有默认值
            var addIndex = 0;
            for (var i = 0; i < this.transferData.length; i++) {
              var addArr = {
                //跟字段对应上，直接判断
                cid: this.transferData[i].cid,
                postAddress: this.ctm_order.postAddress,
                wlContacts: this.ctm_order.wlContacts,
                wlTel: this.ctm_order.wlTel,
                addressId: this.transferData[i].addressId,
                province:
                  this.ctm_order.reciverArea1 == ""
                    ? null
                    : this.ctm_order.reciverArea1,
                city:
                  this.ctm_order.reciverArea2 == ""
                    ? null
                    : this.ctm_order.reciverArea2,
                country:
                  this.ctm_order.reciverArea3 == ""
                    ? null
                    : this.ctm_order.reciverArea3,
                provinceID: this.transferData[i].provinceID,
                cityID: this.transferData[i].cityID,
                countryID: this.transferData[i].countryID,
              };
              if (
                JSON.stringify(addArr) == JSON.stringify(this.transferData[i])
              ) {
                addIndex = i;
                break;
              }
            }
            this.radio = addIndex;
            this.addressIt = true;
            this.showAddress();
          } else {
            this.data[0] = this.transferData[0];

            this.ctm_order.wlTel = this.data[0].wlTel;
            this.ctm_order.wlContacts = this.data[0].wlContacts;
            this.ctm_order.postAddress = this.data[0].postAddress;
            this.ctm_order.reciverArea1 = this.data[0].province;
            this.ctm_order.reciverArea2 = this.data[0].city;
            this.ctm_order.reciverArea3 = this.data[0].country;
            this.ctm_order.allAddress = `${
              this.ctm_order.reciverArea1 ? this.ctm_order.reciverArea1 : ""
            }${this.ctm_order.reciverArea2 ? this.ctm_order.reciverArea2 : ""}${
              this.ctm_order.reciverArea3 ? this.ctm_order.reciverArea3 : ""
            }${this.ctm_order.postAddress}`;
          }
        })
        .catch((error) => {
          console.log(error);
        });
    },
    //隔行变色
    tableRowClassName({ row, rowIndex }) {
      if (rowIndex % 2 == 0) {
        return "success-row";
      }
      return "";
    },
    //获取更多地址    测试一下
    showAddress() {
      //this.addressIt=!this.addressIt;
      if (this.addressIt == false) {
        this.overflow = "overflow";
        this.addressAppear = "收起↑";
        this.data = this.transferData;
        this.addressIt = true;
      } else {
        this.addressIt = false;
        this.overflow = "";
        this.addressAppear = "更多地址⇣";
        var cutPoint = this.radio;
        var abc = this.transferData.splice(cutPoint, 1);
        this.transferData.unshift(abc[0]);
        //this.data=this.transferData;
        this.data = [];
        this.data[0] = this.transferData[0];
        this.radio = 0;

        this.ctm_order.wlTel = this.data[0].wlTel;
        this.ctm_order.wlContacts = this.data[0].wlContacts;
        this.ctm_order.postAddress = this.data[0].postAddress;
        this.ctm_order.reciverArea1 = this.data[0].province;
        this.ctm_order.reciverArea2 = this.data[0].city;
        this.ctm_order.reciverArea3 = this.data[0].country;
        this.ctm_order.allAddress = `${
          this.ctm_order.reciverArea1 ? this.ctm_order.reciverArea1 : ""
        }${this.ctm_order.reciverArea2 ? this.ctm_order.reciverArea2 : ""}${
          this.ctm_order.reciverArea3 ? this.ctm_order.reciverArea3 : ""
        }${this.ctm_order.postAddress}`;
        if (this.data[0].addressId == 0) {
          this.ctm_order.postAddressModified = "0";
          this.ctm_order.allAddress = this.data[0].postAddress;
        } else {
          this.ctm_order.postAddressModified = "1";
        }
      }
    },
    //窗帘
    payNew() {
      if (!this.checkPay()) return;
      var url = "/order/getResidemoney.do";
      var data = {
        cid: Cookies.get("cid"),
        companyId: Cookies.get("companyId"),
      };
      //每次提交的时候判断一下余额
      queryCash(url, data).then((res) => {
        this.Initial_balance = res.data;
        var getPush3 = JSON.parse(sessionStorage.getItem("shopping"));
        var deleteArray = [];
        for (var i = 0; i < getPush3.length; i++) {
          deleteArray[i] = getPush3[i].cartItemId;
        }
        this.ctm_order.allSpend = this.totalPrice;
        var data2 = {
          product_group_tpye: this.product_group_tpye, //产品类别
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
        orderSettlement(data2)
          .then((res) => {
            this.afterPay();
            this.$root.$emit("refreshBadgeIcon", "curtainCount");
          })
          .catch((res) => {
            this.$alert("提交失败:" + res.msg, "提示", {
              confirmButtonText: "确定",
              type: "warning",
            });
          });
      });
    },
    //提交结算
    payIt() {
      if (!this.checkPay()) return;
      var url = "/order/getResidemoney.do";
      var data = {
        cid: Cookies.get("cid"),
        companyId: Cookies.get("companyId"),
      };
      //每次提交的时候判断一下余额
      queryCash(url, data).then((res) => {
        this.Initial_balance = res.data;
        var url2 = "/order/orderCount.do";
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
        //submitOrder(url2, data2)
        normalOrderSettlement(data2)
          .then((res) => {
            this.afterPay();
            this.$root.$emit("refreshBadgeIcon", "wallCount");
            this.$root.$emit("refreshBadgeIcon", "softCount");
          })
          .catch((res) => {
            this.$alert("提交失败:" + res.msg, "提示", {
              confirmButtonText: "确定",
              type: "warning",
            });
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
      this.ctm_order.buyUserAddress = this.splitAddress2(this.ctm_order);
      //附件拼接
      this.ctm_order.buyUserPicture = "";
      for (var i = 0; i < this.fileList.length; i++) {
        this.ctm_order.buyUserPicture +=
          "/Files/BuyUser/" + this.cid + "/" + this.fileList[i].name + ";";
      }
      if (this.showWriteBuyUser) {
        //要填写购买人信息
        if (
          !this.ctm_order.buyUser ||
          !this.ctm_order.buyUserPhone ||
          !this.ctm_order.buyUserArea1 ||
          !this.ctm_order.buyUserArea2 ||
          //!this.ctm_order.buyUserArea3 ||
          !this.ctm_order.buyUserPostAddress
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
    afterPay() {
      //活动类型"N"或者应付为0不需要判断余额
      if (
        this.allSpend == 0 ||
        this.arrearsFlag == "N" ||
        this.allSpend <= this.Initial_balance
      ) {
        this.$root.$emit("refreshMoneyEvent"); //触发主页面刷新余额
        this.$root.$emit("refreshBadgeIcon", "curtainCount");
        this.$alert("提交成功", "提示", {
          confirmButtonText: "确定",
          type: "success",
        });
      } else {
        this.$alert(
          "余额不足，当前订单还需充值" +
            Math.round((this.allSpend - this.Initial_balance).mul(100)) / 100 +
            "元才能提交",
          "提示",
          {
            confirmButtonText: "确定",
            type: "warning",
          }
        );
      }
      //跳转到我的订单
      this.closeToTab({
        oldUrl: "order/checkOrder",
        newUrl: "order/myOrder",
      });
    },
    //查询经办人
    chargeQuery() {
      var url = "/order/getlink.do";
      var data = {
        cid: Cookies.get("cid"),
        companyId: Cookies.get("companyId"),
      };
      //querycharge(url, data).then(res => {
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
      var quantity =
        data.quantity != 0
          ? data.quantity
          : this.dosageFilter(data.width.mul(data.height));
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
    handleChange(file, fileList) {
      this.fileList = fileList;
    },
    handleRemove(file, fileList) {
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
    getBuyUser() {
      GetBuyUserInfo(
        {
          cid: Cookies.get("cid"),
          condition: this.condition,
          page: this.currentPage,
          limit: this.limit,
        },
        { loaidng: false }
      ).then((res) => {
        this.buyUserInfoData = res.data;
      });
    },
    searchBuyUser() {
      this.currentPage = 1;
      this.getBuyUser();
    },
    buyUserShow() {
      this.condition = "";
      this.searchBuyUser();
      this.buyUserVisible = true;
    },
    splitAddress(row) {
      var address = `${row.PROVINCE ? row.PROVINCE : ""}${
        row.CITY ? row.CITY : ""
      }${row.COUNTRY ? row.COUNTRY : ""}${
        row.POST_ADDRESS ? row.POST_ADDRESS : ""
      }`;
      return address;
    },
    splitAddress2(row) {
      var address = `${row.buyUserArea1 ? row.buyUserArea1 : ""}${
        row.buyUserArea2 ? row.buyUserArea2 : ""
      }${row.buyUserArea3 ? row.buyUserArea3 : ""}${
        row.buyUserPostAddress ? row.buyUserPostAddress : ""
      }`;
      return address;
    },
    addBuyUserShow() {
      this.buyUserModel = {
        CUSTOMER_CODE: Cookies.get("companyId"),
        BUYUSER: "",
        BUYUSER_PHONE: "",
        POST_ADDRESS: "",
        PROVINCE: "",
        CITY: "",
        COUNTRY: "",
        PROVINCE_ID: "",
        CITY_ID: "",
        COUNTRY_ID: "",
      };
      this.country = [];
      this.city = [];
      this.addOrNot = true;
      this.addBuyUserVisible = true;
    },
    editBuyUserShow(row) {
      this.buyUserModel = JSON.parse(JSON.stringify(row));
      this.country = [];
      this.city = [];
      this.addOrNot = false;
      this.refreshCity(
        this.buyUserModel.PROVINCE_ID,
        this.buyUserModel.PROVINCE
      );
      if (this.buyUserModel.CITY_ID)
        this.refreshCountry(
          this.buyUserModel.CITY_ID,
          this.buyUserModel.COUNTRY
        );
      this.addBuyUserVisible = true;
    },
    onSaveTaskClick() {
      if (!this.buyUserModel.PROVINCE_ID || !this.buyUserModel.CITY_ID) {
        this.$alert("请填写省市", "提示", {
          confirmButtonText: "确定",
          type: "warning",
        });
        return;
      }
      if (this.addOrNot) {
        InsertBuyUser(this.buyUserModel)
          .then((res) => {
            this.$message({
              message: "新增成功!",
              type: "success",
              duration: 1000,
            });
            this.searchBuyUser();
            this.addBuyUserVisible = false;
          })
          .catch((res) => {
            this.$alert("新增失败", "提示", {
              confirmButtonText: "确定",
              type: "warning",
            });
          });
      } else {
        UpdateBuyUser(this.buyUserModel)
          .then((res) => {
            this.$message({
              message: "编辑成功!",
              type: "success",
              duration: 1000,
            });
            this.searchBuyUser();
            this.addBuyUserVisible = false;
          })
          .catch((res) => {
            this.$alert("编辑失败", "提示", {
              confirmButtonText: "确定",
              type: "warning",
            });
          });
      }
    },
    deleteBuyUser(row) {
      this.$confirm("删除的数据无法恢复，是否删除？", "提示", {
        confirmButtonText: "是",
        cancelButtonText: "否",
        type: "warning",
      })
        .then(() => {
          DeleteBuyUser(row).then((res) => {
            this.$message({
              message: "删除成功!",
              type: "success",
              duration: 1000,
            });
            this.searchBuyUser();
          });
        })
        .catch((res) => {
          this.$alert("删除失败", "提示", {
            confirmButtonText: "确定",
            type: "warning",
          });
        });
    },
    deleteBuyUserList() {
      this.$confirm("删除的数据无法恢复，是否删除？", "提示", {
        confirmButtonText: "是",
        cancelButtonText: "否",
        type: "warning",
      })
        .then(() => {
          DeleteBuyUserList(this.userSelect).then((res) => {
            this.$message({
              message: "删除成功!",
              type: "success",
              duration: 1000,
            });
            this.searchBuyUser();
          });
        })
        .catch((res) => {
          this.$alert("删除失败", "提示", {
            confirmButtonText: "确定",
            type: "warning",
          });
        });
    },
    handleSelectionChange(val) {
      this.userSelect = val;
    },
    handleRowDBClick(row, column) {
      this.ctm_order.buyUser = row.BUYUSER;
      this.ctm_order.buyUserPhone = row.BUYUSER_PHONE;
      this.ctm_order.buyUserArea1 = row.PROVINCE;
      this.ctm_order.buyUserArea2 = row.CITY;
      this.ctm_order.buyUserArea3 = row.COUNTRY;
      this.ctm_order.buyUserPostAddress = row.POST_ADDRESS;
      this.refreshCity(row.PROVINCE_ID, row.PROVINCE);
      this.refreshCountry(row.CITY_ID, row.CITY);
      this.buyUserVisible = false;
    },
  },
  created: function () {
    this.curtainStatus = Cookies.get("cur_status");
    this.getOrderInfo(); //获得订单相关信息
    this.getActivity(); //获取活动价
    this.getProvince(); //三级联动
    this.allAddress(); //获取地址
    this._getTickets(); //获取优惠券
    this.chargeQuery(); //经办人
  },
};
</script>

<style scoped>
.overflow {
  height: 160px;
  overflow: auto;
}
.charge {
  color: #8bc34a;
  cursor: pointer;
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
  font-size: 15px;
  line-height: 30px;
  display: inline-block;
  margin-right: 30px;
}
.zoomLeft {
  font-size: 15px;
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

.roundedRectangle {
  display: inline-block;
  height: 30px;
  line-height: 30px;
  margin: 0 auto;
  color: white;
  width: 225px;
  background: rgb(253, 85, 56);
  border-width: 10px; /*边缘的宽度*/
  border-radius: 15px; /*圆角的大小 */
}
.roundedRectangleF {
  display: inline-block;
  height: 30px;
  line-height: 30px;
  margin: 0 auto;
  color: white;
  width: 225px;
  background: gray;
  border-width: 10px; /*边缘的宽度*/
  border-radius: 15px; /*圆角的大小 */
}
.cctv {
  background: url("../../assets/img/coupon/coupon.png");
  width: 350px;
  height: 230px;
  margin-right: 10%;
  background-size: 100%;
  background-repeat: no-repeat;
  display: inline-block;
}
.cctvF {
  background: url("../../assets/img/coupon/blackCoupon.png");
  width: 350px;
  height: 230px;
  margin-right: 10%;
  background-size: 100%;
  background-repeat: no-repeat;
  display: inline-block;
}
.couponHead {
  height: 50px;
}
.couponBody {
  height: 170px;
  margin-top: 5px;
}
.logo {
  background: url("../../assets/img/coupon/logopng.png");
  width: 40px;
  height: 40px;
  background-size: 100%;
  background-repeat: no-repeat;
  border-radius: 50%;
  float: left;
  margin-top: 10px;
  margin-left: 5%;
  margin-right: 3%;
}
.logoF {
  background: url("../../assets/img/coupon/blackLogo.jpg");
  width: 40px;
  height: 40px;
  background-size: 100%;
  background-repeat: no-repeat;
  border-radius: 50%;
  float: left;
  margin-top: 10px;
  margin-left: 5%;
  margin-right: 3%;
}
.logoTxt span {
  display: inline-block;
  color: white;
}
.transTxt {
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
.transTxtF {
  font-size: 40px;
  font-weight: bold;
  color: rgb(180, 180, 180);
}
.rightCoupon {
  float: right;
  margin-right: 10px;
}
.Record span:hover {
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
</style>