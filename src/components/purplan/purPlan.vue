<template>
  <div class="safeStock">
    <el-card shadow="never" class="flex-card">
      <div>
        <span>创建日期:</span>
        <el-date-picker style="width:130px;" v-model="beginTime" placeholder="日期区间" size="small">
        </el-date-picker>
        <span>至</span>
        <el-date-picker style="width:130px;" v-model="finishTime" placeholder="日期区间" size="small">
        </el-date-picker>
        <span style="margin-left:10px;">状态:</span>
        <el-select style="width:100px;" v-model="selectStatus" placeholder="请选择" @change="searchData" size="small">
          <el-option v-for="item in statusArray" :key="item.value" :label="item.label" :value="item.value">
          </el-option>
        </el-select>
        <span style="margin-left:10px;">型号:</span>
        <el-input v-model="itemCondition" size="small" style="width: 150px" placeholder="输入型号搜索" @keyup.enter.native="searchData">
        </el-input>
        <span style="margin-left:10px;">供应商:</span>
        <el-input v-model="supplyCondition" size="small" style="width: 150px" placeholder="输入供应商搜索"
          @keyup.enter.native="searchData"></el-input>
        <el-button icon="el-icon-search" class="greenBtn" @click="searchData" style="margin-left:10px;" size="small">查询
        </el-button>
        <el-button type="primary" size="small" @click="onAddClick">手工新增</el-button>
        <el-button @click="exportExcel" type="primary" size="small">导出Excel</el-button>
      </div>
      <hr style="width:100%;" />
      <div style="flex:1;position:relative;">
        <el-table :data="planData" height="100%" style="position:absolute;">
          <el-table-column type="index" width="50" align="center"></el-table-column>
          <el-table-column label="供应商" prop="SUPPLY_NAME" width="200" align="center"></el-table-column>
          <el-table-column label="型号" prop="ITEM_NO" width="120" align="center"></el-table-column>
          <el-table-column label="需求计划量" prop="PLAN_QUANTITY" width="120" align="center"></el-table-column>
          <el-table-column label="需求日期" prop="REQ_DATE" width="120" align="center">
            <template slot-scope="scope">
              <span>{{scope.row.REQ_DATE | dateFilter}}</span>
            </template>
          </el-table-column>
          <el-table-column label="已到货数量" prop="ARRIVAL_QUANTITY" width="120" align="center"></el-table-column>
          <el-table-column label="状态" prop="STATE_ID" width="100" align="center">
            <template slot-scope="scope">
              <span>{{scope.row.STATE_ID | transStatus}}</span>
            </template>
          </el-table-column>
          <el-table-column label="备注" prop="NOTE" align="center"></el-table-column>
          <el-table-column label="创建日期" prop="CRE_DATE" width="130" align="center">
            <template slot-scope="scope">
              <span>{{scope.row.CRE_DATE | dateFilter('yyyy-MM-dd HH:mm')}}</span>
            </template>
          </el-table-column>
          <el-table-column label="操作" align="center" width="130">
            <template slot-scope="scope">
              <el-button circle type="primary" icon="el-icon-edit" size="mini" @click="onEditClick(scope.row)">
              </el-button>
              <el-button v-if="scope.row.STATE_ID == '1'" circle type="danger" icon="el-icon-close" size="mini"
                @click="onDeleteClick(scope.row)">
              </el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </el-card>

    <el-dialog width="350px" :title="dialogTitle" :visible.sync="dialogVisible">
      <el-form :model="purPlanModel" ref="purPlanForm" label-width="100px">
        <el-form-item label="型号" prop="ITEM_NO">
          <el-input style="width:200px;" v-model="purPlanModel.ITEM_NO" :disabled="!addOrNot" @focus="searchItemShow">
          </el-input>
        </el-form-item>
        <el-form-item label="供应商" prop="SUPPLY_CODE">
          <el-input style="width:200px;" v-model="purPlanModel.SUPPLY_CODE" :disabled="true">
          </el-input>
        </el-form-item>
        <el-form-item label="需求计划量" prop="PLAN_QUANTITY">
          <el-input style="width:200px;" v-model="purPlanModel.PLAN_QUANTITY" oninput="value=value.replace(/[^\d]/g,'')">
          </el-input>
        </el-form-item>
        <el-form-item label="需求日期" prop="REQ_DATE">
          <el-date-picker style="width:200px;" v-model="purPlanModel.REQ_DATE"></el-date-picker>
        </el-form-item>
        <el-form-item label="状态" prop="STATE_ID">
          <el-select style="width:200px;" v-model="purPlanModel.STATE_ID" placeholder="请选择" @change="searchData"
            :disabled="!addOrNot && purPlanModel.STATE_ID != '2'">
            <el-option v-for="item in statusArray2" :key="item.value" :label="item.label" :value="item.value">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="备注" prop="NOTE">
          <el-input style="width:200px;" v-model="purPlanModel.NOTE" type="textarea">
          </el-input>
        </el-form-item>
        <div style="text-align:center;">
          <el-button type="primary" @click="onSaveClick">保存</el-button>
          <el-button @click="dialogVisible = false">取消</el-button>
        </div>
      </el-form>
    </el-dialog>

    <el-dialog width="350px" title="型号输入" :visible.sync="searchItemVisible" :close-on-click-modal="false">
      <div style="text-align:center;margin-bottom:10px;">
        <el-input style="width:300px;" v-model="itemSearch" placeholder="输入型号搜索" ref="itemSearchInput"></el-input>
      </div>
      <div style="text-align:center;">
        <el-button type="primary" @click="onSearchItemClick">确定</el-button>
        <el-button @click="searchItemVisible = false">取消</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import {
  GetPurPlanListByCondition,
  EditPruPlan,
  InsertPurPlanByHand,
  DeletePurPlan
} from "@/api/safeStockASP";
import { getItemById } from "@/api/orderListASP";
import { downLoadFile } from "@/common/js/downLoadFile";

