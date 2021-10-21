<!--客户的投诉界面-->
<template>
  <div class="centerCard">
    <el-card shadow="hover">

      <div slot="header">
        <span class="fstrong f16">物流投诉</span>
      </div>

      <div id="tbar" class="tbarStyle">
        <el-date-picker type="date" format="yyyy-MM-dd" value-format="yyyy-MM-dd" placeholder="查询开始日期" v-model="beginTime"
          style="width:14%;"></el-date-picker> --
        <el-date-picker type="date" format="yyyy-MM-dd" value-format="yyyy-MM-dd" placeholder="查询截止日期" v-model="finishTime"
          style="width:14%;"></el-date-picker>

        <el-select v-model="SELECT_STATUS" style="margin-left:10px;width:130px;" placeholder="状态">
          <el-option v-for="item in statusArray" :key="item.label" :label="item.label" :value="item.value"></el-option>
        </el-select>

        <el-input @keyup.enter.native="search()" placeholder="请输入单号进行查询" v-model="SEARCHKEY" style="width:220px;margin-left:10px">
        </el-input>
        <el-button size="medium" type="success" style="margin-left:10px" @click="search()">查询</el-button>
        <el-button size="medium" type="primary" style="float:right;" @click="GetSaleNoAndItemNo()">无物流单号投诉新增</el-button>

      </div>

      <div style="margin-top:10px">
        <el-table border :data="complaintData" style="width: 100%" class="table_1">
          <el-table-column prop="SALE_NO" label="提货单号" align="center" width="150px"></el-table-column>
          <el-table-column prop="C_TRANSBILL" label="物流单号" align="center" width="150px"></el-table-column>
          <el-table-column prop="CUSTOMER_CODE" label="客户代码" align="center" width="100px"></el-table-column>
          <el-table-column prop="CUSTOMER_NAME" label="客户名称" align="center"></el-table-column>
          <el-table-column prop="TYPE" label="投诉类型" align="center" width="100px"></el-table-column>
          <el-table-column prop="SUBMITTS" label="投诉时间" align="center" width="120px">
            <template slot-scope="scope">
              <span>{{ scope.row.SUBMITTS | datatrans }}</span>
            </template>
          </el-table-column>
          <el-table-column label="状态" align="center" width="150px">
            <template slot-scope="scope">
              <span>{{ scope.row.STATUS | transStatus }}</span>
            </template>
          </el-table-column>
          <el-table-column align="center" label="操作" width="100px">
            <template slot-scope="scope">
              <el-button v-if="scope.row.STATUS != 2" @click="_CheckDetail(scope.row.SID)" type="warning" size="mini"
                icon="el-icon-search" circle></el-button>
              <el-button v-if="scope.row.STATUS == 2" @click="_EditDetail(scope.row.SID)" type="primary" size="mini"
                icon="el-icon-edit" circle></el-button>
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

    <el-dialog :visible.sync="complaintDetail" :close-on-click-modal="false" width="40%">
      <!-- 查看区 -->
      <div v-show="isCheck" class="table-c">
        <table width="100%" border="0px" cellspacing="0px" cellpadding="0">
          <tr class="grayTD">
            <td style="font-size:20px;height:30px;" colspan="4">投诉登记表</td>
          </tr>
          <tr>
            <td class="grayTD" style="width:16%;height:15px">客户代码</td>
            <td style="width:34%;height:15px">{{tableData.CUSTOMER_CODE}}</td>
            <td class="grayTD" style="width:16%;height:15px">客户名称</td>
            <td style="width:34%;height:15px">{{tableData.CUSTOMER_NAME}}</td>
          </tr>

          <tr>
            <td class="grayTD" style="height:15px">提货单号</td>
            <td style="height:15px">{{tableData.SALE_NO}}</td>
            <td class="grayTD" style="height:15px">物流单号</td>
            <td style="height:15px">{{tableData.C_TRANSBILL}}</td>
          </tr>

          <tr>
            <td class="grayTD" style="height:15px">订单号</td>
            <td style="height:15px">{{tableData.DINGDANHAO}}</td>
            <td class="grayTD" style="height:15px">产品型号</td>
            <td style="height:15px">{{tableData.SALENO}}</td>
          </tr>

          <tr>
            <td class="grayTD" style="font-size:20px;height:30px" colspan="4">投诉信息</td>
          </tr>

          <tr>
            <td class="grayTD" colspan="1" style="height:15px">投诉类型</td>
            <td colspan="1" style="height:15px">{{tableData.TYPE}}</td>
            <td class="grayTD" colspan="1" style="height:15px">数量</td>
            <td v-if="tableData.TYPE=='丢失'" colspan="1" style="height:15px">{{tableData.LOSED_QUANTITY}}</td>
            <td v-if="tableData.TYPE=='破损'" colspan="1" style="height:15px">{{tableData.DAMAGED_QUANTITY}}</td>
            <td v-else class="grayTD" colspan="1" style="height:15px"> </td>
          </tr>

          <tr>
            <td class="grayTD" colspan="1" style="height:60px;">投诉内容</td>
            <td colspan="3" style="height:60px;">{{tableData.MEMO}}</td>
          </tr>

          <tr v-show="isCheck ">
            <td class="grayTD" colspan="1" rowspan="1" border="0px" style="height:35px">处理结果</td>
            <td v-if="tableData.STATUS==2||tableData.STATUS==3" colspan="3" rowspan="1" style="height:35px">
              {{tableData.PROCESSDESC}}</td>
            <td v-if="tableData.STATUS!=2&&tableData.STATUS!=3" colspan="3" rowspan="1" style="height:35px">暂无处理结果</td>
          </tr>

          <tr v-show="isCheck &&tableData.WLTS_THINK!=''">
            <td class="grayTD" colspan="1" rowspan="2" border="0px" style="height:35px">服务评价</td>
            <td v-if="tableData.STATUS==3" colspan="3" rowspan="1" style="height:35px">{{tableData.WLTS_THINK|rateTrans}}</td>
            <td v-if="tableData.STATUS!=3" colspan="3" rowspan="1" style="height:35px">暂无评价回复</td>
          </tr>
        </table>
      </div>

      <!-- 编辑区 -->
      <div v-show="isAdd||isEdit" class="table-c">
        <div>
          <table width="100%" border="0" cellspacing="0" cellpadding="0">
            <tr class="grayTD">
              <td style="font-size:20px;height:30px;" colspan="4">投诉登记表</td>
            </tr>

            <tr>
              <td class="grayTD" style="width:16%;height:20px">客户代码</td>
              <td style="width:32%;height:20px">{{submit.CUSTOMER_CODE}}</td>
              <td class="grayTD" style="width:16%;height:20px">客户名称</td>
              <td style="width:40%;height:20px" v-if="isEdit">{{submit.CUSTOMER_NAME}}</td>
              <td style="width:40%;height:20px" v-else>{{this.CUSTOMER_NAME}}</td>
            </tr>

            <tr>
              <td class="grayTD" style="height:20px">提货单号</td>
              <td style="height:20px" v-if="isEdit">{{submit.SALE_NO}}</td>
              <td style="height:20px" v-else>{{this.SALE_NO}}</td>

              <td class="grayTD" style="height:20px">物流单号</td>
              <td style="height:20px" v-if="isEdit">{{submit.C_TRANSBILL}}</td>
              <td style="height:20px" v-else>
                <el-input v-model="submit.C_TRANSBILL" placeholder="请输入" clearable class="inputStyle"
                  oninput="value=value.replace(/[^\d]/g,'')">
                </el-input>

              </td>
            </tr>
            <tr>
              <td class="grayTD" style="height:20px">订单号</td>
              <td style="height:20px" v-if="isEdit">{{submit.DINGDANHAO}}</td>
              <td style="height:20px" v-else>
                <el-input v-model="submit.DINGDANHAO" placeholder="请输入" clearable class="inputStyle">
                </el-input>
              <td class="grayTD" style="height:20px">产品型号</td>
              <td style="height:20px" v-if="isEdit">{{submit.SALENO}}</td>
              <td style="height:20px" v-else>{{this.SALENO}}</td>
            </tr>

            <tr>
              <td class="grayTD" style="font-size:20px;height:30px" colspan="4">投诉信息</td>
            </tr>

            <tr>
              <td class="grayTD" colspan="1" style="height:20px">投诉类型<span style="color:red;">*</span></td>
              <td colspan="1" style="height:20px" v-if="isEdit">{{submit.TYPE}}</td>
              <td colspan="1" style="text-align:left;height:20px" v-else>
                <el-select style="height:20px;width:100%;padding:0px 0px 0px 0px;" v-model="submit.TYPE" filterable
                  placeholder="选择相应类型">
                  <el-option v-for="item in typeArray" :key="item.value" :label="item.label" :value="item.value">
                  </el-option>
                </el-select>
              </td>

              <td class="grayTD" colspan="1" style="height:20px">数量<span style="color:red;">*</span></td>
              <td v-if="isEdit&&submit.TYPE=='丢失'" colspan="1" style="height:20px">{{submit.LOSED_QUANTITY}}</td>
              <td v-if="isAdd&&submit.TYPE=='丢失'" colspan="1" style="height:20px">
                <el-input v-model="submit.LOSED_QUANTITY" placeholder="（丢失数量）" clearable class="inputStyle" oninput="value=value.replace(/[^\d.]/g,'')
                           .replace(/^\./g, '').replace(/\.{2,}/g, '.')
                           .replace('.', '$#$').replace(/\./g, '')
                           .replace('$#$', '.')
                           .slice(0,value.indexOf('.') === -1? value.length: value.indexOf('.') + 3)">
                </el-input>
              </td>

              <td v-if="isEdit&&submit.TYPE=='破损'" class="grayTD" colspan="1" style="height:20px">{{submit.DAMAGED_QUANTITY}}</td>
              <td v-if="isAdd&&submit.TYPE=='破损'" colspan="1" style="height:20px">
                <el-input v-model="submit.DAMAGED_QUANTITY" placeholder="（破损数量）" clearable class="inputStyle" oninput="value=value.replace(/[^\d.]/g,'')
                           .replace(/^\./g, '').replace(/\.{2,}/g, '.')
                           .replace('.', '$#$').replace(/\./g, '')
                           .replace('$#$', '.')
                           .slice(0,value.indexOf('.') === -1? value.length: value.indexOf('.') + 3)">
                </el-input>
              </td>

              <td v-else class="grayTD" colspan="1" style="height:20px"> </td>
            </tr>

            <tr>
              <td class="grayTD" colspan="1" rowspan="1" style="height:50px;">投诉内容<span style="color:red;">*</span></td>
              <td colspan="3" rowspan="1" style="height:50px" class="grayTD" v-if="isEdit">{{submit.MEMO}}</td>
              <td colspan="3" rowspan="1" style="height:50px;" v-else>
                <el-input v-model="submit.MEMO" type="textarea" maxlength="200" placeholder="（请输入投诉内容和要求）" clearable
                  class="inputStyle">
                </el-input>
              </td>
            </tr>

            <tr v-if="submit.STATUS==2||submit.STATUS==3">
              <td class="grayTD" colspan="1" rowspan="1" border="0px" style="height:35px">处理结果</td>
              <td colspan="3" rowspan="1" style="height:35px">{{submit.PROCESSDESC}}</td>
            </tr>

            <tr v-show="isEdit && submit.STATUS==2">
              <td class="grayTD" colspan="1" rowspan="2" border="0px" style="height:35px">服务评价</td>
              <td colspan="3" rowspan="1" style="height:35px">
                <el-rate v-model="submit.WLTS_THINK" show-text :texts="rateArray">
                </el-rate>
              </td>
            </tr>
          </table>
        </div>

        <div style="margin:0 auto; width:75px;">
          <br />
          <el-button type="success" v-show="isEdit" @click="_editSubmit()">确 定</el-button> <!-- 编辑时的按钮 -->
          <el-button type="success" v-show="isAdd" @click="_addSubmit()">提 交</el-button> <!-- 新增时的按钮 -->
        </div>

      </div>

      <div v-show="isCheck" style="margin-top:5px;font-weight:bold;">
        <table width="100%" border="0px" cellspacing="0px" cellpadding="0">
          <tr>
            <td style="width:10%">提交时间：</td>
            <td style="width:20%;margin-left:-30px;">{{ tableData.SUBMITTS| datatransDetail }}</td>
            <td style="width:10%">处理人：</td>
            <td style="width:20%">{{ tableData.OPERATOR }}</td>
          </tr>

          <tr>
            <td>处理时间：</td>
            <td>{{tableData.PROCESSTS| datatransDetail}}</td>
            <td>评价时间：</td>
            <td>{{ tableData.FEEDBACKTS| datatransDetail}}</td>
          </tr>
        </table>
      </div>
    </el-dialog>
  </div>
