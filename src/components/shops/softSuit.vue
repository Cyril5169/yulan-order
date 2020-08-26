<template>
  <el-card shadow="hover">
    <el-tabs v-model="activeName" @tab-click="handleClick">
      <div class="mt10">
        <el-input clearable v-model.trim="searchKey" @clear="init" @keyup.enter.native="searchSoftSuit"
          placeholder="输入商品型号查找商品" style="width:25%; min-width:280px;">
          <el-button @click="searchSoftSuit" slot="append" icon="el-icon-search">搜索</el-button>
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
  </el-card>
</template>

<script>
import Cookies from "js-cookie";
import ShopTab from "./shopTab";
import {
  getShopsSingleSoftSuit,
  getShopsAllSoftSuitMsg,
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
      //软装标签列表
      softList: [
        {
          name: "ML",
          label: "面料",
        },
        {
          name: "XHB",
          label: "花边",
        },
        {
          name: "PJB",
          label: "挂带/配件包",
        },
        {
          name: "BZ",
          label: "抱枕",
        },
        {
          name: "GH",
          label: "装饰画",
        },
        {
          name: "TC",
          label: "成品帘",
        },
        {
          name: "CP",
          label: "床品",
        },
        {
          name: "OTHER",
          label: "其它",
        },
      ],
      currentPage: 1, //当前的页数
      pageSize: 10, //每页的个数
      totalNumber: 0, //总条数
    };
  },
  components: {
    ShopTab,
  },
  methods: {
    //获取每页的条数
    handleSizeChange(val) {},
    //获取当前页
    handleCurrentChange(val) {
      this.currentPage = val;
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
      data.forEach((item) => {
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
          value1: "", //辅助计量
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
        limit: this.pageSize,
      })
        .then((res) => {
          this.tableData = this.unique(res.data);
          this.totalNumber = res.count;
          this.createNumberList(this.tableData.length);
        })
        .catch((err) => {
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
      this.init();
    },
    init() {
      this.currentPage = 1;
      this.searchSoftSuit();
    },
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
      },
    },
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
  },
};
</script>
