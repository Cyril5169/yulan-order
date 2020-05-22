<template>
  <div>
    <el-card shadow="hover">
      <div id="shopsCon">
        <el-tabs v-model="activeName" @tab-click="handleClick">
          <div id="shopSearchBox" class="mt10">
            <el-input clearable v-model.trim="searchKey" @clear="_getShopsAllSoftSuitMsg(0)"
              @keyup.enter.native="searchSoftSuit(0)" placeholder="输入商品型号查找商品" style="width:25%; min-width:280px;">
              <div id="searchBtn" slot="append" style="cursor:pointer;" @click="searchSoftSuit(0)">
                搜索
              </div>
            </el-input>
          </div>
          <el-tab-pane lazy v-for="item in softList" :key="item.name" :name="item.name" :label="item.label">
          </el-tab-pane>
          <shopTab v-bind:tableData="tableData" v-bind:numberList="numberList"></shopTab>
          <el-pagination style="margin:0 10%;" @size-change="handleSizeChange" @current-change="handleCurrentChange"
            :current-page.sync="currentPage" :page-size="pageSize" layout="total, prev, pager, next, jumper"
            :total="totalNumber">
          </el-pagination>
        </el-tabs>
      </div>
    </el-card>
  </div>
</template>

<script>
import Cookies from "js-cookie";
import ShopTab from "./shopTab";
import {
  getShopsSingleSoftSuit,
  getShopsAllSoftSuitMsg
} from "@/api/shopSearch";
import { GetSoftByProductType } from "@/api/itemInfoASP";

