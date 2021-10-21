-<!--客户的付款委托书界面-->
<template>
  <div class="centerCard">
    <el-card shadow="hover">

      <div slot="header">
        <span class="fstrong f16">付款委托书</span>
      </div>

      <div id="tbar" class="tbarStyle">
        <el-date-picker type="date" format="yyyy-MM-dd" value-format="yyyy-MM-dd" placeholder="提交日期开始" v-model="beginTime"
          style="width:14%;"></el-date-picker> --
        <el-date-picker type="date" format="yyyy-MM-dd" value-format="yyyy-MM-dd" placeholder="截止时间" v-model="finishTime"
          style="width:14%;"></el-date-picker>

        <el-select v-model="SELECT_STATUS" style="margin-left:10px;width:160px;" placeholder="状态">
          <el-option v-for="item in statusArray" :key="item.label" :label="item.label" :value="item.value"></el-option>
        </el-select>

        <el-input @keyup.enter.native="search()" placeholder="请输入委托编号进行查询" v-model="SEARCHKEY"
          style="width:220px;margin-left:10px" clearable>
        </el-input>

        <el-button size="medium" type="success" style="margin-left:10px" @click="search()">查询</el-button>
        <el-button size="medium" type="primary" style="float:right" @click="downLoad('/Files/template/第三方付款委托书.docx')">下载委托书模板
        </el-button>
      </div>

      <div style="margin-top:10px">
        <el-table border :data="payData" style="width: 100%">
          <el-table-column width="140" prop="ID" label="委托编号" align="center"></el-table-column>
          <el-table-column prop="TIME_SLOT" width="200" label="付款时间范围" align="center"></el-table-column>
          <el-table-column prop="SUM_MONEY" width="100" label="代付总金额" align="center"></el-table-column>
          <el-table-column label="状态" align="center" width="120px">
            <template slot-scope="scope">
              <span>{{ scope.row.STATE | transStatus }}</span>
            </template>
          </el-table-column>
          <el-table-column width="120" label="确认时间" align="center">
            <template slot-scope="scope">
              <span>{{ scope.row.DATE_AFFIRM | datatrans }}</span>
            </template>
          </el-table-column>
          <el-table-column label="退回原因" align="center" prop="RETURN_REASON">
          </el-table-column>
          <el-table-column align="center" label="操作" width="90">
            <template slot-scope="scope">
              <el-button @click="_EditDetail(scope.row)" type="primary" size="mini" icon="el-icon-edit" circle
                v-if="scope.row.STATE=='1'||scope.row.STATE=='4'"></el-button>
              <el-button @click="_CheckDetail(scope.row)" type="warning" size="mini" icon="el-icon-search" circle
                v-if="scope.row.STATE=='2'||scope.row.STATE=='3'"></el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>

      <div style="margin:0 25%;margin-top:10px" class="block">
        <el-pagination @size-change="handleSizeChange" @current-change="handleCurrentChange" :current-page.sync="currentPage"
          :page-sizes="[5, 10, 15, 20]" :page-size="limit" layout="total,sizes, prev, pager, next, jumper" :total="count">
        </el-pagination>
      </div>
    </el-card>

    <el-dialog title="付款委托书" :visible.sync="payDetail" :close-on-click-modal="false" width="55%">
      <!-- 查看区 -->
      <div v-show="isCheck" class="table-c">
        <table width="100%" border="0px" cellspacing="0px" cellpadding="0">
          <tr>
            <td class="grayTD" style="font-size:20px;height:30px" colspan="4">基本信息</td>
          </tr>
          <tr>
            <td class="grayTD" colspan="1" rowspan="1" style="width:15%;height:15px">流水号</td>
            <td colspan="1" rowspan="1" style="width:35%;height:15px">{{submitForm.ID}}</td>
            <td colspan="1" rowspan="1" class="grayTD" style="width:15%;height:15px">客户编码</td>
            <td colspan="1" rowspan="1" style="width:35%;height:13px">{{submitForm.CUSTOMER_CODE}}</td>
          </tr>

          <tr>
            <td class="grayTD" colspan="1" rowspan="1" style="height:15px">付款总金额</td>
            <td colspan="1" rowspan="1" style="height:15px">{{submitForm.SUM_MONEY}}</td>
            <td colspan="1" rowspan="1" class="grayTD" style="height:15px">付款时间范围</td>
            <td colspan="1" rowspan="1" style="height:15px">{{submitForm.TIME_SLOT}}</td>
          </tr>

          <tr>
            <td class="grayTD" style="font-size:20px;height:30px" colspan="4">委托书明细</td>
          </tr>
          <tr>
            <td class="grayTD" colspan="1" rowspan="1" style="height:15px">行号</td>
            <td class="grayTD" colspan="1" rowspan="1" style="height:15px">受委托人姓名</td>
            <td class="grayTD" colspan="1" rowspan="1" style="height:15px">委托金额</td>
            <td class="grayTD" colspan="1" rowspan="1" style="height:15px">附件</td>
          </tr>

          <tr v-for="(item,index) of submitDetailForm" :key="index">
            <td colspan="1" rowspan="1" style="height:15px">{{item.LINE_NO}}</td>
            <td colspan="1" rowspan="1" style="height:15px">{{item.NAME}}</td>
            <td colspan="1" rowspan="1" style="height:15px">{{item.MONEY}}</td>
            <td colspan="1" rowspan="1" style="height:15px">
              <ul class="el-upload-list el-upload-list--text">
                <li v-for="(file, i) in item.fileList" :key="i" class="el-upload-list__item is-success" tabindex="0">
                  <a class="el-upload-list__item-name">
                    <el-link type="primary" size="mini" @click="showImage(file.url )"
                      @mouseenter.native="showMiniImage($event,file.url)" @mouseout.native="MiniPic=false">{{ file.name }}

                    </el-link>
                  </a>
                  <label style="display:block;position:absolute;top:0px;right:10px;">
                    <a @click="downLoad(file.url)">下载</a>
                  </label>
                </li>
              </ul>
            </td>
          </tr>
        </table>
      </div>

      <!--编辑区 -->
      <div v-show="isEdit" class="table-c">
        <div>
          <table width="100%" border="0" cellspacing="0" cellpadding="0">
            <tr>
              <td class="grayTD" style="font-size:20px;height:30px" colspan="4">基本信息</td>
            </tr>
            <tr>
              <td class="grayTD" colspan="1" rowspan="1" style="width:15%;height:15px">流水号</td>
              <td colspan="1" rowspan="1" style="width:35%;height:15px">{{submitForm.ID}}</td>
              <td colspan="1" rowspan="1" class="grayTD" style="width:15%;height:15px">客户编码</td>
              <td colspan="1" rowspan="1" style="width:35%;height:13px">{{submitForm.CUSTOMER_CODE}}</td>
            </tr>

            <tr>
              <td class="grayTD" colspan="1" rowspan="1" style="height:15px">付款总金额</td>
              <td colspan="1" rowspan="1" style="height:15px">{{submitForm.SUM_MONEY}}</td>
              <td colspan="1" rowspan="1" class="grayTD" style="height:15px">付款时间范围</td>
              <td colspan="1" rowspan="1" style="height:15px">{{submitForm.TIME_SLOT}}</td>
            </tr>

            <tr>
              <td class="grayTD" style="font-size:20px;height:30px" colspan="4">委托书明细</td>
            </tr>
            <tr>
              <td class="grayTD" colspan="1" rowspan="1" style="height:15px">行号</td>
              <td class="grayTD" colspan="1" rowspan="1" style="height:15px">受委托人姓名</td>
              <td class="grayTD" colspan="1" rowspan="1" style="height:15px">委托金额</td>
              <td class="grayTD" colspan="1" rowspan="1" style="height:15px">附件</td>
            </tr>

            <tr v-for="(item,index) of submitDetailForm" :key="index">
              <td colspan="1" rowspan="1" style="height:15px">{{item.LINE_NO}}</td>
              <td colspan="1" rowspan="1" style="height:15px">{{item.NAME}}</td>
              <td colspan="1" rowspan="1" style="height:15px">{{item.MONEY}}</td>
              <td colspan="2" rowspan="1" style="height:30px">
                <div>
                  <el-upload class="upload-de" :action="Global.baseUrl + '/PUR_HEAD/UploadFiles'" drag
                    :on-change="function(file,fileList){return  handleChange(file,fileList,index)}"
                    :on-remove="function(file,fileList){return  handleRemove(file,fileList,index)}"
                    :on-success="function(res,file,fileList){return  handleSuccess(res,file,fileList,index)}" ref="upload"
                    :auto-upload="false" :file-list="submitDetailForm[index].fileList"
                    :data="{ CID: CID, dateStamp: dateStamp,ID:submitForm.ID,LINE_NO: item.LINE_NO}" :limit=1>
                    <i class="el-icon-upload2" style="margin-top:8px;">
                      <span style="font-size:15px;">上传附件</span>
                    </i>
                    <div slot="tip" class="el-upload__tip" style="margin-top:-1px;">只能上传一张图片</div>
                  </el-upload>
                </div>
              </td>
            </tr>

            <tr v-if="this.submitForm.STATE=='4'">
              <td class="grayTD" colspan="4" rowspan="1" style="font-size:20px;height:30px">审核信息（退回）</td>
            </tr>
            <tr v-if="this.submitForm.STATE=='4'">
              <td class="grayTD" colspan="1" rowspan="1" style="height:50px">退回原因</td>
              <td colspan="3" rowspan="1" style="height:50px">{{submitForm.RETURN_REASON}}</td>
            </tr>
          </table>
        </div>

        <div style="text-align:center;margin-top:10px">
          <el-button type="success" v-if="this.submitForm.STATUS!=1" @click="_editSubmit()">确定</el-button>
        </div>

      </div>

      <div v-show="isCheck" style="margin-top:5px;font-weight:bold;">
        <table width="100%" border="0px" cellspacing="0px" cellpadding="0">
          <tr>
            <td style="width:12%">创建时间：</td>
            <td style="width:20%;">{{ submitForm.DATE_CRE| datatransDetail }}</td>
            <td style="width:12%">创建人：</td>
            <td style="width:30%;">{{ submitForm.USER_CRE }}</td>
            <td style="width:8%;"></td>
            <td style="width:8%;"></td>
          </tr>
          <tr v-if="submitForm.USER_AFFIRM!=''">
            <td style="width:12%">确认时间：</td>
            <td style="width:20%;">{{ submitForm.DATE_AFFIRM| datatransDetail }}</td>
            <td style="width:12%">确认人：</td>
            <td style="width:30%;">{{ submitForm.USER_AFFIRM }}</td>
            <td style="width:8%;"></td>
            <td style="width:8%;"></td>
          </tr>
          <tr v-if="submitForm.STATE=='3'||submitForm.STATE=='4'">
            <td style="width:12%">审核时间：</td>
            <td style="width:20%;">{{ submitForm.AUDIT_TIME| datatransDetail }}</td>
            <td style="width:12%">审核人：</td>
            <td style="width:30%;">{{ submitForm.AUDITOR }}</td>
            <td style="width:8%;"></td>
            <td style="width:8%;"></td>
          </tr>
          <tr>
            <td style="width:12%">单据状态：</td>
            <td v-if="submitForm.STATE=='3'" style="width:20%;color:green;">{{ submitForm.STATE|transStatus }}</td>
            <td v-if="submitForm.STATE=='4'" style="width:20%;color:red;">{{ submitForm.STATE|transStatus }}</td>
            <td v-if="submitForm.STATE!='3'&&submitForm.STATE!='4'" style="width:20%;">{{ submitForm.STATE|transStatus }}</td>
          </tr>
        </table>
      </div>
    </el-dialog>

    <div v-if="MiniPic" style="z-index:99999;position:fixed;" :style="{left:picX,top:picY}">
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
import {
  GetCurrentDelegation,
  CheckDetailByID,
  editByCustomer
} from "@/api/supplierASP";
import { downLoadFile } from "@/common/js/downLoadFile";
import { mapMutations } from "vuex";
import Cookies from "js-cookie";
const Head = "http://14.29.223.114:10250/upload";

