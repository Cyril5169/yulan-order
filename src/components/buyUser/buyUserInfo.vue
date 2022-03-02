<template>
  <div class="zj-flex-page">
    <div class="zj-tbar">
      <el-button icon="el-icon-refresh" size="mini" circle @click="searchBuyUser()">
      </el-button>
      <el-input @keyup.enter.native="searchBuyUser()" size="medium" placeholder="输入用户姓名/电话/地址" v-model="condition" clearable
        @clear="searchClick()" style="width:350px;">
        <el-button @click="searchBuyUser()" slot="append" icon="el-icon-search">搜索</el-button>
      </el-input>
      <el-button style="margin-left:20px;" size="medium" @click="addBuyUserShow()" type="primary">新增消费者信息
      </el-button>
      <el-button type="danger" size="medium" :disabled="userSelect.length==0" @click="deleteBuyUserList">
        删除选中消费者({{userSelect.length}})
      </el-button>
      <div v-if="canCheck" style="color:darkgrey;">*双击填充到消费者信息</div>
    </div>
    <div class="zj-table-ct">
      <el-table class="zj-flex-table" height="100%" :data="buyUserInfoData" :row-class-name="tableRowClassName"
        @selection-change="handleSelectionChange" @row-dblclick="handleRowDBClick">
        <el-table-column type="selection" width="55" align="center"></el-table-column>
        <el-table-column width="120" prop="BUYUSER" label="消费者姓名" align="center"></el-table-column>
        <el-table-column width="150" prop="BUYUSER_PHONE" label="联系电话" align="center"></el-table-column>
        <el-table-column label="地址" header-align="center">
          <template slot-scope="scope">
            {{splitAddress(scope.row)}}
          </template>
        </el-table-column>
        <el-table-column width="150" prop="NOTE" label="备注"></el-table-column>
        <el-table-column width="100" prop="CRE_FLAG" label="来源" align="center">
          <template slot-scope="scope">
            <span v-if="scope.row.CRE_FLAG == 'order'">订单创建</span>
            <span v-if="scope.row.CRE_FLAG == 'user'">手工创建</span>
          </template>
        </el-table-column>
        <el-table-column width="100" prop="CRE_DATE" label="创建时间" align="center">
          <template slot-scope="scope">
            {{scope.row.CRE_DATE | dateFilter}}
          </template>
        </el-table-column>
        <el-table-column width="100" label="操作">
          <template slot-scope="scope">
            <el-button @click="editBuyUserShow(scope.row)" type="primary" icon="el-icon-edit" size="mini" circle>
            </el-button>
            <el-button @click="deleteBuyUser(scope.row)" type="danger" icon="el-icon-delete" size="mini" circle>
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <!-- 新增/编辑购买人 -->
    <el-dialog width="650px" @close="clearData" :title="addOrNot?'新增消费者':'编辑消费者'" v-if="addBuyUserVisible"
      :visible.sync="addBuyUserVisible" :close-on-click-modal="false" append-to-body>
      <el-form size="small" :model="buyUserModel" label-width="100px" ref="buyUserForm" :rules="add_rules">
        <el-form-item label="用户姓名" prop="BUYUSER">
          <el-input style="width:250px;" v-model="buyUserModel.BUYUSER" :disabled="!addOrNot">
          </el-input>
        </el-form-item>
        <el-form-item label="联系电话" prop="BUYUSER_PHONE">
          <el-input style="width:250px;" v-model="buyUserModel.BUYUSER_PHONE" :disabled="!addOrNot">
          </el-input>
        </el-form-item>
        <el-form-item label="所在地区">
          <el-select @change="getCity" style="width:150px;" v-model="buyUserModel.PROVINCE_ID" placeholder="请选择省份">
            <el-option v-for="(item, index) in provinceData" :key="index" :label="item.REGION_NAME" :value="item.REGION_ID">
            </el-option>
          </el-select>
          <el-select @change="getArea" style="width:150px;" v-model="buyUserModel.CITY_ID" placeholder="请选择城市"
            :disabled="!cityData.length">
            <el-option v-for="(item, index) in cityData" :key="index" :label="item.REGION_NAME" :value="item.REGION_ID">
            </el-option>
          </el-select>
          <el-select @change="getAreaName" style="width:150px;" v-model="buyUserModel.COUNTRY_ID" placeholder="请选择县区"
            :disabled="!areaData.length">
            <el-option v-for="(item, index) in areaData" :key="index" :label="item.REGION_NAME" :value="item.REGION_ID">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="详细地址">
          <el-input style="width:460px;" v-model="buyUserModel.POST_ADDRESS">
          </el-input>
        </el-form-item>
        <el-form-item label="备注">
          <el-input style="width:460px;" v-model="buyUserModel.NOTE">
          </el-input>
        </el-form-item>
        <div style="text-align:center;margin-bottom:10px;">
          <el-button size="medium" @click="addBuyUserVisible = false">取&nbsp;&nbsp;消</el-button>
          <el-button type="primary" size="medium" @click="onSaveBuyUserClick" style="margin-left:30px;">保&nbsp;&nbsp;存
          </el-button>
        </div>
      </el-form>
    </el-dialog>
  </div>
