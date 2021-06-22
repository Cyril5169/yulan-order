<template>
  <el-card shadow="hover">
    <el-tabs v-model="activeName" @tab-click="handleClick">
      <div style="margin-top:10px;display:flex;line-height:40px">
        <el-input clearable v-model.trim="searchKey" @clear="init" @keyup.enter.native="searchSoftSuit" placeholder="输入商品型号查找商品"
          style="width:25%; min-width:280px;">
          <el-button @click="searchSoftSuit" slot="append" icon="el-icon-search">搜索</el-button>
        </el-input>
        <span v-if="newsData.length" style="margin-left:10px;flex:1;">
          <el-carousel height="40px" direction="vertical">
            <el-carousel-item v-for="(item,index) in newsData" :key="index">
              <a style="text-decoration:underline;font-size:13px;" :key="item.ID"
                @click="showDetailStopData(item,index)">{{ item.TITLE }}</a>
            </el-carousel-item>
          </el-carousel>
        </span>
      </div>
      <el-tab-pane lazy v-for="item in softList" :key="item.name" :name="item.name" :label="item.label">
      </el-tab-pane>
      <el-table class="shopTabCon" :data="tableData" :row-key="getRowKeys" :expand-row-keys="expands"
        @expand-change="expandChange" style="min-width: 750px; margin: 5px auto;">
        <el-table-column label="型号" prop="ITEM_NO" width="150" align="center">
        </el-table-column>
        <el-table-column label="名称" prop="NOTE" width="140" align="center">
          <template slot-scope="scope">
            <span v-if="scope.row.NOTE">{{ scope.row.NOTE }}</span>
            <span v-else>--</span>
          </template>
        </el-table-column>
        <el-table-column label="规格尺寸" width="120" align="center">
          <template slot-scope="scope">
            <span v-if="scope.row.FIX_TYPE === '01'">
              定宽
              <span v-if="scope.row.RZ_GRADE">
                {{scope.row.FIX_GRADE/1000 + (scope.row.UNIT_NAME?scope.row.UNIT_NAME:'米')}}
              </span>
            </span>
            <span v-else-if="scope.row.FIX_TYPE === '02'">
              定高
              <span v-if="scope.row.RZ_GRADE">
                {{scope.row.FIX_GRADE/1000 + (scope.row.UNIT_NAME?scope.row.UNIT_NAME:'米')}}
              </span>
            </span>
            <span v-else-if="scope.row.RZ_GRADE">
              {{ scope.row.RZ_GRADE }}
            </span>
            <span v-else>--</span>
          </template>
        </el-table-column>
        <el-table-column v-if="minimumPurchaseShow" label="起购数量" prop="MINIMUM_PURCHASE" width="80" align="center">
        </el-table-column>
        <el-table-column width="200" label="数量" align="center">
          <template slot-scope="scope">
            <div v-if="scope.row.UNIT_NAME === '平方米'" align="center">
              <span class="num-font">宽</span>
              <currency-input :customStyle="'width: 60px;'" v-model.number="numberList[scope.$index].value">
              </currency-input>
              ×
              <span class="num-font">高</span>
              <currency-input :customStyle="'width: 60px;'" v-model="numberList[scope.$index].value1">
              </currency-input>
            </div>
            <div v-else>
              <currency-input :customStyle="'width: 80px;'" v-model.number="numberList[scope.$index].value">
              </currency-input>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="单位" width="80" align="center">
          <template slot-scope="scope">
            <span>{{ scope.row.UNIT_NAME ? scope.row.UNIT_NAME : "米" }}</span>
          </template>
        </el-table-column>
        <el-table-column width="100px" label="操作" align="center">
          <template slot-scope="scope">
            <a class="mr10" @click="seeStore(scope)">查看库存</a>
          </template>
        </el-table-column>
        <el-table-column width="100px;" type="expand">
          <template slot-scope="scope">
            <el-form style="margin:10px 0 0 20px;">
              <el-form-item label="活动：">
                <el-select style="width:300px;" :disabled="disableFlag" v-model="seletedActivity" :placeholder="
                  disableFlag === false ? '请选择一个活动' : '此产品不参与活动'">
                  <el-option v-for="item in activity" :label="item.label" :key="item.value" :value="item.value">
                  </el-option>
                </el-select>
              </el-form-item>
              <el-form-item label="备注：">
                <el-input resize="none" type="textarea" placeholder="请输入您的备注信息（50字内）" maxlength="50"
                  :autosize="{ minRows: 3, maxRows: 6 }" v-model="remark" style="width:500px;">
                </el-input>
                <span style="margin-left:10px;">{{ remark ? remark.length : 0 }}/50</span>
              </el-form-item>
              <el-form-item style="text-align:center;">
                <el-button style="width: 120px;" type="danger" @click="saveToShoppingCar(scope.row, scope.$index)">加入购物车
                </el-button>
                <el-button style="width: 120px;" type="info" @click="expandChange(scope)">取消</el-button>
              </el-form-item>
            </el-form>
          </template>
        </el-table-column>
      </el-table>
      <el-pagination style="margin:0 10%;" @current-change="searchSoftSuit" :current-page.sync="currentPage" :page-size="limit"
        layout="total, prev, pager, next, jumper" :total="totalNumber">
      </el-pagination>
    </el-tabs>

    <el-dialog border title="库存查询" :visible.sync="dialogTableVisible" width="550px">
      <el-table class="storeTable" :data="produceStore" :row-style="rowClass">
        <el-table-column property="header" min-width="30%"></el-table-column>
        <el-table-column property="body" style="width: 70%;"></el-table-column>
      </el-table>
      <div slot="footer">
        <el-button type="success" plain @click="dialogTableVisible = false">关 闭</el-button>
      </div>
    </el-dialog>

    <!-- 停产通知 -->
    <el-dialog :visible.sync="newsDetailShow" width="350px" :title="stopDetailTitle">
      <el-table :data="stopDetailList">
        <el-table-column label="序号" type="index" align="center"></el-table-column>
        <el-table-column label="型号" prop="ITEM_NO" align="center"></el-table-column>
        <el-table-column label="更改时间" prop="STOP_DATE" align="center">
          <template slot-scope="scope">
            <span>{{ scope.row.STOP_DATE | dateFilter }}</span>
          </template>
        </el-table-column>
      </el-table>
    </el-dialog>
  </el-card>
