
<template>
  <div>
    <el-card shadow="hover">
      <div class="tbarStyle">
        <el-date-picker type="date" format="yyyy-MM-dd" value-format="yyyy-MM-dd" placeholder="查询开始日期"
          v-model="beginTime" style="width:14%;"></el-date-picker>
        --
        <el-date-picker type="date" format="yyyy-MM-dd" value-format="yyyy-MM-dd" placeholder="查询截止日期"
          v-model="finishTime" style="width:14%;"></el-date-picker>
        <el-select v-model="confirm_status" style="margin-left:10px;width:160px;" placeholder="状态">
          <el-option v-for="item in statusArray" :key="item.label" :label="item.label" :value="item.value"></el-option>
        </el-select>
        <el-input @keyup.enter.native="search()" placeholder="请输入送货单号进行查询" v-model="SEARCHKEY"
          style="width:220px;margin-left:10px">
        </el-input>
        <el-button size="medium" type="success" style="margin-left:10px" @click="search()">查询</el-button>
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
          <el-table-column prop="INVOICE_DATE" label="发货日期" align="center" width="90px">
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
                 (scope.row.INVOICE_STATUS == 1 || scope.row.CONFIRM_STATUS == 3)  && (scope.row.CONFIRM_STATUS == 0 || scope.row.CONFIRM_STATUS == 1 || scope.row.CONFIRM_STATUS == 3 )
                "></el-button>
              <el-button @click="_EditDetail(scope.row)" type="primary" size="mini" icon="el-icon-edit" circle
                v-if="scope.row.INVOICE_STATUS == 2 && (scope.row.CONFIRM_STATUS == 2 || scope.row.CONFIRM_STATUS == 3)">
              </el-button>
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

    <el-dialog :visible.sync="lanjuDetail" :close-on-click-modal="false" width="80%">
      <el-dialog width="30%" :visible.sync="rebackVisible" append-to-body>
        <div style="width:100%;text-align:center;font-size:20px">{{submitForm.PUR_NO}} 未通过说明</div>
        <div style="margin-top:10px">
          <el-input v-model="reback_notes_1" placeholder="请输入未通过说明:" tyle="width:30%;height:150PX" clearable>
          </el-input>
        </div>
        <el-button style="margin-left:40%;margin-top:10px" class="trueButton" @click="rebackTure">确认</el-button>
      </el-dialog>
      <!-- 查看区 -->
      <div v-show="isCheck">
        <div style="width:100%;text-align:center;font-size:20px">{{submitForm.PUR_NO}} 送货单明细
          ({{submitForm.CONFIRM_STATUS | transStatus}})</div>
        <div v-if="submitForm.CONFIRM_STATUS == 3" style="font-size:20px;float:right;">
          未通过说明：{{submitForm.REBACK_NOTES}}</div>
        <br>
        <table style="width:100%;text-align:center">
          <tr>
            <td style="width:12.5%"><span style="font-weight:bold">供应商联系人：</span></td>
            <td style="width:12.5%">
              {{submitForm.SUPPLY_LINKMAN}}
            </td>
            <td style="width:12.5%"><span style="font-weight:bold">供应商联系电话：</span></td>
            <td style="width:12.5%">
              {{submitForm.LINKMAN_TEL}}
            </td>
            <td style="width:12.5%"><span style="font-weight:bold">填写人：</span></td>
            <td style="width:12.5%">{{ submitForm.CREATE_PERSON }}</td>
            <td style="width:12.5%"><span style="font-weight:bold">填写时间：</span></td>
            <td>{{ submitForm.CREATE_DATE | datatrans }}</td>
          </tr>
        </table>

        <hr>
        <div class="checkTable">
          <table class="" style="width:100%;font-size:12px">
            <tr>
              <td style="width:12.5%">发货单号：</td>
              <td style="width:12.5%">{{ submitForm.INVOICE_NO }}</td>
              <td style="width:12.5%">发货日期：</td>
              <td style="width:12.5%">{{ submitForm.INVOICE_DATE | datatrans }}</td>
              <td style="width:12.5%">预计到货时间：</td>
              <td style="width:12.5%">{{ submitForm.EXPECT_ARRIVAL_DATE | datatrans }}</td>
              <td style="width:12.5%">客户代码：</td>
              <td>{{ submitForm.CUSTOMER_CODE }}</td>
            </tr>

            <tr>
              <td>物流单号：</td>
              <td>{{ submitForm.LOGISTICS_NUMBER }}</td>
              <td>物流公司：</td>
              <td>{{ submitForm.LOGISTICS_COMPANY }}</td>
              <td>物流联系人：</td>
              <td>{{ submitForm.LOGISTICS_LINKMAN }}</td>
              <td>物流电话：</td>
              <td>{{ submitForm.LOGISTICS_TEL }}</td>
            </tr>

            <tr>
              <td>物流费用(元)：</td>
              <td>{{ submitForm.LOGISTICS_FEE }}</td>
              <td>件数：</td>
              <td>{{ submitForm.NUMBER_OF_PIECES }}</td>
              <td>总重量(kg)：</td>
              <td>{{ submitForm.WEIGHT }}</td>
              <td></td>
              <td></td>
            </tr>

            <tr>
              <td>送货地址：</td>
              <td colspan="3">{{ submitForm.AREA_DISTRICT }}</td>
              <td>备注：</td>
              <td colspan="3">{{ submitForm.REMARKS }}</td>
            </tr>
          </table>
        </div>
        <hr />
        <el-table :data="DetailData" border highlight-current-row style="width: 100%;font-weight:normal;font-size:12px"
          class="table_1">
          <el-table-column prop="ITEM_NO" label="物料编码" align="center" width="180px"></el-table-column>
          <el-table-column prop="NAMEE" label="物料名称" align="center" width="180px"></el-table-column>
          <el-table-column prop="INVOICE_QTY" label="发货数量" align="center" width="150px"></el-table-column>
          <el-table-column prop="UNIT1" label="单位" align="center" width="80px"></el-table-column>
          <el-table-column prop="MAT_BRAND" label="品牌" align="center" width="110px"></el-table-column>
          <el-table-column prop="GRADE" label="规格/型号" align="center" width="110px"></el-table-column>
          <el-table-column prop="NOTE" label="备注" align="center"></el-table-column>
        </el-table>
      </div>
      <!-- 编辑区 -->
      <div v-show="isEdit">
        <div style="width:100%;text-align:center;font-size:20px">{{submitForm.PUR_NO}} 送货单明细
          ({{submitForm.CONFIRM_STATUS | transStatus}})</div>
        <br>
        <table style="width:100%;text-align:center">
          <tr>
            <td style="width:12.5%"><span style="font-weight:bold">供应商联系人：</span></td>
            <td style="width:12.5%">
              <input v-model="submitForm.SUPPLY_LINKMAN" class="inputStyle" />
            </td>
            <td style="width:12.5%"><span style="font-weight:bold">供应商联系电话：</span></td>
            <td style="width:12.5%">
              <input v-model="submitForm.LINKMAN_TEL" class="inputStyle" />
            </td>
            <td style="width:12.5%"><span style="font-weight:bold">填写人：</span></td>
            <td style="width:12.5%">
              <input v-model="submitForm.CREATE_PERSON" class="inputStyle" />
            </td>
            <td style="width:12.5%"><span style="font-weight:bold">填写时间：</span></td>
            <td>{{ submitForm.CREATE_DATE | datatrans }}</td>
          </tr>
        </table>

        <hr>
        <div class="checkTable">
          <table style="width:100%;font-size:12px">
            <tr>
              <td style="width:12.5%">发货单号：</td>
              <td style="width:12.5%">{{ submitForm.INVOICE_NO }}</td>
              <td style="width:12.5%">发货日期：</td>
              <td style="width:12.5%">
                <el-date-picker type="date" format="yyyy-MM-dd" value-format="yyyy-MM-dd"
                  v-model="submitForm.INVOICE_DATE" class="inputStyle">
                </el-date-picker>
              </td>
              <td style="width:12.5%">预计到货时间：</td>
              <td style="width:12.5%">
                <el-date-picker type="date" format="yyyy-MM-dd" value-format="yyyy-MM-dd"
                  v-model="submitForm.EXPECT_ARRIVAL_DATE" class="inputStyle">
                </el-date-picker>
              </td>
              <td style="width:12.5%">客户代码：</td>
              <td>{{ submitForm.CUSTOMER_CODE }}</td>
              </td>
            </tr>

            <tr>
              <td>物流单号<span style="color:red;font-size:15px">*</span>：</td>
              <td>
                <input v-model="submitForm.LOGISTICS_NUMBER" class="inputStyle" />
              </td>
              <td>物流公司<span style="color:red;font-size:15px">*</span>：</td>
              <td>
                <input v-model="submitForm.LOGISTICS_COMPANY" class="inputStyle" />
              </td>
              <td>物流联系人：</td>
              <td>
                <input v-model="submitForm.LOGISTICS_LINKMAN" class="inputStyle" />
              </td>

              <td>物流联系电话：</td>
              <td>
                <input v-model="submitForm.LOGISTICS_TEL" class="inputStyle" />
              </td>
            </tr>

            <tr>
              <td>物流费用(元)<span style="color:red;font-size:15px">*</span>：</td>
              <td>
                <input v-model="submitForm.LOGISTICS_FEE" class="inputStyle" />
              </td>
              <td>件数<span style="color:red;font-size:15px">*</span>：</td>
              <td>
                <input v-model="submitForm.NUMBER_OF_PIECES" oninput="value=value.replace(/[^\d]/g,'')"
                  class="inputStyle" />
              </td>
              <td>总重量(kg)<span style="color:red;font-size:15px">*</span>：</td>
              <td>
                <input v-model="submitForm.WEIGHT" oninput="value=value.replace(/[^\d.]/g,'')
                                .replace(/^\./g, '').replace(/\.{2,}/g, '')
                                .replace('.', '$#$').replace(/\./g, '')
                                .replace('$#$', '.')
                                .slice(0,value.indexOf('.') === -1? value.length: value.indexOf('.') + 3)"
                  class="inputStyle" />
              </td>
              <td></td>
              <td></td>
            </tr>

            <tr>
              <td>送货地址：</td>
              <td colspan="3">
                <input v-model="submitForm.AREA_DISTRICT" class="inputStyle" />
              </td>
              <td>备注：</td>
              <td colspan="3">
                <input v-model="submitForm.REMARKS" class="inputStyle" />
              </td>
            </tr>
          </table>
        </div>
        <hr />
        <el-table :data="DetailData" border highlight-current-row style="width: 100%;font-weight:normal;font-size:12px"
          class="table_1">
          <el-table-column prop="ITEM_NO" label="物料编码" align="center" width="150px"></el-table-column>
          <el-table-column prop="NAMEE" label="物料名称" align="center" width="180px"></el-table-column>
          <el-table-column prop="INVOICE_QTY" label="发货数量" align="center" width="155px">
            <template slot-scope="scope">
              <el-input-number v-model="scope.row.INVOICE_QTY" size="mini" controls-position="right" :min="0"
                :max="scope.row.max_qty"></el-input-number>
            </template>
          </el-table-column>
          <el-table-column prop="UNIT1" label="单位" align="center" width="80px"></el-table-column>
          <el-table-column prop="MAT_BRAND" label="品牌" align="center" width="150px"></el-table-column>
          <el-table-column prop="GRADE" label="规格/型号" align="center" width="150px"></el-table-column>
          <el-table-column label="备注" align="center">
            <template slot-scope="scope">
              <el-input v-model="scope.row.NOTE" clearable></el-input>
            </template>
          </el-table-column>
        </el-table>
        <div>
          <el-button style="margin-left:40%;margin-top:10px;" class="trueButton_1" @click="reback_show">不通过</el-button>
          <el-button class="trueButton" @click="isTrueEdit">通过</el-button>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import {
  GetRelativeDelivery,
  GetDeliveryDetail,
  UpdateDelivery,
} from "@/api/supplierASP";
import { downLoadFile } from "@/common/js/downLoadFile";
import Cookies from "js-cookie";

