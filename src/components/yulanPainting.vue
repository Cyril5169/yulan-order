<template>
  <div>
    <el-card shadow="hover">
      <div style="margin-bottom:10px;">
        <el-date-picker type="date" format="yyyy-MM-dd" value-format="yyyy-MM-dd" placeholder="日期区间" v-model="startDate"
          style="width:14%;"></el-date-picker>--
        <el-date-picker type="date" format="yyyy-MM-dd" value-format="yyyy-MM-dd" placeholder="日期区间" v-model="endDate"
          style="width:14%;"></el-date-picker>
        <el-select v-model="status" placeholder="客户确认中">
          <el-option v-for="item in options" :key="item.label" :label="item.label" :value="item.value"></el-option>
        </el-select>
        <el-input @keyup.enter.native="search()" placeholder="请输入客户信息" v-model="cid" style="width:250px;">
          <el-button @click="search()" slot="append" icon="el-icon-search">查询</el-button>
        </el-input>
        <el-button @click="
            checkDialog = true;
            checkID = '';
          " style="float:right;margin-right:20px;" size="medium" type="primary">新建</el-button>
      </div>
      <el-table border :data="bankData" style="width: 100%" :row-class-name="tableRowClassName">
        <el-table-column prop="id" label="编号" align="center"></el-table-column>
        <el-table-column label="创建时间" width="160" align="center">
          <template slot-scope="scope">
            <span>{{ scope.row.createTs | datatrans }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="cname" width="220" label="客户名称" align="center"></el-table-column>
        <el-table-column prop="customerAgent" label="联系人" align="center"></el-table-column>
        <el-table-column prop="officeTel" width="220" label="联系电话" align="center"></el-table-column>
        <el-table-column prop="imageCount" label="图片数" width="80" align="center"></el-table-column>
        <el-table-column label="状态" align="center">
          <template slot-scope="scope">
            <span>{{ scope.row.state | transStatus }}</span>
          </template>
        </el-table-column>
        <el-table-column align="center" width="180" label="操作">
          <template slot-scope="scope">
            <el-button @click="lookIt(scope.row)" type="warning" icon="el-icon-search" circle size="mini"></el-button>
            <el-button v-if="scope.row.state == 'ONCREATE'" @click="editIt(scope.row)" type="primary" icon="el-icon-edit" circle
              size="mini"></el-button>
            <el-button v-if="scope.row.state == 'ONCREATE'" @click="deleteIt(scope.row.id)" type="danger" icon="el-icon-delete"
              circle size="mini"></el-button>
          </template>
        </el-table-column>
      </el-table>
      <div style="margin:0 35%;" class="block">
        <el-pagination @current-change="handleCurrentChange" :current-page.sync="currentPage" :page-size="limit"
          layout="total, prev, pager, next, jumper" :total="count"></el-pagination>
      </div>
    </el-card>

    <!-- 【新建】 -->
    <el-dialog @close="_getList" title="委托喷绘确认表" :visible.sync="PaintingDia" :close-on-click-modal="false" width="70%">
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
            <td>{{ sumbit.abdrId }}</td>
            <td class="grayTD">建立人</td>
            <td>{{ sumbit.erpCreator }}</td>
            <td class="grayTD">建立时间</td>
            <td>{{ sumbit.createTs | datatrans }}</td>
          </tr>
          <tr class="tableCol">
            <td colspan="4">委托人基本信息</td>
            <td colspan="2">受托人</td>
          </tr>
          <tr>
            <td class="grayTD" colspan="2">名称</td>
            <td colspan="2">{{ checkData.shortName }}</td>
            <td colspan="2" rowspan="3">广东玉兰集团股份有限公司</td>
          </tr>
          <tr>
            <td class="grayTD" colspan="2">联系人</td>
            <td colspan="2">{{ checkData.customerAgent }}</td>
          </tr>
          <tr>
            <td class="grayTD" colspan="2">电话</td>
            <td colspan="2">{{ checkData.officeTel }}</td>
          </tr>
          <tr class="tableCol">
            <td colspan="5">委托人来图定制要求</td>
            <td colspan="1">
              <el-tooltip style="cursor: pointer;" class="item" effect="dark" content="点击添加" placement="top">
                <i @click="addPIC = true" style="font-size:30px;" class="el-icon-circle-plus"></i>
              </el-tooltip>
            </td>
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
              <el-tooltip class="item" effect="dark" content="点击放大图片" placement="top">
                <img @click="showBIG(item.imagePath)" class="IMG" :src="item.imagePath" />
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
              <p>受托人签名（盖章）：&nbsp;&nbsp;&nbsp;&nbsp;确认时间：</p>
            </td>
          </tr>
        </table>

        <div style="width:180px;margin:0 auto;">
          <br />
          <el-button type="danger" @click="deleteIt(sumbit.abdrId)">删 除</el-button>
          <el-button type="success" @click="_changeStatus(sumbit.abdrId)">提 交</el-button>
        </div>
      </div>
    </el-dialog>
    <!-- 【查看和编辑】 -->
    <el-dialog @close="_getList" title="委托喷绘确认表" :visible.sync="lookDia" :close-on-click-modal="false" width="70%">
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
            <td>{{ tableData.realName }}</td>
            <td class="grayTD">建立时间</td>
            <td>{{ tableData.createTs | datatrans }}</td>
          </tr>
          <tr>
            <td class="tableCol" colspan="4">委托人基本信息</td>
            <td class="tableCol" colspan="2">受托人</td>
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
          <tr v-if="lookORedit" class="tableCol">
            <td colspan="6">委托人来图定制要求</td>
          </tr>
          <tr v-else class="tableCol">
            <td colspan="5">委托人来图定制要求</td>
            <td colspan="1">
              <el-tooltip style="cursor: pointer;" class="item" effect="dark" content="点击添加" placement="top">
                <i @click="addPIC = true" style="font-size:30px;" class="el-icon-circle-plus"></i>
              </el-tooltip>
            </td>
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
              <el-tooltip class="item" effect="dark" content="点击放大图片" placement="top">
                <img @click="showBIG(item.imagePath)" class="IMG" :src="item.imagePath" />
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
              <p v-if="agree">
                受托人签名（盖章）：{{
                  tableData.customerAgent
                }}&nbsp;&nbsp;&nbsp;&nbsp;确认时间：{{
                  tableData.reassureTs | datatrans
                }}
              </p>
            </td>
          </tr>
        </table>

        <div v-show="isCHULI" style="width:180px;margin:0 auto;">
          <br />
          <el-button type="danger" @click="deleteIt(tableData.id)">删 除</el-button>
          <el-button type="success" @click="_changeStatus(tableData.id)">提 交</el-button>
        </div>
      </div>
    </el-dialog>

    <!-- 图片表 -->
    <el-dialog title="上传喷绘样图" :visible.sync="addPIC" :close-on-click-modal="false" width="40%">
      <div>
        <span>
          规格参数：
          <el-input v-model="sumbit.specifications" placeholder="请输入规格参数" style="width:450px;"></el-input>
        </span>
        <br />
        <br />
        <span>
          定制要求：
          <el-input v-model="sumbit.memo" placeholder="请输入定制要求" style="width:450px;"></el-input>
        </span>
        <br />
        <br />
        <div style="width:300px;margin:0 auto;">
          <el-upload class="avatar-uploader" accept="image/png, image/jpg, image/jpeg"
            action="http://14.29.223.114:10250/yulan-capital/AbdrImage/upload.do" :show-file-list="false"
            :on-success="handleAvatarSuccess" :before-upload="beforeAvatarUpload">
            <img v-if="imgUrl" :src="imgUrl" class="avatar" />
            <i v-else class="el-icon-plus avatar-uploader-icon"></i>
          </el-upload>
        </div>
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button type="danger" @click="addPIC = false">放 弃</el-button>
        <el-button type="primary" @click="PostImage()">保 存</el-button>
      </span>
    </el-dialog>
    <!-- 客户检验表 -->
    <el-dialog title="客户信息" :visible.sync="checkDialog" width="40%">
      <span>
        客户编号：
        <el-input v-model="checkID" placeholder="请输入客户编号" style="width:400px;" @keyup.enter.native="_getWaterNumber()"></el-input>
      </span>
      <span slot="footer" class="dialog-footer">
        <el-button @click="checkDialog = false">取 消</el-button>
        <el-button type="primary" @click="_getWaterNumber()">确 定</el-button>
      </span>
    </el-dialog>
    <el-dialog title="查看图片" :width="DiaWidth" :visible.sync="BigPic">
      <img :style="ImgStyle" ref="box" :src="BIGimgPath" @load="picLoad" />
    </el-dialog>
  </div>
</template>

<script>
import {
  getPaintingList,
  AddPainting,
  DeletePainting,
  changeStatus,
  getWaterNumber,
  AddImage,
  getPictureList
} from "@/api/painting";
import { InsertBrush } from "@/api/paymentASP";
import Cookies from "js-cookie";
//const Quest = 'http://106.14.159.244:8080/yulan-capital';
//const Head = 'http://106.14.159.244:8080/upload';
//玉兰
const Quest = "http://14.29.223.114:10250/yulan-capital";
const Head = "http://14.29.223.114:10250/upload";
export default {
  name: "BankProof",
  data() {
    return {
      DiaWidth: "",
      ImgStyle: {},
      lookORedit: false,
      agree: false,
      abdrImage: [],
      BigPic: false,
      BIGimgPath: "",
      lookDia: false,
      checkData: {},
      checkID: "",
      checkDialog: false,
      sumbit: {
        memo: "",
        specifications: "",
        abdrId: "",
        imagePath: ""
      },
      addPIC: false,
      PaintingDia: false,
      imgUrl: "",
      form: {
        name: ""
      },
      dialogVisible: false,
      limit: 8,
      count: 0,
      currentPage: 1,
      cid: "",
      startDate: "",
      endDate: "",
      status: "",
      options: [
        {
          label: "全部状态",
          value: ""
        },
        {
          label: "客户同意",
          value: "APPROVED"
        },
        {
          label: "客户不同意",
          value: "CANCELED"
        },
        {
          label: "客户确认中",
          value: "CUSTOMERAFFIRM"
        },
        {
          label: "处理中",
          value: "ONCREATE"
        }
      ],
      bankData: [],
      tableData: {},
      isCHULI: false
    };
  },
  created: function () {
    this._getList();
  },
  filters: {
    transStatus(value) {
      switch (value) {
        case "APPROVED":
          return "客户同意";
          break;
        case "CANCELED":
          return "客户不同意";
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
        return " ";
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
    //提交
    _changeStatus(id) {
      if (this.abdrImage.length === 0) {
        this.$alert("请上传图片及相关信息", "提示", {
          confirmButtonText: "确定",
          type: "warning"
        });
        return;
      }
      let url =
        Quest + "/AirbrushDesignerAssure/updateAirbrushDesignerAssure.do";
      let data = {
        id: id,
        state: "客户确认中"
      };
      changeStatus(url, data).then(res => {
        this.$alert("提交成功", "提示", {
          confirmButtonText: "确定",
          type: "success"
        });
        this._getList();
        this.PaintingDia = false;
        this.lookDia = false;
      });
    },
    //删除喷绘
    deleteIt(id) {
      let url =
        Quest + "/AirbrushDesignerAssure/deleteAirbrushDesignerAssure.do";
      let data = {
        id: id
      };
      DeletePainting(url, data).then(res => {
        this.$alert("删除成功", "提示", {
          confirmButtonText: "确定",
          type: "success"
        });
        this.PaintingDia = false;
        this.lookDia = false;
        this._getList();
      });
    },
    //图片上传
    PostImage() {
      if (this.sumbit.specifications == "" || this.sumbit.memo == "") {
        this.$alert("请填写规则参数与定制要求", "提示", {
          confirmButtonText: "确定",
          type: "warning"
        });
        return;
      }
      if (this.sumbit.imagePath == "") {
        this.$alert("请上传图片", "提示", {
          confirmButtonText: "确定",
          type: "warning"
        });
      }
      let url = Quest + "/AbdrImage/insertAbdrImage.do";
      let data = this.sumbit;
      AddImage(url, data).then(res => {
        this.getPicture(this.sumbit.abdrId);
        this.addPIC = false;
      });
    },
    //查询
    search() {
      this.currentPage = 1;
      this._getList();
    },
    //流水号和客户信息【新建】
    _getWaterNumber() {
      let url = Quest + "/customer/getSingleCustomerInfo.do";
      let data = {
        companyId: this.checkID.toUpperCase(),
        erpCreator: Cookies.get("cid") //创建人
      };
      //getWaterNumber(url, data).then(res => {
      InsertBrush(data)
        .then(async res => {
          this.abdrImage = [];
          this.sumbit.abdrId = res.data.ID;
          this.sumbit.createTs = res.data.CREATE_TS;
          this.sumbit.erpCreator = Cookies.get("realName");
          this.checkData.customerCode = res.data.CID;
          this.checkData.shortName = res.data.CNAME;
          this.checkData.officeTel = res.data.OFFICE_TEL;
          this.checkData.customerAgent = res.data.CUSTOMER_AGENT;

          this.PaintingDia = true; //大表格
          this.checkDialog = false;
        })
        .catch(err => {
          this.$alert(err.msg, "提示", {
            type: "warning",
            confirmButtonText: "好的"
          });
        });
    },
    //获取喷绘列表
    _getList() {
      let url = Quest + "/AirbrushDesignerAssure/getAirbrushDesignerAssure.do";
      let data = {
        cid: this.cid, //客户ID
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
        this.bankData = res.airbrushDesignerAssureList;
        if (res.airbrushDesignerAssureList) {
          this.count = res.airbrushDesignerAssureList[0].total;
        }
      });
    },
    //查看表格
    lookIt(tab) {
      this.isCHULI = false;
      if (tab.state == "APPROVED") {
        this.agree = true;
      } else {
        this.agree = false;
      }
      this.abdrImage = [];
      this.tableData = tab;
      this.lookORedit = true;
      if (tab.abdrImage.length) {
        if (tab.abdrImage[0].imagePath.startsWith(Head)) {
        } else {
          for (let i = 0; i < tab.abdrImage.length; i++) {
            tab.abdrImage[i].imagePath = Head + tab.abdrImage[i].imagePath;
          }
        }
      }
      this.abdrImage = tab.abdrImage;
      this.lookDia = true;
    },
    editIt(tab) {
      if (tab.state == "ONCREATE") {
        this.isCHULI = true;
      } else {
        this.isCHULI = false;
      }
      this.abdrImage = [];
      this.sumbit.abdrId = tab.id;
      this.lookDia = true;
      this.tableData = tab;
      this.lookORedit = false;
      if (tab.abdrImage.length) {
        if (tab.abdrImage[0].imagePath.startsWith(Head)) {
        } else {
          for (let i = 0; i < tab.abdrImage.length; i++) {
            tab.abdrImage[i].imagePath = Head + tab.abdrImage[i].imagePath;
          }
        }
      }
      this.abdrImage = tab.abdrImage;
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
    //添加图片之后拿回来
    getPicture(abdrImageId) {
      let url = Quest + "/AbdrImage/getAbdrImage.do";
      let data = {
        abdrImageId: abdrImageId
      };
      getPictureList(url, data).then(res => {
        for (let i = 0; i < res.abdrImageList.length; i++) {
          res.abdrImageList[i].imagePath =
            Head + res.abdrImageList[i].imagePath;
        }
        this.abdrImage = res.abdrImageList; //显示
        //清空图片上传弹窗的数据
        this.sumbit.memo = this.sumbit.specifications = this.sumbit.imagePath =
          "";
        this.imgUrl = "";
      });
    },
    //查看放大图片
    showBIG(BIGimgPath) {
      this.BigPic = true;
      this.BIGimgPath = BIGimgPath;
    },

    handleAvatarSuccess(res, file) {
      this.imgUrl = URL.createObjectURL(file.raw);
      this.sumbit.imagePath = res.data.path;
    },
    beforeAvatarUpload(file) {
      const isLt2M = file.size / 1024 / 1024 < 2;

      if (!isLt2M) {
        this.$message.error("上传图片大小不能超过 2MB!");
      }
      return isLt2M;
    }
  }
};
</script>

<style scoped>
.grayTD {
  background: rgb(241, 242, 243);
}
.tableCol {
  background: #f0f9eb;
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
  color: black;
  width: 300px;
  height: 300px;
  line-height: 300px;
  text-align: center;
}
.avatar {
  width: 300px;
  height: 300px;
  display: block;
}
</style>