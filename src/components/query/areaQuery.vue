<template>
  <div id="areaQuery">
    <el-card shadow="hover">
      <el-dialog :visible.sync="showBill" width="60%" style="height:100%">
        <el-dialog title="提货单详情" :visible.sync="detailVisible" :close-on-click-modal="false" width="65%"
          style="heitht:100%;" append-to-body>
          <div style="width:100% ;margin:0 auto;font-size:13px;margin-top:-12px" class="diagTable">
            <table style="width:100%;height:160px" class="table_2" border="1">
              <tr>
                <td class="td_1">提货单</td>
                <td class="td_1">{{ tableDetail_1.SALE_NO }}</td>
                <td class="td_1">发货日期</td>
                <td class="td_1">{{ tableDetail_1.BILL_DATE | datatrans }}</td>
                <td class="td_1">状态</td>
                <td class="td_1">{{ tableDetail_1.STATUS_ID | transStatus }}</td>
              </tr>
              <tr>
                <td class="td_1">合同号</td>
                <td class="td_1">{{ tableDetail_1.HTBM }}</td>
                <td class="td_1">金额</td>
                <td class="td_1">{{ tableDetail_1.MONEY_SUM }}</td>
                <td class="td_1">提货日期</td>
                <td class="td_1">
                  {{ tableDetail_1.DATE_OUT_STOCK | datatrans }}
                </td>
              </tr>
              <tr>
                <td class="td_1">客户</td>
                <td colspan="5">
                  <span style="margin-left:10px;">
                    {{ tableDetail_1.CUSTOMER_NAME }}/联系人:{{
                    tableDetail_1.LINKMAN
                  }}</span>
                </td>
              </tr>
              <tr>
                <td class="td_1">备注</td>
                <td colspan="5">
                  <span style="margin-left:10px;">{{ tableDetail_1.NOTES }}</span>
                </td>
              </tr>
            </table>
            <br>
            <el-table max-height="500" :data="tableDetail" border style="width: 100%; margin:10px auto;font-size:13px;">
              <el-table-column width="80" label="状态" align="center">
                <template slot-scope="scope1">
                  <span>{{ scope1.row.STATUS_ID | transStatus }}</span>
                </template>
              </el-table-column>
              <el-table-column prop="ITEM_NO" label="型号" width="110" align="center">
              </el-table-column>
              <el-table-column prop="BATCH_NO" label="批次" width="180" align="center">
              </el-table-column>
              <el-table-column prop="PRODUCTVERSION_NAME" label="版本" width="150" align="center"></el-table-column>
              <el-table-column prop="NOTE" label="仓库" align="center"></el-table-column>
              <el-table-column prop="QTY_DELIVER" label="发货数" width="80" align="center"></el-table-column>
              <el-table-column prop="TRANS_PRICE" label="物流单价" width="80" align="center"></el-table-column>
              <el-table-column prop="SALE_PRICE" label="单价" width="70" align="center">
              </el-table-column>
              <el-table-column prop="MONEY" label="金额" width="90" align="center"></el-table-column>
            </el-table>
          </div>
        </el-dialog>
        <div style="font-size:18px">
          <div>客户名称：{{get_CUSTOMER_NAME}}
            <span style="color:blue;margin-left:10px">汇总金额:{{getMoney}}元</span>
          </div>
        </div>
        <br>
        <div>
          <el-table :summary-method="getSummaries" show-summary :data="tableData" border highlight-current-row
            style="width: 100%;font-weight:normal;font-size:12px" class="table_1">
            <el-table-column prop="num" label width="58" align="center">
              <template slot-scope="scope"><span>{{ scope.$index + (currentPage - 1) * limit + 1 }}
                </span>
              </template>
            </el-table-column>
            <el-table-column label="提货单号" width="100" align="center">
              <template slot-scope="scope1">
                <el-button size="mini" @click="openDia(scope1.row)" type="text">{{ scope1.row.SALE_NO }}</el-button>
              </template>
            </el-table-column>
            <el-table-column label="状态" align="center">
              <template slot-scope="scope2">
                {{ scope2.row.STATUS_ID | transStatus }}
              </template>
            </el-table-column>
            <el-table-column prop="CONTRACT_NO" label="订单号" align="center"></el-table-column>
            <el-table-column label="类型" align="center" prop="BILL_ID"
              :filters="[{text: '冲减单', value: '0'}, {text: '自动提货单', value: '1'},{text: '手工提货单', value: '2'},{text: '退货单', value: '3'}, ]"
              :filter-method="filterHandler">
              <template slot-scope="scope3">
                {{ scope3.row.BILL_ID | transType }}
              </template>
            </el-table-column>
            <el-table-column prop="DATE_OUT_STOCK" label="提货日期" align="center">
              <template slot-scope="scope5">
                {{ scope5.row.DATE_OUT_STOCK | datatrans }}
              </template>
            </el-table-column>
            <el-table-column prop="MONEY_SUM" label="金额" align="center"></el-table-column>
          </el-table>
          <!-- 分页 -->
          <div style="margin:0 35%;" class="block">
            <el-pagination @current-change="handleCurrentChange" :current-page="currentPage" :page-size="limit"
              layout="total, prev, pager, next, jumper" :total="count"></el-pagination>
          </div>
        </div>
      </el-dialog>

      <div class="ff">
        <form target="TAB_2_CONTENT" action="queryBillList.jsp" method="POST" class="FORM_1" style="height:250px">
          <div style="width:100%">
            <div style="width:40%;border:none;float:left">
              市场
              <el-select v-model="AREACODE.AREA_NAME" placeholder="----选择市场----" style="width:210px"
                @change="areaCode(AREACODE.AREA_NAME)">
                <el-option v-for="item in AREACODE" :key="item.AREA_CODE" :label="item.AREA_NAME"
                  :value="item.AREA_CODE">
                </el-option>
              </el-select>
              片区
              <el-select v-model="AREA_DISTRICT.DISTRICT_NAME" placeholder="----选择片区----" style="width:210px"
                @change="district_code(AREA_DISTRICT.DISTRICT_NAME)">
                <el-option v-for="item in AREA_DISTRICT" :key="item.DISTRICT_ID" :label="item.DISTRICT_NAME"
                  :value="item.DISTRICT_ID"></el-option>
              </el-select>

              <div style="margin-top:15px">
                发货日期
                <el-date-picker type="date" format="yyyy-MM-dd" value-format="yyyy-MM-dd" placeholder="开始日期区间"
                  v-model="ruleForm_1.dateValue" @change="getCustomerChangTime" style="width:178px"></el-date-picker>
                <span style="margin-left:10px">--</span>
                <el-date-picker type="date" format="yyyy-MM-dd" value-format="yyyy-MM-dd" placeholder="结束日期区间"
                  @change="getCustomerChangTime" v-model="ruleForm_2.dateValue" style="width:210px;margin-left:12px">
                </el-date-picker>
              </div>
              <div style="margin-top:15px">
                客户类型
                <el-select v-model="CUSTOMER_TYPE.label" placeholder="全部" style="width:178px"
                  @change="customer_type(CUSTOMER_TYPE.label)">
                  <el-option v-for="item in CUSTOMER_TYPE" :key="item.value" :label="item.label" :value="item.value">
                  </el-option>
                </el-select>
                状态
                <el-select v-model="STATUS.label" placeholder="全部" style="width:210px"
                  @change="status_id(STATUS.label)">
                  <el-option v-for="item in STATUS" :key="item.value" :label="item.label" :value="item.value">
                  </el-option>
                </el-select>
              </div>
              <div style="margin-top:15px">
                <div>
                  <el-button type="#DCDFE6" icon="el-icon-s-grid" class="cx" @click="reset">重置</el-button>
                  <el-button type="#DCDFE6" icon="el-icon-search" class="cx" @click="_queryQuYu_1"
                    style="margin-left:65px">查询</el-button>
                  <el-checkbox v-model="checked" style="margin-left:150px" @change="_getCustomerByAreaCode_8">仅有效客户
                  </el-checkbox>
                </div>

              </div>
            </div>

            <div id="right" style="float:right;margin-right:10px;" class="transferP">
              <el-transfer :titles="['可选用户', '已选用户']" style="height:240px;width:700px" filterable
                filter-placeholder="筛选" v-model="value_4" :data="customerData" :props="{
                  key: 'CUSTOMER_CODE',
                  label: 'CUSTOMER_NAME'
                }">
              </el-transfer>
            </div>
          </div>
        </form>
        <hr />
        <div v-if="query_1">
          <div style="float:left;font-size:15px;color:blue;margin:10px">提货单金额汇总：{{moneySum.MONEYSUM}}元</div>
          <el-table :data="CUSTOMERED" border class="table_1">
            <el-table-column prop="num" width="58" align="center" label="序号">
              <template slot-scope="scope"><span>{{ scope.$index + (currentPage - 1) * limit + 1 }}
                </span>
              </template>
            </el-table-column>
            <el-table-column label="客户代码" align="center">
              <template slot-scope="scope1">
                <el-button size="mini" @click="openDetail_1(scope1.row)" type="text">{{ scope1.row.CUSTOMER_CODE }}
                </el-button>
              </template>
            </el-table-column>
            <el-table-column prop="CUSTOMER_NAME" label="客户名称" align="center">
            </el-table-column>
            <el-table-column prop="MONEYSUM" label="时间段内订单提货总额" align="center">
            </el-table-column>
          </el-table>
        </div>

        <!-- </el-tab-pane>
        </el-tabs> -->
      </div>
    </el-card>
  </div>
