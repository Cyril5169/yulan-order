<template>
  <div class="curtainTable">
    <el-card shadow="hover">
      <div class="mb10">
        <p class="fstrong f16">商品信息：</p>
        <span>活动：<el-select style="width:250px" :disabled="activityOptions.length == 1" v-model="message.activityId"
            :placeholder="
                  activityOptions.length == 1
                    ? '无可选活动'
                    : '请选择活动'
                ">
            <el-option v-for="item in activityOptions" :key="item.P_ID"
              :label="item.ORDER_TYPE? item.ORDER_TYPE + ' -- ' + item.ORDER_NAME : item.ORDER_NAME" :value="item.P_ID">
            </el-option>
          </el-select></span>
      </div>
      <el-table style="width:100%;font-size:14px;" border :data="curtainData" :span-method="cellMerge">
        <el-table-column width="140" header-align="center" label="商品信息">
          <template>
            <div class="messageBox">
              <div>
                <label>款号:</label>
                <div class="messageInput">{{ message.itemNo }}</div>
              </div>
              <div>
                <label>成品宽:</label>
                <div class="messageInput">{{ message.width }}</div>
                m
              </div>
              <div>
                <label>成品高:</label>
                <div class="messageInput">{{ message.height }}</div>
                m
              </div>
              <div>
                <label>假帘高:</label>
                <div class="messageInput">{{ message.highJia }}</div>
                m
              </div>
              <div>
                <label>褶皱倍数:</label>
                <div class="messageInput">{{ message.multiple }}</div>
              </div>
              <div>
                <label>帘头外包盒单边宽度:</label>
                <div class="messageInput">
                  {{ message.WBH === "" ? "无" : message.WBH }}
                </div>
                m
              </div>
              <div>
                <label>位置:</label>
                <div class="messageInput" style="width: 100px;">
                  {{ message.location === "" ? "无" : message.location }}
                </div>
              </div>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="名称" header-align="center" width="85">
          <template slot-scope="scope">
            {{ getTypeName(scope.row.itemType) }}
            <el-checkbox @change="changeLink('ls', 1)" v-if="scope.row.itemType === 'ls'" v-model="chooseBig[1]">
              <span v-if="chooseBig[1] == false" style="color: red;">×</span>
            </el-checkbox>
            <el-checkbox @change="changeLink('lspb', 2)" v-if="scope.row.itemType === 'lspb'" v-model="chooseBig[2]">
              <span v-if="chooseBig[2] == false" style="color: red;">×</span>
            </el-checkbox>
            <el-checkbox @change="changeLink('sha', 3)" v-if="scope.row.itemType === 'sha'" v-model="chooseBig[3]">
              <span v-if="chooseBig[3] == false" style="color: red;">×</span>
            </el-checkbox>
          </template>
        </el-table-column>
        <el-table-column label="编码" header-align="center" width="125">
          <template slot-scope="scope">
            <div>
              <span v-if="
                  scope.row.itemType === 'pjb' && scope.row.changeFlag === 'Y'
                ">
                <el-select size="mini" v-model="scope.row.itemNo" placeholder="请选择"
                  @change="changePJBUnit(scope.$index)">
                  <el-option v-for="item in part2" :key="item.value" :label="item.label" :value="item.value">
                  </el-option>
                </el-select>
              </span>
              <span v-else-if="scope.row.changeFlag === 'Y'">
                <a class="uline" @click="getNewItemNo(scope.row, scope.$index)">
                  {{ scope.row.itemNo }}
                </a>
                <el-checkbox v-if="scope.row.deleteFlag === 'Y'" v-model="scope.row.choose"
                  @change="changeLinkReverse(scope.row)">
                </el-checkbox>
              </span>
              <span v-else>
                {{ scope.row.itemNo }}
                <el-checkbox v-if="scope.row.deleteFlag === 'Y'" v-model="scope.row.choose"
                  @change="changeLinkReverse(scope.row)">
                </el-checkbox>
              </span>
              <span v-if="bigToSmall(scope.row) == true" style="color: red;">
                ×
              </span>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="名称" header-align="center" width="110">
          <template slot-scope="scope">
            <div v-if="scope.row.note !== null">{{ scope.row.note }}</div>
            <div v-else>{{ getTypeName(scope.row.itemType) }}</div>
          </template>
        </el-table-column>
        <el-table-column v-if="isManager != '0'" label="单价" align="center" width="50">
          <template slot-scope="scope">
            <span>
              {{ scope.row.price }}
            </span>
          </template>
        </el-table-column>
        <el-table-column v-if="isManager != '0' && salPromotion.P_ID" label="折后" align="center" width="55">
          <template slot-scope="scope">
            <span>
              {{ calculatePromotionPrice(scope.row) }}
            </span>
          </template>
        </el-table-column>
        <el-table-column label="规格:米/对" header-align="center" align="center" width="50">
          <template slot-scope="scope">
            {{
              scope.row.fixGrade === 0 || scope.row.fixGrade === null
                ? "--"
                : scope.row.fixGrade / 1000
            }}
          </template>
        </el-table-column>
        <el-table-column label="面料属性" width="80" header-align="center" align="center">
          <template slot-scope="scope">
            <div v-if="
                scope.row.fixType !== '' &&
                  scope.row.fixType !== null &&
                  scope.row.productType === 'ML'
              ">
              <el-select size="mini" v-model="scope.row.fixType" placeholder="请选择"
                @change="changeDosageByFixtype(scope.$index)">
                <el-option v-for="item in fixType" :key="item.value" :label="item.label" :value="item.value">
                </el-option>
              </el-select>
            </div>
            <div v-else></div>
          </template>
        </el-table-column>
        <el-table-column label="用量" header-align="center" align="center" width="80">
          <template slot-scope="scope">
            <span v-if="scope.row.itemType === 'lspb'">--</span>
            <span v-else-if="scope.row.modifyFlag === 'Y'">
              <el-input v-if="scope.row.itemType != 'lt'" style="width: 70%;" size="mini" oninput="value=value.replace(/[^\d.]/g,'')
                                .replace(/^\./g, '').replace(/\.{2,}/g, '.')
                                .replace('.', '$#$').replace(/\./g, '')
                                .replace('$#$', '.')
                                .slice(0,value.indexOf('.') === -1? value.length: value.indexOf('.') + 2)"
                v-model="scope.row.dosage">
              </el-input>
              <el-input v-else style="width: 70%;" size="mini" oninput="value=value.replace(/[^\d.]/g,'')
                                .replace(/^\./g, '').replace(/\.{2,}/g, '.')
                                .replace('.', '$#$').replace(/\./g, '')
                                .replace('$#$', '.')
                                .slice(0,value.indexOf('.') === -1? value.length: value.indexOf('.') + 3)"
                v-model="scope.row.dosage">
              </el-input>
              {{ scope.row.dosage === "" ? "" : scope.row.unit }}
            </span>
            <span v-else>
              {{ scope.row.dosage | dosageFilter }}
              {{ scope.row.dosage === "" ? "" : scope.row.unit }}
            </span>
          </template>
        </el-table-column>
        <el-table-column v-if="isManager != '0'" label="总价" align="center" width="60">
          <template slot-scope="scope">
            <span>
              {{ oneTotal(scope.row) }}
            </span>
          </template>
        </el-table-column>
        <el-table-column label="制造说明" header-align="center" align="center" width="110">
          <template slot-scope="scope">
            <div v-if="scope.row.productType === 'XHB'"></div>
            <div v-else-if="scope.row.itemType === 'lt'">
              <el-select size="mini" v-model="scope.row.creator" placeholder="--未选--">
                <el-option v-for="item in part0" :key="item.value" :label="item.value" :value="item.value">
                </el-option>
              </el-select>
            </div>
            <div v-else-if="scope.row.itemType === 'lspb'">
              <el-select size="mini" v-model="scope.row.creator" placeholder="--未选--">
                <el-option v-for="item in part3" :key="item.value" :label="item.value" :value="item.value">
                </el-option>
              </el-select>
            </div>
            <div v-else-if="scope.row.productType === 'ML'">
              <el-select size="mini" v-model="scope.row.creator" placeholder="--未选--">
                <el-option v-for="item in part1" :key="item.value" :label="item.value" :value="item.value">
                </el-option>
              </el-select>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="说明" header-align="center" width="100">
          <template slot-scope="scope">
            <span style="color:red;">
              {{ scope.row.tip }}
            </span>
          </template>
        </el-table-column>
        <el-table-column label="备注" header-align="center">
          <template slot-scope="scope">
            <el-input type="textarea" :autosize="{ maxRows: 6 }" v-model="scope.row.remark" clearable>
            </el-input>
            {{ getRemark(scope.row) }}
          </template>
        </el-table-column>
      </el-table>
      <div v-if="isManager != '0'" style="font-size:16px;margin-top:10px;">总计：<span
          style="color:red;">￥{{allTotal | dosageFilter}}</span></div>

      <!--  -->
      <el-dialog width="65%" :visible.sync="dialogTableVisible" :close-on-click-modal="false"
        :close-on-press-escape="false" :show-close="false">
        <div slot="title">
          <b>{{ dialogTitle }}</b>
        </div>
        <div v-if="items.length !== 0">
          <el-input clearable size="small" class="ml10 mb10" v-if="curtainData[chooseIndex].productType !== 'GY'"
            placeholder="输入商品型号查找" style="width:25%; min-width:220px;" v-model.trim="searchKey"
            @clear="getAllItemNoData(1)" @keyup.enter.native="getSingleItemNoData(1)">
            <div id="searchBtn" slot="append" style="cursor:pointer;" @click="getSingleItemNoData(1)">
              搜索
            </div>
          </el-input>
          <br />
          <el-radio border size="small" class="mt10 ml10" v-for="item in items" :value="item.itemNo" :key="item.itemNo"
            v-model="itemNo" :label="item.itemNo">
            <span v-if="chooseType === 'LCB' || chooseType === 'GY'">
              {{ item.itemNo + " " + item.note }}
            </span>
            <span v-else>{{ item.itemNo }}</span>
          </el-radio>
          <el-pagination v-if="curtainData[chooseIndex].productType !== 'GY'" class="tc mt10"
            @size-change="handleSizeChange" @current-change="handleCurrentChange" :current-page.sync="currentPage"
            :page-size="pageSize" layout="prev, pager, next, jumper" :total="totalNumber">
          </el-pagination>
        </div>
        <div v-else style="height: 200px;">
          暂无数据
        </div>
        <footer class="mt20" style="text-align: center;">
          <el-button class="mr10" type="success" @click="chooseItemNo" plain>确定</el-button>
          <el-button class="ml10" type="danger" @click="dialogTableVisible = false" plain>取消</el-button>
        </footer>
      </el-dialog>
      <div style="text-align: center;" class="mt20">
        <el-button type="danger" class="mr20" width="130px" @click="addCurtainToShoppingCar">
          保存至购物车
        </el-button>
        <router-link to="/shops/curtain">
          <el-button type="info" class="ml20" width="130px" @click.native="
              closeToTab({
                oldUrl: 'shops/shoppingCurtainDetail',
                newUrl: 'shops/curtain'
              })
            ">
            返回
          </el-button>
        </router-link>
      </div>
    </el-card>
  </div>
