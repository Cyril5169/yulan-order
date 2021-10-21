<template>
  <div class="centerCard">
    <el-card shadow="hover">
      <div style="margin-bottom:10px;">
        <el-date-picker type="date" format="yyyy-MM-dd" value-format="yyyy-MM-dd" placeholder="日期区间" v-model="beginTime"
          style="width:14%;"></el-date-picker>--
        <el-date-picker type="date" format="yyyy-MM-dd" value-format="yyyy-MM-dd" placeholder="日期区间" v-model="finishTime"
          style="width:14%;"></el-date-picker>
        <el-select v-model="status" placeholder="全部状态">
          <el-option v-for="item in options" :key="item.label" :label="item.label" :value="item.value"></el-option>
        </el-select>
        <el-button size="medium" type="success" @click="searchBankList()">查询</el-button>
        <el-button style="float:right;margin-right:20px;" size="medium" @click="newOne" type="primary">新建</el-button>
      </div>
      <el-table border :data="bankData" style="width: 100%" :row-class-name="tableRowClassName">
        <el-table-column width="130" prop="id" label="凭证单号" align="center"></el-table-column>
        <el-table-column label="凭证时间" align="center">
          <template slot-scope="scope">
            <span>{{ scope.row.createTs | datatrans }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="yulanBank" width="160" label="收款银行" align="center"></el-table-column>
        <el-table-column prop="payerName" label="付款(公司/人)" align="center"></el-table-column>
        <el-table-column prop="payerAccount" width="180" label="付款账号" align="center"></el-table-column>
        <el-table-column prop="payAmount" label="汇款金额" width="100" align="center"></el-table-column>
        <el-table-column label="汇款时间" align="center">
          <template slot-scope="scope">
            <span>{{ scope.row.payDate | datatrans }}</span>
          </template>
        </el-table-column>
        <el-table-column width="80" label="状态" align="center">
          <template slot-scope="scope">
            <span>{{ scope.row.state | transStatus }}</span>
          </template>
        </el-table-column>
        <el-table-column align="center" width="200" label="操作">
          <template slot-scope="scope">
            <el-button @click="checkDetail(scope.row)" type="warning" icon="el-icon-search" size="mini" circle></el-button>
            <el-button v-if="scope.row.state == 'SENDBACK'" @click="editIt(scope.row)" type="primary" icon="el-icon-edit"
              size="mini" circle></el-button>
            <el-button v-if="scope.row.state == 'SENDBACK'" @click="deleteDetail(scope.row)" type="danger" icon="el-icon-delete"
              size="mini" circle></el-button>
          </template>
        </el-table-column>
      </el-table>
      <div style="margin:0 30%;" class="block">
        <el-pagination @current-change="handleCurrentChange" :current-page.sync="currentPage" :page-size="limit"
          layout="total, prev, pager, next, jumper" :total="count"></el-pagination>
      </div>
    </el-card>

    <el-dialog title="银行汇款凭证单" :visible.sync="bankDetail" :close-on-click-modal="false" width="75%">
      <!-- 查看区 -->
      <div v-show="EDITorCHECK" class="table-c">
        <h2 style="text-align:center;margin:0;">
          银行汇款凭证单-[{{ tableData.state | transStatus }}]
        </h2>
        <h3>
          建立时间：{{
            tableData.createTs | datatrans
          }}&nbsp;&nbsp;&nbsp;&nbsp;提交时间：{{
            tableData.submitTs | datatrans
          }}
        </h3>
        <h3 v-show="isBack">
          退回时间：{{
            tableData.sendbackTs | datatrans
          }}&nbsp;&nbsp;&nbsp;&nbsp;退回原因：{{ tableData.sendbackReason }}
        </h3>
        <h3 v-show="isDelete">
          作废时间：{{ tableData.cancelTs | datatrans }}
        </h3>
        <h3 v-show="isChuli">
          处理人：{{
            tableData.erpProcessOp
          }}&nbsp;&nbsp;&nbsp;&nbsp;处理时间：{{
            tableData.erpProcessTs | datatrans
          }}
        </h3>

        <table width="100%" border="0" cellspacing="0" cellpadding="0">
          <tr>
            <td class="grayTD">流水号</td>
            <td>{{ tableData.id }}</td>
            <td class="grayTD">客户代码</td>
            <td>{{ tableData.cid }}</td>
            <td class="grayTD">客户名称</td>
            <td>{{ tableData.cname }}</td>
          </tr>
          <tr>
            <td class="tableCol" style="font-size:20px;" colspan="6">
              付款信息
            </td>
          </tr>
          <tr>
            <td class="grayTD" colspan="1">汇入银行</td>
            <td colspan="2">{{ tableData.yulanBank }}</td>
            <td class="grayTD" colspan="1" rowspan="6">付款凭证</td>
            <td colspan="2" rowspan="6">
              <el-tooltip class="item" effect="dark" content="点击放大图片" placement="top">
                <img @click="BIG" class="ISimg" :src="tableData.imgUrl" />
              </el-tooltip>
            </td>
          </tr>
          <tr>
            <td class="grayTD" colspan="1">付款公司（人）</td>
            <td colspan="2">{{ tableData.payerName }}</td>
          </tr>
          <tr>
            <td class="grayTD" colspan="1">付款银行账号</td>
            <td colspan="2">{{ tableData.payerAccount }}</td>
          </tr>
          <tr>
            <td class="grayTD" colspan="1">付款金额</td>
            <td colspan="2">{{ tableData.payAmount }}</td>
          </tr>
          <tr>
            <td class="grayTD" colspan="1">付款日期</td>
            <td colspan="2">{{ tableData.payDate | datatrans }}</td>
          </tr>
          <tr style="height:130px;">
            <td class="grayTD" colspan="1">备注</td>
            <td colspan="2">{{ tableData.memo }}</td>
          </tr>
        </table>
      </div>
      <!-- 编辑区 -->
      <div v-show="!EDITorCHECK" class="table-c">
        <table width="100%" border="0" cellspacing="0" cellpadding="0">
          <tr class="tableCol" style="height:55px;">
            <td style="font-size:20px;" colspan="6">银行汇款凭证单</td>
          </tr>
          <tr>
            <td class="grayTD">流水号</td>
            <td v-if="newORedit">{{ sumbit.id }}</td>
            <td v-else>(提交后自动生成)</td>
            <td class="grayTD">客户代码</td>
            <td>{{ sumbit.cid }}</td>
            <td class="grayTD">客户名称</td>
            <td>{{ sumbit.cname }}</td>
          </tr>
          <tr>
            <td class="tableCol" style="font-size:20px;" colspan="6">
              汇款信息
            </td>
          </tr>
          <tr>
            <td class="grayTD" colspan="1">汇入银行</td>
            <td colspan="2">
              <el-select v-model="sumbit.yulanBank" placeholder="选择汇入玉兰账号所属银行">
                <el-option v-for="item in bankArray" :key="item.label" :label="item.label" :value="item.value"></el-option>
              </el-select>
            </td>
            <td class="grayTD" colspan="1" :rowspan="ROWSPAN">付款凭证</td>
            <td colspan="2" :rowspan="ROWSPAN">
              <el-upload class="avatar-uploader" accept="image/png, image/jpg, image/jpeg"
                action="http://14.29.223.114:10250/yulan-capital/upload/uploadPaymentBillImg.do" :show-file-list="false"
                :on-success="handleAvatarSuccess" :before-upload="beforeAvatarUpload">
                <img v-if="sumbit.imgUrl" :src="sumbit.imgUrl" class="avatar" />
                <i v-else class="el-icon-plus avatar-uploader-icon"></i>
              </el-upload>
            </td>
          </tr>
          <tr>
            <td class="grayTD" colspan="1">付款公司（人）</td>
            <td colspan="2">
              <el-input @focus="showHistory()" class="inputWidth" v-model="sumbit.payerName" placeholder="请输入付款公司（人）"></el-input>
            </td>
          </tr>
          <tr v-show="showtheHistory">
            <td colspan="3">
              <span v-for="item of historyList" :key="item.index">
                <el-button @click="writeHistory(item.PAYER_NAME, item.PAYER_ACCOUNT)" type="text">付款公司（人）：{{
                    item.PAYER_NAME
                  }}&nbsp;&nbsp;&nbsp;&nbsp;付款银行账号：{{
                    item.PAYER_ACCOUNT
                  }}</el-button>
                <br />
              </span>
            </td>
          </tr>
          <tr>
            <td class="grayTD" colspan="1">付款银行账号</td>
            <td colspan="2">
              <el-input class="inputWidth" v-model="sumbit.payerAccount" oninput="value=value.replace(/[^\d]/g,'')"
                placeholder="请输入付款银行账号"></el-input>
            </td>
          </tr>
          <tr>
            <td class="grayTD" colspan="1">付款金额</td>
            <td colspan="2">
              <currency-input :customStyle="'width: 220px; height:40px;'" placeholder="请输入付款金额" v-model="sumbit.payAmount">
              </currency-input>
            </td>
          </tr>
          <tr>
            <td class="grayTD" colspan="1">付款日期</td>
            <td colspan="2">
              <el-date-picker v-model="sumbit.payDate" type="date" placeholder="请选择日期" value-format="timestamp"></el-date-picker>
            </td>
          </tr>
          <tr style="height:130px;">
            <td class="grayTD" colspan="1">备注</td>
            <td colspan="2">
              <el-input style="width:220px;margin:4px auto;" type="textarea" maxlength="200"
                :autosize="{ minRows: 8, maxRow: 12 }" resize="none" v-model="sumbit.memo" placeholder="请输入备注"></el-input>
            </td>
          </tr>
        </table>

        <div style="margin:0 auto; width:75px;">
          <br />
          <el-button v-if="newORedit" type="success" @click="submitEDIT">确 定</el-button>
          <el-button v-else type="success" @click="sumbitNEW">提 交</el-button>
        </div>
      </div>
    </el-dialog>

    <el-dialog width="650px" title="查看图片" :visible.sync="BigPic">
      <div>
        <img class="BIGimg" :src="tableData.imgUrl" />
      </div>
    </el-dialog>
  </div>
</template>

<script>
import {
  getBankList,
  getPayBillContent,
  changeStatus,
  sumbitForm,
  getHistory
} from "@/api/bank";
import { getCustomerInfo } from "@/api/orderListASP";
import Cookies from "js-cookie";
const Head = "http://14.29.223.114:10250/upload";
const Quest = "http://14.29.223.114:10250/yulan-capital";
//const Head = 'http://192.168.123.43:8080/upload';
//const Quest = 'http://192.168.123.43:8080/yulan-capital'
export default {
  name: "BankProof",
  data() {
    return {
      chargeData: [],
      ROWSPAN: 6,
      BigPic: false,
      showtheHistory: false,
      historyList: [
        {
          PAYER_NAME: "测试", //汇款人名
          PAYER_ACCOUNT: "45544521112565445" //汇款账号
        },
        {
          PAYER_NAME: "测试3",
          PAYER_ACCOUNT: "121212121"
        },
        {
          PAYER_NAME: "测试4",
          PAYER_ACCOUNT: "1212121"
        }
      ],
      sqlpath: "", //保存图片相对路径
      newORedit: false, //决定显示新建或者编辑
      EDITorCHECK: false, //决定显示编辑或者查看
      tableData: {
        id: "PZ19071100003", //流水号
        cid: "C01613", //公司id
        cname: "测试—客户A", //客户名
        createTs: 1562816972000, //创建时间
        yulanBank: "工商银行", //汇款银行
        payerName: "测试客户", //汇款人名
        payAmount: 100, //汇款金额
        payDate: 1562816972000, //汇款日期
        imgFileName: "PZ19071100003-C01613.jpeg", //图片名
        submitTs: 1562816911000, //提交时间
        memo: "test", //备注
        cancelTs: null, //作废日期
        sendbackTs: null, //退回日期
        sendbackReason: null, //退回理由
        erpProcessTs: null, //处理日期
        erpProcessOp: null, //处理人状态(SUBMITED（已提交）,PROCESED（已处理）,SENDBACK（退回）,CANCELED（作废）)
        payerAccount: "45544521112565445", //汇款人银行账号
        imgUrl:
          "http://106.14.159.244:8080/upload/paymentBill-image/PZ19071100004-C01613.jpeg" //图片相对路径
      },
      sumbit: {
        cid: "", //公司号
        cname: "", //客户名
        yulanBank: "", //汇款银行
        payerName: "", //汇款人名
        payAmount: "", //汇款金额
        imgFileName: "", //文件名
        memo: "", //备注
        payerAccount: "", //账号
        payDate: "", //汇款时间,
        imgUrl: "" //相对路径
      },
      isDelete: false,
      isChuli: false,
      isBack: false,
      bankDetail: false,
      limit: 8,
      count: 0,
      currentPage: 1,
      beginTime: "",
      finishTime: "",
      status: "",
      options: [
        {
          label: "全部状态",
          value: ""
        },
        {
          label: "已提交",
          value: "SUBMITED"
        },
        {
          label: "已处理",
          value: "PROCESED"
        },
        {
          label: "退回",
          value: "SENDBACK"
        },
        {
          label: "作废",
          value: "CANCELED"
        }
      ],
      bankArray: [
        {
          label: "中国工商银行(8881)",
          value: "中国工商银行(8881)"
        },
        {
          label: "中国工商银行(9761)",
          value: "中国工商银行(9761)"
        },
        {
          label: "中信银行",
          value: "中信银行"
        }
      ],
      bankData: []
    };
  },
  created: function () {
    this.chargeQuery();
    this._getBankList();
    this._getHistory();
  },
  filters: {
    transStatus(value) {
      switch (value) {
        case "SUBMITED":
          return "已提交";
          break;
        case "PROCESED":
          return "已处理";
          break;
        case "SENDBACK":
          return "退回";
          break;
        case "CANCELED":
          return "作废";
          break;
      }
    },
    datatrans(value) {
      //时间戳转化大法
      if (value == null) {
        return "";
      }
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
  watch: {
    showtheHistory(val) {
      if (val) {
        this.ROWSPAN = 7;
      } else {
        this.ROWSPAN = 6;
      }
    }
  },
  methods: {
    chargeQuery() {
      var data = {
        cid: Cookies.get("cid"),
        companyId: Cookies.get("companyId")
      };
      getCustomerInfo(data).then(res => {
        this.chargeData = res.data;
      });
    },
    implentmentChange() {
      if (this.tableData.IMPLEMENTTATION_FORM != 1) this.tableData.MEASURE = 0;
    },
    //焦点显示历史记录
    showHistory() {
      this.showtheHistory = true;
    },
    //填充历史记录
    writeHistory(payerName, payerAccount) {
      this.sumbit.payerName = payerName;
      this.sumbit.payerAccount = payerAccount;
      this.showtheHistory = false;
    },
    //确定新建
    sumbitNEW() {
      let url = Quest + "/PaymentBill/insertPaymentBill.do";
      let data = this.sumbit;
      this.sumbit.cid = Cookies.get("companyId");
      //判断是否填完所有信息
      if (
        this.sumbit.yulanBank == "" ||
        this.sumbit.payerName == "" ||
        this.sumbit.payAmount == "" ||
        this.sumbit.payerAccount == "" ||
        this.sumbit.payDate == "" ||
        this.sumbit.payDate == null
      ) {
        this.$alert("请完善信息", "提示", {
          confirmButtonText: "确定",
          type: "warning"
        });
        return;
      }
      //判断是否上传图片
      if (this.sumbit.imgFileName == "") {
        this.$alert("请上传凭证", "提示", {
          confirmButtonText: "确定",
          type: "warning"
        });
        return;
      }
      this.sumbit.imgUrl = this.sqlpath; //转换为相对地址
      sumbitForm(url, data).then(res => {
        this.$alert("提交成功", "提示", {
          confirmButtonText: "确定",
          type: "success"
        });
        this.currentPage = 1;
        this._getBankList();
        this.bankDetail = false;
      });
    },
    //编辑修改
    submitEDIT() {
      let url = Quest + "/PaymentBill/updatePayBill.do"; //创建
      let data = this.sumbit;
      this.sumbit.cid = Cookies.get("companyId");
      //判断是否填完所有信息
      if (
        this.sumbit.yulanBank == "" ||
        this.sumbit.payerName == "" ||
        this.sumbit.payAmount == "" ||
        this.sumbit.payerAccount == "" ||
        this.sumbit.payDate == "" ||
        this.sumbit.payDate == null
      ) {
        this.$alert("请完善信息", "提示", {
          confirmButtonText: "确定",
          type: "warning"
        });
        return;
      }
      //判断是否上传图片
      if (this.sumbit.imgFileName == "") {
        this.$alert("请上传凭证", "提示", {
          confirmButtonText: "确定",
          type: "warning"
        });
        return;
      }
      this.sumbit.imgUrl = this.sqlpath;
      this.sumbit.submitTs = null;
      this.sumbit.cancelTs = null;
      this.sumbit.createTs = null;
      sumbitForm(url, data).then(res => {
        this.$alert("修改成功", "提示", {
          confirmButtonText: "确定",
          type: "success"
        });
        this.currentPage = 1;
        this._getBankList();
        this.bankDetail = false;
      });
    },
    //新建
    newOne() {
      this.EDITorCHECK = false;
      this.bankDetail = true;
      this.newORedit = false;
      this.sumbit = {
        cid: Cookies.get("companyId"), //公司号
        cname: this.chargeData.CUSTOMER_NAME, //客户名
        yulanBank: "", //汇款银行
        payerName: "", //汇款人名
        payAmount: "", //汇款金额
        imgFileName: "", //文件名
        memo: "", //备注
        payerAccount: "", //账号
        payDate: "", //汇款时间,
        imgUrl: "" //相对路径
      };
    },
    //编辑列表详情
    editIt(tab) {
      let url = Quest + "/PaymentBill/getPayBillContent.do";
      let data = {
        id: tab.id
      };
      getPayBillContent(url, data).then(res => {
        this.sqlpath = res.data.imgUrl; //先保存一个
        res.data.imgUrl = Head + res.data.imgUrl;
        this.sumbit = res.data;
        this.EDITorCHECK = false;
        this.newORedit = true; //显示流水号 等编辑一类
        this.bankDetail = true;
      });
    },
    //查看列表详情
    checkDetail(tab) {
      //判断是否为作废
      if (tab.state == "CANCELED") {
        this.isDelete = true;
      } else {
        this.isDelete = false;
      }

      if (tab.state == "PROCESED") {
        this.isChuli = true;
      } else {
        this.isChuli = false;
      }

      if (tab.state == "SENDBACK") {
        this.isBack = true;
      } else {
        this.isBack = false;
      }
      let url = Quest + "/PaymentBill/getPayBillContent.do";
      let data = {
        id: tab.id
      };
      getPayBillContent(url, data).then(res => {
        res.data.imgUrl = Head + res.data.imgUrl;
        this.tableData = res.data;
        this.EDITorCHECK = true;
        this.bankDetail = true;
      });
    },
    //作废列表详情
    deleteDetail(tab) {
      let url = Quest + "/PaymentBill/updatePayBillState.do";
      let data = {
        id: tab.id,
        state: "CANCELED"
      };
      this.$confirm("确定作废该汇款凭证?", "提示", {
        confirmButtonText: "是",
        cancelButtonText: "否",
        type: "warning"
      })
        .then(() => {
          changeStatus(url, data).then(res => {
            this._getBankList();
            this.$alert("删除成功", "提示", {
              confirmButtonText: "确定",
              type: "success"
            });
          });
        })
        .catch(() => {
          console.log("还没删");
        });
    },
    //搜索
    searchBankList() {
      this.currentPage = 1;
      this.bankData = [];
      this._getBankList();
    },
    //获取银行列表
    _getBankList() {
      let url = Quest + "/PaymentBill/getPayBills.do";
      if (this.beginTime == null) this.beginTime = "";
      if (this.finishTime == null) this.finishTime = "";
      let data = {
        cid: Cookies.get("companyId"), //公司id
        state: this.status, //状态状态(SUBMITED（已提交）,PROCESED（已处理）,SENDBACK（退回）,CANCELED（作废）)
        beginTime: this.beginTime, //起始时间
        finishTime: this.finishTime, //结束时间
        limit: this.limit, //限制数
        page: this.currentPage //页数
      };
      if (this.beginTime != "" || this.finishTime != "") {
        data.beginTime = this.beginTime + "00:00:00";
        data.finishTime = this.finishTime + "23:59:59";
      }
      getBankList(url, data).then(res => {
        this.count = res.count;
        this.bankData = res.data;
      });
    },
    //隔行变色
    tableRowClassName({ row, rowIndex }) {
      if (rowIndex % 2 == 0) {
        return "success-row";
      }
      return "";
    },
    //获取历史记录
    _getHistory() {
      let url = Quest + "/PaymentBill/getPayNameAndAccount.do";
      let data = {
        companyId: Cookies.get("companyId")
      };
      getHistory(url, data).then(res => {
        this.historyList = res.data;
      });
    },
    //放大图片
    BIG() {
      this.BigPic = true;
    },
    //翻页获取订单
    handleCurrentChange(val) {
      this.currentPage = val;
      this.bankData = [];
      this._getBankList();
    },
    handleAvatarSuccess(res, file) {
      this.sumbit.imgUrl = URL.createObjectURL(file.raw);
      this.sqlpath = res.sqlpath;
      this.sumbit.imgUrl = Head + res.sqlpath;
      this.sumbit.imgFileName = res.fileName;
    },
    beforeAvatarUpload(file) {
      const isLt2M = file.size / 1024 / 1024 < 2;

      if (!isLt2M) {
        this.$message.error("上传图片大小不能超过 2MB!");
      }
      return isLt2M;
    }
  }
};
</script>

<style scoped>
.centerCard h3 {
  margin: 0;
}
.table-c table {
  border-right: 1px solid black;
  border-bottom: 1px solid black;
}
.table-c table td {
  border-left: 1px solid black;
  border-top: 1px solid black;
  height: 45px;
  text-align: center;
  font-size: 16px;
}
.tableCol {
  background: #f0f9eb;
}
.grayTD {
  background: rgb(241, 242, 243);
}
.ISimg {
  width: 300px;
  height: 300px;
  cursor: pointer;
}
.BIGimg {
  width: 600px;
  height: 600px;
}
.inputWidth {
  width: 220px;
}
</style>

<style>
.el-table .success-row {
  background: #f0f9eb;
}

.avatar-uploader .el-upload {
  border: 1px dashed black;
  border-radius: 6px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
}
.avatar-uploader .el-upload:hover {
  border-color: #409eff;
}
.avatar-uploader-icon {
  font-size: 28px;
  color: #8c939d;
  width: 300px;
  height: 300px;
  line-height: 300px;
  text-align: center;
}
.avatar {
  width: 300px;
  height: 300px;
  display: block;
}
</style>