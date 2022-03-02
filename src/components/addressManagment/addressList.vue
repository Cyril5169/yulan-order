<template>
  <div class="zj-flex-page">
    <div class="zj-tbar">
      <el-button icon="el-icon-refresh" size="mini" circle @click="searchClick()">
      </el-button>
      <el-input @keyup.enter.native="searchClick()" size="medium" placeholder="输入用户姓名/电话/地址" v-model="condition" clearable
        @clear="searchClick()" style="width:350px;">
        <el-button @click="searchClick()" slot="append" icon="el-icon-search">搜索</el-button>
      </el-input>
      <el-button style="margin-left:20px;" size="medium" @click="addAddressShow()" type="primary">新增收货地址
      </el-button>
    </div>
    <div class="zj-table-ct">
      <el-table class="zj-flex-table" height="100%" :data="addressListData" :row-class-name="tableRowClassName">
        <el-table-column width="120" prop="WL_CONTACTS" label="收货人" align="center"></el-table-column>
        <el-table-column width="150" prop="WL_TEL" label="联系电话" align="center"></el-table-column>
        <el-table-column label="收货地址" header-align="center">
          <template slot-scope="scope">
            {{splitAddress(scope.row)}}
          </template>
        </el-table-column>
        <el-table-column width="150" label="操作">
          <template slot-scope="scope">
            <el-button v-if="scope.row.ADDRESS_ID" @click="editAddressShow(scope.row)" type="primary" icon="el-icon-edit"
              size="mini" circle>
            </el-button>
            <el-button v-if="scope.row.ADDRESS_ID" @click="deleteAddress(scope.row)" type="danger" icon="el-icon-delete"
              size="mini" circle>
            </el-button>
            <span v-if="scope.row.ADDRESS_ID == 0">默认地址不可操作</span>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <!-- 新增/编辑购买人 -->
    <el-dialog width="650px" @close="clearData" :title="addOrNot?'新增收货地址':'编辑收货地址'" v-if="addAddressVisible"
      :visible.sync="addAddressVisible" :close-on-click-modal="false" append-to-body>
      <el-form size="small" :model="addressModel" label-width="100px" ref="addressForm" :rules="add_rules">
        <el-form-item label="收货人" prop="WL_CONTACTS">
          <el-input style="width:250px;" v-model="addressModel.WL_CONTACTS" :disabled="!addOrNot">
          </el-input>
        </el-form-item>
        <el-form-item label="联系电话" prop="WL_TEL">
          <el-input style="width:250px;" v-model="addressModel.WL_TEL" :disabled="!addOrNot">
          </el-input>
        </el-form-item>
        <el-form-item label="所在地区">
          <el-select @change="getCity" style="width:150px;" v-model="addressModel.PROVINCE_ID" placeholder="请选择省份">
            <el-option v-for="(item, index) in provinceData" :key="index" :label="item.REGION_NAME" :value="item.REGION_ID">
            </el-option>
          </el-select>
          <el-select @change="getArea" style="width:150px;" v-model="addressModel.CITY_ID" placeholder="请选择城市"
            :disabled="!cityData.length">
            <el-option v-for="(item, index) in cityData" :key="index" :label="item.REGION_NAME" :value="item.REGION_ID">
            </el-option>
          </el-select>
          <el-select @change="getAreaName" style="width:150px;" v-model="addressModel.COUNTRY_ID" placeholder="请选择县区"
            :disabled="!areaData.length">
            <el-option v-for="(item, index) in areaData" :key="index" :label="item.REGION_NAME" :value="item.REGION_ID">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="详细地址">
          <el-input style="width:460px;" v-model="addressModel.POST_ADDRESS">
          </el-input>
        </el-form-item>
        <div style="text-align:center;margin-bottom:10px;">
          <el-button size="medium" @click="addAddressVisible = false">取&nbsp;&nbsp;消</el-button>
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
  GetCustomerAddressList,
  GetAreaList,
  InsertAddress,
  UpdateAddress,
  DeleteAddress,
} from "@/api/orderListASP";

