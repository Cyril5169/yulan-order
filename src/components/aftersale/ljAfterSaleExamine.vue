<template>
  <div>
    <el-card shadow="hover" class="centerCard">
      <div class="tbarStyle">
        <span>建立日期:</span>
        <el-date-picker value-format="yyyy-MM-dd" style="width:150px;" v-model="beginTime" type="date" placeholder="日期区间">
        </el-date-picker>
        <span>至</span>
        <el-date-picker value-format="yyyy-MM-dd" style="width:150px;" v-model="finishTime" type="date" placeholder="日期区间">
        </el-date-picker>
        <span style="margin-left:10px">状态:</span>
        <el-select style="width:120px;" v-model="selectStatus" placeholder="请选择" @change="clickSearch">
          <el-option v-for="item in statusArray" :key="item.value" :label="item.label" :value="item.value">
          </el-option>
        </el-select>
        <el-input v-model="condition" style="width: 200px;" placeholder="编号/客户名称/客户代码" @keyup.enter.native="clickSearch">
        </el-input>
        <el-button type="success" @click.native="clickSearch" style="margin-left:10px;">查 询</el-button>
      </div>
      <el-table border :row-class-name="tableRowClassName" :data="tableData" style="width: 100%">
        <el-table-column label="编号" prop="ID" align="center" width="150">
        </el-table-column>
        <el-table-column label="创建时间" align="center" width="150">
          <template slot-scope="scope">
            {{ scope.row.CREATE_TS | datatrans }}
          </template>
        </el-table-column>
        <el-table-column label="客户代码" prop="CID" align="center" width="100">
        </el-table-column>
        <el-table-column label="客户名称" prop="CNAME" align="center">
        </el-table-column>
        <el-table-column label="联系人" prop="CONTACT_PERSON" align="center" width="100">
        </el-table-column>
        <el-table-column label="联系电话" prop="CONTACT_TEL" align="center" width="120">
        </el-table-column>
        <el-table-column label="状态" align="center" width="120">
          <template slot-scope="scope">
            {{ scope.row.STATE | transStatus }}
          </template>
        </el-table-column>
        <el-table-column label="处理人" prop="DEALMAN_NAME" align="center">
        </el-table-column>
        <el-table-column label="操作" align="center" width="100">
          <template slot-scope="scope">
            <el-button v-if="scope.row.STATE != 'SUBMITTED'" circle style="padding: 7px;" type="warning" icon="el-icon-search"
              size="mini" @click="_CheckDetail(scope.row)">
            </el-button>
            <el-button v-if="scope.row.STATE == 'SUBMITTED'" circle style="padding: 7px;" @click="_CheckDetail(scope.row)"
              type="primary" icon="el-icon-edit" size="mini">
            </el-button>
          </template>
        </el-table-column>
      </el-table>
      <el-pagination style="width: 100%;" class="dib tc" @current-change="refresh" :current-page.sync="currentPage"
        :page-size="limit" layout="total, prev, pager, next, jumper" :total="totalNumber">
      </el-pagination>
    </el-card>

    <el-dialog :visible.sync="ljAfterSaleVisiable" :close-on-click-modal="false" width="800px">
      <div style="margin-bottom:5px;">
        <table width="100%" border="0" cellspacing="0" cellpadding="0">
          <tr>
            <td style="font-size:20px;height:30px;text-align:center;" colspan="6">售后申请表（{{ submitHead.STATE | transStatus }}）</td>
          </tr>
        </table>
      </div>
      <div class="second-head-table" style="margin-bottom:5px;">
        <table width="100%" border="0" cellspacing="0" cellpadding="0">
          <tr>
            <td>编号：{{ submitHead.ID }}</td>
            <td colspan="2">创建时间：{{ submitHead.CREATE_TS | datatrans }}</td>
            <td v-if="submitHead.STATE !='SUBMITTED'">处理人：{{submitHead.DEALMAN_NAME}}</td>
            <td v-else></td>
            <td v-if="submitHead.STATE !='SUBMITTED'" colspan="2">处理时间：{{ submitHead.DEAL_TS | datatrans }}</td>
            <td v-else colspan="2"></td>
          </tr>
        </table>
      </div>
      <div class="table-aftersaleexamine">
        <table width="100%" border="0" cellspacing="0" cellpadding="0">
          <tr>
            <td class="grayTD">客户代码</td>
            <td>{{submitHead.CID}}</td>
            <td class="grayTD">客户名称</td>
            <td colspan="3">{{submitHead.CNAME}}</td>
          </tr>
          <tr>
            <td class="grayTD" style="width:15%;">B2B订单号</td>
            <td style="width:15%;">{{ submitHead.ORDER_NO }}</td>
            <td class="grayTD" style="width:15%;">po订单号</td>
            <td style="width:20%;">{{ submitHead.PUR_NO }}</td>
            <td class="grayTD" style="width:15%;">ERP订单号</td>
            <td style="width:20%;">{{ submitHead.CONTRACT_NO }}</td>
          </tr>
          <tr>
            <td class="grayTD">联系人<span style="color:red;">*</span></td>
            <td>{{submitHead.CONTACT_PERSON}}</td>
            <td class="grayTD">联系电话<span style="color:red;">*</span></td>
            <td>{{submitHead.CONTACT_TEL}}</td>
            <td class="grayTD">返厂物流单号</td>
            <td>{{submitHead.RETURN_TRANS_ID}}</td>
          </tr>
          <tr>
            <td class="grayTD">问题描述<span style="color:red;">*</span></td>
            <td colspan="5" style="text-align:left;padding-left:5px;"><span style="white-space: break-spaces;">{{submitHead.PROBLEM_DESCRIP}}</span></td>
          </tr>
          <tr>
            <td class="grayTD">产品/项目</td>
            <td class="grayTD">型号</td>
            <td class="grayTD" colspan="2">描述</td>
            <td class="grayTD" colspan="2">上传相关信息<span style="color:red;">*</span></td>
          </tr>
          <tr v-for="(submititem,index2) in submit" :key="index2">
            <td>{{submititem.PRODUCTION_VERSION}}</td>
            <td>{{submititem.ITEM_NO}}</td>
            <td colspan="2">{{submititem.NOTES}}</td>
            <td colspan="2">
              <ul class="el-upload-list el-upload-list--text">
                <li v-for="(file, index) in submititem.fileList" :key="index" class="el-upload-list__item is-success"
                  tabindex="0">
                  <a class="el-upload-list__item-name">
                    <el-link type="primary" size="mini" @click="showImage(file.url)"
                      @mouseenter.native="showMiniImage($event, file.url)" @mouseout.native="MiniPic = false">
                      {{ file.name }}
                    </el-link>
                  </a>
                  <label style="display:block;position:absolute;top:1px;right:10px;">
                    <a @click="downLoad(file.url)">下载</a>
                  </label>
                </li>
              </ul>
            </td><!-- 附件 -->
          </tr>
          <tr>
            <td class="grayTD" style="font-size:20px;height:30px" colspan="8">玉兰处理意见</td>
          </tr>
          <tr>
            <td class="grayTD">处理意见<span style="color:red;">*</span></td>
            <td colspan="5" style="text-align:left;padding-left:5px;">
              <el-input v-if="submitHead.STATE == 'SUBMITTED'" v-model="submitHead.FIRST_AUDITION" type="textarea" autosize
                clearable class="inputStyle" placeholder="请填写">
              </el-input>
              <span v-else style="white-space: break-spaces;">{{submitHead.FIRST_AUDITION}}</span>
            </td>
          </tr>
          <tr>
            <td class="grayTD" style="font-size:20px;height:30px" colspan="8">处理结果</td>
          </tr>
          <tr>
            <td class="grayTD">售后订单号<span style="color:red;">*</span></td>
            <td colspan="5">
              <el-input v-if="submitHead.STATE == 'SUBMITTED'" v-model="processDetail.SH_ORDER_NO" clearable class="inputStyle"
                placeholder="请填写">
              </el-input>
              <span v-else>{{processDetail.SH_ORDER_NO}}</span>
            </td>
          </tr>
          <tr>
            <td class="grayTD">售后费用</td>
            <td colspan="2">
              <el-input v-if="submitHead.STATE == 'SUBMITTED'" v-model="processDetail.SH_MONEY" clearable class="inputStyle"
                placeholder="无" oninput="value=value.replace(/[^\d.]/g,'')
                           .replace(/^\./g, '').replace(/\.{2,}/g, '.')
                           .replace('.', '$#$').replace(/\./g, '')
                           .replace('$#$', '.')
                           .slice(0,value.indexOf('.') === -1? value.length: value.indexOf('.') + 3)">
              </el-input>
              <span v-else>{{ processDetail.SH_MONEY == 0 ? "无" : processDetail.SH_MONEY + " 元" }}</span>
            </td>
            <td class="grayTD">付款凭证</td>
            <td colspan="2">
              <ul class="el-upload-list el-upload-list--text">
                <li v-for="(file, index) in processDetail.fileList" :key="index" class="el-upload-list__item is-success"
                  tabindex="0">
                  <a class="el-upload-list__item-name">
                    <el-link type="primary" size="mini" @click="showImage(file.url)"
                      @mouseenter.native="showMiniImage($event, file.url)" @mouseout.native="MiniPic = false">
                      {{ file.name }}
                    </el-link>
                  </a>
                  <label style="display:block;position:absolute;top:1px;right:10px;">
                    <a @click="downLoad(file.url)">下载</a>
                  </label>
                </li>
              </ul>
            </td>
          </tr>
          <tr>
            <td class="grayTD">退款金额</td>
            <td colspan="2">
              <el-input v-if="submitHead.STATE == 'SUBMITTED'" v-model="processDetail.P_MONEY" clearable class="inputStyle"
                placeholder="无" oninput="value=value.replace(/[^\d.]/g,'')
                           .replace(/^\./g, '').replace(/\.{2,}/g, '.')
                           .replace('.', '$#$').replace(/\./g, '')
                           .replace('$#$', '.')
                           .slice(0,value.indexOf('.') === -1? value.length: value.indexOf('.') + 3)">
              </el-input>
              <span v-else>{{ processDetail.P_MONEY == 0 ? "无" : processDetail.P_MONEY + " 元" }}</span>
            </td>
            <td class="grayTD">满意度评分</td>
            <td colspan="2" style="text-align:left;">
              <el-rate v-if="submitHead.STATE == 'APPROVED'" disabled v-model="processDetail.RATE_NUM" :colors="colors" show-score
                allow-half></el-rate>
            </td>
          </tr>
          <tr>
            <td colspan="6" border="0px" style="font-size:14px;text-align:left;">
              <div style="margin:0 5px;">
                注意：<br />
                1.兰居提交处理意见后，请您在15日内确认、提出异议，否则本《售后申请表》作废；<br />
                2.请您仔细阅读本《售后申请表》相关信息，一旦确认，视为同意我司的处理意见；<br />
                3.如果产生售后费用，请扫下方收款二维码进行支付，并将截图上传作为付款凭证；<br />
                售后电话：020-89202878
                公司名称：广东兰居尚品创意家具有限公司&emsp;&emsp;地址：广州市番禺区东环街市广路易兴工业村（方氏物业）A栋3层<br />
              </div>
            </td>
          </tr>
        </table>
        <div style="text-align:center;margin:10px">
          <el-button type="success" v-if="submitHead.STATE == 'SUBMITTED'" @click="_EditDetail()">提交</el-button>
          <el-button type="info" @click="ljAfterSaleVisiable=false">返回</el-button>
        </div>
      </div>
    </el-dialog>

    <div v-if="MiniPic" style="z-index:99999;position:fixed;" :style="{ left: picX, top: picY }">
      <img class="BIGimg2" :src="imgUrl" />
    </div>

    <el-dialog width="500px" title="预览" :visible.sync="BigPic">
      <div>
        <img class="BIGimg" :src="imgUrl" />
      </div>
    </el-dialog>
  </div>
