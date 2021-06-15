<!--客户的投诉界面-->
<template>
  <div class="centerCard">
    <el-card shadow="hover">
      <div slot="header">
        <span class="fstrong f16">投诉反馈</span>
      </div>

      <div id="tbar" class="tbarStyle">
        <el-date-picker
          type="date"
          format="yyyy-MM-dd"
          value-format="yyyy-MM-dd"
          placeholder="查询开始日期"
          v-model="beginTime"
          style="width:14%;"
        ></el-date-picker>
        --
        <el-date-picker
          type="date"
          format="yyyy-MM-dd"
          value-format="yyyy-MM-dd"
          placeholder="查询截止日期"
          v-model="finishTime"
          style="width:14%;"
        ></el-date-picker>

        <el-select
          v-model="SELECT_STATUS"
          style="margin-left:10px;width:130px;"
          placeholder="状态"
        >
          <el-option
            v-for="item in statusArray"
            :key="item.label"
            :label="item.label"
            :value="item.value"
          ></el-option>
        </el-select>

        <el-input
          @keyup.enter.native="search()"
          placeholder="请输入单号进行查询"
          v-model="SEARCHKEY"
          style="width:220px;margin-left:10px"
        >
        </el-input>
        <el-button
          size="medium"
          type="success"
          style="margin-left:10px"
          @click="search()"
          >查询</el-button
        >
      </div>

      <div style="margin-top:10px">
        <el-table
          border
          :data="complaintData"
          style="width: 100%"
          class="table_1"
        >
          <el-table-column
            prop="SALE_NO"
            label="提货单号"
            align="center"
            width="150px"
          ></el-table-column>
          <el-table-column
            prop="C_TRANSBILL"
            label="物流单号"
            align="center"
            width="150px"
          ></el-table-column>
          <el-table-column
            prop="CUSTOMER_CODE"
            label="客户代码"
            align="center"
            width="100px"
          ></el-table-column>
          <el-table-column
            prop="CUSTOMER_NAME"
            label="客户名称"
            align="center"
          ></el-table-column>
          <el-table-column
            prop="TYPE"
            label="投诉类型"
            align="center"
            width="100px"
          ></el-table-column>
          <el-table-column prop="SUBMITTS" label="投诉时间" align="center" width="120px">
            <template slot-scope="scope">
              <span>{{ scope.row.SUBMITTS | datatrans }}</span>
            </template>
          </el-table-column>
          <el-table-column label="状态" align="center" width="150px">
            <template slot-scope="scope">
              <span>{{ scope.row.STATUS | transStatus }}</span>
            </template>
          </el-table-column>
          <el-table-column align="center" label="操作" width="100px">
            <template slot-scope="scope">
              <el-button
                v-if="scope.row.STATUS != 1"
                @click="_CheckDetail(scope.row.SID)"
                type="warning"
                size="mini"
                icon="el-icon-search"
                circle
              ></el-button>
              <el-button
                v-if="scope.row.STATUS == 1"
                @click="_EditDetail(scope.row.SID)"
                type="primary"
                size="mini"
                icon="el-icon-edit"
                circle
              ></el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>

      <div style="margin:0 25%;margin-top:10px" class="block">
        <el-pagination
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
          :current-page.sync="currentPage"
          :page-sizes="[5, 10, 15, 20]"
          :page-size="limit"
          layout="total,sizes, prev, pager, next, jumper"
          :total="count"
        ></el-pagination>
      </div>
    </el-card>

    <el-dialog
      :visible.sync="complaintDetail"
      :close-on-click-modal="false"
      width="40%"
    >
      <!-- 查看区 -->
      <div v-show="isCheck" class="table-c">
        <table width="100%" border="0px" cellspacing="0px" cellpadding="0">
          <tr class="grayTD">
            <td style="font-size:20px;height:30px;" colspan="4">投诉登记表</td>
          </tr>
          <tr>
            <td class="grayTD" style="width:16%;height:15px">客户代码</td>
            <td style="width:34%;height:15px">{{ tableData.CUSTOMER_CODE }}</td>
            <td class="grayTD" style="width:16%;height:15px">客户名称</td>
            <td style="width:34%;height:15px">{{ tableData.CUSTOMER_NAME  }}</td>
          </tr>
          <tr>
            <td class="grayTD" style="height:15px">提货单号</td>
            <td style="height:15px">{{ tableData.SALE_NO }}</td>

            <td class="grayTD" style="height:15px">物流单号</td>
            <td style="height:15px">{{ tableData.C_TRANSBILL }}</td>
          </tr>
          <tr>
            <td class="grayTD" style="height:15px">订单号</td>
            <td style="height:15px">{{ tableData.DINGDANHAO }}</td>
            <td class="grayTD" style="height:15px">产品型号</td>
            <td style="height:15px">{{ tableData.SALENO }}</td>
          </tr>

          <tr>
            <td class="grayTD" style="font-size:20px;height:30px" colspan="4">
              投诉信息
            </td>
          </tr>

          <tr>
            <td class="grayTD" colspan="1" style="height:15px">投诉类型</td>
            <td colspan="1" style="height:15px">{{ tableData.TYPE }}</td>
            <td class="grayTD" colspan="1" style="height:15px">数量</td>
            <td v-if="tableData.TYPE == '丢失'" colspan="1" style="height:15px">
              {{ tableData.LOSED_QUANTITY }}
            </td>
            <td v-if="tableData.TYPE == '破损'" colspan="1" style="height:15px">
              {{ tableData.DAMAGED_QUANTITY }}
            </td>
            <td v-else class="grayTD" colspan="1" style="height:15px"></td>
          </tr>

          <tr>
            <td class="grayTD" colspan="1" style="height:60px;">投诉内容</td>
            <td colspan="3" style="height:60px;">{{ tableData.MEMO }}</td>
          </tr>

          <tr v-show="isCheck">
            <td
              class="grayTD"
              colspan="1"
              rowspan="1"
              border="0px"
              style="height:35px"
            >
              处理结果
            </td>
            <td
              v-if="tableData.STATUS == 2 || tableData.STATUS == 3"
              colspan="3"
              rowspan="1"
              style="height:35px"
            >
              {{ tableData.PROCESSDESC }}
            </td>
            <td
              v-if="tableData.STATUS != 2 && tableData.STATUS != 3"
              colspan="3"
              rowspan="1"
              style="height:35px"
            >
              暂无处理结果
            </td>
          </tr>

          <tr v-show="isCheck">
            <td
              class="grayTD"
              colspan="1"
              rowspan="2"
              border="0px"
              style="height:35px"
            >
              服务评价
            </td>
            <td
              v-if="tableData.STATUS == 3"
              colspan="3"
              rowspan="1"
              style="height:35px"
            >
              {{ tableData.WLTS_THINK | rateTrans }}
            </td>
            <td
              v-if="tableData.STATUS != 3"
              colspan="3"
              rowspan="1"
              style="height:35px"
            >
              暂无评价回复
            </td>
          </tr>
        </table>
      </div>

      <div v-show="isCheck" style="margin-top:5px;font-weight:bold;">
        <table width="100%" border="0px" cellspacing="0px" cellpadding="0">
          <tr >
             <td style="width:10%">提交时间：</td>
             <td style="width:20%;margin-left:-30px;">{{ tableData.SUBMITTS| datatransDetail }}</td>
              <td style="width:10%">处理人：</td>
             <td style="width:20%">{{ tableData.OPERATOR }}</td>
          </tr>

          <tr >
             <td>处理时间：</td>
             <td>{{tableData.PROCESSTS| datatransDetail}}</td>
            <td>评价时间：</td>
             <td>{{ tableData.FEEDBACKTS| datatransDetail}}</td>
          </tr>
        </table>   
      </div>

      
      <!-- 编辑区 -->
      <div v-show="isEdit" class="table-c">
        <table width="100%" border="0" cellspacing="0" cellpadding="0">
          <tr class="grayTD">
            <td style="font-size:20px;height:30px;" colspan="4">投诉登记表</td>
          </tr>

          <tr>
            <td class="grayTD" style="width:16%;height:15px">客户代码</td>
            <td v-if="isEdit" style="width:34%;height:15px" class="grayTD">
              {{ submit.CUSTOMER_CODE }}
            </td>
            <td v-else style="width:34%;height:15px" class="grayTD">
              (提交后自动生成)
            </td>
            <td class="grayTD" style="width:16%;height:15px">客户名称</td>
            <td v-if="isEdit" style="width:34%;height:15px" class="grayTD">
              {{ submit.CUSTOMER_NAME}}
            </td>
            <td v-else style="width:34%;height:15px" class="grayTD">
              (提交后自动生成)
            </td>
          </tr>

          <tr>
            <td class="grayTD" style="height:15px">提货单号</td>
            <td class="grayTD" style="height:15px">{{ submit.SALE_NO }}</td>
            <td class="grayTD" style="height:15px">物流单号</td>
            <td class="grayTD" style="height:15px">{{ submit.C_TRANSBILL }}</td>
          </tr>
          <tr>
            <td class="grayTD" style="height:15px">订单号</td>
            <td class="grayTD" style="height:15px">{{ submit.DINGDANHAO }}</td>
            <td class="grayTD" style="height:15px">产品型号</td>
            <td class="grayTD" style="height:15px">{{ submit.SALENO }}</td>
          </tr>

          <tr>
            <td class="grayTD" style="font-size:20px;height:30px" colspan="4">
              投诉信息
            </td>
          </tr>

          <tr>
            <td class="grayTD" colspan="1" style="height:20px">投诉类型</td>
            <td class="grayTD" colspan="1" style="height:20px">
              {{ submit.TYPE }}
            </td>
            <td class="grayTD" colspan="1" style="height:20px">数量</td>
            <td
              v-if="submit.TYPE == '丢失'"
              class="grayTD"
              colspan="1"
              style="height:20px"
            >
              {{ submit.LOSED_QUANTITY }}
            </td>
            <td
              v-if="submit.TYPE == '破损'"
              class="grayTD"
              colspan="1"
              style="height:20px"
            >
              {{ submit.DAMAGED_QUANTITY }}
            </td>
            <td v-else class="grayTD" colspan="1" style="height:20px"></td>
          </tr>

          <tr>
            <td class="grayTD" colspan="1" rowspan="1" style="height:50px;">
              投诉内容
            </td>
            <td
              v-if="submit.SUBMITTS == ''"
              colspan="3"
              rowspan="1"
              style="height:50px;"
            >
              <el-input
                v-model="submit.MEMO"
                type="textarea"
                maxlength="200"
                placeholder="（请输入投诉内容和要求）"
                clearable
                class="inputStyle"
              >
              </el-input>
            </td>
            <td
              v-if="submit.SUBMITTS != ''"
              colspan="3"
              rowspan="1"
              style="height:60px"
              class="grayTD"
            >
              {{ submit.MEMO }}
            </td>
          </tr>

          <tr>
            <td
              class="grayTD"
              colspan="1"
              rowspan="1"
              border="0px"
              style="height:35px"
            >
              处理结果
            </td>
            <td colspan="3" rowspan="1" style="height:35px">
              <el-input
                v-model="submit.PROCESSDESC"
                type="textarea"
                maxlength="200"
                placeholder="（请输入处理结果）"
                clearable
                class="inputStyle"
              >
              </el-input>
            </td>
          </tr>
        </table>

        <div style="margin:0 auto; width:75px;">
          <br />
          <el-button type="success" v-show="isEdit" @click="_editSubmit()"
            >确 定</el-button
          >
          <!-- 编辑时的按钮 -->
        </div>
      </div>


    </el-dialog>
  </div>
