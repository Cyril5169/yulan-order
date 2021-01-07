<template>
  <div>
    <el-card shadow="hover">
      <div>
        <el-table :data="tableData" border :row-class-name="tableRowClassName" style="width: 100%; margin-top:10px">
          <el-table-column label="广东玉兰集团股份有限公司对账单" align="center">
            <template slot="header">
              <span style="font-size:20px;">广东玉兰集团股份有限公司对账单</span>
            </template>
            <el-table-column prop="dateStart" label="起始日期" align="center"></el-table-column>
            <el-table-column prop="dateEnd" label="结束日期" align="center"></el-table-column>
            <el-table-column prop="fhjeMonth" label="本期发货总额" align="center"></el-table-column>
            <el-table-column prop="czskMonth" label="本期收款总额" align="center"></el-table-column>
            <el-table-column prop="qcczysk" label="上期应收款" align="center"></el-table-column>
            <el-table-column prop="czysk" label="应收款(合计)" align="center"></el-table-column>
            <el-table-column prop="customerCheckState" label="客户确认状态" align="center"></el-table-column>
            <el-table-column label="操作" align="center">
              <template slot-scope="scope1">
                <el-button @click="
                    openDia(
                      scope1.row.dateStart,
                      scope1.row.dateEnd,
                      scope1.row
                    )
                  " type="text" size="mini">查看明细</el-button>
              </template>
            </el-table-column>
          </el-table-column>
        </el-table>
        <div style="margin:0 35%;" class="block">
          <el-pagination @current-change="outerCurrentChange" :current-page.sync="outerCurrentPage"
            :page-size="outerlimit" layout="total, prev, pager, next, jumper" :total="outercount"></el-pagination>
        </div>
      </div>

      <el-dialog :visible.sync="detailVisible" :close-on-click-modal="false" width="760px" top="5vh">
        <div class="fixedDiv">
          <div style="margin:10px">
            <el-button v-show="showButton" size="mini" type="primary" @click="changeStatus(0)">客户确认</el-button>
            <el-button size="mini" type="primary" @click="printRefund('PrintDiv1')">打印</el-button>
          </div>
          <div style="margin:10px">
            <el-button v-show="showButton" size="mini" type="danger" @click="dialogFormVisible = true">客户反馈</el-button>
            <el-button size="mini" type="primary" @click="OutExcel()">导出</el-button>
          </div>
        </div>
        <div id="PrintDiv1" class="dialogDetailStyle" style="width:100% ;margin:0 auto;">
          <div style="margin:0 auto; height:40px; width:100%;text-align:center;">
            <h2 style="margin:0;">广东玉兰集团股份有限公司对账单</h2>
          </div>
          <div style="margin:0 auto; width:100%;">
            <div style="margin-top:5px;margin-left:20px; auto; width:300px; float:left;">
              <h4 style="display:inline;margin:0;">
                统计日期：{{ startDate | cutdate }}~{{ endDate | cutdate }}
              </h4>
            </div>
          </div>
          <table class="table1Style" border="2" width="100%" cellpadding="2">
            <tr>
              <th class="grayTD">客户名称</th>
              <th colspan="3">{{ theHead.customerName }}</th>
              <th class="grayTD">联系人</th>
              <th colspan="3">{{ theHead.customerAgent }}</th>
            </tr>
            <tr>
              <th class="grayTD">备货单据号</th>
              <th colspan="3">{{ theBody.ctmBhBill }}</th>
              <th class="grayTD">电话</th>
              <th colspan="3">{{ theHead.officeTel }}</th>
            </tr>
            <tr>
              <td colspan="3" align="center" class="grayTD">版本销售前5名</td>
              <td colspan="5" align="center">{{ theBody.verTop }}</td>
            </tr>
            <tr>
              <td colspan="3" align="center" class="grayTD">
                本客户版本销售前5名
              </td>
              <td colspan="5" align="center">{{ theBody.ctmVerTop }}</td>
            </tr>
            <!-- <tr>
              <td colspan="1" align="center" class="grayTD"></td>
              <td colspan="5" align="center"></td>
            </tr> -->
            <tr>
              <td colspan="1"></td>
              <td align="center" class="grayTD">本期</td>
              <td align="center" class="grayTD" colspan="2">本年</td>
              <td></td>
              <td align="center" class="grayTD">本期</td>
              <td align="center" class="grayTD" colspan="2">本年</td>
            </tr>
            <tr>
              <td class="grayTD" align="center">实际发货总金额</td>
              <td align="center">{{ theBody.fhjeMonth }}</td>
              <td align="center" colspan="2">{{ theBody.consignmentMoney }}</td>
              <td class="grayTD" align="center">实际收款金额</td>
              <td align="center">{{ theBody.czskMonth }}</td>
              <td align="center" colspan="2">{{ theBody.gatherMoneyFax }}</td>
            </tr>
            <tr>
              <td class="grayTD" align="center">返利发货总金额</td>
              <td align="center">{{ theBody.moneyFl }}</td>
              <td align="center" colspan="2">{{ theBody.moneyFlTotal }}</td>
              <td class="grayTD" align="center">本期剩余返利</td>
              <td align="center">{{ theBody.moneyFl }}</td>
              <td colspan="2"></td>
            </tr>
            <tr>
              <td class="grayTD" align="center">备货总金额</td>
              <td align="center">{{ theBody.moneyBh }}</td>
              <td align="center" colspan="2">{{ theBody.moneyBhTotal }}</td>
              <td class="grayTD" align="center">运费总金额</td>
              <td align="center">{{ theBody.freightMonth }}</td>
              <td align="center" colspan="2">{{ theBody.freight }}</td>
            </tr>
            <tr>
              <td class="grayTD" align="center">期初应收款</td>
              <td colspan="3" align="center">{{ theBody.qcczysk }}</td>
              <td class="grayTD" align="center">期末应收款</td>
              <td colspan="3" align="center">{{ theBody.czysk }}</td>
            </tr>
          </table>

          <el-table :data="tableDetail" :summary-method="getSummaries" show-summary border
            :row-class-name="tableRowClassName" style="width: 100%; margin:10px auto">
            <el-table-column width="100" label="日期" align="center">
              <template slot-scope="scope1">
                <span>{{ scope1.row.dateOutStock | datatrans }}</span>
              </template>
            </el-table-column>
            <el-table-column label="单据号" width="120" align="center">
              <template slot-scope="scope1">
                <!-- <span>{{scope1.row.saleNo}}</span> -->
                <el-button @click="openTHdia(scope1.row)" type="text" size="small">{{ scope1.row.saleNo }}</el-button>
              </template>
            </el-table-column>
            <el-table-column label="类别" width="55" align="center">
              <template slot-scope="scope1">
                <span>{{ scope1.row.billNo | stateChange }}</span>
              </template>
            </el-table-column>
            <el-table-column prop="money" label="发货总额" width="90" align="center"></el-table-column>
            <el-table-column prop="qty" label="发货数量" width="90" align="center"></el-table-column>
            <el-table-column prop="freight" label="运费" width="70" align="center"></el-table-column>
            <el-table-column prop="gatherMoneyFax" label="收款金额" width="100" align="center"></el-table-column>
            <el-table-column label="加收物流费" align="center">
              <template slot-scope="scope1">
                <span>{{ scope1.row.transFlag | NYchange }}</span>
              </template>
            </el-table-column>
          </el-table>
        </div>
      </el-dialog>

      <el-dialog title="客户反馈" :visible.sync="dialogFormVisible" :close-on-click-modal="false">
        <el-input type="textarea" maxlength="200" :autosize="{ minRows: 4, maxRow: 6 }" resize="none"
          v-model="customerCheckComment" placeholder="请输入反馈内容(200字以内)"></el-input>
        <span style="color:#ccc">{{ customerCheckComment.length }}/200</span>
        <br />
        <div slot="footer" class="dialog-footer">
          <el-button @click="dialogFormVisible = false">取 消</el-button>
          <el-button type="primary" @click="changeStatus(1)">确 定</el-button>
        </div>
      </el-dialog>

      <el-dialog :visible.sync="THdetail" :width="THwidth" :top="THtop">
        <div style="margin:0 auto;width:20%;" v-show="whatType">
          <span style="font-weight:600;font-size:15px;">{{ THhead }}明细表</span>
        </div>
        <el-table v-show="whatType" :data="THtabledata" border :summary-method="getSummaries1"
          :row-class-name="tableRowClassName" show-summary style="width: 100%; margin-top:10px">
          <el-table-column prop="itemNo" width="110" header-align="center" align="center" label="版本型号">
          </el-table-column>
          <el-table-column width="100" align="center" label="名称" prop="itemNote">
            <!-- <template slot-scope="scope1">
              <el-button type="text">{{ scope1.row.itemNote }}</el-button>
            </template> -->
          </el-table-column>
          <el-table-column width="100" align="center" label="版本名称">
            <template slot-scope="scope">
              <span>{{ scope.row.itemVersion }}</span>
            </template>
          </el-table-column>
          <el-table-column align="center" label="批号">
            <template slot-scope="scope">
              <span>{{ scope.row.batchNo }}</span>
            </template>
          </el-table-column>
          <el-table-column width="60" label="单价" header-align="center">
            <template slot-scope="scope">
              <span>{{ scope.row.salePrice }}</span>
            </template>
          </el-table-column>
          <el-table-column width="80" label="物流单价" header-align="center">
            <template slot-scope="scope">
              <span>{{ scope.row.transPrice }}</span>
            </template>
          </el-table-column>
          <el-table-column width="60" label="数量" header-align="center">
            <template slot-scope="scope">
              <span>{{ scope.row.qtyDeliver }}</span>
            </template>
          </el-table-column>
          <el-table-column width="90" prop="money" label="金额" header-align="center"></el-table-column>
        </el-table>
        <div class="TH" v-show="!whatType">
          <p>日期：{{ CZSK.dateOutStock | datatrans }}</p>
          <p>单据号：{{ THhead }}</p>
          <p>收款金额：{{ CZSK.gatherMoneyFax }}</p>
          <p>备注：{{ CZSK.notes }}</p>
        </div>
      </el-dialog>
    </el-card>
  </div>
