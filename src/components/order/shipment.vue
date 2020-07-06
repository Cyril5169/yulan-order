<template>
  <div class="shipmentCard">
    <el-card class="centerCard">
      <div slot="header">
        <span class="zoomLeft">
          订单号：
          <span class="zoomRight">{{ orderNo }}</span>
        </span>
        <br />
        <span class="zoomLeft">
          产品型号：
          <span class="zoomRight">{{ itemNo }}</span>
        </span>
        <br />
        <span class="zoomLeft">
          下单数量：
          <span class="zoomRight">{{ zongshuliang }}</span>
        </span>
      </div>
      <el-table :data="tableData" style="width: 100%" :row-class-name="tableRowClassName">
        <el-table-column prop="SALE_NO" label="提货单号" align="center"></el-table-column>
        <el-table-column prop="QTY_DELIVER" label="数量" align="center"></el-table-column>
        <el-table-column prop="BATCH_NO" label="批号" align="center"></el-table-column>
        <el-table-column align="center" label="出货情况">
          <template slot-scope="scope">
            <span style="font-size:14px; color:black;" v-if="
                  scope.row.DATE_OUT_STOCK == '' ||
                    scope.row.DATE_OUT_STOCK == '9999/12/31 00:00:00'
                ">待发货</span>
            <span style="font-size:14px; color:black;" v-else>已发货</span>
          </template>
        </el-table-column>
        <el-table-column label="发货日期" align="center">
          <template slot-scope="scope1">
            <span>{{ scope1.row.DATE_OUT_STOCK | datatrans }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="FREIGHT" label="加收物流费" align="center"></el-table-column>
        <el-table-column prop="TRANSCOMPANY" label="物流公司" align="center"></el-table-column>
        <el-table-column prop="TRANS_ID" label="物流单号" align="center"></el-table-column>
        <el-table-column align="center" label="物流查看">
          <template slot-scope="scope">
            <a :href="kuaidi100" target="_blank" @click="searchWL(scope.row.TRANS_ID)">
              <el-button :disabled="scope.row.TRANS_ID === ''" type="danger" size="small">查看物流</el-button>
            </a>
          </template>
        </el-table-column>
        <el-table-column align="center" label="">
          <template slot-scope="scope">
            <el-button type="primary" size="small" @click="addRecord(scope.row)">投诉</el-button>
          </template>
        </el-table-column>
        <el-table-column align="center" label="">
          <template slot-scope="scope">
            <el-button type="danger" size="small" @click="addRefundRecord(scope.row)">售后</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <el-dialog :visible.sync="complaintDetail" :close-on-click-modal="false" width="40%" append-to-body>
      <!-- 编辑区 -->
      <div v-show="isAdd" class="table-c">
        <table width="100%" border="0" cellspacing="0" cellpadding="0">
          <tr class="grayTD">
            <td style="font-size:20px;height:30px;" colspan="4">投诉登记表</td>
          </tr>

          <tr>
            <td class="grayTD" style="width:16%;height:15px">客户代码</td>
            <td style="width:34%;height:15px" class="grayTD">
              (提交后自动生成)
            </td>
            <td class="grayTD" style="width:16%;height:15px">客户名称</td>
            <td style="width:34%;height:15px" class="grayTD">
              (提交后自动生成)
            </td>
          </tr>

          <tr>
            <td class="grayTD" style="height:15px">提货单号</td>
            <td class="grayTD" style="height:15px">{{ submit.SALE_NO }}</td>
            <td class="grayTD" style="height:15px">物流单号</td>
            <td class="grayTD" style="height:15px">{{ submit.C_TRANSBILL }}</td>
          </tr>
          <tr>
            <td class="grayTD" style="height:15px">订单号</td>
            <td class="grayTD" style="height:15px">{{ submit.DINGDANHAO }}</td>
            <td class="grayTD" style="height:15px">产品型号</td>
            <td class="grayTD" style="height:15px">{{ submit.SALENO }}</td>
          </tr>

          <tr>
            <td class="grayTD" style="font-size:20px;height:30px" colspan="4">
              投诉信息
            </td>
          </tr>

          <tr>
            <td class="grayTD" colspan="1" style="height:16px">投诉类型</td>
            <td colspan="1" style="text-align:left;height:16px;">
              <el-select style="height:16px;width:100%;padding:0px 0px 0px 0px;" v-model="submit.TYPE" filterable
                placeholder="选择相应类型">
                <el-option v-for="item in typeArray" :key="item.value" :label="item.label" :value="item.value">
                </el-option>
              </el-select>
            </td>
            <td class="grayTD" colspan="1" style="height:16px">货物数量</td>
            <td v-if="submit.TYPE == '丢失'" class="grayTD" colspan="1" style="height:20px">
              <el-input v-model="submit.LOSED_QUANTITY" placeholder="（丢失数量）" clearable class="inputStyle" oninput="value=value.replace(/[^\d.]/g,'')
                           .replace(/^\./g, '').replace(/\.{2,}/g, '.')
                           .replace('.', '$#$').replace(/\./g, '')
                           .replace('$#$', '.')
                           .slice(0,value.indexOf('.') === -1? value.length: value.indexOf('.') + 3)">
              </el-input>
            </td>
            <td v-if="submit.TYPE == '破损'" class="grayTD" colspan="1" style="height:16px">
              <el-input v-model="submit.DAMAGED_QUANTITY" placeholder="（破损数量）" clearable class="inputStyle" oninput="value=value.replace(/[^\d.]/g,'')
                           .replace(/^\./g, '').replace(/\.{2,}/g, '.')
                           .replace('.', '$#$').replace(/\./g, '')
                           .replace('$#$', '.')
                           .slice(0,value.indexOf('.') === -1? value.length: value.indexOf('.') + 3)">
              </el-input>
            </td>
            <td v-else class="grayTD" colspan="1" style="height:16px"></td>
          </tr>

          <tr>
            <td class="grayTD" colspan="1" rowspan="1" style="height:50px;">
              投诉内容
            </td>
            <td colspan="3" rowspan="1" style="height:50px;">
              <el-input v-model="submit.MEMO" type="textarea" maxlength="200" placeholder="（请输入投诉内容和要求）" clearable
                class="inputStyle">
              </el-input>
            </td>
          </tr>
        </table>

        <div style="margin:0 auto; width:75px;">
          <br />
          <el-button type="success" @click="_addSubmit()">提 交</el-button>
          <!-- 新增时的按钮 -->
        </div>
      </div>
    </el-dialog>

    <el-dialog :visible.sync="RefundDetail" :close-on-click-modal="false" width="45%" append-to-body>
      <!-- 编辑区 -->
      <div v-show="isRefundAdd">
        <table width="100%" border="0" cellspacing="0" cellpadding="0">
          <tr>
            <td style="font-size:20px;height:30px;text-align:center;" colspan="6">退货/赔偿电子申请书【新增】</td>
          </tr>
        </table>
      </div>
      <div v-show="isRefundAdd" class="table-c" style="margin-top:5px;">
        <table width="100%" border="0" cellspacing="0" cellpadding="0">
          <tr>
            <td class="grayTD" style="height:15px" colspan="1">客户代码</td>
            <td style="height:15px" colspan="1">
              {{this.companyId}}
            </td>
            <td class="grayTD" style="height:15px" colspan="1">客户名称</td>
            <td style="height:15px" colspan="3">
              {{this.companyName}}
              <!-- 应该是对应公司的名称，而不是账户的 -->
            </td>
          </tr>
          <tr>
            <td class="grayTD" style="width:14%;height:15px" colspan="1">提货单号</td>
            <td style="width:15%;height:15px" colspan="1">{{ submit.SALE_NO }}</td>
            <td class="grayTD" style="width:15%;height:15px" colspan="1">B2B订单号</td>
            <td style="width:20%;height:15px" colspan="1">{{ submit.orderNo }}</td>
            <td class="grayTD" style="width:14%;height:15px" colspan="1">ERP订单号</td>
            <td style="width:22%;height:19px" colspan="1">{{ this.CONTRACT_NO }}</td>
          </tr>
          <tr>
            <td class="grayTD" style="height:15px" colspan="1">联系人<span style="color:red;">*</span></td>
            <td style="height:15px" colspan="1">
              <el-input v-model="submit.CONTACT_MAN" placeholder="请填写" clearable class="inputStyle">
              </el-input>
            </td>
            <td class="grayTD" style="height:15px" colspan="1">联系电话<span style="color:red;">*</span></td>
            <td style="height:15px" colspan="1">
              <el-input v-model="submit.CONTACT_PHONE" placeholder="请填写" clearable
                oninput="value=value.replace(/[^\d]/g,'')" class="inputStyle">
              </el-input>
            </td>
            <td class="grayTD" style="height:15px" colspan="1">物流单号</td>
            <td style="height:15px" colspan="1">{{ submit.C_TRANSBILL  }}</td>
          </tr>
          <tr>
            <td class="grayTD" style="height:15px" colspan="1">问题描述<span style="color:red;">*</span></td>
            <td style="height:15px" colspan="5">
              <el-input v-model="submit.NOTES" placeholder="" clearable class="inputStyle">
              </el-input>
            </td>
          </tr>
          <tr>
            <td class="grayTD" colspan="1" style="height:15px">产品/项目</td>
            <td class="grayTD" colspan="1" style="height:15px">型号</td>
            <td class="grayTD" colspan="1" style="height:15px">单位</td>
            <td class="grayTD" colspan="1" style="height:15px">数量<span style="color:red;">*</span></td>
            <td class="grayTD" colspan="2" style="height:15px">上传相关信息<span style="color:red;">*</span></td>
          </tr>
          <tr>
            <td colspan="1" style="height:21px">{{submit.PRODUCTION_VERSION}}</td>
            <td colspan="1" style="height:21px">{{submit.ITEM_NO}}</td>
            <td colspan="1" style="height:21px">{{submit.UNIT}}</td>
            <td colspan="1" style="height:21px">
              <el-input v-model="submit.QTY" placeholder="应小于发货数量" clearable class="inputStyle" style="height:25px"
                oninput="value=value.replace(/[^\d.]/g,'')
                           .replace(/^\./g, '').replace(/\.{2,}/g, '.')
                           .replace('.', '$#$').replace(/\./g, '')
                           .replace('$#$', '.')
                           .slice(0,value.indexOf('.') === -1? value.length: value.indexOf('.') + 3)">
              </el-input>
            </td> <!-- 要小于发货数量 -->
            <td colspan="2" style="height:21px">
              <div>
                <el-upload class="upload-de" action="#" drag multiple
                  :on-change="function(file,fileList){return  handleChange(file,fileList)}"
                  :on-remove="function(file,fileList){return  handleRemove(file,fileList)}" ref="upload"
                  :http-request="uploadFiles" :auto-upload="false" :file-list="submit.fileList">
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
                <span>:{{ }}</span><br />
                <span> 年 月 日</span>
              </div>
            </td>
          </tr>
        </table>

        <div style="text-align:center;margin-top:5px">
          <el-button type="success" size="mini" @click="_addRefundSubmit()">提交</el-button>
          <el-button type="info" size="mini" @click="isRefundAdd=false;RefundDetail=false">返回</el-button>
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
  getCompanyInfo
} from "@/api/orderListASP";
import {
  InsertCompensation,
  UpdateState,
  CheckOrderAndItemNo,
  NewUploadFiles
} from "@/api/paymentASP";
import { mapMutations, mapActions } from "vuex";
import { mapState } from "vuex";
export default {
  data() {
    return {
      fileList:[],//按实际上传到服务器中的存储客户意见的附件
      uploadSuccessNum:0,//上传成功的文件数
      tableData: [],
      submitHead: [], //存储退货单单据信息的表
      submit: [], //存储货物信息的表
      returnInfo: [], //存储退货寄样信息的表
      processDetail: [],
      dateStamp: "",
      fileChange: false,
      deleteFile: [],
      complaintDetail: false,
      isAdd: false,
      FormRight: true,
      RefundDetail: false,
      isRefundAdd: false,
      companyId: Cookies.get("customerMainId"), //公司Id
      companyName: "", //公司名称
      CONTRACT_NO: "", //ERP订单号
      CID: Cookies.get("cid"), //用户id
      CNAME: Cookies.get("realName"), //用户名称
      AlreadyRefund: false, //是否已经进行过退货赔偿
      //itemNo: "", //产品型号
      //orderNo: "",
      //lineNo: "",
      zongshuliang: "",
      daifashuliang: "",
      kuaidi100: "",
      kuaididanhao: "",
      dateString: "",
      fileNumber: 0, //存储客户上传文件数量
      fileNameList: [], //存储用户上传附件的名称
      typeArray: [
        {
          label: "晚点",
          value: "晚点"
        },
        {
          label: "破损",
          value: "破损"
        },
        {
          label: "丢失",
          value: "丢失"
        },
        {
          label: "服务",
          value: "服务"
        },
        {
          label: "其他",
          value: "其他"
        }
      ],
      returnArray: [
        //退货方式
        {
          label: "玉兰取货",
          value: "玉兰取货"
        },
        {
          label: "客户邮寄",
          value: "客户邮寄"
        },
        {
          label: "无需退货",
          value: "无需退货"
        }
      ],
      processArray: [
        //退货方式
        {
          label: "赔偿",
          value: "赔偿"
        },
        {
          label: "退货",
          value: "退货"
        },
        {
          label: "无质量问题",
          value: "无质量问题"
        }
      ]
    };
  },
  props: ["orderNo", "itemNo", "lineNo", "PRODUCT", "UNIT"],
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
    }
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
      // this.orderNo = this.$route.params.orderId;
      // this.itemNo = this.$route.params.itemNo;
      // this.lineNo = this.$route.params.lineNo;
      this.processDetail = [
        {
          RTCB_ID: "",
          LINE_NO: "",
          QTY: "",
          NOTES: "",
          PROCESS: "",
          MONEY: ""
        }
      ];
      var data = {
        orderNo: this.orderNo,
        lineNo: this.lineNo,
        itemNo: this.itemNo
      };
      getPackDetailInfo(data)
        .then(res => {
          this.tableData = res.data[0].packDetails;
          this.zongshuliang = res.data[0].allCount;
        })
        .catch(error => {
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
    addRecord(data) {
      (this.isAdd = true),
        (this.complaintDetail = true),
        (this.CNAME = Cookies.get("realName")), //客户名
        (this.submit = {
          SID: "", //投诉单id
          SALE_NO: "", //销售单号
          CUSTOMER_CODE: "", //客户编码
          SUBMITTS: "", //提交时间
          TYPE: "", //投诉类型
          MEMO: "", //备注——投诉内容
          OPERATOR: "", //处理人
          PROCESSTS: "", //处理时间
          PROCESSDESC: "", //处理结果——回复
          WLTS_THINK: "", //服务评价
          FEEDBACKTS: "", //评价时间
          STATUS: 1,
          TELEPHONE: "",
          IMGURL: "",
          LOSED_QUANTITY: "", //货物丢失数量
          DAMAGED_QUANTITY: "", //货物损坏数量
          C_TRANSBILL: "", //物流单号
          DINGDANHAO: "", //b2b订单号
          SALENO: "" //产品型号
        }),
        (this.submit.DINGDANHAO = this.orderNo);
      this.submit.SALENO = this.itemNo;
      this.submit.CUSTOMER_CODE = Cookies.get("companyId");
      this.submit.SALE_NO = data.SALE_NO;
      this.submit.C_TRANSBILL = data.TRANS_ID;
    },
    //新增投诉记录提交
    _addSubmit() {
      let data = this.submit;
      //判断是否填完所有信息
      if (
        this.submit.SALE_NO == "" ||
        this.submit.C_TRANSBILL == "" ||
        this.submit.TYPE == "" ||
        this.submit.MEMO == ""
      ) {
        this.$alert("请完善信息", "提示", {
          confirmButtonText: "确定",
          type: "warning"
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
      if (
        this.submit.DAMAGED_QUANTITY > this.zongshuliang ||
        this.submit.LOSED_QUANTITY > this.zongshuliang
      ) {
        this.$alert("填写数量必须小于下单数量", "提示", {
          confirmButtonText: "确定",
          type: "warning"
        });
        return;
      }
      if (
        (this.submit.TYPE == "破损" || this.submit.TYPE == "丢失") &&
        this.submit.DAMAGED_QUANTITY <= 0 &&
        this.submit.LOSED_QUANTITY <= 0
      ) {
        this.$alert("填写数量必须为正数", "提示", {
          confirmButtonText: "确定",
          type: "warning"
        });
        return;
      }
      console.log(data);
      addSubmit(data).then(res => {
        if (res.code == 0) {
          this.$alert("提交成功", "提示", {
            confirmButtonText: "确定",
            type: "success"
          });
          this.init_shipment();
        } else {
          this.$alert("提交失败，请稍后重试", "提示", {
            confirmButtonText: "确定",
            type: "warning"
          });
        }
      });
      this.complaintDetail = false;
    },
    //初始化新增记录的信息
    addRefund(data) {
      this.dateStamp = new Date().getTime();
      this.FormRight = true;  
      this.uploadSuccessNum = 0;
      this.fileList=[];
      this.fileNumber = 0;
      this.fileNameList = [];
      this.submitHead = {
        ID: "",
        ERP_CREATOR: "", //创建人编号
        ERP_CREATORNAME: "", //创建人姓名
        CID: "", //客户编号
        CNAME: "", //客户姓名
        SENDBACK_REASON: "", //退回理由
        ITEM_COUNT: "", //总货品数量
        ITEM_MAX_INDEX: "", //最大索引
        STATE: "", //状态
        PRINTED: "", //打印方式
        FIRST_AUDITION: "", //初审意见
        RETURN_TYPE: "", //退货类型
        RETURN_ADDRESS: "", //退货地址
        REASSURE_TS: "", //签订日期
        DEALMAN_CODE: "",
        DEAL_TS: "",
        DEALMAN_NAME: ""
      };
      this.submit = {
        RTCB_ID: "", //退货单ID
        ITEM_NO: "", //产品型号
        PRODUCTION_VERSION: "", //版本（项目、产品）
        UNIT: "", //单位
        QTY: "", //数量
        NOTES: "", //问题描述
        CONTACT_MAN: "", //联系人
        CONTACT_PHONE: "", //联系方式
        SALE_NO: "", //提货单号
        orderNo: "", //B2B订单号
        ITEM_NO: "", //产品型号
        C_TRANSBILL: "", //物流单号
        UNIT: "", //单位
        NOTE: "", //类型
        fileList: [], //附件列表
        ATTACHMENT_FILE: "", //附件
        ATTACHMENT_FILE_FOLDER: "" //附件文件夹
      };
      this.submit.orderNo = this.orderNo;
      this.submit.ITEM_NO = this.itemNo;
      this.submit.UNIT = this.UNIT;
      this.submit.SALE_NO = data.SALE_NO;
      this.submit.C_TRANSBILL = data.TRANS_ID;
      getReturnInfo({
        companyId: this.companyId,
        SALE_NO: this.submit.SALE_NO,
        ITEM_NO: this.submit.ITEM_NO
      }).then(res => {
        if (res.code == 0) {
          this.companyName = res.data[0].CUSTOMER_NAME;
          this.CONTRACT_NO = res.data[0].CONTRACT_NO;
          this.submit.PRODUCTION_VERSION = res.data[0].PRODUCTVERSION_NAME;
          this.isRefundAdd = true;
          this.RefundDetail = true;
        }
      });
    },
    //新建一条售后记录
    addRefundRecord(data) {
      CheckOrderAndItemNo({ SALE_NO: data.SALE_NO, ITEM_NO: this.itemNo }).then(
        res => {
          if (res.data.length != 0) {
            this.$confirm(
              "此前已对该订单该型号发起退货赔偿申请，是否要再次申请",
              "提示",
              {
                confirmButtonText: "确定",
                cancelButtonText: "取消",
                type: "warning"
              }
            ).then(() => {
              this.addRefund(data);
            });
          } else {
            this.addRefund(data);
          }
          console.log(res);
        }
      );
    },
    //新增售后记录提交
    _addRefundSubmit() {
      //判断是否填完所有信息
      if (
        !this.submit.CONTACT_MAN ||
        !this.submit.CONTACT_PHONE ||
        !this.submit.NOTES ||
        !this.submit.QTY
      ) {
        this.$alert("请完善信息", "提示", {
          confirmButtonText: "确定",
          type: "warning"
        });
        return;
      }
      //退货数量应小于下单数量
      if (this.submit.QTY > this.zongshuliang) {
        this.$alert("填写数量必须小于下单数量", "提示", {
          confirmButtonText: "确定",
          type: "warning"
        });
        return;
      }
      if (this.submit.QTY <= 0) {
        this.$alert("填写数量必须为正数", "提示", {
          confirmButtonText: "确定",
          type: "warning"
        });
        return;
      }
      //判断是否上传附件
      if (this.submit.fileList.length == 0) {
        this.$alert("请上传相关附件", "提示", {
          confirmButtonText: "确定",
          type: "warning"
        });
        return;
      }
      //判断上传附件的形式为图片或视频
      if (this.FormRight == false) {
        this.$alert("提交失败，附件仅能上传图片或视频", "提示", {
          confirmButtonText: "确定",
          type: "warning"
        });
        return;
      }
      this.$refs.upload.submit();
    },
    //添加兰居处理结果中的明细数目
    _rowPlus() {
      if (this.processDetail.length >= this.submit.QTY) {
        this.$alert("已经达到编辑项的上限", "提示", {
          confirmButtonText: "确定",
          type: "warning"
        });
        return;
      } else {
        this.processDetail.push({
          RTCB_ID: "",
          LINE_NO: "",
          QTY: "",
          NOTES: "",
          PROCESS: "",
          MONEY: ""
        });
      }
    },
    //减少兰居处理结果中的明细数目
    _rowSubtract(index) {
      if (this.processDetail.length == 1) {
        this.$alert("必须至少有一项该类信息", "提示", {
          confirmButtonText: "确定",
          type: "warning"
        });
        return;
      } else {
        this.processDetail.splice(index, 1);
      }
    },
    handleChange(file, fileList) {
      var point = file.name.lastIndexOf(".");
      var suffix = file.name.substr(point);
      var list1 = suffix.split("png");
      var list2 = suffix.split("jpg");
      var list3 = suffix.split("jpeg");
      var list4 = suffix.split("bmp");
      var list5 = suffix.split("avi");
      var list6 = suffix.split("rmvb");
      var list7 = suffix.split("mp4");
      var list8 = suffix.split("flv");
      var list9 = suffix.split("rm");
      var list10 = suffix.split("mpg");
      if (
        list1.length > 1 ||
        list2.length > 1 ||
        list3.length > 1 ||
        list4.length > 1 ||
        list5.length > 1 ||
        list6.length > 1 ||
        list7.length > 1 ||
        list8.length > 1 ||
        list9.length > 1 ||
        list10.length > 1
      ) {
        this.FormRight = true;
        this.submit.fileList = fileList;
        this.fileChange = true;
      } else {
        this.FormRight = false;
        this.submit.fileList = [];
        this.$alert("请上传图片或视频，否则无法成功提交", "提示", {
          confirmButtonText: "确定",
          type: "warning"
        });
        return;
      }
    },
    handleRemove(file, fileList) {
      this.submit.fileList = fileList;
      if ((file.status = "success")) {
        this.deleteFile.push(file.url);
        this.fileNameList.splice(this.fileNameList.length - 1, 1);
      }
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
      this.submit.ATTACHMENT_FILE_FOLDER =
        "/Files/RTCB_ITEM/" + this.companyId + "/" + this.dateStamp;
      this.submit.ITEM_INDEX = 1;
      this.submitHead.ERP_CREATOR = this.CID;
      this.submitHead.ERP_CREATORNAME = this.CNAME;
      this.submitHead.CID = this.companyId;
      this.submitHead.CNAME = this.companyName;
      this.submitHead.SENDBACK_REASON = null;
      this.submitHead.ITEM_COUNT = 1;
      this.submitHead.ITEM_MAX_INDEX = 1;
      this.submitHead.SALE_NO = this.submit.SALE_NO;
      this.submitHead.ORDER_NO = this.orderNo;
      InsertCompensation({ head: this.submitHead, details: this.submit })
        .then(res => {
          UpdateState({
            id: res.data.ID,
            state: "SUBMITTED"
          })
            .then(res => {
              this.$alert("提交成功", "提示", {
                type: "success",
                confirmButtonText: "好的"
              });
            })
            .catch(() => {
              throw "提交失败";
            });
          this.init_shipment();
          this.RefundDetail = false;
        })
        .catch(err => {
          this.$alert("添加失败", "提示", {
            type: "warning",
            confirmButtonText: "好的"
          }).catch(() => {});
        });
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
    //批量且重命名上传文档
    uploadFiles(param) {
      const formData = new FormData();
      formData.append("file", param.file);
      NewUploadFiles(formData, {
        params: {
          CID: this.companyId,
          dateStamp: this.dateStamp,
          dateString: this.dateString,
          type: "customer"
        }
      })
        .then(res => {
          if (res.code == 0) {
            this.fileList.push(res.data);
            this.uploadSuccessNum += 1;
            if (this.uploadSuccessNum == this.submit.fileList.length) {
              if (this.isRefundAdd) {
                this.sumbitNEWANSYC();
              } 
            }
          }
        })
        .then(() => {})
        .catch(() => {});
    },
    ...mapMutations("navTabs", ["addTab"]),
    ...mapActions("navTabs", ["closeTab", "closeToTab"])
  },
  activated: function() {
    this.init_shipment();
  },
  created() {
    this.GetNowDate();
  }
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
  height: 22px;
  text-align: center;
  font-size: 16px;
}
.tableCol {
  background: #f0f9eb;
}
.grayTD {
  background: rgb(241, 242, 243);
}
.inputStyle {
  border: 0;
  height: 95%;
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
  height: 19px;
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