</template>

<script>
import { GetSoftByProductType } from "@/api/itemInfoASP";
import { GetStopProductionData } from "@/api/newCurtainASP";
import { addShoppingCar } from "@/api/shop";
import { GetPromotionByItem } from "@/api/orderListASP";
import Axios from "axios";
import Cookies from "js-cookie";

export default {
  name: "SoftSuit",
  data() {
    return {
      cid: Cookies.get("cid"), //用户ID
      customerType: Cookies.get("customerType"), //客户类型
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
      limit: 10, //每页的个数
      totalNumber: 0, //总条数
      newsData: [],
      newsDetailShow: false,
      stopDetailList: [],
      stopDetailTitle: '',
      activity: [], //活动
      seletedActivity: "", //选择的活动
      remark: "", //备注
      expands: [], //展开行type的数组
      produceStore: [
        {
          header: "类别",
          body: "",
        },
        {
          header: "编号",
          body: "",
        },
        {
          header: "尺寸",
          body: "",
        },
        {
          header: "库存信息",
          body: "",
        },
      ],
      storeMsg: [], //储存当前页面的库存信息
      dialogTableVisible: false,
      disableFlag: false, //判断是否禁用选择框
      minimumPurchaseShow: false,
    };
  },
  computed: {
    //获取当前的标签页选项
    activeName: {
      get() {
        if (Cookies.get("activeNameSoftSuit") === undefined) {
          Cookies.set("activeNameSoftSuit", "ML");
          this.chooseTab = Cookies.get("activeNameSoftSuit");
          this.init();
        } else this.chooseTab = Cookies.get("activeNameSoftSuit");
        return Cookies.get("activeNameSoftSuit");
      },
      set(value) {
        Cookies.set("activeNameSoftSuit", value);
      },
    },
  },
  methods: {
    //创建每个软装的数量
    createNumberList() {
      this.numberList = [];
      for (var i = 0; i < this.tableData.length; i++) {
        this.numberList.push({
          value: "", //主计量
          value1: "", //辅助计量
        });
      }
    },
    init() {
      this.currentPage = 1;
      this.searchSoftSuit();
    },
    //软装单类产品的模糊搜索
    searchSoftSuit() {
      this.tableData = [];
      GetSoftByProductType({
        productType: this.chooseTab,
        keywords: this.searchKey,
        cid: this.cid,
        page: this.currentPage,
        limit: this.limit,
      }).then((res) => {
        this.tableData = res.data;
        this.totalNumber = res.count;
        this.createNumberList();
      }).catch((err) => { });
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
    //停产新闻
    getStopProductionNews() {
      GetStopProductionData({ proType: 'soft' }).then(res => {
        //分成两块，待淘汰和停产
        if (res.data.length) {
          var statusList = [
            {
              value: 'stay',
              label: '待淘汰'
            },
            {
              value: 'stop',
              label: '已淘汰'
            }
          ]
          for (var s = 0; s < statusList.length; s++) {
            var status = statusList[s];
            var filterData = res.data.filter(item => item.STOP_TYPE == status.value);
            if (filterData.length) {
              //按年月分组
              var groupData = this.groupBy(filterData, "STOP_DATE", this.datatrans);
              for (var g = 0; g < groupData.length; g++) {
                var itemTxt = '';
                for (var i = 0; i < groupData[g].value.length; i++) {
                  itemTxt += groupData[g].value[i].ITEM_NO + '，';
                  if (i >= 3) break;
                }
                itemTxt = status.label + '产品：' + groupData[g].group + '，型号：' + itemTxt;
                if (groupData[g].value.length > 3) {
                  itemTxt += '...';
                } else {
                  itemTxt = itemTxt.substring(0, itemTxt.length - 1)
                }
                //拼接
                this.newsData.push({
                  ID: status.value + groupData[g].group,
                  TITLE: itemTxt,
                  DATA: filterData
                })
              }
            }
          }
        }
      })
    },
    datatrans(value) {
      //时间戳转化大法
      if (value == null || value == "") {
        return "";
      }
      let date = new Date(value);
      let y = date.getFullYear();
      let MM = date.getMonth() + 1;
      MM = MM < 10 ? "0" + MM : MM;
      return y + "-" + MM
    },
    showDetailStopData(item, index) {
      this.stopDetailList = JSON.parse(JSON.stringify(item.DATA));
      if (item.TITLE.indexOf('待淘汰') > -1) this.stopDetailTitle = "待淘汰产品列表";
      else this.stopDetailTitle = "已淘汰产品列表";
      this.newsDetailShow = true;
    },
    //单列的groupby
    groupBy(array, name, filterMethod = function (a) { return a }) {
      let groups = [];
      array.forEach((item) => {
        let groupName = filterMethod(item[name]);
        var hasgroup = groups.filter((item) => item.group == groupName);
        if (hasgroup.length) {
          hasgroup[0].value.push(item);
        } else {
          groups.push({
            group: groupName,
            value: [item],
          });
        }
      });
      return groups;
    },
    rowClass(row, index) {
      if (row.rowIndex % 2 === 0) {
        return;
      } else {
        return { background: "rgba(225, 255, 229, 1)" };
      }
    },
    //清空值
    clearMsg() {
      this.activity = [];
      this.seletedActivity = "";
      this.remark = "";
      this.minimumPurchaseShow = false;
    },
    //获取row的key值
    getRowKeys(row) {
      return row.ITEM_NO;
    },
    //展开行
    expandChange(row) {
      this.clearMsg();
      if (row.ITEM_NO === undefined) {
        this.expands = [];
        return;
      }
      row.MINIMUM_PURCHASE == 0
        ? (this.minimumPurchaseShow = false)
        : (this.minimumPurchaseShow = true);
      GetPromotionByItem({
        cid: this.cid,
        customerType: this.customerType,
        itemNo: row.ITEM_NO,
        itemVersion: row.ITEM_VERSION,
        productType: row.PRODUCT_TYPE,
        productBrand: row.PRODUCT_BRAND,
      })
        .then((res) => {
          if (res.data.length === 0) {
            this.disableFlag = true;
          } else {
            this.disableFlag = false;
          }
          var defaultSel = {
            pri: 0,
            id: 0,
          };
          for (var i = 0; i < res.data.length; i++) {
            var obj = {
              label: res.data[i].ORDER_TYPE + " -- " + res.data[i].ORDER_NAME,
              value: res.data[i].P_ID,
            };
            if (res.data[i].PRIORITY != 0 && defaultSel.pri == 0) {
              defaultSel.pri = res.data[i].PRIORITY;
              defaultSel.id = res.data[i].P_ID;
            } else if (
              res.data[i].PRIORITY != 0 &&
              defaultSel.pri > res.data[i].PRIORITY
            ) {
              defaultSel.pri = res.data[i].PRIORITY;
              defaultSel.id = res.data[i].P_ID;
            }
            this.activity.push(obj);
          }
          if (defaultSel.pri != 0) {
            this.seletedActivity = defaultSel.id;
          }
          this.activity.push({
            label: "不参与活动",
            value: null,
          });
        })
        .catch((err) => {
          console.log(err);
        });
      let temp = this.expands;
      this.expands = [];
      this.expands.push(row.ITEM_NO);
      if (temp.length === 1 && temp[0] === row.ITEM_NO) {
        // 收起展开行
        this.expands = [];
      }
    },
    //保存到购物车
    saveToShoppingCar(row, index) {
      //库存判断,判断成功才可以添加
      let val;
      if (row.UNIT_NAME === "平方米") {
        val = this.numberList[index].value * this.numberList[index].value1;
      } else {
        val = this.numberList[index].value;
      }
      if (val === "0" || val === 0) {
        this.$alert("数量不能为空", "提示", {
          type: "warning",
          confirmButtonText: "确定",
        });
        return;
      }
      //判断起购数量
      if (row.MINIMUM_PURCHASE != 0 && val < row.MINIMUM_PURCHASE) {
        this.$alert(
          "本产品最小起购数量为" + row.MINIMUM_PURCHASE + row.UNIT_NAME,
          "提示",
          {
            type: "warning",
            confirmButtonText: "确定",
          }
        );
        return;
      }
      //判断数字合理性
      //面料、花边保留一位小数
      //其余都是整数
      let _type = Cookies.get("activeNameSoftSuit");
      let re = /^[1-9]\d*$/;
      if (_type === "ML" || _type === "XHB") {
        re = /^[0-9]+(.[0-9]{1})?$/;
      }
      if (re.test(val) === false) {
        this.$alert("数量栏请填写正确的数字", "提示", {
          type: "warning",
          confirmButtonText: "确定",
        });
        return;
      }
      if (this.seletedActivity === "" && this.disableFlag === false) {
        this.$alert("请选择一个活动", "提示", {
          type: "warning",
          confirmButtonText: "确定",
        });
        return;
      }
      let storeMessage = "-1";
      if (this.seletedActivity === null || this.seletedActivity === undefined)
        this.seletedActivity = "";
      this.numberList[index].value = this.numberList[index].value.toString();
      this.numberList[index].value1 = this.numberList[index].value1.toString();
      addShoppingCar({
        customer_type: this.customerType,
        CID: this.cid,
        itemNO: row.ITEM_NO,
        commodityType: "soft",
        activityID: this.seletedActivity,
        quantity: row.UNIT_NAME == "平方米" ? "" : this.numberList[index].value,
        height: row.UNIT_NAME == "平方米" ? this.numberList[index].value1 : "",
        width: row.UNIT_NAME == "平方米" ? this.numberList[index].value : "",
        note: this.remark,
        splitShipment: storeMessage,
        softType: _type,
      })
        .then((res) => {
          this.numberList[index].value = "";
          this.numberList[index].value1 = "";
          this.expands = [];
          this.clearMsg();
          if (res.data.code === 0) {
            this.$alert("此型号已添加成功，请前往购物车查看", "添加成功", {
              confirmButtonText: "确定",
              type: "success",
            });
            this.$root.$emit("refreshBadgeIcon", "softCount");
          } else {
            var msg = res.data.msg;
            if (msg == "该产品正在上架，暂时不能加入购物车") {
              msg =
                "没有维护" +
                this.getPriceTip() +
                "价格，暂时不能加入购物车，请联系玉兰订单部";
            }
            this.$alert(msg, "添加失败", {
              confirmButtonText: "确定",
              type: "warning",
            });
          }
        })
        .catch((err) => {
          this.numberList[index].value = "";
          this.numberList[index].value1 = "";
          this.expands = [];
          this.clearMsg();
          this.$alert(
            "添加失败，请查看信息填写是否正确或者检查网络是否通畅",
            "提示",
            {
              confirmButtonText: "确定",
              type: "warning",
            }
          );
          console.log(err);
        });
    },
    getPriceTip() {
      switch (this.customerType) {
        case "02":
        case "08":
        case "10":
          return "经销";
        case "05":
          return "零售";
        case "06":
          return "分销";
        case "09":
          return "家装";
        default:
          return "";
      }
    },
    storeUrl(IID) {
      return `http://www.luxlano.com/ddkc/ecqueryItemStock.asp?IID=${IID}`;
    },
    //查看该商品的库存
    seeStore(scope) {
      //生成库存表格，依次是类别、编号、尺寸、库存信息
      this.produceStore[0].body = scope.row.NOTE ? scope.row.NOTE : "暂无数据";
      this.produceStore[1].body = scope.row.ITEM_NO
        ? scope.row.ITEM_NO
        : "暂无数据";
      this.produceStore[2].body = scope.row.FIX_GRADE / 1000;
      this.produceStore[3].body = "查询中...";
      this.dialogTableVisible = true;
      var postData = {
        token: "兰居尚品",
        code: scope.row.ITEM_NO,
      };
      Axios.defaults.withCredentials = false;
      Axios.post(`http://ljsp.ubxiu.com:8098/api/getXXDMX`, postData,
        { params: postData, loading: false }).then(res => {
          if (res.data && res.data.data) {
            var kucun = res.data.data.kucun ? res.data.data.kucun : 0;
            var dinghuoshu = res.data.data.dinghuoshu ? res.data.data.dinghuoshu : 0;
            this.produceStore[3].body = this.dosageFilter(kucun - dinghuoshu);
          } else {
            this.produceStore[3].body = "暂无数据";
          }
        });
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
    this.getStopProductionNews();
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
    this.getStopProductionNews();
  },
};
</script>

<style scoped>
.storeTable {
  border: 1px solid gray;
}
.storeTable tr > :nth-child(1) {
  border-bottom: 1px solid gray;
}
.storeTable tr > :nth-child(2) {
  border-left: 1px solid gray;
  border-bottom: 1px solid gray;
}
a:hover {
  cursor: pointer;
}
.num-font {
  margin: 0 2px;
}
</style>
<style>
.storeTable .el-table__footer-wrapper,
.storeTable .el-table__header-wrapper {
  display: none;
}
.shopTabCon .el-tabs__header {
  margin: 0;
}
.shopTabCon .el-table__expand-icon::after {
  display: block !important;
  position: relative;
  bottom: 1px;
  font-size: 14px;
  content: "选择此款";
  color: red;
  cursor: pointer;
  -webkit-transition: background-color 0.25s ease;
  transition: background-color 0.25s ease;
}
.shopTabCon .el-table__expand-icon > i {
  display: none !important;
}
</style>

