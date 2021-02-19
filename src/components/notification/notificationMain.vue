<template>
  <el-card class="centerCard">
    <el-input @keyup.enter.native="search()" placeholder="请输入主题关键词" v-model="condition" style="width:300px;margin-bottom:10px;">
      <el-button @click="search()" slot="append" icon="el-icon-search">搜索</el-button>
    </el-input>
    <el-table style="width: 90%" :data="notiData" :row-class-name="tableRowClassName">
      <el-table-column label="主题" header-align="center">
        <template slot-scope="scope">
          <a class="link" @click="showDetail(scope.row)">{{
            scope.row.TITLE
          }}</a>
          <span v-if="dateIsValid(scope.row.ENDDATE)" class="newTooltip">新</span>
        </template>
      </el-table-column>
      <el-table-column label="发布时间" width="120" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.PUBLISHTS | datatrans }}</span>
        </template>
      </el-table-column>
    </el-table>
    <div style="margin:0 25%;" class="block">
      <el-pagination @size-change="handleSizeChange" @current-change="handleCurrentChange" :current-page.sync="currentPage"
        :page-sizes="[20, 50, 100, 150]" :page-size="limit" layout="total,sizes, prev, pager, next, jumper" :total="count">
      </el-pagination>
    </div>
    <el-dialog :show-close="true" :visible.sync="detailVisible" width="1000px" top="5vh" :title="detailTitle" center>
      <div v-html="detailData"></div>
    </el-dialog>
  </el-card>
</template>

<script>
import { GetNotificationAll } from "@/api/notificationASP";
import Cookies from "js-cookie";

export default {
  name: "notificationMain",
  data() {
    return {
      condition: "",
      limit: 20,
      count: 0,
      currentPage: 1,
      detailVisible: false,
      detailTitle: "",
      detailData: "",
      notiData: [
        {
          TITLE: "关于XXXX2",
          PUBLISHTS: "2019/9/10",
          STARTDATE: "2019/9/10",
          ENDDATE: "2019/9/12"
        },
        {
          TITLE: "关于XXXX",
          PUBLISHTS: "2019/9/6",
          STARTDATE: "2019/9/6",
          ENDDATE: "2019/9/9"
        }
      ]
    };
  },
  filters: {
    datatrans(value) {
      //时间戳转化大法
      if (value == "9999/12/31 00:00:00") return "";
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
      return y + "-" + MM + "-" + d;
    }
  },
  methods: {
    dateIsValid(date) {
      var endDate = new Date(date);//失效时间
      endDate.setTime(endDate.getTime() + 24 * 60 * 60 * 1000);
      return endDate - new Date() > 0;
    },
    search() {
      this.currentPage = 1;
      this.getDetail();
    },
    getDetail() {
      var data = {
        cid: Cookies.get('cid'),
        condition: this.condition,
        page: this.currentPage,
        limit: this.limit
      };
      GetNotificationAll(data).then(res => {
        this.notiData = res.data;
        this.count = res.count;
      });
    },
    showDetail(item) {
      item.CONTENT = item.CONTENT.replace(/\[ReplaceMark\]/g, this.Global.fileCenterUrl);//替换网址
      this.detailTitle = item.TITLE;
      this.detailData = item.CONTENT;
      this.detailVisible = true;
    },
    handleSizeChange(val) {
      this.limit = val;
      this.currentPage = 1;
      this.getDetail();
    },
    //翻页获取订单
    handleCurrentChange(val) {
      this.currentPage = val;
      this.getDetail();
    },
    tableRowClassName({ row, rowIndex }) {
      if (rowIndex % 2 == 0) {
        return "success-row";
      }
      return "";
    }
  },
  created() {
    this.notiData = [];
    this.getDetail();
  }
};
</script>

<style scoped>
.centerCard {
  margin: 0 auto;
  position: relative;
}
.link {
  color: #666;
}
.link::before {
  content: "> ";
}
.link:hover {
  color: #fc5121;
}
.newTooltip {
  background-color: #f13f40;
  padding: 2px;
  text-align: center;
  font-size: 12px;
  line-height: 100%;
  color: #fff;
  margin-left: 5px;
}
</style>