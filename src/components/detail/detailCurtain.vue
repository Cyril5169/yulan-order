<template>
  <div>
    <el-card shadow="never">
      <div slot="header">
        <span class="fstrong f16">修改商品信息：</span>
      </div>
      <div class="dib" style="width: 100%;">
        <keep-alive>
          <detailCurtainTable :tableStatus="0" :headerData="headerData" :curtainData="curtainData">
          </detailCurtainTable>
        </keep-alive>
      </div>
    </el-card>
  </div>
</template>

<script>
import Cookies from "js-cookie";
import { mapMutations, mapActions } from "vuex";
import { mapState } from "vuex";
import DetailCurtainTable from "./detailCurtainTable";

export default {
  name: "DetailCurtain",
  data() {
    return {
      cid: Cookies.get("cid"),
      customerType: Cookies.get("customerType"),
      getParams: this.$route.params.curtain, //获取到的传参
      headerData: {}, //窗帘头部信息
      curtainData: [], //窗帘详情
    };
  },
  components: {
    DetailCurtainTable,
  },
  created() {
    this.init();
  },
  methods: {
    //初始化数据
    init() {
      if (
        this.getParams === undefined &&
        Cookies.get("curtainHead") !== undefined
      ) {
        let _curtainHead = Cookies.get("curtainHead");
        let _curtainData = sessionStorage.getItem("curtainDetail");
        this.headerData = JSON.parse(_curtainHead);
        this.curtainData = JSON.parse(_curtainData);
        return;
      }
      let _data =
        this.getParams === undefined
          ? Cookies.get("curtainDetail")
          : this.getParams;
      let _dataArr = _data.curtainLists;
      let _arr = [];
      for (let i = 0; i < _dataArr.length; i++) {
        for (let j = 0; j < _dataArr[i].curtainCommodities.length; j++) {
          let _dataCom = _dataArr[i].curtainCommodities[j];
          let _unit = _dataCom.unit === "°ü" ? "包" : _dataCom.unit;
          let obj = {
            id: _dataCom.id,
            price: _dataCom.price,
            activityId: _dataCom.activityId,
            item: {
              itemNo: _dataCom.item.itemNo,
            },
            itemType: this.getItemType(_dataCom.curtainPartName),
            productType: _dataCom.item.productType,
            cartItemId: _dataCom.cartItemId,
            quantity: _dataCom.quantity,
            width: _dataCom.width,
            height: _dataCom.height,
            note: _dataCom.note,
            unit: _unit,
            status: _dataCom.status,
            curtainItemName: _dataCom.curtainItemName,
            curtainPartName: _dataCom.curtainPartName,
            dosage: _dataCom.dosage,
            manufacturingInstructions: _dataCom.manufacturingInstructions,
            certainHeightWidth: _dataCom.certainHeightWidth,
            specification: _dataCom.specification,
            illustrate: _dataCom.illustrate,
            deleteFlag: _dataCom.deleteFlag,
            modifyFlag: _dataCom.modifyFlag,
            changeFlag: _dataCom.changeFlag,
            choose: true,
            suggestion: "",
            inlineNo: _dataCom.inlineNo,
            curtain_store: '' //库存
          };
          _arr.push(obj);
        }
      }
      this.headerData = {
        activity: _data.activity, //活动中文名称
        activityId: _data.activityId ? _data.activityId : null,
        activityName: _data.activityName,
        activityGroupType: _data.activityGroupType, //活动组别
        activityEffective: _data.activityEffective,
        cartItemId: _data.cartItemId, //此套窗帘的标识id
        checked: _data.checked,
        drape: _data.drape, //褶皱倍数
        width: _data.width, //宽度
        height: _data.height, //高度
        location: _data.location, //位置
        modelNumber: _data.modelNumber, //型号
        outsourcingBoxExist: _data.outsourcingBoxExist, //帘头外包盒是否选中
        outsourcingBoxWidth: _data.outsourcingBoxWidth, //帘头外包盒宽度
        price: _data.price, //价格
        productGroupType: _data.productGroupType, //产品组别
        quantity: _data.quantity, //数量
        highJia: _data.falseShadeHigh, ///假帘高
      };
      this.curtainData = _arr;
      //保存数据
      sessionStorage.setItem("curtainDetail", JSON.stringify(_arr));
      Cookies.set("curtainHead", this.headerData);
    },
    //根据中文名称获取itemType
    getItemType(partName) {
      switch (partName) {
        case "帘头":
          return "lt";
        case "帘身":
          return "ls";
        case "纱":
          return "sha";
        case "配件":
          return "pjb";
        case "帘身配布":
          return "lspb";
      }
    },
    ...mapMutations("navTabs", ["addTab"]),
    ...mapActions("navTabs", ["closeTab", "closeToTab"]),
  },
  watch: {},
};
</script>

<style scoped>
.scale {
  transform: scale(0.75, 0.75);
  -ms-transform: scale(0.75, 0.75);
  -moz-transform: scale(0.75, 0.75);
  -webkit-transform: scale(0.75, 0.75);
  -o-transform: scale(0.75, 0.75);
}
#messageRight {
  margin: 20px 40px;
  display: inline-block;
  vertical-align: middle;
}
#messageRight tr td:nth-child(1) {
  text-align: right;
}
#messageRight tr td:nth-child(2) {
  padding-left: 20px;
}
#messageRight td {
  padding: 5px;
  font-size: 14px;
}
#curtainTable tr td {
  padding: 6px 3px;
}
#shoppingMsg > p {
  margin: 20px auto;
}
</style>