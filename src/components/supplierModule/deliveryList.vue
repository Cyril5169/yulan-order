
<template>
  <div>
    <el-card shadow="hover">
      <div slot="header">
        <span class="fstrong f16">送货单</span>
      </div>
      <div id="tbar" class="tbarStyle">
        <el-date-picker type="date" format="yyyy-MM-dd" value-format="yyyy-MM-dd" placeholder="查询开始日期"
          v-model="beginTime" style="width:14%;"></el-date-picker>
        --
        <el-date-picker type="date" format="yyyy-MM-dd" value-format="yyyy-MM-dd" placeholder="查询截止日期"
          v-model="finishTime" style="width:14%;"></el-date-picker>

        <el-select v-model="SELECT_STATUS" style="margin-left:10px;width:160px;" placeholder="状态">
          <el-option v-for="item in statusArray" :key="item.label" :label="item.label" :value="item.value"></el-option>
        </el-select>
        <el-input @keyup.enter.native="search()" placeholder="请输入送货单号进行查询" v-model="SEARCHKEY"
          style="width:220px;margin-left:10px">
        </el-input>
        <el-button size="medium" type="success" style="margin-left:10px" @click="search()">查询</el-button>
        <el-button size="medium" type="primary" style="float:right" @click="_addRecord()">新增</el-button>
      </div>

      <div style="margin-top:10px">
        <el-table border :data="DeliverData" style="width: 100%;font-size:12px" class="table_1">
          <el-table-column prop="INVOICE_NO" label="送货单号" align="center" width="100px">
          </el-table-column>
          <el-table-column label="状态" align="center" width="65px">
            <template slot-scope="scope">
              {{ scope.row.INVOICE_STATUS | transStatus }}
            </template>
          </el-table-column>
          <el-table-column prop="LOGISTICS_COMPANY" label="物流公司" align="center" width="100px"></el-table-column>
          <el-table-column prop="LOGISTICS_NUMBER" label="物流单号" align="center" width="100px"></el-table-column>
          <el-table-column prop="AREA_DISTRICT" label="送货地址" align="center">
          </el-table-column>
          <el-table-column prop="PUR_NO" label="采购单号" align="center" width="110px">
          </el-table-column>
          <el-table-column prop="INVOICE_DATE" label="送货日期" align="center" width="90px">
            <template slot-scope="scope2">
              {{ scope2.row.INVOICE_DATE | datatrans }}
            </template>
          </el-table-column>
          <el-table-column prop="SUPPLY_LINKMAN" label="供应商联系人" align="center" width="100px">
          </el-table-column>
          <el-table-column prop="LINKMAN_TEL" label="电话" align="center" width="100px">
          </el-table-column>
          <el-table-column prop="REMARKS" label="备注" align="center" width="100px">
          </el-table-column>
          <el-table-column align="center" label="操作" width="60px">
            <template slot-scope="scope">
              <el-button @click="_CheckDetail(scope.row)" type="warning" size="mini" icon="el-icon-search" circle v-if="
                  scope.row.INVOICE_STATUS == 0 || scope.row.INVOICE_STATUS == 1 || scope.row.INVOICE_STATUS == 3 || scope.row.INVOICE_STATUS == 2
                "></el-button>
              <el-button @click="_EditDetail(scope.row)" type="primary" size="mini" icon="el-icon-edit" circle
                v-if="scope.row.INVOICE_STATUS == 4"></el-button>
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

    <el-dialog :visible.sync="lanjuDetail" :close-on-click-modal="false" width="70%">

      <!-- 查看区 -->
      <div v-show="isCheck">
        <div style="width:100%;text-align:center;font-size:20px">{{DeliverData_1.PUR_NO}} 送货单明细
          ({{DeliverData_1.INVOICE_STATUS | transStatus}})</div>
        <div v-if="DeliverData_1.INVOICE_STATUS == 3" style="font-size:20px;float:right;">
          未通过说明：{{DeliverData_1.REBACK_NOTES}}
        </div>
        <br>
        <table style="width:100%;text-align:center">
          <tr>
            <td style="width:12.5%">供应商联系人：</td>
            <td style="width:12.5%">
              {{DeliverData_1.SUPPLY_LINKMAN}}
            </td>
            <td style="width:12.5%">供应商联系电话：</td>
            <td style="width:12.5%">
              {{DeliverData_1.LINKMAN_TEL}}
            </td>
            <td style="width:12.5%">填写人：</td>
            <td style="width:12.5%">{{ DeliverData_1.CREATE_PERSON }}</td>
            <td style="width:12.5%">创建日期：</td>
            <td>{{ DeliverData_1.CREATE_DATE | datatrans }}</td>
          </tr>
        </table>

        <hr>
        <div class="checkTable">
          <table class="" style="width:100%;font-size:12px">
            <tr>
              <td style="width:12.5%">送货单号：</td>
              <td style="width:12.5%">{{ DeliverData_1.INVOICE_NO }}</td>
              <td style="width:12.5%">送货日期：</td>
              <td style="width:12.5%">{{ DeliverData_1.INVOICE_DATE | datatrans }}</td>
              <td style="width:12.5%">预计到货时间：</td>
              <td colspan="3">{{ DeliverData_1.EXPECT_ARRIVAL_DATE | datatrans }}</td>
            </tr>

            <tr>
              <td>物流单号：</td>
              <td>{{ DeliverData_1.LOGISTICS_NUMBER }}</td>
              <td>物流公司：</td>
              <td>{{ DeliverData_1.LOGISTICS_COMPANY }}</td>
              <td>物流联系人：</td>
              <td style="width:12.5%">{{ DeliverData_1.LOGISTICS_LINKMAN }}</td>
              <td style="width:12.5%">物流电话：</td>
              <td>{{ DeliverData_1.LOGISTICS_TEL }}</td>
            </tr>

            <tr>
              <td>送货地址：</td>
              <td colspan="3">{{ DeliverData_1.AREA_DISTRICT }}</td>
              <td>备注：</td>
              <td colspan="3">{{ DeliverData_1.REMARKS }}</td>
            </tr>
          </table>
        </div>
        <hr />
        <el-table :data="DetailData" border highlight-current-row style="width: 100%;font-weight:normal;font-size:12px"
          class="table_1">
          <el-table-column prop="ITEM_NO" label="物料编码" align="center" width="130px"></el-table-column>
          <el-table-column prop="NAMEE" label="物料名称" align="center" width="180px"></el-table-column>
          <el-table-column prop="INVOICE_QTY" label="送货数量" align="center" width="120px"></el-table-column>
          <el-table-column prop="UNIT1" label="单位" align="center" width="80px"></el-table-column>
          <el-table-column prop="MAT_BRAND" label="品牌" align="center" width="110px"></el-table-column>
          <el-table-column prop="GRADE" label="规格/型号" align="center" width="110px"></el-table-column>
          <el-table-column prop="NOTE" label="备注" align="center"></el-table-column>
        </el-table>
      </div>

      <!-- 编辑区 -->
      <div v-show="isEdit">
        <div style="width:100%;text-align:center;font-size:20px">{{editData.PUR_NO}} 送货单明细
          ({{editData.INVOICE_STATUS | transStatus}})</div>
        <div v-if="editData.INVOICE_STATUS == 3" style="font-size:20px;float:right;">未通过说明：{{editData.REBACK_NOTES}}
        </div>
        <br>

        <table style="width:100%;text-align:center">
          <tr>
            <td style="width:12.5%">供应商联系人：</td>
            <td style="width:12.5%">
              <input v-model="submit.SUPPLY_LINKMAN" clearable class="inputStyle" />
            </td>
            <td style="width:12.5%">供应商联系电话：</td>
            <td style="width:12.5%">
              <input v-model="submit.LINKMAN_TEL" clearable class="inputStyle" />
            </td>
            <td style="width:12.5%">填写人：</td>
            <td style="width:12.5%">{{ editData.CREATE_PERSON }}</td>
            <td style="width:12.5%">填写日期：</td>
            <td>{{ editData.CREATE_DATE | datatrans }}</td>
          </tr>
        </table>

        <hr>
        <div class="checkTable">
          <table style="width:100%;font-size:12px">
            <tr>
              <td style="width:12.5%">送货单号：</td>
              <td style="width:12.5%">{{ editData.INVOICE_NO }}</td>
              <td style="width:12.5%">送货日期：</td>
              <td style="width:12.5%">
                <el-date-picker clearable type="date" format="yyyy-MM-dd" value-format="yyyy-MM-dd"
                  v-model="ruleForm_1.dateValue" style="width:100%;">
                </el-date-picker>
              </td>
              <td style="width:12.5%">预计到货时间：</td>
              <td colspan="3">
                <el-date-picker clearable type="date" format="yyyy-MM-dd" value-format="yyyy-MM-dd"
                  v-model="ruleForm_4.dateValue" style="width:100%;">
                </el-date-picker>
              </td>
            </tr>

            <tr>
              <td>物流单号<span style="color:red;font-size:15px">*</span>：</td>
              <td>
                <input v-model="submit.LOGISTICS_NUMBER" clearable class="inputStyle" />
              </td>
              <td>物流公司<span style="color:red;font-size:15px">*</span>：</td>
              <td>
                <input v-model="submit.LOGISTICS_COMPANY" clearable class="inputStyle" />
              </td>
              <td>物流联系人<span style="color:red;font-size:15px">*</span>：</td>
              <td style="width:12.5%">
                <input v-model="submit.LOGISTICS_LINKMAN" clearable class="inputStyle" />
              </td>

              <td style="width:12.5%">物流联系电话<span style="color:red;font-size:15px">*</span>：</td>
              <td>
                <input v-model="submit.LOGISTICS_TEL" clearable class="inputStyle" />
              </td>
            </tr>

            <tr>
              <td>送货地址：</td>
              <td colspan="3">
                <input v-model="submit.AREA_DISTRICT" clearable class="inputStyle" />
              </td>
              <td>备注：</td>
              <td colspan="3">
                <input v-model="submit.REMARKS" clearable class="inputStyle" />
              </td>
            </tr>
          </table>
        </div>
        <hr />
        <el-table :data="DetailData_1" border highlight-current-row
          style="width: 100%;font-weight:normal;font-size:12px" class="table_1">
          <el-table-column prop="ITEM_NO" label="物料编码" align="center" width="130px"></el-table-column>
          <el-table-column prop="NAMEE" label="物料名称" align="center" width="180px"></el-table-column>
          <el-table-column label="送货数量" align="center" width="140px">
            <template slot-scope="scope">
              <el-input-number v-model="scope.row.INVOICE_QTY" size="mini" controls-position="right" :min="0"
                :max="scope.row.max_qty"></el-input-number>
            </template>
          </el-table-column>
          <el-table-column prop="UNIT1" label="单位" align="center" width="80px"></el-table-column>
          <el-table-column prop="MAT_BRAND" label="品牌" align="center" width="130px"></el-table-column>
          <el-table-column prop="GRADE" label="规格/型号" align="center" width="130px"></el-table-column>
          <el-table-column label="备注" align="center">
            <template slot-scope="scope">
              <el-input size="mini" v-model="scope.row.NOTE" clearable></el-input>
            </template>
          </el-table-column>
        </el-table>
        <div v-if="editData.INVOICE_STATUS == 4">
          <el-button style="margin-left:40%;margin-top:10px" class="trueButton" @click="Delete">删除送货单</el-button>
          <el-button class="trueButton" @click="isTrueEdit">确认修改</el-button>
        </div>
      </div>
    </el-dialog>

    <el-dialog title="新增送货单" :visible.sync="DeliverDetail" :close-on-click-modal="false" width="80%">
      <el-dialog width="80%" title="采购单明细" :visible.sync="innerVisible" append-to-body>
        <el-table :data="PURData" @selection-change="handleSelectionChange" border highlight-current-row
          style="width: 100%;font-weight:normal;font-size:12px" class="table_1">
          <el-table-column type="selection" width="40" class="text-align:center"></el-table-column>
          <el-table-column prop="ITEM_NO" label="编码" align="center" width="110px"></el-table-column>
          <el-table-column prop="MNAME" label="名称" align="center" width="150px"></el-table-column>
          <el-table-column prop="GRADE" label="规格" align="center" width="80px"></el-table-column>
          <el-table-column prop="PRICE_TAXIN" label="含税单价" align="center" width="80px"></el-table-column>
          <el-table-column prop="TOTAL_MONEY" label="金额" align="center" width="70px"></el-table-column>
          <el-table-column prop="PRODUCT_NOTE" label="制作说明" align="center" width="100px"></el-table-column>
          <el-table-column prop="NOTES" label="备注" align="center" min-width="250px"></el-table-column>
          <el-table-column prop="QTY_PUR" label="待送货数量" align="center" width="85px"></el-table-column>
          <el-table-column prop="QTY" label="已送货数量" align="center" width="100px"></el-table-column>
          <el-table-column label="约定日期" align="center" width="90px">
            <template slot-scope="scope1">
              {{ scope1.row.DATE_REG | datatrans }}
            </template>
          </el-table-column>
          <el-table-column label="送货日期" align="center" width="90px">
            <template slot-scope="scope2">
              {{ scope2.row.DATE_DELIVER | datatrans }}
            </template>
          </el-table-column>
        </el-table>
        <div style="margin-left:45%;margin-top:10px">
          <el-button @click="isTrue" class="trueButton">确认</el-button>
        </div>
      </el-dialog>
      <div>
        <el-input @keyup.enter.native="searchPUR()" placeholder="请输入采购单号" v-model="find"
          style="width:280px;float:left;margin-top:-15px;margin-bottom:5px" clearable>
          <el-button @click="searchPUR()" class="button_1" slot="append" icon="el-icon-search">搜索</el-button>
        </el-input>
      </div>

      <!-- 新增 -->
      <table style="width:100%;text-align:center">
        <tr>
          <td style="width:12.5%">供应商联系人：</td>
          <td style="width:12.5%">
            <input v-model="submitForm.SUPPLY_LINKMAN" clearable class="inputStyle" />
          </td>
          <td style="width:12.5%">供应商联系电话：</td>
          <td style="width:12.5%">
            <input v-model="submitForm.LINKMAN_TEL" clearable class="inputStyle" />
          </td>
          <td style="width:12.5%">填写人：</td>
          <td>{{ editData.CREATE_PERSON  }}</td>
          <td style="width:12.5%">创建日期：</td>
          <td></td>
        </tr>
      </table>

      <hr />
      <div v-show="isAdd" class="table-c">
        <table style="width:100%">
          <tr>
            <td style="width:12.5%">送货单号：</td>
            <td style="width:12.5%"></td>
            <td style="width:12.5%">送货日期：</td>
            <td>
              <el-date-picker type="date" format="yyyy-MM-dd" value-format="yyyy-MM-dd" v-model="ruleForm_2.dateValue"
                style="width:100%"></el-date-picker>
            </td>
            <td style="width:12.5%">预计到货时间：</td>
            <td colspan="3">
              <el-date-picker type="date" format="yyyy-MM-dd" value-format="yyyy-MM-dd" v-model="ruleForm_3.dateValue"
                style="width:100%"></el-date-picker>
            </td>
          </tr>

          <tr>
            <td>物流单号<span style="color:red;font-size:15px">*</span>：</td>
            <td>
              <input v-model="submitForm.logistics_number" clearable class="inputStyle" />
            </td>
            <td>物流公司<span style="color:red;font-size:15px">*</span>：</td>
            <td>
              <input v-model="submitForm.logistics_company" clearable class="inputStyle" />
            </td>
            <td>物流联系人<span style="color:red;font-size:15px">*</span>：</td>
            <td style="width:12.5%">
              <input v-model="submitForm.LOGISTICS_LINKMAN" clearable class="inputStyle" />
            </td>
            <td style="width:12.5%">
              物流电话<span style="color:red;font-size:15px">*</span>：
            </td>
            <td>
              <input v-model="submitForm.LOGISTICS_TEL" clearable class="inputStyle" />
            </td>
          </tr>

          <tr>
            <td>送货地址：</td>
            <td colspan="3">
              <input v-model="submitForm.area_district" clearable class="inputStyle" />
            </td>
            <td>备注：</td>
            <td colspan="3">
              <input v-model="submitForm.remarks" clearable class="inputStyle" />
            </td>
          </tr>
        </table>

        <hr />
        <el-table :data="multipleSelection_2" border highlight-current-row
          style="width: 100%;font-weight:normal;font-size:12px" class="table_1">
          <el-table-column type="index" width="45px" label="序号" align="center">
          </el-table-column>
          <el-table-column prop="PUR_NO" label="采购单号" align="center" width="100px"></el-table-column>
          <el-table-column prop="ITEM_NO" label="编码" align="center" width="110px"></el-table-column>
          <el-table-column prop="NAMEE" label="名称" align="center" width="180px"></el-table-column>
          <el-table-column prop="GRADE" label="规格" align="center" width="90px"></el-table-column>
          <el-table-column label="送货数量" align="center" width="155px">
            <template slot-scope="scope">
              <el-input-number v-model="scope.row.INVOICE_QTY" size="mini" controls-position="right" :min="0"
                :max="scope.row.max_qty"></el-input-number>
            </template>
          </el-table-column>
          <el-table-column prop="PRODUCT_NOTE" label="制作说明" align="center" width="120px"></el-table-column>
          <el-table-column label="备注" align="center" min-width="300px">
            <template slot-scope="scope">
              <el-input v-model="scope.row.NOTE" clearable></el-input>
            </template>
          </el-table-column>
          <el-table-column prop="QTY" label="已送货数量" align="center" width="100px"></el-table-column>
          <el-table-column label="约定日期" align="center" width="100px">
            <template slot-scope="scope1">
              {{ scope1.row.DATE_REG | datatrans }}
            </template>
          </el-table-column>
          <el-table-column label="送货日期" align="center" width="120px">
            <template slot-scope="scope2">
              {{ scope2.row.DATE_DELIVER | datatrans }}
            </template>
          </el-table-column>
        </el-table>
      </div>
      <div style="margin-left:45%;margin-top:10px">
        <el-button @click="isAddTrue" class="trueButton">保存</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import {
  GetAllData,
  CheckDetailByID,
  addSubmit,
  editByCustomer
} from "@/api/lanju";
import {
  GetRelativeDelivery,
  GetDeliveryDetail,
  GetPoDetail_1,
  AddDelivery,
  UpdateDelivery,
  DeleteDelivery
} from "@/api/supplierASP";
import { UploadFiles } from "@/api/imageStoreASP";
import { downLoadFile } from "@/common/js/downLoadFile";
import Cookies from "js-cookie";
const Head = "http://14.29.223.114:10250/upload";

