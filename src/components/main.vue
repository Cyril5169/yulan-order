<template>
  <div class="center" @click="lastClick">
    <el-container class="page">
      <el-aside :width="asideStatus?'60px':'200px'" style="overflow:hidden;background:white;">
        <el-scrollbar style="height:100%;">
          <div id="aside-header">
            <div id="aside-logo" :style="{display:asideStatus?'none':'block'}"></div>
            <span>玉兰B2B</span>
          </div>
          <el-menu style="margin-bottom:10px;" :default-openeds="['shops', 'design', 'shoppingCar', 'query']"
            :default-active="url" @select="addTab" :collapse="asideStatus">
            <!-- 权限树加载 -->
            <menuTree v-for="item in menuTreeList" :key="item.SystemMenuID" :menuTreeItem="item" />
          </el-menu>
        </el-scrollbar>
      </el-aside>
      <el-container style="width:85%; min-width:1050px;">
        <el-header height="40px">
          <ul class="l">
            <li :title="asideStatus? '菜单展开' : '菜单收起'" @click="changeAside">
              <i class="iconfont headIcon2" v-if="asideStatus">&#xe61e;</i>
              <i class="iconfont headIcon2" v-else>&#xe65f;</i>
              <span class="ml10 mr10 headSpan2">{{
                asideStatus? "菜单展开" : "菜单收起"
              }}</span>
            </li>
            <router-link to="/notification/notificationMain" tag="li">
              <li title="公告" @click="addTab('notification/notificationMain')">
                <i class="el-icon-bell headIcon2"></i>
                <span class="ml10 mr10 headSpan2">公告</span>
              </li>
            </router-link>
          </ul>
          <ul class="r">
            <li>
              <el-dropdown trigger="hover">
                <span class="el-dropdown-link" style="color:white">
                  个人中心
                  <el-badge v-if="wangqian > 0" :value="wangqian"></el-badge>
                  <i class="el-icon-arrow-down el-icon--right headIcon"></i>
                </span>
                <el-dropdown-menu slot="dropdown" style="min-width: 150px;">
                  <el-dropdown-item v-if="identity != 'SUPLY'"><a style="color:#606266;" target="_blank" :href="
                        'http://14.29.221.4:10250/pc/#/?cid=' +
                          cid +
                          '&password=' +
                          userInfo.password
                      ">网络协议签订</a>
                    <el-badge v-if="wangqian > 0" style="margin-top:5px;" :value="wangqian"></el-badge>
                  </el-dropdown-item>
                  <router-link v-if="isContainAttr('myZone/myCoupon')" to="/myZone/myCoupon" tag="li">
                    <el-dropdown-item @click.native="addTab('myZone/myCoupon')">我的优惠券</el-dropdown-item>
                  </router-link>
                  <el-dropdown-item @click.native="changePasswordVisible = true">修改密码</el-dropdown-item>
                  <el-dropdown-item divided @click.native="logout">退出登录</el-dropdown-item>
                </el-dropdown-menu>
              </el-dropdown>
            </li>
            <li style="margin-right:20px;" @click="screenfull">
              <i class="iconfont ml10 mr10 headIcon">&#xe663;</i>
            </li>
          </ul>
          <span class="headSpan" style="font-size:12px;">{{
              "账户：" + cid +" " + realName +(identity == "ECWEB" ? " " + (isManager == "1"? "管理员" : "操作员") : " ")
            }}</span>
        </el-header>
        <el-main style="margin:0;padding:0;background:#ECF5EF;" class="backTop" id="mainBackTop">
          <el-tabs class="tabs" v-model="activeTabName" @tab-click="getTab" @tab-remove="closeTab" type="border-card">
            <div class="notice">
              <i class="el-icon-bell ml10 mr10 f16" style="line-height:30px;color:gold;font-weight:bold;"></i>
              <span style="color:red;margin-right:5px;margin-top:5px;">最新公告：</span>
              <span v-if="newsTextArr.length == 0">{{ adminText }}</span>
              <span v-else style="line-height:30px;">
                <transition name="slide">
                  <a style="cursor:pointer;text-decoration:underline" :key="newsTextArr[newsIndex].ID"
                    @click="showNotification(newsTextArr[newsIndex])">{{ newsTextArr[newsIndex].TITLE }}</a>
                </transition>
              </span>
              <span v-if="identity == 'ECWEB'" class="r f14 mr10" style="line-height:30px;color:red;">
                <strong>
                  <i>{{ moneySituation }}</i>
                </strong>
                <i title="刷新余额" :class="refreshMoneyClass" style="color:black;cursor:pointer;"
                  @click="refreshUserMoney"></i>
              </span>
            </div>
            <el-tab-pane v-for="item in tabList" :key="item.name" :name="item.name" :label="item.label"
              :closable="item.closable"></el-tab-pane>
            <div v-if="activeTabName == 'main'">
              <el-card v-if="
                  identity != 'SUPLY' &&
                    (hotSaleVersion.length > 0 || hotSaleItem.length > 0)
                ">
                <div v-if="hotSaleVersion.length > 0" style="margin-bottom:20px;">
                  <h2 style="text-align:center;margin:0 0 10px 0;">
                    版本热销榜
                  </h2>
                  <div>
                    <table style="margin:0 auto;">
                      <tr v-for="(item, index) in hotSaleVersion" :key="index">
                        <td style="height:30px;min-width:160px;" v-for="(n, indexx) in 5" :key="indexx">
                          <span v-if="item[indexx].ITEM_NO != ''" class="numIndex hot-index-normal" :class="{
                              'hot-index1': index == 0 && indexx == 0,
                              'hot-index2':
                                index == 0 && (indexx == 1 || indexx == 2),
                              'hot-index3':
                                index == 0 && (indexx == 3 || indexx == 4)
                            }">{{ index * 5 + indexx + 1 }}</span>
                          <a>{{ item[indexx].ITEM_NO }}</a>
                          <img src="../assets/img/img/search-hot.gif" v-if="index == 0 && item[indexx].ITEM_NO != ''" />
                        </td>
                      </tr>
                    </table>
                  </div>
                </div>
                <div v-if="hotSaleItem.length > 0" style="margin-bottom:20px;">
                  <h2 style="text-align:center;margin:0 0 10px 0;">
                    型号热销榜
                  </h2>
                  <div>
                    <table style="margin:0 auto;">
                      <tr v-for="(item, index) in hotSaleItem" :key="index">
                        <td style="height:30px;min-width:160px;" v-for="(n, indexx) in 5" :key="indexx">
                          <span v-if="item[indexx].ITEM_NO != ''" class="numIndex hot-index-normal" :class="{
                              'hot-index1': index == 0,
                              'hot-index2': index == 1,
                              'hot-index3': index == 2
                            }">{{ index * 5 + indexx + 1 }}</span>
                          <a class="hoverAlink" title="点击前往下单"
                            @click="selectHot(item[indexx].ITEM_NO)">{{ item[indexx].ITEM_NO }}</a>
                          <img src="../assets/img/img/search-hot.gif" v-if="
                              (index == 0 || index == 1) &&
                                item[indexx].ITEM_NO != ''
                            " />
                        </td>
                      </tr>
                    </table>
                  </div>
                </div>
                <div v-if="hotSaleCurtain.length > 0" style="margin-bottom:20px;">
                  <h2 style="text-align:center;margin:0 0 10px 0;">
                    窗帘版本推荐
                  </h2>
                  <div>
                    <table style="margin:0 auto;">
                      <tr v-for="(item, index) in hotSaleCurtain" :key="index">
                        <td style="height:30px;min-width:160px;" v-for="(n, indexx) in 5" :key="indexx">
                          <span v-if="item[indexx].ITEM_NO != ''" class="numIndex hot-index-normal" :class="{
                              'hot-index1': index == 0,
                              'hot-index2': index == 1,
                              'hot-index3': index == 2
                            }">{{ index * 5 + indexx + 1 }}</span>
                          <a>{{ item[indexx].ITEM_NO }}</a>
                          <img src="../assets/img/img/search-hot.gif" v-if="
                              (index == 0 || index == 1) &&
                                item[indexx].ITEM_NO != ''
                            " />
                        </td>
                      </tr>
                    </table>
                  </div>
                </div>
                <div v-if="hotSaleSoft.length > 0" style="margin-bottom:20px;">
                  <h2 style="text-align:center;margin:0 0 10px 0;">
                    面料热销榜
                  </h2>
                  <div>
                    <table style="margin:0 auto;">
                      <tr v-for="(item, index) in hotSaleSoft" :key="index">
                        <td style="height:30px;min-width:160px;" v-for="(n, indexx) in 5" :key="indexx">
                          <span v-if="item[indexx].ITEM_NO != ''" class="numIndex hot-index-normal" :class="{
                              'hot-index1': index == 0,
                              'hot-index2': index == 1,
                              'hot-index3': index == 2
                            }">{{ index * 5 + indexx + 1 }}</span>
                          <a class="hoverAlink" title="点击前往下单"
                            @click="selectHot(item[indexx].ITEM_NO)">{{ item[indexx].ITEM_NO }}</a>
                          <img src="../assets/img/img/search-hot.gif" v-if="
                              (index == 0 || index == 1) &&
                                item[indexx].ITEM_NO != ''
                            " />
                        </td>
                      </tr>
                    </table>
                  </div>
                </div>
              </el-card>
            </div>
            <keep-alive>
              <router-view v-if="$route.meta.keepAlive === true" />
            </keep-alive>
            <router-view v-if="$route.meta.keepAlive !== true" />
          </el-tabs>
        </el-main>
      </el-container>
    </el-container>
    <el-backtop target=".backTop" :right="30" :visibility-height="20">
      <div style="{height: 100%;width: 100%;background-color: #f2f5f6;box-shadow: 0 0 6px rgba(0,0,0, .12);
                        text-align: center;line-height: 40px;color: #1989fa;}">
        UP
      </div>
    </el-backtop>
    <el-dialog :show-close="true" :visible.sync="notificationVisible" width="1000px" top="5vh" :title="newsTitle"
      center>
      <div v-html="newsHtmlData"></div>
      <span slot="footer" class="dialog-footer">
        <el-button type="primary" @click="notificationVisible = false">确 定</el-button>
      </span>
    </el-dialog>
    <el-dialog title="请填写完此调查表，才能继续操作！" :show-close="false" :close-on-click-modal="false" :close-on-press-escape="false"
      :visible.sync="studyVisible" width="900px" top="5vh" center>
      <keep-alive>
        <studyContextDetail ref="studyContextDetail" v-if="studyVisible" :selectData="studySelectData"
          @refresh="refreshStudy"></studyContextDetail>
      </keep-alive>
      <span slot="footer" class="dialog-footer">
        <el-button type="primary" @click="submitStudy">提交调查表</el-button>
      </span>
    </el-dialog>
    <el-dialog title="修改密码" :close-on-click-modal="false" :visible.sync="changePasswordVisible" width="450px">
      <el-form :model="passwordForm" :rules="passwordRules" ref="passwordForm" class="passwordForm">
        <el-form-item label="原密码" prop="pw">
          <el-input style="width:300px;" type="password" v-model="passwordForm.pw" placeholder="填写原密码"
            autocomplete="off"></el-input>
        </el-form-item>
        <el-form-item label="新密码" prop="npw">
          <el-input style="width:300px;" type="password" v-model="passwordForm.npw" placeholder="填写新密码"
            autocomplete="off"></el-input>
        </el-form-item>
        <el-form-item label="确认密码" prop="npw1">
          <el-input style="width:300px;" type="password" v-model="passwordForm.npw1" placeholder="再次填写新密码"
            autocomplete="off"></el-input>
        </el-form-item>
        <el-form-item style="text-align:center;">
          <el-button type="primary" @click="changePassWord('passwordForm')">确认修改</el-button>
          <el-button @click="resetForm('passwordForm')">重置</el-button>
        </el-form-item>
      </el-form>
    </el-dialog>
  </div>