export default {
  name: "SoftSuit",
  data() {
    return {
      cid: Cookies.get("cid"), //假定的用户ID
      searchKey: "", //搜索的关键词
      chooseTab: "", //当前的选择
      //传给组件的数据
      tableData: [],
      numberList: [],
      //创建一个总的data，这样只需加载一次请求
      allData: [[], [], [], [], [], [], []],
      allNumber: ["", "", "", "", "", "", ""], //总条数
      //软装标签列表
      softList: [
        {
          name: "ML",
          label: "面料"
        },
        {
          name: "XHB",
          label: "花边"
        },
        {
          name: "PJB",
          label: "挂带/配件包"
        },
        {
          name: "BZ",
          label: "抱枕"
        },
        {
          name: "GH",
          label: "装饰画"
        },
        {
          name: "TC",
          label: "成品帘"
        },
        {
          name: "CP",
          label: "床品"
        },
        {
          name: "OTHER",
          label: "其它"
        }
      ],
      currentPage: 1, //当前的页数
      pageSize: 10, //每页的个数
      totalNumber: 0 //总条数
    };
  },
  components: {
    ShopTab
  },
  methods: {
    //获取每页的条数
    handleSizeChange(val) {},
    //获取当前页
    handleCurrentChange(val) {
      this.currentPage = val;
      // if (this.searchKey.length === 0) this._getShopsAllSoftSuitMsg(1);
      // else {
      //   this.searchSoftSuit(1);
      // }
      this.searchSoftSuit();
    },
    //数组去重
    unique(arr) {
      var i, j;
      var len = arr.length;
      for (i = 0; i < len; i++) {
        for (j = i + 1; j < len; j++) {
          if (arr[i].ITEM_NO == arr[j].ITEM_NO) {
            arr.splice(j, 1);
            len--;
            j--;
          }
        }
      }
      return arr;
    },
    //数据转单位
    changeUnit(data) {
      data.forEach(item => {
        if (item.unit === "°ü") {
          item.unit = "包";
        }
      });
      return data;
    },
    //创建每个软装的数量
    createNumberList(len) {
      this.numberList = [];
      for (var i = 0; i < len; i++) {
        this.numberList.push({
          value: "", //主计量
          value1: "" //辅助计量
        });
      }
    },
    //获取对应产品的商品信息
    _getShopsAllSoftSuitMsg(flag) {
      this.tableData = [];
      var status = 0;
      if (flag !== 1) {
        switch (this.chooseTab) {
          case "ML":
            if (this.allData[0].length !== 0) {
              this.tableData = this.allData[0];
              this.totalNumber = this.tableData[0].total;
              this.createNumberList(this.allData[0].length);
              return;
            }
            status = 0;
            break;
          case "XHB":
            if (this.allData[1].length !== 0) {
              this.tableData = this.allData[1];
              this.totalNumber = this.tableData[1].total;
              this.createNumberList(this.allData[1].length);
              return;
            }
            status = 1;
            break;
          case "PJB":
            if (this.allData[2].length !== 0) {
              this.tableData = this.allData[2];
              this.totalNumber = this.tableData[2].total;
              this.createNumberList(this.allData[2].length);
              return;
            }
            status = 2;
            break;
          case "BZ":
            if (this.allData[3].length !== 0) {
              this.tableData = this.allData[3];
              this.totalNumber = this.tableData[3].total;
              this.createNumberList(this.allData[3].length);
              return;
            }
            status = 3;
            break;
          case "GH":
            if (this.allData[4].length !== 0) {
              this.tableData = this.allData[4];
              this.totalNumber = this.tableData[4].total;
              this.createNumberList(this.allData[4].length);
              return;
            }
            status = 4;
            break;
          case "TC":
            if (this.allData[5].length !== 0) {
              this.tableData = this.allData[5];
              this.totalNumber = this.tableData[5].total;
              this.createNumberList(this.allData[5].length);
              return;
            }
            status = 5;
            break;
          case "OTHER":
            if (this.allData[6].length !== 0) {
              this.tableData = this.allData[6];
              this.totalNumber = this.tableData[6].total;
              this.createNumberList(this.allData[6].length);
              return;
            }
            status = 6;
            break;
        }
        getShopsAllSoftSuitMsg({
          itemType: this.chooseTab,
          cid: this.cid,
          limit: this.pageSize,
          page: this.currentPage
        })
          .then(res => {
            res.data = this.unique(res.data);
            res.data = this.changeUnit(res.data);
            this.allData[status] = res.data;
            this.allNumber[status] = res.data[0].total;
            this.totalNumber = this.allNumber[status];
            this.tableData = this.allData[status];
            this.createNumberList(this.tableData.length);
          })
          .catch(err => {
            console.log(err);
          });
      } else {
        switch (this.chooseTab) {
          case "ML":
            status = 0;
            break;
          case "XHB":
            status = 1;
            break;
          case "PJB":
            status = 2;
            break;
          case "BZ":
            status = 3;
            break;
          case "GH":
            status = 4;
            break;
          case "TC":
            status = 5;
            break;
          case "OTHER":
            status = 6;
            break;
        }
        getShopsAllSoftSuitMsg({
          itemType: this.chooseTab,
          cid: this.cid,
          limit: this.pageSize,
          page: this.currentPage
        })
          .then(res => {
            res.data = this.unique(res.data);
            res.data = this.changeUnit(res.data);
            this.tableData = res.data;
            this.totalNumber = this.allNumber[status];
            this.createNumberList(this.tableData.length);
          })
          .catch(err => {
            console.log(err);
          });
      }
    },
    //软装单类产品的模糊搜索
    searchSoftSuit() {
      GetSoftByProductType({
        productType: this.chooseTab,
        keywords: this.searchKey.toUpperCase(),
        cid: this.cid,
        page: this.currentPage,
        limit: this.pageSize
      })
        // getShopsSingleSoftSuit({
        //   itemType: this.chooseTab,
        //   cid: this.cid,
        //   itemNo: this.searchKey.toUpperCase(),
        //   limit: this.pageSize,
        //   page: this.currentPage
        // })
        .then(res => {
          this.tableData = this.unique(res.data);
          //this.tableData = this.changeUnit(this.tableData);
          this.totalNumber = res.count;
          this.createNumberList(this.tableData.length);
        })
        .catch(err => {
          this.tableData = [];
          this.totalNumber = 0;
        });
    },
    //切换标签页时的触发事件
    handleClick(tab, event) {
      if (tab.name == this.chooseTab) return;
      this.chooseTab = tab.name;
      this.searchKey = "";
      this.currentPage = 1;
      Cookies.set("activeNameSoftSuit", tab.name);
      //this._getShopsAllSoftSuitMsg(0);
      this.init();
    },
    init() {
      // if (this.searchKey === "") {
      //   this._getShopsAllSoftSuitMsg(0);
      // } else {
      this.currentPage = 1;
      this.searchSoftSuit();
      //}
    }
  },
  computed: {
    //获取当前的标签页选项
    activeName: {
      get() {
        if (Cookies.get("activeNameSoftSuit") === undefined) {
          Cookies.set("activeNameSoftSuit", "ML");
          this.chooseTab = Cookies.get("activeNameSoftSuit");
          //this._getShopsAllSoftSuitMsg(0);
          this.init();
        } else this.chooseTab = Cookies.get("activeNameSoftSuit");
        return Cookies.get("activeNameSoftSuit");
      },
      set(value) {
        Cookies.set("activeNameSoftSuit", value);
      }
    }
  },
  created() {
    var selectNo = this.$route.params.selectNo;
    var selectType = this.$route.params.selectType;
    if (selectNo && selectType) {
      this.searchKey = selectNo;
    }
    if (Cookies.get("activeNameSoftSuit") !== undefined) {
      this.chooseTab = Cookies.get("activeNameSoftSuit");
      this.init();
    }
  },
  activated() {
    var selectNo = this.$route.params.selectNo;
    var selectType = this.$route.params.selectType;
    if (selectNo && selectType) {
      this.searchKey = selectNo;
    }
    if (Cookies.get("activeNameSoftSuit") !== undefined) {
      this.chooseTab = Cookies.get("activeNameSoftSuit");
      this.init();
    }
  }
};
</script>

<style scoped>
#shopSearchBox div:hover {
  cursor: pointer;
}
#searchBtn {
  color: #101010;
  cursor: pointer;
}
</style>