</template>

<script>
import {
  getCurtainDetailMsg,
  getGY,
  changeDosageByNo,
  addCurtainToCar,
  changeItem,
  changeItemBlur,
} from "@/api/curtain";
import { GetDosageAll, GetDosageByNo } from "@/api/itemInfoASP";
import { getItemById, GetPromotionByItem } from "@/api/orderListASP";
import Cookies from "js-cookie";
import { mapMutations, mapActions } from "vuex";
import { mapState } from "vuex";

export default {
  name: "shoppingCurtainDetail",
  data() {
    return {
      cid: Cookies.get("cid"), //假定给的用户id
      customerType: Cookies.get("customerType"), //客户类型
      isManager: Cookies.get("isManager"), //是否为管理员
      //获取真实数据
      message: {},
      activityOptions: [],
      chooseBig: [true, true, true, true, true], //是否选择了大类
      spanArr0: [], //商品信息跨行的数据
      spanArr1: [], //名称跨行的数据
      spanArr2: [], //编码名称跨列，配件包专有
      pos: 0, //和spanArr对应的下标
      chooseIndex: -1, //默认选中的数据下标
      dialogTableVisible: false, //是否出现弹出层
      dialogTitle: "", //弹出层标题
      searchKey: "", //搜索的关键词
      items: [], //可供选择的全部编码
      currentPage: 1, //当前的页数
      pageSize: 30, //每页的个数
      totalNumber: 0, //全部编码的数量
      chooseType: "", //选中的产品类型
      itemNo: "", //选中的编码
      //接口获取到的全部数据
      allData: {},
      //窗帘数据
      curtainData: [],
      //窗帘大类状态
      curtainType: [],
      //风格切换：01--定宽，02--定高
      fixType: [
        {
          value: "01",
          label: "定宽",
        },
        {
          value: "02",
          label: "定高",
        },
      ],
      //根据编号查询制造说明
      part: [],
      //帘头制造说明
      part0: [
        { value: "么术贴正车" },
        { value: "么术贴反车" },
        { value: "穿/挂杆款" },
        { value: "特殊见备注" },
      ],
      //帘身、纱制造说明
      part1: [
        { value: "对开" },
        { value: "左单开" },
        { value: "右单开" },
        { value: "特殊开备注" },
      ],
      //帘身配布制造说明
      part3: [
        { value: "一个褶" },
        { value: "一个半褶" },
        { value: "二个褶" },
        { value: "二个半褶" },
        { value: "三个褶" },
        { value: "三个半褶" },
      ],
      //配件编码
      part2: [],
    };
  },
  created() {
    if (
      Cookies.get("curtainMsg") !== undefined &&
      Cookies.get("curtainMsg") !== null
    ) {
      this.message = JSON.parse(Cookies.get("curtainMsg"));
      this.getActivity();
      this.getPJB();
      this.getDetail();
    }
  },
  methods: {
    ...mapActions("navTabs", ["closeToTab"]),
    //修改配件包时，对应修改单位
    changePJBUnit(index) {
      let _data = this.curtainData[index].itemNo;
      this.part2.forEach((item) => {
        if (item.value === _data) {
          this.curtainData[index].unit = item.unit;
          this.curtainData[index].note = item.note;
          var price = this.getPrice(this.customerType, item.item);
          this.curtainData[index].price = price;
          this.judgeTip(this.curtainData[index], index);
          return;
        }
      });
    },
    //大类和二类的联动
    changeLink(type, index) {
      for (let i = 0; i < this.curtainData.length; i++) {
        if (this.curtainData[i].itemType === type) {
          this.curtainData[i].choose = this.chooseBig[index];
        }
      }
      if (type == "ls") {
        this.chooseBig[2] = this.chooseBig[index];
        this.changeLink("lspb", 2);
      }
      this.changeLinkTip(type, index);
    },
    //大类和二类的反向联动
    changeLinkReverse(data) {
      let _index;
      let _arr = this.getBigType(data.itemType);
      let flag = true;
      switch (data.itemType) {
        case "lt":
          _index = 0;
          break;
        case "ls":
          _index = 1;
          break;
        case "lspb":
          _index = 2;
          break;
        case "sha":
          _index = 3;
          break;
        case "pjb":
          _index = 4;
          break;
        default:
          _index = -1;
      }
      /**
       * 8.22新需求
       * 帘头改为配件包的勾选方式
       * 即取消双向绑定，帘头固定
       */
      if (_index >= 1 && _index <= 4) {
        _arr.forEach((item) => {
          if (item.deleteFlag !== "Y" || item.choose === true) {
            flag = false;
          }
        });
        if (data.choose || flag) {
          this.chooseBig[_index] = data.choose;
          this.changeLinkTip(data.itemType, _index);
        }
      }
    },
    changeLinkTip(type, index) {
      if (type == "lspb") {
        //取消帘身配布如果帘身没有取消，需要在帘身工艺中备注
        //如果帘身也取消了，就改回来
        //找到工艺数据
        var gyData = this.curtainData.filter(
          (item) => item.itemType == "ls" && item.productType == "GY"
        );
        if (gyData.length) {
          gyData = gyData[0];
          if (this.chooseBig[1] && !this.chooseBig[2]) {
            gyData.remark = "已取消购买帘身配布;" + gyData.remark;
          } else {
            gyData.remark = gyData.remark.replace("已取消购买帘身配布;", "");
          }
        }
      }
    },
    //获取某个大类的全部数据
    getBigType(type) {
      let arr = [];
      this.curtainData.forEach((item) => {
        if (item.itemType === type) {
          arr.push(item);
        }
      });
      return arr;
    },
    getActivity() {
      this.activityOptions = [];
      getItemById({ itemNo: this.message.itemNo }, { loading: false }).then(
        (itemRes) => {
          GetPromotionByItem(
            {
              cid: this.cid,
              customerType: this.customerType,
              itemNo: itemRes.data.ITEM_NO,
              itemVersion: itemRes.data.ITEM_VERSION,
              productType: itemRes.data.PRODUCT_TYPE,
              productBrand: itemRes.data.PRODUCT_BRAND,
            },
            { loading: false }
          ).then((res) => {
            this.activityOptions = res.data;
            this.activityOptions.push({
              ORDER_TYPE: "",
              ORDER_NAME: "不参与活动",
              P_ID: null,
            });
          });
        }
      );
    },
    //获取窗帘配件包数据
    getPJB() {
      this.part2 = [];
      let obj = {
        limit: 999,
        page: 1,
        itemNO: "PJB",
      };
      changeItem(obj)
        .then((res) => {
          let _arr = [];
          res.data.forEach((item) => {
            _arr.push({
              label: `${item.itemNo}:${item.note}`,
              value: item.itemNo,
              unit: item.unit === "°ü" ? "包" : item.unit,
              note: item.note,
              item: item,
            });
          });
          _arr.sort(function (a, b) {
            return a.value > b.value ? 1 : -1; //升序
          });
          _arr.push({
            label: "-未选择配件包-",
            value: null,
            unit: "",
            note: "",
          });
          this.part2 = _arr;
        })
        .catch((err) => {
          this.part2 = [];
        });
    },
    //通过窗帘头信息获取接口信息
    getDetail() {
      let data = {
        itemNO: this.message.itemNo,
        width: this.message.width, //成品宽度
        height: this.message.height, //成品高度
        WBH:
          this.message.isWBH === false || this.message.WBH === ""
            ? "0"
            : this.message.WBH, //帘头外包盒宽度
        multiple: this.message.multiple, //褶皱倍数
        location: this.message.location,
      };
      getCurtainDetailMsg(data)
        .then((res) => {
          GetDosageAll(data).then((res2) => {
            this.allData = res;
            this.replaceDosage(res2.data);
            this.getCurtainMsg(res);
            this.getSpanArr(res);
          });
        })
        .catch((err) => {
          console.log(err);
        });
    },
    replaceDosage(dosageFilter) {
      var gy003 = dosageFilter.filter((item) => item.ITEM_NO == "GY-003");
      if (gy003.length > 0) this.allData.GY = gy003[0].dosage;
      if (this.allData.lt) {
        this.allData.lt = dosageFilter.find((item) => item.type == "lt").dosage;
      }
      if (this.allData.ls) {
        this.allData.ls = dosageFilter.find((item) => item.type == "ls").dosage;
      }
      if (this.allData.XHBlt) {
        this.allData.XHBlt = dosageFilter.find(
          (item) => item.type == "XHBlt"
        ).dosage;
      }
      if (this.allData.XHBls) {
        this.allData.XHBls = dosageFilter.find(
          (item) => item.type == "XHBls"
        ).dosage;
      }
      if (this.allData.LCB) {
        this.allData.LCB = dosageFilter.find(
          (item) => item.type == "LCB"
        ).dosage;
      }
      if (this.allData.sha) {
        this.allData.sha = dosageFilter.find(
          (item) => item.type == "sha"
        ).dosage;
      }
    },
    //通过接口数据生成窗帘表格信息
    getCurtainMsg(data) {
      this.curtainData = [];
      if (this.allData.itemList.length)
        this.message.highJia = this.allData.itemList[0].highJia;
      for (let i = 0; i < data.itemList.length; i++) {
        if (data.itemList[i].unit === "°ü") data.itemList[i].unit = "包";
        if (data.itemList[i].itemMLGY.itemType === "lspb") {
          data.itemList[i].fixType = "";
        }
        var price = this.getPrice(this.customerType, data.itemList[i]);
        let obj = {
          itemNo: data.itemList[i].itemNo, //编号
          itemType: data.itemList[i].itemMLGY.itemType, //型号
          productType: data.itemList[i].itemMLGY.productType, //产品号
          note: data.itemList[i].note, //名称
          fixGrade: data.itemList[i].fixGrade, //规格
          fixType: data.itemList[i].fixType, //风格
          dosage: "", //用量
          creator: "", //制造说明
          tip: "", //说明
          remark: "", //备注
          price: price,
          unit: data.itemList[i].unit, //单位
          modifyFlag: data.itemList[i].itemMLGY.modifyFlag, //用量是否可以修改，Y可修改，N不可修改
          deleteFlag: data.itemList[i].itemMLGY.deleteFlag, //物料是否可删除，Y可删除，N不可删除
          changeFlag: data.itemList[i].itemMLGY.changeFlag, //物料是可以替换，Y可替换，N不可替换
          choose: true, //是否选中，默认选中了
          inlineNo: data.itemList[i].itemMLGY.no, //编号
        };
        this.curtainData.push(obj);
        this.getDosage(obj, i);
      }
    },
    getPrice(type, item) {
      var price = 0;
      if (item) {
        if (type == "02" || type == "08" || type == "10") {
          //经销
          price = item.priceSale;
        } else if (type == "05") {
          price = item.salePrice;
        } else if (type == "06") {
          price = item.priceFx;
        } else if (type == "09") {
          price = item.priceHome;
        }
      }
      return price;
    },
    //点击更换编码名称
    getNewItemNo(data, index) {
      this.itemNo = "";
      this.searchKey = "";
      this.items = [];
      this.dialogTableVisible = true;
      this.dialogTitle = `【${this.getProductName(
        data.productType
      )}】类产品列表`;
      this.chooseIndex = index;
      this.chooseType = data.productType;
      if (data.productType !== "GY") {
        this.getAllItemNoData(1);
      } else {
        this.getTheGY(this.message.itemNo);
      }
    },
    //获取每页的条数
    handleSizeChange(val) {
      //console.log(`每页 ${val} 条`);
    },
    //当前页改变时的操作
    handleCurrentChange(val) {
      if (this.searchKey === "") {
        this.getAllItemNoData(0);
      } else {
        this.getSingleItemNoData(0);
      }
    },
    //获取可修改的全部编码
    getAllItemNoData(status) {
      if (this.searchKey !== "") return;
      //0为默认搜索，1为搜索时首页
      if (status === 1) this.currentPage = 1;
      let obj = {
        itemNO: this.chooseType,
        limit: this.pageSize,
        page: this.currentPage,
      };
      changeItem(obj)
        .then((res) => {
          this.items = res.data;
          this.totalNumber = res.data[0].total;
        })
        .catch((err) => {
          this.items = [];
          this.currentPage = 1;
          this.totalNumber = 0;
        });
    },
    //获取模糊搜索的编码
    getSingleItemNoData(status) {
      //0为默认模糊搜索，1为模糊搜索时首页
      if (this.searchKey === "") return;
      if (status === 1) this.currentPage = 1;
      let obj = {
        itemType: this.chooseType,
        itemNO: this.searchKey.toUpperCase(),
        limit: this.pageSize,
        page: this.currentPage,
      };
      changeItemBlur(obj)
        .then((res) => {
          this.items = res.data;
          this.totalNumber = res.data[0].total;
        })
        .catch((err) => {
          this.items = [];
          this.currentPage = 1;
          this.totalNumber = 0;
        });
    },
    //修改编码--影响用量
    chooseItemNo() {
      if (!this.itemNo) {
        this.$alert("请选择一个产品", "提示", {
          confirmButtonText: "确定",
          type: "warning",
        });
        return;
      }
      if (this.chooseIndex < 0) {
        this.dialogTableVisible = false;
        return;
      }
      let _productType = this.curtainData[this.chooseIndex].productType;
      let status = _productType === "ML" ? true : false;
      let status1 = _productType === "GY" ? true : false;
      this.dialogTableVisible = false;
      //修改对应的名称规格
      let data = this.items.find((v) => {
        if (v.itemNo === this.itemNo) return v;
      });
      var price = this.getPrice(this.customerType, data);
      let status2 =
        data.fixType === null ||
        this.curtainData[this.chooseIndex].itemType === "lspb";
      this.curtainData[this.chooseIndex].note = data.note;
      this.curtainData[this.chooseIndex].fixGrade = data.fixGrade;
      this.curtainData[this.chooseIndex].fixType = status2 ? "" : data.fixType;
      this.curtainData[this.chooseIndex].price = price;
      this.allData.itemList[this.chooseIndex].fixType = status2
        ? ""
        : data.fixType;
      //非工艺修改用量
      if (!status1) {
        if (this.curtainData[this.chooseIndex].itemType === "lspb") {
          this.curtainData[this.chooseIndex].itemNo = this.itemNo;
          this.judgeTip(this.curtainData[this.chooseIndex], this.chooseIndex);
          return;
        }
        //修改用量
        let obj = {
          width: this.message.width,
          height: this.message.height,
          WBH: this.message.WBH !== "" ? this.message.WBH : "0",
          multiple: this.message.multiple,
          parentItemNo: this.message.itemNo,
          itemNO: this.itemNo,
          itemType: this.curtainData[this.chooseIndex].itemType,
          fixType: this.curtainData[this.chooseIndex].fixType,
        };
        //changeDosageByNo(obj)
        GetDosageByNo(obj)
          .then((res) => {
            if (res.data.length == 0) {
              this.$alert("用量获取失败", "提示", {
                confirmButtonText: "好的",
                type: "warning",
              });
              return;
            }
            let _data = this.curtainData[this.chooseIndex];
            let keys;
            if (_data.itemType == "lt")
              keys = Math.round(res.data[0].dosage * 100) / 100;
            else keys = Math.round(res.data[0].dosage * 10) / 10;
            //绣花边只需要修改自身，无需修改面料
            if (_data.productType === "XHB") {
              this.curtainData[this.chooseIndex].dosage = keys;
            }
            //面料除了修改自身，还需修改所有其他的，除了LCB、XHB之外的所有，工艺继续做进一步判断
            else if (_data.productType === "ML") {
              this.updateDosage(_data.itemType, keys);
            }
            this.curtainData[this.chooseIndex].itemNo = this.itemNo;
            this.judgeTip(_data, this.chooseIndex);
          })
          .catch((err) => {
            console.log(err);
          });
      }
      //工艺用量修改
      else if (status1) {
        this.curtainData[this.chooseIndex].itemNo = this.itemNo;
        this.judgeTip(this.curtainData[this.chooseIndex], this.chooseIndex);
        if (this.curtainData[this.chooseIndex].itemNo === "GY-003") {
          this.curtainData[this.chooseIndex].dosage = this.allData.GY;
        } else {
          for (let i = 0; i < this.curtainData.length; i++) {
            if (
              this.curtainData[i].itemType ===
                this.curtainData[this.chooseIndex].itemType &&
              i !== this.chooseIndex
            ) {
              if (this.curtainData[i].productType === "ML") {
                this.curtainData[this.chooseIndex].dosage = this.curtainData[
                  i
                ].dosage;
                break;
              }
            }
          }
        }
      }
    },
    //修改风格
    changeDosageByFixtype(index) {
      let obj = {
        width: this.message.width,
        height: this.message.height,
        WBH: this.message.WBH !== "" ? this.message.WBH : "0",
        multiple: this.message.multiple,
        parentItemNo: this.message.itemNo,
        itemNO: this.curtainData[index].itemNo,
        itemType: this.curtainData[index].itemType,
        fixType: this.curtainData[index].fixType,
      };
      //changeDosageByNo(obj)
      GetDosageByNo(obj)
        .then((res) => {
          if (res.data.length == 0) {
            this.$alert("用量获取失败", "提示", {
              confirmButtonText: "好的",
              type: "warning",
            });
            return;
          }
          let _data = this.curtainData[index];
          let keys;
          if (_data.itemType == "lt")
            keys = Math.round(res.data[0].dosage * 100) / 100;
          else keys = Math.round(res.data[0].dosage * 10) / 10;
          //绣花边只需要修改自身，无需修改面料
          if (_data.productType === "XHB") {
            this.curtainData[index].dosage = keys;
          }
          //面料除了修改自身，还需修改所有其他的，除了LCB、XHB之外的所有，工艺继续做进一步判断
          else if (_data.productType === "ML") {
            this.updateDosage(_data.itemType, keys);
          }
          this.judgeTip(this.curtainData[index], index);
        })
        .catch((err) => {
          console.log(err);
        });
    },
    //获取产品类别名称
    getProductName(val) {
      switch (val) {
        case "PJB":
          return "配件包/挂袋";
        case "XHB":
          return "绣花边";
        case "ZX":
          return "增项服务";
        case "MLP":
          return "面料(配布)";
        case "CPL":
          return "成品帘";
        case "SSDX":
          return "缩水定型";
        case "LCB":
          return "里衬布";
        case "KS":
          return "帘头";
        case "ML":
          return "面料(主布)";
        case "GY":
          return "工艺";
        case "WBH":
          return "外包盒";
        default:
          return "其它";
      }
    },
    //获取窗帘大类名称
    getTypeName(val) {
      switch (val) {
        case "lt":
          return "帘头";
        case "ls":
          return "帘身";
        case "lspb":
          return "帘身配布";
        case "sha":
          return "纱";
        case "pjb":
          return "配件";
        default:
          return "暂无名称";
      }
    },
    //获取窗帘大类用量
    getDosage(data, index) {
      let val = data.itemType;
      let pval = data.productType;
      let _val;
      if (pval === "GY" && data.itemNo === "GY-003") {
        _val = this.allData.GY;
      } else {
        switch (val) {
          case "lt":
            if (pval === "XHB") _val = this.allData.XHBlt;
            else _val = this.allData.lt;
            break;
          case "ls":
            if (pval === "LCB") _val = this.allData.LCB;
            else if (pval === "XHB") _val = this.allData.XHBls;
            else _val = this.allData.ls;
            break;
          case "sha":
            _val = this.allData.sha;
            break;
          case "pjb":
            _val = this.allData.pjb;
            break;
          case "LCB":
            _val = this.allData.LCB;
            break;
          default:
            _val = "";
        }
      }
      _val = Number(_val);
      if (isNaN(_val)) _val = "";
      if (val == "lt")
        this.curtainData[index].dosage = Math.round(_val * 100) / 100;
      else this.curtainData[index].dosage = Math.round(_val * 10) / 10;
    },
    //动态修改大类的全部用量
    updateDosage(itemType, dosage) {
      for (let i = 0; i < this.curtainData.length; i++) {
        let pType = this.curtainData[i].productType;
        if (
          this.curtainData[i].itemType === itemType &&
          pType !== "LCB" &&
          pType !== "XHB"
        ) {
          if (this.curtainData[i].itemNo !== "GY-003") {
            this.curtainData[i].dosage = dosage;
          } else {
            this.curtainData[i].dosage = this.allData.GY;
          }
        }
      }
    },
    //获取备注文字
    getRemark(data) {
      if (data.fixType === "02") {
        let _fixType = data.fixGrade / 1000;
        if (_fixType < this.message.height) {
          return "超高帘，用量待审核!!";
        }
      }
      return "";
    },
    //通过编号获取工艺
    getTheGY(itemNo) {
      let data = {
        itemNO: itemNo,
      };
      this.currentPage = 1;
      getGY(data)
        .then((res) => {
          this.items = res.itemList;
          this.totalNumber = res.itemList.length;
        })
        .catch((err) => {
          this.items = [];
          this.totalNumber = 0;
        });
    },
    //动态判断制造说明
    judgeTip(data, index) {
      let status = -1;
      if (
        data.fixType === "02" &&
        this.allData.itemList[index].fixType === "01"
      ) {
        status = 1;
      }
      if (
        data.fixType === "01" &&
        this.allData.itemList[index].fixType === "02"
      ) {
        status = 2;
      }
      if (data.itemNo !== this.allData.itemList[index].itemNo) {
        if (status === 1) status = 4;
        else if (status === 2) status = 5;
        else status = 3;
      }
      if (
        //data.itemType === "pjb" ||
        data.productType === "LCB" ||
        data.productType == "GY"
      ) {
        status = -1;
      }
      switch (status) {
        case 1:
          this.curtainData[index].tip = "修改为定高";
          break;
        case 2:
          this.curtainData[index].tip = "修改为定宽";
          break;
        case 3:
          this.curtainData[index].tip = "非标配";
          break;
        case 4:
          this.curtainData[index].tip = "修改为定高，非标配";
          break;
        case 5:
          this.curtainData[index].tip = "修改为定宽，非标配";
          break;
        default:
          this.curtainData[index].tip = "";
      }
      //return this.curtainData[index].tip;
    },
    //通过数据动态获取行数数据
    getSpanArr(msg) {
      let data = msg.itemList;
      for (let i = 0; i < data.length; i++) {
        if (i === 0) {
          this.spanArr0.push(data.length);
          this.spanArr1.push(1);
          this.pos = 0;
          this.curtainType.push({
            name: data[i].itemMLGY.itemType,
            value: true,
          });
        } else {
          this.spanArr0.push(0);
          // 判断当前元素与上一个元素是否相同
          if (data[i].itemMLGY.itemType === data[i - 1].itemMLGY.itemType) {
            this.spanArr1[this.pos] += 1;
            this.spanArr1.push(0);
          } else {
            this.spanArr1.push(1);
            this.pos = i;
            this.curtainType.push({
              name: data[i].itemMLGY.itemType,
              value: true,
            });
          }
        }
      }
    },
    //通过数组合并行
    cellMerge({ row, column, rowIndex, columnIndex }) {
      if (columnIndex === 0) {
        let _row = this.spanArr0[rowIndex];
        let _col = _row > 0 ? 1 : 0;
        return {
          rowspan: _row,
          colspan: _col,
        };
      }
      if (columnIndex === 1) {
        let _row = this.spanArr1[rowIndex];
        let _col = _row > 0 ? 1 : 0;
        return {
          rowspan: _row,
          colspan: _col,
        };
      }
      if (columnIndex === 2) {
        if (row.itemType === "pjb" && row.changeFlag === "Y") {
          return {
            rowspan: 1,
            colspan: 2,
          };
        }
      }
      if (columnIndex === 3) {
        if (row.itemType === "pjb" && row.changeFlag === "Y") {
          return {
            rowspan: 1,
            colspan: 0,
          };
        }
      }
    },
    //添加窗帘入购物车
    addCurtainToShoppingCar() {
      //有制造说明的不能为空
      let _curtainData = JSON.parse(JSON.stringify(this.curtainData));
      for (let i = 0; i < _curtainData.length; i++) {
        switch (_curtainData[i].itemType) {
          case "lt":
            if (this.chooseBig[0] === false) {
              _curtainData.splice(i--, 1);
            }
            break;
          case "ls":
            if (this.chooseBig[1] === false) {
              _curtainData.splice(i--, 1);
            }
            break;
          case "lspb":
            if (this.chooseBig[2] === false) {
              _curtainData.splice(i--, 1);
            }
            break;
          case "sha":
            if (this.chooseBig[3] === false) {
              _curtainData.splice(i--, 1);
            }
            break;
        }
      }
      for (let i = 0; i < _curtainData.length; i++) {
        let _itemType = _curtainData[i].itemType;
        if (_itemType === "ls" || _itemType === "sha" || _itemType === "lspb") {
          if (_curtainData[i].productType === "ML") {
            if (_curtainData[i].creator === "" && _curtainData[i].choose) {
              this.$alert("制造说明不能为空", "提示", {
                confirmButtonText: "好的",
                type: "warning",
              });
              return;
            }
          }
        }
        if (
          _itemType === "lt" &&
          _curtainData[i].productType !== "XHB" &&
          _curtainData[i].creator === "" &&
          _curtainData[i].choose
        ) {
          this.$alert("制造说明不能为空", "提示", {
            confirmButtonText: "好的",
            type: "warning",
          });
          return;
        }
        if (
          _curtainData[i].creator === "特殊见备注" ||
          _curtainData[i].creator === "特殊开备注"
        ) {
          if (this.isNull(_curtainData[i].remark)) {
            this.$alert(`${_curtainData[i].creator}不能为空`, "提示", {
              confirmButtonText: "好的",
              type: "warning",
            });
            return;
          }
        }
      }
      let _isWBH;
      let _WBH;
      let _curtainLists = [];
      let _data = [
        { name: "lt", number: 0 },
        { name: "ls", number: 0 },
        { name: "lspb", number: 0 },
        { name: "sha", number: 0 },
        { name: "pjb", number: 0 },
      ];
      if (this.message.isWBH === false) {
        _isWBH = 0;
        _WBH = null;
      } else {
        _isWBH = 1;
        _WBH = this.message.WBH;
      }
      //判断个数
      for (let i = 0; i < _curtainData.length; i++) {
        switch (_curtainData[i].itemType) {
          case "lt":
            _data[0].number++;
            break;
          case "ls":
            _data[1].number++;
            break;
          case "lspb":
            _data[2].number++;
            break;
          case "sha":
            _data[3].number++;
            break;
          case "pjb":
            _data[4].number++;
          default:
            break;
        }
      }
      let _index = [0, 0, 0, 0, 0];
      for (let i = 0; i < _data.length; i++) {
        for (let k = i; k >= 0; k--) {
          _index[i] += _data[k].number;
        }
      }
      for (let i = 0; i < _data.length; i++) {
        if (_data[i].number === 0) continue;
        let _obj = {
          partName: this.getTypeName(_data[i].name),
          curtainCommodities: [],
        };
        let j = 0;
        for (let k = i; k > 0; k--) {
          j += _data[k - 1].number;
        }
        for (; j < _index[i]; j++) {
          if (!_curtainData[j].choose || !_curtainData[j].itemNo) continue;
          let _certainHeightWidth = _curtainData[j].fixType;
          if (_certainHeightWidth === "01") _certainHeightWidth = 1;
          if (_certainHeightWidth === "02") _certainHeightWidth = 0;
          let _obj1 = {
            activityId: this.salPromotion.P_ID,
            item: {
              itemNo: _curtainData[j].itemNo,
            },
            note: _curtainData[j].remark,
            unit: _curtainData[j].unit,
            curtainPartName: this.getTypeName(_data[i].name),
            curtainItemName:
              _curtainData[j].note === null
                ? this.getTypeName(_data[i].name)
                : _curtainData[j].note,
            dosage: _curtainData[j].dosage,
            manufacturingInstructions: _curtainData[j].creator,
            certainHeightWidth: _certainHeightWidth,
            specification:
              _curtainData[j].fixGrade === null
                ? null
                : Math.round((_curtainData[j].fixGrade / 1000) * 100) / 100,
            illustrate: _curtainData[j].tip,
            deleteFlag: _curtainData[j].deleteFlag,
            modifyFlag: _curtainData[j].modifyFlag,
            changeFlag: _curtainData[j].changeFlag,
            inlineNo: _curtainData[j].inlineNo,
          };
          _obj.curtainCommodities.push(_obj1);
        }
        if (_obj.curtainCommodities.length !== 0) _curtainLists.push(_obj);
      }
      if (
        _curtainLists.length === 0 ||
        (_curtainLists.length === 1 &&
          _curtainLists[0].partName === "配件" &&
          _curtainLists[0].curtainCommodities.length === 0)
      ) {
        this.$alert("请至少选择一款配件!", "提示", {
          confirmButtonText: "好的",
          type: "warning",
        });
        return;
      }
      let obj = {
        modelNumber: this.message.itemNo,
        CID: this.cid,
        customerType: this.customerType,
        price: "",
        activityGroupType: this.salPromotion.GROUP_TYPE,
        width: this.message.width,
        height: this.message.height,
        drape: this.message.multiple,
        outsourcingBoxWidth: _isWBH,
        outsourcingBoxWidth: _WBH,
        curtainLists: _curtainLists,
        location: this.message.location,
        falseShadeHigh: this.message.highJia,
      };
      addCurtainToCar(obj)
        .then((res) => {
          this.closeToTab({
            oldUrl: "shops/shoppingCurtainDetail",
            newUrl: "shoppingCar/shopping?curtain",
          });
          this.$router.push({
            path: "/shoppingCar/shopping?curtain",
          });
        })
        .catch((err) => {
          this.$alert(err.msg, "提示", {
            confirmButtonText: "好的",
            type: "warning",
          });
        });
    },
    //判空
    isNull(str) {
      if (str === "" || str === undefined || str === null) return true;
      var regu = "^[ ]+$";
      var re = new RegExp(regu);
      return re.test(str);
    },
    //大类二类的勾选联动，是否出现×号
    bigToSmall: function (data) {
      let index = -1;
      switch (data.itemType) {
        case "lt":
          index = 0;
          break;
        case "ls":
          index = 1;
          break;
        case "lspb":
          index = 2;
          break;
        case "sha":
          index = 3;
          break;
        case "pjb":
          index = 4;
        default:
          index = -1;
      }
      if (index >= 0 && index <= 4) {
        if (this.chooseBig[index] === false || !data.choose) {
          return true;
        }
      }
      return false;
    },
    oneTotal(row) {
      var price = this.dosageFilter(this.calculatePromotionPrice(row));
      if (row.dosage == undefined) row.dosage = 0;
      return price.mul(row.dosage);
    },
    calculatePromotionPrice(data) {
      var price = 0;
      //首先判断TYPE,1折扣，2定价
      if (this.salPromotion && this.salPromotion.P_ID) {
        switch (this.salPromotion.TYPE) {
          case "1":
            //折扣
            price = data.price.mul(this.salPromotion.DISCOUNT);
            break;
          case "2":
            //定价
            price = this.salPromotion.PRICE;
        }
      } else {
        price = data.price;
      }
      return this.dosageFilter(price);
    },
  },
  computed: {
    salPromotion() {
      var selectActivity = this.activityOptions.filter(
        (item) => item.P_ID == this.message.activityId
      );
      if (selectActivity.length) {
        return selectActivity[0];
      } else {
        return {};
      }
    },
    allTotal() {
      //找到勾选的
      let _curtainData = JSON.parse(JSON.stringify(this.curtainData));
      for (let i = 0; i < _curtainData.length; i++) {
        switch (_curtainData[i].itemType) {
          case "lt":
            if (this.chooseBig[0] === false) {
              _curtainData.splice(i--, 1);
            }
            break;
          case "ls":
            if (this.chooseBig[1] === false) {
              _curtainData.splice(i--, 1);
            }
            break;
          case "lspb":
            if (this.chooseBig[2] === false) {
              _curtainData.splice(i--, 1);
            }
            break;
          case "sha":
            if (this.chooseBig[3] === false) {
              _curtainData.splice(i--, 1);
            }
            break;
        }
      }
      let totalMoney = 0;
      for (let i = 0; i < _curtainData.length; i++) {
        if (_curtainData[i].choose != false) {
          totalMoney = totalMoney.add(this.oneTotal(_curtainData[i]));
        }
      }
      return totalMoney;
    },
  },
};
</script>

<style scoped>
/* .el-table__body tr:hover>td{background-color: initial!important;}
.el-table__body tr .current-row>td{background-color: initial!important;} */
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
#shoppingMsg > p {
  margin: 20px auto;
}
.messageBox > div {
  padding: 8px 0;
}
.messageInput {
  border: 1px solid #c3c3c3;
  margin-right: 3px;
  padding: 0 2px;
  min-width: 40px;
  border-radius: 4px;
  color: gray;
  display: inline-block;
  line-height: 20px;
}
</style>
<style>
.curtainTable .el-table td,
.curtainTable .el-table th {
  padding: 0 !important;
}
.curtainTable .el-table .cell {
  padding: 0 5px !important;
}
.curtainTable .el-input__inner {
  padding: 0 5px;
  height: 24px;
}
.curtainTable .el-input__icon {
  line-height: 24px;
}
.curtainTable .el-textarea__inner {
  padding: 5px;
}
.curtainTable .el-checkbox__label {
  padding-left: 2px;
}
</style>