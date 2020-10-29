<template>
  <div id="stockQuery">
    <el-card shadow="hover">
      <div>
        <span>产品类型</span>
        <el-select v-model="productType" placeholder="全部">
          <el-option v-for="item in options" :key="item.value" :label="item.label" :value="item.value">
          </el-option>
        </el-select>
        <span style="margin-left: 10px;">产品型号</span>
        <el-input style="width:200px;" v-model="search" placeholder="请输入内容" @keyup.enter.native="_StockQuery" clearable>
        </el-input>
        <el-button class="NEWUI_BUTTON_1" icon="el-icon-search" @click="_StockQuery">查询</el-button>
        <el-button class="NEWUI_BUTTON_1" icon="el-icon-back" @click="clear">清空</el-button>
      </div>
      <hr />
      <!--  遍历表格 -->
      <div class="allDataDiv">
        <div class="leftCt">
          <el-table ref="dormitoryTable" :data="itemData" stripe height="500" style="width:100%" @row-click="KC_CP_SC"
            border>
            <el-table-column prop="ITEM_NO" label="型号" width="150" align="center"></el-table-column>
            <el-table-column prop="OLD_ITEM_NO" label="版样型号" align="center"></el-table-column>
          </el-table>
        </div>
        <div class="rightCt">
          <el-card shadow="never">
            <div slot="header">
              <span>库存信息：</span>
            </div>
            <div>
              <el-table style="width:100%;" :data="stockData" height="180px">
                <el-table-column prop="NOTE" label="仓库名称" align="center" width="180">
                </el-table-column>
                <el-table-column prop="ITEM_NO" label="型号" align="center" width="100">
                </el-table-column>
                <el-table-column prop="BATCH_NO" label="批号" align="center" width="150">
                </el-table-column>
                <el-table-column prop="PRODUCTVERSION_NAME" label="版本名称" align="center" width="100">
                </el-table-column>
                <el-table-column prop="QTY" label="库存量" align="center" width="80">
                </el-table-column>
                <el-table-column prop="QTY_ALLOCATE" label="已分配量" align="center" width="80">
                  <template slot-scope="scope">
                    <span v-if="scope.row.QTY_ALLOCATE == 0">0</span>
                    <el-link type="primary" v-else size="mini" @click="showAllocate(scope.row)">
                      {{ scope.row.QTY_ALLOCATE }}</el-link>
                  </template>
                </el-table-column>
                <el-table-column prop="QTY_ADJ" label="调整量" align="center" width="80">
                </el-table-column>
                <el-table-column prop="QTY_SUM" label="可分配量" align="center" width="80">
                </el-table-column>
                <el-table-column prop="STATUS_ID" label="库存状态" align="center" width="80">
                  <template slot-scope="scope">
                    {{scope.row.STATUS_ID | transStatusId}}
                  </template>
                </el-table-column>
                <el-table-column prop="NOTES" label="备注" align="center" width="200" show-overflow-tooltip>
                </el-table-column>
              </el-table>
            </div>
          </el-card>

          <el-card style="margin-top:5px;height:250px" shadow="never">
            <div slot="header">
              <span>产品信息：</span>
            </div>
            <div>
              <table v-show="stockInfo" width="100%" border="1" class="table_1">
                <tr>
                  <td class="CPXXBJYS">型号</td>
                  <td style="min-width:110px">{{ dormitory.ITEM_NO }}</td>
                  <td class="CPXXBJYS">墙纸规格</td>
                  <td style="min-width:110px">
                    {{ dormitory.PRODUCT_PAPER_ID | transPaper }}
                  </td>
                  <td class="CPXXBJYS">毛重（kg）</td>
                  <td style="min-width:110px">{{ dormitory.GROSS }}</td>
                </tr>
                <tr>
                  <td class="CPXXBJYS">样版型号</td>
                  <td>{{ dormitory.OLD_ITEM_NO }}</td>
                  <td class="CPXXBJYS">墙纸基材</td>
                  <td>{{ dormitory.PROPERTY_TYPE_NAME }}</td>
                  <td class="CPXXBJYS">净重（kg）</td>
                  <td>{{ dormitory.NET_WEIGHT }}</td>
                </tr>
                <tr>
                  <td class="CPXXBJYS">产品类别</td>
                  <td>
                    {{ dormitory.ITEM_TYPE_1 }}
                  </td>
                  <td class="CPXXBJYS">墙纸功能</td>
                  <td>
                    {{ dormitory.MARK_TYPE | transMark }}
                  </td>
                  <td class="CPXXBJYS">拼花</td>
                  <td>{{ dormitory.DUIPIN_NOTE_1 }}</td>
                </tr>
                <tr>
                  <td class="CPXXBJYS">品牌</td>
                  <td>{{ dormitory.BRAND_NAME }}</td>
                  <td class="CPXXBJYS">长度（mm）</td>
                  <td>{{ dormitory.LENGTH }}</td>
                  <td class="CPXXBJYS">拼花尺寸</td>
                  <td>{{ dormitory.DUIPIN_SIZE }}</td>
                </tr>
                <tr>
                  <td class="CPXXBJYS">最新版本号</td>
                  <td>
                    {{ dormitory.PRODUCTVERSION_NAME }}
                  </td>
                  <td class="CPXXBJYS">宽度（mm）</td>
                  <td>{{ dormitory.WIDTH }}</td>
                  <td class="CPXXBJYS">图案</td>
                  <td>
                    {{ dormitory.PATTERN | transPattern }}
                  </td>
                </tr>
                <tr>
                  <td class="CPXXBJYS">自产代理</td>
                  <td>{{ dormitory.GET_ID | transGetId }}</td>
                  <td class="CPXXBJYS">规格</td>
                  <td>{{ dormitory.GRADE }}</td>
                  <td class="CPXXBJYS">颜色</td>
                  <td>
                    {{ dormitory.COLOUR | transColour }}
                  </td>
                </tr>
                <tr>
                  <td class="CPXXBJYS">计量单位</td>
                  <td>{{ dormitory.UNIT_NOTE_1 }}</td>
                  <td class="CPXXBJYS">纸箱规格</td>
                  <td>{{ dormitory.BOX_TYPE }}</td>
                  <td class="CPXXBJYS">风格</td>
                  <td>{{ dormitory.STYLE | transStyle }}</td>
                </tr>
                <tr>
                  <td class="CPXXBJYS">备注</td>
                  <td colspan="6"></td>
                </tr>
              </table>
            </div>
          </el-card>
        </div>
      </div>
      <!-- 分页 -->
      <div style="margin-top:10px;margin-left:35%">
        <el-pagination :page-count="page_count" @current-change="handleCurrentChange" :current-page.sync="currentPage"
          :page-size="limit" layout="prev, pager, next, jumper" :total="count"></el-pagination>
      </div>
    </el-card>

    <el-dialog width="1200px" :visible.sync="allocateVisible" :title="dialogText">
      <el-table style="width:100%;" :data="allocateData">
        <el-table-column prop="ITEM_NO" label="型号" align="center" width="100">
        </el-table-column>
        <el-table-column prop="BATCH_NO" label="批号" align="center" width="150">
        </el-table-column>
        <el-table-column prop="NOTE" label="库房名称" align="center" width="150">
        </el-table-column>
        <el-table-column prop="PRESTAY_TYPE" label="预留类型" align="center" width="100">
          <template slot-scope="scope">
            {{scope.row.PRESTAY_TYPE | transPrestayType}}
          </template>
        </el-table-column>
        <el-table-column prop="PRESTAY_NUMBER" label="预留数量" align="center" width="100">
        </el-table-column>
        <el-table-column prop="UNIT_NAME" label="单位" align="center" width="70">
        </el-table-column>
        <el-table-column prop="ORDER_ID" label="单据号" align="center" width="100">
        </el-table-column>
        <el-table-column prop="DATE_START" label="预留日期" align="center" width="90">
          <template slot-scope="scope">
            {{scope.row.DATE_START | datatrans}}
          </template>
        </el-table-column>
        <el-table-column prop="DATE_LIMIT" label="预留期限" align="center" width="90">
          <template slot-scope="scope">
            {{scope.row.DATE_LIMIT | datatrans}}
          </template>
        </el-table-column>
        <el-table-column prop="NOTES" label="说明" header-align="center">
        </el-table-column>
      </el-table>
    </el-dialog>
  </div>
