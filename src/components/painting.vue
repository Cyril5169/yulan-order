<template>
  <div class="centerCard">
    <el-card shadow="hover">
      <div style="margin-bottom:10px;">
        <el-date-picker
          type="date"
          format="yyyy-MM-dd"
          value-format="yyyy-MM-dd"
          placeholder="日期区间"
          v-model="startDate"
          style="width:14%;"
        ></el-date-picker
        >--
        <el-date-picker
          type="date"
          format="yyyy-MM-dd"
          value-format="yyyy-MM-dd"
          placeholder="日期区间"
          v-model="endDate"
          style="width:14%;"
        ></el-date-picker>
        <el-select v-model="status">
          <el-option
            v-for="item in options"
            :key="item.label"
            :label="item.label"
            :value="item.value"
          ></el-option>
        </el-select>
        <el-button type="success" @click="search()" icon="el-icon-search" size="medium"
          >查询</el-button
        >
      </div>
      <el-table
        border
        :data="paintingData"
        style="width: 100%"
        :row-class-name="tableRowClassName"
      >
        <el-table-column
          prop="id"
          label="编号"
          align="center"
        ></el-table-column>
        <el-table-column label="创建时间" align="center">
          <template slot-scope="scope">
            <span>{{ scope.row.createTs | datatrans }}</span>
          </template>
        </el-table-column>
        <el-table-column
          prop="realName"
          label="玉兰业务员"
          align="center"
        ></el-table-column>
        <el-table-column
          prop="officeTel"
          width="220"
          label="联系电话"
          align="center"
        ></el-table-column>
        <el-table-column
          prop="imageCount"
          label="图片数"
          width="80"
          align="center"
        ></el-table-column>
        <el-table-column label="状态" align="center">
          <template slot-scope="scope">
            <span>{{ scope.row.state | transStatus }}</span>
          </template>
        </el-table-column>
        <el-table-column align="center" label="操作">
          <template slot-scope="scope">
            <el-button
              @click="lookIt(scope.row)"
              type="warning"
              icon="el-icon-search"
              size="mini"
            ></el-button>
          </template>
        </el-table-column>
      </el-table>
      <div style="margin:0 35%;" class="block">
        <el-pagination
          @current-change="handleCurrentChange"
          :current-page.sync="currentPage"
          :page-size="limit"
          layout="total, prev, pager, next, jumper"
          :total="count"
        ></el-pagination>
      </div>
    </el-card>

    <el-dialog title="查看图片" :width="DiaWidth" :visible.sync="BigPic">
      <img :style="ImgStyle" ref="box" :src="BIGimgPath" @load="picLoad" />
    </el-dialog>
    <!-- 大表 -->
    <el-dialog
      title="委托喷绘确认表"
      :visible.sync="PaintingDia"
      :close-on-click-modal="false"
      width="70%"
    >
      <!-- 查看区 -->
      <div class="table-c">
        <table width="100%" border="0" cellspacing="0" cellpadding="0">
          <tr style="height:55px;">
            <td style="font-size:20px;" colspan="6">
              <h3 style="margin:0;">广东玉兰集团股份有限公司</h3>
              <h4 style="margin:0;">委托人来样喷绘确认表</h4>
            </td>
          </tr>
          <tr>
            <td class="grayTD">编号</td>
            <td>{{ tableData.id }}</td>
            <td class="grayTD">建立人</td>
            <td>{{ tableData.erpCreator }}</td>
            <td class="grayTD">建立时间</td>
            <td>{{ tableData.createTs | datatrans }}</td>
          </tr>
          <tr class="tableCol">
            <td colspan="4">委托人基本信息</td>
            <td colspan="2">受托人</td>
          </tr>
          <tr>
            <td class="grayTD" colspan="2">名称</td>
            <td colspan="2">{{ tableData.cname }}</td>
            <td colspan="2" rowspan="3">广东玉兰集团股份有限公司</td>
          </tr>
          <tr>
            <td class="grayTD" colspan="2">联系人</td>
            <td colspan="2">{{ tableData.customerAgent }}</td>
          </tr>
          <tr>
            <td class="grayTD" colspan="2">电话</td>
            <td colspan="2">{{ tableData.officeTel }}</td>
          </tr>

          <tr class="tableCol">
            <td colspan="6">委托人来图定制要求</td>
          </tr>
          <tr>
            <td colspan="1">序号</td>
            <td colspan="2">图片上传</td>
            <td colspan="1">规格</td>
            <td colspan="2">定制要求</td>
          </tr>
          <tr v-for="item of abdrImage" :key="item.index">
            <td colspan="1">{{ item.imageIndex }}</td>
            <td colspan="2">
              <el-tooltip
                class="item"
                effect="dark"
                content="点击放大图片"
                placement="top"
              >
                <img
                  @click="showBIG(item.imagePath)"
                  class="IMG"
                  :src="item.imagePath"
                />
              </el-tooltip>
            </td>
            <td colspan="1">{{ item.specifications }}</td>
            <td colspan="2">{{ item.memo }}</td>
          </tr>
          <tr>
            <td colspan="2">委托人来图版权保证声明</td>
            <td colspan="4">
              <br />
              <p>
                本人确认对其提供给受托人用于产品定制的图片拥有著作权或使用权，已保证其来源合法。受托人仅
              </p>
              <p>
                按照本人提供的图片进行相应定制提供给本人，无义务对本人提供的图片进行实质审查。
                本人因该图片的
              </p>
              <p>
                著作权或使用权问题与第三方发生纠纷，受托人将不承担任何的法律责任，由此造成的损失由本人全部承担。
              </p>
              <p></p>
              <br />
              <br />
              <p v-show="!agree">
                受托人签名（盖章）：{{
                  tableData.customerAgent
                }}&nbsp;&nbsp;&nbsp;&nbsp;确认时间：{{
                  tableData.reassureTs | datatrans
                }}
              </p>
            </td>
          </tr>
        </table>

        <div v-show="agreeJudge" style="width:180px;margin:0 auto;">
          <br />
          <el-button type="success" @click="_changeStatus('同意')"
            >同 意</el-button
          >
          <el-button type="danger" @click="_changeStatus('不同意')"
            >不同意</el-button
          >
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import {
  getPaintingList,
  changeStatus,
  getWaterNumber,
  AddImage
} from "@/api/painting";
import { mapMutations, mapActions } from "vuex";
import Cookies from "js-cookie";
//玉兰
const Quest = "http://14.29.223.114:10250/yulan-capital";
const Head = "http://14.29.223.114:10250/upload";
export default {
  name: "BankProof",
  data() {
    return {
      DiaWidth: "",
      ImgStyle: {},
      BIGimgPath: "",
      BigPic: false,
      abdrImage: [],
      agree: true,
      agreeJudge: true,
      PaintingDia: false,
      limit: 8,
      count: 0,
      currentPage: 1,
      cid: "",
      startDate: "",
      endDate: "",
      status: "CUSTOMERAFFIRM", //'CUSTOMERAFFIRM',
      options: [
        {
          label: "已同意",
          value: "APPROVED"
        },
        {
          label: "不同意",
          value: "CANCELED"
        },
        {
          label: "客户确认中",
          value: "CUSTOMERAFFIRM"
        }
      ],
      paintingData: [],
      tableData: {}
    };
  },
  created: function() {
    this._getList();
    this.IconReflash();
  },
  filters: {
    transStatus(value) {
      switch (value) {
        case "APPROVED":
          return "已同意";
          break;
        case "CANCELED":
          return "不同意";
          break;
        case "ONCREATE":
          return "处理中";
          break;
        case "CUSTOMERAFFIRM":
          return "客户确认中";
          break;
      }
    },
    datatrans(value) {
      //时间戳转化大法
      if (value == null) {
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
      return y + "-" + MM + "-" + d + " " + h + ":" + m + ":" + s;
    }
  },
  methods: {
    picLoad() {
      // let heightStyle = this.$refs.box;
      // let theHeight = window.getComputedStyle(this.$refs.box).height;
      let theHeight = this.$refs.box.offsetHeight;
      let theWidth = this.$refs.box.offsetWidth;
      let theBit = 0.8;
      if (theHeight < 600 || theWidth < 600) {
        this.ImgStyle.width = theWidth + "px";
        this.ImgStyle.height = theHeight + "px";
        this.DiaWidth = theWidth + 50 + "px";
      } else {
        this.ImgStyle.width = theWidth * theBit + "px";
        this.ImgStyle.height = theHeight * theBit + "px";
        this.DiaWidth = theWidth * theBit + 50 + "px";
      }
    },
    //角标更新
    IconReflash() {
      this.$root.$emit('refreshBadgeIcon','painting');
    },
    //同意与否
    _changeStatus(YN) {
      let url =
        Quest + "/AirbrushDesignerAssure/updateAirbrushDesignerAssure.do";
      let data = {
        id: this.tableData.id,
        state: YN
      };
      let alertCode = `操作成功，${YN}该委托书`;
      changeStatus(url, data).then(res => {
        this.PaintingDia = false;
        this.$alert(alertCode, "提示", {
          confirmButtonText: "确定",
          type: "success"
        });
        this._getList();
        this.IconReflash();
      });
    },
    //查看表格
    lookIt(tab) {
      if (tab.state == "CUSTOMERAFFIRM") {
        this.agreeJudge = true;
      } else {
        this.agreeJudge = false;
      }
      if (tab.state != "APPROVED") {
        this.agree = true;
      } else {
        this.agree = false;
      }
      this.tableData = tab;
      if (tab.abdrImage.length) {
        if (tab.abdrImage[0].imagePath.startsWith(Head)) {
        } else {
          for (let i = 0; i < tab.abdrImage.length; i++) {
            tab.abdrImage[i].imagePath = Head + tab.abdrImage[i].imagePath;
          }
        }
      }
      this.abdrImage = tab.abdrImage;
      this.PaintingDia = true;
    },
    //查询
    search() {
      this.currentPage = 1;
      this._getList();
    },
    //获取喷绘列表
    _getList() {
      let url = Quest + "/AirbrushDesignerAssure/getAirbrushDesignerAssure.do";
      let data = {
        cid: Cookies.get("cid"), //'', //客户ID
        startDate: this.startDate, //开始日期
        endDate: this.endDate, //结束日期
        state: this.status, //确认书状态
        limit: this.limit, //页数
        page: this.currentPage //一页几条
      };
      if (this.startDate != "" || this.endDate != "") {
        data.startDate = this.startDate + "00:00:00";
        data.endDate = this.endDate + "23:59:59";
      }
      getPaintingList(url, data).then(res => {
        this.paintingData = res.airbrushDesignerAssureList;
        if (res.airbrushDesignerAssureList.length > 0) {
          this.count = res.airbrushDesignerAssureList[0].total;
        }
      });
    },
    //放大图片
    showBIG(BIGimgPath) {
      this.BigPic = true;
      this.BIGimgPath = BIGimgPath;
    },
    //隔行变色
    tableRowClassName({ row, rowIndex }) {
      if (rowIndex % 2 == 0) {
        return "success-row";
      }
      return "";
    },
    //翻页
    handleCurrentChange(val) {
      this.currentPage = val;
      this._getList();
    },
    ...mapMutations("badge", ["changeBadge"])
  }
};
</script>

<style scoped>
.centerCard p{
  margin: 0;
}
.IMG {
  height: 170px;
  width: 170px;
  cursor: pointer;
}
.BIGimg {
  width: 600px;
  height: 600px;
}
.grayTD {
  background: rgb(241, 242, 243);
}
.tableCol {
  background: #f0f9eb;
}
.table-c table {
  border-right: 1px solid black;
  border-bottom: 1px solid black;
}
.table-c table td {
  border-left: 1px solid black;
  border-top: 1px solid black;
  height: 50px;
  text-align: center;
  font-size: 16px;
}
</style>

<style>
.el-table .success-row {
  background: #f0f9eb;
}
</style>