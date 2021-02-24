<template>
  <div id="salesQuery">
    <el-card shadow="hover">
      <div class="ff">
        <!-- <el-tabs class="tabs_1" v-model="activeName">
          <el-tab-pane label="区域提货单查询" name="first"> -->
        <form
          target="TAB_2_CONTENT"
          action="queryBillList.jsp"
          method="POST"
          class="FORM_1"
         
        >
          <div style="width:100%">
            <div style="border:none">
                选择时间
                <el-date-picker
                  type="date"
                  format="yyyy-MM-dd"
                  value-format="yyyy-MM-dd"
                  placeholder="开始日期区间"
                  v-model="ruleForm_1.dateValue"
                  style="width:178px"
                ></el-date-picker>
                <span style="margin-left:10px">--</span>
                <el-date-picker
                  type="date"
                  format="yyyy-MM-dd"
                  value-format="yyyy-MM-dd"
                  placeholder="结束日期区间"
                  v-model="ruleForm_2.dateValue"
                  style="width:210px;margin-left:12px;margin-right:15px"
                ></el-date-picker>
                版本
              <el-select
                filterable
                v-model="VERSION.PRODUCTVERSION_NAME"
                placeholder="----选择版本----"
                style="width:210px"
                @change="Version(VERSION.PRODUCTVERSION_NAME)"
              >
                <el-option
                  v-for="item in VERSION"
                  :key="item.PRODUCTVERSION_ID"
                  :label="item.PRODUCTVERSION_NAME"
                  :value="item.PRODUCTVERSION_ID"
                >
                </el-option>
              </el-select>
              型号
             <el-input
                size="10"
                v-model="XH"
                placeholder="请输入型号"
                style="width:200px"
              ></el-input>
                  <el-button
                    type="#DCDFE6"
                    icon="el-icon-s-grid"
                    class="cx"
                    style="margin-left:15px"
                    @click="reset"
                    >重置</el-button
                  >
                  <el-button
                    type="#DCDFE6"
                    icon="el-icon-search"
                    class="cx"
                    @click="_queryQuYu_1"
                    style="margin-left:15px"
                    >查询</el-button
                  >
            </div>
          </div>
        </form>
        <hr />
        <div v-if="query_1">
          <div style="float:left;font-size:15px;color:blue;margin:10px">金额汇总：{{getSumMoneyBySales[0].SUNMONEY}}元</div>
          <el-table
          :data="tableData"
          border
          class="table_1">
            <!-- <el-table-column prop="num" width="58" align="center" label="序号">
              <template slot-scope="scope"
                ><span
                  >{{ scope.$index + (currentPage - 1) * limit + 1 }}
                </span>
              </template>
            </el-table-column> -->
            <el-table-column
              label="型号"
              align="center"
            >
            <template slot-scope="scope1">
                {{ scope1.row.ITEM_NO }}
            </template>
            </el-table-column>
            <el-table-column
              
              label="总数量"
              align="center"
            >
            <template slot-scope="scope2">
                {{ scope2.row.SUMQTY }}（米）
            </template>
            </el-table-column>
            <el-table-column
              prop="SUNMONEY"
              label="总金额"
              align="center"
            >
            </el-table-column>
          </el-table>
        </div>
        <!-- 分页 -->
          <!-- <div style="margin:0 35%;" class="block">
            <el-pagination
              @current-change="handleCurrentChange"
              :current-page="currentPage"
              :page-size="limit"
              layout="total, prev, pager, next, jumper"
              :total="count"
            ></el-pagination>
          </div> -->
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
  getAllVersion,
  getProductSales,
  getSumMoneyBySales
} from "@/api/areaInfoASP";
import Cookies from "js-cookie";
export default {
  name: "SalesQuery",
  data() {
    return {
      getSumMoneyBySales:[],
        getVersion:"",
        XH:"",
        VERSION:[],
      query_1: false, //查询显示
      query_2: false,
      limit: 8,
      count: 0,
      currentPage: 1,
      beginTime_1: "", //区域提货单查询
      ruleForm_1: { dateValue: "" },
      finishTime_1: "",
      ruleForm_2: { dateValue: "" },
      tableData: [],
    };
  },
  filters: {
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
    this._getAllVersion();
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
      var s1 = date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + (date.getDate());      
      return s1;    
      }  
    },
  methods: {
      //查所有版本
      _getAllVersion(){
          getAllVersion().then(res =>{
            this.VERSION = res.data;
            if(this.VERSION.length == 0){
                    this.$alert("未查到版本号", "提示", {
                    confirmButtonText: "确定",
                    type: "success"
                });
            }
          });
      },
    //根据市场区域查片区
    Version(val) {
      this.getVersion = val;
    },
    
    //销售提货单查询
    _queryQuYu_1() {
      this.currentPage = 1;
      this.queryQuYu_1();
    },
    async queryQuYu_1() {
      this.tableData = [];
      if (this.XH == "" && this.getVersion == "") {
            this.$alert("未输入型号或者版本号", "提示", {
            confirmButtonText: "确定",
            type: "success"
          });
        return (this.tableData = []);
      }
      if(this.XH != "" || this.getVersion != ""){
        var data = {
          item_no:this.XH,//类型筛选
          version: this.getVersion, //已选用户
          beginTime: this.ruleForm_1.dateValue, //起始时间
          finishTime: this.ruleForm_2.dateValue, //结束时间
          // limit: this.limit, //限制数
          // page: this.currentPage, //页数
        };
        if (!data.beginTime) {
          data.beginTime = "0001/1/1";
        }
        if (!data.finishTime) {
          data.finishTime = "9999/12/31";
        } else {
          data.finishTime = data.finishTime + " 23:59:59";
        }
        var res = await getProductSales(data)
          // this.count = res.count;
          this.tableData = res.data;
          if (this.XH != "" && this.getVersion != "" && res.data.length == 0) {
            this.$alert("所输版本和型号不对应，请重新输入！", "提示", {
            confirmButtonText: "确定",
            type: "success"
          });
        return (this.tableData = []);
      }
      var res1 = await getSumMoneyBySales(data)
      this.getSumMoneyBySales = res1.data;
          this.query_1 = true;

      } 
      // }  else if(this.getVersion == ""){
      //   this.$alert("未选择版本", "提示", {
      //       confirmButtonText: "确定",
      //       type: "success"
      //     });
      //   return (this.tableData = []);
      // }
    },
    //翻页获取订单
    handleCurrentChange(val) {
      this.currentPage = val;
      this.queryQuYu_1();
    },
    //重置
    reset() {
      this.query_1 = false
        this.getVersion="",
        this.XH="",
        this.VERSION=[],
      this.tableData = [];
      this.count = 0;
      this.currentPage = 1;
      this._getAllVersion();
      this.ruleForm_1.dateValue = this.timeDefault_1;
      this.ruleForm_2.dateValue = this.timeDefault_2;
    },
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