</template>

<script>
import {
  GetItemByProductType,
  GetStockByUser,
  GetStockByItemNo,
  GetStockDataByItemNoAndUser,
  GetAllocatByItemAndBatch,
} from "@/api/itemInfoASP";
import Cookies from "js-cookie";
export default {
  name: "StockQuery",
  data() {
    return {
      //产品类型
      options: [
        {
          value: "",
          label: "全部",
        },
        {
          value: "W",
          label: "墙纸",
        },
        {
          value: "G",
          label: "墙纸/布胶",
        },
        {
          value: "P",
          label: "墙纸粉",
        },
        {
          value: "T",
          label: "其他",
        },
        {
          value: "C",
          label: "代理墙布",
        },
        {
          value: "V",
          label: "版本",
        },
        {
          value: "BY",
          label: "布艺",
        },
        {
          value: "H",
          label: "代理墙纸",
        },
        {
          value: "DY",
          label: "打样",
        },
        {
          value: "F",
          label: "宽幅墙布",
        },
        {
          value: "J",
          label: "基膜",
        },
        {
          value: "A",
          label: "宽幅墙纸",
        },
        {
          value: "E",
          label: "无纺墙布",
        },
        {
          value: "AV",
          label: "宽幅无纺墙纸",
        },
        {
          value: "K",
          label: "广告产品",
        },
      ],
      page_count: 1,
      stockData: [], //库存信息
      stockIds: [],
      productType: "", //产品类型查询初始值
      dormitory: [], //查询到的数据
      search: "", //搜索产品型号
      itemData: [], //初始表格为空
      stockInfo: false, //库存信息显示
      limit: 15,
      count: 0,
      currentPage: 1,
      allocateVisible: false,
      dialogText: "预留信息",
      allocateData: [],
    };
  },
  //生命周期
  created() {
    this._GetStockByUser();
  },
  filters: {
    transType(value) {
      switch (value) {
        case "0":
          return "全部";
          break;
        case "W":
          return "墙纸";
          break;
        case "G":
          return "墙纸/布胶";
        case "P":
          return "墙纸粉";
        case "T":
          return "其他";
        case "C":
          return "代理墙布";
        case "V":
          return "版本";
        case "BY":
          return "布艺";
        case "H":
          return "代理墙纸";
        case "DY":
          return "打样";
        case "F":
          return "宽幅墙布";
        case "J":
          return "基膜";
        case "A":
          return "宽幅墙纸";
        case "E":
          return "无纺墙布";
        case "AV":
          return "宽幅无纺墙纸";
        case "K":
          return "广告商品";
          break;
      }
    },
    transPattern(value) {
      switch (value) {
        case "01":
          return "大马士革";
        case "02":
          return "花草";
        case "03":
          return "条纹几何";
        case "04":
          return "抽象";
        case "05":
          return "迪士尼";
        case "06":
          return "另类";
        case "07":
          return "欧式卷草纹";
          break;
      }
    },
    transColour(value) {
      switch (value) {
        case "01":
          return "灰白";
        case "02":
          return "青色";
        case "03":
          return "棕色";
        case "04":
          return "金色";
        case "05":
          return "银色";
        case "06":
          return "红色";
        case "07":
          return "粉色";
        case "08":
          return "黄色";
        case "09":
          return "绿色";
        case "10":
          return "蓝色";
        case "11":
          return "紫色";
        case "12":
          return "橙色";
          break;
      }
    },
    transStyle(value) {
      switch (value) {
        case "01":
          return "欧式风格";
        case "02":
          return "田园风格";
        case "03":
          return "迪士尼";
        case "04":
          return "现代简约";
        case "05":
          return "另类风格";
        case "06":
          return "新东方风格";
        case "07":
          return "新古典风格";
        case "08":
          return "青少年风格";
        case "09":
          return "美式风格";
          break;
      }
    },
    transPaper(value) {
      switch (value) {
        case "F":
          return "280CM";
        case "E":
          return "130CM";
        case "J":
          return "70CM";
        case "B":
          return "花边";
        case "P":
          return "墙身";
        case "D":
          return "138CM";
        case "F":
          return "106CM";
        case "C":
          return "93CM";
          break;
      }
    },
    transMark(value) {
      switch (value) {
        case "M":
          return "防霉";
        case "S":
          return "除甲醛";
        case "Z":
          return "阻燃+防霉";
        case "W":
          return "双重防霉+除甲醛";
        case "Y":
          return "吸放湿+防霉";
        case "T":
          return "除臭+防霉";
        case "Q":
          return "负离子+防霉";
        case "R":
          return "阻燃";
        case "K":
          return "抗菌";
        case "N":
          return "普通";
          break;
      }
    },
    transGetId(value) {
      switch (value) {
        case "A":
          return "自产产品";
        case "B":
          return "采购产品";
        case "C":
          return "代购产品";
        case "D":
          return "代理产品";
        case "E":
          return "委外加工产品";
        case "F":
          return "委外生产产品";
          break;
      }
    },
    transStatusId(value) {
      switch (value) {
        case "Y":
          return "可用";
        case "F":
          return "封存";
        case "S":
          return "试验";
        case "T":
          return "淘汰";
          break;
      }
    },
    transPrestayType(value) {
      switch (value) {
        case "C":
          return "订货";
        case "P":
          return "提货";
        case "CJLL":
          return "车间领料";
        case "DYLL":
          return "打样领料";
        case "Z":
          return "转库";
        case "D":
          return "调拔";
        case "XQJH":
          return "改包装计划";
        case "GBZLL":
          return "改包装领料";
        case "JYZK":
          return "检验转库";
        case "SH":
          return "损耗预留";
        case "W":
          return "委外预留";
          break;
      }
    },
    datatrans(value) {
      //时间戳转化大法
      if (value == null || value == "9999/12/31 00:00:00") {
        return "";
      }
      let date = new Date(value);
      let y = date.getFullYear();
      let MM = date.getMonth() + 1;
      MM = MM < 10 ? "0" + MM : MM;
      let d = date.getDate();
      d = d < 10 ? "0" + d : d;
      let h = date.getHours();
      h = h < 10 ? "0" + h : h;
      let m = date.getMinutes();
      m = m < 10 ? "0" + m : m;
      let s = date.getSeconds();
      s = s < 10 ? "0" + s : s;
      return y + "-" + MM + "-" + d + " " + h + ":" + m + ":" + s;
    },
  },
  methods: {
    //用户权限
    _GetStockByUser() {
      this.stockIds = [];
      var userInfo = JSON.parse(Cookies.get("userInfo"));
      var data = {
        userid: userInfo.userId,
      };
      GetStockByUser(data).then((res) => {
        if (res.data.length != 0) {
          for (var i = 0; i < res.data.length; i++) {
            this.stockIds.push(res.data[i].STOCK_NO);
          }
        } else {
          this.$alert("没有仓库权限，请联系管理员配置", "提示", {
            confirmButtonText: "确定",
            type: "success",
          });
        }
      });
    },
    //查询
    _StockQuery() {
      this.currentPage = 1;
      this.searchStock();
    },
    searchStock() {
      this.itemData = [];
      this.dormitory = [];
      this.stockInfo = false; //库存信息显示
      var data = {
        productType: this.productType, //产品类型
        //itemNo:this.search.toUpperCase(),//产品型号
        limit: this.limit, //限制数
        page: this.currentPage, //页数
        stockIds: this.stockIds, //仓库号
        find: this.search,
      };
      GetItemByProductType(data)
        .then((res) => {
          this.count = res.count;
          if (this.count == 1) {
            this.KC_CP_SC(res.data[0]);
          }
          this.itemData = res.data;
        })
        .catch((res) => {
          console.log(res);
        });
    },
    //清空
    clear() {
      this.value = "";
      this.search = "";
      this.itemData = [];
      this.dormitory = [];
      this.stockData = [];
      this.stockInfo = false; //库存信息显示
      this.count = 0;
      this.currentPage = 1;
    },
    //点击行的事件
    KC_CP_SC(val) {
      this.dormitory = val; //数据集合
      this.stockInfo = true; //库存信息显示
      this.stockData = [];
      var userInfo = JSON.parse(Cookies.get("userInfo"));
      var data_1 = {
        itemNo: val.ITEM_NO,
        userId: userInfo.userId,
      };
      //按行查询库存
      GetStockDataByItemNoAndUser(data_1, { loading: false })
        .then((res) => {
          this.stockData = res.data;
        })
        .catch((res) => {
          console.log(res);
        });
    },
    //翻页获取订单
    handleCurrentChange() {
      this.searchStock();
    },
    showAllocate(item) {
      this.allocateData = [];
      GetAllocatByItemAndBatch({
        itemNo: item.ITEM_NO,
        batchNo: item.BATCH_NO,
      })
        .then((res) => {
          this.allocateData = res.data;
          this.dialogText =
            item.ITEM_NO + "-(" + item.BATCH_NO + ")" + "预留信息";
          this.allocateVisible = true;
        })
        .catch((res) => {
          console.log(res);
        });
    },
  },
};
</script>

<style scoped>
.table_1 {
  border-collapse: collapse;
  border: 1px solid black;
  font-weight: normal;
  font-size: 15px;
}
.table_1 td {
  text-align: center;
}
.CPXXBJYS {
  background: #d5ecb8;
  width: 90px;
}
.NEWUI_BUTTON_1 {
  width: 90px;
  background: #8bc34a;
  margin-left: 10px;
  color: rgb(255, 255, 255);
}
.allDataDiv {
  width: 100%;
  height: 500px;
}
.leftCt {
  display: inline-block;
  width: 20%;
  min-width: 300px;
  height: 100%;
}
.rightCt {
  display: inline-block;
  width: calc(100% - 310px);
  height: 100%;
}
</style>