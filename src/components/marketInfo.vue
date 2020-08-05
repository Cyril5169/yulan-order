<template>
  <div>
    <el-card class="studyMain">
      <el-table style="width: 95%" :data="studyData" :row-class-name="tableRowClassName">
        <el-table-column label="主题" header-align="center">
          <template slot-scope="scope">
            <span>{{ scope.row.TITLE }}</span>
          </template>
        </el-table-column>
        <el-table-column label="生效状态" width="150" align="center">
          <template slot-scope="scope">
            {{ scope.row.STATE | stateFilter }}
          </template>
        </el-table-column>
        <el-table-column label="填写状态" width="150" align="center">
          <template slot-scope="scope">
            {{ scope.row.completeStatus | comFilter }}
          </template>
        </el-table-column>
        <el-table-column align="center" width="150" label="操作">
          <template slot-scope="scope">
            <el-button v-if="scope.row.completeStatus != 2 && scope.row.STATE == 'PUBLISH'"
              @click="editStudy(scope.row, false)" type="primary" size="mini" icon="el-icon-edit" circle></el-button>
              <el-button v-else
              @click="editStudy(scope.row, true)" type="primary" size="mini" icon="el-icon-search" circle></el-button>
          </template>
        </el-table-column>
      </el-table>
      <el-dialog :show-close="true" :close-on-click-modal="false" :visible.sync="studyVisible" width="900px" top="5vh"
        center>
        <keep-alive>
          <studyContextDetail ref="studyContextDetail" v-if="studyVisible" :selectData="studySelectData" :checkType="checkType"
            @refresh="refreshStudy"></studyContextDetail>
        </keep-alive>
        <span slot="footer" class="dialog-footer">
          <el-button type="primary" @click="submitStudy" v-if="!checkType">提交调查表</el-button>
          <el-button type="primary" @click="studyVisible = false" v-else>确定</el-button>
        </span>
      </el-dialog>
    </el-card>
  </div>
</template>

<script>
import { GetCustomerStudy } from "@/api/studyASP";
import Cookies from "js-cookie";
import studyContextDetail from "./studyContext/studyContextDetail";

export default {
  name: "MarketInfo",
  data() {
    return {
      studyData: [],
      studyVisible: false,
      studySelectData: [],
      checkType: true
    };
  },
  components: {
    studyContextDetail,
  },
  filters: {
    comFilter(value) {
      switch (value) {
        case 0:
          return "未开始";
          break;
        case 1:
          return "未完成";
          break;
        case 2:
          return "已完成";
          break;
      }
    },
    stateFilter(value) {
      switch (value) {
        case "PUBLISH":
          return "生效中";
          break;
        case "COMPLED":
          return "已过期";
          break;
      }
    },
  },
  methods: {
    getDetail() {
      GetCustomerStudy({ cid: Cookies.get("cid") }).then((res) => {
        this.studyData = res.data;
      });
    },
    refreshStudy() {
      this.$alert("提交成功", "提示", {
        confirmButtonText: "确定",
        type: "success",
      });
      this.studyVisible = false;
      this.getDetail();
    },
    editStudy(studyItem, type) {
      this.studySelectData = studyItem;
      this.checkType = type;
      this.studyVisible = true;
    },
    submitStudy() {
      this.$refs.studyContextDetail.submitStudy(); //调用子组件方法
    },
    tableRowClassName({ row, rowIndex }) {
      if (rowIndex % 2 == 0) {
        return "success-row";
      }
      return "";
    },
  },
  created() {
    this.studyData = [];
    this.getDetail();
  },
};
</script>