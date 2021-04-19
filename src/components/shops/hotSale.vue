<template>
  <el-card>
    <template v-for="typeData in hotSaleTypeData">
      <div class="hot-sale-panel" v-if="typeData.data.length" :key="typeData.type">
        <h2 class="panel-title">{{typeData.text}}</h2>
        <div>
          <table class="panel-table">
            <tr v-for="(item, index) in typeData.data" :key="index">
              <td v-for="(n, indexx) in 5" :key="indexx">
                <span v-if="item[indexx].ITEM_NO != ''" class="numIndex hot-index-normal"
                  :class="{'hot-index1': index == 0,'hot-index2': index == 1,'hot-index3': index == 2}">{{ index * 5 + indexx + 1 }}</span>
                <a v-if="typeData.canClick" class="hover-link" title="点击前往下单"
                  @click="selectHot(item[indexx].ITEM_NO)">{{ item[indexx].ITEM_NO }}</a>
                <a v-else style="cursor:default;">{{ item[indexx].ITEM_NO }}</a>
                <img src="../../assets/img/img/search-hot.gif" v-if="(index == 0 || index == 1) && item[indexx].ITEM_NO != ''" />
              </td>
            </tr>
          </table>
        </div>
      </div>
    </template>
  </el-card>
</template>

<script>
import Cookies from "js-cookie";
import { mapMutations, mapState } from "vuex";
import { GetHotSales, GetItemDetailById } from "@/api/itemInfoASP";

export default {
  data() {
    return {
      hotSaleTypeData: [
        {
          type: 'B',
          text: '版本热销榜',
          canClick: false,
          data: []
        },
        {
          type: 'A',
          text: '型号热销榜',
          canClick: true,
          data: []
        },
        {
          type: 'C',
          text: '窗帘版本推荐',
          canClick: false,
          data: []
        },
        {
          type: 'D',
          text: '面料热销榜',
          canClick: true,
          data: []
        },
      ],
    };
  },
  computed: {
    ...mapState("navTabs", ["menuTreeListFlatten"]),
  },
  methods: {
    ...mapMutations("navTabs", ["addTab"]),
    isContainAttr(attr) {
      //是否包含权限
      return this.menuTreeListFlatten.filter(item => item.MENU_LINK == attr).length > 0;
    },
    getHotSale() {
      GetHotSales().then((res) => {
        if (res.data.length > 0) {
          var hotSaleData = res.data;
          for (var t = 0; t < this.hotSaleTypeData.length; t++) {
            var tempData = hotSaleData.filter(item => item.TYPE == this.hotSaleTypeData[t].type);
            if (tempData.length) {
              var data = [];
              var index = 0;
              var indexx = 0;
              for (var i = 0; i < tempData.length; i++) {
                if (i >= 5 * (index + 1)) {
                  index++;
                  indexx = 0;
                }
                if (i == 5 * index) {
                  data[index] = new Array();
                }
                data[index][indexx] = tempData[i];
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
              this.hotSaleTypeData[t].data = data;
            }
          }
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
  mounted() {
    this.getHotSale(); //获得热销榜
  }
};
</script>

<style scoped>
.hot-sale-panel {
  margin-bottom: 20px;
}
.panel-title {
  text-align: center;
  margin: 0 0 10px 0;
}
.panel-table {
  margin: 0 auto;
}
.panel-table td {
  height: 30px;
  min-width: 160px;
}
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
