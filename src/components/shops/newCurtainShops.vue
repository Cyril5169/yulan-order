<template>
  <el-card shadow="never" style="min-height:500px;">
    <div>
      <el-input clearable v-model.trim="searchKey" @clear="searchCurtain" @keyup.enter.native="searchCurtain"
        placeholder="输入帘款查找窗帘" style="width:300px;">
        <el-button @click="searchCurtain" slot="append" icon="el-icon-search">搜索</el-button>
      </el-input>
    </div>
    <div class="curtain-contain" v-if="curtainHeadData && curtainHeadData.ITEM_NO">
      <!-- 帘款 -->
      <div class="curtain-parent-item">
        <span>帘款：{{curtainHeadData.ITEM_NO}}</span>
      </div>
      <!-- 帘款参数 -->
      <div class="curtain-params">
        <span>成品宽：</span>
        <el-input style="width:60px;" size="mini" v-model="curtainHeadData.width"></el-input>
        <span style="margin-left:20px;">成品高：</span>
        <el-input style="width:60px;" size="mini" v-model="curtainHeadData.height"></el-input>
        <span style="margin-left:20px;">活动：</span>
        <el-select size="mini" style="width:250px" :disabled="activityOptions.length == 1"
          v-model="curtainHeadData.activityId" :placeholder="activityOptions.length == 1? '无可选活动': '请选择活动'">
          <el-option v-for="item in activityOptions" :key="item.P_ID"
            :label="item.ORDER_TYPE? item.ORDER_TYPE + ' -- ' + item.ORDER_NAME : item.ORDER_NAME" :value="item.P_ID">
          </el-option>
        </el-select>
      </div>
      <!-- 窗帘部件 -->
      <div class="curtain-list">
        <el-table :data="curtainData" class="curtain-table" size="small" border :span-method="cellMerge">
          <el-table-column label="预览" width="150" align="center">
            <template slot-scope="scope">
              <!-- 显示图片预览 -->
              <div v-if="scope.$index == 0">
                <img class="curtain-preview" :src="previewUrl" :onerror="defaultUrl" />
              </div>
            </template>
          </el-table-column>
          <el-table-column label="部件" width="100" header-align="center" prop="NC_PART_TYPECODE">
            <template slot-scope="scope">
              <!-- 树缩进 -->
              <span v-if="scope.row.curtain_level > 0">
                <span :style="{'padding-left': scope.row.curtain_level * 16 + 'px'}"></span>
              </span>
              <span :class="{'delete-cls': !scope.row.curtain_choose}"
                :style="{'font-weight': scope.row.curtain_level==0?'bold':''}">{{transPartTypeCode(scope.row.NC_PART_TYPECODE)}}</span>
            </template>
          </el-table-column>
          <el-table-column label="编码" width="130" header-align="center" prop="ITEM_NO">
            <template slot-scope="scope">
              <!-- 是否可替换 -->
              <a v-if="scope.row.NCM_CHANGE == 'Y'" class="a-link"
                :class="{'delete-cls': !scope.row.curtain_choose}">{{scope.row.ITEM_NO}}</a>
              <span v-else :class="{'delete-cls': !scope.row.curtain_choose}">{{scope.row.ITEM_NO}}</span>
              <!-- 是否可删 -->
              <el-checkbox v-if="scope.row.NCM_DELETE == 'Y'" v-model="scope.row.curtain_choose"></el-checkbox>
            </template>
          </el-table-column>
          <el-table-column label="名称" width="80" header-align="center" prop="NOTE">
          </el-table-column>
          <el-table-column label="制造说明" width="180" align="center">
            <template slot-scope="scope">

            </template>
          </el-table-column>
          <el-table-column label="数量" width="50" align="center"></el-table-column>
          <el-table-column label="单位" width="50" align="center" prop="UNIT_NAME"></el-table-column>
          <el-table-column label="库存" width="50" align="center"></el-table-column>
          <el-table-column label="单价" width="50" align="center" prop="curtain_price" v-if="isManager != '0'">
            <template slot-scope="scope">
              <!-- 只有部件算钱 -->
              <span v-if="scope.row.curtain_level == 0">{{scope.row.curtain_price}}</span>
              <span v-else>-</span>
            </template>
          </el-table-column>
          <el-table-column label="折后" width="50" align="center" v-if="isManager != '0'">
            <template slot-scope="scope">
              <span v-if="scope.row.curtain_level == 0">{{ calculatePromotionPrice(scope.row) }}</span>
              <span v-else>-</span>
            </template>
          </el-table-column>
          <el-table-column label="总价" width="50" align="center"></el-table-column>
          <el-table-column label="说明" align="center"></el-table-column>
        </el-table>
      </div>
    </div>
  </el-card>