export default {
  name: "DeliveryList",
  data() {
    return {
      reback_notes_1: "",
      rebackVisible: false,
      find: "",
      DetailData: [],
      DeliverData: [],
      companyId: "",
      CID: Cookies.get("cid"), //客户账号
      beginTime: "", //查询的开始时间
      finishTime: "", //查询的结束时间
      SEARCHKEY: "", //搜索栏关键字
      SELECT_STATUS: "", //存储下拉框的值
      confirm_status: "",
      isAdd: false, //新增记录
      isEdit: false, //编辑记录
      isCheck: false, //查看记录
      lanjuDetail: false,
      limit: 10,
      count: 0,
      currentPage: 1,
      statusArray: [
        {
          label: "全部",
          value: "",
        },
        {
          label: "已通过",
          value: "1",
        },
        {
          label: "待确认",
          value: "2",
        },
        {
          label: "未通过",
          value: "3",
        },
      ],
      submitForm: {}, //提交的表头信息
    };
  },
  created() {
    this.refresh();
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
  },
  methods: {
    //确认退回
    rebackTure() {
      this.rebackVisible = false;
      this.reback();
    },
    //不通过
    reback_show() {
      this.rebackVisible = true;
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
        confirm_status: this.confirm_status,
      };
      if (!data.beginTime) {
        data.beginTime = "0001/1/1";
      }
      if (!data.finishTime) {
        data.finishTime = "9999/12/31";
      } else {
        data.finishTime = data.finishTime + " 23:59:59";
      }
      GetRelativeDelivery(data).then((res) => {
        this.count = res.count;
        this.DeliverData = res.data;
      });
    },
    //查看发货单列表详情
    _CheckDetail(val) {
      this.isCheck = true;
      this.isEdit = false;
      this.submitForm = val;
      var data_1 = {
        deliverNo: val.INVOICE_NO,
      };
      GetDeliveryDetail(data_1).then((res) => {
        this.DetailData = res.data;
        this.lanjuDetail = true;
      });
    },
    //编辑
    _EditDetail(val) {
      this.isEdit = true;
      this.isCheck = false;
      this.lanjuDetail = true;
      this.submitForm = val;
      var data_1 = {
        deliverNo: val.INVOICE_NO,
      };
      GetDeliveryDetail(data_1).then((res) => {
        this.DetailData = res.data;
        for (var i = 0; i < this.DetailData.length; i++) {
          this.$set(
            this.DetailData[i],
            "max_qty",
            this.DetailData[i].INVOICE_QTY
          );
        }
      });
    },
    //退回
    reback() {
      if (this.reback_notes_1.length == "") {
        this.$alert("请输入不通过说明", "提示", {
          confirmButtonText: "确定",
          type: "warning",
        });
      } else {
        this.lanjuDetail = false;
        this.submitForm.CONFIRM_STATUS = 3;
        this.submitForm.INVOICE_STATUS = 3;
        this.submitForm.REBACK_NOTES = this.reback_notes_1;
        UpdateDelivery({
          headForm: this.submitForm,
          gridData: this.DetailData,
          cid: Cookies.get("companyId"),
        }).then((res) => {
          this.$alert("保存成功", "提示", {
            confirmButtonText: "确定",
            type: "success",
          });
          this.search();
        });
      }
    },
    //通过
    isTrueEdit() {
      this.submitForm.CONFIRM_STATUS = 1;
      this.submitForm.INVOICE_STATUS = 1;
      UpdateDelivery({
        headForm: this.submitForm,
        gridData: this.DetailData,
        cid: Cookies.get("companyId"),
      }).then((res) => {
        this.$alert("保存成功", "提示", {
          confirmButtonText: "确定",
          type: "success",
        });
        this.lanjuDetail = false;
        this.search();
      });
    },
  },
};
</script>

 <style scoped>
.trueButton {
  background: #8bc34a;
  color: rgb(255, 255, 255);
}
.trueButton_1 {
  background: #8bc34a;
  color: rgb(228, 93, 93);
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
.tbarStyle {
  margin-bottom: 13px;
}
.inputStyle {
  height: 100%;
  width: 100% !important;
  font-size: 16px;
  text-align: center;
  border: 1px solid #409eff;
  box-sizing: border-box;
}
</style>