<template>
  <div class="zj-flex-page">
    <div class="zj-tbar">
      <el-button icon="el-icon-refresh" size="mini" circle @click="refreshBuyUserData">
      </el-button>
      <span style="margin-left:10px;">下单日期:</span>
      <el-date-picker style="width:130px;" @change="refreshBuyUserData" v-model="beginTime" placeholder="日期区间" size="small">
      </el-date-picker>
      <span>至</span>
      <el-date-picker style="width:130px;" @change="refreshBuyUserData" v-model=" finishTime" placeholder="日期区间" size="small">
      </el-date-picker>
      <el-checkbox v-model="checked" @change="refreshBuyUserData">只看未审核</el-checkbox>
      <el-button style="margin-left:10px;" type="primary" size="small" @click="exportAllBuyUserExcel">导出Excel</el-button>
    </div>
    <div class="zj-table-ct">
      <el-table class="zj-flex-table" height="100%" :data="buyUserData" key="all">
        <el-table-column width="100" prop="CUSTOMER_MAIN_ID1" label="客户代码" align="center"></el-table-column>
        <el-table-column width="120" prop="CUSTOMER_NAME" label="客户名称" align="center"></el-table-column>
        <el-table-column width="120" prop="BUYUSER" label="消费者姓名" align="center"></el-table-column>
        <el-table-column width="100" prop="BUYUSER_PHONE" label="联系电话" align="center"></el-table-column>
        <el-table-column width="120" prop="ORDER_NO" label="订单号" align="center">
          <!-- <template slot-scope="scope">
            <el-button size="small" @click="getOrderDetail(scope.row.ORDER_NO)" type="text">{{ scope.row.ORDER_NO }}
            </el-button>
          </template> -->
        </el-table-column>
        <el-table-column width="100" prop="ITEM_NO" label="型号" align="center"></el-table-column>
        <el-table-column width="100" prop="PRODUCTVERSION_NAME" label="版本名称" align="center"></el-table-column>
        <el-table-column width="120" prop="PROMOTION" label="活动" align="center"></el-table-column>
        <el-table-column width="100" prop="PROMOTION_COST" label="折后金额" align="center">
        </el-table-column>
        <el-table-column width="100" prop="FINAL_COST" label="应付金额" align="center">
        </el-table-column>
        <el-table-column width="100" prop="WEB_TJ_TIME" label="下单日期" align="center"></el-table-column>
        <el-table-column width="70" label="购买凭证" align="center" fixed="right">
          <template slot-scope="scope">
            <el-button size="small" type="text" v-if="scope.row.BUYUSER_PICTURE" @click="showPicture(scope.row.BUYUSER_PICTURE)">
              查看
            </el-button>
            <span v-else>无</span>
          </template>
        </el-table-column>
        <el-table-column width="70" label="上墙附件" align="center" fixed="right">
          <template slot-scope="scope">
            <el-button size="small" type="text" v-if="scope.row.BUYUSER_PICTURE1"
              @click="showPicture(scope.row.BUYUSER_PICTURE1)">查看
            </el-button>
            <span v-else>无</span>
          </template>
        </el-table-column>
        <el-table-column width="100" label="操作" align="center" fixed="right">
          <template slot-scope="scope">
            <el-button size="mini" type="danger" v-if="scope.row.YULAN_CONFIRM == '1'" @click="updateCheck(scope.row, '0')">
              撤销审核
            </el-button>
            <el-button size="mini" type="success" v-else="scope.row.YULAN_CONFIRM == '0'" @click="updateCheck(scope.row, '1')">
              审核通过
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <el-dialog :visible.sync="pictureVisible" width="700px" append-to-body>
      <div style="display: inline-block;margin:5px;cursor:pointer;" v-for="(file,index) in fileList" :key="index">
        <el-image style="width: 200px; height: 200px" :src="file" fit="fill" @click="handleImgClick(index)"
          :preview-src-list="fileList2"></el-image>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import Cookies from "js-cookie";
import { GetAllBuyUserOrder, UpdateModel } from "@/api/orderListASP";
import { downLoadFile } from "@/common/js/downLoadFile";

export default {
  data() {
    return {
      beginTime: '',
      finishTime: '',
      buyUserData: [],
      pictureVisible: false,
      fileList: [],
      fileList2: [],
      checked: true
    }
  },
  methods: {
    refreshBuyUserData() {
      var data = {
        beginTime: this.beginTime,
        finishTime: this.finishTime,
        isCheck: this.checked
      }
      if (!data.beginTime) {
        data.beginTime = "0001/1/1";
      }
      if (!data.finishTime) {
        data.finishTime = "9999/12/31";
      } else {
        data.finishTime = new Date(new Date(data.finishTime.getTime()).setHours(23, 59, 59, 999));
      }
      GetAllBuyUserOrder(data).then(res => {
        this.buyUserData = res.data;
      })
    },
    exportAllBuyUserExcel() {
      var data = {
        beginTime: this.beginTime,
        finishTime: this.finishTime,
        isCheck: this.checked
      }
      if (!data.beginTime) {
        data.beginTime = "0001/1/1";
      }
      if (!data.finishTime) {
        data.finishTime = "9999/12/31";
      } else {
        data.finishTime = new Date(new Date(data.finishTime.getTime()).setHours(23, 59, 59, 999));
      }
      downLoadFile(this.Global.baseUrl + `BUYUSER_INFO/ExportAllBuyUserExcel?beginTime=${this.dateFilter(data.beginTime, 'yyyy-MM-dd HH:mm:ss')}&finishTime=${this.dateFilter(data.finishTime, 'yyyy-MM-dd HH:mm:ss')}&isCheck=${data.isCheck}`);
    },
    showPicture(urls) {
      this.fileList = [];
      if (urls) {
        var list = urls.split(";");
        for (var i = 0; i < list.length - 1; i++) {
          var index = list[i].lastIndexOf("/");
          if (index == -1) index = list[i].lastIndexOf("\\");
          var fileName = list[i].substr(index + 1);
          this.fileList.push(this.Global.baseUrl + list[i]);
        }
        this.pictureVisible = true;
      }
    },
    handleImgClick(index) {
      let tempImgList = [...this.fileList];
      let temp = [];
      for (let i = 0; i < index; i++) {
        temp.push(tempImgList.shift());
      }
      this.fileList2 = tempImgList.concat(temp);
      this.showViewer = true;
    },
    updateCheck(row, type) {
      this.$confirm("确定操作吗", "提示", {
        confirmButtonText: "是",
        cancelButtonText: "否",
        type: "warning",
      }).then(() => {
        var temp = JSON.parse(JSON.stringify(row));
        temp.YULAN_CONFIRM = type;
        temp.UpdateColumns = ["YULAN_CONFIRM"];
        UpdateModel(temp).then(res => {
          this.$message({
            message: "操作成功!",
            type: "success",
            duration: 1000
          });
          row.YULAN_CONFIRM = type;
        })
      }).catch(() => { });
    }
  },
  mounted() {
    this.beginTime = new Date(new Date().setMonth(new Date().getMonth() - 1));
    this.finishTime = new Date();
    this.refreshBuyUserData();
  }
}
</script>

<style scoped>
</style>