</template>

<script>
import Cookies from "js-cookie";
import {
  GetAreaList,
  GetBuyUserInfo,
  InsertBuyUser,
  UpdateBuyUser,
  DeleteBuyUser,
  DeleteBuyUserList,
} from "@/api/orderListASP";

export default {
  props: {
    canCheck: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      condition: '',
      buyUserInfoData: [],
      buyUserModel: {},
      provinceData: [],
      cityData: [],
      areaData: [],
      addOrNot: true,
      addBuyUserVisible: false,
      userSelect: [],
      add_rules: {
        BUYUSER: [{ required: true, message: "请填写姓名", trigger: "blur" }],
        BUYUSER_PHONE: [
          { required: true, message: "请填写电话", trigger: "blur" },
        ],
      },
    }
  },
  methods: {
    clearData() {
      this.areaData = [];
      this.cityData = [];
    },
    getProvince() {
      GetAreaList({
        region_level: 1
      }, { loading: false }).then((res) => {
        this.provinceData = res.data;
      }).catch((error) => {
        console.log(error);
      });
    },
    getBuyUser() {
      GetBuyUserInfo({
        cid: Cookies.get("cid"),
        condition: this.condition,
      }).then((res) => {
        this.buyUserInfoData = res.data;
      });
    },
    searchBuyUser() {
      this.getBuyUser();
    },
    splitAddress(row) {
      var address = `${row.PROVINCE ? row.PROVINCE : ""} ${row.CITY ? row.CITY : ""
        } ${row.COUNTRY ? row.COUNTRY : ""} ${row.POST_ADDRESS ? row.POST_ADDRESS : ""
        }`;
      return address;
    },
    addBuyUserShow() {
      this.getProvince();
      this.buyUserModel = {
        CUSTOMER_CODE: Cookies.get("companyId"),
        BUYUSER: "",
        BUYUSER_PHONE: "",
        POST_ADDRESS: "",
        PROVINCE: "",
        CITY: "",
        COUNTRY: "",
        PROVINCE_ID: "",
        CITY_ID: "",
        COUNTRY_ID: "",
        NOTE: "",
        CRE_FLAG: "user",
        OPERATOR: Cookies.get("cid")
      };
      this.areaData = [];
      this.cityData = [];
      this.addOrNot = true;
      this.addBuyUserVisible = true;
    },
    editBuyUserShow(row) {
      this.getProvince();
      this.buyUserModel = JSON.parse(JSON.stringify(row));
      this.areaData = [];
      this.cityData = [];
      this.addOrNot = false;
      this.refreshCity();
      if (this.buyUserModel.CITY_ID)
        this.refreshArea();
      this.addBuyUserVisible = true;
    },
    getCity(value) {
      //新增
      this.buyUserModel.CITY = "";
      this.buyUserModel.CITY_ID = "";
      this.buyUserModel.COUNTRY = "";
      this.buyUserModel.COUNTRY_ID = "";
      this.cityData = [];
      this.areaData = [];
      var selectProvince = this.provinceData.filter((item) => item.REGION_ID == value)[0];
      this.buyUserModel.PROVINCE = selectProvince.REGION_NAME;
      this.refreshCity();
    },
    refreshCity() {
      GetAreaList({
        region_level: 2,
        parent_code: this.buyUserModel.PROVINCE_ID
      }, { loading: false }).then((res) => {
        this.cityData = res.data;
      }).catch((error) => {
        console.log(error);
      });
    },
    getArea(value) {
      this.buyUserModel.COUNTRY = "";
      this.buyUserModel.COUNTRY_ID = "";
      this.areaData = [];
      var selectCity = this.cityData.filter((item) => item.REGION_ID == value)[0];
      this.buyUserModel.CITY = selectCity.REGION_NAME;
      this.refreshArea();
    },
    refreshArea() {
      GetAreaList({
        region_level: 3,
        parent_code: this.buyUserModel.CITY_ID
      }, { loading: false }).then((res) => {
        this.areaData = res.data;
      }).catch((error) => {
        console.log(error);
      });
    },
    getAreaName(value) {
      var selectArea = this.areaData.filter((item) => item.REGION_ID == value)[0];
      this.buyUserModel.COUNTRY = selectArea.REGION_NAME;
    },
    onSaveBuyUserClick() {
      this.$refs.buyUserForm.validate((valid) => {
        if (valid) {
          if (!this.buyUserModel.PROVINCE_ID || !this.buyUserModel.CITY_ID) {
            this.$alert("请填写省市", "提示", {
              confirmButtonText: "确定",
              type: "warning",
            });
            return;
          }
          if (this.addOrNot) {
            InsertBuyUser(this.buyUserModel).then((res) => {
              this.$message({
                message: "新增成功!",
                type: "success",
                duration: 1000,
              });
              this.searchBuyUser();
              this.addBuyUserVisible = false;
            }).catch((res) => {
              this.$alert("新增失败", "提示", {
                confirmButtonText: "确定",
                type: "warning",
              });
            });
          } else {
            UpdateBuyUser(this.buyUserModel).then((res) => {
              this.$message({
                message: "编辑成功!",
                type: "success",
                duration: 1000,
              });
              this.searchBuyUser();
              this.addBuyUserVisible = false;
            }).catch((res) => {
              this.$alert("编辑失败", "提示", {
                confirmButtonText: "确定",
                type: "warning",
              });
            });
          }
        }
      });
    },
    deleteBuyUser(row) {
      this.$confirm("删除的数据无法恢复，是否删除？", "提示", {
        confirmButtonText: "是",
        cancelButtonText: "否",
        type: "warning",
      }).then(() => {
        DeleteBuyUser(row).then((res) => {
          this.$message({
            message: "删除成功!",
            type: "success",
            duration: 1000,
          });
          this.searchBuyUser();
        }).catch((res) => {
          this.$alert("删除失败", "提示", {
            confirmButtonText: "确定",
            type: "warning",
          });
        });
      })
    },
    deleteBuyUserList() {
      this.$confirm("删除的数据无法恢复，是否删除？", "提示", {
        confirmButtonText: "是",
        cancelButtonText: "否",
        type: "warning",
      }).then(() => {
        DeleteBuyUserList(this.userSelect).then((res) => {
          this.$message({
            message: "删除成功!",
            type: "success",
            duration: 1000,
          });
          this.searchBuyUser();
        }).catch((res) => {
          this.$alert("删除失败", "提示", {
            confirmButtonText: "确定",
            type: "warning",
          });
        });
      })
    },
    handleSelectionChange(val) {
      this.userSelect = val;
    },
    handleRowDBClick(row, column) {
      this.$emit('row-dblclick', row, column)
    },
    tableRowClassName({ row, rowIndex }) {
      if (rowIndex % 2 == 0) {
        return "success-row";
      }
      return "";
    },
  },
  mounted() {
    this.searchBuyUser();
    this.getProvince();
  }
}
</script>

<style scoped>
</style>