export default {
  data() {
    return {
      condition: '',
      addressListData: [],
      addressModel: {},
      provinceData: [],
      cityData: [],
      areaData: [],
      addOrNot: true,
      addAddressVisible: false,
      userSelect: [],
      add_rules: {
        WL_CONTACTS: [{ required: true, message: "请填写姓名", trigger: "blur" }],
        WL_TEL: [
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
    getAddressList() {
      GetCustomerAddressList({
        cid: Cookies.get("cid"),
        condition: this.condition,
      }).then((res) => {
        this.addressListData = res.data;
      });
    },
    searchClick() {
      this.getAddressList();
    },
    splitAddress(row) {
      var address = `${row.PROVINCE ? row.PROVINCE : ""} ${row.CITY ? row.CITY : ""
        } ${row.COUNTRY ? row.COUNTRY : ""} ${row.POST_ADDRESS ? row.POST_ADDRESS : ""
        }`;
      return address;
    },
    addAddressShow() {
      this.getProvince();
      this.addressModel = {
        CID: Cookies.get("companyId"),
        WL_CONTACTS: "",
        WL_TEL: "",
        POST_ADDRESS: "",
        PROVINCE: "",
        CITY: "",
        COUNTRY: "",
        PROVINCE_ID: "",
        CITY_ID: "",
        COUNTRY_ID: "",
      };
      this.areaData = [];
      this.cityData = [];
      this.addOrNot = true;
      this.addAddressVisible = true;
    },
    editAddressShow(row) {
      this.getProvince();
      this.addressModel = JSON.parse(JSON.stringify(row));
      this.areaData = [];
      this.cityData = [];
      this.addOrNot = false;
      this.refreshCity();
      if (this.addressModel.CITY_ID)
        this.refreshArea();
      this.addAddressVisible = true;
    },
    getCity(value) {
      //新增
      this.addressModel.CITY = "";
      this.addressModel.CITY_ID = "";
      this.addressModel.COUNTRY = "";
      this.addressModel.COUNTRY_ID = "";
      this.cityData = [];
      this.areaData = [];
      var selectProvince = this.provinceData.filter((item) => item.REGION_ID == value)[0];
      this.addressModel.PROVINCE = selectProvince.REGION_NAME;
      this.refreshCity();
    },
    refreshCity() {
      GetAreaList({
        region_level: 2,
        parent_code: this.addressModel.PROVINCE_ID
      }, { loading: false }).then((res) => {
        this.cityData = res.data;
      }).catch((error) => {
        console.log(error);
      });
    },
    getArea(value) {
      this.addressModel.COUNTRY = "";
      this.addressModel.COUNTRY_ID = "";
      this.areaData = [];
      var selectCity = this.cityData.filter((item) => item.REGION_ID == value)[0];
      this.addressModel.CITY = selectCity.REGION_NAME;
      this.refreshArea();
    },
    refreshArea() {
      GetAreaList({
        region_level: 3,
        parent_code: this.addressModel.CITY_ID
      }, { loading: false }).then((res) => {
        this.areaData = res.data;
      }).catch((error) => {
        console.log(error);
      });
    },
    getAreaName(value) {
      var selectArea = this.areaData.filter((item) => item.REGION_ID == value)[0];
      this.addressModel.COUNTRY = selectArea.REGION_NAME;
    },
    onSaveBuyUserClick() {
      this.$refs.addressForm.validate((valid) => {
        if (valid) {
          if (!this.addressModel.PROVINCE_ID || !this.addressModel.CITY_ID) {
            this.$alert("请填写省市", "提示", {
              confirmButtonText: "确定",
              type: "warning",
            });
            return;
          }
          if (this.addOrNot) {
            InsertAddress(this.addressModel).then((res) => {
              this.$message({
                message: "新增成功!",
                type: "success",
                duration: 1000,
              });
              this.searchClick();
              this.addAddressVisible = false;
            }).catch((res) => {
              this.$alert("新增失败", "提示", {
                confirmButtonText: "确定",
                type: "warning",
              });
            });
          } else {
            UpdateAddress(this.addressModel).then((res) => {
              this.$message({
                message: "编辑成功!",
                type: "success",
                duration: 1000,
              });
              this.searchClick();
              this.addAddressVisible = false;
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
    deleteAddress(row) {
      this.$confirm("删除的数据无法恢复，是否删除？", "提示", {
        confirmButtonText: "是",
        cancelButtonText: "否",
        type: "warning",
      }).then(() => {
        DeleteAddress(row).then((res) => {
          this.$message({
            message: "删除成功!",
            type: "success",
            duration: 1000,
          });
          this.searchClick();
        }).catch((res) => {
          this.$alert("删除失败", "提示", {
            confirmButtonText: "确定",
            type: "warning",
          });
        });
      })
    },
    tableRowClassName({ row, rowIndex }) {
      if (rowIndex % 2 == 0) {
        return "success-row";
      }
      return "";
    },
  },
  mounted() {
    this.searchClick();
  }
}
</script>

<style scoped>
</style>