</template>

<script>
import {
  GetPartTypeDataTabale,
  GetCurtainTemplateAndModel,
} from "@/api/newCurtainASP";
import { GetPromotionByItem } from "@/api/orderListASP";
import Cookies from "js-cookie";
import Axios from "axios";

export default {
  data() {
    return {
      cid: Cookies.get("cid"), //cid
      customerType: Cookies.get("customerType"), //客户类型
      isManager: Cookies.get("isManager"), //是否为管理员
      searchKey: "DL407209K1",
      templateData: [], //查出来的原始数据
      curtainHeadData: {}, //帘款数据
      curtainDataOrigin: [], //拼接好的原始数据
      curtainData: [], //显示的窗帘数据
      curtainPartTypeData: [], //类型字典
      previewUrl:
        "http://www.luxlano.com/ddkc/ckfinder/userfiles/images/pimg/J370010.jpg",
      defaultUrl:
        "http://www.luxlano.com/ddkc/ckfinder/userfiles/images/pimg/J370010.jpg",
      activityOptions: [], //活动集合
    };
  },
  computed: {
    //当前选择的活动
    salPromotion() {
      var selectActivity = this.activityOptions.filter(
        (item) => item.P_ID == this.curtainHeadData.activityId
      );
      if (selectActivity.length) {
        return selectActivity[0];
      } else {
        return {};
      }
    },
  },
  methods: {
    //PartType字典
    getPartTypeData() {
      GetPartTypeDataTabale().then((res) => {
        console.log("字典", res);
        this.curtainPartTypeData = res.data;
      });
    },
    //PartType字典Filter
    transPartTypeCode(val) {
      var name = val;
      var typeCode = this.curtainPartTypeData.filter(
        (item) => item.NC_PART_TYPECODE == val
      );
      if (typeCode.length) {
        name = typeCode[0].NC_PART_NAME;
      }
      return name;
    },
    //搜索窗帘
    searchCurtain() {
      this.templateData = [];
      this.curtainHeadData = {};
      this.curtainData = [];
      this.curtainDataOrigin = [];
      GetCurtainTemplateAndModel({ item_no: this.searchKey }).then((res) => {
        console.log("模板", res);
        this.templateData = res.data;
        //帘款
        if (this.templateData.length) {
          var headData = this.templateData.filter(
            (item) => item.NC_PART_TYPECODE == "LK"
          );
          if (headData.length) {
            this.curtainHeadData = headData[0];
            //宽高，活动
            this.$set(this.curtainHeadData, "width", "");
            this.$set(this.curtainHeadData, "height", "");
            this.$set(this.curtainHeadData, "activityId", "");
            //加载活动
            this.getActivity();
          }
        }
        //拼接出窗帘
        for (var i = 0; i < this.templateData.length; i++) {
          var oneTemplate = this.templateData[i];
          if (oneTemplate.NC_PART_TYPECODE == "LK") continue;
          if (oneTemplate.curtain_model == null) {
            //没有选择结构的，只保留机构，其他用未选择
            var tempData = {
              NC_PART_TYPECODE: oneTemplate.NC_PART_TYPECODE,
              //其他属性不需要吧
            };
          } else {
            //其他直接拼接上去
            this.curtainData.push(...oneTemplate.curtain_model);
          }
        }
        this.getCurtainOtherMsg();
      });
    },
    getActivity() {
      this.activityOptions = [];
      GetPromotionByItem({
        cid: this.cid,
        customerType: this.customerType,
        itemNo: this.curtainHeadData.ITEM_NO,
        itemVersion: this.curtainHeadData.ITEM_VERSION,
        productType: this.curtainHeadData.PRODUCT_TYPE,
        productBrand: this.curtainHeadData.PRODUCT_BRAND,
      }).then((res) => {
        this.activityOptions = res.data;
        this.activityOptions.push({
          ORDER_TYPE: "",
          ORDER_NAME: "不参与活动",
          P_ID: null,
        });
        var defaultSel = {
          pri: 0,
          id: 0,
        };
        for (var j = 0; j < res.data.length; j++) {
          if (res.data[j].PRIORITY != 0 && defaultSel.pri == 0) {
            defaultSel.pri = res.data[j].PRIORITY;
            defaultSel.id = res.data[j].P_ID;
          } else if (
            res.data[j].PRIORITY != 0 &&
            defaultSel.pri > res.data[j].PRIORITY
          ) {
            defaultSel.pri = res.data[j].PRIORITY;
            defaultSel.id = res.data[j].P_ID;
          }
        }

        if (defaultSel.pri != 0) {
          this.curtainHeadData.activityId = defaultSel.id;
        }
      });
    },
    getCurtainOtherMsg() {
      //除了后台查出来的数据以外前端需要的数据
      for (var i = 0; i < this.curtainData.length; i++) {
        //窗帘层级
        var level = 0;
        var NCM_PID = this.curtainData[i].NCM_PID;
        while (NCM_PID != 0) {
          var temp = this.curtainData.filter(
            (item) => item.NC_MODEL_ID == NCM_PID
          );
          if (temp.length) {
            NCM_PID = temp[0].NCM_PID;
            level++;
          }
        }
        this.$set(this.curtainData[i], "curtain_level", level);
        //选中标识
        this.$set(this.curtainData[i], "curtain_choose", true);
        //单价
        var price = this.getPrice(this.customerType, this.curtainData[i]);
        this.$set(this.curtainData[i], "curtain_price", price);
        //库存
        //Axios.post("http://ljsp.ubxiu.com:8098")
      }
    },
    getPrice(type, item) {
      var price = 0;
      if (item) {
        if (type == "02" || type == "08" || type == "10") {
          //经销
          price = item.PRICE_SALE;
        } else if (type == "05") {
          price = item.SALE_PRICE;
        } else if (type == "06") {
          price = item.PRICE_FX;
        } else if (type == "09") {
          price = item.PRICE_HOME;
        }
      }
      return price;
    },
    calculatePromotionPrice(data) {
      var price = 0;
      //首先判断TYPE,1折扣，2定价
      if (this.salPromotion && this.salPromotion.P_ID) {
        switch (this.salPromotion.TYPE) {
          case "1":
            //折扣
            price = data.curtain_price.mul(this.salPromotion.DISCOUNT);
            break;
          case "2":
            //定价
            price = this.salPromotion.PRICE;
        }
      } else {
        price = data.curtain_price;
      }
      return this.dosageFilter(price);
    },
    //合并第一列显示预览
    cellMerge({ row, column, rowIndex, columnIndex }) {
      if (columnIndex == 0) {
        if (rowIndex == 0) {
          return {
            rowspan: this.curtainData.length,
            colspan: 1,
          };
        } else {
          return {
            rowspan: 0,
            colspan: 0,
          };
        }
      }
    },
  },
  mounted() {
    this.getPartTypeData();
  },
};
</script>

<style scoped>
.curtain-contain {
  margin-top: 10px;
  padding: 5px 10px;
  border: 1px solid #eee;
}
.curtain-parent-item {
  text-align: center;
  font-size: 18px;
  font-weight: bold;
}
.curtain-params {
  text-align: center;
  margin-top: 10px;
}
.curtain-list {
  margin-top: 10px;
}
.curtain-preview {
  width: auto;
  height: auto;
  max-width: 100%;
  max-height: 100%;
}
.a-link {
  text-decoration: underline;
  cursor: pointer;
}
.delete-cls {
  color: tomato;
  text-decoration: line-through;
  cursor: unset;
}
</style>