export default {
  name: "DeliveryList",
  data() {
    return {
      reback_notes: "",
      max_qty: [],
      editData: [],
      submit: {
        INVOICE_STATUS: "",
        INVOICE_DATE: "",
        CREATE_DATE: "",
        CREATE_PERSON: "",
        LOGISTICS_COMPANY: "",
        LOGISTICS_NUMBER: "",
        AREA_DISTRICT: "",
        REMARKS: "",
        SUPPLY_LINKMAN: "",
        LINKMAN_TEL: "",
        EXPECT_ARRIVAL_DATE: "",
        LOGISTICS_LINKMAN: "",
        LOGISTICS_TEL: ""
      },
      newStatus: 2,
      editStatus: 1,
      multipleSelection_2: [],
      multipleSelection_1: [],
      invoice_id: 0,
      ruleForm_1: { dateValue: "" },
      ruleForm_2: { dateValue: "" },
      ruleForm_3: { dateValue: "" },
      ruleForm_4: { dateValue: "" },
      multipleSelection: [],
      innerVisible: false,
      PURData: [],
      find: "",
      DeliverData_2: [],
      DetailData_1: [],
      DetailData_2: [],
      DeliverDetail: false,
      DetailData: [],
      DeliverData_1: [],
      DeliverData: [],
      dateStamp: "",
      fileChange: false,
      deleteFile: [],
      subtractDeleteFile: [], //点击减号准备删除明细，预删除的文件集合
      deleteIndex: [], //删除文件对应的明细的索引
      btnDisable: false,
      companyId: "",
      CID: Cookies.get("cid"), //客户账号
      CNAME: "", //客户名
      beginTime: "", //查询的开始时间
      finishTime: "", //查询的结束时间
      SEARCHKEY: "", //搜索栏关键字
      SELECT_STATUS: "", //存储下拉框的值
      CONFIRM_STATUS: "",
      rowPlus: 0, //兰居软装设计需求表中的户型编辑项添加数
      isAdd: false, //新增记录
      isEdit: false, //编辑记录
      isCheck: false, //查看记录
      initRowspan: 5, //基本信息中的初始行数
      usedRowspan: 5, //基本信息中的行数
      fileListGM: [], //广美上传的文件集合
      successCount: 0,
      allCount: 0,
      ServiceDetail: false,
      lanjuDetail: false,
      limit: 10,
      count: 0,
      detailCount: 0, //新增户型记录数
      currentPage: 1,
      statusArray: [
        {
          label: "全部",
          value: ""
        },
        {
          label: "已通过",
          value: "1"
        },
        {
          label: "待确认",
          value: "2"
        },
        {
          label: "未通过",
          value: "3"
        }
      ],
      lanjuData: [],
      submitForm: [], //提交的表头信息
      submitDetailForm: [] //提交的明细信息
    };
  },
  created: function() {
    let time = new Date();
    this.refresh();
  },
  mounted() {
    // 初始化查询，默认为前一天
    this.ruleForm_2.dateValue = this.timeDefault_2;
    this.ruleForm_3.dateValue = this.timeDefault_3;
  },
  computed: {
    timeDefault_2() {
      var date = new Date();
      var s1 =
        date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate();
      return s1;
    },
    timeDefault_3() {
      var date = new Date();
      var s1 =
        date.getFullYear() +
        "-" +
        (date.getMonth() + 1) +
        "-" +
        (date.getDate() + 3);
      return s1;
    }
  },
  filters: {
    transStatus(value) {
      switch (value) {
        case 0:
          return "全部";
          break;
        case 1:
          return "已通过";
          break;
        case 2:
          return "待确认";
          break;
        case 3:
          return "未通过";
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
    }
  },
  methods: {
    //确认新增
    isAddTrue() {
      //判断是否填完所有信息
      if (
        this.submitForm.logistics_company == "" ||
        this.submitForm.area_district == "" ||
        this.submitForm.logistics_number == "" ||
        this.submitForm.LOGISTICS_LINKMAN == "" ||
        this.submitForm.LOGISTICS_TEL == ""
      ) {
        this.$alert("请完善送货信息", "提示", {
          confirmButtonText: "确定",
          type: "warning"
        });
        return;
      }
      this.isAdd = false;
      this.DeliverDetail = false;
      this.submitForm.PUR_NO = this.multipleSelection_1[0].PUR_NO;
      this.submitForm.INVOICE_DATE = this.ruleForm_2.dateValue;
      this.submitForm.EXPECT_ARRIVAL_DATE = this.ruleForm_3.dateValue;
      this.submitForm.INVOICE_STATUS = this.newStatus;

      AddDelivery({
        headForm: this.submitForm,
        gridData: this.multipleSelection_2,
        cid: Cookies.get("companyId")
      }).then(res => {
        if (res.code == "0") {
          this.$alert("保存成功", "提示", {
            confirmButtonText: "确定",
            type: "success"
          });
          this.search();
        } else {
          this.$alert("保存失败，请尝试刷新重试", "提示", {
            confirmButtonText: "确定",
            type: "success"
          });
        }
      });
    },
    //确认采购单
    isTrue() {
      this.innerVisible = false;
      this.getData();
    },
    //采购单详情的选择
    handleSelectionChange(val) {
      this.multipleSelection = val;
    },
    //采购单的字段改变
    getData() {
      this.multipleSelection_1 = this.multipleSelection;
      for (var i = 0; i < this.multipleSelection_1.length; i++) {
        this.multipleSelection_2[i] = {
          ITEM_NO: this.multipleSelection_1[i].ITEM_NO,
          INVOICE_QTY: this.multipleSelection_1[i].QTY_PUR,
          max_qty: this.multipleSelection_1[i].QTY_PUR,
          //PRICE :this.multipleSelection_1[i].PRICE1,
          MONEY1: this.multipleSelection_1[i].TOTAL_MONEY,
          //this.multipleSelection.MONEY_TAX =val.MONEY_TAX;
          PRICE_TAXIN: this.multipleSelection_1[i].PRICE_TAXIN,
          TOTAL_AMOUNT: this.multipleSelection_1[i].TOTAL_MONEY,
          UNIT1: this.multipleSelection_1[i].UNIT1,
          //WEIGHT1:this.multipleSelection_1[i].WEIGHT,
          NAMEE: this.multipleSelection_1[i].MNAME,
          GRADE: this.multipleSelection_1[i].GRADE,
          //this.multipleSelection.QTY_BACK =val.PUR_ID;
          //this.multipleSelection.FREE_ITEM =val.PUR_ID;
          NOTE: this.multipleSelection_1[i].NOTES,
          PUR_ID: this.multipleSelection_1[i].PUR_ID,
          PUR_NO: this.multipleSelection_1[i].PUR_NO,
          PRODUCT_NOTE: this.multipleSelection_1[i].PRODUCT_NOTE,
          QTY: this.multipleSelection_1[i].QTY,
          DATE_REG: this.multipleSelection_1[i].DATE_REG,
          DATE_DELIVER: this.multipleSelection_1[i].DATE_DELIVER
          //REBACK_QTY:0
        };
        this.$set(this.multipleSelection_2, i, this.multipleSelection_2[i]);
      }
    },
    //采购单搜索
    searchPUR() {
      if (this.find.length == "") {
        this.$alert("请输入采购单号", "提示", {
          confirmButtonText: "确定",
          type: "warning"
        });
      } else {
        var data = {
          PUR_NO: this.find
        };
        GetPoDetail_1(data).then(res => {
          this.PURData = res.data;
          if (res.data.length == 0) {
            this.$alert("采购单未确认", "提示", {
              confirmButtonText: "确定",
              type: "warning"
            });
            return;
          } else {
            this.innerVisible = true;
            this.PURData = res.data;
            this.submitForm.SUPPLY_LINKMAN = res.data[0].G_LINK;
            this.submitForm.LINKMAN_TEL = res.data[0].HANDSET;
          }
        });
      }
    },
    //表头模糊搜索
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
    //翻页获取信息
    handleCurrentChange(val) {
      this.currentPage = val;
      this.refresh();
    },
    //查询表头
    refresh() {
      var data = {
        companyId: Cookies.get("companyId"),
        limit: this.limit,
        page: this.currentPage,
        beginTime: this.beginTime,
        finishTime: this.finishTime,
        status: this.SELECT_STATUS,
        find: this.SEARCHKEY,
        confirm_status: this.CONFIRM_STATUS
      };
      if (!data.beginTime) {
        data.beginTime = "0001/1/1";
      }
      if (!data.finishTime) {
        data.finishTime = "9999/12/31";
      } else {
        data.finishTime = data.finishTime + " 23:59:59";
      }
      GetRelativeDelivery(data).then(res => {
        this.count = res.count;
        this.DeliverData = res.data;
      });
    },
    //点击新建采购单
    _addRecord() {
      this.invoice_id = 0;
      this.isAdd = true;
      this.DeliverDetail = true;
      this.isEdit = false;
      this.find = "";
      this.submitForm = {
        create_person: "",
        logistics_company: "",
        logistics_number: "",
        area_district: "东莞市莞龙路段狮龙路莞城科技园",
        remarks: "",
        PUR_NO: "",
        INVOICE_DATE: "",
        INVOICE_STATUS: 0,
        SUPPLY_LINKMAN: "",
        LINKMAN_TEL: "",
        SUPPLY_CODE: "",
        EXPECT_ARRIVAL_DATE: "",
        LOGISTICS_LINKMAN: "",
        LOGISTICS_TEL: "",
        CONFIRM_STATUS: 2
      };
      this.multipleSelection = [];
      this.multipleSelection_1 = [];
      this.multipleSelection_2 = [];
    },
    //查看送货单列表详情
    _CheckDetail(val) {
      this.isCheck = true;
      this.lanjuDetail = true;
      this.isEdit = false;
      let data = {
        INVOICE_NO: val.INVOICE_NO, //送货单号
        INVOICE_DATE: val.INVOICE_DATE, //送货日期
        CREATE_DATE: val.CREATE_DATE, //创建日期
        CREATE_PERSON: val.CREATE_PERSON, //创建人
        LOGISTICS_COMPANY: val.LOGISTICS_COMPANY, //物流公司
        LOGISTICS_NUMBER: val.LOGISTICS_NUMBER, //物流单号
        AREA_DISTRICT: val.AREA_DISTRICT, //详细地址
        REMARKS: val.REMARKS, //备注
        SUPPLY_LINKMAN: val.SUPPLY_LINKMAN, //供应商联系人
        LINKMAN_TEL: val.LINKMAN_TEL, //供应商联系人电话
        PUR_NO: val.PUR_NO, //采购单号
        EXPECT_ARRIVAL_DATE: val.EXPECT_ARRIVAL_DATE, //预计到货时间
        LOGISTICS_LINKMAN: val.LOGISTICS_LINKMAN, //物流联系人
        LOGISTICS_TEL: val.LOGISTICS_TEL, //物流联系电话
        INVOICE_STATUS: val.INVOICE_STATUS, //送货状态
        CONFIRM_STATUS: val.CONFIRM_STATUS,
        REBACK_NOTES: val.REBACK_NOTES
      };
      this.DeliverData_1 = data;
      var data_1 = {
        deliverNo: val.INVOICE_NO
      };
      GetDeliveryDetail(data_1).then(res => {
        this.DetailData = res.data;
      });
    },
    //编辑状态下查看列表详情
    _EditDetail(val) {
      this.isEdit = true;
      this.isCheck = false;
      this.lanjuDetail = true;
      this.submit.INVOICE_STATUS = val.INVOICE_STATUS;
      this.submit.CONFIRM_STATUS = val.CONFIRM_STATUS;
      this.submit.REBACK_NOTES = val.REBACK_NOTES;
      this.submit.INVOICE_NO = val.INVOICE_NO;
      this.ruleForm_1.dateValue = this.$options.filters.datatrans(
        val.INVOICE_DATE
      );
      this.submit.INVOICE_DATE = this.$options.filters.datatrans(
        val.INVOICE_DATE
      );
      this.submit.CREATE_DATE = val.CREATE_DATE;
      this.submit.CREATE_PERSON = val.CREATE_PERSON;
      this.submit.LOGISTICS_COMPANY = val.LOGISTICS_COMPANY;
      this.submit.LOGISTICS_NUMBER = val.LOGISTICS_NUMBER;
      this.submit.AREA_DISTRICT = val.AREA_DISTRICT;
      this.submit.REMARKS = val.REMARKS;
      this.submit.SUPPLY_LINKMAN = val.SUPPLY_LINKMAN;
      this.submit.LINKMAN_TEL = val.LINKMAN_TEL;
      this.ruleForm_4.dateValue = this.$options.filters.datatrans(
        val.EXPECT_ARRIVAL_DATE
      );
      this.submit.EXPECT_ARRIVAL_DATE = this.$options.filters.datatrans(
        val.EXPECT_ARRIVAL_DATE
      );
      this.submit.LOGISTICS_LINKMAN = val.LOGISTICS_LINKMAN;
      this.submit.LOGISTICS_TEL = val.LOGISTICS_TEL;
      let data = {
        INVOICE_NO: val.INVOICE_NO, //送货单号
        INVOICE_DATE: val.INVOICE_DATE, //送货日期
        CREATE_DATE: val.CREATE_DATE, //创建日期
        CREATE_PERSON: val.CREATE_PERSON, //创建人
        LOGISTICS_COMPANY: val.LOGISTICS_COMPANY, //物流公司
        LOGISTICS_NUMBER: val.LOGISTICS_NUMBER, //物流单号
        AREA_DISTRICT: val.AREA_DISTRICT, //详细地址
        REMARKS: val.REMARKS, //备注
        SUPPLY_LINKMAN: val.SUPPLY_LINKMAN, //供应商联系人
        LINKMAN_TEL: val.LINKMAN_TEL, //供应商联系人电话
        PUR_NO: val.PUR_NO, //采购单号
        PUR_ID: val.PUR_ID,
        INVOICE_STATUS: val.INVOICE_STATUS,
        CONFIRM_STATUS: val.CONFIRM_STATUS,
        REBACK_NOTES: val.REBACK_NOTES
      };
      this.editData = data;
      var data_1 = {
        deliverNo: val.INVOICE_NO
      };
      GetDeliveryDetail(data_1).then(res => {
        this.DetailData = res.data;
        for (var i = 0; i < this.DetailData.length; i++) {
          this.DetailData_1[i] = {
            ITEM_NO: this.DetailData[i].ITEM_NO, //物料编码
            INVOICE_QTY: this.DetailData[i].INVOICE_QTY, //数量
            max_qty: this.DetailData[i].INVOICE_QTY, //最大数量
            INVOICE_ID: this.DetailData[i].INVOICE_ID,
            MONEY1: this.DetailData[i].MONEY1,
            PRICE_TAXIN: this.DetailData[i].PRICE_TAXIN,
            TOTAL_AMOUNT: this.DetailData[i].TOTAL_AMOUNT,
            UNIT1: this.DetailData[i].UNIT1,
            NAMEE: this.DetailData[i].NAMEE, //名称
            GRADE: this.DetailData[i].GRADE, //品牌
            NOTE: this.DetailData[i].NOTE, //备注
            PUR_ID: this.DetailData[i].PUR_ID,
            PUR_NO: this.DetailData[i].PUR_NO,
            PRODUCT_NOTE: this.DetailData[i].PRODUCT_NOTE,
            QTY: this.DetailData[i].QTY,
            DATE_REG: this.DetailData[i].DATE_REG,
            DATE_DELIVER: this.DetailData[i].DATE_DELIVER
          };
          this.$set(this.DetailData_1, i, this.DetailData_1[i]);
        }
      });
    },
    //删除
    Delete() {
      var data = {
        invoice_no: this.submit.INVOICE_NO
      };
      DeleteDelivery(data).then(res => {
        this.search();
      });
      this.lanjuDetail = false;
    },
    //编辑
    isTrueEdit() {
      this.lanjuDetail = false;
      this.submit.INVOICE_STATUS = this.newStatus;
      this.submit.CONFIRM_STATUS = 2;
      if (this.ruleForm_1.dateValue !== this.submit.INVOICE_DATE) {
        this.submit.INVOICE_DATE = this.ruleForm_1.dateValue;
      }
      if (this.ruleForm_4.dateValue !== this.submit.EXPECT_ARRIVAL_DATE) {
        this.submit.EXPECT_ARRIVAL_DATE = this.ruleForm_4.dateValue;
      }
      UpdateDelivery({
        headForm: this.submit,
        gridData: this.DetailData_1,
        cid: Cookies.get("companyId")
      }).then(res => {
        if (res.code == "0") {
          this.$alert("保存成功", "提示", {
            confirmButtonText: "确定",
            type: "success"
          });
          this.search();
        }
      });
    }
  }
};
</script>

<style>
.table_1 .el-table__row {
  height: 6px;
}
</style>

 <style scoped>
.trueButton {
  background: #8bc34a;
  color: rgb(255, 255, 255);
}
.button_1 {
  background: #8bc34a;
  color: rgb(255, 255, 255);
}
.checkTable table {
  border-right: 1px solid black;
  border-bottom: 1px solid black;
}
.checkTable table td {
  border-left: 1px solid black;
  border-top: 1px solid black;
  font-size: 14px;
  height: 30px;
  text-align: center;
}
.table-c table {
  border-right: 1px solid black;
  border-bottom: 1px solid black;
}
.table-c table td {
  border-left: 1px solid black;
  border-top: 1px solid black;
  height: 35px;
  text-align: center;
  font-size: 14px;
}
.tbarStyle {
  margin-bottom: 13px;
}
.inputStyle {
  height: 100%;
  width: 100%;
  font-size: 16px;
  text-align: center;
  border: 1px solid #dcdfe6;
  box-sizing: border-box;
}
</style>