-<!--市场部的兰居设计审核界面-->
<template>
  <div class="centerCard">
    <el-card shadow="hover">

      <div slot="header">
        <span class="fstrong f16">兰居设计审核（市场部）</span>
      </div>

      <div id="tbar" class="tbarStyle">
        <el-date-picker type="date" format="yyyy-MM-dd" value-format="yyyy-MM-dd" placeholder="查询开始日期"
          v-model="beginTime" style="width:14%;"></el-date-picker> --
        <el-date-picker type="date" format="yyyy-MM-dd" value-format="yyyy-MM-dd" placeholder="查询截止日期"
          v-model="finishTime" style="width:14%;"></el-date-picker>

        <el-select v-model="SELECT_STATUS" style="margin-left:10px;width:160px;" placeholder="状态">
          <el-option v-for="item in statusArray" :key="item.label" :label="item.label" :value="item.value"></el-option>
        </el-select>

        <el-input @keyup.enter.native="search()" placeholder="请输入方案名称进行查询" v-model="SEARCHKEY"
          style="width:220px;margin-left:10px">
        </el-input>

        <el-button size="medium" type="success" style="margin-left:10px" @click="search()">查询</el-button>
      </div>

      <div style="margin-top:10px">
        <el-table border :data="lanjuData" style="width: 100%" class="table_1">
          <el-table-column prop="ID" label="单据号" align="center" width="150px"></el-table-column>
          <el-table-column label="提交时间" align="center" width="130px">
            <template slot-scope="scope">
              <span>{{ scope.row.SUBMIT_DATE | datatrans }}</span>
            </template>
          </el-table-column>
          <el-table-column prop="DISTRIBUTOR_NAME" label="经销商" align="center" width="130px"></el-table-column>
          <el-table-column prop="CUSTOMER_AGENT" label="联系人" align="center" width="120px"></el-table-column>
          <el-table-column prop="MANAGER" label="主管业务经理" align="center" width="120px"></el-table-column>
          <el-table-column prop="SOLUTION_NAME" label="方案名称" align="center"></el-table-column>
          <el-table-column label="状态" align="center" width="150px">
            <template slot-scope="scope">
              <span>{{ scope.row.STATUS | transStatus }}</span>
            </template>
          </el-table-column>
          <el-table-column align="center" label="操作" width="100px">
            <template slot-scope="scope">
              <el-button v-if="scope.row.STATUS == 1" @click="_EditDetail(scope.row)" type="primary" size="mini"
                icon="el-icon-edit" circle></el-button>
              <el-button v-if="scope.row.STATUS != 1" @click="_CheckDetail(scope.row)" type="warning" size="mini"
                icon="el-icon-search" circle></el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>

      <div style="margin:0 25%;margin-top:10px" class="block">
        <el-pagination @size-change="handleSizeChange" @current-change="handleCurrentChange"
          :current-page.sync="currentPage" :page-sizes="[5, 10, 15, 20]" :page-size="limit"
          layout="total,sizes, prev, pager, next, jumper" :total="count"></el-pagination>
      </div>
    </el-card>

    <el-dialog title="玉兰墙纸·兰居软装设计服务需求表" :visible.sync="lanjuDetail" :close-on-click-modal="false" width="72%">
      <!-- 查看区 -->
      <div v-show="isCheck" class="table-c">
        <table width="100%" border="0px" cellspacing="0px" cellpadding="0">
          <tr class="grayTD">
            <td style="font-size:20px;height:30px;" colspan="9">需求登记表</td>
          </tr>

          <tr>
            <td class="grayTD" colspan="1" :rowspan="this.usedRowspan" style="width:5%;height:15px">基本情况</td>
            <td class="grayTD" colspan="1" rowspan="1" style="width:13%;height:15px">经销商代码</td>
            <td colspan="1" rowspan="1" style="width:11%;height:15px">{{submitForm.DISTRIBUTOR_CODE}}</td>
            <td colspan="1" rowspan="1" class="grayTD" style="width:10%;height:15px">经销商名称</td>
            <td colspan="1" rowspan="1" style="width:12%;height:13px">{{submitForm.DISTRIBUTOR_NAME}}</td>
            <td colspan="1" rowspan="1" class="grayTD" style="width:15%;height:15px">联系人</td>
            <td colspan="1" rowspan="1" style="width:10%;height:10px">{{submitForm.CUSTOMER_AGENT}}</td>
            <td colspan="1" rowspan="1" class="grayTD" style="width:10%;height:15px">联系电话</td>
            <td colspan="1" rowspan="1" style="width:13%;height:15px">{{submitForm.OFFICE_TEL}}</td>
          </tr>

          <tr>
            <td class="grayTD" colspan="1" rowspan="1" style="height:15px">主管业务经理</td>
            <td colspan="1" rowspan="1" style="height:15px">{{submitForm.MANAGER}}</td>
            <td colspan="1" rowspan="1" class="grayTD" style="height:15px">联系电话</td>
            <td colspan="1" rowspan="1" style="height:15px">{{submitForm.MANAGER_TEL}}</td>
            <td colspan="1" rowspan="1" class="grayTD" style="height:15px">接收二维码邮箱</td>
            <td colspan="3" rowspan="1" style="height:15px">{{submitForm.EMAIL}}</td>
          </tr>

          <tr>
            <td class="grayTD" colspan="1" rowspan="1" style="height:15px">方案名称(楼盘)</td>
            <td colspan="3" rowspan="1" style="height:15px">{{submitForm.SOLUTION_NAME}}</td>
            <td colspan="1" rowspan="1" class="grayTD" style="height:15px">楼盘定位</td>
            <td colspan="3" rowspan="1" style="height:15px">{{submitForm.ESTATE_TYPE|houseTrans}}</td>
          </tr>

          <tr>
            <td class="grayTD" colspan="1" rowspan="1" style="height:15px">户型编号</td>
            <td class="grayTD" colspan="1" rowspan="1" style="height:15px">建筑面积</td>
            <td class="grayTD" colspan="2" rowspan="1" style="height:15px">风格：如美式、欧式、中式、地中海、田园、日式、简约、复古、混搭等</td>
            <td class="grayTD" colspan="2" rowspan="1" style="height:15px">偏好说明</td>
            <td class="grayTD" colspan="2" rowspan="1" style="height:15px">附件</td>
          </tr>

          <tr v-for="(item,index) of submitDetailForm" :key="index">
            <td colspan="1" rowspan="1" style="height:30px">{{item.HOUSE_CODE}}</td>
            <td colspan="1" rowspan="1" style="height:30px">{{item.HOUSING_AREA}}</td>
            <td colspan="2" rowspan="1" style="height:30px">{{item.STYLE}}</td>
            <td colspan="2" rowspan="1" style="height:30px">{{item.PREFERENCE_NOTE}}</td>
            <td colspan="2" rowspan="1" style="height:30px">
              <ul class="el-upload-list el-upload-list--text">
                <li v-for="(file, i) in item.fileList" :key="i" class="el-upload-list__item is-success" tabindex="0">
                  <a class="el-upload-list__item-name">
                    <i class="el-icon-document"></i>{{ file.name }}
                  </a>
                  <label style="display:block;position:absolute;top:0px;right:30px;">
                    <a style="cursor:pointer;" @click="downLoad(file.url)">下载附件</a>
                  </label>
                </li>
              </ul>
            </td>
          </tr>

          <tr>
            <td class="grayTD" colspan="2" rowspan="1" style="height:90px">支付方式</td>
            <td colspan="1" rowspan="1" style="height:90px">
              <div><img src="../../assets/img/payment.png" alt="付款二维码" style="width:90%;height:90%;cursor:pointer;"
                  @click="BigPic=true" /></div>
            </td>
            <td colspan="6" rowspan="1" style="height:90px">
              客户上传附件：户型图或平面布局图（需要表示房间名称，如“男儿童房”“女中学生”“老人房”等）、付款凭证（需要备注楼盘名称且图上有交易时间）（图片应为jpg、dwg、pdf等格式,平面图尺寸要表达清晰，消防位等有阻碍设计的地方要标注清楚）
            </td>
          </tr>

          <tr>
            <td class="grayTD" colspan="2" rowspan="1" style="height:30px">备注</td>
            <td colspan="7" rowspan="1" style="height:30px">{{submitForm.MEMO}}</td>
          </tr>

          <tr v-if="submitForm.STATUS==5||submitForm.STATUS==6">
            <td class="grayTD" colspan="2" rowspan="1" style="height:30px">预计出图日期</td>
            <td colspan="3" rowspan="1" style="height:30px">{{submitForm.EXPECTED_DRAW_DATE|datatrans}}</td>
            <td class="grayTD" colspan="2" rowspan="1" style="height:30px">设计图附件</td>
            <td colspan="2" rowspan="1" style="height:30px">
              <ul class="el-upload-list el-upload-list--text">
                <li v-for="(file, i) in this.fileListGM" :key="i" class="el-upload-list__item is-success" tabindex="0">
                  <a class="el-upload-list__item-name">
                    <i class="el-icon-document"></i>{{ file.name }}
                  </a>
                  <label style="display:block;position:absolute;top:0px;right:30px;">
                    <a style="cursor:pointer;" @click="downLoad(file.url)">下载附件</a>
                  </label>
                </li>
              </ul>
            </td>
          </tr>

        </table>
      </div>

      <!--编辑区 -->
      <div v-show="isEdit" class="table-c">
        <table width="100%" border="0px" cellspacing="0px" cellpadding="0">
          <tr class="grayTD">
            <td style="font-size:20px;height:30px;" colspan="9">需求登记表</td>
          </tr>

          <tr>
            <td class="grayTD" colspan="1" :rowspan="this.usedRowspan" style="width:5%;height:15px">基本情况</td>
            <td class="grayTD" colspan="1" rowspan="1" style="width:13%;height:15px">经销商代码</td>
            <td colspan="1" rowspan="1" style="width:11%;height:15px">{{submitForm.DISTRIBUTOR_CODE}}</td>
            <td colspan="1" rowspan="1" class="grayTD" style="width:10%;height:15px">经销商名称</td>
            <td colspan="1" rowspan="1" style="width:12%;height:13px">{{submitForm.DISTRIBUTOR_NAME}}</td>
            <td colspan="1" rowspan="1" class="grayTD" style="width:15%;height:15px">联系人</td>
            <td colspan="1" rowspan="1" style="width:10%;height:10px">{{submitForm.CUSTOMER_AGENT}}</td>
            <td colspan="1" rowspan="1" class="grayTD" style="width:10%;height:15px">联系电话</td>
            <td colspan="1" rowspan="1" style="width:13%;height:15px">{{submitForm.OFFICE_TEL}}</td>
          </tr>

          <tr>
            <td class="grayTD" colspan="1" rowspan="1" style="height:15px">主管业务经理</td>
            <td colspan="1" rowspan="1" style="height:15px">{{submitForm.MANAGER}}</td>
            <td colspan="1" rowspan="1" class="grayTD" style="height:15px">联系电话</td>
            <td colspan="1" rowspan="1" style="height:15px">{{submitForm.MANAGER_TEL}}</td>
            <td colspan="1" rowspan="1" class="grayTD" style="height:15px">接收二维码邮箱</td>
            <td colspan="3" rowspan="1" style="height:15px">{{submitForm.EMAIL}}</td>
          </tr>

          <tr>
            <td class="grayTD" colspan="1" rowspan="1" style="height:15px">方案名称(楼盘)</td>
            <td colspan="3" rowspan="1" style="height:15px">{{submitForm.SOLUTION_NAME}}</td>
            <td colspan="1" rowspan="1" class="grayTD" style="height:15px">楼盘定位</td>
            <td colspan="3" rowspan="1" style="height:15px">{{submitForm.ESTATE_TYPE}}</td>
          </tr>

          <tr>
            <td class="grayTD" colspan="1" rowspan="1" style="height:15px">户型编号</td>
            <td class="grayTD" colspan="1" rowspan="1" style="height:15px">建筑面积</td>
            <td class="grayTD" colspan="2" rowspan="1" style="height:15px"> 风格：如美式、欧式、中式、地中海、田园、日式、简约、复古、混搭等</td>
            <td class="grayTD" colspan="2" rowspan="1" style="height:15px">偏好说明</td>
            <td class="grayTD" colspan="2" rowspan="1" style="height:15px">附件</td>
          </tr>

          <tr v-for="(item,index) of submitDetailForm" :key="index">
            <td colspan="1" rowspan="1" style="height:30px">{{item.HOUSE_CODE}}</td>
            <td colspan="1" rowspan="1" style="height:30px">{{item.HOUSING_AREA}}</td>
            <td colspan="2" rowspan="1" style="height:30px">{{item.STYLE}}</td>
            <td colspan="2" rowspan="1" style="height:30px">{{item.PREFERENCE_NOTE}}</td>
            <td colspan="2" rowspan="1" style="height:30px">
              <ul class="el-upload-list el-upload-list--text">
                <li v-for="(file, i) in item.fileList" :key="i" class="el-upload-list__item is-success" tabindex="0">
                  <a class="el-upload-list__item-name">
                    <i class="el-icon-document"></i>{{ file.name }}
                  </a>
                  <label style="display:block;position:absolute;top:0px;right:30px;">
                    <a style="cursor:pointer;" @click="downLoad(file.url)">下载附件</a>
                  </label>
                </li>
              </ul>
            </td>
          </tr>

          <tr>
            <td class="grayTD" colspan="2" rowspan="1" style="height:90px">支付方式</td>
            <td colspan="1" rowspan="1" style="height:90px">
              <div><img src="../../assets/img/payment.png" alt="付款二维码" style="width:90%;height:90%;cursor:pointer;"
                  @click="BigPic=true" /></div>
            </td>
            <td colspan="6" rowspan="1" style="height:90px">
              客户上传附件：户型图或平面布局图（需要表示房间名称，如“男儿童房”“女中学生”“老人房”等）、付款凭证（需要备注楼盘名称且图上有交易时间）（图片应为jpg、dwg、pdf等格式,平面图尺寸要表达清晰，消防位等有阻碍设计的地方要标注清楚）
            </td>
          </tr>

          <tr>
            <td class="grayTD" colspan="2" rowspan="1" style="height:30px">备注</td>
            <td colspan="7" rowspan="1" style="height:30px">{{submitForm.MEMO}}</td>
          </tr>

        </table>
        <br />
        <div style="text-align:center">
          <el-button type="success" @click="_editSubmit(3)">审核通过</el-button>
          <el-button type="danger" @click="_editSubmit(2)">审核不通过</el-button>
        </div>
      </div>

      <div v-show="isCheck" style="margin-top:5px;font-weight:bold;">
        <table width="100%" border="0px" cellspacing="0px" cellpadding="0">
          <tr>
            <td style="width:12%">提交时间：</td>
            <td style="width:20%;">{{ submitForm.SUBMIT_DATE| datatransDetail }}</td>
            <td style="width:12%">单据状态：</td>
            <td v-if="submitForm.STATUS==3||submitForm.STATUS==5||submitForm.STATUS==6||submitForm.STATUS==8"
              style="width:30%;color:green;">{{ submitForm.STATUS| transStatus }}</td>
            <td v-if="submitForm.STATUS==2||submitForm.STATUS==4||submitForm.STATUS==7" style="width:30%;color:red;">
              {{ submitForm.STATUS| transStatus  }}</td>
            <td v-if="submitForm.STATUS==1" style="width:30%;">{{submitForm.STATUS| transStatus }}</td>
            <td style="width:8%;"></td>
            <td style="width:8%;"></td>
          </tr>
          <tr>
            <td style="width:12%"
              v-if="submitForm.STATUS!=1&&submitForm.STATUS!=2&&submitForm.STATUS!=4&&submitForm.STATUS!=7">市场部审核时间：
            </td>
            <td style="width:20%;"
              v-if="submitForm.STATUS!=1&&submitForm.STATUS!=2&&submitForm.STATUS!=4&&submitForm.STATUS!=7">
              {{ submitForm.AUDIT_TIME| datatransDetail }}</td>
            <td style="width:12%"
              v-if="submitForm.STATUS==8||submitForm.STATUS==4||submitForm.STATUS==5||submitForm.STATUS==6">财务审核时间：</td>
            <td style="width:30%;"
              v-if="submitForm.STATUS==8||submitForm.STATUS==4||submitForm.STATUS==5||submitForm.STATUS==6">
              {{ submitForm.FINANCE_AUDIT_TIME| datatransDetail}}</td>
            <td style="width:8%;"></td>
            <td style="width:8%;"></td>
          </tr>
          <tr>
            <td style="width:12%" v-if="submitForm.STATUS==5||submitForm.STATUS==6">广美审核时间：</td>
            <td style="width:20%;" v-if="submitForm.STATUS==5||submitForm.STATUS==6">
              {{ submitForm.CHECK_TIME| datatransDetail}}</td>
            <td style="width:12%"></td>
            <td style="width:30%;"></td>
            <td style="width:8%;"></td>
            <td style="width:8%;"></td>
          </tr>
        </table>
      </div>
    </el-dialog>

    <el-dialog width="500px" :visible.sync="BigPic">
      <div>
        <img style="width:450px;height:450px;" src="../../assets/img/payment.png" />
      </div>
    </el-dialog>
  </div>