</template>

<script>
const BACKIT = "客户反馈";
const OKIT = "客户确认";
import {
  checkBill,
  billDetail,
  userReturn,
  statementDetail,
} from "@/api/orderList";
import { GetBalancePeriod } from "@/api/orderListASP";
import { mapMutations, mapActions } from "vuex";
import Cookies from "js-cookie";
export default {
  data() {
    return {
      idTmr: "",
      tableToExcel: null,
      CZSK: {},
      THtitle: "对账单明细",
      THwidth: "",
      THtop: "15vh",
      whatType: true,
      //外面的翻页
      outerCurrentPage: 1,
      outerlimit: 10,
      outercount: 100,
      tableData: [],
      theHead: {},
      theBody: {},
      tableDetail: [],
      startDate: "",
      endDate: "",
      detailVisible: false,
      //里面的翻页
      innerCurrentPage: 1,
      innerlimit: 10,
      innercount: 100,
      //用户反馈
      customerCheckState: "",
      customerCheckComment: "",
      showButton: true,
      dialogFormVisible: false,
      CTMmoney: "",
      //提货弹窗
      THdetail: false,
      THhead: "",
      THtabledata: [
        {
          STATUS_ID: 1,
        },
      ],
    };
  },
  methods: {
    //根据div id打印内容
    printRefund(id) {
      printJS({
        printable: id,
        type: "html",
        maxWidth: 1300,
        headerStyle: "margin: -2px;",
        targetStyles: ["*"],
      });
    },
    getExplorer() {
      var explorer = window.navigator.userAgent;
      //判断是否为IE浏览器
      if (explorer.indexOf("MSIE") >= 0) {
        return "ie";
      }
      //判断是否为Firefox浏览器
      else if (explorer.indexOf("Firefox") >= 0) {
        return "Firefox";
      }
      //判断是否为Chrome浏览器
      else if (explorer.indexOf("Chrome") >= 0) {
        return "Chrome";
      }
      //判断是否为Opera浏览器
      else if (explorer.indexOf("Opera") >= 0) {
        return "Opera";
      }
      //判断是否为Safari浏览器
      else if (explorer.indexOf("Safari") >= 0) {
        return "Safari";
      }
    },
    Cleanup() {
      window.clearInterval(idTmr);
      CollectGarbage();
    },
    tableExport(type) {
      var doc = "";
      doc += "<table>";
      var html = document.getElementById("PrintDiv1").innerHTML;
      doc += html;
      doc = doc.replace(/border="0"/g, 'border="1"');
      doc = doc.replace(
        /<th class=\"gutter\" style=\"width: 0px; display: none;\"><\/th>/g,
        ""
      );

      //var end = doc.substring(doc.length - 1000, doc.length);

      doc = doc.replace(
        '<h2 data-v-864abbe2="" style="margin: 0px;">广东玉兰集团股份有限公司对账单</h2>',
        '<div style="margin: 10px auto;  width:1000px; font-size:20px;"> <table> <tr><td data-v-864abbe2="" colspan="8" align="center" class="grayTD"><h2 data-v-864abbe2="" style="margin: 0px;">广东玉兰集团股份有限公司对账单</h2></td><td data-v-864abbe2="" colspan="5" align="center"></td> </tr></table></div>'
      );
      doc += "</table>";

      var docFile =
        "<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:x='urn:schemas-microsoft-com:office:" +
        doc +
        "' xmlns='http://www.w3.org/TR/REC-html40'>";
      docFile =
        docFile +
        "<head><!--[if gte mso 9]><xml><x:ExcelWorkbook><x:ExcelWorksheets><x:ExcelWorksheet><x:Name>{worksheet}</x:Name><x:WorksheetOptions><x:DisplayGridlines/></x:WorksheetOptions></x:ExcelWorksheet></x:ExcelWorksheets></x:ExcelWorkbook></xml><![endif]--></head>" +
        doc +
        "</body></html>";

      var base64data =
        "base64," + window.btoa(unescape(encodeURIComponent(docFile)));
      if (type == "doc") {
        window.open("data:application/msword;" + base64data);
      } else if (type == "excel") {
        window.open("data:application/vnd.ms-excel;" + base64data);
      }
    },
    // 导出Excel
    OutExcel() {
      if (this.getExplorer() == "ie") {
        this.$alert("请换火狐或谷歌浏览器下载！", "提示", {
          confirmButtonText: "确定",
          type: "danger",
        });
        // var curTbl = document.getElementById("PrintDiv1");
        // var oXL = new ActiveXObject("Excel.Application");
        // //创建AX对象excel
        //   var oWB = oXL.Workbooks.Add();
        //   //获取workbook对象
        //   var xlsheet = oWB.Worksheets(1);
        //   //激活当前sheet
        //   var sel = document.body.createTextRange();
        //     sel.moveToElementText(curTbl);
        //   //把表格中的内容移到TextRange中
        //   sel.select;
        //   //全选TextRange中内容
        //   sel.execCommand("Copy");
        //   //复制TextRange中内容
        //   xlsheet.Paste();
        //   //粘贴到活动的EXCEL中
        //   oXL.Visible = true;
        //   //设置excel可见属性
        //   try {
        //               var fname = oXL.Application.GetSaveAsFilename("Excel.xls", "Excel Spreadsheets (*.xls), *.xls");
        //           } catch (e) {
        //               print("Nested catch caught " + e);
        //           } finally {
        //               oWB.SaveAs(fname);
        //               oWB.Close(savechanges = false);
        //               //xls.visible = false;
        //               oXL.Quit();
        //               oXL = null;
        //               //结束excel进程，退出完成
        //               //window.setInterval("Cleanup();",1);
        //               idTmr = window.setInterval("Cleanup();", 1);
        //           }
      } else {
        this.tableExport("excel");
      }
    },
    //打开对账单提货弹窗
    openTHdia(tab) {
      if (tab.billNo == "CZSK" || tab.billNo == "收款") {
        this.whatType = false;
        this.THtitle = "收款备注";
        this.CZSK = tab;
        this.THwidth = "30%";
        this.THtop = "30vh";
      } else {
        this.whatType = true;
        this.THwidth = "50%";
        this.THtop = "15vh";
      }
      this.THdetail = true;
      this.THhead = tab.saleNo;
      let url = "/customerBalance/getCustomerBalancePackDetail.do";
      let data = {
        saleNO: this.THhead,
      };
      statementDetail(url, data).then((res) => {
        this.THtabledata = res.packDetailList;
      });
    },
    //打开弹窗渲染详情数据
    openDia(startDate, endDate, tab) {
      if (tab.customerCheckState != "待确认") {
        this.showButton = false;
      } else {
        this.showButton = true;
      }
      this.startDate = startDate + " 00:00:00";
      this.endDate = endDate + " 23:59:59";
      this.theBody = tab;
      this.getBillDetail();
    },
    //翻页获取里面的对账单详情
    InnerCurrentChange(val) {
      this.innerCurrentPage = val;
      this.tableDetail = [];
      this.getBillDetail();
    },
    //翻页获取外面的对账单
    outerCurrentChange(val) {
      this.outerCurrentPage = val;
      this.tableData = [];
      this.getBill();
    },
    //改变账单状态
    changeStatus(status) {
      let decoration = "";
      let startDate = this.startDate.slice(0, 10);
      if (status == 0) {
        decoration = "确认通过该对账明细表？";
        this.customerCheckState = OKIT;
      } else if (status == 1) {
        decoration = "确认发表反馈？";
        this.customerCheckState = BACKIT;
      }

      let url = "/customerBalance/customerCheck.do";
      let data = {
        cid: Cookies.get("cid"),
        startDate: startDate,
        customerCheckState: this.customerCheckState,
        customerCheckComment: this.customerCheckComment,
      };
      this.$confirm(decoration, "提示", {
        confirmButtonText: "是",
        cancelButtonText: "否",
        type: "warning",
      })
        .then(() => {
          userReturn(url, data).then((res) => {
            if (res.msg == "SUCCESS") {
              this.$alert("操作成功", "提示", {
                confirmButtonText: "确定",
                type: "success",
              });
              this.getBill();
              this.detailVisible = false;
              this.dialogFormVisible = false;
            } else {
              this.$alert("操作失败，请稍后重试", "提示", {
                confirmButtonText: "确定",
                type: "danger",
              });
            }
          });
        })
        .catch(() => {
          console.log("还没删");
        });
    },
    //获取对账单
    getBill() {
      let url = "/customerBalance/getCustomerBalanceInfo.do";
      let data = {
        cid: Cookies.get("cid"),
        limit: this.outerlimit,
        page: this.outerCurrentPage,
        status: "",
      };
      //checkBill(url, data).then(res => {
      GetBalancePeriod(data).then((res) => {
        console.log(res);
        this.tableData = res.data.customerBalancePeriodList;
        this.theHead = res.data.customerInfo;
        this.outercount = res.count;
        this.$root.$emit("refreshBadgeIcon", "statement");
      });
    },
    //获取对账详情
    getBillDetail() {
      let url = "/customerBalance/getCustomerBalancePeriodDetailInfo.do";
      let data = {
        cid: Cookies.get("cid"),
        startDate: this.startDate, //开始日期
        endDate: this.endDate, //结束日期
        limit: 999, //10,
        page: 1, //this.innerCurrentPage
      };
      billDetail(url, data).then((res) => {
        this.tableDetail = res.customerBalancePeriodDetailList;
        this.innercount = res.customerBalancePeriodDetailList.length
          ? res.customerBalancePeriodDetailList[0].total
          : 0;
        this.detailVisible = true;
      });
    }, //计算表格末行
    getSummaries(param) {
      const { columns, data } = param;
      const sums = [];
      columns.forEach((column, index) => {
        if (index === 0) {
          sums[index] = "汇总";
          return;
        }
        const values = data.map((item) => Number(item[column.property]));
        if (!values.every((value) => isNaN(value))) {
          sums[index] = values.reduce((prev, curr) => {
            const value = Number(curr);
            if (!isNaN(value)) {
              return prev + curr;
            } else {
              return prev;
            }
          }, 0);
          if (index < 10) {
            if (index == 4) {
              sums[index] = sums[index].toFixed(2);
            } else {
              sums[index] = sums[index].toFixed(2);
            }
          }
        } else {
          sums[index] = "";
        }
      });
      return sums;
    },
    getSummaries1(param) {
      const { columns, data } = param;
      const sums = [];
      columns.forEach((column, index) => {
        if (index === 0) {
          sums[index] = "汇总";
          return;
        }
        const values = data.map((item) => Number(item[column.property]));
        if (!values.every((value) => isNaN(value))) {
          sums[index] = values.reduce((prev, curr) => {
            const value = Number(curr);
            if (!isNaN(value)) {
              return prev + curr;
            } else {
              return prev;
            }
          }, 0);
          if (index == 7) {
            sums[index] = sums[index].toFixed(2);
          } else {
            sums[index] = "";
          }
        } else {
          sums[index] = "";
        }
      });
      return sums;
    },
    //隔行变色
    tableRowClassName({ row, rowIndex }) {
      if (rowIndex % 2 == 0) {
        return "success-row";
      }
      return "";
    },
    ...mapMutations("navTabs", ["addTab"]),
    ...mapActions("navTabs", ["closeTab", "closeToTab"]),
  },
  created: function () {
    this.getBill();
  },
  filters: {
    cutdate(value) {
      return value.slice(0, 10);
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
    NYchange(value) {
      if (value == "Y") return "是";
      if (value == "N") return "否";
      if (value == null) return "";
    },
    stateChange(value) {
      if (value == "CZSK") return "收款";
      if (value == "TD") return "提单";
      if (value == "TH") return "退货";
      if (value == "CJ") return "冲减";
      return value;
    },
  },
};
</script>

<style scoped>
.table1Style {
  border-collapse: collapse;
}
.fixedDiv {
  position: fixed;
  border: 1px;
  border-color: #000;
  z-index: 1;
  top: 60px;
  margin-left: 530px;
  z-index: 9999;
}
.noprint {
  display: none;
  color: green;
}
.headSpan {
  font-weight: bold;
  font-size: 18px;
  color: black;
}
.TH {
  font-size: 20px;
  line-height: 30px;
}
.grayTD {
  background: rgb(241, 242, 243);
  width: 90;
}
</style>

<style>
.dialogDetailStyle .el-table td,
.dialogDetailStyle .el-table th {
  padding: 0px 0 !important;
}
.el-table .success-row {
  background: #f0f9eb;
}
.dialogDetailStyle .el-button--medium {
  padding: 1px 20px;
  font-size: 14px;
  border-radius: 4px;
}
</style>