</template>


<script>
import {
  GetAllComplaintInfo,
  GetAllComplaint,
  addSubmit,
  editSubmit,
  CheckDetailByID,
  GetCustomerName,
  GetQtyDeliver,
  CheckOrderAndItemNo
} from "@/api/complaintASP";
import { mapMutations } from "vuex";
import Cookies from "js-cookie";
export default {
  name: "Complaint",
  data() {
    return {
      tableData: [],
      submit: [],
      CID: Cookies.get("cid"),     //账号id
      CNAME: Cookies.get("realName"),    //账号名
      beginTime: "",           //查询的开始时间
      finishTime: "",          //查询的结束时间
      SEARCHKEY: "",           //搜索栏关键字
      SELECT_STATUS: 2,       //存储下拉框的值
      isProcessed: false,     //已处理
      isFeedback: false,      //已评价
      isAdd: false,            //新增记录
      isEdit: false,           //编辑记录
      isCheck: false,          //查看记录
      companyId: Cookies.get("customerMainId"),//公司账号
      CUSTOMER_NAME: "",//公司名称  
      SALE_NO: "",//提货单号
      SALENO: "",//产品型号
      zongshuliang: "",//总数量
      complaintDetail: false,
      limit: 10,
      count: 0,
      currentPage: 1,
      rateArray: ["极差", "失望", "一般", "满意", "惊喜"],
      statusArray: [
        {
          label: "全部状态",
          value: 0
        },
        {
          label: "未处理",
          value: 1
        },
        {
          label: "已处理未评价",
          value: 2
        },
        {
          label: "已处理已评价",
          value: 3
        },
      ],
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
        },
      ],
      complaintData: [],
    };
  },
  created: function () {
    this.refresh();
    this._GetCustomerName();
  },
  filters: {
    transStatus(value) {
      switch (value) {
        case 1:
          return "未处理";
          break;
        case 2:
          return "已处理未评价";
          break;
        case 3:
          return "已处理已评价";
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
      };
    }
  },
  methods: {
    //获取所有的投诉信息
    _GetAllComplaintInfo() {
      this.complaintData = [];
      GetAllComplaintInfo().then(res => {
        this.complaintData = res.data
      }).catch((res) => {

      })
    },
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
        companyId: Cookies.get("customerMainId"),
        limit: this.limit,
        page: this.currentPage,
        CID: Cookies.get("cid"),
        beginTime: this.beginTime,
        finishTime: this.finishTime,
        STATUS: this.SELECT_STATUS,
        SEARCHKEY: this.SEARCHKEY,
      };
      if (!data.beginTime) {
        data.beginTime = "0001/1/1";
      }
      if (!data.finishTime) {
        data.finishTime = "9999/12/31";
      } else {
        data.finishTime = data.finishTime + " 23:59:59";
      }
      GetAllComplaint(data).then(res => {
        this.count = res.count;
        this.complaintData = res.data;
      });
    },
    //初始化新建投诉记录
    addRecord() {
      this.submit = {
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
        DINGDANHAO: "",  //b2b订单号
        SALENO: ""//产品型号
      },
        this.submit.SALE_NO = this.SALE_NO;
      this.submit.SALENO = this.SALENO;
      this.submit.CUSTOMER_CODE = Cookies.get("customerMainId");
      this.CNAME = Cookies.get("realName"); //客户名
      this.isAdd = true;
      this.complaintDetail = true;

    },
    //新建一条投诉记录
    _addRecord() {
      CheckOrderAndItemNo({ companyId: this.companyId, SALE_NO: this.SALE_NO, ITEM_NO: this.SALENO }).then(res => {
        if (res.data.length != 0) {
          this.$confirm("此前已对该订单该型号发起物流投诉，是否要再次投诉", "提示", {
            confirmButtonText: "确定",
            cancelButtonText: "取消",
            type: "warning"
          }).then(() => {
            this.addRecord();
          });
        }
        else {
          this.addRecord();
        }
      });
    },
    //新增投诉记录提交
    _addSubmit() {
      let data = this.submit;
      //判断是否填完所有信息
      if (
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
      if ((this.submit.TYPE == "破损" || this.submit.TYPE == "丢失") &&
        this.submit.DAMAGED_QUANTITY <= 0 &&
        this.submit.LOSED_QUANTITY <= 0
      ) {
        this.$alert("填写数量必须为正数", "提示", {
          confirmButtonText: "确定",
          type: "warning"
        });
        return;
      }
      addSubmit(data).then(res => {
        this.$alert("提交成功", "提示", {
          confirmButtonText: "确定",
          type: "success"
        });
        this.refresh();
      });
      this.complaintDetail = false;
    },
    //查看列表详情
    _CheckDetail(val) {
      this.tableData = [];
      let data = {
        SID: val
      };
      this.CNAME = Cookies.get("realName"),
        CheckDetailByID(data).then(res => {
          if (res.count > 0) {
            this.tableData = res.data[0];
          }
          this.isAdd = false,
            this.isEdit = false;
          this.isCheck = true;
          this.complaintDetail = true;
        })
    },
    //编辑列表详情
    _EditDetail(val) {
      let data = {
        SID: val
      };
      this.CNAME = Cookies.get("realName"),
        CheckDetailByID(data).then(res => {
          if (res.count > 0) {
            this.submit = res.data[0];
          }
          this.isAdd = false,
            this.isEdit = true;
          this.isCheck = false;
          this.complaintDetail = true;
        });
    },
    //编辑列表详情修改
    _editSubmit() {
      //判断是否填完所有信息
      if (
        this.submit.SALE_NO == "" ||
        this.submit.C_TRANSBILL == "" ||
        this.submit.TYPE == "" ||
        this.submit.PROCESSDESC == "" ||
        this.submit.WLTS_THINK == ""
      ) {
        this.$alert("请完善信息", "提示", {
          confirmButtonText: "确定",
          type: "warning"
        });
        return;
      }
      if (this.submit.DAMAGED_QUANTITY == "" || this.submit.DAMAGED_QUANTITY == null) {
        this.submit.DAMAGED_QUANTITY = 0;
      }
      if (this.submit.LOSED_QUANTITY == "" || this.submit.LOSED_QUANTITY == null) {
        this.submit.LOSED_QUANTITY = 0;
      }
      editSubmit(this.submit).then(res => {
        this.$alert("评价成功", "提示", {
          confirmButtonText: "确定",
          type: "success"
        });
        this.currentPage = 1;
        this.releaseBadge("complaint1");//刷新角标
        this.refresh();
      });
      this.complaintDetail = false;
    },
    //获取提货单号和产品型号
    GetSaleNoAndItemNo() {
      this.$prompt("请输入提货单号", "请确保输入的信息无误(注意空格)", {
        confirmButtonText: "确定",
        cancelButtonText: "取消"
      })
        .then(({ value }) => {
          this.SALE_NO = value.toUpperCase();
          this.$prompt("请输入产品型号", "请确保输入的信息无误(注意空格)", {
            confirmButtonText: "确定",
            cancelButtonText: "取消"
          }).then(({ value }) => {
            this.SALENO = value.toUpperCase();
            GetQtyDeliver({ CUSTOMER_CODE: this.companyId, SALE_NO: this.SALE_NO, ITEM_NO: this.SALENO }).then(res => {
              this.zongshuliang = res.data[0].QTY_DELIVER;
            });
          }).then(() => {
            this._addRecord();
          });
        })
        .catch(() => { });
    },
    _GetCustomerName() {
      GetCustomerName({ companyId: this.companyId }).then(res => {
        this.CUSTOMER_NAME = res.data[0].CUSTOMER_NAME;
      });

    },
    ...mapMutations("badge", ["addBadge", "releaseBadge"]),
  },
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
.table-c .el-input__inner {
  height: 19px;
  width: 100%;
  font-size: 15px;
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
  line-height: 19px;
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
</style>