</template>


<script>
import {
  GetAllComplaintInfo,
  GetAllUserComplaint,
  GetAllComplaint,
  addSubmit,
  editSubmit,
  CheckDetailByID
} from "@/api/complaintASP";
import { mapMutations } from "vuex";
import Cookies from "js-cookie";
export default {
  name: "ComplaintReply",
  data() {
    return {
      tableData: [],
      submit: [],
      companyId: "",
      CID: "", //客户账号
      CNAME: "", //客户名
      beginTime: "", //查询的开始时间
      finishTime: "", //查询的结束时间
      SEARCHKEY: "", //搜索栏关键字
      SELECT_STATUS: 1, //存储下拉框的值
      isProcessed: false, //已处理
      isFeedback: false, //已评价
      isEdit: false, //编辑记录
      isCheck: false, //查看记录
      complaintDetail: false,
      limit: 10,
      count: 0,
      currentPage: 1,
      statusArray: [
        {
          label: "全部状态",
          value: 0
        },
        {
          label: "未处理",
          value: 1
        },
        {
          label: "已处理未评价",
          value: 2
        },
        {
          label: "已处理已评价",
          value: 3
        }
      ],
      typeArray: [
        {
          label: "晚点",
          value: "晚点"
        },
        {
          label: "破损",
          value: "破损"
        },
        {
          label: "丢失",
          value: "丢失"
        },
        {
          label: "服务",
          value: "服务"
        },
        {
          label: "其他",
          value: "其他"
        }
      ],
      complaintData: []
    };
  },
  created: function() {
    this.refresh();
  },
  filters: {
    transStatus(value) {
      switch (value) {
        case 1:
          return "未处理";
          break;
        case 2:
          return "已处理未评价";
          break;
        case 3:
          return "已处理已评价";
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
      return y + "-" + MM + "-" + d + " " + h + ":" + m ;
    },
    rateTrans(value) {
      switch (value) {
        case "1":
          return "极差";
        case "2":
          return "失望";
        case "3":
          return "一般";
        case "4":
          return "满意";
        case "5":
          return "惊喜";
      }
    }
  },
  methods: {
    //获取所有的投诉信息
    _GetAllComplaintInfo() {
      this.complaintData = [];
      GetAllComplaintInfo()
        .then(res => {
          this.complaintData = res.data;
        })
        .catch(res => {});
    },
    //模糊搜索
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
    //翻页获取投诉信息
    handleCurrentChange(val) {
      this.currentPage = val;
      this.refresh();
    },
    //查询满足条件的该用户的投诉信息
    refresh() {
      var data = {
        companyId: Cookies.get("companyId"),
        limit: this.limit,
        page: this.currentPage,
        CID: Cookies.get("cid"),
        beginTime: this.beginTime,
        finishTime: this.finishTime,
        STATUS: this.SELECT_STATUS,
        SEARCHKEY: this.SEARCHKEY
      };
      if (!data.beginTime) {
        data.beginTime = "0001/1/1";
      }
      if (!data.finishTime) {
        data.finishTime = "9999/12/31";
      } else {
        data.finishTime = data.finishTime + " 23:59:59";
      }
        GetAllUserComplaint(data).then(res => {
        this.count = res.count;
        this.complaintData = res.data;
      });
    },
    //查看列表详情
    _CheckDetail(val) {
      this.tableData = [];
      let data = {
        SID: val
      };
      (this.CNAME = Cookies.get("realName")),
        CheckDetailByID(data).then(res => {
          if (res.count > 0) {
            this.tableData = res.data[0];
          }
          this.isEdit = false;
          this.isCheck = true;
          this.complaintDetail = true;
        });
    },
    //编辑列表详情
    _EditDetail(val) {
      let data = {
        SID: val
      };
      (this.CNAME = Cookies.get("realName")),
        CheckDetailByID(data).then(res => {
          if (res.count > 0) {
            this.submit = res.data[0];
          }
          this.isEdit = true;
          this.isCheck = false;
          this.complaintDetail = true;
        });
    },
    //编辑列表详情修改
    _editSubmit() {
      this.submit.OPERATOR = Cookies.get("realName");
      //判断是否填完所有信息
      if (
        this.submit.SALE_NO == "" ||
        this.submit.C_TRANSBILL == "" ||
        this.submit.TYPE == "" ||
        this.submit.PROCESSDESC == ""
      ) {
        this.$alert("请完善信息", "提示", {
          confirmButtonText: "确定",
          type: "warning"
        });
        return;
      }
      if (
        this.submit.DAMAGED_QUANTITY == "" ||
        this.submit.DAMAGED_QUANTITY == null
      ) {
        this.submit.DAMAGED_QUANTITY = 0;
      }
      if (
        this.submit.LOSED_QUANTITY == "" ||
        this.submit.LOSED_QUANTITY == null
      ) {
        this.submit.LOSED_QUANTITY = 0;
      }
      editSubmit(this.submit).then(res => {
        if (res.code == 0) {
          this.$alert("处理成功，交由客户进行评价", "提示", {
            confirmButtonText: "确定",
            type: "success"
          });
          this.currentPage = 1;
          this.releaseBadge("complaint2");//刷新角标
          this.refresh();
        } else {
          this.$alert("处理失败，请稍后重试", "提示", {
            confirmButtonText: "确定",
            type: "warning"
          });
        }
      });
      this.complaintDetail = false;
    },
    ...mapMutations("badge", ["addBadge", "releaseBadge"]),

  }
};
</script>

<style>
.centerCard h4{
  margin: 0;
}
.table_1 .el-table__row {
  height: 6px;
}
</style>
<style scoped>
.table-c table {
  border-right: 1px solid black;
  border-bottom: 1px solid black;
}
.table-c table td {
  border-left: 1px solid black;
  border-top: 1px solid black;
  height: 45px;
  text-align: center;
  font-size: 16px;
}
.tableCol {
  background: #f0f9eb;
}
.grayTD {
  background: rgb(241, 242, 243);
}
.headerStyle {
  display: inline-block;
  width: 100px;
  font-weight: bold;
}
.ISimg {
  width: 100px;
  height: 100px;
  cursor: pointer;
}
.BIGimg {
  width: 333px;
  height: 333px;
}
.inputWidth {
  width: 220px;
}
.tbarStyle {
  margin-bottom: 13px;
}
.statusCombobox {
  margin-left: 10px;
}
</style>

<style>
.el-table .success-row {
  background: #f0f9eb;
}

.avatar-uploader .el-upload {
  border: 1px dashed black;
  border-radius: 6px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
}
.avatar-uploader .el-upload:hover {
  border-color: #409eff;
}
.avatar-uploader-icon {
  font-size: 28px;
  color: #8c939d;
  width: 30px;
  height: 30px;
  line-height: 30px;
  text-align: center;
}
.avatar {
  width: 30px;
  height: 30px;
  display: block;
}
.inputStyle {
  border: 0;
  height: 100%;
  width: 100%;
  font-size: 16px;
  text-align: center;
}
.table-c .el-textarea__inner {
    height:34px;
    display: block;
    resize: vertical;
    padding: 1px 1px;
    -webkit-box-sizing: border-box;
    box-sizing: border-box;
    width: 100%;
    font-size: inherit;
    background-image: none;
    border: 1px solid
    #DCDFE6;
        border-top-color: rgb(220, 223, 230);
        border-right-color: rgb(220, 223, 230);
        border-bottom-color: rgb(220, 223, 230);
        border-left-color: rgb(220, 223, 230);
    border-radius: 4px;
    -webkit-transition: border-color .2s cubic-bezier(.645,.045,.355,1);
    transition: border-color .2s cubic-bezier(.645,.045,.355,1);
}
</style>