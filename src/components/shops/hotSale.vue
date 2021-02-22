<template>
  <el-card>
    <div v-if="hotSaleVersion.length > 0" style="margin-bottom:20px;">
      <h2 style="text-align:center;margin:0 0 10px 0;">
        版本热销榜
      </h2>
      <div>
        <table style="margin:0 auto;">
          <tr v-for="(item, index) in hotSaleVersion" :key="index">
            <td style="height:30px;min-width:160px;" v-for="(n, indexx) in 5" :key="indexx">
              <span v-if="item[indexx].ITEM_NO != ''" class="numIndex hot-index-normal" :class="{
                              'hot-index1': index == 0 && indexx == 0,
                              'hot-index2':
                                index == 0 && (indexx == 1 || indexx == 2),
                              'hot-index3':
                                index == 0 && (indexx == 3 || indexx == 4)
                            }">{{ index * 5 + indexx + 1 }}</span>
              <a style="cursor:default;">{{ item[indexx].ITEM_NO }}</a>
              <img src="../../assets/img/img/search-hot.gif" v-if="index == 0 && item[indexx].ITEM_NO != ''" />
            </td>
          </tr>
        </table>
      </div>
    </div>
    <div v-if="hotSaleItem.length > 0" style="margin-bottom:20px;">
      <h2 style="text-align:center;margin:0 0 10px 0;">
        型号热销榜
      </h2>
      <div>
        <table style="margin:0 auto;">
          <tr v-for="(item, index) in hotSaleItem" :key="index">
            <td style="height:30px;min-width:160px;" v-for="(n, indexx) in 5" :key="indexx">
              <span v-if="item[indexx].ITEM_NO != ''" class="numIndex hot-index-normal" :class="{
                              'hot-index1': index == 0,
                              'hot-index2': index == 1,
                              'hot-index3': index == 2
                            }">{{ index * 5 + indexx + 1 }}</span>
              <a class="hover-link" title="点击前往下单"
                @click="selectHot(item[indexx].ITEM_NO)">{{ item[indexx].ITEM_NO }}</a>
              <img src="../../assets/img/img/search-hot.gif" v-if="
                              (index == 0 || index == 1) &&
                                item[indexx].ITEM_NO != ''
                            " />
            </td>
          </tr>
        </table>
      </div>
    </div>
    <div v-if="hotSaleCurtain.length > 0" style="margin-bottom:20px;">
      <h2 style="text-align:center;margin:0 0 10px 0;">
        窗帘版本推荐
      </h2>
      <div>
        <table style="margin:0 auto;">
          <tr v-for="(item, index) in hotSaleCurtain" :key="index">
            <td style="height:30px;min-width:160px;" v-for="(n, indexx) in 5" :key="indexx">
              <span v-if="item[indexx].ITEM_NO != ''" class="numIndex hot-index-normal" :class="{
                              'hot-index1': index == 0,
                              'hot-index2': index == 1,
                              'hot-index3': index == 2
                            }">{{ index * 5 + indexx + 1 }}</span>
              <a style="cursor:default;">{{ item[indexx].ITEM_NO }}</a>
              <img src="../../assets/img/img/search-hot.gif" v-if="
                              (index == 0 || index == 1) &&
                                item[indexx].ITEM_NO != ''
                            " />
            </td>
          </tr>
        </table>
      </div>
    </div>
    <div v-if="hotSaleSoft.length > 0" style="margin-bottom:20px;">
      <h2 style="text-align:center;margin:0 0 10px 0;">
        面料热销榜
      </h2>
      <div>
        <table style="margin:0 auto;">
          <tr v-for="(item, index) in hotSaleSoft" :key="index">
            <td style="height:30px;min-width:160px;" v-for="(n, indexx) in 5" :key="indexx">
              <span v-if="item[indexx].ITEM_NO != ''" class="numIndex hot-index-normal" :class="{
                              'hot-index1': index == 0,
                              'hot-index2': index == 1,
                              'hot-index3': index == 2
                            }">{{ index * 5 + indexx + 1 }}</span>
              <a class="hover-link" title="点击前往下单"
                @click="selectHot(item[indexx].ITEM_NO)">{{ item[indexx].ITEM_NO }}</a>
              <img src="../../assets/img/img/search-hot.gif" v-if="
                              (index == 0 || index == 1) &&
                                item[indexx].ITEM_NO != ''
                            " />
            </td>
          </tr>
        </table>
      </div>
    </div>
  </el-card>
</template>

<script>
import Cookies from "js-cookie";
import { mapMutations, mapState } from "vuex";
import { GetHotSales, GetItemDetailById } from "@/api/itemInfoASP";

