<template>
  <div class="centerCard">
    <el-card shadow="hover">
      <div class="tbarStyle">
        <el-date-picker type="date" format="yyyy-MM-dd" value-format="yyyy-MM-dd" placeholder="查询开始日期" v-model="beginTime"
          style="width:12%;"></el-date-picker>
        --
        <el-date-picker type="date" format="yyyy-MM-dd" value-format="yyyy-MM-dd" placeholder="查询截止日期" v-model="finishTime"
          style="width:12%;"></el-date-picker>
        <el-select v-model="status" style="margin-left: 10px;width:12%;" placeholder="全部状态">
          <el-option v-for="item in options" :key="item.label" :label="item.label" :value="item.value"></el-option>
        </el-select>
        <el-input @keyup.enter.native="search()" placeholder="可搜索单号、申请人、实施形式" v-model="find" style="width:250px;" clearable>
        </el-input>
        <el-button size="medium" type="success" style="margin-left: 10px" @click="search()">查询</el-button>
      </div>
      <el-table border :data="imageStoreData" style="width: 100%" :row-class-name="tableRowClassName">
        <el-table-column width="130" prop="ID" label="申请单号" align="center"></el-table-column>
        <el-table-column prop="CREATER" label="申请人" align="center" width="80"></el-table-column>
        <el-table-column width="100" label="申请时间" align="center">
          <template slot-scope="scope">
            <span>{{ scope.row.DATE_CRE | datatrans }}</span>
          </template>
        </el-table-column>
        <el-table-column width="80" label="店面形式" align="center">
          <template slot-scope="scope">
            <span>{{ scope.row.STORE_FORM | formTrans }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="STORE_AREA" label="店面面积(m2)" align="center" width="70"></el-table-column>
        <el-table-column prop="STORE_PLIE" label="层数" align="center" width="60"></el-table-column>
        <el-table-column width="110" label="计划动工时间" align="center">
          <template slot-scope="scope">
            <span>{{ scope.row.PLAN_DATE | datatrans }}</span>
          </template>
        </el-table-column>
        <el-table-column width="80" label="实施形式" align="center">
          <template slot-scope="scope">
            <span>{{ scope.row.IMPLEMENTTATION_FORM | formTrans2 }}</span>
          </template>
        </el-table-column>
        <el-table-column width="80" label="上门测量" align="center">
          <template slot-scope="scope">
            <span v-if="scope.row.MEASURE == 1">是</span>
            <span v-else>否</span>
          </template>
        </el-table-column>
        <el-table-column width="95" label="状态" align="center">
          <template slot-scope="scope">
            <span>{{ scope.row.STATUS | transStatus }}</span>
          </template>
        </el-table-column>
        <el-table-column label="付款凭证" align="center" width="130">
          <template slot-scope="scope">
            <el-link type="primary" size="mini" @click="showImage(scope.row.PAYMENT)">{{ scope.row.PAYMENT }}</el-link>
          </template>
        </el-table-column>
        <el-table-column width="60" label="附件" align="center">
          <template slot-scope="scope">
            <a v-if="scope.row.ATTACHMENT_FILE != ''" title="点击下载压缩包" class="attachLink"
              @click="downLoadCompress(scope.row.ATTACHMENT_FILE_FOLDER)">{{ scope.row.ATTACHMENT_FILE.split(";").length - 1 }}个</a>
            <span v-else>0个</span>
          </template>
        </el-table-column>
        <el-table-column width="60" label="设计结果" align="center">
          <template slot-scope="scope">
            <a v-if="scope.row.GM_FILE != ''" title="点击下载压缩包" class="attachLink"
              @click="downLoadCompress(scope.row.GM_FILE_FOLDER)">{{ scope.row.GM_FILE.split(";").length - 1 }}个</a>
            <span v-else>暂无</span>
          </template>
        </el-table-column>
        <el-table-column align="center" label="操作">
          <template slot-scope="scope">
            <el-button @click="checkDetail(scope.row)" type="success" v-if="scope.row.STATUS != 2" icon="el-icon-search"
              size="mini" circle></el-button>
            <el-button @click="checkDetail(scope.row)" v-if="scope.row.STATUS == 2" type="primary" icon="el-icon-edit" size="mini"
              circle></el-button>
          </template>
        </el-table-column>
      </el-table>
      <div style="margin:0 25%;" class="block">
        <el-pagination @size-change="handleSizeChange" @current-change="handleCurrentChange" :current-page.sync="currentPage"
          :page-sizes="[5, 10, 15, 20]" :page-size="limit" layout="total,sizes,prev, pager, next, jumper" :total="count">
        </el-pagination>
      </div>
    </el-card>

    <el-dialog :visible.sync="imageStoreDetail" :close-on-click-modal="false" width="1000px" top="5vh">
      <!-- 编辑区 -->
      <div class="table-c">
        <h2 style="text-align:center;margin:0 0 10px 0;">
          形象店建设申请表
        </h2>
        <h3 v-if="EDITorCHECK">
          提交时间：{{ tableData.DATE_CRE | datatrans }}
        </h3>
        <h3 v-if="
            (EDITorCHECK || newORedit) &&
              (tableData.STATUS == 2 ||
                tableData.STATUS == 3 ||
                tableData.STATUS == 5)
          ">
          市场部确认时间：{{
            tableData.DATE_ENTER | datatrans
          }}&nbsp;&nbsp;&nbsp;&nbsp;<span v-if="tableData.ENTER_SUG">审核意见：{{ tableData.ENTER_SUG }}</span>
        </h3>
        <h3 v-if="(EDITorCHECK || newORedit) && tableData.STATUS == 3">
          广美确认时间：{{
            tableData.DATE_PASS | datatrans
          }}&nbsp;&nbsp;&nbsp;&nbsp;<span v-if="tableData.PASS_SUG">审核意见：{{ tableData.PASS_SUG }}</span>
        </h3>
        <h3 v-if="(EDITorCHECK || newORedit) && tableData.STATUS == 4">
          市场部退回时间：{{
            tableData.DATE_ENTER | datatrans
          }}&nbsp;&nbsp;&nbsp;&nbsp;退回原因：{{ tableData.ENTER_SUG }}
        </h3>
        <h3 v-if="(EDITorCHECK || newORedit) && tableData.STATUS == 5">
          广美退回时间：{{
            tableData.DATE_PASS | datatrans
          }}&nbsp;&nbsp;&nbsp;&nbsp;退回原因：{{ tableData.PASS_SUG }}
        </h3>
        <table width="100%" border="0" cellspacing="0" cellpadding="0">
          <tr>
            <td width="10%" class="grayTD" colspan="1" rowspan="3" border="0px">
              基本信息
            </td>

            <td width="15%" class="grayTD" colspan="1" style="height:28px;">
              客户名称
            </td>
            <td style="height:28px;">{{ tableData.CUSTOMER_NAME }}</td>

            <td class="grayTD" colspan="1" style="height:28px;">年销售任务</td>
            <td style="height:28px;">
              {{ tableData.SALE_TARGET }}
            </td>
          </tr>

          <tr>
            <td class="grayTD" colspan="1" style="height:28px;">
              店面地址<span style="color:red;">*</span>
            </td>
            <td colspan="3" style="height:28px;">
              {{ tableData.STORE_ADDRESS }}
            </td>
          </tr>

          <tr>
            <td class="grayTD" colspan="1" style="width:17%;height:28px;">
              联系人
            </td>
            <td style="width:27%;height:28px;">
              {{ tableData.CUSTOMER_AGENT }}
            </td>

            <td class="grayTD" colspan="1" style="width:17%;height:28px;">
              联系电话
            </td>
            <td style="width:27%;height:28px;">
              {{ tableData.OFFICE_TEL }}
            </td>
          </tr>

          <tr>
            <td class="grayTD" colspan="1" rowspan="2" border="0px" style="height:28px;">
              店面信息
            </td>
            <td class="grayTD" colspan="1" style="height:28px;">
              店面形式<span style="color:red;">*</span>
            </td>
            <td colspan="3" style="height:28px;">
              {{ tableData.STORE_FORM | formTrans }}
            </td>
          </tr>

          <tr>
            <td class="grayTD" colspan="1" style="height:28px;">
              店面面积<span style="color:red;">*</span>
            </td>
            <td colspan="1" style="height:28px;">
              {{ tableData.STORE_AREA }}平方米
            </td>

            <td class="grayTD" colspan="1" style="height:28px;">
              层数<span style="color:red;">*</span>
            </td>
            <td colspan="1" style="height:28px;">
              {{ tableData.STORE_PLIE }}
            </td>
          </tr>

          <tr>
            <td class="grayTD" colspan="1" rowspan="5" border="0px" style="height:28px;">
              设计需求
            </td>
            <td class="grayTD" colspan="1" style="height:28px;">
              计划动工时间<span style="color:red;">*</span>
            </td>
            <td colspan="3" rowspan="1" style="height:28px;">
              {{ tableData.PLAN_DATE | datatrans }}
            </td>
          </tr>

          <tr>
            <td class="grayTD" colspan="1" style="height:30px;">
              实施形式<span style="color:red;">*</span>
            </td>
            <td colspan="3" style="height:45px;">
              <span v-if="tableData.IMPLEMENTTATION_FORM == 1">100%按公司设计方案落地，软装物料由公司配置，享受公司建店支持</span>
              <span v-else>自行落地</span>
            </td>
          </tr>

          <tr>
            <td class="grayTD" colspan="1" style="height:35px">
              是否需要上门测量
            </td>
            <td colspan="1" style="height:35px">
              <span v-if="tableData.MEASURE == 1">是</span>
              <span v-else>否</span>
            </td>
            <td colspan="2" style="font-size:12px;color:gray;height:35px">
              *仅100%按公司设计方案落地客户可预约上门测量，并需承担上门人员食宿费用，
              如后期未100%按效果图实施，需承担上门人员交通费用。
            </td>
          </tr>

          <tr>
            <td class="grayTD" colspan="1" style="height:50px">其他需求说明</td>
            <td colspan="3" style="height:50px">
              {{ tableData.NOTE }}
            </td>
          </tr>

          <tr>
            <td class="grayTD" colspan="1" style="height:14px;">
              附件<span style="color:red;">*</span>
            </td>

            <td colspan="2" style="height:14px;">
              <ul class="el-upload-list el-upload-list--text">
                <li v-for="(fileList, index) in fileList" :key="index" class="el-upload-list__item is-success" tabindex="0">
                  <a class="el-upload-list__item-name">
                    <i class="el-icon-document"> </i>{{ fileList.name }}
                  </a>
                  <label style="display:block;position:absolute;top:1px;right:20px;">
                    <a @click="downLoad(fileList.url)">下载附件</a>
                  </label>
                </li>
              </ul>
            </td>

            <td colspan="1" style="font-size:12px;color:gray">
              上传jpg、dwg、pdf等格式平面图，平面图尺寸要表达清晰，消防位等有阻碍设计的地方要标注清楚
            </td>
          </tr>

          <tr>
            <td class="grayTD" colspan="1" border="0px" style="height:28px;">
              付款信息
            </td>
            <td class="grayTD" colspan="1" style="height:28px;">
              付款凭证<span style="color:red;">*</span>
            </td>
            <td colspan="3" style="height:28px;">
              {{ tableData.PAYMENT }}
            </td>
          </tr>

          <tr>
            <td colspan="3" border="0px" style="text-align:left;height:28px;">
              <span style="margin-left:10px;">责任人签字：{{tableData.CUSTOMER_AGENT}}</span>
            </td>
            <td colspan="2" style="text-align:left;height:28px;">
              <span v-if="!EDITorCHECK" style="margin-left:10px;">日期：{{ new Date().getTime() | datatrans }}</span>
              <span v-else style="margin-left:10px;">日期：{{ tableData.DATE_CRE | datatrans }}</span>
            </td>
          </tr>

          <tr style="height:60px">
            <td colspan="5" border="0px" style="font-size:13px;color:gray;text-align:left">
              <div style="margin:0 5px;">
                1.请提前15个工作日提交设计需求申请。<br />
                2.请附上店面平面图（清晰标注尺寸以及消防位等障碍位置）。<br />
                3.硬装部分有客户自行落地。<br />
                4.公司物料配置包含标识、展具、上样、情景四大模块，根据成本清单提供30%建店支持（不包含硬装）。以实用面积为100平店面测算出软装包成本约2700元/m²，店面面积越大，每平方价格相应降低。<br />
                5.申请2.0形象店设计需交30000元设计落地保证金，落地后抵扣软装包款项，如未100%按设计落地，保证金不予返还。<br />
              </div>
            </td>
          </tr>
        </table>

        <br />
        <div v-if="fileListGM.length > 0 && tableData.STATUS != 2" style="width:60%">
          <span>设计结果：</span>
          <ul width="50%" class="el-upload-list el-upload-list--text">
            <li v-for="(fileList, index) in fileListGM" :key="index" class="el-upload-list__item is-success" tabindex="0">
              <a class="el-upload-list__item-name">
                <i class="el-icon-document"> </i>{{ fileList.name }}
              </a>
              <label style="display:block;position:absolute;top:1px;right:20px;">
                <a @click="downLoad(fileList.url)">下载附件</a>
              </label>
            </li>
          </ul>
        </div>
        <div>
          <span v-if="tableData.STATUS == 2 && tableData.PASS_SUG">上次审核意见:{{ tableData.PASS_SUG }}</span>
        </div>
        <div style="display:inline-block;width:60%">
          <el-input v-if="tableData.STATUS == 2" style="margin-bottom: 10px;width:100%;" resize="none" type="textarea" :rows="4"
            placeholder="请输入审核意见" v-model="examineSuggestion">
          </el-input>
        </div>
        <div style="display:inline-block;width:30%;margin-left:50px;">
          <el-upload v-if="tableData.STATUS == 2" class="upload-IM-GM" :action="Global.baseUrl + '/IMAGE_STORE/UploadFiles'" drag
            multiple :on-change="handleChange" :on-remove="handleRemove" :on-success="handleSuccess" :on-error="handleError"
            ref="upload" :auto-upload="false" :file-list="fileListGM" :data="{ cid: cid, dateStamp: dateStamp }">
            <i class="el-icon-upload" style="width:200px;height:30px;margin-top:0;"></i>
            <div class="el-upload__text">
              上传设计结果
            </div>
            <div class="el-upload__text">
              将文件拖到此处，或<em>点击上传</em>
            </div>
          </el-upload>
        </div>

        <div style="margin:0 auto; text-align: center;">
          <el-button v-if="tableData.STATUS == 2" type="primary" @click="pass(tableData.ID)">审核通过</el-button>
          <el-button v-if="tableData.STATUS == 2" type="warning" @click="reject(tableData.ID)">审核不通过</el-button>
        </div>
      </div>
    </el-dialog>

    <el-dialog width="500px" title="查看图片" :visible.sync="BigPic">
      <div>
        <img class="BIGimg" :src="imgUrl" />
      </div>
    </el-dialog>
  </div>
</template>


<script>
import { GetPaymentById } from "@/api/paymentASP";
import { GetAllData, UploadFiles, GMUpdateStatus } from "@/api/imageStoreASP";
import { downLoadFile } from "@/common/js/downLoadFile";
import { mapMutations } from "vuex";
import Cookies from "js-cookie";
const Head = "http://14.29.223.114:10250/upload";

export default {
  name: "ImageShop",
  data() {
    return {
      chargeData: [],
      bankData: [],
      cid: Cookies.get("cid"),
      dateStamp: "",
      fileList: [],
      fileListGM: [],
      BigPic: false,
      sqlpath: "", //保存图片相对路径
      EDITorCHECK: true, //决定显示编辑或者查看
      imageStoreData: [],
      tableData: [],
      isDelete: false,
      isChuli: false,
      isBack: false,
      imageStoreDetail: false,
      limit: 10,
      count: 0,
      find: "",
      currentPage: 1,
      beginTime: "",
      finishTime: "",
      status: "2",
      imgUrl: "",
      examineSuggestion: "",
      options: [
        {
          label: "全部状态",
          value: "",
        },
        {
          label: "已提交",
          value: "1",
        },
        {
          label: "市场部确认",
          value: "2",
        },
        {
          label: "广美确认",
          value: "3",
        },
        {
          label: "市场部退回",
          value: "4",
        },
        {
          label: "广美退回",
          value: "5",
        },
      ],
    };
  },
  created: function () {
    this.getDetail();
  },
  filters: {
    transStatus(value) {
      switch (value) {
        case 0:
          return "待提交";
          break;
        case 1:
          return "已提交";
          break;
        case 2:
          return "市场部确认";
          break;
        case 3:
          return "广美确认";
          break;
        case 4:
          return "市场部退回";
          break;
        case 5:
          return "广美退回";
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
      return y + "-" + MM + "-" + d + " "; /* + h + ':' + m + ':' + s; */
    },
    formTrans(value) {
      switch (value) {
        case "street":
          return "街边店";
          break;
        case "market":
          return "商城店";
          break;
      }
    },
    formTrans2(value) {
      switch (value) {
        case 1:
          return "公司方案";
          break;
        case 2:
          return "自行落地";
          break;
      }
    },
  },
  methods: {
    //查看列表详情
    checkDetail(tab) {
      this.examineSuggestion = "";
      this.fileList = [];
      this.fileListGM = [];
      this.tableData = JSON.parse(JSON.stringify(tab));
      var list = this.tableData.ATTACHMENT_FILE.split(";");
      for (var i = 0; i < list.length - 1; i++) {
        var index = list[i].lastIndexOf("/");
        var fileName = list[i].substr(index + 1);
        this.fileList.push({
          name: fileName,
          url: list[i],
        });
      }
      var listGM = this.tableData.GM_FILE.split(";");
      for (var i = 0; i < listGM.length - 1; i++) {
        var index = listGM[i].lastIndexOf("/");
        var fileName = listGM[i].substr(index + 1);
        this.fileListGM.push({
          name: fileName,
          url: listGM[i],
        });
      }
      this.dateStamp = new Date().getTime();
      this.EDITorCHECK = true;
      this.imageStoreDetail = true;
    },
    //搜索
    search() {
      this.currentPage = 1;
      this.imageStoreData = [];
      this.getDetail();
    },
    getDetail() {
      let data = {
        keywords: this.find.toUpperCase(),
        status: this.status, //
        beginTime: this.beginTime, //起始时间
        finishTime: this.finishTime, //结束时间
        limit: this.limit, //限制数
        page: this.currentPage, //页数
      };
      if (!data.beginTime) {
        data.beginTime = "0001/1/1";
      }
      if (!data.finishTime) {
        data.finishTime = "9999/12/31";
      } else {
        data.finishTime = data.finishTime + " 23:59:59";
      }
      GetAllData(data).then((res) => {
        this.count = res.count;
        this.imageStoreData = res.data;
        this.$root.$emit("refreshBadgeIcon", "imageShop3");
      });
    },
    downLoad(path) {
      downLoadFile(
        this.Global.baseUrl + `DownLoadAPI/DownloadFile?path=${path}&`
      );
    },
    downLoadCompress(path) {
      downLoadFile(
        this.Global.baseUrl + `DownLoadAPI/DownloadFileCompress?path=${path}&`
      );
    },
    //隔行变色
    tableRowClassName({ row, rowIndex }) {
      if (rowIndex % 2 == 0) {
        return "success-row";
      }
      return "";
    },
    //显示图片
    showImage(id) {
      this.imgUrl = "";
      GetPaymentById({ id: id }).then((res) => {
        this.imgUrl = Head + res.data.IMG_URL;
        this.BigPic = true;
      });
    },
    pass(id) {
      //判断是否上传图片
      if (this.fileListGM.length == 0) {
        this.$alert("请上传设计结果", "提示", {
          confirmButtonText: "确定",
          type: "warning",
        });
        return;
      }
      this.$refs.upload.submit();
    },
    passANSYC() {
      var filePath = "";
      //附件拼接
      for (var i = 0; i < this.fileListGM.length; i++) {
        filePath +=
          "/Files/IMAGE_STORE/" +
          this.cid +
          "/" +
          this.dateStamp +
          "/" +
          this.fileListGM[i].name +
          ";";
      }
      var fileFolder = "/Files/IMAGE_STORE/" + this.cid + "/" + this.dateStamp;
      var data = {
        id: this.tableData.ID,
        cid: Cookies.get("cid"),
        status: 3,
        suggestion: this.examineSuggestion,
        filePath: filePath,
        fileFolder: fileFolder,
      };
      GMUpdateStatus(data).then((res) => {
        this.imageStoreDetail = false;
        this.getDetail();
        this.examineSuggestion = "";
      });
    },
    reject(id) {
      if (!this.examineSuggestion) {
        this.$alert("请填写意见", "提示", {
          confirmButtonText: "确定",
          type: "success",
        });
        return;
      }
      var data = {
        id: id,
        cid: Cookies.get("cid"),
        status: 5,
        suggestion: this.examineSuggestion,
      };
      GMUpdateStatus(data).then((res) => {
        this.imageStoreDetail = false;
        this.getDetail();
        this.examineSuggestion = "";
      });
    },
    //翻页获取订单
    handleCurrentChange(val) {
      this.currentPage = val;
      this.imageStoreData = [];
      this.getDetail();
    },
    handleSizeChange(val) {
      this.limit = val;
      this.currentPage = 1;
      this.getDetail();
    },
    handleChange(file, fileList) {
      this.fileListGM = fileList;
    },
    handleRemove(file, fileList) {
      this.fileListGM = fileList;
      this.fileChange = true;
    },
    handleSuccess(res, file, fileList) {
      var successCount = fileList.filter((item) => item.status == "success")
        .length;
      if (successCount == fileList.length) {
        this.passANSYC();
      }
    },
    handleError(err, file, fileList) {
      this.$refs.upload.clearFiles();
      this.fileList = [];
      this.dateStamp = new Date().getTime();
      this.$alert("文件上传失败", "提示", {
        confirmButtonText: "确定",
        type: "success",
      });
    },
  },
};
</script>

<style scoped>
.centerCard h3 {
  margin: 0;
}
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
.inputStyle {
  border: 0;
  height: 100%;
  width: 100%;
  font-size: 16px;
  text-align: center;
}
.lowHeightRow {
  height: 10px;
}
.ISimg {
  width: 30px;
  height: 30px;
  cursor: pointer;
}
.BIGimg {
  width: 450px;
  height: 450px;
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
.attachLink {
  cursor: pointer;
}
.attachLink:hover {
  text-decoration: underline;
}
</style>

<style>
.el-table .success-row {
  background: #f0f9eb;
}
.inputStyle .el-input__inner {
  border-radius: 0;
}
.inputStyle .el-textarea__inner {
  border-radius: 0;
}
.upload-de .el-upload-dragger {
  height: 100px;
}
.upload-IM-GM .el-upload-dragger {
  height: 100px !important;
  width: 200px !important;
}
</style>