</template>

<script>
import { getUserMoney } from "@/api/user";
import { getAllRefund } from "@/api/refund";
import { getIconNumber } from "@/api/painting";
import { checkBill } from "@/api/orderList";
import { GetNewNotification, InserFlag } from "@/api/notificationASP";
import { GetCustomerMustWriteStudy } from "@/api/studyASP";
import { QueryWebMenuByUserId } from "@/api/webMenuASP";
import { getAllOrders, GetBalancePeriod } from "@/api/orderListASP";
import { GetHotSales, GetItemDetailById } from "@/api/itemInfoASP";
import { GetCartItemCount } from "@/api/shopASP";
import screenfull from "screenfull";
import { mapMutations, mapActions } from "vuex";
import { mapState } from "vuex";
import Vue from "vue";
import Cookies from "js-cookie";
import menuTree from "./menuTree";
import studyContextDetail from "./studyContext/studyContextDetail";
import { GetAllCompensationOld } from "@/api/paymentASP";
import { ChangePassword } from "@/api/webUserASP";
import payDelegationVue from "./supplierModule/payDelegation.vue";
import { GetCurrentDelegation, GetAllDelegation } from "@/api/supplierASP";
import { GetAllData, GetAllUserData } from "@/api/lanju";
import { GetAllComplaint, GetAllUserComplaint } from "@/api/complaint";
import {
  GetImageCustomer,
  GetAllData as GetImageAll
} from "@/api/imageStoreASP";
import { GetAllCompensation, GetUserCompensation } from "@/api/paymentASP";
import Axios from "axios";