</template>

<script>
import { mapMutations, mapActions } from "vuex";
import { mapState } from "vuex";
import {
  getAreaCode,
  getDistrictByAreaCode,
  getCustomerByAreaCode,
  getPackDetails,
  getPackDetailsBySaleNo,
  getPackDetailsType,
  getTotalMoneySum,
  getCustomerName,
  getPackData
} from "@/api/areaInfoASP";
import Cookies from "js-cookie";
export default {
  name: "AreaQuery",
  data() {
    return {
      get_customer_code: "",
      getMoney: "",
      showBill: false,
      get_CUSTOMER_NAME: "",
      CUSTOMERED: [], //查询的已选用户
      CUSTOMERED_2: [],
      CUSTOMERED_1: [],
      moneySum: [],
      typeNameFilter: [],
      typeIdFilter: [],
      typeFilter: [],
      checked: true,
      detailVisible: false,
      startDate: "",
      endDate: "",
      tableDetail: [],
      tableDetail_1: [],
      theBody: {},
      first: "",
      second: "",
      third: "",
      activeName: "first",
      query_1: false, //查询显示
      query_2: false,
      value_3: "", //客户类型初始值
      customerData: [],
      limit: 8,
      count: 0,
      currentPage: 1,
      value_4: [], //已选用户初始值
      value1: "",
      value2: "",
      beginTime_1: "", //区域提货单查询
      ruleForm_1: { dateValue: "" },
      finishTime_1: "",
      ruleForm_2: { dateValue: "" },
      AREA_DISTRICT: [],
      AREA_DISTRICT_1: [
        {
          DISTRICT_ID: "",
          DISTRICT_NAME: "全部"
        }
      ],
      CUSTOMER_TYPE: [
        {
          value: "",
          label: "全部"
        },
        {
          value: "notspeciality",
          label: "非专业市场客户"
        },
        {
          value: "speciality",
          label: "专业市场客户"
        }
      ],
      AREACODE: [],
      tableData: [],
      STATUS: [
        {
          value: "",
          label: "全部"
        },
        {
          value: "1",
          label: "待提"
        },
        {
          value: "2",
          label: "已提货"
        },
        {
          value: "3",
          label: "作废"
        },
        {
          value: "4",
          label: "已月结"
        }
      ],
      status_info: ""
    };
  },
  filters: {
    transStatus(value) {
      switch (value) {
        case "1":
          return "待提";
        case "2":
          return "已提货";
        case "3":
          return "作废";
        case "4":
          return "已月结";
          break;
      }
    },
    transType(value) {
      switch (value) {
        case "0":
          return "冲减单";
        case "3":
          return "退货单";
        default:
          return "提货单";
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
      return y + "-" + MM + "-" + d + " "; /* + h + ':' + m + ':' + s; */
    }
  },
  //生命周期
  created() {
    this._getAreaCode();
  },
  //页面加载时候，在mounted中进行赋值
  mounted() {
    // 初始化查询，默认为前一天
    this.ruleForm_1.dateValue = this.timeDefault_1;
    this.ruleForm_2.dateValue = this.timeDefault_2;
  },
  computed: {
    timeDefault_1() {
      var date = new Date();
      var s1 = date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + "01";
      return s1;
    },

    timeDefault_2() {
      var date = new Date();
      var s1 =
        date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate();
      return s1;
    }
  },
  methods: {
    // _getPackDetailsType(){
    //    getPackDetailsType().then(res => {
    //     this.typeFilter = res.data;
    //     res.data.forEach(item => {
    //             this.initFilter(this.typeIdFilter,item.ORDERTYPE_ID)
    //             this.initFilter(this.typeNameFilter,item.ORDERTYPE_NAME)
    //         })
    //   });
    // },
    // initFilter(array,item){
    // let _obj = {
    //     text:item,
    //     value:item
    // }
    // if(JSON.stringify(array).indexOf(JSON.stringify(_obj)) === -1){
    //     array.push(_obj)
    // }
    // },
    filterHandler(value, row, column) {
      const property = column["property"];
      return row[property] === value;
    },
    //根据用户查区域市场
    _getAreaCode() {
      this.tableData = [];
      this.value_4 = [];
      this.AREACODE = [];
      var userInfo = JSON.parse(Cookies.get("userInfo"));
      var data = {
        userid: userInfo.loginName
      };
      getAreaCode(data).then(res => {
        this.AREACODE = res.data;
        if (this.AREACODE.length == 0) {
          this.$alert("没有区域权限，请联系管理员配置", "提示", {
            confirmButtonText: "确定",
            type: "success"
          });
        }
      });
    },
    //根据市场区域查片区
    areaCode(val) {
      //点击选择市场事件
      this.tableData = [];
      this.value_4 = [];
      var data = {
        areaCode: val
      };
      this.first = val;
      getDistrictByAreaCode(data).then(res => {
        this.AREA_DISTRICT = res.data;
        this.AREA_DISTRICT.push.apply(this.AREA_DISTRICT, this.AREA_DISTRICT_1);
      });
      this._getCustomerByAreaCode_1(val);
    },
    //根据市场和片区查可选用户
    district_code(val) {
      this.tableData = [];
      this.value_4 = [];
      this.second = val;
      var data = {
        areaCode: this.first,
        AREA_DISTRICT: val
      };
      this._getCustomerByAreaCode_2(data);
    },
    //根据市场，片区，客户类型查可选用户
    customer_type(val) {
      this.tableData = [];
      this.value_4 = [];
      this.third = val;
      var data = {
        areaCode: this.first,
        district: this.second,
        customerType: val
      };
      this._getCustomerByAreaCode_3(data);
    },
    //状态搜索
    status_id(val) {
      this.status_info = val;
      this.tableData = [];
      this._queryQuYu_1();
    },
    //通过区域查询可选用户
    _getCustomerByAreaCode_1(val) {
      this.tableData = [];
      this.customerData = [];
      this.value_4 = [];
      var data = {
        beginTime: this.ruleForm_1.dateValue,
        finishTime: this.ruleForm_2.dateValue,
        isall: this.checked,
        areaCode: val, //市场
        district: this.AREA_DISTRICT, //片区
        customerType: this.customer_type //客户类型
      };
      getCustomerByAreaCode(data).then(res => {
        this.customerData = res.data;
      });
    },
    _getCustomerByAreaCode_2(val) {
      this.customerData = [];
      this.tableData = [];
      this.value_4 = [];
      var data = {
        beginTime: this.ruleForm_1.dateValue,
        finishTime: this.ruleForm_2.dateValue,
        isall: this.checked,
        areaCode: val.areaCode, //市场
        district: val.AREA_DISTRICT, //片区
        customerType: this.customer_type //客户类型
      };
      getCustomerByAreaCode(data).then(res => {
        this.customerData = res.data;
      });
    },
    _getCustomerByAreaCode_3(val) {
      this.customerData = [];
      this.tableData = [];
      this.value_4 = [];
      var data = {
        beginTime: this.ruleForm_1.dateValue,
        finishTime: this.ruleForm_2.dateValue,
        isall: this.checked,
        areaCode: val.areaCode, //市场
        district: val.district, //片区
        customerType: val.customerType //客户类型
      };
      getCustomerByAreaCode(data).then(res => {
        this.customerData = res.data;
      });
    },
    //改变时间查可选用户
    getCustomerChangTime() {
      this.customerData = [];
      this.tableData = [];
      this.value_4 = [];
      if (this.first == "") {
        this.$alert("未选择市场区域", "提示", {
          confirmButtonText: "确定",
          type: "success"
        });
        return (this.tableData = []);
      } else {
        var data = {
          beginTime: this.ruleForm_1.dateValue,
          finishTime: this.ruleForm_2.dateValue,
          isall: this.checked,
          areaCode: this.first, //市场
          district: this.second, //片区
          customerType: this.third //客户类型
        };
        getCustomerByAreaCode(data).then(res => {
          this.customerData = res.data;
        });
      }
    },
    _getCustomerByAreaCode_8() {
      var data = {
        beginTime: this.ruleForm_1.dateValue,
        finishTime: this.ruleForm_2.dateValue,
        isall: this.checked,
        areaCode: this.first, //市场
        district: this.second, //片区
        customerType: this.third //客户类型
      };
      getCustomerByAreaCode(data).then(res => {
        this.customerData = res.data;
      });
    },
    //提货单查询
    _queryQuYu_1() {
      this.currentPage = 1;
      this.queryQuYu_1();
    },
    async queryQuYu_1() {
      (this.query_1 = false),
        (this.moneySum = []),
        (this.typeFilter = []),
        (this.tableData = []);
      this.CUSTOMERED = [];
      this.CUSTOMERED_1 = [];
      this.CUSTOMERED_2 = [];
      if (this.value_4.length == 0) {
        this.$alert("未选择用户", "提示", {
          confirmButtonText: "确定",
          type: "success"
        });
        return (this.tableData = []);
      } else if (this.first == "") {
        this.$alert("未选择市场", "提示", {
          confirmButtonText: "确定",
          type: "success"
        });
        return (this.tableData = []);
      } else {
        // for (var i = 0; i < this.value_4.length; i++) {
        //   var res = await  getCustomerName({customer:this.value_4[i]},{ loading: false })
        //   this.get_CUSTOMER_NAME = res.data[0]

        //   var data_2 =  {
        //     beginTime: this.ruleForm_1.dateValue, //起始时间
        //     finishTime: this.ruleForm_2.dateValue+" 23:59:59", //结束时间
        //     status: this.status_info , //状态
        //     customers:[this.value_4[i]]
        //   }
        //   var res1= await getTotalMoneySum(data_2 ,{ loading: false })
        //   this.moneySum = res1.data[0];
        //   if(this.moneySum.MONEYSUM == 0){
        //     continue
        //   }
        //   this.CUSTOMERED_1[i] =  {
        //     CUSTOMER_CODE: this.value_4[i],
        //     CUSTOMER_NAME: this.get_CUSTOMER_NAME.CUSTOMER_NAME,
        //     MONEYSUM:this.moneySum.MONEYSUM
        //   }
        // }

        //this.CUSTOMERED = this.CUSTOMERED_1
        var data_2 = {
          beginTime: this.ruleForm_1.dateValue, //起始时间
          finishTime: this.ruleForm_2.dateValue + " 23:59:59", //结束时间
          status: this.status_info, //状态
          customers: this.value_4
        };
        var data = {
          type: this.typeFilter, //类型筛选
          costomerCodes: this.value_4, //已选用户
          beginTime: this.ruleForm_1.dateValue, //起始时间
          finishTime: this.ruleForm_2.dateValue, //结束时间
          limit: this.limit, //限制数
          page: this.currentPage, //页数
          status: this.status_info //状态
        };
        if (!data.beginTime) {
          data.beginTime = "0001/1/1";
        }
        if (!data.finishTime) {
          data.finishTime = "9999/12/31";
        } else {
          data.finishTime = data.finishTime + " 23:59:59";
        }
        await getPackData(data_2).then(res => {
          this.CUSTOMERED_1 = res.data;
          for (var i = 0; i < this.CUSTOMERED_1.length; i++) {
            this.CUSTOMERED_2[i] = {
              CUSTOMER_CODE: this.CUSTOMERED_1[i][0],
              CUSTOMER_NAME: this.CUSTOMERED_1[i][1],
              MONEYSUM: this.CUSTOMERED_1[i][2]
            };
          }
          this.CUSTOMERED = this.CUSTOMERED_2;
        });
        if (this.CUSTOMERED.length == 0) {
          this.$alert("所选客户无提货单信息", "提示", {
            confirmButtonText: "确定",
            type: "success"
          });
          return (this.query_1 = false);
        }
        this._getTotalMoneySum(data);

        // getPackDetails(data).then(res => {
        //   this.count = res.count;
        //   this.tableData = res.data;
        //   if(res.data.length != 0){
        //     //this._getPackDetailsType();
        //     this._getTotalMoneySum(data)
        //   }

        // });
      }
      // this.$router.push("/QYTable");
    },
    //客户总金额
    _getTotalMoneySum(val) {
      this.moneySum = [];
      var data = {
        beginTime: val.beginTime, //起始时间
        finishTime: val.finishTime, //结束时间
        status: val.status, //状态
        customers: val.costomerCodes
      };
      getTotalMoneySum(data).then(res => {
        this.moneySum = res.data[0];
        this.query_1 = true;
      });
    },
    //计算表格末行
    getSummaries(param) {
      const { columns, data } = param;
      const sums = [];
      if (data && data.length > 0) {
        columns.forEach((column, index) => {
          if (index === 0) {
            sums[index] = "页合计";
            return;
          } else if (index == 6) {
            var values = data.map(item => Number(item[column.property]));
            if (!values.every(value => isNaN(value))) {
              sums[index] = values.reduce((prev, curr) => {
                const value = Number(curr);
                if (!isNaN(value)) {
                  return prev + curr;
                } else {
                  return prev;
                }
              }, 0);
              sums[index] = sums[index].toFixed(2);
              if (this.isManager == "0") sums[index] = "***";
            } else {
              sums[index] = "";
            }
          } else {
            sums[index] = "";
          }
        });
      }
      return sums;
    },

    //翻页获取订单
    handleCurrentChange(val) {
      this.currentPage = val;
      this.openDetail();
    },
    //重置
    reset() {
      this.query_1 = false;
      this.CUSTOMERED = [];
      this.CUSTOMERED_1 = [];
      this.CUSTOMERED_2 = [];
      this.moneySum = [];
      this.checked = true;
      this.customerData = [];
      this.value_4 = [];
      this.tableData = [];
      this.AREA_DISTRICT = [];
      this.status_info = "";
      (this.CUSTOMER_TYPE = [
        {
          value: "",
          label: "全部"
        },
        {
          value: "notspeciality",
          label: "非专业市场客户"
        },
        {
          value: "speciality",
          label: "专业市场客户"
        }
      ]),
        (this.STATUS = [
          {
            value: "",
            label: "全部"
          },
          {
            value: "1",
            label: "待提"
          },
          {
            value: "2",
            label: "已提货"
          },
          {
            value: "3",
            label: "作废"
          },
          {
            value: "4",
            label: "已月结"
          }
        ]);
      this.tableDetail = [];
      this.count = 0;
      this.currentPage = 1;
      this._getAreaCode();
      this.ruleForm_1.dateValue = this.timeDefault_1;
      this.ruleForm_2.dateValue = this.timeDefault_2;
    },
    //点击客户code查看详情
    openDetail_1(val) {
      this.currentPage = 1;
      this.get_CUSTOMER_NAME = val.CUSTOMER_NAME;
      this.getMoney = val.MONEYSUM;
      this.get_customer_code = val.CUSTOMER_CODE;
      this.openDetail();
    },
    openDetail(val) {
      this.tableData = [];
      var data = {
        type: this.typeFilter, //类型筛选
        costomerCodes: [this.get_customer_code], //已选用户
        beginTime: this.ruleForm_1.dateValue, //起始时间
        finishTime: this.ruleForm_2.dateValue, //结束时间
        limit: this.limit, //限制数
        page: this.currentPage, //页数
        status: this.status_info //状态
      };
      if (!data.beginTime) {
        data.beginTime = "0001/1/1";
      }
      if (!data.finishTime) {
        data.finishTime = "9999/12/31";
      } else {
        data.finishTime = data.finishTime + " 23:59:59";
      }
      getPackDetails(data).then(res => {
        this.count = res.count;
        this.tableData = res.data;
        if (res.data.length != 0) {
          this.showBill = true;
        } else {
          this.$alert("暂无数据", "提示", {
            confirmButtonText: "确定",
            type: "success"
          });
        }
      });
    },
    //打开弹窗显示详情数据
    openDia(val) {
      this.tableDetail = [];
      this.tableDetail_1 = [];
      this._getPackDetailsBySaleNo(val);
      let data_1 = {
        SALE_NO: val.SALE_NO, //提货单
        BILL_DATE: val.BILL_DATE, //日期
        STATUS_ID: val.STATUS_ID, //状态
        SALE_NAME: val.SALE_NAME, //业务员
        HTBM: val.HTBM, //合同号
        MONEY_SUM: val.MONEY_SUM, //金额
        DATE_OUT_STOCK: val.DATE_OUT_STOCK, //提货日期
        CUSTOMER_NAME: val.CUSTOMER_NAME, //客户名称
        LINKMAN: val.LINKMAN,
        NOTES: val.NOTES //备注
      };
      this.tableDetail_1 = data_1;
    },
    _getPackDetailsBySaleNo(val) {
      this.tableDetail = [];
      var data_2 = {
        saleNo: val.SALE_NO //所选提货单
      };
      getPackDetailsBySaleNo(data_2).then(res => {
        this.tableDetail = res.data;
        this.detailVisible = true;
      });
    }
  }
};
</script>
<style>
.table_1 .el-table__row {
  height: 3px;
}
.diagTable .el-table--border:after,
.diagTable .el-table:before {
  background-color: black;
}
.diagTable .el-table--border,
.diagTable .el-table td,
.diagTable .el-table--group,
.diagTable .el-table th.is-leaf {
  border-color: black;
}
#areaQuery .el-dialog__body {
  padding: 20px;
}
.transferP .el-transfer-panel .el-transfer-panel__header {
  height: 30px;
  line-height: 30px;
}
.transferP .el-transfer-panel .el-transfer-panel__header .el-checkbox {
  line-height: 30px;
}
.transferP .el-transfer-panel__filter {
  margin: 5px;
}
.transferP .el-transfer__buttons {
  padding: 0 10px;
}
</style>
<style scoped>
.td_1 {
  text-align: center;
  padding: 0;
}
.table_2 {
  border-collapse: collapse;
  border: 1px solid black;
}
.gx {
  background: #8bc34a;
  color: rgb(255, 255, 255);
}

.CONDITION_DIV_TABLE2 {
  height: 100px;
}

.cz {
  text-align: center;
}
.cx {
  background: #8bc34a;
  color: rgb(255, 255, 255);
}
.jiange {
  margin-left: 10px;
}

.CONDITION_DIV {
  margin-left: 10px;
  height: 250px;
  background: rgb(255, 255, 255);
}
.CUSTOMERLISTSELECT {
  color: #000;
}
.SELECTEDCUSTOMERCODE {
  width: 350px;
}
.CUSTOMER_CODE {
  width: 430px;
  margin-left: 500px;
  margin-top: -85px;
}
.OPTION0 {
  background: rgb(209, 243, 200);
}

.cx_2 {
  margin-left: 10px;
  background: #8bc34a;
  color: rgb(255, 255, 255);
}
</style>