export default {
  name: "payDelegation",
  data() {
    return {
      picX: "0",
      picY: "0",
      MiniPic: false,
      BigPic: false,
      imgUrl: "",
      dateStamp: "",
      fileChange: false,
      deleteFile: [],
      subtractDeleteFile: [],//点击减号准备删除明细，预删除的文件集合
      deleteIndex: [],//删除文件对应的明细的索引
      btnDisable: false,
      companyId: "",
      CID: Cookies.get("cid"), //账号
      CNAME: Cookies.get("realName"), //账号名
      beginTime: "", //查询的开始时间
      finishTime: "", //查询的结束时间
      SEARCHKEY: "", //搜索栏关键字
      SELECT_STATUS: "0", //存储下拉框的值
      rowPlus: 0,//兰居软装设计需求表中的户型编辑项添加数
      isEdit: false, //编辑记录
      isCheck: false, //查看记录
      isPicture: true,//上传的文件是否为图片
      initRowspan: 5,//基本信息中的初始行数
      usedRowspan: 5,//基本信息中的行数
      fileListGM: [],//广美上传的文件集合
      successCount: 0,
      allCount: 0,
      ServiceDetail: false,
      payDetail: false,
      limit: 10,
      count: 0,
      detailCount: 0,//新增户型记录数
      currentPage: 1,
      statusArray: [
        {
          label: "全部状态",
          value: "0"
        },
        {
          label: "待客户确认",
          value: "1"
        },
        {
          label: "客户确认",
          value: "2"
        },
        {
          label: "通过",
          value: "3"
        },
        {
          label: "退回",
          value: "4"
        },
      ],
      typeArray: [
        {
          label: "简装",
          value: 1
        },
        {
          label: "豪宅",
          value: 2
        },
      ],
      payData: [],
      submitForm: [],//查看或编辑的表头信息
      submitDetailForm: [], //查看或编辑的明细信息
    };
  },
  created: function () {
    this.refresh();
  },
  // computed: {
  //   uploadDisabled(index) {
  //       return this.submitDetailForm[index].fileList.length >0
  //   }, 
  // },
  filters: {
    transStatus(value) {
      switch (value) {
        case "0":
          return "全部状态";
          break;
        case "1":
          return "待客户确认";
          break;
        case "2":
          return "客户确认";
          break;
        case "3":
          return "通过";
          break;
        case "4":
          return "退回";
          break;
      }
    },
    datatrans(value) {
      //时间戳转化大法
      if (value == null || value == "9999/12/31 00:00:00") {
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
      return y + "-" + MM + "-" + d + " ";
    },
    datatransDetail(value) {
      //时间戳转化大法
      if (value == null || value == "9999/12/31 00:00:00") {
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
      return y + "-" + MM + "-" + d + " " + h + ":" + m;
    },
    rateTrans(value) {
      switch (value) {
        case "1":
          return "极差";
        case "2":
          return "失望";
        case "3":
          return "一般";
        case "4":
          return "满意";
        case "5":
          return "惊喜";
      }
    },
    houseTrans(value) {
      switch (value) {
        case 1:
          return "简装";
        case 2:
          return "豪宅";
      }
    },
  },
  methods: {
    //模糊搜索
    search() {
      this.currentPage = 1;
      this.refresh();
    },
    //根据所选页面条数显示数据
    handleSizeChange(val) {
      this.limit = val;
      this.currentPage = 1;
      this.refresh();
    },
    //翻页获取投诉信息
    handleCurrentChange(val) {
      this.currentPage = val;
      this.refresh();
    },
    //查询满足条件的该用户的委托书信息
    refresh() {
      var data = {
        companyId: Cookies.get("companyId"),
        limit: this.limit,
        page: this.currentPage,
        CID: Cookies.get("cid"),
        beginTime: this.beginTime,
        finishTime: this.finishTime,
        STATUS: this.SELECT_STATUS,
        SEARCHKEY: this.SEARCHKEY
      };
      if (!data.beginTime) {
        data.beginTime = "0001/1/1";
      }
      if (!data.finishTime) {
        data.finishTime = "9999/12/31";
      } else {
        data.finishTime = data.finishTime + " 23:59:59";
      }
      GetCurrentDelegation(data).then(res => {
        this.count = res.count;
        this.payData = res.data;
      });
    },
    //查看列表详情
    _CheckDetail(val) {
      this.submitDetailForm = [];
      this.submitForm = val;
      this.fileListGM = [];
      let data = {
        ID: val.ID
      };
      CheckDetailByID(data).then(res => {
        if (res.count > 0) {
          this.submitDetailForm = res.data;
          this.detailCount = res.count;
        }
        for (let j = 0; j < this.submitDetailForm.length; j++) {
          var list = this.submitDetailForm[j].ATTACHMENT_FILE.split(";");
          this.submitDetailForm[j].fileList = [];
          for (var i = 0; i < list.length - 1; i++) {
            var index = list[i].lastIndexOf("/");
            var fileName = list[i].substr(index + 1);
            this.submitDetailForm[j].fileList.push({
              name: fileName,
              url: list[i]
            });
          }
        }
        this.isEdit = false;
        this.isCheck = true;
        this.payDetail = true;
      });
    },
    //编辑状态下查看列表详情
    _EditDetail(val) {
      this.submitDetailForm = [];
      this.submitDetailForm.fileList = [];//可能有问题，lanju里是新增的时候向对象里添加该属性了
      this.submitForm = val;
      this.fileListGM = [];
      this.deleteFile = [];
      this.isPicture = true;
      let data = {
        ID: val.ID
      };
      CheckDetailByID(data).then(res => {
        if (res.count > 0) {
          this.submitDetailForm = res.data;
          this.detailCount = res.count;
        }
        //将数据库里文件路径集合数据拆解，拆分成可以访问的路径
        for (let j = 0; j < this.submitDetailForm.length; j++) {
          var list = this.submitDetailForm[j].ATTACHMENT_FILE.split(";");
          this.submitDetailForm[j].fileList = [];
          for (var i = 0; i < list.length - 1; i++) {
            var index = list[i].lastIndexOf("/");
            var fileName = list[i].substr(index + 1);
            this.submitDetailForm[j].fileList.push({
              name: fileName,
              url: list[i]
            });
          }
        }
        this.dateStamp = new Date().getTime();
        this.isEdit = true;
        this.isCheck = false;
        this.payDetail = true;
      });
    },
    //编辑列表详情修改
    _editSubmit() {
      if (this.isPicture == false) {
        this.$alert("提交失败，附件仅能上传图片", "提示", {
          confirmButtonText: "确定",
          type: "warning"
        });
        return;
      }
      //提交前判断每个明细是否上传附件
      for (let i = 0; i < this.submitDetailForm.length; i++) {
        if (this.submitDetailForm[i].fileList.length == 0) {
          this.$alert("每个明细都必须上传一个附件", "提示", {
            confirmButtonText: "确定",
            type: "warning"
          });
          return;
        }
      }
      if (this.fileChange) {
        //文件发生改变，重新上传一次(仅选中修改后的文件，而不是所有文件效率会更高)
        for (let i = 0; i < this.submitDetailForm.length; i++) {
          this.$refs.upload[i].submit();
          this.submitDetailForm[i].ATTACHMENT_FILE = "";
          for (let j = 0; j < this.submitDetailForm[i].fileList.length; j++) {
            this.submitDetailForm[i].ATTACHMENT_FILE +=
              "/Files/payDelegation/" +
              this.CID +
              "/" +
              this.dateStamp +
              "/" +
              this.submitDetailForm[i].fileList[j].name +
              ";";
          }
          this.submitDetailForm[i].ATTACHMENT_FILE_FOLDER =
            "/Files/payDelegation/" + this.CID + "/" + this.dateStamp;
        }
      } else {
        if (this.deleteFile.length > 0) {
          for (let i = 0; i < this.deleteFile.length; i++) {
            this.submitDetailForm[this.deleteIndex[i]].ATTACHMENT_FILE = "";
            for (var j = 0; j < this.submitDetailForm[this.deleteIndex[i]].fileList.length; j++) {
              this.submitDetailForm[this.deleteIndex[i]].ATTACHMENT_FILE += this.submitDetailForm[this.deleteIndex[i]].fileList[j].url + ";";
            }
          }
        }
        this.submitEDITANSYC();
      }
    },
    handleChange(file, fileList, index) {
      var point = file.name.lastIndexOf('.');
      var prefix = this.submitForm.ID + '-' + this.CID + '-' + this.submitDetailForm[index].LINE_NO;
      var suffix = file.name.substr(point);
      var list1 = suffix.split('png');
      var list2 = suffix.split('jpg');
      var list3 = suffix.split('jpeg');
      var list4 = suffix.split('bmp');
      if (list1.length > 1 || list2.length > 1 || list3.length > 1 || list4.length > 1) {
        this.isPicture = true;
        var fileName = prefix + suffix;
        file.name = fileName;
        this.submitDetailForm[index].fileList = fileList;
        this.fileChange = true;
      }
      else {
        this.isPicture = false;
        this.submitDetailForm[index].fileList = [];
        this.$alert("请上传图片，否则无法成功提交", "提示", {
          confirmButtonText: "确定",
          type: "warning"
        });
        return;
      }
    },
    handleRemove(file, fileList, index) {
      this.submitDetailForm[index].fileList = fileList;
      if ((file.status = "success")) {
        this.deleteFile.push(file.url);
        this.deleteIndex.push(index)
      }
    },
    handleSuccess(res, file, fileList, index) {
      var flag = true;
      for (let i = 0; i < this.submitDetailForm.length; i++) {
        if (this.submitDetailForm[i].fileList.filter(item => item.status == "uploading").length == 0 && this.submitDetailForm[i].fileList.filter(item => item.status == "success").length == this.submitDetailForm[i].fileList.length) {
        }
        else {
          flag = false;
          break;
        }
      }
      if (flag) {
        if (this.isEdit) {
          this.submitEDITANSYC();
        }
      }
    },
    handleError(err, file, fileList) {
      this.$refs.upload.clearFiles();
      this.fileList = [];
      this.dateStamp = new Date().getTime();
      this.btnDisable = false;
      this.$alert("文件上传失败", "提示", {
        confirmButtonText: "确定",
        type: "success"
      });
    },
    submitEDITANSYC() {
      this.submitForm.USER_AFFIRM = this.CNAME;
      //相当于同步，等提交成功后再执行
      editByCustomer({
        model: this.submitForm,
        detailModels: this.submitDetailForm,
        attchmentChange: this.fileChange,
        deleteFile: this.deleteFile
      }).then(res => {
        this.$alert("修改成功", "提示", {
          confirmButtonText: "确定",
          type: "success"
        });
        this.currentPage = 1;
        this.releaseBadge("payDelegation1");//刷新角标
        this.refresh();
        this.payDetail = false;
      });
    },
    downLoad(path) {
      downLoadFile(
        this.Global.baseUrl + `DownLoadAPI/DownloadFile?path=${path}&`
      );
    },
    //显示图片
    showImage(url) {
      var list1 = url.split('png');
      var list2 = url.split('jpg');
      var list3 = url.split('jpeg');
      var list4 = url.split('bmp');
      if (list1.length > 1 || list2.length > 1 || list3.length > 1 || list4.length > 1) {
        this.imgUrl = "";
        //url只是部分路径，还需要一个头部（还需要全路径）
        this.imgUrl = this.Global.baseUrl + url;
        this.BigPic = true;
      }
      else {
        return;
      }
    },
    //图片预览
    showMiniImage(event, url) {
      var list1 = url.split('png');
      var list2 = url.split('jpg');
      var list3 = url.split('jpeg');
      var list4 = url.split('bmp');
      if (list1.length > 1 || list2.length > 1 || list3.length > 1 || list4.length > 1) {
        this.imgUrl = this.Global.baseUrl + url;
        var clientWidth = document.body.clientWidth;
        var clientHeight = document.body.clientHeight;
        var curserX = event.x;
        var curserY = event.y;
        if (curserX + 200 + 20 < clientWidth) {
          this.picX = curserX + 20 + 'px';
        }
        else {
          this.picX = curserX - 200 - 20 + 'px';
        }
        if (curserY + 200 + 10 < clientHeight) {
          this.picY = curserY + 10 + 'px';
        }
        else {
          this.picY = curserY - 200 - 10 + 'px';
        }
        this.MiniPic = true;
      }
      else {
        return;
      }
    },
    ...mapMutations("badge", ["addBadge", "releaseBadge"]),
  },
}
</script>

<style>
.table_1 .el-table__row {
  height: 6px;
}
</style>

 <style scoped>
.centerCard h4 {
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
.headerStyle {
  display: inline-block;
  width: 100px;
  font-weight: bold;
}
.timeRight {
  font-size: 14px;
  line-height: 30px;
  display: inline-block;
  margin-right: 20px;
  font-weight: bold;
}
.timeLeft {
  font-size: 14px;
  line-height: 30px;
  display: inline-block;
}
.ISimg {
  width: 100px;
  height: 100px;
  cursor: pointer;
}
.BIGimg {
  width: 450px;
  height: 450px;
}
.BIGimg2 {
  width: 200px;
  height: 200px;
}
.inputWidth {
  width: 220px;
}
.tbarStyle {
  margin-bottom: 13px;
}
.statusCombobox {
  margin-left: 10px;
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
  width: 30px;
  height: 30px;
  line-height: 30px;
  text-align: center;
}
.avatar {
  width: 30px;
  height: 30px;
  display: block;
}
.inputStyle {
  border: 0;
  height: 100%;
  width: 100%;
  font-size: 16px;
  text-align: center;
}
.inputStyleNew {
  border: 0;
  height: 100%;
  width: 54%;
  font-size: 16px;
  text-align: center;
}
.upload-de .el-upload-dragger {
  height: 30px;
  width: 200px;
}
/* .disabled .el-upload--text {
    display: none;
}
.disabled .el-upload__tip {
    display: none;
} */
</style>