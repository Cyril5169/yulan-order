<template>
  <div class="shipmentCard">
    <el-card class="centerCard" shadow="never">
      <div slot="header">
        <span class="zoomLeft">
          订单号：
          <span class="zoomRight">{{ orderDetail.ORDER_NO }}</span>
        </span>
        <br />
        <span class="zoomLeft">
          产品型号：
          <span class="zoomRight">{{ orderDetail.ITEM_NO }}</span>
        </span>
        <br />
        <span class="zoomLeft">
          下单数量：
          <span class="zoomRight">{{ zongshuliang }}</span>
        </span>
      </div>
      <el-table :data="tableData" style="width: 100%" :row-class-name="tableRowClassName" ref="dataTable">
        <el-table-column prop="SALE_NO" label="提货单号" align="center" width="100"></el-table-column>
        <el-table-column prop="QTY_DELIVER" label="数量" align="center" width="80" v-if="!isX"></el-table-column>
        <el-table-column prop="BATCH_NO" label="批号" align="center"></el-table-column>
        <el-table-column align="center" label="出货情况" width="80">
          <template slot-scope="scope">
            <span v-if="scope.row.DATE_OUT_STOCK == '' || scope.row.DATE_OUT_STOCK == '9999/12/31 00:00:00'">待发货</span>
            <span v-else>已发货</span>
          </template>
        </el-table-column>
        <el-table-column label="发货日期" align="center" width="90">
          <template slot-scope="scope1">
            <span>{{ scope1.row.DATE_OUT_STOCK | datatrans }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="FREIGHT" label="加收物流费" align="center" width="90"></el-table-column>
        <el-table-column prop="TRANSCOMPANY" label="物流公司" align="center"></el-table-column>
        <el-table-column prop="TRANS_ID" label="物流单号" align="center" width="140"></el-table-column>
        <el-table-column align="center" width="100">
          <template slot-scope="scope">
            <a :href="kuaidi100" target="_blank" @click="searchWL(scope.row.TRANS_ID)">
              <el-button size="small">查看物流</el-button>
            </a>
          </template>
        </el-table-column>
        <el-table-column align="center" width="70">
          <template slot-scope="scope">
            <el-button type="primary" size="small" @click="addComplaintRecord(scope.row)">投诉</el-button>
          </template>
        </el-table-column>
        <el-table-column align="center" width="70">
          <template slot-scope="scope">
            <el-button type="danger" size="small" @click="addRefundRecord(scope.row)">售后</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 投诉表单 -->
    <el-dialog :visible.sync="complaintDetail" :close-on-click-modal="false" width="700px" append-to-body>
      <div class="table-c">
        <table width="100%" border="0" cellspacing="0" cellpadding="0">
          <tr class="grayTD">
            <td style="font-size:20px;height:30px;" colspan="4">投诉登记表</td>
          </tr>
          <tr>
            <td class="grayTD" style="width:16%;">客户代码</td>
            <td class="grayTD" style="width:34%;">(提交后自动生成)</td>
            <td class="grayTD" style="width:16%;">客户名称</td>
            <td class="grayTD" style="width:34%;">(提交后自动生成)</td>
          </tr>

          <tr>
            <td class="grayTD">提货单号</td>
            <td class="grayTD">{{ submit.SALE_NO }}</td>
            <td class="grayTD">物流单号</td>
            <td class="grayTD">{{ submit.C_TRANSBILL }}</td>
          </tr>
          <tr>
            <td class="grayTD">订单号</td>
            <td class="grayTD">{{ submit.DINGDANHAO }}</td>
            <td class="grayTD">产品型号</td>
            <td class="grayTD">{{ submit.SALENO }}</td>
          </tr>
          <tr>
            <td class="grayTD" style="font-size:20px;height:30px" colspan="4">投诉信息</td>
          </tr>
          <tr>
            <td class="grayTD">投诉类型</td>
            <td>
              <el-select v-model="submit.TYPE" placeholder="选择相应类型">
                <el-option v-for="item in typeArray" :key="item.value" :label="item.label" :value="item.value">
                </el-option>
              </el-select>
            </td>
            <td class="grayTD">货物数量</td>
            <td v-if="submit.TYPE == '丢失'" class="grayTD" style="height:20px">
              <el-input v-model="submit.LOSED_QUANTITY" placeholder="（丢失数量）" clearable class="inputStyle" oninput="value=value.replace(/[^\d.]/g,'')
                           .replace(/^\./g, '').replace(/\.{2,}/g, '.')
                           .replace('.', '$#$').replace(/\./g, '')
                           .replace('$#$', '.')
                           .slice(0,value.indexOf('.') === -1? value.length: value.indexOf('.') + 3)">
              </el-input>
            </td>
            <td v-else-if="submit.TYPE == '破损'" class="grayTD">
              <el-input v-model="submit.DAMAGED_QUANTITY" placeholder="（破损数量）" clearable class="inputStyle" oninput="value=value.replace(/[^\d.]/g,'')
                           .replace(/^\./g, '').replace(/\.{2,}/g, '.')
                           .replace('.', '$#$').replace(/\./g, '')
                           .replace('$#$', '.')
                           .slice(0,value.indexOf('.') === -1? value.length: value.indexOf('.') + 3)">
              </el-input>
            </td>
            <td v-else class="grayTD"></td>
          </tr>
          <tr>
            <td class="grayTD">
              投诉内容
            </td>
            <td colspan="3" style="height:50px;">
              <el-input v-model="submit.MEMO" type="textarea" maxlength="200" placeholder="（请输入投诉内容和要求）" clearable
                class="inputStyle">
              </el-input>
            </td>
          </tr>
        </table>

        <div style="margin:10px;text-align:center;">
          <el-button type="success" @click="complaintSubmit()">提 交</el-button>
        </div>
      </div>
    </el-dialog>

    <!-- 退货赔偿 -->
    <el-dialog :visible.sync="RefundDetail" :close-on-click-modal="false" width="800px" append-to-body>
      <!-- 编辑区 -->
      <div style="margin-bottom:5px;">
        <table width="100%" border="0" cellspacing="0" cellpadding="0">
          <tr>
            <td style="font-size:20px;height:30px;text-align:center;" colspan="6">退货/赔偿电子申请书【新增】</td>
          </tr>
        </table>
      </div>
      <div class="table-c">
        <table width="100%" border="0" cellspacing="0" cellpadding="0">
          <tr>
            <td class="grayTD">客户代码</td>
            <td>{{this.companyId}}</td>
            <td class="grayTD">客户名称</td>
            <td colspan="3">{{this.CNAME}}</td>
          </tr>
          <tr>
            <td class="grayTD" style="width:14%;">提货单号</td>
            <td style="width:15%;">{{ submit.SALE_NO }}</td>
            <td class="grayTD" style="width:15%;">B2B订单号</td>
            <td style="width:20%;">{{ submit.ORDER_NO }}</td>
            <td class="grayTD" style="width:14%;">ERP订单号</td>
            <td style="width:22%;">{{ this.CONTRACT_NO }}</td>
          </tr>
          <tr>
            <td class="grayTD">联系人<span style="color:red;">*</span></td>
            <td>
              <el-input v-model="submit.CONTACT_MAN" placeholder="请填写" clearable class="inputStyle">
              </el-input>
            </td>
            <td class="grayTD">联系电话<span style="color:red;">*</span></td>
            <td>
              <el-input v-model="submit.CONTACT_PHONE" placeholder="请填写" clearable oninput="value=value.replace(/[^\d]/g,'')"
                class="inputStyle">
              </el-input>
            </td>
            <td class="grayTD">物流单号</td>
            <td>{{ submit.C_TRANSBILL  }}</td>
          </tr>
          <tr>
            <td class="grayTD">问题描述<span style="color:red;">*</span></td>
            <td colspan="5">
              <el-input v-model="submit.NOTES" type="textarea" autosize clearable class="inputStyle" placeholder="请填写">
              </el-input>
            </td>
          </tr>
          <tr>
            <td class="grayTD">产品/项目</td>
            <td class="grayTD">型号</td>
            <td class="grayTD">单位</td>
            <td class="grayTD">数量<span style="color:red;">*</span></td>
            <td class="grayTD" colspan="2">上传相关信息<span style="color:red;">*</span></td>
          </tr>
          <tr>
            <td>{{submit.PRODUCTION_VERSION}}</td>
            <td>{{submit.ITEM_NO}}</td>
            <td>{{submit.UNIT}}</td>
            <td>
              <el-input v-model="submit.QTY" placeholder="应小于发货数量" clearable class="inputStyle" style="height:25px" oninput="value=value.replace(/[^\d.]/g,'')
                           .replace(/^\./g, '').replace(/\.{2,}/g, '.')
                           .replace('.', '$#$').replace(/\./g, '')
                           .replace('$#$', '.')
                           .slice(0,value.indexOf('.') === -1? value.length: value.indexOf('.') + 3)">
              </el-input>
            </td> <!-- 要小于发货数量 -->
            <td colspan="2">
              <div>
                <el-upload class="upload-de" action="#" drag multiple :on-change="handleChange" :on-remove="handleRemove"
                  ref="upload" :http-request="uploadFiles" :auto-upload="false" :file-list="submit.fileList">
                  <i class="el-icon-upload2" style="margin-top:5px;">
                    <span style="font-size:15px;">上传附件</span>
                  </i>
                </el-upload>
              </div>
            </td><!-- 附件 -->
          </tr>

          <tr style="height:90px">
            <td colspan="6" border="0px" style="font-size:13px;color:gray;text-align:left;">
              <div style="margin:0 5px;">
                注意：1.若您未在我公司对您的《退货/赔偿电子申请书》提交处理意见之日起15日内确认、提出异议的，则视为放弃赔偿权利；<br />
                2.玉兰公司支付的退货金额，仅限于本《退货/赔偿电子申请书》的金额，不承担其他费用；<br />
                3.请您仔细阅读本《退货/赔偿电子申请书》相关信息，一旦确认，视为同意我公司的处理方案。<br />
                公司名称：广东玉兰集团股份有限公司&emsp; &emsp;&emsp;&emsp;地址：东莞市莞城莞龙路段狮龙路莞城科技园内<br />
                电话:0769-23321708&emsp;&emsp;邮政编码:523119&emsp;&emsp;邮箱：yulan315@yulangroup.cn<br />
              </div>
            </td>
          </tr>
          <tr style="height:40px">
            <td colspan="3" border="0px" style="font-size:13px;color:gray;text-align:center;">
              <div>
                广东玉兰集团股份有限公司<br />
                市场部<br />
                {{ new Date().getFullYear() }}年
                {{ new Date().getMonth() + 1}}月
                {{ new Date().getDate() }}日
              </div>
            </td>
            <td colspan="3" border="0px" style="font-size:13px;color:gray;text-align:center;">
              <div>
                经销商
                <span>:{{ submit.CNAME }}</span>
                <br />
                <span> 年 月 日</span>
              </div>
            </td>
          </tr>
        </table>
        <div style="text-align:center;margin:10px">
          <el-button type="success" @click="_addRefundSubmit()">提交</el-button>
          <el-button type="info" @click="RefundDetail=false">返回</el-button>
        </div>
      </div>
    </el-dialog>

    <!-- 兰居售后 -->
    <el-dialog :visible.sync="ljAfterSaleVisiable" :close-on-click-modal="false" width="800px" append-to-body>
      <div style="margin-bottom:5px;">
        <table width="100%" border="0" cellspacing="0" cellpadding="0">
          <tr>
            <td style="font-size:20px;height:30px;text-align:center;" colspan="6">退货/赔偿电子申请书【新增】</td>
          </tr>
        </table>
      </div>
      <div class="table-c">
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
            <td style="width:20%;">{{ this.PUR_NO }}</td>
            <td class="grayTD" style="width:15%;">ERP订单号</td>
            <td style="width:20%;">{{ this.CONTRACT_NO }}</td>
          </tr>
          <tr>
            <td class="grayTD">联系人<span style="color:red;">*</span></td>
            <td>
              <el-input v-model="submitHead.CONTACT_PERSON" placeholder="请填写" clearable class="inputStyle">
              </el-input>
            </td>
            <td class="grayTD">联系电话<span style="color:red;">*</span></td>
            <td>
              <el-input v-model="submitHead.CONTACT_TEL" placeholder="请填写" clearable oninput="value=value.replace(/[^\d]/g,'')"
                class="inputStyle">
              </el-input>
            </td>
            <td class="grayTD">返厂物流单号</td>
            <td>
              <el-input v-model="submitHead.RETURN_TRANS_ID" placeholder="请填写" clearable class="inputStyle">
              </el-input>
            </td>
          </tr>
          <tr>
            <td class="grayTD">问题描述<span style="color:red;">*</span></td>
            <td colspan="5">
              <el-input v-model="submitHead.PROBLEM_DESCRIP" type="textarea" autosize clearable class="inputStyle"
                placeholder="请填写">
              </el-input>
            </td>
          </tr>
          <tr>
            <td class="grayTD">产品/项目</td>
            <td class="grayTD">型号</td>
            <td class="grayTD" colspan="2">描述</td>
            <td class="grayTD" colspan="2">上传相关信息<span style="color:red;">*</span></td>
          </tr>
          <tr>
            <td>{{submit.PRODUCTION_VERSION}}</td>
            <td>{{submit.ITEM_NO}}</td>
            <td colspan="2">
              <el-input v-model="submit.NOTES" placeholder="请填写" clearable class="inputStyle"></el-input>
            </td> <!-- 要小于发货数量 -->
            <td colspan="2">
              <div>
                <el-upload class="upload-de" action="#" drag multiple :on-change="handleChange" :on-remove="handleRemove"
                  ref="upload" :http-request="uploadFiles" :auto-upload="false" :file-list="submit.fileList">
                  <i class="el-icon-upload2" style="margin-top:5px;">
                    <span style="font-size:15px;">上传附件</span>
                  </i>
                </el-upload>
              </div>
            </td><!-- 附件 -->
          </tr>
          <tr>
            <td colspan="6" border="0px" style="font-size:14px;text-align:left;">
              <div style="margin:0 5px;">
                注意：<br />
                1.我们将在收到售后申请表的1个工作日内与您联系，请保持电话畅通；<br />
                2.如果您需要联系我们，请拨打售后电话：020-89202878；<br />
                公司名称：广东兰居尚品创意家具有限公司&emsp;&emsp;地址：广州市番禺区东环街市广路易兴工业村（方氏物业）A栋3层<br />
              </div>
            </td>
          </tr>
        </table>
        <div style="text-align:center;margin:10px">
          <el-button type="success" @click="_addRefundSubmit()">提交</el-button>
          <el-button type="info" @click="ljAfterSaleVisiable=false">返回</el-button>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import Axios from "axios";
import { addSubmit } from "@/api/complaint";
import Cookies from "js-cookie";
import { getShipment } from "@/api/orderList";
import {
  getPackDetailInfo,
  getReturnInfo,
  getCompanyInfo,
  GetPurByOrderNo
} from "@/api/orderListASP";
import {
  InsertCompensation,
  UpdateState,
  CheckOrderAndItemNo,
  NewUploadFiles,
} from "@/api/paymentASP";
import { mapMutations, mapActions } from "vuex";
import { mapState } from "vuex";


export default {
  data() {
    return {
      fileList: [], //按实际上传到服务器中的存储客户意见的附件
      uploadSuccessNum: 0, //上传成功的文件数
      tableData: [],
      submitHead: [], //存储退货单单据信息的表
      submit: [], //存储货物信息的表
      returnInfo: [], //存储退货寄样信息的表
      processDetail: [],
      dateStamp: "",
      isX: false,
      complaintDetail: false,
      FormRight: true,
      RefundDetail: false,
      companyId: Cookies.get("customerMainId"), //公司Id
      CONTRACT_NO: "", //ERP订单号
      PUR_NO: "", //po单号
      CID: Cookies.get("cid"), //用户id
      CNAME: Cookies.get("realName"), //用户名称
      AlreadyRefund: false, //是否已经进行过退货赔偿
      zongshuliang: "",
      daifashuliang: "",
      kuaidi100: "",
      kuaididanhao: "",
      dateString: "",
      fileNumber: 0, //存储客户上传文件数量
      typeArray: [
        {
          label: "晚点",
          value: "晚点",
        },
        {
          label: "破损",
          value: "破损",
        },
        {
          label: "丢失",
          value: "丢失",
        },
        {
          label: "服务",
          value: "服务",
        },
        {
          label: "其他",
          value: "其他",
        },
      ],
      returnArray: [
        //退货方式
        {
          label: "玉兰取货",
          value: "玉兰取货",
        },
        {
          label: "客户邮寄",
          value: "客户邮寄",
        },
        {
          label: "无需退货",
          value: "无需退货",
        },
      ],
      processArray: [
        //退货方式
        {
          label: "赔偿",
          value: "赔偿",
        },
        {
          label: "退货",
          value: "退货",
        },
        {
          label: "无质量问题",
          value: "无质量问题",
        },
      ],
      ljAfterSaleVisiable: false
    };
  },
  props: ["orderDetail"],
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
      return y + "-" + MM + "-" + d + " "; /* + h + ':' + m + ':' + s; */
    },
  },
  methods: {
    //查看物流
    searchWL(tab) {
      this.kuaididanhao = tab;
      let kongchuan = "";
      this.kuaidi100 =
        "https://www.kuaidi100.com/chaxun?com=" +
        kongchuan +
        "&nu=" +
        this.kuaididanhao;
    },
    //跳转调用接口
    init_shipment() {
      this.processDetail = [
        {
          RTCB_ID: "",
          LINE_NO: "",
          QTY: "",
          NOTES: "",
          PROCESS: "",
          MONEY: "",
        },
      ];
      var data = {
        orderNo: this.orderDetail.ORDER_NO,
        lineNo: this.orderDetail.LINE_NO,
        itemNo: this.orderDetail.ITEM_NO,
      };
      this.tableData = [];
      getPackDetailInfo(data).then((res) => {
        this.tableData = res.data[0].packDetails;
        this.zongshuliang = res.data[0].allCount;
        this.$refs.dataTable.doLayout();
      }).catch((error) => {
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
    //新建一条投诉记录
    addComplaintRecord(data) {
      this.submit = {
        SALE_NO: data.SALE_NO, //销售单号
        CUSTOMER_CODE: Cookies.get("companyId"), //客户编码
        TYPE: "", //投诉类型
        MEMO: "", //备注——投诉内容
        LOSED_QUANTITY: "", //货物丢失数量
        DAMAGED_QUANTITY: "", //货物损坏数量
        C_TRANSBILL: data.TRANS_ID, //物流单号
        DINGDANHAO: this.orderDetail.ORDER_NO, //b2b订单号
        SALENO: this.orderDetail.ITEM_NO, //产品型号
      };
      this.complaintDetail = true;
    },
    //新增投诉记录提交
    complaintSubmit() {
      //判断是否填完所有信息
      if (
        this.submit.SALE_NO == "" ||
        this.submit.C_TRANSBILL == "" ||
        this.submit.TYPE == "" ||
        this.submit.MEMO == ""
      ) {
        this.$alert("请完善信息", "提示", {
          confirmButtonText: "确定",
          type: "warning",
        });
        return;
      }
      if (this.submit.TYPE == "丢失") {
        this.submit.DAMAGED_QUANTITY = 0;
      }
      if (this.submit.TYPE == "破损") {
        this.submit.LOSED_QUANTITY = 0;
      }
      if (this.submit.TYPE != "破损" && this.submit.TYPE != "丢失") {
        this.submit.LOSED_QUANTITY = 0;
        this.submit.DAMAGED_QUANTITY = 0;
      }
      if (!this.isX &&
        (this.submit.DAMAGED_QUANTITY > this.zongshuliang ||
          this.submit.LOSED_QUANTITY > this.zongshuliang)
      ) {
        this.$alert("填写数量必须小于下单数量", "提示", {
          confirmButtonText: "确定",
          type: "warning",
        });
        return;
      }
      if (!this.isX &&
        (this.submit.TYPE == "破损" || this.submit.TYPE == "丢失") &&
        this.submit.DAMAGED_QUANTITY <= 0 &&
        this.submit.LOSED_QUANTITY <= 0
      ) {
        this.$alert("填写数量必须为正数", "提示", {
          confirmButtonText: "确定",
          type: "warning",
        });
        return;
      }
      addSubmit(this.submit).then((res) => {
        this.$alert("提交成功", "提示", {
          confirmButtonText: "确定",
          type: "success",
        });
        this.complaintDetail = false;
      });
    },
    //新建一条售后记录
    addRefundRecord(data) {
      CheckOrderAndItemNo({
        SALE_NO: data.SALE_NO,
        ITEM_NO: this.orderDetail.ITEM_NO
      }).then(res => {
        if (res.data.length != 0) {
          this.$confirm(
            "此前已对该订单该型号发起退货赔偿申请，是否要再次申请",
            "提示",
            {
              confirmButtonText: "确定",
              cancelButtonText: "取消",
              type: "warning",
            }
          ).then(() => {
            this.addRefund(data);
          });
        } else {
          this.addRefund(data);
        }
      }
      );
    },
    //初始化新增记录的信息
    addRefund(data) {
      this.dateStamp = new Date().getTime();
      this.FormRight = true;
      this.uploadSuccessNum = 0;
      this.fileList = [];
      this.fileNumber = 0;
      var auditType = "";
      if (this.orderDetail.PRODUCT_BRAND == "14") {
        //兰居
        auditType = "lanju";
        this.submitHead = {
          SALE_NO: data.SALE_NO, //提货单号
          ORDER_NO: this.orderDetail.ORDER_NO, //B2B订单号
          ERP_CREATOR: this.CID, //创建人编号
          ERP_CREATORNAME: this.CNAME, //创建人姓名
          CID: this.companyId, //客户编号
          CNAME: this.CNAME, //客户姓名
          AUDIT_TYPE: auditType,
          RETURN_TRANS_ID: "",
          PROBLEM_DESCRIP: "",
          CONTACT_PERSON: "",
          CONTACT_TEL: "",
        };
        this.submit = {
          ITEM_NO: this.orderDetail.ITEM_NO, //产品型号
          PRODUCTION_VERSION: this.orderDetail.PRODUCTVERSION_NAME, //版本（项目、产品）
          UNIT: this.orderDetail.UNIT, //单位
          NOTES: "",
          ATTACHMENT_FILE: "", //附件
          ATTACHMENT_FILE_FOLDER: "", //附件文件夹
          fileList: [], //附件列表
        };
      } else {
        auditType = "yulan";
        this.submitHead = {
          ID: "",
          ERP_CREATOR: this.CID, //创建人编号
          ERP_CREATORNAME: this.CNAME, //创建人姓名
          CID: this.companyId, //客户编号
          CNAME: this.CNAME, //客户姓名
          SENDBACK_REASON: "", //退回理由
          FIRST_AUDITION: "", //初审意见
          RETURN_TYPE: "", //退货类型
          RETURN_ADDRESS: "", //退货地址
          REASSURE_TS: "", //签订日期
          DEALMAN_CODE: "",
          DEAL_TS: "",
          DEALMAN_NAME: "",
          AUDIT_TYPE: auditType,
          SALE_NO: data.SALE_NO, //提货单号
          ORDER_NO: this.orderDetail.ORDER_NO, //B2B订单号
        };
        this.submit = {
          RTCB_ID: "", //退货单ID
          ITEM_NO: "", //产品型号
          PRODUCTION_VERSION: this.orderDetail.PRODUCTVERSION_NAME, //版本（项目、产品）
          UNIT: this.orderDetail.UNIT, //单位
          QTY: "", //数量
          NOTES: "", //问题描述
          CONTACT_MAN: "", //联系人
          CONTACT_PHONE: "", //联系方式
          SALE_NO: data.SALE_NO, //提货单号
          ORDER_NO: this.orderDetail.ORDER_NO, //B2B订单号
          ITEM_NO: this.orderDetail.ITEM_NO, //产品型号
          C_TRANSBILL: data.TRANS_ID, //物流单号
          NOTE: "", //类型
          fileList: [], //附件列表
          ATTACHMENT_FILE: "", //附件
          ATTACHMENT_FILE_FOLDER: "", //附件文件夹
        };
      }
      GetPurByOrderNo({ orderNo: this.orderDetail.ORDER_NO }).then((res) => {
        if (res.data) {
          this.CONTRACT_NO = res.data.CONTRACT_NO;
          this.PUR_NO = res.data.PUR_NO
        }
        if (auditType == "yulan") this.RefundDetail = true;
        else this.ljAfterSaleVisiable = true;
      });
    },
    //新增售后记录提交
    _addRefundSubmit() {
      if (this.submitHead.AUDIT_TYPE == "yulan") {
        //判断是否填完所有信息
        if (
          !this.submit.CONTACT_MAN ||
          !this.submit.CONTACT_PHONE ||
          !this.submit.NOTES ||
          !this.submit.QTY
        ) {
          this.$alert("请完善信息", "提示", {
            confirmButtonText: "确定",
            type: "warning",
          });
          return;
        }
        //退货数量应小于下单数量
        if (this.submit.QTY > this.zongshuliang) {
          this.$alert("填写数量必须小于下单数量", "提示", {
            confirmButtonText: "确定",
            type: "warning",
          });
          return;
        }
        if (this.submit.QTY <= 0) {
          this.$alert("填写数量必须为正数", "提示", {
            confirmButtonText: "确定",
            type: "warning",
          });
          return;
        }
      }
      else {
        if (
          !this.submitHead.CONTACT_PERSON ||
          !this.submitHead.CONTACT_TEL ||
          !this.submitHead.PROBLEM_DESCRIP
        ) {
          this.$alert("请完善信息", "提示", {
            confirmButtonText: "确定",
            type: "warning",
          });
          return;
        }
      }
      //判断是否上传附件
      if (this.submit.fileList.length == 0) {
        this.$alert("请上传相关附件", "提示", {
          confirmButtonText: "确定",
          type: "warning",
        });
        return;
      }
      this.$refs.upload.submit();
    },
    //批量且重命名上传文档
    uploadFiles(param) {
      const formData = new FormData();
      formData.append("file", param.file);
      NewUploadFiles(formData, {
        params: {
          CID: this.companyId,
          dateStamp: this.dateStamp,
          dateString: this.dateString,
          type: "customer",
        }
      }).then((res) => {
        this.fileList.push(res.data); //重命名后的集合
        this.uploadSuccessNum += 1;
        if (this.uploadSuccessNum == this.submit.fileList.length) {
          this.sumbitNEWANSYC();
        }
      }).catch(() => { });
    },
    sumbitNEWANSYC() {
      //相当于同步，等提交成功后再执行
      //附件拼接
      for (let j = 0; j < this.fileList.length; j++) {
        this.submit.ATTACHMENT_FILE +=
          "/Files/RTCB_ITEM/" +
          this.companyId +
          "/" +
          this.dateStamp +
          "/" +
          this.fileList[j] +
          ";";
      }
      this.submit.ATTACHMENT_FILE_FOLDER = "/Files/RTCB_ITEM/" + this.companyId + "/" + this.dateStamp;
      InsertCompensation({ head: this.submitHead, details: this.submit }).then((res) => {
        this.$alert("提交成功", "提示", {
          type: "success",
          confirmButtonText: "好的",
        });
        this.init_shipment();
        this.RefundDetail = false;
        this.ljAfterSaleVisiable = false;
      }).catch((err) => {
        this.$alert("添加失败", "提示", {
          type: "warning",
          confirmButtonText: "好的",
        }).catch(() => { });
      });
    },
    handleChange(file, fileList) {
      var point = file.name.lastIndexOf(".");
      var suffix = file.name.substr(point + 1).toLowerCase();
      var formatList = [
        "png",
        "jpg",
        "jpeg",
        "bmp",
        "avi",
        "rmvb",
        "mp4",
        "flv",
        "rm",
        "mpg",
        "doc",
        "docx",
        "xls",
        "xlsx",
        "pdf",
        "txt"
      ];
      var result = formatList.some((item) => {
        return item == suffix.trim();
      });
      if (result) {
        this.submit.fileList = fileList;
      } else {
        this.submit.fileList = fileList.splice(0, fileList.length - 1);
        this.$alert("请上传图片、视频或文档", "提示", {
          confirmButtonText: "确定",
          type: "warning",
        });
        return;
      }
    },
    handleRemove(file, fileList) {
      this.submit.fileList = fileList;
    },
    GetNowDate() {
      var date = new Date();
      var year = date.getFullYear();
      var month = (date.getMonth() + 1).toString();
      var day = date.getDate().toString();
      if (month.length == 1) {
        month = "0" + month;
      }
      if (day.length == 1) {
        day = "0" + day;
      }
      var dateTime = year + "-" + month + "-" + day;
      this.dateString = dateTime;
    },
    ...mapMutations("navTabs", ["addTab"]),
    ...mapActions("navTabs", ["closeTab", "closeToTab"]),
  },
  activated() {
    this.isX = this.orderDetail.ORDER_NO.slice(0, 1) == "X";
    this.init_shipment();
  },
  mounted() {
    this.GetNowDate();
  },
};
</script>

<style scoped>
.table-c table {
  border-right: 1px solid black;
  border-bottom: 1px solid black;
}
.table-c table td {
  border-left: 1px solid black;
  border-top: 1px solid black;
  height: 20px;
  text-align: center;
  font-size: 16px;
  padding: 1px;
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
.headSpan {
  font-weight: bold;
  font-size: 18px;
  color: black;
}
.zoomRight {
  font-weight: 400;
  font-size: 15px;
  line-height: 30px;
}
.zoomLeft {
  font-size: 15px;
  font-weight: bold;
  display: inline-block;
  margin-right: 30px;
}
</style>
<style>
.el-table .success-row {
  background: #f0f9eb;
}

.table-c .el-input__inner {
  height: 100%;
  width: 100%;
  font-size: 16px;
  box-shadow: none;
  text-align: center;
}

.table-c .el-input__inner:hover {
  border-color: #e9e9e9;
}

.table-c .el-input__inner:focus {
  border-color: #42a5f5;
  box-shadow: none;
  transition-duration: 0.5s;
}

.table-c .el-input__inner::-webkit-input-placeholder {
  line-height: 19px;
}

.table-c .el-input__inner,
.el-checkbox__inner,
.el-textarea__inner {
  border-radius: 0 !important;
}
.table-c .el-input__icon {
  height: 100%;
  width: 22px;
  text-align: center;
  line-height: 22px;
}
.table-c .el-textarea__inner {
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
.upload-de .el-upload-dragger {
  height: 25px;
  width: 200px;
}
</style>