export default {
  name: "Main",
  components: {
    menuTree,
    studyContextDetail
  },
  data() {
    return {
      lastClickTime: new Date().getTime(),
      cid: Cookies.get("cid"),
      userInfo: JSON.parse(Cookies.get("userInfo")),
      isManager: Cookies.get("isManager"),
      customerType: Cookies.get("customerType"),
      realName: Cookies.get("realName"),
      identity: Cookies.get("identity"),
      newsIndex: 0, //当前滚动的公告
      newsTextArr: [], //最新公告集合
      newsTitle: "",
      newsHtmlData: "", //所有需要显示的公告拼接
      notificationVisible: false,
      studySelectData: [],
      studyVisible: false,
      asideStatus:
        window.localStorage.getItem("asideStatus") &&
        window.localStorage.getItem("asideStatus") == "true", //false:菜单栏处于展开状态； true：菜单栏处于收起状态
      defaultUrl: "",
      isFullscreen: false,
      adminText: "无新公告发布!",
      moneySituation: "",
      Initial_balance: 0,
      getTheTab: "",
      refreshMoneyClass: "el-icon-refresh-left",
      changePasswordVisible: false,
      passwordForm: {},
      passwordRules: {
        pw: [
          {
            validator: (rule, value, callback) => {
              if (!value) {
                callback(new Error("请填写密码"));
              } else {
                callback();
              }
            },
            trigger: "change"
          }
        ],
        npw: [
          {
            validator: (rule, value, callback) => {
              if (!value) {
                callback(new Error("请填写新密码"));
              } else if (value == this.passwordForm.pw) {
                callback(new Error("新密码与原始密码一致!"));
              } else {
                callback();
              }
            },
            trigger: "change"
          }
        ],
        npw1: [
          {
            validator: (rule, value, callback) => {
              if (!value) {
                callback(new Error("请再次填写新密码"));
              } else if (value !== this.passwordForm.npw) {
                callback(new Error("两次填写的密码不一致!"));
              } else {
                callback();
              }
            },
            trigger: "change"
          }
        ]
      },
      hotSaleData: [],
      hotSaleVersion: [],
      hotSaleItem: [],
      hotSaleCurtain: [],
      hotSaleSoft: []
    };
  },
  methods: {
    ...mapMutations("navTabs", ["addTab", "setMenuTreeList"]),
    ...mapMutations("badge", ["changeBadge"]),
    ...mapActions("navTabs", ["closeTab", "closeToTab"]),
    //获取角标情况【退货】
    async addBadgeIcon() {
      if (this.isContainAttr("refundCompensation")) {
        //let _refund = await getAllRefund({
        let _refund = await GetAllCompensationOld(
          {
            CID: this.cid,
            page: 1,
            number: 10000,
            startDate: "0001/1/1",
            endDate: "9999/12/31",
            state: "CUSTOMERAFFIRM"
          },
          { loading: false }
        );
        this.changeBadge({
          name: "refund",
          index: _refund.count
        });
      }
    },
    //获取角标情况【委托】
    async PaintingIcon() {
      if (this.isContainAttr("painting")) {
        let _refund = await getIconNumber(
          {
            cid: this.cid,
            page: 1,
            limit: 999,
            startDate: "",
            endDate: "",
            state: "CUSTOMERAFFIRM"
          },
          { loading: false }
        );
        this.changeBadge({
          name: "painting",
          index: _refund.airbrushDesignerAssureList.length
        });
      }
    },
    //获取角标待处理订单
    async OrderDealIcon() {
      if (this.isContainAttr("order/myOrder")) {
        let order = await getAllOrders(
          {
            companyId: Cookies.get("companyId"),
            limit: 9999,
            page: 1,
            cid: Cookies.get("cid"),
            statusId: ["0", "5", "6", "21", "22"],
            find: "",
            beginTime: "0001/1/1",
            finishTime: "9999/12/31",
            orderType: ""
          },
          { loading: false }
        );
        this.changeBadge({
          name: "orderDeal",
          index: order.count
        });
      }
    },
    //获取角标待确认对账单
    async getStatementIcon() {
      if (this.isContainAttr("statement")) {
        let url = "/customerBalance/getCustomerBalanceInfo.do";
        let data = {
          cid: Cookies.get("cid"),
          limit: 9999,
          page: 1,
          status: "待确认"
        };
        //let statement = await checkBill(url, data, { loading: false });
        let statement = await GetBalancePeriod(data, { loading: false });
        this.changeBadge({
          name: "statement",
          index: statement.count
        });
      }
    },
    //获取角标待处理付款委托书（客户）
    async payDelegationIcon1() {
      if (this.isContainAttr("supplierModule/payDelegation")) {
        let payDelegation1 = await GetCurrentDelegation(
          {
            companyId: Cookies.get("companyId"),
            limit: 9999,
            page: 1,
            CID: Cookies.get("cid"),
            beginTime: "0001/1/1",
            finishTime: "9999/12/31",
            STATUS: "1"
          },
          { loading: false }
        );
        let payDelegation2 = await GetCurrentDelegation(
          {
            companyId: Cookies.get("companyId"),
            limit: 9999,
            page: 1,
            CID: Cookies.get("cid"),
            beginTime: "0001/1/1",
            finishTime: "9999/12/31",
            STATUS: "4"
          },
          { loading: false }
        );
        this.changeBadge({
          name: "payDelegation1",
          index: payDelegation1.count + payDelegation2.count
        });
      }
    },
    //获取角标待处理付款委托书（公司审核）
    async payDelegationIcon2() {
      if (this.isContainAttr("supplierModule/payDelegationExamine")) {
        let payDelegation1 = await GetAllDelegation(
          {
            companyId: Cookies.get("companyId"),
            limit: 9999,
            page: 1,
            CID: Cookies.get("cid"),
            beginTime: "0001/1/1",
            finishTime: "9999/12/31",
            STATUS: "2"
          },
          { loading: false }
        );
        this.changeBadge({
          name: "payDelegation2",
          index: payDelegation1.count
        });
      }
    },
    //获取角标待处理的兰居设计单据（客户）
    async lanjuIcon() {
      if (this.isContainAttr("design/lanJu")) {
        let lanju1 = await GetAllData(
          {
            companyId: Cookies.get("companyId"),
            limit: 9999,
            page: 1,
            CID: Cookies.get("cid"),
            beginTime: "0001/1/1",
            finishTime: "9999/12/31",
            STATUS: "2"
          },
          { loading: false }
        );
        this.changeBadge({
          name: "lanju1",
          index: lanju1.count
        });
      }
    },
    //获取角标待处理的兰居设计单据（市场部）
    async lanJuMarketExamineIcon() {
      if (this.isContainAttr("design/lanJuMarketExamine")) {
        let lanju1 = await GetAllUserData(
          {
            companyId: Cookies.get("companyId"),
            limit: 9999,
            page: 1,
            CID: Cookies.get("cid"),
            beginTime: "0001/1/1",
            finishTime: "9999/12/31",
            STATUS: "1",
            type: 1
          },
          { loading: false }
        );
        this.changeBadge({
          name: "lanju2",
          index: lanju1.count
        });
      }
    },
    //获取角标待处理的兰居设计单据（广美设计）
    async lanJuGMExamineIcon() {
      if (this.isContainAttr("design/lanJuGMExamine")) {
        let lanju1 = await GetAllUserData(
          {
            companyId: Cookies.get("companyId"),
            limit: 9999,
            page: 1,
            CID: Cookies.get("cid"),
            beginTime: "0001/1/1",
            finishTime: "9999/12/31",
            STATUS: "8",
            type: 2
          },
          { loading: false }
        );
        this.changeBadge({
          name: "lanju3",
          index: lanju1.count
        });
      }
    },
    //获取角标待处理的兰居设计单据（广美财务）
    async lanJuFinanceExamineIcon() {
      if (this.isContainAttr("design/lanJuFinanceExamine")) {
        let lanju1 = await GetAllUserData(
          {
            companyId: Cookies.get("companyId"),
            limit: 9999,
            page: 1,
            CID: Cookies.get("cid"),
            beginTime: "0001/1/1",
            finishTime: "9999/12/31",
            STATUS: "3",
            type: 1
          },
          { loading: false }
        );
        this.changeBadge({
          name: "lanju4",
          index: lanju1.count
        });
      }
    },
    //获取角标待处理的物流投诉单据（客户评价）
    async complaintIcon() {
      if (this.isContainAttr("complaint")) {
        let complaint = await GetAllComplaint(
          {
            companyId: Cookies.get("companyId"),
            limit: 9999,
            page: 1,
            CID: Cookies.get("cid"),
            beginTime: "0001/1/1",
            finishTime: "9999/12/31",
            STATUS: 2
          },
          { loading: false }
        );
        this.changeBadge({
          name: "complaint1",
          index: complaint.count
        });
      }
    },
    //获取角标待处理的物流投诉单据（公司处理反馈）
    async complaintReplyIcon() {
      if (this.isContainAttr("complaintReply")) {
        let complaint = await GetAllUserComplaint(
          {
            companyId: Cookies.get("companyId"),
            limit: 9999,
            page: 1,
            CID: Cookies.get("cid"),
            beginTime: "0001/1/1",
            finishTime: "9999/12/31",
            STATUS: 1
          },
          { loading: false }
        );
        this.changeBadge({
          name: "complaint2",
          index: complaint.count
        });
      }
    },
    //获取角标待处理的形象店设计单据（客户编辑）
    async imageShopIcon() {
      if (this.isContainAttr("design/imageShop")) {
        let imageShop1 = await GetImageCustomer(
          {
            companyId: Cookies.get("companyId"),
            limit: 9999,
            page: 1,
            CID: Cookies.get("cid"),
            beginTime: "0001/1/1",
            finishTime: "9999/12/31",
            STATUS: 4
          },
          { loading: false }
        );
        let imageShop2 = await GetImageCustomer(
          {
            companyId: Cookies.get("companyId"),
            limit: 9999,
            page: 1,
            CID: Cookies.get("cid"),
            beginTime: "0001/1/1",
            finishTime: "9999/12/31",
            STATUS: 5
          },
          { loading: false }
        );
        this.changeBadge({
          name: "imageShop1",
          index: imageShop1.count + imageShop2.count
        });
      }
    },
    //获取角标待处理的形象店设计单据（兰居审核）
    async ISExamineMarketIcon() {
      if (this.isContainAttr("design/ISExamineMarket")) {
        let imageShop1 = await GetImageAll(
          {
            companyId: Cookies.get("companyId"),
            limit: 9999,
            page: 1,
            CID: Cookies.get("cid"),
            beginTime: "0001/1/1",
            finishTime: "9999/12/31",
            STATUS: 1
          },
          { loading: false }
        );
        this.changeBadge({
          name: "imageShop2",
          index: imageShop1.count
        });
      }
    },
    //获取角标待处理的形象店设计单据（广美审核）
    async ISExamineGMIcon() {
      if (this.isContainAttr("design/ISExamineGM")) {
        let imageShop1 = await GetImageAll(
          {
            companyId: Cookies.get("companyId"),
            limit: 9999,
            page: 1,
            CID: Cookies.get("cid"),
            beginTime: "0001/1/1",
            finishTime: "9999/12/31",
            STATUS: 2
          },
          { loading: false }
        );
        this.changeBadge({
          name: "imageShop3",
          index: imageShop1.count
        });
      }
    },
    //购物车墙纸数量
    async wallCountIcon() {
      if (this.isContainAttr("shoppingCar/shopping?wallPaper")) {
        let wallpaper = await GetCartItemCount(
          {
            cid: Cookies.get("cid"),
            commodityType: "wallpaper"
          },
          { loading: false }
        );
        this.changeBadge({
          name: "wallCount",
          index: wallpaper.count
        });
      }
    },
    //购物车窗帘数量
    async curtainCountIcon() {
      if (this.isContainAttr("shoppingCar/shopping?curtain")) {
        let curtain = await GetCartItemCount(
          {
            cid: Cookies.get("cid"),
            commodityType: "curtain"
          },
          { loading: false }
        );
        this.changeBadge({
          name: "curtainCount",
          index: curtain.count
        });
      }
    },
    //购物车软装数量
    async softCountIcon() {
      if (this.isContainAttr("shoppingCar/shopping?softSuit")) {
        let soft = await GetCartItemCount(
          {
            cid: Cookies.get("cid"),
            commodityType: "soft"
          },
          { loading: false }
        );
        this.changeBadge({
          name: "softCount",
          index: soft.count
        });
      }
    },
    //新退货赔偿用户可确定单据数量
    async newRefundUserIcon() {
      if (this.isContainAttr("newRefund")) {
        let newRefund = await GetUserCompensation(
          {
            CID: Cookies.get("cid"),
            number: 9999,
            page: 1,
            startDate: "0001/1/1",
            endDate: "9999/12/31",
            state: "NEEDPROCESSING"
          },
          { loading: false }
        );
        this.changeBadge({
          name: "newRefund1",
          index: newRefund.count
        });
      }
    },
    //新退货赔偿兰居可编辑审核单据数量
    async newRefundExamineIcon() {
      if (this.isContainAttr("newRefundExamine")) {
        let newRefundExamine1 = await GetAllCompensation(
          {
            number: 9999,
            page: 1,
            startDate: "0001/1/1",
            endDate: "9999/12/31",
            state: "NEEDPROCESSING"
          },
          { loading: false }
        );
        this.changeBadge({
          name: "newRefund2",
          index: newRefundExamine1.count
        });
      }
    },
    //网签系统
    async getWangQianIcon() {
      var allCount = 0;
      if (this.identity != "SUPLY") {
        if (this.identity == "ECWEB") {
          //用户获取需要处理的资料卡和协议书数量
          //资料卡
          let cardsCount = await Axios.post(
            this.Global.wangqianUrl + "/yulan/customerInfo/getCustomerInfo.do",
            {
              CID: Cookies.get("companyId")
            },
            { loading: false }
          );
          if (cardsCount.data != null && cardsCount.data.code == 0) {
            var state = cardsCount.data.data.state;
            if (
              state == "CUSTOMERPORCESSING" ||
              state == "CUSTOMERPORCESSING2" ||
              state == "ONCREATE"
            ) {
              allCount++;
            }
          }
          //协议书
          let contractCount = await Axios.post(
            this.Global.wangqianUrl +
              "/yulan/infoState/getYLcontractentryState.do",
            {
              cid: Cookies.get("cid"),
              cyear: new Date().getFullYear()
            },
            { loading: false }
          );
          if (contractCount.data != null) {
            var state = contractCount.data.yLcontractInfo;
            if (state == "客户查看确认协议数据中") {
              allCount++;
            }
          }
        } else {
          //审核人员
          if (this.userInfo.pos) {
            let posList = this.userInfo.pos; //获得职位
            if (posList != null && posList.length > 0) {
              for (var i = 0; i < posList.length; i++) {
                var pos = posList[i].position;
                var state = "";
                var YLState = "";
                //资料卡：IT=>客户=>业务员(办事处,业务经理,中心总经理)=>订单部
                //协议书：业务员(办事处,业务经理)=>客户=>业务员(中心总经理)=>内部人员
                switch (pos) {
                  case "SALEMAN_M": //办事处经理(审核资料卡,填写修改协议)
                    state = "BUSINESSCHECKING"; //业务员审核中
                    YLState = "SALEMANMODIFYING";
                    break;
                  case "SALEMAN_S": //业务经理(审核资料卡,填写修改协议)
                    state = "BUSINESSCHECKING";
                    YLState = "SALEMANMODIFYING";
                    break;
                  case "MANAGER": //中心总经理(审核协议)
                    YLState = "ASM_CHECKING";
                    break;
                  case "MARKETCHECKER": //市场部(审核协议)
                    YLState = "DEP_MARKET_CHECK";
                    break;
                  case "VSMAPPROVEXII": //销售总监(审核协议)
                    YLState = "CSA_CHECK";
                    break;
                  case "BILLDEP_APPROVE": //订单部(审核资料卡)
                    state = "BIILDEPCHECKING"; //订单部审核中
                    break;
                }
                //获得可操作的资料卡
                if (state != "") {
                  let cardsCount = await Axios.post(
                    this.Global.wangqianUrl +
                      "/yulan/customerInfo/getNcustomerinfo.do",
                    {
                      page: "1",
                      limit: "99",
                      year: new Date().getFullYear(),
                      state: state,
                      find: "",
                      area_1: "",
                      area_2: "",
                      cid: Cookies.get("cid"),
                      position: pos,
                      ylcstate: ""
                    },
                    { loading: false }
                  );
                  if (cardsCount.data != null) {
                    allCount += cardsCount.data.count;
                  }
                }
                //可操作得协议书
                if (YLState != "") {
                  if (YLState == "SALEMANMODIFYING") {
                    //可以创建和修改协议
                    //需创建数量
                    let cardsCount2 = await Axios.post(
                      this.Global.wangqianUrl +
                        "/yulan/customerInfo/getNcustomerinfo.do",
                      {
                        page: "1",
                        limit: "99",
                        year: new Date().getFullYear(),
                        state: "APPROVED",
                        find: "",
                        area_1: "",
                        area_2: "",
                        cid: Cookies.get("cid"),
                        position: pos,
                        ylcstate: "SALEMANFILLING"
                      },
                      { loading: false }
                    );
                    if (cardsCount2.data != null) {
                      allCount += cardsCount2.data.count;
                    }
                    //需修改数量
                    let cardsCount3 = await Axios.post(
                      this.Global.wangqianUrl +
                        "/yulan/customerInfo/getNcustomerinfo.do",
                      {
                        page: "1",
                        limit: "99",
                        year: new Date().getFullYear(),
                        state: "",
                        find: "",
                        area_1: "",
                        area_2: "",
                        cid: Cookies.get("cid"),
                        position: pos,
                        ylcstate: "SALEMANMODIFYING"
                      },
                      { loading: false }
                    );
                    if (cardsCount3.data != null) {
                      allCount += cardsCount3.data.count;
                    }
                  } else {
                    //审核协议
                    let contractCount = await Axios.post(
                      this.Global.wangqianUrl +
                        "/yulan/YLcontractentry/getYlcsbysigned.do",
                      {
                        limit: "99",
                        page: "1",
                        year: new Date().getFullYear(),
                        area_1: "",
                        area_2: "",
                        find: "",
                        need: "checking",
                        cid: Cookies.get("cid"),
                        position: pos
                      },
                      { loading: false }
                    );
                    if (contractCount.data != null) {
                      allCount += contractCount.data.count;
                    }
                  }
                }
              }
            }
          }
        }
        this.changeBadge({
          name: "wangqian",
          index: allCount
        });
      }
    },
    //获取用户余额情况
    async userMoney() {
      this.refreshMoneyClass = "el-icon-loading";
      this.moneySituation = "";
      getUserMoney(
        {
          cid: this.cid,
          companyId: Cookies.get("companyId")
        },
        { loading: false } //传入参数控制页面是否loading
      )
        .then(res => {
          if (this.isManager != "1") {
            if (res.data < 0) {
              this.moneySituation = "当前余额不足，请尽快打款";
            } else {
              this.moneySituation = "当前余额充足，请继续保持";
            }
          } else {
            this.moneySituation = "当前余额 " + res.data + "元";
          }
          this.refreshMoneyClass = "el-icon-refresh-left";
        })
        .catch(err => {
          console.log(err);
        });
    },
    refreshUserMoney() {
      this.userMoney();
    },
    lastClick() {
      this.lastClickTime = new Date().getTime();
    },
    //按钮样式--菜单展开收起
    changeAside() {
      this.asideStatus = !this.asideStatus;
      window.localStorage.setItem("asideStatus", this.asideStatus);
    },
    //全屏事件
    screenfull() {
      if (!screenfull.enabled) {
        this.$message({
          message: "您的浏览器不支持全屏!!!",
          type: "warning"
        });
        return false;
      }
      screenfull.toggle();
      this.isFullscreen = true;
    },
    //是否全屏并按键ESC键的方法
    checkFull() {
      var isFull =
        document.fullscreenEnabled ||
        window.fullScreen ||
        document.webkitIsFullScreen ||
        document.msFullscreenEnabled;
      if (isFull === undefined) {
        isFull = false;
      }
      return isFull;
    },
    //获取当前路径
    getPath() {
      this.defaultUrl = window.location.href.split("#/")[1];
    },
    //点击标签页触发的事件
    getTab(val) {
      this.$store.commit("navTabs/setActiveUrlName", val.name);
      this.getTheTab = this.$store.state.navTabs.activeUrlName;
    },
    //退出登录
    logout() {
      //清除数据
      Cookies.remove("cid");
      Cookies.remove("customerType");
      //跳转链接
      this.$router.push({
        name: "login",
        params: {
          autoSign: false
        }
      });
      //this.$router.go(0);//刷新页面
    },
    //获得菜单数组并传入store ,await并不会阻塞主线程，这里并不起作用
    async getMenuTree() {
      this.$store.commit("navTabs/emptyMenuTreeList");
      await QueryWebMenuByUserId({
        userid: JSON.parse(Cookies.get("userInfo")).userId
      }).then(res => {
        if (res.data.children.length > 0) {
          this.setMenuTreeList(res.data.children);
          if (res.data.children.length == 1) {
            if (
              res.data.children[0].MENU_TYPE == "menu" &&
              (!res.data.children[0].children ||
                res.data.children[0].children.length == 0)
            ) {
              this.addTab(res.data.children[0].MENU_LINK);
            }
          }
          if (this.isContainAttr("marketInfo")) {
            this.getStudy(); //有权限才加载调查表
          }
          this.getIconAll();
        } else {
          this.$alert("没有菜单权限，请联系管理员配置", "提示", {
            confirmButtonText: "确定",
            type: "success"
          });
        }
      });
    },
    isContainAttr(attr) {
      //是否包含权限
      return (
        this.menuTreeListFlatten.filter(item => item.MENU_LINK == attr).length >
        0
      );
    },
    startMove() {
      //设置定时器滚动公告
      this.newsTimer = setInterval(() => {
        if (this.newsIndex === this.newsTextArr.length - 1) {
          this.newsIndex = 0;
        } else {
          this.newsIndex += 1;
        }
      }, 3000);
    },
    getNews() {
      //获得最新的生效公告
      GetNewNotification({ cid: this.cid }).then(res => {
        this.newsTextArr = res.data;
        if (this.newsTextArr.length > 0) {
          this.startMove();
          for (var i = 0; i < this.newsTextArr.length; i++) {
            if (this.newsTextArr[i].showFlag == 1) {
              this.newsTextArr[i].CONTENT = this.newsTextArr[i].CONTENT.replace(
                /\[ReplaceMark\]/g,
                this.Global.fileCenterUrl
              ); //替换网址
              //将所有需要显示的公告拼接
              this.newsHtmlData +=
                "<div style='text-align:center;'><span style='font-size:18px;color:#303133;'>" +
                this.newsTextArr[i].TITLE +
                "</span></div><br />";
              this.newsHtmlData += this.newsTextArr[i].CONTENT + "<br /><br />";
              if (i != this.newsTextArr.length - 1)
                this.newsHtmlData +=
                  "<div style='border-bottom:0.2rem solid #ccc;'></div><br />";
              this.notificationVisible = true;
              if (this.newsTextArr[i].POPUPTYPE == "FIRSTOFDAY")
                InserFlag({
                  nid: this.newsTextArr[i].ID,
                  cid: this.cid,
                  accept: 1
                }); //标记为已显示
            }
          }
        }
      });
    },
    showNotification(item) {
      this.newsTitle = item.TITLE;
      this.newsHtmlData = item.CONTENT;
      this.notificationVisible = true;
    },
    getStudy() {
      GetCustomerMustWriteStudy({ cid: this.cid }).then(res => {
        if (res.data.length > 0) {
          this.studySelectData = res.data[0];
          this.studyVisible = true;
        }
      });
    },
    submitStudy() {
      this.$refs.studyContextDetail.submitStudy(); //调用子组件方法
    },
    refreshStudy() {
      this.studyVisible = false;
      this.getStudy();
    },
    resetForm(formName) {
      this.$refs[formName].resetFields();
    },
    changePassWord(formName) {
      this.$refs[formName].validate(valid => {
        if (valid) {
          ChangePassword({
            loginName: this.cid,
            password: this.passwordForm.pw,
            newPassword: this.passwordForm.npw
          })
            .then(res => {
              this.changePasswordVisible = false;
              this.resetForm(formName);
              this.$alert("修改成功", "提示", {
                confirmButtonText: "确定",
                type: "success"
              });
            })
            .catch(res => {
              this.$alert(res.msg ? res.msg : "修改失败", "提示", {
                confirmButtonText: "确定",
                type: "success"
              });
            });
        }
      });
    },
    getHotSale() {
      this.hotSaleData = {};
      this.hotSaleVersion = {};
      this.hotSaleItem = {};
      GetHotSales().then(res => {
        if (res.data.length > 0) {
          var itemData = res.data.filter(item => item.TYPE == "A"); //型号热销
          var versionData = res.data.filter(item => item.TYPE == "B"); //版本热销
          var curtainData = res.data.filter(item => item.TYPE == "C"); //窗帘版本推荐
          var softData = res.data.filter(item => item.TYPE == "D"); //面料热销
          var data = [];
          var data2 = [];
          var data3 = [];
          var data4 = [];
          var index = 0;
          var indexx = 0;
          //分成每行5个的数据
          //版本
          for (var i = 0; i < versionData.length; i++) {
            if (i >= 5 * (index + 1)) {
              index++;
              indexx = 0;
            }
            if (i == 5 * index) {
              data[index] = new Array();
            }
            data[index][indexx] = versionData[i];
            indexx++;
          }
          if (data[index].length < 5) {
            var len = 5 - data[index].length;
            for (var i = 0; i < len; i++) {
              data[index].push({
                ITEM_NO: ""
              });
            }
          }
          this.hotSaleVersion = data;
          //型号
          index = 0;
          indexx = 0;
          for (var i = 0; i < itemData.length; i++) {
            if (i >= 5 * (index + 1)) {
              index++;
              indexx = 0;
            }
            if (i == 5 * index) {
              data2[index] = new Array();
            }
            data2[index][indexx] = itemData[i];
            indexx++;
          }
          if (data2[index].length < 5) {
            var len = 5 - data2[index].length;
            for (var i = 0; i < len; i++) {
              data2[index].push({
                ITEM_NO: ""
              });
            }
          }
          this.hotSaleItem = data2;
          //窗帘
          index = 0;
          indexx = 0;
          for (var i = 0; i < curtainData.length; i++) {
            if (i >= 5 * (index + 1)) {
              index++;
              indexx = 0;
            }
            if (i == 5 * index) {
              data3[index] = new Array();
            }
            data3[index][indexx] = curtainData[i];
            indexx++;
          }
          if (data3[index].length < 5) {
            var len = 5 - data3[index].length;
            for (var i = 0; i < len; i++) {
              data3[index].push({
                ITEM_NO: ""
              });
            }
          }
          this.hotSaleCurtain = data3;
          //面料
          index = 0;
          indexx = 0;
          for (var i = 0; i < softData.length; i++) {
            if (i >= 5 * (index + 1)) {
              index++;
              indexx = 0;
            }
            if (i == 5 * index) {
              data4[index] = new Array();
            }
            data4[index][indexx] = softData[i];
            indexx++;
          }
          if (data4[index].length < 5) {
            var len = 5 - data4[index].length;
            for (var i = 0; i < len; i++) {
              data4[index].push({
                ITEM_NO: ""
              });
            }
          }
          this.hotSaleSoft = data4;
        }
      });
    },
    selectHot(itemNo) {
      GetItemDetailById({ itemNo: itemNo }, { loading: false }).then(res => {
        if (res.data) {
          switch (res.data[0].PRODUCT_TYPE) {
            case "KS": //窗帘
              if (this.isContainAttr("shops/curtain")) {
                this.addTab("shops/curtain");
                this.$router.push({
                  name: "curtain",
                  params: {
                    selectNo: itemNo
                  }
                });
              } else {
                console.log("没有该菜单");
              }
              break;
            case "ML":
            case "XHB":
            case "PJB":
            case "BZ":
            case "GH":
            case "TC":
            case "OTHER":
              if (this.isContainAttr("shops/softSuit")) {
                this.addTab("shops/softSuit");
                Cookies.set("activeNameSoftSuit", res.data[0].PRODUCT_TYPE);
                this.$router.push({
                  name: "softSuit",
                  params: {
                    selectNo: itemNo,
                    selectType: res.data[0].PRODUCT_TYPE
                  }
                });
              } else {
                console.log("没有该菜单");
              }
              break;
            default:
              if (
                res.data[0].PRO_TYPE == "qiang" ||
                res.data[0].PRO_TYPE == "support" ||
                res.data[0].PRO_TYPE == "other"
              ) {
                if (this.isContainAttr("shops/wallPaper")) {
                  this.addTab("shops/wallPaper");
                  this.$router.push({
                    name: "wallPaper",
                    params: {
                      selectNo: itemNo
                    }
                  });
                } else {
                  console.log("没有该菜单");
                }
              }
              break;
          }
        }
      });
    },
    //获取角标在获取权限之后
    getIconAll() {
      this.addBadgeIcon();
      this.PaintingIcon();
      this.OrderDealIcon();
      this.getStatementIcon();
      this.payDelegationIcon1();
      this.payDelegationIcon2();
      this.lanjuIcon();
      this.lanJuMarketExamineIcon();
      this.lanJuGMExamineIcon();
      this.lanJuFinanceExamineIcon();
      this.complaintIcon();
      this.complaintReplyIcon();
      this.imageShopIcon();
      this.ISExamineMarketIcon();
      this.ISExamineGMIcon();
      this.wallCountIcon();
      this.curtainCountIcon();
      this.softCountIcon();
      this.newRefundUserIcon();
      this.newRefundExamineIcon();
      this.getWangQianIcon();
    }
  },
  computed: {
    ...mapState("navTabs", ["tabList", "menuTreeList", "menuTreeListFlatten"]),
    ...mapState("badge", ["wangqian"]),
    key() {
      return this.$route.name !== undefined ? this.$route.name : this.$route;
    },
    //切换标签页时导航菜单的变换,用来满足奇怪需求
    url() {
      let index = this.$store.state.navTabs.activeUrlName;
      if (index === "order/orderDetail") {
        return "order/myOrder";
      }
      if (index === "detail/detailWallPaper") {
        return "shoppingCar/shopping?wallPaper";
      }
      if (index === "detail/detailSoftSuit") {
        return "shoppingCar/shopping?softSuit";
      }
      if (index === "detail/detailCurtain") {
        return "shoppingCar/shopping?curtain";
      }
      if (index === "detail/detailRefund") {
        return "refundCompensation";
      }
      return index;
    },
    activeTabName: {
      get() {
        return this.$store.state.navTabs.activeTabName;
      },
      set(value) {
        this.$store.commit("navTabs/setActiveUrlName", value);
        this.$router.push({
          path: "/" + this.$store.state.navTabs.activeUrlName
        });
      }
    }
  },
  mounted() {
    window.onresize = () => {
      // 全屏下监控是否按键了ESC
      if (!this.checkFull()) {
        // 全屏下按键esc后要执行的动作
        this.isFullscreen = false;
      }
    };
    window.onkeydown = () => {
      this.lastClickTime = new Date().getTime();
    };
    this.timeOutTimer = setInterval(() => {
      var interval = 15 * 60 * 1000;
      if (new Date().getTime() - this.lastClickTime >= interval) {
        //15分钟不操作自动退出
        this.$message.close();
        clearInterval(this.timeOutTimer);
        this.logout();
        this.$alert("长时间未操作，自动退出", "提示", {
          confirmButtonText: "确定",
          type: "info"
        });
      } else if (
        new Date().getTime() - this.lastClickTime >=
        interval - 10 * 1000
      ) {
        //10秒提醒
        this.$message.close();
        this.$message({
          duration: 1000,
          message: `长时间未操作，将在${Math.ceil(
            (interval - (new Date().getTime() - this.lastClickTime)) / 1000
          )}秒后自动退出(点击任意位置可继续操作)`,
          type: "warning"
        });
      }
    }, 1000);
  },
  beforeCreate() {
    if (Cookies.get("cid") === null || Cookies.get("cid") === undefined) {
      Cookies.set("cid", "C01613");
    }
    if (
      Cookies.get("customerType") === null ||
      Cookies.get("customerType") === undefined
    ) {
      Cookies.set("customerType", "02");
    }
  },
  created() {
    this.getMenuTree(); //获得菜单权限树,获取角标在后去权限之后
    this.getPath();
    this.addTab("main");
    this.addTab(this.defaultUrl); //刷新之后添加的
    //获得最新公告
    if (this.customerType != "110") this.getNews();
    if (this.identity == "ECWEB") this.userMoney(); //获得用户余额
    //触发角标刷新
    this.$root.$on("refreshBadgeIcon", value => {
      switch (value) {
        case "painting":
          this.PaintingIcon();
          break;
        case "refund":
          this.addBadgeIcon();
          break;
        case "orderDeal":
          this.OrderDealIcon();
          break;
        case "statement":
          this.getStatementIcon();
          break;
        case "payDelegation1":
          this.payDelegationIcon1();
          break;
        case "payDelegation2":
          this.payDelegationIcon2();
          break;
        case "lanju1":
          this.lanjuIcon();
          break;
        case "lanju2":
          this.lanJuMarketExamineIcon();
          break;
        case "lanju3":
          this.lanJuGMExamineIcon();
          break;
        case "lanju4":
          this.lanJuFinanceExamineIcon();
          break;
        case "complaint1":
          this.complaintIcon();
          break;
        case "complaint2":
          this.complaintReplyIcon();
          break;
        case "imageShop1":
          this.imageShopIcon();
          break;
        case "imageShop2":
          this.ISExamineMarketIcon();
          break;
        case "imageShop3":
          this.ISExamineGMIcon();
          break;
        case "wallCount":
          this.wallCountIcon();
          break;
        case "curtainCount":
          this.curtainCountIcon();
          break;
        case "softCount":
          this.softCountIcon();
          break;
        case "newRefund1":
          this.newRefundUserIcon();
          break;
        case "newRefund2":
          this.newRefundExamineIcon();
          break;
      }
    });
    document.onkeydown = function(event) {
      var key = window.event.keyCode;
      if (key == 27) {
        if (this.fullscreen == true) {
          this.handleFullScreen();
        }
      }
    };
    //可以从其他页面触发刷新余额
    this.$root.$on("refreshMoneyEvent", () => {
      this.userMoney();
    });
    this.getHotSale(); //获得热销榜
  },
  beforeDestroy() {
    clearInterval(this.newsTimer);
    clearInterval(this.timeOutTimer);
  },
  watch: {}
};
</script>

