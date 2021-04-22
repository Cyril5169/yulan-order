<template>
  <div id="detailRefund" class="rel">
    <el-card shadow="hover">
      <div id="printTable" class="f16" style="width: 1164px; border:1px solid #000; margin: -1px;">
        <section class="f14 t-foot border-b tr">
          <span v-if="baseData.method !== 'new'">编号：{{ baseData.ID }}</span>
          <span>创建人：{{ baseData.ERP_CREATORNAME }}</span>
          <span style="margin-right:30px;">建立时间：{{ toLocaleTime }}&emsp;</span>
        </section>
        <h3 class="mt10 tc rel" style="margin:5px 0 0 0;">
          客户确认书【{{ getNameByState(baseData.STATE) }}】
          <i class="icon-print el-icon-printer" style="margin-right:20px;" @click="printRefund"></i>
        </h3>
        <br />
        <section class="mt10">
          <p class="uli" style="margin-left:5px;">TO：{{ baseData.CNAME }}</p>
          <p class="t-indent">
            我公司现收到以下拟申请退货产品，经调查、检测核实，作如下处理：
          </p>
        </section>
        <el-table id="refundTable" stripe :data="item" class="border-t border-b" style="width: 100%;">
          <el-table-column prop="PRODUCTION_VERSION" width="150" align="center" label="产品/项目">
          </el-table-column>
          <el-table-column prop="ITEM_NO" width="150" align="center" label="型号"> </el-table-column>
          <el-table-column prop="UNIT" width="150" align="center" label="单位"> </el-table-column>
          <el-table-column prop="QTY" width="150" align="center" label="数量">
          </el-table-column>
          <el-table-column prop="TOTALMONEY" width="150" header-align="center" align="right" label="金额">
          </el-table-column>
          <el-table-column prop="NOTES" align="center" label="质量问题"> </el-table-column>
          <el-table-column prop="PROCESS" align="center" label="处理意见"> </el-table-column>
          <el-table-column label="操作" v-if="baseData.method !== 'see' && baseData.ERP_CREATOR === cid">
            <template slot-scope="scope">
              <i class="el-icon-close" style="cursor:pointer;" @click="deleteItem(scope.$index)"></i>
            </template>
          </el-table-column>
        </el-table>
        <table id="moneyTable" border="0" style="width: 100%;" v-if="item.length > 0">
          <tr>
            <td width="130.5px" style="text-align:center;">金额（小写）</td>
            <td width="581px" class="tr">{{ totalMoney }}</td>
            <td rowspan="2"></td>
          </tr>
          <tr>
            <td width="130.5px" style="text-align:center;">金额（大写）</td>
            <td width="581px" class="tr">{{ totalMoneyUpper }}</td>
          </tr>
        </table>

        <section class="f14">
          <p @click="addItem" class="tc f16 p20 border-b p-click" v-if="baseData.method !== 'see'">
            添加退换货品
            <i class="el-icon-circle-plus success-icon f24 r"></i>
          </p>
          <section class="t-dec" style="padding:10px 0 10px 20px;">
            注意：1、若您未在我公司发出的《客户确认书》之日起15日内确认、提出异议的，则视为放弃赔偿权利；<br />
            &emsp;&emsp;&emsp;2、玉兰公司支付的退货金额，仅限于本确认书的金额，不承担其他费用；<br />
            &emsp;&emsp;&emsp;3、请您仔细阅读本确认书相关信息，一旦确认，视为同意我公司的处理本方案。<br />
            公司名称：广东玉兰集团股份有限公司&emsp;&emsp;&emsp;&emsp;地址：东莞市莞城莞龙路段狮龙路莞城科技园内<br />
            电话:0769-23321708&emsp;&emsp;邮政编码:523119&emsp;&emsp;&nbsp;邮箱：yulan315@yulangroup.cn<br />
          </section>
          <section class="tc ovh">
            <div class="t-com dib border-r l">
              广东玉兰集团股份有限公司<br />
              市场部<br />
              {{ new Date(baseData.CREATE_TS).getFullYear() }}年
              {{ addZeroIfNeed(new Date(baseData.CREATE_TS).getMonth() + 1) }}月
              {{ addZeroIfNeed(new Date(baseData.CREATE_TS).getDate()) }}日
            </div>
            <div class="t-com dib r">
              经销商
              <span v-if="baseData.STATE === 'APPROVED'">:{{ baseData.CNAME }}</span><br />
              （盖章）<br />
              <span v-if="baseData.STATE !== 'APPROVED'"> 年 月 日</span>
              <span v-else>
                {{ new Date(baseData.REASSURE_TS).getFullYear() }}年
                {{
                  addZeroIfNeed(new Date(baseData.REASSURE_TS).getMonth() + 1)
                }}月
                {{ addZeroIfNeed(new Date(baseData.REASSURE_TS).getDate()) }}日
              </span>
            </div>
          </section>
        </section>
      </div>
      <div class="tc mt20">
        <el-button v-if="baseData.method !== 'see'" type="danger" style="margin-right: 20px;" :disabled="item.length === 0"
          @click.native="updateOrDelete(0)">
          保存修改
        </el-button>
        <el-button v-if="
              baseData.method === 'edit' ||
                (baseData.method === 'new' && item.length !== 0)
            " :type="item.length != 0?'primary':'danger'" style="margin-right: 20px;" @click.native="updateOrDelete(1)">
          {{ judgeOpa }}
        </el-button>
        <el-button v-if="
            baseData.method === 'see' &&
              baseData.STATE === 'CUSTOMERAFFIRM' &&
              identity === 'ECWEB'
          " type="primary" style="margin-left: 20px;" @click.native="userOperation(1)">
          同意
        </el-button>
        <el-button v-if="
            baseData.method === 'see' &&
              baseData.STATE === 'CUSTOMERAFFIRM' &&
              identity === 'ECWEB'
          " type="danger" style="margin-left: 20px;" @click="userOperation(0)">
          不同意
        </el-button>
        <el-button type="info" style="margin-left: 20px;" @click="returnBack">
          返回
        </el-button>
      </div>
    </el-card>
    <el-dialog title="填写货品信息" width="500px" :visible.sync="dialogFormVisible" :close-on-click-modal="false"
      :close-on-press-escape="false">
      <el-form label-width="100px" :model="itemMsg">
        <el-form-item label="型号">
          <el-input style="width:300px;" v-model="itemMsg.ITEM_NO" readonly></el-input>
        </el-form-item>
        <el-form-item label="产品/项目">
          <el-input style="width:300px;" v-model="itemMsg.PRODUCTION_VERSION" readonly></el-input>
        </el-form-item>
        <el-form-item label="单位">
          <el-input style="width:300px;" v-model="itemMsg.UNIT" readonly></el-input>
        </el-form-item>
        <el-form-item label="数量">
          <currency-input v-model="itemMsg.QTY" :placeholder="''" :customStyle="'width: 300px; height: 40px;'">
          </currency-input>
        </el-form-item>
        <el-form-item label="金额">
          <currency-input v-model="itemMsg.TOTALMONEY" :placeholder="''" :customStyle="'width: 300px; height: 40px;'">
          </currency-input>
        </el-form-item>
        <el-form-item label="质量问题">
          <el-input style="width:300px;" v-model="itemMsg.NOTES"></el-input>
        </el-form-item>
        <el-form-item label="处理意见">
          <el-select v-model="itemMsg.PROCESS" placeholder="请选择处理意见">
            <el-option label="赔偿" value="赔偿"></el-option>
            <el-option label="退货" value="退货"></el-option>
          </el-select>
        </el-form-item>
      </el-form>
      <div slot="footer" class="tc">
        <el-button @click="saveDialog" type="success">保 存</el-button>
        <el-button @click="closeDialog" type="danger">放 弃</el-button>
      </div>
    </el-dialog>
  </div>
