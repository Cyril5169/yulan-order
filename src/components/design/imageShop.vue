<template>
  <div class="centerCard">
    <el-card shadow="hover">
      <div id="tbar" class="tbarStyle">
        <el-date-picker type="date" format="yyyy-MM-dd" value-format="yyyy-MM-dd" placeholder="查询开始日期"
          v-model="beginTime" style="width:12%;"></el-date-picker>
        --
        <el-date-picker type="date" format="yyyy-MM-dd" value-format="yyyy-MM-dd" placeholder="查询截止日期"
          v-model="finishTime" style="width:12%;"></el-date-picker>
        <el-select v-model="status" style="margin-left: 10px;width:12%;" placeholder="全部状态">
          <el-option v-for="item in options" :key="item.label" :label="item.label" :value="item.value"></el-option>
        </el-select>
        <el-button size="medium" type="success" style="margin-left: 10px" @click="search()">查询</el-button>
        <el-button style="float:right;margin-right:20px;" size="medium" @click="newOne()" type="primary">新增申请单
        </el-button>
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
          </template></el-table-column>
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
            <el-button v-if="
                scope.row.STATUS == 1 ||
                  scope.row.STATUS == 2 ||
                  scope.row.STATUS == 3
              " @click="checkDetail(scope.row)" type="success" icon="el-icon-search" size="mini" circle></el-button>
            <el-button v-if="scope.row.STATUS == 4 || scope.row.STATUS == 5" @click="editIt(scope.row)" type="primary"
              icon="el-icon-edit" size="mini" circle></el-button>
            <el-button v-if="scope.row.STATUS == 4 || scope.row.STATUS == 5" @click="deleteDetail(scope.row)"
              type="danger" icon="el-icon-delete" size="mini" circle></el-button>
          </template>
        </el-table-column>
      </el-table>
      <div style="margin:0 25%;" class="block">
        <el-pagination @size-change="handleSizeChange" @current-change="handleCurrentChange"
          :current-page.sync="currentPage" :page-sizes="[5, 10, 15, 20]" :page-size="limit"
          layout="total,sizes,prev, pager, next, jumper" :total="count"></el-pagination>
      </div>
    </el-card>

    <el-dialog :visible.sync="imageStoreDetail" :close-on-click-modal="false" width="58%" top="5vh">
      <!-- 编辑区 -->
      <div class="table-c">
        <h2 style="text-align:center;margin:0 0 10px 0;">
          形象店建设申请表
        </h2>
        <h3 v-if="EDITorCHECK || newORedit">
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
              <el-input :disabled="EDITorCHECK" placeholder="（客户填写）" clearable class="inputStyle" size="mini"
                v-model="tableData.SALE_TARGET"></el-input>
            </td>
          </tr>

          <tr>
            <td class="grayTD" colspan="1" style="height:28px;">
              店面地址<span style="color:red;">*</span>
            </td>
            <td colspan="3" style="height:28px;">
              <el-input :disabled="EDITorCHECK" placeholder="（客户必填）" clearable class="inputStyle" size="mini"
                v-model="tableData.STORE_ADDRESS"></el-input>
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
            <td colspan="3" style="text-align:left;height:28px;">
              <el-radio-group :disabled="EDITorCHECK" style="margin-left:50px;" v-model="tableData.STORE_FORM">
                <el-radio label="street">街边店</el-radio>
                <el-radio label="market">商城店</el-radio>
              </el-radio-group>
            </td>
          </tr>

          <tr>
            <td class="grayTD" colspan="1" style="height:28px;">
              店面面积<span style="color:red;">*</span>
            </td>
            <td colspan="1" style="height:28px;">
              <el-input :disabled="EDITorCHECK" style="width:65%" placeholder="（客户必填）" clearable class="inputStyle"
                size="mini" oninput="value=value.replace(/[^\d.]/g,'')
                                .replace(/^\./g, '').replace(/\.{2,}/g, '.')
                                .replace('.', '$#$').replace(/\./g, '')
                                .replace('$#$', '.')
                                .slice(0,value.indexOf('.') === -1? value.length: value.indexOf('.') + 3)"
                v-model="tableData.STORE_AREA"></el-input>
              <span>平方米</span>
            </td>

            <td class="grayTD" colspan="1" style="height:28px;">
              层数<span style="color:red;">*</span>
            </td>
            <td colspan="1" style="height:28px;">
              <el-input :disabled="EDITorCHECK" placeholder="（客户必填）" clearable class="inputStyle" size="mini" oninput="value=value.replace(/[^\d.]/g,'')
                                .replace(/^\./g, '').replace(/\.{2,}/g, '.')
                                .replace('.', '$#$').replace(/\./g, '')
                                .replace('$#$', '.')
                                .slice(0,value.indexOf('.') === -1? value.length: value.indexOf('.') + 3)"
                v-model="tableData.STORE_PLIE"></el-input>
            </td>
          </tr>

          <tr>
            <td class="grayTD" colspan="1" rowspan="5" border="0px" style="height:28px;">
              设计需求
            </td>
            <td class="grayTD" colspan="1" style="height:28px;">
              计划动工时间<span style="color:red;">*</span>
            </td>
            <td colspan="3" rowspan="1" style="text-align:left;height:28px;">
              <el-date-picker :disabled="EDITorCHECK" type="date" format="yyyy-MM-dd" value-format="yyyy-MM-dd"
                placeholder="选择计划动工时间" v-model="tableData.PLAN_DATE" style="width:35%;margin-left:10px;">
              </el-date-picker>
            </td>
          </tr>

          <tr>
            <td class="grayTD" colspan="1" style="height:30px;">
              实施形式<span style="color:red;">*</span>
            </td>
            <td colspan="3" style="text-align:left;height:45px;">
              <el-radio-group :disabled="EDITorCHECK" style="margin-left:10px;" v-model="tableData.IMPLEMENTTATION_FORM"
                @change="implentmentChange">
                <el-radio style="margin-bottom:5px;" :label="1">①100%按公司设计方案落地，软装物料由公司配置，享受公司建店支持</el-radio>
                <br />
                <el-radio :label="2">②自行落地</el-radio>
              </el-radio-group>
            </td>
          </tr>

          <tr>
            <td class="grayTD" colspan="1" style="height:35px">
              是否需要上门测量
            </td>
            <td colspan="1" style="height:35px">
              <el-radio-group :disabled="tableData.IMPLEMENTTATION_FORM != 1 || EDITorCHECK"
                v-model="tableData.MEASURE">
                <el-radio :label="1">是</el-radio>
                <el-radio :label="0">否</el-radio>
              </el-radio-group>
            </td>
            <td colspan="2" style="font-size:12px;color:gray;height:35px">
              *仅100%按公司设计方案落地客户可预约上门测量，并需承担上门人员食宿费用，
              如后期未100%按效果图实施，需承担上门人员交通费用。
            </td>
          </tr>

          <tr>
            <td class="grayTD" colspan="1" style="height:50px">其他需求说明</td>
            <td colspan="3" style="height:50px">
              <el-input :disabled="EDITorCHECK" class="inputStyle" type="textarea" :autosize="{ minRows: 2, maxRow: 4 }"
                resize="none" v-model="tableData.NOTE"></el-input>
            </td>
          </tr>

          <tr>
            <td class="grayTD" colspan="1" style="height:14px;">
              附件<span style="color:red;">*</span>
            </td>

            <td colspan="2" style="height:14px;">
              <el-upload v-if="!EDITorCHECK" class="upload-de" :action="Global.baseUrl + '/IMAGE_STORE/UploadFiles'"
                style="margin-top:10px;" drag multiple :on-change="handleChange" :on-remove="handleRemove"
                :on-success="handleSuccess" :on-error="handleError" ref="upload" :auto-upload="false"
                :file-list="fileList" :data="{ cid: cid, dateStamp: dateStamp }">
                <i class="el-icon-upload" style="width:300px;height:30px;margin-top:10px;"></i>
                <div class="el-upload__text">
                  将文件拖到此处，或<em>点击上传</em>
                </div>
                <div class="el-upload__tip" slot="tip">
                  可上传jpg、dwg、pdf等格式
                </div>
              </el-upload>
              <ul v-else class="el-upload-list el-upload-list--text">
                <li v-for="(fileList, index) in fileList" :key="index" class="el-upload-list__item is-success"
                  tabindex="0">
                  <a class="el-upload-list__item-name">
                    <i class="el-icon-document"> </i>{{ fileList.name }}
                  </a>
                  <label style="display:block;position:absolute;top:1px;right:20px;">
                    <a style="cursor:pointer;" @click="downLoad(fileList.url)">下载附件</a>
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
            <td colspan="3" style="text-align:left;height:28px;">
              <el-select v-if="!EDITorCHECK" style="width:500px;" v-model="tableData.PAYMENT" filterable
                placeholder="请选择汇款凭证">
                <el-option v-for="item in bankData" :key="item.value" :label="item.label" :value="item.value">
                </el-option>
              </el-select>
              <span v-else style="margin-left:20px;">{{
                tableData.PAYMENT
              }}</span>
            </td>
          </tr>

          <tr>
            <td colspan="3" border="0px" style="text-align:left;height:28px;">
              <span style="margin-left:10px;">责任人签字：</span>
            </td>
            <td colspan="2" style="text-align:left;height:28px;">
              <span v-if="!EDITorCHECK && !newORedit"
                style="margin-left:10px;">日期：{{ new Date().getTime() | datatrans }}</span>
              <span v-else style="margin-left:10px;">日期：{{ tableData.DATE_CRE | datatrans }}</span>
            </td>
          </tr>

          <tr style="height:60px">
            <td colspan="5" border="0px" style="font-size:13px;color:gray;text-align:left;">
              <div style="margin:0 5px;">
                1.请提前15个工作日提交设计需求申请。<br />
                2.请附上店面平面图（清晰标注尺寸以及消防位等障碍位置）。<br />
                3.硬装部分由客户自行落地。<br />
                4.公司物料配置包含标识、展具、上样、情景四大模块，根据成本清单提供30%建店支持（不包含硬装）。以实用面积为100平店面测算出软装包成本约2700元/m²，店面面积越大，每平方价格相应降低。<br />
                5.申请2.0形象店设计需交30000元设计落地保证金，落地后抵扣软装包款项，如未100%按设计落地，保证金不予返还。<br />
              </div>
            </td>
          </tr>
        </table>

        <br />
        <div v-if="fileListGM.length > 0" style="width:60%">
          <span>设计结果：</span>
          <ul width="50%" class="el-upload-list el-upload-list--text">
            <li v-for="(fileList, index) in fileListGM" :key="index" class="el-upload-list__item is-success"
              tabindex="0">
              <a class="el-upload-list__item-name">
                <i class="el-icon-document"> </i>{{ fileList.name }}
              </a>
              <label style="display:block;position:absolute;top:1px;right:20px;">
                <a style="cursor:pointer;" @click="downLoad(fileList.url)">下载附件</a>
              </label>
            </li>
          </ul>
        </div>
        <div style="margin:0 auto; text-align: center;">
          <el-button :disabled="btnDisable" v-if="newORedit" type="success" @click="submitEDIT">修改并提交</el-button>
          <el-button :disabled="btnDisable" v-else-if="!EDITorCHECK" type="success" @click="sumbitNEW">提交</el-button>
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
import { getBankList } from "@/api/bank";
import { GetPaymentById } from "@/api/paymentASP";
import {
  GetImageCustomer,
  InsertImageStore,
  EditImageStore,
  DeleteImageStore,
  UploadFiles
} from "@/api/imageStoreASP";
import { getCustomerInfo } from "@/api/orderListASP";
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
      fileChange: false,
      BigPic: false,
      sqlpath: "", //保存图片相对路径
      newORedit: false, //决定显示新建或者编辑
      EDITorCHECK: false, //决定显示编辑或者查看
      imageStoreData: [],
      tableData: [],
      deleteFile: [],
      isDelete: false,
      isChuli: false,
      isBack: false,
      imageStoreDetail: false,
      limit: 10,
      count: 0,
      currentPage: 1,
      beginTime: "",
      finishTime: "",
      status: "",
      imgUrl: "",
      btnDisable: false,
      options: [
        {
          label: "全部状态",
          value: ""
        },
        {
          label: "已提交",
          value: "1"
        },
        {
          label: "市场部确认",
          value: "2"
        },
        {
          label: "广美确认",
          value: "3"
        },
        {
          label: "市场部退回",
          value: "4"
        },
        {
          label: "广美退回",
          value: "5"
        }
      ]
    };
  },
  created: function() {
    this.chargeQuery();
    this.getDetail();
    this._getBankList();
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
    }
  },
  methods: {
    //查询经办人
    chargeQuery() {
      var data = {
        cid: Cookies.get("cid"),
        companyId: Cookies.get("companyId")
      };
      getCustomerInfo(data).then(res => {
        this.chargeData = res.data;
      });
    },
    implentmentChange() {
      if (this.tableData.IMPLEMENTTATION_FORM != 1) this.tableData.MEASURE = 0;
    },
    //新建
    newOne() {
      this.EDITorCHECK = false;
      this.newORedit = false;
      this.imageStoreDetail = true;
      this.btnDisable = false;
      this.tableData = {
        CUSTOMER_CODE: Cookies.get("companyId"),
        CUSTOMER_NAME: Cookies.get("realName"),
        CUSTOMER_AGENT: this.chargeData.CUSTOMER_AGENT,
        ATTACHMENT_FILE: "",
        OFFICE_TEL: this.chargeData.OFFICE_TEL,
        CREATER: Cookies.get("cid"),
        STATUS: 0,
        MEASURE: 0
      };
      this.dateStamp = new Date().getTime();
      this.fileList = [];
      this.fileListGM = [];
      this._getBankList();
    },
    //确定新建
    sumbitNEW() {
      //判断是否填完所有信息
      if (!this.tableData.STORE_ADDRESS) {
        this.$alert("请输入店面地址", "提示", {
          confirmButtonText: "确定",
          type: "warning"
        });
        return;
      }
      if (!this.tableData.STORE_FORM) {
        this.$alert("请选择店面形式", "提示", {
          confirmButtonText: "确定",
          type: "warning"
        });
        return;
      }
      if (!this.tableData.STORE_AREA) {
        this.$alert("请输入店面面积", "提示", {
          confirmButtonText: "确定",
          type: "warning"
        });
        return;
      }
      if (!this.tableData.STORE_PLIE) {
        this.$alert("请输入店面层数", "提示", {
          confirmButtonText: "确定",
          type: "warning"
        });
        return;
      }
      if (!this.tableData.PLAN_DATE) {
        this.$alert("请选择计划动工时间", "提示", {
          confirmButtonText: "确定",
          type: "warning"
        });
        return;
      }
      if (!this.tableData.IMPLEMENTTATION_FORM) {
        this.$alert("请选择实施形式", "提示", {
          confirmButtonText: "确定",
          type: "warning"
        });
        return;
      }
      if (!this.tableData.PAYMENT) {
        this.$alert("请选择汇款凭证", "提示", {
          confirmButtonText: "确定",
          type: "warning"
        });
        return;
      }
      //判断是否上传图片
      if (this.fileList.length == 0) {
        this.$alert("请上传附件", "提示", {
          confirmButtonText: "确定",
          type: "warning"
        });
        return;
      }
      this.btnDisable = true;
      this.$refs.upload.submit();
    },
    sumbitNEWANSYC() {
      //相当于同步，等提交成功后再执行
      //附件拼接
      for (var i = 0; i < this.fileList.length; i++) {
        this.tableData.ATTACHMENT_FILE +=
          "/Files/IMAGE_STORE/" +
          this.cid +
          "/" +
          this.dateStamp +
          "/" +
          this.fileList[i].name +
          ";";
      }
      this.tableData.ATTACHMENT_FILE_FOLDER =
        "/Files/IMAGE_STORE/" + this.cid + "/" + this.dateStamp;
      InsertImageStore(this.tableData)
        .then(res => {
          this.$alert("提交成功", "提示", {
            confirmButtonText: "确定",
            type: "success"
          });
          //this.$refs.upload.clearFiles();
          this.fileList = [];
          this.currentPage = 1;
          this.getDetail();
          this.imageStoreDetail = false;
        })
        .catch(res => {
          this.$alert("提交失败，请稍后重试", "提示", {
            confirmButtonText: "确定",
            type: "warning"
          });
        });
    },
    //编辑列表详情
    editIt(tab) {
      this.fileList = [];
      this.fileListGM = [];
      this.deleteFile = [];
      this.tableData = JSON.parse(JSON.stringify(tab));
      this._getBankList();
      var list = this.tableData.ATTACHMENT_FILE.split(";");
      for (var i = 0; i < list.length - 1; i++) {
        var index = list[i].lastIndexOf("/");
        var fileName = list[i].substr(index + 1);
        this.fileList.push({
          name: fileName,
          url: list[i]
        });
      }
      this.dateStamp = new Date().getTime();
      this.EDITorCHECK = false;
      this.newORedit = true;
      this.imageStoreDetail = true;
      this.btnDisable = false;
    },
    submitEDIT() {
      if (
        !this.tableData.STORE_ADDRESS ||
        !this.tableData.STORE_FORM ||
        !this.tableData.STORE_AREA ||
        !this.tableData.STORE_PLIE ||
        !this.tableData.PLAN_DATE ||
        !this.tableData.IMPLEMENTTATION_FORM ||
        !this.tableData.PAYMENT
      ) {
        this.$alert("请完善信息", "提示", {
          confirmButtonText: "确定",
          type: "warning"
        });
        return;
      }
      //判断是否上传图片
      if (this.fileList.length == 0) {
        this.$alert("请上传附件", "提示", {
          confirmButtonText: "确定",
          type: "warning"
        });
        return;
      }
      if (this.fileChange) {
        //文件发生改变，重新上传一次
        this.btnDisable = true;
        this.$refs.upload.submit();
        this.tableData.ATTACHMENT_FILE = "";
        //附件拼接
        for (var i = 0; i < this.fileList.length; i++) {
          this.tableData.ATTACHMENT_FILE +=
            "/Files/IMAGE_STORE/" +
            this.cid +
            "/" +
            this.dateStamp +
            "/" +
            this.fileList[i].name +
            ";";
        }
        this.tableData.ATTACHMENT_FILE_FOLDER =
          "/Files/IMAGE_STORE/" + this.cid + "/" + this.dateStamp;
      } else {
        if (this.deleteFile.length > 0) {
          this.tableData.ATTACHMENT_FILE = "";
          for (var i = 0; i < this.fileList.length; i++) {
            this.tableData.ATTACHMENT_FILE += this.fileList[i].url + ";";
          }
        }
        this.submitEDITANSYC();
      }
    },
    submitEDITANSYC() {
      //相当于同步，等提交成功后再执行
      EditImageStore({
        model: this.tableData,
        attchmentChange: this.fileChange,
        deleteFile: this.deleteFile
      })
        .then(res => {
          this.$alert("提交成功", "提示", {
            confirmButtonText: "确定",
            type: "success"
          });
          this.fileList = [];
          this.currentPage = 1;
          this.getDetail();
          this.imageStoreDetail = false;
        })
        .catch(res => {
          this.$alert("提交失败，请稍后重试", "提示", {
            confirmButtonText: "确定",
            type: "warning"
          });
        });
    },
    //查看列表详情
    checkDetail(tab) {
      this.fileList = [];
      this.fileListGM = [];
      this.tableData = JSON.parse(JSON.stringify(tab));
      var list = this.tableData.ATTACHMENT_FILE.split(";");
      for (var i = 0; i < list.length - 1; i++) {
        var index = list[i].lastIndexOf("/");
        var fileName = list[i].substr(index + 1);
        this.fileList.push({
          name: fileName,
          url: list[i]
        });
      }
      var listGM = this.tableData.GM_FILE.split(";");
      for (var i = 0; i < listGM.length - 1; i++) {
        var index = listGM[i].lastIndexOf("/");
        var fileName = listGM[i].substr(index + 1);
        this.fileListGM.push({
          name: fileName,
          url: listGM[i]
        });
      }
      this.EDITorCHECK = true;
      this.imageStoreDetail = true;
    },
    deleteDetail(tab) {
      this.$confirm("删除的数据无法恢复，是否删除？", "提示", {
        confirmButtonText: "是",
        cancelButtonText: "否",
        type: "warning"
      })
        .then(() => {
          DeleteImageStore(JSON.parse(JSON.stringify(tab))).then(res => {
            this.$alert("删除成功", "提示", {
              confirmButtonText: "确定",
              type: "success"
            });
            this.currentPage = 1;
            this.getDetail();
          });
        })
        .catch(() => {});
    },
    //搜索
    search() {
      this.currentPage = 1;
      this.imageStoreData = [];
      this.getDetail();
    },
    getDetail() {
      let data = {
        companyId: Cookies.get("companyId"), //公司id
        status: this.status, //
        beginTime: this.beginTime, //起始时间
        finishTime: this.finishTime, //结束时间
        limit: this.limit, //限制数
        page: this.currentPage //页数
      };
      if (!data.beginTime) {
        data.beginTime = "0001/1/1";
      }
      if (!data.finishTime) {
        data.finishTime = "9999/12/31";
      } else {
        data.finishTime = data.finishTime + " 23:59:59";
      }
      GetImageCustomer(data).then(res => {
        this.count = res.count;
        this.imageStoreData = res.data;
        this.$root.$emit("refreshBadgeIcon", "imageShop1");
      });
    },
    _getBankList() {
      let url =
        "http://14.29.223.114:10250/yulan-capital/PaymentBill/getPayBills.do";
      if (this.beginTime == null) this.beginTime = "";
      if (this.finishTime == null) this.finishTime = "";
      let data = {
        cid: Cookies.get("companyId"), //公司id
        state: "", //状态状态(SUBMITED（已提交）,PROCESED（已处理）,SENDBACK（退回）,CANCELED（作废）)
        beginTime: "", //起始时间
        finishTime: "", //结束时间
        limit: 100000, //限制数
        page: 1 //页数
      };
      getBankList(url, data).then(res => {
        for (var i = 0; i < res.data.length; i++) {
          this.bankData[i] = new Object();
          this.bankData[i].label =
            "流水号:" +
            res.data[i].id +
            " 付款账号：" +
            res.data[i].payerAccount +
            " 付款金额：" +
            res.data[i].payAmount;
          this.bankData[i].value = res.data[i].id;
        }
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
      GetPaymentById({ id: id }).then(res => {
        this.imgUrl = Head + res.data.IMG_URL;
        this.BigPic = true;
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
      this.fileList = fileList;
      this.fileChange = true;
    },
    handleRemove(file, fileList) {
      this.fileList = fileList;
      //this.fileChange = true;
      if ((file.status = "success")) {
        this.deleteFile.push(file.url);
      }
    },
    handleSuccess(res, file, fileList) {
      var successCount = fileList.filter(item => item.status == "success")
        .length;
      if (successCount == fileList.length) {
        if (this.newORedit) {
          this.submitEDITANSYC();
        } else {
          this.sumbitNEWANSYC();
        }
      }
    },
    handleError(err, file, fileList) {
      this.$refs.upload.clearFiles();
      this.fileList = [];
      this.dateStamp = new Date().getTime();
      this.btnDisable = false;
      this.$alert("文件上传失败", "提示", {
        confirmButtonText: "确定",
        type: "success"
      });
    }
  }
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
</style>