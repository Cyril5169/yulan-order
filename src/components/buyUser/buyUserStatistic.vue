<template>
  <div class="zj-flex-page">
    <div class="zj-tbar">
      <el-button icon="el-icon-refresh" size="mini" circle @click="refreshBuyUserStatistic">
      </el-button>
      <el-button @click="exportStatisticExcel" type="primary" size="small">导出Excel</el-button>
      <span style="margin-left:20px;">显示方式：</span>
      <el-select v-model="selectType" size="small" style="width: 150px;" @change="refreshBuyUserStatistic">
        <el-option label="分组显示" value="group" key="group"></el-option>
        <el-option label="显示全部" value="all" key="all"></el-option>
      </el-select>
    </div>
    <div class="zj-table-ct">
      <el-table v-if="selectType == 'group'" class="zj-flex-table" height="100%" :data="buyUserData" key="group">
        <el-table-column width="120" prop="BUYUSER" label="消费者姓名" align="center"></el-table-column>
        <el-table-column width="150" prop="BUYUSER_PHONE" label="联系电话" align="center"></el-table-column>
        <el-table-column width="160" prop="CRE_DATE" label="创建日期" align="center">
          <template slot-scope="scope">
            {{scope.row.CRE_DATE | dateFilter('yyyy-MM-dd HH:mm:ss')}}
          </template>
        </el-table-column>
        <el-table-column width="160" prop="FIRST_BUY_TIME" label="首次购买日期" align="center">
          <template slot-scope="scope">
            {{scope.row.FIRST_BUY_TIME | dateFilter('yyyy-MM-dd HH:mm:ss')}}
          </template>
        </el-table-column>
        <el-table-column width="160" prop="LAST_BUY_TIME" label="最后购买日期" align="center">
          <template slot-scope="scope">
            {{scope.row.LAST_BUY_TIME | dateFilter('yyyy-MM-dd HH:mm:ss')}}
          </template>
        </el-table-column>
        <el-table-column width="120" prop="BUY_COUNT" label="购买次数" align="center"></el-table-column>
        <el-table-column width="150" prop="MONEY_SUM" label="总订单金额" align="center">
          <template slot-scope="scope">
            <span v-if="isManager === '0'">***</span>
            <span v-else>{{ scope.row.MONEY_SUM }}</span>
          </template>
        </el-table-column>
        <el-table-column label="操作">
          <template slot-scope="scope">
            <a @click="onShowOrderDetailClick(scope.row)">查看订单列表</a>
          </template>
        </el-table-column>
      </el-table>

      <el-table v-else-if="selectType == 'all'" class="zj-flex-table" height="100%" :data="buyUserData" key="all">
        <el-table-column width="120" prop="BUYUSER" label="消费者姓名" align="center"></el-table-column>
        <el-table-column width="120" prop="BUYUSER_PHONE" label="联系电话" align="center"></el-table-column>
        <el-table-column width="120" prop="ORDER_NO" label="订单号" align="center">
          <template slot-scope="scope">
            <el-button size="small" @click="getOrderDetail(scope.row.ORDER_NO)" type="text">{{ scope.row.ORDER_NO }}
            </el-button>
          </template>
        </el-table-column>
        <el-table-column width="100" prop="ITEM_NO" label="型号" align="center"></el-table-column>
        <el-table-column width="100" prop="PRODUCTVERSION_NAME" label="版本名称" align="center"></el-table-column>
        <el-table-column prop="PROMOTION" label="活动" align="center"></el-table-column>
        <el-table-column width="100" prop="PROMOTION_COST" label="折后金额" align="center">
          <template slot-scope="scope">
            <span v-if="isManager === '0'">***</span>
            <span v-else>{{ scope.row.PROMOTION_COST }}</span>
          </template>
        </el-table-column>
        <el-table-column width="100" prop="FINAL_COST" label="应付金额" align="center">
          <template slot-scope="scope">
            <span v-if="isManager === '0'">***</span>
            <span v-else>{{ scope.row.FINAL_COST }}</span>
          </template>
        </el-table-column>
        <el-table-column width="100" prop="WEB_TJ_TIME" label="下单日期" align="center"></el-table-column>
        <el-table-column width="70" label="购买凭证" align="center">
          <template slot-scope="scope">
            <el-button size="small" type="text" v-if="scope.row.BUYUSER_PICTURE" @click="showPicture(scope.row.BUYUSER_PICTURE)">
              查看
            </el-button>
            <span v-else>无</span>
          </template>
        </el-table-column>
        <el-table-column width="70" label="上墙附件" align="center">
          <template slot-scope="scope">
            <el-button size="small" type="text" v-if="scope.row.BUYUSER_PICTURE1"
              @click="showPicture(scope.row.BUYUSER_PICTURE1)">查看
            </el-button>
            <span v-else>无</span>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <el-dialog width="1000px" :title="'[' + selectCustomer.BUYUSER + ']订单列表'" v-if="customerOrderListVisible"
      :visible.sync="customerOrderListVisible">
      <div class="zj-tbar">
        <el-button icon="el-icon-refresh" size="mini" circle @click="refreshOrderDetailData">
        </el-button>
        <el-button @click="exportOrderDetailExcel" type="primary" size="small">导出Excel</el-button>
      </div>
      <el-table height="400" :data="customerOrderListData">
        <el-table-column width="120" prop="ORDER_NO" label="订单号" align="center">
          <template slot-scope="scope">
            <el-button size="small" @click="getOrderDetail(scope.row.ORDER_NO)" type="text">{{ scope.row.ORDER_NO }}
            </el-button>
          </template>
        </el-table-column>
        <el-table-column width="100" prop="ITEM_NO" label="型号" align="center"></el-table-column>
        <el-table-column width="100" prop="PRODUCTVERSION_NAME" label="版本名称" align="center"></el-table-column>
        <el-table-column prop="PROMOTION" label="活动" align="center"></el-table-column>
        <el-table-column width="100" prop="PROMOTION_COST" label="折后金额" align="center">
          <template slot-scope="scope">
            <span v-if="isManager === '0'">***</span>
            <span v-else>{{ scope.row.PROMOTION_COST }}</span>
          </template>
        </el-table-column>
        <el-table-column width="100" prop="FINAL_COST" label="应付金额" align="center">
          <template slot-scope="scope">
            <span v-if="isManager === '0'">***</span>
            <span v-else>{{ scope.row.FINAL_COST }}</span>
          </template>
        </el-table-column>
        <el-table-column width="100" prop="WEB_TJ_TIME" label="下单日期" align="center"></el-table-column>
        <el-table-column width="70" label="购买凭证" align="center">
          <template slot-scope="scope">
            <el-button size="small" type="text" v-if="scope.row.BUYUSER_PICTURE" @click="showPicture(scope.row.BUYUSER_PICTURE)">
              查看
            </el-button>
            <span v-else>无</span>
          </template>
        </el-table-column>
        <el-table-column width="70" label="上墙附件" align="center">
          <template slot-scope="scope">
            <el-button size="small" type="text" v-if="scope.row.BUYUSER_PICTURE1"
              @click="showPicture(scope.row.BUYUSER_PICTURE1)">查看
            </el-button>
            <span v-else>无</span>
          </template>
        </el-table-column>
      </el-table>
    </el-dialog>

    <el-dialog :visible.sync="orderDetailVisible" width="1100px" top="5vh" append-to-body>
      <keep-alive>
        <checkExamine v-if="orderDetailVisible" :isShowButton="false">
        </checkExamine>
      </keep-alive>
    </el-dialog>

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
import { GetBuyUserStatistic, GetCustomerOrderDetail, GetBuyUserAllOrder } from "@/api/orderListASP";
import { downLoadFile } from "@/common/js/downLoadFile";
import checkExamine from "../order/checkExamine";

