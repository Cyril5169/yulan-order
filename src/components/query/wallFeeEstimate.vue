<template>
  <div class="wallFeeEstimate">
    <el-card shadow="never">
      <div>
        <span style="margin-left:10px;">省份</span>
        <el-select v-model="provinceSelect" placeholder="--请选择省份--" filterable>
          <el-option v-for="item in provinceList" :key="item.PROVINCE" :label="item.PROVINCE" :value="item.PROVINCE"></el-option>
        </el-select>
        <span style="margin-left:10px;">块数</span>
        <el-input style="width:120px;" class="inputWidth" v-model="blocks" oninput="value=value.replace(/[^\d]/g,'')"
          placeholder="请输入块数"></el-input>
        <el-button icon="el-icon-search" type="primary" @click="refreshData" style="margin-left:10px;">查询</el-button>
      </div>

      <hr />

      <el-form :model="formModel" label-width="100px" label-suffix=":" class="show-form">
        <el-form-item label="时效">
          {{formModel.ARRIVAL_DAYS}}
        </el-form-item>
        <el-form-item label="总重量">
          {{formModel.SUM_WEIGHT}}<span v-if="formModel.SUM_WEIGHT">KG</span>
        </el-form-item>
        <el-form-item label="保价费">
          {{formModel.BFJ}}<span v-if="formModel.BFJ">元</span>
        </el-form-item>
        <el-form-item label="物流费">
          {{formModel.SUM_MONEY}}<span v-if="formModel.SUM_MONEY">元</span>
        </el-form-item>
      </el-form>

      <div>
        说明：如涉及到上楼、超派、入仓、签回单，可拨打物流站点电话进行咨询德邦站点电话：0571-28154259
      </div>
    </el-card>
  </div>
</template>

<script>
import {
  GetProvinceDataList,
  GetFeeEstimateByProvince,
} from "@/api/itemInfoASP";

export default {
  data() {
    return {
      provinceList: [],
      provinceSelect: "",
      blocks: "",
      formModel: {
        ARRIVAL_DAYS: "",
        SUM_WEIGHT: "",
        BFJ: "",
        SUM_MONEY: ""
      }
    }
  },
  methods: {
    GetProvinceData() {
      GetProvinceDataList().then(res => {
        this.provinceList = res.data;
      })
    },
    refreshData() {
      GetFeeEstimateByProvince({
        province: this.provinceSelect,
        blocks: this.blocks
      }).then(res => {
        if (res.data.length) {
          this.formModel = res.data[0];
        }
      })
    }
  },
  mounted() {
    this.GetProvinceData();
  }
}
</script>

<style>
.show-form .el-form-item__label,
.show-form .el-form-item__content {
  font-size: 16px;
}
</style>