export default {
  data() {
    return {
      beginTime: '',
      finishTime: '',
      selectStatus: '',
      statusArray: [
        {
          value: '',
          label: '全部'
        },
        {
          value: '1',
          label: '生效'
        },
        {
          value: '2',
          label: '部分到货'
        },
        {
          value: '3',
          label: '完成'
        },
      ],
      statusArray2: [
        {
          value: '1',
          label: '生效'
        },
        {
          value: '2',
          label: '部分到货'
        },
        {
          value: '3',
          label: '完成'
        },
      ],
      itemCondition: '',
      supplyCondition: '',
      planData: [],
      addOrNot: true,
      purPlanModel: {},
      dialogTitle: '',
      dialogVisible: false,
      itemSearch: '',
      searchItemVisible: false
    }
  },
  filters: {
    transStatus(value) {
      switch (value) {
        case "":
          return "全部";
          break;
        case "1":
          return "生效";
          break;
        case "2":
          return "部分到货";
          break;
        case "3":
          return "完成";
          break;
      }
    }
  },
  methods: {
    searchData() {
      var data = {
        beginTime: this.beginTime,
        finishTime: this.finishTime,
        selectStatus: this.selectStatus,
        itemCondition: this.itemCondition,
        supplyCondition: this.supplyCondition
      }
      if (!data.beginTime) {
        data.beginTime = "0001/1/1";
      }
      if (!data.finishTime) {
        data.finishTime = "9999/12/31";
      } else {
        data.finishTime = new Date(new Date(data.finishTime.getTime()).setHours(23, 59, 59, 999));
      }
      this.planData = [];
      GetPurPlanListByCondition(data).then(res => {
        this.planData = res.data;
      })
    },
    onAddClick() {
      this.purPlanModel = {
        SUPPLY_CODE: '',
        ITEM_NO: '',
        PLAN_QUANTITY: '',
        REQ_DATE: new Date(),
        STATE_ID: '1',
        NOTE: ''
      };
      this.addOrNot = true;
      this.dialogTitle = "新增需求计划";
      this.dialogVisible = true;
    },
    searchItemShow() {
      if (!this.addOrNot) return;
      this.itemSearch = "";
      this.searchItemVisible = true;
      this.$nextTick(() => {
        this.$refs.itemSearchInput.focus();
      })
    },
    onSearchItemClick() {
      getItemById({ itemNo: this.itemSearch }, { loading: false }).then(res => {
        if (res.data == null) {
          this.$message({
            message: "不存在该型号!",
            type: "warning",
            duration: 1000
          });
          return;
        }
        this.purPlanModel.ITEM_NO = res.data.ITEM_NO;
        this.purPlanModel.SUPPLY_CODE = res.data.OEM_SUPPLY_ID;
        this.searchItemVisible = false;
      })
    },
    onEditClick(row) {
      this.purPlanModel = JSON.parse(JSON.stringify(row));
      this.addOrNot = false;
      this.dialogTitle = "编辑需求计划";
      this.dialogVisible = true;
    },
    onSaveClick() {
      if (!this.purPlanModel.ITEM_NO ||
        !this.purPlanModel.SUPPLY_CODE ||
        !this.purPlanModel.PLAN_QUANTITY ||
        !this.purPlanModel.REQ_DATE) {
        this.$alert("信息不完整", "提示", {
          confirmButtonText: "确定",
          type: "warning",
        });
        return;
      }
      if (this.addOrNot) {
        //新增
        InsertPurPlanByHand({ plan: this.purPlanModel }).then(res => {
          this.$message({
            message: "新增成功!",
            type: "success",
            duration: 1000
          });
          this.dialogVisible = false;
          this.searchData();
        }).catch(res => {
          this.$alert("新增失败：" + res.msg, "提示", {
            confirmButtonText: "确定",
            type: "warning",
          });
        })
      } else {
        this.purPlanModel.UpdateColumns = ["PLAN_QUANTITY", "REQ_DATE", "STATE_ID", "NOTE"];
        EditPruPlan({ plan: this.purPlanModel }).then(res => {
          this.$message({
            message: "编辑成功!",
            type: "success",
            duration: 1000
          });
          this.dialogVisible = false;
          this.searchData();
        }).catch(res => {
          this.$alert("编辑失败：" + res.msg, "提示", {
            confirmButtonText: "确定",
            type: "warning",
          });
        })
      }
    },
    onDeleteClick(row) {
      if (row.STATE_ID != '1') return;
      this.$confirm("确认删除该计划单吗？", "提示", {
        confirmButtonText: "是",
        cancelButtonText: "否",
        type: "warning",
      }).then(() => {
        DeletePurPlan({ plan: row }).then(res => {
          this.$message({
            message: "删除成功!",
            type: "success",
            duration: 1000
          });
          this.searchData();
        }).catch(res => {
          this.$alert("删除失败：" + res.msg, "提示", {
            confirmButtonText: "确定",
            type: "warning",
          });
        })
      }).catch(() => { });
    },
    exportExcel() {
      var data = {
        beginTime: this.beginTime,
        finishTime: this.finishTime,
        selectStatus: this.selectStatus,
        itemCondition: this.itemCondition,
        supplyCondition: this.supplyCondition
      }
      if (!data.beginTime) {
        data.beginTime = "0001/1/1";
      }
      if (!data.finishTime) {
        data.finishTime = "9999/12/31";
      } else {
        data.finishTime = new Date(new Date(data.finishTime.getTime()).setHours(23, 59, 59, 999));
      }
      downLoadFile(this.Global.baseUrl + `PUR_PLAN/ExportExcel?beginTime=${this.dateFilter(data.beginTime, 'yyyy-MM-dd HH:mm:ss')}
        &finishTime=${this.dateFilter(data.finishTime, 'yyyy-MM-dd HH:mm:ss')}
        &selectStatus=${data.selectStatus}&itemCondition=${data.itemCondition}&supplyCondition=${data.supplyCondition}`);
    }
  },
  mounted() {
    this.beginTime = new Date(new Date().setMonth(new Date().getMonth() - 3));
    this.finishTime = new Date();
    this.searchData();
  },
}
</script>

<style scoped>
.safeStock {
  flex: 1;
  display: flex;
  flex-direction: column;
}
.greenBtn {
  background: #8bc34a;
  color: rgb(255, 255, 255);
}
.flex-card {
  flex: 1;
  display: flex;
  flex-direction: column;
}
</style>
<style>
.flex-card .el-card__body {
  flex: 1;
  display: flex;
  flex-direction: column;
}
</style>