</template>
<script>
import print from "print-js";
import "@/assets/css/base.css";
import { digitUppercase } from "@/common/js/money.js";
import { toLocale } from "@/common/js/date.js";
import {
  getProductData,
  addRefund,
  getRefundById,
  deleteRefund,
  updataRefundStatus,
  updateRefund
} from "@/api/refund";
import {
  GetCompensationByIdBefore,
  InsertCompensationOld,
  UpdateCompensation,
  DeleteCompensation,
  UpdateState
} from "@/api/paymentASP";
import { GetItemDetailById } from "@/api/itemInfoASP";
import Cookies from "js-cookie";
import { mapMutations, mapActions } from "vuex";
import { mapState } from "vuex";

export default {
  name: "detailRefund",
  data() {
    return {
      cid: Cookies.get("cid"),
      identity: Cookies.get("identity"),
      baseData: {}, //存放赔偿的详细数据
      //商品表格
      item: [],
      dialogFormVisible: false, //是否打开弹框
      //商品信息
      itemMsg: {}
    };
  },
  methods: {
    //页面初始化
    async init() {
      let method = this.baseData.method;
      if (method !== "new") {
        let obj = { id: this.baseData.ID };
        //let _data = await getRefundById(obj);
        let _data = await GetCompensationByIdBefore(obj);
        _data = _data.data[0];
        _data.method = method;
        _data.rtcbItems.forEach(item => {
          if (item.UNIT === "°ü") item.UNIT = "包";
        });
        this.baseData = _data;
        this.item = _data.rtcbItems;
      } else {
        this.baseData.ERP_CREATORNAME = Cookies.get("realName");
        if (!this.baseData.CREATE_TS) {
          this.baseData.CREATE_TS = new Date().getTime();
          sessionStorage.setItem("refund", JSON.stringify(this.baseData));
        }
      }
    },
    //添加退货商品
    addItem() {
      this.$prompt("请输入完整型号：", "货品信息", {
        confirmButtonText: "确定",
        cancelButtonText: "取消"
      })
        .then(async ({ value }) => {
          //getProductData({ itemNo: value })
          GetItemDetailById({ itemNo: value })
            .then(res => {
              if (res.data.length > 0) {
                var data = res.data[0];
                this.clearItemMsg();
                this.itemMsg.ITEM_NO = data.ITEM_NO;
                this.itemMsg.PRODUCTION_VERSION = data.PRODUCTVERSION_NAME;
                this.itemMsg.UNIT = data.UNIT_NAME;
                this.dialogFormVisible = true;
              } else {
                this.$alert(`${value}--未查询到货品信息`, "提示", {
                  type: "warning",
                  confirmButtonText: "好的"
                }).catch(() => { });
              }
            })
            .catch(err => {
              this.$alert(`${value}--未查询到货品信息`, "提示", {
                type: "warning",
                confirmButtonText: "好的"
              }).catch(() => { });
            });
        })
        .catch(() => { });
    },
    //保存货品信息表
    saveDialog() {
      let key = Object.values(this.itemMsg);
      let property = [
        "型号",
        "产品",
        "单位",
        "数量",
        "金额",
        "质量问题",
        "处理意见"
      ];
      let tip = "";
      for (let i = 0; i < key.length; i++) {
        if (key[i] === "" && i != 1) {
          tip !== "" ? (tip += `、${property[i]}`) : (tip += `${property[i]}`);
        }
      }
      if (tip !== "") {
        this.$alert(`请确保该表单的 ${tip} 已经输入！`, "提示", {
          type: "warning",
          confirmButtonText: "好的"
        }).catch(() => { });
        return;
      }
      //插入
      this.item.push(this.itemMsg);
      this.dialogFormVisible = false;
      this.clearItemMsg();
    },
    //关闭货品信息表
    closeDialog() {
      this.dialogFormVisible = false;
      this.clearItemMsg();
    },
    //删除表格单项商品
    deleteItem(index) {
      this.item.splice(index, 1);
    },
    //清空货品信息表
    clearItemMsg() {
      this.itemMsg = {
        ITEM_NO: "",
        PRODUCTION_VERSION: "",
        UNIT: "",
        QTY: "",
        TOTALMONEY: "",
        NOTES: "",
        PROCESS: ""
      };
    },
    //返回退货赔偿页面
    returnBack() {
      this.closeToTab({
        oldUrl: "detail/detailRefund",
        newUrl: "refundCompensation"
      });
    },
    //提交或者删除确认书
    updateOrDelete(status) {
      //判断商品个数,0--删除，!0--提交
      if (this.item.length === 0) {
        let obj = {
          id: this.baseData.ID
        };
        //deleteRefund(obj)
        DeleteCompensation(obj)
          .then(res => {
            this.$alert("删除成功", "提示", {
              type: "warning",
              confirmButtonText: "好的"
            })
              .then(() => {
                this.returnBack();
                this.$root.$emit("updateRefund");
              })
              .catch(() => {
                this.returnBack();
                this.$root.$emit("updateRefund");
              });
          })
          .catch(err => {
            this.$alert("删除失败", "提示", {
              type: "warning",
              confirmButtonText: "好的"
            }).catch(() => { });
          });
      } else {
        let _rcbItems = this.item;
        _rcbItems.forEach((item, index) => {
          item.ITEM_INDEX = index + 1;
        });
        let obj = this.baseData;
        obj.SENDBACK_REASON = null;
        obj.ITEM_COUNT = _rcbItems.length;
        obj.ITEM_MAX_INDEX = _rcbItems.length;
        //obj.rtcbItems = _rcbItems;
        //new--新建
        if (this.baseData.method === "new") {
          //addRefund(obj)
          InsertCompensationOld({ head: obj, details: _rcbItems })
            .then(res => {
              if (status === 1) {
                //直接提交
                //updateRefund(obj)
                UpdateState({
                  id: res.data.ID,
                  state: "CUSTOMERAFFIRM"
                })
                  .then(res => {
                    this.$alert("提交成功", "提示", {
                      type: "success",
                      confirmButtonText: "好的"
                    })
                      .then(res => {
                        this.returnBack();
                        this.$root.$emit("updateRefund");
                      })
                      .catch(err => {
                        this.returnBack();
                        this.$root.$emit("updateRefund");
                      });
                  })
                  .catch(() => {
                    throw "提交失败";
                  });
              } else {
                this.$alert("添加成功", "提示", {
                  type: "success",
                  confirmButtonText: "好的"
                })
                  .then(res => {
                    this.returnBack();
                    this.$root.$emit("updateRefund");
                  })
                  .catch(err => {
                    this.returnBack();
                    this.$root.$emit("updateRefund");
                  });
              }
            })
            .catch(err => {
              this.$alert("添加失败", "提示", {
                type: "warning",
                confirmButtonText: "好的"
              }).catch(() => { });
            });
        }
        //edit--修改
        else if (this.baseData.method === "edit") {
          //status：1--提交，0--保存
          let tipWord = "";
          if (status === 1) {
            (tipWord = "提交"), (obj.STATE = "CUSTOMERAFFIRM");
          } else {
            tipWord = "保存";
          }
          //updateRefund(obj)
          UpdateCompensation({ head: obj, details: _rcbItems })
            .then(res => {
              this.$alert(`${tipWord}成功`, "提示", {
                type: "success",
                confirmButtonText: "好的"
              })
                .then(res => {
                  this.returnBack();
                  this.$root.$emit("updateRefund");
                })
                .catch(err => {
                  this.returnBack();
                  this.$root.$emit("updateRefund");
                });
            })
            .catch(err => {
              this.$alert("删除失败", "提示", {
                type: "warning",
                confirmButtonText: "好的"
              }).catch(() => { });
            });
        }
      }
    },
    //用户选择是否用意
    userOperation(flag) {
      //1--同意 0--不同意
      let obj = {
        id: this.baseData.ID,
        state: flag ? "APPROVED" : "CANCELED"
      };
      //updataRefundStatus(obj)
      UpdateState(obj)
        .then(res => {
          this.$root.$emit("updateRefund");
          //成功后，调用查询接口，重新覆盖渲染
          //getRefundById({
          GetCompensationByIdBefore({
            id: this.baseData.ID
          })
            .then(async res => {
              this.baseData = res.data[0];
              this.baseData.method = "see";
              this.releaseBadge("refund");
              this.init();
            })
            .catch(err => {
              this.$alert("加载失败，返回原先页面", "提示", {
                type: "warning",
                confirmButtonText: "好的"
              })
                .then(() => {
                  this.returnBack();
                })
                .catch(() => {
                  this.returnBack();
                });
            });
        })
        .catch(err => {
          this.$alert("加载失败，返回原先页面", "提示", {
            type: "warning",
            confirmButtonText: "好的"
          })
            .then(() => {
              this.returnBack();
            })
            .catch(() => {
              this.returnBack();
            });
        });
    },
    //执行打印操作
    printRefund() {
      printJS({
        printable: "printTable",
        type: "html",
        maxWidth: 1300,
        headerStyle: "margin: -2px;",
        targetStyles: ["*"]
      });
    },
    //给小于10的数字加前缀
    addZeroIfNeed(num) {
      if (num < 10) {
        return "0" + num;
      }
      return num;
    },
    //通过状态返回中文名称
    getNameByState(state) {
      switch (state) {
        case "APPROVED":
          return "客户同意";
        case "ONCREATE":
          return "处理中";
        case "CANCELED":
          return "客户不同意";
        case "CUSTOMERAFFIRM":
          return "客户确认中";
        default:
          return "";
      }
    },
    ...mapMutations("navTabs", ["addTab"]),
    ...mapMutations("badge", ["addBadge", "releaseBadge"]),
    ...mapActions("navTabs", ["closeTab", "closeToTab"])
  },
  computed: {
    //判断此时确认书可以提交还是删除-->处理中
    judgeOpa: function () {
      return this.item.length === 0 ? "删除" : "提交";
    },
    //返回特定格式的时间戳
    toLocaleTime: function () {
      return toLocale(this.baseData.CREATE_TS);
    },
    //返回总金额
    totalMoney: function () {
      let total = 0;
      this.item.forEach(_item => {
        total += Number(_item.TOTALMONEY);
      });
      return total.toFixed(2);
    },
    //返回大写形式的总金额
    totalMoneyUpper: function () {
      return digitUppercase(this.totalMoney);
    }
  },
  created() {
    this.baseData = JSON.parse(sessionStorage.getItem("refund"));
    this.init();
  }
};
</script>