</template>

<script>
import {
  GetAllData,
  GetAllUserData,
  CheckDetailByID,
  addSubmit,
  editSubmit
} from "@/api/lanju";
import { downLoadFile } from "@/common/js/downLoadFile";
import { mapMutations } from "vuex";
import Cookies from "js-cookie";
export default {
  name: "lanJuMarketExamine",
  data() {
    return {
      companyId: "",
      CID: "", //客户账号
      CNAME: "", //客户名
      beginTime: "", //查询的开始时间
      finishTime: "", //查询的结束时间
      SEARCHKEY: "", //搜索栏关键字
      SELECT_STATUS: 1, //存储下拉框的值
      rowPlus: 0, //兰居软装设计需求表中的户型编辑项添加数
      isAdd: false, //新增记录
      isEdit: false, //编辑记录
      isCheck: false, //查看记录
      initRowspan: 5, //基本信息中的初始行数
      usedRowspan: 5, //基本信息中的行数
      fileListGM: [], //广美上传的文件集合
      lanjuDetail: false,
      limit: 10,
      count: 0,
      detailCount: 0, //新增户型记录数
      currentPage: 1,
      rateArray: ["极差", "失望", "一般", "满意", "惊喜"],
      statusArray: [
        {
          label: "全部状态",
          value: 0
        },
        {
          label: "未审核",
          value: 1
        },
        {
          label: "已退回",
          value: 2
        },
        {
          label: "市场部审核通过",
          value: 3
        },
        {
          label: "财务审核通过",
          value: 8
        },
        {
          label: "广美审核通过",
          value: 5
        },
        {
          label: "已完成设计图",
          value: 6
        }
      ],
      typeArray: [
        {
          label: "简装",
          value: "1"
        },
        {
          label: "豪宅",
          value: "2"
        }
      ],
      lanjuData: [],
      submitForm: [], //提交的表头信息
      submitDetailForm: [], //提交的明细信息
      BigPic: false
    };
  },
  created: function() {
    this.refresh();
  },
  filters: {
    transStatus(value) {
      switch (value) {
        case 1:
          return "未审核";
          break;
        case 2:
          return "市场部审核未通过";
          break;
        case 3:
          return "市场部审核通过";
          break;
        case 4:
          return "广美审核未通过";
          break;
        case 5:
          return "广美审核通过";
          break;
        case 6:
          return "已完成设计图";
          break;
        case 7:
          return "财务审核不通过";
          break;
        case 8:
          return "财务审核通过";
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
    }
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
    //查询满足条件的该用户的投诉信息
    refresh() {
      var data = {
        companyId: Cookies.get("companyId"),
        limit: this.limit,
        page: this.currentPage,
        CID: Cookies.get("cid"),
        beginTime: this.beginTime,
        finishTime: this.finishTime,
        STATUS: this.SELECT_STATUS,
        SEARCHKEY: this.SEARCHKEY,
        type: 1
      };
      if (!data.beginTime) {
        data.beginTime = "0001/1/1";
      }
      if (!data.finishTime) {
        data.finishTime = "9999/12/31";
      } else {
        data.finishTime = data.finishTime + " 23:59:59";
      }
      GetAllUserData(data).then(res => {
        this.count = res.count;
        this.lanjuData = res.data;
      });
    },
    //新建记录
    _addRecord() {
      this.isAdd = true;
      this.isEdit = false;
      this.isCheck = false;
      this.lanjuDetail = true;
      (this.submitForm = {
        ID: "",
        DISTRIBUTOR_CODE: "",
        DISTRIBUTOR_NAME: "",
        CONTACTS: "",
        CONTACTS_TEL: "",
        MANAGER: "",
        MANAGER_TEL: "",
        EMAIL: "",
        SOLUTION_NAME: "",
        ESTATE_TYPE: 1,
        PAY_NOTE: "",
        PAY_DETAIL: "",
        MEMO: "",
        EXPECTED_DRAW_DATE: "",
        SUBMIT_DATE: "",
        STATUS: 1
      }),
        (this.submitDetailForm = [
          {
            ID: "",
            HOUSE_CODE: "",
            HOUSING_AREA: "",
            STYLE: "",
            PREFERENCE_NOTE: "",
            PREFERENCE_URL: "",
            DESIGN_ID: ""
          }
        ]),
        (this.submitForm.DISTRIBUTOR_NAME = Cookies.get("realName"));
      this.submitForm.DISTRIBUTOR_CODE = Cookies.get("companyId");
      this.usedRowspan = this.initRowspan;
    },
    //新增记录提交
    _addSubmit() {
      let data1 = this.submitForm;
      let data2 = this.submitDetailForm;
      //判断是否填完所有信息
      if (
        this.submitForm.CONTACTS == "" ||
        this.submitForm.CONTACTS_TEL == "" ||
        this.submitForm.MANAGER == "" ||
        this.submitForm.MANAGER_TEL == "" ||
        this.submitForm.EMAIL == "" ||
        this.submitForm.SOLUTION_NAME == ""
      ) {
        this.$alert("请完善单据信息", "提示", {
          confirmButtonText: "确定",
          type: "warning"
        });
        return;
      }
      //判断户型信息是否填写完整
      for (let index = 0; index < this.submitDetailForm.length; index++) {
        if (this.submitDetailForm[index].STYLE == "") {
          this.$alert("请完善户型信息（如风格、偏好等信息）", "提示", {
            confirmButtonText: "确定",
            type: "warning"
          });
          return;
        }
      }
      addSubmit({ model: data1, detailModels: data2 }).then(res => {
        if (res.code == 0) {
          this.$alert("提交成功", "提示", {
            confirmButtonText: "确定",
            type: "success"
          });
          this.currentPage = 1;
          this.refresh();
        } else {
          this.$alert("提交失败，请稍后重试", "提示", {
            confirmButtonText: "确定",
            type: "warning"
          });
        }
      });
      this.initRowspan = 5;
      this.lanjuDetail = false;
    },
    //查看列表详情
    _CheckDetail(val) {
      this.submitDetailForm = [];
      this.submitForm = val;
      this.fileListGM = [];
      this.usedRowspan = this.initRowspan;
      let data = {
        DESIGN_ID: val.ID
      };
      this.CNAME = Cookies.get("realName");
      CheckDetailByID(data).then(res => {
        if (res.count > 0) {
          this.submitDetailForm = res.data;
          this.detailCount = res.count;
          this.submitForm.CUSTOMER_AGENT = this.submitDetailForm[0].CUSTOMER_AGENT;
          this.submitForm.OFFICE_TEL = this.submitDetailForm[0].OFFICE_TEL;
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
        var listGM = this.submitForm.GM_FILE.split(";");
        for (var i = 0; i < listGM.length - 1; i++) {
          var index = listGM[i].lastIndexOf("/");
          var fileName = listGM[i].substr(index + 1);
          this.fileListGM.push({
            name: fileName,
            url: list[i]
          });
        }
        this.usedRowspan = this.initRowspan + this.detailCount - 1;
        console.log(this.usedRowspan);
        this.isAdd = false;
        this.isEdit = false;
        this.isCheck = true;
        this.lanjuDetail = true;
      });
    },
    //编辑状态下查看列表详情
    _EditDetail(val) {
      this.submitDetailForm = [];
      this.submitForm = val;
      this.usedRowspan = this.initRowspan;
      let data = {
        DESIGN_ID: val.ID
      };
      this.CNAME = Cookies.get("realName");
      CheckDetailByID(data).then(res => {
        if (res.count > 0) {
          this.submitDetailForm = res.data;
          this.detailCount = res.count;
          this.submitForm.CUSTOMER_AGENT = this.submitDetailForm[0].CUSTOMER_AGENT;
          this.submitForm.OFFICE_TEL = this.submitDetailForm[0].OFFICE_TEL;
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
        this.usedRowspan = this.initRowspan + this.detailCount - 1;
        console.log(this.usedRowspan);
        this.isAdd = false;
        this.isEdit = true;
        this.isCheck = false;
        this.lanjuDetail = true;
      });
    },
    //列表详情审核
    _editSubmit(val) {
      if (val == 2 || val == 3) {
        this.submitForm.AUDITOR_NAME = Cookies.get("realName");
        this.submitForm.AUDITOR_CODE = Cookies.get("cid");
      }
      if (val == 4 || val == 5) {
        this.submitForm.ARTS_NAME = Cookies.get("realName");
        this.submitForm.ARTS_CODE = Cookies.get("cid");
      }
      this.submitForm.STATUS = val;
      editSubmit({
        model: this.submitForm,
        detailModels: this.submitDetailForm
      }).then(res => {
        if (res.code == 0) {
          this.$alert("修改成功", "提示", {
            confirmButtonText: "确定",
            type: "success"
          });
          this.currentPage = 1;
          this.releaseBadge("lanju2"); //刷新角标
          this.refresh();
        } else {
          this.$alert("修改失败，请稍后重试", "提示", {
            confirmButtonText: "确定",
            type: "warning"
          });
        }
      });
      this.lanjuDetail = false;
    },
    //添加基本信息中的户型编辑项数目
    _rowPlus() {
      if (this.usedRowspan >= 11) {
        this.$alert("已经达到编辑项的上限", "提示", {
          confirmButtonText: "确定",
          type: "warning"
        });
        return;
      } else {
        this.submitDetailForm.push({
          ID: "",
          HOUSE_CODE: "",
          HOUSING_AREA: "",
          STYLE: "",
          PREFERENCE_NOTE: "",
          PREFERENCE_URL: "",
          DESIGN_ID: ""
        }),
          (this.usedRowspan += 1);
      }
    },
    downLoad(path) {
      downLoadFile(
        this.Global.baseUrl + `DownLoadAPI/DownloadFile?path=${path}&`
      );
    },
    ...mapMutations("badge", ["addBadge", "releaseBadge"])
  }
};
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
  width: 333px;
  height: 333px;
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
</style>