export default {
  components: {
    checkExamine
  },
  data() {
    return {
      isManager: Cookies.get("isManager"),
      buyUserData: [],
      customerOrderListVisible: false,
      selectCustomer: {},
      customerOrderListData: [],
      orderDetailVisible: false,
      selectType: 'group',
      pictureVisible: false,
      fileList: [],
      fileList2: []
    }
  },
  methods: {
    refreshBuyUserStatistic() {
      if (this.selectType == 'group') {
        GetBuyUserStatistic({
          cid: Cookies.get("cid"),
          //cid: 'C23036'
        }).then(res => {
          this.buyUserData = res.data;
        })
      } else if (this.selectType == 'all') {
        GetBuyUserAllOrder({
          cid: Cookies.get("cid"),
          //cid: 'C23036'
        }).then(res => {
          this.buyUserData = res.data;
        })
      }
    },
    exportStatisticExcel() {
      if (this.selectType == 'group') {
        downLoadFile(this.Global.baseUrl + `BUYUSER_INFO/ExportStatisticExcel?cid=${Cookies.get("cid")}`);
      } else if (this.selectType == 'all') {
        downLoadFile(this.Global.baseUrl + `BUYUSER_INFO/ExportBuyUserAllOrderExcel?cid=${Cookies.get("cid")}`);
      }
    },
    onShowOrderDetailClick(row) {
      this.selectCustomer = row;
      this.customerOrderListVisible = true;
      this.refreshOrderDetailData();
    },
    refreshOrderDetailData() {
      GetCustomerOrderDetail({
        cid: Cookies.get("cid"),
        //cid: 'C23036',
        buyuser: this.selectCustomer.BUYUSER,
        buyuser_phone: this.selectCustomer.BUYUSER_PHONE
      }).then(res => {
        this.customerOrderListData = res.data;
      })
    },
    exportOrderDetailExcel() {
      downLoadFile(this.Global.baseUrl + `BUYUSER_INFO/ExportCustomerOrderDetailExcel?cid=${Cookies.get("cid")}&buyuser=${this.selectCustomer.BUYUSER}&buyuser_phone=${this.selectCustomer.BUYUSER_PHONE}`);
    },
    getOrderDetail(order_no) {
      Cookies.set("ORDER_NO", order_no);
      this.orderDetailVisible = true;
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
  },
  mounted() {
    this.refreshBuyUserStatistic();
  }
}
</script>

<style scoped>
</style>