<style scoped>
.center {
  width: 99.5%;
  margin: 0 auto;
}
/*侧边栏样式*/
#aside-header {
  width: 100%;
  height: 60px;
  display: flex;
  justify-content: center;
  align-items: center;
  background: white;
  color: #464c5b;
  font-size: 20px;
  font-weight: bold;
}
#aside-logo {
  width: 42px;
  height: 42px;
  margin-right: 15px;
  line-height: 60px;
  display: inline-block;
  border-radius: 21px;
  background: url("../assets/img/headerLogo.jpg") no-repeat;
  background-size: 42px 42px;
}

/*顶部导航样式*/
.el-header {
  background: #8bc34a;
  padding: 0;
}
.el-header li {
  float: left;
}
.el-header li:hover {
  cursor: pointer;
  background: #86b450;
}
.el-header ul {
  margin: 0 10px;
}
.headIcon {
  line-height: 40px;
  color: white;
}
.headIcon2 {
  line-height: 40px;
  color: white;
  font-size: 20px;
  margin: 0 10px;
}
.headSpan2 {
  color: white;
  line-height: 40px;
  margin-right: 10px;
  margin-left: -10px;
}
.headSpan {
  color: white;
  line-height: 40px;
}
.el-dropdown {
  margin: 0 15px;
}
.el-dropdown-menu__item:hover {
  color: #606266;
  background: #eee;
}
.tabs {
  margin: 0 -4px;
  padding: 0;
  width: 100%;
  height: 40px;
}
.notice {
  width: 100%;
  height: 30px;
  background: white;
  margin-bottom: 5px;
  vertical-align: middle;
  font-size: 12px;
}
.vertically {
  position: fixed;
  top: 50%;
  color: #300112;
}
.slide-enter-active {
  transition: all 0.5s linear;
}
.slide-leave-active {
  opacity: 0;
}
.slide-enter {
  opacity: 0;
}
.slide-leave-to {
  opacity: 0;
}
.numIndex {
  display: inline-block;
  padding: 1px 0;
  color: #fff;
  min-width: 15px;
  line-height: 100%;
  font-size: 12px;
  text-align: center;
  margin-right: 5px;
}
.hot-index1 {
  background-color: #f54545 !important;
}
.hot-index2 {
  background-color: #ff8547 !important;
}
.hot-index3 {
  background-color: #ffac38 !important;
}
.hot-index-normal {
  background-color: #8eb9f5;
}
.hoverAlink {
  cursor: pointer;
}
.hoverAlink:hover {
  text-decoration: underline !important;
}
</style>

<style>
.passwordForm .el-form-item__label {
  width: 80px;
}
.el-card__header {
  padding: 10px 15px !important;
}
.el-card__body {
  padding: 10px;
}
.el-dialog__body {
  padding: 20px;
}
.el-table td,
.el-table th {
  padding: 4px 0 !important;
}
.el-table .cell {
  padding: 0 5px !important;
}
.el-badge__content {
  border: none !important;
}
.el-table th.gutter {
  display: table-cell !important;
}
.el-table colgroup.gutter {
  display: table-cell !important;
}
.el-table .success-row {
  background: #f0f9eb;
}
.el-tabs--border-card>.el-tabs__content{
  padding: 10px;
}
</style>