<style>
#detailRefund .el-card {
  color: #000;
}
#refundTable td {
  border-right: 1px solid #000;
  border-bottom: 0 !important;
}
#refundTable th {
  border-right: 1px solid #000;
  border-bottom: 1px solid #000 !important;
}
#refundTable tr > td:last-child,
#refundTable tr > th:nth-last-child(2) {
  border-right: none;
}
#detailRefund .el-table,
#detailRefund .el-table thead {
  color: #000;
}
#detailRefund .el-table::before {
  height: 0;
}
</style>

<style scoped>
@page {
  size: landscape;
}
p {
  margin: 5px 0;
}
.success-icon {
  color: #279e25;
}
.error-icon {
  color: crimson;
}
.uli {
  text-decoration: underline;
}
.t-indent {
  text-indent: 2.5em;
}
.border-t {
  border-top: 1px solid #000;
}
.border-b {
  border-bottom: 1px solid #000;
}
.border-r {
  border-right: 1px solid #000;
}
.p20 {
  padding: 10px 0;
}
.p-click {
  position: relative;
  bottom: 3px;
  cursor: pointer;
}
.icon-print {
  position: absolute;
  right: 5px;
  top: 0px;
  font-size: 25px;
  color: gray;
  cursor: pointer;
}
.t-dec {
  padding: 5px;
  border-bottom: 1px solid #000;
  line-height: 20px;
}
.t-com {
  width: 50%;
  padding: 20px 0;
  margin: -1px;
}
.t-foot > span {
  display: inline-block;
  padding: 10px 0 10px 30px;
}
#moneyTable {
  border-spacing: 0 !important;
}
#moneyTable td {
  font-size: 14px;
  padding: 10px;
  border-right: 1px solid #000;
  border-bottom: 1px solid #000;
}
#moneyTable > tr:nth-child(1) > td:last-child {
  border-right: none;
}
</style>