export default {
  data() {
    return {
      hotSaleVersion: [],
      hotSaleItem: [],
      hotSaleCurtain: [],
      hotSaleSoft: [],
    };
  },
  computed:{
    ...mapState("navTabs", ["menuTreeListFlatten"]),
  },
  methods: {
    ...mapMutations("navTabs", ["addTab"]),
    isContainAttr(attr) {
      //是否包含权限
      return (
        this.menuTreeListFlatten.filter((item) => item.MENU_LINK == attr)
          .length > 0
      );
    },
    getHotSale() {
      GetHotSales().then((res) => {
        if (res.data.length > 0) {
          var itemData = res.data.filter((item) => item.TYPE == "A"); //型号热销
          var versionData = res.data.filter((item) => item.TYPE == "B"); //版本热销
          var curtainData = res.data.filter((item) => item.TYPE == "C"); //窗帘版本推荐
          var softData = res.data.filter((item) => item.TYPE == "D"); //面料热销
          var data = [];
          var data2 = [];
          var data3 = [];
          var data4 = [];
          var index = 0;
          var indexx = 0;
          //分成每行5个的数据
          //版本
          for (var i = 0; i < versionData.length; i++) {
            if (i >= 5 * (index + 1)) {
              index++;
              indexx = 0;
            }
            if (i == 5 * index) {
              data[index] = new Array();
            }
            data[index][indexx] = versionData[i];
            indexx++;
          }
          if (data[index].length < 5) {
            var len = 5 - data[index].length;
            for (var i = 0; i < len; i++) {
              data[index].push({
                ITEM_NO: "",
              });
            }
          }
          this.hotSaleVersion = data;
          //型号
          index = 0;
          indexx = 0;
          for (var i = 0; i < itemData.length; i++) {
            if (i >= 5 * (index + 1)) {
              index++;
              indexx = 0;
            }
            if (i == 5 * index) {
              data2[index] = new Array();
            }
            data2[index][indexx] = itemData[i];
            indexx++;
          }
          if (data2[index].length < 5) {
            var len = 5 - data2[index].length;
            for (var i = 0; i < len; i++) {
              data2[index].push({
                ITEM_NO: "",
              });
            }
          }
          this.hotSaleItem = data2;
          //窗帘
          index = 0;
          indexx = 0;
          for (var i = 0; i < curtainData.length; i++) {
            if (i >= 5 * (index + 1)) {
              index++;
              indexx = 0;
            }
            if (i == 5 * index) {
              data3[index] = new Array();
            }
            data3[index][indexx] = curtainData[i];
            indexx++;
          }
          if (data3[index].length < 5) {
            var len = 5 - data3[index].length;
            for (var i = 0; i < len; i++) {
              data3[index].push({
                ITEM_NO: "",
              });
            }
          }
          this.hotSaleCurtain = data3;
          //面料
          index = 0;
          indexx = 0;
          for (var i = 0; i < softData.length; i++) {
            if (i >= 5 * (index + 1)) {
              index++;
              indexx = 0;
            }
            if (i == 5 * index) {
              data4[index] = new Array();
            }
            data4[index][indexx] = softData[i];
            indexx++;
          }
          if (data4[index].length < 5) {
            var len = 5 - data4[index].length;
            for (var i = 0; i < len; i++) {
              data4[index].push({
                ITEM_NO: "",
              });
            }
          }
          this.hotSaleSoft = data4;
        }
      });
    },
    selectHot(itemNo) {
      GetItemDetailById({ itemNo: itemNo }, { loading: false }).then((res) => {
        if (res.data) {
          switch (res.data[0].PRODUCT_TYPE) {
            case "KS": //窗帘
              if (this.isContainAttr("shops/curtain")) {
                this.addTab("shops/curtain");
                this.$router.push({
                  name: "curtain",
                  params: {
                    selectNo: itemNo,
                  },
                });
              } else {
                console.log("没有该菜单");
              }
              break;
            case "ML":
            case "XHB":
            case "PJB":
            case "BZ":
            case "GH":
            case "TC":
            case "OTHER":
              if (this.isContainAttr("shops/softSuit")) {
                this.addTab("shops/softSuit");
                Cookies.set("activeNameSoftSuit", res.data[0].PRODUCT_TYPE);
                this.$router.push({
                  name: "softSuit",
                  params: {
                    selectNo: itemNo,
                    selectType: res.data[0].PRODUCT_TYPE,
                  },
                });
              } else {
                console.log("没有该菜单");
              }
              break;
            default:
              if (
                res.data[0].PRO_TYPE == "qiang" ||
                res.data[0].PRO_TYPE == "support" ||
                res.data[0].PRO_TYPE == "other"
              ) {
                if (this.isContainAttr("shops/wallPaper")) {
                  this.addTab("shops/wallPaper");
                  this.$router.push({
                    name: "wallPaper",
                    params: {
                      selectNo: itemNo,
                    },
                  });
                } else {
                  console.log("没有该菜单");
                }
              }
              break;
          }
        }
      });
    },
  },
  mounted(){
    this.getHotSale(); //获得热销榜
  }
};
</script>

<style scoped>
.numIndex {
  display: inline-block;
  padding: 1px 0;
  color: #fff;
  min-width: 15px;
  line-height: 100%;
  font-size: 12px;
  text-align: center;
  margin-right: 5px;
}
.hot-index1 {
  background-color: #f54545 !important;
}
.hot-index2 {
  background-color: #ff8547 !important;
}
.hot-index3 {
  background-color: #ffac38 !important;
}
.hot-index-normal {
  background-color: #8eb9f5;
}
.hover-link:hover {
  text-decoration: underline !important;
}
</style>