</template>

<script>
import Cookies from "js-cookie";
import {
  GetAllAfterSale,
  GetAfterSaleDetailById,
  LJUpdateProcess
} from "@/api/paymentASP";
import { downLoadFile } from "@/common/js/downLoadFile";
import { mapMutations } from "vuex";

export default {
  name: "afterSaleExamine",
  data() {
    return {
      picX: "0",
      picY: "0",
      MiniPic: false,
      BigPic: false,
      imgUrl: "",
      tableData: [], //表格数据
      totalNumber: 0, //表格总共有几条数据
      currentPage: 1, //当前页数
      limit: 10, //每页最多显示数量
      submitHead: {},
      submit: [],
      processDetail: {}, //玉兰处理结果表明细
      ljAfterSaleVisiable: false,
      selectStatus: "", //存储下拉框的值
      beginTime: "", //查询的开始时间
      finishTime: "", //查询的结束时间
      companyId: Cookies.get("customerMainId"),
      CID: Cookies.get("cid"),
      CNAME: Cookies.get("realName"),
      condition: "",
      //单据状态
      statusArray: [
        { value: "", label: "全部状态" },
        { value: "NEEDPROCESSING", label: "待处理" },
        { value: "SUBMITTED", label: "已提交" },
        { value: "SENDBACK", label: "退回修改" },
        { value: "RECEIVE", label: "已接收" },
        { value: "CUSTOMERAFFIRM", label: "客户确认中" },
        { value: "APPROVED", label: "完成" },
      ],
      colors: ['#99A9BF', '#F7BA2A', '#FF9900'],
    };
  },
  filters: {
    datatrans(value) {
      if (value == "9999/12/31 00:00:00") return "";
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
      return y + "-" + MM + "-" + d + " " + h + ":" + m; //+ ':' + s
    },
    transStatus(value) {
      switch (value) {
        case null:
          return "";
          break;
        case "SUBMITTED":
          return "已提交";
          break;
        case "SENDBACK":
          return "退回修改";
          break;
        case "RECEIVE":
          return "已接收";
          break;
        case "CUSTOMERAFFIRM":
          return "客户确认中";
          break;
        case "APPROVED":
          return "完成";
          break;
      }
    },
  },
  methods: {
    ...mapMutations("badge", ["addBadge", "releaseBadge"]),
    //查询满足条件所有用户的退货赔偿
    refresh() {
      let obj = {
        page: this.currentPage, //第几页
        limit: this.limit, //一页有多少数据
        beginTime: this.beginTime, //开始日期
        finishTime: this.finishTime, //结束日期
        state: this.selectStatus, //状态
        condition: this.condition,
        type: 'lanju'
      };
      if (!obj.beginTime) {
        obj.beginTime = "0001/1/1 00:00:00";
      }
      if (!obj.finishTime) {
        obj.finishTime = "9999/12/31";
      } else {
        obj.finishTime = obj.finishTime + " 23:59:59";
      }
      GetAllAfterSale(obj).then((res) => {
        this.tableData = res.data;
        this.tableData.forEach((item) => {
          item.PRINTED = item.PRINTED === "0" ? true : false;
        });
        this.totalNumber = res.count;
      })
        .catch((err) => {
          this.tableData = [];
          this.totalNumber = 0;
        });
    },
    clickSearch() {
      this.currentPage = 1;
      this.refresh();
    },
    //查看详情
    _CheckDetail(val) {
      //初始化
      this.submitHead = {};
      this.submit = [];
      this.processDetail = {};
      GetAfterSaleDetailById({ ID: val.ID }).then((res) => {
        this.submitHead = JSON.parse(JSON.stringify(val));
        this.submit = res.data.RTCB_ITEM;
        this.processDetail = res.data.RTCB_PROCESS;

        //查询时，将对应用户附件的字段拆解开来，并作为对象传入文件集合中
        for (var j = 0; j < this.submit.length; j++) {
          this.$set(this.submit[j], "fileList", []);
          var list = this.submit[j].ATTACHMENT_FILE.split(";");
          for (var i = 0; i < list.length - 1; i++) {
            var index = list[i].lastIndexOf("/");
            var fileName = list[i].substr(index + 1);
            this.submit[j].fileList.push({
              name: fileName,
              url: list[i],
            });
          }
        }

        //添加一行
        if (!this.processDetail) {
          this.processDetail = {
            P_RTCB_ID: this.submitHead.ID,
            SH_ORDER_NO: "",
            P_MONEY: "",
            SH_MONEY: "",
            RATE_NUM: "",
          };
        }

        //付款凭证
        if (this.processDetail) {
          this.$set(this.processDetail, "fileList", []);
          if (this.processDetail.PROCESS_FILE) {
            var list = this.processDetail.PROCESS_FILE.split(";");
            for (var i = 0; i < list.length - 1; i++) {
              var index = list[i].lastIndexOf("/");
              var fileName = list[i].substr(index + 1);
              this.processDetail.fileList.push({
                name: fileName,
                url: list[i],
              });
            }
          }
        }

        this.ljAfterSaleVisiable = true;
      });
    },
    //保存修改
    _EditDetail() {
      //判断数据完整
      if (!this.submitHead.FIRST_AUDITION) {
        this.$alert("请填写处理意见", "提示", {
          confirmButtonText: "确定",
          type: "warning",
        });
        return;
      }
      if (!this.processDetail.SH_ORDER_NO) {
        this.$alert("请填写售后订单号", "提示", {
          confirmButtonText: "确定",
          type: "warning",
        });
        return;
      }
      this.submitHead.DEALMAN_CODE = this.CID;
      //提交
      LJUpdateProcess({ head: this.submitHead, process: this.processDetail }).then(res => {
        this.$alert("提交成功", "提示", {
          confirmButtonText: "确定",
          type: "success",
        });
        this.ljAfterSaleVisiable = false;
        this.refresh();
      })
    },
    //显示图片
    showImage(url) {
      var list1 = url.split("png");
      var list2 = url.split("jpg");
      var list3 = url.split("jpeg");
      var list4 = url.split("bmp");
      if (
        list1.length > 1 ||
        list2.length > 1 ||
        list3.length > 1 ||
        list4.length > 1
      ) {
        this.imgUrl = "";
        //url只是部分路径，还需要一个头部（还需要全路径）
        this.imgUrl = this.Global.baseUrl + url;
        this.BigPic = true;
      } else {
        return;
      }
    },
    //图片预览
    showMiniImage(event, url) {
      var list1 = url.split("png");
      var list2 = url.split("jpg");
      var list3 = url.split("jpeg");
      var list4 = url.split("bmp");
      if (
        list1.length > 1 ||
        list2.length > 1 ||
        list3.length > 1 ||
        list4.length > 1
      ) {
        this.imgUrl = this.Global.baseUrl + url;
        var clientWidth = document.body.clientWidth;
        var clientHeight = document.body.clientHeight;
        var curserX = event.x;
        var curserY = event.y;
        if (curserX + 200 + 20 < clientWidth) {
          this.picX = curserX + 20 + "px";
        } else {
          this.picX = curserX - 200 - 20 + "px";
        }
        if (curserY + 200 + 10 < clientHeight) {
          this.picY = curserY + 10 + "px";
        } else {
          this.picY = curserY - 200 - 10 + "px";
        }
        this.MiniPic = true;
      } else {
        return;
      }
    },
    //下载
    downLoad(path) {
      downLoadFile(
        this.Global.baseUrl + `DownLoadAPI/DownloadFile?path=${path}&`
      );
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
    this.refresh();
  },
};
</script>

<style scoped>
.table-aftersaleexamine table {
  border-right: 1px solid black;
  border-bottom: 1px solid black;
}
.table-aftersaleexamine table td {
  border-left: 1px solid black;
  border-top: 1px solid black;
  height: 22px;
  text-align: center;
  font-size: 16px;
  padding: 1px;
}
.second-head-table table td {
  height: 15px;
  font-size: 13px;
}
.tableCol {
  background: #f0f9eb;
}
.grayTD {
  background: rgb(241, 242, 243);
}
.inputStyle {
  border: 0;
  height: 100%;
  width: 100%;
  font-size: 16px;
  text-align: center;
}
.centerCard {
  margin: 0 auto;
  position: relative;
}
.tbarStyle {
  margin-bottom: 13px;
}
.BIGimg {
  width: 450px;
  height: 450px;
}
.BIGimg2 {
  width: 200px;
  height: 200px;
}
.icon-print {
  font-size: 25px;
  color: gray;
  cursor: pointer;
}
</style>
<style>
.table-aftersaleexamine .el-input__inner {
  height: 100%;
  width: 100%;
  font-size: 16px;
  box-shadow: none;
  text-align: center;
}

.table-aftersaleexamine .el-input__inner:hover {
  border-color: #e9e9e9;
}

.table-aftersaleexamine .el-input__inner:focus {
  border-color: #42a5f5;
  box-shadow: none;
  transition-duration: 0.5s;
}

.table-aftersaleexamine .el-input__inner::-webkit-input-placeholder {
  line-height: 20px;
}

.table-aftersaleexamine .el-input__inner,
.el-checkbox__inner,
.el-textarea__inner {
  border-radius: 0 !important;
}
.table-aftersaleexamine .el-input__icon {
  height: 100%;
  width: 22px;
  text-align: center;
  line-height: 22px;
}
.table-aftersaleexamine .el-textarea__inner {
  height: 48px;
  display: block;
  resize: vertical;
  padding: 1px 1px;
  -webkit-box-sizing: border-box;
  box-sizing: border-box;
  width: 100%;
  font-size: inherit;
  background-image: none;
  border: 1px solid #dcdfe6;
  border-top-color: rgb(220, 223, 230);
  border-right-color: rgb(220, 223, 230);
  border-bottom-color: rgb(220, 223, 230);
  border-left-color: rgb(220, 223, 230);
  border-radius: 4px;
  -webkit-transition: border-color 0.2s cubic-bezier(0.645, 0.045, 0.355, 1);
  transition: border-color 0.2s cubic-bezier(0.645, 0.045, 0.355, 1);
}
.table-aftersaleexamine .el-upload-list__item {
  margin-top: 0px;
  line-height: 22px;
}
.upload-de .el-upload-dragger {
  height: 25px;
  width: 400px;
}
.upload-de2 .el-upload-dragger {
  height: 25px;
  width: 200px;
}
</style>